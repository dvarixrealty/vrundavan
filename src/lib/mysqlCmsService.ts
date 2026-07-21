import { getPool } from "./mysqlService.ts";

/**
 * Initializes additional MySQL tables that aren't defined in Phase 5 or Phase 6:
 * - map_locations (Map Locations metadata)
 * - admin_users (Admin Users authentication & roles)
 */
export async function initializeCmsTables(): Promise<void> {
  const pool = getPool();
  
  const createMapLocationsTable = `
    CREATE TABLE IF NOT EXISTS map_locations (
      name VARCHAR(128) PRIMARY KEY,
      value LONGTEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createAdminUsersTable = `
    CREATE TABLE IF NOT EXISTS admin_users (
      id VARCHAR(128) PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      role_name VARCHAR(100),
      permissions LONGTEXT, -- stored as JSON string
      raw_data LONGTEXT, -- full serialized AdminUser object
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    console.log("[MySQL Init CMS] Ensuring custom CMS tables ('map_locations', 'admin_users') exist...");
    await pool.query(createMapLocationsTable);
    await pool.query(createAdminUsersTable);
    console.log("✅ MySQL Init CMS: Custom CMS tables verified/created successfully.");
  } catch (error: any) {
    console.error("❌ MySQL Init CMS Error: Failed to create/verify custom CMS tables.");
    console.error("   Error Message:", error.message || error);
  }
}

