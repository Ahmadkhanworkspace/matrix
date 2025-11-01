import React, { createContext, useContext, useEffect, useState } from 'react';
import realtimeService from '../services/realtimeService';
import { useAuth } from './AuthContext';

interface RealtimeContextType {
  isConnected: boolean;
  updates: any[];
  clearUpdates: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(realtimeService.getConnected());
  const [updates, setUpdates] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // Monitor connection status
    const interval = setInterval(() => {
      setIsConnected(realtimeService.getConnected());
    }, 2000);

    // Listen for admin updates
    const unsubscribe = realtimeService.on('update', (data: any) => {
      setUpdates(prev => [...prev, data].slice(-50)); // Keep last 50 updates
    });

    // Join admin room if authenticated
    if (user) {
      realtimeService.emit('join_admin', {});
    }

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [user]);

  const clearUpdates = () => {
    setUpdates([]);
  };

  return (
    <RealtimeContext.Provider value={{ isConnected, updates, clearUpdates }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

