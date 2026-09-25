import express from 'express';
import { getStore, saveStore } from '../config/store.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendEmail, emailTemplates } from '../services/emailService.js';

const router = express.Router();

// List practice tasks (assigned to me or created by me)
router.get('/', authMiddleware, (req, res) => {
  const store = getStore();
  const assignedToMe = store.practiceTasks.filter(pt => pt.assignedToId === req.user.id);
  const createdByMe = store.practiceTasks.filter(pt => pt.creatorId === req.user.id);

  res.json({
    assignedToMe,
    createdByMe
  });
});

// Create peer practice challenge
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { assignedToId, skill, title, description, difficulty = 'Medium', timeMinutes = 20, questions = [] } = req.body;
    const store = getStore();

    if (!assignedToId || !title) {
      return res.status(400).json({ message: 'Assigned student ID and title are required.' });
    }

    const assignedUser = store.users.find(u => u.id === assignedToId);
    if (!assignedUser) return res.status(404).json({ message: 'Target student not found.' });

    const newTask = {
      id: 'pt_' + Date.now(),
      creatorId: req.user.id,
      creatorName: req.user.name,
      assignedToId,
      assignedToName: assignedUser.name,
      skill: skill || 'Programming',
      title,
      description: description || 'Peer practice challenge to strengthen your fundamentals.',
      difficulty,
      timeMinutes: parseInt(timeMinutes) || 20,
      questions: questions.length > 0 ? questions : [
        {
          id: 'q1',
          question: 'Explain the core concept or write a function solving the challenge.',
          type: 'text',
          sampleAnswer: 'Detailed implementation and design rationale.'
        }
      ],
      status: 'assigned',
      createdAt: new Date().toISOString()
    };

    store.practiceTasks.push(newTask);

    // Notification for assigned student
    store.notifications.push({
      id: 'notif_' + Date.now(),
      userId: assignedToId,
      title: '📝 New Practice Assigned',
      message: `${req.user.name} sent you a practice challenge: "${title}".`,
      type: 'practice_assigned',
      read: false,
      actionLink: '/practice',
      createdAt: new Date().toISOString()
    });

    saveStore();

    // Trigger Email notification to assigned student
    if (assignedUser.email) {
      try {
        const template = emailTemplates.assignmentAssigned(
          req.user.name,
          newTask.title,
          newTask.skill,
          newTask.difficulty,
          newTask.timeMinutes
        );
        await sendEmail({
          to: assignedUser.email,
          subject: template.subject,
          html: template.html,
          category: template.category
        });
      } catch (mailErr) {
        console.warn('[Assignment Email Warning]:', mailErr.message);
      }
    }

    res.status(201).json({ message: 'Practice challenge assigned successfully!', task: newTask });
  } catch (err) {
    res.status(500).json({ message: 'Error assigning practice task', error: err.message });
  }
});

// Submit answers to practice task
router.post('/:id/submit', authMiddleware, async (req, res) => {
  try {
    const { answers = {} } = req.body;
    const store = getStore();

    const task = store.practiceTasks.find(pt => pt.id === req.params.id);
    if (!task) return res.status(404).json({ message: 'Practice task not found.' });

    if (task.assignedToId !== req.user.id) {
      return res.status(403).json({ message: 'Only the assigned student can submit.' });
    }

    task.status = 'submitted';
    task.submission = {
      answers,
      submittedAt: new Date().toISOString()
    };

    // Award +5 Skill credits to learner for completing peer challenge
    const user = store.users.find(u => u.id === req.user.id);
    if (user) {
      user.skillCredits = (user.skillCredits || 100) + 5;
      store.credits.push({
        id: 'tx_' + Date.now(),
        userId: user.id,
        amount: 5,
        type: 'peer_session',
        description: `🎯 Submitted Peer Practice: ${task.title}`,
        balanceAfter: user.skillCredits,
        createdAt: new Date().toISOString()
      });
    }

    // Notify creator that answers were submitted
    store.notifications.push({
      id: 'notif_' + Date.now(),
      userId: task.creatorId,
      title: '✅ Practice Submitted',
      message: `${req.user.name} submitted their answers for "${task.title}".`,
      type: 'practice_completed',
      read: false,
      actionLink: '/practice',
      createdAt: new Date().toISOString()
    });

    saveStore();

    // Trigger Email notification to creator
    const creator = store.users.find(u => u.id === task.creatorId);
    if (creator?.email) {
      try {
        const template = emailTemplates.assignmentSubmitted(req.user.name, task.title);
        await sendEmail({
          to: creator.email,
          subject: template.subject,
          html: template.html,
          category: template.category
        });
      } catch (mailErr) {
        console.warn('[Assignment Submit Email Warning]:', mailErr.message);
      }
    }

    res.json({ message: 'Practice task submitted successfully! +5 Skill Credits earned.', task });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting practice task', error: err.message });
  }
});

// Review and grade practice task (by creator/mentor)
router.post('/:id/review', authMiddleware, (req, res) => {
  try {
    const { score = 5, totalQuestions = 5, feedback = 'Great attempt!' } = req.body;
    const store = getStore();

    const task = store.practiceTasks.find(pt => pt.id === req.params.id);
    if (!task) return res.status(404).json({ message: 'Practice task not found.' });

    if (task.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Only the challenge creator can review.' });
    }

    task.status = 'reviewed';
    if (!task.submission) task.submission = {};
    task.submission.score = score;
    task.submission.totalQuestions = totalQuestions;
    task.submission.feedback = feedback;
    task.submission.reviewedAt = new Date().toISOString();

    // Award reviewer +10 Skill Credits
    const mentor = store.users.find(u => u.id === req.user.id);
    if (mentor) {
      mentor.skillCredits = (mentor.skillCredits || 100) + 10;
      store.credits.push({
        id: 'tx_' + Date.now(),
        userId: mentor.id,
        amount: 10,
        type: 'practice_review',
        description: `⭐ Reviewed Peer Challenge: ${task.title}`,
        balanceAfter: mentor.skillCredits,
        createdAt: new Date().toISOString()
      });
    }

    // Notify student of feedback
    store.notifications.push({
      id: 'notif_' + Date.now(),
      userId: task.assignedToId,
      title: '🌟 Practice Reviewed',
      message: `${req.user.name} reviewed your submission for "${task.title}": Score ${score}/${totalQuestions}.`,
      type: 'practice_completed',
      read: false,
      actionLink: '/practice',
      createdAt: new Date().toISOString()
    });

    saveStore();

    res.json({ message: 'Feedback submitted and +10 Skill Credits awarded!', task });
  } catch (err) {
    res.status(500).json({ message: 'Error reviewing practice task', error: err.message });
  }
});

export default router;
