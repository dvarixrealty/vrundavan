import { getPool } from "./mysqlService.ts";
import fs from "fs";
import path from "path";

export interface MediaItem {
  id: string;
  title: string;
  seo_filename: string;
  slug: string;
  alt_text: string | null;
  caption: string | null;
  description: string | null;
  keywords: string | null;
  folder: string;
  category: string;
  width: number | null;
  height: number | null;
  aspect_ratio: string | null;
  format: string | null;
  file_size: number;
  storage_path: string;
  public_url: string;
  thumbnail_url: string | null;
  medium_url: string | null;
  large_url: string | null;
  original_url: string | null;
  uploaded_by: string | null;
  status: string;
  usage_count: number;
  relative_path?: string | null;
  last_used_at?: string | null;
  favorite?: number; // 0 or 1
  seo_slug?: string | null;
  canonical_filename?: string | null;
  hash?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Initializes the media_items table in MySQL.
 */
export async function initializeMediaTable(): Promise<void> {
  const pool = getPool();
  const query = `
    CREATE TABLE IF NOT EXISTS media_items (
      id VARCHAR(128) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      seo_filename VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      alt_text VARCHAR(255) DEFAULT NULL,
      caption TEXT DEFAULT NULL,
      description TEXT DEFAULT NULL,
      keywords VARCHAR(255) DEFAULT NULL,
      folder VARCHAR(100) NOT NULL,
      category VARCHAR(100) NOT NULL,
      width INT DEFAULT NULL,
      height INT DEFAULT NULL,
      aspect_ratio VARCHAR(50) DEFAULT NULL,
      format VARCHAR(50) DEFAULT NULL,
      file_size BIGINT NOT NULL,
      storage_path VARCHAR(512) NOT NULL,
      public_url VARCHAR(512) NOT NULL,
      thumbnail_url VARCHAR(512) DEFAULT NULL,
      medium_url VARCHAR(512) DEFAULT NULL,
      large_url VARCHAR(512) DEFAULT NULL,
      original_url VARCHAR(512) DEFAULT NULL,
      uploaded_by VARCHAR(100) DEFAULT NULL,
      status VARCHAR(50) DEFAULT 'Active',
      usage_count INT DEFAULT 0,
      relative_path VARCHAR(512) DEFAULT NULL,
      last_used_at TIMESTAMP DEFAULT NULL NULL,
      favorite TINYINT DEFAULT 0,
      seo_slug VARCHAR(255) DEFAULT NULL,
      canonical_filename VARCHAR(255) DEFAULT NULL,
      hash VARCHAR(128) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_folder (folder),
      INDEX idx_category (category),
      INDEX idx_seo_filename (seo_filename),
      INDEX idx_favorite (favorite)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    console.log("[MySQL Media Init] Ensuring 'media_items' table exists...");
    await pool.query(query);
    console.log("✅ MySQL Media Init: 'media_items' table verified/created successfully.");

    // Graceful column upgrade for existing tables to support extended DAM fields
    const alterQueries = [
      "ALTER TABLE media_items ADD COLUMN relative_path VARCHAR(512) DEFAULT NULL",
      "ALTER TABLE media_items ADD COLUMN last_used_at TIMESTAMP DEFAULT NULL NULL",
      "ALTER TABLE media_items ADD COLUMN favorite TINYINT DEFAULT 0",
      "ALTER TABLE media_items ADD COLUMN seo_slug VARCHAR(255) DEFAULT NULL",
      "ALTER TABLE media_items ADD COLUMN canonical_filename VARCHAR(255) DEFAULT NULL",
      "ALTER TABLE media_items ADD COLUMN hash VARCHAR(128) DEFAULT NULL",
      "ALTER TABLE media_items ADD COLUMN original_filename VARCHAR(255) DEFAULT NULL",
      "ALTER TABLE media_items ADD COLUMN stored_filename VARCHAR(255) DEFAULT NULL",
      "ALTER TABLE media_items ADD COLUMN mime_type VARCHAR(100) DEFAULT NULL",
      "ALTER TABLE media_items ADD COLUMN filesize BIGINT DEFAULT NULL",
      "ALTER TABLE media_items ADD COLUMN optimization_status VARCHAR(50) DEFAULT 'Optimized'"
    ];

    for (const alter of alterQueries) {
      try {
        await pool.query(alter);
      } catch (e: any) {
        // Safe to ignore "Duplicate column" error
      }
    }
    console.log("✅ MySQL Media Init: Extended columns checked and updated successfully.");

    // Ensure categories table exists
    const createCategoriesQuery = `
      CREATE TABLE IF NOT EXISTS media_categories (
        id VARCHAR(128) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        folder_name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        icon VARCHAR(100) DEFAULT NULL,
        color VARCHAR(50) DEFAULT NULL,
        status VARCHAR(50) DEFAULT 'Active',
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.query(createCategoriesQuery);
    console.log("✅ MySQL Media Init: 'media_categories' table verified/created.");

    // Ensure folders table exists
    const createFoldersQuery = `
      CREATE TABLE IF NOT EXISTS media_folders (
        id VARCHAR(128) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        path VARCHAR(512) NOT NULL UNIQUE,
        parent_id VARCHAR(128) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.query(createFoldersQuery);
    console.log("✅ MySQL Media Init: 'media_folders' table verified/created.");

    // Seed default categories if empty
    const [catRows]: any = await pool.query("SELECT COUNT(*) as count FROM media_categories");
    if (catRows[0].count === 0) {
      console.log("[MySQL Media Init] Seeding default categories...");
      const defaultCats = [
        { id: "mc-1", name: "Apartments", folder_name: "properties", description: "Apartment property listings", icon: "Home", color: "#C89B3C", display_order: 1 },
        { id: "mc-2", name: "Villas", folder_name: "properties", description: "Villa property listings", icon: "Landmark", color: "#C89B3C", display_order: 2 },
        { id: "mc-3", name: "Commercial", folder_name: "properties", description: "Commercial property listings", icon: "Building2", color: "#C89B3C", display_order: 3 },
        { id: "mc-4", name: "Lands", folder_name: "properties", description: "Land property listings", icon: "Compass", color: "#C89B3C", display_order: 4 },
        { id: "mc-5", name: "Logos", folder_name: "logos", description: "Company branding & logo assets", icon: "Palette", color: "#3B82F6", display_order: 5 },
        { id: "mc-6", name: "Portraits", folder_name: "agents", description: "Agent photos & portraits", icon: "Users", color: "#10B981", display_order: 6 },
        { id: "mc-7", name: "Marketing", folder_name: "banners", description: "Marketing campaign banners", icon: "Megaphone", color: "#F59E0B", display_order: 7 },
        { id: "mc-8", name: "Banners", folder_name: "banners", description: "Website banners & headers", icon: "Image", color: "#EC4899", display_order: 8 },
        { id: "mc-9", name: "Uncategorized", folder_name: "documents", description: "Uncategorized documents & general files", icon: "File", color: "#6B7280", display_order: 9 }
      ];

      for (const cat of defaultCats) {
        await pool.query(
          `INSERT INTO media_categories (id, name, folder_name, description, icon, color, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [cat.id, cat.name, cat.folder_name, cat.description, cat.icon, cat.color, cat.display_order]
        );
      }
    }

