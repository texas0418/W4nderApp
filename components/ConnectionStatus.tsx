// ============================================================================
// ConnectionStatus Component
// Visual indicator for WebSocket connection state
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
  Check,
  Loader,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { ConnectionStatus as ConnectionStatusType } from '../types/realtime';
import { useConnectionStatus } from '../contexts/RealtimeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// Props
// ============================================================================

interface ConnectionStatusProps {
  // Display mode
  variant?: 'minimal' | 'compact' | 'banner' | 'floating';
  
  // Position (for floating variant)
  position?: 'top' | 'bottom';
  
  // Behavior
  showWhenConnected?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  
  // Actions
  onReconnect?: () => void;
  onDismiss?: () => void;
  
  // Styling
  style?: any;
}

// ============================================================================
// Status Configuration
// ============================================================================

const STATUS_CONFIG: Record<ConnectionStatusType, {
  icon: typeof Wifi;
  color: string;
  bgColor: string;
  label: string;
  message: string;
}> = {
  connected: {
    icon: Check,
    color: '#22C55E',
    bgColor: '#DCFCE7',
    label: 'Connected',
    message: 'Real-time updates active',
  },
  connecting: {
    icon: Loader,
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    label: 'Connecting',
    message: 'Establishing connection...',
  },
  disconnected: {
    icon: WifiOff,
    color: '#6B7280',
    bgColor: '#F3F4F6',
    label: 'Offline',
    message: 'No connection',
  },
  reconnecting: {
    icon: RefreshCw,
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    label: 'Reconnecting',
    message: 'Connection lost, reconnecting...',
  },
  error: {
    icon: AlertCircle,
    color: '#EF4444',
    bgColor: '#FEE2E2',
    label: 'Error',
    message: 'Connection failed',
  },
};

// ============================================================================
// Minimal Variant - Just a dot
// ============================================================================

const MinimalIndicator: React.FC<{ status: ConnectionStatusType }> = ({ status }) => {
  const config = STATUS_CONFIG[status];
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'connecting' || status === 'reconnecting') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status]);

  return (
    <Animated.View
      style={[
        styles.minimalDot,
        { backgroundColor: config.color, transform: [{ scale: pulseAnim }] },
      ]}
    />
  );
};

// ============================================================================
// Compact Variant - Icon with label
// ============================================================================

const CompactIndicator: React.FC<{
  status: ConnectionStatusType;
  onReconnect?: () => void;
}> = ({ status, onReconnect }) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const spinAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'connecting' || status === 'reconnecting') {
      const spin = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spin.start();
      return () => spin.stop();
    } else {
      spinAnim.setValue(0);
    }
  }, [status]);

  const rotation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const showReconnect = status === 'disconnected' || status === 'error';

  return (
    <View style={[styles.compactContainer, { backgroundColor: config.bgColor }]}>
      <Animated.View
        style={
          status === 'connecting' || status === 'reconnecting'
            ? { transform: [{ rotate: rotation }] }
            : undefined
        }
      >
        <Icon size={14} color={config.color} />
      </Animated.View>
      <Text style={[styles.compactLabel, { color: config.color }]}>
        {config.label}
      </Text>
      {showReconnect && onReconnect && (
        <Pressable onPress={onReconnect} style={styles.compactButton}>
          <RefreshCw size={12} color={config.color} />
        </Pressable>
      )}
    </View>
  );
};

// ============================================================================
// Banner Variant - Full width with message
// ============================================================================

