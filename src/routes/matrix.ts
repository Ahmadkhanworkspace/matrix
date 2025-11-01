import { Router } from 'express';
import { MatrixController } from '@/controllers/MatrixController';
import { verifyToken, verifyAdmin } from '@/middleware/auth';
import { ValidationMiddleware } from '@/middleware/validation';
import { ErrorHandler } from '@/middleware/errorHandler';
import {
  matrixPositionSchema,
  paginationSchema
} from '@/utils/validationSchemas';
import * as Joi from 'joi';

const router = Router();
const matrixController = new MatrixController();

// Apply validation and error handling middleware
const validateBody = ValidationMiddleware.validateBody;
const validateQuery = ValidationMiddleware.validateQuery;
const validateParams = ValidationMiddleware.validateParams;
const catchAsync = ErrorHandler.catchAsync;

/**
 * @route   GET /api/matrix/overview
 * @desc    Get matrix overview for user
 * @access  Private
 */
router.get(
  '/overview',
  verifyToken,
  catchAsync(matrixController.getMatrixOverview.bind(matrixController))
);

/**
 * @route   GET /api/matrix/genealogy
 * @desc    Get matrix genealogy
 * @access  Private
 */
router.get(
  '/genealogy',
  verifyToken,
  catchAsync(matrixController.getMatrixGenealogy.bind(matrixController))
);

/**
 * @route   GET /api/matrix/statistics
 * @desc    Get matrix statistics
 * @access  Private
 */
router.get(
  '/statistics',
  verifyToken,
  catchAsync(matrixController.getMatrixStatistics.bind(matrixController))
);

/**
 * @route   GET /api/matrix/positions
 * @desc    Get user matrix positions
 * @access  Private
 */
router.get(
  '/positions',
  verifyToken,
  validateQuery(paginationSchema),
  catchAsync(matrixController.getMatrixPositions.bind(matrixController))
);

/**
 * @route   GET /api/matrix/levels
 * @desc    Get matrix levels
 * @access  Private
 */
router.get(
  '/levels',
  validateQuery(paginationSchema),
  catchAsync(matrixController.getMatrixLevels.bind(matrixController))
);

/**
 * @route   GET /api/matrix/config
 * @desc    Get matrix configuration
 * @access  Public
 */
router.get(
  '/config',
  catchAsync(matrixController.getMatrixConfig.bind(matrixController))
);

/**
 * @route   GET /api/matrix/levels/:level
 * @desc    Get matrix level details
 * @access  Private
 */
router.get(
  '/levels/:level',
  validateParams(Joi.object({
    level: Joi.number().integer().min(1).required()
  })),
  catchAsync(matrixController.getMatrixLevelDetails.bind(matrixController))
);

/**
 * @route   POST /api/matrix/purchase-position
 * @desc    Purchase matrix position (create verifier entry)
 * @access  Private
 */
router.post(
  '/purchase-position',
  verifyToken,
  validateBody(Joi.object({
    matrixLevel: Joi.number().integer().min(1).required(),
    sponsor: Joi.string().optional(),
    entryType: Joi.number().integer().default(1) // 1=normal, 2=re-entry, 3=cross-entry
  })),
  catchAsync(matrixController.purchasePosition.bind(matrixController))
);

/**
 * @route   GET /api/matrix/levels/:level/positions
 * @desc    Get available positions in matrix level
 * @access  Private
 */
router.get(
  '/levels/:level/positions',
  validateParams(Joi.object({
    level: Joi.number().integer().min(1).required()
  })),
  catchAsync(matrixController.getAvailablePositions.bind(matrixController))
);

/**
 * @route   GET /api/matrix/levels/:level/cycle-status
 * @desc    Get matrix cycle completion status
 * @access  Private
 */
router.get(
  '/levels/:level/cycle-status',
  validateParams(Joi.object({
    level: Joi.number().integer().min(1).required()
  })),
  catchAsync(matrixController.getCycleStatus.bind(matrixController))
);

// Admin routes
/**
 * @route   POST /api/matrix/place-user
 * @desc    Place user in matrix (admin only)
 * @access  Private (Admin)
 */
router.post(
  '/place-user',
  verifyAdmin,
  validateBody(matrixPositionSchema),
  catchAsync(matrixController.placeUserInMatrix.bind(matrixController))
);

/**
 * @route   POST /api/matrix/force-placement
 * @desc    Force placement (admin only)
 * @access  Private (Admin)
 */
router.post(
  '/force-placement',
  verifyAdmin,
  validateBody(Joi.object({
    userId: Joi.string().required(),
    positionId: Joi.string().required(),
    matrixLevel: Joi.number().integer().min(1).required()
  })),
  catchAsync(matrixController.forcePlacement.bind(matrixController))
);

/**
 * @route   GET /api/matrix/admin/statistics
 * @desc    Get matrix statistics for admin
 * @access  Private (Admin)
 */
router.get(
  '/admin/statistics',
  verifyAdmin,
  catchAsync(matrixController.getAdminMatrixStatistics.bind(matrixController))
);

export default router; 