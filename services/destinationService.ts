// services/destinationService.ts
// Replaces: mocks/destinations.ts
// This service fetches real data from Supabase instead of mock data

import { supabase } from '@/lib/supabase';
import { Destination } from '@/types';

// Transform database row to app's Destination type
const transformDestination = (row: any): Destination => ({
  id: row.id,
  name: row.name,
  country: row.country,
  description: row.description || '',
  image: row.image_url || '',
  rating: parseFloat(row.rating) || 0,
  reviewCount: row.review_count || 0,
  tags: row.tags || [],
  avgPrice: parseFloat(row.avg_price) || 0,
  currency: row.currency || 'USD',
  bestSeason: row.best_season || '',
  coordinates: {
    lat: parseFloat(row.latitude) || 0,
    lng: parseFloat(row.longitude) || 0,
  },
});

// Get all destinations
export const getDestinations = async (): Promise<Destination[]> => {
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .order('rating', { ascending: false });

  if (error) {
    console.error('Error fetching destinations:', error);
    return [];
  }

  return data.map(transformDestination);
};

// Get a single destination by ID
export const getDestinationById = async (id: string): Promise<Destination | null> => {
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching destination:', error);
    return null;
  }

  return transformDestination(data);
};

// Get trending destinations (top by rating)
export const getTrendingDestinations = async (limit: number = 4): Promise<Destination[]> => {
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .order('rating', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching trending destinations:', error);
    return [];
  }

  return data.map(transformDestination);
};

// Get recommended destinations (next 4 by review count)
export const getRecommendedDestinations = async (): Promise<Destination[]> => {
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .order('review_count', { ascending: false })
    .limit(4)
    .range(4, 7); // Skip first 4, get next 4

  if (error) {
    console.error('Error fetching recommended destinations:', error);
    return [];
  }

  return data.map(transformDestination);
};

// Search destinations by name or country
export const searchDestinations = async (query: string): Promise<Destination[]> => {
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .or(`name.ilike.%${query}%,country.ilike.%${query}%`)
    .order('rating', { ascending: false });

  if (error) {
    console.error('Error searching destinations:', error);
    return [];
  }

  return data.map(transformDestination);
};

// Filter destinations by tag
export const getDestinationsByTag = async (tag: string): Promise<Destination[]> => {
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .contains('tags', [tag])
    .order('rating', { ascending: false });

  if (error) {
    console.error('Error fetching destinations by tag:', error);
    return [];
  }

  return data.map(transformDestination);
};

// Filter destinations by country
export const getDestinationsByCountry = async (country: string): Promise<Destination[]> => {
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .eq('country', country)
    .order('rating', { ascending: false });

  if (error) {
    console.error('Error fetching destinations by country:', error);
    return [];
  }

  return data.map(transformDestination);
};
