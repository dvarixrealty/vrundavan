import React from 'react';
import { motion } from 'motion/react';
import { 
  Compass, 
  Home, 
  Building2, 
  Key, 
  TrendingUp, 
  CheckCircle2, 
  Target, 
  Eye, 
  Users, 
  ShieldCheck, 
  Award, 
  HeartHandshake, 
  Sparkles, 
  Phone, 
  ArrowRight,
  ClipboardCheck,
  BadgePercent,
  Check,
  CornerDownRight,
  Quote
} from 'lucide-react';

interface AboutPageViewProps {
  setActiveTab: (tab: any) => void;
  onOpenCustomRequest: () => void;
}

// ---------------------------------------------------------
// PREMIUM LUXURY ENTERPRISE ANIMATION COMPONENTS
// ---------------------------------------------------------

interface LuxuryRevealProps {
  children: React.ReactNode;
  variant?: 'fade-up' | 'fade-in' | 'slide-up' | 'slide-left' | 'slide-right' | 'blur' | 'clip' | 'scale' | 'cinematic';
  delay?: number;
  duration?: number;
  className?: string;
  replay?: boolean;
}

export function LuxuryReveal({
  children,
  variant = 'fade-up',
  delay = 0,
  duration,
  className = '',
  replay = true,
}: LuxuryRevealProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const selectVariants = () => {
    switch (variant) {
      case 'fade-in':
        return {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { duration: duration || 1.0, ease: [0.16, 1, 0.3, 1], delay }
          }
        };
      case 'slide-up':
        return {
          hidden: { opacity: 0, y: 50 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: duration || 0.8, ease: [0.16, 1, 0.3, 1], delay }
          }
        };
      case 'slide-left':
        return {
          hidden: { opacity: 0, x: 50 },
          visible: {
            opacity: 1,
            x: 0,
            transition: { duration: duration || 0.8, ease: [0.16, 1, 0.3, 1], delay }
          }
        };
      case 'slide-right':
        return {
          hidden: { opacity: 0, x: -50 },
          visible: {
            opacity: 1,
            x: 0,
            transition: { duration: duration || 0.8, ease: [0.16, 1, 0.3, 1], delay }
          }
        };
      case 'blur':
        return {
          hidden: { opacity: 0, filter: 'blur(8px)', y: 15 },
          visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: { duration: duration || 0.9, ease: [0.16, 1, 0.3, 1], delay }
          }
        };
      case 'clip':
        return {
          hidden: { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0, y: 20 },
          visible: {
            clipPath: 'inset(0% 0% 0% 0%)',
            opacity: 1,
            y: 0,
            transition: { duration: duration || 1.0, ease: [0.16, 1, 0.3, 1], delay }
          }
        };
      case 'scale':
        return {
          hidden: { opacity: 0, scale: 0.95, y: 10 },
          visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: duration || 0.8, ease: [0.16, 1, 0.3, 1], delay }
          }
        };
      case 'cinematic':
        return {
          hidden: { opacity: 0, filter: 'blur(12px)', scale: 1.05, y: 30 },
          visible: {
            opacity: 1,
            filter: 'blur(0px)',
            scale: 1,
            y: 0,
            transition: { duration: duration || 1.2, ease: [0.16, 1, 0.3, 1], delay }
          }
        };
      case 'fade-up':
      default:
        return {
          hidden: { opacity: 0, y: 30 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: duration || 0.8, ease: [0.16, 1, 0.3, 1], delay }
          }
        };
    }
  };

  return (
    <motion.div
      className={className}
      variants={selectVariants()}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: !replay, amount: 0.15 }}
    >
      {children}
    </motion.div>
  );
}

interface SplitTextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  replay?: boolean;
  variant?: 'word' | 'character';
}

export function SplitTextReveal({
  text,
  className = '',
  delay = 0,
  duration = 0.6,
  replay = true,
  variant = 'word',
}: SplitTextRevealProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  if (prefersReducedMotion) {
    return <span className={className}>{text}</span>;
  }

  if (variant === 'word') {
    const words = text.split(' ');
    
    const container = {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.08,
          delayChildren: delay,
        }
      }
    };

    const child = {
      hidden: { opacity: 0, y: '35%', filter: 'blur(3px)' },
      visible: {
        opacity: 1,
        y: '0%',
        filter: 'blur(0px)',
        transition: { duration, ease: [0.16, 1, 0.3, 1] }
      }
    };

    return (
      <motion.span
        className={`inline-block ${className}`}
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: !replay, amount: 0.1 }}
      >
        {words.map((word, i) => (
          <motion.span key={i} className="inline-block mr-[0.25em] whitespace-nowrap" variants={child}>
            {word}
          </motion.span>
        ))}
      </motion.span>
    );
  } else {
    const chars = Array.from(text);

    const container = {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.02,
          delayChildren: delay,
        }
      }
    };

    const child = {
      hidden: { opacity: 0, y: '50%' },
      visible: {
        opacity: 1,
        y: '0%',
        transition: { duration: duration * 0.8, ease: [0.16, 1, 0.3, 1] }
      }
    };

    return (
      <motion.span
        className={`inline-block ${className}`}
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: !replay, amount: 0.1 }}
      >
        {chars.map((char, i) => (
          <motion.span key={i} className="inline-block" variants={child}>
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.span>
    );
  }
}

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  hoverType?: 'emerald' | 'gold' | 'white' | 'slate' | 'none';
  onClick?: () => void;
  id?: string;
}

