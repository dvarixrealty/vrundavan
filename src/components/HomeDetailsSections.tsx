import React, { useState, useEffect } from 'react';
import { 
  Building2, MapPin, Scale, Landmark, Compass, Briefcase, Warehouse, Key, TrendingUp, Hammer,
  Star, ChevronRight, CheckCircle2, MessageSquare, ArrowRight, ShieldCheck, Mail, Sparkles, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { FAQ, SiteCMSConfig } from '../types';

interface HomeDetailsSectionsProps {
  onOpenCustomRequest: () => void;
  setActiveTab: (tab: any) => void;
  faqs?: FAQ[];
  siteSettings?: SiteCMSConfig;
}

export default function HomeDetailsSections({ onOpenCustomRequest, setActiveTab, faqs = [], siteSettings }: HomeDetailsSectionsProps) {
  const [activeStep, setActiveStep] = useState(1);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  // Website FAQ accordion section states
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<string>('All');
  const [faqSearchQuery, setFaqSearchQuery] = useState<string>('');

  // Auto scroll testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const staticFeatures = [
    {
      title: 'Requirement-Based Property Search',
      description: 'We do not flood you with random listings. We hunt down only the properties that match your specific checklists.'
    },
    {
      title: 'Personalized Recommendations',
      description: 'Your goals are unique. Acquire customized property portfolios aligned to your business or home aspirations.'
    },
    {
      title: 'Residential & Commercial Expertise',
      description: 'Whether it is modern family duplexes or high-capacity logistics warehouses, our advisors possess elite market expertise.'
    },
    {
      title: 'Investment Guidance',
      description: 'Deep analytical capital research ensures high yield ROI metrics and reliable long-term secure equity hedging.'
    },
    {
      title: 'Market Research & Property Sourcing',
      description: 'We directly cross-reference off-market landowners, builder records, and sovereign parcels to locate prime areas.'
    },
    {
      title: 'End-to-End Assistance',
      description: 'From initial parameters mapping to bank integrations and key handovers, we handle every logistics barrier.'
    }
  ];

  const features = siteSettings?.services || staticFeatures;

  const steps = [
    {
      num: '01',
      title: 'Tell Us Your Requirement',
      desc: 'Share your property type, location, budget, and preferences. Our system instantly structures your parameters.'
    },
    {
      num: '02',
      title: 'Consultation & Research',
      desc: 'Our experts analyze your needs and research suitable opportunities, cross-checking available land registries.'
    },
    {
      num: '03',
      title: 'Property Sourcing',
      desc: 'We source and shortlist premium properties that align precisely with your customized requirements.'
    },
    {
      num: '04',
      title: 'Property Presentation',
      desc: 'Receive curated property options with complete layouts, digital blueprints, and surrounding market data.'
    },
    {
      num: '05',
      title: 'Site Visits & Evaluation',
      desc: 'Visit shortlisted properties in Bangalore guided by physical advisors, ensuring transparent evaluation.'
    },
    {
      num: '06',
      title: 'Transaction Support',
      desc: 'We assist throughout negotiations, structural compliance documentation, and secure escrow closure.'
    }
  ];

  const staticTestimonials = [
    {
      id: 0,
      text: 'Dvarix Realty understood exactly what we needed and helped us find the right property without wasting our time.',
      client: 'Nandini K. S.',
      role: 'Villa Owner in JP Nagar, Bangalore',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 1,
      text: 'The entire process was transparent and professional from consultation to final closure.',
      client: 'Ananya & Raghav Reddy',
      role: 'Hedge Fund Partners',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 2,
      text: 'Instead of browsing hundreds of listings, we simply shared our requirements and received suitable options quickly.',
      client: 'Kiran Devnath',
      role: 'Tech Consultant, JP Nagar Studio',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    }
  ];

  const testimonials = siteSettings?.testimonials || staticTestimonials;

  // Partner Categories for marquee (top and bottom rows)
  const topRowPartners = [
    { label: 'Builders & Developers', icon: <Building2 className="h-5 w-5" />, symbol: '🏢' },
    { label: 'Property Owners', icon: <Key className="h-5 w-5" />, symbol: '🏠' },
    { label: 'Construction Companies', icon: <Hammer className="h-5 w-5" />, symbol: '🏗' },
    { label: 'Legal Consultants', icon: <Scale className="h-5 w-5" />, symbol: '⚖' },
    { label: 'Financial Institutions', icon: <Landmark className="h-5 w-5" />, symbol: '🏦' }
  ];

  const bottomRowPartners = [
    { label: 'Architects & Designers', icon: <Compass className="h-5 w-5" />, symbol: '📐' },
    { label: 'Commercial Experts', icon: <Briefcase className="h-5 w-5" />, symbol: '🏬' },
    { label: 'Warehouse & Industrial', icon: <Warehouse className="h-5 w-5" />, symbol: '🏭' },
    { label: 'PG & Rental Partners', icon: <Key className="h-5 w-5" />, symbol: '🛏' },
    { label: 'Investment Consultants', icon: <TrendingUp className="h-5 w-5" />, symbol: '📈' }
  ];

  // Duplicate arrays to create continuous infinite CSS effect
  const repeatedTopPartners = [...topRowPartners, ...topRowPartners, ...topRowPartners, ...topRowPartners];
  const repeatedBottomPartners = [...bottomRowPartners, ...bottomRowPartners, ...bottomRowPartners, ...bottomRowPartners];

  return (
    <div className="bg-slate-950 text-slate-100 space-y-28 pb-16 overflow-hidden" id="details-section-group">
      
      {/* 1. WHY CHOOSE DVARIX REALTY */}
      <section className="py-24 relative border-t border-slate-900/60 bg-gradient-to-b from-slate-950 to-slate-900/40" id="why-choose-section">
        {/* Decorative backdrop glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#ff5a3c]/3 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Content Column */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-5 space-y-6 text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ff5a3c]/10 rounded-md border border-[#ff5a3c]/20 text-[#ff5a3c] text-xs font-mono font-bold uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4" /> Client-First Ethos
              </div>
              <h2 className="text-3xl sm:text-5.5xl font-sans font-black tracking-tight leading-tight text-white">
                Why Choose <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5a3c] to-amber-500">
                  Dvarix Realty?
                </span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                Unlike traditional real estate platforms that focus on listings, Dvarix Realty focuses on people. We start by understanding your requirements and then actively search for suitable opportunities that match your location, budget, goals, and preferences.
              </p>

              {/* Physical Office Placement Callout */}
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-850 flex items-start gap-3 mt-8">
                <MapPin className="h-5 w-5 text-[#ff5a3c] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-white block mb-0.5 font-bold uppercase tracking-wider">Bangalore Main Hub Office</strong>
                  <span className="text-slate-400">Headquartered in the heart of JP Nagar, Bangalore. Meet our consultants personally to brief your premium commercial or family residential checklists.</span>
                </div>
              </div>
            </motion.div>

            {/* Right Features Column with Glassmorphic Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feat, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="group p-5 bg-slate-900/30 backdrop-blur-md hover:bg-slate-900/60 border border-slate-850/80 hover:border-[#ff5a3c]/35 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1.5 shadow-lg select-none relative"
                >
                  {/* Subtle hover glow border line overlay */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#ff5a3c] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
                  
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 items-center justify-center font-bold text-xs shrink-0">
                      ✓
                    </div>
                    <h3 className="text-white text-xs sm:text-sm font-black font-sans leading-tight">
                      {feat.title}
                    </h3>
                  </div>
                  <p className="text-slate-400 text-[11px] sm:text-xs leading-relaxed font-light">
                    {feat.description}
                  </p>
                </motion.div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="py-12 relative" id="how-it-works-section">
        {/* Background visual graphics */}
        <div className="absolute right-0 top-1/3 w-64 h-64 bg-cyan-500/2 rounded-full blur-[90px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3 mb-16"
          >
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#ff5a3c] font-black bg-[#ff5a3c]/10 px-2.5 py-1 rounded-md">
              verified system pipeline
            </span>
            <h2 className="text-3xl sm:text-4.5xl font-sans font-black tracking-tight text-white">
              Simple Process. Smart Property Solutions.
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto font-light leading-relaxed">
              Our streamlined framework brings the most suitable assets in Bangalore right to your screen with zero broker friction or blind listing hunting.
            </p>
            <div className="w-12 h-1 bg-gradient-to-r from-[#ff5a3c] to-amber-500 mx-auto rounded-full mt-4"></div>
          </motion.div>

          {/* Interactive Steps Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left" id="steps-card-matrix">
            {steps.map((st, idx) => {
              const stepNumber = idx + 1;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  onMouseEnter={() => setActiveStep(stepNumber)}
                  className={`relative p-7 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                    activeStep === stepNumber
                      ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800 shadow-2xl scale-[1.01]'
                      : 'bg-slate-900/10 border-slate-900 hover:border-slate-850 hover:bg-slate-900/20'
                  }`}
                >
                  {/* Decorative glowing gradient circle */}
                  {activeStep === stepNumber && (
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#ff5a3c]/5 rounded-full blur-xl pointer-events-none" />
                  )}

                  <div className="flex items-center justify-between mb-5">
                    <span className={`text-4xl font-extrabold font-mono tracking-tighter ${
                      activeStep === stepNumber ? 'text-[#ff5a3c]' : 'text-slate-800'
                    }`}>
                      {st.num}
                    </span>
                    <span className={`text-[10px] uppercase tracking-widest font-mono font-bold px-2 py-0.5 rounded ${
                      activeStep === stepNumber 
                        ? 'bg-[#ff5a3c]/10 text-[#ff5a3c]' 
                        : 'bg-slate-900 text-slate-500'
                    }`}>
                      Phase {stepNumber}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-white text-sm sm:text-base font-extrabold font-sans">
                      {st.title}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed font-light">
                      {st.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 3. CLIENT TESTIMONIALS */}
      <section className="py-24 bg-slate-900/20 relative border-t border-b border-slate-900/60" id="testimonials-section">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,90,60,0.015)_0%,transparent_60%)]" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="space-y-2 mb-12"
          >
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#ff5a3c] font-black">
              proven real world support
            </span>
            <h2 className="text-3xl sm:text-4xl font-sans font-black text-white tracking-tight">
              What Our Clients Say
            </h2>
            <div className="w-10 h-0.5 bg-[#ff5a3c] mx-auto rounded-full mt-3" />
          </motion.div>

          {/* Testimonial Core Box */}
          <div className="relative min-h-[220px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {testimonials.map((t, idx) => {
                if (idx !== currentTestimonial) return null;
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, scale: 0.96, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6 w-full px-4 sm:px-12"
                  >
                    {/* Star ratings animation */}
                    <div className="flex items-center justify-center gap-1">
                      {[...Array(t.rating)].map((_, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.08 }}
                        >
                          <Star className="h-5 w-5 fill-[#ff5a3c] text-[#ff5a3c]" />
                        </motion.span>
                      ))}
                    </div>

                    <blockquote className="text-white text-base sm:text-xl font-medium tracking-tight italic leading-relaxed">
                      "{t.text}"
                    </blockquote>

                    {/* Client Card Profile */}
                    <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-900 max-w-xs mx-auto">
                      <img 
                        src={t.avatar} 
                        alt={t.client}
                        className="w-10 h-10 rounded-full object-cover border border-slate-850"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-left leading-tight">
                        <strong className="text-white text-xs block font-bold">{t.client}</strong>
                        <span className="text-[10px] text-slate-500 font-mono block">{t.role}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Slider Controls Dots */}
          <div className="flex items-center justify-center gap-2.5 mt-10">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentTestimonial(i)}
                className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                  i === currentTestimonial 
                    ? 'w-7 bg-[#ff5a3c]' 
                    : 'w-2 bg-slate-805 hover:bg-slate-700'
                }`}
                aria-label={`Testimonial screen index ${i}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* 4. OUR TRUSTED NETWORK (PREMIUM SCROLLING BRAND MARQUEE) */}
      <section className="py-24 relative overflow-hidden bg-slate-950 text-center" id="trusted-network-scoller">
        
        {/* Style Tag Injecting CSS Keyframe Marquees */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes marqueeLeft {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
          @keyframes marqueeRight {
            0% { transform: translate3d(-50%, 0, 0); }
            100% { transform: translate3d(0, 0, 0); }
          }
          .animate-marquee-left {
            display: flex;
            width: max-content;
            animation: marqueeLeft 35s linear infinite;
          }
          .animate-marquee-right {
            display: flex;
            width: max-content;
            animation: marqueeRight 35s linear infinite;
          }
          .row-hover-pause:hover .animate-marquee-left {
            animation-play-state: paused;
          }
          .row-hover-pause:hover .animate-marquee-right {
            animation-play-state: paused;
          }
          .fade-edges-mask {
            mask-image: linear-gradient(to right, transparent, white 15%, white 85%, transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, white 15%, white 85%, transparent);
          }
        `}} />

        {/* Subdued geometric shapes behind the marquee */}
        <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden opacity-[0.03]">
          <div className="absolute left-[8%] top-[10%] w-24 h-24 border border-white rounded-full animate-pulse" />
          <div className="absolute right-[12%] bottom-[12%] w-36 h-36 border border-white rotate-12" />
          <div className="absolute left-[40%] top-[45%] w-16 h-16 border border-dashed border-white" />
        </div>

        {/* Soft background gradient glow */}
        <div className="absolute inset-0 bg-radial-at-c from-slate-900/60 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="space-y-4 mb-16 text-center"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 rounded-md border border-amber-500/25 text-amber-500 text-[10px] font-mono uppercase tracking-widest font-black">
              🛠 Collaborative Sourcing Infrastructure
            </span>
            <h2 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-white mt-1">
              Our Trusted Network
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-3xl mx-auto font-normal leading-relaxed">
              Dvarix Realty collaborates with property owners, builders, developers, legal consultants, financial institutions, architects, commercial property experts, and industry professionals to provide complete real estate solutions tailored to every customer requirement.
            </p>
          </motion.div>

        </div>

        {/* DOUBLE MARQUEE CONTAINER (Full Width, Faded Edges) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="w-full relative py-2 space-y-6 z-10 row-hover-pause fade-edges-mask"
        >
          
          {/* Top Marquee Row (Scroll Left) */}
          <div className="overflow-hidden flex">
            <div className="animate-marquee-left flex gap-5 whitespace-nowrap px-4">
              {repeatedTopPartners.map((item, index) => (
                <div 
                  key={`top-${index}`}
                  className="flex items-center gap-3 bg-slate-900/40 backdrop-blur-md hover:bg-slate-900/95 border border-slate-850 hover:border-[#ff5a3c]/30 rounded-2xl py-4.5 px-7 transition-all duration-300 hover:scale-105 group cursor-pointer shadow-md select-none text-left shrink-0"
                >
                  <span className="text-xl filter grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-200">
                    {item.symbol}
                  </span>
                  <div>
                    <span className="block text-white text-[10px] font-mono tracking-wider font-extrabold uppercase group-hover:text-[#ff5a3c] transition-colors">
                      {item.label}
                    </span>
                    <span className="block text-[8px] text-slate-500 font-mono tracking-widest uppercase">
                      DVARIX VERIFIED
                    </span>
                  </div>
                  {/* Small inner ambient glow */}
                  <div className="w-2 h-2 rounded-full bg-[#ff5a3c]/10 group-hover:bg-[#ff5a3c]/70 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Marquee Row (Scroll Right) */}
          <div className="overflow-hidden flex">
            <div className="animate-marquee-right flex gap-5 whitespace-nowrap px-4">
              {repeatedBottomPartners.map((item, index) => (
                <div 
                  key={`bottom-${index}`}
                  className="flex items-center gap-3 bg-slate-900/40 backdrop-blur-md hover:bg-slate-900/95 border border-slate-850 hover:border-cyan-500/30 rounded-2xl py-4.5 px-7 transition-all duration-300 hover:scale-105 group cursor-pointer shadow-md select-none text-left shrink-0"
                >
                  <span className="text-xl filter grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-200">
                    {item.symbol}
                  </span>
                  <div>
                    <span className="block text-white text-[10px] font-mono tracking-wider font-extrabold uppercase group-hover:text-cyan-400 transition-colors">
                      {item.label}
                    </span>
                    <span className="block text-[8px] text-slate-500 font-mono tracking-widest uppercase">
                      ALLIED NETWORK
                    </span>
                  </div>
                  {/* Small inner ambient glow */}
                  <div className="w-2 h-2 rounded-full bg-cyan-400/10 group-hover:bg-cyan-400/70 transition-colors" />
                </div>
              ))}
            </div>
          </div>

        </motion.div>

      </section>

      {/* 4.5 enterprise public FAQ accordion portal */}
      <section className="py-24 relative border-t border-slate-900/60 bg-gradient-to-b from-slate-900/40 to-slate-950" id="website-faq-portal-section">
        {/* Ambient radial lighting overlays */}
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-sky-500/3 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ff5a3c]/3 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          
          {/* FAQ Headers */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3 mb-12"
          >
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#ff5a3c] font-black bg-[#ff5a3c]/10 px-2.5 py-1 rounded-md text-orange-400 border border-[#ff5a3c]/20">
              knowledge base & support
            </span>
            <h2 className="text-3xl sm:text-4.5xl font-sans font-black tracking-tight text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto font-light leading-relaxed">
              Find transparent answers about our requirement-driven platform, scheduling site walkthroughs, and Bangalore real estate investments.
            </p>
            <div className="w-12 h-1 bg-gradient-to-r from-[#ff5a3c] to-amber-500 mx-auto rounded-full mt-3"></div>
          </motion.div>

          {/* Search and Category Filters */}
          <div className="space-y-6 mb-10">
            {/* Direct Input Search widget */}
            <div className="relative max-w-lg mx-auto">
              <input 
                type="text"
                placeholder="Search queries, legal compliance, timelines..."
                value={faqSearchQuery}
                onChange={(e) => setFaqSearchQuery(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800 text-slate-100 text-xs rounded-xl pl-10 pr-4 py-3 placeholder-slate-500 outline-none focus:border-[#ff5a3c]/50 transition duration-150"
              />
              <div className="absolute left-3.5 top-3 text-slate-505 select-none touch-none">
                🔍
              </div>
              {faqSearchQuery && (
                <button 
                  onClick={() => setFaqSearchQuery('')}
                  className="absolute right-3 top-3 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Categories filter tags */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-2xl mx-auto">
              {['All', 'General Questions', 'Property Search', 'Requirements', 'Site Visits', 'Buying Process', 'Investment'].map((cat) => {
                const isActive = faqCategoryFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setFaqCategoryFilter(cat);
                      setExpandedFaqId(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-widest font-black border transition cursor-pointer ${
                      isActive 
                        ? 'bg-[#ff5a3c] border-[#ff5a3c] text-white' 
                        : 'bg-slate-900/40 border-slate-850 text-slate-400 hover:bg-slate-950 hover:text-white'
                    }`}
                  >
                    {cat === 'General Questions' ? 'General' : cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtered active published FAQ accordions list */}
          <div className="space-y-4">
            {(() => {
              const activePublishedFaqs = faqs.filter(faq => {
                if (faq.status === 'Draft') return false; // Hide draft FAQs completely from website
                const matchSearch = faq.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) || 
                                    faq.answer.toLowerCase().includes(faqSearchQuery.toLowerCase());
                const matchCategory = faqCategoryFilter === 'All' || faq.category === faqCategoryFilter;
                return matchSearch && matchCategory;
              });

              if (activePublishedFaqs.length === 0) {
                return (
                  <div className="text-center py-10 bg-slate-900/10 border border-slate-900 rounded-2xl space-y-2">
                    <p className="text-slate-500 font-mono text-xs">No matching articles found in index.</p>
                    <p className="text-[10px] text-slate-600">Please refine searching keywords or request secondary assistance below.</p>
                  </div>
                );
              }

              return activePublishedFaqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;
                
                return (
                  <motion.div
                    key={faq.id}
                    layout="position"
                    className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                      isExpanded 
                        ? 'border-[#ff5a3c]/30 bg-slate-900/75 shadow-xl' 
                        : 'border-slate-850/80 bg-slate-900/15 hover:bg-slate-900/40 hover:border-slate-800'
                    }`}
                  >
                    {/* Header trigger button */}
                    <button
                      onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                      className="w-full p-5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 pr-4">
                        {faq.featured && (
                          <span className="inline-block" title="Featured priority article">
                            ⭐
                          </span>
                        )}
                        <span className="text-xs sm:text-sm font-extrabold text-white leading-snug">
                          {faq.question}
                        </span>
                      </div>
                      <span className={`text-xs ml-2 text-slate-400 shrink-0 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180 text-[#ff5a3c]' : ''
                      }`}>
                        ▼
                      </span>
                    </button>

                    {/* Expandable answer panel */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="border-t border-slate-900 bg-slate-950/20 text-slate-300"
                        >
                          <p className="p-5 text-[#c2cbd8] text-xs leading-relaxed font-light">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </motion.div>
                );
              });
            })()}
          </div>

        </div>
      </section>

      {/* 4b. EXCLUSIVE OFFERS & CAMPAIGNS (DYNAMIC CMS SECTION) */}
      {siteSettings?.offers && siteSettings.offers.filter(o => o.active).length > 0 && (
        <section className="py-24 bg-slate-900/10 relative border-t border-slate-900/60" id="cms-offers-campaigns-section">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,90,60,0.012)_0%,transparent_50%)]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="space-y-2 text-center mb-16"
            >
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#ff5a3c] font-black">
                special opportunities
              </span>
              <h2 className="text-3xl sm:text-4xl font-sans font-black text-white tracking-tight">
                Active Campaigns & Promotions
              </h2>
              <div className="w-10 h-0.5 bg-[#ff5a3c] mx-auto rounded-full mt-3" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {siteSettings.offers.filter(o => o.active).map((offer, idx) => (
                <motion.div
                  key={offer.id || idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-slate-950/60 border border-slate-900/80 rounded-2xl overflow-hidden hover:border-[#ff5a3c]/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-300 flex flex-col group"
                >
                  {offer.image && (
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={offer.image} 
                        alt={offer.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 filter brightness-90"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4 bg-[#ff5a3c] text-white text-[10px] uppercase font-mono font-black px-2.5 py-1 rounded">
                        {offer.badge || "LIMITED"}
                      </div>
                    </div>
                  )}
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      {!offer.image && (
                        <div className="inline-block bg-[#ff5a3c]/10 text-[#ff5a3c] text-[10px] uppercase font-mono font-black px-2.5 py-1 rounded border border-[#ff5a3c]/25">
                          {offer.badge || "LIMITED OFFER"}
                        </div>
                      )}
                      <h3 className="text-lg font-sans font-black text-white tracking-tight">{offer.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-light">{offer.description}</p>
                    </div>
                    {offer.validTill && (
                      <div className="text-[10px] font-mono text-slate-500 border-t border-slate-900/60 pt-3 flex items-center justify-between">
                        <span>VALID TILL:</span>
                        <span className="text-[#ff5a3c] font-semibold">{offer.validTill}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4c. LATEST INSIGHTS & BLOGS (DYNAMIC CMS SECTION) */}
      {siteSettings?.blogs && siteSettings.blogs.filter(b => b.published).length > 0 && (
        <section className="py-24 bg-slate-950 relative border-t border-slate-900/60" id="cms-blog-insights-section">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[radial-gradient(circle_at_center,rgba(255,90,60,0.01)_0%,transparent_70%)] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="space-y-2 text-center mb-16"
            >
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#ff5a3c] font-black">
                expert market briefs
              </span>
              <h2 className="text-3xl sm:text-4xl font-sans font-black text-white tracking-tight">
                Dvarix Real Estate Insights
              </h2>
              <div className="w-10 h-0.5 bg-[#ff5a3c] mx-auto rounded-full mt-3" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {siteSettings.blogs.filter(b => b.published).map((blog, idx) => (
                <motion.div
                  key={blog.id || idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.12 }}
                  className="bg-slate-900/20 border border-slate-900/60 rounded-2xl p-6 hover:border-slate-800 transition-all duration-300 flex flex-col md:flex-row gap-6 group"
                >
                  {blog.image && (
                    <div className="w-full md:w-40 h-40 md:h-full min-h-[140px] rounded-xl overflow-hidden relative flex-shrink-0">
                      <img 
                        src={blog.image} 
                        alt={blog.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 filter brightness-90"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                        <span>{blog.date}</span>
                        <span>•</span>
                        <span>BY {blog.author.toUpperCase()}</span>
                      </div>
                      <h3 className="text-base font-sans font-black text-white tracking-tight group-hover:text-[#ff5a3c] transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-xs text-slate-450 leading-relaxed font-light line-clamp-3">
                        {blog.excerpt}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-900/60 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#ff5a3c] uppercase tracking-wider font-black">
                        knowledge base brief
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. READY TO FIND THE RIGHT PROPERTY? (CTA SECTION) */}
      <section className="py-24 relative overflow-hidden text-center border-t border-slate-900/80 bg-gradient-to-r from-red-950/20 via-slate-950 to-slate-950" id="ready-cta-section">
        {/* Floating gradient shapes */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-[#ff5a3c]/4 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/3 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Decorative thin glow top line */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#ff5a3c]/40 to-transparent" />

        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-8"
        >
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 rounded-md border border-amber-500/25 text-amber-500 text-[10px] font-mono uppercase tracking-widest font-black">
            🚀 Active Fulfillment Network
          </div>

          <h2 className="text-3xl sm:text-5.5xl font-sans font-black text-white tracking-tight leading-tight">
            Ready To Find The Right Property?
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-light">
            Whether you're looking to buy, sell, rent, lease, or invest, Dvarix Realty is here to help you find the right solution.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-stretch justify-center max-w-md mx-auto pt-4">
            
            <button
              onClick={onOpenCustomRequest}
              className="group py-4 px-6 rounded-xl bg-[#ff5a3c] hover:bg-[#e04326] text-white font-sans text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,90,60,0.3)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
            >
              Submit Your Requirement
              <ArrowRight className="h-4 w-4 text-orange-200 group-hover:translate-x-1.5 transition-transform" />
            </button>

            <button
              onClick={() => setActiveTab('Contact')}
              className="py-4 px-6 rounded-xl bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-305 hover:text-white font-sans text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Contact Us Today
            </button>

          </div>

          <div className="text-[10px] font-mono text-slate-500 mt-6 pt-2 select-none">
            📍 PHYSICALLY POSITIONED AT: JP NAGAR, BANGALORE | CORPORATE COUNSEL DEPT
          </div>

        </motion.div>
      </section>

    </div>
  );
}
