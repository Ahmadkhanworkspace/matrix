const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/chat');
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

// ============ CHAT ROOMS ============

// Get available chat rooms
router.get('/rooms', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const rooms = await prisma.chatRoom.findMany({
        where: {
          OR: [
            { isPublic: true },
            { members: { some: { userId } } }
          ]
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
          _count: {
            select: {
              messages: true,
              members: true
            }
          }
        },
        orderBy: { lastMessageAt: 'desc' }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: rooms.map(room => ({
          id: room.id,
          name: room.name,
          type: room.type,
          description: room.description,
          isPublic: room.isPublic,
          memberCount: room._count.members,
          messageCount: room._count.messages,
          lastMessageAt: room.lastMessageAt,
          createdAt: room.createdAt,
          isMember: room.members.some(m => m.userId === userId)
        }))
      });
    } catch (error) {
      console.error('Get chat rooms error:', error);
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Get chat rooms error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get chat rooms'
    });
  }
});

// Create chat room
router.post('/rooms', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { name, type, description, isPublic } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: 'Name and type are required'
      });
    }

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const room = await prisma.chatRoom.create({
        data: {
          name,
          type,
          description: description || null,
          isPublic: isPublic !== undefined ? isPublic : true,
          createdBy: userId,
          members: {
            create: {
              userId,
              role: 'admin'
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
          }
        }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        message: 'Chat room created successfully',
        data: {
          id: room.id,
          name: room.name,
          type: room.type,
          description: room.description,
          isPublic: room.isPublic,
          members: room.members.map(m => ({
            id: m.user.id,
            username: m.user.username,
            email: m.user.email,
            role: m.role
          })),
          createdAt: room.createdAt
        }
      });
    } catch (error) {
      console.error('Create chat room error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create chat room'
      });
    }
  } catch (error) {
    console.error('Create chat room error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create chat room'
    });
  }
});

// Join chat room
router.post('/rooms/:id/join', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Check if room exists and is public or user has access
      const room = await prisma.chatRoom.findUnique({
        where: { id }
      });

      if (!room) {
        await prisma.$disconnect();
        return res.status(404).json({
          success: false,
          error: 'Chat room not found'
        });
      }

      if (!room.isPublic) {
        await prisma.$disconnect();
        return res.status(403).json({
          success: false,
          error: 'Cannot join private room'
        });
      }

      // Check if already a member
      const existing = await prisma.chatRoomMember.findUnique({
        where: {
          roomId_userId: {
            roomId: id,
            userId
          }
        }
      });

      if (existing) {
        await prisma.$disconnect();
        return res.json({
          success: true,
          message: 'Already a member of this room'
        });
      }

      // Add member
      await prisma.chatRoomMember.create({
        data: {
          roomId: id,
          userId,
          role: 'member'
        }
      });

      // Update user status
      await prisma.chatUser.upsert({
        where: { userId },
        create: {
          userId,
          status: 'online',
          currentRoomId: id
        },
        update: {
          status: 'online',
          currentRoomId: id,
          lastActiveAt: new Date()
        }
      });

      await prisma.$disconnect();

      // Emit Socket.IO event
      if (req.app.get('io')) {
        req.app.get('io').to(id).emit('user_joined', {
          roomId: id,
          userId,
          joinedAt: new Date()
        });
      }

      res.json({
        success: true,
        message: 'Joined chat room successfully'
      });
    } catch (error) {
      console.error('Join chat room error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to join chat room'
      });
    }
  } catch (error) {
    console.error('Join chat room error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join chat room'
    });
  }
});

// Leave chat room
router.post('/rooms/:id/leave', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      await prisma.chatRoomMember.deleteMany({
        where: {
          roomId: id,
          userId
        }
      });

      // Update user status
      await prisma.chatUser.update({
        where: { userId },
        data: {
          currentRoomId: null
        }
      }).catch(() => {
        // User status doesn't exist, create it
        return prisma.chatUser.create({
          data: {
            userId,
            status: 'offline',
            currentRoomId: null
          }
        });
      });

      await prisma.$disconnect();

      // Emit Socket.IO event
      if (req.app.get('io')) {
        req.app.get('io').to(id).emit('user_left', {
          roomId: id,
          userId,
          leftAt: new Date()
        });
      }

      res.json({
        success: true,
        message: 'Left chat room successfully'
      });
    } catch (error) {
      console.error('Leave chat room error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to leave chat room'
      });
    }
  } catch (error) {
    console.error('Leave chat room error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to leave chat room'
    });
  }
});

// ============ CHAT MESSAGES ============

