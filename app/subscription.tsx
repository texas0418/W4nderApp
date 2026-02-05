import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Crown,
  Check,
  X,
  Sparkles,
  Shield,
  Headphones,
  Users,
  Leaf,
  Zap,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { subscriptionPlans } from '@/mocks/appData';

const planColors: Record<string, readonly [string, string]> = {
  free: [colors.textSecondary, colors.textTertiary],
  standard: [colors.primary, colors.primaryLight],
  premium: ['#8B5CF6', '#A78BFA'],
  family: [colors.secondary, colors.secondaryLight],
};

const planIcons: Record<string, typeof Crown> = {
  free: Zap,
  standard: Sparkles,
  premium: Crown,
  family: Users,
};

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user, upgradeSubscription } = useApp();
  const [selectedPlan, setSelectedPlan] = useState(user.subscriptionTier);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubscribe = () => {
    if (selectedPlan === user.subscriptionTier) {
      Alert.alert('Already Subscribed', 'You are already on this plan.');
      return;
    }

    Alert.alert(
      'Confirm Subscription',
      `Upgrade to ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            upgradeSubscription(selectedPlan);
            Alert.alert('Success!', 'Your subscription has been updated.');
            router.back();
          },
        },
      ]
    );
  };

  const getPrice = (plan: (typeof subscriptionPlans)[0]) => {
    if (billingCycle === 'yearly') {
      return (plan.price * 10).toFixed(2);
    }
    return plan.price.toFixed(2);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#8B5CF6', '#A78BFA']} style={styles.headerGradient} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={colors.textLight} />
          </Pressable>
        </View>

        <View style={styles.heroSection}>
          <Crown size={48} color={colors.textLight} />
          <Text style={styles.heroTitle}>Upgrade Your Journey</Text>
          <Text style={styles.heroSubtitle}>Unlock premium features and exclusive benefits</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.billingToggle}>
            <Pressable
              style={[
                styles.billingOption,
                billingCycle === 'monthly' && styles.billingOptionActive,
              ]}
              onPress={() => setBillingCycle('monthly')}
            >
              <Text
                style={[styles.billingText, billingCycle === 'monthly' && styles.billingTextActive]}
              >
                Monthly
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.billingOption,
                billingCycle === 'yearly' && styles.billingOptionActive,
              ]}
              onPress={() => setBillingCycle('yearly')}
            >
              <Text
                style={[styles.billingText, billingCycle === 'yearly' && styles.billingTextActive]}
              >
                Yearly
              </Text>
              <View style={styles.saveBadge}>
                <Text style={styles.saveText}>Save 17%</Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.plansSection}>
            {subscriptionPlans.map((plan) => {
              const Icon = planIcons[plan.name];
              const isCurrentPlan = user.subscriptionTier === plan.name;
              const isSelected = selectedPlan === plan.name;

              return (
                <Pressable
                  key={plan.id}
                  style={[
                    styles.planCard,
                    isSelected && styles.planCardSelected,
                    plan.name === 'premium' && styles.planCardFeatured,
                  ]}
                  onPress={() => setSelectedPlan(plan.name)}
                >
                  {plan.name === 'premium' && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>Most Popular</Text>
                    </View>
                  )}

                  <View style={styles.planHeader}>
                    <LinearGradient colors={planColors[plan.name]} style={styles.planIcon}>
                      <Icon size={24} color={colors.textLight} />
                    </LinearGradient>
                    <View style={styles.planTitleContainer}>
                      <Text style={styles.planName}>
                        {plan.name.charAt(0).toUpperCase() + plan.name.slice(1)}
                      </Text>
                      {isCurrentPlan && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentText}>Current</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.priceContainer}>
                    <Text style={styles.priceValue}>${getPrice(plan)}</Text>
                    <Text style={styles.pricePeriod}>
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </Text>
                  </View>

                  <View style={styles.featuresContainer}>
                    {plan.features.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Check size={16} color={colors.success} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  {isSelected && (
                    <View style={styles.selectedIndicator}>
                      <Check size={20} color={colors.textLight} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Premium Benefits</Text>
            <View style={styles.benefitsGrid}>
              <View style={styles.benefitCard}>
                <Shield size={24} color={colors.success} />
                <Text style={styles.benefitName}>Travel Insurance</Text>
                <Text style={styles.benefitDesc}>Comprehensive coverage</Text>
              </View>
              <View style={styles.benefitCard}>
                <Headphones size={24} color={colors.primary} />
                <Text style={styles.benefitName}>24/7 Support</Text>
                <Text style={styles.benefitDesc}>Priority assistance</Text>
              </View>
              <View style={styles.benefitCard}>
                <Leaf size={24} color={colors.success} />
                <Text style={styles.benefitName}>Carbon Offset</Text>
                <Text style={styles.benefitDesc}>Eco-friendly travel</Text>
              </View>
              <View style={styles.benefitCard}>
                <Sparkles size={24} color={colors.warning} />
                <Text style={styles.benefitName}>Exclusive Deals</Text>
                <Text style={styles.benefitDesc}>Members-only offers</Text>
              </View>
            </View>
          </View>

          <View style={styles.guaranteeSection}>
            <Text style={styles.guaranteeTitle}>30-Day Money Back Guarantee</Text>
            <Text style={styles.guaranteeText}>
              Not satisfied? Get a full refund within 30 days, no questions asked.
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[
              styles.subscribeButton,
              selectedPlan === user.subscriptionTier && styles.subscribeButtonDisabled,
            ]}
            onPress={handleSubscribe}
            disabled={selectedPlan === user.subscriptionTier}
          >
            <Text style={styles.subscribeButtonText}>
              {selectedPlan === user.subscriptionTier
                ? 'Current Plan'
                : selectedPlan === 'free'
                  ? 'Downgrade to Free'
                  : `Upgrade to ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}`}
            </Text>
          </Pressable>
          <Text style={styles.footerNote}>Cancel anytime. Terms and conditions apply.</Text>
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
  heroSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textLight,
    marginTop: 16,
  },
  heroSubtitle: {
    fontSize: 15,
    color: colors.textLight,
    opacity: 0.9,
    marginTop: 8,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
  },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    margin: 20,
    borderRadius: 14,
    padding: 4,
  },
  billingOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  billingOptionActive: {
    backgroundColor: colors.surface,
  },
  billingText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  billingTextActive: {
    color: colors.text,
  },
  saveBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  saveText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textLight,
  },
  plansSection: {
    paddingHorizontal: 20,
    gap: 16,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: colors.primary,
  },
  planCardFeatured: {
    borderColor: '#8B5CF6',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  popularText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  currentBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currentText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  pricePeriod: {
    fontSize: 15,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  featuresContainer: {
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitsSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  benefitCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  benefitName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 10,
  },
  benefitDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  guaranteeSection: {
    margin: 20,
    padding: 20,
    backgroundColor: colors.accent,
    borderRadius: 16,
    alignItems: 'center',
  },
  guaranteeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  guaranteeText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  bottomSpacer: {
    height: 120,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  subscribeButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  subscribeButtonDisabled: {
    backgroundColor: colors.textTertiary,
  },
  subscribeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textLight,
  },
  footerNote: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 12,
  },
});
