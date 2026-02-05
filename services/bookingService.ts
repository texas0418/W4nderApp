// Auto-Booking Service for W4nder

import { Alert } from 'react-native';
import {
  BookingRequest,
  BookingResult,
  BookingSession,
  BookingStatus,
  BookingCategory,
  BookingProvider,
  PaymentStatus,
  PROVIDER_CONFIGS,
} from '@/types/booking';

// ============================================================================
// Booking Service Class
// ============================================================================

class BookingService {
  private currentSession: BookingSession | null = null;
  private listeners: Map<string, (session: BookingSession) => void> = new Map();

  // Subscribe to session updates
  subscribe(id: string, callback: (session: BookingSession) => void) {
    this.listeners.set(id, callback);
    return () => this.listeners.delete(id);
  }

  private notifyListeners() {
    if (this.currentSession) {
      this.listeners.forEach((callback) => callback(this.currentSession!));
    }
  }

  // Get current session
  getSession(): BookingSession | null {
    return this.currentSession;
  }

  // Create a new booking session
  createSession(
    itineraryId: string,
    itineraryName: string,
    requests: BookingRequest[],
    userId: string,
    paymentMethodId?: string
  ): BookingSession {
    const session: BookingSession = {
      id: `session-${Date.now()}`,
      itineraryId,
      itineraryName,
      status: 'preparing',
      startedAt: new Date().toISOString(),
      requests: requests.sort((a, b) => a.priority - b.priority),
      results: new Map(),
      progress: {
        total: requests.length,
        completed: 0,
        failed: 0,
        pending: requests.length,
        requiresAction: 0,
      },
      paymentSummary: {
        estimatedTotal: requests.reduce((sum, r) => sum + r.estimatedCost, 0),
        actualTotal: 0,
        currency: 'USD',
        itemizedCosts: [],
      },
      userId,
      paymentMethodId,
    };

    this.currentSession = session;
    this.notifyListeners();
    return session;
  }

  // Start processing all bookings
  async processAllBookings(): Promise<BookingSession> {
    if (!this.currentSession) {
      throw new Error('No active booking session');
    }

    this.currentSession.status = 'in_progress';
    this.notifyListeners();

    // Process each request in priority order
    for (const request of this.currentSession.requests) {
      await this.processBooking(request);

      // Small delay between bookings to avoid rate limiting
      await this.delay(500);
    }

    // Finalize session
    this.finalizeSession();
    return this.currentSession;
  }

  // Process a single booking
  private async processBooking(request: BookingRequest): Promise<BookingResult> {
    if (!this.currentSession) {
      throw new Error('No active booking session');
    }

    // Create initial result
    const result: BookingResult = {
      id: `result-${request.id}`,
      requestId: request.id,
      status: 'processing',
      provider: request.provider,
      bookedDetails: {
        date: request.details.date,
        time: request.details.time,
        venueName: request.details.venueName,
        venueAddress: request.details.venueAddress,
        partySize: request.details.partySize,
      },
      paymentStatus: 'pending',
      currency: request.currency,
      createdAt: new Date().toISOString(),
    };

    this.currentSession.results.set(request.id, result);
    this.notifyListeners();

    try {
      // Simulate API call to provider
      const bookingResult = await this.callProviderAPI(request);

      // Update result with response
      Object.assign(result, bookingResult);

      // Update progress
      this.updateProgress(result);
    } catch (error: any) {
      result.status = 'failed';
      result.error = {
        code: 'BOOKING_FAILED',
        message: error.message || 'Failed to complete booking',
        recoverable: true,
        suggestedAction: 'Try again or book manually',
      };

      // Try fallback providers
      if (request.fallbackProviders && request.fallbackProviders.length > 0) {
        const fallbackResult = await this.tryFallbackProviders(request, result);
        if (fallbackResult) {
          Object.assign(result, fallbackResult);
        }
      }

      this.updateProgress(result);
    }

    this.currentSession.results.set(request.id, result);
    this.notifyListeners();

    return result;
  }

  // Simulate provider API call (replace with actual integrations)
  private async callProviderAPI(request: BookingRequest): Promise<Partial<BookingResult>> {
    // Simulate network delay
    await this.delay(1500 + Math.random() * 1500);

    const provider = PROVIDER_CONFIGS[request.provider];

    // Simulate different success rates by category
    const successRate = this.getSuccessRate(request.category);
    const isSuccess = Math.random() < successRate;

    if (!isSuccess) {
      throw new Error('Booking not available at requested time');
    }

    // Generate confirmation
    const confirmationNumber = this.generateConfirmationNumber(request.provider);

    // Calculate final cost (may vary from estimate)
    const costVariation = 0.9 + Math.random() * 0.2; // -10% to +10%
    const finalCost = Math.round(request.estimatedCost * costVariation * 100) / 100;

    const result: Partial<BookingResult> = {
      status: 'confirmed',
      confirmationNumber,
      confirmationUrl: `https://${request.provider}.com/confirmation/${confirmationNumber}`,
      paymentStatus: request.estimatedCost > 0 ? 'captured' : 'not_required',
      finalCost,
      confirmedAt: new Date().toISOString(),
    };

    // Add tickets for events
    if (['concert', 'theater', 'movie', 'sports_event'].includes(request.category)) {
      result.tickets = this.generateTickets(request.details.partySize);
    }

    // Add voucher for activities
    if (['activity', 'tour', 'spa'].includes(request.category)) {
      result.voucher = {
        code: this.generateVoucherCode(),
        validFrom: request.details.date,
        validUntil: request.details.date,
        instructions: 'Show this voucher at check-in',
      };
    }

    return result;
  }

