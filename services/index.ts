// services/index.ts
// Central export for all Supabase services
// Usage: import { getDestinations, getTrips, signInWithEmail } from '@/services';

// Auth services
export {
  signUpWithEmail,
  signInWithEmail,
  signInWithApple,
  isAppleSignInAvailable,
  getCurrentUser,
  getSession,
  signOut,
  resetPassword,
  updatePassword,
  updateProfile,
  getProfile,
  onAuthStateChange,
} from './authService';
export type { AuthUser, AuthResult } from './authService';

// Destination services
export {
  getDestinations,
  getDestinationById,
  getTrendingDestinations,
  getRecommendedDestinations,
  searchDestinations,
  getDestinationsByTag,
  getDestinationsByCountry,
} from './destinationService';

// Restaurant services
export {
  getRestaurants,
  getRestaurantById,
  getRestaurantsByCity,
  getRestaurantsByCuisine,
  getRestaurantsByPriceRange,
  searchRestaurants,
  getMichelinRestaurants,
  getRestaurantsByDietaryOption,
  cuisineCategories,
  timeSlots,
  occasions,
} from './restaurantService';

// Trip services
export {
  getTrips,
  getTripById,
  getTripsByStatus,
  getUpcomingTrips,
  getPlanningTrips,
  getCompletedTrips,
  createTrip,
  updateTrip,
  deleteTrip,
  addItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
  reorderItineraryItems,
} from './tripService';

// Activity/Experience services
export {
  getActivities,
  getActivityById,
  getActivitiesByDestination,
  getActivitiesByCity,
  getActivitiesByCategory,
  searchActivities,
  getFeaturedActivities,
  getActivitiesByPriceRange,
  getInstantBookActivities,
  getActivitiesByLanguage,
  experienceCategories,
} from './activityService';

// Booking services
export {
  getBookings,
  getUpcomingBookings,
  getTripBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  confirmBooking,
  cancelBooking,
} from './bookingService';
export type { Booking } from './bookingService';
