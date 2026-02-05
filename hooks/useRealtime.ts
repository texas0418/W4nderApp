// ============================================================================
// useRealtime Hook
// React hook for subscribing to real-time updates
// ============================================================================

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  ConnectionStatus,
  ConnectionInfo,
  ChannelType,
  BaseMessage,
  MessageType,
  MessageHandler,
  ItineraryUpdatedMessage,
  ActivityUpdateMessage,
  PartnerJoinedMessage,
  PartnerLeftMessage,
  PartnerLocationMessage,
  ShareViewedMessage,
  SuggestionReceivedMessage,
  BookingUpdateMessage,
  PresenceUpdateMessage,
  UserPresence,
  TypingIndicator,
} from '../types/realtime';
import { webSocketService } from '../services/webSocketService';

// ============================================================================
// useRealtimeConnection - Connection management
// ============================================================================

interface UseRealtimeConnectionOptions {
  autoConnect?: boolean;
  authToken?: string;
  userId?: string;
  onConnectionChange?: (status: ConnectionStatus) => void;
}

export function useRealtimeConnection(options: UseRealtimeConnectionOptions = {}) {
  const { autoConnect = true, authToken, userId, onConnectionChange } = options;
  
  const [status, setStatus] = useState<ConnectionStatus>(webSocketService.getStatus());
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>(
    webSocketService.getConnectionInfo()
  );
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Set up event handlers
    webSocketService.setEventHandlers({
      onConnect: () => {
        setStatus('connected');
        setError(null);
        setConnectionInfo(webSocketService.getConnectionInfo());
        onConnectionChange?.('connected');
      },
      onDisconnect: (reason) => {
        setStatus('disconnected');
        setConnectionInfo(webSocketService.getConnectionInfo());
        onConnectionChange?.('disconnected');
      },
      onReconnecting: (attempt) => {
        setStatus('reconnecting');
        setConnectionInfo(webSocketService.getConnectionInfo());
        onConnectionChange?.('reconnecting');
      },
      onError: (err) => {
        setStatus('error');
        setError(err);
        setConnectionInfo(webSocketService.getConnectionInfo());
        onConnectionChange?.('error');
      },
    });

    // Auto-connect if enabled
    if (autoConnect && authToken) {
      webSocketService.connect(authToken, userId);
    }

    return () => {
      // Don't disconnect on unmount - service persists
    };
  }, [autoConnect, authToken, userId]);

  const connect = useCallback(() => {
    webSocketService.connect(authToken, userId);
  }, [authToken, userId]);

  const disconnect = useCallback(() => {
    webSocketService.disconnect();
  }, []);

  const reconnect = useCallback(() => {
    webSocketService.reconnect();
  }, []);

  return {
    status,
    connectionInfo,
    error,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
    isReconnecting: status === 'reconnecting',
    connect,
    disconnect,
    reconnect,
  };
}

// ============================================================================
// useRealtimeSubscription - Generic subscription hook
// ============================================================================

interface UseRealtimeSubscriptionOptions<T = BaseMessage> {
  channel: ChannelType;
  resourceId: string;
  enabled?: boolean;
  filter?: (message: BaseMessage) => boolean;
  onMessage?: (message: T) => void;
}

export function useRealtimeSubscription<T extends BaseMessage = BaseMessage>({
  channel,
  resourceId,
  enabled = true,
  filter,
  onMessage,
}: UseRealtimeSubscriptionOptions<T>) {
  const [lastMessage, setLastMessage] = useState<T | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const subscriptionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !resourceId) return;

    const handler: MessageHandler = (message: BaseMessage) => {
      setLastMessage(message as T);
      setMessageCount(prev => prev + 1);
      onMessage?.(message as T);
    };

    subscriptionIdRef.current = webSocketService.subscribe(
      channel,
      resourceId,
      handler,
      filter
    );

    return () => {
      if (subscriptionIdRef.current) {
        webSocketService.unsubscribe(subscriptionIdRef.current);
        subscriptionIdRef.current = null;
      }
    };
  }, [channel, resourceId, enabled]);

  const clearLastMessage = useCallback(() => {
    setLastMessage(null);
  }, []);

  return {
    lastMessage,
    messageCount,
    clearLastMessage,
  };
}

// ============================================================================
// useItineraryRealtime - Itinerary-specific updates
// ============================================================================

interface ItineraryUpdate {
  type: 'updated' | 'activity_added' | 'activity_updated' | 'activity_removed' | 'activity_reordered';
  itineraryId: string;
  activityId?: string;
  activity?: any;
  changes?: any[];
  updatedBy: string;
  updatedByName: string;
  timestamp: string;
}

interface UseItineraryRealtimeOptions {
  itineraryId: string;
  enabled?: boolean;
  onUpdate?: (update: ItineraryUpdate) => void;
  onPartnerJoin?: (partner: { id: string; name: string }) => void;
  onPartnerLeave?: (partner: { id: string; name: string }) => void;
}

