import React, { useEffect, useState, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { 
  Home, 
  Smile, 
  Handshake, 
  Star, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  LucideIcon 
} from 'lucide-react';

interface StatisticsCounterProps {
  cards?: any[];
  settings?: any;
  isPreviewMode?: boolean;
}

// Map emojis/icons to luxury Lucide icons
const iconMap: Record<string, LucideIcon> = {
  '🏡': Home,
  '🏠': Home,
  '😊': Smile,
  '🤝': Handshake,
  '⭐': Star,
  '📍': MapPin
};

const getLucideIcon = (iconStr: string): LucideIcon => {
  return iconMap[iconStr] || Home;
};

// Custom hook to handle count-up animation using requestAnimationFrame for 60fps performance
function useCountUp(target: string, durationMs: number, startAnimate: boolean, prefersReduced: boolean, delayMs: number) {
  const [displayValue, setDisplayValue] = useState('0');
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!startAnimate) return;

    if (prefersReduced) {
      setDisplayValue(target);
      setIsFinished(true);
      return;
    }

    const numberMatch = target.match(/(\d+)/);
    if (!numberMatch) {
      const timer = setTimeout(() => {
        setDisplayValue(target);
        setIsFinished(true);
      }, delayMs);
      return () => clearTimeout(timer);
    }

    const targetNum = parseInt(numberMatch[1], 10);
    const prefix = target.substring(0, numberMatch.index || 0);
    const suffix = target.substring((numberMatch.index || 0) + numberMatch[1].length);

    let isCancelled = false;
    let animationFrameId: number;

    const timer = setTimeout(() => {
      if (isCancelled) return;
      let startTimestamp: number | null = null;

      const step = (timestamp: number) => {
        if (isCancelled) return;
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
        
        // Cubic ease-out
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentNum = Math.floor(easeProgress * targetNum);
        
        setDisplayValue(`${prefix}${currentNum}${suffix}`);

        if (progress < 1) {
          animationFrameId = window.requestAnimationFrame(step);
        } else {
          setDisplayValue(target);
          setIsFinished(true);
        }
      };

      animationFrameId = window.requestAnimationFrame(step);
    }, delayMs);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [target, durationMs, startAnimate, prefersReduced, delayMs]);

  return { displayValue, isFinished };
}

