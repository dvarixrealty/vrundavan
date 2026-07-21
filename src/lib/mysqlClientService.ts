/**
 * MySQL client-side service to communicate with Phase 7 REST API endpoints.
 * Supports parallel writes and reads alongside Firestore to ensure data is mirrored
 * in the Hostinger MySQL database safely and transactional consistency is preserved.
 */

export const mysqlClientService = {
  // Site Visits
  async getSiteVisits() {
    try {
      const res = await fetch("/api/mysql/site_visits");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.warn("⚠️ Failed to fetch Site Visits from MySQL:", err);
      return [];
    }
  },
  async saveSiteVisit(data: any) {
    try {
      const res = await fetch("/api/mysql/site_visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to save Site Visit to MySQL:", err);
      return false;
    }
  },
  async deleteSiteVisit(id: string) {
    try {
      const res = await fetch(`/api/mysql/site_visits/${id}`, {
        method: "DELETE"
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to delete Site Visit from MySQL:", err);
      return false;
    }
  },

  // Requirements
  async getRequirements() {
    try {
      const res = await fetch("/api/mysql/requirements");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.warn("⚠️ Failed to fetch Requirements from MySQL:", err);
      return [];
    }
  },
  async saveRequirement(data: any) {
    try {
      const res = await fetch("/api/mysql/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to save Requirement to MySQL:", err);
      return false;
    }
  },
  async deleteRequirement(id: string) {
    try {
      const res = await fetch(`/api/mysql/requirements/${id}`, {
        method: "DELETE"
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to delete Requirement from MySQL:", err);
      return false;
    }
  },

  // Customer Requirements (Leads)
  async getCustomerRequirements() {
    try {
      const res = await fetch("/api/mysql/customer_requirements");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.warn("⚠️ Failed to fetch Customer Requirements from MySQL:", err);
      return [];
    }
  },
  async saveCustomerRequirement(data: any) {
    try {
      const res = await fetch("/api/mysql/customer_requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to save Customer Requirement to MySQL:", err);
      return false;
    }
  },
  async deleteCustomerRequirement(id: string) {
    try {
      const res = await fetch(`/api/mysql/customer_requirements/${id}`, {
        method: "DELETE"
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to delete Customer Requirement from MySQL:", err);
      return false;
    }
  },

  // Finance Entries
  async getFinanceEntries() {
    try {
      const res = await fetch("/api/mysql/finance_entries");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.warn("⚠️ Failed to fetch Finance Entries from MySQL:", err);
      return [];
    }
  },
  async saveFinanceEntry(data: any) {
    try {
      const res = await fetch("/api/mysql/finance_entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to save Finance Entry to MySQL:", err);
      return false;
    }
  },
  async deleteFinanceEntry(id: string) {
    try {
      const res = await fetch(`/api/mysql/finance_entries/${id}`, {
        method: "DELETE"
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to delete Finance Entry from MySQL:", err);
      return false;
    }
  },

  // CRM Documents
  async getDocuments() {
    try {
      const res = await fetch("/api/mysql/crm_documents");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.warn("⚠️ Failed to fetch CRM Documents from MySQL:", err);
      return [];
    }
  },
  async saveDocument(data: any) {
    try {
      const res = await fetch("/api/mysql/crm_documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to save CRM Document to MySQL:", err);
      return false;
    }
  },
  async deleteDocument(id: string) {
    try {
      const res = await fetch(`/api/mysql/crm_documents/${id}`, {
        method: "DELETE"
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to delete CRM Document from MySQL:", err);
      return false;
    }
  },

  // Chatbot Knowledge base & settings APIs
  async getChatbotKnowledge() {
    try {
      const res = await fetch("/api/mysql/chatbot_knowledge");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      return [];
    }
  },
  async saveChatbotKnowledge(data: any) {
    try {
      const res = await fetch("/api/mysql/chatbot_knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      return false;
    }
  },
  async deleteChatbotKnowledge(id: string) {
    try {
      const res = await fetch(`/api/mysql/chatbot_knowledge/${id}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      return false;
    }
  },

  async getChatbotDocuments() {
    try {
      const res = await fetch("/api/mysql/chatbot_documents");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      return [];
    }
  },
  async saveChatbotDocument(data: any) {
    try {
      const res = await fetch("/api/mysql/chatbot_documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      return false;
    }
  },
  async deleteChatbotDocument(id: string) {
    try {
      const res = await fetch(`/api/mysql/chatbot_documents/${id}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      return false;
    }
  },

  async getChatbotWebsites() {
    try {
      const res = await fetch("/api/mysql/chatbot_websites");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      return [];
    }
  },
  async saveChatbotWebsite(data: any) {
    try {
      const res = await fetch("/api/mysql/chatbot_websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      return false;
    }
  },
  async deleteChatbotWebsite(id: string) {
    try {
      const res = await fetch(`/api/mysql/chatbot_websites/${id}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      return false;
    }
  },

  async getChatbotSnippets() {
    try {
      const res = await fetch("/api/mysql/chatbot_snippets");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      return [];
    }
  },
  async saveChatbotSnippet(data: any) {
    try {
      const res = await fetch("/api/mysql/chatbot_snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      return false;
    }
  },
  async deleteChatbotSnippet(id: string) {
    try {
      const res = await fetch(`/api/mysql/chatbot_snippets/${id}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      return false;
    }
  },

  async getChatbotFlows() {
    try {
      const res = await fetch("/api/mysql/chatbot_flows");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      return [];
    }
  },
  async saveChatbotFlow(data: any) {
    try {
      const res = await fetch("/api/mysql/chatbot_flows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      return false;
    }
  },
  async deleteChatbotFlow(id: string) {
    try {
      const res = await fetch(`/api/mysql/chatbot_flows/${id}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      return false;
    }
  },

  async getQualificationRules() {
    try {
      const res = await fetch("/api/mysql/qualification_rules");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      return [];
    }
  },
  async saveQualificationRule(data: any) {
    try {
      const res = await fetch("/api/mysql/qualification_rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      return false;
    }
  },
  async deleteQualificationRule(id: string) {
    try {
      const res = await fetch(`/api/mysql/qualification_rules/${id}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      return false;
    }
  },

  async getChatbotAuditLogs() {
    try {
      const res = await fetch("/api/mysql/chatbot_audit_logs");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      return [];
    }
  },
  async saveChatbotAuditLog(data: any) {
    try {
      const res = await fetch("/api/mysql/chatbot_audit_logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      return false;
    }
  },
  async deleteChatbotAuditLog(id: string) {
    try {
      const res = await fetch(`/api/mysql/chatbot_audit_logs/${id}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      return false;
    }
  },

  async getAiPermissions() {
    try {
      const res = await fetch("/api/mysql/ai_permissions");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      return [];
    }
  },
  async saveAiPermission(data: any) {
    try {
      const res = await fetch("/api/mysql/ai_permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      return false;
    }
  },
  async deleteAiPermission(id: string) {
    try {
      const res = await fetch(`/api/mysql/ai_permissions/${id}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      return false;
    }
  },

  async getAiActivityLogs() {
    try {
      const res = await fetch("/api/mysql/ai_activity_logs");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      return [];
    }
  },
  async saveAiActivityLog(data: any) {
    try {
      const res = await fetch("/api/mysql/ai_activity_logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      return false;
    }
  },
  async deleteAiActivityLog(id: string) {
    try {
      const res = await fetch(`/api/mysql/ai_activity_logs/${id}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      return false;
    }
  },

  // Trigger migration for Phase 7
  async runPhase7Migration() {
    try {
      const res = await fetch("/api/mysql/migrate/phase7", {
        method: "POST"
      });
      return await res.json();
    } catch (err) {
      console.error("❌ Phase 7 Migration execution failed:", err);
      return { success: false, error: String(err) };
    }
  },

  // --- PROPERTIES ---
  async getProperties() {
    try {
      const res = await fetch("/api/mysql/properties");
      const json = await res.json();
      return json.success ? (json.properties || json.data || []) : [];
    } catch (err) {
      console.error("❌ Failed to fetch properties from MySQL:", err);
      return [];
    }
  },
  async saveProperty(data: any) {
    try {
      const res = await fetch("/api/mysql/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to save property to MySQL:", err);
      return false;
    }
  },
  async deleteProperty(id: string) {
    try {
      const res = await fetch(`/api/mysql/properties/${id}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to delete property from MySQL:", err);
      return false;
    }
  },

  // --- CATEGORIES ---
  async getCategories() {
    try {
      const res = await fetch("/api/mysql/categories");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.error("❌ Failed to fetch categories from MySQL:", err);
      return [];
    }
  },
  async saveCategory(data: any) {
    try {
      const res = await fetch("/api/mysql/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to save category to MySQL:", err);
      return false;
    }
  },
  async deleteCategory(id: string) {
    try {
      const res = await fetch(`/api/mysql/categories/${id}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to delete category from MySQL:", err);
      return false;
    }
  },

  // --- SEARCH CATEGORIES ---
  async getSearchCategories() {
    try {
      const res = await fetch("/api/mysql/search_categories");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.error("❌ Failed to fetch search categories from MySQL:", err);
      return [];
    }
  },
  async saveSearchCategory(data: any) {
    try {
      const res = await fetch("/api/mysql/search_categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to save search category to MySQL:", err);
      return false;
    }
  },
  async deleteSearchCategory(id: string) {
    try {
      const res = await fetch(`/api/mysql/search_categories/${id}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to delete search category from MySQL:", err);
      return false;
    }
  },

  // --- AGENTS ---
  async getAgents() {
    try {
      const res = await fetch("/api/mysql/agents");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.error("❌ Failed to fetch agents from MySQL:", err);
      return [];
    }
  },
  async saveAgent(data: any) {
    try {
      const res = await fetch("/api/mysql/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to save agent to MySQL:", err);
      return false;
    }
  },
  async deleteAgent(id: string) {
    try {
      const res = await fetch(`/api/mysql/agents/${id}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to delete agent from MySQL:", err);
      return false;
    }
  },

  // --- INQUIRIES ---
  async getInquiries() {
    try {
      const res = await fetch("/api/mysql/inquiries");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.error("❌ Failed to fetch inquiries from MySQL:", err);
      return [];
    }
  },
  async saveInquiry(data: any) {
    try {
      const res = await fetch("/api/mysql/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to save inquiry to MySQL:", err);
      return false;
    }
  },
  async deleteInquiry(id: string) {
    try {
      const res = await fetch(`/api/mysql/inquiries/${id}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to delete inquiry from MySQL:", err);
      return false;
    }
  },

  // --- CENTRAL ENQUIRIES ---
  async getCentralEnquiries() {
    try {
      const res = await fetch("/api/mysql/central_enquiries");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.error("❌ Failed to fetch central enquiries from MySQL:", err);
      return [];
    }
  },
  async saveCentralEnquiry(data: any) {
    try {
      const res = await fetch("/api/mysql/central_enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to save central enquiry to MySQL:", err);
      return false;
    }
  },
  async deleteCentralEnquiry(id: string) {
    try {
      const res = await fetch(`/api/mysql/central_enquiries/${id}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to delete central enquiry from MySQL:", err);
      return false;
    }
  },

  // --- SEO CONFIGS ---
  async getSeoConfigs() {
    try {
      const res = await fetch("/api/mysql/seo_configs");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.error("❌ Failed to fetch SEO configs from MySQL:", err);
      return [];
    }
  },
  async saveSeoConfig(data: any) {
    try {
      const res = await fetch("/api/mysql/seo_configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to save SEO config to MySQL:", err);
      return false;
    }
  },
  async deleteSeoConfig(id: string) {
    try {
      const res = await fetch(`/api/mysql/seo_configs/${id}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to delete SEO config from MySQL:", err);
      return false;
    }
  },

  // --- PROPERTY SEO CONFIGS ---
  async getPropertySeoConfigs() {
    try {
      const res = await fetch("/api/mysql/property_seo_configs");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.error("❌ Failed to fetch property SEO configs from MySQL:", err);
      return [];
    }
  },
  async savePropertySeoConfig(data: any) {
    try {
      const res = await fetch("/api/mysql/property_seo_configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to save property SEO config to MySQL:", err);
      return false;
    }
  },
  async deletePropertySeoConfig(id: string) {
    try {
      const res = await fetch(`/api/mysql/property_seo_configs/${id}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to delete property SEO config from MySQL:", err);
      return false;
    }
  },

  // --- SEO REDIRECT RULES ---
  async getSeoRedirectRules() {
    try {
      const res = await fetch("/api/mysql/seo_redirect_rules");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.error("❌ Failed to fetch SEO redirect rules from MySQL:", err);
      return [];
    }
  },
  async saveSeoRedirectRule(data: any) {
    try {
      const res = await fetch("/api/mysql/seo_redirect_rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to save SEO redirect rule to MySQL:", err);
      return false;
    }
  },
  async deleteSeoRedirectRule(id: string) {
    try {
      const res = await fetch(`/api/mysql/seo_redirect_rules/${id}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to delete SEO redirect rule from MySQL:", err);
      return false;
    }
  },

  // --- SITE CMS CONFIG ---
  async getSiteCmsConfig() {
    try {
      const res = await fetch("/api/mysql/site_cms_config");
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      console.error("❌ Failed to fetch site CMS config from MySQL:", err);
      return null;
    }
  },
  async saveSiteCmsConfig(data: any) {
    try {
      const res = await fetch("/api/mysql/site_cms_config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to save site CMS config to MySQL:", err);
      return false;
    }
  },
  async deleteSiteCmsConfig(id: string) {
    try {
      const res = await fetch(`/api/mysql/site_cms_config/${id}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to delete site CMS config from MySQL:", err);
      return false;
    }
  },

  // --- HERO BANNERS ---
  async getHeroBanners() {
    try {
      const res = await fetch("/api/mysql/hero_banners");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.error("❌ Failed to fetch hero banners from MySQL:", err);
      return [];
    }
  },
  async saveHeroBanner(data: any) {
    try {
      const res = await fetch("/api/mysql/hero_banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to save hero banner to MySQL:", err);
      return false;
    }
  },
  async deleteHeroBanner(id: string) {
    try {
      const res = await fetch(`/api/mysql/hero_banners/${id}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to delete hero banner from MySQL:", err);
      return false;
    }
  },

  // --- FAQS ---
  async getFaqs() {
    try {
      const res = await fetch("/api/mysql/faqs");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.error("❌ Failed to fetch FAQs from MySQL:", err);
      return [];
    }
  },
  async saveFaq(data: any) {
    try {
      const res = await fetch("/api/mysql/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to save FAQ to MySQL:", err);
      return false;
    }
  },
  async deleteFaq(id: string) {
    try {
      const res = await fetch(`/api/mysql/faqs/${id}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to delete FAQ from MySQL:", err);
      return false;
    }
  },

  // --- QUICK FILTERS ---
  async getQuickFilters() {
    try {
      const res = await fetch("/api/mysql/quick_filters");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.error("❌ Failed to fetch quick filters from MySQL:", err);
      return [];
    }
  },
  async saveQuickFilter(data: any) {
    try {
      const res = await fetch("/api/mysql/quick_filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to save quick filter to MySQL:", err);
      return false;
    }
  },
  async deleteQuickFilter(id: string) {
    try {
      const res = await fetch(`/api/mysql/quick_filters/${id}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to delete quick filter from MySQL:", err);
      return false;
    }
  },

  // --- ROUTING RULES ---
  async getRoutingRules() {
    try {
      const res = await fetch("/api/mysql/routing_rules");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.error("❌ Failed to fetch routing rules from MySQL:", err);
      return [];
    }
  },
  async saveRoutingRule(data: any) {
    try {
      const res = await fetch("/api/mysql/routing_rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to save routing rule to MySQL:", err);
      return false;
    }
  },
  async deleteRoutingRule(id: string) {
    try {
      const res = await fetch(`/api/mysql/routing_rules/${id}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to delete routing rule from MySQL:", err);
      return false;
    }
  },

  // --- SETTINGS ---
  async getSettings() {
    try {
      const res = await fetch("/api/mysql/settings");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.error("❌ Failed to fetch settings from MySQL:", err);
      return [];
    }
  },
  async saveSetting(key: string, data: any) {
    try {
      const res = await fetch(`/api/mysql/settings/${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      console.error(`❌ Failed to save setting ${key} to MySQL:`, err);
      return false;
    }
  },
  async deleteSetting(key: string) {
    try {
      const res = await fetch(`/api/mysql/settings/${key}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      console.error(`❌ Failed to delete setting ${key} from MySQL:`, err);
      return false;
    }
  },

  // --- THEME PRESETS ---
  async getThemePresets() {
    try {
      const res = await fetch("/api/mysql/theme_presets");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.error("❌ Failed to fetch theme presets from MySQL:", err);
      return [];
    }
  },
  async saveThemePreset(data: any) {
    try {
      const res = await fetch("/api/mysql/theme_presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to save theme preset to MySQL:", err);
      return false;
    }
  },
  async deleteThemePreset(id: string) {
    try {
      const res = await fetch(`/api/mysql/theme_presets/${id}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to delete theme preset from MySQL:", err);
      return false;
    }
  },

  // --- MAP LOCATIONS ---
  async getMapLocations() {
    try {
      const res = await fetch("/api/mysql/map_locations");
      const json = await res.json();
      return json.success ? json.data : {};
    } catch (err) {
      console.error("❌ Failed to fetch map locations from MySQL:", err);
      return {};
    }
  },
  async saveMapLocation(data: any) {
    try {
      const res = await fetch("/api/mysql/map_locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to save map location to MySQL:", err);
      return false;
    }
  },
  async deleteMapLocation(name: string) {
    try {
      const res = await fetch(`/api/mysql/map_locations/${name}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to delete map location from MySQL:", err);
      return false;
    }
  },

  // --- ADMIN USERS ---
  async getAdminUsers() {
    try {
      const res = await fetch("/api/mysql/admin_users");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.error("❌ Failed to fetch admin users from MySQL:", err);
      return [];
    }
  },
  async saveAdminUser(data: any) {
    try {
      const res = await fetch("/api/mysql/admin_users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to save admin user to MySQL:", err);
      return false;
    }
  },
  async deleteAdminUser(id: string) {
    try {
      const res = await fetch(`/api/mysql/admin_users/${id}`, { method: "DELETE" });
      return (await res.json()).success;
    } catch (err) {
      console.error("❌ Failed to delete admin user from MySQL:", err);
      return false;
    }
  }
};
