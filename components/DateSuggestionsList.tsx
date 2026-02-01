import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Calendar,
  Clock,
  Star,
  Sparkles,
  ChevronRight,
  Heart,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import {
  DateSuggestion,
  DAY_FULL_LABELS,
} from '@/types/availability';
import {
  formatTimeRange,
  formatDuration,
  getQualityColor,
  getQualityLabel,
} from '@/utils/availabilityUtils';

interface DateSuggestionCardProps {
  suggestion: DateSuggestion;
  onSelect: (suggestion: DateSuggestion) => void;
  isSelected?: boolean;
}

export function DateSuggestionCard({
  suggestion,
  onSelect,
  isSelected,
}: DateSuggestionCardProps) {
  const qualityColor = getQualityColor(suggestion.quality);
  
  const displayDate = new Date(suggestion.date + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        { borderLeftColor: qualityColor },
      ]}
      onPress={() => onSelect(suggestion)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.dateContainer}>
          <Calendar size={14} color={colors.textSecondary} />
          <Text style={styles.dateText}>
            {DAY_FULL_LABELS[suggestion.dayOfWeek]}, {displayDate}
          </Text>
        </View>
        <View style={[
          styles.qualityBadge,
          { backgroundColor: `${qualityColor}15` }
        ]}>
          {suggestion.quality === 'ideal' && (
            <Star size={12} color={qualityColor} />
          )}
          <Text style={[styles.qualityText, { color: qualityColor }]}>
            {getQualityLabel(suggestion.quality)}
          </Text>
        </View>
      </View>

      <View style={styles.timeRow}>
        <Clock size={16} color={colors.primary} />
        <Text style={styles.timeText}>
          {formatTimeRange(suggestion.slot.start, suggestion.slot.end)}
        </Text>
        <Text style={styles.durationText}>
          {formatDuration(suggestion.slot.durationMinutes)}
        </Text>
      </View>

      <Text style={styles.reasonText}>{suggestion.reason}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.matchIndicators}>
          <View style={[
            styles.matchDot,
            suggestion.slot.matchesPreferences.user1 && styles.matchDotActive
          ]} />
          <View style={[
            styles.matchDot,
            suggestion.slot.matchesPreferences.user2 && styles.matchDotActive
          ]} />
        </View>
        <ChevronRight size={18} color={colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

interface DateSuggestionsListProps {
  suggestions: DateSuggestion[];
  onSelectSuggestion: (suggestion: DateSuggestion) => void;
  selectedSuggestionId?: string | null;
  title?: string;
  emptyMessage?: string;
}

export default function DateSuggestionsList({
  suggestions,
  onSelectSuggestion,
  selectedSuggestionId,
  title = 'Suggested Times',
  emptyMessage = 'No available times found',
}: DateSuggestionsListProps) {
  if (suggestions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Calendar size={48} color={colors.textTertiary} />
        <Text style={styles.emptyTitle}>{emptyMessage}</Text>
        <Text style={styles.emptyDescription}>
          Try adjusting your preferences or check back later
        </Text>
      </View>
    );
  }

  const idealSuggestions = suggestions.filter(s => s.quality === 'ideal');
  const goodSuggestions = suggestions.filter(s => s.quality === 'good');
  const possibleSuggestions = suggestions.filter(s => s.quality === 'possible');

  return (
    <View style={styles.container}>
      {/* Best matches */}
      {idealSuggestions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sparkles size={18} color={colors.success} />
            <Text style={styles.sectionTitle}>Perfect Matches</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{idealSuggestions.length}</Text>
            </View>
          </View>
          {idealSuggestions.map((suggestion) => (
            <DateSuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onSelect={onSelectSuggestion}
              isSelected={selectedSuggestionId === suggestion.id}
            />
          ))}
        </View>
      )}

      {/* Good matches */}
      {goodSuggestions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Heart size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Good Options</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{goodSuggestions.length}</Text>
            </View>
          </View>
          {goodSuggestions.map((suggestion) => (
            <DateSuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onSelect={onSelectSuggestion}
              isSelected={selectedSuggestionId === suggestion.id}
            />
          ))}
        </View>
      )}

      {/* Other options */}
      {possibleSuggestions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={18} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Other Times</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{possibleSuggestions.length}</Text>
            </View>
          </View>
          {possibleSuggestions.map((suggestion) => (
            <DateSuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onSelect={onSelectSuggestion}
              isSelected={selectedSuggestionId === suggestion.id}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// Compact horizontal list for preview
interface DateSuggestionsPreviewProps {
  suggestions: DateSuggestion[];
  onSelectSuggestion: (suggestion: DateSuggestion) => void;
  onSeeAll: () => void;
  maxVisible?: number;
}

export function DateSuggestionsPreview({
  suggestions,
  onSelectSuggestion,
  onSeeAll,
  maxVisible = 3,
}: DateSuggestionsPreviewProps) {
  const visibleSuggestions = suggestions.slice(0, maxVisible);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <View style={styles.previewContainer}>
      <View style={styles.previewHeader}>
        <View style={styles.previewTitleRow}>
          <Sparkles size={18} color={colors.primary} />
          <Text style={styles.previewTitle}>Suggested Times</Text>
        </View>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.previewScroll}
      >
        {visibleSuggestions.map((suggestion) => (
          <TouchableOpacity
            key={suggestion.id}
            style={[
              styles.previewCard,
              { borderTopColor: getQualityColor(suggestion.quality) },
            ]}
            onPress={() => onSelectSuggestion(suggestion)}
            activeOpacity={0.7}
          >
            <Text style={styles.previewDay}>
              {DAY_FULL_LABELS[suggestion.dayOfWeek].slice(0, 3)}
            </Text>
            <Text style={styles.previewDate}>
              {new Date(suggestion.date + 'T12:00:00').getDate()}
            </Text>
            <Text style={styles.previewTime}>
              {formatTimeRange(suggestion.slot.start, suggestion.slot.end).split(' - ')[0]}
            </Text>
            {suggestion.quality === 'ideal' && (
              <Star size={12} color={colors.success} style={styles.previewStar} />
            )}
          </TouchableOpacity>
        ))}

        {suggestions.length > maxVisible && (
          <TouchableOpacity
            style={styles.moreCard}
            onPress={onSeeAll}
            activeOpacity={0.7}
          >
            <Text style={styles.moreCount}>+{suggestions.length - maxVisible}</Text>
            <Text style={styles.moreText}>more</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  countBadge: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
  },
  cardSelected: {
    backgroundColor: `${colors.primary}08`,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  qualityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  durationText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  reasonText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchIndicators: {
    flexDirection: 'row',
    gap: 4,
  },
  matchDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  matchDotActive: {
    backgroundColor: colors.success,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  // Preview styles
  previewContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  previewScroll: {
    gap: 10,
  },
  previewCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 72,
    borderTopWidth: 3,
    position: 'relative',
  },
  previewDay: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  previewDate: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginVertical: 2,
  },
  previewTime: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  previewStar: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  moreCard: {
    backgroundColor: `${colors.primary}10`,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
  },
  moreCount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  moreText: {
    fontSize: 11,
    color: colors.primary,
  },
});
