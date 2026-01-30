import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  DatePreferences,
  PartnerProfile,
  UserDateProfile,
  DateItinerary,
  DateSuggestion,
  BudgetTier,
  ItineraryActivity,
} from '@/types/date-night';

interface DateNightContextType {
  // User profile
  userProfile: UserDateProfile | null;
  setUserPreferences: (preferences: DatePreferences) => void;
  
  // Partner management
  partners: PartnerProfile[];
  addPartner: (partner: Omit<PartnerProfile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePartner: (partnerId: string, updates: Partial<PartnerProfile>) => void;
  removePartner: (partnerId: string) => void;
  selectedPartner: PartnerProfile | null;
  setSelectedPartner: (partner: PartnerProfile | null) => void;
  
  // Itineraries
  itineraries: DateItinerary[];
  currentItinerary: DateItinerary | null;
  createItinerary: (itinerary: Omit<DateItinerary, 'id' | 'createdAt' | 'updatedAt'>) => DateItinerary;
  updateItinerary: (itineraryId: string, updates: Partial<DateItinerary>) => void;
  deleteItinerary: (itineraryId: string) => void;
  setCurrentItinerary: (itinerary: DateItinerary | null) => void;
  
  // Activity management within itinerary
  addActivity: (itineraryId: string, activity: Omit<ItineraryActivity, 'id'>) => void;
  updateActivity: (itineraryId: string, activityId: string, updates: Partial<ItineraryActivity>) => void;
  removeActivity: (itineraryId: string, activityId: string) => void;
  reorderActivities: (itineraryId: string, activityIds: string[]) => void;
  
  // Suggestions
  suggestions: DateSuggestion[];
  generateSuggestions: (partnerId: string, budget: BudgetTier, date: string) => Promise<void>;
  isGenerating: boolean;
  
  // UI State
  isLoading: boolean;
}

const DateNightContext = createContext<DateNightContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 15);

const defaultPreferences: DatePreferences = {
  cuisineTypes: [],
  dietaryRestrictions: ['none'],
  activityTypes: [],
  environmentPreference: 'both',
  preferredTimeOfDay: ['evening'],
  maxTravelDistance: 25,
  budgetTier: '$$',
};

