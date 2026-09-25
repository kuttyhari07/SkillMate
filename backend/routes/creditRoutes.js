import express from 'express';
import { getStore } from '../config/store.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Current user credit balance
router.get('/', authMiddleware, (req, res) => {
  const store = getStore();
  const user = store.users.find(u => u.id === req.user.id);
  res.json({
    credits: user ? user.skillCredits || 100 : 100
  });
});

// Credit transaction history
router.get('/history', authMiddleware, (req, res) => {
  const store = getStore();
  const userTxs = store.credits
    .filter(c => c.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ transactions: userTxs });
});

// Leaderboard
router.get('/leaderboard', (req, res) => {
  const store = getStore();
  const students = store.users.filter(u => u.role !== 'admin');

  // Top Mentors (by teaching hours / credits)
  const topMentors = [...students]
    .sort((a, b) => (b.teachingHours || 0) - (a.teachingHours || 0))
    .slice(0, 10)
    .map(u => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      college: u.college,
      department: u.department,
      teachingHours: u.teachingHours || 0,
      averageRating: u.averageRating || 5.0,
      badges: u.badges || []
    }));

  // Top Learners (by learning hours / completed roadmaps)
  const topLearners = [...students]
    .sort((a, b) => (b.learningHours || 0) - (a.learningHours || 0))
    .slice(0, 10)
    .map(u => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      college: u.college,
      department: u.department,
      learningHours: u.learningHours || 0,
      skillCredits: u.skillCredits || 100,
      badges: u.badges || []
    }));

  // Highest Rated
  const highestRated = [...students]
    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0) || (b.reviewsCount || 0) - (a.reviewsCount || 0))
    .slice(0, 10)
    .map(u => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      college: u.college,
      averageRating: u.averageRating || 5.0,
      reviewsCount: u.reviewsCount || 0
    }));

  res.json({
    topMentors,
    topLearners,
    highestRated
  });
});

export default router;
