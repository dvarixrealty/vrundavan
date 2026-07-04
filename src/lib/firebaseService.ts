import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDocs,
  query,
  limit
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType, auth } from "../firebase";
import { Property, Inquiry, CustomRequirement, Agent, MapLocation, AdminUser, FAQ, MapSettings, QuickFilter, AiPermission, AiActivityLog, CentralEnquiry, RoutingRule, SiteCMSConfig } from "../types";

// Firebase Services Helper
export function cleanPropertyPayload(property: any): any {
  if (property === null || property === undefined) return undefined;

  const cleanValue = (val: any, keyName?: string): any => {
    if (val === null || val === undefined) return undefined;

    if (Array.isArray(val)) {
      const cleanedArr = val
        .map(item => cleanValue(item))
        .filter(item => item !== undefined && item !== null && item !== "");
      return cleanedArr.length > 0 ? cleanedArr : undefined;
    }

    if (typeof val === 'object') {
      if (val instanceof Date) {
        return val.toISOString();
      }
      const cleanedObj: any = {};
      let hasKeys = false;
      for (const key in val) {
        if (Object.prototype.hasOwnProperty.call(val, key)) {
          const cleanedVal = cleanValue(val[key], key);
          if (cleanedVal !== undefined && cleanedVal !== null && cleanedVal !== "") {
            cleanedObj[key] = cleanedVal;
            hasKeys = true;
          }
        }
      }
      return hasKeys ? cleanedObj : undefined;
    }

    if (typeof val === 'string') {
      const trimmed = val.trim();
      return trimmed === "" ? undefined : trimmed;
    }

    return val;
  };

  const cleaned = cleanValue(property);

  // Ensure mandatory fields requested by user are always guaranteed to exist at root (if they had a value)
  const requiredKeys = ['id', 'title', 'type', 'category', 'price', 'city', 'location', 'status'];
  requiredKeys.forEach(key => {
    if (cleaned && cleaned[key] === undefined && property[key] !== undefined && property[key] !== null) {
      if (typeof property[key] === 'string') {
        cleaned[key] = property[key].trim() || "";
      } else {
        cleaned[key] = property[key];
      }
    }
  });

  return cleaned;
}

