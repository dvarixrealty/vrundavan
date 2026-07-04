import React, { useState, useMemo } from 'react';
import { 
  Layers, Search, Filter, Edit, Trash2, Mail, MessageSquare, 
  ChevronRight, BadgePercent, Shield, Star, Calendar, ArrowUpRight, 
  Check, Play, Plus, Phone, Navigation, Clock, CreditCard, 
  FileText, Activity, AlertCircle, Sparkles, Send, MapPin, 
  CheckSquare, Trash, RefreshCw, X, User, PlusCircle, Settings, Download, CheckCircle2
} from 'lucide-react';
import { CustomRequirement, Property, Agent } from '../types';
import { firebaseService } from '../lib/firebaseService';

// Subcomponents modularly integrated
import RequirementsKPIWorkspaces from './RequirementsKPIWorkspaces';
import BuyerWorkspaceProfileModal from './BuyerWorkspaceProfileModal';

const STAGES = [
  { id: 'New', name: 'New Inquiry', color: 'border-blue-400 bg-blue-50/50 text-blue-700' },
  { id: 'Matching', name: 'Property Matching', color: 'border-indigo-400 bg-indigo-50/50 text-indigo-700' },
  { id: 'Shortlisted', name: 'Shortlisted', color: 'border-yellow-400 bg-yellow-50/50 text-yellow-700' },
  { id: 'Site Visit', name: 'Site Visit Scheduled', color: 'border-purple-400 bg-purple-50/50 text-purple-700' },
  { id: 'Negotiation', name: 'Negotiation', color: 'border-orange-400 bg-orange-50/50 text-orange-700' },
  { id: 'Booking', name: 'Booking / Token Paid', color: 'border-emerald-400 bg-emerald-50/50 text-emerald-700' },
  { id: 'Closed', name: 'Closed Deal', color: 'border-green-600 bg-emerald-100 text-emerald-800 font-black' }
];

