import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, Edit, Trash2, Copy, ArrowUp, ArrowDown, Search, Filter, 
  Eye, FileText, Check, X, Calendar, User, Tag, Layout, Settings, 
  MessageSquare, Sliders, Globe, EyeOff, Save, FolderOpen, RefreshCw, Sparkles, AlertCircle, Link2, Share2, BarChart2, CheckSquare, Upload, Play, CheckSquare2
} from 'lucide-react';
import { CampaignService, SiteCMSConfig, CampaignButtonSettings, CampaignFormFieldsConfig } from '../../types';
import { firebaseService } from '../../lib/firebaseService';

interface CampaignManagerProps {
  siteSettings?: SiteCMSConfig;
  setSiteSettings?: (newSettings: SiteCMSConfig) => void;
}

export default function CampaignManager({ siteSettings, setSiteSettings }: CampaignManagerProps) {
  const [campaigns, setCampaigns] = useState<CampaignService[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modal / Editor States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Partial<CampaignService> | null>(null);
  const [editorTab, setEditorTab] = useState<'edit' | 'form' | 'actions' | 'preview'>('edit');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Subscribe to real-time campaign services collection
  useEffect(() => {
    setLoading(true);
    const unsubscribe = firebaseService.subscribeCampaignServices(
      (list) => {
        if (list.length > 0) {
          setCampaigns(list);
          setLoading(false);
        } else {
          // If Firestore collection is empty, seed it with fallback siteSettings.offers
          const fallbackOffers = siteSettings?.offers || [];
          if (fallbackOffers.length > 0) {
            const seeded: CampaignService[] = fallbackOffers.map((o, idx) => ({
              id: o.id || `offer-${Date.now()}-${idx}`,
              title: o.title || '',
              badge: o.badge || 'PROMOTION',
              shortDescription: o.description || '',
              fullDescription: o.description || '',
              image: o.image || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
              category: 'Offers',
              displayOrder: idx + 1,
              status: o.active ? 'Published' : 'Draft',
              publishDate: new Date().toISOString().split('T')[0],
              expiryDate: o.validTill || '',
              autoPublish: false,
              autoExpire: false,
              button1: { text: 'Enquire Now', icon: 'Phone', action: 'Open Popup Form' },
              button2: { text: 'WhatsApp Advisor', icon: 'MessageSquare', action: 'WhatsApp', value: '+919876543210' },
              formFields: {
                fullName: { enabled: true, required: true },
                mobileNumber: { enabled: true, required: true },
                emailAddress: { enabled: true, required: false },
                city: { enabled: false, required: false },
                budget: { enabled: false, required: false },
                propertyType: { enabled: false, required: false },
                preferredLocation: { enabled: false, required: false },
                message: { enabled: true, required: false },
                uploadDocuments: { enabled: false, required: false },
                uploadImages: { enabled: false, required: false }
              },
              afterSubmission: { action: 'Thank You Popup', value: 'Thank you for submitting your inquiry. We will contact you soon!' },
              views: Math.floor(Math.random() * 120) + 10,
              clicks: Math.floor(Math.random() * 40) + 5,
              submissions: Math.floor(Math.random() * 10) + 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }));
            
            // Save each to firestore
            seeded.forEach(svc => firebaseService.saveCampaignService(svc));
            setCampaigns(seeded);
          } else {
            setCampaigns([]);
          }
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error loading campaigns from Firestore:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe?.();
  }, [siteSettings?.offers]);

  // Sync to fallback siteSettings.offers for public website views
  const syncToSiteSettings = (updatedList: CampaignService[]) => {
    if (!setSiteSettings || !siteSettings) return;

    const legacyOffers = updatedList.map(svc => ({
      id: svc.id,
      title: svc.title,
      badge: svc.badge,
      description: svc.shortDescription,
      validTill: svc.expiryDate,
      image: svc.image,
      active: svc.status === 'Published',
      // Attach the extended fields so public view can render the buttons and form beautifully
      button1: svc.button1,
      button2: svc.button2,
      formFields: svc.formFields,
      afterSubmission: svc.afterSubmission
    }));

    const newSettings = {
      ...siteSettings,
      offers: legacyOffers
    };

    setSiteSettings(newSettings);
    firebaseService.saveSiteSettings(newSettings);
  };

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.badge.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = filterCategory === 'All' || c.category === filterCategory;
      const matchStatus = filterStatus === 'All' || c.status === filterStatus;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [campaigns, searchQuery, filterCategory, filterStatus]);

  // List of unique categories
  const categoriesList = useMemo(() => {
    const list = new Set<string>();
    campaigns.forEach(c => { if (c.category) list.add(c.category); });
    return ['All', ...Array.from(list)];
  }, [campaigns]);

  // Handle Duplication
  const handleDuplicate = async (campaign: CampaignService) => {
    const duplicated: CampaignService = {
      ...campaign,
      id: `campaign-${Date.now()}`,
      title: `${campaign.title} (Copy)`,
      status: 'Draft',
      displayOrder: campaigns.length > 0 ? Math.max(...campaigns.map(c => c.displayOrder || 0)) + 1 : 1,
      views: 0,
      clicks: 0,
      submissions: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newList = [...campaigns, duplicated];
    setCampaigns(newList);
    await firebaseService.saveCampaignService(duplicated);
    syncToSiteSettings(newList);
  };

  // Handle Deletion
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Campaign/Service? This cannot be undone.')) return;
    const newList = campaigns.filter(c => c.id !== id);
    setCampaigns(newList);
    await firebaseService.deleteCampaignService(id);
    syncToSiteSettings(newList);
  };

  // Handle Quick Enable/Disable toggle
  const handleToggleStatus = async (campaign: CampaignService) => {
    const newStatus = campaign.status === 'Published' ? 'Draft' : 'Published';
    const updated = {
      ...campaign,
      status: newStatus as 'Published' | 'Draft',
      updatedAt: new Date().toISOString()
    };

    const newList = campaigns.map(c => c.id === campaign.id ? updated : c);
    setCampaigns(newList);
    await firebaseService.saveCampaignService(updated);
    syncToSiteSettings(newList);
  };

  // Ordering actions
  const handleMoveUp = async (idx: number) => {
    if (idx === 0) return;
    const newList = [...filteredCampaigns];
    const itemA = newList[idx];
    const itemB = newList[idx - 1];

    const tempOrder = itemA.displayOrder;
    itemA.displayOrder = itemB.displayOrder;
    itemB.displayOrder = tempOrder;

    const globalUpdated = campaigns.map(c => {
      if (c.id === itemA.id) return itemA;
      if (c.id === itemB.id) return itemB;
      return c;
    });

    setCampaigns(globalUpdated);
    await firebaseService.saveCampaignService(itemA);
    await firebaseService.saveCampaignService(itemB);
    syncToSiteSettings(globalUpdated);
  };

  const handleMoveDown = async (idx: number) => {
    if (idx === filteredCampaigns.length - 1) return;
    const newList = [...filteredCampaigns];
    const itemA = newList[idx];
    const itemB = newList[idx + 1];

    const tempOrder = itemA.displayOrder;
    itemA.displayOrder = itemB.displayOrder;
    itemB.displayOrder = tempOrder;

    const globalUpdated = campaigns.map(c => {
      if (c.id === itemA.id) return itemA;
      if (c.id === itemB.id) return itemB;
      return c;
    });

    setCampaigns(globalUpdated);
    await firebaseService.saveCampaignService(itemA);
    await firebaseService.saveCampaignService(itemB);
    syncToSiteSettings(globalUpdated);
  };

  // Save/Create campaign in Editor
  const handleSaveEditor = async () => {
    if (!editingCampaign.title || !editingCampaign.shortDescription) {
      alert("Please fill out the Campaign Name and Short Description");
      return;
    }

    const payload = {
      ...editingCampaign,
      updatedAt: new Date().toISOString()
    } as CampaignService;

    const isNew = !campaigns.some(c => c.id === payload.id);
    let newList: CampaignService[] = [];
    if (isNew) {
      newList = [...campaigns, payload];
    } else {
      newList = campaigns.map(c => c.id === payload.id ? payload : c);
    }

    setCampaigns(newList);
    await firebaseService.saveCampaignService(payload);
    syncToSiteSettings(newList);
    setIsEditorOpen(false);
    setEditingCampaign(null);
  };

  const handleOpenAdd = () => {
    const nextOrder = campaigns.length > 0 ? Math.max(...campaigns.map(c => c.displayOrder || 0)) + 1 : 1;
    setEditingCampaign({
      id: `campaign-${Date.now()}`,
      title: '',
      badge: 'LIMITED OFFER',
      shortDescription: '',
      fullDescription: '',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
      category: 'Offers',
      displayOrder: nextOrder,
      status: 'Draft',
      publishDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      autoPublish: false,
      autoExpire: false,
      button1: { text: 'Enquire Now', icon: 'Phone', action: 'Open Popup Form' },
      button2: { text: 'WhatsApp Advisor', icon: 'MessageSquare', action: 'WhatsApp', value: '+919876543210' },
      formFields: {
        fullName: { enabled: true, required: true },
        mobileNumber: { enabled: true, required: true },
        emailAddress: { enabled: true, required: false },
        city: { enabled: false, required: false },
        budget: { enabled: false, required: false },
        propertyType: { enabled: false, required: false },
        preferredLocation: { enabled: false, required: false },
        message: { enabled: true, required: false },
        uploadDocuments: { enabled: false, required: false },
        uploadImages: { enabled: false, required: false }
      },
      afterSubmission: { action: 'Thank You Popup', value: 'Thank you for submitting your request!' },
      views: 0,
      clicks: 0,
      submissions: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setEditorTab('edit');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (campaign: CampaignService) => {
    setEditingCampaign({ ...campaign });
    setEditorTab('edit');
    setIsEditorOpen(true);
  };

  // Cover Image upload drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setEditingCampaign(prev => prev ? { ...prev, image: reader.result as string } : null);
      };
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setEditingCampaign(prev => prev ? { ...prev, image: reader.result as string } : null);
      };
    }
  };

  return (
    <div className="space-y-6 font-sans text-left" id="campaign-manager-dashboard">
      
      {/* Search and Filters Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-slate-400 placeholder:text-slate-400 transition-all font-light"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
          >
            <option value="All">All Categories</option>
            {categoriesList.filter(c => c !== 'All').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Expired">Expired</option>
            <option value="Hidden">Hidden</option>
          </select>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#ff5a3c] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shrink-0 transition hover:bg-[#e04326] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Campaign / Service
          </button>
        </div>
      </div>

      {/* Campaigns list rendering */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 space-y-2">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-slate-400" />
          <p className="text-xs">Loading services & campaigns...</p>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center space-y-3 shadow-xs">
          <FolderOpen className="h-10 w-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-800">No campaigns found</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto font-light leading-relaxed">
            There are no campaigns matching your current filters. Add a new campaign to display on the live website.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-slate-900 border border-slate-900 rounded-xl text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            Create First Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="campaigns-grid-list">
          {filteredCampaigns.map((campaign, idx) => {
            const conversionRate = campaign.views > 0 
              ? ((campaign.submissions / campaign.views) * 100).toFixed(1) 
              : '0.0';

            return (
              <div 
                key={campaign.id} 
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col group relative"
              >
                {/* Visual Status Indicator Badge */}
                <div className="absolute top-3 right-3 z-10 flex gap-1.5">
                  <span className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded shadow-xs ${
                    campaign.status === 'Published' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : campaign.status === 'Draft'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : campaign.status === 'Scheduled'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-slate-50 text-slate-500 border border-slate-200'
                  }`}>
                    {campaign.status}
                  </span>
                </div>

                {/* Cover Image */}
                <div className="h-40 relative overflow-hidden bg-slate-100">
                  <img 
                    src={campaign.image} 
                    alt={campaign.title} 
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[9px] uppercase font-mono font-black bg-[#ff5a3c] text-white px-2.5 py-1 rounded shadow-xs">
                      {campaign.badge}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      {campaign.category}
                    </span>
                    <h4 className="text-base font-bold text-slate-800 tracking-tight leading-snug line-clamp-1">
                      {campaign.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-light line-clamp-2">
                      {campaign.shortDescription}
                    </p>
                  </div>

                  {/* Buttons configuration preview */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-[10px]">
                    <div className="space-y-0.5 border-r border-slate-200/60 pr-2">
                      <span className="font-mono text-[9px] text-slate-400 block uppercase">Button 1</span>
                      <span className="font-semibold text-slate-700 truncate block">{campaign.button1?.text || 'None'}</span>
                      <span className="text-slate-400 block truncate">{campaign.button1?.action}</span>
                    </div>
                    <div className="space-y-0.5 pl-1">
                      <span className="font-mono text-[9px] text-slate-400 block uppercase">Button 2</span>
                      <span className="font-semibold text-slate-700 truncate block">{campaign.button2?.text || 'None'}</span>
                      <span className="text-slate-400 block truncate">{campaign.button2?.action}</span>
                    </div>
                  </div>

                  {/* Stats Analytics Board */}
                  <div className="border-t border-b border-slate-100 py-3 grid grid-cols-4 gap-2 text-center">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">Views</span>
                      <span className="text-xs font-bold text-slate-800">{campaign.views || 0}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">Clicks</span>
                      <span className="text-xs font-bold text-slate-800">{campaign.clicks || 0}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">Submits</span>
                      <span className="text-xs font-bold text-[#ff5a3c]">{campaign.submissions || 0}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">Conv. Rate</span>
                      <span className="text-xs font-bold text-emerald-600">{conversionRate}%</span>
                    </div>
                  </div>

                  {/* Ordering and Admin Actions Footer */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    {/* Display Order actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-500 disabled:opacity-40"
                        title="Move Up (Display Order)"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === filteredCampaigns.length - 1}
                        className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-500 disabled:opacity-40"
                        title="Move Down (Display Order)"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-[10px] font-mono text-slate-400 px-1">
                        Display: {campaign.displayOrder}
                      </span>
                    </div>

                    {/* CRUD Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleStatus(campaign)}
                        className={`p-1.5 rounded-lg border text-[10px] uppercase font-bold tracking-wider ${
                          campaign.status === 'Published'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                        title={campaign.status === 'Published' ? "Mark Draft (Unpublish)" : "Publish Live"}
                      >
                        {campaign.status === 'Published' ? 'LIVE' : 'DRAFT'}
                      </button>
                      
                      <button
                        onClick={() => handleDuplicate(campaign)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-500"
                        title="Duplicate Campaign"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(campaign)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-500"
                        title="Edit Details"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(campaign.id)}
                        className="p-1.5 rounded-lg border border-red-100 hover:border-red-200 hover:bg-red-50 text-red-500"
                        title="Delete Campaign"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && editingCampaign && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl relative flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <div>
                <h3 className="text-base font-bold text-slate-800 tracking-tight">
                  Campaign / Service Editor
                </h3>
                <p className="text-[11px] text-slate-400 font-light">
                  Configure campaign layouts, interactive dynamic form fields and post submit actions.
                </p>
              </div>
              <button 
                onClick={() => { setIsEditorOpen(false); setEditingCampaign(null); }}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Subtabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/50 px-4">
              <button
                onClick={() => setEditorTab('edit')}
                className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-all ${
                  editorTab === 'edit' ? 'border-[#ff5a3c] text-[#ff5a3c]' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                1. Campaign Details
              </button>
              <button
                onClick={() => setEditorTab('form')}
                className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-all ${
                  editorTab === 'form' ? 'border-[#ff5a3c] text-[#ff5a3c]' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                2. Enquiry Form Fields
              </button>
              <button
                onClick={() => setEditorTab('actions')}
                className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-all ${
                  editorTab === 'actions' ? 'border-[#ff5a3c] text-[#ff5a3c]' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                3. Buttons & Submission
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* TAB 1: CAMPAIGN DETAILS */}
              {editorTab === 'edit' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-slate-450">Campaign Name / Title</label>
                      <input
                        type="text"
                        value={editingCampaign.title || ''}
                        onChange={(e) => setEditingCampaign(prev => prev ? { ...prev, title: e.target.value } : null)}
                        placeholder="e.g. Premium Legal Sourcing Desk"
                        className="w-full border border-slate-200 p-2.5 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-light"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-slate-450">Badge (Label)</label>
                      <input
                        type="text"
                        value={editingCampaign.badge || ''}
                        onChange={(e) => setEditingCampaign(prev => prev ? { ...prev, badge: e.target.value } : null)}
                        placeholder="e.g. FREE SERVICE"
                        className="w-full border border-slate-200 p-2.5 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-slate-450">Category</label>
                      <input
                        type="text"
                        value={editingCampaign.category || ''}
                        onChange={(e) => setEditingCampaign(prev => prev ? { ...prev, category: e.target.value } : null)}
                        placeholder="e.g. Campaigns, Services, Consultations"
                        className="w-full border border-slate-200 p-2.5 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-light"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-slate-450">Display Order</label>
                      <input
                        type="number"
                        value={editingCampaign.displayOrder || 1}
                        onChange={(e) => setEditingCampaign(prev => prev ? { ...prev, displayOrder: parseInt(e.target.value) || 1 } : null)}
                        className="w-full border border-slate-200 p-2.5 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-light"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-450">Short Summary</label>
                    <textarea
                      rows={2}
                      value={editingCampaign.shortDescription || ''}
                      onChange={(e) => setEditingCampaign(prev => prev ? { ...prev, shortDescription: e.target.value } : null)}
                      placeholder="Enter a brief, punchy subtitle for card view..."
                      className="w-full border border-slate-200 p-2.5 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-light resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-450">Full Campaign Description</label>
                    <textarea
                      rows={4}
                      value={editingCampaign.fullDescription || ''}
                      onChange={(e) => setEditingCampaign(prev => prev ? { ...prev, fullDescription: e.target.value } : null)}
                      placeholder="Detailed full offer context or services breakdown..."
                      className="w-full border border-slate-200 p-2.5 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-light"
                    />
                  </div>

                  {/* Cover Image URL / Drag-and-Drop */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-450">Featured Cover Image</label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Drag and Drop Zone */}
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                          dragActive ? 'border-[#ff5a3c] bg-[#ff5a3c]/5' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                        <p className="text-[11px] text-slate-600">Drag image here or click to select</p>
                        <p className="text-[9px] text-slate-400">Supported: PNG, JPG (base64 saved)</p>
                      </div>

                      {/* Manual Image URL field */}
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingCampaign.image || ''}
                          onChange={(e) => setEditingCampaign(prev => prev ? { ...prev, image: e.target.value } : null)}
                          placeholder="Paste illustrative cover Unsplash image URL..."
                          className="w-full border border-slate-200 p-2 rounded-lg text-[10px] font-mono text-slate-600 focus:outline-none"
                        />
                        {editingCampaign.image && (
                          <div className="h-16 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 relative">
                            <img 
                              src={editingCampaign.image} 
                              alt="Cover Preview" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                            <button
                              onClick={() => setEditingCampaign(prev => prev ? { ...prev, image: '' } : null)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status & Scheduling */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                    <h4 className="text-xs font-bold text-slate-850 uppercase tracking-wide">Status & Scheduling</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Service Status</label>
                        <select
                          value={editingCampaign.status || 'Draft'}
                          onChange={(e) => setEditingCampaign(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                          className="w-full border border-slate-200 p-2 rounded-lg text-xs bg-white text-slate-700"
                        >
                          <option value="Published">Published</option>
                          <option value="Draft">Draft</option>
                          <option value="Scheduled">Scheduled</option>
                          <option value="Expired">Expired</option>
                          <option value="Hidden">Hidden</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Publish Date</label>
                        <input
                          type="date"
                          value={editingCampaign.publishDate || ''}
                          onChange={(e) => setEditingCampaign(prev => prev ? { ...prev, publishDate: e.target.value } : null)}
                          className="w-full border border-slate-200 p-2 rounded-lg text-xs text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Expiry Date</label>
                        <input
                          type="date"
                          value={editingCampaign.expiryDate || ''}
                          onChange={(e) => setEditingCampaign(prev => prev ? { ...prev, expiryDate: e.target.value } : null)}
                          className="w-full border border-slate-200 p-2 rounded-lg text-xs text-slate-700"
                        />
                      </div>

                      <div className="flex items-center gap-4 pt-4">
                        <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingCampaign.autoPublish || false}
                            onChange={(e) => setEditingCampaign(prev => prev ? { ...prev, autoPublish: e.target.checked } : null)}
                            className="rounded border-slate-300 text-[#ff5a3c] focus:ring-[#ff5a3c]"
                          />
                          Auto Publish
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingCampaign.autoExpire || false}
                            onChange={(e) => setEditingCampaign(prev => prev ? { ...prev, autoExpire: e.target.checked } : null)}
                            className="rounded border-slate-300 text-[#ff5a3c] focus:ring-[#ff5a3c]"
                          />
                          Auto Expire
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ENQUIRY FORM FIELDS */}
              {editorTab === 'form' && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-start gap-2 text-xs text-amber-800 leading-relaxed font-light">
                    <AlertCircle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Configure which fields appear in the visitor's popup enquiry form when they engage with this campaign. You can mark essential fields as <strong>Required</strong>.
                    </span>
                  </div>

                  <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                        <tr>
                          <th className="p-3 pl-4">Form Field Name</th>
                          <th className="p-3 text-center">Enable Field</th>
                          <th className="p-3 text-center">Mark Required</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {Object.keys(editingCampaign.formFields || {}).map((key) => {
                          const fieldKey = key as keyof CampaignFormFieldsConfig;
                          const cfg = editingCampaign.formFields?.[fieldKey] || { enabled: false, required: false };

                          const labelMap: Record<string, string> = {
                            fullName: 'Full Name',
                            mobileNumber: 'Mobile Number',
                            emailAddress: 'Email Address',
                            city: 'Current City',
                            budget: 'Budget',
                            propertyType: 'Property Type',
                            preferredLocation: 'Preferred Location',
                            message: 'Additional Message',
                            uploadDocuments: 'Upload Documents (PDF, Doc)',
                            uploadImages: 'Upload Images (PNG, JPG)'
                          };

                          return (
                            <tr key={key} className="hover:bg-slate-50/50">
                              <td className="p-3 pl-4 font-semibold text-slate-800">{labelMap[key] || key}</td>
                              <td className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={cfg.enabled}
                                  onChange={(e) => {
                                    const nextFields = {
                                      ...editingCampaign.formFields,
                                      [fieldKey]: { ...cfg, enabled: e.target.checked }
                                    };
                                    setEditingCampaign(prev => prev ? { ...prev, formFields: nextFields as any } : null);
                                  }}
                                  className="rounded border-slate-300 text-[#ff5a3c] focus:ring-[#ff5a3c]"
                                />
                              </td>
                              <td className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  disabled={!cfg.enabled}
                                  checked={cfg.required && cfg.enabled}
                                  onChange={(e) => {
                                    const nextFields = {
                                      ...editingCampaign.formFields,
                                      [fieldKey]: { ...cfg, required: e.target.checked }
                                    };
                                    setEditingCampaign(prev => prev ? { ...prev, formFields: nextFields as any } : null);
                                  }}
                                  className="rounded border-slate-300 text-[#ff5a3c] focus:ring-[#ff5a3c] disabled:opacity-30"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: BUTTONS & SUBMISSION */}
              {editorTab === 'actions' && (
                <div className="space-y-5">
                  
                  {/* Button 1 Configuration */}
                  <div className="p-4 border border-slate-200/85 rounded-xl space-y-3.5 bg-slate-50/40">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                      <span className="w-4 h-4 bg-[#ff5a3c] text-white flex items-center justify-center text-[9px] rounded-full">1</span>
                      Primary Action Button Settings
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Button Text</label>
                        <input
                          type="text"
                          value={editingCampaign.button1?.text || ''}
                          onChange={(e) => {
                            const btn = { ...editingCampaign.button1, text: e.target.value } as CampaignButtonSettings;
                            setEditingCampaign(prev => prev ? { ...prev, button1: btn } : null);
                          }}
                          placeholder="e.g. Apply Now"
                          className="w-full border border-slate-200 p-2 rounded-lg text-xs text-slate-800 bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Button Icon Name</label>
                        <select
                          value={editingCampaign.button1?.icon || 'Phone'}
                          onChange={(e) => {
                            const btn = { ...editingCampaign.button1, icon: e.target.value } as CampaignButtonSettings;
                            setEditingCampaign(prev => prev ? { ...prev, button1: btn } : null);
                          }}
                          className="w-full border border-slate-200 p-2 rounded-lg text-xs bg-white text-slate-800"
                        >
                          <option value="Phone">Phone / Call</option>
                          <option value="MessageSquare">MessageSquare / WhatsApp</option>
                          <option value="Mail">Mail / Email</option>
                          <option value="FileText">FileText / Form</option>
                          <option value="Download">Download PDF</option>
                          <option value="Globe">Globe / Link</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Action Trigger</label>
                        <select
                          value={editingCampaign.button1?.action || 'Open Popup Form'}
                          onChange={(e) => {
                            const btn = { ...editingCampaign.button1, action: e.target.value as any } as CampaignButtonSettings;
                            setEditingCampaign(prev => prev ? { ...prev, button1: btn } : null);
                          }}
                          className="w-full border border-slate-200 p-2 rounded-lg text-xs bg-white text-slate-800 font-bold text-slate-900"
                        >
                          <option value="Open Popup Form">Open Popup Form</option>
                          <option value="Open Internal Page">Open Internal Page (e.g. #contact)</option>
                          <option value="Open External URL">Open External URL</option>
                          <option value="WhatsApp">Send WhatsApp Message</option>
                          <option value="Phone Call">Initiate Phone Call</option>
                          <option value="Email">Send Email</option>
                          <option value="Book Site Visit">Book Site Visit</option>
                          <option value="Property Search">Trigger Property Search</option>
                          <option value="Download PDF">Download PDF Flyer</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Action Value (Phone / URL / File URL)</label>
                        <input
                          type="text"
                          value={editingCampaign.button1?.value || ''}
                          onChange={(e) => {
                            const btn = { ...editingCampaign.button1, value: e.target.value } as CampaignButtonSettings;
                            setEditingCampaign(prev => prev ? { ...prev, button1: btn } : null);
                          }}
                          placeholder="e.g. +91 98765 43210 or https://..."
                          className="w-full border border-slate-200 p-2 rounded-lg text-xs text-slate-800 bg-white font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Button 2 Configuration */}
                  <div className="p-4 border border-slate-200/85 rounded-xl space-y-3.5 bg-slate-50/40">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                      <span className="w-4 h-4 bg-[#ff5a3c] text-white flex items-center justify-center text-[9px] rounded-full">2</span>
                      Secondary Action Button Settings
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Button Text</label>
                        <input
                          type="text"
                          value={editingCampaign.button2?.text || ''}
                          onChange={(e) => {
                            const btn = { ...editingCampaign.button2, text: e.target.value } as CampaignButtonSettings;
                            setEditingCampaign(prev => prev ? { ...prev, button2: btn } : null);
                          }}
                          placeholder="e.g. WhatsApp Sourcing Advisor"
                          className="w-full border border-slate-200 p-2 rounded-lg text-xs text-slate-800 bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Button Icon Name</label>
                        <select
                          value={editingCampaign.button2?.icon || 'MessageSquare'}
                          onChange={(e) => {
                            const btn = { ...editingCampaign.button2, icon: e.target.value } as CampaignButtonSettings;
                            setEditingCampaign(prev => prev ? { ...prev, button2: btn } : null);
                          }}
                          className="w-full border border-slate-200 p-2 rounded-lg text-xs bg-white text-slate-800"
                        >
                          <option value="MessageSquare">MessageSquare / WhatsApp</option>
                          <option value="Phone">Phone / Call</option>
                          <option value="Mail">Mail / Email</option>
                          <option value="FileText">FileText / Form</option>
                          <option value="Download">Download PDF</option>
                          <option value="Globe">Globe / Link</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Action Trigger</label>
                        <select
                          value={editingCampaign.button2?.action || 'WhatsApp'}
                          onChange={(e) => {
                            const btn = { ...editingCampaign.button2, action: e.target.value as any } as CampaignButtonSettings;
                            setEditingCampaign(prev => prev ? { ...prev, button2: btn } : null);
                          }}
                          className="w-full border border-slate-200 p-2 rounded-lg text-xs bg-white text-slate-800 font-bold text-slate-900"
                        >
                          <option value="Open Popup Form">Open Popup Form</option>
                          <option value="Open Internal Page">Open Internal Page (e.g. #contact)</option>
                          <option value="Open External URL">Open External URL</option>
                          <option value="WhatsApp">Send WhatsApp Message</option>
                          <option value="Phone Call">Initiate Phone Call</option>
                          <option value="Email">Send Email</option>
                          <option value="Book Site Visit">Book Site Visit</option>
                          <option value="Property Search">Trigger Property Search</option>
                          <option value="Download PDF">Download PDF Flyer</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Action Value</label>
                        <input
                          type="text"
                          value={editingCampaign.button2?.value || ''}
                          onChange={(e) => {
                            const btn = { ...editingCampaign.button2, value: e.target.value } as CampaignButtonSettings;
                            setEditingCampaign(prev => prev ? { ...prev, button2: btn } : null);
                          }}
                          placeholder="e.g. +91 98765 43210"
                          className="w-full border border-slate-200 p-2 rounded-lg text-xs text-slate-800 bg-white font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* After-Submission actions configuration */}
                  <div className="p-4 border border-slate-200 rounded-xl space-y-3.5 bg-slate-50/40">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                      <CheckSquare2 className="h-4 w-4 text-[#ff5a3c]" />
                      Post-Submission Action Routing
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Post Submit Trigger</label>
                        <select
                          value={editingCampaign.afterSubmission?.action || 'Thank You Popup'}
                          onChange={(e) => {
                            const act = {
                              action: e.target.value as any,
                              value: e.target.value === 'Thank You Popup' ? 'Thank you for submitting your request!' : ''
                            };
                            setEditingCampaign(prev => prev ? { ...prev, afterSubmission: act } : null);
                          }}
                          className="w-full border border-slate-200 p-2 rounded-lg text-xs bg-white text-slate-800"
                        >
                          <option value="Thank You Popup">Show Custom Thank You Popup</option>
                          <option value="Redirect to Page">Redirect to Custom URL / Internal Page</option>
                          <option value="Redirect to WhatsApp">Redirect to Advisor WhatsApp</option>
                          <option value="Redirect to Contact Page">Redirect to Office Contact Page</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Action Route Value (Popup Text or Link)</label>
                        <input
                          type="text"
                          value={editingCampaign.afterSubmission?.value || ''}
                          onChange={(e) => {
                            const act = { ...editingCampaign.afterSubmission, value: e.target.value } as any;
                            setEditingCampaign(prev => prev ? { ...prev, afterSubmission: act } : null);
                          }}
                          placeholder={
                            editingCampaign.afterSubmission?.action === 'Thank You Popup'
                              ? "e.g. Thanks for registering! We will contact you."
                              : "e.g. https://example.com/thankyou or WhatsApp number"
                          }
                          className="w-full border border-slate-200 p-2 rounded-lg text-xs text-slate-800 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-slate-150 flex justify-between items-center bg-slate-50 rounded-b-2xl">
              <span className="text-[10px] text-slate-400 italic">
                * Live synced directly with cloud and visual layout.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setIsEditorOpen(false); setEditingCampaign(null); }}
                  className="px-4 py-2 bg-white border border-slate-250 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditor}
                  className="px-4 py-2 bg-[#ff5a3c] text-white text-xs font-semibold rounded-lg hover:bg-[#e04326] transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
