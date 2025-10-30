import { toast } from 'react-hot-toast';

// Admin API Service for all backend interactions
export class AdminApiService {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.token = localStorage.getItem('admin_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Settings API
  async getSettings() {
    return this.request('/admin/settings');
  }

  async saveSettings(settings: any) {
    return this.request('/admin/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  // Payment Gateway API
  async getPaymentGatewayConfig() {
    return this.request('/admin/payment-gateways/config');
  }

  async testPaymentGateway(gateway: string, config: any) {
    return this.request('/admin/test-payment-gateway', {
      method: 'POST',
      body: JSON.stringify({ gateway, config }),
    });
  }

  // Matrix API
  async getMatrices() {
    return this.request('/admin/matrices');
  }

  async getMatrixConfig(matrixId: string) {
    return this.request(`/admin/matrices/${matrixId}/config`);
  }

  async saveMatrixConfig(matrixId: string, config: any) {
    return this.request(`/admin/matrices/${matrixId}/config`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  // Users API
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    membership?: string;
    kyc?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.request(`/admin/users?${queryParams.toString()}`);
  }

  async getUserDetails(userId: string) {
    return this.request(`/admin/users/${userId}`);
  }

  async updateUser(userId: string, userData: any) {
    return this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async bulkActionUsers(userIds: string[], action: string) {
    return this.request('/admin/users/bulk-action', {
      method: 'POST',
      body: JSON.stringify({ userIds, action }),
    });
  }

  // Transactions API
  async getTransactions(params: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    userId?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.request(`/admin/transactions?${queryParams.toString()}`);
  }

  async getTransactionDetails(transactionId: string) {
    return this.request(`/admin/transactions/${transactionId}`);
  }

  async updateTransaction(transactionId: string, data: any) {
    return this.request(`/admin/transactions/${transactionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // eWallet Transactions API
  async createEWalletTransaction(data: {
    userId: string;
    type: string;
    amount: number;
    currency: string;
    description: string;
  }) {
    return this.request('/admin/transactions', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        referenceType: 'EWALLET',
      }),
    });
  }

  // Bonuses API
  async getBonuses(params: {
    page?: number;
    limit?: number;
    type?: string;
    userId?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.request(`/admin/bonuses?${queryParams.toString()}`);
  }

  async getBonusDetails(bonusId: string) {
    return this.request(`/admin/bonuses/${bonusId}`);
  }

  async getDashboardStats() {
    return this.request('/admin/dashboard-stats');
  }

  async resetSystem() {
    return this.request('/admin/reset', {
      method: 'POST',
    });
  }

  // Logs API
  async getLogs(params: {
    page?: number;
    limit?: number;
    type?: string;
    level?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.request(`/admin/logs?${queryParams.toString()}`);
  }

  // Email API
  async sendEmail(data: {
    to: string | string[];
    subject: string;
    body: string;
    template?: string;
  }) {
    return this.request('/admin/email/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getEmailTemplates() {
    return this.request('/admin/email/templates');
  }

  async saveEmailTemplate(template: any) {
    return this.request('/admin/email/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  // System Tools API
  async getSystemHealth() {
    return this.request('/admin/system/health');
  }

  async getSystemLogs(params: {
    page?: number;
    limit?: number;
    level?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.request(`/admin/system/logs?${queryParams.toString()}`);
  }

  async clearLogs(data: { olderThan: string }) {
    return this.request('/admin/system/logs', {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  }

  async getBackupHistory(params: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.request(`/admin/system/backups?${queryParams.toString()}`);
  }

  async createBackup(data: { type?: string } = {}) {
    return this.request('/admin/system/backups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSystemConfig() {
    return this.request('/admin/system/config');
  }

  async updateSystemConfig(data: {
    key: string;
    value: string;
    description?: string;
  }) {
    return this.request('/admin/system/config', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getSystemStats() {
    return this.request('/admin/system/stats');
  }

  async restartApplication() {
    return this.request('/admin/system/restart', {
      method: 'POST',
    });
  }

  async clearCache() {
    return this.request('/admin/system/clear-cache', {
      method: 'POST',
    });
  }

  async getServerInfo() {
    return this.request('/admin/system/server-info');
  }

  async getMetrics() {
    return this.request('/admin/system/metrics');
  }

  async testDatabaseConnection() {
    return this.request('/admin/system/test-db');
  }
}

// Export singleton instance
export const adminApiService = new AdminApiService(); 