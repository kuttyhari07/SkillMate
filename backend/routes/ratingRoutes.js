import express from 'express';
import { getStore, saveStore } from '../config/store.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, (req, res) => {
  try {
    const { sessionId, targetUserId, teachingRating, communicationRating, knowledgeRating, reliabilityRating, feedback } = req.body;
    const store = getStore();

    if (!targetUserId || !teachingRating) {
      return res.status(400).json({ message: 'Target user ID and ratings are required.' });
    }

    const reviewer = store.users.find(u => u.id === req.user.id);
    const target = store.users.find(u => u.id === targetUserId);
    if (!target) return res.status(404).json({ message: 'Target user not found' });

    const newRating = {
      id: 'rat_' + Date.now(),
      sessionId: sessionId || 'direct',
      reviewerId: req.user.id,
      reviewerName: reviewer ? reviewer.name : req.user.name,
      targetUserId,
      teachingRating: Number(teachingRating) || 5,
      communicationRating: Number(communicationRating) || 5,
      knowledgeRating: Number(knowledgeRating) || 5,
      reliabilityRating: Number(reliabilityRating) || 5,
      feedback: feedback || 'Great peer session!',
      createdAt: new Date().toISOString()
    };

    store.ratings.push(newRating);

    // Calculate new average rating for target user
    const allUserRatings = store.ratings.filter(r => r.targetUserId === targetUserId);
    const sum = allUserRatings.reduce((acc, curr) => {
      const avgCategory = (curr.teachingRating + curr.communicationRating + curr.knowledgeRating + curr.reliabilityRating) / 4;
      return acc + avgCategory;
    }, 0);

    target.averageRating = Number((sum / allUserRatings.length).toFixed(1));
    target.reviewsCount = allUserRatings.length;

    // Notification to rated user
    store.notifications.push({
      id: 'notif_' + Date.now(),
      userId: targetUserId,
      title: '⭐ New Rating & Review',
      message: `${req.user.name} gave you a ${target.averageRating}★ rating and feedback!`,
      type: 'rating_received',
      read: false,
      actionLink: `/profile/${targetUserId}`,
      createdAt: new Date().toISOString()
    });

    saveStore();

    res.status(201).json({ message: 'Review submitted successfully!', rating: newRating });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting rating', error: err.message });
  }
});

router.get('/:userId', (req, res) => {
  const store = getStore();
  const userRatings = store.ratings.filter(r => r.targetUserId === req.params.userId);
  res.json({ ratings: userRatings });
});

export default router;
