// Enhanced Milestone Suggestions with Special Celebration Packages
import { MilestoneLevel, SuggestionCategory, PriceRange } from '../types/anniversary';

// Special milestone years that get enhanced celebration packages
export const SPECIAL_MILESTONE_YEARS = [1, 5, 10, 15, 20, 25, 30, 40, 50, 60];

export interface CelebrationPackage {
  id: string;
  name: string;
  tagline: string;
  description: string;
  milestoneYears: number[];
  priceRange: PriceRange;
  durationDays: number;
  highlights: string[];
  includes: PackageInclusion[];
  themes: string[];
  imageUrl?: string;
  featured: boolean;
}

export interface PackageInclusion {
  category: SuggestionCategory;
  title: string;
  description: string;
}

export interface PersonalizedSuggestion {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: SuggestionCategory;
  priceRange: PriceRange;
  milestoneYears: number[];
  themes: string[];
  emotionalTone: 'romantic' | 'adventurous' | 'relaxing' | 'celebratory' | 'nostalgic';
  bestFor: string[];
  tips: string[];
  imageUrl?: string;
  bookable: boolean;
  estimatedCost?: { min: number; max: number };
}

export interface MilestoneTheme {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  milestoneYears: number[];
}

// Milestone Themes
export const MILESTONE_THEMES: MilestoneTheme[] = [
  {
    id: 'fresh_start',
    name: 'Fresh Beginnings',
    emoji: '🌱',
    description: 'Celebrating the first chapter of your story',
    color: '#7CB342',
    milestoneYears: [1, 2, 3],
  },
  {
    id: 'solid_foundation',
    name: 'Solid Foundation',
    emoji: '🏛️',
    description: 'Building something lasting together',
    color: '#8D6E63',
    milestoneYears: [4, 5, 6, 7],
  },
  {
    id: 'golden_moments',
    name: 'Golden Moments',
    emoji: '✨',
    description: 'A decade of memories worth treasuring',
    color: '#FFB300',
    milestoneYears: [10, 15],
  },
  {
    id: 'silver_celebration',
    name: 'Silver Celebration',
    emoji: '🪙',
    description: 'A quarter century of love and partnership',
    color: '#90A4AE',
    milestoneYears: [20, 25],
  },
  {
    id: 'timeless_love',
    name: 'Timeless Love',
    emoji: '💎',
    description: 'A legacy of enduring devotion',
    color: '#7E57C2',
    milestoneYears: [30, 40, 50, 60],
  },
];

