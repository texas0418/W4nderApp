// Hooks barrel file
export { default as useCancellationManagement } from './useCancellationManagement';
export type {
  CancellationPolicy,
  RefundEstimate,
  ModificationOptions,
  ModificationRequest,
  CancellationResult,
  ModificationResult,
} from './useCancellationManagement';

// Re-export existing hooks
export { useRestaurantAvailability, useReservation, useReservations, useRestaurantBooking } from './useRestaurantBooking';
