import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDbStatus } from './config/db.js';
import { seedDatabase } from './seed/seedData.js';
import { getStore, saveStore } from './config/store.js';
import { sendEmail, emailTemplates } from './services/emailService.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import learningRoutes from './routes/learningRoutes.js';
import mcqRoutes from './routes/mcqRoutes.js';
import codingRoutes from './routes/codingRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import connectionRoutes from './routes/connectionRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import practiceRoutes from './routes/practiceRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import creditRoutes from './routes/creditRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
app.use((req, res, next) => {
  if (!req.url.startsWith('/api/notifications')) {
    console.log(`[${req.method}] ${req.url}`);
  }
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/mcq', mcqRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/assessments', assessmentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'SkillMate',
    tagline: 'Connect Skills. Learn Together.',
    version: '1.0.0',
    dbStatus: getDbStatus(),
    timestamp: new Date().toISOString()
  });
});

// Socket.io Real-Time Direct Messaging
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Register online user
  socket.on('user_online', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('online_users_list', Array.from(onlineUsers.keys()));
  });

  // Join a direct chat conversation room
  socket.on('join_chat', ({ userId, partnerId }) => {
    const room = [userId, partnerId].sort().join('_');
    socket.join(room);
    console.log(`[Socket] User ${userId} joined room ${room}`);
  });

  // Real-time message exchange
  socket.on('send_message', async (data) => {
    const { senderId, receiverId, content } = data;
    const store = getStore();

    const newMessage = {
      id: 'msg_' + Date.now(),
      senderId,
      receiverId,
      content,
      read: false,
      createdAt: new Date().toISOString()
    };

    store.messages.push(newMessage);

    const sender = store.users.find(u => u.id === senderId);
    const receiver = store.users.find(u => u.id === receiverId);

    store.notifications.push({
      id: 'notif_' + Date.now(),
      userId: receiverId,
      title: '💬 New Message',
      message: `${sender?.name || 'SkillMate User'}: "${content.substring(0, 40)}${content.length > 40 ? '...' : ''}"`,
      type: 'dm',
      read: false,
      actionLink: `/messages?partner=${senderId}`,
      createdAt: new Date().toISOString()
    });

    saveStore();

    // Send email notification to recipient
    if (receiver?.email) {
      try {
        const template = emailTemplates.newMessage(sender?.name || 'A SkillMate peer', content);
        await sendEmail({
          to: receiver.email,
          subject: template.subject,
          html: template.html,
          category: template.category
        });
      } catch (mailErr) {
        console.warn('[Socket Message Email Warning]:', mailErr.message);
      }
    }

    // Broadcast to room
    const room = [senderId, receiverId].sort().join('_');
    io.to(room).emit('receive_message', newMessage);

    // If receiver is connected elsewhere, notify them directly
    const recipientSocket = onlineUsers.get(receiverId);
    if (recipientSocket) {
      io.to(recipientSocket).emit('new_incoming_message', newMessage);
    }
  });

  // Typing indicator
  socket.on('typing', ({ senderId, receiverId, isTyping }) => {
    const room = [senderId, receiverId].sort().join('_');
    socket.to(room).emit('partner_typing', { senderId, isTyping });
  });

  socket.on('disconnect', () => {
    for (const [userId, sId] of onlineUsers.entries()) {
      if (sId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('online_users_list', Array.from(onlineUsers.keys()));
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 8000;

// Initialize Server, DB and Seed data
server.listen(PORT, async () => {
  console.log(`========================================================`);
  console.log(`🚀 SkillMate Backend Server Running on http://127.0.0.1:${PORT}`);
  console.log(`   Tagline: "Connect Skills. Learn Together."`);
  console.log(`========================================================`);

  await connectDB();
  await seedDatabase();
});
