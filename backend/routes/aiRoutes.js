import express from 'express';
import { getStore } from '../config/store.js';
import { authMiddleware } from '../middleware/auth.js';
import { chatWithAI, getPersonalizedRecommendation, generateSessionPlan } from '../services/aiService.js';

const router = express.Router();

// Floating AI Chat Assistant
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    const store = getStore();

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    // Auto-enrich context with user's current progress if not provided
    if (!context.skill || !context.level) {
      const progress = store.userProgress.find(p => p.userId === req.user.id);
      if (progress) {
        context.skill = progress.goalTitle || 'Full Stack Development';
        context.level = `Level ${progress.currentLevelNumber || 1}`;
      }
    }

    const aiResponse = await chatWithAI({ message, context });
    res.json(aiResponse);
  } catch (err) {
    res.status(500).json({ message: 'Error in AI chat', error: err.message });
  }
});

// Personalized AI Dashboard Recommendations
router.post('/recommend', authMiddleware, (req, res) => {
  try {
    const store = getStore();
    const user = store.users.find(u => u.id === req.user.id);
    const progress = store.userProgress.find(p => p.userId === req.user.id);

    // Extract recent MCQ scores
    const recentScores = [];
    if (progress && progress.levelProgress) {
      Object.values(progress.levelProgress).forEach(lp => {
        if (lp.mcqScore) recentScores.push(lp.mcqScore);
      });
    }

    const recommendation = getPersonalizedRecommendation({
      user,
      progress,
      recentScores
    });

    res.json({ recommendation });
  } catch (err) {
    res.status(500).json({ message: 'Error generating recommendations', error: err.message });
  }
});

// Session Agenda Planner
router.post('/plan-session', authMiddleware, async (req, res) => {
  try {
    const { skill, topic, durationMinutes } = req.body;
    const agenda = await generateSessionPlan({
      skill: skill || 'Programming',
      topic: topic || 'Core Fundamentals',
      durationMinutes: durationMinutes || 60
    });
    res.json({ agenda });
  } catch (err) {
    res.status(500).json({ message: 'Error planning session agenda', error: err.message });
  }
});

export default router;
