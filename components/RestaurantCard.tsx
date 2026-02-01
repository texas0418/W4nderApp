import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import {
  Star,
  MapPin,
  Clock,
  DollarSign,
  Heart,
  ChevronRight,
  Users,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import {
  RestaurantWithAvailability,
  TimeSlot,
  formatPriceRange,
  getProviderColor,
  getProviderName,
  ReservationProvider,
} from '@/types/restaurant';

interface RestaurantCardProps {
  restaurant: RestaurantWithAvailability;
  onPress: () => void;
  onSelectSlot: (slot: TimeSlot) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export default function RestaurantCard({
  restaurant,
  onPress,
  onSelectSlot,
  isFavorite = false,
  onToggleFavorite,
}: RestaurantCardProps) {
  // Flatten all available slots from all providers and sort by time
  const allSlots = restaurant.availability
    .flatMap(group => group.slots)
    .filter(slot => slot.isAvailable)
    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
    .slice(0, 6); // Show max 6 slots

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        {restaurant.coverPhoto ? (
          <Image
            source={{ uri: restaurant.coverPhoto }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>
              {restaurant.name.charAt(0)}
            </Text>
          </View>
        )}
        
        {/* Favorite button */}
        {onToggleFavorite && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
          >
            <Heart
              size={20}
              color={isFavorite ? colors.error : '#fff'}
              fill={isFavorite ? colors.error : 'transparent'}
            />
          </TouchableOpacity>
        )}

        {/* Provider badges */}
        <View style={styles.providerBadges}>
          {restaurant.reservationProviders.map((provider) => (
            <View
              key={provider}
              style={[
                styles.providerBadge,
                { backgroundColor: getProviderColor(provider) },
              ]}
            >
              <Text style={styles.providerBadgeText}>
                {getProviderName(provider)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {restaurant.name}
          </Text>
          {restaurant.aggregateRating && (
            <View style={styles.rating}>
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>
                {restaurant.aggregateRating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        {/* Meta info */}
        <View style={styles.meta}>
          <Text style={styles.cuisine} numberOfLines={1}>
            {restaurant.cuisineTypes.slice(0, 2).join(' • ')}
          </Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.price}>
            {formatPriceRange(restaurant.priceRange)}
          </Text>
          {restaurant.neighborhood && (
            <>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.neighborhood} numberOfLines={1}>
                {restaurant.neighborhood}
              </Text>
            </>
          )}
        </View>

        {/* Time slots */}
        {allSlots.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.slotsContainer}
            contentContainerStyle={styles.slotsContent}
          >
            {allSlots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.slotButton,
                  { borderColor: getProviderColor(slot.provider) },
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  onSelectSlot(slot);
                }}
              >
                <Text
                  style={[
                    styles.slotTime,
                    { color: getProviderColor(slot.provider) },
                  ]}
                >
                  {slot.displayTime}
                </Text>
                {slot.type !== 'standard' && (
                  <Text style={styles.slotType}>{slot.typeName || slot.type}</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noSlots}>
            <Clock size={14} color={colors.textTertiary} />
            <Text style={styles.noSlotsText}>No times available</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// Compact version for lists
interface CompactRestaurantCardProps {
  restaurant: RestaurantWithAvailability;
  onPress: () => void;
  selectedSlot?: TimeSlot;
}

export function CompactRestaurantCard({
  restaurant,
  onPress,
  selectedSlot,
}: CompactRestaurantCardProps) {
  return (
    <TouchableOpacity
      style={styles.compactContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {restaurant.coverPhoto ? (
        <Image
          source={{ uri: restaurant.coverPhoto }}
          style={styles.compactImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.compactImage, styles.imagePlaceholder]}>
          <Text style={styles.compactPlaceholderText}>
            {restaurant.name.charAt(0)}
          </Text>
        </View>
      )}

      <View style={styles.compactContent}>
        <Text style={styles.compactName} numberOfLines={1}>
          {restaurant.name}
        </Text>
        <View style={styles.compactMeta}>
          <Text style={styles.compactCuisine}>
            {restaurant.cuisineTypes[0]}
          </Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.compactPrice}>
            {formatPriceRange(restaurant.priceRange)}
          </Text>
          {restaurant.aggregateRating && (
            <>
              <Text style={styles.metaDot}>•</Text>
              <Star size={12} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.compactRating}>
                {restaurant.aggregateRating.toFixed(1)}
              </Text>
            </>
          )}
        </View>
        {selectedSlot && (
          <View style={styles.compactSlot}>
            <Clock size={12} color={colors.primary} />
            <Text style={styles.compactSlotText}>
              {selectedSlot.displayTime}
            </Text>
          </View>
        )}
      </View>

      <ChevronRight size={18} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.textTertiary,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerBadges: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    gap: 6,
  },
  providerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  providerBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cuisine: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  metaDot: {
    fontSize: 13,
    color: colors.textTertiary,
    marginHorizontal: 6,
  },
  price: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  neighborhood: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  slotsContainer: {
    marginTop: 12,
  },
  slotsContent: {
    gap: 8,
  },
  slotButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: colors.background,
    alignItems: 'center',
    marginRight: 8,
  },
  slotTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  slotType: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  noSlots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  noSlotsText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  compactImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  compactPlaceholderText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textTertiary,
  },
  compactContent: {
    flex: 1,
    marginLeft: 12,
  },
  compactName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  compactCuisine: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  compactPrice: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  compactRating: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 2,
  },
  compactSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  compactSlotText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
});
