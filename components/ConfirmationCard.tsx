import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  MapPin,
  Clock,
  Copy,
  ChevronRight,
  Utensils,
  Ticket,
  Plane,
  Building2,
  Car,
  CalendarDays,
  Train,
  FileText,
  QrCode,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import colors from '@/constants/colors';
import {
  Confirmation,
  ConfirmationType,
  getConfirmationTypeConfig,
  getStatusConfig,
  formatConfirmationNumber,
} from '@/types/confirmation';

// Icon mapping
const TYPE_ICONS: Record<ConfirmationType, React.ComponentType<any>> = {
  restaurant: Utensils,
  activity: Ticket,
  flight: Plane,
  hotel: Building2,
  car_rental: Car,
  event: CalendarDays,
  transportation: Train,
  other: FileText,
};

interface ConfirmationCardProps {
  confirmation: Confirmation;
  onPress: () => void;
  onViewTicket?: () => void;
  compact?: boolean;
}

export default function ConfirmationCard({
  confirmation,
  onPress,
  onViewTicket,
  compact = false,
}: ConfirmationCardProps) {
  const typeConfig = getConfirmationTypeConfig(confirmation.type);
  const statusConfig = getStatusConfig(confirmation.status);
  const TypeIcon = TYPE_ICONS[confirmation.type] || FileText;
  const hasTickets = confirmation.tickets && confirmation.tickets.length > 0;

  const handleCopyConfirmation = async () => {
    await Clipboard.setStringAsync(confirmation.confirmationNumber);
    // Could show toast here
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.compactIcon, { backgroundColor: `${typeConfig.color}15` }]}>
          <TypeIcon size={18} color={typeConfig.color} />
        </View>

        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {confirmation.title}
          </Text>
          <View style={styles.compactMeta}>
            <Clock size={12} color={colors.textTertiary} />
            <Text style={styles.compactMetaText}>
              {confirmation.startTime || confirmation.displayDateTime}
            </Text>
          </View>
        </View>

        {hasTickets && (
          <TouchableOpacity
            style={styles.compactTicketButton}
            onPress={(e) => {
              e.stopPropagation();
              onViewTicket?.();
            }}
          >
            <QrCode size={18} color={colors.primary} />
          </TouchableOpacity>
        )}

        <ChevronRight size={18} color={colors.textTertiary} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.typeIcon, { backgroundColor: `${typeConfig.color}15` }]}>
          <TypeIcon size={20} color={typeConfig.color} />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={1}>
            {confirmation.title}
          </Text>
          <View style={styles.providerRow}>
            <Text style={styles.provider}>{confirmation.provider}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Clock size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{confirmation.displayDateTime}</Text>
        </View>

        <View style={styles.detailRow}>
          <MapPin size={16} color={colors.textSecondary} />
          <Text style={styles.detailText} numberOfLines={1}>
            {confirmation.location.name}
            {confirmation.location.address && ` • ${confirmation.location.address}`}
          </Text>
        </View>
      </View>

      {/* Confirmation Number */}
      <View style={styles.confirmationRow}>
        <View style={styles.confirmationInfo}>
          <Text style={styles.confirmationLabel}>Confirmation</Text>
          <Text style={styles.confirmationNumber}>
            {formatConfirmationNumber(confirmation.confirmationNumber)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.copyButton}
          onPress={handleCopyConfirmation}
        >
          <Copy size={16} color={colors.primary} />
          <Text style={styles.copyText}>Copy</Text>
        </TouchableOpacity>
      </View>

      {/* Ticket Button */}
      {hasTickets && (
        <TouchableOpacity
          style={styles.ticketButton}
          onPress={(e) => {
            e.stopPropagation();
            onViewTicket?.();
          }}
        >
          <QrCode size={18} color="#fff" />
          <Text style={styles.ticketButtonText}>
            View {confirmation.tickets!.length > 1 ? 'Tickets' : 'Ticket'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Subtitle if present */}
      {confirmation.subtitle && (
        <Text style={styles.subtitle}>{confirmation.subtitle}</Text>
      )}
    </TouchableOpacity>
  );
}

// Mini card for today's view
interface MiniConfirmationCardProps {
  confirmation: Confirmation;
  onPress: () => void;
}

export function MiniConfirmationCard({
  confirmation,
  onPress,
}: MiniConfirmationCardProps) {
  const typeConfig = getConfirmationTypeConfig(confirmation.type);
  const TypeIcon = TYPE_ICONS[confirmation.type] || FileText;

  return (
    <TouchableOpacity
      style={styles.miniContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.miniIcon, { backgroundColor: typeConfig.color }]}>
        <TypeIcon size={14} color="#fff" />
      </View>
      <View style={styles.miniContent}>
        <Text style={styles.miniTitle} numberOfLines={1}>
          {confirmation.title}
        </Text>
        <Text style={styles.miniTime}>
          {confirmation.startTime || 'All day'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// Group header for confirmation lists
interface ConfirmationGroupHeaderProps {
  label: string;
  count: number;
}

export function ConfirmationGroupHeader({
  label,
  count,
}: ConfirmationGroupHeaderProps) {
  const isToday = label === 'Today';
  const isTomorrow = label === 'Tomorrow';

  return (
    <View style={styles.groupHeader}>
      <Text style={[
        styles.groupLabel,
        (isToday || isTomorrow) && styles.groupLabelHighlight,
      ]}>
        {label}
      </Text>
      <View style={styles.groupCount}>
        <Text style={styles.groupCountText}>{count}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  provider: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  details: {
    marginBottom: 12,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  confirmationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  confirmationInfo: {
    flex: 1,
  },
  confirmationLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  confirmationNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'monospace',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: `${colors.primary}15`,
    borderRadius: 6,
  },
  copyText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
  },
  ticketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  ticketButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  compactIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactContent: {
    flex: 1,
    marginLeft: 10,
  },
  compactTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  compactMetaText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  compactTicketButton: {
    padding: 8,
    marginRight: 4,
  },
  // Mini styles
  miniContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    minWidth: 140,
  },
  miniIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniContent: {
    marginLeft: 8,
    flex: 1,
  },
  miniTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  miniTime: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  // Group header
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  groupLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  groupLabelHighlight: {
    color: colors.text,
    fontSize: 16,
  },
  groupCount: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  groupCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
