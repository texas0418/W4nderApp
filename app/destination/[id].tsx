import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Star,
  MapPin,
  Calendar,
  DollarSign,
  Heart,
  Share2,
  Sparkles,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { destinations } from '@/mocks/destinations';



export default function DestinationDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const destination = destinations.find(d => d.id === id);

  if (!destination) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.errorText}>Destination not found</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: destination.image }}
        style={styles.coverImage}
        contentFit="cover"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.8)']}
        style={styles.coverGradient}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={colors.textLight} />
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable style={styles.headerButton}>
              <Share2 size={20} color={colors.textLight} />
            </Pressable>
            <Pressable style={styles.headerButton}>
              <Heart size={20} color={colors.textLight} />
            </Pressable>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <View style={styles.ratingBadge}>
              <Star size={14} color={colors.warning} fill={colors.warning} />
              <Text style={styles.ratingText}>{destination.rating}</Text>
              <Text style={styles.reviewCount}>({destination.reviewCount.toLocaleString()} reviews)</Text>
            </View>
            <Text style={styles.destinationName}>{destination.name}</Text>
            <View style={styles.locationRow}>
              <MapPin size={16} color={colors.textLight} />
              <Text style={styles.country}>{destination.country}</Text>
            </View>
          </View>

          <View style={styles.mainContent}>
            <View style={styles.tagsRow}>
              {destination.tags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <DollarSign size={18} color={colors.primary} />
                </View>
                <Text style={styles.infoLabel}>Avg. Daily Cost</Text>
                <Text style={styles.infoValue}>
                  ${destination.avgPrice}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Calendar size={18} color={colors.primary} />
                </View>
                <Text style={styles.infoLabel}>Best Season</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {destination.bestSeason}
                </Text>
              </View>
            </View>

            <View style={styles.aboutSection}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{destination.description}</Text>
            </View>

            <View style={styles.highlightsSection}>
              <Text style={styles.sectionTitle}>Highlights</Text>
              <View style={styles.highlightsList}>
                <View style={styles.highlightItem}>
                  <View style={styles.highlightDot} />
                  <Text style={styles.highlightText}>World-famous landmarks and attractions</Text>
                </View>
                <View style={styles.highlightItem}>
                  <View style={styles.highlightDot} />
                  <Text style={styles.highlightText}>Rich local cuisine and dining experiences</Text>
                </View>
                <View style={styles.highlightItem}>
                  <View style={styles.highlightDot} />
                  <Text style={styles.highlightText}>Unique cultural experiences</Text>
                </View>
                <View style={styles.highlightItem}>
                  <View style={styles.highlightDot} />
                  <Text style={styles.highlightText}>Beautiful natural scenery</Text>
                </View>
              </View>
            </View>

            <View style={styles.spacer} />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>From</Text>
            <Text style={styles.price}>${destination.avgPrice}</Text>
            <Text style={styles.priceUnit}>/ day</Text>
          </View>
          <Pressable 
            style={styles.planButton}
            onPress={() => router.push('/plan-trip')}
          >
            <Sparkles size={18} color={colors.textLight} />
            <Text style={styles.planButtonText}>Plan Trip</Text>
          </Pressable>
        </View>
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
    height: 380,
  },
  coverGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 380,
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
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 140,
    paddingBottom: 32,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
  },
  reviewCount: {
    fontSize: 12,
    color: colors.textLight,
    opacity: 0.8,
  },
  destinationName: {
    fontSize: 40,
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
    fontSize: 18,
    color: colors.textLight,
    opacity: 0.9,
  },
  mainContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    minHeight: 400,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tag: {
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  infoItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  aboutSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  highlightsSection: {
    paddingHorizontal: 20,
  },
  highlightsList: {
    gap: 12,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  highlightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  highlightText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  spacer: {
    height: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  priceUnit: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  planButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 28,
  },
  planButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
});
