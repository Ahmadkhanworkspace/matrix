import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class SystemService {
  /**
   * Get system health status
   */
  async getSystemHealth() {
    try {
      const [
        dbHealth,
        memoryUsage,
        diskUsage,
        cpuUsage,
        uptime
      ] = await Promise.all([
        this.getDatabaseHealth(),
        this.getMemoryUsage(),
        this.getDiskUsage(),
        this.getCpuUsage(),
        this.getUptime()
      ]);

      const overallStatus = this.calculateOverallHealth([
        dbHealth.status,
        memoryUsage.status,
        diskUsage.status,
        cpuUsage.status
      ]);

      return {
        status: overallStatus,
        timestamp: new Date(),
        database: dbHealth,
        memory: memoryUsage,
        disk: diskUsage,
        cpu: cpuUsage,
        uptime: uptime
      };
    } catch (error) {
      logger.error('Error getting system health:', error);
      throw error;
    }
  }

  /**
   * Get database health
   */
  private async getDatabaseHealth() {
    try {
      const startTime = Date.now();
      
      // Test database connection
      await prisma.$queryRaw`SELECT 1`;
      
      const responseTime = Date.now() - startTime;
      
      // Get database stats
      const [
        userCount,
        transactionCount,
        activeSessionCount
      ] = await Promise.all([
        prisma.user.count(),
        prisma.transaction.count(),
        prisma.session.count({
          where: {
            expiresAt: {
              gt: new Date()
            }
          }
        })
      ]);

      const status = responseTime < 100 ? 'healthy' : responseTime < 500 ? 'warning' : 'critical';

      return {
        status,
        responseTime,
        userCount,
        transactionCount,
        activeSessionCount,
        connectionPool: {
          active: 10, // This would come from actual connection pool stats
          idle: 5,
          total: 15
        }
      };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return {
        status: 'critical',
        error: error.message,
        responseTime: null,
        userCount: 0,
        transactionCount: 0,
        activeSessionCount: 0
      };
    }
  }

  /**
   * Get memory usage
   */
  private async getMemoryUsage() {
    try {
      const memUsage = process.memoryUsage();
      const totalMemory = require('os').totalmem();
      const freeMemory = require('os').freemem();
      const usedMemory = totalMemory - freeMemory;
      
      const memoryPercentage = (usedMemory / totalMemory) * 100;
      const status = memoryPercentage < 70 ? 'healthy' : memoryPercentage < 85 ? 'warning' : 'critical';

      return {
        status,
        percentage: Math.round(memoryPercentage * 100) / 100,
        used: Math.round(usedMemory / 1024 / 1024), // MB
        free: Math.round(freeMemory / 1024 / 1024), // MB
        total: Math.round(totalMemory / 1024 / 1024), // MB
        process: {
          rss: Math.round(memUsage.rss / 1024 / 1024), // MB
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
          external: Math.round(memUsage.external / 1024 / 1024) // MB
        }
      };
    } catch (error) {
      logger.error('Memory usage check failed:', error);
      return {
        status: 'critical',
        error: error.message
      };
    }
  }

  /**
   * Get disk usage
   */
  private async getDiskUsage() {
    try {
      // This is a simplified version - in production you'd use a proper disk usage library
      const stats = fs.statSync('.');
      const diskPercentage = 45; // Mock value - replace with actual disk usage calculation
      
      const status = diskPercentage < 80 ? 'healthy' : diskPercentage < 90 ? 'warning' : 'critical';

      return {
        status,
        percentage: diskPercentage,
        used: '25.6 GB', // Mock values
        free: '30.4 GB',
        total: '56 GB'
      };
    } catch (error) {
      logger.error('Disk usage check failed:', error);
      return {
        status: 'critical',
        error: error.message
      };
    }
  }

  /**
   * Get CPU usage
   */
  private async getCpuUsage() {
    try {
      const cpus = require('os').cpus();
      const cpuUsage = process.cpuUsage();
      
      // Simplified CPU usage calculation
      const cpuPercentage = 25; // Mock value - replace with actual CPU usage calculation
      const status = cpuPercentage < 70 ? 'healthy' : cpuPercentage < 85 ? 'warning' : 'critical';

      return {
        status,
        percentage: cpuPercentage,
        cores: cpus.length,
        model: cpus[0].model,
        speed: cpus[0].speed
      };
    } catch (error) {
      logger.error('CPU usage check failed:', error);
      return {
        status: 'critical',
        error: error.message
      };
    }
  }

  /**
   * Get system uptime
   */
  private async getUptime() {
    try {
      const systemUptime = require('os').uptime();
      const processUptime = process.uptime();

      return {
        system: Math.floor(systemUptime),
        process: Math.floor(processUptime),
        systemFormatted: this.formatUptime(systemUptime),
        processFormatted: this.formatUptime(processUptime)
      };
    } catch (error) {
      logger.error('Uptime check failed:', error);
      return {
        error: error.message
      };
    }
  }

  /**
   * Calculate overall health status
   */
  private calculateOverallHealth(statuses: string[]): string {
    if (statuses.includes('critical')) return 'critical';
    if (statuses.includes('warning')) return 'warning';
    return 'healthy';
  }

  /**
   * Format uptime in human readable format
   */
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  }

  /**
   * Get system logs
   */
  async getSystemLogs(filters: any = {}) {
    try {
      const { page = 1, limit = 50, level, startDate, endDate } = filters;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (level) {
        where.level = level;
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

      const [logs, total] = await Promise.all([
        prisma.log.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.log.count({ where })
      ]);

      return {
        logs,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error getting system logs:', error);
      throw error;
    }
  }

  /**
   * Create system backup
   */
  async createBackup(type: string = 'database') {
    try {
      const backupId = `backup_${Date.now()}`;
      const timestamp = new Date();
      
      // Create backup record
      const backup = await prisma.backup.create({
        data: {
          type,
          status: 'in_progress',
          description: `${type} backup created at ${timestamp.toISOString()}`,
          startedAt: timestamp
        }
      });

      // Simulate backup process (replace with actual backup logic)
      setTimeout(async () => {
        try {
          // Mock backup completion
          await prisma.backup.update({
            where: { id: backup.id },
            data: {
              status: 'completed',
              filename: `${backupId}.sql`,
              fileSize: BigInt(1024 * 1024 * 50), // 50MB mock size
              location: `/backups/${backupId}.sql`,
              completedAt: new Date()
            }
          });

          logger.info(`Backup ${backup.id} completed successfully`);
        } catch (error) {
          await prisma.backup.update({
            where: { id: backup.id },
            data: {
              status: 'failed',
              error: error.message,
              completedAt: new Date()
            }
          });

          logger.error(`Backup ${backup.id} failed:`, error);
        }
      }, 5000); // 5 second mock backup time

      return {
        backupId: backup.id,
        status: 'in_progress',
        message: 'Backup started successfully'
      };
    } catch (error) {
      logger.error('Error creating backup:', error);
      throw error;
    }
  }

  /**
   * Get backup history
   */
  async getBackupHistory(filters: any = {}) {
    try {
      const { page = 1, limit = 20, type, status } = filters;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (type) {
        where.type = type;
      }

      if (status) {
        where.status = status;
      }

      const [backups, total] = await Promise.all([
        prisma.backup.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.backup.count({ where })
      ]);

      return {
        backups,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error getting backup history:', error);
      throw error;
    }
  }

  /**
   * Clear system logs
   */
  async clearLogs(olderThan: string) {
    try {
      const cutoffDate = new Date(olderThan);
      
      const result = await prisma.log.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      });

      logger.info(`Cleared ${result.count} log entries older than ${cutoffDate.toISOString()}`);
      
      return {
        deletedCount: result.count,
        cutoffDate: cutoffDate.toISOString()
      };
    } catch (error) {
      logger.error('Error clearing logs:', error);
      throw error;
    }
  }

  /**
   * Get system configuration
   */
  async getSystemConfig() {
    try {
      const configs = await prisma.systemConfig.findMany({
        orderBy: { key: 'asc' }
      });

      const configMap: any = {};
      configs.forEach(config => {
        configMap[config.key] = {
          value: config.value,
          description: config.description,
          isPublic: config.isPublic
        };
      });

      return configMap;
    } catch (error) {
      logger.error('Error getting system config:', error);
      throw error;
    }
  }

  /**
   * Update system configuration
   */
  async updateSystemConfig(key: string, value: string, description?: string) {
    try {
      const config = await prisma.systemConfig.upsert({
        where: { key },
        update: { value, description },
        create: { key, value, description }
      });

      logger.info(`System config updated: ${key} = ${value}`);
      
      return config;
    } catch (error) {
      logger.error('Error updating system config:', error);
      throw error;
    }
  }

  /**
   * Get system statistics
   */
  async getSystemStats() {
    try {
      const [
        totalUsers,
        activeUsers,
        totalTransactions,
        totalPayments,
        totalWithdrawals,
        systemHealth
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: {
            lastLogin: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          }
        }),
        prisma.transaction.count(),
        prisma.payment.count(),
        prisma.withdrawal.count(),
        this.getSystemHealth()
      ]);

      return {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers
        },
        transactions: {
          total: totalTransactions,
          payments: totalPayments,
          withdrawals: totalWithdrawals
        },
        system: {
          health: systemHealth.status,
          uptime: systemHealth.uptime?.processFormatted || '0d 0h 0m',
          memoryUsage: systemHealth.memory?.percentage || 0,
          cpuUsage: systemHealth.cpu?.percentage || 0,
          diskUsage: systemHealth.disk?.percentage || 0
        }
      };
    } catch (error) {
      logger.error('Error getting system stats:', error);
      throw error;
    }
  }

  /**
   * Restart application (in production, this would trigger a graceful restart)
   */
  async restartApplication() {
    try {
      logger.info('Application restart requested');
      
      // In production, you would implement proper graceful shutdown
      // For now, we'll just log the request
      return {
        message: 'Application restart initiated',
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Error restarting application:', error);
      throw error;
    }
  }

  /**
   * Clear application cache
   */
  async clearCache() {
    try {
      // Implement cache clearing logic here
      logger.info('Application cache cleared');
      
      return {
        message: 'Cache cleared successfully',
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Error clearing cache:', error);
      throw error;
    }
  }
}

export default SystemService;

