import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Clock,
  MapPin,
  DollarSign,
  ChevronRight,
  Navigation,
  Plus,
  GripVertical,
  AlertOctagon,
  AlertTriangle,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import TransportationLeg from './TransportationLeg';
import ConflictBanner from './ConflictBanner';
import ConflictIndicator, { 
  ConflictDetailPopup, 
  InlineConflictMessage 
} from './ConflictIndicator';
import {
  TransportationMode,
  ItineraryLeg,
  ActivityWithTransport,
  MODE_DURATION_MULTIPLIERS,
} from '@/types/transportation';
import {
  detectTimeConflicts,
  TimeConflict,
  ConflictCheckResult,
  getMostSevereConflict,
  getSeverityColor,
} from '@/types/timeConflicts';

interface ItineraryTimelineProps {
  activities: ActivityWithTransport[];
  onActivityPress: (activity: ActivityWithTransport) => void;
  onTransportModeChange: (legId: string, mode: TransportationMode) => void;
  onNavigate: (from: ActivityWithTransport, to: ActivityWithTransport, mode: TransportationMode) => void;
  onAddActivity?: () => void;
  onResolveConflict?: (conflict: TimeConflict) => void;
  editable?: boolean;
  showConflictBanner?: boolean;
}

export default function ItineraryTimeline({
  activities,
  onActivityPress,
  onTransportModeChange,
  onNavigate,
  onAddActivity,
  onResolveConflict,
  editable = true,
  showConflictBanner = true,
}: ItineraryTimelineProps) {
  const [expandedLegId, setExpandedLegId] = useState<string | null>(null);
  const [selectedConflictActivity, setSelectedConflictActivity] = useState<{
    activity: ActivityWithTransport;
    conflicts: TimeConflict[];
  } | null>(null);

  // Run conflict detection
  const conflictResult = useMemo(() => {
    return detectTimeConflicts(activities, {
      minBufferMinutes: 5,
      tightBufferMinutes: 15,
      longGapMinutes: 180,
      includeInfos: true,
    });
  }, [activities]);

  const handleNavigate = useCallback((fromIndex: number) => {
    const from = activities[fromIndex];
    const to = activities[fromIndex + 1];
    if (from && to && from.transportToNext) {
      onNavigate(from, to, from.transportToNext.transportationMode);
    }
  }, [activities, onNavigate]);

  const handleConflictPress = useCallback((conflict: TimeConflict) => {
    if (onResolveConflict) {
      onResolveConflict(conflict);
    } else {
      // Find the first activity involved and scroll to it
      const activityId = conflict.activityIds[0];
      const activity = activities.find(a => a.id === activityId);
      if (activity) {
        const activityConflicts = conflictResult.conflictsByActivity[activity.id] || [];
        setSelectedConflictActivity({ activity, conflicts: activityConflicts });
      }
    }
  }, [activities, conflictResult, onResolveConflict]);

  const handleActivityConflictPress = useCallback((activity: ActivityWithTransport) => {
    const activityConflicts = conflictResult.conflictsByActivity[activity.id] || [];
    if (activityConflicts.length > 0) {
      setSelectedConflictActivity({ activity, conflicts: activityConflicts });
    }
  }, [conflictResult]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const formatCost = (cost: string) => {
    const count = cost.length;
    return Array(count).fill('$').join('');
  };

  const getActivityConflicts = (activityId: string) => {
    return conflictResult.conflictsByActivity[activityId] || [];
  };

  const getMostSevereActivityConflict = (activityId: string) => {
    const conflicts = getActivityConflicts(activityId);
    return getMostSevereConflict(conflicts.filter(c => c.severity !== 'info'));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Conflict Banner */}
      {showConflictBanner && (
        <ConflictBanner
          conflictResult={conflictResult}
          onConflictPress={handleConflictPress}
          collapsible
          maxVisibleConflicts={3}
        />
      )}

      {/* Timeline */}
      {activities.map((activity, index) => {
        const nextActivity = activities[index + 1];
        const hasTransportLeg = nextActivity && activity.transportToNext;
        const activityConflicts = getActivityConflicts(activity.id);
        const mostSevereConflict = getMostSevereActivityConflict(activity.id);
        const hasConflict = mostSevereConflict !== null;

        // Get the specific conflict for this leg (if any)
        const legConflict = activityConflicts.find(
          c => c.type === 'insufficient_travel' || c.type === 'tight_transition'
        );

        return (
          <View key={activity.id}>
            {/* Activity Card */}
            <TouchableOpacity
              style={[
                styles.activityCard,
                hasConflict && {
                  borderColor: getSeverityColor(mostSevereConflict.severity),
                  borderWidth: 1.5,
                },
              ]}
              onPress={() => onActivityPress(activity)}
              activeOpacity={0.7}
            >
              {/* Conflict indicator badge */}
              {hasConflict && (
                <View style={styles.conflictBadge}>
                  <ConflictIndicator
                    conflicts={activityConflicts}
                    size="small"
                    onPress={() => handleActivityConflictPress(activity)}
                  />
                </View>
              )}

              <View style={styles.timeColumn}>
                <Text style={[
                  styles.timeText,
                  hasConflict && mostSevereConflict.severity === 'error' && { color: colors.error },
                ]}>
                  {formatTime(activity.startTime)}
                </Text>
                <View style={[
                  styles.timeLine,
                  hasConflict && { backgroundColor: getSeverityColor(mostSevereConflict.severity) },
                ]} />
                <Text style={styles.timeTextEnd}>{formatTime(activity.endTime)}</Text>
              </View>

              <View style={styles.activityContent}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityName} numberOfLines={1}>
                    {activity.name}
                  </Text>
                  {editable && (
                    <GripVertical size={16} color={colors.textTertiary} />
                  )}
                </View>

                <View style={styles.activityMeta}>
                  <View style={styles.metaItem}>
                    <MapPin size={12} color={colors.textSecondary} />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {activity.location.name}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <DollarSign size={12} color={colors.textSecondary} />
                    <Text style={styles.metaText}>
                      {formatCost(activity.estimatedCost)}
                    </Text>
                  </View>
                </View>

                {activity.description && (
                  <Text style={styles.activityDescription} numberOfLines={2}>
                    {activity.description}
                  </Text>
                )}

                {/* Inline conflict message for overlap/same time */}
                {mostSevereConflict && 
                  (mostSevereConflict.type === 'overlap' || mostSevereConflict.type === 'same_time') && (
                  <View style={styles.inlineConflictContainer}>
                    <InlineConflictMessage conflict={mostSevereConflict} compact />
                  </View>
                )}

                <View style={styles.activityFooter}>
                  <View style={styles.typeTag}>
                    <Text style={styles.typeTagText}>{activity.type}</Text>
                  </View>
                  <ChevronRight size={16} color={colors.textTertiary} />
                </View>
              </View>
            </TouchableOpacity>

            {/* Transportation Leg (between activities) */}
            {hasTransportLeg && (
              <TransportationLeg
                leg={activity.transportToNext!}
                fromLocation={activity.location}
                toLocation={nextActivity.location}
                onModeChange={(mode) => onTransportModeChange(activity.transportToNext!.id, mode)}
                onNavigate={() => handleNavigate(index)}
                isExpanded={expandedLegId === activity.transportToNext!.id}
                onToggleExpand={() => {
                  setExpandedLegId(
                    expandedLegId === activity.transportToNext!.id
                      ? null
                      : activity.transportToNext!.id
                  );
                }}
                showWarning={!!legConflict}
                warningMessage={legConflict?.message}
              />
            )}
          </View>
        );
      })}

      {/* Add Activity Button */}
      {editable && onAddActivity && (
        <TouchableOpacity
          style={styles.addActivityButton}
          onPress={onAddActivity}
          activeOpacity={0.7}
        >
          <Plus size={20} color={colors.primary} />
          <Text style={styles.addActivityText}>Add Activity</Text>
        </TouchableOpacity>
      )}

      {/* Summary footer when conflicts exist */}
      {conflictResult.hasErrors && (
        <View style={styles.conflictSummaryFooter}>
          <AlertOctagon size={16} color={colors.error} />
          <Text style={styles.conflictSummaryText}>
            Resolve {conflictResult.summary.errors} {conflictResult.summary.errors === 1 ? 'conflict' : 'conflicts'} before confirming
          </Text>
        </View>
      )}

      <View style={styles.bottomSpacer} />

      {/* Conflict Detail Popup */}
      {selectedConflictActivity && (
        <ConflictDetailPopup
          visible={!!selectedConflictActivity}
          conflicts={selectedConflictActivity.conflicts}
          activityName={selectedConflictActivity.activity.name}
          onClose={() => setSelectedConflictActivity(null)}
          onNavigateToConflict={(conflict) => {
            setSelectedConflictActivity(null);
            if (onResolveConflict) {
              onResolveConflict(conflict);
            }
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  conflictBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    zIndex: 1,
  },
  timeColumn: {
    alignItems: 'center',
    marginRight: 12,
    paddingTop: 2,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  timeTextEnd: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  timeLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
    borderRadius: 1,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  activityDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },
  inlineConflictContainer: {
    marginTop: 8,
  },
  activityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  typeTag: {
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'capitalize',
  },
  addActivityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    backgroundColor: `${colors.primary}08`,
  },
  addActivityText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  conflictSummaryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: `${colors.error}10`,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.error,
  },
  conflictSummaryText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.error,
  },
  bottomSpacer: {
    height: 100,
  },
});
