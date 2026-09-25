import express from 'express';
import { getStore, saveStore } from '../config/store.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get MCQs for a Level
router.get('/:levelId', authMiddleware, (req, res) => {
  const store = getStore();
  let foundLevel = null;
  for (const r of store.roadmaps) {
    const lvl = r.levels.find(l => l.id === req.params.levelId);
    if (lvl) {
      foundLevel = lvl;
      break;
    }
  }

  if (!foundLevel) return res.status(404).json({ message: 'Level not found' });

  // Return questions without correctIndex to prevent front-end inspect cheating
  const safeQuestions = (foundLevel.mcqs || []).map(q => ({
    id: q.id,
    question: q.question,
    options: q.options
  }));

  res.json({
    levelId: foundLevel.id,
    levelTitle: foundLevel.title,
    totalQuestions: safeQuestions.length,
    questions: safeQuestions
  });
});

// Submit MCQ Practice
router.post('/:levelId/submit', authMiddleware, (req, res) => {
  const { answers = {}, timeSpentSeconds = 0 } = req.body;
  const store = getStore();
  let foundLevel = null;
  let parentRoadmap = null;

  for (const r of store.roadmaps) {
    const lvl = r.levels.find(l => l.id === req.params.levelId);
    if (lvl) {
      foundLevel = lvl;
      parentRoadmap = r;
      break;
    }
  }

  if (!foundLevel) return res.status(404).json({ message: 'Level not found' });

  const mcqs = foundLevel.mcqs || [];
  let correctCount = 0;

  const results = mcqs.map(q => {
    const selectedAnswerIndex = answers[q.id];
    const isCorrect = selectedAnswerIndex !== undefined && Number(selectedAnswerIndex) === q.correctIndex;
    if (isCorrect) correctCount++;

    return {
      id: q.id,
      question: q.question,
      options: q.options,
      selectedAnswerIndex,
      correctIndex: q.correctIndex,
      isCorrect,
      explanation: q.explanation
    };
  });

  const totalQuestions = mcqs.length;
  const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
  const passed = scorePercentage >= 70;

  // Update user progress
  let progress = store.userProgress.find(p => p.userId === req.user.id && p.goalId === parentRoadmap.id);
  if (progress && progress.levelProgress[req.params.levelId]) {
    const lvlProg = progress.levelProgress[req.params.levelId];
    lvlProg.mcqScore = Math.max(lvlProg.mcqScore || 0, scorePercentage);
    lvlProg.mcqAttempts = (lvlProg.mcqAttempts || 0) + 1;
    saveStore();
  }

  res.json({
    levelId: req.params.levelId,
    totalQuestions,
    correctCount,
    incorrectCount: totalQuestions - correctCount,
    scorePercentage,
    passed,
    timeSpentSeconds,
    results,
    message: passed 
      ? `🎉 Great job! You scored ${scorePercentage}% (${correctCount}/${totalQuestions}). Requirement met (>= 70%)!`
      : `Keep practicing! You scored ${scorePercentage}% (${correctCount}/${totalQuestions}). Minimum 70% needed to pass.`
  });
});

export default router;
