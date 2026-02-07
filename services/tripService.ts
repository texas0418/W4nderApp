// services/tripService.ts
// Replaces: mocks/trips.ts

import { supabase } from '@/lib/supabase';
import { Trip, DayItinerary, Activity, Destination } from '@/types';

// Transform database destination to app format
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

// Transform itinerary item to Activity format
const transformItineraryItem = (item: any): Activity => ({
  id: item.id,
  name: item.name,
  description: item.description || '',
  image: '', // Could add image_url to itinerary_items table
  duration: '', // Could calculate from start_time/end_time
  price: parseFloat(item.price) || 0,
  currency: item.currency || 'USD',
  category: item.type,
  rating: 0,
  time: item.start_time || '',
  location: item.location || '',
  isBooked: !!item.booking_id,
});

// Transform database trip to app format
const transformTrip = (row: any, destination?: any, itinerary?: DayItinerary[]): Trip => ({
  id: row.id,
  destination: destination ? transformDestination(destination) : null,
  startDate: row.start_date,
  endDate: row.end_date,
  status: row.status,
  totalBudget: parseFloat(row.budget_total) || 0,
  spentBudget: parseFloat(row.budget_spent) || 0,
  currency: row.currency || 'USD',
  travelers: 1, // Could add travelers column to trips table
  itinerary: itinerary || [],
  coverImage: row.cover_image_url || '',
});

// Get all trips for the current user
export const getTrips = async (): Promise<Trip[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('trips')
    .select(`
      *,
      destination:destinations(*)
    `)
    .eq('user_id', user.id)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching trips:', error);
    return [];
  }

  return data.map(row => transformTrip(row, row.destination));
};

// Get a single trip with full itinerary
export const getTripById = async (tripId: string): Promise<Trip | null> => {
  const { data: tripData, error: tripError } = await supabase
    .from('trips')
    .select(`
      *,
      destination:destinations(*)
    `)
    .eq('id', tripId)
    .single();

  if (tripError) {
    console.error('Error fetching trip:', tripError);
    return null;
  }

  // Fetch itinerary days with items
  const { data: daysData, error: daysError } = await supabase
    .from('itinerary_days')
    .select(`
      *,
      items:itinerary_items(*)
    `)
    .eq('trip_id', tripId)
    .order('day_number', { ascending: true });

  if (daysError) {
    console.error('Error fetching itinerary:', daysError);
  }

  // Transform itinerary days
  const itinerary: DayItinerary[] = (daysData || []).map(day => ({
    day: day.day_number,
    date: day.date,
    title: day.title || `Day ${day.day_number}`,
    activities: (day.items || [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map(transformItineraryItem),
  }));

  return transformTrip(tripData, tripData.destination, itinerary);
};

// Get trips by status
export const getTripsByStatus = async (status: 'planning' | 'booked' | 'in_progress' | 'completed' | 'cancelled'): Promise<Trip[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('trips')
    .select(`
      *,
      destination:destinations(*)
    `)
    .eq('user_id', user.id)
    .eq('status', status)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching trips by status:', error);
    return [];
  }

  return data.map(row => transformTrip(row, row.destination));
};

// Convenience functions for common status filters
export const getUpcomingTrips = () => getTripsByStatus('booked');
export const getPlanningTrips = () => getTripsByStatus('planning');
export const getCompletedTrips = () => getTripsByStatus('completed');

// Create a new trip
export const createTrip = async (tripData: {
  name: string;
  destinationId?: string;
  startDate: string;
  endDate: string;
  budget?: number;
  currency?: string;
}): Promise<Trip | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('trips')
    .insert({
      user_id: user.id,
      name: tripData.name,
      destination_id: tripData.destinationId,
      start_date: tripData.startDate,
      end_date: tripData.endDate,
      budget_total: tripData.budget || 0,
      currency: tripData.currency || 'USD',
      status: 'planning',
    })
    .select(`
      *,
      destination:destinations(*)
    `)
    .single();

  if (error) {
    console.error('Error creating trip:', error);
    return null;
  }

  // Auto-create itinerary days based on date range
  const start = new Date(tripData.startDate);
  const end = new Date(tripData.endDate);
  const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const daysToInsert = Array.from({ length: dayCount }, (_, i) => {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    return {
      trip_id: data.id,
      day_number: i + 1,
      date: date.toISOString().split('T')[0],
      title: `Day ${i + 1}`,
    };
  });

  await supabase.from('itinerary_days').insert(daysToInsert);

  return transformTrip(data, data.destination);
};

// Update a trip
export const updateTrip = async (tripId: string, updates: {
  name?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  status?: string;
  coverImage?: string;
}): Promise<Trip | null> => {
  const updateData: any = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.startDate) updateData.start_date = updates.startDate;
  if (updates.endDate) updateData.end_date = updates.endDate;
  if (updates.budget !== undefined) updateData.budget_total = updates.budget;
  if (updates.status) updateData.status = updates.status;
  if (updates.coverImage) updateData.cover_image_url = updates.coverImage;

  const { data, error } = await supabase
    .from('trips')
    .update(updateData)
    .eq('id', tripId)
    .select(`
      *,
      destination:destinations(*)
    `)
    .single();

  if (error) {
    console.error('Error updating trip:', error);
    return null;
  }

  return transformTrip(data, data.destination);
};

// Delete a trip
export const deleteTrip = async (tripId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId);

  if (error) {
    console.error('Error deleting trip:', error);
    return false;
  }

  return true;
};

// Add an activity to a day
export const addItineraryItem = async (dayId: string, item: {
  type: string;
  name: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  price?: number;
  currency?: string;
}): Promise<boolean> => {
  // Get current max sort order for the day
  const { data: existingItems } = await supabase
    .from('itinerary_items')
    .select('sort_order')
    .eq('itinerary_day_id', dayId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextSortOrder = (existingItems?.[0]?.sort_order || 0) + 1;

  const { error } = await supabase
    .from('itinerary_items')
    .insert({
      itinerary_day_id: dayId,
      type: item.type,
      name: item.name,
      description: item.description,
      start_time: item.startTime,
      end_time: item.endTime,
      location: item.location,
      price: item.price || 0,
      currency: item.currency || 'USD',
      sort_order: nextSortOrder,
    });

  if (error) {
    console.error('Error adding itinerary item:', error);
    return false;
  }

  return true;
};

// Update itinerary item
export const updateItineraryItem = async (itemId: string, updates: {
  name?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  price?: number;
}): Promise<boolean> => {
  const updateData: any = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.description) updateData.description = updates.description;
  if (updates.startTime) updateData.start_time = updates.startTime;
  if (updates.endTime) updateData.end_time = updates.endTime;
  if (updates.location) updateData.location = updates.location;
  if (updates.price !== undefined) updateData.price = updates.price;

  const { error } = await supabase
    .from('itinerary_items')
    .update(updateData)
    .eq('id', itemId);

  if (error) {
    console.error('Error updating itinerary item:', error);
    return false;
  }

  return true;
};

// Delete itinerary item
export const deleteItineraryItem = async (itemId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('itinerary_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    console.error('Error deleting itinerary item:', error);
    return false;
  }

  return true;
};

// Reorder itinerary items
export const reorderItineraryItems = async (dayId: string, itemIds: string[]): Promise<boolean> => {
  const updates = itemIds.map((id, index) => ({
    id,
    sort_order: index,
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from('itinerary_items')
      .update({ sort_order: update.sort_order })
      .eq('id', update.id);

    if (error) {
      console.error('Error reordering items:', error);
      return false;
    }
  }

  return true;
};
