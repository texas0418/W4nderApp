import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Bell,
  MapPin,
  Calendar,
  Users,
  ChevronRight,
  Sparkles,
  Plus,
  Heart,
  Gift,
  Crown,
  Ticket,
  Shuffle,
  MessageCircle,
  UtensilsCrossed,
  CloudSun,
  DollarSign,
  Camera,
  Briefcase,
  Hospital,
  Wallet,
  Languages,
  Globe,
  ShieldCheck,
  Hotel,
  Car,
  Train,
  LayoutTemplate,
  Accessibility,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { trendingDestinations } from '@/mocks/destinations';
import { Trip } from '@/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

export default function HomeScreen() {
  const router = useRouter();
  const { user, trips, upcomingBookings, unreadNotificationsCount } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const upcomingTrips = trips.filter(t => t.status === 'upcoming' || t.status === 'planning');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'upcoming': return colors.success;
      case 'planning': return colors.warning;
      case 'ongoing': return colors.secondary;
      default: return colors.textTertiary;
    }
  };

  const getStatusLabel = (status: Trip['status']) => {
    switch (status) {
      case 'upcoming': return 'Confirmed';
      case 'planning': return 'Planning';
      case 'ongoing': return 'In Progress';
      default: return 'Completed';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        style={styles.headerGradient}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.userName}>{user.name}</Text>
              </View>
              <Pressable 
                style={styles.notificationButton}
                onPress={() => router.push('/notifications')}
              >
                <Bell size={22} color={colors.textLight} />
                {unreadNotificationsCount > 0 && (
                  <View style={styles.notificationBadge} />
                )}
              </Pressable>
            </View>

            <Pressable 
              style={styles.aiCard}
              onPress={() => router.push('/plan-trip')}
            >
              <LinearGradient
                colors={[colors.secondary, colors.secondaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.aiCardGradient}
              >
                <View style={styles.aiCardContent}>
                  <View style={styles.aiIconContainer}>
                    <Sparkles size={24} color={colors.textLight} />
                  </View>
                  <View style={styles.aiTextContainer}>
                    <Text style={styles.aiTitle}>Plan with AI</Text>
                    <Text style={styles.aiSubtitle}>
                      Create your perfect itinerary in seconds
                    </Text>
                  </View>
                  <ChevronRight size={20} color={colors.textLight} />
                </View>
              </LinearGradient>
            </Pressable>
          </View>

          <View style={styles.content}>
            <View style={styles.quickActions}>
              <Pressable 
                style={styles.quickAction}
                onPress={() => router.push('/packing-list')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${colors.secondary}15` }]}>
                  <Briefcase size={22} color={colors.secondary} />
                </View>
                <Text style={styles.quickActionText}>Packing</Text>
              </Pressable>
              <Pressable 
                style={styles.quickAction}
                onPress={() => router.push('/restaurants')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${colors.accentDark}15` }]}>
                  <UtensilsCrossed size={22} color={colors.accentDark} />
                </View>
                <Text style={styles.quickActionText}>Dining</Text>
              </Pressable>
              <Pressable 
                style={styles.quickAction}
                onPress={() => router.push('/group-trip')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${colors.primary}15` }]}>
                  <Users size={22} color={colors.primary} />
                </View>
                <Text style={styles.quickActionText}>Group</Text>
              </Pressable>
              <Pressable 
                style={styles.quickAction}
                onPress={() => router.push('/lodging')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${colors.success}15` }]}>
                  <Hotel size={22} color={colors.success} />
                </View>
                <Text style={styles.quickActionText}>Lodging</Text>
              </Pressable>
            </View>

            <View style={styles.quickActions}>
              <Pressable 
                style={styles.quickAction}
                onPress={() => router.push('/car-rental')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${colors.warning}15` }]}>
                  <Car size={22} color={colors.warning} />
                </View>
                <Text style={styles.quickActionText}>Car Rental</Text>
              </Pressable>
              <Pressable 
                style={styles.quickAction}
                onPress={() => router.push('/public-transit')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${colors.accentDark}15` }]}>
                  <Train size={22} color={colors.accentDark} />
                </View>
                <Text style={styles.quickActionText}>Transit</Text>
              </Pressable>
              <Pressable 
                style={styles.quickAction}
                onPress={() => router.push('/trip-templates')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${colors.secondary}15` }]}>
                  <LayoutTemplate size={22} color={colors.secondary} />
                </View>
                <Text style={styles.quickActionText}>Templates</Text>
              </Pressable>
              <Pressable 
                style={styles.quickAction}
                onPress={() => router.push('/accessibility')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${colors.primaryLight}15` }]}>
                  <Accessibility size={22} color={colors.primaryLight} />
                </View>
                <Text style={styles.quickActionText}>Access</Text>
              </Pressable>
            </View>

            {upcomingBookings.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Upcoming Bookings</Text>
                  <Pressable onPress={() => router.push('/bookings')}>
                    <Text style={styles.seeAll}>See all</Text>
                  </Pressable>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.bookingsScroll}
                >
                  {upcomingBookings.slice(0, 3).map(booking => (
                    <Pressable
                      key={booking.id}
                      style={styles.bookingCard}
                      onPress={() => router.push(`/booking/${booking.id}`)}
                    >
                      <View style={styles.bookingIcon}>
                        <Ticket size={20} color={colors.primary} />
                      </View>
                      <View style={styles.bookingInfo}>
                        <Text style={styles.bookingName} numberOfLines={1}>
                          {booking.name}
                        </Text>
                        <Text style={styles.bookingDate}>
                          {formatDate(booking.startDate)}
                        </Text>
                      </View>
                      <ChevronRight size={18} color={colors.textTertiary} />
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Trips</Text>
                <Pressable 
                  style={styles.addButton}
                  onPress={() => router.push('/plan-trip')}
                >
                  <Plus size={18} color={colors.primary} />
                  <Text style={styles.addButtonText}>New</Text>
                </Pressable>
              </View>

              {upcomingTrips.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tripsScroll}
                  decelerationRate="fast"
                  snapToInterval={CARD_WIDTH + 16}
                >
                  {upcomingTrips.map(trip => (
                    <Pressable
                      key={trip.id}
                      style={styles.tripCard}
                      onPress={() => router.push(`/trip/${trip.id}`)}
                    >
                      <Image
                        source={{ uri: trip.coverImage }}
                        style={styles.tripImage}
                        contentFit="cover"
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.tripGradient}
                      />
                      <View style={styles.tripContent}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(trip.status) }]}>
                          <Text style={styles.statusText}>{getStatusLabel(trip.status)}</Text>
                        </View>
                        <Text style={styles.tripName}>{trip.destination.name}</Text>
                        <Text style={styles.tripCountry}>{trip.destination.country}</Text>
                        <View style={styles.tripDetails}>
                          <View style={styles.tripDetail}>
                            <Calendar size={14} color={colors.textLight} />
                            <Text style={styles.tripDetailText}>
                              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                            </Text>
                          </View>
                          <View style={styles.tripDetail}>
                            <Users size={14} color={colors.textLight} />
                            <Text style={styles.tripDetailText}>{trip.travelers} travelers</Text>
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyTrips}>
                  <Text style={styles.emptyText}>No trips planned yet</Text>
                  <Pressable 
                    style={styles.planButton}
                    onPress={() => router.push('/plan-trip')}
                  >
                    <Text style={styles.planButtonText}>Plan Your First Trip</Text>
                  </Pressable>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Trending Destinations</Text>
                <Pressable onPress={() => router.push('/explore')}>
                  <Text style={styles.seeAll}>See all</Text>
                </Pressable>
              </View>
              <View style={styles.destinationsGrid}>
                {trendingDestinations.map((dest, index) => (
                  <Pressable
                    key={dest.id}
                    style={[
                      styles.destCard,
                      index === 0 && styles.destCardLarge,
                    ]}
                    onPress={() => router.push(`/destination/${dest.id}`)}
                  >
                    <Image
                      source={{ uri: dest.image }}
                      style={styles.destImage}
                      contentFit="cover"
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.7)']}
                      style={styles.destGradient}
                    />
                    <View style={styles.destContent}>
                      <Text style={styles.destName}>{dest.name}</Text>
                      <View style={styles.destLocation}>
                        <MapPin size={12} color={colors.textLight} />
                        <Text style={styles.destCountry}>{dest.country}</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.rewardsPromo}>
              <LinearGradient
                colors={[colors.warning, '#F59E0B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.rewardsPromoGradient}
              >
                <Gift size={32} color={colors.textLight} />
                <View style={styles.rewardsPromoContent}>
                  <Text style={styles.rewardsPromoTitle}>
                    You have {user.rewardPoints.toLocaleString()} points!
                  </Text>
                  <Text style={styles.rewardsPromoSubtitle}>
                    Redeem for exclusive rewards
                  </Text>
                </View>
                <Pressable 
                  style={styles.rewardsPromoButton}
                  onPress={() => router.push('/rewards')}
                >
                  <Text style={styles.rewardsPromoButtonText}>View</Text>
                </Pressable>
              </LinearGradient>
            </View>
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
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 15,
    color: colors.accent,
    opacity: 0.9,
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textLight,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  aiCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  aiCardGradient: {
    padding: 20,
  },
  aiCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textLight,
  },
  aiSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    opacity: 0.85,
    marginTop: 2,
  },
  content: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingTop: 24,
    minHeight: 500,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.accent,
    borderRadius: 20,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  bookingsScroll: {
    paddingHorizontal: 20,
  },
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginRight: 12,
    width: 220,
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
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  bookingDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tripsScroll: {
    paddingHorizontal: 20,
  },
  tripCard: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 16,
    position: 'relative',
  },
  tripImage: {
    width: '100%',
    height: '100%',
  },
  tripGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  tripContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tripName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textLight,
  },
  tripCountry: {
    fontSize: 15,
    color: colors.textLight,
    opacity: 0.85,
    marginBottom: 8,
  },
  tripDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  tripDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tripDetailText: {
    fontSize: 13,
    color: colors.textLight,
    opacity: 0.9,
  },
  emptyTrips: {
    marginHorizontal: 20,
    padding: 32,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  planButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  planButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textLight,
  },
  destinationsGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  destCard: {
    width: (width - 52) / 2,
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  destCardLarge: {
    width: width - 40,
    height: 180,
  },
  destImage: {
    width: '100%',
    height: '100%',
  },
  destGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  destContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  destName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textLight,
  },
  destLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  destCountry: {
    fontSize: 13,
    color: colors.textLight,
    opacity: 0.85,
  },
  rewardsPromo: {
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  rewardsPromoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  rewardsPromoContent: {
    flex: 1,
  },
  rewardsPromoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textLight,
  },
  rewardsPromoSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    opacity: 0.9,
    marginTop: 2,
  },
  rewardsPromoButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  rewardsPromoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
  },
});
