// API Base URL
// In production, use Railway backend URL. Override with REACT_APP_API_URL environment variable.
const getApiBaseUrl = () => {
  // Check if we're in production (not localhost)
  const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  
  // Use environment variable if set, otherwise use Railway URL for production, localhost for development
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  if (isProduction) {
    return 'https://considerate-adventure-production.up.railway.app/api';
  }
  
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

// Helper function for API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('admin_token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle non-JSON responses (like HTML error pages)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Invalid response format: ${text.substring(0, 100)}`);
    }
    
    const data = await response.json();

    if (!response.ok) {
      // If 401, clear token and redirect to login
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        // Only redirect if not already on login page
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      throw new Error(data.error || data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User API
export const userApi = {
  // Get all users
  async getAllUsers(limit?: number, offset?: number, status?: number): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    if (status) params.append('status', status.toString());
    
    return apiRequest(`/users?${params.toString()}`);
  },

  // Get user by ID
  async getUserById(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/users/${id}`);
  },

  // Update user
  async updateUser(id: number, updates: any): Promise<ApiResponse<void>> {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Update user status
  async updateUserStatus(id: number, status: number): Promise<ApiResponse<void>> {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Delete user
  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Get user statistics
  async getUserStats(): Promise<ApiResponse<any>> {
    return apiRequest('/users/stats/overview');
  },

  // Search users
  async searchUsers(searchTerm: string, limit?: number, offset?: number): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    return apiRequest(`/users/search/${searchTerm}?${params.toString()}`);
  },
};

// Matrix API
export const matrixApi = {
  // Get all matrix configurations
  async getMatrixConfigs(): Promise<ApiResponse<any[]>> {
    return apiRequest('/matrix/configs');
  },

  // Get matrix configuration by ID
  async getMatrixConfig(id: number): Promise<ApiResponse<any>> {
    return apiRequest(`/matrix/configs/${id}`);
  },

  // Create matrix configuration
  async createMatrixConfig(config: any): Promise<ApiResponse<number>> {
    return apiRequest('/matrix/configs', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },

  // Update matrix configuration
  async updateMatrixConfig(id: number, config: any): Promise<ApiResponse<void>> {
    return apiRequest(`/matrix/configs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  },

  // Delete matrix configuration
  async deleteMatrixConfig(id: number): Promise<ApiResponse<void>> {
    return apiRequest(`/matrix/configs/${id}`, {
      method: 'DELETE',
    });
  },

  // Get matrix statistics
  async getMatrixStats(matrixId: number): Promise<ApiResponse<any>> {
    return apiRequest(`/matrix/stats/${matrixId}`);
  },

  // Get matrix positions
  async getMatrixPositions(matrixId: number, limit?: number, offset?: number): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    return apiRequest(`/matrix/positions/${matrixId}?${params.toString()}`);
  },

  // Process matrix entry
  async processMatrixEntry(username: string, matrixId: number, sponsor?: string): Promise<ApiResponse<number>> {
    return apiRequest('/matrix/entry', {
      method: 'POST',
      body: JSON.stringify({ username, matrixId, sponsor }),
    });
  },

  // Get level statistics
  async getLevelStats(): Promise<ApiResponse<any>> {
    return apiRequest('/matrix/level-stats');
  },

  // Get pending entries
  async getPendingEntries(matrixId: number): Promise<ApiResponse<any[]>> {
    return apiRequest(`/matrix/pending-entries/${matrixId}`);
  },

  // Process pending entries
  async processPendingEntries(matrixId: number): Promise<ApiResponse<number>> {
    return apiRequest(`/matrix/process-pending/${matrixId}`, {
      method: 'POST',
    });
  },
};

