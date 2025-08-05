import nodemailer from 'nodemailer';
import { logger } from '@/utils/logger';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    });
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
      
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@matrixmlm.com',
        to: email,
        subject: 'Verify Your Email - Matrix MLM',
        html: this.getVerificationEmailTemplate(verificationUrl)
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
      
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@matrixmlm.com',
        to: email,
        subject: 'Reset Your Password - Matrix MLM',
        html: this.getPasswordResetEmailTemplate(resetUrl)
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, username: string): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@matrixmlm.com',
        to: email,
        subject: 'Welcome to Matrix MLM!',
        html: this.getWelcomeEmailTemplate(username)
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  /**
   * Send matrix bonus notification
   */
  async sendMatrixBonusNotification(email: string, amount: number, level: number): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@matrixmlm.com',
        to: email,
        subject: 'Matrix Bonus Earned!',
        html: this.getMatrixBonusEmailTemplate(amount, level)
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Matrix bonus notification sent to ${email}`);
    } catch (error) {
      logger.error('Error sending matrix bonus notification:', error);
      throw new Error('Failed to send matrix bonus notification');
    }
  }

  /**
   * Send payment confirmation
   */
  async sendPaymentConfirmation(email: string, amount: number, currency: string): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@matrixmlm.com',
        to: email,
        subject: 'Payment Confirmed - Matrix MLM',
        html: this.getPaymentConfirmationTemplate(amount, currency)
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Payment confirmation sent to ${email}`);
    } catch (error) {
      logger.error('Error sending payment confirmation:', error);
      throw new Error('Failed to send payment confirmation');
    }
  }

  /**
   * Send withdrawal notification
   */
  async sendWithdrawalNotification(email: string, amount: number, currency: string): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@matrixmlm.com',
        to: email,
        subject: 'Withdrawal Request - Matrix MLM',
        html: this.getWithdrawalNotificationTemplate(amount, currency)
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Withdrawal notification sent to ${email}`);
    } catch (error) {
      logger.error('Error sending withdrawal notification:', error);
      throw new Error('Failed to send withdrawal notification');
    }
  }

  /**
   * Send general notification
   */
  async sendNotification(email: string, subject: string, message: string): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@matrixmlm.com',
        to: email,
        subject,
        html: this.getGeneralNotificationTemplate(message)
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`General notification sent to ${email}`);
    } catch (error) {
      logger.error('Error sending general notification:', error);
      throw new Error('Failed to send general notification');
    }
  }

  /**
   * Email templates
   */
  private getVerificationEmailTemplate(verificationUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Matrix MLM!</h2>
        <p>Thank you for registering with Matrix MLM. To complete your registration, please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Verify Email</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>The Matrix MLM Team</p>
      </div>
    `;
  }

  private getPasswordResetEmailTemplate(resetUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Reset Password</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The Matrix MLM Team</p>
      </div>
    `;
  }

  private getWelcomeEmailTemplate(username: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Matrix MLM, ${username}!</h2>
        <p>Congratulations on joining Matrix MLM! We're excited to have you as part of our community.</p>
        <p>Here's what you can do next:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Explore the matrix system</li>
          <li>Invite friends and earn bonuses</li>
          <li>Start building your network</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>The Matrix MLM Team</p>
      </div>
    `;
  }

  private getMatrixBonusEmailTemplate(amount: number, level: number): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Congratulations! You've Earned a Matrix Bonus!</h2>
        <p>Great news! You've completed level ${level} of your matrix and earned a bonus of $${amount}.</p>
        <p>Your earnings have been added to your account balance.</p>
        <p>Keep up the great work and continue building your network!</p>
        <p>Best regards,<br>The Matrix MLM Team</p>
      </div>
    `;
  }

  private getPaymentConfirmationTemplate(amount: number, currency: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Payment Confirmed!</h2>
        <p>Your payment of ${currency} ${amount} has been successfully processed.</p>
        <p>Your account has been credited and you can now access all features.</p>
        <p>Thank you for your payment!</p>
        <p>Best regards,<br>The Matrix MLM Team</p>
      </div>
    `;
  }

  private getWithdrawalNotificationTemplate(amount: number, currency: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ffc107;">Withdrawal Request Received</h2>
        <p>Your withdrawal request for ${currency} ${amount} has been received and is being processed.</p>
        <p>You will receive another email once the withdrawal is completed.</p>
        <p>Processing time: 1-3 business days</p>
        <p>Best regards,<br>The Matrix MLM Team</p>
      </div>
    `;
  }

  private getGeneralNotificationTemplate(message: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Matrix MLM Notification</h2>
        <p>${message}</p>
        <p>Best regards,<br>The Matrix MLM Team</p>
      </div>
    `;
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('Email configuration is valid');
      return true;
    } catch (error) {
      logger.error('Email configuration error:', error);
      return false;
    }
  }
} 