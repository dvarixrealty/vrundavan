export interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  phone: string;
  email: string;
}

export interface MapLocation {
  name: string;
  x: string;
  y: string;
  listings: number;
  avgValuation: string;
  benefits: string;
  description: string;
  growth: string;
  path?: string;
  
  // Manageable fields
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  displayOrder?: number;
  status?: 'Active' | 'Disabled';
  featured?: boolean;

  // Managed statistics
  availableOpportunities?: number;
  activeRequirements?: number;
  siteVisits?: number;
  demandLevel?: 'Low' | 'Medium' | 'High' | 'Very High' | string;
  investmentPotential?: 'Low' | 'Medium' | 'High' | 'Exceptional' | string;
  averageBudget?: string;

  // Map Controller Specifics
  showOnHomepage?: boolean;
  featuredLocation?: boolean;
  activePin?: boolean;
  pinColor?: string;
  pinIcon?: string;

  // New Required Fields
  slug?: string;
  growthRate?: string;
  avgPropertyValue?: string;
  locationHighlights?: string; // Comma-separated or string representation
  displayPriority?: number;
  redirectUrl?: string;
  redirectType?: 'Location Page' | 'Property Collection' | 'Custom URL';
}

export interface MapSettings {
  activeProvider: 'Google Maps' | 'Mapbox' | 'OpenStreetMap' | 'Real Estate Map Styles' | 'Custom Map Provider';
  activeStyle: string;
  defaultZoom: number;
  defaultCenterLat: number;
  defaultCenterLng: number;
  
  // Custom Provider Fields
  customProviderName: string;
  customApiKey: string;
  customMapUrl: string;
  customEnabled: boolean;

  // Toggle controls
  enableSearch: boolean;
  enableClustering: boolean;
  enablePropertyCountPins: boolean;

  // Location Pin Settings group
  pinColor: string;
  pinSize: 'small' | 'medium' | 'large' | string;
  pinIcon: string;
  featuredPinStyle: 'default' | 'glowing' | 'pulsing_star' | 'luxury_badge' | string;
  hoverAnimation: 'fade' | 'bounce' | 'zoom' | 'spin' | string;
  clickAnimation: 'bounce_active' | 'radar_ping' | 'expand_card' | 'none' | string;

  // Map Display Settings
  showLocationName: boolean;
  showOpportunitiesCount: boolean;
  showRequirementsCount: boolean;
  showDemandLevel: boolean;
  showInvestmentRating: boolean;
  searchPlaceholder?: string;
}

