import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getStore, saveStore } from '../config/store.js';
import { sendEmail, emailTemplates } from '../services/emailService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'skillmate_jwt_secret_hackathon_key_2026';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, college, department, year, location, languages, avatar, bio } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const store = getStore();
    const existing = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ message: 'A user with this email address already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'usr_' + Date.now();

    const newUser = {
      id: userId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      college: college || 'University Tech Institute',
      department: department || 'Computer Science',
      year: year || '1st Year',
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      location: location || 'Remote',
      languages: languages && languages.length > 0 ? languages : ['English'],
      bio: bio || 'Passionate student learning and sharing skills on SkillMate.',
      availability: 'Flexible / Evenings',
      learningMode: 'Peer',
      role: 'student',
      skillsToTeach: [],
      skillsToLearn: [],
      skillCredits: 100, // Welcome bonus
      learningHours: 0,
      teachingHours: 0,
      averageRating: 5.0,
      reviewsCount: 0,
      badges: ['Fast Learner'],
      createdAt: new Date().toISOString()
    };

    store.users.push(newUser);

    // Initial Credit Transaction
    store.credits.push({
      id: 'tx_' + Date.now(),
      userId,
      amount: 100,
      type: 'welcome_bonus',
      description: '🎉 SkillMate Welcome Bonus',
      balanceAfter: 100,
      createdAt: new Date().toISOString()
    });

    // Initial Notification
    store.notifications.push({
      id: 'notif_' + Date.now(),
      userId,
      title: '🎉 Welcome to SkillMate!',
      message: 'Your account is ready and you have received 100 Skill Credits.',
      type: 'registration',
      read: false,
      actionLink: '/dashboard',
      createdAt: new Date().toISOString()
    });

    saveStore();

    // Trigger Welcome Email (SMTP or Dev Preview)
    try {
      const template = emailTemplates.welcome(name);
      await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        category: template.category
      });
    } catch (mailErr) {
      console.warn('Welcome email error:', mailErr.message);
    }

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userSafe } = newUser;
    return res.status(201).json({
      message: 'Account created successfully! 🎉',
      token,
      user: userSafe
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error during registration.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const store = getStore();
    const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userSafe } = user;
    return res.json({
      message: 'Welcome back 👋',
      token,
      user: userSafe
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
});

// Current User Me
router.get('/me', authMiddleware, (req, res) => {
  const store = getStore();
  const user = store.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  const { password: _, ...userSafe } = user;
  return res.json({ user: userSafe });
});

export default router;
