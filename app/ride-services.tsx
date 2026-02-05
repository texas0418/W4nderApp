import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Car,
  Clock,
  DollarSign,
  ChevronRight,
  Star,
  Zap,
  Users,
  Shield,
} from 'lucide-react-native';
import colors from '@/constants/colors';

interface RideOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  estimatedTime: string;
  priceRange: string;
  capacity: string;
}

interface RideService {
  id: 'uber' | 'lyft';
  name: string;
  logo: string;
  color: string;
  tagline: string;
  rating: number;
  options: RideOption[];
  deepLinkScheme: string;
  webUrl: string;
  appStoreUrl: string;
  playStoreUrl: string;
}

const rideServices: RideService[] = [
  {
    id: 'uber',
    name: 'Uber',
    logo: 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=200&h=200&fit=crop',
    color: '#000000',
    tagline: 'Request a ride in minutes',
    rating: 4.8,
    deepLinkScheme: 'uber://',
    webUrl: 'https://m.uber.com/ul/',
    appStoreUrl: 'https://apps.apple.com/app/uber/id368677368',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.ubercab',
    options: [
      {
        id: 'uberx',
        name: 'UberX',
        description: 'Affordable, everyday rides',
        icon: <Car size={24} color={colors.text} />,
        estimatedTime: '3-5 min',
        priceRange: '$12-18',
        capacity: '1-4',
      },
      {
        id: 'comfort',
        name: 'Comfort',
        description: 'Newer cars with extra legroom',
        icon: <Star size={24} color={colors.warning} />,
        estimatedTime: '5-8 min',
        priceRange: '$18-25',
        capacity: '1-4',
      },
      {
        id: 'uberxl',
        name: 'UberXL',
        description: 'Affordable rides for groups up to 6',
        icon: <Users size={24} color={colors.primary} />,
        estimatedTime: '6-10 min',
        priceRange: '$22-32',
        capacity: '1-6',
      },
      {
        id: 'black',
        name: 'Black',
        description: 'Premium rides in luxury cars',
        icon: <Shield size={24} color={colors.text} />,
        estimatedTime: '8-12 min',
        priceRange: '$35-50',
        capacity: '1-4',
      },
    ],
  },
  {
    id: 'lyft',
    name: 'Lyft',
    logo: 'https://images.unsplash.com/photo-1549925862-990918a10ed4?w=200&h=200&fit=crop',
    color: '#FF00BF',
    tagline: 'A friendly ride in minutes',
    rating: 4.7,
    deepLinkScheme: 'lyft://',
    webUrl: 'https://www.lyft.com/ride',
    appStoreUrl: 'https://apps.apple.com/app/lyft/id529379082',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=me.lyft.android',
    options: [
      {
        id: 'lyft',
        name: 'Lyft',
        description: 'Affordable rides for 1-4 people',
        icon: <Car size={24} color="#FF00BF" />,
        estimatedTime: '3-6 min',
        priceRange: '$11-17',
        capacity: '1-4',
      },
      {
        id: 'lyft_xl',
        name: 'Lyft XL',
        description: 'Rides for groups up to 6',
        icon: <Users size={24} color="#FF00BF" />,
        estimatedTime: '5-9 min',
        priceRange: '$20-30',
        capacity: '1-6',
      },
      {
        id: 'lyft_lux',
        name: 'Lux',
        description: 'High-end rides with top-rated drivers',
        icon: <Star size={24} color="#FF00BF" />,
        estimatedTime: '8-12 min',
        priceRange: '$32-48',
        capacity: '1-4',
      },
      {
        id: 'priority',
        name: 'Priority Pickup',
        description: 'Skip the wait with faster pickup',
        icon: <Zap size={24} color="#FF00BF" />,
        estimatedTime: '1-3 min',
        priceRange: '$15-22',
        capacity: '1-4',
      },
    ],
  },
];

const recentLocations = [
  { id: '1', name: 'San Francisco Airport (SFO)', address: 'San Francisco, CA 94128' },
  { id: '2', name: 'Union Square', address: '333 Post St, San Francisco, CA' },
  { id: '3', name: 'Fishermans Wharf', address: 'Beach St & The Embarcadero, SF' },
];

