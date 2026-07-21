import React, { useState, useEffect } from 'react';
import { 
  Search, Edit, Copy, Check, RotateCcw, Save, Play, 
  Trash2, Plus, AlertCircle, Eye, RefreshCw, Layers
} from 'lucide-react';
import { SEOPageConfig } from '../../types/seo';

interface SEOMetaTagManagerProps {
  pages: SEOPageConfig[];
  onSavePage: (page: SEOPageConfig) => Promise<void> | void;
  onDuplicatePage: (page: SEOPageConfig) => void;
  onDeletePage: (id: string) => void;
  onAddCustomPage: (pageName: string, urlSlug: string) => void;
  loggedInUser?: {
    email: string;
    role: 'Admin Head' | 'Super Admin' | 'Manager' | 'Sales Agent' | string;
  };
}

export default function SEOMetaTagManager({
  pages,
  onSavePage,
  onDuplicatePage,
  onDeletePage,
  onAddCustomPage,
  loggedInUser
}: SEOMetaTagManagerProps) {
  const isAdminHead = loggedInUser?.role === 'Admin Head' || loggedInUser?.role === 'Super Admin' || loggedInUser?.role === 'Admin' || loggedInUser?.role === 'Super Administrator';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPage, setSelectedPage] = useState<SEOPageConfig | null>(null);
  
  // Custom Page Creator Inputs
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustSlug, setNewCustSlug] = useState('');

  // Form states
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formKeywords, setFormKeywords] = useState('');
  const [formCanonical, setFormCanonical] = useState('');
  const [formIndex, setFormIndex] = useState(true);
  const [formFollow, setFormFollow] = useState(true);
  const [formOgTitle, setFormOgTitle] = useState('');
  const [formOgDesc, setFormOgDesc] = useState('');
  const [formOgImage, setFormOgImage] = useState('');
  const [formTwTitle, setFormTwTitle] = useState('');
  const [formTwDesc, setFormTwDesc] = useState('');
  const [formTwImage, setFormTwImage] = useState('');

  // Advanced fields & tracking
  const [formRobotsMeta, setFormRobotsMeta] = useState('index, follow');
  const [formSchemaMarkup, setFormSchemaMarkup] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Loaded selected page into state
  useEffect(() => {
    if (pages.length > 0 && !selectedPage) {
      setSelectedPage(pages[0]);
    }
  }, [pages, selectedPage]);

  useEffect(() => {
    if (selectedPage) {
      setFormName(selectedPage.pageName);
      setFormSlug(selectedPage.urlSlug);
      setFormTitle(selectedPage.metaTitle);
      setFormDesc(selectedPage.metaDescription);
      setFormKeywords(selectedPage.metaKeywords);
      setFormCanonical(selectedPage.canonicalUrl);
      setFormIndex(selectedPage.robotsIndex);
      setFormFollow(selectedPage.robotsFollow);
      setFormOgTitle(selectedPage.ogTitle || selectedPage.metaTitle);
      setFormOgDesc(selectedPage.ogDescription || selectedPage.metaDescription);
      setFormOgImage(selectedPage.ogImage || '');
      setFormTwTitle(selectedPage.twitterTitle || selectedPage.metaTitle);
      setFormTwDesc(selectedPage.twitterDescription || selectedPage.metaDescription);
      setFormTwImage(selectedPage.twitterImage || '');
      setFormRobotsMeta(selectedPage.robotsMeta || (selectedPage.robotsIndex ? 'index, follow' : 'noindex, nofollow'));
      setFormSchemaMarkup(selectedPage.schemaMarkup || '');
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [selectedPage]);

  // Search filtered pages
  const filteredPages = pages.filter(p => 
    p.pageName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.urlSlug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    // Required fields validation
    if (!formTitle.trim()) {
      setErrorMsg('Meta Title is required.');
      return;
    }
    if (!formDesc.trim()) {
      setErrorMsg('Meta Description is required.');
      return;
    }
    if (!formKeywords.trim()) {
      setErrorMsg('Keywords are required.');
      return;
    }
    if (!formOgTitle.trim()) {
      setErrorMsg('Open Graph Title is required.');
      return;
    }
    if (!formOgDesc.trim()) {
      setErrorMsg('Open Graph Description is required.');
      return;
    }
    if (!formOgImage.trim()) {
      setErrorMsg('Open Graph Image URL is required.');
      return;
    }
    if (!formTwTitle.trim()) {
      setErrorMsg('Twitter Card Title is required.');
      return;
    }
    if (!formTwDesc.trim()) {
      setErrorMsg('Twitter Card Description is required.');
      return;
    }
    if (!formCanonical.trim()) {
      setErrorMsg('Canonical URL is required.');
      return;
    }
    if (!formRobotsMeta.trim()) {
      setErrorMsg('Robots Meta is required.');
      return;
    }
    if (!formSchemaMarkup.trim()) {
      setErrorMsg('Schema Markup is required.');
      return;
    }

    setIsSaving(true);

    const updated: SEOPageConfig = {
      ...selectedPage,
      pageName: formName,
      urlSlug: formSlug,
      metaTitle: formTitle,
      metaDescription: formDesc,
      metaKeywords: formKeywords,
      canonicalUrl: formCanonical,
      robotsIndex: formIndex,
      robotsFollow: formFollow,
      ogTitle: formOgTitle,
      ogDescription: formOgDesc,
      ogImage: formOgImage,
      twitterTitle: formTwTitle,
      twitterDescription: formTwDesc,
      twitterImage: formTwImage,
      robotsMeta: formRobotsMeta,
      schemaMarkup: formSchemaMarkup,
      lastUpdated: new Date().toISOString()
    };

    try {
      await onSavePage(updated);
      setSuccessMsg('SEO settings updated successfully');
      setSelectedPage(updated);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update SEO settings in Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (selectedPage) {
      setSelectedPage({ ...selectedPage }); // triggers reload effect
    }
  };

  const handleCreatePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustSlug) return;
    onAddCustomPage(newCustName, newCustSlug);
    setNewCustName('');
    setNewCustSlug('');
    setShowAddModal(false);
  };

  const generateAutoSlug = () => {
    const slug = formName
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-');
    setFormSlug('/' + slug);
  };

  // Live count diagnostics
  const titleCount = formTitle.length;
  const descCount = formDesc.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans text-slate-100" id="seo-meta-tag-manager">
      
      {/* LEFT COLUMN: PAGE NAVIGATION / SELECTOR (4 COLS) */}
      <div className="lg:col-span-4 bg-[#0F1115]/90 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md flex flex-col h-[650px] shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Website Pages</h3>
          {isAdminHead && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="p-1.5 bg-[#C89B3C]/10 text-[#C89B3C] border border-[#C89B3C]/20 rounded-lg hover:bg-[#C89B3C]/20 transition flex items-center gap-1 text-[10px] font-bold"
            >
              <Plus className="w-3 h-3" /> ADD CUSTOM
            </button>
          )}
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-3">
          <input 
            type="text" 
            placeholder="Search pages or routes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#15181F] border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-[#C89B3C] text-slate-200"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>

        {/* PAGES SCROLLER */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1.5 scrollbar-thin">
          {filteredPages.map(p => {
            const isSelected = selectedPage?.id === p.id;
            return (
              <div 
                key={p.id}
                onClick={() => setSelectedPage(p)}
                className={`p-3 rounded-xl cursor-pointer flex justify-between items-center transition ${isSelected ? 'bg-[#C89B3C]/10 border border-[#C89B3C]/30 text-white' : 'bg-slate-900/45 border border-slate-800/40 text-slate-400 hover:bg-slate-850/60 hover:text-slate-200'}`}
              >
                <div>
                  <span className="text-xs font-bold block">{p.pageName}</span>
                  <span className="text-[10px] font-mono mt-0.5 block opacity-70">{p.urlSlug}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${p.score && p.score >= 90 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {p.score || 85} Score
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: METADATA FORM & REAL-TIME PREVIEW (8 COLS) */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* GOOGLE EMBEED SERP LIVE MOCK PREVIEW */}
        <div className="bg-[#0D0F13] border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-3 right-4 px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded text-[9px] font-bold text-indigo-400 uppercase font-mono tracking-wider">
            Live SERP Preview
          </div>
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3.5">Google Search Snippet Emulator</h4>
          <div className="bg-[#1A1C20]/40 border border-slate-850 p-4 rounded-xl max-w-xl">
            <p className="text-[11px] text-[#8ab4f8] font-mono tracking-tight hover:underline cursor-pointer truncate">
              https://dvarixrealty.com{formSlug}
            </p>
            <h3 className="text-lg text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer font-medium mt-1 leading-snug font-sans">
              {formTitle || 'No Title Entered Yet'}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed truncate-2-lines">
              {formDesc || 'Please input a meta description below. Google will dynamically truncate this description, keep it under 160 characters for maximum search engine click-through performance.'}
            </p>
          </div>
        </div>

        {/* EDITOR FORM CARD */}
        {selectedPage ? (
          <form onSubmit={handleSave} className="bg-[#0F1115]/90 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Edit Meta Tags: {formName}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Last indexed sync: {new Date(selectedPage.lastUpdated).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl transition text-xs font-bold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
                {isAdminHead && (
                  <>
                    <button 
                      type="button"
                      onClick={() => onDuplicatePage(selectedPage)}
                      className="px-3 py-1.5 bg-slate-850 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition text-xs font-bold flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" /> Duplicate
                    </button>
                    <button 
                      type="button"
                      onClick={() => onDeletePage(selectedPage.id)}
                      className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-xl transition text-xs font-bold flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* ERROR AND SUCCESS NOTIFICATIONS */}
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-xl flex items-center gap-2 animate-pulse">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-400 mb-1">Page Name</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#15181F] border border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#C89B3C]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 flex justify-between">
                  <span>URL Slug</span>
                  <span 
                    onClick={generateAutoSlug}
                    className="text-[#C89B3C] font-black uppercase text-[9px] cursor-pointer hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-2.5 h-2.5" /> Auto-Gen
                  </span>
                </label>
                <input 
                  type="text" 
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="w-full bg-[#15181F] border border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#C89B3C] font-mono text-emerald-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-400 mb-1 flex justify-between">
                  <span>Meta Title Tag</span>
                  <span className={`text-[10px] font-mono font-bold ${titleCount > 60 ? 'text-rose-500' : 'text-emerald-400'}`}>
                    {titleCount} / 60 Chars {titleCount > 60 && '⚠️ Overlimit'}
                  </span>
                </label>
                <input 
                  type="text" 
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Enter high-converting search keywords here..."
                  className={`w-full bg-[#15181F] border rounded-xl py-2.5 px-3 text-xs focus:outline-none ${titleCount > 60 ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-[#C89B3C]'}`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-400 mb-1 flex justify-between">
                  <span>Meta Description Tag</span>
                  <span className={`text-[10px] font-mono font-bold ${descCount > 160 ? 'text-rose-500' : 'text-emerald-400'}`}>
                    {descCount} / 160 Chars {descCount > 160 && '⚠️ Overlimit'}
                  </span>
                </label>
                <textarea 
                  rows={2.5}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Include a dynamic call to action like direct builder pricing, high ROI, zero brokerage..."
                  className={`w-full bg-[#15181F] border rounded-xl py-2 px-3 text-xs focus:outline-none ${descCount > 160 ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-[#C89B3C]'}`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-400 mb-1">Meta Keywords (Comma separated)</label>
                <input 
                  type="text" 
                  value={formKeywords}
                  onChange={(e) => setFormKeywords(e.target.value)}
                  placeholder="e.g. premium land, luxury villas whitefield, zero brokerage"
                  className="w-full bg-[#15181F] border border-slate-800 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-[#C89B3C] font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-400 mb-1">Canonical URL</label>
                <input 
                  type="text" 
                  value={formCanonical}
                  onChange={(e) => setFormCanonical(e.target.value)}
                  placeholder="https://dvarixrealty.com/about"
                  className="w-full bg-[#15181F] border border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#C89B3C] font-mono text-indigo-300"
                />
              </div>

              {/* ROBOTS CRAWLER CHECKS */}
              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formIndex}
                    onChange={(e) => setFormIndex(e.target.checked)}
                    className="rounded border-slate-800 text-[#C89B3C] focus:ring-0 bg-[#15181F] w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200">Robots Index (noindex)</span>
                    <span className="text-[10px] text-slate-500 block">Allow indexing on search engines</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formFollow}
                    onChange={(e) => setFormFollow(e.target.checked)}
                    className="rounded border-slate-800 text-[#C89B3C] focus:ring-0 bg-[#15181F] w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200">Robots Follow (nofollow)</span>
                    <span className="text-[10px] text-slate-500 block">Allow crawlers to follow links</span>
                  </div>
                </label>
              </div>
            </div>

            {/* OG & TWITTER EXPANDABLE ROW */}
            <div className="border-t border-slate-800 pt-4 mt-2">
              <h4 className="text-xs font-bold text-[#C89B3C] uppercase tracking-wider mb-3">Open Graph & Twitter Social Metadata</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-400 mb-1">Open Graph Title</label>
                  <input 
                    type="text" 
                    value={formOgTitle}
                    onChange={(e) => setFormOgTitle(e.target.value)}
                    className="w-full bg-[#15181F] border border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#C89B3C]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Twitter Card Title</label>
                  <input 
                    type="text" 
                    value={formTwTitle}
                    onChange={(e) => setFormTwTitle(e.target.value)}
                    className="w-full bg-[#15181F] border border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#C89B3C]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Open Graph Description</label>
                  <textarea 
                    rows={2}
                    value={formOgDesc}
                    onChange={(e) => setFormOgDesc(e.target.value)}
                    className="w-full bg-[#15181F] border border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#C89B3C]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Twitter Card Description</label>
                  <textarea 
                    rows={2}
                    value={formTwDesc}
                    onChange={(e) => setFormTwDesc(e.target.value)}
                    className="w-full bg-[#15181F] border border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#C89B3C]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Open Graph Image (URL)</label>
                  <input 
                    type="text" 
                    value={formOgImage}
                    onChange={(e) => setFormOgImage(e.target.value)}
                    className="w-full bg-[#15181F] border border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#C89B3C] font-mono text-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Twitter Card Image (URL)</label>
                  <input 
                    type="text" 
                    value={formTwImage}
                    onChange={(e) => setFormTwImage(e.target.value)}
                    className="w-full bg-[#15181F] border border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#C89B3C] font-mono text-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* ADVANCED SEO, ROBOTS & SCHEMA */}
            <div className="border-t border-slate-800 pt-4 mt-2">
              <h4 className="text-xs font-bold text-[#C89B3C] uppercase tracking-wider mb-3">Advanced Robots Meta & Structured Schema Markup</h4>
              
              <div className="grid grid-cols-1 gap-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-400 mb-1">Robots Meta Tag Configuration</label>
                  <input 
                    type="text" 
                    value={formRobotsMeta}
                    onChange={(e) => setFormRobotsMeta(e.target.value)}
                    placeholder="e.g. index, follow, max-image-preview:large"
                    className="w-full bg-[#15181F] border border-slate-800 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-[#C89B3C] font-mono text-indigo-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Schema Markup (JSON-LD JSON script block)</label>
                  <textarea 
                    rows={6}
                    value={formSchemaMarkup}
                    onChange={(e) => setFormSchemaMarkup(e.target.value)}
                    placeholder='{ "@context": "https://schema.org", "@type": "WebPage", ... }'
                    className="w-full bg-[#15181F] border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-[#C89B3C] font-mono text-emerald-400 leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {isAdminHead && (
              <div className="flex justify-end pt-3 border-t border-slate-800/85">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#C89B3C] to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> SAVE & DEPLOY CONFIGURATION
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        ) : (
          <div className="bg-[#0F1115]/90 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400 shadow-2xl flex flex-col justify-center items-center">
            <Layers className="w-12 h-12 text-[#C89B3C]/20 mb-3" />
            <p className="font-bold text-slate-200">No Page Selected</p>
            <p className="text-xs mt-1">Select a route or page on the left panel to begin editing meta tags.</p>
          </div>
        )}

      </div>

      {/* CREATE NEW CUSTOM PAGE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans text-slate-100">
          <div className="bg-[#0F1115] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Add Custom Website Page</h3>
              <p className="text-[10px] text-slate-500 mt-0.5 font-mono">Dynamic route SEO integration system</p>
            </div>

            <form onSubmit={handleCreatePageSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-400 mb-1">Custom Page Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Prestige Plots Devanahalli"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-[#15181F] border border-slate-800 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-[#C89B3C]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 flex justify-between">
                  <span>URL Slug / Route Path</span>
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. /prestige-plots-devanahalli"
                  value={newCustSlug}
                  onChange={(e) => setNewCustSlug(e.target.value)}
                  className="w-full bg-[#15181F] border border-slate-800 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-[#C89B3C] font-mono text-emerald-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/85">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 rounded-xl transition text-xs font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#C89B3C] hover:bg-amber-600 text-slate-950 rounded-xl transition text-xs font-bold"
                >
                  Create SEO Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
