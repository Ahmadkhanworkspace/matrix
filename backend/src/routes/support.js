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

// Get user's support tickets
router.get('/tickets', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    
    // Try Prisma first
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const tickets = await prisma.supportTicket.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 1 // Just count
          }
        }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: tickets.map(t => ({
          id: t.id,
          subject: t.subject,
          status: t.status.toLowerCase().replace('_', '-'),
          priority: t.priority.toLowerCase(),
          category: t.category || 'General',
          createdAt: t.createdAt,
          lastUpdated: t.updatedAt,
          messages: t.messages?.length || 0
        }))
      });
    } catch {
      // MySQL fallback - if support_tickets table exists
      try {
        const tickets = await query(
          `SELECT id, subject, status, priority, category, created_at, updated_at,
           (SELECT COUNT(*) FROM support_messages WHERE ticket_id = support_tickets.id) as messages
           FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC`,
          [userId]
        );

        res.json({
          success: true,
          data: tickets.map(t => ({
            id: t.id,
            subject: t.subject,
            status: t.status?.toLowerCase().replace('_', '-') || 'open',
            priority: t.priority?.toLowerCase() || 'medium',
            category: t.category || 'General',
            createdAt: t.created_at,
            lastUpdated: t.updated_at || t.created_at,
            messages: t.messages || 0
          }))
        });
      } catch {
        // Return empty if table doesn't exist
        res.json({
          success: true,
          data: []
        });
      }
    }
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get support tickets'
    });
  }
});

// Create support ticket
router.post('/tickets', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { subject, message, category = 'General', priority = 'medium' } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Subject and message are required'
      });
    }

    // Try Prisma first
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const ticket = await prisma.supportTicket.create({
        data: {
          userId: userId,
          subject: subject,
          category: category,
          priority: priority.toUpperCase(),
          status: 'OPEN',
          messages: {
            create: {
              userId: userId,
              message: message,
              isInternal: false
            }
          }
        }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Support ticket created successfully',
        data: {
          id: ticket.id,
          subject: ticket.subject,
          status: ticket.status.toLowerCase().replace('_', '-')
        }
      });
    } catch {
      // MySQL fallback
      try {
        const result = await query(
          `INSERT INTO support_tickets (user_id, subject, category, priority, status, created_at) 
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [userId, subject, category, priority, 'open']
        );

        // Create first message
        await query(
          `INSERT INTO support_messages (ticket_id, user_id, message, created_at) 
           VALUES (?, ?, ?, NOW())`,
          [result.insertId, userId, message]
        );

        res.json({
          success: true,
          message: 'Support ticket created successfully',
          data: {
            id: result.insertId,
            subject: subject,
            status: 'open'
          }
        });
      } catch {
        res.status(500).json({
          success: false,
          error: 'Support tickets feature not available'
        });
      }
    }
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create support ticket'
    });
  }
});

// Get FAQ
router.get('/faq', async (req, res) => {
  try {
    // Try Prisma first
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const faqs = await prisma.faq.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: faqs.map(f => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
          category: f.category || 'General'
        }))
      });
    } catch {
      // MySQL fallback
      try {
        const faqs = await query(
          'SELECT id, question, answer, category FROM faqs WHERE is_active = 1 ORDER BY display_order ASC'
        );

        res.json({
          success: true,
          data: faqs.map(f => ({
            id: f.id,
            question: f.question,
            answer: f.answer,
            category: f.category || 'General'
          }))
        });
      } catch {
        // Return default FAQs if table doesn't exist
        res.json({
          success: true,
          data: [
            {
              id: '1',
              question: 'How do I withdraw my earnings?',
              answer: 'You can withdraw your earnings from the Wallet page. Click on "Withdraw" and enter the amount you wish to withdraw. Withdrawals are processed within 24-48 hours.',
              category: 'Payments'
            },
            {
              id: '2',
              question: 'How does the matrix system work?',
              answer: 'The matrix system is a 2x8 structure where each level must be filled before moving to the next. When a level is complete, you cycle and earn bonuses.',
              category: 'Matrix'
            },
            {
              id: '3',
              question: 'How do I refer new members?',
              answer: 'Share your referral link with potential members. When they register using your link, they become part of your downline and you earn referral bonuses.',
              category: 'Referrals'
            },
            {
              id: '4',
              question: 'What are the minimum withdrawal amounts?',
              answer: 'The minimum withdrawal amount is $50 for most payment methods. Some methods may have different minimums.',
              category: 'Payments'
            },
            {
              id: '5',
              question: 'How long does it take to process payments?',
              answer: 'Deposits are usually processed instantly via IPN. Withdrawals take 24-48 hours for processing and approval.',
              category: 'Payments'
            }
          ]
        });
      }
    }
  } catch (error) {
    console.error('Get FAQ error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get FAQ'
    });
  }
});

module.exports = router;

