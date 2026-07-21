import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Gift, Clock, MapPin, Sparkles } from 'lucide-react-native';
import { ThemeColors } from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { SharedPlanCard, getSharedPlan } from '@/services/planShareService';

function formatDay(iso: string | null): string {
  if (!iso) return 'Soon';
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function ReceiveDateScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useLocalSearchParams<{ t: string }>();
  const [card, setCard] = useState<SharedPlanCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!t) {
      setLoading(false);
      return;
    }
    getSharedPlan(t)
      .then(setCard)
      .catch((e) => console.error('Failed to load shared date:', e))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={colors.gradient.primary} style={styles.headerGradient}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={24} color={colors.textLight} />
            </Pressable>
            <Text style={styles.headerTitle}>You have a date</Text>
            <View style={styles.backBtn} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !card ? (
        <View style={styles.center}>
          <Gift size={40} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>This link has expired</Text>
          <Text style={styles.emptyText}>Ask them to share the date with you again.</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.giftBadge}>
              <Gift size={26} color={colors.secondary} />
            </View>
            <Text style={styles.plannerLine}>{card.plannerName} planned you a date.</Text>
            <Text style={styles.dayLine}>{formatDay(card.planDate)}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Clock size={15} color={colors.primaryLight} />
                <Text style={styles.metaText}>
                  Be ready at {card.startTime ? card.startTime.slice(0, 5) : 'evening'}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <MapPin size={15} color={colors.primaryLight} />
                <Text style={styles.metaText}>
                  {card.stopCount} {card.stopCount === 1 ? 'stop' : 'stops'}
                </Text>
              </View>
            </View>
            <Text style={styles.teaser}>
              Everything is planned and booked. That&apos;s all you get to know.
            </Text>
          </View>

          <Pressable style={styles.ctaBtn} onPress={() => router.push('/plan-date' as never)}>
            <Sparkles size={17} color={colors.textLight} />
            <Text style={styles.ctaText}>Plan one back</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerGradient: {
      paddingBottom: 16,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    backBtn: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textLight,
      flex: 1,
      textAlign: 'center',
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginTop: 14,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 6,
    },
    content: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 28,
      alignItems: 'center',
    },
    giftBadge: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
    },
    plannerLine: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    dayLine: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginTop: 8,
    },
    metaRow: {
      flexDirection: 'row',
      gap: 18,
      marginTop: 16,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    metaText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primaryLight,
    },
    teaser: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 19,
      marginTop: 18,
    },
    ctaBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 16,
      marginTop: 20,
    },
    ctaText: {
      color: colors.textLight,
      fontSize: 16,
      fontWeight: '700',
    },
  });