const BannerIndicator: React.FC<{
  status: ConnectionStatusType;
  onReconnect?: () => void;
  onDismiss?: () => void;
}> = ({ status, onReconnect, onDismiss }) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const slideAnim = React.useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [status]);

  const showReconnect = status === 'disconnected' || status === 'error';

  return (
    <Animated.View
      style={[
        styles.bannerContainer,
        { backgroundColor: config.bgColor, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.bannerContent}>
        <Icon size={18} color={config.color} />
        <View style={styles.bannerText}>
          <Text style={[styles.bannerLabel, { color: config.color }]}>
            {config.label}
          </Text>
          <Text style={styles.bannerMessage}>{config.message}</Text>
        </View>
      </View>
      <View style={styles.bannerActions}>
        {showReconnect && onReconnect && (
          <Pressable
            style={[styles.bannerButton, { backgroundColor: config.color }]}
            onPress={onReconnect}
          >
            <RefreshCw size={14} color="#fff" />
            <Text style={styles.bannerButtonText}>Retry</Text>
          </Pressable>
        )}
        {onDismiss && (
          <Pressable style={styles.bannerDismiss} onPress={onDismiss}>
            <Text style={[styles.bannerDismissText, { color: config.color }]}>
              Dismiss
            </Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
};

// ============================================================================
// Floating Variant - Toast-like notification
// ============================================================================

const FloatingIndicator: React.FC<{
  status: ConnectionStatusType;
  position: 'top' | 'bottom';
  onReconnect?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}> = ({ status, position, onReconnect, autoHide, autoHideDelay = 3000 }) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const [visible, setVisible] = useState(true);
  const translateAnim = React.useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setVisible(true);
    
    Animated.parallel([
      Animated.spring(translateAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    if (autoHide && status === 'connected') {
      const timeout = setTimeout(() => {
        hide();
      }, autoHideDelay);
      return () => clearTimeout(timeout);
    }
  }, [status, autoHide, autoHideDelay]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateAnim, {
        toValue: position === 'top' ? -100 : 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  };

  if (!visible) return null;

  const showReconnect = status === 'disconnected' || status === 'error';

  return (
    <Animated.View
      style={[
        styles.floatingContainer,
        position === 'top' ? styles.floatingTop : styles.floatingBottom,
        {
          backgroundColor: config.bgColor,
          transform: [{ translateY: translateAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.floatingContent}>
        <View style={[styles.floatingIcon, { backgroundColor: `${config.color}20` }]}>
          <Icon size={16} color={config.color} />
        </View>
        <View style={styles.floatingText}>
          <Text style={[styles.floatingLabel, { color: config.color }]}>
            {config.label}
          </Text>
          <Text style={styles.floatingMessage}>{config.message}</Text>
        </View>
      </View>
      {showReconnect && onReconnect && (
        <Pressable
          style={[styles.floatingButton, { backgroundColor: config.color }]}
          onPress={onReconnect}
        >
          <Text style={styles.floatingButtonText}>Reconnect</Text>
        </Pressable>
      )}
    </Animated.View>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const ConnectionStatusIndicator: React.FC<ConnectionStatusProps> = ({
  variant = 'compact',
  position = 'top',
  showWhenConnected = false,
  autoHide = true,
  autoHideDelay = 3000,
  onReconnect,
  onDismiss,
  style,
}) => {
  const { status, reconnect } = useConnectionStatus();

  // Don't show if connected and showWhenConnected is false
  if (status === 'connected' && !showWhenConnected && variant !== 'minimal') {
    return null;
  }

  const handleReconnect = onReconnect || reconnect;

  switch (variant) {
    case 'minimal':
      return (
        <View style={style}>
          <MinimalIndicator status={status} />
        </View>
      );
    
    case 'compact':
      return (
        <View style={style}>
          <CompactIndicator status={status} onReconnect={handleReconnect} />
        </View>
      );
    
    case 'banner':
      return (
        <View style={style}>
          <BannerIndicator
            status={status}
            onReconnect={handleReconnect}
            onDismiss={onDismiss}
          />
        </View>
      );
    
    case 'floating':
      return (
        <FloatingIndicator
          status={status}
          position={position}
          onReconnect={handleReconnect}
          autoHide={autoHide}
          autoHideDelay={autoHideDelay}
        />
      );
    
    default:
      return null;
  }
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  // Minimal
  minimalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Compact
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 6,
  },
  compactLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  compactButton: {
    padding: 4,
    marginLeft: 2,
  },

  // Banner
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bannerText: {
    marginLeft: 12,
    flex: 1,
  },
  bannerLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  bannerMessage: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  bannerButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bannerDismiss: {
    padding: 4,
  },
  bannerDismissText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Floating
  floatingContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingTop: {
    top: 60,
  },
  floatingBottom: {
    bottom: 100,
  },
  floatingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  floatingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingText: {
    marginLeft: 12,
    flex: 1,
  },
  floatingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  floatingMessage: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  floatingButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ConnectionStatusIndicator;
