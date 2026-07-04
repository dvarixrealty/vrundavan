import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  MapPin, Plus, Edit, Trash2, ShieldCheck, Check, Info, Globe, 
  Map, TrendingUp, DollarSign, Compass, Layers, Clipboard, Image as ImageIcon, 
  ChevronRight, Star, AlertTriangle, Play, HelpCircle, Search, ToggleLeft, Activity, Palette
} from 'lucide-react';
import { MapLocation, MapSettings } from '../types';
import { firebaseService } from '../lib/firebaseService';

interface SaaSLocationModuleProps {
  mapLocations: Record<string, MapLocation>;
  setMapLocations?: (newMapLocations: Record<string, MapLocation>) => void;
  mapSettings?: MapSettings;
  onUpdateMapSettings?: (settings: MapSettings) => void;
}

export default function SaaSLocationModule({ 
  mapLocations, 
  setMapLocations,
  mapSettings,
  onUpdateMapSettings
}: SaaSLocationModuleProps) {
  const [viewMode, setViewMode] = useState<'list' | 'form' | 'settings'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom delete confirm modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form states
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formX, setFormX] = useState('50%');
  const [formY, setFormY] = useState('50%');
  const [formListings, setFormListings] = useState<number>(0);
  const [formAvgValuation, setFormAvgValuation] = useState('$1,200,000');
  const [formBenefits, setFormBenefits] = useState('High potential, tech-enabled luxury setups');
  const [formDescription, setFormDescription] = useState('Premium strategic land parcels offering great connectivity and development advantages.');
  const [formGrowth, setFormGrowth] = useState('+15.5% YoY ROI');
  
  // Additional requested fields
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formCountry, setFormCountry] = useState('India');
  const [formLatitude, setFormLatitude] = useState<number>(12.9716);
  const [formLongitude, setFormLongitude] = useState<number>(77.5946);
  const [formStatus, setFormStatus] = useState<'Active' | 'Disabled'>('Active');
  const [formFeatured, setFormFeatured] = useState<boolean>(true);
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(1);
  const [formImage, setFormImage] = useState('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80');

  // New specific location model states
  const [formSlug, setFormSlug] = useState('');
  const [formGrowthRate, setFormGrowthRate] = useState('');
  const [formAvgPropertyValue, setFormAvgPropertyValue] = useState('');
  const [formLocationHighlights, setFormLocationHighlights] = useState('');
  const [formDisplayPriority, setFormDisplayPriority] = useState<number>(1);
  const [formRedirectUrl, setFormRedirectUrl] = useState('');
  const [formRedirectType, setFormRedirectType] = useState<'Location Page' | 'Property Collection' | 'Custom URL'>('Location Page');

  // Additional stats fields
  const [formOpportunities, setFormOpportunities] = useState<number>(5);
  const [formActiveReqs, setFormActiveReqs] = useState<number>(12);
  const [formSiteVisits, setFormSiteVisits] = useState<number>(8);
  const [formDemandLevel, setFormDemandLevel] = useState<string>('High');
  const [formInvestmentPotential, setFormInvestmentPotential] = useState<string>('High');
  const [formAverageBudget, setFormAverageBudget] = useState('$800k - $2.5M');

  // Homepage Map Controller variables
  const [formShowOnHomepage, setFormShowOnHomepage] = useState<boolean>(true);
  const [formFeaturedLocation, setFormFeaturedLocation] = useState<boolean>(true);
  const [formActivePin, setFormActivePin] = useState<boolean>(true);
  const [formPinColor, setFormPinColor] = useState<string>('#ff5a3c');
  const [formPinIcon, setFormPinIcon] = useState<string>('MapPin');

  // Global Map Settings states
  const [documentSettingsProvider, setDocumentSettingsProvider] = useState<'Google Maps' | 'Mapbox' | 'OpenStreetMap' | 'Custom Future Provider'>('OpenStreetMap');
  const [documentSettingsZoom, setDocumentSettingsZoom] = useState<number>(10);
  const [documentSettingsLat, setDocumentSettingsLat] = useState<number>(37.7749);
  const [documentSettingsLng, setDocumentSettingsLng] = useState<number>(-122.4194);

  // Sync Global Settings inputs on prop updates
  useEffect(() => {
    if (mapSettings) {
      setDocumentSettingsProvider(mapSettings.activeProvider || 'OpenStreetMap');
      setDocumentSettingsZoom(mapSettings.defaultZoom || 10);
      setDocumentSettingsLat(mapSettings.defaultCenterLat || 37.7749);
      setDocumentSettingsLng(mapSettings.defaultCenterLng || -122.4194);
    }
  }, [mapSettings]);

  // Ref for visual interactive pin-setter element
  const pinPlacementRef = useRef<HTMLDivElement>(null);

  // Total available stats calculations
  const locationKeys = Object.keys(mapLocations);
  const totalCount = locationKeys.length;
  const activeCount = locationKeys.filter(k => mapLocations[k].status !== 'Disabled').length;
  const featuredCount = locationKeys.filter(k => mapLocations[k].featured !== false).length;

  const totalAssignedListings = useMemo(() => {
    return Object.values(mapLocations).reduce((acc, loc) => acc + (loc.listings || 0), 0);
  }, [mapLocations]);

  // Handle setting/resetting form for adding a new location
  const handleAddNewLocationClick = () => {
    setEditingKey(null);
    setFormName('');
    setFormX('50%');
    setFormY('55%');
    setFormListings(0);
    setFormAvgValuation('$1,200,000');
    setFormBenefits('Smart energy defenses, certified road connectivity');
    setFormDescription('Exclusive high-growth development parameters situated in key logistics junctions.');
    setFormGrowth('+14.5% YoY');
    setFormCity('');
    setFormState('');
    setFormCountry('India');
    setFormLatitude(12.9716);
    setFormLongitude(77.5946);
    setFormStatus('Active');
    setFormFeatured(true);
    setFormDisplayOrder(totalCount + 1);
    setFormImage('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80');
    setFormOpportunities(4);
    setFormActiveReqs(15);
    setFormSiteVisits(9);
    setFormDemandLevel('High');
    setFormInvestmentPotential('High');
    setFormAverageBudget('₹1.5 Cr - ₹4.0 Cr');

    // New real estate fields default settings
    setFormSlug('');
    setFormGrowthRate('14.5%');
    setFormAvgPropertyValue('₹1.5 Cr');
    setFormLocationHighlights('Near main ring road, metro access, high footfall, lush green surroundings');
    setFormDisplayPriority(totalCount + 1);
    setFormRedirectUrl('');
    setFormRedirectType('Location Page');

    // Reset Map Controller states
    setFormShowOnHomepage(true);
    setFormFeaturedLocation(true);
    setFormActivePin(true);
    setFormPinColor('#ff5a3c');
    setFormPinIcon('MapPin');

    setViewMode('form');
  };

  // Prepopulate form for editing
  const handleEditLocationClick = (keyName: string) => {
    const loc = mapLocations[keyName];
    setEditingKey(keyName);
    setFormName(loc.name || keyName);
    setFormX(loc.x || '50%');
    setFormY(loc.y || '50%');
    setFormListings(loc.listings || 0);
    setFormAvgValuation(loc.avgValuation || '$1,500,000');
    setFormBenefits(loc.benefits || 'Verified high-tech premium connectivity advantages');
    setFormDescription(loc.description || 'Enterprise regional modules and premium residential complexes.');
    setFormGrowth(loc.growth || '+12.0% YoY');
    setFormCity(loc.city || '');
    setFormState(loc.state || keyName);
    setFormCountry(loc.country || 'United States');
    setFormLatitude(loc.latitude || 37.7749);
    setFormLongitude(loc.longitude || -122.4194);
    setFormStatus(loc.status || 'Active');
    setFormFeatured(loc.featured !== false);
    setFormDisplayOrder(loc.displayOrder || 1);
    setFormImage(loc.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80');
    setFormOpportunities(loc.availableOpportunities || 0);
    setFormActiveReqs(loc.activeRequirements || 0);
    setFormSiteVisits(loc.siteVisits || 0);
    setFormDemandLevel(loc.demandLevel || 'High');
    setFormInvestmentPotential(loc.investmentPotential || 'High');
    setFormAverageBudget(loc.averageBudget || '');

    // Map Controller fields load
    setFormShowOnHomepage(loc.showOnHomepage !== false);
    setFormFeaturedLocation(loc.featuredLocation !== false);
    setFormActivePin(loc.activePin !== false || loc.status === 'Active');
    setFormPinColor(loc.pinColor || '#ff5a3c');
    setFormPinIcon(loc.pinIcon || 'MapPin');

    // New specific location fields load
    const derivedDefaultSlug = (loc.slug || (loc.name || keyName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    setFormSlug(derivedDefaultSlug);
    setFormGrowthRate(loc.growthRate || loc.growth || '+14.5%');
    setFormAvgPropertyValue(loc.avgPropertyValue || loc.avgValuation || '₹1.5 Cr');
    setFormLocationHighlights(loc.locationHighlights || loc.benefits || '');
    setFormDisplayPriority(loc.displayPriority || loc.displayOrder || 1);
    setFormRedirectUrl(loc.redirectUrl || `/location/${derivedDefaultSlug}`);
    setFormRedirectType(loc.redirectType || 'Location Page');

    setViewMode('form');
  };

  // Instant feature toggle
  const handleToggleFeatured = async (keyName: string) => {
    const loc = mapLocations[keyName];
    const isNextFeatured = loc.featured === false ? true : false;
    const updatedLoc: MapLocation = {
      ...loc,
      featured: isNextFeatured,
      featuredLocation: isNextFeatured
    };
    await firebaseService.saveMapLocation(updatedLoc);
    
    if (setMapLocations) {
      setMapLocations({
        ...mapLocations,
        [keyName]: updatedLoc
      });
    }
  };

  // Instant status toggle
  const handleToggleStatus = async (keyName: string) => {
    const loc = mapLocations[keyName];
    const isNextDisabled = loc.status === 'Disabled';
    const nextStatus = isNextDisabled ? 'Active' : 'Disabled';
    const updatedLoc: MapLocation = {
      ...loc,
      status: nextStatus,
      activePin: nextStatus === 'Active'
    };
    await firebaseService.saveMapLocation(updatedLoc);

    if (setMapLocations) {
      setMapLocations({
        ...mapLocations,
        [keyName]: updatedLoc
      });
    }
  };

  // Handle Delete CONFIRMED
  const handleDeleteConfirm = async () => {
    if (showDeleteConfirm) {
      // 1. Delete on Firestore
      await firebaseService.deleteMapLocation(showDeleteConfirm);

      // 2. Reflect on local props state
      if (setMapLocations) {
        const nextMap = { ...mapLocations };
        delete nextMap[showDeleteConfirm];
        setMapLocations(nextMap);
      }
      setShowDeleteConfirm(null);
    }
  };

  // Click handler on 2D map outline container to set relative map percentages
  const handleMapCoordinateClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pinPlacementRef.current) return;
    
    const boundingBox = pinPlacementRef.current.getBoundingClientRect();
    const clickX = e.clientX - boundingBox.left;
    const clickY = e.clientY - boundingBox.top;

    // Convert to relative coordinate percentages
    const percentageX = Math.round((clickX / boundingBox.width) * 100) + '%';
    const percentageY = Math.round((clickY / boundingBox.height) * 100) + '%';

    setFormX(percentageX);
    setFormY(percentageY);
  };

  // Handle Form Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const locationCodeName = formName.trim();
    const derivedSlug = (formSlug.trim() || locationCodeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    const finalRedirectUrl = formRedirectUrl.trim() || `/location/${derivedSlug}`;

    const newLoc: MapLocation = {
      name: locationCodeName,
      slug: derivedSlug,
      x: formX,
      y: formY,
      listings: Number(formListings),
      avgValuation: formAvgPropertyValue.trim() || formAvgValuation.trim() || '₹1.5 Cr',
      benefits: formLocationHighlights.trim() || formBenefits.trim() || 'Premium Location Advantages',
      description: formDescription.trim(),
      growth: formGrowthRate.trim() || formGrowth.trim() || '+14.5% YoY',
      city: formCity.trim(),
      state: formState.trim() || locationCodeName,
      country: formCountry.trim() || 'India',
      latitude: Number(formLatitude),
      longitude: Number(formLongitude),
      status: formActivePin ? 'Active' : 'Disabled',
      featured: formFeaturedLocation,
      displayOrder: Number(formDisplayPriority),
      image: formImage.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
      availableOpportunities: Number(formOpportunities),
      activeRequirements: Number(formActiveReqs),
      siteVisits: Number(formSiteVisits),
      demandLevel: formDemandLevel,
      investmentPotential: formInvestmentPotential,
      averageBudget: formAverageBudget.trim() || '₹1.5 Cr - ₹4.0 Cr',

      // New Real Estate fields
      growthRate: formGrowthRate.trim() || '+14.5%',
      avgPropertyValue: formAvgPropertyValue.trim() || '₹1.5 Cr',
      locationHighlights: formLocationHighlights.trim() || 'Near metro stations, high-demand green pocket',
      displayPriority: Number(formDisplayPriority),
      redirectUrl: finalRedirectUrl,
      redirectType: formRedirectType,

      // Homepage Map Controller Specifics
      showOnHomepage: formShowOnHomepage,
      featuredLocation: formFeaturedLocation,
      activePin: formActivePin,
      pinColor: formPinColor,
      pinIcon: formPinIcon
    };

    // 1. Save on Firestore
    await firebaseService.saveMapLocation(newLoc);

    // 2. If the user changed the key name (rename), delete the old Firestore record
    if (editingKey && editingKey !== locationCodeName) {
      await firebaseService.deleteMapLocation(editingKey);
    }

    // 3. Save to local React parent state
    if (setMapLocations) {
      const nextMap = { ...mapLocations };
      if (editingKey && editingKey !== locationCodeName) {
        delete nextMap[editingKey];
      }
      nextMap[locationCodeName] = newLoc;
      setMapLocations(nextMap);
    }

    setViewMode('list');
    setEditingKey(null);
  };

  const filteredLocations = useMemo(() => {
    return locationKeys.filter(k => {
      const loc = mapLocations[k];
      const matchSearch = k.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (loc.city && loc.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (loc.state && loc.state.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSearch;
    });
  }, [mapLocations, searchQuery]);

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* 1. HEADER & METRIC SUMMARY CARDS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sky-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-sky-500" />
            Location Management Module
          </h2>
          <p className="text-xs text-slate-500">
            Regulate custom maps, map suppliers, pin locations, coordinates on active maps, and local market indicators.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {viewMode === 'list' && (
            <>
              <button
                onClick={() => setViewMode('settings')}
                className="px-4 py-2 border border-slate-205 text-slate-700 bg-white rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
              >
                <Compass className="h-3.5 w-3.5 text-slate-500" />
                Map Settings & Provider
              </button>
              <button
                onClick={handleAddNewLocationClick}
                className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-sky-100 transition duration-150 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Location Pin
              </button>
            </>
          )}

          {viewMode === 'settings' && (
            <button
              onClick={() => setViewMode('list')}
              className="px-4 py-2 border border-slate-205 text-slate-700 bg-white rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
            >
              Back to Locations List
            </button>
          )}

          {viewMode === 'form' && (
            <button
              onClick={() => setViewMode('list')}
              className="px-4 py-2 border border-slate-205 text-slate-700 bg-white rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel & Return
            </button>
          )}
        </div>
      </div>

      {/* Metrics board */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-16 w-16 bg-sky-50/40 rounded-full -mr-4 -mt-4 transition-all group-hover:scale-110" />
          <span className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Locations On Map</span>
          <span className="text-3xl font-black text-slate-800 font-sans mt-1 block">{totalCount} Pins</span>
        </div>

        <div className="bg-white border border-emerald-100 p-4 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-16 w-16 bg-emerald-50/40 rounded-full -mr-4 -mt-4 transition-all group-hover:scale-110" />
          <span className="block text-[9px] font-extrabold uppercase tracking-widest text-emerald-500">Active Pins</span>
          <span className="text-3xl font-black text-emerald-600 font-sans mt-1 block">{activeCount} Published</span>
        </div>

        <div className="bg-white border border-yellow-100 p-4 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-16 w-16 bg-yellow-50/40 rounded-full -mr-4 -mt-4 transition-all group-hover:scale-110" />
          <span className="block text-[9px] font-extrabold uppercase tracking-widest text-yellow-500">Featured Locations</span>
          <span className="text-3xl font-black text-yellow-600 font-sans mt-1 block">{featuredCount} Starred</span>
        </div>

        <div className="bg-white border border-indigo-100 p-4 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-16 w-16 bg-indigo-50/40 rounded-full -mr-4 -mt-4 transition-all group-hover:scale-110" />
          <span className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Total Linked Listings</span>
          <span className="text-2xl font-black text-indigo-700 font-sans mt-2 block flex items-center gap-1">
            {totalAssignedListings} Assets
          </span>
        </div>
      </div>

      {/* 2. CORE VIEW SWITCHING */}
      {viewMode === 'settings' && (
        <div className="bg-white border border-slate-205 rounded-2xl p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-3 mb-5">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <Layers className="h-4 w-4 text-sky-500" />
              Global Map Settings & Provider Configuration
            </h3>
            <p className="text-[11px] text-slate-450 mt-0.5">Change rendering provider engine and scale defaults instantly across all user interfaces.</p>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (onUpdateMapSettings) {
                onUpdateMapSettings({
                  ...(mapSettings || {}),
                  activeProvider: documentSettingsProvider as any,
                  defaultZoom: Number(documentSettingsZoom),
                  defaultCenterLat: Number(documentSettingsLat),
                  defaultCenterLng: Number(documentSettingsLng),
                } as MapSettings);
                setViewMode('list');
              }
            }} 
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Active Map Service Provider</label>
                <select
                  value={documentSettingsProvider}
                  onChange={(e) => setDocumentSettingsProvider(e.target.value as any)}
                  className="w-full bg-slate-5/50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 cursor-pointer outline-none font-bold"
                >
                  <option value="OpenStreetMap">OpenStreetMap (Default free tile vector server)</option>
                  <option value="Google Maps">Google Maps API (Requires credentials config & geocoding)</option>
                  <option value="Mapbox">Mapbox Studio GL SDK (For vectorized layout layers)</option>
                  <option value="Custom Future Provider">Custom Future Provider Gateway</option>
                </select>
                <p className="text-[10px] text-slate-450 mt-1 leading-relaxed">
                  Automatically aligns visual assets on landing page viewports. Uses vector map fallbacks instantly if custom server tokens are unprovided.
                </p>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Default Viewport Zoom Level</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  step={1}
                  value={documentSettingsZoom}
                  onChange={(e) => setDocumentSettingsZoom(Number(e.target.value))}
                  className="w-full bg-slate-5/50 border border-slate-200 text-slate-800 text-xs rounded-xl px-4 py-2.5 font-mono outline-none"
                />
                <p className="text-[10px] text-slate-450 mt-1">Accepts ranges 1 (global scale) to 20 (high resolution structures). Recommended: 10-14.</p>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] font-extrabold uppercase text-slate-505 tracking-wider">Default Center Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={documentSettingsLat}
                  onChange={(e) => setDocumentSettingsLat(Number(e.target.value))}
                  className="w-full bg-slate-5/50 border border-slate-200 text-slate-800 text-xs rounded-xl px-4 py-2.5 font-mono outline-none"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] font-extrabold uppercase text-slate-505 tracking-wider">Default Center Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={documentSettingsLng}
                  onChange={(e) => setDocumentSettingsLng(Number(e.target.value))}
                  className="w-full bg-slate-5/50 border border-slate-200 text-slate-800 text-xs rounded-xl px-4 py-2.5 font-mono outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-4 py-2.5 border border-slate-205 text-slate-705 hover:bg-slate-50 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 border-none text-white rounded-xl text-xs font-bold hover:opacity-90 transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Save Global Configuration
              </button>
            </div>
          </form>
        </div>
      )}

      {viewMode === 'form' && (
        /* EDIT / CREATE WORKSPACE */
        <div className="bg-white border border-slate-205 rounded-2xl p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-3 mb-5">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
              {editingKey ? 'Modify Map Location Specifications' : 'Provision Modern Map Location Coordinates'}
            </h3>
            <p className="text-[11px] text-slate-450 mt-0.5">Define regional bounds, visual pins layout coordinates, and telemetry statistics.</p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* Left Form fields column */}
              <div className="space-y-4">
                
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Location Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Indiranagar, South Austin, Bengaluru East, etc."
                    className="w-full bg-slate-5/50 border border-slate-200 text-slate-800 text-xs rounded-xl px-4 py-3 focus:border-sky-500 outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">City</label>
                    <input
                      type="text"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      placeholder="e.g. Bengaluru"
                      className="w-full bg-slate-5/50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">State</label>
                    <input
                      type="text"
                      value={formState}
                      onChange={(e) => setFormState(e.target.value)}
                      placeholder="e.g. Karnataka"
                      className="w-full bg-slate-5/50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Country</label>
                    <input
                      type="text"
                      value={formCountry}
                      onChange={(e) => setFormCountry(e.target.value)}
                      placeholder="e.g. India"
                      className="w-full bg-slate-5/50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Latitude Coord</label>
                    <input
                      type="number"
                      step="any"
                      value={formLatitude}
                      onChange={(e) => setFormLatitude(Number(e.target.value))}
                      placeholder="e.g. 12.9716"
                      className="w-full bg-slate-5/50 border border-slate-200 text-slate-800 text-xs rounded-xl px-4 py-2.5 font-mono outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Longitude Coord</label>
                    <input
                      type="number"
                      step="any"
                      value={formLongitude}
                      onChange={(e) => setFormLongitude(Number(e.target.value))}
                      placeholder="e.g. 77.5946"
                      className="w-full bg-slate-5/50 border border-slate-200 text-slate-800 text-xs rounded-xl px-4 py-2.5 font-mono outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Location Slug *</label>
                    <input
                      type="text"
                      required
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      placeholder="e.g. jp-nagar"
                      className="w-full bg-slate-5/50 border border-slate-200 text-slate-800 text-xs rounded-xl px-4 py-2.5 outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Display Priority</label>
                    <input
                      type="number"
                      required
                      value={formDisplayPriority}
                      onChange={(e) => setFormDisplayPriority(Number(e.target.value))}
                      className="w-full bg-slate-5/50 border border-slate-200 text-slate-800 text-xs rounded-xl px-4 py-2.5 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Redirect Type</label>
                    <select
                      value={formRedirectType}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setFormRedirectType(val);
                        // Auto-fill redirectUrl depending on selection
                        if (val === 'Location Page') {
                          setFormRedirectUrl(`/location/${formSlug || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}`);
                        } else if (val === 'Property Collection') {
                          setFormRedirectUrl(`/properties?location=${formName}`);
                        }
                      }}
                      className="w-full bg-slate-5/50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 outline-none font-sans"
                    >
                      <option value="Location Page">Location Page</option>
                      <option value="Property Collection">Property Collection</option>
                      <option value="Custom URL">Custom URL</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Redirect Destination URL</label>
                    <input
                      type="text"
                      required
                      value={formRedirectUrl}
                      onChange={(e) => setFormRedirectUrl(e.target.value)}
                      placeholder="e.g. /location/jp-nagar"
                      className="w-full bg-slate-5/50 border border-slate-200 text-slate-800 text-xs rounded-xl px-4 py-2.5 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Description</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Provide regional or landscape descriptive specifics..."
                    className="w-full bg-slate-5/50 border border-slate-200 text-slate-800 text-xs rounded-xl px-4 py-3 outline-none focus:border-sky-500 font-sans resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Display Image URL</label>
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-5/50 border border-slate-200 text-slate-800 text-xs rounded-xl px-4 py-2 text-left"
                  />
                </div>

              </div>

              {/* Right column: Click-to-Pin map coordinate capturing! */}
              <div className="space-y-4">
                
                <div className="border border-sky-100 bg-sky-50/15 p-4 rounded-2xl relative">
                  <div className="flex items-center gap-1.5 text-sky-850 font-extrabold text-xs mb-2">
                    <Compass className="h-4 w-4 text-sky-500" />
                    Interactive Blueprint Pin Locator
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed max-w-sm mb-3">
                    Click anywhere on the vector SVG silhouette map preview coordinates board below to set the precise relative <strong className="text-slate-700">X Position</strong> and <strong className="text-slate-700">Y Position</strong> pins.
                  </p>

                  <div 
                    ref={pinPlacementRef}
                    onClick={handleMapCoordinateClick}
                    className="w-full aspect-[16/10] bg-slate-900 border border-slate-850 rounded-xl relative cursor-crosshair overflow-hidden select-none"
                  >
                    {/* Metropolitan layout polygon representation */}
                    <svg viewBox="0 0 1000 600" className="absolute inset-0 w-full h-full fill-slate-800/25 stroke-slate-700" strokeWidth="2">
                      <polygon points="100,80 350,60 420,120 700,90 900,150 930,300 850,480 500,560 200,520 80,320" />
                    </svg>

                    {/* Cursor radar pulse rings */}
                    <div 
                      style={{ left: formX, top: formY, borderColor: formPinColor }} 
                      className="absolute w-8 h-8 rounded-full border-2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center animate-pulse"
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: formPinColor }} />
                    </div>

                    <div className="absolute bottom-2.5 right-3 bg-slate-950/75 px-2 py-1 rounded border border-slate-800 font-mono text-[9px]" style={{ color: formPinColor }}>
                      Relative Placement: X={formX} | Y={formY}
                    </div>
                  </div>

                  {/* Manual coordinates backup percentage inputs */}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-left">
                      <label className="block text-[8px] font-black uppercase text-slate-400">Map Canvas X (%)</label>
                      <input 
                        type="text" 
                        value={formX} 
                        onChange={(e) => setFormX(e.target.value)}
                        className="w-full bg-transparent text-slate-800 text-xs font-bold outline-none mt-1 font-mono"
                      />
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-left">
                      <label className="block text-[8px] font-black uppercase text-slate-400">Map Canvas Y (%)</label>
                      <input 
                        type="text" 
                        value={formY} 
                        onChange={(e) => setFormY(e.target.value)}
                        className="w-full bg-transparent text-slate-800 text-xs font-bold outline-none mt-1 font-mono"
                      />
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* 3. CORE STATISTICS FIELDS SECTION */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-1.5 text-slate-800 font-black text-xs uppercase tracking-wider">
                <Activity className="h-4.5 w-4.5 text-blue-500" />
                Live Area Indicator Metrics & Valuation Parameters
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="block text-[9px] font-extrabold uppercase text-slate-505">Available Opportunities</label>
                  <input
                    type="number"
                    min={0}
                    value={formOpportunities}
                    onChange={(e) => setFormOpportunities(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 text-slate-850 text-xs rounded-xl px-4 py-2.5 outline-none"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-[9px] font-extrabold uppercase text-slate-505">Active Requirements</label>
                  <input
                    type="number"
                    min={0}
                    value={formActiveReqs}
                    onChange={(e) => setFormActiveReqs(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 text-slate-850 text-xs rounded-xl px-4 py-2.5 outline-none"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-[9px] font-extrabold uppercase text-slate-505">Site Visits</label>
                  <input
                    type="number"
                    min={0}
                    value={formSiteVisits}
                    onChange={(e) => setFormSiteVisits(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 text-slate-850 text-xs rounded-xl px-4 py-2.5 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
                <div className="space-y-1.5 text-left">
                  <label className="block text-[9px] font-extrabold uppercase text-slate-505">Demand Level</label>
                  <select
                    value={formDemandLevel}
                    onChange={(e) => setFormDemandLevel(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2.5 cursor-pointer outline-none"
                  >
                    <option value="Low">Low Demand</option>
                    <option value="Medium">Medium Demand</option>
                    <option value="High">High Demand</option>
                    <option value="Very High">Very High Demand</option>
                  </select>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-[9px] font-extrabold uppercase text-slate-505">Investment Potential</label>
                  <select
                    value={formInvestmentPotential}
                    onChange={(e) => setFormInvestmentPotential(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2.5 cursor-pointer outline-none"
                  >
                    <option value="Low">Low ROI Potential</option>
                    <option value="Medium">Medium ROI Potential</option>
                    <option value="High">High Return Potential</option>
                    <option value="Exceptional">Exceptional ROI Potential</option>
                  </select>
                </div>

                <div className="space-y-1.5 col-span-2 text-left">
                  <label className="block text-[9px] font-extrabold uppercase text-slate-505">Budget Range</label>
                  <input
                    type="text"
                    value={formAverageBudget}
                    onChange={(e) => setFormAverageBudget(e.target.value)}
                    placeholder="e.g. ₹1.5 Cr - ₹4.8 Cr"
                    className="w-full bg-white border border-slate-200 text-slate-850 text-xs rounded-xl px-4 py-2.5 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200/50">
                <div className="space-y-1 text-left">
                  <label className="block text-[9px] font-extrabold uppercase text-slate-505">Growth Rate</label>
                  <input
                    type="text"
                    value={formGrowthRate || formGrowth}
                    onChange={(e) => {
                      setFormGrowthRate(e.target.value);
                      setFormGrowth(e.target.value);
                    }}
                    placeholder="e.g. +14.2% YoY"
                    className="w-full bg-white border border-slate-200 text-xs rounded-xl px-4 py-2.5 outline-none font-mono"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="block text-[9px] font-extrabold uppercase text-slate-505">Average Property Value</label>
                  <input
                    type="text"
                    value={formAvgPropertyValue || formAvgValuation}
                    onChange={(e) => {
                      setFormAvgPropertyValue(e.target.value);
                      setFormAvgValuation(e.target.value);
                    }}
                    className="w-full bg-white border border-slate-200 text-xs rounded-xl px-4 py-2.5 outline-none font-mono"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="block text-[9px] font-extrabold uppercase text-slate-505">Display Sort Sequence Order</label>
                  <input
                    type="number"
                    value={formDisplayPriority || formDisplayOrder}
                    onChange={(e) => {
                      setFormDisplayPriority(Number(e.target.value));
                      setFormDisplayOrder(Number(e.target.value));
                    }}
                    className="w-full bg-white border border-slate-200 text-xs rounded-xl px-4 py-2.5 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2 text-left">
                <label className="block text-[9px] font-extrabold uppercase text-slate-505">Location Highlights</label>
                <input
                  type="text"
                  value={formLocationHighlights || formBenefits}
                  onChange={(e) => {
                    setFormLocationHighlights(e.target.value);
                    setFormBenefits(e.target.value);
                  }}
                  placeholder="e.g. Near Outer Ring Road, elite upcoming metro line access, water storage reserves, high footfall corridors"
                  className="w-full bg-white border border-slate-200 text-xs rounded-xl px-4 py-2.5 outline-none"
                />
              </div>

            </div>

            {/* HOMEPAGE MAP CONTROLLER CARD */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-1.5 text-slate-800 font-extrabold text-xs uppercase tracking-wider">
                <Palette className="h-4.5 w-4.5 text-sky-500" />
                Homepage Map Pin Controller
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-2xl mt-0.5">
                Customize display colors, visual icons, and publication parameters for the landing page coordinate maps instantly.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="space-y-1.5 text-left">
                  <label className="block text-[9.5px] uppercase font-black text-slate-500 tracking-wider">Show On Homepage Map</label>
                  <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-150">
                    <button
                      type="button"
                      onClick={() => setFormShowOnHomepage(true)}
                      className={`flex-1 py-1 px-3 text-center rounded-lg text-[10px] font-bold cursor-pointer transition ${
                        formShowOnHomepage ? 'bg-white shadow text-slate-900 font-extrabold' : 'text-slate-550'
                      }`}
                    >
                      Yes (Render Pin)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormShowOnHomepage(false)}
                      className={`flex-1 py-1 px-3 text-center rounded-lg text-[10px] font-bold cursor-pointer transition ${
                        !formShowOnHomepage ? 'bg-white shadow text-slate-900 font-extrabold' : 'text-slate-550'
                      }`}
                    >
                      No (Hide)
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-[9.5px] uppercase font-black text-slate-500 tracking-wider">Featured Location Badge</label>
                  <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-150">
                    <button
                      type="button"
                      onClick={() => setFormFeaturedLocation(true)}
                      className={`flex-1 py-1 px-3 text-center rounded-lg text-[10px] font-bold cursor-pointer transition ${
                        formFeaturedLocation ? 'bg-white shadow text-emerald-600 font-extrabold' : 'text-slate-550'
                      }`}
                    >
                      Featured
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormFeaturedLocation(false)}
                      className={`flex-1 py-1 px-3 text-center rounded-lg text-[10px] font-bold cursor-pointer transition ${
                        !formFeaturedLocation ? 'bg-white shadow text-slate-500 font-extrabold' : 'text-slate-550'
                      }`}
                    >
                      Standard
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-[9.5px] uppercase font-black text-slate-500 tracking-wider">Pin Live Status</label>
                  <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-150">
                    <button
                      type="button"
                      onClick={() => setFormActivePin(true)}
                      className={`flex-1 py-1 px-3 text-center rounded-lg text-[10px] font-bold cursor-pointer transition ${
                        formActivePin ? 'bg-white shadow text-emerald-600 font-extrabold' : 'text-slate-550'
                      }`}
                    >
                      Active Pin
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormActivePin(false)}
                      className={`flex-1 py-1 px-3 text-center rounded-lg text-[10px] font-bold cursor-pointer transition ${
                        !formActivePin ? 'bg-white shadow text-amber-700 font-extrabold' : 'text-slate-550'
                      }`}
                    >
                      Disabled
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-slate-100">
                <div className="space-y-1.5 text-left">
                  <label className="block text-[9.5px] uppercase font-black text-slate-500 tracking-wider">Pin Highlight Canvas Color</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      { hex: '#ff5a3c', label: 'Coral Flame' },
                      { hex: '#10b981', label: 'Emerald' },
                      { hex: '#0ea5e9', label: 'Sky Blue' },
                      { hex: '#8b5cf6', label: 'Violet' },
                      { hex: '#f59e0b', label: 'Amber' },
                      { hex: '#ef4444', label: 'Ruby Red' },
                    ].map(col => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setFormPinColor(col.hex)}
                        title={col.label}
                        className={`w-7 h-7 rounded-full border-2 transition cursor-pointer relative ${
                          formPinColor === col.hex ? 'border-slate-800 scale-105 shadow' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: col.hex }}
                      >
                        {formPinColor === col.hex && (
                          <span className="absolute inset-0 m-auto w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </button>
                    ))}
                    <input 
                      type="text" 
                      value={formPinColor} 
                      onChange={(e) => setFormPinColor(e.target.value)}
                      className="ml-2 w-24 px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-800 font-mono focus:border-sky-505"
                      placeholder="#ff5a3c"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-[9.5px] uppercase font-black text-slate-500 tracking-wider">Vector Pin Icon Style</label>
                  <select
                    value={formPinIcon}
                    onChange={(e) => setFormPinIcon(e.target.value)}
                    className="w-full bg-slate-5/50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 cursor-pointer outline-none font-bold"
                  >
                    <option value="MapPin">📍 Classic Pin</option>
                    <option value="Home">🏠 Home Accent</option>
                    <option value="Building">🏢 Highrise Structure</option>
                    <option value="Star">⭐ Gold Star Premium</option>
                    <option value="Compass">🧭 Compass Landmark</option>
                    <option value="Layers">🥞 Bento Layers Grid</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quit/Save buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-4 py-2.5 border border-slate-205 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Quit Workspace
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl text-xs font-bold transition duration-150 cursor-pointer shadow-md shadow-sky-100"
              >
                {editingKey ? 'Commit Coordinate Adjustments' : 'Pin & Deploy Active Location'}
              </button>
            </div>

          </form>
        </div>
      )}

      {viewMode === 'list' && (
        /* LIST GRID ADMIN DATA LEDGER */
        <div className="space-y-4">
          
          {/* SEARCH COMPARTMENT */}
          <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-xs">
            <div className="relative text-left">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search pinned cities, location names, state bounds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-5/50 border border-slate-200 text-slate-700 text-xs rounded-xl focus:border-sky-505 outline-none"
              />
            </div>
          </div>

          {/* TABLE COMPONENT */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 font-mono text-[9px] uppercase tracking-wider text-slate-500">
                    <th className="py-4.5 px-5 font-black w-24">Canvas Pin</th>
                    <th className="py-4.5 px-4 font-black">Location Area</th>
                    <th className="py-4.5 px-4 font-black w-36">Avg Property Value</th>
                    <th className="py-4.5 px-4 font-black w-32">Status</th>
                    <th className="py-4.5 px-4 font-black w-32">Spotlight Badge</th>
                    <th className="py-4.5 px-4 font-black w-48 text-right pr-6">Management Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-left">
                  {filteredLocations.map((key) => {
                    const loc = mapLocations[key];
                    const isLocActive = loc.status !== 'Disabled' && loc.activePin !== false;
                    const isLocFeatured = loc.featured !== false || loc.featuredLocation === true;
                    
                    return (
                      <tr key={key} className="hover:bg-slate-5/10 transition group">
                        
                        {/* Map Pin Anchor metrics coordinate view */}
                        <td className="py-4.5 px-5 text-center">
                          <span 
                            className="inline-block font-mono text-[10px] font-heavy py-1 px-1.5 rounded-lg border text-white font-bold" 
                            title={`Relative coordinates on map canvas overlay: X=${loc.x} | Y=${loc.y}`}
                            style={{ backgroundColor: loc.pinColor || '#ff5a3c', borderColor: loc.pinColor || '#ff5a3c' }}
                          >
                            {loc.x} , {loc.y}
                          </span>
                        </td>

                        {/* Location Details */}
                        <td className="py-4.5 px-4 text-left">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-extrabold text-slate-800 tracking-tight leading-none block">
                                {loc.name || key}
                              </span>
                              {loc.city && (
                                <span className="text-[10px] text-slate-450 font-mono bg-slate-100 px-1.5 py-0.5 border border-slate-200 rounded">
                                  {loc.city}, {loc.state}
                                </span>
                              )}
                            </div>
                            <span className="block text-[11px] text-slate-500 font-light max-w-sm truncate mt-1">
                              📍 {loc.benefits}
                            </span>
                          </div>
                        </td>

                        {/* Median Value & Growth */}
                        <td className="py-4.5 px-4">
                          <div className="font-sans">
                            <span className="block font-bold text-slate-800">{loc.avgValuation || 'Custom'}</span>
                            <span className="block text-[10px] font-mono text-emerald-500 font-bold mt-0.5">{loc.growth || '+12.5%'}</span>
                          </div>
                        </td>

                        {/* Status (Active / Disabled) */}
                        <td className="py-4.5 px-4">
                          <button
                            onClick={() => handleToggleStatus(key)}
                            className="cursor-pointer text-left block"
                            title="Toggle publishing state on landing maps"
                          >
                            {isLocActive ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-100">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active Pin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-extrabold border border-amber-100">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                Disabled
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Featured (Star Badge) */}
                        <td className="py-4.5 px-4">
                          <button
                            onClick={() => handleToggleFeatured(key)}
                            className="cursor-pointer text-left block"
                            title="Add/Remove premium featured rating spotlight"
                          >
                            {isLocFeatured ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-50 text-yellow-700 text-[10px] font-bold border border-yellow-100">
                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /> Featured
                              </span>
                            ) : (
                              <span className="inline-flex px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                                Standard
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Actions buttons */}
                        <td className="py-4.5 px-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition duration-150">
                            
                            <button
                              onClick={() => handleEditLocationClick(key)}
                              className="p-1.5 bg-white hover:bg-slate-50 border border-slate-205 text-slate-650 transition rounded-lg"
                              title="Edit coordinates & map parameters"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => setShowDeleteConfirm(key)}
                              className="p-1.5 bg-white hover:bg-red-50 border border-slate-205 hover:border-red-150 text-slate-400 hover:text-red-500 transition rounded-lg"
                              title="Delete location completely"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer status summary line */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>Showing {filteredLocations.length} locations</span>
              <span>Map Synchronization Engine: Active & Real-time Syncing</span>
            </div>

          </div>

        </div>
      )}

      {/* 4. CONFIRM DELETE MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl text-left">
            <div className="flex items-center gap-3 text-red-650">
              <div className="p-2.5 bg-red-50 border border-red-100 rounded-xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 leading-tight">Delete Map Location pin</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">This action is permanent and takes down bounds instantly.</p>
              </div>
            </div>

            <p className="text-xs text-slate-650 leading-relaxed font-light">
              This will remove the selected location target point <strong>({showDeleteConfirm})</strong> from the interactive landing page map. Users will no longer see this location.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                className="py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs transition text-center cursor-pointer"
              >
                Cancel, Keep Pin
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition text-center shadow-md shadow-red-100 cursor-pointer"
              >
                Yes, Wipe Location
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
