import React from 'react';
import * as LucideIcons from 'lucide-react';
import { motion } from 'motion/react';
import { Property, PropertyTypeCard } from '../types';

interface PropertyTypesProps {
  selectedType: string;
  setSelectedType: (type: string) => void;
  scrollToListings: () => void;
  properties?: Property[];
  categories?: PropertyTypeCard[];
}

export default function PropertyTypes({ 
  selectedType, 
  setSelectedType, 
  scrollToListings,
  properties = [],
  categories = []
}: PropertyTypesProps) {
  
  const activeCategories = React.useMemo(() => {
    const list = categories.filter(c => c.status !== 'Disabled' && c.showInView !== false);
    if (list.length > 0) {
      return [...list].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }
    // Safe pre-seeded fallback
    return [
      { id: 'Apartment', title: 'Apartment', description: 'Stellar complexes', iconName: 'Building1', displayOrder: 1, status: 'Active', showInView: true, redirectUrl: '/properties?type=apartment' },
      { id: 'Villa', title: 'Villa', description: 'Luxury residences', iconName: 'Home', displayOrder: 2, status: 'Active', showInView: true, redirectUrl: '/properties?type=villa' },
      { id: 'Commercial', title: 'Commercial', description: 'Corporate estates', iconName: 'Building2', displayOrder: 3, status: 'Active', showInView: true, redirectUrl: '/properties?type=commercial' },
      { id: 'Plot', title: 'Plot', description: 'Premium Land', iconName: 'Map', displayOrder: 4, status: 'Active', showInView: true, redirectUrl: '/properties?type=plot' },
      { id: 'Warehouse', title: 'Warehouse', description: 'Industrial hubs', iconName: 'Warehouse', displayOrder: 5, status: 'Active', showInView: true, redirectUrl: '/properties?type=warehouse' },
      { id: 'Homestay', title: 'Homestay', description: 'Bespoke retreats', iconName: 'Hotel', displayOrder: 6, status: 'Active', showInView: true, redirectUrl: '/properties?type=homestay' }
    ] as PropertyTypeCard[];
  }, [categories]);

  const getCountForType = (typeId: string) => {
    return properties.filter(p => {
      if (!p.type) return false;
      const typeLower = p.type.toLowerCase();
      const idLower = typeId.toLowerCase();
      return typeLower.includes(idLower) || idLower.includes(typeLower);
    }).length;
  };

  const handleSelect = (cat: PropertyTypeCard) => {
    setSelectedType(cat.id);
    if (cat.redirectUrl) {
      window.history.pushState(null, '', cat.redirectUrl);
      window.dispatchEvent(new Event('popstate'));
    } else {
      const typeParam = cat.id.toLowerCase();
      const params = new URLSearchParams();
      params.set('type', typeParam);
      window.history.pushState(null, '', `/properties?${params.toString()}`);
      window.dispatchEvent(new Event('popstate'));
    }
    scrollToListings();
  };

  return (
    <section className="bg-[#0a192f] py-20 border-t border-slate-900" id="property-types-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="space-y-2 mb-12"
        >
          <span className="text-xs uppercase tracking-widest text-[#ff5a3c] font-black font-mono">
            Property By Requirement
          </span>
          <h2 className="text-3xl sm:text-4xl font-sans font-bold text-white tracking-tight">
            Explore Project Types
          </h2>
          <div className="w-12 h-1 bg-[#ff5a3c] mx-auto rounded-full mt-3"></div>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6" id="categories-card-grid">
          {activeCategories.map((cat, idx) => {
            const IconComponent = (LucideIcons as any)[cat.iconName || 'Building2'] || LucideIcons.Building2;
            const count = getCountForType(cat.id);
            const isSelected = selectedType === cat.id;

            return (
              <motion.div
                key={cat.id}
                id={`cat-card-${cat.id.toLowerCase()}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                onClick={() => handleSelect(cat)}
                className={`group relative p-6 sm:p-8 rounded-2xl border transition-all duration-300 cursor-pointer text-center flex flex-col items-center justify-between min-h-[190px] ${
                  isSelected
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-[#ff5a3c] shadow-lg shadow-orange-950/20'
                    : 'bg-slate-900/40 border-slate-850 hover:bg-slate-900/90 hover:border-slate-700'
                }`}
              >
                {/* Visual Accent for selected/hover states */}
                <div className={`absolute top-0 inset-x-0 h-1 rounded-t-2xl transition ${
                  isSelected ? 'bg-[#ff5a3c]' : 'bg-transparent group-hover:bg-slate-700'
                }`} />

                {/* Icon Container with subtle ring */}
                <div className={`p-4 rounded-xl transition duration-300 ${
                  isSelected
                    ? 'bg-[#ff5a3c] text-white shadow-md'
                    : 'bg-slate-800/40 text-slate-300 group-hover:bg-slate-800 group-hover:text-[#ff5a3c]'
                }`}>
                  <IconComponent className="h-7 w-7" />
                </div>

                {/* Name */}
                <div className="mt-5 space-y-1">
                  <h3 className="font-sans font-bold text-sm sm:text-base text-white tracking-wide">
                    {cat.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                    {cat.description}
                  </p>
                </div>

                {/* Properties Count */}
                <div className="mt-4">
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full transition ${
                    isSelected
                      ? 'bg-orange-950/50 text-[#ff5a3c] border border-orange-500/20'
                      : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                  }`}>
                    {count} {count === 1 ? 'Project' : 'Projects'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
