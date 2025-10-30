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
  (ValidationMiddleware as any).validateNotification(),
  notificationController.createNotification
);
router.put('/:id', 
  verifyAdmin,
  (ValidationMiddleware as any).validateNotificationUpdate(),
  notificationController.updateNotification
);
router.delete('/:id', verifyAdmin, notificationController.deleteNotification);
router.post('/:id/send', 
  verifyAdmin,
  (ValidationMiddleware as any).validateNotificationSend(),
  notificationController.sendNotification
);
router.post('/:id/schedule', 
  verifyAdmin,
  (ValidationMiddleware as any).validateNotificationSchedule(),
  notificationController.scheduleNotification
);
router.post('/system', 
  verifyAdmin,
  (ValidationMiddleware as any).validateSystemNotification(),
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
  (ValidationMiddleware as any).validateMarkAsRead(),
  notificationController.markAsRead
);

export default router;

