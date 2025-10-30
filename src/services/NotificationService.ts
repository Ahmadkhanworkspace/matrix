import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import server from '../server';
const io = server.getIO();

interface NotificationFilters {
  page: number;
  limit: number;
  type?: string;
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export class NotificationService {
  /**
   * Get all notifications with filtering and pagination
   */
  async getNotifications(filters: NotificationFilters) {
    try {
      const { page, limit, type, status, priority, startDate, endDate, search } = filters;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (type) {
        where.type = type;
      }

      if (status) {
        where.status = status;
      }

      if (priority) {
        where.priority = priority;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { message: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                userNotifications: true
              }
            }
          }
        }),
        prisma.notification.count({ where })
      ]);

      return {
        notifications,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error getting notifications:', error);
      throw error;
    }
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(id: string) {
    try {
      return await prisma.notification.findUnique({
        where: { id },
        include: {
          userNotifications: {
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
    } catch (error) {
      logger.error('Error getting notification by ID:', error);
      throw error;
    }
  }

  /**
   * Create new notification
   */
  async createNotification(data: any) {
    try {
      const notification = await prisma.notification.create({
        data: {
          title: data.title,
          message: data.message,
          type: data.type,
          priority: data.priority || 'medium',
          status: data.status || 'draft',
          targetAudience: data.targetAudience || [],
          sendDate: data.sendDate ? new Date(data.sendDate) : null,
          isGlobal: data.isGlobal || false,
          requiresAction: data.requiresAction || false,
          actionUrl: data.actionUrl,
          actionText: data.actionText
        }
      });

      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Update notification
   */
  async updateNotification(id: string, data: any) {
    try {
      const updateData: any = {};

      if (data.title) updateData.title = data.title;
      if (data.message) updateData.message = data.message;
      if (data.type) updateData.type = data.type;
      if (data.priority) updateData.priority = data.priority;
      if (data.status) updateData.status = data.status;
      if (data.targetAudience) updateData.targetAudience = data.targetAudience;
      if (data.sendDate) updateData.sendDate = new Date(data.sendDate);
      if (data.isGlobal !== undefined) updateData.isGlobal = data.isGlobal;
      if (data.requiresAction !== undefined) updateData.requiresAction = data.requiresAction;
      if (data.actionUrl) updateData.actionUrl = data.actionUrl;
      if (data.actionText) updateData.actionText = data.actionText;

      return await prisma.notification.update({
        where: { id },
        data: updateData
      });
    } catch (error) {
      logger.error('Error updating notification:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: string) {
    try {
      // Delete associated user notifications first
      await prisma.userNotification.deleteMany({
        where: { notificationId: id }
      });

      return await prisma.notification.delete({
        where: { id }
      });
    } catch (error) {
      logger.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Send notification to users
   */
  async sendNotification(notificationId: string, userIds?: string[]) {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId }
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      let targetUsers: any[] = [];

      if (userIds && userIds.length > 0) {
        // Send to specific users
        targetUsers = await prisma.user.findMany({
          where: {
            id: { in: userIds }
          }
        });
      } else if (notification.isGlobal) {
        // Send to all users
        targetUsers = await prisma.user.findMany({
          where: {
            status: 'active'
          }
        });
      } else {
        // Send based on target audience
        const audienceConditions: any = {};

        if (notification.targetAudience.includes('new-members')) {
          audienceConditions.createdAt = {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          };
        }

        if (notification.targetAudience.includes('active-members')) {
          audienceConditions.lastLoginAt = {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          };
        }

        if (notification.targetAudience.includes('pro-members')) {
          audienceConditions.membershipLevel = 'pro';
        }

        if (notification.targetAudience.includes('leadership-members')) {
          audienceConditions.leadershipLevel = { not: null };
        }

        targetUsers = await prisma.user.findMany({
          where: {
            status: 'active',
            ...audienceConditions
          }
        });
      }

      // Create user notifications
      const userNotifications = targetUsers.map(user => ({
        userId: user.id,
        notificationId: notification.id,
        status: 'unread',
        sentAt: new Date()
      }));

      await prisma.userNotification.createMany({
        data: userNotifications
      });

      // Send real-time notifications via Socket.IO
      targetUsers.forEach(user => {
        io.to(`user-${user.id}`).emit('notification', {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          requiresAction: notification.requiresAction,
          actionUrl: notification.actionUrl,
          actionText: notification.actionText,
          timestamp: new Date()
        });
      });

      // Update notification status
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: 'sent',
          sentAt: new Date(),
          totalSent: targetUsers.length
        }
      });

      return {
        notificationId,
        totalSent: targetUsers.length,
        recipients: targetUsers.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email
        }))
      };
    } catch (error) {
      logger.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read for user
   */
  async markAsRead(notificationId: string, userId: string) {
    try {
      return await prisma.userNotification.updateMany({
        where: {
          notificationId,
          userId
        },
        data: {
          status: 'read',
          readAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, filters: any = {}) {
    try {
      const { page = 1, limit = 20, status, type } = filters;
      const skip = (page - 1) * limit;

      const where: any = {
        userId
      };

      if (status) {
        where.status = status;
      }

      if (type) {
        where.notification = {
          type: type
        };
      }

      const [userNotifications, total] = await Promise.all([
        prisma.userNotification.findMany({
          where,
          skip,
          take: limit,
          orderBy: { sentAt: 'desc' },
          include: {
            notification: true
          }
        }),
        prisma.userNotification.count({ where })
      ]);

      return {
        notifications: userNotifications,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStatistics(period: string = '30d') {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const [
        totalNotifications,
        activeNotifications,
        sentNotifications,
        totalSent,
        totalRead,
        urgentNotifications
      ] = await Promise.all([
        prisma.notification.count({
          where: { createdAt: { gte: startDate } }
        }),
        prisma.notification.count({
          where: { 
            createdAt: { gte: startDate },
            status: 'active'
          }
        }),
        prisma.notification.count({
          where: { 
            createdAt: { gte: startDate },
            status: 'sent'
          }
        }),
        prisma.userNotification.count({
          where: { 
            sentAt: { gte: startDate }
          }
        }),
        prisma.userNotification.count({
          where: { 
            sentAt: { gte: startDate },
            status: 'read'
          }
        }),
        prisma.notification.count({
          where: { 
            createdAt: { gte: startDate },
            priority: 'urgent'
          }
        })
      ]);

      return {
        period,
        totalNotifications,
        activeNotifications,
        sentNotifications,
        totalSent,
        totalRead,
        urgentNotifications,
        averageReadRate: totalSent > 0 ? (totalRead / totalSent) * 100 : 0,
        startDate,
        endDate: now
      };
    } catch (error) {
      logger.error('Error getting notification statistics:', error);
      throw error;
    }
  }

  /**
   * Create system notification
   */
  async createSystemNotification(title: string, message: string, type: string = 'system', priority: string = 'medium') {
    try {
      const notification = await prisma.notification.create({
        data: {
          title,
          message,
          type,
          priority,
          status: 'active',
          targetAudience: ['all-members'],
          isGlobal: true,
          requiresAction: false
        }
      });

      // Auto-send system notifications
      await this.sendNotification(notification.id);

      return notification;
    } catch (error) {
      logger.error('Error creating system notification:', error);
      throw error;
    }
  }

  /**
   * Schedule notification
   */
  async scheduleNotification(notificationId: string, sendDate: Date) {
    try {
      return await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: 'scheduled',
          sendDate
        }
      });
    } catch (error) {
      logger.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Process scheduled notifications
   */
  async processScheduledNotifications() {
    try {
      const now = new Date();
      const scheduledNotifications = await prisma.notification.findMany({
        where: {
          status: 'scheduled',
          sendDate: {
            lte: now
          }
        }
      });

      for (const notification of scheduledNotifications) {
        await this.sendNotification(notification.id);
        logger.info(`Processed scheduled notification: ${notification.title}`);
      }

      return {
        processed: scheduledNotifications.length,
        notifications: scheduledNotifications.map(n => n.title)
      };
    } catch (error) {
      logger.error('Error processing scheduled notifications:', error);
      throw error;
    }
  }
}

export default NotificationService;

