import express from 'express';
import { getStore, saveStore } from '../config/store.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
  const store = getStore();
  const safeList = (store.assessments || []).map(a => ({
    id: a.id,
    skill: a.skill,
    level: a.level,
    title: a.title,
    description: a.description,
    questionsCount: (a.questions || []).length
  }));
  res.json({ assessments: safeList });
});

router.get('/:id', authMiddleware, (req, res) => {
  const store = getStore();
  const asm = (store.assessments || []).find(a => a.id === req.params.id);
  if (!asm) return res.status(404).json({ message: 'Assessment not found' });

  // Return questions without correct answers
  const safeQuestions = (asm.questions || []).map(q => ({
    id: q.id,
    question: q.question,
    options: q.options,
    topic: q.topic
  }));

  res.json({
    assessment: {
      id: asm.id,
      title: asm.title,
      skill: asm.skill,
      level: asm.level,
      description: asm.description,
      questions: safeQuestions
    }
  });
});

router.post('/:id/submit', authMiddleware, (req, res) => {
  try {
    const { answers = {} } = req.body;
    const store = getStore();
    const asm = (store.assessments || []).find(a => a.id === req.params.id);
    if (!asm) return res.status(404).json({ message: 'Assessment not found' });

    let correctCount = 0;
    const strengths = [];
    const weakTopics = [];

    asm.questions.forEach(q => {
      const selected = answers[q.id];
      if (selected !== undefined && Number(selected) === q.correctIndex) {
        correctCount++;
        if (q.topic && !strengths.includes(q.topic)) strengths.push(q.topic);
      } else {
        if (q.topic && !weakTopics.includes(q.topic)) weakTopics.push(q.topic);
      }
    });

    const total = asm.questions.length;
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    let suggestedStartingPoint = 'Level 1: HTML Basics & Semantic Web';
    if (score >= 80) {
      suggestedStartingPoint = 'Level 3: JavaScript & DOM Manipulation';
    } else if (score >= 60) {
      suggestedStartingPoint = 'Level 2: CSS Styling & Responsive Layouts';
    }

    const result = {
      id: 'res_' + Date.now(),
      userId: req.user.id,
      assessmentId: asm.id,
      assessmentTitle: asm.title,
      score,
      correctCount,
      total,
      strengths,
      weakTopics,
      suggestedStartingPoint,
      createdAt: new Date().toISOString()
    };

    if (!store.assessmentResults) store.assessmentResults = [];
    store.assessmentResults.push(result);

    // Notification
    store.notifications.push({
      id: 'notif_' + Date.now(),
      userId: req.user.id,
      title: '🏆 Assessment Completed!',
      message: `You scored ${score}% on "${asm.title}". Suggested start: ${suggestedStartingPoint}.`,
      type: 'assessment_result',
      read: false,
      actionLink: '/my-learning',
      createdAt: new Date().toISOString()
    });

    saveStore();

    res.json({
      message: `Assessment completed! You scored ${score}%.`,
      result
    });
  } catch (err) {
    res.status(500).json({ message: 'Error evaluating assessment', error: err.message });
  }
});

export default router;
