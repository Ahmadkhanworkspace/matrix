const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/messages');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

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

// Middleware for admin authentication
const authenticateAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user.role !== 'admin' && req.user.username !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    next();
  });
};

// ============ CONVERSATIONS ============

// Create conversation
router.post('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { type, name, userIds } = req.body;

    if (!type || (type === 'direct' && (!userIds || userIds.length !== 1))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid conversation type or participants'
      });
    }

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Check if direct conversation already exists
      if (type === 'direct' && userIds.length === 1) {
        const existing = await prisma.conversation.findFirst({
          where: {
            type: 'direct',
            members: {
              every: {
                userId: { in: [userId, userIds[0]] }
              }
            }
          },
          include: {
            members: true
          }
        });

        if (existing && existing.members.length === 2) {
          await prisma.$disconnect();
          return res.json({
            success: true,
            message: 'Conversation already exists',
            data: {
              id: existing.id,
              type: existing.type,
              name: existing.name,
              createdAt: existing.createdAt
            }
          });
        }
      }

      // Create conversation
      const conversation = await prisma.conversation.create({
        data: {
          type,
          name: name || null,
          createdBy: userId,
          members: {
            create: [
              { userId, role: 'owner' },
              ...(userIds || []).map(uId => ({ userId: uId, role: 'member' }))
            ]
          }
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true
                }
              }
            }
          }
        }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Conversation created successfully',
        data: {
          id: conversation.id,
          type: conversation.type,
          name: conversation.name,
          members: conversation.members.map(m => ({
            id: m.user.id,
            username: m.user.username,
            email: m.user.email,
            role: m.role
          })),
          createdAt: conversation.createdAt
        }
      });
    } catch (error) {
      console.error('Create conversation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create conversation'
      });
    }
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create conversation'
    });
  }
});

// Get user conversations
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const conversations = await prisma.conversation.findMany({
        where: {
          members: {
            some: {
              userId
            }
          }
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true
                }
              }
            }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              user: {
                select: {
                  username: true
                }
              }
            }
          }
        },
        orderBy: { lastMessageAt: 'desc' }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: conversations.map(conv => ({
          id: conv.id,
          type: conv.type,
          name: conv.name,
          members: conv.members.map(m => ({
            id: m.user.id,
            username: m.user.username,
            email: m.user.email,
            role: m.role
          })),
          lastMessage: conv.messages[0] ? {
            content: conv.messages[0].content.substring(0, 100),
            username: conv.messages[0].user.username,
            createdAt: conv.messages[0].createdAt
          } : null,
          lastMessageAt: conv.lastMessageAt,
          createdAt: conv.createdAt
        }))
      });
    } catch (error) {
      console.error('Get conversations error:', error);
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversations'
    });
  }
});

// Get conversation details
router.get('/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Verify user is member
      const member = await prisma.conversationMember.findFirst({
        where: {
          conversationId: id,
          userId
        }
      });

      if (!member) {
        await prisma.$disconnect();
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const conversation = await prisma.conversation.findUnique({
        where: { id },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true
                }
              }
            }
          }
        }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: {
          id: conversation.id,
          type: conversation.type,
          name: conversation.name,
          members: conversation.members.map(m => ({
            id: m.user.id,
            username: m.user.username,
            email: m.user.email,
            role: m.role
          })),
          createdAt: conversation.createdAt
        }
      });
    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get conversation'
      });
    }
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversation'
    });
  }
});

// ============ MESSAGES ============

// Send message
router.post('/conversations/:id/messages', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;
    const { content, type = 'text', parentMessageId } = req.body;

    if (!content && !req.file) {
      return res.status(400).json({
        success: false,
        error: 'Message content or file is required'
      });
    }

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Verify user is member
      const member = await prisma.conversationMember.findFirst({
        where: {
          conversationId: id,
          userId
        }
      });

      if (!member) {
        await prisma.$disconnect();
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      let fileUrl = null;
      let fileName = null;
      let fileType = null;
      let fileSize = 0;

      if (req.file) {
        fileUrl = `/uploads/messages/${req.file.filename}`;
        fileName = req.file.originalname;
        fileType = req.file.mimetype;
        fileSize = req.file.size;
      }

      // Create message
      const message = await prisma.message.create({
        data: {
          conversationId: id,
          userId,
          content: content || (req.file ? `Shared file: ${fileName}` : ''),
          type: req.file ? 'file' : type,
          parentMessageId: parentMessageId || null,
          attachments: req.file ? {
            create: {
              fileName,
              fileUrl,
              fileType,
              fileSize
            }
          } : undefined
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          attachments: true
        }
      });

      // Update conversation lastMessageAt
      await prisma.conversation.update({
        where: { id },
        data: { lastMessageAt: new Date() }
      });

      // Mark as read by sender
      await prisma.messageRead.create({
        data: {
          messageId: message.id,
          userId
        }
      });

      await prisma.$disconnect();

      // Emit Socket.IO event
      if (req.app.get('io')) {
        req.app.get('io').to(id).emit('new_message', {
          id: message.id,
          conversationId: message.conversationId,
          userId: message.userId,
          user: message.user,
          content: message.content,
          type: message.type,
          attachments: message.attachments,
          createdAt: message.createdAt
        });
      }

      res.json({
        success: true,
        message: 'Message sent successfully',
        data: {
          id: message.id,
          conversationId: message.conversationId,
          userId: message.userId,
          user: message.user,
          content: message.content,
          type: message.type,
          attachments: message.attachments,
          parentMessageId: message.parentMessageId,
          createdAt: message.createdAt
        }
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send message'
      });
    }
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
});

