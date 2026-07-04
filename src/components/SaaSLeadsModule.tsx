import React, { useState, useMemo } from 'react';
import { 
  Users, Plus, Search, Filter, ArrowUpDown, Download, Upload, 
  UserPlus, CheckCircle2, AlertCircle, Phone, MessageSquare, 
  Calendar, Clock, FileText, BarChart2, TrendingUp, HelpCircle, 
  Trash2, Edit, ChevronRight, Check, Award, ArrowRight, Notebook, 
  MapPin, DollarSign, Activity, Settings, UserCheck, RefreshCw
} from 'lucide-react';
import { Agent, CRMLead, LeadActivity, LeadFollowUp } from '../types';

export function getDefaultLeads(agents: Agent[]): CRMLead[] {
  const a1 = agents[0]?.id || '1';
  const a1N = agents[0]?.name || 'Rahul Kumar';
  const a2 = agents[1]?.id || '2';
  const a2N = agents[1]?.name || 'Arjun Mehta';
  const a3 = agents[2]?.id || '3';
  const a3N = agents[2]?.name || 'Neha Sharma';
  
  return [
    {
      id: 'lead-1',
      name: 'Aditya Vardhan Hegde',
      mobile: '+91 9845012345',
      email: 'aditya.hegde@outlook.com',
      propertyRequirement: 'Premium Lake Hills Villa 4 BHK',
      budget: '₹ 4.80 Cr',
      preferredLocation: 'Whitefield Corridor',
      source: 'Custom Request Form',
      status: 'New',
      createdAt: '2026-06-01T10:30:00Z',
      notes: {
        internal: 'Client is an executive at Infosys Whitefield. Looking for immediate closure.',
        agent: 'Contacted over email. Preferred callback on Saturday morning.',
        customer: 'Wants premium security and private solar backup grids.'
      },
      followUps: [
        { id: 'f-1-1', dateTime: '2026-06-06T11:00:00', notes: 'Call to review blueprint maps', completed: false }
      ],
      activities: [
        { id: 'a-1-1', type: 'Status Change', content: 'Lead ingested from Custom Request Form', timestamp: '2026-06-01 10:30' }
      ]
    },
    {
      id: 'lead-2',
      name: 'Dr. Meera Krishnan',
      mobile: '+91 9123456789',
      email: 'meera.krish@fortishospitals.org',
      propertyRequirement: 'Independent Super luxury House plot',
      budget: '₹ 3.20 Cr',
      preferredLocation: 'JP Nagar Sector 4',
      source: 'Website',
      status: 'Contacted',
      agentId: a1,
      agentName: a1N,
      createdAt: '2026-05-28T14:15:00Z',
      notes: {
        internal: 'Requires space for setting up a private family clinic on the ground floor.',
        agent: 'Explained zoning permissions and layout blueprints.',
        customer: 'Must be near a major arterial highway with direct subway reach.'
      },
      followUps: [
        { id: 'f-2-1', dateTime: '2026-06-05T15:30:00', notes: 'Physical layout presentation', completed: true },
        { id: 'f-2-2', dateTime: '2026-06-08T10:00:00', notes: 'Dispatch revised zone certificates', completed: false }
      ],
      activities: [
        { id: 'a-2-1', type: 'Call', content: 'Outbound introductory call cleared. Client highly cooperative.', timestamp: '2026-05-28 15:00' },
        { id: 'a-2-2', type: 'Status Change', content: 'Status moved to Contacted', timestamp: '2026-05-28 15:05' }
      ]
    },
    {
      id: 'lead-3',
      name: 'Rohan Deshmukh',
      mobile: '+91 9300984855',
      email: 'rohan@deshmukh-ventures.com',
      propertyRequirement: 'Corporate Penthouse Luxury Office',
      budget: '₹ 8.50 Cr',
      preferredLocation: 'Indiranagar Main',
      source: 'WhatsApp',
      status: 'Qualified',
      agentId: a2,
      agentName: a2N,
      createdAt: '2026-05-25T09:00:00Z',
      notes: {
        internal: 'Tech venture capital firm looking to migrate their primary Bangalore HQ.',
        agent: 'Checked tech infrastructure. High speed fiber feeds available.',
        customer: 'Needs high clearance ceiling height and triple executive parking bays.'
      },
      followUps: [
        { id: 'f-3-1', dateTime: '2026-06-07T16:00:00', notes: 'Zoning clearance review meeting', completed: false }
      ],
      activities: [
        { id: 'a-3-1', type: 'WhatsApp', content: 'Shared PDF brochure of Commercial Plaza JP Nagar', timestamp: '2026-05-25 09:40' },
        { id: 'a-3-2', type: 'Meeting', content: 'Met at Indiranagar Coffee Day to establish mutual terms', timestamp: '2026-05-27 16:30' }
      ]
    },
    {
      id: 'lead-4',
      name: 'Suhail Ahmed Khan',
      mobile: '+91 8884930129',
      email: 'suhail@khan-ventures.in',
      propertyRequirement: 'Commercial Office Space 8000 Sqft',
      budget: '₹ 12.0 Cr',
      preferredLocation: 'Hebbal Ring Road Belt',
      source: 'Facebook',
      status: 'Site Visit Scheduled',
      agentId: a1,
      agentName: a1N,
      createdAt: '2026-05-22T16:30:00Z',
      notes: {
        internal: 'Relocating software team from Singapore. Super critical lead.',
        agent: 'Arranged elite chauffeur service for direct site pickup coordinate.',
        customer: 'Wants state-of-the-art climate controls and double cafeteria space.'
      },
      followUps: [
        { id: 'f-4-1', dateTime: '2026-06-05T14:00:00', notes: 'Elite site walk walkthrough', completed: false }
      ],
      activities: [
        { id: 'a-4-1', type: 'Status Change', content: 'Moved from Qualified to Site Visit Scheduled', timestamp: '2026-05-24 11:30' }
      ]
    },
    {
      id: 'lead-5',
      name: 'Pranab & Shalini Roy',
      mobile: '+91 7600123984',
      email: 'pranab.roy@wipro.com',
      propertyRequirement: '3 BHK High-rise Modern Apartment',
      budget: '₹ 2.10 Cr',
      preferredLocation: 'Whitefield Corridor',
      source: 'Instagram',
      status: 'Negotiation',
      agentId: a3,
      agentName: a3N,
      createdAt: '2026-05-15T11:00:00Z',
      notes: {
        internal: 'Joint family looking for direct high-rise ventilation with lake lookouts.',
        agent: 'Offered special 1.5% brokerage concessions if closed within month end.',
        customer: 'Stiffly negotiating on carpet area calculations.'
      },
      followUps: [
        { id: 'f-5-1', dateTime: '2026-06-09T12:30:00', notes: 'Final ledger clearance and signature parameters', completed: false }
      ],
      activities: [
        { id: 'a-5-1', type: 'Site Visit', content: 'Completed walk around Whitefield Tower Block 12', timestamp: '2026-05-18 15:00' },
        { id: 'a-5-2', type: 'Status Change', content: 'Transitioned directly into active negotiation ledger', timestamp: '2026-05-20 18:22' }
      ]
    },
    {
      id: 'lead-6',
      name: 'Venkatesh Prasad',
      mobile: '+91 9448098177',
      email: 'v.prasad@prasad-builders.com',
      propertyRequirement: 'Farmland plot development 2 Acres',
      budget: '₹ 5.50 Cr',
      preferredLocation: 'Devanahalli Airport Belt',
      source: 'Phone Call',
      status: 'Closed Won',
      agentId: a2,
      agentName: a2N,
      createdAt: '2026-04-10T10:00:00Z',
      notes: {
        internal: 'Agri-tourism development planned on the site. Complete documentation in file.',
        agent: 'Final registration complete with Sub-registrar Devanahalli.',
        customer: 'Exceedingly grateful for clean title clearance deeds.'
      },
      activities: [
        { id: 'a-6-1', type: 'Status Change', content: 'Status completed: CLOSED WON', timestamp: '2026-05-05 16:45' }
      ]
    }
  ];
}

interface SaaSLeadsModuleProps {
  agents: Agent[];
  loggedInUser?: any;
  userPermissions?: any;
  leads?: CRMLead[];
  setLeads?: React.Dispatch<React.SetStateAction<CRMLead[]>>;
}