function StatisticCardComponent({
  card,
  delay,
  duration,
  isInView,
  prefersReduced,
}: {
  card: { id: string; number: string; title: string; icon: string };
  delay: number;
  duration: number;
  isInView: boolean;
  prefersReduced: boolean;
  key?: string;
}) {
  const { displayValue, isFinished } = useCountUp(
    card.number,
    duration * 1000,
    isInView,
    prefersReduced,
    delay
  );

  const IconComponent = getLucideIcon(card.icon);

  // Luxury bezier easing for true elite feeling (300ms ease-in-out transition)
  const premiumTransition = {
    duration: 0.3,
    ease: "easeInOut"
  };

  const scrollTransition = {
    duration: prefersReduced ? 0 : 0.7,
    delay: prefersReduced ? 0 : delay / 1000,
    ease: [0.22, 1, 0.36, 1]
  };

  return (
    <motion.div
      initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      whileHover="hover"
      transition={isInView ? scrollTransition : {}}
      variants={{
        hover: {
          y: -6, // Lift upward by 6px
          scale: 1.02, // Scale slightly (1.02x)
          backgroundColor: '#0B1F3A', // Smoothly transition to deep navy blue background
          borderColor: '#D4AF37', // Thin premium gold border around hovered card
          boxShadow: '0 20px 40px -10px rgba(11, 31, 58, 0.45), 0 0 20px rgba(212, 175, 55, 0.15)', // Soft navy and gold glow
          transition: premiumTransition
        }
      }}
      className="group relative py-6 px-4 sm:py-7 sm:px-6 bg-white rounded-[24px] border border-slate-100 select-none overflow-hidden flex-1 min-w-[260px] sm:min-w-[280px] xl:min-w-0 snap-start shrink-0 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-300"
    >
      {/* Subtle gold wave pattern in the bottom-right corner of the hovered card (10-15% opacity) */}
      {!prefersReduced && (
        <motion.div
          variants={{
            hover: {
              opacity: 0.12, // 10–15% opacity for luxury appearance
              scale: 1.05,
              transition: premiumTransition
            }
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none text-[#D4AF37] z-0"
        >
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full stroke-current stroke-[0.75]">
            <path d="M10,100 C30,85 50,92 70,75 C90,58 95,65 100,50" />
            <path d="M20,100 C38,88 54,94 72,78 C90,62 96,68 100,55" />
            <path d="M30,100 C46,91 58,96 74,81 C90,66 97,71 100,60" />
            <path d="M40,100 C54,94 62,98 76,84 C90,70 98,74 100,65" />
          </svg>
        </motion.div>
      )}

      {/* Subtle Gold Shimmer Diagonal Light Sweep on Hover */}
      {!prefersReduced && (
        <motion.div
          variants={{
            hover: {
              x: '160%',
              transition: {
                duration: 0.85,
                ease: [0.22, 1, 0.36, 1]
              }
            }
          }}
          initial={{ x: '-160%', skewX: -20 }}
          className="absolute top-0 left-0 w-[40%] h-full bg-gradient-to-r from-transparent via-[#D4AF37]/8 to-transparent pointer-events-none z-10"
        />
      )}

      {/* Completion Pulse Effect */}
      {!prefersReduced && isFinished && (
        <motion.div
          initial={{ opacity: 0.4, boxShadow: "inset 0 0 12px rgba(212,175,55,0.12)" }}
          animate={{ opacity: 0, boxShadow: "inset 0 0 0px rgba(212,175,55,0)" }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="absolute inset-0 pointer-events-none rounded-[24px] border border-[#D4AF37]/10"
        />
      )}

      {/* Luxury Gold Icon Circle - Centered (becomes white rounded square with soft shadow on hover) */}
      <motion.div
        variants={{
          hover: {
            scale: 1.1, // Scale the icon to 110%
            rotate: 4, // Rotate the icon very gently (3°-5°)
            backgroundColor: '#ffffff', // Keep the icon inside its white rounded square
            borderColor: '#ffffff',
            boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.25)', // soft shadow
            transition: premiumTransition
          }
        }}
        className="relative w-13 h-13 bg-[#D4AF37]/5 border border-[#D4AF37]/10 rounded-2xl flex items-center justify-center text-[#D4AF37] shadow-sm mb-4 transition-all duration-300 z-10"
      >
        <IconComponent className="w-5.5 h-5.5 stroke-[1.5] relative z-10" />

        {/* Small gold sparkle accents near the top-right of the icon */}
        {!prefersReduced && (
          <>
            <motion.div
              variants={{
                hover: { opacity: 1, scale: 1, y: -2, x: 2, transition: { ...premiumTransition, delay: 0.05 } }
              }}
              initial={{ opacity: 0, scale: 0, y: 0, x: 0 }}
              className="absolute -top-1.5 -right-1.5 text-[#D4AF37] pointer-events-none z-20"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M12,2 L13.5,9 L20,10.5 L13.5,12 L12,18.5 L10.5,12 L4,10.5 L10.5,9 Z" />
              </svg>
            </motion.div>
            <motion.div
              variants={{
                hover: { opacity: 0.8, scale: 0.8, y: -4, x: -1, transition: { ...premiumTransition, delay: 0.12 } }
              }}
              initial={{ opacity: 0, scale: 0, y: 0, x: 0 }}
              className="absolute -top-4 right-1.5 text-[#D4AF37] pointer-events-none z-20"
            >
              <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current">
                <path d="M12,2 L13.5,9 L20,10.5 L13.5,12 L12,18.5 L10.5,12 L4,10.5 L10.5,9 Z" />
              </svg>
            </motion.div>
            <motion.div
              variants={{
                hover: { opacity: 0.6, scale: 0.6, y: 1, x: 4, transition: { ...premiumTransition, delay: 0.18 } }
              }}
              initial={{ opacity: 0, scale: 0, y: 0, x: 0 }}
              className="absolute top-1.5 -right-4.5 text-[#D4AF37] pointer-events-none z-20"
            >
              <svg viewBox="0 0 24 24" className="w-2 h-2 fill-current">
                <path d="M12,2 L13.5,9 L20,10.5 L13.5,12 L12,18.5 L10.5,12 L4,10.5 L10.5,9 Z" />
              </svg>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Stat Value & Title - Centered vertically and horizontally */}
      <div className="space-y-1.5 flex flex-col items-center z-10">
        {/* Number - Transitions smoothly to White */}
        <motion.h3
          variants={{
            hover: {
              scale: 1.05, // Animate the number with a subtle scale (1.05x)
              color: '#ffffff', // Change the statistic number to white
              transition: premiumTransition
            }
          }}
          className="text-3xl sm:text-3.5xl font-sans font-extrabold tracking-tight text-slate-950 transition-colors duration-300"
        >
          {displayValue}
        </motion.h3>

        {/* Label / Title - Transitions smoothly to Premium Gold */}
        <motion.p
          variants={{
            hover: {
              color: '#D4AF37', // Change the label text to premium gold
              opacity: 1, // Increase the label opacity
              transition: premiumTransition
            }
          }}
          initial={{ opacity: 0.72 }}
          className="text-xs sm:text-[13px] font-sans font-semibold text-slate-500 tracking-wider uppercase select-none transition-colors duration-300"
        >
          {card.title}
        </motion.p>

        {/* Keep the small gold underline below the label */}
        <motion.div
          variants={{
            hover: {
              backgroundColor: '#D4AF37',
              width: 32,
              opacity: 1,
              transition: premiumTransition
            }
          }}
          initial={{ opacity: 0.4 }}
          className="w-6 h-0.5 bg-[#D4AF37]/50 rounded-full mt-1.5 transition-all duration-300"
        />
      </div>
    </motion.div>
  );
}

export default function StatisticsCounter({ isPreviewMode = false }: StatisticsCounterProps) {
  const prefersReduced = useReducedMotion() || false;
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [activeDot, setActiveDot] = useState(0);

  // Exact 5 cards required by prompt
  const EXACT_CARDS = [
    { id: 'properties-available', number: '500+', title: 'Properties Available', icon: '🏡' },
    { id: 'happy-clients', number: '250+', title: 'Happy Clients', icon: '😊' },
    { id: 'successful-deals', number: '350+', title: 'Successful Deals', icon: '🤝' },
    { id: 'client-satisfaction', number: '98%', title: 'Client Satisfaction', icon: '⭐' },
    { id: 'locations-covered', number: '25+', title: 'Prime Locations Covered', icon: '📍' }
  ];

  useEffect(() => {
    if (isPreviewMode) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isPreviewMode]);

  // Handle carousel scroll monitoring to sync indicators
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (container) {
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.firstElementChild?.getBoundingClientRect().width || 300;
      const gap = 24; // space-x-6 gap is 24px
      const totalWidth = cardWidth + gap;
      
      const index = Math.round(scrollLeft / totalWidth);
      setActiveDot(Math.max(0, Math.min(index, EXACT_CARDS.length - 1)));
    }
  };

  // Dot navigation click helper
  const handleDotClick = (idx: number) => {
    const container = scrollContainerRef.current;
    if (container) {
      const cardWidth = container.firstElementChild?.getBoundingClientRect().width || 300;
      const gap = 24;
      const totalWidth = cardWidth + gap;
      
      container.scrollTo({
        left: idx * totalWidth,
        behavior: 'smooth'
      });
      setActiveDot(idx);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="trust-achievements-section"
      className="py-20 relative bg-white border-t border-b border-slate-100 overflow-hidden"
    >
      {/* Premium Ambient Background Accents */}
      <div className="absolute top-[-10%] right-[5%] w-[350px] h-[350px] bg-[#D4AF37]/3 rounded-full blur-[90px] pointer-events-none select-none" />
      <div className="absolute bottom-[-10%] left-[5%] w-[400px] h-[400px] bg-amber-500/2 rounded-full blur-[100px] pointer-events-none select-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: prefersReduced ? 0 : 0.7, ease: 'easeOut' }}
          className="text-center space-y-4 mb-16"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D4AF37]/10 rounded-md border border-[#D4AF37]/25 text-[#D4AF37] text-[10px] font-mono uppercase tracking-widest font-bold">
            🏆 Premium Performance
          </span>
          <h2 className="text-3xl sm:text-4.5xl font-sans font-extrabold tracking-tight text-slate-900">
            Our Numbers Speak <span className="text-[#D4AF37]">for Themselves</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mx-auto font-light leading-relaxed">
            Our commitment to transparency, expert guidance, and exceptional service is reflected in every successful property journey.
          </p>
          <div className="w-12 h-[3px] bg-[#D4AF37] mx-auto rounded-full mt-3" />
        </motion.div>

        {/* Statistics Desktop horizontal flow & Tablet/Mobile Swipe Carousel */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto xl:overflow-visible xl:flex-row gap-6 snap-x snap-mandatory scrollbar-none pb-6 xl:pb-0 -mx-4 px-4 sm:-mx-6 sm:px-6 xl:mx-0 xl:px-0 xl:w-full xl:justify-between [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {EXACT_CARDS.map((card, idx) => {
              const delay = idx * 120; // 120ms stagger delay
              return (
                <StatisticCardComponent
                  key={card.id}
                  card={card}
                  delay={delay}
                  duration={2.0} // 2 seconds count up duration
                  isInView={isInView}
                  prefersReduced={prefersReduced}
                />
              );
            })}
          </div>
        </div>

        {/* Navigation Indicator Dots - Visible only on Tablets and Mobile */}
        <div className="flex xl:hidden items-center justify-center gap-2.5 mt-2">
          {EXACT_CARDS.map((_, idx) => {
            const isActive = activeDot === idx;
            return (
              <button
                key={idx}
                onClick={() => handleDotClick(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive ? 'w-6 bg-[#D4AF37]' : 'w-2 bg-slate-200 hover:bg-slate-300'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            );
          })}
        </div>

      </div>
    </section>
  );
}
