import express from 'express';
import { getStore, saveStore } from '../config/store.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendEmail, emailTemplates } from '../services/emailService.js';
import { calculateMatchScore } from '../services/matchingService.js';

const router = express.Router();

// List user connections
router.get('/', authMiddleware, (req, res) => {
  const store = getStore();
  const myConnections = store.connections.filter(
    c => c.requesterId === req.user.id || c.recipientId === req.user.id
  );

  const populated = myConnections.map(c => {
    const isRequester = c.requesterId === req.user.id;
    const partnerId = isRequester ? c.recipientId : c.requesterId;
    const partner = store.users.find(u => u.id === partnerId);
    
    return {
      ...c,
      isSender: isRequester,
      partner: partner ? {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        college: partner.college,
        department: partner.department,
        year: partner.year,
        avatar: partner.avatar,
        skillsToTeach: partner.skillsToTeach,
        skillsToLearn: partner.skillsToLearn,
        averageRating: partner.averageRating || 5.0
      } : null
    };
  });

  res.json({ connections: populated });
});

// Send Connection Request
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { recipientId, skillOffered, skillRequested } = req.body;
    const store = getStore();

    if (!recipientId) return res.status(400).json({ message: 'Recipient ID is required.' });
    if (recipientId === req.user.id) return res.status(400).json({ message: 'Cannot connect with yourself.' });

    const recipient = store.users.find(u => u.id === recipientId);
    const sender = store.users.find(u => u.id === req.user.id);
    if (!recipient) return res.status(404).json({ message: 'Recipient not found.' });

    // Check if connection already exists
    const existing = store.connections.find(
      c => (c.requesterId === req.user.id && c.recipientId === recipientId) ||
           (c.requesterId === recipientId && c.recipientId === req.user.id)
    );

    if (existing) {
      return res.status(400).json({ message: `Connection already ${existing.status}.` });
    }

    const { score, reasons } = calculateMatchScore(sender, recipient);

    const newConnection = {
      id: 'conn_' + Date.now(),
      requesterId: req.user.id,
      recipientId,
      status: 'pending',
      skillOffered: skillOffered || (sender.skillsToTeach?.[0]?.skill || 'Programming'),
      skillRequested: skillRequested || (recipient.skillsToTeach?.[0]?.skill || 'Development'),
      matchScore: score,
      reasons,
      createdAt: new Date().toISOString()
    };

    store.connections.push(newConnection);

    // Notification for recipient
    store.notifications.push({
      id: 'notif_' + Date.now(),
      userId: recipientId,
      title: '🤝 New Connection Request',
      message: `${sender.name} sent you a SkillMate connection request (${newConnection.skillOffered} ⇄ ${newConnection.skillRequested}).`,
      type: 'connection_request',
      read: false,
      actionLink: '/find-mates',
      createdAt: new Date().toISOString()
    });

    saveStore();

    // Trigger Email
    try {
      const template = emailTemplates.connectionRequest(sender.name, newConnection.skillOffered, newConnection.skillRequested);
      await sendEmail({
        to: recipient.email,
        subject: template.subject,
        html: template.html,
        category: template.category
      });
    } catch (mailErr) {
      console.warn('Connection email error:', mailErr.message);
    }

    res.status(201).json({ message: 'Connection request sent successfully!', connection: newConnection });
  } catch (err) {
    res.status(500).json({ message: 'Error creating connection request', error: err.message });
  }
});

// Accept or Reject Connection
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const store = getStore();

    const connection = store.connections.find(c => c.id === req.params.id);
    if (!connection) return res.status(404).json({ message: 'Connection not found.' });

    if (connection.recipientId !== req.user.id && connection.requesterId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    connection.status = status;
    connection.updatedAt = new Date().toISOString();

    if (status === 'accepted') {
      const requester = store.users.find(u => u.id === connection.requesterId);
      const recipient = store.users.find(u => u.id === connection.recipientId);

      // Notification for requester
      store.notifications.push({
        id: 'notif_' + Date.now(),
        userId: connection.requesterId,
        title: '🎉 Connection Accepted!',
        message: `${recipient.name} accepted your connection request! You are now Skill Mates.`,
        type: 'connection_accepted',
        read: false,
        actionLink: '/messages',
        createdAt: new Date().toISOString()
      });

      // Email to requester
      try {
        const template = emailTemplates.connectionAccepted(recipient.name);
        await sendEmail({
          to: requester.email,
          subject: template.subject,
          html: template.html,
          category: template.category
        });
      } catch (mailErr) {
        console.warn('Accept email warning:', mailErr.message);
      }
    }

    saveStore();
    res.json({ message: `Connection ${status}!`, connection });
  } catch (err) {
    res.status(500).json({ message: 'Error updating connection', error: err.message });
  }
});

export default router;
