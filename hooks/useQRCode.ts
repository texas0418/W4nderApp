// ============================================================================
// useQRCode Hook
// React hook for generating and managing QR codes
// ============================================================================

import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import {
  ShareableContent,
  ShareableContentType,
  QRCodeOptions,
  QRDisplayOptions,
  GeneratedQRCode,
  ShareResult,
  ShareAction,
  DEFAULT_QR_OPTIONS,
  DEFAULT_DISPLAY_OPTIONS,
  CONTENT_TYPE_CONFIG,
} from '../types/qrcode';
import {
  generateQRCode,
  generateQRValue,
  copyShareLink,
  shareNative,
  saveQRCodeToGallery,
  shareQRCodeImage,
  shareViaSMS,
  shareViaEmail,
  createTripShareContent,
  createDateNightShareContent,
  createLocationShareContent,
  createContactShareContent,
} from '../utils/qrCodeUtils';

// ============================================================================
// Hook State Interface
// ============================================================================

interface UseQRCodeState {
  // Generated QR code
  qrCode: GeneratedQRCode | null;
  
  // Loading states
  isGenerating: boolean;
  isSharing: boolean;
  
  // Options
  options: QRCodeOptions;
  displayOptions: QRDisplayOptions;
  
  // Error
  error: string | null;
  
  // Last share result
  lastShareResult: ShareResult | null;
}

interface UseQRCodeReturn extends UseQRCodeState {
  // Generation
  generate: (content: ShareableContent) => Promise<GeneratedQRCode | null>;
  regenerate: () => Promise<void>;
  
  // Quick generators
  generateForTrip: (tripId: string, tripName: string, destination?: string, dates?: { start: string; end: string }) => Promise<GeneratedQRCode | null>;
  generateForDateNight: (itineraryId: string, name: string, partnerName?: string, isSurprise?: boolean) => Promise<GeneratedQRCode | null>;
  generateForLocation: (name: string, coordinates: { lat: number; lng: number }, address?: string) => Promise<GeneratedQRCode | null>;
  generateForContact: (name: string, details: { phone?: string; email?: string; organization?: string }) => Promise<GeneratedQRCode | null>;
  generateForUrl: (url: string, title?: string) => Promise<GeneratedQRCode | null>;
  
  // Share actions
  copyLink: () => Promise<ShareResult>;
  shareNatively: () => Promise<ShareResult>;
  saveToGallery: () => Promise<ShareResult>;
  shareImage: () => Promise<ShareResult>;
  sendSMS: (phoneNumber?: string) => Promise<ShareResult>;
  sendEmail: (emailAddress?: string) => Promise<ShareResult>;
  
  // Options
  updateOptions: (options: Partial<QRCodeOptions>) => void;
  updateDisplayOptions: (options: Partial<QRDisplayOptions>) => void;
  resetOptions: () => void;
  
  // Utility
  getEncodedValue: () => string | null;
  getContentInfo: () => { icon: string; label: string; color: string } | null;
  clear: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useQRCode(
  initialOptions?: Partial<QRCodeOptions>,
  initialDisplayOptions?: Partial<QRDisplayOptions>
): UseQRCodeReturn {
  // ─────────────────────────────────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────────────────────────────────
  
  const [qrCode, setQRCode] = useState<GeneratedQRCode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastShareResult, setLastShareResult] = useState<ShareResult | null>(null);
  const [options, setOptions] = useState<QRCodeOptions>({
    ...DEFAULT_QR_OPTIONS,
    ...initialOptions,
  });
  const [displayOptions, setDisplayOptions] = useState<QRDisplayOptions>({
    ...DEFAULT_DISPLAY_OPTIONS,
    ...initialDisplayOptions,
  });
  
  // Store current content for regeneration
  const [currentContent, setCurrentContent] = useState<ShareableContent | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // Generation
  // ─────────────────────────────────────────────────────────────────────────
  
