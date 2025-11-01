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

  async getPaymentGateways() {
    try {
      const response = await this.request('/payments/gateways/status');
      return response.data || {};
    } catch {
      // Fallback to mock data
      return {
        coinpayments: { enabled: false, isTestMode: true, configured: false },
        nowpayments: { enabled: false, isTestMode: true, configured: false },
        binance: { enabled: false, isTestMode: true, configured: false }
      };
    }
  }

  async updatePaymentGatewayConfig(gateway: string, config: any) {
    return this.request('/admin/payment-gateways/config', {
      method: 'POST',
      body: JSON.stringify({ gateway, config }),
    });
  }

  async savePaymentGatewayCredentials(gateway: string, credentials: {
    apiKey?: string;
    secretKey?: string;
    privateKey?: string;
    publicKey?: string;
    merchantId?: string;
    ipnSecret?: string;
    isTestMode?: boolean;
    enabled?: boolean;
  }) {
    return this.request('/admin/payment-gateways/credentials', {
      method: 'POST',
      body: JSON.stringify({ gateway, credentials }),
    });
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

  // Content/Banner API
  async getBanners(params: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    return this.request(`/admin/content/banners?${queryParams.toString()}`);
  }

  async createBanner(data: any) {
    return this.request('/admin/content/banners', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBanner(id: string, data: any) {
    return this.request(`/admin/content/banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBanner(id: string) {
    return this.request(`/admin/content/banners/${id}`, {
      method: 'DELETE',
    });
  }

  async approveBanner(id: string) {
    return this.request(`/admin/content/banners/${id}/approve`, {
      method: 'POST',
    });
  }

  async rejectBanner(id: string) {
    return this.request(`/admin/content/banners/${id}/reject`, {
      method: 'POST',
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

  // Cron Job API
  async getCronStatus() {
    return this.request('/admin/cron/status');
  }

  async runCronManually() {
    return this.request('/admin/cron/run', {
      method: 'POST',
    });
  }

  async unlockCron() {
    return this.request('/admin/cron/unlock', {
      method: 'POST',
    });
  }

  // Verifier Queue API
  async getVerifierQueue(params: {
    page?: number;
    limit?: number;
    processed?: boolean;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    return this.request(`/admin/verifier/queue?${queryParams.toString()}`);
  }

  async createVerifierEntry(data: {
    username: string;
    mid: number;
    date?: string;
    etype?: number;
    sponsor?: string;
  }) {
    return this.request('/admin/verifier/entry', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteVerifierEntry(id: string) {
    return this.request(`/admin/verifier/entry/${id}`, {
      method: 'DELETE',
    });
  }

  // Modules API
  async getModules(params: {
    category?: string;
    status?: string;
    search?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== 'all') {
        queryParams.append(key, value.toString());
      }
    });
    const queryString = queryParams.toString();
    return this.request(`/admin/modules${queryString ? `?${queryString}` : ''}`);
  }

  async getModule(id: number) {
    return this.request(`/admin/modules/${id}`);
  }

  async purchaseModule(moduleId: number) {
    return this.request(`/admin/modules/${moduleId}/purchase`, {
      method: 'POST',
    });
  }

  async installModule(moduleId: number) {
    return this.request(`/admin/modules/${moduleId}/install`, {
      method: 'POST',
    });
  }

  async uninstallModule(moduleId: number) {
    return this.request(`/admin/modules/${moduleId}/uninstall`, {
      method: 'POST',
    });
  }

  async updateModuleStatus(moduleId: number, status: string) {
    return this.request(`/admin/modules/${moduleId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // ============ RANKS MANAGEMENT ============
  async getRanks() {
    return this.request('/ranks/admin/ranks');
  }

  async createRank(data: any) {
    return this.request('/ranks/admin/ranks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRank(rankId: string, data: any) {
    return this.request(`/ranks/admin/ranks/${rankId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRank(rankId: string) {
    return this.request(`/ranks/admin/ranks/${rankId}`, {
      method: 'DELETE',
    });
  }

  async assignRank(userId: string, rankId: string, reason?: string) {
    return this.request('/ranks/admin/assign', {
      method: 'POST',
      body: JSON.stringify({ userId, rankId, reason }),
    });
  }

  // ============ EMAIL CAMPAIGNS ============
  async getEmailCampaigns() {
    return this.request('/email-campaigns/campaigns');
  }

  async createEmailCampaign(data: any) {
    return this.request('/email-campaigns/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmailCampaign(campaignId: string, data: any) {
    return this.request(`/email-campaigns/campaigns/${campaignId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async sendEmailCampaign(campaignId: string) {
    return this.request(`/email-campaigns/campaigns/${campaignId}/send`, {
      method: 'POST',
    });
  }

  async getEmailCampaignStats(campaignId: string) {
    return this.request(`/email-campaigns/campaigns/${campaignId}/stats`);
  }

  async getEmailCampaignAnalytics(campaignId: string) {
    return this.request(`/email-campaigns/campaigns/${campaignId}/analytics`);
  }

  async createABTest(campaignId: string, variants: any[]) {
    return this.request(`/email-campaigns/campaigns/${campaignId}/ab-test`, {
      method: 'POST',
      body: JSON.stringify({ variants }),
    });
  }

  async getEmailTemplates() {
    return this.request('/email-campaigns/templates');
  }

  async createEmailTemplate(data: any) {
    return this.request('/email-campaigns/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============ GAMIFICATION MANAGEMENT ============
  async getAchievements() {
    return this.request('/gamification/achievements');
  }

  async awardPoints(userId: string, points: number, source: string, description?: string) {
    return this.request('/gamification/points/award', {
      method: 'POST',
      body: JSON.stringify({ userId, points, source, description }),
    });
  }

  // ============ WHITE-LABEL MANAGEMENT ============
  async getTenants() {
    return this.request('/white-label/tenants');
  }

  async createTenant(data: { name: string; subdomain: string }) {
    return this.request('/white-label/tenants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBrandSettings(tenantId: string, data: any) {
    return this.request(`/white-label/tenants/${tenantId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getBrandSettings(tenantId: string) {
    return this.request(`/white-label/tenants/${tenantId}/settings`);
  }

  async addCustomDomain(tenantId: string, domain: string) {
    return this.request(`/white-label/tenants/${tenantId}/domains`, {
      method: 'POST',
      body: JSON.stringify({ domain }),
    });
  }

  async getCustomDomains(tenantId: string) {
    return this.request(`/white-label/tenants/${tenantId}/domains`);
  }

  async verifyDomain(domainId: string) {
    return this.request(`/white-label/domains/${domainId}/verify`, {
      method: 'POST',
    });
  }

  async generateApiKey(tenantId: string) {
    return this.request(`/white-label/tenants/${tenantId}/api-keys`, {
      method: 'POST',
    });
  }
}

// Export singleton instance
export const adminApiService = new AdminApiService(); 