// Date Night Types

export type BudgetTier = '$' | '$$' | '$$$' | '$$$$';

export type ActivityType = 
  | 'adventurous'
  | 'relaxed'
  | 'romantic'
  | 'creative'
  | 'active'
  | 'cultural'
  | 'social'
  | 'intimate';

export type CuisineType =
  | 'italian'
  | 'mexican'
  | 'japanese'
  | 'chinese'
  | 'indian'
  | 'thai'
  | 'french'
  | 'american'
  | 'mediterranean'
  | 'korean'
  | 'vietnamese'
  | 'greek'
  | 'spanish'
  | 'middle-eastern'
  | 'caribbean'
  | 'other';

export type DietaryRestriction =
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'dairy-free'
  | 'nut-free'
  | 'halal'
  | 'kosher'
  | 'pescatarian'
  | 'keto'
  | 'none';

export type TimeOfDay = 'morning' | 'lunch' | 'afternoon' | 'evening' | 'night' | 'all-day';

export type EnvironmentPreference = 'indoor' | 'outdoor' | 'both';

export interface DatePreferences {
  cuisineTypes: CuisineType[];
  dietaryRestrictions: DietaryRestriction[];
  activityTypes: ActivityType[];
  environmentPreference: EnvironmentPreference;
  preferredTimeOfDay: TimeOfDay[];
  maxTravelDistance: number; // in miles
  budgetTier: BudgetTier;
}

export interface PartnerProfile {
  id: string;
  name: string;
  avatar?: string;
  isLinked: boolean; // true if linked account, false if manually created
  linkedUserId?: string; // if linked to another user's account
  preferences: DatePreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserDateProfile {
  id: string;
  preferences: DatePreferences;
  partners: PartnerProfile[];
  savedItineraries: DateItinerary[];
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryActivity {
  id: string;
  name: string;
  description: string;
  type: ActivityType | 'dining' | 'drinks' | 'dessert' | 'transportation';
  location: {
    name: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  startTime: string;
  endTime: string;
  estimatedCost: BudgetTier;
  notes?: string;
  reservationRequired: boolean;
  reservationMade: boolean;
  imageUrl?: string;
}

export interface DateItinerary {
  id: string;
  name: string;
  date: string;
  partnerId: string;
  partnerName: string;
  activities: ItineraryActivity[];
  totalEstimatedCost: BudgetTier;
  status: 'draft' | 'planned' | 'completed' | 'cancelled';
  notes?: string;
  isSurprise: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DateSuggestion {
  id: string;
  title: string;
  description: string;
  activities: Omit<ItineraryActivity, 'id'>[];
  matchScore: number; // 0-100 based on preference matching
  estimatedTotalCost: BudgetTier;
  estimatedDuration: string;
  tags: string[];
  imageUrl: string;
}

// For partner linking
export interface PartnerLinkRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}
