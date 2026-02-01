import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Pressable,
} from 'react-native';
import {
  Car,
  Train,
  Footprints,
  CarTaxiFront,
  Bike,
  ChevronRight,
  Clock,
  MapPin,
  X,
  Check,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import {
  TransportationMode,
  TransportationOption,
  TRANSPORTATION_OPTIONS,
  getTransportOption,
} from '@/types/transportation';

interface TransportationModePickerProps {
  selectedMode: TransportationMode;
  onModeChange: (mode: TransportationMode) => void;
  fromLocation: string;
  toLocation: string;
  estimatedDuration?: number; // minutes
  estimatedDistance?: number; // miles
  compact?: boolean;
  disabled?: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Car,
  Train,
  Footprints,
  CarTaxiFront,
  Bike,
};

export default function TransportationModePicker({
  selectedMode,
  onModeChange,
  fromLocation,
  toLocation,
  estimatedDuration,
  estimatedDistance,
  compact = false,
  disabled = false,
}: TransportationModePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));

  const selectedOption = getTransportOption(selectedMode);
  const IconComponent = ICON_MAP[selectedOption.icon] || Car;

  const openModal = () => {
    if (disabled) return;
    setModalVisible(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const selectMode = (mode: TransportationMode) => {
    onModeChange(mode);
    closeModal();
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '--';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDistance = (miles?: number) => {
    if (!miles) return '--';
    return miles < 0.5 ? `${Math.round(miles * 5280)} ft` : `${miles.toFixed(1)} mi`;
  };

  if (compact) {
    return (
      <>
        <TouchableOpacity
          style={[
            styles.compactButton,
            { borderColor: selectedOption.color },
            disabled && styles.disabled,
          ]}
          onPress={openModal}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <IconComponent size={16} color={selectedOption.color} />
          <Text style={[styles.compactLabel, { color: selectedOption.color }]}>
            {selectedOption.label}
          </Text>
          {estimatedDuration && (
            <Text style={styles.compactDuration}>{formatDuration(estimatedDuration)}</Text>
          )}
        </TouchableOpacity>
        {renderModal()}
      </>
    );
  }

  function renderModal() {
    return (
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ scale: scaleAnim }],
                opacity: scaleAnim,
              },
            ]}
          >
            <Pressable>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Transportation</Text>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.routeInfo}>
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
                  <Text style={styles.routeText} numberOfLines={1}>
                    {fromLocation}
                  </Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
                  <Text style={styles.routeText} numberOfLines={1}>
                    {toLocation}
                  </Text>
                </View>
              </View>

              <View style={styles.optionsContainer}>
                {TRANSPORTATION_OPTIONS.map((option) => {
                  const OptionIcon = ICON_MAP[option.icon] || Car;
                  const isSelected = option.mode === selectedMode;

                  return (
                    <TouchableOpacity
                      key={option.mode}
                      style={[
                        styles.optionButton,
                        isSelected && { backgroundColor: `${option.color}15`, borderColor: option.color },
                      ]}
                      onPress={() => selectMode(option.mode)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.optionIconContainer, { backgroundColor: `${option.color}20` }]}>
                        <OptionIcon size={22} color={option.color} />
                      </View>
                      <View style={styles.optionInfo}>
                        <Text style={[styles.optionLabel, isSelected && { color: option.color }]}>
                          {option.label}
                        </Text>
                        <Text style={styles.optionDescription}>{option.description}</Text>
                      </View>
                      {isSelected && (
                        <View style={[styles.checkCircle, { backgroundColor: option.color }]}>
                          <Check size={14} color="#fff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.container, disabled && styles.disabled]}
        onPress={openModal}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <View style={styles.leftSection}>
          <View style={[styles.iconContainer, { backgroundColor: `${selectedOption.color}15` }]}>
            <IconComponent size={20} color={selectedOption.color} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.modeLabel}>{selectedOption.label}</Text>
            <View style={styles.routePreview}>
              <MapPin size={12} color={colors.textTertiary} />
              <Text style={styles.routePreviewText} numberOfLines={1}>
                {fromLocation} → {toLocation}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.rightSection}>
          {estimatedDuration && (
            <View style={styles.estimateContainer}>
              <Clock size={14} color={colors.textSecondary} />
              <Text style={styles.estimateText}>{formatDuration(estimatedDuration)}</Text>
            </View>
          )}
          {estimatedDistance && (
            <Text style={styles.distanceText}>{formatDistance(estimatedDistance)}</Text>
          )}
          <ChevronRight size={18} color={colors.textTertiary} />
        </View>
      </TouchableOpacity>
      {renderModal()}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  disabled: {
    opacity: 0.5,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  modeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  routePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  routePreviewText: {
    fontSize: 12,
    color: colors.textTertiary,
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  estimateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  estimateText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  distanceText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  // Compact styles
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
  },
  compactLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  compactDuration: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  routeInfo: {
    padding: 16,
    backgroundColor: colors.backgroundSecondary,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.border,
    marginLeft: 4,
    marginVertical: 4,
  },
  routeText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  optionsContainer: {
    padding: 12,
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  optionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
