import React, { useEffect, useState, useMemo } from 'react';
import { 
  ArrowLeft, Share2, Heart, BadgeCheck, MapPin, Ruler,
  Phone, MessageSquare, Star, HelpCircle, FileText, Shield, 
  Map, DollarSign, Calculator, TrendingUp, Grid, ShieldCheck, 
  Calendar, CheckCircle2, ChevronRight, ChevronLeft, Compass, Info, Award,
  Users, Check, ExternalLink, Activity, Sparkles, Building, AlertCircle, X,
  GraduationCap, Milestone, Train, ShoppingBag, Bus, Plane, Maximize2, Layers,
  Car, Plus, Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Property, ActiveTab } from '../types';

interface PremiumPropertyDetailViewProps {
  property: Property | null;
  properties: Property[];
  onBack: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  onOpenCustomRequest: () => void;
  onBookSiteVisit: (property: Property) => void;
}

// Pre-defined plot availability list for interactive sandbox
const INITIAL_PLOTS = [
  { id: 'P-1', size: 1200, status: 'available', price: '18.0 Lakhs', facing: 'East' },
  { id: 'P-2', size: 1500, status: 'sold', price: '22.5 Lakhs', facing: 'North' },
  { id: 'P-3', size: 1200, status: 'available', price: '18.0 Lakhs', facing: 'East' },
  { id: 'P-4', size: 1200, status: 'available', price: '18.2 Lakhs', facing: 'West' },
  { id: 'P-5', size: 1800, status: 'reserved', price: '27.0 Lakhs', facing: 'East' },
  { id: 'P-6', size: 1500, status: 'available', price: '22.5 Lakhs', facing: 'North' },
  { id: 'P-7', size: 2400, status: 'sold', price: '36.0 Lakhs', facing: 'North-East' },
  { id: 'P-8', size: 1200, status: 'available', price: '18.0 Lakhs', facing: 'West' },
  { id: 'P-9', size: 1200, status: 'available', price: '18.0 Lakhs', facing: 'West' },
  { id: 'P-10', size: 1500, status: 'sold', price: '22.5 Lakhs', facing: 'East' },
  { id: 'P-11', size: 1500, status: 'available', price: '22.8 Lakhs', facing: 'North' },
  { id: 'P-12', size: 1200, status: 'available', price: '18.0 Lakhs', facing: 'South' },
  { id: 'P-13', size: 1800, status: 'sold', price: '27.0 Lakhs', facing: 'East' },
  { id: 'P-14', size: 1200, status: 'available', price: '18.0 Lakhs', facing: 'West' },
  { id: 'P-15', size: 1200, status: 'reserved', price: '18.5 Lakhs', facing: 'North' },
  { id: 'P-16', size: 2400, status: 'available', price: '36.5 Lakhs', facing: 'North-West' }
];

// Premium luxury animations helpers
const ShimmerOverlay = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-10 opacity-30">
    <motion.div 
      className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12"
      animate={{
        x: ['-100%', '100%']
      }}
      transition={{
        duration: 3.5,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
        repeatDelay: 3
      }}
    />
  </div>
);

