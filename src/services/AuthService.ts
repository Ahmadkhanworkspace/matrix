import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { logger } from '@/utils/logger';

export class AuthService {
  private readonly JWT_ACCESS_SECRET: string;
  private readonly JWT_REFRESH_SECRET: string;
  private readonly JWT_VERIFICATION_SECRET: string;
  private readonly JWT_RESET_SECRET: string;

  constructor() {
    this.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret';
    this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
    this.JWT_VERIFICATION_SECRET = process.env.JWT_VERIFICATION_SECRET || 'your-verification-secret';
    this.JWT_RESET_SECRET = process.env.JWT_RESET_SECRET || 'your-reset-secret';
  }

  /**
   * Generate access token for user
   */
  generateAccessToken(userId: string): string {
    try {
      return jwt.sign(
        { userId, type: 'access' },
        this.JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
      );
    } catch (error) {
      logger.error('Error generating access token:', error);
      throw new Error('Failed to generate access token');
    }
  }

  /**
   * Generate refresh token for user
   */
  generateRefreshToken(userId: string): string {
    try {
      return jwt.sign(
        { userId, type: 'refresh' },
        this.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );
    } catch (error) {
      logger.error('Error generating refresh token:', error);
      throw new Error('Failed to generate refresh token');
    }
  }

  /**
   * Generate email verification token
   */
  generateVerificationToken(userId: string): string {
    try {
      return jwt.sign(
        { userId, type: 'verification' },
        this.JWT_VERIFICATION_SECRET,
        { expiresIn: '24h' }
      );
    } catch (error) {
      logger.error('Error generating verification token:', error);
      throw new Error('Failed to generate verification token');
    }
  }

  /**
   * Generate password reset token
   */
  generateResetToken(userId: string): string {
    try {
      return jwt.sign(
        { userId, type: 'reset' },
        this.JWT_RESET_SECRET,
        { expiresIn: '1h' }
      );
    } catch (error) {
      logger.error('Error generating reset token:', error);
      throw new Error('Failed to generate reset token');
    }
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_ACCESS_SECRET);
    } catch (error) {
      logger.error('Error verifying access token:', error);
      throw new Error('Invalid access token');
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_REFRESH_SECRET);
    } catch (error) {
      logger.error('Error verifying refresh token:', error);
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Verify verification token
   */
  verifyVerificationToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_VERIFICATION_SECRET);
    } catch (error) {
      logger.error('Error verifying verification token:', error);
      throw new Error('Invalid verification token');
    }
  }

  /**
   * Verify reset token
   */
  verifyResetToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_RESET_SECRET);
    } catch (error) {
      logger.error('Error verifying reset token:', error);
      throw new Error('Invalid reset token');
    }
  }

  /**
   * Hash password
   */
  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, 12);
    } catch (error) {
      logger.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Compare password with hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      logger.error('Error comparing password:', error);
      throw new Error('Failed to compare password');
    }
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generate random token
   */
  generateRandomToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Decode JWT token without verification (for logging)
   */
  decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      logger.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Get token expiration time
   */
  getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      logger.error('Error getting token expiration:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return true;
    return new Date() > expiration;
  }
} 