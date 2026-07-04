import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Calendar, Clock, Phone, BookOpen, Star, UserPlus, HelpCircle, 
  Search, ShieldAlert, Award, FileText, CheckCircle2, AlertCircle, Trash2, 
  Edit, Plus, Play, Copy, Eye, Send, ArrowRight, UserCheck, CheckSquare, 
  TrendingUp, BarChart3, Database, Save, MapPin, Sparkles, LogIn, ChevronLeft, 
  ChevronRight, ArrowUpDown, Filter, Upload, Download, EyeOff, Check, X, Mail
} from 'lucide-react';
import { CRMLead, Agent, AdminUser, Property, CustomRequirement } from '../types';
import { firebaseService } from '../lib/firebaseService';

interface SaaSAgentWorkspaceModuleProps {
  leads: CRMLead[];
  setLeads: React.Dispatch<React.SetStateAction<CRMLead[]>>;
  agents: Agent[];
  loggedInUser: AdminUser | null;
  properties: Property[];
  customRequirements: CustomRequirement[];
}

export default function SaaSAgentWorkspaceModule({
  leads,
  setLeads,
  agents,
  loggedInUser,
  properties,
  customRequirements
}: SaaSAgentWorkspaceModuleProps) {
  // Determine roles
  const userRole = loggedInUser?.roleName || 'Agent';
  const isManagerOrAdmin = ['Super Admin', 'Admin', 'Manager', 'Sales Manager', 'Team Leader'].includes(userRole);
  
  // States
  const [selectedAgentId, setSelectedAgentId] = useState<string>(() => {
    if (isManagerOrAdmin) {
      return agents[0]?.id || '';
    }
    // Find matching agent profile or use default
    const matchingAgent = agents.find(a => a.email.toLowerCase() === loggedInUser?.email.toLowerCase());
    return matchingAgent?.id || agents[0]?.id || '';
  });

  // Read only mode check (Managers viewing workspace)
  const isReadOnly = useMemo(() => {
    if (!loggedInUser) return true;
    if (isManagerOrAdmin) {
      const matchingAgent = agents.find(a => a.email.toLowerCase() === loggedInUser.email.toLowerCase());
      if (matchingAgent && matchingAgent.id === selectedAgentId) {
        return false; // Viewing own workspace
      }
      return false; // Managers have override/editing power per spec
    }
    // standard agent can only view own workspace
    const matchingAgent = agents.find(a => a.email.toLowerCase() === loggedInUser.email.toLowerCase());
    return matchingAgent ? matchingAgent.id !== selectedAgentId : true;
  }, [loggedInUser, isManagerOrAdmin, selectedAgentId, agents]);

  // Selected Agent Object
  const selectedAgent = useMemo(() => {
    return agents.find(a => a.id === selectedAgentId) || agents[0];
  }, [agents, selectedAgentId]);

  // Filter lists based on selected agent (if agent, can only see own. admin/manager sees own or selected)
  const agentLeads = useMemo(() => {
    if (!selectedAgent) return [];
    return leads.filter(l => l.agentId === selectedAgent.id || l.agentName?.toLowerCase() === selectedAgent.name.toLowerCase());
  }, [leads, selectedAgent]);

  // Dashboard layout filters
  const [kpiFilter, setKpiFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Customer selection for modal/profile view
  const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null);
  
  // Follow ups state
  const [followUpPeriod, setFollowUpPeriod] = useState<'all' | 'today' | 'tomorrow' | 'overdue' | 'upcoming'>('all');

  // New Note Modal / Input
  const [noteText, setNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // New Call Form
  const [showAddCall, setShowAddCall] = useState(false);
  const [callDuration, setCallDuration] = useState('5:20');
  const [callOutcome, setCallOutcome] = useState('Interested');
  const [callNotes, setCallNotes] = useState('');
  const [callNextAction, setCallNextAction] = useState('Schedule site visit');

  // WhatsApp panel states
  const [whatsappTemplate, setWhatsappTemplate] = useState('Welcome Intro');
  const [whatsappLogs, setWhatsappLogs] = useState<{id: string, text: string, time: string, sent: boolean}[]>([]);
  const [whatsappInput, setWhatsappInput] = useState('');

  // Email panel states
  const [emailTemplate, setEmailTemplate] = useState('Brochure Sharing');
  const [emailSubject, setEmailSubject] = useState('Premium Real Estate Catalog - Dvarix Realty');
  const [emailBody, setEmailBody] = useState('Hello, Hope you are doing well. Please find attached the brochure materials for our luxury premium flats in Bangalore.');

  // Site visits schedule form
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [visitDate, setVisitDate] = useState('2026-06-25');
  const [visitTime, setVisitTime] = useState('11:00 AM');
  const [visitPropertyId, setVisitPropertyId] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const [visitFeedback, setVisitFeedback] = useState('');
  const [visitStatus, setVisitStatus] = useState<'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled'>('Scheduled');

  // Negotiation pricing form
  const [showNegotiationForm, setShowNegotiationForm] = useState(false);
  const [offeredPrice, setOfferedPrice] = useState(12500000);
  const [counterPrice, setCounterPrice] = useState(12000000);
  const [discountAmount, setDiscountAmount] = useState(500000);
  const [negotiationStatus, setNegotiationStatus] = useState<'Pending Approval' | 'Approved' | 'Rejected'>('Pending Approval');

  // Document panel states
  const [uploadedDocs, setUploadedDocs] = useState<{id: string, name: string, category: string, fileType: string, date: string, size: string}[]>([
    { id: 'doc-1', name: 'Aadhaar_Card_Front.pdf', category: 'Aadhaar', fileType: 'PDF', date: '12-Jun-2026', size: '1.2 MB' },
    { id: 'doc-2', name: 'PAN_Card.png', category: 'PAN', fileType: 'Image', date: '12-Jun-2026', size: '640 KB' },
  ]);
  const [newDocName, setNewDocName] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('Sale Agreement');

  // AI Matching lists
  const matchedProperties = useMemo(() => {
    if (!selectedLead) return [];
    // Basic criteria matching against properties listing
    return properties.map(p => {
      let score = 75; // baseline match
      const pPrice = p.price;
      const budgetNum = parseInt(selectedLead.budget.replace(/[^0-9]/g, '')) || 10000000;
      
      // budget multiplier check
      const ratio = pPrice / budgetNum;
      if (ratio >= 0.8 && ratio <= 1.2) score += 15;
      else if (ratio < 0.8) score += 5;
      else score -= 10;

      // location match check
      if (p.location.toLowerCase().includes(selectedLead.preferredLocation.toLowerCase())) {
        score += 10;
      }

      // property type match check
      if (selectedLead.propertyRequirement?.toLowerCase().includes(p.type.toLowerCase())) {
        score += 10;
      }

      return {
        property: p,
        matchScore: Math.min(score, 99),
        budgetMatch: ratio >= 0.8 && ratio <= 1.2 ? 'Excellent' : ratio < 0.8 ? 'Below Budget' : 'Exceeds budget',
        locationMatch: p.location.toLowerCase().includes(selectedLead.preferredLocation.toLowerCase()) ? 'Strong' : 'Medium',
        amenitiesMatch: p.amenities.slice(0, 3).join(', ')
      };
    }).sort((a,b) => b.matchScore - a.matchScore).slice(0, 3);
  }, [selectedLead, properties]);

  // Tasks state (linked to CRM Task database table)
  const [tasksList, setTasksList] = useState<any[]>([]);

  // Site visits database sync
  const [siteVisitsList, setSiteVisitsList] = useState<any[]>([]);

  // Audit Logs logs
  const [auditLogsList, setAuditLogsList] = useState<any[]>([]);

  // Notifications alerts state
  const [notificationsAlerts, setNotificationsAlerts] = useState<any[]>([]);

  // Trigger real time synchronization on initialization and when selectedAgentId changes
  useEffect(() => {
    const unsubscribeTasks = firebaseService.subscribeCRMTasks(
      (list) => {
        // Filter by current agent id
        const agentTasks = list.filter(t => t.agentId === selectedAgentId || t.agentName?.toLowerCase() === selectedAgent?.name?.toLowerCase());
        setTasksList(agentTasks);
      },
      (err) => console.error(err)
    );

    const unsubscribeVisits = firebaseService.subscribeSiteVisits(
      (list) => {
        const agentVisits = list.filter(v => v.agentId === selectedAgentId || v.agentName?.toLowerCase() === selectedAgent?.name?.toLowerCase() || v.agent === selectedAgent?.name);
        setSiteVisitsList(agentVisits);
      },
      (err) => console.error(err)
    );

    const unsubscribeAudits = firebaseService.subscribeEnquiryAuditLogs(
      (list) => {
        setAuditLogsList(list.slice(0, 50));
      },
      (err) => console.error(err)
    );

    return () => {
      if (unsubscribeTasks) unsubscribeTasks();
      if (unsubscribeVisits) unsubscribeVisits();
      if (unsubscribeAudits) unsubscribeAudits();
    };
  }, [selectedAgentId, selectedAgent]);

  // Handle saving new task
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-06-25');
  const [newTaskCustomer, setNewTaskCustomer] = useState('');

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    
    const newTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      customer: newTaskCustomer || 'General',
      status: 'Pending',
      agentId: selectedAgentId,
      agentName: selectedAgent?.name || 'Agent',
      createdAt: new Date().toISOString()
    };

    await firebaseService.saveCRMTask(newTask);
    
    // Save Audit Trail
    await saveAuditLog('Create Task', `Created task: "${newTaskTitle}"`);
    
    // Trigger notification
    await triggerNotification('New Task Added', `A task "${newTaskTitle}" has been scheduled for due date ${newTaskDueDate}.`, 'Medium');

    setNewTaskTitle('');
    setShowAddTaskModal(false);
  };

  // Quick Complete Task
  const handleToggleTaskStatus = async (task: any) => {
    const updated = {
      ...task,
      status: task.status === 'Completed' ? 'Pending' : 'Completed'
    };
    await firebaseService.saveCRMTask(updated);
    await saveAuditLog('Task Update', `Marked task "${task.title}" as ${updated.status}`);
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    await firebaseService.deleteCRMTask(taskId);
    await saveAuditLog('Delete Task', `Deleted task ID ${taskId}`);
  };

  // Helper to save live audit trails to Firestore and notifications
  const saveAuditLog = async (action: string, description: string) => {
    const log = {
      id: `audit-${Date.now()}`,
      user: loggedInUser?.name || 'System',
      role: loggedInUser?.roleName || 'Agent',
      action,
      previousValue: '',
      newValue: description,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      ipAddress: '192.168.1.1',
      browser: 'Chrome Security Sandbox',
      createdAt: new Date().toISOString()
    };
    await firebaseService.saveEnquiryAuditLog(log);
  };

  const triggerNotification = async (title: string, message: string, priority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium') => {
    const noti = {
      id: `noti-${Date.now()}`,
      title,
      message,
      priority,
      category: 'Workspace',
      status: 'Active',
      createdAt: new Date().toISOString(),
      agentId: selectedAgentId
    };
    setNotificationsAlerts(prev => [noti, ...prev]);
  };

  // KPIs Calculations
  const kpis = useMemo(() => {
    const assigned = agentLeads.length;
    // Mock counts based on sample metrics mapping
    const newLeads = agentLeads.filter(l => l.status === 'New' || l.createdAt?.includes('Jun 1, 2026') || l.createdAt === new Date().toLocaleDateString('en-US')).length;
    const pendingFollowups = agentLeads.filter(l => l.followUps && l.followUps.some(f => !f.completed)).length;
    
    const callsCount = agentLeads.reduce((acc, l) => {
      const calls = l.activities?.filter(a => a.type === 'Call') || [];
      return acc + calls.length;
    }, 0);

    const siteVisitsCount = siteVisitsList.length;
    const negotiations = agentLeads.filter(l => l.status === 'Negotiation').length;
    const closedWon = agentLeads.filter(l => l.status === 'Closed Won' || l.status === 'Closed').length;
    const closedLost = agentLeads.filter(l => l.status === 'Closed Lost').length;
    
    // Revenue from Closed Won deals
    const revenue = agentLeads.reduce((acc, l) => {
      if (l.status === 'Closed Won' || l.status === 'Closed') {
        const budgetVal = parseInt(l.budget.replace(/[^0-9]/g, '')) || 0;
        return acc + budgetVal;
      }
      return acc;
    }, 0);

    const target = 50000000; // 5 Cr monthly targets
    const achievementPercent = Math.min(Math.round((revenue / target) * 100), 100);
    const commissionEarned = Math.round(revenue * 0.015); // 1.5% average commission index

    return {
      assigned,
      newLeads,
      pendingFollowups,
      callsCount,
      siteVisitsCount,
      negotiations,
      closedWon,
      closedLost,
      revenue,
      target,
      achievementPercent,
      commissionEarned
    };
  }, [agentLeads, siteVisitsList]);

  // Click handler on KPI Card to set target filtered lists
  const handleKpiCardClick = (filterName: string) => {
    setKpiFilter(filterName);
  };

  // Filtered Leads according to clicks
  const displayedLeads = useMemo(() => {
    return agentLeads.filter(l => {
      // 1. KPI Filter Category
      if (kpiFilter === 'New' && l.status !== 'New') return false;
      if (kpiFilter === 'Negotiation' && l.status !== 'Negotiation') return false;
      if (kpiFilter === 'ClosedWon' && l.status !== 'Closed Won' && l.status !== 'Closed') return false;
      if (kpiFilter === 'ClosedLost' && l.status !== 'Closed Lost') return false;
      if (kpiFilter === 'PendingFollowups' && (!l.followUps || !l.followUps.some(f => !f.completed))) return false;

      // 2. Search Query Term
      if (searchQuery) {
        const matchTerm = searchQuery.toLowerCase();
        const matchesName = l.name.toLowerCase().includes(matchTerm);
        const matchesLocation = l.preferredLocation.toLowerCase().includes(matchTerm);
        const matchesRequirement = l.propertyRequirement?.toLowerCase().includes(matchTerm);
        if (!matchesName && !matchesLocation && !matchesRequirement) return false;
      }

      // 3. Dropdowns
      if (stageFilter !== 'All' && l.status !== stageFilter) return false;
      
      return true;
    });
  }, [agentLeads, kpiFilter, searchQuery, stageFilter]);

  // Open Lead Detail page view
  const openLeadProfile = (lead: CRMLead) => {
    setSelectedLead(lead);
    // Extract logs if present
    setWhatsappLogs([
      { id: 'wa-1', text: `Hi ${lead.name}, this is ${selectedAgent?.name || 'Agent'} from Dvarix Realty corporate.`, time: '10:15 AM', sent: true },
      { id: 'wa-2', text: `Hello, thanks for reaching out. Please send across the brochure.`, time: '10:30 AM', sent: false }
    ]);
  };

  // Move Lead Stage
  const handleMoveStage = async (newStage: CRMLead['status']) => {
    if (!selectedLead) return;
    const updated = {
      ...selectedLead,
      status: newStage,
      activities: [
        {
          id: `act-${Date.now()}`,
          type: 'Status Change' as const,
          content: `Moved status stage to "${newStage}"`,
          timestamp: new Date().toLocaleString()
        },
        ...(selectedLead.activities || [])
      ]
    };

    const nextLeads = leads.map(l => l.id === selectedLead.id ? updated : l);
    setLeads(nextLeads);
    setSelectedLead(updated);

    // Sync to database
    await saveAuditLog('Lead Stage Change', `Updated lead "${selectedLead.name}" stage to: ${newStage}`);
    await triggerNotification('Stage Advanced', `Lead "${selectedLead.name}" has advanced to ${newStage}`, 'High');
  };

  // Add Note To current Lead
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !noteText) return;

    const newActivity = {
      id: `act-note-${Date.now()}`,
      type: 'Note' as const,
      content: noteText,
      timestamp: new Date().toLocaleString()
    };

    const updated = {
      ...selectedLead,
      activities: [newActivity, ...(selectedLead.activities || [])]
    };

    const nextLeads = leads.map(l => l.id === selectedLead.id ? updated : l);
    setLeads(nextLeads);
    setSelectedLead(updated);
    setNoteText('');

    await saveAuditLog('Add Note', `Added note on customer: ${selectedLead.name}`);
  };

  // Log Call Entry
  const handleAddCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    const newActivity = {
      id: `act-call-${Date.now()}`,
      type: 'Call' as const,
      content: `Inbound/Outbound Call: ${callDuration} mins. Status: ${callOutcome}. Action note: ${callNotes}. Next action: ${callNextAction}`,
      timestamp: new Date().toLocaleString()
    };

    const updated = {
      ...selectedLead,
      activities: [newActivity, ...(selectedLead.activities || [])]
    };

    const nextLeads = leads.map(l => l.id === selectedLead.id ? updated : l);
    setLeads(nextLeads);
    setSelectedLead(updated);

    setShowAddCall(false);
    setCallNotes('');

    await saveAuditLog('Log Call', `Logged a call with ${selectedLead.name} (${callDuration} mins)`);
    await triggerNotification('Call Registered', `Completed call with client ${selectedLead.name}`, 'Low');
  };

  // Schedule Site Visit
  const handleAddSiteVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    const visit = {
      id: `sv-${Date.now()}`,
      customerName: selectedLead.name,
      propertyId: visitPropertyId || properties[0]?.id || 'prop-1',
      propertyTitle: properties.find(p => p.id === visitPropertyId)?.title || 'Selected property walkthrough',
      date: visitDate,
      time: visitTime,
      status: visitStatus,
      agentId: selectedAgentId,
      agentName: selectedAgent?.name || 'Agent',
      agent: selectedAgent?.name || 'Agent',
      feedback: visitNotes || 'Walkthrough organized directly.',
      createdAt: new Date().toISOString()
    };

    await firebaseService.saveSiteVisit(visit);

    const newActivity = {
      id: `act-visit-${Date.now()}`,
      type: 'Site Visit' as const,
      content: `Site visit scheduled for property on ${visitDate} at ${visitTime}. Notes: ${visitNotes}`,
      timestamp: new Date().toLocaleString()
    };

    const updated = {
      ...selectedLead,
      status: 'Site Visit Scheduled' as const,
      activities: [newActivity, ...(selectedLead.activities || [])]
    };

    const nextLeads = leads.map(l => l.id === selectedLead.id ? updated : l);
    setLeads(nextLeads);
    setSelectedLead(updated);

    setShowAddVisit(false);
    setVisitNotes('');

    await saveAuditLog('Schedule Site Visit', `Created site visit appointment for: ${selectedLead.name}`);
    await triggerNotification('Site Walkthrough', `Walkthrough coordinates assigned for: ${selectedLead.name}`, 'High');
  };

  // Apply Negotiation Terms
  const handleApplyNegotiation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    const newActivity = {
      id: `act-neg-${Date.now()}`,
      type: 'Status Change' as const,
      content: `Negotiation terms proposed: Offered ₹${offeredPrice.toLocaleString()}, counter-negotiation: ₹${counterPrice.toLocaleString()}. Current approval state: ${negotiationStatus}`,
      timestamp: new Date().toLocaleString()
    };

    const updated = {
      ...selectedLead,
      status: 'Negotiation' as const,
      activities: [newActivity, ...(selectedLead.activities || [])]
    };

    const nextLeads = leads.map(l => l.id === selectedLead.id ? updated : l);
    setLeads(nextLeads);
    setSelectedLead(updated);

    setShowNegotiationForm(false);
    await saveAuditLog('Negotiation Terms Set', `Sought regulatory approval node for client terms: ${selectedLead.name}`);
  };

  // Upload/Add Documents
  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName) return;

    const newDoc = {
      id: `doc-${Date.now()}`,
      name: newDocName,
      category: newDocCategory,
      fileType: 'PDF',
      date: new Date().toLocaleDateString(),
      size: '1.8 MB'
    };

    setUploadedDocs(prev => [...prev, newDoc]);
    setNewDocName('');

    if (selectedLead) {
      const updated = {
        ...selectedLead,
        activities: [
          {
            id: `act-doc-${Date.now()}`,
            type: 'Note' as const,
            content: `Uploaded verification document folder: ${newDocCategory} - ${newDocName}`,
            timestamp: new Date().toLocaleString()
          },
          ...(selectedLead.activities || [])
        ]
      };
      setLeads(leads.map(l => l.id === selectedLead.id ? updated : l));
      setSelectedLead(updated);
    }
  };

  // Delete document
  const handleDeleteDoc = (docId: string) => {
    setUploadedDocs(uploadedDocs.filter(d => d.id !== docId));
  };

  // WhatsApp simulation send
  const handleSendWhatsapp = () => {
    if (!whatsappInput) return;
    const msg = {
      id: `wa-io-${Date.now()}`,
      text: whatsappInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sent: true
    };
    setWhatsappLogs(prev => [...prev, msg]);
    setWhatsappInput('');

    if (selectedLead) {
      // Add log
      const updated = {
        ...selectedLead,
        activities: [
          {
            id: `act-wa-${Date.now()}`,
            type: 'WhatsApp' as const,
            content: `WhatsApp sent: "${msg.text}"`,
            timestamp: new Date().toLocaleString()
          },
          ...(selectedLead.activities || [])
        ]
      };
      setLeads(leads.map(l => l.id === selectedLead.id ? updated : l));
      setSelectedLead(updated);
    }
  };

  return (
    <div className="space-y-6 text-left" id="saa_agent_workspace_root">
      
      {/* 1. UPPER UTILITY BAR / ROLE LEVEL ACCESS METRIC OVERLAYS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="h-5.5 w-5.5 text-blue-600" /> Operational Agent Workspace
          </h1>
          <p className="text-xs text-slate-500">
            {isReadOnly ? 'Viewing read-only CRM mapping dashboard' : `Active Sales dashboard assigned to advisor node: ${selectedAgent?.name || 'Roster specialist'}`}
          </p>
        </div>

        {/* Manager/Super Admin agent workspaces switcher */}
        {isManagerOrAdmin && (
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 border border-slate-200 rounded-xl">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 pl-2">Advisor View:</span>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="bg-white border border-slate-200 text-xs text-slate-800 font-bold px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 transition"
            >
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.role})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. DYNAMIC LIVE CORE KPIs PANEL */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <button 
          onClick={() => handleKpiCardClick('All')}
          className={`p-5 rounded-2xl border text-left transition cursor-pointer shadow-xs ${
            kpiFilter === 'All' 
              ? 'bg-blue-600 border-blue-600 text-white' 
              : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${kpiFilter === 'All' ? 'text-blue-100' : 'text-slate-500'}`}>Assigned Customers</span>
            <Users className={`h-4.5 w-4.5 ${kpiFilter === 'All' ? 'text-blue-200' : 'text-slate-400'}`} />
          </div>
          <p className="text-2xl font-black mt-2 font-mono">{kpis.assigned}</p>
          <div className={`text-[10px] mt-1.5 flex items-center gap-1 ${kpiFilter === 'All' ? 'text-blue-200' : 'text-slate-400'}`}>
            <span>Total pipeline accounts</span>
          </div>
        </button>

        {/* KPI 2 */}
        <button 
          onClick={() => handleKpiCardClick('New')}
          className={`p-5 rounded-2xl border text-left transition cursor-pointer shadow-xs ${
            kpiFilter === 'New' 
              ? 'bg-blue-600 border-blue-600 text-white' 
              : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${kpiFilter === 'New' ? 'text-blue-100' : 'text-slate-500'}`}>New Leads Today</span>
            <UserPlus className={`h-4.5 w-4.5 ${kpiFilter === 'New' ? 'text-blue-200' : 'text-slate-400'}`} />
          </div>
          <p className="text-2xl font-black mt-2 font-mono">{kpis.newLeads}</p>
          <div className={`text-[10px] mt-1.5 flex items-center gap-1 ${kpiFilter === 'New' ? 'text-blue-200' : 'text-blue-600 font-bold'}`}>
            <span>{kpis.newLeads > 0 ? '● Ingest alerts active' : 'No new inbounds yet'}</span>
          </div>
        </button>

        {/* KPI 3 */}
        <button 
          onClick={() => handleKpiCardClick('Negotiation')}
          className={`p-5 rounded-2xl border text-left transition cursor-pointer shadow-xs ${
            kpiFilter === 'Negotiation' 
              ? 'bg-blue-600 border-blue-600 text-white' 
              : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${kpiFilter === 'Negotiation' ? 'text-blue-100' : 'text-slate-500'}`}>Negotiations</span>
            <TrendingUp className={`h-4.5 w-4.5 ${kpiFilter === 'Negotiation' ? 'text-blue-200' : 'text-slate-400'}`} />
          </div>
          <p className="text-2xl font-black mt-2 font-mono">{kpis.negotiations}</p>
          <div className={`text-[10px] mt-1.5 flex items-center gap-1 ${kpiFilter === 'Negotiation' ? 'text-blue-200' : 'text-slate-400'}`}>
            <span>Deals nearing closure</span>
          </div>
        </button>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Commission Earned</span>
            <Award className="h-4.5 w-4.5 text-emerald-600" />
          </div>
          <p className="text-2xl font-black mt-2 font-mono text-emerald-600">₹{kpis.commissionEarned.toLocaleString()}</p>
          <div className="text-[10px] mt-1.5 text-slate-500 flex items-center gap-1">
            <span>Quota matched: </span>
            <span className="font-bold text-slate-800">{kpis.achievementPercent}% of Target</span>
          </div>
        </div>

      </div>

      {/* 3. CORE ADVISOR CONTENT Split View OR Specific profiles */}
      {selectedLead ? (
        
        /* INDIVIDUAL CUSTOMER WORKSPACE PROFILE VIEW */
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm space-y-6 p-6">
          
          {/* Upper Nav Back buttons */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <button 
              onClick={() => setSelectedLead(null)}
              className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition"
            >
              <ChevronLeft className="h-4 w-4" /> Exit Customer Profile & Return to list
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Customer ID: #{selectedLead.id}</span>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                selectedLead.status === 'New' ? 'bg-indigo-50 text-indigo-650' :
                selectedLead.status === 'Closed Won' ? 'bg-emerald-50 text-emerald-650' :
                selectedLead.status === 'Closed Lost' ? 'bg-rose-50 text-rose-650' : 'bg-amber-50 text-amber-650'
              }`}>{selectedLead.status}</span>
            </div>
          </div>

          {/* Core Profile split grids */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LHS: Basic Parameters Check & matched properties */}
            <div className="space-y-6">
              
              {/* Profile card details */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 font-black text-lg rounded-xl flex items-center justify-center">
                    {selectedLead.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{selectedLead.name}</h3>
                    <p className="text-[10px] font-mono text-slate-500">{selectedLead.email}</p>
                    <p className="text-[10px] font-mono text-slate-500">{selectedLead.mobile}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-200">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Requirement Target</span>
                    <span className="font-bold text-slate-800">{selectedLead.propertyRequirement || 'Family Flat'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Acquisition Budget</span>
                    <span className="font-bold text-blue-700 font-mono">{selectedLead.budget}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Preferred Location</span>
                    <span className="font-bold text-slate-800">{selectedLead.preferredLocation}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Source Origination</span>
                    <span className="font-bold text-slate-800">{selectedLead.source}</span>
                  </div>
                </div>

                {/* Operations tools buttons */}
                {!isReadOnly && (
                  <div className="space-y-2 pt-3 border-t border-slate-200">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Actions Gateway</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setShowAddCall(true)}
                        className="py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition"
                      >
                        <Phone className="h-3.5 w-3.5 text-blue-500" /> Log Call
                      </button>
                      <button 
                        onClick={() => setShowAddVisit(true)}
                        className="py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition"
                      >
                        <Calendar className="h-3.5 w-3.5 text-indigo-500" /> Site Visit
                      </button>
                      <button 
                        onClick={() => setShowNegotiationForm(true)}
                        className="py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition"
                      >
                        <TrendingUp className="h-3.5 w-3.5 text-teal-500" /> Negotiate
                      </button>
                      <button 
                        onClick={() => handleMoveStage('Closed Won')}
                        className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                      >
                        <Check className="h-3.5 w-3.5" /> Close Deal
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* PROPERTY MATCHING MODULE */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Perfect Property Matches</h4>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-mono font-bold rounded">AI Scoring Active</span>
                </div>

                <div className="space-y-3">
                  {matchedProperties.map((match, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-2 hover:border-blue-500 transition">
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">{match.property.title}</h5>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{match.property.address}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-bold text-blue-600 font-mono">₹{(match.property.price / 10000000).toFixed(2)} Cr</span>
                          <span className="text-[9px] text-slate-400">| Match: {match.locationMatch} Location</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-650 text-[10px] font-black font-mono rounded">
                          {match.matchScore}%
                        </span>
                      </div>
                    </div>
                  ))}
                  {matchedProperties.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No exact catalog props matching criteria yet.</p>
                  )}
                </div>
              </div>

            </div>

            {/* MID GRID: COLLABORATIVE TIMELINE & JOURNAL / NOTES */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Dynamic activity form selection Tabs */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="border-b border-slate-200 pb-3 mb-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Add Field Activities</span>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-mono rounded">WhatsApp Integration ready</span>
                  </div>
                </div>

                {/* NOTE LOGGING WORKSPACE */}
                <form onSubmit={handleAddNote} className="space-y-3">
                  <textarea
                    required
                    rows={2}
                    placeholder="Enter customer verification note, timeline report or meeting minutes..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="w-full bg-white border border-slate-250 text-slate-800 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500 transition font-sans"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">Notes record author name, date, and microsecond timestamps.</span>
                    <button
                      type="submit"
                      disabled={isReadOnly}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Save Internal Note
                    </button>
                  </div>
                </form>
              </div>

              {/* TIMELINE ACTIVITIES COMPONENT */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Interaction & Case Timeline History</h4>
                
                <div className="relative border-l-2 border-slate-100 pl-4 space-y-6 mt-2 ml-2">
                  
                  {/* Realtime generated timeline elements */}
                  {selectedLead.activities?.map((act) => (
                    <div key={act.id} className="relative text-left text-xs text-slate-700">
                      {/* marker node */}
                      <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white" />
                      
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 font-mono text-[10px] uppercase tracking-wider text-blue-600">
                            {act.type}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{act.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans">{act.content}</p>
                      </div>
                    </div>
                  ))}

                  <div className="relative text-left text-xs text-slate-400">
                    <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white" />
                    <div className="p-1 pl-2 font-mono text-[10px]">Lead Record created on: {selectedLead.createdAt}</div>
                  </div>

                </div>
              </div>

              {/* DOCUMENT REPOSITORY PANEL */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Aadhaar, PAN & Sourcing documents</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Real-time backup storage active</span>
                </div>

                <form onSubmit={handleUploadDoc} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Document Title (e.g. Sales_agreement.pdf)"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  />
                  <select
                    value={newDocCategory}
                    onChange={(e) => setNewDocCategory(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs px-2 rounded-lg"
                  >
                    <option value="Aadhaar">Aadhaar</option>
                    <option value="PAN">PAN</option>
                    <option value="Sale Agreement">Sale Agreement</option>
                    <option value="Token Invoice">Token Invoice</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <Upload className="h-3.5 w-3.5" /> Upload File
                  </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {uploadedDocs.map(doc => (
                    <div key={doc.id} className="p-3 border border-slate-100 rounded-xl flex items-center justify-between hover:bg-slate-50/50 transition">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4.5 w-4.5 text-blue-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{doc.name}</p>
                          <p className="text-[9px] text-slate-400 font-mono">{doc.category} • {doc.size}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="text-slate-400 hover:text-red-650 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* ADD CALL RECORD MODAL OVERLAY */}
          {showAddCall && (
            <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
              <div className="bg-white border border-slate-200 max-w-md w-full rounded-2xl p-6 text-left relative shadow-2xl">
                <button onClick={() => setShowAddCall(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Log Completed Voice Call</h3>
                
                <form onSubmit={handleAddCall} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Duration (Min/sec)</label>
                      <input 
                        type="text" 
                        required 
                        value={callDuration} 
                        onChange={(e) => setCallDuration(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 mt-1 px-3 py-1.5 text-xs text-slate-800 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Outcome Status</label>
                      <select 
                        value={callOutcome} 
                        onChange={(e) => setCallOutcome(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 mt-1 px-3 py-1.5 text-xs text-slate-800 rounded-lg"
                      >
                        <option value="Interested">Interested / Follow-up</option>
                        <option value="Call Scheduled">Follow-up Call Scheduled</option>
                        <option value="Not Interested">Not Interested</option>
                        <option value="Busy / No Answer">Unreachable / Busy</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Call Summary Notes</label>
                    <textarea 
                      rows={3} 
                      required
                      placeholder="Pricing and specifications discussed. Customer requested PDF files."
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 mt-1 p-3 text-xs text-slate-800 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Assigned Next Action</label>
                    <input 
                      type="text" 
                      value={callNextAction} 
                      onChange={(e) => setCallNextAction(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 mt-1 px-3 py-1.5 text-xs text-slate-800 rounded-lg"
                    />
                  </div>

                  <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded-lg">
                    Log Call & Register
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* SITE VISIT SCHEDULE MODAL OVERLAY */}
          {showAddVisit && (
            <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
              <div className="bg-white border border-slate-200 max-w-md w-full rounded-2xl p-6 text-left relative shadow-2xl">
                <button onClick={() => setShowAddVisit(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Organize Site Walks</h3>
                
                <form onSubmit={handleAddSiteVisit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Scheduled Date</label>
                      <input 
                        type="date" 
                        required 
                        value={visitDate} 
                        onChange={(e) => setVisitDate(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 mt-1 px-3 py-1.5 text-xs text-slate-800 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Scheduled Time</label>
                      <input 
                        type="text" 
                        required 
                        value={visitTime} 
                        onChange={(e) => setVisitTime(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 mt-1 px-3 py-1.5 text-xs text-slate-800 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Target Property Listing</label>
                    <select
                      value={visitPropertyId}
                      onChange={(e) => setVisitPropertyId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 mt-1 px-3 py-1.5 text-xs text-slate-800 rounded-lg"
                    >
                      {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.title} (₹{(p.price / 10000000).toFixed(2)} Cr)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Logistics & Meeting Notes</label>
                    <textarea 
                      rows={3} 
                      placeholder="Log logistics (e.g. company sedan transportation arranged) or priority criteria..."
                      value={visitNotes}
                      onChange={(e) => setVisitNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 mt-1 p-3 text-xs text-slate-800 rounded-lg"
                    />
                  </div>

                  <button type="submit" className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs uppercase rounded-lg">
                    Schedule & Dispatch Alerts
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* NEGOTIATION PROPOSAL MODAL OVERLAY */}
          {showNegotiationForm && (
            <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
              <div className="bg-white border border-slate-200 max-w-md w-full rounded-2xl p-6 text-left relative shadow-2xl">
                <button onClick={() => setShowNegotiationForm(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Set Price Negotiations</h3>
                
                <form onSubmit={handleApplyNegotiation} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Offered Price (INR)</label>
                    <input 
                      type="number" 
                      required 
                      value={offeredPrice} 
                      onChange={(e) => setOfferedPrice(Number(e.target.value))} 
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-800 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Counter-Negotiated Offer (INR)</label>
                    <input 
                      type="number" 
                      required 
                      value={counterPrice} 
                      onChange={(e) => setCounterPrice(Number(e.target.value))} 
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-800 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Proposed Disbursal Discount</label>
                    <input 
                      type="number" 
                      required 
                      value={discountAmount} 
                      onChange={(e) => setDiscountAmount(Number(e.target.value))} 
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-800 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Approval Authority Stage</label>
                    <select
                      value={negotiationStatus}
                      onChange={(e) => setNegotiationStatus(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-800 rounded-lg"
                    >
                      <option value="Pending Approval">Pending Approval by Sales Manager</option>
                      <option value="Approved">Approved / Authorized</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <button type="submit" className="w-full py-2 bg-teal-650 hover:bg-teal-700 text-white font-bold text-xs uppercase rounded-lg">
                    Lock Terms & Sync CRM
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>

      ) : (

        /* MAIN MASTER DETAILS Split VIEW layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LHS 2 Cols: My Customers table and dashboard filter catalog */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
              
              {/* Table search filters and category tags */}
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                
                {/* Text query */}
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 pl-9 pr-4 py-1.5 text-xs text-slate-800 rounded-xl focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                {/* KPI state filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-slate-450 font-mono">Stage:</span>
                  <select
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                    className="bg-white border border-slate-200 text-xs text-slate-800 font-bold px-3 py-1.5 rounded-lg focus:outline-none"
                  >
                    <option value="All">All Stages</option>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </select>

                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setStageFilter('All');
                      setKpiFilter('All');
                    }}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-lg text-xs font-bold transition"
                  >
                    Reset
                  </button>
                </div>

              </div>

              {/* Responsive main customers table */}
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left font-sans">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Requirements</th>
                      <th className="p-4">Budget Coordinates</th>
                      <th className="p-4">Workflow Stage</th>
                      <th className="p-4 text-right">Operations Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-705">
                    {displayedLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50/50 transition duration-150">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-bold flex items-center justify-center">
                              {lead.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{lead.name}</span>
                              <span className="text-[10px] font-mono text-slate-400 block">{lead.mobile}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-700 block">{lead.propertyRequirement || '3 BHK Garden Flat'}</span>
                          <span className="text-[10px] text-slate-450 block">{lead.preferredLocation || 'N/A'}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono font-bold text-blue-700">{lead.budget || '₹1.50 Cr'}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            lead.status === 'New' ? 'bg-indigo-50 text-indigo-650' :
                            lead.status === 'Closed Won' ? 'bg-emerald-50 text-emerald-650' :
                            lead.status === 'Closed Lost' ? 'bg-rose-50 text-rose-650' : 'bg-amber-50 text-amber-650'
                          }`}>{lead.status}</span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => openLeadProfile(lead)}
                            className="px-3 py-1 bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 hover:border-blue-300 rounded-lg font-bold transition flex items-center gap-1 ml-auto"
                          >
                            <Eye className="h-3.5 w-3.5" /> Workspace Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                    {displayedLeads.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                          No pipeline accounts currently matched to filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>

            {/* MY TASKS MANAGER COMPONENT */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Task Manager Checklist</h3>
                  <p className="text-[10px] text-slate-500">Realtime database synchronization is active</p>
                </div>
                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Schedule Action Task
                </button>
              </div>

              <div className="space-y-2">
                {tasksList.map(task => (
                  <div key={task.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between hover:border-slate-300 transition">
                    <div className="flex items-start gap-3">
                      <button 
                        onClick={() => handleToggleTaskStatus(task)}
                        className={`mt-0.5 p-0.5 rounded border transition ${
                          task.status === 'Completed' ? 'bg-blue-100 border-blue-500 text-blue-600' : 'border-slate-300 text-transparent hover:border-blue-400'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <div>
                        <p className={`text-xs font-bold ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            task.priority === 'High' ? 'bg-red-50 text-red-650' : 'bg-amber-50 text-amber-650'
                          }`}>
                            {task.priority} Priority
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Due: {task.dueDate}</span>
                          <span className="text-[10px] text-slate-400">• Customer: {task.customer}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-slate-400 hover:text-red-650 transition p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {tasksList.length === 0 && (
                  <p className="text-xs text-slate-400 italic text-center py-4">No active tasks assigned to this agent.</p>
                )}
              </div>
            </div>

          </div>

          {/* RHS COLUMN: DAILY LIVE ACTIVITY & TEAM PERFORMANCE MONITORING */}
          <div className="space-y-6">
            
            {/* DAILY WORK ACTIVITY Chronology */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Today's Dispatch Activity</h3>
                <p className="text-[10px] text-slate-500">Live system updates log terminal</p>
              </div>

              <div className="relative border-l-2 border-slate-100 pl-4 space-y-4 ml-2">
                {[
                  { time: '09:30 AM', act: 'Logged Inbound Call with Clarissa', type: 'Call' },
                  { time: '11:00 AM', act: 'Dispatched catalog brochure PDF via WhatsApp template', type: 'WhatsApp' },
                  { time: '12:15 PM', act: 'Scheduled walkthrough accompaniment', type: 'Site Visit' },
                  { time: '02:45 PM', act: 'Completed valuation negotiations', type: 'Negotiation' }
                ].map((act, id) => (
                  <div key={id} className="relative text-left text-xs">
                    <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-blue-600 border-2 border-white" />
                    <span className="font-mono text-[9px] text-slate-450 uppercase block font-black">{act.time}</span>
                    <span className="text-slate-700 block font-semibold leading-relaxed">{act.act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PERFORMANCE RADAR SCORER */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Performance Index Summary</h3>
                <p className="text-[10px] text-slate-500">Auto calculated on metrics matrix</p>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600">Site Visits Completed</span>
                    <span className="font-bold font-mono">{kpis.siteVisitsCount} / 8</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full transition" style={{ width: `${Math.min((kpis.siteVisitsCount / 8) * 100, 100)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600">Negotiations active</span>
                    <span className="font-bold font-mono">{kpis.negotiations}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-650 h-full transition animate-pulse" style={{ width: `${Math.min(kpis.negotiations * 25, 100)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600">Deals Closed Won</span>
                    <span className="font-bold font-mono">{kpis.closedWon}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full transition animate-pulse" style={{ width: `${Math.min(kpis.closedWon * 20, 100)}%` }} />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Conversion rate</span>
                    <span className="text-sm font-black font-mono text-slate-800">14.5%</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Avg feedback</span>
                    <span className="text-sm font-black font-mono text-emerald-600 flex items-center justify-center gap-0.5">
                      4.8 <Star className="h-3 w-3 fill-emerald-650" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* AUDIT LOG TRAIL (if Manager or Super Admin) */}
            {isManagerOrAdmin && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">Compliance Audit Trace</h3>
                  <p className="text-[10px] text-slate-500">Regulatory log node security</p>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {auditLogsList.slice(0, 5).map(log => (
                    <div key={log.id} className="p-2 border border-slate-100 rounded-lg text-[10px] hover:bg-slate-50 transition">
                      <div className="flex justify-between font-bold">
                        <span className="text-blue-600 uppercase font-mono">{log.action}</span>
                        <span className="text-slate-400 font-mono">{log.time}</span>
                      </div>
                      <p className="text-slate-600 mt-1">{log.newValue}</p>
                      <p className="text-slate-400 text-[9px] mt-0.5">User: {log.user} ({log.role})</p>
                    </div>
                  ))}
                  {auditLogsList.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center">No logs recorded in audit database.</p>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* ADD TASK MODAL */}
          {showAddTaskModal && (
            <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
              <div className="bg-white border border-slate-200 max-w-md w-full rounded-2xl p-6 text-left relative shadow-2xl">
                <button onClick={() => setShowAddTaskModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Add Action Checklist Task</h3>
                
                <form onSubmit={handleSaveTask} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Task Title</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Schedule corporate layout review"
                      value={newTaskTitle} 
                      onChange={(e) => setNewTaskTitle(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-800 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Priority Rating</label>
                      <select 
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-800 rounded-lg mt-1"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Target Due date</label>
                      <input 
                        type="date" 
                        required 
                        value={newTaskDueDate} 
                        onChange={(e) => setNewTaskDueDate(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-800 rounded-lg mt-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Associated Customer (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Samuel Wright"
                      value={newTaskCustomer} 
                      onChange={(e) => setNewTaskCustomer(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-800 rounded-lg focus:outline-none"
                    />
                  </div>

                  <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded-lg">
                    Schedule Task
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
