import express from 'express';
import { getStore, saveStore } from '../config/store.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendEmail, emailTemplates } from '../services/emailService.js';

const router = express.Router();

// Get conversation messages between logged-in user and another user
router.get('/:partnerId', authMiddleware, (req, res) => {
  const store = getStore();
  const currentUserId = req.user.id;
  const partnerId = req.params.partnerId;

  const conversation = store.messages.filter(
    m => (m.senderId === currentUserId && m.receiverId === partnerId) ||
         (m.senderId === partnerId && m.receiverId === currentUserId)
  );

  // Mark incoming messages as read
  conversation.forEach(m => {
    if (m.receiverId === currentUserId && !m.read) {
      m.read = true;
    }
  });
  saveStore();

  res.json({
    partnerId,
    messages: conversation
  });
});

// Send message via REST endpoint (also supported via WebSocket)
router.post('/', authMiddleware, (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const store = getStore();

    if (!receiverId || !content || !content.trim()) {
      return res.status(400).json({ message: 'Receiver ID and content are required.' });
    }

    const receiver = store.users.find(u => u.id === receiverId);
    if (!receiver) return res.status(404).json({ message: 'Receiver not found' });

    const newMessage = {
      id: 'msg_' + Date.now(),
      senderId: req.user.id,
      receiverId,
      content: content.trim(),
      read: false,
      createdAt: new Date().toISOString()
    };

    store.messages.push(newMessage);

    // Create notification
    store.notifications.push({
      id: 'notif_' + Date.now(),
      userId: receiverId,
      title: '💬 New Message',
      message: `${req.user.name}: "${content.substring(0, 40)}${content.length > 40 ? '...' : ''}"`,
      type: 'dm',
      read: false,
      actionLink: `/messages?partner=${req.user.id}`,
      createdAt: new Date().toISOString()
    });

    saveStore();

    // Trigger email notification to receiver
    if (receiver.email) {
      try {
        const template = emailTemplates.newMessage(req.user.name, content);
        await sendEmail({
          to: receiver.email,
          subject: template.subject,
          html: template.html,
          category: template.category
        });
      } catch (mailErr) {
        console.warn('[Message Email Error]:', mailErr.message);
      }
    }

    res.status(201).json({ message: 'Message sent', data: newMessage });
  } catch (err) {
    res.status(500).json({ message: 'Error sending message', error: err.message });
  }
});

export default router;
