// Local Storage Caching and Fallback Engine for Dvarix Realty
// Designed to keep the application 100% functional even when Firebase/Firestore hit Spark plan quotas (Quota Exceeded).

export const CACHE_KEYS = {
  KNOWLEDGE: 'dvarix_cache_chatbot_knowledge',
  CONVERSATIONS: 'dvarix_cache_customer_requirements',
  RULES: 'dvarix_cache_qualification_rules',
  AUDIT_LOGS: 'dvarix_cache_chatbot_audit_logs',
  DOCUMENTS: 'dvarix_cache_chatbot_documents',
  WEBSITES: 'dvarix_cache_chatbot_websites',
  SNIPPETS: 'dvarix_cache_chatbot_snippets',
  PROPERTIES: 'dvarix_cache_properties',
  PERSONALITY_VERSIONS: 'dvarix_cache_chatbot_personality_versions',
  CONFIG: 'dvarix_cache_chatbot_settings_config',
  FLOWS: 'dvarix_cache_chatbot_flows',
  SEO_CONFIGS: 'dvarix_cache_seo_configs',
  SEO_REDIRECTS: 'dvarix_cache_seo_redirects',
  SEO_404_LOGS: 'dvarix_cache_seo_404_logs',
  SEO_KEYWORDS: 'dvarix_cache_seo_keywords',
  SEO_ROBOTS: 'dvarix_cache_seo_robots',
  SEO_SCHEMAS: 'dvarix_cache_seo_schemas',
  SEO_IMAGES: 'dvarix_cache_seo_images',
};

// Standard Default Seeding Data for Fallback
const DEFAULT_LEADS = [
  {
    leadId: 'lead-seed-1',
    sessionId: 'sess-seed-1',
    visitorId: 'vis-seed-1',
    customerName: 'Arjun Mehta',
    phoneNumber: '+91 98765 43210',
    email: 'arjun.mehta@gmail.com',
    preferredLocation: 'Devanahalli',
    propertyType: 'Villa Plot',
    budget: '₹75 Lakhs',
    bedrooms: 'N/A',
    area: '1200 sqft',
    requirementSummary: 'Customer Arjun Mehta is looking for a Villa Plot in Devanahalli with a budget of ₹75 Lakhs.',
    leadStatus: 'Site Visit',
    priority: 'High',
    source: 'AI Chatbot',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 3600 * 1000 + 120 * 1000).toISOString()
  },
  {
    leadId: 'lead-seed-2',
    sessionId: 'sess-seed-2',
    visitorId: 'vis-seed-2',
    customerName: 'Priya Sharma',
    phoneNumber: '+91 87654 32109',
    email: 'priya.sharma@yahoo.com',
    preferredLocation: 'JP Nagar',
    propertyType: 'Apartment',
    budget: '₹1.5 Crores',
    bedrooms: '3 BHK',
    area: '1800 sqft',
    requirementSummary: 'Customer Priya Sharma is looking for a 3 BHK Apartment in JP Nagar with a budget of ₹1.5 Crores. Needs home loan assistance.',
    leadStatus: 'New',
    priority: 'High',
    source: 'AI Chatbot',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000 + 130 * 1000).toISOString()
  },
  {
    leadId: 'lead-seed-3',
    sessionId: 'sess-seed-3',
    visitorId: 'vis-seed-3',
    customerName: 'Kiran Kumar',
    phoneNumber: '+91 90123 45678',
    email: 'kiran.k@rediffmail.com',
    preferredLocation: 'Whitefield',
    propertyType: 'Apartment',
    budget: '₹95 Lakhs',
    bedrooms: '2 BHK',
    area: '1200 sqft',
    requirementSummary: 'Customer Kiran Kumar is looking for a 2 BHK Apartment in Whitefield with a budget of ₹95 Lakhs.',
    leadStatus: 'Closed',
    priority: 'Medium',
    source: 'AI Chatbot',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600 * 1000 + 15 * 1000).toISOString()
  },
  {
    leadId: 'lead-seed-4',
    sessionId: 'sess-seed-4',
    visitorId: 'vis-seed-4',
    customerName: 'Ananya Rao',
    phoneNumber: '+91 76543 21098',
    email: 'ananya.rao@gmail.com',
    preferredLocation: 'Whitefield',
    propertyType: 'Apartment',
    budget: '₹95 Lakhs',
    bedrooms: '2 BHK',
    area: '1200 sqft',
    requirementSummary: 'Customer Ananya Rao is looking for a 2 BHK Apartment in Whitefield with a budget of ₹95 Lakhs.',
    leadStatus: 'Contacted',
    priority: 'Medium',
    source: 'AI Chatbot',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 48 * 3600 * 1000 + 30 * 1000).toISOString()
  }
];

