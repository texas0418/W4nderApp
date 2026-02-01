import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Dimensions,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Sun,
  MapPin,
  Clock,
  Copy,
  ExternalLink,
  Check,
} from 'lucide-react-native';
import * as Brightness from 'expo-brightness';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import QRCode from 'react-native-qrcode-svg';
import colors from '@/constants/colors';
import { Confirmation, Ticket } from '@/types/confirmation';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TicketViewerProps {
  visible: boolean;
  onClose: () => void;
  confirmation: Confirmation;
  initialTicketIndex?: number;
}

export default function TicketViewer({
  visible,
  onClose,
  confirmation,
  initialTicketIndex = 0,
}: TicketViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialTicketIndex);
  const [originalBrightness, setOriginalBrightness] = useState<number | null>(null);
  const [isBrightnessMaxed, setIsBrightnessMaxed] = useState(false);
  const [copied, setCopied] = useState(false);

  const tickets = confirmation.tickets || [];
  const currentTicket = tickets[currentIndex];

  // Max brightness when viewing ticket
  useEffect(() => {
    if (visible && Platform.OS !== 'web') {
      (async () => {
        try {
          const current = await Brightness.getBrightnessAsync();
          setOriginalBrightness(current);
        } catch (error) {
          console.error('Failed to get brightness:', error);
        }
      })();
    }

    return () => {
      if (originalBrightness !== null && Platform.OS !== 'web') {
        Brightness.setBrightnessAsync(originalBrightness).catch(() => {});
      }
    };
  }, [visible]);

  const toggleBrightness = async () => {
    if (Platform.OS === 'web') return;

    try {
      if (isBrightnessMaxed) {
        if (originalBrightness !== null) {
          await Brightness.setBrightnessAsync(originalBrightness);
        }
        setIsBrightnessMaxed(false);
      } else {
        await Brightness.setBrightnessAsync(1);
        setIsBrightnessMaxed(true);
      }
    } catch (error) {
      console.error('Failed to set brightness:', error);
    }
  };

  const handleCopyCode = async () => {
    if (currentTicket?.code) {
      await Clipboard.setStringAsync(currentTicket.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!currentTicket) return;

    const fileUri = currentTicket.pdfUri || currentTicket.imageUri;
    
    if (fileUri && await Sharing.isAvailableAsync()) {
      try {
        await Sharing.shareAsync(fileUri, {
          mimeType: currentTicket.pdfUri ? 'application/pdf' : 'image/png',
          dialogTitle: confirmation.title,
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    }
  };

  const handleOpenMaps = () => {
    const { coordinates, address, name } = confirmation.location;
    
    if (coordinates) {
      const url = Platform.select({
        ios: `maps:?q=${name}&ll=${coordinates.lat},${coordinates.lng}`,
        android: `geo:${coordinates.lat},${coordinates.lng}?q=${name}`,
        default: `https://maps.google.com/?q=${coordinates.lat},${coordinates.lng}`,
      });
      Linking.openURL(url);
    } else if (address) {
      const encodedAddress = encodeURIComponent(`${name}, ${address}`);
      const url = Platform.select({
        ios: `maps:?q=${encodedAddress}`,
        android: `geo:0,0?q=${encodedAddress}`,
        default: `https://maps.google.com/?q=${encodedAddress}`,
      });
      Linking.openURL(url);
    }
  };

  const goToTicket = (index: number) => {
    if (index >= 0 && index < tickets.length) {
      setCurrentIndex(index);
    }
  };

  const renderTicketContent = () => {
    if (!currentTicket) {
      return (
        <View style={styles.noTicket}>
          <Text style={styles.noTicketText}>No ticket available</Text>
        </View>
      );
    }

    switch (currentTicket.type) {
      case 'qr_code':
        return (
          <View style={styles.qrContainer}>
            {currentTicket.code ? (
              <View style={styles.qrWrapper}>
                <QRCode
                  value={currentTicket.code}
                  size={SCREEN_WIDTH * 0.65}
                  backgroundColor="white"
                  color="black"
                />
              </View>
            ) : currentTicket.imageUri ? (
              <Image
                source={{ uri: currentTicket.imageUri }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.errorText}>QR code not available</Text>
            )}
          </View>
        );

      case 'barcode':
        return (
          <View style={styles.barcodeContainer}>
            {currentTicket.imageUri ? (
              <Image
                source={{ uri: currentTicket.imageUri }}
                style={styles.barcodeImage}
                resizeMode="contain"
              />
            ) : currentTicket.code ? (
              <View style={styles.barcodeCode}>
                <Text style={styles.barcodeCodeText}>{currentTicket.code}</Text>
              </View>
            ) : (
              <Text style={styles.errorText}>Barcode not available</Text>
            )}
          </View>
        );

      case 'pdf':
        return (
          <View style={styles.pdfContainer}>
            <TouchableOpacity
              style={styles.pdfButton}
              onPress={() => {
                if (currentTicket.pdfUri) {
                  Linking.openURL(currentTicket.pdfUri);
                } else if (currentTicket.pdfUrl) {
                  Linking.openURL(currentTicket.pdfUrl);
                }
              }}
            >
              <Download size={24} color={colors.primary} />
              <Text style={styles.pdfButtonText}>Open PDF Ticket</Text>
            </TouchableOpacity>
          </View>
        );

      case 'passbook':
        return (
          <View style={styles.passbookContainer}>
            <TouchableOpacity
              style={styles.passbookButton}
              onPress={() => {
                if (currentTicket.passbookUrl) {
                  Linking.openURL(currentTicket.passbookUrl);
                }
              }}
            >
              <ExternalLink size={24} color="#fff" />
              <Text style={styles.passbookButtonText}>Add to Wallet</Text>
            </TouchableOpacity>
          </View>
        );

      case 'image':
        return (
          <View style={styles.imageContainer}>
            {currentTicket.imageUri || currentTicket.imageUrl ? (
              <Image
                source={{ uri: currentTicket.imageUri || currentTicket.imageUrl }}
                style={styles.ticketImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.errorText}>Image not available</Text>
            )}
          </View>
        );

      case 'text':
        return (
          <View style={styles.textContainer}>
            <Text style={styles.textCode}>{currentTicket.code}</Text>
          </View>
        );

      default:
        return (
          <View style={styles.noTicket}>
            <Text style={styles.noTicketText}>Unknown ticket type</Text>
          </View>
        );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            {tickets.length > 1 
              ? `Ticket ${currentIndex + 1} of ${tickets.length}`
              : 'Ticket'
            }
          </Text>

          <View style={styles.headerActions}>
            {Platform.OS !== 'web' && (
              <TouchableOpacity onPress={toggleBrightness} style={styles.headerButton}>
                <Sun 
                  size={22} 
                  color={isBrightnessMaxed ? colors.warning : colors.text} 
                  fill={isBrightnessMaxed ? colors.warning : 'transparent'}
                />
              </TouchableOpacity>
            )}
            {(currentTicket?.pdfUri || currentTicket?.imageUri) && (
              <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
                <Share2 size={22} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Booking Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>{confirmation.title}</Text>
            
            <View style={styles.infoRow}>
              <Clock size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>{confirmation.displayDateTime}</Text>
            </View>

            <TouchableOpacity style={styles.infoRow} onPress={handleOpenMaps}>
              <MapPin size={16} color={colors.textSecondary} />
              <Text style={[styles.infoText, styles.infoLink]} numberOfLines={2}>
                {confirmation.location.name}
                {confirmation.location.address && `\n${confirmation.location.address}`}
              </Text>
              <ExternalLink size={14} color={colors.primary} />
            </TouchableOpacity>

            {confirmation.location.meetingPoint && (
              <View style={styles.meetingPoint}>
                <Text style={styles.meetingPointLabel}>Meeting Point</Text>
                <Text style={styles.meetingPointText}>
                  {confirmation.location.meetingPoint}
                </Text>
              </View>
            )}
          </View>

          {/* Ticket Display */}
          <View style={styles.ticketCard}>
            {currentTicket?.label && (
              <Text style={styles.ticketLabel}>{currentTicket.label}</Text>
            )}

            {renderTicketContent()}

            {/* Ticket holder info */}
            {currentTicket?.holderName && (
              <View style={styles.holderInfo}>
                <Text style={styles.holderLabel}>Ticket Holder</Text>
                <Text style={styles.holderName}>{currentTicket.holderName}</Text>
              </View>
            )}

            {/* Seat info */}
            {(currentTicket?.seat || currentTicket?.section || currentTicket?.row) && (
              <View style={styles.seatInfo}>
                {currentTicket.section && (
                  <View style={styles.seatItem}>
                    <Text style={styles.seatLabel}>Section</Text>
                    <Text style={styles.seatValue}>{currentTicket.section}</Text>
                  </View>
                )}
                {currentTicket.row && (
                  <View style={styles.seatItem}>
                    <Text style={styles.seatLabel}>Row</Text>
                    <Text style={styles.seatValue}>{currentTicket.row}</Text>
                  </View>
                )}
                {currentTicket.seat && (
                  <View style={styles.seatItem}>
                    <Text style={styles.seatLabel}>Seat</Text>
                    <Text style={styles.seatValue}>{currentTicket.seat}</Text>
                  </View>
                )}
                {currentTicket.gate && (
                  <View style={styles.seatItem}>
                    <Text style={styles.seatLabel}>Gate</Text>
                    <Text style={styles.seatValue}>{currentTicket.gate}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Copy code button */}
            {currentTicket?.code && (
              <TouchableOpacity
                style={styles.copyButton}
                onPress={handleCopyCode}
              >
                {copied ? (
                  <>
                    <Check size={16} color={colors.success} />
                    <Text style={[styles.copyButtonText, { color: colors.success }]}>
                      Copied!
                    </Text>
                  </>
                ) : (
                  <>
                    <Copy size={16} color={colors.primary} />
                    <Text style={styles.copyButtonText}>Copy Code</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Confirmation number */}
          <View style={styles.confirmationCard}>
            <Text style={styles.confirmationLabel}>Confirmation Number</Text>
            <Text style={styles.confirmationNumber}>
              {confirmation.confirmationNumber}
            </Text>
          </View>

          {/* Instructions */}
          {confirmation.location.instructions && (
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsLabel}>Instructions</Text>
              <Text style={styles.instructionsText}>
                {confirmation.location.instructions}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Ticket Navigation */}
        {tickets.length > 1 && (
          <View style={styles.navigation}>
            <TouchableOpacity
              style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
              onPress={() => goToTicket(currentIndex - 1)}
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={24} color={currentIndex === 0 ? colors.textTertiary : colors.text} />
            </TouchableOpacity>

            <View style={styles.navDots}>
              {tickets.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.navDot,
                    index === currentIndex && styles.navDotActive,
                  ]}
                  onPress={() => goToTicket(index)}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.navButton, currentIndex === tickets.length - 1 && styles.navButtonDisabled]}
              onPress={() => goToTicket(currentIndex + 1)}
              disabled={currentIndex === tickets.length - 1}
            >
              <ChevronRight 
                size={24} 
                color={currentIndex === tickets.length - 1 ? colors.textTertiary : colors.text} 
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  // Info card
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  infoLink: {
    color: colors.primary,
  },
  meetingPoint: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  meetingPointLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    marginBottom: 4,
  },
  meetingPointText: {
    fontSize: 14,
    color: colors.text,
  },
  // Ticket card
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ticketLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 16,
  },
  // QR Code
  qrContainer: {
    alignItems: 'center',
    padding: 16,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  qrImage: {
    width: SCREEN_WIDTH * 0.65,
    height: SCREEN_WIDTH * 0.65,
  },
  // Barcode
  barcodeContainer: {
    alignItems: 'center',
    padding: 16,
    width: '100%',
  },
  barcodeImage: {
    width: '100%',
    height: 100,
  },
  barcodeCode: {
    backgroundColor: colors.backgroundSecondary,
    padding: 16,
    borderRadius: 8,
    width: '100%',
  },
  barcodeCodeText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: colors.text,
    textAlign: 'center',
  },
  // PDF
  pdfContainer: {
    padding: 20,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: `${colors.primary}15`,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  pdfButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  // Passbook
  passbookContainer: {
    padding: 20,
  },
  passbookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  passbookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Image
  imageContainer: {
    width: '100%',
    alignItems: 'center',
  },
  ticketImage: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.4,
  },
  // Text
  textContainer: {
    padding: 20,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    width: '100%',
  },
  textCode: {
    fontSize: 18,
    fontFamily: 'monospace',
    color: colors.text,
    textAlign: 'center',
  },
  // No ticket
  noTicket: {
    padding: 40,
    alignItems: 'center',
  },
  noTicketText: {
    fontSize: 16,
    color: colors.textTertiary,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
  },
  // Holder info
  holderInfo: {
    marginTop: 16,
    alignItems: 'center',
  },
  holderLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  holderName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  // Seat info
  seatInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    width: '100%',
  },
  seatItem: {
    alignItems: 'center',
  },
  seatLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  seatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  // Copy button
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: `${colors.primary}10`,
    borderRadius: 8,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  // Confirmation card
  confirmationCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  confirmationLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  confirmationNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  // Instructions card
  instructionsCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 14,
    padding: 16,
  },
  instructionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textTertiary,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  // Navigation
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navButton: {
    padding: 8,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navDots: {
    flexDirection: 'row',
    gap: 8,
  },
  navDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  navDotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
});
