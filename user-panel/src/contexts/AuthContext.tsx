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
    // Check if user is logged in on app start
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Dummy credentials for testing
      const dummyCredentials = {
        'admin': 'admin123',
        'user': 'user123',
        'demo': 'demo123',
        'test': 'test123'
      };

      // Check if credentials match dummy accounts
      if (dummyCredentials[username as keyof typeof dummyCredentials] === password) {
        const mockUser: User = {
          id: username === 'admin' ? 1 : 2,
          username: username,
          email: `${username}@example.com`,
          first_name: username === 'admin' ? 'Admin' : 'User',
          last_name: username === 'admin' ? 'User' : 'Demo',
          status: username === 'admin' ? 'pro' : 'free',
          balance: username === 'admin' ? 5000.00 : 1250.50,
          purchase_balance: username === 'admin' ? 2000.00 : 500.00,
          total_earnings: username === 'admin' ? 15000.00 : 5000.00,
          total_paid: username === 'admin' ? 8000.00 : 2500.00,
          total_positions: username === 'admin' ? 15 : 8,
          total_referrals: username === 'admin' ? 25 : 12,
          join_date: '2024-01-01',
          last_login: new Date().toISOString()
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        setUser(mockUser);
        setIsAuthenticated(true);
        localStorage.setItem('authToken', 'mock-token');
        localStorage.setItem('userData', JSON.stringify(mockUser));

        return true;
      } else {
        // Invalid credentials
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
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