export const mysqlCmsService = {
  // --- CATEGORIES ---
  async getCategories() {
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM categories ORDER BY display_order ASC");
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      iconName: r.icon_name,
      displayOrder: r.display_order,
      status: r.status,
      showInView: r.show_in_view === 1,
      redirectUrl: r.redirect_url,
      image: r.image
    }));
  },
  async saveCategory(cat: any) {
    const pool = getPool();
    const q = `
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
    await pool.query(q, [
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
    return true;
  },
  async deleteCategory(id: string) {
    const pool = getPool();
    await pool.query("DELETE FROM categories WHERE id = ?", [id]);
    return true;
  },

  // --- SEARCH CATEGORIES ---
  async getSearchCategories() {
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM search_categories ORDER BY display_order ASC");
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      iconName: r.icon_name,
      displayOrder: r.display_order,
      status: r.status,
      showInView: r.show_in_view === 1,
      isDefault: r.is_default === 1
    }));
  },
  async saveSearchCategory(cat: any) {
    const pool = getPool();
    const q = `
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
    await pool.query(q, [
      cat.id,
      cat.title || "",
      cat.iconName || "",
      cat.displayOrder !== undefined ? Number(cat.displayOrder) : 0,
      cat.status || "Active",
      cat.showInView !== false ? 1 : 0,
      cat.isDefault ? 1 : 0
    ]);
    return true;
  },
  async deleteSearchCategory(id: string) {
    const pool = getPool();
    await pool.query("DELETE FROM search_categories WHERE id = ?", [id]);
    return true;
  },

  // --- AGENTS ---
  async getAgents() {
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM agents ORDER BY name ASC");
    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      role: r.role,
      avatar: r.avatar,
      phone: r.phone,
      email: r.email
    }));
  },
  async saveAgent(ag: any) {
    const pool = getPool();
    const q = `
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
    await pool.query(q, [
      ag.id,
      ag.name || "",
      ag.role || "",
      ag.avatar || "",
      ag.phone || "",
      ag.email || ""
    ]);
    return true;
  },
  async deleteAgent(id: string) {
    const pool = getPool();
    await pool.query("DELETE FROM agents WHERE id = ?", [id]);
    return true;
  },

  // --- INQUIRIES ---
  async getInquiries() {
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM inquiries ORDER BY created_at DESC");
    return rows.map((r: any) => ({
      id: r.id,
      propertyId: r.property_id,
      propertyName: r.property_name,
      name: r.name,
      email: r.email,
      phone: r.phone,
      message: r.message,
      date: r.date,
      status: r.status,
      preferredTime: r.preferred_time,
      contactMethod: r.contact_method
    }));
  },
  async saveInquiry(inq: any) {
    const pool = getPool();
    const q = `
      INSERT INTO inquiries (id, property_id, property_name, name, email, phone, message, date, status, preferred_time, contact_method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    await pool.query(q, [
      inq.id,
      inq.propertyId || null,
      inq.propertyName || null,
      inq.name || "",
      inq.email || "",
      inq.phone || "",
      inq.message || "",
      inq.date || "",
      inq.status || "New",
      inq.preferredTime || null,
      inq.contactMethod || null
    ]);
    return true;
  },
  async deleteInquiry(id: string) {
    const pool = getPool();
    await pool.query("DELETE FROM inquiries WHERE id = ?", [id]);
    return true;
  },

  // --- CENTRAL ENQUIRIES ---
  async getCentralEnquiries() {
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM central_enquiries ORDER BY created_at DESC");
    return rows.map((r: any) => {
      let timeline = [];
      let formResponses = {};
      let tags = [];
      try { timeline = r.timeline ? JSON.parse(r.timeline) : []; } catch { /* ignore */ }
      try { formResponses = r.form_responses ? JSON.parse(r.form_responses) : {}; } catch { /* ignore */ }
      try { tags = r.tags ? JSON.parse(r.tags) : []; } catch { /* ignore */ }

      return {
        id: r.id,
        customerName: r.customer_name,
        mobile: r.mobile,
        email: r.email,
        alternateContact: r.alternate_contact,
        companyName: r.company_name,
        sourceCategory: r.source_category,
        sourceName: r.source_name,
        formName: r.form_name,
        landingPageUrl: r.landing_page_url,
        referringUrl: r.referring_url,
        utmSource: r.utm_source,
        utmMedium: r.utm_medium,
        utmCampaign: r.utm_campaign,
        deviceType: r.device_type,
        browser: r.browser,
        os: r.os,
        createdAt: r.created_at_str,
        propertyId: r.property_id,
        propertyName: r.property_name,
        propertyImage: r.property_image,
        intent: r.intent,
        assignedAgentId: r.assigned_agent_id,
        assignedAgentName: r.assigned_agent_name,
        assignedDepartment: r.assigned_department,
        priority: r.priority,
        slaDueDate: r.sla_due_date,
        status: r.status,
        internalNotes: r.internal_notes,
        tags,
        timeline,
        formResponses,
        convertedLeadId: r.converted_lead_id,
        convertedCustomerId: r.converted_customer_id,
        isTrashed: r.is_trashed === 1,
        isDuplicateOf: r.is_duplicate_of
      };
    });
  },
  async saveCentralEnquiry(enq: any) {
    const pool = getPool();
    const q = `
      INSERT INTO central_enquiries (
        id, customer_name, mobile, email, alternate_contact, company_name, source_category, source_name,
        form_name, landing_page_url, referring_url, utm_source, utm_medium, utm_campaign,
        device_type, browser, os, created_at_str, property_id, property_name, property_image,
        intent, assigned_agent_id, assigned_agent_name, assigned_department, priority, sla_due_date,
        status, internal_notes, tags, timeline, form_responses, converted_lead_id, converted_customer_id,
        is_trashed, is_duplicate_of
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
    await pool.query(q, [
      enq.id,
      enq.customerName || "",
      enq.mobile || "",
      enq.email || "",
      enq.alternateContact || null,
      enq.companyName || null,
      enq.sourceCategory || "",
      enq.sourceName || "",
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
      JSON.stringify(enq.tags || []),
      JSON.stringify(enq.timeline || []),
      JSON.stringify(enq.formResponses || {}),
      enq.convertedLeadId || null,
      enq.convertedCustomerId || null,
      enq.isTrashed ? 1 : 0,
      enq.isDuplicateOf || null
    ]);
    return true;
  },
  async deleteCentralEnquiry(id: string) {
    const pool = getPool();
    await pool.query("DELETE FROM central_enquiries WHERE id = ?", [id]);
    return true;
  },

  // --- SEO CONFIGS ---
  async getSeoConfigs() {
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM seo_configs");
    return rows.map((r: any) => ({
      id: r.id,
      pageName: r.page_name,
      urlSlug: r.url_slug,
      metaTitle: r.meta_title,
      metaDescription: r.meta_description,
      metaKeywords: r.meta_keywords,
      canonicalUrl: r.canonical_url,
      robotsIndex: r.robots_index === 1,
      robotsFollow: r.robots_follow === 1,
      ogTitle: r.og_title,
      ogDescription: r.og_description,
      ogImage: r.og_image,
      twitterTitle: r.twitter_title,
      twitterDescription: r.twitter_description,
      twitterImage: r.twitter_image,
      lastUpdated: r.last_updated,
      score: r.score,
      robotsMeta: r.robots_meta,
      schemaMarkup: r.schema_markup
    }));
  },
  async saveSeoConfig(seo: any) {
    const pool = getPool();
    const q = `
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
    await pool.query(q, [
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
    return true;
  },
  async deleteSeoConfig(id: string) {
    const pool = getPool();
    await pool.query("DELETE FROM seo_configs WHERE id = ?", [id]);
    return true;
  },

  // --- PROPERTY SEO CONFIGS ---
  async getPropertySeoConfigs() {
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM property_seo_configs");
    return rows.map((r: any) => {
      if (r.config) {
        try {
          return { id: r.id, ...JSON.parse(r.config) };
        } catch { /* ignore */ }
      }
      return {
        id: r.id,
        urlSlug: r.url_slug,
        metaTitle: r.meta_title,
        metaDescription: r.meta_description,
        canonicalUrl: r.canonical_url,
        robotsMeta: r.robots_meta,
        schemaMarkup: r.schema_markup,
        ogTitle: r.og_title,
        ogDescription: r.og_description,
        ogImage: r.og_image,
        lastUpdated: r.last_updated
      };
    });
  },
  async savePropertySeoConfig(pSeo: any) {
    const pool = getPool();
    const q = `
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
    await pool.query(q, [
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
    return true;
  },
  async deletePropertySeoConfig(id: string) {
    const pool = getPool();
    await pool.query("DELETE FROM property_seo_configs WHERE id = ?", [id]);
    return true;
  },

  // --- SEO REDIRECT RULES ---
  async getSeoRedirectRules() {
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM seo_redirect_rules");
    return rows.map((r: any) => ({
      id: r.id,
      fromUrl: r.from_url,
      toUrl: r.to_url,
      type: r.type,
      dateAdded: r.date_added,
      clicks: r.clicks
    }));
  },
  async saveSeoRedirectRule(rule: any) {
    const pool = getPool();
    const q = `
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
    await pool.query(q, [
      rule.id,
      rule.fromUrl || rule.from_url || "",
      rule.toUrl || rule.to_url || "",
      rule.type || "301",
      rule.dateAdded || rule.date_added || "",
      rule.clicks !== undefined ? Number(rule.clicks) : 0
    ]);
    return true;
  },
  async deleteSeoRedirectRule(id: string) {
    const pool = getPool();
    await pool.query("DELETE FROM seo_redirect_rules WHERE id = ?", [id]);
    return true;
  },

  // --- SITE CMS CONFIG ---
  async getSiteCmsConfig() {
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM site_cms_config");
    if (rows.length > 0) {
      const r = rows[0];
      if (r.config) {
        try {
          return { id: r.id, ...JSON.parse(r.config) };
        } catch { /* ignore */ }
      }
      return {
        id: r.id,
        businessName: r.business_name,
        whatsappNumber: r.whatsapp_number,
        currency: r.currency,
        email: r.email,
        phone: r.phone,
        address: r.address,
        facebookUrl: r.facebook_url,
        instagramUrl: r.instagram_url,
        linkedinUrl: r.linkedin_url,
        twitterUrl: r.twitter_url,
        heroBadge: r.hero_badge,
        heroBadgeHighlight: r.hero_badge_highlight,
        heroHeadline1: r.hero_headline1,
        heroHeadline2Highlight: r.hero_headline2_highlight,
        heroSubheading: r.hero_subheading,
        heroBgImage: r.hero_bg_image,
        heroButtonText: r.hero_button_text
      };
    }
    return null;
  },
  async saveSiteCmsConfig(cfg: any) {
    const pool = getPool();
    const q = `
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
    await pool.query(q, [
      cfg.id || "site_settings",
      cfg.businessName || "",
      cfg.whatsappNumber || "",
      cfg.currency || "",
      cfg.email || "",
      cfg.phone || "",
      cfg.address || "",
      cfg.facebookUrl || "",
      cfg.instagramUrl || "",
      cfg.linkedinUrl || "",
      cfg.twitterUrl || "",
      cfg.heroBadge || "",
      cfg.heroBadgeHighlight || "",
      cfg.heroHeadline1 || "",
      cfg.heroHeadline2Highlight || "",
      cfg.heroSubheading || "",
      cfg.heroBgImage || "",
      cfg.heroButtonText || "",
      JSON.stringify(cfg)
    ]);
    return true;
  },
  async deleteSiteCmsConfig(id: string) {
    const pool = getPool();
    await pool.query("DELETE FROM site_cms_config WHERE id = ?", [id]);
    return true;
  },

  // --- HERO BANNERS ---
  async getHeroBanners() {
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM hero_banners ORDER BY display_order ASC");
    return rows.map((r: any) => {
      let parsed: any = {};
      if (r.full_data_json) {
        try {
          parsed = JSON.parse(r.full_data_json);
        } catch (e) {
          console.error("Failed to parse full_data_json for hero banner:", r.id, e);
        }
      }
      return {
        // Merge remaining rich fields from JSON if available
        ...parsed,
        // Base fields and database overrides win
        id: r.id,
        bannerName: r.banner_name || parsed.bannerName || parsed.title || "",
        title: r.banner_name || parsed.bannerName || parsed.title || "",
        headline: r.headline,
        subheading: r.subheading,
        description: r.description,
        badgeText: r.badge_text,
        propertyCountBadge: r.property_count_badge,
        desktopImage: r.desktop_image,
        tabletImage: r.tablet_image,
        mobileImage: r.mobile_image,
        primaryButtonText: r.primary_button_text,
        primaryButtonUrl: r.primary_button_url,
        secondaryButtonText: r.secondary_button_text,
        secondaryButtonUrl: r.secondary_button_url,
        displayOrder: r.display_order,
        order: r.display_order, // Provide order for frontend compatibility
        status: r.status,
        enabled: r.enabled === 1
      };
    });
  },
  async saveHeroBanner(banner: any) {
    const pool = getPool();
    const orderVal = banner.order !== undefined ? Number(banner.order) : (banner.displayOrder !== undefined ? Number(banner.displayOrder) : 0);
    const bannerNameVal = banner.bannerName || banner.title || "";
    const fullDataJson = JSON.stringify(banner);

    const q = `
      INSERT INTO hero_banners (
        id, banner_name, headline, subheading, description, badge_text, property_count_badge,
        desktop_image, tablet_image, mobile_image,
        primary_button_text, primary_button_url, secondary_button_text, secondary_button_url,
        display_order, status, enabled, full_data_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        banner_name = VALUES(banner_name),
        headline = VALUES(headline),
        subheading = VALUES(subheading),
        description = VALUES(description),
        badge_text = VALUES(badge_text),
        property_count_badge = VALUES(property_count_badge),
        desktop_image = VALUES(desktop_image),
        tablet_image = VALUES(tablet_image),
        mobile_image = VALUES(mobile_image),
        primary_button_text = VALUES(primary_button_text),
        primary_button_url = VALUES(primary_button_url),
        secondary_button_text = VALUES(secondary_button_text),
        secondary_button_url = VALUES(secondary_button_url),
        display_order = VALUES(display_order),
        status = VALUES(status),
        enabled = VALUES(enabled),
        full_data_json = VALUES(full_data_json),
        updated_at = CURRENT_TIMESTAMP;
    `;
    await pool.query(q, [
      banner.id,
      bannerNameVal,
      banner.headline || "",
      banner.subheading || "",
      banner.description || "",
      banner.badgeText || "",
      banner.propertyCountBadge || "",
      banner.desktopImage || "",
      banner.tabletImage || "",
      banner.mobileImage || "",
      banner.primaryButtonText || "",
      banner.primaryButtonUrl || "",
      banner.secondaryButtonText || "",
      banner.secondaryButtonUrl || "",
      orderVal,
      banner.status || "Active",
      banner.enabled !== false ? 1 : 0,
      fullDataJson
    ]);
    return true;
  },
  async deleteHeroBanner(id: string) {
    const pool = getPool();
    await pool.query("DELETE FROM hero_banners WHERE id = ?", [id]);
    return true;
  },

  // --- FAQS ---
  async getFaqs() {
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM faqs ORDER BY display_order ASC");
    return rows.map((r: any) => ({
      id: r.id,
      question: r.question,
      answer: r.answer,
      category: r.category,
      displayOrder: r.display_order,
      status: r.status,
      featured: r.featured === 1,
      lastUpdated: r.last_updated,
      showOnHomepage: r.show_on_homepage === 1,
      homepageOrder: r.homepage_order,
      homepageStatus: r.homepage_status,
      published: r.published === 1,
      homepageVisible: r.homepage_visible === 1,
      createdAtStr: r.created_at_str,
      updatedAtStr: r.updated_at_str
    }));
  },
  async saveFaq(faq: any) {
    const pool = getPool();
    const q = `
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
    await pool.query(q, [
      faq.id,
      faq.question || "",
      faq.answer || "",
      faq.category || "General",
      faq.displayOrder !== undefined ? Number(faq.displayOrder) : 0,
      faq.status || "Active",
      faq.featured ? 1 : 0,
      faq.lastUpdated || "",
      faq.showOnHomepage ? 1 : 0,
      faq.homepageOrder !== undefined ? Number(faq.homepageOrder) : 0,
      faq.homepageStatus || "Active",
      faq.published !== false ? 1 : 0,
      faq.homepageVisible !== false ? 1 : 0,
      faq.createdAtStr || "",
      faq.updatedAtStr || ""
    ]);
    return true;
  },
  async deleteFaq(id: string) {
    const pool = getPool();
    await pool.query("DELETE FROM faqs WHERE id = ?", [id]);
    return true;
  },

  // --- QUICK FILTERS ---
  async getQuickFilters() {
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM quick_filters ORDER BY id ASC");
    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      status: r.status
    }));
  },
  async saveQuickFilter(qf: any) {
    const pool = getPool();
    const q = `
      INSERT INTO quick_filters (id, name, status)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        status = VALUES(status),
        updated_at = CURRENT_TIMESTAMP;
    `;
    await pool.query(q, [
      qf.id,
      qf.name || "",
      qf.status || "Active"
    ]);
    return true;
  },
  async deleteQuickFilter(id: string) {
    const pool = getPool();
    await pool.query("DELETE FROM quick_filters WHERE id = ?", [id]);
    return true;
  },

  // --- ROUTING RULES ---
  async getRoutingRules() {
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM routing_rules ORDER BY id ASC");
    return rows.map((r: any) => ({
      id: r.id,
      sourceCategory: r.source_category,
      targetDepartment: r.target_department,
      targetAgentId: r.target_agent_id,
      targetAgentName: r.target_agent_name,
      priority: r.priority,
      slaDays: r.sla_days
    }));
  },
  async saveRoutingRule(rr: any) {
    const pool = getPool();
    const q = `
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
    await pool.query(q, [
      rr.id,
      rr.sourceCategory || "",
      rr.targetDepartment || "",
      rr.targetAgentId || null,
      rr.targetAgentName || null,
      rr.priority || "Medium",
      rr.slaDays !== undefined ? Number(rr.slaDays) : 1
    ]);
    return true;
  },
  async deleteRoutingRule(id: string) {
    const pool = getPool();
    await pool.query("DELETE FROM routing_rules WHERE id = ?", [id]);
    return true;
  },

  // --- SETTINGS ---
  async getSettings() {
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM settings");
    return rows.map((r: any) => {
      try {
        return JSON.parse(r.value);
      } catch {
        return { id: r.key_name, value: r.value };
      }
    });
  },
  async saveSetting(key: string, value: any) {
    const pool = getPool();
    const q = `
      INSERT INTO settings (key_name, value)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
        value = VALUES(value),
        updated_at = CURRENT_TIMESTAMP;
    `;
    await pool.query(q, [
      key,
      JSON.stringify(value)
    ]);
    return true;
  },
  async deleteSetting(key: string) {
    const pool = getPool();
    await pool.query("DELETE FROM settings WHERE key_name = ?", [key]);
    return true;
  },

  // --- THEME PRESETS ---
  async getThemePresets() {
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM theme_presets");
    return rows.map((r: any) => {
      try {
        return JSON.parse(r.value);
      } catch {
        return { themeId: r.theme_id, value: r.value };
      }
    });
  },
  async saveThemePreset(preset: any) {
    const pool = getPool();
    const q = `
      INSERT INTO theme_presets (theme_id, value)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
        value = VALUES(value),
        updated_at = CURRENT_TIMESTAMP;
    `;
    await pool.query(q, [
      preset.id || preset.themeId,
      JSON.stringify(preset)
    ]);
    return true;
  },
  async deleteThemePreset(id: string) {
    const pool = getPool();
    await pool.query("DELETE FROM theme_presets WHERE theme_id = ?", [id]);
    return true;
  },

  // --- MAP LOCATIONS ---
  async getMapLocations() {
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM map_locations");
    const result: Record<string, any> = {};
    for (const r of rows) {
      try {
        result[r.name] = JSON.parse(r.value);
      } catch {
        result[r.name] = { name: r.name };
      }
    }
    return result;
  },
  async saveMapLocation(loc: any) {
    const pool = getPool();
    const q = `
      INSERT INTO map_locations (name, value)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
        value = VALUES(value),
        updated_at = CURRENT_TIMESTAMP;
    `;
    await pool.query(q, [
      loc.name,
      JSON.stringify(loc)
    ]);
    return true;
  },
  async deleteMapLocation(name: string) {
    const pool = getPool();
    await pool.query("DELETE FROM map_locations WHERE name = ?", [name]);
    return true;
  },

  // --- ADMIN USERS ---
  async getAdminUsers() {
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT * FROM admin_users");
    return rows.map((r: any) => {
      if (r.raw_data) {
        try {
          return JSON.parse(r.raw_data);
        } catch { /* ignore */ }
      }
      let permissions = {};
      try { permissions = r.permissions ? JSON.parse(r.permissions) : {}; } catch { /* ignore */ }
      return {
        id: r.id,
        email: r.email,
        password: r.password,
        name: r.name,
        roleName: r.role_name,
        permissions
      };
    });
  },
  async saveAdminUser(user: any) {
    const pool = getPool();
    const q = `
      INSERT INTO admin_users (id, email, password, name, role_name, permissions, raw_data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        email = VALUES(email),
        password = VALUES(password),
        name = VALUES(name),
        role_name = VALUES(role_name),
        permissions = VALUES(permissions),
        raw_data = VALUES(raw_data),
        updated_at = CURRENT_TIMESTAMP;
    `;
    await pool.query(q, [
      user.id,
      user.email || "",
      user.password || "",
      user.name || "",
      user.roleName || "",
      JSON.stringify(user.permissions || {}),
      JSON.stringify(user)
    ]);
    return true;
  },
  async deleteAdminUser(id: string) {
    const pool = getPool();
    await pool.query("DELETE FROM admin_users WHERE id = ?", [id]);
    return true;
  }
};
