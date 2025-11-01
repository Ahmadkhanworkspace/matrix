import { useEffect } from 'react';
import { useRealtime } from '../contexts/RealtimeContext';
import toast from 'react-hot-toast';

const eventMessages: Record<string, (data: any) => string> = {
  settings_updated: (data) => `Settings updated: ${data.key}`,
  user_updated: (data) => `User updated: ${data.first_name} ${data.last_name}`,
  payment_gateway_updated: (data) => `Payment gateway ${data.gateway} ${data.enabled ? 'enabled' : 'disabled'}`,
  matrix_config_updated: (data) => `Matrix configuration "${data.name}" updated`,
  matrix_position_updated: (data) => `Matrix positions updated`,
  email_campaign_sent: (data) => `Email campaign sent to ${data.sentCount} recipients`,
  rank_created: (data) => `New rank created: ${data.name}`,
  rank_updated: (data) => `Rank updated: ${data.name}`,
  transaction_updated: (data) => `Transaction ${data.transactionId} ${data.status}`,
};

export function useRealtimeToast() {
  const { updates } = useRealtime();

  useEffect(() => {
    if (updates.length > 0) {
      const lastUpdate = updates[updates.length - 1];
      const getMessage = eventMessages[lastUpdate.event] || ((data) => `Update: ${lastUpdate.event}`);
      const message = getMessage(lastUpdate.data);

      toast.success(message, {
        position: 'top-right',
        duration: 3000,
      });
    }
  }, [updates]);
}

