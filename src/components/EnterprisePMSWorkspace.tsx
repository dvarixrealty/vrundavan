import React, { useState } from "react";
import { 
  Building2, Image, Sliders, CheckSquare, MapPin, Layers, ShieldCheck, 
  DollarSign, TrendingUp, FileText, Play, Users, MessageSquare, HelpCircle, 
  Search, Palette, CheckCircle2, Plus, Trash2, Check, ExternalLink, Info, Lock, Globe, Video, Eye, Trash, PlusCircle
} from "lucide-react";
import MediaPicker from "./MediaPicker";
import MediaPickerModal, { MediaItem } from "./MediaPickerModal";

interface EnterprisePMSWorkspaceProps {
  editingId: string | null;
  currentPropertyId: string;
  completionPercentage: number;
  autosaveStatus: string;
  activeEditTab: string;
  setActiveEditTab: (tab: string) => void;
  workspaceTabs: any[];
  handleNavigateTab: (dir: 'next' | 'prev') => void;
  generateSlug: () => void;
  resetForm: () => void;
  handleCreateOrUpdate: (e: React.FormEvent) => void;
  categories: any[];
  taxCategories: any[];
  taxStatuses: any[];
  agents: any[];
  galleryUploads: any[];
  setGalleryUploads: (val: any[]) => void;
  uploadedCoverUrl: string;
  setUploadedCoverUrl: (url: string) => void;
  manualCoverUrl: string;
  setManualCoverUrl: (url: string) => void;

  // Form Basic States
  formBasic: any;
  setFormBasic: (val: any) => void;
  formLocation: any;
  setFormLocation: (val: any) => void;
  formPricing: any;
  setFormPricing: (val: any) => void;
  formSpecs: any;
  setFormSpecs: (val: any) => void;
  formProject: any;
  setFormProject: (val: any) => void;
  formInvestment: any;
  setFormInvestment: (val: any) => void;
  formBadges: any;
  setFormBadges: (val: any) => void;
  formAgent: any;
  setFormAgent: (val: any) => void;
  formAmenities: any[];
  setFormAmenities: (val: any[]) => void;

  // New PMS Workspace States
  formSlug: string;
  setFormSlug: (val: string) => void;
  formLongDescription: string;
  setFormLongDescription: (val: string) => void;
  formVisibility: string;
  setFormVisibility: (val: string) => void;
  formVisibilityPassword: string;
  setFormVisibilityPassword: (val: string) => void;
  formDroneImages: string;
  setFormDroneImages: (val: string) => void;
  formVideos: string;
  setFormVideos: (val: string) => void;
  formTours360: string;
  setFormTours360: (val: string) => void;
  formLayoutPlans: string;
  setFormLayoutPlans: (val: string) => void;
  formSpecsList: any[];
  setFormSpecsList: (val: any[] | ((prev: any[]) => any[])) => void;
  formNearbyPlaces: any[];
  setFormNearbyPlaces: (val: any[] | ((prev: any[]) => any[])) => void;
  formFloorPlans: any[];
  setFormFloorPlans: (val: any[] | ((prev: any[]) => any[])) => void;
  formLegal: any;
  setFormLegal: (val: any) => void;
  formPricingExtra: any;
  setFormPricingExtra: (val: any) => void;
  formInvestmentExtra: any;
  setFormInvestmentExtra: (val: any) => void;
  formDocuments: any[];
  setFormDocuments: (val: any[] | ((prev: any[]) => any[])) => void;
  formVideosExtra: any;
  setFormVideosExtra: (val: any) => void;
  formAgentExtra: any;
  setFormAgentExtra: (val: any) => void;
  formReviews: any[];
  setFormReviews: (val: any[] | ((prev: any[]) => any[])) => void;
  formFaqs: any[];
  setFormFaqs: (val: any[] | ((prev: any[]) => any[])) => void;
  formSeo: any;
  setFormSeo: (val: any) => void;
  formAppearance: any;
  setFormAppearance: (val: any) => void;
}

