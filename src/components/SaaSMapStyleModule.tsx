import React, { useState, useEffect } from 'react';
import { 
  Palette, Map, Shield, HelpCircle, Save, X, Settings2, Globe, Compass, 
  MapPin, Eye, MousePointer, Cpu, Volume2, AlertCircle, Info, Check, Sparkles, Navigation
} from 'lucide-react';
import { MapSettings } from '../types';

interface SaaSMapStyleModuleProps {
  mapSettings?: MapSettings;
  onUpdateMapSettings?: (settings: MapSettings) => void;
  onClose?: () => void;
}

export default function SaaSMapStyleModule({ 
  mapSettings, 
  onUpdateMapSettings,
  onClose
}: SaaSMapStyleModuleProps) {
  // Local copies of state to enable edit tracking and saving
  const [activeProvider, setActiveProvider] = useState<MapSettings['activeProvider']>('OpenStreetMap');
  const [activeStyle, setActiveStyle] = useState<string>('Standard');
  const [defaultZoom, setDefaultZoom] = useState<number>(10);
  const [defaultLat, setDefaultLat] = useState<number>(12.9716);
  const [defaultLng, setDefaultLng] = useState<number>(77.5946);

  // Custom Provider Specifics
  const [customProviderName, setCustomProviderName] = useState('Global Coordinates API');
  const [customApiKey, setCustomApiKey] = useState('');
  const [customMapUrl, setCustomMapUrl] = useState('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
  const [customEnabled, setCustomEnabled] = useState(false);

  // Homepage Settings Toggles
  const [enableSearch, setEnableSearch] = useState(true);
  const [enableClustering, setEnableClustering] = useState(false);
  const [enablePropertyCountPins, setEnablePropertyCountPins] = useState(true);

  // Pin Configuration parameters
  const [pinColor, setPinColor] = useState('#0ea5e9');
  const [pinSize, setPinSize] = useState('medium');
  const [pinIcon, setPinIcon] = useState('MapPin');
  const [featuredPinStyle, setFeaturedPinStyle] = useState('glowing');
  const [hoverAnimation, setHoverAnimation] = useState('bounce');
  const [clickAnimation, setClickAnimation] = useState('radar_ping');

  // Map Display Setting visibility flags
  const [showLocationName, setShowLocationName] = useState(true);
  const [showOpportunitiesCount, setShowOpportunitiesCount] = useState(true);
  const [showRequirementsCount, setShowRequirementsCount] = useState(true);
  const [showDemandLevel, setShowDemandLevel] = useState(true);
  const [showInvestmentRating, setShowInvestmentRating] = useState(true);

  // Interactive UI indicators
  const [isModified, setIsModified] = useState(false);
  const [showQuitWarning, setShowQuitWarning] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Track initial values to assess modifications accurately
  useEffect(() => {
    if (mapSettings) {
      setActiveProvider(mapSettings.activeProvider || 'OpenStreetMap');
      setActiveStyle(mapSettings.activeStyle || 'Standard');
      setDefaultZoom(mapSettings.defaultZoom || 10);
      setDefaultLat(mapSettings.defaultCenterLat || 12.9716);
      setDefaultLng(mapSettings.defaultCenterLng || 77.5946);
      
      setCustomProviderName(mapSettings.customProviderName || 'Global Coordinates API');
      setCustomApiKey(mapSettings.customApiKey || '');
      setCustomMapUrl(mapSettings.customMapUrl || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
      setCustomEnabled(!!mapSettings.customEnabled);

      setEnableSearch(mapSettings.enableSearch !== false);
      setEnableClustering(!!mapSettings.enableClustering);
      setEnablePropertyCountPins(mapSettings.enablePropertyCountPins !== false);

      setPinColor(mapSettings.pinColor || '#0ea5e9');
      setPinSize(mapSettings.pinSize || 'medium');
      setPinIcon(mapSettings.pinIcon || 'MapPin');
      setFeaturedPinStyle(mapSettings.featuredPinStyle || 'glowing');
      setHoverAnimation(mapSettings.hoverAnimation || 'bounce');
      setClickAnimation(mapSettings.clickAnimation || 'radar_ping');

      setShowLocationName(mapSettings.showLocationName !== false);
      setShowOpportunitiesCount(mapSettings.showOpportunitiesCount !== false);
      setShowRequirementsCount(mapSettings.showRequirementsCount !== false);
      setShowDemandLevel(mapSettings.showDemandLevel !== false);
      setShowInvestmentRating(mapSettings.showInvestmentRating !== false);
      
      setIsModified(false);
    }
  }, [mapSettings]);

  // Set modified on changes
  const handleValueChange = () => {
    setIsModified(true);
  };

  // Provider styles index mapper
  const styleOptionsByProvider: Record<MapSettings['activeProvider'], string[]> = {
    'Google Maps': ['Road Map', 'Satellite View', 'Terrain View', 'Hybrid View'],
    'Mapbox': ['Streets', 'Light', 'Dark', 'Satellite', 'Navigation'],
    'OpenStreetMap': ['Standard', 'Humanitarian', 'Transport'],
    'Real Estate Map Styles': ['Luxury Light Theme', 'Sky Blue Property Theme', 'Investment Heatmap', 'Demand Heatmap', 'Opportunity Density Map'],
    'Custom Map Provider': ['Standard Render Layer', 'Custom Vector Sub-Layer']
  };

  // Switch styles array dynamically when active provider changes
  const handleProviderChange = (newProvider: MapSettings['activeProvider']) => {
    setActiveProvider(newProvider);
    const styles = styleOptionsByProvider[newProvider];
    setActiveStyle(styles[0]);
    handleValueChange();
  };

  // Trigger real backend sync and save
  const handleDeployMapStyles = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateMapSettings) return;

    const finalSettings: MapSettings = {
      activeProvider,
      activeStyle,
      defaultZoom: Number(defaultZoom),
      defaultCenterLat: Number(defaultLat),
      defaultCenterLng: Number(defaultLng),
      customProviderName,
      customApiKey,
      customMapUrl,
      customEnabled,
      enableSearch,
      enableClustering,
      enablePropertyCountPins,
      pinColor,
      pinSize,
      pinIcon,
      featuredPinStyle,
      hoverAnimation,
      clickAnimation,
      showLocationName,
      showOpportunitiesCount,
      showRequirementsCount,
      showDemandLevel,
      showInvestmentRating
    };

    onUpdateMapSettings(finalSettings);
    setIsModified(false);
    setShowSaveSuccess(true);
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 4000);
  };

  // Quit Workspace with warning confirmation
  const handleQuitWorkspaceClick = () => {
    if (isModified) {
      setShowQuitWarning(true);
    } else {
      if (onClose) onClose();
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sky-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Palette className="h-6 w-6 text-sky-500" />
            Map Style Management
          </h2>
          <p className="text-xs text-slate-500">
            Regulate homepage map styles, provider APIs, custom styles, location pinning visualizers, and display criteria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleQuitWorkspaceClick}
            type="button"
            className="px-4 py-2 border border-slate-205 text-slate-700 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" /> Quit Workspace
          </button>
          
          <button
            onClick={handleDeployMapStyles}
            type="button"
            className="px-5 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-sky-100 transition duration-150 flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> Save Map Styles
          </button>
        </div>
      </div>

      {/* SUCCESS ALERTS */}
      {showSaveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start gap-3 animate-fade-in text-xs font-medium">
          <div className="bg-emerald-500 text-white p-1 rounded-full">
            <Check className="h-3 w-3" />
          </div>
          <div className="space-y-1">
            <strong className="block font-bold">Workspace Styles Deployed Successfully!</strong>
            <p className="text-[11px] text-emerald-600">
              The configuration is committed to the cloud Firestore. Pinned maps, coordinate markers, and styling profiles will refresh instantly on user interfaces.
            </p>
          </div>
        </div>
      )}

      {/* CORE WORKSPACE FORM */}
      <form onSubmit={handleDeployMapStyles} className="space-y-6">

        {/* SECTION 1: MAP PROVIDER & SPECIFIC CHANNELS */}
        <div id="styles-options-card" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Map className="h-5 w-5 text-sky-500" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Active Map Provider & Visual Style Selection
              </h3>
              <p className="text-[11px] text-slate-450">Switch mapping engines and set specific color styling schemes dynamically.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
            {/* Active Provider Selector */}
            <div className="space-y-2">
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                Primary Mapping Provider Engine
              </label>
              <select
                value={activeProvider}
                onChange={(e) => {
                  handleProviderChange(e.target.value as MapSettings['activeProvider']);
                }}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-3 cursor-pointer outline-none font-bold"
              >
                <option value="OpenStreetMap">🛒 OpenStreetMap (Open Source Map Server)</option>
                <option value="Google Maps">📍 Google Maps Standard API (SaaS Engine)</option>
                <option value="Mapbox">🗺️ Mapbox Studio WebGL Server</option>
                <option value="Real Estate Map Styles">🎯 Specialized Real Estate Visual Overlays</option>
                <option value="Custom Map Provider">🔌 Custom Third-Party Map Provider</option>
              </select>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-[10px] text-slate-500 leading-relaxed">
                {activeProvider === 'OpenStreetMap' && 'OSM acts as the baseline high-performance system map layer, pulling coordinates dynamically for zero cost.'}
                {activeProvider === 'Google Maps' && 'Google web SDK generates Road, Satellite, and Terrain views. Requires Google Cloud Maps credential setup.'}
                {activeProvider === 'Mapbox' && 'Mapbox renders advanced, vectors-based custom styling (such as Navigation, Dark Mode or Streets GL) optimized for mobile.'}
                {activeProvider === 'Real Estate Map Styles' && 'Heatmaps and dense gradient overlays depicting property valuations, active buyer demands, and high opportunities areas.'}
                {activeProvider === 'Custom Map Provider' && 'Allows connecting any WMS or XYZ tile coordinate endpoints with key validations instantly.'}
              </div>
            </div>

            {/* Active Style Scheme Dropdown */}
            <div className="space-y-2">
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                Mapping Aesthetics Scheme (Active Style)
              </label>
              <div className="flex flex-col gap-2">
                <select
                  value={activeStyle}
                  onChange={(e) => {
                    setActiveStyle(e.target.value);
                    handleValueChange();
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-3 cursor-pointer outline-none font-bold"
                >
                  {styleOptionsByProvider[activeProvider].map((option) => (
                    <option key={option} value={option}>
                      🎨 {option}
                    </option>
                  ))}
                </select>

                {/* Sublist representation layout for administrative support */}
                <div className="p-3 bg-sky-50/15 border border-sky-100/50 rounded-xl space-y-1">
                  <span className="block text-[9px] uppercase font-black text-slate-400">Selected Aesthetics Profile</span>
                  <div className="flex items-center justify-between text-[11px] text-slate-700 font-bold">
                    <span>{activeStyle} View</span>
                    <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono uppercase">ONLINE & ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CUSTOM PROVIDER FIELD COLLAPSIBLE DETAILS */}
          {activeProvider === 'Custom Map Provider' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 gap-4 grid grid-cols-1 md:grid-cols-2 text-xs">
              <div className="col-span-1 md:col-span-2 text-[10px] font-extrabold uppercase text-slate-600 tracking-wider border-b border-slate-200 pb-1.5">
                🔌 Custom API Connection Configuration
              </div>
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-slate-500">Provider Display Name</label>
                <input
                  type="text"
                  value={customProviderName}
                  onChange={(e) => {
                    setCustomProviderName(e.target.value);
                    handleValueChange();
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs outline-none"
                  placeholder="e.g. ArcGis Corp Endpoint"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-slate-500">API Gateway Key</label>
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => {
                    setCustomApiKey(e.target.value);
                    handleValueChange();
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs outline-none"
                  placeholder="Insert authorization credentials..."
                />
              </div>

              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <label className="block text-[9px] font-bold text-slate-500">XYZ Custom Tile Coordinates URL Endpoint</label>
                <input
                  type="text"
                  value={customMapUrl}
                  onChange={(e) => {
                    setCustomMapUrl(e.target.value);
                    handleValueChange();
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs font-mono outline-none"
                  placeholder="e.g. https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
                />
              </div>

              <div className="col-span-1 md:col-span-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCustomEnabled(!customEnabled);
                    handleValueChange();
                  }}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                    customEnabled 
                      ? 'bg-emerald-600 border-none text-white' 
                      : 'bg-slate-200 border border-slate-300 text-slate-600'
                  }`}
                >
                  {customEnabled ? '🔌 Gateway Connected' : '🔌 Enable Custom Gateway'}
                </button>
                <span className="text-[10px] text-slate-450 font-light">
                  Directs landing page vector rendering engine to fetch layers from this XYZ coordinate system.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: HOMEPAGE SETTINGS & LOCATION ARCS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left panel: Homepage global controls */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Settings2 className="h-5 w-5 text-indigo-500" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                  Homepage Navigation & Coordinates
                </h3>
                <p className="text-[11px] text-slate-450">Set defaults viewport zooms, centers, search toggles, and data groupings.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-[9px] font-heavy text-slate-500 uppercase font-mono">Zoom Default</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={defaultZoom}
                  onChange={(e) => {
                    setDefaultZoom(Number(e.target.value));
                    handleValueChange();
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-heavy text-slate-500 uppercase font-mono">Center Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={defaultLat}
                  onChange={(e) => {
                    setDefaultLat(Number(e.target.value));
                    handleValueChange();
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-heavy text-slate-500 uppercase font-mono">Center Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={defaultLng}
                  onChange={(e) => {
                    setDefaultLng(Number(e.target.value));
                    handleValueChange();
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono"
                />
              </div>
            </div>

            {/* Switch sliders with labels */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/55 rounded-xl transition border border-slate-150">
                <div className="space-y-0.5 text-left">
                  <span className="block text-xs font-bold text-slate-800">Enable Search overlay</span>
                  <span className="block text-[10px] text-slate-450">Render keyword search inputs directly on map frame.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEnableSearch(!enableSearch);
                    handleValueChange();
                  }}
                  className={`w-11 h-6 rounded-full transition duration-200 focus:outline-none relative flex items-center cursor-pointer ${
                    enableSearch ? 'bg-indigo-600 justify-end' : 'bg-slate-200 justify-start'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-md mx-0.5" />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/55 rounded-xl transition border border-slate-150">
                <div className="space-y-0.5 text-left">
                  <span className="block text-xs font-bold text-slate-800">Enable Pinned Coordinates Clustering</span>
                  <span className="block text-[10px] text-slate-450">Group nodes which are in close proximity into bubbles.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEnableClustering(!enableClustering);
                    handleValueChange();
                  }}
                  className={`w-11 h-6 rounded-full transition duration-200 focus:outline-none relative flex items-center cursor-pointer ${
                    enableClustering ? 'bg-indigo-600 justify-end' : 'bg-slate-200 justify-start'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-md mx-0.5" />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/55 rounded-xl transition border border-slate-150">
                <div className="space-y-0.5 text-left">
                  <span className="block text-xs font-bold text-slate-800">Enable Property Asset Count Pins</span>
                  <span className="block text-[10px] text-slate-450">Draw property numeric counts beside pin labels on map canvas.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEnablePropertyCountPins(!enablePropertyCountPins);
                    handleValueChange();
                  }}
                  className={`w-11 h-6 rounded-full transition duration-200 focus:outline-none relative flex items-center cursor-pointer ${
                    enablePropertyCountPins ? 'bg-indigo-600 justify-end' : 'bg-slate-200 justify-start'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-md mx-0.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Right panel: Locations pin visual setup */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="h-5 w-5 text-emerald-500" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                  Location Pin Settings & Indicators
                </h3>
                <p className="text-[11px] text-slate-450">Customize physical pin aesthetics, icon badges, and micro-animations.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              
              {/* Default Pin color */}
              <div className="space-y-1 text-left">
                <label className="block text-[10px] uppercase font-bold text-slate-505">Global Pin Color Accent</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={pinColor}
                    onChange={(e) => {
                      setPinColor(e.target.value);
                      handleValueChange();
                    }}
                    className="w-10 h-10 border border-slate-200 rounded-xl cursor-pointer"
                  />
                  <input
                    type="text"
                    value={pinColor}
                    onChange={(e) => {
                      setPinColor(e.target.value);
                      handleValueChange();
                    }}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono uppercase text-slate-700 font-bold"
                  />
                </div>
              </div>

              {/* Pin scale size */}
              <div className="space-y-1 text-left">
                <label className="block text-[10px] uppercase font-bold text-slate-505">Active Pin Scale</label>
                <select
                  value={pinSize}
                  onChange={(e) => {
                    setPinSize(e.target.value);
                    handleValueChange();
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 font-bold cursor-pointer"
                >
                  <option value="small">Small (Height 32px)</option>
                  <option value="medium">Medium Default (Height 40px)</option>
                  <option value="large">Large Highlight (Height 48px)</option>
                </select>
              </div>

              {/* Vector Icon Preset */}
              <div className="space-y-1 text-left">
                <label className="block text-[10px] uppercase font-bold text-slate-505">Pin Anchor Icon Badge</label>
                <select
                  value={pinIcon}
                  onChange={(e) => {
                    setPinIcon(e.target.value);
                    handleValueChange();
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 font-bold cursor-pointer"
                >
                  <option value="MapPin">📍 Standard MapPin</option>
                  <option value="Home">🏠 Residential Home</option>
                  <option value="Building">🏢 Executive Commercial</option>
                  <option value="Star">⭐ Gold Star Rating</option>
                  <option value="Compass">🧭 Navigation compass</option>
                  <option value="Layers">🥞 Bento stacked layers</option>
                </select>
              </div>

              {/* Featured Pin Style */}
              <div className="space-y-1 text-left">
                <label className="block text-[10px] uppercase font-bold text-slate-505">Featured Pin Theme style</label>
                <select
                  value={featuredPinStyle}
                  onChange={(e) => {
                    setFeaturedPinStyle(e.target.value);
                    handleValueChange();
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 font-bold cursor-pointer"
                >
                  <option value="default">Standard Pin Highlight</option>
                  <option value="glowing">Glowing Pulse Rings (Ambient Waves)</option>
                  <option value="pulsing_star">Pulsing Star Accent Scale</option>
                  <option value="luxury_badge">Luxury Corporate Gold Shield</option>
                </select>
              </div>

              {/* Micro interactive Animation hover */}
              <div className="space-y-1 text-left">
                <label className="block text-[10px] uppercase font-bold text-slate-505 font-mono">Hover Interaction</label>
                <select
                  value={hoverAnimation}
                  onChange={(e) => {
                    setHoverAnimation(e.target.value);
                    handleValueChange();
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 cursor-pointer outline-none"
                >
                  <option value="fade">Subtle Fade In Overlay</option>
                  <option value="bounce font-sans font-bold">🎯 Elegant Vertical Bounce</option>
                  <option value="zoom">Elastic Zoom-In Accent</option>
                  <option value="spin">Subtle Infinite Spin Accent</option>
                </select>
              </div>

              {/* Interaction active click */}
              <div className="space-y-1 text-left">
                <label className="block text-[10px] uppercase font-bold text-slate-505 font-mono">Focus Touch Interaction</label>
                <select
                  value={clickAnimation}
                  onChange={(e) => {
                    setClickAnimation(e.target.value);
                    handleValueChange();
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 cursor-pointer outline-none"
                >
                  <option value="bounce_active">Active Repeat Bounce</option>
                  <option value="radar_ping">✨ Dynamic Compass Radar Pulsar</option>
                  <option value="expand_card">Expand Asset Details Drawer</option>
                  <option value="none">No Anim (Instant Load)</option>
                </select>
              </div>

            </div>
          </div>
        </div>

        {/* SECTION 3: MAP DISPLAY FIELDS CONFIRMATION */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Eye className="h-5 w-5 text-sky-500" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Interactive Pin Tooltips & Display Settings
              </h3>
              <p className="text-[11px] text-slate-450 font-light">Choose which market signals are printed when users click location pins.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            
            <button
              type="button"
              onClick={() => {
                setShowLocationName(!showLocationName);
                handleValueChange();
              }}
              className={`p-3.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
                showLocationName 
                  ? 'bg-sky-50 border-sky-200 text-sky-900 font-extrabold shadow-xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <span className="text-[9px] uppercase tracking-wider font-extrabold">Location Name</span>
              <span className="block text-[11px] font-mono">{showLocationName ? 'ON' : 'HIDDEN'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowOpportunitiesCount(!showOpportunitiesCount);
                handleValueChange();
              }}
              className={`p-3.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
                showOpportunitiesCount 
                  ? 'bg-sky-50 border-sky-200 text-sky-900 font-extrabold shadow-xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <span className="text-[9px] uppercase tracking-wider font-extrabold">Opportunities</span>
              <span className="block text-[11px] font-mono">{showOpportunitiesCount ? 'ON' : 'HIDDEN'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowRequirementsCount(!showRequirementsCount);
                handleValueChange();
              }}
              className={`p-3.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
                showRequirementsCount 
                  ? 'bg-sky-50 border-sky-200 text-sky-900 font-extrabold shadow-xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <span className="text-[9px] uppercase tracking-wider font-extrabold">CRM Demands</span>
              <span className="block text-[11px] font-mono">{showRequirementsCount ? 'ON' : 'HIDDEN'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowDemandLevel(!showDemandLevel);
                handleValueChange();
              }}
              className={`p-3.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
                showDemandLevel 
                  ? 'bg-sky-50 border-sky-200 text-sky-900 font-extrabold shadow-xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <span className="text-[9px] uppercase tracking-wider font-extrabold">Demand Level</span>
              <span className="block text-[11px] font-mono">{showDemandLevel ? 'ON' : 'HIDDEN'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowInvestmentRating(!showInvestmentRating);
                handleValueChange();
              }}
              className={`p-3.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
                showInvestmentRating 
                  ? 'bg-sky-50 border-sky-205 text-sky-900 font-extrabold shadow-xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <span className="text-[9px] uppercase tracking-wider font-extrabold">ROI Ratings</span>
              <span className="block text-[11px] font-mono">{showInvestmentRating ? 'ON' : 'HIDDEN'}</span>
            </button>

          </div>
        </div>

        {/* REPLICATING MAIN DEPLOY & QUIT CTA STRIP */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={handleQuitWorkspaceClick}
            className="px-6 py-3 border border-slate-250 text-slate-700 font-bold bg-white hover:bg-slate-50 rounded-xl text-xs transition cursor-pointer"
          >
            Quit Workspace
          </button>
          
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl text-xs font-black tracking-wide hover:shadow-lg hover:shadow-sky-100 transition duration-150 cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Save & Deploy Map style parameters
          </button>
        </div>

      </form>

      {/* WARNING NOTIFICATION CONFIDENTIALITY CANCEL MODAL */}
      {showQuitWarning && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-50 text-red-500 rounded-xl">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 leading-tight">Unsaved Map Changes</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  You have made adjustive coordinates modifications to the homepage map blueprints. 
                  Leaving now will cause these custom settings to be discarded. Are you sure you wish to exit the panel?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowQuitWarning(false)}
                className="px-3.5 py-2 hover:bg-slate-100 border border-transparent rounded-lg text-xs font-bold text-slate-600 cursor-pointer"
              >
                No, Stay Here
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowQuitWarning(false);
                  if (onClose) onClose();
                }}
                className="px-4 py-2 bg-red-600 border-none text-white rounded-lg text-xs font-bold hover:bg-red-700 cursor-pointer transition"
              >
                Yes, Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
