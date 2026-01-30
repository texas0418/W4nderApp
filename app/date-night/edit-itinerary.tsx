import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  Clock,
  MapPin,
  DollarSign,
  GripVertical,
  Check,
  X,
  Calendar,
  Save,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useDateNight } from '@/contexts/DateNightContext';
import { ItineraryActivity, BudgetTier, ActivityType } from '@/types/date-night';

const activityTypes: { value: ActivityType | 'dining' | 'drinks' | 'dessert' | 'transportation'; label: string; emoji: string }[] = [
  { value: 'dining', label: 'Dining', emoji: '🍽️' },
  { value: 'drinks', label: 'Drinks', emoji: '🍸' },
  { value: 'dessert', label: 'Dessert', emoji: '🍰' },
  { value: 'romantic', label: 'Romantic', emoji: '💕' },
  { value: 'adventurous', label: 'Adventure', emoji: '🎢' },
  { value: 'relaxed', label: 'Relaxed', emoji: '😌' },
  { value: 'creative', label: 'Creative', emoji: '🎨' },
  { value: 'active', label: 'Active', emoji: '🏃' },
  { value: 'cultural', label: 'Cultural', emoji: '🏛️' },
  { value: 'transportation', label: 'Transport', emoji: '🚗' },
];

export default function EditItineraryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { 
    itineraries, 
    updateItinerary, 
    addActivity, 
    updateActivity, 
    removeActivity,
    currentItinerary,
    setCurrentItinerary,
  } = useDateNight();

  const [itinerary, setItinerary] = useState(
    currentItinerary || itineraries.find(i => i.id === id)
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ItineraryActivity | null>(null);

  // New activity form state
  const [newActivity, setNewActivity] = useState({
    name: '',
    description: '',
    type: 'dining' as ActivityType | 'dining' | 'drinks' | 'dessert' | 'transportation',
    locationName: '',
    locationAddress: '',
    startTime: '',
    endTime: '',
    estimatedCost: '$$' as BudgetTier,
    reservationRequired: false,
  });

  useEffect(() => {
    if (!itinerary && id) {
      const found = itineraries.find(i => i.id === id);
      if (found) setItinerary(found);
    }
  }, [id, itineraries]);

  const handleDeleteActivity = (activityId: string) => {
    Alert.alert(
      'Remove Activity',
      'Are you sure you want to remove this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            if (itinerary) {
              removeActivity(itinerary.id, activityId);
              setItinerary(prev => prev ? {
                ...prev,
                activities: prev.activities.filter(a => a.id !== activityId),
              } : null);
            }
          },
        },
      ]
    );
  };

  const handleAddActivity = () => {
    if (!newActivity.name.trim()) {
      Alert.alert('Enter Name', 'Please enter an activity name.');
      return;
    }
    if (!newActivity.startTime.trim()) {
      Alert.alert('Enter Time', 'Please enter a start time.');
      return;
    }

    if (itinerary) {
      const activity: Omit<ItineraryActivity, 'id'> = {
        name: newActivity.name,
        description: newActivity.description,
        type: newActivity.type,
        location: {
          name: newActivity.locationName,
          address: newActivity.locationAddress,
        },
        startTime: newActivity.startTime,
        endTime: newActivity.endTime,
        estimatedCost: newActivity.estimatedCost,
        reservationRequired: newActivity.reservationRequired,
        reservationMade: false,
      };

      addActivity(itinerary.id, activity);
      
      // Update local state
      const newActivityWithId: ItineraryActivity = {
        ...activity,
        id: `activity-${Date.now()}`,
      };
      setItinerary(prev => prev ? {
        ...prev,
        activities: [...prev.activities, newActivityWithId],
      } : null);

      // Reset form
      setNewActivity({
        name: '',
        description: '',
        type: 'dining',
        locationName: '',
        locationAddress: '',
        startTime: '',
        endTime: '',
        estimatedCost: '$$',
        reservationRequired: false,
      });
      setShowAddModal(false);
    }
  };

  const handleSaveItinerary = () => {
    if (itinerary) {
      updateItinerary(itinerary.id, { status: 'planned' });
      Alert.alert(
        'Date Saved!',
        'Your date has been saved. Have a wonderful time!',
        [{ text: 'OK', onPress: () => router.push('/(tabs)/date-night') }]
      );
    }
  };

  if (!itinerary) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.errorText}>Itinerary not found</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        style={styles.headerGradient}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={colors.textLight} />
          </Pressable>
          <Text style={styles.headerTitle}>Edit Itinerary</Text>
          <Pressable style={styles.saveHeaderButton} onPress={handleSaveItinerary}>
            <Save size={22} color={colors.textLight} />
          </Pressable>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Itinerary Header */}
          <View style={styles.itineraryHeader}>
            <TextInput
              style={styles.itineraryName}
              value={itinerary.name}
              onChangeText={(text) => setItinerary(prev => prev ? { ...prev, name: text } : null)}
              placeholder="Date Name"
              placeholderTextColor={colors.textTertiary}
            />
            <View style={styles.itineraryMeta}>
              <View style={styles.metaItem}>
                <Calendar size={16} color={colors.primary} />
                <Text style={styles.metaText}>
                  {new Date(itinerary.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <DollarSign size={16} color={colors.primary} />
                <Text style={styles.metaText}>{itinerary.totalEstimatedCost}</Text>
              </View>
            </View>
          </View>

          {/* Activities List */}
          <View style={styles.activitiesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Activities</Text>
              <Pressable 
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
              >
                <Plus size={18} color={colors.primary} />
                <Text style={styles.addButtonText}>Add</Text>
              </Pressable>
            </View>

            {itinerary.activities.length === 0 ? (
              <View style={styles.emptyActivities}>
                <Text style={styles.emptyText}>No activities yet</Text>
                <Pressable 
                  style={styles.addFirstButton}
                  onPress={() => setShowAddModal(true)}
                >
                  <Plus size={20} color={colors.textLight} />
                  <Text style={styles.addFirstText}>Add Your First Activity</Text>
                </Pressable>
              </View>
            ) : (
              itinerary.activities.map((activity, index) => (
                <View key={activity.id} style={styles.activityCard}>
                  <View style={styles.activityTimeline}>
                    <View style={styles.timelineDot}>
                      <Text style={styles.timelineNumber}>{index + 1}</Text>
                    </View>
                    {index < itinerary.activities.length - 1 && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>
                  
                  <View style={styles.activityContent}>
                    <View style={styles.activityHeader}>
                      <View style={styles.activityTypeChip}>
                        <Text style={styles.activityTypeEmoji}>
                          {activityTypes.find(t => t.value === activity.type)?.emoji || '📍'}
                        </Text>
                        <Text style={styles.activityTypeText}>
                          {activityTypes.find(t => t.value === activity.type)?.label || activity.type}
                        </Text>
                      </View>
                      <View style={styles.activityActions}>
                        <Pressable 
                          style={styles.actionButton}
                          onPress={() => handleDeleteActivity(activity.id)}
                        >
                          <Trash2 size={18} color={colors.error} />
                        </Pressable>
                      </View>
                    </View>

                    <Text style={styles.activityName}>{activity.name}</Text>
                    {activity.description && (
                      <Text style={styles.activityDescription}>{activity.description}</Text>
                    )}

                    <View style={styles.activityDetails}>
                      <View style={styles.detailRow}>
                        <Clock size={14} color={colors.textSecondary} />
                        <Text style={styles.detailText}>
                          {activity.startTime}{activity.endTime ? ` - ${activity.endTime}` : ''}
                        </Text>
                      </View>
                      {activity.location.name && (
                        <View style={styles.detailRow}>
                          <MapPin size={14} color={colors.textSecondary} />
                          <Text style={styles.detailText}>{activity.location.name}</Text>
                        </View>
                      )}
                      <View style={styles.detailRow}>
                        <DollarSign size={14} color={colors.textSecondary} />
                        <Text style={styles.detailText}>{activity.estimatedCost}</Text>
                      </View>
                    </View>

                    {activity.reservationRequired && (
                      <Pressable 
                        style={[
                          styles.reservationBadge,
                          activity.reservationMade && styles.reservationMade,
                        ]}
                        onPress={() => {
                          updateActivity(itinerary.id, activity.id, {
                            reservationMade: !activity.reservationMade,
                          });
                          setItinerary(prev => prev ? {
                            ...prev,
                            activities: prev.activities.map(a => 
                              a.id === activity.id 
                                ? { ...a, reservationMade: !a.reservationMade }
                                : a
                            ),
                          } : null);
                        }}
                      >
                        {activity.reservationMade ? (
                          <Check size={14} color={colors.success} />
                        ) : (
                          <Clock size={14} color={colors.warning} />
                        )}
                        <Text style={[
                          styles.reservationText,
                          activity.reservationMade && styles.reservationTextMade,
                        ]}>
                          {activity.reservationMade ? 'Reservation Made' : 'Reservation Needed'}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <Pressable style={styles.saveButton} onPress={handleSaveItinerary}>
            <Text style={styles.saveButtonText}>Save Date Plan</Text>
          </Pressable>
        </View>

        {/* Add Activity Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Activity</Text>
                <Pressable onPress={() => setShowAddModal(false)}>
                  <X size={24} color={colors.text} />
                </Pressable>
              </View>

              <ScrollView style={styles.modalScroll}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Activity Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={newActivity.name}
                    onChangeText={(text) => setNewActivity(prev => ({ ...prev, name: text }))}
                    placeholder="e.g., Dinner at Chez Pierre"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Type</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.typeOptions}>
                      {activityTypes.map(type => (
                        <Pressable
                          key={type.value}
                          style={[
                            styles.typeOption,
                            newActivity.type === type.value && styles.typeOptionSelected,
                          ]}
                          onPress={() => setNewActivity(prev => ({ ...prev, type: type.value }))}
                        >
                          <Text style={styles.typeEmoji}>{type.emoji}</Text>
                          <Text style={[
                            styles.typeLabel,
                            newActivity.type === type.value && styles.typeLabelSelected,
                          ]}>{type.label}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.formLabel}>Start Time *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={newActivity.startTime}
                      onChangeText={(text) => setNewActivity(prev => ({ ...prev, startTime: text }))}
                      placeholder="7:00 PM"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.formLabel}>End Time</Text>
                    <TextInput
                      style={styles.formInput}
                      value={newActivity.endTime}
                      onChangeText={(text) => setNewActivity(prev => ({ ...prev, endTime: text }))}
                      placeholder="9:00 PM"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Location Name</Text>
                  <TextInput
                    style={styles.formInput}
                    value={newActivity.locationName}
                    onChangeText={(text) => setNewActivity(prev => ({ ...prev, locationName: text }))}
                    placeholder="e.g., Chez Pierre"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Address</Text>
                  <TextInput
                    style={styles.formInput}
                    value={newActivity.locationAddress}
                    onChangeText={(text) => setNewActivity(prev => ({ ...prev, locationAddress: text }))}
                    placeholder="123 Main St"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Estimated Cost</Text>
                  <View style={styles.costOptions}>
                    {(['$', '$$', '$$$', '$$$$'] as BudgetTier[]).map(cost => (
                      <Pressable
                        key={cost}
                        style={[
                          styles.costOption,
                          newActivity.estimatedCost === cost && styles.costOptionSelected,
                        ]}
                        onPress={() => setNewActivity(prev => ({ ...prev, estimatedCost: cost }))}
                      >
                        <Text style={[
                          styles.costLabel,
                          newActivity.estimatedCost === cost && styles.costLabelSelected,
                        ]}>{cost}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <Pressable
                  style={styles.reservationToggle}
                  onPress={() => setNewActivity(prev => ({ 
                    ...prev, 
                    reservationRequired: !prev.reservationRequired 
                  }))}
                >
                  <View style={[
                    styles.toggleCheckbox,
                    newActivity.reservationRequired && styles.toggleCheckboxActive,
                  ]}>
                    {newActivity.reservationRequired && <Check size={14} color={colors.textLight} />}
                  </View>
                  <Text style={styles.toggleLabel}>Reservation Required</Text>
                </Pressable>
              </ScrollView>

              <Pressable style={styles.modalButton} onPress={handleAddActivity}>
                <Text style={styles.modalButtonText}>Add Activity</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textLight,
  },
  saveHeaderButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
  },
  contentContainer: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
  itineraryHeader: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  itineraryName: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  itineraryMeta: {
    flexDirection: 'row',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activitiesSection: {},
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: `${colors.primary}10`,
    borderRadius: 16,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  emptyActivities: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addFirstText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textLight,
  },
  activityCard: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  activityTimeline: {
    alignItems: 'center',
    width: 40,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginTop: 8,
  },
  activityContent: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
  },
  activityTypeEmoji: {
    fontSize: 12,
  },
  activityTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activityActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  activityName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  activityDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  reservationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: `${colors.warning}15`,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  reservationMade: {
    backgroundColor: `${colors.success}15`,
  },
  reservationText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.warning,
  },
  reservationTextMade: {
    color: colors.success,
  },
  bottomSpacer: {
    height: 120,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  modalScroll: {
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOptions: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  typeOption: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  typeEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  typeLabelSelected: {
    color: colors.primary,
  },
  costOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  costOption: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  costOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  costLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  costLabelSelected: {
    color: colors.primary,
  },
  reservationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  toggleCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleCheckboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleLabel: {
    fontSize: 15,
    color: colors.text,
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textLight,
  },
});
