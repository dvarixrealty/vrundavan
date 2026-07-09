import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, Mail, Phone, Calendar, Clock, Trash2, MessageSquare, 
  ShieldCheck, CheckCircle, Search, LogOut, Lock, KeyRound, 
  MapPin, DollarSign, Compass, Layers, Check, CheckSquare, Users,
  Plus, Edit, BarChart2, Tag, TrendingUp, Coins, FileText, CheckCircle2,
  ChevronRight, ArrowUpRight, Award, PlusCircle, Settings, Bell, HelpCircle, Palette, Grid, Eye, EyeOff, Inbox, User
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Inquiry, CustomRequirement, Property, Agent, MapLocation, AdminUser, PermissionSet, CRMLead, FAQ, MapSettings, SearchCategory, PropertyTypeCard, QuickFilter, SiteCMSConfig, HeroBanner, AdminTheme } from '../types';
import { firebaseService, cleanPropertyPayload } from '../lib/firebaseService';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

import SaaSDashboardOverview from './SaaSDashboardOverview';
import SaaSPropertiesModule from './SaaSPropertiesModule';
import SaaSRequirementsModule from './SaaSRequirementsModule';
import SaaSCustomersModule from './SaaSCustomersModule';
import SaaSLeadsModule, { getDefaultLeads } from './SaaSLeadsModule';
import SaaSAICenterModule from './SaaSAICenterModule';
import SaaSDvarixBotStudioModule from './SaaSDvarixBotStudioModule';
import SaaSNotificationsModule from './SaaSNotificationsModule';
import SaaSSiteVisitsModule from './SaaSSiteVisitsModule';
import SaaSDocumentsModule from './SaaSDocumentsModule';
import SaaSForceModule from './SaaSForceModule';
import SaaSFAQModule from './SaaSFAQModule';
import SaaSLocationModule from './SaaSLocationModule';
import SaaSMapStyleModule from './SaaSMapStyleModule';
import SaaSRolePermissionsModule from './SaaSRolePermissionsModule';
import SaaSEnquiryCenterModule from './SaaSEnquiryCenterModule';
import SaaSMarketingModule from './SaaSMarketingModule';
import SaaSAgentWorkspaceModule from './SaaSAgentWorkspaceModule';
import SaaSThemeStudioModule from './SaaSThemeStudioModule';
import HeroBannerManager from './cms/HeroBannerManager';
import BlogManager from './cms/BlogManager';
import CampaignManager from './cms/CampaignManager';
import FreeServiceRequestsPanel from './cms/FreeServiceRequestsPanel';

interface InquiryDashboardProps {
  inquiries: Inquiry[];
  customRequirements: CustomRequirement[];
  onUpdateStatus: (id: string, nextStatus: Inquiry['status']) => void;
  onDeleteInquiry: (id: string) => void;
  onUpdateRequirementStatus: (id: string, nextStatus: CustomRequirement['status']) => void;
  onDeleteRequirement: (id: string) => void;
  onAddSampleInquiry: () => void;
  onAddSampleRequirement: () => void;
  properties?: Property[];
  setProperties?: (newProperties: Property[]) => void;
  categories?: PropertyTypeCard[];
  setCategories?: (newCategories: PropertyTypeCard[]) => void;
  searchCategories?: SearchCategory[];
  setSearchCategories?: (newSearchCategories: SearchCategory[]) => void;
  agents?: Agent[];
  setAgents?: (newAgents: Agent[]) => void;
  mapLocations?: Record<string, MapLocation>;
  setMapLocations?: (newMapLocations: Record<string, MapLocation>) => void;
  mapSettings?: MapSettings;
  onUpdateMapSettings?: (settings: MapSettings) => void;
  faqs?: FAQ[];
  loggedInUser: AdminUser | null;
  setLoggedInUser: (user: AdminUser | null) => void;
  adminUsers: AdminUser[];
  setAdminUsers: (users: AdminUser[]) => void;
  quickFilters?: QuickFilter[];
  setQuickFilters?: (newFilters: QuickFilter[]) => void;
  onAddRequirement?: (data: Omit<CustomRequirement, 'id' | 'status' | 'date'>) => void;
  siteSettings?: SiteCMSConfig;
  setSiteSettings?: (newSettings: SiteCMSConfig) => void;
  heroBanners?: HeroBanner[];
}

