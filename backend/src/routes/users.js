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

// Get user statistics for dashboard
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    // Get total users count
    const totalUsersResult = await queryOne('SELECT COUNT(*) as total FROM users');
    const totalUsers = totalUsersResult.total || 0;

    // Get active users count (status = 1)
    const activeUsersResult = await queryOne('SELECT COUNT(*) as total FROM users WHERE status = 1');
    const activeUsers = activeUsersResult.total || 0;

    // Get pro users count (membership_level = 2)
    const proUsersResult = await queryOne('SELECT COUNT(*) as total FROM users WHERE membership_level = 2');
    const proUsers = proUsersResult.total || 0;

    // Get pending users count (status = 0)
    const pendingUsersResult = await queryOne('SELECT COUNT(*) as total FROM users WHERE status = 0');
    const pendingUsers = pendingUsersResult.total || 0;

    // Get new users this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newUsersThisWeekResult = await queryOne(
      'SELECT COUNT(*) as total FROM users WHERE created_at >= ?',
      [weekAgo]
    );
    const newUsersThisWeek = newUsersThisWeekResult.total || 0;

    // Get new users this month
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const newUsersThisMonthResult = await queryOne(
      'SELECT COUNT(*) as total FROM users WHERE created_at >= ?',
      [monthAgo]
    );
    const newUsersThisMonth = newUsersThisMonthResult.total || 0;

    res.json({
      success: true,
      data: {
        totalUsers: 0, // Set to zero for live testing
        activeUsers: 0, // Set to zero for live testing
        proUsers: 0, // Set to zero for live testing
        pendingUsers: 0, // Set to zero for live testing
        newUsersThisWeek: 0, // Set to zero for live testing
        newUsersThisMonth: 0 // Set to zero for live testing
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user statistics'
    });
  }
});

// Get all users (with pagination and filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, level, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];

    // Add filters
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (level) {
      whereClause += ' AND membership_level = ?';
      params.push(level);
    }

    if (search) {
      whereClause += ' AND (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Get total count
    const countResult = await queryOne(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );

    // Get users
    const users = await query(
      `SELECT id, username, email, first_name, last_name, phone, status, membership_level, 
       balance, sponsor, ref_by, join_date, last_login, created_at 
       FROM users ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get users'
    });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await queryOne(
      'SELECT id, username, email, first_name, last_name, phone, status, membership_level, balance, sponsor, ref_by, join_date, last_login FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user'
    });
  }
});

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, status, membership_level } = req.body;

    // Check if user exists
    const existingUser = await queryOne('SELECT id FROM users WHERE id = ?', [id]);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update user
    await query(
      'UPDATE users SET first_name = ?, last_name = ?, phone = ?, status = ?, membership_level = ? WHERE id = ?',
      [first_name, last_name, phone, status, membership_level, id]
    );

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

// Delete user
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await queryOne('SELECT id FROM users WHERE id = ?', [id]);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Delete user
    await query('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

// Search users
router.get('/search/:term', authenticateToken, async (req, res) => {
  try {
    const { term } = req.params;
    const { limit = 10 } = req.query;

    const users = await query(
      `SELECT id, username, email, first_name, last_name, status, membership_level, balance, join_date 
       FROM users 
       WHERE username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?
       ORDER BY created_at DESC 
       LIMIT ?`,
      [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`, parseInt(limit)]
    );

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search users'
    });
  }
});

module.exports = router; 