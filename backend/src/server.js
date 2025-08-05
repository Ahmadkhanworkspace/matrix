const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/database');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import services
const MatrixService = require('./services/MatrixService');
const PaymentService = require('./services/PaymentService');
const EmailService = require('./services/EmailService');
const CronService = require('./services/CronService');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const matrixRoutes = require('./routes/matrixRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matrix', matrixRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await db.execute('SELECT 1');
    
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
    
    res.json({
      cronJobs: jobStatus,
      systemStats,
      paymentGateways: gatewayStatus,
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

app.listen(PORT, async () => {
  console.log(`🚀 EarnYourDollar Backend Server running on port ${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 System Status: http://localhost:${PORT}/api/system/status`);
  
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