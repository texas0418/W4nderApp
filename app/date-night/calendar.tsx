import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Heart,
  Plus,
  Sparkles,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useDateNight } from '@/contexts/DateNightContext';
import { DateItinerary } from '@/types/date-night';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAY_WIDTH = (SCREEN_WIDTH - 40 - 12) / 7;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  itineraries: DateItinerary[];
}

export default function CalendarScreen() {
  const router = useRouter();
  const { itineraries } = useDateNight();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Define getItinerariesForDate BEFORE using it in useMemo
  const getItinerariesForDate = useCallback(
    (date: Date): DateItinerary[] => {
      return itineraries.filter((itinerary) => {
        const itineraryDate = new Date(itinerary.date);
        return (
          itineraryDate.getFullYear() === date.getFullYear() &&
          itineraryDate.getMonth() === date.getMonth() &&
          itineraryDate.getDate() === date.getDate()
        );
      });
    },
    [itineraries]
  );

  // Generate calendar days for current month view
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month days
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthDays - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        itineraries: getItinerariesForDate(date),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      date.setHours(0, 0, 0, 0);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        itineraries: getItinerariesForDate(date),
      });
    }

    // Next month days (to complete the grid)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        itineraries: getItinerariesForDate(date),
      });
    }

    return days;
  }, [currentDate, getItinerariesForDate]);

  const selectedDateItineraries = useMemo(() => {
    if (!selectedDate) return [];
    return getItinerariesForDate(selectedDate);
  }, [selectedDate, getItinerariesForDate]);

  const goToPreviousMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleDayPress = (day: CalendarDay) => {
    setSelectedDate(day.date);
  };

  const formatSelectedDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);

    const diffTime = selected.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.error;
      case 'draft':
        return colors.textTertiary;
      default:
        return colors.secondary;
    }
  };

  const getStatusDotColor = (dayItineraries: DateItinerary[]) => {
    if (dayItineraries.length === 0) return null;
    const hasPlanned = dayItineraries.some((i) => i.status === 'planned');
    const hasCompleted = dayItineraries.some((i) => i.status === 'completed');
    const hasDraft = dayItineraries.some((i) => i.status === 'draft');

    if (hasPlanned) return colors.secondary;
    if (hasCompleted) return colors.success;
    if (hasDraft) return colors.textTertiary;
    return colors.secondary;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.secondary, colors.secondaryLight]}
        style={styles.headerGradient}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={colors.textLight} />
          </Pressable>
          <Text style={styles.headerTitle}>Date Calendar</Text>
          <Pressable style={styles.todayButton} onPress={goToToday}>
            <Text style={styles.todayButtonText}>Today</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* Month Navigation */}
          <View style={styles.monthNavigation}>
            <Pressable style={styles.navButton} onPress={goToPreviousMonth}>
              <ChevronLeft size={24} color={colors.text} />
            </Pressable>
            <Text style={styles.monthTitle}>
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            <Pressable style={styles.navButton} onPress={goToNextMonth}>
              <ChevronRight size={24} color={colors.text} />
            </Pressable>
          </View>

          {/* Weekday Headers */}
          <View style={styles.weekdayHeader}>
            {WEEKDAYS.map((day) => (
              <View key={day} style={styles.weekdayCell}>
                <Text style={styles.weekdayText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => {
              const isSelected =
                selectedDate && day.date.toDateString() === selectedDate.toDateString();
              const dotColor = getStatusDotColor(day.itineraries);

              return (
                <Pressable
                  key={index}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    day.isToday && !isSelected && styles.dayCellToday,
                  ]}
                  onPress={() => handleDayPress(day)}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      !day.isCurrentMonth && styles.dayNumberOtherMonth,
                      isSelected && styles.dayNumberSelected,
                      day.isToday && !isSelected && styles.dayNumberToday,
                    ]}
                  >
                    {day.date.getDate()}
                  </Text>
                  {dotColor && (
                    <View style={styles.dotContainer}>
                      <View style={[styles.dot, { backgroundColor: dotColor }]} />
                      {day.itineraries.length > 1 && (
                        <View style={[styles.dot, { backgroundColor: dotColor, opacity: 0.5 }]} />
                      )}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Selected Date Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailsHeader}>
              <CalendarIcon size={20} color={colors.secondary} />
              <Text style={styles.detailsTitle}>
                {selectedDate ? formatSelectedDate(selectedDate) : 'Select a date'}
              </Text>
            </View>

            <ScrollView
              style={styles.itinerariesList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.itinerariesContent}
            >
              {selectedDateItineraries.length === 0 ? (
                <View style={styles.emptyState}>
                  <Heart size={40} color={colors.textTertiary} />
                  <Text style={styles.emptyTitle}>No dates planned</Text>
                  <Text style={styles.emptyDescription}>Plan something special for this day</Text>
                  <Pressable
                    style={styles.planButton}
                    onPress={() => router.push('/date-night/generate-plan')}
                  >
                    <Sparkles size={18} color={colors.textLight} />
                    <Text style={styles.planButtonText}>Plan a Date</Text>
                  </Pressable>
                </View>
              ) : (
                selectedDateItineraries.map((itinerary) => (
                  <Pressable
                    key={itinerary.id}
                    style={styles.itineraryCard}
                    onPress={() => router.push(`/date-night/edit-itinerary?id=${itinerary.id}`)}
                  >
                    <View style={styles.itineraryHeader}>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: `${getStatusColor(itinerary.status)}15` },
                        ]}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: getStatusColor(itinerary.status) },
                          ]}
                        />
                        <Text
                          style={[styles.statusText, { color: getStatusColor(itinerary.status) }]}
                        >
                          {itinerary.status.charAt(0).toUpperCase() + itinerary.status.slice(1)}
                        </Text>
                      </View>
                      {itinerary.isSurprise && (
                        <View style={styles.surpriseBadge}>
                          <Text style={styles.surpriseText}>🎁</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.itineraryName}>{itinerary.name}</Text>

                    <View style={styles.itineraryMeta}>
                      <View style={styles.metaItem}>
                        <Users size={14} color={colors.textSecondary} />
                        <Text style={styles.metaText}>{itinerary.partnerName}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <MapPin size={14} color={colors.textSecondary} />
                        <Text style={styles.metaText}>{itinerary.activities.length} stops</Text>
                      </View>
                      <Text style={styles.budgetText}>{itinerary.totalEstimatedCost}</Text>
                    </View>

                    {/* Timeline Preview */}
                    <View style={styles.timelinePreview}>
                      {itinerary.activities.slice(0, 4).map((activity, idx) => (
                        <View key={activity.id} style={styles.timelineItem}>
                          <View style={styles.timelineDot}>
                            <Text style={styles.timelineNumber}>{idx + 1}</Text>
                          </View>
                          {idx < Math.min(itinerary.activities.length - 1, 3) && (
                            <View style={styles.timelineLine} />
                          )}
                          <View style={styles.timelineContent}>
                            <Text style={styles.timelineTime}>{activity.startTime}</Text>
                            <Text style={styles.timelineName} numberOfLines={1}>
                              {activity.name}
                            </Text>
                          </View>
                        </View>
                      ))}
                      {itinerary.activities.length > 4 && (
                        <View style={styles.moreActivities}>
                          <Text style={styles.moreText}>
                            +{itinerary.activities.length - 4} more
                          </Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textLight,
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingTop: 20,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  weekdayHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  weekdayCell: {
    width: DAY_WIDTH,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  dayCell: {
    width: DAY_WIDTH,
    height: DAY_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  dayCellSelected: {
    backgroundColor: colors.secondary,
    borderRadius: DAY_WIDTH / 2,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: colors.secondary,
    borderRadius: DAY_WIDTH / 2,
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  dayNumberOtherMonth: {
    color: colors.textTertiary,
  },
  dayNumberSelected: {
    color: colors.textLight,
    fontWeight: '700',
  },
  dayNumberToday: {
    color: colors.secondary,
    fontWeight: '700',
  },
  dotContainer: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
    position: 'absolute',
    bottom: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  detailsSection: {
    flex: 1,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  detailsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  itinerariesList: {
    flex: 1,
  },
  itinerariesContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  planButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.secondary,
    borderRadius: 12,
  },
  planButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textLight,
  },
  itineraryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  itineraryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  surpriseBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  surpriseText: {
    fontSize: 14,
  },
  itineraryName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  itineraryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  budgetText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  timelinePreview: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 36,
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
  },
  timelineLine: {
    position: 'absolute',
    left: 10,
    top: 22,
    bottom: 0,
    width: 2,
    backgroundColor: colors.borderLight,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 10,
    paddingBottom: 10,
  },
  timelineTime: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondary,
  },
  timelineName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginTop: 1,
  },
  moreActivities: {
    paddingLeft: 32,
    paddingTop: 4,
  },
  moreText: {
    fontSize: 13,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
});
