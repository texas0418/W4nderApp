// ============================================================================
// Expense Tracking Types
// ============================================================================

export interface Expense {
  id: string;
  itineraryId?: string;
  activityId?: string;
  activityName?: string;
  
  // Basic info
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  
  // Multi-currency support
  originalAmount?: number;
  originalCurrency?: string;
  exchangeRate?: number;
  convertedAmount?: number; // Amount in base currency
  
  // Timing
  date: string;
  createdAt: string;
  updatedAt?: string;
  
  // Payment info
  paidBy: string; // participant ID
  paidByName: string;
  paymentMethod?: PaymentMethod;
  
  // Split info
  splitType: SplitType;
  splitDetails?: SplitDetails;
  
  // Receipt
  receiptUrl?: string;
  receiptData?: ReceiptOCRData;
  notes?: string;
  
  // Tracking
  isEstimated: boolean;
  estimatedAmount?: number;
}

// ============================================================================
// Receipt OCR Types
// ============================================================================

export interface ReceiptOCRData {
  imageUri: string;
  scannedAt: string;
  confidence: number; // 0-1
  
  // Extracted data
  merchantName?: string;
  merchantAddress?: string;
  date?: string;
  time?: string;
  subtotal?: number;
  tax?: number;
  tip?: number;
  total?: number;
  currency?: string;
  
  // Line items
  items?: ReceiptLineItem[];
  
  // Raw text for debugging
  rawText?: string;
}

export interface ReceiptLineItem {
  description: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice: number;
}

// ============================================================================
// Multi-Currency Types
// ============================================================================

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: string;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
];

export function getCurrencyByCode(code: string): Currency | undefined {
  return SUPPORTED_CURRENCIES.find(c => c.code === code);
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = getCurrencyByCode(currencyCode);
  if (!currency) return `${amount.toFixed(2)} ${currencyCode}`;
  return `${currency.symbol}${amount.toFixed(2)}`;
}

export type ExpenseCategory = 
  | 'dining'
  | 'drinks'
  | 'entertainment'
  | 'transportation'
  | 'tickets'
  | 'accommodation'
  | 'shopping'
  | 'tips'
  | 'parking'
  | 'other';

export type SplitType = 
  | 'equal'        // Split equally among all participants
  | 'percentage'   // Custom percentage split
  | 'exact'        // Exact amounts for each person
  | 'paid_by_one'; // One person covers entirely

export interface SplitDetails {
  participants: SplitParticipant[];
  settlementStatus: 'pending' | 'partial' | 'settled';
}

export interface SplitParticipant {
  id: string;
  name: string;
  owes: number;
  paid: number;
  percentage?: number;
  settled: boolean;
}

// ============================================================================
// Payment Types
// ============================================================================

export type PaymentMethod = 
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'venmo'
  | 'apple_pay'
  | 'google_pay'
  | 'paypal'
  | 'zelle'
  | 'other';

export interface PaymentRequest {
  id: string;
  fromParticipantId: string;
  toParticipantId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'sent' | 'completed' | 'declined';
  expenseIds: string[];
  createdAt: string;
  completedAt?: string;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  note?: string;
}

// ============================================================================
// Budget vs Actual Types
// ============================================================================

export interface BudgetComparison {
  activityId?: string;
  activityName: string;
  category: ExpenseCategory;
  estimated: number;
  actual: number;
  difference: number;
  percentageDiff: number;
  status: 'under' | 'on_track' | 'over';
}

export interface ItineraryBudgetSummary {
  itineraryId: string;
  itineraryName: string;
  
  // Totals
  totalEstimated: number;
  totalActual: number;
  totalDifference: number;
  
  // By category
  byCategory: Record<ExpenseCategory, {
    estimated: number;
    actual: number;
    difference: number;
  }>;
  
  // By activity
  byActivity: BudgetComparison[];
  
  // Status
  overallStatus: 'under' | 'on_track' | 'over';
  percentageUsed: number;
}