// Payment API
export const paymentApi = {
  // Get all transactions
  async getTransactions(limit?: number, offset?: number, type?: string, status?: string): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    
    return apiRequest(`/payments/transactions?${params.toString()}`);
  },

  // Get deposits
  async getDeposits(limit?: number, offset?: number, status?: string): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    if (status) params.append('status', status);
    
    return apiRequest(`/payments/deposits?${params.toString()}`);
  },

  // Get withdrawals
  async getWithdrawals(limit?: number, offset?: number, status?: string): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    if (status) params.append('status', status);
    
    return apiRequest(`/payments/withdrawals?${params.toString()}`);
  },

  // Process deposit
  async processDeposit(username: string, amount: number, currency: string = 'TRX', transactionId?: string): Promise<ApiResponse<void>> {
    return apiRequest('/payments/deposit', {
      method: 'POST',
      body: JSON.stringify({ username, amount, currency, transactionId }),
    });
  },

  // Process withdrawal
  async processWithdrawal(username: string, amount: number, currency: string = 'TRX'): Promise<ApiResponse<void>> {
    return apiRequest('/payments/withdrawal', {
      method: 'POST',
      body: JSON.stringify({ username, amount, currency }),
    });
  },

  // Approve transaction
  async approveTransaction(id: number): Promise<ApiResponse<void>> {
    return apiRequest(`/payments/transactions/${id}/approve`, {
      method: 'PUT',
    });
  },

  // Reject transaction
  async rejectTransaction(id: number): Promise<ApiResponse<void>> {
    return apiRequest(`/payments/transactions/${id}/reject`, {
      method: 'PUT',
    });
  },

  // Approve deposit
  async approveDeposit(id: number): Promise<ApiResponse<void>> {
    return apiRequest(`/payments/deposits/${id}/approve`, {
      method: 'PUT',
    });
  },

  // Reject deposit
  async rejectDeposit(id: number): Promise<ApiResponse<void>> {
    return apiRequest(`/payments/deposits/${id}/reject`, {
      method: 'PUT',
    });
  },

  // Approve withdrawal
  async approveWithdrawal(id: number): Promise<ApiResponse<void>> {
    return apiRequest(`/payments/withdrawals/${id}/approve`, {
      method: 'PUT',
    });
  },

  // Reject withdrawal
  async rejectWithdrawal(id: number): Promise<ApiResponse<void>> {
    return apiRequest(`/payments/withdrawals/${id}/reject`, {
      method: 'PUT',
    });
  },

  // Get payment statistics
  async getPaymentStats(): Promise<ApiResponse<any>> {
    return apiRequest('/payments/stats');
  },
};

// Settings API
export const settingsApi = {
  // Get all settings
  async getAllSettings(): Promise<ApiResponse<any>> {
    return apiRequest('/settings');
  },

  // Get setting by key
  async getSetting(key: string): Promise<ApiResponse<any>> {
    return apiRequest(`/settings/${key}`);
  },

  // Update setting
  async updateSetting(key: string, value: any, description?: string): Promise<ApiResponse<void>> {
    return apiRequest(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value, description }),
    });
  },

  // Delete setting
  async deleteSetting(key: string): Promise<ApiResponse<void>> {
    return apiRequest(`/settings/${key}`, {
      method: 'DELETE',
    });
  },

  // Initialize default settings
  async initializeSettings(): Promise<ApiResponse<void>> {
    return apiRequest('/settings/init', {
      method: 'POST',
    });
  },
};

// Auth API
export const authApi = {
  // Login - Call real backend API
  async login(username: string, password: string): Promise<ApiResponse<any>> {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  // Register
  async register(userData: any): Promise<ApiResponse<number>> {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Get profile
  async getProfile(): Promise<ApiResponse<any>> {
    return apiRequest('/auth/profile');
  },

  // Logout
  async logout(): Promise<ApiResponse<void>> {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },
};

// Export all APIs
export const api = {
  user: userApi,
  matrix: matrixApi,
  payment: paymentApi,
  settings: settingsApi,
  auth: authApi,
};

// Export adminApiService for pages that import from '../../api'
export { adminApiService } from './adminApi'; 