import { getPool } from "./mysqlService.ts";

/**
 * Initializes MySQL tables for Phase 7 operational modules:
 * - site_visits (Site Visits tracking)
 * - requirements (CRM Custom requirements)
 * - customer_requirements (AI Chatbot customer leads/requirements)
 * - finance_entries (Finance and brokerage ledger entries)
 * - crm_documents (Documents vault/CRM documents)
 * - chatbot_knowledge (Chatbot Knowledge Base articles)
 * - chatbot_documents (Chatbot reference PDFs/documents)
 * - chatbot_websites (Chatbot training URL paths)
 * - chatbot_snippets (Chatbot system prompt snippets)
 * - chatbot_flows (Chatbot dialogue and qualification flow configurations)
 * - qualification_rules (Chatbot lead qualification rules)
 * - chatbot_audit_logs (Chatbot interaction audit trails)
 * - ai_permissions (AI tool capabilities permission mapping)
 * - ai_activity_logs (AI interaction activity logs)
 */
export async function initializePhase7Tables(): Promise<void> {
  const pool = getPool();

  const createSiteVisitsTable = `
    CREATE TABLE IF NOT EXISTS site_visits (
      id VARCHAR(128) PRIMARY KEY,
      enquiry_id VARCHAR(128),
      customer_name VARCHAR(255),
      property_id VARCHAR(128),
      property_name VARCHAR(255),
      date VARCHAR(100),
      time VARCHAR(100),
      advisor_id VARCHAR(128),
      advisor_name VARCHAR(255),
      confirmed TINYINT(1) DEFAULT 0,
      maps_location TEXT,
      instructions TEXT,
      status VARCHAR(50) DEFAULT 'Scheduled',
      feedback TEXT,
      notes TEXT,
      created_at_str VARCHAR(100),
      raw_data LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createRequirementsTable = `
    CREATE TABLE IF NOT EXISTS requirements (
      id VARCHAR(128) PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      mobile_number VARCHAR(100) NOT NULL,
      email_address VARCHAR(255),
      city VARCHAR(255),
      looking_for VARCHAR(100),
      property_type VARCHAR(100),
      preferred_city VARCHAR(255),
      preferred_area VARCHAR(255),
      alternative_location VARCHAR(255),
      landmark VARCHAR(255),
      min_budget VARCHAR(100),
      max_budget VARCHAR(100),
      plot_size VARCHAR(100),
      bhk_requirement VARCHAR(100),
      ready_to_move VARCHAR(100),
      loan_required VARCHAR(50),
      amenities TEXT, -- JSON array
      timeline VARCHAR(100),
      message TEXT,
      status VARCHAR(50) DEFAULT 'New',
      date VARCHAR(100),
      preferred_date VARCHAR(100),
      preferred_time VARCHAR(100),
      submission_type VARCHAR(100),
      raw_data LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createCustomerRequirementsTable = `
    CREATE TABLE IF NOT EXISTS customer_requirements (
      id VARCHAR(128) PRIMARY KEY, -- leadId
      session_id VARCHAR(128),
      visitor_id VARCHAR(128),
      customer_name VARCHAR(255),
      phone_number VARCHAR(100),
      email VARCHAR(255),
      preferred_location VARCHAR(255),
      property_type VARCHAR(100),
      budget VARCHAR(100),
      bedrooms VARCHAR(100),
      area VARCHAR(100),
      requirement_summary TEXT,
      lead_status VARCHAR(50) DEFAULT 'New',
      priority VARCHAR(50) DEFAULT 'Medium',
      source VARCHAR(100) DEFAULT 'AI Chatbot',
      assigned_agent VARCHAR(255),
      created_at_str VARCHAR(100),
      updated_at_str VARCHAR(100),
      raw_data LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createFinanceEntriesTable = `
    CREATE TABLE IF NOT EXISTS finance_entries (
      id VARCHAR(128) PRIMARY KEY,
      type VARCHAR(50) NOT NULL,
      category VARCHAR(255) NOT NULL,
      amount DECIMAL(15, 2) NOT NULL,
      date VARCHAR(100) NOT NULL,
      status VARCHAR(50) DEFAULT 'Cleared',
      description TEXT,
      property VARCHAR(255),
      customer VARCHAR(255),
      agent VARCHAR(255),
      payment_mode VARCHAR(255),
      raw_data LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createCrmDocumentsTable = `
    CREATE TABLE IF NOT EXISTS crm_documents (
      id VARCHAR(128) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(100) NOT NULL,
      category VARCHAR(100) NOT NULL,
      property_id VARCHAR(128),
      property_name VARCHAR(255),
      customer_name VARCHAR(255),
      lead_id VARCHAR(128),
      requirement_id VARCHAR(128),
      upload_date VARCHAR(100),
      uploaded_by VARCHAR(255),
      status VARCHAR(100) DEFAULT 'Uploaded',
      file_size VARCHAR(50),
      version INT DEFAULT 1,
      expiry_date VARCHAR(100),
      owner_name VARCHAR(255),
      notes TEXT,
      verified_by VARCHAR(255),
      verification_notes TEXT,
      history LONGTEXT, -- JSON array of edits
      raw_data LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createChatbotKnowledgeTable = `
    CREATE TABLE IF NOT EXISTS chatbot_knowledge (
      id VARCHAR(128) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content LONGTEXT,
      category VARCHAR(100),
      last_updated VARCHAR(100),
      raw_data LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createChatbotDocumentsTable = `
    CREATE TABLE IF NOT EXISTS chatbot_documents (
      id VARCHAR(128) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(100),
      category VARCHAR(100),
      raw_data LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createChatbotWebsitesTable = `
    CREATE TABLE IF NOT EXISTS chatbot_websites (
      id VARCHAR(128) PRIMARY KEY,
      url TEXT NOT NULL,
      status VARCHAR(100) DEFAULT 'Crawled',
      raw_data LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createChatbotSnippetsTable = `
    CREATE TABLE IF NOT EXISTS chatbot_snippets (
      id VARCHAR(128) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content LONGTEXT,
      raw_data LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createChatbotFlowsTable = `
    CREATE TABLE IF NOT EXISTS chatbot_flows (
      id VARCHAR(128) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      raw_data LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createQualificationRulesTable = `
    CREATE TABLE IF NOT EXISTS qualification_rules (
      id VARCHAR(128) PRIMARY KEY,
      raw_data LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createChatbotAuditLogsTable = `
    CREATE TABLE IF NOT EXISTS chatbot_audit_logs (
      id VARCHAR(128) PRIMARY KEY,
      session_id VARCHAR(128),
      visitor_id VARCHAR(128),
      raw_data LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createAiPermissionsTable = `
    CREATE TABLE IF NOT EXISTS ai_permissions (
      id VARCHAR(128) PRIMARY KEY,
      raw_data LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createAiActivityLogsTable = `
    CREATE TABLE IF NOT EXISTS ai_activity_logs (
      id VARCHAR(128) PRIMARY KEY,
      raw_data LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    console.log("[MySQL Init Phase 7] Checking and creating table definitions...");
    await pool.query(createSiteVisitsTable);
    console.log("   - Table 'site_visits' ready.");

    await pool.query(createRequirementsTable);
    console.log("   - Table 'requirements' ready.");

    await pool.query(createCustomerRequirementsTable);
    console.log("   - Table 'customer_requirements' ready.");

    await pool.query(createFinanceEntriesTable);
    console.log("   - Table 'finance_entries' ready.");

    await pool.query(createCrmDocumentsTable);
    console.log("   - Table 'crm_documents' ready.");

    await pool.query(createChatbotKnowledgeTable);
    console.log("   - Table 'chatbot_knowledge' ready.");

    await pool.query(createChatbotDocumentsTable);
    console.log("   - Table 'chatbot_documents' ready.");

    await pool.query(createChatbotWebsitesTable);
    console.log("   - Table 'chatbot_websites' ready.");

    await pool.query(createChatbotSnippetsTable);
    console.log("   - Table 'chatbot_snippets' ready.");

    await pool.query(createChatbotFlowsTable);
    console.log("   - Table 'chatbot_flows' ready.");

    await pool.query(createQualificationRulesTable);
    console.log("   - Table 'qualification_rules' ready.");

    await pool.query(createChatbotAuditLogsTable);
    console.log("   - Table 'chatbot_audit_logs' ready.");

    await pool.query(createAiPermissionsTable);
    console.log("   - Table 'ai_permissions' ready.");

    await pool.query(createAiActivityLogsTable);
    console.log("   - Table 'ai_activity_logs' ready.");

    console.log("✅ MySQL Init Phase 7 completed successfully!");
  } catch (err: any) {
    console.error("❌ MySQL Init Phase 7 Error:", err.message || err);
    throw err;
  }
}

// ==========================================
// DB GENERIC OPERATIONS UTILITIES
// ==========================================

async function upsertRecord(tableName: string, id: string, payload: any, idCol = 'id'): Promise<boolean> {
  const pool = getPool();
  const rawDataStr = JSON.stringify(payload);
  
  // Specific custom field mapping if desired, otherwise simple raw_data fallback style
  // Since we have individual columns for important tables, we can extract them safely.
  try {
    if (tableName === 'site_visits') {
      const q = `
        INSERT INTO site_visits (
          id, enquiry_id, customer_name, property_id, property_name, 
          date, time, advisor_id, advisor_name, confirmed, 
          maps_location, instructions, status, feedback, notes, 
          created_at_str, raw_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          enquiry_id = VALUES(enquiry_id),
          customer_name = VALUES(customer_name),
          property_id = VALUES(property_id),
          property_name = VALUES(property_name),
          date = VALUES(date),
          time = VALUES(time),
          advisor_id = VALUES(advisor_id),
          advisor_name = VALUES(advisor_name),
          confirmed = VALUES(confirmed),
          maps_location = VALUES(maps_location),
          instructions = VALUES(instructions),
          status = VALUES(status),
          feedback = VALUES(feedback),
          notes = VALUES(notes),
          created_at_str = VALUES(created_at_str),
          raw_data = VALUES(raw_data),
          updated_at = CURRENT_TIMESTAMP;
      `;
      await pool.query(q, [
        id,
        payload.enquiryId || "",
        payload.customerName || "",
        payload.propertyId || "",
        payload.propertyName || "",
        payload.date || "",
        payload.time || "",
        payload.advisorId || "",
        payload.advisorName || "",
        payload.confirmed ? 1 : 0,
        payload.mapsLocation || "",
        payload.instructions || "",
        payload.status || "Scheduled",
        payload.feedback || "",
        payload.notes || "",
        payload.createdAt || "",
        rawDataStr
      ]);
    } else if (tableName === 'requirements') {
      const q = `
        INSERT INTO requirements (
          id, full_name, mobile_number, email_address, city, 
          looking_for, property_type, preferred_city, preferred_area, 
          alternative_location, landmark, min_budget, max_budget, 
          plot_size, bhk_requirement, ready_to_move, loan_required, 
          amenities, timeline, message, status, date, preferred_date, 
          preferred_time, submission_type, raw_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          full_name = VALUES(full_name),
          mobile_number = VALUES(mobile_number),
          email_address = VALUES(email_address),
          city = VALUES(city),
          looking_for = VALUES(looking_for),
          property_type = VALUES(property_type),
          preferred_city = VALUES(preferred_city),
          preferred_area = VALUES(preferred_area),
          alternative_location = VALUES(alternative_location),
          landmark = VALUES(landmark),
          min_budget = VALUES(min_budget),
          max_budget = VALUES(max_budget),
          plot_size = VALUES(plot_size),
          bhk_requirement = VALUES(bhk_requirement),
          ready_to_move = VALUES(ready_to_move),
          loan_required = VALUES(loan_required),
          amenities = VALUES(amenities),
          timeline = VALUES(timeline),
          message = VALUES(message),
          status = VALUES(status),
          date = VALUES(date),
          preferred_date = VALUES(preferred_date),
          preferred_time = VALUES(preferred_time),
          submission_type = VALUES(submission_type),
          raw_data = VALUES(raw_data),
          updated_at = CURRENT_TIMESTAMP;
      `;
      await pool.query(q, [
        id,
        payload.fullName || "",
        payload.mobileNumber || "",
        payload.emailAddress || "",
        payload.city || "",
        payload.lookingFor || "",
        payload.propertyType || "",
        payload.preferredCity || "",
        payload.preferredArea || "",
        payload.alternativeLocation || "",
        payload.landmark || "",
        payload.minBudget || "",
        payload.maxBudget || "",
        payload.plotSize || "",
        payload.bhkRequirement || "",
        payload.readyToMove || "",
        payload.loanRequired || "",
        JSON.stringify(payload.amenities || []),
        payload.timeline || "",
        payload.message || "",
        payload.status || "New",
        payload.date || "",
        payload.preferredDate || "",
        payload.preferredTime || "",
        payload.submissionType || "",
        rawDataStr
      ]);
    } else if (tableName === 'customer_requirements') {
      const q = `
        INSERT INTO customer_requirements (
          id, session_id, visitor_id, customer_name, phone_number, 
          email, preferred_location, property_type, budget, 
          bedrooms, area, requirement_summary, lead_status, 
          priority, source, assigned_agent, created_at_str, updated_at_str, raw_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          session_id = VALUES(session_id),
          visitor_id = VALUES(visitor_id),
          customer_name = VALUES(customer_name),
          phone_number = VALUES(phone_number),
          email = VALUES(email),
          preferred_location = VALUES(preferred_location),
          property_type = VALUES(property_type),
          budget = VALUES(budget),
          bedrooms = VALUES(bedrooms),
          area = VALUES(area),
          requirement_summary = VALUES(requirement_summary),
          lead_status = VALUES(lead_status),
          priority = VALUES(priority),
          source = VALUES(source),
          assigned_agent = VALUES(assigned_agent),
          created_at_str = VALUES(created_at_str),
          updated_at_str = VALUES(updated_at_str),
          raw_data = VALUES(raw_data),
          updated_at = CURRENT_TIMESTAMP;
      `;
      await pool.query(q, [
        id,
        payload.sessionId || "",
        payload.visitorId || "",
        payload.customerName || "",
        payload.phoneNumber || "",
        payload.email || "",
        payload.preferredLocation || "",
        payload.propertyType || "",
        payload.budget || "",
        payload.bedrooms || "",
        payload.area || "",
        payload.requirementSummary || "",
        payload.leadStatus || "New",
        payload.priority || "Medium",
        payload.source || "AI Chatbot",
        payload.assignedAgent || null,
        payload.createdAt || "",
        payload.updatedAt || "",
        rawDataStr
      ]);
    } else if (tableName === 'finance_entries') {
      const q = `
        INSERT INTO finance_entries (
          id, type, category, amount, date, status, 
          description, property, customer, agent, payment_mode, raw_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          type = VALUES(type),
          category = VALUES(category),
          amount = VALUES(amount),
          date = VALUES(date),
          status = VALUES(status),
          description = VALUES(description),
          property = VALUES(property),
          customer = VALUES(customer),
          agent = VALUES(agent),
          payment_mode = VALUES(payment_mode),
          raw_data = VALUES(raw_data),
          updated_at = CURRENT_TIMESTAMP;
      `;
      await pool.query(q, [
        id,
        payload.type || "",
        payload.category || "",
        Number(payload.amount || 0),
        payload.date || "",
        payload.status || "Cleared",
        payload.description || "",
        payload.property || "",
        payload.customer || "",
        payload.agent || "",
        payload.paymentMode || "",
        rawDataStr
      ]);
    } else if (tableName === 'crm_documents') {
      const q = `
        INSERT INTO crm_documents (
          id, name, type, category, property_id, property_name, 
          customer_name, lead_id, requirement_id, upload_date, 
          uploaded_by, status, file_size, version, expiry_date, 
          owner_name, notes, verified_by, verification_notes, history, raw_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          type = VALUES(type),
          category = VALUES(category),
          property_id = VALUES(property_id),
          property_name = VALUES(property_name),
          customer_name = VALUES(customer_name),
          lead_id = VALUES(lead_id),
          requirement_id = VALUES(requirement_id),
          upload_date = VALUES(upload_date),
          uploaded_by = VALUES(uploaded_by),
          status = VALUES(status),
          file_size = VALUES(file_size),
          version = VALUES(version),
          expiry_date = VALUES(expiry_date),
          owner_name = VALUES(owner_name),
          notes = VALUES(notes),
          verified_by = VALUES(verified_by),
          verification_notes = VALUES(verification_notes),
          history = VALUES(history),
          raw_data = VALUES(raw_data),
          updated_at = CURRENT_TIMESTAMP;
      `;
      await pool.query(q, [
        id,
        payload.name || "",
        payload.type || "",
        payload.category || "",
        payload.propertyId || "",
        payload.propertyName || "",
        payload.customerName || "",
        payload.leadId || "",
        payload.requirementId || "",
        payload.uploadDate || "",
        payload.uploadedBy || "",
        payload.status || "Uploaded",
        payload.fileSize || "",
        payload.version || 1,
        payload.expiryDate || "",
        payload.ownerName || "",
        payload.notes || "",
        payload.verifiedBy || "",
        payload.verificationNotes || "",
        JSON.stringify(payload.history || []),
        rawDataStr
      ]);
    } else {
      // Standard JSON-only/raw_data-only backups for chatbot configurations and lesser collections
      const q = `
        INSERT INTO ${tableName} (${idCol}, raw_data)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE
          raw_data = VALUES(raw_data),
          updated_at = CURRENT_TIMESTAMP;
      `;
      await pool.query(q, [id, rawDataStr]);
    }
    return true;
  } catch (error: any) {
    console.error(`❌ MySQL Save Error [${tableName}]: ID ${id}`, error.message || error);
    return false;
  }
}

async function getRecords(tableName: string, idCol = 'id'): Promise<any[]> {
  const pool = getPool();
  try {
    const q = `SELECT * FROM ${tableName}`;
    const [rows]: any = await pool.query(q);
    return rows.map((row: any) => {
      if (row.raw_data) {
        try {
          const parsed = JSON.parse(row.raw_data);
          // ensure ID is populated
          return { id: row[idCol], ...parsed };
        } catch {
          // fallback
        }
      }
      return row;
    });
  } catch (error: any) {
    console.error(`❌ MySQL Get Error [${tableName}]:`, error.message || error);
    return [];
  }
}

async function deleteRecord(tableName: string, id: string, idCol = 'id'): Promise<boolean> {
  const pool = getPool();
  try {
    const q = `DELETE FROM ${tableName} WHERE ${idCol} = ?`;
    await pool.query(q, [id]);
    return true;
  } catch (error: any) {
    console.error(`❌ MySQL Delete Error [${tableName}]: ID ${id}`, error.message || error);
    return false;
  }
}

// ==========================================
// OPERATIONAL METHODS FOR CLIENT CONSUMPTION
// ==========================================

export const mysqlPhase7Service = {
  // Site Visits
  async saveSiteVisit(visit: any) {
    return upsertRecord('site_visits', visit.id, visit);
  },
  async getSiteVisits() {
    return getRecords('site_visits');
  },
  async deleteSiteVisit(id: string) {
    return deleteRecord('site_visits', id);
  },

  // Requirements
  async saveRequirement(requirement: any) {
    return upsertRecord('requirements', requirement.id, requirement);
  },
  async getRequirements() {
    return getRecords('requirements');
  },
  async deleteRequirement(id: string) {
    return deleteRecord('requirements', id);
  },

  // Customer Requirements
  async saveCustomerRequirement(lead: any) {
    // uses leadId as primary key
    return upsertRecord('customer_requirements', lead.leadId, lead);
  },
  async getCustomerRequirements() {
    return getRecords('customer_requirements');
  },
  async deleteCustomerRequirement(id: string) {
    return deleteRecord('customer_requirements', id);
  },

  // Finance Entries
  async saveFinanceEntry(entry: any) {
    return upsertRecord('finance_entries', entry.id, entry);
  },
  async getFinanceEntries() {
    return getRecords('finance_entries');
  },
  async deleteFinanceEntry(id: string) {
    return deleteRecord('finance_entries', id);
  },

  // CRM Documents
  async saveDocument(doc: any) {
    return upsertRecord('crm_documents', doc.id, doc);
  },
  async getDocuments() {
    return getRecords('crm_documents');
  },
  async deleteDocument(id: string) {
    return deleteRecord('crm_documents', id);
  },

  // AI Knowledge / Chatbot Collections
  async saveChatbotKnowledge(kb: any) {
    return upsertRecord('chatbot_knowledge', kb.id, kb);
  },
  async getChatbotKnowledge() {
    return getRecords('chatbot_knowledge');
  },
  async deleteChatbotKnowledge(id: string) {
    return deleteRecord('chatbot_knowledge', id);
  },

  async saveChatbotDocument(doc: any) {
    return upsertRecord('chatbot_documents', doc.id, doc);
  },
  async getChatbotDocuments() {
    return getRecords('chatbot_documents');
  },
  async deleteChatbotDocument(id: string) {
    return deleteRecord('chatbot_documents', id);
  },

  async saveChatbotWebsite(web: any) {
    return upsertRecord('chatbot_websites', web.id, web);
  },
  async getChatbotWebsites() {
    return getRecords('chatbot_websites');
  },
  async deleteChatbotWebsite(id: string) {
    return deleteRecord('chatbot_websites', id);
  },

  async saveChatbotSnippet(snip: any) {
    return upsertRecord('chatbot_snippets', snip.id, snip);
  },
  async getChatbotSnippets() {
    return getRecords('chatbot_snippets');
  },
  async deleteChatbotSnippet(id: string) {
    return deleteRecord('chatbot_snippets', id);
  },

  async saveChatbotFlow(flow: any) {
    return upsertRecord('chatbot_flows', flow.id, flow);
  },
  async getChatbotFlows() {
    return getRecords('chatbot_flows');
  },
  async deleteChatbotFlow(id: string) {
    return deleteRecord('chatbot_flows', id);
  },

  async saveQualificationRule(rule: any) {
    return upsertRecord('qualification_rules', rule.id, rule);
  },
  async getQualificationRules() {
    return getRecords('qualification_rules');
  },
  async deleteQualificationRule(id: string) {
    return deleteRecord('qualification_rules', id);
  },

  async saveChatbotAuditLog(log: any) {
    return upsertRecord('chatbot_audit_logs', log.id, log);
  },
  async getChatbotAuditLogs() {
    return getRecords('chatbot_audit_logs');
  },
  async deleteChatbotAuditLog(id: string) {
    return deleteRecord('chatbot_audit_logs', id);
  },

  async saveAiPermission(perm: any) {
    return upsertRecord('ai_permissions', perm.id, perm);
  },
  async getAiPermissions() {
    return getRecords('ai_permissions');
  },
  async deleteAiPermission(id: string) {
    return deleteRecord('ai_permissions', id);
  },

  async saveAiActivityLog(log: any) {
    return upsertRecord('ai_activity_logs', log.id, log);
  },
  async getAiActivityLogs() {
    return getRecords('ai_activity_logs');
  },
  async deleteAiActivityLog(id: string) {
    return deleteRecord('ai_activity_logs', id);
  }
};
