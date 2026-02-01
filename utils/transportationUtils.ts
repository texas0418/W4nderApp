import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';
import {
  TransportationMode,
  ItineraryLeg,
  RouteDetails,
  MODE_DURATION_MULTIPLIERS,
} from '@/types/transportation';

export interface Coordinates {
  lat: number;
  lng: number;
}

// Calculate straight-line distance between two points (Haversine formula)
export function calculateDistance(from: Coordinates, to: Coordinates): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Estimate duration based on distance and mode
export function estimateDuration(distanceMiles: number, mode: TransportationMode): number {
  // Base speeds in mph
  const baseSpeeds: Record<TransportationMode, number> = {
    car: 25, // accounting for city traffic
    transit: 15, // including wait times and transfers
    walking: 3,
    rideshare: 22, // similar to car but with pickup time
    bike: 10,
  };

  const baseMinutes = (distanceMiles / baseSpeeds[mode]) * 60;

  // Add fixed overhead times
  const overheadMinutes: Record<TransportationMode, number> = {
    car: 2, // parking
    transit: 8, // wait time + walking to stop
    walking: 0,
    rideshare: 5, // pickup wait
    bike: 1, // unlocking/locking
  };

  return Math.round(baseMinutes + overheadMinutes[mode]);
}

// Create an itinerary leg between two activities
export function createTransportLeg(
  fromActivityId: string,
  toActivityId: string,
  fromCoords: Coordinates | undefined,
  toCoords: Coordinates | undefined,
  mode: TransportationMode = 'car'
): ItineraryLeg {
  let distance = 1; // default 1 mile
  let duration = 10; // default 10 minutes

  if (fromCoords && toCoords) {
    distance = calculateDistance(fromCoords, toCoords);
    duration = estimateDuration(distance, mode);
  }

  return {
    id: `leg-${fromActivityId}-${toActivityId}`,
    fromActivityId,
    toActivityId,
    transportationMode: mode,
    estimatedDuration: duration,
    estimatedDistance: Number(distance.toFixed(2)),
  };
}

// Update leg when mode changes
export function updateLegMode(leg: ItineraryLeg, newMode: TransportationMode): ItineraryLeg {
  const newDuration = estimateDuration(leg.estimatedDistance, newMode);

  return {
    ...leg,
    transportationMode: newMode,
    estimatedDuration: newDuration,
  };
}

// Get Google Maps directions URL
export function getGoogleMapsDirectionsUrl(
  from: Coordinates,
  to: Coordinates,
  mode: TransportationMode
): string {
  const modeMap: Record<TransportationMode, string> = {
    car: 'driving',
    transit: 'transit',
    walking: 'walking',
    rideshare: 'driving',
    bike: 'bicycling',
  };

  return `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&travelmode=${modeMap[mode]}`;
}

// Get Apple Maps directions URL
export function getAppleMapsDirectionsUrl(
  from: Coordinates,
  to: Coordinates,
  mode: TransportationMode
): string {
  const modeMap: Record<TransportationMode, string> = {
    car: 'd',
    transit: 'r',
    walking: 'w',
    rideshare: 'd',
    bike: 'w', // Apple Maps doesn't have cycling, defaults to walking
  };

  return `https://maps.apple.com/?saddr=${from.lat},${from.lng}&daddr=${to.lat},${to.lng}&dirflg=${modeMap[mode]}`;
}

// Open directions in maps app
export async function openDirections(
  from: Coordinates,
  to: Coordinates,
  mode: TransportationMode,
  preferAppleMaps: boolean = Platform.OS === 'ios'
): Promise<void> {
  const url = preferAppleMaps
    ? getAppleMapsDirectionsUrl(from, to, mode)
    : getGoogleMapsDirectionsUrl(from, to, mode);

  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  } else {
    // Fallback to Google Maps web
    await Linking.openURL(getGoogleMapsDirectionsUrl(from, to, mode));
  }
}

// Suggest optimal transportation mode based on distance
export function suggestTransportMode(distanceMiles: number): TransportationMode {
  if (distanceMiles < 0.3) return 'walking';
  if (distanceMiles < 1.5) return 'bike';
  if (distanceMiles < 5) return 'car';
  return 'rideshare'; // For longer distances, rideshare to avoid parking
}

// Check if schedule is feasible
export interface ScheduleCheck {
  isFeasible: boolean;
  bufferMinutes: number;
  warning?: string;
}

export function checkScheduleFeasibility(
  endTime: string, // HH:mm
  startTime: string, // HH:mm
  travelDuration: number // minutes
): ScheduleCheck {
  const [endHours, endMins] = endTime.split(':').map(Number);
  const [startHours, startMins] = startTime.split(':').map(Number);

  const endMinutesTotal = endHours * 60 + endMins;
  const startMinutesTotal = startHours * 60 + startMins;
  const availableMinutes = startMinutesTotal - endMinutesTotal;

  const bufferMinutes = availableMinutes - travelDuration;

  if (bufferMinutes < 0) {
    return {
      isFeasible: false,
      bufferMinutes,
      warning: `Need ${Math.abs(bufferMinutes)} more minutes. Adjust activity times or choose faster transport.`,
    };
  }

  if (bufferMinutes < 5) {
    return {
      isFeasible: true,
      bufferMinutes,
      warning: 'Very tight schedule. Consider adding buffer time.',
    };
  }

  if (bufferMinutes < 15) {
    return {
      isFeasible: true,
      bufferMinutes,
      warning: 'Limited buffer time between activities.',
    };
  }

  return {
    isFeasible: true,
    bufferMinutes,
  };
}

// Get user's current location
export async function getCurrentLocation(): Promise<Coordinates | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location access is needed for navigation.');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
}
