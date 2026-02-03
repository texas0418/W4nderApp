// ============================================================================
// Anniversary & Milestone Tracker Types
// ============================================================================

export interface Anniversary {
  id: string;
  name: string;
  date: string; // ISO date (year may be original year or current year)
  originalYear: number;
  type: AnniversaryType;
  
  // Recurrence
  recurring: boolean;
  frequency: 'yearly' | 'monthly' | 'once';
  
  // Partner
  partnerName?: string;
  
  // Customization
  emoji?: string;
  color?: string;
  notes?: string;
  
  // Reminders
  reminders: ReminderSetting[];
  
  // Tracking
  celebratedYears: number[]; // Years we've marked as celebrated
  createdAt: string;
  updatedAt: string;
}

export type AnniversaryType = 
  | 'first_date'
  | 'relationship'
  | 'engagement'
  | 'wedding'
  | 'first_kiss'
  | 'moved_in'
  | 'first_trip'
  | 'proposal'
  | 'met'
  | 'custom';

export interface ReminderSetting {
  id: string;
  daysBefore: number;
  time: string; // HH:mm
  enabled: boolean;
}

export interface Milestone {
  id: string;
  anniversaryId: string;
  years: number;
  months?: number;
  name: string;
  traditionalGift?: string;
  modernGift?: string;
  suggestions: MilestoneSuggestion[];
  achieved: boolean;
  achievedDate?: string;
}

export interface MilestoneSuggestion {
  id: string;
  title: string;
  description: string;
  category: SuggestionCategory;
  estimatedCost: CostRange;
  tags: string[];
  imageUrl?: string;
  link?: string;
}

export type SuggestionCategory = 
  | 'experience'
  | 'gift'
  | 'trip'
  | 'dinner'
  | 'activity'
  | 'romantic'
  | 'adventure'
  | 'relaxation'
  | 'creative';

export type CostRange = 'free' | '$' | '$$' | '$$$' | '$$$$';

export interface UpcomingAnniversary {
  anniversary: Anniversary;
  milestone: Milestone | null;
  daysUntil: number;
  date: Date;
  yearsTotal: number;
  isToday: boolean;
  isThisWeek: boolean;
  isThisMonth: boolean;
}

// ============================================================================
// Anniversary Type Configuration
// ============================================================================

export const ANNIVERSARY_TYPES: {
  id: AnniversaryType;
  label: string;
  emoji: string;
  color: string;
  defaultName: string;
}[] = [
  { id: 'first_date', label: 'First Date', emoji: '💕', color: '#FF6B9D', defaultName: 'First Date Anniversary' },
  { id: 'relationship', label: 'Relationship', emoji: '❤️', color: '#EF4444', defaultName: 'Dating Anniversary' },
  { id: 'engagement', label: 'Engagement', emoji: '💍', color: '#8B5CF6', defaultName: 'Engagement Anniversary' },
  { id: 'wedding', label: 'Wedding', emoji: '👰', color: '#F59E0B', defaultName: 'Wedding Anniversary' },
  { id: 'first_kiss', label: 'First Kiss', emoji: '💋', color: '#EC4899', defaultName: 'First Kiss Anniversary' },
  { id: 'moved_in', label: 'Moved In Together', emoji: '🏠', color: '#10B981', defaultName: 'Move-In Anniversary' },
  { id: 'first_trip', label: 'First Trip', emoji: '✈️', color: '#3B82F6', defaultName: 'First Trip Anniversary' },
  { id: 'proposal', label: 'Proposal', emoji: '💎', color: '#6366F1', defaultName: 'Proposal Anniversary' },
  { id: 'met', label: 'First Met', emoji: '✨', color: '#14B8A6', defaultName: 'Day We Met' },
  { id: 'custom', label: 'Custom', emoji: '📅', color: '#6B7280', defaultName: 'Special Day' },
];

export function getAnniversaryTypeConfig(type: AnniversaryType) {
  return ANNIVERSARY_TYPES.find(t => t.id === type) || ANNIVERSARY_TYPES[ANNIVERSARY_TYPES.length - 1];
}

// ============================================================================
// Traditional & Modern Anniversary Gifts
// ============================================================================

