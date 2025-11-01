const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const db = require('./config/database');
const supabaseConfig = require('./config/supabase');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      'https://admin-panel-phi-hazel.vercel.app',  // Admin panel (deployed)
      'https://userpanel-lac.vercel.app',  // User panel (deployed)
      process.env.FRONTEND_URL || 'http://localhost:3000',  // User panel (local)
      process.env.ADMIN_URL || 'http://localhost:3001',  // Admin panel (local)
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5000'
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io available to routes
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user room
  socket.on('join_user', (userId) => {
    socket.join(`user:${userId}`);
    socket.userId = userId;
    console.log(`User ${userId} joined their room`);
  });

  // Join admin room
  socket.on('join_admin', () => {
    socket.join('admin');
    socket.isAdmin = true;
    console.log(`Admin connected: ${socket.id}`);
  });

  // Join all users room (for broadcasting)
  socket.on('join_all', () => {
    socket.join('all_users');
    console.log(`Socket ${socket.id} joined all users room`);
  });

  // Join conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // Join chat room
  socket.on('join_chat_room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined chat room ${roomId}`);
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(data.conversationId || data.roomId).emit('user_typing', {
      userId: data.userId,
      username: data.username,
      isTyping: data.isTyping
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Helper function to broadcast admin updates
function broadcastAdminUpdate(event, data) {
  io.emit('admin_update', { event, data, timestamp: new Date() });
  console.log(`Broadcasting admin update: ${event}`);
}

// Helper function to notify specific user
function notifyUser(userId, event, data) {
  io.to(`user:${userId}`).emit('user_notification', { event, data, timestamp: new Date() });
  console.log(`Notifying user ${userId}: ${event}`);
}

// Make helpers available to routes
app.set('broadcastAdminUpdate', broadcastAdminUpdate);
app.set('notifyUser', notifyUser);

// Middleware
// CORS configuration for Vercel deployments
app.use(cors({
  origin: [
    'https://admin-panel-phi-hazel.vercel.app',  // Admin panel (deployed)
    'https://considerate-adventure-production.up.railway.app',  // Railway backend (for direct access)
    process.env.FRONTEND_URL || 'http://localhost:3000',  // User panel (will be added after deployment)
    process.env.ADMIN_URL || 'http://localhost:3001',  // Admin localhost
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import services
const MatrixService = require('./services/MatrixService');
const PaymentService = require('./services/PaymentService');
const EmailService = require('./services/EmailService');
const CronService = require('./services/CronService');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const matrixRoutes = require('./routes/matrix');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/adminRoutes');
const supportRoutes = require('./routes/support');
const pifRoutes = require('./routes/pif');
const videoAdsRoutes = require('./routes/videoAds');
const referralsRoutes = require('./routes/referrals');
const ranksRoutes = require('./routes/ranks');
const messagingRoutes = require('./routes/messaging');
const chatRoutes = require('./routes/chat');
const gamificationRoutes = require('./routes/gamification');
const emailCampaignsRoutes = require('./routes/emailCampaigns');
const socialRoutes = require('./routes/social');
const whiteLabelRoutes = require('./routes/whiteLabel');
const supabaseRoutes = require('./routes/supabase');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matrix', matrixRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/pif', pifRoutes);
app.use('/api/video-ads', videoAdsRoutes);
app.use('/api/referrals', referralsRoutes);
app.use('/api/ranks', ranksRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/email-campaigns', emailCampaignsRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/white-label', whiteLabelRoutes);
app.use('/api/supabase', supabaseRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const USE_PRISMA = process.env.USE_PRISMA === 'true' || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase'));
    if (USE_PRISMA) {
      const { prisma } = require('./config/databaseHybrid');
      const prismaClient = prisma();
      if (prismaClient) {
        await prismaClient.$queryRaw`SELECT 1`;
      }
    } else {
      await db.execute('SELECT 1');
    }
    
    // Get system stats
    const stats = await CronService.getSystemStats();
    
    res.json({
      status: 'healthy',
      timestamp: new Date(),
      database: 'connected',
      services: {
        matrix: 'active',
        payment: 'active',
        email: 'active',
        cron: 'active'
      },
      stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Manual trigger endpoints for testing
app.post('/api/cron/trigger-matrix', async (req, res) => {
  try {
    await CronService.triggerMatrixProcessing();
    res.json({ success: true, message: 'Matrix processing triggered' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/cron/trigger-payments', async (req, res) => {
  try {
    await CronService.triggerPaymentProcessing();
    res.json({ success: true, message: 'Payment processing triggered' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/cron/trigger-withdrawals', async (req, res) => {
  try {
    await CronService.triggerWithdrawalProcessing();
    res.json({ success: true, message: 'Withdrawal processing triggered' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// System status endpoint
app.get('/api/system/status', async (req, res) => {
  try {
    const jobStatus = CronService.getJobStatus();
    const systemStats = await CronService.getSystemStats();
    const gatewayStatus = PaymentService.getGatewayStatus();
    
    // Check database type
    const USE_PRISMA = process.env.USE_PRISMA === 'true' || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase'));
    const dbType = USE_PRISMA ? 'Supabase (PostgreSQL via Prisma)' : 'MySQL';
    
    // Test Supabase connection if configured
    let supabaseStatus = null;
    if (process.env.SUPABASE_URL) {
      try {
        const supabase = supabaseConfig.getSupabase();
        if (supabase) {
          const { error } = await supabase.from('users').select('id').limit(1);
          supabaseStatus = error ? { connected: false, error: error.message } : { connected: true };
        }
      } catch (err) {
        supabaseStatus = { connected: false, error: err.message };
      }
    }
    
    res.json({
      cronJobs: jobStatus,
      systemStats,
      paymentGateways: gatewayStatus,
      database: {
        type: dbType,
        supabase: supabaseStatus
      },
      lastUpdate: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize cron jobs on startup
async function initializeSystem() {
  try {
    console.log('Initializing EarnYourDollar system...');
    
    // Initialize database connection
    const dbConnected = await db.testConnection();
    if (!dbConnected) {
      console.warn('⚠️  MySQL connection failed. Will try Supabase/Prisma.');
    }
    
    // Initialize Supabase if configured
    if (process.env.SUPABASE_URL) {
      const supabase = supabaseConfig.initSupabase();
      if (supabase) {
        const supabaseTest = await supabaseConfig.testSupabaseConnection();
        console.log(`Supabase: ${supabaseTest.connected ? '✅ Connected' : '❌ Not connected'}`);
      }
    }
    
    // Initialize Prisma if configured
    const USE_PRISMA = process.env.USE_PRISMA === 'true' || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase'));
    if (USE_PRISMA && process.env.DATABASE_URL) {
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        await prisma.$connect();
        console.log('✅ Prisma/PostgreSQL connected');
        await prisma.$disconnect();
      } catch (prismaError) {
        console.warn('⚠️  Prisma connection failed:', prismaError.message);
      }
    }
    
    // Initialize cron jobs
    await CronService.initialize();
    
    // Initialize payment gateways
    await PaymentService.initializeGateways();
    
    // Initialize email service
    await EmailService.initializeTransporter();
    
    console.log('System initialization completed successfully');
  } catch (error) {
    console.error('System initialization failed:', error);
  }
}

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`🚀 EarnYourDollar Backend Server running on port ${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 System Status: http://localhost:${PORT}/api/system/status`);
  console.log(`⚡ Socket.IO ready for real-time features`);
  
  // Initialize system after server starts
  await initializeSystem();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  CronService.stopAllJobs();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  CronService.stopAllJobs();
  process.exit(0);
});

module.exports = app; 