import jwt from 'jsonwebtoken';
import { getStore } from '../config/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'skillmate_jwt_secret_hackathon_key_2026';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const store = getStore();
    const user = store.users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User belonging to this token no longer exists.' });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'student',
      college: user.college,
      department: user.department
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden. Admin privileges required.' });
};

export default {
  authMiddleware,
  requireAdmin
};
