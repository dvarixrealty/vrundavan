import React, { useState, useEffect } from 'react';
import { 
  Building2, Image, Link, Calendar, Check, Play, Settings, Plus, 
  Trash2, Copy, ArrowUp, ArrowDown, Sparkles, AlertCircle, Eye, 
  FileText, ArrowUpRight, CheckCircle2, RefreshCw, X, Sliders, Palette, Move, Type, 
  Monitor, Tablet, Phone, Film, AlignLeft, ShieldCheck, ChevronDown, RotateCcw, BarChart3
} from 'lucide-react';
import { HeroBanner, CarouselSettings, BannerButtonConfig, SiteCMSConfig, Property, PropertyTypeCard, DEFAULT_VISUAL_LAYOUT_SETTINGS, VisualLayoutSettings } from '../../types';
import { firebaseService } from '../../lib/firebaseService';
import { mysqlClientService } from '../../lib/mysqlClientService';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../../firebase';
import LuxuryHeroCarousel from '../LuxuryHeroCarousel';
import MediaPicker from '../MediaPicker';

// Import modular subcomponents
import AnalyticsDashboard from './hero-builder/AnalyticsDashboard';
import CanvasSettings from './hero-builder/CanvasSettings';
import ButtonBuilder from './hero-builder/ButtonBuilder';
import LayerManager from './hero-builder/LayerManager';
import SEOAndMedia from './hero-builder/SEOAndMedia';
import RolePermissions from './hero-builder/RolePermissions';

// Helper to clean payload for Firestore compatibility (remove undefined and empty optional fields)
function cleanPayload(obj: any): any {
  if (obj === null || obj === undefined) return undefined;
  if (Array.isArray(obj)) {
    const cleanedArr = obj
      .map(item => cleanPayload(item))
      .filter(item => item !== undefined && item !== null);
    return cleanedArr.length > 0 ? cleanedArr : undefined;
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const isCore = ['id', 'bannerName', 'title', 'headline', 'desktopImage', 'status', 'enabled', 'order'].includes(key);
        if (value === undefined || value === null) {
          if (isCore) {
            cleaned[key] = value === null ? null : '';
          }
          continue;
        }
        if (typeof value === 'string' && value.trim() === '') {
          if (isCore) {
            cleaned[key] = '';
          }
          continue;
        }
        const cleanedVal = cleanPayload(value);
        if (cleanedVal !== undefined && cleanedVal !== null) {
          cleaned[key] = cleanedVal;
        }
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }
  return obj;
}

// Helper to determine if a banner is a Homepage Default Banner
function isDefaultBanner(banner: HeroBanner): boolean {
  const nameLower = (banner.bannerName || '').toLowerCase();
  const headlineLower = (banner.headline || '').toLowerCase();
  return nameLower.includes('default') || headlineLower.includes('default');
}

interface HeroBannerManagerProps {
  siteSettings?: SiteCMSConfig;
  setSiteSettings?: (newSettings: SiteCMSConfig) => void;
  properties?: Property[];
  categories?: PropertyTypeCard[];
  heroBanners?: HeroBanner[];
  useFirebase?: boolean;
}

