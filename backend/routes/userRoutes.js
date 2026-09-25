import express from 'express';
import { getStore, saveStore } from '../config/store.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get My Profile
router.get('/me', authMiddleware, (req, res) => {
  const store = getStore();
  const user = store.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { password: _, ...userSafe } = user;
  res.json({ user: userSafe });
});

// Update Profile
router.put('/me', authMiddleware, (req, res) => {
  try {
    const store = getStore();
    const index = store.users.findIndex(u => u.id === req.user.id);
    if (index === -1) return res.status(404).json({ message: 'User not found' });

    const allowed = [
      'name', 'college', 'department', 'year', 'bio', 'languages',
      'location', 'availability', 'learningMode', 'skillsToTeach', 'skillsToLearn', 'avatar'
    ];

    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        store.users[index][field] = req.body[field];
      }
    });

    saveStore();
    const { password: _, ...userSafe } = store.users[index];
    res.json({ message: 'Profile updated successfully', user: userSafe });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Public profile by ID
router.get('/:id', (req, res) => {
  const store = getStore();
  const user = store.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { password: _, ...userSafe } = user;
  
  // Calculate completed sessions and ratings
  const userRatings = store.ratings.filter(r => r.targetUserId === user.id);
  const teachingSessions = store.sessions.filter(s => s.mentorId === user.id && s.status === 'completed');
  const learningSessions = store.sessions.filter(s => s.learnerId === user.id && s.status === 'completed');

  res.json({
    user: userSafe,
    ratings: userRatings,
    stats: {
      teachingSessionsCount: teachingSessions.length,
      learningSessionsCount: learningSessions.length,
      averageRating: user.averageRating || 5.0,
      reviewsCount: userRatings.length
    }
  });
});

// Search & Filter Users
router.get('/', (req, res) => {
  const store = getStore();
  const { skill, college, department, year, language, learningMode } = req.query;

  let filtered = store.users.filter(u => u.role !== 'admin');

  if (skill) {
    const sLower = skill.toLowerCase();
    filtered = filtered.filter(u => 
      (u.skillsToTeach || []).some(s => (s.skill || s).toLowerCase().includes(sLower)) ||
      (u.skillsToLearn || []).some(s => (s.skill || s).toLowerCase().includes(sLower))
    );
  }

  if (college) {
    filtered = filtered.filter(u => u.college && u.college.toLowerCase().includes(college.toLowerCase()));
  }

  if (department) {
    filtered = filtered.filter(u => u.department && u.department.toLowerCase().includes(department.toLowerCase()));
  }

  if (year) {
    filtered = filtered.filter(u => u.year === year);
  }

  if (language) {
    filtered = filtered.filter(u => (u.languages || []).some(l => l.toLowerCase() === language.toLowerCase()));
  }

  if (learningMode) {
    filtered = filtered.filter(u => u.learningMode === learningMode);
  }

  const safeUsers = filtered.map(({ password: _, ...userSafe }) => userSafe);
  res.json({ users: safeUsers });
});

export default router;