// ============================================================================
// Cost Split Settlement Types
// ============================================================================

export interface ParticipantBalance {
  id: string;
  name: string;
  totalPaid: number;
  totalOwed: number;
  netBalance: number; // positive = owed money, negative = owes money
}

export interface Settlement {
  from: {
    id: string;
    name: string;
  };
  to: {
    id: string;
    name: string;
  };
  amount: number;
  currency: string;
}

export interface SplitSummary {
  participants: ParticipantBalance[];
  settlements: Settlement[];
  totalExpenses: number;
  currency: string;
  isSettled: boolean;
}

// ============================================================================
// Savings Goal Types
// ============================================================================

export interface SavingsGoal {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  
  // Target date
  targetDate?: string;
  
  // Linked itinerary (optional)
  linkedItineraryId?: string;
  linkedItineraryName?: string;
  
  // Progress
  percentComplete: number;
  remainingAmount: number;
  
  // Contributions
  contributions: SavingsContribution[];
  
  // Recommendations
  suggestedWeeklyAmount?: number;
  weeksRemaining?: number;
  
  // Status
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  completedAt?: string;
  
  // Visual
  color?: string;
  icon?: string;
}

export interface SavingsContribution {
  id: string;
  amount: number;
  date: string;
  note?: string;
  source?: 'manual' | 'automatic' | 'roundup';
}

// ============================================================================
// Payment App Deep Links
// ============================================================================

export interface PaymentAppConfig {
  id: PaymentMethod;
  name: string;
  icon: string;
  color: string;
  deepLinkScheme?: string;
  webFallback?: string;
  supportsRequest: boolean;
  supportsSend: boolean;
}

export const PAYMENT_APPS: PaymentAppConfig[] = [
  {
    id: 'venmo',
    name: 'Venmo',
    icon: 'venmo',
    color: '#3D95CE',
    deepLinkScheme: 'venmo://paycharge',
    webFallback: 'https://venmo.com/',
    supportsRequest: true,
    supportsSend: true,
  },
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    icon: 'apple',
    color: '#000000',
    supportsRequest: false,
    supportsSend: true,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: 'paypal',
    color: '#003087',
    deepLinkScheme: 'paypal://paypalme/',
    webFallback: 'https://paypal.me/',
    supportsRequest: true,
    supportsSend: true,
  },
  {
    id: 'zelle',
    name: 'Zelle',
    icon: 'zelle',
    color: '#6D1ED4',
    supportsRequest: true,
    supportsSend: true,
  },
  {
    id: 'cash',
    name: 'Cash',
    icon: 'banknotes',
    color: '#22C55E',
    supportsRequest: false,
    supportsSend: false,
  },
];

// ============================================================================
// Category Helpers
// ============================================================================

export const EXPENSE_CATEGORIES: {
  id: ExpenseCategory;
  label: string;
  icon: string;
  color: string;
}[] = [
  { id: 'dining', label: 'Dining', icon: 'utensils', color: '#F59E0B' },
  { id: 'drinks', label: 'Drinks', icon: 'wine', color: '#8B5CF6' },
  { id: 'entertainment', label: 'Entertainment', icon: 'ticket', color: '#EC4899' },
  { id: 'transportation', label: 'Transport', icon: 'car', color: '#3B82F6' },
  { id: 'tickets', label: 'Tickets', icon: 'ticket', color: '#10B981' },
  { id: 'accommodation', label: 'Stay', icon: 'bed', color: '#6366F1' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping-bag', color: '#F43F5E' },
  { id: 'tips', label: 'Tips', icon: 'heart', color: '#14B8A6' },
  { id: 'parking', label: 'Parking', icon: 'car', color: '#64748B' },
  { id: 'other', label: 'Other', icon: 'more-horizontal', color: '#94A3B8' },
];

export function getCategoryConfig(category: ExpenseCategory) {
  return EXPENSE_CATEGORIES.find(c => c.id === category) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
}
