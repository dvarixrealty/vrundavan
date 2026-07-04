import React, { useState, useMemo } from 'react';
import { 
  Users, Search, Mail, Phone, Calendar, Edit, Trash2, 
  ChevronRight, ArrowUpRight, MessageSquare, ShieldCheck, 
  CheckCircle, Clock, Sparkles, Plus, AlertCircle, RefreshCw, 
  UserPlus, Upload, Shield, Star, CheckCircle2, Sliders, ExternalLink, X
} from 'lucide-react';
import { Inquiry, CRMLead, Agent, CustomRequirement } from '../types';
import { firebaseService } from '../lib/firebaseService';

interface SaaSCustomersModuleProps {
  inquiries: Inquiry[];
  onUpdateInquiryStatus: (id: string, status: any) => void;
  onDeleteInquiry: (id: string) => void;
  isSuperAdmin: boolean;
  userPermissions: any;
  agents?: Agent[];
  // Shared state to allow direct conversions & additions without duplication
  leads: CRMLead[];
  setLeads: React.Dispatch<React.SetStateAction<CRMLead[]>>;
  siteVisits?: any[];
  setSiteVisits?: React.Dispatch<React.SetStateAction<any[]>>;
  tasks?: any[];
  setTasks?: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function SaaSCustomersModule({
  inquiries,
  onUpdateInquiryStatus,
  onDeleteInquiry,
  isSuperAdmin,
  userPermissions,
  agents = [],
  leads = [],
  setLeads,
  siteVisits = [],
  setSiteVisits,
  tasks = [],
  setTasks
}: SaaSCustomersModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'Inquiries' | 'Manual Add' | 'Paid Ads' | 'Communication' | 'KYC Vault'>('Inquiries');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInq, setSelectedInq] = useState<Inquiry | null>(null);
  
  // Type filter for direct website contact inquiries vs listings
  const [typeFilter, setTypeFilter] = useState<'All' | 'Contact Form' | 'Listing Inquiry' | 'Callback Request'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'New' | 'In Progress' | 'Contacted' | 'Archived'>('All');
  
  // Success states
  const [alertSuccess, setAlertSuccess] = useState('');
  const [answerDraft, setAnswerDraft] = useState('');
  const [emailDispatchSuccess, setEmailDispatchSuccess] = useState(false);

  // Manual Customer Form
  const [manualForm, setManualForm] = useState({
    name: '',
    mobile: '',
    whatsapp: '',
    email: '',
    location: '',
    budget: '',
    requirement: '',
    source: 'Walk-In Customer',
    priority: 'Medium',
    tags: 'Gated Plot, Immediate',
    notes: ''
  });

  // Scheduling coordinates
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [schedPropTitle, setSchedPropTitle] = useState('');

  // CSV drag & drop upload simulator
  const [csvFileName, setCsvFileName] = useState('');
  const [isCsvUploading, setIsCsvUploading] = useState(false);

  // Parse inquiry categories based on property fields
  const getInquiryType = (inq: Inquiry): 'Contact Form' | 'Listing Inquiry' | 'Callback Request' => {
    if (inq.propertyName && inq.propertyId) return 'Listing Inquiry';
    if (inq.message.toLowerCase().includes('call') || inq.message.toLowerCase().includes('phone') || inq.message.toLowerCase().includes('callback')) {
      return 'Callback Request';
    }
    return 'Contact Form';
  };

