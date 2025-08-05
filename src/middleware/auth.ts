import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { AuthService } from '@/services/AuthService';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Verify JWT access token
   */
  async verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Access token required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify token
      const decoded = this.authService.verifyAccessToken(token) as any;
      
      if (!decoded || decoded.type !== 'access') {
        res.status(401).json({
          success: false,
          message: 'Invalid access token',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check if user exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          email: true,
          status: true,
          isActive: true,
          emailVerified: true
        }
      });

      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          message: 'User not found or inactive',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Add user to request
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: 'user'
      };

      next();
    } catch (error) {
      logger.error('Token verification error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Verify admin access
   */
  async verifyAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // First verify token
      await this.verifyToken(req, res, (err) => {
        if (err) return next(err);
      });

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check if user is admin (you can implement your own admin logic)
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          username: true,
          email: true,
          status: true,
          isActive: true
        }
      });

      // For now, we'll use a simple check - you can implement more sophisticated admin logic
      const isAdmin = user?.email?.includes('admin') || user?.username?.includes('admin');
      
      if (!isAdmin) {
        res.status(403).json({
          success: false,
          message: 'Admin access required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Update user role to admin
      req.user.role = 'admin';

      next();
    } catch (error) {
      logger.error('Admin verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Authentication error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Optional authentication (doesn't fail if no token)
   */
  async optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(); // Continue without authentication
      }

      const token = authHeader.substring(7);

      try {
        const decoded = this.authService.verifyAccessToken(token) as any;
        
        if (decoded && decoded.type === 'access') {
          const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
              id: true,
              username: true,
              email: true,
              status: true,
              isActive: true
            }
          });

          if (user && user.isActive) {
            req.user = {
              id: user.id,
              username: user.username,
              email: user.email,
              role: 'user'
            };
          }
        }
      } catch (error) {
        // Token is invalid, but we don't fail the request
        logger.warn('Invalid token in optional auth:', error);
      }

      next();
    } catch (error) {
      logger.error('Optional auth error:', error);
      next(); // Continue even if there's an error
    }
  }

  /**
   * Rate limiting middleware
   */
  rateLimit(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
    const requests = new Map<string, { count: number; resetTime: number }>();

    return (req: Request, res: Response, next: NextFunction): void => {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const now = Date.now();

      const userRequests = requests.get(ip);
      
      if (!userRequests || now > userRequests.resetTime) {
        requests.set(ip, { count: 1, resetTime: now + windowMs });
      } else {
        userRequests.count++;
        
        if (userRequests.count > maxRequests) {
          res.status(429).json({
            success: false,
            message: 'Too many requests',
            timestamp: new Date().toISOString()
          });
          return;
        }
      }

      next();
    };
  }

  /**
   * Check if user has verified email
   */
  async requireEmailVerification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { emailVerified: true }
      });

      if (!user?.emailVerified) {
        res.status(403).json({
          success: false,
          message: 'Email verification required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Email verification check error:', error);
      res.status(500).json({
        success: false,
        message: 'Authentication error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Check if user has active status
   */
  async requireActiveStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { status: true, isActive: true }
      });

      if (!user?.isActive || user.status !== 'ACTIVE') {
        res.status(403).json({
          success: false,
          message: 'Account is not active',
          timestamp: new Date().toISOString()
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Active status check error:', error);
      res.status(500).json({
        success: false,
        message: 'Authentication error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Log user activity
   */
  logActivity(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    if (req.user) {
      logger.info(`User ${req.user.username} (${req.user.id}) accessed ${req.method} ${req.path}`);
    }
    next();
  }
}

// Export middleware instances
export const authMiddleware = new AuthMiddleware();
export const verifyToken = authMiddleware.verifyToken.bind(authMiddleware);
export const verifyAdmin = authMiddleware.verifyAdmin.bind(authMiddleware);
export const optionalAuth = authMiddleware.optionalAuth.bind(authMiddleware);
export const requireEmailVerification = authMiddleware.requireEmailVerification.bind(authMiddleware);
export const requireActiveStatus = authMiddleware.requireActiveStatus.bind(authMiddleware);
export const logActivity = authMiddleware.logActivity.bind(authMiddleware);
export const rateLimit = authMiddleware.rateLimit.bind(authMiddleware); 