// Mock suggestions data
const mockSuggestions: DateSuggestion[] = [
  {
    id: '1',
    title: 'Romantic Dinner & Stargazing',
    description: 'An intimate evening starting with a candlelit dinner followed by stargazing at a scenic overlook.',
    activities: [
      {
        name: 'Candlelit Dinner',
        description: 'Enjoy a romantic dinner at an upscale Italian restaurant',
        type: 'dining',
        location: { name: 'La Bella Vista', address: '123 Main St' },
        startTime: '7:00 PM',
        endTime: '9:00 PM',
        estimatedCost: '$$$',
        reservationRequired: true,
        reservationMade: false,
      },
      {
        name: 'Scenic Drive',
        description: 'Short drive to the overlook point',
        type: 'transportation',
        location: { name: 'Mountain View Point', address: '456 Hilltop Rd' },
        startTime: '9:15 PM',
        endTime: '9:45 PM',
        estimatedCost: '$',
        reservationRequired: false,
        reservationMade: false,
      },
      {
        name: 'Stargazing',
        description: 'Watch the stars together with hot cocoa',
        type: 'romantic',
        location: { name: 'Mountain View Point', address: '456 Hilltop Rd' },
        startTime: '9:45 PM',
        endTime: '11:00 PM',
        estimatedCost: '$',
        reservationRequired: false,
        reservationMade: false,
      },
    ],
    matchScore: 95,
    estimatedTotalCost: '$$$',
    estimatedDuration: '4 hours',
    tags: ['romantic', 'dinner', 'outdoor', 'evening'],
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
  },
  {
    id: '2',
    title: 'Adventure Day: Hiking & Picnic',
    description: 'An active day exploring nature trails followed by a scenic picnic lunch.',
    activities: [
      {
        name: 'Morning Hike',
        description: 'Scenic trail with beautiful views',
        type: 'active',
        location: { name: 'Riverside Trail', address: 'State Park Entrance' },
        startTime: '9:00 AM',
        endTime: '12:00 PM',
        estimatedCost: '$',
        reservationRequired: false,
        reservationMade: false,
      },
      {
        name: 'Gourmet Picnic',
        description: 'Pre-packed gourmet picnic basket at the overlook',
        type: 'dining',
        location: { name: 'Summit Overlook', address: 'State Park' },
        startTime: '12:00 PM',
        endTime: '1:30 PM',
        estimatedCost: '$$',
        reservationRequired: false,
        reservationMade: false,
      },
      {
        name: 'Ice Cream Stop',
        description: 'Cool down with artisanal ice cream',
        type: 'dessert',
        location: { name: 'Sweet Scoops', address: '789 Oak Ave' },
        startTime: '2:00 PM',
        endTime: '2:30 PM',
        estimatedCost: '$',
        reservationRequired: false,
        reservationMade: false,
      },
    ],
    matchScore: 88,
    estimatedTotalCost: '$$',
    estimatedDuration: '5.5 hours',
    tags: ['adventure', 'outdoor', 'active', 'nature'],
    imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
  },
  {
    id: '3',
    title: 'Cultural Evening: Art & Jazz',
    description: 'Explore local art galleries followed by live jazz and craft cocktails.',
    activities: [
      {
        name: 'Art Gallery Tour',
        description: 'Guided tour of contemporary art exhibition',
        type: 'cultural',
        location: { name: 'Modern Art Museum', address: '321 Gallery Blvd' },
        startTime: '5:00 PM',
        endTime: '7:00 PM',
        estimatedCost: '$$',
        reservationRequired: true,
        reservationMade: false,
      },
      {
        name: 'Tapas & Wine',
        description: 'Light dinner with Spanish tapas and wine',
        type: 'dining',
        location: { name: 'Tapa Luna', address: '555 Wine St' },
        startTime: '7:30 PM',
        endTime: '9:00 PM',
        estimatedCost: '$$$',
        reservationRequired: true,
        reservationMade: false,
      },
      {
        name: 'Live Jazz',
        description: 'Intimate jazz performance with craft cocktails',
        type: 'social',
        location: { name: 'Blue Note Lounge', address: '888 Jazz Lane' },
        startTime: '9:30 PM',
        endTime: '11:30 PM',
        estimatedCost: '$$',
        reservationRequired: false,
        reservationMade: false,
      },
    ],
    matchScore: 82,
    estimatedTotalCost: '$$$',
    estimatedDuration: '6.5 hours',
    tags: ['cultural', 'art', 'music', 'evening', 'sophisticated'],
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
  },
  {
    id: '4',
    title: 'Cozy Indoor Day',
    description: 'A relaxed day with cooking class, spa treatments, and movie night.',
    activities: [
      {
        name: 'Couples Cooking Class',
        description: 'Learn to make pasta from scratch together',
        type: 'creative',
        location: { name: 'Culinary Studio', address: '100 Chef Way' },
        startTime: '11:00 AM',
        endTime: '1:30 PM',
        estimatedCost: '$$$',
        reservationRequired: true,
        reservationMade: false,
      },
      {
        name: 'Couples Massage',
        description: 'Relaxing 60-minute couples massage',
        type: 'relaxed',
        location: { name: 'Serenity Spa', address: '200 Wellness Blvd' },
        startTime: '3:00 PM',
        endTime: '4:30 PM',
        estimatedCost: '$$$$',
        reservationRequired: true,
        reservationMade: false,
      },
      {
        name: 'Dinner & Movie',
        description: 'Takeout and movie night at home',
        type: 'intimate',
        location: { name: 'Home', address: 'Your place' },
        startTime: '7:00 PM',
        endTime: '10:00 PM',
        estimatedCost: '$$',
        reservationRequired: false,
        reservationMade: false,
      },
    ],
    matchScore: 79,
    estimatedTotalCost: '$$$$',
    estimatedDuration: '8 hours',
    tags: ['relaxed', 'indoor', 'spa', 'cooking', 'intimate'],
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
  },
];

