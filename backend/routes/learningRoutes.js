import express from 'express';
import { getStore, saveStore } from '../config/store.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendEmail, emailTemplates } from '../services/emailService.js';

const router = express.Router();

// List available learning goals / roadmaps
router.get('/goals', (req, res) => {
  const store = getStore();
  const goals = store.roadmaps.map(r => ({
    id: r.id,
    goalTitle: r.goalTitle,
    category: r.category,
    totalLevels: r.totalLevels || r.levels.length,
    description: r.description
  }));
  res.json({ goals });
});

// Select / Create a Learning Goal for User
router.post('/goals', authMiddleware, (req, res) => {
  try {
    const { goalId, startingLevel = 'Beginner' } = req.body;
    const store = getStore();
    const roadmap = store.roadmaps.find(r => r.id === goalId || r.goalTitle.toLowerCase() === (goalId || '').toLowerCase());
    
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found for the selected goal.' });
    }

    let progress = store.userProgress.find(p => p.userId === req.user.id && p.goalId === roadmap.id);

    if (!progress) {
      const levelProgress = {};
      roadmap.levels.forEach((lvl, idx) => {
        levelProgress[lvl.id] = {
          status: idx === 0 ? 'in_progress' : 'locked',
          topicsViewed: [],
          mcqScore: 0,
          mcqAttempts: 0,
          practiceDone: false,
          challengeDone: false
        };
      });

      progress = {
        userId: req.user.id,
        goalId: roadmap.id,
        goalTitle: roadmap.goalTitle,
        currentLevelId: roadmap.levels[0].id,
        currentLevelNumber: 1,
        overallProgress: 0,
        completedLevels: [],
        levelProgress,
        createdAt: new Date().toISOString()
      };

      store.userProgress.push(progress);

      // Notification
      store.notifications.push({
        id: 'notif_' + Date.now(),
        userId: req.user.id,
        title: '🎯 Learning Goal Created!',
        message: `Your learning path for "${roadmap.goalTitle}" has been generated. Level 1 is unlocked!`,
        type: 'level_unlocked',
        read: false,
        actionLink: `/roadmap/${roadmap.id}`,
        createdAt: new Date().toISOString()
      });

      saveStore();
    }

    res.json({ message: 'Learning goal activated!', progress, roadmap });
  } catch (err) {
    res.status(500).json({ message: 'Error setting learning goal', error: err.message });
  }
});

// Get User's Active Roadmap with Level Statuses
router.get('/roadmap/:goalId', authMiddleware, (req, res) => {
  const store = getStore();
  const roadmap = store.roadmaps.find(r => r.id === req.params.goalId || r.goalTitle.toLowerCase() === req.params.goalId.toLowerCase());
  if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });

  let progress = store.userProgress.find(p => p.userId === req.user.id && p.goalId === roadmap.id);
  
  // If user hasn't enrolled yet, provide default level statuses (level 1 in_progress, rest locked)
  if (!progress) {
    const levelProgress = {};
    roadmap.levels.forEach((lvl, idx) => {
      levelProgress[lvl.id] = {
        status: idx === 0 ? 'in_progress' : 'locked',
        topicsViewed: [],
        mcqScore: 0,
        practiceDone: false,
        challengeDone: false
      };
    });
    progress = {
      userId: req.user.id,
      goalId: roadmap.id,
      goalTitle: roadmap.goalTitle,
      currentLevelId: roadmap.levels[0].id,
      currentLevelNumber: 1,
      overallProgress: 0,
      completedLevels: [],
      levelProgress
    };
  }

  // Merge status into each level
  const levelsWithStatus = roadmap.levels.map(lvl => {
    const lvlProg = progress.levelProgress[lvl.id] || { status: 'locked' };
    return {
      id: lvl.id,
      levelNumber: lvl.levelNumber,
      title: lvl.title,
      shortName: lvl.shortName,
      description: lvl.description,
      status: lvlProg.status,
      mcqScore: lvlProg.mcqScore || 0,
      practiceDone: lvlProg.practiceDone || false,
      challengeDone: lvlProg.challengeDone || false,
      topicsCount: (lvl.topics || []).length,
      topicsViewedCount: (lvlProg.topicsViewed || []).length
    };
  });

  res.json({
    roadmap: {
      id: roadmap.id,
      goalTitle: roadmap.goalTitle,
      category: roadmap.category,
      description: roadmap.description,
      totalLevels: roadmap.levels.length
    },
    progress: {
      overallProgress: progress.overallProgress || 0,
      currentLevelId: progress.currentLevelId,
      currentLevelNumber: progress.currentLevelNumber,
      completedCount: (progress.completedLevels || []).length
    },
    levels: levelsWithStatus
  });
});

// Get Detailed Level Content
router.get('/level/:levelId', authMiddleware, (req, res) => {
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

  // Find user progress
  let progress = store.userProgress.find(p => p.userId === req.user.id && p.goalId === parentRoadmap.id);
  const userLevelState = progress?.levelProgress?.[foundLevel.id] || {
    status: foundLevel.levelNumber === 1 ? 'in_progress' : 'locked',
    topicsViewed: [],
    mcqScore: 0,
    practiceDone: false,
    challengeDone: false
  };

  res.json({
    level: foundLevel,
    parentRoadmap: {
      id: parentRoadmap.id,
      goalTitle: parentRoadmap.goalTitle
    },
    userProgress: userLevelState
  });
});

