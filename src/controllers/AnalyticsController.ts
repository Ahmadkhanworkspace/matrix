import { Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { logger } from '../utils/logger';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  /**
   * Get comprehensive dashboard analytics
   */
  public getDashboardAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        startDate,
        endDate,
        period = '30d'
      } = req.query;

      const filters = {
        startDate: startDate as string,
        endDate: endDate as string,
        period: period as string
      };

      const analytics = await this.analyticsService.getDashboardAnalytics(filters);

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Error getting dashboard analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard analytics',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get member analytics
   */
  public getMemberAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        startDate,
        endDate,
        period = '30d'
      } = req.query;

      const filters = {
        startDate: startDate as string,
        endDate: endDate as string,
        period: period as string
      };

      const analytics = await this.analyticsService.getMemberAnalytics(filters);

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Error getting member analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve member analytics',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get financial analytics
   */
  public getFinancialAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        startDate,
        endDate,
        period = '30d'
      } = req.query;

      const filters = {
        startDate: startDate as string,
        endDate: endDate as string,
        period: period as string
      };

      const analytics = await this.analyticsService.getFinancialAnalytics(filters);

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Error getting financial analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve financial analytics',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get matrix analytics
   */
  public getMatrixAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        startDate,
        endDate,
        period = '30d'
      } = req.query;

      const filters = {
        startDate: startDate as string,
        endDate: endDate as string,
        period: period as string
      };

      const analytics = await this.analyticsService.getMatrixAnalytics(filters);

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Error getting matrix analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve matrix analytics',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get bonus analytics
   */
  public getBonusAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        startDate,
        endDate,
        period = '30d'
      } = req.query;

      const filters = {
        startDate: startDate as string,
        endDate: endDate as string,
        period: period as string
      };

      const analytics = await this.analyticsService.getBonusAnalytics(filters);

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Error getting bonus analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve bonus analytics',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get system analytics
   */
  public getSystemAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const analytics = await this.analyticsService.getSystemAnalytics();

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Error getting system analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve system analytics',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get chart data for visualizations
   */
  public getChartData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { chartType } = req.params;
      const {
        startDate,
        endDate,
        period = '30d',
        groupBy = 'day'
      } = req.query;

      const filters = {
        startDate: startDate as string,
        endDate: endDate as string,
        period: period as string,
        groupBy: groupBy as string
      };

      const chartData = await this.analyticsService.getChartData(chartType, filters);

      res.status(200).json({
        success: true,
        data: chartData
      });
    } catch (error) {
      logger.error('Error getting chart data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve chart data',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Generate analytics report
   */
  public generateReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { reportType } = req.params;
      const {
        startDate,
        endDate,
        period = '30d'
      } = req.query;

      const filters = {
        startDate: startDate as string,
        endDate: endDate as string,
        period: period as string
      };

      const report = await this.analyticsService.generateReport(reportType, filters);

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Error generating report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate report',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Get real-time analytics
   */
  public getRealTimeAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const [
        activeUsers,
        recentTransactions,
        systemHealth
      ] = await Promise.all([
        this.analyticsService.getSystemAnalytics(),
        // Add more real-time data sources here
        Promise.resolve({ count: 0 }),
        Promise.resolve({ status: 'healthy' })
      ]);

      const realTimeData = {
        activeUsers: activeUsers.activeSessions,
        recentTransactions: 0,
        systemHealth: 'healthy',
        timestamp: new Date()
      };

      res.status(200).json({
        success: true,
        data: realTimeData
      });
    } catch (error) {
      logger.error('Error getting real-time analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve real-time analytics',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Export analytics data
   */
  public exportAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        format = 'json',
        startDate,
        endDate,
        period = '30d'
      } = req.query;

      const filters = {
        startDate: startDate as string,
        endDate: endDate as string,
        period: period as string
      };

      const analytics = await this.analyticsService.getDashboardAnalytics(filters);

      if (format === 'csv') {
        // Convert to CSV format
        const csvData = this.convertToCSV(analytics);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
        res.status(200).send(csvData);
      } else {
        // Return as JSON
        res.status(200).json({
          success: true,
          data: analytics,
          exportedAt: new Date(),
          format: 'json'
        });
      }
    } catch (error) {
      logger.error('Error exporting analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export analytics',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Convert analytics data to CSV format
   */
  private convertToCSV(data: any): string {
    const headers = [
      'Metric',
      'Value',
      'Period',
      'Generated At'
    ];

    const rows = [
      ['Total Members', data.memberStats.totalMembers, data.period, data.generatedAt],
      ['New Members', data.memberStats.newMembers, data.period, data.generatedAt],
      ['Active Members', data.memberStats.activeMembers, data.period, data.generatedAt],
      ['Total Earnings', data.financialStats.totalEarnings, data.period, data.generatedAt],
      ['Total Payouts', data.financialStats.totalPayouts, data.period, data.generatedAt],
      ['Pending Payouts', data.financialStats.pendingPayouts, data.period, data.generatedAt],
      ['Completion Rate', data.matrixStats.completionRate, data.period, data.generatedAt],
      ['System Uptime', data.systemStats.uptime, data.period, data.generatedAt]
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }
}

export default AnalyticsController;

