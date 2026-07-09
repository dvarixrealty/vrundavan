import React, { useState, useEffect } from 'react';
import { Search, MapPin, Building, ChevronRight, MessageSquare, ShieldCheck, Sparkles, Phone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PropertyTypeCard, MapLocation, QuickFilter, MapSettings, Property, SiteCMSConfig } from '../types';

interface HeroProps {
  onSearch: (filters: { keyword: string; type: string; location: string; filter?: string }) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  onOpenCustomRequest: () => void;
  setActiveTab: (tab: any) => void;
  categories?: PropertyTypeCard[];
  mapLocations?: Record<string, MapLocation>;
  quickFilters?: QuickFilter[];
  mapSettings?: MapSettings;
  properties?: Property[];
  onViewProperty?: (property: Property) => void;
  siteSettings?: SiteCMSConfig;
}

export default function Hero({
  onSearch,
  selectedType,
  setSelectedType,
  onOpenCustomRequest,
  setActiveTab,
  categories = [],
  mapLocations = {},
  quickFilters = [],
  mapSettings,
  properties = [],
  onViewProperty,
  siteSettings
}: HeroProps) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('All');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number }[]>([]);
  const [showExpertCallCard, setShowExpertCallCard] = useState(false);

  // Requirement 3: Automatically load all active property categories created in the admin panel
  const activeCategories = categories.filter(c => c.status === 'Active');
  const tabs = [{ id: 'All', title: 'All' }, ...activeCategories.map(c => ({ id: c.id, title: c.title }))];

  // Requirement 4: Automatically load all active locations of Zone Corridor from the admin panel database
  const activeLocations = Object.values(mapLocations || {}).filter(loc => loc.status === 'Active');

  // Generate randomized floating particles on mount
  useEffect(() => {
    const items = Array.from({ length: 15 }).map((_, idx) => ({
      id: idx,
      x: Math.random() * 105,
      y: Math.random() * 100 + 10,
      size: Math.random() * 3 + 2,
      duration: Math.random() * 12 + 8
    }));
    setParticles(items);
  }, []);

  // Requirement 5: Robust real-time property searching filter logic
  const isPropertyMatch = (p: Property, query: string) => {
    if (!query) return false;
    const q = query.toLowerCase().trim();
    
    // Property Name (title or projectName)
    const matchName = p.title?.toLowerCase().includes(q) || p.projectName?.toLowerCase().includes(q);
    
    // Property ID (id or code)
    const matchId = p.id?.toLowerCase().includes(q) || p.code?.toLowerCase().includes(q);
    
    // Location (location, locationName, address, city)
    const matchLocation = p.location?.toLowerCase().includes(q) || 
                          p.locationName?.toLowerCase().includes(q) ||
                          p.address?.toLowerCase().includes(q) || 
                          p.city?.toLowerCase().includes(q);
                          
    // Category (type id or category title)
    const cat = categories.find(c => c.id === p.type);
    const matchCategory = p.type?.toLowerCase().includes(q) || 
                          (cat && cat.title?.toLowerCase().includes(q));
                          
    // Builder Name
    const matchBuilder = p.builderName?.toLowerCase().includes(q);
    
    // Amenities
    const matchAmenities = p.amenities?.some(amenity => amenity.toLowerCase().includes(q));
    
    // Keywords / description / other text
    const matchDesc = p.description?.toLowerCase().includes(q);
    
    return !!(matchName || matchId || matchLocation || matchCategory || matchBuilder || matchAmenities || matchDesc);
  };

  // Requirement 6: While typing, show live autocomplete suggestions from existing properties
  const filteredSuggestions = keyword.trim() 
    ? properties.filter(p => isPropertyMatch(p, keyword))
    : [];

  const handleSelectSuggestion = (prop: Property) => {
    setKeyword(prop.title);
    setShowSuggestions(false);
    
    // Align select dropdowns dynamically based on selected property context
    if (prop.type) {
      setSelectedType(prop.type);
    }
    
    if (prop.location) {
      const matchingLoc = activeLocations.find(loc => 
        prop.location.toLowerCase().includes(loc.name.toLowerCase()) || 
        loc.name.toLowerCase().includes(prop.location.toLowerCase())
      );
      if (matchingLoc) {
        setLocation(matchingLoc.name);
      }
    }

    onSearch({
      keyword: prop.title,
      type: prop.type || 'All',
      location: prop.location || 'All'
    });

    if (onViewProperty) {
      onViewProperty(prop);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ 
      keyword, 
      type: selectedType, 
      location, 
      filter: undefined
    });
  };

  return (
    <div className="relative min-h-[660px] md:min-h-[740px] lg:min-h-[820px] bg-slate-950 flex flex-col justify-center text-white overflow-hidden" id="hero-section">
      
      {/* Background Cinematic Slow Zoom */}
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ scale: 1.05 }}
          animate={{ scale: 1.18 }}
          transition={{
            duration: 30,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear'
          }}
          className="absolute inset-0 w-full h-full"
        >
          <img 
            src={siteSettings?.heroBgImage || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=82"} 
            alt="Premium Architecture" 
            className="w-full h-full object-cover filter brightness-[0.25] contrast-[1.1]"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Ambient Glassmorphism Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/80 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,90,60,0.12)_0%,transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.08)_0%,transparent_50%)]" />
      </div>

      {/* FLOATING PARTICLES */}
      <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden" id="ambient-hero-particles">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: '100vh', opacity: 0 }}
            animate={{
              y: '-20vh',
              x: `${p.x + Math.sin(p.id) * 5}%`,
              opacity: [0, 0.7, 0.7, 0]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: p.id * 0.5
            }}
            className="absolute rounded-full bg-gradient-to-t from-[#ff5a3c] to-[#ffa38f] mix-blend-screen"
            style={{
              left: `${p.x}%`,
              width: p.size,
              height: p.size,
              filter: 'blur(1px)'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left: Text Content and Action buttons */}
          <div className="lg:col-span-8 space-y-8 text-left" id="hero-content-primary">
            
            {/* Elegant Location Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="inline-flex items-center gap-2.5 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800 text-slate-300 text-xs font-mono select-none"
            >
              <div className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff5a3c] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff5a3c]"></span>
              </div>
              <span>{siteSettings?.heroBadge || "Premium Consultancy:"} </span>
              <span className="text-[#ff5a3c] font-black tracking-wide font-sans md:text-[12px]">{siteSettings?.heroBadgeHighlight || "Elite Property Hub"}</span>
            </motion.div>

            {/* Headline and Subheading with text reveal */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-7.5xl font-sans font-black tracking-tight leading-[1.1] text-white">
                <motion.span
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="block"
                >
                  {siteSettings?.heroHeadline1 || "Your Requirement."}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5a3c] via-[#ff7854] to-[#ffaa3c]"
                >
                  {siteSettings?.heroHeadline2Highlight || "Our Real Estate Solution."}
                </motion.span>
              </h1>

              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-slate-350 text-sm sm:text-base lg:text-lg max-w-2xl font-normal leading-relaxed text-slate-300"
              >
                {siteSettings?.heroSubheading || "Tell us what you're looking for, and we'll help you find it. Whether you're buying, selling, renting, leasing, or investing, our boutique agency provides personalized real estate arrangements."}
              </motion.p>
            </div>

            {/* Primary Action Buttons with Glow/Hover FX */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4"
              id="hero-call-to-actions"
            >
              <button
                onClick={onOpenCustomRequest}
                className="group relative px-7 py-4 rounded-xl bg-gradient-to-r from-[#ff5a3c] to-[#e04326] text-white font-sans text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,90,60,0.45)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Sparkles className="h-4.5 w-4.5 text-orange-200 group-hover:rotate-12 transition-transform" />
                {siteSettings?.heroButtonText || "Submit Your Requirement"}
              </button>

               <button
                onClick={() => setShowExpertCallCard(true)}
                className="group px-7 py-4 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-200 hover:text-white font-sans text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 hover:border-slate-600 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageSquare className="h-4.5 w-4.5 text-slate-400 group-hover:text-white transition-colors" />
                Talk To An Expert
              </button>
            </motion.div>

          </div>

          {/* Right Column: Premium Trust Seal Glassmorphism Display Card */}
          <div className="lg:col-span-4 flex items-center justify-center lg:justify-end" id="hero-right-shield">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-slate-950/65 backdrop-blur-xl border border-slate-850 p-6 rounded-2xl w-full max-w-sm relative shadow-2xl overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-b from-[#ff5a3c]/10 to-transparent blur-xl pointer-events-none" />
              <div className="flex items-center gap-3.5 mb-5">
                <div className="p-2.5 rounded-xl bg-[#ff5a3c]/10 border border-[#ff5a3c]/20 text-[#ff5a3c] shrink-0">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-white font-sans font-black text-xs uppercase tracking-wider">Unmatched Integrity</h4>
                  <p className="text-[10px] text-slate-500 font-mono">100% SECURED COUNSEL</p>
                </div>
              </div>

              <div className="space-y-3.5 text-left text-xs font-sans text-slate-300 border-t border-slate-900 pt-4">
                <div className="flex gap-2">
                  <span className="text-[#ff5a3c] font-bold">✔</span>
                  <p className="text-[11px] leading-tight">Zero blind searches. We search based entirely on your budget, timeline, and exact metrics.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#ff5a3c] font-bold">✔</span>
                  <p className="text-[11px] leading-tight">Personalized sourcing in premium strategic corridors and development zones.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#ff5a3c] font-bold">✔</span>
                  <p className="text-[11px] leading-tight flex-grow">Automated sync under our core corporate secure admin workstation dashboard.</p>
                </div>
              </div>
            </motion.div>
          </div>

        </div>

        {/* INTEGRATED DIRECT REQUIREMENT SEARCH HUD */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 bg-slate-900/60 backdrop-blur-xl border border-slate-850 rounded-2xl p-6 sm:p-7 shadow-2xl relative z-20 max-w-5xl mx-auto"
          id="hero-quick-search-panel"
        >
          {/* Mini Header Tabs */}
          <div className="flex border-b border-slate-850/60 pb-3 overflow-x-auto space-x-1.5 scrollbar-none" id="search-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedType(tab.id)}
                className={`relative px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer text-nowrap select-none ${
                  selectedType === tab.id
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {selectedType === tab.id && (
                  <motion.span
                    layoutId="heroActiveTab"
                    className="absolute inset-0 bg-[#ff5a3c] rounded-lg shadow-md shadow-orange-950/20"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.title}</span>
              </button>
            ))}
          </div>

          {/* Sourcing Form */}
          <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            
            <div className="md:col-span-4 space-y-1.5 text-left relative" id="search-keyword-container">
              <label className="text-[9px] uppercase tracking-widest text-[#ff5a3c] font-black font-mono block">Looking For Keyword</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={mapSettings?.searchPlaceholder || "e.g. Modern duplex plot space"}
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c] focus:border-transparent transition"
                />
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              </div>

              {/* Suggestions overlay */}
              <AnimatePresence>
                {showSuggestions && keyword.trim().length > 0 && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-850 rounded-xl max-h-80 overflow-y-auto z-50 shadow-2xl divide-y divide-slate-850"
                    >
                      {filteredSuggestions.length > 0 ? (
                        filteredSuggestions.map((prop) => (
                          <div
                            key={prop.id}
                            onClick={() => handleSelectSuggestion(prop)}
                            className="p-3.5 hover:bg-slate-800 transition cursor-pointer flex flex-col text-left space-y-1"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-semibold text-white text-[12px] line-clamp-1">
                                {prop.title}
                              </span>
                              <span className="text-[8px] font-mono font-bold text-[#ff5a3c] bg-[#ff5a3c]/10 px-1.5 py-0.5 rounded uppercase shrink-0">
                                {prop.code || prop.id.slice(0, 8).toUpperCase()}
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-450 font-sans">
                              {prop.builderName && (
                                <span className="text-slate-350">By {prop.builderName}</span>
                              )}
                              {prop.builderName && <span className="text-slate-700">•</span>}
                              <span className="text-[#a3e635] font-semibold">
                                {prop.price ? `₹${(prop.price / 100000).toFixed(1)} L` : 'Call'}
                              </span>
                              <span className="text-slate-700">•</span>
                              <span className="line-clamp-1 text-slate-400">{prop.location}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-slate-500 font-sans text-xs italic">
                          No Properties Found
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="md:col-span-4 space-y-1.5 text-left">
              <label className="text-[9px] uppercase tracking-widest text-slate-400 font-black font-mono block">Asset Classification</label>
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#ff5a3c] focus:border-transparent transition appearance-none cursor-pointer"
                >
                  <option value="All">All Classifications</option>
                  {activeCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                  ))}
                </select>
                <Building className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <div className="md:col-span-4 space-y-1.5 text-left">
              <label className="text-[9px] uppercase tracking-widest text-slate-400 font-black font-mono block">Zone Corridor</label>
              <div className="relative">
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#ff5a3c] focus:border-transparent transition appearance-none cursor-pointer"
                >
                  <option value="All">All Regions (Global Search)</option>
                  {activeLocations.map((loc) => (
                    <option key={loc.name} value={loc.name}>
                      {loc.name} {loc.city ? `(${loc.city})` : ''}
                    </option>
                  ))}
                </select>
                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <div className="md:col-span-12 mt-3 flex flex-all flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-850/60 pt-4">
              <div className="flex flex-wrap gap-1.5 items-center text-[10px] text-slate-500">
                <span className="font-bold uppercase tracking-wider mr-1 text-slate-400 font-mono">Quick Filter:</span>
                {activeCategories.length > 0 ? (
                  activeCategories.map((cat) => {
                    const isSelected = selectedType === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          const nextType = selectedType === cat.id ? 'All' : cat.id;
                          setSelectedType(nextType);
                          onSearch({ 
                            keyword, 
                            type: nextType, 
                            location, 
                            filter: undefined 
                          });
                        }}
                        className={`px-2.5 py-1 text-[10px] rounded-md transition cursor-pointer border ${
                          isSelected 
                            ? 'bg-[#ff5a3c] text-white border-[#ff5a3c] shadow-lg shadow-[#ff5a3c]/20 font-bold' 
                            : 'bg-slate-950/50 hover:bg-slate-900 text-slate-350 border-slate-850 hover:border-slate-800'
                        }`}
                      >
                        {cat.title}
                      </button>
                    );
                  })
                ) : (
                  <span className="text-slate-600 font-sans italic">No categories created</span>
                )}
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto bg-[#ff5a3c] hover:bg-[#e04326] text-white px-6 py-3.5 rounded-xl font-mono text-[11px] font-black uppercase tracking-wider shadow-lg active:scale-98 transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 self-end"
              >
                Crawl Requirements Archive
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </form>
        </motion.div>

      </div>

      {/* Expert Dialer Overlay Modal with direct action */}
      <AnimatePresence>
        {showExpertCallCard && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExpertCallCard(false)}
              className="absolute inset-0 bg-[#060c18]/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-6 shadow-2xl z-10"
            >
              <button
                onClick={() => setShowExpertCallCard(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 transition duration-150"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="w-16 h-16 bg-[#ff5a3c]/15 border border-[#ff5a3c]/20 text-[#ff5a3c] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Phone className="h-8 w-8 animate-pulse" />
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-mono tracking-widest font-black text-[#ff5a3c] uppercase bg-[#ff5a3c]/10 px-2.5 py-1 rounded-md">
                  direct acquisition channel
                </span>
                <h4 className="text-xl font-black text-white tracking-tight">Speak Directly with our Realtor</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Get instant assistance, layout allocations, or schedule VIP consultations directly through our primary hotline.
                </p>
              </div>

              {/* Big styled hotlink number */}
              <a 
                href="tel:6300984846"
                className="block py-4 px-6 bg-slate-950 rounded-2xl border border-slate-850 hover:border-[#ff5a3c] transition-all group scale-100 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 block mb-1">VIP DIRECT DIAL</span>
                <span className="text-2xl font-black text-[#ff5a3c] tracking-tight group-hover:text-white transition-colors block">
                  +91 6300984846
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold block mt-1 animate-pulse">
                  ● Click to call instantly
                </span>
              </a>

              <div className="pt-2 text-[10px] font-mono text-slate-500 flex items-center justify-center gap-1.5">
                <span>CORPORATE COUNSEL DEPT • VIP FOCUS AREAS</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