export interface QuickFilter {
  id: string;
  name: string;
  status: 'Active' | 'Disabled';
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'General Questions' | 'Property Search' | 'Requirements' | 'Site Visits' | 'Buying Process' | 'Selling Process' | 'Investment' | string;
  displayOrder: number;
  status: 'Active' | 'Draft' | 'Published' | 'Hidden' | string;
  featured: boolean;
  lastUpdated: string;
  showOnHomepage?: boolean;
  homepageOrder?: number;
  homepageStatus?: 'Visible' | 'Hidden';
  published?: boolean;
  homepageVisible?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Property {
  id: string;
  title: string;
  type: string;
  image: string;
  images: string[];
  rating: number;
  reviews: number;
  address: string;
  location: string; // "California" | "New York" | "Florida" | "Texas"
  description: string;
  sqft: number;
  beds: number;
  baths: number;
  price: number;
  featured: boolean;
  amenities: string[];
  agent: {
    name: string;
    role: string;
    avatar: string;
    phone: string;
    email: string;
  };

  // Basic Information (Enriched optional fields)
  coverImage?: string;
  galleryImages?: string[];
  imageCount?: number;
  uploadedBy?: string;
  updatedAt?: string;
  code?: string;
  category?: string;
  status?: string;

  // Location Information (Enriched optional fields)
  locationName?: string;
  city?: string;
  state?: string;
  country?: string;
  landmark?: string;
  googleMapLocation?: string;
  latitude?: number;
  longitude?: number;

  // Pricing Information (Enriched optional fields)
  pricePerSqFt?: number;
  negotiable?: boolean;
  priceStatus?: string;

  // Property Specifications (Enriched optional fields)
  plotSize?: string;
  builtUpArea?: number;
  parking?: string | number;
  floorNumber?: number;
  totalFloors?: number;
  facing?: string;
  furnishingStatus?: string;
  propertyAge?: string | number;

  // Project Information (Enriched optional fields)
  projectName?: string;
  builderName?: string;
  reraNumber?: string;
  possessionDate?: string;
  developmentStatus?: string;

  // Marketing & Display Badges (Enriched optional fields)
  badgeFeatured?: boolean;
  badgeVerified?: boolean;
  badgePremium?: boolean;
  badgeHot?: boolean;
  badgeNewLaunch?: boolean;
  badgeTrending?: boolean;
  badgeInvestmentOpportunity?: boolean;
  badgeLimitedAvailability?: boolean;
  badgePriceDrop?: boolean;
  badgeBestSeller?: boolean;

  // Investment Information (Enriched optional fields)
  expectedROI?: string | number;
  rentalYield?: string | number;
  appreciationPotential?: string;
  demandLevel?: string;
  investmentScore?: number;

  // Agent & Owner Information (Enriched optional fields)
  agentContact?: string;
  ownerName?: string;
  ownerContact?: string;
  
  // Enterprise PMS Workspace Fields
  slug?: string;
  longDescription?: string;
  visibility?: string;
  visibilityPassword?: string;
  droneImages?: string[];
  videos?: string[];
  tours360?: string[];
  layoutPlans?: string[];
  customSpecs?: any[];
  nearbyPlaces?: any[];
  floorPlans?: any[];
  legal?: any;
  pricing?: any;
  investment?: any;
  documents?: any[];
  mediaUrls?: any;
  agentExtra?: any;
  reviewsList?: any[];
  propertyFaqs?: any[];
  faqs?: any[];
  seo?: any;
  appearance?: any;
  
  // Lifecycle fields
  isArchived?: boolean;
  isTrashed?: boolean;
  createdAt?: string;
}

export interface PropertyCardConfig {
  showLocation: boolean;
  showPrice: boolean;
  showPropertyType: boolean;
  showArea: boolean;
  showPropertyStatus: boolean;
  showProjectName: boolean;
  showBuilderName: boolean;
  showFeaturedBadge: boolean;
  showVerifiedBadge: boolean;
  showDemandLevel: boolean;
  showInvestmentScore: boolean;
  showPossessionDate: boolean;
  showAgentInformation: boolean;
}

export type PropertyCardTemplate = 'Classic' | 'Modern' | 'Luxury' | 'Investment' | 'Commercial' | 'Minimal' | 'Custom';

export interface Inquiry {
  id: string;
  propertyId?: string;
  propertyName?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  status: 'New' | 'In Progress' | 'Contacted' | 'Archived';
  preferredTime?: string;
  contactMethod?: 'Phone' | 'WhatsApp' | 'Email';
}

export interface LocationData {
  name: string;
  propertiesCount: number;
  image: string;
  tagline: string;
}

export interface CustomRequirement {
  id: string;
  fullName: string;
  mobileNumber: string;
  emailAddress?: string;
  city?: string;
  lookingFor: 'Buy' | 'Rent' | 'Lease' | 'Sell' | 'Invest' | string;
  propertyType: 'Plot' | 'Villa' | 'Apartment' | 'Independent House' | 'Commercial Space' | 'Farm Land' | string;
  preferredCity: string; // plays role of "Preferred Location"
  preferredArea?: string; // plays role of "Alternative Location"
  alternativeLocation?: string;
  landmark?: string;
  minBudget?: string;
  maxBudget?: string;
  plotSize?: string;
  bhkRequirement?: string;
  readyToMove?: string; // "Ready to Move" or "Under Construction" or "Yes"/"No"
  loanRequired?: string;
  amenities?: string[];
  timeline: 'Immediately' | 'Within 1 Month' | 'Within 3 Months' | 'Just Exploring' | string;
  message?: string;
  status: 'New' | 'In Progress' | 'Contacted' | 'Archived';
  date: string;
  preferredDate?: string;
  preferredTime?: string;
  submissionType?: 'Requirement' | 'Consultation' | 'Site Visit';
}

export type ActiveTab = 'Home' | 'Properties' | 'Contact' | 'Admin' | 'About' | 'PrivacyPolicy' | 'Terms' | 'Insights' | '404' | 'PropertyDetail';

export interface BlogComment {
  id: string;
  authorName: string;
  content: string;
  timestamp: string;
}

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featuredImage: string;
  category: string;
  tags: string[];
  author: string;
  status: 'Draft' | 'Published' | 'Scheduled' | 'Archived';
  featured: boolean;
  displayOrder: number;
  readingTime: string;
  seoTitle: string;
  seoDescription: string;
  publishDate: string;
  updatedAt: string;
  createdAt: string;
  commentsEnabled?: boolean;
  comments?: BlogComment[];
  published?: boolean; // For backwards compatibility
  image?: string;      // For backwards compatibility
  date?: string;       // For backwards compatibility
  excerpt?: string;    // For backwards compatibility
}