  // Try fallback providers if primary fails
  private async tryFallbackProviders(
    request: BookingRequest,
    originalResult: BookingResult
  ): Promise<Partial<BookingResult> | null> {
    if (!request.fallbackProviders) return null;

    for (const fallbackProvider of request.fallbackProviders) {
      try {
        const fallbackRequest = { ...request, provider: fallbackProvider };
        const result = await this.callProviderAPI(fallbackRequest);
        result.provider = fallbackProvider;
        result.warnings = [
          `Booked via ${PROVIDER_CONFIGS[fallbackProvider].displayName} (fallback)`,
        ];
        return result;
      } catch {
        continue;
      }
    }

    return null;
  }

  // Update session progress
  private updateProgress(result: BookingResult) {
    if (!this.currentSession) return;

    const progress = this.currentSession.progress;
    progress.pending = Math.max(0, progress.pending - 1);

    switch (result.status) {
      case 'confirmed':
        progress.completed++;
        if (result.finalCost) {
          this.currentSession.paymentSummary.actualTotal += result.finalCost;
          this.currentSession.paymentSummary.itemizedCosts.push({
            name:
              this.currentSession.requests.find((r) => r.id === result.requestId)?.activityName ||
              'Unknown',
            cost: result.finalCost,
          });
        }
        break;
      case 'failed':
        progress.failed++;
        break;
      case 'requires_action':
      case 'payment_required':
        progress.requiresAction++;
        break;
    }
  }

  // Finalize the session
  private finalizeSession() {
    if (!this.currentSession) return;

    const { progress } = this.currentSession;

    if (progress.failed === 0 && progress.requiresAction === 0) {
      this.currentSession.status = 'completed';
    } else if (progress.completed === 0) {
      this.currentSession.status = 'failed';
    } else {
      this.currentSession.status = 'partial';
    }

    this.currentSession.completedAt = new Date().toISOString();
    this.notifyListeners();
  }

  // Retry a failed booking
  async retryBooking(requestId: string): Promise<BookingResult> {
    if (!this.currentSession) {
      throw new Error('No active booking session');
    }

    const request = this.currentSession.requests.find((r) => r.id === requestId);
    if (!request) {
      throw new Error('Booking request not found');
    }

    // Reset progress
    this.currentSession.progress.failed--;
    this.currentSession.progress.pending++;
    this.currentSession.status = 'in_progress';

    const result = await this.processBooking(request);
    this.finalizeSession();

    return result;
  }

  // Cancel the entire session
  async cancelSession(): Promise<void> {
    if (!this.currentSession) return;

    // Cancel any confirmed bookings
    for (const [requestId, result] of this.currentSession.results) {
      if (result.status === 'confirmed') {
        await this.cancelBooking(requestId);
      }
    }

    this.currentSession.status = 'cancelled';
    this.currentSession.completedAt = new Date().toISOString();
    this.notifyListeners();
  }

  // Cancel a single booking
  async cancelBooking(requestId: string): Promise<BookingResult | null> {
    if (!this.currentSession) return null;

    const result = this.currentSession.results.get(requestId);
    if (!result || result.status !== 'confirmed') return null;

    // Simulate cancellation API call
    await this.delay(1000);

    result.status = 'cancelled';
    result.paymentStatus = 'refunded';

    // Update progress
    this.currentSession.progress.completed--;
    this.currentSession.paymentSummary.actualTotal -= result.finalCost || 0;

    this.notifyListeners();
    return result;
  }

  // Helper methods
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getSuccessRate(category: BookingCategory): number {
    const rates: Record<BookingCategory, number> = {
      restaurant: 0.9,
      concert: 0.75,
      theater: 0.85,
      movie: 0.95,
      flight: 0.85,
      hotel: 0.9,
      car_rental: 0.95,
      activity: 0.9,
      spa: 0.9,
      tour: 0.85,
      sports_event: 0.7,
      transportation: 0.95,
      other: 0.8,
    };
    return rates[category] || 0.8;
  }

  private generateConfirmationNumber(provider: BookingProvider): string {
    const prefix = provider.slice(0, 2).toUpperCase();
    const number = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `${prefix}${number}`;
  }

  private generateVoucherCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  private generateTickets(count: number): { id: string; type: string; seat?: string }[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `ticket-${Date.now()}-${i}`,
      type: 'General Admission',
      seat: `Section ${Math.floor(Math.random() * 10) + 1}, Row ${String.fromCharCode(65 + Math.floor(Math.random() * 10))}, Seat ${Math.floor(Math.random() * 20) + 1}`,
    }));
  }
}