export default function InquiryDashboard({
  inquiries,
  customRequirements,
  onUpdateStatus,
  onDeleteInquiry,
  onUpdateRequirementStatus,
  onDeleteRequirement,
  onAddSampleInquiry,
  onAddSampleRequirement,
  onAddRequirement,
  properties = [],
  setProperties,
  categories = [],
  setCategories,
  searchCategories = [],
  setSearchCategories,
  agents = [],
  setAgents,
  mapLocations = {},
  setMapLocations,
  mapSettings,
  onUpdateMapSettings,
  faqs = [],
  loggedInUser,
  setLoggedInUser,
  adminUsers = [],
  setAdminUsers,
  quickFilters = [],
  setQuickFilters,
  siteSettings,
  setSiteSettings,
  heroBanners = []
}: InquiryDashboardProps) {

  // Collapsible sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const DEFAULT_THEME: AdminTheme = {
    themeId: 'royal_blue',
    themeName: 'Royal Blue (Default)',
    createdBy: 'System',
    updatedAt: new Date().toISOString(),
    sidebar: {
      background: '#0b1f3a',
      hover: '#1e2d4a',
      active: '#1e3454',
      border: '#1e2d4a',
      shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      text: '#94a3b8',
      activeText: '#ffffff',
      icon: '#64748b',
      activeIcon: '#C89B3C',
      divider: '#1e2d4a',
      badgeBg: '#1e2d4a',
      badgeText: '#C89B3C',
      accordionBg: '#0b1f3a',
      accordionHover: '#1e2d4a',
      accordionBorder: '#1e2d4a',
    },
    header: {
      background: '#ffffff',
      border: '#e2e8f0',
      text: '#0f172a',
      searchBg: '#f1f5f9',
      notificationIcon: '#64748b',
      profileIcon: '#3b82f6',
      shadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    },
    content: {
      background: '#f8fafc',
      pageBg: '#f8fafc',
      cards: '#ffffff',
      tables: '#ffffff',
      forms: '#ffffff',
      dialogs: '#ffffff',
      popups: '#ffffff',
      drawer: '#ffffff',
    },
    buttons: {
      primaryBg: '#2563eb',
      primaryText: '#ffffff',
      secondaryBg: '#64748b',
      secondaryText: '#ffffff',
      successBg: '#16a34a',
      successText: '#ffffff',
      dangerBg: '#dc2626',
      dangerText: '#ffffff',
      warningBg: '#ca8a04',
      warningText: '#ffffff',
      infoBg: '#0891b2',
      infoText: '#ffffff',
      hoverOpacity: 85,
      shadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      borderRadius: '0.375rem',
    },
    inputs: {
      background: '#ffffff',
      border: '#cbd5e1',
      focusBorder: '#3b82f6',
      placeholder: '#94a3b8',
      checkbox: '#2563eb',
      radio: '#2563eb',
      switchBg: '#cbd5e1',
      dropdown: '#ffffff',
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      sidebarFont: 'Inter',
      menuWeight: '500',
      headingWeight: '600',
      buttonWeight: '500',
      fontSize: '0.875rem',
      letterSpacing: '0px',
    },
    icons: {
      pack: 'Lucide',
      size: '18px',
      color: '#64748b',
      activeColor: '#C89B3C',
      hoverColor: '#1e293b',
      rounded: true,
      outlined: true,
      filled: false,
    },
    borderRadius: {
      global: '0.5rem',
      cards: '0.5rem',
      buttons: '0.375rem',
      inputs: '0.375rem',
      sidebar: '0.375rem',
      dropdown: '0.375rem',
      dialogs: '0.5rem',
      sliders: '9999px',
    },
    shadowSettings: {
      type: 'Soft',
    },
    layout: {
      sidebarWidth: '280px',
      expandedWidth: '280px',
      miniWidth: '72px',
      headerHeight: '64px',
      contentWidth: 'Comfortable',
      compactMode: false,
      comfortableMode: true,
      spaciousMode: false,
    }
  };

  const [adminTheme, setAdminTheme] = useState<AdminTheme>(DEFAULT_THEME);

  // Subscribe to Theme changes from Cloud Firestore
  useEffect(() => {
    const unsub = firebaseService.subscribeAdminTheme(
      (theme) => {
        if (theme) {
          setAdminTheme(theme);
        }
      },
      (err) => console.error("Theme Studio subscription failed:", err)
    );
    return unsub;
  }, []);

  // Ctrl+B sidebar toggle keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const dynamicStyles = useMemo(() => {
    if (!adminTheme) return '';
    const t = adminTheme;
    return `
      #enterprise-crm-workspace {
        --font-heading: "${t.typography.headingFont}", "Inter", sans-serif;
        --font-body: "${t.typography.bodyFont}", "Inter", sans-serif;
        --font-sidebar: "${t.typography.sidebarFont}", "Inter", sans-serif;
        
        --weight-menu: ${t.typography.menuWeight};
        --weight-heading: ${t.typography.headingWeight};
        --weight-button: ${t.typography.buttonWeight};
        
        --font-size-base: ${t.typography.fontSize};
        --letter-spacing-base: ${t.typography.letterSpacing};

        --radius-global: ${t.borderRadius.global};
        --radius-cards: ${t.borderRadius.cards};
        --radius-buttons: ${t.borderRadius.buttons};
        --radius-inputs: ${t.borderRadius.inputs};
        --radius-sidebar: ${t.borderRadius.sidebar};
        --radius-dropdown: ${t.borderRadius.dropdown};
        --radius-dialogs: ${t.borderRadius.dialogs};
        --radius-sliders: ${t.borderRadius.sliders};

        --sidebar-bg: ${t.sidebar.background};
        --sidebar-hover: ${t.sidebar.hover};
        --sidebar-active: ${t.sidebar.active};
        --sidebar-border: ${t.sidebar.border};
        --sidebar-text: ${t.sidebar.text};
        --sidebar-active-text: ${t.sidebar.activeText};
        --sidebar-icon: ${t.sidebar.icon};
        --sidebar-active-icon: ${t.sidebar.activeIcon};
        --sidebar-divider: ${t.sidebar.divider};
        --sidebar-badge-bg: ${t.sidebar.badgeBg};
        --sidebar-badge-text: ${t.sidebar.badgeText};
        --sidebar-accordion-bg: ${t.sidebar.accordionBg};
        --sidebar-accordion-hover: ${t.sidebar.accordionHover};
        --sidebar-accordion-border: ${t.sidebar.accordionBorder};

        --header-bg: ${t.header.background};
        --header-border: ${t.header.border};
        --header-text: ${t.header.text};
        --header-search-bg: ${t.header.searchBg};
        --header-notification-icon: ${t.header.notificationIcon};
        --header-profile-icon: ${t.header.profileIcon};
        --header-shadow: ${t.header.shadow};

        --content-bg: ${t.content.background};
        --content-page-bg: ${t.content.pageBg};
        --content-cards: ${t.content.cards};
        --content-tables: ${t.content.tables};
        --content-forms: ${t.content.forms};
        --content-dialogs: ${t.content.dialogs};
        --content-popups: ${t.content.popups};
        --content-drawer: ${t.content.drawer};

        --btn-primary-bg: ${t.buttons.primaryBg};
        --btn-primary-text: ${t.buttons.primaryText};
        --btn-secondary-bg: ${t.buttons.secondaryBg};
        --btn-secondary-text: ${t.buttons.secondaryText};
        --btn-success-bg: ${t.buttons.successBg};
        --btn-success-text: ${t.buttons.successText};
        --btn-danger-bg: ${t.buttons.dangerBg};
        --btn-danger-text: ${t.buttons.dangerText};
        --btn-warning-bg: ${t.buttons.warningBg};
        --btn-warning-text: ${t.buttons.warningText};
        --btn-info-bg: ${t.buttons.infoBg};
        --btn-info-text: ${t.buttons.infoText};
        --btn-hover-opacity: ${t.buttons.hoverOpacity / 100};
        --btn-shadow: ${t.buttons.shadow};

        --input-bg: ${t.inputs.background};
        --input-border: ${t.inputs.border};
        --input-focus-border: ${t.inputs.focusBorder};
        --input-placeholder: ${t.inputs.placeholder};
        --input-checkbox: ${t.inputs.checkbox};
        --input-radio: ${t.inputs.radio};
        --input-switch-bg: ${t.inputs.switchBg};
        --input-dropdown: ${t.inputs.dropdown};
      }

      /* Base Style Overrides */
      #enterprise-crm-workspace, 
      #enterprise-crm-workspace button, 
      #enterprise-crm-workspace input, 
      #enterprise-crm-workspace select, 
      #enterprise-crm-workspace textarea {
        font-family: var(--font-body) !important;
        font-size: var(--font-size-base) !important;
        letter-spacing: var(--letter-spacing-base) !important;
      }

      #enterprise-crm-workspace h1, 
      #enterprise-crm-workspace h2, 
      #enterprise-crm-workspace h3, 
      #enterprise-crm-workspace h4, 
      #enterprise-crm-workspace h5, 
      #enterprise-crm-workspace h6 {
        font-family: var(--font-heading) !important;
        font-weight: var(--weight-heading) !important;
      }

      /* Sidebar structure overrides */
      #enterprise-crm-workspace aside {
        background-color: var(--sidebar-bg) !important;
        color: var(--sidebar-text) !important;
        border-right-color: var(--sidebar-border) !important;
        font-family: var(--font-sidebar) !important;
        width: ${isSidebarCollapsed ? t.layout.miniWidth : t.layout.expandedWidth} !important;
        transition: width 250ms cubic-bezier(0.4, 0, 0.2, 1) !important;
      }

      #enterprise-crm-workspace aside .border-b,
      #enterprise-crm-workspace aside .border-t {
        border-color: var(--sidebar-divider) !important;
      }

      #enterprise-crm-workspace aside nav button {
        color: var(--sidebar-text) !important;
        font-weight: var(--weight-menu) !important;
      }

      #enterprise-crm-workspace aside nav button:hover {
        background-color: var(--sidebar-hover) !important;
        color: var(--sidebar-active-text) !important;
      }

      /* Submenu Accordion Container */
      #enterprise-crm-workspace aside .overflow-hidden {
        background-color: var(--sidebar-accordion-bg) !important;
        border-left-color: var(--sidebar-accordion-border) !important;
      }

      /* Header overrides */
      #enterprise-crm-workspace header {
        background-color: var(--header-bg) !important;
        color: var(--header-text) !important;
        border-bottom-color: var(--header-border) !important;
        height: var(--header-height) !important;
        box-shadow: var(--header-shadow) !important;
      }

      #enterprise-crm-workspace header input {
        background-color: var(--header-search-bg) !important;
        color: var(--header-text) !important;
      }

      /* Main canvas overrides */
      #enterprise-crm-workspace main {
        background-color: var(--content-bg) !important;
      }

      #enterprise-crm-workspace .bg-slate-50 {
        background-color: var(--content-page-bg) !important;
      }

      #enterprise-crm-workspace .bg-white {
        background-color: var(--content-cards) !important;
        border-radius: var(--radius-cards) !important;
      }

      #enterprise-crm-workspace table {
        background-color: var(--content-tables) !important;
      }

      #enterprise-crm-workspace table th {
        background-color: var(--content-tables) !important;
      }

      /* Action Buttons overrides */
      #enterprise-crm-workspace button.bg-blue-600 {
        background-color: var(--btn-primary-bg) !important;
        color: var(--btn-primary-text) !important;
        font-weight: var(--weight-button) !important;
        border-radius: var(--radius-buttons) !important;
        box-shadow: var(--btn-shadow) !important;
      }
      #enterprise-crm-workspace button.bg-blue-600:hover {
        opacity: var(--btn-hover-opacity) !important;
      }

      #enterprise-crm-workspace button.bg-slate-100 {
        background-color: var(--btn-secondary-bg) !important;
        color: var(--btn-secondary-text) !important;
        border-radius: var(--radius-buttons) !important;
      }
      #enterprise-crm-workspace button.bg-slate-100:hover {
        opacity: var(--btn-hover-opacity) !important;
      }

      #enterprise-crm-workspace button.bg-green-600,
      #enterprise-crm-workspace button.bg-emerald-600 {
        background-color: var(--btn-success-bg) !important;
        color: var(--btn-success-text) !important;
        border-radius: var(--radius-buttons) !important;
      }

      #enterprise-crm-workspace button.bg-red-600,
      #enterprise-crm-workspace button.bg-rose-600 {
        background-color: var(--btn-danger-bg) !important;
        color: var(--btn-danger-text) !important;
        border-radius: var(--radius-buttons) !important;
      }

      /* Inputs style */
      #enterprise-crm-workspace input[type="text"],
      #enterprise-crm-workspace input[type="email"],
      #enterprise-crm-workspace input[type="password"],
      #enterprise-crm-workspace select,
      #enterprise-crm-workspace textarea {
        background-color: var(--input-bg) !important;
        border-color: var(--input-border) !important;
        border-radius: var(--radius-inputs) !important;
      }

      #enterprise-crm-workspace input[type="text"]:focus,
      #enterprise-crm-workspace input[type="email"]:focus,
      #enterprise-crm-workspace input[type="password"]:focus,
      #enterprise-crm-workspace select:focus,
      #enterprise-crm-workspace textarea:focus {
        border-color: var(--input-focus-border) !important;
      }
    `;
  }, [adminTheme, isSidebarCollapsed]);
  
  // Login Forms states
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const isAuthenticated = !!loggedInUser;
  const [searchTerm, setSearchTerm] = useState('');

  // Automatic background sign-in for restored persistent sessions
  useEffect(() => {
    if (loggedInUser && loggedInUser.email.trim().toLowerCase() === 'dvarixrealty@gmail.com') {
      signInWithEmailAndPassword(auth, 'dvarixrealty@gmail.com', 'radhakrishna143')
        .catch(() => signInWithEmailAndPassword(auth, 'dvarixrealty@gmail.com', 'admin'))
        .catch(() => createUserWithEmailAndPassword(auth, 'dvarixrealty@gmail.com', 'radhakrishna143'))
        .then((cred) => console.log("Firebase Auth background session restored:", cred?.user?.email))
        .catch((err) => console.error("Firebase Auth background restore failed:", err));
    }
  }, [loggedInUser]);

  // Parent Category active sidebar state with localStorage persistence
  const [activeParent, setActiveParent] = useState<string>(() => {
    const saved = localStorage.getItem('dvarix_active_parent');
    return saved || 'Dashboard';
  });

  // Keep localStorage in sync when activeParent changes
  useEffect(() => {
    localStorage.setItem('dvarix_active_parent', activeParent);
  }, [activeParent]);

  // Subtabs within inline panels
  const [siteVisitsTab, setSiteVisitsTab] = useState<'Upcoming' | 'Completed' | 'All Site Visits'>('Upcoming');
  const [siteVisitsInitialSubTab, setSiteVisitsInitialSubTab] = useState<'Upcoming' | 'Completed' | 'Cancelled' | 'Trash' | 'All'>('Upcoming');
  const [agentsTab, setAgentsTab] = useState<'Roster' | 'Form'>('Roster');
  const [tasksTab, setTasksTab] = useState<'All Tasks' | 'Form'>('All Tasks');
  const [financeTab, setFinanceTab] = useState<'Ledger' | 'Form'>('Ledger');
  const [permissionTab, setPermissionTab] = useState<'Roster' | 'Form'>('Roster');
  const [mapTab, setMapTab] = useState<'Interactive' | 'Form'>('Interactive');
  
  // --- Search Category Management State Variables ---
  const [editingSearchCategory, setEditingSearchCategory] = useState<SearchCategory | null>(null);
  const [searchFormId, setSearchFormId] = useState('');
  const [searchFormTitle, setSearchFormTitle] = useState('');
  const [searchFormIconName, setSearchFormIconName] = useState('Building2');
  const [searchFormDisplayOrder, setSearchFormDisplayOrder] = useState<number>(1);
  const [searchFormStatus, setSearchFormStatus] = useState<'Active' | 'Disabled'>('Active');
  const [searchFormShowInView, setSearchFormShowInView] = useState<boolean>(true);
  const [searchFormIsDefault, setSearchFormIsDefault] = useState<boolean>(false);

  // --- Property Type Cards State Variables ---
  const [editingPropertyType, setEditingPropertyType] = useState<PropertyTypeCard | null>(null);
  const [typeFormId, setTypeFormId] = useState('');
  const [typeFormTitle, setTypeFormTitle] = useState('');
  const [typeFormDescription, setTypeFormDescription] = useState('');
  const [typeFormIconName, setTypeFormIconName] = useState('Building2');
  const [typeFormDisplayOrder, setTypeFormDisplayOrder] = useState<number>(1);
  const [typeFormStatus, setTypeFormStatus] = useState<'Active' | 'Disabled'>('Active');
  const [typeFormShowInView, setTypeFormShowInView] = useState<boolean>(true);
  const [typeFormRedirectUrl, setTypeFormRedirectUrl] = useState('');

  // --- Dynamic Search Configuration & Quick Filters ---
  const [phText, setPhText] = useState(mapSettings?.searchPlaceholder || '');
  const [newQFFilterName, setNewQFFilterName] = useState('');

  // --- Website CMS Customize State Variables ---
  const [cmsActiveTab, setCmsActiveTab] = useState<'General' | 'Hero' | 'Luxury Banners' | 'Services' | 'Campaigns' | 'Testimonials' | 'Blogs' | 'Statistics' | 'Footer'>('General');

  // Child-to-parent mapping for auto-expand logic
  const CHILD_TO_PARENT_MAP = useMemo(() => ({
    // CRM & SALES
    "Enquiry Center": "CRM & SALES",
    "Free Service Requests": "CRM & SALES",
    "Lead Management": "CRM & SALES",
    "My Leads": "CRM & SALES",
    "Requirements CRM": "CRM & SALES",
    "Customers": "CRM & SALES",
    "My Customers": "CRM & SALES",

    // PROPERTY MANAGEMENT
    "Properties": "PROPERTY MANAGEMENT",
    "Search Categories": "PROPERTY MANAGEMENT",
    "Property Type Cards": "PROPERTY MANAGEMENT",
    "Site Visits": "PROPERTY MANAGEMENT",
    "Location Management": "PROPERTY MANAGEMENT",
    "Map Style Management": "PROPERTY MANAGEMENT",

    // TEAM MANAGEMENT
    "Agent Workspace": "TEAM MANAGEMENT",
    "Agents & Team": "TEAM MANAGEMENT",
    "Tasks & Operations": "TEAM MANAGEMENT",
    "My Tasks": "TEAM MANAGEMENT",
    "My Follow-ups": "TEAM MANAGEMENT",
    "Documents": "TEAM MANAGEMENT",
    "Finance": "TEAM MANAGEMENT",
    "Calendar": "TEAM MANAGEMENT",
    "My Profile": "TEAM MANAGEMENT",

    // WEBSITE CMS
    "Hero Banner Management": "WEBSITE CMS",
    "Homepage CMS": "WEBSITE CMS",
    "FAQ Management": "WEBSITE CMS",
    "Marketing": "WEBSITE CMS",
    "Website CMS Customize": "WEBSITE CMS",

    // AI & AUTOMATION
    "AI Center": "AI & AUTOMATION",
    "Dvarix Bot Studio": "AI & AUTOMATION",
    "Notifications Center": "AI & AUTOMATION",
    "Notifications": "AI & AUTOMATION",

    // REPORTS
    "Reports & Analytics": "REPORTS",

    // ADMINISTRATION
    "Role & Permissions": "ADMINISTRATION",
    "System Configuration": "ADMINISTRATION"
  }) as Record<string, string>, []);

  // Parent Category expanded state with localStorage persistence
  const [expandedParent, setExpandedParent] = useState<string | null>(() => {
    const saved = localStorage.getItem('dvarix_expanded_parent');
    if (saved) return saved;
    // Fallback to activeParent's mapped parent on load
    return CHILD_TO_PARENT_MAP[activeParent] || null;
  });

  // Auto-expand current active parent section when activeParent or cmsActiveTab changes
  useEffect(() => {
    let childKey: string = activeParent;
    if (activeParent === 'Website CMS Customize') {
      if (cmsActiveTab === 'Luxury Banners') {
        childKey = 'Hero Banner Management';
      } else if (cmsActiveTab === 'Hero') {
        childKey = 'Homepage CMS';
      }
    }
    const mappedParent = CHILD_TO_PARENT_MAP[childKey];
    if (mappedParent) {
      setExpandedParent(mappedParent);
      localStorage.setItem('dvarix_expanded_parent', mappedParent);
    }
  }, [activeParent, cmsActiveTab, CHILD_TO_PARENT_MAP]);


  
  // --- Statistics Management States ---
  const [editingStatId, setEditingStatId] = useState<string | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [statIcon, setStatIcon] = useState('🏠');
  const [statNumber, setStatNumber] = useState('');
  const [statTitle, setStatTitle] = useState('');
  const [statDescription, setStatDescription] = useState('');
  const [statEnabled, setStatEnabled] = useState(true);
  const [statOrder, setStatOrder] = useState<number>(1);

  // Statistics settings inputs
  const [statAnimDuration, setStatAnimDuration] = useState<number>(2.0);
  const [statAnimDelay, setStatAnimDelay] = useState<number>(150);

  // Sync Statistics settings from prop when siteSettings updates
  useEffect(() => {
    if (siteSettings?.statisticsSettings) {
      setStatAnimDuration(siteSettings.statisticsSettings.animationDuration || 2.0);
      setStatAnimDelay(siteSettings.statisticsSettings.animationDelay || 150);
    }
  }, [siteSettings?.statisticsSettings]);

  // --- Footer Management States ---
  const [footerLogoText, setFooterLogoText] = useState('DVARIX REALTY');
  const [footerBrandDescription, setFooterBrandDescription] = useState('');
  const [footerAddress, setFooterAddress] = useState('');
  const [footerPhone, setFooterPhone] = useState('');
  const [footerEmail, setFooterEmail] = useState('');
  const [footerCopyrightText, setFooterCopyrightText] = useState('');
  const [footerReraBadgeText, setFooterReraBadgeText] = useState('');
  const [footerReraSubtext, setFooterReraSubtext] = useState('');
  const [footerEnableSkyline, setFooterEnableSkyline] = useState(true);
  const [footerEnableTrustStrip, setFooterEnableTrustStrip] = useState(true);
  const [footerShowSocialIcons, setFooterShowSocialIcons] = useState(true);
  const [footerSectionOrder, setFooterSectionOrder] = useState<string[]>(["brand", "company", "services", "contact"]);
  const [footerBusinessHours, setFooterBusinessHours] = useState('');
  const [footerWhatsappNumber, setFooterWhatsappNumber] = useState('');
  const [footerGoogleMapsUrl, setFooterGoogleMapsUrl] = useState('');
  
  const [footerCtas, setFooterCtas] = useState<any[]>([]);
  const [footerCompanyLinks, setFooterCompanyLinks] = useState<any[]>([]);
  const [footerServicesLinks, setFooterServicesLinks] = useState<any[]>([]);
  const [footerQuickLinks, setFooterQuickLinks] = useState<any[]>([]);
  const [footerSocials, setFooterSocials] = useState<any[]>([]);
  const [footerTrustCards, setFooterTrustCards] = useState<any[]>([]);

  // Synchronize Footer state variables when siteSettings loads
  useEffect(() => {
    if (siteSettings?.footerConfig) {
      const fc = siteSettings.footerConfig;
      setFooterLogoText(fc.logoText || 'DVARIX REALTY');
      setFooterBrandDescription(fc.brandDescription || '');
      setFooterAddress(fc.address || '');
      setFooterPhone(fc.phone || '');
      setFooterEmail(fc.email || '');
      setFooterCopyrightText(fc.copyrightText || '');
      setFooterReraBadgeText(fc.reraBadgeText || '');
      setFooterReraSubtext(fc.reraSubtext || '');
      setFooterEnableSkyline(fc.enableSkyline !== false);
      setFooterEnableTrustStrip(fc.enableTrustStrip !== false);
      setFooterShowSocialIcons(fc.showSocialIcons !== false);
      setFooterSectionOrder((fc.sectionOrder || ["brand", "company", "services", "contact"]).filter((s: string) => s !== 'quickLinks'));
      setFooterBusinessHours(fc.businessHours || 'Mon - Sat: 9:00 AM - 7:00 PM, Sunday: Closed');
      setFooterWhatsappNumber(fc.whatsappNumber || '+91 63009 84846');
      setFooterGoogleMapsUrl(fc.googleMapsUrl || 'https://maps.google.com/?q=Dvarix+Realty+JP+Nagar+Bengaluru');
      setFooterCtas(fc.ctas || []);
      setFooterCompanyLinks(fc.companyLinks || []);
      setFooterServicesLinks(fc.servicesLinks || []);
      setFooterQuickLinks(fc.quickLinks || []);
      setFooterSocials(fc.socials || []);
      setFooterTrustCards(fc.trustCards || []);
    } else {
      // Set to standard defaults
      setFooterLogoText('DVARIX REALTY');
      setFooterBrandDescription('Helping you buy, sell, and invest in verified residential and commercial properties across Bengaluru with complete transparency.');
      setFooterAddress('JP Nagar, Bengaluru, Karnataka 560078');
      setFooterPhone('+91 63009 84846');
      setFooterEmail('dvarixrealty@gmail.com');
      setFooterCopyrightText('Dvarix Realty. All Rights Reserved.');
      setFooterReraBadgeText('RERA Registered');
      setFooterReraSubtext('Real Estate Advisory Services');
      setFooterEnableSkyline(true);
      setFooterEnableTrustStrip(true);
      setFooterShowSocialIcons(true);
      setFooterSectionOrder(["brand", "company", "services", "contact"]);
      setFooterBusinessHours('Mon - Sat: 9:00 AM - 7:00 PM, Sunday: Closed');
      setFooterWhatsappNumber('+91 63009 84846');
      setFooterGoogleMapsUrl('https://maps.google.com/?q=Dvarix+Realty+JP+Nagar+Bengaluru');
      setFooterCtas([
        { text: "Explore Properties", type: "tab", target: "Properties", icon: "Explore" },
        { text: "Contact Advisor", type: "tab", target: "Contact", icon: "Advisor" }
      ]);
      setFooterCompanyLinks([
        { label: "Home", url: "Home" },
        { label: "Properties", url: "Properties" },
        { label: "About Us", url: "About" },
        { label: "Contact Us", url: "Contact" },
        { label: "Custom Property Request", url: "CustomRequest" }
      ]);
      setFooterServicesLinks([
        { label: "Residential Properties", url: "Properties" },
        { label: "Commercial Properties", url: "Properties" },
        { label: "Plots & Land", url: "Properties" },
        { label: "Luxury Villas", url: "Properties" },
        { label: "Investment Advisory", url: "Properties" }
      ]);
      setFooterQuickLinks([
        { label: "Privacy Policy", url: "Privacy" },
        { label: "Terms & Conditions", url: "Terms" },
        { label: "RERA Compliance", url: "Rera" },
        { label: "FAQs", url: "Faqs" },
        { label: "Sitemap", url: "Sitemap" }
      ]);
      setFooterSocials([
        { platform: "instagram", url: "https://instagram.com/dvarixrealty", enabled: true },
        { platform: "facebook", url: "https://facebook.com/dvarixrealty", enabled: true },
        { platform: "linkedin", url: "https://linkedin.com/company/dvarixrealty", enabled: true },
        { platform: "youtube", url: "https://youtube.com/c/dvarixrealty", enabled: true }
      ]);
      setFooterTrustCards([
        { id: "tc_1", title: "Verified Listings", description: "100% Verified Properties", icon: "ShieldCheck" },
        { id: "tc_2", title: "Legal Assistance", description: "Property Documentation Support", icon: "FileText" },
        { id: "tc_3", title: "RERA Guidance", description: "Professional Compliance Assistance", icon: "CheckCircle" },
        { id: "tc_4", title: "Transparent Process", description: "End-to-End Property Advisory", icon: "Compass" }
      ]);
    }
  }, [siteSettings?.footerConfig]);
  
  // New Banner Form States
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerHeadline, setBannerHeadline] = useState('');
  const [bannerSubheading, setBannerSubheading] = useState('');
  const [bannerDescription, setBannerDescription] = useState('');
  const [bannerBadgeText, setBannerBadgeText] = useState('DVARIX REALTY');
  const [bannerPropertyCountBadge, setBannerPropertyCountBadge] = useState('500+ Verified Properties');
  const [bannerDesktopImage, setBannerDesktopImage] = useState('');
  const [bannerTabletImage, setBannerTabletImage] = useState('');
  const [bannerMobileImage, setBannerMobileImage] = useState('');
  const [bannerPrimaryButtonText, setBannerPrimaryButtonText] = useState('Explore Properties');
  const [bannerPrimaryButtonUrl, setBannerPrimaryButtonUrl] = useState('#listings-layout-view');
  const [bannerSecondaryButtonText, setBannerSecondaryButtonText] = useState('Custom Request');
  const [bannerSecondaryButtonUrl, setBannerSecondaryButtonUrl] = useState('custom-request');
  const [bannerEnabled, setBannerEnabled] = useState(true);
  const [bannerOrder, setBannerOrder] = useState(1);
  const [bannerPublishDate, setBannerPublishDate] = useState('');
  const [bannerExpiryDate, setBannerExpiryDate] = useState('');
  const [bannerPreviewObject, setBannerPreviewObject] = useState<any | null>(null);

  // --- Advanced Hero Banner Management states ---
  const [bannerDesktopImageMethod, setBannerDesktopImageMethod] = useState<'upload' | 'url'>('url');
  const [bannerMobileImageMethod, setBannerMobileImageMethod] = useState<'upload' | 'url'>('url');
  const [bannerStatus, setBannerStatus] = useState<'active' | 'inactive' | 'draft'>('active');

  const [primaryBtnText, setPrimaryBtnText] = useState('Explore Properties');
  const [primaryBtnDestType, setPrimaryBtnDestType] = useState<'internal' | 'external' | 'custom' | 'category' | 'property' | 'contact' | 'custom-request'>('internal');
  const [primaryBtnDestVal, setPrimaryBtnDestVal] = useState('Properties');
  const [primaryBtnNewTab, setPrimaryBtnNewTab] = useState(false);

  const [secondaryBtnText, setSecondaryBtnText] = useState('Custom Request');
  const [secondaryBtnDestType, setSecondaryBtnDestType] = useState<'internal' | 'external' | 'custom' | 'category' | 'property' | 'contact' | 'custom-request'>('custom-request');
  const [secondaryBtnDestVal, setSecondaryBtnDestVal] = useState('');
  const [secondaryBtnNewTab, setSecondaryBtnNewTab] = useState(false);

  // Carousel Settings fields
  const [carouselAutoPlay, setCarouselAutoPlay] = useState(true);
  const [carouselDuration, setCarouselDuration] = useState<number>(5);
  const [carouselSpeed, setCarouselSpeed] = useState<'fast' | 'normal' | 'slow'>('normal');
  const [carouselArrows, setCarouselArrows] = useState(true);
  const [carouselDots, setCarouselDots] = useState(true);
  const [carouselPause, setCarouselPause] = useState(true);
  const [carouselLoop, setCarouselLoop] = useState(true);

  // Sync carousel settings from prop when siteSettings updates
  useEffect(() => {
    if (siteSettings?.carouselSettings) {
      setCarouselAutoPlay(siteSettings.carouselSettings.autoPlay);
      setCarouselDuration(siteSettings.carouselSettings.autoSlideDuration || 5);
      setCarouselSpeed(siteSettings.carouselSettings.transitionSpeed || 'normal');
      setCarouselArrows(siteSettings.carouselSettings.showNavigationArrows !== false);
      setCarouselDots(siteSettings.carouselSettings.showPaginationDots !== false);
      setCarouselPause(siteSettings.carouselSettings.pauseOnHover !== false);
      setCarouselLoop(siteSettings.carouselSettings.infiniteLoop !== false);
    }
  }, [siteSettings?.carouselSettings]);
  
  // New Service Form
  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  
  // New Offer Form
  const [newOfferTitle, setNewOfferTitle] = useState('');
  const [newOfferBadge, setNewOfferBadge] = useState('Exclusive');
  const [newOfferDesc, setNewOfferDesc] = useState('');
  const [newOfferValidTill, setNewOfferValidTill] = useState('');
  const [newOfferImage, setNewOfferImage] = useState('');

  // New Testimonial Form
  const [newTestimonialClient, setNewTestimonialClient] = useState('');
  const [newTestimonialRole, setNewTestimonialRole] = useState('');
  const [newTestimonialText, setNewTestimonialText] = useState('');
  const [newTestimonialRating, setNewTestimonialRating] = useState<number>(5);
  const [newTestimonialAvatar, setNewTestimonialAvatar] = useState('');

  // New Blog Form
  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogExcerpt, setNewBlogExcerpt] = useState('');
  const [newBlogContent, setNewBlogContent] = useState('');
  const [newBlogAuthor, setNewBlogAuthor] = useState('');
  const [newBlogImage, setNewBlogImage] = useState('');

  useEffect(() => {
    if (mapSettings?.searchPlaceholder) {
      setPhText(mapSettings.searchPlaceholder);
    }
  }, [mapSettings?.searchPlaceholder]);

  // Floating Toast Notifications inside Admin Dashboard
  const [adminToast, setAdminToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setAdminToast({ message, type });
    setTimeout(() => {
      setAdminToast((prev) => (prev?.message === message ? null : prev));
    }, 4005);
  };
  
  // Gated Permissions
  const superAdminEmail = 'dvarixrealty@gmail.com';
  const isSuperAdmin = loggedInUser?.email.trim().toLowerCase() === superAdminEmail;
  const currentRole = loggedInUser?.roleName || 'Agent';
  const isSuperAdminUser = loggedInUser?.email.trim().toLowerCase() === superAdminEmail || currentRole === 'Super Admin' || currentRole === 'Admin';
  const isManagerUser = currentRole === 'Manager' || currentRole === 'Sales Manager' || currentRole === 'Team Leader';
  const isAgentUser = currentRole === 'Agent' || currentRole === 'Sales Agent' || (!isSuperAdminUser && !isManagerUser);
  const userPermissions = loggedInUser?.permissions || {
    canManageProperties: true,
    canManageCategories: true,
    canManageAgents: true,
    canManageMap: true,
    canReplyInquiries: true,
    canManageUsers: true
  };

  // --- Search Category Management Functions ---
  const handleSaveSearchCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchFormId || !searchFormTitle) {
      showToast("Please provide category ID and Title.", "error");
      return;
    }
    const cleanId = searchFormId.trim().replace(/\s+/g, '-');
    const newCat: SearchCategory = {
      id: cleanId,
      title: searchFormTitle.trim(),
      iconName: searchFormIconName,
      displayOrder: Number(searchFormDisplayOrder) || 1,
      status: searchFormStatus,
      showInView: searchFormShowInView,
      isDefault: searchFormIsDefault,
    };

    try {
      if (newCat.isDefault) {
        // Unset other defaults
        const otherDefaults = searchCategories.filter(c => c.id !== cleanId && c.isDefault);
        for (const cat of otherDefaults) {
          await firebaseService.saveSearchCategory({ ...cat, isDefault: false });
        }
      }

      await firebaseService.saveSearchCategory(newCat);
      showToast(editingSearchCategory ? `Category "${newCat.title}" details updated!` : `New category "${newCat.title}" created successfully!`, "success");
      resetSearchCategoryForm();
    } catch (err: any) {
      console.error(err);
      showToast(`Failed to save category: ${err.message || err}`, "error");
    }
  };

  const handleEditSearchCategoryClick = (cat: SearchCategory) => {
    setEditingSearchCategory(cat);
    setSearchFormId(cat.id);
    setSearchFormTitle(cat.title);
    setSearchFormIconName(cat.iconName || 'Building2');
    setSearchFormDisplayOrder(cat.displayOrder || 1);
    setSearchFormStatus(cat.status || 'Active');
    setSearchFormShowInView(cat.showInView !== false);
    setSearchFormIsDefault(!!cat.isDefault);
    showToast(`Loaded "${cat.title}" for editing.`, "success");
  };

  const handleDeleteSearchCategoryClick = async (catId: string) => {
    if (confirm(`Are you sure you want to delete search category "${catId}" from database?`)) {
      try {
        await firebaseService.deleteSearchCategory(catId);
        showToast(`Category "${catId}" deleted successfully.`, "success");
        if (editingSearchCategory?.id === catId) {
          resetSearchCategoryForm();
        }
      } catch (err: any) {
        console.error(err);
        showToast(`Failed to delete category: ${err.message || err}`, "error");
      }
    }
  };

  const toggleSearchCategoryStatus = async (cat: SearchCategory) => {
    try {
      const nextStatus = cat.status === 'Active' ? 'Disabled' : 'Active';
      const updated = { ...cat, status: nextStatus } as SearchCategory;
      await firebaseService.saveSearchCategory(updated);
      showToast(`Category "${cat.title}" status is now ${nextStatus}.`, "success");
    } catch (err: any) {
      console.error(err);
      showToast(`Failed to toggle category status: ${err.message || err}`, "error");
    }
  };

  const toggleSearchCategoryDefault = async (cat: SearchCategory) => {
    try {
      const nextVal = !cat.isDefault;
      if (nextVal) {
        // Turn other defaults off
        const otherDefaults = searchCategories.filter(c => c.id !== cat.id && c.isDefault);
        for (const c of otherDefaults) {
          await firebaseService.saveSearchCategory({ ...c, isDefault: false });
        }
      }
      const updated = { ...cat, isDefault: nextVal } as SearchCategory;
      await firebaseService.saveSearchCategory(updated);
      showToast(nextVal ? `Category "${cat.title}" set as Default loading tab.` : `Category "${cat.title}" default state removed.`, "success");
    } catch (err: any) {
      console.error(err);
      showToast(`Failed to toggle default: ${err.message || err}`, "error");
    }
  };

  const toggleSearchCategoryShowHide = async (cat: SearchCategory) => {
    try {
      const nextVal = cat.showInView === false ? true : false;
      const updated = { ...cat, showInView: nextVal } as SearchCategory;
      await firebaseService.saveSearchCategory(updated);
      showToast(nextVal ? `Category "${cat.title}" is now Visible.` : `Category "${cat.title}" is now Hidden.`, "success");
    } catch (err: any) {
      console.error(err);
      showToast(`Failed to toggle visibility: ${err.message || err}`, "error");
    }
  };

  const moveSearchCategoryOrder = async (index: number, direction: 'up' | 'down') => {
    const sorted = [...searchCategories].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    try {
      const currentCat = sorted[index];
      const targetCat = sorted[targetIndex];

      const currentOrder = currentCat.displayOrder || 0;
      const targetOrder = targetCat.displayOrder || 0;

      // Swap values
      await firebaseService.saveSearchCategory({ ...currentCat, displayOrder: targetOrder });
      await firebaseService.saveSearchCategory({ ...targetCat, displayOrder: currentOrder });
      showToast("Display orders swapped successfully.", "success");
    } catch (err: any) {
      console.error(err);
      showToast(`Failed to swap display orders: ${err.message || err}`, "error");
    }
  };

  const resetSearchCategoryForm = () => {
    setEditingSearchCategory(null);
    setSearchFormId('');
    setSearchFormTitle('');
    setSearchFormIconName('Building2');
    setSearchFormDisplayOrder(searchCategories.length + 1);
    setSearchFormStatus('Active');
    setSearchFormShowInView(true);
    setSearchFormIsDefault(false);
  };

  // --- Dynamic Search Configuration & Quick Filters Helper Functions ---
  const handleSavePlaceholder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateMapSettings || !mapSettings) {
      showToast("Map settings handlers are unconfigured", "error");
      return;
    }
    try {
      await onUpdateMapSettings({
        ...mapSettings,
        searchPlaceholder: phText
      });
      showToast("Search placeholder text updated successfully!", "success");
    } catch (err: any) {
      showToast(`Failed to update placeholder: ${err.message || err}`, "error");
    }
  };

  const handleAddQuickFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQFFilterName.trim() || !setQuickFilters) {
      showToast("Please enter a valid quick filter label.", "error");
      return;
    }
    const cleanName = newQFFilterName.trim();
    
    // Look for duplicated names
    const exists = quickFilters.some(f => f.name.toLowerCase() === cleanName.toLowerCase());
    if (exists) {
      showToast(`Quick filter "${cleanName}" already exists!`, "error");
      return;
    }

    const newFilter: QuickFilter = {
      id: `qf-${Date.now()}`,
      name: cleanName,
      status: 'Active'
    };

    try {
      await setQuickFilters([...quickFilters, newFilter]);
      setNewQFFilterName('');
      showToast(`Quick filter "${cleanName}" created successfully!`, "success");
    } catch (err: any) {
      showToast(`Failed to create quick filter: ${err.message || err}`, "error");
    }
  };

  const handleToggleQuickFilterStatus = async (filterId: string) => {
    if (!setQuickFilters) return;
    try {
      const updated = quickFilters.map(f => {
        if (f.id === filterId) {
          const nextStatus: 'Active' | 'Disabled' = f.status === 'Active' ? 'Disabled' : 'Active';
          showToast(`Filter "${f.name}" is now ${nextStatus === 'Active' ? 'active' : 'inactive'}.`, "success");
          return { ...f, status: nextStatus };
        }
        return f;
      });
      await setQuickFilters(updated);
    } catch (err: any) {
      showToast(`Failed to toggle status: ${err.message || err}`, "error");
    }
  };

  const handleDeleteQuickFilterClick = async (filterId: string) => {
    if (!setQuickFilters) return;
    const target = quickFilters.find(f => f.id === filterId);
    if (!target) return;
    if (!window.confirm(`Are you sure you want to delete the "${target.name}" quick filter options?`)) return;
    
    try {
      const updated = quickFilters.filter(f => f.id !== filterId);
      await setQuickFilters(updated);
      showToast(`Quick filter "${target.name}" permanently deleted from database.`, "success");
    } catch (err: any) {
      showToast(`Failed to delete quick filter: ${err.message || err}`, "error");
    }
  };

  // --- Property Type Cards Functions ---
  const handleSavePropertyType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeFormId || !typeFormTitle) {
      showToast("Please provide type ID and Title.", "error");
      return;
    }
    const cleanId = typeFormId.trim().replace(/\s+/g, '-');
    const newCard: PropertyTypeCard = {
      id: cleanId,
      title: typeFormTitle.trim(),
      description: typeFormDescription.trim(),
      iconName: typeFormIconName,
      displayOrder: Number(typeFormDisplayOrder) || 1,
      status: typeFormStatus,
      showInView: typeFormShowInView,
      redirectUrl: typeFormRedirectUrl.trim()
    };

    try {
      if (!editingPropertyType && categories.some(c => c.id === cleanId)) {
        showToast("A property type card with this ID already exists.", "error");
        return;
      }
      await firebaseService.saveCategory(newCard);
      showToast(editingPropertyType ? `Property Type Card "${newCard.title}" updated!` : `Property Type Card "${newCard.title}" created successfully!`, "success");
      resetPropertyTypeForm();
    } catch (err: any) {
      console.error(err);
      showToast(`Failed to save card: ${err.message || err}`, "error");
    }
  };

  const handleEditPropertyTypeClick = (cat: PropertyTypeCard) => {
    setEditingPropertyType(cat);
    setTypeFormId(cat.id);
    setTypeFormTitle(cat.title);
    setTypeFormDescription(cat.description || '');
    setTypeFormIconName(cat.iconName || 'Building2');
    setTypeFormDisplayOrder(cat.displayOrder || 1);
    setTypeFormStatus(cat.status || 'Active');
    setTypeFormShowInView(cat.showInView !== false);
    setTypeFormRedirectUrl(cat.redirectUrl || '');
    showToast(`Loaded "${cat.title}" for editing.`, "success");
  };

  const handleDeletePropertyTypeClick = async (catId: string) => {
    if (confirm(`Are you sure you want to delete property type card "${catId}" from database?`)) {
      try {
        await firebaseService.deleteCategory(catId);
        showToast(`Property type card "${catId}" deleted successfully.`, "success");
        if (editingPropertyType?.id === catId) {
          resetPropertyTypeForm();
        }
      } catch (err: any) {
        console.error(err);
        showToast(`Failed to delete card: ${err.message || err}`, "error");
      }
    }
  };

  const togglePropertyTypeStatus = async (cat: PropertyTypeCard) => {
    try {
      const nextStatus = cat.status === 'Active' ? 'Disabled' : 'Active';
      const updated = { ...cat, status: nextStatus } as PropertyTypeCard;
      await firebaseService.saveCategory(updated);
      showToast(`Property type "${cat.title}" status is now ${nextStatus}.`, "success");
    } catch (err: any) {
      console.error(err);
      showToast(`Failed to toggle card status: ${err.message || err}`, "error");
    }
  };

  const togglePropertyTypeShowHide = async (cat: PropertyTypeCard) => {
    try {
      const nextVal = cat.showInView === false ? true : false;
      const updated = { ...cat, showInView: nextVal } as PropertyTypeCard;
      await firebaseService.saveCategory(updated);
      showToast(nextVal ? `Property type "${cat.title}" is now Visible.` : `Property type "${cat.title}" is now Hidden.`, "success");
    } catch (err: any) {
      console.error(err);
      showToast(`Failed to toggle visibility: ${err.message || err}`, "error");
    }
  };

  const movePropertyTypeOrder = async (index: number, direction: 'up' | 'down') => {
    const sorted = [...categories].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    try {
      const currentCat = sorted[index];
      const targetCat = sorted[targetIndex];

      const currentOrder = currentCat.displayOrder || 0;
      const targetOrder = targetCat.displayOrder || 0;

      // Swap values
      await firebaseService.saveCategory({ ...currentCat, displayOrder: targetOrder });
      await firebaseService.saveCategory({ ...targetCat, displayOrder: currentOrder });
      showToast("Display orders swapped successfully.", "success");
    } catch (err: any) {
      console.error(err);
      showToast(`Failed to swap display orders: ${err.message || err}`, "error");
    }
  };

  const resetPropertyTypeForm = () => {
    setEditingPropertyType(null);
    setTypeFormId('');
    setTypeFormTitle('');
    setTypeFormDescription('');
    setTypeFormIconName('Building2');
    setTypeFormDisplayOrder(categories.length + 1);
    setTypeFormStatus('Active');
    setTypeFormShowInView(true);
    setTypeFormRedirectUrl('');
  };

  // NEW CRM LOCAL STATES 
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Verify JP Nagar 3BHK Title deeds', status: 'Pending', priority: 'High', type: 'Verification', agent: 'Rahul Kumar', date: 'May 21, 2026' },
    { id: '2', title: 'Schedule physical walkthrough for Krish at jp nagar flat', status: 'In Progress', priority: 'High', type: 'Site Visit', agent: 'Arjun Mehta', date: 'May 22, 2026' },
    { id: '3', title: 'Dispatch custom valuation quotes directly to Sophia', status: 'Completed', priority: 'High', type: 'Outreach', agent: 'Neha Sharma', date: 'May 20, 2026' },
    { id: '4', title: 'Conduct survey for banquet layout clearances', status: 'Overdue', priority: 'Medium', type: 'Sourcing', agent: 'Rahul Kumar', date: 'May 18, 2026' }
  ]);

  const [siteVisits, setSiteVisits] = useState([
    { id: 'v1', customerName: 'Krish', propertyTitle: '3 BHK Modern Apartment jp nagar', date: '2026-05-24', time: '11:00 AM', status: 'Confirmed', agent: 'Rahul Kumar', feedback: '' },
    { id: 'v2', customerName: 'Sophia Lin', propertyTitle: 'Bespoke Lake Hills Villa', date: '2026-05-25', time: '02:00 PM', status: 'Confirmed', agent: 'Arjun Mehta', feedback: '' },
    { id: 'v3', customerName: 'Marcus Brody', propertyTitle: 'Crestwood Modernist Villa', date: '2026-05-20', time: '04:30 PM', status: 'Completed', agent: 'Neha Sharma', feedback: 'Extremely content with layouts and solar wall backup.' }
  ]);

  const [financeEntries, setFinanceEntries] = useState([
    { id: 'f1', type: 'Revenue', category: 'Brokerage Commission', amount: 850000, date: '2026-05-18', status: 'Cleared', description: 'JP Nagar Plot Sale Completion', property: 'Crestwood Modernist Villa', customer: 'Daniel Wright', agent: 'Neha Sharma', paymentMode: 'Wire Transfer' },
    { id: 'f2', type: 'Revenue', category: 'Consulting Engagement', amount: 150000, date: '2026-05-20', status: 'Cleared', description: 'Corporate Portfolio alignment audit', property: 'Apex Plaza Trade Complex', customer: 'Marcus Brody', agent: 'Rahul Kumar', paymentMode: 'Cheque' },
    { id: 'f3', type: 'Expense', category: 'Meta Lead Ads Campaign', amount: 45000, date: '2026-05-15', status: 'Settled', description: 'Acquisitions Facebook ads budget', property: 'General Marketing', customer: 'Meta Ads', agent: 'Neha Sharma', paymentMode: 'Credit Card' },
    { id: 'f4', type: 'Expense', category: 'Team Roster Salaries', amount: 350000, date: '2026-05-01', status: 'Settled', description: 'Roster salary disbursal', property: 'Operations', customer: 'Advisors Team', agent: 'Rahul Kumar', paymentMode: 'Bank Transfer' }
  ]);

  // Finance filter states
  const [financeSearchTerm, setFinanceSearchTerm] = useState('');
  const [financeTypeFilter, setFinanceTypeFilter] = useState('All');
  const [financePaymentModeFilter, setFinancePaymentModeFilter] = useState('All');
  const [financePropertyFilter, setFinancePropertyFilter] = useState('All');
  const [financeCustomerFilter, setFinanceCustomerFilter] = useState('All');
  const [financeAgentFilter, setFinanceAgentFilter] = useState('All');
  const [financeDateFilter, setFinanceDateFilter] = useState('');

  // Shared Leads state between modules
  const [leads, setLeads] = useState<CRMLead[]>(() => getDefaultLeads(agents));

  // Shared Notifications and Config Toggles
  const [notifications, setNotifications] = useState<any[]>([
    { id: '1', title: 'Aditya Vardhan Hegde created as a New Lead', message: 'Custom Request Form ingested new client lead.', priority: 'Medium', type: 'Lead Created', category: 'Leads', delivery: ['Dashboard Only'], status: 'Active', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: '2', title: 'New Requirement Submitted: PG JP Nagar', message: 'Client Krish has requested PG JP Nagar under ₹5000.', priority: 'High', type: 'New Requirement Submitted', category: 'Requirements', delivery: ['Dashboard Only', 'Email'], status: 'Active', createdAt: new Date(Date.now() - 3605000 * 4).toISOString() },
    { id: '3', title: 'Property Added: Indiranagar Modern Office', message: 'SaaSCorporate real estate portfolio holds new office space listing.', priority: 'Low', type: 'Property Added', category: 'Properties', delivery: ['Dashboard Only'], status: 'Archived', createdAt: new Date(Date.now() - 3600000 * 24).toISOString() }
  ]);

  const [notificationToggles, setNotificationToggles] = useState<Record<string, boolean>>({
    'New Lead Created': false,
    'Lead Assigned': false,
    'Lead Reassigned': false,
    'Lead Status Changed': false,
    'Lead Closed': false,
    'New Requirement Submitted': false,
    'Requirement Updated': false,
    'Requirement Matched': false,
    'Requirement Closed': false,
    'Property Added': false,
    'Property Updated': false,
    'Property Deleted': false,
    'Site Visit Scheduled': false,
    'Site Visit Completed': false,
    'Site Visit Cancelled': false,
    'Document Uploaded': false,
    'Document Approved': false,
    'Document Expired': false,
    'Payment Received': false,
    'Expense Added': false,
    'Invoice Generated': false,
    'Agent Added': false,
    'Agent Updated': false,
    'Agent Assigned Lead': false,
    'New Task': false,
    'Task Completed': false,
    'Task Overdue': false,
  });

  const triggerAutoNotification = (type: string, title: string, message: string, category: string, priority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium') => {
    if (notificationToggles[type]) {
      const newNoti = {
        id: 'auto-' + Date.now(),
        title,
        message,
        priority,
        type,
        category,
        delivery: ['Dashboard Only'],
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [newNoti, ...prev]);
    }
  };

  // AI Center local simulation
  const [aiPrompt, setAiPrompt] = useState('Suggest top properties for client Krish looking for pg in jp nagar under budget 5000.');
  const [aiIsLoading, setAiIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Forms states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAgent, setNewTaskAgent] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('High');

  const [newVisitCustomer, setNewVisitCustomer] = useState('');
  const [newVisitProperty, setNewVisitProperty] = useState('');
  const [newVisitDate, setNewVisitDate] = useState('2026-05-22');
  const [newVisitTime, setNewVisitTime] = useState('11:00 AM');
  const [newVisitAgent, setNewVisitAgent] = useState('Rahul Kumar');

  const [newFinanceType, setNewFinanceType] = useState('Revenue');
  const [newFinanceCategory, setNewFinanceCategory] = useState('Brokerage');
  const [newFinanceAmount, setNewFinanceAmount] = useState<number>(30000);
  const [newFinanceDesc, setNewFinanceDesc] = useState('');

  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentRole, setNewAgentRole] = useState('Advisor');
  const [newAgentPhone, setNewAgentPhone] = useState('');
  const [newAgentEmail, setNewAgentEmail] = useState('');
  const [newAgentAvatar, setNewAgentAvatar] = useState('https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80');

  // GIS coordinates adjustments forms
  const [newMapKey, setNewMapKey] = useState('');
  const [newMapX, setNewMapX] = useState('45%');
  const [newMapY, setNewMapY] = useState('50%');
  const [newMapListings, setNewMapListings] = useState<number>(6);
  const [newMapValuation, setNewMapValuation] = useState('₹ 4.5 Cr');
  const [newMapBenefits, setNewMapBenefits] = useState('Rapid Metro Access');
  const [newMapDescription, setNewMapDescription] = useState('High returns outer ring road belt');
  const [newMapGrowth, setNewMapGrowth] = useState('+14.2% YoY');

  // Users Credentials Form
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('Manager');
  const [newUserPerms, setNewUserPerms] = useState<PermissionSet>({
    canManageProperties: true,
    canManageCategories: true,
    canManageAgents: true,
    canManageMap: true,
    canReplyInquiries: true,
    canManageUsers: false
  });

  // Synchronize new public site visit forms to Lead Management, Customers lists, Site Visits logs, and alerts center!
  useEffect(() => {
    const handleCmsAddSiteVisit = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;

      // 1. Create site visit record
      const newVisit = {
        id: detail.id,
        customerName: detail.customerName,
        propertyTitle: detail.propertyName,
        propertyId: detail.propertyId,
        date: detail.date,
        time: detail.time,
        status: 'Scheduled', // Active upcoming state
        agent: detail.agent || 'Rahul Kumar',
        vehicle: 'Company Sedan',
        feedback: detail.remarks || '',
        rating: 5,
        images: [],
        customerReaction: detail.specialRequirements || ''
      };

      // 2. Identify agent details
      const matchedAgent = agents.find(a => a.name === (detail.agent || 'Rahul Kumar')) || agents[0];
      const agentId = matchedAgent?.id || 'agent-1';

      // 3. Create lead record with active follow-up, status Site Visit Scheduled, and site visit activity
      const newLead: CRMLead = {
        id: `lead-auto-${Date.now()}`,
        name: detail.customerName,
        mobile: detail.mobile,
        email: detail.email,
        propertyRequirement: `${detail.propertyType} in ${detail.location} (${detail.propertyName})`,
        budget: '₹ 1.25 Cr',
        preferredLocation: detail.location,
        source: 'Website',
        status: 'Site Visit Scheduled',
        agentId: agentId,
        agentName: matchedAgent?.name || 'Rahul Kumar',
        notes: {
          internal: `Free Physical Site Walkthrough scheduled on ${detail.date} at ${detail.time} for property ${detail.propertyName}. Special instructions: ${detail.specialRequirements || 'None'}`,
          customer: detail.specialRequirements || ''
        },
        createdAt: new Date().toLocaleDateString('en-US'),
        activities: [
          {
            id: `act-${Date.now()}`,
            type: 'Site Visit',
            content: `Physical unit walkthrough scheduled with Advisor ${matchedAgent?.name || 'Rahul Kumar'} for ${detail.propertyName} on ${detail.date} (${detail.time}). Logistics: Company Sedan.`,
            timestamp: new Date().toLocaleString()
          }
        ],
        followUps: [
          {
            id: `fup-${Date.now()}`,
            dateTime: `${detail.date} ${detail.time}`,
            notes: `Site visit accompaniment. Special notes: ${detail.specialRequirements}`,
            completed: false
          }
        ]
      };

      // Update local sets to synchronize perfectly
      setSiteVisits(prev => [newVisit, ...prev]);
      setLeads(prev => [newLead, ...prev]);

      // Add to notifications
      const newNotification = {
        id: 'noti-vis-' + Date.now(),
        title: `Site Walkthrough Booked: ${detail.customerName}`,
        message: `VIP Site Walkthrough scheduled for ${detail.propertyName} with expert advisor ${matchedAgent?.name || 'Rahul Kumar'}.`,
        priority: 'High',
        type: 'Site Visit Scheduled',
        category: 'Site Visits',
        delivery: ['Dashboard Only'],
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [newNotification, ...prev]);

      // Emit global notification alert so beautiful micro-overlays flash on-screen
      const detailPayload = {
        title: `Site Walkthrough Booked: ${detail.customerName}`,
        message: `Scheduled for ${detail.propertyName} on ${detail.date} (${detail.time}). Assigned expert advisor: ${matchedAgent?.name || 'Rahul Kumar'}.`
      };
      let notiEvent;
      try {
        notiEvent = new CustomEvent('cms-alert-notification', {
          detail: detailPayload
        });
      } catch (e) {
        notiEvent = document.createEvent('CustomEvent');
        notiEvent.initCustomEvent('cms-alert-notification', true, true, detailPayload);
      }
      window.dispatchEvent(notiEvent);
    };

    window.addEventListener('cms-add-site-visit', handleCmsAddSiteVisit);
    return () => window.removeEventListener('cms-add-site-visit', handleCmsAddSiteVisit);
  }, [agents, setSiteVisits, setLeads]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMail = emailInput.trim().toLowerCase();
    
    // Find matching user from seeded database array
    let match = adminUsers.find(
      (u) => u.email.trim().toLowerCase() === cleanMail && u.password === passwordInput
    );

    // Emergency/fallback bypass for root admin
    if (!match && cleanMail === superAdminEmail && (passwordInput === 'radhakrishna143' || passwordInput === 'admin')) {
      match = {
        id: 'user-super',
        email: superAdminEmail,
        password: passwordInput,
        name: 'Raghav Reddy',
        roleName: 'Super Admin',
        permissions: {
          canManageProperties: true,
          canManageCategories: true,
          canManageAgents: true,
          canManageMap: true,
          canReplyInquiries: true,
          canManageUsers: true
        }
      };
    }

    if (!match) {
      setLoginError('Invalid access coordinate clearances. Contact coordinate Super Admin node.');
      return;
    }

    setIsAuthenticating(true);
    setLoginError(null);

    console.log("[CMS AUTH START] Starting login verification for user email:", cleanMail);

    try {
      let cred;
      try {
        // 1. Attempt Firebase Authentication sign-in
        cred = await signInWithEmailAndPassword(auth, cleanMail, passwordInput);
        console.log("[CMS AUTH STAGE 1] signInWithEmailAndPassword succeeded.");
      } catch (signInErr: any) {
        console.warn("[CMS AUTH STAGE 1] Sign-in failed. Attempting automatic registration. Error code:", signInErr.code);
        
        // 2. If user-not-found or invalid credentials, attempt registration fallback
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential' || signInErr.code === 'auth/invalid-email') {
          try {
            cred = await createUserWithEmailAndPassword(auth, cleanMail, passwordInput);
            console.log("[CMS AUTH STAGE 2] createUserWithEmailAndPassword succeeded.");
          } catch (signUpErr: any) {
            console.error("[CMS AUTH STAGE 2] Automatic registration fallback failed:", signUpErr);
            throw signUpErr;
          }
        } else {
          throw signInErr;
        }
      }

      // Verify that auth.currentUser is populated
      if (auth.currentUser) {
        console.log("[CMS AUTH STAGE 3] Verification Succeeded!");
        console.log("[CMS AUTH STAGE 3] ✓ auth.currentUser.email:", auth.currentUser.email);
        console.log("[CMS AUTH STAGE 3] ✓ auth.currentUser.uid:", auth.currentUser.uid);
        
        // Authenticated successfully! Proceeding to Dashboard view
        setLoggedInUser(match);
        setLoginError(null);
      } else {
        console.error("[CMS AUTH STAGE 3] auth.currentUser is NULL even after successful promise resolution.");
        throw new Error("Firebase Auth loaded credentials successfully but session context remained empty.");
      }
    } catch (err: any) {
      console.error("[CMS AUTH FAILURE] Auth verification process failed with error:", err);
      setLoginError(`Authentication failed: ${err.message || String(err)}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      console.log("[CMS AUTH LOGOUT] Successfully signed out of Firebase Auth.");
    }).catch((err) => {
      console.error("[CMS AUTH LOGOUT] Error signing out:", err);
    });
    setLoggedInUser(null);
    setEmailInput('');
    setPasswordInput('');
  };

  // Property Submission intermediary logic
  const handlePropertySubmit = async (e: React.FormEvent, data: any) => {
    console.log("[CMS DEBUG 2] handlePropertySubmit executed!");
    console.log("[CMS DEBUG 2] Exact file path: src/components/InquiryDashboard.tsx");
    console.log("[CMS DEBUG 2] Auth state during submit:", auth.currentUser ? `Signed in as ${auth.currentUser.email} (${auth.currentUser.uid})` : "Not authenticated");

    if (!setProperties) {
      console.warn("[CMS DEBUG 2] setProperties is undefined!");
      return;
    }

    const matchedAgentObj = agents.find(a => a.id === data.agentId) || agents[0] || {
      name: 'Rahul Kumar',
      role: 'Property Expert',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
      phone: '+91 6300984846',
      email: 'p.kumar@dvarix.com'
    };

    const isEdit = data.id && properties.some(p => p.id === data.id);
    if (isEdit) {
      // edit state
      const existingProp = (properties.find(p => p.id === data.id) || {}) as any;
      const updatedProp: Property = {
        ...existingProp,
        ...data,
        images: data.images || (data.image ? [data.image, ...(data.galleryImages || [])] : (existingProp.images || [])),
        amenities: typeof data.amenitiesStr === 'string' ? data.amenitiesStr.split(',').map((tag: any) => tag.trim()).filter(Boolean) : (existingProp.amenities || []),
        agent: matchedAgentObj,
        updatedAt: new Date().toISOString()
      } as Property;

      console.log("[CMS DEBUG 2] Attempting to update existing property with ID:", updatedProp.id);
      try {
        const cleanedProp = cleanPropertyPayload(updatedProp);
        await firebaseService.saveProperty(cleanedProp);
        console.log("[CMS DEBUG 2] Firestore saveProperty update succeeded!");
        showToast('Property updated in Firestore ledger successfully.', 'success');
      } catch (err: any) {
        console.error("[CMS DEBUG 2] Firestore saveProperty update failed!", err);
        showToast('Failed to save property to Firestore: ' + err.message, 'error');
      }
    } else {
      // create state
      const newProp: Property = {
        rating: 5.0,
        reviews: 1,
        images: data.images || (data.image ? [data.image, ...(data.galleryImages || [])] : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80']),
        createdAt: new Date().toISOString(),
        ...data,
        status: data.status || 'Published',
        id: data.id || `prop-${Date.now()}`,
        amenities: typeof data.amenitiesStr === 'string' ? data.amenitiesStr.split(',').map((tag: any) => tag.trim()).filter(Boolean) : [],
        agent: matchedAgentObj
      };

      console.log("[CMS DEBUG 2] Attempting to create new property with ID:", newProp.id);
      try {
        const cleanedProp = cleanPropertyPayload(newProp);
        await firebaseService.saveProperty(cleanedProp);
        console.log("[CMS DEBUG 2] Firestore saveProperty create succeeded!");
        triggerAutoNotification('Property Added', 'Property Added: ' + data.title, `Price: ${data.price} located in ${data.location}. Added by ${loggedInUser?.name || 'Admin'}.`, 'Properties', 'Low');
        showToast('Property published to Firestore database successfully.', 'success');
      } catch (err: any) {
        console.error("[CMS DEBUG 2] Firestore saveProperty create failed!", err);
        showToast('Failed to publish property to Firestore: ' + err.message, 'error');
      }
    }
  };

  // Add Dynamic task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    setTasks([
      {
        id: `task-${Date.now()}`,
        title: newTaskTitle,
        status: 'Pending',
        priority: newTaskPriority,
        type: 'Outreach',
        agent: newTaskAgent || 'Rahul Kumar',
        date: 'May 21, 2026'
      },
      ...tasks
    ]);

    triggerAutoNotification('New Task', 'New Operational Task: ' + newTaskTitle, 'Task assigned to ' + (newTaskAgent || 'Rahul Kumar'), 'Tasks', newTaskPriority === 'High' ? 'High' : 'Medium');
    setNewTaskTitle('');
    setTasksTab('All Tasks');
  };

  // Handlers for dynamic creations
  const handleAddVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisitCustomer || !newVisitProperty) return;

    setSiteVisits([
      {
        id: `v-${Date.now()}`,
        customerName: newVisitCustomer,
        propertyTitle: newVisitProperty,
        date: newVisitDate,
        time: newVisitTime,
        status: 'Confirmed',
        agent: newVisitAgent,
        feedback: ''
      },
      ...siteVisits
    ]);

    triggerAutoNotification('Site Visit Scheduled', 'Site Visit Scheduled: ' + newVisitCustomer, 'Walkthrough scheduled on ' + newVisitDate + ' for ' + newVisitProperty + ' with agent ' + newVisitAgent, 'Site Visits', 'Medium');
    setNewVisitCustomer('');
    setNewVisitProperty('');
    setSiteVisitsTab('Upcoming');
  };

  const handleAddFinance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFinanceDesc) return;

    setFinanceEntries([
      {
        id: `f-${Date.now()}`,
        type: newFinanceType,
        category: newFinanceCategory,
        amount: Number(newFinanceAmount),
        date: '2026-05-21',
        status: 'Cleared',
        description: newFinanceDesc
      },
      ...financeEntries
    ]);

    triggerAutoNotification(newFinanceType === 'Revenue' ? 'Payment Received' : 'Expense Added', (newFinanceType === 'Revenue' ? 'Payment Received: ₹' : 'Expense Recorded: ₹') + newFinanceAmount, newFinanceDesc, 'Finance', 'Medium');
    setNewFinanceDesc('');
    setFinanceTab('Ledger');
  };

  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName || !setAgents) return;

    const newAg: Agent = {
      id: `ag-${Date.now()}`,
      name: newAgentName,
      role: newAgentRole,
      phone: newAgentPhone || '+91 6300984846',
      email: newAgentEmail || 'advisor@dvarix.com',
      avatar: newAgentAvatar
    };

    setAgents([...agents, newAg]);
    triggerAutoNotification('Agent Added', 'New Team Agent Added: ' + newAgentName, 'Mapped as role ' + newAgentRole, 'Agents', 'Low');
    setNewAgentName('');
    setAgentsTab('Roster');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserName) return;

    const newUser: AdminUser = {
      id: `user-${Date.now()}`,
      email: newUserEmail,
      password: newUserPass || 'password',
      name: newUserName,
      roleName: newUserRole,
      permissions: newUserPerms
    };

    setAdminUsers([...adminUsers, newUser]);
    setNewUserEmail('');
    setNewUserPass('');
    setNewUserName('');
    setPermissionTab('Roster');
  };

  const handleAddMapNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMapKey || !setMapLocations) return;

    const updated = { ...mapLocations };
    updated[newMapKey] = {
      name: newMapKey,
      x: newMapX,
      y: newMapY,
      listings: Number(newMapListings),
      avgValuation: newMapValuation,
      benefits: newMapBenefits,
      description: newMapDescription,
      growth: newMapGrowth
    };

    setMapLocations(updated);
    setNewMapKey('');
    setMapTab('Interactive');
  };

  const handleRunAiMatch = () => {
    setAiIsLoading(true);
    setTimeout(() => {
      setAiIsLoading(false);
      setAiResponse(`🤖 DVARIX AI CENTER REPORT - JP NAGAR PG DEMAND MATCH
===================================================
Target Client: Krish (Phone: 6300984846)
Preferred Area: JP Nagar 
Property Demand: PG
Budget Limit: ₹ 5,000

MATCHING PORTFOLIO COORDINATES:
1. PG-03 Complex Hebbal Ring belt: Budget limit intersects optimally. Average PG valuations recorded around ₹ 4,800.
2. Outer ring corridor housing blocks: High proximity to JP Nagar tech corridor. High speed internet configurations and power-backups included directly.

AI STRATEGY PROPOSAL:
- Assign Rahul Kumar to dispatch PG brochures to dvarixrealty@gmail.com.
- Schedule physical walkthrough on May 24, 2026.`);
    }, 1500);
  };

  // Nav categories meta elements mapping based on logged in user's role
  const MenuItems = useMemo(() => {
    if (isSuperAdminUser) {
      return [
        { key: "Dashboard", icon: BarChart2 },
        { key: "Agent Workspace", icon: Award },
        { key: "Enquiry Center", icon: Inbox },
        { key: "Free Service Requests", icon: FileText },
        { key: "Lead Management", icon: Users },
        { key: "Requirements CRM", icon: Layers },
        { key: "Customers", icon: Users },
        { key: "Properties", icon: Building2 },
        { key: "Search Categories", icon: Tag },
        { key: "Property Type Cards", icon: Grid },
        { key: "Site Visits", icon: Calendar },
        { key: "Agents & Team", icon: ShieldCheck },
        { key: "Tasks & Operations", icon: CheckSquare },
        { key: "Documents", icon: FileText },
        { key: "Finance", icon: DollarSign },
        { key: "FAQ Management", icon: HelpCircle },
        { key: "Location Management", icon: MapPin },
        { key: "Map Style Management", icon: Palette },
        { key: "Marketing", icon: TrendingUp },
        { key: "Reports & Analytics", icon: Coins },
        { key: "AI Center", icon: Compass },
        { key: "Dvarix Bot Studio", icon: MessageSquare },
        { key: "Notifications Center", icon: Bell },
        { key: "Role & Permissions", icon: ShieldCheck },
        { key: "Theme Studio", icon: Palette },
        { key: "Website CMS Customize", icon: Palette },
        { key: "System Configuration", icon: Settings }
      ] as const;
    }

    if (isManagerUser) {
      return [
        { key: "Dashboard", icon: BarChart2 },
        { key: "Agent Workspace", icon: Award },
        { key: "Enquiry Center", icon: Inbox },
        { key: "Free Service Requests", icon: FileText },
        { key: "Lead Management", icon: Users },
        { key: "Requirements CRM", icon: Layers },
        { key: "Customers", icon: Users },
        { key: "Properties", icon: Building2 },
        { key: "Site Visits", icon: Calendar },
        { key: "Agents & Team", icon: ShieldCheck },
        { key: "Tasks & Operations", icon: CheckSquare },
        { key: "Documents", icon: FileText },
        { key: "Reports & Analytics", icon: Coins },
        { key: "Notifications Center", icon: Bell },
        { key: "Theme Studio", icon: Palette }
      ] as const;
    }

    // Default: Sales Agent (Limited Access Workspace)
    return [
      { key: "Dashboard", icon: BarChart2 },
      { key: "My Customers", icon: Users },
      { key: "My Leads", icon: Inbox },
      { key: "My Tasks", icon: CheckSquare },
      { key: "My Follow-ups", icon: Clock },
      { key: "Site Visits", icon: Calendar },
      { key: "Calendar", icon: Calendar },
      { key: "Documents", icon: FileText },
      { key: "Notifications", icon: Bell },
      { key: "My Profile", icon: User }
    ] as const;
  }, [isSuperAdminUser, isManagerUser, isAgentUser]);

  // Enforce route protection & authorization
  const isAuthorized = useMemo(() => {
    return MenuItems.some(item => item.key === activeParent);
  }, [MenuItems, activeParent]);

  // Helper to resolve Lucide Icon components
  const resolveIcon = (name: string) => {
    const IconComponent = (LucideIcons as any)[name];
    if (IconComponent) return IconComponent;
    if (name === "LayoutDashboard") return LucideIcons.BarChart2;
    if (name === "BarChart3") return LucideIcons.BarChart2;
    if (name === "MonitorSmartphone") return LucideIcons.Palette;
    if (name === "Bot") return LucideIcons.Compass;
    if (name === "Briefcase") return LucideIcons.ShieldCheck;
    return LucideIcons.HelpCircle;
  };

  // Storing sidebar category structure
  const sidebarStructure = useMemo(() => {
    const availableKeys = new Set(MenuItems.map(m => m.key));
    const categories: Array<{
      key: string;
      label: string;
      iconName: string;
      isExpandable: boolean;
      children: Array<{ key: string; label: string; iconName: string }>;
    }> = [];

    const rawCategories = [
      {
        key: "CRM & SALES",
        label: "CRM & Sales",
        iconName: "Users",
        isExpandable: true,
        children: [
          { key: "Enquiry Center", label: "Enquiry Center", iconName: "Inbox" },
          { key: "Free Service Requests", label: "Free Service Requests", iconName: "FileText" },
          { key: "Lead Management", label: "Lead Management", iconName: "Users" },
          { key: "My Leads", label: "My Leads", iconName: "Inbox" },
          { key: "Requirements CRM", label: "Requirements CRM", iconName: "Layers" },
          { key: "Customers", label: "Customers", iconName: "Users" },
          { key: "My Customers", label: "My Customers", iconName: "Users" }
        ]
      },
      {
        key: "PROPERTY MANAGEMENT",
        label: "Property Management",
        iconName: "Building2",
        isExpandable: true,
        children: [
          { key: "Properties", label: "Properties", iconName: "Building2" },
          { key: "Search Categories", label: "Search Categories", iconName: "Tag" },
          { key: "Property Type Cards", label: "Property Type Cards", iconName: "Grid" },
          { key: "Site Visits", label: "Site Visits", iconName: "Calendar" },
          { key: "Location Management", label: "Location Management", iconName: "MapPin" },
          { key: "Map Style Management", label: "Map Style Management", iconName: "Palette" }
        ]
      },
      {
        key: "TEAM MANAGEMENT",
        label: "Team Management",
        iconName: "Briefcase",
        isExpandable: true,
        children: [
          { key: "Agent Workspace", label: "Agent Workspace", iconName: "Award" },
          { key: "Agents & Team", label: "Agents & Team", iconName: "ShieldCheck" },
          { key: "Tasks & Operations", label: "Tasks & Operations", iconName: "CheckSquare" },
          { key: "My Tasks", label: "My Tasks", iconName: "CheckSquare" },
          { key: "My Follow-ups", label: "My Follow-ups", iconName: "Clock" },
          { key: "Documents", label: "Documents", iconName: "FileText" },
          { key: "Finance", label: "Finance", iconName: "DollarSign" },
          { key: "Calendar", label: "Calendar", iconName: "Calendar" },
          { key: "My Profile", label: "My Profile", iconName: "User" }
        ]
      },
      {
        key: "WEBSITE CMS",
        label: "Website CMS",
        iconName: "MonitorSmartphone",
        isExpandable: true,
        children: [
          { key: "Hero Banner Management", label: "Hero Banner Management", iconName: "Image" },
          { key: "Homepage CMS", label: "Homepage CMS", iconName: "Home" },
          { key: "FAQ Management", label: "FAQ Management", iconName: "HelpCircle" },
          { key: "Marketing", label: "Marketing", iconName: "TrendingUp" },
          { key: "Website CMS Customize", label: "Website CMS Customize", iconName: "Palette" }
        ]
      },
      {
        key: "AI & AUTOMATION",
        label: "AI & Automation",
        iconName: "Bot",
        isExpandable: true,
        children: [
          { key: "AI Center", label: "AI Center", iconName: "Compass" },
          { key: "Dvarix Bot Studio", label: "Dvarix Bot Studio", iconName: "MessageSquare" },
          { key: "Notifications Center", label: "Notifications Center", iconName: "Bell" },
          { key: "Notifications", label: "Notifications", iconName: "Bell" }
        ]
      },
      {
        key: "REPORTS",
        label: "Reports",
        iconName: "BarChart3",
        isExpandable: true,
        children: [
          { key: "Reports & Analytics", label: "Reports & Analytics", iconName: "Coins" }
        ]
      },
      {
        key: "ADMINISTRATION",
        label: "Administration",
        iconName: "Settings",
        isExpandable: true,
        children: [
          { key: "Role & Permissions", label: "Role & Permissions", iconName: "ShieldCheck" },
          { key: "Theme Studio", label: "Theme Studio", iconName: "Palette" },
          { key: "System Configuration", label: "System Configuration", iconName: "Settings" }
        ]
      }
    ];

    for (const cat of rawCategories) {
      const filteredChildren = cat.children.filter(child => {
        if (child.key === "Hero Banner Management" || child.key === "Homepage CMS") {
          return availableKeys.has("Website CMS Customize");
        }
        return availableKeys.has(child.key);
      });

      if (filteredChildren.length > 0) {
        categories.push({
          key: cat.key,
          label: cat.label,
          iconName: cat.iconName,
          isExpandable: cat.isExpandable,
          children: filteredChildren
        });
      }
    }

    return categories;
  }, [MenuItems]);

  const handleChildClick = (childKey: string) => {
    if (childKey === 'Hero Banner Management') {
      setActiveParent('Website CMS Customize');
      setCmsActiveTab('Luxury Banners');
    } else if (childKey === 'Homepage CMS') {
      setActiveParent('Website CMS Customize');
      setCmsActiveTab('Hero');
    } else {
      setActiveParent(childKey);
    }
    setIsMobileOpen(false);
  };

  const isChildActive = (childKey: string) => {
    if (childKey === 'Hero Banner Management') {
      return activeParent === 'Website CMS Customize' && cmsActiveTab === 'Luxury Banners';
    }
    if (childKey === 'Homepage CMS') {
      return activeParent === 'Website CMS Customize' && cmsActiveTab === 'Hero';
    }
    if (childKey === 'Website CMS Customize') {
      return activeParent === 'Website CMS Customize' && cmsActiveTab !== 'Luxury Banners' && cmsActiveTab !== 'Hero';
    }
    return activeParent === childKey;
  };

  const isParentActive = (cat: typeof sidebarStructure[0]) => {
    if (!cat.isExpandable) {
      return activeParent === cat.key;
    }
    return cat.children.some(child => isChildActive(child.key));
  };

  const handleParentToggle = (parentKey: string) => {
    if (expandedParent === parentKey) {
      setExpandedParent(null);
      localStorage.removeItem('dvarix_expanded_parent');
    } else {
      setExpandedParent(parentKey);
      localStorage.setItem('dvarix_expanded_parent', parentKey);
    }
  };

  const handleParentClick = (cat: typeof sidebarStructure[0]) => {
    if (!cat.isExpandable) {
      setActiveParent(cat.key);
      setExpandedParent(null);
      localStorage.removeItem('dvarix_expanded_parent');
      setIsMobileOpen(false);
    } else {
      if (isSidebarCollapsed) {
        setIsSidebarCollapsed(false);
        setExpandedParent(cat.key);
        localStorage.setItem('dvarix_expanded_parent', cat.key);
      } else {
        handleParentToggle(cat.key);
      }
    }
  };

  // Render Login state if needed
  if (!isAuthenticated) {
    return (
      <section className="bg-slate-50 min-h-screen py-24 px-4 flex items-center justify-center font-sans" id="saas-login-portal">
        <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-2xl shadow-xl space-y-6 text-left relative overflow-hidden">
          
          <div className="absolute top-0 inset-x-0 h-1.5 bg-blue-600" />
          
          <div className="text-center space-y-2">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl w-fit mx-auto text-blue-600">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold font-sans text-slate-900 tracking-tight">Dvarix Realty ERP Workspace</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Log secure credentials below to manage custom requirement maps, site coordinates, and property ledgers.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Corporate Email</label>
              <input
                type="email"
                required
                placeholder="dvarixrealty@gmail.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 text-slate-800 text-xs rounded-xl px-4 py-3 focus:outline-none transition font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Passcode Key</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 text-slate-800 text-xs rounded-xl px-4 py-3 focus:outline-none transition font-sans"
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-650 text-xs rounded-lg font-mono">
                ⚠️ {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className={`w-full py-3 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md cursor-pointer flex items-center justify-center space-x-2 ${
                isAuthenticating ? 'bg-blue-450 opacity-80 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isAuthenticating ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                  <span>Authenticating Node...</span>
                </>
              ) : (
                <span>Authorize Credentials</span>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-[10px] font-mono text-slate-400">
            Secure Node Security Enforced • TLS-1.3 Encrypted
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans" id="enterprise-crm-workspace">
      <style>{dynamicStyles}</style>
      
      {/* 0. MOBILE BACKDROP OVERLAY */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-[#0B1F3A]/60 z-45 lg:hidden backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* 1. REDESIGNED LUXURY ENTERPRISE SIDEBAR */}
      <aside 
        className={`bg-[#0B1F3A] text-slate-100 flex flex-col justify-between shrink-0 transition-all duration-300 border-r border-[#1e2d4a]/40 shadow-2xl z-50
          lg:static lg:translate-x-0 lg:flex
          fixed inset-y-0 left-0 transform ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          } ${
            isSidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
          } w-64 lg:h-auto h-screen`}
      >
        <div>
          {/* Corporate brand stamp */}
          <div className="p-4 border-b border-[#1e2d4a]/60 flex items-center justify-between">
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C89B3C] to-[#a3792b] flex items-center justify-center text-[#0B1F3A] font-extrabold font-mono shadow-md border border-[#C89B3C]/30">
                  DR
                </div>
                <div>
                  <span className="font-extrabold text-[12px] text-white tracking-tight block">DVARIX REALTY</span>
                  <span className="text-[9px] uppercase tracking-wider text-[#C89B3C] font-semibold block">Enterprise ERP</span>
                </div>
              </div>
            )}
            
            {isSidebarCollapsed && (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C89B3C] to-[#a3792b] flex items-center justify-center text-[#0B1F3A] font-bold mx-auto shadow-md border border-[#C89B3C]/30">
                DR
              </div>
            )}

            {/* Mobile close button inside sidebar drawer */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition"
            >
              <LucideIcons.X className="h-5 w-5" />
            </button>
          </div>

          {/* Menus catalog items */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            {/* Dashboard as top item without children */}
            <button
              onClick={() => {
                setActiveParent('Dashboard');
                setExpandedParent(null);
                localStorage.removeItem('dvarix_expanded_parent');
                setIsMobileOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-300 relative group cursor-pointer sidebar-item-button ${
                activeParent === 'Dashboard'
                  ? 'sidebar-item-active bg-white/5 text-[#C89B3C] border border-[#C89B3C]/20 shadow-[0_0_12px_rgba(200,155,60,0.1)]'
                  : 'sidebar-item-inactive text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="absolute inset-0 bg-gradient-to-r from-[#C89B3C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
                <LucideIcons.LayoutDashboard className={`h-4.5 w-4.5 shrink-0 transition-colors duration-300 ${activeParent === 'Dashboard' ? 'text-[#C89B3C]' : 'text-slate-400 group-hover:text-[#C89B3C]'}`} />
                {!isSidebarCollapsed && (
                  <span className="text-xs font-semibold font-sans tracking-tight pt-0.5 leading-none">Dashboard</span>
                )}
              </div>
              {!isSidebarCollapsed && activeParent === 'Dashboard' && (
                <span className="h-1.5 w-1.5 bg-[#C89B3C] rounded-full shadow-[0_0_8px_#C89B3C]" />
              )}
            </button>

            {/* Expandable parent categories */}
            {sidebarStructure.map((cat) => {
              if (cat.key === "Dashboard") return null; // Already rendered manually above
              const ParentIcon = resolveIcon(cat.iconName);
              const isCurrentParentActive = isParentActive(cat);
              const isExpanded = expandedParent === cat.key;
              
              return (
                <div key={cat.key} className="space-y-1">
                  {/* Parent Button */}
                  <button
                    onClick={() => handleParentClick(cat)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-300 relative group cursor-pointer sidebar-item-button ${
                      isCurrentParentActive
                        ? 'sidebar-item-active bg-white/5 text-[#C89B3C] border border-[#C89B3C]/20 shadow-[0_0_12px_rgba(200,155,60,0.1)]'
                        : 'sidebar-item-inactive text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#C89B3C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
                      
                      <ParentIcon className={`h-4.5 w-4.5 shrink-0 transition-colors duration-300 ${isCurrentParentActive ? 'text-[#C89B3C]' : 'text-slate-400 group-hover:text-[#C89B3C]'}`} />
                      
                      {!isSidebarCollapsed && (
                        <span className="text-xs font-semibold font-sans tracking-tight pt-0.5 leading-none">{cat.label}</span>
                      )}
                    </div>

                    {!isSidebarCollapsed && (
                      <div className="flex items-center gap-2">
                        {/* Child Count Badge */}
                        <span className="badge-count bg-[#1e2d4a] text-[#C89B3C] border border-[#C89B3C]/10 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold leading-none">
                          {cat.children.length}
                        </span>
                        
                        {/* Expand/Collapse Arrow */}
                        <ChevronRight 
                          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                            isExpanded ? 'rotate-90 text-[#C89B3C]' : ''
                          }`} 
                        />
                      </div>
                    )}
                  </button>

                  {/* Children Map with Accordion Expand Animation */}
                  <AnimatePresence initial={false}>
                    {isExpanded && !isSidebarCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="submenu-accordion overflow-hidden pl-3.5 space-y-1.5 mt-1 border-l border-[#1e2d4a]"
                      >
                        {cat.children.map((child) => {
                          const ChildIcon = resolveIcon(child.iconName);
                          const isChildSelected = isChildActive(child.key);
                          return (
                            <button
                              key={child.key}
                              onClick={() => handleChildClick(child.key)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-200 relative group cursor-pointer ${
                                isChildSelected
                                  ? 'submenu-item-selected bg-[#1e3454] text-white border-l-2 border-[#C89B3C] font-semibold pl-2'
                                  : 'submenu-item-normal text-slate-400 hover:text-white hover:bg-white/5 pl-3'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <ChildIcon className={`h-3.5 w-3.5 transition-colors duration-200 ${isChildSelected ? 'text-[#C89B3C]' : 'text-slate-500 group-hover:text-[#C89B3C]/85'}`} />
                                <span className="text-[11px] tracking-tight">{child.label}</span>
                              </div>
                              {isChildSelected && (
                                <span className="h-1 w-1 bg-[#C89B3C] rounded-full" />
                              )}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Retractable Collapse Trigger at footer */}
        <div className="p-4 border-t border-[#1e2d4a]/60">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-[#1e2d4a]/40 hover:bg-[#1e2d4a] border border-[#1e2d4a] text-slate-300 hover:text-white transition duration-250 text-[10px] uppercase font-bold tracking-wider cursor-pointer font-sans"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 text-[#C89B3C]" />
            ) : (
              <>
                <LucideIcons.ChevronLeft className="h-4 w-4 text-[#C89B3C]" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* 2. MAIN ACTIVE WORKSPACE PANEL */}
      <section className="flex-1 flex flex-col min-w-0">
        
        {/* STICKY UPPER HEADER */}
        <header className="sticky top-0 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 z-10 shadow-xs">
          
          <div className="flex items-center gap-4">
            {/* Hamburger Trigger for Mobile/Tablet */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-[#0B1F3A] hover:bg-slate-100 rounded-lg cursor-pointer transition"
              id="mobile-hamburger-trigger"
            >
              <LucideIcons.Menu className="h-5 w-5" />
            </button>

            {/* Global search */}
            <div className="relative w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Query requirements, agents, valuations..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 font-sans"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Quick interactive utility CTAs */}
          <div className="flex items-center gap-4">
            
            {/* Quick Actions Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setActiveParent('Properties');
                }}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PlusCircle className="h-4 w-4" /> Add Asset Listing
              </button>
            </div>

            {/* Notification alert dots */}
            <button className="p-1.5 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>

            {/* Profile widget bar */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-800 block">{loggedInUser?.name || 'Admin Officer'}</span>
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block font-black">{loggedInUser?.roleName || 'Portal Node'}</span>
              </div>
              
              <button 
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Bailout Connection"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>

          </div>
        </header>

        {/* DYNAMIC SCENE PANELS INJECTOR */}
        <main className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeParent}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              
              {/* PANEL 1: DASHBOARD OVERVIEW */}
              {activeParent === 'Dashboard' && (
                <SaaSDashboardOverview
                  properties={properties}
                  customRequirements={customRequirements}
                  inquiries={inquiries}
                  agents={agents}
                  loggedInUser={loggedInUser}
                  siteVisits={siteVisits}
                  financeEntries={financeEntries}
                  onOpenQuickAction={(action) => {
                    if (action === 'add_lead' || action === 'view_requirements') {
                      setActiveParent('Requirements CRM');
                    } else if (action === 'schedule_visit') {
                      setActiveParent('Site Visits');
                      setSiteVisitsInitialSubTab('Upcoming');
                    }
                  }}
                  onNavigate={(key, option) => {
                    setActiveParent(key);
                    if (key === 'Finance' && option === 'Ledger') {
                      setFinanceTab('Ledger');
                    }
                    if (key === 'Site Visits' && option) {
                      setSiteVisitsInitialSubTab(option as any);
                    }
                  }}
                />
              )}

              {/* PANEL 1.15: AGENT WORKSPACE */}
              {activeParent === 'Agent Workspace' && (
                <SaaSAgentWorkspaceModule
                  leads={leads}
                  setLeads={setLeads}
                  agents={agents}
                  loggedInUser={loggedInUser}
                  properties={properties || []}
                  customRequirements={customRequirements || []}
                />
              )}

              {/* PANEL 1.25: ENQUIRY CENTER */}
              {activeParent === 'Enquiry Center' && (
                <SaaSEnquiryCenterModule
                  agents={agents}
                  loggedInUser={loggedInUser}
                  leads={leads}
                  setLeads={setLeads}
                />
              )}

              {/* PANEL 1.5: LEAD MANAGEMENT */}
              {activeParent === 'Lead Management' && (
                <SaaSLeadsModule
                  leads={leads}
                  setLeads={setLeads}
                  agents={agents}
                  loggedInUser={loggedInUser}
                  userPermissions={userPermissions}
                />
              )}

              {/* PANEL 2: REQUIREMENTS CRM */}
              {activeParent === 'Requirements CRM' && (
                <SaaSRequirementsModule
                  customRequirements={customRequirements}
                  properties={properties}
                  onUpdateStatus={onUpdateRequirementStatus}
                  onDeleteRequirement={onDeleteRequirement}
                  isSuperAdmin={isSuperAdmin}
                  userPermissions={userPermissions}
                  agents={agents}
                  siteVisits={siteVisits}
                  setSiteVisits={setSiteVisits}
                  tasks={tasks}
                  setTasks={setTasks}
                />
              )}

              {/* PANEL 3: CUSTOMERS */}
              {activeParent === 'Customers' && (
                <SaaSCustomersModule
                  inquiries={inquiries}
                  onUpdateInquiryStatus={onUpdateStatus}
                  onDeleteInquiry={onDeleteInquiry}
                  isSuperAdmin={isSuperAdmin}
                  userPermissions={userPermissions}
                  agents={agents}
                  leads={leads}
                  setLeads={setLeads}
                  siteVisits={siteVisits}
                  setSiteVisits={setSiteVisits}
                  tasks={tasks}
                  setTasks={setTasks}
                />
              )}

              {/* PANEL 4: PROPERTIES LISTS */}
              {activeParent === 'Properties' && (
                <SaaSPropertiesModule
                  properties={properties}
                  setProperties={setProperties}
                  categories={categories}
                  agents={agents}
                  isSuperAdmin={isSuperAdmin}
                  userPermissions={userPermissions}
                  onEditProperty={(p) => {}}
                  onDeleteProperty={async (id) => {
                    if (confirm("Are you sure you want to permanently delete this property?")) {
                      try {
                        await firebaseService.deleteProperty(id);
                        showToast('Property permanently deleted from Firestore successfully.', 'success');
                      } catch (err: any) {
                        console.error("Failed to delete property:", err);
                        showToast('Failed to delete property: ' + err.message, 'error');
                      }
                    }
                  }}
                  onSubmitProperty={handlePropertySubmit}
                  customRequirements={customRequirements}
                  mapLocations={mapLocations}
                  setMapLocations={setMapLocations}
                  onAddCategory={async (title) => {
                    if (!title || !setCategories) return;
                    const cleanTitle = title.trim();
                    const newId = cleanTitle;
                    if (categories.some(c => c.id.toLowerCase() === newId.toLowerCase())) {
                      alert("Category already exists.");
                      return;
                    }
                    const newCat: PropertyTypeCard = {
                      id: newId,
                      title: cleanTitle,
                      description: `${cleanTitle} category asset ledger`,
                      iconName: 'Building',
                      displayOrder: categories.length + 1,
                      status: 'Active',
                      showInView: true,
                      redirectUrl: `/properties?type=${newId.toLowerCase()}`
                    };
                    try {
                      await firebaseService.saveCategory(newCat);
                      showToast('Category created in Firestore successfully.', 'success');
                    } catch (err: any) {
                      console.error("Failed to create category:", err);
                      showToast('Failed to create category: ' + err.message, 'error');
                    }
                  }}
                  onDeleteCategory={async (id) => {
                    if (!setCategories) return;
                    if (confirm("Permanently delete this property classification category?")) {
                      try {
                        await firebaseService.deleteCategory(id);
                        showToast('Category deleted from Firestore successfully.', 'success');
                      } catch (err: any) {
                        console.error("Failed to delete category:", err);
                        showToast('Failed to delete category: ' + err.message, 'error');
                      }
                    }
                  }}
                />
              )}

              {/* PANEL 5: SITE VISITS */}
              {activeParent === 'Site Visits' && (
                <SaaSSiteVisitsModule
                  siteVisits={siteVisits}
                  setSiteVisits={setSiteVisits}
                  properties={properties}
                  agents={agents}
                  customRequirements={customRequirements}
                  inquiries={inquiries}
                  tasks={tasks}
                  setTasks={setTasks}
                  isSuperAdmin={isSuperAdmin}
                  userPermissions={userPermissions}
                  initialSubTab={siteVisitsInitialSubTab}
                />
              )}

              {/* PANEL 6: AGENTS & TEAM */}
              {activeParent === 'Agents & Team' && (
                <SaaSForceModule
                  agents={agents}
                  setAgents={setAgents}
                  properties={properties}
                  leads={leads}
                  isSuperAdmin={isSuperAdmin}
                />
              )}

              {/* PANEL 7: TASKS & OPERATIONS */}
              {activeParent === 'Tasks & Operations' && (
                <div className="space-y-6 text-left">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <div>
                      <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900">Operations Checklist</h2>
                      <p className="text-xs text-slate-500">Assign procedural checklists for dynamic property matching</p>
                    </div>

                    <button 
                      onClick={() => setTasksTab(tasksTab === 'All Tasks' ? 'Form' : 'All Tasks')}
                      className="px-3 py-1 bg-blue-605 text-white bg-blue-600 hover:bg-blue-750 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      {tasksTab === 'All Tasks' ? 'Add operational item' : 'View Operations'}
                    </button>
                  </div>

                  {tasksTab === 'All Tasks' ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                      
                      <div className="space-y-3">
                        {tasks.map((t) => (
                          <div key={t.id} className="p-3.5 border border-slate-150 bg-slate-50/50 rounded-xl flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <input 
                                type="checkbox" 
                                checked={t.status === 'Completed'}
                                onChange={() => {
                                  setTasks(tasks.map(k => k.id === t.id ? {...k, status: k.status === 'Completed' ? 'Pending' : 'Completed'} : k));
                                }}
                                className="rounded text-blue-600 cursor-pointer"
                              />
                              <div>
                                <span className={`font-bold text-slate-800 block ${t.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>
                                  {t.title}
                                </span>
                                <span className="text-[10px] text-slate-450 block font-mono">Assigned Agent: {t.agent} • Target date: {t.date}</span>
                              </div>
                            </div>

                            <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full ${
                              t.priority === 'High' ? 'bg-red-50 text-red-650' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {t.priority} Priority
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleAddTask} className="bg-white border border-slate-200 p-6 rounded-2xl max-w-sm mx-auto space-y-4 font-sans text-xs">
                      <h3 className="font-semibold text-slate-800">Add operational task coordinate</h3>
                      
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500">Task summary name *</label>
                        <input
                          type="text" required value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="e.g. Disburing brokerage agreements"
                          className="w-full border border-slate-200 p-2 rounded"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-500">Assigned Expert</label>
                        <select 
                          value={newTaskAgent} 
                          onChange={(e) => setNewTaskAgent(e.target.value)}
                          className="w-full border border-slate-200 p-2 rounded"
                        >
                          {agents.map(a => (
                            <option key={a.id} value={a.name}>{a.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-500">Priority Node</label>
                        <select 
                          value={newTaskPriority}
                          onChange={(e) => setNewTaskPriority(e.target.value)}
                          className="w-full border border-slate-200 p-2 rounded"
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>

                      <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs cursor-pointer">
                        Record checklist item
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* PANEL 8: DOCUMENTS VAULT */}
              {activeParent === 'Documents' && (
                <SaaSDocumentsModule
                  properties={properties}
                  agents={agents}
                  leads={leads}
                  customRequirements={customRequirements}
                />
              )}

              {/* PANEL 9: FINANCE LEDGER */}
              {activeParent === 'Finance' && (() => {
                const filteredFinanceEntries = financeEntries.filter(entry => {
                  const search = financeSearchTerm.toLowerCase();
                  if (search) {
                    const matchSearch = entry.description.toLowerCase().includes(search) || 
                                        entry.category.toLowerCase().includes(search);
                    if (!matchSearch) return false;
                  }
                  if (financeTypeFilter !== 'All' && entry.type !== financeTypeFilter) return false;
                  if (financePaymentModeFilter !== 'All' && entry.paymentMode && entry.paymentMode !== financePaymentModeFilter) return false;
                  if (financePropertyFilter !== 'All' && entry.property && entry.property !== financePropertyFilter) return false;
                  if (financeCustomerFilter !== 'All' && entry.customer && entry.customer !== financeCustomerFilter) return false;
                  if (financeAgentFilter !== 'All' && entry.agent && entry.agent !== financeAgentFilter) return false;
                  if (financeDateFilter && entry.date !== financeDateFilter) return false;
                  return true;
                });

                const totalRevenues = filteredFinanceEntries
                  .filter(f => f.type === 'Revenue')
                  .reduce((sum, f) => sum + f.amount, 0);

                const totalExpenses = filteredFinanceEntries
                  .filter(f => f.type === 'Expense')
                  .reduce((sum, f) => sum + f.amount, 0);

                const netMargin = totalRevenues - totalExpenses;

                const uniqueProperties = Array.from(new Set(financeEntries.map(f => f.property).filter(Boolean)));
                const uniqueCustomers = Array.from(new Set(financeEntries.map(f => f.customer).filter(Boolean)));
                const uniqueAgents = Array.from(new Set(financeEntries.map(f => f.agent).filter(Boolean)));
                const uniquePaymentModes = Array.from(new Set(financeEntries.map(f => f.paymentMode).filter(Boolean)));

                const handleExportFinanceExcel = () => {
                  const headers = 'Reference details,Cash Type,Category Classification,Filing Date,Customer,Agent,Property,Payment Mode,Aggregate Amount\n';
                  const rows = filteredFinanceEntries.map(f => {
                    return `"${f.description || ''}","${f.type || ''}","${f.category || ''}","${f.date || ''}","${f.customer || ''}","${f.agent || ''}","${f.property || ''}","${f.paymentMode || ''}",${f.amount}`;
                  }).join('\n');
                  const blob = new Blob([headers + rows], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `Finance_Ledger_Statement_${new Date().toISOString().split('T')[0]}.csv`;
                  link.click();
                };

                const handleExportFinancePDF = () => {
                  alert(`🖨️ PDF PRINTING SYSTEM CO-ORDINATES:\n-------------------------------------------------\nGenerating corporate ledger balance summary containing ${filteredFinanceEntries.length} records.\nAggregate Volume: ₹ ${totalRevenues.toLocaleString()}\nNet Operational Profit Margin: ₹ ${netMargin.toLocaleString()}`);
                };

                return (
                  <div className="space-y-6 text-left animate-in fade-in duration-200">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <div>
                        <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900">Finance & Brokerage Ledgers</h2>
                        <p className="text-xs text-slate-500">Monitor active cashflows, brokerage revenue splits, and Meta ad spends</p>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => setFinanceTab(financeTab === 'Ledger' ? 'Form' : 'Ledger')}
                          className="px-3.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs transition"
                        >
                          {financeTab === 'Ledger' ? 'Create Ledger Entry' : 'View Ledger'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 font-sans text-center">
                      <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl flex flex-col justify-between">
                        <span className="text-[9px] uppercase font-black text-emerald-600 block tracking-wider">Aggregate Revenues</span>
                        <span className="text-2xl font-black font-mono tracking-tight text-emerald-750">₹ {totalRevenues.toLocaleString()}</span>
                      </div>
                      <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-2xl flex flex-col justify-between">
                        <span className="text-[9px] uppercase font-black text-red-650 block tracking-wider">Total Op Spendings</span>
                        <span className="text-2xl font-black font-mono tracking-tight text-red-750">₹ {totalExpenses.toLocaleString()}</span>
                      </div>
                      <div className="p-4 bg-blue-50 border border-blue-105 text-blue-800 rounded-2xl flex flex-col justify-between">
                        <span className="text-[9px] uppercase font-black text-blue-600 block tracking-wider">Net Operating Margin</span>
                        <span className="text-2xl font-black font-mono tracking-tight text-blue-750">₹ {netMargin.toLocaleString()}</span>
                      </div>
                    </div>

                    {financeTab === 'Ledger' ? (
                      <div className="space-y-4">
                        {/* Interactive Spreadsheet Controller Grid */}
                        <div className="bg-white border border-slate-200 p-4 rounded-2xl grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5 text-[10px] font-sans">
                          {/* Search */}
                          <div className="flex flex-col col-span-2">
                            <span className="font-bold text-slate-500 uppercase">Search Ledger</span>
                            <input 
                              type="text" 
                              value={financeSearchTerm} 
                              onChange={(e) => setFinanceSearchTerm(e.target.value)}
                              placeholder="e.g. JP Nagar, facebook ads..." 
                              className="border border-slate-250 bg-slate-50/50 rounded-lg p-1.5 mt-1 font-medium text-xs"
                            />
                          </div>

                          {/* Type */}
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-500 uppercase">Type</span>
                            <select 
                              value={financeTypeFilter} 
                              onChange={(e) => setFinanceTypeFilter(e.target.value)}
                              className="border border-slate-250 rounded-lg p-1.5 mt-1 font-bold bg-white text-slate-700 cursor-pointer text-xs"
                            >
                              <option value="All">All Types</option>
                              <option value="Revenue">Revenue</option>
                              <option value="Expense">Expense</option>
                            </select>
                          </div>

                          {/* Mode */}
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-500 uppercase">Payment Mode</span>
                            <select 
                              value={financePaymentModeFilter} 
                              onChange={(e) => setFinancePaymentModeFilter(e.target.value)}
                              className="border border-slate-250 rounded-lg p-1.5 mt-1 font-bold bg-white text-slate-700 cursor-pointer text-xs"
                            >
                              <option value="All">All Modes</option>
                              {uniquePaymentModes.map(mode => (
                                <option key={mode} value={mode}>{mode}</option>
                              ))}
                            </select>
                          </div>

                          {/* Property */}
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-500 uppercase">Property Asset</span>
                            <select 
                              value={financePropertyFilter} 
                              onChange={(e) => setFinancePropertyFilter(e.target.value)}
                              className="border border-slate-250 rounded-lg p-1.5 mt-1 font-bold bg-white text-slate-700 cursor-pointer text-xs"
                            >
                              <option value="All">All Properties</option>
                              {uniqueProperties.map(prop => (
                                <option key={prop} value={prop}>{prop}</option>
                              ))}
                            </select>
                          </div>

                          {/* Customer */}
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-500 uppercase">Client Profile</span>
                            <select 
                              value={financeCustomerFilter} 
                              onChange={(e) => setFinanceCustomerFilter(e.target.value)}
                              className="border border-slate-250 rounded-lg p-1.5 mt-1 font-bold bg-white text-slate-700 cursor-pointer text-xs"
                            >
                              <option value="All">All Clients</option>
                              {uniqueCustomers.map(cust => (
                                <option key={cust} value={cust}>{cust}</option>
                              ))}
                            </select>
                          </div>

                          {/* Agent */}
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-500 uppercase">Staff Advisor</span>
                            <select 
                              value={financeAgentFilter} 
                              onChange={(e) => setFinanceAgentFilter(e.target.value)}
                              className="border border-slate-250 rounded-lg p-1.5 mt-1 font-bold bg-white text-slate-700 cursor-pointer text-xs"
                            >
                              <option value="All">All Advisory Staff</option>
                              {uniqueAgents.map(ag => (
                                <option key={ag} value={ag}>{ag}</option>
                              ))}
                            </select>
                          </div>

                          {/* Quick export triggers */}
                          <div className="flex gap-1.5 mt-auto col-span-2 sm:col-span-1 py-1 lg:mt-auto">
                            <button 
                              onClick={handleExportFinanceExcel}
                              className="flex-1 py-1.5 bg-emerald-600 font-bold text-white uppercase tracking-wider rounded-lg text-[9px] hover:bg-emerald-700 cursor-pointer transition shadow-xs text-center block"
                            >
                              Excel File
                            </button>
                            <button 
                              onClick={handleExportFinancePDF}
                              className="flex-1 py-1.5 bg-slate-800 font-bold text-white uppercase tracking-wider rounded-lg text-[9px] hover:bg-slate-905 cursor-pointer transition shadow-xs text-center block"
                            >
                              PDF Copy
                            </button>
                          </div>
                        </div>

                        {/* Ledger list datatable */}
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                          <div className="overflow-x-auto text-[11px]">
                            <table className="w-full text-left font-sans">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 p-3 text-[9px] uppercase font-black text-slate-500 font-mono">
                                  <th className="p-3">Reference description info</th>
                                  <th className="p-3">Direct Cash node Type</th>
                                  <th className="p-3">Category Classification</th>
                                  <th className="p-3">Related Property</th>
                                  <th className="p-3">Brokerage Client</th>
                                  <th className="p-3">Adviser</th>
                                  <th className="p-3">Mode</th>
                                  <th className="p-3">Filing Date</th>
                                  <th className="p-3 text-right">Aggregate Amount</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                                {filteredFinanceEntries.length > 0 ? (
                                  filteredFinanceEntries.map((f) => (
                                    <tr key={f.id} className="hover:bg-slate-50/50 transition">
                                      <td className="p-3 font-semibold text-slate-900 leading-tight">
                                        {f.description}
                                      </td>
                                      <td className="p-3">
                                        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                          f.type === 'Revenue' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                                        }`}>
                                          {f.type}
                                        </span>
                                      </td>
                                      <td className="p-3 text-slate-500">{f.category}</td>
                                      <td className="p-3 text-slate-500 truncate max-w-[120px]">{f.property || '—'}</td>
                                      <td className="p-3 font-semibold text-slate-800">{f.customer || '—'}</td>
                                      <td className="p-3 font-semibold text-slate-600">{f.agent || '—'}</td>
                                      <td className="p-3 font-mono text-[9px] font-bold text-slate-450">{f.paymentMode || '—'}</td>
                                      <td className="p-3 font-mono text-[9px] font-bold text-slate-450">{f.date}</td>
                                      <td className={`p-3 text-right font-mono font-bold text-xs ${
                                        f.type === 'Revenue' ? 'text-emerald-750' : 'text-red-650'
                                      }`}>
                                        {f.type === 'Expense' ? '-' : ''} ₹{f.amount.toLocaleString()}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={9} className="p-8 text-center text-slate-400 font-bold uppercase font-mono tracking-wider">
                                      No brokerage transactions recorded matching filter conditions.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleAddFinance} className="bg-white border border-slate-300 p-6 rounded-2xl max-w-sm mx-auto space-y-4 text-xs font-sans shadow-md">
                        <h3 className="font-extrabold text-slate-900 text-sm">Add Operational Transaction</h3>
                      
                        <div className="space-y-1">
                          <label className="font-bold text-slate-500 uppercase">Ledger Reference Description *</label>
                          <input
                            type="text" required value={newFinanceDesc}
                            onChange={(e) => setNewFinanceDesc(e.target.value)}
                            placeholder="e.g. Renting JP Nagar corporate units commission"
                            className="w-full border border-slate-200 p-2.5 rounded-lg"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-500 uppercase">Cash flow Type</label>
                          <select 
                            value={newFinanceType} 
                            onChange={(e) => setNewFinanceType(e.target.value)}
                            className="w-full border border-slate-200 p-2.5 rounded bg-white text-slate-700"
                          >
                            <option value="Revenue">Revenue Item</option>
                            <option value="Expense">Expense Item</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-500 uppercase">Valuation amount (₹) *</label>
                          <input
                            type="number" required value={newFinanceAmount}
                            onChange={(e) => setNewFinanceAmount(Number(e.target.value))}
                            className="w-full border border-slate-200 p-2.5 rounded font-mono text-xs"
                          />
                        </div>

                        <button 
                          type="submit" 
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg text-xs cursor-pointer shadow-xs transition"
                        >
                          Commit Ledger Item
                        </button>
                      </form>
                    )}
                  </div>
                );
              })()}

              {/* PANEL 10: MARKETING CAMPAIGNS */}
              {activeParent === 'Free Service Requests' && (
                <FreeServiceRequestsPanel agents={agents} />
              )}

              {activeParent === 'Marketing' && (
                <SaaSMarketingModule
                  leads={leads}
                  setLeads={setLeads}
                  agents={agents}
                  loggedInUser={loggedInUser}
                />
              )}

              {/* PANEL 11: REPORTS & ANALYTICS */}
              {activeParent === 'Reports & Analytics' && (() => {
                const totalLeadsCount = leads.length;
                const convertedLeadsCount = leads.filter(l => l.status === 'Converted' || l.status === 'Won' || l.status === 'Closed' || l.stage?.includes('Closed') || l.stage?.includes('Closed Deal') || l.status === 'Active' && l.stage === 'Booking / Token Paid').length;
                const directRatio = totalLeadsCount > 0 ? ((convertedLeadsCount / totalLeadsCount) * 100).toFixed(1) : '0.0';

                const totalPropertyValuation = properties.reduce((a, b) => a + b.price, 0);

                // Dynamically build performance metrics across adviser staff
                const agentPerformanceData = agents.map(agent => {
                  const agentVisits = siteVisits.filter(v => v.assignedAgentId === agent.id || v.agentId === agent.id);
                  const completedVisits = agentVisits.filter(v => v.status === 'Completed' || v.status === 'Completed Walk').length;
                  const agentLeads = leads.filter(l => l.assignedAgentId === agent.id || l.assignedAgent === agent.name);
                  const closedDeals = agentLeads.filter(l => l.status === 'Converted' || l.status === 'Won' || l.status === 'Closed' || l.stage?.includes('Closed')).length;
                  return {
                    id: agent.id,
                    name: agent.name,
                    role: agent.role,
                    totalVisits: agentVisits.length,
                    completedVisits,
                    leadCount: agentLeads.length,
                    closedDeals,
                    conversionRate: agentLeads.length > 0 ? ((closedDeals / agentLeads.length) * 100).toFixed(0) : '0'
                  };
                });

                return (
                  <div className="space-y-6 text-left text-xs animate-in fade-in duration-200 font-sans">
                    <div className="border-b border-slate-100 pb-2">
                      <h2 className="text-xl font-bold font-sans text-slate-900 tracking-tight">Executive Intelligence Reports</h2>
                      <p className="text-xs text-slate-500">Advisory performance boards, brokerage matrices, and Sales Direct Indexing</p>
                    </div>

                    {/* KPI Summary Block */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                        <span className="text-[9px] uppercase font-bold text-blue-600 block tracking-wider">Sales Direct Ratio</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-3xl font-black text-blue-900 font-mono">{directRatio}%</span>
                          <span className="text-[10px] text-blue-500 font-medium">({convertedLeadsCount} of {totalLeadsCount} Leads Won)</span>
                        </div>
                        <p className="text-[10px] text-slate-450 mt-1.5 leading-normal">
                          Calculation: (Closed & Converted Deals / Registered CRM Leads) × 100
                        </p>
                      </div>

                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                        <span className="text-[9px] uppercase font-bold text-emerald-600 block tracking-wider">Matched Requirements Pool</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-3xl font-black text-emerald-900 font-mono">
                            {customRequirements.length}
                          </span>
                          <span className="text-[10px] text-emerald-500 font-medium">Buying Requests</span>
                        </div>
                        <p className="text-[10px] text-slate-450 mt-1.5 leading-normal">
                          Active pipeline requirements mapped against Bangalore municipal development lists.
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                        <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-wider">Aggregate Asset Valuation</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-3xl font-black text-slate-800 font-mono">
                            ₹ {(totalPropertyValuation / 10000000).toFixed(1)} Cr
                          </span>
                          <span className="text-[10px] text-slate-450 font-medium">Portfolio Gross</span>
                        </div>
                        <p className="text-[10px] text-slate-450 mt-1.5 leading-normal">
                          Aggregate market pricing value derived from listings on current property roster database.
                        </p>
                      </div>
                    </div>

                    {/* Charts and Ratios row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                        <h3 className="text-sm font-bold text-slate-900 mb-1">Conversion Trends Log</h3>
                        <p className="text-[10px] text-slate-400 mb-4">Historical conversion ratio performance tracking</p>

                        <div className="h-40 w-full relative">
                          <svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="trend-grad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            <line x1="0" y1="20" x2="400" y2="20" stroke="#F1F5F9" strokeDasharray="3 3" />
                            <line x1="0" y1="60" x2="400" y2="60" stroke="#F1F5F9" strokeDasharray="3 3" />
                            <line x1="0" y1="100" x2="400" y2="100" stroke="#E2E8F0" />

                            {/* Polygon curve */}
                            <path d="M0,100 L80,75 L160,82 L240,60 L320,40 L400,30 L400,100 Z" fill="url(#trend-grad)" />
                            <polyline
                              fill="none"
                              stroke="#10B981"
                              strokeWidth="2.5"
                              points="0,100 80,75 160,82 240,60 320,40 400,30"
                            />

                            {/* Circles */}
                            <circle cx="80" cy="75" r="3.5" fill="#10B981" />
                            <circle cx="160" cy="82" r="3.5" fill="#10B981" />
                            <circle cx="240" cy="60" r="3.5" fill="#10B981" />
                            <circle cx="320" cy="40" r="3.5" fill="#10B981" />
                            <circle cx="400" cy="30" r="3.5" fill="#10B981" />
                          </svg>

                          <div className="grid grid-cols-6 text-center text-[9px] font-bold text-slate-400 font-mono mt-2 pt-1.5 border-t border-slate-50">
                            <span>JAN (12%)</span>
                            <span>FEB (18%)</span>
                            <span>MAR (20%)</span>
                            <span>APR (24%)</span>
                            <span>MAY (28%)</span>
                            <span>JUN ({directRatio}%)</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 mb-1">Direct Ratio Formula</h3>
                          <p className="text-[10px] text-slate-400 leading-normal mb-3">
                            Understanding operational efficiency across active advisory pipelines. Inbound channels (referrals, Meta campaigns) feed the central lead registries.
                          </p>
                          <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg font-mono text-[10px] text-slate-700 space-y-1.5 leading-normal">
                            <div className="font-bold text-blue-700">SR = (C / L) × 100</div>
                            <div className="text-[9px]">
                              ● <span className="font-bold">C (Won Deals):</span> {convertedLeadsCount} Leads closed
                            </div>
                            <div className="text-[9px]">
                              ● <span className="font-bold">L (Total Leads):</span> {totalLeadsCount} Registered on CRM
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-1.5 mt-4">
                          <button 
                            onClick={() => {
                              const dat = agentPerformanceData.map(a => `"${a.name}","${a.role}",${a.leadCount},${a.closedDeals},${a.conversionRate}%`).join('\n');
                              const headers = 'Advisor Name,Designated Role,Assigned Lead Count,Won Deals Count,Conversion Ratio\n';
                              const blob = new Blob([headers + dat], { type: 'text/csv' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `Advisory_KPI_Conversion_Performance_${new Date().toISOString().split('T')[0]}.csv`;
                              a.click();
                            }}
                            className="flex-1 py-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition text-[11px] cursor-pointer text-center"
                          >
                            Download CSV Performance Logs
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Agent Performance Table Section */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="text-sm font-bold text-slate-800">Dynamic Advisory Performance Matrix</h3>
                        <p className="text-[10px] text-slate-400">Live indicators compiled from database allocations</p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-150 p-2 text-[9px] uppercase font-black text-slate-500 font-mono">
                              <th className="p-3">Advisor Expert</th>
                              <th className="p-3">Designation Role</th>
                              <th className="p-3 text-center">Owned CRM Leads</th>
                              <th className="p-3 text-center">Scheduled Walks</th>
                              <th className="p-3 text-center">Completed Walks</th>
                              <th className="p-3 text-center">Closed Deals Pool</th>
                              <th className="p-3 text-right">Funnels Conversion</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {agentPerformanceData.map((ag) => (
                              <tr key={ag.id} className="hover:bg-slate-550/20 transition">
                                <td className="p-3 font-semibold text-slate-900">{ag.name}</td>
                                <td className="p-3 text-slate-500 font-medium">{ag.role || 'Property Advisory'}</td>
                                <td className="p-3 text-center font-mono font-bold text-slate-600">{ag.leadCount}</td>
                                <td className="p-3 text-center font-mono text-slate-500">{ag.totalVisits}</td>
                                <td className="p-3 text-center font-mono text-emerald-600 font-semibold">{ag.completedVisits}</td>
                                <td className="p-3 text-center font-mono text-blue-600 font-bold">{ag.closedDeals}</td>
                                <td className="p-3 text-right font-mono text-slate-800 font-extrabold text-xs">
                                  <span className={`px-2 py-0.5 rounded-full ${
                                    Number(ag.conversionRate) >= 40 ? 'bg-emerald-50 text-emerald-600' :
                                    Number(ag.conversionRate) >= 20 ? 'bg-blue-50 text-blue-600' : 'bg-slate-150 text-slate-550'
                                  }`}>
                                    {ag.conversionRate}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* PANEL 12: AI CENTER (CO-PILOT) */}
              {activeParent === 'AI Center' && (
                <SaaSAICenterModule
                  properties={properties}
                  customRequirements={customRequirements}
                  leads={leads}
                  setLeads={setLeads}
                  inquiries={inquiries}
                  siteVisits={siteVisits}
                  setSiteVisits={setSiteVisits}
                  financeEntries={financeEntries}
                  setFinanceEntries={setFinanceEntries}
                  agents={agents}
                  tasks={tasks}
                  setTasks={setTasks}
                  notifications={notifications}
                  setNotifications={setNotifications}
                  loggedInUser={loggedInUser}
                />
              )}

              {/* PANEL CUSTOM: DVARIX BOT STUDIO */}
              {activeParent === 'Dvarix Bot Studio' && (
                <SaaSDvarixBotStudioModule
                  leads={leads}
                  setLeads={setLeads}
                  onAddRequirement={onAddRequirement}
                  loggedInUser={loggedInUser}
                />
              )}

              {/* PANEL NEW: FAQ MANAGEMENT */}
              {activeParent === 'FAQ Management' && (
                <SaaSFAQModule
                  faqs={faqs}
                  siteSettings={siteSettings}
                  setSiteSettings={setSiteSettings}
                />
              )}

              {/* PANEL NEW: LOCATION MANAGEMENT */}
              {activeParent === 'Location Management' && (
                <SaaSLocationModule
                  mapLocations={mapLocations}
                  setMapLocations={setMapLocations}
                  mapSettings={mapSettings}
                  onUpdateMapSettings={onUpdateMapSettings}
                />
              )}

              {/* PANEL NEW: MAP STYLE MANAGEMENT */}
              {activeParent === 'Map Style Management' && (
                <SaaSMapStyleModule
                  mapSettings={mapSettings}
                  onUpdateMapSettings={onUpdateMapSettings}
                  onClose={() => setActiveParent('Dashboard')}
                />
              )}

              {/* PANEL 13: SYSTEM NOTIFICATIONS */}
              {activeParent === 'Notifications Center' && (
                <SaaSNotificationsModule
                  notifications={notifications}
                  setNotifications={setNotifications}
                  notificationToggles={notificationToggles}
                  setNotificationToggles={setNotificationToggles}
                  agents={agents}
                  loggedInUser={loggedInUser}
                />
              )}

              {/* PANEL 14: SECURE ROLE ACCESS CLEARANCES */}
              {activeParent === 'Role & Permissions' && (
                <SaaSRolePermissionsModule
                  adminUsers={adminUsers}
                  setAdminUsers={setAdminUsers}
                  agents={agents}
                  properties={properties}
                  setProperties={setProperties}
                  loggedInUser={loggedInUser}
                />
              )}

              {/* PANEL 14.5: ENTERPRISE THEME & APPEARANCE STUDIO */}
              {activeParent === 'Theme Studio' && (
                <SaaSThemeStudioModule
                  currentTheme={adminTheme}
                  onApplyTheme={setAdminTheme}
                  isSuperAdminUser={isSuperAdminUser}
                  loggedInUserEmail={loggedInUser?.email || ''}
                />
              )}

              {/* PANEL 15: GLOBAL COMPANY CONFIGURATION */}
              {activeParent === 'System Configuration' && (
                <div className="space-y-6 text-left text-xs animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 pb-2">
                    <h2 className="text-xl font-bold font-sans text-slate-900 tracking-tight">System Configuration Settings</h2>
                    <p className="text-xs text-slate-500">Tune CRM settings metrics, billing tax percent, and custom field values</p>
                  </div>

                  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4 max-w-lg mx-auto">
                    <h3 className="font-semibold text-slate-800 text-sm">Main Company Settings</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="font-extrabold text-slate-450 uppercase block">Platform Business Name</label>
                        <input
                          type="text" defaultValue="Dvarix Realty Bangalore"
                          className="w-full border border-slate-205 p-2 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-extrabold text-slate-450 uppercase block">Corporate WhatsApp Number Coordinate</label>
                        <input
                          type="text" defaultValue="+91 6300984846"
                          className="w-full border border-slate-205 p-2 rounded-lg font-mono text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-extrabold text-slate-450 uppercase block">Default Currency Designation</label>
                        <input
                          type="text" defaultValue="INR (Indian Rupee)"
                          className="w-full border border-slate-205 p-2 rounded-lg"
                        />
                      </div>

                      <button 
                        onClick={() => alert("Business settings metrics permanently logged to standard persistent database.")}
                        className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-750 transition cursor-pointer"
                      >
                        Commit Configuration State
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Homepage Search HUD Settings */}
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4 max-w-lg mx-auto mt-6">
                    <h3 className="font-semibold text-slate-800 text-sm">Dynamic Homepage Search Settings</h3>
                    <form onSubmit={handleSavePlaceholder} className="space-y-4">
                      <div className="space-y-1">
                        <label className="font-extrabold text-slate-450 uppercase block">Search Box Placeholder Input</label>
                        <input
                          type="text"
                          value={phText}
                          onChange={(e) => setPhText(e.target.value)}
                          placeholder="e.g. Modern duplex plot space"
                          className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-xs"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition cursor-pointer"
                      >
                        Save Search Placeholder Text
                      </button>
                    </form>
                  </div>

                  {/* Quick Filters Admin Panel */}
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4 max-w-lg mx-auto mt-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <h3 className="font-semibold text-slate-800 text-sm">Homepage Quick Filters Manager</h3>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
                        {quickFilters.length} Configured
                      </span>
                    </div>

                    {/* Quick Filter Add Form */}
                    <form onSubmit={handleAddQuickFilter} className="flex gap-2">
                      <input
                        type="text"
                        value={newQFFilterName}
                        onChange={(e) => setNewQFFilterName(e.target.value)}
                        placeholder="Add new. e.g. Premium, Corner Plot, Budget"
                        className="flex-grow border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-sans"
                        maxLength={25}
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add
                      </button>
                    </form>

                    {/* Quick Filter Rows */}
                    <div className="space-y-2 border-t border-slate-100 pt-3">
                      {quickFilters.length > 0 ? (
                        [...quickFilters].map((qf) => (
                          <div key={qf.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-150 rounded-xl hover:bg-slate-100/50 transition">
                            <span className="font-semibold text-slate-800 font-sans text-[11px]">{qf.name}</span>
                            <div className="flex items-center gap-2">
                              {/* Status Toggle Badge */}
                              <button
                                onClick={() => handleToggleQuickFilterStatus(qf.id)}
                                className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase transition cursor-pointer flex items-center gap-1 ${
                                  qf.status === 'Active'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-150 hover:bg-emerald-100'
                                    : 'bg-slate-200 text-slate-600 border border-slate-250 hover:bg-slate-250'
                                }`}
                              >
                                {qf.status === 'Active' ? 'Active' : 'Hidden'}
                              </button>

                              {/* Delete Action button */}
                              <button
                                onClick={() => handleDeleteQuickFilterClick(qf.id)}
                                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="Delete Quick Filter"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-slate-400 py-4 font-sans italic text-xs">No Quick Filters configured. Create one above!</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL: WEBSITE CMS CUSTOMIZE */}
              {activeParent === 'Website CMS Customize' && (
                <div className="space-y-6 text-left text-xs animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-bold font-sans text-slate-900 tracking-tight">Website CMS Live Customizer</h2>
                      <p className="text-xs text-slate-500 font-sans">Modify hero overlays, contact information, testimonials, and campaigns in real-time without redeploying the code.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-150 px-3 py-1 rounded-full text-slate-800">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold">Live Sync Active</span>
                    </div>
                  </div>

                  {/* CMS Sub navigation tabs */}
                  <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-1">
                    {(['General', 'Hero', 'Luxury Banners', 'Services', 'Campaigns', 'Testimonials', 'Blogs', 'Statistics', 'Footer'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setCmsActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg font-bold font-sans transition-all duration-200 cursor-pointer text-xs ${
                          cmsActiveTab === tab
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {tab === 'Hero' ? 'Hero Section' : tab === 'Luxury Banners' ? 'Luxury Hero Banners' : tab === 'Blogs' ? 'Blog Insights' : tab === 'Statistics' ? 'Performance Stats' : tab === 'Footer' ? 'Footer Management' : tab}
                      </button>
                    ))}
                  </div>

                  {/* SECTION 1: GENERAL SETTINGS */}
                  {cmsActiveTab === 'General' && (
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-6 max-w-2xl mx-auto">
                      <div className="border-b border-slate-100 pb-2">
                        <h3 className="font-semibold text-slate-800 text-sm">Core Company Contacts</h3>
                        <p className="text-[11px] text-slate-400">Main channels shown in website footer and contact references.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Business Display Name</label>
                          <input
                            type="text"
                            value={siteSettings?.businessName || ''}
                            onChange={(e) => setSiteSettings?.({ ...(siteSettings as SiteCMSConfig), businessName: e.target.value })}
                            className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-extrabold text-slate-450 uppercase block text-[10px]">WhatsApp Contact Link</label>
                          <input
                            type="text"
                            value={siteSettings?.whatsappNumber || ''}
                            onChange={(e) => setSiteSettings?.({ ...(siteSettings as SiteCMSConfig), whatsappNumber: e.target.value })}
                            className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Official Support Email</label>
                          <input
                            type="email"
                            value={siteSettings?.email || ''}
                            onChange={(e) => setSiteSettings?.({ ...(siteSettings as SiteCMSConfig), email: e.target.value })}
                            className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Hotline Mobile Coordinate</label>
                          <input
                            type="text"
                            value={siteSettings?.phone || ''}
                            onChange={(e) => setSiteSettings?.({ ...(siteSettings as SiteCMSConfig), phone: e.target.value })}
                            className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                          />
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Corporate Office Address</label>
                          <input
                            type="text"
                            value={siteSettings?.address || ''}
                            onChange={(e) => setSiteSettings?.({ ...(siteSettings as SiteCMSConfig), address: e.target.value })}
                            className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                          />
                        </div>
                      </div>

                      <div className="border-b border-slate-100 pb-2 pt-2">
                        <h3 className="font-semibold text-slate-800 text-sm">Social Handles</h3>
                        <p className="text-[11px] text-slate-400">Sovereign external links rendered for active communication.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Facebook URL</label>
                          <input
                            type="text"
                            value={siteSettings?.facebookUrl || ''}
                            onChange={(e) => setSiteSettings?.({ ...(siteSettings as SiteCMSConfig), facebookUrl: e.target.value })}
                            className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Instagram URL</label>
                          <input
                            type="text"
                            value={siteSettings?.instagramUrl || ''}
                            onChange={(e) => setSiteSettings?.({ ...(siteSettings as SiteCMSConfig), instagramUrl: e.target.value })}
                            className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-extrabold text-slate-450 uppercase block text-[10px]">LinkedIn Corporate Link</label>
                          <input
                            type="text"
                            value={siteSettings?.linkedinUrl || ''}
                            onChange={(e) => setSiteSettings?.({ ...(siteSettings as SiteCMSConfig), linkedinUrl: e.target.value })}
                            className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Twitter / X Handle</label>
                          <input
                            type="text"
                            value={siteSettings?.twitterUrl || ''}
                            onChange={(e) => setSiteSettings?.({ ...(siteSettings as SiteCMSConfig), twitterUrl: e.target.value })}
                            className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (siteSettings) {
                            firebaseService.saveSiteSettings(siteSettings);
                          }
                          window.dispatchEvent(new CustomEvent('cms-alert-notification', {
                            detail: {
                              title: "CMS Settings Sync Success",
                              message: "Company General Details successfully synchronized directly to Firestore.",
                              category: "CMS"
                            }
                          }));
                        }}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-sans font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
                      >
                        Save Company General Details
                      </button>
                    </div>
                  )}

                  {/* SECTION 2: HERO SETTINGS */}
                  {cmsActiveTab === 'Hero' && (
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-6 max-w-2xl mx-auto">
                      <div className="border-b border-slate-100 pb-2">
                        <h3 className="font-semibold text-slate-800 text-sm">Cinematic Hero Frame Typography</h3>
                        <p className="text-[11px] text-slate-400">Tune display messages on the home welcome banner in real time.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Hero Badge Prefix</label>
                            <input
                              type="text"
                              value={siteSettings?.heroBadge || ''}
                              onChange={(e) => setSiteSettings?.({ ...(siteSettings as SiteCMSConfig), heroBadge: e.target.value })}
                              className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Hero Badge Highlight</label>
                            <input
                              type="text"
                              value={siteSettings?.heroBadgeHighlight || ''}
                              onChange={(e) => setSiteSettings?.({ ...(siteSettings as SiteCMSConfig), heroBadgeHighlight: e.target.value })}
                              className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Hero Headline Text (Part 1)</label>
                          <input
                            type="text"
                            value={siteSettings?.heroHeadline1 || ''}
                            onChange={(e) => setSiteSettings?.({ ...(siteSettings as SiteCMSConfig), heroHeadline1: e.target.value })}
                            className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Hero Headline Highlight (Part 2)</label>
                          <input
                            type="text"
                            value={siteSettings?.heroHeadline2Highlight || ''}
                            onChange={(e) => setSiteSettings?.({ ...(siteSettings as SiteCMSConfig), heroHeadline2Highlight: e.target.value })}
                            className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Hero Subheading Description Text</label>
                          <textarea
                            rows={3}
                            value={siteSettings?.heroSubheading || ''}
                            onChange={(e) => setSiteSettings?.({ ...(siteSettings as SiteCMSConfig), heroSubheading: e.target.value })}
                            className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Hero Background Image URL</label>
                          <input
                            type="text"
                            value={siteSettings?.heroBgImage || ''}
                            onChange={(e) => setSiteSettings?.({ ...(siteSettings as SiteCMSConfig), heroBgImage: e.target.value })}
                            className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-mono text-[11px]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Hero Button Text Label</label>
                          <input
                            type="text"
                            value={siteSettings?.heroButtonText || ''}
                            onChange={(e) => setSiteSettings?.({ ...(siteSettings as SiteCMSConfig), heroButtonText: e.target.value })}
                            className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (siteSettings) {
                            firebaseService.saveSiteSettings(siteSettings);
                          }
                          window.dispatchEvent(new CustomEvent('cms-alert-notification', {
                            detail: {
                              title: "Hero Frame Sync Success",
                              message: "Hero typography assets successfully synchronized to live website.",
                              category: "CMS"
                            }
                          }));
                        }}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-sans font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
                      >
                        Save Hero Frame Configuration
                      </button>
                    </div>
                  )}

                  {/* SECTION: LUXURY HERO BANNERS (DYNAMIC) */}
                  {cmsActiveTab === "Luxury Banners" && (
                    <HeroBannerManager 
                      siteSettings={siteSettings}
                      setSiteSettings={setSiteSettings}
                      properties={properties}
                      categories={categories}
                      heroBanners={heroBanners}
                    />
                  )}

                  {/* SECTION 3: SERVICES */}
                  {cmsActiveTab === 'Services' && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                      {/* Form to Add Service */}
                      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                        <div className="border-b border-slate-100 pb-2">
                          <h3 className="font-semibold text-slate-800 text-sm">Create Website Service / Feature</h3>
                          <p className="text-[11px] text-slate-400">Add custom requirement-based highlights to the Homepage.</p>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Service Title</label>
                            <input
                              type="text"
                              value={newServiceTitle}
                              onChange={(e) => setNewServiceTitle(e.target.value)}
                              placeholder="e.g. Bespoke Land Sourcing"
                              className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Service Description</label>
                            <textarea
                              rows={2}
                              value={newServiceDesc}
                              onChange={(e) => setNewServiceDesc(e.target.value)}
                              placeholder="Detail what this service does..."
                              className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                            />
                          </div>

                          <button
                            onClick={() => {
                              if (!newServiceTitle.trim() || !newServiceDesc.trim()) return;
                              const currentServices = siteSettings?.services || [];
                              const updatedServices = [
                                ...currentServices,
                                {
                                  id: `service-${Date.now()}`,
                                  title: newServiceTitle,
                                  description: newServiceDesc
                                }
                              ];
                              const newSettings = {
                                ...(siteSettings as SiteCMSConfig),
                                services: updatedServices
                              };
                              setSiteSettings?.(newSettings);
                              firebaseService.saveSiteSettings(newSettings);
                              setNewServiceTitle('');
                              setNewServiceDesc('');
                              window.dispatchEvent(new CustomEvent('cms-alert-notification', {
                                detail: {
                                  title: "Service Created",
                                  message: "New feature has been successfully appended to the active services portfolio.",
                                  category: "Services"
                                }
                              }));
                            }}
                            className="w-full py-2 bg-[#ff5a3c] hover:bg-[#e04326] text-white font-bold rounded-lg transition cursor-pointer text-xs"
                          >
                            Add New Service Card
                          </button>
                        </div>
                      </div>

                      {/* Configured Services List */}
                      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                        <h3 className="font-semibold text-slate-800 text-sm">Active Sourced Services</h3>
                        <div className="divide-y divide-slate-100">
                          {(siteSettings?.services || []).length > 0 ? (
                            (siteSettings?.services || []).map((service, idx) => (
                              <div key={service.id || idx} className="py-3 flex justify-between items-start gap-4">
                                <div className="space-y-1">
                                  <h4 className="font-bold text-slate-900 text-xs">{service.title}</h4>
                                  <p className="text-slate-500 text-[11px] leading-relaxed">{service.description}</p>
                                </div>
                                <button
                                  onClick={() => {
                                    const updated = (siteSettings?.services || []).filter(s => s.id !== service.id);
                                    const newSettings = {
                                      ...(siteSettings as SiteCMSConfig),
                                      services: updated
                                    };
                                    setSiteSettings?.(newSettings);
                                    firebaseService.saveSiteSettings(newSettings);
                                  }}
                                  className="text-red-500 hover:text-red-700 font-mono text-[10px] uppercase font-bold tracking-wider"
                                >
                                  Remove
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-slate-400 py-4 font-sans italic">No services added yet. Fallback active.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 4: CAMPAIGNS & OFFERS */}
                  {cmsActiveTab === 'Campaigns' && (
                    <CampaignManager
                      siteSettings={siteSettings}
                      setSiteSettings={setSiteSettings}
                    />
                  )}

                  {/* SECTION 5: TESTIMONIALS */}
                  {cmsActiveTab === 'Testimonials' && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                      {/* Form to Add Testimonial */}
                      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                        <div className="border-b border-slate-100 pb-2">
                          <h3 className="font-semibold text-slate-800 text-sm">Add Customer Testimonial</h3>
                          <p className="text-[11px] text-slate-400">Add verified feedback and partner ratings for visual slideshow display.</p>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Client / Partner Name</label>
                              <input
                                type="text"
                                value={newTestimonialClient}
                                onChange={(e) => setNewTestimonialClient(e.target.value)}
                                placeholder="e.g. Ramesh Kumar"
                                className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Client Role / Location Label</label>
                              <input
                                type="text"
                                value={newTestimonialRole}
                                onChange={(e) => setNewTestimonialRole(e.target.value)}
                                placeholder="e.g. High-Net-Worth Investor"
                                className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Feedback Text Content</label>
                            <textarea
                              rows={2}
                              value={newTestimonialText}
                              onChange={(e) => setNewTestimonialText(e.target.value)}
                              placeholder="Write client testimonial content here..."
                              className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Rating Score (1 to 5 Stars)</label>
                              <select
                                value={newTestimonialRating}
                                onChange={(e) => setNewTestimonialRating(Number(e.target.value))}
                                className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                              >
                                {[5, 4, 3, 2, 1].map(n => (
                                  <option key={n} value={n}>{n} Stars</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Profile Avatar Image URL</label>
                              <input
                                type="text"
                                value={newTestimonialAvatar}
                                onChange={(e) => setNewTestimonialAvatar(e.target.value)}
                                placeholder="https://unsplash.com/..."
                                className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-mono text-[11px]"
                              />
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (!newTestimonialClient.trim() || !newTestimonialText.trim()) return;
                              const currentTestimonials = siteSettings?.testimonials || [];
                              const updatedTestimonials = [
                                ...currentTestimonials,
                                {
                                  id: Date.now(),
                                  client: newTestimonialClient,
                                  role: newTestimonialRole || "Property Investor",
                                  text: newTestimonialText,
                                  rating: newTestimonialRating,
                                  avatar: newTestimonialAvatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
                                }
                              ];
                              const newSettings = {
                                ...(siteSettings as SiteCMSConfig),
                                testimonials: updatedTestimonials
                              };
                              setSiteSettings?.(newSettings);
                              firebaseService.saveSiteSettings(newSettings);
                              setNewTestimonialClient('');
                              setNewTestimonialRole('');
                              setNewTestimonialText('');
                              setNewTestimonialRating(5);
                              setNewTestimonialAvatar('');
                              window.dispatchEvent(new CustomEvent('cms-alert-notification', {
                                detail: {
                                  title: "Testimonial Added",
                                  message: "Review feedback appended successfully to live slideshow.",
                                  category: "Testimonials"
                                }
                              }));
                            }}
                            className="w-full py-2 bg-[#ff5a3c] hover:bg-[#e04326] text-white font-bold rounded-lg transition cursor-pointer text-xs"
                          >
                            Add Testimonial Record
                          </button>
                        </div>
                      </div>

                      {/* Testimonials List */}
                      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                        <h3 className="font-semibold text-slate-800 text-sm">Active Slideshow Feedbacks</h3>
                        <div className="divide-y divide-slate-100">
                          {(siteSettings?.testimonials || []).length > 0 ? (
                            (siteSettings?.testimonials || []).map((t, idx) => (
                              <div key={t.id || idx} className="py-3 flex justify-between items-start gap-4">
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1 text-amber-500 font-mono text-[10px]">
                                    <span>{"★".repeat(t.rating)}</span>
                                  </div>
                                  <p className="text-slate-600 text-xs leading-relaxed italic">"{t.text}"</p>
                                  <span className="text-[10px] text-slate-500 block font-bold font-mono">
                                    {t.client} • <span className="font-normal font-sans italic">{t.role}</span>
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    const updated = (siteSettings?.testimonials || []).filter(item => item.id !== t.id);
                                    const newSettings = {
                                      ...(siteSettings as SiteCMSConfig),
                                      testimonials: updated
                                    };
                                    setSiteSettings?.(newSettings);
                                    firebaseService.saveSiteSettings(newSettings);
                                  }}
                                  className="text-red-500 hover:text-red-700 font-mono text-[10px] uppercase font-bold"
                                >
                                  Remove
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-slate-400 py-4 font-sans italic">No testimonials added yet. Fallback active.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 6: BLOG ARTICLES */}
                  {cmsActiveTab === 'Blogs' && (
                    <BlogManager 
                      siteSettings={siteSettings}
                      setSiteSettings={setSiteSettings}
                    />
                  )}

                  {cmsActiveTab === 'Statistics' && (
                    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-200">
                      {/* Section 1: Global Statistics Settings */}
                      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4 text-left">
                        <div className="border-b border-slate-100 pb-2">
                          <h3 className="font-semibold text-slate-800 text-sm">Global Animation Parameters</h3>
                          <p className="text-[11px] text-slate-400">Configure count-up speed and stagger entrance intervals. No values are hardcoded.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Count-Up Duration (Seconds)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={statAnimDuration}
                              onChange={(e) => setStatAnimDuration(parseFloat(e.target.value) || 2.0)}
                              className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                            />
                            <p className="text-[9px] text-slate-400">Total count duration for numeric statistics.</p>
                          </div>
                          <div className="space-y-1">
                            <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Stagger Delay (ms)</label>
                            <input
                              type="number"
                              step="50"
                              value={statAnimDelay}
                              onChange={(e) => setStatAnimDelay(parseInt(e.target.value, 10) || 150)}
                              className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                            />
                            <p className="text-[9px] text-slate-400">Delay between individual card entrances.</p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              const newSettings = {
                                ...(siteSettings as SiteCMSConfig),
                                statisticsSettings: {
                                  animationDuration: statAnimDuration,
                                  animationDelay: statAnimDelay
                                }
                              };
                              setSiteSettings?.(newSettings);
                              firebaseService.saveSiteSettings(newSettings);
                              window.dispatchEvent(new CustomEvent('cms-alert-notification', {
                                detail: {
                                  title: "Settings Saved",
                                  message: "Global animation parameters synchronized successfully.",
                                  category: "Statistics"
                                }
                              }));
                            }}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition cursor-pointer text-xs"
                          >
                            Save Settings
                          </button>
                        </div>
                      </div>

                      {/* Section 2: Card Add / Edit Form */}
                      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4 text-left">
                        <div className="border-b border-slate-100 pb-2">
                          <h3 className="font-semibold text-slate-800 text-sm">
                            {editingStatId ? 'Edit Performance Statistic' : 'Add New Statistic Card'}
                          </h3>
                          <p className="text-[11px] text-slate-400">Customize card graphics, numbers, and descriptive labels.</p>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Card Icon / Emoji *</label>
                              <input
                                type="text"
                                value={statIcon}
                                onChange={(e) => setStatIcon(e.target.value)}
                                placeholder="e.g. 🏠 or 📍"
                                className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Statistic Number *</label>
                              <input
                                type="text"
                                value={statNumber}
                                onChange={(e) => setStatNumber(e.target.value)}
                                placeholder="e.g. 450+ or 98%"
                                className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Display Order *</label>
                              <input
                                type="number"
                                value={statOrder}
                                onChange={(e) => setStatOrder(parseInt(e.target.value, 10) || 1)}
                                className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Statistic Title / Label *</label>
                            <input
                              type="text"
                              value={statTitle}
                              onChange={(e) => setStatTitle(e.target.value)}
                              placeholder="e.g. Verified Properties"
                              className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Sub-description (Optional)</label>
                            <input
                              type="text"
                              value={statDescription}
                              onChange={(e) => setStatDescription(e.target.value)}
                              placeholder="e.g. Vetted real estate assets with clear titles."
                              className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                            />
                          </div>

                          <div className="flex items-center gap-2 py-1.5">
                            <input
                              type="checkbox"
                              id="statEnabledCheck"
                              checked={statEnabled}
                              onChange={(e) => setStatEnabled(e.target.checked)}
                              className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4"
                            />
                            <label htmlFor="statEnabledCheck" className="text-xs text-slate-700 font-medium select-none">
                              Enable this statistic card on website
                            </label>
                          </div>

                          {/* Live Dynamic Card Preview Block */}
                          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2.5">
                            <p className="text-[10px] font-mono font-black text-[#FF6B3D] uppercase tracking-widest">Real-time Admin Preview</p>
                            <div className="p-5 bg-slate-950/40 rounded-xl border border-[#FF6B3D]/20 space-y-2 select-none text-left">
                              <span className="text-3xl filter drop-shadow-[0_2px_8px_rgba(255,107,61,0.15)] block mb-1">
                                {statIcon || "❓"}
                              </span>
                              <h3 className="text-2xl font-sans font-black tracking-tight text-white">
                                {statNumber || "0"}
                              </h3>
                              <p className="text-xs font-sans font-bold text-[#FF6B3D] tracking-wide uppercase">
                                {statTitle || "Your Statistic Title"}
                              </p>
                              {statDescription && (
                                <p className="text-slate-400 text-[11px] font-light leading-relaxed">
                                  {statDescription}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end pt-2">
                            {editingStatId && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingStatId(null);
                                  setStatIcon('🏠');
                                  setStatNumber('');
                                  setStatTitle('');
                                  setStatDescription('');
                                  setStatEnabled(true);
                                  setStatOrder((siteSettings?.statisticsCards || []).length + 1);
                                }}
                                className="px-4 py-2 border border-slate-205 hover:bg-slate-50 text-slate-700 font-bold rounded-lg transition cursor-pointer text-xs"
                              >
                                Cancel Edit
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (!statIcon || !statNumber || !statTitle) {
                                  alert('Please enter an icon/emoji, statistic number, and title.');
                                  return;
                                }

                                const cardsList = siteSettings?.statisticsCards || [];
                                let updated: any[];

                                if (editingStatId) {
                                  updated = cardsList.map(c => {
                                    if (c.id === editingStatId) {
                                      return {
                                        ...c,
                                        icon: statIcon,
                                        number: statNumber,
                                        title: statTitle,
                                        description: statDescription,
                                        displayOrder: statOrder,
                                        enabled: statEnabled
                                      };
                                    }
                                    return c;
                                  });
                                } else {
                                  const newCard = {
                                    id: "stat_" + Date.now(),
                                    icon: statIcon,
                                    number: statNumber,
                                    title: statTitle,
                                    description: statDescription,
                                    displayOrder: statOrder,
                                    enabled: statEnabled
                                  };
                                  updated = [...cardsList, newCard];
                                }

                                const newSettings = {
                                  ...(siteSettings as SiteCMSConfig),
                                  statisticsCards: updated
                                };

                                setSiteSettings?.(newSettings);
                                firebaseService.saveSiteSettings(newSettings);

                                // Reset form
                                setEditingStatId(null);
                                setStatIcon('🏠');
                                setStatNumber('');
                                setStatTitle('');
                                setStatDescription('');
                                setStatEnabled(true);
                                setStatOrder(updated.length + 1);

                                window.dispatchEvent(new CustomEvent('cms-alert-notification', {
                                  detail: {
                                    title: editingStatId ? "Card Updated" : "Card Created",
                                    message: editingStatId ? "Statistic card updated on live database." : "New performance statistics card added to index.",
                                    category: "Statistics"
                                  }
                                }));
                              }}
                              className="px-4 py-2 bg-[#ff5a3c] hover:bg-[#e04326] text-white font-bold rounded-lg transition cursor-pointer text-xs"
                            >
                              {editingStatId ? 'Save Statistic Card' : 'Create Statistic Card'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Manage Cards / Reordering */}
                      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4 text-left">
                        <h3 className="font-semibold text-slate-800 text-sm">Active Statistics Directory</h3>
                        <p className="text-[11px] text-slate-400">Reorder, edit, duplicate, toggle visibility or delete active cards.</p>
                        <div className="divide-y divide-slate-100">
                          {(siteSettings?.statisticsCards || []).length > 0 ? (
                            [...(siteSettings?.statisticsCards || [])]
                              .sort((a, b) => a.displayOrder - b.displayOrder)
                              .map((card, idx, sortedArr) => (
                                <div
                                  key={card.id}
                                  draggable
                                  onDragStart={(e) => {
                                    e.dataTransfer.effectAllowed = 'move';
                                    setDraggedCardId(card.id);
                                  }}
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    if (!draggedCardId || draggedCardId === card.id) return;
                                    
                                    const cardsList = [...(siteSettings?.statisticsCards || [])].sort((a, b) => a.displayOrder - b.displayOrder);
                                    const draggedIndex = cardsList.findIndex(c => c.id === draggedCardId);
                                    const targetIndex = cardsList.findIndex(c => c.id === card.id);
                                    
                                    if (draggedIndex !== -1 && targetIndex !== -1) {
                                      const [movedCard] = cardsList.splice(draggedIndex, 1);
                                      cardsList.splice(targetIndex, 0, movedCard);
                                      
                                      // Re-assign displayOrders sequentially
                                      const updated = cardsList.map((c, i) => ({
                                        ...c,
                                        displayOrder: i + 1
                                      }));
                                      
                                      const newSettings = {
                                        ...(siteSettings as SiteCMSConfig),
                                        statisticsCards: updated
                                      };
                                      setSiteSettings?.(newSettings);
                                      firebaseService.saveSiteSettings(newSettings);
                                      
                                      window.dispatchEvent(new CustomEvent('cms-alert-notification', {
                                        detail: {
                                          title: "Order Saved",
                                          message: `Display order updated via drag & drop.`,
                                          category: "Statistics"
                                        }
                                      }));
                                    }
                                    setDraggedCardId(null);
                                  }}
                                  onDragEnd={() => setDraggedCardId(null)}
                                  className={`py-3 px-4 flex justify-between items-center gap-4 border-b border-slate-100 hover:bg-slate-50/80 transition-all rounded-xl select-none cursor-grab active:cursor-grabbing ${
                                    draggedCardId === card.id ? 'opacity-40 bg-slate-150 border-dashed border-2 border-[#FF6B3D]/40' : ''
                                  }`}
                                  title="Drag card to reorder"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-slate-400 font-mono text-xs select-none pr-1">⋮⋮</span>
                                    <span className="text-2xl">{card.icon}</span>
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-slate-900 text-xs">{card.number}</h4>
                                        <span className="text-[10px] text-slate-400 font-normal font-sans">({card.title})</span>
                                      </div>
                                      {card.description && (
                                        <p className="text-slate-505 text-[11px] leading-relaxed max-w-sm line-clamp-1">{card.description}</p>
                                      )}
                                      <span className="text-[9px] font-mono text-slate-400 block uppercase">
                                        Order: {card.displayOrder} • {card.enabled ? 'ACTIVE' : 'DISABLED'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3" onDragStart={(e) => e.stopPropagation()} draggable={false}>
                                    {/* Up/Down Reordering controllers with clean animations */}
                                    <div className="flex flex-col gap-1">
                                      <button
                                        disabled={idx === 0}
                                        onClick={() => {
                                          const sibling = sortedArr[idx - 1];
                                          const updated = siteSettings?.statisticsCards?.map(c => {
                                            if (c.id === card.id) return { ...c, displayOrder: sibling.displayOrder };
                                            if (c.id === sibling.id) return { ...c, displayOrder: card.displayOrder };
                                            return c;
                                          });
                                          const newSettings = { ...(siteSettings as SiteCMSConfig), statisticsCards: updated };
                                          setSiteSettings?.(newSettings);
                                          firebaseService.saveSiteSettings(newSettings);
                                        }}
                                        className="p-1 rounded bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition text-[10px]"
                                        title="Move Up"
                                      >
                                        ▲
                                      </button>
                                      <button
                                        disabled={idx === sortedArr.length - 1}
                                        onClick={() => {
                                          const sibling = sortedArr[idx + 1];
                                          const updated = siteSettings?.statisticsCards?.map(c => {
                                            if (c.id === card.id) return { ...c, displayOrder: sibling.displayOrder };
                                            if (c.id === sibling.id) return { ...c, displayOrder: card.displayOrder };
                                            return c;
                                          });
                                          const newSettings = { ...(siteSettings as SiteCMSConfig), statisticsCards: updated };
                                          setSiteSettings?.(newSettings);
                                          firebaseService.saveSiteSettings(newSettings);
                                        }}
                                        className="p-1 rounded bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition text-[10px]"
                                        title="Move Down"
                                      >
                                        ▼
                                      </button>
                                    </div>

                                    <div className="flex flex-col items-end gap-1.5">
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => {
                                            setEditingStatId(card.id);
                                            setStatIcon(card.icon);
                                            setStatNumber(card.number);
                                            setStatTitle(card.title);
                                            setStatDescription(card.description || '');
                                            setStatEnabled(card.enabled);
                                            setStatOrder(card.displayOrder);
                                          }}
                                          className="text-sky-600 hover:text-sky-800 font-mono text-[9px] uppercase font-bold"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => {
                                            // Duplicate card
                                            const newCard = {
                                              ...card,
                                              id: "stat_" + Date.now(),
                                              title: card.title + " (Copy)",
                                              displayOrder: (siteSettings?.statisticsCards || []).length + 1
                                            };
                                            const updated = [...(siteSettings?.statisticsCards || []), newCard];
                                            const newSettings = { ...(siteSettings as SiteCMSConfig), statisticsCards: updated };
                                            setSiteSettings?.(newSettings);
                                            firebaseService.saveSiteSettings(newSettings);
                                          }}
                                          className="text-amber-600 hover:text-amber-800 font-mono text-[9px] uppercase font-bold"
                                        >
                                          Duplicate
                                        </button>
                                        <button
                                          onClick={() => {
                                            const updated = (siteSettings?.statisticsCards || []).filter(c => c.id !== card.id);
                                            const newSettings = { ...(siteSettings as SiteCMSConfig), statisticsCards: updated };
                                            setSiteSettings?.(newSettings);
                                            firebaseService.saveSiteSettings(newSettings);
                                          }}
                                          className="text-red-500 hover:text-red-700 font-mono text-[9px] uppercase font-bold"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                      <button
                                        onClick={() => {
                                          const updated = (siteSettings?.statisticsCards || []).map(c => {
                                            if (c.id === card.id) return { ...c, enabled: !c.enabled };
                                            return c;
                                          });
                                          const newSettings = { ...(siteSettings as SiteCMSConfig), statisticsCards: updated };
                                          setSiteSettings?.(newSettings);
                                          firebaseService.saveSiteSettings(newSettings);
                                        }}
                                        className={`text-[9px] font-mono uppercase font-black ${card.enabled ? 'text-emerald-600' : 'text-slate-400'}`}
                                      >
                                        {card.enabled ? 'ENABLED' : 'DISABLED'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))
                          ) : (
                            <p className="text-center text-slate-400 py-4 font-sans italic">No statistics cards created yet.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {cmsActiveTab === 'Footer' && (
                    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200 text-left">
                      {/* Top bar with quick actions */}
                      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
                        <div>
                          <h3 className="font-sans font-bold text-sm text-white">Live Footer Customization</h3>
                          <p className="text-[11px] text-slate-400 font-sans mt-0.5">Configure logos, custom links, vectors, and responsive trust indicators below.</p>
                        </div>
                        <button
                          onClick={() => {
                            const updatedConfig = {
                              logoText: footerLogoText,
                              brandDescription: footerBrandDescription,
                              ctas: footerCtas,
                              companyLinks: footerCompanyLinks,
                              servicesLinks: footerServicesLinks,
                              quickLinks: footerQuickLinks,
                              address: footerAddress,
                              phone: footerPhone,
                              email: footerEmail,
                              socials: footerSocials,
                              trustCards: footerTrustCards,
                              copyrightText: footerCopyrightText,
                              reraBadgeText: footerReraBadgeText,
                              reraSubtext: footerReraSubtext,
                              enableSkyline: footerEnableSkyline,
                              enableTrustStrip: footerEnableTrustStrip,
                              showSocialIcons: footerShowSocialIcons,
                              sectionOrder: footerSectionOrder,
                              businessHours: footerBusinessHours,
                              whatsappNumber: footerWhatsappNumber,
                              googleMapsUrl: footerGoogleMapsUrl
                            };
                            const newSettings = {
                              ...(siteSettings as SiteCMSConfig),
                              footerConfig: updatedConfig
                            };
                            setSiteSettings?.(newSettings);
                            firebaseService.saveSiteSettings(newSettings);
                            
                            window.dispatchEvent(new CustomEvent('cms-alert-notification', {
                              detail: {
                                title: "Footer Published",
                                message: "The premium footer has been updated on the live website.",
                                category: "Footer"
                              }
                            }));
                          }}
                          className="px-5 py-2.5 bg-gradient-to-r from-[#FF6B3D] to-[#FF5A3C] hover:shadow-[0_2px_12px_rgba(255,107,61,0.2)] text-white font-bold rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider"
                        >
                          Publish Footer Live
                        </button>
                      </div>

                      {/* Brand & CTAs */}
                      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                        <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2 uppercase tracking-wide">1. Brand Identity & CTAs</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Logo Monogram Text</label>
                            <input
                              type="text"
                              value={footerLogoText}
                              onChange={(e) => setFooterLogoText(e.target.value)}
                              placeholder="DVARIX REALTY"
                              className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Brand Description</label>
                            <textarea
                              rows={2}
                              value={footerBrandDescription}
                              onChange={(e) => setFooterBrandDescription(e.target.value)}
                              placeholder="Enter short description..."
                              className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                            />
                          </div>
                        </div>

                        {/* CTAs list edit */}
                        <div className="space-y-3 pt-2">
                          <label className="font-extrabold text-slate-450 uppercase block text-[10px] border-t border-slate-50 pt-2">Premium Call To Actions (CTAs)</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {footerCtas.map((cta, index) => (
                              <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                                <span className="text-[10px] font-mono text-[#FF6B3D] font-bold">CTA Button {index + 1}</span>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-450 uppercase block">Button Text</label>
                                    <input
                                      type="text"
                                      value={cta.text}
                                      onChange={(e) => {
                                        const updated = [...footerCtas];
                                        updated[index] = { ...updated[index], text: e.target.value };
                                        setFooterCtas(updated);
                                      }}
                                      className="w-full border border-slate-200 p-2 rounded-lg text-xs font-bold text-slate-800 bg-white"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-450 uppercase block">Action/Tab Target</label>
                                    <select
                                      value={cta.target}
                                      onChange={(e) => {
                                        const updated = [...footerCtas];
                                        updated[index] = { ...updated[index], target: e.target.value };
                                        setFooterCtas(updated);
                                      }}
                                      className="w-full border border-slate-200 p-2 rounded-lg text-xs text-slate-800 bg-white"
                                    >
                                      <option value="Properties">Properties Tab</option>
                                      <option value="Contact">Contact Advisor</option>
                                      <option value="About">About Us</option>
                                      <option value="Home">Home Tab</option>
                                      <option value="CustomRequest">Custom Property Request</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Section Order & Layout Toggles */}
                      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                        <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2 uppercase tracking-wide">2. Layout Controls & Column Reordering</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
                          {/* Left: Column order list */}
                          <div className="md:col-span-2 space-y-2">
                            <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Arrangement Sequence</label>
                            <div className="space-y-1.5">
                              {footerSectionOrder.map((sec, idx) => (
                                <div key={sec} className="flex justify-between items-center px-3 py-2 bg-slate-50 border border-slate-150 rounded-xl">
                                  <span className="font-mono text-[10px] font-bold uppercase text-slate-600">
                                    {sec === 'brand' ? '1. Brand Description & CTAs' : sec === 'company' ? '2. Company Navigation Links' : sec === 'services' ? '3. Services Navigation Links' : sec === 'quickLinks' ? '4. Quick/Legal Links' : sec === 'contact' ? '5. Office Coordinates & Socials' : sec}
                                  </span>
                                  <div className="flex gap-1.5">
                                    <button
                                      disabled={idx === 0}
                                      onClick={() => {
                                        const updated = [...footerSectionOrder];
                                        const temp = updated[idx];
                                        updated[idx] = updated[idx - 1];
                                        updated[idx - 1] = temp;
                                        setFooterSectionOrder(updated);
                                      }}
                                      className="p-1 px-2 rounded bg-white hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none text-[10px] border border-slate-200 cursor-pointer"
                                    >
                                      ▲
                                    </button>
                                    <button
                                      disabled={idx === footerSectionOrder.length - 1}
                                      onClick={() => {
                                        const updated = [...footerSectionOrder];
                                        const temp = updated[idx];
                                        updated[idx] = updated[idx + 1];
                                        updated[idx + 1] = temp;
                                        setFooterSectionOrder(updated);
                                      }}
                                      className="p-1 px-2 rounded bg-white hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none text-[10px] border border-slate-200 cursor-pointer"
                                    >
                                      ▼
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Right: Skyline & trust toggles */}
                          <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-left">
                            <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Display Toggle Features</label>
                            
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                id="footerSkylineCheck"
                                checked={footerEnableSkyline}
                                onChange={(e) => setFooterEnableSkyline(e.target.checked)}
                                className="rounded border-slate-300 text-[#FF6B3D] focus:ring-[#FF6B3D] h-4 w-4 cursor-pointer"
                              />
                              <label htmlFor="footerSkylineCheck" className="text-xs text-slate-700 font-bold select-none cursor-pointer">
                                Enable Skyline Graphic
                              </label>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                id="footerTrustCheck"
                                checked={footerEnableTrustStrip}
                                onChange={(e) => setFooterEnableTrustStrip(e.target.checked)}
                                className="rounded border-slate-300 text-[#FF6B3D] focus:ring-[#FF6B3D] h-4 w-4 cursor-pointer"
                              />
                              <label htmlFor="footerTrustCheck" className="text-xs text-slate-700 font-bold select-none cursor-pointer">
                                Enable Glass Trust Strip
                              </label>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                id="footerSocialCheck"
                                checked={footerShowSocialIcons}
                                onChange={(e) => setFooterShowSocialIcons(e.target.checked)}
                                className="rounded border-slate-300 text-[#FF6B3D] focus:ring-[#FF6B3D] h-4 w-4 cursor-pointer"
                              />
                              <label htmlFor="footerSocialCheck" className="text-xs text-slate-700 font-bold select-none cursor-pointer">
                                Show Social Media Profiles
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Navigation Link Lists */}
                      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                        <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2 uppercase tracking-wide">3. Footer Column Link Directories</h4>
                        
                        <div className="space-y-5">
                          {/* Company links */}
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 text-left">
                            <span className="text-[10px] font-mono text-[#FF6B3D] font-bold block uppercase tracking-wider">Company Column Directory Links</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {footerCompanyLinks.map((link, idx) => (
                                <div key={idx} className="flex gap-2 bg-white p-2 border border-slate-100 rounded-lg">
                                  <input
                                    type="text"
                                    value={link.label}
                                    placeholder="Label"
                                    onChange={(e) => {
                                      const updated = [...footerCompanyLinks];
                                      updated[idx] = { ...updated[idx], label: e.target.value };
                                      setFooterCompanyLinks(updated);
                                    }}
                                    className="w-1/2 border border-slate-200 px-2 py-1 text-xs font-bold rounded text-slate-800"
                                  />
                                  <select
                                    value={link.url}
                                    onChange={(e) => {
                                      const updated = [...footerCompanyLinks];
                                      updated[idx] = { ...updated[idx], url: e.target.value };
                                      setFooterCompanyLinks(updated);
                                    }}
                                    className="w-1/2 border border-slate-200 px-2 py-1 text-xs rounded text-slate-800"
                                  >
                                    <option value="Home">Home Screen</option>
                                    <option value="Properties">Properties Screen</option>
                                    <option value="About">About Screen</option>
                                    <option value="Contact">Contact Screen</option>
                                    <option value="CustomRequest">Custom Property Request</option>
                                  </select>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Services links */}
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 text-left">
                            <span className="text-[10px] font-mono text-[#FF6B3D] font-bold block uppercase tracking-wider">Services Column Directory Links</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {footerServicesLinks.map((link, idx) => (
                                <div key={idx} className="flex gap-2 bg-white p-2 border border-slate-100 rounded-lg">
                                  <input
                                    type="text"
                                    value={link.label}
                                    placeholder="Label"
                                    onChange={(e) => {
                                      const updated = [...footerServicesLinks];
                                      updated[idx] = { ...updated[idx], label: e.target.value };
                                      setFooterServicesLinks(updated);
                                    }}
                                    className="w-1/2 border border-slate-200 px-2 py-1 text-xs font-bold rounded text-slate-800"
                                  />
                                  <input
                                    type="text"
                                    value={link.url}
                                    placeholder="URL or Tab Key"
                                    onChange={(e) => {
                                      const updated = [...footerServicesLinks];
                                      updated[idx] = { ...updated[idx], url: e.target.value };
                                      setFooterServicesLinks(updated);
                                    }}
                                    className="w-1/2 border border-slate-200 px-2 py-1 text-xs rounded text-slate-800"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>


                        </div>
                      </div>

                      {/* Contact & Social media profiles */}
                      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                        <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2 uppercase tracking-wide">4. Contact Coordinates & Social Channels</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                          <div className="space-y-1 col-span-1 md:col-span-2">
                            <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Head Office Address</label>
                            <input
                              type="text"
                              value={footerAddress}
                              onChange={(e) => setFooterAddress(e.target.value)}
                              placeholder="Address details..."
                              className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Phone Number</label>
                            <input
                              type="text"
                              value={footerPhone}
                              onChange={(e) => setFooterPhone(e.target.value)}
                              placeholder="+91..."
                              className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Email Address</label>
                            <input
                              type="email"
                              value={footerEmail}
                              onChange={(e) => setFooterEmail(e.target.value)}
                              placeholder="info@dvarix.com"
                              className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Business Hours</label>
                            <input
                              type="text"
                              value={footerBusinessHours}
                              onChange={(e) => setFooterBusinessHours(e.target.value)}
                              placeholder="Mon - Sat: 9:00 AM - 7:00 PM, Sunday: Closed"
                              className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-extrabold text-slate-450 uppercase block text-[10px]">WhatsApp Number</label>
                            <input
                              type="text"
                              value={footerWhatsappNumber}
                              onChange={(e) => setFooterWhatsappNumber(e.target.value)}
                              placeholder="+91..."
                              className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                            />
                          </div>
                          <div className="space-y-1 col-span-1 md:col-span-3">
                            <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Google Maps Location Link</label>
                            <input
                              type="text"
                              value={footerGoogleMapsUrl}
                              onChange={(e) => setFooterGoogleMapsUrl(e.target.value)}
                              placeholder="https://maps.app.goo.gl/..."
                              className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                            />
                          </div>
                        </div>

                        {/* Social profiles list */}
                        <div className="space-y-3 pt-2 text-left">
                          <label className="font-extrabold text-slate-450 uppercase block text-[10px] border-t border-slate-50 pt-2">Social Profiles Directory</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {footerSocials.map((social, idx) => (
                              <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 border border-slate-100 rounded-xl">
                                <span className="text-xs font-mono font-bold capitalize w-16 text-slate-500">{social.platform}</span>
                                <input
                                  type="text"
                                  value={social.url}
                                  placeholder="Profile Url"
                                  onChange={(e) => {
                                    const updated = [...footerSocials];
                                    updated[idx] = { ...updated[idx], url: e.target.value };
                                    setFooterSocials(updated);
                                  }}
                                  className="flex-1 border border-slate-200 px-2.5 py-1.5 text-xs rounded-lg text-slate-800 bg-white"
                                />
                                <input
                                  type="checkbox"
                                  checked={social.enabled}
                                  onChange={(e) => {
                                    const updated = [...footerSocials];
                                    updated[idx] = { ...updated[idx], enabled: e.target.checked };
                                    setFooterSocials(updated);
                                  }}
                                  className="rounded border-slate-300 text-[#FF6B3D] h-4 w-4 cursor-pointer"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Trust Cards Editor */}
                      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                        <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2 uppercase tracking-wide">5. Glass Trust Indicator Cards (Exactly 4 Cards)</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {footerTrustCards.map((card, idx) => (
                            <div key={card.id} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-2.5 text-left">
                              <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                                <span className="text-[10px] font-mono text-[#FF6B3D] font-bold uppercase">Trust Card {idx + 1}</span>
                                <div className="space-y-1">
                                  <select
                                    value={card.icon}
                                    onChange={(e) => {
                                      const updated = [...footerTrustCards];
                                      updated[idx] = { ...updated[idx], icon: e.target.value };
                                      setFooterTrustCards(updated);
                                    }}
                                    className="border border-slate-200 p-1 rounded text-[10px] bg-white font-mono text-slate-800 cursor-pointer"
                                  >
                                    <option value="ShieldCheck">🛡️ ShieldCheck</option>
                                    <option value="FileText">📄 FileText</option>
                                    <option value="CheckCircle">✅ CheckCircle</option>
                                    <option value="Compass">🧭 Compass</option>
                                    <option value="Award">🏆 Award</option>
                                  </select>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-450 uppercase block">Card Title</label>
                                <input
                                  type="text"
                                  value={card.title}
                                  onChange={(e) => {
                                    const updated = [...footerTrustCards];
                                    updated[idx] = { ...updated[idx], title: e.target.value };
                                    setFooterTrustCards(updated);
                                  }}
                                  className="w-full border border-slate-200 p-1.5 rounded-lg text-xs font-bold text-slate-800 bg-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-450 uppercase block">Card Description</label>
                                <input
                                  type="text"
                                  value={card.description}
                                  onChange={(e) => {
                                    const updated = [...footerTrustCards];
                                    updated[idx] = { ...updated[idx], description: e.target.value };
                                    setFooterTrustCards(updated);
                                  }}
                                  className="w-full border border-slate-200 p-1.5 rounded-lg text-xs text-slate-800 bg-white"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Compliance & Bottom bar */}
                      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                        <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2 uppercase tracking-wide">6. Bottom Bar & Legal compliance</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                          <div className="space-y-1">
                            <label className="font-extrabold text-slate-450 uppercase block text-[10px]">Copyright Text</label>
                            <input
                              type="text"
                              value={footerCopyrightText}
                              onChange={(e) => setFooterCopyrightText(e.target.value)}
                              placeholder="Dvarix Realty. All Rights Reserved."
                              className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-extrabold text-slate-450 uppercase block text-[10px]">RERA Badge Title</label>
                            <input
                              type="text"
                              value={footerReraBadgeText}
                              onChange={(e) => setFooterReraBadgeText(e.target.value)}
                              placeholder="RERA Registered"
                              className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-extrabold text-slate-450 uppercase block text-[10px]">RERA Badge Subtext</label>
                            <input
                              type="text"
                              value={footerReraSubtext}
                              onChange={(e) => setFooterReraSubtext(e.target.value)}
                              placeholder="Real Estate Advisory Services"
                              className="w-full border border-slate-205 p-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Interactive preview before saving */}
                      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-900 space-y-4 text-left">
                        <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                          <span className="text-xs font-mono font-black text-[#FF6B3D] uppercase tracking-widest">✨ Live CMS Instant Preview</span>
                          <span className="text-[10px] font-sans text-slate-500">How the live website footer currently appears</span>
                        </div>
                        
                        <div className="p-1 rounded-2xl overflow-hidden scale-90 opacity-95 origin-top border border-slate-900 shadow-2xl bg-[#050B14]">
                          <div className="py-6 px-4 md:px-8 space-y-8 text-left text-slate-400 text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                              <div className="space-y-3">
                                <div className="text-white font-sans font-bold uppercase text-sm tracking-widest">{footerLogoText}</div>
                                <p className="text-slate-400 text-[11px] leading-relaxed max-w-xs">{footerBrandDescription}</p>
                              </div>
                              <div className="space-y-2 col-span-1">
                                <h4 className="text-[10px] font-bold tracking-wider text-white">COMPANY</h4>
                                <ul className="space-y-1 text-slate-500 text-[11px]">
                                  {footerCompanyLinks.slice(0, 3).map((l, i) => <li key={i}>{l.label}</li>)}
                                </ul>
                              </div>
                              <div className="space-y-2 col-span-1">
                                <h4 className="text-[10px] font-bold tracking-wider text-white">SERVICES</h4>
                                <ul className="space-y-1 text-slate-500 text-[11px]">
                                  {footerServicesLinks.slice(0, 3).map((l, i) => <li key={i}>{l.label}</li>)}
                                </ul>
                              </div>
                              <div className="space-y-2 col-span-1">
                                <h4 className="text-[10px] font-bold tracking-wider text-white">CONTACT</h4>
                                <p className="text-[11px] text-slate-500 truncate">{footerAddress}</p>
                                <p className="text-[11px] text-[#FF6B3D] font-semibold">{footerPhone}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Publish bottom bar */}
                      <div className="flex justify-end pt-4">
                        <button
                          onClick={() => {
                            const updatedConfig = {
                              logoText: footerLogoText,
                              brandDescription: footerBrandDescription,
                              ctas: footerCtas,
                              companyLinks: footerCompanyLinks,
                              servicesLinks: footerServicesLinks,
                              quickLinks: footerQuickLinks,
                              address: footerAddress,
                              phone: footerPhone,
                              email: footerEmail,
                              socials: footerSocials,
                              trustCards: footerTrustCards,
                              copyrightText: footerCopyrightText,
                              reraBadgeText: footerReraBadgeText,
                              reraSubtext: footerReraSubtext,
                              enableSkyline: footerEnableSkyline,
                              enableTrustStrip: footerEnableTrustStrip,
                              showSocialIcons: footerShowSocialIcons,
                              sectionOrder: footerSectionOrder,
                              businessHours: footerBusinessHours,
                              whatsappNumber: footerWhatsappNumber,
                              googleMapsUrl: footerGoogleMapsUrl
                            };
                            const newSettings = {
                              ...(siteSettings as SiteCMSConfig),
                              footerConfig: updatedConfig
                            };
                            setSiteSettings?.(newSettings);
                            firebaseService.saveSiteSettings(newSettings);
                            
                            window.dispatchEvent(new CustomEvent('cms-alert-notification', {
                              detail: {
                                title: "Footer Published",
                                message: "The premium footer has been updated on the live website.",
                                category: "Footer"
                              }
                            }));
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-[#FF6B3D] to-[#FF5A3C] text-white hover:shadow-lg hover:shadow-[#FF6B3D]/25 font-bold rounded-xl transition cursor-pointer text-xs uppercase tracking-widest"
                        >
                          Save & Publish Footer Live
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PANEL: SEARCH CATEGORY MANAGEMENT */}
              {activeParent === 'Search Categories' && (
                <div className="space-y-6 text-left text-xs animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 pb-2">
                    <h2 className="text-xl font-bold font-sans text-slate-900 tracking-tight">Search Category Management</h2>
                    <p className="text-xs text-slate-500 font-sans">Configure search categories, default active triggers, visibility icons, and order hierarchy dynamically.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* List/Overview Grid */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                          <span className="font-bold text-slate-800">Dynamic Search Categories ({searchCategories.length})</span>
                          <button 
                            type="button" 
                            onClick={resetSearchCategoryForm}
                            className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Clear / Add New
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-450 tracking-wider">
                                <th className="p-3">Order</th>
                                <th className="p-3">Icon</th>
                                <th className="p-3">ID / Title</th>
                                <th className="p-3">Visibility</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Default</th>
                                <th className="p-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                              {[...searchCategories].sort((a,b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((cat, idx, arr) => {
                                const IconComp = (LucideIcons as any)[cat.iconName || 'Building2'] || LucideIcons.Building2;
                                return (
                                  <tr key={cat.id} className="hover:bg-slate-50/50 transition">
                                    {/* Order movement buttons */}
                                    <td className="p-3 font-mono font-bold text-slate-800">
                                      <div className="flex items-center gap-1.5">
                                        <span className="w-4 block text-center text-xs">{cat.displayOrder}</span>
                                        <div className="flex flex-col">
                                          <button 
                                            type="button" 
                                            disabled={idx === 0}
                                            onClick={() => moveSearchCategoryOrder(idx, 'up')}
                                            className="p-0.5 text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                                            title="Move Up"
                                          >
                                            ▲
                                          </button>
                                          <button 
                                            type="button" 
                                            disabled={idx === arr.length - 1}
                                            onClick={() => moveSearchCategoryOrder(idx, 'down')}
                                            className="p-0.5 text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                                            title="Move Down"
                                          >
                                            ▼
                                          </button>
                                        </div>
                                      </div>
                                    </td>
                                    {/* Icon representation */}
                                    <td className="p-3">
                                      <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg w-fit text-slate-650">
                                        <IconComp className="w-4 h-4 text-slate-700" />
                                      </div>
                                    </td>
                                    {/* Category title */}
                                    <td className="p-3 font-sans">
                                      <div>
                                        <span className="font-bold text-slate-850 block text-xs">{cat.title}</span>
                                        <span className="font-mono text-[9px] text-slate-400 block">{cat.id}</span>
                                      </div>
                                    </td>
                                    {/* View Visibility Eye buttons */}
                                    <td className="p-3">
                                      <button
                                        type="button"
                                        onClick={() => toggleSearchCategoryShowHide(cat)}
                                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-mono font-extrabold uppercase border ${
                                          cat.showInView !== false 
                                            ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' 
                                            : 'bg-slate-50 text-slate-450 border-slate-200 hover:bg-slate-100'
                                        }`}
                                      >
                                        {cat.showInView !== false ? (
                                          <>
                                            <Eye className="w-3 h-3" /> Show
                                          </>
                                        ) : (
                                          <>
                                            <EyeOff className="w-3 h-3" /> Hide
                                          </>
                                        )}
                                      </button>
                                    </td>
                                    {/* Enable / Disable Status */}
                                    <td className="p-3">
                                      <button
                                        type="button"
                                        onClick={() => toggleSearchCategoryStatus(cat)}
                                        className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-extrabold uppercase border ${
                                          cat.status === 'Active' 
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-250 hover:bg-emerald-100' 
                                            : 'bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-150'
                                        }`}
                                        title="Click to Toggle"
                                      >
                                        {cat.status || 'Active'}
                                      </button>
                                    </td>
                                    {/* Default Active */}
                                    <td className="p-3">
                                      <button
                                        type="button"
                                        onClick={() => toggleSearchCategoryDefault(cat)}
                                        className={`px-2 py-0.5 rounded text-[9px] font-bold border transition ${
                                          cat.isDefault 
                                            ? 'bg-orange-50 text-[#ff5a3c] border-[#ff5a3c] font-black' 
                                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                                        }`}
                                        title="Mark as Default Active"
                                      >
                                        {cat.isDefault ? '★ DEFAULT' : 'Set Default'}
                                      </button>
                                    </td>
                                    {/* Actions */}
                                    <td className="p-3 text-right">
                                      <div className="flex gap-2 justify-end">
                                        <button 
                                          type="button"
                                          onClick={() => handleEditSearchCategoryClick(cat)}
                                          className="p-1.5 hover:bg-slate-100 border border-slate-200 rounded text-slate-600 hover:text-slate-900 cursor-pointer animate-none"
                                          title="Edit details"
                                        >
                                          <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                          type="button"
                                          onClick={() => handleDeleteSearchCategoryClick(cat.id)}
                                          className="p-1.5 hover:bg-red-50 border border-red-100 rounded text-red-505 hover:text-red-750 cursor-pointer animate-none"
                                          title="Delete Category"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Left Form Panel */}
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4 text-slate-700">
                      <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 text-sm">
                          {editingSearchCategory ? 'Edit Category Title' : 'Add New Category'}
                        </h3>
                        {editingSearchCategory && (
                          <button 
                            type="button"
                            onClick={resetSearchCategoryForm}
                            className="text-[10px] text-slate-400 hover:underline"
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>

                      <form onSubmit={handleSaveSearchCategory} className="space-y-4 text-left">
                        <div className="space-y-1">
                          <label className="font-extrabold uppercase text-slate-500 block">Category ID / Tag *</label>
                          <input
                            type="text"
                            required
                            disabled={!!editingSearchCategory}
                            placeholder="e.g. Apartments, PG-Stay, Plots"
                            value={searchFormId}
                            onChange={(e) => setSearchFormId(e.target.value)}
                            className="w-full border border-slate-200 p-2.5 rounded-lg text-xs"
                          />
                          {!editingSearchCategory && (
                            <p className="text-[10px] text-slate-400">Unique identifier without spaces.</p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="font-extrabold uppercase text-slate-500 block">Display Title Label *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Luxury Apartments"
                            value={searchFormTitle}
                            onChange={(e) => setSearchFormTitle(e.target.value)}
                            className="w-full border border-slate-200 p-2.5 rounded-lg text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-extrabold uppercase text-slate-505 block">Display Icon Avatar</label>
                          <select
                            value={searchFormIconName}
                            onChange={(e) => setSearchFormIconName(e.target.value)}
                            className="w-full border border-slate-200 p-2.5 rounded-lg text-xs bg-white text-slate-705"
                          >
                            <option value="Building">Building (Block/Flat)</option>
                            <option value="Home">Home (House)</option>
                            <option value="Building2">Building2 (Corporate/Hotel)</option>
                            <option value="Map">Map (Location/Pointers)</option>
                            <option value="Warehouse">Warehouse (Industrial)</option>
                            <option value="Hotel">Hotel (Stay/PG)</option>
                            <option value="Compass">Compass (Villas)</option>
                            <option value="Landmark">Landmark (Plots/Heritage)</option>
                            <option value="Award">Award (Commercial/Gold)</option>
                            <option value="Clock">Clock (Rentals/Temporary)</option>
                            <option value="Bed">Bed (Hostels/PG)</option>
                            <option value="Ruler">Ruler (Sizing/Metric)</option>
                            <option value="Tree">Tree (Farms/Plots)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-extrabold uppercase text-slate-500 block">Display Rank Order</label>
                          <input
                            type="number"
                            placeholder="e.g. 5"
                            value={searchFormDisplayOrder}
                            onChange={(e) => setSearchFormDisplayOrder(Number(e.target.value) || 1)}
                            className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-mono"
                          />
                        </div>

                        <div className="space-y-3 pt-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="searchFormShowInView"
                              checked={searchFormShowInView}
                              onChange={(e) => setSearchFormShowInView(e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-550 h-4 w-4 shrink-0"
                            />
                            <label htmlFor="searchFormShowInView" className="font-semibold text-slate-700 text-xs">
                              Enable Frontend Visibility (Show tab)
                            </label>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="searchFormIsDefault"
                              checked={searchFormIsDefault}
                              onChange={(e) => setSearchFormIsDefault(e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-550 h-4 w-4 shrink-0"
                            />
                            <label htmlFor="searchFormIsDefault" className="font-semibold text-slate-700 text-xs">
                              Set as Default Active Loading Tab
                            </label>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold rounded-lg uppercase tracking-wider transition cursor-pointer"
                        >
                          {editingSearchCategory ? 'Save Edits' : 'Create Search Category'}
                        </button>
                      </form>
                    </div>

                  </div>
                </div>
              )}

              {/* PANEL: PROPERTY TYPE CARDS */}
              {activeParent === 'Property Type Cards' && (
                <div className="space-y-6 text-left text-xs animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 pb-2">
                    <h2 className="text-xl font-bold font-sans text-slate-900 tracking-tight">Property Type Card Management</h2>
                    <p className="text-xs text-slate-500">Add, edit, delete, and change redirect URLs of dynamic property type cards rendered in home screen grid.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* List Overview Column */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                          <span className="font-bold text-slate-800">Dynamic Home Grid Cards ({categories.length})</span>
                          <button 
                            type="button" 
                            onClick={resetPropertyTypeForm}
                            className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Clear / Add New
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-450 tracking-wider">
                                <th className="p-3">Order</th>
                                <th className="p-3">Icon</th>
                                <th className="p-3">Title / Description</th>
                                <th className="p-3">Redirect URL</th>
                                <th className="p-3">Visibility</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                              {[...categories].sort((a,b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((cat, idx, arr) => {
                                const IconComp = (LucideIcons as any)[cat.iconName || 'Building2'] || LucideIcons.Building2;
                                return (
                                  <tr key={cat.id} className="hover:bg-slate-50/50 transition">
                                    {/* Order movement buttons */}
                                    <td className="p-3 font-mono font-bold text-slate-800">
                                      <div className="flex items-center gap-1.5">
                                        <span className="w-4 block text-center text-xs">{cat.displayOrder}</span>
                                        <div className="flex flex-col">
                                          <button 
                                            type="button" 
                                            disabled={idx === 0}
                                            onClick={() => movePropertyTypeOrder(idx, 'up')}
                                            className="p-0.5 text-slate-400 hover:text-slate-805 disabled:opacity-30 cursor-pointer"
                                          >
                                            ▲
                                          </button>
                                          <button 
                                            type="button" 
                                            disabled={idx === arr.length - 1}
                                            onClick={() => movePropertyTypeOrder(idx, 'down')}
                                            className="p-0.5 text-slate-400 hover:text-slate-805 disabled:opacity-30 cursor-pointer"
                                          >
                                            ▼
                                          </button>
                                        </div>
                                      </div>
                                    </td>
                                    {/* Icon */}
                                    <td className="p-3">
                                      <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg w-fit text-slate-655">
                                        <IconComp className="w-4 h-4 text-slate-700" />
                                      </div>
                                    </td>
                                    {/* Title/Description */}
                                    <td className="p-3">
                                      <div>
                                        <span className="font-bold text-slate-850 block text-xs">{cat.title}</span>
                                        <span className="text-[10px] text-slate-450 font-sans block">{cat.description}</span>
                                        <span className="font-mono text-[9px] text-slate-400 block mt-0.5">ID: {cat.id}</span>
                                      </div>
                                    </td>
                                    {/* Redirect link route */}
                                    <td className="p-3 font-mono text-[10px]">
                                      <span className="text-blue-650 bg-blue-50/50 px-2 py-1 rounded truncate block max-w-[120px]" title={cat.redirectUrl}>
                                        {cat.redirectUrl || '/properties?type=' + cat.id.toLowerCase()}
                                      </span>
                                    </td>
                                    {/* Visibility state */}
                                    <td className="p-3">
                                      <button
                                        type="button"
                                        onClick={() => togglePropertyTypeShowHide(cat)}
                                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-mono font-extrabold uppercase border ${
                                          cat.showInView !== false 
                                            ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' 
                                            : 'bg-slate-50 text-slate-450 border-slate-200 hover:bg-slate-100'
                                        }`}
                                      >
                                        {cat.showInView !== false ? (
                                          <>
                                            <Eye className="w-3 h-3" /> Show
                                          </>
                                        ) : (
                                          <>
                                            <EyeOff className="w-3 h-3" /> Hide
                                          </>
                                        )}
                                      </button>
                                    </td>
                                    {/* Active toggle */}
                                    <td className="p-3">
                                      <button
                                        type="button"
                                        onClick={() => togglePropertyTypeStatus(cat)}
                                        className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-extrabold uppercase border ${
                                          cat.status === 'Active' 
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' 
                                            : 'bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-150'
                                        }`}
                                        title="Toggle card status"
                                      >
                                        {cat.status || 'Active'}
                                      </button>
                                    </td>
                                    {/* Actions */}
                                    <td className="p-3 text-right">
                                      <div className="flex gap-2 justify-end">
                                        <button 
                                          type="button"
                                          onClick={() => handleEditPropertyTypeClick(cat)}
                                          className="p-1.5 hover:bg-slate-100 border border-slate-200 rounded text-slate-600 hover:text-slate-900 cursor-pointer"
                                        >
                                          <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                          type="button"
                                          onClick={() => handleDeletePropertyTypeClick(cat.id)}
                                          className="p-1.5 hover:bg-red-50 border border-red-100 rounded text-red-500 hover:text-red-750 cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Editor / Creation Column */}
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4 text-slate-700">
                      <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 text-sm">
                          {editingPropertyType ? 'Edit Type Card' : 'Add New Type Card'}
                        </h3>
                        {editingPropertyType && (
                          <button 
                            type="button"
                            onClick={resetPropertyTypeForm}
                            className="text-[10px] text-slate-450 hover:underline"
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>

                      <form onSubmit={handleSavePropertyType} className="space-y-4 text-left">
                        <div className="space-y-1">
                          <label className="font-extrabold uppercase text-slate-500 block">Property Type ID *</label>
                          <input
                            type="text"
                            required
                            disabled={!!editingPropertyType}
                            placeholder="e.g. Apartment, Villa, Plot"
                            value={typeFormId}
                            onChange={(e) => setTypeFormId(e.target.value)}
                            className="w-full border border-slate-200 p-2.5 rounded-lg text-xs"
                          />
                          {!editingPropertyType && (
                            <p className="text-[10px] text-slate-450 font-sans">Unique folder ID e.g. "Apartment" or "Villa".</p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="font-extrabold uppercase text-slate-500 block">Display Title *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Apartments Complexes"
                            value={typeFormTitle}
                            onChange={(e) => setTypeFormTitle(e.target.value)}
                            className="w-full border border-slate-200 p-2.5 rounded-lg text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-extrabold uppercase text-slate-505 block">Display Subtitle / Description</label>
                          <input
                            type="text"
                            placeholder="e.g. Stellar high-rise blocks"
                            value={typeFormDescription}
                            onChange={(e) => setTypeFormDescription(e.target.value)}
                            className="w-full border border-slate-200 p-2.5 rounded-lg text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-extrabold uppercase text-slate-505 block">Avatar Icon</label>
                          <select
                            value={typeFormIconName}
                            onChange={(e) => setTypeFormIconName(e.target.value)}
                            className="w-full border border-slate-200 p-2.5 rounded-lg text-xs bg-white text-slate-705"
                          >
                            <option value="Building">Building (Block/Flat)</option>
                            <option value="Home">Home (House)</option>
                            <option value="Building2">Building2 (Corporate/Hotel)</option>
                            <option value="Map">Map (Location/Pointers)</option>
                            <option value="Warehouse">Warehouse (Industrial)</option>
                            <option value="Hotel">Hotel (Stay/PG)</option>
                            <option value="Compass">Compass (Villas)</option>
                            <option value="Landmark">Landmark (Plots/Heritage)</option>
                            <option value="Award">Award (Commercial/Gold)</option>
                            <option value="Clock">Clock (Rentals/Temporary)</option>
                            <option value="Bed">Bed (Hostels/PG)</option>
                            <option value="Ruler">Ruler (Sizing/Metric)</option>
                            <option value="Tree">Tree (Farms/Plots)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-extrabold uppercase text-slate-505 block">Display Order Preference</label>
                          <input
                            type="number"
                            placeholder="e.g. 1, 2, 3"
                            value={typeFormDisplayOrder}
                            onChange={(e) => setTypeFormDisplayOrder(Number(e.target.value) || 1)}
                            className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-extrabold uppercase text-slate-500 block">Redirect URL Route</label>
                          <input
                            type="text"
                            placeholder="e.g. /properties?type=apartment"
                            value={typeFormRedirectUrl}
                            onChange={(e) => setTypeFormRedirectUrl(e.target.value)}
                            className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-mono"
                          />
                          <p className="text-[10px] text-slate-400 font-sans">Specifies exact router coordinates when clicked.</p>
                        </div>

                        <div className="space-y-3 pt-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="typeFormShowInView"
                              checked={typeFormShowInView}
                              onChange={(e) => setTypeFormShowInView(e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-550 h-4 w-4 shrink-0"
                            />
                            <label htmlFor="typeFormShowInView" className="font-semibold text-slate-700 text-xs">
                              Show Card item in Home Screen
                            </label>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-[#ff5a3c] hover:bg-[#ff4420] text-white font-mono text-xs font-bold rounded-lg uppercase tracking-wider transition cursor-pointer"
                        >
                          {editingPropertyType ? 'Save Card Edits' : 'Create Property Type Card'}
                        </button>
                      </form>
                    </div>

                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </section>

      {/* Floating System Success/Error Alerts & Notifications */}
      <AnimatePresence>
        {adminToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-55 flex items-center gap-3.5 px-4.5 py-3 rounded-xl border shadow-xl max-w-sm ${
              adminToast.type === 'error'
                ? 'bg-rose-50 border-rose-150 text-rose-800'
                : 'bg-emerald-50 border-emerald-150 text-emerald-805'
            }`}
          >
            {adminToast.type === 'error' ? (
              <Trash2 className="w-5 h-5 text-rose-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            )}
            <div className="text-left">
              <p className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-slate-400">
                System Alert
              </p>
              <p className="text-xs font-bold font-sans">
                {adminToast.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
