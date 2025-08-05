import { api } from '../api';

export interface AdminApiService {
  // Matrix methods
  getMatrixLevels(params: { page: number; limit: number; status?: string }): Promise<any>;
  bulkActionMatrixLevels(selectedLevels: string[], action: string): Promise<any>;
  getMatrixPositions(params: { level: number; page: number; limit: number }): Promise<any>;
  getMatrixStatistics(): Promise<any>;
  
  // Transaction methods
  getTransactions(params: { page: number; limit: number; type?: string; status?: string; search?: string }): Promise<any>;
  bulkActionTransactions(selectedTransactions: string[], action: string): Promise<any>;
  
  // Payment gateway methods
  testPaymentGateway(gateway: string, config: any): Promise<any>;
  togglePaymentGatewayStatus(gatewayId: string): Promise<any>;
  
  // Currency methods
  getCurrencies(): Promise<any>;
  updateCurrency(id: string, data: any): Promise<any>;
  deleteCurrency(id: string): Promise<any>;
  toggleCurrencyStatus(currencyId: string): Promise<any>;
  setDefaultCurrency(currencyId: string): Promise<any>;
  updateExchangeRates(params: any): Promise<any>;
  
  // Payment gateway management
  getPaymentGateways(): Promise<any>;
  updatePaymentGateway(id: string, data: any): Promise<any>;
  deletePaymentGateway(id: string): Promise<any>;
  
  // User methods
  getUsers(params: { page: number; limit: number; search?: string; status?: string }): Promise<any>;
  activateUser(userId: string): Promise<any>;
  suspendUser(userId: string): Promise<any>;
  deleteUser(userId: string): Promise<any>;
}

class AdminService implements AdminApiService {
  // Matrix methods
  async getMatrixLevels(params: { page: number; limit: number; status?: string }): Promise<any> {
    return api.matrix.getMatrixConfigs();
  }

  async bulkActionMatrixLevels(selectedLevels: string[], action: string): Promise<any> {
    // Mock implementation
    return Promise.resolve({ success: true });
  }

  async getMatrixPositions(params: { level: number; page: number; limit: number }): Promise<any> {
    // Mock implementation
    return Promise.resolve({
      success: true,
      data: [],
      pagination: {
        page: params.page,
        limit: params.limit,
        total: 0,
        totalPages: 0
      }
    });
  }

  async getMatrixStatistics(): Promise<any> {
    // Mock implementation
    return Promise.resolve({
      success: true,
      data: {
        totalLevels: 10,
        activeLevels: 8,
        totalPositions: 100,
        totalTransactions: 1000,
        totalRevenue: 100000
      }
    });
  }