export function useItineraryRealtime({
  itineraryId,
  enabled = true,
  onUpdate,
  onPartnerJoin,
  onPartnerLeave,
}: UseItineraryRealtimeOptions) {
  const [updates, setUpdates] = useState<ItineraryUpdate[]>([]);
  const [activePartners, setActivePartners] = useState<Map<string, { name: string; joinedAt: Date }>>(new Map());
  const [lastUpdate, setLastUpdate] = useState<ItineraryUpdate | null>(null);

  // Subscribe to itinerary updates
  useRealtimeSubscription({
    channel: 'itinerary',
    resourceId: itineraryId,
    enabled,
    onMessage: (message) => {
      const update = parseItineraryMessage(message);
      if (update) {
        setLastUpdate(update);
        setUpdates(prev => [update, ...prev].slice(0, 50)); // Keep last 50
        onUpdate?.(update);
      }
    },
  });

  // Listen for partner join/leave
  useEffect(() => {
    if (!enabled) return;

    const unsubJoin = webSocketService.on<PartnerJoinedMessage>('partner_joined', (msg) => {
      if (msg.payload.resourceId === itineraryId) {
        setActivePartners(prev => {
          const next = new Map(prev);
          next.set(msg.payload.partnerId, {
            name: msg.payload.partnerName,
            joinedAt: new Date(),
          });
          return next;
        });
        onPartnerJoin?.({
          id: msg.payload.partnerId,
          name: msg.payload.partnerName,
        });
      }
    });

    const unsubLeave = webSocketService.on<PartnerLeftMessage>('partner_left', (msg) => {
      if (msg.payload.resourceId === itineraryId) {
        setActivePartners(prev => {
          const next = new Map(prev);
          next.delete(msg.payload.partnerId);
          return next;
        });
        onPartnerLeave?.({
          id: msg.payload.partnerId,
          name: msg.payload.partnerName,
        });
      }
    });

    return () => {
      unsubJoin();
      unsubLeave();
    };
  }, [itineraryId, enabled]);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
    setLastUpdate(null);
  }, []);

  return {
    updates,
    lastUpdate,
    activePartners: Array.from(activePartners.entries()).map(([id, data]) => ({
      id,
      ...data,
    })),
    hasActivePartners: activePartners.size > 0,
    clearUpdates,
  };
}

function parseItineraryMessage(message: BaseMessage): ItineraryUpdate | null {
  const payload = (message as any).payload;
  if (!payload?.itineraryId) return null;

  const baseUpdate = {
    itineraryId: payload.itineraryId,
    updatedBy: payload.updatedBy || 'unknown',
    updatedByName: payload.updatedByName || 'Someone',
    timestamp: message.timestamp,
  };

  switch (message.type) {
    case 'itinerary_updated':
      return { ...baseUpdate, type: 'updated', changes: payload.changes };
    case 'itinerary_activity_added':
      return { ...baseUpdate, type: 'activity_added', activityId: payload.activityId, activity: payload.activity };
    case 'itinerary_activity_updated':
      return { ...baseUpdate, type: 'activity_updated', activityId: payload.activityId, activity: payload.activity };
    case 'itinerary_activity_removed':
      return { ...baseUpdate, type: 'activity_removed', activityId: payload.activityId };
    case 'itinerary_activity_reordered':
      return { ...baseUpdate, type: 'activity_reordered' };
    default:
      return null;
  }
}

// ============================================================================
// usePartnerLocation - Partner location tracking
// ============================================================================

interface UsePartnerLocationOptions {
  partnerId: string;
  enabled?: boolean;
  onLocationUpdate?: (location: { lat: number; lng: number; accuracy?: number }) => void;
}

export function usePartnerLocation({
  partnerId,
  enabled = true,
  onLocationUpdate,
}: UsePartnerLocationOptions) {
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
    heading?: number;
    updatedAt: Date;
  } | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const unsub = webSocketService.on<PartnerLocationMessage>('partner_location', (msg) => {
      if (msg.payload.partnerId === partnerId) {
        const loc = {
          lat: msg.payload.coordinates.lat,
          lng: msg.payload.coordinates.lng,
          accuracy: msg.payload.accuracy,
          heading: msg.payload.heading,
          updatedAt: new Date(msg.payload.updatedAt),
        };
        setLocation(loc);
        setIsSharing(true);
        onLocationUpdate?.(loc);
      }
    });

    return unsub;
  }, [partnerId, enabled]);

  const shareMyLocation = useCallback((coordinates: { lat: number; lng: number }, accuracy?: number) => {
    webSocketService.sendLocationUpdate(coordinates, accuracy);
  }, []);

  return {
    location,
    isSharing,
    shareMyLocation,
  };
}