    // Seed default folders if empty
    const [foldRows]: any = await pool.query("SELECT COUNT(*) as count FROM media_folders");
    if (foldRows[0].count === 0) {
      console.log("[MySQL Media Init] Seeding default folders...");
      const defaultFolders = [
        { id: "mf-1", name: "properties", path: "properties" },
        { id: "mf-2", name: "logos", path: "logos" },
        { id: "mf-3", name: "blogs", path: "blogs" },
        { id: "mf-4", name: "banners", path: "banners" },
        { id: "mf-5", name: "agents", path: "agents" },
        { id: "mf-6", name: "customers", path: "customers" },
        { id: "mf-7", name: "documents", path: "documents" },
        { id: "mf-8", name: "testimonials", path: "testimonials" },
        { id: "mf-9", name: "projects", path: "projects" },
        { id: "mf-10", name: "future", path: "future" }
      ];

      for (const fold of defaultFolders) {
        await pool.query(
          `INSERT INTO media_folders (id, name, path) VALUES (?, ?, ?)`,
          [fold.id, fold.name, fold.path]
        );
        // Ensure directory physically exists on disk
        const dirPath = path.join(process.cwd(), "uploads", fold.path);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
      }
    }

  } catch (error: any) {
    console.error("❌ MySQL Media Init Error: Failed to create/verify tables.");
    console.error("   Error Message:", error.message || error);
  }
}