interface SaaSRequirementsModuleProps {
  customRequirements: CustomRequirement[];
  properties: Property[];
  onUpdateStatus: (id: string, nextStatus: any) => void;
  onDeleteRequirement: (id: string) => void;
  isSuperAdmin: boolean;
  userPermissions: any;
  agents?: Agent[];
  siteVisits?: any[];
  setSiteVisits?: React.Dispatch<React.SetStateAction<any[]>>;
  tasks?: any[];
  setTasks?: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function SaaSRequirementsModule({
  customRequirements,
  properties,
  onUpdateStatus,
  onDeleteRequirement,
  isSuperAdmin,
  userPermissions,
  agents = [],
  siteVisits = [],
  setSiteVisits,
  tasks = [],
  setTasks
}: SaaSRequirementsModuleProps) {
  const [viewMode, setViewMode] = useState<'Pipeline' | 'List'>('Pipeline');
  
  // KPI Workspace selection
  const [selectedKpi, setSelectedKpi] = useState<'All' | 'Matched' | 'Walkthroughs' | 'HighPriority' | 'ClosedDeals'>('All');

  // Advanced Filters State
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchReqId, setSearchReqId] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchCity, setSearchCity] = useState('All');
  const [searchPropType, setSearchPropType] = useState('All');
  const [searchMinBudget, setSearchMinBudget] = useState('');
  const [searchMaxBudget, setSearchMaxBudget] = useState('');
  const [searchPriority, setSearchPriority] = useState('All');
  const [searchAgent, setSearchAgent] = useState('All');
  const [searchStatus, setSearchStatus] = useState('All');

  // AI Copilot Query chips
  const [copilotChips, setCopilotChips] = useState<Array<{ id: string; name: string; description?: string; filters: any }>>([
    { id: 'bhk3', name: 'Villas & 3 BHK', description: 'Filters to classic luxury Villa or spacious BHK inquiries', filters: { propertyType: 'Villa', bhkRequirement: '3 BHK' } },
    { id: 'plots_sarjapur', name: 'Sarjapur Plots', description: 'Collects plot inquiries in Sarjapur region', filters: { propertyType: 'Plot', preferredCity: 'Sarjapur' } },
    { id: 'high_budget', name: 'Buyers > 3.5 Cr', description: 'Filters high value client portfolios requesting 3.5 Cr+ maximum limits', filters: { minBudget: '3.5 Cr', priority: 'High' } }
  ]);
  const [showChipModal, setShowChipModal] = useState(false);
  const [newChipName, setNewChipName] = useState('');
  const [newChipType, setNewChipType] = useState('All');
  const [newChipCity, setNewChipCity] = useState('All');
  const [newChipMinBud, setNewChipMinBud] = useState('');

  // Local state to sustain 100% reactive workflow UI
  const [localRequirements, setLocalRequirements] = useState<CustomRequirement[]>(customRequirements);
  const [selectedReq, setSelectedReq] = useState<CustomRequirement | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [automationToast, setAutomationToast] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Register Form Fields
  const [newReqForm, setNewReqForm] = useState({
    fullName: '',
    mobileNumber: '',
    emailAddress: '',
    propertyType: 'Apartment',
    preferredCity: '',
    preferredArea: '',
    minBudget: '',
    maxBudget: '',
    plotSize: '',
    bhkRequirement: '2 BHK',
    timeline: 'Within 1 Month',
    lookingFor: 'Buy',
    message: ''
  });

  // Sync state with incoming props
  React.useEffect(() => {
    setLocalRequirements(customRequirements);
  }, [customRequirements]);

  // Extract unique cities (locations) for selection dropdown
  const uniqueCitiesList = useMemo(() => {
    const list = new Set<string>();
    localRequirements.forEach(req => {
      if (req.preferredCity) list.add(req.preferredCity);
    });
    return Array.from(list);
  }, [localRequirements]);

  // Read current Kanban segment for a requirement
  const getRequirementStage = (req: CustomRequirement): string => {
    const dynamicReq = req as any;
    if (dynamicReq.stage) return dynamicReq.stage;
    
    switch (req.status) {
      case 'New': return 'New';
      case 'In Progress': return 'Matching';
      case 'Contacted': return 'Shortlisted';
      case 'Archived': return 'Closed';
      default: return 'New';
    }
  };

  // 1. CALCULATE LIVE REACTIVE KEY METRICS
  const dynamicKpiStats = useMemo(() => {
    const total = localRequirements.length;
    
    // Auto matched units count (properties scoring >= 50%)
    let matchCount = 0;
    localRequirements.forEach(req => {
      const city = (req.preferredCity || '').toLowerCase();
      const type = (req.propertyType || '').toLowerCase();
      properties.forEach(p => {
        const loc = p.location.toLowerCase().includes(city) || city.includes(p.location.toLowerCase());
        const typ = p.type.toLowerCase().includes(type) || type.includes(p.type.toLowerCase());
        if (loc || typ) matchCount++;
      });
    });

    // Active scheduled site tours
    const activeTours = siteVisits.filter(v => v.status === 'Confirmed' || v.status === 'In Progress' || !v.status).length;

    // High Priority clients (Immediately target or budget >= 3.5 crores)
    const vipCount = localRequirements.filter(req => {
      const budgetVal = parseFloat((req.maxBudget || '0').replace(/[^0-9]/g, '')) || 0;
      return budgetVal >= 35000000 || req.timeline === 'Immediately' || (req as any).priority === 'High';
    }).length;

    // Concluded / Closed deal counts
    const closedCount = localRequirements.filter(req => {
      const stage = (req as any).stage || '';
      return stage === 'Booking' || stage === 'Closed' || req.status === 'Archived';
    }).length;

    return { total, matchCount, activeTours, vipCount, closedCount };
  }, [localRequirements, properties, siteVisits]);

  // Reset filtering conditions
  const handleResetFilters = () => {
    setSearchName('');
    setSearchReqId('');
    setSearchPhone('');
    setSearchCity('All');
    setSearchPropType('All');
    setSearchMinBudget('');
    setSearchMaxBudget('');
    setSearchPriority('All');
    setSearchAgent('All');
    setSearchStatus('All');
    setSelectedKpi('All');
    triggerAutomationToast('All operational search query metrics reset!');
  };

  // Save current query filters as custom AI Copilot chip
  const handleSaveCurrentFilterAsChip = () => {
    const chipName = prompt("Enter a representative name for this custom AI filter chip:", "Hot Leads Location");
    if (!chipName) return;

    const newChip = {
      id: `chip-${Date.now()}`,
      name: chipName,
      description: `Saved query configuration matching applied parameters`,
      filters: {
        preferredCity: searchCity !== 'All' ? searchCity : '',
        propertyType: searchPropType !== 'All' ? searchPropType : '',
        priority: searchPriority,
        minBudget: searchMinBudget
      }
    };

    setCopilotChips(prev => [...prev, newChip]);
    triggerAutomationToast(`✨ Success: Formulated custom AI Quick Filter Chip "${chipName}"!`);
  };

  // Triggering the custom toast automation notification banner
  const triggerAutomationToast = (msg: string) => {
    setAutomationToast(msg);
    setTimeout(() => {
      setAutomationToast(null);
    }, 5000);
  };

  // Apply chip search rules immediately
  const handleApplyChipFilters = (chip: any) => {
    const f = chip.filters;
    if (f.propertyType) setSearchPropType(f.propertyType);
    if (f.preferredCity) setSearchCity(f.preferredCity);
    if (f.minBudget) {
      setSearchMinBudget(f.minBudget);
    }
    if (f.priority) setSearchPriority(f.priority);
    if (f.bhkRequirement) {
      // simulate search logic
      triggerAutomationToast(`Applied smart layout criteria: BHK setting "${f.bhkRequirement}"`);
    }
    
    // Switch view mode if needed
    setSelectedKpi('All');
    triggerAutomationToast(`✨ Copilot applied ruleset: "${chip.name}" synchronized across registry.`);
  };

  // 2. ENHANCED SEARCH FILTERS APPLIED
  const filteredRequirements = useMemo(() => {
    return localRequirements.filter(req => {
      // Full Name search
      if (searchName && !req.fullName.toLowerCase().includes(searchName.toLowerCase())) return false;
      // Requirement ID search
      if (searchReqId && !req.id.toLowerCase().includes(searchReqId.toLowerCase())) return false;
      // Phone search
      if (searchPhone && !req.mobileNumber.toLowerCase().includes(searchPhone.toLowerCase())) return false;
      // City search
      if (searchCity !== 'All' && req.preferredCity !== searchCity) return false;
      // Property type search
      if (searchPropType !== 'All' && req.propertyType !== searchPropType) return false;

      // Budget targets check
      const maxBudValue = parseFloat((req.maxBudget || '0').replace(/[^0-9]/g, '')) || 0;
      const minBudValue = parseFloat((req.minBudget || '0').replace(/[^0-9]/g, '')) || 0;

      if (searchMinBudget) {
        const queryMin = parseFloat(searchMinBudget) || 0;
        if (maxBudValue > 0 && maxBudValue < queryMin) return false;
      }
      if (searchMaxBudget) {
        const queryMax = parseFloat(searchMaxBudget) || Infinity;
        if (minBudValue > 0 && minBudValue > queryMax) return false;
      }

      // Priority check
      if (searchPriority !== 'All') {
        const isHigh = maxBudValue >= 35000000 || req.timeline === 'Immediately' || (req as any).priority === 'High';
        if (searchPriority === 'High' && !isHigh) return false;
        if (searchPriority === 'Medium/Low' && isHigh) return false;
      }

      // Agent assignment filter
      if (searchAgent !== 'All') {
        const actReq = req as any;
        if (actReq.assignedAgentId !== searchAgent && actReq.assignedAgentName !== searchAgent) return false;
      }

      // Stage / CRM Status filter
      if (searchStatus !== 'All' && getRequirementStage(req) !== searchStatus) return false;

      return true;
    });
  }, [localRequirements, searchName, searchReqId, searchPhone, searchCity, searchPropType, searchMinBudget, searchMaxBudget, searchPriority, searchAgent, searchStatus]);

  // Move drag card Stage & notify parent + simulate automated triggers
  const handleUpdateStage = async (reqId: string, nextStage: string) => {
    const updatedList = localRequirements.map(req => {
      if (req.id === reqId) {
        let nextStatus: CustomRequirement['status'] = 'In Progress';
        if (nextStage === 'New') nextStatus = 'New';
        if (nextStage === 'Shortlisted' || nextStage === 'Site Visit' || nextStage === 'Negotiation' || nextStage === 'Booking') nextStatus = 'Contacted';
        if (nextStage === 'Closed') nextStatus = 'Archived';

        const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const currentActivities = (req as any).activities || [];
        const newActivity = {
          id: `act-drag-${Date.now()}`,
          text: `Stage changed to "${STAGES.find(s=>s.id===nextStage)?.name || nextStage}" via Workspace Drag-and-Drop`,
          date: nowStr,
          type: 'Status Change'
        };

        const updated = {
          ...req,
          status: nextStatus,
          stage: nextStage,
          activities: [newActivity, ...currentActivities]
        };

        // Persist to firebase database
        firebaseService.saveRequirement(updated);
        // Dispatch status changed to parent dashboard
        onUpdateStatus(reqId, nextStatus);

        return updated;
      }
      return req;
    });

    setLocalRequirements(updatedList);

    // Dynamic automation notifications trigger
    const req = localRequirements.find(r=>r.id === reqId);
    if (req) {
      let trigMessage = `✨ Automation Trigger: Task logged. Timeline synchronized database logs.`;
      if (nextStage === 'Matching') {
        trigMessage = `✨ Match Trigger: Compiled property compatibility catalogs & routed to ${req.fullName}.`;
      } else if (nextStage === 'Shortlisted') {
        trigMessage = `✨ Campaign Trigger: Scheduled custom brochures and text dispatch logs.`;
      } else if (nextStage === 'Site Visit') {
        trigMessage = `✨ Tour Trigger: Coordinated advisor scheduler assignment and transport maps.`;
      } else if (nextStage === 'Negotiation') {
        trigMessage = `✨ Negotiations Trigger: Live ledger counter-bid audit updated.`;
      } else if (nextStage === 'Booking') {
        trigMessage = `✨ Booking Trigger: Created secure bankers invoice. Financial statements updated.`;
      } else if (nextStage === 'Closed') {
        trigMessage = `✨ Deal Closed: Close Won reported. Authorized revenue reports.`;
      }
      triggerAutomationToast(trigMessage);
    }
  };

  // Add new requirement
  const handleCreateRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqForm.fullName || !newReqForm.mobileNumber || !newReqForm.preferredCity) {
      alert("Missing required details inside core inputs!");
      return;
    }

    const newReqId = `REQ-${Date.now().toString().slice(-5)}`;
    const newObj: CustomRequirement = {
      id: newReqId,
      fullName: newReqForm.fullName,
      mobileNumber: newReqForm.mobileNumber,
      emailAddress: newReqForm.emailAddress || undefined,
      propertyType: newReqForm.propertyType,
      preferredCity: newReqForm.preferredCity,
      preferredArea: newReqForm.preferredArea || undefined,
      minBudget: newReqForm.minBudget || undefined,
      maxBudget: newReqForm.maxBudget || undefined,
      plotSize: newReqForm.plotSize || undefined,
      bhkRequirement: newReqForm.bhkRequirement || undefined,
      timeline: newReqForm.timeline,
      lookingFor: newReqForm.lookingFor as any,
      message: newReqForm.message || undefined,
      status: 'New',
      date: new Date().toISOString()
    };

    // add specific properties
    const enriched = {
      ...newObj,
      stage: 'New',
      activities: [{
        id: `act-new-${Date.now()}`,
        text: `Inquiry successfully ingested into corporate CRM Roster`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        type: 'Note'
      }]
    };

    // Save into firebase database
    await firebaseService.saveRequirement(enriched);
    setLocalRequirements(prev => [enriched, ...prev]);

    // reset forms
    setNewReqForm({
      fullName: '',
      mobileNumber: '',
      emailAddress: '',
      propertyType: 'Apartment',
      preferredCity: '',
      preferredArea: '',
      minBudget: '',
      maxBudget: '',
      plotSize: '',
      bhkRequirement: '2 BHK',
      timeline: 'Within 1 Month',
      lookingFor: 'Buy',
      message: ''
    });
    setShowAddForm(false);
    triggerAutomationToast("✨ Success: Created new Buyer Requirement into databases!");
  };

  // Downloader CSV dispatch
  const handleExportCSV = () => {
    const headers = ['ID', 'Full Name', 'Mobile', 'Email', 'Property Type', 'City', 'Min Budget', 'Max Budget', 'BHK Requirement', 'Timeline', 'Stage'];
    const rows = filteredRequirements.map(r => [
      r.id,
      r.fullName,
      r.mobileNumber,
      r.emailAddress || '',
      r.propertyType,
      r.preferredCity,
      r.minBudget || '',
      r.maxBudget || '',
      r.bhkRequirement || '',
      r.timeline,
      (r as any).stage || r.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(v => `"${v}"`).join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Requirement_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerAutomationToast("CSV Ledger successfully downloaded!");
  };

  // Custom AI Chip filter submit Form
  const handleCreateCustomChip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChipName) return;

    const newChip = {
      id: `chip-${Date.now()}`,
      name: newChipName,
      description: 'System Admin custom defined ruleset',
      filters: {
        propertyType: newChipType !== 'All' ? newChipType : undefined,
        preferredCity: newChipCity !== 'All' ? newChipCity : undefined,
        minBudget: newChipMinBud || undefined
      }
    };

    setCopilotChips(prev => [...prev, newChip]);
    setNewChipName('');
    setShowChipModal(false);
    triggerAutomationToast(`Created AI Quick filter chip "${newChipName}"`);
  };

  return (
    <div className="space-y-6 text-left my-4">
      
      {/* 2. AUTOMATION TOAST WARNING BANNER */}
      {automationToast && (
        <div className="fixed top-24 right-6 bg-slate-900 border border-slate-700 text-white p-4.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 max-w-md text-xs font-sans">
          <Sparkles className="h-5 w-5 text-indigo-400 shrink-0 animate-pulse" />
          <div>
            <span className="font-extrabold text-blue-400 font-mono block uppercase text-[10px] tracking-wider leading-none mb-1">Dvarix Workflow Automation</span>
            <p className="font-bold text-slate-100 leading-normal">{automationToast}</p>
          </div>
        </div>
      )}

      {/* Main KPI Stats Display Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* KPI 1 : Total register */}
        <div 
          onClick={() => { setSelectedKpi('All'); handleResetFilters(); }}
          className={`p-6 rounded-3xl border text-left cursor-pointer transition ${
            selectedKpi === 'All' 
              ? 'bg-blue-600 text-white shadow-lg border-blue-500 scale-[1.02]' 
              : 'bg-white border-slate-200 hover:border-slate-355 text-slate-800'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-90">Total Requirements</span>
            <FileText className="h-4 w-4 opacity-75" />
          </div>
          <p className="text-3xl font-black font-mono">{dynamicKpiStats.total}</p>
          <span className="text-[10px] opacity-80 mt-1 block font-semibold">Active matching rosters</span>
        </div>

        {/* KPI 2 : Auto Match listings */}
        <div 
          onClick={() => setSelectedKpi('Matched')}
          className={`p-6 rounded-3xl border text-left cursor-pointer transition ${
            selectedKpi === 'Matched' 
              ? 'bg-indigo-600 text-white shadow-lg border-indigo-500 scale-[1.02]' 
              : 'bg-white border-slate-200 hover:border-indigo-400 text-slate-800'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-90">Auto Matched Units</span>
            <BadgePercent className="h-4 w-4 opacity-75 animate-pulse" />
          </div>
          <p className="text-3xl font-black font-mono">{dynamicKpiStats.matchCount ?? 0}</p>
          <span className="text-[10px] opacity-80 mt-1 block font-semibold font-sans">Active engine recommendations</span>
        </div>

        {/* KPI 3 : Walkthroughs */}
        <div 
          onClick={() => setSelectedKpi('Walkthroughs')}
          className={`p-6 rounded-3xl border text-left cursor-pointer transition ${
            selectedKpi === 'Walkthroughs' 
              ? 'bg-purple-600 text-white shadow-lg border-purple-500 scale-[1.02]' 
              : 'bg-white border-slate-200 hover:border-purple-400 text-slate-800'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-90">Walkthroughs Active</span>
            <Calendar className="h-4 w-4 opacity-75" />
          </div>
          <p className="text-3xl font-black font-mono">{dynamicKpiStats.activeTours}</p>
          <span className="text-[10px] opacity-80 mt-1 block font-semibold">Confirmed scheduled visits</span>
        </div>

        {/* KPI 4 : High priority */}
        <div 
          onClick={() => setSelectedKpi('HighPriority')}
          className={`p-6 rounded-3xl border text-left cursor-pointer transition ${
            selectedKpi === 'HighPriority' 
              ? 'bg-orange-600 text-white shadow-lg border-orange-500 scale-[1.02]' 
              : 'bg-white border-slate-200 hover:border-orange-400 text-slate-800'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-90">High Priority VIP</span>
            <Star className="h-4 w-4 opacity-75" />
          </div>
          <p className="text-3xl font-black font-mono">{dynamicKpiStats.vipCount}</p>
          <span className="text-[10px] opacity-80 mt-1 block font-semibold">Urgent schedule portfolios</span>
        </div>

        {/* KPI 5 : Concluding deals */}
        <div 
          onClick={() => setSelectedKpi('ClosedDeals')}
          className={`p-6 rounded-3xl border text-left cursor-pointer transition ${
            selectedKpi === 'ClosedDeals' 
              ? 'bg-emerald-600 text-white shadow-lg border-emerald-500 scale-[1.02]' 
              : 'bg-white border-slate-200 hover:border-slate-355 text-slate-800'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-90">Concluded Deals</span>
            <CheckCircle2 className="h-4 w-4 opacity-75" />
          </div>
          <p className="text-3xl font-black font-mono">{dynamicKpiStats.closedCount}</p>
          <span className="text-[10px] opacity-80 mt-1 block font-semibold">Settle payment transactions</span>
        </div>

      </div>

      {/* KPI DEDICATED SUB-WORKSPACES PANEL RENDEROVERLAY */}
      {selectedKpi !== 'All' && (
        <RequirementsKPIWorkspaces
          selectedKpi={selectedKpi as any}
          onClose={() => setSelectedKpi('All')}
          localRequirements={localRequirements}
          properties={properties}
          agents={agents}
          siteVisits={siteVisits}
          setSiteVisits={setSiteVisits}
          onOpenProfile={(req, tab) => {
            setSelectedReq(req);
            // set tab state internally inside modal component if possible
          }}
          onUpdateRequirement={async (updated) => {
            setLocalRequirements(prev => prev.map(r=>r.id === updated.id ? updated : r));
            await firebaseService.saveRequirement(updated);
          }}
        />
      )}

      {/* CORE PIPELINE WORKFLOW CONTROLS */}
      {selectedKpi === 'All' && (
        <div className="space-y-6">
          
          {/* Controls Bar & Filter Toggles */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 p-4.5 rounded-3xl shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setViewMode('Pipeline')}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  viewMode === 'Pipeline' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600- bg-slate-100'
                }`}
              >
                Pipeline View (Kanban)
              </button>
              <button
                onClick={() => setViewMode('List')}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  viewMode === 'List' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600- bg-slate-100'
                }`}
              >
                Register Table (List)
              </button>
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={`px-3 py-1.5 border border-slate-250 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  showFiltersPanel ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white hover:bg-slate-50'
                }`}
              >
                <Filter className="h-3.5 w-3.5" /> Advanced Search {showFiltersPanel ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition shadow-xs"
              >
                <Plus className="h-4 w-4" /> Log Requirement Inquiry
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Text Search shortcut */}
              <div className="relative w-full sm:max-w-xs" onClick={e=>e.stopPropagation()}>
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Fast name search..."
                  value={searchName}
                  onChange={e=>setSearchName(e.target.value)}
                  className="w-full bg-slate-50 pl-8.5 pr-4 py-1.5 rounded-xl text-xs border border-slate-200 outline-none"
                />
              </div>

              <button
                onClick={handleExportCSV}
                className="p-1 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition"
                title="Export list to CSV file"
              >
                <Download className="h-4 w-4" /> Export CSV
              </button>
            </div>
          </div>

          {/* ADVANCED MULTI-FILTERS EXPANDABLE DRAWER PANEL */}
          {showFiltersPanel && (
            <div className="p-5 bg-white border border-slate-200 rounded-3xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs shadow-md animate-in slide-in-from-top-2 duration-150 relative">
              <div className="space-y-1 text-left">
                <label className="font-bold text-slate-400">Requirement CRM ID</label>
                <input type="text" placeholder="e.g. REQ-204" value={searchReqId} onChange={e=>setSearchReqId(e.target.value)} className="w-full border p-1 rounded outline-none" />
              </div>
              <div className="space-y-1 text-left">
                <label className="font-bold text-slate-400">Buyer Mobile Number</label>
                <input type="text" placeholder="e.g. 98765" value={searchPhone} onChange={e=>setSearchPhone(e.target.value)} className="w-full border p-1 rounded outline-none" />
              </div>
              <div className="space-y-1 text-left">
                <label className="font-bold text-slate-400">Preferred Sector (City)</label>
                <select value={searchCity} onChange={e=>setSearchCity(e.target.value)} className="w-full bg-white border p-1.5 rounded font-medium">
                  <option value="All">All Cities</option>
                  {uniqueCitiesList.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 text-left">
                <label className="font-bold text-slate-400">Property Type</label>
                <select value={searchPropType} onChange={e=>setSearchPropType(e.target.value)} className="w-full bg-white border p-1.5 rounded font-medium">
                  <option value="All">All Types</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Plot">Plot</option>
                  <option value="Commercial Space">Commercial Space</option>
                </select>
              </div>
              <div className="space-y-1 text-left">
                <label className="font-bold text-slate-400">Maximum Budget Limit</label>
                <input type="text" placeholder="e.g. 35000000" value={searchMaxBudget} onChange={e=>setSearchMaxBudget(e.target.value)} className="w-full border p-1 rounded font-mono" />
              </div>
              <div className="space-y-1 text-left">
                <label className="font-bold text-slate-400">Client Priority Threshold</label>
                <select value={searchPriority} onChange={e=>setSearchPriority(e.target.value)} className="w-full bg-white border p-1.5 rounded">
                  <option value="All">All Priority levels</option>
                  <option value="High">Urgent / High Priority (&gt;= 3.5 Cr)</option>
                  <option value="Medium/Low">Standard Clients</option>
                </select>
              </div>
              <div className="space-y-1 text-left">
                <label className="font-bold text-slate-400">Assigned Expert Advisor</label>
                <select value={searchAgent} onChange={e=>setSearchAgent(e.target.value)} className="w-full bg-white border p-1.5 rounded font-medium">
                  <option value="All">All Advisors</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 text-left">
                <label className="font-bold text-slate-400 font-mono">Stage Placement</label>
                <select value={searchStatus} onChange={e=>setSearchStatus(e.target.value)} className="w-full bg-white border p-1.5 rounded">
                  <option value="All">All Stages</option>
                  {STAGES.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 md:col-span-4 border-t pt-3 flex justify-between items-center">
                <div className="text-[10px] text-slate-450 italic">
                  Dynamic Real-time Sync: Showing {filteredRequirements.length} matching candidate rows out of {localRequirements.length} database logs.
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleSaveCurrentFilterAsChip}
                    className="p-1 px-3 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[11px] rounded transition cursor-pointer flex items-center gap-1"
                  >
                    ✨ Save Query as AI Chip
                  </button>
                  <button 
                    onClick={handleResetFilters}
                    className="p-1 px-3 bg-slate-900 border hover:bg-slate-800 text-white font-extrabold text-[11px] rounded transition cursor-pointer"
                  >
                    Reset Searches
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI COPILOT QUERY CHIPS PANEL */}
          <div className="p-4 bg-slate-50 border border-slate-20 border-slate-200 rounded-3xl flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-450 uppercase text-[9px] font-mono select-none tracking-wider flex items-center gap-1 shrink-0">
              <Sparkles className="h-4 w-4 text-indigo-500 animate-spin" /> AI Copilot Chips:
            </span>
            {copilotChips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => handleApplyChipFilters(chip)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-[10px] sm:text-[11px] font-bold text-slate-700 rounded-full cursor-pointer transition shadow-2xs flex items-center gap-1"
                title={chip.description}
              >
                <span>{chip.name}</span>
                <span className="text-[8px] opacity-75 font-mono">⌘F</span>
              </button>
            ))}

            <button
              onClick={() => setShowChipModal(true)}
              className="p-1 px-2.5 bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-full text-[10px] cursor-pointer"
              title="Add a custom Copilot filter configuration"
            >
              + Create custom filter
            </button>
          </div>

          {/* DYNAMIC VIEWPORTS PORT COLLATERALS */}
          {viewMode === 'Pipeline' ? (
            
            // 5. NATIVE DRAG-AND-DROP KANBAN WINDOW
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3 overflow-x-auto pb-4 items-start select-none">
              {STAGES.map((column) => {
                const stageInquiries = filteredRequirements.filter(req => getRequirementStage(req) === column.id);

                return (
                  <div
                    key={column.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const reqId = e.dataTransfer.getData('dragReqId');
                      if (reqId) handleUpdateStage(reqId, column.id);
                    }}
                    className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 min-h-[500px] flex flex-col gap-3 transition min-w-[200px]"
                  >
                    {/* Column Header */}
                    <div className="flex justify-between items-center border-b pb-2 px-1">
                      <div>
                        <span className="font-extrabold text-slate-900 text-xs block leading-tight">{column.name}</span>
                        <span className="text-[9px] text-slate-450 font-mono italic">Total: {stageInquiries.length}</span>
                      </div>
                      <span className={`w-2.5 h-2.5 rounded-full border ${column.color}`} />
                    </div>

                    {/* Column Cards */}
                    <div className="space-y-2 flex-grow overflow-y-auto">
                      {stageInquiries.map((req) => {
                        const maxBudText = req.maxBudget || 'N/A';
                        const assignedAdvisor = agents.find(a => (req as any).assignedAgentId === a.id);

                        return (
                          <div
                            key={req.id}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('dragReqId', req.id)}
                            onClick={() => setSelectedReq(req)}
                            className="p-3.5 bg-white border border-slate-200 rounded-2xl cursor-grab active:cursor-grabbing hover:border-blue-400 transition-all hover:shadow-xs text-left space-y-2.5 relative group"
                          >
                            <div>
                              <div className="flex justify-between items-start">
                                <span className="font-extrabold text-slate-900 text-xs block group-hover:underline truncate max-w-[130px]">{req.fullName}</span>
                                <span className="text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider">{req.id}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 block truncate font-medium">Looking to {req.lookingFor} • {req.bhkRequirement || 'General'} {req.propertyType}</span>
                            </div>

                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-blue-600 font-serif font-black">{req.preferredCity}</span>
                              <span className="text-indigo-650 font-mono font-extrabold text-slate-900">₹{maxBudText}</span>
                            </div>

                            <div className="flex justify-between items-center border-t border-dashed pt-2">
                              {/* Specialist badge avatar */}
                              {assignedAdvisor ? (
                                <div className="flex items-center gap-1 max-w-[120px] truncate" title={`Assigned: ${assignedAdvisor.name}`}>
                                  <img src={assignedAdvisor.avatar} alt="agent" className="h-4.5 w-4.5 rounded-full border outline-none object-cover shrink-0" />
                                  <span className="text-[9px] text-slate-500 truncate font-semibold">{assignedAdvisor.name}</span>
                                </div>
                              ) : (
                                <span className="text-[9px] text-slate-400 italic">Unassigned Agent</span>
                              )}

                              {req.timeline === 'Immediately' && (
                                <span className="px-1.5 py-0.2 rounded bg-orange-50 text-orange-600 font-mono font-bold text-[8px] animate-pulse">
                                  Urgent
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {stageInquiries.length === 0 && (
                        <div className="h-48 border border-dashed border-slate-150 rounded-2xl flex items-center justify-center p-4">
                          <p className="text-[10px] text-slate-350 italic text-center">Place requirement cards here.</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            
            // Standard dynamic tabular register database tables
            <div className="overflow-x-auto border border-slate-200 rounded-3xl bg-white">
              <table className="w-full text-xs font-sans text-left">
                <thead className="bg-slate-50 text-slate-500 font-mono text-[9px] uppercase border-b border-slate-150">
                  <tr>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">Buyer Name</th>
                    <th className="p-3.5">Contact Detail</th>
                    <th className="p-3.5">Spec Profile</th>
                    <th className="p-3.5">Target Budget Range</th>
                    <th className="p-3.5">Buying Urgency</th>
                    <th className="p-3.5 text-center">Stage Level</th>
                    <th className="p-3.5 text-right">Operations Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRequirements.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3.5 font-mono font-bold text-slate-400">{r.id}</td>
                      <td className="p-3.5 font-bold text-slate-900">{r.fullName}</td>
                      <td className="p-3.5">
                        <span className="block">{r.mobileNumber}</span>
                        {r.emailAddress && <span className="text-[10px] text-slate-450 block">{r.emailAddress}</span>}
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-700">{r.bhkRequirement || 'General'} {r.propertyType}</span>
                        <span className="text-[10px] text-slate-450 block truncate">Corridor: {r.preferredCity}</span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-800 font-bold">
                        ₹{r.minBudget ? `${r.minBudget} - ` : ''} ₹{r.maxBudget || 'N/A'}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${
                          r.timeline === 'Immediately' ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {r.timeline}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100 font-bold text-[10px]">
                          {getRequirementStage(r)}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => setSelectedReq(r)}
                            className="px-2.5 py-1 bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-lg cursor-pointer transition text-[10px]"
                          >
                            View Workspace Profile
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredRequirements.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-16 text-slate-400 italic">
                        No requirement matching criteria rows detected in CRM register.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          )}

        </div>
      )}

      {/* WORKSPACE CRM PROFILE DEEP DETAIL DETAILED MODAL */}
      {selectedReq && (
        <BuyerWorkspaceProfileModal
          requirement={selectedReq}
          properties={properties}
          agents={agents}
          onClose={() => setSelectedReq(null)}
          onUpdateRequirement={(updated) => {
            setLocalRequirements(prev => prev.map(r=>r.id === updated.id ? updated : r));
            setSelectedReq(updated);
          }}
          onDeleteRequirement={async (id) => {
            await firebaseService.deleteRequirement(id);
            setLocalRequirements(prev => prev.filter(r=>r.id !== id));
            onDeleteRequirement(id);
          }}
          siteVisits={siteVisits}
          setSiteVisits={setSiteVisits}
          tasks={tasks}
          setTasks={setTasks}
          triggerToast={triggerAutomationToast}
        />
      )}

      {/* MODAL INGEST NEW REQUIREMENT DIALOG */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border shadow-2xl max-w-xl w-full p-6 text-left relative animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <h4 className="text-lg font-black text-slate-950 tracking-tight font-sans">Log New Buyer Inquiry</h4>
              <button onClick={() => setShowAddForm(false)} className="text-slate-450 hover:text-slate-800 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleCreateRequirement} className="grid grid-cols-2 gap-4 text-xs font-sans text-slate-700">
              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="font-bold text-slate-400">FullName *</label>
                <input type="text" required placeholder="e.g. Krish J" value={newReqForm.fullName} onChange={e=>setNewReqForm({...newReqForm, fullName: e.target.value})} className="w-full border p-2 rounded-xl outline-none" />
              </div>
              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="font-bold text-slate-400">Mobile Phone *</label>
                <input type="text" required placeholder="e.g. 9876543210" value={newReqForm.mobileNumber} onChange={e=>setNewReqForm({...newReqForm, mobileNumber: e.target.value})} className="w-full border p-2 rounded-xl font-mono outline-none" />
              </div>
              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="font-bold text-slate-400">Email Address</label>
                <input type="email" placeholder="e.g. krish@domain.com" value={newReqForm.emailAddress} onChange={e=>setNewReqForm({...newReqForm, emailAddress: e.target.value})} className="w-full border p-2 rounded-xl outline-none" />
              </div>
              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="font-bold text-slate-400">Property Category</label>
                <select value={newReqForm.propertyType} onChange={e=>setNewReqForm({...newReqForm, propertyType: e.target.value})} className="w-full bg-white border p-1 rounded-xl font-bold">
                  <option value="Apartment">Apartment Complex</option>
                  <option value="Villa">Villa Estate</option>
                  <option value="Plot">Land Plot Lot</option>
                  <option value="Commercial Space">Commercial Hub Space</option>
                  <option value="Independent House">Independent ResidenceHouse</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-400">Location Sector *</label>
                <input type="text" required placeholder="e.g. Sarjapur" value={newReqForm.preferredCity} onChange={e=>setNewReqForm({...newReqForm, preferredCity: e.target.value})} className="w-full border p-2 rounded-xl outline-none" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-400">Alternate Corridor</label>
                <input type="text" placeholder="e.g. JP Nagar" value={newReqForm.preferredArea} onChange={e=>setNewReqForm({...newReqForm, preferredArea: e.target.value})} className="w-full border p-2 rounded-xl outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-1">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Min Budget Limit</label>
                  <input type="text" placeholder="e.g. 1 Cr" value={newReqForm.minBudget} onChange={e=>setNewReqForm({...newReqForm, minBudget: e.target.value})} className="w-full border p-1.5 rounded-xl text-[11px] font-mono outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Max Budget Target</label>
                  <input type="text" placeholder="e.g. 3.5 Cr" value={newReqForm.maxBudget} onChange={e=>setNewReqForm({...newReqForm, maxBudget: e.target.value})} className="w-full border p-1.5 rounded-xl text-[11px] font-mono outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 font-mono">BHK Config</label>
                  <input type="text" placeholder="e.g. 3 BHK" value={newReqForm.bhkRequirement} onChange={e=>setNewReqForm({...newReqForm, bhkRequirement: e.target.value})} className="w-full border p-1.5 rounded-xl font-mono outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Buying Timeline</label>
                  <select value={newReqForm.timeline} onChange={e=>setNewReqForm({...newReqForm, timeline: e.target.value})} className="w-full bg-white border p-1 rounded-xl">
                    <option value="Immediately">Immediately Ready</option>
                    <option value="Within 1 Month">Within 30 Days</option>
                    <option value="Within 3 Months">In 90 Days</option>
                    <option value="Just Exploring">Just Exploring</option>
                  </select>
                </div>
              </div>

              <div className="col-span-2 space-y-1">
                <label className="font-bold text-slate-405">Inquiry Notes</label>
                <textarea rows={2} placeholder="Vastu alignment, bank pre-approval ready..." value={newReqForm.message} onChange={e=>setNewReqForm({...newReqForm, message: e.target.value})} className="w-full border p-2 rounded-xl text-[11px] outline-none" />
              </div>

              <div className="col-span-2 flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg cursor-pointer shadow-xs">
                  Create CRM Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURE NEW COPILOT SMART FILTER CHIP */}
      {showChipModal && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border shadow-2xl max-w-sm w-full p-6 text-left relative animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-2 border-b mb-3">
              <h4 className="text-xs font-mono font-extrabold text-indigo-700 uppercase tracking-widest">⚙️ Create AI Filter Chip Rule</h4>
              <button onClick={() => setShowChipModal(false)} className="text-slate-450 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateCustomChip} className="space-y-4 text-xs font-sans text-slate-700">
              <div className="space-y-1">
                <label className="font-bold text-slate-405 block">Chip Title Label *</label>
                <input type="text" required placeholder="e.g. Koramangala Apartments" value={newChipName} onChange={e=>setNewChipName(e.target.value)} className="w-full border p-2 rounded-xl outline-none" />
              </div>
              
              <div className="space-y-1">
                <label className="font-bold text-slate-405 block">Property category filter</label>
                <select value={newChipType} onChange={e=>setNewChipType(e.target.value)} className="w-full bg-white border p-1 rounded-xl font-bold">
                  <option value="All">All Types</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Plot">Plot</option>
                  <option value="Commercial Space">Commercial Space</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-405 block">Sector City selector</label>
                <select value={newChipCity} onChange={e=>setNewChipCity(e.target.value)} className="w-full bg-white border p-1 rounded-xl">
                  <option value="All">All Cities</option>
                  {uniqueCitiesList.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-405 block">Minimum Budget limit (Cr)</label>
                <input type="text" placeholder="e.g. 1.5" value={newChipMinBud} onChange={e=>setNewChipMinBud(e.target.value)} className="w-full border p-2 rounded-xl outline-none font-mono" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="submit" className="w-full py-2 bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-lg shadow-xs cursor-pointer">
                  Create Copilot filter chip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