// ============================================================================
// useTypingIndicator - Typing indicator management
// ============================================================================

interface UseTypingIndicatorOptions {
  resourceId: string;
  enabled?: boolean;
  timeout?: number; // ms before indicator expires
}

export function useTypingIndicator({
  resourceId,
  enabled = true,
  timeout = 3000,
}: UseTypingIndicatorOptions) {
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingIndicator>>(new Map());
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const unsub = webSocketService.on('partner_typing', (msg: any) => {
      const { userId, userName, isTyping } = msg.payload || {};
      if (!userId) return;

      if (isTyping) {
        // Add typing indicator
        setTypingUsers(prev => {
          const next = new Map(prev);
          next.set(userId, {
            userId,
            userName: userName || 'Someone',
            resourceId,
            startedAt: new Date(),
            expiresAt: new Date(Date.now() + timeout),
          });
          return next;
        });

        // Clear existing timeout
        const existingTimeout = timeoutRefs.current.get(userId);
        if (existingTimeout) clearTimeout(existingTimeout);

        // Set new timeout to remove indicator
        const newTimeout = setTimeout(() => {
          setTypingUsers(prev => {
            const next = new Map(prev);
            next.delete(userId);
            return next;
          });
          timeoutRefs.current.delete(userId);
        }, timeout);
        timeoutRefs.current.set(userId, newTimeout);
      } else {
        // Remove typing indicator
        setTypingUsers(prev => {
          const next = new Map(prev);
          next.delete(userId);
          return next;
        });
        const existingTimeout = timeoutRefs.current.get(userId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          timeoutRefs.current.delete(userId);
        }
      }
    });

    return () => {
      unsub();
      // Clear all timeouts
      timeoutRefs.current.forEach(t => clearTimeout(t));
      timeoutRefs.current.clear();
    };
  }, [resourceId, enabled, timeout]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!enabled) return;

    // Debounce typing indicators
    if (isTyping && !isTypingRef.current) {
      isTypingRef.current = true;
      webSocketService.sendTypingIndicator(resourceId, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        webSocketService.sendTypingIndicator(resourceId, false);
      }, timeout);
    } else {
      isTypingRef.current = false;
      webSocketService.sendTypingIndicator(resourceId, false);
    }
  }, [resourceId, enabled, timeout]);

  const typingUsersList = useMemo(
    () => Array.from(typingUsers.values()),
    [typingUsers]
  );

  return {
    typingUsers: typingUsersList,
    isAnyoneTyping: typingUsers.size > 0,
    typingText: formatTypingText(typingUsersList),
    sendTyping,
  };
}

function formatTypingText(users: TypingIndicator[]): string {
  if (users.length === 0) return '';
  if (users.length === 1) return `${users[0].userName} is typing...`;
  if (users.length === 2) return `${users[0].userName} and ${users[1].userName} are typing...`;
  return `${users.length} people are typing...`;
}

// ============================================================================
// useShareNotifications - Share/view notifications
// ============================================================================

interface ShareNotification {
  type: 'viewed' | 'accepted' | 'declined' | 'suggestion';
  shareId?: string;
  itineraryId: string;
  userId: string;
  userName: string;
  timestamp: Date;
  suggestion?: {
    id: string;
    type: string;
    message: string;
  };
}

interface UseShareNotificationsOptions {
  itineraryId: string;
  enabled?: boolean;
  onShareViewed?: (notification: ShareNotification) => void;
  onSuggestionReceived?: (notification: ShareNotification) => void;
}

export function useShareNotifications({
  itineraryId,
  enabled = true,
  onShareViewed,
  onSuggestionReceived,
}: UseShareNotificationsOptions) {
  const [notifications, setNotifications] = useState<ShareNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const unsubViewed = webSocketService.on<ShareViewedMessage>('share_viewed', (msg) => {
      if (msg.payload.itineraryId === itineraryId) {
        const notification: ShareNotification = {
          type: 'viewed',
          shareId: msg.payload.shareId,
          itineraryId: msg.payload.itineraryId,
          userId: msg.payload.viewedBy,
          userName: msg.payload.viewedByName,
          timestamp: new Date(msg.payload.viewedAt),
        };
        setNotifications(prev => [notification, ...prev].slice(0, 20));
        setUnreadCount(prev => prev + 1);
        onShareViewed?.(notification);
      }
    });

    const unsubSuggestion = webSocketService.on<SuggestionReceivedMessage>('suggestion_received', (msg) => {
      if (msg.payload.itineraryId === itineraryId) {
        const notification: ShareNotification = {
          type: 'suggestion',
          itineraryId: msg.payload.itineraryId,
          userId: msg.payload.suggestedBy,
          userName: msg.payload.suggestedByName,
          timestamp: new Date(msg.timestamp),
          suggestion: {
            id: msg.payload.suggestionId,
            type: msg.payload.type,
            message: msg.payload.message,
          },
        };
        setNotifications(prev => [notification, ...prev].slice(0, 20));
        setUnreadCount(prev => prev + 1);
        onSuggestionReceived?.(notification);
      }
    });

    return () => {
      unsubViewed();
      unsubSuggestion();
    };
  }, [itineraryId, enabled]);

  const markAllRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    hasUnread: unreadCount > 0,
    markAllRead,
    clearNotifications,
  };
}

