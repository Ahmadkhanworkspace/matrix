import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/types';
import * as Joi from 'joi';

export class ValidationMiddleware {
  /**
   * Validate request body using Joi schema
   */
  static validateBody(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const { error, value } = schema.validate(req.body, {
          abortEarly: false,
          stripUnknown: true
        });

        if (error) {
          const errorDetails = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }));

          logger.warn('Validation error:', {
            path: req.path,
            method: req.method,
            errors: errorDetails
          });

          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errorDetails
          } as ApiResponse);
        }

        // Replace request body with validated data
        req.body = value;
        next();
      } catch (error) {
        logger.error('Validation middleware error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        } as ApiResponse);
      }
    };
  }

  /**
   * Validate request query parameters using Joi schema
   */
  static validateQuery(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const { error, value } = schema.validate(req.query, {
          abortEarly: false,
          stripUnknown: true
        });

        if (error) {
          const errorDetails = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }));

          logger.warn('Query validation error:', {
            path: req.path,
            method: req.method,
            errors: errorDetails
          });

          return res.status(400).json({
            success: false,
            message: 'Query validation failed',
            errors: errorDetails
          } as ApiResponse);
        }

        // Replace request query with validated data
        req.query = value;
        next();
      } catch (error) {
        logger.error('Query validation middleware error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        } as ApiResponse);
      }
    };
  }

  /**
   * Validate request parameters using Joi schema
   */
  static validateParams(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const { error, value } = schema.validate(req.params, {
          abortEarly: false,
          stripUnknown: true
        });

        if (error) {
          const errorDetails = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }));

          logger.warn('Params validation error:', {
            path: req.path,
            method: req.method,
            errors: errorDetails
          });

          return res.status(400).json({
            success: false,
            message: 'Parameter validation failed',
            errors: errorDetails
          } as ApiResponse);
        }

        // Replace request params with validated data
        req.params = value;
        next();
      } catch (error) {
        logger.error('Params validation middleware error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        } as ApiResponse);
      }
    };
  }

  /**
   * Validate request headers using Joi schema
   */
  static validateHeaders(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const { error, value } = schema.validate(req.headers, {
          abortEarly: false,
          stripUnknown: true
        });

        if (error) {
          const errorDetails = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }));

          logger.warn('Headers validation error:', {
            path: req.path,
            method: req.method,
            errors: errorDetails
          });

          return res.status(400).json({
            success: false,
            message: 'Headers validation failed',
            errors: errorDetails
          } as ApiResponse);
        }

        // Replace request headers with validated data
        req.headers = value;
        next();
      } catch (error) {
        logger.error('Headers validation middleware error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        } as ApiResponse);
      }
    };
  }

  /**
   * Custom validation for specific fields
   */
  static validateField(field: string, schema: Joi.Schema) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const value = req.body[field] || req.query[field] || req.params[field];
        
        if (value === undefined) {
          return next(); // Field is optional
        }

        const { error } = schema.validate(value);

        if (error) {
          logger.warn('Field validation error:', {
            field,
            path: req.path,
            method: req.method,
            error: error.message
          });

          return res.status(400).json({
            success: false,
            message: `Validation failed for field: ${field}`,
            error: error.message
          } as ApiResponse);
        }

        next();
      } catch (error) {
        logger.error('Field validation middleware error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        } as ApiResponse);
      }
    };
  }

  /**
   * Validate file upload
   */
  static validateFile(fieldName: string, maxSize: number, allowedTypes: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const file = req.file || req.files?.[fieldName];

        if (!file) {
          return res.status(400).json({
            success: false,
            message: `File field '${fieldName}' is required`
          } as ApiResponse);
        }

        // Check file size
        if (file.size > maxSize) {
          return res.status(400).json({
            success: false,
            message: `File size exceeds maximum allowed size of ${maxSize} bytes`
          } as ApiResponse);
        }

        // Check file type
        const fileType = file.mimetype || file.type;
        if (!allowedTypes.includes(fileType)) {
          return res.status(400).json({
            success: false,
            message: `File type '${fileType}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`
          } as ApiResponse);
        }

        next();
      } catch (error) {
        logger.error('File validation middleware error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        } as ApiResponse);
      }
    };
  }

  /**
   * Sanitize request data
   */
  static sanitizeData() {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        // Sanitize body
        if (req.body) {
          req.body = this.sanitizeObject(req.body);
        }

        // Sanitize query
        if (req.query) {
          req.query = this.sanitizeObject(req.query);
        }

        // Sanitize params
        if (req.params) {
          req.params = this.sanitizeObject(req.params);
        }

        next();
      } catch (error) {
        logger.error('Sanitization middleware error:', error);
        next();
      }
    };
  }

  /**
   * Sanitize object recursively
   */
  private static sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Remove HTML tags and trim whitespace
        sanitized[key] = value.replace(/<[^>]*>/g, '').trim();
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Validate pagination parameters
   */
  static validatePagination() {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        if (page < 1) {
          return res.status(400).json({
            success: false,
            message: 'Page number must be greater than 0'
          } as ApiResponse);
        }

        if (limit < 1 || limit > 100) {
          return res.status(400).json({
            success: false,
            message: 'Limit must be between 1 and 100'
          } as ApiResponse);
        }

        req.query.page = page.toString();
        req.query.limit = limit.toString();

        next();
      } catch (error) {
        logger.error('Pagination validation error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        } as ApiResponse);
      }
    };
  }

  /**
   * Validate date range parameters
   */
  static validateDateRange() {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const { dateFrom, dateTo } = req.query;

        if (dateFrom) {
          const fromDate = new Date(dateFrom as string);
          if (isNaN(fromDate.getTime())) {
            return res.status(400).json({
              success: false,
              message: 'Invalid dateFrom format'
            } as ApiResponse);
          }
        }

        if (dateTo) {
          const toDate = new Date(dateTo as string);
          if (isNaN(toDate.getTime())) {
            return res.status(400).json({
              success: false,
              message: 'Invalid dateTo format'
            } as ApiResponse);
          }
        }

        if (dateFrom && dateTo) {
          const fromDate = new Date(dateFrom as string);
          const toDate = new Date(dateTo as string);

          if (fromDate > toDate) {
            return res.status(400).json({
              success: false,
              message: 'dateFrom cannot be after dateTo'
            } as ApiResponse);
          }
        }

        next();
      } catch (error) {
        logger.error('Date range validation error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        } as ApiResponse);
      }
    };
  }
} 