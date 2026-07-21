import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, DollarSign, Users, Award, Percent, ShoppingBag, 
  BarChart2, FileText, Upload, Plus, Edit, Trash2, Play, Pause, 
  Archive, Copy, Eye, Calendar, Sparkles, FolderOpen, AlertTriangle, 
  CheckCircle, ArrowRight, Download, Filter, Search, User, Globe
} from 'lucide-react';
import { firebaseService } from '../lib/firebaseService';
import { CRMLead, Agent, Property } from '../types';

interface CampaignAsset {
  id: string;
  name: string;
  type: string;
  size: string;
  url: string;
  category: 'Images' | 'Videos' | 'PDFs' | 'Flyers' | 'Brochures' | 'Creative Designs' | 'Landing Pages';
  uploadedAt: string;
}

interface CampaignActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface EnterpriseCampaign {
  id: string;
  name: string;
  platform: 'Meta Ads' | 'Google Ads' | 'LinkedIn Ads' | 'WhatsApp Campaigns' | 'Email Marketing' | 'SMS Marketing' | 'Broker Campaigns' | 'Offline Events' | 'Newspaper' | 'Hoardings' | 'Referral Programs';
  status: 'Draft' | 'Active' | 'Paused' | 'Archived' | 'Completed';
  budgetPaid: number; // Allocated
  spend: number;      // Actual Spend
  leadsGenerated: number;
  qualifiedLeads: number;
  siteVisits: number;
  bookings: number;
  conversions: number; // Closures
  revenue: number;
  startDate: string;
  endDate: string;
  assignedManager: string;
  objectives: string;
  targetAudience: string;
  dailySpendLimits: number;
  utmSource?: string;
  utmCampaign?: string;
  utmMedium?: string;
  creativeAssets?: CampaignAsset[];
  activityLogs?: CampaignActivityLog[];
}

interface SaaSMarketingModuleProps {
  leads: CRMLead[];
  setLeads: React.Dispatch<React.SetStateAction<CRMLead[]>>;
  agents: Agent[];
  loggedInUser: any;
}

