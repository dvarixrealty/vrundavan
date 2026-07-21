import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Building2, Phone, Mail, MapPin, Grid, Briefcase, 
  Clock, Shield, Star, Users, MessageSquare, ChevronRight, CheckCircle,
  X, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import Hero from './components/Hero';
import PropertyTypes from './components/PropertyTypes';
import PropertyListings from './components/PropertyListings';
import PropertiesPageView from './components/PropertiesPageView';
import ExploreOpportunities from './components/ExploreOpportunities';
import SaaSLocationDetailView from './components/SaaSLocationDetailView';
import PropertyDetailModal from './components/PropertyDetailModal';
import PremiumPropertyDetailView from './components/PremiumPropertyDetailView';
import CustomRequestModal from './components/CustomRequestModal';
import SiteVisitBookingModal from './components/SiteVisitBookingModal';
import TalkToExpertModal from './components/TalkToExpertModal';
import InquiryDashboard from './components/InquiryDashboard';
import RealtyChatbot from './components/RealtyChatbot';
import FavoritesDrawer from './components/FavoritesDrawer';
import HomeDetailsSections from './components/HomeDetailsSections';
import AboutPageView from './components/AboutPageView';
import PrivacyPolicyView from './components/PrivacyPolicyView';
import TermsConditionsView from './components/TermsConditionsView';
import Footer from './components/Footer';
import BlogArticlePage from './components/BlogArticlePage';
import Logo from './components/Logo';
import { ActiveTab, Property, Inquiry, CustomRequirement, Agent, MapLocation, AdminUser, FAQ, MapSettings, SearchCategory, PropertyTypeCard, QuickFilter, CentralEnquiry, RoutingRule, SiteCMSConfig, HeroBanner } from './types';
import { PROPERTIES } from './data';
import { firebaseService } from './lib/firebaseService';
import { mysqlClientService } from './lib/mysqlClientService';
import { getLocalCache, CACHE_KEYS } from './utils/localStorageCache';
import { db, handleFirestoreError, OperationType, auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { parseUtmParameters, detectDeviceAndOS, createVisitorJourney, routeEnquiryAutomatically } from './utils/enquiryHelper';

// Pre-seeded inquiries to make the dashboard alive instantly
const SAMPLE_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-1',
    propertyName: 'Crestwood Modernist Villa',
    propertyId: 'prop-4',
    name: 'Daniel Wright',
    email: 'd.wright@vermillion.io',
    phone: '+1 (555) 789-1234',
    message: 'Requesting a site walkthrough on Friday. We are extremely interested in assessing the Tesla wall charger and off-grid solar battery backup capacity of the Crestwood complex.',
    status: 'New',
    date: 'Jun 1, 2026',
    preferredTime: 'Morning (9 AM - 12 PM)'
  },
  {
    id: 'inq-2',
    propertyName: 'Elevation Small Apartments',
    propertyId: 'prop-1',
    name: 'Sophia Lin',
    email: 'sophia.lin@gmail.com',
    phone: '+1 (555) 321-9876',
    message: 'Is there a discounted price bracket for corporate leases lasting 2+ years? We would require leasing 3 total blocks for housing our design consultants.',
    status: 'In Progress',
    date: 'May 30, 2026',
    preferredTime: 'Afternoon (12 PM - 4 PM)'
  },
  {
    id: 'inq-3',
    propertyName: 'Apex Plaza Trade Complex',
    propertyId: 'prop-6',
    name: 'Marcus Brody',
    email: 'm.brody@museumcorp.org',
    phone: '+1 (555) 456-1122',
    message: 'We are evaluating leasing two entire executive suites of the Trade Complex. Please send across the thermal rating specification charts and certified engineering layouts.',
    status: 'Contacted',
    date: 'May 28, 2026',
    preferredTime: 'Morning (9 AM - 12 PM)'
  }
];

const SAMPLE_REQUIREMENTS: CustomRequirement[] = [
  {
    id: 'req-1',
    fullName: 'Robert Sterling',
    mobileNumber: '+1 (555) 321-4567',
    emailAddress: 'r.sterling@sterholdings.com',
    city: 'New York',
    lookingFor: 'Buy',
    propertyType: 'Commercial Property',
    preferredCity: 'New York',
    preferredArea: 'Manhattan Financial District',
    landmark: 'Near Federal Hall',
    minBudget: '2,500,000',
    maxBudget: '5,000,000',
    plotSize: '8,500 Sq. Ft',
    bhkRequirement: 'None / N/A',
    readyToMove: 'Yes',
    loanRequired: 'No',
    amenities: ['Parking', 'Security'],
    timeline: 'Within 1 Month',
    message: 'We require high-security executive business suites with dense noise insulating glass layouts and centralized thermal zones. Direct wire allocations ready.',
    status: 'New',
    date: 'Jun 1, 2026'
  },
  {
    id: 'req-2',
    fullName: 'Clara Oswald',
    mobileNumber: '+1 (555) 789-0123',
    emailAddress: 'clara@lunarops.dev',
    city: 'Austin',
    lookingFor: 'Invest',
    propertyType: 'House/Villa',
    preferredCity: 'Austin',
    preferredArea: 'West Lake Hills',
    landmark: 'Overlooking Colorado Ridge',
    minBudget: '1,200,000',
    maxBudget: '1,800,000',
    plotSize: '4,200 Sq. Ft',
    bhkRequirement: '4+ BHK',
    readyToMove: 'No',
    loanRequired: 'Yes',
    amenities: ['Swimming Pool', 'Gym', 'Garden', 'Security'],
    timeline: 'Within 3 Months',
    message: 'Seeking a contemporary ecological property. Highly interested in houses equipped with solar grid capabilities, Tesla wall batteries, or deep-earth thermal shielding.',
    status: 'In Progress',
    date: 'May 28, 2026'
  }
];

const GLOBAL_DEFAULT_CATEGORIES: PropertyTypeCard[] = [
  { id: 'Apartment', title: 'Apartment', description: 'Stellar complexes', iconName: 'Building1', displayOrder: 1, status: 'Active', showInView: true, redirectUrl: '/properties?type=apartment' },
  { id: 'Villa', title: 'Villa', description: 'Luxury residences', iconName: 'Home', displayOrder: 2, status: 'Active', showInView: true, redirectUrl: '/properties?type=villa' },
  { id: 'Commercial', title: 'Commercial', description: 'Corporate estates', iconName: 'Building2', displayOrder: 3, status: 'Active', showInView: true, redirectUrl: '/properties?type=commercial' },
  { id: 'Plot', title: 'Plot', description: 'Premium Land', iconName: 'Map', displayOrder: 4, status: 'Active', showInView: true, redirectUrl: '/properties?type=plot' },
  { id: 'Warehouse', title: 'Warehouse', description: 'Industrial hubs', iconName: 'Warehouse', displayOrder: 5, status: 'Active', showInView: true, redirectUrl: '/properties?type=warehouse' },
  { id: 'Homestay', title: 'Homestay', description: 'Bespoke retreats', iconName: 'Hotel', displayOrder: 6, status: 'Active', showInView: true, redirectUrl: '/properties?type=homestay' }
];

const GLOBAL_DEFAULT_SEARCH_CATEGORIES: SearchCategory[] = [
  { id: 'Properties', title: 'Properties', iconName: 'Building2', displayOrder: 1, status: 'Active', showInView: true, isDefault: true },
  { id: 'Plots', title: 'Plots', iconName: 'Landmark', displayOrder: 2, status: 'Active', showInView: true },
  { id: 'Apartments', title: 'Apartments', iconName: 'Building2', displayOrder: 3, status: 'Active', showInView: true },
  { id: 'Villas', title: 'Villas', iconName: 'Compass', displayOrder: 4, status: 'Active', showInView: true },
  { id: 'Commercial', title: 'Commercial', iconName: 'Award', displayOrder: 5, status: 'Active', showInView: true },
  { id: 'House for Rent', title: 'House for Rent', iconName: 'Clock', displayOrder: 6, status: 'Active', showInView: true },
  { id: 'PG / Stay', title: 'PG / Stay', iconName: 'Bed', displayOrder: 7, status: 'Active', showInView: true },
  { id: 'Warehouses', title: 'Warehouses', iconName: 'Ruler', displayOrder: 8, status: 'Active', showInView: true }
];

const GLOBAL_DEFAULT_AGENTS: Agent[] = [
  {
    id: 'agent-1',
    name: 'Raghav Reddy',
    role: 'Director of Southern Acquisitions',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    phone: '+91 6300984846',
    email: 'raghav.r@dvarix.com'
  },
  {
    id: 'agent-2',
    name: 'Priya Sharma',
    role: 'Bespoke Portfolio Advisor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    phone: '+91 6300984846',
    email: 'p.sharma@dvarix.com'
  },
  {
    id: 'agent-3',
    name: 'Anirudh Naidu',
    role: 'Premium Villa Lead',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    phone: '+91 6300984846',
    email: 'a.naidu@dvarix.com'
  }
];

const GLOBAL_DEFAULT_MAP_LOCATIONS: Record<string, MapLocation> = {
  'JP Nagar': {
    name: 'JP Nagar',
    slug: 'jp-nagar',
    x: '28%',
    y: '58%',
    listings: 8,
    avgValuation: '₹1.8 Cr',
    benefits: 'High demand residential, metro access, premium villas',
    description: 'Elite residential hub with fully-developed green layouts, top schools, and modern multi-level villas.',
    growth: '+14.2% YoY ROI',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    latitude: 12.9105,
    longitude: 77.5857,
    status: 'Active',
    featured: true,
    displayOrder: 1,
    availableOpportunities: 8,
    activeRequirements: 24,
    siteVisits: 14,
    demandLevel: 'Very High',
    investmentPotential: 'Exceptional',
    averageBudget: '₹1.5 Cr - ₹3.5 Cr',
    growthRate: '14.2%',
    avgPropertyValue: '₹1.8 Cr',
    locationHighlights: 'Metro Connectivity, Green Belts, Elite Schools, Food Streets',
    showOnHomepage: true,
    featuredLocation: true,
    activePin: true,
    pinColor: '#ff5a3c',
    pinIcon: 'Home',
    redirectType: 'Location Page',
    redirectUrl: '/location/jp-nagar'
  }
};