export function DateNightProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [userProfile, setUserProfile] = useState<UserDateProfile>({
    id: generateId(),
    preferences: defaultPreferences,
    partners: [],
    savedItineraries: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  const [partners, setPartners] = useState<PartnerProfile[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<PartnerProfile | null>(null);
  const [itineraries, setItineraries] = useState<DateItinerary[]>([]);
  const [currentItinerary, setCurrentItinerary] = useState<DateItinerary | null>(null);
  const [suggestions, setSuggestions] = useState<DateSuggestion[]>([]);

  const setUserPreferences = useCallback((preferences: DatePreferences) => {
    setUserProfile(prev => ({
      ...prev,
      preferences,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const addPartner = useCallback((partner: Omit<PartnerProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPartner: PartnerProfile = {
      ...partner,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPartners(prev => [...prev, newPartner]);
    return newPartner;
  }, []);

  const updatePartner = useCallback((partnerId: string, updates: Partial<PartnerProfile>) => {
    setPartners(prev => prev.map(p => 
      p.id === partnerId 
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    ));
  }, []);

  const removePartner = useCallback((partnerId: string) => {
    setPartners(prev => prev.filter(p => p.id !== partnerId));
    if (selectedPartner?.id === partnerId) {
      setSelectedPartner(null);
    }
  }, [selectedPartner]);

  const createItinerary = useCallback((itinerary: Omit<DateItinerary, 'id' | 'createdAt' | 'updatedAt'>): DateItinerary => {
    const newItinerary: DateItinerary = {
      ...itinerary,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setItineraries(prev => [...prev, newItinerary]);
    return newItinerary;
  }, []);

  const updateItinerary = useCallback((itineraryId: string, updates: Partial<DateItinerary>) => {
    setItineraries(prev => prev.map(i => 
      i.id === itineraryId 
        ? { ...i, ...updates, updatedAt: new Date().toISOString() }
        : i
    ));
    if (currentItinerary?.id === itineraryId) {
      setCurrentItinerary(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null);
    }
  }, [currentItinerary]);

  const deleteItinerary = useCallback((itineraryId: string) => {
    setItineraries(prev => prev.filter(i => i.id !== itineraryId));
    if (currentItinerary?.id === itineraryId) {
      setCurrentItinerary(null);
    }
  }, [currentItinerary]);

  const addActivity = useCallback((itineraryId: string, activity: Omit<ItineraryActivity, 'id'>) => {
    const newActivity: ItineraryActivity = {
      ...activity,
      id: generateId(),
    };
    setItineraries(prev => prev.map(i => 
      i.id === itineraryId 
        ? { ...i, activities: [...i.activities, newActivity], updatedAt: new Date().toISOString() }
        : i
    ));
  }, []);

  const updateActivity = useCallback((itineraryId: string, activityId: string, updates: Partial<ItineraryActivity>) => {
    setItineraries(prev => prev.map(i => 
      i.id === itineraryId 
        ? { 
            ...i, 
            activities: i.activities.map(a => a.id === activityId ? { ...a, ...updates } : a),
            updatedAt: new Date().toISOString() 
          }
        : i
    ));
  }, []);

  const removeActivity = useCallback((itineraryId: string, activityId: string) => {
    setItineraries(prev => prev.map(i => 
      i.id === itineraryId 
        ? { ...i, activities: i.activities.filter(a => a.id !== activityId), updatedAt: new Date().toISOString() }
        : i
    ));
  }, []);

  const reorderActivities = useCallback((itineraryId: string, activityIds: string[]) => {
    setItineraries(prev => prev.map(i => {
      if (i.id !== itineraryId) return i;
      const reordered = activityIds.map(id => i.activities.find(a => a.id === id)!).filter(Boolean);
      return { ...i, activities: reordered, updatedAt: new Date().toISOString() };
    }));
  }, []);

  const generateSuggestions = useCallback(async (partnerId: string, budget: BudgetTier, date: string) => {
    setIsGenerating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, this would call an AI service with the combined preferences
    // For now, return mock suggestions filtered by budget
    const budgetOrder = ['$', '$$', '$$$', '$$$$'];
    const maxBudgetIndex = budgetOrder.indexOf(budget);
    
    const filteredSuggestions = mockSuggestions.filter(s => 
      budgetOrder.indexOf(s.estimatedTotalCost) <= maxBudgetIndex
    );
    
    setSuggestions(filteredSuggestions);
    setIsGenerating(false);
  }, []);

  const value: DateNightContextType = {
    userProfile,
    setUserPreferences,
    partners,
    addPartner,
    updatePartner,
    removePartner,
    selectedPartner,
    setSelectedPartner,
    itineraries,
    currentItinerary,
    createItinerary,
    updateItinerary,
    deleteItinerary,
    setCurrentItinerary,
    addActivity,
    updateActivity,
    removeActivity,
    reorderActivities,
    suggestions,
    generateSuggestions,
    isGenerating,
    isLoading,
  };

  return (
    <DateNightContext.Provider value={value}>
      {children}
    </DateNightContext.Provider>
  );
}

export function useDateNight() {
  const context = useContext(DateNightContext);
  if (context === undefined) {
    throw new Error('useDateNight must be used within a DateNightProvider');
  }
  return context;
}
