import { Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService';
import { logger } from '../utils/logger';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Get all notifications with filtering and pagination
   */
  public getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        status,
        priority,
        startDate,
        endDate,
        search
      } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        type: type as string,
        status: status as string,
        priority: priority as string,
        startDate: startDate as string,
        endDate: endDate as string,
        search: search as string
      };

      const result = await this.notificationService.getNotifications(filters);
      
      res.status(200).json({
        success: true,
        data: result.notifications,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages
        }
      });
    } catch (error) {
      logger.error('Error getting notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve notifications',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get notification by ID
   */
  public getNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const notification = await this.notificationService.getNotificationById(id);

      if (!notification) {
        res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: notification
      });
    } catch (error) {
      logger.error('Error getting notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve notification',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Create new notification
   */
  public createNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const notificationData = req.body;
      const notification = await this.notificationService.createNotification(notificationData);

      res.status(201).json({
        success: true,
        data: notification,
        message: 'Notification created successfully'
      });
    } catch (error) {
      logger.error('Error creating notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create notification',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Update notification
   */
  public updateNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const notification = await this.notificationService.updateNotification(id, updateData);

      res.status(200).json({
        success: true,
        data: notification,
        message: 'Notification updated successfully'
      });
    } catch (error) {
      logger.error('Error updating notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update notification',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Delete notification
   */
  public deleteNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.notificationService.deleteNotification(id);

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete notification',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Send notification
   */
  public sendNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { userIds } = req.body;

      const result = await this.notificationService.sendNotification(id, userIds);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Notification sent successfully'
      });
    } catch (error) {
      logger.error('Error sending notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send notification',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Schedule notification
   */
  public scheduleNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { sendDate } = req.body;

      const notification = await this.notificationService.scheduleNotification(id, new Date(sendDate));

      res.status(200).json({
        success: true,
        data: notification,
        message: 'Notification scheduled successfully'
      });
    } catch (error) {
      logger.error('Error scheduling notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to schedule notification',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get user notifications
   */
  public getUserNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const {
        page = 1,
        limit = 20,
        status,
        type
      } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        type: type as string
      };

      const result = await this.notificationService.getUserNotifications(userId, filters);
      
      res.status(200).json({
        success: true,
        data: result.notifications,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages
        }
      });
    } catch (error) {
      logger.error('Error getting user notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user notifications',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Mark notification as read
   */
  public markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      await this.notificationService.markAsRead(id, userId);

      res.status(200).json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get notification statistics
   */
  public getNotificationStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { period = '30d' } = req.query;
      
      const stats = await this.notificationService.getNotificationStatistics(period as string);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting notification statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve notification statistics',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Create system notification
   */
  public createSystemNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, message, type, priority } = req.body;

      const notification = await this.notificationService.createSystemNotification(
        title,
        message,
        type,
        priority
      );

      res.status(201).json({
        success: true,
        data: notification,
        message: 'System notification created and sent successfully'
      });
    } catch (error) {
      logger.error('Error creating system notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create system notification',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Process scheduled notifications (cron job endpoint)
   */
  public processScheduledNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.notificationService.processScheduledNotifications();

      res.status(200).json({
        success: true,
        data: result,
        message: 'Scheduled notifications processed successfully'
      });
    } catch (error) {
      logger.error('Error processing scheduled notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process scheduled notifications',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };
}

export default NotificationController;

