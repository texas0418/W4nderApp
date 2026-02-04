// Milestone Data with Traditional & Modern Gifts
import { Milestone, MilestoneLevel, MilestoneSuggestion, SuggestionCategory, PriceRange } from '../types/anniversary';

// Traditional and Modern Anniversary Milestones
export const ANNIVERSARY_MILESTONES: Milestone[] = [
  {
    years: 1,
    name: 'Paper Anniversary',
    traditionalGift: 'Paper',
    modernGift: 'Clocks',
    level: 'standard',
    description: 'Your first year together - a fresh start worth celebrating!',
  },
  {
    years: 2,
    name: 'Cotton Anniversary',
    traditionalGift: 'Cotton',
    modernGift: 'China',
    level: 'standard',
    description: 'Two years of growing together, comfort and warmth.',
  },
  {
    years: 3,
    name: 'Leather Anniversary',
    traditionalGift: 'Leather',
    modernGift: 'Crystal/Glass',
    level: 'standard',
    description: 'Three years strong - durable and refined.',
  },
  {
    years: 4,
    name: 'Fruit/Flowers Anniversary',
    traditionalGift: 'Fruit/Flowers',
    modernGift: 'Appliances',
    level: 'standard',
    description: 'Four years blooming - beauty and sweetness.',
  },
  {
    years: 5,
    name: 'Wood Anniversary',
    traditionalGift: 'Wood',
    modernGift: 'Silverware',
    level: 'silver',
    description: 'Five years - solid roots and strong foundation!',
  },
  {
    years: 6,
    name: 'Candy/Iron Anniversary',
    traditionalGift: 'Candy/Iron',
    modernGift: 'Wood Objects',
    level: 'standard',
    description: 'Six sweet years of strength together.',
  },
  {
    years: 7,
    name: 'Wool/Copper Anniversary',
    traditionalGift: 'Wool/Copper',
    modernGift: 'Desk Sets',
    level: 'standard',
    description: 'Seven years - warmth and prosperity.',
  },
  {
    years: 8,
    name: 'Pottery/Bronze Anniversary',
    traditionalGift: 'Pottery/Bronze',
    modernGift: 'Linen/Lace',
    level: 'standard',
    description: 'Eight years crafted with care and artistry.',
  },
  {
    years: 9,
    name: 'Pottery/Willow Anniversary',
    traditionalGift: 'Pottery/Willow',
    modernGift: 'Leather',
    level: 'standard',
    description: 'Nine years of flexibility and endurance.',
  },
  {
    years: 10,
    name: 'Tin/Aluminum Anniversary',
    traditionalGift: 'Tin/Aluminum',
    modernGift: 'Diamond Jewelry',
    level: 'gold',
    description: 'A decade of love - a major milestone to celebrate!',
  },
  {
    years: 11,
    name: 'Steel Anniversary',
    traditionalGift: 'Steel',
    modernGift: 'Fashion Jewelry',
    level: 'standard',
    description: 'Eleven years - strength that endures.',
  },
  {
    years: 12,
    name: 'Silk/Linen Anniversary',
    traditionalGift: 'Silk/Linen',
    modernGift: 'Pearls',
    level: 'standard',
    description: 'Twelve years of elegance and comfort.',
  },
  {
    years: 13,
    name: 'Lace Anniversary',
    traditionalGift: 'Lace',
    modernGift: 'Textiles/Furs',
    level: 'standard',
    description: 'Thirteen years - intricate and beautiful.',
  },
  {
    years: 14,
    name: 'Ivory Anniversary',
    traditionalGift: 'Ivory',
    modernGift: 'Gold Jewelry',
    level: 'standard',
    description: 'Fourteen years - timeless and precious.',
  },
  {
    years: 15,
    name: 'Crystal Anniversary',
    traditionalGift: 'Crystal',
    modernGift: 'Watches',
    level: 'gold',
    description: 'Fifteen sparkling years - clarity and brilliance!',
  },
  {
    years: 20,
    name: 'China Anniversary',
    traditionalGift: 'China',
    modernGift: 'Platinum',
    level: 'platinum',
    description: 'Twenty years - two decades of beautiful partnership!',
  },
  {
    years: 25,
    name: 'Silver Anniversary',
    traditionalGift: 'Silver',
    modernGift: 'Sterling Silver',
    level: 'platinum',
    description: 'A quarter century of love - the Silver Jubilee!',
  },
  {
    years: 30,
    name: 'Pearl Anniversary',
    traditionalGift: 'Pearl',
    modernGift: 'Diamond',
    level: 'platinum',
    description: 'Thirty years - rare, precious, and luminous.',
  },
  {
    years: 35,
    name: 'Coral Anniversary',
    traditionalGift: 'Coral',
    modernGift: 'Jade',
    level: 'platinum',
    description: 'Thirty-five years - deep and enduring love.',
  },
  {
    years: 40,
    name: 'Ruby Anniversary',
    traditionalGift: 'Ruby',
    modernGift: 'Ruby',
    level: 'diamond',
    description: 'Forty years of passion - a fiery celebration!',
  },
  {
    years: 45,
    name: 'Sapphire Anniversary',
    traditionalGift: 'Sapphire',
    modernGift: 'Sapphire',
    level: 'diamond',
    description: 'Forty-five years - wisdom and loyalty.',
  },
  {
    years: 50,
    name: 'Golden Anniversary',
    traditionalGift: 'Gold',
    modernGift: 'Gold',
    level: 'diamond',
    description: 'Fifty golden years - the ultimate celebration!',
  },
  {
    years: 55,
    name: 'Emerald Anniversary',
    traditionalGift: 'Emerald',
    modernGift: 'Emerald',
    level: 'diamond',
    description: 'Fifty-five years of renewal and vitality.',
  },
  {
    years: 60,
    name: 'Diamond Anniversary',
    traditionalGift: 'Diamond',
    modernGift: 'Diamond',
    level: 'diamond',
    description: 'Sixty years - unbreakable and eternal!',
  },
];

