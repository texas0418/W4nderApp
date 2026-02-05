import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  Clock,
  DollarSign,
  Check,
  ChevronRight,
  PieChart,
  Share2,
  Ticket,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { trips, bookings } = useApp();
  const [selectedDay, setSelectedDay] = useState(0);

  const trip = trips.find((t) => t.id === id);
  const tripBookings = bookings.filter((b) => b.tripId === id);
  const budgetProgress = trip ? (trip.spentBudget / trip.totalBudget) * 100 : 0;
  const currentDayItinerary = trip?.itinerary[selectedDay];

  if (!trip) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={22} color={colors.text} />
            </Pressable>
          </View>
          <Text style={styles.errorText}>Trip not found</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: trip.coverImage }} style={styles.coverImage} contentFit="cover" />
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.8)']}
        style={styles.coverGradient}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={colors.textLight} />
          </Pressable>
          <Pressable style={styles.shareButton}>
            <Share2 size={20} color={colors.textLight} />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <Text style={styles.destination}>{trip.destination.name}</Text>
            <View style={styles.locationRow}>
              <MapPin size={16} color={colors.textLight} />
              <Text style={styles.country}>{trip.destination.country}</Text>
            </View>
          </View>

          <View style={styles.mainContent}>
            <View style={styles.infoCards}>
              <View style={styles.infoCard}>
                <Calendar size={20} color={colors.primary} />
                <Text style={styles.infoLabel}>Dates</Text>
                <Text style={styles.infoValue}>
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </Text>
              </View>
              <View style={styles.infoCard}>
                <Users size={20} color={colors.primary} />
                <Text style={styles.infoLabel}>Travelers</Text>
                <Text style={styles.infoValue}>{trip.travelers} people</Text>
              </View>
            </View>

            <Pressable
              style={styles.budgetSection}
              onPress={() =>
                router.push({ pathname: '/budget-tracker', params: { tripId: trip.id } })
              }
            >
              <View style={styles.budgetHeader}>
                <View style={styles.budgetTitleRow}>
                  <PieChart size={20} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Budget</Text>
                </View>
                <View style={styles.budgetRight}>
                  <Text style={styles.budgetAmount}>
                    {trip.currency} {trip.spentBudget.toLocaleString()} /{' '}
                    {trip.totalBudget.toLocaleString()}
                  </Text>
                  <ChevronRight size={18} color={colors.textTertiary} />
                </View>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(budgetProgress, 100)}%`,
                      backgroundColor:
                        budgetProgress > 90
                          ? colors.error
                          : budgetProgress > 70
                            ? colors.warning
                            : colors.success,
                    },
                  ]}
                />
              </View>
              <Text style={styles.budgetRemaining}>
                {trip.currency} {(trip.totalBudget - trip.spentBudget).toLocaleString()} remaining
              </Text>
            </Pressable>

            {tripBookings.length > 0 && (
              <View style={styles.bookingsSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Bookings</Text>
                  <Pressable onPress={() => router.push('/bookings')}>
                    <Text style={styles.seeAll}>See all</Text>
                  </Pressable>
                </View>
                <View style={styles.bookingsList}>
                  {tripBookings.slice(0, 3).map((booking) => (
                    <Pressable
                      key={booking.id}
                      style={styles.bookingItem}
                      onPress={() => router.push(`/booking/${booking.id}`)}
                    >
                      <View style={styles.bookingIcon}>
                        <Ticket size={18} color={colors.primary} />
                      </View>
                      <View style={styles.bookingInfo}>
                        <Text style={styles.bookingName}>{booking.name}</Text>
                        <Text style={styles.bookingDate}>{formatDate(booking.startDate)}</Text>
                      </View>
                      <View
                        style={[
                          styles.bookingStatus,
                          {
                            backgroundColor:
                              booking.status === 'confirmed'
                                ? `${colors.success}15`
                                : `${colors.warning}15`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.bookingStatusText,
                            {
                              color:
                                booking.status === 'confirmed' ? colors.success : colors.warning,
                            },
                          ]}
                        >
                          {booking.status}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {trip.itinerary.length > 0 && (
              <View style={styles.itinerarySection}>
                <Text style={styles.sectionTitle}>Itinerary</Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.daysScroll}
                  contentContainerStyle={styles.daysContent}
                >
                  {trip.itinerary.map((day, index) => (
                    <Pressable
                      key={day.day}
                      style={[styles.dayTab, selectedDay === index && styles.dayTabActive]}
                      onPress={() => setSelectedDay(index)}
                    >
                      <Text
                        style={[styles.dayNumber, selectedDay === index && styles.dayNumberActive]}
                      >
                        Day {day.day}
                      </Text>
                      <Text
                        style={[styles.dayTitle, selectedDay === index && styles.dayTitleActive]}
                        numberOfLines={1}
                      >
                        {day.title}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {currentDayItinerary && (
                  <View style={styles.activitiesList}>
                    {currentDayItinerary.activities.map((activity, index) => (
                      <View key={activity.id} style={styles.activityCard}>
                        <View style={styles.timelineContainer}>
                          <View style={styles.timelineDot}>
                            {activity.isBooked && <Check size={12} color={colors.textLight} />}
                          </View>
                          {index < currentDayItinerary.activities.length - 1 && (
                            <View style={styles.timelineLine} />
                          )}
                        </View>
                        <View style={styles.activityContent}>
                          <View style={styles.activityHeader}>
                            <Text style={styles.activityTime}>{activity.time}</Text>
                            <View style={styles.activityDuration}>
                              <Clock size={12} color={colors.textSecondary} />
                              <Text style={styles.durationText}>{activity.duration}</Text>
                            </View>
                          </View>
                          <Text style={styles.activityName}>{activity.name}</Text>
                          <View style={styles.activityLocation}>
                            <MapPin size={12} color={colors.textSecondary} />
                            <Text style={styles.locationText}>{activity.location}</Text>
                          </View>
                          {activity.price > 0 && (
                            <View style={styles.activityPrice}>
                              <DollarSign size={12} color={colors.success} />
                              <Text style={styles.priceText}>
                                {trip.currency} {activity.price}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Image
                          source={{ uri: activity.image }}
                          style={styles.activityImage}
                          contentFit="cover"
                        />
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {trip.itinerary.length === 0 && (
              <View style={styles.emptyItinerary}>
                <Text style={styles.emptyTitle}>No itinerary yet</Text>
                <Text style={styles.emptySubtitle}>
                  Start planning your trip with AI assistance
                </Text>
                <Pressable style={styles.planButton}>
                  <Text style={styles.planButtonText}>Generate Itinerary</Text>
                  <ChevronRight size={18} color={colors.textLight} />
                </Pressable>
              </View>
            )}

            <View style={styles.bottomSpacer} />
          </View>
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
  coverImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
  },
  coverGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 32,
  },
  destination: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.textLight,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  country: {
    fontSize: 16,
    color: colors.textLight,
    opacity: 0.9,
  },
  mainContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    minHeight: 500,
  },
  infoCards: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  budgetSection: {
    marginTop: 24,
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  budgetRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  budgetAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetRemaining: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
  },
  bookingsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  bookingsList: {
    gap: 10,
  },
  bookingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
  },
  bookingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bookingName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  bookingDate: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bookingStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bookingStatusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  itinerarySection: {
    marginTop: 24,
  },
  daysScroll: {
    marginTop: 12,
  },
  daysContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  dayTab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginRight: 8,
    minWidth: 100,
  },
  dayTabActive: {
    backgroundColor: colors.primary,
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  dayNumberActive: {
    color: colors.accent,
  },
  dayTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    maxWidth: 100,
  },
  dayTitleActive: {
    color: colors.textLight,
  },
  activitiesList: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 16,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  timelineContainer: {
    width: 40,
    alignItems: 'center',
    paddingTop: 16,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.accent,
    marginTop: 8,
  },
  activityContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  activityTime: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  activityDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  activityLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  activityPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.success,
  },
  activityImage: {
    width: 80,
    height: '100%',
  },
  emptyItinerary: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 32,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  planButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
  },
  planButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textLight,
  },
  bottomSpacer: {
    height: 40,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
});
