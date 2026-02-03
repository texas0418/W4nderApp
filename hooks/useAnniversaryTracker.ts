// ============================================================================
// useAnniversaryTracker Hook
// Manages anniversaries, milestones, and celebration suggestions
// ============================================================================

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Anniversary,
  AnniversaryType,
  Milestone,
  MilestoneSuggestion,
  UpcomingAnniversary,
  ReminderSetting,
  getAnniversaryTypeConfig,
  getAnniversaryGifts,
  getSuggestionsForMilestone,
  calculateYearsAndMonths,
  getNextAnniversaryDate,
  getDaysUntil,
  ANNIVERSARY_GIFTS,
} from '@/types/anniversary';

const STORAGE_KEY = '@w4nder/anniversaries';

export function useAnniversaryTracker() {
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load anniversaries on mount
  useEffect(() => {
    loadAnniversaries();
  }, []);

  const loadAnniversaries = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setAnniversaries(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load anniversaries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnniversaries = async (data: Anniversary[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setAnniversaries(data);
    } catch (error) {
      console.error('Failed to save anniversaries:', error);
    }
  };

  // ============================================================================
  // CRUD Operations
  // ============================================================================

  const addAnniversary = useCallback(async (data: {
    name: string;
    date: string;
    type: AnniversaryType;
    partnerName?: string;
    emoji?: string;
    notes?: string;
    reminders?: ReminderSetting[];
  }): Promise<Anniversary> => {
    const typeConfig = getAnniversaryTypeConfig(data.type);
    const originalYear = new Date(data.date).getFullYear();

    const newAnniversary: Anniversary = {
      id: `ann_${Date.now()}`,
      name: data.name || typeConfig.defaultName,
      date: data.date,
      originalYear,
      type: data.type,
      recurring: true,
      frequency: 'yearly',
      partnerName: data.partnerName,
      emoji: data.emoji || typeConfig.emoji,
      color: typeConfig.color,
      notes: data.notes,
      reminders: data.reminders || [
        { id: 'r1', daysBefore: 7, time: '09:00', enabled: true },
        { id: 'r2', daysBefore: 1, time: '09:00', enabled: true },
      ],
      celebratedYears: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...anniversaries, newAnniversary];
    await saveAnniversaries(updated);
    return newAnniversary;
  }, [anniversaries]);

  const updateAnniversary = useCallback(async (
    id: string,
    updates: Partial<Omit<Anniversary, 'id' | 'createdAt'>>
  ): Promise<Anniversary | null> => {
    const index = anniversaries.findIndex(a => a.id === id);
    if (index === -1) return null;

    const updated = [...anniversaries];
    updated[index] = {
      ...updated[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await saveAnniversaries(updated);
    return updated[index];
  }, [anniversaries]);

  const deleteAnniversary = useCallback(async (id: string) => {
    const updated = anniversaries.filter(a => a.id !== id);
    await saveAnniversaries(updated);
  }, [anniversaries]);

  const markCelebrated = useCallback(async (id: string, year?: number) => {
    const targetYear = year || new Date().getFullYear();
    const anniversary = anniversaries.find(a => a.id === id);
    
    if (!anniversary) return;
    
    const celebratedYears = anniversary.celebratedYears.includes(targetYear)
      ? anniversary.celebratedYears
      : [...anniversary.celebratedYears, targetYear];

    await updateAnniversary(id, { celebratedYears });
  }, [anniversaries, updateAnniversary]);

  // ============================================================================
  // Computed Data
  // ============================================================================

  const upcomingAnniversaries = useMemo((): UpcomingAnniversary[] => {
    const now = new Date();
    
    return anniversaries
      .map(anniversary => {
        const nextDate = getNextAnniversaryDate(anniversary);
        const daysUntil = getDaysUntil(nextDate);
        const { years } = calculateYearsAndMonths(anniversary.date);
        
        // Calculate what year this will be
        const yearsTotal = nextDate.getFullYear() - anniversary.originalYear;
        
        // Get milestone info
        const giftInfo = getAnniversaryGifts(yearsTotal);
        const milestone: Milestone | null = giftInfo ? {
          id: `milestone_${anniversary.id}_${yearsTotal}`,
          anniversaryId: anniversary.id,
          years: yearsTotal,
          name: `${yearsTotal} Year Anniversary`,
          traditionalGift: giftInfo.traditional,
          modernGift: giftInfo.modern,
          suggestions: getSuggestionsForMilestone(yearsTotal),
          achieved: anniversary.celebratedYears.includes(nextDate.getFullYear()),
        } : null;

        return {
          anniversary,
          milestone,
          daysUntil,
          date: nextDate,
          yearsTotal,
          isToday: daysUntil === 0,
          isThisWeek: daysUntil >= 0 && daysUntil <= 7,
          isThisMonth: daysUntil >= 0 && daysUntil <= 30,
        };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [anniversaries]);

  const todayAnniversaries = useMemo(() => 
    upcomingAnniversaries.filter(a => a.isToday),
  [upcomingAnniversaries]);

  const thisWeekAnniversaries = useMemo(() => 
    upcomingAnniversaries.filter(a => a.isThisWeek && !a.isToday),
  [upcomingAnniversaries]);

  const thisMonthAnniversaries = useMemo(() => 
    upcomingAnniversaries.filter(a => a.isThisMonth && !a.isThisWeek),
  [upcomingAnniversaries]);

  // ============================================================================
  // Suggestions
  // ============================================================================

  const getSuggestionsForAnniversary = useCallback((
    anniversaryId: string,
    options?: {
      category?: string;
      maxCost?: string;
      limit?: number;
    }
  ): MilestoneSuggestion[] => {
    const upcoming = upcomingAnniversaries.find(
      u => u.anniversary.id === anniversaryId
    );
    
    if (!upcoming) return [];
    
    let suggestions = getSuggestionsForMilestone(upcoming.yearsTotal);
    
    // Filter by category
    if (options?.category) {
      suggestions = suggestions.filter(s => s.category === options.category);
    }
    
    // Filter by cost
    if (options?.maxCost) {
      const costOrder = ['free', '$', '$$', '$$$', '$$$$'];
      const maxIndex = costOrder.indexOf(options.maxCost);
      suggestions = suggestions.filter(s => 
        costOrder.indexOf(s.estimatedCost) <= maxIndex
      );
    }
    
    // Limit results
    if (options?.limit) {
      suggestions = suggestions.slice(0, options.limit);
    }
    
    return suggestions;
  }, [upcomingAnniversaries]);

  const getGiftSuggestions = useCallback((years: number) => {
    const giftInfo = getAnniversaryGifts(years);
    return {
      traditional: giftInfo?.traditional,
      modern: giftInfo?.modern,
      flower: giftInfo?.flower,
      gemstone: giftInfo?.gemstone,
    };
  }, []);

  // ============================================================================
  // Quick Add Templates
  // ============================================================================

  const quickAddFirstDate = useCallback(async (date: string, partnerName?: string) => {
    return addAnniversary({
      name: `First Date with ${partnerName || 'Partner'}`,
      date,
      type: 'first_date',
      partnerName,
    });
  }, [addAnniversary]);

  const quickAddRelationship = useCallback(async (date: string, partnerName?: string) => {
    return addAnniversary({
      name: 'Dating Anniversary',
      date,
      type: 'relationship',
      partnerName,
    });
  }, [addAnniversary]);

  const quickAddWedding = useCallback(async (date: string, partnerName?: string) => {
    return addAnniversary({
      name: 'Wedding Anniversary',
      date,
      type: 'wedding',
      partnerName,
    });
  }, [addAnniversary]);

  // ============================================================================
  // Statistics
  // ============================================================================

  const stats = useMemo(() => {
    const totalAnniversaries = anniversaries.length;
    const upcomingThisMonth = thisMonthAnniversaries.length + thisWeekAnniversaries.length + todayAnniversaries.length;
    
    // Find longest relationship
    let longestRelationship: { anniversary: Anniversary; years: number } | null = null;
    anniversaries.forEach(ann => {
      const { years } = calculateYearsAndMonths(ann.date);
      if (!longestRelationship || years > longestRelationship.years) {
        longestRelationship = { anniversary: ann, years };
      }
    });

    // Find next anniversary
    const nextAnniversary = upcomingAnniversaries[0] || null;

    return {
      totalAnniversaries,
      upcomingThisMonth,
      longestRelationship,
      nextAnniversary,
    };
  }, [anniversaries, upcomingAnniversaries, thisMonthAnniversaries, thisWeekAnniversaries, todayAnniversaries]);

  return {
    // State
    anniversaries,
    isLoading,
    
    // CRUD
    addAnniversary,
    updateAnniversary,
    deleteAnniversary,
    markCelebrated,
    
    // Computed
    upcomingAnniversaries,
    todayAnniversaries,
    thisWeekAnniversaries,
    thisMonthAnniversaries,
    
    // Suggestions
    getSuggestionsForAnniversary,
    getGiftSuggestions,
    
    // Quick add
    quickAddFirstDate,
    quickAddRelationship,
    quickAddWedding,
    
    // Stats
    stats,
    
    // Refresh
    refresh: loadAnniversaries,
  };
}