// Mark Topic Viewed
router.post('/level/:levelId/topic-viewed', authMiddleware, (req, res) => {
  const { topicId } = req.body;
  const store = getStore();

  let progress = store.userProgress.find(p => p.userId === req.user.id);
  if (!progress) return res.status(404).json({ message: 'User progress not found' });

  if (!progress.levelProgress[req.params.levelId]) {
    progress.levelProgress[req.params.levelId] = {
      status: 'in_progress',
      topicsViewed: [],
      mcqScore: 0,
      practiceDone: false,
      challengeDone: false
    };
  }

  const lvlProg = progress.levelProgress[req.params.levelId];
  if (!lvlProg.topicsViewed.includes(topicId)) {
    lvlProg.topicsViewed.push(topicId);
  }

  saveStore();
  res.json({ message: 'Topic marked viewed', topicsViewed: lvlProg.topicsViewed });
});

// Complete Level & Unlock Next Level
router.post('/level/:levelId/complete', authMiddleware, (req, res) => {
  const store = getStore();
  const { levelId } = req.params;

  let foundLevel = null;
  let parentRoadmap = null;
  for (const r of store.roadmaps) {
    const lvl = r.levels.find(l => l.id === levelId);
    if (lvl) {
      foundLevel = lvl;
      parentRoadmap = r;
      break;
    }
  }

  if (!foundLevel) return res.status(404).json({ message: 'Level not found' });

  let progress = store.userProgress.find(p => p.userId === req.user.id && p.goalId === parentRoadmap.id);
  if (!progress) return res.status(400).json({ message: 'Progress not found for this goal' });

  const lvlProg = progress.levelProgress[levelId] || {};

  // Verify requirements
  // Requirement 1: MCQ >= 70% (or if no MCQs, auto pass)
  const hasMcqs = (foundLevel.mcqs || []).length > 0;
  if (hasMcqs && (lvlProg.mcqScore || 0) < 70) {
    return res.status(400).json({
      message: `MCQ score must be at least 70% to complete this level. Your score: ${lvlProg.mcqScore || 0}%`,
      requirementsMet: false
    });
  }

  // Mark this level completed
  lvlProg.status = 'completed';
  lvlProg.completedAt = new Date().toISOString();
  if (!progress.completedLevels.includes(levelId)) {
    progress.completedLevels.push(levelId);
  }

  // Find next level in roadmap
  const currentIndex = parentRoadmap.levels.findIndex(l => l.id === levelId);
  let nextLevel = null;
  if (currentIndex + 1 < parentRoadmap.levels.length) {
    nextLevel = parentRoadmap.levels[currentIndex + 1];
    if (!progress.levelProgress[nextLevel.id]) {
      progress.levelProgress[nextLevel.id] = {
        status: 'in_progress',
        topicsViewed: [],
        mcqScore: 0,
        practiceDone: false,
        challengeDone: false
      };
    } else {
      progress.levelProgress[nextLevel.id].status = 'in_progress';
    }
    progress.currentLevelId = nextLevel.id;
    progress.currentLevelNumber = nextLevel.levelNumber;
  }

  // Recalculate overall progress
  const totalLevels = parentRoadmap.levels.length;
  progress.overallProgress = Math.round((progress.completedLevels.length / totalLevels) * 100);

  // Award +20 Skill Credits
  const user = store.users.find(u => u.id === req.user.id);
  if (user) {
    user.skillCredits = (user.skillCredits || 100) + 20;
    user.learningHours = (user.learningHours || 0) + 2;

    store.credits.push({
      id: 'tx_' + Date.now(),
      userId: user.id,
      amount: 20,
      type: 'level_completion',
      description: `🎉 Completed ${foundLevel.title}`,
      balanceAfter: user.skillCredits,
      createdAt: new Date().toISOString()
    });
  }

  // Create In-App Notification
  store.notifications.push({
    id: 'notif_' + Date.now(),
    userId: req.user.id,
    title: '🎉 Level Completed!',
    message: `You completed ${foundLevel.title}! +20 Skill Credits earned. ${nextLevel ? `${nextLevel.shortName || nextLevel.title} is now unlocked.` : 'All levels finished!'}`,
    type: 'level_unlocked',
    read: false,
    actionLink: nextLevel ? `/level/${nextLevel.id}` : `/roadmap/${parentRoadmap.id}`,
    createdAt: new Date().toISOString()
  });

  saveStore();

  // Send Email
  if (user && nextLevel) {
    try {
      const template = emailTemplates.levelUnlocked(foundLevel.title, nextLevel.title);
      sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        category: template.category
      });
    } catch (e) {
      console.warn('Level email warning:', e.message);
    }
  }

  res.json({
    message: '🎉 Congratulations! Level Completed successfully.',
    completedLevel: foundLevel.title,
    nextLevel: nextLevel ? nextLevel.title : null,
    nextLevelId: nextLevel ? nextLevel.id : null,
    overallProgress: progress.overallProgress,
    creditsEarned: 20
  });
});

export default router;
