import { useEffect } from 'react';
import { useRealtime } from '../contexts/RealtimeContext';
import toast from 'react-hot-toast';

const eventMessages: Record<string, (data: any) => string> = {
  settings_updated: (data) => `System settings have been updated`,
  profile_updated: (data) => `Your profile has been updated`,
  matrix_position_swapped: (data) => `Your matrix position has been swapped`,
  withdrawal_approved: (data) => `Withdrawal of $${data.amount} has been approved!`,
  withdrawal_rejected: (data) => `Withdrawal request has been rejected`,
  cycle_completed: (data) => `Matrix cycle completed! Earned $${data.amount}`,
  bonus_awarded: (data) => `Bonus awarded: $${data.amount}`,
  rank_updated: (data) => `Rank system updated`,
};

export function useRealtimeToast() {
  const { updates, notifications } = useRealtime();

  useEffect(() => {
    if (updates.length > 0) {
      const lastUpdate = updates[updates.length - 1];
      const getMessage = eventMessages[lastUpdate.event] || ((data) => `System update received`);
      const message = getMessage(lastUpdate.data);

      toast(message, {
        position: 'top-right',
        duration: 4000,
        icon: '🔔',
      });
    }
  }, [updates]);

  useEffect(() => {
    if (notifications.length > 0) {
      const lastNotification = notifications[notifications.length - 1];
      const getMessage = eventMessages[lastNotification.event] || ((data) => `New notification`);
      const message = getMessage(lastNotification.data);

      toast.success(message, {
        position: 'top-right',
        duration: 5000,
        icon: '✨',
      });
    }
  }, [notifications]);
}

