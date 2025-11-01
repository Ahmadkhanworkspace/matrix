import io from 'socket.io-client';

type SocketType = ReturnType<typeof io>;

class RealtimeService {
  private socket: SocketType | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private isConnected: boolean = false;
  private userId: string | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor() {
    this.connect();
  }

  private connect() {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const socketUrl = API_URL.replace('/api', '');

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Real-time connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Join all users room
      this.socket?.emit('join_all');
      
      // Rejoin user room if userId was set
      if (this.userId) {
        this.joinUser(this.userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Real-time disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Real-time connection error:', error);
      this.reconnectAttempts++;
    });

    this.socket.on('admin_update', (data: { event: string; data: any; timestamp: Date }) => {
      // Trigger all listeners for this event
      const eventListeners = this.listeners.get(data.event);
      if (eventListeners) {
        eventListeners.forEach(callback => callback(data.data));
      }

      // Also trigger generic 'update' listeners
      const genericListeners = this.listeners.get('update');
      if (genericListeners) {
        genericListeners.forEach(callback => callback(data));
      }
    });

    this.socket.on('user_notification', (data: { event: string; data: any; timestamp: Date }) => {
      // Trigger notification listeners
      const notificationListeners = this.listeners.get('notification');
      if (notificationListeners) {
        notificationListeners.forEach(callback => callback(data));
      }

      // Trigger specific event listeners
      const eventListeners = this.listeners.get(data.event);
      if (eventListeners) {
        eventListeners.forEach(callback => callback(data.data));
      }
    });
  }

  public joinUser(userId: string) {
    this.userId = userId;
    if (this.socket && this.isConnected) {
      this.socket.emit('join_user', userId);
      console.log(`Joined user room: ${userId}`);
    }
  }

  public on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  public off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  public emit(event: string, data: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.userId = null;
      this.listeners.clear();
    }
  }

  public getConnected(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
const realtimeService = new RealtimeService();
export default realtimeService;