const DEFAULT_FLOWS = {
  buying: {
    id: 'buying',
    title: 'Property Buying & Investment Flow',
    description: 'Dynamic inquiry flow to register prospective home buyers & investors.',
    category: 'Sales Qualification',
    enabled: true,
    published: true,
    archived: false,
    version: 1,
    steps: [
      { id: 'b1', field: 'propertyType', question: 'What classification of property are you interested in purchasing?', type: 'propertyTypeSelector', required: true, conditionalEnabled: false, order: 1, options: ['Villa', 'Apartment', 'Plot', 'Commercial'] },
      { id: 'b2', field: 'preferredLocation', question: 'Which premium locations in Bengaluru do you prefer?', type: 'locationSelector', required: true, conditionalEnabled: false, order: 2, options: ['Whitefield', 'JP Nagar', 'Devanahalli', 'Hennur Road', 'Sarjapur Road'] },
      { id: 'b3', field: 'budgetRange', question: 'What is your target investment budget range?', type: 'budgetRange', required: true, conditionalEnabled: false, order: 3, options: ['Under ₹50 Lakhs', '₹50 Lakhs - ₹1 Crore', '₹1 Crore - ₹2 Crores', '₹2 Crores+'] },
      { id: 'b4', field: 'bedrooms', question: 'What bedroom configuration (BHK) do you require?', type: 'bhkSelector', required: true, conditionalEnabled: true, order: 4, options: ['1 BHK', '2 BHK', '3 BHK', '4 BHK+'], conditionField: 'propertyType', conditionOperator: 'equals', conditionValue: 'Apartment' },
      { id: 'b5', field: 'fullName', question: 'Understood. Please provide your full name so we can record your profile:', type: 'shortText', required: true, conditionalEnabled: false, order: 5 },
      { id: 'b6', field: 'mobileNumber', question: 'Thank you. Please enter your phone number to enable instant callback:', type: 'shortText', required: true, conditionalEnabled: false, order: 6 }
    ],
    actions: {
      createLead: true,
      assignAgent: true,
      notifyWhatsApp: true
    }
  },
  renting: {
    id: 'renting',
    title: 'Property Rental Flow',
    description: 'Funnels renters seeking high-end apartments or luxury villas.',
    category: 'Site Visit Booking',
    enabled: true,
    published: true,
    archived: false,
    version: 1,
    steps: [
      { id: 'r1', field: 'propertyType', question: 'What style of property do you want to rent?', type: 'propertyTypeSelector', required: true, conditionalEnabled: false, order: 1, options: ['Villa', 'Apartment', 'Plot'] },
      { id: 'r2', field: 'preferredLocation', question: 'Which areas do you prefer to stay in?', type: 'locationSelector', required: true, conditionalEnabled: false, order: 2, options: ['Whitefield', 'JP Nagar', 'Devanahalli', 'Hennur Road'] },
      { id: 'r3', field: 'budgetRange', question: 'What is your maximum monthly rent budget?', type: 'budgetRange', required: true, conditionalEnabled: false, order: 3, options: ['Under ₹25,000', '₹25,000 - ₹50,000', '₹50,000 - ₹1 Lakh', '₹1 Lakh+'] },
      { id: 'r4', field: 'moveInDate', question: 'Are you planning to move in immediately, or within a specific month?', type: 'datePicker', required: false, conditionalEnabled: false, order: 4 },
      { id: 'r5', field: 'mobileNumber', question: 'Great. Please provide your phone number for callback confirmation:', type: 'shortText', required: true, conditionalEnabled: false, order: 5 }
    ],
    actions: {
      createLead: true,
      bookSiteVisit: true,
      assignAgent: true
    }
  },
  selling: {
    id: 'selling',
    title: 'Property Selling Flow',
    description: 'Funnels property owners wishing to list their property.',
    category: 'Property Selling Flow',
    enabled: true,
    published: true,
    archived: false,
    version: 1,
    steps: [
      { id: 's1', field: 'propertyType', question: 'What is the classification of your property to sell?', type: 'propertyTypeSelector', required: true, conditionalEnabled: false, order: 1, options: ['Villa', 'Apartment', 'Plot', 'Commercial'] },
      { id: 's2', field: 'preferredLocation', question: 'Where is this property located physically?', type: 'locationSelector', required: true, conditionalEnabled: false, order: 2, options: ['Whitefield', 'JP Nagar', 'Devanahalli', 'Hennur Road', 'MG Road'] },
      { id: 's3', field: 'expectedPrice', question: 'What is your target expected listing price?', type: 'number', required: true, conditionalEnabled: false, order: 3 },
      { id: 's4', field: 'mobileNumber', question: 'Provide your mobile number so we can list, verify, and photograph the property:', type: 'shortText', required: true, conditionalEnabled: false, order: 4 }
    ],
    actions: {
      createLead: true,
      notifyAdmin: true
    }
  }
};

