import React from 'react';
import { useRealtime } from '../contexts/RealtimeContext';
import { Wifi, WifiOff } from 'lucide-react';

const ConnectionStatus: React.FC = () => {
  const { isConnected } = useRealtime();

  return (
    <div className="flex items-center space-x-2">
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-xs text-gray-600">Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          <span className="text-xs text-red-600">Disconnected</span>
        </>
      )}
    </div>
  );
};

export default ConnectionStatus;

