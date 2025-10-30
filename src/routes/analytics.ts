import express from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { verifyAdmin } from '../middleware/auth';

const router = express.Router();
const analyticsController = new AnalyticsController();

// Apply admin authentication to all routes
router.use(verifyAdmin);

// Dashboard analytics
router.get('/dashboard', analyticsController.getDashboardAnalytics);

// Individual analytics endpoints
router.get('/members', analyticsController.getMemberAnalytics);
router.get('/financial', analyticsController.getFinancialAnalytics);
router.get('/matrix', analyticsController.getMatrixAnalytics);
router.get('/bonus', analyticsController.getBonusAnalytics);
router.get('/system', analyticsController.getSystemAnalytics);

// Chart data endpoints
router.get('/charts/:chartType', analyticsController.getChartData);

// Report generation
router.get('/reports/:reportType', analyticsController.generateReport);

// Real-time analytics
router.get('/realtime', analyticsController.getRealTimeAnalytics);

// Export analytics
router.get('/export', analyticsController.exportAnalytics);

export default router;