// Export singleton instance
export const bookingService = new BookingService();

// ============================================================================
// Helper Functions
// ============================================================================

// Create booking requests from itinerary activities
export function createBookingRequestsFromItinerary(
  activities: any[],
  preferences: any
): BookingRequest[] {
  return activities
    .filter((activity) => activity.reservationRequired || activity.ticketRequired)
    .map((activity, index) => {
      const category = detectBookingCategory(activity);
      const provider = detectBestProvider(category, activity);

      return {
        id: `request-${activity.id}`,
        activityId: activity.id,
        activityName: activity.name,
        category,
        provider,
        priority: index + 1,
        details: {
          date: activity.date || new Date().toISOString().split('T')[0],
          time: activity.startTime,
          duration: calculateDuration(activity.startTime, activity.endTime),
          venueName: activity.location?.name || activity.name,
          venueAddress: activity.location?.address || '',
          venueId: activity.location?.venueId,
          partySize: preferences.partySize || 2,
          specialRequests: activity.notes,
        },
        estimatedCost: estimateCost(activity, category),
        currency: 'USD',
        preferences: {
          autoConfirm: true,
          maxBudgetOverage: 20,
          notifyOnWaitlist: true,
          allowPartialBooking: false,
          requireRefundable: false,
        },
        fallbackProviders: getFallbackProviders(provider, category),
        allowWaitlist: true,
        allowAlternativeTimes: true,
        alternativeTimeWindow: 60,
      };
    });
}

function detectBookingCategory(activity: any): BookingCategory {
  const type = (activity.type || '').toLowerCase();
  const name = (activity.name || '').toLowerCase();

  if (
    type.includes('dining') ||
    type.includes('restaurant') ||
    name.includes('dinner') ||
    name.includes('lunch')
  ) {
    return 'restaurant';
  }
  if (type.includes('concert') || name.includes('concert') || name.includes('show')) {
    return 'concert';
  }
  if (type.includes('theater') || type.includes('theatre') || name.includes('broadway')) {
    return 'theater';
  }
  if (type.includes('movie') || name.includes('movie') || name.includes('cinema')) {
    return 'movie';
  }
  if (type.includes('flight') || name.includes('flight')) {
    return 'flight';
  }
  if (type.includes('hotel') || name.includes('hotel') || name.includes('stay')) {
    return 'hotel';
  }
  if (type.includes('spa') || name.includes('spa') || name.includes('massage')) {
    return 'spa';
  }
  if (type.includes('tour') || name.includes('tour')) {
    return 'tour';
  }
  if (type.includes('sport') || name.includes('game') || name.includes('match')) {
    return 'sports_event';
  }

  return 'activity';
}

function detectBestProvider(category: BookingCategory, activity: any): BookingProvider {
  const providerMap: Record<BookingCategory, BookingProvider> = {
    restaurant: 'opentable',
    concert: 'ticketmaster',
    theater: 'ticketmaster',
    movie: 'fandango',
    flight: 'skyscanner',
    hotel: 'booking_com',
    car_rental: 'enterprise',
    activity: 'viator',
    spa: 'direct',
    tour: 'viator',
    sports_event: 'ticketmaster',
    transportation: 'uber',
    other: 'direct',
  };

  return providerMap[category] || 'direct';
}

function getFallbackProviders(
  primary: BookingProvider,
  category: BookingCategory
): BookingProvider[] {
  const fallbacks: Record<BookingCategory, BookingProvider[]> = {
    restaurant: ['resy', 'yelp', 'direct'],
    concert: ['stubhub', 'axs', 'eventbrite'],
    theater: ['stubhub', 'direct'],
    movie: ['direct'],
    flight: ['google_flights', 'kayak'],
    hotel: ['expedia', 'hotels_com', 'airbnb'],
    car_rental: ['hertz', 'kayak'],
    activity: ['getyourguide', 'airbnb_experiences'],
    spa: ['phone', 'email'],
    tour: ['getyourguide', 'airbnb_experiences'],
    sports_event: ['stubhub', 'axs'],
    transportation: ['lyft'],
    other: ['phone', 'email'],
  };

  return (fallbacks[category] || []).filter((p) => p !== primary);
}

function calculateDuration(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 120; // default 2 hours

  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let duration = endHour * 60 + endMin - (startHour * 60 + startMin);
  if (duration < 0) duration += 24 * 60; // handle overnight

  return duration;
}

function estimateCost(activity: any, category: BookingCategory): number {
  // Use activity's estimated cost if available
  if (activity.estimatedCost) {
    const costMap: Record<string, number> = {
      $: 25,
      $$: 50,
      $$$: 100,
      $$$$: 200,
    };
    return costMap[activity.estimatedCost] || 50;
  }

  // Default estimates by category
  const defaults: Record<BookingCategory, number> = {
    restaurant: 75,
    concert: 120,
    theater: 150,
    movie: 30,
    flight: 350,
    hotel: 200,
    car_rental: 80,
    activity: 60,
    spa: 150,
    tour: 100,
    sports_event: 100,
    transportation: 25,
    other: 50,
  };

  return defaults[category] || 50;
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
