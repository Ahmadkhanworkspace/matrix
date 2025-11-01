const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, queryOne } = require('../config/database');
const { prisma, USE_PRISMA } = require('../config/databaseHybrid');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, phone, sponsor } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await queryOne(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Username or email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await query(
      'INSERT INTO users (username, email, password_hash, first_name, last_name, phone, sponsor) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, passwordHash, first_name, last_name, phone, sponsor]
    );

    // Send joining/welcome email
    try {
      const EmailService = require('../services/EmailService');
      await EmailService.sendJoiningEmail(username, email, first_name, sponsor);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { userId: result.insertId }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Find user by username or email
    let user;
    let isValidPassword = false;
    
    if (USE_PRISMA) {
      const prismaClient = prisma();
      if (!prismaClient) {
        throw new Error('Prisma client not initialized');
      }
      // Use Prisma for Supabase/PostgreSQL
      user = await prismaClient.user.findFirst({
        where: {
          OR: [
            { username: username },
            { email: username }
          ]
        },
        select: {
          id: true,
          username: true,
          email: true,
          password: true,
          firstName: true,
          lastName: true,
          status: true,
          memberType: true,
          totalEarnings: true,
          unpaidEarnings: true,
          isActive: true
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Check if user is active (Prisma uses enum: ACTIVE, PENDING, etc.)
      if (user.status !== 'ACTIVE' || !user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Account is not active'
        });
      }

      // Verify password (Prisma uses 'password' field, not 'password_hash')
      isValidPassword = await bcrypt.compare(password, user.password);
    } else {
      // Use MySQL (original code)
      user = await queryOne(
        'SELECT id, username, email, password_hash, first_name, last_name, status, membership_level, balance FROM users WHERE username = ? OR email = ?',
        [username, username]
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Check if user is active
      if (user.status !== 1) {
        return res.status(401).json({
          success: false,
          error: 'Account is not active'
        });
      }

      // Verify password
      isValidPassword = await bcrypt.compare(password, user.password_hash);
    }

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    if (USE_PRISMA) {
      const prismaClient = prisma();
      if (prismaClient) {
        await prismaClient.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });
      }
    } else {
      await query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );
    }

    // Normalize user data for response
    const prismaClient = USE_PRISMA ? prisma() : null;
    const userData = USE_PRISMA && prismaClient ? {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      status: user.status === 'ACTIVE' ? 1 : 0,
      membership_level: user.memberType?.toLowerCase() || 'free',
      balance: user.unpaidEarnings || 0
    } : user;

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: userData.id, 
        username: userData.username,
        role: userData.membership_level === 'admin' ? 'admin' : 'user'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password from response
    delete userData.password;
    delete userData.password_hash;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token,
        expiresIn: '24h'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Login error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message || 'Login failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Forgot password - Request reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Find user by email
    const user = await queryOne(
      'SELECT id, username, email FROM users WHERE email = ?',
      [email]
    );

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in database (you may need to add password_reset_token and password_reset_expiry columns)
    await query(
      'UPDATE users SET password_reset_token = ?, password_reset_expiry = ? WHERE id = ?',
      [resetToken, resetTokenExpiry, user.id]
    );

    // Create reset link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    // Send forgot password email
    try {
      const EmailService = require('../services/EmailService');
      await EmailService.sendForgotPasswordEmail(user.username, user.email, resetToken, resetLink);
    } catch (emailError) {
      console.error('Error sending forgot password email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process password reset request'
    });
  }
});

// Reset password - Update password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token, email, and new password are required'
      });
    }

    // Find user by email and token
    const user = await queryOne(
      'SELECT id, password_reset_token, password_reset_expiry FROM users WHERE email = ? AND password_reset_token = ?',
      [email, token]
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    // Check if token is expired
    if (user.password_reset_expiry < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Reset token has expired. Please request a new one.'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    await query(
      'UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expiry = NULL WHERE id = ?',
      [passwordHash, user.id]
    );

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password'
    });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const token = authHeader.substring(7);
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user data
    const user = await queryOne(
      'SELECT id, username, email, first_name, last_name, phone, status, membership_level, balance, sponsor, ref_by, join_date, last_login FROM users WHERE id = ?',
      [decoded.userId]
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
    console.error('Profile error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = router; 