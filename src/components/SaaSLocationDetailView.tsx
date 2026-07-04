import React, { useMemo, useState } from 'react';
import { 
  ArrowLeft, MapPin, Star, TrendingUp, Building2, 
  Ruler, LayoutGrid, Sparkles, MessageCircle, 
  Milestone, Calendar, Phone, Mail, BadgeCheck, Compass
} from 'lucide-react';
import { motion } from 'motion/react';
import { MapLocation, Property, PropertyCardConfig, PropertyCardTemplate } from '../types';
import PropertyCard from './PropertyCard';

interface SaaSLocationDetailViewProps {
  location: MapLocation;
  properties: Property[];
  onBack: () => void;
  onViewPropertyDetails: (p: Property) => void;
  onOpenCustomRequest: () => void;
}

export default function SaaSLocationDetailView({
  location,
  properties,
  onBack,
  onViewPropertyDetails,
  onOpenCustomRequest
}: SaaSLocationDetailViewProps) {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedBudget, setSelectedBudget] = useState<string>('All');

  // Filter properties belonging to this location
  const locationProperties = useMemo(() => {
    let list = properties.filter(p => {
      const matchLoc = p.location.toLowerCase() === location.name.toLowerCase() ||
                       (location.slug && p.location.toLowerCase() === location.slug.toLowerCase()) ||
                       p.location.toLowerCase() === (location.city || '').toLowerCase() ||
                       p.address.toLowerCase().includes(location.name.toLowerCase()) ||
                       p.address.toLowerCase().includes((location.city || '').toLowerCase());
      return matchLoc;
    });

    if (selectedType !== 'All') {
      list = list.filter(p => p.type.toLowerCase() === selectedType.toLowerCase());
    }

    if (selectedBudget !== 'All') {
      list = list.filter(p => {
        if (selectedBudget === 'Under ₹1 Cr') return p.price < 10000000;
        if (selectedBudget === '₹1 Cr - ₹3 Cr') return p.price >= 10000000 && p.price <= 30000000;
        if (selectedBudget === 'Over ₹3 Cr') return p.price > 30000000;
        return true;
      });
    }

    return list;
  }, [location, properties, selectedType, selectedBudget]);

  const config: PropertyCardConfig = {
    showLocation: true,
    showPrice: true,
    showPropertyType: true,
    showArea: true,
    showPropertyStatus: true,
    showProjectName: true,
    showBuilderName: true,
    showFeaturedBadge: true,
    showVerifiedBadge: true,
    showDemandLevel: true,
    showInvestmentScore: true,
    showPossessionDate: true,
    showAgentInformation: true,
  };

  const isLocationFeatured = location.featured !== false || location.featuredLocation === true;

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans text-left animate-fade-in">
      {/* 1. HERO BANNER COVER */}
      <div className="relative h-[320px] md:h-[400px] overflow-hidden bg-slate-900 border-b border-slate-200">
        <img 
          src={location.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80'} 
          alt={location.name} 
          className="w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
        
        {/* Navigation Floating Header inside Hero */}
        <div className="absolute top-6 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl text-slate-800 hover:text-sky-600 text-xs font-bold shadow-md transition hover:-translate-x-0.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Map Discovery
            </button>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/80 backdrop-blur-sm border border-slate-800 rounded-full text-[10px] font-mono font-bold text-sky-400">
              <Compass className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '6s' }} /> Micro-Market Hub Active
            </span>
          </div>
        </div>

        {/* Hero Bottom details */}
        <div className="absolute bottom-10 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex px-2.5 py-1 bg-sky-500/20 text-sky-300 text-[10px] font-mono uppercase tracking-widest font-bold rounded">
                📍 {location.city || 'Bangalore'} · Micro Market Region
              </span>
              {isLocationFeatured && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 text-amber-300 text-[10px] font-mono uppercase tracking-widest font-black rounded border border-amber-500/30">
                  <Star className="w-3 h-3 fill-amber-300" /> Premium Spot
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none">
              Explore {location.name}
            </h1>

            <p className="text-slate-300 text-sm max-w-2xl font-light leading-relaxed">
              {location.description || `Discover handpicked investment opportunities, prime properties, and elite growth prospects in ${location.name}.`}
            </p>
          </div>
        </div>
      </div>

      {/* 2. BODY CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Metrics & Highlights (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* MICRO-MARKET SIGNALS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              📊 Market Analytics & Indicators
            </h3>

            <div className="space-y-4 font-sans divide-y divide-slate-100/50">
              {/* Opportunities & Demands */}
              <div className="grid grid-cols-2 gap-4 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Opportunities</span>
                  <span className="text-xl font-mono font-black text-slate-800">
                    {location.availableOpportunities || 0}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Listed Properties</span>
                </div>

                <div className="space-y-1 border-l border-slate-100 pl-4">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Active Buyers</span>
                  <span className="text-xl font-mono font-black text-sky-600">
                    {location.activeRequirements || 0}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Demands Filed</span>
                </div>
              </div>

              {/* Average Budget & Highlights */}
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Growth Rate</span>
                  <span className="text-base font-mono font-black text-emerald-600 flex items-center gap-0.5">
                    <TrendingUp className="h-4 w-4 shrink-0" /> {location.growthRate || '+12.4%'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Year-over-Year</span>
                </div>

                <div className="space-y-1 border-l border-slate-100 pl-4">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Avg Property Value</span>
                  <span className="text-sm font-black text-slate-800 truncate block">
                    {location.avgPropertyValue || location.averageBudget || '₹1.5 Cr - ₹4.5 Cr'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Market Price Point</span>
                </div>
              </div>

              {/* Demand & Potential */}
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider font-mono">Demand Index</span>
                  <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 block text-center mt-1">
                    {location.demandLevel || 'High'}
                  </span>
                </div>

                <div className="space-y-1 border-l border-slate-100 pl-4">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider font-mono">ROI Potential</span>
                  <span className="text-xs font-black text-violet-605 bg-violet-50 px-2 py-0.5 rounded border border-violet-100 block text-center mt-1">
                    {location.investmentPotential || 'Strong'}
                  </span>
                </div>
              </div>

              {/* Site Visits */}
              <div className="pt-4 flex justify-between items-center text-xs text-slate-600">
                <span className="font-light">Official Site Walks:</span>
                <span className="font-mono font-extrabold text-indigo-600 bg-indigo-50/70 py-0.5 px-2 rounded-lg border border-indigo-100/50">
                  {location.siteVisits || 0} Registered Visits
                </span>
              </div>
            </div>
          </div>

          {/* KEY LOCATION HIGHLIGHTS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              💫 Key Area Highlights
            </h3>
            
            <p className="text-xs text-slate-600 leading-relaxed font-light">
              {location.locationHighlights || location.benefits || "Prime urban infrastructure, excellent connectivity routes, premium arterial layout and luxury investment options."}
            </p>

            <div className="pt-1.5 space-y-2">
              <div className="flex items-center gap-2 text-[11px] text-slate-550">
                <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>RERA Cleared Developments</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-550">
                <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Immediate Premium Site Walks</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-550">
                <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>High appreciation potential values</span>
              </div>
            </div>
          </div>

          {/* CONTACT CONCIERGE ASSISTANT */}
          <div className="bg-[#0a192f] text-white rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-sky-500/10 text-sky-400 border border-sky-500/25 rounded-xl">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-100 leading-snug">Concierge Team</h4>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Assigned to: {location.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-350 leading-relaxed font-light">
              Submit your bespoke requirements for {location.name}. Our expert appraisal agents will analyze live land registry records to find custom plots or luxury villa options instantly.
            </p>

            <div className="space-y-2.5 pt-1">
              <button
                onClick={onOpenCustomRequest}
                type="button"
                className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs transition duration-150 cursor-pointer text-center block shadow-sm shadow-sky-950"
              >
                Submit Requirement Brief
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Pre-filtered Catalogue listings (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* FILTERS CONTROL PANEL */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-sky-500" />
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider leading-none">
                  Available Catalog Opportunities
                </h3>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {locationProperties.length} handpicked listings belonging to {location.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 cursor-pointer outline-none"
              >
                <option value="All">All Types</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Plot">Plots (Land)</option>
                <option value="Commercial">Commercial</option>
              </select>

              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 cursor-pointer outline-none"
              >
                <option value="All">Any Budget</option>
                <option value="Under ₹1 Cr">Under ₹1.0 Cr</option>
                <option value="₹1 Cr - ₹3 Cr">₹1.0 Cr - ₹3.0 Cr</option>
                <option value="Over ₹3 Cr">Over ₹3.0 Cr</option>
              </select>
            </div>

          </div>

          {/* CATALOG OPPORTUNITIES LIST */}
          {locationProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-2">
              {locationProperties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  config={config}
                  template="Classic"
                  onViewDetails={() => onViewPropertyDetails(prop)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-3xs">
              <LayoutGrid className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-slate-850">No properties in matching visual range</h4>
                <p className="text-xs text-slate-450 max-w-sm mx-auto leading-relaxed font-light">
                  No active properties currently pre-linked to {location.name} match your budget or category filters.
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType('All');
                    setSelectedBudget('All');
                  }}
                  className="px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Clear Filters
                </button>
                <button
                  onClick={onOpenCustomRequest}
                  type="button"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
                >
                  Bespoke Sourcing Request
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
