import { prisma } from '../config/database';
import { logger } from '../utils/logger';

interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  period?: string;
  groupBy?: string;
}

export class AnalyticsService {
  /**
   * Get member analytics
   */
  async getMemberAnalytics(filters: AnalyticsFilters = {}) {
    try {
      const { startDate, endDate, period = '30d' } = filters;
      
      let dateFilter: any = {};
      if (startDate && endDate) {
        dateFilter = {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        };
      } else {
        const now = new Date();
        let daysBack: number;
        
        switch (period) {
          case '7d':
            daysBack = 7;
            break;
          case '30d':
            daysBack = 30;
            break;
          case '90d':
            daysBack = 90;
            break;
          case '1y':
            daysBack = 365;
            break;
          default:
            daysBack = 30;
        }
        
        dateFilter = {
          createdAt: {
            gte: new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
          }
        };
      }

      const [
        totalMembers,
        newMembers,
        activeMembers,
        proMembers,
        leadershipMembers,
        inactiveMembers,
        previousPeriodMembers
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: dateFilter }),
        prisma.user.count({
          where: {
            lastLogin: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.user.count({
          where: {
            memberType: 'PRO'
          }
        }),
        prisma.user.count({
          where: {
            userRanks: { some: {} }
          }
        }),
        prisma.user.count({
          where: {
            status: 'SUSPENDED'
          }
        }),
        prisma.user.count({
          where: {
            createdAt: {
              lt: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      const growthRate = previousPeriodMembers > 0 
        ? ((newMembers - previousPeriodMembers) / previousPeriodMembers) * 100 
        : 0;

      return {
        totalMembers,
        newMembers,
        activeMembers,
        proMembers,
        leadershipMembers,
        inactiveMembers,
        growthRate: Math.round(growthRate * 100) / 100
      };
    } catch (error) {
      logger.error('Error getting member analytics:', error);
      throw error;
    }
  }

  /**
   * Get financial analytics
   */
  async getFinancialAnalytics(filters: AnalyticsFilters = {}) {
    try {
      const { startDate, endDate, period = '30d' } = filters;
      
      let dateFilter: any = {};
      if (startDate && endDate) {
        dateFilter = {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        };
      } else {
        const now = new Date();
        let daysBack: number;
        
        switch (period) {
          case '7d':
            daysBack = 7;
            break;
          case '30d':
            daysBack = 30;
            break;
          case '90d':
            daysBack = 90;
            break;
          case '1y':
            daysBack = 365;
            break;
          default:
            daysBack = 30;
        }
        
        dateFilter = {
          createdAt: {
            gte: new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
          }
        };
      }

      const [
        totalEarnings,
        totalPayouts,
        pendingPayouts,
        averageEarnings,
        topEarner,
        previousPeriodEarnings
      ] = await Promise.all([
        prisma.user.aggregate({
          _sum: { totalEarnings: true }
        }),
        prisma.user.aggregate({
          _sum: { paidEarnings: true }
        }),
        prisma.user.aggregate({
          _sum: { unpaidEarnings: true }
        }),
        prisma.user.aggregate({
          _avg: { totalEarnings: true }
        }),
        prisma.user.findFirst({
          orderBy: { totalEarnings: 'desc' },
          select: {
            username: true,
            totalEarnings: true
          }
        }),
        prisma.user.aggregate({
          where: {
            createdAt: {
              lt: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000)
            }
          },
          _sum: { totalEarnings: true }
        })
      ]);

      const monthlyGrowth = previousPeriodEarnings._sum.totalEarnings > 0 
        ? ((totalEarnings._sum.totalEarnings - previousPeriodEarnings._sum.totalEarnings) / previousPeriodEarnings._sum.totalEarnings) * 100 
        : 0;

      return {
        totalEarnings: totalEarnings._sum.totalEarnings || 0,
        totalPayouts: totalPayouts._sum.paidEarnings || 0,
        pendingPayouts: pendingPayouts._sum.unpaidEarnings || 0,
        averageEarnings: averageEarnings._avg.totalEarnings || 0,
        topEarner: topEarner?.username || 'N/A',
        topEarnings: topEarner?.totalEarnings || 0,
        monthlyGrowth: Math.round(monthlyGrowth * 100) / 100
      };
    } catch (error) {
      logger.error('Error getting financial analytics:', error);
      throw error;
    }
  }

  /**
   * Get matrix analytics
   */
  async getMatrixAnalytics(filters: AnalyticsFilters = {}) {
    try {
      const [
        totalPositions,
        filledPositions,
        averageLevel,
        cyclesCompleted,
        spilloverCount
      ] = await Promise.all([
        prisma.matrixPosition.count(),
        prisma.matrixPosition.count({
          where: {
            userId: { not: null }
          }
        }),
        prisma.matrixPosition.aggregate({
          _avg: { level1: true }
        }),
        prisma.matrixPosition.count({
          where: {
            status: 'COMPLETED'
          }
        }),
        prisma.matrixPosition.count({
          where: {
            refBy: { not: null }
          }
        })
      ]);

      const completionRate = totalPositions > 0 
        ? (filledPositions / totalPositions) * 100 
        : 0;

      return {
        totalPositions,
        filledPositions,
        completionRate: Math.round(completionRate * 100) / 100,
        averageLevel: Math.round((averageLevel._avg.level1 || 0) * 100) / 100,
        cyclesCompleted,
        spilloverCount
      };
    } catch (error) {
      logger.error('Error getting matrix analytics:', error);
      throw error;
    }
  }

  /**
   * Get bonus analytics
   */
  async getBonusAnalytics(filters: AnalyticsFilters = {}) {
    try {
      const { startDate, endDate, period = '30d' } = filters;
      
      let dateFilter: any = {};
      if (startDate && endDate) {
        dateFilter = {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        };
      } else {
        const now = new Date();
        let daysBack: number;
        
        switch (period) {
          case '7d':
            daysBack = 7;
            break;
          case '30d':
            daysBack = 30;
            break;
          case '90d':
            daysBack = 90;
            break;
          case '1y':
            daysBack = 365;
            break;
          default:
            daysBack = 30;
        }
        
        dateFilter = {
          createdAt: {
            gte: new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
          }
        };
      }

      const [
        totalBonuses,
        averageBonus,
        bonusDistribution
      ] = await Promise.all([
        prisma.bonus.aggregate({
          where: dateFilter,
          _sum: { amount: true }
        }),
        prisma.bonus.aggregate({
          where: dateFilter,
          _avg: { amount: true }
        }),
        prisma.bonus.groupBy({
          by: ['type'],
          where: dateFilter,
          _sum: { amount: true },
          _count: { id: true }
        })
      ]);

      const distribution: { [key: string]: number } = {};
      bonusDistribution.forEach(item => {
        distribution[item.type] = item._sum.amount || 0;
      });

      const topBonusType = bonusDistribution.length > 0 
        ? bonusDistribution.reduce((prev, current) => 
            (prev._sum.amount || 0) > (current._sum.amount || 0) ? prev : current
          ).type
        : 'N/A';

      return {
        totalBonuses: totalBonuses._sum.amount || 0,
        averageBonus: averageBonus._avg.amount || 0,
        topBonusType,
        bonusDistribution: distribution
      };
    } catch (error) {
      logger.error('Error getting bonus analytics:', error);
      throw error;
    }
  }

  /**
   * Get system analytics
   */
  async getSystemAnalytics() {
    try {
      const [
        activeSessions,
        errorLogs,
        lastBackup
      ] = await Promise.all([
        prisma.session.count({
          where: {
            expiresAt: {
              gt: new Date()
            }
          }
        }),
        prisma.log.count({
          where: {
            level: 'error',
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.backup.findFirst({
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true }
        })
      ]);

      // Calculate uptime (simplified - in production you'd track this properly)
      const uptime = 99.9; // This should be calculated from actual uptime tracking
      const averageResponseTime = 150; // This should be calculated from actual response time tracking
      const errorRate = errorLogs > 0 ? (errorLogs / 1000) * 100 : 0; // Simplified calculation

      return {
        uptime,
        activeSessions,
        averageResponseTime,
        errorRate: Math.round(errorRate * 100) / 100,
        lastBackup: lastBackup?.createdAt?.toISOString() || 'Never'
      };
    } catch (error) {
      logger.error('Error getting system analytics:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive analytics dashboard data
   */
  async getDashboardAnalytics(filters: AnalyticsFilters = {}) {
    try {
      const [
        memberStats,
        financialStats,
        matrixStats,
        bonusStats,
        systemStats
      ] = await Promise.all([
        this.getMemberAnalytics(filters),
        this.getFinancialAnalytics(filters),
        this.getMatrixAnalytics(filters),
        this.getBonusAnalytics(filters),
        this.getSystemAnalytics()
      ]);

      return {
        memberStats,
        financialStats,
        matrixStats,
        bonusStats,
        systemStats,
        period: filters.period || '30d',
        generatedAt: new Date()
      };
    } catch (error) {
      logger.error('Error getting dashboard analytics:', error);
      throw error;
    }
  }

  /**
   * Get chart data for visualizations
   */
  async getChartData(chartType: string, filters: AnalyticsFilters = {}) {
    try {
      const { startDate, endDate, period = '30d', groupBy = 'day' } = filters;
      
      let dateFilter: any = {};
      if (startDate && endDate) {
        dateFilter = {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        };
      } else {
        const now = new Date();
        let daysBack: number;
        
        switch (period) {
          case '7d':
            daysBack = 7;
            break;
          case '30d':
            daysBack = 30;
            break;
          case '90d':
            daysBack = 90;
            break;
          case '1y':
            daysBack = 365;
            break;
          default:
            daysBack = 30;
        }
        
        dateFilter = {
          createdAt: {
            gte: new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
          }
        };
      }

      switch (chartType) {
        case 'member-growth':
          return await this.getMemberGrowthChartData(dateFilter, groupBy);
        case 'financial-trends':
          return await this.getFinancialTrendsChartData(dateFilter, groupBy);
        case 'matrix-performance':
          return await this.getMatrixPerformanceChartData(dateFilter, groupBy);
        case 'bonus-distribution':
          return await this.getBonusDistributionChartData(dateFilter);
        default:
          throw new Error('Invalid chart type');
      }
    } catch (error) {
      logger.error('Error getting chart data:', error);
      throw error;
    }
  }

  /**
   * Get member growth chart data
   */
  private async getMemberGrowthChartData(dateFilter: any, groupBy: string) {
    // This would implement actual chart data generation
    // For now, returning mock data structure
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'New Members',
        data: [120, 150, 180, 220, 280, 320],
        borderColor: '#3B82F6',
        fill: false
      }]
    };
  }

  /**
   * Get financial trends chart data
   */
  private async getFinancialTrendsChartData(dateFilter: any, groupBy: string) {
    // This would implement actual chart data generation
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Earnings',
        data: [5000, 7500, 12000, 15000, 18000, 22000],
        borderColor: '#10B981',
        fill: false
      }]
    };
  }

  /**
   * Get matrix performance chart data
   */
  private async getMatrixPerformanceChartData(dateFilter: any, groupBy: string) {
    // This would implement actual chart data generation
    return {
      labels: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'],
      datasets: [{
        label: 'Completions',
        data: [150, 120, 90, 60, 30],
        backgroundColor: '#8B5CF6'
      }]
    };
  }

  /**
   * Get bonus distribution chart data
   */
  private async getBonusDistributionChartData(dateFilter: any) {
    // This would implement actual chart data generation
    return {
      labels: ['Referral', 'Matrix', 'Matching', 'Cycle', 'Leadership'],
      datasets: [{
        label: 'Bonus Amount',
        data: [5000, 8000, 3000, 2000, 1000],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
      }]
    };
  }

  /**
   * Generate analytics report
   */
  async generateReport(reportType: string, filters: AnalyticsFilters = {}) {
    try {
      const data = await this.getDashboardAnalytics(filters);
      
      return {
        reportType,
        generatedAt: new Date(),
        period: filters.period || '30d',
        data,
        summary: {
          totalMembers: data.memberStats.totalMembers,
          totalEarnings: data.financialStats.totalEarnings,
          completionRate: data.matrixStats.completionRate,
          systemUptime: data.systemStats.uptime
        }
      };
    } catch (error) {
      logger.error('Error generating report:', error);
      throw error;
    }
  }
}

export default AnalyticsService;