  // Transaction methods
  async getTransactions(params: { page: number; limit: number; type?: string; status?: string; search?: string }): Promise<any> {
    // Mock implementation with sample data
    const mockDeposits = [
      {
        id: '1',
        userId: 'user1',
        username: 'john_doe',
        amount: 100.00,
        currency: 'USD',
        status: 'pending',
        gateway: 'CoinPayments',
        transactionId: 'CP123456789',
        createdAt: '2024-01-15T10:30:00Z',
        approvedAt: null,
        rejectedAt: null,
        rejectedReason: null,
        fee: 2.50,
        netAmount: 97.50,
        confirmations: 2,
        requiredConfirmations: 3,
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: '2',
        userId: 'user2',
        username: 'jane_smith',
        amount: 250.00,
        currency: 'USD',
        status: 'approved',
        gateway: 'NOWPayments',
        transactionId: 'NP987654321',
        createdAt: '2024-01-14T15:45:00Z',
        approvedAt: '2024-01-14T16:00:00Z',
        rejectedAt: null,
        rejectedReason: null,
        fee: 5.00,
        netAmount: 245.00,
        confirmations: 6,
        requiredConfirmations: 3,
        walletAddress: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      {
        id: '3',
        userId: 'user3',
        username: 'mike_wilson',
        amount: 75.50,
        currency: 'EUR',
        status: 'rejected',
        gateway: 'Stripe',
        transactionId: 'ST555666777',
        createdAt: '2024-01-13T09:20:00Z',
        approvedAt: null,
        rejectedAt: '2024-01-13T10:15:00Z',
        rejectedReason: 'Insufficient funds',
        fee: 2.27,
        netAmount: 73.23,
        confirmations: 0,
        requiredConfirmations: 1,
        walletAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
      },
      {
        id: '4',
        userId: 'user4',
        username: 'sarah_jones',
        amount: 500.00,
        currency: 'USD',
        status: 'pending',
        gateway: 'PayPal',
        transactionId: 'PP111222333',
        createdAt: '2024-01-12T14:30:00Z',
        approvedAt: null,
        rejectedAt: null,
        rejectedReason: null,
        fee: 15.00,
        netAmount: 485.00,
        confirmations: 1,
        requiredConfirmations: 2,
        walletAddress: '1FvzCLoTPGANNjWoUo6jUGuAG3wg1w4YjR',
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: '5',
        userId: 'user5',
        username: 'david_brown',
        amount: 150.25,
        currency: 'GBP',
        status: 'approved',
        gateway: 'CoinPayments',
        transactionId: 'CP444555666',
        createdAt: '2024-01-11T11:15:00Z',
        approvedAt: '2024-01-11T11:45:00Z',
        rejectedAt: null,
        rejectedReason: null,
        fee: 3.75,
        netAmount: 146.50,
        confirmations: 4,
        requiredConfirmations: 3,
        walletAddress: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
        ipAddress: '192.168.1.104',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
      }
    ];

    // Filter by type if specified
    let filteredData = mockDeposits;
    if (params.type === 'deposit') {
      filteredData = mockDeposits;
    } else if (params.type === 'withdrawal') {
      // For withdrawals, we would have different mock data
      filteredData = [];
    }

    // Filter by status if specified
    if (params.status && params.status !== 'all') {
      filteredData = filteredData.filter(item => item.status === params.status);
    }

    // Filter by search if specified
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredData = filteredData.filter(item =>
        item.transactionId.toLowerCase().includes(searchLower) ||
        item.userId.toLowerCase().includes(searchLower) ||
        item.username.toLowerCase().includes(searchLower) ||
        item.amount.toString().includes(searchLower) ||
        item.currency.toLowerCase().includes(searchLower) ||
        item.gateway.toLowerCase().includes(searchLower) ||
        item.status.toLowerCase().includes(searchLower)
      );
    }

    // Calculate pagination
    const total = filteredData.length;
    const totalPages = Math.ceil(total / params.limit);
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return Promise.resolve({
      success: true,
      data: paginatedData,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: total,
        totalPages: totalPages
      }
    });
  }

  async bulkActionTransactions(selectedTransactions: string[], action: string): Promise<any> {
    // Mock implementation
    return Promise.resolve({ success: true });
  }

  // Payment gateway methods
  async testPaymentGateway(gateway: string, config: any): Promise<any> {
    // Mock implementation
    return Promise.resolve({ success: true, message: `${gateway} connection test successful` });
  }

  async togglePaymentGatewayStatus(gatewayId: string): Promise<any> {
    // Mock implementation
    return Promise.resolve({ success: true });
  }

  // Currency methods
  async getCurrencies(): Promise<any> {
    // Mock implementation
    return Promise.resolve({
      success: true,
      data: [
        { id: '1', name: 'Bitcoin', symbol: 'BTC', rate: 1, status: 'active' },
        { id: '2', name: 'Ethereum', symbol: 'ETH', rate: 0.05, status: 'active' },
        { id: '3', name: 'Tron', symbol: 'TRX', rate: 1000, status: 'active' }
      ]
    });
  }

  async updateCurrency(id: string, data: any): Promise<any> {
    // Mock implementation
    return Promise.resolve({ success: true });
  }

  async deleteCurrency(id: string): Promise<any> {
    // Mock implementation
    return Promise.resolve({ success: true });
  }

  async toggleCurrencyStatus(currencyId: string): Promise<any> {
    // Mock implementation
    return Promise.resolve({ success: true });
  }

  async setDefaultCurrency(currencyId: string): Promise<any> {
    // Mock implementation
    return Promise.resolve({ success: true });
  }

  async updateExchangeRates(params: any): Promise<any> {
    // Mock implementation
    return Promise.resolve({ success: true });
  }

  // Payment gateway management
  async getPaymentGateways(): Promise<any> {
    // Mock implementation
    return Promise.resolve({
      success: true,
      data: [
        { id: '1', name: 'CoinPayments', type: 'crypto', status: 'active', config: {} },
        { id: '2', name: 'NOWPayments', type: 'crypto', status: 'active', config: {} }
      ]
    });
  }

  async updatePaymentGateway(id: string, data: any): Promise<any> {
    // Mock implementation
    return Promise.resolve({ success: true });
  }

  async deletePaymentGateway(id: string): Promise<any> {
    // Mock implementation
    return Promise.resolve({ success: true });
  }

  // User methods
  async getUsers(params: { page: number; limit: number; search?: string; status?: string }): Promise<any> {
    // Mock implementation
    return Promise.resolve({
      success: true,
      data: [],
      pagination: {
        page: params.page,
        limit: params.limit,
        total: 0,
        totalPages: 0
      }
    });
  }

  async activateUser(userId: string): Promise<any> {
    // Mock implementation
    return Promise.resolve({ success: true });
  }

  async suspendUser(userId: string): Promise<any> {
    // Mock implementation
    return Promise.resolve({ success: true });
  }

  async deleteUser(userId: string): Promise<any> {
    // Mock implementation
    return Promise.resolve({ success: true });
  }
}

export const adminService = new AdminService(); 