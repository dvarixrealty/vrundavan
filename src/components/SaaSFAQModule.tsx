import React, { useState, useMemo } from 'react';
import { 
  HelpCircle, Search, Filter, Plus, Edit, Trash2, Copy, ToggleLeft, ToggleRight, 
  ArrowUp, ArrowDown, Star, CheckCircle, Clock, FileText, ChevronDown, Check, X, 
  AlertTriangle, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FAQ } from '../types';
import { firebaseService } from '../lib/firebaseService';

interface SaaSFAQModuleProps {
  faqs: FAQ[];
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

export default function SaaSFAQModule({ faqs }: SaaSFAQModuleProps) {
  // Navigation tabs: 'list' | 'form'
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // Form states (for Add/Edit)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [formQuestion, setFormQuestion] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [formCategory, setFormCategory] = useState('General Questions');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(1);
  const [formStatus, setFormStatus] = useState<'Active' | 'Draft'>('Active');
  const [formFeatured, setFormFeatured] = useState(false);

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
  const activeCount = faqs.filter(f => f.status === 'Active').length;
  const draftCount = faqs.filter(f => f.status === 'Draft').length;
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
    setFormStatus('Active');
    setFormFeatured(false);
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
    setFormStatus(faq.status);
    setFormFeatured(faq.featured);
    setViewMode('form');
  };

  // Handle Duplicate FAQ
  const handleDuplicateFaq = async (faq: FAQ) => {
    const maxOrder = faqs.reduce((max, f) => f.displayOrder > max ? f.displayOrder : max, 0);
    const newFaq: FAQ = {
      id: `faq-dup-${Date.now()}`,
      question: `${faq.question} (Copy)`,
      answer: faq.answer,
      category: faq.category,
      displayOrder: maxOrder + 1,
      status: 'Draft', // default duplicates to Draft safely
      featured: faq.featured,
      lastUpdated: new Date().toISOString()
    };
    await firebaseService.saveFAQ(newFaq);
  };

  // Toggle single status (Enable/Disable)
  const handleToggleStatus = async (faq: FAQ) => {
    const nextStatus = faq.status === 'Active' ? 'Draft' : 'Active';
    const updated = {
      ...faq,
      status: nextStatus as 'Active' | 'Draft',
      lastUpdated: new Date().toISOString()
    };
    await firebaseService.saveFAQ(updated);
  };

  // Toggle Featured status
  const handleToggleFeatured = async (faq: FAQ) => {
    const updated = {
      ...faq,
      featured: !faq.featured,
      lastUpdated: new Date().toISOString()
    };
    await firebaseService.saveFAQ(updated);
  };

