import { Router } from 'express';
import { PaymentController } from '@/controllers/PaymentController';
import { verifyToken } from '@/middleware/auth';
import { ValidationMiddleware } from '@/middleware/validation';
import { ErrorHandler } from '@/middleware/errorHandler';
import {
  paymentSchema,
  withdrawalSchema,
  paginationSchema,
  dateRangeSchema
} from '@/utils/validationSchemas';
import * as Joi from 'joi';

const router = Router();
const paymentController = new PaymentController();

// Apply validation and error handling middleware
const validateBody = ValidationMiddleware.validateBody;
const validateQuery = ValidationMiddleware.validateQuery;
const validateParams = ValidationMiddleware.validateParams;
const catchAsync = ErrorHandler.catchAsync;

/**
 * @route   POST /api/payment/process
 * @desc    Process payment
 * @access  Private
 */
router.post(
  '/process',
  verifyToken,
  validateBody(paymentSchema),
  catchAsync(paymentController.processPayment.bind(paymentController))
);

/**
 * @route   POST /api/payment/withdraw
 * @desc    Request withdrawal
 * @access  Private
 */
router.post(
  '/withdraw',
  verifyToken,
  validateBody(withdrawalSchema),
  catchAsync(paymentController.requestWithdrawal.bind(paymentController))
);

/**
 * @route   GET /api/payment/payments
 * @desc    Get user payments
 * @access  Private
 */
router.get(
  '/payments',
  verifyToken,
  validateQuery(paginationSchema),
  ValidationMiddleware.validateDateRange(),
  catchAsync(paymentController.getUserPayments.bind(paymentController))
);

/**
 * @route   GET /api/payment/withdrawals
 * @desc    Get user withdrawals
 * @access  Private
 */
router.get(
  '/withdrawals',
  verifyToken,
  validateQuery(paginationSchema),
  ValidationMiddleware.validateDateRange(),
  catchAsync(paymentController.getUserWithdrawals.bind(paymentController))
);

/**
 * @route   GET /api/payment/currencies
 * @desc    Get available currencies
 * @access  Public
 */
router.get(
  '/currencies',
  catchAsync(paymentController.getCurrencies.bind(paymentController))
);

/**
 * @route   GET /api/payment/gateways
 * @desc    Get payment gateways
 * @access  Public
 */
router.get(
  '/gateways',
  catchAsync(paymentController.getPaymentGateways.bind(paymentController))
);

/**
 * @route   GET /api/payment/statistics
 * @desc    Get payment statistics
 * @access  Private
 */
router.get(
  '/statistics',
  verifyToken,
  catchAsync(paymentController.getPaymentStatistics.bind(paymentController))
);

/**
 * @route   POST /api/payment/withdrawals/:withdrawalId/cancel
 * @desc    Cancel withdrawal request
 * @access  Private
 */
router.post(
  '/withdrawals/:withdrawalId/cancel',
  verifyToken,
  validateParams(Joi.object({
    withdrawalId: Joi.string().required()
  })),
  catchAsync(paymentController.cancelWithdrawal.bind(paymentController))
);

export default router; 