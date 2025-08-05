const express = require('express');
const jwt = require('jsonwebtoken');
const { query, queryOne } = require('../config/database');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// Get all transactions
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, username } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];

    // Add filters
    if (type) {
      whereClause += ' AND t.type = ?';
      params.push(type);
    }

    if (status) {
      whereClause += ' AND t.status = ?';
      params.push(status);
    }

    if (username) {
      whereClause += ' AND u.username LIKE ?';
      params.push(`%${username}%`);
    }

    // Get total count
    const countResult = await queryOne(
      `SELECT COUNT(*) as total FROM transactions t 
       LEFT JOIN users u ON t.user_id = u.id 
       ${whereClause}`,
      params
    );

    // Get transactions
    const transactions = await query(
      `SELECT t.id, t.type, t.amount, t.currency, t.status, t.description, 
       t.transaction_id, t.created_at, u.username, u.email 
       FROM transactions t 
       LEFT JOIN users u ON t.user_id = u.id 
       ${whereClause} 
       ORDER BY t.created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transactions'
    });
  }
});

// Get deposits
router.get('/deposits', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE t.type = "deposit"';
    let params = [];

    if (status) {
      whereClause += ' AND t.status = ?';
      params.push(status);
    }

    // Get total count
    const countResult = await queryOne(
      `SELECT COUNT(*) as total FROM transactions t 
       LEFT JOIN users u ON t.user_id = u.id 
       ${whereClause}`,
      params
    );

    // Get deposits
    const deposits = await query(
      `SELECT t.id, t.amount, t.currency, t.status, t.description, 
       t.transaction_id, t.created_at, u.username, u.email 
       FROM transactions t 
       LEFT JOIN users u ON t.user_id = u.id 
       ${whereClause} 
       ORDER BY t.created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: deposits,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get deposits error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get deposits'
    });
  }
});

// Get withdrawals
router.get('/withdrawals', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE t.type = "withdrawal"';
    let params = [];

    if (status) {
      whereClause += ' AND t.status = ?';
      params.push(status);
    }

    // Get total count
    const countResult = await queryOne(
      `SELECT COUNT(*) as total FROM transactions t 
       LEFT JOIN users u ON t.user_id = u.id 
       ${whereClause}`,
      params
    );

    // Get withdrawals
    const withdrawals = await query(
      `SELECT t.id, t.amount, t.currency, t.status, t.description, 
       t.transaction_id, t.created_at, u.username, u.email 
       FROM transactions t 
       LEFT JOIN users u ON t.user_id = u.id 
       ${whereClause} 
       ORDER BY t.created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: withdrawals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get withdrawals'
    });
  }
});

// Process deposit
router.post('/deposit', authenticateToken, async (req, res) => {
  try {
    const { username, amount, currency = 'TRX', transactionId } = req.body;

    if (!username || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Username and amount are required'
      });
    }

    // Get user
    const user = await queryOne('SELECT id FROM users WHERE username = ?', [username]);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Create transaction
    const result = await query(
      'INSERT INTO transactions (user_id, type, amount, currency, status, transaction_id) VALUES (?, ?, ?, ?, ?, ?)',
      [user.id, 'deposit', amount, currency, 'pending', transactionId]
    );

    res.status(201).json({
      success: true,
      message: 'Deposit created successfully',
      data: { transactionId: result.insertId }
    });
  } catch (error) {
    console.error('Process deposit error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process deposit'
    });
  }
});

// Process withdrawal
router.post('/withdrawal', authenticateToken, async (req, res) => {
  try {
    const { username, amount, currency = 'TRX' } = req.body;

    if (!username || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Username and amount are required'
      });
    }

    // Get user
    const user = await queryOne('SELECT id, balance FROM users WHERE username = ?', [username]);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user has sufficient balance
    if (user.balance < amount) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance'
      });
    }

    // Create withdrawal transaction
    const result = await query(
      'INSERT INTO transactions (user_id, type, amount, currency, status) VALUES (?, ?, ?, ?, ?)',
      [user.id, 'withdrawal', amount, currency, 'pending']
    );

    res.status(201).json({
      success: true,
      message: 'Withdrawal created successfully',
      data: { transactionId: result.insertId }
    });
  } catch (error) {
    console.error('Process withdrawal error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process withdrawal'
    });
  }
});

// Approve transaction
router.put('/transactions/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get transaction
    const transaction = await queryOne(
      'SELECT * FROM transactions WHERE id = ?',
      [id]
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Transaction is not pending'
      });
    }

    // Update transaction status
    await query(
      'UPDATE transactions SET status = ? WHERE id = ?',
      ['completed', id]
    );

    // If it's a deposit, update user balance
    if (transaction.type === 'deposit') {
      await query(
        'UPDATE users SET balance = balance + ? WHERE id = ?',
        [transaction.amount, transaction.user_id]
      );
    }

    res.json({
      success: true,
      message: 'Transaction approved successfully'
    });
  } catch (error) {
    console.error('Approve transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve transaction'
    });
  }
});

// Reject transaction
router.put('/transactions/:id/reject', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get transaction
    const transaction = await queryOne(
      'SELECT * FROM transactions WHERE id = ?',
      [id]
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Transaction is not pending'
      });
    }

    // Update transaction status
    await query(
      'UPDATE transactions SET status = ? WHERE id = ?',
      ['failed', id]
    );

    res.json({
      success: true,
      message: 'Transaction rejected successfully'
    });
  } catch (error) {
    console.error('Reject transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject transaction'
    });
  }
});

// Get payment statistics for dashboard
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Get total earnings (sum of all completed transactions)
    const totalEarningsResult = await queryOne(
      'SELECT SUM(amount) as total FROM transactions WHERE status = "completed" AND type = "earning"'
    );
    const totalEarnings = totalEarningsResult.total || 0;

    // Get pending deposits
    const pendingDepositsResult = await queryOne(
      'SELECT SUM(amount) as total FROM transactions WHERE status = "pending" AND type = "deposit"'
    );
    const pendingDeposits = pendingDepositsResult.total || 0;

    // Get completed withdrawals
    const completedWithdrawalsResult = await queryOne(
      'SELECT SUM(amount) as total FROM transactions WHERE status = "completed" AND type = "withdrawal"'
    );
    const completedWithdrawals = completedWithdrawalsResult.total || 0;

    // Get total revenue (sum of all deposits)
    const totalRevenueResult = await queryOne(
      'SELECT SUM(amount) as total FROM transactions WHERE type = "deposit"'
    );
    const totalRevenue = totalRevenueResult.total || 0;

    // Get revenue this month
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const revenueThisMonthResult = await queryOne(
      'SELECT SUM(amount) as total FROM transactions WHERE type = "deposit" AND created_at >= ?',
      [monthAgo]
    );
    const revenueThisMonth = revenueThisMonthResult.total || 0;

    // Get revenue this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const revenueThisWeekResult = await queryOne(
      'SELECT SUM(amount) as total FROM transactions WHERE type = "deposit" AND created_at >= ?',
      [weekAgo]
    );
    const revenueThisWeek = revenueThisWeekResult.total || 0;

    res.json({
      success: true,
      data: {
        totalEarnings: 0, // Set to zero for live testing
        pendingDeposits: 0, // Set to zero for live testing
        completedWithdrawals: 0, // Set to zero for live testing
        totalRevenue: 0, // Set to zero for live testing
        revenueThisMonth: 0, // Set to zero for live testing
        revenueThisWeek: 0 // Set to zero for live testing
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment statistics'
    });
  }
});

module.exports = router; 