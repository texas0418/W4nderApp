// ============================================================================
// RealtimeContext - React Context Provider for Real-time Updates
// ============================================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ConnectionStatus,
  ConnectionInfo,
  WebSocketConfig,
  ChannelType,
  BaseMessage,
  UserPresence,
} from '../types/realtime';
import { webSocketService } from '../services/webSocketService';

// ============================================================================
// Context Types
// ============================================================================

interface RealtimeContextValue {
  // Connection
  status: ConnectionStatus;
  connectionInfo: ConnectionInfo;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  
  // Actions
  connect: (authToken?: string, userId?: string) => void;
  disconnect: () => void;
  reconnect: () => void;
  
  // Subscriptions
  subscribe: (
    channel: ChannelType,
    resourceId: string,
    handler: (message: BaseMessage) => void
  ) => string;
  unsubscribe: (subscriptionId: string) => void;
  
  // Presence
  presence: Map<string, UserPresence>;
  setMyPresence: (activity?: string) => void;
  
  // Notifications
  unreadCount: number;
  markAllRead: () => void;
  
  // Debug
  lastMessage: BaseMessage | null;
  messageLog: BaseMessage[];
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

// ============================================================================
// Provider Props
// ============================================================================

interface RealtimeProviderProps {
  children: ReactNode;
  
  // Auth
  authToken?: string;
  userId?: string;
  
  // Config
  config?: Partial<WebSocketConfig>;
  
  // Options
  autoConnect?: boolean;
  persistConnection?: boolean;
  debug?: boolean;
  
