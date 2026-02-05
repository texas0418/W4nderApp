import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Gift,
  Star,
  Sparkles,
  Tag,
  Zap,
  Trophy,
  ChevronRight,
  Check,
  Lock,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Reward } from '@/types';

const categoryIcons: Record<string, typeof Gift> = {
  discount: Tag,
  upgrade: Zap,
  freebie: Gift,
  experience: Trophy,
};

export default function RewardsScreen() {
  const router = useRouter();
  const { user, rewards, redeemReward, addRewardPoints } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ['discount', 'upgrade', 'freebie', 'experience'];

  const filteredRewards = selectedCategory
    ? rewards.filter((r) => r.category === selectedCategory && !r.isRedeemed)
    : rewards.filter((r) => !r.isRedeemed);

  const redeemedRewards = rewards.filter((r) => r.isRedeemed);

  const handleRedeem = (reward: Reward) => {
    if (user.rewardPoints < reward.pointsCost) {
      Alert.alert(
        'Not Enough Points',
        `You need ${reward.pointsCost - user.rewardPoints} more points to redeem this reward.`
      );
      return;
    }

    Alert.alert(
      'Redeem Reward',
      `Are you sure you want to redeem "${reward.name}" for ${reward.pointsCost} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: () => {
            const success = redeemReward(reward.id);
            if (success) {
              Alert.alert(
                'Success!',
                'Your reward has been redeemed. Check your email for details.'
              );
            }
          },
        },
      ]
    );
  };

  const renderRewardCard = (reward: Reward) => {
    const Icon = categoryIcons[reward.category] || Gift;
    const canRedeem = user.rewardPoints >= reward.pointsCost;

    return (
      <Pressable
        key={reward.id}
        style={styles.rewardCard}
        onPress={() => handleRedeem(reward)}
        disabled={!canRedeem}
      >
        {reward.image && (
          <Image source={{ uri: reward.image }} style={styles.rewardImage} contentFit="cover" />
        )}
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.rewardGradient} />
        <View style={styles.rewardContent}>
          <View style={styles.rewardBadge}>
            <Icon size={14} color={colors.textLight} />
            <Text style={styles.rewardBadgeText}>{reward.category}</Text>
          </View>
          <Text style={styles.rewardName}>{reward.name}</Text>
          <Text style={styles.rewardDescription} numberOfLines={2}>
            {reward.description}
          </Text>
          <View style={styles.rewardFooter}>
            <View style={styles.pointsCost}>
              <Star size={14} color={colors.warning} fill={colors.warning} />
              <Text style={styles.pointsText}>{reward.pointsCost.toLocaleString()}</Text>
            </View>
            {canRedeem ? (
              <View style={styles.redeemIndicator}>
                <Text style={styles.redeemText}>Redeem</Text>
                <ChevronRight size={16} color={colors.textLight} />
              </View>
            ) : (
              <View style={styles.lockedIndicator}>
                <Lock size={14} color={colors.textLight} />
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.warning, '#F59E0B']} style={styles.headerGradient} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={colors.textLight} />
          </Pressable>
        </View>

        <View style={styles.pointsCard}>
          <Sparkles size={32} color={colors.textLight} />
          <Text style={styles.pointsLabel}>Your Points</Text>
          <Text style={styles.pointsValue}>{user.rewardPoints.toLocaleString()}</Text>
          <Pressable
            style={styles.earnMoreButton}
            onPress={() =>
              Alert.alert('Earn Points', 'Complete trips and bookings to earn more points!')
            }
          >
            <Text style={styles.earnMoreText}>How to earn more</Text>
            <ChevronRight size={16} color={colors.warning} />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.categoriesSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContent}
            >
              <Pressable
                style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={[styles.categoryText, !selectedCategory && styles.categoryTextActive]}>
                  All
                </Text>
              </Pressable>
              {categories.map((cat) => {
                const Icon = categoryIcons[cat];
                return (
                  <Pressable
                    key={cat}
                    style={[
                      styles.categoryChip,
                      selectedCategory === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Icon
                      size={16}
                      color={selectedCategory === cat ? colors.textLight : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        selectedCategory === cat && styles.categoryTextActive,
                      ]}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.rewardsSection}>
            <Text style={styles.sectionTitle}>Available Rewards</Text>
            {filteredRewards.length > 0 ? (
              <View style={styles.rewardsGrid}>{filteredRewards.map(renderRewardCard)}</View>
            ) : (
              <View style={styles.emptyState}>
                <Gift size={40} color={colors.textTertiary} />
                <Text style={styles.emptyText}>No rewards in this category</Text>
              </View>
            )}
          </View>

          {redeemedRewards.length > 0 && (
            <View style={styles.redeemedSection}>
              <Text style={styles.sectionTitle}>Redeemed</Text>
              {redeemedRewards.map((reward) => (
                <View key={reward.id} style={styles.redeemedCard}>
                  <View style={styles.redeemedIcon}>
                    <Check size={18} color={colors.success} />
                  </View>
                  <View style={styles.redeemedInfo}>
                    <Text style={styles.redeemedName}>{reward.name}</Text>
                    <Text style={styles.redeemedPoints}>
                      {reward.pointsCost.toLocaleString()} points
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.howItWorks}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            <View style={styles.stepsContainer}>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>Book trips and activities</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>Earn points on every booking</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>Redeem for amazing rewards</Text>
              </View>
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
    height: 280,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  pointsLabel: {
    fontSize: 16,
    color: colors.textLight,
    opacity: 0.9,
    marginTop: 12,
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.textLight,
  },
  earnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  earnMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textLight,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
  },
  categoriesSection: {
    paddingTop: 24,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: colors.warning,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.textLight,
  },
  rewardsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  rewardsGrid: {
    gap: 16,
  },
  rewardCard: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  rewardImage: {
    width: '100%',
    height: '100%',
  },
  rewardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  rewardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  rewardBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textLight,
    textTransform: 'capitalize',
  },
  rewardName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textLight,
  },
  rewardDescription: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.9,
    marginTop: 4,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  pointsCost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textLight,
  },
  redeemIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  redeemText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textLight,
  },
  lockedIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.surface,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 12,
  },
  redeemedSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  redeemedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  redeemedIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.success}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redeemedInfo: {
    flex: 1,
    marginLeft: 12,
  },
  redeemedName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  redeemedPoints: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  howItWorks: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  stepsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textLight,
  },
  stepText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  bottomSpacer: {
    height: 40,
  },
});
