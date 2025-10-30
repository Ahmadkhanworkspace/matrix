import { Request, Response } from 'express';
import { ContentService } from '../services/ContentService';
import { logger } from '../utils/logger';

export class ContentController {
  private contentService: ContentService;

  constructor() {
    this.contentService = new ContentService();
  }

  /**
   * Get all banners with filtering and pagination
   */
  public getBanners = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        status,
        position,
        startDate,
        endDate,
        search
      } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        type: type as string,
        status: status as string,
        position: position as string,
        startDate: startDate as string,
        endDate: endDate as string,
        search: search as string
      };

      const result = await this.contentService.getBanners(filters);
      
      res.status(200).json({
        success: true,
        data: result.banners,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages
        }
      });
    } catch (error) {
      logger.error('Error getting banners:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve banners',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get banner by ID
   */
  public getBanner = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const banner = await this.contentService.getBannerById(id);

      if (!banner) {
        res.status(404).json({
          success: false,
          message: 'Banner not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: banner
      });
    } catch (error) {
      logger.error('Error getting banner:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve banner',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Create new banner
   */
  public createBanner = async (req: Request, res: Response): Promise<void> => {
    try {
      const bannerData = req.body;
      const banner = await this.contentService.createBanner(bannerData);

      res.status(201).json({
        success: true,
        data: banner,
        message: 'Banner created successfully'
      });
    } catch (error) {
      logger.error('Error creating banner:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create banner',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Update banner
   */
  public updateBanner = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const banner = await this.contentService.updateBanner(id, updateData);

      res.status(200).json({
        success: true,
        data: banner,
        message: 'Banner updated successfully'
      });
    } catch (error) {
      logger.error('Error updating banner:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update banner',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Delete banner
   */
  public deleteBanner = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.contentService.deleteBanner(id);

      res.status(200).json({
        success: true,
        message: 'Banner deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting banner:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete banner',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get all email templates
   */
  public getEmailTemplates = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        status,
        search
      } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        type: type as string,
        status: status as string,
        search: search as string
      };

      const result = await this.contentService.getEmailTemplates(filters);
      
      res.status(200).json({
        success: true,
        data: result.templates,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages
        }
      });
    } catch (error) {
      logger.error('Error getting email templates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve email templates',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get email template by ID
   */
  public getEmailTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const template = await this.contentService.getEmailTemplateById(id);

      if (!template) {
        res.status(404).json({
          success: false,
          message: 'Email template not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: template
      });
    } catch (error) {
      logger.error('Error getting email template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve email template',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Create new email template
   */
  public createEmailTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const templateData = req.body;
      const template = await this.contentService.createEmailTemplate(templateData);

      res.status(201).json({
        success: true,
        data: template,
        message: 'Email template created successfully'
      });
    } catch (error) {
      logger.error('Error creating email template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create email template',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Update email template
   */
  public updateEmailTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const template = await this.contentService.updateEmailTemplate(id, updateData);

      res.status(200).json({
        success: true,
        data: template,
        message: 'Email template updated successfully'
      });
    } catch (error) {
      logger.error('Error updating email template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update email template',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Delete email template
   */
  public deleteEmailTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.contentService.deleteEmailTemplate(id);

      res.status(200).json({
        success: true,
        message: 'Email template deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting email template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete email template',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Send email using template
   */
  public sendEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { templateId, recipients, variables } = req.body;
      
      const result = await this.contentService.sendEmail(templateId, recipients, variables);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Email sent successfully'
      });
    } catch (error) {
      logger.error('Error sending email:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get all promotional content
   */
  public getPromotionalContent = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        status,
        startDate,
        endDate,
        search
      } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        type: type as string,
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string,
        search: search as string
      };

      const result = await this.contentService.getPromotionalContent(filters);
      
      res.status(200).json({
        success: true,
        data: result.content,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages
        }
      });
    } catch (error) {
      logger.error('Error getting promotional content:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve promotional content',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get promotional content by ID
   */
  public getPromotionalContentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const content = await this.contentService.getPromotionalContentById(id);

      if (!content) {
        res.status(404).json({
          success: false,
          message: 'Promotional content not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: content
      });
    } catch (error) {
      logger.error('Error getting promotional content:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve promotional content',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Create new promotional content
   */
  public createPromotionalContent = async (req: Request, res: Response): Promise<void> => {
    try {
      const contentData = req.body;
      const content = await this.contentService.createPromotionalContent(contentData);

      res.status(201).json({
        success: true,
        data: content,
        message: 'Promotional content created successfully'
      });
    } catch (error) {
      logger.error('Error creating promotional content:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create promotional content',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Update promotional content
   */
  public updatePromotionalContent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const content = await this.contentService.updatePromotionalContent(id, updateData);

      res.status(200).json({
        success: true,
        data: content,
        message: 'Promotional content updated successfully'
      });
    } catch (error) {
      logger.error('Error updating promotional content:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update promotional content',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Delete promotional content
   */
  public deletePromotionalContent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.contentService.deletePromotionalContent(id);

      res.status(200).json({
        success: true,
        message: 'Promotional content deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting promotional content:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete promotional content',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get content statistics
   */
  public getContentStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { period = '30d' } = req.query;
      
      const stats = await this.contentService.getContentStatistics(period as string);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting content statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve content statistics',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Track banner impression
   */
  public trackBannerImpression = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId, position } = req.body;

      await this.contentService.trackBannerImpression(id, userId, position);

      res.status(200).json({
        success: true,
        message: 'Impression tracked successfully'
      });
    } catch (error) {
      logger.error('Error tracking banner impression:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to track impression',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Track banner click
   */
  public trackBannerClick = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId, position } = req.body;

      await this.contentService.trackBannerClick(id, userId, position);

      res.status(200).json({
        success: true,
        message: 'Click tracked successfully'
      });
    } catch (error) {
      logger.error('Error tracking banner click:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to track click',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };
}

export default ContentController;