// Celebration Packages for Special Milestones
export const CELEBRATION_PACKAGES: CelebrationPackage[] = [
  // 1 Year - Paper Anniversary
  {
    id: 'paper_romance',
    name: 'Paper Romance Package',
    tagline: 'Write your first chapter together',
    description: 'Celebrate your first year with experiences that create lasting memories and meaningful keepsakes.',
    milestoneYears: [1],
    priceRange: '$$',
    durationDays: 2,
    highlights: [
      'Handwritten love letter workshop',
      'Custom photo book creation',
      'Romantic dinner with paper origami decor',
    ],
    includes: [
      { category: 'activity', title: 'Calligraphy Workshop', description: 'Learn beautiful handwriting together and create love letters' },
      { category: 'restaurant', title: 'Intimate Anniversary Dinner', description: 'Cozy restaurant with custom menu featuring your story' },
      { category: 'gift', title: 'Custom Photo Book', description: 'Professionally designed book of your first year together' },
    ],
    themes: ['romantic', 'creative', 'memorable'],
    featured: true,
  },
  {
    id: 'adventure_year_one',
    name: 'Adventure Starter',
    tagline: 'Your journey begins here',
    description: 'Kick off your adventure as a couple with an exciting experience that sets the tone for years to come.',
    milestoneYears: [1],
    priceRange: '$$',
    durationDays: 1,
    highlights: [
      'Sunrise hot air balloon ride',
      'Champagne brunch',
      'Couples photography session',
    ],
    includes: [
      { category: 'experience', title: 'Hot Air Balloon at Dawn', description: 'Float above scenic landscapes as the sun rises' },
      { category: 'restaurant', title: 'Champagne Brunch', description: 'Celebratory meal after your flight' },
      { category: 'activity', title: 'Photo Session', description: 'Professional photos capturing your milestone' },
    ],
    themes: ['adventurous', 'bucket-list', 'photogenic'],
    featured: false,
  },

  // 5 Years - Wood Anniversary
  {
    id: 'rooted_in_love',
    name: 'Rooted in Love Retreat',
    tagline: 'Five years of growing together',
    description: 'Celebrate your solid foundation with a nature-inspired retreat that honors your journey.',
    milestoneYears: [5],
    priceRange: '$$$',
    durationDays: 3,
    highlights: [
      'Treehouse or cabin getaway',
      'Couples tree planting ceremony',
      'Woodworking class together',
      'Forest spa treatments',
    ],
    includes: [
      { category: 'getaway', title: 'Luxury Treehouse Stay', description: '2-night stay in a stunning treehouse or forest cabin' },
      { category: 'activity', title: 'Tree Planting Ceremony', description: 'Plant a tree together that will grow with your love' },
      { category: 'experience', title: 'Woodworking Workshop', description: 'Create matching wooden keepsakes together' },
      { category: 'spa', title: 'Forest Bathing & Massage', description: 'Nature-inspired wellness experience' },
    ],
    themes: ['nature', 'growth', 'wellness'],
    featured: true,
  },

  // 10 Years - Tin/Diamond Anniversary
  {
    id: 'decade_of_love',
    name: 'Decade of Love Experience',
    tagline: 'Ten years, countless memories',
    description: 'A milestone decade deserves an extraordinary celebration that reflects your enduring bond.',
    milestoneYears: [10],
    priceRange: '$$$$',
    durationDays: 4,
    highlights: [
      'Luxury resort weekend',
      'Recreate your first date',
      'Diamond jewelry shopping experience',
      'Private dinner under the stars',
    ],
    includes: [
      { category: 'getaway', title: 'Luxury Resort Stay', description: '3-night stay at a 5-star resort with spa access' },
      { category: 'restaurant', title: 'First Date Recreation', description: 'Revisit or recreate your first date with upgrades' },
      { category: 'gift', title: 'Diamond Shopping Experience', description: 'VIP jewelry consultation and selection' },
      { category: 'restaurant', title: 'Private Starlight Dinner', description: 'Exclusive dining under the stars with private chef' },
    ],
    themes: ['luxury', 'nostalgia', 'celebration'],
    featured: true,
  },

  // 15 Years - Crystal Anniversary
  {
    id: 'crystal_clear_love',
    name: 'Crystal Clear Connection',
    tagline: 'Fifteen years of clarity and light',
    description: 'Celebrate the crystal anniversary with experiences that sparkle and shine like your love.',
    milestoneYears: [15],
    priceRange: '$$$',
    durationDays: 3,
    highlights: [
      'Crystal meditation and healing session',
      'Fine dining with crystal glassware making',
      'Scenic helicopter tour',
    ],
    includes: [
      { category: 'spa', title: 'Crystal Healing Retreat', description: 'Wellness experience featuring crystal therapy' },
      { category: 'experience', title: 'Glassblowing Workshop', description: 'Create custom crystal keepsakes together' },
      { category: 'experience', title: 'Helicopter Scenic Tour', description: 'See the world from new heights together' },
      { category: 'restaurant', title: 'Elegant Crystal Dinner', description: 'Multi-course dinner with crystal glassware to keep' },
    ],
    themes: ['wellness', 'artisan', 'scenic'],
    featured: false,
  },

  // 20 Years - China Anniversary
  {
    id: 'porcelain_elegance',
    name: 'Elegant Traditions',
    tagline: 'Two decades of refined love',
    description: 'Honor twenty years with experiences that blend tradition, elegance, and timeless beauty.',
    milestoneYears: [20],
    priceRange: '$$$$',
    durationDays: 4,
    highlights: [
      'Cultural immersion experience',
      'Fine china painting class',
      'Tea ceremony',
      'Gourmet dining journey',
    ],
    includes: [
      { category: 'getaway', title: 'Boutique Hotel Stay', description: 'Elegant 3-night stay at a historic property' },
      { category: 'activity', title: 'Pottery Painting Class', description: 'Create custom china pieces together' },
      { category: 'experience', title: 'Private Tea Ceremony', description: 'Traditional ceremony with tea master' },
      { category: 'restaurant', title: 'Culinary Journey', description: 'Multi-restaurant tasting tour' },
    ],
    themes: ['cultural', 'elegant', 'traditional'],
    featured: false,
  },

  // 25 Years - Silver Anniversary
  {
    id: 'silver_jubilee',
    name: 'Silver Jubilee Celebration',
    tagline: 'A quarter century of love',
    description: 'The silver anniversary calls for a grand celebration befitting 25 years of partnership.',
    milestoneYears: [25],
    priceRange: '$$$$$',
    durationDays: 7,
    highlights: [
      'Week-long luxury destination trip',
      'Vow renewal ceremony',
      'Silver jewelry commissioning',
      'Private villa experience',
    ],
    includes: [
      { category: 'getaway', title: 'Dream Destination Week', description: 'Private villa for 6 nights at your dream location' },
      { category: 'experience', title: 'Vow Renewal Ceremony', description: 'Intimate ceremony with professional coordination' },
      { category: 'gift', title: 'Custom Silver Jewelry', description: 'Commission matching silver pieces' },
      { category: 'restaurant', title: 'Daily Gourmet Dining', description: 'Chef-prepared meals throughout your stay' },
      { category: 'spa', title: 'Couples Spa Day', description: 'Full day of pampering treatments' },
    ],
    themes: ['luxury', 'destination', 'renewal'],
    featured: true,
  },

  // 30 Years - Pearl Anniversary
  {
    id: 'pearl_perfection',
    name: 'Pearl of the Ocean',
    tagline: 'Thirty years of precious love',
    description: 'Like pearls formed over time, your love has become something rare and beautiful.',
    milestoneYears: [30],
    priceRange: '$$$$$',
    durationDays: 5,
    highlights: [
      'Coastal luxury retreat',
      'Pearl diving or farm experience',
      'Sunset yacht cruise',
      'Oceanside fine dining',
    ],
    includes: [
      { category: 'getaway', title: 'Oceanfront Suite', description: '4-night stay in luxury oceanfront accommodation' },
      { category: 'experience', title: 'Pearl Experience', description: 'Visit a pearl farm and select your own pearl' },
      { category: 'experience', title: 'Private Yacht Cruise', description: 'Sunset cruise with champagne and appetizers' },
      { category: 'restaurant', title: 'Oceanside Chef\'s Table', description: 'Multi-course seafood feast by the water' },
    ],
    themes: ['coastal', 'luxury', 'nautical'],
    featured: false,
  },

  // 40 Years - Ruby Anniversary
  {
    id: 'ruby_passion',
    name: 'Ruby Red Romance',
    tagline: 'Forty years of passion',
    description: 'The ruby anniversary celebrates the deep, passionate love that has endured for four decades.',
    milestoneYears: [40],
    priceRange: '$$$$$',
    durationDays: 7,
    highlights: [
      'Wine country escape',
      'Ruby jewelry experience',
      'Hot springs retreat',
      'Memory lane celebration dinner',
    ],
    includes: [
      { category: 'getaway', title: 'Wine Country Estate', description: '6-night stay at a private vineyard estate' },
      { category: 'gift', title: 'Ruby Selection Experience', description: 'VIP session with gemologist to select rubies' },
      { category: 'spa', title: 'Hot Springs Retreat', description: 'Rejuvenating thermal spa experience' },
      { category: 'restaurant', title: 'Memory Lane Dinner', description: 'Dinner recreating your favorite meals over 40 years' },
    ],
    themes: ['wine', 'passion', 'legacy'],
    featured: true,
  },

  // 50 Years - Golden Anniversary
  {
    id: 'golden_legacy',
    name: 'Golden Legacy Experience',
    tagline: 'Fifty golden years',
    description: 'Half a century of love is a remarkable achievement. Celebrate with an experience as precious as gold.',
    milestoneYears: [50],
    priceRange: '$$$$$',
    durationDays: 10,
    highlights: [
      'Multi-generational celebration',
      'Luxury world destination',
      'Documentary of your love story',
      'Golden keepsake creation',
    ],
    includes: [
      { category: 'getaway', title: 'Bucket List Destination', description: '8-night stay at world-class destination' },
      { category: 'experience', title: 'Family Celebration Event', description: 'Coordinated celebration with loved ones' },
      { category: 'activity', title: 'Love Story Documentary', description: 'Professional video documenting your 50 years' },
      { category: 'gift', title: 'Custom Gold Keepsakes', description: 'Handcrafted gold items celebrating your journey' },
      { category: 'restaurant', title: 'Private Celebration Dinner', description: 'Grand dinner for family and friends' },
    ],
    themes: ['legacy', 'family', 'once-in-a-lifetime'],
    featured: true,
  },
];