export default function EnterprisePMSWorkspace({
  editingId,
  currentPropertyId,
  completionPercentage,
  autosaveStatus,
  activeEditTab,
  setActiveEditTab,
  workspaceTabs,
  handleNavigateTab,
  generateSlug,
  resetForm,
  handleCreateOrUpdate,
  categories,
  taxCategories,
  taxStatuses,
  agents,
  galleryUploads,
  setGalleryUploads,
  uploadedCoverUrl,
  setUploadedCoverUrl,
  manualCoverUrl,
  setManualCoverUrl,

  formBasic,
  setFormBasic,
  formLocation,
  setFormLocation,
  formPricing,
  setFormPricing,
  formSpecs,
  setFormSpecs,
  formProject,
  setFormProject,
  formInvestment,
  setFormInvestment,
  formBadges,
  setFormBadges,
  formAgent,
  setFormAgent,
  formAmenities,
  setFormAmenities,

  formSlug,
  setFormSlug,
  formLongDescription,
  setFormLongDescription,
  formVisibility,
  setFormVisibility,
  formVisibilityPassword,
  setFormVisibilityPassword,
  formDroneImages,
  setFormDroneImages,
  formVideos,
  setFormVideos,
  formTours360,
  setFormTours360,
  formLayoutPlans,
  setFormLayoutPlans,
  formSpecsList,
  setFormSpecsList,
  formNearbyPlaces,
  setFormNearbyPlaces,
  formFloorPlans,
  setFormFloorPlans,
  formLegal,
  setFormLegal,
  formPricingExtra,
  setFormPricingExtra,
  formInvestmentExtra,
  setFormInvestmentExtra,
  formDocuments,
  setFormDocuments,
  formVideosExtra,
  setFormVideosExtra,
  formAgentExtra,
  setFormAgentExtra,
  formReviews,
  setFormReviews,
  formFaqs,
  setFormFaqs,
  formSeo,
  setFormSeo,
  formAppearance,
  setFormAppearance
}: EnterprisePMSWorkspaceProps) {
  // Local sub-modal states for DAM picker inside this workspace
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isOgImageModalOpen, setIsOgImageModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [currentPickingFloorIndex, setCurrentPickingFloorIndex] = useState<number | null>(null);

  // Specifications helpers
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  const handleAddSpec = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) return;
    setFormSpecsList((prev: any[]) => [...prev, { key: newSpecKey.trim(), value: newSpecValue.trim() }]);
    setNewSpecKey("");
    setNewSpecValue("");
  };
  const handleRemoveSpec = (idx: number) => {
    setFormSpecsList((prev: any[]) => prev.filter((_, i) => i !== idx));
  };

  // Nearby places helpers
  const [nearType, setNearType] = useState("School");
  const [nearName, setNearName] = useState("");
  const [nearDistance, setNearDistance] = useState("");
  const [nearDuration, setNearDuration] = useState("");
  const handleAddNearby = () => {
    if (!nearName.trim()) return;
    setFormNearbyPlaces((prev: any[]) => [
      ...prev,
      {
        id: "near-" + Date.now() + "-" + Math.random(),
        type: nearType,
        name: nearName.trim(),
        distance: nearDistance.trim() || "1 km",
        duration: nearDuration.trim() || "5 mins"
      }
    ]);
    setNearName("");
    setNearDistance("");
    setNearDuration("");
  };
  const handleRemoveNearby = (id: string) => {
    setFormNearbyPlaces((prev: any[]) => prev.filter(p => p.id !== id));
  };

  // Floor plans helpers
  const [floorName, setFloorName] = useState("");
  const [floorSize, setFloorSize] = useState("");
  const [floorDim, setFloorDim] = useState("");
  const [floorBeds, setFloorBeds] = useState("");
  const [floorBaths, setFloorBaths] = useState("");
  const [floorImage, setFloorImage] = useState("");
  const handleAddFloorPlan = () => {
    if (!floorName.trim()) return;
    setFormFloorPlans((prev: any[]) => [
      ...prev,
      {
        id: "floor-" + Date.now() + "-" + Math.random(),
        name: floorName.trim(),
        size: floorSize.trim() || "1200 SqFt",
        dimensions: floorDim.trim() || "30x40",
        beds: floorBeds.trim() || "3",
        baths: floorBaths.trim() || "3",
        image: floorImage || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
      }
    ]);
    setFloorName("");
    setFloorSize("");
    setFloorDim("");
    setFloorBeds("");
    setFloorBaths("");
    setFloorImage("");
  };
  const handleRemoveFloorPlan = (id: string) => {
    setFormFloorPlans((prev: any[]) => prev.filter(p => p.id !== id));
  };

  // Documents helpers
  const [docName, setDocName] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [docType, setDocType] = useState("PDF");
  const handleAddDocument = () => {
    if (!docName.trim() || !docUrl.trim()) return;
    setFormDocuments((prev: any[]) => [
      ...prev,
      {
        id: "doc-" + Date.now(),
        name: docName.trim(),
        url: docUrl.trim(),
        size: "2.4 MB",
        type: docType
      }
    ]);
    setDocName("");
    setDocUrl("");
  };
  const handleRemoveDocument = (id: string) => {
    setFormDocuments((prev: any[]) => prev.filter(d => d.id !== id));
  };

  // Reviews helpers
  const [revAuthor, setRevAuthor] = useState("");
  const [revRole, setRevRole] = useState("");
  const [revRating, setRevRating] = useState(5);
  const [revContent, setRevContent] = useState("");
  const handleAddReview = () => {
    if (!revAuthor.trim() || !revContent.trim()) return;
    setFormReviews((prev: any[]) => [
      ...prev,
      {
        id: "rev-" + Date.now(),
        authorName: revAuthor.trim(),
        authorRole: revRole.trim() || "Resident",
        rating: revRating,
        content: revContent.trim(),
        status: "Visible",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
      }
    ]);
    setRevAuthor("");
    setRevRole("");
    setRevRating(5);
    setRevContent("");
  };
  const handleRemoveReview = (id: string) => {
    setFormReviews((prev: any[]) => prev.filter(r => r.id !== id));
  };

  // FAQs helpers
  const [faqQ, setFaqQ] = useState("");
  const [faqA, setFaqA] = useState("");
  const handleAddFaq = () => {
    if (!faqQ.trim() || !faqA.trim()) return;
    setFormFaqs((prev: any[]) => [
      ...prev,
      {
        id: "faq-" + Date.now(),
        question: faqQ.trim(),
        answer: faqA.trim(),
        displayOrder: prev.length + 1,
        status: "Active"
      }
    ]);
    setFaqQ("");
    setFaqA("");
  };
  const handleRemoveFaq = (id: string) => {
    setFormFaqs((prev: any[]) => prev.filter(f => f.id !== id));
  };

  // Gallery Selectors from DAM Library
  const handleGallerySelectFromDAM = (items: MediaItem[]) => {
    if (items.length > 0) {
      const addedGallery = items.map((item, index) => ({
        id: `dam-${item.id}-${Date.now()}-${index}`,
        name: item.title || item.seo_filename || "Asset Image",
        progress: 100,
        uploading: false,
        url: item.public_url
      }));
      setGalleryUploads([...galleryUploads, ...addedGallery]);
    }
    setIsGalleryModalOpen(false);
  };

  // Floor plan selector
  const handleFloorPlanSelectFromDAM = (items: MediaItem[]) => {
    if (items.length > 0 && currentPickingFloorIndex !== null) {
      const selectedUrl = items[0].public_url;
      setFormFloorPlans((prev: any[]) => 
        prev.map((item, i) => i === currentPickingFloorIndex ? { ...item, image: selectedUrl } : item)
      );
    }
    setCurrentPickingFloorIndex(null);
  };

  // Document selector
  const handleDocSelectFromDAM = (items: MediaItem[]) => {
    if (items.length > 0) {
      const first = items[0];
      setFormDocuments((prev: any[]) => [
        ...prev,
        {
          id: `dam-doc-${first.id}-${Date.now()}`,
          name: first.title || first.seo_filename || "Property Brochure",
          url: first.public_url,
          size: "1.8 MB",
          type: "PDF"
        }
      ]);
    }
    setIsDocumentModalOpen(false);
  };

  // Helper calculation for compliance checklist
  const complianceChecklist = [
    { label: "Listing Title provided", valid: !!formBasic.title },
    { label: "Property Code set", valid: !!formBasic.code },
    { label: "Price set (>0)", valid: Number(formPricing.price) > 0 },
    { label: "Cover image set", valid: !!formBasic.image || !!uploadedCoverUrl || !!manualCoverUrl },
    { label: "RERA ID filled (Legal compliance)", valid: !!formLegal.reraId },
    { label: "City and Locality designated", valid: !!formLocation.city && !!formLocation.locationName },
    { label: "Assigned corporate agent mapped", valid: !!formAgent.assignedAgentId }
  ];

  const canPublish = complianceChecklist.filter(c => c.valid).length >= 4;

  return (
    <div className="bg-slate-950 border border-slate-900 rounded-3xl overflow-hidden shadow-2xl text-slate-100 flex flex-col md:flex-row min-h-[750px] animate-in fade-in duration-250">
      
      {/* LEFT SIDEBAR: 17 WORKSPACE TABS */}
      <div className="w-full md:w-80 bg-slate-900/40 border-r border-slate-900 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Header inside Sidebar */}
          <div className="text-left">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 bg-orange-600/10 border border-orange-500/20 text-orange-500 rounded-lg">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-mono font-bold text-orange-500 tracking-wider uppercase">Enterprise PMS</span>
            </div>
            <h3 className="font-extrabold text-slate-100 tracking-tight text-base leading-tight">
              {editingId ? "Listing Workspace" : "Asset Composer"}
            </h3>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              ID: <span className="font-mono text-indigo-400">{editingId || currentPropertyId}</span>
            </p>
          </div>

          {/* Progress and Autosave info */}
          <div className="bg-slate-950/80 border border-slate-900 p-3 rounded-xl space-y-2 text-left">
            <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400">
              <span>Profile Completion</span>
              <span className="text-indigo-400 font-bold">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-indigo-500 h-1.5 transition-all duration-300" 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="flex items-center gap-1.5 pt-1 text-[9px] text-slate-500 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{autosaveStatus}</span>
            </div>
          </div>

          {/* Dynamic 17 Tabs List */}
          <div className="space-y-1 max-h-[440px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 text-left">
            {workspaceTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeEditTab === tab.id;
              const isDone = tab.check();
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveEditTab(tab.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive 
                      ? "bg-orange-600 text-white shadow-md shadow-orange-600/10" 
                      : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span className="truncate">{tab.name}</span>
                  </div>
                  {isDone ? (
                    <Check className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-white" : "text-emerald-400 font-bold"}`} />
                  ) : tab.required ? (
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${isActive ? "bg-white" : "bg-amber-500"}`} />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Clear Form */}
        <div className="pt-6 border-t border-slate-900 mt-6 text-left">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Are you sure you want to clear the form? All unsaved inputs will be reset.")) {
                resetForm();
              }
            }}
            className="w-full py-2.5 bg-slate-950 hover:bg-red-950/20 border border-slate-900 hover:border-red-900/30 text-slate-450 hover:text-red-400 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear Workspace
          </button>
        </div>
      </div>

      {/* RIGHT CONTENT AREA: ACTIVE TAB PANEL */}
      <form onSubmit={handleCreateOrUpdate} className="flex-1 p-8 bg-slate-950 flex flex-col justify-between overflow-x-hidden text-left space-y-8">
        
        {/* Active Tab Header */}
        <div className="border-b border-slate-900 pb-4 flex justify-between items-center flex-wrap gap-4">
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-black">Workspace Partition</span>
            <h4 className="text-lg font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
              {activeEditTab}
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleNavigateTab("prev")}
              className="py-1.5 px-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-xs hover:bg-slate-800 transition active:scale-95 cursor-pointer font-bold"
            >
              &larr; Prev
            </button>
            <button
              type="button"
              onClick={() => handleNavigateTab("next")}
              className="py-1.5 px-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-xs hover:bg-slate-800 transition active:scale-95 cursor-pointer font-bold"
            >
              Next &rarr;
            </button>
          </div>
        </div>

        {/* ACTIVE PANEL CONTENT BODY */}
        <div className="flex-1 min-h-[480px]">
          
          {/* TAB 1: BASIC INFORMATION */}
          {activeEditTab === "Basic Information" && (
            <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Listing Title *</label>
                <input
                  type="text" required
                  value={formBasic.title}
                  onChange={(e) => setFormBasic({ ...formBasic, title: e.target.value })}
                  placeholder="e.g. Prestige Lavender Premium 4BHK Penthouse"
                  className="w-full bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-orange-500 p-3 rounded-xl outline-none font-bold text-slate-100 transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">URL Slug / Permalink</label>
                    <button
                      type="button"
                      onClick={generateSlug}
                      className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition"
                    >
                      🪄 Auto-Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="e.g. prestige-lavender-premium-4bhk-penthouse"
                    className="w-full bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-3 rounded-xl outline-none font-mono text-indigo-300 text-xs transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Property Code / SKU</label>
                  <input
                    type="text"
                    value={formBasic.code}
                    onChange={(e) => setFormBasic({ ...formBasic, code: e.target.value })}
                    placeholder="e.g. PL-9824"
                    className="w-full bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-3 rounded-xl outline-none font-mono text-slate-300 text-xs transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Classification Type</label>
                  <select
                    value={formBasic.type}
                    onChange={(e) => setFormBasic({ ...formBasic, type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 p-3 rounded-xl text-slate-300 text-xs cursor-pointer outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Parent Category</label>
                  <select
                    value={formBasic.category}
                    onChange={(e) => setFormBasic({ ...formBasic, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 p-3 rounded-xl text-slate-300 text-xs cursor-pointer outline-none"
                  >
                    {taxCategories.filter(c => c.status !== "Disabled").map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Marketing Status</label>
                  <select
                    value={formBasic.status}
                    onChange={(e) => setFormBasic({ ...formBasic, status: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 p-3 rounded-xl text-slate-300 text-xs cursor-pointer outline-none"
                  >
                    {taxStatuses.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Access Visibility</label>
                  <select
                    value={formVisibility}
                    onChange={(e) => setFormVisibility(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 p-3 rounded-xl text-slate-300 text-xs cursor-pointer outline-none"
                  >
                    <option value="Public">🌍 Public Listing (Everyone)</option>
                    <option value="Private">🔒 Private (Admins & Owners only)</option>
                    <option value="Password-Protected">🔑 Password-Protected (With Key)</option>
                  </select>
                </div>

                {formVisibility === "Password-Protected" && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-150">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Protection Key / Password</label>
                    <input
                      type="text"
                      value={formVisibilityPassword}
                      onChange={(e) => setFormVisibilityPassword(e.target.value)}
                      placeholder="Enter listing access code"
                      className="w-full bg-slate-900/60 border border-slate-800 p-3 rounded-xl outline-none font-mono text-slate-300 text-xs transition-all"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Short Pitch / Summary *</label>
                <textarea
                  required
                  value={formBasic.description}
                  onChange={(e) => setFormBasic({ ...formBasic, description: e.target.value })}
                  rows={2}
                  placeholder="Provide a captivating 1-2 sentence overview shown in thumbnails..."
                  className="w-full bg-slate-900/60 border border-slate-800 p-3 rounded-xl outline-none text-slate-300 text-xs transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">In-Depth Editorial Description (Rich-Text)</label>
                <textarea
                  value={formLongDescription}
                  onChange={(e) => setFormLongDescription(e.target.value)}
                  rows={6}
                  placeholder="Enter extensive specifications, structural blueprints, historical significance, local features..."
                  className="w-full bg-slate-900/60 border border-slate-800 p-3 rounded-xl outline-none text-slate-300 text-xs transition-all font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB 2: MEDIA GALLERY */}
          {activeEditTab === "Media Gallery" && (
            <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-2 w-2 rounded-full bg-orange-600" />
                  <h5 className="font-extrabold text-sm text-white">Hero Cover Image</h5>
                </div>
                <MediaPicker
                  label=""
                  value={formBasic.image}
                  onChange={(url) => setFormBasic({ ...formBasic, image: url })}
                  folder="properties"
                  category="Image"
                />
                <p className="text-[10px] text-slate-500 font-mono">This serves as the primary visual display in listing cards and headers.</p>
              </div>

              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-600" />
                    <h5 className="font-extrabold text-sm text-white">Interactive Photo Gallery</h5>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsGalleryModalOpen(true)}
                    className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Select From Media Center
                  </button>
                </div>

                {galleryUploads.length === 0 ? (
                  <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500">
                    <Image className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                    <p className="text-xs font-semibold">No Gallery Assets Appended</p>
                    <p className="text-[10px] mt-0.5">Click the button above to add assets from the corporate Media Center.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {galleryUploads.map((item, index) => (
                      <div key={item.id} className="relative aspect-video rounded-lg overflow-hidden border border-slate-800 bg-slate-950 group">
                        <img src={item.url} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all">
                          <button
                            type="button"
                            onClick={() => {
                              setGalleryUploads(galleryUploads.filter(g => g.id !== item.id));
                            }}
                            className="p-1.5 bg-red-950/80 hover:bg-red-900 text-red-400 rounded-md transition"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Manual direct paste */}
                <div className="space-y-1 pt-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Manual Comma-Separated URL Override</label>
                  <input
                    type="text"
                    value={formBasic.imagesStr}
                    onChange={(e) => {
                      const str = e.target.value;
                      setFormBasic({ ...formBasic, imagesStr: str });
                      // Instantly populate gallery state for visual feedback
                      const urls = str.split(",").map(u => u.trim()).filter(Boolean);
                      const items = urls.map((url, i) => ({
                        id: `man-${i}-${Date.now()}`,
                        url,
                        progress: 100
                      }));
                      setGalleryUploads(items);
                    }}
                    placeholder="https://image-url-1.com, https://image-url-2.com..."
                    className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg outline-none font-mono text-[10px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROPERTY SPECIFICATIONS */}
          {activeEditTab === "Property Specifications" && (
            <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                <div className="text-left border-b border-slate-900 pb-3">
                  <h5 className="font-extrabold text-sm text-white">Dynamic Specifications Profile Builder</h5>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-sans mt-0.5">Customize specifications specifically for this real-estate asset. These are displayed as high-contrast structural matrices.</p>
                </div>

                <div className="space-y-3">
                  {formSpecsList.map((spec, index) => (
                    <div key={index} className="flex gap-2.5 items-center bg-slate-950 p-2.5 border border-slate-900 rounded-xl animate-in slide-in-from-top-1">
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] font-mono text-slate-500 uppercase block mb-0.5">Specification Key</span>
                          <input
                            type="text"
                            value={spec.key}
                            onChange={(e) => {
                              const keyVal = e.target.value;
                              setFormSpecsList((prev: any[]) => prev.map((item, idx) => idx === index ? { ...item, key: keyVal } : item));
                            }}
                            className="w-full bg-transparent border-b border-slate-800 focus:border-orange-500 py-1 px-0.5 outline-none font-extrabold text-xs text-white transition-all"
                          />
                        </div>
                        <div>
                          <span className="text-[9px] font-mono text-slate-500 uppercase block mb-0.5">Value</span>
                          <input
                            type="text"
                            value={spec.value}
                            onChange={(e) => {
                              const valVal = e.target.value;
                              setFormSpecsList((prev: any[]) => prev.map((item, idx) => idx === index ? { ...item, value: valVal } : item));
                            }}
                            className="w-full bg-transparent border-b border-slate-800 focus:border-orange-500 py-1 px-0.5 outline-none font-bold text-xs text-indigo-300 transition-all"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(index)}
                        className="p-1.5 hover:bg-red-950/20 text-slate-500 hover:text-red-400 rounded-lg transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-900 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">New Key</label>
                    <input
                      type="text"
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                      placeholder="e.g. Total Balconies"
                      className="w-full bg-slate-950 border border-slate-900 p-2.5 rounded-lg outline-none text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Value</label>
                    <input
                      type="text"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      placeholder="e.g. 3 Premium Balconies"
                      className="w-full bg-slate-950 border border-slate-900 p-2.5 rounded-lg outline-none text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-lg transition cursor-pointer"
                  >
                    Add Specification Row
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AMENITIES */}
          {activeEditTab === "Amenities" && (
            <div className="space-y-6 max-w-4xl animate-in fade-in duration-200 text-left">
              <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3 flex-wrap gap-2">
                  <div>
                    <h5 className="font-extrabold text-sm text-white">Dynamic Asset Amenities</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Toggle dynamic checklist amenities or add customized listings.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {[
                    "Swimming Pool", "Premium Gym", "Children Play Park", "Power Backup 100%", "Clubhouse 15000sft", 
                    "24/7 High Security", "Multipurpose Hall", "Jogging Track", "Squash Court", "Covered Car Parking",
                    "Indoor Games Lounge", "CCTV Surveillance", "Intercom Facility", "Gas Pipeline Connection", "Fire Safety Systems", "Rainwater Harvesting"
                  ].map((amenity) => {
                    const isSelected = formAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setFormAmenities(formAmenities.filter(a => a !== amenity));
                          } else {
                            setFormAmenities([...formAmenities, amenity]);
                          }
                        }}
                        className={`p-3 border rounded-xl text-left font-semibold text-xs transition duration-150 flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? "bg-indigo-600/10 border-indigo-500 text-indigo-400 font-bold" 
                            : "bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800"
                        }`}
                      >
                        <span>{amenity}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LOCATION & NEARBY PLACES */}
          {activeEditTab === "Location & Nearby Places" && (
            <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                <h5 className="font-extrabold text-sm text-white border-b border-slate-900 pb-2">Geographical Mapping</h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Locality / Landmark *</label>
                    <input
                      type="text" required
                      value={formLocation.locationName}
                      onChange={(e) => setFormLocation({ ...formLocation, locationName: e.target.value })}
                      placeholder="e.g. Near Sarjapur Outer Ring Road"
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">City / Township *</label>
                    <input
                      type="text" required
                      value={formLocation.city}
                      onChange={(e) => setFormLocation({ ...formLocation, city: e.target.value })}
                      placeholder="e.g. Bengaluru"
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">State</label>
                    <input
                      type="text"
                      value={formLocation.state}
                      onChange={(e) => setFormLocation({ ...formLocation, state: e.target.value })}
                      placeholder="e.g. Karnataka"
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Country</label>
                    <input
                      type="text"
                      value={formLocation.country}
                      onChange={(e) => setFormLocation({ ...formLocation, country: e.target.value })}
                      placeholder="e.g. India"
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Micro-Landmark</label>
                    <input
                      type="text"
                      value={formLocation.landmark}
                      onChange={(e) => setFormLocation({ ...formLocation, landmark: e.target.value })}
                      placeholder="e.g. Opposite Wipro SEZ Campus"
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Google Map Deep Link</label>
                  <input
                    type="text"
                    value={formLocation.googleMapLocation}
                    onChange={(e) => setFormLocation({ ...formLocation, googleMapLocation: e.target.value })}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-indigo-300 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Latitude Coordinate</label>
                    <input
                      type="text"
                      value={formLocation.latitude}
                      onChange={(e) => setFormLocation({ ...formLocation, latitude: e.target.value })}
                      placeholder="e.g. 12.9716"
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-100 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Longitude Coordinate</label>
                    <input
                      type="text"
                      value={formLocation.longitude}
                      onChange={(e) => setFormLocation({ ...formLocation, longitude: e.target.value })}
                      placeholder="e.g. 77.5946"
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Nearby list */}
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                <h5 className="font-extrabold text-sm text-white border-b border-slate-900 pb-2">Nearby Locational Hotspots</h5>
                
                <div className="space-y-2.5">
                  {formNearbyPlaces.map((place) => (
                    <div key={place.id} className="flex justify-between items-center bg-slate-950 p-2.5 border border-slate-900 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="py-1 px-2 bg-indigo-950 text-indigo-400 border border-indigo-900 font-bold uppercase font-mono text-[9px] rounded">
                          {place.type}
                        </span>
                        <span className="text-xs font-extrabold text-slate-200">{place.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({place.distance} &bull; {place.duration})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveNearby(place.id)}
                        className="p-1 hover:bg-red-950/20 text-slate-500 hover:text-red-400 rounded-lg transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 items-end pt-3 border-t border-slate-900">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Type</label>
                    <select
                      value={nearType}
                      onChange={(e) => setNearType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 p-2 rounded-lg text-xs"
                    >
                      <option value="School">🏫 School</option>
                      <option value="Hospital">🏥 Hospital</option>
                      <option value="Metro Station">🚇 Metro</option>
                      <option value="Airport">✈️ Airport</option>
                      <option value="Shopping Mall">🛍️ Shopping</option>
                      <option value="IT Hub">💻 IT Park</option>
                      <option value="Other">📍 Other</option>
                    </select>
                  </div>
                  <div className="space-y-1 col-span-1 md:col-span-2">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Place Name</label>
                    <input
                      type="text"
                      value={nearName}
                      onChange={(e) => setNearName(e.target.value)}
                      placeholder="e.g. Greenwood High School"
                      className="w-full bg-slate-950 border border-slate-900 p-2 rounded-lg text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1 col-span-2 md:col-span-1">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Dist</label>
                      <input
                        type="text"
                        value={nearDistance}
                        onChange={(e) => setNearDistance(e.target.value)}
                        placeholder="1.2 km"
                        className="w-full bg-slate-950 border border-slate-900 p-2 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Time</label>
                      <input
                        type="text"
                        value={nearDuration}
                        onChange={(e) => setNearDuration(e.target.value)}
                        placeholder="5 mins"
                        className="w-full bg-slate-950 border border-slate-900 p-2 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleAddNearby}
                    className="py-1.5 px-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg transition"
                  >
                    Add Nearby Landmark
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PLOT / FLOOR LAYOUT */}
          {activeEditTab === "Plot / Floor Layout" && (
            <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4 text-left">
                <h5 className="font-extrabold text-sm text-white border-b border-slate-900 pb-2">Floor Plan Manager</h5>
                
                <div className="space-y-4">
                  {formFloorPlans.map((plan, idx) => (
                    <div key={plan.id} className="bg-slate-950 p-4 border border-slate-900 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <h6 className="font-extrabold text-xs text-indigo-400">{plan.name || "Floor plan block"}</h6>
                        <button
                          type="button"
                          onClick={() => handleRemoveFloorPlan(plan.id)}
                          className="p-1 hover:bg-red-950/20 text-slate-500 hover:text-red-450 rounded-lg transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-500 uppercase font-bold">Floor Name</span>
                          <input
                            type="text"
                            value={plan.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormFloorPlans(prev => prev.map((p, i) => i === idx ? { ...p, name: val } : p));
                            }}
                            className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-500 uppercase font-bold">Area Size</span>
                          <input
                            type="text"
                            value={plan.size}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormFloorPlans(prev => prev.map((p, i) => i === idx ? { ...p, size: val } : p));
                            }}
                            className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-500 uppercase font-bold">Dimensions</span>
                          <input
                            type="text"
                            value={plan.dimensions}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormFloorPlans(prev => prev.map((p, i) => i === idx ? { ...p, dimensions: val } : p));
                            }}
                            className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-500 uppercase font-bold">Plan Layout Image</span>
                          <button
                            type="button"
                            onClick={() => setCurrentPickingFloorIndex(idx)}
                            className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-left text-[10px] text-indigo-400 font-mono truncate"
                          >
                            {plan.image ? "Change Image" : "Select Asset"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormFloorPlans(prev => [
                        ...prev,
                        {
                          id: "floor-plan-" + Date.now(),
                          name: "Block Suite " + (prev.length + 1),
                          size: "1450 SqFt",
                          dimensions: "40x50",
                          beds: "3",
                          baths: "3",
                          image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
                        }
                      ]);
                    }}
                    className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-750 text-white font-extrabold text-xs rounded-lg transition"
                  >
                    + Append Floor Plan Layout
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: LEGAL INFORMATION */}
          {activeEditTab === "Legal Information" && (
            <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                <h5 className="font-extrabold text-sm text-white border-b border-slate-900 pb-2">Regulatory & Legal Compliance Profile</h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">RERA Registration ID *</label>
                    <input
                      type="text"
                      value={formLegal.reraId}
                      onChange={(e) => setFormLegal({ ...formLegal, reraId: e.target.value })}
                      placeholder="e.g. PRM/KA/RERA/1251/310/PR/171015/000282"
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-100 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Clear Title Registry</label>
                    <select
                      value={formLegal.clearTitle}
                      onChange={(e) => setFormLegal({ ...formLegal, clearTitle: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-slate-300 text-xs cursor-pointer outline-none"
                    >
                      <option value="Yes">Yes &bull; Clear marketable title checked</option>
                      <option value="In-Progress">In-Progress &bull; Under legal inspection</option>
                      <option value="Pending">Pending review</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">DC Conversion Status</label>
                    <select
                      value={formLegal.dcConversion}
                      onChange={(e) => setFormLegal({ ...formLegal, dcConversion: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-slate-300 text-xs cursor-pointer outline-none"
                    >
                      <option value="Yes">Converted</option>
                      <option value="Pending">Pending</option>
                      <option value="Not Applicable">Not Applicable</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">E-Khata Category</label>
                    <select
                      value={formLegal.eKhata}
                      onChange={(e) => setFormLegal({ ...formLegal, eKhata: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-slate-300 text-xs cursor-pointer outline-none"
                    >
                      <option value="A-Khata">A-Khata</option>
                      <option value="B-Khata">B-Khata</option>
                      <option value="E-Khata">E-Khata</option>
                      <option value="None">None</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Bank Approvals</label>
                    <input
                      type="text"
                      value={formLegal.bankApproval}
                      onChange={(e) => setFormLegal({ ...formLegal, bankApproval: e.target.value })}
                      placeholder="SBI, HDFC, ICICI approved"
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Legal Audit Remarks</label>
                  <textarea
                    value={formLegal.legalNotes}
                    onChange={(e) => setFormLegal({ ...formLegal, legalNotes: e.target.value })}
                    rows={3}
                    placeholder="Enter explicit legal findings, structural approvals, litigation exemptions..."
                    className="w-full bg-slate-900/60 border border-slate-800 p-3 rounded-xl outline-none text-slate-300 text-xs transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: PRICING & PAYMENT */}
          {activeEditTab === "Pricing & Payment" && (
            <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                <h5 className="font-extrabold text-sm text-white border-b border-slate-900 pb-2">Financial Valuation</h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Listing Price (INR) *</label>
                    <input
                      type="text" required
                      value={formPricing.price}
                      onChange={(e) => setFormPricing({ ...formPricing, price: e.target.value })}
                      placeholder="e.g. 15000000 (1.5 Crore)"
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-100 font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Price per Square Foot (INR)</label>
                    <input
                      type="text"
                      value={formPricing.pricePerSqFt}
                      onChange={(e) => setFormPricing({ ...formPricing, pricePerSqFt: e.target.value })}
                      placeholder="e.g. 7500"
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Price Status Type</label>
                    <select
                      value={formPricing.priceStatus}
                      onChange={(e) => setFormPricing({ ...formPricing, priceStatus: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-slate-300 text-xs cursor-pointer outline-none"
                    >
                      <option value="All-inclusive">All-inclusive registration price</option>
                      <option value="Base Price + Taxes">Base price + taxes extra</option>
                      <option value="Price on Request">Price strictly on verification</option>
                    </select>
                  </div>

                  <div className="space-y-2 flex items-center pt-6">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-300">
                      <input
                        type="checkbox"
                        checked={formPricing.negotiable}
                        onChange={(e) => setFormPricing({ ...formPricing, negotiable: e.target.checked })}
                        className="rounded bg-slate-900 border-slate-800 text-indigo-600 h-4 w-4"
                      />
                      <span>Is Price Negotiable</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-900 pt-3">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Registration & Duty charges</label>
                    <input
                      type="text"
                      value={formPricingExtra.registrationCharges}
                      onChange={(e) => setFormPricingExtra({ ...formPricingExtra, registrationCharges: e.target.value })}
                      placeholder="e.g. 7%"
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-100 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Maintenance Charges / Mo</label>
                    <input
                      type="text"
                      value={formPricingExtra.maintenance}
                      onChange={(e) => setFormPricingExtra({ ...formPricingExtra, maintenance: e.target.value })}
                      placeholder="e.g. 5000"
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-100 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Token Booking Advance</label>
                    <input
                      type="text"
                      value={formPricingExtra.bookingAmount}
                      onChange={(e) => setFormPricingExtra({ ...formPricingExtra, bookingAmount: e.target.value })}
                      placeholder="e.g. 200000"
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-100 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: INVESTMENT ANALYSIS */}
          {activeEditTab === "Investment Analysis" && (
            <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                <h5 className="font-extrabold text-sm text-white border-b border-slate-900 pb-2">ROI & Yield Projections</h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Expected ROI (% p.a.)</label>
                    <input
                      type="text"
                      value={formInvestment.expectedROI}
                      onChange={(e) => setFormInvestment({ ...formInvestment, expectedROI: e.target.value })}
                      placeholder="e.g. 12"
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-100 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Rental Yield (% p.a.)</label>
                    <input
                      type="text"
                      value={formInvestment.rentalYield}
                      onChange={(e) => setFormInvestment({ ...formInvestment, rentalYield: e.target.value })}
                      placeholder="e.g. 4.5"
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Appreciation Potential</label>
                    <select
                      value={formInvestment.appreciationPotential}
                      onChange={(e) => setFormInvestment({ ...formInvestment, appreciationPotential: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-slate-300 text-xs cursor-pointer outline-none"
                    >
                      <option value="Exceptional">Exceptional &bull; Dynamic SEZ proximity</option>
                      <option value="High">High &bull; Stable growth</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Inquiry Demand Index</label>
                    <select
                      value={formInvestment.demandLevel}
                      onChange={(e) => setFormInvestment({ ...formInvestment, demandLevel: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-slate-300 text-xs cursor-pointer outline-none"
                    >
                      <option value="Extreme">Extreme &bull; High volume bookings</option>
                      <option value="High Demand">High</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Investment Score (0-100)</label>
                    <input
                      type="text"
                      value={formInvestment.investmentScore}
                      onChange={(e) => setFormInvestment({ ...formInvestment, investmentScore: e.target.value })}
                      placeholder="95"
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-100 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: DOCUMENTS */}
          {activeEditTab === "Documents" && (
            <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3 flex-wrap gap-2">
                  <h5 className="font-extrabold text-sm text-white">Appended Digital Documents & brochures</h5>
                  <button
                    type="button"
                    onClick={() => setIsDocumentModalOpen(true)}
                    className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Select From Media Center
                  </button>
                </div>

                <div className="space-y-2.5">
                  {formDocuments.length === 0 ? (
                    <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                      <p className="text-xs font-semibold">No Legal/Marketing Documents Appended</p>
                      <p className="text-[10px] mt-0.5">Click the button above to browse PDF files from the DAM library.</p>
                    </div>
                  ) : (
                    formDocuments.map((doc) => (
                      <div key={doc.id} className="flex justify-between items-center bg-slate-950 p-3 border border-slate-900 rounded-xl">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-indigo-400" />
                          <div>
                            <span className="text-xs font-extrabold text-slate-200">{doc.name}</span>
                            <span className="text-[9px] text-slate-500 font-mono block">Type: {doc.type} &bull; Size: {doc.size}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="p-1 hover:bg-red-950/20 text-slate-500 hover:text-red-400 rounded-lg transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: VIDEOS & 360 TOUR */}
          {activeEditTab === "Videos & 360 Tour" && (
            <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                <h5 className="font-extrabold text-sm text-white border-b border-slate-900 pb-2">Cinematic Video & Immersive Embeds</h5>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Site Walkthrough Video Link</label>
                    <input
                      type="text"
                      value={formVideosExtra.siteVideos}
                      onChange={(e) => setFormVideosExtra({ ...formVideosExtra, siteVideos: e.target.value })}
                      placeholder="e.g. https://www.youtube.com/watch?v=..."
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Drone Flyover Video Link</label>
                    <input
                      type="text"
                      value={formVideosExtra.droneVideos}
                      onChange={(e) => setFormVideosExtra({ ...formVideosExtra, droneVideos: e.target.value })}
                      placeholder="e.g. https://www.youtube.com/watch?v=..."
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">360 VR Immersive Panoramic URL</label>
                    <input
                      type="text"
                      value={formVideosExtra.tour360Url}
                      onChange={(e) => setFormVideosExtra({ ...formVideosExtra, tour360Url: e.target.value })}
                      placeholder="e.g. https://my.matterport.com/show/?m=..."
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-indigo-300 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: ASSIGNED AGENT */}
          {activeEditTab === "Assigned Agent" && (
            <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                <h5 className="font-extrabold text-sm text-white border-b border-slate-900 pb-2">Assigned Real Estate Portfolio Executive</h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Corporate Agent Map *</label>
                    <select
                      value={formAgent.assignedAgentId}
                      onChange={(e) => {
                        const selAgentId = e.target.value;
                        const matchedAgent = agents.find(a => a.id === selAgentId);
                        setFormAgent({
                          ...formAgent,
                          assignedAgentId: selAgentId,
                          agentContact: matchedAgent ? matchedAgent.phone : ""
                        });
                        setFormAgentExtra({
                          whatsapp: matchedAgent ? matchedAgent.phone : "",
                          email: matchedAgent ? matchedAgent.email : ""
                        });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-slate-300 text-xs cursor-pointer outline-none font-bold"
                    >
                      <option value="">Select Representative Officer</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>{a.name} ({a.role || "Executive"})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Direct Contact Phone</label>
                    <input
                      type="text"
                      value={formAgent.agentContact}
                      onChange={(e) => setFormAgent({ ...formAgent, agentContact: e.target.value })}
                      placeholder="+91 98240 XXXXX"
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-900 pt-3">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">WhatsApp Connect Override</label>
                    <input
                      type="text"
                      value={formAgentExtra.whatsapp}
                      onChange={(e) => setFormAgentExtra({ ...formAgentExtra, whatsapp: e.target.value })}
                      placeholder="+91 98240 XXXXX"
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-100 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Inquiry Routing Email</label>
                    <input
                      type="email"
                      value={formAgentExtra.email}
                      onChange={(e) => setFormAgentExtra({ ...formAgentExtra, email: e.target.value })}
                      placeholder="representative@dvarix.com"
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-100 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 13: REVIEWS */}
          {activeEditTab === "Reviews" && (
            <div className="space-y-6 max-w-3xl animate-in fade-in duration-200 text-left">
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                <h5 className="font-extrabold text-sm text-white border-b border-slate-900 pb-2">Resident Testimonials Builder</h5>
                
                <div className="space-y-2.5">
                  {formReviews.map((rev) => (
                    <div key={rev.id} className="bg-slate-950 p-3 border border-slate-900 rounded-xl flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-white">{rev.authorName}</span>
                          <span className="text-[9px] text-indigo-400 font-mono font-bold">({rev.authorRole})</span>
                          <span className="text-[10px] text-amber-500 font-bold">★ {rev.rating}/5</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans mt-1 leading-relaxed">"{rev.content}"</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveReview(rev.id)}
                        className="p-1 hover:bg-red-950/20 text-slate-500 hover:text-red-400 rounded-lg transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-slate-900 items-end">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Author Name</label>
                    <input
                      type="text"
                      value={revAuthor}
                      onChange={(e) => setRevAuthor(e.target.value)}
                      placeholder="e.g. Ramesh Hegde"
                      className="w-full bg-slate-950 border border-slate-900 p-2 rounded text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Designation</label>
                    <input
                      type="text"
                      value={revRole}
                      onChange={(e) => setRevRole(e.target.value)}
                      placeholder="e.g. Premium Wing Resident"
                      className="w-full bg-slate-950 border border-slate-900 p-2 rounded text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Rating Star (1-5)</label>
                    <select
                      value={revRating}
                      onChange={(e) => setRevRating(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-900 p-2 rounded text-xs text-white"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                      <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                      <option value={3}>⭐⭐⭐ 3 Stars</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Review Quote</label>
                  <textarea
                    value={revContent}
                    onChange={(e) => setRevContent(e.target.value)}
                    rows={2}
                    placeholder="Provide detailed feedback quotes..."
                    className="w-full bg-slate-950 border border-slate-900 p-2 rounded text-xs text-slate-300 resize-none"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAddReview}
                    className="py-1.5 px-3.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-lg transition"
                  >
                    Add Testimonial Row
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 14: FAQS */}
          {activeEditTab === "FAQs" && (
            <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                <h5 className="font-extrabold text-sm text-white border-b border-slate-900 pb-2">Dynamic Listing FAQ Panel</h5>
                
                <div className="space-y-3">
                  {formFaqs.map((faq) => (
                    <div key={faq.id} className="bg-slate-950 p-3 border border-slate-900 rounded-xl">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-black text-white">Q: {faq.question}</p>
                          <p className="text-[11px] text-slate-450 font-sans mt-1">A: {faq.answer}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(faq.id)}
                          className="p-1 hover:bg-red-950/20 text-slate-500 hover:text-red-400 rounded-lg transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-900 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Question Key</label>
                    <input
                      type="text"
                      value={faqQ}
                      onChange={(e) => setFaqQ(e.target.value)}
                      placeholder="e.g. Is water supply corporate kaveri?"
                      className="w-full bg-slate-950 border border-slate-900 p-2.5 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Answer Body</label>
                    <textarea
                      value={faqA}
                      onChange={(e) => setFaqA(e.target.value)}
                      rows={2}
                      placeholder="e.g. Yes, we have active Kaveri connection paired with 3 borewells..."
                      className="w-full bg-slate-950 border border-slate-900 p-2.5 rounded-lg text-xs text-slate-300 resize-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddFaq}
                      className="py-1.5 px-3.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-lg transition"
                    >
                      Append FAQ Row
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 15: SEO */}
          {activeEditTab === "SEO" && (
            <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                <h5 className="font-extrabold text-sm text-white border-b border-slate-900 pb-2">Meta Taxonomy Optimization</h5>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Meta Title Tag</label>
                      <span className="text-[10px] font-mono text-slate-500">{formSeo.metaTitle.length}/60 chars (ideal)</span>
                    </div>
                    <input
                      type="text"
                      value={formSeo.metaTitle}
                      onChange={(e) => setFormSeo({ ...formSeo, metaTitle: e.target.value.substring(0, 70) })}
                      placeholder="e.g. Prestige Lavender 4BHK Villa for Sale in Sarjapur"
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Meta Description Tag</label>
                      <span className="text-[10px] font-mono text-slate-500">{formSeo.metaDescription.length}/160 chars (ideal)</span>
                    </div>
                    <textarea
                      value={formSeo.metaDescription}
                      onChange={(e) => setFormSeo({ ...formSeo, metaDescription: e.target.value.substring(0, 180) })}
                      rows={3}
                      placeholder="Enter a highly descriptive marketing meta pitch optimized for index crawler rankings..."
                      className="w-full bg-slate-900/60 border border-slate-800 p-3 rounded-xl outline-none text-slate-300 text-xs transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Meta Keywords Tags</label>
                    <input
                      type="text"
                      value={formSeo.keywords}
                      onChange={(e) => setFormSeo({ ...formSeo, keywords: e.target.value })}
                      placeholder="villa, prestige, sarjapur, luxury, 4bhk"
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-100 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 16: APPEARANCE & BRANDING */}
          {activeEditTab === "Appearance & Branding" && (
            <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                <h5 className="font-extrabold text-sm text-white border-b border-slate-900 pb-2">Custom Theme Customizer</h5>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Primary Theme Color</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={formAppearance.primaryColor}
                        onChange={(e) => setFormAppearance({ ...formAppearance, primaryColor: e.target.value })}
                        className="h-8 w-8 rounded cursor-pointer bg-transparent border border-slate-800"
                      />
                      <span className="text-xs font-mono font-bold uppercase">{formAppearance.primaryColor}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Secondary Palette</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={formAppearance.secondaryColor}
                        onChange={(e) => setFormAppearance({ ...formAppearance, secondaryColor: e.target.value })}
                        className="h-8 w-8 rounded cursor-pointer bg-transparent border border-slate-800"
                      />
                      <span className="text-xs font-mono font-bold uppercase">{formAppearance.secondaryColor}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Accent Highlights</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={formAppearance.accentColor}
                        onChange={(e) => setFormAppearance({ ...formAppearance, accentColor: e.target.value })}
                        className="h-8 w-8 rounded cursor-pointer bg-transparent border border-slate-800"
                      />
                      <span className="text-xs font-mono font-bold uppercase">{formAppearance.accentColor}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Background Tint</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={formAppearance.backgroundColor}
                        onChange={(e) => setFormAppearance({ ...formAppearance, backgroundColor: e.target.value })}
                        className="h-8 w-8 rounded cursor-pointer bg-transparent border border-slate-800"
                      />
                      <span className="text-xs font-mono font-bold uppercase">{formAppearance.backgroundColor}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-900 pt-3">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Heading Typography Font</label>
                    <select
                      value={formAppearance.headingStyle}
                      onChange={(e) => setFormAppearance({ ...formAppearance, headingStyle: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-slate-300 text-xs cursor-pointer outline-none"
                    >
                      <option value="Space Grotesk">Space Grotesk &bull; Modernist High-Tech</option>
                      <option value="Inter">Inter &bull; Geometric clean Swiss</option>
                      <option value="Playfair Display">Playfair Display &bull; Elegant Serif Luxury</option>
                      <option value="Outfit">Outfit &bull; Tech-forward Premium</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Hero Overlay Gradient Opacity (%)</label>
                    <input
                      type="number"
                      value={formAppearance.overlayOpacity}
                      onChange={(e) => setFormAppearance({ ...formAppearance, overlayOpacity: Number(e.target.value) })}
                      min={0} max={100}
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-100 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 17: PUBLISH SETTINGS */}
          {activeEditTab === "Publish Settings" && (
            <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4 text-left">
                <h5 className="font-extrabold text-sm text-white border-b border-slate-900 pb-2">Pre-Publish Compliance Audit</h5>
                
                <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-900">
                  {complianceChecklist.map((check, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs">
                      {check.valid ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-slate-800 shrink-0" />
                      )}
                      <span className={check.valid ? "text-slate-300 font-medium" : "text-slate-650"}>{check.label}</span>
                    </div>
                  ))}
                </div>

                {!canPublish && (
                  <div className="bg-amber-950/20 border border-amber-900/30 p-3.5 rounded-xl flex items-start gap-2 text-xs text-amber-300">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>Minimum publication requirements not fully checklist verified. We recommend filling out at least 4 verification dots before setting state to Live.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* WORKSPACE FOOTER ACTIONS */}
        <div className="border-t border-slate-900 pt-6 mt-8 flex flex-wrap justify-between items-center gap-4">
          <div className="text-left">
            <p className="text-[10px] text-slate-500 font-mono">Workspace Status Ready</p>
            <p className="text-xs text-slate-400 font-semibold font-sans mt-0.5">Asset checklist score: <span className="text-indigo-400 font-black">{complianceChecklist.filter(c => c.valid).length} / 7</span></p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                resetForm();
                // Navigate back to listing
              }}
              className="py-2.5 px-5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Exit Workspace
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-600/10 transition cursor-pointer"
            >
              {editingId ? "Save Specs & Sync Workspace" : "Publish Active Portfolio Asset"}
            </button>
          </div>
        </div>

      </form>

      {/* MODAL PICKERS FOR DAM INTERACTION */}
      <MediaPickerModal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        onSelect={handleGallerySelectFromDAM}
        allowMultiple={true}
        allowedFolder="properties"
        allowedCategory="Image"
      />

      <MediaPickerModal
        isOpen={currentPickingFloorIndex !== null}
        onClose={() => setCurrentPickingFloorIndex(null)}
        onSelect={handleFloorPlanSelectFromDAM}
        allowMultiple={false}
        allowedFolder="properties"
        allowedCategory="Image"
      />

      <MediaPickerModal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        onSelect={handleDocSelectFromDAM}
        allowMultiple={false}
        allowedFolder="properties"
        allowedCategory="Document"
      />

    </div>
  );
}
