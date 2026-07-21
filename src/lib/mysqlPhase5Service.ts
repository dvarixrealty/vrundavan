import { getPool } from "./mysqlService.ts";
import { Agent, Inquiry, CentralEnquiry, Property } from "../types.ts";

/**
 * Initializes MySQL tables for Phase 5 modules:
 * - property_images (normalized/relational)
 * - property_amenities (normalized/relational)
 * - agents (standalone table)
 * - inquiries (standalone table)
 * - central_enquiries (standalone table with JSON support)
 */
export async function initializePhase5Tables(): Promise<void> {
  const pool = getPool();

  const createImagesTable = `
    CREATE TABLE IF NOT EXISTS property_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      property_id VARCHAR(128) NOT NULL,
      image_url TEXT NOT NULL,
      display_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
      INDEX idx_property_id (property_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createAmenitiesTable = `
    CREATE TABLE IF NOT EXISTS property_amenities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      property_id VARCHAR(128) NOT NULL,
      amenity VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
      UNIQUE KEY uq_property_amenity (property_id, amenity),
      INDEX idx_property_id (property_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createAgentsTable = `
    CREATE TABLE IF NOT EXISTS agents (
      id VARCHAR(128) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL,
      avatar TEXT,
      phone VARCHAR(100),
      email VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createInquiriesTable = `
    CREATE TABLE IF NOT EXISTS inquiries (
      id VARCHAR(128) PRIMARY KEY,
      property_id VARCHAR(128),
      property_name VARCHAR(255),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(100) NOT NULL,
      message TEXT,
      date VARCHAR(100),
      status VARCHAR(50) DEFAULT 'New',
      preferred_time VARCHAR(100),
      contact_method VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_property_id (property_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createCentralEnquiriesTable = `
    CREATE TABLE IF NOT EXISTS central_enquiries (
      id VARCHAR(128) PRIMARY KEY,
      customer_name VARCHAR(255) NOT NULL,
      mobile VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      alternate_contact VARCHAR(100),
      company_name VARCHAR(255),
      source_category VARCHAR(100) NOT NULL,
      source_name VARCHAR(255) NOT NULL,
      form_name VARCHAR(255),
      landing_page_url TEXT,
      referring_url TEXT,
      utm_source VARCHAR(100),
      utm_medium VARCHAR(100),
      utm_campaign VARCHAR(100),
      device_type VARCHAR(100),
      browser VARCHAR(100),
      os VARCHAR(100),
      created_at_str VARCHAR(100),
      property_id VARCHAR(128),
      property_name VARCHAR(255),
      property_image TEXT,
      intent VARCHAR(255),
      assigned_agent_id VARCHAR(128),
      assigned_agent_name VARCHAR(255),
      assigned_department VARCHAR(255),
      priority VARCHAR(50) DEFAULT 'Medium',
      sla_due_date VARCHAR(100),
      status VARCHAR(100) DEFAULT 'New',
      internal_notes TEXT,
      tags TEXT, -- JSON array of tags
      timeline LONGTEXT, -- JSON array of timeline entries
      form_responses LONGTEXT, -- JSON object of custom responses
      converted_lead_id VARCHAR(128),
      converted_customer_id VARCHAR(128),
      is_trashed TINYINT(1) DEFAULT 0,
      is_duplicate_of VARCHAR(128),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_property_id (property_id),
      INDEX idx_assigned_agent_id (assigned_agent_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    console.log("[MySQL Init Phase 5] Initializing tables...");
    await pool.query(createImagesTable);
    console.log("✅ MySQL Init Phase 5: 'property_images' table ready.");

    await pool.query(createAmenitiesTable);
    console.log("✅ MySQL Init Phase 5: 'property_amenities' table ready.");

    await pool.query(createAgentsTable);
    console.log("✅ MySQL Init Phase 5: 'agents' table ready.");

    await pool.query(createInquiriesTable);
    console.log("✅ MySQL Init Phase 5: 'inquiries' table ready.");

    await pool.query(createCentralEnquiriesTable);
    console.log("✅ MySQL Init Phase 5: 'central_enquiries' table ready.");
  } catch (error: any) {
    console.error("❌ MySQL Init Phase 5 Error: Failed to initialize tables.");
    console.error("   Error Message:", error.message || error);
    throw error;
  }
}

/**
 * Normalizes and migrates property images and amenities for a given set of properties.
 */
export async function migratePropertyImagesAndAmenities(properties: Property[]): Promise<{
  imagesTotal: number;
  imagesSuccess: number;
  amenitiesTotal: number;
  amenitiesSuccess: number;
}> {
  const pool = getPool();
  let imagesTotal = 0;
  let imagesSuccess = 0;
  let amenitiesTotal = 0;
  let amenitiesSuccess = 0;

  console.log(`[MySQL Phase 5] Normalizing images & amenities for ${properties.length} properties...`);

  for (const prop of properties) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Clear existing records for this property to avoid duplicate upsert key issues
      await connection.query("DELETE FROM property_images WHERE property_id = ?", [prop.id]);
      await connection.query("DELETE FROM property_amenities WHERE property_id = ?", [prop.id]);

      // Normalize images
      const imagesList = prop.images || [];
      if (imagesList.length > 0) {
        imagesTotal += imagesList.length;
        for (let i = 0; i < imagesList.length; i++) {
          const imgUrl = imagesList[i];
          if (imgUrl) {
            await connection.query(
              "INSERT INTO property_images (property_id, image_url, display_order) VALUES (?, ?, ?)",
              [prop.id, imgUrl, i]
            );
            imagesSuccess++;
          }
        }
      }

      // Normalize amenities
      const amenitiesList = prop.amenities || [];
      if (amenitiesList.length > 0) {
        amenitiesTotal += amenitiesList.length;
        for (const amenity of amenitiesList) {
          if (amenity) {
            await connection.query(
              "INSERT INTO property_amenities (property_id, amenity) VALUES (?, ?) ON DUPLICATE KEY UPDATE property_id=property_id",
              [prop.id, amenity]
            );
            amenitiesSuccess++;
          }
        }
      }

      await connection.commit();
    } catch (err: any) {
      await connection.rollback();
      console.error(`❌ MySQL Phase 5 Error: Failed to normalize images/amenities for property: ${prop.id}`, err.message);
    } finally {
      connection.release();
    }
  }

  return {
    imagesTotal,
    imagesSuccess,
    amenitiesTotal,
    amenitiesSuccess
  };
}

/**
 * Bulk migrates agents into MySQL using transactional upserts.
 */
export async function migrateAgentsToMySQL(agents: Agent[]): Promise<{
  total: number;
  success: number;
  failed: number;
}> {
  const pool = getPool();
  let success = 0;
  let failed = 0;

  const query = `
    INSERT INTO agents (id, name, role, avatar, phone, email)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      role = VALUES(role),
      avatar = VALUES(avatar),
      phone = VALUES(phone),
      email = VALUES(email),
      updated_at = CURRENT_TIMESTAMP;
  `;

  for (const agent of agents) {
    try {
      await pool.query(query, [
        agent.id,
        agent.name,
        agent.role || "",
        agent.avatar || "",
        agent.phone || "",
        agent.email || ""
      ]);
      success++;
    } catch (err: any) {
      failed++;
      console.error(`❌ MySQL Phase 5: Failed to migrate agent ${agent.id}:`, err.message);
    }
  }

  return { total: agents.length, success, failed };
}

/**
 * Bulk migrates inquiries into MySQL using transactional upserts.
 */
export async function migrateInquiriesToMySQL(inquiries: Inquiry[]): Promise<{
  total: number;
  success: number;
  failed: number;
}> {
  const pool = getPool();
  let success = 0;
  let failed = 0;

  const query = `
    INSERT INTO inquiries (
      id, property_id, property_name, name, email, phone, 
      message, date, status, preferred_time, contact_method
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      property_id = VALUES(property_id),
      property_name = VALUES(property_name),
      name = VALUES(name),
      email = VALUES(email),
      phone = VALUES(phone),
      message = VALUES(message),
      date = VALUES(date),
      status = VALUES(status),
      preferred_time = VALUES(preferred_time),
      contact_method = VALUES(contact_method),
      updated_at = CURRENT_TIMESTAMP;
  `;

  for (const inq of inquiries) {
    try {
      await pool.query(query, [
        inq.id,
        inq.propertyId || null,
        inq.propertyName || null,
        inq.name,
        inq.email,
        inq.phone,
        inq.message || "",
        inq.date || "",
        inq.status || "New",
        inq.preferredTime || null,
        inq.contactMethod || null
      ]);
      success++;
    } catch (err: any) {
      failed++;
      console.error(`❌ MySQL Phase 5: Failed to migrate inquiry ${inq.id}:`, err.message);
    }
  }

  return { total: inquiries.length, success, failed };
}

/**
 * Bulk migrates central_enquiries into MySQL using transactional upserts.
 */
export async function migrateCentralEnquiriesToMySQL(enquiries: CentralEnquiry[]): Promise<{
  total: number;
  success: number;
  failed: number;
}> {
  const pool = getPool();
  let success = 0;
  let failed = 0;

  const query = `
    INSERT INTO central_enquiries (
      id, customer_name, mobile, email, alternate_contact, company_name,
      source_category, source_name, form_name, landing_page_url, referring_url,
      utm_source, utm_medium, utm_campaign, device_type, browser, os,
      created_at_str, property_id, property_name, property_image, intent,
      assigned_agent_id, assigned_agent_name, assigned_department, priority,
      sla_due_date, status, internal_notes, tags, timeline, form_responses,
      converted_lead_id, converted_customer_id, is_trashed, is_duplicate_of
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      customer_name = VALUES(customer_name),
      mobile = VALUES(mobile),
      email = VALUES(email),
      alternate_contact = VALUES(alternate_contact),
      company_name = VALUES(company_name),
      source_category = VALUES(source_category),
      source_name = VALUES(source_name),
      form_name = VALUES(form_name),
      landing_page_url = VALUES(landing_page_url),
      referring_url = VALUES(referring_url),
      utm_source = VALUES(utm_source),
      utm_medium = VALUES(utm_medium),
      utm_campaign = VALUES(utm_campaign),
      device_type = VALUES(device_type),
      browser = VALUES(browser),
      os = VALUES(os),
      created_at_str = VALUES(created_at_str),
      property_id = VALUES(property_id),
      property_name = VALUES(property_name),
      property_image = VALUES(property_image),
      intent = VALUES(intent),
      assigned_agent_id = VALUES(assigned_agent_id),
      assigned_agent_name = VALUES(assigned_agent_name),
      assigned_department = VALUES(assigned_department),
      priority = VALUES(priority),
      sla_due_date = VALUES(sla_due_date),
      status = VALUES(status),
      internal_notes = VALUES(internal_notes),
      tags = VALUES(tags),
      timeline = VALUES(timeline),
      form_responses = VALUES(form_responses),
      converted_lead_id = VALUES(converted_lead_id),
      converted_customer_id = VALUES(converted_customer_id),
      is_trashed = VALUES(is_trashed),
      is_duplicate_of = VALUES(is_duplicate_of),
      updated_at = CURRENT_TIMESTAMP;
  `;

  for (const enq of enquiries) {
    try {
      const tagsStr = JSON.stringify(enq.tags || []);
      const timelineStr = JSON.stringify(enq.timeline || []);
      const formResponsesStr = JSON.stringify(enq.formResponses || {});

      await pool.query(query, [
        enq.id,
        enq.customerName,
        enq.mobile,
        enq.email,
        enq.alternateContact || null,
        enq.companyName || null,
        enq.sourceCategory,
        enq.sourceName,
        enq.formName || null,
        enq.landingPageUrl || null,
        enq.referringUrl || null,
        enq.utmSource || null,
        enq.utmMedium || null,
        enq.utmCampaign || null,
        enq.deviceType || null,
        enq.browser || null,
        enq.os || null,
        enq.createdAt || "",
        enq.propertyId || null,
        enq.propertyName || null,
        enq.propertyImage || null,
        enq.intent || "General Enquiry",
        enq.assignedAgentId || null,
        enq.assignedAgentName || null,
        enq.assignedDepartment || null,
        enq.priority || "Medium",
        enq.slaDueDate || null,
        enq.status || "New",
        enq.internalNotes || null,
        tagsStr,
        timelineStr,
        formResponsesStr,
        enq.convertedLeadId || null,
        enq.convertedCustomerId || null,
        enq.isTrashed ? 1 : 0,
        enq.isDuplicateOf || null
      ]);
      success++;
    } catch (err: any) {
      failed++;
      console.error(`❌ MySQL Phase 5: Failed to migrate central enquiry ${enq.id}:`, err.message);
    }
  }

  return { total: enquiries.length, success, failed };
}
