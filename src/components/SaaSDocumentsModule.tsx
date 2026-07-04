import React, { useState, useMemo } from 'react';
import { 
  FileText, Search, Filter, Upload, Download, Eye, CheckCircle2, 
  XCircle, Trash2, Edit2, Share2, Printer, RefreshCw, Archive, 
  CornerDownRight, Calendar, User, Clock, Check, MoreVertical, AlertTriangle, Building
} from 'lucide-react';
import { Property, Agent, CRMLead, CustomRequirement } from '../types';

interface SaaSDocumentsModuleProps {
  properties: Property[];
  agents: Agent[];
  leads: CRMLead[];
  customRequirements: CustomRequirement[];
}

export interface CRMDocument {
  id: string;
  name: string;
  type: string; // 'Sale Deed' | 'Khata' | 'Encumbrance Certificate' | 'Tax Receipt' | 'Building Approval' | 'Aadhaar' | 'PAN' | 'Passport' | 'Loan Approval' | 'Legal Opinion' | etc.
  category: 'Property' | 'Customer' | 'Lead' | 'Legal' | 'Finance' | 'Booking' | 'Agreement' | 'Site Visit' | 'Agent' | string;
  propertyId?: string;
  propertyName?: string;
  customerName?: string;
  leadId?: string;
  requirementId?: string;
  uploadDate: string;
  uploadedBy: string;
  status: 'Draft' | 'Uploaded' | 'Pending Verification' | 'Verified' | 'Rejected' | 'Expired' | 'Archived' | 'Deleted';
  fileSize: string;
  version: number;
  expiryDate?: string;
  ownerName: string;
  notes?: string;
  history: Array<{ timestamp: string; action: string; user: string; notes?: string }>;
  verifiedBy?: string;
  verificationNotes?: string;
}

