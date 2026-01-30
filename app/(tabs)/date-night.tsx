import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Heart,
  Plus,
  Users,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Settings,
  History,
  UserPlus,
  Trash2,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useDateNight } from '@/contexts/DateNightContext';
import { PartnerProfile, DateItinerary } from '@/types/date-night';

export default function DateNightScreen() {
  const router = useRouter();
  const { 
    partners, 
    itineraries, 
    selectedPartner, 
    setSelectedPartner,
    removePartner,
    userProfile,
  } = useDateNight();

  const upcomingItineraries = itineraries.filter(i => 
    i.status === 'planned' && new Date(i.date) >= new Date()
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastItineraries = itineraries.filter(i => 
    i.status === 'completed' || new Date(i.date) < new Date()
  );

  const handleSelectPartner = (partner: PartnerProfile) => {
    setSelectedPartner(partner);
  };

  const handleDeletePartner = (partner: PartnerProfile) => {
    Alert.alert(
      'Remove Partner',
      `Are you sure you want to remove ${partner.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removePartner(partner.id)
        },
      ]
    );
  };

  const handlePlanDate = () => {
    if (!selectedPartner) {
      Alert.alert('Select a Partner', 'Please select or add a partner first.');
      return;
    }
    router.push('/date-night/generate-plan');
  };

  const hasSetupPreferences = userProfile?.preferences.activityTypes.length > 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.secondary, colors.secondaryLight]}
        style={styles.headerGradient}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerTitleContainer}>
              <Heart size={28} color={colors.textLight} fill={colors.textLight} />
              <Text style={styles.headerTitle}>Date Night</Text>
            </View>
            <Pressable 
              style={styles.settingsButton}
              onPress={() => router.push('/date-night/my-preferences')}
            >
              <Settings size={22} color={colors.textLight} />
            </Pressable>
          </View>
          <Text style={styles.headerSubtitle}>
            Plan unforgettable moments together
          </Text>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Setup Banner - shown if preferences not set */}
          {!hasSetupPreferences && (
            <Pressable 
              style={styles.setupBanner}
              onPress={() => router.push('/date-night/my-preferences')}
            >
              <View style={styles.setupIcon}>
                <Sparkles size={24} color={colors.secondary} />
              </View>
              <View style={styles.setupText}>
                <Text style={styles.setupTitle}>Complete Your Profile</Text>
                <Text style={styles.setupDescription}>
                  Set your preferences to get personalized date ideas
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textTertiary} />
            </Pressable>
          )}

          {/* Partners Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Partners</Text>
              <Pressable 
                style={styles.addButton}
                onPress={() => router.push('/date-night/add-partner')}
              >
                <Plus size={18} color={colors.primary} />
                <Text style={styles.addButtonText}>Add</Text>
              </Pressable>
            </View>

            {partners.length === 0 ? (
              <Pressable 
                style={styles.emptyPartnerCard}
                onPress={() => router.push('/date-night/add-partner')}
              >
                <View style={styles.emptyPartnerIcon}>
                  <UserPlus size={32} color={colors.textTertiary} />
                </View>
                <Text style={styles.emptyPartnerTitle}>Add Your First Partner</Text>
                <Text style={styles.emptyPartnerDescription}>
                  Add a partner to start planning date nights together
                </Text>
              </Pressable>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.partnersScroll}
              >
                {partners.map(partner => (
                  <Pressable
                    key={partner.id}
                    style={[
                      styles.partnerCard,
                      selectedPartner?.id === partner.id && styles.partnerCardSelected,
                    ]}
                    onPress={() => handleSelectPartner(partner)}
                    onLongPress={() => handleDeletePartner(partner)}
                  >
                    <View style={styles.partnerAvatar}>
                      {partner.avatar ? (
                        <Image source={{ uri: partner.avatar }} style={styles.avatarImage} />
                      ) : (
                        <Text style={styles.avatarInitial}>
                          {partner.name.charAt(0).toUpperCase()}
                        </Text>
                      )}
                      {partner.isLinked && (
                        <View style={styles.linkedBadge}>
                          <Users size={10} color={colors.textLight} />
                        </View>
                      )}
                    </View>
                    <Text style={styles.partnerName} numberOfLines={1}>
                      {partner.name}
                    </Text>
                    {selectedPartner?.id === partner.id && (
                      <View style={styles.selectedIndicator} />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <Pressable 
                style={[styles.actionCard, styles.actionCardPrimary]}
                onPress={handlePlanDate}
              >
                <LinearGradient
                  colors={[colors.secondary, colors.secondaryLight]}
                  style={styles.actionGradient}
                >
                  <Sparkles size={28} color={colors.textLight} />
                  <Text style={styles.actionTitle}>Plan a Date</Text>
                  <Text style={styles.actionDescription}>
                    Get AI-powered suggestions
                  </Text>
                </LinearGradient>
              </Pressable>

              <Pressable 
                style={styles.actionCard}
                onPress={() => router.push('/date-night/my-preferences')}
              >
                <View style={styles.actionIcon}>
                  <Settings size={24} color={colors.primary} />
                </View>
                <Text style={styles.actionTitleDark}>My Preferences</Text>
              </Pressable>

              <Pressable 
                style={styles.actionCard}
                onPress={() => router.push('/date-night/history')}
              >
                <View style={styles.actionIcon}>
                  <History size={24} color={colors.primary} />
                </View>
                <Text style={styles.actionTitleDark}>Date History</Text>
              </Pressable>
            </View>
          </View>

          {/* Upcoming Dates */}
          {upcomingItineraries.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Dates</Text>
                <Pressable onPress={() => router.push('/date-night/history')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </Pressable>
              </View>
              {upcomingItineraries.slice(0, 3).map(itinerary => (
                <ItineraryCard 
                  key={itinerary.id} 
                  itinerary={itinerary}
                  onPress={() => router.push(`/date-night/itinerary/${itinerary.id}`)}
                />
              ))}
            </View>
          )}

          {/* Date Ideas Inspiration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date Inspiration</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.inspirationScroll}
            >
              {dateInspiration.map((idea, index) => (
                <Pressable 
                  key={index}
                  style={styles.inspirationCard}
                  onPress={() => {
                    if (selectedPartner) {
                      router.push('/date-night/generate-plan');
                    } else {
                      Alert.alert('Select a Partner', 'Please select a partner first.');
                    }
                  }}
                >
                  <Image source={{ uri: idea.image }} style={styles.inspirationImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.inspirationGradient}
                  />
                  <View style={styles.inspirationContent}>
                    <Text style={styles.inspirationTitle}>{idea.title}</Text>
                    <View style={styles.inspirationMeta}>
                      <Text style={styles.inspirationBudget}>{idea.budget}</Text>
                      <Text style={styles.inspirationDuration}>{idea.duration}</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

interface ItineraryCardProps {
  itinerary: DateItinerary;
  onPress: () => void;
}

function ItineraryCard({ itinerary, onPress }: ItineraryCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Pressable style={styles.itineraryCard} onPress={onPress}>
      <View style={styles.itineraryDate}>
        <Calendar size={16} color={colors.secondary} />
        <Text style={styles.itineraryDateText}>{formatDate(itinerary.date)}</Text>
      </View>
      <Text style={styles.itineraryName}>{itinerary.name}</Text>
      <View style={styles.itineraryMeta}>
        <View style={styles.itineraryMetaItem}>
          <Users size={14} color={colors.textTertiary} />
          <Text style={styles.itineraryMetaText}>{itinerary.partnerName}</Text>
        </View>
        <View style={styles.itineraryMetaItem}>
          <Clock size={14} color={colors.textTertiary} />
          <Text style={styles.itineraryMetaText}>
            {itinerary.activities.length} activities
          </Text>
        </View>
      </View>
      <ChevronRight size={20} color={colors.textTertiary} style={styles.itineraryChevron} />
    </Pressable>
  );
}

const dateInspiration = [
  {
    title: 'Romantic Dinner',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    budget: '$$$',
    duration: '3 hrs',
  },
  {
    title: 'Adventure Day',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400',
    budget: '$$',
    duration: '5 hrs',
  },
  {
    title: 'Art & Culture',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    budget: '$$',
    duration: '4 hrs',
  },
  {
    title: 'Cozy Night In',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    budget: '$',
    duration: '4 hrs',
  },
];

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
    height: 200,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textLight,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.textLight,
    opacity: 0.9,
    marginTop: 4,
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
  },
  setupBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.secondary,
    marginBottom: 24,
  },
  setupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.secondary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setupText: {
    flex: 1,
    marginLeft: 12,
  },
  setupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  setupDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    paddingHorizontal: 20,
    marginBottom: 12,
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
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  partnersScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  partnerCard: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.borderLight,
    width: 100,
  },
  partnerCardSelected: {
    borderColor: colors.secondary,
    backgroundColor: `${colors.secondary}08`,
  },
  partnerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textLight,
  },
  linkedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  partnerName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
    marginTop: 6,
  },
  emptyPartnerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
  },
  emptyPartnerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyPartnerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  emptyPartnerDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  actionCardPrimary: {
    width: '100%',
    flex: undefined,
    padding: 0,
    overflow: 'hidden',
    borderWidth: 0,
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textLight,
    marginTop: 12,
  },
  actionDescription: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.9,
    marginTop: 4,
  },
  actionTitleDark: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  itineraryCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  itineraryDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  itineraryDateText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.secondary,
  },
  itineraryName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  itineraryMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  itineraryMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itineraryMetaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  itineraryChevron: {
    position: 'absolute',
    right: 16,
    top: '50%',
  },
  inspirationScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  inspirationCard: {
    width: 200,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
  },
  inspirationImage: {
    width: '100%',
    height: '100%',
  },
  inspirationGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  inspirationContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  inspirationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
  },
  inspirationMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  inspirationBudget: {
    fontSize: 12,
    color: colors.textLight,
    opacity: 0.9,
  },
  inspirationDuration: {
    fontSize: 12,
    color: colors.textLight,
    opacity: 0.9,
  },
  bottomSpacer: {
    height: 100,
  },
});
