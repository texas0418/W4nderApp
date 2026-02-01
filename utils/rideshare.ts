import { Linking, Platform } from 'react-native';

export type RideshareProvider = 'uber' | 'lyft';

interface Location {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

interface RideshareRequest {
  pickup?: Location;
  dropoff: Location;
  provider: RideshareProvider;
}

// Check if rideshare app is installed
export const isAppInstalled = async (provider: RideshareProvider): Promise<boolean> => {
  const schemes: Record<RideshareProvider, string> = {
    uber: 'uber://',
    lyft: 'lyft://',
  };
  
  try {
    return await Linking.canOpenURL(schemes[provider]);
  } catch {
    return false;
  }
};

// Generate Uber deep link
const getUberDeepLink = (request: RideshareRequest): string => {
  const { pickup, dropoff } = request;
  
  let url = 'uber://?action=setPickup';
  
  if (pickup?.latitude && pickup?.longitude) {
    url += `&pickup[latitude]=${pickup.latitude}`;
    url += `&pickup[longitude]=${pickup.longitude}`;
    if (pickup.name) {
      url += `&pickup[nickname]=${encodeURIComponent(pickup.name)}`;
    }
  } else {
    url += '&pickup=my_location';
  }
  
  url += `&dropoff[latitude]=${dropoff.latitude}`;
  url += `&dropoff[longitude]=${dropoff.longitude}`;
  if (dropoff.name) {
    url += `&dropoff[nickname]=${encodeURIComponent(dropoff.name)}`;
  }
  if (dropoff.address) {
    url += `&dropoff[formatted_address]=${encodeURIComponent(dropoff.address)}`;
  }
  
  return url;
};

// Generate Uber web fallback
const getUberWebLink = (request: RideshareRequest): string => {
  const { pickup, dropoff } = request;
  
  let url = 'https://m.uber.com/ul/?action=setPickup';
  
  if (pickup?.latitude && pickup?.longitude) {
    url += `&pickup[latitude]=${pickup.latitude}`;
    url += `&pickup[longitude]=${pickup.longitude}`;
  } else {
    url += '&pickup=my_location';
  }
  
  url += `&dropoff[latitude]=${dropoff.latitude}`;
  url += `&dropoff[longitude]=${dropoff.longitude}`;
  if (dropoff.name) {
    url += `&dropoff[nickname]=${encodeURIComponent(dropoff.name)}`;
  }
  
  return url;
};

// Generate Lyft deep link
const getLyftDeepLink = (request: RideshareRequest): string => {
  const { pickup, dropoff } = request;
  
  let url = 'lyft://ridetype?id=lyft';
  
  if (pickup?.latitude && pickup?.longitude) {
    url += `&pickup[latitude]=${pickup.latitude}`;
    url += `&pickup[longitude]=${pickup.longitude}`;
  }
  
  url += `&destination[latitude]=${dropoff.latitude}`;
  url += `&destination[longitude]=${dropoff.longitude}`;
  
  return url;
};

// Generate Lyft web fallback
const getLyftWebLink = (request: RideshareRequest): string => {
  const { pickup, dropoff } = request;
  
  let url = 'https://www.lyft.com/ride?';
  
  if (pickup?.latitude && pickup?.longitude) {
    url += `start_lat=${pickup.latitude}&start_lng=${pickup.longitude}&`;
  }
  
  url += `end_lat=${dropoff.latitude}&end_lng=${dropoff.longitude}`;
  
  return url;
};

// Main function to open rideshare app
export const openRideshareApp = async (request: RideshareRequest): Promise<boolean> => {
  const { provider } = request;
  
  try {
    const isInstalled = await isAppInstalled(provider);
    
    let url: string;
    
    if (isInstalled) {
      url = provider === 'uber' 
        ? getUberDeepLink(request)
        : getLyftDeepLink(request);
    } else {
      url = provider === 'uber'
        ? getUberWebLink(request)
        : getLyftWebLink(request);
    }
    
    const canOpen = await Linking.canOpenURL(url);
    
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    } else {
      // Fallback to app store
      const storeUrl = provider === 'uber'
        ? Platform.select({
            ios: 'https://apps.apple.com/app/uber/id368677368',
            android: 'https://play.google.com/store/apps/details?id=com.ubercab',
            default: 'https://www.uber.com',
          })
        : Platform.select({
            ios: 'https://apps.apple.com/app/lyft/id529379082',
            android: 'https://play.google.com/store/apps/details?id=me.lyft.android',
            default: 'https://www.lyft.com',
          });
      
      await Linking.openURL(storeUrl!);
      return true;
    }
  } catch (error) {
    console.error('Error opening rideshare app:', error);
    return false;
  }
};

// Format location for rideshare request
export const formatLocationForRideshare = (
  locationName: string,
  locationAddress: string,
  coordinates?: { lat: number; lng: number }
): Location => {
  return {
    latitude: coordinates?.lat || 33.7490,
    longitude: coordinates?.lng || -84.3880,
    name: locationName,
    address: locationAddress,
  };
};

// Provider display info
export const RIDESHARE_PROVIDERS: Record<RideshareProvider, {
  name: string;
  color: string;
  icon: string;
}> = {
  uber: {
    name: 'Uber',
    color: '#000000',
    icon: '🚗',
  },
  lyft: {
    name: 'Lyft',
    color: '#FF00BF',
    icon: '🚙',
  },
};