export interface CampaignButtonSettings {
  text: string;
  icon: string;
  action: 'Open Popup Form' | 'Open Internal Page' | 'Open External URL' | 'WhatsApp' | 'Phone Call' | 'Email' | 'Book Site Visit' | 'Property Search' | 'Download PDF';
  value?: string;
}

export interface CampaignFieldConfig {
  enabled: boolean;
  required: boolean;
}

export interface CampaignFormFieldsConfig {
  fullName: CampaignFieldConfig;
  mobileNumber: CampaignFieldConfig;
  emailAddress: CampaignFieldConfig;
  city: CampaignFieldConfig;
  budget: CampaignFieldConfig;
  propertyType: CampaignFieldConfig;
  preferredLocation: CampaignFieldConfig;
  message: CampaignFieldConfig;
  uploadDocuments: CampaignFieldConfig;
  uploadImages: CampaignFieldConfig;
}

export interface CampaignService {
  id: string;
  title: string;
  badge: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  category: string;
  displayOrder: number;
  status: 'Draft' | 'Published' | 'Scheduled' | 'Expired' | 'Hidden';
  publishDate: string;
  expiryDate: string;
  autoPublish: boolean;
  autoExpire: boolean;
  button1: CampaignButtonSettings;
  button2: CampaignButtonSettings;
  formFields: CampaignFormFieldsConfig;
  afterSubmission: {
    action: 'Thank You Popup' | 'Redirect to Page' | 'Redirect to WhatsApp' | 'Redirect to Contact Page';
    value: string;
  };
  views: number;
  clicks: number;
  submissions: number;
  createdAt: string;
  updatedAt: string;
  featured?: boolean;
  showOnHomepage?: boolean;
  campaignType?: string;
}

export interface FreeServiceRequest {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  requestedServiceId: string;
  requestedServiceName: string;
  submittedDate: string;
  assignedAdvisorId: string;
  assignedAdvisorName: string;
  status: 'New' | 'Contacted' | 'In Progress' | 'Completed';
  city?: string;
  budget?: string;
  propertyType?: string;
  preferredLocation?: string;
  message?: string;
  uploadedDocuments?: string[];
  uploadedImages?: string[];
}

export interface PermissionSet {
  canManageProperties: boolean;
  canManageCategories: boolean;
  canManageAgents: boolean;
  canManageMap: boolean;
  canReplyInquiries: boolean;
  canManageUsers: boolean;
}

export interface SearchCategory {
  id: string;
  title: string;
  iconName: string;
  displayOrder: number;
  status: 'Active' | 'Disabled';
  showInView: boolean;
  isDefault?: boolean;
}

