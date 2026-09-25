import express from 'express';
import { getStore, saveStore } from '../config/store.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get Coding Challenges for a Level
router.get('/:levelId', authMiddleware, (req, res) => {
  const store = getStore();
  let foundLevel = null;
  for (const r of store.roadmaps) {
    const lvl = r.levels.find(l => l.id === req.params.levelId);
    if (lvl) {
      foundLevel = lvl;
      break;
    }
  }

  if (!foundLevel) return res.status(404).json({ message: 'Level not found' });

  res.json({
    levelId: foundLevel.id,
    levelTitle: foundLevel.title,
    challenges: foundLevel.codingChallenges || [],
    miniChallenge: foundLevel.miniChallenge || null
  });
});

// Submit Code Challenge with Safe Predefined Evaluation
router.post('/:challengeId/submit', authMiddleware, (req, res) => {
  const { code = '', levelId } = req.body;
  const store = getStore();

  let targetChallenge = null;
  let parentLevel = null;

  for (const r of store.roadmaps) {
    for (const lvl of r.levels) {
      const ch = (lvl.codingChallenges || []).find(c => c.id === req.params.challengeId);
      if (ch) {
        targetChallenge = ch;
        parentLevel = lvl;
        break;
      }
    }
    if (targetChallenge) break;
  }

  if (!targetChallenge) {
    return res.status(404).json({ message: 'Challenge not found' });
  }

  const testCases = targetChallenge.testCases || [];
  let passedCases = 0;
  const normalizedCode = code.replace(/\s+/g, ' ').toLowerCase();

  const testResults = testCases.map((tc, idx) => {
    const expectedNormalized = tc.expected.toLowerCase();
    const passed = normalizedCode.includes(expectedNormalized);
    if (passed) passedCases++;

    return {
      testCaseNumber: idx + 1,
      name: tc.input || `Test Case ${idx + 1}`,
      expected: tc.expected,
      passed,
      message: passed ? 'Passed ✓' : `Expected output pattern "${tc.expected}" not detected in solution`
    };
  });

  const totalCases = testCases.length;
  const allPassed = totalCases === 0 || passedCases === totalCases;

  // If passed, update user progress
  if (allPassed) {
    const activeLevelId = levelId || parentLevel.id;
    let progress = store.userProgress.find(p => p.userId === req.user.id);
    if (progress && progress.levelProgress[activeLevelId]) {
      progress.levelProgress[activeLevelId].practiceDone = true;
      saveStore();
    }
  }

  res.json({
    challengeId: targetChallenge.id,
    challengeTitle: targetChallenge.title,
    totalCases,
    passedCases,
    allPassed,
    testResults,
    hints: targetChallenge.hints || [],
    message: allPassed 
      ? '🎉 Excellent work! All test cases passed successfully.'
      : `Test cases passed: ${passedCases} / ${totalCases}. Check hints to refine your solution.`
  });
});

// Mark Mini Challenge Complete
router.post('/mini-challenge/complete', authMiddleware, (req, res) => {
  const { levelId, submissionNote = '' } = req.body;
  const store = getStore();

  let progress = store.userProgress.find(p => p.userId === req.user.id);
  if (!progress || !progress.levelProgress[levelId]) {
    return res.status(404).json({ message: 'Level progress not found' });
  }

  progress.levelProgress[levelId].challengeDone = true;
  progress.levelProgress[levelId].challengeSubmission = submissionNote;
  saveStore();

  res.json({
    message: '🎉 Mini Challenge marked as completed! You are now eligible to complete this level.',
    challengeDone: true
  });
});

export default router;
