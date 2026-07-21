import { getPool } from "./mysqlService.ts";

/**
 * Initializes MySQL tables for Phase 6 modules:
 * - categories (Property Categories)
 * - search_categories (Search Categories)
 * - seo_configs (SEO Configurations)
 * - property_seo_configs (Property-specific SEO Configurations)
 * - seo_redirect_rules (SEO Redirect Rules)
 * - site_cms_config (Site CMS Configuration)
 * - hero_banners (Hero Banners)
 * - faqs (FAQs)
 * - quick_filters (Quick Filters)
 * - routing_rules (Routing Rules)
 * - settings (Generic configuration/settings collection mapping settings/{docId})
 * - theme_presets (Global / admin application themes and theme presets)
 */
export async function initializePhase6Tables(): Promise<void> {
  const pool = getPool();

  const createCategoriesTable = `
    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(128) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      icon_name VARCHAR(100),
      display_order INT DEFAULT 0,
      status VARCHAR(50) DEFAULT 'Active',
      show_in_view TINYINT(1) DEFAULT 1,
      redirect_url TEXT,
      image TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createSearchCategoriesTable = `
    CREATE TABLE IF NOT EXISTS search_categories (
      id VARCHAR(128) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      icon_name VARCHAR(100),
      display_order INT DEFAULT 0,
      status VARCHAR(50) DEFAULT 'Active',
      show_in_view TINYINT(1) DEFAULT 1,
      is_default TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createSeoConfigsTable = `
    CREATE TABLE IF NOT EXISTS seo_configs (
      id VARCHAR(128) PRIMARY KEY,
      page_name VARCHAR(255) NOT NULL,
      url_slug VARCHAR(255) NOT NULL,
      meta_title VARCHAR(255),
      meta_description TEXT,
      meta_keywords TEXT,
      canonical_url TEXT,
      robots_index TINYINT(1) DEFAULT 1,
      robots_follow TINYINT(1) DEFAULT 1,
      og_title VARCHAR(255),
      og_description TEXT,
      og_image TEXT,
      twitter_title VARCHAR(255),
      twitter_description TEXT,
      twitter_image TEXT,
      last_updated VARCHAR(100),
      score INT DEFAULT 0,
      robots_meta TEXT,
      schema_markup LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createPropertySeoConfigsTable = `
    CREATE TABLE IF NOT EXISTS property_seo_configs (
      id VARCHAR(128) PRIMARY KEY,
      url_slug VARCHAR(255) NOT NULL,
      meta_title VARCHAR(255),
      meta_description TEXT,
      canonical_url TEXT,
      robots_meta TEXT,
      schema_markup LONGTEXT,
      og_title VARCHAR(255),
      og_description TEXT,
      og_image TEXT,
      last_updated VARCHAR(100),
      config LONGTEXT, -- Stores the complete original payload as fallback
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createSeoRedirectRulesTable = `
    CREATE TABLE IF NOT EXISTS seo_redirect_rules (
      id VARCHAR(128) PRIMARY KEY,
      from_url TEXT NOT NULL,
      to_url TEXT NOT NULL,
      type VARCHAR(10) DEFAULT '301',
      date_added VARCHAR(100),
      clicks INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createSiteCmsConfigTable = `
    CREATE TABLE IF NOT EXISTS site_cms_config (
      id VARCHAR(128) PRIMARY KEY,
      business_name VARCHAR(255),
      whatsapp_number VARCHAR(100),
      currency VARCHAR(50),
      email VARCHAR(255),
      phone VARCHAR(100),
      address TEXT,
      facebook_url TEXT,
      instagram_url TEXT,
      linkedin_url TEXT,
      twitter_url TEXT,
      hero_badge VARCHAR(255),
      hero_badge_highlight VARCHAR(255),
      hero_headline1 TEXT,
      hero_headline2_highlight TEXT,
      hero_subheading TEXT,
      hero_bg_image TEXT,
      hero_button_text VARCHAR(255),
      config LONGTEXT, -- Stores full nested settings (testimonials, blogs, footer, services etc)
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createHeroBannersTable = `
    CREATE TABLE IF NOT EXISTS hero_banners (
      id VARCHAR(128) PRIMARY KEY,
      headline VARCHAR(255) NOT NULL,
      subheading VARCHAR(255),
      description TEXT,
      badge_text VARCHAR(255),
      property_count_badge VARCHAR(255),
      desktop_image_method VARCHAR(50),
      desktop_image LONGTEXT,
      mobile_image_method VARCHAR(50),
      mobile_image LONGTEXT,
      tablet_image LONGTEXT,
      primary_button_config TEXT, -- JSON
      secondary_button_config TEXT, -- JSON
      primary_button_text VARCHAR(255),
      primary_button_url TEXT,
      secondary_button_text VARCHAR(255),
      secondary_button_url TEXT,
      display_order INT DEFAULT 0,
      status VARCHAR(50) DEFAULT 'Active',
      enabled TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createFaqsTable = `
    CREATE TABLE IF NOT EXISTS faqs (
      id VARCHAR(128) PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category VARCHAR(255),
      display_order INT DEFAULT 0,
      status VARCHAR(50) DEFAULT 'Active',
      featured TINYINT(1) DEFAULT 0,
      last_updated VARCHAR(100),
      show_on_homepage TINYINT(1) DEFAULT 0,
      homepage_order INT DEFAULT 0,
      homepage_status VARCHAR(50),
      published TINYINT(1) DEFAULT 1,
      homepage_visible TINYINT(1) DEFAULT 1,
      created_at_str VARCHAR(100),
      updated_at_str VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createQuickFiltersTable = `
    CREATE TABLE IF NOT EXISTS quick_filters (
      id VARCHAR(128) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createRoutingRulesTable = `
    CREATE TABLE IF NOT EXISTS routing_rules (
      id VARCHAR(128) PRIMARY KEY,
      source_category VARCHAR(255) NOT NULL,
      target_department VARCHAR(255) NOT NULL,
      target_agent_id VARCHAR(128),
      target_agent_name VARCHAR(255),
      priority VARCHAR(50) DEFAULT 'Medium',
      sla_days INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createSettingsTable = `
    CREATE TABLE IF NOT EXISTS settings (
      key_name VARCHAR(128) PRIMARY KEY,
      value LONGTEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createThemePresetsTable = `
    CREATE TABLE IF NOT EXISTS theme_presets (
      theme_id VARCHAR(128) PRIMARY KEY,
      value LONGTEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    console.log("[MySQL Init Phase 6] Initializing table definitions...");
    await pool.query(createCategoriesTable);
    console.log("   - Table 'categories' created successfully.");

    await pool.query(createSearchCategoriesTable);
    console.log("   - Table 'search_categories' created successfully.");

    await pool.query(createSeoConfigsTable);
    console.log("   - Table 'seo_configs' created successfully.");

    await pool.query(createPropertySeoConfigsTable);
    console.log("   - Table 'property_seo_configs' created successfully.");

    await pool.query(createSeoRedirectRulesTable);
    console.log("   - Table 'seo_redirect_rules' created successfully.");

    await pool.query(createSiteCmsConfigTable);
    console.log("   - Table 'site_cms_config' created successfully.");

    await pool.query(createHeroBannersTable);
    console.log("   - Table 'hero_banners' created successfully.");

    await pool.query(createFaqsTable);
    console.log("   - Table 'faqs' created successfully.");

    await pool.query(createQuickFiltersTable);
    console.log("   - Table 'quick_filters' created successfully.");

    await pool.query(createRoutingRulesTable);
    console.log("   - Table 'routing_rules' created successfully.");

    await pool.query(createSettingsTable);
    console.log("   - Table 'settings' created successfully.");

    await pool.query(createThemePresetsTable);
    console.log("   - Table 'theme_presets' created successfully.");

    console.log("✅ MySQL Init Phase 6: All Phase 6 tables initialized successfully.");
  } catch (error: any) {
    console.error("❌ MySQL Init Phase 6 Error: Table initialization failed.");
    console.error("   Error Details:", error.message || error);
    throw error;
  }
}

/**
 * Migrates Property Categories (categories collection) using transactional upserts.
 */
export async function migrateCategories(categories: any[]): Promise<{ total: number; success: number; failed: number }> {
  const pool = getPool();
  let success = 0;
  let failed = 0;

  const query = `
    INSERT INTO categories (id, title, description, icon_name, display_order, status, show_in_view, redirect_url, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      description = VALUES(description),
      icon_name = VALUES(icon_name),
      display_order = VALUES(display_order),
      status = VALUES(status),
      show_in_view = VALUES(show_in_view),
      redirect_url = VALUES(redirect_url),
      image = VALUES(image),
      updated_at = CURRENT_TIMESTAMP;
  `;

  for (const cat of categories) {
    try {
      await pool.query(query, [
        cat.id,
        cat.title || "",
        cat.description || "",
        cat.iconName || "",
        cat.displayOrder !== undefined ? Number(cat.displayOrder) : 0,
        cat.status || "Active",
        cat.showInView !== false ? 1 : 0,
        cat.redirectUrl || "",
        cat.image || ""
      ]);
      success++;
    } catch (err: any) {
      failed++;
      console.error(`❌ MySQL Phase 6: Failed to migrate property category ${cat.id}:`, err.message);
    }
  }

  return { total: categories.length, success, failed };
}

/**
 * Migrates Search Categories (search_categories collection) using transactional upserts.
 */
export async function migrateSearchCategories(searchCategories: any[]): Promise<{ total: number; success: number; failed: number }> {
  const pool = getPool();
  let success = 0;
  let failed = 0;

  const query = `
    INSERT INTO search_categories (id, title, icon_name, display_order, status, show_in_view, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      icon_name = VALUES(icon_name),
      display_order = VALUES(display_order),
      status = VALUES(status),
      show_in_view = VALUES(show_in_view),
      is_default = VALUES(is_default),
      updated_at = CURRENT_TIMESTAMP;
  `;

  for (const scat of searchCategories) {
    try {
      await pool.query(query, [
        scat.id,
        scat.title || "",
        scat.iconName || "",
        scat.displayOrder !== undefined ? Number(scat.displayOrder) : 0,
        scat.status || "Active",
        scat.showInView !== false ? 1 : 0,
        scat.isDefault ? 1 : 0
      ]);
      success++;
    } catch (err: any) {
      failed++;
      console.error(`❌ MySQL Phase 6: Failed to migrate search category ${scat.id}:`, err.message);
    }
  }

  return { total: searchCategories.length, success, failed };
}

/**
 * Migrates SEO Configurations (seo_configs collection) using transactional upserts.
 */
export async function migrateSeoConfigs(seoConfigs: any[]): Promise<{ total: number; success: number; failed: number }> {
  const pool = getPool();
  let success = 0;
  let failed = 0;

  const query = `
    INSERT INTO seo_configs (
      id, page_name, url_slug, meta_title, meta_description, meta_keywords, canonical_url,
      robots_index, robots_follow, og_title, og_description, og_image,
      twitter_title, twitter_description, twitter_image, last_updated, score, robots_meta, schema_markup
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      page_name = VALUES(page_name),
      url_slug = VALUES(url_slug),
      meta_title = VALUES(meta_title),
      meta_description = VALUES(meta_description),
      meta_keywords = VALUES(meta_keywords),
      canonical_url = VALUES(canonical_url),
      robots_index = VALUES(robots_index),
      robots_follow = VALUES(robots_follow),
      og_title = VALUES(og_title),
      og_description = VALUES(og_description),
      og_image = VALUES(og_image),
      twitter_title = VALUES(twitter_title),
      twitter_description = VALUES(twitter_description),
      twitter_image = VALUES(twitter_image),
      last_updated = VALUES(last_updated),
      score = VALUES(score),
      robots_meta = VALUES(robots_meta),
      schema_markup = VALUES(schema_markup),
      updated_at = CURRENT_TIMESTAMP;
  `;

  for (const seo of seoConfigs) {
    try {
      await pool.query(query, [
        seo.id,
        seo.pageName || "",
        seo.urlSlug || "",
        seo.metaTitle || "",
        seo.metaDescription || "",
        seo.metaKeywords || "",
        seo.canonicalUrl || "",
        seo.robotsIndex !== false ? 1 : 0,
        seo.robotsFollow !== false ? 1 : 0,
        seo.ogTitle || "",
        seo.ogDescription || "",
        seo.ogImage || "",
        seo.twitterTitle || "",
        seo.twitterDescription || "",
        seo.twitterImage || "",
        seo.lastUpdated || "",
        seo.score !== undefined ? Number(seo.score) : 0,
        seo.robotsMeta || "",
        seo.schemaMarkup || ""
      ]);
      success++;
    } catch (err: any) {
      failed++;
      console.error(`❌ MySQL Phase 6: Failed to migrate SEO config ${seo.id}:`, err.message);
    }
  }

  return { total: seoConfigs.length, success, failed };
}

/**
 * Migrates Property-specific SEO Configurations (property_seo_configs collection) using transactional upserts.
 */
export async function migratePropertySeoConfigs(propertySeoConfigs: any[]): Promise<{ total: number; success: number; failed: number }> {
  const pool = getPool();
  let success = 0;
  let failed = 0;

  const query = `
    INSERT INTO property_seo_configs (
      id, url_slug, meta_title, meta_description, canonical_url, robots_meta, schema_markup,
      og_title, og_description, og_image, last_updated, config
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      url_slug = VALUES(url_slug),
      meta_title = VALUES(meta_title),
      meta_description = VALUES(meta_description),
      canonical_url = VALUES(canonical_url),
      robots_meta = VALUES(robots_meta),
      schema_markup = VALUES(schema_markup),
      og_title = VALUES(og_title),
      og_description = VALUES(og_description),
      og_image = VALUES(og_image),
      last_updated = VALUES(last_updated),
      config = VALUES(config),
      updated_at = CURRENT_TIMESTAMP;
  `;

  for (const pSeo of propertySeoConfigs) {
    try {
      await pool.query(query, [
        pSeo.id,
        pSeo.urlSlug || "",
        pSeo.metaTitle || "",
        pSeo.metaDescription || "",
        pSeo.canonicalUrl || "",
        pSeo.robotsMeta || "",
        pSeo.schemaMarkup || "",
        pSeo.ogTitle || "",
        pSeo.ogDescription || "",
        pSeo.ogImage || "",
        pSeo.lastUpdated || "",
        JSON.stringify(pSeo)
      ]);
      success++;
    } catch (err: any) {
      failed++;
      console.error(`❌ MySQL Phase 6: Failed to migrate property SEO config ${pSeo.id}:`, err.message);
    }
  }

  return { total: propertySeoConfigs.length, success, failed };
}

/**
 * Migrates SEO Redirect Rules (with fallback standard redirects from local storage config)
 */
export async function migrateSeoRedirectRules(seoRedirectRules: any[]): Promise<{ total: number; success: number; failed: number }> {
  const pool = getPool();
  let success = 0;
  let failed = 0;

  const query = `
    INSERT INTO seo_redirect_rules (id, from_url, to_url, type, date_added, clicks)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      from_url = VALUES(from_url),
      to_url = VALUES(to_url),
      type = VALUES(type),
      date_added = VALUES(date_added),
      clicks = VALUES(clicks),
      updated_at = CURRENT_TIMESTAMP;
  `;

  for (const r of seoRedirectRules) {
    try {
      await pool.query(query, [
        r.id,
        r.fromUrl || r.from_url || "",
        r.toUrl || r.to_url || "",
        r.type || "301",
        r.dateAdded || r.date_added || "",
        r.clicks !== undefined ? Number(r.clicks) : 0
      ]);
      success++;
    } catch (err: any) {
      failed++;
      console.error(`❌ MySQL Phase 6: Failed to migrate redirect rule ${r.id}:`, err.message);
    }
  }

  return { total: seoRedirectRules.length, success, failed };
}

/**
 * Migrates Site CMS Configuration (settings/site_settings)
 */
export async function migrateSiteCmsConfig(siteCmsConfig: any[]): Promise<{ total: number; success: number; failed: number }> {
  const pool = getPool();
  let success = 0;
  let failed = 0;

  const query = `
    INSERT INTO site_cms_config (
      id, business_name, whatsapp_number, currency, email, phone, address,
      facebook_url, instagram_url, linkedin_url, twitter_url,
      hero_badge, hero_badge_highlight, hero_headline1, hero_headline2_highlight,
      hero_subheading, hero_bg_image, hero_button_text, config
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      business_name = VALUES(business_name),
      whatsapp_number = VALUES(whatsapp_number),
      currency = VALUES(currency),
      email = VALUES(email),
      phone = VALUES(phone),
      address = VALUES(address),
      facebook_url = VALUES(facebook_url),
      instagram_url = VALUES(instagram_url),
      linkedin_url = VALUES(linkedin_url),
      twitter_url = VALUES(twitter_url),
      hero_badge = VALUES(hero_badge),
      hero_badge_highlight = VALUES(hero_badge_highlight),
      hero_headline1 = VALUES(hero_headline1),
      hero_headline2_highlight = VALUES(hero_headline2_highlight),
      hero_subheading = VALUES(hero_subheading),
      hero_bg_image = VALUES(hero_bg_image),
      hero_button_text = VALUES(hero_button_text),
      config = VALUES(config),
      updated_at = CURRENT_TIMESTAMP;
  `;

  for (const cms of siteCmsConfig) {
    try {
      await pool.query(query, [
        cms.id,
        cms.businessName || cms.companyName || "",
        cms.whatsappNumber || "",
        cms.currency || "",
        cms.email || "",
        cms.phone || "",
        cms.address || "",
        cms.facebookUrl || cms.socialLinks?.facebook || "",
        cms.instagramUrl || cms.socialLinks?.instagram || "",
        cms.linkedinUrl || cms.socialLinks?.linkedin || "",
        cms.twitterUrl || cms.socialLinks?.twitter || "",
        cms.heroBadge || "",
        cms.heroBadgeHighlight || "",
        cms.heroHeadline1 || "",
        cms.heroHeadline2Highlight || "",
        cms.heroSubheading || "",
        cms.heroBgImage || "",
        cms.heroButtonText || "",
        JSON.stringify(cms)
      ]);
      success++;
    } catch (err: any) {
      failed++;
      console.error(`❌ MySQL Phase 6: Failed to migrate Site CMS configuration ${cms.id}:`, err.message);
    }
  }

  return { total: siteCmsConfig.length, success, failed };
}

/**
 * Migrates Hero Banners (banner_management collection) using transactional upserts.
 */
export async function migrateHeroBanners(heroBanners: any[]): Promise<{ total: number; success: number; failed: number }> {
  const pool = getPool();
  let success = 0;
  let failed = 0;

  const query = `
    INSERT INTO hero_banners (
      id, headline, subheading, description, badge_text, property_count_badge,
      desktop_image_method, desktop_image, mobile_image_method, mobile_image, tablet_image,
      primary_button_config, secondary_button_config,
      primary_button_text, primary_button_url, secondary_button_text, secondary_button_url,
      display_order, status, enabled
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      headline = VALUES(headline),
      subheading = VALUES(subheading),
      description = VALUES(description),
      badge_text = VALUES(badge_text),
      property_count_badge = VALUES(property_count_badge),
      desktop_image_method = VALUES(desktop_image_method),
      desktop_image = VALUES(desktop_image),
      mobile_image_method = VALUES(mobile_image_method),
      mobile_image = VALUES(mobile_image),
      tablet_image = VALUES(tablet_image),
      primary_button_config = VALUES(primary_button_config),
      secondary_button_config = VALUES(secondary_button_config),
      primary_button_text = VALUES(primary_button_text),
      primary_button_url = VALUES(primary_button_url),
      secondary_button_text = VALUES(secondary_button_text),
      secondary_button_url = VALUES(secondary_button_url),
      display_order = VALUES(display_order),
      status = VALUES(status),
      enabled = VALUES(enabled),
      updated_at = CURRENT_TIMESTAMP;
  `;

  for (const banner of heroBanners) {
    try {
      await pool.query(query, [
        banner.id,
        banner.headline || "",
        banner.subheading || "",
        banner.description || "",
        banner.badgeText || "",
        banner.propertyCountBadge || "",
        banner.desktopImageMethod || "url",
        banner.desktopImage || "",
        banner.mobileImageMethod || "url",
        banner.mobileImage || "",
        banner.tabletImage || "",
        banner.primaryButtonConfig ? JSON.stringify(banner.primaryButtonConfig) : null,
        banner.secondaryButtonConfig ? JSON.stringify(banner.secondaryButtonConfig) : null,
        banner.primaryButtonText || "",
        banner.primaryButtonUrl || "",
        banner.secondaryButtonText || "",
        banner.secondaryButtonUrl || "",
        banner.order !== undefined ? Number(banner.order) : 0,
        banner.status || "Active",
        banner.enabled !== false ? 1 : 0
      ]);
      success++;
    } catch (err: any) {
      failed++;
      console.error(`❌ MySQL Phase 6: Failed to migrate hero banner ${banner.id}:`, err.message);
    }
  }

  return { total: heroBanners.length, success, failed };
}

/**
 * Migrates FAQs (faqs collection) using transactional upserts.
 */
export async function migrateFaqs(faqs: any[]): Promise<{ total: number; success: number; failed: number }> {
  const pool = getPool();
  let success = 0;
  let failed = 0;

  const query = `
    INSERT INTO faqs (
      id, question, answer, category, display_order, status, featured, last_updated,
      show_on_homepage, homepage_order, homepage_status, published, homepage_visible,
      created_at_str, updated_at_str
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      question = VALUES(question),
      answer = VALUES(answer),
      category = VALUES(category),
      display_order = VALUES(display_order),
      status = VALUES(status),
      featured = VALUES(featured),
      last_updated = VALUES(last_updated),
      show_on_homepage = VALUES(show_on_homepage),
      homepage_order = VALUES(homepage_order),
      homepage_status = VALUES(homepage_status),
      published = VALUES(published),
      homepage_visible = VALUES(homepage_visible),
      created_at_str = VALUES(created_at_str),
      updated_at_str = VALUES(updated_at_str),
      updated_at = CURRENT_TIMESTAMP;
  `;

  for (const faq of faqs) {
    try {
      await pool.query(query, [
        faq.id,
        faq.question || "",
        faq.answer || "",
        faq.category || "General Questions",
        faq.displayOrder !== undefined ? Number(faq.displayOrder) : 0,
        faq.status || "Active",
        faq.featured ? 1 : 0,
        faq.lastUpdated || "",
        faq.showOnHomepage ? 1 : 0,
        faq.homepageOrder !== undefined ? Number(faq.homepageOrder) : 0,
        faq.homepageStatus || "Visible",
        faq.published !== false ? 1 : 0,
        faq.homepageVisible !== false ? 1 : 0,
        faq.createdAt || "",
        faq.updatedAt || ""
      ]);
      success++;
    } catch (err: any) {
      failed++;
      console.error(`❌ MySQL Phase 6: Failed to migrate FAQ ${faq.id}:`, err.message);
    }
  }

  return { total: faqs.length, success, failed };
}

/**
 * Migrates Quick Filters (quick_filters collection) using transactional upserts.
 */
export async function migrateQuickFilters(quickFilters: any[]): Promise<{ total: number; success: number; failed: number }> {
  const pool = getPool();
  let success = 0;
  let failed = 0;

  const query = `
    INSERT INTO quick_filters (id, name, status)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      status = VALUES(status),
      updated_at = CURRENT_TIMESTAMP;
  `;

  for (const f of quickFilters) {
    try {
      await pool.query(query, [
        f.id,
        f.name || "",
        f.status || "Active"
      ]);
      success++;
    } catch (err: any) {
      failed++;
      console.error(`❌ MySQL Phase 6: Failed to migrate quick filter ${f.id}:`, err.message);
    }
  }

  return { total: quickFilters.length, success, failed };
}

/**
 * Migrates Routing Rules (routing_rules collection) using transactional upserts.
 */
export async function migrateRoutingRules(routingRules: any[]): Promise<{ total: number; success: number; failed: number }> {
  const pool = getPool();
  let success = 0;
  let failed = 0;

  const query = `
    INSERT INTO routing_rules (id, source_category, target_department, target_agent_id, target_agent_name, priority, sla_days)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      source_category = VALUES(source_category),
      target_department = VALUES(target_department),
      target_agent_id = VALUES(target_agent_id),
      target_agent_name = VALUES(target_agent_name),
      priority = VALUES(priority),
      sla_days = VALUES(sla_days),
      updated_at = CURRENT_TIMESTAMP;
  `;

  for (const r of routingRules) {
    try {
      await pool.query(query, [
        r.id,
        r.sourceCategory || "",
        r.targetDepartment || "",
        r.targetAgentId || null,
        r.targetAgentName || null,
        r.priority || "Medium",
        r.slaDays !== undefined ? Number(r.slaDays) : 1
      ]);
      success++;
    } catch (err: any) {
      failed++;
      console.error(`❌ MySQL Phase 6: Failed to migrate routing rule ${r.id}:`, err.message);
    }
  }

  return { total: routingRules.length, success, failed };
}

/**
 * Migrates general settings/documents (e.g. brand_identity, map_settings, admin_theme, seo_settings etc)
 */
export async function migrateSettings(settings: any[]): Promise<{ total: number; success: number; failed: number }> {
  const pool = getPool();
  let success = 0;
  let failed = 0;

  const query = `
    INSERT INTO settings (key_name, value)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE
      value = VALUES(value),
      updated_at = CURRENT_TIMESTAMP;
  `;

  for (const s of settings) {
    try {
      await pool.query(query, [
        s.id,
        JSON.stringify(s)
      ]);
      success++;
    } catch (err: any) {
      failed++;
      console.error(`❌ MySQL Phase 6: Failed to migrate setting ${s.id}:`, err.message);
    }
  }

  return { total: settings.length, success, failed };
}

/**
 * Migrates Theme Presets (theme_presets collection) using transactional upserts.
 */
export async function migrateThemePresets(themePresets: any[]): Promise<{ total: number; success: number; failed: number }> {
  const pool = getPool();
  let success = 0;
  let failed = 0;

  const query = `
    INSERT INTO theme_presets (theme_id, value)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE
      value = VALUES(value),
      updated_at = CURRENT_TIMESTAMP;
  `;

  for (const preset of themePresets) {
    try {
      await pool.query(query, [
        preset.id || preset.themeId,
        JSON.stringify(preset)
      ]);
      success++;
    } catch (err: any) {
      failed++;
      console.error(`❌ MySQL Phase 6: Failed to migrate theme preset ${preset.id || preset.themeId}:`, err.message);
    }
  }

  return { total: themePresets.length, success, failed };
}
