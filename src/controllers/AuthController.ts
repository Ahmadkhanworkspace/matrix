import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/types';
import { AuthService } from '@/services/AuthService';
import { EmailService } from '@/services/EmailService';

export class AuthController {
  private authService: AuthService;
  private emailService: EmailService;

  constructor() {
    this.authService = new AuthService();
    this.emailService = new EmailService();
  }

  // POST /api/auth/register
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, firstName, lastName, sponsorId } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { username }
          ]
        }
      });

      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'User with this email or username already exists',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          firstName,
          lastName,
          sponsorId,
          status: 'PENDING',
          memberType: 'FREE'
        }
      });

      // Generate verification token
      const verificationToken = this.authService.generateVerificationToken(user.id);

      // Send verification email
      await this.emailService.sendVerificationEmail(user.email, verificationToken);

      const response: ApiResponse = {
        success: true,
        message: 'User registered successfully. Please check your email for verification.',
        data: {
          userId: user.id,
          email: user.email,
          status: user.status
        },
        timestamp: new Date().toISOString()
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Error in user registration:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register user',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  // POST /api/auth/login
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Account is suspended',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Generate tokens
      const accessToken = this.authService.generateAccessToken(user.id);
      const refreshToken = this.authService.generateRefreshToken(user.id);

      // Create session
      await prisma.session.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      });

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            status: user.status,
            memberType: user.memberType
          },
          tokens: {
            accessToken,
            refreshToken
          }
        },
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error in user login:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to login',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  // POST /api/auth/logout
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        // Delete session
        await prisma.session.deleteMany({
          where: { token: refreshToken }
        });
      }

      const response: ApiResponse = {
        success: true,
        message: 'Logout successful',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error in user logout:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to logout',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  // POST /api/auth/refresh
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      
      // Check if session exists
      const session = await prisma.session.findFirst({
        where: {
          token: refreshToken,
          expiresAt: { gt: new Date() }
        }
      });

      if (!session) {
        res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Generate new tokens
      const newAccessToken = this.authService.generateAccessToken(decoded.userId);
      const newRefreshToken = this.authService.generateRefreshToken(decoded.userId);

      // Update session
      await prisma.session.update({
        where: { id: session.id },
        data: {
          token: newRefreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        },
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error refreshing token:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        timestamp: new Date().toISOString()
      });
    }
  }

  // POST /api/auth/forgot-password
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Generate reset token
      const resetToken = this.authService.generateResetToken(user.id);

      // Send reset email
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);

      const response: ApiResponse = {
        success: true,
        message: 'Password reset email sent',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error in forgot password:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send reset email',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  // POST /api/auth/reset-password
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;

      // Verify reset token
      const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET!) as any;

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Update user password
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { password: hashedPassword }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Password reset successfully',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error in reset password:', error);
      res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/auth/verify-email/:token
  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      // Verify email token
      const decoded = jwt.verify(token, process.env.JWT_VERIFICATION_SECRET!) as any;

      // Update user status
      await prisma.user.update({
        where: { id: decoded.userId },
        data: {
          emailVerified: true,
          status: 'ACTIVE'
        }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Email verified successfully',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error in email verification:', error);
      res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
        timestamp: new Date().toISOString()
      });
    }
  }

  // POST /api/auth/resend-verification
  async resendVerification(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (user.emailVerified) {
        res.status(400).json({
          success: false,
          message: 'Email already verified',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Generate new verification token
      const verificationToken = this.authService.generateVerificationToken(user.id);

      // Send verification email
      await this.emailService.sendVerificationEmail(user.email, verificationToken);

      const response: ApiResponse = {
        success: true,
        message: 'Verification email sent',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error resending verification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/auth/me
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          status: true,
          memberType: true,
          emailVerified: true,
          lastLogin: true,
          createdAt: true,
          firstName: true,
          lastName: true
        }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: user,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting current user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get current user',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
} 