export interface PropertyTypeCard {
  id: string;
  title: string;
  description: string;
  iconName: string;
  displayOrder: number;
  status: 'Active' | 'Disabled';
  showInView: boolean;
  redirectUrl?: string; // custom redirect URL on click
  image?: string; // background banner or thumbnail photo
}

export interface AdminUser {
  id: string;
  email: string;
  password?: string;
  name: string;
  phone?: string;
  requirePasswordChange?: boolean;
  roleName: string; // 'Admin', 'Agent', 'Manager', etc.
  permissions: PermissionSet;
  status?: 'Active' | 'Suspended';
}

export interface Campaign {
  id: string;
  name: string;
  source: string;
  budgetPaid: number;
  leadsGenerated: number;
  conversions: number;
  mediaName?: string;
  mediaUrl?: string; // Base64 or absolute Unsplash as fallback
}

export interface VaultDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  category: string;
  uploadedAt: string;
  url: string;
}

export interface LeadActivity {
  id: string;
  type: 'Call' | 'WhatsApp' | 'Meeting' | 'Site Visit' | 'Status Change' | 'Note';
  content: string;
  timestamp: string;
}

export interface LeadFollowUp {
  id: string;
  dateTime: string;
  notes: string;
  completed: boolean;
}

export interface CRMLead {
  id: string;
  name: string;
  mobile: string;
  email: string;
  propertyRequirement: string;
  budget: string;
  preferredLocation: string;
  source: 'Website' | 'Custom Request Form' | 'WhatsApp' | 'Phone Call' | 'Facebook' | 'Instagram' | 'Referral' | 'Walk-In Customer' | string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Property Matching' | 'Site Visit Scheduled' | 'Site Visit Completed' | 'Negotiation' | 'Documentation' | 'Closed Won' | 'Closed Lost' | 'Hot' | 'Cold' | 'Warm' | 'Prospect';
  agentId?: string;
  agentName?: string;
  sourceCampaignId?: string;
  landingPage?: string;
  utmSource?: string;
  utmCampaign?: string;
  utmMedium?: string;
  notes: {
    internal?: string;
    agent?: string;
    customer?: string;
  };
  followUps?: LeadFollowUp[];
  activities?: LeadActivity[];
  createdAt: string;
}

export interface AiPermission {
  id: string;
  role_id: string;
  can_upload_documents: boolean;
  can_create_articles: boolean;
  can_edit_articles: boolean;
  can_delete_documents: boolean;
  can_manage_faqs: boolean;
  can_reindex_ai: boolean;
  can_manage_prompts: boolean;
  can_manage_workflows: boolean;
  can_view_analytics: boolean;
  created_at: string;
  updated_at: string;
}

export interface AiActivityLog {
  id: string;
  user_id: string;
  user_name?: string;
  role?: string;
  action: string;
  resource_type: string;
  resource_name: string;
  description: string;
  created_at: string;
  prev_version?: string;
}

export interface CentralEnquiry {
  id: string;
  customerName: string;
  mobile: string;
  email: string;
  alternateContact?: string;
  companyName?: string;
  
  // Source elements
  sourceCategory: string; // e.g., 'Website Form', 'Social Media', 'Walk-in', 'WhatsApp', etc.
  sourceName: string; // e.g., 'Contact Us Form', 'Property Enquiry Form', 'Facebook Lead', etc.
  formName?: string;
  landingPageUrl?: string;
  referringUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  createdAt: string; // ISO string

  propertyId?: string;
  propertyName?: string;
  propertyImage?: string;

  // Intent
  intent: 'Buy Property' | 'Sell Property' | 'Rent Property' | 'Lease Property' | 'Site Visit' | 'Investment' | 'Home Loan' | 'Documentation' | 'Property Management' | 'Interior Design' | 'General Enquiry' | string;

  // Journey Timeline
  timeline: {
    id: string;
    timestamp: string;
    stage: string; // e.g., "Visited Homepage", "Submitted Form", "Assigned"
    message: string;
  }[];

