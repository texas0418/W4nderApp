import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Car, Footprints, Train, ChevronDown, ChevronUp, Navigation2 } from 'lucide-react-native';
import colors from '@/constants/colors';
import { TravelTimeEstimate } from '@/utils/travelTime';

interface TravelTimeIndicatorProps {
  estimate: TravelTimeEstimate;
  fromName: string;
  toName: string;
  onNavigate?: () => void;
  compact?: boolean;
}

const MODE_CONFIG = {
  driving: { icon: Car, color: '#3B82F6', label: 'Drive' },
  walking: { icon: Footprints, color: '#10B981', label: 'Walk' },
  transit: { icon: Train, color: '#8B5CF6', label: 'Transit' },
};

export default function TravelTimeIndicator({
  estimate,
  fromName,
  toName,
  onNavigate,
  compact = false,
}: TravelTimeIndicatorProps) {
  const [expanded, setExpanded] = useState(false);

  const recommended = estimate.recommended;
  const RecommendedIcon = MODE_CONFIG[recommended].icon;
  const recommendedColor = MODE_CONFIG[recommended].color;

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactLine} />
        <View style={styles.compactBadge}>
          <RecommendedIcon size={12} color={recommendedColor} />
          <Text style={[styles.compactText, { color: recommendedColor }]}>
            {estimate[recommended].duration}
          </Text>
        </View>
        <View style={styles.compactLine} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Timeline connector */}
      <View style={styles.timelineColumn}>
        <View style={styles.dashedLine} />
      </View>

      {/* Content */}
      <Pressable style={styles.content} onPress={() => setExpanded(!expanded)}>
        {/* Main row */}
        <View style={styles.mainRow}>
          <View style={[styles.badge, { backgroundColor: `${recommendedColor}15` }]}>
            <RecommendedIcon size={16} color={recommendedColor} />
            <Text style={[styles.badgeTime, { color: recommendedColor }]}>
              {estimate[recommended].duration}
            </Text>
          </View>

          <Text style={styles.distance}>{estimate.distance.text}</Text>

          {expanded ? (
            <ChevronUp size={16} color={colors.textTertiary} />
          ) : (
            <ChevronDown size={16} color={colors.textTertiary} />
          )}
        </View>

        {/* Expanded details */}
        {expanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.routeLabel}>{fromName} → {toName}</Text>

            <View style={styles.modesGrid}>
              {(['driving', 'walking', 'transit'] as const).map((mode) => {
                const config = MODE_CONFIG[mode];
                const Icon = config.icon;
                const isRecommended = mode === recommended;

                return (
                  <View
                    key={mode}
                    style={[
                      styles.modeCard,
                      isRecommended && {
                        borderColor: `${config.color}40`,
                        backgroundColor: `${config.color}08`,
                      },
                    ]}
                  >
                    <Icon
                      size={18}
                      color={isRecommended ? config.color : colors.textSecondary}
                    />
                    <View style={styles.modeInfo}>
                      <Text
                        style={[
                          styles.modeTime,
                          isRecommended && { color: config.color },
                        ]}
                      >
                        {estimate[mode].duration}
                      </Text>
                      <Text style={styles.modeLabel}>{config.label}</Text>
                    </View>
                    {isRecommended && (
                      <View style={[styles.bestTag, { backgroundColor: `${config.color}20` }]}>
                        <Text style={[styles.bestTagText, { color: config.color }]}>Best</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {onNavigate && (
              <Pressable style={styles.navigateBtn} onPress={onNavigate}>
                <Navigation2 size={16} color={colors.primary} />
                <Text style={styles.navigateBtnText}>Get Directions</Text>
              </Pressable>
            )}
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  timelineColumn: {
    width: 40,
    alignItems: 'center',
  },
  dashedLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.borderLight,
    borderStyle: 'dashed',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    marginRight: 20,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  distance: {
    flex: 1,
    fontSize: 12,
    color: colors.textTertiary,
  },
  expandedContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  routeLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: 12,
  },
  modesGrid: {
    gap: 8,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modeInfo: {
    flex: 1,
  },
  modeTime: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  modeLabel: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  bestTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bestTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  navigateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: `${colors.primary}10`,
    borderRadius: 10,
  },
  navigateBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
    marginLeft: 14,
  },
  compactLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginHorizontal: 8,
  },
  compactText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
