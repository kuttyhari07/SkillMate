import express from 'express';
import { getEmailLogs, sendEmail } from '../services/emailService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/logs', authMiddleware, (req, res) => {
  const logs = getEmailLogs();
  res.json({ logs });
});

router.post('/send', authMiddleware, async (req, res) => {
  const { to, subject, html, category } = req.body;
  const result = await sendEmail({
    to: to || req.user.email,
    subject: subject || 'SkillMate Test Notification',
    html: html || '<p>This is a test notification from SkillMate.</p>',
    category: category || 'Test'
  });
  res.json({ message: 'Email processed', result });
});

export default router;
