import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Sparkles,
  Calendar,
  DollarSign,
  Clock,
  MapPin,
  ChevronRight,
  Check,
  RefreshCw,
  Heart,
  Gift,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useDateNight } from '@/contexts/DateNightContext';
import { BudgetTier, DateSuggestion, ItineraryActivity } from '@/types/date-night';

const budgetOptions: { value: BudgetTier; label: string; description: string }[] = [
  { value: '$', label: '$', description: 'Under $50' },
  { value: '$$', label: '$$', description: '$50-150' },
  { value: '$$$', label: '$$$', description: '$150-300' },
  { value: '$$$$', label: '$$$$', description: '$300+' },
];

export default function GeneratePlanScreen() {
  const router = useRouter();
  const { 
    selectedPartner, 
    suggestions, 
    generateSuggestions, 
    isGenerating,
    createItinerary,
    setCurrentItinerary,
  } = useDateNight();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBudget, setSelectedBudget] = useState<BudgetTier>('$$');
  const [isSurprise, setIsSurprise] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<DateSuggestion | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleGenerate = async () => {
    if (!selectedPartner) {
      Alert.alert('No Partner Selected', 'Please select a partner first.');
      return;
    }

    await generateSuggestions(selectedPartner.id, selectedBudget, selectedDate.toISOString());
    setHasGenerated(true);
    setSelectedSuggestion(null);
  };

  const handleSelectSuggestion = (suggestion: DateSuggestion) => {
    setSelectedSuggestion(suggestion);
  };

  const handleCreateItinerary = () => {
    if (!selectedSuggestion || !selectedPartner) return;

    const activities: ItineraryActivity[] = selectedSuggestion.activities.map((a, index) => ({
      id: `activity-${index}`,
      ...a,
    }));

    const itinerary = createItinerary({
      name: selectedSuggestion.title,
      date: selectedDate.toISOString(),
      partnerId: selectedPartner.id,
      partnerName: selectedPartner.name,
      activities,
      totalEstimatedCost: selectedSuggestion.estimatedTotalCost,
      status: 'draft',
      isSurprise,
    });

    setCurrentItinerary(itinerary);
    router.push(`/date-night/edit-itinerary?id=${itinerary.id}`);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.secondary, colors.secondaryLight]}
        style={styles.headerGradient}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={colors.textLight} />
          </Pressable>
          <View style={styles.headerContent}>
            <Sparkles size={24} color={colors.textLight} />
            <Text style={styles.headerTitle}>Plan a Date</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Partner Info */}
          {selectedPartner && (
            <View style={styles.partnerCard}>
              <View style={styles.partnerAvatar}>
                <Text style={styles.avatarInitial}>
                  {selectedPartner.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.partnerInfo}>
                <Text style={styles.partnerLabel}>Planning with</Text>
                <Text style={styles.partnerName}>{selectedPartner.name}</Text>
              </View>
              <Heart size={20} color={colors.secondary} fill={colors.secondary} />
            </View>
          )}

          {/* Date Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>When</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.datesContainer}
            >
              {[0, 1, 2, 3, 4, 5, 6].map(daysFromNow => {
                const date = new Date();
                date.setDate(date.getDate() + daysFromNow);
                const isSelected = date.toDateString() === selectedDate.toDateString();
                
                return (
                  <Pressable
                    key={daysFromNow}
                    style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                    onPress={() => setSelectedDate(date)}
                  >
                    <Text style={[styles.dayName, isSelected && styles.dateTextSelected]}>
                      {daysFromNow === 0 ? 'Today' : daysFromNow === 1 ? 'Tomorrow' : 
                        date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </Text>
                    <Text style={[styles.dayNumber, isSelected && styles.dateTextSelected]}>
                      {date.getDate()}
                    </Text>
                    <Text style={[styles.monthName, isSelected && styles.dateTextSelected]}>
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Budget Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <DollarSign size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Budget</Text>
            </View>
            <View style={styles.budgetContainer}>
              {budgetOptions.map(option => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.budgetOption,
                    selectedBudget === option.value && styles.budgetOptionSelected,
                  ]}
                  onPress={() => setSelectedBudget(option.value)}
                >
                  <Text style={[
                    styles.budgetLabel,
                    selectedBudget === option.value && styles.budgetLabelSelected,
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={[
                    styles.budgetDescription,
                    selectedBudget === option.value && styles.budgetDescriptionSelected,
                  ]}>
                    {option.description}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Surprise Toggle */}
          <Pressable 
            style={[styles.surpriseCard, isSurprise && styles.surpriseCardActive]}
            onPress={() => setIsSurprise(!isSurprise)}
          >
            <View style={[styles.surpriseIcon, isSurprise && styles.surpriseIconActive]}>
              <Gift size={24} color={isSurprise ? colors.textLight : colors.secondary} />
            </View>
            <View style={styles.surpriseContent}>
              <Text style={styles.surpriseTitle}>Surprise Date</Text>
              <Text style={styles.surpriseDescription}>
                Keep the details hidden from your partner
              </Text>
            </View>
            <View style={[styles.checkbox, isSurprise && styles.checkboxActive]}>
              {isSurprise && <Check size={14} color={colors.textLight} />}
            </View>
          </Pressable>

          {/* Generate Button */}
          <Pressable 
            style={styles.generateButton}
            onPress={handleGenerate}
            disabled={isGenerating}
          >
            <LinearGradient
              colors={[colors.secondary, colors.secondaryDark]}
              style={styles.generateGradient}
            >
              {isGenerating ? (
                <ActivityIndicator color={colors.textLight} />
              ) : (
                <>
                  <Sparkles size={22} color={colors.textLight} />
                  <Text style={styles.generateButtonText}>
                    {hasGenerated ? 'Regenerate Ideas' : 'Generate Date Ideas'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          {/* Suggestions */}
          {hasGenerated && !isGenerating && (
            <View style={styles.suggestionsSection}>
              <View style={styles.sectionHeader}>
                <Sparkles size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>AI Suggestions</Text>
                <Pressable style={styles.refreshButton} onPress={handleGenerate}>
                  <RefreshCw size={18} color={colors.primary} />
                </Pressable>
              </View>

              {suggestions.length === 0 ? (
                <View style={styles.noSuggestions}>
                  <Text style={styles.noSuggestionsText}>
                    No suggestions found for your criteria. Try adjusting your budget or preferences.
                  </Text>
                </View>
              ) : (
                suggestions.map(suggestion => (
                  <Pressable
                    key={suggestion.id}
                    style={[
                      styles.suggestionCard,
                      selectedSuggestion?.id === suggestion.id && styles.suggestionCardSelected,
                    ]}
                    onPress={() => handleSelectSuggestion(suggestion)}
                  >
                    <Image
                      source={{ uri: suggestion.imageUrl }}
                      style={styles.suggestionImage}
                      contentFit="cover"
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.suggestionGradient}
                    />
                    <View style={styles.suggestionContent}>
                      <View style={styles.matchBadge}>
                        <Text style={styles.matchText}>{suggestion.matchScore}% Match</Text>
                      </View>
                      <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                      <Text style={styles.suggestionDescription} numberOfLines={2}>
                        {suggestion.description}
                      </Text>
                      <View style={styles.suggestionMeta}>
                        <View style={styles.metaItem}>
                          <Clock size={14} color={colors.textLight} />
                          <Text style={styles.metaText}>{suggestion.estimatedDuration}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <DollarSign size={14} color={colors.textLight} />
                          <Text style={styles.metaText}>{suggestion.estimatedTotalCost}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <MapPin size={14} color={colors.textLight} />
                          <Text style={styles.metaText}>{suggestion.activities.length} stops</Text>
                        </View>
                      </View>
                    </View>
                    {selectedSuggestion?.id === suggestion.id && (
                      <View style={styles.selectedBadge}>
                        <Check size={18} color={colors.textLight} />
                      </View>
                    )}
                  </Pressable>
                ))
              )}
            </View>
          )}

          {/* Preview Activities */}
          {selectedSuggestion && (
            <View style={styles.previewSection}>
              <Text style={styles.sectionTitle}>Itinerary Preview</Text>
              {selectedSuggestion.activities.map((activity, index) => (
                <View key={index} style={styles.activityPreview}>
                  <View style={styles.activityTimeline}>
                    <View style={styles.timelineDot} />
                    {index < selectedSuggestion.activities.length - 1 && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTime}>{activity.startTime}</Text>
                    <Text style={styles.activityName}>{activity.name}</Text>
                    <Text style={styles.activityLocation}>{activity.location.name}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Footer */}
        {selectedSuggestion && (
          <View style={styles.footer}>
            <Pressable style={styles.createButton} onPress={handleCreateItinerary}>
              <Text style={styles.createButtonText}>Customize This Date</Text>
              <ChevronRight size={20} color={colors.textLight} />
            </Pressable>
          </View>
        )}
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textLight,
  },
  placeholder: {
    width: 44,
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
  partnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  partnerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textLight,
  },
  partnerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  partnerLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  partnerName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  refreshButton: {
    padding: 4,
  },
  datesContainer: {
    gap: 10,
  },
  dateCard: {
    width: 70,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  dateCardSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  dayName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  monthName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dateTextSelected: {
    color: colors.textLight,
  },
  budgetContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  budgetOption: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  budgetOptionSelected: {
    borderColor: colors.secondary,
    backgroundColor: `${colors.secondary}10`,
  },
  budgetLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  budgetLabelSelected: {
    color: colors.secondary,
  },
  budgetDescription: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  budgetDescriptionSelected: {
    color: colors.secondary,
  },
  surpriseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  surpriseCardActive: {
    borderColor: colors.secondary,
    backgroundColor: `${colors.secondary}08`,
  },
  surpriseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.secondary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surpriseIconActive: {
    backgroundColor: colors.secondary,
  },
  surpriseContent: {
    flex: 1,
    marginLeft: 12,
  },
  surpriseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  surpriseDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  generateButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  generateButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textLight,
  },
  suggestionsSection: {
    marginBottom: 24,
  },
  noSuggestions: {
    padding: 24,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    alignItems: 'center',
  },
  noSuggestionsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  suggestionCard: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  suggestionCardSelected: {
    borderWidth: 3,
    borderColor: colors.secondary,
  },
  suggestionImage: {
    width: '100%',
    height: '100%',
  },
  suggestionGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  suggestionContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  matchBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.success,
    borderRadius: 8,
    marginBottom: 8,
  },
  matchText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textLight,
  },
  suggestionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textLight,
  },
  suggestionDescription: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.9,
    marginTop: 4,
  },
  suggestionMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '500',
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  activityPreview: {
    flexDirection: 'row',
    marginTop: 16,
  },
  activityTimeline: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.secondary,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginTop: 4,
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 16,
  },
  activityTime: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
  },
  activityName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  activityLocation: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.secondary,
    paddingVertical: 16,
    borderRadius: 16,
  },
  createButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textLight,
  },
});
