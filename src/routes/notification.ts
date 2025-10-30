import express from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { verifyAdmin, verifyToken } from '../middleware/auth';
import { ValidationMiddleware } from '../middleware/validation';

const router = express.Router();
const notificationController = new NotificationController();

// Admin routes (require admin authentication)
router.get('/', verifyAdmin, notificationController.getNotifications);
router.get('/stats', verifyAdmin, notificationController.getNotificationStats);
router.get('/:id', verifyAdmin, notificationController.getNotification);
router.post('/', 
  verifyAdmin,
  ValidationMiddleware.validateNotification(),
  notificationController.createNotification
);
router.put('/:id', 
  verifyAdmin,
  ValidationMiddleware.validateNotificationUpdate(),
  notificationController.updateNotification
);
router.delete('/:id', verifyAdmin, notificationController.deleteNotification);
router.post('/:id/send', 
  verifyAdmin,
  ValidationMiddleware.validateNotificationSend(),
  notificationController.sendNotification
);
router.post('/:id/schedule', 
  verifyAdmin,
  ValidationMiddleware.validateNotificationSchedule(),
  notificationController.scheduleNotification
);
router.post('/system', 
  verifyAdmin,
  ValidationMiddleware.validateSystemNotification(),
  notificationController.createSystemNotification
);
router.post('/process-scheduled', 
  verifyAdmin,
  notificationController.processScheduledNotifications
);

// User routes (require user authentication)
router.get('/user/:userId', verifyToken, notificationController.getUserNotifications);
router.post('/:id/read', 
  verifyToken,
  ValidationMiddleware.validateMarkAsRead(),
  notificationController.markAsRead
);

export default router;

