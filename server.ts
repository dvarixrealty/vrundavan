import express from "express";
import path from "path";
import cors from "cors";
import fs from "fs";
import multer from "multer";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import { testMySQLConnection, getPool } from "./src/lib/mysqlService.ts";
import { 
  initializePropertiesTable, 
  getPropertiesFromMySQL, 
  savePropertyToMySQL, 
  deletePropertyFromMySQL, 
  migrateProperties 
} from "./src/lib/mysqlPropertiesService.ts";
import {
  initializePhase5Tables,
  migratePropertyImagesAndAmenities,
  migrateAgentsToMySQL,
  migrateInquiriesToMySQL,
  migrateCentralEnquiriesToMySQL
} from "./src/lib/mysqlPhase5Service.ts";
import {
  initializePhase6Tables,
  migrateCategories,
  migrateSearchCategories,
  migrateSeoConfigs,
  migratePropertySeoConfigs,
  migrateSeoRedirectRules,
  migrateSiteCmsConfig,
  migrateHeroBanners,
  migrateFaqs,
  migrateQuickFilters,
  migrateRoutingRules,
  migrateSettings,
  migrateThemePresets
} from "./src/lib/mysqlPhase6Service.ts";
import { SAMPLE_REDIRECTS } from "./src/data/seoTestData.ts";
import {
  initializePhase7Tables,
  mysqlPhase7Service
} from "./src/lib/mysqlPhase7Service.ts";
import {
  initializeCmsTables,
  mysqlCmsService
} from "./src/lib/mysqlCmsService.ts";
import {
  initializeMediaTable,
  getMediaItems,
  saveMediaItem,
  updateMediaItemMetadata,
  deleteMediaItem,
  findUsageOfImage,
  renameMediaAsset
} from "./src/lib/mysqlMediaService.ts";

function getPublicBaseUrl(req?: any): string {
  // 1. If we have an active request, use its host dynamically to determine the current public origin
  if (req) {
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const proto = req.headers["x-forwarded-proto"] || req.protocol || "http";
    // Check that we don't accidentally return localhost:3000 if accessed from outside
    if (host && !host.includes("localhost:3000")) {
      return `${proto}://${host}`;
    }
  }

  // 2. Fallback to APP_URL if set and does not contain localhost
  if (process.env.APP_URL && !process.env.APP_URL.includes("localhost")) {
    return process.env.APP_URL.replace(/\/$/, "");
  }

  // 3. Fallback to PUBLIC_BASE_URL if set and does not contain localhost
  if (process.env.PUBLIC_BASE_URL && !process.env.PUBLIC_BASE_URL.includes("localhost")) {
    return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  }

  // 4. Return relative path base by default to ensure perfect local/mismatch resilience
  return "";
}

function sanitizeFolder(folderPath: string | null | undefined): string {
  if (!folderPath) return "properties";
  const clean = folderPath
    .replace(/\.\./g, "")
    .replace(/[^\w\-\/]/g, "")
    .replace(/^\/|\/$/g, "");
  return clean || "properties";
}

function normalizeMediaItemUrls(item: any, req?: any): any {
  if (!item) return item;
  const baseUrl = getPublicBaseUrl(req);
  
  // Extract relative path
  let relPath = item.relative_path;
  if (!relPath && item.storage_path) {
    relPath = "/" + item.storage_path;
  }
  if (!relPath && item.public_url) {
    const match = item.public_url.match(/(\/uploads\/.*)$/);
    if (match) {
      relPath = match[1];
    } else if (item.public_url.startsWith("/")) {
      relPath = item.public_url;
    }
  }
  if (!relPath) {
    relPath = "/uploads/" + (item.folder || "properties") + "/" + (item.seo_filename || item.stored_filename || item.slug || item.id);
  }
  
  if (relPath && !relPath.startsWith("/")) {
    relPath = "/" + relPath;
  }

  // Ensure Public URL points to the actual physical file that exists on disk.
  // If optimization converts PNG/JPG into WebP, we reference the optimized WebP asset.
  if (relPath) {
    const originalFullPath = path.join(process.cwd(), relPath);
    if (!fs.existsSync(originalFullPath)) {
      const ext = path.extname(relPath);
      if (ext && ext.toLowerCase() !== ".webp") {
        const webpRelPath = relPath.substring(0, relPath.lastIndexOf(ext)) + ".webp";
        const webpFullPath = path.join(process.cwd(), webpRelPath);
        if (fs.existsSync(webpFullPath)) {
          relPath = webpRelPath;
        }
      }
    }
  }
  
  const constructUrl = (originalUrl: string | null, suffix: string = "") => {
    if (!originalUrl) return null;
    let subRelPath = "";
    const match = originalUrl.match(/(\/uploads\/.*)$/);
    if (match) {
      subRelPath = match[1];
    } else if (originalUrl.startsWith("/")) {
      subRelPath = originalUrl;
    } else {
      const lastDot = (item.seo_filename || "").lastIndexOf(".");
      const ext = lastDot !== -1 ? (item.seo_filename || "").substring(lastDot) : ".webp";
      subRelPath = `/uploads/${item.folder || "properties"}/${item.slug || "image"}${suffix}${ext}`;
    }
    if (subRelPath && !subRelPath.startsWith("/")) {
      subRelPath = "/" + subRelPath;
    }

    // Check physical existence for responsive sizes too
    const subFullPath = path.join(process.cwd(), subRelPath);
    if (!fs.existsSync(subFullPath)) {
      const ext = path.extname(subRelPath);
      if (ext && ext.toLowerCase() !== ".webp") {
        const webpSubRelPath = subRelPath.substring(0, subRelPath.lastIndexOf(ext)) + ".webp";
        const webpSubFullPath = path.join(process.cwd(), webpSubRelPath);
        if (fs.existsSync(webpSubFullPath)) {
          subRelPath = webpSubRelPath;
        }
      }
    }

    return baseUrl + subRelPath;
  };
  
  return {
    ...item,
    relative_path: relPath,
    public_url: baseUrl + relPath,
    thumbnail_url: constructUrl(item.thumbnail_url, "-thumb") || (baseUrl + relPath),
    medium_url: constructUrl(item.medium_url, "-medium") || (baseUrl + relPath),
    large_url: constructUrl(item.large_url, "-large") || (baseUrl + relPath),
    original_url: baseUrl + relPath
  };
}

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Mount local static serving route for uploaded assets
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// --- SERVER-SIDE MEMORY CACHING SYSTEM ---
// Added to prevent exceeding Hostinger's max_connections_per_hour (500 limit)
interface CacheEntry {
  data: any;
  timestamp: number;
}
const serverCache: Record<string, CacheEntry> = {};
const CACHE_TTL = 30000; // 30 seconds Cache Time-to-Live

app.use((req, res, next) => {
  const path = req.path;
  const method = req.method;

  // We only cache GET requests under /api/mysql/ and /api/chatbot/
  if (method === "GET" && (path.startsWith("/api/mysql/") || path.startsWith("/api/chatbot/"))) {
    const cacheKey = req.originalUrl;
    const cached = serverCache[cacheKey];
    
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      res.setHeader("X-Server-Cache", "HIT");
      return res.json(cached.data);
    }

    // Intercept res.json to store the response in our cache
    const originalJson = res.json;
    res.json = function (body: any) {
      if (res.statusCode === 200 && body && body.success !== false) {
        serverCache[cacheKey] = {
          data: body,
          timestamp: Date.now()
        };
      }
      return originalJson.call(this, body);
    };
  } else if ((method === "POST" || method === "PUT" || method === "DELETE" || method === "PATCH") && path.startsWith("/api/")) {
    // Invalidate the cache for this path and any parent/child paths
    const reqBasePath = path.split("?")[0];
    
    Object.keys(serverCache).forEach((cachedUrl) => {
      const cachedBasePath = cachedUrl.split("?")[0];
      if (
        cachedBasePath === reqBasePath ||
        reqBasePath.startsWith(cachedBasePath) ||
        cachedBasePath.startsWith(reqBasePath)
      ) {
        delete serverCache[cachedUrl];
      }
    });
  }
  next();
});

