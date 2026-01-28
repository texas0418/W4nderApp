import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Plane,
  Building2,
  Utensils,
  Car,
  Ticket,
  Shield,
  Calendar,
  MapPin,
  Clock,
  Phone,
  Copy,
  Share2,
  XCircle,
  CheckCircle,
  AlertCircle,
  Navigation,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Booking, FlightDetails, HotelDetails, RestaurantDetails } from '@/types';

const bookingTypeIcons: Record<string, typeof Plane> = {
  flight: Plane,
  hotel: Building2,
  restaurant: Utensils,
  transport: Car,
  activity: Ticket,
  insurance: Shield,
};

export default function BookingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { bookings, cancelBooking } = useApp();

  const booking = bookings.find(b => b.id === id);

  if (!booking) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={22} color={colors.text} />
            </Pressable>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Booking not found</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const IconComponent = bookingTypeIcons[booking.type] || Ticket;

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
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleCopyCode = async () => {
    if (booking.confirmationCode) {
      await Clipboard.setStringAsync(booking.confirmationCode);
      Alert.alert('Copied!', 'Confirmation code copied to clipboard');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Booking: ${booking.name}\nDate: ${formatDate(booking.startDate)}\nConfirmation: ${booking.confirmationCode || 'N/A'}`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => {
            cancelBooking(booking.id);
            router.back();
          }
        },
      ]
    );
  };

  const renderFlightDetails = (details: FlightDetails) => (
    <View style={styles.detailsSection}>
      <Text style={styles.detailsTitle}>Flight Details</Text>
      <View style={styles.flightRoute}>
        <View style={styles.flightPoint}>
          <Text style={styles.airportCode}>{details.departure.airport}</Text>
          <Text style={styles.flightTime}>{details.departure.time}</Text>
          {details.departure.terminal && (
            <Text style={styles.terminal}>Terminal {details.departure.terminal}</Text>
          )}
          {details.departure.gate && (
            <Text style={styles.gate}>Gate {details.departure.gate}</Text>
          )}
        </View>
        <View style={styles.flightLine}>
          <Plane size={20} color={colors.primary} />
        </View>
        <View style={[styles.flightPoint, { alignItems: 'flex-end' }]}>
          <Text style={styles.airportCode}>{details.arrival.airport}</Text>
          <Text style={styles.flightTime}>{details.arrival.time}</Text>
          {details.arrival.terminal && (
            <Text style={styles.terminal}>Terminal {details.arrival.terminal}</Text>
          )}
        </View>
      </View>
      <View style={styles.flightInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Airline</Text>
          <Text style={styles.infoValue}>{details.airline}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Flight</Text>
          <Text style={styles.infoValue}>{details.flightNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Class</Text>
          <Text style={styles.infoValue}>{details.class}</Text>
        </View>
        {details.baggage && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Baggage</Text>
            <Text style={styles.infoValue}>{details.baggage}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderHotelDetails = (details: HotelDetails) => (
    <View style={styles.detailsSection}>
      <Text style={styles.detailsTitle}>Hotel Details</Text>
      <View style={styles.hotelInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Check-in</Text>
          <Text style={styles.infoValue}>{details.checkIn}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Check-out</Text>
          <Text style={styles.infoValue}>{details.checkOut}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Room Type</Text>
          <Text style={styles.infoValue}>{details.roomType}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Address</Text>
          <Text style={styles.infoValue}>{details.address}</Text>
        </View>
        {details.phone && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={[styles.infoValue, { color: colors.primary }]}>{details.phone}</Text>
          </View>
        )}
      </View>
      {details.amenities.length > 0 && (
        <View style={styles.amenitiesContainer}>
          <Text style={styles.amenitiesTitle}>Amenities</Text>
          <View style={styles.amenitiesList}>
            {details.amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityChip}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderRestaurantDetails = (details: RestaurantDetails) => (
    <View style={styles.detailsSection}>
      <Text style={styles.detailsTitle}>Reservation Details</Text>
      <View style={styles.hotelInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cuisine</Text>
          <Text style={styles.infoValue}>{details.cuisine}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Time</Text>
          <Text style={styles.infoValue}>{details.reservationTime}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Party Size</Text>
          <Text style={styles.infoValue}>{details.partySize} people</Text>
        </View>
        {details.specialRequests && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Notes</Text>
            <Text style={styles.infoValue}>{details.specialRequests}</Text>
          </View>
        )}
        {details.phone && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={[styles.infoValue, { color: colors.primary }]}>{details.phone}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {booking.image && (
        <>
          <Image
            source={{ uri: booking.image }}
            style={styles.coverImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.6)']}
            style={styles.coverGradient}
          />
        </>
      )}

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={booking.image ? colors.textLight : colors.text} />
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable style={styles.actionBtn} onPress={handleShare}>
              <Share2 size={20} color={booking.image ? colors.textLight : colors.text} />
            </Pressable>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {booking.image && <View style={styles.imageSpacer} />}

          <View style={[styles.mainContent, !booking.image && styles.mainContentNoImage]}>
            <View style={styles.titleSection}>
              <View style={styles.typeIconLarge}>
                <IconComponent size={28} color={colors.primary} />
              </View>
              <Text style={styles.bookingName}>{booking.name}</Text>
              <Text style={styles.bookingDescription}>{booking.description}</Text>
              
              <View style={[styles.statusBadgeLarge, { backgroundColor: `${getStatusColor(booking.status)}15` }]}>
                {booking.status === 'confirmed' && <CheckCircle size={16} color={getStatusColor(booking.status)} />}
                {booking.status === 'pending' && <AlertCircle size={16} color={getStatusColor(booking.status)} />}
                {booking.status === 'cancelled' && <XCircle size={16} color={getStatusColor(booking.status)} />}
                <Text style={[styles.statusTextLarge, { color: getStatusColor(booking.status) }]}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Text>
              </View>
            </View>

            {booking.confirmationCode && (
              <Pressable style={styles.confirmationCard} onPress={handleCopyCode}>
                <View style={styles.confirmationContent}>
                  <Text style={styles.confirmationLabel}>Confirmation Code</Text>
                  <Text style={styles.confirmationCode}>{booking.confirmationCode}</Text>
                </View>
                <Copy size={20} color={colors.primary} />
              </Pressable>
            )}

            <View style={styles.infoCards}>
              <View style={styles.infoCard}>
                <Calendar size={20} color={colors.primary} />
                <Text style={styles.infoCardLabel}>Date</Text>
                <Text style={styles.infoCardValue}>{formatDate(booking.startDate)}</Text>
              </View>
              {booking.time && (
                <View style={styles.infoCard}>
                  <Clock size={20} color={colors.primary} />
                  <Text style={styles.infoCardLabel}>Time</Text>
                  <Text style={styles.infoCardValue}>{booking.time}</Text>
                </View>
              )}
            </View>

            <View style={styles.locationCard}>
              <MapPin size={20} color={colors.primary} />
              <Text style={styles.locationText}>{booking.location}</Text>
              <Pressable style={styles.directionsBtn}>
                <Navigation size={16} color={colors.textLight} />
                <Text style={styles.directionsText}>Directions</Text>
              </Pressable>
            </View>

            {booking.details && booking.type === 'flight' && 
              renderFlightDetails(booking.details as FlightDetails)}
            {booking.details && booking.type === 'hotel' && 
              renderHotelDetails(booking.details as HotelDetails)}
            {booking.details && booking.type === 'restaurant' && 
              renderRestaurantDetails(booking.details as RestaurantDetails)}

            <View style={styles.priceSection}>
              <Text style={styles.priceSectionTitle}>Price Summary</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Total Paid</Text>
                <Text style={styles.priceValue}>
                  {booking.currency} {booking.price.toLocaleString()}
                </Text>
              </View>
              {booking.provider && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Booked via</Text>
                  <Text style={styles.providerText}>{booking.provider}</Text>
                </View>
              )}
            </View>

            {booking.status === 'confirmed' && (
              <Pressable style={styles.cancelButton} onPress={handleCancel}>
                <XCircle size={20} color={colors.error} />
                <Text style={styles.cancelButtonText}>Cancel Booking</Text>
              </Pressable>
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
    height: 280,
  },
  coverGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
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
  imageSpacer: {
    height: 160,
  },
  mainContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingHorizontal: 20,
    minHeight: 500,
  },
  mainContentNoImage: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  typeIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  bookingName: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  bookingDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 16,
  },
  statusTextLarge: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  confirmationContent: {
    flex: 1,
  },
  confirmationLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  confirmationCode: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
  },
  infoCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  infoCardLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
  infoCardValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
    textAlign: 'center',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  locationText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    marginLeft: 12,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  directionsText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textLight,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  flightRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  flightPoint: {
    flex: 1,
  },
  airportCode: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  flightTime: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 4,
  },
  terminal: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  gate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  flightLine: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flightInfo: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  hotelInfo: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  amenitiesContainer: {
    marginTop: 16,
  },
  amenitiesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  amenityText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  priceSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  priceSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  providerText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: `${colors.error}10`,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.error,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  bottomSpacer: {
    height: 40,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
