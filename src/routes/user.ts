import { Router } from 'express';
import { UserController } from '@/controllers/UserController';
import { verifyToken, verifyAdmin } from '@/middleware/auth';
import { ValidationMiddleware } from '@/middleware/validation';
import { ErrorHandler } from '@/middleware/errorHandler';
import {
  userProfileSchema,
  passwordChangeSchema,
  paginationSchema,
  searchSchema,
  dateRangeSchema
} from '@/utils/validationSchemas';

const router = Router();
const userController = new UserController();

// Apply validation and error handling middleware
const validateBody = ValidationMiddleware.validateBody;
const validateQuery = ValidationMiddleware.validateQuery;
const catchAsync = ErrorHandler.catchAsync;

/**
 * @route   GET /api/user/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get(
  '/profile',
  verifyToken,
  catchAsync(userController.getProfile.bind(userController))
);

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  verifyToken,
  validateBody(userProfileSchema),
  catchAsync(userController.updateProfile.bind(userController))
);

/**
 * @route   PUT /api/user/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put(
  '/change-password',
  verifyToken,
  validateBody(passwordChangeSchema),
  catchAsync(userController.changePassword.bind(userController))
);

/**
 * @route   GET /api/user/dashboard
 * @desc    Get user dashboard data
 * @access  Private
 */
router.get(
  '/dashboard',
  verifyToken,
  catchAsync(userController.getDashboard.bind(userController))
);

/**
 * @route   GET /api/user/genealogy
 * @desc    Get user genealogy
 * @access  Private
 */
router.get(
  '/genealogy',
  verifyToken,
  catchAsync(userController.getGenealogy.bind(userController))
);

/**
 * @route   GET /api/user/referrals
 * @desc    Get user referrals
 * @access  Private
 */
router.get(
  '/referrals',
  verifyToken,
  validateQuery(paginationSchema),
  ValidationMiddleware.validateDateRange(),
  catchAsync(userController.getReferrals.bind(userController))
);

/**
 * @route   GET /api/user/transactions
 * @desc    Get user transactions
 * @access  Private
 */
router.get(
  '/transactions',
  verifyToken,
  validateQuery(paginationSchema),
  ValidationMiddleware.validateDateRange(),
  catchAsync(userController.getTransactions.bind(userController))
);

/**
 * @route   GET /api/user/bonuses
 * @desc    Get user bonuses
 * @access  Private
 */
router.get(
  '/bonuses',
  verifyToken,
  validateQuery(paginationSchema),
  ValidationMiddleware.validateDateRange(),
  catchAsync(userController.getBonuses.bind(userController))
);

/**
 * @route   GET /api/user/search
 * @desc    Search users (admin only)
 * @access  Private (Admin)
 */
router.get(
  '/search',
  verifyAdmin,
  validateQuery(searchSchema),
  validateQuery(paginationSchema),
  catchAsync(userController.searchUsers.bind(userController))
);

export default router; 