export const ANNIVERSARY_GIFTS: {
  year: number;
  traditional: string;
  modern: string;
  flower?: string;
  gemstone?: string;
}[] = [
  { year: 1, traditional: 'Paper', modern: 'Clocks', flower: 'Carnation', gemstone: 'Gold' },
  { year: 2, traditional: 'Cotton', modern: 'China', flower: 'Lily of the Valley', gemstone: 'Garnet' },
  { year: 3, traditional: 'Leather', modern: 'Crystal/Glass', flower: 'Sunflower', gemstone: 'Pearl' },
  { year: 4, traditional: 'Fruit/Flowers', modern: 'Appliances', flower: 'Hydrangea', gemstone: 'Blue Topaz' },
  { year: 5, traditional: 'Wood', modern: 'Silverware', flower: 'Daisy', gemstone: 'Sapphire' },
  { year: 6, traditional: 'Candy/Iron', modern: 'Wood', flower: 'Calla Lily', gemstone: 'Amethyst' },
  { year: 7, traditional: 'Wool/Copper', modern: 'Desk Sets', flower: 'Freesia', gemstone: 'Onyx' },
  { year: 8, traditional: 'Pottery/Bronze', modern: 'Linens/Lace', flower: 'Lilac', gemstone: 'Tourmaline' },
  { year: 9, traditional: 'Pottery/Willow', modern: 'Leather', flower: 'Bird of Paradise', gemstone: 'Lapis Lazuli' },
  { year: 10, traditional: 'Tin/Aluminum', modern: 'Diamond Jewelry', flower: 'Daffodil', gemstone: 'Diamond' },
  { year: 15, traditional: 'Crystal', modern: 'Watches', flower: 'Rose', gemstone: 'Ruby' },
  { year: 20, traditional: 'China', modern: 'Platinum', flower: 'Aster', gemstone: 'Emerald' },
  { year: 25, traditional: 'Silver', modern: 'Silver', flower: 'Iris', gemstone: 'Silver Jubilee' },
  { year: 30, traditional: 'Pearl', modern: 'Diamond', flower: 'Lily', gemstone: 'Pearl' },
  { year: 40, traditional: 'Ruby', modern: 'Ruby', flower: 'Gladiolus', gemstone: 'Ruby' },
  { year: 50, traditional: 'Gold', modern: 'Gold', flower: 'Yellow Rose', gemstone: 'Gold' },
  { year: 60, traditional: 'Diamond', modern: 'Diamond', flower: 'White Rose', gemstone: 'Diamond' },
];

export function getAnniversaryGifts(years: number) {
  return ANNIVERSARY_GIFTS.find(g => g.year === years);
}

// ============================================================================
// Milestone Suggestions Database
// ============================================================================

