import React, { useState, useMemo } from 'react';
import { 
  MapPin, Compass, TrendingUp, Sparkles, Building2, Landmark, 
  Star, Navigation, Info, ArrowUpRight, ArrowRight, CheckCircle2, 
  Map, Network, Briefcase, LandmarkIcon, DollarSign, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Property } from '../types';

interface ExploreOpportunitiesProps {
  mapLocations: any;
  mapSettings?: any;
  properties: Property[];
  onViewDetails: (property: Property) => void;
  onOpenCustomRequest: () => void;
  setSearchFilter: React.Dispatch<React.SetStateAction<{ keyword: string; type: string; location: string }>>;
  scrollToListings: () => void;
  onNavigateToLocation?: (slug: string) => void;
}

interface BengaluruMarket {
  id: string;
  name: string;
  slug: string;
  district: string;
  description: string;
  highlights: string[];
  connectivity: string;
  demandIndex: 'Hyper' | 'Critical' | 'High' | 'Steady';
  populationEst: string;
  coordinateX: number; // SVG percentage X (10-90)
  coordinateY: number; // SVG percentage Y (10-90)
  averagePrice: string;
  roiEstimate: string;
  metroStatus: string;
  techParks: string[];
  topCategories: string[]; // ['Villas', 'Commercial', etc.]
  image: string;
}

