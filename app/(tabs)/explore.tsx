import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, MapPin, Star, X } from 'lucide-react-native';
import colors from '@/constants/colors';
import { destinations } from '@/mocks/destinations';

const { width } = Dimensions.get('window');

const categories = [
  { id: 'all', label: 'All' },
  { id: 'beach', label: 'Beach' },
  { id: 'cultural', label: 'Cultural' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'romantic', label: 'Romantic' },
  { id: 'nature', label: 'Nature' },
];

export default function ExploreScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredDestinations = useCallback(() => {
    let filtered = destinations;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) => d.name.toLowerCase().includes(query) || d.country.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((d) =>
        d.tags.some((tag) => tag.toLowerCase() === selectedCategory.toLowerCase())
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const results = filteredDestinations();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Explore</Text>
          <Text style={styles.subtitle}>Discover your next adventure</Text>

          <View style={styles.searchContainer}>
            <Search size={20} color={colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search destinations..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <X size={18} color={colors.textTertiary} />
              </Pressable>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat.id && styles.categoryTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.resultsCount}>
            {results.length} destination{results.length !== 1 ? 's' : ''} found
          </Text>

          <View style={styles.grid}>
            {results.map((dest) => (
              <Pressable
                key={dest.id}
                style={styles.destCard}
                onPress={() => router.push(`/destination/${dest.id}`)}
              >
                <Image source={{ uri: dest.image }} style={styles.destImage} contentFit="cover" />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.destGradient}
                />
                <View style={styles.destContent}>
                  <View style={styles.ratingBadge}>
                    <Star size={12} color={colors.warning} fill={colors.warning} />
                    <Text style={styles.ratingText}>{dest.rating}</Text>
                  </View>
                  <Text style={styles.destName}>{dest.name}</Text>
                  <View style={styles.destLocation}>
                    <MapPin size={12} color={colors.textLight} />
                    <Text style={styles.destCountry}>{dest.country}</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>From</Text>
                    <Text style={styles.price}>
                      ${dest.avgPrice}
                      <Text style={styles.priceUnit}>/day</Text>
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
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
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  categoriesScroll: {
    marginTop: 16,
    marginHorizontal: -20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.textLight,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  resultsCount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  destCard: {
    width: (width - 56) / 2,
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
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
    padding: 14,
  },
  ratingBadge: {
    position: 'absolute',
    top: -160,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
  },
  destName: {
    fontSize: 17,
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
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 11,
    color: colors.textLight,
    opacity: 0.7,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textLight,
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '400',
  },
});