function AnimatedCounter({ value, duration = 1.5, decimals = 0 }: { value: number, duration?: number, decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = 0;
    
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeProgress = progress * (2 - progress); // easeOutQuad
      const current = startValue + easeProgress * (value - startValue);
      setDisplayValue(current);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <>{decimals === 0 ? Math.round(displayValue).toLocaleString('en-IN') : displayValue.toFixed(decimals)}</>;
}

export default function PremiumPropertyDetailView({
  property,
  properties,
  onBack,
  setActiveTab,
  favorites,
  toggleFavorite,
  onOpenCustomRequest,
  onBookSiteVisit
}: PremiumPropertyDetailViewProps) {

  const [activeSection, setActiveSection] = useState('overview');
  const [galleryTab, setGalleryTab] = useState<'photos' | 'drone' | 'layout' | 'video' | '360'>('photos');

  // Dynamic Appearance branding settings
  const app = useMemo(() => property?.appearance || {}, [property]);
  const primaryColor = app.primaryColor || '#ff5a3c';
  const secondaryColor = app.secondaryColor || '#1e293b';
  const accentColor = app.accentColor || '#ff5a3c';
  const backgroundColor = app.backgroundColor || '#080E1A';
  const textColor = app.textColor || '#f1f5f9';
  const primaryBtnColor = app.primaryBtnColor || '#ff5a3c';
  const secondaryBtnColor = app.secondaryBtnColor || '#1e293b';
  const btnHoverColor = app.btnHoverColor || '#e04f32';
  const borderRadius = app.borderRadius || '12px';
  const cardBorderRadius = app.cardBorderRadius || '16px';
  const headingFont = app.headingStyle || 'Space Grotesk';
  const bodyFont = app.bodyStyle || 'Inter';

  // Dynamic plot layout initialization
  const activePlots = useMemo(() => {
    if (property?.floorPlans && property.floorPlans.length > 0) {
      return property.floorPlans.map((fp: any, idx: number) => ({
        id: fp.name || `P-${idx + 1}`,
        size: fp.size || '1200 Sq.Ft',
        facing: fp.dimensions || 'East',
        status: fp.status || 'available',
        price: fp.baths ? `${fp.baths} Lakhs` : '18.0 Lakhs',
        image: fp.image
      }));
    }
    return INITIAL_PLOTS;
  }, [property]);

  const [selectedPlot, setSelectedPlot] = useState<any>(null);

  useEffect(() => {
    if (activePlots && activePlots.length > 0) {
      setSelectedPlot(activePlots[0]);
    }
  }, [activePlots]);

  const [emiAmount, setEmiAmount] = useState<number>(14650);
  const [loanAmount, setLoanAmount] = useState<number>(property?.price ? property.price * 0.8 : 1440000); 
  const [loanTenure, setLoanTenure] = useState<number>(property?.pricing?.emiTenure ? Number(property.pricing.emiTenure) : 20);
  const [interestRate, setInterestRate] = useState<number>(property?.pricing?.emiRate ? Number(property.pricing.emiRate) : 8.5);
  const [shareCopied, setShareCopied] = useState(false);
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // LOCATION INTELLIGENCE STATES & DATA DEFINITION
  const [isSatellite, setIsSatellite] = useState(false);
  const [isTraffic, setIsTraffic] = useState(true);
  const [zoom, setZoom] = useState(1.0);
  const [activeMode, setActiveMode] = useState<'drive' | 'walk' | 'transit'>('drive');
  const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  
  // HUD simulation toast system
  const [gisToast, setGisToast] = useState<{ title: string, message: string } | null>(null);
  const triggerToast = (title: string, message: string) => {
    setGisToast({ title, message });
    setTimeout(() => {
      setGisToast(null);
    }, 4000);
  };

  const locationsData = useMemo(() => [
    { 
      id: 'nh44', 
      name: 'National Highway 44 (Expressway Corridor)', 
      shortName: 'NH-44 Corridor', 
      type: 'National Highway', 
      distance: '3.2 km', 
      duration: { drive: '5 mins', transit: '12 mins', walk: '38 mins' }, 
      x: 180, 
      y: 110, 
      icon: Milestone, 
      description: 'Arterial North-South national highway link. Crucial logistic and rapid high-speed passenger corridor supporting outstanding regional mobility.' 
    },
    { 
      id: 'rstation', 
      name: 'Central Railway Station', 
      shortName: 'Rail Terminal', 
      type: 'Railway Station', 
      distance: '6.8 km', 
      duration: { drive: '10 mins', transit: '15 mins', walk: '1 hr 20 mins' }, 
      x: 360, 
      y: 100, 
      icon: Train, 
      description: 'Major regional rail transit terminal connecting to global metros and facilitating rapid cross-country passenger movement.' 
    },
    { 
      id: 'hospital', 
      name: 'Government District Hospital', 
      shortName: 'District Hospital', 
      type: 'Hospital', 
      distance: '7.5 km', 
      duration: { drive: '12 mins', transit: '18 mins', walk: '1 hr 35 mins' }, 
      x: 330, 
      y: 260, 
      icon: Activity, 
      description: 'Premium healthcare node offering complete multi-specialty medical treatments and 24/7 level-1 emergency healthcare response.' 
    },
    { 
      id: 'school', 
      name: 'St. Mary\'s International School', 
      shortName: 'St. Mary\'s School', 
      type: 'School', 
      distance: '5.5 km', 
      duration: { drive: '8 mins', transit: '14 mins', walk: '1 hr 5 mins' }, 
      x: 110, 
      y: 70, 
      icon: GraduationCap, 
      description: 'Top-tier international K-12 school offering multiple world-class curricula and leading standard student growth programs.' 
    },
    { 
      id: 'market', 
      name: 'Central Super Market Complex', 
      shortName: 'Shopping Mall', 
      type: 'Shopping Mall', 
      distance: '4.2 km', 
      duration: { drive: '6 mins', transit: '10 mins', walk: '50 mins' }, 
      x: 290, 
      y: 190, 
      icon: ShoppingBag, 
      description: 'Bustling commercial hub featuring branded supermarkets, multi-cuisine restaurants, and various retail outlets.' 
    },
    { 
      id: 'busstand', 
      name: 'State Bus Stand Junction', 
      shortName: 'Bus Stand Junction', 
      type: 'Bus Stand', 
      distance: '6.1 km', 
      duration: { drive: '9 mins', transit: '11 mins', walk: '1 hr 12 mins' }, 
      x: 130, 
      y: 210, 
      icon: Bus, 
      description: 'High-frequency public transport nexus linking standard state-run and premium private bus transit networks.' 
    },
    { 
      id: 'airport', 
      name: 'Kempegowda Int Airport', 
      shortName: 'KIA Airport', 
      type: 'Airport', 
      distance: '95 km', 
      duration: { drive: '1 hr 40 mins', transit: '2 hrs 10 mins', walk: '18 hrs' }, 
      x: 420, 
      y: 330, 
      icon: Plane, 
      description: 'Major world-class international flight hub, easily accessible via the direct high-speed NH44 Expressway connection.' 
    },
    { 
      id: 'itpark', 
      name: 'Dvarix Regional IT & Business Park', 
      shortName: 'IT & Business Park', 
      type: 'Commercial Hub', 
      distance: '20 mins', 
      duration: { drive: '20 mins', transit: '28 mins', walk: '2 hrs 25 mins' }, 
      x: 80, 
      y: 300, 
      icon: Building, 
      description: 'Upcoming state-of-the-art tech workspace complex. Poised to host global companies and high-value technology innovation hubs.' 
    }
  ], []);

  // SMART BUYER TOOLS STATES
  const [smartTravelMode, setSmartTravelMode] = useState<'driving' | 'transit' | 'walking'>('driving');
  const [smartTravelDestIdx, setSmartTravelDestIdx] = useState<number>(0);

  const [smartLoanIncome, setSmartLoanIncome] = useState<number>(100000);
  const [smartLoanExistingEmi, setSmartLoanExistingEmi] = useState<number>(15000);
  const [smartLoanEmpType, setSmartLoanEmpType] = useState<'salaried' | 'self-employed'>('salaried');
  const [smartLoanAge, setSmartLoanAge] = useState<number>(32);
  const [smartLoanDownPayment, setSmartLoanDownPayment] = useState<number>(1000000);

  const [smartEmiPrice, setSmartEmiPrice] = useState<number>(property?.price || 2500000);
  const [smartEmiDownPayment, setSmartEmiDownPayment] = useState<number>(-1);
  const [smartEmiRate, setSmartEmiRate] = useState<number>(8.5);
  const [smartEmiTenure, setSmartEmiTenure] = useState<number>(20);

  // Sync pricing state when property loads
  useEffect(() => {
    if (property?.price) {
      setSmartEmiPrice(property.price);
      setSmartEmiDownPayment(Math.round(property.price * 0.2));
    }
  }, [property]);

  // SMART BUYER TOOLS CALCULATORS & HELPERS
  const travelDestinations = useMemo(() => {
    if (property.nearbyPlaces && property.nearbyPlaces.length > 0) {
      return property.nearbyPlaces.map((place: any, idx: number) => {
        const distStr = place.distance || '5 km';
        const numDist = parseFloat(distStr.replace(/[^0-9.]/g, '')) || 5;
        return {
          id: idx,
          name: place.name || place.place || 'Nearby Destination',
          type: place.type || 'Transit',
          distance: numDist,
          originalDistanceStr: distStr,
        };
      });
    }
    return [
      { id: 0, name: 'Kempegowda Int Airport', type: 'Airport', distance: 95, originalDistanceStr: '95 km' },
      { id: 1, name: 'Central Metro Junction', type: 'Metro Station', distance: 4.2, originalDistanceStr: '4.2 km' },
      { id: 2, name: 'Hindupur Railway Station', type: 'Railway Station', distance: 6.8, originalDistanceStr: '6.8 km' },
      { id: 3, name: 'Manyata Tech Park (IT Corridor)', type: 'IT Parks', distance: 12, originalDistanceStr: '12 km' },
      { id: 4, name: 'St. Mary\'s International School', type: 'Schools', distance: 5.5, originalDistanceStr: '5.5 km' },
      { id: 5, name: 'Government District Hospital', type: 'Hospitals', distance: 7.5, originalDistanceStr: '7.5 km' },
      { id: 6, name: 'Central Shopping Arcade', type: 'Shopping Mall', distance: 3.2, originalDistanceStr: '3.2 km' },
    ];
  }, [property]);

  const calculateTravelTime = (distance: number, mode: 'driving' | 'transit' | 'walking') => {
    if (mode === 'driving') {
      const mins = (distance / 40) * 60;
      if (mins < 1) return '1 min';
      if (mins > 60) {
        const hrs = Math.floor(mins / 60);
        const remMins = Math.round(mins % 60);
        return `${hrs} hr ${remMins} mins`;
      }
      return `${Math.round(mins)} mins`;
    } else if (mode === 'transit') {
      const mins = ((distance / 25) * 60) + 10;
      if (mins > 60) {
        const hrs = Math.floor(mins / 60);
        const remMins = Math.round(mins % 60);
        return `${hrs} hr ${remMins} mins`;
      }
      return `${Math.round(mins)} mins`;
    } else {
      const mins = (distance / 5) * 60;
      if (mins > 60) {
        const hrs = Math.floor(mins / 60);
        const remMins = Math.round(mins % 60);
        return `${hrs} hr ${remMins} mins`;
      }
      return `${Math.round(mins)} mins`;
    }
  };

  const formatCurrencyCompact = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    } else if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} L`;
    } else if (val >= 1000) {
      return `₹${(val / 1000).toFixed(1)} K`;
    } else {
      return `₹${val}`;
    }
  };

  // Lead Form States
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('Morning Slot');
  const [formAgreed, setFormAgreed] = useState(true);
  const [isBookedSuccess, setIsBookedSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [property]);

  // Handle active section calculation on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 180;
      const sections = [
        'overview', 'gallery', 'location', 'amenities', 
        'layout', 'smart-tools', 'legal', 'pricing', 'investment', 
        'reviews', 'faqs', 'contact'
      ];
      
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!property) {
    return (
      <div className="min-h-screen bg-[#080E1A] text-slate-100 py-24 px-4 text-center flex flex-col justify-center items-center">
        <Compass className="w-12 h-12 text-slate-500 animate-pulse mb-4" />
        <h2 className="text-xl font-bold tracking-tight">Property Not Found</h2>
        <button onClick={onBack} className="mt-6 px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold hover:bg-[#FF5A36] transition cursor-pointer">
          Return to Listings
        </button>
      </div>
    );
  }

  const isFavorite = favorites.includes(property.id);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const topPos = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top: topPos,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  // Re-calculate EMI when variables change
  useEffect(() => {
    const r = (interestRate / 12) / 100;
    const n = loanTenure * 12;
    if (r === 0) {
      setEmiAmount(Math.round(loanAmount / n));
    } else {
      const emi = loanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      setEmiAmount(Math.round(emi));
    }
  }, [loanAmount, loanTenure, interestRate]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName || !visitorPhone || !visitDate) {
      alert("Please fill out all the fields before requesting a visit.");
      return;
    }
    setIsBookedSuccess(true);
    setTimeout(() => {
      setIsBookedSuccess(false);
      onBookSiteVisit({
        ...property,
        title: `${property.title} (Guided Visit for ${visitorName})`
      });
    }, 2500);
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: HomeIcon },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'location', label: 'Location', icon: MapPinIcon },
    { id: 'amenities', label: 'Amenities', icon: SparklesIcon },
    { id: 'layout', label: 'Layout Plan', icon: GridIcon },
    { id: 'smart-tools', label: 'Smart Tools', icon: CalculatorIcon },
    { id: 'legal', label: 'Legal', icon: ShieldCheckIcon },
    { id: 'pricing', label: 'Pricing', icon: DollarIcon },
    { id: 'investment', label: 'Investment', icon: TrendingIcon },
    { id: 'reviews', label: 'Reviews', icon: StarIcon },
    { id: 'faqs', label: 'FAQs', icon: HelpIcon },
    { id: 'contact', label: 'Contact', icon: PhoneIcon },
  ];

  const reviewsList = [
    {
      name: "Suresh R.",
      role: "Verified Buyer",
      rating: 5,
      comment: "Very good property and clear documentation. Smooth process. Highly recommended! The support from Rahul Kumar during the title verification was top-notch.",
      date: "2 weeks ago"
    },
    {
      name: "Meera Krishnan",
      role: "Property Investor",
      rating: 5,
      comment: "Incredible growth rate. Bought a plot last year and the surrounding infrastructure has scaled exponentially. Highly secure gated compound.",
      date: "1 month ago"
    },
    {
      name: "Anand Deshmukh",
      role: "NRI Buyer",
      rating: 5,
      comment: "Seamless remote transaction workflow. Dvarix handled the physical surveys, E-Khata mapping, and boundary demarcations beautifully.",
      date: "3 months ago"
    }
  ];

  const badgesList = useMemo(() => {
    const list = [];
    if (property.badgeFeatured) list.push({ text: "Featured", isPrimary: true });
    if (property.badgeVerified) list.push({ text: "Verified", isPrimary: false });
    if (property.badgePremium) list.push({ text: "Premium Luxury", isPrimary: true });
    if (property.badgeHot) list.push({ text: "Hot Listing", isPrimary: true });
    if (property.badgeNewLaunch) list.push({ text: "New Launch", isPrimary: false });
    if (property.badgeTrending) list.push({ text: "Trending", isPrimary: false });
    if (property.badgeInvestmentOpportunity) list.push({ text: "High Yield Investment", isPrimary: false });
    if (property.badgeLimitedAvailability) list.push({ text: "Limited Units", isPrimary: true });
    if (property.badgePriceDrop) list.push({ text: "Price Drop", isPrimary: true });
    if (property.badgeBestSeller) list.push({ text: "Best Seller", isPrimary: true });
    return list;
  }, [property]);

  const activeReviews = useMemo(() => {
    if (property.reviewsList && property.reviewsList.length > 0) {
      return property.reviewsList;
    }
    return reviewsList;
  }, [property, reviewsList]);

  const amenitiesMap = [
    { key: 'compoundWall', label: 'Compound Wall', desc: 'Secure masonry wall' },
    { key: 'cctvSecurity', label: 'CCTV Surveillance', desc: '24/7 continuous stream' },
    { key: 'waterConnection', label: 'Drinking Water Network', desc: 'Continuous plumbing line' },
    { key: 'blacktopRoads', label: 'Blacktop Roads', desc: '40ft & 60ft layouts' },
    { key: 'electricityPower', label: 'Electricity Link', desc: 'Standard sub-stations' },
    { key: 'streetLights', label: 'Street Lights', desc: 'High luminosity led lights' },
    { key: 'sewageDrainage', label: 'Storm Water Drains', desc: 'Concrete storm piping' },
    { key: 'overheadTank', label: 'Overhead Tank', desc: 'High capacity water storage' }
  ];

  const activeAmenities = useMemo(() => {
    return amenitiesMap.filter(am => property[am.key as keyof Property]);
  }, [property]);

  return (
    <div 
      className="text-slate-900 min-h-screen flex selection:bg-orange-500/20 selection:text-orange-500 antialiased font-sans"
      style={{ backgroundColor: '#F1F5F9', color: '#0F172A' }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=${headingFont.replace(/ /g, '+')}:wght@400;500;600;700;800&family=${bodyFont.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap');
        
        :root {
          --primary-color: ${primaryColor};
          --secondary-color: ${secondaryColor};
          --accent-color: ${accentColor};
          --bg-color: ${backgroundColor};
          --text-color: ${textColor};
          --primary-btn-color: ${primaryBtnColor};
          --secondary-btn-color: ${secondaryBtnColor};
          --btn-hover-color: ${btnHoverColor};
          --border-radius: ${borderRadius};
          --card-border-radius: ${cardBorderRadius};
          --font-heading: "${headingFont}", sans-serif;
          --font-body: "${bodyFont}", sans-serif;
        }

        .font-sans, h1, h2, h3, h4, h5, h6 {
          font-family: var(--font-heading) !important;
        }

        p, span, select, input, label, button, a {
          font-family: var(--font-body) !important;
        }

        .custom-primary-btn {
          background-color: var(--primary-btn-color) !important;
          border-radius: var(--border-radius) !important;
          color: white !important;
          transition: background-color 0.2s ease-in-out;
        }
        
        .custom-primary-btn:hover {
          background-color: var(--btn-hover-color) !important;
        }

        .custom-card {
          border-radius: var(--card-border-radius) !important;
          border-color: var(--secondary-color) !important;
        }
      ` }} />
      
      {/* ==================== LEFT STICKY NAVIGATION RAIL ==================== */}
      <aside className="w-[90px] bg-[#0A101E] border-r border-slate-900 shrink-0 hidden lg:flex flex-col items-center py-6 justify-between h-auto self-start rounded-b-3xl shadow-2xl z-20">
        <div className="flex flex-col items-center space-y-2 w-full px-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleScrollToSection(item.id)}
                className={`w-full group relative flex flex-col items-center justify-center py-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-br from-orange-600/20 to-orange-500/5 text-orange-500 border border-orange-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <span className="absolute left-1 top-1/4 bottom-1/4 w-[3px] bg-orange-500 rounded-full" />
                )}
                
                <IconComponent className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-orange-500' : 'text-slate-400 group-hover:text-white'}`} />
                <span className="text-[9px] font-medium tracking-tight mt-1.5 text-center px-1 truncate max-w-full">
                  {item.label}
                </span>

                {/* Micro tooltip */}
                <div className="absolute left-[95px] px-2 py-1 bg-slate-950 border border-slate-800 rounded-md text-[10px] font-mono text-slate-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap shadow-xl z-50">
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>

        <div className="w-full px-4 text-center">
          <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-[10px] font-mono text-orange-500 font-bold">
            DX
          </div>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT SPACE ==================== */}
      <main className="flex-1 min-w-0 bg-[#F1F5F9]">
        
        {/* ==================== SUB HEADER BAR ==================== */}
        <div className="sticky top-[80px] bg-[#0A101E] border-b border-slate-900 z-30 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <button 
              onClick={onBack}
              className="p-2 bg-[#0A101E] border border-slate-800 rounded-lg text-slate-400 hover:text-white transition flex items-center gap-2 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4 text-orange-500" />
              <span className="hidden sm:inline">Back to Listings</span>
            </button>
            <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-mono hidden md:flex">
              <span>Properties</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="text-orange-500 truncate max-w-[200px] font-bold">{property.title}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5" /> Verified Property
            </span>

            <button 
              onClick={handleShare}
              className="p-2 bg-[#0A101E] hover:bg-slate-900 border border-slate-800 rounded-lg text-slate-300 transition relative"
            >
              <Share2 className="w-4 h-4" />
              {shareCopied && (
                <span className="absolute right-0 -top-10 px-2 py-1 bg-slate-950 border border-slate-800 text-orange-400 text-[9px] rounded-md font-mono whitespace-nowrap shadow-lg">
                  Copied URL!
                </span>
              )}
            </button>

            <button 
              onClick={() => toggleFavorite(property.id)}
              className={`p-2 border rounded-lg transition ${
                isFavorite 
                  ? 'bg-orange-500/10 border-orange-500 text-orange-500' 
                  : 'bg-[#0A101E] hover:bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-orange-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* ==================== SCREEN GRID CONTAINER ==================== */}
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* ==================== 2-COLUMN GRID SECTION ==================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT 8 COLUMNS: PROPERTY CONTENT MODULES */}
            <div className="lg:col-span-8 space-y-8">

              {/* ==================== HERO PORTFOLIO MODULE ==================== */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, boxShadow: "0 30px 60px rgba(0,0,0,0.12)" }}
                className="relative bg-slate-950 border border-slate-900 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500"
              >
                {/* Background Accent Gradients */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/5 blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 blur-[120px] pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  
                  {/* Image & Overlay Column (left 8 cols) */}
                  <div className="lg:col-span-8 relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:h-[480px] group overflow-hidden">
                    {/* Responsive dynamic rendering for gallery tabs */}
                    <AnimatePresence mode="wait">
                      {galleryTab === 'photos' && (
                        <motion.div 
                          key="photos"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-full h-full relative"
                        >
                          {property.images && property.images.length > 0 ? (
                            <>
                              <img 
                                src={property.images[0]} 
                                alt={property.title}
                                className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110"
                                referrerPolicy="no-referrer"
                              />
                              {property.images.length > 1 && (
                                <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 z-10">
                                  {property.images.map((_: any, idx: number) => (
                                    <span 
                                      key={idx} 
                                      className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === 0 ? 'bg-orange-500 scale-125' : 'bg-white/40'}`} 
                                    />
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            <img 
                              src={property.image} 
                              alt={property.title}
                              className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </motion.div>
                      )}
                      {galleryTab === 'drone' && (
                        <motion.div 
                          key="drone"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center"
                        >
                          {property.mediaUrls?.droneVideos ? (
                            <iframe 
                              src={property.mediaUrls.droneVideos.includes('watch?v=') 
                                ? `https://www.youtube.com/embed/${property.mediaUrls.droneVideos.split('v=')[1]?.split('&')[0]}`
                                : property.mediaUrls.droneVideos} 
                              title="Drone Video Player"
                              className="w-full h-full border-0 rounded-2xl" 
                              allowFullScreen
                            />
                          ) : property.droneImages && property.droneImages.length > 0 ? (
                            <img 
                              src={property.droneImages[0]} 
                              alt="Drone View" 
                              className="w-full h-full object-cover rounded-2xl"
                            />
                          ) : (
                            <>
                              <Compass className="w-16 h-16 text-orange-500 animate-spin mb-4" style={{ color: primaryColor }} />
                              <h4 className="text-lg font-bold">Panoramic Aerial View Active</h4>
                              <p className="text-slate-400 text-xs mt-2 max-w-sm">Simulated drone tracking capturing full site elevation, zoning, and adjacent state highway vectors.</p>
                            </>
                          )}
                        </motion.div>
                      )}
                      {galleryTab === 'layout' && (
                        <motion.div 
                          key="layout"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center"
                        >
                          {property.layoutPlans && property.layoutPlans.length > 0 ? (
                            <img 
                              src={property.layoutPlans[0]} 
                              alt="Layout Plan" 
                              className="w-full h-full object-contain rounded-2xl"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <>
                              <Grid className="w-16 h-16 text-teal-400 animate-pulse mb-4" />
                              <h4 className="text-lg font-bold text-teal-400">Master Layout Plan Visualizer</h4>
                              <p className="text-slate-400 text-xs mt-2 max-w-sm">Displaying legal dimension outlines, physical plot boundaries, water pump stations, and avenues.</p>
                            </>
                          )}
                        </motion.div>
                      )}
                      {galleryTab === 'video' && (
                        <motion.div 
                          key="video"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center"
                        >
                          {property.mediaUrls?.siteVideos ? (
                            <iframe 
                              src={property.mediaUrls.siteVideos.includes('watch?v=') 
                                ? `https://www.youtube.com/embed/${property.mediaUrls.siteVideos.split('v=')[1]?.split('&')[0]}`
                                : property.mediaUrls.siteVideos} 
                              title="Site Video Player"
                              className="w-full h-full border-0 rounded-2xl" 
                              allowFullScreen
                            />
                          ) : (
                            <>
                              <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center mb-4 text-white animate-pulse" style={{ backgroundColor: primaryColor }}>
                                <Phone className="w-6 h-6 rotate-90" />
                              </div>
                              <h4 className="text-lg font-bold text-white">Full-HD Cinematic Site Walkthrough</h4>
                              <p className="text-slate-400 text-xs mt-2 max-w-sm">Complete walking footage of physical asphalt roads, gated compound walls, and active greenery.</p>
                            </>
                          )}
                        </motion.div>
                      )}
                      {galleryTab === '360' && (
                        <motion.div 
                          key="360"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center"
                        >
                          {property.mediaUrls?.virtualTourUrl || property.mediaUrls?.tour360Url ? (
                            <iframe 
                              src={property.mediaUrls.virtualTourUrl || property.mediaUrls.tour360Url} 
                              title="360 Virtual Tour"
                              className="w-full h-full border-0 rounded-2xl" 
                              allowFullScreen
                            />
                          ) : (
                            <>
                              <Activity className="w-16 h-16 text-indigo-400 mb-4 animate-ping" />
                              <h4 className="text-lg font-bold text-indigo-400">Immersive VR 360° Interactive Dome</h4>
                              <p className="text-slate-400 text-xs mt-2 max-w-sm">Drag to look around the plot layout and check proximity to nearby electrical lines and water tanks.</p>
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
     
                    {/* Dark Vignette Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
     
                    {/* Top Floating Badges */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      {badgesList.length > 0 ? (
                        badgesList.map((badge, idx) => (
                          <span 
                            key={idx}
                            style={{ backgroundColor: badge.isPrimary ? primaryColor : 'rgba(15, 23, 42, 0.9)' }}
                            className={`px-3 py-1.5 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-xl flex items-center gap-1.5`}
                          >
                            <Award className="w-3.5 h-3.5" /> {badge.text}
                          </span>
                        ))
                      ) : (
                        <>
                          <span className="px-3 py-1.5 bg-orange-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-xl flex items-center gap-1.5" style={{ backgroundColor: primaryColor }}>
                            <Award className="w-3.5 h-3.5" /> Premium Villa Plots
                          </span>
                          <span className="px-3 py-1.5 bg-slate-900/90 border border-slate-800 text-slate-300 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg shadow-xl">
                            Only 12 Plots Left!
                          </span>
                        </>
                      )}
                    </div>
     
                    {/* Content Overlay */}
                    <div className="absolute bottom-6 left-6 right-6 flex flex-col space-y-3 z-10">
                      <div>
                        <span className="text-xs font-mono text-orange-400 tracking-widest uppercase font-semibold" style={{ color: primaryColor }}>{property.location}</span>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-0.5">
                          {property.title}
                        </h1>
                      </div>
     
                      {/* Core Trust Flags */}
                      <div className="flex flex-wrap gap-2.5 pt-1">
                        <span className="px-3 py-1 bg-[#080E1A]/80 backdrop-blur-md border border-slate-800 rounded-md text-[10px] font-mono text-slate-300 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-orange-500" style={{ color: primaryColor }} /> {property.legal?.reraId ? `RERA Approved (${property.legal.reraId})` : 'RERA Approved'}
                        </span>
                        <span className="px-3 py-1 bg-[#080E1A]/80 backdrop-blur-md border border-slate-800 rounded-md text-[10px] font-mono text-slate-300 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-orange-500" style={{ color: primaryColor }} /> {property.legal?.dcConversion ? `DC: ${property.legal.dcConversion}` : 'DC Conversion'}
                        </span>
                        <span className="px-3 py-1 bg-[#080E1A]/80 backdrop-blur-md border border-slate-800 rounded-md text-[10px] font-mono text-slate-300 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-orange-500" style={{ color: primaryColor }} /> {property.legal?.eKhata ? `E-Khata: ${property.legal.eKhata}` : 'E-Khata Intact'}
                        </span>
                        <span className="px-3 py-1 bg-[#080E1A]/80 backdrop-blur-md border border-slate-800 rounded-md text-[10px] font-mono text-slate-300 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-orange-500" style={{ color: primaryColor }} /> {property.legal?.bankApproval || 'Bank Loan Ready'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Pricing & Info Panel (right 4 cols) */}
                  <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-900 bg-[#0B1222]/80 backdrop-blur-md" style={{ borderTopLeftRadius: cardBorderRadius, borderBottomRightRadius: cardBorderRadius }}>
                    <div className="space-y-6">
                      <div>
                        <span className="text-slate-400 text-xs font-mono uppercase tracking-widest block">Premium Entry Point</span>
                        <span className="text-3xl sm:text-4xl font-black text-orange-500 mt-1 block" style={{ color: primaryColor }}>
                          {formatPrice(property.price)}
                        </span>
                        <span className="text-xs text-slate-400 mt-1 block font-mono">
                          {property.pricing?.bookingAmount ? `Booking: ₹${property.pricing.bookingAmount}` : '₹1,500 / Sq.Ft Base Rate'}
                        </span>
                      </div>

                      <div className="space-y-3.5 pt-4 border-t border-slate-900">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-mono">Dvarix Project ID</span>
                          <span className="text-white font-bold font-mono">DVR-{property.id.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-mono">Possession Date</span>
                          <span className="text-emerald-400 font-bold font-mono flex items-center gap-1">
                            <Check className="w-3 h-3" /> Immediate
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-mono">Launch Status</span>
                          <span className="text-white bg-orange-600/20 border border-orange-500/30 text-orange-500 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase font-mono" style={{ color: primaryColor, borderColor: `${primaryColor}30`, backgroundColor: `${primaryColor}15` }}>
                            Ready To Build
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-slate-900">
                      <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block">Enterprise Certification</span>
                      <div className="p-3 bg-[#080E1A] border border-slate-800 rounded-xl flex items-center gap-3" style={{ borderRadius: borderRadius }}>
                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500 shrink-0" style={{ color: primaryColor }}>
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">100% Secure Transaction</span>
                          <span className="text-[9px] text-slate-500 block mt-0.5 font-mono">Title verified by top legal firms</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Bottom Row Media Anchors */}
                <div className="bg-slate-50 border-t border-slate-200 px-4 py-3.5 overflow-x-auto flex items-center space-x-3.5 no-scrollbar">
                  {[
                    { id: 'photos', label: `Site Photos (${property.images?.length || 25})`, icon: ImageIcon },
                    { id: 'drone', label: 'Drone View', icon: Compass },
                    { id: 'layout', label: 'Layout Plan', icon: Grid },
                    { id: 'video', label: 'Video Tour', icon: Award },
                    { id: '360', label: '360° Tour', icon: Activity }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isSel = galleryTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setGalleryTab(tab.id as any)}
                        style={{ 
                          backgroundColor: isSel ? primaryColor : undefined, 
                          borderColor: isSel ? primaryColor : undefined,
                          borderRadius: borderRadius 
                        }}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-mono transition whitespace-nowrap cursor-pointer ${
                          isSel 
                            ? 'text-slate-950 font-bold' 
                            : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* MODULE: OVERVIEW CARDS */}
              <motion.section 
                id="overview" 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, boxShadow: "0 25px 50px rgba(0, 0, 0, 0.04)" }}
                className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all duration-500 relative overflow-hidden" 
                style={{ borderRadius: cardBorderRadius }}
              >
                <ShimmerOverlay />
                
                <div className="border-b border-slate-200 pb-4 relative z-20">
                  <span className="text-xs text-orange-500 font-mono uppercase tracking-widest font-bold" style={{ color: primaryColor }}>Property Blueprint</span>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-1">Specifications & Project Overview</h3>
                </div>

                {/* Grid of specifications with icons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 relative z-20">
                  {property.customSpecs && property.customSpecs.length > 0 ? (
                    property.customSpecs.map((spec: any, i: number) => {
                      const Icon = Ruler;
                      return (
                        <motion.div 
                          whileHover={{ y: -6, scale: 1.02, boxShadow: "0 12px 24px rgba(0,0,0,0.04)", borderColor: `${primaryColor}30` }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          key={i} 
                          className="bg-slate-50/50 backdrop-blur-xs border border-slate-200/50 p-4.5 rounded-xl flex flex-col justify-between transition-all duration-300 shadow-xs" 
                          style={{ borderRadius: cardBorderRadius }}
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-slate-500 text-[10px] font-mono uppercase tracking-wider">{spec.key}</span>
                            <Icon className="w-4 h-4 text-orange-500 shrink-0" style={{ color: primaryColor }} />
                          </div>
                          <div className="mt-3">
                            <span className="text-slate-900 text-sm sm:text-base font-bold block">{spec.value}</span>
                            <span className="text-slate-400 text-[9px] font-mono mt-0.5 block">Verified Spec</span>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    [
                      { label: "Plot Size", value: `${property.sqft || '1200 - 2400'} Sq.ft`, desc: "Standard Dimensions", icon: Ruler },
                      { label: "Price / Sq.ft", value: "₹1,500", desc: "Base rate upwards", icon: DollarSign },
                      { label: "Facing", value: "East / North", desc: "Vastu compliant available", icon: Compass },
                      { label: "Road Width", value: "40 & 60 FT", desc: "Internal layout avenues", icon: Grid },
                      { label: "Possession", value: "Immediate", desc: "Ready to construct", icon: Calendar },
                      { label: "Property Type", value: "Residential", desc: "Premium Villa Plots", icon: Building }
                    ].map((card, i) => {
                      const Icon = card.icon;
                      return (
                        <motion.div 
                          whileHover={{ y: -6, scale: 1.02, boxShadow: "0 12px 24px rgba(0,0,0,0.04)", borderColor: `${primaryColor}30` }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          key={i} 
                          className="bg-slate-50/50 backdrop-blur-xs border border-slate-200/50 p-4.5 rounded-xl flex flex-col justify-between transition-all duration-300 shadow-xs" 
                          style={{ borderRadius: cardBorderRadius }}
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-slate-500 text-[10px] font-mono uppercase tracking-wider">{card.label}</span>
                            <Icon className="w-4 h-4 text-orange-500 shrink-0" style={{ color: primaryColor }} />
                          </div>
                          <div className="mt-3">
                            <span className="text-slate-900 text-sm sm:text-base font-bold block">{card.value}</span>
                            <span className="text-slate-400 text-[9px] font-mono mt-0.5 block">{card.desc}</span>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>

                <div className="space-y-4 pt-2 relative z-20">
                  <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Detailed Description</h4>
                  <p className="text-slate-600 text-sm leading-relaxed font-sans font-light whitespace-pre-line">
                    {property.longDescription || property.description || "Greenfield Villa Plots represents a masterfully designed premium residential plot venture. Offering state-of-the-art layout setups, wide blacktop roads, completely underground utilities, and landscaped gardens. Perfect for buyers aiming to construct high-value customizable dream villas or real estate investors pursuing stable, high-multiple compound appreciation."}
                  </p>
                </div>
              </motion.section>

              {/* MODULE: LOCATION ADVANTAGES & MAP */}
              <motion.section 
                id="location" 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 relative overflow-hidden text-white" 
                style={{ borderRadius: cardBorderRadius }}
              >
                {/* Subtle animated background mesh & reflections */}
                <div className="absolute inset-0 bg-radial-gradient from-indigo-950/20 via-slate-950 to-slate-950 opacity-80 pointer-events-none" />
                <div className="absolute -top-[300px] -right-[300px] w-[600px] h-[600px] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />
                <div className="absolute -bottom-[300px] -left-[300px] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

                {/* HEADER ROW WITH CONNECTIVITY SCORE & ESSENTIAL CHIPS */}
                <div className="relative z-20 border-b border-slate-800/80 pb-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                      <span className="text-xs text-orange-500 font-mono uppercase tracking-widest font-bold" style={{ color: primaryColor }}>Location Intelligence</span>
                      <h3 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-orange-500 animate-pulse" style={{ color: primaryColor }} /> 
                        Location Advantages & Connectivity
                      </h3>
                      <p className="text-slate-400 text-xs mt-1">Explore the high-growth neighborhood, arterial highways, and essential transit hubs surrounding your future home</p>
                    </div>

                    {/* CONNECTIVITY SCORE DASHBOARD CARD */}
                    <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-5 max-w-full lg:max-w-md shrink-0 shadow-lg backdrop-blur-md">
                      <div className="text-center sm:text-left shrink-0">
                        <div className="flex justify-center sm:justify-start gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <motion.div
                              key={s}
                              initial={{ scale: 0, rotate: -30 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 300, damping: 15, delay: s * 0.1 }}
                            >
                              <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                            </motion.div>
                          ))}
                        </div>
                        <p className="text-slate-400 text-[10px] uppercase font-mono tracking-wider mt-1.5">Connectivity Score</p>
                        <div className="flex items-baseline justify-center sm:justify-start gap-1 mt-0.5">
                          <span className="text-2xl font-black text-white font-mono">
                            {/* Static-dynamic count up effect */}
                            <span className="inline-block">9.6</span>
                          </span>
                          <span className="text-slate-500 text-xs">/ 10</span>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 mt-1">
                          Excellent Connectivity
                        </span>
                      </div>
                      
                      <div className="h-px sm:h-12 w-full sm:w-px bg-slate-800" />

                      <div className="space-y-2 w-full">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Transit & Highway Network</span>
                          <span className="font-bold text-orange-400">96%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "96%" }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-orange-600 to-amber-500"
                          />
                        </div>
                        <p className="text-[9px] text-slate-500 leading-normal">
                          Verified parameters: accessibility to arterial national highways, rail connectivity, state bus stand, schools, and hospitals.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* HIGH-LEVEL ESSENTIAL COUNT CHIPS */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                    {[
                      { icon: GraduationCap, count: 8, label: 'Schools Nearby', color: 'indigo' },
                      { icon: Activity, count: 5, label: 'Hospitals Nearby', color: 'emerald' },
                      { icon: ShoppingBag, count: 6, label: 'Shopping Hubs', color: 'purple' },
                      { icon: Train, count: 2, label: 'Metro Stations', color: 'rose' }
                    ].map((chip, idx) => {
                      const IconComponent = chip.icon;
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1, duration: 0.5 }}
                          key={idx}
                          className="bg-slate-900/50 border border-slate-800/80 p-3 rounded-xl flex items-center gap-3 hover:border-slate-700/80 transition-all duration-300"
                        >
                          <div className={`p-2 rounded-lg bg-slate-950 text-orange-500 border border-slate-800`} style={{ color: primaryColor }}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-lg font-black text-white font-mono tracking-tight block leading-none">
                              {/* Simple manual count-up animation helper in view */}
                              <span>{chip.count}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5 block">{chip.label}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* INTERACTIVE LOCATION CANVAS ENGINE (LEFT & RIGHT CONTAINER) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-20">
                  
                  {/* LEFT COLUMN: THE REAL GOOGLE MAPS SIMULATION */}
                  <div className="lg:col-span-7 flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Real-Time Location Sandbox
                      </span>
                      <div className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        Interactive GIS Radar v1.4
                      </div>
                    </div>

                    {/* MAP WRAPPER CONTAINER */}
                    <div className="relative h-[400px] sm:h-[480px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl group">
                      
                      {/* MAP BACKGROUND MESH & LAYERS */}
                      <div className={`absolute inset-0 transition-all duration-700 ${isSatellite ? 'bg-slate-950 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-90' : 'bg-slate-900 bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-70'}`} />
                      
                      {/* Satellite simulated contour lines / geography overlays */}
                      {isSatellite && (
                        <div className="absolute inset-0 opacity-15 pointer-events-none">
                          <svg width="100%" height="100%">
                            <path d="M-10,120 Q120,40 250,150 T500,80" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5,5" />
                            <path d="M10,220 Q180,180 320,320 T480,210" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3,3" />
                            <path d="M-50,380 Q100,290 280,420 T600,320" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="1,4" />
                          </svg>
                        </div>
                      )}

                      {/* SIMULATED WATERBODY / RIVER */}
                      <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
                        <motion.path 
                          d="M-20,320 Q130,290 240,315 T520,290" 
                          fill="none" 
                          stroke={isSatellite ? "#0c4a6e" : "#1e293b"} 
                          strokeWidth="22" 
                          strokeLinecap="round"
                          opacity={isSatellite ? "0.6" : "0.5"}
                        />
                        <motion.path 
                          d="M-20,320 Q130,290 240,315 T520,290" 
                          fill="none" 
                          stroke={isSatellite ? "#38bdf8" : "#3b82f6"} 
                          strokeWidth="2" 
                          opacity="0.1"
                          strokeDasharray="12,6"
                          animate={{ strokeDashoffset: [-18, 0] }}
                          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                        />
                      </svg>

                      {/* MAIN MAP SVG WORKSPACE FOR ROTATING & SCALING */}
                      <svg 
                        id="location-gis-canvas"
                        className="absolute inset-0 w-full h-full cursor-crosshair select-none"
                        viewBox="0 0 500 380"
                        preserveAspectRatio="xMidYMid slice"
                      >
                        {/* THE SCALABLE INTERACTIVE GROUP */}
                        <g 
                          style={{ 
                            transform: `scale(${zoom})`, 
                            transformOrigin: '220px 190px',
                            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' 
                          }}
                        >
                          {/* CONCENTRIC RADAR RANGE CIRCLES */}
                          {[60, 130, 210].map((radius, idx) => (
                            <g key={radius}>
                              <circle 
                                cx={220} 
                                cy={190} 
                                r={radius} 
                                fill="none" 
                                stroke={isSatellite ? "rgba(249, 115, 22, 0.08)" : "rgba(255, 255, 255, 0.04)"} 
                                strokeWidth="1.5" 
                                strokeDasharray="6,6"
                              />
                              {/* Range Labels */}
                              <text 
                                x={220 + radius - 15} 
                                y={196} 
                                fill="rgba(148, 163, 184, 0.4)" 
                                fontSize="7" 
                                fontFamily="monospace" 
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                {idx === 0 ? '1 KM' : idx === 1 ? '3 KM' : '5 KM'}
                              </text>
                            </g>
                          ))}

                          {/* BASE ROADS NETWORK */}
                          <g stroke="rgba(255,255,255,0.06)" strokeLinecap="round" fill="none">
                            {/* NH44 Highway representation */}
                            <path d="M 0 50 L 500 300" strokeWidth="8" stroke="rgba(255,255,255,0.03)" />
                            <path d="M 0 50 L 500 300" strokeWidth="1.5" strokeDasharray="8,4" stroke="rgba(245, 158, 11, 0.2)" />
                            
                            {/* Inner Ring roads */}
                            <path d="M 80 0 L 80 380" strokeWidth="3" />
                            <path d="M 380 0 L 380 380" strokeWidth="3" />
                            <path d="M 0 140 L 500 140" strokeWidth="3.5" />
                            <path d="M 0 250 L 500 250" strokeWidth="2" />
                            
                            {/* Arterial connectors */}
                            <path d="M 220 0 Q 220 190 220 380" strokeWidth="4" />
                            <path d="M 0 190 Q 220 190 500 190" strokeWidth="4" />
                          </g>

                          {/* LIVE TRAFFIC FLOW LAYER OVERLAY (When Toggled On) */}
                          {isTraffic && (
                            <g strokeLinecap="round" fill="none" opacity="0.8">
                              {/* Green routes (Smooth flowing) */}
                              <path d="M 0 140 L 180 140" stroke="#22c55e" strokeWidth="2.5" />
                              <path d="M 240 140 L 500 140" stroke="#22c55e" strokeWidth="2.5" />
                              <path d="M 220 0 L 220 160" stroke="#22c55e" strokeWidth="2.5" />
                              <path d="M 220 220 L 220 380" stroke="#22c55e" strokeWidth="2.5" />
                              <path d="M 380 0 L 380 380" stroke="#22c55e" strokeWidth="2" />

                              {/* Yellow routes (Moderate speed) */}
                              <path d="M 180 140 L 220 140" stroke="#eab308" strokeWidth="2.5" />
                              <path d="M 0 190 Q 220 190 300 190" stroke="#eab308" strokeWidth="3.2" />

                              {/* Red routes (Heavy traffic peak) */}
                              <path d="M 300 190 Q 400 190 500 190" stroke="#ef4444" strokeWidth="3.5" />
                              <path d="M 220 160 L 220 220" stroke="#ef4444" strokeWidth="3.5" className="animate-pulse" />
                            </g>
                          )}

                          {/* ANIMATED CURVED ROUTE LINES (From property to hover/select destinations) */}
                          {locationsData.map((loc) => {
                            const isHovered = hoveredLocationId === loc.id;
                            const isSelected = selectedLocationId === loc.id;
                            const isActiveRoute = isHovered || isSelected;

                            // Curve drawing equation
                            const dx = loc.x - 220;
                            const dy = loc.y - 190;
                            const mx = 220 + dx / 2;
                            const my = 190 + dy / 2;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            const px = -dy / dist;
                            const py = dx / dist;
                            const curveHeight = dist * 0.16;
                            const cx = mx + px * curveHeight;
                            const cy = my + py * curveHeight;
                            const pathData = `M 220 190 Q ${cx} ${cy} ${loc.x} ${loc.y}`;

                            return (
                              <g key={`route-${loc.id}`}>
                                {/* Underlay shadow route path */}
                                <path 
                                  d={pathData}
                                  fill="none"
                                  stroke={isActiveRoute ? "rgba(251, 113, 133, 0.1)" : "none"}
                                  strokeWidth={isActiveRoute ? 10 : 0}
                                  strokeLinecap="round"
                                />
                                {/* Glow animated vector line */}
                                <motion.path
                                  d={pathData}
                                  fill="none"
                                  stroke={isActiveRoute ? primaryColor : "rgba(148, 163, 184, 0.12)"}
                                  strokeWidth={isActiveRoute ? 3 : 1.5}
                                  strokeDasharray={isActiveRoute ? "8,4" : "4,4"}
                                  animate={isActiveRoute ? { strokeDashoffset: [-24, 0] } : {}}
                                  transition={isActiveRoute ? { repeat: Infinity, duration: 1.2, ease: "linear" } : {}}
                                />
                              </g>
                            );
                          })}

                          {/* DESTINATION MARKERS */}
                          {locationsData.map((loc) => {
                            const isHovered = hoveredLocationId === loc.id;
                            const isSelected = selectedLocationId === loc.id;
                            const MarkerIcon = loc.icon;

                            return (
                              <g 
                                key={loc.id} 
                                className="cursor-pointer"
                                onClick={() => {
                                  setSelectedLocationId(selectedLocationId === loc.id ? null : loc.id);
                                  // trigger custom audio/haptic simulation
                                }}
                              >
                                {/* Marker Outer Halo glowing circles */}
                                <motion.circle 
                                  cx={loc.x} 
                                  cy={loc.y} 
                                  r={isHovered || isSelected ? 24 : 14}
                                  fill={isHovered || isSelected ? "rgba(251, 113, 133, 0.15)" : "rgba(30, 41, 59, 0.4)"}
                                  stroke={isHovered || isSelected ? primaryColor : "rgba(148, 163, 184, 0.3)"}
                                  strokeWidth={isHovered || isSelected ? 1.5 : 1}
                                  animate={isHovered || isSelected ? { scale: [1, 1.1, 1] } : {}}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                />

                                {/* Interactive ForeignObject embodying high contrast crisp icons */}
                                <foreignObject x={loc.x - 12} y={loc.y - 12} width={24} height={24}>
                                  <div 
                                    className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 ${isHovered || isSelected ? 'bg-orange-500 text-white shadow-lg' : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-orange-400'}`}
                                    style={{ backgroundColor: isHovered || isSelected ? primaryColor : undefined }}
                                  >
                                    <MarkerIcon className="w-3.5 h-3.5" />
                                  </div>
                                </foreignObject>

                                {/* Small distance distance tags overlaid directly on map */}
                                <g transform={`translate(${loc.x}, ${loc.y - 20})`}>
                                  <rect 
                                    x="-20" 
                                    y="-6" 
                                    width="40" 
                                    height="12" 
                                    rx="4" 
                                    fill="rgba(15, 23, 42, 0.85)" 
                                    stroke="rgba(255,255,255,0.08)" 
                                    strokeWidth="0.5" 
                                  />
                                  <text 
                                    y="2" 
                                    fill="#94a3b8" 
                                    fontSize="6.5" 
                                    fontWeight="bold"
                                    fontFamily="monospace"
                                    textAnchor="middle"
                                  >
                                    {loc.distance}
                                  </text>
                                </g>

                                {/* MAP TOOLTIP HOVER ACCENT */}
                                {(isHovered || isSelected) && (
                                  <g transform={`translate(${loc.x}, ${loc.y - 42})`}>
                                    <rect 
                                      x="-55" 
                                      y="-12" 
                                      width="110" 
                                      height="24" 
                                      rx="6" 
                                      fill="rgba(11, 19, 41, 0.95)" 
                                      stroke={primaryColor} 
                                      strokeWidth="1" 
                                    />
                                    <text 
                                      y="-1.5" 
                                      fill="#ffffff" 
                                      fontSize="8" 
                                      fontWeight="bold"
                                      textAnchor="middle"
                                    >
                                      {loc.shortName}
                                    </text>
                                    <text 
                                      y="8.5" 
                                      fill="#f97316" 
                                      fontSize="7.5" 
                                      fontFamily="monospace"
                                      fontWeight="bold"
                                      style={{ color: primaryColor }}
                                      textAnchor="middle"
                                    >
                                      {activeMode === 'drive' ? `🚗 ${loc.duration.drive}` : activeMode === 'transit' ? `🚌 ${loc.duration.transit}` : `🚶 ${loc.duration.walk}`}
                                    </text>
                                  </g>
                                )}
                              </g>
                            );
                          })}

                          {/* DVARIX CENTRAL PROPERTY HIGHLIGHT PIN */}
                          <g transform="translate(220, 190)">
                            {/* Radial Ripple Wave ring */}
                            <motion.circle
                              cx={0}
                              cy={0}
                              r={16}
                              fill="rgba(255, 90, 60, 0.15)"
                              stroke="rgba(255, 90, 60, 0.5)"
                              strokeWidth={1}
                              style={{ stroke: primaryColor }}
                              animate={{
                                scale: [1, 2.5, 1],
                                opacity: [0.6, 0, 0.6]
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />

                            {/* Property marker shape */}
                            <motion.path 
                              d="M0 -22 C-8 -22, -10 -14, 0 0 C10 -14, 8 -22, 0 -22 Z" 
                              fill={primaryColor} 
                              stroke="#ffffff"
                              strokeWidth="1.5"
                              initial={{ y: -80, scale: 0.2 }}
                              animate={{ y: 0, scale: 1 }}
                              transition={{ type: "spring", stiffness: 350, damping: 14, delay: 0.4 }}
                            />

                            {/* Center white core circle with building icon */}
                            <circle cx={0} cy={-13} r={5} fill="#ffffff" />
                            <circle cx={0} cy={-13} r={2} fill={primaryColor} />
                          </g>
                        </g>
                      </svg>

                      {/* FLOATING PROJECT DETAILS CARD ON MAP */}
                      <div className="absolute top-4 left-4 z-10 bg-slate-950/95 border border-slate-800 p-3 rounded-xl max-w-[240px] shadow-2xl backdrop-blur-md">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 bg-orange-500/10 text-orange-500 rounded border border-orange-500/20" style={{ color: primaryColor, borderColor: `${primaryColor}20` }}>
                            <Building className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-white block tracking-tight truncate">{property.title}</span>
                            <span className="text-[9px] text-slate-400 block mt-0.5 truncate">{property.location}</span>
                            <div className="flex items-center gap-1.5 mt-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                              <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider">Premium Hub Site</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* FLOATING ROUTING FILTER (BY CAR / WALK / TRANSIT) */}
                      <div className="absolute top-4 right-4 z-10 bg-slate-950/90 border border-slate-800 p-1 rounded-xl shadow-xl flex gap-1 backdrop-blur-md">
                        {[
                          { id: 'drive', label: 'By Car', icon: Car },
                          { id: 'walk', label: 'By Walk', icon: Compass },
                          { id: 'transit', label: 'By Transit', icon: Bus }
                        ].map((m) => {
                          const ModeIcon = m.icon;
                          const isActive = activeMode === m.id;
                          return (
                            <button
                              key={m.id}
                              onClick={() => {
                                setActiveMode(m.id as any);
                                triggerToast("Transit Mode Updated", `Calculating regional travel vectors for "${m.label}".`);
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${isActive ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
                              style={isActive ? { backgroundColor: primaryColor } : {}}
                            >
                              <ModeIcon className="w-3.5 h-3.5" />
                              <span>{m.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* COMPASS DIAL ACCENT */}
                      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
                        <motion.div 
                          className="w-10 h-10 bg-slate-950/90 border border-slate-800 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md cursor-help"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 1.5, ease: "easeInOut" }}
                        >
                          <Compass className="w-5 h-5 text-orange-500" style={{ color: primaryColor }} />
                        </motion.div>
                        <div className="hidden sm:block">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Compass dial</p>
                          <p className="text-[8px] text-slate-500 font-mono mt-0.5">True North Oriented</p>
                        </div>
                      </div>

                      {/* RIGHT SIDE VERTICAL MAP CONTROLS PANEL */}
                      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
                        
                        {/* Traffic Flow Layer Switcher */}
                        <button
                          onClick={() => setIsTraffic(!isTraffic)}
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-300 shadow-md backdrop-blur-md ${isTraffic ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-slate-950/90 border-slate-800 text-slate-400 hover:text-white'}`}
                          title="Toggle live traffic flows"
                        >
                          <Layers className="w-4 h-4" />
                        </button>

                        {/* Satellite Toggle */}
                        <button
                          onClick={() => setIsSatellite(!isSatellite)}
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-300 shadow-md backdrop-blur-md ${isSatellite ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-slate-950/90 border-slate-800 text-slate-400 hover:text-white'}`}
                          title="Toggle satellite blueprint mesh"
                        >
                          <Map className="w-4 h-4" />
                        </button>

                        {/* Zoom In / Zoom Out */}
                        <div className="bg-slate-950/90 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-md">
                          <button 
                            onClick={() => setZoom(prev => Math.min(prev + 0.15, 1.8))}
                            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors border-b border-slate-800/60"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.8))}
                            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Fullscreen Button */}
                        <button
                          onClick={() => setIsMapFullscreen(true)}
                          className="w-9 h-9 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors shadow-md"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: NEARBY CONNECTIVITY PANEL */}
                  <div className="lg:col-span-5 flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        Connectivity advantages ({locationsData.length} records)
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">Distance verified by Dvarix GIS API</span>
                    </div>

                    {/* LOCATION ADVANTAGE CARDS LIST */}
                    <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
                      {locationsData.map((loc) => {
                        const isHovered = hoveredLocationId === loc.id;
                        const isSelected = selectedLocationId === loc.id;
                        const cardIcon = loc.icon;
                        const travelTime = activeMode === 'drive' ? loc.duration.drive : activeMode === 'transit' ? loc.duration.transit : loc.duration.walk;
                        const travelIcon = activeMode === 'drive' ? '🚗' : activeMode === 'transit' ? '🚌' : '🚶';
                        const CardIconComponent = cardIcon;

                        return (
                          <motion.div
                            key={loc.id}
                            onHoverStart={() => setHoveredLocationId(loc.id)}
                            onHoverEnd={() => setHoveredLocationId(null)}
                            onClick={() => {
                              setSelectedLocationId(selectedLocationId === loc.id ? null : loc.id);
                            }}
                            className={`p-3.5 rounded-xl border cursor-pointer relative overflow-hidden transition-all duration-300 ${isSelected ? 'bg-slate-900 border-orange-500/50 shadow-lg' : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900 hover:border-slate-700'}`}
                            whileHover={{ y: -3, scale: 1.01 }}
                            transition={{ duration: 0.2 }}
                            style={{ borderRadius: borderRadius }}
                          >
                            {/* Accent indicator border left */}
                            <div 
                              className={`absolute top-0 bottom-0 left-0 w-1 transition-all duration-300 ${isSelected || isHovered ? 'bg-orange-500' : 'bg-transparent'}`}
                              style={{ backgroundColor: isSelected || isHovered ? primaryColor : undefined }}
                            />

                            <div className="flex items-start gap-3.5">
                              {/* Icon background */}
                              <div className={`p-2.5 rounded-lg border shrink-0 transition-colors ${isSelected || isHovered ? 'bg-orange-500/15 border-orange-500 text-orange-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                                <CardIconComponent className="w-4 h-4" />
                              </div>

                              {/* Details info */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-xs font-bold text-white truncate group-hover:text-orange-400 transition-colors">{loc.name}</h4>
                                  <span className="text-[10px] font-mono text-slate-500 shrink-0 font-bold">{loc.distance}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-mono mt-1">{loc.type} Corridor</p>

                                {/* TRAVEL MODE PILL */}
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-slate-950 border border-slate-800 text-slate-300">
                                    <span className="text-[10px]">{travelIcon}</span>
                                    <span>{travelTime}</span>
                                  </span>
                                  <span className="text-[9px] text-slate-500 font-mono">Travel Mode: {activeMode === 'drive' ? 'Drive' : activeMode === 'transit' ? 'Transit' : 'Walk'}</span>
                                </div>

                                {/* COLLAPSIBLE DESCRIPTION BLOCK */}
                                <AnimatePresence>
                                  {isSelected && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="overflow-hidden mt-3 pt-3 border-t border-slate-800"
                                    >
                                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{loc.description}</p>
                                      <div className="flex items-center gap-3 mt-2.5">
                                        <a 
                                          href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(property.location)}&destination=${encodeURIComponent(loc.name)}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-[9px] font-mono font-black text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
                                        >
                                          Calculate detailed ETA <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* BOTTOM COMPONENT BLOCK: SMART LOCATION INSIGHTS SUMMARY & ACTION BAR */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 relative z-20 border-t border-slate-800/80">
                  
                  {/* SMART LOCATION INSIGHTS SUMMARY CARD (LEFT 7 COLS) */}
                  <div className="md:col-span-7 bg-slate-900/30 border border-slate-800/80 p-5 rounded-2xl flex flex-col sm:flex-row gap-5 items-center backdrop-blur-md" style={{ borderRadius: borderRadius }}>
                    <div className="shrink-0 text-center sm:text-left">
                      <div className="inline-flex p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-orange-500 mb-2" style={{ color: primaryColor }}>
                        <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
                      </div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">Nearby Essentials</h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Surrounding Node Counts</p>
                    </div>

                    <div className="h-px sm:h-16 w-full sm:w-px bg-slate-800/80" />

                    {/* COUNT-UP GRID FOR SMART ESSENTIALS */}
                    <div className="grid grid-cols-3 gap-x-6 gap-y-3 w-full">
                      {[
                        { label: 'Schools', count: 8, prefix: '🏫' },
                        { label: 'Hospitals', count: 5, prefix: '🏥' },
                        { label: 'Shopping', count: 6, prefix: '🛍' },
                        { label: 'Railway', count: 1, prefix: '🚉' },
                        { label: 'Highways', count: 2, prefix: '🛣' },
                        { label: 'Parks', count: 4, prefix: '🌳' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs">{item.prefix}</span>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block leading-none">{item.label}</span>
                            <span className="text-xs font-black text-white font-mono mt-1 block">
                              <span>{item.count}</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PREMIUM CTA BUTTONS (RIGHT 5 COLS) */}
                  <div className="md:col-span-5 flex flex-col justify-center gap-3.5">
                    
                    {/* Primary Button */}
                    <motion.a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.title + " " + property.location)}`}
                      target="_blank" 
                      rel="noreferrer"
                      whileHover={{ 
                        scale: 1.02, 
                        boxShadow: "0 10px 25px rgba(249, 115, 22, 0.25)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer group"
                      style={{ borderRadius: borderRadius }}
                    >
                      <MapPin className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> 
                      <span>Open in Google Maps</span>
                    </motion.a>

                    {/* Secondary Button */}
                    <motion.button
                      onClick={() => {
                        const formElement = document.getElementById('contact');
                        if (formElement) {
                          formElement.scrollIntoView({ behavior: 'smooth' });
                          triggerToast("Route Ingestion", "Complete inquiry module to download precise GPS coordinates & directions roadmap.");
                        } else {
                          triggerToast("Get Directions", "Calculated distance: 4.2 km. Direct transit directions sent to your registered consultant.");
                        }
                      }}
                      whileHover={{ 
                        scale: 1.02, 
                        backgroundColor: "rgba(255, 255, 255, 0.08)"
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                      style={{ borderRadius: borderRadius }}
                    >
                      <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} /> 
                      <span>Get Directions Roadmap</span>
                    </motion.button>
                  </div>
                </div>

                {/* IMMERSIVE FULL-VIEWPORT MODAL FOR MAP EXPLORATION */}
                <AnimatePresence>
                  {isMapFullscreen && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col p-4 sm:p-6"
                    >
                      {/* Fullscreen header */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                        <div>
                          <h4 className="text-lg font-black text-white flex items-center gap-2">
                            <MapPin className="text-orange-500" style={{ color: primaryColor }} />
                            {property.title} - Location Intelligence Dashboard
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">{property.location} & surrounding geographic transit advantages</p>
                        </div>
                        <button 
                          onClick={() => setIsMapFullscreen(false)}
                          className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors flex items-center justify-center"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Fullscreen contents */}
                      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                        {/* Enlarged interactive map canvas */}
                        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden flex flex-col">
                          
                          {/* FLOATING MAP LAYERS INSIDE FULLSCREEN */}
                          <div className="absolute top-4 left-4 z-10 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl max-w-[280px] backdrop-blur-md">
                            <span className="text-[10px] font-mono text-orange-400 block font-bold" style={{ color: primaryColor }}>Map HUD Settings</span>
                            <p className="text-[9px] text-slate-400 mt-0.5">Use sidebar cards to lock destinations and trace route lines in real time.</p>
                            
                            <div className="flex flex-col gap-2 mt-3 border-t border-slate-800/80 pt-2.5">
                              <label className="flex items-center justify-between text-[10px] text-slate-300 cursor-pointer">
                                <span>Satellite Mesh Mode</span>
                                <input 
                                  type="checkbox" 
                                  checked={isSatellite} 
                                  onChange={(e) => setIsSatellite(e.target.checked)} 
                                  className="accent-orange-500 rounded text-xs"
                                />
                              </label>
                              <label className="flex items-center justify-between text-[10px] text-slate-300 cursor-pointer">
                                <span>Live Traffic Overlays</span>
                                <input 
                                  type="checkbox" 
                                  checked={isTraffic} 
                                  onChange={(e) => setIsTraffic(e.target.checked)} 
                                  className="accent-orange-500 rounded text-xs"
                                />
                              </label>
                            </div>
                          </div>

                          <div className="absolute top-4 right-4 z-10 flex gap-2">
                            {/* Fullscreen Travel selectors */}
                            <div className="bg-slate-900/90 border border-slate-800 p-1 rounded-xl flex gap-1 backdrop-blur-md">
                              {['drive', 'walk', 'transit'].map((m) => (
                                <button
                                  key={m}
                                  onClick={() => setActiveMode(m as any)}
                                  className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase transition-all ${activeMode === m ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
                                  style={activeMode === m ? { backgroundColor: primaryColor } : {}}
                                >
                                  {m === 'drive' ? '🚗 Car' : m === 'walk' ? '🚶 Walk' : '🚌 Transit'}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* SVG MAP WORKSPACE */}
                          <div className="flex-1 relative w-full h-full min-h-0 bg-slate-950">
                            <div className={`absolute inset-0 transition-all duration-700 ${isSatellite ? 'bg-slate-950 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-90' : 'bg-slate-900 bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-70'}`} />
                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 380" preserveAspectRatio="xMidYMid slice">
                              <g style={{ transform: `scale(${zoom})`, transformOrigin: '220px 190px', transition: 'transform 0.4s' }}>
                                {/* Shared SVG layers */}
                                {/* Concord circles */}
                                {[60, 130, 210, 300].map((radius) => (
                                  <circle key={radius} cx={220} cy={190} r={radius} fill="none" stroke="rgba(249, 115, 22, 0.08)" strokeWidth="1" strokeDasharray="5,5" />
                                ))}
                                
                                {/* Waterbody */}
                                <path d="M-20,320 Q130,290 240,315 T520,290" fill="none" stroke={isSatellite ? "#0c4a6e" : "#1e293b"} strokeWidth="22" opacity="0.6" />

                                {/* Secondary roads */}
                                <g stroke="rgba(255,255,255,0.06)" strokeLinecap="round" fill="none" strokeWidth="2">
                                  <path d="M 0 50 L 500 300" strokeWidth="6" stroke="rgba(245, 158, 11, 0.15)" />
                                  <path d="M 80 0 L 80 380" />
                                  <path d="M 380 0 L 380 380" />
                                  <path d="M 0 140 L 500 140" />
                                  <path d="M 0 190 L 500 190" />
                                </g>

                                {/* Traffic Overlays */}
                                {isTraffic && (
                                  <g strokeLinecap="round" fill="none" opacity="0.7" strokeWidth="2">
                                    <path d="M 0 140 L 180 140" stroke="#22c55e" />
                                    <path d="M 240 140 L 500 140" stroke="#22c55e" />
                                    <path d="M 180 140 L 220 140" stroke="#eab308" />
                                    <path d="M 220 160 L 220 220" stroke="#ef4444" strokeWidth="3" />
                                  </g>
                                )}

                                {/* Routes paths */}
                                {locationsData.map((loc) => {
                                  const isHovered = hoveredLocationId === loc.id;
                                  const isSelected = selectedLocationId === loc.id;
                                  const isActiveRoute = isHovered || isSelected;

                                  const dx = loc.x - 220;
                                  const dy = loc.y - 190;
                                  const mx = 220 + dx / 2;
                                  const my = 190 + dy / 2;
                                  const dist = Math.sqrt(dx * dx + dy * dy);
                                  const px = -dy / dist;
                                  const py = dx / dist;
                                  const curveHeight = dist * 0.15;
                                  const cx = mx + px * curveHeight;
                                  const cy = my + py * curveHeight;
                                  const pathData = `M 220 190 Q ${cx} ${cy} ${loc.x} ${loc.y}`;

                                  return (
                                    <path 
                                      key={`fs-route-${loc.id}`}
                                      d={pathData}
                                      fill="none"
                                      stroke={isActiveRoute ? primaryColor : "rgba(148, 163, 184, 0.12)"}
                                      strokeWidth={isActiveRoute ? 4 : 1.5}
                                      strokeDasharray={isActiveRoute ? "8,4" : "4,4"}
                                    />
                                  );
                                })}

                                {/* Pins */}
                                {locationsData.map((loc) => {
                                  const isHovered = hoveredLocationId === loc.id;
                                  const isSelected = selectedLocationId === loc.id;
                                  const MIcon = loc.icon;

                                  return (
                                    <g key={`fs-pin-${loc.id}`} onClick={() => setSelectedLocationId(loc.id)}>
                                      <circle cx={loc.x} cy={loc.y} r={isHovered || isSelected ? 20 : 12} fill={isHovered || isSelected ? primaryColor : "rgba(15, 23, 42, 0.9)"} stroke={primaryColor} strokeWidth="1" />
                                      <foreignObject x={loc.x - 8} y={loc.y - 8} width={16} height={16}>
                                        <div className="flex items-center justify-center w-full h-full text-white">
                                          <MIcon className="w-3.5 h-3.5" />
                                        </div>
                                      </foreignObject>
                                      <text x={loc.x} y={loc.y - 24} fill="#ffffff" fontSize="6.5" fontWeight="bold" textAnchor="middle" className="bg-slate-950 px-1">{loc.shortName}</text>
                                    </g>
                                  );
                                })}

                                {/* Center Dvarix Pin */}
                                <g transform="translate(220,190)">
                                  <circle cx={0} cy={0} r={14} fill="none" stroke={primaryColor} strokeWidth="1" className="animate-pulse" />
                                  <path d="M0 -18 C-6 -18, -8 -12, 0 0 C8 -12, 6 -18, 0 -18 Z" fill={primaryColor} stroke="#ffffff" strokeWidth="1" />
                                </g>
                              </g>
                            </svg>
                          </div>

                          {/* Fullscreen map footer dials */}
                          <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                            <div className="flex gap-2">
                              <button onClick={() => setZoom(prev => Math.min(prev + 0.15, 1.8))} className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs hover:text-white">+</button>
                              <button onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.8))} className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs hover:text-white">-</button>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">Zoom Ratio: {Math.round(zoom * 100)}%</span>
                          </div>
                        </div>

                        {/* Fullscreen Sidebar list panel */}
                        <div className="lg:col-span-4 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-y-auto">
                          <span className="text-xs text-orange-500 font-mono uppercase font-bold mb-3">High-Growth Arterial Directory</span>
                          <div className="space-y-3 flex-1 min-h-0">
                            {locationsData.map((loc) => {
                              const isSelected = selectedLocationId === loc.id;
                              const isHovered = hoveredLocationId === loc.id;
                              const travelTime = activeMode === 'drive' ? loc.duration.drive : activeMode === 'transit' ? loc.duration.transit : loc.duration.walk;
                              return (
                                <div 
                                  key={`fs-card-${loc.id}`}
                                  onMouseEnter={() => setHoveredLocationId(loc.id)}
                                  onMouseLeave={() => setHoveredLocationId(null)}
                                  onClick={() => setSelectedLocationId(loc.id)}
                                  className={`p-3 rounded-xl border cursor-pointer transition-all ${isSelected || isHovered ? 'bg-slate-950 border-orange-500' : 'bg-slate-950/45 border-slate-800'}`}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-white">{loc.name}</span>
                                    <span className="text-[9px] text-slate-400 font-mono font-bold shrink-0">{loc.distance}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 mt-1">{loc.type} corridor</p>
                                  <div className="text-[10px] text-orange-400 font-mono mt-1 font-bold">Estimated Travel: {travelTime} ({activeMode === 'drive' ? 'Driving' : activeMode === 'transit' ? 'Transit' : 'Walk'})</div>
                                  {isSelected && (
                                    <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">{loc.description}</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>

              {/* MODULE: LIFESTYLE AMENITIES */}
              <motion.section 
                id="amenities" 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, boxShadow: "0 25px 50px rgba(0, 0, 0, 0.04)" }}
                className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all duration-500 relative overflow-hidden" 
                style={{ borderRadius: cardBorderRadius }}
              >
                <ShimmerOverlay />

                <div className="border-b border-slate-200 pb-4 relative z-20">
                  <span className="text-xs text-orange-500 font-mono uppercase tracking-widest font-bold" style={{ color: primaryColor }}>Resort-Grade Setup</span>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-1">Gated Lifestyle Amenities</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-20">
                  {activeAmenities.length > 0 ? (
                    activeAmenities.map((am, i) => (
                      <motion.div 
                        whileHover={{ y: -5, scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.03)", borderColor: `${primaryColor}40` }}
                        transition={{ type: "spring", stiffness: 450, damping: 20 }}
                        key={i} 
                        className="p-3 bg-slate-50/50 backdrop-blur-xs border border-slate-200/50 rounded-xl flex items-start space-x-2.5 transition-all duration-300" 
                        style={{ borderRadius: cardBorderRadius }}
                      >
                        <div className="p-2 bg-white rounded-lg text-orange-500 border border-slate-200/60 transition-colors" style={{ color: primaryColor }}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-950 block truncate">{am.label}</span>
                          <span className="text-[9px] text-slate-500 font-mono mt-0.5 block truncate">{am.desc}</span>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    [
                      { label: 'Compound Wall', desc: 'Secure masonry wall' },
                      { label: 'CCTV Surveillance', desc: '24/7 continuous stream' },
                      { label: '24/7 Security Staff', desc: 'Guarded access gates' },
                      { label: 'Blacktop Roads', desc: '40ft & 60ft layouts' },
                      { label: 'Electricity Link', desc: 'Standard sub-stations' },
                      { label: 'Drinking Water Network', desc: 'Continuous plumbing line' },
                      { label: 'Storm Water Drains', desc: 'Concrete storm piping' },
                      { label: 'Lush Gardens', desc: 'Architect-designed flora' }
                    ].map((am, i) => (
                      <motion.div 
                        whileHover={{ y: -5, scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.03)", borderColor: `${primaryColor}40` }}
                        transition={{ type: "spring", stiffness: 450, damping: 20 }}
                        key={i} 
                        className="p-3 bg-slate-50/50 backdrop-blur-xs border border-slate-200/50 rounded-xl flex items-start space-x-2.5 transition-all duration-300" 
                        style={{ borderRadius: cardBorderRadius }}
                      >
                        <div className="p-2 bg-white rounded-lg text-orange-500 border border-slate-200/60 transition-colors" style={{ color: primaryColor }}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-950 block truncate">{am.label}</span>
                          <span className="text-[9px] text-slate-500 font-mono mt-0.5 block truncate">{am.desc}</span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.section>

              {/* MODULE: INTERACTIVE PLOT LAYOUT GRID */}
              <motion.section 
                id="layout" 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, boxShadow: "0 25px 50px rgba(0, 0, 0, 0.04)" }}
                className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all duration-500 relative overflow-hidden" 
                style={{ borderRadius: cardBorderRadius }}
              >
                <ShimmerOverlay />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 relative z-20">
                  <div>
                    <span className="text-xs text-orange-500 font-mono uppercase tracking-widest font-bold" style={{ color: primaryColor }}>Real-time Sandbox</span>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-1">Interactive Layout Navigator</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono">
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Available
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-600">
                      <span className="w-2 h-2 bg-amber-500 rounded-full" /> Reserved
                    </span>
                    <span className="flex items-center gap-1.5 text-red-500">
                      <span className="w-2 h-2 bg-red-400 rounded-full" /> Sold
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-20">
                  {/* Visual plot interactive container */}
                  <div className="md:col-span-8 p-4 bg-slate-50/50 backdrop-blur-xs rounded-xl border border-slate-200/60 flex flex-col justify-between" style={{ borderRadius: borderRadius }}>
                    <div className="grid grid-cols-4 gap-2.5">
                      {activePlots.map((plot: any, idx: number) => {
                        const isSelected = selectedPlot?.id === plot.id;
                        let statusColor = 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-500/30';
                        if (plot.status === 'sold') statusColor = 'bg-slate-100 border-slate-200 text-slate-400 opacity-50';
                        if (plot.status === 'reserved') statusColor = 'bg-amber-500/5 border-amber-500/20 text-amber-600 hover:bg-amber-500/10 hover:border-amber-500/30';

                        if (isSelected) statusColor = 'bg-orange-500 border-orange-500 text-slate-950 font-black';

                        return (
                          <motion.button
                            whileHover={plot.status !== 'sold' ? { scale: 1.05, y: -2 } : {}}
                            whileTap={plot.status !== 'sold' ? { scale: 0.95 } : {}}
                            key={plot.id || idx}
                            disabled={plot.status === 'sold'}
                            onClick={() => setSelectedPlot(plot)}
                            style={{ 
                              backgroundColor: isSelected ? primaryColor : undefined, 
                              borderColor: isSelected ? primaryColor : undefined,
                              borderRadius: borderRadius 
                            }}
                            className={`p-3.5 border rounded-lg text-xs font-mono font-bold tracking-wider text-center transition flex flex-col justify-center items-center gap-1 ${statusColor} ${plot.status !== 'sold' ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                          >
                            <span>{plot.id}</span>
                            <span className="text-[8px] opacity-75">{plot.size}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                    
                    <p className="text-[10px] text-slate-400 font-mono mt-4 text-center">Click any Available or Reserved plot block to verify micro pricing details.</p>
                  </div>

                  {/* Details for selected plot */}
                  <div className="md:col-span-4 p-4.5 bg-slate-50/70 border border-slate-200/60 rounded-xl flex flex-col justify-between" style={{ borderRadius: borderRadius }}>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-orange-500 tracking-wider" style={{ color: primaryColor }}>Unit Blueprint Details</span>
                      <h4 className="text-base font-bold text-slate-900 mt-1">Plot ID: {selectedPlot?.id}</h4>
                      
                      <div className="space-y-2.5 mt-4 text-xs font-mono">
                        <div className="flex justify-between border-b border-slate-200 pb-1.5">
                          <span className="text-slate-500">Dimensions</span>
                          <span className="text-slate-950 font-bold">{selectedPlot?.size} Sq.Ft</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-1.5">
                          <span className="text-slate-500">Vastu Facing</span>
                          <span className="text-slate-950 font-bold">{selectedPlot?.facing}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-1.5">
                          <span className="text-slate-500">Plot Status</span>
                          <span className={`capitalize font-bold ${selectedPlot?.status === 'available' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {selectedPlot?.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Approx Value</span>
                          <span className="text-orange-500 font-bold" style={{ color: primaryColor }}>₹{selectedPlot?.price}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setVisitorName(selectedPlot?.id ? `Plot ${selectedPlot.id} Inquiry` : 'Villa Plot Inquiry');
                        handleScrollToSection('contact');
                      }}
                      className="mt-6 w-full py-2 bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold text-xs font-mono tracking-wider rounded-lg transition uppercase cursor-pointer"
                      style={{ borderRadius: borderRadius, backgroundColor: primaryBtnColor }}
                    >
                      Book Plot {selectedPlot?.id}
                    </button>
                  </div>
                </div>
              </motion.section>

              {/* MODULE: SMART BUYER INTELLIGENCE TOOLS */}
              <motion.section 
                id="smart-tools" 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, boxShadow: "0 25px 50px rgba(0, 0, 0, 0.04)" }}
                className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all duration-500 relative overflow-hidden" 
                style={{ borderRadius: cardBorderRadius }}
              >
                <ShimmerOverlay />

                <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-20">
                  <div>
                    <span className="text-xs text-orange-500 font-mono uppercase tracking-widest font-bold" style={{ color: primaryColor }}>FINANCIAL & TRANSIT SUITE</span>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Smart Buyer Tools</h3>
                  </div>
                  <p className="text-xs text-slate-600 max-w-lg font-sans font-light leading-relaxed">
                    Make confident, analytical decisions before purchasing. Model commute timelines, calculate custom banking eligibility, and run instant mortgage simulations directly mapped to this asset.
                  </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 relative z-20">
                  {/* CARD 1: TRAVEL TIME CALCULATOR */}
                  <div className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between space-y-5 shadow-xs" style={{ borderRadius: borderRadius }}>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500 border border-orange-500/20" style={{ color: primaryColor, borderColor: `${primaryColor}20`, backgroundColor: `${primaryColor}10` }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h10a2 2 0 0 0 4 0Z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 tracking-tight">Travel Time Calculator</h4>
                          <span className="text-[10px] text-slate-400 font-mono uppercase">Commute Audits & Transit Modes</span>
                        </div>
                      </div>

                      {/* Mode Switcher */}
                      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        {(['driving', 'transit', 'walking'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setSmartTravelMode(mode)}
                            className={`flex-1 py-1.5 px-1.5 rounded-lg text-[9px] font-mono font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer ${
                              smartTravelMode === mode
                                ? 'bg-orange-500 text-white shadow-md font-black'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                            style={smartTravelMode === mode ? { backgroundColor: primaryColor, color: '#ffffff' } : {}}
                          >
                            {mode === 'driving' && <span>🚗 Driving</span>}
                            {mode === 'transit' && <span>🚇 Transit</span>}
                            {mode === 'walking' && <span>🚶‍♂️ Walking</span>}
                          </button>
                        ))}
                      </div>

                      {/* Destinations List */}
                      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                        {travelDestinations.map((dest, idx) => {
                          const isSelected = smartTravelDestIdx === idx;
                          const computedTime = calculateTravelTime(dest.distance, smartTravelMode);
                          return (
                            <button
                              key={dest.id}
                              onClick={() => setSmartTravelDestIdx(idx)}
                              className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'bg-slate-50 border-orange-500/30 text-slate-900'
                                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900'
                              }`}
                              style={isSelected ? { borderColor: `${primaryColor}40` } : {}}
                            >
                              <div className="min-w-0 pr-2">
                                <span className="text-[11px] font-bold block truncate text-slate-800">{dest.name}</span>
                                <span className="text-[8px] font-mono text-slate-400 block truncate uppercase tracking-wider">{dest.type}</span>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[10px] font-mono block text-slate-500">{dest.originalDistanceStr}</span>
                                <span className="text-[9px] font-mono text-orange-500 font-black block" style={{ color: primaryColor }}>{computedTime}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Animated Visual Route Timeline */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between space-y-4 relative overflow-hidden">
                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                        <span className="truncate max-w-[100px]">From: {property.title}</span>
                        <span className="truncate max-w-[100px]">To: {travelDestinations[smartTravelDestIdx]?.name || 'Destination'}</span>
                      </div>

                      {/* SVG Animated Connector Line */}
                      <div className="relative py-4 flex items-center justify-between px-2">
                        <div className="absolute left-4 right-4 top-1/2 h-[1px] bg-slate-200" />
                        <div 
                          className="absolute left-4 top-1/2 h-[1px] transition-all duration-500"
                          style={{ 
                            width: '100%',
                            backgroundImage: `linear-gradient(90deg, ${primaryColor} 50%, transparent 50%)`,
                            backgroundSize: '8px 1px'
                          }} 
                        />

                        {/* Origin Point */}
                        <div className="z-10 flex flex-col items-center">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-sm">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                          </div>
                          <span className="text-[7px] font-mono text-slate-400 mt-1 block">Property</span>
                        </div>

                        {/* Moving vehicle overlay */}
                        <div className="absolute left-6 right-12 top-[6px] h-10 pointer-events-none">
                          <motion.div
                            animate={{ x: ['0%', '82%', '0%'] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute text-orange-500 text-[10px] flex items-center justify-center bg-white border border-slate-200 px-1.5 py-1 rounded-lg shadow-sm text-slate-800"
                            style={{ color: primaryColor, borderColor: `${primaryColor}20` }}
                          >
                            {smartTravelMode === 'driving' && <span>🚗 Commuting</span>}
                            {smartTravelMode === 'transit' && <span>🚇 Commuting</span>}
                            {smartTravelMode === 'walking' && <span>🚶‍♂️ Walking</span>}
                          </motion.div>
                        </div>

                        {/* Destination Point */}
                        <div className="z-10 flex flex-col items-center">
                          <div className="w-5 h-5 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 shadow-sm" style={{ borderColor: `${primaryColor}30` }}>
                            <span className="w-2 h-2 bg-orange-500 rounded-full" style={{ backgroundColor: primaryColor }} />
                          </div>
                          <span className="text-[7px] font-mono text-slate-400 mt-1 block">Arrival</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-end border-t border-slate-200/60 pt-2.5">
                        <div>
                          <span className="text-[8px] font-mono uppercase text-slate-400 block">Trip Time</span>
                          <span className="text-lg font-black text-slate-900 block mt-0.5">{calculateTravelTime(travelDestinations[smartTravelDestIdx]?.distance || 5, smartTravelMode)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] font-mono uppercase text-slate-400 block">Trip Distance</span>
                          <span className="text-[10px] font-bold text-slate-600 block font-mono mt-0.5">{(travelDestinations[smartTravelDestIdx]?.distance || 5).toFixed(1)} km</span>
                        </div>
                      </div>
                    </div>

                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(property.title + " " + property.location)}&destination=${encodeURIComponent(travelDestinations[smartTravelDestIdx]?.name || '')}&travelmode=${smartTravelMode}`}
                      target="_blank" 
                      rel="noreferrer"
                      className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs font-mono tracking-wider rounded-xl transition uppercase cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                      style={{ borderRadius: borderRadius, backgroundColor: primaryBtnColor }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      Open in Google Maps
                    </a>
                  </div>

                  {/* CARD 2: LOAN ELIGIBILITY CHECKER */}
                  <div className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between space-y-5 shadow-xs" style={{ borderRadius: borderRadius }}>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500 border border-orange-500/20" style={{ color: primaryColor, borderColor: `${primaryColor}20`, backgroundColor: `${primaryColor}10` }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 tracking-tight">Loan Eligibility Checker</h4>
                          <span className="text-[10px] text-slate-400 font-mono uppercase">Instant Underwriting Simulation</span>
                        </div>
                      </div>

                      {/* Form Inputs */}
                      <div className="space-y-3">
                        {/* Employment Type Selector */}
                        <div className="flex justify-between items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                          {(['salaried', 'self-employed'] as const).map((type) => (
                            <button
                              key={type}
                              onClick={() => setSmartLoanEmpType(type)}
                              className={`flex-1 py-1.5 px-1.5 rounded-lg text-[9px] font-mono font-bold uppercase transition cursor-pointer ${
                                smartLoanEmpType === type
                                  ? 'bg-orange-500 text-white shadow-md font-black'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                              style={smartLoanEmpType === type ? { backgroundColor: primaryColor, color: '#ffffff' } : {}}
                            >
                              {type === 'salaried' ? 'Salaried' : 'Self-Employed'}
                            </button>
                          ))}
                        </div>

                        {/* Income Slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-slate-500">Monthly Net Income</span>
                            <span className="text-slate-800 font-bold">{formatPrice(smartLoanIncome)}</span>
                          </div>
                          <input 
                            type="range" 
                            min="20000" 
                            max="500000" 
                            step="5000"
                            value={smartLoanIncome}
                            onChange={(e) => setSmartLoanIncome(Number(e.target.value))}
                            className="w-full accent-orange-500"
                          />
                        </div>

                        {/* Existing EMI Slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-slate-500">Existing Monthly EMIs</span>
                            <span className="text-slate-800 font-bold">{formatPrice(smartLoanExistingEmi)}</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="150000" 
                            step="2000"
                            value={smartLoanExistingEmi}
                            onChange={(e) => setSmartLoanExistingEmi(Number(e.target.value))}
                            className="w-full accent-orange-500"
                          />
                        </div>

                        {/* Age Slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-slate-500">Applicant Age</span>
                            <span className="text-slate-800 font-bold">{smartLoanAge} Years</span>
                          </div>
                          <input 
                            type="range" 
                            min="21" 
                            max="60" 
                            step="1"
                            value={smartLoanAge}
                            onChange={(e) => setSmartLoanAge(Number(e.target.value))}
                            className="w-full accent-orange-500"
                          />
                        </div>

                        {/* Down Payment Slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-slate-500">Down Payment Capital</span>
                            <span className="text-slate-800 font-bold">{formatPrice(smartLoanDownPayment)}</span>
                          </div>
                          <input 
                            type="range" 
                            min="100000" 
                            max="3000000" 
                            step="50000"
                            value={smartLoanDownPayment}
                            onChange={(e) => setSmartLoanDownPayment(Number(e.target.value))}
                            className="w-full accent-orange-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Eligibility Results Dashboard */}
                    <div className="space-y-3 bg-slate-50 border border-slate-100 p-4 rounded-xl">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs">
                          <span className="text-[8px] font-mono text-slate-400 block uppercase">Loan Eligibility</span>
                          <span className="text-sm font-black text-emerald-600 block mt-1 font-mono">
                            {formatCurrencyCompact(
                              Math.max(0, (smartLoanIncome * (smartLoanEmpType === 'salaried'
                                ? (smartLoanIncome < 40000 ? 50 : smartLoanIncome <= 100000 ? 55 : 60)
                                : (smartLoanIncome < 40000 ? 45 : smartLoanIncome <= 100000 ? 50 : 55)) / 100) - smartLoanExistingEmi) > 0
                                ? Math.round(
                                    Math.max(0, (smartLoanIncome * (smartLoanEmpType === 'salaried'
                                      ? (smartLoanIncome < 40000 ? 50 : smartLoanIncome <= 100000 ? 55 : 60)
                                      : (smartLoanIncome < 40000 ? 45 : smartLoanIncome <= 100000 ? 50 : 55)) / 100) - smartLoanExistingEmi) * 
                                    (1 - Math.pow(1 + (8.45 / 12 / 100), -Math.max(5, Math.min(30, (smartLoanEmpType === 'salaried' ? 60 : 65) - smartLoanAge)) * 12)) / 
                                    (8.45 / 12 / 100)
                                  )
                                : 0
                            )}
                          </span>
                          <span className="text-[7px] text-slate-400 font-mono block mt-0.5">at 8.45% p.a interest</span>
                        </div>

                        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs">
                          <span className="text-[8px] font-mono text-slate-400 block uppercase">Property Budget</span>
                          <span className="text-sm font-black text-orange-500 block mt-1 font-mono" style={{ color: primaryColor }}>
                            {formatCurrencyCompact(
                              (Math.max(0, (smartLoanIncome * (smartLoanEmpType === 'salaried'
                                ? (smartLoanIncome < 40000 ? 50 : smartLoanIncome <= 100000 ? 55 : 60)
                                : (smartLoanIncome < 40000 ? 45 : smartLoanIncome <= 100000 ? 50 : 55)) / 100) - smartLoanExistingEmi) > 0
                                ? Math.round(
                                    Math.max(0, (smartLoanIncome * (smartLoanEmpType === 'salaried'
                                      ? (smartLoanIncome < 40000 ? 50 : smartLoanIncome <= 100000 ? 55 : 60)
                                      : (smartLoanIncome < 40000 ? 45 : smartLoanIncome <= 100000 ? 50 : 55)) / 100) - smartLoanExistingEmi) * 
                                    (1 - Math.pow(1 + (8.45 / 12 / 100), -Math.max(5, Math.min(30, (smartLoanEmpType === 'salaried' ? 60 : 65) - smartLoanAge)) * 12)) / 
                                    (8.45 / 12 / 100)
                                  )
                                : 0) + smartLoanDownPayment
                            )}
                          </span>
                          <span className="text-[7px] text-slate-400 font-mono block mt-0.5">with down payment</span>
                        </div>
                      </div>

                      {/* Monthly EMI Burden Bar */}
                      <div className="space-y-1.5 pt-1.5 border-t border-slate-200">
                        <div className="flex justify-between items-center text-[8px] font-mono">
                          <span className="text-slate-400">EMI Debt-to-Income Burden Ratio</span>
                          <span className="text-slate-700 font-bold">
                            {Math.round((Math.max(0, (smartLoanIncome * (smartLoanEmpType === 'salaried'
                              ? (smartLoanIncome < 40000 ? 50 : smartLoanIncome <= 100000 ? 55 : 60)
                              : (smartLoanIncome < 40000 ? 45 : smartLoanIncome <= 100000 ? 50 : 55)) / 100) - smartLoanExistingEmi) / smartLoanIncome) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min(100, Math.round((Math.max(0, (smartLoanIncome * (smartLoanEmpType === 'salaried'
                                ? (smartLoanIncome < 40000 ? 50 : smartLoanIncome <= 100000 ? 55 : 60)
                                : (smartLoanIncome < 40000 ? 45 : smartLoanIncome <= 100000 ? 50 : 55)) / 100) - smartLoanExistingEmi) / smartLoanIncome) * 100))}%`,
                              backgroundColor: primaryColor
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setVisitorName("Special Loan Partner Consultation");
                        handleScrollToSection('contact');
                      }}
                      className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs font-mono tracking-wider rounded-xl transition uppercase cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-md"
                      style={{ borderRadius: borderRadius, backgroundColor: primaryBtnColor }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                      Apply for Pre-Approved Rate
                    </button>
                  </div>

                  {/* CARD 3: EMI CALCULATOR */}
                  <div className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between space-y-5 shadow-xs" style={{ borderRadius: borderRadius }}>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500 border border-orange-500/20" style={{ color: primaryColor, borderColor: `${primaryColor}20`, backgroundColor: `${primaryColor}10` }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="15" y1="9" y2="9"/><line x1="9" x2="15" y1="13" y2="13"/><line x1="9" x2="13" y1="17" y2="17"/><rect width="4" height="4" x="7" y="7" rx="1"/><rect width="4" height="4" x="7" y="13" rx="1"/></svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 tracking-tight">Interactive EMI Calculator</h4>
                          <span className="text-[10px] text-slate-400 font-mono uppercase">Fine-Tuned Debt Modeling</span>
                        </div>
                      </div>

                      {/* Interactive Sliders */}
                      <div className="space-y-3">
                        {/* Property Price Display / Field */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-slate-500">Simulation Asset Value</span>
                            <span className="text-orange-500 font-bold" style={{ color: primaryColor }}>{formatPrice(smartEmiPrice)}</span>
                          </div>
                          <input 
                            type="range" 
                            min={Math.round(property.price * 0.5)} 
                            max={Math.round(property.price * 1.5)} 
                            step="50000"
                            value={smartEmiPrice}
                            onChange={(e) => {
                              setSmartEmiPrice(Number(e.target.value));
                              // Automatically scale down payment proportionally to match 20%
                              setSmartEmiDownPayment(Math.round(Number(e.target.value) * 0.2));
                            }}
                            className="w-full accent-orange-500"
                          />
                        </div>

                        {/* Down Payment Slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-slate-500">Down Payment</span>
                            <span className="text-slate-800 font-bold">{formatPrice(smartEmiDownPayment === -1 ? Math.round(smartEmiPrice * 0.2) : smartEmiDownPayment)}</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max={smartEmiPrice} 
                            step="50000"
                            value={smartEmiDownPayment === -1 ? Math.round(smartEmiPrice * 0.2) : smartEmiDownPayment}
                            onChange={(e) => setSmartEmiDownPayment(Number(e.target.value))}
                            className="w-full accent-orange-500"
                          />
                        </div>

                        {/* Interest Rate Slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-slate-500">Special Interest Rate</span>
                            <span className="text-slate-800 font-bold">{smartEmiRate.toFixed(1)}% p.a</span>
                          </div>
                          <input 
                            type="range" 
                            min="5.0" 
                            max="15.0" 
                            step="0.1"
                            value={smartEmiRate}
                            onChange={(e) => setSmartEmiRate(Number(e.target.value))}
                            className="w-full accent-orange-500"
                          />
                        </div>

                        {/* Loan Tenure Slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-slate-500">Loan Tenure</span>
                            <span className="text-slate-800 font-bold">{smartEmiTenure} Years</span>
                          </div>
                          <input 
                            type="range" 
                            min="1" 
                            max="30" 
                            step="1"
                            value={smartEmiTenure}
                            onChange={(e) => setSmartEmiTenure(Number(e.target.value))}
                            className="w-full accent-orange-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Donut Chart & Breakdown metrics */}
                    {(() => {
                      const actualDownPayment = smartEmiDownPayment === -1 ? Math.round(smartEmiPrice * 0.2) : smartEmiDownPayment;
                      const loanAmt = Math.max(0, smartEmiPrice - actualDownPayment);
                      const r_emi = smartEmiRate / 12 / 100;
                      const n_emi = smartEmiTenure * 12;
                      const monthlyEmiVal = (loanAmt > 0 && r_emi > 0)
                        ? (loanAmt * r_emi * Math.pow(1 + r_emi, n_emi)) / (Math.pow(1 + r_emi, n_emi) - 1)
                        : 0;
                      const totalPayableLoanAmt = monthlyEmiVal * n_emi;
                      const totalInterestPayableAmt = Math.max(0, totalPayableLoanAmt - loanAmt);
                      const totalOverallOutflow = actualDownPayment + totalPayableLoanAmt;

                      const totalBreakdown = loanAmt + totalInterestPayableAmt;
                      const principalPct = totalBreakdown > 0 ? (loanAmt / totalBreakdown) : 1;
                      const interestPct = totalBreakdown > 0 ? (totalInterestPayableAmt / totalBreakdown) : 0;

                      // SVG Pie Donut configuration
                      const radius = 40;
                      const circumference = 2 * Math.PI * radius; // ~251.3
                      const strokeDashPrincipal = circumference * principalPct;
                      const strokeDashInterest = circumference * interestPct;

                      return (
                        <div className="space-y-3">
                          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-4">
                            {/* SVG Custom Donut */}
                            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                {/* Base track */}
                                <circle 
                                  cx="50" cy="50" r={radius} 
                                  fill="transparent" stroke="#f1f5f9" strokeWidth="9" 
                                />
                                {/* Principal arc */}
                                <circle 
                                  cx="50" cy="50" r={radius} 
                                  fill="transparent" stroke="#10b981" strokeWidth="9" 
                                  strokeDasharray={`${strokeDashPrincipal} ${circumference}`}
                                  strokeDashoffset="0"
                                  strokeLinecap="round"
                                />
                                {/* Interest arc */}
                                <circle 
                                  cx="50" cy="50" r={radius} 
                                  fill="transparent" stroke={primaryColor} strokeWidth="9" 
                                  strokeDasharray={`${strokeDashInterest} ${circumference}`}
                                  strokeDashoffset={`-${strokeDashPrincipal}`}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-[7px] text-slate-400 uppercase block font-mono">EMI</span>
                                <span className="text-[10px] font-black text-slate-800 mt-0.5 block font-mono">{formatCurrencyCompact(Math.round(monthlyEmiVal))}</span>
                              </div>
                            </div>

                            {/* Details list inside card */}
                            <div className="flex-1 min-w-0 space-y-1 text-[9px] font-mono text-slate-500">
                              <div className="flex justify-between">
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                  <span>Principal Loan</span>
                                </span>
                                <span className="text-slate-800 font-bold">{formatPrice(loanAmt)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                                  <span>Total Interest</span>
                                </span>
                                <span className="text-slate-800 font-bold">{formatPrice(Math.round(totalInterestPayableAmt))}</span>
                              </div>
                              <div className="flex justify-between pt-1 border-t border-slate-200 text-slate-800 font-bold">
                                <span>Total Cost</span>
                                <span style={{ color: primaryColor }}>{formatPrice(Math.round(totalOverallOutflow))}</span>
                              </div>
                            </div>
                          </div>

                          <button 
                            onClick={() => {
                              setVisitorName(`Mortgage Calculation Simulation (${formatPrice(Math.round(monthlyEmiVal))}/mo)`);
                              handleScrollToSection('contact');
                            }}
                            className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs font-mono tracking-wider rounded-xl transition uppercase cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-md"
                            style={{ borderRadius: borderRadius, backgroundColor: primaryBtnColor }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            Lock Interest Offer
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </motion.section>

              {/* MODULE: COMPLIANCE LEGAL INFORMATION */}
              <motion.section 
                id="legal" 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, boxShadow: "0 25px 50px rgba(0, 0, 0, 0.04)" }}
                className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all duration-500 relative overflow-hidden" 
                style={{ borderRadius: cardBorderRadius }}
              >
                <ShimmerOverlay />

                <div className="border-b border-slate-200 pb-4 relative z-20">
                  <span className="text-xs text-orange-500 font-mono uppercase tracking-widest font-bold" style={{ color: primaryColor }}>Legal Verification</span>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-1">Approved Compliance & Certification</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-20">
                  {property.legal && Object.keys(property.legal).length > 0 ? (
                    [
                      { title: "RERA Registered", value: property.legal.reraId ? `RERA Approved (${property.legal.reraId})` : "RERA Approved / Pending", detail: "Ensuring 100% statutory development milestones and legal execution guarantees." },
                      { title: "DC Conversion", value: property.legal.dcConversion || "Approved Residential Use", detail: "Completely cleared conversion order signed by the district collectorate." },
                      { title: "E-Khata Document", value: property.legal.eKhata || "Available Instantly", detail: "Ready to facilitate single-owner mutation records without litigation risks." },
                      { title: "Title Clearances", value: property.legal.clearTitle || "100% Marketable Title", detail: "Verified by top corporate advocates with fully registered flowsheets for 30 years." },
                      { title: "Nationalized Bank Tie-Ups", value: property.legal.bankApproval || "Approved", detail: "Leading banking partners SBI, HDFC, and ICICI provide competitive plot loan quotes." },
                      { title: "Legal Notes", value: property.legal.legalNotes || "Nil-encumbrance status verified up to current financial year limits.", detail: "Compliance verified." }
                    ].map((leg, i) => (
                      <motion.div 
                        whileHover={{ y: -5, scale: 1.02, borderColor: `${primaryColor}40` }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        key={i} 
                        className="p-4 bg-slate-50/50 backdrop-blur-xs border border-slate-200/60 rounded-xl flex items-start gap-3.5 transition-all duration-300 shadow-xs" 
                        style={{ borderRadius: cardBorderRadius }}
                      >
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 border border-emerald-500/20 mt-0.5" style={{ color: primaryColor, borderColor: `${primaryColor}20`, backgroundColor: `${primaryColor}10` }}>
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{leg.title}</span>
                          <span className="text-sm font-bold text-slate-800 mt-1 block">{leg.value}</span>
                          <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-sans font-light">{leg.detail}</p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    [
                      { title: "RERA Registered", value: "AP/1234/2024 Approved", detail: "Ensuring 100% statutory development milestones and legal execution guarantees." },
                      { title: "DC Conversion", value: "Approved Residential Use", detail: "Completely cleared conversion order signed by the district collectorate." },
                      { title: "E-Khata Document", value: "Available Instantly", detail: "Ready to facilitate single-owner mutation records without litigation risks." },
                      { title: "Title Clearances", value: "100% Marketable Title", detail: "Verified by top corporate advocates with fully registered flows for 30 years." },
                      { title: "Nationalized Bank Tie-Ups", value: "80%-90% Approved", detail: "Leading banking partners SBI, HDFC, and ICICI provide competitive plot loan quotes." },
                      { title: "Encumbrance Certificate", value: "Zero Encumbrances", detail: "Nil-encumbrance status verified up to current financial year limits." }
                    ].map((leg, i) => (
                      <motion.div 
                        whileHover={{ y: -5, scale: 1.02, borderColor: `${primaryColor}40` }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        key={i} 
                        className="p-4 bg-slate-50/50 backdrop-blur-xs border border-slate-200/60 rounded-xl flex items-start gap-3.5 transition-all duration-300 shadow-xs" 
                        style={{ borderRadius: cardBorderRadius }}
                      >
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 border border-emerald-500/20 mt-0.5">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{leg.title}</span>
                          <span className="text-sm font-bold text-slate-800 mt-1 block">{leg.value}</span>
                          <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-sans font-light">{leg.detail}</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* PDF download vault */}
                <div className="space-y-3 w-full relative z-20">
                  {property.documents && property.documents.length > 0 ? (
                    property.documents.map((doc: any, i: number) => (
                      <div key={doc.id || i} className="bg-slate-50/30 backdrop-blur-xs border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs" style={{ borderRadius: borderRadius }}>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white border border-slate-100 rounded-lg text-orange-500" style={{ color: primaryColor }}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">{doc.name}</span>
                            <span className="text-[9px] text-slate-400 font-mono block mt-0.5">Document File Size: {doc.size || '8.4 MB'}</span>
                          </div>
                        </div>
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 rounded-lg transition whitespace-nowrap text-center"
                          style={{ borderRadius: borderRadius }}
                        >
                          View Document
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="bg-slate-50/30 backdrop-blur-xs border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs" style={{ borderRadius: borderRadius }}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white border border-slate-100 rounded-lg text-orange-500" style={{ color: primaryColor }}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Download Legal Verification Vault</span>
                          <span className="text-[9px] text-slate-400 font-mono block mt-0.5">Includes full title report summary (PDF, 8.4 MB)</span>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 rounded-lg transition whitespace-nowrap cursor-pointer" style={{ borderRadius: borderRadius }}>
                        View Documents
                      </button>
                    </div>
                  )}
                </div>
              </motion.section>

              {/* MODULE: PRICING & MORTGAGE SIMULATOR */}
              <motion.section 
                id="pricing" 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, boxShadow: "0 25px 50px rgba(0, 0, 0, 0.04)" }}
                className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all duration-500 relative overflow-hidden" 
                style={{ borderRadius: cardBorderRadius }}
              >
                <ShimmerOverlay />

                <div className="border-b border-slate-200 pb-4 relative z-20">
                  <span className="text-xs text-orange-500 font-mono uppercase tracking-widest font-bold" style={{ color: primaryColor }}>Financial Framework</span>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-1">Pricing Schemes & Mortgage Estimator</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-20">
                  {/* Detailed pricing variables */}
                  <motion.div 
                    whileHover={{ y: -4, scale: 1.01, boxShadow: "0 10px 20px rgba(0,0,0,0.02)" }}
                    className="p-4.5 bg-slate-50/50 backdrop-blur-xs border border-slate-200/60 rounded-xl flex flex-col justify-between shadow-xs transition-all duration-300" 
                    style={{ borderRadius: borderRadius }}
                  >
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Estimated Quotation Outline</span>
                      <div className="flex items-baseline space-x-1 mt-2 pb-3 border-b border-slate-200">
                        <span className="text-2xl font-black text-slate-900">{formatPrice(property.price)}</span>
                        <span className="text-xs text-slate-500 font-mono">onwards</span>
                      </div>
                      
                      <div className="space-y-3 mt-4 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Registration Charges</span>
                          <span className="text-slate-800 font-bold">{property.pricing?.registrationCharges ? `₹${property.pricing.registrationCharges}` : '₹50,000 (Approx)'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Maintenance Contribution</span>
                          <span className="text-slate-800 font-bold">{property.pricing?.maintenance ? `₹${property.pricing.maintenance}` : '₹1,000 / mo'}</span>
                        </div>
                        <div className="flex justify-between text-emerald-600">
                          <span>Brokerage Commissions</span>
                          <span className="font-bold">Zero Brokerage (Direct)</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-6 border-t border-slate-200">
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block mb-2.5">Associated Loan Partners</span>
                      <div className="flex flex-wrap gap-2.5">
                        {(property.pricing?.emiBankPartners ? property.pricing.emiBankPartners.split(',') : ['SBI Bank', 'HDFC Bank', 'ICICI Bank', 'AXIS Bank']).map((bank: string, i: number) => (
                          <span key={i} className="px-3 py-1.5 bg-white border border-slate-200 rounded text-[10px] font-mono font-bold text-slate-600 tracking-wider uppercase" style={{ borderRadius: borderRadius }}>
                            {bank.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Mortage/EMI Interactive calculator */}
                  <motion.div 
                    whileHover={{ y: -4, scale: 1.01, boxShadow: "0 10px 20px rgba(0,0,0,0.02)" }}
                    className="p-5 bg-slate-50/50 backdrop-blur-xs border border-slate-200/60 rounded-xl space-y-4 shadow-xs transition-all duration-300" 
                    style={{ borderRadius: borderRadius }}
                  >
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-orange-500" style={{ color: primaryColor }} />
                      <span className="text-xs font-bold text-slate-900">Mortgage EMI Calculator</span>
                    </div>

                    {/* Down Payment Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-500">Down Payment</span>
                        <span className="text-slate-800 font-bold">{formatPrice(property.price - loanAmount)}</span>
                      </div>
                      <input 
                        type="range" 
                        min={property.price * 0.1}
                        max={property.price * 0.5}
                        step={50000}
                        value={property.price - loanAmount}
                        onChange={(e) => setLoanAmount(property.price - Number(e.target.value))}
                        className="w-full accent-orange-500"
                      />
                    </div>

                    {/* Interest Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-500">Interest Rate</span>
                        <span className="text-slate-800 font-bold">{interestRate}% p.a</span>
                      </div>
                      <input 
                        type="range" 
                        min="6.5" 
                        max="12" 
                        step="0.1" 
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="w-full accent-orange-500"
                      />
                    </div>

                    {/* Tenure Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-500">Tenure</span>
                        <span className="text-slate-800 font-bold">{loanTenure} Years</span>
                      </div>
                      <input 
                        type="range" 
                        min="5" 
                        max="30" 
                        step="1" 
                        value={loanTenure}
                        onChange={(e) => setLoanTenure(Number(e.target.value))}
                        className="w-full accent-orange-500"
                      />
                    </div>

                    {/* Calculated EMI Display */}
                    <div className="p-3.5 bg-orange-500/10 border border-orange-500/25 rounded-lg flex items-center justify-between mt-2" style={{ borderColor: `${primaryColor}25`, backgroundColor: `${primaryColor}10` }}>
                      <div>
                        <span className="text-[9px] text-orange-500 font-mono uppercase tracking-wider block" style={{ color: primaryColor }}>Estimated Monthly EMI</span>
                        <span className="text-lg font-black text-slate-800 mt-0.5 block">₹{emiAmount.toLocaleString('en-IN')} / mo</span>
                      </div>
                      <button 
                        onClick={() => {
                          setVisitorName(`Mortgage Enquiry: ₹${emiAmount.toLocaleString()}/mo`);
                          handleScrollToSection('contact');
                        }}
                        className="px-3.5 py-1.5 bg-orange-500 text-white font-bold text-[10px] font-mono uppercase rounded-md tracking-wider transition hover:opacity-90 cursor-pointer"
                        style={{ backgroundColor: primaryBtnColor, borderRadius: borderRadius }}
                      >
                        Enquire Loan
                      </button>
                    </div>
                  </motion.div>
                </div>
              </motion.section>

              {/* MODULE: INVESTMENT POTENTIAL & CHARTS */}
              <motion.section 
                id="investment" 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, boxShadow: "0 25px 50px rgba(0, 0, 0, 0.04)" }}
                className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all duration-500 relative overflow-hidden" 
                style={{ borderRadius: cardBorderRadius }}
              >
                <ShimmerOverlay />

                <div className="border-b border-slate-200 pb-4 relative z-20">
                  <span className="text-xs text-orange-500 font-mono uppercase tracking-widest font-bold" style={{ color: primaryColor }}>Appreciation Projection</span>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-1">Investment Potential & Historical Trends</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-20">
                  {/* appreciation indicators */}
                  <div className="md:col-span-5 space-y-4">
                    <p className="text-slate-600 text-xs leading-relaxed font-light">
                      This property is strategically situated inside the Hindupur-Bangalore High-Growth Development Ring. High yield is backstopped by major structural public initiatives:
                    </p>

                    <div className="space-y-3 pt-2">
                      <motion.div 
                        whileHover={{ y: -3, scale: 1.01 }}
                        className="p-3 bg-slate-50/50 backdrop-blur-xs border border-slate-200/60 rounded-xl flex items-center gap-3 shadow-xs transition-all duration-300"
                        style={{ borderRadius: cardBorderRadius }}
                      >
                        <TrendingUp className="text-emerald-500 w-5 h-5 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">20% - 30% Expected Appreciation</span>
                          <span className="text-[9px] text-slate-400 font-mono block mt-0.5">Projected timeline: 2026-2029</span>
                        </div>
                      </motion.div>

                      <motion.div 
                        whileHover={{ y: -3, scale: 1.01 }}
                        className="p-3 bg-slate-50/50 backdrop-blur-xs border border-slate-200/60 rounded-xl flex items-center gap-3 shadow-xs transition-all duration-300"
                        style={{ borderRadius: cardBorderRadius }}
                      >
                        <Building className="text-teal-500 w-5 h-5 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Upcoming National Highway Ring</span>
                          <span className="text-[9px] text-slate-400 font-mono block mt-0.5">Reduces transit time to industrial hubs by 45%</span>
                        </div>
                      </motion.div>

                      <motion.div 
                        whileHover={{ y: -3, scale: 1.01 }}
                        className="p-3 bg-slate-50/50 backdrop-blur-xs border border-slate-200/60 rounded-xl flex items-center gap-3 shadow-xs transition-all duration-300"
                        style={{ borderRadius: cardBorderRadius }}
                      >
                        <Users className="text-blue-500 w-5 h-5 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">High Domestic Rental Potential</span>
                          <span className="text-[9px] text-slate-400 font-mono block mt-0.5">Driven by inbound technology-park expansions</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Appreciation Graph Sandbox */}
                  <motion.div 
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="md:col-span-7 bg-slate-50/50 backdrop-blur-xs p-4 rounded-xl border border-slate-200/60 flex flex-col justify-between h-[250px] shadow-xs transition-all duration-300"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800">Appreciation Value Index</span>
                      <span className="text-[9px] font-mono text-emerald-600 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 uppercase font-bold animate-pulse">High Growth Area</span>
                    </div>

                    {/* Inline micro bar charting mapping growth indices */}
                    <div className="flex-1 flex items-end justify-between space-x-3.5 pt-6 px-2">
                      {[
                        { yr: '2022', val: 35, price: '₹1,000' },
                        { yr: '2023', val: 48, price: '₹1,150' },
                        { yr: '2024', val: 62, price: '₹1,300' },
                        { yr: '2025', val: 80, price: '₹1,450' },
                        { yr: '2026', val: 100, price: '₹1,500' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center group relative">
                          {/* Tooltip */}
                          <div className="absolute -top-10 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[9px] font-mono text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-10">
                            {item.price} / Sq.Ft
                          </div>
                          
                          {/* Bar */}
                          <motion.div 
                            initial={{ scaleY: 0 }}
                            whileInView={{ scaleY: 1 }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", stiffness: 100, damping: 15, delay: idx * 0.1 }}
                            style={{ height: `${item.val}%`, originY: 1 }}
                            className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                              idx === 4 
                                ? 'bg-gradient-to-t from-orange-600 to-orange-400' 
                                : 'bg-slate-200 group-hover:bg-orange-500/50'
                            }`}
                          />
                          <span className="text-[9px] font-mono text-slate-500 mt-2 block">{item.yr}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.section>

              {/* MODULE: REVIEWS */}
              <motion.section 
                id="reviews" 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, boxShadow: "0 25px 50px rgba(0, 0, 0, 0.04)" }}
                className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all duration-500 relative overflow-hidden" 
                style={{ borderRadius: cardBorderRadius }}
              >
                <ShimmerOverlay />

                <div className="flex items-center justify-between border-b border-slate-200 pb-4 relative z-20">
                  <div>
                    <span className="text-xs text-orange-500 font-mono uppercase tracking-widest font-bold" style={{ color: primaryColor }}>Client Testimonials</span>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-1">Verified Client Reviews</h3>
                  </div>
                  
                  {/* Reviews Navigator */}
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => setActiveReviewIdx(prev => prev === 0 ? activeReviews.length - 1 : prev - 1)}
                      className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition cursor-pointer shadow-xs"
                      style={{ borderRadius: borderRadius }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setActiveReviewIdx(prev => prev === activeReviews.length - 1 ? 0 : prev + 1)}
                      className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition cursor-pointer shadow-xs"
                      style={{ borderRadius: borderRadius }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-5 bg-slate-50/50 backdrop-blur-xs border border-slate-200/60 rounded-xl relative overflow-hidden shadow-xs relative z-20" style={{ borderRadius: borderRadius }}>
                  <div className="space-y-4">
                    {/* Stars */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: activeReviews[activeReviewIdx]?.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-orange-500 fill-orange-500" style={{ color: primaryColor, fill: primaryColor }} />
                      ))}
                      <span className="text-xs font-mono font-bold text-slate-800 ml-2">4.8 / 5</span>
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed italic font-light">
                      "{activeReviews[activeReviewIdx]?.comment}"
                    </p>

                    <div className="flex justify-between items-center pt-2">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{activeReviews[activeReviewIdx]?.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{activeReviews[activeReviewIdx]?.role}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{activeReviews[activeReviewIdx]?.date || 'Recent'}</span>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* MODULE: FREQUENTLY ASKED QUESTIONS */}
              <motion.section 
                id="faqs" 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, boxShadow: "0 25px 50px rgba(0, 0, 0, 0.04)" }}
                className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all duration-500 relative overflow-hidden" 
                style={{ borderRadius: cardBorderRadius }}
              >
                <ShimmerOverlay />

                <div className="border-b border-slate-200 pb-4 relative z-20">
                  <span className="text-xs text-orange-500 font-mono uppercase tracking-widest font-bold" style={{ color: primaryColor }}>Clarification Desk</span>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-1">Frequently Asked Questions</h3>
                </div>

                <div className="space-y-4 relative z-20">
                  {property.faqs && property.faqs.length > 0 ? (
                    property.faqs.map((faq: any, i: number) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ y: -2, scale: 1.005 }}
                        className="p-4 bg-slate-50/50 backdrop-blur-xs border border-slate-200/60 rounded-xl space-y-2 shadow-xs transition-all duration-300" 
                        style={{ borderRadius: cardBorderRadius }}
                      >
                        <span className="text-xs font-bold text-slate-800 block flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-orange-500 shrink-0" style={{ color: primaryColor }} /> {faq.question}
                        </span>
                        <p className="text-slate-600 text-xs leading-relaxed font-sans font-light pl-5">{faq.answer}</p>
                      </motion.div>
                    ))
                  ) : (
                    [
                      { q: "Can I obtain nationalized bank financing for these villa plots?", a: "Yes, major private and nationalized financial institutions (including SBI, HDFC, and ICICI Bank) have completely approved this gated layout venture and offer ready loans covering up to 80%-90% of your plot valuation." },
                      { q: "Are individual plot boundary demarcations and blacktop roads physically ready?", a: "Yes, the site features completely laid 40-foot and 60-foot asphalt roads, structural perimeter security walls, active CCTV dome structures, sewage lines, and drinking water pipes connected to overhead storage tanks." },
                      { q: "Is registration completed instantly upon full settlement?", a: "Absolutely. All documents (RERA, DC Conversion certificate, and individual E-Khata documents) are cleared and ready in the layout registry. Instant execution takes place under standard sub-registrar parameters." }
                    ].map((faq, i) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ y: -2, scale: 1.005 }}
                        className="p-4 bg-slate-50/50 backdrop-blur-xs border border-slate-200/60 rounded-xl space-y-2 shadow-xs transition-all duration-300" 
                        style={{ borderRadius: cardBorderRadius }}
                      >
                        <span className="text-xs font-bold text-slate-800 block flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-orange-500 shrink-0" style={{ color: primaryColor }} /> {faq.q}
                        </span>
                        <p className="text-slate-600 text-xs leading-relaxed font-sans font-light pl-5">{faq.a}</p>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.section>

              {/* MODULE: SIMILAR LUXURY PROPERTIES */}
              <section className="space-y-6">
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-xs text-orange-500 font-mono uppercase tracking-widest font-bold" style={{ color: primaryColor }}>Similar Selections</span>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-1">Handpicked Luxury Options</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {properties.filter(p => p.id !== property.id).slice(0, 2).map((simProp) => (
                    <div 
                      key={simProp.id} 
                      onClick={() => {
                        const slug = simProp.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                        window.history.pushState(null, '', `/property/${slug}`);
                        window.dispatchEvent(new Event('popstate'));
                      }}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex gap-4 cursor-pointer hover:border-orange-500/30 hover:bg-white transition group shadow-xs"
                      style={{ borderRadius: cardBorderRadius }}
                    >
                      <img 
                        src={simProp.image} 
                        alt={simProp.title} 
                        className="w-20 h-20 rounded-xl object-cover shrink-0"
                        referrerPolicy="no-referrer"
                        style={{ borderRadius: borderRadius }}
                      />
                      <div className="min-w-0 flex-grow">
                        <span className="text-[9px] font-mono text-orange-500 uppercase font-semibold" style={{ color: primaryColor }}>{simProp.type}</span>
                        <h4 className="text-xs font-bold text-slate-800 truncate mt-0.5 group-hover:text-orange-500 transition">{simProp.title}</h4>
                        <span className="text-[10px] text-slate-500 block truncate mt-1">{simProp.location}</span>
                        <span className="text-xs font-bold text-slate-900 block mt-2">
                          {formatPrice(simProp.price)} onwards
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* RIGHT 4 COLUMNS: NATURAL FLOW CONVERSION SIDEBAR */}
            <div id="contact" className="lg:col-span-4 space-y-6">
              
              {/* PREMIUM SIDEBAR CARD BLOCK */}
              <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] space-y-6 relative overflow-hidden" style={{ borderRadius: cardBorderRadius }}>
                <ShimmerOverlay />
                
                {/* Score panel */}
                <div className="p-4.5 bg-slate-50 border border-slate-100 rounded-xl space-y-3" style={{ borderRadius: borderRadius }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Property Score</span>
                      <span className="text-2xl font-black text-slate-800 mt-1 block">9.3 <span className="text-xs text-slate-400 font-mono font-normal">/10</span></span>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-mono font-bold uppercase rounded-md whitespace-nowrap" style={{ borderRadius: borderRadius }}>
                      Excellent Deal
                    </span>
                  </div>

                  {/* Micro metric bars */}
                  <div className="space-y-2 pt-2.5 border-t border-slate-200 text-[10px] font-mono">
                    {[
                      { l: 'Location Score', v: 95 },
                      { l: 'Legal & Safety Approval', v: 98 },
                      { l: 'Infrastructure & Amenities', v: 90 },
                      { l: 'Investment Growth Metric', v: 94 }
                    ].map((metric, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-slate-500">
                          <span>{metric.l}</span>
                          <span className="text-slate-800 font-bold">{(metric.v / 10).toFixed(1)}</span>
                        </div>
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div style={{ width: `${metric.v}%` }} className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agent contact panel */}
                <div className="flex items-center gap-4.5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl" style={{ borderRadius: borderRadius }}>
                  <div className="relative shrink-0">
                    <img 
                      src={property.agent?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"} 
                      alt={property.agent?.name || "Rahul Kumar"}
                      className="w-12 h-12 rounded-full object-cover border-2 border-orange-500"
                      style={{ borderColor: primaryColor }}
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono text-orange-500 uppercase tracking-widest block" style={{ color: primaryColor }}>Senior Consultant</span>
                    <h4 className="text-xs font-bold text-slate-800 truncate mt-0.5">{property.agent?.name || "Rahul Kumar"}</h4>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono text-slate-500">
                      <Star className="w-3 h-3 text-orange-500 fill-orange-500 shrink-0" style={{ color: primaryColor }} />
                      <span>4.9 Rera Certified</span>
                    </div>
                  </div>
                </div>

                {/* SITE VISIT SCHEDULER */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4" style={{ borderRadius: borderRadius }}>
                  <span className="text-xs font-mono font-bold text-slate-600 block uppercase tracking-wider">Schedule VIP Site Visit</span>
                  
                  <form onSubmit={handleFormSubmit} className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Your Full Name" 
                      required
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500/50 transition"
                      style={{ borderRadius: borderRadius }}
                    />
                    
                    <input 
                      type="tel" 
                      placeholder="Mobile Number" 
                      required
                      value={visitorPhone}
                      onChange={(e) => setVisitorPhone(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500/50 transition"
                      style={{ borderRadius: borderRadius }}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="date" 
                        required
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:border-orange-500/50 transition"
                        style={{ borderRadius: borderRadius }}
                      />
                      <select 
                        value={visitTime}
                        onChange={(e) => setVisitTime(e.target.value)}
                        className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:border-orange-500/50 transition"
                        style={{ borderRadius: borderRadius }}
                      >
                        <option>Morning Slot</option>
                        <option>Afternoon Slot</option>
                        <option>Evening Slot</option>
                      </select>
                    </div>

                    <div className="flex items-start gap-2 pt-1">
                      <input 
                        type="checkbox" 
                        id="agree-checkbox"
                        checked={formAgreed}
                        onChange={(e) => setFormAgreed(e.target.checked)}
                        className="mt-0.5 accent-orange-500"
                        style={{ accentColor: primaryColor }}
                      />
                      <label htmlFor="agree-checkbox" className="text-[10px] text-slate-500 leading-normal select-none">
                        I agree to receive verified legal files and transit audits from Dvarix Realty.
                      </label>
                    </div>

                    <button 
                      type="submit"
                      disabled={isBookedSuccess}
                      className={`w-full py-3 text-white font-extrabold text-xs tracking-wider uppercase rounded-lg transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${isBookedSuccess ? 'opacity-80 cursor-wait' : ''}`}
                      style={{ borderRadius: borderRadius, backgroundColor: primaryBtnColor }}
                    >
                      <Calendar className="w-4 h-4 shrink-0" /> 
                      {isBookedSuccess ? 'Booking Site Visit...' : 'Schedule Site Visit'}
                    </button>
                  </form>
                </div>

                {/* Immediate Instant CTAs */}
                <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-200">
                  <a 
                    href={`tel:${property.agent?.phone || '+91 99999 99999'}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 transition cursor-pointer"
                    style={{ borderRadius: borderRadius }}
                  >
                    <Phone className="w-3.5 h-3.5 text-orange-500 shrink-0" style={{ color: primaryColor }} /> Call Agent
                  </a>
                  
                  <a 
                    href={`https://wa.me/${property.agent?.phone?.replace(/[^0-9]/g, '') || '919999999999'}?text=Hi, I'm interested in ${encodeURIComponent(property.title)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-mono font-bold text-emerald-700 transition cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> WhatsApp
                  </a>
                </div>

                {/* Core Trust credentials */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-[9px] text-slate-600 font-mono space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>100% Certified Legal Paperwork Checked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Zero Hidden Cost Structure Guaranteed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Direct Registry Coordination with Advocates</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ==================== SCREEN BOTTOM BANNER FOOTER ==================== */}
        <footer className="bg-slate-50 border-t border-slate-200 py-10 px-4 sm:px-6 lg:px-8 mt-16">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Free Site Visit", desc: "Book your completely free customized site visit today.", icon: MapPin },
              { title: "Best Price Guarantee", desc: "We ensure standard builder-level rate mappings.", icon: DollarSign },
              { title: "Easy Loan Options", desc: "80%-90% loan approvals with minimal legal paperwork.", icon: Calculator },
              { title: "Trusted & Verified", desc: "Backstopped by the premium Dvarix Realty Promise.", icon: ShieldCheck }
            ].map((foot, i) => {
              const Icon = foot.icon;
              return (
                <div key={i} className="flex gap-4 p-4.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
                  <div className="p-2.5 bg-orange-500/10 border border-orange-500/15 text-orange-500 rounded-xl shrink-0 h-fit">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-slate-800 block">{foot.title}</span>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1 font-sans font-light">{foot.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-200 text-center">
            <p className="text-[10px] text-slate-400 font-mono">© 2026 Dvarix Realty Premium Infrastructure Ventures. All rights reserved.</p>
          </div>
        </footer>

        {/* ==================== STICKY MOBILE BOTTOM CTA ==================== */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3.5 flex items-center justify-between z-45 gap-3 shadow-lg">
          <div className="min-w-0">
            <span className="text-[9px] text-slate-500 font-mono block">Starting From</span>
            <span className="text-sm font-black text-orange-500 truncate">{formatPrice(property.price)}</span>
          </div>
          <div className="flex gap-2 shrink-0">
            <a 
              href={`tel:${property.agent?.phone || '+91 99999 99999'}`}
              className="px-3 py-2 bg-slate-100 border border-slate-200 text-slate-700 rounded-xl flex items-center justify-center text-xs font-mono font-bold"
              style={{ borderRadius: borderRadius }}
            >
              <Phone className="w-4 h-4 text-orange-500" style={{ color: primaryColor }} />
            </a>
            <a 
              href={`https://wa.me/${property.agent?.phone?.replace(/[^0-9]/g, '') || '919999999999'}?text=Hi, I'm interested in ${encodeURIComponent(property.title)}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl flex items-center justify-center text-xs font-mono font-bold"
              style={{ borderRadius: borderRadius }}
            >
              <MessageSquare className="w-4 h-4 text-emerald-500" />
            </a>
            <button 
              onClick={() => setIsBookingModalOpen(true)}
              className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition cursor-pointer"
              style={{ backgroundColor: primaryColor, borderRadius: borderRadius }}
            >
              Book Visit
            </button>
          </div>
        </div>

        {/* ==================== FLOATING STICKY BOOKING CTA (DESKTOP) ==================== */}
        <div className="hidden lg:block fixed bottom-8 right-8 z-45">
          <motion.button
            onClick={() => setIsBookingModalOpen(true)}
            whileHover={{ scale: 1.05, y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex items-center gap-2 px-6 py-4 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm tracking-wider uppercase rounded-full shadow-[0_10px_25px_rgba(239,68,68,0.3)] transition cursor-pointer"
            style={{ backgroundColor: primaryBtnColor }}
          >
            <Calendar className="w-4.5 h-4.5" />
            Schedule Site Visit
          </motion.button>
        </div>

        {/* ==================== LUXURY SITE VISIT BOOKING MODAL ==================== */}
        <AnimatePresence>
          {isBookingModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-white/95 backdrop-blur-lg border border-slate-200/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden space-y-6"
                style={{ borderRadius: cardBorderRadius }}
              >
                <ShimmerOverlay />

                {/* Close Button */}
                <button
                  onClick={() => setIsBookingModalOpen(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-full transition cursor-pointer z-50"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Header */}
                <div className="border-b border-slate-100 pb-4 relative z-20">
                  <span className="text-xs text-orange-500 font-mono uppercase tracking-widest font-bold" style={{ color: primaryColor }}>VIP Site Visit</span>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-1">Schedule Site Visit</h3>
                  <p className="text-[11px] text-slate-500 font-light mt-1">Book a guided walkthrough of the property with our senior real estate consultant.</p>
                </div>

                {/* Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!visitorName || !visitorPhone || !visitDate) {
                      alert("Please fill out all fields before booking.");
                      return;
                    }
                    setIsBookedSuccess(true);
                    setTimeout(() => {
                      setIsBookedSuccess(false);
                      setIsBookingModalOpen(false);
                      onBookSiteVisit({
                        ...property,
                        title: `${property.title} (Guided Visit for ${visitorName})`
                      });
                    }, 2200);
                  }}
                  className="space-y-4 relative z-20"
                >
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 uppercase font-bold">Your Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter full name" 
                      required
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500/50 transition shadow-inner"
                      style={{ borderRadius: borderRadius }}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 uppercase font-bold">Mobile Number</label>
                    <input 
                      type="tel" 
                      placeholder="Enter mobile number" 
                      required
                      value={visitorPhone}
                      onChange={(e) => setVisitorPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500/50 transition shadow-inner"
                      style={{ borderRadius: borderRadius }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-500 uppercase font-bold">Preferred Date</label>
                      <input 
                        type="date" 
                        required
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 focus:outline-none focus:border-orange-500/50 transition shadow-inner"
                        style={{ borderRadius: borderRadius }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-500 uppercase font-bold">Preferred Slot</label>
                      <select 
                        value={visitTime}
                        onChange={(e) => setVisitTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 focus:outline-none focus:border-orange-500/50 transition shadow-inner cursor-pointer"
                        style={{ borderRadius: borderRadius }}
                      >
                        <option>Morning Slot</option>
                        <option>Afternoon Slot</option>
                        <option>Evening Slot</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <input 
                      type="checkbox" 
                      id="modal-agree-checkbox"
                      checked={formAgreed}
                      onChange={(e) => setFormAgreed(e.target.checked)}
                      className="mt-0.5 accent-orange-500"
                      style={{ accentColor: primaryColor }}
                    />
                    <label htmlFor="modal-agree-checkbox" className="text-[10px] text-slate-500 leading-normal select-none">
                      I agree to receive verified legal files and transit audits from Dvarix Realty.
                    </label>
                  </div>

                  <button 
                    type="submit"
                    disabled={isBookedSuccess}
                    className={`w-full py-3.5 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${isBookedSuccess ? 'opacity-80 cursor-wait' : ''}`}
                    style={{ borderRadius: borderRadius, backgroundColor: primaryBtnColor }}
                  >
                    <Calendar className="w-4 h-4 shrink-0" /> 
                    {isBookedSuccess ? 'Reserving Your VIP Slot...' : 'Schedule Site Visit'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>

    </div>
  );
}

// ==================== COHESIVE MICRO ICONS WRAPPERS ====================
function HomeIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

function ImageIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    </svg>
  );
}

function MapPinIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  );
}

function ShieldCheckIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
    </svg>
  );
}

function DollarIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );
}

function TrendingIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
    </svg>
  );
}

function GridIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="3" y2="21"/><line x1="15" x2="15" y1="3" y2="21"/>
    </svg>
  );
}

function StarIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

function HelpIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/>
    </svg>
  );
}

function PhoneIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function CalculatorIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>
    </svg>
  );
}
