import React, { useState, useRef, ComponentType } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Heart,
  Users,
  UsersRound,
  Wallet,
  CreditCard,
  Gem,
  Crown,
  Mountain,
  Umbrella,
  Landmark,
  UtensilsCrossed,
  Music,
  Sparkles,
  Flame,
  Camera,
  ShoppingBag,
  TreePine,
  Building,
  ChevronRight,
  Check,
} from 'lucide-react-native';
import type { LucideProps } from 'lucide-react-native';
import colors from '@/constants/colors';
import { travelStyles, budgetRanges, travelPreferences, foodPreferences } from '@/mocks/preferences';
import { useApp } from '@/contexts/AppContext';
import { OnboardingData } from '@/types';

const { width, height } = Dimensions.get('window');

const iconMap: Record<string, ComponentType<LucideProps>> = {
  User,
  Heart,
  Users,
  UsersRound,
  Wallet,
  CreditCard,
  Gem,
  Crown,
  Mountain,
  Umbrella,
  Landmark,
  UtensilsCrossed,
  Music,
  Sparkles,
  Flame,
  Camera,
  ShoppingBag,
  TreePine,
  Building,
};

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    travelStyle: null,
    budgetRange: null,
    preferences: [],
    foodPreferences: [],
  });
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateTransition = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(callback, 150);
  };

  const handleNext = () => {
    if (step < 4) {
      animateTransition(() => setStep(step + 1));
    } else {
      completeOnboarding(data);
      router.replace('/');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      animateTransition(() => setStep(step - 1));
    }
  };

  const selectTravelStyle = (id: string) => {
    setData({ ...data, travelStyle: id });
  };

  const selectBudget = (id: string) => {
    setData({ ...data, budgetRange: id });
  };

  const togglePreference = (id: string) => {
    const prefs = data.preferences.includes(id)
      ? data.preferences.filter(p => p !== id)
      : [...data.preferences, id];
    setData({ ...data, preferences: prefs });
  };

  const toggleFoodPreference = (id: string) => {
    const prefs = data.foodPreferences.includes(id)
      ? data.foodPreferences.filter(p => p !== id)
      : [...data.foodPreferences, id];
    setData({ ...data, foodPreferences: prefs });
  };

  const canProceed = () => {
    switch (step) {
      case 0: return true;
      case 1: return data.travelStyle !== null;
      case 2: return data.budgetRange !== null;
      case 3: return data.preferences.length >= 3;
      case 4: return data.foodPreferences.length >= 2;
      default: return false;
    }
  };

  const renderWelcome = () => (
    <View style={styles.welcomeContainer}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800' }}
        style={styles.welcomeImage}
        contentFit="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)', colors.primaryDark]}
        style={styles.welcomeGradient}
      />
      <View style={styles.welcomeContent}>
        <Text style={styles.welcomeTitle}>Wanderlust</Text>
        <Text style={styles.welcomeSubtitle}>
          Your personal AI travel companion. Let us create unforgettable journeys together.
        </Text>
        <View style={styles.welcomeFeatures}>
          <View style={styles.featureItem}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>Personalized itineraries</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>Smart booking integration</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>Real-time travel assistant</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderTravelStyle = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>How do you usually travel?</Text>
      <Text style={styles.stepSubtitle}>
        This helps us tailor recommendations to your travel style
      </Text>
      <View style={styles.optionsGrid}>
        {travelStyles.map(style => {
          const IconComponent = iconMap[style.icon];
          const isSelected = data.travelStyle === style.id;
          return (
            <Pressable
              key={style.id}
              style={[styles.styleCard, isSelected && styles.styleCardSelected]}
              onPress={() => selectTravelStyle(style.id)}
            >
              <View style={[styles.styleIconContainer, isSelected && styles.styleIconSelected]}>
                {IconComponent && (
                  <IconComponent
                    size={28}
                    color={isSelected ? colors.textLight : colors.primary}
                  />
                )}
              </View>
              <Text style={[styles.styleName, isSelected && styles.styleNameSelected]}>
                {style.name}
              </Text>
              <Text style={styles.styleDesc}>{style.description}</Text>
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Check size={14} color={colors.textLight} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const renderBudget = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What is your budget range?</Text>
      <Text style={styles.stepSubtitle}>
        Average daily spending per person (accommodations, food, activities)
      </Text>
      <View style={styles.budgetList}>
        {budgetRanges.map(budget => {
          const IconComponent = iconMap[budget.icon];
          const isSelected = data.budgetRange === budget.id;
          return (
            <Pressable
              key={budget.id}
              style={[styles.budgetCard, isSelected && styles.budgetCardSelected]}
              onPress={() => selectBudget(budget.id)}
            >
              <View style={[styles.budgetIcon, isSelected && styles.budgetIconSelected]}>
                {IconComponent && (
                  <IconComponent
                    size={24}
                    color={isSelected ? colors.textLight : colors.primary}
                  />
                )}
              </View>
              <View style={styles.budgetInfo}>
                <Text style={[styles.budgetLabel, isSelected && styles.budgetLabelSelected]}>
                  {budget.label}
                </Text>
                <Text style={styles.budgetRange}>
                  {budget.max ? `$${budget.min} - $${budget.max}` : `$${budget.min}+`} / day
                </Text>
              </View>
              {isSelected && (
                <View style={styles.checkCircle}>
                  <Check size={16} color={colors.textLight} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const renderPreferences = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What do you love to do?</Text>
      <Text style={styles.stepSubtitle}>
        Select at least 3 interests to personalize your experience
      </Text>
      <ScrollView 
        style={styles.preferencesScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.preferencesContent}
      >
        <View style={styles.preferencesGrid}>
          {travelPreferences.map(pref => {
            const IconComponent = iconMap[pref.icon];
            const isSelected = data.preferences.includes(pref.id);
            return (
              <Pressable
                key={pref.id}
                style={[styles.prefChip, isSelected && styles.prefChipSelected]}
                onPress={() => togglePreference(pref.id)}
              >
                {IconComponent && (
                  <IconComponent
                    size={18}
                    color={isSelected ? colors.textLight : colors.primary}
                  />
                )}
                <Text style={[styles.prefText, isSelected && styles.prefTextSelected]}>
                  {pref.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <Text style={styles.selectedCount}>
        {data.preferences.length} selected {data.preferences.length < 3 && '(minimum 3)'}
      </Text>
    </View>
  );

  const renderFoodPreferences = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What cuisines do you love?</Text>
      <Text style={styles.stepSubtitle}>
        Select at least 2 food preferences to get personalized dining recommendations
      </Text>
      <ScrollView 
        style={styles.preferencesScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.preferencesContent}
      >
        <View style={styles.foodGrid}>
          {foodPreferences.map(food => {
            const isSelected = data.foodPreferences.includes(food.id);
            return (
              <Pressable
                key={food.id}
                style={[styles.foodChip, isSelected && styles.foodChipSelected]}
                onPress={() => toggleFoodPreference(food.id)}
              >
                <Text style={styles.foodEmoji}>{food.emoji}</Text>
                <Text style={[styles.foodText, isSelected && styles.foodTextSelected]}>
                  {food.name}
                </Text>
                {isSelected && (
                  <View style={styles.foodCheck}>
                    <Check size={12} color={colors.textLight} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <Text style={styles.selectedCount}>
        {data.foodPreferences.length} selected {data.foodPreferences.length < 2 && '(minimum 2)'}
      </Text>
    </View>
  );

  const steps = [renderWelcome, renderTravelStyle, renderBudget, renderPreferences, renderFoodPreferences];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background, colors.surfaceSecondary]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          {step > 0 && (
            <Pressable onPress={handleBack} style={styles.backButton}>
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          )}
          {step > 0 && (
            <View style={styles.progressContainer}>
              {[1, 2, 3, 4].map(i => (
                <View
                  key={i}
                  style={[
                    styles.progressDot,
                    i <= step && styles.progressDotActive,
                  ]}
                />
              ))}
            </View>
          )}
          {step > 0 && <View style={styles.backButton} />}
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {steps[step]()}
        </Animated.View>

        <View style={styles.footer}>
          <Pressable
            style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!canProceed()}
          >
            <Text style={styles.nextButtonText}>
              {step === 0 ? 'Let\'s Begin' : step === 4 ? 'Start Exploring' : 'Continue'}
            </Text>
            <ChevronRight size={20} color={colors.textLight} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 60,
  },
  backText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  content: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: colors.textTertiary,
  },
  nextButtonText: {
    color: colors.textLight,
    fontSize: 17,
    fontWeight: '600',
  },
  welcomeContainer: {
    flex: 1,
    position: 'relative',
  },
  welcomeImage: {
    width: width,
    height: height * 0.55,
    position: 'absolute',
    top: -100,
  },
  welcomeGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
  },
  welcomeContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  welcomeTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.textLight,
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: colors.accent,
    lineHeight: 26,
    marginBottom: 32,
  },
  welcomeFeatures: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  featureText: {
    fontSize: 16,
    color: colors.textLight,
    opacity: 0.9,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
    lineHeight: 22,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  styleCard: {
    width: (width - 52) / 2,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
  },
  styleCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },
  styleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  styleIconSelected: {
    backgroundColor: colors.primary,
  },
  styleName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  styleNameSelected: {
    color: colors.primaryDark,
  },
  styleDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetList: {
    gap: 12,
  },
  budgetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  budgetCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },
  budgetIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetIconSelected: {
    backgroundColor: colors.primary,
  },
  budgetInfo: {
    flex: 1,
    marginLeft: 16,
  },
  budgetLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  budgetLabelSelected: {
    color: colors.primaryDark,
  },
  budgetRange: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preferencesScroll: {
    flex: 1,
  },
  preferencesContent: {
    paddingBottom: 20,
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  prefChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.border,
  },
  prefChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  prefText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  prefTextSelected: {
    color: colors.textLight,
  },
  selectedCount: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 16,
  },
  foodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  foodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
  },
  foodChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  foodEmoji: {
    fontSize: 20,
  },
  foodText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  foodTextSelected: {
    color: colors.textLight,
  },
  foodCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});