// Personalized Suggestions by Year
export const PERSONALIZED_SUGGESTIONS: PersonalizedSuggestion[] = [
  // Universal suggestions that work for any milestone
  {
    id: 'memory_scrapbook',
    title: 'Memory Lane Scrapbook Experience',
    subtitle: 'Document your journey together',
    description: 'Spend an afternoon creating a beautiful scrapbook featuring photos and mementos from your years together.',
    category: 'activity',
    priceRange: '$',
    milestoneYears: [1, 2, 3, 4, 5, 10, 15, 20, 25],
    themes: ['nostalgic', 'creative', 'intimate'],
    emotionalTone: 'nostalgic',
    bestFor: ['Creative couples', 'Memory collectors', 'Detail-oriented pairs'],
    tips: [
      'Gather photos in advance for a surprise reveal',
      'Include ticket stubs, receipts, and small keepsakes',
      'Add handwritten notes about favorite memories',
    ],
    bookable: false,
  },
  {
    id: 'sunrise_ceremony',
    title: 'Sunrise Commitment Ceremony',
    subtitle: 'Start fresh with the dawn',
    description: 'A private, intimate ceremony at sunrise to reaffirm your love and commitment as you enter a new year together.',
    category: 'experience',
    priceRange: '$$',
    milestoneYears: [1, 5, 10, 15, 20, 25, 30, 40, 50],
    themes: ['spiritual', 'intimate', 'meaningful'],
    emotionalTone: 'romantic',
    bestFor: ['Spiritual couples', 'Early risers', 'Those seeking renewal'],
    tips: [
      'Choose a meaningful location',
      'Write personal vows to share',
      'Bring something to exchange as a symbol',
    ],
    bookable: true,
    estimatedCost: { min: 150, max: 500 },
  },
  {
    id: 'cooking_heritage',
    title: 'Heritage Cooking Experience',
    subtitle: 'Cook the dishes that define you',
    description: 'Learn to prepare meaningful dishes from your family heritage or from places you\'ve traveled together.',
    category: 'experience',
    priceRange: '$$',
    milestoneYears: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    themes: ['cultural', 'culinary', 'bonding'],
    emotionalTone: 'nostalgic',
    bestFor: ['Foodies', 'Culture enthusiasts', 'Those with travel memories'],
    tips: [
      'Request recipes that have meaning to your relationship',
      'Take photos to recreate at home',
      'Ask for a certificate of completion',
    ],
    bookable: true,
    estimatedCost: { min: 100, max: 300 },
  },

  // Year 1 specific
  {
    id: 'paper_airplane',
    title: 'Paper Airplane Date Night',
    subtitle: 'Whimsical celebration of year one',
    description: 'A playful evening making paper airplanes with messages, releasing them from a scenic spot, followed by intimate dinner.',
    category: 'activity',
    priceRange: '$',
    milestoneYears: [1],
    themes: ['playful', 'paper', 'whimsical'],
    emotionalTone: 'celebratory',
    bestFor: ['Playful couples', 'Young at heart', 'Budget-conscious'],
    tips: [
      'Write wishes for your future on each plane',
      'Choose a hilltop or scenic overlook',
      'Bring hot chocolate or champagne',
    ],
    bookable: false,
  },

  // Year 5 specific
  {
    id: 'wood_carving',
    title: 'Couple\'s Wood Carving Workshop',
    subtitle: 'Craft something lasting together',
    description: 'Learn the art of woodworking and create matching wooden items - bowls, cutting boards, or decorative pieces.',
    category: 'experience',
    priceRange: '$$',
    milestoneYears: [5],
    themes: ['wood', 'artisan', 'handcrafted'],
    emotionalTone: 'celebratory',
    bestFor: ['DIY couples', 'Nature lovers', 'Those who appreciate handcrafted items'],
    tips: [
      'Choose something functional you\'ll use daily',
      'Take progress photos',
      'Have the date engraved on your pieces',
    ],
    bookable: true,
    estimatedCost: { min: 150, max: 400 },
  },

  // Year 10 specific
  {
    id: 'decade_documentary',
    title: 'Your Love Story Documentary',
    subtitle: 'Ten years captured on film',
    description: 'Work with a videographer to create a short documentary featuring interviews, photos, and footage of your decade together.',
    category: 'experience',
    priceRange: '$$$',
    milestoneYears: [10],
    themes: ['memorable', 'keepsake', 'storytelling'],
    emotionalTone: 'nostalgic',
    bestFor: ['Storytellers', 'Memory keepers', 'Those with rich photo archives'],
    tips: [
      'Gather digital and physical photos in advance',
      'Ask family and friends for surprise video messages',
      'Include footage from meaningful locations',
    ],
    bookable: true,
    estimatedCost: { min: 500, max: 2000 },
  },
  {
    id: 'tin_time_capsule',
    title: 'Time Capsule Ceremony',
    subtitle: 'Messages to your future selves',
    description: 'Create a beautifully decorated tin time capsule with letters, photos, and predictions to open on your 20th anniversary.',
    category: 'activity',
    priceRange: '$',
    milestoneYears: [10],
    themes: ['tin', 'future', 'meaningful'],
    emotionalTone: 'romantic',
    bestFor: ['Romantics', 'Future-focused couples', 'Tradition builders'],
    tips: [
      'Include predictions about your life',
      'Add current newspaper clippings',
      'Store somewhere safe with a calendar reminder',
    ],
    bookable: false,
  },

  // Year 25 specific
  {
    id: 'silver_anniversary_portrait',
    title: 'Legacy Portrait Session',
    subtitle: 'A portrait for the ages',
    description: 'Commission a professional portrait - painted, photographed, or illustrated - that captures your love at 25 years.',
    category: 'activity',
    priceRange: '$$$',
    milestoneYears: [25],
    themes: ['silver', 'legacy', 'artistic'],
    emotionalTone: 'celebratory',
    bestFor: ['Art appreciators', 'Tradition lovers', 'Those building family legacy'],
    tips: [
      'Consider your home décor when choosing style',
      'Review artist portfolios carefully',
      'Plan outfits that will be timeless',
    ],
    bookable: true,
    estimatedCost: { min: 500, max: 5000 },
  },

  // Year 50 specific
  {
    id: 'golden_gathering',
    title: 'Golden Anniversary Gala',
    subtitle: 'Fifty years celebrated in style',
    description: 'Host an elegant celebration bringing together family and friends to honor your remarkable 50-year journey.',
    category: 'entertainment',
    priceRange: '$$$$',
    milestoneYears: [50],
    themes: ['gold', 'celebration', 'family'],
    emotionalTone: 'celebratory',
    bestFor: ['Social couples', 'Family-oriented pairs', 'Those with large networks'],
    tips: [
      'Start planning 6-12 months ahead',
      'Request photos from guests for a slideshow',
      'Consider a surprise element from children/grandchildren',
    ],
    bookable: true,
    estimatedCost: { min: 3000, max: 20000 },
  },
];

