import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { MapPin } from 'lucide-react-native';
import colors from '@/constants/colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <MapPin size={48} color={colors.primary} />
        </View>
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.description}>Looks like you have wandered off the map!</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go back home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  link: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
  },
});
