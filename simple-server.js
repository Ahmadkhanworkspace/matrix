const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for Matrix MLM system
const mockData = {
  members: {
    total: 46,
    free: 21,
    pro: 25,
    pending: 0
  },
  boards: {
    starterL1: 29,
    starterL2: 15,
    basicL1: 2,
    basicL2: 0,
    advancedL1: 0,
    advancedL2: 0,
    masterL1: 12,
    masterL2: 10,
    masterL3: 3,
    masterL4: 0
  },
  financial: {
    pendingDeposit: 'USDT 0.00',
    purchaseTransactions: 2,
    completedWithdrawals: 'USDT 11.00000',
    pendingWithdrawals: 'USDT 0.00000',
    pendingTransactions: 3
  },
  testimonials: {
    approved: 0,
    pending: 0
  },
  promotional: {
    banners: 0,
    soloAds: 1,
    splashPages: 0,
    leadPages: 1,
    approvedBanners: 0,
    pendingBanners: 0,
    approvedTextAds: 0,
    pendingTextAds: 0
  },
  system: {
    cronStatus: 'Not Running',
    lastUpdatedId: '106'
  }
};

// Routes
app.get('/api/dashboard', (req, res) => {
  res.json({
    success: true,
    data: mockData
  });
});

// User stats overview for admin dashboard
app.get('/api/users/stats/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      totalUsers: mockData.members.total,
      activeUsers: mockData.members.pro + mockData.members.free,
      proUsers: mockData.members.pro,
      pendingUsers: mockData.members.pending,
      newUsersThisWeek: 3,
      newUsersThisMonth: 12
    }
  });
});

// Matrix level stats
app.get('/api/matrix/level-stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalPositions: mockData.boards.starterL1 + mockData.boards.starterL2 + mockData.boards.basicL1 + mockData.boards.basicL2 + mockData.boards.advancedL1 + mockData.boards.advancedL2 + mockData.boards.masterL1 + mockData.boards.masterL2 + mockData.boards.masterL3 + mockData.boards.masterL4,
      completedCycles: mockData.boards.masterL3,
      activePositions: mockData.boards.starterL1 + mockData.boards.starterL2,
      pendingPositions: mockData.system.pendingTransactions || 0
    }
  });
});

// Payment stats
app.get('/api/payments/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalEarnings: 12500,
      pendingDeposits: 0,
      completedWithdrawals: 11,
      totalRevenue: 28500,
      revenueThisMonth: 3200,
      revenueThisWeek: 850
    }
  });
});

app.get('/api/members', (req, res) => {
  res.json({
    success: true,
    data: mockData.members
  });
});

app.get('/api/boards', (req, res) => {
  res.json({
    success: true,
    data: mockData.boards
  });
});

app.get('/api/financial', (req, res) => {
  res.json({
    success: true,
    data: mockData.financial
  });
});

app.get('/api/testimonials', (req, res) => {
  res.json({
    success: true,
    data: mockData.testimonials
  });
});

app.get('/api/promotional', (req, res) => {
  res.json({
    success: true,
    data: mockData.promotional
  });
});

app.get('/api/system', (req, res) => {
  res.json({
    success: true,
    data: mockData.system
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Matrix MLM API Server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Matrix MLM API Server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard`);
  console.log(`👥 Members: http://localhost:${PORT}/api/members`);
  console.log(`🎯 Boards: http://localhost:${PORT}/api/boards`);
  console.log(`💰 Financial: http://localhost:${PORT}/api/financial`);
  console.log(`💬 Testimonials: http://localhost:${PORT}/api/testimonials`);
  console.log(`📢 Promotional: http://localhost:${PORT}/api/promotional`);
  console.log(`⚙️ System: http://localhost:${PORT}/api/system`);
  console.log(`❤️ Health: http://localhost:${PORT}/api/health`);
}); 