export function InteractiveCard({
  children,
  className = '',
  hoverType = 'emerald',
  onClick,
  id,
}: InteractiveCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [coords, setCoords] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setCoords({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  const getGlowShadow = () => {
    if (!isHovered) return '0px 1px 3px rgba(0, 0, 0, 0.05), 0px 1px 2px rgba(0, 0, 0, 0.02)';
    switch (hoverType) {
      case 'gold':
        return '0 25px 50px -12px rgba(212, 175, 55, 0.22), 0 0 20px -3px rgba(212, 175, 55, 0.4)';
      case 'emerald':
        return '0 25px 50px -12px rgba(16, 185, 129, 0.22), 0 0 20px -3px rgba(16, 185, 129, 0.4)';
      case 'slate':
        return '0 25px 50px -12px rgba(15, 23, 42, 0.3), 0 0 20px -3px rgba(15, 23, 42, 0.45)';
      case 'white':
        return '0 25px 50px -12px rgba(255, 255, 255, 0.2), 0 0 20px -3px rgba(255, 255, 255, 0.35)';
      case 'none':
      default:
        return '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)';
    }
  };

  return (
    <motion.div
      ref={cardRef}
      id={id}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      animate={{
        rotateX: isHovered ? -coords.y * 10 : 0,
        rotateY: isHovered ? coords.x * 10 : 0,
        y: isHovered ? -12 : 0,
        scale: isHovered ? 1.03 : 1,
        boxShadow: getGlowShadow(),
      }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      className={`relative overflow-hidden cursor-pointer select-none transition-all duration-300 ${className}`}
    >
      {/* Dynamic Cursor Light Spot Reflection */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-700 z-0"
        style={{
          background: `radial-gradient(circle 200px at ${(coords.x + 0.5) * 100}% ${(coords.y + 0.5) * 100}%, rgba(255, 255, 255, 0.12), transparent)`,
        }}
      />
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {children}
      </div>
    </motion.div>
  );
}

export default function AboutPageView({ setActiveTab, onOpenCustomRequest }: AboutPageViewProps) {
  const [replay, setReplay] = React.useState(true);
  // Common container for consistent animation stagger
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  return (
    <div className="bg-white text-[#0F172A] min-h-screen overflow-x-hidden font-sans" id="about-us-page-view">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-[#070d19] overflow-hidden py-24 group/hero" id="about-hero">
        {/* Cinematic rich background with abstract luxury architecture silhouette */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            referrerPolicy="no-referrer"
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1600&auto=format&fit=crop" 
            alt="Modern luxury architecture" 
            className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity scale-105 animate-cinematic-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070d19] via-[#070d19]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070d19]/90 via-transparent to-[#070d19]/90" />
        </div>

        {/* Delicate floating gold and white circular light elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none animate-float-gentle" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#10B981]/5 rounded-full blur-[120px] pointer-events-none animate-float-gentle [animation-delay:2s]" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <LuxuryReveal variant="scale" delay={0.2} replay={replay}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs font-mono font-bold uppercase tracking-widest text-[#D4AF37] mb-6 hover:bg-[#D4AF37]/20 transition-all duration-300 cursor-default select-none hover:shadow-[0_0_15px_rgba(212,175,55,0.25)]">
              <Sparkles className="h-3 w-3 animate-spin-slow" />
              <span>About Dvarix Realty</span>
            </div>
          </LuxuryReveal>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-white tracking-tight leading-tight md:leading-normal font-medium max-w-4xl mx-auto block mb-6">
            <SplitTextReveal text="You Need a Property." className="block" delay={0.4} duration={0.8} replay={replay} />
            <span className="text-[#D4AF37] relative inline-block group/title cursor-default select-none mt-2">
              <SplitTextReveal text="We Find the Right One." className="block" delay={0.8} duration={0.8} replay={replay} />
              <span className="absolute left-0 bottom-1 sm:bottom-2 w-0 group-hover/title:w-full h-[3px] bg-[#10B981] rounded-full opacity-80 transition-all duration-500 ease-out" style={{ width: '100%' }} />
            </span>
          </h1>

          <LuxuryReveal variant="blur" delay={1.1} replay={replay}>
            <p className="mt-8 text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl mx-auto font-light">
              At Dvarix Realty, we understand that every property requirement is unique. Whether you are searching for your dream home, looking for a profitable investment opportunity, planning to rent a suitable space, or exploring commercial real estate options, our goal is simple — to help you find the right property solution with confidence.
            </p>
          </LuxuryReveal>

          <LuxuryReveal variant="fade-up" delay={1.4} replay={replay}>
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
              <motion.button
                whileHover={{ 
                  scale: 1.04, 
                  y: -5,
                  boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.4), 0 10px 10px -5px rgba(16, 185, 129, 0.2)"
                }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 350, damping: 15 }}
                onClick={() => {
                  setActiveTab('Properties');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#10B981] text-white rounded-xl text-sm font-semibold tracking-wide cursor-pointer flex items-center justify-center gap-2 hover-shine-sweep active:scale-95 transition-colors duration-300"
              >
                Explore Properties
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/hero:translate-x-1" />
              </motion.button>
              
              <motion.button
                whileHover={{ 
                  scale: 1.04, 
                  y: -5,
                  boxShadow: "0 20px 25px -5px rgba(15, 23, 42, 0.5), 0 10px 10px -5px rgba(15, 23, 42, 0.3)"
                }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 350, damping: 15 }}
                onClick={() => {
                  setActiveTab('Contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-800/80 text-white rounded-xl text-sm font-semibold tracking-wide cursor-pointer border border-slate-700 backdrop-blur-sm flex items-center justify-center gap-2 hover-gold-shine-sweep active:scale-95 transition-colors duration-300"
              >
                Contact Us
              </motion.button>
            </div>
          </LuxuryReveal>
        </div>
      </section>

      {/* 2. ABOUT DVARIX REALTY */}
      <section className="py-24 bg-white relative overflow-hidden" id="who-we-are">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center text-left">
            
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 space-y-6 group/narrative p-2 sm:p-4 rounded-2xl hover:bg-slate-50/50 hover:shadow-[0_20px_50px_rgba(15,23,42,0.02)] transition-all duration-500 border border-transparent hover:border-slate-100">
              <LuxuryReveal variant="fade-in" delay={0.1} replay={replay}>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#10B981] block tracking-widest transition-all duration-300 group-hover/narrative:translate-x-1">ABOUT THE FIRM</span>
              </LuxuryReveal>
              
              <h2 className="text-3xl sm:text-4xl font-serif text-[#0F172A] tracking-tight font-medium relative inline-block group/h2">
                <SplitTextReveal text="Who We Are" delay={0.25} replay={replay} />
                <span className="absolute left-0 bottom-0 w-0 group-hover/narrative:w-20 h-[2px] bg-[#10B981] transition-all duration-500 ease-out" />
              </h2>
              
              <div className="space-y-4 text-[#475569] font-light leading-relaxed text-sm sm:text-base">
                <LuxuryReveal variant="fade-up" delay={0.4} replay={replay}>
                  <p className="transition-all duration-300 hover:text-slate-900">
                    Dvarix Realty was founded with a vision to <span className="font-semibold text-slate-800 hover:text-[#D4AF37] transition-colors duration-200 cursor-default">simplify the property journey</span> for individuals, families, and businesses. We believe that buying, selling, renting, or investing in real estate should not be overwhelming. With the right guidance and support, every client can make informed and confident decisions.
                  </p>
                </LuxuryReveal>
                
                <LuxuryReveal variant="scale" delay={0.6} replay={replay}>
                  <div className="border-l-4 border-[#D4AF37] pl-5 py-3 my-6 bg-slate-50/85 rounded-r-xl group/commitment hover:bg-white hover:shadow-md transition-all duration-300 border-l-[#D4AF37] hover:border-l-[#10B981] cursor-default">
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1 transition-all duration-300 group-hover/commitment:text-[#10B981]">Our Core Commitment</span>
                    <p className="font-serif text-lg sm:text-xl text-[#0F172A] font-medium italic transition-all duration-300 group-hover/commitment:translate-x-1">
                      "Your requirement comes first."
                    </p>
                  </div>
                </LuxuryReveal>

                <LuxuryReveal variant="fade-up" delay={0.8} replay={replay}>
                  <p className="transition-all duration-300 hover:text-slate-900">
                    By understanding what matters most to you, we strive to provide <span className="font-semibold text-slate-800 hover:text-[#10B981] transition-colors duration-200 cursor-default">personalized property solutions</span> that suit your lifestyle, budget, and future aspirations.
                  </p>
                </LuxuryReveal>
              </div>
            </div>

            {/* Right Illustration/Imagery Column */}
            <div className="lg:col-span-5 relative group/img-wrapper">
              <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-[#D4AF37] pointer-events-none transition-all duration-300 group-hover/img-wrapper:-translate-x-2 group-hover/img-wrapper:-translate-y-2 group-hover/img-wrapper:border-l-[#10B981]" />
              <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-[#10B981] pointer-events-none transition-all duration-300 group-hover/img-wrapper:translate-x-2 group-hover/img-wrapper:translate-y-2 group-hover/img-wrapper:border-r-[#D4AF37]" />
              
              <LuxuryReveal variant="cinematic" delay={0.3} replay={replay}>
                <div className="bg-[#0F172A] rounded-2xl overflow-hidden shadow-2xl border border-transparent group-hover/img-wrapper:border-[#D4AF37]/30 transition-all duration-500 hover:shadow-[0_25px_60px_rgba(212,175,55,0.18)] hover:-translate-y-2 hover:rotate-1">
                  <img 
                    referrerPolicy="no-referrer"
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop" 
                    alt="High-end architectural space" 
                    className="w-full h-[350px] object-cover scale-[1.01] group-hover/img-wrapper:scale-105 transition-all duration-[600ms] ease-out brightness-100 group-hover/img-wrapper:brightness-105"
                  />
                </div>
              </LuxuryReveal>

              {/* Float Badge overlay */}
              <div className="absolute -right-6 bottom-8 z-10">
                <LuxuryReveal variant="scale" delay={0.7} replay={replay}>
                  <InteractiveCard hoverType="emerald" className="bg-white border border-slate-100 p-4 rounded-xl shadow-xl flex flex-row items-center gap-3 max-w-[200px] group/badge">
                    <div className="h-10 w-10 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center shrink-0 transition-transform duration-300 group-hover/badge:scale-110 group-hover/badge:rotate-12">
                      <HeartHandshake className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 leading-tight transition-colors duration-300 group-hover/badge:text-[#10B981]">100% Client-Centric Focused</p>
                    </div>
                  </InteractiveCard>
                </LuxuryReveal>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. WHAT WE DO (COMPREHENSIVE SOLUTIONS) */}
      <section className="py-24 bg-slate-50 border-y border-slate-100" id="comprehensive-solutions">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="max-w-3xl mx-auto mb-16 space-y-4">
            <LuxuryReveal variant="fade-in" delay={0.1} replay={replay}>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#D4AF37] block">DVARIX REALTY</span>
            </LuxuryReveal>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#0F172A] tracking-tight font-medium">
              <SplitTextReveal text="Comprehensive Real Estate Solutions" delay={0.2} replay={replay} />
            </h2>
            <LuxuryReveal variant="blur" delay={0.4} replay={replay}>
              <p className="text-[#475569] text-xs sm:text-sm font-light max-w-xl mx-auto">
                Our capability ecosystem addresses diverse property needs, structured meticulously to deliver premium solutions.
              </p>
            </LuxuryReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            
            {/* Card 1: Residential Properties */}
            <LuxuryReveal variant="slide-up" delay={0.1} replay={replay}>
              <InteractiveCard hoverType="gold" className="bg-white p-8 border-slate-100 flex flex-col justify-between group/card h-full">
                <div className="space-y-6">
                  <div className="h-12 w-12 rounded-xl bg-[#0F172A] text-[#D4AF37] flex items-center justify-center transition-all duration-300 group-hover/card:scale-110 group-hover/card:rotate-6 group-hover/card:bg-[#D4AF37] group-hover/card:text-[#0F172A]">
                    <Home className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-[#0F172A] font-medium mb-3 transition-colors duration-300 group-hover/card:text-[#D4AF37]">Residential Properties</h3>
                    <ul className="space-y-2.5 text-xs text-slate-500 font-light transition-colors duration-300 group-hover/card:text-slate-750">
                      <li className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0 mt-0.5" />
                        <span>Residential plots</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0 mt-0.5" />
                        <span>Independent houses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0 mt-0.5" />
                        <span>Villas and duplex homes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0 mt-0.5" />
                        <span>Apartments and gated communities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0 mt-0.5" />
                        <span>Luxury residential properties</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="pt-6 mt-6 border-t border-slate-50">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-[#10B981] uppercase flex items-center gap-1 transition-all duration-300 group-hover/card:text-[#D4AF37]">
                    Active Listings <CornerDownRight className="h-3 w-3 transition-transform duration-300 group-hover/card:translate-x-1.5" />
                  </span>
                </div>
              </InteractiveCard>
            </LuxuryReveal>

            {/* Card 2: Commercial Properties */}
            <LuxuryReveal variant="slide-up" delay={0.2} replay={replay}>
              <InteractiveCard hoverType="emerald" className="bg-white p-8 border-slate-100 flex flex-col justify-between group/card h-full">
                <div className="space-y-6">
                  <div className="h-12 w-12 rounded-xl bg-[#0F172A] text-[#10B981] flex items-center justify-center transition-all duration-300 group-hover/card:scale-110 group-hover/card:rotate-6 group-hover/card:bg-[#10B981] group-hover/card:text-white">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-[#0F172A] font-medium mb-3 transition-colors duration-300 group-hover/card:text-[#10B981]">Commercial Properties</h3>
                    <ul className="space-y-2.5 text-xs text-slate-500 font-light transition-colors duration-300 group-hover/card:text-slate-750">
                      <li className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0 mt-0.5" />
                        <span>Office spaces</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0 mt-0.5" />
                        <span>Retail shops</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0 mt-0.5" />
                        <span>Commercial buildings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0 mt-0.5" />
                        <span>Warehouses and industrial properties</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0 mt-0.5" />
                        <span>Investment-oriented assets</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="pt-6 mt-6 border-t border-slate-50">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-[#10B981] uppercase flex items-center gap-1 transition-all duration-300 group-hover/card:text-[#10B981]">
                    Corporate Grade A <CornerDownRight className="h-3 w-3 transition-transform duration-300 group-hover/card:translate-x-1.5" />
                  </span>
                </div>
              </InteractiveCard>
            </LuxuryReveal>

            {/* Card 3: Property Rentals */}
            <LuxuryReveal variant="slide-up" delay={0.3} replay={replay}>
              <InteractiveCard hoverType="gold" className="bg-white p-8 border-slate-100 flex flex-col justify-between group/card h-full">
                <div className="space-y-6">
                  <div className="h-12 w-12 rounded-xl bg-[#0F172A] text-[#D4AF37] flex items-center justify-center transition-all duration-300 group-hover/card:scale-110 group-hover/card:rotate-6 group-hover/card:bg-[#D4AF37] group-hover/card:text-[#0F172A]">
                    <Key className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-[#0F172A] font-medium mb-3 transition-colors duration-300 group-hover/card:text-[#D4AF37]">Property Rentals</h3>
                    <p className="text-xs text-[#5c6e83] leading-relaxed font-light font-sans transition-colors duration-300 group-hover/card:text-slate-750">
                      Whether you are searching for a rental home or a business space, we help simplify the rental process by connecting clients with suitable options matching their spatial, geographical, and budget mandates.
                    </p>
                  </div>
                </div>
                <div className="pt-6 mt-6 border-t border-slate-50">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-[#10B981] uppercase flex items-center gap-1 transition-all duration-300 group-hover/card:text-[#D4AF37]">
                    Simplified Terms <CornerDownRight className="h-3 w-3 transition-transform duration-300 group-hover/card:translate-x-1.5" />
                  </span>
                </div>
              </InteractiveCard>
            </LuxuryReveal>

            {/* Card 4: Investment Opportunities */}
            <LuxuryReveal variant="slide-up" delay={0.4} replay={replay}>
              <InteractiveCard hoverType="emerald" className="bg-white p-8 border-slate-100 flex flex-col justify-between group/card h-full">
                <div className="space-y-6">
                  <div className="h-12 w-12 rounded-xl bg-[#0F172A] text-[#10B981] flex items-center justify-center transition-all duration-300 group-hover/card:scale-110 group-hover/card:rotate-6 group-hover/card:bg-[#10B981] group-hover/card:text-white">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-[#0F172A] font-medium mb-3 transition-colors duration-300 group-hover/card:text-[#10B981]">Investment Plans</h3>
                    <p className="text-xs text-[#5c6e83] leading-relaxed font-light font-sans transition-colors duration-300 group-hover/card:text-slate-750">
                      We support investors by helping them explore opportunities that align with their financial objectives and investment strategies, providing extensive research matrices, historical CAGR data, and growth trajectory projections.
                    </p>
                  </div>
                </div>
                <div className="pt-6 mt-6 border-t border-slate-50">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-[#10B981] uppercase flex items-center gap-1 transition-all duration-300 group-hover/card:text-[#10B981]">
                    High-yield Focus <CornerDownRight className="h-3 w-3 transition-transform duration-300 group-hover/card:translate-x-1.5" />
                  </span>
                </div>
              </InteractiveCard>
            </LuxuryReveal>

          </div>
        </div>
      </section>

      {/* 4. OUR PHILOSOPHY */}
      <section className="py-24 bg-[#0F172A] relative overflow-hidden" id="about-philosophy">
        {/* Subtle texture grids and circles */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none animate-float-gentle" />

        <LuxuryReveal variant="cinematic" delay={0.1} replay={replay}>
          <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12 py-12 sm:py-16 text-center text-white border border-transparent hover:border-[#D4AF37]/30 rounded-3xl transition-all duration-500 hover:scale-[1.02] hover:bg-[#0F172A]/85 hover:shadow-[0_25px_60px_rgba(212,175,55,0.08)] group/philosophy select-none cursor-default">
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-6 transition-all duration-300 group-hover/philosophy:translate-y-[-2px]">
              <Quote className="h-4.5 w-4.5 text-[#D4AF37] opacity-80 mr-1.5 transition-transform duration-500 group-hover/philosophy:rotate-[15deg] group-hover/philosophy:scale-110" />
              Our Philosophy
            </div>

            <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white tracking-tight italic font-medium leading-relaxed max-w-3xl mx-auto mb-8 transition-colors duration-300 group-hover/philosophy:text-[#D4AF37]">
              "You Need a Property.<br className="sm:hidden" /> We Find the Right One."
            </h3>

            <div className="space-y-6 text-slate-300 font-light leading-relaxed text-sm sm:text-base max-w-3xl mx-auto transition-all duration-300 group-hover/philosophy:text-white">
              <p>
                This philosophy reflects our commitment to delivering solutions based on individual requirements rather than promoting a one-size-fits-all approach.
              </p>
              <p>
                Every client's journey is different, and every decision deserves thoughtful guidance. By listening first and advising second, we ensure that our recommendations genuinely serve your best interests.
              </p>
            </div>
          </div>
        </LuxuryReveal>
      </section>

      {/* 5. WHY CHOOSE DVARIX REALTY */}
      <section className="py-24 bg-white" id="why-choose-us">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <LuxuryReveal variant="fade-in" delay={0.1} replay={replay}>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#10B981] block">ECOSYSTEM ADVANTAGES</span>
            </LuxuryReveal>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#0F172A] tracking-tight font-medium">
              <SplitTextReveal text="Why Choose Dvarix Realty" delay={0.25} replay={replay} />
            </h2>
            <LuxuryReveal variant="blur" delay={0.4} replay={replay}>
              <p className="text-[#475569] text-xs sm:text-sm font-light max-w-xl mx-auto">
                We offer several clear principles of trust, engineering reliability directly into our client support methodology.
              </p>
            </LuxuryReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <LuxuryReveal variant="slide-up" delay={0.1} replay={replay}>
              <InteractiveCard hoverType="gold" className="p-8 bg-slate-50 border border-slate-100 flex flex-col justify-between text-left group hover:bg-[#0F172A] duration-500 hover:text-white transition-all ease-out cursor-pointer h-full">
                <div className="space-y-6">
                  <div className="h-10 w-10 bg-[#FF5A3C]/10 text-[#FF5A3C] rounded-lg flex items-center justify-center shrink-0 duration-300 group-hover:bg-white/10 group-hover:text-[#FF5A3C] group-hover:scale-110 group-hover:rotate-6">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-medium mb-3 group-hover:text-white text-slate-900 transition-colors duration-300 group-hover:text-[#D4AF37]">Requirement-Driven Approach</h4>
                    <p className="text-xs text-[#5c6e83] font-light leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                      We prioritize understanding your needs before recommending any property solutions. No pushy sales, no predefined biases.
                    </p>
                  </div>
                </div>
              </InteractiveCard>
            </LuxuryReveal>

            {/* Feature 2 */}
            <LuxuryReveal variant="slide-up" delay={0.2} replay={replay}>
              <InteractiveCard hoverType="emerald" className="p-8 bg-slate-50 border border-slate-100 flex flex-col justify-between text-left group hover:bg-[#0F172A] duration-500 hover:text-white transition-all ease-out cursor-pointer h-full">
                <div className="space-y-6">
                  <div className="h-10 w-10 bg-[#10B981]/10 text-[#10B981] rounded-lg flex items-center justify-center shrink-0 duration-300 group-hover:bg-white/10 group-hover:text-[#10B981] group-hover:scale-110 group-hover:rotate-6">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-medium mb-3 group-hover:text-white text-slate-900 transition-colors duration-300 group-hover:text-[#10B981]">Trust & Transparency</h4>
                    <p className="text-xs text-[#5c6e83] font-light leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                      Honest communication and ethical practices form the foundation of every interaction. No hidden clauses or unexpected fees.
                    </p>
                  </div>
                </div>
              </InteractiveCard>
            </LuxuryReveal>

            {/* Feature 3 */}
            <LuxuryReveal variant="slide-up" delay={0.3} replay={replay}>
              <InteractiveCard hoverType="gold" className="p-8 bg-slate-50 border border-slate-100 flex flex-col justify-between text-left group hover:bg-[#0F172A] duration-500 hover:text-white transition-all ease-out cursor-pointer h-full">
                <div className="space-y-6">
                  <div className="h-10 w-10 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg flex items-center justify-center shrink-0 duration-300 group-hover:bg-white/10 group-hover:text-[#D4AF37] group-hover:scale-110 group-hover:rotate-6">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-medium mb-3 group-hover:text-white text-slate-900 transition-colors duration-300 group-hover:text-[#D4AF37]">Personalized Guidance</h4>
                    <p className="text-xs text-[#5c6e83] font-light leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                      We recognize that each client has different goals, budgets, and expectations, framing a highly custom path for you.
                    </p>
                  </div>
                </div>
              </InteractiveCard>
            </LuxuryReveal>

            {/* Feature 4 */}
            <LuxuryReveal variant="slide-up" delay={0.4} replay={replay}>
              <InteractiveCard hoverType="slate" className="p-8 bg-slate-50 border border-slate-100 flex flex-col justify-between text-left group hover:bg-[#0F172A] duration-500 hover:text-white transition-all ease-out cursor-pointer h-full">
                <div className="space-y-6">
                  <div className="h-10 w-10 bg-[#0F172A]/10 text-[#0F172A] rounded-lg flex items-center justify-center shrink-0 duration-300 group-hover:bg-white/10 group-hover:text-white group-hover:scale-110 group-hover:rotate-6">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-medium mb-3 group-hover:text-white text-slate-900 transition-colors duration-300 group-hover:text-[#D4AF37]">End-to-End Assistance</h4>
                    <p className="text-xs text-[#5c6e83] font-light leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                      We aim to make the entire property experience smoother and more convenient, navigating legal, structural and physical setups.
                    </p>
                  </div>
                </div>
              </InteractiveCard>
            </LuxuryReveal>

            {/* Feature 5 */}
            <LuxuryReveal variant="slide-up" delay={0.5} replay={replay}>
              <InteractiveCard hoverType="emerald" className="p-8 bg-slate-50 border border-slate-100 flex flex-col justify-between text-left group hover:bg-[#0F172A] duration-500 hover:text-white transition-all ease-out cursor-pointer h-full">
                <div className="space-y-6">
                  <div className="h-10 w-10 bg-[#10B981]/10 text-[#10B981] rounded-lg flex items-center justify-center shrink-0 duration-300 group-hover:bg-white/10 group-hover:text-[#10B981] group-hover:scale-110 group-hover:rotate-6">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-medium mb-3 group-hover:text-white text-slate-900 transition-colors duration-300 group-hover:text-[#10B981]">Long-Term Relationships</h4>
                    <p className="text-xs text-[#5c6e83] font-light leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                      Our objective is to build lasting relationships founded on reliability and mutual trust, scaling far beyond singular deals.
                    </p>
                  </div>
                </div>
              </InteractiveCard>
            </LuxuryReveal>

            {/* Feature 6 Placeholder/CTA */}
            <LuxuryReveal variant="slide-up" delay={0.6} replay={replay}>
              <InteractiveCard hoverType="gold" className="p-8 bg-[#0F172A] border border-[#0F172A] flex flex-col justify-between text-left relative overflow-hidden group h-full">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#10B981]/10 rounded-full blur-xl pointer-events-none" />
                <div className="space-y-6 z-10">
                  <p className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-widest transition-transform duration-300 group-hover:translate-x-1">START TODAY</p>
                  <h4 className="font-serif text-xl font-medium text-white leading-snug">Let us discover your next destination.</h4>
                  <p className="text-[11px] text-slate-300 font-light">
                    Submit custom parameters directly to our expert advisory desk.
                  </p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onOpenCustomRequest}
                  className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#10B981] group-hover:text-[#14d393] transition cursor-pointer font-mono uppercase tracking-widest z-10 text-left"
                >
                  Send custom brief <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
                </motion.button>
              </InteractiveCard>
            </LuxuryReveal>

          </div>
        </div>
      </section>

      {/* 6. ADDITIONAL SUPPORT SERVICES */}
      <section className="py-24 bg-slate-50 border-t border-slate-100" id="support-services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Context Left (5 cols) */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <LuxuryReveal variant="fade-in" delay={0.1} replay={replay}>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#D4AF37] block">EXTRA COVERAGE</span>
              </LuxuryReveal>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#0F172A] tracking-tight font-medium">
                <SplitTextReveal text="Property Support Beyond Transactions" delay={0.2} replay={replay} />
              </h2>
              <LuxuryReveal variant="blur" delay={0.4} replay={replay}>
                <p className="text-[#475569] text-xs sm:text-sm font-light leading-relaxed">
                  In addition to our core real estate offerings, Dvarix Realty can provide access to a range of property-related support services based on client requirements.
                </p>
              </LuxuryReveal>
              
              <LuxuryReveal variant="scale" delay={0.5} replay={replay}>
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 text-orange-850 font-mono text-[10px] sm:text-xs font-bold leading-relaxed flex items-start gap-2.5">
                  <span className="h-4 w-4 bg-[#FF5A3C] text-white flex items-center justify-center rounded-full text-[9px] font-black shrink-0">i</span>
                  <span>Services are offered based on individual client requirements.</span>
                </div>
              </LuxuryReveal>
            </div>

            {/* Checklist Right (7 cols) */}
            <div className="lg:col-span-7">
              <LuxuryReveal variant="slide-up" delay={0.3} replay={replay}>
                <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-100 transition-all duration-500 hover:shadow-xl hover:border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-left">
                    
                    {[
                      "Property guidance and consultation",
                      "Legal verification assistance",
                      "Home loan support",
                      "Construction-related services",
                      "Interior design solutions",
                      "Property management support",
                      "Architectural consultation",
                      "Vastu guidance",
                      "Smart home solutions",
                      "Real estate investment assistance"
                    ].map((service, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: idx * 0.04 }}
                        key={idx} 
                        className="flex items-center gap-3 py-2 px-3 border-b border-slate-50 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 hover:bg-slate-50/80 hover:translate-x-1.5 border-l-2 border-l-transparent hover:border-l-[#10B981] duration-350 transition-all rounded-r-lg cursor-default group/list-item"
                      >
                        <div className="h-5 w-5 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center shrink-0 transition-all duration-300 group-hover/list-item:scale-110 group-hover/list-item:rotate-12 group-hover/list-item:bg-[#10B981] group-hover/list-item:text-white">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </div>
                        <span className="text-xs sm:text-sm text-slate-700 font-sans tracking-wide leading-tight transition-colors duration-300 group-hover/list-item:text-slate-900 group-hover/list-item:font-medium">
                          {service}
                        </span>
                      </motion.div>
                    ))}

                  </div>
                </div>
              </LuxuryReveal>
            </div>

          </div>
        </div>
      </section>

      {/* 7. MISSION & VISION */}
      <section className="py-24 bg-white" id="mission-vision">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* Card: Mission */}
            <LuxuryReveal variant="slide-up" delay={0.1} replay={replay}>
              <InteractiveCard hoverType="gold" className="bg-[#0F172A] text-white p-10 sm:p-12 rounded-3xl relative overflow-hidden group/card text-left flex flex-col justify-between h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-6">
                  <div className="h-12 w-12 bg-white/10 text-[#D4AF37] rounded-xl flex items-center justify-center transition-all duration-300 group-hover/card:scale-110 group-hover/card:rotate-6 group-hover/card:bg-[#D4AF37] group-hover/card:text-[#0F172A]">
                    <Target className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-serif font-medium tracking-tight transition-colors duration-300 group-hover/card:text-[#D4AF37]">Our Mission</h3>
                  <p className="text-slate-300 font-light leading-relaxed text-xs sm:text-sm transition-colors duration-300 group-hover/card:text-white">
                    To empower individuals and businesses with the right real estate solutions by understanding their unique requirements and delivering transparent, value-driven guidance throughout their property journey.
                  </p>
                </div>
              </InteractiveCard>
            </LuxuryReveal>

            {/* Card: Vision */}
            <LuxuryReveal variant="slide-up" delay={0.2} replay={replay}>
              <InteractiveCard hoverType="emerald" className="bg-[#10B981] text-white p-10 sm:p-12 rounded-3xl relative overflow-hidden group/card text-left flex flex-col justify-between h-full">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-6">
                  <div className="h-12 w-12 bg-white/10 text-white rounded-xl flex items-center justify-center transition-all duration-300 group-hover/card:scale-110 group-hover/card:rotate-[15deg] group-hover/card:bg-white group-hover/card:text-[#10B981]">
                    <Eye className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-serif font-medium tracking-tight text-white transition-colors duration-300 group-hover/card:text-slate-100">Our Vision</h3>
                  <p className="text-emerald-50 font-light leading-relaxed text-xs sm:text-sm transition-colors duration-300 group-hover/card:text-white">
                    To become a trusted real estate ecosystem recognized for its customer-centric approach, integrity, innovation, and commitment to helping people make confident property decisions.
                  </p>
                </div>
              </InteractiveCard>
            </LuxuryReveal>

          </div>
        </div>
      </section>

      {/* 8. CORE VALUES */}
      <section className="py-24 bg-slate-50 border-t border-slate-100" id="core-values">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="max-w-3xl mx-auto mb-16 space-y-4">
            <LuxuryReveal variant="fade-in" delay={0.1} replay={replay}>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#10B981] block">OUR FOUNDATION</span>
            </LuxuryReveal>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#0F172A] tracking-tight font-medium">
              <SplitTextReveal text="The Values That Define Us" delay={0.2} replay={replay} />
            </h2>
            <LuxuryReveal variant="blur" delay={0.4} replay={replay}>
              <p className="text-[#475569] text-xs sm:text-sm font-light max-w-xl mx-auto">
                Our cultural DNA dictates every client meeting, documentation process, and strategic alliance.
              </p>
            </LuxuryReveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            
            {/* Value 1 */}
            <LuxuryReveal variant="slide-up" delay={0.1} replay={replay}>
              <InteractiveCard hoverType="emerald" className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm cursor-pointer group/value h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-9 w-9 bg-[#10B981]/15 text-[#10B981] rounded-lg flex items-center justify-center uppercase font-mono font-bold text-xs transition-all duration-300 group-hover/value:scale-110 group-hover/value:rotate-12 group-hover/value:bg-[#10B981] group-hover/value:text-white">01</div>
                  <h4 className="font-serif text-lg font-medium text-slate-900 transition-colors duration-300 group-hover/value:text-[#10B981]">Customer First</h4>
                </div>
                <p className="text-xs text-slate-500 font-light leading-relaxed transition-colors duration-300 group-hover/value:text-slate-750">
                  Your goals guide our action plans. Every recommendation is tailored directly to your distinct specifications.
                </p>
              </InteractiveCard>
            </LuxuryReveal>

            {/* Value 2 */}
            <LuxuryReveal variant="slide-up" delay={0.2} replay={replay}>
              <InteractiveCard hoverType="gold" className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm cursor-pointer group/value h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-9 w-9 bg-[#D4AF37]/15 text-[#D4AF37] rounded-lg flex items-center justify-center uppercase font-mono font-bold text-xs transition-all duration-300 group-hover/value:scale-110 group-hover/value:rotate-12 group-hover/value:bg-[#D4AF37] group-hover/value:text-[#0F172A]">02</div>
                  <h4 className="font-serif text-lg font-medium text-slate-900 transition-colors duration-300 group-hover/value:text-[#D4AF37]">Integrity</h4>
                </div>
                <p className="text-xs text-slate-500 font-light leading-relaxed transition-colors duration-300 group-hover/value:text-slate-750">
                  We operate with pristine compliance and upfront, zero-surprise communication at every single checkpoint of the lifecycle.
                </p>
              </InteractiveCard>
            </LuxuryReveal>

            {/* Value 3 */}
            <LuxuryReveal variant="slide-up" delay={0.3} replay={replay}>
              <InteractiveCard hoverType="gold" className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm cursor-pointer group/value h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-9 w-9 bg-[#FF5A3C]/15 text-[#FF5A3C] rounded-lg flex items-center justify-center uppercase font-mono font-bold text-xs transition-all duration-300 group-hover/value:scale-110 group-hover/value:rotate-12 group-hover/value:bg-[#FF5A3C] group-hover/value:text-white">03</div>
                  <h4 className="font-serif text-lg font-medium text-slate-900 transition-colors duration-300 group-hover/value:text-[#FF5A3C]">Excellence</h4>
                </div>
                <p className="text-xs text-slate-500 font-light leading-relaxed transition-colors duration-300 group-hover/value:text-slate-750">
                  Our selection, vetting, and reporting models represent elite tier operations designed to satisfy strict investor thresholds.
                </p>
              </InteractiveCard>
            </LuxuryReveal>

            {/* Value 4 */}
            <LuxuryReveal variant="slide-up" delay={0.4} replay={replay}>
              <InteractiveCard hoverType="slate" className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm cursor-pointer group/value h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-9 w-9 bg-[#0F172A]/10 text-[#0F172A] rounded-lg flex items-center justify-center uppercase font-mono font-bold text-xs transition-all duration-300 group-hover/value:scale-110 group-hover/value:rotate-12 group-hover/value:bg-[#0F172A] group-hover/value:text-white">04</div>
                  <h4 className="font-serif text-lg font-medium text-slate-900 transition-colors duration-300 group-hover/value:text-[#D4AF37]">Transparency</h4>
                </div>
                <p className="text-xs text-slate-500 font-light leading-relaxed transition-colors duration-300 group-hover/value:text-slate-750">
                  Full-view ledgers, deep digital logs, and comprehensive visual materials ensure absolute operational parameters clarity.
                </p>
              </InteractiveCard>
            </LuxuryReveal>

            {/* Value 5 */}
            <LuxuryReveal variant="slide-up" delay={0.5} replay={replay}>
              <InteractiveCard hoverType="emerald" className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm cursor-pointer group/value h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-9 w-9 bg-[#10B981]/15 text-[#10B981] rounded-lg flex items-center justify-center uppercase font-mono font-bold text-xs transition-all duration-300 group-hover/value:scale-110 group-hover/value:rotate-12 group-hover/value:bg-[#10B981] group-hover/value:text-white">05</div>
                  <h4 className="font-serif text-lg font-medium text-slate-900 transition-colors duration-300 group-hover/value:text-[#10B981]">Commitment</h4>
                </div>
                <p className="text-xs text-slate-500 font-light leading-relaxed transition-colors duration-300 group-hover/value:text-slate-750">
                  We are persistent. We maintain continuous search efforts and partner support until your ultimate targets are verified.
                </p>
              </InteractiveCard>
            </LuxuryReveal>

            {/* Value 6 */}
            <LuxuryReveal variant="slide-up" delay={0.6} replay={replay}>
              <InteractiveCard hoverType="gold" className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm cursor-pointer group/value h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-9 w-9 bg-[#D4AF37]/15 text-[#D4AF37] rounded-lg flex items-center justify-center uppercase font-mono font-bold text-xs transition-all duration-300 group-hover/value:scale-110 group-hover/value:rotate-12 group-hover/value:bg-[#D4AF37] group-hover/value:text-[#0F172A]">06</div>
                  <h4 className="font-serif text-lg font-medium text-slate-900 transition-colors duration-300 group-hover/value:text-[#D4AF37]">Trust</h4>
                </div>
                <p className="text-xs text-slate-500 font-light leading-relaxed transition-colors duration-300 group-hover/value:text-slate-750">
                  The bedrock of Dvarix. Honored by families, partners, and corporate entities nationwide through robust reliability.
                </p>
              </InteractiveCard>
            </LuxuryReveal>

          </div>
        </div>
      </section>

      {/* 9. FINAL CALL-TO-ACTION SECTION */}
      <section className="relative py-24 bg-[#070d19] overflow-hidden group/cta-section" id="about-final-cta">
        
        {/* Parallax structure background overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            referrerPolicy="no-referrer"
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop" 
            alt="Estate skyline" 
            className="w-full h-full object-cover opacity-15 mix-blend-luminosity scale-102 transition-transform duration-[2000ms] ease-out group-hover/cta-section:scale-110"
          />
          <div className="absolute inset-0 bg-[#070d19]/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070d19] via-transparent to-[#070d19]" />
        </div>

        {/* Ambient background glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#10B981]/10 rounded-full blur-[100px] pointer-events-none transition-all duration-1000 group-hover/cta-section:bg-[#D4AF37]/10" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="space-y-8">
            <LuxuryReveal variant="fade-in" delay={0.1} replay={replay}>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#D4AF37] block transition-all duration-300 group-hover/cta-section:translate-y-[-2px]">CREATE YOUR JOURNEY</span>
            </LuxuryReveal>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white tracking-tight leading-tight max-w-3xl mx-auto font-medium">
              <SplitTextReveal text="Let's Build Your Property Journey Together" delay={0.2} replay={replay} />
            </h2>

            <LuxuryReveal variant="blur" delay={0.4} replay={replay}>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-light">
                Whether you are buying your first home, upgrading to a larger space, searching for rental opportunities, expanding your business through commercial real estate, or exploring investment possibilities, Dvarix Realty is here to guide you every step of the way.
              </p>
            </LuxuryReveal>

            <LuxuryReveal variant="scale" delay={0.5} replay={replay}>
              <div className="border-t border-b border-slate-800 py-6 max-w-xl mx-auto transition-all duration-500 group-hover/cta-section:border-slate-700">
                <p className="font-serif text-lg sm:text-xl text-[#10B981] font-semibold italic transition-colors duration-500 group-hover/cta-section:text-[#D4AF37]">
                  We don't just help you find properties.<br />
                  We help you find the right property solution.
                </p>
              </div>
            </LuxuryReveal>

            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
              <LuxuryReveal variant="slide-up" delay={0.6} replay={replay} className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onOpenCustomRequest}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#10B981] hover:bg-[#0da471] text-white rounded-xl text-sm font-semibold tracking-wide cursor-pointer shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 font-sans relative overflow-hidden group/btn hover-shine-sweep transition-all duration-300"
                >
                  Get Started Today
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1.5" />
                </motion.button>
              </LuxuryReveal>
              <LuxuryReveal variant="slide-up" delay={0.7} replay={replay} className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setActiveTab('Contact');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 bg-slate-800/60 hover:bg-slate-700/60 text-white rounded-xl text-sm font-semibold tracking-wide cursor-pointer border border-slate-700 hover:border-slate-500 backdrop-blur-sm flex items-center justify-center font-sans transition-all duration-300 hover:shadow-lg"
                >
                  Contact Dvarix Realty
                </motion.button>
              </LuxuryReveal>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