const DEFAULT_KNOWLEDGE = [
  {
    id: 'k1',
    category: 'General Support',
    question: 'What is Dvarix Realty?',
    answer: 'Dvarix Realty is a premier property investment and advisory firm specializing in luxury apartments, residential villa plots, and commercial properties across top hubs in Bengaluru, including Whitefield, JP Nagar, Devanahalli, and Hennur Road.',
    priority: 'High',
    status: 'Active',
    lastUpdated: '2026-06-14T12:00:00.000Z'
  },
  {
    id: 'k2',
    category: 'Projects',
    question: 'Where are your ongoing premium projects located?',
    answer: 'Our signature developments are located in: \n1. Devanahalli (North Bengaluru) - Luxury Villa Plots with premium clubhouses.\n2. Whitefield (East Bengaluru) - Elegant high-rise smart apartments.\n3. JP Nagar (South Bengaluru) - Boutique luxury duplexes.',
    priority: 'High',
    status: 'Active',
    lastUpdated: '2026-06-14T12:00:00.000Z'
  }
];

const DEFAULT_RULES = [
  {
    id: 'rule-1',
    ruleName: 'High Budget Luxury Lead router',
    criteriaField: 'budget',
    criteriaOperator: 'contains',
    criteriaValue: 'Crore',
    targetAction: 'Assign Specialist',
    actionValue: 'Ananya Gowda (Luxury Advisor)',
    priority: 'High',
    status: 'Active',
    triggerCount: 14
  },
  {
    id: 'rule-2',
    ruleName: 'Devanahalli Location Specialist Alert',
    criteriaField: 'preferredLocation',
    criteriaOperator: 'equals',
    criteriaValue: 'Devanahalli',
    targetAction: 'Notify Agent',
    actionValue: 'Rohan Deshmukh (Devanahalli Expert)',
    priority: 'Medium',
    status: 'Active',
    triggerCount: 22
  }
];

const DEFAULT_CONFIG = {
  botName: 'Dvarix Assistant',
  botMission: 'Understand customer requirements and guide them to suitable Dvarix Realty solutions.',
  style: 'Warm',
  botDescription: 'Your intelligent AI advisor for custom properties, site visits and professional consulting.',
  introMessage: 'Hello! Welcome to Dvarix Realty.',
  closingMessage: 'Thank you for choosing Dvarix Realty. We look forward to helping you find your dream home.',
  avatarUrl: 'https://images.unsplash.com/photo-1573511860675-6702214d266e?w=150',
  widgetPosition: 'Bottom Right',
  primaryColor: '#2563EB',
  welcomeMessage: 'Hi there! Looking for your dream property? Let is chat!',
  offlineMessage: 'Our experts are currently assisting other clients, but your inquiry is saved and scheduled for callback!',
  isFaqSearchEnabled: true,
  isLiveAgentEscalationEnabled: true,
  leadCaptureFormFields: ['fullName', 'mobileNumber', 'propertyType', 'budgetRange'],
  unsupportedQueryResponse: 'I am not sure about that specific property detail, but I have registered your query for our specialist callback desk.',
  autoAssignLeads: true,
  enableWhatsAppAlerts: true,
  enableEmailDigest: true
};

// Generic read from cache with default fallbacks
export function getLocalCache<T>(key: string, defaultValue?: T): T {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data) as T;
    }
  } catch (err) {
    console.warn(`Error reading localStorage key "${key}":`, err);
  }

  // Supply default mock/seeding records when no cache exists
  if (defaultValue !== undefined) return defaultValue;

  if (key === CACHE_KEYS.CONVERSATIONS) return DEFAULT_LEADS as unknown as T;
  if (key === CACHE_KEYS.FLOWS) return DEFAULT_FLOWS as unknown as T;
  if (key === CACHE_KEYS.KNOWLEDGE) return DEFAULT_KNOWLEDGE as unknown as T;
  if (key === CACHE_KEYS.RULES) return DEFAULT_RULES as unknown as T;
  if (key === CACHE_KEYS.CONFIG) return DEFAULT_CONFIG as unknown as T;

  return [] as unknown as T;
}

// Generic write to cache
export function setLocalCache<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing localStorage key "${key}":`, err);
  }
}

// Add a single record to cached list
export function addLocalRecord<T>(key: string, record: T): T[] {
  const current = getLocalCache<T[]>(key, []);
  const updated = [record, ...current];
  setLocalCache(key, updated);
  return updated;
}

// Update a single record in cached list
export function updateLocalRecord<T>(key: string, idKey: string, idValue: any, fields: Partial<T>): T[] {
  const current = getLocalCache<any[]>(key, []);
  const updated = current.map(item => {
    if (item[idKey] === idValue) {
      return { ...item, ...fields, updatedAt: new Date().toISOString() };
    }
    return item;
  });
  setLocalCache(key, updated);
  return updated as T[];
}

// Delete a single record in cached list
export function deleteLocalRecord<T>(key: string, idKey: string, idValue: any): T[] {
  const current = getLocalCache<any[]>(key, []);
  const updated = current.filter(item => item[idKey] !== idValue);
  setLocalCache(key, updated);
  return updated as T[];
}

// Check if a Firebase Error is "resource-exhausted"
export function isQuotaExceededError(error: any): boolean {
  if (!error) return false;
  const errMsg = String(error.message || error).toLowerCase();
  const errCode = String(error.code || '').toLowerCase();
  return errCode === 'resource-exhausted' || errMsg.includes('quota exceeded') || errMsg.includes('resource exhausted');
}