const GLOBAL_DEFAULT_QUICK_FILTERS: QuickFilter[] = [
  { id: 'q-villa', name: 'Villa', status: 'Active' },
  { id: 'q-commercial', name: 'Commercial', status: 'Active' },
  { id: 'q-premium', name: 'Premium', status: 'Active' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('Home');
  const [isDbConsoleOpen, setIsDbConsoleOpen] = useState<boolean>(false);
  const [useFirebase, setUseFirebaseState] = useState<boolean>(() => {
    const saved = localStorage.getItem('dvarix_use_firebase');
    return saved === 'true'; // Defaults to false, so MySQL is PRIMARY by default!
  });

  const setUseFirebase = (val: boolean) => {
    setUseFirebaseState(val);
    localStorage.setItem('dvarix_use_firebase', val ? 'true' : 'false');
  };
  const isPopStateRef = useRef(false);
  const [selectedLocationSlug, setSelectedLocationSlug] = useState<string | null>(null);
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState({ keyword: '', type: 'All', location: 'All' });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const handleViewPropertyDetails = (property: Property) => {
    const cachedConfigs = getLocalCache<any[]>('dvarix_cache_property_seo_configs', []);
    const config = cachedConfigs.find(c => c.id === property.id);
    const slug = config?.urlSlug || property.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setSelectedProperty(property);
    setActiveTab('PropertyDetail');
    window.history.pushState(null, '', `/property/${slug}`);
  };

  const [isCustomRequestOpen, setIsCustomRequestOpen] = useState(false);
  const [isSiteVisitBookingOpen, setIsSiteVisitBookingOpen] = useState(false);
  const [isTalkToExpertOpen, setIsTalkToExpertOpen] = useState(false);
  const [talkToExpertProperty, setTalkToExpertProperty] = useState<Property | null>(null);
  const [bookingTargetProperty, setBookingTargetProperty] = useState<Property | null>(null);
  const [siteVisitPrefilled, setSiteVisitPrefilled] = useState<any>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [customRequirements, setCustomRequirements] = useState<CustomRequirement[]>([]);
  const [centralEnquiries, setCentralEnquiries] = useState<CentralEnquiry[]>([]);
  const [routingRules, setRoutingRules] = useState<RoutingRule[]>([]);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [properties, setProperties] = useState<Property[]>(PROPERTIES);
  const [categories, setCategories] = useState<PropertyTypeCard[]>(GLOBAL_DEFAULT_CATEGORIES);
  const [searchCategories, setSearchCategories] = useState<SearchCategory[]>(GLOBAL_DEFAULT_SEARCH_CATEGORIES);
  const [agents, setAgents] = useState<Agent[]>(GLOBAL_DEFAULT_AGENTS);
  const [mapLocations, setMapLocations] = useState<Record<string, MapLocation>>(GLOBAL_DEFAULT_MAP_LOCATIONS);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [quickFilters, setQuickFilters] = useState<QuickFilter[]>(GLOBAL_DEFAULT_QUICK_FILTERS);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
  
  // Custom toast notifications stack state
  const [toasts, setToasts] = useState<Array<{
    id: string;
    title: string;
    message: string;
    category?: string;
    isError?: boolean;
  }>>([]);

  // Persistent administration gateway and specific user roles lists
  const [loggedInUser, setLoggedInUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('dvarix_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [authLoading, setAuthLoading] = useState(true);

  // Listen to Firebase Auth state change to sync with loggedInUser
  useEffect(() => {
    console.log("[AUTH MONITOR] Setting up onAuthStateChanged listener...");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("[AUTH MONITOR] onAuthStateChanged callback triggered. User:", user ? `${user.email} (${user.uid})` : "NULL");
      if (user) {
        const stored = localStorage.getItem('dvarix_current_user');
        const savedUser = stored ? JSON.parse(stored) : null;
        
        if (savedUser && savedUser.email.trim().toLowerCase() === user.email?.trim().toLowerCase()) {
          console.log("[AUTH MONITOR] Restored user matches active Firebase Auth session:", savedUser.email);
          setLoggedInUser(savedUser);
        } else {
          // Find in adminUsers list
          const found = adminUsers.find(u => u.email.trim().toLowerCase() === user.email?.trim().toLowerCase());
          if (found) {
            console.log("[AUTH MONITOR] Found matching user in loaded adminUsers list:", found.name);
            setLoggedInUser(found);
            localStorage.setItem('dvarix_current_user', JSON.stringify(found));
          } else if (user.email?.trim().toLowerCase() === 'dvarixrealty@gmail.com') {
            console.log("[AUTH MONITOR] Constructing super admin fallback profile.");
            const rootAdmin: AdminUser = {
              id: 'user-super',
              email: 'dvarixrealty@gmail.com',
              password: 'radhakrishna143',
              name: 'Raghav Reddy',
              roleName: 'Super Admin',
              permissions: {
                canManageProperties: true,
                canManageCategories: true,
                canManageAgents: true,
                canManageMap: true,
                canReplyInquiries: true,
                canManageUsers: true,
              }
            };
            setLoggedInUser(rootAdmin);
            localStorage.setItem('dvarix_current_user', JSON.stringify(rootAdmin));
          }
        }
      } else {
        console.warn("[AUTH MONITOR] No authenticated user present in Firebase Auth. Clearing session.");
        setLoggedInUser(null);
        localStorage.removeItem('dvarix_current_user');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [adminUsers]);

  // Listen to custom navigation events from banners
  useEffect(() => {
    const handleNavigation = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab: any }>;
      if (customEvent.detail && customEvent.detail.tab) {
        setActiveTab(customEvent.detail.tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('realty-navigate', handleNavigation);
    return () => window.removeEventListener('realty-navigate', handleNavigation);
  }, []);

  // Listen to custom notification events (e.g., from CMS systems, chatbots, forms)
  useEffect(() => {
    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent<{
        title: string;
        message: string;
        category?: string;
        isError?: boolean;
      }>;
      if (customEvent.detail) {
        const { title, message, category, isError } = customEvent.detail;
        const newToast = {
          id: `toast-${Date.now()}-${Math.random()}`,
          title,
          message,
          category,
          isError
        };
        setToasts(prev => [...prev, newToast]);
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== newToast.id));
        }, 5000);
      }
    };

    window.addEventListener('cms-alert-notification', handleNotification);
    return () => window.removeEventListener('cms-alert-notification', handleNotification);
  }, []);

  // Synchronise path transitions with React state
  useEffect(() => {
    const handleUrlChange = () => {
      isPopStateRef.current = true;
      const path = window.location.pathname;
      if (path.startsWith('/location/')) {
        const slug = path.split('/location/')[1];
        if (slug) {
          setSelectedLocationSlug(slug);
          setActiveTab('Home');
        }
      } else if (path === '/properties' || path.startsWith('/properties/')) {
        setSelectedLocationSlug(null);
        setActiveTab('Properties');
      } else if (path.startsWith('/property/')) {
        setSelectedLocationSlug(null);
        setActiveTab('PropertyDetail');
      } else if (path.startsWith('/insights/')) {
        const slug = path.split('/insights/')[1];
        if (slug) {
          setSelectedLocationSlug(null);
          setSelectedArticleSlug(slug);
          setActiveTab('Insights');
        }
      } else if (path === '/about' || path.startsWith('/about/')) {
        setSelectedLocationSlug(null);
        setActiveTab('About');
      } else if (path === '/admin' || path.startsWith('/admin/')) {
        setSelectedLocationSlug(null);
        setActiveTab('Admin');
      } else if (path === '/contact' || path.startsWith('/contact/')) {
        setSelectedLocationSlug(null);
        setActiveTab('Contact');
      } else {
        setSelectedLocationSlug(null);
        if (path === '/' || path === '') {
          setActiveTab('Home');
        } else if (path === '/privacy-policy') {
          setActiveTab('PrivacyPolicy');
        } else if (path === '/terms-conditions') {
          setActiveTab('Terms');
        } else {
          setActiveTab('404');
        }
      }
    };

    // Initial check on load
    handleUrlChange();

    // Listen to history transitions and popstates
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Listen to custom navigation events from components
  useEffect(() => {
    const handleRealtyNav = (e: any) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
      }
    };
    const handleSelectPropEvent = (e: any) => {
      if (e.detail?.property) {
        handleViewPropertyDetails(e.detail.property);
      }
    };
    window.addEventListener('realty-navigate', handleRealtyNav);
    window.addEventListener('select-property', handleSelectPropEvent);
    return () => {
      window.removeEventListener('realty-navigate', handleRealtyNav);
      window.removeEventListener('select-property', handleSelectPropEvent);
    };
  }, []);

  // Synchronise dynamic property URL slug on property state load or URL change
  useEffect(() => {
    const path = window.location.pathname;
    const isPropertyPath = path.startsWith('/property/');
    const isPropertiesPath = path.startsWith('/properties/');
    
    if ((isPropertyPath || isPropertiesPath) && properties.length > 0) {
      const prefix = isPropertyPath ? '/property/' : '/properties/';
      const slug = path.split(prefix)[1];
      if (slug) {
        // Check for 301 redirects first!
        const cachedRedirects = getLocalCache<any[]>(CACHE_KEYS.SEO_REDIRECTS, []);
        const activeRedirect = cachedRedirects.find(r => r.fromUrl === `${prefix}${slug}`);
        
        let targetSlug = slug;
        if (activeRedirect) {
          const destSlug = activeRedirect.toUrl.split(prefix)[1];
          if (destSlug) {
            targetSlug = destSlug;
            window.history.replaceState(null, '', activeRedirect.toUrl);
          }
        }

        // Search property list
        const cachedConfigs = getLocalCache<any[]>('dvarix_cache_property_seo_configs', []);
        
        const matched = properties.find(p => {
          const config = cachedConfigs.find(c => c.id === p.id);
          const currentSlug = config?.urlSlug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          return currentSlug === targetSlug || p.id === targetSlug;
        });

        if (matched) {
          setSelectedProperty(matched);
          setActiveTab(isPropertyPath ? 'PropertyDetail' : 'Properties');
        }
      }
    }
  }, [properties, activeTab]);

  // Synchronise state changes to update the URL path
  useEffect(() => {
    const currentPathName = window.location.pathname;
    let targetPath = '';

    if (selectedLocationSlug) {
      targetPath = `/location/${selectedLocationSlug}`;
    } else if (activeTab === 'Insights' && selectedArticleSlug) {
      targetPath = `/insights/${selectedArticleSlug}`;
    } else if (activeTab === 'Properties') {
      if (selectedProperty) {
        const cachedConfigs = getLocalCache<any[]>('dvarix_cache_property_seo_configs', []);
        const config = cachedConfigs.find(c => c.id === selectedProperty.id);
        const slug = config?.urlSlug || selectedProperty.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        targetPath = `/properties/${slug}`;
      } else {
        targetPath = '/properties';
      }
    } else if (activeTab === 'PropertyDetail') {
      if (selectedProperty) {
        const cachedConfigs = getLocalCache<any[]>('dvarix_cache_property_seo_configs', []);
        const config = cachedConfigs.find(c => c.id === selectedProperty.id);
        const slug = config?.urlSlug || selectedProperty.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        targetPath = `/property/${slug}`;
      } else {
        targetPath = '/properties';
      }
    } else if (activeTab === 'About') {
      targetPath = '/about';
    } else if (activeTab === 'Admin') {
      targetPath = loggedInUser ? '/admin' : '/admin/login';
    } else if (activeTab === 'Contact') {
      targetPath = '/contact';
    } else if (activeTab === 'PrivacyPolicy') {
      targetPath = '/privacy-policy';
    } else if (activeTab === 'Terms') {
      targetPath = '/terms-conditions';
    } else if (activeTab === '404') {
      targetPath = currentPathName;
    } else {
      targetPath = '/';
    }

    if (currentPathName !== targetPath && !currentPathName.startsWith('/location/') && !currentPathName.startsWith('/insights/')) {
      if (activeTab === 'Properties' || activeTab === 'PropertyDetail') {
        window.history.pushState(null, '', targetPath);
        return;
      }
      if (activeTab === 'Insights' && currentPathName.startsWith('/insights')) {
        return;
      }
      window.history.pushState(null, '', targetPath);
    }
  }, [activeTab, selectedLocationSlug, loggedInUser, selectedArticleSlug, selectedProperty]);

  const handleNavigateToLocation = (slug: string) => {
    const formattedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    window.history.pushState(null, '', `/location/${formattedSlug}`);
    setSelectedLocationSlug(formattedSlug);
  };

  const handleBackToHomeMap = () => {
    window.history.pushState(null, '', '/');
    setSelectedLocationSlug(null);
    setActiveTab('Home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Smooth scroll manager on tab change (taking header offset into account)
  useEffect(() => {
    if (isPopStateRef.current) {
      isPopStateRef.current = false;
      return;
    }

    let targetId = '';
    if (activeTab === 'Home') targetId = 'home-view-elements';
    else if (activeTab === 'Properties') targetId = 'dvarix-realty-properties-page-root';
    else if (activeTab === 'About') targetId = 'about-us-page-view';
    else if (activeTab === 'Contact') targetId = 'contact-view-elements';
    else if (activeTab === 'PrivacyPolicy') targetId = 'privacy-policy-view';
    else if (activeTab === 'Terms') targetId = 'terms-conditions-view';
    else if (activeTab === 'Insights') targetId = 'blog-article-full-page-view';

    if (targetId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          const headerOffset = 100; // height of the sticky header (80px) + 20px buffer
          const elementPosition = el.getBoundingClientRect().top + window.scrollY;
          const offsetPosition = elementPosition - headerOffset;
          
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth'
          });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 150); // wait for dynamic layout rendering
      return () => clearTimeout(timer);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  // Global anchor click scroll offset handler
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && href.startsWith('#') && href.length > 1) {
          e.preventDefault();
          const targetId = href.substring(1);
          const el = document.getElementById(targetId);
          if (el) {
            const headerOffset = 100; // sticky header + spacing
            const elementPosition = el.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
              top: Math.max(0, elementPosition - headerOffset),
              behavior: 'smooth'
            });
            window.history.pushState(null, '', href);
          }
        }
      }
    };

    window.addEventListener('click', handleAnchorClick);
    return () => window.removeEventListener('click', handleAnchorClick);
  }, []);

  // Handle URL hash on initial load or browser hashchange events
  useEffect(() => {
    const handleInitialHashScroll = () => {
      const hash = window.location.hash;
      if (hash && hash.length > 1) {
        const targetId = hash.substring(1);
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            const headerOffset = 100;
            const elementPosition = el.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
              top: Math.max(0, elementPosition - headerOffset),
              behavior: 'smooth'
            });
          }
        }, 350);
      }
    };

    window.addEventListener('hashchange', handleInitialHashScroll);
    handleInitialHashScroll();
    return () => window.removeEventListener('hashchange', handleInitialHashScroll);
  }, []);
  const [mapSettings, setMapSettings] = useState<MapSettings>({
    activeProvider: 'OpenStreetMap',
    activeStyle: 'Standard',
    defaultZoom: 10,
    defaultCenterLat: 12.9716,
    defaultCenterLng: 77.5946,
    customProviderName: 'Global Coordinates API',
    customApiKey: '',
    customMapUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    customEnabled: false,
    enableSearch: true,
    enableClustering: false,
    enablePropertyCountPins: true,
    pinColor: '#0ea5e9',
    pinSize: 'medium',
    pinIcon: 'MapPin',
    featuredPinStyle: 'glowing',
    hoverAnimation: 'bounce',
    clickAnimation: 'radar_ping',
    showLocationName: true,
    showOpportunitiesCount: true,
    showRequirementsCount: true,
    showDemandLevel: true,
    showInvestmentRating: true
  });

  const [siteSettings, setSiteSettings] = useState<SiteCMSConfig>({
    id: "site_settings",
    businessName: "Dvarix Realty Bangalore",
    whatsappNumber: "+91 6300984846",
    currency: "INR (Indian Rupee)",
    email: "dvarixrealty@gmail.com",
    phone: "+91 6300984846",
    address: "JP Nagar, Bangalore, India",
    facebookUrl: "https://facebook.com/dvarixrealty",
    instagramUrl: "https://instagram.com/dvarixrealty",
    linkedinUrl: "https://linkedin.com/company/dvarixrealty",
    twitterUrl: "https://twitter.com/dvarixrealty",
    heroBadge: "Premium Consultancy:",
    heroBadgeHighlight: "Elite Property Hub",
    heroHeadline1: "Your Requirement.",
    heroHeadline2Highlight: "Our Real Estate Solution.",
    heroSubheading: "Tell us what you're looking for, and we'll help you find it. Whether you're buying, selling, renting, leasing, or investing, our boutique agency provides personalized real estate arrangements.",
    heroBgImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=82",
    heroButtonText: "Schedule Expert Consultation",
    testimonials: [
      {
        id: 0,
        text: "Dvarix Realty understood exactly what we needed and helped us find the right property without wasting our time.",
        client: "Nandini K. S.",
        role: "Villa Owner in JP Nagar, Bangalore",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
      },
      {
        id: 1,
        text: "The entire process was transparent and professional from consultation to final closure.",
        client: "Ananya & Raghav Reddy",
        role: "Hedge Fund Partners",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
      },
      {
        id: 2,
        text: "Instead of browsing hundreds of listings, we simply shared our requirements and received suitable options quickly.",
        client: "Kiran Devnath",
        role: "Tech Consultant, JP Nagar Studio",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
      }
    ],
    blogs: [
      {
        id: "b1",
        title: "Bangalore Real Estate Surge in 2026",
        excerpt: "Why micro-markets in JP Nagar and Whitefield are seeing unprecedented double-digit demand.",
        content: "The property landscape in Southern and Eastern Bangalore is expanding rapidly. With new metro corridors opening and tech hubs decentralizing, property valuations are scaling significantly. Learn why investing early in gated plots and customizable luxury villas represents the most reliable equity hedge of the decade.",
        image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
        date: "2026-06-15",
        author: "Advisors Board",
        published: true
      },
      {
        id: "b2",
        title: "Bespoke Villas vs. Premium High-Rise Apartments",
        excerpt: "Deep analysis into privacy, customization, and land share appreciation benefits.",
        content: "Many high-net-worth investors face the dilemma of opting for convenient sky-villas or absolute ownership custom-built architectural villas. In this brief, we analyze the structural density differences, maintenance amortizations, and historical land-price appreciation records.",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        date: "2026-06-28",
        author: "Premium Sourcing Desk",
        published: true
      }
    ],
    services: [
      {
        id: "s1",
        title: "Requirement-Based Sourcing",
        description: "Every property search begins with your requirements. We carefully understand your location, budget, lifestyle, and investment goals before presenting handpicked opportunities."
      },
      {
        id: "s2",
        title: "Commercial & Industrial Advisory",
        description: "Comprehensive advisory for office spaces, retail outlets, warehouses, industrial assets, and commercial investments across Bengaluru's key growth corridors."
      },
      {
        id: "s3",
        title: "Land & Plot Acquisition",
        description: "Verified residential plots, villa communities, farm lands, and investment parcels with complete legal due diligence and transparent documentation."
      },
      {
        id: "s4",
        title: "Legal Verification & Compliance",
        description: "Every recommended property is reviewed for title clarity, approvals, EC, Khata, RERA compliance, and essential legal documentation wherever applicable."
      },
      {
        id: "s5",
        title: "Home Loan & Financial Assistance",
        description: "Simplifying home financing through trusted banking partners, competitive interest rates, and end-to-end loan processing support."
      },
      {
        id: "s6",
        title: "End-to-End Property Assistance",
        description: "From consultation and property discovery to registration and after-sales support, Dvarix Realty stands by you throughout your real estate journey."
      }
    ],
    offers: [
      {
        id: "o1",
        title: "Zero-Brokerage Consultation Campaign",
        badge: "Exclusive",
        description: "Schedule your physical requirement mapping brief at our JP Nagar headquarters this month and receive zero-fee consultancy on your first three sourced locations.",
        validTill: "2026-07-31",
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
        active: true
      }
    ],
    heroBanners: [
      {
        id: "b1",
        headline: "Find Your Dream Property in Bengaluru",
        subheading: "Premium real estate options",
        description: "Discover verified plots, luxury villas, apartments and commercial properties across Bengaluru with complete transparency.",
        badgeText: "DVARIX REALTY",
        propertyCountBadge: "500+ Verified Properties",
        desktopImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        tabletImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        mobileImage: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80",
        primaryButtonText: "Explore Properties",
        primaryButtonUrl: "#listings-layout-view",
        secondaryButtonText: "Custom Request",
        secondaryButtonUrl: "custom-request",
        enabled: true,
        order: 1
      },
      {
        id: "b2",
        headline: "Premium Villas & Elite Penthouses",
        subheading: "Exclusive residential estates",
        description: "Explore highly coveted premium luxury villa collections and luxury apartments crafted for your refined standards and custom parameters.",
        badgeText: "EXCLUSIVE VILLAS",
        propertyCountBadge: "120+ Luxury Villas",
        desktopImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
        tabletImage: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80",
        mobileImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80",
        primaryButtonText: "View Luxury Villas",
        primaryButtonUrl: "#listings-layout-view",
        secondaryButtonText: "Custom Search Request",
        secondaryButtonUrl: "custom-request",
        enabled: true,
        order: 2
      }
    ]
  });

  const listingsRef = useRef<HTMLDivElement>(null);

  // Reusable MySQL data loader
  const loadAllFromMySQL = async () => {
    try {
      console.log("[MySQL Load] Fetching all data from MySQL...");
      const [
        mysqlProps,
        mysqlCats,
        mysqlSearchCats,
        mysqlAgents,
        mysqlMapLocs,
        mysqlInq,
        mysqlCentEnq,
        mysqlRules,
        mysqlReqs,
        mysqlAdmins,
        mysqlFAQs,
        mysqlHeroBanners,
        mysqlQFilters,
        mysqlSett
      ] = await Promise.all([
        mysqlClientService.getProperties(),
        mysqlClientService.getCategories(),
        mysqlClientService.getSearchCategories(),
        mysqlClientService.getAgents(),
        mysqlClientService.getMapLocations(),
        mysqlClientService.getInquiries(),
        mysqlClientService.getCentralEnquiries(),
        mysqlClientService.getRoutingRules(),
        mysqlClientService.getRequirements(),
        mysqlClientService.getAdminUsers(),
        mysqlClientService.getFaqs(),
        mysqlClientService.getHeroBanners(),
        mysqlClientService.getQuickFilters(),
        mysqlClientService.getSettings()
      ]);

      console.log("[MySQL Load] Fetch completed successfully.");

      if (mysqlProps && mysqlProps.length > 0) setProperties(mysqlProps);
      if (mysqlCats && mysqlCats.length > 0) setCategories(mysqlCats);
      if (mysqlSearchCats && mysqlSearchCats.length > 0) setSearchCategories(mysqlSearchCats);
      if (mysqlAgents && mysqlAgents.length > 0) setAgents(mysqlAgents);
      if (mysqlMapLocs) {
        if (Array.isArray(mysqlMapLocs)) {
          const mapObj: Record<string, MapLocation> = {};
          mysqlMapLocs.forEach((loc: any) => {
            mapObj[loc.name] = loc;
          });
          setMapLocations(mapObj);
        } else if (Object.keys(mysqlMapLocs).length > 0) {
          setMapLocations(mysqlMapLocs);
        }
      }
      if (mysqlInq) setInquiries(mysqlInq);
      if (mysqlCentEnq) setCentralEnquiries(mysqlCentEnq);
      if (mysqlRules) setRoutingRules(mysqlRules);
      if (mysqlReqs) setCustomRequirements(mysqlReqs);
      if (mysqlAdmins) setAdminUsers(mysqlAdmins);
      if (mysqlFAQs) setFaqs(mysqlFAQs);
      if (mysqlHeroBanners) setHeroBanners(mysqlHeroBanners);
      if (mysqlQFilters && mysqlQFilters.length > 0) setQuickFilters(mysqlQFilters);

      if (mysqlSett && Array.isArray(mysqlSett)) {
        const mapS = mysqlSett.find((s: any) => s.id === 'map_settings' || s.key_name === 'map_settings');
        if (mapS) setMapSettings(mapS);
        const siteS = mysqlSett.find((s: any) => s.id === 'site_settings' || s.key_name === 'site_settings');
        if (siteS) setSiteSettings(siteS);
      }
    } catch (err) {
      console.error("❌ Error loading data from MySQL:", err);
    }
  };

  // Unified Database Router for CRUD dual-writes
  const unifiedDb = {
    async saveProperty(p: Property) {
      if (useFirebase) {
        await firebaseService.saveProperty(p);
      } else {
        await mysqlClientService.saveProperty(p);
        firebaseService.saveProperty(p).catch(err => console.warn("Firebase dual write background fail:", err));
        await loadAllFromMySQL();
      }
    },
    async deleteProperty(id: string) {
      if (useFirebase) {
        await firebaseService.deleteProperty(id);
      } else {
        await mysqlClientService.deleteProperty(id);
        firebaseService.deleteProperty(id).catch(err => console.warn("Firebase dual delete background fail:", err));
        await loadAllFromMySQL();
      }
    },
    async saveCategory(cat: PropertyTypeCard) {
      if (useFirebase) {
        await firebaseService.saveCategory(cat);
      } else {
        await mysqlClientService.saveCategory(cat);
        firebaseService.saveCategory(cat).catch(err => console.warn("Firebase dual write background fail:", err));
        await loadAllFromMySQL();
      }
    },
    async deleteCategory(id: string) {
      if (useFirebase) {
        await firebaseService.deleteCategory(id);
      } else {
        await mysqlClientService.deleteCategory(id);
        firebaseService.deleteCategory(id).catch(err => console.warn("Firebase dual delete background fail:", err));
        await loadAllFromMySQL();
      }
    },
    async saveSearchCategory(cat: SearchCategory) {
      if (useFirebase) {
        await firebaseService.saveSearchCategory(cat);
      } else {
        await mysqlClientService.saveSearchCategory(cat);
        firebaseService.saveSearchCategory(cat).catch(err => console.warn("Firebase dual write background fail:", err));
        await loadAllFromMySQL();
      }
    },
    async deleteSearchCategory(id: string) {
      if (useFirebase) {
        await firebaseService.deleteSearchCategory(id);
      } else {
        await mysqlClientService.deleteSearchCategory(id);
        firebaseService.deleteSearchCategory(id).catch(err => console.warn("Firebase dual delete background fail:", err));
        await loadAllFromMySQL();
      }
    },
    async saveAgent(ag: Agent) {
      if (useFirebase) {
        await firebaseService.saveAgent(ag);
      } else {
        await mysqlClientService.saveAgent(ag);
        firebaseService.saveAgent(ag).catch(err => console.warn("Firebase dual write background fail:", err));
        await loadAllFromMySQL();
      }
    },
    async deleteAgent(id: string) {
      if (useFirebase) {
        await firebaseService.deleteAgent(id);
      } else {
        await mysqlClientService.deleteAgent(id);
        firebaseService.deleteAgent(id).catch(err => console.warn("Firebase dual delete background fail:", err));
        await loadAllFromMySQL();
      }
    },
    async saveMapLocation(loc: MapLocation) {
      if (useFirebase) {
        await firebaseService.saveMapLocation(loc);
      } else {
        await mysqlClientService.saveMapLocation(loc);
        firebaseService.saveMapLocation(loc).catch(err => console.warn("Firebase dual write background fail:", err));
        await loadAllFromMySQL();
      }
    },
    async deleteMapLocation(name: string) {
      if (useFirebase) {
        await firebaseService.deleteMapLocation(name);
      } else {
        await mysqlClientService.deleteMapLocation(name);
        firebaseService.deleteMapLocation(name).catch(err => console.warn("Firebase dual delete background fail:", err));
        await loadAllFromMySQL();
      }
    },
    async saveInquiry(inq: Inquiry) {
      if (useFirebase) {
        await firebaseService.saveInquiry(inq);
      } else {
        await mysqlClientService.saveInquiry(inq);
        firebaseService.saveInquiry(inq).catch(err => console.warn("Firebase dual write background fail:", err));
        await loadAllFromMySQL();
      }
    },
    async deleteInquiry(id: string) {
      if (useFirebase) {
        await firebaseService.deleteInquiry(id);
      } else {
        await mysqlClientService.deleteInquiry(id);
        firebaseService.deleteInquiry(id).catch(err => console.warn("Firebase dual delete background fail:", err));
        await loadAllFromMySQL();
      }
    },
    async saveCentralEnquiry(enq: CentralEnquiry) {
      if (useFirebase) {
        await firebaseService.saveCentralEnquiry(enq);
      } else {
        await mysqlClientService.saveCentralEnquiry(enq);
        firebaseService.saveCentralEnquiry(enq).catch(err => console.warn("Firebase dual write background fail:", err));
        await loadAllFromMySQL();
      }
    },
    async deleteCentralEnquiry(id: string) {
      if (useFirebase) {
        await firebaseService.deleteCentralEnquiry(id);
      } else {
        await mysqlClientService.deleteCentralEnquiry(id);
        firebaseService.deleteCentralEnquiry(id).catch(err => console.warn("Firebase dual delete background fail:", err));
        await loadAllFromMySQL();
      }
    },
    async saveRequirement(req: CustomRequirement) {
      if (useFirebase) {
        await firebaseService.saveRequirement(req);
      } else {
        await mysqlClientService.saveRequirement(req);
        firebaseService.saveRequirement(req).catch(err => console.warn("Firebase dual write background fail:", err));
        await loadAllFromMySQL();
      }
    },
    async deleteRequirement(id: string) {
      if (useFirebase) {
        await firebaseService.deleteRequirement(id);
      } else {
        await mysqlClientService.deleteRequirement(id);
        firebaseService.deleteRequirement(id).catch(err => console.warn("Firebase dual delete background fail:", err));
        await loadAllFromMySQL();
      }
    },
    async saveAdminUser(u: AdminUser) {
      if (useFirebase) {
        await firebaseService.saveAdminUser(u);
      } else {
        await mysqlClientService.saveAdminUser(u);
        firebaseService.saveAdminUser(u).catch(err => console.warn("Firebase dual write background fail:", err));
        await loadAllFromMySQL();
      }
    },
    async deleteAdminUser(id: string) {
      if (useFirebase) {
        await firebaseService.deleteAdminUser(id);
      } else {
        await mysqlClientService.deleteAdminUser(id);
        firebaseService.deleteAdminUser(id).catch(err => console.warn("Firebase dual delete background fail:", err));
        await loadAllFromMySQL();
      }
    },
    async saveQuickFilter(f: QuickFilter) {
      if (useFirebase) {
        await firebaseService.saveQuickFilter(f);
      } else {
        await mysqlClientService.saveQuickFilter(f);
        firebaseService.saveQuickFilter(f).catch(err => console.warn("Firebase dual write background fail:", err));
        await loadAllFromMySQL();
      }
    },
    async deleteQuickFilter(id: string) {
      if (useFirebase) {
        await firebaseService.deleteQuickFilter(id);
      } else {
        await mysqlClientService.deleteQuickFilter(id);
        firebaseService.deleteQuickFilter(id).catch(err => console.warn("Firebase dual delete background fail:", err));
        await loadAllFromMySQL();
      }
    },
    async saveMapSettings(sett: MapSettings) {
      if (useFirebase) {
        await firebaseService.saveMapSettings(sett);
      } else {
        await mysqlClientService.saveSetting("map_settings", sett);
        firebaseService.saveMapSettings(sett).catch(err => console.warn("Firebase dual write background fail:", err));
        await loadAllFromMySQL();
      }
    },
    async saveSiteSettings(sett: SiteCMSConfig) {
      if (useFirebase) {
        await firebaseService.saveSiteSettings(sett);
      } else {
        await mysqlClientService.saveSetting("site_settings", sett);
        firebaseService.saveSiteSettings(sett).catch(err => console.warn("Firebase dual write background fail:", err));
        await loadAllFromMySQL();
      }
    }
  };

  // Initialize data from Firebase & local storage fallback
  useEffect(() => {
    // 1. Load favorites shortlist
    const storedFavorites = localStorage.getItem('dvarix_favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }

    const DEFAULT_CATEGORIES: PropertyTypeCard[] = [
      { id: 'Apartment', title: 'Apartment', description: 'Stellar complexes', iconName: 'Building1', displayOrder: 1, status: 'Active', showInView: true, redirectUrl: '/properties?type=apartment' },
      { id: 'Villa', title: 'Villa', description: 'Luxury residences', iconName: 'Home', displayOrder: 2, status: 'Active', showInView: true, redirectUrl: '/properties?type=villa' },
      { id: 'Commercial', title: 'Commercial', description: 'Corporate estates', iconName: 'Building2', displayOrder: 3, status: 'Active', showInView: true, redirectUrl: '/properties?type=commercial' },
      { id: 'Plot', title: 'Plot', description: 'Premium Land', iconName: 'Map', displayOrder: 4, status: 'Active', showInView: true, redirectUrl: '/properties?type=plot' },
      { id: 'Warehouse', title: 'Warehouse', description: 'Industrial hubs', iconName: 'Warehouse', displayOrder: 5, status: 'Active', showInView: true, redirectUrl: '/properties?type=warehouse' },
      { id: 'Homestay', title: 'Homestay', description: 'Bespoke retreats', iconName: 'Hotel', displayOrder: 6, status: 'Active', showInView: true, redirectUrl: '/properties?type=homestay' }
    ];

    const DEFAULT_SEARCH_CATEGORIES: SearchCategory[] = [
      { id: 'Properties', title: 'Properties', iconName: 'Building2', displayOrder: 1, status: 'Active', showInView: true, isDefault: true },
      { id: 'Plots', title: 'Plots', iconName: 'Landmark', displayOrder: 2, status: 'Active', showInView: true },
      { id: 'Apartments', title: 'Apartments', iconName: 'Building2', displayOrder: 3, status: 'Active', showInView: true },
      { id: 'Villas', title: 'Villas', iconName: 'Compass', displayOrder: 4, status: 'Active', showInView: true },
      { id: 'Commercial', title: 'Commercial', iconName: 'Award', displayOrder: 5, status: 'Active', showInView: true },
      { id: 'House for Rent', title: 'House for Rent', iconName: 'Clock', displayOrder: 6, status: 'Active', showInView: true },
      { id: 'PG / Stay', title: 'PG / Stay', iconName: 'Bed', displayOrder: 7, status: 'Active', showInView: true },
      { id: 'Warehouses', title: 'Warehouses', iconName: 'Ruler', displayOrder: 8, status: 'Active', showInView: true }
    ];

    const DEFAULT_AGENTS: Agent[] = [
      {
        id: 'agent-1',
        name: 'Raghav Reddy',
        role: 'Director of Southern Acquisitions',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
        phone: '+91 6300984846',
        email: 'raghav.r@dvarix.com'
      },
      {
        id: 'agent-2',
        name: 'Priya Sharma',
        role: 'Bespoke Portfolio Advisor',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
        phone: '+91 6300984846',
        email: 'p.sharma@dvarix.com'
      },
      {
        id: 'agent-3',
        name: 'Anirudh Naidu',
        role: 'Premium Villa Lead',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        phone: '+91 6300984846',
        email: 'a.naidu@dvarix.com'
      }
    ];

    const DEFAULT_MAP_LOCATIONS: Record<string, MapLocation> = {
      'JP Nagar': {
        name: 'JP Nagar',
        slug: 'jp-nagar',
        x: '28%',
        y: '58%',
        listings: 8,
        avgValuation: '₹1.8 Cr',
        benefits: 'High demand residential, metro access, premium villas',
        description: 'Elite residential hub with fully-developed green layouts, top schools, and modern multi-level villas.',
        growth: '+14.2% YoY ROI',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        latitude: 12.9105,
        longitude: 77.5857,
        status: 'Active',
        featured: true,
        displayOrder: 1,
        availableOpportunities: 8,
        activeRequirements: 24,
        siteVisits: 14,
        demandLevel: 'Very High',
        investmentPotential: 'Exceptional',
        averageBudget: '₹1.5 Cr - ₹3.5 Cr',
        growthRate: '14.2%',
        avgPropertyValue: '₹1.8 Cr',
        locationHighlights: 'Metro Connectivity, Green Belts, Elite Schools, Food Streets',
        showOnHomepage: true,
        featuredLocation: true,
        activePin: true,
        pinColor: '#ff5a3c',
        pinIcon: 'Home',
        redirectType: 'Location Page',
        redirectUrl: '/location/jp-nagar'
      },
      'Whitefield': {
        name: 'Whitefield',
        slug: 'whitefield',
        x: '88%',
        y: '28%',
        listings: 12,
        avgValuation: '₹2.1 Cr',
        benefits: 'IT corridor hub, luxury gated communities, high rental yields',
        description: 'Bengaluru premier technology hub containing premium integrated townships and villa clusters.',
        growth: '+16.5% YoY ROI',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        latitude: 12.9698,
        longitude: 77.7500,
        status: 'Active',
        featured: true,
        displayOrder: 2,
        availableOpportunities: 12,
        activeRequirements: 38,
        siteVisits: 22,
        demandLevel: 'Very High',
        investmentPotential: 'Exceptional',
        averageBudget: '₹1.8 Cr - ₹4.5 Cr',
        growthRate: '16.5%',
        avgPropertyValue: '₹2.1 Cr',
        locationHighlights: 'IT Parks, Upcoming Metro, Shopping Malls, Gated Villa Communities',
        showOnHomepage: true,
        featuredLocation: true,
        activePin: true,
        pinColor: '#0ea5e9',
        pinIcon: 'Building',
        redirectType: 'Location Page',
        redirectUrl: '/location/whitefield'
      },
      'Sarjapur': {
        name: 'Sarjapur',
        slug: 'sarjapur',
        x: '82%',
        y: '72%',
        listings: 6,
        avgValuation: '₹1.4 Cr',
        benefits: 'Rapid educational hub growth, villa corridors, high appreciation',
        description: 'Rapidly developing residential pocket showing outstanding ROI spikes and high-end villa communities.',
        growth: '+18.5% YoY ROI',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        latitude: 12.8596,
        longitude: 77.7864,
        status: 'Active',
        featured: true,
        displayOrder: 3,
        availableOpportunities: 6,
        activeRequirements: 19,
        siteVisits: 11,
        demandLevel: 'High',
        investmentPotential: 'High',
        averageBudget: '₹1.1 Cr - ₹2.8 Cr',
        growthRate: '18.5%',
        avgPropertyValue: '₹1.4 Cr',
        locationHighlights: 'Educational Institutions, Safe Green Enclaves, IT Access Roads',
        showOnHomepage: true,
        featuredLocation: true,
        activePin: true,
        pinColor: '#10b981',
        pinIcon: 'Home',
        redirectType: 'Location Page',
        redirectUrl: '/location/sarjapur'
      },
      'Koramangala': {
        name: 'Koramangala',
        slug: 'koramangala',
        x: '48%',
        y: '42%',
        listings: 10,
        avgValuation: '₹3.4 Cr',
        benefits: 'Cosmopolitan center, premium retail, high status residents',
        description: 'Sophisticated commercial and ultra-luxury boutique housing hub with continuous high rental requests.',
        growth: '+11.8% YoY ROI',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        latitude: 12.9352,
        longitude: 77.6244,
        status: 'Active',
        featured: true,
        displayOrder: 4,
        availableOpportunities: 10,
        activeRequirements: 45,
        siteVisits: 31,
        demandLevel: 'Very High',
        investmentPotential: 'High',
        averageBudget: '₹2.5 Cr - ₹6.0 Cr',
        growthRate: '11.8%',
        avgPropertyValue: '₹3.4 Cr',
        locationHighlights: 'Elite Dining, Startup Ecosystem, Premium Malls, High-income demographic',
        showOnHomepage: true,
        featuredLocation: true,
        activePin: true,
        pinColor: '#8b5cf6',
        pinIcon: 'Building',
        redirectType: 'Location Page',
        redirectUrl: '/location/koramangala'
      },
      'HSR Layout': {
        name: 'HSR Layout',
        slug: 'hsr-layout',
        x: '62%',
        y: '56%',
        listings: 9,
        avgValuation: '₹2.4 Cr',
        benefits: 'Well-planned layout, wide tree-lined sectors, startup hub',
        description: 'Extremely structured sector layout designed for comfortable family villas mixed with new age startups.',
        growth: '+15.9% YoY ROI',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        latitude: 12.9128,
        longitude: 77.6388,
        status: 'Active',
        featured: true,
        displayOrder: 5,
        availableOpportunities: 9,
        activeRequirements: 28,
        siteVisits: 17,
        demandLevel: 'High',
        investmentPotential: 'High',
        averageBudget: '₹1.8 Cr - ₹4.0 Cr',
        growthRate: '15.9%',
        avgPropertyValue: '₹2.4 Cr',
        locationHighlights: 'Wide tree-lined roads, Elite layout sectors, Gyms & Parks, Startups',
        showOnHomepage: true,
        featuredLocation: true,
        activePin: true,
        pinColor: '#f59e0b',
        pinIcon: 'Home',
        redirectType: 'Location Page',
        redirectUrl: '/location/hsr-layout'
      },
      'Electronic City': {
        name: 'Electronic City',
        slug: 'electronic-city',
        x: '74%',
        y: '88%',
        listings: 15,
        avgValuation: '₹95 Lakhs',
        benefits: 'Global IT majors, high affordabilty, strong rental pool',
        description: 'Bengaluru prime digital tech zone with high affordability indexes and extensive rental bases.',
        growth: '+14.5% YoY ROI',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        latitude: 12.8452,
        longitude: 77.6722,
        status: 'Active',
        featured: true,
        displayOrder: 6,
        availableOpportunities: 15,
        activeRequirements: 32,
        siteVisits: 25,
        demandLevel: 'High',
        investmentPotential: 'High',
        averageBudget: '₹75 L - ₹1.8 Cr',
        growthRate: '14.5%',
        avgPropertyValue: '₹95 Lakhs',
        locationHighlights: 'Tech Giants, Nice Road Access, High ROI Yield, Budget Friendly Option',
        showOnHomepage: true,
        featuredLocation: true,
        activePin: true,
        pinColor: '#ef4444',
        pinIcon: 'Building',
        redirectType: 'Location Page',
        redirectUrl: '/location/electronic-city'
      }
    };

    const DEFAULT_ADMIN_USERS: AdminUser[] = [
      {
        id: 'user-super',
        email: 'dvarixrealty@gmail.com',
        password: 'radhakrishna143',
        name: 'Raghav Reddy',
        roleName: 'Super Admin',
        permissions: {
          canManageProperties: true,
          canManageCategories: true,
          canManageAgents: true,
          canManageMap: true,
          canReplyInquiries: true,
          canManageUsers: true,
        }
      },
      {
        id: 'user-priya',
        email: 'p.sharma@dvarix.com',
        password: 'sharmapriya123',
        name: 'Priya Sharma',
        roleName: 'Bespoke Advisor',
        permissions: {
          canManageProperties: true,
          canManageCategories: false,
          canManageAgents: false,
          canManageMap: true,
          canReplyInquiries: true,
          canManageUsers: false,
        }
      },
      {
        id: 'user-anirudh',
        email: 'a.naidu@dvarix.com',
        password: 'naidupremium',
        name: 'Anirudh Naidu',
        roleName: 'Villa Manager',
        permissions: {
          canManageProperties: true,
          canManageCategories: false,
          canManageAgents: false,
          canManageMap: false,
          canReplyInquiries: true,
          canManageUsers: false,
        }
      }
    ];

    let activeCleanup: (() => void) | null = null;

    async function startDatabase() {
      if (useFirebase) {
        console.log("[DATA RECRUITER] Firebase Rollback Mode Active. Subscribing to Firestore...");
        try {
          if (await firebaseService.isCollectionEmpty('properties')) {
            console.log("Seeding properties sequence into Firestore...");
            for (const item of PROPERTIES) {
              await firebaseService.saveProperty(item);
            }
          }
          
          if (await firebaseService.isCollectionEmpty('categories')) {
            console.log("Seeding categories into Firestore...");
            for (const cat of DEFAULT_CATEGORIES) {
              await firebaseService.saveCategory(cat);
            }
          }

          if (await firebaseService.isCollectionEmpty('search_categories')) {
            console.log("Seeding search categories in Firestore...");
            for (const sCat of DEFAULT_SEARCH_CATEGORIES) {
              await firebaseService.saveSearchCategory(sCat);
            }
          }

          if (await firebaseService.isCollectionEmpty('agents')) {
            console.log("Seeding agents into Firestore...");
            for (const ag of DEFAULT_AGENTS) {
              await firebaseService.saveAgent(ag);
            }
          }

          if (await firebaseService.isCollectionEmpty('map_locations')) {
            console.log("Seeding map locations into Firestore...");
            for (const name of Object.keys(DEFAULT_MAP_LOCATIONS)) {
              await firebaseService.saveMapLocation(DEFAULT_MAP_LOCATIONS[name]);
            }
          }

          if (await firebaseService.isCollectionEmpty('admin_users')) {
            console.log("Seeding admin users credentials into Firestore...");
            for (const admin of DEFAULT_ADMIN_USERS) {
              await firebaseService.saveAdminUser(admin);
            }
          }

          if (await firebaseService.isCollectionEmpty('inquiries')) {
            console.log("Seeding sample inquiries into Firestore...");
            for (const inq of SAMPLE_INQUIRIES) {
              await firebaseService.saveInquiry(inq);
            }
          }

          if (await firebaseService.isCollectionEmpty('requirements')) {
            console.log("Seeding sample custom requirements into Firestore...");
            for (const req of SAMPLE_REQUIREMENTS) {
              await firebaseService.saveRequirement(req);
            }
          }

          console.log("Seeding FAQs if empty...");
          await firebaseService.seedDefaultFAQs();

          console.log("Seeding Hero Banners if empty...");
          await firebaseService.seedDefaultHeroBanners();

          const DEFAULT_QUICK_FILTERS: QuickFilter[] = [
            { id: 'q-villa', name: 'Villa', status: 'Active' },
            { id: 'q-commercial', name: 'Commercial', status: 'Active' },
            { id: 'q-premium', name: 'Premium', status: 'Active' }
          ];
          if (await firebaseService.isCollectionEmpty('quick_filters')) {
            console.log("Seeding quick filters in Firestore...");
            for (const qf of DEFAULT_QUICK_FILTERS) {
              await firebaseService.saveQuickFilter(qf);
            }
          }
        } catch (err) {
          console.warn("Could not seed Firebase db, falling back to local storage models:", err);
        }

        // Live Snapshot Subscriptions
        const unsubscribeProperties = firebaseService.subscribeProperties(
          (list) => {
            console.log("[CMS DEBUG 4] App.tsx snapshot listener received new document list. Total items count:", list.length);
            setProperties(list);
          },
          (err) => console.error("[CMS DEBUG 4] Properties subscription failed with error:", err)
        );

        const unsubscribeCategories = firebaseService.subscribeCategories(
          (list) => setCategories(list),
          (err) => console.error("Categories subscription failed", err)
        );

        const unsubscribeSearchCategories = firebaseService.subscribeSearchCategories(
          (list) => setSearchCategories(list),
          (err) => console.error("Search categories subscription failed", err)
        );

        const unsubscribeAgents = firebaseService.subscribeAgents(
          (list) => setAgents(list),
          (err) => console.error("Agents subscription failed", err)
        );

        const unsubscribeMapLocations = firebaseService.subscribeMapLocations(
          (map) => setMapLocations(map),
          (err) => console.error("Map locations subscription failed", err)
        );

        const unsubscribeInquiries = firebaseService.subscribeInquiries(
          (list) => setInquiries(list),
          (err) => console.error("Inquiries subscription failed", err)
        );

        const unsubscribeCentralEnquiries = firebaseService.subscribeCentralEnquiries(
          (list) => setCentralEnquiries(list),
          (err) => console.error("Central enquiries subscription failed", err)
        );

        const unsubscribeRoutingRules = firebaseService.subscribeRoutingRules(
          (list) => setRoutingRules(list),
          (err) => console.error("Routing rules subscription failed", err)
        );

        const unsubscribeRequirements = firebaseService.subscribeRequirements(
          (list) => setCustomRequirements(list),
          (err) => console.error("Requirements subscription failed", err)
        );

        const unsubscribeAdminUsers = firebaseService.subscribeAdminUsers(
          (list) => setAdminUsers(list),
          (err) => console.error("Admin user list subscription failed", err)
        );

        const unsubscribeFAQs = firebaseService.subscribeFAQs(
          (list) => setFaqs(list),
          (err) => console.error("FAQs subscription failed", err)
        );

        const unsubscribeMapSettings = firebaseService.subscribeMapSettings(
          (sett) => setMapSettings(sett),
          (err) => console.error("Map settings subscription failed", err)
        );

        const unsubscribeSiteSettings = firebaseService.subscribeSiteSettings(
          (sett) => setSiteSettings(sett),
          (err) => console.error("Site settings subscription failed", err)
        );

        const unsubscribeHeroBanners = firebaseService.subscribeHeroBanners(
          (list) => setHeroBanners(list),
          (err) => console.error("Hero banners subscription failed", err)
        );

        const unsubscribeQuickFilters = firebaseService.subscribeQuickFilters(
          (list) => {
            const DEFAULT_QUICK_FILTERS: QuickFilter[] = [
              { id: 'q-villa', name: 'Villa', status: 'Active' },
              { id: 'q-commercial', name: 'Commercial', status: 'Active' },
              { id: 'q-premium', name: 'Premium', status: 'Active' }
            ];
            setQuickFilters(list.length > 0 ? list : DEFAULT_QUICK_FILTERS);
          },
          (err) => console.error("Quick filters subscription failed", err)
        );

        activeCleanup = () => {
          if (unsubscribeProperties) unsubscribeProperties();
          if (unsubscribeCategories) unsubscribeCategories();
          if (unsubscribeSearchCategories) unsubscribeSearchCategories();
          if (unsubscribeAgents) unsubscribeAgents();
          if (unsubscribeMapLocations) unsubscribeMapLocations();
          if (unsubscribeInquiries) unsubscribeInquiries();
          if (unsubscribeCentralEnquiries) unsubscribeCentralEnquiries();
          if (unsubscribeRoutingRules) unsubscribeRoutingRules();
          if (unsubscribeRequirements) unsubscribeRequirements();
          if (unsubscribeAdminUsers) unsubscribeAdminUsers();
          if (unsubscribeFAQs) unsubscribeFAQs();
          if (unsubscribeMapSettings) unsubscribeMapSettings();
          if (unsubscribeSiteSettings) unsubscribeSiteSettings();
          if (unsubscribeHeroBanners) unsubscribeHeroBanners();
          if (unsubscribeQuickFilters) unsubscribeQuickFilters();
        };
      } else {
        console.log("[DATA RECRUITER] MySQL Primary Mode Active. Loading from Hostinger MySQL...");
        await loadAllFromMySQL();
        
        const handleRefreshMysql = () => {
          console.log("[DATA RECRUITER] Custom MySQL refresh event received. Reloading...");
          loadAllFromMySQL();
        };
        window.addEventListener('refresh-mysql-data', handleRefreshMysql);

        // Setup 120 seconds (2 mins) interval to poll fresh MySQL data in background to protect connection limit
        const intervalId = setInterval(() => {
          loadAllFromMySQL();
        }, 120000);

        activeCleanup = () => {
          clearInterval(intervalId);
          window.removeEventListener('refresh-mysql-data', handleRefreshMysql);
        };
      }
    }

    const startPromise = startDatabase();

    return () => {
      startPromise.then(() => {
        if (activeCleanup) {
          activeCleanup();
        }
      });
    };
  }, [useFirebase]);

  // Sync favorites changes
  const toggleFavorite = (id: string) => {
    const updated = favorites.includes(id)
      ? favorites.filter((favId) => favId !== id)
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem('dvarix_favorites', JSON.stringify(updated));
  };

  const clearAllFavorites = () => {
    setFavorites([]);
    localStorage.setItem('dvarix_favorites', JSON.stringify([]));
  };

  // Dynamic properties state
  const allProperties = properties;

  // Derived favorite objects
  const favoritesList = useMemo(() => {
    return allProperties.filter((p) => favorites.includes(p.id));
  }, [allProperties, favorites]);

  // Centralised Web Ingestion Pipeline Helper
  const handleRegistryCentralEnquiry = async (
    name: string,
    email: string,
    phone: string,
    message: string,
    sourceCategory: string,
    sourceName: string,
    extraResponses: Record<string, any> = {}
  ) => {
    const trackingParams = parseUtmParameters();
    const clientDetails = detectDeviceAndOS();
    const journeyLogs = createVisitorJourney(sourceName);

    // Dynamic Intent Inference
    let intent = 'General Enquiry';
    const combinedText = `${message} ${sourceName} ${sourceCategory}`.toLowerCase();
    if (combinedText.includes('buy') || combinedText.includes('purchase')) intent = 'Buy Property';
    else if (combinedText.includes('sell') || combinedText.includes('acquisition')) intent = 'Sell Property';
    else if (combinedText.includes('rent') || combinedText.includes('lease')) intent = 'Rent Property';
    else if (combinedText.includes('visit') || combinedText.includes('tour') || combinedText.includes('walk')) intent = 'Site Visit';
    else if (combinedText.includes('loan') || combinedText.includes('finance')) intent = 'Home Loan';
    else if (combinedText.includes('decor') || combinedText.includes('interior')) intent = 'Interior Design';
    else if (combinedText.includes('legal') || combinedText.includes('agreement')) intent = 'Documentation';
    else if (combinedText.includes('manage') || combinedText.includes('rent out')) intent = 'Property Management';

    const baseEnq: Partial<CentralEnquiry> = {
      id: `enq-web-${Date.now()}`,
      customerName: name,
      mobile: phone || '+91 99999 99999',
      email,
      sourceCategory,
      sourceName,
      formName: `${sourceName} Public Widget`,
      landingPageUrl: window.location.href,
      referringUrl: document.referrer || 'http://google.com',
      utmSource: trackingParams.utmSource,
      utmMedium: trackingParams.utmMedium,
      utmCampaign: trackingParams.utmCampaign,
      deviceType: clientDetails.deviceType,
      browser: clientDetails.browser,
      os: clientDetails.os,
      createdAt: new Date().toISOString(),
      intent,
      timeline: journeyLogs,
      status: 'New',
      formResponses: {
        message,
        ...extraResponses
      }
    };

    // Auto router logic using CRM rules
    const routedCoors = routeEnquiryAutomatically(baseEnq, routingRules, agents);
    const completeEnquiry: CentralEnquiry = {
      ...baseEnq,
      ...routedCoors,
      status: 'New'
    } as CentralEnquiry;

    await unifiedDb.saveCentralEnquiry(completeEnquiry);
  };

  // Handle adding a client consultation inquiry from listings
  const handleAddConsultationInquiry = (newInquiry: Omit<Inquiry, 'id' | 'date' | 'status'>) => {
    const inquiry: Inquiry = {
      ...newInquiry,
      id: `inq-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'New'
    };
    unifiedDb.saveInquiry(inquiry);

    // Call unified central enquiry router
    handleRegistryCentralEnquiry(
      newInquiry.name,
      newInquiry.email,
      newInquiry.phone,
      newInquiry.message,
      'Website Form',
      'Property Enquiry Form',
      { propertyName: newInquiry.propertyName || 'General Portfolio Catalog' }
    );
  };

  // Handle dedicated "Talk to Expert" inquiry submission
  const handleAddTalkToExpertInquiry = (expertData: {
    propertyId?: string;
    propertyName?: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    preferredTime: string;
    contactMethod: 'Phone' | 'WhatsApp' | 'Email';
  }) => {
    const inquiry: Inquiry = {
      id: `inq-${Date.now()}`,
      name: expertData.name,
      email: expertData.email,
      phone: expertData.phone,
      message: expertData.message,
      preferredTime: expertData.preferredTime,
      contactMethod: expertData.contactMethod,
      propertyId: expertData.propertyId,
      propertyName: expertData.propertyName,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'New'
    };
    unifiedDb.saveInquiry(inquiry);

    // Call unified central enquiry router
    handleRegistryCentralEnquiry(
      expertData.name,
      expertData.email,
      expertData.phone,
      expertData.message,
      'Website Form',
      'Talk To Expert Form',
      { propertyName: expertData.propertyName || 'General Expert Advice Request' }
    );
  };

  // Update listings CRM status
  const handleUpdateInquiryStatus = (id: string, nextStatus: Inquiry['status']) => {
    const target = inquiries.find(i => i.id === id);
    if (target) {
      unifiedDb.saveInquiry({ ...target, status: nextStatus });
    }
  };

  // Delete inquiries
  const handleDeleteInquiry = (id: string) => {
    unifiedDb.deleteInquiry(id);
  };

  // Add Custom Requirements mandates from users
  const handleAddCustomRequirementStatus = (newReq: Omit<CustomRequirement, 'id' | 'status' | 'date'>) => {
    const newRequirement: CustomRequirement = {
      ...newReq,
      id: `req-${Date.now()}`,
      status: 'New',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    unifiedDb.saveRequirement(newRequirement);

    // Call unified central enquiry router
    handleRegistryCentralEnquiry(
      newReq.fullName,
      newReq.emailAddress || '',
      newReq.mobileNumber,
      newReq.message || '',
      'Website Form',
      'Property Requirement Form',
      { 
        budget: newReq.maxBudget,
        locations: newReq.preferredCity,
        lookingFor: newReq.lookingFor
      }
    );
  };

  // Update Custom Mandate stages inside Administrator crm dashboard
  const handleUpdateRequirementStatus = (id: string, nextStatus: CustomRequirement['status']) => {
    const target = customRequirements.find(r => r.id === id);
    if (target) {
      unifiedDb.saveRequirement({ ...target, status: nextStatus });
    }
  };

  // Delete custom mandates from admin workstation
  const handleDeleteRequirementStatus = (id: string) => {
    unifiedDb.deleteRequirement(id);
  };

  const scrollToListings = () => {
    setTimeout(() => {
      const el = listingsRef.current || document.getElementById('listings-scroll-target');
      if (el) {
        const elementPosition = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - 100,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleSelectLocation = (location: string) => {
    setSearchFilter((prev) => ({ ...prev, location }));
  };

  const handleSearchSubmit = (filters: { keyword: string; type: string; location: string; filter?: string }) => {
    setSearchFilter(filters);
    
    // Build and update the URL query parameters
    const params = new URLSearchParams();
    if (filters.type && filters.type !== 'All') {
      params.set('type', filters.type.toLowerCase());
    }
    if (filters.location && filters.location !== 'All') {
      params.set('location', filters.location.toLowerCase());
    }
    if (filters.keyword) {
      params.set('search', filters.keyword.toLowerCase());
    }
    if (filters.filter && filters.filter !== 'All') {
      params.set('filter', filters.filter.toLowerCase());
    }

    const queryString = params.toString();
    const targetUrl = `/properties${queryString ? '?' + queryString : ''}`;

    // Push states to history to synchronize
    window.history.pushState(null, '', targetUrl);
    try {
      window.dispatchEvent(new Event('popstate'));
    } catch (e) {
      const ev = document.createEvent('Event');
      ev.initEvent('popstate', true, true);
      window.dispatchEvent(ev);
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Inject sample direct inquiry for test CRM review
  const handleAddSampleInquiry = () => {
    const names = ['Evelyn Thorne', 'Gabriel Vance', 'Liam Sterling', 'Isabella Moss'];
    const emails = ['e.thorne@nexuscorp.com', 'gvance@aurora.dev', 'l.sterling@silver.co', 'moss@greentech.org'];
    const messages = [
      'Require warehouse clearances exceeding 10 meters for heavy automated lift-racks.',
      'Requesting dual garage structural blueprints on the modern seaside coastal estates.',
      'Can we schedule a 15-minute conference call with management regarding tax schedules?',
      'Interested in checking the smart heat-insulator shields for sustainable energy optimization.'
    ];
    const slots = ['Morning (9 AM - 12 PM)', 'Afternoon (12 PM - 4 PM)', 'Evening (4 PM - 7 PM)'];
    
    const prop = allProperties[Math.floor(Math.random() * allProperties.length)];

    const randomInq: Inquiry = {
      id: `inq-sample-${Date.now()}`,
      propertyName: prop.title,
      propertyId: prop.id,
      name: names[Math.floor(Math.random() * names.length)],
      email: emails[Math.floor(Math.random() * emails.length)],
      phone: `+1 (555) 000-${Math.floor(1000 + Math.random() * 9000)}`,
      message: messages[Math.floor(Math.random() * messages.length)],
      status: 'New',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      preferredTime: slots[Math.floor(Math.random() * slots.length)]
    };

    unifiedDb.saveInquiry(randomInq);
  };

  // Inject sample requirement for test CRM review
  const handleAddSampleRequirement = () => {
    const clients = ['Evelyn Thorne', 'Gabriel Vance', 'Liam Sterling', 'Arthur Pendelton'];
    const cities = ['California', 'Texas', 'Florida', 'New York'];
    const notes = [
      'Require direct road alignments and truck parking lanes. Prefer automated fence shields.',
      'Looking for modular coastal concrete pillars to support high water table levels.',
      'Must contain certified floor weights of over 400 lbs per square foot.'
    ];

    const randomReq: CustomRequirement = {
      id: `req-sample-${Date.now()}`,
      fullName: clients[Math.floor(Math.random() * clients.length)],
      mobileNumber: `+1 (555) 019-${Math.floor(1000 + Math.random() * 9000)}`,
      emailAddress: 'test.stakeholder@dvarix.gov',
      city: 'Miami',
      lookingFor: 'Buy',
      propertyType: 'Plot',
      preferredCity: cities[Math.floor(Math.random() * cities.length)],
      preferredArea: 'Eco Tech Park Zone',
      landmark: 'Power Grid Station',
      minBudget: '850,000',
      maxBudget: '2,900,000',
      plotSize: '2.5 Acres',
      bhkRequirement: 'None / N/A',
      readyToMove: 'Yes',
      loanRequired: 'No',
      amenities: ['Parking', 'Security'],
      timeline: 'Immediately',
      message: notes[Math.floor(Math.random() * notes.length)],
      status: 'New',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    unifiedDb.saveRequirement(randomReq);
  };

  return (
    <div className="min-h-screen bg-[#0a192f] text-slate-100 font-sans flex flex-col justify-between">
      
      {/* Sticky Top-level Header Navigation */}
      {activeTab !== 'Admin' && (
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          favoriteCount={favorites.length}
          onOpenFavorites={() => setIsFavoritesOpen(true)}
          onOpenCustomRequest={() => setIsCustomRequestOpen(true)}
          loggedInUser={loggedInUser}
          onLogout={() => {
            setLoggedInUser(null);
            localStorage.removeItem('dvarix_current_user');
            setActiveTab('Home');
          }}
        />
      )}

      {/* Primary Routing Dashboard */}
      <main className="flex-grow">
        {selectedLocationSlug ? (() => {
          const matchedLocation = (Object.values(mapLocations) as MapLocation[]).find(
            loc => (loc.slug && loc.slug.toLowerCase() === selectedLocationSlug.toLowerCase()) ||
                   (loc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === selectedLocationSlug.toLowerCase())
          );
          
          if (!matchedLocation) {
            return (
              <div className="py-24 text-center bg-slate-50 min-h-[60vh] flex flex-col justify-center items-center">
                <p className="text-slate-500 font-sans text-sm font-medium">Micro-Market region details not found.</p>
                <button onClick={handleBackToHomeMap} className="mt-4 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider hover:bg-sky-600 transition cursor-pointer shadow-md">
                  Return to Map Discovery
                </button>
              </div>
            );
          }
          
          return (
            <SaaSLocationDetailView
              location={matchedLocation as MapLocation}
              properties={properties}
              onBack={handleBackToHomeMap}
              onViewPropertyDetails={handleViewPropertyDetails}
              onOpenCustomRequest={() => setIsCustomRequestOpen(true)}
            />
          );
        })() : (
          <>
            {activeTab === 'Home' && (
          <div id="home-view-elements">
            {/* 1. Cinematic Hero Frame with interlocking Search block */}
            <Hero
              onSearch={handleSearchSubmit}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              onOpenCustomRequest={() => setIsCustomRequestOpen(true)}
              setActiveTab={setActiveTab}
              categories={categories}
              mapLocations={mapLocations}
              quickFilters={quickFilters}
              mapSettings={mapSettings}
              properties={properties}
              onViewProperty={handleViewPropertyDetails}
              siteSettings={siteSettings}
            />

            {/* 2. Structured Line Categories representation */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.75, ease: "easeOut" }}
            >
              <PropertyTypes
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                scrollToListings={scrollToListings}
                properties={properties}
                categories={categories}
              />
            </motion.div>

            {/* 3. Developments Grid listings scroll anchor */}
            <div ref={listingsRef} id="listings-scroll-target">
              <motion.div
                initial={{ opacity: 0, y: 45 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <PropertyListings
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  searchFilter={searchFilter}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  onViewDetails={handleViewPropertyDetails}
                  properties={properties}
                  categories={categories}
                  onViewAllProperties={() => {
                    setActiveTab('Properties');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </motion.div>
            </div>

            {/* Location Discovery Section (empty placeholder section) */}
            <div id="location-discovery-section" className="hidden" title="Location Discovery Section" />

            {/* 4. Explore Opportunities by Location */}
            <motion.div
              initial={{ opacity: 0, y: 45 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <ExploreOpportunities
                mapLocations={mapLocations}
                mapSettings={mapSettings}
                properties={properties}
                onViewDetails={handleViewPropertyDetails}
                onOpenCustomRequest={() => setIsCustomRequestOpen(true)}
                setSearchFilter={setSearchFilter}
                scrollToListings={scrollToListings}
                onNavigateToLocation={handleNavigateToLocation}
              />
            </motion.div>

            {/* 5. Rich home details panels: Why trust us, steps, investments, testimonials, faqs, ctas */}
            <motion.div
              initial={{ opacity: 0, y: 45 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.82, ease: "easeOut" }}
            >
              <HomeDetailsSections
                onOpenCustomRequest={() => setIsCustomRequestOpen(true)}
                setActiveTab={setActiveTab}
                faqs={faqs}
                siteSettings={siteSettings}
                onSelectArticleSlug={(slug) => {
                  setSelectedArticleSlug(slug);
                  setActiveTab('Insights');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </motion.div>
          </div>
        )}

        {activeTab === 'Properties' && (
          <PropertiesPageView
            properties={properties}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            onViewDetails={handleViewPropertyDetails}
            onOpenCustomRequest={() => setIsCustomRequestOpen(true)}
            onOpenSiteVisit={() => setIsSiteVisitBookingOpen(true)}
            onOpenTalkToExpert={(prop) => {
              setTalkToExpertProperty(prop);
              setIsTalkToExpertOpen(true);
            }}
            setBookingTargetProperty={setBookingTargetProperty}
            searchCategories={searchCategories}
            siteSettings={siteSettings}
            heroBanners={heroBanners}
          />
        )}

        {activeTab === 'PropertyDetail' && (
          <PremiumPropertyDetailView
            property={selectedProperty}
            properties={properties}
            onBack={() => {
              setSelectedProperty(null);
              setActiveTab('Properties');
            }}
            setActiveTab={setActiveTab}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            onOpenCustomRequest={() => setIsCustomRequestOpen(true)}
            onBookSiteVisit={(prop) => {
              setBookingTargetProperty(prop);
              setIsSiteVisitBookingOpen(true);
            }}
          />
        )}

        {activeTab === 'Admin' && (
          authLoading ? (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 space-y-6">
              <Logo size="lg" hideText={false} />
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C89B3C]"></div>
                <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Verifying Portal Authentication Credentials...</p>
              </div>
            </div>
          ) : (
            // CRM dashboard view allows modifying listing stages and mock responses!
            <InquiryDashboard
            inquiries={inquiries}
            customRequirements={customRequirements}
            onAddRequirement={handleAddCustomRequirementStatus}
            mapSettings={mapSettings}
            heroBanners={heroBanners}
            useFirebase={useFirebase}
            setUseFirebase={setUseFirebase}
            onUpdateMapSettings={(newSettings) => {
              unifiedDb.saveMapSettings(newSettings);
              setMapSettings(newSettings);
            }}
            onUpdateStatus={handleUpdateInquiryStatus}
            onDeleteInquiry={handleDeleteInquiry}
            onUpdateRequirementStatus={handleUpdateRequirementStatus}
            onDeleteRequirement={handleDeleteRequirementStatus}
            onAddSampleInquiry={handleAddSampleInquiry}
            onAddSampleRequirement={handleAddSampleRequirement}
            properties={properties}
            setProperties={async (newProperties) => {
              try {
                const oldIds = properties.map(p => p.id);
                const newIds = newProperties.map(p => p.id);
                
                const toDelete = oldIds.filter(id => !newIds.includes(id));
                for (const id of toDelete) {
                  await unifiedDb.deleteProperty(id);
                }

                const toSave = newProperties.filter(newP => {
                  const oldP = properties.find(p => p.id === newP.id);
                  if (!oldP) return true;
                  return JSON.stringify(oldP) !== JSON.stringify(newP);
                });

                for (const p of toSave) {
                  await unifiedDb.saveProperty(p);
                }

                setProperties(newProperties);

                if (toSave.length > 0 || toDelete.length > 0) {
                  window.dispatchEvent(new CustomEvent('cms-alert-notification', {
                    detail: {
                      title: "Database Sync Success",
                      message: `Successfully synchronized catalog directly to production database (${toSave.length} saved, ${toDelete.length} purged).`,
                      category: "Properties",
                      timestamp: new Date().toISOString()
                    }
                  }));
                }
              } catch (err: any) {
                console.error("Failed to commit property changes to production database:", err);
                window.dispatchEvent(new CustomEvent('cms-alert-notification', {
                  detail: {
                    title: "Database Server Connection Error",
                    message: `Failed to register property changes: ${err?.message || String(err)}. Check connection metrics, rules, or firestore logs.`,
                    category: "Properties",
                    isError: true,
                    timestamp: new Date().toISOString()
                  }
                }));
              }
            }}
            categories={categories}
            setCategories={(newCategories) => {
              const oldIds = categories.map(c => c.id);
              const newIds = newCategories.map(c => c.id);
              oldIds.forEach(id => {
                if (!newIds.includes(id)) {
                  unifiedDb.deleteCategory(id);
                }
              });
              newCategories.forEach(cat => {
                unifiedDb.saveCategory(cat);
              });
              setCategories(newCategories);
            }}
            searchCategories={searchCategories}
            setSearchCategories={(newSearchCategories) => {
              const oldIds = searchCategories.map(c => c.id);
              const newIds = newSearchCategories.map(c => c.id);
              oldIds.forEach(id => {
                if (!newIds.includes(id)) {
                  unifiedDb.deleteSearchCategory(id);
                }
              });
              newSearchCategories.forEach(cat => {
                unifiedDb.saveSearchCategory(cat);
              });
              setSearchCategories(newSearchCategories);
            }}
            agents={agents}
            setAgents={(newAgents) => {
              const oldIds = agents.map(a => a.id);
              const newIds = newAgents.map(a => a.id);
              oldIds.forEach(id => {
                if (!newIds.includes(id)) {
                  unifiedDb.deleteAgent(id);
                }
              });
              newAgents.forEach(ag => {
                unifiedDb.saveAgent(ag);
              });
              setAgents(newAgents);
            }}
            mapLocations={mapLocations}
            setMapLocations={(newMapLocations) => {
              const oldNames = Object.keys(mapLocations);
              const newNames = Object.keys(newMapLocations);
              oldNames.forEach(name => {
                if (!newNames.includes(name)) {
                  unifiedDb.deleteMapLocation(name);
                }
              });
              newNames.forEach(name => {
                unifiedDb.saveMapLocation(newMapLocations[name]);
              });
              setMapLocations(newMapLocations);
            }}
            faqs={faqs}
            loggedInUser={loggedInUser}
            setLoggedInUser={(u) => {
              setLoggedInUser(u);
              if (u === null) {
                localStorage.removeItem('dvarix_current_user');
              } else {
                localStorage.setItem('dvarix_current_user', JSON.stringify(u));
              }
            }}
            adminUsers={adminUsers}
            setAdminUsers={(list) => {
              const oldIds = adminUsers.map(u => u.id);
              const newIds = list.map(u => u.id);
              oldIds.forEach(id => {
                if (!newIds.includes(id)) {
                  unifiedDb.deleteAdminUser(id);
                }
              });
              list.forEach(u => {
                unifiedDb.saveAdminUser(u);
              });
              setAdminUsers(list);
            }}
            quickFilters={quickFilters}
            setQuickFilters={(newFilters) => {
              const oldIds = quickFilters.map(f => f.id);
              const newIds = newFilters.map(f => f.id);
              oldIds.forEach(id => {
                if (!newIds.includes(id)) {
                  unifiedDb.deleteQuickFilter(id);
                }
              });
              newFilters.forEach(f => {
                unifiedDb.saveQuickFilter(f);
              });
              setQuickFilters(newFilters);
            }}
            siteSettings={siteSettings}
            setSiteSettings={(newSettings) => {
              unifiedDb.saveSiteSettings(newSettings);
              setSiteSettings(newSettings);
            }}
          />
          )
        )}

        {activeTab === 'About' && (
          <AboutPageView 
            setActiveTab={setActiveTab} 
            onOpenCustomRequest={() => setIsCustomRequestOpen(true)} 
          />
        )}

        {activeTab === 'PrivacyPolicy' && (
          <PrivacyPolicyView setActiveTab={setActiveTab} />
        )}

        {activeTab === 'Terms' && (
          <TermsConditionsView setActiveTab={setActiveTab} />
        )}

        {activeTab === '404' && (
          <div className="min-h-screen bg-[#071322] flex flex-col items-center justify-center text-center px-6 py-24 select-none relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-[#FF8C00]/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10 max-w-lg space-y-8">
              <div className="inline-flex items-center justify-center p-4 bg-[#FF8C00]/10 rounded-full text-[#FF8C00] animate-bounce">
                <XCircle className="w-16 h-16" strokeWidth={1.5} />
              </div>
              
              <div className="space-y-3">
                <h1 className="text-7xl font-sans font-black text-white tracking-tighter">404</h1>
                <h2 className="text-xl font-sans font-semibold text-slate-200 tracking-tight">Property or Page Not Found</h2>
                <p className="text-slate-400 text-xs font-light leading-relaxed max-w-sm mx-auto">
                  The real estate listing, compliance form, or advisory resource you are searching for is unavailable or has been relocated.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <button
                  onClick={() => {
                    setActiveTab('Home');
                    window.history.pushState(null, '', '/');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-[#FF8C00] to-[#FF5A3C] hover:from-[#ff961f] hover:to-[#ff6d51] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md cursor-pointer"
                >
                  Return to Homepage
                </button>
                <button
                  onClick={() => {
                    setActiveTab('Properties');
                    window.history.pushState(null, '', '/properties');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3 border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer"
                >
                  Explore Properties
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Insights' && (
          <BlogArticlePage
            selectedArticleSlug={selectedArticleSlug}
            siteSettings={siteSettings}
            setSiteSettings={(newSettings) => {
              firebaseService.saveSiteSettings(newSettings);
              setSiteSettings(newSettings);
            }}
            onBack={() => {
              setActiveTab('Home');
              setSelectedArticleSlug(null);
            }}
            onNavigateToArticle={(slug) => {
              setSelectedArticleSlug(slug);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'Contact' && (
          <div className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 text-slate-900" id="contact-view-elements">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 text-left">
              
              {/* Left Contact coordinates column (5 columns) */}
              <div className="md:col-span-12 lg:col-span-5 space-y-8">
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-widest text-[#ff5a3c] font-black font-mono">DVARIx OFFICES</span>
                  <h2 className="text-3xl font-sans font-extrabold text-[#0a192f] tracking-tight">Get in Touch</h2>
                  <p className="text-slate-500 text-xs font-light leading-relaxed">
                    Contact the administrative desk directly for asset submissions, real estate partner filings, or licensing queries.
                  </p>
                </div>

                <div className="space-y-4 font-mono text-xs font-semibold text-slate-700">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-[#ff5a3c] shrink-0" />
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Headquarters</span>
                      <p className="text-sm font-sans font-bold text-slate-800 mt-1">Dvarix Realty Corporate Hub, JP Nagar, Bangalore, India</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-[#ff5a3c] shrink-0" />
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Business Hours</span>
                      <p className="text-xs font-sans font-medium text-slate-600 mt-1">Mon - Sat: 9 AM - 7 PM IST</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-[#ff5a3c] shrink-0" />
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Appraisal Requests</span>
                      <a href="mailto:dvarixrealty@gmail.com" className="text-sm font-semibold text-[#ff5a3c] underline mt-1 block">dvarixrealty@gmail.com</a>
                    </div>
                  </div>
                </div>

                {/* Styled placeholder graphics for a vector map */}
                <div className="bg-[#0a192f] text-slate-400 p-6 rounded-2xl space-y-4 border border-slate-900 shadow-inner select-none relative overflow-hidden h-44 flex flex-col justify-between">
                  <div className="absolute inset-0 opacity-15">
                    <div className="w-full h-full bg-radial-at-c from-slate-500 via-transparent to-transparent"></div>
                    {/* Retro line layout */}
                    <div className="absolute left-6 top-0 w-0.5 h-full bg-slate-400"></div>
                    <div className="absolute left-20 top-0 w-0.5 h-full bg-slate-400"></div>
                    <div className="absolute left-40 top-0 w-0.5 h-full bg-slate-400"></div>
                    <div className="absolute left-0 top-12 w-full h-0.5 bg-slate-400"></div>
                    <div className="absolute left-0 top-24 w-full h-0.5 bg-slate-400"></div>
                  </div>
                  <div className="relative z-10 flex items-center space-x-2">
                    <div className="p-1.5 bg-[#ff5a3c] text-white rounded-lg">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-200 font-bold">JP Nagar Corporate Grid</span>
                  </div>
                  <span className="text-xs font-mono font-light text-slate-400 block relative z-10">
                    📍 LOCATED AT COORDINATES:<br />
                    LATITUDE: 12.906300° N<br />
                    LONGITUDE: 77.585700° E
                  </span>
                </div>
              </div>

              {/* Consultation / Inquiries submission form */}
              <div className="md:col-span-12 lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-sans font-bold text-[#0a192f] tracking-tight">Direct portal Inquiry</h3>
                  <p className="text-slate-500 text-xs font-sans leading-relaxed">
                    Leave your contact credentials and details brief below. Submissions automatically record inside our Admin Panel ledger.
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {contactSuccess ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center space-y-3"
                    >
                      <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto animate-bounce" />
                      <h4 className="font-sans font-extrabold text-emerald-800 text-sm">Records Saved Successfully!</h4>
                      <p className="text-xs text-emerald-700 leading-relaxed font-sans">
                        Excellent, your direct inquiry was received. A system dispatch has logged this lead inside the secured <strong>Admin Porta Logs</strong>.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formName = (e.target as any).elements.nameInput.value;
                      const formEmail = (e.target as any).elements.emailInput.value;
                      const formMsg = (e.target as any).elements.msgInput.value;
                      
                      const contactInquiry: Inquiry = {
                        id: `inq-contact-${Date.now()}`,
                        name: formName,
                        email: formEmail,
                        phone: '+91 99999 12345',
                        message: formMsg,
                        status: 'New',
                        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        preferredTime: 'Anytime Business Hours'
                      };
                      firebaseService.saveInquiry(contactInquiry);

                      // unified central enquiry pipeline record save
                      handleRegistryCentralEnquiry(
                        formName,
                        formEmail,
                        '+91 99999 12345',
                        formMsg,
                        'Website Form',
                        'Contact Us Form'
                      );

                      setContactSuccess(true);
                      (e.target as HTMLFormElement).reset();
                      setTimeout(() => setContactSuccess(false), 4500);
                    }} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Your Name</label>
                          <input
                            type="text"
                            required
                            name="nameInput"
                            placeholder="Your Name"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Your Email</label>
                          <input
                            type="email"
                            required
                            name="emailInput"
                            placeholder="name@company.com"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Brief / Description</label>
                        <textarea
                          rows={6}
                          required
                          name="msgInput"
                          placeholder="State details about what projects you would like appraised, custom developments ideas, or scheduling questions..."
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl p-4 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c] resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="bg-[#ff5a3c] hover:bg-[#e04326] text-white px-6 py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-950/20 transition cursor-pointer"
                      >
                        Submit Consultation Request
                      </button>
                    </form>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        )}
          </>
        )}
      </main>

      {/* FOOTER */}
      {activeTab !== 'Admin' && (
        <Footer 
          activeTab={activeTab}
          setActiveTab={setActiveTab} 
          scrollToListings={scrollToListings} 
          siteSettings={siteSettings}
          onOpenCustomRequest={() => setIsCustomRequestOpen(true)}
          setSearchFilter={setSearchFilter}
        />
      )}

      {/* LIGHTBOX / MODALS */}
      
      {/* 1. Property Details focus Lightbox */}
      {activeTab !== 'PropertyDetail' && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onAddInquiry={handleAddConsultationInquiry}
          onBookSiteVisit={(prop) => {
            setBookingTargetProperty(prop);
            setIsSiteVisitBookingOpen(true);
            setSelectedProperty(null); // Hide detail popover
          }}
        />
      )}

      {/* 2. Custom Requirement detailed registration form */}
      <CustomRequestModal
        isOpen={isCustomRequestOpen}
        onClose={() => setIsCustomRequestOpen(false)}
        onSubmit={handleAddCustomRequirementStatus}
        onBookSiteVisitClick={(prefilled) => {
          setSiteVisitPrefilled(prefilled);
          setBookingTargetProperty(null);
          setIsSiteVisitBookingOpen(true);
          setIsCustomRequestOpen(false);
        }}
      />

      {/* 2.5 Dedicated Site Visit booking form modal */}
      <SiteVisitBookingModal
        isOpen={isSiteVisitBookingOpen}
        onClose={() => {
          setIsSiteVisitBookingOpen(false);
          setBookingTargetProperty(null);
          setSiteVisitPrefilled(null);
        }}
        selectedProperty={bookingTargetProperty}
        prefilledData={siteVisitPrefilled}
      />

      {/* 2.6 Dedicated Talk to Expert inquiry form modal */}
      <TalkToExpertModal
        isOpen={isTalkToExpertOpen}
        onClose={() => {
          setIsTalkToExpertOpen(false);
          setTalkToExpertProperty(null);
        }}
        selectedProperty={talkToExpertProperty}
        onSubmitInquiry={(data) => {
          handleAddTalkToExpertInquiry(data);
          setIsTalkToExpertOpen(false);
          setTalkToExpertProperty(null);
        }}
      />

      {/* 3. Favorites shortlisted properties slideout drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favoritesList={favoritesList}
        onRemoveFavorite={toggleFavorite}
        onViewProperty={handleViewPropertyDetails}
        onClearAll={clearAllFavorites}
      />

      {/* 4. Smart Interactive Conversational Requirement Chatbot */}
      <RealtyChatbot
        onAddRequirement={handleAddCustomRequirementStatus}
        onOpenCustomRequestForm={() => setIsCustomRequestOpen(true)}
        properties={properties}
        faqs={faqs}
      />

      {/* 5. Luxury Toast Notification overlay stack */}
      <div className="fixed top-24 right-4 sm:right-6 z-[100] max-w-sm w-[92vw] sm:w-80 space-y-3 pointer-events-none" id="luxury-toast-stack">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              className={`p-4 rounded-xl border pointer-events-auto shadow-lg flex items-start gap-3 backdrop-blur-md ${
                toast.isError
                  ? 'bg-rose-950/90 border-rose-800 text-rose-100 shadow-rose-950/20'
                  : 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-slate-950/30'
              }`}
            >
              {toast.isError ? (
                <div className="p-1.5 bg-rose-500/20 rounded-lg text-rose-400 mt-0.5 shrink-0">
                  <XCircle className="w-4 h-4" />
                </div>
              ) : (
                <div className="p-1.5 bg-[#ff5a3c]/15 rounded-lg text-[#ff5a3c] mt-0.5 shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}
              <div className="flex-1 text-left space-y-0.5">
                {toast.category && (
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">
                    {toast.category}
                  </span>
                )}
                <h5 className="text-xs font-bold leading-tight tracking-tight text-white">{toast.title}</h5>
                <p className="text-[11px] text-slate-300 font-light leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-slate-400 hover:text-white shrink-0 mt-0.5 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 6. Prominent Floating Emergency DB Rollback Console */}
      <div className="fixed bottom-6 left-6 z-[99] max-w-sm font-sans pointer-events-none">
        <div className="pointer-events-auto">
          <AnimatePresence>
            {isDbConsoleOpen ? (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="bg-slate-900 border border-amber-500/40 p-4 rounded-2xl shadow-xl w-72 space-y-3 text-left text-xs text-slate-100"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
                    <span className="font-extrabold text-[10px] uppercase tracking-widest text-slate-300 font-mono">DB Emergency HUD</span>
                  </div>
                  <button
                    onClick={() => setIsDbConsoleOpen(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Connection Integrity</p>
                  <p className="text-[11px] text-slate-200 leading-relaxed font-light">
                    Switch entire application traffic flow between Hostinger MySQL and Firebase Firestore instantly.
                  </p>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 font-mono text-[10px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">PRIMARY (MySQL):</span>
                    <span className={useFirebase ? "text-slate-400" : "text-emerald-400 font-bold"}>
                      {useFirebase ? "STANDBY" : "CONNECTED"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">ROLLBACK (Firebase):</span>
                    <span className={useFirebase ? "text-amber-400 font-bold animate-pulse" : "text-slate-400"}>
                      {useFirebase ? "HOT ACTIVE" : "STANDBY"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const nextVal = !useFirebase;
                    setUseFirebase(nextVal);
                    // Add a toast
                    const toastId = Date.now();
                    setToasts(prev => [
                      ...prev,
                      {
                        id: toastId,
                        title: nextVal ? "Rollback Active" : "MySQL Connected",
                        message: nextVal 
                          ? "Switched primary data engine to Firebase Firestore." 
                          : "Restored primary data engine to Hostinger MySQL Database.",
                        isError: nextVal,
                        category: "SYSTEM"
                      }
                    ]);
                  }}
                  className={`w-full py-2 px-3 rounded-lg font-bold font-mono text-[10px] uppercase tracking-wider transition-colors duration-250 cursor-pointer ${
                    useFirebase 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                      : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                  }`}
                >
                  {useFirebase ? "⚡ Switch to MySQL Primary" : "⚠️ Toggle Firebase Rollback"}
                </button>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setIsDbConsoleOpen(true)}
                className={`flex items-center space-x-2 py-2 px-3 rounded-full border shadow-lg transition-all duration-300 cursor-pointer text-[10px] font-bold font-mono uppercase tracking-widest ${
                  useFirebase 
                    ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse font-bold' 
                    : 'bg-slate-900 text-slate-100 border-slate-700 hover:border-slate-500 font-bold'
                }`}
              >
                <Shield className="h-3.5 w-3.5 text-[#C89B3C]" />
                <span>DB Engine: {useFirebase ? "Rollback" : "MySQL"}</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