  // Convert Website Inquiry to qualified qualified CRM Lead
  const handleConvertToLead = async (inq: Inquiry, assignedAgentId?: string) => {
    const selectedAgent = agents.find(a => a.id === assignedAgentId) || agents[0];
    
    // Construct real CRMLead matching target structures
    const newLead: CRMLead = {
      id: `lead-conv-${Date.now()}`,
      name: inq.name,
      mobile: inq.phone || '+91 00000 00000',
      email: inq.email || 'converted.lead@dvarix.co',
      propertyRequirement: inq.propertyName || 'Interested in Listed Units',
      budget: '65,00,000 - 1,50,00,000',
      preferredLocation: 'Bangalore Corridors',
      source: 'Website',
      status: 'Qualified',
      agentId: selectedAgent?.id,
      agentName: selectedAgent?.name,
      notes: {
        internal: `Ingested from direct inquiry on "${inq.date}". message Context: "${inq.message}"`,
        agent: 'Contact verified. Needs brochure dispatched.'
      },
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      activities: [
        {
          id: `act-${Date.now()}`,
          type: 'Status Change',
          content: `Inquiry successfully converted and upgraded to qualified CRM Lead by System`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]
    };

    // Prepend to parent leads array
    setLeads(prev => [newLead, ...prev]);

    // Update original inquiry status to Contacted
    onUpdateInquiryStatus(inq.id, 'Contacted');
    
    // Auto trigger system-level check
    triggerGlobalNotification(
      `Lead Upgraded: ${inq.name}`, 
      `Inquiry converted and assigned to ${selectedAgent?.name || 'Manager'}.`, 
      'Leads'
    );

    setSelectedInq(null);
    setAlertSuccess(`Success! ${inq.name} converted to qualified CRM Lead.`);
    setTimeout(() => setAlertSuccess(''), 4000);
  };

  const triggerGlobalNotification = (title: string, msg: string, category: string) => {
    const detailPayload = { title, message: msg, category, timestamp: new Date().toISOString() };
    let event;
    try {
      event = new CustomEvent('cms-alert-notification', {
        detail: detailPayload
      });
    } catch (e) {
      event = document.createEvent('CustomEvent');
      event.initCustomEvent('cms-alert-notification', true, true, detailPayload);
    }
    window.dispatchEvent(event);
  };

  // Pre-filled WhatsApp templates - fetches matching mobile coordinate
  const handleWhatsAppCustomer = (phoneNum: string, name: string, propName?: string) => {
    const cleanNum = phoneNum.replace(/[^0-9]/g, '');
    if (!cleanNum) {
      alert("Verification Error: Customer mobile coordinate is missing or invalid.");
      return;
    }

    const heading = propName ? `your inquiry for ${propName}` : 'your requirement';
    const msg = `Hello ${name},\n\nThank you for contacting Dvarix Realty regarding ${heading}. This is Dvarix Desk coordinating. We have some luxury matching options that recently opened up.\n\nCould we coordinate a convenient time for a brief callback?`;
    
    const url = `https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Schedules Site Walkthrough Tour and pushes to global list
  const handleScheduleTour = (e: React.FormEvent, inq: Inquiry) => {
    e.preventDefault();
    if (!schedDate || !schedPropTitle) return;

    const assignedAgent = agents[0];
    const newVisitObj = {
      id: `visit-cust-${Date.now()}`,
      customerName: inq.name,
      propertyTitle: schedPropTitle,
      date: schedDate,
      time: schedTime || '11:00 AM',
      status: 'Confirmed',
      agent: assignedAgent?.name || 'Rahul Kumar',
      feedback: 'Walkthrough coordinated from Customer Directory'
    };

    if (setSiteVisits) {
      setSiteVisits(prev => [newVisitObj, ...prev]);
    }

    onUpdateInquiryStatus(inq.id, 'In Progress');
    setSchedDate('');
    setSchedPropTitle('');
    setSelectedInq(null);
    setAlertSuccess(`Coordinated Site Walkthrough Tour for ${inq.name} successfully.`);
    setTimeout(() => setAlertSuccess(''), 4000);

    triggerGlobalNotification(`Site Walkthrough Scheduled`, `Arranged tour for ${inq.name} on ${schedDate}.`, 'Site Visits');
  };

  // Submit manual customer directly to CRM directory / Inquiries or Leads pool
  const handleSubmitManualForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.name || !manualForm.mobile) return;

    // Direct inquiry format
    const newInquiryId = `inq-man-${Date.now()}`;
    const newInq: Inquiry = {
      id: newInquiryId,
      propertyName: manualForm.requirement || 'Bespoke Custom Plot Demand',
      name: manualForm.name,
      email: manualForm.email || 'walkin.buyer@dvarix.gov',
      phone: manualForm.mobile,
      message: manualForm.notes || 'Manually compiled walk-in customer requirement.',
      status: 'New',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      preferredTime: 'Anytime'
    };

    await firebaseService.saveInquiry(newInq);

    // Also optionally append as immediate Active Lead
    const newLeadObj: CRMLead = {
      id: `lead-man-${Date.now()}`,
      name: manualForm.name,
      mobile: manualForm.mobile,
      email: manualForm.email || 'manual@dvarix.com',
      propertyRequirement: manualForm.requirement,
      budget: manualForm.budget || '₹1.5Cr',
      preferredLocation: manualForm.location || 'JP Nagar Corridors',
      source: manualForm.source,
      status: 'New',
      agentId: agents[0]?.id,
      agentName: agents[0]?.name,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      notes: { internal: manualForm.notes, agent: 'Manual walk-in coordinate.' },
      activities: [{ id: `mact-${Date.now()}`, type: 'Note', content: 'Manually ingested via CRM panel', timestamp: new Date().toLocaleTimeString() }]
    };

    setLeads(prev => [newLeadObj, ...prev]);

    setManualForm({
      name: '',
      mobile: '',
      whatsapp: '',
      email: '',
      location: '',
      budget: '',
      requirement: '',
      source: 'Walk-In Customer',
      priority: 'Medium',
      tags: 'Gated Plot, Immediate',
      notes: ''
    });

    setActiveSubTab('Inquiries');
    setAlertSuccess(`Successfully saved manual customer and synced leads registry.`);
    setTimeout(() => setAlertSuccess(''), 4000);

    triggerGlobalNotification(`Manual Lead Created`, `Walk-In customer ${newLeadObj.name} added.`, 'Leads');
  };

  // Simulated Facebook Ads Lead Ingestion
  const handleSimulateFacebookCampaign = () => {
    const fLeads = [
      { name: 'Karthik Raja', ph: '+91 9443210987', mail: 'karthik.r@aurora.io', req: 'Premium Villa Sarjapur', budget: '₹2.8 Cr', src: 'Facebook Ads' },
      { name: 'Srinivas Murthy', ph: '+91 8121112233', mail: 'smurthy@corporate.com', req: 'Indiranagar commercial Shop', budget: '₹6.5 Cr', src: 'Facebook Ads' },
      { name: 'Megha Nair', ph: '+91 7401122334', mail: 'megha.nair@live.in', req: 'Gated Plot Near Devanahalli', budget: '₹95 Lakhs', src: 'Instagram Ads' }
    ];

    fLeads.forEach((fl, idx) => {
      const parsedLead: CRMLead = {
        id: `lead-fb-${Date.now()}-${idx}`,
        name: fl.name,
        mobile: fl.ph,
        email: fl.mail,
        propertyRequirement: fl.req,
        budget: fl.budget,
        preferredLocation: 'Bangalore East',
        source: fl.src,
        status: 'New',
        agentName: agents[idx % agents.length]?.name || 'Rahul Kumar',
        agentId: agents[idx % agents.length]?.id || '1',
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        notes: { internal: 'Ingested via Facebook Lead Ads API hook' },
        activities: [{ id: `fbact-${Date.now()}-${idx}`, type: 'Status Change', content: 'Sync from Facebook Leads Form', timestamp: '10:00 AM' }]
      };

      setLeads(prev => [parsedLead, ...prev]);
    });

    setAlertSuccess(`Meta Leads Sync Complete: Ingested 3 Qualified Mobile Ads Leads!`);
    setTimeout(() => setAlertSuccess(''), 4000);

    triggerGlobalNotification(`Meta Leads Synced`, `Ingested 3 Social media candidate coordinates automatically.`, 'Marketing');
  };

  // Simulates CSV drag & drop list parser
  const handleProcessCsv = () => {
    if (!csvFileName) return;
    setIsCsvUploading(true);

    setTimeout(() => {
      const csvLeads = [
        { name: 'Aditya Vardhan', ph: '+91 9008882233', mail: 'vardhan.aditya@gmail.com', req: 'JP Nagar 3BHK flat', src: 'CSV Bulk Loader' },
        { name: 'Deepa Roy', ph: '+91 9123456789', mail: 'deepa.roy@outlook.com', req: 'Offroad layout plot Whitefield', src: 'CSV Bulk Loader' }
      ];

      csvLeads.forEach((cl, i) => {
        const lead: CRMLead = {
          id: `lead-csv-${Date.now()}-${i}`,
          name: cl.name,
          mobile: cl.ph,
          email: cl.mail,
          propertyRequirement: cl.req,
          budget: '₹1.2 Cr',
          preferredLocation: 'JP Nagar',
          source: cl.src,
          status: 'New',
          createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          notes: { internal: 'Imported via CSV client directory format' },
          activities: [{ id: `csv-${Date.now()}`, type: 'Status Change', content: 'CSV Import completed', timestamp: '11:00 AM' }]
        };
        setLeads(prev => [lead, ...prev]);
      });

      setIsCsvUploading(false);
      setCsvFileName('');
      setAlertSuccess(`CSV Loader complete: Parsed and added 2 buyer leads.`);
      setTimeout(() => setAlertSuccess(''), 4000);

      triggerGlobalNotification(`CSV Directory Ingested`, `Bulk added 2 records successfully.`, 'Marketing');
    }, 2000);
  };

  // Handle Response Reply dispatch simulator
  const handleEmailResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInq || !answerDraft.trim()) return;

    setEmailDispatchSuccess(true);
    setTimeout(() => {
      setEmailDispatchSuccess(false);
      onUpdateInquiryStatus(selectedInq.id, 'Contacted');
      setSelectedInq(null);
      setAnswerDraft('');
      setAlertSuccess(`Bespoke response dispatched directly to ${selectedInq.name}. Status set key: Contacted.`);
      setTimeout(() => setAlertSuccess(''), 4000);
    }, 3000);
  };

  // Filter inquiries listing
  const filteredInquiries = useMemo(() => {
    return inquiries.filter(inq => {
      // search filter
      const term = searchTerm.toLowerCase();
      const inSearch = inq.name.toLowerCase().includes(term) ||
                       (inq.propertyName || '').toLowerCase().includes(term) ||
                       inq.email.toLowerCase().includes(term) ||
                       inq.phone.includes(term);
      if (!inSearch) return false;

      // tab filtration
      const type = getInquiryType(inq);
      if (typeFilter !== 'All' && type !== typeFilter) return false;
      if (statusFilter !== 'All' && inq.status !== statusFilter) return false;

      return true;
    });
  }, [inquiries, searchTerm, typeFilter, statusFilter]);

  const getInqBadgeStyle = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'In Progress': return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'Contacted': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'Archived':
      default: return 'bg-slate-100 text-slate-500 border border-slate-200';
    }
  };

  return (
    <div className="space-y-6 text-left" id="saas-customers-redesigned">
      
      {/* Horizontal Tab Actions bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-2 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">Customer Directory & Inquiries</h2>
          <p className="text-xs text-slate-500 font-sans">Manage direct client requests, callback forms, social media inquiries and manual bookings</p>
        </div>

        <div className="flex flex-wrap gap-1 bg-slate-100 rounded-xl p-0.5 border border-slate-200">
          {(['Inquiries', 'Manual Add', 'Paid Ads', 'KYC Vault'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeSubTab === tab ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab === 'Inquiries' ? 'Inquiries Directory' :
               tab === 'Manual Add' ? 'Manual Add Form' :
               tab === 'Paid Ads' ? 'Ads & CSV Loader' : 'KYC Vault'}
            </button>
          ))}
        </div>
      </div>

      {alertSuccess && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs font-extrabold rounded-2xl border border-emerald-100 tracking-tight animate-bounce text-center">
          {alertSuccess}
        </div>
      )}

      {/* SUB-TAB 1: ENQUIRIES & WEBSITE FORMS DIRECTORY */}
      {activeSubTab === 'Inquiries' && (
        <div className="space-y-4">
          
          {/* Internal Filters bar */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search buyer indexes, property name, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 text-slate-800 font-sans"
                />
              </div>

              {/* Scope filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-705"
              >
                <option value="All">All Inquiry Types</option>
                <option value="Contact Form">Website Forms</option>
                <option value="Listing Inquiry">Property Listings Inqs</option>
                <option value="Callback Request">Callback Requests</option>
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-705"
              >
                <option value="All">All Statuses</option>
                <option value="New">New Inquiries</option>
                <option value="In Progress">In Progress</option>
                <option value="Contacted">Contacted</option>
                <option value="Archived">Closed/Archived</option>
              </select>
            </div>

            <span className="text-xs font-semibold text-slate-500 bg-slate-100 border px-3 py-1 rounded-lg">
              {filteredInquiries.length} Inquiries Total
            </span>
          </div>

          {/* Graphical inquiries grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInquiries.map(inq => {
              const inqType = getInquiryType(inq);
              return (
                <div 
                  key={inq.id}
                  onClick={() => {
                    setSelectedInq(inq);
                    setAnswerDraft(`Hi ${inq.name},\n\nThank you for reaching out regarding ${inq.propertyName || 'our properties'}. We would be happy to coordinate a walkthrough this week.\n\nWarm regards,\nDvarix Realty Coordination Node`);
                  }}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-md hover:border-slate-350 transition duration-150 text-left space-y-4 cursor-pointer relative"
                >
                  {/* Badge Row */}
                  <div className="flex justify-between items-center">
                    <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      inqType === 'Listing Inquiry' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                      inqType === 'Callback Request' ? 'bg-orange-50 text-orange-650 border border-orange-100' :
                      'bg-blue-50 text-blue-600 border border-blue-105'
                    }`}>
                      {inqType}
                    </span>

                    <span className={`text-[9px] font-bold px-1.5 rounded-full ${getInqBadgeStyle(inq.status)}`}>
                      {inq.status}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 text-sm block leading-none">{inq.name}</span>
                    <span className="text-[10px] text-slate-450 block font-mono">{inq.phone}</span>
                    <span className="text-[10.5px] text-slate-400 block truncate">{inq.email}</span>
                  </div>

                  {/* Property interest context */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <span className="text-[9px] uppercase font-mono text-slate-400 block font-bold leading-tight">Interested Listing Unit:</span>
                    <span className="font-semibold text-blue-650 block truncate mt-1">{inq.propertyName || 'Custom portfolio demand'}</span>
                  </div>

                  {/* Message excerpt */}
                  <p className="text-[11px] text-slate-505 truncate leading-relaxed">
                    "{inq.message}"
                  </p>

                  {/* Bottom Actions shortcuts bar */}
                  <div className="flex justify-between items-center border-t border-slate-100 pt-3" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[9px] font-mono text-slate-400">{inq.date} • {inq.preferredTime || 'Anytime'}</span>
                    
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleWhatsAppCustomer(inq.phone, inq.name, inq.propertyName)}
                        className="px-2 py-1 bg-emerald-50 text-emerald-750 border border-emerald-150 hover:bg-emerald-100 transition rounded-lg text-[9px] font-bold"
                        title="Quick WhatsApp Template"
                      >
                        WhatsApp
                      </button>
                      <button
                        onClick={() => handleConvertToLead(inq)}
                        className="px-2 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-[9px] font-bold transition flex items-center gap-0.5 shadow-2xs"
                        title="Upgraded CRM Lead status"
                      >
                        Convert Lead
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredInquiries.length === 0 && (
              <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold">No inquiries cataloged in database matched your query.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DIRECT MANUAL ADDUCE / ENQUIRIES INTAKE */}
      {activeSubTab === 'Manual Add' && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs max-w-2xl mx-auto space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-slate-800 text-sm">Ingest Manual Customer Coordinates</h3>
            <p className="text-xs text-slate-500">Record Walk-in candidates, telephone inquiries or broker files into qualified CRM pipeline</p>
          </div>

          <form onSubmit={handleSubmitManualForm} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-705">
            <div className="space-y-1">
              <label className="font-bold text-slate-500 uppercase">Customer Name *</label>
              <input
                type="text" required
                value={manualForm.name}
                onChange={(e) => setManualForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Ramesh Hegde"
                className="w-full border border-slate-200 p-2.5 rounded-xl outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500 uppercase">Mobile Coordinates (WhatsApp) *</label>
              <input
                type="text" required
                value={manualForm.mobile}
                onChange={(e) => setManualForm(prev => ({ ...prev, mobile: e.target.value }))}
                placeholder="e.g. +91 9112233445"
                className="w-full border border-slate-200 p-2.5 rounded-xl outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500 uppercase">Email Address</label>
              <input
                type="email"
                value={manualForm.email}
                onChange={(e) => setManualForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="e.g. buyer@gmail.com"
                className="w-full border border-slate-200 p-2.5 rounded-xl outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500 uppercase">Inquiry Category Source</label>
              <select
                value={manualForm.source}
                onChange={(e) => setManualForm(prev => ({ ...prev, source: e.target.value }))}
                className="w-full border border-slate-200 p-2.5 rounded-xl bg-white"
              >
                <option value="Walk-In Customer">Walk-In Customer</option>
                <option value="Phone Call">Phone Call</option>
                <option value="WhatsApp">Direct WhatsApp</option>
                <option value="Referral">Agency Referral</option>
              </select>
            </div>

            <div className="space-y-1 col-span-full">
              <label className="font-bold text-slate-500 uppercase">Desired Specifications / Property interest</label>
              <input
                type="text"
                value={manualForm.requirement}
                onChange={(e) => setManualForm(prev => ({ ...prev, requirement: e.target.value }))}
                placeholder="e.g. GP JP Nagar Gated Plot 3"
                className="w-full border border-slate-200 p-2.5 rounded-xl outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 col-span-full">
              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase">Location preference</label>
                <input
                  type="text"
                  value={manualForm.location}
                  onChange={(e) => setManualForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. JP Nagar Corridors"
                  className="w-full border border-slate-200 p-2.5 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase">Estimated Budget Coordinates</label>
                <input
                  type="text"
                  value={manualForm.budget}
                  onChange={(e) => setManualForm(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="e.g. ₹1.2 Cr - 2.5 Cr"
                  className="w-full border border-slate-200 p-2.5 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1 col-span-full">
              <label className="font-bold text-slate-500 uppercase">Internal follow-up special instructions</label>
              <textarea
                rows={3}
                value={manualForm.notes}
                onChange={(e) => setManualForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Needs copy of layout plan and cost breakdown sheet shared immediately..."
                className="w-full border border-slate-200 p-2.5 rounded-xl font-sans resize-none outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="col-span-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Ingest Customer Coordinates
            </button>
          </form>
        </div>
      )}

      {/* SUB-TAB 3: PAID ADS INGESTION (Meta Lead Ads / Google Ads API coordinates) */}
      {activeSubTab === 'Paid Ads' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Social media ad campaigns triggers (7 columns) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Active Advertising Campaign hooks</h3>
                <p className="text-xs text-slate-505">Sync Facebook Leads forms, Instagram ads, Google landers instantly</p>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-600 font-bold border px-2.5 rounded font-mono uppercase">API Live</span>
            </div>

            <div className="space-y-3 text-xs text-slate-705">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex justify-between items-center">
                <div>
                  <span className="font-extrabold text-slate-800 block text-xs">JP Nagar Plot Launch: Facebook Campaign</span>
                  <span className="text-[10px] text-slate-450 block font-mono">Meta Lead API Hook active • 3 New leads buffered</span>
                </div>
                <button
                  type="button"
                  onClick={handleSimulateFacebookCampaign}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold font-sans tracking-tight transition shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" /> Pull Meta Leads
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex justify-between items-center">
                <div>
                  <span className="font-extrabold text-slate-800 block text-xs">Google Search Ads: High budget segment</span>
                  <span className="text-[10px] text-slate-450 block font-mono">Genders tracking coordinates • Ingests directly to landing pages</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase">Connected</span>
              </div>
            </div>
          </div>

          {/* CSV File Upload simulator (5 columns) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm">Bulk Ingestion Loader (CSV)</h3>
            <p className="text-xs text-slate-500">Deploy CSV/Excel sheets parsed from broker portals directly into leads registries.</p>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-3 bg-slate-50">
              <Upload className="h-8 w-8 text-slate-300 mx-auto" />
              
              {csvFileName ? (
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">{csvFileName}</span>
                  <span className="text-[10px] text-slate-450 block">Ready to parse (2 Candidate coordinates detected)</span>
                </div>
              ) : (
                <div className="space-y-1.5 cursor-pointer" onClick={() => setCsvFileName('jpanagar_broker_campaign_leads.csv')}>
                  <span className="text-xs text-blue-600 font-bold block">Click to select pre-compiled broker CSV</span>
                  <span className="text-[10px] text-slate-400 block">Supports CSV formats with Name, Phone, Email, Requirement</span>
                </div>
              )}
            </div>

            {csvFileName && (
              <button
                type="button"
                onClick={handleProcessCsv}
                className="w-full py-2 bg-slate-900 border border-slate-800 hover:bg-slate-950 text-white hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {isCsvUploading ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" /> Compiling CRM indexes...</>
                ) : 'Execute CSV Import'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: KYC CLEARANCE VAULT */}
      {activeSubTab === 'KYC Vault' && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-slate-850 text-sm">KYC Documents Clearance Registry</h3>
            <p className="text-xs text-slate-500">Examine uploaded ID proofs, PAN certifications, or allocation forms synced with buyer files</p>
          </div>

          <div className="space-y-3">
            {[
              { client: "Robert Sterling", type: "PAN Card / Tax Clearances", path: "robert_pancard_certified.pdf", status: "Verified Approved" },
              { client: "Sophia Lin", type: "Adhaar ID Verification", path: "aadhaar_sophia_lin.jpeg", status: "Verified Approved" },
              { client: "Daniel Wright", type: "Allocations deed Agreement Draft", path: "allotment_deed_wp_01.pdf", status: "Pending Review" }
            ].map((doc, i) => (
              <div key={i} className="p-3.5 border border-slate-150 bg-slate-50/50 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <span className="font-extrabold text-slate-800 block">{doc.client}</span>
                  <p className="text-[10.5px] text-slate-500 mt-1">{doc.type} • <span className="font-mono text-[9px] text-slate-400 truncate max-w-xs">{doc.path}</span></p>
                </div>
                <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                  doc.status.includes('Approved') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CRM DETAILED MODAL DRAWER FOR INDIVIDUAL CUSTOMER DIRECTORY ACTION INDEX */}
      {selectedInq && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 text-left space-y-5 relative my-8 animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-start pb-3 border-b border-slate-105">
              <div>
                <span className="text-[8.5px] font-mono text-slate-400 font-bold uppercase tracking-widest">{selectedInq.id}</span>
                <h4 className="font-extrabold text-slate-900 text-lg">{selectedInq.name}</h4>
                <p className="text-xs text-slate-500 font-sans">Verification coordinates: {selectedInq.phone} • {selectedInq.email}</p>
              </div>
              <button 
                onClick={() => setSelectedInq(null)}
                className="text-slate-450 hover:text-slate-700 text-sm font-black rounded-lg p-1 transition"
              >
                ✕
              </button>
            </div>

            {/* Email send alert status */}
            {emailDispatchSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-705 border border-emerald-150 rounded-xl text-center space-y-1.5 animate-bounce text-xs">
                <CheckCircle className="h-6 w-6 text-emerald-550 mx-auto" />
                <span className="font-extrabold block">Bespoke email successfully dispatched!</span>
                <p className="text-[9.5px] font-mono text-emerald-600">Trace logged in database. original Status mapped to 'Contacted'.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left panel info & Reply form (7 columns) */}
                <form onSubmit={handleEmailResponse} className="lg:col-span-7 space-y-4 text-xs text-slate-700">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-1">
                    <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 font-bold">Original Customer message excerpt</span>
                    <p className="text-[11px] text-slate-505 italic">"{selectedInq.message}"</p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase block">Dispatch customized reply email</label>
                    <textarea
                      rows={5}
                      required
                      value={answerDraft}
                      onChange={(e) => setAnswerDraft(e.target.value)}
                      className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-2.5 outline-none font-sans"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedInq(null)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Cancel Close
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <Mail className="h-3.5 w-3.5" /> Dispatch Reply Email
                    </button>
                  </div>
                </form>

                {/* Right panel quick actions list (5 columns) */}
                <div className="lg:col-span-5 space-y-4">
                  
                  {/* Convert to Lead button */}
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl text-xs space-y-2">
                    <span className="font-black text-xs text-slate-650 uppercase font-mono tracking-wider block">Lead Conversion workstation</span>
                    <p className="text-[10px] text-slate-505 leading-relaxed">Instantly transfers customer coordinates into qualified CRM Leads list, coordinates follow-ups and registers agent ownership.</p>
                    
                    <button
                      type="button"
                      onClick={() => handleConvertToLead(selectedInq)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                    >
                      <UserPlus className="h-4 w-4" /> CONVERT TO LEAD
                    </button>
                  </div>

                  {/* Site Walkthrough quick coordination */}
                  <form onSubmit={(e) => handleScheduleTour(e, selectedInq)} className="bg-purple-50 border border-purple-100 p-4 rounded-2xl text-xs space-y-2">
                    <span className="font-black text-xs text-slate-650 uppercase font-mono tracking-wider block">Walkthrough Tour Scheduling</span>
                    
                    <input
                      type="text"
                      required
                      value={schedPropTitle}
                      onChange={(e) => setSchedPropTitle(e.target.value)}
                      placeholder="e.g. JP Nagar gated Lot"
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs"
                    />

                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="date"
                        required
                        value={schedDate}
                        onChange={(e) => setSchedDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Time (eg. 2:00 PM)"
                        value={schedTime}
                        onChange={(e) => setSchedTime(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition text-center block cursor-pointer"
                    >
                      Schedule Walkthrough Tour
                    </button>
                  </form>

                </div>

              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
