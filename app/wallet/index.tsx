import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import {
  Search,
  X,
  SlidersHorizontal,
  Plus,
  Utensils,
  Ticket,
  Plane,
  Building2,
  Car,
  CalendarDays,
  Wallet,
  ChevronRight,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import ConfirmationCard, {
  MiniConfirmationCard,
  ConfirmationGroupHeader,
} from '@/components/ConfirmationCard';
import TicketViewer from '@/components/TicketViewer';
import { Confirmation, ConfirmationType, CONFIRMATION_TYPE_CONFIG } from '@/types/confirmation';
import { useConfirmationWallet } from '@/hooks/useConfirmationStorage';

const TYPE_ICONS: Record<ConfirmationType, React.ComponentType<any>> = {
  restaurant: Utensils,
  activity: Ticket,
  flight: Plane,
  hotel: Building2,
  car_rental: Car,
  event: CalendarDays,
  transportation: Ticket,
  other: Ticket,
};

export default function WalletScreen() {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState<ConfirmationType | null>(null);

  const {
    confirmations,
    groupedByDate,
    todayConfirmations,
    isLoading,
    isSearching,
    searchQuery,
    selectedConfirmation,
    showTicketViewer,
    search,
    clearSearch,
    filterByType,
    clearFilters,
    selectConfirmation,
    viewTicket,
    closeTicketViewer,
    clearSelection,
    refresh,
  } = useConfirmationWallet();

  const handleTypeFilter = (type: ConfirmationType | null) => {
    setSelectedType(type);
    filterByType(type);
  };

  const handleConfirmationPress = (confirmation: Confirmation) => {
    router.push(`/wallet/${confirmation.id}`);
  };

  const renderTodaySection = () => {
    if (todayConfirmations.length === 0) return null;

    return (
      <View style={styles.todaySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today</Text>
          <Text style={styles.sectionCount}>{todayConfirmations.length}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.todayScroll}
        >
          {todayConfirmations.map((conf) => (
            <MiniConfirmationCard
              key={conf.id}
              confirmation={conf}
              onPress={() => handleConfirmationPress(conf)}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderTypeFilters = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterScroll}
      contentContainerStyle={styles.filterContent}
    >
      <TouchableOpacity
        style={[styles.filterChip, selectedType === null && styles.filterChipSelected]}
        onPress={() => handleTypeFilter(null)}
      >
        <Wallet size={16} color={selectedType === null ? '#fff' : colors.text} />
        <Text
          style={[styles.filterChipText, selectedType === null && styles.filterChipTextSelected]}
        >
          All
        </Text>
      </TouchableOpacity>

      {(Object.keys(CONFIRMATION_TYPE_CONFIG) as ConfirmationType[]).map((type) => {
        const config = CONFIRMATION_TYPE_CONFIG[type];
        const Icon = TYPE_ICONS[type];
        const isSelected = selectedType === type;

        return (
          <TouchableOpacity
            key={type}
            style={[styles.filterChip, isSelected && { backgroundColor: config.color }]}
            onPress={() => handleTypeFilter(type)}
          >
            <Icon size={16} color={isSelected ? '#fff' : config.color} />
            <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}>
              {config.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Wallet size={64} color={colors.textTertiary} />
      <Text style={styles.emptyTitle}>No confirmations yet</Text>
      <Text style={styles.emptyText}>
        Your booking confirmations, tickets, and QR codes will appear here
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/wallet/add')}>
        <Plus size={18} color="#fff" />
        <Text style={styles.emptyButtonText}>Add Confirmation</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchResults = () => (
    <FlatList
      data={confirmations}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ConfirmationCard
          confirmation={item}
          onPress={() => handleConfirmationPress(item)}
          onViewTicket={item.tickets?.length ? () => viewTicket(item) : undefined}
          compact
        />
      )}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>No results found</Text>
        </View>
      }
    />
  );

  const renderGroupedList = () => (
    <FlatList
      data={groupedByDate}
      keyExtractor={(item) => item.label}
      renderItem={({ item: group }) => (
        <View>
          <ConfirmationGroupHeader label={group.label} count={group.confirmations.length} />
          {group.confirmations.map((conf) => (
            <ConfirmationCard
              key={conf.id}
              confirmation={conf}
              onPress={() => handleConfirmationPress(conf)}
              onViewTicket={conf.tickets?.length ? () => viewTicket(conf) : undefined}
            />
          ))}
        </View>
      )}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={!searchQuery ? renderTodaySection : null}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={colors.primary} />
      }
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/wallet/add')}>
          <Plus size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={18} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={search}
            placeholder="Search confirmations..."
            placeholderTextColor={colors.textTertiary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Type filters */}
      {renderTypeFilters()}

      {/* Content */}
      {searchQuery ? renderSearchResults() : renderGroupedList()}

      {/* Ticket Viewer Modal */}
      {selectedConfirmation && (
        <TicketViewer
          visible={showTicketViewer}
          onClose={closeTicketViewer}
          confirmation={selectedConfirmation}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Search
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  // Filters
  filterScroll: {
    maxHeight: 44,
    marginBottom: 12,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  filterChipTextSelected: {
    color: '#fff',
  },
  // Today section
  todaySection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },
  todayScroll: {
    paddingRight: 16,
  },
  // List
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  noResults: {
    padding: 40,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