export const firebaseService = {
  // Sync Properties with Firestore
  subscribeProperties(onUpdate: (properties: Property[]) => void, onError: (err: any) => void) {
    const path = "properties";
    try {
      return onSnapshot(
        collection(db, path),
        (snapshot) => {
          const list: Property[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Property);
          });
          onUpdate(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
          onError(error);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveProperty(property: Property) {
    const path = `properties/${property.id}`;
    console.log("[CMS DEBUG 3] firebaseService.saveProperty executed!");
    console.log("[CMS DEBUG 3] Exact file path: src/lib/firebaseService.ts");
    console.log("[CMS DEBUG 3] Firestore collection name: 'properties'");
    console.log("[CMS DEBUG 3] Firestore Document ID:", property.id);
    console.log("[CMS DEBUG 3] Current Firebase Auth User:", auth.currentUser ? auth.currentUser.email : "NULL");

    const cleanedProperty = cleanPropertyPayload(property);
    console.log("[CMS DEBUG 3] Cleaned property payload before save:", JSON.stringify(cleanedProperty, null, 2));

    try {
      await setDoc(doc(db, "properties", property.id), cleanedProperty);
      console.log("[CMS DEBUG 3] setDoc successfully completed for ID:", property.id);
    } catch (error) {
      console.error("[CMS DEBUG 3] setDoc failed with error:", error);
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteProperty(propertyId: string) {
    const path = `properties/${propertyId}`;
    try {
      await deleteDoc(doc(db, "properties", propertyId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Sync Inquiries with Firestore
  subscribeInquiries(onUpdate: (inquiries: Inquiry[]) => void, onError: (err: any) => void) {
    const path = "inquiries";
    try {
      return onSnapshot(
        collection(db, path),
        (snapshot) => {
          const list: Inquiry[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Inquiry);
          });
          list.sort((a,b) => b.id.localeCompare(a.id)); // Sort by ID descending
          onUpdate(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
          onError(error);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveInquiry(inquiry: Inquiry) {
    const path = `inquiries/${inquiry.id}`;
    try {
      await setDoc(doc(db, "inquiries", inquiry.id), inquiry);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteInquiry(inquiryId: string) {
    const path = `inquiries/${inquiryId}`;
    try {
      await deleteDoc(doc(db, "inquiries", inquiryId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Sync Central Enquiries with Firestore
  subscribeCentralEnquiries(onUpdate: (enquiries: CentralEnquiry[]) => void, onError: (err: any) => void) {
    const path = "central_enquiries";
    try {
      return onSnapshot(
        collection(db, path),
        (snapshot) => {
          const list: CentralEnquiry[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as CentralEnquiry);
          });
          list.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
          onUpdate(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
          onError(error);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveCentralEnquiry(enquiry: CentralEnquiry) {
    const path = `central_enquiries/${enquiry.id}`;
    try {
      await setDoc(doc(db, "central_enquiries", enquiry.id), enquiry);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteCentralEnquiry(enquiryId: string) {
    const path = `central_enquiries/${enquiryId}`;
    try {
      await deleteDoc(doc(db, "central_enquiries", enquiryId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Sync Campaigns with Firestore
  subscribeCampaigns(onUpdate: (campaigns: any[]) => void, onError: (err: any) => void) {
    const path = "campaigns";
    try {
      return onSnapshot(
        collection(db, path),
        (snapshot) => {
          const list: any[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data());
          });
          onUpdate(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
          onError(error);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveCampaign(campaign: any) {
    const path = `campaigns/${campaign.id}`;
    try {
      await setDoc(doc(db, "campaigns", campaign.id), campaign);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteCampaign(campaignId: string) {
    const path = `campaigns/${campaignId}`;
    try {
      await deleteDoc(doc(db, "campaigns", campaignId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Sync Routing Rules with Firestore
  subscribeRoutingRules(onUpdate: (rules: RoutingRule[]) => void, onError: (err: any) => void) {
    const path = "routing_rules";
    try {
      return onSnapshot(
        collection(db, path),
        (snapshot) => {
          const list: RoutingRule[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as RoutingRule);
          });
          onUpdate(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
          onError(error);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveRoutingRule(rule: RoutingRule) {
    const path = `routing_rules/${rule.id}`;
    try {
      await setDoc(doc(db, "routing_rules", rule.id), rule);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteRoutingRule(ruleId: string) {
    const path = `routing_rules/${ruleId}`;
    try {
      await deleteDoc(doc(db, "routing_rules", ruleId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Sync Customer Requirements with Firestore
  subscribeRequirements(onUpdate: (requirements: CustomRequirement[]) => void, onError: (err: any) => void) {
    const path = "requirements";
    try {
      return onSnapshot(
        collection(db, path),
        (snapshot) => {
          const list: CustomRequirement[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as CustomRequirement);
          });
          list.sort((a,b) => b.id.localeCompare(a.id));
          onUpdate(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
          onError(error);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveRequirement(req: CustomRequirement) {
    const path = `requirements/${req.id}`;
    try {
      await setDoc(doc(db, "requirements", req.id), req);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteRequirement(requirementId: string) {
    const path = `requirements/${requirementId}`;
    try {
      await deleteDoc(doc(db, "requirements", requirementId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Sync Categories
  subscribeCategories(onUpdate: (categories: any[]) => void, onError: (err: any) => void) {
    const path = "categories";
    try {
      return onSnapshot(
        collection(db, path),
        (snapshot) => {
          const list: any[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data());
          });
          list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          onUpdate(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
          onError(error);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveCategory(category: any) {
    const path = `categories/${category.id}`;
    try {
      await setDoc(doc(db, "categories", category.id), category);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteCategory(categoryId: string) {
    const path = `categories/${categoryId}`;
    try {
      await deleteDoc(doc(db, "categories", categoryId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Sync Search Categories
  subscribeSearchCategories(onUpdate: (categories: any[]) => void, onError: (err: any) => void) {
    const path = "search_categories";
    try {
      return onSnapshot(
        collection(db, path),
        (snapshot) => {
          const list: any[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data());
          });
          list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          onUpdate(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
          onError(error);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveSearchCategory(category: any) {
    const path = `search_categories/${category.id}`;
    try {
      await setDoc(doc(db, "search_categories", category.id), category);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteSearchCategory(categoryId: string) {
    const path = `search_categories/${categoryId}`;
    try {
      await deleteDoc(doc(db, "search_categories", categoryId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Sync Agents
  subscribeAgents(onUpdate: (agents: Agent[]) => void, onError: (err: any) => void) {
    const path = "agents";
    try {
      return onSnapshot(
        collection(db, path),
        (snapshot) => {
          const list: Agent[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Agent);
          });
          onUpdate(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
          onError(error);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveAgent(agent: Agent) {
    const path = `agents/${agent.id}`;
    try {
      await setDoc(doc(db, "agents", agent.id), agent);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Sync Map Locations
  subscribeMapLocations(onUpdate: (map: Record<string, MapLocation>) => void, onError: (err: any) => void) {
    const path = "map_locations";
    try {
      return onSnapshot(
        collection(db, path),
        (snapshot) => {
          const map: Record<string, MapLocation> = {};
          snapshot.forEach((docSnap) => {
            const loc = docSnap.data() as MapLocation;
            map[loc.name] = loc;
          });
          onUpdate(map);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
          onError(error);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveMapLocation(location: MapLocation) {
    const path = `map_locations/${location.name}`;
    try {
      await setDoc(doc(db, "map_locations", location.name), location);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteMapLocation(locationName: string) {
    const path = `map_locations/${locationName}`;
    try {
      await deleteDoc(doc(db, "map_locations", locationName));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Sync Map Settings
  subscribeMapSettings(onUpdate: (settings: MapSettings) => void, onError: (err: any) => void) {
    const path = "settings/map_settings";
    try {
      return onSnapshot(
        doc(db, "settings", "map_settings"),
        (docSnap) => {
          if (docSnap.exists()) {
            onUpdate(docSnap.data() as MapSettings);
          } else {
            const defaults: MapSettings = {
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
              showInvestmentRating: true,
              searchPlaceholder: 'e.g. Modern duplex plot space'
            };
            onUpdate(defaults);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
          onError(error);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveMapSettings(settings: MapSettings) {
    const path = "settings/map_settings";
    try {
      await setDoc(doc(db, "settings", "map_settings"), settings);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Sync Global Site CMS Settings
  subscribeSiteSettings(onUpdate: (settings: SiteCMSConfig) => void, onError: (err: any) => void) {
    const path = "settings/site_settings";
    try {
      return onSnapshot(
        doc(db, "settings", "site_settings"),
        (docSnap) => {
          if (docSnap.exists()) {
            onUpdate(docSnap.data() as SiteCMSConfig);
          } else {
            const defaults: SiteCMSConfig = {
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
                  description: "We do not push standard stock portfolios. Our advisors actively hunt specific real-estate parcels tailored strictly to your individual checklist criteria."
                },
                {
                  id: "s2",
                  title: "Commercial Logistics Acquisition",
                  description: "Secure Grade-A warehouses, high-bay storage centers, and office lease configurations in Bangalore's key development corridors."
                },
                {
                  id: "s3",
                  title: "Bespoke Land Aggregations",
                  description: "Aggregating clear-title agricultural plots, greenfield layouts, and corporate parcels with comprehensive sovereign compliance checks."
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
              ]
            };
            onUpdate(defaults);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
          onError(error);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveSiteSettings(settings: SiteCMSConfig) {
    const path = "settings/site_settings";
    try {
      await setDoc(doc(db, "settings", "site_settings"), settings);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Sync Admin Users concept
  subscribeAdminUsers(onUpdate: (users: AdminUser[]) => void, onError: (err: any) => void) {
    const path = "admin_users";
    try {
      return onSnapshot(
        collection(db, path),
        (snapshot) => {
          const list: AdminUser[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as AdminUser);
          });
          onUpdate(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
          onError(error);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveAdminUser(user: AdminUser) {
    const path = `admin_users/${user.id}`;
    try {
      await setDoc(doc(db, "admin_users", user.id), user);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Sync FAQs
  subscribeFAQs(onUpdate: (faqs: FAQ[]) => void, onError: (err: any) => void) {
    const path = "faqs";
    try {
      return onSnapshot(
        collection(db, path),
        (snapshot) => {
          const list: FAQ[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as FAQ);
          });
          list.sort((a,b) => a.displayOrder - b.displayOrder);
          onUpdate(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
          onError(error);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveFAQ(faq: FAQ) {
    const path = `faqs/${faq.id}`;
    try {
      await setDoc(doc(db, "faqs", faq.id), faq);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteFAQ(faqId: string) {
    const path = `faqs/${faqId}`;
    try {
      await deleteDoc(doc(db, "faqs", faqId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async seedDefaultFAQs() {
    const isEmpty = await this.isCollectionEmpty("faqs");
    if (!isEmpty) return;

    const defaultFaqs: FAQ[] = [
      {
        id: "faq-1",
        question: "How does Dvarix Realty work?",
        answer: "Dvarix Realty is a requirement-based real estate platform. Simply share your property requirements, and our team will help identify suitable options based on your preferences, budget, and goals.",
        category: "General Questions",
        displayOrder: 1,
        status: "Active",
        featured: true,
        lastUpdated: new Date().toISOString()
      },
      {
        id: "faq-2",
        question: "What types of properties does Dvarix Realty assist with?",
        answer: "Dvarix Realty helps customers find properties based on their unique requirements. Whether you are looking for residential, commercial, rental, lease, investment opportunities, land, plots, villas, apartments, farm lands, industrial properties, or any other real estate requirement, we work to find suitable options for you.",
        category: "Property Search",
        displayOrder: 2,
        status: "Active",
        featured: true,
        lastUpdated: new Date().toISOString()
      },
      {
        id: "faq-3",
        question: "Is there any charge for submitting a property requirement?",
        answer: "No. Customers can submit their requirements and receive recommendations without any initial charges.",
        category: "Requirements",
        displayOrder: 3,
        status: "Active",
        featured: false,
        lastUpdated: new Date().toISOString()
      },
      {
        id: "faq-4",
        question: "Can Dvarix Realty arrange site visits?",
        answer: "Yes. We can coordinate and schedule site visits for shortlisted properties.",
        category: "Site Visits",
        displayOrder: 4,
        status: "Active",
        featured: false,
        lastUpdated: new Date().toISOString()
      },
      {
        id: "faq-5",
        question: "How long does it take to receive property recommendations?",
        answer: "The timeline depends on the requirement and property availability, but our team works to provide suitable options as quickly as possible.",
        category: "Property Search",
        displayOrder: 5,
        status: "Active",
        featured: false,
        lastUpdated: new Date().toISOString()
      },
      {
        id: "faq-6",
        question: "Do you assist with investment properties?",
        answer: "Yes. We help identify investment opportunities based on your goals, budget, location preferences, and expected returns.",
        category: "Investment",
        displayOrder: 6,
        status: "Active",
        featured: true,
        lastUpdated: new Date().toISOString()
      },
      {
        id: "faq-7",
        question: "Can I submit multiple property requirements?",
        answer: "Yes. You can submit multiple requirements for different locations, budgets, or property types.",
        category: "Requirements",
        displayOrder: 7,
        status: "Active",
        featured: false,
        lastUpdated: new Date().toISOString()
      },
      {
        id: "faq-8",
        question: "Do you assist with rental and lease properties?",
        answer: "Yes. We assist customers looking for rental, lease, and long-term occupancy opportunities.",
        category: "Property Search",
        displayOrder: 8,
        status: "Active",
        featured: false,
        lastUpdated: new Date().toISOString()
      }
    ];

    for (const faq of defaultFaqs) {
      await this.saveFAQ(faq);
    }
  },

  // Sync Quick Filters (Dynamic from admin panel)
  subscribeQuickFilters(onUpdate: (filters: QuickFilter[]) => void, onError: (err: any) => void) {
    const path = "quick_filters";
    try {
      return onSnapshot(
        collection(db, path),
        (snapshot) => {
          const list: QuickFilter[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as QuickFilter);
          });
          onUpdate(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
          onError(error);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveQuickFilter(filter: QuickFilter) {
    const path = `quick_filters/${filter.id}`;
    try {
      await setDoc(doc(db, "quick_filters", filter.id), filter);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteQuickFilter(filterId: string) {
    const path = `quick_filters/${filterId}`;
    try {
      await deleteDoc(doc(db, "quick_filters", filterId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Sync AI Permissions
  subscribeAIPermissions(onUpdate: (perms: AiPermission[]) => void, onError: (err: any) => void) {
    const path = "ai_permissions";
    try {
      return onSnapshot(
        collection(db, path),
        (snapshot) => {
          const list: AiPermission[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as AiPermission);
          });
          onUpdate(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
          onError(error);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveAIPermission(permission: AiPermission) {
    const path = `ai_permissions/${permission.id}`;
    try {
      await setDoc(doc(db, "ai_permissions", permission.id), permission);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Sync AI Activity Logs
  subscribeAIActivityLogs(onUpdate: (logs: AiActivityLog[]) => void, onError: (err: any) => void) {
    const path = "ai_activity_logs";
    try {
      return onSnapshot(
        collection(db, path),
        (snapshot) => {
          const list: AiActivityLog[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as AiActivityLog);
          });
          // Sort by creation time descending
          list.sort((a, b) => b.created_at.localeCompare(a.created_at));
          onUpdate(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
          onError(error);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveAIActivityLog(log: AiActivityLog) {
    const path = `ai_activity_logs/${log.id}`;
    try {
      await setDoc(doc(db, "ai_activity_logs", log.id), log);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  subscribeEnquiryAuditLogs(onUpdate: (logs: any[]) => void, onError: (err: any) => void) {
    const path = "enquiry_audit_logs";
    try {
      return onSnapshot(
        collection(db, path),
        (snapshot) => {
          const list: any[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data());
          });
          list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
          onUpdate(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
          onError(error);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveEnquiryAuditLog(log: any) {
    const path = `enquiry_audit_logs/${log.id}`;
    try {
      await setDoc(doc(db, "enquiry_audit_logs", log.id), log);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Sync CRM Tasks
  subscribeCRMTasks(onUpdate: (tasks: any[]) => void, onError: (err: any) => void) {
    const path = "crm_tasks";
    try {
      return onSnapshot(
        collection(db, path),
        (snapshot) => {
          const list: any[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data());
          });
          list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          onUpdate(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
          onError(error);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveCRMTask(task: any) {
    const path = `crm_tasks/${task.id}`;
    try {
      await setDoc(doc(db, "crm_tasks", task.id), task);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteCRMTask(taskId: string) {
    const path = `crm_tasks/${taskId}`;
    try {
      await deleteDoc(doc(db, "crm_tasks", taskId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Sync Site Visits
  subscribeSiteVisits(onUpdate: (visits: any[]) => void, onError: (err: any) => void) {
    const path = "site_visits";
    try {
      return onSnapshot(
        collection(db, path),
        (snapshot) => {
          const list: any[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data());
          });
          list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          onUpdate(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
          onError(error);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveSiteVisit(visit: any) {
    const path = `site_visits/${visit.id}`;
    try {
      await setDoc(doc(db, "site_visits", visit.id), visit);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteSiteVisit(visitId: string) {
    const path = `site_visits/${visitId}`;
    try {
      await deleteDoc(doc(db, "site_visits", visitId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Checks if a collection is empty
  async isCollectionEmpty(collectionName: string): Promise<boolean> {
    try {
      const q = query(collection(db, collectionName), limit(1));
      const snap = await getDocs(q);
      return snap.empty;
    } catch (e) {
      console.warn(`Could not check empty status for ${collectionName}:`, e);
      return true;
    }
  }
};