/**
 * Fetches all media items from the database.
 */
export async function getMediaItems(): Promise<MediaItem[]> {
  const pool = getPool();
  const query = `SELECT * FROM media_items ORDER BY created_at DESC`;
  try {
    const [rows]: any = await pool.query(query);
    return rows as MediaItem[];
  } catch (error: any) {
    console.error("❌ getMediaItems Error:", error.message || error);
    return [];
  }
}

/**
 * Saves a new media item to the database.
 */
export async function saveMediaItem(item: any): Promise<boolean> {
  const pool = getPool();
  const query = `
    INSERT INTO media_items (
      id, title, seo_filename, slug, alt_text, caption, description, keywords,
      folder, category, width, height, aspect_ratio, format, file_size,
      storage_path, public_url, thumbnail_url, medium_url, large_url, original_url,
      uploaded_by, status, usage_count, relative_path, last_used_at, favorite,
      seo_slug, canonical_filename, hash, original_filename, stored_filename, mime_type, filesize, optimization_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      seo_filename = VALUES(seo_filename),
      slug = VALUES(slug),
      alt_text = VALUES(alt_text),
      caption = VALUES(caption),
      description = VALUES(description),
      keywords = VALUES(keywords),
      folder = VALUES(folder),
      category = VALUES(category),
      width = VALUES(width),
      height = VALUES(height),
      aspect_ratio = VALUES(aspect_ratio),
      format = VALUES(format),
      file_size = VALUES(file_size),
      storage_path = VALUES(storage_path),
      public_url = VALUES(public_url),
      thumbnail_url = VALUES(thumbnail_url),
      medium_url = VALUES(medium_url),
      large_url = VALUES(large_url),
      original_url = VALUES(original_url),
      uploaded_by = VALUES(uploaded_by),
      status = VALUES(status),
      usage_count = VALUES(usage_count),
      relative_path = VALUES(relative_path),
      last_used_at = VALUES(last_used_at),
      favorite = VALUES(favorite),
      seo_slug = VALUES(seo_slug),
      canonical_filename = VALUES(canonical_filename),
      hash = VALUES(hash),
      original_filename = VALUES(original_filename),
      stored_filename = VALUES(stored_filename),
      mime_type = VALUES(mime_type),
      filesize = VALUES(filesize),
      optimization_status = VALUES(optimization_status),
      updated_at = CURRENT_TIMESTAMP;
  `;

  try {
    await pool.query(query, [
      item.id,
      item.title,
      item.seo_filename,
      item.slug,
      item.alt_text || null,
      item.caption || null,
      item.description || null,
      item.keywords || null,
      item.folder,
      item.category,
      item.width || null,
      item.height || null,
      item.aspect_ratio || null,
      item.format || null,
      item.file_size,
      item.storage_path,
      item.public_url,
      item.thumbnail_url || null,
      item.medium_url || null,
      item.large_url || null,
      item.original_url || null,
      item.uploaded_by || null,
      item.status || "Active",
      item.usage_count || 0,
      item.relative_path || null,
      item.last_used_at || null,
      item.favorite || 0,
      item.seo_slug || null,
      item.canonical_filename || null,
      item.hash || null,
      item.original_filename || null,
      item.stored_filename || null,
      item.mime_type || null,
      item.filesize || null,
      item.optimization_status || "Optimized"
    ]);
    return true;
  } catch (error: any) {
    console.error("❌ saveMediaItem Error:", error.message || error);
    return false;
  }
}

/**
 * Renames the slug of an existing media item and updates all references in other tables.
 */
