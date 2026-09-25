import express from 'express';
import { getStore } from '../config/store.js';
import { authMiddleware } from '../middleware/auth.js';
import { findSmartMatches } from '../services/matchingService.js';

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  const store = getStore();
  const currentUser = store.users.find(u => u.id === req.user.id);
  if (!currentUser) return res.status(404).json({ message: 'User not found' });

  const matches = findSmartMatches(currentUser, store.users);
  res.json({
    totalMatches: matches.length,
    matches
  });
});

export default router;