  // Routing and Assignment
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedDepartment?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  slaDueDate?: string;
  status: 'New' | 'Assigned' | 'Contacted' | 'Follow-up' | 'Interested' | 'Site Visit Scheduled' | 'Site Visit Completed' | 'Negotiation' | 'Converted to Lead' | 'Converted to Customer' | 'Closed' | 'Lost' | 'Spam';
  
  internalNotes?: string;
  tags?: string[];
  formResponses?: Record<string, any>;
  
  // Linkages
  convertedLeadId?: string;
  convertedCustomerId?: string;
  isTrashed?: boolean;
  isDuplicateOf?: string;
}

export interface RoutingRule {
  id: string;
  sourceCategory: string;
  targetDepartment: string;
  targetAgentId?: string;
  targetAgentName?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  slaDays: number;
}

export interface CRMTask {
  id: string;
  enquiryId: string;
  enquiryName: string;
  dueDate: string;
  assignedAgentId: string;
  assignedAgentName: string;
  taskType: string;
  topic: string;
  notes: string;
  completed: boolean;
  createdAt: string;
}

export interface SiteVisitRecord {
  id: string;
  enquiryId: string;
  customerName: string;
  propertyId: string;
  propertyName: string;
  date: string;
  time: string;
  advisorId: string;
  advisorName: string;
  confirmed: boolean;
  mapsLocation: string;
  instructions: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface EnquiryAuditLog {
  id: string;
  enquiryId: string;
  enquiryName: string;
  user: string;
  timestamp: string;
  action: string;
  oldValue: string;
  newValue: string;
  browser: string;
  ipAddress: string;
}

export interface SiteCMSConfig {
  id: string;
  businessName: string;
  whatsappNumber: string;
  currency: string;
  email: string;
  phone: string;
  address: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  
  // Hero section content
  heroBadge?: string;
  heroBadgeHighlight?: string;
  heroHeadline1?: string;
  heroHeadline2Highlight?: string;
  heroSubheading?: string;
  heroBgImage?: string;
  heroButtonText?: string;
  
  // Testimonials list
  testimonials?: {
    id: number;
    text: string;
    client: string;
    role: string;
    rating: number;
    avatar: string;
  }[];
  
  // Blog / News / Announcements list
  blogs?: BlogArticle[];
  blogSettings?: {
    showSection: boolean;
    maxArticles: number;
  };
  blogCategories?: string[];

  // Services list
  services?: {
    id: string;
    title: string;
    description: string;
    icon?: string;
  }[];

