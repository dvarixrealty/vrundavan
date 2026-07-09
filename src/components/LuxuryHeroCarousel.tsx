import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, ArrowRight, Building2, Sparkles, Star, 
  Users, Briefcase, Play, VolumeX, Volume2, Search, Send, Clock, ShieldCheck, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HeroBanner, CarouselSettings, BannerButtonConfig } from '../types';
import { firebaseService } from '../lib/firebaseService';

interface LuxuryHeroCarouselProps {
  banners?: HeroBanner[];
  onPrimaryClick?: (action: string | BannerButtonConfig) => void;
  onSecondaryClick?: (action: string | BannerButtonConfig) => void;
  previewBanner?: HeroBanner | null; // For admin preview modal
  carouselSettings?: CarouselSettings;
}

export default function LuxuryHeroCarousel({
  banners = [],
  onPrimaryClick,
  onSecondaryClick,
  previewBanner = null,
  carouselSettings
}: LuxuryHeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Default settings
  const settings: CarouselSettings = carouselSettings || {
    autoPlay: true,
    autoSlideDuration: 5,
    transitionSpeed: 'normal',
    showNavigationArrows: true,
    showPaginationDots: true,
    pauseOnHover: true,
    infiniteLoop: true
  };

  // Filter banners that are enabled/active and within schedule
  const activeBanners = React.useMemo(() => {
    if (previewBanner) {
      return [previewBanner];
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return banners
      .filter(b => {
        const statusStr = (b.status || '') as string;
        const isPublished = statusStr === 'active' || statusStr === 'Published';
        if (!isPublished && !b.enabled) return false;
        if (statusStr === 'inactive' || statusStr === 'Hidden' || statusStr === 'Archived' || statusStr === 'Draft') return false;
        
        if (b.publishDate) {
          const pub = new Date(b.publishDate);
          pub.setHours(0, 0, 0, 0);
          if (pub > now) return false;
        }

        if (b.expiryDate) {
          const exp = new Date(b.expiryDate);
          exp.setHours(0, 0, 0, 0);
          if (exp < now) return false;
        }

        return true;
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [banners, previewBanner]);

  // Autoplay functionality
  useEffect(() => {
    if (activeBanners.length <= 1 || previewBanner) return;
    if (!settings.autoPlay) return;
    if (settings.pauseOnHover && isHovered) return;

    const slideInterval = (settings.autoSlideDuration || 5) * 1000;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= activeBanners.length - 1) {
          return settings.infiniteLoop !== false ? 0 : prev;
        }
        return prev + 1;
      });
    }, slideInterval);

    return () => clearInterval(interval);
  }, [activeBanners, isHovered, previewBanner, settings]);

  // Reset index on length change
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeBanners.length, previewBanner]);

  // Real Analytics: Track Banner Views
  useEffect(() => {
    if (activeBanners.length > 0 && activeBanners[currentIndex]) {
      const currentId = activeBanners[currentIndex].id;
      if (currentId && currentId !== 'fallback') {
        firebaseService.trackBannerAnalytics(currentId, 'view').catch(() => {});
      }
    }
  }, [currentIndex, activeBanners]);

  if (activeBanners.length === 0) {
    const fallbackBanner: HeroBanner = {
      id: 'fallback',
      headline: 'Find Your Dream Property in Bengaluru',
      description: 'Discover verified plots, luxury villas, apartments and commercial properties across Bengaluru with complete transparency.',
      badgeText: 'DVARIX REALTY',
      propertyCountBadge: '500+ Verified Properties',
      desktopImageMethod: 'url',
      desktopImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      mobileImageMethod: 'url',
      mobileImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80',
      status: 'active',
      enabled: true,
      order: 1,
      lastUpdated: new Date().toISOString()
    };
    return (
      <div className="w-full">
        <BannerFrame banner={fallbackBanner} onPrimaryClick={onPrimaryClick} onSecondaryClick={onSecondaryClick} />
      </div>
    );
  }

  const currentBanner = activeBanners[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => {
      if (prev <= 0) {
        return settings.infiniteLoop !== false ? activeBanners.length - 1 : prev;
      }
      return prev - 1;
    });
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => {
      if (prev >= activeBanners.length - 1) {
        return settings.infiniteLoop !== false ? 0 : prev;
      }
      return prev + 1;
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const threshold = 50;
    if (diffX > threshold) {
      handleNext(e as any);
    } else if (diffX < -threshold) {
      handlePrev(e as any);
    }
    touchStartX.current = null;
  };

  const transitionDurations = {
    fast: 0.25,
    normal: 0.5,
    slow: 1.0
  };
  const duration = transitionDurations[settings.transitionSpeed || 'normal'] || 0.5;

  const showArrows = settings.showNavigationArrows !== false && activeBanners.length > 1;
  const showDots = settings.showPaginationDots !== false && activeBanners.length > 1;

  const disablePrev = !settings.infiniteLoop && currentIndex === 0;
  const disableNext = !settings.infiniteLoop && currentIndex === activeBanners.length - 1;

  return (
    <div 
      className="relative w-full overflow-hidden select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      id="realty-luxury-hero-banner"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id + '-' + currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration }}
          className="w-full"
        >
          <BannerFrame 
            banner={currentBanner} 
            onPrimaryClick={onPrimaryClick} 
            onSecondaryClick={onSecondaryClick} 
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {showArrows && (
        <>
          <button
            onClick={handlePrev}
            disabled={disablePrev}
            className={`absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full shadow-lg border border-slate-100 hover:scale-110 transition-all duration-200 z-30 cursor-pointer hidden sm:flex items-center justify-center focus:outline-none ${
              disablePrev 
                ? 'bg-white/30 text-slate-400 cursor-not-allowed border-slate-200/30' 
                : 'bg-white/90 hover:bg-white text-[#0F172A] hover:shadow-xl'
            }`}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <button
            onClick={handleNext}
            disabled={disableNext}
            className={`absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full shadow-lg border border-slate-100 hover:scale-110 transition-all duration-200 z-30 cursor-pointer hidden sm:flex items-center justify-center focus:outline-none ${
              disableNext 
                ? 'bg-white/30 text-slate-400 cursor-not-allowed border-slate-200/30' 
                : 'bg-white/90 hover:bg-white text-[#0F172A] hover:shadow-xl'
            }`}
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {showDots && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-30 bg-slate-900/30 backdrop-blur-md px-3 py-1.5 rounded-full">
          {activeBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer focus:outline-none ${
                currentIndex === idx ? 'w-6 bg-[#10B981]' : 'w-2 bg-white/60 hover:bg-white'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface BannerFrameProps {
  banner: HeroBanner;
  onPrimaryClick?: (action: string | BannerButtonConfig) => void;
  onSecondaryClick?: (action: string | BannerButtonConfig) => void;
}

function BannerFrame({ banner, onPrimaryClick, onSecondaryClick }: BannerFrameProps) {
  const [muted, setMuted] = useState(banner.videoSettings?.muted !== false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Parse Banner display mode (Mode 1: Exact, Mode 2: Dynamic, Mode 3: Video, Mode 4: Custom Builder)
  const displayMode = banner.displayMode || 'Mode2'; // default to Dynamic Hero Banner

  // Analytics helper
  const handleActionClick = (btnConfig: BannerButtonConfig | undefined, legacyUrl: string | undefined, callback?: typeof onPrimaryClick) => {
    if (banner.id && banner.id !== 'fallback') {
      firebaseService.trackBannerAnalytics(banner.id, 'click').catch(() => {});
    }
    if (btnConfig) {
      callback?.(btnConfig);
    } else if (legacyUrl) {
      callback?.(legacyUrl);
    }
  };

  // Inquiry Form inside the Banner
  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPhone) return;
    try {
      await firebaseService.saveInquiry({
        id: 'inq_' + Date.now(),
        name: formName || 'Hero Requestor',
        phone: formPhone,
        email: formEmail,
        message: `Inquiry submitted directly via Hero Banner Form: "${banner.bannerName || banner.headline}"`,
        status: 'New',
        date: new Date().toISOString()
      });
      setFormSuccess(true);
      setTimeout(() => {
        setFormSuccess(false);
        setFormName('');
        setFormPhone('');
        setFormEmail('');
      }, 5000);
    } catch (err) {
      console.error(err);
    }
  };

  // Search Bar inside the Banner action
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    window.dispatchEvent(new CustomEvent('hero-search-query', { detail: searchQuery }));
    const element = document.getElementById('listings-layout-view');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Extract properties
  const isExactMode = displayMode === 'Mode1';
  const isDynamicMode = displayMode === 'Mode2';
  const isVideoMode = displayMode === 'Mode3';
  const isCustomMode = displayMode === 'Mode4';

  // Styles configuration
  const canvasSettings = (banner.canvasSettings || {}) as any;
  const textSettings = (banner.textSettings || {}) as any;
  const bgSettings = (banner.backgroundSettings || {}) as any;
  const floatingCardSettings = (banner.floatingCardSettings || {}) as any;
  const animationSettings = (banner.animationSettings || {}) as any;

  // Height configurations
  const desktopHeight = canvasSettings.desktopHeight || '600px';
  const tabletHeight = canvasSettings.tabletHeight || '500px';
  const mobileHeight = canvasSettings.mobileHeight || '400px';
  
  const heightStyle = {
    '--desktop-h': desktopHeight,
    '--tablet-h': tabletHeight,
    '--mobile-h': mobileHeight,
  } as React.CSSProperties;

  // Custom filters
  const brightness = canvasSettings.brightness !== undefined ? canvasSettings.brightness : 100;
  const contrast = canvasSettings.contrast !== undefined ? canvasSettings.contrast : 100;
  const saturation = canvasSettings.saturation !== undefined ? canvasSettings.saturation : 100;
  const blurValue = canvasSettings.blur !== undefined ? canvasSettings.blur : 0;
  const hueValue = canvasSettings.hue !== undefined ? canvasSettings.hue : 0;
  const canvasOpacity = canvasSettings.opacity !== undefined ? canvasSettings.opacity : 100;

  const canvasFilterStyle: React.CSSProperties = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blurValue}px) hue-rotate(${hueValue}deg)`,
    opacity: canvasOpacity / 100,
    transition: 'all 0.5s ease',
  };

  // Background configurations
  const bgStyle: React.CSSProperties = {};
  if (bgSettings.backgroundColor) {
    bgStyle.backgroundColor = bgSettings.backgroundColor;
  }
  if (bgSettings.gradientBackground) {
    bgStyle.backgroundImage = bgSettings.gradientBackground;
  } else if (bgSettings.backgroundImage || banner.desktopImage) {
    bgStyle.backgroundImage = `url(${bgSettings.backgroundImage || banner.desktopImage})`;
  }
  bgStyle.backgroundPosition = bgSettings.backgroundPosition || 'center';
  bgStyle.backgroundSize = bgSettings.backgroundSize || 'cover';
  bgStyle.backgroundRepeat = 'no-repeat';

  // Glass Effect option
  const isGlassCanvas = canvasSettings.glassEffect;

  // Render video backgrounds (Mode 3 Video Mode)
  const renderVideoBg = () => {
    if (!isVideoMode) return null;
    const videoSettings = banner.videoSettings || {};
    const url = videoSettings.videoUrl || '';
    const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
    const isVimeo = url.includes('vimeo.com');

    // Parse YouTube/Vimeo embed codes dynamically
    if (isYoutube) {
      let videoId = '';
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        videoId = match[2];
      }
      return (
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
          <iframe 
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&mute=${muted ? 1 : 0}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&enablejsapi=1`}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115vw] h-[115vh] object-cover scale-[1.3] aspect-video"
            allow="autoplay; encrypted-media"
            title="Video Banner Background"
          />
        </div>
      );
    }

    if (isVimeo) {
      let videoId = '';
      const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/);
      if (match && match[3]) videoId = match[3];
      return (
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
          <iframe 
            src={`https://player.vimeo.com/video/${videoId}?autoplay=1&loop=1&background=1&muted=${muted ? 1 : 0}`}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115vw] h-[115vh] object-cover scale-[1.3] aspect-video"
            allow="autoplay; encrypted-media"
            title="Video Banner Background"
          />
        </div>
      );
    }

    // Default HTML5 Direct MP4/WEBM
    return (
      <video 
        src={url || banner.desktopImage}
        autoPlay={videoSettings.autoplay !== false}
        loop={videoSettings.loop !== false}
        muted={muted}
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
    );
  };

  // Headline highlight logic
  const renderHeadline = (headlineText: string, highlightText?: string) => {
    if (!headlineText) return null;
    const hl = highlightText?.trim();
    const hlColor = textSettings.highlightColor || '#10B981';

    const fontStyle: React.CSSProperties = {};
    if (textSettings.headingFontSize) fontStyle.fontSize = `${textSettings.headingFontSize}px`;
    if (textSettings.headingColor) fontStyle.color = textSettings.headingColor;
    if (textSettings.fontFamily) fontStyle.fontFamily = textSettings.fontFamily;
    if (textSettings.letterSpacing) fontStyle.letterSpacing = `${textSettings.letterSpacing}px`;
    if (textSettings.lineHeight) fontStyle.lineHeight = textSettings.lineHeight;

    let displayElement = <span>{headlineText}</span>;

    if (hl) {
      try {
        const regex = new RegExp(`(${hl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'i');
        const parts = headlineText.split(regex);
        displayElement = (
          <>
            {parts.map((part, index) => {
              if (part.toLowerCase() === hl.toLowerCase()) {
                return (
                  <span 
                    key={index} 
                    style={{ color: hlColor }} 
                    className={`inline-block font-black ${textSettings.gradientText ? 'bg-gradient-to-r from-[#10B981] to-[#D4AF37] bg-clip-text text-transparent' : ''}`}
                  >
                    {part}
                  </span>
                );
              }
              return <span key={index}>{part}</span>;
            })}
          </>
        );
      } catch (e) {
        displayElement = <span>{headlineText}</span>;
      }
    } else {
      // Automatic highlighting for Dvarix
      const parts = headlineText.split(/(Dvarix|Bengaluru|Bangalore|Verified)/i);
      displayElement = (
        <>
          {parts.map((part, index) => {
            const isMatch = ['dvarix', 'bengaluru', 'bangalore', 'verified'].includes(part.toLowerCase());
            if (isMatch) {
              return (
                <span key={index} style={{ color: hlColor }} className="inline-block font-black">
                  {part}
                </span>
              );
            }
            return <span key={index}>{part}</span>;
          })}
        </>
      );
    }

    return (
      <h1 
        style={fontStyle}
        className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight md:leading-[1.1] ${
          textSettings.textShadow ? 'shadow-sm text-shadow-md' : ''
        }`}
      >
        {displayElement}
      </h1>
    );
  };

  // Banner layout options
  const layout = (banner.layout || {}) as any;
  const rowLayoutClass = layout.heroImagePosition === 'left' ? 'flex-col md:flex-row-reverse' : 'flex-col md:flex-row';
  const verticalAlignClass = 
    layout.verticalAlignment === 'top' ? 'items-start' :
    layout.verticalAlignment === 'bottom' ? 'items-end' : 'items-center';
  const contentAlignClass = 
    layout.contentPosition === 'center' ? 'items-center text-center mx-auto' :
    layout.contentPosition === 'right' ? 'items-end text-right ml-auto' : 'items-start text-left mr-auto';
  const contentWidthClass = 
    layout.contentWidth === 'small' ? 'max-w-md' :
    layout.contentWidth === 'medium' ? 'max-w-xl' : 'max-w-2xl';

  // Multi-buttons logic (Unlimited buttons)
  const bannerButtons = banner.bannerButtons || [];
  const renderCTAButtons = () => {
    // If no buttons are stored, fallback to default primary/secondary button configs
    const listToRender = bannerButtons.length > 0 ? bannerButtons : [
      { id: 'p1', show: banner.primaryButtonConfig?.show !== false && (banner.primaryButtonConfig?.text || banner.primaryButtonText), text: banner.primaryButtonConfig?.text || banner.primaryButtonText, style: banner.primaryButtonConfig?.style || 'primary', config: banner.primaryButtonConfig, legacyUrl: banner.primaryButtonUrl },
      { id: 's2', show: banner.secondaryButtonConfig?.show !== false && (banner.secondaryButtonConfig?.text || banner.secondaryButtonText), text: banner.secondaryButtonConfig?.text || banner.secondaryButtonText, style: banner.secondaryButtonConfig?.style || 'outline', config: banner.secondaryButtonConfig, legacyUrl: banner.secondaryButtonUrl }
    ].filter(b => b.show);

    return (
      <div className={`flex flex-wrap items-center gap-4 pt-4 w-full ${
        layout.contentPosition === 'center' ? 'justify-center' :
        layout.contentPosition === 'right' ? 'justify-end' : 'justify-start'
      }`}>
        {listToRender.map((btn: any) => {
          const style = btn.style || 'primary';
          const btnClasses = style === 'secondary'
            ? 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-900'
            : style === 'outline'
            ? 'bg-white/80 hover:bg-white text-slate-900 border border-slate-200'
            : 'bg-[#10B981] hover:bg-[#0da471] text-white border border-[#10B981]';

          return (
            <button
              key={btn.id}
              onClick={() => handleActionClick(btn.config || btn, btn.legacyUrl, onPrimaryClick)}
              className={`px-6 py-3.5 text-xs font-bold uppercase tracking-widest rounded-xl shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${btnClasses}`}
            >
              <span>{btn.text}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    );
  };

  // Custom Layer Layout for Custom Mode (Mode 4)
  const renderCustomBuilderLayers = () => {
    if (!isCustomMode) return null;
    const customLayers = banner.customLayers || [];
    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden z-10 pointer-events-none">
        {customLayers.map((layer: any) => {
          if (!layer.show) return null;
          const posStyle: React.CSSProperties = {
            position: 'absolute',
            left: `${layer.x || 10}%`,
            top: `${layer.y || 10}%`,
            zIndex: layer.zIndex || 10,
            pointerEvents: 'auto'
          };
          
          return (
            <div key={layer.id} style={posStyle} className="transition-all duration-300">
              {layer.type === 'text' && (
                <div style={{ color: layer.color || '#FFFFFF', fontSize: `${layer.fontSize || 16}px`, fontWeight: layer.fontWeight || 'normal' }} className="font-serif">
                  {layer.content}
                </div>
              )}
              {layer.type === 'image' && (
                <img src={layer.src} alt="Layer Visual" style={{ width: `${layer.width || 100}px`, borderRadius: `${layer.borderRadius || 0}px` }} referrerPolicy="no-referrer" />
              )}
              {layer.type === 'button' && (
                <button 
                  onClick={() => handleActionClick(layer, layer.url, onPrimaryClick)}
                  className="px-5 py-2.5 bg-[#10B981] hover:bg-[#0da471] text-white rounded-lg text-xs font-semibold uppercase tracking-widest cursor-pointer"
                >
                  {layer.content || 'Click Here'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Check if Floating Property Card is Enabled (Default is true/enabled for backwards compatibility, unless explicitly disabled)
  const isFloatingCardEnabled = floatingCardSettings.enabled !== false && (banner.propertyCountBadge || floatingCardSettings.title);

  if (isExactMode) {
    return (
      <div 
        style={canvasFilterStyle}
        className="w-full relative overflow-hidden rounded-[28px] shadow-xl border border-slate-100 bg-slate-900/5"
        id={`realty-exact-banner-${banner.id}`}
      >
        <picture className="w-full block">
          {banner.mobileImage && <source media="(max-width: 639px)" srcSet={banner.mobileImage} />}
          <img 
            src={banner.desktopImage || banner.mobileImage} 
            alt={banner.bannerName || banner.headline || 'Exact Image Banner'} 
            className="w-full h-auto block object-contain select-none pointer-events-none rounded-[28px]"
            referrerPolicy="no-referrer"
          />
        </picture>
      </div>
    );
  }

  return (
    <div 
      style={{ ...bgStyle, ...heightStyle, ...canvasFilterStyle }}
      className={`hero-builder-container w-full relative overflow-hidden transition-all duration-500 rounded-[28px] p-6 sm:p-12 md:p-16 flex ${rowLayoutClass} ${verticalAlignClass} justify-between gap-10 ${
        isGlassCanvas ? 'backdrop-blur-md bg-white/15' : 'border border-slate-100 shadow-xl'
      }`}
    >
      {/* 1. RENDER VIDEO MODE */}
      {isVideoMode && renderVideoBg()}

      {/* 2. OVERLAYS */}
      {bgSettings.overlayEnabled !== false && (
        <div 
          className="absolute inset-0 z-1 pointer-events-none select-none bg-slate-950" 
          style={{ opacity: (bgSettings.overlayOpacity ?? 40) / 100 }}
        />
      )}

      {/* Custom Mode Layers */}
      {isCustomMode && renderCustomBuilderLayers()}

      {/* 3. DYNAMIC CONTENT AREA (Mode 2, Mode 3, or if elements explicitly enabled in Mode 1) */}
      {!isExactMode && (
        <div 
          style={{ maxWidth: textSettings.maxContentWidth ? `${textSettings.maxContentWidth}px` : undefined }}
          className={`w-full md:w-3/5 flex flex-col justify-center relative z-10 space-y-5 md:space-y-6 ${contentAlignClass} ${contentWidthClass}`}
        >
          {/* Tagline Badge */}
          {banner.badgeText && (banner.floatingBadge as any)?.show !== false && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#10B981]/15 border border-[#10B981]/30 rounded-full text-[#10B981] text-[11px] font-bold uppercase tracking-widest font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
              {banner.badgeText}
            </span>
          )}

          {/* Headline */}
          {banner.headline && renderHeadline(banner.headline, banner.highlightText)}

          {/* Subheading */}
          {banner.subheading && (
            <p 
              style={{ fontSize: textSettings.subheadingFontSize ? `${textSettings.subheadingFontSize}px` : undefined }}
              className="text-[#D4AF37] font-semibold uppercase tracking-wider text-xs sm:text-sm"
            >
              {banner.subheading}
            </p>
          )}

          {/* Description */}
          {banner.description && (
            <p 
              style={{ 
                fontSize: textSettings.descriptionFontSize ? `${textSettings.descriptionFontSize}px` : undefined,
                color: textSettings.descriptionColor || (bgSettings.overlayEnabled ? '#E2E8F0' : '#475569')
              }}
              className="leading-relaxed max-w-lg font-light"
            >
              {banner.description}
            </p>
          )}

          {/* Dynamic Extra Statistics Block */}
          {banner.showStatistics && (
            <div className="grid grid-cols-3 gap-6 pt-2">
              {[
                { count: '10+', label: 'Years' },
                { count: '500+', label: 'Deals' },
                { count: '99%', label: 'Happy' }
              ].map((st, i) => (
                <div key={i} className="text-left border-l border-white/20 pl-3">
                  <p className="text-xl md:text-2xl font-black text-[#10B981]">{st.count}</p>
                  <p className="text-[9px] uppercase tracking-wider text-slate-300 font-bold">{st.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Search Bar Embed Option */}
          {banner.showSearchBar && (
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md mt-4">
              <input 
                type="text" 
                placeholder="Search properties, locations or plots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/95 text-slate-900 border border-slate-200 shadow-xl px-5 py-3.5 rounded-2xl text-xs font-sans placeholder-slate-400 focus:outline-none focus:border-[#10B981]"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#10B981] text-white rounded-xl hover:bg-[#0da471] cursor-pointer">
                <Search className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Contact Inquiry Form Option */}
          {banner.showContactForm && (
            <form onSubmit={handleInquirySubmit} className="bg-white/90 backdrop-blur-md border border-slate-100 p-5 rounded-2xl shadow-2xl w-full max-w-md text-left text-slate-950 space-y-3 mt-4">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Enquire Directly</p>
              {formSuccess ? (
                <p className="text-xs text-[#10B981] font-bold">Thank you! Your direct request has been received.</p>
              ) : (
                <div className="space-y-2">
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full text-xs border border-slate-200 bg-white p-2.5 rounded-lg focus:outline-none focus:border-[#10B981]" 
                  />
                  <input 
                    type="tel" 
                    required 
                    placeholder="Phone Number *" 
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full text-xs border border-slate-200 bg-white p-2.5 rounded-lg focus:outline-none focus:border-[#10B981]" 
                  />
                  <button type="submit" className="w-full py-2.5 bg-[#10B981] hover:bg-[#0da471] text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                    Submit Request <Send className="w-3 h-3" />
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Action Buttons */}
          {renderCTAButtons()}
        </div>
      )}

      {/* RIGHT SIDE GRAPHIC AREA (For Mode 2 / Dynamic mode layout) */}
      {!isExactMode && !isCustomMode && (
        <div className="w-full md:w-2/5 flex items-center justify-center relative z-10 min-h-[220px] sm:min-h-[300px]">
          {/* Main Hero Image Frame */}
          {banner.desktopImage && (
            <div 
              style={{ 
                borderRadius: `${layout.heroImageBorderRadius || 24}px`,
                width: layout.heroImageWidth ? `${layout.heroImageWidth}%` : '85%'
              }}
              className="relative aspect-4/3 overflow-hidden bg-white shadow-2xl border border-slate-100 transform hover:scale-[1.02] transition-transform duration-300"
            >
              <picture>
                {banner.mobileImage && <source media="(max-width: 639px)" srcSet={banner.mobileImage} />}
                <img 
                  src={banner.desktopImage || banner.mobileImage} 
                  alt={banner.headline || 'Property representation'} 
                  className="w-full h-full object-cover filter brightness-100 contrast-[1.02]"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/15 via-transparent to-transparent" />
            </div>
          )}

          {/* FLOATING PROPERTY CARD (Completely Customizable / Draggable Controls) */}
          {isFloatingCardEnabled && (
            <div 
              style={{
                borderRadius: `${floatingCardSettings.borderRadius || 18}px`,
                backgroundColor: floatingCardSettings.backgroundColor || 'rgba(255, 255, 255, 0.95)',
                boxShadow: floatingCardSettings.shadow || '0 20px 40px rgba(0,0,0,0.15)',
                opacity: (floatingCardSettings.opacity ?? 95) / 100,
                width: floatingCardSettings.width ? `${floatingCardSettings.width}px` : '200px'
              }}
              className={`absolute border border-slate-100 text-[#0F172A] p-4 flex items-center gap-3 z-20 ${
                floatingCardSettings.position === 'top-left' ? 'top-6 left-6' :
                floatingCardSettings.position === 'top-right' ? 'top-6 right-6' :
                floatingCardSettings.position === 'bottom-left' ? 'bottom-6 left-6' : 'bottom-6 right-6'
              }`}
            >
              <div className="p-2 bg-[#10B981]/15 rounded-xl text-[#10B981]">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">{floatingCardSettings.label || 'Properties'}</p>
                <p className="text-base font-black text-[#10B981] tracking-tight">{floatingCardSettings.title || banner.propertyCountBadge || '500+ Verified'}</p>
                <p className="text-[9px] text-slate-400 font-medium leading-tight">{floatingCardSettings.description || 'Premium locations'}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Audio Muted/Mute trigger button for video banners */}
      {isVideoMode && (
        <button 
          onClick={() => setMuted(!muted)} 
          className="absolute right-4 bottom-4 p-2 bg-slate-900/45 backdrop-blur-md text-white rounded-full hover:bg-slate-900/70 z-30 flex items-center justify-center focus:outline-none"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      )}

      {/* Styled css support variables for responsive heights */}
      <style>{`
        .hero-builder-container {
          min-height: var(--mobile-h);
        }
        @media (min-width: 640px) {
          .hero-builder-container {
            min-height: var(--tablet-h);
          }
        }
        @media (min-width: 1024px) {
          .hero-builder-container {
            min-height: var(--desktop-h);
          }
        }
      `}</style>
    </div>
  );
}