  const generate = useCallback(async (
    content: ShareableContent
  ): Promise<GeneratedQRCode | null> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const generated = await generateQRCode(content, options);
      setQRCode(generated);
      setCurrentContent(content);
      return generated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate QR code';
      setError(message);
      Alert.alert('Error', message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [options]);

  const regenerate = useCallback(async () => {
    if (currentContent) {
      await generate(currentContent);
    }
  }, [currentContent, generate]);

  // ─────────────────────────────────────────────────────────────────────────
  // Quick Generators
  // ─────────────────────────────────────────────────────────────────────────
  
  const generateForTrip = useCallback(async (
    tripId: string,
    tripName: string,
    destination?: string,
    dates?: { start: string; end: string }
  ) => {
    const content = createTripShareContent(tripId, tripName, destination, dates);
    return generate(content);
  }, [generate]);

  const generateForDateNight = useCallback(async (
    itineraryId: string,
    name: string,
    partnerName?: string,
    isSurprise: boolean = false
  ) => {
    const content = createDateNightShareContent(itineraryId, name, partnerName, isSurprise);
    return generate(content);
  }, [generate]);

  const generateForLocation = useCallback(async (
    name: string,
    coordinates: { lat: number; lng: number },
    address?: string
  ) => {
    const content = createLocationShareContent(name, coordinates, address);
    return generate(content);
  }, [generate]);

  const generateForContact = useCallback(async (
    name: string,
    details: { phone?: string; email?: string; organization?: string }
  ) => {
    const content = createContactShareContent(name, details);
    return generate(content);
  }, [generate]);

  const generateForUrl = useCallback(async (
    url: string,
    title?: string
  ) => {
    const content: ShareableContent = {
      type: 'custom',
      id: `url_${Date.now()}`,
      title: title || url,
      payload: {
        type: 'custom',
        data: url,
        format: 'url',
      },
      createdAt: new Date().toISOString(),
    };
    return generate(content);
  }, [generate]);

  // ─────────────────────────────────────────────────────────────────────────
  // Share Actions
  // ─────────────────────────────────────────────────────────────────────────
  
  const performShare = useCallback(async (
    action: () => Promise<ShareResult>
  ): Promise<ShareResult> => {
    setIsSharing(true);
    try {
      const result = await action();
      setLastShareResult(result);
      return result;
    } finally {
      setIsSharing(false);
    }
  }, []);

  const copyLink = useCallback(async (): Promise<ShareResult> => {
    if (!currentContent) {
      return { success: false, action: 'copy_link', error: 'No content to copy' };
    }
    
    return performShare(async () => {
      const result = await copyShareLink(currentContent);
      if (result.success) {
        Alert.alert('Copied!', 'Link copied to clipboard');
      }
      return result;
    });
  }, [currentContent, performShare]);

  const shareNatively = useCallback(async (): Promise<ShareResult> => {
    if (!currentContent) {
      return { success: false, action: 'share_native', error: 'No content to share' };
    }
    
    return performShare(() => shareNative(currentContent, qrCode?.qrDataUrl));
  }, [currentContent, qrCode, performShare]);

  const saveToGallery = useCallback(async (): Promise<ShareResult> => {
    if (!qrCode?.qrDataUrl) {
      return { success: false, action: 'save_image', error: 'No QR code to save' };
    }
    
    return performShare(() => saveQRCodeToGallery(qrCode.qrDataUrl));
  }, [qrCode, performShare]);

  const shareImage = useCallback(async (): Promise<ShareResult> => {
    if (!qrCode?.qrDataUrl || !currentContent) {
      return { success: false, action: 'share_image', error: 'No QR code to share' };
    }
    
    return performShare(() => shareQRCodeImage(qrCode.qrDataUrl, currentContent.title));
  }, [qrCode, currentContent, performShare]);

  const sendSMS = useCallback(async (phoneNumber?: string): Promise<ShareResult> => {
    if (!currentContent) {
      return { success: false, action: 'send_sms', error: 'No content to share' };
    }
    
    return performShare(() => shareViaSMS(currentContent, phoneNumber));
  }, [currentContent, performShare]);

  const sendEmail = useCallback(async (emailAddress?: string): Promise<ShareResult> => {
    if (!currentContent) {
      return { success: false, action: 'send_email', error: 'No content to share' };
    }
    
    return performShare(() => shareViaEmail(currentContent, emailAddress));
  }, [currentContent, performShare]);

  // ─────────────────────────────────────────────────────────────────────────
  // Options
  // ─────────────────────────────────────────────────────────────────────────
  
  const updateOptions = useCallback((newOptions: Partial<QRCodeOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  const updateDisplayOptions = useCallback((newOptions: Partial<QRDisplayOptions>) => {
    setDisplayOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  const resetOptions = useCallback(() => {
    setOptions(DEFAULT_QR_OPTIONS);
    setDisplayOptions(DEFAULT_DISPLAY_OPTIONS);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Utility
  // ─────────────────────────────────────────────────────────────────────────
  
  const getEncodedValue = useCallback(() => {
    return qrCode?.encodedValue || null;
  }, [qrCode]);

  const getContentInfo = useCallback(() => {
    if (!currentContent) return null;
    return CONTENT_TYPE_CONFIG[currentContent.type];
  }, [currentContent]);

  const clear = useCallback(() => {
    setQRCode(null);
    setCurrentContent(null);
    setError(null);
    setLastShareResult(null);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Return
  // ─────────────────────────────────────────────────────────────────────────
  
  return {
    // State
    qrCode,
    isGenerating,
    isSharing,
    options,
    displayOptions,
    error,
    lastShareResult,
    
    // Generation
    generate,
    regenerate,
    
    // Quick generators
    generateForTrip,
    generateForDateNight,
    generateForLocation,
    generateForContact,
    generateForUrl,
    
    // Share actions
    copyLink,
    shareNatively,
    saveToGallery,
    shareImage,
    sendSMS,
    sendEmail,
    
    // Options
    updateOptions,
    updateDisplayOptions,
    resetOptions,
    
    // Utility
    getEncodedValue,
    getContentInfo,
    clear,
  };
}

export default useQRCode;
