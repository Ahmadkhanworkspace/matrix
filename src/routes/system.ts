import { Router } from 'express';
import SystemController from '../controllers/SystemController';
import { verifyAdmin } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, query } from 'express-validator';

const router = Router();
const systemController = new SystemController();

// Apply admin authentication to all routes
router.use(verifyAdmin);

// System health endpoints
router.get('/health', systemController.getSystemHealth);
router.get('/server-info', systemController.getServerInfo);
router.get('/metrics', systemController.getMetrics);
router.get('/test-db', systemController.testDatabaseConnection);

// System logs endpoints
router.get('/logs', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('level').optional().isIn(['info', 'warn', 'error', 'debug']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  validateRequest
], systemController.getSystemLogs);

router.delete('/logs', [
  body('olderThan').notEmpty().isISO8601().withMessage('Valid date is required'),
  validateRequest
], systemController.clearLogs);

// Backup endpoints
router.get('/backups', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('type').optional().isIn(['database', 'files', 'full']),
  query('status').optional().isIn(['pending', 'in_progress', 'completed', 'failed']),
  validateRequest
], systemController.getBackupHistory);

router.post('/backups', [
  body('type').optional().isIn(['database', 'files', 'full']),
  validateRequest
], systemController.createBackup);

// Configuration endpoints
router.get('/config', systemController.getSystemConfig);

router.put('/config', [
  body('key').notEmpty().withMessage('Configuration key is required'),
  body('value').exists().withMessage('Configuration value is required'),
  body('description').optional().isString(),
  validateRequest
], systemController.updateSystemConfig);

// Statistics endpoint
router.get('/stats', systemController.getSystemStats);

// System control endpoints
router.post('/restart', systemController.restartApplication);
router.post('/clear-cache', systemController.clearCache);

export default router;

