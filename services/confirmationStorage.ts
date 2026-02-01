// Confirmation Storage Service for W4nder
// Persists confirmations, tickets, and QR codes using AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  Confirmation,
  ConfirmationType,
  ConfirmationStatus,
  ConfirmationFilter,
  ConfirmationSort,
  Ticket,
  generateConfirmationId,
  generateTicketId,
  sortConfirmations,
  isConfirmationPast,
} from '@/types/confirmation';

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  CONFIRMATIONS: '@w4nder/confirmations',
  TICKETS: '@w4nder/tickets',
  SETTINGS: '@w4nder/confirmation_settings',
};

const TICKET_DIRECTORY = `${FileSystem.documentDirectory}tickets/`;

// ============================================================================
// Confirmation Storage Service
// ============================================================================

class ConfirmationStorageService {
  private confirmations: Map<string, Confirmation> = new Map();
  private tickets: Map<string, Ticket> = new Map();
  private listeners: Map<string, (confirmations: Confirmation[]) => void> = new Map();
  private isInitialized = false;

  // ============================================================================
  // Initialization
  // ============================================================================

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Ensure ticket directory exists
      const dirInfo = await FileSystem.getInfoAsync(TICKET_DIRECTORY);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(TICKET_DIRECTORY, { intermediates: true });
      }

      // Load confirmations from storage
      const confirmationsJson = await AsyncStorage.getItem(STORAGE_KEYS.CONFIRMATIONS);
      if (confirmationsJson) {
        const confirmations: Confirmation[] = JSON.parse(confirmationsJson);
        for (const conf of confirmations) {
          this.confirmations.set(conf.id, conf);
        }
      }

      // Load tickets from storage
      const ticketsJson = await AsyncStorage.getItem(STORAGE_KEYS.TICKETS);
      if (ticketsJson) {
        const tickets: Ticket[] = JSON.parse(ticketsJson);
        for (const ticket of tickets) {
          this.tickets.set(ticket.id, ticket);
        }
      }

      // Update statuses for past confirmations
      await this.updateConfirmationStatuses();

      this.isInitialized = true;
      console.log(`Confirmation storage initialized: ${this.confirmations.size} confirmations, ${this.tickets.size} tickets`);
    } catch (error) {
      console.error('Failed to initialize confirmation storage:', error);
    }
  }

  private async persist(): Promise<void> {
    try {
      const confirmations = Array.from(this.confirmations.values());
      await AsyncStorage.setItem(STORAGE_KEYS.CONFIRMATIONS, JSON.stringify(confirmations));

      const tickets = Array.from(this.tickets.values());
      await AsyncStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    } catch (error) {
      console.error('Failed to persist confirmations:', error);
    }
  }

  private async updateConfirmationStatuses(): Promise<void> {
    let hasChanges = false;
    
    for (const [id, conf] of this.confirmations) {
      if (conf.status === 'upcoming' && isConfirmationPast(conf)) {
        conf.status = 'completed';
        conf.updatedAt = new Date().toISOString();
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      await this.persist();
    }
  }

  // ============================================================================
  // CRUD Operations
  // ============================================================================

  async addConfirmation(
    data: Omit<Confirmation, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { 
      status?: ConfirmationStatus 
    }
  ): Promise<Confirmation> {
    await this.initialize();

    const now = new Date().toISOString();
    const confirmation: Confirmation = {
      ...data,
      id: generateConfirmationId(),
      status: data.status || 'upcoming',
      createdAt: now,
      updatedAt: now,
    };

    this.confirmations.set(confirmation.id, confirmation);
    await this.persist();
    this.notifyListeners();

    return confirmation;
  }

  async updateConfirmation(
    id: string,
    updates: Partial<Omit<Confirmation, 'id' | 'createdAt'>>
  ): Promise<Confirmation | null> {
    await this.initialize();

    const confirmation = this.confirmations.get(id);
    if (!confirmation) return null;

    const updated: Confirmation = {
      ...confirmation,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.confirmations.set(id, updated);
    await this.persist();
    this.notifyListeners();

    return updated;
  }

  async deleteConfirmation(id: string): Promise<boolean> {
    await this.initialize();

    const confirmation = this.confirmations.get(id);
    if (!confirmation) return false;

    // Delete associated tickets
    if (confirmation.tickets) {
      for (const ticket of confirmation.tickets) {
        await this.deleteTicket(ticket.id);
      }
    }

    this.confirmations.delete(id);
    await this.persist();
    this.notifyListeners();

    return true;
  }

  async getConfirmation(id: string): Promise<Confirmation | null> {
    await this.initialize();
    return this.confirmations.get(id) || null;
  }

  async getAllConfirmations(
    filter?: ConfirmationFilter,
    sort?: ConfirmationSort
  ): Promise<Confirmation[]> {
    await this.initialize();

    let confirmations = Array.from(this.confirmations.values());

    // Apply filters
    if (filter) {
      confirmations = this.applyFilter(confirmations, filter);
    }

    // Apply sorting
    if (sort) {
      confirmations = sortConfirmations(confirmations, sort);
    } else {
      // Default: sort by date ascending (upcoming first)
      confirmations = sortConfirmations(confirmations, { field: 'date', direction: 'asc' });
    }

    return confirmations;
  }

  async getUpcomingConfirmations(): Promise<Confirmation[]> {
    return this.getAllConfirmations(
      { status: ['upcoming', 'active'] },
      { field: 'date', direction: 'asc' }
    );
  }

  async getPastConfirmations(): Promise<Confirmation[]> {
    return this.getAllConfirmations(
      { status: ['completed', 'cancelled', 'expired'] },
      { field: 'date', direction: 'desc' }
    );
  }

  async getConfirmationsByType(type: ConfirmationType): Promise<Confirmation[]> {
    return this.getAllConfirmations(
      { types: [type] },
      { field: 'date', direction: 'asc' }
    );
  }

  async getConfirmationsForDate(date: string): Promise<Confirmation[]> {
    return this.getAllConfirmations(
      { dateRange: { start: date, end: date } },
      { field: 'date', direction: 'asc' }
    );
  }

  async searchConfirmations(query: string): Promise<Confirmation[]> {
    return this.getAllConfirmations(
      { searchQuery: query },
      { field: 'date', direction: 'asc' }
    );
  }

  // ============================================================================
  // Ticket Management
  // ============================================================================

  async addTicket(
    confirmationId: string,
    ticketData: Omit<Ticket, 'id' | 'createdAt' | 'isUsed'>
  ): Promise<Ticket | null> {
    await this.initialize();

    const confirmation = this.confirmations.get(confirmationId);
    if (!confirmation) return null;

    const ticket: Ticket = {
      ...ticketData,
      id: generateTicketId(),
      isUsed: false,
      createdAt: new Date().toISOString(),
    };

    // Store ticket
    this.tickets.set(ticket.id, ticket);

    // Link to confirmation
    if (!confirmation.tickets) {
      confirmation.tickets = [];
    }
    confirmation.tickets.push(ticket);
    confirmation.updatedAt = new Date().toISOString();

    await this.persist();
    this.notifyListeners();

    return ticket;
  }

  async updateTicket(
    ticketId: string,
    updates: Partial<Omit<Ticket, 'id' | 'createdAt'>>
  ): Promise<Ticket | null> {
    await this.initialize();

    const ticket = this.tickets.get(ticketId);
    if (!ticket) return null;

    const updated: Ticket = {
      ...ticket,
      ...updates,
    };

    this.tickets.set(ticketId, updated);

    // Update in confirmation
    for (const [, conf] of this.confirmations) {
      if (conf.tickets) {
        const idx = conf.tickets.findIndex(t => t.id === ticketId);
        if (idx !== -1) {
          conf.tickets[idx] = updated;
          conf.updatedAt = new Date().toISOString();
          break;
        }
      }
    }

    await this.persist();
    this.notifyListeners();

    return updated;
  }

  async deleteTicket(ticketId: string): Promise<boolean> {
    await this.initialize();

    const ticket = this.tickets.get(ticketId);
    if (!ticket) return false;

    // Delete local file if exists
    if (ticket.imageUri && ticket.imageUri.startsWith(TICKET_DIRECTORY)) {
      try {
        await FileSystem.deleteAsync(ticket.imageUri, { idempotent: true });
      } catch (error) {
        console.error('Failed to delete ticket file:', error);
      }
    }

    if (ticket.pdfUri && ticket.pdfUri.startsWith(TICKET_DIRECTORY)) {
      try {
        await FileSystem.deleteAsync(ticket.pdfUri, { idempotent: true });
      } catch (error) {
        console.error('Failed to delete ticket PDF:', error);
      }
    }

    this.tickets.delete(ticketId);

    // Remove from confirmation
    for (const [, conf] of this.confirmations) {
      if (conf.tickets) {
        conf.tickets = conf.tickets.filter(t => t.id !== ticketId);
        conf.updatedAt = new Date().toISOString();
      }
    }

    await this.persist();
    this.notifyListeners();

    return true;
  }

  async markTicketAsUsed(ticketId: string): Promise<Ticket | null> {
    return this.updateTicket(ticketId, {
      isUsed: true,
      usedAt: new Date().toISOString(),
    });
  }

  // ============================================================================
  // File Storage
  // ============================================================================

  async saveTicketImage(
    ticketId: string,
    imageUri: string
  ): Promise<string | null> {
    await this.initialize();

    try {
      const filename = `${ticketId}.png`;
      const destUri = `${TICKET_DIRECTORY}${filename}`;

      await FileSystem.copyAsync({
        from: imageUri,
        to: destUri,
      });

      await this.updateTicket(ticketId, { imageUri: destUri });

      return destUri;
    } catch (error) {
      console.error('Failed to save ticket image:', error);
      return null;
    }
  }

  async saveTicketPdf(
    ticketId: string,
    pdfUri: string
  ): Promise<string | null> {
    await this.initialize();

    try {
      const filename = `${ticketId}.pdf`;
      const destUri = `${TICKET_DIRECTORY}${filename}`;

      await FileSystem.copyAsync({
        from: pdfUri,
        to: destUri,
      });

      await this.updateTicket(ticketId, { pdfUri: destUri });

      return destUri;
    } catch (error) {
      console.error('Failed to save ticket PDF:', error);
      return null;
    }
  }

  async saveQRCodeImage(
    ticketId: string,
    base64Data: string
  ): Promise<string | null> {
    await this.initialize();

    try {
      const filename = `${ticketId}_qr.png`;
      const destUri = `${TICKET_DIRECTORY}${filename}`;

      await FileSystem.writeAsStringAsync(destUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await this.updateTicket(ticketId, { imageUri: destUri });

      return destUri;
    } catch (error) {
      console.error('Failed to save QR code:', error);
      return null;
    }
  }

  // ============================================================================
  // Import/Export
  // ============================================================================

  async exportConfirmation(id: string): Promise<string | null> {
    const confirmation = await this.getConfirmation(id);
    if (!confirmation) return null;

    return JSON.stringify(confirmation, null, 2);
  }

  async exportAllConfirmations(): Promise<string> {
    const confirmations = await this.getAllConfirmations();
    return JSON.stringify(confirmations, null, 2);
  }

  async importConfirmation(json: string): Promise<Confirmation | null> {
    try {
      const data = JSON.parse(json);
      
      // Validate required fields
      if (!data.title || !data.date || !data.type) {
        throw new Error('Invalid confirmation data');
      }

      // Remove id to generate new one
      delete data.id;
      delete data.createdAt;
      delete data.updatedAt;

      return this.addConfirmation(data);
    } catch (error) {
      console.error('Failed to import confirmation:', error);
      return null;
    }
  }

  async shareConfirmation(id: string): Promise<boolean> {
    const confirmation = await this.getConfirmation(id);
    if (!confirmation) return false;

    try {
      const shareText = this.formatConfirmationForShare(confirmation);
      
      // If there's a ticket with a file, share that too
      if (confirmation.tickets && confirmation.tickets.length > 0) {
        const ticket = confirmation.tickets[0];
        const fileUri = ticket.pdfUri || ticket.imageUri;
        
        if (fileUri && await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: ticket.pdfUri ? 'application/pdf' : 'image/png',
            dialogTitle: confirmation.title,
          });
          return true;
        }
      }

      // Fall back to text share (would need to integrate with Share API)
      console.log('Share text:', shareText);
      return true;
    } catch (error) {
      console.error('Failed to share confirmation:', error);
      return false;
    }
  }

  private formatConfirmationForShare(confirmation: Confirmation): string {
    const lines = [
      `📋 ${confirmation.title}`,
      `📍 ${confirmation.location.name}`,
      `📅 ${confirmation.displayDateTime}`,
      `✅ Confirmation: ${confirmation.confirmationNumber}`,
    ];

    if (confirmation.location.address) {
      lines.push(`📌 ${confirmation.location.address}`);
    }

    if (confirmation.contact?.phone) {
      lines.push(`📞 ${confirmation.contact.phone}`);
    }

    return lines.join('\n');
  }

  // ============================================================================
  // Quick Add Methods (for integration with booking services)
  // ============================================================================

  async addRestaurantConfirmation(data: {
    restaurantName: string;
    confirmationNumber: string;
    date: string;
    time: string;
    partySize: number;
    address?: string;
    phone?: string;
    provider: string;
    providerColor?: string;
  }): Promise<Confirmation> {
    return this.addConfirmation({
      type: 'restaurant',
      provider: data.provider,
      providerColor: data.providerColor,
      confirmationNumber: data.confirmationNumber,
      title: data.restaurantName,
      subtitle: `Table for ${data.partySize}`,
      date: data.date,
      startTime: data.time,
      displayDateTime: this.formatDateTime(data.date, data.time),
      location: {
        name: data.restaurantName,
        address: data.address,
      },
      contact: {
        phone: data.phone,
      },
      source: 'auto',
    });
  }

  async addActivityConfirmation(data: {
    activityName: string;
    confirmationNumber: string;
    date: string;
    time: string;
    participants: number;
    meetingPoint?: string;
    address?: string;
    phone?: string;
    provider: string;
    providerColor?: string;
    voucherUrl?: string;
    qrCode?: string;
  }): Promise<Confirmation> {
    const confirmation = await this.addConfirmation({
      type: 'activity',
      provider: data.provider,
      providerColor: data.providerColor,
      confirmationNumber: data.confirmationNumber,
      title: data.activityName,
      subtitle: `${data.participants} participant${data.participants > 1 ? 's' : ''}`,
      date: data.date,
      startTime: data.time,
      displayDateTime: this.formatDateTime(data.date, data.time),
      location: {
        name: data.meetingPoint || data.activityName,
        address: data.address,
        meetingPoint: data.meetingPoint,
      },
      contact: {
        phone: data.phone,
      },
      source: 'auto',
    });

    // Add QR code ticket if provided
    if (data.qrCode) {
      await this.addTicket(confirmation.id, {
        type: 'qr_code',
        label: 'Mobile Voucher',
        code: data.qrCode,
        codeFormat: 'qr',
      });
    }

    return confirmation;
  }

  async addFlightConfirmation(data: {
    airline: string;
    flightNumber: string;
    confirmationNumber: string;
    departureDate: string;
    departureTime: string;
    departureAirport: string;
    arrivalAirport: string;
    passengers: number;
    boardingPass?: string;
  }): Promise<Confirmation> {
    const confirmation = await this.addConfirmation({
      type: 'flight',
      provider: data.airline,
      confirmationNumber: data.confirmationNumber,
      title: `${data.airline} ${data.flightNumber}`,
      subtitle: `${data.departureAirport} → ${data.arrivalAirport}`,
      date: data.departureDate,
      startTime: data.departureTime,
      displayDateTime: this.formatDateTime(data.departureDate, data.departureTime),
      location: {
        name: data.departureAirport,
      },
      source: 'auto',
    });

    if (data.boardingPass) {
      await this.addTicket(confirmation.id, {
        type: 'barcode',
        label: 'Boarding Pass',
        code: data.boardingPass,
        codeFormat: 'pdf417',
      });
    }

    return confirmation;
  }

  async addHotelConfirmation(data: {
    hotelName: string;
    confirmationNumber: string;
    checkInDate: string;
    checkOutDate: string;
    address?: string;
    phone?: string;
    provider?: string;
  }): Promise<Confirmation> {
    return this.addConfirmation({
      type: 'hotel',
      provider: data.provider || 'Direct',
      confirmationNumber: data.confirmationNumber,
      title: data.hotelName,
      subtitle: `${this.formatDateRange(data.checkInDate, data.checkOutDate)}`,
      date: data.checkInDate,
      displayDateTime: `Check-in: ${this.formatDate(data.checkInDate)}`,
      location: {
        name: data.hotelName,
        address: data.address,
      },
      contact: {
        phone: data.phone,
      },
      source: 'auto',
    });
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  private applyFilter(
    confirmations: Confirmation[],
    filter: ConfirmationFilter
  ): Confirmation[] {
    return confirmations.filter(conf => {
      // Filter by type
      if (filter.types && filter.types.length > 0) {
        if (!filter.types.includes(conf.type)) return false;
      }

      // Filter by status
      if (filter.status && filter.status.length > 0) {
        if (!filter.status.includes(conf.status)) return false;
      }

      // Filter by date range
      if (filter.dateRange) {
        const confDate = new Date(conf.date);
        const start = new Date(filter.dateRange.start);
        const end = new Date(filter.dateRange.end);
        if (confDate < start || confDate > end) return false;
      }

      // Filter by provider
      if (filter.provider) {
        if (conf.provider.toLowerCase() !== filter.provider.toLowerCase()) return false;
      }

      // Filter by search query
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        const searchableText = [
          conf.title,
          conf.subtitle,
          conf.confirmationNumber,
          conf.provider,
          conf.location.name,
          conf.location.address,
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) return false;
      }

      return true;
    });
  }

  private formatDateTime(date: string, time?: string): string {
    const d = new Date(date + 'T12:00:00');
    const dateStr = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${dateStr} at ${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    return dateStr;
  }

  private formatDate(date: string): string {
    return new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  private formatDateRange(start: string, end: string): string {
    const startDate = new Date(start + 'T12:00:00');
    const endDate = new Date(end + 'T12:00:00');
    
    const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    return `${startStr} - ${endStr}`;
  }

  // ============================================================================
  // Subscription
  // ============================================================================

  subscribe(id: string, callback: (confirmations: Confirmation[]) => void) {
    this.listeners.set(id, callback);
    return () => this.listeners.delete(id);
  }

  private notifyListeners() {
    const confirmations = Array.from(this.confirmations.values());
    this.listeners.forEach(callback => callback(confirmations));
  }

  // ============================================================================
  // Clear Data
  // ============================================================================

  async clearAll(): Promise<void> {
    // Delete all ticket files
    try {
      await FileSystem.deleteAsync(TICKET_DIRECTORY, { idempotent: true });
      await FileSystem.makeDirectoryAsync(TICKET_DIRECTORY, { intermediates: true });
    } catch (error) {
      console.error('Failed to clear ticket files:', error);
    }

    this.confirmations.clear();
    this.tickets.clear();
    await this.persist();
    this.notifyListeners();
  }

  async clearPastConfirmations(): Promise<number> {
    const pastConfirmations = await this.getPastConfirmations();
    let count = 0;

    for (const conf of pastConfirmations) {
      await this.deleteConfirmation(conf.id);
      count++;
    }

    return count;
  }
}

// Export singleton
export const confirmationStorage = new ConfirmationStorageService();