// Get room messages
router.get('/rooms/:id/messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Verify user is member
      const member = await prisma.chatRoomMember.findUnique({
        where: {
          roomId_userId: {
            roomId: id,
            userId
          }
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

      const messages = await prisma.chatMessage.findMany({
        where: { roomId: id },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      });

      const total = await prisma.chatMessage.count({
        where: { roomId: id }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: messages.reverse().map(msg => ({
          id: msg.id,
          roomId: msg.roomId,
          userId: msg.userId,
          user: msg.user,
          content: msg.content,
          type: msg.type,
          attachmentUrl: msg.attachmentUrl,
          replyToId: msg.replyToId,
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
      console.error('Get chat messages error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get chat messages'
      });
    }
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get chat messages'
    });
  }
});

// Send chat message
router.post('/rooms/:id/messages', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;
    const { content, replyToId } = req.body;

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
      const member = await prisma.chatRoomMember.findUnique({
        where: {
          roomId_userId: {
            roomId: id,
            userId
          }
        }
      });

      if (!member) {
        await prisma.$disconnect();
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      let attachmentUrl = null;
      if (req.file) {
        attachmentUrl = `/uploads/chat/${req.file.filename}`;
      }

      // Create message
      const message = await prisma.chatMessage.create({
        data: {
          roomId: id,
          userId,
          content: content || (req.file ? `Shared file: ${req.file.originalname}` : ''),
          type: req.file ? 'file' : 'text',
          attachmentUrl: attachmentUrl || null,
          replyToId: replyToId || null
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

      // Update room lastMessageAt
      await prisma.chatRoom.update({
        where: { id },
        data: { lastMessageAt: new Date() }
      });

      // Update user status
      await prisma.chatUser.upsert({
        where: { userId },
        create: {
          userId,
          status: 'online',
          currentRoomId: id,
          lastActiveAt: new Date()
        },
        update: {
          status: 'online',
          currentRoomId: id,
          lastActiveAt: new Date()
        }
      });

      await prisma.$disconnect();

      // Emit Socket.IO event
      if (req.app.get('io')) {
        req.app.get('io').to(id).emit('chat_message', {
          id: message.id,
          roomId: message.roomId,
          userId: message.userId,
          user: message.user,
          content: message.content,
          type: message.type,
          attachmentUrl: message.attachmentUrl,
          replyToId: message.replyToId,
          createdAt: message.createdAt
        });
      }

      res.json({
        success: true,
        message: 'Message sent successfully',
        data: {
          id: message.id,
          roomId: message.roomId,
          userId: message.userId,
          user: message.user,
          content: message.content,
          type: message.type,
          attachmentUrl: message.attachmentUrl,
          replyToId: message.replyToId,
          createdAt: message.createdAt
        }
      });
    } catch (error) {
      console.error('Send chat message error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send message'
      });
    }
  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
});

// ============ USER STATUS ============

// Get online users
router.get('/users/online', authenticateToken, async (req, res) => {
  try {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const onlineUsers = await prisma.chatUser.findMany({
        where: {
          status: 'online',
          lastActiveAt: {
            gte: new Date(Date.now() - 5 * 60 * 1000) // Active in last 5 minutes
          }
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

      res.json({
        success: true,
        data: onlineUsers.map(cu => ({
          userId: cu.userId,
          username: cu.user.username,
          email: cu.user.email,
          status: cu.status,
          currentRoomId: cu.currentRoomId,
          lastActiveAt: cu.lastActiveAt
        }))
      });
    } catch (error) {
      console.error('Get online users error:', error);
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get online users'
    });
  }
});

// Update user status
router.put('/users/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { status, currentRoomId } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const chatUser = await prisma.chatUser.upsert({
        where: { userId },
        create: {
          userId,
          status,
          currentRoomId: currentRoomId || null,
          lastActiveAt: new Date()
        },
        update: {
          status,
          currentRoomId: currentRoomId || null,
          lastActiveAt: new Date()
        }
      });

      await prisma.$disconnect();

      // Emit Socket.IO event
      if (req.app.get('io')) {
        req.app.get('io').emit('user_status_update', {
          userId,
          status,
          currentRoomId: currentRoomId || null
        });
      }

      res.json({
        success: true,
        message: 'Status updated successfully',
        data: {
          userId: chatUser.userId,
          status: chatUser.status,
          currentRoomId: chatUser.currentRoomId,
          lastActiveAt: chatUser.lastActiveAt
        }
      });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update status'
      });
    }
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update status'
    });
  }
});

// ============ ADMIN CHAT SUPPORT ============

// Admin: Get all active chats
router.get('/admin/active-chats', authenticateAdmin, async (req, res) => {
  try {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const rooms = await prisma.chatRoom.findMany({
        where: {
          type: 'support'
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
            take: 1
          },
          _count: {
            select: {
              messages: true,
              members: true
            }
          }
        },
        orderBy: { lastMessageAt: 'desc' }
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: rooms.map(room => ({
          id: room.id,
          name: room.name,
          type: room.type,
          members: room.members.map(m => ({
            id: m.user.id,
            username: m.user.username,
            email: m.user.email
          })),
          lastMessage: room.messages[0] || null,
          memberCount: room._count.members,
          messageCount: room._count.messages,
          lastMessageAt: room.lastMessageAt
        }))
      });
    } catch (error) {
      console.error('Get active chats error:', error);
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Get active chats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active chats'
    });
  }
});

// Admin: Join any conversation
router.post('/admin/join/:roomId', authenticateAdmin, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { roomId } = req.params;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Check if already member
      const existing = await prisma.chatRoomMember.findUnique({
        where: {
          roomId_userId: {
            roomId,
            userId
          }
        }
      });

      if (existing) {
        await prisma.$disconnect();
        return res.json({
          success: true,
          message: 'Already a member'
        });
      }

      // Add admin as member
      await prisma.chatRoomMember.create({
        data: {
          roomId,
          userId,
          role: 'admin'
        }
      });

      await prisma.$disconnect();

      // Emit Socket.IO event
      if (req.app.get('io')) {
        req.app.get('io').to(roomId).emit('admin_joined', {
          roomId,
          adminId: userId,
          joinedAt: new Date()
        });
      }

      res.json({
        success: true,
        message: 'Joined conversation successfully'
      });
    } catch (error) {
      console.error('Admin join error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to join conversation'
      });
    }
  } catch (error) {
    console.error('Admin join error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join conversation'
    });
  }
});

module.exports = router;

