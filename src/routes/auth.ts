import { Router } from 'express';
import { AuthController } from '@/controllers/AuthController';
import { verifyToken } from '@/middleware/auth';
import { ValidationMiddleware } from '@/middleware/validation';
import { ErrorHandler } from '@/middleware/errorHandler';
import {
  registerSchema,
  loginSchema,
  passwordResetSchema,
  forgotPasswordSchema,
  resendVerificationSchema
} from '@/utils/validationSchemas';

const router = Router();
const authController = new AuthController();

// Apply validation and error handling middleware
const validateBody = ValidationMiddleware.validateBody;
const catchAsync = ErrorHandler.catchAsync;

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  validateBody(registerSchema),
  catchAsync(authController.register.bind(authController))
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  validateBody(loginSchema),
  catchAsync(authController.login.bind(authController))
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post(
  '/logout',
  verifyToken,
  catchAsync(authController.logout.bind(authController))
);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh-token',
  catchAsync(authController.refreshToken.bind(authController))
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post(
  '/forgot-password',
  validateBody(forgotPasswordSchema),
  catchAsync(authController.forgotPassword.bind(authController))
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  validateBody(passwordResetSchema),
  catchAsync(authController.resetPassword.bind(authController))
);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.post(
  '/verify-email',
  catchAsync(authController.verifyEmail.bind(authController))
);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Public
 */
router.post(
  '/resend-verification',
  validateBody(resendVerificationSchema),
  catchAsync(authController.resendVerification.bind(authController))
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get(
  '/me',
  verifyToken,
  catchAsync(authController.getCurrentUser.bind(authController))
);

export default router; 