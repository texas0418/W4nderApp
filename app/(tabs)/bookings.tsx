import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Plane,
  Building2,
  Utensils,
  Car,
  Ticket,
  Shield,
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Music,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Booking } from '@/types';

const bookingTypeIcons: Record<string, typeof Plane> = {
  flight: Plane,
  hotel: Building2,
  restaurant: Utensils,
  transport: Car,
  activity: Ticket,
  insurance: Shield,
  event: Music,
};

const bookingTypeColors: Record<string, string> = {
  flight: colors.primary,
  hotel: colors.secondary,
  restaurant: colors.warning,
  transport: colors.success,
  activity: colors.primaryLight,
  insurance: colors.accentDark,
  event: '#E91E63',
};

export default function BookingsScreen() {
  const router = useRouter();
  const { bookings, cancelBooking } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return b.status === 'confirmed' || b.status === 'pending';
    if (filter === 'completed') return b.status === 'completed';
    if (filter === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return CheckCircle;
      case 'pending': return AlertCircle;
      case 'cancelled': return XCircle;
      case 'completed': return CheckCircle;
      default: return AlertCircle;
    }
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return colors.success;
      case 'pending': return colors.warning;
      case 'cancelled': return colors.error;
      case 'completed': return colors.textSecondary;
      default: return colors.textTertiary;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderBookingCard = (booking: Booking) => {
    const IconComponent = bookingTypeIcons[booking.type] || Ticket;
    const typeColor = bookingTypeColors[booking.type] || colors.primary;
    const StatusIcon = getStatusIcon(booking.status);
    const statusColor = getStatusColor(booking.status);

    return (
      <Pressable
        key={booking.id}
        style={styles.bookingCard}
        onPress={() => router.push(`/booking/${booking.id}`)}
      >
        <View style={styles.bookingHeader}>
          <View style={[styles.typeIcon, { backgroundColor: `${typeColor}15` }]}>
            <IconComponent size={20} color={typeColor} />
          </View>
          <View style={styles.bookingInfo}>
            <Text style={styles.bookingName}>{booking.name}</Text>
            <Text style={styles.bookingDescription} numberOfLines={1}>
              {booking.description}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <StatusIcon size={12} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {booking.status}
            </Text>
          </View>
        </View>

        {booking.image && (
          <Image
            source={{ uri: booking.image }}
            style={styles.bookingImage}
            contentFit="cover"
          />
        )}

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Calendar size={14} color={colors.textSecondary} />
            <Text style={styles.detailText}>{formatDate(booking.startDate)}</Text>
            {booking.time && (
              <>
                <Clock size={14} color={colors.textSecondary} />
                <Text style={styles.detailText}>{booking.time}</Text>
              </>
            )}
          </View>
          <View style={styles.detailRow}>
            <MapPin size={14} color={colors.textSecondary} />
            <Text style={styles.detailText} numberOfLines={1}>{booking.location}</Text>
          </View>
        </View>

        <View style={styles.bookingFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Total</Text>
            <Text style={styles.priceValue}>
              {booking.currency} {booking.price.toLocaleString()}
            </Text>
          </View>
          {booking.confirmationCode && (
            <View style={styles.confirmationCode}>
              <Text style={styles.confirmationLabel}>Confirmation</Text>
              <Text style={styles.confirmationValue}>{booking.confirmationCode}</Text>
            </View>
          )}
          <ChevronRight size={20} color={colors.textTertiary} />
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>My Bookings</Text>
          <Text style={styles.subtitle}>
            {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {(['all', 'upcoming', 'completed', 'cancelled'] as const).map(f => (
            <Pressable
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredBookings.length > 0 ? (
            filteredBookings.map(renderBookingCard)
          ) : (
            <View style={styles.emptyState}>
              <Ticket size={48} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No bookings yet</Text>
              <Text style={styles.emptySubtitle}>
                Your flight, hotel, and activity bookings will appear here
              </Text>
              <Pressable 
                style={styles.exploreButton}
                onPress={() => router.push('/explore')}
              >
                <Text style={styles.exploreButtonText}>Explore Destinations</Text>
              </Pressable>
            </View>
          )}
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
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
  },
  filterScroll: {
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.textLight,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  bookingCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bookingName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  bookingDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  bookingImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 12,
  },
  bookingDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  bookingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  confirmationCode: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  confirmationLabel: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  confirmationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  exploreButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 24,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
  },
});
