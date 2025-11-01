import React from 'react';
import { useRealtimeToast } from '../hooks/useRealtimeToast';

const RealtimeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useRealtimeToast();
  return <>{children}</>;
};

export default RealtimeWrapper;