export default function RideServicesScreen() {
  const router = useRouter();
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedService, setSelectedService] = useState<RideService | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openRideApp = useCallback(
    async (service: RideService, rideType?: string) => {
      setIsLoading(true);

      try {
        let deepLink = '';
        let webFallback = '';

        if (service.id === 'uber') {
          deepLink = `uber://?action=setPickup&pickup=my_location`;
          if (destination) {
            deepLink += `&dropoff[formatted_address]=${encodeURIComponent(destination)}`;
          }
          webFallback = `https://m.uber.com/ul/?action=setPickup&pickup=my_location${destination ? `&dropoff[formatted_address]=${encodeURIComponent(destination)}` : ''}`;
        } else if (service.id === 'lyft') {
          deepLink = `lyft://ridetype?id=${rideType || 'lyft'}`;
          if (destination) {
            deepLink += `&destination[address]=${encodeURIComponent(destination)}`;
          }
          webFallback = `https://www.lyft.com/ride?id=${rideType || 'lyft'}${destination ? `&destination=${encodeURIComponent(destination)}` : ''}`;
        }

        if (Platform.OS === 'web') {
          await Linking.openURL(webFallback);
        } else {
          const canOpen = await Linking.canOpenURL(service.deepLinkScheme);

          if (canOpen) {
            await Linking.openURL(deepLink);
          } else {
            Alert.alert(
              `${service.name} Not Installed`,
              `Would you like to install ${service.name}?`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Install',
                  onPress: () => {
                    const storeUrl =
                      Platform.OS === 'ios' ? service.appStoreUrl : service.playStoreUrl;
                    Linking.openURL(storeUrl);
                  },
                },
                {
                  text: 'Open Web',
                  onPress: () => Linking.openURL(webFallback),
                },
              ]
            );
          }
        }
      } catch (error) {
        console.log('Error opening ride app:', error);
        Alert.alert('Error', 'Failed to open the ride service. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [destination]
  );

  const handleSelectService = (service: RideService) => {
    setSelectedService(selectedService?.id === service.id ? null : service);
  };

  const handleQuickBook = (service: RideService) => {
    openRideApp(service);
  };

  const handleSelectRideOption = (service: RideService, option: RideOption) => {
    openRideApp(service, option.id);
  };

  const handleRecentLocation = (
    location: (typeof recentLocations)[0],
    type: 'pickup' | 'destination'
  ) => {
    if (type === 'pickup') {
      setPickup(location.name);
    } else {
      setDestination(location.name);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ride Services</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.locationCard}>
            <View style={styles.locationInputContainer}>
              <View style={styles.locationIconContainer}>
                <View style={styles.pickupDot} />
                <View style={styles.locationLine} />
                <Navigation size={16} color={colors.primary} />
              </View>
              <View style={styles.locationInputs}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.locationInput}
                    placeholder="Current location"
                    placeholderTextColor={colors.textTertiary}
                    value={pickup}
                    onChangeText={setPickup}
                  />
                </View>
                <View style={styles.inputDivider} />
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.locationInput}
                    placeholder="Where to?"
                    placeholderTextColor={colors.textTertiary}
                    value={destination}
                    onChangeText={setDestination}
                  />
                </View>
              </View>
            </View>
          </View>

          {!pickup && !destination && (
            <View style={styles.recentSection}>
              <Text style={styles.sectionTitle}>Recent Locations</Text>
              {recentLocations.map((location) => (
                <TouchableOpacity
                  key={location.id}
                  style={styles.recentItem}
                  onPress={() => handleRecentLocation(location, 'destination')}
                >
                  <View style={styles.recentIcon}>
                    <Clock size={18} color={colors.textSecondary} />
                  </View>
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentName}>{location.name}</Text>
                    <Text style={styles.recentAddress}>{location.address}</Text>
                  </View>
                  <ChevronRight size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.servicesSection}>
            <Text style={styles.sectionTitle}>Choose Your Ride</Text>

            {rideServices.map((service) => (
              <View key={service.id} style={styles.serviceCard}>
                <TouchableOpacity
                  style={styles.serviceHeader}
                  onPress={() => handleSelectService(service)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.serviceLogo, { backgroundColor: service.color + '15' }]}>
                    <Text style={[styles.serviceLogoText, { color: service.color }]}>
                      {service.name[0]}
                    </Text>
                  </View>
                  <View style={styles.serviceInfo}>
                    <View style={styles.serviceNameRow}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <View style={styles.serviceRating}>
                        <Star size={14} color={colors.warning} fill={colors.warning} />
                        <Text style={styles.ratingText}>{service.rating}</Text>
                      </View>
                    </View>
                    <Text style={styles.serviceTagline}>{service.tagline}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.quickBookButton, { backgroundColor: service.color }]}
                    onPress={() => handleQuickBook(service)}
                  >
                    <Text style={styles.quickBookText}>Open</Text>
                  </TouchableOpacity>
                </TouchableOpacity>

                {selectedService?.id === service.id && (
                  <View style={styles.rideOptions}>
                    {service.options.map((option) => (
                      <TouchableOpacity
                        key={option.id}
                        style={styles.rideOption}
                        onPress={() => handleSelectRideOption(service, option)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.rideOptionIcon}>{option.icon}</View>
                        <View style={styles.rideOptionInfo}>
                          <Text style={styles.rideOptionName}>{option.name}</Text>
                          <Text style={styles.rideOptionDesc}>{option.description}</Text>
                          <View style={styles.rideOptionMeta}>
                            <View style={styles.metaItem}>
                              <Clock size={12} color={colors.textSecondary} />
                              <Text style={styles.metaText}>{option.estimatedTime}</Text>
                            </View>
                            <View style={styles.metaItem}>
                              <Users size={12} color={colors.textSecondary} />
                              <Text style={styles.metaText}>{option.capacity}</Text>
                            </View>
                          </View>
                        </View>
                        <View style={styles.rideOptionPrice}>
                          <Text style={styles.priceText}>{option.priceRange}</Text>
                          <ChevronRight size={18} color={colors.textTertiary} />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>

          <View style={styles.tipsSection}>
            <Text style={styles.sectionTitle}>Travel Tips</Text>
            <View style={styles.tipCard}>
              <View style={styles.tipIcon}>
                <DollarSign size={20} color={colors.success} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Compare Prices</Text>
                <Text style={styles.tipText}>
                  Prices vary between services. Check both apps to find the best deal for your ride.
                </Text>
              </View>
            </View>
            <View style={styles.tipCard}>
              <View style={styles.tipIcon}>
                <MapPin size={20} color={colors.primary} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Confirm Pickup Location</Text>
                <Text style={styles.tipText}>
                  Make sure your GPS is enabled for accurate pickup. Verify the pin location before
                  confirming.
                </Text>
              </View>
            </View>
            <View style={styles.tipCard}>
              <View style={styles.tipIcon}>
                <Shield size={20} color={colors.warning} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Stay Safe</Text>
                <Text style={styles.tipText}>
                  Always verify the driver name, photo, and license plate before getting in the car.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  locationCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  locationInputContainer: {
    flexDirection: 'row',
  },
  locationIconContainer: {
    alignItems: 'center',
    marginRight: 12,
    paddingVertical: 4,
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
  },
  locationLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 4,
  },
  locationInputs: {
    flex: 1,
  },
  inputWrapper: {
    height: 44,
    justifyContent: 'center',
  },
  locationInput: {
    fontSize: 16,
    color: colors.text,
    paddingVertical: 8,
  },
  inputDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 4,
  },
  recentSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
  },
  recentAddress: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  servicesSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  serviceCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  serviceLogo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  serviceLogoText: {
    fontSize: 28,
    fontWeight: '800' as const,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginRight: 8,
  },
  serviceRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.text,
    marginLeft: 3,
  },
  serviceTagline: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  quickBookButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  quickBookText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.textLight,
  },
  rideOptions: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 8,
    paddingBottom: 8,
  },
  rideOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rideOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rideOptionInfo: {
    flex: 1,
  },
  rideOptionName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
  },
  rideOptionDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  rideOptionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  rideOptionPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginRight: 4,
  },
  tipsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
