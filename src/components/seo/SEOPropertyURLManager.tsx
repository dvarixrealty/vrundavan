import React, { useState, useEffect } from 'react';
import { 
  Globe, FileText, CheckCircle2, XCircle, AlertTriangle, Trash2, Edit2, Copy, 
  Search, SlidersHorizontal, ArrowUpDown, Check, RotateCcw, Sparkles, 
  Archive, Save, MoreVertical, Download, History, Eye, Link2, Settings, 
  Shuffle, Square, CheckSquare, PlusCircle, ArrowRight, ExternalLink, RefreshCw
} from 'lucide-react';
import { getLocalCache, setLocalCache, CACHE_KEYS } from '../../utils/localStorageCache';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';

// Define Interface for Property SEO Configuration
export interface PropertySEOConfig {
  id: string; // matches property.id
  propertyName: string;
  urlSlug: string;
  fullUrl: string;
  canonicalUrl: string;
  seoTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: 'summary' | 'summary_large_image';
  robotsIndex: boolean;
  robotsFollow: boolean;
  seoStatus: 'Optimized' | 'Needs Review' | 'Critical';
  indexStatus: 'Indexed' | 'Not Indexed' | 'Pending Crawl';
  publishedStatus: 'Published' | 'Draft' | 'Archived';
  lastModified: string;
  lastCrawl?: string;
  sitemapStatus: 'Included' | 'Excluded';
  brokenUrlDetection: 'Active' | 'Redirect Loop' | '404 Error' | 'Healthy';
  redirectStatus: string; // e.g. "None" or "Active Redirect (1)"
  canonicalStatus: 'Self-Referential' | 'Mismatched' | 'Custom Override';
  urlHistory: {
    oldSlug: string;
    newSlug: string;
    date: string;
    redirectId?: string;
  }[];
}

interface SEOPropertyURLManagerProps {
  properties: any[];
  loggedInUser?: {
    email: string;
    role: string;
  };
  triggerToast: (text: string, type?: 'success' | 'error') => void;
  onRefreshPages?: () => void;
}

const RESERVED_WORDS = ['admin', 'api', 'login', 'insights', 'about', 'contact', 'privacy-policy', 'terms-conditions', 'properties', 'dashboard', 'static', 'cms'];

