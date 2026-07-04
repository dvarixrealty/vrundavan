import React, { useMemo, useRef, useState, useEffect } from 'react';
import { 
  ArrowRight, CheckCircle, Heart, ChevronLeft, ChevronRight, 
  MapPin, Home, Building, Building2, Grid, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Property } from '../types';

interface PropertyListingsProps {
  selectedType: string;
  setSelectedType: (type: string) => void;
  searchFilter: { keyword: string; type: string; location: string };
  favorites: string[];
  toggleFavorite: (id: string) => void;
  onViewDetails: (property: Property) => void;
  properties?: Property[];
  onViewAllProperties?: () => void;
  onQuickEnquireClick?: () => void;
  categories?: any;
}

export default function PropertyListings({
  favorites,
  toggleFavorite,
  onViewDetails,
  properties = [],
  onViewAllProperties
}: PropertyListingsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Filter properties: show Bangalore first and prioritize our specific design ones
  const curatedProperties = useMemo(() => {
    // Collect specific ones first to match the reference visual exactly
    const targetIds = ['prop-dvarix-1', 'prop-dvarix-2', 'prop-dvarix-3', 'prop-dvarix-4'];
    const exactMatches = properties.filter(p => targetIds.includes(p.id));
    
    // Sort exact matches in the correct order
    const orderedMatches = [...exactMatches].sort((a, b) => {
      return targetIds.indexOf(a.id) - targetIds.indexOf(b.id);
    });

    // Get any other Bangalore / general properties from database dynamically to allow admin updates
    const otherProperties = properties.filter(p => !targetIds.includes(p.id));

    return [...orderedMatches, ...otherProperties];
  }, [properties]);

  // Read which category is active based on current scrolled item to show elegant shifting subtitle
  const activeCategoryLabel = useMemo(() => {
    const currentProp = curatedProperties[activeIndex];
    if (!currentProp) return 'FEATURED OPPORTUNITIES';
    
    const type = currentProp.type.toUpperCase();
    if (type.includes('PLOT')) return 'FEATURED PLOTS';
    if (type.includes('APARTMENT')) return 'FEATURED APARTMENTS';
    if (type.includes('VILLA')) return 'FEATURED VILLAS';
    if (type.includes('COMMERCIAL')) return 'FEATURED COMMERCIAL';
    if (type.includes('WAREHOUSE')) return 'FEATURED WAREHOUSES';
    if (type.includes('HOMESTAY') || type.includes('STAY')) return 'FEATURED RETREATS';
    return `FEATURED ${type}`;
  }, [activeIndex, curatedProperties]);

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2).replace(/\.00$/, '')} L`;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Get custom specs description based on property attributes to mimic design
  const getPropertySpecsAndDescription = (prop: Property) => {
    const type = prop.type.toLowerCase();
    if (type.includes('plot')) {
      return {
        icon: <Grid className="h-4.5 w-4.5 text-[#ff5a3c]" />,
        label: `Premium Villa Plots  |  1200 - 2400 Sq.ft`
      };
    } else if (type.includes('apartment')) {
      return {
        icon: <Building className="h-4.5 w-4.5 text-[#ff5a3c]" />,
        label: `3 & 4 BHK Apartments  |  1400 - 2200 Sq.ft`
      };
    } else if (type.includes('villa')) {
      return {
        icon: <Home className="h-4.5 w-4.5 text-[#ff5a3c]" />,
        label: `4 & 5 BHK Luxury Villas  |  2400 - 3600 Sq.ft`
      };
    } else if (type.includes('commercial')) {
      return {
        icon: <Building2 className="h-4.5 w-4.5 text-[#ff5a3c]" />,
        label: `Office & Retail Spaces  |  800 - 5000 Sq.ft`
      };
    } else {
      return {
        icon: <Home className="h-4.5 w-4.5 text-[#ff5a3c]" />,
        label: `${prop.beds ? prop.beds + ' BHK ' : ''}${prop.type}  |  ${prop.sqft} Sq.ft`
      };
    }
  };

  // Handle detection of active card during scrolls (both touch & desktop clicks)
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;

    // Check bounds for arrows
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

    // Calculate nearest visible card index based on spacing + card width
    const cardElements = container.querySelectorAll('.property-carousel-card');
    if (cardElements.length === 0) return;

    let closestIndex = 0;
    let minDistance = Infinity;
    const containerCenter = scrollLeft + clientWidth / 2;

    cardElements.forEach((el, index) => {
      const htmlEl = el as HTMLElement;
      const cardCenter = htmlEl.offsetLeft + htmlEl.offsetWidth / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      // Run once initially
      handleScroll();
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [curatedProperties, activeIndex]);

  // Navigate using arrows
  const handleNavigate = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardElements = container.querySelectorAll('.property-carousel-card');
    if (cardElements.length === 0) return;

    const cardWidth = (cardElements[0] as HTMLElement).offsetWidth + 24; // Width + gap
    const targetScrollLeft = container.scrollLeft + (direction === 'left' ? -cardWidth : cardWidth);

    container.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth'
    });
  };

  // Click dot indicator to scroll directly
  const handleDotClick = (index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardElements = container.querySelectorAll('.property-carousel-card');
    if (cardElements.length === 0 || !cardElements[index]) return;

    const targetScrollLeft = (cardElements[index] as HTMLElement).offsetLeft - (container.clientWidth - (cardElements[index] as HTMLElement).offsetWidth) / 2;
    
    container.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth'
    });
    
    setActiveIndex(index);
  };

  return (
    <section 
      className="bg-white py-20 px-4 sm:px-6 lg:px-8 text-slate-900 border-t border-slate-100 relative overflow-hidden" 
      id="homepage-featured-showcase"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* VIEWPORT ENTRANCE MOTION CONTAINER (Heading + Subheading) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-4 mb-12 max-w-4xl mx-auto"
        >
          {/* SNEAK CATEGORY BADGE */}
          <div className="flex justify-center items-center gap-1">
            <span className="text-[11px] sm:text-xs uppercase font-mono tracking-widest font-black text-amber-500 flex items-center gap-2">
              <span className="text-[#ff5a3c]">—</span> {activeCategoryLabel} <span className="text-[#ff5a3c]">—</span>
            </span>
          </div>
          
          {/* HEADLINE */}
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0a192f] tracking-tight leading-tight"
          >
            Find the Right Property for Your Next Move
          </motion.h2>
          
          {/* SUBHEADLINE */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-slate-500 text-xs sm:text-sm md:text-base max-w-2xl mx-auto font-sans font-light leading-relaxed px-2"
          >
            Explore verified plots, apartments, villas, rentals, and commercial opportunities across Bengaluru.
          </motion.p>

          {/* DELIBERATE ORANGE ACCENT LINE */}
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="w-14 h-1 bg-[#ff5a3c] rounded-full mx-auto mt-4 origin-center"
          />
        </motion.div>

        {/* PROPERTY CAROUSEL OVERVIEW */}
        <div className="relative group/carousel px-1 sm:px-4">
          
          {/* DESKTOP NAVIGATION PANEL: Left arrow */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => handleNavigate('left')}
              className="absolute -left-2 sm:-left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white text-slate-800 flex items-center justify-center shadow-lg hover:bg-[#ff5a3c] hover:text-white transition duration-300 z-30 cursor-pointer hidden md:flex"
              aria-label="Previous property"
            >
              <ChevronLeft className="h-6 w-6 stroke-[2.5px]" />
            </button>
          )}

          {/* SWIPEABLE PORTFOLIO SECTORS CONTAINER */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-8 px-2 sm:px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {curatedProperties.map((prop, index) => {
              const specs = getPropertySpecsAndDescription(prop);
              return (
                <motion.div
                  key={prop.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: Math.min(index * 0.1, 0.4), ease: "easeOut" }}
                  className="property-carousel-card min-w-[280px] sm:min-w-[340px] md:min-w-[370px] max-w-[380px] flex-1 snap-center snap-always bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-2.5 transition-all duration-300 flex flex-col group mb-4"
                >
                  {/* Photo frame */}
                  <div className="relative aspect-[4/3] rounded-t-[2rem] overflow-hidden bg-slate-50">
                    <img
                      src={prop.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
                      alt={prop.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      referrerPolicy="no-referrer"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                    
                    {/* Floating verified tag */}
                    <div className="absolute top-4 left-4">
                      <span className="text-[10px] sm:text-xs tracking-wider uppercase bg-white/95 backdrop-blur-xs text-emerald-600 font-extrabold py-1.5 px-3 rounded-full flex items-center gap-1 shadow-md border border-emerald-500/10 leading-none">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 fill-emerald-100" /> VERIFIED {prop.type.toUpperCase()}
                      </span>
                    </div>

                    {/* Favorite heart selector toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(prop.id);
                      }}
                      className="absolute top-4 right-4 w-9 h-9 sm:w-10 sm:h-10 bg-slate-950/40 hover:bg-slate-950/70 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-xs cursor-pointer shadow-sm z-10"
                    >
                      <Heart className={`h-4.5 w-4.5 sm:h-5 sm:w-5 transition-transform duration-200 ${favorites.includes(prop.id) ? 'fill-[#ff5a3c] text-[#ff5a3c] scale-110' : 'text-white'}`} />
                    </button>

                    {/* Floating location marker bottom-left */}
                    <div className="absolute bottom-4 left-4">
                      <div className="bg-slate-950/70 backdrop-blur-md text-white text-[11px] sm:text-xs px-3 py-1.5 rounded-xl font-medium tracking-tight flex items-center gap-1 shadow-sm">
                        <MapPin className="h-3.5 w-3.5 text-amber-500" />
                        <span>{prop.address || `${prop.locationName || prop.location}, India`}</span>
                      </div>
                    </div>
                  </div>

                  {/* Core details workspace */}
                  <div className="p-6 flex flex-col justify-between flex-grow text-left space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-base sm:text-xl font-extrabold text-[#0a192f] group-hover:text-[#ff5a3c] transition-colors leading-snug line-clamp-1">
                        {prop.title}
                      </h3>
                      
                      {/* Specs section (with icons & typography matching design reference) */}
                      <div className="flex items-center gap-2 py-0.5">
                        <div className="p-1 rounded-md bg-[#ff5a3c]/10 text-[#ff5a3c]">
                          {specs.icon}
                        </div>
                        <span className="text-slate-500 font-medium text-xs sm:text-[13px] leading-relaxed">
                          {specs.label}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Pricing & Card CTA banner */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-left flex flex-col">
                        <span className="text-[9px] uppercase font-mono tracking-widest text-[#ff5a3c] font-black">VALUATION STARTING</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg sm:text-xl font-extrabold text-[#ff5a3c] tracking-tight">
                            {formatPrice(prop.price)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium uppercase">Onwards</span>
                        </div>
                      </div>

                      {/* Circle Arrow Action Button click to modal */}
                      <button
                        type="button"
                        onClick={() => onViewDetails(prop)}
                        className="w-10 h-10 rounded-full border border-[#ff5a3c]/35 flex items-center justify-center text-[#ff5a3c] group-hover:bg-[#ff5a3c] group-hover:text-white group-hover:border-[#ff5a3c] hover:scale-105 transition-all duration-300 cursor-pointer shadow-xs"
                      >
                        <ArrowRight className="h-4.5 w-4.5" strokeWidth={2.5} />
                      </button>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* DESKTOP NAVIGATION PANEL: Right arrow */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => handleNavigate('right')}
              className="absolute -right-2 sm:-right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white text-slate-800 flex items-center justify-center shadow-lg hover:bg-[#ff5a3c] hover:text-white transition duration-300 z-30 cursor-pointer hidden md:flex"
              aria-label="Next property"
            >
              <ChevronRight className="h-6 w-6 stroke-[2.5px]" />
            </button>
          )}

        </div>

        {/* DOTS SLIDER INDICATOR (Responsive with dynamic active states) */}
        <div className="flex justify-center items-center gap-2 mt-4">
          {curatedProperties.slice(0, Math.min(curatedProperties.length, 6)).map((_, dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              onClick={() => handleDotClick(dotIndex)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === dotIndex 
                  ? 'w-6 bg-[#ff5a3c]' 
                  : 'w-2.5 bg-slate-200 hover:bg-slate-350'
              }`}
              aria-label={`Go to slide ${dotIndex + 1}`}
            />
          ))}
        </div>

        {/* VIEW ALL PROPERTIES REDIRECTION WITH DECORATIVE CORNER ANIMATIONS */}
        <div className="mt-14 flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            
            {/* Whimsical design sparks from image */}
            <div className="absolute -top-3 -right-6 hidden sm:block pointer-events-none">
              <svg className="w-5 h-5 text-amber-500 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" strokeLinecap="round"/>
              </svg>
            </div>
            
            <button
              type="button"
              onClick={onViewAllProperties}
              className="px-8 py-4.5 bg-[#040d21] hover:bg-[#ff5a3c] text-white font-sans text-xs sm:text-sm font-extrabold uppercase tracking-widest rounded-2xl shadow-lg hover:shadow-amber-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-3 cursor-pointer group"
            >
              <span>View All Properties</span>
              <ArrowRight className="h-4.5 w-4.5 transition-transform duration-200 transform group-hover:translate-x-1" strokeWidth={3} />
            </button>
          </div>
          
          <span className="text-[12px] sm:text-xs text-slate-400 font-medium tracking-tight">
            Explore complete listings with advanced filters
          </span>
        </div>

      </div>
    </section>
  );
}