  // Callbacks
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onMessage?: (message: BaseMessage) => void;
}

// ============================================================================
// Provider Component
// ============================================================================

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({
  children,
  authToken,
  userId,
  config,
  autoConnect = true,
  persistConnection = true,
  debug = __DEV__,
  onConnect,
  onDisconnect,
  onError,
  onMessage,
}) => {
  // ─────────────────────────────────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────────────────────────────────
  
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    status: 'disconnected',
    reconnectAttempts: 0,
  });
  const [error, setError] = useState<Error | null>(null);
  const [presence, setPresence] = useState<Map<string, UserPresence>>(new Map());
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessage, setLastMessage] = useState<BaseMessage | null>(null);
  const [messageLog, setMessageLog] = useState<BaseMessage[]>([]);

  // ─────────────────────────────────────────────────────────────────────────
  // Connection Management
  // ─────────────────────────────────────────────────────────────────────────
  
  useEffect(() => {
    // Set up event handlers
    webSocketService.setEventHandlers({
      onConnect: () => {
        setStatus('connected');
        setError(null);
        setConnectionInfo(webSocketService.getConnectionInfo());
        onConnect?.();
      },
      onDisconnect: (reason) => {
        setStatus('disconnected');
        setConnectionInfo(webSocketService.getConnectionInfo());
        onDisconnect?.();
      },
      onReconnecting: (attempt) => {
        setStatus('reconnecting');
        setConnectionInfo(webSocketService.getConnectionInfo());
      },
      onError: (err) => {
        setStatus('error');
        setError(err);
        setConnectionInfo(webSocketService.getConnectionInfo());
        onError?.(err);
      },
      onMessage: (message) => {
        setLastMessage(message);
        if (debug) {
          setMessageLog(prev => [message, ...prev].slice(0, 100));
        }
        onMessage?.(message);
        
        // Handle notification messages
        if (message.type === 'notification') {
          setUnreadCount(prev => prev + 1);
        }
      },
    });

    // Auto-connect if enabled and we have auth
    if (autoConnect && authToken) {
      webSocketService.connect(authToken, userId);
    }

    // Cleanup on unmount
    return () => {
      if (!persistConnection) {
        webSocketService.disconnect();
      }
    };
  }, [authToken, userId, autoConnect, persistConnection, debug]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active' && status === 'disconnected' && autoConnect) {
        // Reconnect when app becomes active
        if (authToken) {
          webSocketService.connect(authToken, userId);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [status, autoConnect, authToken, userId]);

  // ─────────────────────────────────────────────────────────────────────────
  // Presence Updates
  // ─────────────────────────────────────────────────────────────────────────
  
  useEffect(() => {
    if (status !== 'connected') return;

    const unsubPresence = webSocketService.on('presence_update', (msg: any) => {
      setPresence(prev => {
        const next = new Map(prev);
        next.set(msg.payload.userId, {
          userId: msg.payload.userId,
          userName: msg.payload.userName,
          status: msg.payload.status,
          lastSeenAt: new Date(msg.payload.lastSeenAt || Date.now()),
          currentActivity: msg.payload.currentActivity,
        });
        return next;
      });
    });

    const unsubOnline = webSocketService.on('user_online', (msg: any) => {
      setPresence(prev => {
        const next = new Map(prev);
        const existing = next.get(msg.payload.userId);
        next.set(msg.payload.userId, {
          ...existing,
          userId: msg.payload.userId,
          userName: msg.payload.userName || existing?.userName || 'User',
          status: 'online',
          lastSeenAt: new Date(),
        });
        return next;
      });
    });

    const unsubOffline = webSocketService.on('user_offline', (msg: any) => {
      setPresence(prev => {
        const next = new Map(prev);
        const existing = next.get(msg.payload.userId);
        if (existing) {
          next.set(msg.payload.userId, {
            ...existing,
            status: 'offline',
            lastSeenAt: new Date(),
          });
        }
        return next;
      });
    });

    return () => {
      unsubPresence();
      unsubOnline();
      unsubOffline();
    };
  }, [status]);

  // ─────────────────────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────────────────────
  
  const connect = useCallback((token?: string, user?: string) => {
    webSocketService.connect(token || authToken, user || userId);
  }, [authToken, userId]);

  const disconnect = useCallback(() => {
    webSocketService.disconnect();
  }, []);

  const reconnect = useCallback(() => {
    webSocketService.reconnect();
  }, []);

  const subscribe = useCallback((
    channel: ChannelType,
    resourceId: string,
    handler: (message: BaseMessage) => void
  ) => {
    return webSocketService.subscribe(channel, resourceId, handler);
  }, []);

  const unsubscribe = useCallback((subscriptionId: string) => {
    webSocketService.unsubscribe(subscriptionId);
  }, []);

  const setMyPresence = useCallback((activity?: string) => {
    webSocketService.sendViewingIndicator('app', activity || 'active');
  }, []);

  const markAllRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Context Value
  // ─────────────────────────────────────────────────────────────────────────
  
  const contextValue = useMemo<RealtimeContextValue>(() => ({
    // Connection
    status,
    connectionInfo,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting' || status === 'reconnecting',
    error,
    
    // Actions
    connect,
    disconnect,
    reconnect,
    
    // Subscriptions
    subscribe,
    unsubscribe,
    
    // Presence
    presence,
    setMyPresence,
    
    // Notifications
    unreadCount,
    markAllRead,
    
    // Debug
    lastMessage,
    messageLog,
  }), [
    status,
    connectionInfo,
    error,
    connect,
    disconnect,
    reconnect,
    subscribe,
    unsubscribe,
    presence,
    setMyPresence,
    unreadCount,
    markAllRead,
    lastMessage,
    messageLog,
  ]);

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================

export function useRealtimeContext(): RealtimeContextValue {
  const context = useContext(RealtimeContext);
  
  if (!context) {
    throw new Error('useRealtimeContext must be used within a RealtimeProvider');
  }
  
  return context;
}

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Quick access to connection status
 */
export function useConnectionStatus() {
  const { status, isConnected, isConnecting, error, reconnect } = useRealtimeContext();
  return { status, isConnected, isConnecting, error, reconnect };
}

/**
 * Quick access to presence data
 */
export function usePresenceContext() {
  const { presence, setMyPresence } = useRealtimeContext();
  return { presence, setMyPresence };
}

/**
 * Quick access to unread notifications
 */
export function useRealtimeNotifications() {
  const { unreadCount, markAllRead } = useRealtimeContext();
  return { unreadCount, markAllRead };
}

export default RealtimeProvider;