  // Offers/Promotions list
  offers?: {
    id: string;
    title: string;
    badge?: string;
    description: string;
    validTill?: string;
    image?: string;
    active: boolean;
    button1?: CampaignButtonSettings;
    button2?: CampaignButtonSettings;
    formFields?: CampaignFormFieldsConfig;
    afterSubmission?: {
      action: 'Thank You Popup' | 'Redirect to Page' | 'Redirect to WhatsApp' | 'Redirect to Contact Page';
      value?: string;
    };
  }[];
  heroBanners?: HeroBanner[];
  carouselSettings?: CarouselSettings;
  statisticsCards?: StatisticCard[];
  statisticsSettings?: StatisticsSettings;
  footerConfig?: FooterCMSConfig;
  faqSettings?: FAQSettings;
}

export interface FAQSettings {
  defaultCategory: string; // 'All' | 'General Questions' | 'Property Search' | 'Requirements' | 'Site Visits' | 'Buying Process' | 'Investment'
  maxFaqsToDisplay: number; // 5 | 10 | 15 | 20
  showCategoryNavigation: boolean;
  showAllCategory: boolean;
  enableViewAllButton: boolean;
  displayOnlyFeatured: boolean;
  enableHomepageFAQSection: boolean;
}

export interface FooterLink {
  label: string;
  url: string; // Dynamic tab name or url
}

export interface FooterCTA {
  text: string;
  type: 'tab' | 'action' | 'url';
  target: string; // tab e.g. "Properties" or custom
  icon?: string; // Predefined icon code
}

export interface FooterSocialLink {
  platform: 'instagram' | 'facebook' | 'linkedin' | 'youtube' | 'twitter';
  url: string;
  enabled: boolean;
}

export interface FooterTrustCard {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name or emoji
}

export interface FooterCMSConfig {
  logoText: string;
  brandDescription: string;
  ctas: FooterCTA[];
  companyLinks: FooterLink[];
  servicesLinks: FooterLink[];
  quickLinks: FooterLink[];
  address: string;
  phone: string;
  email: string;
  socials: FooterSocialLink[];
  trustCards: FooterTrustCard[];
  copyrightText: string;
  reraBadgeText: string;
  reraSubtext?: string;
  enableSkyline: boolean;
  enableTrustStrip: boolean;
  showSocialIcons: boolean;
  sectionOrder: string[]; // e.g. ["brand", "company", "services", "quickLinks", "contact"]
  businessHours?: string;
  whatsappNumber?: string;
  googleMapsUrl?: string;
}

export interface StatisticCard {
  id: string;
  icon: string; // Emoji or Lucide icon name, e.g. "🏠", "📍", "😊", "⭐", "🤝", "🎧"
  number: string; // e.g. "450+", "25+", "500+", "98%", "15+", "24/7"
  title: string; // e.g. "Verified Properties", "Prime Locations", "Happy Clients"
  description?: string; // Optional description
  displayOrder: number;
  enabled: boolean;
}

export interface StatisticsSettings {
  animationDuration: number; // in seconds
  animationDelay: number; // in milliseconds
}

export interface BannerButtonConfig {
  text: string;
  destinationType: 'internal' | 'external' | 'custom' | 'category' | 'property' | 'contact' | 'custom-request' | 'listings' | 'requirements';
  destinationValue: string;
  openInNewTab: boolean;
  show?: boolean;
  style?: 'primary' | 'secondary' | 'outline';
}

export interface HeroBanner {
  id: string;
  headline: string; // Title / headline
  subheading?: string; // Subtitle / subheading
  description: string;
  badgeText: string;
  propertyCountBadge: string;
  
  // Image options
  desktopImageMethod: 'upload' | 'url';
  desktopImage: string; // Image URL or Base64
  mobileImageMethod: 'upload' | 'url';
  mobileImage: string; // Image URL or Base64
  tabletImage?: string;

  // Button settings
  primaryButtonConfig?: BannerButtonConfig;
  secondaryButtonConfig?: BannerButtonConfig;
  
  // Backward compatibility legacy fields
  primaryButtonText?: string;
  primaryButtonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;

  // Display settings
  order: number;
  status: 'active' | 'inactive' | 'draft' | 'Published' | 'Hidden' | 'Scheduled' | 'Draft' | 'Archived';
  enabled: boolean; // Map status === 'active' to enabled for compatibility

  // Schedule
  publishDate?: string; // Start date
  expiryDate?: string; // End date
  
  // Audit metadata
  lastUpdated: string;

  // --- NEW ENTERPRISE CMS PROPERTIES ---
  bannerName?: string;
  highlightText?: string;
  createdAt?: string;
  updatedAt?: string;

  // Layout settings
  layout?: {
    contentPosition: 'left' | 'center' | 'right';
    verticalAlignment: 'top' | 'center' | 'bottom';
    contentWidth: 'small' | 'medium' | 'large';
    heroImagePosition: 'left' | 'right';
    heroImageWidth: number; // slider value (e.g. percentage 40-100)
    heroImageBorderRadius: number; // slider value (e.g. px 0-48)
  };

  // Text Controls
  textSettings?: {
    headingColor?: string;
    highlightColor?: string;
    descriptionColor?: string;
    headingFontSize?: number; // slider/select value
    subheadingFontSize?: number;
    descriptionFontSize?: number;
    maxContentWidth?: number; // max width of content container
  };

