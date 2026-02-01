import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Star,
  Clock,
  Users,
  Heart,
  Zap,
  Smartphone,
  Tag,
  ChevronRight,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import {
  Activity,
  formatPrice,
  getProviderColor,
  getProviderName,
  getCategoryLabel,
  getCancellationLabel,
} from '@/types/activity';

interface ActivityCardProps {
  activity: Activity;
  onPress: () => void;
  onBook?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export default function ActivityCard({
  activity,
  onPress,
  onBook,
  isFavorite = false,
  onToggleFavorite,
}: ActivityCardProps) {
  const hasDiscount = activity.pricing.retailPrice && activity.pricing.discountPercent;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        {activity.thumbnailUrl ? (
          <Image
            source={{ uri: activity.thumbnailUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>
              {activity.title.charAt(0)}
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

        {/* Badges */}
        <View style={styles.badges}>
          {activity.isBestseller && (
            <View style={[styles.badge, styles.bestsellerBadge]}>
              <Text style={styles.badgeText}>Bestseller</Text>
            </View>
          )}
          {activity.isLikelyToSellOut && (
            <View style={[styles.badge, styles.sellOutBadge]}>
              <Text style={styles.badgeText}>Likely to sell out</Text>
            </View>
          )}
          {activity.skipTheLine && (
            <View style={[styles.badge, styles.skipLineBadge]}>
              <Zap size={10} color="#fff" />
              <Text style={styles.badgeText}>Skip the line</Text>
            </View>
          )}
        </View>

        {/* Discount badge */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{activity.pricing.discountPercent}%</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Provider & Category */}
        <View style={styles.metaRow}>
          <View style={[styles.providerBadge, { backgroundColor: `${getProviderColor(activity.provider)}15` }]}>
            <Text style={[styles.providerText, { color: getProviderColor(activity.provider) }]}>
              {getProviderName(activity.provider)}
            </Text>
          </View>
          <Text style={styles.category}>{getCategoryLabel(activity.category)}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {activity.title}
        </Text>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <Star size={14} color="#F59E0B" fill="#F59E0B" />
          <Text style={styles.rating}>{activity.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({activity.reviewCount.toLocaleString()} reviews)</Text>
        </View>

        {/* Duration & Features */}
        <View style={styles.featuresRow}>
          <View style={styles.feature}>
            <Clock size={14} color={colors.textSecondary} />
            <Text style={styles.featureText}>{activity.duration.displayText}</Text>
          </View>
          {activity.instantConfirmation && (
            <View style={styles.feature}>
              <Zap size={14} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.success }]}>Instant</Text>
            </View>
          )}
          {activity.mobileTicket && (
            <View style={styles.feature}>
              <Smartphone size={14} color={colors.textSecondary} />
              <Text style={styles.featureText}>Mobile</Text>
            </View>
          )}
        </View>

        {/* Cancellation policy */}
        {activity.cancellationPolicy.type === 'free' && (
          <View style={styles.cancellationRow}>
            <Text style={styles.cancellationText}>
              ✓ Free cancellation
            </Text>
          </View>
        )}

        {/* Price */}
        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            {hasDiscount && (
              <Text style={styles.originalPrice}>
                {formatPrice(activity.pricing.retailPrice!, activity.pricing.currency)}
              </Text>
            )}
            <Text style={styles.price}>
              {formatPrice(activity.pricing.basePrice, activity.pricing.currency)}
            </Text>
            <Text style={styles.priceLabel}>per person</Text>
          </View>

          {onBook && (
            <TouchableOpacity
              style={styles.bookButton}
              onPress={(e) => {
                e.stopPropagation();
                onBook();
              }}
            >
              <Text style={styles.bookButtonText}>Check Availability</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Compact version for lists
interface CompactActivityCardProps {
  activity: Activity;
  onPress: () => void;
  selectedTime?: string;
}

export function CompactActivityCard({
  activity,
  onPress,
  selectedTime,
}: CompactActivityCardProps) {
  return (
    <TouchableOpacity
      style={styles.compactContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {activity.thumbnailUrl ? (
        <Image
          source={{ uri: activity.thumbnailUrl }}
          style={styles.compactImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.compactImage, styles.imagePlaceholder]}>
          <Text style={styles.compactPlaceholderText}>
            {activity.title.charAt(0)}
          </Text>
        </View>
      )}

      <View style={styles.compactContent}>
        <Text style={styles.compactTitle} numberOfLines={1}>
          {activity.title}
        </Text>
        <View style={styles.compactMeta}>
          <Text style={styles.compactCategory}>
            {getCategoryLabel(activity.category)}
          </Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.compactDuration}>
            {activity.duration.displayText}
          </Text>
          <Text style={styles.metaDot}>•</Text>
          <Star size={12} color="#F59E0B" fill="#F59E0B" />
          <Text style={styles.compactRating}>{activity.rating.toFixed(1)}</Text>
        </View>
        {selectedTime && (
          <View style={styles.compactTime}>
            <Clock size={12} color={colors.primary} />
            <Text style={styles.compactTimeText}>{selectedTime}</Text>
          </View>
        )}
      </View>

      <View style={styles.compactPriceContainer}>
        <Text style={styles.compactPrice}>
          {formatPrice(activity.pricing.basePrice, activity.pricing.currency)}
        </Text>
        <ChevronRight size={18} color={colors.textTertiary} />
      </View>
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
    height: 180,
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
  badges: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  bestsellerBadge: {
    backgroundColor: '#F59E0B',
  },
  sellOutBadge: {
    backgroundColor: '#EF4444',
  },
  skipLineBadge: {
    backgroundColor: '#10B981',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    padding: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  providerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  providerText: {
    fontSize: 11,
    fontWeight: '600',
  },
  category: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    lineHeight: 22,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  reviewCount: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  cancellationRow: {
    marginBottom: 10,
  },
  cancellationText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  originalPrice: {
    fontSize: 13,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
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
    width: 64,
    height: 64,
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
  compactTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  compactCategory: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  metaDot: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  compactDuration: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  compactRating: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 2,
  },
  compactTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  compactTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  compactPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
});
