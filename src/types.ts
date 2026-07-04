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
  status: 'Active' | 'Draft';
  featured: boolean;
  lastUpdated: string;
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

export type ActiveTab = 'Home' | 'Properties' | 'Contact' | 'Admin' | 'About';

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
  blogs?: {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    image: string;
    date: string;
    author: string;
    published: boolean;
  }[];

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
  }[];
}