  // Background Controls
  backgroundSettings?: {
    backgroundImage?: string;
    backgroundColor?: string;
    gradientBackground?: string;
    overlayEnabled?: boolean;
    overlayOpacity?: number; // 0 to 100
    backgroundPosition?: string; // e.g. center, top, bottom
    backgroundSize?: string; // e.g. cover, contain
  };

  // Floating Badge
  floatingBadge?: {
    enabled?: boolean;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    icon?: string;
    count?: string;
    label?: string;
  };

  // Animation settings
  animation?: {
    enabled?: boolean;
    type?: 'fade' | 'slide-left' | 'slide-right' | 'zoom' | 'scale';
    duration?: number; // seconds
  };

  visualLayoutSettings?: VisualLayoutSettings;

  // Dynamic CMS custom builder properties
  [key: string]: any;
}

export interface VisualLayoutSettings {
  // Banner Size
  bannerWidth: string;
  bannerHeight: string;
  maxWidth: string;
  minHeight: string;

  // Responsive Heights
  desktopHeight: string;
  laptopHeight: string;
  tabletHeight: string;
  mobileHeight: string;

  // Spacing
  paddingTop: string;
  paddingRight: string;
  paddingBottom: string;
  paddingLeft: string;
  marginTop: string;
  marginRight: string;
  marginBottom: string;
  marginLeft: string;

  // Border
  borderRadius: string;
  borderWidth: string;
  borderColor: string;

  // Background
  backgroundPosition: string;
  backgroundSize: 'cover' | 'contain';
  backgroundRepeat: string;
  backgroundAttachment: string;
  overlayColor: string;
  overlayOpacity: number;
  enableParallax: boolean;

  // Content Layout
  contentWidth: string;
  contentHorizontalAlign: 'left' | 'center' | 'right';
  contentVerticalAlign: 'top' | 'center' | 'bottom';
  contentPadding: string;
  gapBetweenElements: string;

  // Typography
  titleFontSize: string;
  subtitleFontSize: string;
  descriptionFontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  textColor: string;

  // Buttons
  btnPrimaryWidth: string;
  btnPrimaryHeight: string;
  btnSecondaryWidth: string;
  btnSecondaryHeight: string;
  btnBorderRadius: string;
  btnPadding: string;
  btnBgColor: string;
  btnTextColor: string;
  btnHoverBgColor: string;
  btnHoverTextColor: string;

  // Animation
  animationEnabled: boolean;
  animationType: string;
  animationDuration: string;
  animationDelay: string;

