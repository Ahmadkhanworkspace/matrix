import { useEffect, useState } from 'react';
import realtimeService from '../services/realtimeService';

export function useRealtime(event: string, callback?: (data: any) => void) {
  const [data, setData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(realtimeService.getConnected());

  useEffect(() => {
    const handleUpdate = (updateData: any) => {
      setData(updateData);
      if (callback) {
        callback(updateData);
      }
    };

    const unsubscribe = realtimeService.on(event, handleUpdate);

    // Check connection status periodically
    const interval = setInterval(() => {
      setIsConnected(realtimeService.getConnected());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [event, callback]);

  return { data, isConnected };
}

export function useRealtimeUpdates() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(realtimeService.getConnected());

  useEffect(() => {
    const handleUpdate = (updateData: { event: string; data: any; timestamp: Date }) => {
      setUpdates(prev => [...prev, updateData].slice(-50)); // Keep last 50 updates
    };

    const unsubscribe = realtimeService.on('update', handleUpdate);

    const interval = setInterval(() => {
      setIsConnected(realtimeService.getConnected());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return { updates, isConnected, clearUpdates: () => setUpdates([]) };
}

export function useUserNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(realtimeService.getConnected());

  useEffect(() => {
    if (!userId) return;

    // Join user room
    realtimeService.joinUser(userId);

    const handleNotification = (notificationData: { event: string; data: any; timestamp: Date }) => {
      setNotifications(prev => [notificationData, ...prev].slice(0, 50)); // Keep last 50 notifications
    };

    const unsubscribe = realtimeService.on('notification', handleNotification);

    const interval = setInterval(() => {
      setIsConnected(realtimeService.getConnected());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [userId]);

  return { notifications, isConnected, clearNotifications: () => setNotifications([]) };
}