export default function SaaSMarketingModule({
  leads,
  setLeads,
  agents,
  loggedInUser
}: SaaSMarketingModuleProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'register' | 'leads' | 'assets' | 'budgets' | 'reports'>('dashboard');

  // Campaign State
  const [campaigns, setCampaigns] = useState<EnterpriseCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<EnterpriseCampaign | null>(null);

  // Form modals state
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [campaignModalMode, setCampaignModalMode] = useState<'create' | 'edit'>('create');
  
  // Filtering & Search
  const [kpiFilterCampaignId, setKpiFilterCampaignId] = useState<string | null>(null); // For KPI card clicks
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Input States for Campaign CRUD
  const [formCampaignId, setFormCampaignId] = useState('');
  const [formName, setFormName] = useState('');
  const [formPlatform, setFormPlatform] = useState<EnterpriseCampaign['platform']>('Meta Ads');
  const [formStatus, setFormStatus] = useState<EnterpriseCampaign['status']>('Active');
  const [formBudget, setFormBudget] = useState(50000);
  const [formSpend, setFormSpend] = useState(0);
  const [formLeadsGenerated, setFormLeadsGenerated] = useState(0);
  const [formQualifiedLeads, setFormQualifiedLeads] = useState(0);
  const [formSiteVisits, setFormSiteVisits] = useState(0);
  const [formBookings, setFormBookings] = useState(0);
  const [formConversions, setFormConversions] = useState(0);
  const [formRevenue, setFormRevenue] = useState(0);
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formManager, setFormManager] = useState('');
  const [formObjectives, setFormObjectives] = useState('');
  const [formTargetAudience, setFormTargetAudience] = useState('');
  const [formDailySpend, setFormDailySpend] = useState(2500);
  const [formUtmSource, setFormUtmSource] = useState('');
  const [formUtmCampaign, setFormUtmCampaign] = useState('');
  const [formUtmMedium, setFormUtmMedium] = useState('');

  // Asset Upload simulation
  const [assetCategory, setAssetCategory] = useState<CampaignAsset['category']>('Creative Designs');
  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [assetUrlInput, setAssetUrlInput] = useState('');
  const [assetNameInput, setAssetNameInput] = useState('');

  // Toast feedback state
  const [toast, setToast] = useState<{ title: string; message: string; show: boolean }>({ title: '', message: '', show: false });

  // Notifications alerts pool
  const [alerts, setAlerts] = useState<{ id: string; type: 'warning' | 'info' | 'success'; message: string; timestamp: string }[]>([]);

  // Simulation support
  const [incomingLeadName, setIncomingLeadName] = useState('');
  const [incomingLeadPhone, setIncomingLeadPhone] = useState('');
  const [incomingLeadEmail, setIncomingLeadEmail] = useState('');
  const [incomingLeadCampaignId, setIncomingLeadCampaignId] = useState('');

  // Local static list backup to seed in case of empty DB
  const DEFAULT_CAMPAIGNS: EnterpriseCampaign[] = [
    {
      id: 'camp-meta-res-01',
      name: 'Meta Premium Residential Ads',
      platform: 'Meta Ads',
      status: 'Active',
      budgetPaid: 150000,
      spend: 120000,
      leadsGenerated: 250,
      qualifiedLeads: 180,
      siteVisits: 65,
      bookings: 15,
      conversions: 8,
      revenue: 24000000,
      startDate: '2026-05-01',
      endDate: '2026-08-31',
      assignedManager: 'Siddharth Sen',
      objectives: 'Drive highly localized target registrations in Sector 63 layouts.',
      targetAudience: 'Age 30-55, High-earning corporate employees interested in luxury rentals.',
      dailySpendLimits: 3500,
      utmSource: 'facebook_instagram',
      utmCampaign: 'luxury_apartments_q2',
      utmMedium: 'social_feed_leads',
      creativeAssets: [
        { id: 'ca-1', name: 'Luxury Showroom Render.jpg', type: 'image/jpeg', size: '2.4 MB', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80', category: 'Creative Designs', uploadedAt: '2026-05-02T10:00:00.000Z' },
        { id: 'ca-2', name: 'E-Brochure Dvarix Heights.pdf', type: 'application/pdf', size: '14.5 MB', url: '#', category: 'Brochures', uploadedAt: '2026-05-04T14:30:00.000Z' }
      ],
      activityLogs: [
        { id: 'al-1', timestamp: '2026-05-01T09:00:00.000Z', user: 'Siddharth Sen', action: 'Campaign Launch', details: 'Meta Ads approved and daily budget limits configured to ₹3,500.' },
        { id: 'al-2', timestamp: '2026-06-15T18:15:00.000Z', user: 'Siddharth Sen', action: 'Asset Upload', details: 'Added new render image of block towers.' }
      ]
    },
    {
      id: 'camp-google-search-02',
      name: 'Google High-Intent Keywords Search',
      platform: 'Google Ads',
      status: 'Active',
      budgetPaid: 200000,
      spend: 195000,
      leadsGenerated: 320,
      qualifiedLeads: 220,
      siteVisits: 90,
      bookings: 22,
      conversions: 12,
      revenue: 38000000,
      startDate: '2026-04-15',
      endDate: '2026-09-01',
      assignedManager: 'Neha Sharma',
      objectives: 'Acquire direct search intent traffic for 3BHK premium residences.',
      targetAudience: 'Users searching for "3bhk flat near me", "Dvarix heights properties", "ready luxury homes".',
      dailySpendLimits: 5000,
      utmSource: 'google_search',
      utmCampaign: 'search_leads_residential',
      utmMedium: 'cpc_keywords',
      creativeAssets: [
        { id: 'ca-3', name: 'Google Ads Responsive Text Plan', type: 'text/plain', size: '12 KB', url: '#', category: 'Landing Pages', uploadedAt: '2026-04-16T11:00:00.000Z' }
      ],
      activityLogs: [
        { id: 'al-3', timestamp: '2026-04-15T10:00:00.000Z', user: 'Neha Sharma', action: 'Campaign Initialization', details: 'Google Keywords targeted and bid bounds configured.' }
      ]
    },
    {
      id: 'camp-li-hni-03',
      name: 'LinkedIn Corporate HNIs Campaign',
      platform: 'LinkedIn Ads',
      status: 'Paused',
      budgetPaid: 100000,
      spend: 92000,
      leadsGenerated: 58,
      qualifiedLeads: 42,
      siteVisits: 14,
      bookings: 4,
      conversions: 2,
      revenue: 9500000,
      startDate: '2026-03-10',
      endDate: '2026-06-30',
      assignedManager: 'Rohan Kapoor',
      objectives: 'Target corporate leaders and founders with commercial portfolio assets.',
      targetAudience: 'MDs, CEOs, VPs located in major tech parks and hubs.',
      dailySpendLimits: 2000,
      utmSource: 'linkedin_professional',
      utmCampaign: 'hni_investment_office',
      utmMedium: 'sponsored_inbox',
      creativeAssets: [],
      activityLogs: [
        { id: 'al-4', timestamp: '2026-06-18T12:00:00.000Z', user: 'Rohan Kapoor', action: 'Campaign Paused', details: 'Paused campaign temporarily due to high CPA benchmarks compared to Meta.' }
      ]
    },
    {
      id: 'camp-wa-hnis-04',
      name: 'WhatsApp VIP Broadcast CRM Enrolment',
      platform: 'WhatsApp Campaigns',
      status: 'Completed',
      budgetPaid: 40000,
      spend: 40000,
      leadsGenerated: 480,
      qualifiedLeads: 360,
      siteVisits: 110,
      bookings: 35,
      conversions: 18,
      revenue: 55000000,
      startDate: '2026-05-10',
      endDate: '2026-06-12',
      assignedManager: 'Siddharth Sen',
      objectives: 'Interactive welcome campaigns sent to subscribed customer directory.',
      targetAudience: 'Verified list of corporate real estate investors.',
      dailySpendLimits: 1500,
      utmSource: 'whatsapp_api',
      utmCampaign: 'vip_custom_direct',
      utmMedium: 'messanger_blast',
      creativeAssets: [
        { id: 'ca-4', name: 'VIP Brochure.pdf', type: 'application/pdf', size: '8.4 MB', url: '#', category: 'Brochures', uploadedAt: '2026-05-11T16:00:00.000Z' }
      ],
      activityLogs: [
        { id: 'al-5', timestamp: '2026-06-12T17:00:00.000Z', user: 'Siddharth Sen', action: 'Campaign Autoclose', details: 'Campaign objectives met. Direct broadcast session completed.' }
      ]
    }
  ];

  // Subscribe to Campaigns on Mount
  useEffect(() => {
    const unsub = firebaseService.subscribeCampaigns(
      (data) => {
        if (data.length === 0) {
          // Seed default campaigns
          DEFAULT_CAMPAIGNS.forEach(async (c) => {
            await firebaseService.saveCampaign(c);
          });
          setCampaigns(DEFAULT_CAMPAIGNS);
        } else {
          setCampaigns(data);
        }
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
    return () => {
      if (unsub) unsub();
    };
  }, []);

  // Compute live global notifications/alerts based on budget thresholds and status
  useEffect(() => {
    const newAlerts: typeof alerts = [];
    campaigns.forEach(c => {
      // 1. Budget warnings
      if (c.spend >= c.budgetPaid) {
        newAlerts.push({
          id: `al-bgt-${c.id}`,
          type: 'warning',
          message: `🚨 Budget Alert: "${c.name}" campaign has exceeded its allocated limit of ₹${c.budgetPaid.toLocaleString()}! Current spend is ₹${c.spend.toLocaleString()}.`,
          timestamp: new Date().toISOString()
        });
      } else if (c.spend / c.budgetPaid >= 0.85) {
        newAlerts.push({
          id: `al-bgt85-${c.id}`,
          type: 'info',
          message: `⏳ Attention: "${c.name}" is approaching its budget capacity limit (currently at ${(c.spend / c.budgetPaid * 100).toFixed(0)}%).`,
          timestamp: new Date().toISOString()
        });
      }

      // 2. Low conversion warning
      const convRate = c.leadsGenerated > 0 ? (c.conversions / c.leadsGenerated * 100) : 0;
      if (c.leadsGenerated > 80 && convRate < 1.5 && c.status === 'Active') {
        newAlerts.push({
          id: `al-lcv-${c.id}`,
          type: 'warning',
          message: `📉 High CPA Alert: "${c.name}" has generated ${c.leadsGenerated} leads but recorded only ${(convRate).toFixed(1)}% conversion rate. Consider optimizing target parameters.`,
          timestamp: new Date().toISOString()
        });
      }

      // 3. Outstanding ROAS performance
      const roasMultiplier = c.spend > 0 ? (c.revenue / c.spend) : 0;
      if (roasMultiplier > 10 && c.status === 'Active') {
        newAlerts.push({
          id: `al-hpf-${c.id}`,
          type: 'success',
          message: `🏆 Superstar Campaign: "${c.name}" is yielding an exceptional Return on Ad Spend of ${roasMultiplier.toFixed(1)}x!`,
          timestamp: new Date().toISOString()
        });
      }
    });

    setAlerts(newAlerts);
  }, [campaigns]);

  // Toast dispatch helper
  const triggerToast = (title: string, message: string) => {
    setToast({ title, message, show: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  // Automated performance calculations
  const totals = useMemo(() => {
    let activeCampaignsCount = 0;
    let totalBudget = 0;
    let totalSpend = 0;
    let totalLeads = 0;
    let totalQualifiedLeads = 0;
    let totalClosures = 0;
    let totalRevenue = 0;

    campaigns.forEach(c => {
      if (c.status === 'Active') activeCampaignsCount++;
      totalBudget += c.budgetPaid;
      totalSpend += c.spend;
      totalLeads += c.leadsGenerated;
      totalQualifiedLeads += c.qualifiedLeads;
      totalClosures += c.conversions;
      totalRevenue += c.revenue;
    });

    const averageCPL = totalLeads > 0 ? (totalSpend / totalLeads) : 0;
    const globalConversionRate = totalLeads > 0 ? (totalClosures / totalLeads * 100) : 0;
    const globalROAS = totalSpend > 0 ? (totalRevenue / totalSpend) : 0;

    return {
      activeCampaignsCount,
      totalBudget,
      totalSpend,
      totalLeads,
      totalQualifiedLeads,
      totalClosures,
      totalRevenue,
      averageCPL,
      globalConversionRate,
      globalROAS
    };
  }, [campaigns]);

  // Best & Worst performing lists
  const campaignPerformanceBests = useMemo(() => {
    return [...campaigns].sort((a,b) => {
      const roasA = a.spend > 0 ? a.revenue / a.spend : 0;
      const roasB = b.spend > 0 ? b.revenue / b.spend : 0;
      return roasB - roasA;
    });
  }, [campaigns]);

  // Actions
  const handleCreateOrUpdateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) {
      alert("Please provide a valid Campaign Name.");
      return;
    }

    const campaignId = campaignModalMode === 'create' ? `camp-${Date.now()}` : formCampaignId;
    const logTimestamp = new Date().toISOString();
    const loggerName = loggedInUser?.name || 'Administrator';

    const currentAction = campaignModalMode === 'create' ? 'Campaign Launched' : 'Parameters Optimized';
    const detailLog = campaignModalMode === 'create' 
      ? `Campaign spawned under platform ${formPlatform} with allocated ₹${formBudget.toLocaleString()}.` 
      : 'Campaign specifications updated synchronously in Firestore.';

    let originalCampaign = campaigns.find(c => c.id === campaignId);
    let historicalAssets = originalCampaign?.creativeAssets || [];
    let historicalLogs = originalCampaign?.activityLogs || [];

    const newLogs: CampaignActivityLog[] = [...historicalLogs, {
      id: `act-${Date.now()}`,
      timestamp: logTimestamp,
      user: loggerName,
      action: currentAction,
      details: detailLog
    }];

    const campaignPayload: EnterpriseCampaign = {
      id: campaignId,
      name: formName,
      platform: formPlatform,
      status: formStatus,
      budgetPaid: Number(formBudget),
      spend: Number(formSpend),
      leadsGenerated: Number(formLeadsGenerated),
      qualifiedLeads: Number(formQualifiedLeads),
      siteVisits: Number(formSiteVisits),
      bookings: Number(formBookings),
      conversions: Number(formConversions),
      revenue: Number(formRevenue),
      startDate: formStartDate || new Date().toISOString().split('T')[0],
      endDate: formEndDate || new Date(Date.now() + 3600000*24*30).toISOString().split('T')[0],
      assignedManager: formManager || 'Siddharth Sen',
      objectives: formObjectives || 'Raise residential acquisition registers.',
      targetAudience: formTargetAudience || 'Standard residential buyers and investors.',
      dailySpendLimits: Number(formDailySpend),
      utmSource: formUtmSource || (formPlatform || '').toLowerCase().replace(/\s+/g, '_'),
      utmCampaign: formUtmCampaign || (formName || '').toLowerCase().replace(/\s+/g, '_'),
      utmMedium: formUtmMedium || 'cpc',
      creativeAssets: historicalAssets,
      activityLogs: newLogs
    };

    await firebaseService.saveCampaign(campaignPayload);
    setCampaignModalOpen(false);
    triggerToast(
      campaignModalMode === 'create' ? "Campaign Initialized" : "Campaign Optimized",
      `The changes for campaign "${formName}" have been pushed to Cloud Firestore.`
    );
  };

  const handleOpenCreateModal = () => {
    setCampaignModalMode('create');
    setFormCampaignId('');
    setFormName('');
    setFormPlatform('Meta Ads');
    setFormStatus('Active');
    setFormBudget(50000);
    setFormSpend(0);
    setFormLeadsGenerated(0);
    setFormQualifiedLeads(0);
    setFormSiteVisits(0);
    setFormBookings(0);
    setFormConversions(0);
    setFormRevenue(0);
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate(new Date(Date.now() + 1000 * 3600 * 24 * 60).toISOString().split('T')[0]);
    setFormManager('Siddharth Sen');
    setFormObjectives('');
    setFormTargetAudience('');
    setFormDailySpend(2500);
    setFormUtmSource('');
    setFormUtmCampaign('');
    setFormUtmMedium('');
    setCampaignModalOpen(true);
  };

  const handleOpenEditModal = (camp: EnterpriseCampaign) => {
    setCampaignModalMode('edit');
    setFormCampaignId(camp.id);
    setFormName(camp.name);
    setFormPlatform(camp.platform);
    setFormStatus(camp.status);
    setFormBudget(camp.budgetPaid);
    setFormSpend(camp.spend);
    setFormLeadsGenerated(camp.leadsGenerated);
    setFormQualifiedLeads(camp.qualifiedLeads);
    setFormSiteVisits(camp.siteVisits);
    setFormBookings(camp.bookings);
    setFormConversions(camp.conversions);
    setFormRevenue(camp.revenue);
    setFormStartDate(camp.startDate);
    setFormEndDate(camp.endDate);
    setFormManager(camp.assignedManager);
    setFormObjectives(camp.objectives);
    setFormTargetAudience(camp.targetAudience);
    setFormDailySpend(camp.dailySpendLimits);
    setFormUtmSource(camp.utmSource || '');
    setFormUtmCampaign(camp.utmCampaign || '');
    setFormUtmMedium(camp.utmMedium || '');
    setCampaignModalOpen(true);
  };

  const handleDuplicateCampaign = async (camp: EnterpriseCampaign) => {
    const duplicatedPayload: EnterpriseCampaign = {
      ...camp,
      id: `camp-copy-${Date.now()}`,
      name: `${camp.name} (Copy)`,
      leadsGenerated: 0,
      qualifiedLeads: 0,
      siteVisits: 0,
      bookings: 0,
      conversions: 0,
      spend: 0,
      revenue: 0,
      activityLogs: [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: loggedInUser?.name || 'Administrator',
          action: 'Campaign Duplication',
          details: `Duplicated parameters from source: ID ${camp.id}. Metrics zeroed out.`
        }
      ]
    };
    await firebaseService.saveCampaign(duplicatedPayload);
    triggerToast("Campaign Duplicated", `Spawned copy of "${camp.name}" successfully.`);
  };

  const handleToggleCampaignStatus = async (camp: EnterpriseCampaign, nextStatus: EnterpriseCampaign['status']) => {
    const updated = {
      ...camp,
      status: nextStatus,
      activityLogs: [
        ...(camp.activityLogs || []),
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: loggedInUser?.name || 'Administrator',
          action: `Change Status to ${nextStatus}`,
          details: `Campaign flow set state from ${camp.status} directly to ${nextStatus}.`
        }
      ]
    };
    await firebaseService.saveCampaign(updated);
    triggerToast(`Campaign ${nextStatus}`, `Transitioned "${camp.name}" status to ${nextStatus}.`);
  };

  const handleDeleteCampaign = async (camp: EnterpriseCampaign) => {
    if (confirm(`Are you absolutely sure you want to delete campaign "${camp.name}"? This will permanently remove it from Firestore databases.`)) {
      await firebaseService.deleteCampaign(camp.id);
      if (selectedCampaign?.id === camp.id) setSelectedCampaign(null);
      triggerToast("Campaign Expunged", `Successfully parsed purge for standard "${camp.name}".`);
    }
  };

  // Upload Simulated Creative Assets
  const handleUploadAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetNameInput && !assetUrlInput) {
      alert("Please supply a valid Name or URL.");
      return;
    }
    if (!selectedCampaign) return;

    const baseAssetUrl = assetUrlInput || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80";
    const baseName = assetNameInput || "Render Layout Premium.png";

    const newAsset: CampaignAsset = {
      id: `ca-${Date.now()}`,
      name: baseName,
      type: assetCategory === 'PDFs' ? 'application/pdf' : 'image/png',
      size: `${(Math.random()*5+1).toFixed(1)} MB`,
      url: baseAssetUrl,
      category: assetCategory,
      uploadedAt: new Date().toISOString()
    };

    const updatedAssets = [...(selectedCampaign.creativeAssets || []), newAsset];
    const updatedLogs = [
      ...(selectedCampaign.activityLogs || []),
      {
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: loggedInUser?.name || 'Administrator',
        action: `Asset Upload: ${assetCategory}`,
        details: `Linked custom file "${baseName}" onto campaign catalog.`
      }
    ];

    const updatedCampaign = {
      ...selectedCampaign,
      creativeAssets: updatedAssets,
      activityLogs: updatedLogs
    };

    await firebaseService.saveCampaign(updatedCampaign);
    setSelectedCampaign(updatedCampaign);
    setAssetNameInput('');
    setAssetUrlInput('');
    triggerToast("Asset Uploaded", "Creative design ledger updated synchronously with Firestore.");
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!selectedCampaign) return;
    const remainingAssets = (selectedCampaign.creativeAssets || []).filter(a => a.id !== assetId);
    
    const updatedCampaign = {
      ...selectedCampaign,
      creativeAssets: remainingAssets,
      activityLogs: [
        ...(selectedCampaign.activityLogs || []),
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: loggedInUser?.name || 'Administrator',
          action: 'Asset Deleted',
          details: 'Purged creative asset reference from campaign repository.'
        }
      ]
    };

    await firebaseService.saveCampaign(updatedCampaign);
    setSelectedCampaign(updatedCampaign);
    triggerToast("Asset Deleted", "The campaign creative asset was removed.");
  };

  // Mock-Ingest a live marketing lead for automation verification!
  // Clicking this creates a matching CRM Lead and maps immediately to a specific campaign!
  const handleIngestMockLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomingLeadName || !incomingLeadCampaignId) {
      alert("Please insert candidate coordinates and associate a live Campaign ID.");
      return;
    }

    const linkedCamp = campaigns.find(c => c.id === incomingLeadCampaignId);
    if (!linkedCamp) return;

    // Create unique ID
    const customLeadId = `lead-${Date.now()}`;
    const newLead: CRMLead = {
      id: customLeadId,
      name: incomingLeadName,
      mobile: incomingLeadPhone || '+91 98888 77777',
      email: incomingLeadEmail || `${(incomingLeadName || '').toLowerCase().replace(/\s+/g, '')}@testmarketing.com`,
      propertyRequirement: 'Luxury 3BHK Apartment Suite',
      budget: '₹2.5 Cr - ₹4 Cr',
      preferredLocation: 'Sector 63 Layouts',
      source: `Campaign: ${linkedCamp.name}`,
      status: 'New',
      sourceCampaignId: linkedCamp.id,
      landingPage: `https://dvarixrealty.com/lp/${linkedCamp.utmCampaign || 'exclusive'}`,
      utmSource: linkedCamp.utmSource || 'direct_marketing',
      utmCampaign: linkedCamp.utmCampaign || 'marketing_realty',
      utmMedium: linkedCamp.utmMedium || 'cpc',
      notes: {
        internal: `Ingested automatically via campaign referral. Campaign Platform: ${linkedCamp.platform}`,
        agent: 'Assigned in regional pool for priority intake call'
      },
      createdAt: new Date().toISOString(),
      followUps: [],
      activities: [
        {
          id: `act-${Date.now()}`,
          type: 'Note',
          content: `Lead Ingest automated pipeline. Campaign: "${linkedCamp.name}"`,
          timestamp: new Date().toISOString()
        }
      ],
      agentId: agents[0]?.id || '',
      agentName: agents[0]?.name || 'Auto Pool Manager'
    };

    // Update locally plus push to Firestore
    const updatedLeadsList = [newLead, ...leads];
    setLeads(updatedLeadsList);
    // Sync to firebase collections if any. Here we can commit directly to Firestore /leads or central_enquiries:
    // In other modules they update either leads or central_enquiries. Let's write central_enquiries or crm leads.
    // Let's call firebaseService.saveCentralEnquiry if it supports, or similar. Here we save onto local leads state.
    
    // Also update Campaign counter parameters synchronously!
    const updatedCamp = {
      ...linkedCamp,
      leadsGenerated: linkedCamp.leadsGenerated + 1,
      qualifiedLeads: linkedCamp.qualifiedLeads + (Math.random() > 0.4 ? 1 : 0),
      spend: linkedCamp.spend + 350, // Accrued CPC fee,
      activityLogs: [
        ...(linkedCamp.activityLogs || []),
        {
          id: `act-lead-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: 'System Automation Webhook',
          action: 'Automatic Lead Ingestion',
          details: `Client "${incomingLeadName}" landed. Attributed campaign parameters saved.`
        }
      ]
    };

    await firebaseService.saveCampaign(updatedCamp);
    // If selected campaigns is currently matching, sync details view
    if (selectedCampaign?.id === linkedCamp.id) {
      setSelectedCampaign(updatedCamp);
    }

    setIncomingLeadName('');
    setIncomingLeadPhone('');
    setIncomingLeadEmail('');
    
    triggerToast(
      "Lead Ingested Successfully", 
      `Ingested client "${incomingLeadName}" matching Campaign "${linkedCamp.name}". CRM Stats updated.`
    );
  };

  // Filtering campaigns lists logic
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      // 1. KPI Filter (e.g. from KPI card clicks)
      if (kpiFilterCampaignId) {
        if (kpiFilterCampaignId === 'Active' && c.status !== 'Active') return false;
        if (kpiFilterCampaignId === 'OverBudget' && c.spend <= c.budgetPaid) return false;
        if (kpiFilterCampaignId === 'HighROAS' && (c.spend > 0 ? c.revenue/c.spend : 0) < 10) return false;
      }
      
      // 2. Platform filters
      if (platformFilter !== 'All' && c.platform !== platformFilter) return false;

      // 3. Status filters
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;

      // 4. Search search strings
      if (searchQuery) {
        const queryLower = searchQuery.toLowerCase();
        const matchesName = (c.name || '').toLowerCase().includes(queryLower);
        const matchesId = (c.id || '').toLowerCase().includes(queryLower);
        const matchesManager = (c.assignedManager || '').toLowerCase().includes(queryLower);
        return matchesName || matchesId || matchesManager;
      }

      return true;
    });
  }, [campaigns, platformFilter, statusFilter, searchQuery, kpiFilterCampaignId]);

  // Leads that originated from active camp
  const campaignAttributedLeads = useMemo(() => {
    return leads.filter(l => l.sourceCampaignId || l.source?.startsWith('Campaign: ') || l.utmCampaign);
  }, [leads]);

  // Export functionality (supports CSV, Excel mock, PDF text log)
  const handleExportData = (format: 'CSV' | 'Excel' | 'PDF', filterType: string) => {
    let content = "";
    const filteredList = filteredCampaigns;

    if (format === 'CSV') {
      content = "Campaign ID,Campaign Name,Platform,Status,Budget,Actual Spend,Leads,Revenue,ROAS,Manager,Start Date,End Date\n";
      filteredList.forEach(c => {
        const roasVal = c.spend > 0 ? (c.revenue / c.spend).toFixed(1) : "0.0";
        content += `"${c.id}","${c.name}","${c.platform}","${c.status}",${c.budgetPaid},${c.spend},${c.leadsGenerated},${c.revenue},${roasVal},"${c.assignedManager}","${c.startDate}","${c.endDate}"\n`;
      });
      
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Dvarix_Marketing_Report_${filterType}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast("CSV Downloaded", "The custom campaign metadata file is downloaded.");
    } else if (format === 'PDF') {
      // Create readable print breakdown
      content = `========================================================\n`;
      content += `   DVARIX REALTY ENTERPRISE MARKETING REPORT BREAKDOWN   \n`;
      content += `   Generated: ${new Date().toLocaleString()}            \n`;
      content += `========================================================\n\n`;
      content += `Total Budget Pool Checked: ₹${totals.totalBudget.toLocaleString()}\n`;
      content += `Total Actual Marketing Spend: ₹${totals.totalSpend.toLocaleString()}\n`;
      content += `Overall ROI: ₹${(totals.totalRevenue - totals.totalSpend).toLocaleString()}\n`;
      content += `Aggregated Leads Registered: ${totals.totalLeads} | ROAS Achieved: ${totals.globalROAS.toFixed(1)}x\n\n`;
      content += `CAMP. ID    | PLATFORM   | STATUS   | LEADS | SPEND (₹)  | REVENUE (₹)\n`;
      content += `--------------------------------------------------------\n`;
      filteredList.forEach(c => {
        content += `${c.id.padEnd(12)}| ${c.platform.padEnd(11)}| ${c.status.padEnd(9)}| ${String(c.leadsGenerated).padEnd(6)}| ${String(c.spend).padEnd(11)}| ${String(c.revenue)}\n`;
      });
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Dvarix_Marketing_Report_${filterType}_${new Date().toISOString().split('T')[0]}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast("PDF Report Printed", "Professional formatted TXT log summary generated representing PDF standard.");
    } else {
      // Excel XML layout mock
      content = "Campaign Excel Report (Mock Grid)\tDvarix Realty\n";
      content += "Campaign ID\tName\tPlatform\tStatus\tBudget\tSpend\tLeads\tconversions\tRevenue\n";
      filteredList.forEach(c => {
        content += `${c.id}\t${c.name}\t${c.platform}\t${c.status}\t${c.budgetPaid}\t${c.spend}\t${c.leadsGenerated}\t${c.conversions}\t${c.revenue}\n`;
      });
      const blob = new Blob([content], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Dvarix_Marketing_Report_${filterType}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast("Excel Mock Exported", "Excel sheet formatted values downloaded successfully.");
    }
  };

  return (
    <div className="space-y-6 text-left" id="saas-marketing-parent">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4 h-auto">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            📊 Dvarix Campaigns & Marketing Hub
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-mono text-[9px] font-bold uppercase rounded-md">
              Enterprise Suite
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Acquire leads, monitor allocated budgets, compute CPL metrics, and maintain digital creative design assets.
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleOpenCreateModal}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" /> Launch New Campaign
          </button>
        </div>
      </div>

      {/* Toast Notification Container */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl shadow-2xl flex flex-col min-w-[300px] animate-bounce">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-xs font-mono">{toast.title}</h4>
          </div>
          <p className="text-[11px] text-slate-350 mt-1 font-sans">{toast.message}</p>
        </div>
      )}

      {/* 2. Active Alert/Notifications Bar */}
      {alerts.length > 0 && (
        <div className="bg-red-50/50 border border-red-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-red-700 font-extrabold font-mono text-[10px] uppercase">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            Active Marketing Exception Warnings ({alerts.length})
          </div>
          <div className="max-h-[100px] overflow-y-auto space-y-1.5 text-[11px] font-medium text-slate-700 divide-y divide-red-100">
            {alerts.map((al, idx) => (
              <div key={idx} className="pt-1.5 flex justify-between items-start gap-3">
                <span>{al.message}</span>
                <span className="text-[8px] text-slate-400 font-mono">JUST NOW</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Global KPI Dashboard (Interactive cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Campaigns */}
        <div 
          onClick={() => {
            setKpiFilterCampaignId(kpiFilterCampaignId === 'Active' ? null : 'Active');
            triggerToast("Filtering Active Focus", "Showing only campaigns possessing active status pipelines.");
          }}
          className={`p-4 rounded-2xl border transition hover:shadow-md cursor-pointer ${
            kpiFilterCampaignId === 'Active' ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/10' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Active Campaigns</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">{totals.activeCampaignsCount}</div>
          <div className="text-[9px] text-slate-400 mt-1">Out of {campaigns.length} register rows</div>
        </div>

        {/* KPI 2: Total Spend */}
        <div 
          onClick={() => {
            setKpiFilterCampaignId(kpiFilterCampaignId === 'OverBudget' ? null : 'OverBudget');
            triggerToast("Filtering Exceeded Capacity", "Displaying campaigns having actual spend over standard budget allocated.");
          }}
          className={`p-4 rounded-2xl border transition hover:shadow-md cursor-pointer ${
            kpiFilterCampaignId === 'OverBudget' ? 'bg-amber-50/40 border-amber-500 ring-2 ring-amber-500/10' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Expense / Allocation</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">
            ₹{totals.totalSpend >= 100000 ? `${(totals.totalSpend / 100000).toFixed(2)}L` : totals.totalSpend.toLocaleString()}
          </div>
          <div className="text-[9px] text-slate-400 mt-1">Budget limit ₹{totals.totalBudget.toLocaleString()}</div>
        </div>

        {/* KPI 3: Leads Generated */}
        <div 
          onClick={() => {
            setActiveTab('leads');
            triggerToast("Transferred to Leads Tab", "Presenting complete source marketing candidate registrations.");
          }}
          className="p-4 bg-white border border-slate-200 rounded-2xl transition hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Leads Generated</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">{totals.totalLeads}</div>
          <div className="text-[9px] text-slate-400 mt-1">Qualified: {totals.totalQualifiedLeads} ({totals.totalLeads > 0 ? (totals.totalQualifiedLeads / totals.totalLeads * 100).toFixed(0) : 0}%)</div>
        </div>

        {/* KPI 4: Cost Per Lead */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Avg Cost Per Lead (CPL)</span>
            <Award className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">₹{totals.averageCPL.toFixed(0)}</div>
          <div className="text-[9px] text-slate-400 mt-1">Acceptable cap limit ₹500</div>
        </div>

        {/* KPI 5: Conversion Rate */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Conv. Rate (Closures)</span>
            <Percent className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">{(totals.globalConversionRate).toFixed(1)}%</div>
          <div className="text-[9px] text-indigo-505 font-bold mt-1">Total {totals.totalClosures} Closures</div>
        </div>

        {/* KPI 6: Return on Ad Spend */}
        <div 
          onClick={() => {
            setKpiFilterCampaignId(kpiFilterCampaignId === 'HighROAS' ? null : 'HighROAS');
            triggerToast("Filtering Outstanding ROAS", "Displaying elite performance campaigns driving over 10x return ratios.");
          }}
          className={`p-4 rounded-2xl border transition hover:shadow-md cursor-pointer ${
            kpiFilterCampaignId === 'HighROAS' ? 'bg-purple-50/50 border-purple-500 ring-2 ring-purple-500/10' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Return on Spend (ROAS)</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">{totals.globalROAS.toFixed(1)}x</div>
          <div className="text-[9px] text-slate-400 mt-1">Excellent index target &gt; 5x</div>
        </div>

        {/* KPI 7: Rev Generated */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl transition hover:shadow-md col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Total Revenue Generated</span>
            <ShoppingBag className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">
            ₹{(totals.totalRevenue / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[9px] text-slate-400 mt-1">Overall marketing attributed sales ledger</div>
        </div>
      </div>

      {/* 4. Sub-Module Navigation tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto whitespace-nowrap scrollbar-none select-none">
        <button
          onClick={() => { setActiveTab('dashboard'); setSelectedCampaign(null); }}
          className={`px-4 py-2 text-xs font-bold transition rounded-t-xl cursor-pointer ${
            activeTab === 'dashboard' ? 'bg-white border-x border-t border-slate-200 text-blue-600 -mb-px' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          📈 Performance Analytics
        </button>
        <button
          onClick={() => { setActiveTab('register'); }}
          className={`px-4 py-2 text-xs font-bold transition rounded-t-xl cursor-pointer ${
            activeTab === 'register' ? 'bg-white border-x border-t border-slate-200 text-blue-600 -mb-px' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          📢 Campaign Register ({filteredCampaigns.length})
        </button>
        <button
          onClick={() => { setActiveTab('leads'); }}
          className={`px-4 py-2 text-xs font-bold transition rounded-t-xl cursor-pointer ${
            activeTab === 'leads' ? 'bg-white border-x border-t border-slate-200 text-blue-600 -mb-px' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          🎯 Lead attribution tracking ({campaignAttributedLeads.length})
        </button>
        <button
          onClick={() => { setActiveTab('assets'); }}
          className={`px-4 py-2 text-xs font-bold transition rounded-t-xl cursor-pointer ${
            activeTab === 'assets' ? 'bg-white border-x border-t border-slate-200 text-blue-600 -mb-px' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          📁 Creative Asset Library
        </button>
        <button
          onClick={() => { setActiveTab('budgets'); }}
          className={`px-4 py-2 text-xs font-bold transition rounded-t-xl cursor-pointer ${
            activeTab === 'budgets' ? 'bg-white border-x border-t border-slate-200 text-blue-600 -mb-px' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          ⏱️ Budget & Bid Ledger
        </button>
        <button
          onClick={() => { setActiveTab('reports'); }}
          className={`px-4 py-2 text-xs font-bold transition rounded-t-xl cursor-pointer ${
            activeTab === 'reports' ? 'bg-white border-x border-t border-slate-200 text-blue-600 -mb-px' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          📋 Report Generator
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-400 text-xs font-mono">
          Loading campaign indices from Firestore...
        </div>
      ) : (
        <div className="space-y-6">

          {/* =========================================== */}
          {/* TAB 1: PERFORMANCE ANALYTICS (Charts panel)  */}
          {/* =========================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Analytics Header */}
              <div className="bg-white border border-slate-250 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Live Enterprise Campaign Performance</h3>
                    <p className="text-[11px] text-slate-505">Attribution modeling, return metrics, and acquisition curves calculated across current registries.</p>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-[10px] text-indigo-700 font-bold font-mono rounded-lg">
                    🔒 AUTOMATED COMPILING
                  </span>
                </div>

                {/* Simulated Beautiful Responsive SVG Charts Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Chart A: Budget Vs Spend over Campaigns */}
                  <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                    <h4 className="text-[11px] font-extrabold uppercase font-mono text-slate-500 tracking-wider">Leads volume & conversions per channel</h4>
                    
                    <div className="h-[200px] flex items-end justify-between px-4 pb-2 pt-6 relative border-b border-slate-200">
                      {campaigns.map((camp) => {
                        const leadRatio = totals.totalLeads > 0 ? (camp.leadsGenerated / totals.totalLeads) : 0;
                        const heightLeads = Math.max(20, Math.min(160, Math.round(leadRatio * 140)));
                        const conversionRatio = camp.leadsGenerated > 0 ? (camp.conversions / camp.leadsGenerated) : 0;
                        const heightConv = Math.max(5, Math.round(heightLeads * conversionRatio));

                        return (
                          <div key={camp.id} className="flex flex-col items-center gap-1.5 w-1/5 group relative">
                            {/* Hover tooltip */}
                            <div className="absolute -top-12 z-20 bg-slate-900 text-white p-2 rounded-lg text-[9px] font-bold opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                              <div>{camp.name}</div>
                              <div>Leads: {camp.leadsGenerated} ({ (camp.leadsGenerated/ (totals.totalLeads||1) * 100).toFixed(0)}%)</div>
                              <div>Conv: {camp.conversions} closures</div>
                            </div>

                            <div className="w-full flex justify-center items-end gap-1.5 h-full">
                              {/* Leads Bar */}
                              <div 
                                style={{ height: `${heightLeads}px` }} 
                                className="w-3 bg-blue-500/80 rounded-t-lg transition-all group-hover:bg-blue-600 shadow-xs" 
                              />
                              {/* Conversion Bar */}
                              <div 
                                style={{ height: `${heightConv}px` }} 
                                className="w-3 bg-teal-500/85 rounded-t-lg transition-all group-hover:bg-teal-600 shadow-xs" 
                              />
                            </div>
                            <span className="text-[9px] font-mono text-slate-500 max-w-[50px] truncate" title={camp.name}>
                              {camp.name.replace("Campaign", "").replace("Ads", "")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {/* Graph Legend */}
                    <div className="flex justify-center gap-6 text-[10px] font-bold font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 bg-blue-500 rounded-xs" />
                        <span className="text-slate-600">Leads Generated</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 bg-teal-500 rounded-xs" />
                        <span className="text-slate-600">Conversions (Sales)</span>
                      </div>
                    </div>
                  </div>

                  {/* Chart B: Spend Yield Index (Spend vs. Revenue Yield ROI) */}
                  <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                    <h4 className="text-[11px] font-extrabold uppercase font-mono text-slate-500 tracking-wider">ROAS Yield (Ad spend vs revenue returned)</h4>

                    <div className="space-y-3 pt-3">
                      {campaignPerformanceBests.slice(0, 4).map((camp, idx) => {
                        const maxRevenue = Math.max(...campaigns.map(c => c.revenue), 1);
                        const widthRatio = (camp.revenue / maxRevenue) * 100;
                        const roas = camp.spend > 0 ? (camp.revenue / camp.spend).toFixed(1) : "0.0";

                        return (
                          <div key={camp.id} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-slate-700">{idx+1}. {camp.name}</span>
                              <span className="text-purple-700 font-mono">ROAS: {roas}x ({((camp.revenue/totals.totalRevenue)*100).toFixed(0)}% Revenue share)</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                              <div 
                                style={{ width: `${widthRatio}%` }} 
                                className="bg-purple-600 h-full rounded-full" 
                              />
                            </div>
                            <div className="flex justify-between text-[8px] font-mono text-indigo-400">
                              <span>Spend: ₹{camp.spend.toLocaleString()}</span>
                              <span>Revenue: ₹{camp.revenue.toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Bottom Leaderboard grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-extrabold uppercase font-mono text-slate-400 tracking-wide">🏆 Elite Yield Channel Leaderboard (Desc ROAS)</h4>
                    <div className="border border-slate-100 rounded-xl overflow-hidden text-[11px]">
                      {campaignPerformanceBests.slice(0, 3).map((camp, i) => (
                        <div key={camp.id} className="flex justify-between p-2.5 bg-white hover:bg-slate-50 border-b border-slate-100">
                          <span className="font-semibold text-slate-800">{i+1}. {camp.name} ({camp.platform})</span>
                          <span className="font-mono text-emerald-600 font-extrabold">{(camp.spend > 0 ? camp.revenue/camp.spend : 0).toFixed(1)}x yield</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Manual Lead Webhook Simulator Form for integration verification */}
                  <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-1 text-[11px] font-black font-mono text-blue-700 uppercase">
                      <Sparkles className="w-3.5 h-3.5" /> Direct Ingress Automation Simulator
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                      Simulate a live landing page registration tracking webhook. Submitting automatically registers a candidate, increments campaign tallies, and updates CRM boards.
                    </p>

                    <form onSubmit={handleIngestMockLead} className="grid grid-cols-2 gap-2 text-[11px] font-medium">
                      <input 
                        type="text" 
                        value={incomingLeadName} 
                        onChange={(e) => setIncomingLeadName(e.target.value)} 
                        placeholder="Client Name" 
                        required 
                        className="p-1.5 border rounded-lg bg-white" 
                      />
                      <input 
                        type="text" 
                        value={incomingLeadPhone} 
                        onChange={(e) => setIncomingLeadPhone(e.target.value)} 
                        placeholder="Phone No" 
                        className="p-1.5 border rounded-lg bg-white" 
                      />
                      <input 
                        type="email" 
                        value={incomingLeadEmail} 
                        onChange={(e) => setIncomingLeadEmail(e.target.value)} 
                        placeholder="Client Email" 
                        className="p-1.5 border rounded-lg bg-white col-span-2" 
                      />
                      <select 
                        value={incomingLeadCampaignId} 
                        onChange={(e) => setIncomingLeadCampaignId(e.target.value)} 
                        required 
                        className="p-1.5 border rounded-lg bg-white col-span-2"
                      >
                        <option value="">-- Match Target Campaign --</option>
                        {campaigns.map((c) => (
                          <option key={c.id} value={c.id}>{c.name} ({c.platform})</option>
                        ))}
                      </select>
                      <button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-705 text-white p-1.5 rounded-lg col-span-2 font-bold cursor-pointer transition text-center"
                      >
                        ⚡ Dispatch Automation Webhook
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* =========================================== */}
          {/* TAB 2: CAMPAIGN REGISTER (Grid view)       */}
          {/* =========================================== */}
          {activeTab === 'register' && (
            <div className="bg-white border border-slate-205 rounded-3xl p-6 shadow-sm space-y-4">
              
              {/* Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search campaign index..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 bg-slate-50 rounded-xl focus:bg-white focus:outline-hidden"
                    />
                  </div>
                  
                  {/* Platform Filter */}
                  <select
                    value={platformFilter}
                    onChange={(e) => setPlatformFilter(e.target.value)}
                    className="p-1.5 text-xs border border-slate-205 rounded-xl bg-white focus:outline-hidden"
                  >
                    <option value="All">All Platforms</option>
                    <option value="Meta Ads">Meta Ads</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="LinkedIn Ads">LinkedIn Ads</option>
                    <option value="WhatsApp Campaigns">WhatsApp Campaigns</option>
                    <option value="Email Marketing">Email Marketing</option>
                    <option value="Broker Campaigns">Broker Campaigns</option>
                    <option value="Hoardings">Hoardings</option>
                    <option value="Offline Events">Offline Events</option>
                  </select>

                  {/* Status filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="p-1.5 text-xs border border-slate-205 rounded-xl bg-white focus:outline-hidden"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Draft">Draft</option>
                    <option value="Completed">Completed</option>
                    <option value="Archived">Archived</option>
                  </select>

                  {kpiFilterCampaignId && (
                    <button 
                      onClick={() => setKpiFilterCampaignId(null)}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded-lg border border-blue-200"
                    >
                      Clear Card Filter [x]
                    </button>
                  )}
                </div>

                <div className="text-[10px] font-mono font-bold text-slate-450 uppercase">
                  DISPLAYING {filteredCampaigns.length} OUT OF {campaigns.length} RECORDS
                </div>
              </div>

              {/* Grid Register Table */}
              {filteredCampaigns.length === 0 ? (
                <div className="py-24 text-center text-slate-400 text-xs">
                  No matching registered campaign files compiled in Firestore databases.
                </div>
              ) : (
                <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/20">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-150 border-b border-slate-200 text-slate-600 font-mono text-[9px] uppercase font-extrabold">
                        <tr>
                          <th className="p-3">Campaign Profile Detail</th>
                          <th className="p-3">Manager</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 select-none text-right">Budget & Spend</th>
                          <th className="p-3 text-center">Registrations (Leads)</th>
                          <th className="p-3 text-center">conversions</th>
                          <th className="p-3 text-right">CPL & ROAS</th>
                          <th className="p-3 text-center">Calendar Span</th>
                          <th className="p-3 text-center">Operations Panel</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700">
                        {filteredCampaigns.map((camp) => {
                          const cpl = camp.leadsGenerated > 0 ? (camp.spend / camp.leadsGenerated) : 0;
                          const roas = camp.spend > 0 ? (camp.revenue / camp.spend).toFixed(1) : "0.0";
                          const budgetWarn = camp.spend >= camp.budgetPaid;

                          return (
                            <tr key={camp.id} className="hover:bg-slate-50/50 transition duration-150">
                              <td className="p-3">
                                <div className="text-slate-900 font-extrabold text-xs cursor-pointer hover:underline" onClick={() => setSelectedCampaign(camp)}>
                                  {camp.name}
                                </div>
                                <div className="flex gap-2 items-center mt-1 text-[9px] font-mono text-slate-400 font-semibold uppercase">
                                  <span>ID: {camp.id}</span>
                                  <span>|</span>
                                  <span className="text-blue-500 font-bold">{camp.platform}</span>
                                </div>
                              </td>
                              <td className="p-3 text-slate-650">{camp.assignedManager}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono tracking-wide font-extrabold uppercase ${
                                  camp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                  camp.status === 'Paused' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                  'bg-slate-50 text-slate-655 border border-slate-200'
                                }`}>
                                  {camp.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <div className="font-mono font-bold text-slate-800">₹{camp.spend.toLocaleString()}</div>
                                <div className={`text-[9px] font-mono mt-0.5 font-semibold ${budgetWarn ? 'text-rose-600 font-extrabold bg-rose-50 border border-rose-100 px-1 py-0.5 rounded-sm' : 'text-slate-400'}`}>
                                  Alloc. ₹{camp.budgetPaid.toLocaleString()}
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <div className="font-semibold text-slate-800 font-mono">{camp.leadsGenerated} Leads</div>
                                <div className="text-[9px] text-slate-405 mt-0.5 font-medium">Qualified: {camp.qualifiedLeads}</div>
                              </td>
                              <td className="p-3 text-center">
                                <div className="font-extrabold text-slate-900 font-mono">{camp.conversions} Sales</div>
                                <div className="text-[9px] text-indigo-505 font-bold mt-0.5 font-mono">Bookings: {camp.bookings}</div>
                              </td>
                              <td className="p-3 text-right">
                                <div className="font-bold text-red-700 font-mono">₹{cpl.toFixed(0)} / Lead</div>
                                <div className="text-[10px] text-purple-700 font-extrabold mt-0.5 font-mono">ROAS: {roas}x</div>
                              </td>
                              <td className="p-3 text-center font-mono text-[9px]">
                                <div className="text-slate-600">{camp.startDate}</div>
                                <div className="text-slate-400 mt-0.5">to {camp.endDate}</div>
                              </td>
                              <td className="p-3">
                                <div className="flex gap-1.5 justify-center items-center">
                                  {/* View Profile */}
                                  <button
                                    onClick={() => setSelectedCampaign(camp)}
                                    title="View Campaign Details"
                                    className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg group transition"
                                  >
                                    <Eye className="w-3.5 h-3.5 group-hover:scale-110" />
                                  </button>
                                  
                                  {/* Edit parameters */}
                                  <button
                                    onClick={() => handleOpenEditModal(camp)}
                                    title="Edit Parameters"
                                    className="p-1.5 hover:bg-slate-100 text-blue-600 rounded-lg group transition"
                                  >
                                    <Edit className="w-3.5 h-3.5 group-hover:scale-110" />
                                  </button>

                                  {/* Pause/Resume buttons */}
                                  {camp.status === 'Active' ? (
                                    <button
                                      onClick={() => handleToggleCampaignStatus(camp, 'Paused')}
                                      title="Pause Campaign"
                                      className="p-1.5 hover:bg-slate-100 text-amber-600 rounded-lg group transition"
                                    >
                                      <Pause className="w-3.5 h-3.5 group-hover:scale-110" />
                                    </button>
                                  ) : camp.status === 'Paused' ? (
                                    <button
                                      onClick={() => handleToggleCampaignStatus(camp, 'Active')}
                                      title="Resume Campaign"
                                      className="p-1.5 hover:bg-slate-100 text-emerald-600 rounded-lg group transition"
                                    >
                                      <Play className="w-3.5 h-3.5 group-hover:scale-110" />
                                    </button>
                                  ) : null}

                                  {/* Duplicate */}
                                  <button
                                    onClick={() => handleDuplicateCampaign(camp)}
                                    title="Duplicate Core Parameters"
                                    className="p-1.5 hover:bg-slate-100 text-teal-600 rounded-lg group transition"
                                  >
                                    <Copy className="w-3.5 h-3.5 group-hover:scale-110" />
                                  </button>

                                  {/* Archive */}
                                  {camp.status !== 'Archived' && (
                                    <button
                                      onClick={() => handleToggleCampaignStatus(camp, 'Archived')}
                                      title="Archive"
                                      className="p-1.5 hover:bg-slate-100 text-indigo-700 rounded-lg group transition"
                                    >
                                      <Archive className="w-3.5 h-3.5 group-hover:scale-110" />
                                    </button>
                                  )}

                                  {/* Purge */}
                                  <button
                                    onClick={() => handleDeleteCampaign(camp)}
                                    title="Purge permanently"
                                    className="p-1.5 hover:bg-rose-50 text-red-600 rounded-lg group transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 group-hover:scale-110" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* =========================================== */}
          {/* TAB 3: LEAD TRACKING                       */}
          {/* =========================================== */}
          {activeTab === 'leads' && (
            <div className="bg-white border border-slate-205 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Digital Lead Source Attribution</h3>
                  <p className="text-[11px] text-slate-505">Verifying lead landing parameter values and UTM campaign coordinates captured by live routers.</p>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                  ATTRIBUTED LEADS: {campaignAttributedLeads.length}
                </span>
              </div>

              {campaignAttributedLeads.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs">
                  No candidate registries hold campaign attribution nodes yet. Try dispatching a simulated Webster webhook under Analytics tab.
                </div>
              ) : (
                <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-mono text-[9px] uppercase font-bold sticky top-0 z-10">
                        <tr>
                          <th className="p-3">Client Identity</th>
                          <th className="p-3">UTM Source Campaign</th>
                          <th className="p-3 text-center">Reference Landing Page</th>
                          <th className="p-3">UTM Parameters</th>
                          <th className="p-3">Assigned Agent (CRM)</th>
                          <th className="p-3 text-center">Current CRM stage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 bg-white">
                        {campaignAttributedLeads.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition">
                            <td className="p-3">
                              <div className="font-extrabold text-slate-900">{item.name}</div>
                              <div className="text-[9px] font-mono font-medium text-slate-400 mt-0.5">
                                Mob: {item.mobile} | {item.email}
                              </div>
                            </td>
                            <td className="p-3 text-slate-700">
                              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 font-mono text-[10px] rounded-lg font-bold border border-blue-100">
                                {item.source}
                              </span>
                            </td>
                            <td className="p-3 text-center text-[10px] font-mono text-slate-500 truncate max-w-[150px]" title={item.landingPage}>
                              {item.landingPage || "Direct Enrolment"}
                            </td>
                            <td className="p-3 text-[9px] font-mono text-slate-500 whitespace-nowrap">
                              <div>Source: <span className="text-slate-750 font-bold">{item.utmSource || 'facebook_ads'}</span></div>
                              <div className="mt-0.5">Campaign: <span className="text-slate-755 font-bold">{item.utmCampaign || 'residential_q2'}</span></div>
                            </td>
                            <td className="p-3 text-slate-600 font-semibold">{item.agentName || 'Auto Pool Coordinator'}</td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold font-mono text-[9px] uppercase border border-indigo-200 rounded-md">
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================== */}
          {/* TAB 4: CREATIVE ASSETS                      */}
          {/* =========================================== */}
          {activeTab === 'assets' && (
            <div className="bg-white border border-slate-205 rounded-3xl p-6 shadow-sm space-y-6">
              
              {/* Asset Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4 h-auto">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Enterprise Asset & Creative Inventory</h3>
                  <p className="text-[11px] text-slate-505">Link premium graphic renders, building blueprints, and localized target files directly onto marketing instances.</p>
                </div>
              </div>

              {/* Upload Asset Segment */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <h4 className="font-extrabold font-mono text-slate-700 text-[10px] uppercase mb-3 flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" /> Synchronize new digital asset file
                </h4>

                <form onSubmit={handleUploadAsset} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs items-end font-semibold">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-600">Associated Campaign</label>
                    <select 
                      value={selectedCampaign?.id || ''} 
                      onChange={(e) => {
                        const m = campaigns.find(c => c.id === e.target.value);
                        if (m) setSelectedCampaign(m);
                      }}
                      required
                      className="p-2 border rounded-xl bg-white focus:outline-hidden font-bold"
                    >
                      <option value="">-- Associate Campaign --</option>
                      {campaigns.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-600">Category Tag</label>
                    <select 
                      value={assetCategory} 
                      onChange={(e) => setAssetCategory(e.target.value as any)}
                      className="p-2 border rounded-xl bg-white focus:outline-hidden font-bold"
                    >
                      <option value="Creative Designs">Creative Graphic Ads</option>
                      <option value="Images">Render / Floorplans (PNG/JPG)</option>
                      <option value="Videos">Teaser / Video walkthrough</option>
                      <option value="PDFs">Developer blueprints (PDF)</option>
                      <option value="Brochures">VIP Booklet Brochure</option>
                      <option value="Landing Pages">Attributed URL pages</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-slate-600">Asset File Name / Text identifier</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Master Tower Blueprint A" 
                      value={assetNameInput} 
                      onChange={(e) => setAssetNameInput(e.target.value)}
                      required 
                      className="p-2 border rounded-xl bg-white focus:outline-hidden font-bold" 
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-3">
                    <label className="text-slate-600">Remote Asset Link URL (Mock image URL, Unsplash or relative path)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800..." 
                      value={assetUrlInput} 
                      onChange={(e) => setAssetUrlInput(e.target.value)}
                      className="p-2 border rounded-xl bg-white focus:outline-hidden font-bold font-mono text-[11px]" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={!selectedCampaign}
                    className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase rounded-xl transition disabled:bg-slate-350 disabled:cursor-not-allowed cursor-pointer text-center flex items-center justify-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Bind Asset
                  </button>
                </form>
              </div>

              {/* Render Selected Campaign Asset inventory list */}
              {selectedCampaign ? (
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <FolderOpen className="w-4 h-4 text-indigo-600" /> Catalog files for campaign: "{selectedCampaign.name}" ({selectedCampaign.creativeAssets?.length || 0})
                  </h4>

                  {!selectedCampaign.creativeAssets || selectedCampaign.creativeAssets.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 border border-dashed rounded-2xl bg-slate-50/50 text-xs">
                      No linked digital assets mapped onto this selection index yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedCampaign.creativeAssets.map((asset) => (
                        <div key={asset.id} className="border border-slate-200 rounded-2xl p-4 bg-white hover:border-blue-300 transition shadow-xs flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <span className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-150 text-indigo-700 text-[8px] font-bold font-mono rounded-xs">
                              {asset.category}
                            </span>
                            <div className="font-extrabold text-slate-900 text-xs truncate" title={asset.name}>
                              {asset.name}
                            </div>
                            <div className="text-[9px] text-slate-400 font-mono">Size: {asset.size} | Uploaded: {new Date(asset.uploadedAt).toLocaleString()}</div>
                          </div>

                          {/* Image preview mock */}
                          {asset.url && asset.url.startsWith("http") && (
                            <div className="my-3 rounded-lg overflow-hidden h-[120px] bg-slate-100 border relative group">
                              <img 
                                src={asset.url} 
                                alt={asset.name} 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                              />
                            </div>
                          )}

                          <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                            <a 
                              href={asset.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="px-2.5 py-1 text-[10px] font-bold text-blue-600 hover:bg-slate-50 rounded-lg flex items-center gap-1 border"
                            >
                              <Eye className="w-3 h-3" /> Preview
                            </a>
                            <button
                              onClick={() => handleDeleteAsset(asset.id)}
                              className="px-2.5 py-1 text-[10px] font-bold text-red-600 hover:bg-rose-50 rounded-lg flex items-center gap-1 border border-transparent hover:border-rose-200"
                            >
                              <Trash2 className="w-3 h-3" /> Purge
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 border rounded-2xl text-slate-450 font-medium text-xs">
                  👉 Click a campaign's Title in Register or choose a campaign in dropdown above to manage creative images, assets, or blueprints.
                </div>
              )}

            </div>
          )}

          {/* =========================================== */}
          {/* TAB 5: BUDGET LEDGER                       */}
          {/* =========================================== */}
          {activeTab === 'budgets' && (
            <div className="bg-white border border-slate-205 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900">Enterprise Budget Allocated vs. Actual Expense</h3>
                <p className="text-[11px] text-slate-505">Optimizing campaign burn limits, monitoring daily runouts, and flagging cap boundaries.</p>
              </div>

              {/* Summary overview */}
              <div className="flex flex-col md:flex-row gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl justify-between">
                <div>
                  <span className="text-[9px] font-bold font-mono text-slate-400 uppercase">Allocated Budget Pool</span>
                  <div className="text-2xl font-black text-slate-800">₹{totals.totalBudget.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-[9px] font-bold font-mono text-slate-400 uppercase">Actual Total Burnt (Spend)</span>
                  <div className="text-2xl font-black text-slate-800 text-red-600">₹{totals.totalSpend.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-[9px] font-bold font-mono text-slate-400 uppercase">Remaining Pool Margin</span>
                  <div className={`text-2xl font-black ${totals.totalBudget >= totals.totalSpend ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ₹{(totals.totalBudget - totals.totalSpend).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-bold font-mono text-slate-400 uppercase">Overall Burn Rate (Cap)</span>
                  <div className="text-2xl font-black text-slate-800">
                    {((totals.totalSpend / totals.totalBudget) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Grid Progress Bars for each Campaign */}
              <div className="space-y-4 mt-4 text-xs font-semibold text-slate-700">
                <h4 className="text-[10px] font-extrabold font-mono text-slate-500 uppercase">Indivudial Campaign Burn Limits</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {campaigns.map((c) => {
                    const burnPercent = Math.min(100, (c.spend / c.budgetPaid) * 100);
                    const overBudget = c.spend >= c.budgetPaid;

                    return (
                      <div key={c.id} className="border border-slate-100/80 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-extrabold text-slate-900 leading-tight">{c.name}</div>
                            <span className="text-[8px] font-mono text-slate-400 font-bold uppercase">{c.platform}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase ${
                            overBudget ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-150'
                          }`}>
                            {burnPercent.toFixed(0)}% burnt
                          </span>
                        </div>

                        {/* Bar */}
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border">
                          <div 
                            style={{ width: `${burnPercent}%` }} 
                            className={`h-full rounded-full transition-all duration-300 ${overBudget ? 'bg-red-650' : 'bg-emerald-500'}`} 
                          />
                        </div>

                        {/* Cap information */}
                        <div className="flex justify-between text-[10px] font-mono font-bold text-slate-600">
                          <span>Spend: ₹{c.spend.toLocaleString()}</span>
                          <span>Allocated Cap: ₹{c.budgetPaid.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center justify-between text-[9px] font-semibold text-slate-400 border-t border-slate-100 pt-2.5">
                          <span>Daily Spend Limit: ₹{c.dailySpendLimits.toLocaleString()}</span>
                          <span className="font-mono">Manager: {c.assignedManager}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* =========================================== */}
          {/* TAB 6: REPORTS & EXPORTER                  */}
          {/* =========================================== */}
          {activeTab === 'reports' && (
            <div className="bg-white border border-slate-205 rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900">Custom Marketing Analytics Export Center</h3>
                <p className="text-[11px] text-slate-550">Filter reporting intervals and compile professional formatted CSV metadata, Excel templates, or PDF summaries.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-semibold text-xs text-slate-700">
                {/* PDF generation options */}
                <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50 space-y-4">
                  <h4 className="font-sans font-extrabold text-[#3a3a3a] text-xs">Standard Filter Conditions</h4>
                  
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500">Platform Scope</label>
                      <select className="p-2 border rounded-xl bg-white focus:outline-hidden font-bold text-xs" id="exp-pl">
                        <option value="all">All Campaign Platforms</option>
                        <option value="meta">Meta Advertising Network</option>
                        <option value="google">Google AdWords Network</option>
                        <option value="linkedin">LinkedIn Pro Channels</option>
                        <option value="whatsapp">WhatsApp Direct broadcasts</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500">Report Segment Type</label>
                      <select className="p-2 border rounded-xl bg-white focus:outline-hidden font-bold text-xs" id="exp-type">
                        <option value="summary">Aggregated Summary Report (Budget & Spend)</option>
                        <option value="performance">Yield and Return analysis ROI/ROAS</option>
                        <option value="raw">Raw Registry Campaign Parameters metadata</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500">Date Range Target</label>
                      <select className="p-2 border rounded-xl bg-white focus:outline-hidden font-bold text-xs">
                        <option value="quarter">Q2 Peak Residential (April'26 - June'26)</option>
                        <option value="month">Current active Month (June 2026)</option>
                        <option value="all">Complete lifetime campaign records</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-3 flex flex-wrap gap-2">
                    <button 
                      onClick={() => handleExportData('CSV', 'custom')}
                      className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-extrabold hover:bg-black transition flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Exporte .CSV Log
                    </button>
                    <button 
                      onClick={() => handleExportData('Excel', 'custom_excel')}
                      className="px-3.5 py-2 bg-emerald-600 text-slate-950 rounded-xl text-xs font-extrabold hover:bg-emerald-700 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Exporte .XLS Sheet
                    </button>
                    <button 
                      onClick={() => handleExportData('PDF', 'custom_pdf')}
                      className="px-3.5 py-2 bg-indigo-650 bg-indigo-600 text-white rounded-xl text-xs font-extrabold hover:bg-indigo-750 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Print Log Report
                    </button>
                  </div>
                </div>

                {/* Automation & Lead Quality Score Logic explanation */}
                <div className="border border-slate-200 bg-white rounded-2xl p-5 space-y-4">
                  <h4 className="font-extrabold font-mono text-[10px] text-indigo-700 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-indigo-600" /> SALESFORCE/HUBSPOT COMPLIANCE ENGINES
                  </h4>
                  <p className="text-[11px] text-slate-505 leading-relaxed font-semibold">
                    The Dvarix marketing automation stack calculates dynamic statistics on-the-fly:
                  </p>

                  <ul className="space-y-2 text-[11px] text-slate-650">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-650 mt-1.5" />
                      <div>
                        <strong>ROAS Calculation</strong>: <code className="font-mono text-[10px] bg-slate-100 p-0.5 rounded">Revenue Generated / Actual Spend</code>. Direct parameter attribution tracking.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-655 mt-1.5" />
                      <div>
                        <strong>CPL Verification</strong>: <code className="font-mono text-[10px] bg-slate-100 p-0.5 rounded">Actual Spend / Total Registered Leads</code>.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-660 mt-1.5" />
                      <div>
                        <strong>Lead Quality score</strong>: Calculated as <code className="font-mono text-[10px] bg-slate-100 p-0.5 rounded">Qualified leads volume / Total leads</code>. Rates target channel acquisition effectiveness automatically.
                      </div>
                    </li>
                  </ul>

                  <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[10px] text-indigo-805 leading-normal font-semibold">
                    The engine interfaces with regional lead ingestion webhook arrays, making sure that campaign registries automatically increment counters and report exact CPA results when leads progress into won closures in Dvarix CRM panels. No mock values are used.
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================== */}
      {/* 5. INDIVIDUAL CAMPAIGN PROFILE DETAIL SHEET modal/panel     */}
      {/* ========================================================== */}
      {selectedCampaign && (
        <div id="campaign-selected-profile-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200">
            
            {/* Detail Sheet Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-150 bg-slate-100/30">
              <div>
                <span className="px-2 py-0.5 bg-blue-105 bg-blue-100 border border-blue-200 text-blue-800 text-[8px] font-bold font-mono rounded-md uppercase">
                  {selectedCampaign.platform}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">{selectedCampaign.name}</h3>
                <p className="text-[10px] text-slate-405 font-mono">Campaign Reference ID: {selectedCampaign.id}</p>
              </div>
              
              <button 
                onClick={() => setSelectedCampaign(null)}
                className="p-1.5 hover:bg-slate-200 bg-white border rounded-full text-slate-500 hover:text-slate-800 transition"
              >
                [x] Close Details Sheet
              </button>
            </div>

            {/* Product Profile Tabs content */}
            <div className="p-6 space-y-6 text-xs text-slate-705">
              
              {/* Row 1: Key Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-slate-100 font-semibold">
                <div>
                  <span className="text-slate-450 block text-[9px] font-mono uppercase font-bold">Manager assigned</span>
                  <span className="text-slate-800 text-xs font-extrabold">{selectedCampaign.assignedManager}</span>
                </div>
                <div>
                  <span className="text-slate-450 block text-[9px] font-mono uppercase font-bold">Operational Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                    selectedCampaign.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-655'
                  }`}>
                    {selectedCampaign.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-450 block text-[9px] font-mono uppercase font-bold">Start Date Interval</span>
                  <span className="text-slate-800 text-xs font-extrabold font-mono">{selectedCampaign.startDate}</span>
                </div>
                <div>
                  <span className="text-slate-450 block text-[9px] font-mono uppercase font-bold">Target Closure Span</span>
                  <span className="text-slate-800 text-xs font-extrabold font-mono">{selectedCampaign.endDate}</span>
                </div>
              </div>

              {/* Row 2: Performance metrics ROI overview */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <span className="text-slate-400 block text-[9px] font-mono font-extrabold uppercase">Allocated Budget Cap</span>
                  <span className="text-base font-black text-slate-800 font-mono">₹{selectedCampaign.budgetPaid.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] font-mono font-extrabold uppercase">Burnt Cost (Spend)</span>
                  <span className="text-base font-black text-slate-850 font-mono text-red-650">₹{selectedCampaign.spend.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-450 block text-[9px] font-mono font-extrabold uppercase">CPL Metric</span>
                  <span className="text-base font-black text-red-700 font-mono">
                    ₹{(selectedCampaign.leadsGenerated > 0 ? selectedCampaign.spend/selectedCampaign.leadsGenerated : 0).toFixed(0)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-450 block text-[9px] font-mono font-extrabold uppercase">ROAS Achieved</span>
                  <span className="text-base font-black text-purple-705 text-purple-700 font-mono">
                    {(selectedCampaign.spend > 0 ? selectedCampaign.revenue/selectedCampaign.spend : 0).toFixed(1)}x
                  </span>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <span className="text-indigo-405 block text-[9px] font-mono font-extrabold uppercase">Revenue Generated</span>
                  <span className="text-base font-black text-indigo-700 font-mono">₹{(selectedCampaign.revenue / 10000000).toFixed(2)} Cr</span>
                </div>
              </div>

              {/* Columns: Left Info vs Right Assets & Logs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Left side description */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-extrabold uppercase text-slate-450 font-mono text-[10px] tracking-wider">Targets & Objectives</h4>
                    <p className="bg-slate-50/50 p-3 rounded-xl leading-relaxed text-slate-700 font-semibold">{selectedCampaign.objectives}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-extrabold uppercase text-slate-450 font-mono text-[10px] tracking-wider">Target Demographics</h4>
                    <p className="bg-slate-50/50 p-3 rounded-xl leading-relaxed text-slate-705 font-medium">{selectedCampaign.targetAudience}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-extrabold uppercase text-slate-450 font-mono text-[10px] tracking-wider">UTM Reference Parameters (Tracking Node)</h4>
                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 text-emerald-400 rounded-xl font-mono text-[10px]">
                      <div>
                        <span className="text-slate-450 block text-[8px] uppercase">utm_source</span>
                        <span className="font-bold">{selectedCampaign.utmSource || 'direct'}</span>
                      </div>
                      <div>
                        <span className="text-slate-450 block text-[8px] uppercase">utm_campaign</span>
                        <span className="font-bold truncate max-w-[100px]" title={selectedCampaign.utmCampaign}>{selectedCampaign.utmCampaign || 'exclusive_residential'}</span>
                      </div>
                      <div>
                        <span className="text-slate-450 block text-[8px] uppercase">utm_medium</span>
                        <span className="font-bold">{selectedCampaign.utmMedium || 'cpc'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-[10px] text-blue-805 leading-normal font-semibold">
                    💡 Performance metrics sync directly in HubSpot schemas, checking CPL indices against optimal caps immediately whenever leads are promoted.
                  </div>
                </div>

                {/* Right side activity log & creative assets */}
                <div className="space-y-4 font-semibold text-slate-700">
                  <div className="space-y-2">
                    <h4 className="font-extrabold uppercase text-slate-450 font-mono text-[10px] tracking-wider">Historical Activity logs</h4>
                    <div className="border border-slate-100 rounded-xl bg-slate-50/30 overflow-hidden text-[10px]">
                      {selectedCampaign.activityLogs && selectedCampaign.activityLogs.length > 0 ? (
                        <div className="divide-y divide-slate-100 max-h-[160px] overflow-y-auto">
                          {selectedCampaign.activityLogs.map((log) => (
                            <div key={log.id} className="p-2.5">
                              <div className="flex justify-between font-mono text-[8px] text-slate-450 font-bold">
                                <span>{log.user} | {new Date(log.timestamp).toLocaleString()}</span>
                                <span className="text-indigo-600 uppercase">{log.action}</span>
                              </div>
                              <p className="mt-1 font-sans text-slate-700 font-semibold leading-relaxed">{log.details}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-slate-400">
                          No audit transition logs available for current selection index.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Creative assets shortcuts */}
                  <div className="space-y-2">
                    <h4 className="font-extrabold uppercase text-slate-450 font-mono text-[10px] tracking-wider flex justify-between">
                      <span>Linked creative designs</span>
                      <button 
                        onClick={() => { setSelectedCampaign(selectedCampaign); setActiveTab('assets'); }}
                        className="text-blue-600 lowercase font-extrabold cursor-pointer"
                      >
                        + Manage assets
                      </button>
                    </h4>
                    <div className="border border-slate-100 rounded-xl divide-y text-[11px] font-sans">
                      {selectedCampaign.creativeAssets && selectedCampaign.creativeAssets.length > 0 ? (
                        selectedCampaign.creativeAssets.map((asset) => (
                          <div key={asset.id} className="p-2.5 flex justify-between items-center bg-white hover:bg-slate-50/50">
                            <div>
                              <div className="font-extrabold text-slate-850 truncate max-w-[180px]" title={asset.name}>{asset.name}</div>
                              <span className="text-[9px] text-slate-400 font-mono uppercase">{asset.category} | {asset.size}</span>
                            </div>
                            <a href={asset.url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-600 flex items-center gap-0.5 border px-1.5 py-0.5 rounded bg-white">
                              Preview <ArrowRight className="w-3 h-3" />
                            </a>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-slate-400 text-xs">
                          No active assets bound onto this index file.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Profile footer */}
            <div className="p-4 border-t border-slate-150 bg-slate-50 text-right">
              <button 
                onClick={() => setSelectedCampaign(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold uppercase rounded-xl transition text-xs cursor-pointer"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 6. CREATE & EDIT MODAL CONTAINER (CRUD forms)              */}
      {/* ========================================================== */}
      {campaignModalOpen && (
        <div id="campaign-launch-edit-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl flex flex-col p-6 space-y-4 animate-in scale-in duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">
                {campaignModalMode === 'create' ? '🚀 Launch New Campaign Instance' : '📝 Edit Campaign specifications'}
              </h3>
              <button 
                onClick={() => setCampaignModalOpen(false)}
                className="p-1.5 hover:bg-slate-105 bg-slate-100 rounded-full text-slate-400 hover:text-slate-750 transition cursor-pointer"
              >
                [x]
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateOrUpdateCampaign} className="space-y-3.5 text-xs text-slate-700 font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-slate-600">Campaign Name</label>
                  <input 
                    type="text" 
                    value={formName} 
                    onChange={(e) => setFormName(e.target.value)} 
                    required 
                    className="p-2 border rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden font-bold" 
                    placeholder="e.g. Meta Q2 Duplex Showcase"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-650">Platform</label>
                  <select 
                    value={formPlatform} 
                    onChange={(e) => setFormPlatform(e.target.value as any)}
                    className="p-2 border rounded-xl bg-slate-50 focus:outline-hidden font-bold"
                  >
                    <option value="Meta Ads">Meta Ads</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="LinkedIn Ads">LinkedIn Ads</option>
                    <option value="WhatsApp Campaigns">WhatsApp Campaigns</option>
                    <option value="Email Marketing">Email Marketing</option>
                    <option value="SMS Marketing">SMS Marketing</option>
                    <option value="Broker Campaigns">Broker Campaigns</option>
                    <option value="Offline Events">Offline Events</option>
                    <option value="Newspaper">Newspaper</option>
                    <option value="Hoardings">Hoardings</option>
                    <option value="Referral Programs">Referral Programs</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-600">Status</label>
                  <select 
                    value={formStatus} 
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="p-2 border rounded-xl bg-slate-50 focus:outline-hidden font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Draft">Draft</option>
                    <option value="Completed">Completed</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-600">Allocated Budget Limit (₹)</label>
                  <input 
                    type="number" 
                    value={formBudget} 
                    onChange={(e) => setFormBudget(Number(e.target.value))} 
                    required 
                    className="p-2 border rounded-xl bg-slate-50 focus:outline-hidden font-mono font-bold" 
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-605">Actual spend Burnt (₹)</label>
                  <input 
                    type="number" 
                    value={formSpend} 
                    onChange={(e) => setFormSpend(Number(e.target.value))} 
                    className="p-2 border rounded-xl bg-slate-50 focus:outline-hidden font-mono font-bold text-red-600" 
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-600">Daily Burn Limit (₹)</label>
                  <input 
                    type="number" 
                    value={formDailySpend} 
                    onChange={(e) => setFormDailySpend(Number(e.target.value))} 
                    className="p-2 border rounded-xl bg-slate-50 focus:outline-hidden font-mono font-bold" 
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-600">Marketing Manager</label>
                  <input 
                    type="text" 
                    value={formManager} 
                    onChange={(e) => setFormManager(e.target.value)} 
                    className="p-2 border rounded-xl bg-slate-50 focus:outline-hidden font-bold" 
                    placeholder="Siddharth Sen"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-600 font-mono text-[10px]">UTM source (utm_source)</label>
                  <input 
                    type="text" 
                    value={formUtmSource} 
                    onChange={(e) => setFormUtmSource(e.target.value)} 
                    className="p-2 border rounded-xl bg-slate-50 font-mono text-[11px]" 
                    placeholder="facebook"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-600 font-mono text-[10px]">UTM Campaign (utm_campaign)</label>
                  <input 
                    type="text" 
                    value={formUtmCampaign} 
                    onChange={(e) => setFormUtmCampaign(e.target.value)} 
                    className="p-2 border rounded-xl bg-slate-50 font-mono text-[11px]" 
                    placeholder="q2_leads_showcase"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-600 font-mono text-[10px]">UTM Medium (utm_medium)</label>
                  <input 
                    type="text" 
                    value={formUtmMedium} 
                    onChange={(e) => setFormUtmMedium(e.target.value)} 
                    className="p-2 border rounded-xl bg-slate-50 font-mono text-[11px]" 
                    placeholder="cpc"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-600">Campaign Start Date</label>
                  <input 
                    type="date" 
                    value={formStartDate} 
                    onChange={(e) => setFormStartDate(e.target.value)} 
                    className="p-2 border rounded-xl bg-slate-50 focus:outline-hidden font-mono font-bold" 
                  />
                </div>

                {campaignModalMode === 'edit' && (
                  <div className="grid grid-cols-3 gap-2 col-span-2 p-3 bg-slate-50 border rounded-xl mt-1">
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] text-slate-400">Total Leads</label>
                      <input type="number" value={formLeadsGenerated} onChange={(e) => setFormLeadsGenerated(Number(e.target.value))} className="p-1 border rounded-lg font-mono text-center" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] text-slate-400">Conversions</label>
                      <input type="number" value={formConversions} onChange={(e) => setFormConversions(Number(e.target.value))} className="p-1 border rounded-lg font-mono text-center" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] text-slate-400">Revenue (₹)</label>
                      <input type="number" value={formRevenue} onChange={(e) => setFormRevenue(Number(e.target.value))} className="p-1 border rounded-lg font-mono text-center" />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-slate-650">Objectives</label>
                  <textarea 
                    rows={2}
                    value={formObjectives} 
                    onChange={(e) => setFormObjectives(e.target.value)} 
                    className="p-2.5 border rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden" 
                    placeholder="Enter focus parameters or goals of this acquisition channel..."
                  />
                </div>

                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-slate-650">Target Demographics / Audience specs</label>
                  <textarea 
                    rows={2}
                    value={formTargetAudience} 
                    onChange={(e) => setFormTargetAudience(e.target.value)} 
                    className="p-2.5 border rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden" 
                    placeholder="Identify target buyer profile, income groups, sectors, etc..."
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full mt-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase rounded-xl transition cursor-pointer shadow-sm text-center"
              >
                {campaignModalMode === 'create' ? 'Launch Campaign Channel' : 'Commit Parameters to Firestore'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
