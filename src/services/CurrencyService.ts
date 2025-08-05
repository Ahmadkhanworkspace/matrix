import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { WithdrawalFeeType } from '@/types';

export class CurrencyService {
  /**
   * Get all currencies
   */
  async getAllCurrencies() {
    try {
      return await prisma.currency.findMany({
        orderBy: { isDefault: 'desc' }
      });
    } catch (error) {
      logger.error('Error fetching currencies:', error);
      throw error;
    }
  }

  /**
   * Get active currencies
   */
  async getActiveCurrencies() {
    try {
      return await prisma.currency.findMany({
        where: { isActive: true },
        orderBy: { isDefault: 'desc' }
      });
    } catch (error) {
      logger.error('Error fetching active currencies:', error);
      throw error;
    }
  }

  /**
   * Get currency by code
   */
  async getCurrencyByCode(code: string) {
    try {
      return await prisma.currency.findUnique({
        where: { code }
      });
    } catch (error) {
      logger.error('Error fetching currency:', error);
      throw error;
    }
  }

  /**
   * Get default currency
   */
  async getDefaultCurrency() {
    try {
      return await prisma.currency.findFirst({
        where: { isDefault: true, isActive: true }
      });
    } catch (error) {
      logger.error('Error fetching default currency:', error);
      throw error;
    }
  }

  /**
   * Create new currency
   */
  async createCurrency(data: {
    code: string;
    name: string;
    symbol: string;
    isActive: boolean;
    isDefault: boolean;
    exchangeRate: number;
    decimalPlaces: number;
    minWithdrawal: number;
    maxWithdrawal: number;
    withdrawalFee: number;
    withdrawalFeeType: 'PERCENTAGE' | 'FIXED';
  }) {
    try {
      // If this is set as default, unset other defaults
      if (data.isDefault) {
        await prisma.currency.updateMany({
          where: { isDefault: true },
          data: { isDefault: false }
        });
      }

      return await prisma.currency.create({
        data
      });
    } catch (error) {
      logger.error('Error creating currency:', error);
      throw error;
    }
  }

  /**
   * Update currency
   */
  async updateCurrency(id: string, data: any) {
    try {
      // If this is set as default, unset other defaults
      if (data.isDefault) {
        await prisma.currency.updateMany({
          where: { isDefault: true },
          data: { isDefault: false }
        });
      }

      return await prisma.currency.update({
        where: { id },
        data
      });
    } catch (error) {
      logger.error('Error updating currency:', error);
      throw error;
    }
  }

  /**
   * Delete currency
   */
  async deleteCurrency(id: string): Promise<void> {
    try {
      const currency = await prisma.currency.findUnique({
        where: { id }
      });

      if (!currency) {
        throw new Error('Currency not found');
      }

      if (currency.isDefault) {
        throw new Error('Cannot delete default currency');
      }

      await prisma.currency.delete({
        where: { id }
      });
    } catch (error) {
      logger.error('Error deleting currency:', error);
      throw error;
    }
  }

  /**
   * Toggle currency active status
   */
  async toggleCurrencyStatus(id: string) {
    try {
      const currency = await prisma.currency.findUnique({
        where: { id }
      });

      if (!currency) {
        throw new Error('Currency not found');
      }

      return await prisma.currency.update({
        where: { id },
        data: { isActive: !currency.isActive }
      });
    } catch (error) {
      logger.error('Error toggling currency status:', error);
      throw error;
    }
  }

  /**
   * Set default currency
   */
  async setDefaultCurrency(id: string) {
    try {
      // Unset current default
      await prisma.currency.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });

