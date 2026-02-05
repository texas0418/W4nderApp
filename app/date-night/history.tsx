import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Heart,
  CheckCircle,
  XCircle,
  ChevronRight,
  Trash2,
  Filter,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useDateNight } from '@/contexts/DateNightContext';
import { DateItinerary } from '@/types/date-night';

type FilterType = 'all' | 'planned' | 'completed' | 'cancelled';

export default function HistoryScreen() {
  const router = useRouter();
  const { itineraries, deleteItinerary } = useDateNight();
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredItineraries = itineraries
    .filter((i) => filter === 'all' || i.status === filter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDelete = (itinerary: DateItinerary) => {
    Alert.alert('Delete Date', `Are you sure you want to delete "${itinerary.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteItinerary(itinerary.id),
      },
    ]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} color={colors.success} />;
      case 'cancelled':
        return <XCircle size={16} color={colors.error} />;
      default:
        return <Calendar size={16} color={colors.primary} />;
    }
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
        return colors.primary;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        style={styles.headerGradient}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={colors.textLight} />
          </Pressable>
          <Text style={styles.headerTitle}>Date History</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* Filter Tabs */}
          <View style={styles.filterContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {(['all', 'planned', 'completed', 'cancelled'] as FilterType[]).map((f) => (
                <Pressable
                  key={f}
                  style={[styles.filterTab, filter === f && styles.filterTabActive]}
                  onPress={() => setFilter(f)}
                >
                  <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <ScrollView
            style={styles.listContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {filteredItineraries.length === 0 ? (
              <View style={styles.emptyState}>
                <Heart size={48} color={colors.textTertiary} />
                <Text style={styles.emptyTitle}>No dates yet</Text>
                <Text style={styles.emptyDescription}>
                  {filter === 'all'
                    ? 'Start planning your first date!'
                    : `No ${filter} dates found.`}
                </Text>
                {filter === 'all' && (
                  <Pressable
                    style={styles.emptyButton}
                    onPress={() => router.push('/(tabs)/date-night')}
                  >
                    <Text style={styles.emptyButtonText}>Plan a Date</Text>
                  </Pressable>
                )}
              </View>
            ) : (
              filteredItineraries.map((itinerary) => (
                <Pressable
                  key={itinerary.id}
                  style={styles.itineraryCard}
                  onPress={() => router.push(`/date-night/edit-itinerary?id=${itinerary.id}`)}
                >
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor(itinerary.status)}15` },
                      ]}
                    >
                      {getStatusIcon(itinerary.status)}
                      <Text
                        style={[styles.statusText, { color: getStatusColor(itinerary.status) }]}
                      >
                        {itinerary.status.charAt(0).toUpperCase() + itinerary.status.slice(1)}
                      </Text>
                    </View>
                    {itinerary.isSurprise && (
                      <View style={styles.surpriseBadge}>
                        <Text style={styles.surpriseText}>🎁 Surprise</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.itineraryName}>{itinerary.name}</Text>

                  <View style={styles.cardMeta}>
                    <View style={styles.metaItem}>
                      <Calendar size={14} color={colors.textSecondary} />
                      <Text style={styles.metaText}>{formatDate(itinerary.date)}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Users size={14} color={colors.textSecondary} />
                      <Text style={styles.metaText}>{itinerary.partnerName}</Text>
                    </View>
                  </View>

                  <View style={styles.cardMeta}>
                    <View style={styles.metaItem}>
                      <Clock size={14} color={colors.textSecondary} />
                      <Text style={styles.metaText}>{itinerary.activities.length} activities</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.budgetText}>{itinerary.totalEstimatedCost}</Text>
                    </View>
                  </View>

                  <View style={styles.cardActions}>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDelete(itinerary);
                      }}
                    >
                      <Trash2 size={18} color={colors.error} />
                    </Pressable>
                    <ChevronRight size={20} color={colors.textTertiary} />
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
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
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
  },
  filterContainer: {
    paddingTop: 20,
    paddingBottom: 12,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 20,
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.textLight,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyButton: {
    marginTop: 24,
    backgroundColor: colors.secondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  surpriseBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: `${colors.secondary}15`,
    borderRadius: 8,
  },
  surpriseText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.secondary,
  },
  itineraryName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  deleteButton: {
    padding: 8,
  },
});