export default function SEOPropertyURLManager({
  properties,
  loggedInUser = { email: 'dvarixrealty@gmail.com', role: 'Super Admin' },
  triggerToast,
  onRefreshPages
}: SEOPropertyURLManagerProps) {
  // Primary States
  const [configs, setConfigs] = useState<PropertySEOConfig[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [builderFilter, setBuilderFilter] = useState('All');
  const [publishedFilter, setPublishedFilter] = useState('All');
  const [indexFilter, setIndexFilter] = useState('All');
  const [sortField, setSortField] = useState<'propertyName' | 'lastModified' | 'urlSlug'>('propertyName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Bulk Operations State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog / Edit Modal States
  const [editingConfig, setEditingConfig] = useState<PropertySEOConfig | null>(null);
  const [historyConfig, setHistoryConfig] = useState<PropertySEOConfig | null>(null);
  const [previewConfig, setPreviewConfig] = useState<PropertySEOConfig | null>(null);
  
  // Custom Edit Fields (used in editingConfig modal)
  const [editSlug, setEditSlug] = useState('');
  const [slugSuggestion, setSlugSuggestion] = useState('');
  const [slugValidationErrors, setSlugValidationErrors] = useState<string[]>([]);
  
  const [editSeoTitle, setEditSeoTitle] = useState('');
  const [editMetaDescription, setEditMetaDescription] = useState('');
  const [editMetaKeywords, setEditMetaKeywords] = useState('');
  const [editCanonicalUrl, setEditCanonicalUrl] = useState('');
  const [editOgTitle, setEditOgTitle] = useState('');
  const [editOgDescription, setEditOgDescription] = useState('');
  const [editOgImage, setEditOgImage] = useState('');
  const [editTwitterCard, setEditTwitterCard] = useState<'summary' | 'summary_large_image'>('summary_large_image');
  const [editRobotsIndex, setEditRobotsIndex] = useState(true);
  const [editRobotsFollow, setEditRobotsFollow] = useState(true);
  
  // Bulk actions popovers
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkPrefix, setBulkPrefix] = useState('');
  const [bulkSuffix, setBulkSuffix] = useState('');
  const [bulkReplaceFrom, setBulkReplaceFrom] = useState('');
  const [bulkReplaceTo, setBulkReplaceTo] = useState('');

  // Role check
  const isReadOnly = loggedInUser?.role === 'Sales Agent';

  // Seed / Load configs
  useEffect(() => {
    const cachedConfigs = getLocalCache<PropertySEOConfig[]>('dvarix_cache_property_seo_configs', []);
    
    // Seed default configs if cache is empty or doesn't have configs for all loaded properties
    if (properties && properties.length > 0) {
      const mergedConfigs: PropertySEOConfig[] = [];
      
      properties.forEach((prop) => {
        const existing = cachedConfigs.find((c) => c.id === prop.id);
        if (existing) {
          // Keep existing, but ensure property title is sync'd
          mergedConfigs.push({
            ...existing,
            propertyName: prop.title
          });
        } else {
          // Create pristine configuration from property fields
          const fallbackSlug = prop.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
          
          mergedConfigs.push({
            id: prop.id,
            propertyName: prop.title,
            urlSlug: fallbackSlug,
            fullUrl: `https://dvarixrealty.com/properties/${fallbackSlug}`,
            canonicalUrl: `https://dvarixrealty.com/properties/${fallbackSlug}`,
            seoTitle: `${prop.title} | Premium Plots & Bespoke Villas | Dvarix Realty`,
            metaDescription: prop.description ? prop.description.slice(0, 155) + '...' : `Explore premium properties like ${prop.title} situated in Bengaluru's finest corridors. Zero brokerage, 100% verified listings.`,
            metaKeywords: `${prop.title.toLowerCase()}, bangalore real estate, dvarix plots`,
            ogTitle: `${prop.title} - Gated Layouts`,
            ogDescription: prop.description ? prop.description.slice(0, 120) + '...' : `Explore premium listings at ${prop.title} in Bengaluru.`,
            ogImage: prop.image || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
            twitterCard: 'summary_large_image',
            robotsIndex: true,
            robotsFollow: true,
            seoStatus: 'Optimized',
            indexStatus: Math.random() > 0.3 ? 'Indexed' : 'Pending Crawl',
            publishedStatus: 'Published',
            lastModified: new Date().toISOString(),
            lastCrawl: new Date(Date.now() - Math.floor(Math.random() * 5 + 1) * 24 * 3600 * 1000).toISOString().split('T')[0],
            sitemapStatus: 'Included',
            brokenUrlDetection: 'Healthy',
            redirectStatus: 'None',
            canonicalStatus: 'Self-Referential',
            urlHistory: []
          });
        }
      });

      // Save back to local cache
      setLocalCache('dvarix_cache_property_seo_configs', mergedConfigs);
      setConfigs(mergedConfigs);
    }
  }, [properties]);

  // Handle live validations of custom input slug
  useEffect(() => {
    if (!editingConfig) return;
    validateSlug(editSlug);
  }, [editSlug, editingConfig]);

  // Slug Validator & Automatic suggestion corrector
  const validateSlug = (slug: string) => {
    const errors: string[] = [];
    
    if (!slug) {
      errors.push('Slug cannot be empty.');
      setSlugValidationErrors(errors);
      setSlugSuggestion('');
      return;
    }

    // 1. Reserved words
    if (RESERVED_WORDS.includes(slug.toLowerCase())) {
      errors.push(`"${slug}" is a reserved system word.`);
    }

    // 2. Spaces
    if (/\s/.test(slug)) {
      errors.push('Slug contains spaces (use hyphens instead).');
    }

    // 3. Uppercase
    if (/[A-Z]/.test(slug)) {
      errors.push('Slug contains uppercase characters (URLs should be lowercase).');
    }

    // 4. Invalid characters
    if (/[^a-z0-9\-_]/.test(slug)) {
      errors.push('Slug contains invalid characters (only lowercase letters, numbers, and hyphens/underscores are allowed).');
    }

    // 5. Duplicate
    const isDuplicate = configs.some(c => c.id !== editingConfig?.id && c.urlSlug === slug);
    if (isDuplicate) {
      errors.push('This slug is already assigned to another property.');
    }

    setSlugValidationErrors(errors);

    // Generate suggested correction
    let correct = slug.toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-z0-9\-_]+/g, ''); // Strip bad characters
    
    // Check if reserved and append suffix
    if (RESERVED_WORDS.includes(correct)) {
      correct = `${correct}-plots`;
    }
    
    // Check duplicate and append suffix
    if (configs.some(c => c.id !== editingConfig?.id && c.urlSlug === correct)) {
      correct = `${correct}-villa`;
    }

    if (correct !== slug) {
      setSlugSuggestion(correct);
    } else {
      setSlugSuggestion('');
    }
  };

  // Extract list of cities and builders for filters
  const cities = Array.from(new Set(properties.map(p => p.address?.split(',')[0]?.trim() || p.city || 'Bangalore')));
  const builders = Array.from(new Set(properties.map(p => p.builderName || 'Dvarix')));

  // Search, Filter and Sort
  const filteredConfigs = configs.filter((c) => {
    // Find matching property details
    const prop = properties.find(p => p.id === c.id);
    const propCity = prop?.address?.split(',')[0]?.trim() || prop?.city || 'Bangalore';
    const propBuilder = prop?.builderName || 'Dvarix';

    const matchesSearch = 
      c.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.urlSlug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCity = cityFilter === 'All' || propCity === cityFilter;
    const matchesBuilder = builderFilter === 'All' || propBuilder === builderFilter;
    const matchesPublished = publishedFilter === 'All' || c.publishedStatus === publishedFilter;
    const matchesIndex = indexFilter === 'All' || c.indexStatus === indexFilter;

    return matchesSearch && matchesCity && matchesBuilder && matchesPublished && matchesIndex;
  }).sort((a, b) => {
    let fieldA = a[sortField];
    let fieldB = b[sortField];

    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === 'asc' 
        ? fieldA.localeCompare(fieldB) 
        : fieldB.localeCompare(fieldA);
    }
    return 0;
  });

  const handleSort = (field: 'propertyName' | 'lastModified' | 'urlSlug') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredConfigs.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  // Copy to clipboard
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    triggerToast('Copied full property URL to clipboard!', 'success');
  };

  // View property page (triggers custom event to view modal in main preview)
  const handlePreviewPropertyPage = (propertyId: string) => {
    const prop = properties.find(p => p.id === propertyId);
    if (prop) {
      const customEvent = new CustomEvent('realty-navigate', { detail: { tab: 'Properties' } });
      window.dispatchEvent(customEvent);
      
      // Select the property by dispatching an event that App.tsx captures or setting state
      const selectEvent = new CustomEvent('select-property', { detail: { property: prop } });
      window.dispatchEvent(selectEvent);
      
      triggerToast(`Switching to live Property view: ${prop.title}`, 'success');
    }
  };

  // Edit action
  const handleOpenEditModal = (config: PropertySEOConfig) => {
    setEditingConfig(config);
    setEditSlug(config.urlSlug);
    setEditSeoTitle(config.seoTitle);
    setEditMetaDescription(config.metaDescription);
    setEditMetaKeywords(config.metaKeywords);
    setEditCanonicalUrl(config.canonicalUrl);
    setEditOgTitle(config.ogTitle);
    setEditOgDescription(config.ogDescription);
    setEditOgImage(config.ogImage);
    setEditTwitterCard(config.twitterCard || 'summary_large_image');
    setEditRobotsIndex(config.robotsIndex);
    setEditRobotsFollow(config.robotsFollow);
  };

  // Apply corrected suggestion to input
  const handleApplyCorrection = () => {
    if (slugSuggestion) {
      setEditSlug(slugSuggestion);
      setSlugSuggestion('');
    }
  };

  // Save Config and generate 301 Redirect Rules
  const handleSaveConfig = async () => {
    if (isReadOnly) {
      triggerToast('Error: Sales Agent role cannot modify URLs.', 'error');
      return;
    }

    if (slugValidationErrors.length > 0) {
      triggerToast('Please resolve slug validation errors before saving.', 'error');
      return;
    }

    if (!editingConfig) return;

    const originalSlug = editingConfig.urlSlug;
    const isSlugChanged = originalSlug !== editSlug;
    
    // 1. Maintain History & create Redirect Rule if Slug Changed
    const updatedHistory = [...(editingConfig.urlHistory || [])];
    if (isSlugChanged) {
      // Add to local history list
      updatedHistory.push({
        oldSlug: originalSlug,
        newSlug: editSlug,
        date: new Date().toISOString()
      });

      // Automatically create a 301 redirect rule in SEO Redirect rules cache!
      const existingRedirects = getLocalCache<any[]>(CACHE_KEYS.SEO_REDIRECTS, []);
      const redirectId = `redirect-prop-${Date.now()}`;
      const newRedirect = {
        id: redirectId,
        fromUrl: `/properties/${originalSlug}`,
        toUrl: `/properties/${editSlug}`,
        type: '301',
        dateAdded: new Date().toISOString(),
        clicks: 0
      };

      const updatedRedirects = [newRedirect, ...existingRedirects];
      setLocalCache(CACHE_KEYS.SEO_REDIRECTS, updatedRedirects);

      // Trigger a reload event for redirects in parent component
      window.dispatchEvent(new CustomEvent('seo-redirects-updated'));
      triggerToast(`Automatically created a 301 Redirect: /properties/${originalSlug} ➔ /properties/${editSlug}`, 'success');
    }

    // Determine SEO score and status
    const isTitleGood = editSeoTitle.length >= 40 && editSeoTitle.length <= 70;
    const isDescGood = editMetaDescription.length >= 100 && editMetaDescription.length <= 160;
    const seoStatus = (isTitleGood && isDescGood) ? 'Optimized' : 'Needs Review';

    const updatedConfig: PropertySEOConfig = {
      ...editingConfig,
      urlSlug: editSlug,
      fullUrl: `https://dvarixrealty.com/properties/${editSlug}`,
      canonicalUrl: editCanonicalUrl || `https://dvarixrealty.com/properties/${editSlug}`,
      seoTitle: editSeoTitle,
      metaDescription: editMetaDescription,
      metaKeywords: editMetaKeywords,
      ogTitle: editOgTitle,
      ogDescription: editOgDescription,
      ogImage: editOgImage,
      twitterCard: editTwitterCard,
      robotsIndex: editRobotsIndex,
      robotsFollow: editRobotsFollow,
      seoStatus,
      lastModified: new Date().toISOString(),
      urlHistory: updatedHistory,
      redirectStatus: updatedHistory.length > 0 ? `Active Redirects (${updatedHistory.length})` : 'None',
      canonicalStatus: editCanonicalUrl === `https://dvarixrealty.com/properties/${editSlug}` ? 'Self-Referential' : 'Custom Override'
    };

    // Update in general lists
    const updatedConfigs = configs.map(c => c.id === editingConfig.id ? updatedConfig : c);
    setConfigs(updatedConfigs);
    setLocalCache('dvarix_cache_property_seo_configs', updatedConfigs);

    // Sync to Firestore
    try {
      await setDoc(doc(db, 'property_seo_configs', editingConfig.id), updatedConfig);
    } catch (e) {
      console.warn('Fallback to local storage caching: Firestore quota hit.', e);
    }

    setEditingConfig(null);
    triggerToast('Property URL settings and metadata saved successfully!', 'success');

    if (onRefreshPages) {
      onRefreshPages();
    }
  };

  // Regenerate SEO Slug automatically
  const handleRegenerateSEO = (config: PropertySEOConfig) => {
    const freshSlug = config.propertyName.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    
    // Set edit slug which triggers validations
    setEditSlug(freshSlug);
    triggerToast('Generated SEO friendly URL slug from title.', 'success');
  };

  // Bulk operation actions
  const handleBulkGenerateSlugs = () => {
    if (isReadOnly) return;
    if (selectedIds.length === 0) {
      triggerToast('No properties selected.', 'error');
      return;
    }

    const updated = configs.map(c => {
      if (selectedIds.includes(c.id)) {
        const freshSlug = c.propertyName.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        return {
          ...c,
          urlSlug: freshSlug,
          fullUrl: `https://dvarixrealty.com/properties/${freshSlug}`,
          canonicalUrl: `https://dvarixrealty.com/properties/${freshSlug}`,
          lastModified: new Date().toISOString()
        };
      }
      return c;
    });

    setConfigs(updated);
    setLocalCache('dvarix_cache_property_seo_configs', updated);
    triggerToast(`Bulk regenerated slugs for ${selectedIds.length} properties!`, 'success');
    setSelectedIds([]);
  };

  const handleBulkPublish = (publish: boolean) => {
    if (isReadOnly) return;
    if (selectedIds.length === 0) {
      triggerToast('No properties selected.', 'error');
      return;
    }

    const updated = configs.map(c => {
      if (selectedIds.includes(c.id)) {
        return {
          ...c,
          publishedStatus: publish ? 'Published' : 'Draft' as any,
          lastModified: new Date().toISOString()
        };
      }
      return c;
    });

    setConfigs(updated);
    setLocalCache('dvarix_cache_property_seo_configs', updated);
    triggerToast(`Bulk set ${selectedIds.length} properties to ${publish ? 'Published' : 'Draft'}!`, 'success');
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (isReadOnly) return;
    if (selectedIds.length === 0) {
      triggerToast('No properties selected.', 'error');
      return;
    }

    const updated = configs.map(c => {
      if (selectedIds.includes(c.id)) {
        const fallbackSlug = c.propertyName.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        return {
          ...c,
          urlSlug: fallbackSlug,
          fullUrl: `https://dvarixrealty.com/properties/${fallbackSlug}`,
          canonicalUrl: `https://dvarixrealty.com/properties/${fallbackSlug}`,
          robotsIndex: true,
          robotsFollow: true,
          publishedStatus: 'Draft' as any,
          urlHistory: [],
          redirectStatus: 'None',
          lastModified: new Date().toISOString()
        };
      }
      return c;
    });

    setConfigs(updated);
    setLocalCache('dvarix_cache_property_seo_configs', updated);
    triggerToast(`Reset URL configurations for ${selectedIds.length} properties.`, 'success');
    setSelectedIds([]);
  };

  const handleBulkEditSubmit = () => {
    if (isReadOnly) return;
    const updated = configs.map(c => {
      if (selectedIds.includes(c.id)) {
        let newSlug = c.urlSlug;
        if (bulkPrefix) {
          newSlug = `${bulkPrefix}-${newSlug}`;
        }
        if (bulkSuffix) {
          newSlug = `${newSlug}-${bulkSuffix}`;
        }
        if (bulkReplaceFrom) {
          newSlug = newSlug.split(bulkReplaceFrom).join(bulkReplaceTo);
        }
        
        // Clean the new slug
        newSlug = newSlug.toLowerCase().replace(/[^a-z0-9\-_]+/g, '');

        return {
          ...c,
          urlSlug: newSlug,
          fullUrl: `https://dvarixrealty.com/properties/${newSlug}`,
          canonicalUrl: `https://dvarixrealty.com/properties/${newSlug}`,
          lastModified: new Date().toISOString()
        };
      }
      return c;
    });

    setConfigs(updated);
    setLocalCache('dvarix_cache_property_seo_configs', updated);
    setShowBulkEditModal(false);
    setSelectedIds([]);
    setBulkPrefix('');
    setBulkSuffix('');
    setBulkReplaceFrom('');
    setBulkReplaceTo('');
    triggerToast('Bulk edit of URL slugs completed successfully!', 'success');
  };

  const handleBulkRegenerateSEO = () => {
    if (isReadOnly) return;
    if (selectedIds.length === 0) {
      triggerToast('No properties selected.', 'error');
      return;
    }

    const updated = configs.map(c => {
      if (selectedIds.includes(c.id)) {
        const prop = properties.find(p => p.id === c.id);
        const seoTitle = `${c.propertyName} | Premium Gated Community Plots | Dvarix Realty`;
        const metaDescription = prop?.description 
          ? prop.description.slice(0, 155) + '...' 
          : `Premium residential villa plot project at ${c.propertyName} Bangalore with outstanding ROI and world-class utilities. Book site visits today!`;
        return {
          ...c,
          seoTitle,
          metaDescription,
          ogTitle: seoTitle,
          ogDescription: metaDescription,
          lastModified: new Date().toISOString(),
          seoStatus: 'Optimized' as any
        };
      }
      return c;
    });

    setConfigs(updated);
    setLocalCache('dvarix_cache_property_seo_configs', updated);
    triggerToast(`Bulk optimized SEO meta headings for ${selectedIds.length} properties!`, 'success');
    setSelectedIds([]);
  };

  // URL history actions
  const handleRestoreHistorySlug = (oldSlug: string) => {
    if (!historyConfig) return;
    const currentSlug = historyConfig.urlSlug;
    
    // Set current slug to older slug
    const updatedHistory = historyConfig.urlHistory.filter(h => h.oldSlug !== oldSlug);
    
    const updatedConfig: PropertySEOConfig = {
      ...historyConfig,
      urlSlug: oldSlug,
      fullUrl: `https://dvarixrealty.com/properties/${oldSlug}`,
      canonicalUrl: `https://dvarixrealty.com/properties/${oldSlug}`,
      urlHistory: updatedHistory,
      redirectStatus: updatedHistory.length > 0 ? `Active Redirects (${updatedHistory.length})` : 'None',
      lastModified: new Date().toISOString()
    };

    const updatedConfigs = configs.map(c => c.id === historyConfig.id ? updatedConfig : c);
    setConfigs(updatedConfigs);
    setLocalCache('dvarix_cache_property_seo_configs', updatedConfigs);

    setHistoryConfig(updatedConfig);
    triggerToast(`Restored previous URL slug: /properties/${oldSlug}`, 'success');
  };

  const handleDeleteHistoryRedirect = (oldSlug: string) => {
    if (!historyConfig) return;
    
    // Delete from history
    const updatedHistory = historyConfig.urlHistory.filter(h => h.oldSlug !== oldSlug);
    
    // Delete from central redirects cache
    const existingRedirects = getLocalCache<any[]>(CACHE_KEYS.SEO_REDIRECTS, []);
    const updatedRedirects = existingRedirects.filter(r => r.fromUrl !== `/properties/${oldSlug}`);
    setLocalCache(CACHE_KEYS.SEO_REDIRECTS, updatedRedirects);
    window.dispatchEvent(new CustomEvent('seo-redirects-updated'));

    const updatedConfig: PropertySEOConfig = {
      ...historyConfig,
      urlHistory: updatedHistory,
      redirectStatus: updatedHistory.length > 0 ? `Active Redirects (${updatedHistory.length})` : 'None'
    };

    const updatedConfigs = configs.map(c => c.id === historyConfig.id ? updatedConfig : c);
    setConfigs(updatedConfigs);
    setLocalCache('dvarix_cache_property_seo_configs', updatedConfigs);

    setHistoryConfig(updatedConfig);
    triggerToast('Deleted associated 301 Redirect rule.', 'success');
  };

  const handleExportHistoryCSV = (config: PropertySEOConfig) => {
    if (!config.urlHistory || config.urlHistory.length === 0) {
      triggerToast('No history available to export.', 'error');
      return;
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date Changed,Previous URL Slug,Redirect Destination\n"
      + config.urlHistory.map(h => `"${h.date}","${h.oldSlug}","${h.newSlug}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SEO_History_Export_${config.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Exported URL history log as CSV!', 'success');
  };

  return (
    <div className="space-y-6" id="seo-property-url-manager-component">
      
      {/* HEADER OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#121620]/60 border border-slate-900 rounded-xl p-4 flex items-center justify-between shadow-md">
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-black tracking-widest block">Managed Paths</span>
            <span className="text-xl font-bold text-slate-100 font-mono mt-1 block">{configs.length}</span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <Globe className="w-5 h-5 text-[#C89B3C]" />
          </div>
        </div>

        <div className="bg-[#121620]/60 border border-slate-900 rounded-xl p-4 flex items-center justify-between shadow-md">
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-black tracking-widest block">Indexed in Search</span>
            <span className="text-xl font-bold text-emerald-400 font-mono mt-1 block">
              {configs.filter(c => c.robotsIndex).length}
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="bg-[#121620]/60 border border-slate-900 rounded-xl p-4 flex items-center justify-between shadow-md">
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-black tracking-widest block">Healthy Redirects</span>
            <span className="text-xl font-bold text-indigo-400 font-mono mt-1 block">
              {configs.reduce((acc, c) => acc + (c.urlHistory?.length || 0), 0)}
            </span>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin-slow" />
          </div>
        </div>

        <div className="bg-[#121620]/60 border border-slate-900 rounded-xl p-4 flex items-center justify-between shadow-md">
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-black tracking-widest block">SEO Validation Status</span>
            <span className="text-xl font-bold text-amber-500 font-mono mt-1 block">
              {configs.filter(c => c.seoStatus === 'Needs Review').length} Review
            </span>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
        </div>
      </div>

      {/* FILTER & CONTROL PANEL */}
      <div className="bg-[#0D1016] border border-slate-900 rounded-xl p-4 space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search property, ID, or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121620]/80 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-[#C89B3C]/50 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5 bg-[#121620] border border-slate-800/80 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-400">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#C89B3C]" /> Filters
            </div>

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-[#121620] border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:border-[#C89B3C]/50 outline-none font-medium"
            >
              <option value="All">All Cities</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={builderFilter}
              onChange={(e) => setBuilderFilter(e.target.value)}
              className="bg-[#121620] border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:border-[#C89B3C]/50 outline-none font-medium"
            >
              <option value="All">All Builders</option>
              {builders.map(b => <option key={b} value={b}>{b}</option>)}
            </select>

            <select
              value={publishedFilter}
              onChange={(e) => setPublishedFilter(e.target.value)}
              className="bg-[#121620] border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:border-[#C89B3C]/50 outline-none font-medium"
            >
              <option value="All">All Published</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>

            <select
              value={indexFilter}
              onChange={(e) => setIndexFilter(e.target.value)}
              className="bg-[#121620] border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:border-[#C89B3C]/50 outline-none font-medium"
            >
              <option value="All">All Indexing</option>
              <option value="Indexed">Indexed</option>
              <option value="Pending Crawl">Pending Crawl</option>
            </select>
          </div>
        </div>

        {/* BULK ACTIONS BANNER */}
        {selectedIds.length > 0 && (
          <div className="bg-[#C89B3C]/10 border border-[#C89B3C]/35 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-[#C89B3C] rounded-md text-slate-950 flex items-center justify-center font-bold text-xs">
                {selectedIds.length}
              </span>
              <span className="text-xs text-slate-200 font-bold">properties selected for bulk operation</span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleBulkGenerateSlugs}
                className="px-2.5 py-1.5 bg-[#121620] hover:bg-slate-850 border border-slate-800 rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-[#C89B3C] flex items-center gap-1"
              >
                <Shuffle className="w-3 h-3" /> Auto Slugs
              </button>
              <button 
                onClick={() => setShowBulkEditModal(true)}
                className="px-2.5 py-1.5 bg-[#121620] hover:bg-slate-850 border border-slate-800 rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-[#C89B3C] flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" /> Bulk Edit Slugs
              </button>
              <button 
                onClick={handleBulkRegenerateSEO}
                className="px-2.5 py-1.5 bg-[#121620] hover:bg-slate-850 border border-slate-800 rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Optimize SEO Meta
              </button>
              <button 
                onClick={() => handleBulkPublish(true)}
                className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-emerald-400"
              >
                Publish
              </button>
              <button 
                onClick={() => handleBulkPublish(false)}
                className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-amber-400"
              >
                Draft
              </button>
              <button 
                onClick={handleBulkDelete}
                className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Reset
              </button>
              <button 
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-400"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CORE PROPERTY URL TABLE */}
      <div className="bg-[#0A0D12] border border-slate-900 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#121620]/40 border-b border-slate-900 text-slate-400 font-extrabold uppercase tracking-widest text-[10px]">
                <th className="py-4 px-4 w-10">
                  <button 
                    onClick={() => handleSelectAll(selectedIds.length !== filteredConfigs.length)}
                    className="p-1 hover:text-[#C89B3C] transition"
                  >
                    {selectedIds.length === filteredConfigs.length ? (
                      <CheckSquare className="w-4 h-4 text-[#C89B3C]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-4 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('propertyName')}>
                  <div className="flex items-center gap-1.5">
                    Property Name {sortField === 'propertyName' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </th>
                <th className="py-4 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('urlSlug')}>
                  <div className="flex items-center gap-1.5">
                    Slug Path {sortField === 'urlSlug' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </th>
                <th className="py-4 px-4">SEO/Index Status</th>
                <th className="py-4 px-4">Canonical Status</th>
                <th className="py-4 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('lastModified')}>
                  <div className="flex items-center gap-1.5">
                    Last Modified {sortField === 'lastModified' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60 font-medium text-slate-300">
              {filteredConfigs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    <Globe className="w-8 h-8 text-slate-600 mx-auto mb-2.5 animate-pulse" />
                    No property SEO URL configurations matched the criteria.
                  </td>
                </tr>
              ) : (
                filteredConfigs.map((config) => {
                  return (
                    <tr key={config.id} className="hover:bg-slate-950/40 transition">
                      {/* Checkbox Selection */}
                      <td className="py-3.5 px-4">
                        <button 
                          onClick={() => handleSelectRow(config.id, !selectedIds.includes(config.id))}
                          className="p-1 hover:text-[#C89B3C] transition text-slate-500"
                        >
                          {selectedIds.includes(config.id) ? (
                            <CheckSquare className="w-4 h-4 text-[#C89B3C]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="font-bold text-slate-200">{config.propertyName}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{config.id}</div>
                        </div>
                      </td>

                      {/* Slug & Full URL link info */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="space-y-1">
                          <span className="text-[11px] text-[#C89B3C] bg-[#C89B3C]/10 border border-[#C89B3C]/20 px-1.5 py-0.5 rounded-md">
                            /{config.urlSlug}
                          </span>
                          <div className="text-[10px] text-slate-500 truncate max-w-xs block">
                            https://dvarixrealty.com/properties/{config.urlSlug}
                          </div>
                        </div>
                      </td>

                      {/* SEO & Indexing Status indicators */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5">
                            {config.publishedStatus === 'Published' ? (
                              <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider">
                                Published
                              </span>
                            ) : config.publishedStatus === 'Draft' ? (
                              <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] text-amber-400 font-extrabold uppercase tracking-wider">
                                Draft
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-slate-500/10 border border-slate-500/20 rounded text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">
                                Archived
                              </span>
                            )}

                            {config.robotsIndex ? (
                              <span className="px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[9px] text-indigo-400 font-extrabold uppercase tracking-wider">
                                Index, Follow
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded text-[9px] text-rose-400 font-extrabold uppercase tracking-wider">
                                NoIndex, NoFollow
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-[10px] font-bold">
                            {config.seoStatus === 'Optimized' ? (
                              <span className="text-emerald-400 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-400" /> Optimized Meta
                              </span>
                            ) : (
                              <span className="text-amber-500 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-500" /> Meta Review Needed
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Canonical & Sitemap Status */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Link2 className="w-3 h-3 text-slate-500" /> {config.canonicalStatus}
                          </div>
                          <div className="text-[9px] text-slate-500">
                            XML Sitemap: <span className="text-emerald-400 font-bold">{config.sitemapStatus}</span>
                          </div>
                        </div>
                      </td>

                      {/* Last Modified Date */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {new Date(config.lastModified).toLocaleDateString()}
                        <span className="text-[9px] text-slate-600 block">
                          {new Date(config.lastModified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy URL */}
                          <button
                            onClick={() => handleCopyUrl(config.fullUrl)}
                            title="Copy URL"
                            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-slate-100 rounded-lg text-slate-400 transition"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Preview Page */}
                          <button
                            onClick={() => handlePreviewPropertyPage(config.id)}
                            title="Preview Property"
                            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-slate-100 rounded-lg text-slate-400 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => handleOpenEditModal(config)}
                            title="Edit URL & SEO Parameters"
                            className="p-1.5 bg-[#C89B3C]/10 border border-[#C89B3C]/20 hover:border-[#C89B3C]/40 text-[#C89B3C] rounded-lg transition flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide px-2.5"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>

                          {/* History */}
                          <button
                            onClick={() => setHistoryConfig(config)}
                            title="View Slug History"
                            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-slate-100 rounded-lg text-slate-400 transition flex items-center gap-1"
                          >
                            <History className="w-3.5 h-3.5" />
                            {config.urlHistory?.length > 0 && (
                              <span className="text-[10px] bg-[#C89B3C] text-slate-950 font-bold px-1 rounded-full">
                                {config.urlHistory.length}
                              </span>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL / SLIDE OVER FORM */}
      {editingConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0A0D12] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col scrollbar-thin">
            
            {/* Modal header */}
            <div className="p-5 border-b border-slate-900 flex justify-between items-center bg-[#121620]/25">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#C89B3C]" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Property URL & SEO Parameter Editor</h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{editingConfig.propertyName} ({editingConfig.id})</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingConfig(null)}
                className="text-slate-400 hover:text-slate-200 font-bold p-1 bg-slate-900 border border-slate-800 rounded-xl"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 flex-1 text-slate-300">
              
              {/* URL Slug Management Section */}
              <div className="bg-[#121620]/40 border border-slate-900 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">URL Slug Definition</label>
                  <button 
                    onClick={() => handleRegenerateSEO(editingConfig)}
                    className="text-[10px] text-[#C89B3C] hover:underline flex items-center gap-1 font-bold"
                  >
                    <Shuffle className="w-3 h-3" /> Auto-suggest from title
                  </button>
                </div>

                <div className="flex gap-2">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 flex items-center text-slate-500 font-mono text-xs select-none">
                    /properties/
                  </div>
                  <input 
                    type="text"
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    placeholder="custom-url-slug"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-[#C89B3C]/50 transition font-mono"
                  />
                </div>

                {/* Validation messages */}
                {slugValidationErrors.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {slugValidationErrors.map((err, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Correction Suggestion Box */}
                {slugSuggestion && (
                  <div className="bg-[#C89B3C]/5 border border-[#C89B3C]/20 p-2.5 rounded-lg flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Sparkles className="w-3.5 h-3.5 text-[#C89B3C]" />
                      <span>Suggested correction: <span className="font-mono text-[#C89B3C] font-bold">/{slugSuggestion}</span></span>
                    </div>
                    <button 
                      onClick={handleApplyCorrection}
                      className="px-2.5 py-1 bg-[#C89B3C] hover:bg-amber-600 rounded text-slate-950 font-black text-[9px] uppercase tracking-wider"
                    >
                      Apply Correction
                    </button>
                  </div>
                )}

                {editSlug !== editingConfig.urlSlug && slugValidationErrors.length === 0 && (
                  <div className="bg-indigo-500/5 border border-indigo-500/20 p-2.5 rounded-lg flex items-center gap-2.5 text-[10px]">
                    <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin-slow shrink-0" />
                    <div>
                      <span className="text-indigo-300 font-bold block">Dynamic 301 Redirect creation</span>
                      <p className="text-slate-400 mt-0.5">Changing this slug will automatically map a 301 Redirect from <span className="font-mono text-indigo-400">/properties/{editingConfig.urlSlug}</span> to prevent search engine indexing drops and 404 errors.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Canonical URL Control */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">Canonical URL Override</label>
                <input 
                  type="text"
                  value={editCanonicalUrl}
                  onChange={(e) => setEditCanonicalUrl(e.target.value)}
                  placeholder={`https://dvarixrealty.com/properties/${editSlug}`}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-[#C89B3C]/50 transition font-mono"
                />
              </div>

              {/* Indexing and Follow Controls */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#121620]/30 border border-slate-900/60 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Search Indexing (robots)</span>
                    <span className="text-[10px] text-slate-500">Allow Google to index this property page.</span>
                  </div>
                  <button
                    onClick={() => setEditRobotsIndex(!editRobotsIndex)}
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${editRobotsIndex ? 'bg-emerald-500' : 'bg-slate-800'}`}
                  >
                    <span className={`w-5 h-5 bg-white rounded-full absolute shadow-md transition-transform ${editRobotsIndex ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="bg-[#121620]/30 border border-slate-900/60 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Link Follow (robots)</span>
                    <span className="text-[10px] text-slate-500">Allow crawler bots to follow links on this page.</span>
                  </div>
                  <button
                    onClick={() => setEditRobotsFollow(!editRobotsFollow)}
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${editRobotsFollow ? 'bg-emerald-500' : 'bg-slate-800'}`}
                  >
                    <span className={`w-5 h-5 bg-white rounded-full absolute shadow-md transition-transform ${editRobotsFollow ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {/* Independent SEO Metadata */}
              <div className="space-y-4 border-t border-slate-900 pt-5">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#C89B3C] flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-[#C89B3C]" /> Independent SEO Metadata
                </h4>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-wider text-slate-400">
                      <label>SEO Meta Title</label>
                      <span className={`text-[10px] font-mono ${editSeoTitle.length >= 40 && editSeoTitle.length <= 70 ? 'text-emerald-400' : 'text-amber-500'}`}>
                        {editSeoTitle.length} characters (Ideal: 40-70)
                      </span>
                    </div>
                    <input 
                      type="text"
                      value={editSeoTitle}
                      onChange={(e) => setEditSeoTitle(e.target.value)}
                      placeholder="Title of property appearing in organic Google listings"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-[#C89B3C]/50 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-wider text-slate-400">
                      <label>Meta Description</label>
                      <span className={`text-[10px] font-mono ${editMetaDescription.length >= 100 && editMetaDescription.length <= 160 ? 'text-emerald-400' : 'text-amber-500'}`}>
                        {editMetaDescription.length} characters (Ideal: 100-160)
                      </span>
                    </div>
                    <textarea 
                      value={editMetaDescription}
                      onChange={(e) => setEditMetaDescription(e.target.value)}
                      rows={3}
                      placeholder="Enter optimized meta description to drive clicks from Google search engine result pages"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-[#C89B3C]/50 transition resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">Meta Keywords</label>
                    <input 
                      type="text"
                      value={editMetaKeywords}
                      onChange={(e) => setEditMetaKeywords(e.target.value)}
                      placeholder="devanahalli plots, premium layout, residential gated lands"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-[#C89B3C]/50 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Rich Social Media Cards (OG & Twitter) */}
              <div className="space-y-4 border-t border-slate-900 pt-5">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#C89B3C] flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#C89B3C]" /> Open Graph & Twitter Social Metadata
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">OG Share Title</label>
                    <input 
                      type="text"
                      value={editOgTitle}
                      onChange={(e) => setEditOgTitle(e.target.value)}
                      placeholder="Title on Facebook/LinkedIn/WhatsApp cards"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-[#C89B3C]/50 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">Twitter Card Style</label>
                    <select
                      value={editTwitterCard}
                      onChange={(e) => setEditTwitterCard(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-[#C89B3C]/50 transition font-medium"
                    >
                      <option value="summary">Summary Card (Small square thumb)</option>
                      <option value="summary_large_image">Summary with Large Hero Image</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">OG Share Description</label>
                    <input 
                      type="text"
                      value={editOgDescription}
                      onChange={(e) => setEditOgDescription(e.target.value)}
                      placeholder="Brief text summary shown on Facebook/LinkedIn feeds"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-[#C89B3C]/50 transition"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">Social Media Share Image (og:image)</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={editOgImage}
                        onChange={(e) => setEditOgImage(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-[#C89B3C]/50 transition font-mono"
                      />
                      {editOgImage && (
                        <img 
                          src={editOgImage} 
                          alt="og:image thumbnail" 
                          className="w-12 h-9 object-cover rounded-md border border-slate-800 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer with action buttons */}
            <div className="p-5 border-t border-slate-900 bg-[#121620]/25 flex justify-between items-center">
              <div className="text-[11px] text-slate-500 font-bold font-mono">
                Operator: {loggedInUser.email}
              </div>
              
              <div className="flex items-center gap-2.5">
                <button 
                  onClick={() => setEditingConfig(null)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:text-slate-100 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveConfig}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#C89B3C] to-amber-600 hover:from-amber-500 hover:to-amber-600 rounded-xl text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save URL Config
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* URL HISTORY DRAWER/MODAL */}
      {historyConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0A0D12] border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-900 flex justify-between items-center bg-[#121620]/25">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#C89B3C]" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100">URL Transition & History Logs</h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{historyConfig.propertyName}</p>
                </div>
              </div>
              <button 
                onClick={() => setHistoryConfig(null)}
                className="text-slate-400 hover:text-slate-200 font-bold p-1 bg-slate-900 border border-slate-800 rounded-xl"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto scrollbar-thin">
              <div className="bg-slate-900/60 border border-slate-900 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Current Canonical URL</span>
                  <span className="font-mono text-xs text-emerald-400">/properties/{historyConfig.urlSlug}</span>
                </div>
                <button 
                  onClick={() => handleCopyUrl(historyConfig.fullUrl)}
                  className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Historical Redirection Slugs</span>
                  {historyConfig.urlHistory?.length > 0 && (
                    <button 
                      onClick={() => handleExportHistoryCSV(historyConfig)}
                      className="text-[10px] text-[#C89B3C] hover:underline flex items-center gap-1 font-bold"
                    >
                      <Download className="w-3 h-3" /> Export History
                    </button>
                  )}
                </div>

                {(!historyConfig.urlHistory || historyConfig.urlHistory.length === 0) ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    No older redirects recorded. This URL slug has remained stable.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {historyConfig.urlHistory.map((h, i) => (
                      <div key={i} className="bg-slate-950/60 border border-slate-900 p-3 rounded-xl flex items-center justify-between font-mono text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-[#C89B3C] font-bold">/{h.oldSlug}</span>
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                            <span className="text-[10px] text-emerald-400">/{h.newSlug}</span>
                          </div>
                          <span className="text-[9px] text-slate-600 block mt-1">Moved: {new Date(h.date).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleRestoreHistorySlug(h.oldSlug)}
                            title="Restore Slug & Reverse Redirect"
                            className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg text-[10px] font-bold text-indigo-400 transition"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handleDeleteHistoryRedirect(h.oldSlug)}
                            title="Delete Redirect Rule"
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-rose-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-900 bg-[#121620]/25 flex justify-end">
              <button 
                onClick={() => setHistoryConfig(null)}
                className="px-4 py-2 bg-slate-900 border border-slate-800 hover:text-slate-100 rounded-xl text-xs font-bold transition"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK EDIT SLUGS MODAL */}
      {showBulkEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0A0D12] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-900 flex justify-between items-center bg-[#121620]/25">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#C89B3C]" /> Bulk Modify Slugs ({selectedIds.length})
              </h3>
              <button 
                onClick={() => setShowBulkEditModal(false)}
                className="text-slate-400 hover:text-slate-200 font-bold p-1 bg-slate-900 border border-slate-800 rounded-xl"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-400">Modify the slugs of all {selectedIds.length} selected properties simultaneously. System will enforce friendly format validations on save.</p>
              
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">Prefix Slug (e.g. "premium")</label>
                  <input 
                    type="text"
                    value={bulkPrefix}
                    onChange={(e) => setBulkPrefix(e.target.value)}
                    placeholder="prefix"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-[#C89B3C]/50 transition font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">Suffix Slug (e.g. "bangalore")</label>
                  <input 
                    type="text"
                    value={bulkSuffix}
                    onChange={(e) => setBulkSuffix(e.target.value)}
                    placeholder="suffix"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-[#C89B3C]/50 transition font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">Replace Text</label>
                    <input 
                      type="text"
                      value={bulkReplaceFrom}
                      onChange={(e) => setBulkReplaceFrom(e.target.value)}
                      placeholder="find"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-[#C89B3C]/50 transition font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">With</label>
                    <input 
                      type="text"
                      value={bulkReplaceTo}
                      onChange={(e) => setBulkReplaceTo(e.target.value)}
                      placeholder="replace with"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-[#C89B3C]/50 transition font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-900 bg-[#121620]/25 flex justify-end gap-2">
              <button 
                onClick={() => setShowBulkEditModal(false)}
                className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleBulkEditSubmit}
                className="px-5 py-2 bg-[#C89B3C] text-slate-950 hover:bg-amber-600 rounded-xl text-xs font-black uppercase tracking-wider"
              >
                Apply Bulk Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
