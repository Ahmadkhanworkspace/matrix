import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { nodemailer } from 'nodemailer';

interface BannerFilters {
  page: number;
  limit: number;
  type?: string;
  status?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

interface EmailTemplateFilters {
  page: number;
  limit: number;
  type?: string;
  status?: string;
  search?: string;
}

interface PromotionalContentFilters {
  page: number;
  limit: number;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export class ContentService {
  /**
   * Get all banners with filtering and pagination
   */
  async getBanners(filters: BannerFilters) {
    try {
      const { page, limit, type, status, position, startDate, endDate, search } = filters;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (type) {
        where.type = type;
      }

      if (status) {
        where.status = status;
      }

      if (position) {
        where.position = position;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { altText: { contains: search, mode: 'insensitive' } },
          { linkUrl: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [banners, total] = await Promise.all([
        prisma.banner.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.banner.count({ where })
      ]);

      return {
        banners,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error getting banners:', error);
      throw error;
    }
  }

  /**
   * Get banner by ID
   */
  async getBannerById(id: string) {
    try {
      return await prisma.banner.findUnique({
        where: { id }
      });
    } catch (error) {
      logger.error('Error getting banner by ID:', error);
      throw error;
    }
  }

  /**
   * Create new banner
   */
  async createBanner(data: any) {
    try {
      return await prisma.banner.create({
        data: {
          name: data.name,
          imageUrl: data.imageUrl,
          altText: data.altText,
          linkUrl: data.linkUrl,
          type: data.type,
          status: data.status || 'draft',
          position: data.position,
          priority: data.priority || 'medium',
          targetAudience: data.targetAudience || [],
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          budget: data.budget || 0,
          spent: 0,
          impressions: 0,
          clicks: 0,
          ctr: 0,
          dimensions: data.dimensions || { width: 728, height: 90 }
        }
      });
    } catch (error) {
      logger.error('Error creating banner:', error);
      throw error;
    }
  }

  /**
   * Update banner
   */
  async updateBanner(id: string, data: any) {
    try {
      const updateData: any = {};

      if (data.name) updateData.name = data.name;
      if (data.imageUrl) updateData.imageUrl = data.imageUrl;
      if (data.altText) updateData.altText = data.altText;
      if (data.linkUrl) updateData.linkUrl = data.linkUrl;
      if (data.type) updateData.type = data.type;
      if (data.status) updateData.status = data.status;
      if (data.position) updateData.position = data.position;
      if (data.priority) updateData.priority = data.priority;
      if (data.targetAudience) updateData.targetAudience = data.targetAudience;
      if (data.startDate) updateData.startDate = new Date(data.startDate);
      if (data.endDate) updateData.endDate = new Date(data.endDate);
      if (data.budget) updateData.budget = data.budget;
      if (data.dimensions) updateData.dimensions = data.dimensions;

      return await prisma.banner.update({
        where: { id },
        data: updateData
      });
    } catch (error) {
      logger.error('Error updating banner:', error);
      throw error;
    }
  }

  /**
   * Delete banner
   */
  async deleteBanner(id: string) {
    try {
      return await prisma.banner.delete({
        where: { id }
      });
    } catch (error) {
      logger.error('Error deleting banner:', error);
      throw error;
    }
  }

  /**
   * Get all email templates
   */
  async getEmailTemplates(filters: EmailTemplateFilters) {
    try {
      const { page, limit, type, status, search } = filters;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (type) {
        where.type = type;
      }

      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [templates, total] = await Promise.all([
        prisma.emailTemplate.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.emailTemplate.count({ where })
      ]);

      return {
        templates,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error getting email templates:', error);
      throw error;
    }
  }

  /**
   * Get email template by ID
   */
  async getEmailTemplateById(id: string) {
    try {
      return await prisma.emailTemplate.findUnique({
        where: { id }
      });
    } catch (error) {
      logger.error('Error getting email template by ID:', error);
      throw error;
    }
  }

  /**
   * Create new email template
   */
  async createEmailTemplate(data: any) {
    try {
      return await prisma.emailTemplate.create({
        data: {
          name: data.name,
          subject: data.subject,
          content: data.content,
          type: data.type,
          status: data.status || 'draft',
          variables: data.variables || [],
          targetAudience: data.targetAudience || [],
          sendCount: 0,
          openRate: 0,
          clickRate: 0
        }
      });
    } catch (error) {
      logger.error('Error creating email template:', error);
      throw error;
    }
  }

  /**
   * Update email template
   */
  async updateEmailTemplate(id: string, data: any) {
    try {
      const updateData: any = {};

      if (data.name) updateData.name = data.name;
      if (data.subject) updateData.subject = data.subject;
      if (data.content) updateData.content = data.content;
      if (data.type) updateData.type = data.type;
      if (data.status) updateData.status = data.status;
      if (data.variables) updateData.variables = data.variables;
      if (data.targetAudience) updateData.targetAudience = data.targetAudience;

      return await prisma.emailTemplate.update({
        where: { id },
        data: updateData
      });
    } catch (error) {
      logger.error('Error updating email template:', error);
      throw error;
    }
  }

  /**
   * Delete email template
   */
  async deleteEmailTemplate(id: string) {
    try {
      return await prisma.emailTemplate.delete({
        where: { id }
      });
    } catch (error) {
      logger.error('Error deleting email template:', error);
      throw error;
    }
  }

  /**
   * Send email using template
   */
  async sendEmail(templateId: string, recipients: string[], variables: any = {}) {
    try {
      const template = await prisma.emailTemplate.findUnique({
        where: { id: templateId }
      });

      if (!template) {
        throw new Error('Email template not found');
      }

      // Replace variables in subject and content
      let subject = template.subject;
      let content = template.content;

      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, variables[key]);
        content = content.replace(regex, variables[key]);
      });

      // Create transporter (you'll need to configure this based on your email service)
      const transporter = nodemailer.createTransporter({
        // Configure your email service here
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      // Send emails
      const results = [];
      for (const recipient of recipients) {
        try {
          const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: recipient,
            subject: subject,
            html: content
          });

          results.push({
            recipient,
            success: true,
            messageId: info.messageId
          });
        } catch (error) {
          results.push({
            recipient,
            success: false,
            error: error.message
          });
        }
      }

      // Update template send count
      await prisma.emailTemplate.update({
        where: { id: templateId },
        data: {
          sendCount: { increment: recipients.length }
        }
      });

      return {
        templateId,
        totalSent: recipients.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Get all promotional content
   */
  async getPromotionalContent(filters: PromotionalContentFilters) {
    try {
      const { page, limit, type, status, startDate, endDate, search } = filters;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (type) {
        where.type = type;
      }

      if (status) {
        where.status = status;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [content, total] = await Promise.all([
        prisma.promotionalContent.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.promotionalContent.count({ where })
      ]);

      return {
        content,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error getting promotional content:', error);
      throw error;
    }
  }

  /**
   * Get promotional content by ID
   */
  async getPromotionalContentById(id: string) {
    try {
      return await prisma.promotionalContent.findUnique({
        where: { id }
      });
    } catch (error) {
      logger.error('Error getting promotional content by ID:', error);
      throw error;
    }
  }

  /**
   * Create new promotional content
   */
  async createPromotionalContent(data: any) {
    try {
      return await prisma.promotionalContent.create({
        data: {
          title: data.title,
          type: data.type,
          content: data.content,
          status: data.status || 'draft',
          targetAudience: data.targetAudience || [],
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          priority: data.priority || 'medium',
          budget: data.budget || 0,
          spent: 0,
          impressions: 0,
          clicks: 0,
          ctr: 0
        }
      });
    } catch (error) {
      logger.error('Error creating promotional content:', error);
      throw error;
    }
  }

  /**
   * Update promotional content
   */
  async updatePromotionalContent(id: string, data: any) {
    try {
      const updateData: any = {};

      if (data.title) updateData.title = data.title;
      if (data.type) updateData.type = data.type;
      if (data.content) updateData.content = data.content;
      if (data.status) updateData.status = data.status;
      if (data.targetAudience) updateData.targetAudience = data.targetAudience;
      if (data.startDate) updateData.startDate = new Date(data.startDate);
      if (data.endDate) updateData.endDate = new Date(data.endDate);
      if (data.priority) updateData.priority = data.priority;
      if (data.budget) updateData.budget = data.budget;

      return await prisma.promotionalContent.update({
        where: { id },
        data: updateData
      });
    } catch (error) {
      logger.error('Error updating promotional content:', error);
      throw error;
    }
  }

  /**
   * Delete promotional content
   */
  async deletePromotionalContent(id: string) {
    try {
      return await prisma.promotionalContent.delete({
        where: { id }
      });
    } catch (error) {
      logger.error('Error deleting promotional content:', error);
      throw error;
    }
  }

  /**
   * Get content statistics
   */
  async getContentStatistics(period: string = '30d') {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const [
        totalBanners,
        activeBanners,
        totalTemplates,
        activeTemplates,
        totalPromotionalContent,
        activePromotionalContent,
        totalImpressions,
        totalClicks,
        totalBudget,
        totalSpent
      ] = await Promise.all([
        prisma.banner.count({
          where: { createdAt: { gte: startDate } }
        }),
        prisma.banner.count({
          where: { 
            createdAt: { gte: startDate },
            status: 'active'
          }
        }),
        prisma.emailTemplate.count({
          where: { createdAt: { gte: startDate } }
        }),
        prisma.emailTemplate.count({
          where: { 
            createdAt: { gte: startDate },
            status: 'active'
          }
        }),
        prisma.promotionalContent.count({
          where: { createdAt: { gte: startDate } }
        }),
        prisma.promotionalContent.count({
          where: { 
            createdAt: { gte: startDate },
            status: 'active'
          }
        }),
        prisma.banner.aggregate({
          where: { createdAt: { gte: startDate } },
          _sum: { impressions: true }
        }),
        prisma.banner.aggregate({
          where: { createdAt: { gte: startDate } },
          _sum: { clicks: true }
        }),
        prisma.banner.aggregate({
          where: { createdAt: { gte: startDate } },
          _sum: { budget: true }
        }),
        prisma.banner.aggregate({
          where: { createdAt: { gte: startDate } },
          _sum: { spent: true }
        })
      ]);

      return {
        period,
        banners: {
          total: totalBanners,
          active: activeBanners
        },
        emailTemplates: {
          total: totalTemplates,
          active: activeTemplates
        },
        promotionalContent: {
          total: totalPromotionalContent,
          active: activePromotionalContent
        },
        performance: {
          totalImpressions: totalImpressions._sum.impressions || 0,
          totalClicks: totalClicks._sum.clicks || 0,
          averageCtr: totalImpressions._sum.impressions > 0 
            ? ((totalClicks._sum.clicks || 0) / (totalImpressions._sum.impressions || 1)) * 100 
            : 0
        },
        budget: {
          totalBudget: totalBudget._sum.budget || 0,
          totalSpent: totalSpent._sum.spent || 0,
          remaining: (totalBudget._sum.budget || 0) - (totalSpent._sum.spent || 0)
        },
        startDate,
        endDate: now
      };
    } catch (error) {
      logger.error('Error getting content statistics:', error);
      throw error;
    }
  }

  /**
   * Track banner impression
   */
  async trackBannerImpression(bannerId: string, userId?: string, position?: string) {
    try {
      await prisma.banner.update({
        where: { id: bannerId },
        data: {
          impressions: { increment: 1 }
        }
      });

      // Create impression record
      await prisma.bannerImpression.create({
        data: {
          bannerId,
          userId,
          position,
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error('Error tracking banner impression:', error);
      throw error;
    }
  }

  /**
   * Track banner click
   */
  async trackBannerClick(bannerId: string, userId?: string, position?: string) {
    try {
      await prisma.banner.update({
        where: { id: bannerId },
        data: {
          clicks: { increment: 1 }
        }
      });

      // Create click record
      await prisma.bannerClick.create({
        data: {
          bannerId,
          userId,
          position,
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error('Error tracking banner click:', error);
      throw error;
    }
  }
}

export default ContentService;

