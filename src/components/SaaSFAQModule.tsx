import React, { useState, useMemo, useEffect } from 'react';
import { 
  HelpCircle, Search, Filter, Plus, Edit, Trash2, Copy, ToggleLeft, ToggleRight, 
  ArrowUp, ArrowDown, Star, CheckCircle, Clock, FileText, ChevronDown, Check, X, 
  AlertTriangle, RotateCcw, Settings, Eye, EyeOff, LayoutGrid, CheckSquare, Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FAQ, SiteCMSConfig } from '../types';
import { firebaseService } from '../lib/firebaseService';

interface SaaSFAQModuleProps {
  faqs: FAQ[];
  siteSettings?: SiteCMSConfig;
  setSiteSettings?: (newSettings: SiteCMSConfig) => void;
}

const DEFAULT_CATEGORIES = [
  'General Questions',
  'Property Search',
  'Requirements',
  'Site Visits',
  'Buying Process',
  'Selling Process',
  'Investment'
];

export default function SaaSFAQModule({ faqs, siteSettings, setSiteSettings }: SaaSFAQModuleProps) {
  // Navigation tabs: 'list' | 'form'
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // Trigger Custom Event Notifications
  const notify = (title: string, message: string) => {
    window.dispatchEvent(new CustomEvent('cms-alert-notification', {
      detail: { title, message, category: 'CMS' }
    }));
  };

  // Form states (for Add/Edit)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [formQuestion, setFormQuestion] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [formCategory, setFormCategory] = useState('General Questions');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(1);
  const [formStatus, setFormStatus] = useState<'Published' | 'Hidden' | string>('Published');
  const [formFeatured, setFormFeatured] = useState(false);
  const [isSavingForm, setIsSavingForm] = useState(false);
  
  // New FAQ Fields
  const [formShowOnHomepage, setFormShowOnHomepage] = useState(false);
  const [formHomepageOrder, setFormHomepageOrder] = useState<number>(1);
  const [formHomepageStatus, setFormHomepageStatus] = useState<'Visible' | 'Hidden'>('Hidden');

  // Homepage FAQ Settings states (synced with siteSettings.faqSettings)
  const [settingsDefaultCategory, setSettingsDefaultCategory] = useState<string>('All');
  const [settingsMaxFaqsToDisplay, setSettingsMaxFaqsToDisplay] = useState<number>(10);
  const [settingsShowCategoryNavigation, setSettingsShowCategoryNavigation] = useState<boolean>(true);
  const [settingsShowAllCategory, setSettingsShowAllCategory] = useState<boolean>(true);
  const [settingsEnableViewAllButton, setSettingsEnableViewAllButton] = useState<boolean>(true);
  const [settingsDisplayOnlyFeatured, setSettingsDisplayOnlyFeatured] = useState<boolean>(false);
  const [settingsEnableHomepageFAQSection, setSettingsEnableHomepageFAQSection] = useState<boolean>(true);
  
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Bulk actions selection state
  const [selectedFaqIds, setSelectedFaqIds] = useState<string[]>([]);

  // Synchronize settings from siteSettings
  useEffect(() => {
    if (siteSettings?.faqSettings) {
      setSettingsDefaultCategory(siteSettings.faqSettings.defaultCategory || 'All');
      setSettingsMaxFaqsToDisplay(Number(siteSettings.faqSettings.maxFaqsToDisplay) || 10);
      setSettingsShowCategoryNavigation(siteSettings.faqSettings.showCategoryNavigation !== false);
      setSettingsShowAllCategory(siteSettings.faqSettings.showAllCategory !== false);
      setSettingsEnableViewAllButton(siteSettings.faqSettings.enableViewAllButton !== false);
      setSettingsDisplayOnlyFeatured(!!siteSettings.faqSettings.displayOnlyFeatured);
      setSettingsEnableHomepageFAQSection(siteSettings.faqSettings.enableHomepageFAQSection !== false);
    }
  }, [siteSettings]);

  // Custom Categories defined dynamically list
  const dynamicCategories = useMemo(() => {
    const categoriesSet = new Set(DEFAULT_CATEGORIES);
    faqs.forEach(faq => {
      if (faq.category) {
        categoriesSet.add(faq.category);
      }
    });
    return Array.from(categoriesSet);
  }, [faqs]);

  // Confirmation modal states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Calculated metrics
  const totalCount = faqs.length;
  const homepageCount = faqs.filter(f => f.showOnHomepage).length;
  const featuredCount = faqs.filter(f => f.featured).length;
  const hiddenCount = faqs.filter(f => !f.showOnHomepage || f.status === 'Draft' || f.homepageStatus === 'Hidden').length;

  const recentlyUpdated = useMemo(() => {
    if (faqs.length === 0) return 'None';
    const sorted = [...faqs].sort((a,b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    const latest = sorted[0];
    const diffMs = Date.now() - new Date(latest.lastUpdated).getTime();
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return new Date(latest.lastUpdated).toLocaleDateString();
  }, [faqs]);

  // Handle setting up Form for Add New FAQ
  const handleAddNewFaqClick = () => {
    setEditingFaq(null);
    setFormQuestion('');
    setFormAnswer('');
    setFormCategory('General Questions');
    setCustomCategoryName('');
    setShowCustomCategory(false);
    
    // Default display order to be max + 1
    const maxOrder = faqs.reduce((max, f) => f.displayOrder > max ? f.displayOrder : max, 0);
    setFormDisplayOrder(maxOrder + 1);
    setFormStatus('Published');
    setFormFeatured(false);

    // New fields
    setFormShowOnHomepage(false);
    const maxHomeOrder = faqs.reduce((max, f) => (f.homepageOrder || 0) > max ? f.homepageOrder : max, 0);
    setFormHomepageOrder(maxHomeOrder + 1);
    setFormHomepageStatus('Hidden');

    setViewMode('form');
  };

  // Handle setting up Form for Edit FAQ
  const handleEditFaqClick = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormQuestion(faq.question);
    setFormAnswer(faq.answer);
    
    if (DEFAULT_CATEGORIES.includes(faq.category)) {
      setFormCategory(faq.category);
      setShowCustomCategory(false);
    } else {
      setFormCategory('Custom');
      setCustomCategoryName(faq.category);
      setShowCustomCategory(true);
    }
    
    setFormDisplayOrder(faq.displayOrder);
    setFormStatus(faq.status === 'Active' || faq.status === 'Published' ? 'Published' : 'Hidden');
    setFormFeatured(faq.featured);

    // New fields
    setFormShowOnHomepage(faq.showOnHomepage ?? false);
    setFormHomepageOrder(faq.homepageOrder ?? 1);
    setFormHomepageStatus(faq.homepageStatus ?? (faq.showOnHomepage ? 'Visible' : 'Hidden'));

    setViewMode('form');
  };

  // Handle Duplicate FAQ
  const handleDuplicateFaq = async (faq: FAQ) => {
    const maxOrder = faqs.reduce((max, f) => f.displayOrder > max ? f.displayOrder : max, 0);
    const maxHomeOrder = faqs.reduce((max, f) => (f.homepageOrder || 0) > max ? f.homepageOrder : max, 0);
    const newFaq: FAQ = {
      id: `faq-dup-${Date.now()}`,
      question: `${faq.question} (Copy)`,
      answer: faq.answer,
      category: faq.category,
      displayOrder: maxOrder + 1,
      status: 'Hidden',
      published: false,
      featured: faq.featured,
      showOnHomepage: faq.showOnHomepage ?? false,
      homepageVisible: faq.showOnHomepage ?? false,
      homepageOrder: maxHomeOrder + 1,
      homepageStatus: faq.homepageStatus ?? (faq.showOnHomepage ? 'Visible' : 'Hidden'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    try {
      await firebaseService.saveFAQ(newFaq);
      notify("FAQ Duplicated", `Successfully created a hidden copy of "${faq.question}"`);
    } catch (err) {
      console.error(err);
      notify("Error", "Failed to duplicate the FAQ. Please try again.");
    }
  };

  // Toggle single status (Published/Hidden)
  const handleToggleStatus = async (faq: FAQ) => {
    const isCurrentlyPublished = faq.status === 'Published' || faq.status === 'Active' || faq.published === true;
    const nextStatus = isCurrentlyPublished ? 'Hidden' : 'Published';
    const updated: FAQ = {
      ...faq,
      status: nextStatus,
      published: nextStatus === 'Published',
      updatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    try {
      await firebaseService.saveFAQ(updated);
      notify("Status Updated", `"${faq.question}" is now ${nextStatus}`);
    } catch (err) {
      console.error(err);
      notify("Error", "Failed to update publication status");
    }
  };

  // Toggle Featured status
  const handleToggleFeatured = async (faq: FAQ) => {
    const nextFeatured = !faq.featured;
    const updated: FAQ = {
      ...faq,
      featured: nextFeatured,
      updatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    try {
      await firebaseService.saveFAQ(updated);
      notify("Featured Updated", `"${faq.question}" is now ${nextFeatured ? 'Featured' : 'Standard'}`);
    } catch (err) {
      console.error(err);
      notify("Error", "Failed to update featured status");
    }
  };

  // Toggle Show on Homepage status
  const handleToggleShowOnHomepage = async (faq: FAQ) => {
    const nextShow = !(faq.showOnHomepage ?? false);
    const updated: FAQ = {
      ...faq,
      showOnHomepage: nextShow,
      homepageVisible: nextShow,
      homepageStatus: nextShow ? 'Visible' : 'Hidden',
      updatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    try {
      await firebaseService.saveFAQ(updated);
      notify("Homepage Placement", `"${faq.question}" is now ${nextShow ? 'Visible' : 'Hidden'} on the homepage`);
    } catch (err) {
      console.error(err);
      notify("Error", "Failed to update homepage visibility");
    }
  };

  // Update homepage order directly from table input
  const handleUpdateHomepageOrder = async (faq: FAQ, order: number) => {
    const resolvedOrder = isNaN(order) ? 1 : order;
    const updated: FAQ = {
      ...faq,
      homepageOrder: resolvedOrder,
      updatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    try {
      await firebaseService.saveFAQ(updated);
      notify("Order Updated", "Homepage sort order updated successfully");
    } catch (err) {
      console.error(err);
      notify("Error", "Failed to save homepage display order");
    }
  };

  // Move Display Order Up/Down (Live Swap)
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredFaqsList.length) return;

    const itemA = filteredFaqsList[index];
    const itemB = filteredFaqsList[targetIndex];

    const tempOrder = itemA.displayOrder;
    const updatedA: FAQ = { 
      ...itemA, 
      displayOrder: itemB.displayOrder, 
      updatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString() 
    };
    const updatedB: FAQ = { 
      ...itemB, 
      displayOrder: tempOrder, 
      updatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString() 
    };

    try {
      await firebaseService.saveFAQ(updatedA);
      await firebaseService.saveFAQ(updatedB);
      notify("Display Order Swapped", "FAQs reordered successfully");
    } catch (err) {
      console.error(err);
      notify("Error", "Failed to reorder FAQ entries");
    }
  };

  // Submit Save action
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formAnswer.trim()) return;

    setIsSavingForm(true);
    const resolvedCategory = showCustomCategory || formCategory === 'Custom'
      ? (customCategoryName.trim() || 'General Questions')
      : formCategory;

    const faqData: FAQ = {
      id: editingFaq?.id || `faq-${Date.now()}`,
      question: formQuestion.trim(),
      answer: formAnswer.trim(),
      category: resolvedCategory,
      displayOrder: Number(formDisplayOrder),
      status: formStatus === 'Published' || formStatus === 'Active' ? 'Published' : 'Hidden',
      published: formStatus === 'Published' || formStatus === 'Active',
      featured: formFeatured,
      showOnHomepage: formShowOnHomepage,
      homepageVisible: formShowOnHomepage,
      homepageOrder: Number(formHomepageOrder),
      homepageStatus: formShowOnHomepage ? 'Visible' : 'Hidden',
      createdAt: editingFaq?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    try {
      await firebaseService.saveFAQ(faqData);
      notify("FAQ Saved", `Successfully ${editingFaq ? 'updated' : 'published'} "${faqData.question.substring(0, 20)}..."`);
      setViewMode('list');
      setEditingFaq(null);
    } catch (err) {
      console.error(err);
      notify("Error", "Failed to save the FAQ entry");
    } finally {
      setIsSavingForm(false);
    }
  };

  // Confirm delete FAQ
  const handleDeleteConfirm = async () => {
    if (showDeleteConfirm) {
      try {
        await firebaseService.deleteFAQ(showDeleteConfirm);
        notify("FAQ Deleted", "The FAQ has been permanently removed");
      } catch (err) {
        console.error(err);
        notify("Error", "Failed to delete the FAQ");
      } finally {
        setShowDeleteConfirm(null);
      }
    }
  };

  // Save Homepage FAQ Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteSettings || !setSiteSettings) return;

    setIsSavingSettings(true);
    setSaveSuccess(false);

    const updatedSettings: SiteCMSConfig = {
      ...siteSettings,
      faqSettings: {
        defaultCategory: settingsDefaultCategory,
        maxFaqsToDisplay: Number(settingsMaxFaqsToDisplay),
        showCategoryNavigation: settingsShowCategoryNavigation,
        showAllCategory: settingsShowAllCategory,
        enableViewAllButton: settingsEnableViewAllButton,
        displayOnlyFeatured: settingsDisplayOnlyFeatured,
        enableHomepageFAQSection: settingsEnableHomepageFAQSection
      }
    };

    try {
      await firebaseService.saveSiteSettings(updatedSettings);
      setSiteSettings(updatedSettings);
      setSaveSuccess(true);
      notify("Settings Saved", "Homepage FAQ settings successfully updated in Firestore");
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save FAQ homepage settings", err);
      notify("Error", "Failed to update FAQ configurations");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleResetSettings = async () => {
    if (!siteSettings || !setSiteSettings) return;

    if (window.confirm("Are you sure you want to restore default FAQ settings?")) {
      setIsSavingSettings(true);
      const defaultSettings: SiteCMSConfig = {
        ...siteSettings,
        faqSettings: {
          defaultCategory: 'All',
          maxFaqsToDisplay: 10,
          showCategoryNavigation: true,
          showAllCategory: true,
          enableViewAllButton: true,
          displayOnlyFeatured: false,
          enableHomepageFAQSection: true
        }
      };

      try {
        await firebaseService.saveSiteSettings(defaultSettings);
        setSiteSettings(defaultSettings);
        setSettingsDefaultCategory('All');
        setSettingsMaxFaqsToDisplay(10);
        setSettingsShowCategoryNavigation(true);
        setSettingsShowAllCategory(true);
        setSettingsEnableViewAllButton(true);
        setSettingsDisplayOnlyFeatured(false);
        setSettingsEnableHomepageFAQSection(true);
        notify("Settings Reset", "FAQ Homepage settings restored to defaults");
      } catch (err) {
        console.error("Failed to reset FAQ homepage settings", err);
        notify("Error", "Failed to reset FAQ settings");
      } finally {
        setIsSavingSettings(false);
      }
    }
  };

  // Search & Filter computation
  const filteredFaqsList = useMemo(() => {
    return faqs.filter(faq => {
      const matchSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategoryFilter === 'All' || faq.category === selectedCategoryFilter;
      const matchStatus = selectedStatusFilter === 'All' || faq.status === selectedStatusFilter;
      return matchSearch && matchCategory && matchStatus;
    }).sort((a,b) => a.displayOrder - b.displayOrder);
  }, [faqs, searchQuery, selectedCategoryFilter, selectedStatusFilter]);

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFaqIds(filteredFaqsList.map(f => f.id));
    } else {
      setSelectedFaqIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedFaqIds(prev => [...prev, id]);
    } else {
      setSelectedFaqIds(prev => prev.filter(item => item !== id));
    }
  };

  // Bulk Action implementation
  const handleBulkEnableHomepage = async () => {
    try {
      for (const id of selectedFaqIds) {
        const faq = faqs.find(f => f.id === id);
        if (faq) {
          await firebaseService.saveFAQ({
            ...faq,
            showOnHomepage: true,
            homepageVisible: true,
            homepageStatus: 'Visible',
            updatedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          });
        }
      }
      notify("Bulk Homepage Enabled", `Successfully added ${selectedFaqIds.length} FAQs to the homepage`);
    } catch (err) {
      console.error(err);
      notify("Error", "Failed to update homepage placement in bulk");
    } finally {
      setSelectedFaqIds([]);
    }
  };

  const handleBulkDisableHomepage = async () => {
    try {
      for (const id of selectedFaqIds) {
        const faq = faqs.find(f => f.id === id);
        if (faq) {
          await firebaseService.saveFAQ({
            ...faq,
            showOnHomepage: false,
            homepageVisible: false,
            homepageStatus: 'Hidden',
            updatedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          });
        }
      }
      notify("Bulk Homepage Disabled", `Successfully removed ${selectedFaqIds.length} FAQs from the homepage`);
    } catch (err) {
      console.error(err);
      notify("Error", "Failed to disable homepage placement in bulk");
    } finally {
      setSelectedFaqIds([]);
    }
  };

  const handleBulkMarkFeatured = async () => {
    try {
      for (const id of selectedFaqIds) {
        const faq = faqs.find(f => f.id === id);
        if (faq) {
          await firebaseService.saveFAQ({
            ...faq,
            featured: true,
            updatedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          });
        }
      }
      notify("Bulk Featured Enabled", `Successfully marked ${selectedFaqIds.length} FAQs as Featured`);
    } catch (err) {
      console.error(err);
      notify("Error", "Failed to enable featured status in bulk");
    } finally {
      setSelectedFaqIds([]);
    }
  };

  const handleBulkRemoveFeatured = async () => {
    try {
      for (const id of selectedFaqIds) {
        const faq = faqs.find(f => f.id === id);
        if (faq) {
          await firebaseService.saveFAQ({
            ...faq,
            featured: false,
            updatedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          });
        }
      }
      notify("Bulk Featured Disabled", `Successfully removed Featured status from ${selectedFaqIds.length} FAQs`);
    } catch (err) {
      console.error(err);
      notify("Error", "Failed to disable featured status in bulk");
    } finally {
      setSelectedFaqIds([]);
    }
  };

  const handleBulkPublish = async () => {
    try {
      for (const id of selectedFaqIds) {
        const faq = faqs.find(f => f.id === id);
        if (faq) {
          await firebaseService.saveFAQ({
            ...faq,
            status: 'Published',
            published: true,
            updatedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          });
        }
      }
      notify("Bulk Published", `Successfully published ${selectedFaqIds.length} FAQs to the website`);
    } catch (err) {
      console.error(err);
      notify("Error", "Failed to publish FAQs in bulk");
    } finally {
      setSelectedFaqIds([]);
    }
  };

  const handleBulkHide = async () => {
    try {
      for (const id of selectedFaqIds) {
        const faq = faqs.find(f => f.id === id);
        if (faq) {
          await firebaseService.saveFAQ({
            ...faq,
            status: 'Hidden',
            published: false,
            updatedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          });
        }
      }
      notify("Bulk Hidden", `Successfully hid ${selectedFaqIds.length} FAQs from the website`);
    } catch (err) {
      console.error(err);
      notify("Error", "Failed to hide FAQs in bulk");
    } finally {
      setSelectedFaqIds([]);
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedFaqIds.length;
    if (window.confirm(`Are you sure you want to permanently delete these ${count} FAQs?`)) {
      try {
        for (const id of selectedFaqIds) {
          await firebaseService.deleteFAQ(id);
        }
        notify("Bulk Deleted", `Permanently removed ${count} FAQ entries`);
      } catch (err) {
        console.error(err);
        notify("Error", "Failed to delete FAQs in bulk");
      } finally {
        setSelectedFaqIds([]);
      }
    }
  };

  const handleBulkCategoryChange = async (newCat: string) => {
    try {
      for (const id of selectedFaqIds) {
        const faq = faqs.find(f => f.id === id);
        if (faq) {
          await firebaseService.saveFAQ({
            ...faq,
            category: newCat,
            updatedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          });
        }
      }
      notify("Bulk Category Changed", `Changed category of ${selectedFaqIds.length} FAQs to "${newCat}"`);
    } catch (err) {
      console.error(err);
      notify("Error", "Failed to update FAQ categories in bulk");
    } finally {
      setSelectedFaqIds([]);
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* 1. HEADER SECTION & METRICS BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sky-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-sky-500 animate-pulse" />
            FAQ Management Module
          </h2>
          <p className="text-xs text-slate-500">
            Configure enterprise FAQs, dictate home screen eligibility, and organize dynamic categories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'form' ? (
            <button
              onClick={() => setViewMode('list')}
              className="px-4 py-2 border border-slate-200 text-slate-650 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel & Return
            </button>
          ) : (
            <button
              onClick={handleAddNewFaqClick}
              className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-sky-100 transition duration-150 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add New FAQ
            </button>
          )}
        </div>
      </div>

      {/* Metric Tiles bar styled in modern luxury Theme */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-sky-100 p-4 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-16 w-16 bg-sky-50/40 rounded-full -mr-4 -mt-4 transition-all group-hover:scale-110" />
          <span className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Total FAQs</span>
          <span className="text-3xl font-black text-sky-650 font-sans mt-1 block">{totalCount}</span>
        </div>

        <div className="bg-white border border-indigo-100 p-4 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-16 w-16 bg-indigo-50/40 rounded-full -mr-4 -mt-4 transition-all group-hover:scale-110" />
          <span className="block text-[9px] font-extrabold uppercase tracking-widest text-indigo-500">Homepage FAQs</span>
          <span className="text-3xl font-black text-indigo-650 font-sans mt-1 block">{homepageCount}</span>
        </div>

        <div className="bg-white border border-pink-100 p-4 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-16 w-16 bg-pink-50/40 rounded-full -mr-4 -mt-4 transition-all group-hover:scale-110" />
          <span className="block text-[9px] font-extrabold uppercase tracking-widest text-pink-500 font-bold">Featured FAQs</span>
          <span className="text-3xl font-black text-pink-600 font-sans mt-1 block">{featuredCount}</span>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-16 w-16 bg-slate-50/40 rounded-full -mr-4 -mt-4 transition-all group-hover:scale-110" />
          <span className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-500">Hidden FAQs</span>
          <span className="text-3xl font-black text-slate-650 font-sans mt-1 block">{hiddenCount}</span>
        </div>
      </div>

      {/* 2. CORE VIEW SWITCHING */}
      {viewMode === 'form' ? (
        /* Form View */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-2xl mx-auto">
          <div className="border-b border-slate-100 pb-3 mb-5">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
              {editingFaq ? 'Edit FAQ Coordinates' : 'Submit New Knowledge Base Entry'}
            </h3>
            <p className="text-[11px] text-slate-450 mt-0.5">Configure parameters accurately to update the live public website stream.</p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Question Prompt *</label>
              <input
                type="text"
                required
                value={formQuestion}
                onChange={(e) => setFormQuestion(e.target.value)}
                placeholder="e.g. Can we apply for secondary bank clearances?"
                className="w-full bg-slate-50/60 border border-slate-200 text-slate-800 text-xs rounded-xl px-4 py-3 focus:border-sky-500 outline-none transition"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Answer Content Definition *</label>
              <textarea
                required
                rows={5}
                value={formAnswer}
                onChange={(e) => setFormAnswer(e.target.value)}
                placeholder="Write clear, humble, and comprehensive resolution..."
                className="w-full bg-slate-50/60 border border-slate-200 text-slate-800 text-xs rounded-xl px-4 py-3 focus:border-sky-500 outline-none transition resize-y font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">FAQ Category *</label>
                <select
                  value={formCategory}
                  onChange={(e) => {
                    setFormCategory(e.target.value);
                    if (e.target.value === 'Custom') {
                      setShowCustomCategory(true);
                    } else {
                      setShowCustomCategory(false);
                    }
                  }}
                  className="w-full bg-slate-5 border border-slate-200 text-slate-700 text-xs rounded-xl px-4 py-3 focus:border-sky-500 outline-none cursor-pointer"
                >
                  {DEFAULT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="Custom">Custom Category...</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Display Order Weight</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formDisplayOrder}
                  onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                  placeholder="e.g. 1"
                  className="w-full bg-slate-50/60 border border-slate-200 text-slate-800 text-xs rounded-xl px-4 py-3 focus:border-sky-500 outline-none transition font-sans"
                />
              </div>
            </div>

            {/* Custom Category text input if requested */}
            {showCustomCategory && (
              <div className="space-y-1 bg-sky-50/20 p-4 rounded-xl border border-sky-100">
                <label className="block text-[10px] font-extrabold uppercase text-sky-600 tracking-wider">Type Custom Category Name</label>
                <input
                  type="text"
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  placeholder="e.g. Bangalore Legal Deeds"
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-4 py-2.5 focus:border-sky-500 outline-none transition"
                />
              </div>
            )}

            {/* Premium Homepage Placement section */}
            <div className="p-4 bg-sky-50/20 border border-sky-100 rounded-xl space-y-4">
              <h4 className="text-xs font-extrabold text-sky-700 uppercase tracking-wider flex items-center gap-1">
                <LayoutGrid className="w-4 h-4" /> Homepage Presentation settings
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-150">
                  <div>
                    <span className="block text-xs font-bold text-slate-750">Show on Homepage</span>
                    <span className="text-[9px] text-slate-500">Make eligible for home feed</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = !formShowOnHomepage;
                      setFormShowOnHomepage(nextVal);
                      setFormHomepageStatus(nextVal ? 'Visible' : 'Hidden');
                    }}
                    className="focus:outline-none cursor-pointer"
                  >
                    {formShowOnHomepage ? (
                      <ToggleRight className="w-9 h-9 text-sky-500" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-slate-350" />
                    )}
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Homepage Display Order</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formHomepageOrder}
                    onChange={(e) => setFormHomepageOrder(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-4 py-2.5 focus:border-sky-500 outline-none transition font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-150">
                  <div>
                    <span className="block text-xs font-bold text-slate-755">Homepage Status</span>
                    <span className="text-[9px] text-slate-500">ReadOnly state indicator</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${formShowOnHomepage ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                    {formShowOnHomepage ? 'Visible' : 'Hidden'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-150">
                <div>
                  <span className="block text-xs font-bold text-slate-750">Publish Status</span>
                  <span className="text-[10px] text-slate-500">Draft blocks website visibility</span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFormStatus('Active')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer ${
                      formStatus === 'Active' ? 'bg-sky-500 text-white' : 'bg-slate-205 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('Draft')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer ${
                      formStatus === 'Draft' ? 'bg-amber-500 text-white' : 'bg-slate-205 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    Draft
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-150">
                <div>
                  <span className="block text-xs font-bold text-slate-750">Featured FAQ Badge</span>
                  <span className="text-[10px] text-slate-500">Show special star icon & filter</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormFeatured(!formFeatured)}
                  className="cursor-pointer transition"
                >
                  {formFeatured ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-pink-100 text-pink-700 font-bold text-[10px] border border-pink-200">
                      <Star className="h-3 w-3 fill-pink-500 text-pink-500" /> Featured
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-205 text-slate-500 font-bold text-[10px] border border-transparent">
                      Standard
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-4 py-2.5 border border-slate-200 text-slate-655 rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Quit Form
              </button>
              <button
                type="submit"
                disabled={isSavingForm}
                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition duration-150 cursor-pointer shadow-md shadow-sky-100 flex items-center gap-1.5"
              >
                {isSavingForm ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : editingFaq ? (
                  'Update Knowledge Node'
                ) : (
                  'Publish to Live Web Stream'
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* List & Table View with Settings on the right side */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 8 COLUMNS: FAQ List with table & bulk actions */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* SEARCH & FILTERS CONTROLS */}
            <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              
              {/* Keyword Search */}
              <div className="relative flex-grow">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Questions and answers keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-5/50 border border-slate-200 text-slate-700 text-xs rounded-xl focus:border-sky-500 fill-none outline-none font-sans"
                />
              </div>

              {/* Filter Category */}
              <div className="w-full sm:w-48 relative">
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-2.5 text-xs text-slate-705 rounded-xl cursor-pointer outline-none focus:border-sky-500"
                >
                  <option value="All">All Categories</option>
                  {dynamicCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Filter Status */}
              <div className="w-full sm:w-36 relative">
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-2.5 text-xs text-slate-705 rounded-xl cursor-pointer outline-none focus:border-sky-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Draft">Draft Only</option>
                </select>
              </div>
            </div>

            {/* BULK ACTIONS TOOLBAR - Visible when 1 or more checked */}
            <AnimatePresence>
              {selectedFaqIds.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0, y: -10 }}
                  animate={{ height: 'auto', opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -10 }}
                  className="bg-sky-500 text-white p-3.5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md overflow-hidden"
                >
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-white shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider">{selectedFaqIds.length} Selected FAQ records</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={handleBulkPublish}
                      className="px-2.5 py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-[10px] hover:bg-emerald-700 transition cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Publish
                    </button>
                    <button
                      onClick={handleBulkHide}
                      className="px-2.5 py-1.5 bg-slate-700 text-white font-bold rounded-lg text-[10px] hover:bg-slate-800 transition cursor-pointer flex items-center gap-1"
                    >
                      <EyeOff className="w-3 h-3" /> Hide
                    </button>
                    <button
                      onClick={handleBulkEnableHomepage}
                      className="px-2.5 py-1.5 bg-white text-sky-700 font-bold rounded-lg text-[10px] hover:bg-slate-50 transition cursor-pointer"
                    >
                      Show on Home
                    </button>
                    <button
                      onClick={handleBulkDisableHomepage}
                      className="px-2.5 py-1.5 bg-sky-600 text-white font-bold rounded-lg text-[10px] hover:bg-sky-700 transition cursor-pointer"
                    >
                      Remove from Home
                    </button>
                    <button
                      onClick={handleBulkMarkFeatured}
                      className="px-2.5 py-1.5 bg-pink-600 text-white font-bold rounded-lg text-[10px] hover:bg-pink-700 transition cursor-pointer flex items-center gap-1"
                    >
                      <Star className="w-3 h-3 fill-current" /> Feature
                    </button>
                    <button
                      onClick={handleBulkRemoveFeatured}
                      className="px-2.5 py-1.5 bg-sky-600 text-white font-bold rounded-lg text-[10px] hover:bg-sky-700 transition cursor-pointer"
                    >
                      Unfeature
                    </button>
                    <select
                      onChange={async (e) => {
                        const newCat = e.target.value;
                        if (!newCat) return;
                        await handleBulkCategoryChange(newCat);
                        e.target.value = ""; // Reset
                      }}
                      className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-[10px] outline-none border-none cursor-pointer"
                      defaultValue=""
                    >
                      <option value="" disabled className="text-slate-800 bg-white">Move Category...</option>
                      {dynamicCategories.map(cat => (
                        <option key={cat} value={cat} className="text-slate-800 bg-white font-sans">{cat}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleBulkDelete}
                      className="px-2.5 py-1.5 bg-red-600 text-white font-bold rounded-lg text-[10px] hover:bg-red-700 transition cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                    <button
                      onClick={() => setSelectedFaqIds([])}
                      className="px-2 py-1.5 text-white/80 hover:text-white font-bold text-[10px] transition cursor-pointer border border-white/20 rounded-lg"
                    >
                      Clear
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TABLE LOG ELEMENT */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 font-mono text-[9px] uppercase tracking-wider text-slate-500 select-none">
                      <th className="py-4 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={filteredFaqsList.length > 0 && selectedFaqIds.length === filteredFaqsList.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded text-sky-500 focus:ring-sky-400 h-3.5 w-3.5 border-slate-300 cursor-pointer"
                        />
                      </th>
                      <th className="py-4 px-3 font-extrabold w-12 text-center">Order</th>
                      <th className="py-4 px-4 font-extrabold">FAQ Question Details</th>
                      <th className="py-4 px-3 font-extrabold w-36">Category</th>
                      <th className="py-4 px-3 font-extrabold w-24 text-center">Homepage</th>
                      <th className="py-4 px-3 font-extrabold w-20 text-center">Featured</th>
                      <th className="py-4 px-3 font-extrabold w-20 text-center">Home Order</th>
                      <th className="py-4 px-3 font-extrabold w-24">Status</th>
                      <th className="py-4 px-3 font-extrabold w-28 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredFaqsList.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400 space-y-2">
                          <FileText className="h-8 w-8 text-slate-300 mx-auto" />
                          <p className="font-medium text-slate-450">No FAQs matched search criteria.</p>
                          <p className="text-[10px] text-slate-400">Clear filters or register a new knowledge prompt above.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredFaqsList.map((faq, index) => {
                        const isFirst = index === 0;
                        const isLast = index === filteredFaqsList.length - 1;
                        const isSelected = selectedFaqIds.includes(faq.id);
                        
                        return (
                          <tr key={faq.id} className={`hover:bg-sky-50/15 transition group ${isSelected ? 'bg-sky-50/10' : ''}`}>
                            
                            {/* Checkbox for Bulk Actions */}
                            <td className="py-4 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => handleSelectOne(faq.id, e.target.checked)}
                                className="rounded text-sky-500 focus:ring-sky-400 h-3.5 w-3.5 border-slate-300 cursor-pointer"
                              />
                            </td>

                            {/* Swap display order Up/Down buttons */}
                            <td className="py-4 px-2 font-mono text-center">
                              <div className="flex flex-col items-center justify-center -space-y-1">
                                <button
                                  disabled={isFirst}
                                  onClick={() => handleMoveOrder(index, 'up')}
                                  className={`p-0.5 rounded cursor-pointer ${
                                    isFirst ? 'text-slate-200' : 'text-slate-400 hover:text-sky-600 hover:bg-sky-50'
                                  }`}
                                  title="Move Sort Order Up"
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </button>
                                <span className="text-[10px] font-black text-slate-700 block select-none">
                                  {faq.displayOrder}
                                </span>
                                <button
                                  disabled={isLast}
                                  onClick={() => handleMoveOrder(index, 'down')}
                                  className={`p-0.5 rounded cursor-pointer ${
                                    isLast ? 'text-slate-200' : 'text-slate-400 hover:text-sky-600 hover:bg-sky-50'
                                  }`}
                                  title="Move Sort Order Down"
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>

                            {/* Question and compact answer preview */}
                            <td className="py-4 px-4 max-w-xs sm:max-w-sm">
                              <div className="space-y-1">
                                <span className="font-extrabold text-slate-800 group-hover:text-sky-600 transition block leading-snug">
                                  {faq.question}
                                </span>
                                <span className="text-[11px] text-slate-450 block truncate font-light leading-relaxed">
                                  {faq.answer}
                                </span>
                              </div>
                            </td>

                            {/* Category Tag */}
                            <td className="py-4 px-3">
                              <span className="inline-flex px-2 py-0.5 text-[9px] rounded-md font-extrabold bg-slate-50 border border-slate-150 text-slate-500 uppercase font-sans tracking-wide">
                                {faq.category}
                              </span>
                            </td>

                            {/* Homepage Visible Status Toggle */}
                            <td className="py-4 px-3 text-center">
                              <button
                                onClick={() => handleToggleShowOnHomepage(faq)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border cursor-pointer transition-colors duration-150 ${
                                  faq.showOnHomepage 
                                    ? 'bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100' 
                                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                                }`}
                                title="Toggle homepage placement"
                              >
                                {faq.showOnHomepage ? <Eye className="w-3 h-3 text-sky-500" /> : <EyeOff className="w-3 h-3" />}
                                {faq.showOnHomepage ? 'Visible' : 'Hidden'}
                              </button>
                            </td>

                            {/* Featured star toggle */}
                            <td className="py-4 px-3 text-center">
                              <button
                                onClick={() => handleToggleFeatured(faq)}
                                className={`focus:outline-none cursor-pointer p-1 rounded-lg border transition ${
                                  faq.featured 
                                    ? 'bg-pink-50 border-pink-100 text-pink-650' 
                                    : 'bg-white border-slate-200 text-slate-300 hover:text-slate-500 hover:bg-slate-50'
                                }`}
                                title="Toggle Featured priority"
                              >
                                <Star className={`w-3.5 h-3.5 ${faq.featured ? 'fill-pink-500 text-pink-500' : ''}`} />
                              </button>
                            </td>

                            {/* Homepage Order field (quick save) */}
                            <td className="py-4 px-3 text-center">
                              <input
                                type="number"
                                min={1}
                                defaultValue={faq.homepageOrder ?? 1}
                                onBlur={(e) => handleUpdateHomepageOrder(faq, parseInt(e.target.value))}
                                className="w-12 text-center bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-[11px] font-mono font-bold text-slate-700 focus:bg-white focus:border-sky-500 outline-none"
                                title="Homepage sort order. Click to edit and click away to save."
                              />
                            </td>

                            {/* Active / Draft Status */}
                            <td className="py-4 px-3">
                              <button
                                onClick={() => handleToggleStatus(faq)}
                                className="focus:outline-none cursor-pointer text-left block"
                                title="Toggle Publish Status on Website"
                              >
                                {faq.status === 'Active' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-100">
                                    <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-105 text-slate-650 text-[10px] font-extrabold border border-slate-200">
                                    <span className="h-1 w-1 rounded-full bg-slate-400" />
                                    Draft
                                  </span>
                                )}
                              </button>
                            </td>

                            {/* Actions panel */}
                            <td className="py-4 px-3 text-right pr-6">
                              <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition duration-150">
                                
                                {/* Duplicate */}
                                <button
                                  onClick={() => handleDuplicateFaq(faq)}
                                  className="p-1 bg-white hover:bg-sky-5 border border-slate-200 hover:border-sky-200 text-slate-400 hover:text-sky-600 transition rounded-lg cursor-pointer"
                                  title="Duplicate FAQ"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>

                                {/* Edit */}
                                <button
                                  onClick={() => handleEditFaqClick(faq)}
                                  className="p-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-655 hover:text-blue-650 transition rounded-lg cursor-pointer"
                                  title="Edit Coordinates"
                                >
                                  <Edit className="h-3 w-3" />
                                </button>

                                {/* Trash Delete */}
                                <button
                                  onClick={() => setShowDeleteConfirm(faq.id)}
                                  className="p-1 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-400 hover:text-red-650 transition rounded-lg cursor-pointer"
                                  title="Erase record"
                                >
                                  <Trash2 className="h-3 w-3" />
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

              {/* Pagination/Status Footer info */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>Showing {filteredFaqsList.length} of {totalCount} FAQs total</span>
                <span>Website synchronization: Online</span>
              </div>
            </div>
          </div>

          {/* RIGHT 4 COLUMNS: Homepage FAQ settings card */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* HOMEPAGE FAQ SETTINGS CARD */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="p-2 bg-sky-50 rounded-xl border border-sky-100">
                  <Settings className="h-5 w-5 text-sky-500" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Homepage FAQ Settings
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Configure live presentations rules</p>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                
                {/* Master Toggle: Enable Homepage FAQ Section */}
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl">
                  <div>
                    <span className="block text-xs font-bold text-slate-750">Enable FAQ Section</span>
                    <span className="text-[9px] text-slate-400">Master homepage toggle</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettingsEnableHomepageFAQSection(!settingsEnableHomepageFAQSection)}
                    className="focus:outline-none cursor-pointer"
                  >
                    {settingsEnableHomepageFAQSection ? (
                      <ToggleRight className="w-9 h-9 text-sky-500" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-slate-350" />
                    )}
                  </button>
                </div>

                {/* Default Category Dropdown */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                    Homepage FAQ Default Category
                  </label>
                  <select
                    value={settingsDefaultCategory}
                    onChange={(e) => setSettingsDefaultCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-2.5 text-xs text-slate-700 rounded-xl cursor-pointer focus:border-sky-500 outline-none"
                  >
                    <option value="All">All</option>
                    <option value="General">General</option>
                    <option value="Property Search">Property Search</option>
                    <option value="Requirements">Requirements</option>
                    <option value="Site Visits">Site Visits</option>
                    <option value="Buying Process">Buying Process</option>
                    <option value="Investment">Investment</option>
                  </select>
                </div>

                {/* Maximum FAQs to Display Dropdown */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                    Maximum FAQs to Display
                  </label>
                  <select
                    value={settingsMaxFaqsToDisplay}
                    onChange={(e) => setSettingsMaxFaqsToDisplay(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 p-2.5 text-xs text-slate-700 rounded-xl cursor-pointer focus:border-sky-500 outline-none"
                  >
                    <option value={5}>5 FAQs</option>
                    <option value={10}>10 FAQs</option>
                    <option value={15}>15 FAQs</option>
                    <option value={20}>20 FAQs</option>
                  </select>
                </div>

                {/* Show Category Navigation Toggle */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <span className="block text-xs font-bold text-slate-700">Show Category Navigation</span>
                    <span className="text-[9px] text-slate-400">Renders category selection tab bar</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettingsShowCategoryNavigation(!settingsShowCategoryNavigation)}
                    className="focus:outline-none cursor-pointer"
                  >
                    {settingsShowCategoryNavigation ? (
                      <ToggleRight className="w-8 h-8 text-sky-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-300" />
                    )}
                  </button>
                </div>

                {/* Show "All" Category Toggle */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <span className="block text-xs font-bold text-slate-700">Show "All" Category</span>
                    <span className="text-[9px] text-slate-400">Include 'All' filter on homepage</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettingsShowAllCategory(!settingsShowAllCategory)}
                    className="focus:outline-none cursor-pointer"
                  >
                    {settingsShowAllCategory ? (
                      <ToggleRight className="w-8 h-8 text-sky-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-300" />
                    )}
                  </button>
                </div>

                {/* Enable "View All FAQs" Button Toggle */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <span className="block text-xs font-bold text-slate-700">Enable "View All FAQs" Button</span>
                    <span className="text-[9px] text-slate-400">Renders link to static FAQ list page</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettingsEnableViewAllButton(!settingsEnableViewAllButton)}
                    className="focus:outline-none cursor-pointer"
                  >
                    {settingsEnableViewAllButton ? (
                      <ToggleRight className="w-8 h-8 text-sky-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-300" />
                    )}
                  </button>
                </div>

                {/* Display Only Featured FAQs Toggle */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="block text-xs font-bold text-slate-700">Display Only Featured FAQs</span>
                    <span className="text-[9px] text-slate-400">Forces only Featured items to load</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettingsDisplayOnlyFeatured(!settingsDisplayOnlyFeatured)}
                    className="focus:outline-none cursor-pointer"
                  >
                    {settingsDisplayOnlyFeatured ? (
                      <ToggleRight className="w-8 h-8 text-sky-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-300" />
                    )}
                  </button>
                </div>

                {/* Save settings action */}
                <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      {saveSuccess && (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 animate-bounce">
                          <CheckCircle className="w-3.5 h-3.5" /> Saved!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetSettings}
                        disabled={isSavingSettings}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition cursor-pointer"
                      >
                        Reset to Default
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingSettings}
                        className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                      >
                        {isSavingSettings ? 'Saving...' : 'Save Settings'}
                      </button>
                    </div>
                  </div>
                </div>

              </form>
            </div>

            {/* QUICK PRESENTATION ADVISORY CARD */}
            <div className="bg-sky-50/15 border border-sky-100/70 p-4 rounded-2xl">
              <h4 className="text-xs font-extrabold text-sky-700 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <Clock className="w-4 h-4 text-sky-550" /> Website Synced Live
              </h4>
              <p className="text-[11px] text-slate-550 leading-relaxed font-light">
                Changes made here instantly propagate to the live front-end application without code deployment. Keep the display settings tightly organized to present the absolute best image to customers.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* 3. CONFIRMATION DELETION DIALOG */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border border-red-100 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl text-left"
          >
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-50 border border-red-100 rounded-xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 leading-tight">Confirm FAQ Erasure</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">This action is permanent and immediate.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-light">
              This will remove the selected FAQ entry from the enterprise Firestore index and take it down instantly from the public website FAQ portal.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                className="py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-55 font-bold rounded-xl text-xs transition text-center cursor-pointer"
              >
                Cancel, Keep FAQ
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="py-2.5 bg-red-650 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition text-center shadow-md shadow-red-100 cursor-pointer"
              >
                Yes, Delete Record
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