export default function SaaSLeadsModule({
  agents = [],
  loggedInUser,
  userPermissions,
  leads: propsLeads,
  setLeads: propsSetLeads
}: SaaSLeadsModuleProps) {
  // Sub-tabs corresponding to standard HubSpot/Zoho Lead categories
  const subCategories = [
    { key: 'Dashboard', label: 'Lead Dashboard' },
    { key: 'All', label: 'All Leads Register' },
    { key: 'Add', label: 'Create New Lead' },
    { key: 'Pipeline', label: 'Lead Stage Pipeline' },
    { key: 'FollowUps', label: 'Follow-ups & Reminders' },
    { key: 'Reports', label: 'Reports & Analytics' }
  ] as const;

  const [activeSubTab, setActiveSubTab] = useState<'Dashboard' | 'All' | 'Add' | 'Pipeline' | 'FollowUps' | 'Reports'>('Dashboard');

  // Fallback local state if props are not passed
  const [internalLeads, setInternalLeads] = useState<CRMLead[]>(() => getDefaultLeads(agents));
  
  const leads = propsLeads !== undefined ? propsLeads : internalLeads;
  const setLeads = propsSetLeads !== undefined ? propsSetLeads : setInternalLeads;

  // All Leads Search, Filter, and Sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
  const [agentFilter, setAgentFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<'name' | 'createdAt' | 'budget'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // CRM Navigation Card filter ('all' for complete register, others filter by cards)
  const [crmNavigationCardFilter, setCrmNavigationCardFilter] = useState<'all' | 'unassigned' | 'contacted' | 'sitewalks' | 'negotiation' | 'won' | 'lost'>('all');
  
  // Date created filter
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days'>('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Active Lead Editing state
  const [editingLead, setEditingLead] = useState<CRMLead | null>(null);

  // Active Rescheduling status states
  const [reschedulingLeadId, setReschedulingLeadId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('2026-06-25');
  const [rescheduleTime, setRescheduleTime] = useState('11:00');

  // Reset pagination on filter mutations
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sourceFilter, agentFilter, crmNavigationCardFilter, dateFilter]);

  // Selected leads for Bulk Assignment
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkAgentId, setBulkAgentId] = useState<string>('');

  // Selected active lead for timeline interaction / notes updates
  const [selectedLeadForDetails, setSelectedLeadForDetails] = useState<CRMLead | null>(leads[0]);

  // Form states for manual Lead insertion
  const [formName, setFormName] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPropReq, setFormPropReq] = useState('');
  const [formBudget, setFormBudget] = useState('₹ 1.5 Cr');
  const [formLocation, setFormLocation] = useState('Whitefield Corridor');
  const [formSource, setFormSource] = useState('Facebook');
  const [formNotes, setFormNotes] = useState('');
  const [formAgentId, setFormAgentId] = useState('');

  // Form states for scheduling follow-ups
  const [followUpDate, setFollowUpDate] = useState('2026-06-10');
  const [followUpTime, setFollowUpTime] = useState('11:00');
  const [followUpNotes, setFollowUpNotes] = useState('');

  // Form states for recording activities
  const [activityType, setActivityType] = useState<'Call' | 'WhatsApp' | 'Meeting' | 'Site Visit'>('Call');
  const [activityContent, setActivityContent] = useState('');

  // Form states for editing custom notes
  const [tempNotesInternal, setTempNotesInternal] = useState('');
  const [tempNotesAgent, setTempNotesAgent] = useState('');
  const [tempNotesCustomer, setTempNotesCustomer] = useState('');

  // Handler for manual submit
  const handleCreateLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formMobile) {
      alert("Please provide the mandatory Customer Name and Contact Mobile Number.");
      return;
    }

    const assignedAgent = agents.find(a => a.id === formAgentId);

    const newLead: CRMLead = {
      id: `lead-req-${Date.now()}`,
      name: formName,
      mobile: formMobile,
      email: formEmail,
      propertyRequirement: formPropReq,
      budget: formBudget,
      preferredLocation: formLocation,
      source: formSource,
      status: 'New',
      agentId: assignedAgent?.id,
      agentName: assignedAgent?.name,
      createdAt: new Date().toISOString(),
      notes: {
        internal: formNotes || 'No internal note recorded yet.',
        agent: 'Awaiting first call callback.',
        customer: ''
      },
      followUps: [],
      activities: [
        { id: `act-init-${Date.now()}`, type: 'Status Change', content: `Lead manual entry cleared from source: ${formSource}`, timestamp: new Date().toISOString().slice(0,16).replace('T', ' ') }
      ]
    };

    setLeads([newLead, ...leads]);
    setSelectedLeadForDetails(newLead);
    
    // Reset Form
    setFormName('');
    setFormMobile('');
    setFormEmail('');
    setFormPropReq('');
    setFormNotes('');
    setActiveSubTab('All');
  };

  // Bulk assignment submit
  const handleBulkAssignmentSubmit = () => {
    if (selectedLeadIds.length === 0) {
      alert("Please pick at least one lead from the checkboxes.");
      return;
    }
    if (!bulkAgentId) {
      alert("Please pick a valid agent mapping.");
      return;
    }

    const assignedAgent = agents.find(a => a.id === bulkAgentId);
    if (!assignedAgent) return;

    const timestamp = new Date().toISOString().slice(0,16).replace('T', ' ');

    setLeads(leads.map((lead) => {
      if (selectedLeadIds.includes(lead.id)) {
        const updatedActivities = [
          { id: `act-bulk-${Date.now()}-${lead.id}`, type: 'Status Change', content: `Transferred to agent: ${assignedAgent.name}`, timestamp },
          ...(lead.activities || [])
        ] as LeadActivity[];

        return {
          ...lead,
          agentId: assignedAgent.id,
          agentName: assignedAgent.name,
          activities: updatedActivities
        };
      }
      return lead;
    }));

    setSelectedLeadIds([]);
    setBulkAgentId('');
    alert("Bulk assignment successfully recorded!");
  };

  // Add individual follow up
  const handleAddFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForDetails) return;
    if (!followUpNotes) {
      alert("Please enter brief notes about this follow-up agenda.");
      return;
    }

    const newFup: LeadFollowUp = {
      id: `fup-${Date.now()}`,
      dateTime: `${followUpDate}T${followUpTime}:00`,
      notes: followUpNotes,
      completed: false
    };

    setLeads(leads.map((l) => {
      if (l.id === selectedLeadForDetails.id) {
        return {
          ...l,
          followUps: [...(l.followUps || []), newFup],
          activities: [
            { id: `act-fup-${Date.now()}`, type: 'Note', content: `Scheduled follow-up for ${followUpDate} @ ${followUpTime}: ${followUpNotes}`, timestamp: new Date().toISOString().slice(0,16).replace('T', ' ') },
            ...(l.activities || [])
          ]
        };
      }
      return l;
    }));

    setFollowUpNotes('');
    alert("Follow-up meeting appended!");

    // Update Detail View Reference
    const target = leads.find(l => l.id === selectedLeadForDetails.id);
    if (target) {
      setSelectedLeadForDetails({
        ...target,
        followUps: [...(target.followUps || []), newFup]
      });
    }
  };

  // Complete follow-up action
  const handleToggleFollowUp = (leadId: string, fupId: string) => {
    const timestamp = new Date().toISOString().slice(0,16).replace('T', ' ');
    setLeads(leads.map((l) => {
      if (l.id === leadId) {
        return {
          ...l,
          followUps: (l.followUps || []).map((f) => f.id === fupId ? { ...f, completed: !f.completed } : f),
          activities: [
            { id: `act-fup-com-${Date.now()}`, type: 'Status Change', content: 'Follow-up meeting cleared as Completed', timestamp },
            ...(l.activities || [])
          ]
        };
      }
      return l;
    }));
  };

  // Handle manual individual activity post
  const handleRecordActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForDetails || !activityContent) return;

    const timestamp = new Date().toISOString().slice(0,16).replace('T', ' ');
    const newAct: LeadActivity = {
      id: `act-manual-${Date.now()}`,
      type: activityType,
      content: activityContent,
      timestamp
    };

    setLeads(leads.map((l) => {
      if (l.id === selectedLeadForDetails.id) {
        return {
          ...l,
          activities: [newAct, ...(l.activities || [])]
        };
      }
      return l;
    }));

    setActivityContent('');
    alert("New CRM timeline activity logged!");
  };

  // Save notes updates
  const handleSaveNotes = (leadId: string) => {
    setLeads(leads.map((l) => {
      if (l.id === leadId) {
        return {
          ...l,
          notes: {
            internal: tempNotesInternal,
            agent: tempNotesAgent,
            customer: tempNotesCustomer
          }
        };
      }
      return l;
    }));
    alert("Custom notes updated!");
  };

  // Init temp states on select lead details
  React.useEffect(() => {
    if (selectedLeadForDetails) {
      setTempNotesInternal(selectedLeadForDetails.notes?.internal || '');
      setTempNotesAgent(selectedLeadForDetails.notes?.agent || '');
      setTempNotesCustomer(selectedLeadForDetails.notes?.customer || '');
    }
  }, [selectedLeadForDetails]);

  // Lead Pipeline board stages
  const PipelineStagesArr = [
    'New',
    'Contacted',
    'Qualified',
    'Property Matching',
    'Site Visit Scheduled',
    'Site Visit Completed',
    'Negotiation',
    'Documentation',
    'Closed Won',
    'Closed Lost'
  ] as const;

  // Change individual status
  const handleStatusChange = (leadId: string, nextStatus: any) => {
    const timestamp = new Date().toISOString().slice(0,16).replace('T', ' ');
    setLeads(leads.map((l) => {
      if (l.id === leadId) {
        return {
          ...l,
          status: nextStatus,
          activities: [
            { id: `act-stat-${Date.now()}`, type: 'Status Change', content: `Lead moved directly into: "${nextStatus}" state`, timestamp },
            ...(l.activities || [])
          ]
        };
      }
      return l;
    }));
  };

  // Single assign
  const handleSingleAssign = (leadId: string, agId: string) => {
    const assignedAgent = agents.find(a => a.id === agId);
    if (!assignedAgent) return;
    const timestamp = new Date().toISOString().slice(0,16).replace('T', ' ');

    setLeads(leads.map((l) => {
      if (l.id === leadId) {
        return {
          ...l,
          agentId: assignedAgent.id,
          agentName: assignedAgent.name,
          activities: [
            { id: `act-asg-${Date.now()}`, type: 'Status Change', content: `Assigned individually to expert advisor: ${assignedAgent.name}`, timestamp },
            ...(l.activities || [])
          ]
        };
      }
      return l;
    }));
  };

  // Delete lead
  const handleDeleteLead = (id: string) => {
    if (confirm("Permanently delete this CRM lead?")) {
      setLeads(leads.filter(l => l.id !== id));
      if (selectedLeadForDetails?.id === id) {
        setSelectedLeadForDetails(null);
      }
    }
  };

  // Group leads based on criteria
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // 1. Navigation card filter filtering
      if (crmNavigationCardFilter === 'unassigned') {
        if (lead.status !== 'New' || !!lead.agentId) return false;
      } else if (crmNavigationCardFilter === 'contacted') {
        if (lead.status !== 'Contacted') return false;
      } else if (crmNavigationCardFilter === 'sitewalks') {
        if (lead.status !== 'Site Visit Scheduled' && lead.status !== 'Site Visit Completed' && !(lead as any).siteVisitDate) return false;
      } else if (crmNavigationCardFilter === 'negotiation') {
        if (lead.status !== 'Negotiation') return false;
      } else if (crmNavigationCardFilter === 'won') {
        if (lead.status !== 'Closed Won') return false;
      } else if (crmNavigationCardFilter === 'lost') {
        if (lead.status !== 'Closed Lost') return false;
      }

      // 2. Date ranges filter
      if (dateFilter !== 'all') {
        const createTime = new Date(lead.createdAt).getTime();
        const nowTime = Date.now();
        const diffDays = (nowTime - createTime) / (1000 * 3600 * 24);
        if (dateFilter === '7days' && diffDays > 7) return false;
        if (dateFilter === '30days' && diffDays > 30) return false;
      }

      // 3. Standard text search and field filters
      const matchSearch = 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.propertyRequirement.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.preferredLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.mobile.includes(searchTerm) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'All' || lead.status === statusFilter;
      const matchSource = sourceFilter === 'All' || lead.source === sourceFilter;
      const matchAgent = agentFilter === 'All' || lead.agentId === agentFilter;

      return matchSearch && matchStatus && matchSource && matchAgent;
    }).sort((a, b) => {
      let fieldA: any = a[sortField];
      let fieldB: any = b[sortField];

      if (sortField === 'budget') {
        fieldA = Number(a.budget.replace(/[^0-9.]/g, '')) || 0;
        fieldB = Number(b.budget.replace(/[^0-9.]/g, '')) || 0;
      }

      if (sortOrder === 'asc') {
        return fieldA > fieldB ? 1 : -1;
      } else {
        return fieldA < fieldB ? 1 : -1;
      }
    });
  }, [leads, crmNavigationCardFilter, dateFilter, searchTerm, statusFilter, sourceFilter, agentFilter, sortField, sortOrder]);

  // Paginate the filtered leads
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLeads.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLeads, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredLeads.length / itemsPerPage) || 1;
  }, [filteredLeads]);

  // Lead statistics (dynamic counts calculated from database)
  const stats = useMemo(() => {
    return {
      total: leads.length,
      newLeads: leads.filter(l => l.status === 'New').length,
      unassignedNewIdx: leads.filter(l => l.status === 'New' && !l.agentId).length,
      contacted: leads.filter(l => l.status === 'Contacted').length,
      qualified: leads.filter(l => l.status === 'Qualified').length,
      matching: leads.filter(l => l.status === 'Property Matching').length,
      visitScheduled: leads.filter(l => l.status === 'Site Visit Scheduled' || l.status === 'Site Visit Completed' || (l as any).siteVisitDate).length,
      negotiation: leads.filter(l => l.status === 'Negotiation').length,
      won: leads.filter(l => l.status === 'Closed Won').length,
      lost: leads.filter(l => l.status === 'Closed Lost').length
    };
  }, [leads]);

  // Lead source aggregations
  const sourceStats = useMemo(() => {
    const map: Record<string, number> = {
      'Website': 0,
      'Custom Request Form': 0,
      'WhatsApp': 0,
      'Phone Call': 0,
      'Facebook': 0,
      'Instagram': 0,
      'Referral': 0,
      'Walk-In Customer': 0
    };
    leads.forEach(l => {
      if (map[l.source] !== undefined) {
        map[l.source] += 1;
      } else {
        map['Website'] += 1; // Catch-all fallback
      }
    });
    return map;
  }, [leads]);

  // Append new timeline activity dynamically for selected active cards
  const logCardActivity = (leadId: string, type: string, content: string) => {
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setLeads((prevLeads: CRMLead[]) => prevLeads.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          activities: [
            { id: `act-manual-${Date.now()}`, type, content, timestamp },
            ...(l.activities || [])
          ]
        };
      }
      return l;
    }));
    setSelectedLeadForDetails((prev: CRMLead | null) => {
      if (prev && prev.id === leadId) {
        return {
          ...prev,
          activities: [
            { id: `act-manual-${Date.now()}`, type, content, timestamp },
            ...(prev.activities || [])
          ]
        };
      }
      return prev;
    });
  };

  // Dedicated Render block for the 7 interactive bento cards
  const renderSummaryBento = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 mb-2 text-[#111827]">
        <button 
          type="button"
          onClick={() => { setCrmNavigationCardFilter('all'); setActiveSubTab('All'); }}
          className={`p-3 rounded-xl shadow-xs text-left relative overflow-hidden transition-all duration-200 hover:scale-[1.02] cursor-pointer bg-white border-2 text-slate-800 ${
            crmNavigationCardFilter === 'all' && activeSubTab === 'All'
              ? 'border-orange-600 ring-2 ring-orange-100 bg-orange-50/5' 
              : 'border-slate-200 hover:border-orange-300'
          }`}
        >
          <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block">Aggregate CRM Leads</span>
          <span className="text-2xl font-black font-sans tracking-tight text-[#111827]">{stats.total}</span>
          <div className="text-[8px] text-[#374151] mt-1 flex items-center gap-1 font-semibold">
            <Users className="h-3 w-3 text-orange-610" /> Active Register
          </div>
        </button>

        <button 
          type="button"
          onClick={() => { setCrmNavigationCardFilter('unassigned'); setActiveSubTab('All'); }}
          className={`p-3 rounded-xl shadow-xs text-left relative overflow-hidden transition-all duration-200 hover:scale-[1.02] cursor-pointer bg-white border-2 text-slate-800 ${
            crmNavigationCardFilter === 'unassigned' && activeSubTab === 'All'
              ? 'border-blue-600 ring-2 ring-blue-100 bg-blue-50/5' 
              : 'border-slate-200 hover:border-blue-300'
          }`}
        >
          <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block">Unassigned New</span>
          <span className="text-2xl font-black font-sans tracking-tight text-[#111827]">{stats.unassignedNewIdx}</span>
          <div className="text-[8px] text-blue-700 mt-1 font-bold font-mono">
            Needs Mapping
          </div>
        </button>

        <button 
          type="button"
          onClick={() => { setCrmNavigationCardFilter('contacted'); setActiveSubTab('All'); }}
          className={`p-3 rounded-xl shadow-xs text-left relative overflow-hidden transition-all duration-200 hover:scale-[1.02] cursor-pointer bg-white border-2 text-slate-800 ${
            crmNavigationCardFilter === 'contacted' && activeSubTab === 'All'
              ? 'border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50/5' 
              : 'border-slate-200 hover:border-indigo-300'
          }`}
        >
          <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block">Contacted & Engaged</span>
          <span className="text-2xl font-black font-sans tracking-tight text-[#111827]">{stats.contacted}</span>
          <div className="text-[8px] text-indigo-700 mt-1 font-semibold">
            Intro Cleared
          </div>
        </button>

        <button 
          type="button"
          onClick={() => { setCrmNavigationCardFilter('sitewalks'); setActiveSubTab('All'); }}
          className={`p-3 rounded-xl shadow-xs text-left relative overflow-hidden transition-all duration-200 hover:scale-[1.02] cursor-pointer bg-white border-2 text-slate-800 ${
            crmNavigationCardFilter === 'sitewalks' && activeSubTab === 'All'
              ? 'border-purple-600 ring-2 ring-purple-100 bg-purple-50/5' 
              : 'border-slate-200 hover:border-purple-300'
          }`}
        >
          <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block">Site Walks Planned</span>
          <span className="text-2xl font-black font-sans tracking-tight text-[#111827]">{stats.visitScheduled}</span>
          <div className="text-[8px] text-purple-700 mt-1 font-semibold">
            Elite tours active
          </div>
        </button>

        <button 
          type="button"
          onClick={() => { setCrmNavigationCardFilter('negotiation'); setActiveSubTab('All'); }}
          className={`p-3 rounded-xl shadow-xs text-left relative overflow-hidden transition-all duration-200 hover:scale-[1.02] cursor-pointer bg-white border-2 text-slate-800 ${
            crmNavigationCardFilter === 'negotiation' && activeSubTab === 'All'
              ? 'border-amber-600 ring-2 ring-amber-100 bg-amber-50/5' 
              : 'border-slate-200 hover:border-amber-300'
          }`}
        >
          <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block">In Active Negotiation</span>
          <span className="text-2xl font-black font-sans tracking-tight text-[#111827]">{stats.negotiation}</span>
          <div className="text-[8px] text-amber-705 mt-1 font-semibold">
            Finances discussed
          </div>
        </button>

        <button 
          type="button"
          onClick={() => { setCrmNavigationCardFilter('won'); setActiveSubTab('All'); }}
          className={`p-3 rounded-xl shadow-xs text-left relative overflow-hidden transition-all duration-200 hover:scale-[1.02] cursor-pointer bg-white border-2 text-emerald-800 ${
            crmNavigationCardFilter === 'won' && activeSubTab === 'All'
              ? 'border-emerald-600 ring-2 ring-emerald-100 bg-emerald-50/10' 
              : 'border-slate-200 hover:border-emerald-300'
          }`}
        >
          <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block">Closed Won</span>
          <span className="text-2xl font-black tracking-tight text-emerald-800 block">{stats.won}</span>
          <span className="text-[7px] bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold px-1.5 py-0.2 rounded-full inline-block mt-0.5">
            ₹ Revenue Realized
          </span>
        </button>

        <button 
          type="button"
          onClick={() => { setCrmNavigationCardFilter('lost'); setActiveSubTab('All'); }}
          className={`p-3 rounded-xl shadow-xs text-left relative overflow-hidden transition-all duration-200 hover:scale-[1.02] cursor-pointer bg-white border-2 text-rose-800 ${
            crmNavigationCardFilter === 'lost' && activeSubTab === 'All'
              ? 'border-rose-600 ring-2 ring-rose-100 bg-rose-50/10' 
              : 'border-slate-200 hover:border-rose-300'
          }`}
        >
          <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block">Inactive Lost</span>
          <span className="text-2xl font-black text-rose-700 tracking-tight block">{stats.lost}</span>
          <div className="text-[8px] text-rose-600 mt-1 font-semibold">
            Archived Ledgers
          </div>
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-left" id="saas-leads-standalone-module">
      {/* 2. SUB NAVIGATION CONTROLS */}
      <div className="flex flex-wrap gap-1 bg-slate-100 rounded-xl p-0.5 border border-slate-300">
        {subCategories.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key)}
            className={`px-3.5 py-1.5 text-[11px] font-sans font-bold rounded-lg transition duration-150 cursor-pointer ${
              activeSubTab === tab.key 
                ? 'bg-white shadow-xs text-blue-600 border border-slate-205' 
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* RENDER TAB 1: LEAD DASHBOARD OVERVIEW */}
      {activeSubTab === 'Dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Bento-grid of high-contrast colorized stats cards */}
          {renderSummaryBento()}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Lead Sources breakdown */}
            <div className="lg:col-span-4 bg-white border border-slate-300 p-5 rounded-2xl shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-[#111827] text-sm">Traffic Source Allocation</h3>
                <p className="text-[11px] text-[#374151]">Dynamic metrics aggregated by tracking origin channel coordinates</p>
              </div>

              <div className="space-y-2.5">
                {Object.keys(sourceStats).map((chanName) => {
                  const val = sourceStats[chanName];
                  const percentage = stats.total > 0 ? (val / stats.total) * 100 : 0;
                  return (
                    <div key={chanName} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-semibold text-slate-705">
                        <span className="font-bold text-[#374151]">{chanName}</span>
                        <span className="font-mono text-[#111827] bg-slate-100 px-1.5 py-0.2 rounded font-black">{val} Leads</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-205">
                        <div 
                          className="h-full bg-blue-600 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Timeline of Leads */}
            <div className="lg:col-span-8 bg-white border border-slate-300 p-5 rounded-2xl shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-1">
                <div>
                  <h3 className="font-bold text-[#111827] text-sm">Real-time Lead Activity Streams</h3>
                  <p className="text-[11px] text-[#374151]">Most recent client activities logged instantly under active agent dashboards</p>
                </div>
                <Users className="h-5 w-5 text-blue-600 shrink-0" />
              </div>

              <div className="space-y-3 divide-y divide-slate-200 max-h-80 overflow-y-auto pr-1">
                {leads.slice(0, 5).map((l, idx) => (
                  <div key={l.id} className="pt-3 first:pt-0 flex justify-between items-start text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#111827] hover:text-blue-600 cursor-pointer" onClick={() => { setActiveSubTab('All'); setSelectedLeadForDetails(l); }}>
                          {l.name}
                        </span>
                        <span className="text-[10px] bg-slate-100 font-mono text-slate-700 font-bold px-1.5 py-0.3 rounded border border-slate-250">
                          {l.source}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-650 font-medium">Requirement: "{l.propertyRequirement}" Preferred: {l.preferredLocation}</p>
                      <p className="text-[9px] text-[#374151] font-mono leading-none">Ingested: {new Date(l.createdAt).toLocaleDateString()} @ {new Date(l.createdAt).toLocaleTimeString()}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[9px] uppercase font-mono tracking-tight font-black bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                        {l.status}
                      </span>
                      <span className="text-[9px] font-bold text-slate-505">
                        Agent: <span className="text-[#111827] font-black">{l.agentName || 'No Mapping'}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* RENDER TAB 2: ALL LEADS INDEX REGISTER */}
      {activeSubTab === 'All' && (
        <div className="space-y-4 animate-in fade-in duration-200 w-full col-span-full">
          {renderSummaryBento()}
          {crmNavigationCardFilter !== 'all' && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex justify-between items-center text-xs px-4 mb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse shrink-0"></span>
                <span className="font-semibold text-indigo-900">
                  Active Card Filter: Showing <span className="font-mono font-extrabold tracking-wide uppercase text-indigo-950">
                    {crmNavigationCardFilter === 'unassigned' ? 'Unassigned New Leads' :
                     crmNavigationCardFilter === 'contacted' ? 'Contacted & Engaged CRM' :
                     crmNavigationCardFilter === 'sitewalks' ? 'Site Visits Planned' :
                     crmNavigationCardFilter === 'negotiation' ? 'In Active Negotiation' :
                     crmNavigationCardFilter === 'won' ? 'Closed Won Deals' :
                     crmNavigationCardFilter === 'lost' ? 'Inactive / Lost Leads' : ''}
                  </span> ({filteredLeads.length} files)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCrmNavigationCardFilter('all')}
                className="px-2.5 py-1 text-[10px] bg-indigo-600 hover:bg-indigo-750 text-white font-black rounded-lg transition duration-150 cursor-pointer uppercase"
              >
                Clear Filter
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* INDEX PANEL */}
          <div className="lg:col-span-8 bg-white border border-slate-300 p-5 rounded-2xl shadow-xs space-y-4">
            
            {/* Controls panel */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-bold text-[#111827] text-sm">Enterprise Lead Registry</h3>
                <p className="text-[11px] text-[#374151]">Select checkbox matrices for administrative bulk transfers and priority staging</p>
              </div>

              {/* CSV Simulation export triggers */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const csvContent = "data:text/csv;charset=utf-8," 
                      + ["Name,Mobile,Email,Requirement,Budget,Location,Source,Status,Agent"].join(",") + "\n"
                      + leads.map(l => `"${l.name}","${l.mobile}","${l.email}","${l.propertyRequirement}","${l.budget}","${l.preferredLocation}","${l.source}","${l.status}","${l.agentName || 'Unassigned'}"`).join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `dvarix_leads_ledger_${new Date().toISOString().slice(0,10)}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#111827] font-bold text-[10px] rounded-lg transition border border-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  <Download className="h-3 w-3 text-[#111827]" /> Export Ledger
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert("Click OK to ingest bulk simulation test data (Ingested 5 supplemental WhatsApp cold-leads).");
                    const supplementary: CRMLead[] = [1,2,3,4,5].map((idx) => ({
                      id: `lead-ingest-${idx}-${Date.now()}`,
                      name: `Client Candidate #${100 + idx}`,
                      mobile: `+91 910080${idx}846`,
                      email: `candidate.${idx}@gmail.com`,
                      propertyRequirement: 'Standard multi-apartment matching',
                      budget: '₹ 1.25 Cr',
                      preferredLocation: 'JP Nagar Hub',
                      source: 'Website',
                      status: 'New',
                      createdAt: new Date().toISOString(),
                      notes: { internal: 'Bulk system-wide programmatic import.', agent: '', customer: '' }
                    }));
                    setLeads([...leads, ...supplementary]);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#111827] font-bold text-[10px] rounded-lg transition border border-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="h-3 w-3 text-[#111827]" /> Import Ledger
                </button>
              </div>
            </div>

            {/* Filter controls row */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-50 p-4 border border-slate-300 rounded-xl">
              
              <div className="space-y-1 relative">
                <Search className="absolute left-2 top-7.5 h-3.5 w-3.5 text-slate-400" />
                <label className="text-[9px] uppercase font-bold text-[#4B5563] block font-mono">Query Leads</label>
                <input
                  type="text"
                  placeholder="Name, mobile or area..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-7.5 pr-2.5 py-1.5 border border-slate-250 rounded-lg text-xs font-medium outline-none bg-white text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-[#4B5563] block font-mono">Stage Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-slate-250 p-1.5 rounded-lg text-xs bg-white text-slate-800"
                >
                  <option value="All">All Stages</option>
                  {PipelineStagesArr.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-[#4B5563] block font-mono">Origin Traffic Channel</label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full border border-slate-250 p-1.5 rounded-lg text-xs bg-white text-slate-800"
                >
                  <option value="All">All Channels</option>
                  <option value="Website">Website</option>
                  <option value="Custom Request Form">Custom Request Form</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Phone Call">Phone Call</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Referral">Referral</option>
                  <option value="Walk-In Customer">Walk-In Customer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-[#4B5563] block font-mono">Agent Owner</label>
                <select
                  value={agentFilter}
                  onChange={(e) => setAgentFilter(e.target.value)}
                  className="w-full border border-slate-250 p-1.5 rounded-lg text-xs bg-white text-slate-800"
                >
                  <option value="All">All Agents</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-[#4B5563] block font-mono">Date Ingested</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className="w-full border border-slate-250 p-1.5 rounded-lg text-xs bg-white text-[#111827] cursor-pointer outline-none"
                >
                  <option value="all">All Time Records</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                </select>
              </div>

            </div>

            {/* Bulk Assignment Sub-Action Panel */}
            {selectedLeadIds.length > 0 && (
              <div className="bg-blue-50 border-2 border-blue-200 p-3.5 rounded-xl flex flex-col md:flex-row justify-between items-center gap-3 animate-in slide-in-from-top-1.5">
                <span className="text-[11px] font-bold text-blue-900 font-sans">
                  🚨 {selectedLeadIds.length} Selected Leads for Bulk Transfer:
                </span>
                <div className="flex gap-2 items-center">
                  <select
                    value={bulkAgentId}
                    onChange={(e) => setBulkAgentId(e.target.value)}
                    className="border border-blue-300 p-1.5 rounded text-xs bg-white font-medium text-slate-800"
                  >
                    <option value="">-- Choose Agent Owner --</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={handleBulkAssignmentSubmit}
                    className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-[10px] uppercase rounded transition cursor-pointer"
                  >
                    Bulk Map
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLeadIds([])}
                    className="p-1 px-2.5 bg-white border border-blue-200 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-700 transition font-bold text-[10px]"
                  >
                    Clear Selects
                  </button>
                </div>
              </div>
            )}

            {/* TABLE */}
            <div className="overflow-x-auto border border-slate-300 rounded-xl">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-100 text-[#1F2937] font-semibold text-[11px]">
                  <tr>
                    <th className="p-3.5 text-center w-10">
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLeadIds(filteredLeads.map(l => l.id));
                          } else {
                            setSelectedLeadIds([]);
                          }
                        }}
                        className="cursor-pointer"
                      />
                    </th>
                    <th className="p-3.5 font-sans">Customer Info</th>
                    <th className="p-3.5 font-sans">Requirement & Area</th>
                    <th className="p-3.5 font-sans">Financial Budget</th>
                    <th className="p-3.5 font-sans text-center">Status STAGE</th>
                    <th className="p-3.5 font-sans">Agent Owner</th>
                    <th className="p-3.5 text-center font-sans">Administrative Tools</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {paginatedLeads.map((lead) => {
                    const isSelected = selectedLeadIds.includes(lead.id);
                    const isFocus = selectedLeadForDetails?.id === lead.id;
                    return (
                      <tr 
                        key={lead.id} 
                        className={`hover:bg-slate-50/100 transition cursor-pointer ${isFocus ? 'bg-blue-50/30 font-semibold border-l-4 border-l-blue-600' : ''}`}
                        onClick={() => setSelectedLeadForDetails(lead)}
                      >
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLeadIds([...selectedLeadIds, lead.id]);
                              } else {
                                setSelectedLeadIds(selectedLeadIds.filter(id => id !== lead.id));
                              }
                            }}
                            className="cursor-pointer"
                          />
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-[#111827] block text-[13px]">{lead.name}</span>
                          <span className="text-[10px] text-slate-550 block font-semibold">{lead.mobile}</span>
                          <span className="text-[9px] text-[#374151] block font-mono font-medium">{lead.email}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-800 text-[11px] block">{lead.propertyRequirement}</span>
                          <span className="text-[10px] text-slate-500 font-mono block">Pref: {lead.preferredLocation}</span>
                          <span className="text-[8px] uppercase tracking-wider bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-full font-bold border border-slate-300 mt-1 inline-block">
                            Channel: {lead.source}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-extrabold text-[#111827]">
                          {lead.budget}
                        </td>
                        <td className="p-3 text-center">
                          <select
                            value={lead.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                            className="border border-slate-300 p-1.5 rounded-lg text-[9px] font-bold font-mono bg-white text-slate-850 outline-none cursor-pointer"
                          >
                            {PipelineStagesArr.map((st) => (
                              <option key={st} value={st}>{st.toUpperCase()}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={lead.agentId || ''}
                            onChange={(e) => handleSingleAssign(lead.id, e.target.value)}
                            className="border border-slate-300 p-1.5 rounded-lg text-[10px] font-sans font-semibold bg-white text-slate-800 outline-none cursor-pointer"
                          >
                            <option value="">-- Assign expert --</option>
                            {agents.map((ag) => (
                              <option key={ag.id} value={ag.id}>{ag.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleDeleteLead(lead.id)}
                            className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 rounded-lg border border-slate-250 hover:border-rose-300 shadow-3xs transition cursor-pointer"
                            title="Delete Lead"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredLeads.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold font-sans">
                        No Matching CRM Lead Coordinates Found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION CONTROLS BAR */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 border border-slate-300 p-3 rounded-xl gap-2 text-xs">
              <span className="font-semibold text-slate-650 text-center sm:text-left">
                Showing <span className="#111827 font-extrabold">{filteredLeads.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-{Math.min(filteredLeads.length, currentPage * itemsPerPage)}</span> of <span className="#111827 font-extrabold">{filteredLeads.length}</span> matching records
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-550 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold transition text-[10px] cursor-pointer"
                >
                  Prev
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const pNum = i + 1;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => setCurrentPage(pNum)}
                      className={`px-2.5 py-1.5 rounded-lg border font-black text-[10px] transition ${
                        currentPage === pNum
                          ? 'bg-blue-600 border-blue-600 text-white shadow-3xs'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-550 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold transition text-[10px] cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>

          </div>

          {/* COMPACT DETAIL SPLIT VIEW */}
          <div className="lg:col-span-4 bg-white border border-slate-300 p-5 rounded-2xl shadow-xs space-y-4">
            {selectedLeadForDetails ? (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="pb-3 border-b border-slate-200">
                  <span className="text-[8px] bg-slate-100 text-[#111827] px-2 py-0.5 rounded border border-slate-300 font-mono uppercase tracking-widest font-black block w-fit mb-1">
                    Ingested Lead Details
                  </span>
                  <h4 className="font-extrabold text-[#111827] text-sm tracking-tight">{selectedLeadForDetails.name}</h4>
                  <p className="text-[10px] text-[#374151] font-mono mt-0.5 font-bold">Mobile: {selectedLeadForDetails.mobile}</p>
                </div>

                {/* STAGE SPECIFIC DOSSIER CARD ACTIONS */}
                <div className="bg-slate-50 border border-slate-250 p-3.5 rounded-xl space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-205">
                    <span className="text-[9px] font-black uppercase text-slate-705 tracking-wider font-mono">
                      Stage params: <span className="text-blue-600">[{selectedLeadForDetails.status}]</span>
                    </span>
                    <span className="text-[9px] font-mono text-slate-450">
                      ID: {selectedLeadForDetails.id}
                    </span>
                  </div>

                  {/* 1. NEW/UNASSIGNED STAGES */}
                  {(selectedLeadForDetails.status === 'New' || !selectedLeadForDetails.agentId) && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-600 font-semibold font-sans leading-relaxed">This is a fresh ingestion that requires advisor mapping & outreach initiation.</p>
                      
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            logCardActivity(selectedLeadForDetails.id, 'Call', 'Triggered mobile outbound call to customer of introductory nature');
                            window.open(`tel:${selectedLeadForDetails.mobile}`);
                          }}
                          className="flex items-center justify-center gap-1.5 p-2 bg-blue-50 text-blue-700 font-black border border-blue-200 rounded-lg hover:bg-blue-100/80 transition text-[9.5px] cursor-pointer"
                        >
                          <Phone className="h-3 w-3" /> Call Client
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            logCardActivity(selectedLeadForDetails.id, 'WhatsApp', 'Began WhatsApp query thread sharing catalog');
                            window.open(`https://wa.me/${selectedLeadForDetails.mobile.replace(/[^0-9]/g, '')}`, '_blank');
                          }}
                          className="flex items-center justify-center gap-1.5 p-2 bg-emerald-50 text-emerald-800 font-black border border-emerald-200 rounded-lg hover:bg-emerald-100/80 transition text-[9.5px] cursor-pointer"
                        >
                          <MessageSquare className="h-3 w-3" /> WhatsApp
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            logCardActivity(selectedLeadForDetails.id, 'Email', 'Shared brochure welcome prospectus via default mail client');
                            window.open(`mailto:${selectedLeadForDetails.email}`);
                          }}
                          className="flex items-center justify-center gap-1.5 p-2 bg-slate-100 text-slate-700 font-black border border-slate-205 rounded-lg hover:bg-slate-200 transition text-[9.5px] cursor-pointer"
                        >
                          <FileText className="h-3 w-3" /> Email Lead
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingLead(selectedLeadForDetails)}
                          className="flex items-center justify-center gap-1.5 p-2 bg-amber-50 text-amber-800 font-black border border-amber-200 rounded-lg hover:bg-amber-100 transition text-[9.5px] cursor-pointer"
                        >
                          <Edit className="h-3 w-3" /> Edit dossier
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const updated = {
                            ...selectedLeadForDetails,
                            status: 'Contacted',
                            agentId: selectedLeadForDetails.agentId || agents[0]?.id || '1',
                            agentName: selectedLeadForDetails.agentName || agents[0]?.name || 'Rahul Kumar'
                          } as CRMLead;
                          
                          setLeads(leads.map(l => l.id === selectedLeadForDetails.id ? updated : l));
                          setSelectedLeadForDetails(updated);
                          logCardActivity(selectedLeadForDetails.id, 'Status Change', 'Successfully converted lead from New to Contacted and Engaged stage');
                        }}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 font-black text-white rounded-lg tracking-wide uppercase transition hover:shadow-xs cursor-pointer flex items-center justify-center gap-1 text-[10px]"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Convert to Contacted
                      </button>
                    </div>
                  )}

                  {/* 2. CONTACTED & ENGAGED STAGE */}
                  {selectedLeadForDetails.status === 'Contacted' && (
                    <div className="space-y-2.5">
                      <div className="text-[10px] space-y-1 text-slate-800">
                        <span className="font-extrabold block">Assigned Advisor: <span className="text-[#111827]">{selectedLeadForDetails.agentName || 'Rahul Kumar'}</span></span>
                        <span className="font-semibold block font-mono text-slate-500">Outreach metrics: {selectedLeadForDetails.activities?.filter(a => ['Call', 'WhatsApp', 'Email'].includes(a.type)).length || 0} attempts logged</span>
                      </div>

                      {/* Display Scheduled Follow-up Details */}
                      <div>
                        <span className="text-[8px] font-bold block uppercase text-slate-400 font-mono">Scheduled Follow-ups</span>
                        {selectedLeadForDetails.followUps && selectedLeadForDetails.followUps.length > 0 ? (
                          <div className="space-y-1.5 mt-1 font-mono">
                            {selectedLeadForDetails.followUps.map(fup => (
                              <div key={fup.id} className="p-2 bg-white border border-slate-200 rounded-lg flex justify-between items-start">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-[#111827] text-[10px] block">{new Date(fup.dateTime).toLocaleDateString()} @ {new Date(fup.dateTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                                  <span className="text-[9px] text-slate-500 block leading-tight">{fup.notes}</span>
                                </div>
                                <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border ${fup.completed ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                                  {fup.completed ? 'Done' : 'Pending'}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-2 border border-dashed border-slate-350 text-center rounded-lg text-slate-400 text-[10px] italic">
                            No follow-ups programmed. Use Tab 5 (Follow-ups) component to schedule.
                          </div>
                        )}
                      </div>

                      {/* Add quick logged outreach */}
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => logCardActivity(selectedLeadForDetails.id, 'Call', 'Attempted outreach call. Spoke to customer about premium villa catalogues.')}
                          className="flex-1 py-1.5 border border-slate-300 text-slate-800 bg-white hover:bg-slate-100 transition rounded-md font-bold text-[9px] cursor-pointer"
                        >
                          Log Outreach Call
                        </button>
                        <button
                          type="button"
                          onClick={() => logCardActivity(selectedLeadForDetails.id, 'WhatsApp', 'Shared dynamic location layout blueprint coordinates via WhatsApp')}
                          className="flex-1 py-1.5 border border-slate-300 text-slate-800 bg-white hover:bg-slate-100 transition rounded-md font-bold text-[9px] cursor-pointer"
                        >
                          Log brochure WP
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3. SITE WALKS PLANNED STAGE */}
                  {(selectedLeadForDetails.status === 'Site Visit Scheduled' || selectedLeadForDetails.status === 'Site Visit Completed') && (
                    <div className="space-y-2">
                      <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#111827] text-[10.5px]">Site Walk Tour Slot</span>
                          <span className={`text-[8px] tracking-wider uppercase font-extrabold px-1.5 py-0.5 rounded border ${
                            (selectedLeadForDetails as any).siteVisitStatus === 'Confirmed' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                            (selectedLeadForDetails as any).siteVisitStatus === 'Completed' || selectedLeadForDetails.status === 'Site Visit Completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                            (selectedLeadForDetails as any).siteVisitStatus === 'Cancelled' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                            'bg-amber-50 border-amber-200 text-amber-700'
                          }`}>
                            {(selectedLeadForDetails as any).siteVisitStatus || (selectedLeadForDetails.status === 'Site Visit Completed' ? 'Completed' : 'Scheduled')}
                          </span>
                        </div>

                        <div className="text-[10px] space-y-1 font-mono text-slate-650">
                          <div>
                            <span className="font-bold block text-slate-700">Scheduled Date: <span className="text-[#111827]">{(selectedLeadForDetails as any).siteVisitDate || '2026-06-25'}</span></span>
                            <span className="font-bold block text-slate-700">Scheduled Time: <span className="text-[#111827]">{(selectedLeadForDetails as any).siteVisitTime || '15:00'}</span></span>
                          </div>
                          <span className="font-bold text-slate-705 block">Host Advisor: <span className="text-[#111827] font-semibold">{selectedLeadForDetails.agentName || 'Rahul Kumar'}</span></span>
                        </div>
                      </div>

                      {/* Custom site walk schedules actions */}
                      <div className="grid grid-cols-2 gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...selectedLeadForDetails, siteVisitStatus: 'Confirmed' } as any;
                            setLeads(leads.map(l => l.id === selectedLeadForDetails.id ? updated : l));
                            setSelectedLeadForDetails(updated);
                            logCardActivity(selectedLeadForDetails.id, 'Meeting', 'Confirmed physical site walk logistics coordination with customer.');
                          }}
                          className="p-1 px-1.5 border border-slate-300 font-extrabold text-[9px] rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition cursor-pointer"
                        >
                          Confirm Tour
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...selectedLeadForDetails, status: 'Site Visit Completed', siteVisitStatus: 'Completed' } as any;
                            setLeads(leads.map(l => l.id === selectedLeadForDetails.id ? updated : l));
                            setSelectedLeadForDetails(updated);
                            logCardActivity(selectedLeadForDetails.id, 'Status Change', 'Marked site visit walk touring completed successfully.');
                          }}
                          className="p-1 px-1.5 border border-slate-300 font-extrabold text-[9px] rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                        >
                          Complete Tour
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-1">
                        <button
                          type="button"
                          onClick={() => setReschedulingLeadId(selectedLeadForDetails.id)}
                          className="p-1 px-1.5 border border-slate-300 font-semibold text-[9px] rounded bg-amber-50 text-amber-705 hover:bg-amber-100 transition cursor-pointer"
                        >
                          Reschedule...
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...selectedLeadForDetails, siteVisitStatus: 'Cancelled' } as any;
                            setLeads(leads.map(l => l.id === selectedLeadForDetails.id ? updated : l));
                            setSelectedLeadForDetails(updated);
                            logCardActivity(selectedLeadForDetails.id, 'Cancellation', 'Physical site walk touring schedule was cancelled per customer requests.');
                          }}
                          className="p-1 px-1.5 border border-slate-300 font-semibold text-[9px] rounded bg-rose-50 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                        >
                          Cancel Walk
                        </button>
                      </div>

                      {/* Reschedule inline editor */}
                      {reschedulingLeadId === selectedLeadForDetails.id && (
                        <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg space-y-2 mt-1">
                          <span className="font-bold text-[9px] text-amber-850 block">Scheduler parameters</span>
                          <div className="grid grid-cols-2 gap-1.5 text-[9.5px]">
                            <input
                              type="date"
                              value={rescheduleDate}
                              onChange={(e) => setRescheduleDate(e.target.value)}
                              className="w-full border p-1 rounded bg-white text-slate-800"
                            />
                            <input
                              type="time"
                              value={rescheduleTime}
                              onChange={(e) => setRescheduleTime(e.target.value)}
                              className="w-full border p-1 rounded bg-white text-slate-800"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = {
                                ...selectedLeadForDetails,
                                status: 'Site Visit Scheduled',
                                siteVisitDate: rescheduleDate,
                                siteVisitTime: rescheduleTime,
                                siteVisitStatus: 'Scheduled'
                              } as any;
                              setLeads(leads.map(l => l.id === selectedLeadForDetails.id ? updated : l));
                              setSelectedLeadForDetails(updated);
                              setReschedulingLeadId(null);
                              logCardActivity(selectedLeadForDetails.id, 'Status Change', `Rescheduled walk tour parameters to ${rescheduleDate} @ ${rescheduleTime}`);
                            }}
                            className="w-full py-1 bg-amber-600 hover:bg-amber-700 text-white text-[9px] font-black rounded cursor-pointer uppercase"
                          >
                            Save Appointment
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4. IN ACTIVE NEGOTIATION STAGE */}
                  {selectedLeadForDetails.status === 'Negotiation' && (
                    <div className="space-y-2.5 text-left">
                      <p className="text-[10px] text-slate-600 font-semibold">Recording active negotiation discussions, proposed pricing concession & structural terms.</p>
                      
                      <div className="space-y-1 text-[10px]">
                        <label className="font-extrabold text-[#374151] block font-mono">Proposed Transaction Price</label>
                        <input
                          type="text"
                          placeholder="e.g. ₹ 4.65 Cr"
                          value={(selectedLeadForDetails as any).proposedPrice || selectedLeadForDetails.budget}
                          onChange={(e) => {
                            const updated = { ...selectedLeadForDetails, proposedPrice: e.target.value } as any;
                            setLeads(leads.map(l => l.id === selectedLeadForDetails.id ? updated : l));
                            setSelectedLeadForDetails(updated);
                          }}
                          className="w-full border border-slate-300 p-1.5 rounded bg-white font-mono font-extrabold text-[#111827]"
                        />
                      </div>

                      <div className="space-y-1 text-[10px]">
                        <label className="font-extrabold text-[#374151] block font-mono">Negotiation Financial Notes</label>
                        <textarea
                          placeholder="Downpayment coordinate terms, banking financing parameters..."
                          value={(selectedLeadForDetails as any).financialNotes || ''}
                          rows={2}
                          onChange={(e) => {
                            const updated = { ...selectedLeadForDetails, financialNotes: e.target.value } as any;
                            setLeads(leads.map(l => l.id === selectedLeadForDetails.id ? updated : l));
                            setSelectedLeadForDetails(updated);
                          }}
                          className="w-full border border-slate-300 p-1.5 rounded bg-white text-[10.5px]"
                        />
                      </div>

                      {/* Documents checklists */}
                      <div className="space-y-1.5">
                        <span className="text-[8px] font-bold block uppercase text-slate-400 font-mono">Simulated legal checklists</span>
                        <div className="space-y-1">
                          {['ID & PAN Card Verified', 'Legal Title Clearance Cleared', 'Advance Booking draft received'].map(docKey => {
                            const mapKey = `doc_${docKey.replace(/[^a-zA-Z]/g, '')}`;
                            const isChecked = !!(selectedLeadForDetails as any)[mapKey];
                            return (
                              <label key={docKey} className="flex items-center gap-1.5 text-[10px] text-slate-700 cursor-pointer font-bold select-none">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const updated = { ...selectedLeadForDetails, [mapKey]: e.target.checked } as any;
                                    setLeads(leads.map(l => l.id === selectedLeadForDetails.id ? updated : l));
                                    setSelectedLeadForDetails(updated);
                                    logCardActivity(selectedLeadForDetails.id, 'Document Check', `${isChecked ? 'Unchecked' : 'Checked'} validation criteria: ${docKey}`);
                                  }}
                                />
                                {docKey}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. CLOSED WON STAGE */}
                  {selectedLeadForDetails.status === 'Closed Won' && (
                    <div className="space-y-2.5">
                      <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl space-y-1 text-slate-80 w-full">
                        <span className="font-extrabold text-emerald-800 block text-[11px]">🎉 Deal Completed & Closed!</span>
                        <div className="space-y-0.5 text-[10px]">
                          <span className="font-bold text-slate-700 block">Proposed Price: <span className="text-emerald-900 font-extrabold font-mono">{(selectedLeadForDetails as any).proposedPrice || selectedLeadForDetails.budget}</span></span>
                          <span className="font-bold text-slate-700 block">Brokerage Revenue (2.5%): <span className="text-emerald-900 font-extrabold font-mono">₹ {(((parseFloat(((selectedLeadForDetails as any).proposedPrice || selectedLeadForDetails.budget).replace(/[^0-9.]/g, '')) || 2.4) * 0.025) * 100).toFixed(1)} Lakhs</span></span>
                          <span className="font-bold text-slate-700 block">Agent Commission Share: <span className="text-indigo-800 font-extrabold font-mono">₹ {(((parseFloat(((selectedLeadForDetails as any).proposedPrice || selectedLeadForDetails.budget).replace(/[^0-9.]/g, '')) || 2.4) * 0.025 * 0.20) * 100).toFixed(2)} Lakhs</span></span>
                        </div>
                      </div>

                      {/* Invoices and deed checkpoints */}
                      <div className="space-y-1.5 text-[10.5px]">
                        <span className="text-[8px] font-bold block uppercase text-slate-400 font-mono">Administrative Settlement Checklist</span>
                        {['Draft Booking Agreement ✔', 'Invoice dispatched ✔', 'Property Registrars Deed Checked ✔'].map(checkItem => {
                          const itemKey = `closed_${checkItem.replace(/[^a-zA-Z]/g, '')}`;
                          const isChecked = !!(selectedLeadForDetails as any)[itemKey];
                          return (
                            <label key={checkItem} className="flex items-center gap-1.5 text-[10px] cursor-pointer text-slate-700 font-bold select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const updated = { ...selectedLeadForDetails, [itemKey]: e.target.checked } as any;
                                  setLeads(leads.map(l => l.id === selectedLeadForDetails.id ? updated : l));
                                  setSelectedLeadForDetails(updated);
                                }}
                              />
                              {checkItem}
                            </label>
                          );
                        })}
                      </div>

                      <div className="space-y-1 text-[10px]">
                        <label className="font-extrabold text-[#374151] block font-mono">Settlement payment coordinates</label>
                        <select
                          value={(selectedLeadForDetails as any).paymentStatus || 'Booking Advance Cleared'}
                          onChange={(e) => {
                            const updated = { ...selectedLeadForDetails, paymentStatus: e.target.value } as any;
                            setLeads(leads.map(l => l.id === selectedLeadForDetails.id ? updated : l));
                            setSelectedLeadForDetails(updated);
                            logCardActivity(selectedLeadForDetails.id, 'Status Change', `Commission payment settlement parameters set to: ${e.target.value}`);
                          }}
                          className="w-full border border-slate-300 p-1.5 rounded bg-white text-xs text-slate-800 cursor-pointer outline-none"
                        >
                          <option value="Booking Advance Cleared">Booking Advance Cleared</option>
                          <option value="Bank Loan Disbursed">Bank Loan Disbursed</option>
                          <option value="Fully Settled & Completed">Fully Settled & Completed</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* 6. CLOSED LOST STAGE */}
                  {selectedLeadForDetails.status === 'Closed Lost' && (
                    <div className="space-y-2.5">
                      <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl space-y-1 text-slate-800 text-[10px]">
                        <span className="font-extrabold text-rose-800 block text-[11px]">Archived Dossier (Lead Lost)</span>
                        <div className="space-y-0.5 text-slate-700">
                          <span className="font-bold block">Competitor: <span className="text-[#111827] font-extrabold font-mono">{(selectedLeadForDetails as any).lostCompetitor || 'Sobha Developers'}</span></span>
                          <span className="font-bold block">Cause: <span className="text-[#111827] font-extrabold">{(selectedLeadForDetails as any).lostReason || 'Budget too low'}</span></span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                        <div className="space-y-1">
                          <label className="font-bold block text-slate-600 font-mono">Competitor</label>
                          <input
                            type="text"
                            placeholder="e.g. Prestige Group"
                            value={(selectedLeadForDetails as any).lostCompetitor || ''}
                            onChange={(e) => {
                              const updated = { ...selectedLeadForDetails, lostCompetitor: e.target.value } as any;
                              setLeads(leads.map(l => l.id === selectedLeadForDetails.id ? updated : l));
                              setSelectedLeadForDetails(updated);
                            }}
                            className="w-full border p-1 rounded bg-white text-slate-850"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold block text-slate-600 font-mono">Loss Reason</label>
                          <select
                            value={(selectedLeadForDetails as any).lostReason || 'Budget Mismatch'}
                            onChange={(e) => {
                              const updated = { ...selectedLeadForDetails, lostReason: e.target.value } as any;
                              setLeads(leads.map(l => l.id === selectedLeadForDetails.id ? updated : l));
                              setSelectedLeadForDetails(updated);
                            }}
                            className="w-full border p-1 rounded bg-white text-slate-850"
                          >
                            <option value="Budget Mismatch">Budget Mismatch</option>
                            <option value="Moved to Competitor">Competitor Mapped</option>
                            <option value="Indefinitely Delayed">Delayed Decision</option>
                            <option value="Zoning Issues">Zoning Mismatch</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const updated = {
                            ...selectedLeadForDetails,
                            status: 'New',
                            siteVisitStatus: undefined,
                            proposedPrice: undefined,
                            financialNotes: undefined
                          } as any;
                          setLeads(leads.map(l => l.id === selectedLeadForDetails.id ? updated : l));
                          setSelectedLeadForDetails(updated);
                          logCardActivity(selectedLeadForDetails.id, 'Status Change', 'Reopened and re-initiated lost lead pipeline engagement dossier.');
                        }}
                        className="w-full py-2 bg-[#111827] hover:bg-slate-850 text-white text-[10px] font-black rounded-lg uppercase tracking-wide cursor-pointer flex items-center justify-center gap-1 transition"
                      >
                        <RefreshCw className="h-3 w-3" /> Reopen Lost Lead Dossier
                      </button>
                    </div>
                  )}
                </div>

                {/* Sub form for manual timeline note additions */}
                <form onSubmit={handleRecordActivity} className="space-y-2 bg-slate-50 border border-slate-300 p-3 rounded-xl text-[10px]">
                  <span className="font-mono uppercase font-black text-slate-500 block">Log Agent Dispatch Action</span>
                  <div className="flex gap-1.5">
                    <select
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value as any)}
                      className="border border-slate-300 p-1.5 rounded bg-white text-slate-800 text-[10px] block font-semibold w-24 outline-none"
                    >
                      <option value="Call">Call</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Site Visit">Site Visit</option>
                    </select>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Discussed JP Nagar blueprints..."
                      value={activityContent}
                      onChange={(e) => setActivityContent(e.target.value)}
                      className="flex-1 border border-slate-300 p-1.5 rounded bg-white text-[10px] outline-none"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 rounded cursor-pointer"
                    >
                      Log
                    </button>
                  </div>
                </form>

                {/* Internal, Agent, Customer triple notes edit panel */}
                <div className="space-y-2.5">
                  <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block">Triple Notes CRM Matrix</span>
                  
                  <div className="space-y-1 text-[10px]">
                    <label className="font-bold text-[#4B5563] uppercase block">Internal Admin Notes</label>
                    <textarea
                      value={tempNotesInternal}
                      onChange={(e) => setTempNotesInternal(e.target.value)}
                      className="w-full border border-slate-300 p-2 text-[10px] rounded bg-white"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-1 text-[10px]">
                    <label className="font-bold text-[#4B5563] uppercase block">On-field Agent Notes</label>
                    <textarea
                      value={tempNotesAgent}
                      onChange={(e) => setTempNotesAgent(e.target.value)}
                      className="w-full border border-slate-300 p-2 text-[10px] rounded bg-white"
                      rows={2}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveNotes(selectedLeadForDetails.id)}
                    className="w-full py-1.5 bg-[#111827] hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase rounded-lg cursor-pointer"
                  >
                    Commit Notes Ledger
                  </button>
                </div>

                {/* ACTIVITY TIMELINE STREAMS */}
                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-bold text-[#4B5563] font-mono block">Activity Timeline Logs ({selectedLeadForDetails.activities?.length || 0})</span>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 text-[10px] bg-slate-50 border border-slate-300 p-3 rounded-xl font-mono">
                    {(selectedLeadForDetails.activities || []).map((act, idx) => (
                      <div key={act.id} className="pt-2 first:pt-0">
                        <div className="flex justify-between font-bold text-slate-850">
                          <span className="uppercase font-black text-blue-600">[{act.type}]</span>
                          <span className="text-[8px] text-slate-450">{act.timestamp}</span>
                        </div>
                        <span className="text-slate-700 block mt-0.5 leading-tight">{act.content}</span>
                      </div>
                    ))}
                    {(selectedLeadForDetails.activities || []).length === 0 && (
                      <span className="text-slate-400 block py-2 text-center">No active history logged yet.</span>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 font-sans">
                Select any lead candidate on the left register to verify notes matrices.
              </div>
            )}
          </div>

        </div>
        </div>
      )}

      {/* RENDER TAB 3: CREATE NEW LEAD */}
      {activeSubTab === 'Add' && (
        <div className="bg-white border-2 border-slate-350 p-6 rounded-2xl shadow-xs animate-in fade-in duration-200">
          <div className="pb-4 border-b border-slate-200 mb-5">
            <h3 className="font-extrabold text-[#111827] text-lg">Create New Candidate Lead Form</h3>
            <p className="text-xs text-[#374151]">Ensure all contact telephone parameters adhere strictly to Indian ISD prefix rules</p>
          </div>

          <form onSubmit={handleCreateLeadSubmit} className="space-y-4 max-w-xl text-xs">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-[#4B5563] uppercase block">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Harshith Gowda"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full border border-slate-300 p-2.5 rounded-lg outline-none focus:border-blue-500 font-medium bg-white text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4B5563] uppercase block">Mobile Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 9448123456"
                  value={formMobile}
                  onChange={(e) => setFormMobile(e.target.value)}
                  className="w-full border border-slate-300 p-2.5 rounded-lg outline-none focus:border-blue-500 font-mono bg-white text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-[#4B5563] uppercase block">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. h.gowda@gmail.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full border border-slate-300 p-2.5 rounded-lg outline-none focus:border-blue-500 bg-white text-slate-900 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4B5563] uppercase block">Property Requirement Description</label>
                <input
                  type="text"
                  placeholder="e.g. JP Nagar gated 3 BHK or independent villa"
                  value={formPropReq}
                  onChange={(e) => setFormPropReq(e.target.value)}
                  className="w-full border border-slate-300 p-2.5 rounded-lg outline-none focus:border-blue-500 bg-white text-slate-900 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-[#4B5563] uppercase block">Budget Parameter</label>
                <input
                  type="text"
                  placeholder="e.g. ₹ 2.50 Cr"
                  value={formBudget}
                  onChange={(e) => setFormBudget(e.target.value)}
                  className="w-full border border-slate-300 p-2.5 rounded-lg outline-none focus:border-blue-500 bg-white text-slate-900 font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4B5563] uppercase block">Preferred Area / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Whitefield"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full border border-slate-300 p-2.5 rounded-lg outline-none focus:border-blue-500 bg-white text-slate-900 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4B5563] uppercase block">Acquisition Channel Source</label>
                <select
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  className="w-full border border-slate-300 p-2.5 rounded-lg text-xs bg-white text-slate-800"
                >
                  <option value="Website">Website</option>
                  <option value="Custom Request Form">Custom Request Form</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Phone Call">Phone Call</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Referral">Referral</option>
                  <option value="Walk-In Customer">Walk-In Customer</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-[#4B5563] uppercase block">Map Initial On-field Agent</label>
                <select
                  value={formAgentId}
                  onChange={(e) => setFormAgentId(e.target.value)}
                  className="w-full border border-slate-300 p-2.5 rounded-lg text-xs bg-white text-slate-800"
                >
                  <option value="">-- Choose Agent Owner (Optional) --</option>
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>{ag.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4B5563] uppercase block">Internal Admin Intake Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Urgent buyer, moving within 15 days."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full border border-slate-300 p-2.5 rounded-lg outline-none focus:border-blue-500 bg-white text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
            >
              Submit and Ingest Lead Coordinates
            </button>

          </form>
        </div>
      )}

      {/* RENDER TAB 4: STAGES PIPELINE KANBAN BOARD */}
      {activeSubTab === 'Pipeline' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <h3 className="font-bold text-[#111827] text-sm">Interactive Lead Pipeline Stages</h3>
            <p className="text-[11px] text-[#374151]">Drag or change drop-down selectors to visually track lead lifecycle states</p>
          </div>

          {/* Kanban row */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
            {PipelineStagesArr.map((stage) => {
              const stageLeads = leads.filter(l => l.status === stage);
              return (
                <div key={stage} className="min-w-[220px] max-w-[240px] shrink-0 bg-slate-50 border border-slate-300 p-3.5 rounded-2xl space-y-3">
                  
                  {/* Title of strip */}
                  <div className="flex justify-between items-center pb-2 border-b border-slate-205">
                    <span className="font-bold text-[#111827] text-xs font-mono uppercase tracking-tight block truncate max-w-[140px]">{stage}</span>
                    <span className="text-[9px] bg-[#111827] font-bold text-white px-1.5 py-0.2 rounded-full font-mono">{stageLeads.length}</span>
                  </div>

                  {/* Cards inside strip */}
                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {stageLeads.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => { setActiveSubTab('All'); setSelectedLeadForDetails(item); }}
                        className="bg-white border border-slate-300 p-3 rounded-xl hover:border-blue-500 shadow-3xs cursor-pointer transition space-y-2 relative"
                      >
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-[#111827] text-[12px] block hover:text-blue-600 leading-tight">{item.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono block font-bold">{item.budget}</span>
                        </div>
                        <p className="text-[10px] text-slate-650 leading-tight font-sans truncate">{item.propertyRequirement}</p>
                        
                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[9px] font-mono font-medium text-slate-450">
                          <span>Owner: <b className="text-slate-800">{item.agentName || 'No mapped'}</b></span>
                        </div>

                        {/* Quick Transfer Selector */}
                        <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.id, e.target.value as any)}
                            className="w-full border border-slate-250 p-1 rounded font-mono text-[8.5px] font-bold bg-slate-50 text-[#111827]"
                          >
                            {PipelineStagesArr.map(s => <option key={s} value={s}>Move: {s.toUpperCase()}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="p-4 border border-dashed border-slate-200 text-center text-slate-400 font-bold block rounded-xl text-[10px] uppercase font-mono">
                        Stage Empty
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RENDER TAB 5: LEAD FOLLOW-UPS */}
      {activeSubTab === 'FollowUps' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          
          {/* Scheduling ledger form */}
          <div className="lg:col-span-5 bg-white border border-slate-300 p-5 rounded-2xl shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-[#111827] text-sm">Schedule Meeting / Follow-up</h3>
              <p className="text-[11px] text-[#374151]">Append direct customer coordination callback protocols under tracking timeline</p>
            </div>

            <form onSubmit={handleAddFollowUp} className="space-y-3 text-xs">
              
              <div className="space-y-1">
                <label className="font-bold text-[#4B5563] uppercase block">Pick Target Client Lead Contact *</label>
                <select
                  value={selectedLeadForDetails?.id || ''}
                  onChange={(e) => {
                    const target = leads.find(l => l.id === e.target.value);
                    if (target) setSelectedLeadForDetails(target);
                  }}
                  className="w-full border border-slate-300 p-2.5 rounded-lg text-xs bg-white text-slate-800"
                >
                  <option value="">-- Pick registered client --</option>
                  {leads.map(l => <option key={l.id} value={l.id}>{l.name} ({l.mobile})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#4B5563] uppercase block">Action Date Coordinates</label>
                  <input
                    type="date"
                    required
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full border border-slate-300 p-2 rounded bg-white text-[#111827] font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#4B5563] uppercase block">Appointment Time</label>
                  <input
                    type="time"
                    required
                    value={followUpTime}
                    onChange={(e) => setFollowUpTime(e.target.value)}
                    className="w-full border border-slate-300 p-2 rounded bg-white text-[#111827] font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4B5563] uppercase block">Follow-up Call Objective & notes</label>
                <textarea
                  required
                  placeholder="e.g. Deliver revised structural plan documents..."
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  className="w-full border border-slate-300 p-2 rounded h-16 bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Schedule Appointment Dispatch
              </button>

            </form>
          </div>

          {/* ACTIVE APPOINTMENTS INDEX */}
          <div className="lg:col-span-7 bg-white border border-slate-300 p-5 rounded-2xl shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-[#111827] text-sm">Mapped Appointments Calendar Register</h3>
              <p className="text-[11px] text-[#374151]">Track completed or missing timeline client follow-up protocols</p>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {leads.map((lead) => {
                const fups = lead.followUps || [];
                if (fups.length === 0) return null;
                return fups.map((fip) => {
                  const isOverdue = new Date(fip.dateTime) < new Date() && !fip.completed;
                  return (
                    <div key={fip.id} className="p-3 border border-slate-300 hover:border-slate-400 rounded-xl flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#111827] text-[13px]">{lead.name}</span>
                          <span className={`text-[8.5px] uppercase font-mono px-1.5 py-0.2 rounded font-bold border ${
                            fip.completed 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                              : isOverdue 
                                ? 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse'
                                : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {fip.completed ? 'Cleared' : isOverdue ? 'Overdue' : 'Active'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-700 font-semibold">Objective: "{fip.notes}"</p>
                        <p className="text-[9px] text-slate-500 font-mono">Date Coordinate: {new Date(fip.dateTime).toLocaleDateString()} @ {new Date(fip.dateTime).toLocaleTimeString()}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleFollowUp(lead.id, fip.id)}
                          className={`p-1.5 rounded-lg border transition cursor-pointer font-bold text-[10px] ${
                            fip.completed 
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200' 
                              : 'bg-white border-slate-250 text-slate-600 hover:bg-slate-50/100'
                          }`}
                          title="Mark callback clear"
                        >
                          {fip.completed ? '✓ Cleared' : 'Clear Callback'}
                        </button>
                      </div>
                    </div>
                  );
                });
              })}
            </div>
          </div>

        </div>
      )}

      {/* RENDER TAB 6: REPORTS & ANALYTICS */}
      {activeSubTab === 'Reports' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Conversion Direct Ratio Ledger */}
            <div className="bg-white border border-slate-300 p-5 rounded-2xl shadow-xs space-y-4 text-center">
              <div>
                <h4 className="font-extrabold text-[#111827] text-sm font-sans block">Client Conversions Ledger</h4>
                <p className="text-[10px] text-slate-500 font-medium">Percentage calculated by factoring total pipeline closed items</p>
              </div>

              <div className="relative w-fit mx-auto">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="#f1f5f9"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="#2563eb"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={326.7}
                    strokeDashoffset={326.7 - (326.7 * (stats.total > 0 ? (stats.won / stats.total) : 0))}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
                  <span className="text-xl font-black text-[#111827]">
                    {stats.total > 0 ? ((stats.won / stats.total) * 100).toFixed(1) : "0.0"}%
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-400 font-mono leading-none">Ratio Yield</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-mono font-black text-slate-500">
                <div className="bg-slate-50 p-2 rounded border border-slate-205">
                  <span className="block text-slate-400">Total Leads</span>
                  <span className="text-[#111827] text-sm font-black">{stats.total}</span>
                </div>
                <div className="bg-emerald-50/50 p-2 rounded border border-emerald-100">
                  <span className="block text-emerald-500">Closed Won</span>
                  <span className="text-emerald-800 text-sm font-black">{stats.won}</span>
                </div>
              </div>
            </div>

            {/* Performance allocation per Agent mapping */}
            <div className="bg-white border border-slate-300 p-5 rounded-2xl shadow-xs space-y-4">
              <div>
                <h4 className="font-extrabold text-[#111827] text-sm block">Agent Performance matrix</h4>
                <p className="text-[10px] text-slate-500">Roster leads and closing counters registered programmatically</p>
              </div>

              <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
                {agents.map((ag) => {
                  const items = leads.filter(l => l.agentId === ag.id);
                  const won = items.filter(l => l.status === 'Closed Won').length;
                  const ratio = items.length > 0 ? ((won / items.length) * 100).toFixed(0) : 0;
                  return (
                    <div key={ag.id} className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div>
                        <span className="font-extrabold text-[#111827] block">{ag.name}</span>
                        <span className="text-[9px] text-[#374151] block">{items.length} Leads assigned</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase font-mono font-black text-[#111827]">{won} Closures ({ratio}%)</span>
                        <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold uppercase mt-1">Conversions</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lead Aging matrix charts */}
            <div className="bg-white border border-slate-300 p-5 rounded-2xl shadow-xs space-y-4 text-left">
              <div>
                <h4 className="font-extrabold text-[#111827] text-sm block">Lead Aging & Health Index</h4>
                <p className="text-[10px] text-slate-505">Aggregations showing time since intake clearance coordinate</p>
              </div>

              <div className="space-y-3 text-xs">
                
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-[#374151]">Fresh (0 - 5 days old)</span>
                    <span className="font-mono text-[#111827]">{leads.filter(l => new Date(l.createdAt) >= new Date(Date.now() - 5*24*60*60*1000)).length} Leads</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(leads.filter(l => new Date(l.createdAt) >= new Date(Date.now() - 5*24*60*60*1000)).length / stats.total) * 100}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-[#374151]">Nurturing (6 - 15 days old)</span>
                    <span className="font-mono text-[#111827]">{leads.filter(l => new Date(l.createdAt) < new Date(Date.now() - 5*24*60*60*1000) && new Date(l.createdAt) >= new Date(Date.now() - 15*24*60*60*1000)).length} Leads</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(leads.filter(l => new Date(l.createdAt) < new Date(Date.now() - 5*24*60*60*1000) && new Date(l.createdAt) >= new Date(Date.now() - 15*24*60*60*1000)).length / stats.total) * 100}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-[#374151]">Aging / Stale (&gt;15 days old)</span>
                    <span className="font-mono text-[#111827]">{leads.filter(l => new Date(l.createdAt) < new Date(Date.now() - 15*24*60*60*1000)).length} Leads</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(leads.filter(l => new Date(l.createdAt) < new Date(Date.now() - 15*24*60*60*1000)).length / stats.total) * 100}%` }} />
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* FULLY FUNCTIONAL EDIT MODAL INTERACTION */}
      {editingLead && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" onClick={() => setEditingLead(null)}>
          <div className="bg-white border-2 border-slate-300 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="pb-3 border-b border-slate-205 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-[#111827] text-base">Modifying Lead Dossier Parameters</h3>
                <p className="text-[11px] text-[#374151]">Updating core registry credentials for lead {editingLead.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingLead(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-black w-7 h-7 flex items-center justify-center cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                const updated: CRMLead = {
                  ...editingLead,
                  name: form.elements.name.value,
                  mobile: form.elements.mobile.value,
                  email: form.elements.email.value,
                  propertyRequirement: form.elements.propertyRequirement.value,
                  budget: form.elements.budget.value,
                  preferredLocation: form.elements.preferredLocation.value,
                  status: form.elements.status.value,
                  agentId: form.elements.agentId.value || undefined,
                  agentName: agents.find(a => a.id === form.elements.agentId.value)?.name || undefined,
                };
                
                setLeads(leads.map(l => l.id === editingLead.id ? updated : l));
                if (selectedLeadForDetails?.id === editingLead.id) {
                  setSelectedLeadForDetails(updated);
                }
                setEditingLead(null);
                logCardActivity(editingLead.id, 'Status Change', `Manually updated lead contact registration info via dynamic editor overlay`);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-[#4B5563] uppercase block">Client Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingLead.name}
                    className="w-full border border-slate-350 p-2 rounded-lg bg-white text-[#111827]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#4B5563] uppercase block">Phone Number *</label>
                  <input
                    type="text"
                    name="mobile"
                    required
                    defaultValue={editingLead.mobile}
                    className="w-full border border-slate-350 p-2 rounded-lg bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4B5563] uppercase block">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue={editingLead.email}
                  className="w-full border border-slate-350 p-2 rounded-lg bg-white text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-[#4B5563] uppercase block">Property Requirement *</label>
                  <input
                    type="text"
                    name="propertyRequirement"
                    required
                    defaultValue={editingLead.propertyRequirement}
                    className="w-full border border-slate-350 p-2 rounded-lg bg-white text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#4B5563] uppercase block">Financial Budget *</label>
                  <input
                    type="text"
                    name="budget"
                    required
                    defaultValue={editingLead.budget}
                    className="w-full border border-slate-350 p-2 rounded-lg bg-white text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#4B5563] uppercase block">Preferred Location Landmark *</label>
                <input
                  type="text"
                  name="preferredLocation"
                  required
                  defaultValue={editingLead.preferredLocation}
                  className="w-full border border-slate-350 p-2 rounded-lg bg-white text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-[#4B5563] uppercase block">Pipeline Stage</label>
                  <select
                    name="status"
                    defaultValue={editingLead.status}
                    className="w-full border border-slate-350 p-2.5 rounded-lg bg-white text-slate-800"
                  >
                    {PipelineStagesArr.map((st) => (
                      <option key={st} value={st}>{st.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#4B5563] uppercase block">Assigned Advisor</label>
                  <select
                    name="agentId"
                    defaultValue={editingLead.agentId || ''}
                    className="w-full border border-slate-350 p-2.5 rounded-lg bg-white text-slate-800"
                  >
                    <option value="">-- No Advisor --</option>
                    {agents.map((ag) => (
                      <option key={ag.id} value={ag.id}>{ag.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-205">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-550 text-slate-700 font-extrabold rounded-xl text-xs cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs cursor-pointer transition uppercase"
                >
                  Save Dossier Edits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