export const MILESTONE_SUGGESTIONS: Record<number, MilestoneSuggestion[]> = {
  1: [
    {
      id: 'ms1-1',
      title: 'Write Love Letters',
      description: 'Exchange handwritten letters sharing your favorite memories from year one',
      category: 'romantic',
      estimatedCost: 'free',
      tags: ['paper', 'traditional', 'romantic', 'personal'],
    },
    {
      id: 'ms1-2',
      title: 'Create a Photo Book',
      description: 'Compile your first year of photos into a beautiful keepsake album',
      category: 'gift',
      estimatedCost: '$$',
      tags: ['paper', 'photos', 'memories', 'keepsake'],
    },
    {
      id: 'ms1-3',
      title: 'Recreate Your First Date',
      description: 'Go back to where it all started and relive the magic',
      category: 'experience',
      estimatedCost: '$$',
      tags: ['nostalgic', 'romantic', 'meaningful'],
    },
    {
      id: 'ms1-4',
      title: 'Concert or Show Tickets',
      description: 'Paper tickets to see your favorite artist or show together',
      category: 'experience',
      estimatedCost: '$$$',
      tags: ['paper', 'modern', 'experience', 'music'],
    },
  ],
  2: [
    {
      id: 'ms2-1',
      title: 'Matching Robes',
      description: 'Cozy cotton robes for lazy weekend mornings together',
      category: 'gift',
      estimatedCost: '$$',
      tags: ['cotton', 'traditional', 'cozy', 'matching'],
    },
    {
      id: 'ms2-2',
      title: 'Spa Day',
      description: 'Book a couples massage with cotton towel treatments',
      category: 'relaxation',
      estimatedCost: '$$$',
      tags: ['cotton', 'spa', 'relaxation', 'couples'],
    },
    {
      id: 'ms2-3',
      title: 'Picnic with Cotton Blanket',
      description: 'Pack a romantic picnic with a new cotton blanket to keep',
      category: 'experience',
      estimatedCost: '$',
      tags: ['cotton', 'outdoor', 'romantic', 'picnic'],
    },
  ],
  3: [
    {
      id: 'ms3-1',
      title: 'Leather Journal Set',
      description: 'Matching leather journals to write your love story together',
      category: 'gift',
      estimatedCost: '$$',
      tags: ['leather', 'traditional', 'writing', 'personal'],
    },
    {
      id: 'ms3-2',
      title: 'Crystal Wine Glasses',
      description: 'Toast to three years with elegant crystal glassware',
      category: 'gift',
      estimatedCost: '$$',
      tags: ['crystal', 'modern', 'elegant', 'celebration'],
    },
    {
      id: 'ms3-3',
      title: 'Weekend Getaway',
      description: 'Leather weekend bags packed for a surprise trip',
      category: 'trip',
      estimatedCost: '$$$',
      tags: ['leather', 'travel', 'adventure', 'surprise'],
    },
  ],
  5: [
    {
      id: 'ms5-1',
      title: 'Plant a Tree Together',
      description: 'Symbolize your growing love with a tree that will last decades',
      category: 'activity',
      estimatedCost: '$',
      tags: ['wood', 'traditional', 'nature', 'symbolic'],
    },
    {
      id: 'ms5-2',
      title: 'Wooden Watch Set',
      description: 'Matching wooden watches as a modern yet natural gift',
      category: 'gift',
      estimatedCost: '$$',
      tags: ['wood', 'modern', 'matching', 'daily'],
    },
    {
      id: 'ms5-3',
      title: 'Cabin Retreat',
      description: 'Escape to a cozy wooden cabin in the mountains or forest',
      category: 'trip',
      estimatedCost: '$$$',
      tags: ['wood', 'nature', 'getaway', 'romantic'],
    },
    {
      id: 'ms5-4',
      title: 'Custom Woodworking Class',
      description: 'Learn to make something together that will last',
      category: 'activity',
      estimatedCost: '$$',
      tags: ['wood', 'creative', 'learning', 'handmade'],
    },
  ],
  10: [
    {
      id: 'ms10-1',
      title: 'Diamond Jewelry',
      description: 'A sparkling piece to commemorate a decade of love',
      category: 'gift',
      estimatedCost: '$$$$',
      tags: ['diamond', 'modern', 'jewelry', 'luxury'],
    },
    {
      id: 'ms10-2',
      title: 'Vow Renewal',
      description: 'Renew your commitment with an intimate ceremony',
      category: 'experience',
      estimatedCost: '$$$',
      tags: ['milestone', 'romantic', 'ceremony', 'meaningful'],
    },
    {
      id: 'ms10-3',
      title: 'Dream Destination Trip',
      description: 'Finally take that bucket-list trip you\'ve been planning',
      category: 'trip',
      estimatedCost: '$$$$',
      tags: ['travel', 'adventure', 'bucket-list', 'special'],
    },
    {
      id: 'ms10-4',
      title: 'Memory Time Capsule',
      description: 'Create a tin time capsule to open on your 20th',
      category: 'creative',
      estimatedCost: '$',
      tags: ['tin', 'traditional', 'memories', 'future'],
    },
  ],
  25: [
    {
      id: 'ms25-1',
      title: 'Silver Jewelry',
      description: 'Elegant silver pieces for your Silver Anniversary',
      category: 'gift',
      estimatedCost: '$$$',
      tags: ['silver', 'traditional', 'jewelry', 'elegant'],
    },
    {
      id: 'ms25-2',
      title: 'Grand Celebration Party',
      description: 'Throw a party with family and friends to celebrate 25 years',
      category: 'experience',
      estimatedCost: '$$$',
      tags: ['celebration', 'family', 'milestone', 'party'],
    },
    {
      id: 'ms25-3',
      title: 'Luxury Cruise',
      description: 'Set sail on a romantic cruise adventure',
      category: 'trip',
      estimatedCost: '$$$$',
      tags: ['travel', 'luxury', 'cruise', 'romantic'],
    },
  ],
  50: [
    {
      id: 'ms50-1',
      title: 'Gold Jewelry',
      description: 'Beautiful gold pieces for your Golden Anniversary',
      category: 'gift',
      estimatedCost: '$$$$',
      tags: ['gold', 'traditional', 'jewelry', 'precious'],
    },
    {
      id: 'ms50-2',
      title: 'Family Documentary',
      description: 'Create a video documentary of your 50-year love story',
      category: 'creative',
      estimatedCost: '$$',
      tags: ['memories', 'family', 'documentary', 'legacy'],
    },
    {
      id: 'ms50-3',
      title: 'Golden Anniversary Party',
      description: 'Celebrate with a grand party surrounded by loved ones',
      category: 'experience',
      estimatedCost: '$$$$',
      tags: ['celebration', 'family', 'milestone', 'golden'],
    },
  ],
};