// ============================================================================
// useBookingUpdates - Booking status updates
// ============================================================================

interface BookingUpdate {
  bookingId: string;
  status: string;
  confirmationNumber?: string;
  changes?: Record<string, any>;
  timestamp: Date;
}

interface UseBookingUpdatesOptions {
  bookingId?: string;
  bookingIds?: string[];
  enabled?: boolean;
  onUpdate?: (update: BookingUpdate) => void;
}

export function useBookingUpdates({
  bookingId,
  bookingIds = [],
  enabled = true,
  onUpdate,
}: UseBookingUpdatesOptions) {
  const [updates, setUpdates] = useState<BookingUpdate[]>([]);
  const [latestStatuses, setLatestStatuses] = useState<Map<string, string>>(new Map());

  const idsToWatch = useMemo(() => {
    const ids = new Set(bookingIds);
    if (bookingId) ids.add(bookingId);
    return ids;
  }, [bookingId, bookingIds]);

  useEffect(() => {
    if (!enabled || idsToWatch.size === 0) return;

    const messageTypes: MessageType[] = ['booking_confirmed', 'booking_updated', 'booking_cancelled'];
    
    const unsubs = messageTypes.map(type =>
      webSocketService.on<BookingUpdateMessage>(type, (msg) => {
        if (idsToWatch.has(msg.payload.bookingId)) {
          const update: BookingUpdate = {
            bookingId: msg.payload.bookingId,
            status: msg.payload.status,
            confirmationNumber: msg.payload.confirmationNumber,
            changes: msg.payload.changes,
            timestamp: new Date(msg.timestamp),
          };
          
          setUpdates(prev => [update, ...prev].slice(0, 50));
          setLatestStatuses(prev => {
            const next = new Map(prev);
            next.set(msg.payload.bookingId, msg.payload.status);
            return next;
          });
          onUpdate?.(update);
        }
      })
    );

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [idsToWatch, enabled]);

  const getStatus = useCallback((id: string) => {
    return latestStatuses.get(id);
  }, [latestStatuses]);

  return {
    updates,
    latestStatuses: Object.fromEntries(latestStatuses),
    getStatus,
  };
}

// ============================================================================
// usePresence - User presence tracking
// ============================================================================

interface UsePresenceOptions {
  userIds: string[];
  enabled?: boolean;
}

export function usePresence({ userIds, enabled = true }: UsePresenceOptions) {
  const [presence, setPresence] = useState<Map<string, UserPresence>>(new Map());

  useEffect(() => {
    if (!enabled || userIds.length === 0) return;

    const userIdSet = new Set(userIds);

    const unsubPresence = webSocketService.on<PresenceUpdateMessage>('presence_update', (msg) => {
      if (userIdSet.has(msg.payload.userId)) {
        setPresence(prev => {
          const next = new Map(prev);
          next.set(msg.payload.userId, {
            userId: msg.payload.userId,
            userName: msg.payload.userName,
            status: msg.payload.status,
            lastSeenAt: msg.payload.lastSeenAt ? new Date(msg.payload.lastSeenAt) : new Date(),
            currentActivity: msg.payload.currentActivity,
          });
          return next;
        });
      }
    });

    const unsubOnline = webSocketService.on('user_online', (msg: any) => {
      if (userIdSet.has(msg.payload?.userId)) {
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
      }
    });

    const unsubOffline = webSocketService.on('user_offline', (msg: any) => {
      if (userIdSet.has(msg.payload?.userId)) {
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
      }
    });

    return () => {
      unsubPresence();
      unsubOnline();
      unsubOffline();
    };
  }, [userIds, enabled]);

  const isOnline = useCallback((userId: string) => {
    return presence.get(userId)?.status === 'online';
  }, [presence]);

  const getPresence = useCallback((userId: string) => {
    return presence.get(userId);
  }, [presence]);

  return {
    presence: Array.from(presence.values()),
    presenceMap: presence,
    isOnline,
    getPresence,
    onlineCount: Array.from(presence.values()).filter(p => p.status === 'online').length,
  };
}

export default {
  useRealtimeConnection,
  useRealtimeSubscription,
  useItineraryRealtime,
  usePartnerLocation,
  useTypingIndicator,
  useShareNotifications,
  useBookingUpdates,
  usePresence,
};