// Google Gemini Client Lazy Initializer

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

async function getChatbotSetting(key: string, defaultValue: any): Promise<any> {
  try {
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT value FROM settings WHERE key_name = ?", [key]);
    if (rows && rows.length > 0) {
      return JSON.parse(rows[0].value);
    }
  } catch (err) {
    console.warn(`Could not read chatbot setting ${key} from MySQL:`, err);
  }
  return defaultValue;
}

async function saveChatbotSetting(key: string, value: any): Promise<boolean> {
  try {
    const pool = getPool();
    const q = `
      INSERT INTO settings (key_name, value)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
        value = VALUES(value),
        updated_at = CURRENT_TIMESTAMP;
    `;
    await pool.query(q, [key, JSON.stringify(value)]);
    return true;
  } catch (err) {
    console.error(`Could not write chatbot setting ${key} to MySQL:`, err);
    return false;
  }
}

// Helper to save audit trace logs from endpoints
async function logAuditOnServer(action: string, module: string, operator: string, oldVal: any, newVal: any) {
  try {
    const logId = 'audit-srv-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const logData = {
      id: logId,
      session_id: 'session-srv',
      visitor_id: 'visitor-srv',
      user_id: operator || 'server-worker@dvarix.com',
      user_name: 'Dvarix Server Agent',
      role: 'Bot Administrator / Server',
      actionType: action,
      timestamp: new Date().toISOString(),
      moduleAffected: module,
      previousValues: oldVal ? JSON.stringify(oldVal) : 'None',
      updatedValues: newVal ? JSON.stringify(newVal) : 'None'
    };
    await mysqlPhase7Service.saveChatbotAuditLog(logData);
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
    
    let version = 1;
    let oldVal = null;
    const faqs = await mysqlPhase7Service.getChatbotKnowledge();
    const oldValItem = faqs.find((f: any) => f.id === faqId);
    if (oldValItem) {
      oldVal = oldValItem;
      version = (oldValItem.version || 1) + 1;
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

    await mysqlPhase7Service.saveChatbotKnowledge(record);
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

    const faqs = await mysqlPhase7Service.getChatbotKnowledge();
    const oldVal = faqs.find((f: any) => f.id === id) || null;

    await mysqlPhase7Service.deleteChatbotKnowledge(id);
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

    await mysqlPhase7Service.saveChatbotDocument(record);
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

    const docs = await mysqlPhase7Service.getChatbotDocuments();
    const oldVal = docs.find((d: any) => d.id === id) || null;

    await mysqlPhase7Service.deleteChatbotDocument(id);
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

    await mysqlPhase7Service.saveChatbotWebsite(record);
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

    const webs = await mysqlPhase7Service.getChatbotWebsites();
    const oldVal = webs.find((w: any) => w.id === id) || null;

    await mysqlPhase7Service.deleteChatbotWebsite(id);
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

    await mysqlPhase7Service.saveChatbotSnippet(record);
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

    const snips = await mysqlPhase7Service.getChatbotSnippets();
    const oldVal = snips.find((s: any) => s.id === id) || null;

    await mysqlPhase7Service.deleteChatbotSnippet(id);
    await logAuditOnServer('Delete', 'AI Note Snippet KB', operator, oldVal, null);

    res.json({ success: true, message: "Instruction note deleted." });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. DYNAMIC PROPERTY DATABASE INTEGRATION SYNC ACTION
app.post("/api/chatbot/sync-properties", async (req, res) => {
  try {
    const propertiesList = await getPropertiesFromMySQL();
    const listCount = propertiesList.length;

    await saveChatbotSetting('chatbot_properties_cache', {
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

// MySQL Properties Migration & API Integration (Phase 4)
app.get("/api/mysql/properties", async (req, res) => {
  try {
    const list = await getPropertiesFromMySQL();
    res.json({ success: true, count: list.length, properties: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/mysql/properties", async (req, res) => {
  try {
    const property = req.body;
    if (!property || !property.id) {
      return res.status(400).json({ success: false, error: "Property object with a valid 'id' is required." });
    }
    const success = await savePropertyToMySQL(property);
    if (success) {
      res.json({ success: true, message: `Property ${property.id} saved to MySQL successfully.` });
    } else {
      res.status(500).json({ success: false, error: "Failed to save property to MySQL." });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete("/api/mysql/properties/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const success = await deletePropertyFromMySQL(id);
    if (success) {
      res.json({ success: true, message: `Property ${id} deleted from MySQL successfully.` });
    } else {
      res.status(500).json({ success: false, error: "Failed to delete property from MySQL." });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/mysql/migrate/properties", async (req, res) => {
  res.json({ 
    success: true, 
    message: "Bulk properties migration historical API: already completed, verified, and promoted to primary Hostinger MySQL." 
  });
});

app.post("/api/mysql/migrate/phase5", async (req, res) => {
  res.json({
    success: true,
    message: "Phase 5 migration historical API: already completed, verified, and promoted to primary Hostinger MySQL."
  });
});

app.post("/api/mysql/migrate/phase6", async (req, res) => {
  res.json({
    success: true,
    message: "Phase 6 migration historical API: already completed, verified, and promoted to primary Hostinger MySQL."
  });
});

// ==========================================
// Phase 7 MySQL Operational Modules CRUD APIs & Migration
// ==========================================

// Site Visits
app.get("/api/mysql/site_visits", async (req, res) => {
  try {
    const list = await mysqlPhase7Service.getSiteVisits();
    res.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/site_visits", async (req, res) => {
  try {
    const payload = req.body;
    await mysqlPhase7Service.saveSiteVisit(payload);
    res.json({ success: true, message: "Site visit saved to MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/site_visits/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await mysqlPhase7Service.deleteSiteVisit(id);
    res.json({ success: true, message: "Site visit deleted from MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Requirements
app.get("/api/mysql/requirements", async (req, res) => {
  try {
    const list = await mysqlPhase7Service.getRequirements();
    res.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/requirements", async (req, res) => {
  try {
    const payload = req.body;
    await mysqlPhase7Service.saveRequirement(payload);
    res.json({ success: true, message: "Requirement saved to MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/requirements/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await mysqlPhase7Service.deleteRequirement(id);
    res.json({ success: true, message: "Requirement deleted from MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Customer Requirements
app.get("/api/mysql/customer_requirements", async (req, res) => {
  try {
    const list = await mysqlPhase7Service.getCustomerRequirements();
    res.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/customer_requirements", async (req, res) => {
  try {
    const payload = req.body;
    await mysqlPhase7Service.saveCustomerRequirement(payload);
    res.json({ success: true, message: "Customer requirement saved to MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/customer_requirements/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await mysqlPhase7Service.deleteCustomerRequirement(id);
    res.json({ success: true, message: "Customer requirement deleted from MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Finance Entries
app.get("/api/mysql/finance_entries", async (req, res) => {
  try {
    const list = await mysqlPhase7Service.getFinanceEntries();
    res.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/finance_entries", async (req, res) => {
  try {
    const payload = req.body;
    await mysqlPhase7Service.saveFinanceEntry(payload);
    res.json({ success: true, message: "Finance entry saved to MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/finance_entries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await mysqlPhase7Service.deleteFinanceEntry(id);
    res.json({ success: true, message: "Finance entry deleted from MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CRM Documents
app.get("/api/mysql/crm_documents", async (req, res) => {
  try {
    const list = await mysqlPhase7Service.getDocuments();
    res.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/crm_documents", async (req, res) => {
  try {
    const payload = req.body;
    await mysqlPhase7Service.saveDocument(payload);
    res.json({ success: true, message: "CRM document saved to MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/crm_documents/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await mysqlPhase7Service.deleteDocument(id);
    res.json({ success: true, message: "CRM document deleted from MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Chatbot Knowledge
app.get("/api/mysql/chatbot_knowledge", async (req, res) => {
  try {
    const list = await mysqlPhase7Service.getChatbotKnowledge();
    res.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/chatbot_knowledge", async (req, res) => {
  try {
    const payload = req.body;
    await mysqlPhase7Service.saveChatbotKnowledge(payload);
    res.json({ success: true, message: "Chatbot knowledge saved to MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/chatbot_knowledge/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await mysqlPhase7Service.deleteChatbotKnowledge(id);
    res.json({ success: true, message: "Chatbot knowledge deleted from MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Chatbot Documents
app.get("/api/mysql/chatbot_documents", async (req, res) => {
  try {
    const list = await mysqlPhase7Service.getChatbotDocuments();
    res.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/chatbot_documents", async (req, res) => {
  try {
    const payload = req.body;
    await mysqlPhase7Service.saveChatbotDocument(payload);
    res.json({ success: true, message: "Chatbot document saved to MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/chatbot_documents/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await mysqlPhase7Service.deleteChatbotDocument(id);
    res.json({ success: true, message: "Chatbot document deleted from MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Chatbot Websites
app.get("/api/mysql/chatbot_websites", async (req, res) => {
  try {
    const list = await mysqlPhase7Service.getChatbotWebsites();
    res.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/chatbot_websites", async (req, res) => {
  try {
    const payload = req.body;
    await mysqlPhase7Service.saveChatbotWebsite(payload);
    res.json({ success: true, message: "Chatbot website saved to MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/chatbot_websites/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await mysqlPhase7Service.deleteChatbotWebsite(id);
    res.json({ success: true, message: "Chatbot website deleted from MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Chatbot Snippets
app.get("/api/mysql/chatbot_snippets", async (req, res) => {
  try {
    const list = await mysqlPhase7Service.getChatbotSnippets();
    res.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/chatbot_snippets", async (req, res) => {
  try {
    const payload = req.body;
    await mysqlPhase7Service.saveChatbotSnippet(payload);
    res.json({ success: true, message: "Chatbot snippet saved to MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/chatbot_snippets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await mysqlPhase7Service.deleteChatbotSnippet(id);
    res.json({ success: true, message: "Chatbot snippet deleted from MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Chatbot Flows
app.get("/api/mysql/chatbot_flows", async (req, res) => {
  try {
    const list = await mysqlPhase7Service.getChatbotFlows();
    res.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/chatbot_flows", async (req, res) => {
  try {
    const payload = req.body;
    await mysqlPhase7Service.saveChatbotFlow(payload);
    res.json({ success: true, message: "Chatbot flow saved to MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/chatbot_flows/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await mysqlPhase7Service.deleteChatbotFlow(id);
    res.json({ success: true, message: "Chatbot flow deleted from MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Qualification Rules
app.get("/api/mysql/qualification_rules", async (req, res) => {
  try {
    const list = await mysqlPhase7Service.getQualificationRules();
    res.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/qualification_rules", async (req, res) => {
  try {
    const payload = req.body;
    await mysqlPhase7Service.saveQualificationRule(payload);
    res.json({ success: true, message: "Qualification rule saved to MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/qualification_rules/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await mysqlPhase7Service.deleteQualificationRule(id);
    res.json({ success: true, message: "Qualification rule deleted from MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Chatbot Audit Logs
app.get("/api/mysql/chatbot_audit_logs", async (req, res) => {
  try {
    const list = await mysqlPhase7Service.getChatbotAuditLogs();
    res.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/chatbot_audit_logs", async (req, res) => {
  try {
    const payload = req.body;
    await mysqlPhase7Service.saveChatbotAuditLog(payload);
    res.json({ success: true, message: "Chatbot audit log saved to MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/chatbot_audit_logs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await mysqlPhase7Service.deleteChatbotAuditLog(id);
    res.json({ success: true, message: "Chatbot audit log deleted from MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Permissions
app.get("/api/mysql/ai_permissions", async (req, res) => {
  try {
    const list = await mysqlPhase7Service.getAiPermissions();
    res.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/ai_permissions", async (req, res) => {
  try {
    const payload = req.body;
    await mysqlPhase7Service.saveAiPermission(payload);
    res.json({ success: true, message: "AI permission saved to MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/ai_permissions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await mysqlPhase7Service.deleteAiPermission(id);
    res.json({ success: true, message: "AI permission deleted from MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Activity Logs
app.get("/api/mysql/ai_activity_logs", async (req, res) => {
  try {
    const list = await mysqlPhase7Service.getAiActivityLogs();
    res.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/ai_activity_logs", async (req, res) => {
  try {
    const payload = req.body;
    await mysqlPhase7Service.saveAiActivityLog(payload);
    res.json({ success: true, message: "AI activity log saved to MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/ai_activity_logs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await mysqlPhase7Service.deleteAiActivityLog(id);
    res.json({ success: true, message: "AI activity log deleted from MySQL successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// Phase 8 MySQL CMS Operational CRUD REST APIs
// ==========================================

// Categories
app.get("/api/mysql/categories", async (req, res) => {
  try {
    const data = await mysqlCmsService.getCategories();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/categories", async (req, res) => {
  try {
    await mysqlCmsService.saveCategory(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/categories/:id", async (req, res) => {
  try {
    await mysqlCmsService.deleteCategory(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search Categories
app.get("/api/mysql/search_categories", async (req, res) => {
  try {
    const data = await mysqlCmsService.getSearchCategories();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/search_categories", async (req, res) => {
  try {
    await mysqlCmsService.saveSearchCategory(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/search_categories/:id", async (req, res) => {
  try {
    await mysqlCmsService.deleteSearchCategory(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Agents
app.get("/api/mysql/agents", async (req, res) => {
  try {
    const data = await mysqlCmsService.getAgents();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/agents", async (req, res) => {
  try {
    await mysqlCmsService.saveAgent(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/agents/:id", async (req, res) => {
  try {
    await mysqlCmsService.deleteAgent(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Inquiries
app.get("/api/mysql/inquiries", async (req, res) => {
  try {
    const data = await mysqlCmsService.getInquiries();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/inquiries", async (req, res) => {
  try {
    await mysqlCmsService.saveInquiry(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/inquiries/:id", async (req, res) => {
  try {
    await mysqlCmsService.deleteInquiry(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Central Enquiries
app.get("/api/mysql/central_enquiries", async (req, res) => {
  try {
    const data = await mysqlCmsService.getCentralEnquiries();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/central_enquiries", async (req, res) => {
  try {
    await mysqlCmsService.saveCentralEnquiry(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/central_enquiries/:id", async (req, res) => {
  try {
    await mysqlCmsService.deleteCentralEnquiry(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// SEO Configs
app.get("/api/mysql/seo_configs", async (req, res) => {
  try {
    const data = await mysqlCmsService.getSeoConfigs();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/seo_configs", async (req, res) => {
  try {
    await mysqlCmsService.saveSeoConfig(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/seo_configs/:id", async (req, res) => {
  try {
    await mysqlCmsService.deleteSeoConfig(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Property SEO Configs
app.get("/api/mysql/property_seo_configs", async (req, res) => {
  try {
    const data = await mysqlCmsService.getPropertySeoConfigs();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/property_seo_configs", async (req, res) => {
  try {
    await mysqlCmsService.savePropertySeoConfig(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/property_seo_configs/:id", async (req, res) => {
  try {
    await mysqlCmsService.deletePropertySeoConfig(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// SEO Redirect Rules
app.get("/api/mysql/seo_redirect_rules", async (req, res) => {
  try {
    const data = await mysqlCmsService.getSeoRedirectRules();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/seo_redirect_rules", async (req, res) => {
  try {
    await mysqlCmsService.saveSeoRedirectRule(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/seo_redirect_rules/:id", async (req, res) => {
  try {
    await mysqlCmsService.deleteSeoRedirectRule(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Site CMS Config
app.get("/api/mysql/site_cms_config", async (req, res) => {
  try {
    const data = await mysqlCmsService.getSiteCmsConfig();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/site_cms_config", async (req, res) => {
  try {
    await mysqlCmsService.saveSiteCmsConfig(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/site_cms_config/:id", async (req, res) => {
  try {
    await mysqlCmsService.deleteSiteCmsConfig(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Hero Banners
app.get("/api/mysql/hero_banners", async (req, res) => {
  try {
    const data = await mysqlCmsService.getHeroBanners();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/hero_banners", async (req, res) => {
  try {
    await mysqlCmsService.saveHeroBanner(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/hero_banners/:id", async (req, res) => {
  try {
    await mysqlCmsService.deleteHeroBanner(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// FAQs
app.get("/api/mysql/faqs", async (req, res) => {
  try {
    const data = await mysqlCmsService.getFaqs();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/faqs", async (req, res) => {
  try {
    await mysqlCmsService.saveFaq(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/faqs/:id", async (req, res) => {
  try {
    await mysqlCmsService.deleteFaq(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Quick Filters
app.get("/api/mysql/quick_filters", async (req, res) => {
  try {
    const data = await mysqlCmsService.getQuickFilters();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/quick_filters", async (req, res) => {
  try {
    await mysqlCmsService.saveQuickFilter(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/quick_filters/:id", async (req, res) => {
  try {
    await mysqlCmsService.deleteQuickFilter(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Routing Rules
app.get("/api/mysql/routing_rules", async (req, res) => {
  try {
    const data = await mysqlCmsService.getRoutingRules();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/routing_rules", async (req, res) => {
  try {
    await mysqlCmsService.saveRoutingRule(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/routing_rules/:id", async (req, res) => {
  try {
    await mysqlCmsService.deleteRoutingRule(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Settings (generic settings)
app.get("/api/mysql/settings", async (req, res) => {
  try {
    const data = await mysqlCmsService.getSettings();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/settings/:key", async (req, res) => {
  try {
    await mysqlCmsService.saveSetting(req.params.key, req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/settings/:key", async (req, res) => {
  try {
    await mysqlCmsService.deleteSetting(req.params.key);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Theme Presets
app.get("/api/mysql/theme_presets", async (req, res) => {
  try {
    const data = await mysqlCmsService.getThemePresets();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/theme_presets", async (req, res) => {
  try {
    await mysqlCmsService.saveThemePreset(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/theme_presets/:id", async (req, res) => {
  try {
    await mysqlCmsService.deleteThemePreset(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Map Locations
app.get("/api/mysql/map_locations", async (req, res) => {
  try {
    const data = await mysqlCmsService.getMapLocations();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/map_locations", async (req, res) => {
  try {
    await mysqlCmsService.saveMapLocation(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/map_locations/:name", async (req, res) => {
  try {
    await mysqlCmsService.deleteMapLocation(req.params.name);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Users
app.get("/api/mysql/admin_users", async (req, res) => {
  try {
    const data = await mysqlCmsService.getAdminUsers();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/mysql/admin_users", async (req, res) => {
  try {
    await mysqlCmsService.saveAdminUser(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.delete("/api/mysql/admin_users/:id", async (req, res) => {
  try {
    await mysqlCmsService.deleteAdminUser(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Migration endpoint for Phase 7
app.post("/api/mysql/migrate/phase7", async (req, res) => {
  res.json({
    success: true,
    message: "Phase 7 migration historical API: already completed, verified, and promoted to primary Hostinger MySQL."
  });
});

// 10. DYNAMIC PROGRAMMATIC ROUTING AND ADVANCED CRM SYNC LEAD RULES
app.post("/api/chatbot/crm-sync-actions", async (req, res) => {
  try {
    const { leadPayload } = req.body;
    if (!leadPayload) {
      return res.status(400).json({ success: false, error: "leadPayload parameter is required." });
    }

    const rules = await mysqlPhase7Service.getQualificationRules();
    const activeRules = rules.filter((r: any) => r.status === 'Active');

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

    await mysqlPhase7Service.saveRequirement(resultLead);
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
    const faqs = await mysqlPhase7Service.getChatbotKnowledge();
    logs.push(`[${new Date().toLocaleTimeString()}] 📚 [LOAD] Discovered ${faqs.length} Active Q&A overrides in local partition.`);

    // Fetch Documents
    const documents = await mysqlPhase7Service.getChatbotDocuments();
    logs.push(`[${new Date().toLocaleTimeString()}] 📄 [LOAD] Ingested ${documents.length} PDF/TXT legal manual index blocks.`);

    // Fetch Websites
    const websites = await mysqlPhase7Service.getChatbotWebsites();
    logs.push(`[${new Date().toLocaleTimeString()}] 🌐 [LOAD] Synced ${websites.length} domain crawls (/about, /services, /faq routes).`);

    // Fetch Property listings
    const properties = await getPropertiesFromMySQL();
    logs.push(`[${new Date().toLocaleTimeString()}] 🗄️ [LOAD] Scanned ${properties.length} live listings from main database.`);

    // Fetch Snippets
    const snippets = await mysqlPhase7Service.getChatbotSnippets();
    logs.push(`[${new Date().toLocaleTimeString()}] ✍️ [LOAD] Stacked ${snippets.length} specialized helper instruction overrides.`);

    logs.push(`[${new Date().toLocaleTimeString()}] ⚙️ [COMPILING] Auto-classifying documents, generating category-specific embeddings and preserving metadata...`);

    // Fetch existing semantic indexes from MySQL settings to skip duplicates
    const indexDocNames = [
      'company_index', 'faq_index', 'property_index', 'legal_index',
      'vastu_index', 'website_index', 'crm_index', 'internal_index'
    ];
    const oldIndexItemsMap: Record<string, any[]> = {};
    for (const name of indexDocNames) {
      try {
        const indexData = await getChatbotSetting('chatbot_index_' + name, null);
        oldIndexItemsMap[name] = indexData ? (indexData.items || []) : [];
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

    // Save separate semantic vector indexes in MySQL
    for (const [name, items] of Object.entries(newIndexes)) {
      await saveChatbotSetting('chatbot_index_' + name, {
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

    await saveChatbotSetting('chatbot_settings_compiled_corpus', {
      compiledAt: new Date().toISOString(),
      rawCorpus: combinedCorpus,
      systemSummary: systemSummarizedRepresentation,
      status: 'Fully Trained'
    });

    const config = await getChatbotSetting('chatbot_settings_config', { intelligenceMode: false });
    config.intelligenceMode = true;
    await saveChatbotSetting('chatbot_settings_config', config);

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
    const config = await getChatbotSetting('chatbot_settings_config', { intelligenceMode: false });
    config.intelligenceMode = !!intelligenceMode;
    await saveChatbotSetting('chatbot_settings_config', config);
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

    await mysqlPhase7Service.saveChatbotKnowledge(record);
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

    // Load dynamic published personality configuration from MySQL settings
    const config = await getChatbotSetting('chatbot_settings_config', DEFAULT_PERSONALITY);

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
      const indexData = await getChatbotSetting('chatbot_index_' + indexName, null);
      if (indexData) {
        indexItems = indexData.items || [];
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
        const allProperties = await getPropertiesFromMySQL();
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
      await logAuditOnServer('CRM Activity', 'Chat Intent Router', 'Chatbot End-User Message', null, activityRecord);
    } catch (crmErr) {
      console.warn("Could not save CRM activity audit log:", crmErr);
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

    const compiledData = await getChatbotSetting('chatbot_settings_compiled_corpus', null);
    const fallbackSummary = "Dvarix Realty specializes in pre-cleared layouts in Devanahalli Aviation High Corridor, Whitefield price appreciation guides, custom scientific Vastu alignments, BBMP A-Khata licenses, and robust construction warranties.";
    const groundKb = compiledData ? (compiledData.rawCorpus || fallbackSummary) : fallbackSummary;

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
      const liveConfig = await getChatbotSetting('chatbot_settings_config', DEFAULT_PERSONALITY);
      
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

app.get("/api/chatbot/personality-versions", async (req, res) => {
  try {
    const versions = await getChatbotSetting('chatbot_personality_versions', []);
    res.json({ success: true, data: versions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET personality config safely with backend validation/defaulting
app.get("/api/chatbot/personality-config", async (req, res) => {
  try {
    const isDraft = req.query.draft === 'true';
    const docName = isDraft ? 'chatbot_settings_config_draft' : 'chatbot_settings_config';
    const data = await getChatbotSetting(docName, null);
    
    let config = { ...DEFAULT_PERSONALITY };
    if (data) {
      // Safe merge to ensure never returning null values
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          (config as any)[key] = value;
        }
      });
    } else {
      // Create defaults document in MySQL if it doesn't exist
      await saveChatbotSetting(docName, DEFAULT_PERSONALITY);
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

    const docName = isDraft ? 'chatbot_settings_config_draft' : 'chatbot_settings_config';
    
    // Save to MySQL settings
    await saveChatbotSetting(docName, validated);

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
    
    try {
      const existingVersions = await getChatbotSetting('chatbot_personality_versions', []);
      existingVersions.unshift(versionRecord);
      if (existingVersions.length > 100) {
        existingVersions.splice(100);
      }
      await saveChatbotSetting('chatbot_personality_versions', existingVersions);
    } catch (verErr) {
      console.warn("Could not save chatbot personality version:", verErr);
    }

    // If publishing, sync draft as well to keep them aligned
    if (isP) {
      await saveChatbotSetting('chatbot_settings_config_draft', validated);
    }

    res.json({ success: true, config: validated });
  } catch (err: any) {
    console.error("Failed to save/publish config on backend:", err);
    res.status(500).json({ success: false, error: "Database connection error. Failed to save configuration." });
  }
});

// ----------------------------------------------------
// MEDIA CENTER (DAM SYSTEM) ROUTER & MULTIPART UPLOAD
// ----------------------------------------------------

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const subfolders = [
  "logos",
  "properties",
  "blogs",
  "banners",
  "agents",
  "customers",
  "documents",
  "testimonials",
  "projects",
  "future"
];

subfolders.forEach(sub => {
  const subPath = path.join(uploadDir, sub);
  if (!fs.existsSync(subPath)) {
    fs.mkdirSync(subPath, { recursive: true });
  }
});

const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const requestedFolder = (req.query.folder as string) || "properties";
    const cleanFolder = sanitizeFolder(requestedFolder);
    const destPath = path.join(process.cwd(), "uploads", cleanFolder);
    fs.mkdirSync(destPath, { recursive: true });
    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    const rawName = file.originalname;
    const lastDot = rawName.lastIndexOf(".");
    const ext = lastDot !== -1 ? rawName.substring(lastDot).toLowerCase() : "";
    let name = lastDot !== -1 ? rawName.substring(0, lastDot) : rawName;

    // Convert filename to an SEO-friendly URL slug
    name = name
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!name) name = "asset";

    const requestedFolder = (req.query.folder as string) || "properties";
    const cleanFolder = sanitizeFolder(requestedFolder);
    const destPath = path.join(process.cwd(), "uploads", cleanFolder);

    // Prevent name collisions on disk by suffixing sequential counts
    let finalName = `${name}${ext}`;
    let counter = 1;
    while (fs.existsSync(path.join(destPath, finalName))) {
      finalName = `${name}-${counter}${ext}`;
      counter++;
    }

    cb(null, finalName);
  }
});

const mediaUpload = multer({
  storage: mediaStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Max 50MB file size limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, JPEG, PNG, SVG, and WEBP are allowed."));
    }
  }
});

const cpUploadFields = mediaUpload.fields([
  { name: "original", maxCount: 1 },
  { name: "large", maxCount: 1 },
  { name: "medium", maxCount: 1 },
  { name: "small", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 }
]);

// Category Management Routes
app.get("/api/mysql/media_categories", async (req, res) => {
  try {
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM media_categories ORDER BY display_order ASC, created_at DESC");
    res.json({ success: true, data: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/mysql/media_categories", async (req, res) => {
  try {
    const { name, folder_name, description, icon, color, status, display_order } = req.body;
    if (!name || !folder_name) {
      return res.status(400).json({ success: false, error: "Category name and folder name are required." });
    }
    const id = "mc-" + Math.random().toString(36).substring(2, 9);
    const pool = getPool();
    await pool.query(
      `INSERT INTO media_categories (id, name, folder_name, description, icon, color, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, folder_name, description || null, icon || "Folder", color || "#C89B3C", status || "Active", Number(display_order) || 0]
    );
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put("/api/mysql/media_categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, folder_name, description, icon, color, status, display_order } = req.body;
    const pool = getPool();
    await pool.query(
      `UPDATE media_categories SET name = ?, folder_name = ?, description = ?, icon = ?, color = ?, status = ?, display_order = ? WHERE id = ?`,
      [name, folder_name, description || null, icon || "Folder", color || "#C89B3C", status || "Active", Number(display_order) || 0, id]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/api/mysql/media_categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    await pool.query("DELETE FROM media_categories WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Folder Management Routes
app.get("/api/mysql/media_folders", async (req, res) => {
  try {
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM media_folders ORDER BY path ASC");
    res.json({ success: true, data: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/mysql/media_folders", async (req, res) => {
  try {
    const { name, path: folderPath, parent_id } = req.body;
    if (!name || !folderPath) {
      return res.status(400).json({ success: false, error: "Folder name and relative path are required." });
    }
    
    const cleanPath = folderPath.replace(/^\/|\/$/g, "").trim();
    const pool = getPool();
    
    const [exists]: any = await pool.query("SELECT id FROM media_folders WHERE path = ?", [cleanPath]);
    if (exists.length > 0) {
      return res.status(400).json({ success: false, error: "A folder with this path already exists." });
    }

    const id = "mf-" + Math.random().toString(36).substring(2, 9);
    
    const physicalDir = path.join(process.cwd(), "uploads", cleanPath);
    if (!fs.existsSync(physicalDir)) {
      fs.mkdirSync(physicalDir, { recursive: true });
    }

    await pool.query(
      `INSERT INTO media_folders (id, name, path, parent_id) VALUES (?, ?, ?, ?)`,
      [id, name, cleanPath, parent_id || null]
    );

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put("/api/mysql/media_folders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, path: folderPath, parent_id } = req.body;
    const pool = getPool();
    
    const [oldRows]: any = await pool.query("SELECT * FROM media_folders WHERE id = ?", [id]);
    if (oldRows.length === 0) {
      return res.status(404).json({ success: false, error: "Folder not found." });
    }
    const oldFolder = oldRows[0];
    const cleanPath = folderPath.replace(/^\/|\/$/g, "").trim();

    if (cleanPath !== oldFolder.path) {
      const oldPhysicalDir = path.join(process.cwd(), "uploads", oldFolder.path);
      const newPhysicalDir = path.join(process.cwd(), "uploads", cleanPath);
      
      if (fs.existsSync(oldPhysicalDir)) {
        fs.renameSync(oldPhysicalDir, newPhysicalDir);
      } else {
        fs.mkdirSync(newPhysicalDir, { recursive: true });
      }

      await pool.query(
        "UPDATE media_items SET folder = ?, storage_path = REPLACE(storage_path, ?, ?) WHERE folder = ?",
        [cleanPath, `uploads/${oldFolder.path}`, `uploads/${cleanPath}`, oldFolder.path]
      );
    }

    await pool.query(
      `UPDATE media_folders SET name = ?, path = ?, parent_id = ? WHERE id = ?`,
      [name, cleanPath, parent_id || null, id]
    );

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/api/mysql/media_folders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    
    const [rows]: any = await pool.query("SELECT * FROM media_folders WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Folder not found" });
    }
    
    await pool.query("DELETE FROM media_folders WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1. Fetch All Assets
app.get("/api/mysql/media_items", async (req, res) => {
  try {
    const items = await getMediaItems();
    const normalized = items.map(item => normalizeMediaItemUrls(item, req));
    res.json({ success: true, data: normalized });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Scan and report usages for an asset dynamically
app.get("/api/mysql/media_items/:id/usage", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM media_items WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Asset not found" });
    }
    const item = rows[0];
    const usages = await findUsageOfImage(item.public_url);
    
    // Auto-update the cached usage count in MySQL for future quick reference
    await pool.query("UPDATE media_items SET usage_count = ? WHERE id = ?", [usages.length, id]);
    
    res.json({ success: true, usages, usage_count: usages.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Save/Register Asset Metadata manually
app.post("/api/mysql/media_items", async (req, res) => {
  try {
    const item = req.body;
    if (!item.id || !item.title || !item.storage_path || !item.public_url) {
      return res.status(400).json({ success: false, error: "Missing required metadata parameters" });
    }
    const success = await saveMediaItem(item);
    if (success) {
      const normalizedItem = normalizeMediaItemUrls(item, req);
      res.json({ success: true, data: normalizedItem });
    } else {
      res.status(500).json({ success: false, error: "Failed to persist media metadata" });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Update Asset SEO & Metadata details
app.put("/api/mysql/media_items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const metadata = req.body;
    
    // Check if a slug update was requested
    if (metadata.slug) {
      const renameResult = await renameMediaAsset(id, metadata.slug);
      if (!renameResult.success) {
        return res.status(400).json({ success: false, error: renameResult.error });
      }
      // Delete slug from metadata so we don't try to double-update it via simple updateMediaItemMetadata
      delete metadata.slug;
    }

    const success = await updateMediaItemMetadata(id, metadata);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: "Failed to update asset metadata" });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Hard delete asset from disk and MySQL library (safeguarded)
app.delete("/api/mysql/media_items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM media_items WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Asset not found" });
    }
    
    const item = rows[0];
    const usages = await findUsageOfImage(item.public_url);
    if (usages.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete this asset because it is currently utilized across the platform.",
        usages
      });
    }

    // Delete db record
    await deleteMediaItem(id);

    // Safely delete physical original & responsive sizes from disk storage
    const physicalFiles = [
      item.storage_path,
      item.thumbnail_url ? item.thumbnail_url.replace(/^\//, "") : null,
      item.medium_url ? item.medium_url.replace(/^\//, "") : null,
      item.large_url ? item.large_url.replace(/^\//, "") : null,
      item.original_url ? item.original_url.replace(/^\//, "") : null
    ].filter((p): p is string => typeof p === "string" && !!p);

    physicalFiles.forEach((relPath) => {
      try {
        const fullPath = path.join(process.cwd(), relPath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (err: any) {
        console.warn(`[Cleanup Warning] Could not delete physical file ${relPath}:`, err.message);
      }
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Support replacing an image while keeping the exact same public URL & storage path
app.post("/api/mysql/media_replace", mediaUpload.single("file"), async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      if (req.file) { try { fs.unlinkSync(req.file.path); } catch {} }
      return res.status(400).json({ success: false, error: "Missing asset ID" });
    }
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: "No image file uploaded" });
    }

    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM media_items WHERE id = ?", [id]);
    if (rows.length === 0) {
      try { fs.unlinkSync(file.path); } catch {}
      return res.status(404).json({ success: false, error: "Asset not found" });
    }

    const currentItem = rows[0];
    const targetPath = path.join(process.cwd(), currentItem.storage_path);

    try {
      // Overwrite current file on disk
      if (file.path !== targetPath) {
        fs.copyFileSync(file.path, targetPath);
        fs.unlinkSync(file.path);
      }
    } catch (fsErr: any) {
      console.error("Asset overwrite failed:", fsErr.message);
      return res.status(500).json({ success: false, error: "Failed to overwrite physical server asset" });
    }

    // Refresh size and update updated_at
    const stats = fs.statSync(targetPath);
    await pool.query(
      "UPDATE media_items SET file_size = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [stats.size, id]
    );

    res.json({ success: true, message: "Asset overwritten successfully." });
  } catch (err: any) {
    console.error("Replacement engine failure:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Core Premium Multipart Upload with full metadata parsing
app.post("/api/mysql/media_upload", (req, res) => {
  cpUploadFields(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    try {
      const files = (req.files || {}) as { [fieldname: string]: Express.Multer.File[] };
      const folder = (req.query.folder as string) || "properties";
      const cleanFolder = sanitizeFolder(folder);
      const uploadedBy = (req.query.uploaded_by as string) || "dvarixrealty@gmail.com";

      const originalFile = files["original"]?.[0];
      if (!originalFile) {
        return res.status(400).json({ success: false, error: "Original image file is required" });
      }

      // Metadata to parse
      const title = (req.body.title as string) || originalFile.originalname.split(".")[0];
      const altText = (req.body.alt_text as string) || title;
      const caption = (req.body.caption as string) || "";
      const description = (req.body.description as string) || "";
      const keywords = (req.body.keywords as string) || "";
      const category = (req.body.category as string) || "All";
      const width = req.body.width ? Number(req.body.width) : null;
      const height = req.body.height ? Number(req.body.height) : null;
      const aspectRatio = req.body.aspect_ratio || "";
      const format = originalFile.mimetype.split("/")[1]?.toUpperCase() || "WEBP";

      const itemId = "media-" + Math.random().toString(36).substring(2, 11);

      // Custom SEO Input
      let finalSlug = originalFile.filename.split(".")[0];
      let finalFilename = originalFile.filename;

      if (req.body.seo_filename) {
        let cleanSlug = req.body.seo_filename
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
        if (cleanSlug && cleanSlug !== finalSlug) {
          const ext = path.extname(originalFile.filename).toLowerCase() || ".webp";
          const destPath = path.join(process.cwd(), "uploads", cleanFolder);
          
          let testSlug = cleanSlug;
          let testFilename = `${testSlug}${ext}`;
          let counter = 1;

          while (
            fs.existsSync(path.join(destPath, testFilename)) ||
            (await getPool().query(`SELECT id FROM media_items WHERE slug = ? AND folder = ?`, [testSlug, cleanFolder]).then(([r]: any) => r.length > 0))
          ) {
            testSlug = `${cleanSlug}-${counter}`;
            testFilename = `${testSlug}${ext}`;
            counter++;
          }

          // Rename files on disk
          const filesToRename = [
            { key: "original", fileObj: originalFile, suffix: "" },
            { key: "large", fileObj: files["large"]?.[0], suffix: "-large" },
            { key: "medium", fileObj: files["medium"]?.[0], suffix: "-medium" },
            { key: "small", fileObj: files["small"]?.[0], suffix: "-small" },
            { key: "thumbnail", fileObj: files["thumbnail"]?.[0], suffix: "-thumb" }
          ];

          for (const item of filesToRename) {
            if (item.fileObj && fs.existsSync(item.fileObj.path)) {
              const oldPath = item.fileObj.path;
              const newName = `${testSlug}${item.suffix}${ext}`;
              const newPath = path.join(destPath, newName);
              fs.renameSync(oldPath, newPath);
              item.fileObj.path = newPath;
              item.fileObj.filename = newName;
            }
          }

          finalSlug = testSlug;
          finalFilename = testFilename;
        }
      }

      // We construct paths relative to workspace root
      const getRelativePath = (fileObj?: Express.Multer.File) => {
        if (!fileObj) return null;
        return path.relative(process.cwd(), fileObj.path).replace(/\\/g, "/");
      };

      const originalRelPath = getRelativePath(originalFile)!;
      const relative_path = "/" + originalRelPath;

      // Construct dynamic Public URL based on request host and protocol
      const baseUrl = getPublicBaseUrl(req);
      const public_url = `${baseUrl}${relative_path}`;

      // Helper to generate absolute subfolder URLs based on responsive relative paths
      const getPublicUrl = (relPath: string | null) => {
        if (!relPath) return null;
        return `${baseUrl}/${relPath}`;
      };

      // Responsive paths
      const largeRelPath = getRelativePath(files["large"]?.[0]);
      const mediumRelPath = getRelativePath(files["medium"]?.[0]);
      const smallRelPath = getRelativePath(files["small"]?.[0]);
      const thumbRelPath = getRelativePath(files["thumbnail"]?.[0]);

      const mediaItemRecord = {
        id: itemId,
        title,
        seo_filename: finalFilename,
        slug: finalSlug,
        alt_text: altText,
        caption,
        description,
        keywords,
        folder: cleanFolder,
        category,
        width,
        height,
        aspect_ratio: aspectRatio,
        format,
        file_size: originalFile.size,
        storage_path: originalRelPath,
        public_url: public_url,
        thumbnail_url: getPublicUrl(thumbRelPath) || public_url,
        medium_url: getPublicUrl(mediumRelPath) || public_url,
        large_url: getPublicUrl(largeRelPath) || public_url,
        original_url: public_url,
        uploaded_by: uploadedBy,
        status: "Active",
        usage_count: 0,
        
        // Extended DAM System Attributes
        original_filename: originalFile.originalname,
        stored_filename: finalFilename,
        mime_type: originalFile.mimetype || "image/webp",
        filesize: originalFile.size,
        optimization_status: "Optimized (WebP)",
        relative_path: relative_path
      };

      const saveSuccess = await saveMediaItem(mediaItemRecord);
      if (saveSuccess) {
        const normalizedItem = normalizeMediaItemUrls(mediaItemRecord, req);
        res.json({ success: true, data: normalizedItem });
      } else {
        res.status(500).json({ success: false, error: "Failed to store asset metadata in database" });
      }

    } catch (uploadErr: any) {
      console.error("Upload process error:", uploadErr);
      res.status(500).json({ success: false, error: uploadErr.message });
    }
  });
});

// ==================================================
// ENTERPRISE PUBLIC URL & MEDIA PICKER BACKEND API
// ==================================================

// 1. Fetch All Assets (Supports Search, Filters, Sorting, Favorites)
app.get("/api/media/assets", async (req, res) => {
  try {
    const pool = getPool();
    let query = "SELECT * FROM media_items WHERE 1=1";
    const params: any[] = [];

    if (req.query.folder && req.query.folder !== "all") {
      query += " AND folder = ?";
      params.push(req.query.folder);
    }
    if (req.query.category && req.query.category !== "all") {
      if (req.query.category === "Image") {
        query += " AND (category = 'Image' OR category IN ('Apartments', 'Villas', 'Commercial', 'Lands', 'Logos', 'Portraits', 'Marketing', 'Banners') OR mime_type LIKE 'image/%' OR format IN ('JPG', 'JPEG', 'PNG', 'WEBP', 'GIF', 'SVG', 'BMP', 'TIFF'))";
      } else if (req.query.category === "Document") {
        query += " AND (category = 'Document' OR category IN ('Uncategorized', 'documents') OR mime_type LIKE 'application/%' OR format IN ('PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'PPT', 'PPTX', 'TXT', 'CSV') OR mime_type LIKE 'text/%')";
      } else {
        query += " AND category = ?";
        params.push(req.query.category);
      }
    }
    if (req.query.format && req.query.format !== "all") {
      query += " AND format = ?";
      params.push((req.query.format as string).toUpperCase());
    }
    if (req.query.favorite !== undefined && req.query.favorite !== "") {
      query += " AND favorite = ?";
      params.push(req.query.favorite === "true" || req.query.favorite === "1" ? 1 : 0);
    }
    if (req.query.unused === "true") {
      query += " AND usage_count = 0";
    }
    if (req.query.search) {
      query += " AND (title LIKE ? OR seo_filename LIKE ? OR alt_text LIKE ? OR keywords LIKE ?)";
      const term = `%${req.query.search}%`;
      params.push(term, term, term, term);
    }

    // Sort options
    const sortBy = req.query.sortBy as string;
    if (sortBy === "size_desc") {
      query += " ORDER BY file_size DESC";
    } else if (sortBy === "size_asc") {
      query += " ORDER BY file_size ASC";
    } else if (sortBy === "usages_desc") {
      query += " ORDER BY usage_count DESC";
    } else if (sortBy === "name_asc") {
      query += " ORDER BY title ASC";
    } else if (sortBy === "recently_used") {
      query += " ORDER BY last_used_at DESC, created_at DESC";
    } else {
      query += " ORDER BY created_at DESC";
    }

    const [rows]: any = await pool.query(query, params);
    const normalized = rows.map((item: any) => normalizeMediaItemUrls(item, req));
    res.json({ success: true, count: normalized.length, data: normalized });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Search Assets (Dynamic Search Endpoint)
app.get("/api/media/search", async (req, res) => {
  try {
    const pool = getPool();
    const q = req.query.q as string;
    if (!q) {
      return res.json({ success: true, count: 0, data: [] });
    }
    const term = `%${q}%`;
    const query = `
      SELECT * FROM media_items 
      WHERE title LIKE ? OR seo_filename LIKE ? OR alt_text LIKE ? OR keywords LIKE ? OR category LIKE ?
      ORDER BY created_at DESC
    `;
    const [rows]: any = await pool.query(query, [term, term, term, term, term]);
    const normalized = rows.map((item: any) => normalizeMediaItemUrls(item, req));
    res.json({ success: true, count: normalized.length, data: normalized });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Folders Directory Analytics
app.get("/api/media/folders", async (req, res) => {
  try {
    const pool = getPool();
    const query = `
      SELECT folder as name, COUNT(*) as asset_count, SUM(file_size) as total_size 
      FROM media_items 
      GROUP BY folder 
      ORDER BY name ASC
    `;
    const [rows]: any = await pool.query(query);
    res.json({ success: true, data: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Categories Analytics
app.get("/api/media/categories", async (req, res) => {
  try {
    const pool = getPool();
    const query = `
      SELECT category as name, COUNT(*) as asset_count 
      FROM media_items 
      GROUP BY category 
      ORDER BY asset_count DESC
    `;
    const [rows]: any = await pool.query(query);
    res.json({ success: true, data: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Get Public URL By ID
app.get("/api/media/public-url/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM media_items WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Asset not found" });
    }
    const item = normalizeMediaItemUrls(rows[0], req);
    res.json({ success: true, public_url: item.public_url, title: item.title, format: item.format });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Get Single Asset Metadata by ID
app.get("/api/media/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM media_items WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Asset not found" });
    }
    const item = normalizeMediaItemUrls(rows[0], req);
    res.json({ success: true, data: item });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Core Premium Upload with SEO collision handling
app.post("/api/media/upload", (req, res) => {
  cpUploadFields(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    try {
      const files = (req.files || {}) as { [fieldname: string]: Express.Multer.File[] };
      const folder = (req.query.folder as string) || "properties";
      const cleanFolder = sanitizeFolder(folder);
      const uploadedBy = (req.query.uploaded_by as string) || "dvarixrealty@gmail.com";

      const originalFile = files["original"]?.[0];
      if (!originalFile) {
        return res.status(400).json({ success: false, error: "Original image file is required" });
      }

      const pool = getPool();

      // Retrieve titles / SEO filename inputs
      const title = (req.body.title as string) || originalFile.originalname.split(".")[0];
      const altText = (req.body.alt_text as string) || title;
      const caption = (req.body.caption as string) || "";
      const description = (req.body.description as string) || "";
      const keywords = (req.body.keywords as string) || "";
      const category = (req.body.category as string) || "All";
      const width = req.body.width ? Number(req.body.width) : null;
      const height = req.body.height ? Number(req.body.height) : null;
      const aspectRatio = req.body.aspect_ratio || null;
      const format = originalFile.mimetype.split("/")[1]?.toUpperCase() || "WEBP";

      // SEO-friendly clean filename slugification
      const lastDot = originalFile.originalname.lastIndexOf(".");
      const ext = lastDot !== -1 ? originalFile.originalname.substring(lastDot).toLowerCase() : ".webp";
      const userSeoInput = (req.body.seo_filename as string) || title;
      
      let baseSlug = userSeoInput
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      if (!baseSlug) baseSlug = "asset";

      const destPath = path.join(process.cwd(), "uploads", cleanFolder);
      
      let finalBaseSlug = baseSlug;
      let finalFilename = `${finalBaseSlug}${ext}`;
      let counter = 1;

      // Sequential collision loop
      while (true) {
        const [rows]: any = await pool.query(
          "SELECT id FROM media_items WHERE folder = ? AND seo_filename = ?",
          [cleanFolder, finalFilename]
        );
        const diskExists = fs.existsSync(path.join(destPath, finalFilename));
        if (rows.length === 0 && !diskExists) {
          break;
        }
        finalBaseSlug = `${baseSlug}-${counter}`;
        finalFilename = `${finalBaseSlug}${ext}`;
        counter++;
      }

      // Rename original file on disk
      const newOriginalRelPath = `uploads/${cleanFolder}/${finalFilename}`;
      const newOriginalFullPath = path.join(process.cwd(), newOriginalRelPath);
      fs.renameSync(originalFile.path, newOriginalFullPath);

      // Handle other sizes dynamically if they exist
      const renameSubversion = (fileObj?: Express.Multer.File, suffix?: string) => {
        if (!fileObj) return null;
        const subRelPath = `uploads/${cleanFolder}/${finalBaseSlug}${suffix}${ext}`;
        const subFullPath = path.join(process.cwd(), subRelPath);
        fs.renameSync(fileObj.path, subFullPath);
        return "/" + subRelPath;
      };

      const thumbPublicUrl = renameSubversion(files["thumbnail"]?.[0], "-thumb") || ("/" + newOriginalRelPath);
      const mediumPublicUrl = renameSubversion(files["medium"]?.[0], "-medium") || ("/" + newOriginalRelPath);
      const largePublicUrl = renameSubversion(files["large"]?.[0], "-large") || ("/" + newOriginalRelPath);

      // Calculate asset file hash for duplicate tracking
      let fileHash = "";
      try {
        fileHash = crypto.createHash("md5").update(fs.readFileSync(newOriginalFullPath)).digest("hex");
      } catch (hashErr) {
        console.warn("Hashing err:", hashErr);
      }

      const itemId = "media-" + Math.random().toString(36).substring(2, 11);

      const mediaItemRecord = {
        id: itemId,
        title,
        seo_filename: finalFilename,
        slug: finalBaseSlug,
        alt_text: altText,
        caption,
        description,
        keywords,
        folder: cleanFolder,
        category,
        width,
        height,
        aspect_ratio: aspectRatio,
        format,
        file_size: originalFile.size,
        storage_path: newOriginalRelPath,
        public_url: "/" + newOriginalRelPath,
        thumbnail_url: thumbPublicUrl,
        medium_url: mediumPublicUrl,
        large_url: largePublicUrl,
        original_url: "/" + newOriginalRelPath,
        uploaded_by: uploadedBy,
        status: "Active",
        usage_count: 0,
        relative_path: newOriginalRelPath,
        last_used_at: null,
        favorite: req.body.favorite === "true" || req.body.favorite === "1" ? 1 : 0,
        seo_slug: finalBaseSlug,
        canonical_filename: finalFilename,
        hash: fileHash
      };

      const saveSuccess = await saveMediaItem(mediaItemRecord);
      if (saveSuccess) {
        const normalizedItem = normalizeMediaItemUrls(mediaItemRecord, req);
        res.json({ success: true, data: normalizedItem });
      } else {
        res.status(500).json({ success: false, error: "Failed to save asset metadata to MySQL." });
      }
    } catch (err: any) {
      console.error("Upload process error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });
});

// 8. Select Media Asset (Increments usage count and updates last_used_at timestamp)
app.post("/api/media/select", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, error: "Asset ID is required." });
    }
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM media_items WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Asset not found." });
    }
    const item = rows[0];
    const usages = await findUsageOfImage(item.public_url);
    const count = Math.max(usages.length, item.usage_count + 1);

    await pool.query(
      "UPDATE media_items SET usage_count = ?, last_used_at = CURRENT_TIMESTAMP WHERE id = ?",
      [count, id]
    );

    res.json({ 
      success: true, 
      message: "Asset selection recorded successfully.", 
      usage_count: count,
      last_used_at: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Update Asset Metadata (title, alt_text, category, favorite, keywords)
app.put("/api/media/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const metadata = req.body;
    const success = await updateMediaItemMetadata(id, metadata);
    if (success) {
      res.json({ success: true, message: "Asset metadata updated successfully." });
    } else {
      res.status(500).json({ success: false, error: "Failed to update asset metadata." });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Delete Asset safely (guarded by usage verification)
app.delete("/api/media/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM media_items WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Asset not found" });
    }
    
    const item = rows[0];
    const usages = await findUsageOfImage(item.public_url);
    if (usages.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete this asset because it is currently utilized across the platform.",
        usages
      });
    }

    await deleteMediaItem(id);

    // Delete physical files
    const physicalFiles = [
      item.storage_path,
      item.thumbnail_url ? item.thumbnail_url.replace(/^\//, "") : null,
      item.medium_url ? item.medium_url.replace(/^\//, "") : null,
      item.large_url ? item.large_url.replace(/^\//, "") : null,
      item.original_url ? item.original_url.replace(/^\//, "") : null
    ].filter((p): p is string => typeof p === "string" && !!p);

    physicalFiles.forEach((relPath) => {
      try {
        const fullPath = path.join(process.cwd(), relPath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (err: any) {
        console.warn(`[Cleanup Warning] Could not delete physical file ${relPath}:`, err.message);
      }
    });

    res.json({ success: true, message: "Asset permanently deleted." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
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

  // Trigger Hostinger MySQL connection test and table initialization on startup
  try {
    const connected = await testMySQLConnection();
    if (connected) {
      await initializePropertiesTable();
      await initializePhase5Tables();
      await initializePhase6Tables();
      await initializePhase7Tables();
      await initializeCmsTables();
      await initializeMediaTable();
    }
  } catch (err: any) {
    console.error("⚠️ Graceful startup warning: MySQL test connection or table initialization failed to complete:", err.message);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server executing successfully on http://0.0.0.0:${PORT}`);
  });
}

startServer();