  // Move Display Order Up/Down (Live Swap)
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredFaqsList.length) return;

    const itemA = filteredFaqsList[index];
    const itemB = filteredFaqsList[targetIndex];

    // Swap their displayOrder values
    const tempOrder = itemA.displayOrder;
    const updatedA = { ...itemA, displayOrder: itemB.displayOrder, lastUpdated: new Date().toISOString() };
    const updatedB = { ...itemB, displayOrder: tempOrder, lastUpdated: new Date().toISOString() };

    await firebaseService.saveFAQ(updatedA);
    await firebaseService.saveFAQ(updatedB);
  };

  // Submit Save action
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formAnswer.trim()) return;

    const resolvedCategory = showCustomCategory || formCategory === 'Custom'
      ? (customCategoryName.trim() || 'General Questions')
      : formCategory;

    const faqData: FAQ = {
      id: editingFaq?.id || `faq-${Date.now()}`,
      question: formQuestion.trim(),
      answer: formAnswer.trim(),
      category: resolvedCategory,
      displayOrder: Number(formDisplayOrder),
      status: formStatus,
      featured: formFeatured,
      lastUpdated: new Date().toISOString()
    };

    await firebaseService.saveFAQ(faqData);
    setViewMode('list');
    setEditingFaq(null);
  };

  // Confirm delete FAQ
  const handleDeleteConfirm = async () => {
    if (showDeleteConfirm) {
      await firebaseService.deleteFAQ(showDeleteConfirm);
      setShowDeleteConfirm(null);
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

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* 1. HEADER SECTION & METRICS BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-lightsky-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-sky-500 animate-pulse" />
            FAQ Management Module
          </h2>
          <p className="text-xs text-slate-500">
            Publish knowledge base entries, organize categories, rearrange order and sync live parameters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'form' ? (
            <button
              onClick={() => setViewMode('list')}
              className="px-4 py-2 border border-slate-200 text-slate-650 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 transition"
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

      {/* Metric Tiles bar styled in modern Sky-Blue theme */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-sky-100 p-4 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-16 w-16 bg-sky-50/40 rounded-full -mr-4 -mt-4 transition-all group-hover:scale-110" />
          <span className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Total FAQs</span>
          <span className="text-3xl font-black text-sky-600 font-sans mt-1 block">{totalCount}</span>
        </div>

        <div className="bg-white border border-emerald-100 p-4 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-16 w-16 bg-emerald-50/40 rounded-full -mr-4 -mt-4 transition-all group-hover:scale-110" />
          <span className="block text-[9px] font-extrabold uppercase tracking-widest text-emerald-500">Active Website</span>
          <span className="text-3xl font-black text-emerald-600 font-sans mt-1 block">{activeCount}</span>
        </div>

        <div className="bg-white border border-amber-100 p-4 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-16 w-16 bg-amber-50/40 rounded-full -mr-4 -mt-4 transition-all group-hover:scale-110" />
          <span className="block text-[9px] font-extrabold uppercase tracking-widest text-amber-500 font-bold">Draft / Standby</span>
          <span className="text-3xl font-black text-amber-600 font-sans mt-1 block">{draftCount}</span>
        </div>

        <div className="bg-white border border-indigo-100 p-4 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-16 w-16 bg-indigo-50/40 rounded-full -mr-4 -mt-4 transition-all group-hover:scale-110" />
          <span className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Last Synced</span>
          <span className="text-xs font-bold text-indigo-700 font-mono mt-3.5 block flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-indigo-500 inline" />
            {recentlyUpdated}
          </span>
        </div>
      </div>

      {/* 2. CORE VIEW SWITCHING */}
      {viewMode === 'form' ? (
        /* Form View */
        <div className="bg-white border border-slate-205 rounded-2xl p-6 shadow-sm max-w-2xl mx-auto">
          <div className="border-b border-slate-100 pb-3 mb-5">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
              {editingFaq ? 'Edit FAQ Coordinates' : 'Submit New Knowledge Base Entry'}
            </h3>
            <p className="text-[11px] text-slate-450 mt-0.5">Set parameters accurately to keep website users perfectly guided.</p>
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
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-4 py-3 focus:border-sky-500 outline-none cursor-pointer"
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
                      formStatus === 'Active' ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('Draft')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer ${
                      formStatus === 'Draft' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    Draft
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-150">
                <div>
                  <span className="block text-xs font-bold text-slate-750">Featured FAQ</span>
                  <span className="text-[10px] text-slate-500">High priority visibility header</span>
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
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-200 text-slate-500 font-bold text-[10px] border border-transparent">
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
                className="px-4 py-2.5 border border-slate-200 text-slate-650 rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Quit Form
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition duration-150 cursor-pointer shadow-md shadow-sky-100"
              >
                {editingFaq ? 'Update Knowledge Node' : 'Publish to Live Web Stream'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* List & Table View */
        <div className="space-y-4">
          
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
                className="w-full pl-9 pr-4 py-2.5 bg-slate-5/50 border border-slate-200 text-slate-700 text-xs rounded-xl focus:border-sky-500 fill-none outline-none"
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

          {/* TABLE LOG ELEMENT */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 font-mono text-[9px] uppercase tracking-wider text-slate-500 select-none">
                    <th className="py-4.5 px-5 font-extrabold w-12 text-center">Order</th>
                    <th className="py-4.5 px-4 font-extrabold">FAQ Question Details</th>
                    <th className="py-4.5 px-4 font-extrabold w-48">Category</th>
                    <th className="py-4.5 px-4 font-extrabold w-28">Status</th>
                    <th className="py-4.5 px-4 font-extrabold w-36">Last Updated</th>
                    <th className="py-4.5 px-4 font-extrabold w-48 text-right pr-6">Management Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredFaqsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 space-y-2">
                        <FileText className="h-8 w-8 text-slate-300 mx-auto" />
                        <p className="font-medium text-slate-450">No FAQs matched search criteria.</p>
                        <p className="text-[10px] text-slate-400">Clear filters or register a new knowledge prompt above.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredFaqsList.map((faq, index) => {
                      const isFirst = index === 0;
                      const isLast = index === filteredFaqsList.length - 1;
                      
                      return (
                        <tr key={faq.id} className="hover:bg-sky-50/15 transition group">
                          
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
                          <td className="py-4 px-4 max-w-sm sm:max-w-md lg:max-w-lg">
                            <div className="space-y-1">
                              <div className="flex items-start gap-1.5">
                                {faq.featured && (
                                  <span className="shrink-0 mt-0.5" title="Featured Priority Placement">
                                    <Star className="h-3.5 w-3.5 fill-pink-500 text-pink-500" />
                                  </span>
                                )}
                                <span className="font-extrabold text-slate-800 hover:text-sky-600 transition block leading-snug">
                                  {faq.question}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-450 block truncate font-light leading-relaxed">
                                {faq.answer}
                              </span>
                            </div>
                          </td>

                          {/* Category Tag */}
                          <td className="py-4 px-4">
                            <span className="inline-flex px-2.5 py-1 text-[10px] rounded-lg font-bold bg-slate-50 border border-slate-150 text-slate-600 uppercase font-sans">
                              {faq.category}
                            </span>
                          </td>

                          {/* Active / Draft Status */}
                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleToggleStatus(faq)}
                              className="focus:outline-none cursor-pointer text-left block"
                              title="Toggle Publish Status on Website"
                            >
                              {faq.status === 'Active' ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-100">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-650 text-[10px] font-extrabold border border-slate-200">
                                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                  Draft
                                </span>
                              )}
                            </button>
                          </td>

                          {/* Last updated timestamp */}
                          <td className="py-4 px-4 font-mono text-[10px] text-slate-450">
                            {new Date(faq.lastUpdated).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>

                          {/* Actions panel */}
                          <td className="py-4 px-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition duration-150">
                              
                              {/* Quick toggle featured */}
                              <button
                                onClick={() => handleToggleFeatured(faq)}
                                className={`p-1.5 rounded-lg border transition ${
                                  faq.featured 
                                    ? 'bg-pink-50 border-pink-100 text-pink-600 hover:bg-pink-100' 
                                    : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                                title="Toggle Featured status"
                              >
                                <Star className="h-3.5 w-3.5" />
                              </button>

                              {/* Duplicate */}
                              <button
                                onClick={() => handleDuplicateFaq(faq)}
                                className="p-1.5 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-200 text-slate-400 hover:text-sky-600 transition rounded-lg"
                                title="Duplicate FAQ Record"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => handleEditFaqClick(faq)}
                                className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-650 hover:text-blue-600 transition rounded-lg"
                                title="Edit Coordinates"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>

                              {/* Trash Delete */}
                              <button
                                onClick={() => setShowDeleteConfirm(faq.id)}
                                className="p-1.5 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-400 hover:text-red-650 transition rounded-lg"
                                title="Erase knowledge"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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
                className="py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs transition text-center cursor-pointer"
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