// Suggestion Templates by Category and Milestone Level
export interface SuggestionTemplate {
  category: SuggestionCategory;
  title: string;
  description: string;
  priceRange: PriceRange;
  tags: string[];
  minLevel: MilestoneLevel;
  imageUrl?: string;
}

const LEVEL_PRIORITY: Record<MilestoneLevel, number> = {
  standard: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
  diamond: 5,
};

export const SUGGESTION_TEMPLATES: SuggestionTemplate[] = [
  // Restaurant Suggestions
  {
    category: 'restaurant',
    title: 'Intimate Dinner for Two',
    description: 'A cozy restaurant with candlelit ambiance perfect for celebrating your special day.',
    priceRange: '$$',
    tags: ['romantic', 'dinner', 'intimate'],
    minLevel: 'standard',
  },
  {
    category: 'restaurant',
    title: 'Fine Dining Experience',
    description: 'Upscale tasting menu at a renowned restaurant with sommelier wine pairings.',
    priceRange: '$$$',
    tags: ['fine dining', 'tasting menu', 'wine'],
    minLevel: 'silver',
  },
  {
    category: 'restaurant',
    title: 'Michelin Star Celebration',
    description: 'Experience culinary excellence at a Michelin-starred restaurant.',
    priceRange: '$$$$',
    tags: ['michelin', 'luxury', 'special occasion'],
    minLevel: 'gold',
  },
  {
    category: 'restaurant',
    title: 'Private Chef Experience',
    description: 'Exclusive multi-course meal prepared by a private chef in your home or venue.',
    priceRange: '$$$$$',
    tags: ['private', 'exclusive', 'personalized'],
    minLevel: 'platinum',
  },

  // Experience Suggestions
  {
    category: 'experience',
    title: 'Couples Cooking Class',
    description: 'Learn to cook a special cuisine together with a professional chef.',
    priceRange: '$$',
    tags: ['cooking', 'interactive', 'fun'],
    minLevel: 'standard',
  },
  {
    category: 'experience',
    title: 'Hot Air Balloon Ride',
    description: 'Soar above scenic landscapes at sunrise or sunset together.',
    priceRange: '$$$',
    tags: ['adventure', 'scenic', 'memorable'],
    minLevel: 'silver',
  },
  {
    category: 'experience',
    title: 'Helicopter Tour & Dinner',
    description: 'Private helicopter tour followed by dinner at an exclusive location.',
    priceRange: '$$$$',
    tags: ['luxury', 'adventure', 'unforgettable'],
    minLevel: 'gold',
  },
  {
    category: 'experience',
    title: 'Yacht Charter Day',
    description: 'Private yacht charter with gourmet catering and champagne.',
    priceRange: '$$$$$',
    tags: ['yacht', 'luxury', 'exclusive'],
    minLevel: 'platinum',
  },

  // Getaway Suggestions
  {
    category: 'getaway',
    title: 'Cozy B&B Weekend',
    description: 'Escape to a charming bed and breakfast for a relaxing weekend.',
    priceRange: '$$',
    tags: ['weekend', 'cozy', 'escape'],
    minLevel: 'standard',
  },
  {
    category: 'getaway',
    title: 'Boutique Hotel Stay',
    description: 'Luxurious boutique hotel with spa amenities and fine dining.',
    priceRange: '$$$',
    tags: ['boutique', 'spa', 'luxury'],
    minLevel: 'silver',
  },
  {
    category: 'getaway',
    title: 'Luxury Resort Retreat',
    description: 'All-inclusive luxury resort with private beach and spa treatments.',
    priceRange: '$$$$',
    tags: ['resort', 'all-inclusive', 'beach'],
    minLevel: 'gold',
  },
  {
    category: 'getaway',
    title: 'Dream Destination Trip',
    description: 'Week-long trip to your dream destination with first-class accommodations.',
    priceRange: '$$$$$',
    tags: ['international', 'dream', 'adventure'],
    minLevel: 'platinum',
  },

  // Spa Suggestions
  {
    category: 'spa',
    title: 'Couples Massage',
    description: 'Relaxing side-by-side massage in a tranquil spa setting.',
    priceRange: '$$',
    tags: ['massage', 'relaxation', 'couples'],
    minLevel: 'standard',
  },
  {
    category: 'spa',
    title: 'Full Spa Day Package',
    description: 'Complete spa day with massage, facial, and wellness treatments.',
    priceRange: '$$$',
    tags: ['spa day', 'wellness', 'pampering'],
    minLevel: 'silver',
  },
  {
    category: 'spa',
    title: 'Luxury Spa Retreat',
    description: 'Multi-day spa retreat with hydrotherapy, treatments, and healthy cuisine.',
    priceRange: '$$$$',
    tags: ['retreat', 'luxury', 'wellness'],
    minLevel: 'gold',
  },

  // Activity Suggestions
  {
    category: 'activity',
    title: 'Sunset Picnic',
    description: 'Curated gourmet picnic basket at a scenic sunset location.',
    priceRange: '$',
    tags: ['picnic', 'sunset', 'romantic'],
    minLevel: 'standard',
  },
  {
    category: 'activity',
    title: 'Wine Tasting Tour',
    description: 'Private tour of local wineries with tastings and vineyard lunch.',
    priceRange: '$$',
    tags: ['wine', 'tour', 'tastings'],
    minLevel: 'standard',
  },
  {
    category: 'activity',
    title: 'Photography Session',
    description: 'Professional couples photoshoot at a beautiful location.',
    priceRange: '$$',
    tags: ['photography', 'memories', 'keepsake'],
    minLevel: 'silver',
  },
  {
    category: 'activity',
    title: 'Private Museum Tour',
    description: 'After-hours private tour of a renowned museum or gallery.',
    priceRange: '$$$',
    tags: ['culture', 'private', 'exclusive'],
    minLevel: 'gold',
  },

  // Entertainment Suggestions
  {
    category: 'entertainment',
    title: 'Live Music Concert',
    description: 'Premium tickets to see your favorite artist or orchestra.',
    priceRange: '$$',
    tags: ['music', 'concert', 'live'],
    minLevel: 'standard',
  },
  {
    category: 'entertainment',
    title: 'Broadway/Theatre Show',
    description: 'Orchestra seats for a hit Broadway or West End production.',
    priceRange: '$$$',
    tags: ['theatre', 'broadway', 'show'],
    minLevel: 'silver',
  },
  {
    category: 'entertainment',
    title: 'VIP Event Package',
    description: 'VIP access to exclusive events with backstage or meet-and-greet.',
    priceRange: '$$$$',
    tags: ['vip', 'exclusive', 'premium'],
    minLevel: 'gold',
  },

  // Gift Suggestions
  {
    category: 'gift',
    title: 'Personalized Gift Box',
    description: 'Curated gift box with personalized items celebrating your journey.',
    priceRange: '$',
    tags: ['personalized', 'thoughtful', 'custom'],
    minLevel: 'standard',
  },
  {
    category: 'gift',
    title: 'Custom Jewelry',
    description: 'Handcrafted jewelry piece with meaningful engraving or design.',
    priceRange: '$$$',
    tags: ['jewelry', 'custom', 'keepsake'],
    minLevel: 'silver',
  },
  {
    category: 'gift',
    title: 'Luxury Watch',
    description: 'Elegant timepiece to mark the passage of your years together.',
    priceRange: '$$$$',
    tags: ['watch', 'luxury', 'timeless'],
    minLevel: 'gold',
  },
  {
    category: 'gift',
    title: 'Designer Piece',
    description: 'Signature item from a renowned designer or luxury brand.',
    priceRange: '$$$$$',
    tags: ['designer', 'luxury', 'statement'],
    minLevel: 'platinum',
  },
];

