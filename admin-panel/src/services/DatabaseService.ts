import { api } from '../api';

export class DatabaseService {
  // Get all users
  static async getAllUsers(limit?: number, offset?: number, status?: number) {
    try {
      const response = await api.user.getAllUsers(limit, offset, status);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(id: number) {
    try {
      const response = await api.user.getUserById(id);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Update user
  static async updateUser(id: number, updates: any) {
    try {
      await api.user.updateUser(id, updates);
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Update user status
  static async updateUserStatus(id: number, status: number) {
    try {
      await api.user.updateUserStatus(id, status);
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  // Delete user
  static async deleteUser(id: number) {
    try {
      await api.user.deleteUser(id);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Get user statistics
  static async getUserStats() {
    try {
      const response = await api.user.getUserStats();
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  // Search users
  static async searchUsers(searchTerm: string, limit?: number, offset?: number) {
    try {
      const response = await api.user.searchUsers(searchTerm, limit, offset);
      return response.data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Get all matrix configurations
  static async getMatrixConfigs() {
    try {
      const response = await api.matrix.getMatrixConfigs();
      return response.data || [];
    } catch (error) {
      console.error('Error fetching matrix configs:', error);
      throw error;
    }
  }

  // Get matrix configuration by ID
  static async getMatrixConfig(id: number) {
    try {
      const response = await api.matrix.getMatrixConfig(id);
      return response.data;
    } catch (error) {
      console.error('Error fetching matrix config:', error);
      throw error;
    }
  }

  // Create matrix configuration
  static async createMatrixConfig(config: any) {
    try {
      const response = await api.matrix.createMatrixConfig(config);
      return response.data;
    } catch (error) {
      console.error('Error creating matrix config:', error);
      throw error;
    }
  }

  // Update matrix configuration
  static async updateMatrixConfig(id: number, config: any) {
    try {
      await api.matrix.updateMatrixConfig(id, config);
      return true;
    } catch (error) {
      console.error('Error updating matrix config:', error);
      throw error;
    }
  }

  // Delete matrix configuration
  static async deleteMatrixConfig(id: number) {
    try {
      await api.matrix.deleteMatrixConfig(id);
      return true;
    } catch (error) {
      console.error('Error deleting matrix config:', error);
      throw error;
    }
  }

  // Get matrix statistics
  static async getMatrixStats(matrixId: number) {
    try {
      const response = await api.matrix.getMatrixStats(matrixId);
      return response.data;
    } catch (error) {
      console.error('Error fetching matrix stats:', error);
      throw error;
    }
  }

  // Get matrix positions
  static async getMatrixPositions(matrixId: number, limit?: number, offset?: number) {
    try {
      const response = await api.matrix.getMatrixPositions(matrixId, limit, offset);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching matrix positions:', error);
      throw error;
    }
  }

  // Process matrix entry
  static async processMatrixEntry(username: string, matrixId: number, sponsor?: string) {
    try {
      const response = await api.matrix.processMatrixEntry(username, matrixId, sponsor);
      return response.data;
    } catch (error) {
      console.error('Error processing matrix entry:', error);
      throw error;
    }
  }

  // Get all transactions
  static async getTransactions(limit?: number, offset?: number, type?: string, status?: string) {
    try {
      const response = await api.payment.getTransactions(limit, offset, type, status);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  // Get deposits
  static async getDeposits(limit?: number, offset?: number, status?: string) {
    try {
      const response = await api.payment.getDeposits(limit, offset, status);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching deposits:', error);
      throw error;
    }
  }

  // Get withdrawals
  static async getWithdrawals(limit?: number, offset?: number, status?: string) {
    try {
      const response = await api.payment.getWithdrawals(limit, offset, status);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      throw error;
    }
  }

  // Process deposit
  static async processDeposit(username: string, amount: number, currency: string = 'TRX', transactionId?: string) {
    try {
      await api.payment.processDeposit(username, amount, currency, transactionId);
      return true;
    } catch (error) {
      console.error('Error processing deposit:', error);
      throw error;
    }
  }

  // Process withdrawal
  static async processWithdrawal(username: string, amount: number, currency: string = 'TRX') {
    try {
      await api.payment.processWithdrawal(username, amount, currency);
      return true;
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      throw error;
    }
  }

  // Approve transaction
  static async approveTransaction(id: number) {
    try {
      await api.payment.approveTransaction(id);
      return true;
    } catch (error) {
      console.error('Error approving transaction:', error);
      throw error;
    }
  }

  // Reject transaction
  static async rejectTransaction(id: number) {
    try {
      await api.payment.rejectTransaction(id);
      return true;
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      throw error;
    }
  }

  // Get payment statistics
  static async getPaymentStats() {
    try {
      const response = await api.payment.getPaymentStats();
      return response.data;
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  }

  // Get all settings
  static async getAllSettings() {
    try {
      const response = await api.settings.getAllSettings();
      return response.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  }

  // Get setting by key
  static async getSetting(key: string) {
    try {
      const response = await api.settings.getSetting(key);
      return response.data;
    } catch (error) {
      console.error('Error fetching setting:', error);
      throw error;
    }
  }

  // Update setting
  static async updateSetting(key: string, value: any, description?: string) {
    try {
      await api.settings.updateSetting(key, value, description);
      return true;
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  }

  // Delete setting
  static async deleteSetting(key: string) {
    try {
      await api.settings.deleteSetting(key);
      return true;
    } catch (error) {
      console.error('Error deleting setting:', error);
      throw error;
    }
  }

  // Initialize default settings
  static async initializeSettings() {
    try {
      await api.settings.initializeSettings();
      return true;
    } catch (error) {
      console.error('Error initializing settings:', error);
      throw error;
    }
  }
} 