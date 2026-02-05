import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Settings,
  ChevronRight,
  MapPin,
  Plane,
  Globe,
  Heart,
  CreditCard,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Crown,
  Gift,
  AlertTriangle,
  Leaf,
  Users,
  Accessibility,
  WifiOff,
  Target,
  Award,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { travelStyles, budgetRanges } from '@/mocks/preferences';

const menuItems = [
  { id: 'bucket-list', icon: Target, label: 'Bucket List', color: '#EC4899', route: '/bucket-list' },
  { id: 'loyalty', icon: Award, label: 'Loyalty Programs', color: '#0EA5E9', route: '/loyalty-programs' },
  { id: 'preferences', icon: Heart, label: 'Travel Preferences', color: colors.secondary, route: null },
  { id: 'rewards', icon: Gift, label: 'Rewards & Points', color: colors.warning, route: '/rewards' },
  { id: 'subscription', icon: Crown, label: 'Subscription', color: '#8B5CF6', route: '/subscription' },
  { id: 'offline', icon: WifiOff, label: 'Offline Mode', color: '#06B6D4', route: '/offline-mode' },
  { id: 'emergency', icon: AlertTriangle, label: 'Emergency Support', color: colors.error, route: '/emergency' },
  { id: 'payment', icon: CreditCard, label: 'Payment Methods', color: colors.primaryLight, route: null },
  { id: 'notifications', icon: Bell, label: 'Notifications', color: colors.warning, route: null },
  { id: 'privacy', icon: Shield, label: 'Privacy & Security', color: colors.success, route: null },
  { id: 'help', icon: HelpCircle, label: 'Help & Support', color: colors.accentDark, route: null },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, resetOnboarding, toggleCarbonOffset, bucketListCount } = useApp();

  const travelStyle = travelStyles.find(s => s.id === user.travelStyle);
  const budget = budgetRanges.find(b => b.id === user.budgetRange);

  const getTierBadge = () => {
    switch (user.subscriptionTier) {
      case 'premium':
        return { label: 'Premium', color: '#8B5CF6' };
      case 'standard':
        return { label: 'Standard', color: colors.primary };
      case 'family':
        return { label: 'Family', color: colors.secondary };
      default:
        return null;
    }
  };

  const tierBadge = getTierBadge();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable style={styles.settingsButton}>
              <Settings size={22} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: user.avatar }}
                style={styles.avatar}
                contentFit="cover"
              />
              <View style={styles.editBadge}>
                <Text style={styles.editBadgeText}>Edit</Text>
              </View>
            </View>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user.name}</Text>
              {tierBadge && (
                <View style={[styles.tierBadge, { backgroundColor: tierBadge.color }]}>
                  <Crown size={12} color={colors.textLight} />
                  <Text style={styles.tierText}>{tierBadge.label}</Text>
                </View>
              )}
            </View>
            <Text style={styles.userEmail}>{user.email}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Plane size={18} color={colors.primary} />
                </View>
                <Text style={styles.statValue}>{user.tripsCompleted}</Text>
                <Text style={styles.statLabel}>Trips</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Globe size={18} color={colors.primary} />
                </View>
                <Text style={styles.statValue}>{user.countriesVisited}</Text>
                <Text style={styles.statLabel}>Countries</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Gift size={18} color={colors.warning} />
                </View>
                <Text style={styles.statValue}>{user.rewardPoints.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
            </View>
          </View>

          <View style={styles.quickActions}>
            <Pressable 
              style={styles.quickAction}
              onPress={() => router.push('/group-trip')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: `${colors.primary}15` }]}>
                <Users size={20} color={colors.primary} />
              </View>
              <Text style={styles.quickActionText}>Group Trip</Text>
            </Pressable>
            <Pressable 
              style={styles.quickAction}
              onPress={() => router.push('/date-plan')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: `${colors.secondary}15` }]}>
                <Heart size={20} color={colors.secondary} />
              </View>
              <Text style={styles.quickActionText}>Date Plan</Text>
            </Pressable>
            <Pressable 
              style={styles.quickAction}
              onPress={() => router.push('/bucket-list')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#EC489915' }]}>
                <Target size={20} color="#EC4899" />
              </View>
              <Text style={styles.quickActionText}>Bucket List</Text>
              {bucketListCount > 0 && (
                <View style={styles.quickActionBadge}>
                  <Text style={styles.quickActionBadgeText}>{bucketListCount}</Text>
                </View>
              )}
            </Pressable>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Your Profile</Text>
            <View style={styles.infoCard}>
              {travelStyle && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Travel Style</Text>
                  <Text style={styles.infoValue}>{travelStyle.name}</Text>
                </View>
              )}
              {budget && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Budget Range</Text>
                  <Text style={styles.infoValue}>{budget.label}</Text>
                </View>
              )}
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>Interests</Text>
                <Text style={styles.infoValue}>
                  {user.preferences.length > 0
                    ? `${user.preferences.length} selected`
                    : 'None'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.sustainabilitySection}>
            <View style={styles.sustainabilityCard}>
              <View style={styles.sustainabilityHeader}>
                <View style={[styles.quickActionIcon, { backgroundColor: `${colors.success}15` }]}>
                  <Leaf size={20} color={colors.success} />
                </View>
                <View style={styles.sustainabilityInfo}>
                  <Text style={styles.sustainabilityTitle}>Carbon Offset</Text>
                  <Text style={styles.sustainabilityDesc}>
                    Automatically offset your travel carbon footprint
                  </Text>
                </View>
              </View>
              <Switch
                value={user.carbonOffsetEnabled}
                onValueChange={toggleCarbonOffset}
                trackColor={{ false: colors.border, true: colors.success }}
                thumbColor={colors.textLight}
              />
            </View>
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={styles.menuCard}>
              {menuItems.map((item) => (
                <Pressable 
                  key={item.id} 
                  style={styles.menuItem}
                  onPress={() => item.route && router.push(item.route as any)}
                >
                  <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                    <item.icon size={20} color={item.color} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <ChevronRight size={18} color={colors.textTertiary} />
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable style={styles.logoutButton} onPress={resetOnboarding}>
            <LogOut size={20} color={colors.error} />
            <Text style={styles.logoutText}>Reset Onboarding</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>W4nder v1.0.0</Text>
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: colors.surface,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textLight,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textLight,
  },
  userEmail: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.border,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  quickActionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EC4899',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  quickActionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  sustainabilitySection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sustainabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  sustainabilityHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sustainabilityInfo: {
    flex: 1,
  },
  sustainabilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  sustainabilityDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    marginLeft: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 14,
    backgroundColor: `${colors.error}10`,
    borderRadius: 14,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
});
