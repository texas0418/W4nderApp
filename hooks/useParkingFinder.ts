// ============================================================================
// useParkingFinder Hook
// React hook for managing parking search state and operations
// ============================================================================

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import {
  ParkingLocation,
  ParkingSearchParams,
  ParkingSearchResult,
  ParkingSortOption,
  ParkingType,
  ParkingFeature,
  VehicleType,
} from '../types/parking';
import {
  searchParking,
  getCurrentLocation,
  openParkingDirections,
  openParkingReservation,
  callParking,
  calculateParkingCost,
} from '../utils/parkingUtils';

// ============================================================================
// Hook State Interface
// ============================================================================

interface UseParkingFinderState {
  // Search state
  isSearching: boolean;
  searchResult: ParkingSearchResult | null;
  error: string | null;
  
  // Location state
  userLocation: { lat: number; lng: number } | null;
  isGettingLocation: boolean;
  
  // Selected parking
  selectedParking: ParkingLocation | null;
  
  // Filter state
  filters: ParkingFilters;
  
  // Duration for cost calculation
  parkingDuration: number; // hours
}

interface ParkingFilters {
  types: ParkingType[];
  maxPrice?: number;
  features: ParkingFeature[];
  vehicleType?: VehicleType;
  mustBeOpen: boolean;
  reservableOnly: boolean;
  sortBy: ParkingSortOption;
  radiusMiles: number;
}

interface UseParkingFinderReturn extends UseParkingFinderState {
  // Search actions
  searchNearby: (destination?: { name: string; lat: number; lng: number }) => Promise<void>;
  searchAtLocation: (lat: number, lng: number, destinationName?: string) => Promise<void>;
  refreshSearch: () => Promise<void>;
  
  // Selection actions
  selectParking: (parking: ParkingLocation | null) => void;
  
  // Filter actions
  updateFilters: (filters: Partial<ParkingFilters>) => void;
  resetFilters: () => void;
  toggleType: (type: ParkingType) => void;
  toggleFeature: (feature: ParkingFeature) => void;
  setMaxPrice: (price?: number) => void;
  setSortBy: (sortBy: ParkingSortOption) => void;
  setRadius: (radius: number) => void;
  
  // Duration actions
  setParkingDuration: (hours: number) => void;
  
  // Navigation actions
  navigateToParking: (parking: ParkingLocation) => void;
  reserveParking: (parking: ParkingLocation) => void;
  callParkingLocation: (parking: ParkingLocation) => void;
  
  // Computed values
  filteredResults: ParkingLocation[];
  estimatedCost: (parking: ParkingLocation) => { cost: number; formatted: string };
  
  // Utility
  reset: () => void;
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_FILTERS: ParkingFilters = {
  types: [],
  features: [],
  mustBeOpen: false,
  reservableOnly: false,
  sortBy: 'distance',
  radiusMiles: 1,
};

// ============================================================================
// Hook Implementation
// ============================================================================

export function useParkingFinder(): UseParkingFinderReturn {
  // ─────────────────────────────────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────────────────────────────────
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<ParkingSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [selectedParking, setSelectedParking] = useState<ParkingLocation | null>(null);
  const [filters, setFilters] = useState<ParkingFilters>(DEFAULT_FILTERS);
  const [parkingDuration, setParkingDuration] = useState(2); // Default 2 hours
  
  // Store last search params for refresh
  const [lastSearchParams, setLastSearchParams] = useState<{
    lat: number;
    lng: number;
    name?: string;
  } | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // Location Actions
  // ─────────────────────────────────────────────────────────────────────────
  
  const getUserLocation = useCallback(async (): Promise<{ lat: number; lng: number } | null> => {
    if (userLocation) return userLocation;
    
    setIsGettingLocation(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        setUserLocation(location);
      }
      return location;
    } finally {
      setIsGettingLocation(false);
    }
  }, [userLocation]);

  // ─────────────────────────────────────────────────────────────────────────
  // Search Actions
  // ─────────────────────────────────────────────────────────────────────────
  