      // Set new default
      return await prisma.currency.update({
        where: { id },
        data: { isDefault: true, isActive: true }
      });
    } catch (error) {
      logger.error('Error setting default currency:', error);
      throw error;
    }
  }

  /**
   * Update exchange rates
   */
  async updateExchangeRates(rates: Record<string, number>): Promise<void> {
    try {
      for (const [code, rate] of Object.entries(rates)) {
        await prisma.currency.updateMany({
          where: { code },
          data: { exchangeRate: rate }
        });
      }

      logger.info('Exchange rates updated successfully');
    } catch (error) {
      logger.error('Error updating exchange rates:', error);
      throw error;
    }
  }

  /**
   * Convert amount between currencies
   */
  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      if (fromCurrency === toCurrency) {
        return amount;
      }

      const fromCurrencyData = await this.getCurrencyByCode(fromCurrency);
      const toCurrencyData = await this.getCurrencyByCode(toCurrency);

      if (!fromCurrencyData || !toCurrencyData) {
        throw new Error('Currency not found');
      }

      if (!fromCurrencyData.isActive || !toCurrencyData.isActive) {
        throw new Error('Currency not active');
      }

      // Convert using exchange rates
      const convertedAmount = (amount * fromCurrencyData.exchangeRate) / toCurrencyData.exchangeRate;
      return Math.round(convertedAmount * Math.pow(10, toCurrencyData.decimalPlaces)) / Math.pow(10, toCurrencyData.decimalPlaces);
    } catch (error) {
      logger.error('Error converting currency:', error);
      throw error;
    }
  }

  /**
   * Get currency statistics for admin dashboard
   */
  async getCurrencyStatistics() {
    try {
      const currencies = await prisma.currency.findMany();
      const statistics: any[] = [];

      for (const currency of currencies) {
        // Get transaction statistics for this currency
        const transactions = await prisma.transaction.findMany({
          where: { currency: currency.code }
        });

        const totalTransactions = transactions.length;
        const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);

        statistics.push({
          ...currency,
          totalTransactions,
          totalVolume
        });
      }

      return statistics;
    } catch (error) {
      logger.error('Error getting currency statistics:', error);
      throw error;
    }
  }

  /**
   * Initialize default currencies
   */
  async initializeDefaultCurrencies(): Promise<void> {
    try {
      const existingCurrencies = await prisma.currency.count();
      
      if (existingCurrencies === 0) {
        const defaultCurrencies = [
          {
            code: 'USD',
            name: 'US Dollar',
            symbol: '$',
            isActive: true,
            isDefault: true,
            exchangeRate: 1.0,
            decimalPlaces: 2,
            minWithdrawal: 10,
            maxWithdrawal: 10000,
            withdrawalFee: 2,
            withdrawalFeeType: 'PERCENTAGE' as const
          },
          {
            code: 'EUR',
            name: 'Euro',
            symbol: '€',
            isActive: true,
            isDefault: false,
            exchangeRate: 0.85,
            decimalPlaces: 2,
            minWithdrawal: 10,
            maxWithdrawal: 10000,
            withdrawalFee: 2,
            withdrawalFeeType: 'PERCENTAGE' as const
          },
          {
            code: 'BTC',
            name: 'Bitcoin',
            symbol: '₿',
            isActive: true,
            isDefault: false,
            exchangeRate: 0.000025,
            decimalPlaces: 8,
            minWithdrawal: 0.001,
            maxWithdrawal: 10,
            withdrawalFee: 0.0001,
            withdrawalFeeType: 'FIXED' as const
          },
          {
            code: 'ETH',
            name: 'Ethereum',
            symbol: 'Ξ',
            isActive: true,
            isDefault: false,
            exchangeRate: 0.0004,
            decimalPlaces: 6,
            minWithdrawal: 0.01,
            maxWithdrawal: 100,
            withdrawalFee: 0.001,
            withdrawalFeeType: 'FIXED' as const
          },
          {
            code: 'USDT',
            name: 'Tether',
            symbol: '₮',
            isActive: true,
            isDefault: false,
            exchangeRate: 1.0,
            decimalPlaces: 2,
            minWithdrawal: 10,
            maxWithdrawal: 10000,
            withdrawalFee: 1,
            withdrawalFeeType: 'PERCENTAGE' as const
          }
        ];

        await prisma.currency.createMany({
          data: defaultCurrencies
        });

        logger.info('Default currencies initialized');
      }
    } catch (error) {
      logger.error('Error initializing default currencies:', error);
      throw error;
    }
  }

  /**
   * Validate currency code format
   */
  validateCurrencyCode(code: string): boolean {
    // Currency codes should be 3 characters for fiat, variable for crypto
    const fiatPattern = /^[A-Z]{3}$/;
    const cryptoPattern = /^[A-Z0-9]{2,10}$/;
    
    return fiatPattern.test(code) || cryptoPattern.test(code);
  }

  /**
   * Get supported currencies for payment gateway
   */
  async getSupportedCurrenciesForGateway(gatewayId: string): Promise<string[]> {
    try {
      const gatewayConfig = await prisma.paymentGatewayConfig.findUnique({
        where: { id: gatewayId }
      });

      if (!gatewayConfig) {
        throw new Error('Gateway configuration not found');
      }

      // Get active currencies that are supported by the gateway
      const activeCurrencies = await prisma.currency.findMany({
        where: { 
          isActive: true,
          code: { in: gatewayConfig.supportedCurrencies }
        }
      });

      return activeCurrencies.map(c => c.code);
    } catch (error) {
      logger.error('Error getting supported currencies for gateway:', error);
      throw error;
    }
  }
} 