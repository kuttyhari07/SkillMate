import express from 'express';
import { getStore, saveStore } from '../config/store.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  const store = getStore();
  const userNotifs = store.notifications
    .filter(n => n.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const unreadCount = userNotifs.filter(n => !n.read).length;

  res.json({
    notifications: userNotifs,
    unreadCount
  });
});

router.put('/:id/read', authMiddleware, (req, res) => {
  const store = getStore();
  const notif = store.notifications.find(n => n.id === req.params.id && n.userId === req.user.id);
  if (notif) {
    notif.read = true;
    saveStore();
  }
  res.json({ message: 'Marked as read' });
});

router.put('/read-all', authMiddleware, (req, res) => {
  const store = getStore();
  store.notifications.forEach(n => {
    if (n.userId === req.user.id) {
      n.read = true;
    }
  });
  saveStore();
  res.json({ message: 'All notifications marked as read' });
});

export default router;
