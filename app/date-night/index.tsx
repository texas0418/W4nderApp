// app/date-night/index.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Heart,
  Settings,
  Sparkles,
  PenTool,
  UserPlus,
  ChevronRight,
  Calendar,
  Users,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useDateNight } from '@/contexts/DateNightContext';

export default function DateNightScreen() {
  const router = useRouter();
  const { userProfile, partners, upcomingDates } = useDateNight();

  const stats = {
    upcoming: upcomingDates?.filter((d) => new Date(d.date) > new Date()).length || 0,
    thisMonth: upcomingDates?.filter((d) => {
      const dateObj = new Date(d.date);
      const now = new Date();
      return dateObj.getMonth() === now.getMonth() && dateObj.getFullYear() === now.getFullYear();
    }).length || 0,
    completed: upcomingDates?.filter((d) => d.status === 'completed').length || 0,
  };

  const hasPreferences = userProfile?.preferences?.activityTypes?.length > 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.secondary, colors.secondaryLight]}
        style={styles.headerGradient}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={colors.textLight} />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Heart size={24} color={colors.textLight} fill={colors.textLight} />
            <Text style={styles.headerTitle}>Date Night</Text>
          </View>
          <Pressable
            style={styles.settingsButton}
            onPress={() => router.push('/date-night/my-preferences')}
          >
            <Settings size={22} color={colors.textLight} />
          </Pressable>
        </View>

        <Text style={styles.headerSubtitle}>Plan unforgettable moments together</Text>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Stats Card */}
          <View style={styles.statsCard}>
            <Pressable style={styles.statItem} onPress={() => router.push('/date-night/calendar')}>
              <Text style={styles.statNumber}>{stats.upcoming}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </Pressable>
            <View style={styles.statDivider} />
            <Pressable style={styles.statItem} onPress={() => router.push('/date-night/calendar')}>
              <Text style={styles.statNumber}>{stats.thisMonth}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </Pressable>
            <View style={styles.statDivider} />
            <Pressable style={styles.statItem} onPress={() => router.push('/date-night/history')}>
              <Text style={styles.statNumber}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </Pressable>
            <ChevronRight size={20} color={colors.textTertiary} />
          </View>

          {/* Complete Profile Card */}
          {!hasPreferences && (
            <Pressable
              style={styles.profileCard}
              onPress={() => router.push('/date-night/my-preferences')}
            >
              <View style={styles.profileIconContainer}>
                <Sparkles size={24} color={colors.secondary} />
              </View>
              <View style={styles.profileContent}>
                <Text style={styles.profileTitle}>Complete Your Profile</Text>
                <Text style={styles.profileDescription}>
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
                <Text style={styles.addButtonText}>+ Add</Text>
              </Pressable>
            </View>

            {partners && partners.length > 0 ? (
              <View style={styles.partnersList}>
                {partners.map((partner) => (
                  <Pressable key={partner.id} style={styles.partnerCard}>
                    <View style={styles.partnerAvatar}>
                      <Text style={styles.partnerInitial}>
                        {partner.name?.charAt(0).toUpperCase() || 'P'}
                      </Text>
                    </View>
                    <Text style={styles.partnerName}>{partner.name}</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Pressable
                style={styles.emptyPartnersCard}
                onPress={() => router.push('/date-night/add-partner')}
              >
                <View style={styles.emptyIconContainer}>
                  <UserPlus size={32} color={colors.textTertiary} />
                </View>
                <Text style={styles.emptyTitle}>Add Your First Partner</Text>
                <Text style={styles.emptyDescription}>
                  Add a partner to start planning date nights together
                </Text>
              </Pressable>
            )}
          </View>

          {/* Plan a Date Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plan a Date</Text>
            <View style={styles.planOptionsRow}>
              <Pressable
                style={[styles.planOption, styles.planOptionAI]}
                onPress={() => router.push('/date-night/generate-plan')}
              >
                <View style={styles.planOptionIcon}>
                  <Sparkles size={28} color="#FFFFFF" />
                </View>
                <Text style={styles.planOptionTitle}>AI-Powered</Text>
                <Text style={styles.planOptionDescription}>
                  Get personalized suggestions based on your preferences
                </Text>
              </Pressable>

              <Pressable
                style={[styles.planOption, styles.planOptionManual]}
                onPress={() => router.push('/date-night/build-itinerary')}
              >
                <View style={styles.planOptionIconManual}>
                  <PenTool size={28} color="#FFFFFF" />
                </View>
                <Text style={styles.planOptionTitleManual}>Build from Scratch</Text>
                <Text style={styles.planOptionDescriptionManual}>
                  Full control to create your perfect date itinerary
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <Pressable
                style={styles.quickAction}
                onPress={() => router.push('/date-night/calendar')}
              >
                <Calendar size={20} color={colors.primary} />
                <Text style={styles.quickActionText}>View Calendar</Text>
                <ChevronRight size={18} color={colors.textTertiary} />
              </Pressable>
              <Pressable
                style={styles.quickAction}
                onPress={() => router.push('/date-night/history')}
              >
                <Heart size={20} color={colors.secondary} />
                <Text style={styles.quickActionText}>Date History</Text>
                <ChevronRight size={18} color={colors.textTertiary} />
              </Pressable>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
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
    height: 200,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textLight,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.textLight,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  contentContainer: {
    paddingTop: 20,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderStyle: 'dashed',
  },
  profileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.secondary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileContent: {
    flex: 1,
    marginLeft: 12,
  },
  profileTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  profileDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginTop: 24,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  partnersList: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  partnerCard: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    minWidth: 80,
  },
  partnerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerInitial: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textLight,
  },
  partnerName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginTop: 8,
  },
  emptyPartnersCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  emptyDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  planOptionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  planOption: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    minHeight: 160,
  },
  planOptionAI: {
    backgroundColor: colors.secondary,
  },
  planOptionManual: {
    backgroundColor: colors.primary,
  },
  planOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  planOptionIconManual: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  planOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
  },
  planOptionTitleManual: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
  },
  planOptionDescription: {
    fontSize: 12,
    color: colors.textLight,
    opacity: 0.9,
    marginTop: 4,
  },
  planOptionDescriptionManual: {
    fontSize: 12,
    color: colors.textLight,
    opacity: 0.9,
    marginTop: 4,
  },
  quickActions: {
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 12,
  },
  quickActionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  bottomSpacer: {
    height: 40,
  },
});
