import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  status: 'free' | 'pro';
  balance: number;
  purchase_balance: number;
  total_earnings: number;
  total_paid: number;
  total_positions: number;
  total_referrals: number;
  join_date: string;
  last_login: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on app start and verify token
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        
        // Optionally verify token with backend
        // For now, just restore from localStorage
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // Verify token is still valid (optional - can be async)
        // You can add a call to /api/auth/profile here to verify
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Use real API for authentication
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      console.log('🔍 Login attempt:', { 
        API_URL, 
        username, 
        endpoint: `${API_URL}/auth/login` 
      });
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('📡 Login response:', {
        status: response.status,
        ok: response.ok,
        url: response.url
      });

      const data = await response.json();
      console.log('📦 Login data:', data);

      if (response.ok && data.success && data.data?.token) {
        // Store token and user data
        localStorage.setItem('authToken', data.data.token);
        
        // Map backend user data to frontend User interface
        if (data.data.user) {
          const userData = data.data.user;
          const mappedUser: User = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            first_name: userData.first_name || userData.firstName || '',
            last_name: userData.last_name || userData.lastName || '',
            status: (userData.status === 1 || userData.status === 'ACTIVE' || userData.memberType === 'PRO') ? 'pro' : 'free',
            balance: userData.balance || userData.unpaidEarnings || userData.unpaid_earnings || 0,
            purchase_balance: userData.purchaseBalance || userData.purchase_balance || 0,
            total_earnings: userData.totalEarnings || userData.total_earnings || userData.Total || 0,
            total_paid: userData.totalPaid || userData.total_paid || userData.Paid || userData.paidEarnings || 0,
            total_positions: userData.totalPositions || userData.total_positions || 0,
            total_referrals: userData.totalReferrals || userData.total_referrals || 0,
            join_date: userData.join_date || userData.joinDate || userData.createdAt || new Date().toISOString(),
            last_login: userData.last_login || userData.lastLogin || userData.lastLogin || new Date().toISOString(),
          };
          
          setUser(mappedUser);
          setIsAuthenticated(true);
          localStorage.setItem('userData', JSON.stringify(mappedUser));
        }

        console.log('✅ Login successful!');
        return true;
      } else {
        // Invalid credentials or error
        console.error('❌ Login failed:', {
          success: data.success,
          error: data.error,
          message: data.message
        });
        return false;
      }
    } catch (error: any) {
      console.error('❌ Login error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 