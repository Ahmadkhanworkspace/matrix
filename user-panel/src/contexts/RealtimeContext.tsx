import React, { createContext, useContext, useEffect, useState } from 'react';
import realtimeService from '../services/realtimeService';
import { useAuth } from './AuthContext';

interface RealtimeContextType {
  isConnected: boolean;
  updates: any[];
  notifications: any[];
  clearUpdates: () => void;
  clearNotifications: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(realtimeService.getConnected());
  const [updates, setUpdates] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // Monitor connection status
    const interval = setInterval(() => {
      setIsConnected(realtimeService.getConnected());
    }, 2000);

    // Listen for admin updates
    const unsubscribeUpdate = realtimeService.on('update', (data: any) => {
      setUpdates(prev => [...prev, data].slice(-50)); // Keep last 50 updates
    });

    // Listen for user notifications
    const unsubscribeNotification = realtimeService.on('notification', (data: any) => {
      setNotifications(prev => [data, ...prev].slice(0, 50)); // Keep last 50 notifications
    });

    // Join user room if authenticated
    if (user?.id) {
      realtimeService.joinUser(user.id.toString());
      realtimeService.emit('join_all', {});
    }

    return () => {
      unsubscribeUpdate();
      unsubscribeNotification();
      clearInterval(interval);
    };
  }, [user]);

  const clearUpdates = () => {
    setUpdates([]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <RealtimeContext.Provider value={{ isConnected, updates, notifications, clearUpdates, clearNotifications }}>
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