export default function SaaSDocumentsModule({
  properties,
  agents,
  leads,
  customRequirements
}: SaaSDocumentsModuleProps) {
  // Mock seed data connected to existing properties and clients
  const [documents, setDocuments] = useState<CRMDocument[]>(() => [
    {
      id: 'DOC-101',
      name: 'Sale Deed Agreement - Prestige Heights',
      type: 'Sale Deed',
      category: 'Property',
      propertyId: properties[0]?.id || 'prop-1',
      propertyName: properties[0]?.title || 'Prestige Lakeside Villa',
      customerName: 'Robert Sterling',
      leadId: 'LEAD-101',
      uploadDate: '25-May-2026',
      uploadedBy: 'Priya Sharma (Bespoke Advisor)',
      status: 'Verified',
      fileSize: '4.8 MB',
      version: 2,
      expiryDate: '2028-12-31',
      ownerName: 'Dvarix Realty Services',
      notes: 'Final cleared title deed scanned with municipal seal.',
      verifiedBy: 'Raghav Reddy',
      verificationNotes: 'All boundaries crosschecked from survey map.',
      history: [
        { timestamp: '25-May-2026 10:15 AM', action: 'Uploaded Version 1', user: 'Priya Sharma' },
        { timestamp: '25-May-2026 02:40 PM', action: 'Modified & Replaced V2', user: 'Priya Sharma', notes: 'Added missing stamp vendor papers.' },
        { timestamp: '26-May-2026 11:00 AM', action: 'Verified & Approved', user: 'Raghav Reddy', notes: 'Title verified matches survey ledger.' }
      ]
    },
    {
      id: 'DOC-102',
      name: 'Khata Certificate Registration',
      type: 'Khata',
      category: 'Legal',
      propertyId: properties[1]?.id || 'prop-2',
      propertyName: properties[1]?.title || 'Silicon Valley Smart Office',
      customerName: 'Clara Oswald',
      leadId: 'LEAD-102',
      uploadDate: '28-May-2026',
      uploadedBy: 'Anirudh Naidu (Villa Manager)',
      status: 'Pending Verification',
      fileSize: '2.1 MB',
      version: 1,
      expiryDate: '2030-01-01',
      ownerName: 'Clara Oswald',
      notes: 'Submitted A-Khata transfer papers for approvals assessment.',
      history: [
        { timestamp: '28-May-2026 04:22 PM', action: 'Uploaded Version 1', user: 'Anirudh Naidu' }
      ]
    },
    {
      id: 'DOC-103',
      name: 'Encumbrance Certificate - Whitefield Plot',
      type: 'Encumbrance Certificate',
      category: 'Property',
      propertyName: 'Whitefield Green Meadows',
      propertyId: 'PROP-909',
      customerName: 'Daniel Wright',
      requirementId: 'REQ-502',
      uploadDate: '30-May-2026',
      uploadedBy: 'Raghav Reddy (Super Admin)',
      status: 'Verified',
      fileSize: '1.4 MB',
      version: 1,
      expiryDate: '2027-05-15',
      ownerName: 'Srinivas Landcorp LLC',
      notes: 'No encumbrances recorded for the past 15 years.',
      verifiedBy: 'Raghav Reddy',
      history: [
        { timestamp: '30-May-2026 09:30 AM', action: 'Uploaded Version 1', user: 'Raghav Reddy' },
        { timestamp: '30-May-2026 10:00 AM', action: 'Verified & Approved', user: 'Raghav Reddy' }
      ]
    },
    {
      id: 'DOC-104',
      name: 'Tax Receipts FY 2025-26',
      type: 'Tax Receipt',
      category: 'Finance',
      propertyId: properties[2]?.id || 'prop-3',
      propertyName: properties[2]?.title || 'Crestwood Modernist Villa',
      customerName: 'Sophia Lin',
      uploadDate: '01-Jun-2026',
      uploadedBy: 'System Automation Hook',
      status: 'Verified',
      fileSize: '890 KB',
      version: 1,
      expiryDate: '2027-03-31',
      ownerName: 'Dvarix Realty Services',
      notes: 'Property assessment tax receipt completely cleared.',
      verifiedBy: 'Raghav Reddy',
      history: [
        { timestamp: '01-Jun-2026 00:05 AM', action: 'Uploaded via Tax API sync', user: 'System Automation' },
        { timestamp: '01-Jun-2026 10:00 AM', action: 'Verified & Approved', user: 'Raghav Reddy' }
      ]
    },
    {
      id: 'DOC-105',
      name: 'Official Brochure & Layout Plan - Crestwood',
      type: 'Layout Plan',
      category: 'Property',
      propertyId: properties[2]?.id || 'prop-3',
      propertyName: properties[2]?.title || 'Crestwood Modernist Villa',
      uploadDate: '02-Jun-2026',
      uploadedBy: 'Priya Sharma (Bespoke Advisor)',
      status: 'Draft',
      fileSize: '15.4 MB',
      version: 3,
      ownerName: 'Dvarix Marketing Team',
      notes: 'Eco-materials blueprint layouts and energy-star certificate brochures.',
      history: [
        { timestamp: '01-Jun-2026 11:20 AM', action: 'Uploaded Version 1', user: 'Priya Sharma' },
        { timestamp: '02-Jun-2026 09:12 AM', action: 'Replaced Version 2 Layouts', user: 'Priya Sharma' },
        { timestamp: '02-Jun-2026 03:45 PM', action: 'Updated Version 3 Brochures', user: 'Priya Sharma', notes: 'Compiled with thermal glass ratings page.' }
      ]
    },
    {
      id: 'DOC-106',
      name: 'Aadhaar Verification - Krish',
      type: 'Aadhaar',
      category: 'Customer',
      customerName: 'Krish Kumar',
      leadId: 'LEAD-949',
      uploadDate: '04-Jun-2026',
      uploadedBy: 'Rahul Kumar (Property Expert)',
      status: 'Expired',
      fileSize: '1.1 MB',
      version: 1,
      expiryDate: '2026-06-01',
      ownerName: 'Krish Kumar',
      notes: 'Identity card verification proof client file.',
      history: [
        { timestamp: '20-May-2026 01:10 PM', action: 'Uploaded Aadhaar card copy', user: 'Rahul Kumar' }
      ]
    },
    {
      id: 'DOC-107',
      name: 'PAN Copy - Sophia Lin',
      type: 'PAN',
      category: 'Customer',
      customerName: 'Sophia Lin',
      leadId: 'LEAD-002',
      uploadDate: '03-Jun-2026',
      uploadedBy: 'Anirudh Naidu (Villa Manager)',
      status: 'Rejected',
      fileSize: '450 KB',
      version: 1,
      ownerName: 'Sophia Lin',
      notes: 'Scanned tax PAN copy of the investor.',
      verifiedBy: 'Raghav Reddy',
      verificationNotes: 'Unreadable low-res scan document file. Requested client reupload fresh paper.',
      history: [
        { timestamp: '03-Jun-2026 12:44 PM', action: 'Uploaded Version 1', user: 'Anirudh Naidu' },
        { timestamp: '04-Jun-2026 10:30 AM', action: 'Rejected Paper', user: 'Raghav Reddy', notes: 'Image is blurred. Text and PAN code is unreadable.' }
      ]
    }
  ]);

  // Document Views States
  const [selectedDoc, setSelectedDoc] = useState<CRMDocument | null>(null);
  const [activeTab, setActiveTab] = useState<'Repository' | 'Upload' | 'Deleted/Archived' | 'Verification Feed'>('Repository');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Custom Expiry Notifications list simulation
  const [customNotifications, setCustomNotifications] = useState<string[]>([]);
  
  // Custom Categories list
  const docCategories = [
    'Property Documents', 'Customer Documents', 'Lead Documents', 
    'Legal Documents', 'Finance Documents', 'Booking Documents', 
    'Agreement Documents', 'Site Visit Documents', 'Marketing Documents', 'Agent Documents'
  ];

  const docTypesList = [
    'Sale Deed', 'Khata', 'Encumbrance Certificate', 'Tax Receipt', 
    'Building Approval', 'Layout Plan', 'Occupancy Certificate', 'Brochure',
    'Aadhaar', 'PAN', 'Passport', 'Address Proof', 'Loan Approval', 'Income Proof',
    'Legal Verification', 'Court Clearance', 'NOC', 'Government Approval', 'Agreement Deed'
  ];

  // Forms Upload State
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('Sale Deed');
  const [newDocCategory, setNewDocCategory] = useState('Property');
  const [newDocPropId, setNewDocPropId] = useState('');
  const [newDocCustName, setNewDocCustName] = useState('');
  const [newDocLeadId, setNewDocLeadId] = useState('');
  const [newDocOwner, setNewDocOwner] = useState('');
  const [newDocNotes, setNewDocNotes] = useState('');
  const [newDocExpiry, setNewDocExpiry] = useState('');
  const [newDocFile, setNewDocFile] = useState<any>(null);
  const [customCategoryName, setCustomCategoryName] = useState('');
  
  // Edit Form state
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editDocName, setEditDocName] = useState('');
  const [editDocType, setEditDocType] = useState('');
  const [editDocOwner, setEditDocOwner] = useState('');

  // Rejection Reason popup
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Computations
  const computedDaysRemaining = (dateStr?: string) => {
    if (!dateStr) return null;
    const exp = new Date(dateStr);
    const today = new Date();
    const diff = exp.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days;
  };

  // Filter logic
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      // Trash logic
      const isDeletedTab = activeTab === 'Deleted/Archived';
      if (isDeletedTab) {
        if (doc.status !== 'Deleted' && doc.status !== 'Archived') return false;
      } else {
        if (doc.status === 'Deleted' || doc.status === 'Archived') return false;
      }

      // Verification tab filter
      if (activeTab === 'Verification Feed' && doc.status !== 'Pending Verification') {
        return false;
      }

      // Query filter
      const term = searchQuery.toLowerCase();
      const matchesSearch = 
        doc.name.toLowerCase().includes(term) ||
        doc.id.toLowerCase().includes(term) ||
        doc.type.toLowerCase().includes(term) ||
        (doc.propertyName || '').toLowerCase().includes(term) ||
        (doc.propertyId || '').toLowerCase().includes(term) ||
        (doc.customerName || '').toLowerCase().includes(term) ||
        (doc.leadId || '').toLowerCase().includes(term) ||
        (doc.ownerName || '').toLowerCase().includes(term);

      // Category filter
      let matchesCat = true;
      if (categoryFilter !== 'All') {
        const cleanCat = categoryFilter.replace(' Documents', '').toLowerCase();
        matchesCat = doc.category.toLowerCase().includes(cleanCat);
      }

      // Status filter
      let matchesStatus = true;
      if (statusFilter !== 'All' && activeTab === 'Repository') {
        if (statusFilter === 'Verified') matchesStatus = doc.status === 'Verified';
        if (statusFilter === 'Pending') matchesStatus = doc.status === 'Pending Verification';
        if (statusFilter === 'Rejected') matchesStatus = doc.status === 'Rejected';
        if (statusFilter === 'Expired') matchesStatus = doc.status === 'Expired';
      }

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [documents, searchQuery, categoryFilter, statusFilter, activeTab]);

  // Handlers
  const handleVerify = (id: string, notes?: string) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === id) {
        const timestamp = new Date().toLocaleString();
        return {
          ...d,
          status: 'Verified',
          verifiedBy: 'Dvarix Super Admin',
          verificationNotes: notes || 'Document verified & certified matching legal clearances registry.',
          history: [
            ...d.history,
            { timestamp, action: 'Document Approved & Verified', user: 'Dvarix Super Admin', notes: notes || 'Legally cleared.' }
          ]
        };
      }
      return d;
    }));
    triggerNotice(`Document ID ${id} was verified.`);
    if (selectedDoc?.id === id) {
      setSelectedDoc(null);
    }
  };

  const handleReject = (id: string, reason: string) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === id) {
        const timestamp = new Date().toLocaleString();
        return {
          ...d,
          status: 'Rejected',
          verifiedBy: 'Dvarix Super Admin',
          verificationNotes: reason,
          history: [
            ...d.history,
            { timestamp, action: 'Document Rejected', user: 'Dvarix Super Admin', notes: reason }
          ]
        };
      }
      return d;
    }));
    setRejectId(null);
    setRejectReason('');
    triggerNotice(`Document ID ${id} was rejected: "${reason}"`);
    if (selectedDoc?.id === id) {
      setSelectedDoc(null);
    }
  };

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === id) {
        const timestamp = new Date().toLocaleString();
        return {
          ...d,
          status: 'Deleted',
          history: [
            ...d.history,
            { timestamp, action: 'Moved to Trash Bin (Soft Deleted)', user: 'Dvarix Super Admin' }
          ]
        };
      }
      return d;
    }));
    triggerNotice(`Document ${id} moved to Trash bin.`);
    if (selectedDoc?.id === id) {
      setSelectedDoc(null);
    }
  };

  const handlePermanentRemove = (id: string) => {
    if (confirm(`Are you sure you want to permanently remove document ${id} from system vaults? This is irreversible.`)) {
      setDocuments(prev => prev.filter(d => d.id !== id));
      triggerNotice(`Permanently deleted document ${id}.`);
    }
  };

  const handleArchive = (id: string) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === id) {
        const timestamp = new Date().toLocaleString();
        return {
          ...d,
          status: 'Archived',
          history: [
            ...d.history,
            { timestamp, action: 'Document Archived', user: 'Dvarix Super Admin' }
          ]
        };
      }
      return d;
    }));
    triggerNotice(`Archived document ${id}.`);
  };

  const handleRestore = (id: string) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === id) {
        const timestamp = new Date().toLocaleString();
        return {
          ...d,
          status: 'Uploaded',
          history: [
            ...d.history,
            { timestamp, action: 'Restored from Archives/Trash', user: 'Dvarix Super Admin' }
          ]
        };
      }
      return d;
    }));
    triggerNotice(`Restored document ${id} from Trash/Archives.`);
  };

  const triggerNotice = (msg: string) => {
    setCustomNotifications(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 5));
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName) return;

    // Link Property Name matching selected propertyId
    let propName = 'N/A';
    if (newDocPropId) {
      const match = properties.find(p => p.id === newDocPropId);
      propName = match ? match.title : newDocPropId;
    }

    const docId = 'DOC-' + Math.floor(100 + Math.random() * 900);
    const newDoc: CRMDocument = {
      id: docId,
      name: newDocName,
      type: newDocType,
      category: newDocCategory,
      propertyId: newDocPropId || undefined,
      propertyName: newDocPropId ? propName : undefined,
      customerName: newDocCustName || undefined,
      leadId: newDocLeadId || undefined,
      uploadDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      uploadedBy: 'Dvarix Super Admin (Upload)',
      status: 'Pending Verification',
      fileSize: newDocFile ? `${(newDocFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.5 MB',
      version: 1,
      expiryDate: newDocExpiry || undefined,
      ownerName: newDocOwner || 'Dvarix Realty Services',
      notes: newDocNotes,
      history: [
        { timestamp: new Date().toLocaleString(), action: 'Uploaded Document Ledger File', user: 'Dvarix Super Admin' }
      ]
    };

    setDocuments(prev => [newDoc, ...prev]);
    triggerNotice(`Uploaded document ${newDocName} assigned ID ${docId}.`);
    
    // Reset Form
    setNewDocName('');
    setNewDocOwner('');
    setNewDocNotes('');
    setNewDocExpiry('');
    setNewDocPropId('');
    setNewDocCustName('');
    setNewDocLeadId('');
    setNewDocFile(null);
    setActiveTab('Repository');
  };

  const triggerDocumentReplace = (id: string, fileName: string, size?: number) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === id) {
        const timestamp = new Date().toLocaleString();
        const nextVer = d.version + 1;
        return {
          ...d,
          name: fileName ? `Replaced - ${fileName}` : d.name,
          version: nextVer,
          fileSize: size ? `${(size / (1024 * 1024)).toFixed(1)} MB` : '2.0 MB',
          status: 'Pending Verification',
          history: [
            ...d.history,
            { timestamp, action: `Uploaded & Replaced Version ${nextVer}`, user: 'Dvarix Super Admin' }
          ]
        };
      }
      return d;
    }));
    triggerNotice(`Form document id ${id} was Replaced with a new file layout.`);
  };

  return (
    <div className="space-y-6 text-left" id="saa-documents-module">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" /> Authorized Central Document Vault
          </h2>
          <p className="text-xs text-slate-500">
            Secure clearance deed registry linked explicitly to system properties, clients, leads, and custom requirements.
          </p>
        </div>

        {/* SUB NAV CONTROL HEADERS */}
        <div className="flex flex-wrap gap-1 bg-slate-100 rounded-xl p-0.5 border border-slate-200">
          {(['Repository', 'Upload', 'Verification Feed', 'Deleted/Archived'] as const).map((tab) => {
            const countPending = documents.filter(d => d.status === 'Pending Verification').length;
            return (
              <button
                key={tab}
                id={`doc-tab-${tab.toLowerCase().replace('/', '-')}`}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedDoc(null);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer relative flex items-center gap-1.5 ${
                  activeTab === tab ? 'bg-white shadow-xs text-blue-600 font-black' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab}
                {tab === 'Verification Feed' && countPending > 0 && (
                  <span className="bg-amber-500 text-white font-mono font-extrabold text-[8px] h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                    {countPending}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* RECENT NOTIFICATIONS PANEL SIMULATION */}
      {customNotifications.length > 0 && (
        <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl">
          <span className="text-[8px] font-mono font-black text-blue-700 uppercase tracking-widest block mb-1">Live Notifications Console</span>
          <div className="space-y-1">
            {customNotifications.map((not, idx) => (
              <p key={idx} className="text-[10px] text-slate-600 font-mono flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" /> {not}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* MAIN RENDER GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: DOC LISTS & CONTROLS */}
        <div className={`${selectedDoc ? 'xl:col-span-8' : 'xl:col-span-12'} space-y-4`}>
          
          {/* FILTER CRITERIA ON REPOSITORY TAB */}
          {activeTab === 'Repository' && (
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-wrap gap-3 items-center justify-between shadow-2xs">
              <div className="flex flex-1 min-w-[240px] items-center relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Query by document ID, customer name, property address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 text-slate-800"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Categories filtering select */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="border border-slate-200 p-1.5 rounded-lg text-xs font-bold text-slate-600 bg-slate-50 focus:outline-none focus:border-blue-500"
                >
                  <option value="All">All Categories Documents</option>
                  <option value="Property">Property Documents</option>
                  <option value="Customer">Customer Documents</option>
                  <option value="Legal">Legal Documents</option>
                  <option value="Finance">Finance Documents</option>
                </select>

                {/* Statuses filtering select */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-slate-200 p-1.5 rounded-lg text-xs font-bold text-slate-600 bg-slate-50 focus:outline-none focus:border-blue-500"
                >
                  <option value="All">All Verification Statuses</option>
                  <option value="Verified">Verified Documents</option>
                  <option value="Pending">Pending Approvals</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>
          )}

          {/* RENDERING UPLOAD FORM TAB */}
          {activeTab === 'Upload' && (
            <form onSubmit={handleUploadSubmit} className="bg-white border border-slate-200 p-6 rounded-2xl max-w-3xl mx-auto space-y-6 shadow-xs">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-800 text-sm">Centralized Document Record Registration</h3>
                <p className="text-xs text-slate-500">Provide direct linking anchors to associate upload file against active CRM records</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-1 text-xs md:col-span-2">
                  <label className="font-bold text-slate-500 uppercase block">Document Display Name *</label>
                  <input
                    type="text" required value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    placeholder="e.g. Sale Deed Original Scan Copy"
                    className="w-full border border-slate-200 p-2.5 rounded-lg text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-500 uppercase block">Document Legal Type *</label>
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value)}
                    className="w-full border border-slate-200 p-2.5 rounded-lg text-xs text-slate-800 bg-white"
                  >
                    {docTypesList.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-400 uppercase block">Category Folder Placement *</label>
                  <select
                    value={newDocCategory}
                    onChange={(e) => setNewDocCategory(e.target.value)}
                    className="w-full border border-slate-200 p-2.5 rounded-lg text-xs text-slate-800 bg-white"
                  >
                    <option value="Property">Property Documents</option>
                    <option value="Customer">Customer Documents</option>
                    <option value="Lead">Lead Documents</option>
                    <option value="Legal">Legal Documents</option>
                    <option value="Finance">Finance Documents</option>
                  </select>
                </div>

                <div className="border-t border-dashed border-slate-150 pt-3 md:col-span-2 text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                  Linking CRM Anchors (Specify linkages below to sync document display metadata)
                </div>

                {/* Property linkage dropdown selector */}
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-500 uppercase block">Link Against Active Property</label>
                  <select
                    value={newDocPropId}
                    onChange={(e) => setNewDocPropId(e.target.value)}
                    className="w-full border border-slate-200 p-2.5 rounded-lg text-xs text-slate-00 bg-white"
                  >
                    <option value="">-- No Property Linkage --</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>{p.title} (ID: {p.id})</option>
                    ))}
                    <option value="PROP-909">Independent Sarjapur Plot (ID: PROP-909)</option>
                  </select>
                </div>

                {/* Patient/Customer linkage text entry */}
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-500 uppercase block">Linked Customer Name</label>
                  <input
                    type="text" value={newDocCustName}
                    onChange={(e) => setNewDocCustName(e.target.value)}
                    placeholder="e.g. Krish Kumar"
                    className="w-full border border-slate-200 p-2.5 rounded-lg text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-500 uppercase block">Associated Lead ID / Requirement ID</label>
                  <input
                    type="text" value={newDocLeadId}
                    onChange={(e) => setNewDocLeadId(e.target.value)}
                    placeholder="e.g. LEAD-105 or REQ-552"
                    className="w-full border border-slate-200 p-2.5 rounded-lg text-xs text-slate-800"
                  />
                </div>

                {/* Document Expiry Field */}
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-500 uppercase block">Document Expiry Date (if applicable)</label>
                  <input
                    type="date" value={newDocExpiry}
                    onChange={(e) => setNewDocExpiry(e.target.value)}
                    className="w-full border border-slate-200 p-2.5 rounded-lg text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-500 uppercase block">Document Owner / Stakeholder *</label>
                  <input
                    type="text" required value={newDocOwner}
                    onChange={(e) => setNewDocOwner(e.target.value)}
                    placeholder="e.g. Dvarix Realty Services or Client Name"
                    className="w-full border border-slate-200 p-2.5 rounded-lg text-xs text-slate-800"
                  />
                </div>

                {/* Direct File Attachment simulator mockup */}
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-500 uppercase block">Attach File (PDF, DOCX, JPG, ZIP) *</label>
                  <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-3 text-center cursor-pointer bg-slate-50 hover:bg-white transition duration-150">
                    <input 
                      type="file" 
                      id="doc-attachment-file" 
                      className="hidden" 
                      onChange={(e) => setNewDocFile(e.target.files?.[0] || null)}
                    />
                    <div 
                      onClick={() => document.getElementById('doc-attachment-file')?.click()}
                      className="flex flex-col items-center justify-center space-y-1"
                    >
                      <Upload className="h-5 w-5 text-slate-400" />
                      <span className="text-[11px] font-semibold text-slate-700">
                        {newDocFile ? `Selected: ${newDocFile.name}` : 'Drag & Drop or Click to attach document file'}
                      </span>
                      <span className="text-[9px] text-slate-400">PDF, DOCX up to 25MB</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs md:col-span-2">
                  <label className="font-bold text-slate-500 uppercase block">Internal Audit / Verification Notes</label>
                  <textarea
                    rows={3}
                    value={newDocNotes}
                    onChange={(e) => setNewDocNotes(e.target.value)}
                    placeholder="Enter special warnings, government stamp parameters, Khata subdivision details..."
                    className="w-full border border-slate-200 p-2.5 rounded-lg text-xs text-slate-800 resize-none font-sans"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('Repository')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                >
                  Confirm & Upload to Security Vault
                </button>
              </div>
            </form>
          )}

          {/* LISTING DOCUMENTS FOR REPOSITORY, PENDING VERIFICATION, TRASH TAB */}
          {activeTab !== 'Upload' && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              {filteredDocs.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <FileText className="h-10 w-10 text-slate-300 mx-auto" />
                  <p className="text-slate-400 text-xs font-bold font-mono">No matching document credentials found in vault archives.</p>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('All');
                      setStatusFilter('All');
                    }}
                    className="text-xs text-blue-600 hover:underline font-bold"
                  >
                    Clear Search Filters
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-extrabold uppercase font-mono tracking-wider">
                        <th className="p-3">Reference & Linking Metadata</th>
                        <th className="p-3">Doc Type & Cat</th>
                        <th className="p-3">Linked Property</th>
                        <th className="p-3">Customer Link</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">File Metrics</th>
                        <th className="p-3 text-right">Vault Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDocs.map((doc) => {
                        const daysLeft = computedDaysRemaining(doc.expiryDate);
                        
                        return (
                          <tr key={doc.id} className="hover:bg-slate-50/40 transition">
                            {/* Doc details */}
                            <td className="p-3">
                              <div className="flex items-start gap-2 max-w-sm">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 self-center">
                                  <FileText className="h-4.5 w-4.5" />
                                </div>
                                <div className="overflow-hidden">
                                  {editingDocId === doc.id ? (
                                    <div className="flex items-center gap-1.5 py-1">
                                      <input 
                                        type="text" 
                                        value={editDocName} 
                                        onChange={(e) => setEditDocName(e.target.value)}
                                        className="border border-slate-300 p-1 text-[10px] rounded"
                                      />
                                      <button 
                                        onClick={() => {
                                          setDocuments(prev => prev.map(d => d.id === doc.id ? {...d, name: editDocName} : d));
                                          setEditingDocId(null);
                                          triggerNotice(`Renamed document ${doc.id}`);
                                        }}
                                        className="p-1 px-2 bg-blue-600 text-white rounded font-bold"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  ) : (
                                    <span 
                                      onClick={() => setSelectedDoc(doc)}
                                      className="font-bold text-slate-800 block hover:text-blue-600 cursor-pointer truncate max-w-[200px]"
                                    >
                                      {doc.name}
                                    </span>
                                  )}
                                  <span className="text-[9px] font-mono text-slate-400 block">ID: {doc.id} • Owner: {doc.ownerName}</span>
                                </div>
                              </div>
                            </td>

                            {/* Doc Type */}
                            <td className="p-3">
                              <span className="font-semibold text-slate-700 block">{doc.type}</span>
                              <span className="text-[9px] font-mono text-slate-450 block">{doc.category}</span>
                            </td>

                            {/* Property details linkage */}
                            <td className="p-3">
                              {doc.propertyName ? (
                                <div className="max-w-[130px]">
                                  <span className="font-semibold text-slate-700 truncate block text-[11px]" title={doc.propertyName}>
                                    {doc.propertyName}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-mono block">Code: {doc.propertyId}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 font-mono text-[9px] block">Unassigned</span>
                              )}
                            </td>

                            {/* Customer details linkage */}
                            <td className="p-3">
                              {doc.customerName ? (
                                <div>
                                  <span className="font-bold text-slate-705 block">{doc.customerName}</span>
                                  {doc.leadId && <span className="text-[9px] text-[#ff5a3c] font-mono block">Lead: {doc.leadId}</span>}
                                </div>
                              ) : (
                                <span className="text-slate-400 font-mono text-[9px] block">Unlinked</span>
                              )}
                            </td>

                            {/* Verification status badge */}
                            <td className="p-3">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border inline-block ${
                                doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                doc.status === 'Pending Verification' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' :
                                doc.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-250' :
                                doc.status === 'Expired' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                'bg-slate-50 text-slate-600 border-slate-205'
                              }`}>
                                {doc.status}
                              </span>

                              {/* Live counter countdown */}
                              {doc.expiryDate && (
                                <span className="block text-[8px] font-mono text-slate-400 mt-1 font-bold">
                                  {daysLeft !== null && daysLeft > 0 ? (
                                    <span className={`${daysLeft < 30 ? 'text-orange-600' : 'text-slate-500'}`}>
                                      ⌛ {daysLeft} Days Remaining
                                    </span>
                                  ) : (
                                    <span className="text-red-600 font-bold">☠ ENTIRELY EXPIRED!</span>
                                  )}
                                </span>
                              )}
                            </td>

                            {/* Size metrics */}
                            <td className="p-3 font-mono text-[10px] text-slate-500">
                              <span className="block">{doc.fileSize}</span>
                              <span className="text-[9px] font-bold text-slate-400 block font-mono">v{doc.version}</span>
                            </td>

                            {/* Actions controls */}
                            <td className="p-3 text-right">
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => setSelectedDoc(doc)}
                                  className="p-1 px-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 text-slate-600 rounded transition font-bold"
                                  title="View document metadata preview details"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>

                                {activeTab === 'Deleted/Archived' ? (
                                  <>
                                    <button
                                      onClick={() => handleRestore(doc.id)}
                                      className="p-1 px-2 border border-slate-200 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 font-bold"
                                    >
                                      Restore
                                    </button>
                                    <button
                                      onClick={() => handlePermanentRemove(doc.id)}
                                      className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                                      title="Permanently Delete"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    {doc.status === 'Pending Verification' && (
                                      <button
                                        onClick={() => handleVerify(doc.id)}
                                        className="p-1 px-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-705 rounded text-[10px] font-black"
                                        title="Instantly Approve"
                                      >
                                        Approve
                                      </button>
                                    )}

                                    {/* Action dropdown button panel */}
                                    <div className="relative group">
                                      <button className="p-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded">
                                        <MoreVertical className="h-3.5 w-3.5" />
                                      </button>
                                      {/* Dropdown panel */}
                                      <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-md py-1.5 z-30 hidden group-hover:block text-left text-[11px] font-semibold text-slate-700">
                                        <button 
                                          onClick={() => {
                                            setEditingDocId(doc.id);
                                            setEditDocName(doc.name);
                                            setEditDocType(doc.type);
                                            setEditDocOwner(doc.ownerName);
                                          }}
                                          className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-1 border-0"
                                        >
                                          <Edit2 className="h-3 w-3 text-slate-400" /> Rename / Edit
                                        </button>
                                        
                                        <button 
                                          onClick={() => {
                                            const fileInput = document.createElement('input');
                                            fileInput.type = 'file';
                                            fileInput.onchange = (e) => {
                                              const file = (e.target as any).files?.[0];
                                              if (file) {
                                                triggerDocumentReplace(doc.id, file.name, file.size);
                                              }
                                            };
                                            fileInput.click();
                                          }}
                                          className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-1 border-0"
                                        >
                                          <RefreshCw className="h-3 w-3 text-slate-400" /> Replace File
                                        </button>

                                        <button 
                                          onClick={() => alert(`Simulating file download of: ${doc.name} (${doc.fileSize})`)}
                                          className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-1 border-0"
                                        >
                                          <Download className="h-3 w-3 text-slate-400" /> Download
                                        </button>

                                        <button 
                                          onClick={() => alert(`Crm document link generated. Copied to Clipboard!`)}
                                          className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-1 border-0"
                                        >
                                          <Share2 className="h-3 w-3 text-blue-500" /> Share Doc
                                        </button>

                                        {doc.status === 'Pending Verification' && (
                                          <button 
                                            onClick={() => setRejectId(doc.id)}
                                            className="w-full px-3 py-1.5 text-left hover:bg-slate-50 text-rose-600 flex items-center gap-1 border-0 font-bold"
                                          >
                                            <XCircle className="h-3 w-3 text-rose-500 animate-pulse" /> Reject
                                          </button>
                                        )}

                                        <button 
                                          onClick={() => handleArchive(doc.id)}
                                          className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-1 border-0"
                                        >
                                          <Archive className="h-3 w-3 text-slate-400" /> Archive File
                                        </button>

                                        <div className="border-t border-slate-100 my-1"></div>

                                        <button 
                                          onClick={() => handleDelete(doc.id)}
                                          className="w-full px-3 py-1.5 text-left hover:bg-slate-50 text-rose-600 flex items-center gap-1 border-0 font-bold"
                                        >
                                          <Trash2 className="h-3 w-3 text-rose-500" /> Soft Delete
                                        </button>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: PREVIEW PANEL (Opens automatically when selected) */}
        {selectedDoc && (
          <div className="xl:col-span-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-lg space-y-4 animate-in slide-in-from-right-3 duration-250 text-xs text-slate-700">
            <div className="flex justify-between items-start pb-2 border-b border-slate-100">
              <div>
                <span className="text-[9px] uppercase font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                  {selectedDoc.category} Document
                </span>
                <h4 className="font-extrabold text-slate-900 text-sm tracking-tight mt-1 truncate max-w-[200px]">{selectedDoc.name}</h4>
              </div>
              <button 
                onClick={() => setSelectedDoc(null)}
                className="p-1 text-slate-450 hover:bg-slate-100 rounded-lg text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Simulated file type visually */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center space-y-2 relative overflow-hidden">
              <FileText className="h-12 w-12 text-blue-600 animate-pulse" />
              <div className="space-y-0.5">
                <span className="font-mono font-bold text-slate-800 text-xs tracking-tight uppercase block">{selectedDoc.type}</span>
                <span className="text-[10px] text-slate-400 font-mono">Format: PDF (A-Khata Sealed Layouts)</span>
              </div>
              <span className="absolute bottom-2 right-2 text-[8px] text-slate-400 font-mono uppercase font-black">Secure Vault v{selectedDoc.version}</span>
            </div>

            {/* Display Link Info Metadata */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider text-slate-450 font-mono">Linked CRM Records</h5>
              <div className="space-y-1.5 font-sans">
                {selectedDoc.propertyName && (
                  <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-105">
                    <span className="text-slate-550 font-bold block">Linked Property:</span>
                    <span className="font-semibold text-slate-800 text-right">{selectedDoc.propertyName}</span>
                  </div>
                )}
                {selectedDoc.customerName && (
                  <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-105">
                    <span className="text-slate-550 font-bold block">Customer:</span>
                    <span className="font-semibold text-slate-800 text-right">{selectedDoc.customerName}</span>
                  </div>
                )}
                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-105">
                  <span className="text-slate-550 font-bold block">Stakeholder Owner:</span>
                  <span className="font-semibold text-slate-800 text-right">{selectedDoc.ownerName}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-105">
                  <span className="text-slate-550 font-bold block">Uploaded By:</span>
                  <span className="font-semibold text-slate-850 text-right text-[10px] truncate max-w-[150px]">{selectedDoc.uploadedBy}</span>
                </div>
              </div>
            </div>

            {/* Verification decision parameters */}
            <div className="space-y-2 bg-blue-50/20 p-3 rounded-xl border border-blue-50">
              <div className="flex justify-between items-center text-[11px]">
                <h5 className="font-extrabold text-blue-900 font-mono uppercase">Verification Status</h5>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedDoc.status === 'Verified' ? 'bg-emerald-50 text-emerald-800' :
                  selectedDoc.status === 'Pending Verification' ? 'bg-amber-100 text-amber-800 animate-bounce' :
                  'bg-rose-50 text-rose-800'
                }`}>
                  {selectedDoc.status}
                </span>
              </div>

              {selectedDoc.verificationNotes ? (
                <p className="text-[10px] text-slate-600 bg-white p-2 border border-slate-200 rounded leading-relaxed">
                  <strong>Notes:</strong> {selectedDoc.verificationNotes}
                </p>
              ) : (
                <p className="text-[10px] text-slate-450 italic">No verification comments recorded.</p>
              )}

              {selectedDoc.status === 'Pending Verification' && (
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => handleVerify(selectedDoc.id)}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer transition text-xs"
                  >
                    Verify & Legalize
                  </button>
                  <button 
                    onClick={() => setRejectId(selectedDoc.id)}
                    className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg cursor-pointer transition text-xs"
                  >
                    Reject Scan
                  </button>
                </div>
              )}
            </div>

            {/* Version timeline history trail */}
            <div className="space-y-1.5">
              <h5 className="font-extrabold text-slate-450 uppercase text-[10px] font-mono">Version Timeline Trails</h5>
              <div className="space-y-2 pl-3 border-l-2 border-slate-100">
                {selectedDoc.history.map((hist, idx) => (
                  <div key={idx} className="relative space-y-0.5">
                    <div className="absolute -left-[17px] top-1 h-2 w-2 rounded-full bg-blue-600"></div>
                    <span className="text-[9px] font-extrabold text-slate-400 font-mono block">{hist.timestamp}</span>
                    <span className="font-bold text-slate-700 block">{hist.action}</span>
                    <span className="text-[10px] text-slate-500 block">Operator: {hist.user} {hist.notes && `• "${hist.notes}"`}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => {
                window.print();
              }}
              className="w-full py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            >
              <Printer className="h-3.5 w-3.5" /> Print Certification Sheet
            </button>
          </div>
        )}
      </div>

      {/* REJECTION POPUP FORM */}
      {rejectId && (
        <div className="fixed inset-0 bg-slate-950/40 opacity-100 backdrop-blur-2xs flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-205 p-6 rounded-2xl max-w-sm w-full mx-4 space-y-4 text-left shadow-2xl">
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-sm">Reason for Document Rejection</h4>
              <p className="text-[11px] text-slate-500">Provide feedback notes explaining why the document scan cannot be validated legal clean.</p>
            </div>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Scans are blurry or incorrect Khata subdivision number."
              className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-sans resize-none focus:outline-none focus:border-blue-500 bg-slate-50"
            />

            <div className="flex gap-2 justify-end">
              <button 
                type="button"
                onClick={() => setRejectId(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => handleReject(rejectId, rejectReason || 'Low resolution blurred scanning document.')}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-xs cursor-pointer"
              >
                Reject Document File
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
