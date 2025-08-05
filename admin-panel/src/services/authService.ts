import { api } from '../api';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  // Login user
  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.auth.login(credentials.username, credentials.password);
      
      if (response.data && response.data.token) {
        localStorage.setItem('admin_token', response.data.token);
        localStorage.setItem('admin_user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Register user
  async register(userData: RegisterData): Promise<number> {
    try {
      const response = await api.auth.register(userData);
      return response.data || 0;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Get current user profile
  async getProfile(): Promise<User> {
    try {
      const response = await api.auth.getProfile();
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.auth.logout();
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove local storage even if API call fails
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('admin_token');
    return !!token;
  }

  // Get current user from localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('admin_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        return null;
      }
    }
    return null;
  }

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem('admin_token');
  }
}

export default new AuthService(); 
export const authService = new AuthService(); 