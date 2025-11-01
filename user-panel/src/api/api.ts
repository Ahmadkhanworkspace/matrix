// User Panel API Service
// For Vercel deployment, set REACT_APP_API_URL environment variable to your Railway backend URL
// Example: https://your-backend.railway.app/api
// For local development, defaults to localhost:5000
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(username: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (response.success && response.data?.token) {
      localStorage.setItem('authToken', response.data.token);
      if (response.data.user) {
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }
    }
    return response;
  }

  async register(data: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    sponsor?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Matrix
  async getMatrixOverview() {
    return this.request('/matrix/overview');
  }

  async getMatrixLevels() {
    return this.request('/matrix/levels');
  }

  async getMatrixConfig() {
    return this.request('/matrix/config');
  }

  async purchasePosition(data: {
    matrixLevel: number;
    sponsor?: string;
    entryType?: number;
  }) {
    return this.request('/matrix/purchase-position', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Payments
  async processPayment(data: {
    amount: number;
    currency: string;
    paymentMethod: string;
    gatewayId: string;
    description?: string;
  }) {
    return this.request('/payment/process', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async requestWithdrawal(data: {
    amount: number;
    currency: string;
    walletAddress: string;
  }) {
    return this.request('/payment/withdraw', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPayments() {
    return this.request('/payment/payments');
  }

  async getWithdrawals() {
    return this.request('/payment/withdrawals');
  }

  async getCurrencies() {
    return this.request('/payment/currencies');
  }

  async getPaymentGateways() {
    return this.request('/payment/gateways');
  }

  // User
  async getUserProfile() {
    return this.request('/user/profile');
  }

  async updateUserProfile(data: any) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserStats() {
    return this.request('/users/stats');
  }

  // Wallet & Transactions
  async getTransactions(params?: { page?: number; limit?: number; type?: string; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request(`/users/transactions?${queryParams.toString()}`);
  }

  // Support
  async getSupportTickets() {
    return this.request('/support/tickets');
  }

  async createSupportTicket(data: { subject: string; message: string; category?: string; priority?: string }) {
    return this.request('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFAQ() {
    return this.request('/support/faq');
  }

  // Global PIF
  async getGlobalPIFStats() {
    return this.request('/pif/stats');
  }

  async getGlobalPIFContributions(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request(`/pif/contributions?${queryParams.toString()}`);
  }

  // Matrix positions
  async getMatrixPositions(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/matrix/positions${query}`);
  }

  async getNextToCycle(params?: { matrixLevel?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.matrixLevel) {
      queryParams.append('matrixLevel', params.matrixLevel.toString());
    }
    return this.request(`/matrix/next-to-cycle?${queryParams.toString()}`);
  }

  // Matrix stats
  async getMatrixStatistics() {
    return this.request('/matrix/statistics');
  }

  async getMatrixGenealogy() {
    return this.request('/matrix/genealogy');
  }

  // ============ REFERRAL TRACKING ============
  async createReferralLink(data: { name: string; utmSource?: string; utmMedium?: string; utmCampaign?: string }) {
    return this.request('/referrals/links', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getReferralLinks() {
    return this.request('/referrals/links');
  }

  async getReferralLinkStats(linkId: string) {
    return this.request(`/referrals/links/${linkId}/stats`);
  }

  async getReferralDashboard() {
    return this.request('/referrals/dashboard');
  }

  async getReferralLeaderboard(period: string = 'all-time') {
    return this.request(`/referrals/leaderboard?period=${period}`);
  }

  async getDownlineTree(depth: number = 5) {
    return this.request(`/referrals/downline-tree?depth=${depth}`);
  }

  async getCommissionBreakdown(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return this.request(`/referrals/commission-breakdown?${params.toString()}`);
  }

  // ============ RANKS ============
  async getRanks() {
    return this.request('/ranks');
  }

  async getMyRank() {
    return this.request('/ranks/my-rank');
  }

  async getRankProgress() {
    return this.request('/ranks/progress');
  }

  async calculateRank() {
    return this.request('/ranks/calculate', { method: 'POST' });
  }

  async getRankHistory() {
    return this.request('/ranks/history');
  }

  // ============ MESSAGING ============
  async createConversation(data: { type: string; name?: string; userIds?: string[] }) {
    return this.request('/messaging/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getConversations() {
    return this.request('/messaging/conversations');
  }

  async getConversation(conversationId: string) {
    return this.request(`/messaging/conversations/${conversationId}`);
  }

  async sendMessage(conversationId: string, data: { content: string; type?: string; parentMessageId?: string }, file?: File) {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.type) formData.append('type', data.type);
    if (data.parentMessageId) formData.append('parentMessageId', data.parentMessageId);
    if (file) formData.append('file', file);

    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/messaging/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  }

  async getMessages(conversationId: string, page: number = 1, limit: number = 50) {
    return this.request(`/messaging/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
  }

  async markMessageRead(messageId: string) {
    return this.request(`/messaging/messages/${messageId}/read`, { method: 'PUT' });
  }

  async searchMessages(query: string, conversationId?: string) {
    const params = new URLSearchParams({ q: query });
    if (conversationId) params.append('conversationId', conversationId);
    return this.request(`/messaging/search?${params.toString()}`);
  }

  // ============ LIVE CHAT ============
  async getChatRooms() {
    return this.request('/chat/rooms');
  }

  async createChatRoom(data: { name: string; type: string; description?: string; isPublic?: boolean }) {
    return this.request('/chat/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async joinChatRoom(roomId: string) {
    return this.request(`/chat/rooms/${roomId}/join`, { method: 'POST' });
  }

  async leaveChatRoom(roomId: string) {
    return this.request(`/chat/rooms/${roomId}/leave`, { method: 'POST' });
  }

  async getChatMessages(roomId: string, page: number = 1, limit: number = 50) {
    return this.request(`/chat/rooms/${roomId}/messages?page=${page}&limit=${limit}`);
  }

  async sendChatMessage(roomId: string, data: { content: string; replyToId?: string }, file?: File) {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.replyToId) formData.append('replyToId', data.replyToId);
    if (file) formData.append('file', file);

    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to send chat message');
    }

    return response.json();
  }

  async getOnlineUsers() {
    return this.request('/chat/users/online');
  }

  async updateChatStatus(status: string, currentRoomId?: string) {
    return this.request('/chat/users/status', {
      method: 'PUT',
      body: JSON.stringify({ status, currentRoomId }),
    });
  }

  // ============ GAMIFICATION ============
  async getAchievements() {
    return this.request('/gamification/achievements');
  }

  async getUserAchievements() {
    return this.request('/gamification/user-achievements');
  }

  async claimAchievement(achievementId: string) {
    return this.request(`/gamification/achievements/${achievementId}/claim`, { method: 'POST' });
  }

  async getPoints() {
    return this.request('/gamification/points');
  }

  async getChallenges(type?: string) {
    const params = type ? `?type=${type}` : '';
    return this.request(`/gamification/challenges${params}`);
  }

  async joinChallenge(challengeId: string) {
    return this.request(`/gamification/challenges/${challengeId}/join`, { method: 'POST' });
  }

  async getMyChallenges() {
    return this.request('/gamification/my-challenges');
  }

  async getLeaderboard(category: string, period: string = 'all-time') {
    return this.request(`/gamification/leaderboard/${category}?period=${period}`);
  }

  async getRewards() {
    return this.request('/gamification/rewards');
  }

  async redeemReward(rewardId: string) {
    return this.request(`/gamification/rewards/${rewardId}/redeem`, { method: 'POST' });
  }

  async getLoginStreak() {
    return this.request('/gamification/streak');
  }

  // ============ SOCIAL ============
  async initiateSocialLogin(provider: string, redirectUri: string) {
    return this.request(`/social/auth/${provider}`, {
      method: 'POST',
      body: JSON.stringify({ redirectUri }),
    });
  }

  async shareContent(data: { platform: string; content?: string; url: string; title?: string; description?: string }) {
    return this.request('/social/share', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPostTemplates() {
    return this.request('/social/posts/templates');
  }

  async generatePost(data: { templateId: string; variables?: any; platform?: string }) {
    return this.request('/social/posts/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSocialProof() {
    return this.request('/social/proof');
  }

  // ============ ADVANCED MATRIX ============
  async getMatrixTypes() {
    return this.request('/matrix/advanced/types');
  }

  async getSwapOptions(positionId: string) {
    return this.request(`/matrix/advanced/positions/${positionId}/swap-options`);
  }

  async swapPositions(positionId: string, targetPositionId: string) {
    return this.request(`/matrix/advanced/positions/${positionId}/swap`, {
      method: 'POST',
      body: JSON.stringify({ targetPositionId }),
    });
  }

  async purchaseInsurance(positionId: string, data: { premium: number; coverage: number; expiryDays?: number }) {
    return this.request(`/matrix/advanced/positions/${positionId}/insure`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getInsurance(positionId: string) {
    return this.request(`/matrix/advanced/positions/${positionId}/insurance`);
  }

  async clonePosition(positionId: string) {
    return this.request(`/matrix/advanced/positions/${positionId}/clone`, { method: 'POST' });
  }

  async getAdvancedMatrixAnalytics() {
    return this.request('/matrix/advanced/analytics');
  }
}

export const apiService = new ApiService();
