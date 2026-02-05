import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '@/constants/colors';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
  light?: boolean;
}

export default function ScreenHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightAction,
  transparent = false,
  light = false,
}: ScreenHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const textColor = light ? colors.textLight : colors.text;
  const subtitleColor = light ? 'rgba(255,255,255,0.7)' : colors.textSecondary;
  const iconColor = light ? colors.textLight : colors.text;
  const bgColor = transparent ? 'transparent' : colors.surface;
  const borderColor = transparent ? 'transparent' : colors.borderLight;

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.safeArea,
        { backgroundColor: bgColor, borderBottomColor: borderColor },
        !transparent && styles.bordered,
      ]}
    >
      <View style={styles.container}>
        {showBack ? (
          <Pressable style={styles.backButton} onPress={handleBack} hitSlop={12}>
            <ChevronLeft size={24} color={iconColor} />
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}

        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: subtitleColor }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {rightAction ? (
          <View style={styles.rightAction}>{rightAction}</View>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {},
  bordered: {
    borderBottomWidth: 1,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 52,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  placeholder: {
    width: 40,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rightAction: {
    width: 40,
    alignItems: 'flex-end',
  },
});
