import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Loader,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { BookingSession } from '@/types/booking';

interface BookingProgressProps {
  session: BookingSession;
  showDetails?: boolean;
}

export default function BookingProgress({
  session,
  showDetails = true,
}: BookingProgressProps) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const { progress, status } = session;
  const progressPercent = progress.total > 0 
    ? ((progress.completed + progress.failed) / progress.total) * 100 
    : 0;

  // Spin animation for loader
  useEffect(() => {
    if (status === 'in_progress') {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [status]);

  // Progress bar animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercent,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [progressPercent]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getStatusInfo = () => {
    switch (status) {
      case 'preparing':
        return { icon: Clock, color: colors.textSecondary, text: 'Preparing bookings...' };
      case 'in_progress':
        return { icon: Loader, color: colors.primary, text: 'Booking in progress...' };
      case 'completed':
        return { icon: CheckCircle, color: colors.success, text: 'All bookings confirmed!' };
      case 'partial':
        return { icon: AlertTriangle, color: colors.warning, text: 'Some bookings need attention' };
      case 'failed':
        return { icon: XCircle, color: colors.error, text: 'Bookings failed' };
      case 'cancelled':
        return { icon: XCircle, color: colors.textSecondary, text: 'Bookings cancelled' };
      default:
        return { icon: Clock, color: colors.textSecondary, text: 'Unknown status' };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <View style={styles.container}>
      {/* Main progress indicator */}
      <View style={styles.mainProgress}>
        <View style={styles.iconContainer}>
          {status === 'in_progress' ? (
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Loader size={32} color={statusInfo.color} />
            </Animated.View>
          ) : (
            <StatusIcon size={32} color={statusInfo.color} />
          )}
        </View>

        <View style={styles.progressInfo}>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
          
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: statusInfo.color,
                },
              ]}
            />
          </View>

          <Text style={styles.progressText}>
            {progress.completed + progress.failed} of {progress.total} complete
          </Text>
        </View>
      </View>

      {/* Detailed stats */}
      {showDetails && (
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: colors.success }]} />
            <Text style={styles.statValue}>{progress.completed}</Text>
            <Text style={styles.statLabel}>Confirmed</Text>
          </View>

          {progress.failed > 0 && (
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: colors.error }]} />
              <Text style={styles.statValue}>{progress.failed}</Text>
              <Text style={styles.statLabel}>Failed</Text>
            </View>
          )}

          {progress.requiresAction > 0 && (
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: colors.warning }]} />
              <Text style={styles.statValue}>{progress.requiresAction}</Text>
              <Text style={styles.statLabel}>Action Needed</Text>
            </View>
          )}

          {progress.pending > 0 && (
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: colors.textTertiary }]} />
              <Text style={styles.statValue}>{progress.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// Compact inline progress for headers
interface CompactProgressProps {
  completed: number;
  total: number;
  status: BookingSession['status'];
}

export function CompactProgress({ completed, total, status }: CompactProgressProps) {
  const isComplete = status === 'completed';
  const hasIssues = status === 'partial' || status === 'failed';

  return (
    <View style={styles.compactContainer}>
      <View style={[
        styles.compactBadge,
        isComplete && styles.compactBadgeSuccess,
        hasIssues && styles.compactBadgeWarning,
      ]}>
        {isComplete ? (
          <CheckCircle size={14} color={colors.success} />
        ) : hasIssues ? (
          <AlertTriangle size={14} color={colors.warning} />
        ) : (
          <Text style={styles.compactText}>{completed}/{total}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  mainProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressInfo: {
    flex: 1,
    marginLeft: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Compact styles
  compactContainer: {
    alignItems: 'center',
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  compactBadgeSuccess: {
    backgroundColor: `${colors.success}15`,
  },
  compactBadgeWarning: {
    backgroundColor: `${colors.warning}15`,
  },
  compactText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
