import express from 'express';
import { getStore, saveStore } from '../config/store.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendEmail, emailTemplates, getActiveEmailProvider, getEmailLogs } from '../services/emailService.js';

const router = express.Router();

// Get In-App Notifications
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

// Mark one notification as read
router.put('/:id/read', authMiddleware, (req, res) => {
  const store = getStore();
  const notif = store.notifications.find(n => n.id === req.params.id && n.userId === req.user.id);
  if (notif) {
    notif.read = true;
    saveStore();
  }
  res.json({ message: 'Marked as read' });
});

// Mark all notifications as read
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

// Delete individual notification
router.delete('/:id', authMiddleware, (req, res) => {
  const store = getStore();
  const initialLen = store.notifications.length;
  store.notifications = store.notifications.filter(
    n => !(n.id === req.params.id && n.userId === req.user.id)
  );
  if (store.notifications.length !== initialLen) {
    saveStore();
  }
  res.json({ message: 'Notification deleted' });
});

// Clear all notifications for user
router.delete('/clear-all', authMiddleware, (req, res) => {
  const store = getStore();
  store.notifications = store.notifications.filter(n => n.userId !== req.user.id);
  saveStore();
  res.json({ message: 'All notifications cleared' });
});

// Get User's Email Notification Preferences & Channel Status
router.get('/preferences', authMiddleware, (req, res) => {
  const store = getStore();
  const user = store.users.find(u => u.id === req.user.id);
  const activeProvider = getActiveEmailProvider();

  const defaultPreferences = {
    emailOnConnection: true,
    emailOnSession: true,
    emailOnPractice: true,
    emailOnMessage: true,
    emailWeeklyDigest: false
  };

  res.json({
    email: user?.email || '',
    activeProvider,
    preferences: user?.notificationPreferences || defaultPreferences
  });
});

// Update User's Email Notification Preferences
router.put('/preferences', authMiddleware, (req, res) => {
  const store = getStore();
  const user = store.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.notificationPreferences = {
    ...(user.notificationPreferences || {
      emailOnConnection: true,
      emailOnSession: true,
      emailOnPractice: true,
      emailOnMessage: true,
      emailWeeklyDigest: false
    }),
    ...req.body
  };
  saveStore();

  res.json({
    message: 'Notification preferences updated successfully',
    preferences: user.notificationPreferences
  });
});

// Send a Test Notification Email directly to the user
router.post('/send-test-email', authMiddleware, async (req, res) => {
  try {
    const store = getStore();
    const user = store.users.find(u => u.id === req.user.id);
    const targetEmail = (req.body.email || user?.email || '').trim();

    if (!targetEmail) {
      return res.status(400).json({ message: 'Valid recipient email address is required.' });
    }

    const template = emailTemplates.notificationAlert(
      user?.name || 'SkillMate Member',
      'Test Notification Alert',
      'This is an automated test email dispatched from your SkillMate Notifications Center. Your email notification pipeline is verified and ready for real-time exchange invites, session bookings, and practice challenges!',
      '/notifications',
      'Test Notification'
    );

    const emailResult = await sendEmail({
      to: targetEmail,
      subject: template.subject,
      html: template.html,
      category: 'Test Alert'
    });

    // Also push an in-app notification confirming the dispatch
    store.notifications.push({
      id: 'notif_' + Date.now(),
      userId: req.user.id,
      title: '✉️ Test Email Dispatched',
      message: `A test email alert was delivered to ${targetEmail} via ${emailResult.mode || 'Dev Preview'}.`,
      type: 'system',
      read: false,
      actionLink: '/notifications',
      createdAt: new Date().toISOString()
    });
    saveStore();

    res.json({
      success: true,
      message: `Test email sent to ${targetEmail}! Mode: ${emailResult.mode}`,
      mode: emailResult.mode,
      logId: emailResult.id || emailResult.logEntry?.id
    });
  } catch (err) {
    console.error('Test email error:', err);
    res.status(500).json({ message: 'Failed to send test email', error: err.message });
  }
});

export default router;
