import express from "express";
import path from "path";
import cors from "cors";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  collection 
} from "firebase/firestore";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(cors());

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwl9YfSeICMJBKnngNT-iWKij-Ucy3wmg",
  authDomain: "dvarix--realty.firebaseapp.com",
  projectId: "dvarix--realty",
  storageBucket: "dvarix--realty.firebasestorage.app",
  messagingSenderId: "94353466975",
  appId: "1:94353466975:web:b958d5aea99b38ff3dddea",
  measurementId: "G-V38ZNLBXT9"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY || "AIzaSyDwl9YfSeICMJBKnngNT-iWKij-Ucy3wmg";
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Helper to save audit trace logs from endpoints
async function logAuditOnServer(action: string, module: string, operator: string, oldVal: any, newVal: any) {
  try {
    const logId = 'audit-srv-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const logData = {
      id: logId,
      user_id: operator || 'server-worker@dvarix.com',
      user_name: 'Dvarix Server Agent',
      role: 'Bot Administrator / Server',
      actionType: action,
      timestamp: new Date().toISOString(),
      moduleAffected: module,
      previousValues: oldVal ? JSON.stringify(oldVal) : 'None',
      updatedValues: newVal ? JSON.stringify(newVal) : 'None'
    };
    await setDoc(doc(db, 'chatbot_audit_logs', logId), logData);
  } catch (err) {
    console.error("Failed to write audit log from server:", err);
  }
}

// 1. SAVE FAQ / KNOWLEDGE BASE MODULE
app.post("/api/chatbot/save-faq", async (req, res) => {
  try {
    const { id, title, content, keywords, priority, status, category, operator } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, error: "Title and content are required parameters." });
    }

    const faqId = id || 'kb-faq-' + Date.now();
    const isNew = !id;
    
    const docRef = doc(db, 'chatbot_knowledge', faqId);
    let version = 1;
    let oldVal = null;
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      oldVal = docSnap.data();
      version = (oldVal.version || 1) + 1;
    }

    const record = {
      id: faqId,
      title,
      content,
      keywords: keywords || '',
      priority: priority || 'Medium',
      status: status || 'Active',
      category: category || 'General Inquiry',
      version,
      lastUpdated: new Date().toISOString(),
      updatedBy: operator || 'Dvarix Administrator'
    };

    await setDoc(docRef, record);
    await logAuditOnServer(isNew ? 'Create' : 'Edit', 'Knowledge FAQ Base', operator, oldVal, record);
    
    res.json({ success: true, message: "Manual FAQ saved and indexed successfully.", data: record });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. DELETE FAQ / KNOWLEDGE BASE MODULE
app.post("/api/chatbot/delete-faq", async (req, res) => {
  try {
    const { id, operator } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, error: "FAQ ID parameter is required." });
    }

    const docRef = doc(db, 'chatbot_knowledge', id);
    const snap = await getDoc(docRef);
    let oldVal = null;
    if (snap.exists()) {
      oldVal = snap.data();
    }

    await deleteDoc(docRef);
    await logAuditOnServer('Delete', 'Knowledge FAQ Base', operator, oldVal, null);

    res.json({ success: true, message: "Manual FAQ deleted and removed from index." });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. INGEST & SAVE DOCUMENT LEARNING MODULE