export async function renameMediaAsset(
  id: string,
  newSlug: string
): Promise<{ success: boolean; error?: string; updatedItem?: MediaItem }> {
  const pool = getPool();
  try {
    // 1. Fetch current media item
    const [rows]: any = await pool.query(`SELECT * FROM media_items WHERE id = ?`, [id]);
    if (rows.length === 0) {
      return { success: false, error: "Asset not found" };
    }
    const currentItem = rows[0] as MediaItem;

    // 2. Normalize slug
    let cleanSlug = newSlug
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    if (!cleanSlug) {
      return { success: false, error: "Invalid slug name" };
    }

    // If slug hasn't changed, return early
    if (currentItem.slug === cleanSlug) {
      return { success: true, updatedItem: currentItem };
    }

    const fs = await import("fs");
    const path = await import("path");

    // Get old extension
    const oldFilename = currentItem.seo_filename; // e.g. luxury-villa.webp
    const lastDot = oldFilename.lastIndexOf(".");
    const ext = lastDot !== -1 ? oldFilename.substring(lastDot).toLowerCase() : ".webp";

    // 3. Resolve potential collision
    const folder = currentItem.folder;
    const destPath = path.join(process.cwd(), "uploads", folder);
    let finalBaseSlug = cleanSlug;
    let finalFilename = `${finalBaseSlug}${ext}`;
    let counter = 1;

    // Check if filename exists on disk or if slug exists in DB for other items
    while (
      fs.existsSync(path.join(destPath, finalFilename)) ||
      (await pool.query(`SELECT id FROM media_items WHERE slug = ? AND folder = ? AND id != ?`, [finalBaseSlug, folder, id]).then(([r]: any) => r.length > 0))
    ) {
      finalBaseSlug = `${cleanSlug}-${counter}`;
      finalFilename = `${finalBaseSlug}${ext}`;
      counter++;
    }

    // 4. Rename the files on disk
    // Suffixes for sub-sized responsive WebP versions
    const suffixes = ["", "-thumb", "-medium", "-large"];
    for (const suffix of suffixes) {
      const oldSubFilename = `${currentItem.slug}${suffix}${ext}`;
      const oldSubPath = path.join(destPath, oldSubFilename);
      if (fs.existsSync(oldSubPath)) {
        const newSubFilename = `${finalBaseSlug}${suffix}${ext}`;
        const newSubPath = path.join(destPath, newSubFilename);
        fs.renameSync(oldSubPath, newSubPath);
      }
    }

    // 5. Calculate new paths and URLs
    const newStoragePath = `uploads/${folder}/${finalFilename}`.replace(/\\/g, "/");
    const newRelativePath = `/uploads/${folder}/${finalFilename}`.replace(/\\/g, "/");
    
    // Parse old and new URLs to do replaces in database references
    const oldRelativeUrl = currentItem.relative_path || `/uploads/${folder}/${oldFilename}`;
    const newRelativeUrl = newRelativePath;

    const oldPublicUrl = currentItem.public_url;
    // Replace old relative url with new relative url inside the public url
    const newPublicUrl = oldPublicUrl.replace(oldRelativeUrl, newRelativeUrl);

    // Sub-sized URLs recalculation
    const getNewSubUrl = (oldUrl: string | null, suffix: string) => {
      if (!oldUrl) return null;
      return oldUrl.replace(`${currentItem.slug}${suffix}`, `${finalBaseSlug}${suffix}`);
    };

    const newThumbnailUrl = getNewSubUrl(currentItem.thumbnail_url, "-thumb");
    const newMediumUrl = getNewSubUrl(currentItem.medium_url, "-medium");
    const newLargeUrl = getNewSubUrl(currentItem.large_url, "-large");
    const newOriginalUrl = getNewSubUrl(currentItem.original_url, "");

    // 6. Update the database record
    const updateQuery = `
      UPDATE media_items 
      SET 
        seo_filename = ?,
        slug = ?,
        seo_slug = ?,
        canonical_filename = ?,
        storage_path = ?,
        public_url = ?,
        thumbnail_url = ?,
        medium_url = ?,
        large_url = ?,
        original_url = ?,
        relative_path = ?,
        stored_filename = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await pool.query(updateQuery, [
      finalFilename,
      finalBaseSlug,
      finalBaseSlug,
      finalFilename,
      newStoragePath,
      newPublicUrl,
      newThumbnailUrl,
      newMediumUrl,
      newLargeUrl,
      newOriginalUrl,
      newRelativeUrl,
      finalFilename,
      id
    ]);

    // 7. Scan and update all MySQL database references to maintain integrity
    // We update references of both public_url and relative_path

    // A. Properties
    // update primary image if matches public or relative URL
    await pool.query(`UPDATE properties SET image = ? WHERE image = ? OR image = ?`, [newPublicUrl, oldPublicUrl, oldRelativeUrl]);
    // update JSON list 'images' and raw_data
    await pool.query(`UPDATE properties SET images = REPLACE(images, ?, ?) WHERE images LIKE ?`, [oldPublicUrl, newPublicUrl, `%${oldPublicUrl}%`]);
    await pool.query(`UPDATE properties SET images = REPLACE(images, ?, ?) WHERE images LIKE ?`, [oldRelativeUrl, newRelativeUrl, `%${oldRelativeUrl}%`]);
    await pool.query(`UPDATE properties SET raw_data = REPLACE(raw_data, ?, ?) WHERE raw_data LIKE ?`, [oldPublicUrl, newPublicUrl, `%${oldPublicUrl}%`]);
    await pool.query(`UPDATE properties SET raw_data = REPLACE(raw_data, ?, ?) WHERE raw_data LIKE ?`, [oldRelativeUrl, newRelativeUrl, `%${oldRelativeUrl}%`]);

    // B. Agents
    await pool.query(`UPDATE agents SET avatar = ? WHERE avatar = ? OR avatar = ?`, [newPublicUrl, oldPublicUrl, oldRelativeUrl]);

    // C. Hero Banners
    await pool.query(`UPDATE hero_banners SET desktop_image = ? WHERE desktop_image = ? OR desktop_image = ?`, [newPublicUrl, oldPublicUrl, oldRelativeUrl]);
    await pool.query(`UPDATE hero_banners SET mobile_image = ? WHERE mobile_image = ? OR mobile_image = ?`, [newPublicUrl, oldPublicUrl, oldRelativeUrl]);

    // D. Categories
    await pool.query(`UPDATE categories SET image = ? WHERE image = ? OR image = ?`, [newPublicUrl, oldPublicUrl, oldRelativeUrl]);

    // E. Site CMS Config
    await pool.query(`UPDATE site_cms_config SET config = REPLACE(config, ?, ?) WHERE config LIKE ?`, [oldPublicUrl, newPublicUrl, `%${oldPublicUrl}%`]);
    await pool.query(`UPDATE site_cms_config SET config = REPLACE(config, ?, ?) WHERE config LIKE ?`, [oldRelativeUrl, newRelativeUrl, `%${oldRelativeUrl}%`]);

    // Fetch the updated item
    const [updatedRows]: any = await pool.query(`SELECT * FROM media_items WHERE id = ?`, [id]);
    return { success: true, updatedItem: updatedRows[0] as MediaItem };

  } catch (error: any) {
    console.error("❌ renameMediaAsset Error:", error.message || error);
    return { success: false, error: error.message || "Unknown error during rename" };
  }
}

/**
 * Updates metadata of an existing media item.
 */
export async function updateMediaItemMetadata(
  id: string,
  metadata: Partial<MediaItem>
): Promise<boolean> {
  const pool = getPool();
  
  // Dynamically build SET clause
  const fields: string[] = [];
  const values: any[] = [];
  
  Object.entries(metadata).forEach(([key, val]) => {
    // Avoid updating system read-only fields here
    if (key !== "id" && key !== "created_at" && key !== "updated_at") {
      fields.push(`${key} = ?`);
      values.push(val);
    }
  });

  if (fields.length === 0) return true;

  const query = `UPDATE media_items SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  values.push(id);

  try {
    await pool.query(query, values);
    return true;
  } catch (error: any) {
    console.error("❌ updateMediaItemMetadata Error:", error.message || error);
    return false;
  }
}

/**
 * Deletes a media item from the database.
 */
export async function deleteMediaItem(id: string): Promise<boolean> {
  const pool = getPool();
  const query = `DELETE FROM media_items WHERE id = ?`;
  try {
    await pool.query(query, [id]);
    return true;
  } catch (error: any) {
    console.error("❌ deleteMediaItem Error:", error.message || error);
    return false;
  }
}

/**
 * Scans MySQL tables to find where a specific image URL is utilized.
 */
export async function findUsageOfImage(publicUrl: string): Promise<string[]> {
  const pool = getPool();
  const usages: string[] = [];

  // Decode URI just in case
  let decodedUrl = publicUrl;
  try {
    decodedUrl = decodeURIComponent(publicUrl);
  } catch { /* ignore */ }

  const urlFilename = decodedUrl.substring(decodedUrl.lastIndexOf("/") + 1);

  // 1. Properties Table
  try {
    const [rows]: any = await pool.query(
      `SELECT id, title, image, images FROM properties`
    );
    for (const r of rows) {
      const mainImageMatch = r.image && (r.image.includes(decodedUrl) || r.image.includes(urlFilename));
      let galleryMatch = false;
      if (r.images) {
        try {
          const gallery = typeof r.images === "string" ? JSON.parse(r.images) : r.images;
          if (Array.isArray(gallery)) {
            galleryMatch = gallery.some((img: string) => img && (img.includes(decodedUrl) || img.includes(urlFilename)));
          }
        } catch { /* ignore */ }
      }
      if (mainImageMatch || galleryMatch) {
        usages.push(`Property: ${r.title} (ID: ${r.id})`);
      }
    }
  } catch (err: any) {
    console.warn("Usage search properties error:", err.message);
  }

  // 2. Agents Table
  try {
    const [rows]: any = await pool.query(
      `SELECT id, name, avatar FROM agents`
    );
    for (const r of rows) {
      if (r.avatar && (r.avatar.includes(decodedUrl) || r.avatar.includes(urlFilename))) {
        usages.push(`Agent Avatar: ${r.name} (ID: ${r.id})`);
      }
    }
  } catch (err: any) {
    console.warn("Usage search agents error:", err.message);
  }

  // 3. Hero Banners Table
  try {
    const [rows]: any = await pool.query(
      `SELECT id, headline, desktop_image, mobile_image FROM hero_banners`
    );
    for (const r of rows) {
      const desktopMatch = r.desktop_image && (r.desktop_image.includes(decodedUrl) || r.desktop_image.includes(urlFilename));
      const mobileMatch = r.mobile_image && (r.mobile_image.includes(decodedUrl) || r.mobile_image.includes(urlFilename));
      if (desktopMatch || mobileMatch) {
        usages.push(`Hero Banner: ${r.headline || "Banner"} (ID: ${r.id})`);
      }
    }
  } catch (err: any) {
    console.warn("Usage search hero banners error:", err.message);
  }

  // 4. Categories Table
  try {
    const [rows]: any = await pool.query(
      `SELECT id, title, image FROM categories`
    );
    for (const r of rows) {
      if (r.image && (r.image.includes(decodedUrl) || r.image.includes(urlFilename))) {
        usages.push(`Category Image: ${r.title} (ID: ${r.id})`);
      }
    }
  } catch (err: any) {
    console.warn("Usage search categories error:", err.message);
  }

  // 5. Site CMS Config Table
  try {
    const [rows]: any = await pool.query(
      `SELECT section_id, config FROM site_cms_config`
    );
    for (const r of rows) {
      if (r.config && r.config.includes(urlFilename)) {
        usages.push(`Site CMS Layout Section: ${r.section_id}`);
      }
    }
  } catch (err: any) {
    console.warn("Usage search site cms config error:", err.message);
  }

  return usages;
}

/**
 * Gets a list of files inside the `uploads/` folder and its subfolders to populate file lists.
 */
export async function getExistingMediaFilenames(folder: string): Promise<string[]> {
  const pool = getPool();
  const query = `SELECT seo_filename FROM media_items WHERE folder = ?`;
  try {
    const [rows]: any = await pool.query(query, [folder]);
    return rows.map((r: any) => r.seo_filename);
  } catch (error: any) {
    console.error("❌ getExistingMediaFilenames Error:", error.message || error);
    return [];
  }
}
