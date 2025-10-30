import { Request, Response } from 'express';
import { SystemService } from '../services/SystemService';
import { logger } from '../utils/logger';

export class SystemController {
  private systemService: SystemService;

  constructor() {
    this.systemService = new SystemService();
  }

  /**
   * Get system health status
   */
  public getSystemHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const health = await this.systemService.getSystemHealth();

      res.status(200).json({
        success: true,
        data: health
      });
    } catch (error) {
      logger.error('Error getting system health:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve system health',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get system logs
   */
  public getSystemLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 50,
        level,
        startDate,
        endDate
      } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        level: level as string,
        startDate: startDate as string,
        endDate: endDate as string
      };

      const result = await this.systemService.getSystemLogs(filters);
      
      res.status(200).json({
        success: true,
        data: result.logs,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages
        }
      });
    } catch (error) {
      logger.error('Error getting system logs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve system logs',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Clear system logs
   */
  public clearLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const { olderThan } = req.body;

      if (!olderThan) {
        res.status(400).json({
          success: false,
          message: 'olderThan date is required'
        });
        return;
      }

      const result = await this.systemService.clearLogs(olderThan);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Logs cleared successfully'
      });
    } catch (error) {
      logger.error('Error clearing logs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear logs',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Create system backup
   */
  public createBackup = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type = 'database' } = req.body;

      const result = await this.systemService.createBackup(type);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error creating backup:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create backup',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get backup history
   */
  public getBackupHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        status
      } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        type: type as string,
        status: status as string
      };

      const result = await this.systemService.getBackupHistory(filters);
      
      res.status(200).json({
        success: true,
        data: result.backups,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages
        }
      });
    } catch (error) {
      logger.error('Error getting backup history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve backup history',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get system configuration
   */
  public getSystemConfig = async (req: Request, res: Response): Promise<void> => {
    try {
      const config = await this.systemService.getSystemConfig();

      res.status(200).json({
        success: true,
        data: config
      });
    } catch (error) {
      logger.error('Error getting system config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve system configuration',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Update system configuration
   */
  public updateSystemConfig = async (req: Request, res: Response): Promise<void> => {
    try {
      const { key, value, description } = req.body;

      if (!key || value === undefined) {
        res.status(400).json({
          success: false,
          message: 'Key and value are required'
        });
        return;
      }

      const config = await this.systemService.updateSystemConfig(key, value, description);

      res.status(200).json({
        success: true,
        data: config,
        message: 'Configuration updated successfully'
      });
    } catch (error) {
      logger.error('Error updating system config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update system configuration',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get system statistics
   */
  public getSystemStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.systemService.getSystemStats();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting system stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve system statistics',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Restart application
   */
  public restartApplication = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.systemService.restartApplication();

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error restarting application:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to restart application',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Clear application cache
   */
  public clearCache = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.systemService.clearCache();

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error clearing cache:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear cache',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get server information
   */
  public getServerInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      const serverInfo = {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        environment: process.env.NODE_ENV || 'development',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        pid: process.pid,
        versions: process.versions
      };

      res.status(200).json({
        success: true,
        data: serverInfo
      });
    } catch (error) {
      logger.error('Error getting server info:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve server information',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Test database connection
   */
  public testDatabaseConnection = async (req: Request, res: Response): Promise<void> => {
    try {
      const startTime = Date.now();
      
      // Test database connection
      await this.systemService.getSystemHealth();
      
      const responseTime = Date.now() - startTime;

      res.status(200).json({
        success: true,
        data: {
          status: 'connected',
          responseTime: `${responseTime}ms`,
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error('Database connection test failed:', error);
      res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get application metrics
   */
  public getMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const metrics = {
        timestamp: new Date(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        eventLoop: {
          // In production, you'd use actual event loop metrics
          delay: '1.2ms',
          utilization: '15%'
        },
        gc: {
          // In production, you'd track actual GC metrics
          collections: 42,
          duration: '120ms'
        }
      };

      res.status(200).json({
        success: true,
        data: metrics
      });
    } catch (error) {
      logger.error('Error getting metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve application metrics',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };
}

export default SystemController;

