/**
 * Travel Time Estimation Utility
 * Auto-calculates transit time between activities based on coordinates
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface TravelTimeEstimate {
  driving: { duration: string; minutes: number };
  walking: { duration: string; minutes: number };
  transit: { duration: string; minutes: number };
  distance: { miles: number; text: string };
  recommended: 'driving' | 'walking' | 'transit';
}

// Average speeds (mph)
const SPEEDS = {
  driving: 25, // City driving
  walking: 3.1, // Average walk
  transit: 15, // With stops/transfers
};

/**
 * Calculate distance between two points (Haversine formula)
 */
export const calculateDistance = (from: Coordinates, to: Coordinates): number => {
  const R = 3959; // Earth radius in miles
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const toRad = (deg: number) => deg * (Math.PI / 180);

/**
 * Format distance for display
 */
export const formatDistance = (miles: number): string => {
  if (miles < 0.1) return `${Math.round(miles * 5280)} ft`;
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
};

/**
 * Format duration for display
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins ? `${hrs}h ${mins}m` : `${hrs}h`;
};

/**
 * Calculate travel time between two locations
 */
export const calculateTravelTime = (from: Coordinates, to: Coordinates): TravelTimeEstimate => {
  const miles = calculateDistance(from, to);

  const drivingMins = (miles / SPEEDS.driving) * 60;
  const walkingMins = (miles / SPEEDS.walking) * 60;
  const transitMins = (miles / SPEEDS.transit) * 60;

  // Determine recommended mode
  let recommended: 'driving' | 'walking' | 'transit' = 'driving';
  if (miles < 0.3) recommended = 'walking';
  else if (miles < 0.75 && walkingMins < 15) recommended = 'walking';

  return {
    driving: { duration: formatDuration(drivingMins), minutes: Math.round(drivingMins) },
    walking: { duration: formatDuration(walkingMins), minutes: Math.round(walkingMins) },
    transit: { duration: formatDuration(transitMins), minutes: Math.round(transitMins) },
    distance: { miles, text: formatDistance(miles) },
    recommended,
  };
};

/**
 * Travel segment between two activities
 */
export interface TravelSegment {
  fromId: string;
  toId: string;
  fromName: string;
  toName: string;
  estimate: TravelTimeEstimate | null;
}

/**
 * Calculate travel times for entire itinerary
 */
export const calculateItineraryTravel = (
  activities: Array<{
    id: string;
    name: string;
    location: { coordinates?: Coordinates };
  }>
): { segments: TravelSegment[]; totalMinutes: number; totalText: string } => {
  const segments: TravelSegment[] = [];
  let totalMinutes = 0;

  for (let i = 0; i < activities.length - 1; i++) {
    const from = activities[i];
    const to = activities[i + 1];

    let estimate: TravelTimeEstimate | null = null;

    if (from.location.coordinates && to.location.coordinates) {
      estimate = calculateTravelTime(from.location.coordinates, to.location.coordinates);
      totalMinutes += estimate[estimate.recommended].minutes;
    }

    segments.push({
      fromId: from.id,
      toId: to.id,
      fromName: from.name,
      toName: to.name,
      estimate,
    });
  }

  return {
    segments,
    totalMinutes,
    totalText: formatDuration(totalMinutes),
  };
};

/**
 * Get departure time suggestion
 */
export const suggestDepartureTime = (
  arrivalTime: string,
  travelMinutes: number,
  bufferMinutes = 10
): string => {
  const [time, period] = arrivalTime.split(' ');
  const [h, m] = time.split(':').map(Number);

  let hour24 = h;
  if (period === 'PM' && h !== 12) hour24 += 12;
  if (period === 'AM' && h === 12) hour24 = 0;

  const totalMins = hour24 * 60 + m - travelMinutes - bufferMinutes;
  const adjustedMins = totalMins < 0 ? totalMins + 1440 : totalMins;

  const depHour = Math.floor(adjustedMins / 60) % 24;
  const depMin = adjustedMins % 60;
  const depPeriod = depHour >= 12 ? 'PM' : 'AM';
  const displayHour = depHour === 0 ? 12 : depHour > 12 ? depHour - 12 : depHour;

  return `${displayHour}:${depMin.toString().padStart(2, '0')} ${depPeriod}`;
};