// Generic suggestions for any milestone
export const GENERIC_SUGGESTIONS: MilestoneSuggestion[] = [
  {
    id: 'gen-1',
    title: 'Fancy Dinner Date',
    description: 'Book that restaurant you\'ve been wanting to try',
    category: 'dinner',
    estimatedCost: '$$$',
    tags: ['dinner', 'romantic', 'celebration'],
  },
  {
    id: 'gen-2',
    title: 'Weekend Getaway',
    description: 'Escape for a romantic weekend just the two of you',
    category: 'trip',
    estimatedCost: '$$$',
    tags: ['travel', 'romantic', 'getaway'],
  },
  {
    id: 'gen-3',
    title: 'Couples Spa Day',
    description: 'Relax and reconnect with a day of pampering',
    category: 'relaxation',
    estimatedCost: '$$$',
    tags: ['spa', 'relaxation', 'couples'],
  },
  {
    id: 'gen-4',
    title: 'Stargazing Night',
    description: 'Pack blankets and snacks for a romantic night under the stars',
    category: 'romantic',
    estimatedCost: 'free',
    tags: ['romantic', 'outdoor', 'free', 'intimate'],
  },
  {
    id: 'gen-5',
    title: 'Cook Together',
    description: 'Prepare a special meal together at home',
    category: 'activity',
    estimatedCost: '$',
    tags: ['cooking', 'home', 'intimate', 'fun'],
  },
  {
    id: 'gen-6',
    title: 'Photo Shoot',
    description: 'Book a professional couples photo session',
    category: 'experience',
    estimatedCost: '$$',
    tags: ['photos', 'memories', 'professional'],
  },
];

export function getSuggestionsForMilestone(years: number): MilestoneSuggestion[] {
  const specific = MILESTONE_SUGGESTIONS[years] || [];
  return [...specific, ...GENERIC_SUGGESTIONS];
}

// ============================================================================
// Helper Functions
// ============================================================================

export function calculateYearsAndMonths(originalDate: string): { years: number; months: number; days: number } {
  const start = new Date(originalDate);
  const now = new Date();
  
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  
  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  return { years, months, days };
}

export function getNextAnniversaryDate(anniversary: Anniversary): Date {
  const originalDate = new Date(anniversary.date);
  const now = new Date();
  
  let nextDate = new Date(
    now.getFullYear(),
    originalDate.getMonth(),
    originalDate.getDate()
  );
  
  // If this year's anniversary has passed, get next year's
  if (nextDate < now) {
    nextDate = new Date(
      now.getFullYear() + 1,
      originalDate.getMonth(),
      originalDate.getDate()
    );
  }
  
  return nextDate;
}

export function getDaysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDaysUntil(days: number): string {
  if (days === 0) return 'Today! 🎉';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `In ${days} days`;
  if (days < 14) return 'Next week';
  if (days < 30) return `In ${Math.ceil(days / 7)} weeks`;
  if (days < 60) return 'Next month';
  return `In ${Math.ceil(days / 30)} months`;
}

export function formatMilestone(years: number, months?: number): string {
  if (years === 0 && months) {
    return `${months} month${months > 1 ? 's' : ''}`;
  }
  if (months && months > 0) {
    return `${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''}`;
  }
  return `${years} year${years > 1 ? 's' : ''}`;
}

export function getCostRangeLabel(cost: CostRange): string {
  switch (cost) {
    case 'free': return 'Free';
    case '$': return 'Under $50';
    case '$$': return '$50-150';
    case '$$$': return '$150-500';
    case '$$$$': return '$500+';
    default: return '';
  }
}
