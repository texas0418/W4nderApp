import { TravelPreference, TravelStyle, BudgetRange, FoodPreference } from '@/types';

export const travelStyles: TravelStyle[] = [
  {
    id: 'solo',
    name: 'Solo Explorer',
    description: 'Independent adventures at your own pace',
    icon: 'User',
  },
  {
    id: 'couple',
    name: 'Romantic Getaway',
    description: 'Intimate experiences for two',
    icon: 'Heart',
  },
  {
    id: 'family',
    name: 'Family Fun',
    description: 'Kid-friendly activities for all ages',
    icon: 'Users',
  },
  {
    id: 'group',
    name: 'Group Adventure',
    description: 'Shared experiences with friends',
    icon: 'UsersRound',
  },
];

export const budgetRanges: BudgetRange[] = [
  {
    id: 'budget',
    label: 'Budget Friendly',
    min: 0,
    max: 100,
    icon: 'Wallet',
  },
  {
    id: 'moderate',
    label: 'Moderate',
    min: 100,
    max: 250,
    icon: 'CreditCard',
  },
  {
    id: 'comfort',
    label: 'Comfortable',
    min: 250,
    max: 500,
    icon: 'Gem',
  },
  {
    id: 'luxury',
    label: 'Luxury',
    min: 500,
    max: null,
    icon: 'Crown',
  },
];

export const travelPreferences: TravelPreference[] = [
  { id: 'outdoor', name: 'Outdoor Adventures', icon: 'Mountain', selected: false },
  { id: 'beach', name: 'Beach & Relaxation', icon: 'Umbrella', selected: false },
  { id: 'cultural', name: 'Cultural Experiences', icon: 'Landmark', selected: false },
  { id: 'foodie', name: 'Food & Culinary', icon: 'UtensilsCrossed', selected: false },
  { id: 'nightlife', name: 'Nightlife', icon: 'Moon', selected: false },
  { id: 'wellness', name: 'Wellness & Spa', icon: 'Sparkles', selected: false },
  { id: 'adventure', name: 'Extreme Sports', icon: 'Flame', selected: false },
  { id: 'photography', name: 'Photography', icon: 'Camera', selected: false },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', selected: false },
  { id: 'wildlife', name: 'Wildlife & Nature', icon: 'TreePine', selected: false },
  { id: 'history', name: 'History & Museums', icon: 'Building', selected: false },
  { id: 'romantic', name: 'Romantic', icon: 'Heart', selected: false },
  { id: 'concerts', name: 'Concerts & Live Music', icon: 'Music', selected: false },
  { id: 'clubs', name: 'Clubs & Dancing', icon: 'PartyPopper', selected: false },
  { id: 'bars', name: 'Bars & Cocktails', icon: 'Wine', selected: false },
  { id: 'festivals', name: 'Festivals & Events', icon: 'Ticket', selected: false },
  { id: 'art', name: 'Art & Galleries', icon: 'Palette', selected: false },
  { id: 'sports', name: 'Sports & Games', icon: 'Trophy', selected: false },
  { id: 'markets', name: 'Local Markets', icon: 'Store', selected: false },
  { id: 'coffee', name: 'Coffee & Cafes', icon: 'Coffee', selected: false },
];

export const foodPreferences: FoodPreference[] = [
  { id: 'italian', name: 'Italian', icon: 'Pizza', emoji: '🍝' },
  { id: 'chinese', name: 'Chinese', icon: 'Soup', emoji: '🥡' },
  { id: 'japanese', name: 'Japanese & Sushi', icon: 'Fish', emoji: '🍣' },
  { id: 'mexican', name: 'Mexican', icon: 'Flame', emoji: '🌮' },
  { id: 'indian', name: 'Indian', icon: 'Leaf', emoji: '🍛' },
  { id: 'thai', name: 'Thai', icon: 'Citrus', emoji: '🍜' },
  { id: 'middle-eastern', name: 'Middle Eastern', icon: 'Salad', emoji: '🧆' },
  { id: 'french', name: 'French', icon: 'Croissant', emoji: '🥐' },
  { id: 'korean', name: 'Korean', icon: 'Beef', emoji: '🍖' },
  { id: 'mediterranean', name: 'Mediterranean', icon: 'Grape', emoji: '🫒' },
  { id: 'american', name: 'American', icon: 'Sandwich', emoji: '🍔' },
  { id: 'vietnamese', name: 'Vietnamese', icon: 'Carrot', emoji: '🍲' },
  { id: 'greek', name: 'Greek', icon: 'Utensils', emoji: '🥙' },
  { id: 'spanish', name: 'Spanish', icon: 'Wine', emoji: '🥘' },
  { id: 'seafood', name: 'Seafood', icon: 'Shell', emoji: '🦐' },
  { id: 'vegetarian', name: 'Vegetarian', icon: 'Vegan', emoji: '🥗' },
  { id: 'steakhouse', name: 'Steakhouse', icon: 'Beef', emoji: '🥩' },
  { id: 'bbq', name: 'BBQ & Grill', icon: 'Flame', emoji: '🔥' },
];