  // Advanced
  fullWidth: boolean;
  containerWidth: string;
  boxShadow: string;
  blurEffect: string;
  zIndex: string;
  overflowControl: string;
}

export const DEFAULT_VISUAL_LAYOUT_SETTINGS: VisualLayoutSettings = {
  bannerWidth: '100%',
  bannerHeight: '650px',
  maxWidth: '100%',
  minHeight: '400px',
  desktopHeight: '650px',
  laptopHeight: '550px',
  tabletHeight: '450px',
  mobileHeight: '380px',
  paddingTop: '60px',
  paddingRight: '24px',
  paddingBottom: '60px',
  paddingLeft: '24px',
  marginTop: '0px',
  marginRight: '0px',
  marginBottom: '0px',
  marginLeft: '0px',
  borderRadius: '0px',
  borderWidth: '0px',
  borderColor: 'transparent',
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'scroll',
  overlayColor: '#040914',
  overlayOpacity: 65,
  enableParallax: false,
  contentWidth: '650px',
  contentHorizontalAlign: 'left',
  contentVerticalAlign: 'center',
  contentPadding: '0px',
  gapBetweenElements: '20px',
  titleFontSize: '2.75rem',
  subtitleFontSize: '1.25rem',
  descriptionFontSize: '0.95rem',
  fontWeight: '800',
  lineHeight: '1.2',
  letterSpacing: '-0.02em',
  textColor: '#ffffff',
  btnPrimaryWidth: 'auto',
  btnPrimaryHeight: 'auto',
  btnSecondaryWidth: 'auto',
  btnSecondaryHeight: 'auto',
  btnBorderRadius: '12px',
  btnPadding: '14px 28px',
  btnBgColor: '#ff5a3c',
  btnTextColor: '#ffffff',
  btnHoverBgColor: '#e04f32',
  btnHoverTextColor: '#ffffff',
  animationEnabled: true,
  animationType: 'fade',
  animationDuration: '0.6s',
  animationDelay: '0.1s',
  fullWidth: true,
  containerWidth: '1280px',
  boxShadow: 'none',
  blurEffect: '0px',
  zIndex: '10',
  overflowControl: 'hidden'
};

export interface CarouselSettings {
  autoPlay: boolean;
  autoSlideDuration: number; // 3, 5, 7, 10
  transitionSpeed: 'fast' | 'normal' | 'slow';
  showNavigationArrows: boolean;
  showPaginationDots: boolean;
  pauseOnHover: boolean;
  infiniteLoop: boolean;
}

export interface AdminTheme {
  themeId: string;
  themeName: string;
  createdBy: string;
  updatedAt: string;
  sidebar: {
    background: string;
    hover: string;
    active: string;
    border: string;
    shadow: string;
    text: string;
    activeText: string;
    icon: string;
    activeIcon: string;
    divider: string;
    badgeBg: string;
    badgeText: string;
    accordionBg: string;
    accordionHover: string;
    accordionBorder: string;
  };
  header: {
    background: string;
    border: string;
    text: string;
    searchBg: string;
    notificationIcon: string;
    profileIcon: string;
    shadow: string;
  };
  content: {
    background: string;
    pageBg: string;
    cards: string;
    tables: string;
    forms: string;
    dialogs: string;
    popups: string;
    drawer: string;
  };
  buttons: {
    primaryBg: string;
    primaryText: string;
    secondaryBg: string;
    secondaryText: string;
    successBg: string;
    successText: string;
    dangerBg: string;
    dangerText: string;
    warningBg: string;
    warningText: string;
    infoBg: string;
    infoText: string;
    hoverOpacity: number;
    shadow: string;
    borderRadius: string;
  };
  inputs: {
    background: string;
    border: string;
    focusBorder: string;
    placeholder: string;
    checkbox: string;
    radio: string;
    switchBg: string;
    dropdown: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    sidebarFont: string;
    menuWeight: string;
    headingWeight: string;
    buttonWeight: string;
    fontSize: string;
    letterSpacing: string;
  };
  icons: {
    pack: string;
    size: string;
    color: string;
    activeColor: string;
    hoverColor: string;
    rounded: boolean;
    outlined: boolean;
    filled: boolean;
  };
  borderRadius: {
    global: string;
    cards: string;
    buttons: string;
    inputs: string;
    sidebar: string;
    dropdown: string;
    dialogs: string;
    sliders: string;
  };
  shadowSettings: {
    type: 'None' | 'Soft' | 'Medium' | 'Luxury' | 'Glass' | 'Deep' | string;
  };
  layout: {
    sidebarWidth: string;
    expandedWidth: string;
    miniWidth: string;
    headerHeight: string;
    contentWidth: 'Compact' | 'Comfortable' | 'Spacious' | string;
    compactMode: boolean;
    comfortableMode: boolean;
    spaciousMode: boolean;
  };
}

export interface BrandingSetting {
  id: string;
  companyName: string;
  brandName?: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  seoLogoUrl: string;
  ogImageUrl: string;
  bannerImageUrl?: string;
  socialImageUrl?: string;
  websiteUrl: string;
  email: string;
  phone: string;
  updatedAt: string;
  updatedBy: string;
  useLogoAsSeoLogo?: boolean;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    twitter?: string;
  };
  contactDetails?: {
    email?: string;
    phone?: string;
    whatsapp?: string;
  };
}





