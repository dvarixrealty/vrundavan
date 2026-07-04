import React, { useState, useMemo, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { 
  Building2, MapPin, Ruler, Bed, Bath, ArrowRight, Heart, Search, 
  ChevronRight, ChevronDown, Check, SlidersHorizontal, Grid, List, 
  Sparkles, ShieldCheck, Clock, User, Phone, Mail, Award, Compass,
  TrendingUp, CheckSquare, Plus, Star, Landmark, ShieldCheck as ShieldIcon,
  DollarSign, HelpCircle, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Property, SearchCategory } from '../types';

interface PropertiesPageViewProps {
  properties: Property[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
  onViewDetails: (property: Property) => void;
  onOpenCustomRequest: () => void;
  onOpenSiteVisit: () => void;
  setBookingTargetProperty: (property: Property | null) => void;
  searchCategories: SearchCategory[];
}

export default function PropertiesPageView({
  properties,
  favorites,
  toggleFavorite,
  onViewDetails,
  onOpenCustomRequest,
  onOpenSiteVisit,
  setBookingTargetProperty,
  searchCategories = []
}: PropertiesPageViewProps) {
  
  // -------------------------------------------------------------
  // Dynamic Localization Parsing & Locality mappings
  // -------------------------------------------------------------
  const getPropertyLocality = (p: Property) => {
    if (p.locationName) return p.locationName;
    const parts = p.address.split(',');
    if (parts.length > 1) {
      // Find the second to last component (e.g. JP Nagar, Bangalore)
      for (let i = parts.length - 2; i >= 0; i--) {
        const chunk = parts[i].trim();
        if (chunk && !['Bangalore', 'Bengaluru', 'Karnataka', 'India'].includes(chunk)) {
          return chunk;
        }
      }
      return parts[0].trim();
    }
    return p.location || "Devarahalli";
  };

  // Extract list of all unique localities across properties dynamically
  const uniqueLocalities = useMemo(() => {
    const list = properties.map(p => getPropertyLocality(p));
    const unique = Array.from(new Set(list)).filter(Boolean);
    // Prioritize popular ones but ensure dynamic additions exist
    const defaultLocalities = ["Whitefield", "Sarjapur Road", "Electronic City", "JP Nagar", "Koramangala", "HSR Layout", "Indiranagar", "Devanahalli", "Yelahanka"];
    
    // Merge both
    const merged = Array.from(new Set([...defaultLocalities, ...unique]));
    return merged;
  }, [properties]);

  // Unique property types
  const uniqueTypes = useMemo(() => {
    const list = properties.map(p => p.type);
    const unique = Array.from(new Set(list)).filter(Boolean);
    const defaultTypes = ["Plots", "Apartments", "Villas", "Commercial", "Warehouse", "Homestay"];
    return Array.from(new Set([...defaultTypes, ...unique]));
  }, [properties]);

  // -------------------------------------------------------------
  // Filter States
  // -------------------------------------------------------------
  const [keyword, setKeyword] = useState('');
  const [locationSelect, setLocationSelect] = useState('All');
  const [typeSelect, setTypeSelect] = useState('All');
  const [budgetRangeFilter, setBudgetRangeFilter] = useState('All'); // For the Hero dropdown

  // Sidebar Filter Sidebar States
  const [sidebarTypes, setSidebarTypes] = useState<string[]>([]); // Array of selected types
  const [sidebarLocations, setSidebarLocations] = useState<string[]>([]); // Array of selected locations
  const [budgetMultiplier, setBudgetMultiplier] = useState(10); // Standard slider representing crore percentage (up to 10 Cr)
  const [sidebarStatus, setSidebarStatus] = useState<string>('All'); // All, Under Construction, Ready to Move
  const [searchTermLoc, setSearchTermLoc] = useState(''); // Locality sidebar filter keyword
  const [showAllLocationsSidebar, setShowAllLocationsSidebar] = useState(false);

  // Layout & Sorting States
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('Properties'); // 'Properties' (All), 'Plots', 'Apartments', etc.
  const [sortBy, setSortBy] = useState('Relevance'); // Relevance, PriceLowHigh, PriceHighLow, AreaBigSmall
  const [isListView, setIsListView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Track applied hero searches
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState('');
  const [appliedSearchLocation, setAppliedSearchLocation] = useState('All');
  const [appliedSearchType, setAppliedSearchType] = useState('All');
  const [appliedSearchBudget, setAppliedSearchBudget] = useState('All');
  const [appliedSearchFilter, setAppliedSearchFilter] = useState('All');

  // Trigger search from Hero Section
  const handleHeroSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAppliedSearchKeyword(keyword);
    setAppliedSearchLocation(locationSelect);
    setAppliedSearchType(typeSelect);
    setAppliedSearchBudget(budgetRangeFilter);
    setCurrentPage(1);

    // Sync categories tab if location/type triggers
    if (typeSelect !== 'All') {
      // Map to tab label
      const matchedTab = mapTypeToTab(typeSelect);
      if (matchedTab) setSelectedCategoryTab(matchedTab);
    }
  };

  // Helper mapping from type select options to Tab categories
  const mapTypeToTab = (type: string) => {
    if (type.toLowerCase().includes('plot')) return 'Plots';
    if (type.toLowerCase().includes('apartment')) return 'Apartments';
    if (type.toLowerCase().includes('villa')) return 'Villas';
    if (type.toLowerCase().includes('commercial')) return 'Commercial';
    if (type.toLowerCase().includes('warehouse')) return 'Warehouses';
    return 'Properties';
  };

  // Handle direct Popular searches click
  const handlePopularSearchClick = (loc: string) => {
    setLocationSelect(loc);
    setAppliedSearchLocation(loc);
    setCurrentPage(1);
  };

  // Clear All Sidebar Filters
  const handleClearFilters = () => {
    setSidebarTypes([]);
    setSidebarLocations([]);
    setBudgetMultiplier(10);
    setSidebarStatus('All');
    setKeyword('');
    setLocationSelect('All');
    setTypeSelect('All');
    setBudgetRangeFilter('All');
    setAppliedSearchKeyword('');
    setAppliedSearchLocation('All');
    setAppliedSearchType('All');
    setAppliedSearchBudget('All');
    setSelectedCategoryTab('Properties');
    setCurrentPage(1);
  };

  // Curate dynamic Featured Opportunities (Bangalore high level or flagged featured)
  const featuredProperties = useMemo(() => {
    // Prioritize properties marked as featured or with high prices (luxury portfolio)
    let list = properties.filter(p => p.featured || p.badgeFeatured);
    if (list.length === 0) {
      // Fallback: take top 4 highest rated or valued properties
      list = [...properties].sort((a,b) => b.rating - a.rating);
    }
    return list.slice(0, 4);
  }, [properties]);

  // Dynamic category tabs memo
  const activeSearchCategories = useMemo(() => {
    const list = searchCategories.filter(c => c.status === 'Active' && c.showInView !== false);
    if (list.length > 0) {
      return [...list].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }
    return [
      { id: 'Properties', title: 'Properties', iconName: 'Building2', displayOrder: 1, status: 'Active', showInView: true, isDefault: true },
      { id: 'Plots', title: 'Plots', iconName: 'Landmark', displayOrder: 2, status: 'Active', showInView: true },
      { id: 'Apartments', title: 'Apartments', iconName: 'Building2', displayOrder: 3, status: 'Active', showInView: true },
      { id: 'Villas', title: 'Villas', iconName: 'Compass', displayOrder: 4, status: 'Active', showInView: true },
      { id: 'Commercial', title: 'Commercial', iconName: 'Award', displayOrder: 5, status: 'Active', showInView: true },
      { id: 'House for Rent', title: 'House for Rent', iconName: 'Clock', displayOrder: 6, status: 'Active', showInView: true },
      { id: 'PG / Stay', title: 'PG / Stay', iconName: 'Bed', displayOrder: 7, status: 'Active', showInView: true },
      { id: 'Warehouses', title: 'Warehouses', iconName: 'Ruler', displayOrder: 8, status: 'Active', showInView: true }
    ] as SearchCategory[];
  }, [searchCategories]);

  // Set default active tab dynamically on load if no custom url parameter is present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get('type') && searchCategories.length > 0) {
      const found = searchCategories.find(c => c.isDefault && c.status === 'Active');
      if (found) {
        setSelectedCategoryTab(found.id);
      }
    }
  }, [searchCategories]);

  // -------------------------------------------------------------
  // Filter and Sort properties
  // -------------------------------------------------------------
  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      // 1. Tab category filter logic
      if (selectedCategoryTab && selectedCategoryTab !== 'Properties' && selectedCategoryTab !== 'All') {
        const activeTabObj = activeSearchCategories.find(c => c.id === selectedCategoryTab);
        const tabLabel = activeTabObj ? activeTabObj.title : selectedCategoryTab;
        const tabLower = tabLabel.toLowerCase();
        const typeLower = p.type.toLowerCase();
        
        // Match standard categories with custom precise matchers
        if (tabLower.includes('plot') && !typeLower.includes('plot')) return false;
        else if (tabLower.includes('apartment') && !typeLower.includes('apartment')) return false;
        else if (tabLower.includes('villa') && !typeLower.includes('villa')) return false;
        else if (tabLower.includes('commercial') && !typeLower.includes('commercial')) return false;
        else if (tabLower.includes('warehouse') && !typeLower.includes('warehouse')) return false;
        else if (tabLower.includes('rent') || tabLower.includes('rental')) {
          const isRent = p.status?.toLowerCase().includes('rent') || p.price <= 200020;
          if (!isRent) return false;
        }
        else if (tabLower.includes('pg') || tabLower.includes('stay') || tabLower.includes('hostel')) {
          const isStay = typeLower.includes('homestay') || typeLower.includes('pg') || p.title.toLowerCase().includes('colive') || p.description.toLowerCase().includes('pg') || p.type.toLowerCase().includes('stay');
          if (!isStay) return false;
        }
        else {
          // Custom category generic match (case-insensitive substring check across type/title/description)
          const matchCustom = typeLower.includes(tabLower) || p.title.toLowerCase().includes(tabLower) || p.description.toLowerCase().includes(tabLower);
          if (!matchCustom) return false;
        }
      }

      // 2. Applied Hero Keyword Search
      if (appliedSearchKeyword) {
        const query = appliedSearchKeyword.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(query) || (p.projectName && p.projectName.toLowerCase().includes(query));
        const matchDesc = p.description.toLowerCase().includes(query);
        const matchLoc = p.location.toLowerCase().includes(query) || 
                         getPropertyLocality(p).toLowerCase().includes(query) || 
                         (p.address && p.address.toLowerCase().includes(query)) ||
                         (p.city && p.city.toLowerCase().includes(query)) ||
                         (p.locationName && p.locationName.toLowerCase().includes(query));
                         
        const matchId = p.id.toLowerCase().includes(query) || (p.code && p.code.toLowerCase().includes(query));
        
        // Match with category ID or resolved category title from searchCategories
        const matchCategory = p.type.toLowerCase().includes(query) || 
                              searchCategories.some(c => c.id === p.type && c.title.toLowerCase().includes(query));
                              
        const matchBuilder = p.builderName && p.builderName.toLowerCase().includes(query);
        const matchAmenities = p.amenities && p.amenities.some(tag => tag.toLowerCase().includes(query));
        
        if (!matchTitle && !matchDesc && !matchLoc && !matchId && !matchCategory && !matchBuilder && !matchAmenities) return false;
      }

      // 3. Applied Hero Location Selector
      if (appliedSearchLocation !== 'All') {
        const query = appliedSearchLocation.toLowerCase();
        const pLocality = getPropertyLocality(p).toLowerCase();
        const pCity = p.location.toLowerCase();
        if (!pLocality.includes(query) && !pCity.includes(query)) return false;
      }

      // 4. Applied Hero Type Selector
      if (appliedSearchType !== 'All') {
        const query = appliedSearchType.toLowerCase();
        if (!p.type.toLowerCase().includes(query)) return false;
      }

      // 5. Applied Hero Budget dropdown limit
      if (appliedSearchBudget !== 'All') {
        if (appliedSearchBudget === 'Under 50 Lakhs' && p.price >= 5000000) return false;
        if (appliedSearchBudget === '50 Lakhs - 1.5 Cr' && (p.price < 5000000 || p.price > 15000000)) return false;
        if (appliedSearchBudget === '1.5 Cr - 3 Cr' && (p.price < 15000000 || p.price > 30000000)) return false;
        if (appliedSearchBudget === '3 Cr - 5 Cr' && (p.price < 30000000 || p.price > 50000000)) return false;
        if (appliedSearchBudget === 'Above 5 Cr' && p.price < 50000000) return false;
      }

      // 6. Sidebar Types Multi-select
      if (sidebarTypes.length > 0) {
        const matchType = sidebarTypes.some(t => {
          const tLower = t.toLowerCase();
          const pLower = p.type.toLowerCase();
          if (tLower === 'plots') return pLower.includes('plot');
          if (tLower === 'apartments') return pLower.includes('apartment');
          if (tLower === 'villas') return pLower.includes('villa');
          if (tLower === 'commercial') return pLower.includes('commercial');
          if (tLower === 'warehouses') return pLower.includes('warehouse');
          if (tLower === 'pg / stay') return pLower.includes('homestay') || pLower.includes('pg') || p.title.toLowerCase().includes('colive');
          if (tLower === 'house for rent') return pLower.includes('rent') || p.price <= 200000;
          return pLower.includes(tLower);
        });
        if (!matchType) return false;
      }

      // 7. Sidebar Locations Multi-select
      if (sidebarLocations.length > 0) {
        const pLocality = getPropertyLocality(p).toLowerCase();
        const matchLoc = sidebarLocations.some(loc => pLocality.includes(loc.toLowerCase()));
        if (!matchLoc) return false;
      }

      // 8. Sidebar Budget Slider (Value represents Max budget in crores: range 0.5 to 10 Cr)
      const maxAllowedPrice = budgetMultiplier * 10000000; // crores to INR
      if (p.price > maxAllowedPrice) return false;

      // 9. Sidebar Property Status (Ready, Under construction, etc)
      if (sidebarStatus !== 'All') {
        const pStatus = p.developmentStatus || p.status || 'Ready';
        if (sidebarStatus === 'Ready to Move' && !pStatus.toLowerCase().includes('ready')) return false;
        if (sidebarStatus === 'Under Construction' && !pStatus.toLowerCase().includes('construction') && !pStatus.toLowerCase().includes('under')) return false;
      }

      // 10. Associated Custom Hero Quick Filter
      if (appliedSearchFilter && appliedSearchFilter !== 'All') {
        const fQuery = appliedSearchFilter.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(fQuery);
        const matchDesc = p.description.toLowerCase().includes(fQuery);
        const matchTags = p.amenities && p.amenities.some(tag => tag.toLowerCase().includes(fQuery));
        const matchType = p.type.toLowerCase().includes(fQuery);
        if (!matchTitle && !matchDesc && !matchTags && !matchType) return false;
      }

      return true;
    });
  }, [properties, selectedCategoryTab, appliedSearchKeyword, appliedSearchLocation, appliedSearchType, appliedSearchBudget, sidebarTypes, sidebarLocations, budgetMultiplier, sidebarStatus, appliedSearchFilter]);

  // Sorting
  const sortedProperties = useMemo(() => {
    const list = [...filteredProperties];
    if (sortBy === 'PriceLowHigh') {
      return list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'PriceHighLow') {
      return list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'AreaBigSmall') {
      return list.sort((a, b) => b.sqft - a.sqft);
    }
    // Default or Relevance
    return list;
  }, [filteredProperties, sortBy]);

  // Pagination bounds
  const totalPages = Math.ceil(sortedProperties.length / itemsPerPage) || 1;
  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProperties.slice(start, start + itemsPerPage);
  }, [sortedProperties, currentPage]);

  // Scroll listings to top when page changes
  useEffect(() => {
    const el = document.getElementById('listings-layout-view');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage, selectedCategoryTab]);

  // Support automatic deep filter loading from URL search query parameters (e.g. key-values representation)
  useEffect(() => {
    const parseUrlFilters = () => {
      const params = new URLSearchParams(window.location.search);
      const typeParam = params.get('type');
      const locationParam = params.get('location');
      const searchParam = params.get('search') || params.get('q');

      if (typeParam) {
        const t = typeParam.toLowerCase().trim();
        if (t.includes('plot')) {
          setSelectedCategoryTab('Plots');
        } else if (t.includes('apartment')) {
          setSelectedCategoryTab('Apartments');
        } else if (t.includes('villa')) {
          setSelectedCategoryTab('Villas');
        } else if (t.includes('commercial')) {
          setSelectedCategoryTab('Commercial');
        } else if (t.includes('rent') || t.includes('rental')) {
          setSelectedCategoryTab('House for Rent');
        } else if (t.includes('pg') || t.includes('stay')) {
          setSelectedCategoryTab('PG / Stay');
        } else if (t.includes('warehouse')) {
          setSelectedCategoryTab('Warehouses');
        } else {
          const matchingTypeOption = uniqueTypes.find(opt => opt.toLowerCase().includes(t));
          if (matchingTypeOption) {
            setTypeSelect(matchingTypeOption);
            setAppliedSearchType(matchingTypeOption);
          }
        }
      }

      if (locationParam) {
        const loc = locationParam.trim();
        // Case-insensitive match from uniqueLocalities list
        const matchedLoc = uniqueLocalities.find(opt => opt.toLowerCase() === loc.toLowerCase()) || 
                            uniqueLocalities.find(opt => opt.toLowerCase().includes(loc.toLowerCase()));
        if (matchedLoc) {
          setLocationSelect(matchedLoc);
          setAppliedSearchLocation(matchedLoc);
        } else {
          setLocationSelect(loc);
          setAppliedSearchLocation(loc);
        }
      }

      if (searchParam) {
        setKeyword(searchParam);
        setAppliedSearchKeyword(searchParam);
      }

      const filterParam = params.get('filter');
      if (filterParam) {
        setAppliedSearchFilter(filterParam);
      } else {
        setAppliedSearchFilter('All');
      }
      
      setCurrentPage(1);
    };

    // Run parsing on mount
    parseUrlFilters();

    // Listen to history popstates to update filters dynamically if the URL is updated
    window.addEventListener('popstate', parseUrlFilters);
    return () => {
      window.removeEventListener('popstate', parseUrlFilters);
    };
  }, [uniqueTypes, uniqueLocalities]);

  // Sidebar location options filtered by local search input
  const sidebarFilteredLocOptions = useMemo(() => {
    return uniqueLocalities.filter(loc => 
      loc.toLowerCase().includes(searchTermLoc.toLowerCase())
    );
  }, [uniqueLocalities, searchTermLoc]);

  // Curry currency formatting
  const formatValueInINR = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100005).toFixed(1).replace(/\.0$/, '')} Lakh`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  // Quick Action triggers prefill dynamic Site Visit Form
  const handleScheduleSiteVisitDynamic = (p?: Property | null) => {
    if (p) {
      setBookingTargetProperty(p);
    } else {
      setBookingTargetProperty(null);
    }
    onOpenSiteVisit();
  };

  return (
    <div className="bg-[#0a192f] text-slate-100 min-h-screen font-sans border-t border-slate-900 leading-normal" id="dvarix-realty-properties-page-root">
      
      {/* ==========================================
          HERO SECTION (Luxury Dark Real Estate)
         ========================================== */}
      <section 
        className="relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/95 via-[#0c1b30] to-[#06101e] py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-900 overflow-hidden" 
        id="realty-luxury-hero-banner"
      >
        {/* Luxury premium building layout bg image with overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1920&q=80" 
            alt="Luxury Real Estate Skyscrapers background" 
            className="w-full h-full object-cover opacity-15 select-none pointer-events-none filter brightness-50 contrast-125"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a192f]/80 via-[#0a192f]/95 to-[#0a192f]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-left">
          <div className="space-y-4 mb-10">
            <span className="text-[#ff5a3c] text-xs font-black uppercase tracking-widest font-mono inline-block px-3 py-1 bg-[#ff5a3c]/10 border border-[#ff5a3c]/20 rounded-full">
              DVARIX REALTY
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl">
              Properties Listings
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl font-light font-sans leading-relaxed">
              Discover curated real estate opportunities across Bengaluru for living, investing & growing. Find high appreciation plots, bespoke luxury villas, smart logistics yards, and commercial premises.
            </p>
          </div>

          {/* Combined Search Form block */}
          <form 
            onSubmit={handleHeroSearch}
            className="bg-slate-950/90 border border-slate-800/80 rounded-2xl p-6 shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
            id="hero-asset-search-form"
          >
            {/* Search Property */}
            <div className="md:col-span-3 space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Search Property</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-500" />
                <input 
                  type="text" 
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search by locality, project or keyword..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white outline-none focus:border-[#ff5a3c] focus:ring-1 focus:ring-[#ff5a3c]/40 transition placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Select Location */}
            <div className="md:col-span-3 space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Location</label>
              <select
                value={locationSelect}
                onChange={(e) => setLocationSelect(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 outline-none focus:border-[#ff5a3c] transition appearance-none cursor-pointer"
              >
                <option value="All">Select Location (All)</option>
                {uniqueLocalities.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Select Property Type */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Property Type</label>
              <select
                value={typeSelect}
                onChange={(e) => setTypeSelect(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 outline-none focus:border-[#ff5a3c] transition appearance-none cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="plots">Plots</option>
                <option value="apartments">Apartments</option>
                <option value="villas">Villas</option>
                <option value="commercial">Commercial</option>
                <option value="warehouse">Warehouses</option>
                <option value="homestay">PG / Stays</option>
              </select>
            </div>

            {/* Budget Range dropdown */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Budget</label>
              <select
                value={budgetRangeFilter}
                onChange={(e) => setBudgetRangeFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 outline-none focus:border-[#ff5a3c] transition appearance-none cursor-pointer"
              >
                <option value="All">Min - Max Price</option>
                <option value="Under 50 Lakhs">Under 50 Lakhs</option>
                <option value="50 Lakhs - 1.5 Cr">50 L - 1.5 Cr</option>
                <option value="1.5 Cr - 3 Cr">1.5 Cr - 3.0 Cr</option>
                <option value="3 Cr - 5 Cr">3.0 Cr - 5.0 Cr</option>
                <option value="Above 5 Cr">Above 5.0 Cr</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-[#ff5a3c] hover:bg-[#e04f32] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Search Properties
              </button>
            </div>
          </form>

          {/* Popular searches Location chips */}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Popular Searches:</span>
            {["Whitefield", "Sarjapur Road", "Electronic City", "Devanahalli", "Yelahanka", "Indiranagar"].map(loc => (
              <button
                key={loc}
                type="button"
                onClick={() => handlePopularSearchClick(loc)}
                className="px-3.5 py-1.5 bg-slate-950/60 border border-slate-800 hover:border-[#ff5a3c] hover:text-white rounded-lg text-[11px] transition cursor-pointer"
              >
                {loc}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* ==========================================
          FEATURED OPPORTUNITIES SECTION
         ========================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#081324] border-b border-slate-900" id="realty-featured-opportunities-section">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex items-center justify-between mb-8">
            <div className="text-left space-y-1">
              <span className="text-[#ff5a3c] font-mono text-[10px] font-extrabold uppercase tracking-widest block">CURATED COLLECTION</span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Featured Opportunities
              </h2>
            </div>
            <button 
              type="button"
              onClick={() => {
                setSelectedCategoryTab('Properties');
                setAppliedSearchKeyword('');
                setAppliedSearchLocation('All');
                setAppliedSearchType('All');
              }}
              className="text-xs font-black text-slate-400 hover:text-white flex items-center gap-1 uppercase tracking-wider font-mono transition cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4 text-[#ff5a3c]" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProperties.map(p => {
              const pLoc = getPropertyLocality(p);
              const isFav = favorites.includes(p.id);
              return (
                <div 
                  key={`featured-${p.id}`}
                  className="bg-slate-950/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 group flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] w-full bg-slate-900 overflow-hidden">
                    <img 
                      src={p.images[0] || p.image} 
                      alt={p.title} 
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-103"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Featured label */}
                    <span className="absolute top-3 left-3 bg-[#ff5a3c] text-white font-mono font-black text-[9px] uppercase px-2 py-1 rounded-md shadow-md tracking-wider">
                      FEATURED
                    </span>

                    {/* Heart button */}
                    <button
                      type="button"
                      onClick={() => toggleFavorite(p.id)}
                      className="absolute top-3 right-3 p-2 bg-slate-950/80 hover:bg-slate-950 text-slate-300 hover:text-rose-500 rounded-full transition shadow-md cursor-pointer z-10 border border-slate-800"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>

                    {/* Category Label bottom-left */}
                    <span className="absolute bottom-3 left-3 bg-[#ff5a3c]/90 text-white font-mono font-black text-[9px] uppercase px-2 py-0.5 rounded shadow">
                      {p.type}
                    </span>
                  </div>

                  {/* Content details block */}
                  <div className="p-4 flex-grow flex flex-col justify-between text-left">
                    <div className="space-y-1">
                      <h4 
                        onClick={() => onViewDetails(p)}
                        className="text-sm font-black text-white hover:text-[#ff5a3c] transition line-clamp-1 cursor-pointer pt-0.5 leading-snug"
                      >
                        {p.title}
                      </h4>
                      <p className="text-slate-400 text-xs flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{pLoc}, Bangalore</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-900 mt-4 pt-3">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-[#ff5a3c] block">INVESTMENT PRICE</span>
                        <span className="text-sm font-bold text-white font-mono tracking-tight">{formatValueInINR(p.price)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onViewDetails(p)}
                        className="p-1.5 bg-slate-905 border border-slate-800 rounded-full text-slate-300 hover:text-white hover:border-[#ff5a3c] transition shadow-md cursor-pointer flex items-center justify-center"
                        title="View Details"
                      >
                        <Plus className="w-4 h-4 text-[#ff5a3c]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ==========================================
          PROPERTY CATEGORY NAVIGATION
         ========================================== */}
      <nav className="bg-slate-950 border-b border-slate-900 py-4 px-4 sm:px-6 lg:px-8 overflow-x-auto select-none">
        <div className="max-w-7xl mx-auto flex items-center gap-2 md:gap-3 min-w-max pb-1">
          {activeSearchCategories.map(tab => {
            const IconComp = (LucideIcons as any)[tab.iconName] || LucideIcons.Building2;
            const isActive = selectedCategoryTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedCategoryTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider font-mono border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#ffe8e4]/5 text-[#ff5a3c] border-[#ff5a3c] shadow-md shadow-[#ff5a3c]/10'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:color-white hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <IconComp className={`w-4 h-4 ${isActive ? 'text-[#ff5a3c]' : 'text-slate-500'}`} />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ==========================================
          MAIN PROPERTY LISTING LAYOUT
         ========================================== */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="listings-layout-view">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* A. LEFT COLUMN - Advanced filter sidebar */}
          <aside className="lg:col-span-3 bg-slate-950/80 border border-slate-900 rounded-2xl p-5 space-y-6 text-left shadow-xl" id="listings-advanced-sidebar shadow">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-900">
              <span className="text-xs uppercase font-extrabold tracking-wider text-white font-mono flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#ff5a3c]" /> Filters
              </span>
              <button 
                type="button"
                onClick={handleClearFilters}
                className="text-[10px] font-bold tracking-wider uppercase text-slate-500 hover:text-white font-mono transition cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Sidebar filter: Property Type */}
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#ff5a3c] font-mono">Property Type</h4>
              <div className="space-y-2">
                {[
                  { value: 'Plots', label: 'Plots' },
                  { value: 'Apartments', label: 'Apartments' },
                  { value: 'Villas', label: 'Villas' },
                  { value: 'Commercial', label: 'Commercial' },
                  { value: 'House for Rent', label: 'House for Rent' },
                  { value: 'PG / Stay', label: 'PG / Stay' },
                  { value: 'Warehouses', label: 'Warehouses' }
                ].map(item => {
                  const isChecked = sidebarTypes.includes(item.value);
                  return (
                    <label key={item.value} className="flex items-center gap-2.5 text-xs text-slate-350 cursor-pointer select-none group">
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const updated = isChecked 
                            ? sidebarTypes.filter(t => t !== item.value)
                            : [...sidebarTypes, item.value];
                          setSidebarTypes(updated);
                          setCurrentPage(1);
                        }}
                        className="accent-[#ff5a3c] h-3.5 w-3.5 rounded border-slate-800 bg-slate-900"
                      />
                      <span className={`group-hover:text-white transition ${isChecked ? 'text-white font-bold' : ''}`}>
                        {item.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Sidebar filter: Location Multi-select with mini-search */}
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#ff5a3c] font-mono">Location</h4>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Search location..."
                  value={searchTermLoc}
                  onChange={(e) => setSearchTermLoc(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-850 rounded-lg text-[11px] text-white placeholder:text-slate-550 outline-none focus:border-[#ff5a3c] transition"
                />
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {(showAllLocationsSidebar ? sidebarFilteredLocOptions : sidebarFilteredLocOptions.slice(0, 5)).map(loc => {
                  const isChecked = sidebarLocations.includes(loc);
                  return (
                    <label key={loc} className="flex items-center gap-2.5 text-xs text-slate-350 cursor-pointer select-none group">
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const updated = isChecked
                            ? sidebarLocations.filter(l => l !== loc)
                            : [...sidebarLocations, loc];
                          setSidebarLocations(updated);
                          setCurrentPage(1);
                        }}
                        className="accent-[#ff5a3c] h-3.5 w-3.5 rounded border-slate-800 bg-slate-900"
                      />
                      <span className={`group-hover:text-white transition ${isChecked ? 'text-white font-bold' : ''}`}>
                        {loc}
                      </span>
                    </label>
                  );
                })}
                {sidebarFilteredLocOptions.length === 0 && (
                  <p className="text-[10px] text-slate-500 font-mono italic">No locations found</p>
                )}
              </div>

              {sidebarFilteredLocOptions.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAllLocationsSidebar(!showAllLocationsSidebar)}
                  className="text-[10px] font-bold font-mono text-[#ff5a3c] hover:text-white tracking-wide uppercase transition cursor-pointer"
                >
                  {showAllLocationsSidebar ? "- Show Less" : `+ Show More (${sidebarFilteredLocOptions.length - 5})`}
                </button>
              )}
            </div>

            {/* Sidebar filter: Budget range slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#ff5a3c] font-mono">Max Budget</h4>
                <span className="text-xs text-white font-black font-mono">₹{budgetMultiplier === 10 ? '10 Cr+' : `${budgetMultiplier} Cr`}</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="10.0" 
                step="0.5"
                value={budgetMultiplier}
                onChange={(e) => {
                  setBudgetMultiplier(parseFloat(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full accent-[#ff5a3c] h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between items-center text-[9px] font-mono text-slate-550 uppercase">
                <span>₹50 Lakh</span>
                <span>₹10 Cr+</span>
              </div>
            </div>

            {/* Sidebar filter: Property Status checkboxes */}
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#ff5a3c] font-mono">Property Status</h4>
              <div className="space-y-2">
                {[
                  { value: 'All', label: 'All Statuses' },
                  { value: 'Under Construction', label: 'Under Construction' },
                  { value: 'Ready to Move', label: 'Ready to Move' }
                ].map(item => (
                  <label key={item.value} className="flex items-center gap-2.5 text-xs text-slate-350 cursor-pointer select-none group">
                    <input 
                      type="radio"
                      name="sidebar-status-radio"
                      checked={sidebarStatus === item.value}
                      onChange={() => {
                        setSidebarStatus(item.value);
                        setCurrentPage(1);
                      }}
                      className="accent-[#ff5a3c] h-3.5 w-3.5"
                    />
                    <span className="group-hover:text-white transition">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

          </aside>

          {/* B. RIGHT COLUMN - Dynamic listing grid */}
          <main className="lg:col-span-9 space-y-6" id="listings-main-display">
            
            {/* Sorting bar & Grid toggle */}
            <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-left">
                <h3 className="text-xs font-mono text-slate-400">
                  Showing <span className="text-[#ff5a3c] font-extrabold">{sortedProperties.length}</span> {sortedProperties.length === 1 ? 'Property' : 'Properties'}
                </h3>
              </div>

              <div className="flex items-center justify-end gap-3 self-end sm:self-auto">
                {/* Sorting Select */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-3 pr-8 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold font-mono text-slate-300 outline-none focus:border-[#ff5a3c] cursor-pointer appearance-none"
                  >
                    <option value="Relevance">Sort by: Relevance</option>
                    <option value="PriceLowHigh">Price: Low to High</option>
                    <option value="PriceHighLow">Price: High to Low</option>
                    <option value="AreaBigSmall">Area: Big to Small</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-slate-550 pointer-events-none" />
                </div>

                {/* Grid toggle */}
                <div className="flex items-center gap-1 bg-slate-900 rounded-xl p-1 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsListView(false)}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${!isListView ? 'bg-[#ff5a3c] text-white shadow' : 'text-slate-500 hover:text-white'}`}
                    title="Grid layout"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsListView(true)}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${isListView ? 'bg-[#ff5a3c] text-white shadow' : 'text-slate-500 hover:text-white'}`}
                    title="List layout"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* List of Property Cards */}
            <div className={isListView ? "space-y-6" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
              {paginatedProperties.map(p => {
                const isFav = favorites.includes(p.id);
                const pLoc = getPropertyLocality(p);
                const isPlot = p.type.toLowerCase().includes('plot');
                const isApartment = p.type.toLowerCase().includes('apartment');
                const isVilla = p.type.toLowerCase().includes('villa');
                
                return (
                  <div 
                    key={p.id}
                    className={`bg-slate-910/50 border border-slate-900 hover:border-slate-800/80 rounded-2xl overflow-hidden transition-all duration-300 flex ${
                      isListView ? 'flex-col md:flex-row' : 'flex-col'
                    } justify-between text-left group shadow-lg`}
                  >
                    {/* Visual Photo Block */}
                    <div className={`relative ${isListView ? 'w-full md:w-56 shrink-0 aspect-[4/3] md:aspect-square' : 'aspect-[16/10] w-full'} bg-slate-900 overflow-hidden`}>
                      <img 
                        src={p.images[0] || p.image} 
                        alt={p.title} 
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-103"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Certified dynamic badge */}
                      <span className="absolute top-3 left-3 bg-[#e0ffd4]/10 text-emerald-400 border border-emerald-500/20 font-mono font-black text-[8px] uppercase tracking-wider px-2 py-1 rounded shadow flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" /> VERIFIED
                      </span>

                      {/* Wishlist toggle */}
                      <button
                        type="button"
                        onClick={() => toggleFavorite(p.id)}
                        className="absolute top-3 right-3 p-1.5 bg-slate-950/80 hover:bg-slate-950 text-slate-300 hover:text-rose-500 rounded-full transition shadow cursor-pointer border border-slate-800 z-10"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>

                    {/* Meta Specifications details */}
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[#ff5a3c] font-mono font-black text-[9px] uppercase tracking-wider block">
                          {p.type}
                        </span>
                        
                        <h4 
                          onClick={() => onViewDetails(p)}
                          className="text-white hover:text-[#ff5a3c] text-sm font-black transition line-clamp-1 cursor-pointer"
                        >
                          {p.title}
                        </h4>

                        <p className="text-slate-400 text-xs flex items-center gap-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{pLoc}, Bangalore</span>
                        </p>

                        {/* Specifications parameters logic */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 opacity-90 border-t border-slate-900 font-mono text-[10px] text-slate-400">
                          {/* Plot Specifications */}
                          {isPlot ? (
                            <>
                              <span className="flex items-center gap-0.5"><Ruler className="w-3 h-3 text-slate-500" /> {p.sqft} sq.ft</span>
                              <span className="text-slate-600">•</span>
                              <span className="flex items-center gap-0.5"><Compass className="w-3 h-3 text-slate-500" /> {p.facing || 'East Facing'}</span>
                              <span className="text-slate-600">•</span>
                              <span className="flex items-center gap-0.5"><Landmark className="w-3 h-3 text-slate-500" /> Plot</span>
                            </>
                          ) : (
                            <>
                              {p.beds > 0 && (
                                <>
                                  <span className="flex items-center gap-0.5"><Bed className="w-3 h-3 text-slate-500" /> {p.beds} BHK</span>
                                  <span className="text-slate-600">•</span>
                                </>
                              )}
                              <span className="flex items-center gap-0.5"><Ruler className="w-3 h-3 text-slate-500" /> {p.sqft} sq.ft</span>
                              <span className="text-slate-600">•</span>
                              <span className="flex items-center gap-0.5"><Building2 className="w-3 h-3 text-slate-500" /> {p.type}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Pricing and Action details */}
                      <div className="flex items-center justify-between border-t border-slate-900 mt-4 pt-3">
                        <span className="text-white font-extrabold font-mono text-sm tracking-tight">
                          {formatValueInINR(p.price)}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => onViewDetails(p)}
                          className="px-4 py-1.5 bg-[#ff5a3c]/10 text-[#ff5a3c] border border-[#ff5a3c]/30 hover:bg-[#ff5a3c] hover:text-white rounded-lg text-[10px] font-black uppercase tracking-wider font-mono transition cursor-pointer"
                        >
                          View Details &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {paginatedProperties.length === 0 && (
                <div className="col-span-full py-16 text-center bg-slate-950/40 border border-slate-900 rounded-2xl flex flex-col justify-center items-center">
                  <SlidersHorizontal className="h-10 w-10 text-slate-600 mb-3" />
                  <p className="text-slate-400 font-sans text-sm font-semibold mb-1">No Properties Found</p>
                  <p className="text-slate-500 font-sans text-xs">No properties match your current search queries or filters.</p>
                  <button 
                    onClick={handleClearFilters}
                    className="mt-4 px-4 py-2 bg-[#ff5a3c] hover:bg-[#e04f32] text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition cursor-pointer shadow-md"
                  >
                    Clear Search Filters
                  </button>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6 font-mono text-xs select-none">
                {/* Previous button */}
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-3 py-1.5 bg-slate-950/80 border border-slate-900 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCurrentPage(num)}
                    className={`px-3 py-2 rounded-lg transition-all font-bold ${
                      currentPage === num
                        ? 'bg-[#ff5a3c] text-white'
                        : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-900'
                    }`}
                  >
                    {num}
                  </button>
                ))}

                {/* Next button */}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-3 py-1.5 bg-slate-950/80 border border-slate-900 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer flex items-center justify-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </main>

        </div>
      </section>

      {/* ==========================================
          LEAD GENERATION SECTION
         ========================================== */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="realty-lead-generation-module">
        <div className="bg-[#081324] border border-slate-900 rounded-3xl p-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center divide-y md:divide-y-0 md:divide-x divide-slate-930 text-left">
            
            {/* Visit Before You Decide */}
            <div className="space-y-4 pb-6 md:pb-0">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-[#ff5a3c]/10 border border-[#ff5a3c]/20 text-[#ff5a3c] rounded-2xl shrink-0">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-white">Visit Before You Decide</h4>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xs">Schedule a personalized physical walkthrough to dynamic developments with support of local experts.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleScheduleSiteVisitDynamic(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#ff5a3c] hover:bg-[#e04f32] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Schedule Site Visit &rarr;
              </button>
            </div>

            {/* Talk to Expert */}
            <div className="space-y-4 py-6 md:py-0 md:pl-8">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-white">Need Expert Guidance?</h4>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xs">Get custom tailored advisory feedback for Bangalore luxury, residential &amp; industrial properties today.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenCustomRequest}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 border border-slate-805 text-slate-300 hover:text-white hover:border-[#ff5a3c] text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Talk to Expert &rarr;
              </button>
            </div>

            {/* Clients Trust Metric */}
            <div className="space-y-4 py-6 md:py-0 md:pl-8 flex flex-col justify-center">
              <div className="text-left space-y-1.5">
                <h4 className="text-xs font-black font-mono text-slate-500 uppercase tracking-widest block">CUSTOMER REVIEWS</h4>
                <p className="text-white font-extrabold text-base font-sans">Trusted by 500+ Clients</p>
                <div className="flex items-center gap-1.5">
                  {/* Rating Stars */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-500 shrink-0" />
                  ))}
                  <span className="text-slate-300 font-bold font-mono text-sm ml-1">4.8</span>
                  <span className="text-slate-500 text-xs font-mono ml-0.5">(120+ Reviews)</span>
                </div>
              </div>

              {/* Stacked client avatars */}
              <div className="flex items-center -space-x-2.5">
                {[
                  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
                  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
                ].map((av, index) => (
                  <img 
                    key={index}
                    src={av} 
                    alt="Customer trust avatar representation" 
                    className="w-8 h-8 rounded-full border border-slate-950 object-cover shadow-sm select-none"
                    referrerPolicy="no-referrer"
                  />
                ))}
                <span className="w-8 h-8 rounded-full bg-slate-900 border border-slate-950 text-slate-400 font-bold font-mono text-[9px] flex items-center justify-center shadow-sm">
                  +120
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==========================================
          CLIENT TRUST INDICATORS ROW
         ========================================== */}
      <footer className="py-12 bg-slate-950 border-t border-slate-900" id="trust-indicators-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-left">
            {[
              { title: "100% Verified Listings", desc: "All properties are legally verified & documented.", icon: ShieldIcon },
              { title: "Best Market Value", desc: "Get the best deals at real market prices.", icon: DollarSign },
              { title: "Expert Consultation", desc: "Professional guidance for smarter decisions.", icon: Award },
              { title: "Transparent Process", desc: "Clear documentation & hassle-free transactions.", icon: TrendingUp },
              { title: "After Sales Support", desc: "Complete support even after your purchase.", icon: Sparkles }
            ].map(item => {
              const IconComp = item.icon;
              return (
                <div key={item.title} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-900 text-[#ff5a3c] rounded-xl border border-slate-805 shrink-0 shadow-inner">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <h5 className="text-xs font-black text-white font-sans">{item.title}</h5>
                  </div>
                  <p className="text-[11px] text-slate-500 font-light leading-relaxed max-w-[200px]">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </footer>

    </div>
  );
}