export default function HeroBannerManager({
  siteSettings,
  setSiteSettings,
  properties = [],
  categories = [],
  heroBanners = [],
  useFirebase = false
}: HeroBannerManagerProps) {

  // Helpers to save and delete hero banners with MySQL support
  const saveHeroBannerLocal = async (banner: HeroBanner) => {
    if (useFirebase) {
      await firebaseService.saveHeroBanner(banner);
    } else {
      await mysqlClientService.saveHeroBanner(banner);
      // Background dual-write to Firestore for robustness
      firebaseService.saveHeroBanner(banner).catch(err => console.warn("Firebase backup write fail:", err));
      // Dispatch refresh event to update App.tsx state
      window.dispatchEvent(new CustomEvent('refresh-mysql-data'));
    }
  };

  const deleteHeroBannerLocal = async (id: string) => {
    if (useFirebase) {
      await firebaseService.deleteHeroBanner(id);
    } else {
      await mysqlClientService.deleteHeroBanner(id);
      // Background dual-write to Firestore for robustness
      firebaseService.deleteHeroBanner(id).catch(err => console.warn("Firebase backup delete fail:", err));
      // Dispatch refresh event to update App.tsx state
      window.dispatchEvent(new CustomEvent('refresh-mysql-data'));
    }
  };

  // --- CURRENT CMS CONFIG STATED ---
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerName, setBannerName] = useState('');
  const [bannerHeadline, setBannerHeadline] = useState('');
  const [bannerHighlightText, setBannerHighlightText] = useState('');
  const [bannerSubheading, setBannerSubheading] = useState('');
  const [bannerDescription, setBannerDescription] = useState('');
  const [bannerBadgeText, setBannerBadgeText] = useState('DVARIX REALTY');
  const [bannerPropertyCountBadge, setBannerPropertyCountBadge] = useState('500+ Verified Properties');
  
  // Display Mode (Mode 1: Exact, Mode 2: Dynamic, Mode 3: Video, Mode 4: Custom)
  const [displayMode, setDisplayMode] = useState<'Mode1' | 'Mode2' | 'Mode3' | 'Mode4'>('Mode2');

  // Simple image banner only option
  const [isSimpleImageOnly, setIsSimpleImageOnly] = useState(false);

  // Video Banner configuration (Mode 3)
  const [videoSettings, setVideoSettings] = useState({
    videoUrl: '',
    autoplay: true,
    loop: true,
    muted: true,
    poster: '',
    blur: 0,
    overlay: true
  });

  // Toggles for dynamic elements in Mode 2
  const [showStatistics, setShowStatistics] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  // Layout Canvas, Buttons, Custom visual layers
  const [canvasSettings, setCanvasSettings] = useState({
    desktopHeight: '600px',
    tabletHeight: '500px',
    mobileHeight: '400px',
    opacity: 100,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    glassEffect: false,
    objectFit: 'cover',
    imagePosition: 'center'
  });

  const [bgSettings, setBgSettings] = useState({
    backgroundImage: '',
    backgroundColor: '#FFFFFF',
    gradientBackground: '',
    overlayEnabled: true,
    overlayOpacity: 40,
    backgroundPosition: 'center',
    backgroundSize: 'cover'
  });

  const [floatingCardSettings, setFloatingCardSettings] = useState({
    enabled: true,
    title: '500+ Verified',
    label: 'Properties',
    description: 'Premium locations',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    opacity: 95,
    shadow: '0 20px 40px rgba(0,0,0,0.15)',
    borderRadius: 18,
    width: 200,
    position: 'bottom-right'
  });

  const [bannerButtons, setBannerButtons] = useState<any[]>([]);
  const [customLayers, setCustomLayers] = useState<any[]>([]);

  // SEO & Media meta settings
  const [seoSettings, setSeoSettings] = useState({
    metaTitle: '',
    metaDesc: '',
    lazyLoading: true
  });

  const [mediaMeta, setMediaMeta] = useState({
    altText: '',
    titleText: ''
  });

  // Image inputs
  const [bannerDesktopImageMethod, setBannerDesktopImageMethod] = useState<'upload' | 'url'>('url');
  const [bannerDesktopImage, setBannerDesktopImage] = useState('');
  const [bannerMobileImageMethod, setBannerMobileImageMethod] = useState<'upload' | 'url'>('url');
  const [bannerMobileImage, setBannerMobileImage] = useState('');

  const [desktopUploading, setDesktopUploading] = useState(false);
  const [desktopProgress, setDesktopProgress] = useState(0);
  const [mobileUploading, setMobileUploading] = useState(false);
  const [mobileProgress, setMobileProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageWarning, setImageWarning] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [animations, setAnimations] = useState({
    enabled: true,
    type: 'fade' as 'fade' | 'slide-left' | 'slide-right' | 'zoom' | 'scale',
    duration: 0.8
  });

  const [visualLayoutSettings, setVisualLayoutSettings] = useState<VisualLayoutSettings>(DEFAULT_VISUAL_LAYOUT_SETTINGS);

  // Status & Date scheduling
  const [bannerOrder, setBannerOrder] = useState(1);
  const [bannerStatus, setBannerStatus] = useState<HeroBanner['status']>('active');
  const [bannerPublishDate, setBannerPublishDate] = useState('');
  const [bannerExpiryDate, setBannerExpiryDate] = useState('');

  // Version Control History (Undo / Redo Visual Stacks)
  const [historyStack, setHistoryStack] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Role Based permissions
  const [currentRole, setCurrentRole] = useState('Super Admin');

  // Preview object
  const [bannerPreviewObject, setBannerPreviewObject] = useState<HeroBanner | null>(null);

  // Accordion active fold keys
  const [activeAccordion, setActiveAccordion] = useState<string | null>('general');

  // CAROUSEL SETTINGS
  const [carouselAutoPlay, setCarouselAutoPlay] = useState(true);
  const [carouselDuration, setCarouselDuration] = useState<number>(5);
  const [carouselSpeed, setCarouselSpeed] = useState<'fast' | 'normal' | 'slow'>('normal');
  const [carouselArrows, setCarouselArrows] = useState(true);
  const [carouselDots, setCarouselDots] = useState(true);
  const [carouselPause, setCarouselPause] = useState(true);
  const [carouselLoop, setCarouselLoop] = useState(true);

  // Load site carousel config
  useEffect(() => {
    if (siteSettings?.carouselSettings) {
      setCarouselAutoPlay(siteSettings.carouselSettings.autoPlay);
      setCarouselDuration(siteSettings.carouselSettings.autoSlideDuration || 5);
      setCarouselSpeed(siteSettings.carouselSettings.transitionSpeed || 'normal');
      setCarouselArrows(siteSettings.carouselSettings.showNavigationArrows !== false);
      setCarouselDots(siteSettings.carouselSettings.showPaginationDots !== false);
      setCarouselPause(siteSettings.carouselSettings.pauseOnHover !== false);
      setCarouselLoop(siteSettings.carouselSettings.infiniteLoop !== false);
    }
  }, [siteSettings?.carouselSettings]);

  // Version auto-save capture helper
  const captureVersionState = (stateObj: any) => {
    const newStack = historyStack.slice(0, historyIndex + 1);
    newStack.push(JSON.parse(JSON.stringify(stateObj)));
    setHistoryStack(newStack);
    setHistoryIndex(newStack.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetIdx = historyIndex - 1;
      setHistoryIndex(targetIdx);
      applyVersionState(historyStack[targetIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      const targetIdx = historyIndex + 1;
      setHistoryIndex(targetIdx);
      applyVersionState(historyStack[targetIdx]);
    }
  };

  const applyVersionState = (state: any) => {
    if (!state) return;
    setBannerHeadline(state.headline || '');
    setBannerDescription(state.description || '');
    setDisplayMode(state.displayMode || 'Mode2');
    setCanvasSettings(state.canvasSettings || {});
    setBgSettings(state.backgroundSettings || {});
    setBannerButtons(state.bannerButtons || []);
    setCustomLayers(state.customLayers || []);
  };

  // Upload image to Firebase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size and format
    const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedFormats.includes(file.type)) {
      setUploadError('Unsupported file format. Please upload JPG, PNG, or WEBP images.');
      return;
    }
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('File is too large. Maximum allowed size is 10 MB.');
      return;
    }

    setImageWarning(null);

    // Validate image dimensions using FileReader
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const aspect = width / height;

        let warningMsg = '';
        if (target === 'desktop') {
          const targetAspect = 16 / 9;
          const deviatesAspect = Math.abs(aspect - targetAspect) > 0.15;
          const isTooSmall = width < 1600 || height < 900;
          if (deviatesAspect) {
            warningMsg += `⚠️ Desktop image aspect ratio (${(width/height).toFixed(2)}) deviates from recommended 16:9. Image might be cropped. `;
          }
          if (isTooSmall) {
            warningMsg += `⚠️ Small desktop image (under 1600x900 px, uploaded: ${width}x${height}). Might look pixelated. `;
          }
        } else {
          const targetAspect = 9 / 16;
          const deviatesAspect = Math.abs(aspect - targetAspect) > 0.25;
          const isTooSmall = width < 720 || height < 1280;
          if (deviatesAspect) {
            warningMsg += `⚠️ Mobile image aspect ratio (${(width/height).toFixed(2)}) deviates from recommended 9:16 portrait style. `;
          }
          if (isTooSmall) {
            warningMsg += `⚠️ Small mobile image (under 720x1280 px, uploaded: ${width}x${height}). `;
          }
        }

        if (file.size > 1.5 * 1024 * 1024) {
          warningMsg += `⚠️ Large file size (${(file.size / 1024 / 1024).toFixed(1)}MB). Recommend compressing to under 1MB for faster page loads. `;
        }

        if (warningMsg) {
          setImageWarning(warningMsg);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    const bannerId = editingBannerId || `banner_${Date.now()}`;
    // Assign a consistent ID if creating a new banner so the storage path is structured
    if (!editingBannerId) {
      setEditingBannerId(bannerId);
    }

    if (target === 'desktop') {
      setDesktopUploading(true);
      setDesktopProgress(0);
    } else {
      setMobileUploading(true);
      setMobileProgress(0);
    }
    setUploadError(null);

    try {
      const filename = `${target}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${file.name.split('.').pop()}`;
      const storagePath = `hero_banners/${bannerId}/${filename}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          if (target === 'desktop') {
            setDesktopProgress(progress);
          } else {
            setMobileProgress(progress);
          }
        },
        (error) => {
          console.error("Upload error:", error);
          setUploadError(`Upload failed: ${error.message}`);
          if (target === 'desktop') {
            setDesktopUploading(false);
          } else {
            setMobileUploading(false);
          }
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (target === 'desktop') {
              setBannerDesktopImage(downloadUrl);
              setDesktopUploading(false);
            } else {
              setBannerMobileImage(downloadUrl);
              setMobileUploading(false);
            }
            notify("Image Uploaded", `The ${target} background image was successfully uploaded to Firebase Storage.`);
          } catch (err: any) {
            console.error("Failed to get download URL:", err);
            setUploadError(`Failed to retrieve download URL: ${err.message}`);
            if (target === 'desktop') {
              setDesktopUploading(false);
            } else {
              setMobileUploading(false);
            }
          }
        }
      );
    } catch (err: any) {
      console.error("Upload setup error:", err);
      setUploadError(err.message || 'Unknown error occurred during setup');
      if (target === 'desktop') {
        setDesktopUploading(false);
      } else {
        setMobileUploading(false);
      }
    }
  };

  const notify = (title: string, message: string) => {
    window.dispatchEvent(new CustomEvent('cms-alert-notification', {
      detail: { title, message, category: 'CMS' }
    }));
  };

  // Populate editor form on click edit
  const handleEdit = (banner: HeroBanner) => {
    setEditingBannerId(banner.id);
    setBannerName(banner.bannerName || '');
    setBannerHeadline(banner.headline || '');
    setBannerHighlightText(banner.highlightText || '');
    setBannerSubheading(banner.subheading || '');
    setBannerDescription(banner.description || '');
    setBannerBadgeText(banner.badgeText || 'DVARIX REALTY');
    setBannerPropertyCountBadge(banner.propertyCountBadge || '500+ Verified Properties');
    setDisplayMode(banner.displayMode || 'Mode2');
    setIsSimpleImageOnly(banner.displayMode === 'Mode1');
    
    setBannerDesktopImageMethod(banner.desktopImageMethod || 'url');
    setBannerDesktopImage(banner.desktopImage || '');
    setBannerMobileImageMethod(banner.mobileImageMethod || 'url');
    setBannerMobileImage(banner.mobileImage || '');

    setVideoSettings(banner.videoSettings || {
      videoUrl: '',
      autoplay: true,
      loop: true,
      muted: true,
      poster: '',
      blur: 0,
      overlay: true
    });

    setShowStatistics(!!banner.showStatistics);
    setShowSearchBar(!!banner.showSearchBar);
    setShowContactForm(!!banner.showContactForm);

    setCanvasSettings(banner.canvasSettings || {
      desktopHeight: '600px',
      tabletHeight: '500px',
      mobileHeight: '400px',
      opacity: 100,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      glassEffect: false,
      objectFit: 'cover',
      imagePosition: 'center'
    });

    setBgSettings(banner.backgroundSettings || {
      backgroundImage: '',
      backgroundColor: '#FFFFFF',
      gradientBackground: '',
      overlayEnabled: true,
      overlayOpacity: 40,
      backgroundPosition: 'center',
      backgroundSize: 'cover'
    });

    setFloatingCardSettings(banner.floatingCardSettings || {
      enabled: true,
      title: '500+ Verified',
      label: 'Properties',
      description: 'Premium locations',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      opacity: 95,
      shadow: '0 20px 40px rgba(0,0,0,0.15)',
      borderRadius: 18,
      width: 200,
      position: 'bottom-right'
    });

    setBannerButtons(banner.bannerButtons || []);
    setCustomLayers(banner.customLayers || []);
    
    setSeoSettings(banner.seoSettings || {
      metaTitle: '',
      metaDesc: '',
      lazyLoading: true
    });

    setMediaMeta(banner.mediaMeta || {
      altText: '',
      titleText: ''
    });

    // Populate animations state
    setAnimations(banner.animation || {
      enabled: true,
      type: 'fade',
      duration: 0.8
    });

    setVisualLayoutSettings(banner.visualLayoutSettings || DEFAULT_VISUAL_LAYOUT_SETTINGS);

    // Map status values cleanly
    let mappedStatus = banner.status || 'Draft';
    if (mappedStatus === 'active') mappedStatus = 'Published';
    if (mappedStatus === 'inactive' || mappedStatus === 'Hidden') mappedStatus = 'Draft';
    setBannerStatus(mappedStatus);

    setBannerOrder(banner.order || 1);
    setBannerPublishDate(banner.publishDate || '');
    setBannerExpiryDate(banner.expiryDate || '');

    setBannerPreviewObject(null);

    const el = document.getElementById('luxury-banner-editor-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingBannerId(null);
    setBannerName('');
    setBannerHeadline('');
    setBannerHighlightText('');
    setBannerSubheading('');
    setBannerDescription('');
    setBannerDesktopImage('');
    setBannerMobileImage('');
    setBannerButtons([]);
    setCustomLayers([]);
    setAnimations({
      enabled: true,
      type: 'fade',
      duration: 0.8
    });
    setBannerStatus('Draft');
    setBannerPublishDate('');
    setBannerExpiryDate('');
    setBannerPreviewObject(null);
    setIsSimpleImageOnly(false);
    setVisualLayoutSettings(DEFAULT_VISUAL_LAYOUT_SETTINGS);
  };

  // Publish Status Trigger
  const handleToggleStatus = async (banner: HeroBanner) => {
    console.log("[CMS DIAGNOSTIC] Toggle status clicked for banner ID:", banner.id);
    const currentStatus = banner.status || 'Draft';
    const isCurrentlyPublished = currentStatus === 'Published' || currentStatus === 'active';
    const newStatus: HeroBanner['status'] = isCurrentlyPublished ? 'Draft' : 'Published';
    
    // If we are publishing this default banner, unpublish any other active default banners
    if (newStatus === 'Published' && isDefaultBanner(banner)) {
      console.log(`[CMS DIAGNOSTIC] Toggling default banner to Published. Checking other default banners to unpublish.`);
      try {
        const defaultBannersToUnpublish = heroBanners.filter(b => 
          b.id !== banner.id && 
          isDefaultBanner(b) && 
          (b.status === 'Published' || b.status === 'active')
        );

        for (const oldBanner of defaultBannersToUnpublish) {
          console.log(`[CMS DIAGNOSTIC] Automatically unpublishing old default banner during toggle: ${oldBanner.id}`);
          const unpublished = {
            ...oldBanner,
            status: 'Draft' as const,
            enabled: false,
            lastUpdated: new Date().toISOString()
          };
          await saveHeroBannerLocal(unpublished);
        }
      } catch (err: any) {
        console.error(`[CMS DIAGNOSTIC ERROR] File: src/components/cms/HeroBannerManager.tsx, Component: HeroBannerManager, Function: handleToggleStatus - Auto-Unpublish, Line: 495, Root Cause: Failed to unpublish previous default banner, Original Error:`, err);
      }
    }

    const updatedBanner: HeroBanner = {
      ...banner,
      status: newStatus,
      enabled: newStatus === 'Published',
      lastUpdated: new Date().toISOString()
    };

    try {
      console.log(`[CMS DIAGNOSTIC] MySQL toggle write start for banner ID: ${banner.id}`);
      await saveHeroBannerLocal(updatedBanner);
      console.log(`[CMS DIAGNOSTIC] MySQL toggle write success for banner ID: ${banner.id}`);
      console.log(`[CMS DIAGNOSTIC] List refreshed successfully via subscription.`);
      console.log(`[CMS DIAGNOSTIC] Homepage displays immediately synchronized.`);

      notify(
        newStatus === 'Published' ? "Slide Published" : "Slide Unpublished", 
        `The slide is now ${newStatus === 'Published' ? 'Published (Active)' : 'Draft (Offline)'}.`
      );
    } catch (error: any) {
      console.error(`[CMS DIAGNOSTIC ERROR] File: src/components/cms/HeroBannerManager.tsx, Component: HeroBannerManager, Function: handleToggleStatus, Line: 512, Root Cause: Failed to toggle status in Firestore, Original Error:`, error);
      alert(`Status Toggle Failed!\n\nOriginal Firebase Error: ${error?.message || error}`);
    }
  };

  const handleDuplicate = async (banner: HeroBanner) => {
    console.log("[CMS DIAGNOSTIC] Duplicate clicked for banner ID:", banner.id);
    const newId = `banner_${Date.now()}`;
    const newBanner: HeroBanner = {
      ...banner,
      id: newId,
      bannerName: banner.bannerName ? `${banner.bannerName} (Copy)` : "Copied Slide",
      order: heroBanners.length + 1,
      lastUpdated: new Date().toISOString()
    };
    
    try {
      console.log(`[CMS DIAGNOSTIC] MySQL duplicate write start. ID: ${newId}`);
      await saveHeroBannerLocal(newBanner);
      console.log(`[CMS DIAGNOSTIC] MySQL duplicate write success. ID: ${newId}`);
      console.log(`[CMS DIAGNOSTIC] List refreshed successfully via subscription.`);
      notify("Slide Duplicated", "Copy added successfully.");
    } catch (error: any) {
      console.error(`[CMS DIAGNOSTIC ERROR] File: src/components/cms/HeroBannerManager.tsx, Component: HeroBannerManager, Function: handleDuplicate, Line: 535, Root Cause: Failed to write duplicated banner to Firestore, Original Error:`, error);
      alert(`Duplicate Failed!\n\nOriginal Firebase Error: ${error?.message || error}`);
    }
  };

  const handleDelete = async (bannerId: string) => {
    console.log("[CMS DIAGNOSTIC] Delete clicked for banner ID:", bannerId);
    if (!confirm("Are you sure you want to delete this premium hero banner?")) return;
    
    try {
      console.log(`[CMS DIAGNOSTIC] MySQL delete start. ID: ${bannerId}`);
      await deleteHeroBannerLocal(bannerId);
      console.log(`[CMS DIAGNOSTIC] MySQL delete success. ID: ${bannerId}`);
      console.log(`[CMS DIAGNOSTIC] List refreshed successfully via subscription.`);
      notify("Slide Deleted", "Banner removed successfully.");
    } catch (error: any) {
      console.error(`[CMS DIAGNOSTIC ERROR] File: src/components/cms/HeroBannerManager.tsx, Component: HeroBannerManager, Function: handleDelete, Line: 554, Root Cause: Failed to delete banner from Firestore, Original Error:`, error);
      alert(`Delete Failed!\n\nOriginal Firebase Error: ${error?.message || error}`);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    console.log(`[CMS DIAGNOSTIC] Move order clicked. Direction: ${direction}, Index: ${index}`);
    const bannersList = [...heroBanners].sort((a, b) => (a.order || 0) - (b.order || 0));
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= bannersList.length) return;

    const temp = bannersList[index];
    bannersList[index] = bannersList[targetIdx];
    bannersList[targetIdx] = temp;

    try {
      console.log(`[CMS DIAGNOSTIC] MySQL batch update start for ordering.`);
      const promises = bannersList.map((b, idx) => {
        return saveHeroBannerLocal({ ...b, order: idx + 1 });
      });
      await Promise.all(promises);
      console.log(`[CMS DIAGNOSTIC] MySQL batch update success for ordering.`);
      console.log(`[CMS DIAGNOSTIC] List refreshed successfully via subscription.`);
      notify("Display Order Updated", "Slide rotators updated.");
    } catch (error: any) {
      console.error(`[CMS DIAGNOSTIC ERROR] File: src/components/cms/HeroBannerManager.tsx, Component: HeroBannerManager, Function: handleMoveOrder, Line: 580, Root Cause: Failed to update banner order indexes in Firestore, Original Error:`, error);
      alert(`Order Update Failed!\n\nOriginal Firebase Error: ${error?.message || error}`);
    }
  };

  // Bulk operation actions
  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    console.log(`[CMS DIAGNOSTIC] Bulk action triggered: ${action}`);
    if (action === 'delete' && !confirm("Delete all non-active banners?")) return;
    
    try {
      const promises = heroBanners.map((b) => {
        if (action === 'publish') {
          console.log(`[CMS DIAGNOSTIC] Bulk publishing banner ID: ${b.id}`);
          return saveHeroBannerLocal({ ...b, status: 'Published', enabled: true, lastUpdated: new Date().toISOString() });
        } else if (action === 'unpublish') {
          console.log(`[CMS DIAGNOSTIC] Bulk unpublishing banner ID: ${b.id}`);
          return saveHeroBannerLocal({ ...b, status: 'Draft', enabled: false, lastUpdated: new Date().toISOString() });
        } else {
          if (b.status !== 'Published' && b.status !== 'active') {
            console.log(`[CMS DIAGNOSTIC] Bulk deleting banner ID: ${b.id}`);
            return deleteHeroBannerLocal(b.id);
          }
        }
        return Promise.resolve();
      });
      
      await Promise.all(promises);
      console.log(`[CMS DIAGNOSTIC] Bulk action completed successfully.`);
      console.log(`[CMS DIAGNOSTIC] List refreshed successfully via subscription.`);
      notify("Bulk Action Completed", `Operations executed successfully on all matches.`);
    } catch (error: any) {
      console.error(`[CMS DIAGNOSTIC ERROR] File: src/components/cms/HeroBannerManager.tsx, Component: HeroBannerManager, Function: handleBulkAction, Line: 609, Root Cause: Failed to complete bulk action on Firestore, Original Error:`, error);
      alert(`Bulk Action Failed!\n\nOriginal Firebase Error: ${error?.message || error}`);
    }
  };

  // Complete Firestore save
  const handleSaveBanner = async () => {
    console.log("[CMS DIAGNOSTIC] 'Publish Banner' button clicked. Editing ID:", editingBannerId);

    // 1. Validation of fields (Only essential fields: Banner Title, Main Heading, Background Image, Banner Status)
    let finalBannerName = bannerName;
    let finalBannerHeadline = bannerHeadline;

    if (isSimpleImageOnly) {
      if (!bannerDesktopImage.trim()) {
        alert("Background Image URL is required! Please specify a valid Image URL or upload a file.");
        return;
      }
      finalBannerName = bannerName.trim() || "Simple Image - " + (bannerDesktopImage ? bannerDesktopImage.split('/').pop()?.split('?')[0]?.substring(0, 25) : Date.now());
      finalBannerHeadline = "Simple Image Banner";
    } else {
      if (!bannerName.trim()) {
        alert("Banner Title (Administrative Slide Name) is required!");
        return;
      }
      if (!bannerHeadline.trim()) {
        alert("Main Heading (Large Display Headline) is required!");
        return;
      }
      if (!bannerDesktopImage.trim()) {
        alert("Background Image is required! Please specify a valid Image URL or upload a file.");
        return;
      }
    }

    if (!bannerStatus) {
      alert("Banner Status is required!");
      return;
    }

    console.log("[CMS DIAGNOSTIC] Form validation passed.");

    if (isSaving) {
      console.warn("[CMS DIAGNOSTIC] Save operation is already in progress. Ignoring duplicate click.");
      return;
    }
    setIsSaving(true);

    // Get current audit info
    const existing = editingBannerId ? heroBanners.find(b => b.id === editingBannerId) : null;
    const createdAt = existing?.createdAt || existing?.lastUpdated || new Date().toISOString();
    const createdBy = existing?.createdBy || auth.currentUser?.email || 'dvarixrealty@gmail.com';
    const statusValue = bannerStatus || 'Draft';
    const finalDisplayMode = isSimpleImageOnly ? 'Mode1' : displayMode;

    const rawBanner: HeroBanner = {
      id: editingBannerId || `banner_${Date.now()}`,
      bannerName: finalBannerName,
      title: finalBannerName, // Save title for explicit requirements
      headline: finalBannerHeadline,
      highlightText: isSimpleImageOnly ? undefined : (bannerHighlightText || undefined),
      subheading: isSimpleImageOnly ? undefined : (bannerSubheading || undefined),
      description: isSimpleImageOnly ? '' : bannerDescription,
      badgeText: isSimpleImageOnly ? '' : (bannerBadgeText || 'DVARIX REALTY'),
      propertyCountBadge: isSimpleImageOnly ? '' : (bannerPropertyCountBadge || '500+ Verified Properties'),
      displayMode: finalDisplayMode,
      
      desktopImageMethod: bannerDesktopImageMethod,
      desktopImage: bannerDesktopImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      mobileImageMethod: bannerMobileImageMethod,
      mobileImage: bannerMobileImage || bannerDesktopImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',

      videoSettings,
      showStatistics: isSimpleImageOnly ? false : showStatistics,
      showSearchBar: isSimpleImageOnly ? false : showSearchBar,
      showContactForm: isSimpleImageOnly ? false : showContactForm,

      canvasSettings,
      backgroundSettings: bgSettings,
      floatingCardSettings,
      bannerButtons: isSimpleImageOnly ? [] : bannerButtons,
      customLayers: isSimpleImageOnly ? [] : customLayers,
      seoSettings,
      mediaMeta,
      visualLayoutSettings,

      // High-level explicit structures requested by user
      hero: {
        displayMode: finalDisplayMode,
        headline: finalBannerHeadline,
        highlightText: isSimpleImageOnly ? '' : bannerHighlightText,
        subheading: isSimpleImageOnly ? '' : bannerSubheading,
        description: isSimpleImageOnly ? '' : bannerDescription,
        badgeText: isSimpleImageOnly ? '' : bannerBadgeText,
        propertyCountBadge: isSimpleImageOnly ? '' : bannerPropertyCountBadge,
        videoSettings,
        showStatistics: isSimpleImageOnly ? false : showStatistics,
        showSearchBar: isSimpleImageOnly ? false : showSearchBar,
        showContactForm: isSimpleImageOnly ? false : showContactForm,
        floatingCardSettings
      },
      buttons: bannerButtons,
      overlay: {
        enabled: bgSettings.overlayEnabled,
        opacity: bgSettings.overlayOpacity,
        color: bgSettings.backgroundColor
      },
      images: {
        desktopImage: bannerDesktopImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        mobileImage: bannerMobileImage || bannerDesktopImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        desktopMethod: bannerDesktopImageMethod,
        mobileMethod: bannerMobileImageMethod
      },
      animation: animations,
      animations: animations, // Save under both "animation" and "animations"

      order: Number(bannerOrder) || heroBanners.length + 1,
      status: statusValue,
      enabled: statusValue === 'Published' || statusValue === 'active',
      publishDate: bannerPublishDate || undefined,
      expiryDate: bannerExpiryDate || undefined,
      createdAt,
      updatedAt: new Date().toISOString(),
      createdBy,
      lastUpdated: new Date().toISOString()
    };

    // Clean payload by recursively removing undefined, null, or empty optional values
    const cleanNewBanner = cleanPayload(rawBanner);
    console.log("[CMS DIAGNOSTIC] Clean payload created successfully:", JSON.stringify(cleanNewBanner, null, 2));

    try {
      // Ensure only one Homepage Default Banner can remain published
      const isThisDefault = isDefaultBanner(cleanNewBanner);
      const isThisPublished = statusValue === 'Published' || statusValue === 'active';

      if (isThisDefault && isThisPublished) {
        console.log(`[CMS DIAGNOSTIC] Saving banner is a published Default Banner. Ensuring only one remains published.`);
        const defaultBannersToUnpublish = heroBanners.filter(b => 
          b.id !== cleanNewBanner.id && 
          isDefaultBanner(b) && 
          (b.status === 'Published' || b.status === 'active')
        );

        for (const oldBanner of defaultBannersToUnpublish) {
          console.log(`[CMS DIAGNOSTIC] Automatically unpublishing old default banner: ${oldBanner.id}`);
          const unpublished = {
            ...oldBanner,
            status: 'Draft' as const,
            enabled: false,
            lastUpdated: new Date().toISOString()
          };
          await saveHeroBannerLocal(unpublished);
        }
      }

      console.log(`[CMS DIAGNOSTIC] MySQL write start. Document ID: ${cleanNewBanner.id}`);
      await saveHeroBannerLocal(cleanNewBanner);
      console.log(`[CMS DIAGNOSTIC] MySQL write success for banner ID: ${cleanNewBanner.id}`);

      // Auto-refresh the banner list & update CMS state
      console.log(`[CMS DIAGNOSTIC] Banner list refresh successfully triggered by real-time Firestore subscription.`);
      console.log(`[CMS DIAGNOSTIC] Published banner immediately synchronized with homepage display logic.`);

      notify(
        editingBannerId ? "Slide Refreshed" : "Slide Created",
        statusValue === 'Published' 
          ? "Enterprise banner published to active pool successfully." 
          : "Slide saved to draft pool successfully."
      );
      
      resetForm();
    } catch (error: any) {
      console.error(`[CMS DIAGNOSTIC ERROR] File: src/components/cms/HeroBannerManager.tsx, Component: HeroBannerManager, Function: handleSaveBanner, Line: 638, Root Cause: Failed to execute setDoc on Firestore collection banner_management, Original Error:`, error);
      alert(`Firestore Write Failed!\n\nOriginal Firebase Error: ${error?.message || error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerPreview = (banner?: HeroBanner) => {
    if (banner) {
      setBannerPreviewObject(banner);
      return;
    }
    const previewObj: HeroBanner = {
      id: 'preview',
      bannerName: bannerName || 'Live Visual Preview',
      headline: bannerHeadline,
      highlightText: bannerHighlightText,
      subheading: bannerSubheading,
      description: bannerDescription,
      badgeText: bannerBadgeText,
      propertyCountBadge: bannerPropertyCountBadge,
      displayMode,
      desktopImageMethod: bannerDesktopImageMethod,
      desktopImage: bannerDesktopImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      mobileImageMethod: bannerMobileImageMethod,
      mobileImage: bannerMobileImage || bannerDesktopImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      videoSettings,
      showStatistics,
      showSearchBar,
      showContactForm,
      canvasSettings,
      backgroundSettings: bgSettings,
      floatingCardSettings,
      bannerButtons,
      customLayers,
      seoSettings,
      mediaMeta,
      order: 1,
      status: 'active',
      enabled: true,
      lastUpdated: new Date().toISOString()
    };
    setBannerPreviewObject(previewObj);
  };

  const handleSaveCarouselTimers = () => {
    const updated: SiteCMSConfig = {
      ...(siteSettings as SiteCMSConfig),
      carouselSettings: {
        autoPlay: carouselAutoPlay,
        autoSlideDuration: carouselDuration,
        transitionSpeed: carouselSpeed,
        showNavigationArrows: carouselArrows,
        showPaginationDots: carouselDots,
        pauseOnHover: carouselPause,
        infiniteLoop: carouselLoop
      }
    };
    if (setSiteSettings) setSiteSettings(updated);
    firebaseService.saveSiteSettings(updated);
    notify("Timing Saved", "Slider timings refreshed successfully.");
  };

  const isReadOnly = currentRole === 'Read Only';

  return (
    <div className="bg-slate-50/50 p-6 md:p-8 rounded-3xl border border-slate-100" id="enterprise-hero-cms-root">
      
      {/* HEADER META PANEL */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-slate-200/60 mb-8">
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#10B981]/10 text-[#10B981] text-[10px] font-black uppercase tracking-widest rounded-full font-mono mb-2">
            <Sparkles className="w-3 h-3" /> Enterprise Module
          </span>
          <h2 className="text-2xl font-serif font-semibold text-slate-900 tracking-tight">Visual Hero Banner CMS</h2>
          <p className="text-xs text-slate-500 font-light mt-1">Design responsive banner canvas elements, overlays, video frames, and CTA routers.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Undo/Redo Controls */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-1 py-1">
            <button 
              type="button"
              onClick={handleUndo} 
              disabled={historyIndex <= 0}
              className="p-1.5 text-slate-600 hover:bg-slate-50 rounded disabled:opacity-30 cursor-pointer"
              title="Undo Visual State"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button 
              type="button"
              onClick={handleRedo} 
              disabled={historyIndex >= historyStack.length - 1}
              className="p-1.5 text-slate-600 hover:bg-slate-50 rounded disabled:opacity-30 cursor-pointer rotate-180"
              title="Redo Visual State"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button 
            type="button"
            onClick={() => handleBulkAction('publish')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Bulk Publish All
          </button>
          <button 
            type="button"
            onClick={() => handleBulkAction('unpublish')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Bulk Hide All
          </button>
        </div>
      </div>

      {/* TWO COLUMN GRID WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: ACTIVE BANNERS ROTATOR LIST (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-sm font-bold text-slate-800 uppercase tracking-wider font-mono">Banners Pool</h3>
              <span className="text-[10px] font-mono text-slate-400 font-bold">{heroBanners.length} Slides</span>
            </div>

             {heroBanners.length === 0 ? (
              <div className="text-center py-10 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center gap-3">
                <Image className="w-10 h-10 text-slate-300 animate-pulse" />
                <p className="text-xs font-bold text-slate-700">No Hero Banners Exist</p>
                <p className="text-[11px] text-slate-400 max-w-[180px] leading-relaxed">Establish your first luxury presentation for the homepage.</p>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    const el = document.getElementById('luxury-banner-editor-form');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 bg-[#10B981] hover:bg-[#0da471] text-white text-xs font-bold rounded-lg cursor-pointer transition shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Banner
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {[...heroBanners].sort((a,b) => (a.order || 0) - (b.order || 0)).map((banner, index) => {
                  const currentStatus = banner.status || 'Draft';
                  let statusBadgeColor = 'bg-slate-100 text-slate-600 border-slate-200';
                  if (currentStatus === 'Published' || currentStatus === 'active') {
                    statusBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  } else if (currentStatus === 'Archived') {
                    statusBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                  }

                  return (
                    <div 
                      key={banner.id} 
                      className={`p-4 border rounded-2xl flex flex-col gap-3 transition ${
                        editingBannerId === banner.id 
                          ? 'border-[#10B981] bg-emerald-50/5 shadow-xs' 
                          : 'border-slate-200/60 bg-white hover:bg-slate-50/50 shadow-2xs'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-slate-800 truncate" title={banner.bannerName || banner.headline}>
                            {banner.bannerName || banner.headline || 'Untitled Slide'}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 border rounded-md uppercase tracking-wider ${statusBadgeColor}`}>
                              {currentStatus === 'active' ? 'Published' : currentStatus}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              Idx: {banner.order || 1}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button 
                            type="button" 
                            onClick={() => handleMoveOrder(index, 'up')} 
                            disabled={index === 0}
                            className="p-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-500 disabled:opacity-20 cursor-pointer animate-none"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleMoveOrder(index, 'down')} 
                            disabled={index === heroBanners.length - 1}
                            className="p-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-500 disabled:opacity-20 cursor-pointer animate-none"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Explicit Action Buttons Panel */}
                      <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-100 mt-1">
                        <div className="flex items-center gap-1">
                          <button 
                            type="button" 
                            onClick={() => handleEdit(banner)}
                            className="p-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 rounded-lg cursor-pointer transition animate-none"
                            title="Edit Slide Config"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          
                          <button 
                            type="button" 
                            onClick={() => handleTriggerPreview(banner)}
                            className="p-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 rounded-lg cursor-pointer transition animate-none"
                            title="Live Canvas Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button 
                            type="button" 
                            onClick={() => handleDuplicate(banner)}
                            className="p-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 rounded-lg cursor-pointer transition animate-none"
                            title="Duplicate Config"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Fast status switches */}
                          {(currentStatus === 'Draft' || currentStatus === 'Archived' || currentStatus === 'inactive') ? (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(banner)}
                              className="px-2 py-1 bg-[#10B981] hover:bg-[#0da471] text-white rounded-md text-[10px] font-bold cursor-pointer transition animate-none"
                            >
                              Publish
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(banner)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-[10px] font-bold cursor-pointer transition animate-none"
                            >
                              Unpublish
                            </button>
                          )}

                          {currentStatus !== 'Archived' && (
                            <button
                              type="button"
                              onClick={async () => {
                                const updated: HeroBanner = { ...banner, status: 'Archived', enabled: false, lastUpdated: new Date().toISOString() };
                                await saveHeroBannerLocal(updated);
                                notify("Slide Archived", "Slide status marked as Archived successfully.");
                              }}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-md text-[10px] font-bold cursor-pointer transition animate-none"
                            >
                              Archive
                            </button>
                          )}

                          <button 
                            type="button" 
                            onClick={() => handleDelete(banner.id)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg cursor-pointer transition animate-none"
                            title="Permanent Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* GLOBAL TIMING ROTATORS CARD */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-serif text-sm font-bold text-slate-800 uppercase tracking-wider font-mono">Rotator Timing Settings</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">Transition Speed Curve</label>
                <select 
                  value={carouselSpeed} 
                  onChange={(e) => setCarouselSpeed(e.target.value as any)}
                  className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-white"
                >
                  <option value="fast">Fast (0.25s Fade)</option>
                  <option value="normal">Standard (0.50s Fade)</option>
                  <option value="slow">Luxury Luxury (1.00s Slow)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">Slide Stay Duration (seconds)</label>
                <input 
                  type="number" 
                  value={carouselDuration} 
                  onChange={(e) => setCarouselDuration(Number(e.target.value))}
                  className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-white font-mono"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-slate-50">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={carouselAutoPlay} onChange={(e) => setCarouselAutoPlay(e.target.checked)} className="rounded" />
                  Auto Play slides
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={carouselArrows} onChange={(e) => setCarouselArrows(e.target.checked)} className="rounded" />
                  Show side navigations
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={carouselDots} onChange={(e) => setCarouselDots(e.target.checked)} className="rounded" />
                  Show pagination indicators
                </label>
              </div>

              <button 
                type="button" 
                onClick={handleSaveCarouselTimers}
                className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl mt-3 hover:bg-slate-800 transition cursor-pointer"
              >
                Save Rotator Timers
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE VISUAL HERO BUILDER (8 cols) */}
        <div className="lg:col-span-8 space-y-6" id="luxury-banner-editor-form">
          
          {/* INTERFACE TYPE SELECTOR */}
          <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black text-slate-800 uppercase tracking-wider font-mono">Editor Workspace Mode</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Choose between simplified single-image upload or advanced visual builder</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setIsSimpleImageOnly(false);
                  if (displayMode === 'Mode1') setDisplayMode('Mode2');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${!isSimpleImageOnly ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Advanced Multi-Layer Builder
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSimpleImageOnly(true);
                  setDisplayMode('Mode1');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${isSimpleImageOnly ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Simple Image Banner
              </button>
            </div>
          </div>

          {isSimpleImageOnly ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
              <div>
                <h4 className="text-sm font-black text-slate-800 font-mono uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
                  Simple Image Banner Configuration
                </h4>
              </div>

              {/* Administrative name for reference */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Banner Name (Optional - For administrative reference)</label>
                <input 
                  type="text" 
                  value={bannerName} 
                  onChange={(e) => setBannerName(e.target.value)}
                  placeholder="e.g. Summer Campaign Poster"
                  className="w-full text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#10B981]"
                />
              </div>

              {/* 1. Banner Image */}
              <div className="space-y-3">
                <MediaPicker
                  label="Banner Image"
                  value={bannerDesktopImage}
                  onChange={(url) => setBannerDesktopImage(url)}
                  folder="banners"
                  category="Banners"
                />
              </div>

              {/* 2. Banner Status & 3. Display Order */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Banner Status</label>
                  <select 
                    value={bannerStatus} 
                    onChange={(e) => setBannerStatus(e.target.value as any)}
                    className="w-full text-xs border border-slate-200 p-2.5 rounded-lg bg-white focus:outline-none focus:border-[#10B981]"
                  >
                    <option value="Draft">Inactive (Draft)</option>
                    <option value="Published">Active (Published)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Display Order</label>
                  <input 
                    type="number" 
                    min={1}
                    value={bannerOrder} 
                    onChange={(e) => setBannerOrder(Number(e.target.value))}
                    className="w-full text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#10B981]"
                  />
                </div>
              </div>

              {/* 4. Publish / Update Button */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                {editingBannerId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer text-xs font-bold"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveBanner}
                  disabled={isReadOnly || isSaving}
                  className="px-6 py-2.5 bg-[#10B981] hover:bg-[#0da471] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40 shadow-sm"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> {editingBannerId ? 'Update Banner' : 'Publish Banner'}
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* DISPLAY MODE MULTIPLE presets tab */}
              <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider font-mono mb-3">Banner Format & Rendering Strategy</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { mode: 'Mode1', icon: Image, label: 'Exact Canvas', desc: 'Canva/Photoshop Image direct representation' },
                { mode: 'Mode2', icon: AlignLeft, label: 'Dynamic Hero', desc: 'Layered overlay text, search-bars, forms' },
                { mode: 'Mode3', icon: Film, label: 'Video Frame', desc: 'YouTube/Vimeo/Direct MP4 auto loops' },
                { mode: 'Mode4', icon: Move, label: 'Custom Builder', desc: 'Freely position elements on coordinates' }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = displayMode === tab.mode;
                return (
                  <button
                    key={tab.mode}
                    type="button"
                    onClick={() => {
                      setDisplayMode(tab.mode as any);
                      captureVersionState({ headline: bannerHeadline, description: bannerDescription, displayMode: tab.mode });
                    }}
                    className={`p-3.5 border rounded-xl flex flex-col items-center text-center gap-1.5 transition cursor-pointer ${
                      isSelected 
                        ? 'border-[#10B981] bg-emerald-50/10 text-slate-900 shadow-sm' 
                        : 'border-slate-100 hover:border-slate-300 text-slate-500 bg-slate-50/30'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-[#10B981]' : 'text-slate-400'}`} />
                    <div className="leading-none">
                      <p className="text-xs font-bold">{tab.label}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5 leading-tight font-light">{tab.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* COLLAPSED CONFIGURATION GROUPS */}
          <div className="space-y-4">
            
            {/* 1. GENERAL CONTENT CONFIG */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <button 
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === 'general' ? null : 'general')}
                className="w-full px-5 py-4 bg-slate-50/30 hover:bg-slate-50/50 flex items-center justify-between text-left focus:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <p className="text-xs font-black text-slate-700 uppercase tracking-widest font-mono">1. General Slide Metadata & Texts</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeAccordion === 'general' ? 'rotate-180' : ''}`} />
              </button>

              {activeAccordion === 'general' && (
                <div className="p-5 border-t border-slate-100 space-y-4">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Administrative Slide Name (For CMS reference)</label>
                      <input 
                        type="text" 
                        value={bannerName} 
                        onChange={(e) => setBannerName(e.target.value)}
                        placeholder="e.g. June Promotional Offer Banner"
                        className="w-full text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#10B981]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Badge Tagline (e.g. DVARIX REALTY)</label>
                      <input 
                        type="text" 
                        value={bannerBadgeText} 
                        onChange={(e) => setBannerBadgeText(e.target.value)}
                        placeholder="DVARIX REALTY"
                        className="w-full text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#10B981]"
                      />
                    </div>
                  </div>

                  {displayMode !== 'Mode1' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Large Display Headline / Title</label>
                          <input 
                            type="text" 
                            value={bannerHeadline} 
                            onChange={(e) => setBannerHeadline(e.target.value)}
                            placeholder="Find Your Dream Property in Bengaluru"
                            className="w-full text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#10B981]"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Headline Keyword to Highlight (e.g. Bengaluru)</label>
                          <input 
                            type="text" 
                            value={bannerHighlightText} 
                            onChange={(e) => setBannerHighlightText(e.target.value)}
                            placeholder="Keyword inside title"
                            className="w-full text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#10B981]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Subheading Line Text</label>
                          <input 
                            type="text" 
                            value={bannerSubheading} 
                            onChange={(e) => setBannerSubheading(e.target.value)}
                            placeholder="Premium real estate options"
                            className="w-full text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#10B981]"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Property Count Badge Text</label>
                          <input 
                            type="text" 
                            value={bannerPropertyCountBadge} 
                            onChange={(e) => setBannerPropertyCountBadge(e.target.value)}
                            placeholder="500+ Verified Properties"
                            className="w-full text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#10B981]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Slide Sourcing Description</label>
                        <textarea 
                          value={bannerDescription} 
                          onChange={(e) => setBannerDescription(e.target.value)}
                          placeholder="Discover verified plots, luxury villas, apartments and commercial properties across Bengaluru..."
                          rows={3}
                          className="w-full text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                    </>
                  )}

                  {/* Optional dynamic component switches for Mode 2 */}
                  {displayMode === 'Mode2' && (
                    <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-2 text-xs">
                      <p className="font-bold text-slate-700 mb-1.5 uppercase tracking-widest text-[9px] font-mono">Dynamic Content Switches</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={showStatistics} onChange={(e) => setShowStatistics(e.target.checked)} className="rounded" />
                          Include Trust Stats (10+ Years)
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={showSearchBar} onChange={(e) => setShowSearchBar(e.target.checked)} className="rounded" />
                          Include Search Bar
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={showContactForm} onChange={(e) => setShowContactForm(e.target.checked)} className="rounded" />
                          Include Quick Contact Form
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Backdrop media picker */}
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <MediaPicker
                      label="Desktop Slide Background"
                      value={bannerDesktopImage}
                      onChange={(url) => setBannerDesktopImage(url)}
                      folder="banners"
                      category="Banners"
                    />

                    <div className="pt-2 border-t border-slate-100">
                      <MediaPicker
                        label="Mobile Slide Background"
                        value={bannerMobileImage}
                        onChange={(url) => setBannerMobileImage(url)}
                        folder="banners"
                        category="Banners"
                      />
                    </div>

                    {imageWarning && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-700 font-medium">
                        <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                        <span>{imageWarning}</span>
                      </div>
                    )}

                    {uploadError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600 font-medium">
                        <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                        <span>{uploadError}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2. MODE 3 VIDEO BANNER METADATA */}
            {displayMode === 'Mode3' && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <button 
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === 'video' ? null : 'video')}
                  className="w-full px-5 py-4 bg-slate-50/30 hover:bg-slate-50/50 flex items-center justify-between text-left focus:outline-none"
                >
                  <div className="flex items-center gap-2.5">
                    <Film className="w-4 h-4 text-slate-600" />
                    <p className="text-xs font-black text-slate-700 uppercase tracking-widest font-mono">2. Video Player Settings</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeAccordion === 'video' ? 'rotate-180' : ''}`} />
                </button>

                {activeAccordion === 'video' && (
                  <div className="p-5 border-t border-slate-100 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Direct Video URL / YouTube or Vimeo Link</label>
                      <input 
                        type="text" 
                        value={videoSettings.videoUrl} 
                        onChange={(e) => setVideoSettings({ ...videoSettings, videoUrl: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=... or direct MP4 link"
                        className="w-full text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#10B981] font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-1.5">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={videoSettings.autoplay} onChange={(e) => setVideoSettings({ ...videoSettings, autoplay: e.target.checked })} className="rounded" />
                        Autoplay Video
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={videoSettings.loop} onChange={(e) => setVideoSettings({ ...videoSettings, loop: e.target.checked })} className="rounded" />
                        Infinite Loop
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={videoSettings.muted} onChange={(e) => setVideoSettings({ ...videoSettings, muted: e.target.checked })} className="rounded" />
                        Default Muted
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={videoSettings.overlay} onChange={(e) => setVideoSettings({ ...videoSettings, overlay: e.target.checked })} className="rounded" />
                        Dim Dark Overlay
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. CTA BUTTON BUILDER (Renders dynamic component) */}
            {displayMode !== 'Mode1' && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <button 
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === 'buttons' ? null : 'buttons')}
                  className="w-full px-5 py-4 bg-slate-50/30 hover:bg-slate-50/50 flex items-center justify-between text-left focus:outline-none"
                >
                  <div className="flex items-center gap-2.5">
                    <Link className="w-4 h-4 text-slate-600" />
                    <p className="text-xs font-black text-slate-700 uppercase tracking-widest font-mono">3. Dynamic Button Configurator</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeAccordion === 'buttons' ? 'rotate-180' : ''}`} />
                </button>

                {activeAccordion === 'buttons' && (
                  <div className="p-5 border-t border-slate-100">
                    <ButtonBuilder buttons={bannerButtons} onChange={(list) => {
                      setBannerButtons(list);
                      captureVersionState({ headline: bannerHeadline, description: bannerDescription, bannerButtons: list });
                    }} />
                  </div>
                )}
              </div>
            )}

            {/* 4. CANVAS DIMENSIONS AND FILTERS (Renders CanvasSettings) */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <button 
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === 'canvas' ? null : 'canvas')}
                className="w-full px-5 py-4 bg-slate-50/30 hover:bg-slate-50/50 flex items-center justify-between text-left focus:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-slate-600" />
                  <p className="text-xs font-black text-slate-700 uppercase tracking-widest font-mono">4. Canvas Ratios & Filter FX</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeAccordion === 'canvas' ? 'rotate-180' : ''}`} />
              </button>

              {activeAccordion === 'canvas' && (
                <div className="p-5 border-t border-slate-100">
                  <CanvasSettings 
                    canvasSettings={canvasSettings} 
                    onChange={setCanvasSettings} 
                    bgSettings={bgSettings}
                    onChangeBg={setBgSettings}
                  />
                </div>
              )}
            </div>

            {/* 4.6 VISUAL LAYOUT CUSTOMIZATION PANEL */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <button 
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === 'visual-layout' ? null : 'visual-layout')}
                className="w-full px-5 py-4 bg-slate-50/30 hover:bg-slate-50/50 flex items-center justify-between text-left focus:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <Palette className="w-4 h-4 text-slate-600" />
                  <p className="text-xs font-black text-slate-700 uppercase tracking-widest font-mono">4.5. Visual Layout & Theme Settings</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeAccordion === 'visual-layout' ? 'rotate-180' : ''}`} />
              </button>

              {activeAccordion === 'visual-layout' && (
                <div className="p-5 border-t border-slate-100 space-y-6 text-xs text-slate-700">
                  {/* Banner Size */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-800 border-b border-slate-100 pb-1 uppercase tracking-wider text-[11px]">Banner Size</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Banner Width</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.bannerWidth} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, bannerWidth: e.target.value})}
                          placeholder="e.g. 100% or 1200px"
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Banner Height</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.bannerHeight} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, bannerHeight: e.target.value})}
                          placeholder="e.g. 650px"
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Max Width</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.maxWidth} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, maxWidth: e.target.value})}
                          placeholder="e.g. 100% or 1440px"
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Min Height</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.minHeight} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, minHeight: e.target.value})}
                          placeholder="e.g. 400px"
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Responsive Heights */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-800 border-b border-slate-100 pb-1 uppercase tracking-wider text-[11px]">Responsive Heights</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1 flex items-center gap-1"><Monitor className="w-3 h-3 text-slate-400" /> Desktop</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.desktopHeight} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, desktopHeight: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1 flex items-center gap-1"><Monitor className="w-3 h-3 text-slate-400" /> Laptop</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.laptopHeight} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, laptopHeight: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1 flex items-center gap-1"><Tablet className="w-3 h-3 text-slate-400" /> Tablet</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.tabletHeight} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, tabletHeight: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1 flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> Mobile</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.mobileHeight} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, mobileHeight: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Spacing */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-800 border-b border-slate-100 pb-1 uppercase tracking-wider text-[11px]">Spacing (Padding & Margin)</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Padding Top</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.paddingTop} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, paddingTop: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Padding Right</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.paddingRight} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, paddingRight: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Padding Bottom</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.paddingBottom} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, paddingBottom: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Padding Left</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.paddingLeft} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, paddingLeft: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Margin Top</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.marginTop} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, marginTop: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Margin Right</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.marginRight} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, marginRight: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Margin Bottom</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.marginBottom} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, marginBottom: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Margin Left</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.marginLeft} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, marginLeft: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Border */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-800 border-b border-slate-100 pb-1 uppercase tracking-wider text-[11px]">Border Settings</h5>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Border Radius</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.borderRadius} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, borderRadius: e.target.value})}
                          placeholder="e.g. 12px"
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Border Width</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.borderWidth} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, borderWidth: e.target.value})}
                          placeholder="e.g. 1px"
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Border Color</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.borderColor} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, borderColor: e.target.value})}
                          placeholder="e.g. #e2e8f0"
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Background Overrides */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-800 border-b border-slate-100 pb-1 uppercase tracking-wider text-[11px]">Background Overrides</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Position</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.backgroundPosition} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, backgroundPosition: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Size</label>
                        <select 
                          value={visualLayoutSettings.backgroundSize} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, backgroundSize: e.target.value as any})}
                          className="w-full border border-slate-200 p-2 rounded-lg bg-white focus:outline-none text-xs focus:border-[#10B981]"
                        >
                          <option value="cover">Cover</option>
                          <option value="contain">Contain</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Repeat</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.backgroundRepeat} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, backgroundRepeat: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Attachment</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.backgroundAttachment} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, backgroundAttachment: e.target.value})}
                          placeholder="scroll or fixed"
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Overlay Color</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.overlayColor} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, overlayColor: e.target.value})}
                          placeholder="e.g. #000000"
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Overlay Opacity (%)</label>
                        <input 
                          type="number" 
                          min={0} 
                          max={100}
                          value={visualLayoutSettings.overlayOpacity} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, overlayOpacity: Number(e.target.value)})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-5">
                        <input 
                          type="checkbox" 
                          checked={visualLayoutSettings.enableParallax} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, enableParallax: e.target.checked})}
                          className="rounded text-emerald-500"
                        />
                        <label className="text-[10px] font-bold text-slate-600">Enable Parallax Effect</label>
                      </div>
                    </div>
                  </div>

                  {/* Content Layout */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-800 border-b border-slate-100 pb-1 uppercase tracking-wider text-[11px]">Content Placement & Grid</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Content Width</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.contentWidth} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, contentWidth: e.target.value})}
                          placeholder="e.g. 650px"
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Horizontal Align</label>
                        <select 
                          value={visualLayoutSettings.contentHorizontalAlign} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, contentHorizontalAlign: e.target.value as any})}
                          className="w-full border border-slate-200 p-2 rounded-lg bg-white focus:outline-none text-xs focus:border-[#10B981]"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Vertical Align</label>
                        <select 
                          value={visualLayoutSettings.contentVerticalAlign} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, contentVerticalAlign: e.target.value as any})}
                          className="w-full border border-slate-200 p-2 rounded-lg bg-white focus:outline-none text-xs focus:border-[#10B981]"
                        >
                          <option value="top">Top</option>
                          <option value="center">Center</option>
                          <option value="bottom">Bottom</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Content Padding</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.contentPadding} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, contentPadding: e.target.value})}
                          placeholder="e.g. 20px"
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Gap Between Elements</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.gapBetweenElements} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, gapBetweenElements: e.target.value})}
                          placeholder="e.g. 20px"
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Typography overrides */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-800 border-b border-slate-100 pb-1 uppercase tracking-wider text-[11px]">Typography Customization</h5>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Title Size</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.titleFontSize} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, titleFontSize: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Subtitle Size</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.subtitleFontSize} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, subtitleFontSize: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Desc Size</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.descriptionFontSize} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, descriptionFontSize: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Font Weight</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.fontWeight} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, fontWeight: e.target.value})}
                          placeholder="e.g. 800"
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Line Height</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.lineHeight} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, lineHeight: e.target.value})}
                          placeholder="e.g. 1.2"
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Letter Spacing</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.letterSpacing} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, letterSpacing: e.target.value})}
                          placeholder="e.g. -0.02em"
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Text Color</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.textColor} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, textColor: e.target.value})}
                          placeholder="e.g. #ffffff"
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-800 border-b border-slate-100 pb-1 uppercase tracking-wider text-[11px]">Primary Button Customization</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Width</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.btnPrimaryWidth} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, btnPrimaryWidth: e.target.value})}
                          placeholder="e.g. auto or 100%"
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Height</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.btnPrimaryHeight} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, btnPrimaryHeight: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">BG Color</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.btnBgColor} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, btnBgColor: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Text Color</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.btnTextColor} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, btnTextColor: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Padding</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.btnPadding} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, btnPadding: e.target.value})}
                          placeholder="e.g. 14px 28px"
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Border Radius</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.btnBorderRadius} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, btnBorderRadius: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Secondary Button */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-800 border-b border-slate-100 pb-1 uppercase tracking-wider text-[11px]">Secondary Button Customization</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Width</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.btnSecondaryWidth} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, btnSecondaryWidth: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Height</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.btnSecondaryHeight} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, btnSecondaryHeight: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Hover BG</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.btnHoverBgColor} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, btnHoverBgColor: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Hover Text</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.btnHoverTextColor} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, btnHoverTextColor: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Animations */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-800 border-b border-slate-100 pb-1 uppercase tracking-wider text-[11px]">Animations & FX overlays</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Type</label>
                        <select 
                          value={visualLayoutSettings.animationType} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, animationType: e.target.value as any})}
                          className="w-full border border-slate-200 p-2 rounded-lg bg-white focus:outline-none text-xs focus:border-[#10B981]"
                        >
                          <option value="fade">Fade In</option>
                          <option value="slide-up">Slide Up</option>
                          <option value="slide-left">Slide Left</option>
                          <option value="zoom">Zoom</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Duration</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.animationDuration} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, animationDuration: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Delay</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.animationDelay} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, animationDelay: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Container Width</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.containerWidth} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, containerWidth: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Box Shadow</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.boxShadow} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, boxShadow: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Blur Effect FX</label>
                        <input 
                          type="text" 
                          value={visualLayoutSettings.blurEffect} 
                          onChange={(e) => setVisualLayoutSettings({...visualLayoutSettings, blurEffect: e.target.value})}
                          className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STATUS, SCHEDULING, ANIMATIONS CONFIG */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <button 
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === 'scheduling' ? null : 'scheduling')}
                className="w-full px-5 py-4 bg-slate-50/30 hover:bg-slate-50/50 flex items-center justify-between text-left focus:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  <p className="text-xs font-black text-slate-700 uppercase tracking-widest font-mono">5. Status, Scheduling & Animations</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeAccordion === 'scheduling' ? 'rotate-180' : ''}`} />
              </button>

              {activeAccordion === 'scheduling' && (
                <div className="p-5 border-t border-slate-100 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Banner Status</label>
                      <select 
                        value={bannerStatus} 
                        onChange={(e) => setBannerStatus(e.target.value as any)}
                        className="w-full text-xs border border-slate-200 p-2.5 rounded-lg bg-white focus:outline-none focus:border-[#10B981]"
                      >
                        <option value="Draft">Draft (Offline/Unpublished)</option>
                        <option value="Published">Published (Active on Homepage)</option>
                        <option value="Scheduled">Scheduled (Active in Date Range)</option>
                        <option value="Archived">Archived (Archived history)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Display Order Index</label>
                      <input 
                        type="number" 
                        min={1}
                        value={bannerOrder} 
                        onChange={(e) => setBannerOrder(Number(e.target.value))}
                        className="w-full text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#10B981]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Publish Start Date (Optional)</label>
                      <input 
                        type="date" 
                        value={bannerPublishDate} 
                        onChange={(e) => setBannerPublishDate(e.target.value)}
                        className="w-full text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#10B981]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Expiry End Date (Optional)</label>
                      <input 
                        type="date" 
                        value={bannerExpiryDate} 
                        onChange={(e) => setBannerExpiryDate(e.target.value)}
                        className="w-full text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#10B981]"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-3">
                    <p className="font-bold text-slate-700 uppercase tracking-widest text-[9px] font-mono flex items-center gap-1.5 text-emerald-600">
                      <Sparkles className="w-3 h-3" /> Visual Transition Animations
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <label className="flex items-center gap-2 font-medium">
                        <input 
                          type="checkbox" 
                          checked={animations.enabled} 
                          onChange={(e) => setAnimations({ ...animations, enabled: e.target.checked })} 
                          className="rounded text-[#10B981] focus:ring-[#10B981]" 
                        />
                        Enable Motion Animations
                      </label>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 mb-1 block">Animation Type</label>
                        <select 
                          value={animations.type} 
                          disabled={!animations.enabled}
                          onChange={(e) => setAnimations({ ...animations, type: e.target.value as any })}
                          className="w-full text-xs border border-[#ccc] p-1.5 rounded bg-white focus:outline-none disabled:opacity-40"
                        >
                          <option value="fade">Fade In</option>
                          <option value="slide-left">Slide Left</option>
                          <option value="slide-right">Slide Right</option>
                          <option value="zoom">Zoom In</option>
                          <option value="scale">Scale Up</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 mb-1 block">Duration (seconds)</label>
                        <input 
                          type="number" 
                          step={0.1}
                          min={0.1}
                          max={5}
                          value={animations.duration} 
                          disabled={!animations.enabled}
                          onChange={(e) => setAnimations({ ...animations, duration: Number(e.target.value) })}
                          className="w-full text-xs border border-[#ccc] p-1 rounded focus:outline-none disabled:opacity-40"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. CUSTOM ELEMENT LAYERS (Mode 4 Custom builder) */}
            {displayMode === 'Mode4' && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <button 
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === 'layers' ? null : 'layers')}
                  className="w-full px-5 py-4 bg-slate-50/30 hover:bg-slate-50/50 flex items-center justify-between text-left focus:outline-none"
                >
                  <div className="flex items-center gap-2.5">
                    <Move className="w-4 h-4 text-slate-600" />
                    <p className="text-xs font-black text-slate-700 uppercase tracking-widest font-mono">5. Drag Coordinates Layers Canvas</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeAccordion === 'layers' ? 'rotate-180' : ''}`} />
                </button>

                {activeAccordion === 'layers' && (
                  <div className="p-5 border-t border-slate-100">
                    <LayerManager layers={customLayers} onChange={(list) => {
                      setCustomLayers(list);
                      captureVersionState({ headline: bannerHeadline, description: bannerDescription, customLayers: list });
                    }} />
                  </div>
                )}
              </div>
            )}

            {/* 6. ADVANCED SEO AND IMAGES METADATA */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <button 
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === 'seo' ? null : 'seo')}
                className="w-full px-5 py-4 bg-slate-50/30 hover:bg-slate-50/50 flex items-center justify-between text-left focus:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-slate-600" />
                  <p className="text-xs font-black text-slate-700 uppercase tracking-widest font-mono">6. SEO Schema & HTML Metatags</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeAccordion === 'seo' ? 'rotate-180' : ''}`} />
              </button>

              {activeAccordion === 'seo' && (
                <div className="p-5 border-t border-slate-100">
                  <SEOAndMedia 
                    seoSettings={seoSettings} 
                    onChangeSeo={setSeoSettings} 
                    mediaMeta={mediaMeta} 
                    onChangeMediaMeta={setMediaMeta} 
                  />
                </div>
              )}
            </div>

            {/* 7. ROLE ACCESS PERMISSIONS */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <button 
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === 'roles' ? null : 'roles')}
                className="w-full px-5 py-4 bg-slate-50/30 hover:bg-slate-50/50 flex items-center justify-between text-left focus:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-slate-600" />
                  <p className="text-xs font-black text-slate-700 uppercase tracking-widest font-mono">7. Simulated Roles & Authorizations</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeAccordion === 'roles' ? 'rotate-180' : ''}`} />
              </button>

              {activeAccordion === 'roles' && (
                <div className="p-5 border-t border-slate-100">
                  <RolePermissions currentRole={currentRole} onRoleChange={setCurrentRole} />
                </div>
              )}
            </div>

            {/* 8. ANALYTICS & CTR LOGS */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <button 
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === 'analytics' ? null : 'analytics')}
                className="w-full px-5 py-4 bg-slate-50/30 hover:bg-slate-50/50 flex items-center justify-between text-left focus:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 text-slate-600" />
                  <p className="text-xs font-black text-slate-700 uppercase tracking-widest font-mono">8. CTR Log Insights Dashboard</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeAccordion === 'analytics' ? 'rotate-180' : ''}`} />
              </button>

              {activeAccordion === 'analytics' && (
                <div className="p-5 border-t border-slate-100">
                  <AnalyticsDashboard banners={heroBanners} />
                </div>
              )}
            </div>

          </div>

          {/* BUILDER ACTION CONTROL ROW */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="text-left">
              <span className="text-[10px] font-mono text-slate-400 font-bold">Currently:</span>
              <p className="text-xs font-black text-slate-700">
                {editingBannerId ? `Modifying "${heroBanners.find(b=>b.id === editingBannerId)?.headline}"` : 'Building New Visual Banner'}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleTriggerPreview}
                className="flex-1 sm:flex-initial px-5 py-3.5 border border-slate-200 hover:border-slate-400 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer bg-white"
              >
                <Eye className="w-4 h-4" /> Live Webflow Preview
              </button>

              <button
                type="button"
                onClick={handleSaveBanner}
                disabled={isReadOnly || isSaving}
                className="flex-1 sm:flex-initial px-6 py-3.5 bg-[#10B981] hover:bg-[#0da471] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-40"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> {editingBannerId ? 'Commit Changes' : 'Publish Builder Banner'}
                  </>
                )}
              </button>

              {editingBannerId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
                  title="Cancel Edit"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          </>
          )}

          {/* REAL TIME VISUAL HERO PREVIEW IF TRIGGERED */}
          {bannerPreviewObject && (
            <div className="border border-dashed border-slate-300 rounded-3xl p-5 bg-slate-100/50 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600 uppercase tracking-widest font-mono">Interactive Device Sandbox Preview</span>
                <button type="button" onClick={() => setBannerPreviewObject(null)} className="text-red-500 hover:font-bold">Close Preview</button>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <div className="w-full h-full text-slate-900 pointer-events-none select-none">
                  <div className="w-full relative rounded-2xl overflow-hidden bg-[#070d19]">
                    <div className="p-4 bg-[#10B981] text-white text-center text-xs font-bold uppercase tracking-wider">Live Active Banner View</div>
                    {/* Render exact visual frame compiled directly by luxury frontend renderer */}
                    <div className="p-2 sm:p-4">
                      {/* We dynamically embed LuxuryHeroCarousel component inside admin to verify perfect compliance! */}
                      <div className="scale-[0.98] origin-top transition-transform duration-300 shadow-xl rounded-2xl overflow-hidden pointer-events-auto select-auto">
                        <LuxuryHeroCarousel previewBanner={bannerPreviewObject} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
