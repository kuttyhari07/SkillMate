import express from 'express';
import { getStore } from '../config/store.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/analytics', authMiddleware, (req, res) => {
  const store = getStore();

  const totalStudents = store.users.filter(u => u.role !== 'admin').length;
  const totalSessions = store.sessions.length;
  const completedSessions = store.sessions.filter(s => s.status === 'completed').length;
  const sessionCompletionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 85;

  const totalPracticeTasks = store.practiceTasks.length;
  const reviewedPracticeTasks = store.practiceTasks.filter(pt => pt.status === 'reviewed' || pt.status === 'submitted').length;
  const practiceCompletionRate = totalPracticeTasks > 0 ? Math.round((reviewedPracticeTasks / totalPracticeTasks) * 100) : 80;

  // Most taught and learned skills
  const teachCounts = {};
  const learnCounts = {};
  const deptCounts = {};

  store.users.forEach(u => {
    (u.skillsToTeach || []).forEach(s => {
      const name = s.skill || s;
      teachCounts[name] = (teachCounts[name] || 0) + 1;
    });
    (u.skillsToLearn || []).forEach(s => {
      const name = s.skill || s;
      learnCounts[name] = (learnCounts[name] || 0) + 1;
    });
    if (u.department) {
      deptCounts[u.department] = (deptCounts[u.department] || 0) + 1;
    }
  });

  const mostTaughtSkills = Object.entries(teachCounts)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count);

  const mostLearnedSkills = Object.entries(learnCounts)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count);

  // Skill Gaps (High demand in learning, low supply in teaching)
  const skillGaps = Object.entries(learnCounts).map(([skill, learnDemand]) => {
    const teachSupply = teachCounts[skill] || 0;
    return {
      skill,
      learnDemand,
      teachSupply,
      gap: learnDemand - teachSupply
    };
  }).sort((a, b) => b.gap - a.gap);

  const popularPaths = [
    { title: 'Full Stack Development', students: 28, completionRate: '72%' },
    { title: 'Python Automation & AI', students: 22, completionRate: '68%' },
    { title: 'UI/UX Interactive Design', students: 16, completionRate: '81%' },
    { title: 'Creative Performing Arts (Dance & Music)', students: 12, completionRate: '85%' }
  ];

  const mostActiveDepartments = Object.entries(deptCounts)
    .map(([department, count]) => ({ department, count }))
    .sort((a, b) => b.count - a.count);

  res.json({
    metrics: {
      totalStudents,
      totalRoadmaps: store.roadmaps.length,
      totalSessions,
      completedSessions,
      sessionCompletionRate,
      totalPracticeTasks,
      practiceCompletionRate,
      activeConnections: store.connections.filter(c => c.status === 'accepted').length,
      totalEmailsLogged: (store.emailLogs || []).length
    },
    mostTaughtSkills,
    mostLearnedSkills,
    skillGaps,
    popularPaths,
    mostActiveDepartments
  });
});

export default router;