  const performSearch = useCallback(async (
    lat: number,
    lng: number,
    destinationName?: string
  ) => {
    setIsSearching(true);
    setError(null);
    
    try {
      const params: ParkingSearchParams = {
        coordinates: { lat, lng },
        destinationName,
        radiusMiles: filters.radiusMiles,
        types: filters.types.length > 0 ? filters.types : undefined,
        maxPrice: filters.maxPrice,
        features: filters.features.length > 0 ? filters.features : undefined,
        vehicleType: filters.vehicleType,
        mustBeOpen: filters.mustBeOpen,
        reservableOnly: filters.reservableOnly,
        sortBy: filters.sortBy,
      };

      const result = await searchParking(params);
      setSearchResult(result);
      setLastSearchParams({ lat, lng, name: destinationName });
      
      if (result.locations.length === 0) {
        setError('No parking found nearby. Try expanding your search radius.');
      }
    } catch (err) {
      console.error('Parking search error:', err);
      setError('Failed to search for parking. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [filters]);

  const searchNearby = useCallback(async (
    destination?: { name: string; lat: number; lng: number }
  ) => {
    if (destination) {
      await performSearch(destination.lat, destination.lng, destination.name);
    } else {
      const location = await getUserLocation();
      if (location) {
        await performSearch(location.lat, location.lng);
      }
    }
  }, [performSearch, getUserLocation]);

  const searchAtLocation = useCallback(async (
    lat: number,
    lng: number,
    destinationName?: string
  ) => {
    await performSearch(lat, lng, destinationName);
  }, [performSearch]);

  const refreshSearch = useCallback(async () => {
    if (lastSearchParams) {
      await performSearch(
        lastSearchParams.lat,
        lastSearchParams.lng,
        lastSearchParams.name
      );
    }
  }, [lastSearchParams, performSearch]);

  // ─────────────────────────────────────────────────────────────────────────
  // Selection Actions
  // ─────────────────────────────────────────────────────────────────────────
  
  const selectParking = useCallback((parking: ParkingLocation | null) => {
    setSelectedParking(parking);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Filter Actions
  // ─────────────────────────────────────────────────────────────────────────
  
  const updateFilters = useCallback((newFilters: Partial<ParkingFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const toggleType = useCallback((type: ParkingType) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type],
    }));
  }, []);

  const toggleFeature = useCallback((feature: ParkingFeature) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature],
    }));
  }, []);

  const setMaxPrice = useCallback((price?: number) => {
    setFilters(prev => ({ ...prev, maxPrice: price }));
  }, []);

  const setSortBy = useCallback((sortBy: ParkingSortOption) => {
    setFilters(prev => ({ ...prev, sortBy }));
  }, []);

  const setRadius = useCallback((radius: number) => {
    setFilters(prev => ({ ...prev, radiusMiles: radius }));
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Navigation Actions
  // ─────────────────────────────────────────────────────────────────────────
  
  const navigateToParking = useCallback((parking: ParkingLocation) => {
    openParkingDirections(parking, userLocation || undefined);
  }, [userLocation]);

  const reserveParking = useCallback((parking: ParkingLocation) => {
    if (!parking.canReserve) {
      Alert.alert(
        'Reservation Not Available',
        'This parking location does not accept online reservations.',
        [{ text: 'OK' }]
      );
      return;
    }
    openParkingReservation(parking);
  }, []);

  const callParkingLocation = useCallback((parking: ParkingLocation) => {
    if (!parking.phone) {
      Alert.alert('No Phone Number', 'Phone number not available for this location.');
      return;
    }
    callParking(parking);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Computed Values
  // ─────────────────────────────────────────────────────────────────────────
  
  const filteredResults = useMemo(() => {
    if (!searchResult) return [];
    return searchResult.locations;
  }, [searchResult]);

  const estimatedCost = useCallback((parking: ParkingLocation) => {
    return calculateParkingCost(parking, parkingDuration);
  }, [parkingDuration]);

  // ─────────────────────────────────────────────────────────────────────────
  // Utility
  // ─────────────────────────────────────────────────────────────────────────
  
  const reset = useCallback(() => {
    setSearchResult(null);
    setSelectedParking(null);
    setError(null);
    setFilters(DEFAULT_FILTERS);
    setLastSearchParams(null);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────────────────────────────────────
  
  // Re-search when filters change (debounced)
  useEffect(() => {
    if (lastSearchParams) {
      const timer = setTimeout(() => {
        refreshSearch();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [filters.sortBy, filters.mustBeOpen, filters.reservableOnly]);

  // ─────────────────────────────────────────────────────────────────────────
  // Return
  // ─────────────────────────────────────────────────────────────────────────
  
  return {
    // State
    isSearching,
    searchResult,
    error,
    userLocation,
    isGettingLocation,
    selectedParking,
    filters,
    parkingDuration,
    
    // Search actions
    searchNearby,
    searchAtLocation,
    refreshSearch,
    
    // Selection actions
    selectParking,
    
    // Filter actions
    updateFilters,
    resetFilters,
    toggleType,
    toggleFeature,
    setMaxPrice,
    setSortBy,
    setRadius,
    
    // Duration actions
    setParkingDuration,
    
    // Navigation actions
    navigateToParking,
    reserveParking,
    callParkingLocation,
    
    // Computed values
    filteredResults,
    estimatedCost,
    
    // Utility
    reset,
  };
}

export default useParkingFinder;