// Get messages
router.get('/conversations/:id/messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Verify user is member
      const member = await prisma.conversationMember.findFirst({
        where: {
          conversationId: id,
          userId
        }
      });

      if (!member) {
        await prisma.$disconnect();
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const messages = await prisma.message.findMany({
        where: { conversationId: id },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          attachments: true,
          reads: {
            select: {
              userId: true,
              readAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      });

      const total = await prisma.message.count({
        where: { conversationId: id }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: messages.reverse().map(msg => ({
          id: msg.id,
          conversationId: msg.conversationId,
          userId: msg.userId,
          user: msg.user,
          content: msg.content,
          type: msg.type,
          attachments: msg.attachments,
          parentMessageId: msg.parentMessageId,
          isEdited: msg.isEdited,
          editedAt: msg.editedAt,
          reads: msg.reads,
          createdAt: msg.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get messages'
      });
    }
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get messages'
    });
  }
});

// Mark messages as read
router.put('/messages/:id/read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      await prisma.messageRead.upsert({
        where: {
          messageId_userId: {
            messageId: id,
            userId
          }
        },
        create: {
          messageId: id,
          userId
        },
        update: {
          readAt: new Date()
        }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Message marked as read'
      });
    } catch (error) {
      console.error('Mark read error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark message as read'
      });
    }
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark message as read'
    });
  }
});

// Search messages
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { q, conversationId } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Get user's conversations
      const userConversations = await prisma.conversationMember.findMany({
        where: { userId },
        select: { conversationId: true }
      });

      const conversationIds = userConversations.map(c => c.conversationId);

      const where = {
        conversationId: conversationId ? conversationId : { in: conversationIds },
        content: {
          contains: q,
          mode: 'insensitive'
        }
      };

      const messages = await prisma.message.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          conversation: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          attachments: true
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: messages.map(msg => ({
          id: msg.id,
          conversationId: msg.conversationId,
          conversation: msg.conversation,
          userId: msg.userId,
          user: msg.user,
          content: msg.content,
          type: msg.type,
          attachments: msg.attachments,
          createdAt: msg.createdAt
        }))
      });
    } catch (error) {
      console.error('Search messages error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search messages'
      });
    }
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search messages'
    });
  }
});

// ============ ADMIN BROADCAST ============

// Create broadcast message
router.post('/broadcast', authenticateAdmin, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { subject, content, segments } = req.body;

    if (!subject || !content) {
      return res.status(400).json({
        success: false,
        error: 'Subject and content are required'
      });
    }

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Get target users based on segments
      let targetUserIds = [];
      
      if (segments && segments.length > 0) {
        // Build query based on segments
        const where = {};
        
        segments.forEach(segment => {
          switch (segment.type) {
            case 'all':
              // All users
              break;
            case 'active':
              where.isActive = true;
              break;
            case 'membership':
              where.memberType = segment.value;
              break;
            case 'rank':
              // Users with specific rank
              const rankUsers = await prisma.userRank.findMany({
                where: {
                  rankId: segment.value,
                  isActive: true
                },
                select: { userId: true }
              });
              targetUserIds.push(...rankUsers.map(u => u.userId));
              break;
          }
        });

        if (Object.keys(where).length > 0 && targetUserIds.length === 0) {
          const users = await prisma.user.findMany({
            where,
            select: { id: true }
          });
          targetUserIds = users.map(u => u.id);
        }
      } else {
        // Broadcast to all users
        const users = await prisma.user.findMany({
          select: { id: true }
        });
        targetUserIds = users.map(u => u.id);
      }

      // Create broadcast conversation
      const conversation = await prisma.conversation.create({
        data: {
          type: 'broadcast',
          name: subject,
          createdBy: userId,
          members: {
            create: targetUserIds.map(uId => ({
              userId: uId,
              role: 'member'
            }))
          }
        }
      });

      // Create broadcast message
      const message = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          userId,
          content,
          type: 'system'
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      });

      await prisma.$disconnect();

      // Emit Socket.IO event to all target users
      if (req.app.get('io')) {
        targetUserIds.forEach(uId => {
          req.app.get('io').to(`user:${uId}`).emit('broadcast_message', {
            conversationId: conversation.id,
            subject,
            content,
            from: message.user,
            createdAt: message.createdAt
          });
        });
      }

      res.json({
        success: true,
        message: `Broadcast sent to ${targetUserIds.length} users`,
        data: {
          conversationId: conversation.id,
          messageId: message.id,
          recipients: targetUserIds.length
        }
      });
    } catch (error) {
      console.error('Create broadcast error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create broadcast'
      });
    }
  } catch (error) {
    console.error('Create broadcast error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create broadcast'
    });
  }
});

module.exports = router;