export default function ExploreOpportunities({
  properties,
  setSearchFilter,
  scrollToListings,
  onNavigateToLocation
}: ExploreOpportunitiesProps) {
  // 1. Bengaluru micro-markets static authoritative profiles
  const BENGALURU_MARKETS: BengaluruMarket[] = useMemo(() => [
    {
      id: "m1",
      name: "Indiranagar",
      slug: "indiranagar",
      district: "East Bengaluru",
      description: "Bengaluru's elite high-street hub and premier residential destination. It blends gorgeous quiet tree-lined streets with bustling tech hubs, corporate offices, and luxury duplex bungalows.",
      highlights: [
        "Premium high-street commercial focus",
        "Aesthetic luxury builder duplex floors",
        "Elite residential neighborhood charm"
      ],
      connectivity: "Superb (Direct Purple Line Metro access & arterial city road grid)",
      demandIndex: "Hyper",
      populationEst: "1.4 Lakhs",
      coordinateX: 44,
      coordinateY: 48,
      averagePrice: "₹18,500/sqft",
      roiEstimate: "11.2% YoY Growth",
      metroStatus: "Fully Operational (Purple Line Stations)",
      techParks: ["Bagmane Tech Park", "RMZ Millenia corridor"],
      topCategories: ["Apartments", "Villas", "Commercial", "Residential"],
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "m2",
      name: "Whitefield",
      slug: "whitefield",
      district: "East IT Corridor",
      description: "The global software powerhouse of South India. Whitefield houses colossal technological campuses, expansive integrated housing projects, premium gated villas, and sprawling retail complexes.",
      highlights: [
        "Headquarters of major fortune-500 IT giants",
        "High-density luxury sky-condo townships",
        "Gated community private villas"
      ],
      connectivity: "Excellent (Recently integrated Purple Line Extension & express flyover lanes)",
      demandIndex: "High",
      populationEst: "3.2 Lakhs",
      coordinateX: 78,
      coordinateY: 52,
      averagePrice: "₹9,200/sqft",
      roiEstimate: "14.5% YoY Growth",
      metroStatus: "Ready & Active (Kadugodi & ITPB Stations)",
      techParks: ["International Tech Park (ITPL)", "Sigma Tech Park"],
      topCategories: ["Apartments", "Villas", "Commercial", "Rentals & PG", "Residential"],
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "m3",
      name: "JP Nagar",
      slug: "jp-nagar",
      district: "South Bengaluru",
      description: "An elegant, well-planned green suburb in South Bengaluru. JP Nagar is highly prized for its elite independent layouts, premium custom gated plots, theatre zones, and luxury low-rise floors.",
      highlights: [
        "Exclusive gated residential plots & layouts",
        "Elite custom builder floors & villas",
        "Rich green buffers & cultural community vibe"
      ],
      connectivity: "Superb (Active Green Line Metro & Outer Ring Road coordination)",
      demandIndex: "Hyper",
      populationEst: "2.1 Lakhs",
      coordinateX: 28,
      coordinateY: 76,
      averagePrice: "₹8,400/sqft",
      roiEstimate: "12.8% YoY Growth",
      metroStatus: "Operational (JP Nagar Phases 4 & 5)",
      techParks: ["Kalyani Planet IT Park", "Global Village Complex Link"],
      topCategories: ["Plots", "Residential", "Villas", "Rentals & PG", "Apartments"],
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "m4",
      name: "Koramangala",
      slug: "koramangala",
      district: "South-East startup Hub",
      description: "The official startup capital of Asia and student lifestyle center. Koramangala features micro-offices, high-yield co-living assets, single-room PG campuses, and premium multi-family real estate.",
      highlights: [
        "Highest technology start-up density in Asia",
        "Lucrative high-value PG & co-living assets",
        "Upscale retail streets and lifestyle arenas"
      ],
      connectivity: "Great (Aesthetic ring roads & close upcoming metro intersections)",
      demandIndex: "Critical",
      populationEst: "1.9 Lakhs",
      coordinateX: 46,
      coordinateY: 64,
      averagePrice: "₹14,200/sqft",
      roiEstimate: "13.6% YoY Growth",
      metroStatus: "Under Construction (Yellow Line alignment)",
      techParks: ["Embassy GolfLinks Access", "Prestige Blue Chip Park"],
      topCategories: ["Rentals & PG", "Commercial", "Apartments", "Residential"],
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "m5",
      name: "HSR Layout",
      slug: "hsr-layout",
      district: "South-East Sector Grid",
      description: "The gateway residential community structured perfectly in 7 grid-sectors. Popular with developers, startup founders, and high-net-worth individuals exploring luxury plots & elegant low-rises.",
      highlights: [
        "Highly organized geometric sector layouts",
        "Spacious independent residential plots",
        "Tech incubator & accelerator headquarters"
      ],
      connectivity: "Very Good (Direct Outer Ring Road link & proximity to Silk Board exchange)",
      demandIndex: "Hyper",
      populationEst: "1.7 Lakhs",
      coordinateX: 56,
      coordinateY: 71,
      averagePrice: "₹11,500/sqft",
      roiEstimate: "15.1% YoY Growth",
      metroStatus: "Upcoming (Silk Board central hub terminal linking soon)",
      techParks: ["Ozone Manay Corporate Park", "HSR Startup Incubators"],
      topCategories: ["Plots", "Residential", "Villas", "Rentals & PG", "Apartments"],
      image: "https://images.unsplash.com/photo-15925bf5896551-12b371d546d5?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "m6",
      name: "Hebbal",
      slug: "hebbal",
      district: "North Gateway",
      description: "The primary high-growth northern corridor of Bengaluru, showcasing panoramic lake-view deluxe towers, corporate parks, and high-budget gated compounds leading directly to the International Airport.",
      highlights: [
        "Majestic lakeside high-rise super condominiums",
        "Direct national highway corridor to airport",
        "Massive luxury developments with green buffers"
      ],
      connectivity: "Superb (Fast flyover express networks & direct Airport Highway access)",
      demandIndex: "High",
      populationEst: "1.5 Lakhs",
      coordinateX: 38,
      coordinateY: 22,
      averagePrice: "₹12,800/sqft",
      roiEstimate: "13.9% YoY Growth",
      metroStatus: "Approved (Phase 3 ORR subway integrations)",
      techParks: ["Manyata Tech Park (Region largest block)", "Kirloskar Business Hub"],
      topCategories: ["Apartments", "Residential", "Villas", "Commercial"],
      image: "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "m7",
      name: "Electronic City",
      slug: "electronic-city",
      district: "South Hardware Capital",
      description: "The industrial electronics capital of India. Electronic City hosts industrial campus empires alongside highly affordable rental corridors, budget PG arrays, and high-yield layout plots.",
      highlights: [
        "Largest electronics hardware park in India",
        "Extremely affordable high-yield PG assets",
        "High-density tech employee housing"
      ],
      connectivity: "Good (9-kilometer continuous elevated highway route)",
      demandIndex: "High",
      populationEst: "2.8 Lakhs",
      coordinateX: 61,
      coordinateY: 86,
      averagePrice: "₹5,900/sqft",
      roiEstimate: "16.1% YoY Growth",
      metroStatus: "Ready & undergoing trials (Yellow Line Metro)",
      techParks: ["Infosys Corporate HQ Campus", "Wipro Global Tech Hub"],
      topCategories: ["Rentals & PG", "Apartments", "Plots", "Commercial", "Residential"],
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80"
    }
  ], []);

  // 2. Active States
  const [selectedMarketId, setSelectedMarketId] = useState<string>("m1");
  const [activeInterestType, setActiveInterestType] = useState<string>("All"); // Plots, Apartments, Rentals & PG, Villas, Residential, Commercial, All

  // Active micro-market selection
  const activeMarket = useMemo(() => {
    return BENGALURU_MARKETS.find(m => m.id === selectedMarketId) || BENGALURU_MARKETS[0];
  }, [BENGALURU_MARKETS, selectedMarketId]);

  // Handle auto-focus state synchronization when user filters hotspots
  React.useEffect(() => {
    if (activeInterestType === "All") return;
    const currentMarketSupports = activeMarket.topCategories.includes(activeInterestType);
    if (!currentMarketSupports) {
      // Pin-insights synchronization: find the first location matching the clicked category
      const firstMatching = BENGALURU_MARKETS.find(m => m.topCategories.includes(activeInterestType));
      if (firstMatching) {
        setSelectedMarketId(firstMatching.id);
      }
    }
  }, [activeInterestType, activeMarket, BENGALURU_MARKETS]);

  // Handle clicking navigation matches
  const handleVentureIntoListings = () => {
    // Map type parameters or location parameters
    const typeValue = activeInterestType === 'All' ? '' : activeInterestType;
    const typeParam = typeValue.toLowerCase().replace('rentals & pg', 'pg').replace('luxury villas', 'villa');
    const locationParam = activeMarket.name.toLowerCase();

    // Map the selected micro-market to correct search coordinates
    setSearchFilter({
      keyword: '',
      type: typeValue === 'All' ? '' : typeValue,
      location: activeMarket.name
    });

    const params = new URLSearchParams();
    if (typeParam) params.set('type', typeParam);
    if (locationParam) params.set('location', locationParam);

    // Redirect to properties page
    (window.history as any).historyState = null; // or standard push
    window.history.pushState(null, '', `/properties${params.toString() ? '?' + params.toString() : ''}`);
    try {
      window.dispatchEvent(new Event('popstate'));
    } catch (e) {
      const ev = document.createEvent('Event');
      ev.initEvent('popstate', true, true);
      window.dispatchEvent(ev);
    }
  };

  // Helper properties density counts for the selected market
  const propertiesInActiveMarketCount = useMemo(() => {
    return properties.filter(p => 
      p.address.toLowerCase().includes(activeMarket.name.toLowerCase()) ||
      p.location.toLowerCase() === activeMarket.name.toLowerCase()
    ).length;
  }, [properties, activeMarket]);

  return (
    <section id="bengaluru-location-discovery-hub" className="py-24 bg-white font-sans text-left border-t border-slate-100 relative overflow-hidden">
      
      {/* Aesthetic grid mesh lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* SECTION HEADER BLOCK */}
        <div className="space-y-4 mb-14 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-[10px] uppercase font-mono tracking-widest font-extrabold text-amber-700">
              DVARIX REALTY | LOCATION DISCOVERY
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-sans">
              Explore Bangalore by What You're Looking For
            </h2>
            <p className="text-slate-500 text-sm max-w-3xl mx-auto font-normal leading-relaxed">
              Discover prime micro-markets, local technology infrastructure hubs, and premium investment opportunities across Bengaluru through an interactive GIS location dashboard.
            </p>
          </div>
        </div>

        {/* 3-COLUMN LAYOUT STRUCTURE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-10">
          
          {/* ==================== 1. LEFT PANEL (Information Panel) ==================== */}
          <div className="lg:col-span-3 flex flex-col justify-between bg-slate-50 border border-slate-200/80 rounded-3xl p-6.5 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Compass className="h-32 w-32 text-slate-900" />
            </div>

            <div className="space-y-5">
              {/* Dynamic Location Representative Image */}
              <div className="w-full h-32 rounded-2xl overflow-hidden relative group border border-slate-200 shrink-0">
                <img 
                  src={activeMarket.image} 
                  alt={activeMarket.name} 
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
              </div>

              {/* Market Badge Card Header */}
              <div className="space-y-1">
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[9px] font-mono font-bold uppercase py-0.5 px-2 bg-slate-200/80 text-slate-705 rounded-md leading-none">
                    {activeMarket.district}
                  </span>
                  <span className="flex items-center gap-0.5 text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md leading-none">
                    <Activity className="h-2.5 w-2.5" /> {activeMarket.demandIndex} Demand
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                  {activeMarket.name}
                </h3>
              </div>

              {/* Description */}
              <p className="text-slate-600 text-[11px] leading-relaxed font-sans font-normal">
                {activeMarket.description}
              </p>

              {/* Property Types Designated List tags */}
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono block">PROPERTY TYPES DESIGNATED</span>
                <div className="flex flex-wrap gap-1">
                  {activeMarket.topCategories.map((cat, idx) => (
                    <span 
                      key={idx} 
                      className={`text-[9px] font-bold font-mono tracking-tight px-1.5 py-0.5 rounded border leading-none uppercase ${
                        activeInterestType === cat || (activeInterestType === 'Plots' && cat === 'Plots') || (activeInterestType === 'Villas' && cat === 'Villas')
                          ? 'bg-amber-100 border-amber-300 text-amber-800 font-extrabold'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {cat === 'Plots' ? 'Plots & Land' : cat === 'Villas' ? 'Luxury Villas' : cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Connectivity and Demography block */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono block leading-none">CONNECTIVITY SYSTEM</span>
                  <div className="flex items-start gap-1 text-slate-800 text-[11px] font-semibold leading-tight">
                    <Network className="h-3.5 w-3.5 text-sky-500 shrink-0 mt-0.5" />
                    <span>{activeMarket.connectivity}</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono block leading-none">POPULATION PROFILE</span>
                  <div className="flex items-center gap-1 text-slate-800 text-[11px] font-semibold leading-none">
                    <Star className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Est. population: <strong>{activeMarket.populationEst}</strong></span>
                  </div>
                </div>
              </div>

              {/* Highlights List */}
              <div className="space-y-1.5 pt-3 border-t border-slate-200">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono block leading-none">NEIGHBORHOOD HIGHLIGHTS</span>
                <ul className="space-y-1">
                  {activeMarket.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-slate-700 text-[10.5px] leading-snug">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* View Catalog Matches Button */}
            <div className="pt-4 border-t border-slate-200 mt-5 md:mt-0">
              <button
                type="button"
                onClick={handleVentureIntoListings}
                className="w-full bg-slate-900 hover:bg-[#ff5a3c] text-white font-sans text-xs font-black py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 tracking-wider uppercase shadow-xs group transition cursor-pointer"
              >
                <span>Explore {activeMarket.name} →</span>
              </button>
              <span className="text-[8px] text-slate-400 text-center block mt-2 font-mono uppercase">
                {propertiesInActiveMarketCount === 0 ? 'No matching live listings' : `${propertiesInActiveMarketCount} Live properties correlated`}
              </span>
            </div>
          </div>

          {/* ==================== 2. CENTER PANEL (Large Interactive Map) ==================== */}
          <div className="lg:col-span-6 border-2 border-slate-100 rounded-3xl relative min-h-[480px] lg:min-h-[500px] shadow-sm select-none overflow-hidden bg-slate-900 flex flex-col justify-between">
            
            {/* Dark GIS grid pattern */}
            <div className="absolute inset-0 bg-[#0f172a] mix-blend-color-dodge opacity-15 pointer-events-none [background-size:20px_20px]" style={{ backgroundImage: `radial-gradient(rgba(245,158,11,0.2) 1px, transparent 1px)` }} />
            
            {/* Top Header over Map */}
            <div className="p-4 relative z-10 flex items-center justify-between pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/95 border border-slate-800 shadow-xl rounded-xl text-[9px] font-mono font-bold text-slate-400 pointer-events-auto">
                <Map className="h-3.5 w-3.5 text-amber-500" />
                DVARIX CUSTOM VECTOR GIS BOARD
              </span>
              <span className="text-[8px] font-mono font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1.5 rounded-lg backdrop-blur-md pointer-events-auto">
                Bengaluru Center: 12.9716° N, 77.5946° E
              </span>
            </div>

            {/* Dynamic Simulated Geographic Board Map */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto overflow-hidden">
              <div className="w-full h-full relative">
                
                {/* SVG Route Outlines detailing high-growth Bengaluru corridors */}
                <svg viewBox="0 0 1000 600" className="absolute inset-0 w-full h-full stroke-slate-800/60 fill-transparent pointer-events-none" strokeWidth="2.5">
                  {/* Purple line Metro route */}
                  <path d="M 50,300 Q 300,280 440,480 T 780,520" fill="none" stroke="#a855f7" strokeWidth="3" strokeDasharray="6,4" className="opacity-40" />
                  {/* Green line Metro route */}
                  <path d="M 280,780 Q 280,450 380,220" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="6,4" className="opacity-40" />
                  
                  {/* Outer Ring Road Express loop line */}
                  <path d="M 150,150 Q 500,80 850,220 T 610,860" fill="none" stroke="#e2e8f0" strokeWidth="1.5" className="opacity-15" />

                  {/* Aesthetic Blue lakes outlining the Bengaluru geography */}
                  {/* Hebbal Lake North */}
                  <ellipse cx="380" cy="120" rx="35" ry="12" className="fill-blue-950/40 stroke-blue-800/30" />
                  <text x="380" y="115" className="fill-blue-400/30 text-[9px] font-mono font-bold text-center" textAnchor="middle">Hebbal Lake</text>

                  {/* Madiwala Lake South */}
                  <ellipse cx="500" cy="740" rx="40" ry="16" className="fill-blue-950/40 stroke-blue-800/30" strokeWidth="1.5" />
                  <text x="500" y="738" className="fill-blue-400/30 text-[9px] font-mono font-bold text-center" textAnchor="middle">Madiwala Lake</text>

                  {/* Ulsoor Lake Central */}
                  <path d="M 450,400 C 470,380 490,420 500,410 C 510,400 490,370 470,360 Z" className="fill-blue-950/40 stroke-blue-800/30" strokeWidth="1.5" />
                  <text x="490" y="380" className="fill-blue-400/25 text-[8px] font-mono font-bold" textAnchor="middle">Ulsoor Lake</text>
                </svg>

                {/* Pin Anchors Over SVG Map */}
                {BENGALURU_MARKETS.map((loc) => {
                  const isSelected = loc.id === selectedMarketId;
                  
                  // Verification check if this neighborhood supports activeInterestType Category
                  const supportsCategory = activeInterestType === 'All' || loc.topCategories.includes(activeInterestType);

                  if (!supportsCategory) return null;

                  return (
                    <div
                      key={loc.id}
                      style={{ left: `${loc.coordinateX}%`, top: `${loc.coordinateY}%` }}
                      className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                    >
                      {/* Active pulsating beacon rings */}
                      {isSelected && (
                        <span className="absolute w-12 h-12 rounded-full border animate-ping -translate-x-1/2 -translate-y-1/2 left-0 top-0 pointer-events-none bg-amber-500/20 border-amber-500/40" />
                      )}

                      {/* Accent highlight glow if matches category selection */}
                      {supportsCategory && activeInterestType !== 'All' && (
                        <span className="absolute w-8 h-8 rounded-full animate-pulse -translate-x-1/2 -translate-y-1/2 left-0 top-0 pointer-events-none bg-emerald-500/10 border border-emerald-500/30" />
                      )}

                      {/* Map Pin button marker */}
                      <button
                        type="button"
                        onClick={() => setSelectedMarketId(loc.id)}
                        className={`font-sans relative flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border cursor-pointer select-none transition-all duration-300 text-[10px] font-black tracking-tight ${
                          isSelected 
                            ? 'bg-amber-500 text-slate-950 border-white font-extrabold shadow-xl scale-110' 
                            : supportsCategory
                              ? 'bg-slate-900/90 text-white border-slate-700 hover:bg-slate-800'
                              : 'bg-slate-950/60 text-slate-500 border-slate-900 hover:text-slate-300'
                        }`}
                      >
                        <MapPin className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-slate-950 animate-bounce' : supportsCategory ? 'text-amber-500' : 'text-slate-700'}`} />
                        <span>{loc.name}</span>

                        {/* Special small category relevance match tag */}
                        {supportsCategory && activeInterestType !== 'All' && (
                          <span className="absolute -top-1.5 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* Live Interactive Footer feedback line */}
            <div className="p-4 relative z-10 bg-slate-950/85 backdrop-blur-md border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Compass className="h-3.5 w-3.5 text-amber-500 animate-spin" style={{ animationDuration: '20s' }} />
                Selected Spot: {activeMarket.name} ({activeMarket.district})
              </span>
              <span className="text-amber-500 text-xs font-black">
                {activeInterestType === 'All' ? 'Showing All Geographies' : `Highlighting ${activeInterestType} prime zones`}
              </span>
            </div>
          </div>

          {/* ==================== 3. RIGHT PANEL (Dynamic Location Insights) ==================== */}
          <div className="lg:col-span-3 bg-slate-50 border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-5 text-left">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <TrendingUp className="h-5 w-5 text-amber-500" />
                <h4 className="text-sm font-extrabold text-slate-900 uppercase font-sans tracking-tight">Location Insights</h4>
              </div>

              {/* Stat Card 1: Average Sqft Rate */}
              <div className="bg-white border border-slate-150 rounded-2xl p-4.5 space-y-1">
                <div className="flex justify-between items-center text-slate-400 font-mono text-[9px] font-bold uppercase">
                  <span>Price Metric</span>
                  <DollarSign className="h-3 w-3 text-emerald-500" />
                </div>
                <div className="text-lg font-black text-slate-900 font-sans tracking-tight leading-none pt-0.5">
                  {activeMarket.averagePrice}
                </div>
                <p className="text-[10px] text-slate-500 pt-1 font-sans">Estimated catalog market rate per sqft</p>
              </div>

              {/* Stat Card 2: ROI Assessment */}
              <div className="bg-white border border-slate-150 rounded-2xl p-4.5 space-y-1">
                <div className="flex justify-between items-center text-slate-400 font-mono text-[9px] font-bold uppercase">
                  <span>Growth Benchmark</span>
                  <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <div className="text-lg font-black text-emerald-600 font-sans tracking-tight leading-none pt-0.5">
                  {activeMarket.roiEstimate}
                </div>
                <p className="text-[10px] text-slate-500 pt-1 font-sans">Average growth rate inside previous 12 months</p>
              </div>

              {/* Stat Card 3: Upcoming Infrastructure Metro status */}
              <div className="bg-white border border-slate-150 rounded-2xl p-4.5 space-y-1">
                <span className="text-slate-400 font-mono text-[9px] font-bold uppercase block">Metro Station status</span>
                <div className="text-xs font-bold text-slate-800 leading-snug pt-0.5">
                  {activeMarket.metroStatus}
                </div>
              </div>

              {/* Technology Parks Nearby list */}
              <div className="space-y-1.5 pt-2">
                <span className="text-slate-400 font-mono text-[9px] font-bold uppercase block">Major Tech Hubs Nearby</span>
                <div className="flex flex-wrap gap-1">
                  {activeMarket.techParks.map((park, i) => (
                    <span key={i} className="text-[10px] bg-slate-200/60 border border-slate-300/40 text-slate-700 py-1 px-2.5 rounded-lg font-medium font-sans">
                      🏢 {park}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Quick Gated communities badge indicator */}
            <div className="pt-6 border-t border-slate-200 mt-6 md:mt-0 space-y-1">
              <span className="text-slate-400 font-mono text-[8px] font-bold uppercase block">Infrastructure grade</span>
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Modern Underground Grid Cables &amp; Water Lines Ready
              </div>
            </div>
          </div>

        </div>

        {/* PROPERTY TYPE DISCOVERY NAVIGATION (Tabs Below the Map) */}
        <div className="bg-slate-50 border border-slate-200/85 rounded-2xl p-5 w-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="text-left space-y-0.5">
              <h4 className="font-extrabold text-slate-900 font-sans text-xs tracking-tight uppercase flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} /> Property Type Hotspot Locator
              </h4>
              <p className="text-slate-500 text-[11px]">Select a property category below to illuminate matching geographical zones on the map dashboard</p>
            </div>

            {/* Category selection Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-white border border-slate-200 p-1 rounded-xl shadow-xs">
              {[
                { label: "All Sectors", value: "All" },
                { label: "Plots & Land", value: "Plots" },
                { label: "Apartments", value: "Apartments" },
                { label: "Rentals & PG", value: "Rentals & PG" },
                { label: "Luxury Villas", value: "Villas" },
                { label: "Residential", value: "Residential" },
                { label: "Commercial", value: "Commercial" }
              ].map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => {
                    setActiveInterestType(category.value);
                    const typeParam = category.value === 'All' ? '' : category.value.toLowerCase().replace('rentals & pg', 'pg').replace('luxury villas', 'villa');
                    const params = new URLSearchParams();
                    if (typeParam) params.set('type', typeParam);
                    
                    window.history.pushState(null, '', `/properties${params.toString() ? '?' + params.toString() : ''}`);
                    try {
                      window.dispatchEvent(new Event('popstate'));
                    } catch (e) {
                      const ev = document.createEvent('Event');
                      ev.initEvent('popstate', true, true);
                      window.dispatchEvent(ev);
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all duration-200 cursor-pointer ${
                    activeInterestType === category.value
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 font-semibold'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