// Gift Ideas by Milestone Theme
export interface GiftIdea {
  id: string;
  name: string;
  description: string;
  traditionalTie: string;
  priceRange: PriceRange;
  milestoneYears: number[];
  personalizable: boolean;
  whereToFind: string;
}

export const GIFT_IDEAS: GiftIdea[] = [
  // Year 1 - Paper
  { id: 'love_letters_book', name: 'Custom Love Letters Book', description: 'Professionally bound collection of letters you\'ve written to each other', traditionalTie: 'Paper', priceRange: '$$', milestoneYears: [1], personalizable: true, whereToFind: 'Etsy, local bookbinders' },
  { id: 'concert_tickets', name: 'Concert Tickets', description: 'Tickets (paper!) to see a favorite artist together', traditionalTie: 'Paper', priceRange: '$$', milestoneYears: [1], personalizable: false, whereToFind: 'Ticketmaster, venue websites' },
  { id: 'custom_map', name: 'Custom Star Map or Location Map', description: 'Map of stars on your wedding day or map showing meaningful locations', traditionalTie: 'Paper', priceRange: '$', milestoneYears: [1], personalizable: true, whereToFind: 'The Night Sky, Mapiful' },

  // Year 5 - Wood
  { id: 'wooden_watch', name: 'Matching Wooden Watches', description: 'Elegant timepieces crafted from wood', traditionalTie: 'Wood', priceRange: '$$$', milestoneYears: [5], personalizable: true, whereToFind: 'WeWood, Jord' },
  { id: 'cutting_board', name: 'Engraved Cutting Board', description: 'Custom cutting board with your names and date', traditionalTie: 'Wood', priceRange: '$$', milestoneYears: [5], personalizable: true, whereToFind: 'Etsy, Williams Sonoma' },
  { id: 'tree_planting', name: 'Tree Planting Gift', description: 'Plant a tree in a meaningful location or forest', traditionalTie: 'Wood', priceRange: '$', milestoneYears: [5], personalizable: true, whereToFind: 'One Tree Planted, Arbor Day Foundation' },

  // Year 10 - Tin/Diamond
  { id: 'diamond_jewelry', name: 'Diamond Accent Jewelry', description: 'Ring, necklace, or earrings with diamond accents', traditionalTie: 'Diamond (modern)', priceRange: '$$$$', milestoneYears: [10], personalizable: true, whereToFind: 'Local jewelers, Blue Nile' },
  { id: 'tin_anniversary_box', name: 'Vintage Tin Keepsake Box', description: 'Antique or custom tin box to store memories', traditionalTie: 'Tin', priceRange: '$', milestoneYears: [10], personalizable: true, whereToFind: 'Antique shops, Etsy' },

  // Year 25 - Silver
  { id: 'silver_rings', name: 'Matching Silver Bands', description: 'Complementary silver rings to wear alongside wedding bands', traditionalTie: 'Silver', priceRange: '$$$', milestoneYears: [25], personalizable: true, whereToFind: 'Tiffany, local silversmiths' },
  { id: 'silver_frame', name: 'Sterling Silver Photo Frame', description: 'Frame for wedding photo or milestone portrait', traditionalTie: 'Silver', priceRange: '$$', milestoneYears: [25], personalizable: true, whereToFind: 'Reed & Barton, Things Remembered' },

  // Year 50 - Gold
  { id: 'gold_pendant', name: 'Custom Gold Pendant', description: 'Meaningful design crafted in gold', traditionalTie: 'Gold', priceRange: '$$$$$', milestoneYears: [50], personalizable: true, whereToFind: 'Custom jewelers' },
  { id: 'golden_experience', name: 'Golden Experience Fund', description: 'Fund for an unforgettable trip or experience', traditionalTie: 'Gold', priceRange: '$$$$$', milestoneYears: [50], personalizable: false, whereToFind: 'Travel agencies' },
];

// Helper functions
export function getPackagesForMilestone(years: number): CelebrationPackage[] {
  return CELEBRATION_PACKAGES.filter(p => p.milestoneYears.includes(years));
}

export function getSuggestionsForMilestone(years: number): PersonalizedSuggestion[] {
  return PERSONALIZED_SUGGESTIONS.filter(s => s.milestoneYears.includes(years));
}

export function getGiftIdeasForMilestone(years: number): GiftIdea[] {
  return GIFT_IDEAS.filter(g => g.milestoneYears.includes(years));
}

export function getThemeForMilestone(years: number): MilestoneTheme | undefined {
  return MILESTONE_THEMES.find(t => t.milestoneYears.includes(years));
}

export function isSpecialMilestone(years: number): boolean {
  return SPECIAL_MILESTONE_YEARS.includes(years);
}

export function getNextSpecialMilestone(currentYears: number): number | undefined {
  return SPECIAL_MILESTONE_YEARS.find(y => y > currentYears);
}

export function getMilestoneCountdown(currentYears: number): { years: number; yearsUntil: number } | undefined {
  const next = getNextSpecialMilestone(currentYears);
  if (next) {
    return { years: next, yearsUntil: next - currentYears };
  }
  return undefined;
}