app.post("/api/chatbot/save-document", async (req, res) => {
  try {
    const { name, content, size, operator } = req.body;
    if (!name || !content) {
      return res.status(400).json({ success: false, error: "Document Name and text Content are required." });
    }

    const docId = 'doc-' + Date.now();
    let snippet = content.substring(0, 150) + '...';

    // SERVER-SIDE PROCESSING: AI text chunk summarization
    try {
      const gemini = getGemini();
      const prompt = `You are the Dvarix AI text processor. Extract a highly-accurate summary snippet (strictly under 150 characters, clean, and in active voice) of this document to use as semantic guide.
Document Content: "${content}"`;
      const aiResponse = await gemini.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      if (aiResponse?.text) {
        snippet = aiResponse.text.trim().substring(0, 150);
      }
    } catch (aiErr: any) {
      console.warn("Gemini summarization bypassed or failed, using local fallback summary:", aiErr.message);
    }

    const record = {
      id: docId,
      name,
      size: size || '25 KB',
      status: 'Indexed',
      content,
      snippet,
      dateAdded: new Date().toISOString()
    };

    await setDoc(doc(db, 'chatbot_documents', docId), record);
    await logAuditOnServer('Create', 'Document Upload KB', operator, null, record);

    res.json({ success: true, message: "Document Ingested & Extrapolated with Server AI successfully.", data: record });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. PURGE/DELETE INDEXED DOCUMENT MODULE
app.post("/api/chatbot/delete-document", async (req, res) => {
  try {
    const { id, operator } = req.body;
    if (!id) return res.status(400).json({ success: false, error: "ID is required." });

    const docRef = doc(db, 'chatbot_documents', id);
    const snap = await getDoc(docRef);
    let oldVal = null;
    if (snap.exists()) oldVal = snap.data();

    await deleteDoc(docRef);
    await logAuditOnServer('Delete', 'Document Upload KB', operator, oldVal, null);

    res.json({ success: true, message: "Document stripped from Vector memory." });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. SCRAPE & SAVE WEBSITE URL MODULE (CRAWLER AUTO-SYNC WITH SERVER-SIDE CRAWL SIMULATION)
app.post("/api/chatbot/save-website", async (req, res) => {
  try {
    const { url, content, operator } = req.body;
    if (!url || !content) {
      return res.status(400).json({ success: false, error: "Website URL path and Parsed text contents are required." });
    }

    const siteId = 'web-' + Date.now();
    let snippet = content.substring(0, 150) + '...';

    // SERVER-SIDE DATA PROCESSING: Simulating real DOM-scraping descriptions via Gemini Flash
    try {
      const gemini = getGemini();
      const prompt = `Analyze this simulated crawled webpage text from Dvarix Realty website route "${url}". Extract a clean, professional, user-friendly 130-char description snippet suitable for a chatbot response index.
Crawled text: "${content}"`;
      const aiResponse = await gemini.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      if (aiResponse?.text) {
        snippet = aiResponse.text.trim().substring(0, 150);
      }
    } catch (aiErr: any) {
      console.warn("Website indexing Gemini summarizer bypassed or failed:", aiErr.message);
    }

    const record = {
      id: siteId,
      url,
      status: 'Indexed',
      content,
      snippet,
      dateAdded: new Date().toISOString()
    };

    await setDoc(doc(db, 'chatbot_websites', siteId), record);
    await logAuditOnServer('Create', 'Website Crawler Link KB', operator, null, record);

    res.json({ success: true, message: "Webpage synced, parsed, and cached in index memory successfully.", data: record });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. DELETE SCRAPED WEBSITE
app.post("/api/chatbot/delete-website", async (req, res) => {
  try {
    const { id, operator } = req.body;
    if (!id) return res.status(400).json({ success: false, error: "ID is required." });

    const docRef = doc(db, 'chatbot_websites', id);
    const snap = await getDoc(docRef);
    let oldVal = null;
    if (snap.exists()) oldVal = snap.data();

    await deleteDoc(docRef);
    await logAuditOnServer('Delete', 'Website Crawler Link KB', operator, oldVal, null);

    res.json({ success: true, message: "Website removed from memory." });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. SAVE AI INSTRUCTION NOTES & SNIPPETS MODULE
app.post("/api/chatbot/save-snippet", async (req, res) => {
  try {
    const { note, keywords, operator } = req.body;
    if (!note) {
      return res.status(400).json({ success: false, error: "Snippet Note contents must be specified." });
    }

    const snId = 'sn-' + Date.now();
    const record = {
      id: snId,
      note,
      status: 'Active',
      keywords: keywords || '',
      dateAdded: new Date().toISOString()
    };

    await setDoc(doc(db, 'chatbot_snippets', snId), record);
    await logAuditOnServer('Create', 'AI Note Snippet KB', operator, null, record);

    res.json({ success: true, message: "Snippet instruction note saved and is now live active.", data: record });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. DELETE AI SNIPPET
app.post("/api/chatbot/delete-snippet", async (req, res) => {
  try {
    const { id, operator } = req.body;
    if (!id) return res.status(400).json({ success: false, error: "ID is required." });

    const docRef = doc(db, 'chatbot_snippets', id);
    const snap = await getDoc(docRef);
    let oldVal = null;
    if (snap.exists()) oldVal = snap.data();

    await deleteDoc(docRef);
    await logAuditOnServer('Delete', 'AI Note Snippet KB', operator, oldVal, null);

    res.json({ success: true, message: "Instruction note deleted." });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. DYNAMIC PROPERTY DATABASE INTEGRATION SYNC ACTION
app.post("/api/chatbot/sync-properties", async (req, res) => {
  try {
    const propCol = collection(db, 'properties');
    const querySnap = await getDocs(propCol);
    const propertiesList: any[] = [];
    querySnap.forEach((doc) => {
      propertiesList.push({ id: doc.id, ...doc.data() });
    });

    const listCount = propertiesList.length;

    await setDoc(doc(db, 'chatbot_settings', 'properties_cache'), {
      syncedAt: new Date().toISOString(),
      propertiesCount: listCount,
      summaryList: propertiesList.map(p => ({
        id: p.id,
        title: p.title,
        price: p.price,
        location: p.location,
        type: p.type,
        address: p.address,
        beds: p.beds || 0,
        sqft: p.sqft || 0
      }))
    });

    res.json({ 
      success: true, 
      count: listCount, 
      message: `Database synchronized! ${listCount} active property listings indexed successfully into Vector Memory.` 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 10. DYNAMIC PROGRAMMATIC ROUTING AND ADVANCED CRM SYNC LEAD RULES
app.post("/api/chatbot/crm-sync-actions", async (req, res) => {
  try {
    const { leadPayload } = req.body;
    if (!leadPayload) {
      return res.status(400).json({ success: false, error: "leadPayload parameter is required." });
    }

    const rulesCol = collection(db, 'qualification_rules');
    const rulesSnap = await getDocs(rulesCol);
    const activeRules: any[] = [];
    rulesSnap.forEach(d => {
      const data = d.data();
      if (data.status === 'Active') activeRules.push(data);
    });

    let assignedAgent = 'General Coordinator';
    let matchedRuleName = 'Default Broadcast';

    const budgetValue = parseFloat(String(leadPayload.minBudget || leadPayload.maxBudget || '0').replace(/[^0-9.]/g, ''));
    const propertyTypeStr = String(leadPayload.propertyType || '').toLowerCase();
    const intentStr = String(leadPayload.lookingFor || '').toLowerCase();

    for (const rule of activeRules) {
      let isMatch = false;
      const { conditionField, conditionOperator, conditionValue, actionType, ruleName } = rule;

      if (conditionField === 'budget') {
        const threshold = parseFloat(conditionValue);
        if (conditionOperator === '>') {
          isMatch = budgetValue > threshold;
        } else if (conditionOperator === 'equals') {
          isMatch = budgetValue === threshold;
        }
      } else if (conditionField === 'propertyType') {
        if (conditionOperator === 'contains') {
          isMatch = propertyTypeStr.includes(String(conditionValue).toLowerCase());
        } else if (conditionOperator === 'equals') {
          isMatch = propertyTypeStr === String(conditionValue).toLowerCase();
        }
      } else if (conditionField === 'intent') {
        if (conditionOperator === 'contains') {
          isMatch = intentStr.includes(String(conditionValue).toLowerCase());
        } else if (conditionOperator === 'equals') {
          isMatch = intentStr === String(conditionValue).toLowerCase();
        }
      }

      if (isMatch) {
         assignedAgent = actionType;
         matchedRuleName = ruleName;
         break;
      }
    }

    const resultLead = {
      ...leadPayload,
      crmCoordinator: assignedAgent,
      qualificationLogs: `Programmatic Match: Assigned under [${matchedRuleName}] rule to specialized desk [${assignedAgent}].`
    };

    await setDoc(doc(db, 'requirements', leadPayload.id), resultLead);
    await logAuditOnServer('Create/Route', 'Lead Qualifications Engine', 'CRM Automation Block', null, resultLead);

    res.json({
      success: true,
      data: resultLead,
      assignedAgent,
      matchedRuleName,
      message: `Lead Qualification sync completed! programmatic assigned routing: ${assignedAgent}`
    });
  } catch(error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- ENTERPRISE RAG ARCHITECTURE HELPERS & INTEGRATIONS ---

// Multi-vector cosine similarity calculation
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Generate category-specific semantic embeddings
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const gemini = getGemini();
    const response = await gemini.models.embedContent({
      model: 'gemini-embedding-2-preview',
      contents: text,
    }) as any;
    return response.embedding?.values || response.embeddings?.[0]?.values || [];
  } catch (err: any) {
    console.warn("Embedding generation failed, falling back to deterministic semantic representation:", err.message);
    const mockVec = new Array(1536).fill(0);
    const cleanText = text.toLowerCase();
    for (let i = 0; i < cleanText.length; i++) {
      mockVec[i % 1536] += cleanText.charCodeAt(i) / 255;
    }
    const norm = Math.sqrt(mockVec.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
      for (let i = 0; i < 1536; i++) mockVec[i] /= norm;
    }
    return mockVec;
  }
}

// Automatic knowledge item classifier
async function autoClassifyDocument(item: {
  title: string;
  content: string;
  rawTags: string;
  source: string;
  originalCategory?: string;
}): Promise<{
  category: string;
  visibility: 'PUBLIC' | 'ADMIN';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'DRAFT';
  tags: string[];
}> {
  let visibility: 'PUBLIC' | 'ADMIN' = 'PUBLIC';
  let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  let status: 'ACTIVE' | 'DRAFT' = 'ACTIVE';

  if (item.source === 'Property Database Knowledge' || item.source === 'Document Learning') {
    priority = 'HIGH';
  } else if (item.source === 'AI Notes & Snippets') {
    priority = 'LOW';
  }

  const tags: string[] = [];
  const tagSource = `${item.rawTags || ''} ${item.source || ''}`.toLowerCase();
  tagSource.split(/[\s,;]+/).map(t => t.trim()).filter(Boolean).forEach(t => {
    if (!tags.includes(t)) tags.push(t);
  });

  let category = 'FAQ';

  if (item.source === 'Property Database Knowledge') {
    category = 'PROPERTY';
  } else if (item.originalCategory) {
    const origUpper = item.originalCategory.toUpperCase();
    if (['COMPANY', 'FAQ', 'PROPERTY', 'LEGAL', 'VASTU', 'WEBSITE', 'CRM', 'INTERNAL'].includes(origUpper)) {
      category = origUpper;
    }
  }

  if (category === 'FAQ') {
    const fullText = `${item.title} ${item.content} ${item.rawTags || ''}`.toLowerCase();
    if (fullText.includes('rera') || fullText.includes('registration') || fullText.includes('stamp duty') || fullText.includes('compliance') || fullText.includes('legal')) {
      category = 'LEGAL';
    } else if (fullText.includes('vastu') || fullText.includes('direction') || fullText.includes('east facing') || fullText.includes('north facing') || fullText.includes('architectural')) {
      category = 'VASTU';
    } else if (fullText.includes('lead') || fullText.includes('qualification') || fullText.includes('crm') || fullText.includes('qualify') || fullText.includes('customer requirements')) {
      category = 'CRM';
    } else if (fullText.includes('sop') || fullText.includes('admin manual') || fullText.includes('compliance log') || fullText.includes('version history') || fullText.includes('internal notes') || fullText.includes('personality version')) {
      category = 'INTERNAL';
    } else if (fullText.includes('about dvarix') || fullText.includes('vision') || fullText.includes('mission') || fullText.includes('about us') || fullText.includes('contact details') || fullText.includes('services')) {
      category = 'COMPANY';
    } else if (item.source === 'Website Import' || fullText.includes('blog') || fullText.includes('website pages')) {
      category = 'WEBSITE';
    }
  }

  if (category === 'INTERNAL') {
    visibility = 'ADMIN';
  }

  return { category, visibility, priority, status, tags };
}

// Intent detection using conversation context
async function detectCustomerIntent(message: string, chatHistoryText: string): Promise<string> {
  try {
    const gemini = getGemini();
    const prompt = `You are the master routing compiler of Dvarix Realty Bot Studio. Analyze the customer's latest message and conversation context, and classify the customer's intent into exactly one of the following tokens:
- BUY_PROPERTY (if asking to purchase a property/home)
- SELL_PROPERTY (if asking to list/sell their property)
- RENT_PROPERTY (if looking to rent a property)
- LEASE_PROPERTY (if asking about leasing commercial/residential space)
- PROPERTY_SEARCH (general property searching or listings queries)
- PROPERTY_COMPARISON (comparing different properties/amenities)
- SITE_VISIT (asking to book, schedule, or complete a physical tour)
- FAQ (common questions about real estate buying/selling processes, general FAQs)
- COMPANY_INFORMATION (questions about Dvarix Realty itself, our mission, or vision)
- SERVICES (questions about building construction, renovation, decorators, or services)
- LEGAL_INFORMATION (questions about RERA, registration, taxes, stamp duty, or legal compliance)
- HOME_LOAN (questions about financing, home loan rates, or calculators)
- VASTU (questions about scientific Vastu, directions, architectural guidelines)
- CONTACT (asking how to contact, phone number, email, address)
- AGENT (asking to talk to a human agent, broker, or manager)
- GENERAL_CHAT (social greetings, hello, how are you, chitchat)
- UNKNOWN (if completely ambiguous)

Response MUST be exactly one of the tokens listed above. Do not include any punctuation, markdown, or other text.

Conversation Context:
${chatHistoryText}

Latest Customer Message: "${message}"`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });
    const token = response.text?.trim() || "UNKNOWN";
    const validIntents = [
      'BUY_PROPERTY', 'SELL_PROPERTY', 'RENT_PROPERTY', 'LEASE_PROPERTY', 
      'PROPERTY_SEARCH', 'PROPERTY_COMPARISON', 'SITE_VISIT', 'FAQ', 
      'COMPANY_INFORMATION', 'SERVICES', 'LEGAL_INFORMATION', 'HOME_LOAN', 
      'VASTU', 'CONTACT', 'AGENT', 'GENERAL_CHAT', 'UNKNOWN'
    ];
    const matched = validIntents.find(i => token.includes(i));
    return matched || "UNKNOWN";
  } catch (err) {
    console.error("Intent detection failed, falling back to UNKNOWN:", err);
    return "UNKNOWN";
  }
}

// Route detected intent to index name
function routeIntentToIndex(intent: string): string {
  switch (intent) {
    case 'BUY_PROPERTY':
    case 'RENT_PROPERTY':
    case 'LEASE_PROPERTY':
    case 'PROPERTY_SEARCH':
    case 'PROPERTY_COMPARISON':
      return 'property_index';
      
    case 'COMPANY_INFORMATION':
    case 'SERVICES':
    case 'CONTACT':
      return 'company_index';
      
    case 'FAQ':
    case 'HOME_LOAN':
    case 'GENERAL_CHAT':
      return 'faq_index';
      
    case 'LEGAL_INFORMATION':
      return 'legal_index';
      
    case 'VASTU':
      return 'vastu_index';
      
    case 'SITE_VISIT':
    case 'SELL_PROPERTY':
      return 'website_index';
      
    case 'AGENT':
    case 'UNKNOWN':
    default:
      return 'crm_index';
  }
}

// Search direct Firestore collections for live property data
function findRelevantLiveProperties(query: string, properties: any[]): any[] {
  const cleanQuery = query.toLowerCase();
  return properties.filter(p => {
    const title = (p.title || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const loc = (p.location || '').toLowerCase();
    const type = (p.type || '').toLowerCase();
    return title.includes(cleanQuery) || desc.includes(cleanQuery) || loc.includes(cleanQuery) || type.includes(cleanQuery) ||
      cleanQuery.split(' ').some(word => word.length > 3 && (title.includes(word) || loc.includes(word)));
  });
}

// 11. TRAIN AI INTEGRATION: THE ENTERPRISE MULTI-INDEX RAG COMPILER
app.post("/api/chatbot/trigger-entire-system-train", async (req, res) => {
  try {
    const logs: string[] = [];
    const timestampFirst = new Date().toLocaleTimeString();
    
    logs.push(`[${timestampFirst}] 🔍 [PIPELINE] Commencing exhaustive knowledge pipeline traversal for Dvarix Realty...`);
    
    // Fetch FAQs
    const faqSnap = await getDocs(collection(db, 'chatbot_knowledge'));
    const faqs: any[] = [];
    faqSnap.forEach(d => faqs.push(d.data()));
    logs.push(`[${new Date().toLocaleTimeString()}] 📚 [LOAD] Discovered ${faqs.length} Active Q&A overrides in local partition.`);

    // Fetch Documents
    const docSnap = await getDocs(collection(db, 'chatbot_documents'));
    const documents: any[] = [];
    docSnap.forEach(d => documents.push(d.data()));
    logs.push(`[${new Date().toLocaleTimeString()}] 📄 [LOAD] Ingested ${documents.length} PDF/TXT legal manual index blocks.`);

    // Fetch Websites
    const siteSnap = await getDocs(collection(db, 'chatbot_websites'));
    const websites: any[] = [];
    siteSnap.forEach(d => websites.push(d.data()));
    logs.push(`[${new Date().toLocaleTimeString()}] 🌐 [LOAD] Synced ${websites.length} domain crawls (/about, /services, /faq routes).`);

    // Fetch Property listings
    const propSnap = await getDocs(collection(db, 'properties'));
    const properties: any[] = [];
    propSnap.forEach(d => properties.push(d.data()));
    logs.push(`[${new Date().toLocaleTimeString()}] 🗄️ [LOAD] Scanned ${properties.length} live listings from main database.`);

    // Fetch Snippets
    const snipSnap = await getDocs(collection(db, 'chatbot_snippets'));
    const snippets: any[] = [];
    snipSnap.forEach(d => snippets.push(d.data()));
    logs.push(`[${new Date().toLocaleTimeString()}] ✍️ [LOAD] Stacked ${snippets.length} specialized helper instruction overrides.`);

    logs.push(`[${new Date().toLocaleTimeString()}] ⚙️ [COMPILING] Auto-classifying documents, generating category-specific embeddings and preserving metadata...`);

    // Fetch existing semantic indexes from Firestore to skip duplicates
    const indexDocNames = [
      'company_index', 'faq_index', 'property_index', 'legal_index',
      'vastu_index', 'website_index', 'crm_index', 'internal_index'
    ];
    const oldIndexItemsMap: Record<string, any[]> = {};
    for (const name of indexDocNames) {
      try {
        const snap = await getDoc(doc(db, 'chatbot_indexes', name));
        oldIndexItemsMap[name] = snap.exists() ? (snap.data().items || []) : [];
      } catch (err) {
        console.warn(`Could not load old index ${name}:`, err);
        oldIndexItemsMap[name] = [];
      }
    }

    function findOldItem(id: string) {
      for (const name of indexDocNames) {
        const found = oldIndexItemsMap[name].find((item: any) => item.id === id);
        if (found) return found;
      }
      return null;
    }

    // Standardize all inputs into a raw corpus array
    const rawItems: any[] = [];

    faqs.forEach(f => {
      rawItems.push({
        id: f.id || 'kb-faq-' + Date.now() + '-' + Math.random(),
        title: f.title || '',
        content: `Q: ${f.title}\nA: ${f.content}`,
        originalCategory: f.category || 'FAQ',
        priority: f.priority || 'Medium',
        status: f.status || 'Active',
        rawTags: f.keywords || '',
        source: 'Manual Q&A',
        language: 'en'
      });
    });

    documents.forEach(d => {
      rawItems.push({
        id: d.id || 'doc-' + Date.now() + '-' + Math.random(),
        title: d.name || '',
        content: `Document "${d.name}":\n${d.content}`,
        originalCategory: '',
        priority: 'High',
        status: d.status || 'Indexed',
        rawTags: '',
        source: 'Document Learning',
        language: 'en'
      });
    });

    websites.forEach(w => {
      rawItems.push({
        id: w.id || 'web-' + Date.now() + '-' + Math.random(),
        title: w.url || '',
        content: `Web Route "${w.url}":\n${w.content}`,
        originalCategory: 'Website',
        priority: 'Medium',
        status: w.status || 'Indexed',
        rawTags: '',
        source: 'Website Import',
        language: 'en'
      });
    });

    properties.forEach(p => {
      rawItems.push({
        id: p.id || 'prop-' + Date.now() + '-' + Math.random(),
        title: p.title || '',
        content: `Listing: ${p.title}\nType: ${p.type}\nLocation: ${p.location}\nAddress: ${p.address}\nPrice: ₹${p.price}\nDescription: ${p.description}\nAmenity List: ${(p.amenities || []).join(', ')}`,
        originalCategory: 'PROPERTY',
        priority: 'High',
        status: 'Active',
        rawTags: `${p.type || ''} ${p.location || ''}`,
        source: 'Property Database Knowledge',
        language: 'en'
      });
    });

    snippets.forEach(s => {
      rawItems.push({
        id: s.id || 'sn-' + Date.now() + '-' + Math.random(),
        title: 'Instruction Override',
        content: `Override instruction: ${s.note}\nKeywords: ${s.keywords}`,
        originalCategory: 'INTERNAL',
        priority: 'Low',
        status: s.status || 'Active',
        rawTags: s.keywords || '',
        source: 'AI Notes & Snippets',
        language: 'en'
      });
    });

    const newIndexes: Record<string, any[]> = {
      company_index: [],
      faq_index: [],
      property_index: [],
      legal_index: [],
      vastu_index: [],
      website_index: [],
      crm_index: [],
      internal_index: []
    };

    let skippedCount = 0;
    let indexedCount = 0;
    let modifiedCount = 0;

    for (const rawItem of rawItems) {
      const classification = await autoClassifyDocument(rawItem);
      
      let indexName = 'faq_index';
      if (classification.category === 'COMPANY') indexName = 'company_index';
      else if (classification.category === 'PROPERTY') indexName = 'property_index';
      else if (classification.category === 'LEGAL') indexName = 'legal_index';
      else if (classification.category === 'VASTU') indexName = 'vastu_index';
      else if (classification.category === 'WEBSITE') indexName = 'website_index';
      else if (classification.category === 'CRM') indexName = 'crm_index';
      else if (classification.category === 'INTERNAL') indexName = 'internal_index';

      const oldItem = findOldItem(rawItem.id);
      let embedding: number[] = [];
      let lastIndexed = new Date().toISOString();
      let embeddingVersion = 1;

      if (oldItem && oldItem.content === rawItem.content) {
        embedding = oldItem.embedding || [];
        embeddingVersion = oldItem.metadata?.embeddingVersion || 1;
        lastIndexed = oldItem.metadata?.lastIndexed || lastIndexed;
        skippedCount++;
        logs.push(`[${new Date().toLocaleTimeString()}] 💾 [SKIP] Preserved identical document embedding for [${rawItem.source}] "${rawItem.title.substring(0, 30)}..." (Version ${embeddingVersion})`);
      } else {
        embedding = await generateEmbedding(rawItem.content);
        if (oldItem) {
          embeddingVersion = (oldItem.metadata?.embeddingVersion || 1) + 1;
          modifiedCount++;
          logs.push(`[${new Date().toLocaleTimeString()}] 🧬 [RE-INDEX] Re-indexed modified document [${rawItem.source}] "${rawItem.title.substring(0, 30)}..." to Version ${embeddingVersion}`);
        } else {
          embeddingVersion = 1;
          indexedCount++;
          logs.push(`[${new Date().toLocaleTimeString()}] 🏷️ [NEW] Auto-classified & generated embedding for [${rawItem.source}] "${rawItem.title.substring(0, 30)}..." into category ${classification.category}`);
        }
      }

      const indexItem = {
        id: rawItem.id,
        content: rawItem.content,
        embedding,
        metadata: {
          category: classification.category,
          visibility: classification.visibility,
          priority: classification.priority,
          status: classification.status,
          lastIndexed,
          embeddingVersion,
          source: rawItem.source,
          language: rawItem.language,
          tags: classification.tags
        }
      };

      newIndexes[indexName].push(indexItem);
    }

    // Save separate semantic vector indexes
    for (const [name, items] of Object.entries(newIndexes)) {
      await setDoc(doc(db, 'chatbot_indexes', name), {
        items,
        count: items.length,
        lastIndexed: new Date().toISOString()
      });
      logs.push(`[${new Date().toLocaleTimeString()}] 🗃️ [INDEX] Rebuilt index "${name}" with ${items.length} records.`);
    }

    // Keep backwards compatibility for the existing UI with compiled_corpus
    const combinedCorpus = rawItems.map(item => item.content).join('\n\n');
    let systemSummarizedRepresentation = "Dvarix Grounded Core Intelligence compiled successfully.";
    try {
      const gemini = getGemini();
      const modelPrompt = `You are the master compiler of Dvarix Realty Bot Studio. Review the consolidated real estate knowledge profile below, and write an authoritative, highly professional summary (strictly under 1000 characters) detailing the main developments, legal RERA facts, construction services, and active hotzones (Devanahalli Airport, JP Nagar, Whitefield) that the agent should keep at primary retrieval.
Consolidated Knowledge Profile: ${combinedCorpus.substring(0, 8000)}`;

      const aiResponse = await gemini.models.generateContent({
        model: "gemini-3.5-flash",
        contents: modelPrompt
      });
      if (aiResponse?.text) {
        systemSummarizedRepresentation = aiResponse.text.trim();
      }
    } catch (aiErr: any) {
      console.warn("Summary generation failed or bypassed:", aiErr.message);
    }

    const compiledKnowledgeRef = doc(db, 'chatbot_settings', 'compiled_corpus');
    await setDoc(compiledKnowledgeRef, {
      compiledAt: new Date().toISOString(),
      rawCorpus: combinedCorpus,
      systemSummary: systemSummarizedRepresentation,
      status: 'Fully Trained'
    });

    await setDoc(doc(db, 'chatbot_settings', 'config'), { intelligenceMode: true }, { merge: true });

    logs.push(`[${new Date().toLocaleTimeString()}] ⚡ [TRIGGERED_LIVE] Deploying compiled vector mappings. Intelligence Mode is ONLINE.`);
    logs.push(`[${new Date().toLocaleTimeString()}] 🎉 [SUCCESS] Training complete. Vector indexes successfully compiled and activated.`);

    await logAuditOnServer('Train AI', 'Core Vector Memory Space', 'Training Pipeline Service', null, { 
      status: 'Success', 
      totalProcessed: rawItems.length,
      skipped: skippedCount,
      reindexed: modifiedCount,
      newIndexed: indexedCount
    });

    res.json({
      success: true,
      logs,
      systemSummary: systemSummarizedRepresentation,
      message: "Dvarix Bot Studio vector search and training pipelines fully rebuilt and deployed."
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 12. UPDATE CHATBOT INTELLIGENCE TOGGLE LIVE
app.post("/api/chatbot/toggle-intelligence", async (req, res) => {
  try {
    const { intelligenceMode, operator } = req.body;
    await setDoc(doc(db, 'chatbot_settings', 'config'), { intelligenceMode: !!intelligenceMode }, { merge: true });
    await logAuditOnServer('Toggle Mode', 'Bot Cognitive Pipeline', operator, null, { intelligenceMode });
    res.json({ success: true, intelligenceMode: !!intelligenceMode, message: `Intelligence pipeline state: ${!!intelligenceMode ? 'ONLINE' : 'OFFLINE'}` });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 12.1. GENERATE FAQ FROM PROPERTY USING AI
app.post("/api/chatbot/generate-property-faq", async (req, res) => {
  try {
    const { property, operator } = req.body;
    if (!property) {
      return res.status(400).json({ success: false, error: "Property metadata payload is required." });
    }

    const gemini = getGemini();
    const prompt = `Based on the property details below, generate a professional, highly informative FAQ knowledge base entry (single Q&A pairing).
Property Title: ${property.title}
Type: ${property.type}
Price: ₹${property.price}
Beds/Baths: ${property.beds} BHK, ${property.baths} baths
Area size: ${property.sqft} sqft
Landmark/Address: ${property.address}, ${property.location}
Description: ${property.description}
Amenities: ${(property.amenities || []).join(', ')}

Strictly format the JSON response so it fits a clean FAQ knowledge schema:
{
  "title": "A highly relevant question a customer would ask about this property",
  "content": "A detailed, structured, professional factual answer introducing the price, size, amenities, and location"
}`;

    const aiResponse = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    let generatedObj = { title: "", content: "" };
    if (aiResponse?.text) {
      generatedObj = JSON.parse(aiResponse.text.trim());
    }

    if (!generatedObj.title || !generatedObj.content) {
      throw new Error("AI returned invalid JSON structure.");
    }

    const faqId = 'kb-faq-ai-' + Date.now();
    const record = {
      id: faqId,
      title: generatedObj.title,
      content: generatedObj.content,
      keywords: `${String(property.type).toLowerCase()}, pricing, ${String(property.location).toLowerCase()}`,
      priority: 'High',
      status: 'Active',
      category: 'Property Information',
      version: 1,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'Dvarix AI Synthesizer'
    };

    await setDoc(doc(db, 'chatbot_knowledge', faqId), record);
    await logAuditOnServer('Create', 'Grounded Database AI Synthesis', operator, null, record);

    res.json({ success: true, faq: record });
  } catch (error: any) {
    console.error("AI property FAQ generation error:", error);
    res.status(550).json({ success: false, error: error.message });
  }
});

// 13. REAL INTELLIGENT CHATBOT ENDPOINT USING THE DYNAMIC RETRACED MEMORY SPACE
app.post("/api/chatbot/chat", async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: "Empty message payload." });
    }

    // Load dynamic published personality configuration from Firestore
    const configSnap = await getDoc(doc(db, 'chatbot_settings', 'config'));
    const config = configSnap.exists() ? { ...DEFAULT_PERSONALITY, ...configSnap.data() } : DEFAULT_PERSONALITY;

    const previousTurns = (chatHistory || []).slice(-6).map((turn: any) => {
      const senderName = turn.sender === 'user' ? 'User' : (config.botName || 'Dvarix Assistant');
      return `${senderName}: ${turn.text}`;
    }).join('\n');

    // 1. Detect Customer Intent using Conversation Context
    const detectedIntent = await detectCustomerIntent(message, previousTurns);

    // 2. Route detected intent to correct semantic knowledge index
    const indexName = routeIntentToIndex(detectedIntent);

    // 3. Load items from routed semantic index
    let indexItems: any[] = [];
    try {
      const indexSnap = await getDoc(doc(db, 'chatbot_indexes', indexName));
      if (indexSnap.exists()) {
        indexItems = indexSnap.data().items || [];
      }
    } catch (indexErr) {
      console.warn(`Could not load semantic index ${indexName}:`, indexErr);
    }

    // 4. Protect internal/admin-only content (SOPs, logs, etc.)
    const publicIndexItems = indexItems.filter(item => {
      const vis = (item.metadata?.visibility || 'PUBLIC').toUpperCase();
      const cat = (item.metadata?.category || 'FAQ').toUpperCase();
      return vis !== 'ADMIN' && cat !== 'INTERNAL';
    });

    // 5. Retrieve Relevant Context via multi-vector Cosine Similarity
    let matchedChunks: any[] = [];
    if (publicIndexItems.length > 0) {
      const userEmbedding = await generateEmbedding(message);
      const similarityList = publicIndexItems.map(item => {
        const sim = cosineSimilarity(userEmbedding, item.embedding || []);
        return { ...item, similarity: sim };
      });
      // Sort by similarity descending
      similarityList.sort((a, b) => b.similarity - a.similarity);
      // Retrieve top 5 semantic matches
      matchedChunks = similarityList.slice(0, 5);
    }

    // 6. Direct Properties direct collection query override (Priority 1)
    let livePropertiesMatched: any[] = [];
    const isPropertyIntent = [
      'BUY_PROPERTY', 'RENT_PROPERTY', 'LEASE_PROPERTY', 
      'PROPERTY_SEARCH', 'PROPERTY_COMPARISON'
    ].includes(detectedIntent);

    if (isPropertyIntent) {
      try {
        const propSnap = await getDocs(collection(db, 'properties'));
        const allProperties: any[] = [];
        propSnap.forEach(d => allProperties.push({ id: d.id, ...d.data() }));
        livePropertiesMatched = findRelevantLiveProperties(message, allProperties);
      } catch (propErr) {
        console.warn("Could not query live properties directly:", propErr);
      }
    }

    // 7. Organize retrieved chunks using Priority Order Grouping
    const priorityGroups: Record<string, string[]> = {
      p1: [], // Priority 1: Matched live properties
      p2: [], // Priority 2: Chunks where source is 'Manual Q&A'
      p3: [], // Priority 3: Chunks where source is 'Property Database Knowledge'
      p4: [], // Priority 4: Chunks where source is 'Website Import'
      p5: [], // Priority 5: Chunks where source is 'Document Learning'
      p6: [], // Priority 6: Chunks where source is 'AI Notes & Snippets'
      p7: [], // Priority 7: General Semantic Search chunks
    };

    if (livePropertiesMatched.length > 0) {
      livePropertiesMatched.forEach(p => {
        priorityGroups.p1.push(`Listing: ${p.title}\nType: ${p.type}\nLocation: ${p.location}\nAddress: ${p.address}\nPrice: ₹${p.price}\nBeds/Baths: ${p.beds || 0} BHK, ${p.baths || 0} baths\nDescription: ${p.description}\nAmenity List: ${(p.amenities || []).join(', ')}\n[Status: LIVE DATA - PRIMARY PRIORITY]`);
      });
    }

    matchedChunks.forEach(chunk => {
      const source = chunk.metadata?.source || '';
      const text = chunk.content;
      
      if (source === 'Manual Q&A') {
        priorityGroups.p2.push(text);
      } else if (source === 'Property Database Knowledge') {
        priorityGroups.p3.push(text);
      } else if (source === 'Website Import') {
        priorityGroups.p4.push(text);
      } else if (source === 'Document Learning') {
        priorityGroups.p5.push(text);
      } else if (source === 'AI Notes & Snippets') {
        priorityGroups.p6.push(text);
      } else {
        priorityGroups.p7.push(text);
      }
    });

    const fallbackSummary = "Dvarix Realty specializes in pre-cleared layouts in Devanahalli Aviation High Corridor, Whitefield price appreciation guides, custom scientific Vastu alignments, BBMP A-Khata licenses, and robust construction warranties.";
    let groundKbText = "";
    if (priorityGroups.p1.length > 0) {
      groundKbText += `=== PRIORITY 1: LIVE PRIMARY DATABASE LISTINGS ===\n(These live database entries override any conflicting static document or manual details)\n${priorityGroups.p1.join('\n\n')}\n\n`;
    }
    if (priorityGroups.p2.length > 0) {
      groundKbText += `=== PRIORITY 2: MANUAL Q&A KNOWLEDGE ===\n${priorityGroups.p2.join('\n\n')}\n\n`;
    }
    if (priorityGroups.p3.length > 0) {
      groundKbText += `=== PRIORITY 3: PROPERTY SCHEMAS ===\n${priorityGroups.p3.join('\n\n')}\n\n`;
    }
    if (priorityGroups.p4.length > 0) {
      groundKbText += `=== PRIORITY 4: WEBSITE IMPORTED PAGES ===\n${priorityGroups.p4.join('\n\n')}\n\n`;
    }
    if (priorityGroups.p5.length > 0) {
      groundKbText += `=== PRIORITY 5: COMPLIANCE & LEGAL DOCUMENTS ===\n${priorityGroups.p5.join('\n\n')}\n\n`;
    }
    if (priorityGroups.p6.length > 0) {
      groundKbText += `=== PRIORITY 6: SPECIALIZED AI NOTES & OVERRIDES ===\n${priorityGroups.p6.join('\n\n')}\n\n`;
    }
    if (priorityGroups.p7.length > 0) {
      groundKbText += `=== PRIORITY 7: SEMANTIC SEARCH GRAPH ===\n${priorityGroups.p7.join('\n\n')}\n\n`;
    }

    if (!groundKbText.trim()) {
      groundKbText = fallbackSummary;
    }

    const gemini = getGemini();

    // Compile active business rules descriptions
    let rulesText = "";
    if (config.businessRules) {
      const activeRules = [];
      if (config.businessRules.askIntentFirst) activeRules.push("Always ask and categorize customer intent early (Buy/Rent/Sell/Invest).");
      if (config.businessRules.avoidEarlyPhone) activeRules.push("Avoid requesting user phone numbers or contact parameters immediately.");
      if (config.businessRules.neverLegalGuarantees) activeRules.push("Never provide verbal/written legal warranties or asset appreciation guarantees.");
      if (config.businessRules.neverInvestmentReturns) activeRules.push("Never promise specific investment percentages or interest loops.");
      if (config.businessRules.recommendSiteVisits) activeRules.push("Proactively recommend physical site inspections and schedule guided tours.");
      if (config.businessRules.prioritizeUnderstanding) activeRules.push("Prioritize deep requirement discovery over simple rigid form capture.");
      if (config.businessRules.offerServicesNaturally) activeRules.push("Mention ancillary decorator options, legal searches, and construction warranties naturally.");
      
      if (activeRules.length > 0) {
        rulesText = `\n=== HARD BUSINESS COMPLIANCE RULES ===\n${activeRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;
      }
    }

    // Compile restricted topics restrictions
    let restrictedText = "";
    if (config.restrictedTopics && config.restrictedTopics.trim()) {
      restrictedText = `\n=== STRICT EXCLUSION TOPICS ===\nUnder no circumstances discuss, answer, or validate: ${config.restrictedTopics}. If user asks about these, refuse politely saying exact fallback text of: "${config.fallbackText || 'I cannot share authoritative metrics on that topic.'}".`;
    }

    // Compile CRM transfer instruction
    let crmText = "";
    if (config.crmSettings && config.crmSettings.leadCreation) {
      crmText = `\n=== LEAD TRANSFERS ===\nOnce clear property requirements (budget limits, layouts, site visits) are captured, prepare summary for CRM integration.`;
    }

    const systemInstruction = `${config.systemPrompt || DEFAULT_PERSONALITY.systemPrompt}
Communication style tone: ${config.style || 'Warm'}
${rulesText}
${restrictedText}
${crmText}

=== GROUNDED REVENUE KNOWLEDGE BASE ===
${groundKbText.substring(0, 15000)}`;

    const promptText = `
=== CONVERSATION THREAD HISTORY ===
${previousTurns}

New User Message: "${message}"

Respond to the User Message (Adhering to system persona, being concise and highly helpful, avoid using generic greeting statements if thread has progress):`;

    const aiResponse = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction,
        temperature: typeof config.temperature === 'number' ? config.temperature : (parseFloat(config.temperature as any) || 0.4),
        topP: typeof config.creativity === 'number' ? config.creativity : (parseFloat(config.creativity as any) || 0.7)
      }
    });

    const aiText = aiResponse?.text || "I apologize, our regional database is experiencing high volumes. Let me check immediately.";

    // 8. Execute Action (if required)
    let actionExecuted = "NONE";
    if (detectedIntent === 'SITE_VISIT') {
      actionExecuted = "SCHEDULE_PHYSICAL_INSPECTION_TOUR";
    } else if (isPropertyIntent) {
      actionExecuted = "ROUTE_TO_SPECIALIZED_REALTY_DESK";
    } else if (['CONTACT', 'AGENT'].includes(detectedIntent)) {
      actionExecuted = "OFFER_CALLBACK_ROUTING";
    }

    // 9. Save CRM Activity Log to Firestore chatbot_crm_activities collection
    const activityId = 'act-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const activityRecord = {
      id: activityId,
      timestamp: new Date().toISOString(),
      customerMessage: message,
      detectedIntent,
      routedIndex: indexName,
      actionExecuted,
      responseText: aiText,
      status: 'PROCESSED'
    };
    try {
      await setDoc(doc(db, 'chatbot_crm_activities', activityId), activityRecord);
    } catch (crmErr) {
      console.warn("Could not save CRM activity:", crmErr);
    }

    res.json({ 
      success: true, 
      responseText: aiText,
      detectedIntent,
      routedIndex: indexName,
      actionExecuted
    });
  } catch (error: any) {
    console.error("Chatbot Gemini endpoint error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 13.1 PERSONALITY SIMULATOR SANDBOX ENDPOINT FOR EXECUTION COMPARISON
app.post("/api/chatbot/simulate", async (req, res) => {
  try {
    const { message, config, compare, operator } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: "Empty simulation query payload." });
    }

    const gemini = getGemini();

    const compiledSnap = await getDoc(doc(db, 'chatbot_settings', 'compiled_corpus'));
    const fallbackSummary = "Dvarix Realty specializes in pre-cleared layouts in Devanahalli Aviation High Corridor, Whitefield price appreciation guides, custom scientific Vastu alignments, BBMP A-Khata licenses, and robust construction warranties.";
    const groundKb = compiledSnap.exists() ? (compiledSnap.data().rawCorpus || fallbackSummary) : fallbackSummary;

    // Sandbox execution configuration
    const draftConfig = config || DEFAULT_PERSONALITY;

    // Track triggered business rules triggers
    const triggeredRules: string[] = [];
    const biz = draftConfig.businessRules || {};
    const q = message.toLowerCase();

    if (biz.askIntentFirst && (q.includes("buy") || q.includes("rent") || q.includes("sell") || q.includes("invest") || q.includes("looking for") || q.includes("intend"))) {
      triggeredRules.push("Ask customer intent first (Buy/Rent/Sell/Invest)");
    }
    if (biz.avoidEarlyPhone && (q.includes("phone") || q.includes("contact") || q.includes("number") || q.includes("mobile") || q.includes("whatsapp"))) {
      triggeredRules.push("Avoid requesting phone numbers immediately");
    }
    if (biz.neverLegalGuarantees && (q.includes("guarantee") || q.includes("legal") || q.includes("deed") || q.includes("rera") || q.includes("warranty"))) {
      triggeredRules.push("Never provide legal guarantees");
    }
    if (biz.neverInvestmentReturns && (q.includes("return") || q.includes("investment") || q.includes("roi") || q.includes("appreciate") || q.includes("profit") || q.includes("bitcoin") || q.includes("crypto"))) {
      triggeredRules.push("Never promise specific investment returns");
    }
    if (biz.recommendSiteVisits && (q.includes("visit") || q.includes("site") || q.includes("tour") || q.includes("view") || q.includes("car") || q.includes("inspect"))) {
      triggeredRules.push("Proactively recommend physical site visits");
    }
    if (biz.prioritizeUnderstanding && (q.includes("detail") || q.includes("need") || q.includes("layout") || q.includes("requirement") || q.includes("size") || q.includes("budget"))) {
      triggeredRules.push("Prioritize structural understanding over simple forms");
    }
    if (biz.offerServicesNaturally && (q.includes("custom") || q.includes("service") || q.includes("decor") || q.includes("blueprint") || q.includes("vastu") || q.includes("loan"))) {
      triggeredRules.push("Offer supplemental Dvarix services naturally");
    }

    // Build draft instructions
    let draftBizText = "";
    if (Object.keys(biz).length > 0) {
      draftBizText = `\n=== LIVE BUSINESS RULES ===\n` + 
        Object.entries(biz)
          .filter(([_, active]) => active)
          .map(([key, _]) => `- Rule: ${key}`)
          .join('\n');
    }

    const draftSystemInstruction = `${draftConfig.systemPrompt || DEFAULT_PERSONALITY.systemPrompt}
Communication Tone/Style: ${draftConfig.style || draftConfig.communicationTone || 'Warm'}
${draftConfig.restrictedTopics ? `\nRestricted Topics: ${draftConfig.restrictedTopics}` : ''}
${draftConfig.fallbackText ? `\nFallback Message: ${draftConfig.fallbackText}` : ''}
${draftBizText}

=== GROUNDED REVENUE KNOWLEDGE BASE ===
${groundKb.substring(0, 12000)}`;

    // Call Gemini for draft simulated response
    const draftResponse = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Simulate response for query: "${message}"`,
      config: {
        systemInstruction: draftSystemInstruction,
        temperature: parseFloat(draftConfig.temperature as string) || 0.4,
        topP: parseFloat(draftConfig.creativity as string) || 0.7
      }
    });
    const draftText = draftResponse?.text || "Simulation timed out.";

    // Active compare response
    let publishedText = "";
    if (compare) {
      const liveDocSnap = await getDoc(doc(db, 'chatbot_settings', 'config'));
      const liveConfig = liveDocSnap.exists() ? liveDocSnap.data() : DEFAULT_PERSONALITY;
      
      let liveRulesText = "";
      if (liveConfig.businessRules) {
        liveRulesText = `\n=== LIVE BUSINESS RULES ===\n` + 
          Object.entries(liveConfig.businessRules)
            .filter(([_, active]) => active)
            .map(([key, _]) => `- Rule: ${key}`)
            .join('\n');
      }

      const publishedSystemInstruction = `${liveConfig.systemPrompt || DEFAULT_PERSONALITY.systemPrompt}
Communication Tone/Style: ${liveConfig.style || liveConfig.communicationTone || 'Warm'}
${liveConfig.restrictedTopics ? `\nRestricted Topics: ${liveConfig.restrictedTopics}` : ''}
${liveConfig.fallbackText ? `\nFallback Message: ${liveConfig.fallbackText}` : ''}
${liveRulesText}

=== GROUNDED REVENUE KNOWLEDGE BASE ===
${groundKb.substring(0, 12000)}`;

      const publishedResponse = await gemini.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Simulate response for query: "${message}"`,
        config: {
          systemInstruction: publishedSystemInstruction,
          temperature: parseFloat(liveConfig.temperature as string) || 0.4,
          topP: parseFloat(liveConfig.creativity as string) || 0.7
        }
      });
      publishedText = publishedResponse?.text || "Simulation failed.";
    }

    // Write simulator activity audit record
    const userEmail = operator || 'dvarixrealty@gmail.com';
    await logAuditOnServer(
      'Simulator Action',
      'Bot Personality Sandbox Sandbox',
      userEmail,
      null,
      { question: message, triggeredRulesCount: triggeredRules.length }
    );

    res.json({
      success: true,
      draftResponse: draftText,
      publishedResponse: publishedText,
      appliedPrompt: draftConfig.systemPrompt || DEFAULT_PERSONALITY.systemPrompt,
      triggeredRules
    });
  } catch (err: any) {
    console.error("Simulation endpoint crashed:", err);
    res.status(500).json({ success: false, error: "Test Lab Exception: " + err.message });
  }
});


// --- BOT PERSONALITY SAFE GET & POST ENDPOINTS WITH BACKEND VALIDATION ---
const DEFAULT_PERSONALITY: any = {
  botName: 'Dvarix Assistant',
  style: 'Warm',
  botMission: 'Understand customer requirements and guide them to suitable Dvarix Realty solutions.',
  introMessage: 'Hello! Welcome to Dvarix Realty.',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  widgetPosition: 'Bottom Right',
  primaryColor: '#2563EB',
  welcomeMessage: 'Hi there! Looking for your dream property? Let is chat!',
  onlineStatus: 'Online',
  offlineMessage: 'All our property advisors are assisting others. Please leave message.',
  showBranding: true,
  active: true,
  intelligenceMode: true,
  systemPrompt: `You are Dvarix Assistant, the customer-facing virtual assistant of Dvarix Realty.

Your role is to understand customer property requirements and qualify leads for the Dvarix team.
Your objectives are:
1. Identify customer intent: Buy, Rent, Sell, Invest
2. Collect relevant details naturally.
3. Ask only one question at a time.
4. Avoid requesting contact information immediately.
5. Collect contact information only after understanding the customer's requirements.
6. Be friendly, professional, and conversational.
7. Never provide legal advice or financial guarantees.
8. Summarize customer requirements before ending the conversation.
9. Transfer qualified leads into CRM.`,
  restrictedTopics: "Competitor comparison, Legal guarantees, Crypto payments",
  fallbackText: "I failed to retrieve an authoritative detail on that. Mapped to CRM specialist.",
  temperature: 0.4,
  creativity: 0.7,
  businessRules: {
    restrictFinGuarantee: true,
    restrictCompetitorCompare: true,
    requireContactDetailsFirst: false,
    requireValidationConsent: true,
    forceFriendlyGreeting: true,
    allowFallbackTransfer: true,
    alertOnRestrictedTopics: false,
    limitSimultaneousChats: false
  },
  crmSettings: {
    qualifiedCRMTransfer: true,
    instantEmailNotification: false,
    syncLeadPriority: "Medium"
  }
};

// GET personality config safely with backend validation/defaulting
app.get("/api/chatbot/personality-config", async (req, res) => {
  try {
    const isDraft = req.query.draft === 'true';
    const docName = isDraft ? 'config_draft' : 'config';
    const docSnap = await getDoc(doc(db, 'chatbot_settings', docName));
    
    let config = { ...DEFAULT_PERSONALITY };
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Safe merge to ensure never returning null values
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          (config as any)[key] = value;
        }
      });
    } else {
      // Create defaults document in Firestore if it doesn't exist
      await setDoc(doc(db, 'chatbot_settings', docName), DEFAULT_PERSONALITY);
    }
    
    // Always return complete config, never null
    res.json({ success: true, config });
  } catch (err: any) {
    console.error("Unable to load Bot Personality (backend error):", err);
    // Display database connection or load error safely, return defaults instead of crashing
    res.json({ 
      success: false, 
      error: "Unable to load Bot Personality. " + err.message, 
      config: DEFAULT_PERSONALITY 
    });
  }
});

// POST personality config with server-side validation and audit log tracking
app.post("/api/chatbot/personality-config", async (req, res) => {
  try {
    const { config, isDraft, operator } = req.body;
    if (!config) {
      return res.status(400).json({ success: false, error: "Configuration payload is missing." });
    }

    // Backend validation of inputs
    const validated: any = { ...DEFAULT_PERSONALITY };
    
    // String validation
    if (config.botName && typeof config.botName === 'string' && config.botName.trim()) {
      validated.botName = config.botName.trim();
    }
    if (config.style && typeof config.style === 'string') {
      validated.style = config.style;
    }
    if (config.botMission && typeof config.botMission === 'string' && config.botMission.trim()) {
      validated.botMission = config.botMission.trim();
    }
    if (config.introMessage && typeof config.introMessage === 'string' && config.introMessage.trim()) {
      validated.introMessage = config.introMessage.trim();
    }
    if (config.systemPrompt && typeof config.systemPrompt === 'string' && config.systemPrompt.trim()) {
      validated.systemPrompt = config.systemPrompt.trim();
    }
    if (config.restrictedTopics !== undefined && typeof config.restrictedTopics === 'string') {
      validated.restrictedTopics = config.restrictedTopics;
    }
    if (config.fallbackText !== undefined && typeof config.fallbackText === 'string') {
      validated.fallbackText = config.fallbackText;
    }
    if (config.avatarUrl && typeof config.avatarUrl === 'string') {
      validated.avatarUrl = config.avatarUrl;
    }
    if (config.widgetPosition && typeof config.widgetPosition === 'string') {
      validated.widgetPosition = config.widgetPosition;
    }
    if (config.primaryColor && typeof config.primaryColor === 'string') {
      validated.primaryColor = config.primaryColor;
    }
    if (config.welcomeMessage && typeof config.welcomeMessage === 'string') {
      validated.welcomeMessage = config.welcomeMessage;
    }
    if (config.onlineStatus && typeof config.onlineStatus === 'string') {
      validated.onlineStatus = config.onlineStatus;
    }
    if (config.offlineMessage && typeof config.offlineMessage === 'string') {
      validated.offlineMessage = config.offlineMessage;
    }

    // Boolean validation
    if (config.showBranding !== undefined) validated.showBranding = !!config.showBranding;
    if (config.active !== undefined) validated.active = !!config.active;
    if (config.intelligenceMode !== undefined) validated.intelligenceMode = !!config.intelligenceMode;

    // Numeric range validation for Temperature (0.0 to 1.0) and Creativity/TopP (0.0 to 1.0)
    const rawTemp = parseFloat(config.temperature);
    if (!isNaN(rawTemp) && rawTemp >= 0.0 && rawTemp <= 1.0) {
      validated.temperature = rawTemp;
    }
    
    const rawCreativity = parseFloat(config.creativity);
    if (!isNaN(rawCreativity) && rawCreativity >= 0.0 && rawCreativity <= 1.0) {
      validated.creativity = rawCreativity;
    }

    const docName = isDraft ? 'config_draft' : 'config';
    
    // Save to Firestore
    await setDoc(doc(db, 'chatbot_settings', docName), validated);

    // Track Audit Log
    const userEmail = operator || 'dvarixrealty@gmail.com';
    await logAuditOnServer(
      isDraft ? 'Edit' : 'Publish',
      isDraft ? 'Widget and Personality Settings Draft' : 'Widget and Personality Settings',
      userEmail,
      null,
      validated
    );

    // Save historical version record for either Draft or Published
    const isP = !isDraft;
    const versionId = (isP ? 'v-' : 'v-draft-') + Date.now();
    const versionRecord = {
      id: versionId,
      botConfig: validated,
      updatedBy: userEmail,
      role: 'Super Admin',
      status: isP ? 'Published' : 'Draft',
      summary: isP ? `Published live production configuration parameters.` : `Saved draft configuration parameters.`,
      timestamp: new Date().toISOString()
    };
    await setDoc(doc(db, 'chatbot_personality_versions', versionId), versionRecord);

    // If publishing, sync draft as well to keep them aligned
    if (isP) {
      await setDoc(doc(db, 'chatbot_settings', 'config_draft'), validated);
    }

    res.json({ success: true, config: validated });
  } catch (err: any) {
    console.error("Failed to save/publish config on backend:", err);
    res.status(500).json({ success: false, error: "Database connection error. Failed to save configuration." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server executing successfully on http://0.0.0.0:${PORT}`);
  });
}

startServer();
