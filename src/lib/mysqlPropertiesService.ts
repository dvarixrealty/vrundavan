import { getPool } from "./mysqlService.ts";
import { Property } from "../types.ts";

/**
 * Ensures that the properties table exists in the Hostinger MySQL database.
 * If not, it creates it with an optimized schema supporting both individual
 * relational columns and a fallback full object backup (raw_data).
 */
export async function initializePropertiesTable(): Promise<void> {
  const pool = getPool();
  const query = `
    CREATE TABLE IF NOT EXISTS properties (
      id VARCHAR(128) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      type VARCHAR(100) NOT NULL,
      price DECIMAL(15, 2) NOT NULL,
      location VARCHAR(100) NOT NULL,
      beds INT DEFAULT 0,
      baths INT DEFAULT 0,
      sqft INT DEFAULT 0,
      image TEXT,
      images TEXT, -- stored as JSON string
      rating FLOAT DEFAULT 0.0,
      reviews INT DEFAULT 0,
      address TEXT,
      description TEXT,
      featured TINYINT(1) DEFAULT 0,
      amenities TEXT, -- stored as JSON string
      agent TEXT, -- stored as JSON string
      raw_data LONGTEXT, -- full serialized TypeScript Property object
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    console.log("[MySQL Init] Ensuring 'properties' table exists in Hostinger...");
    await pool.query(query);
    console.log("✅ MySQL Init: 'properties' table verified/created successfully.");
  } catch (error: any) {
    console.error("❌ MySQL Init Error: Failed to create or verify 'properties' table.");
    console.error("   Error Message:", error.message || error);
  }
}

/**
 * Saves or updates a property in the MySQL database.
 * Uses a transactional UPSERT style query (INSERT ... ON DUPLICATE KEY UPDATE)
 * to ensure atomicity and prevent duplicates.
 */
export async function savePropertyToMySQL(property: Property): Promise<boolean> {
  const pool = getPool();
  const query = `
    INSERT INTO properties (
      id, title, type, price, location, beds, baths, sqft, 
      image, images, rating, reviews, address, description, 
      featured, amenities, agent, raw_data
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      type = VALUES(type),
      price = VALUES(price),
      location = VALUES(location),
      beds = VALUES(beds),
      baths = VALUES(baths),
      sqft = VALUES(sqft),
      image = VALUES(image),
      images = VALUES(images),
      rating = VALUES(rating),
      reviews = VALUES(reviews),
      address = VALUES(address),
      description = VALUES(description),
      featured = VALUES(featured),
      amenities = VALUES(amenities),
      agent = VALUES(agent),
      raw_data = VALUES(raw_data),
      updated_at = CURRENT_TIMESTAMP;
  `;

  try {
    const imagesStr = JSON.stringify(property.images || []);
    const amenitiesStr = JSON.stringify(property.amenities || []);
    const agentStr = JSON.stringify(property.agent || null);
    const rawDataStr = JSON.stringify(property);

    await pool.query(query, [
      property.id,
      property.title,
      property.type,
      property.price,
      property.location,
      property.beds || 0,
      property.baths || 0,
      property.sqft || 0,
      property.image || "",
      imagesStr,
      property.rating || 0.0,
      property.reviews || 0,
      property.address || "",
      property.description || "",
      property.featured ? 1 : 0,
      amenitiesStr,
      agentStr,
      rawDataStr
    ]);

    console.log(`✅ MySQL Save: Successfully upserted property ID: ${property.id}`);
    return true;
  } catch (error: any) {
    console.error(`❌ MySQL Save Error: Failed to upsert property ID: ${property.id}`);
    console.error("   Error Message:", error.message || error);
    return false;
  }
}

/**
 * Deletes a property from the MySQL database by its ID.
 */
export async function deletePropertyFromMySQL(propertyId: string): Promise<boolean> {
  const pool = getPool();
  const query = `DELETE FROM properties WHERE id = ?`;

  try {
    await pool.query(query, [propertyId]);
    console.log(`✅ MySQL Delete: Successfully deleted property ID: ${propertyId}`);
    return true;
  } catch (error: any) {
    console.error(`❌ MySQL Delete Error: Failed to delete property ID: ${propertyId}`);
    console.error("   Error Message:", error.message || error);
    return false;
  }
}

/**
 * Fetches all properties from the MySQL database.
 * Uses the complete raw_data fallback or reconstructs from columns if raw_data is missing.
 */
export async function getPropertiesFromMySQL(): Promise<Property[]> {
  const pool = getPool();
  const query = `SELECT * FROM properties ORDER BY created_at DESC`;

  try {
    const [rows]: any = await pool.query(query);
    const list: Property[] = [];

    for (const row of rows) {
      if (row.raw_data) {
        try {
          const parsed = JSON.parse(row.raw_data) as Property;
          list.push(parsed);
          continue;
        } catch {
          // Fallback to standard columns if parsing fails
        }
      }

      // Reconstruct from individual columns if no raw_data is present
      list.push({
        id: row.id,
        title: row.title,
        type: row.type,
        price: Number(row.price),
        location: row.location,
        beds: row.beds,
        baths: row.baths,
        sqft: row.sqft,
        image: row.image,
        images: row.images ? JSON.parse(row.images) : [],
        rating: row.rating,
        reviews: row.reviews,
        address: row.address,
        description: row.description,
        featured: Boolean(row.featured),
        amenities: row.amenities ? JSON.parse(row.amenities) : [],
        agent: row.agent ? JSON.parse(row.agent) : { name: "", role: "", avatar: "", phone: "", email: "" }
      });
    }

    return list;
  } catch (error: any) {
    console.error("❌ MySQL Get Error: Failed to fetch properties from Hostinger MySQL.");
    console.error("   Error Message:", error.message || error);
    return [];
  }
}

/**
 * Migrates a list of Firestore properties to the MySQL database.
 * Returns migration statistics.
 */
export async function migrateProperties(properties: Property[]): Promise<{
  total: number;
  success: number;
  failed: number;
}> {
  console.log(`[MySQL Migration] Starting bulk migration of ${properties.length} properties...`);
  await initializePropertiesTable();

  let successCount = 0;
  let failedCount = 0;

  for (const property of properties) {
    const success = await savePropertyToMySQL(property);
    if (success) {
      successCount++;
    } else {
      failedCount++;
    }
  }

  console.log(`[MySQL Migration] Completed: Total=${properties.length}, Success=${successCount}, Failed=${failedCount}`);
  return {
    total: properties.length,
    success: successCount,
    failed: failedCount
  };
}
