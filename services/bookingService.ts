// services/bookingService.ts
import { supabase } from '@/lib/supabase';

export interface Booking {
  id: string;
  tripId: string;
  type: 'flight' | 'hotel' | 'car' | 'activity' | 'restaurant' | 'other';
  name: string;
  confirmationNumber?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  price: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

// Transform database booking to app format
const transformBooking = (row: any): Booking => ({
  id: row.id,
  tripId: row.trip_id,
  type: row.type,
  name: row.name,
  confirmationNumber: row.confirmation_number,
  startDate: row.start_date,
  endDate: row.end_date,
  location: row.location,
  price: parseFloat(row.price) || 0,
  currency: row.currency || 'USD',
  status: row.status,
  notes: row.notes,
  createdAt: row.created_at,
});

// Get all bookings for the current user
export const getBookings = async (): Promise<Booking[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      trip:trips!inner(user_id)
    `)
    .eq('trip.user_id', user.id)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }

  return data.map(transformBooking);
};

// Get upcoming bookings (future dates, confirmed status)
export const getUpcomingBookings = async (): Promise<Booking[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      trip:trips!inner(user_id)
    `)
    .eq('trip.user_id', user.id)
    .gte('start_date', today)
    .in('status', ['confirmed', 'pending'])
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching upcoming bookings:', error);
    return [];
  }

  return data.map(transformBooking);
};

// Get bookings for a specific trip
export const getTripBookings = async (tripId: string): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('trip_id', tripId)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching trip bookings:', error);
    return [];
  }

  return data.map(transformBooking);
};

// Get a single booking
export const getBookingById = async (bookingId: string): Promise<Booking | null> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (error) {
    console.error('Error fetching booking:', error);
    return null;
  }

  return transformBooking(data);
};

// Create a new booking
export const createBooking = async (bookingData: {
  tripId: string;
  type: Booking['type'];
  name: string;
  confirmationNumber?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  price?: number;
  currency?: string;
  notes?: string;
}): Promise<Booking | null> => {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      trip_id: bookingData.tripId,
      type: bookingData.type,
      name: bookingData.name,
      confirmation_number: bookingData.confirmationNumber,
      start_date: bookingData.startDate,
      end_date: bookingData.endDate,
      location: bookingData.location,
      price: bookingData.price || 0,
      currency: bookingData.currency || 'USD',
      status: 'pending',
      notes: bookingData.notes,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating booking:', error);
    return null;
  }

  return transformBooking(data);
};

// Update a booking
export const updateBooking = async (bookingId: string, updates: {
  name?: string;
  confirmationNumber?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  price?: number;
  status?: Booking['status'];
  notes?: string;
}): Promise<Booking | null> => {
  const updateData: any = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.confirmationNumber) updateData.confirmation_number = updates.confirmationNumber;
  if (updates.startDate) updateData.start_date = updates.startDate;
  if (updates.endDate) updateData.end_date = updates.endDate;
  if (updates.location) updateData.location = updates.location;
  if (updates.price !== undefined) updateData.price = updates.price;
  if (updates.status) updateData.status = updates.status;
  if (updates.notes !== undefined) updateData.notes = updates.notes;

  const { data, error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', bookingId)
    .select()
    .single();

  if (error) {
    console.error('Error updating booking:', error);
    return null;
  }

  return transformBooking(data);
};

// Delete a booking
export const deleteBooking = async (bookingId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId);

  if (error) {
    console.error('Error deleting booking:', error);
    return false;
  }

  return true;
};

// Confirm a booking
export const confirmBooking = async (bookingId: string): Promise<Booking | null> => {
  return updateBooking(bookingId, { status: 'confirmed' });
};

// Cancel a booking
export const cancelBooking = async (bookingId: string): Promise<Booking | null> => {
  return updateBooking(bookingId, { status: 'cancelled' });
};