// Helper to get milestone for a given number of years
export function getMilestoneForYears(years: number): Milestone | undefined {
  // First check for exact match
  const exactMatch = ANNIVERSARY_MILESTONES.find(m => m.years === years);
  if (exactMatch) return exactMatch;
  
  // For non-standard years, return a generic milestone
  if (years > 0) {
    return {
      years,
      name: `${years} Year Anniversary`,
      level: years >= 50 ? 'diamond' : years >= 25 ? 'platinum' : years >= 10 ? 'gold' : years >= 5 ? 'silver' : 'standard',
      description: `Celebrating ${years} wonderful years together!`,
    };
  }
  
  return undefined;
}

// Helper to get suggestions appropriate for milestone level
export function getSuggestionsForMilestone(milestone: Milestone): SuggestionTemplate[] {
  const milestoneLevel = LEVEL_PRIORITY[milestone.level];
  
  return SUGGESTION_TEMPLATES.filter(template => {
    const templateLevel = LEVEL_PRIORITY[template.minLevel];
    return templateLevel <= milestoneLevel;
  });
}

// Get next upcoming milestone
export function getNextMilestone(currentYears: number): Milestone | undefined {
  const sortedMilestones = [...ANNIVERSARY_MILESTONES].sort((a, b) => a.years - b.years);
  return sortedMilestones.find(m => m.years > currentYears);
}

// Get all milestones within a range
export function getMilestonesInRange(startYears: number, endYears: number): Milestone[] {
  return ANNIVERSARY_MILESTONES.filter(m => m.years >= startYears && m.years <= endYears);
}
