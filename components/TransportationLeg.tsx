import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import {
  Car,
  Train,
  Footprints,
  CarTaxiFront,
  Bike,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Navigation,
  AlertCircle,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import {
  TransportationMode,
  ItineraryLeg,
  TRANSPORTATION_OPTIONS,
  getTransportOption,
} from '@/types/transportation';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface TransportationLegProps {
  leg: ItineraryLeg;
  fromLocation: {
    name: string;
    address: string;
  };
  toLocation: {
    name: string;
    address: string;
  };
  onModeChange: (mode: TransportationMode) => void;
  onNavigate: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  showWarning?: boolean;
  warningMessage?: string;
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Car,
  Train,
  Footprints,
  CarTaxiFront,
  Bike,
};

export default function TransportationLeg({
  leg,
  fromLocation,
  toLocation,
  onModeChange,
  onNavigate,
  isExpanded = false,
  onToggleExpand,
  showWarning = false,
  warningMessage,
}: TransportationLegProps) {
  const [localExpanded, setLocalExpanded] = useState(isExpanded);
  const expandAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const expanded = onToggleExpand !== undefined ? isExpanded : localExpanded;
  const toggleExpand = onToggleExpand || (() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setLocalExpanded(!localExpanded);
  });

  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [expanded]);

  useEffect(() => {
    if (showWarning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [showWarning]);

  const selectedOption = getTransportOption(leg.transportationMode);
  const IconComponent = ICON_MAP[selectedOption.icon] || Car;

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDistance = (miles: number) => {
    return miles < 0.5 ? `${Math.round(miles * 5280)} ft` : `${miles.toFixed(1)} mi`;
  };

  return (
    <View style={styles.container}>
      {/* Connection line from previous activity */}
      <View style={styles.connectionTop}>
        <View style={styles.verticalLine} />
      </View>

      {/* Main leg card */}
      <TouchableOpacity
        style={[
          styles.legCard,
          expanded && styles.legCardExpanded,
          showWarning && styles.legCardWarning,
        ]}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.legHeader}>
          <Animated.View
            style={[
              styles.modeIconContainer,
              { backgroundColor: `${selectedOption.color}15` },
              showWarning && { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <IconComponent size={18} color={selectedOption.color} />
          </Animated.View>

          <View style={styles.legInfo}>
            <Text style={styles.modeLabel}>{selectedOption.label}</Text>
            <View style={styles.estimates}>
              <Clock size={12} color={colors.textTertiary} />
              <Text style={styles.estimateText}>{formatDuration(leg.estimatedDuration)}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.estimateText}>{formatDistance(leg.estimatedDistance)}</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {showWarning && (
              <AlertCircle size={18} color={colors.warning} style={styles.warningIcon} />
            )}
            {expanded ? (
              <ChevronUp size={18} color={colors.textSecondary} />
            ) : (
              <ChevronDown size={18} color={colors.textSecondary} />
            )}
          </View>
        </View>

        {/* Expanded content */}
        {expanded && (
          <Animated.View
            style={[
              styles.expandedContent,
              { opacity: expandAnim },
            ]}
          >
            {showWarning && warningMessage && (
              <View style={styles.warningBanner}>
                <AlertCircle size={14} color={colors.warning} />
                <Text style={styles.warningText}>{warningMessage}</Text>
              </View>
            )}

            {/* Route preview */}
            <View style={styles.routePreview}>
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
                <Text style={styles.routePointText} numberOfLines={1}>
                  {fromLocation.name}
                </Text>
              </View>
              <View style={styles.routeLineVertical} />
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
                <Text style={styles.routePointText} numberOfLines={1}>
                  {toLocation.name}
                </Text>
              </View>
            </View>

            {/* Mode selection */}
            <View style={styles.modeSelector}>
              {TRANSPORTATION_OPTIONS.map((option) => {
                const OptionIcon = ICON_MAP[option.icon] || Car;
                const isSelected = option.mode === leg.transportationMode;

                return (
                  <TouchableOpacity
                    key={option.mode}
                    style={[
                      styles.modeOption,
                      isSelected && { backgroundColor: option.color, borderColor: option.color },
                    ]}
                    onPress={() => onModeChange(option.mode)}
                    activeOpacity={0.7}
                  >
                    <OptionIcon
                      size={18}
                      color={isSelected ? '#fff' : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.modeOptionLabel,
                        isSelected && { color: '#fff' },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Navigate button */}
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={onNavigate}
              activeOpacity={0.7}
            >
              <Navigation size={16} color={colors.primary} />
              <Text style={styles.navigateButtonText}>Get Directions</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </TouchableOpacity>

      {/* Connection line to next activity */}
      <View style={styles.connectionBottom}>
        <View style={styles.verticalLine} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  connectionTop: {
    height: 16,
    alignItems: 'center',
  },
  connectionBottom: {
    height: 16,
    alignItems: 'center',
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
  },
  legCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    width: '90%',
  },
  legCardExpanded: {
    borderStyle: 'solid',
  },
  legCardWarning: {
    borderColor: colors.warning,
    backgroundColor: `${colors.warning}08`,
  },
  legHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legInfo: {
    flex: 1,
    marginLeft: 10,
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  estimates: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  estimateText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  dot: {
    color: colors.textTertiary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningIcon: {
    marginRight: 4,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${colors.warning}15`,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 13,
    color: colors.warning,
    flex: 1,
  },
  routePreview: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeLineVertical: {
    width: 2,
    height: 14,
    backgroundColor: colors.border,
    marginLeft: 3,
    marginVertical: 4,
  },
  routePointText: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
  },
  modeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  modeOptionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: `${colors.primary}10`,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  navigateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
