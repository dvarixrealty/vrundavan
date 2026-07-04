import React from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, Bed, Bath, Ruler, Star, ShieldCheck, TrendingUp, Sparkles, 
  Building2, Calendar, User, DollarSign, Percent, Award, Compass 
} from 'lucide-react';
import { Property, PropertyCardConfig, PropertyCardTemplate } from '../types';

interface PropertyCardProps {
  key?: string | number;
  property: Property;
  onViewDetails: (p: Property) => void;
  config?: PropertyCardConfig;
  template?: PropertyCardTemplate;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export function formatCurrencyIndia(num: number): string {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(1)} Lakhs`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

const DEFAULT_CONFIG: PropertyCardConfig = {
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
  showAgentInformation: false,
};

export default function PropertyCard({
  property,
  onViewDetails,
  config = DEFAULT_CONFIG,
  template = 'Classic',
  isFavorite = false,
  onToggleFavorite,
}: PropertyCardProps) {
  // Merge default config with prop config
  const activeConfig = { ...DEFAULT_CONFIG, ...config };

  // Helper values
  const hasVerifiedBadge = property.badgeVerified || property.featured || activeConfig.showVerifiedBadge;
  const isFeatured = property.badgeFeatured || property.featured || false;
  const displayTitle = activeConfig.showProjectName && property.projectName 
    ? `${property.projectName} / ${property.title}` 
    : property.title;

  const displayLocation = property.locationName || property.address || "JP Nagar, Bengaluru";

  // Check if we should render particular badges
  const renderTopBadge = () => {
    if (activeConfig.showVerifiedBadge && (property.badgeVerified || true)) {
      return (
        <span className="flex items-center gap-1 bg-sky-50 text-sky-700 font-mono font-bold text-[10px] uppercase px-2.5 py-1 rounded-lg border border-sky-100 shadow-3xs">
          <ShieldCheck className="h-3 w-3 text-sky-500 shrink-0" /> Verified Listing
        </span>
      );
    }
    if (activeConfig.showFeaturedBadge && isFeatured) {
      return (
        <span className="flex items-center gap-1 bg-amber-50 text-amber-700 font-mono font-bold text-[10px] uppercase px-2.5 py-1 rounded-lg border border-amber-100 shadow-3xs">
          <Sparkles className="h-3 w-3 text-amber-500 shrink-0 animate-pulse" /> Gold Class
        </span>
      );
    }
    return null;
  };

  const renderSecondaryBadge = () => {
    if (activeConfig.showDemandLevel) {
      const demand = property.demandLevel || "High Demand";
      return (
        <span className="flex items-center gap-1 bg-[#ff5a3c]/10 text-[#ff5a3c] font-mono font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-lg border border-[#ff5a3c]/15">
          <TrendingUp className="h-3 w-3" /> {demand}
        </span>
      );
    }
    return null;
  };

  // Switch between visual templates
  switch (template) {
    case 'Minimal':
      return (
        <motion.article 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="bg-white border-0 border-b border-slate-100 hover:border-slate-300 py-6 flex flex-col sm:flex-row gap-5 justify-between group transition-all"
          id={`property-card-minimal-${property.id}`}
        >
          {activeConfig.showPropertyType && (
            <div className="sm:hidden text-sky-500 text-[10px] font-bold tracking-widest uppercase mb-1">
              {property.type}
            </div>
          )}
          <div className="flex-1 space-y-2 text-left">
            <div className="space-y-1">
              {activeConfig.showLocation && (
                <div className="text-slate-450 text-[10px] font-mono tracking-wider flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" /> {displayLocation}
                </div>
              )}
              <h4 
                onClick={() => onViewDetails(property)}
                className="text-base font-bold text-slate-800 tracking-tight leading-snug cursor-pointer hover:text-sky-500 transition line-clamp-1"
              >
                {displayTitle}
              </h4>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-slate-500 text-[11px] font-medium pt-1">
              {activeConfig.showArea && (
                <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                  <Ruler className="h-3.5 w-3.5 text-slate-400" /> {property.sqft} Sq.Ft
                </span>
              )}
              {property.beds > 0 && (
                <span>🛏️ {property.beds} BHK</span>
              )}
              {property.baths > 0 && (
                <span>🛁 {property.baths} Bath</span>
              )}
            </div>
          </div>

          <div className="flex sm:flex-col justify-between items-end sm:text-right gap-3 shrink-0">
            {activeConfig.showPrice && (
              <span className="text-slate-900 font-extrabold text-base sm:text-lg font-mono">
                {formatCurrencyIndia(property.price)}
              </span>
            )}
            <button
              onClick={() => onViewDetails(property)}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group/btn cursor-pointer bg-sky-50/50 hover:bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100 transition"
            >
              Examine Profile &rarr;
            </button>
          </div>
        </motion.article>
      );

    case 'Investment':
      return (
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-slate-50/50 border border-slate-200/80 rounded-2xl overflow-hidden hover:bg-white hover:border-sky-305 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          id={`property-card-investment-${property.id}`}
        >
          <div>
            <div className="relative h-44 bg-slate-105 overflow-hidden">
              <img 
                src={property.image} 
                alt={property.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {renderTopBadge()}
              </div>

              {activeConfig.showInvestmentScore && (
                <div className="absolute bottom-3 left-3 bg-slate-900/90 text-white font-mono text-[10px] font-black px-2 py-1 rounded-md border border-slate-800 flex items-center gap-1 shadow-sm">
                  <Award className="h-3 w-3 text-amber-500" /> Scor: {property.investmentScore || 85}/100
                </div>
              )}
            </div>

            <div className="p-4 space-y-3.5 text-left">
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-1">
                  {activeConfig.showPropertyType && (
                    <span className="text-[9px] font-mono tracking-widest uppercase font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                      {property.type}
                    </span>
                  )}
                  <h4 
                    onClick={() => onViewDetails(property)}
                    className="text-sm font-extrabold text-slate-805 tracking-tight hover:text-sky-600 transition duration-150 cursor-pointer line-clamp-1"
                  >
                    {displayTitle}
                  </h4>
                </div>
                {activeConfig.showPrice && (
                  <span className="text-slate-900 font-extrabold font-mono text-sm shrink-0">
                    {formatCurrencyIndia(property.price)}
                  </span>
                )}
              </div>

              {/* ROI & Highlights Panel */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-sky-50/30 rounded-xl border border-sky-100/50 text-[10.5px]">
                <div className="space-y-0.5 border-r border-slate-200/50">
                  <span className="text-slate-400 block uppercase tracking-wider font-bold text-[8px]">Expected ROI</span>
                  <span className="font-extrabold text-slate-700 flex items-center gap-0.5">
                    <Percent className="h-3 w-3 text-emerald-500" /> {property.expectedROI || "9.6% p.a."}
                  </span>
                </div>
                <div className="space-y-0.5 pl-1.5">
                  <span className="text-slate-400 block uppercase tracking-wider font-bold text-[8px]">Appreciation</span>
                  <span className="font-extrabold text-emerald-650 font-mono tracking-tight text-[10px]">
                    {property.appreciationPotential || "Very High"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-3">
                {activeConfig.showArea && (
                  <span className="font-mono">{property.sqft} Sq.Ft size</span>
                )}
                {renderSecondaryBadge()}
              </div>
            </div>
          </div>

          <div className="p-4 pt-0">
            <button
              onClick={() => onViewDetails(property)}
              className="w-full bg-slate-900 hover:bg-sky-500 text-white border border-slate-900 hover:border-sky-500 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Analyse Ledger
            </button>
          </div>
        </motion.article>
      );

    case 'Commercial':
      return (
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-sky-305 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          id={`property-card-commercial-${property.id}`}
        >
          <div>
            <div className="relative h-44 bg-slate-105 overflow-hidden">
              <img 
                src={property.image} 
                alt={property.title} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3">
                <span className="bg-slate-900 text-white font-mono font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow">
                  Corporate Asset
                </span>
              </div>
              <div className="absolute top-3 right-3">
                {renderTopBadge()}
              </div>
            </div>

            <div className="p-4 space-y-3.5 text-left">
              <div className="space-y-1">
                {activeConfig.showLocation && (
                  <span className="text-[10px] text-slate-400 block font-semibold truncate">
                    📍 {displayLocation}
                  </span>
                )}
                <h4 
                  onClick={() => onViewDetails(property)}
                  className="text-sm font-extrabold text-slate-800 tracking-tight leading-snug cursor-pointer hover:text-sky-500"
                >
                  {displayTitle}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono font-semibold pt-1">
                <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[8px] uppercase">RERA Compliance</span>
                  <span className="text-slate-700 block mt-0.5 truncate">{property.reraNumber || "Approved (Ack: 3324)"}</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[8px] uppercase">Possession Status</span>
                  <span className="text-sky-650 block mt-0.5 truncate">{property.possessionDate || "Ready to Move"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] border-t border-slate-100 pt-3">
                {activeConfig.showPrice && (
                  <span className="text-slate-950 font-black text-sm font-mono">
                    {formatCurrencyIndia(property.price)}
                  </span>
                )}
                {activeConfig.showArea && (
                  <span className="text-slate-400 font-mono font-bold">{property.sqft} Sq.Ft Area</span>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 pt-0">
            <button
              onClick={() => onViewDetails(property)}
              className="w-full bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-205 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer"
            >
              Inspect Premises Portfolio
            </button>
          </div>
        </motion.article>
      );

    case 'Luxury':
      return (
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white border-2 border-slate-950/90 rounded-2xl overflow-hidden shadow-sm relative hover:shadow-2xl transition-all duration-400 flex flex-col justify-between"
          id={`property-card-luxury-${property.id}`}
        >
          <div>
            <div className="relative h-48 bg-slate-105 overflow-hidden">
              <img 
                src={property.image} 
                alt={property.title} 
                className="w-full h-full object-cover filter brightness-95" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-slate-950 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded shadow text-[9px] font-mono tracking-widest uppercase font-extrabold flex items-center gap-1.5">
                <Compass className="h-3 w-3 text-amber-500 animate-spin-slow shrink-0" /> Premier Collection
              </div>
              <div className="absolute bottom-3 right-3">
                {renderTopBadge()}
              </div>
            </div>

            <div className="p-5 space-y-4 text-left">
              <div className="space-y-1">
                {activeConfig.showLocation && (
                  <span className="text-[10px] text-amber-600 uppercase tracking-widest font-mono font-bold block">
                    👑 {displayLocation}
                  </span>
                )}
                <h4 
                  onClick={() => onViewDetails(property)}
                  className="text-base font-bold text-slate-900 tracking-tight leading-snug font-serif hover:text-amber-600 transition duration-150 cursor-pointer line-clamp-1"
                >
                  {displayTitle}
                </h4>
              </div>

              {/* Specifications premium tracker */}
              <div className="flex border-t border-b border-slate-100 py-3 text-slate-550 text-xs font-medium justify-between font-serif">
                {activeConfig.showArea && (
                  <span className="block italic">{property.sqft} sqft premium area</span>
                )}
                <span className="h-4 w-px bg-slate-100"></span>
                <span>{property.beds > 0 ? `${property.beds} Bedrooms` : 'Bespoke Block'}</span>
              </div>

              {activeConfig.showPrice && (
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">Premium Valuation</span>
                  <span className="text-slate-950 text-lg font-black font-mono">
                    {formatCurrencyIndia(property.price)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-5 pt-0">
            <button
              onClick={() => onViewDetails(property)}
              className="w-full bg-slate-950 text-amber-300 hover:text-white border border-slate-950 hover:bg-slate-900 py-3 rounded-xl text-xs font-serif font-black tracking-widest uppercase transition flex items-center justify-center cursor-pointer shadow"
            >
              Request Private Showing
            </button>
          </div>
        </motion.article>
      );

    case 'Modern':
      return (
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-350 flex flex-col justify-between"
          id={`property-card-modern-${property.id}`}
        >
          <div>
            <div className="relative h-50 bg-slate-105 overflow-hidden">
              <img 
                src={property.image} 
                alt={property.title} 
                className="w-full h-full object-cover transform hover:scale-105 transition duration-500" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3">
                {renderTopBadge()}
              </div>

              {activeConfig.showPrice && (
                <div className="absolute bottom-3 right-3 bg-white border border-slate-100 px-3 py-1 rounded-xl shadow-md font-mono font-black text-sky-600 text-xs">
                  {formatCurrencyIndia(property.price)}
                </div>
              )}
            </div>

            <div className="p-5 space-y-4 text-left">
              <div className="space-y-1">
                {activeConfig.showPropertyType && (
                  <span className="text-[10px] font-mono tracking-widest uppercase font-extrabold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    {property.type}
                  </span>
                )}
                <h4 
                  onClick={() => onViewDetails(property)}
                  className="text-base font-extrabold text-slate-800 tracking-tight leading-snug cursor-pointer hover:text-sky-500 pt-1 duration-150 line-clamp-1"
                >
                  {displayTitle}
                </h4>
                {activeConfig.showLocation && (
                  <div className="flex items-center text-slate-450 gap-0.5 text-xs truncate mt-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{displayLocation}</span>
                  </div>
                )}
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500 font-mono py-2 bg-slate-50 border border-slate-100 rounded-xl p-2">
                {activeConfig.showArea && (
                  <div className="flex items-center gap-1">
                    <Ruler className="h-3.5 w-3.5 text-slate-400" />
                    <span>{property.sqft} Sq.Ft</span>
                  </div>
                )}
                {property.beds > 0 && (
                  <div className="flex items-center gap-1">
                    <Bed className="h-3.5 w-3.5 text-slate-400" />
                    <span>{property.beds} BHK Rooms</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-5 pt-0">
            <button
              onClick={() => onViewDetails(property)}
              className="w-full bg-sky-50 hover:bg-sky-500 text-sky-605 hover:text-white border border-sky-100 py-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
            >
              Explore Layout
            </button>
          </div>
        </motion.article>
      );

    case 'Classic':
    case 'Custom':
    default:
      return (
        <motion.article 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          id={`property-card-default-${property.id}`}
        >
          <div>
            <div className="relative h-48 bg-slate-105 overflow-hidden">
              <img 
                src={property.image} 
                alt={property.title} 
                className="w-full h-full object-cover hover:scale-103 transition duration-300" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {renderTopBadge()}
              </div>
              <div className="absolute bottom-3 right-3 flex gap-1.5">
                {renderSecondaryBadge()}
              </div>
            </div>

            <div className="p-5 space-y-3.5 text-left">
              <div className="space-y-1">
                {activeConfig.showPropertyType && (
                  <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 font-mono uppercase tracking-widest font-extrabold px-2 py-0.5 rounded-lg inline-block shadow-3xs">
                    {property.type}
                  </span>
                )}
                <h4 
                  onClick={() => onViewDetails(property)}
                  className="text-sm font-extrabold text-slate-800 tracking-tight leading-normal hover:text-sky-500 transition cursor-pointer line-clamp-1"
                >
                  {displayTitle}
                </h4>
              </div>

              {activeConfig.showLocation && (
                <div className="flex items-center text-slate-450 space-x-1 text-xs">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate text-[10px]">{displayLocation}</span>
                </div>
              )}

              {/* Description */}
              <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                {property.description}
              </p>

              {/* Area & Specifications Row */}
              <div className="flex items-center gap-4 text-xs font-mono font-bold text-slate-500 border-t border-b border-slate-50 py-3 justify-between">
                {activeConfig.showArea && (
                  <div className="flex items-center gap-1">
                    <Ruler className="h-3.5 w-3.5 text-slate-400" />
                    <span>{property.sqft} Sq.Ft</span>
                  </div>
                )}
                {property.beds > 0 && (
                  <div className="flex items-center gap-1">
                    <Bed className="h-3.5 w-3.5 text-slate-400" />
                    <span>{property.beds} BHK</span>
                  </div>
                )}
                {property.baths > 0 && (
                  <div className="flex items-center gap-1">
                    <Bath className="h-3.5 w-3.5 text-slate-400" />
                    <span>{property.baths} Bath</span>
                  </div>
                )}
              </div>

              {/* Builder / Project info if enabled */}
              {(activeConfig.showBuilderName && property.builderName) || (activeConfig.showPossessionDate && property.possessionDate) ? (
                <div className="text-[10px] text-slate-450 bg-slate-50 border border-slate-100 rounded-xl p-2 space-y-0.5">
                  {activeConfig.showBuilderName && property.builderName && (
                    <div><span className="font-bold text-slate-400">Builder:</span> {property.builderName}</div>
                  )}
                  {activeConfig.showPossessionDate && property.possessionDate && (
                    <div><span className="font-bold text-slate-400">Possession:</span> {property.possessionDate}</div>
                  )}
                </div>
              ) : null}

              {/* Agent info if checked */}
              {activeConfig.showAgentInformation && property.agent && (
                <div className="flex items-center gap-2 p-2 border border-slate-100 bg-slate-50/50 rounded-xl">
                  <img src={property.agent.avatar} alt={property.agent.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                  <div className="text-[10px]">
                    <span className="font-bold text-slate-700 block line-clamp-1">{property.agent.name}</span>
                    <span className="text-slate-400 block tracking-tight line-clamp-1">{property.agent.role}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="px-5 pb-5 pt-1 bg-white flex items-center justify-between border-t border-slate-50">
            {activeConfig.showPrice && (
              <div>
                <span className="block text-[8px] text-slate-400 uppercase tracking-widest font-extrabold font-mono">VALUATION price</span>
                <span className="text-[#ff5a3c] text-base font-extrabold tracking-tight">
                  {formatCurrencyIndia(property.price)}
                </span>
              </div>
            )}

            <button
              onClick={() => onViewDetails(property)}
              className="bg-slate-900 hover:bg-[#ff5a3c] text-white font-mono font-bold text-[10px] tracking-widest uppercase px-3.5 py-2.5 rounded-xl transition duration-200 shadow-md hover:translate-x-0.5 shrink-0 cursor-pointer"
            >
              Analyze
            </button>
          </div>
        </motion.article>
      );
  }
}
