const mysql = require('mysql2/promise');
const { prisma, USE_PRISMA } = require('../config/databaseHybrid');
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  // Initialize email transporter
  async initializeTransporter() {
    try {
      // Get email settings from database
      let settings;
      if (USE_PRISMA) {
        // For now, skip email transporter initialization with Prisma
        // TODO: Implement Prisma-based system config
        console.log('⚠️  Email transporter initialization skipped - Prisma mode active');
        return;
      } else {
        const db = require('../config/database');
        const [result] = await db.execute('SELECT * FROM adminsettings LIMIT 1');
        settings = result;
      }
      
      if (settings && settings[0]) {
        const config = settings[0];
        
        if (config.mailertype === 1 && config.mailserver) {
          this.transporter = nodemailer.createTransporter({
            host: config.mailserver,
            port: config.mailport || 587,
            secure: config.sslreq === 1,
            auth: {
              user: config.mailuser,
              pass: config.mailpass
            }
          });
        }
      }
    } catch (error) {
      console.error('Error initializing email transporter:', error);
    }
  }

  // Send email
  async sendEmail(username, subject, message, format = 2) {
    try {
      // Get user email
      const [user] = await db.execute(
        'SELECT Email FROM users WHERE Username = ?',
        [username]
      );
      
      if (!user[0] || !user[0].Email) {
        throw new Error('User email not found');
      }
      
      const userEmail = user[0].Email;
      
      // Get site settings
      const [settings] = await db.execute('SELECT * FROM adminsettings LIMIT 1');
      const siteConfig = settings[0] || {};
      
      // Prepare email content
      const emailContent = format === 2 ? this.createHTMLEmail(message, siteConfig) : message;
      
      // Send email
      if (this.transporter) {
        await this.transporter.sendMail({
          from: siteConfig.Email || 'noreply@earnyourdollar.com',
          to: userEmail,
          subject: subject,
          text: format === 1 ? message : undefined,
          html: format === 2 ? emailContent : undefined
        });
        
        console.log(`Email sent to ${username} (${userEmail})`);
        return { success: true };
      } else {
        console.log(`Email would be sent to ${username}: ${subject}`);
        return { success: true, simulated: true };
      }
      
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Create HTML email template
  createHTMLEmail(message, siteConfig) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EarnYourDollar</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>EarnYourDollar</h1>
            <p>Your Matrix Earning Platform</p>
          </div>
          <div class="content">
            ${message}
            <br><br>
            <a href="${siteConfig.siteurl || 'http://localhost:3000'}" class="button">Visit Dashboard</a>
          </div>
          <div class="footer">
            <p>&copy; 2024 EarnYourDollar. All rights reserved.</p>
            <p>This email was sent from your matrix earning platform.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send welcome email
  async sendWelcomeEmail(username, matrixId) {
    try {
      const [config] = await db.execute(
        'SELECT * FROM membershiplevels WHERE ID = ?',
        [matrixId]
      );
      
      if (!config[0] || !config[0].welcomemail) return;
      
      const { Subject1, Message1, eformat1 } = config[0];
      
      if (Subject1 && Message1) {
        await this.sendEmail(username, Subject1, Message1, eformat1);
      }
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }

  // Send cycle completion email
  async sendCycleCompletionEmail(username, matrixId) {
    try {
      const [config] = await db.execute(
        'SELECT * FROM membershiplevels WHERE ID = ?',
        [matrixId]
      );
      
      if (!config[0] || !config[0].cyclemail) return;
      
      const { Subject2, Message2, eformat2 } = config[0];
      
      if (Subject2 && Message2) {
        await this.sendEmail(username, Subject2, Message2, eformat2);
      }
    } catch (error) {
      console.error('Error sending cycle completion email:', error);
    }
  }

  // Send sponsor notification email
  async sendSponsorNotificationEmail(sponsor, username, matrixId) {
    try {
      const [config] = await db.execute(
        'SELECT * FROM membershiplevels WHERE ID = ?',
        [matrixId]
      );
      
      if (!config[0] || !config[0].cyclemailsponsor) return;
      
      const { Subject3, Message3, eformat3 } = config[0];
      
      if (Subject3 && Message3) {
        // Replace placeholders in message
        const personalizedMessage = Message3
          .replace('{username}', username)
          .replace('{sponsor}', sponsor);
        
        await this.sendEmail(sponsor, Subject3, personalizedMessage, eformat3);
      }
    } catch (error) {
      console.error('Error sending sponsor notification email:', error);
    }
  }

  // Send joining/welcome email
  async sendJoiningEmail(username, email, firstName = '', sponsorUsername = '') {
    const subject = 'Welcome to Matrix MLM - Get Started Today!';
    const name = firstName || username;
    const message = `
      <h2>Welcome ${name}!</h2>
      <p>Thank you for joining Matrix MLM! We're excited to have you as part of our community.</p>
      ${sponsorUsername ? `<p>Your sponsor: <strong>${sponsorUsername}</strong></p>` : ''}
      <p>Your account has been successfully created. Here's what you can do next:</p>
      <ul>
        <li>Complete your profile setup</li>
        <li>Purchase your first matrix position</li>
        <li>Start building your network and earning commissions</li>
        <li>Invite friends and grow your team</li>
      </ul>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      <p>Welcome aboard and best of luck on your journey to financial freedom!</p>
      <p><strong>The Matrix MLM Team</strong></p>
    `;
    
    try {
      await this.sendEmailToAddress(email, subject, message, 2);
    } catch (error) {
      // Fallback to username if email fails
      await this.sendEmail(username, subject, message, 2);
    }
  }

  // Send purchase position email
  async sendPurchaseEmail(username, email, amount, currency, matrixLevel, positionId) {
    const subject = 'Matrix Position Purchased Successfully!';
    const message = `
      <h2>Position Purchase Confirmed!</h2>
      <p>Congratulations! Your matrix position has been successfully purchased.</p>
      <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Position Details:</strong></p>
        <ul>
          <li>Position ID: <strong>${positionId}</strong></li>
          <li>Matrix Level: <strong>${matrixLevel}</strong></li>
          <li>Amount Paid: <strong>${amount} ${currency}</strong></li>
        </ul>
      </div>
      <p>Your position is now active and you can start earning commissions as your downline fills up.</p>
      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>Invite members to fill your matrix</li>
        <li>Track your position progress in your dashboard</li>
        <li>Earn bonuses as your team grows</li>
      </ul>
      <p>Thank you for your investment! We're here to support your success.</p>
      <p><strong>The Matrix MLM Team</strong></p>
    `;
    
    try {
      await this.sendEmailToAddress(email, subject, message, 2);
    } catch (error) {
      await this.sendEmail(username, subject, message, 2);
    }
  }

  // Send forgot password email
  async sendForgotPasswordEmail(username, email, resetToken, resetLink) {
    const subject = 'Password Reset Request - Matrix MLM';
    const message = `
      <h2>Password Reset Request</h2>
      <p>Hello ${username},</p>
      <p>We received a request to reset your password for your Matrix MLM account.</p>
      <p>Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #667eea;">${resetLink}</p>
      <p><strong>This link will expire in 1 hour.</strong></p>
      <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
      <p>For security reasons, never share this link with anyone.</p>
      <p><strong>The Matrix MLM Team</strong></p>
    `;
    
    try {
      await this.sendEmailToAddress(email, subject, message, 2);
    } catch (error) {
      await this.sendEmail(username, subject, message, 2);
    }
  }

  // Helper method to send email directly to address
  async sendEmailToAddress(emailAddress, subject, message, format = 2) {
    try {
      // Get site settings
      const [settings] = await db.execute('SELECT * FROM adminsettings LIMIT 1');
      const siteConfig = settings[0] || {};
      
      // Prepare email content
      const emailContent = format === 2 ? this.createHTMLEmail(message, siteConfig) : message;
      
      // Send email
      if (this.transporter) {
        await this.transporter.sendMail({
          from: siteConfig.Email || 'noreply@matrixmlm.com',
          to: emailAddress,
          subject: subject,
          text: format === 1 ? message : undefined,
          html: format === 2 ? emailContent : undefined
        });
        
        console.log(`Email sent to ${emailAddress}`);
        return { success: true };
      } else {
        console.log(`Email would be sent to ${emailAddress}: ${subject}`);
        return { success: true, simulated: true };
      }
      
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Send payment confirmation email
  async sendPaymentConfirmationEmail(username, amount, currency) {
    const subject = 'Payment Confirmed - EarnYourDollar';
    const message = `
      <h2>Payment Confirmed!</h2>
      <p>Your payment of <strong>${amount} ${currency}</strong> has been confirmed.</p>
      <p>Your matrix position has been activated and you can start earning commissions.</p>
      <p>Thank you for joining EarnYourDollar!</p>
    `;
    
    await this.sendEmail(username, subject, message, 2);
  }

  // Send withdrawal confirmation email
  async sendWithdrawalConfirmationEmail(username, amount, currency) {
    const subject = 'Withdrawal Processed - EarnYourDollar';
    const message = `
      <h2>Withdrawal Processed!</h2>
      <p>Your withdrawal of <strong>${amount} ${currency}</strong> has been processed.</p>
      <p>The funds will be sent to your registered wallet address.</p>
      <p>Thank you for using EarnYourDollar!</p>
    `;
    
    await this.sendEmail(username, subject, message, 2);
  }

  // Send referral bonus email
  async sendReferralBonusEmail(username, amount, referralUsername) {
    const subject = 'Referral Bonus Earned - EarnYourDollar';
    const message = `
      <h2>Referral Bonus Earned!</h2>
      <p>Congratulations! You have earned a referral bonus of <strong>${amount} USDT</strong>.</p>
      <p>This bonus was earned from your referral: <strong>${referralUsername}</strong></p>
      <p>Keep building your network to earn more bonuses!</p>
    `;
    
    await this.sendEmail(username, subject, message, 2);
  }

  // Send cycle bonus email
  async sendCycleBonusEmail(username, amount) {
    const subject = 'Cycle Bonus Earned - EarnYourDollar';
    const message = `
      <h2>Cycle Bonus Earned!</h2>
      <p>Congratulations! You have completed a matrix cycle and earned a bonus of <strong>${amount} USDT</strong>.</p>
      <p>Your matrix position has been reset and you can start earning commissions again.</p>
      <p>Keep up the great work!</p>
    `;
    
    await this.sendEmail(username, subject, message, 2);
  }

  // Send matching bonus email
  async sendMatchingBonusEmail(username, amount, referralUsername) {
    const subject = 'Matching Bonus Earned - EarnYourDollar';
    const message = `
      <h2>Matching Bonus Earned!</h2>
      <p>Congratulations! You have earned a matching bonus of <strong>${amount} USDT</strong>.</p>
      <p>This bonus was earned when your referral <strong>${referralUsername}</strong> completed a matrix cycle.</p>
      <p>Your leadership is paying off!</p>
    `;
    
    await this.sendEmail(username, subject, message, 2);
  }

  // Send system notification email
  async sendSystemNotificationEmail(username, subject, message) {
    await this.sendEmail(username, subject, message, 2);
  }

  // Send bulk email to multiple users
  async sendBulkEmail(usernames, subject, message, format = 2) {
    const results = [];
    
    for (const username of usernames) {
      try {
        const result = await this.sendEmail(username, subject, message, format);
        results.push({ username, success: true, result });
      } catch (error) {
        results.push({ username, success: false, error: error.message });
      }
    }
    
    return results;
  }

  // Test email configuration
  async testEmailConfiguration() {
    try {
      if (!this.transporter) {
        return { success: false, error: 'Email transporter not configured' };
      }
      
      // Send test email
      await this.transporter.sendMail({
        from: 'test@earnyourdollar.com',
        to: 'test@example.com',
        subject: 'Email Configuration Test',
        text: 'This is a test email to verify email configuration.'
      });
      
      return { success: true, message: 'Email configuration test successful' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService(); 