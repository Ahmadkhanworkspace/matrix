import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/types';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

export class ErrorHandler {
  /**
   * Global error handler middleware
   */
  static handleError(err: AppError, req: Request, res: Response, next: NextFunction): void {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Log error
    logger.error('Error occurred:', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id
    });

    // Handle specific error types
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation Error';
    } else if (err.name === 'CastError') {
      statusCode = 400;
      message = 'Invalid ID format';
    } else if (err.code === 'P2002') {
      statusCode = 409;
      message = 'Duplicate entry';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    } else if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
    } else if (err.name === 'UnauthorizedError') {
      statusCode = 401;
      message = 'Unauthorized';
    } else if (err.name === 'ForbiddenError') {
      statusCode = 403;
      message = 'Forbidden';
    } else if (err.name === 'NotFoundError') {
      statusCode = 404;
      message = 'Resource not found';
    } else if (err.name === 'ConflictError') {
      statusCode = 409;
      message = 'Resource conflict';
    } else if (err.name === 'RateLimitError') {
      statusCode = 429;
      message = 'Too many requests';
    }

    // Don't leak error details in production
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
      message = 'Internal Server Error';
    }

    const errorResponse: ApiResponse = {
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && {
        error: err.message,
        stack: err.stack
      })
    };

    res.status(statusCode).json(errorResponse);
  }

  /**
   * Handle 404 errors
   */
  static handleNotFound(req: Request, res: Response, next: NextFunction): void {
    const error = new Error(`Route ${req.originalUrl} not found`) as AppError;
    error.statusCode = 404;
    error.name = 'NotFoundError';
    next(error);
  }

  /**
   * Handle async errors
   */
  static catchAsync(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Create custom error
   */
  static createError(message: string, statusCode: number = 500, isOperational: boolean = true): AppError {
    const error = new Error(message) as AppError;
    error.statusCode = statusCode;
    error.isOperational = isOperational;
    return error;
  }

  /**
   * Handle unhandled promise rejections
   */
  static handleUnhandledRejection(reason: any, promise: Promise<any>): void {
    logger.error('Unhandled Promise Rejection:', {
      reason: reason?.message || reason,
      stack: reason?.stack,
      promise
    });

    // In production, you might want to exit the process
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  /**
   * Handle uncaught exceptions
   */
  static handleUncaughtException(error: Error): void {
    logger.error('Uncaught Exception:', {
      error: error.message,
      stack: error.stack
    });

    // In production, you might want to exit the process
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  /**
   * Handle database errors
   */
  static handleDatabaseError(error: any): AppError {
    if (error.code === 'P2002') {
      const error = this.createError('Duplicate entry', 409);
      error.name = 'ValidationError';
      return error;
    }

    if (error.code === 'P2025') {
      const error = this.createError('Record not found', 404);
      error.name = 'NotFoundError';
      return error;
    }

    if (error.code === 'P2003') {
      const error = this.createError('Foreign key constraint failed', 400);
      error.name = 'ValidationError';
      return error;
    }

    return this.createError('Database error', 500);
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(error: any): AppError {
    const message = Object.values(error.errors)
      .map((err: any) => err.message)
      .join(', ');

    const appError = this.createError(message, 400);
    appError.name = 'ValidationError';
    return appError;
  }

  /**
   * Handle JWT errors
   */
  static handleJWTError(error: any): AppError {
    if (error.name === 'JsonWebTokenError') {
      const appError = this.createError('Invalid token', 401);
      appError.name = 'JsonWebTokenError';
      return appError;
    }

    if (error.name === 'TokenExpiredError') {
      const appError = this.createError('Token expired', 401);
      appError.name = 'TokenExpiredError';
      return appError;
    }

    return this.createError('JWT error', 401);
  }

  /**
   * Handle rate limiting errors
   */
  static handleRateLimitError(): AppError {
    const error = this.createError('Too many requests', 429);
    error.name = 'RateLimitError';
    return error;
  }

  /**
   * Handle file upload errors
   */
  static handleFileUploadError(error: any): AppError {
    if (error.code === 'LIMIT_FILE_SIZE') {
      const appError = this.createError('File too large', 400);
      appError.name = 'ValidationError';
      return appError;
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      const appError = this.createError('Too many files', 400);
      appError.name = 'ValidationError';
      return appError;
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      const appError = this.createError('Unexpected file field', 400);
      appError.name = 'ValidationError';
      return appError;
    }

    return this.createError('File upload error', 500);
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(error: any): AppError {
    if (error.code === 'ECONNREFUSED') {
      const appError = this.createError('Connection refused', 503);
      appError.name = 'NetworkError';
      return appError;
    }

    if (error.code === 'ETIMEDOUT') {
      const appError = this.createError('Request timeout', 408);
      appError.name = 'NetworkError';
      return appError;
    }

    if (error.code === 'ENOTFOUND') {
      const appError = this.createError('Host not found', 503);
      appError.name = 'NetworkError';
      return appError;
    }

    return this.createError('Network error', 500);
  }

  /**
   * Handle email errors
   */
  static handleEmailError(error: any): AppError {
    if (error.code === 'EAUTH') {
      const appError = this.createError('Email authentication failed', 500);
      appError.name = 'EmailError';
      return appError;
    }

    if (error.code === 'ECONNECTION') {
      const appError = this.createError('Email connection failed', 500);
      appError.name = 'EmailError';
      return appError;
    }

    return this.createError('Email error', 500);
  }

  /**
   * Handle payment gateway errors
   */
  static handlePaymentError(error: any): AppError {
    if (error.code === 'INSUFFICIENT_FUNDS') {
      const appError = this.createError('Insufficient funds', 400);
      appError.name = 'PaymentError';
      return appError;
    }

    if (error.code === 'INVALID_CARD') {
      const appError = this.createError('Invalid card details', 400);
      appError.name = 'PaymentError';
      return appError;
    }

    if (error.code === 'DECLINED') {
      const appError = this.createError('Payment declined', 400);
      appError.name = 'PaymentError';
      return appError;
    }

    return this.createError('Payment processing error', 500);
  }

  /**
   * Initialize error handlers
   */
  static initialize(): void {
    // Handle unhandled promise rejections
    process.on('unhandledRejection', this.handleUnhandledRejection);

    // Handle uncaught exceptions
    process.on('uncaughtException', this.handleUncaughtException);

    // Handle SIGTERM
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      process.exit(0);
    });

    // Handle SIGINT
    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      process.exit(0);
    });
  }
} 