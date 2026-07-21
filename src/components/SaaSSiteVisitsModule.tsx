import React, { useState, useMemo } from 'react';
import { mysqlClientService } from '../lib/mysqlClientService';
import { 
  Calendar, Clock, User, Building2, Award, Plus, Search, CheckCircle2, 
  Trash2, X, AlertOctagon, RefreshCw, Star, Ban, CheckSquare, 
  ChevronRight, Smile, MapPin, ListFilter, Trash
} from 'lucide-react';
import { Property, Agent, CustomRequirement, Inquiry } from '../types';

interface SaaSSiteVisitsModuleProps {
  siteVisits: any[];
  setSiteVisits: React.Dispatch<React.SetStateAction<any[]>>;
  properties: Property[];
  agents: Agent[];
  customRequirements: CustomRequirement[];
  inquiries: Inquiry[];
  tasks: any[];
  setTasks: React.Dispatch<React.SetStateAction<any[]>>;
  isSuperAdmin: boolean;
  userPermissions: any;
  initialSubTab?: 'Upcoming' | 'Completed' | 'Cancelled' | 'Trash' | 'All';
}

export default function SaaSSiteVisitsModule({
  siteVisits,
  setSiteVisits,
  properties,
  agents,
  customRequirements,
  inquiries,
  tasks,
  setTasks,
  isSuperAdmin,
  userPermissions,
  initialSubTab
}: SaaSSiteVisitsModuleProps) {
  const [activeSubTab, setActiveSubTab] = React.useState<'Upcoming' | 'Completed' | 'Cancelled' | 'Trash' | 'All'>(initialSubTab || 'Upcoming');
  
  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVisit, setSelectedVisit] = useState<any | null>(null);
  
  // Administrative site visit auto assignment configuration setting
  const [autoAssignmentSetting, setAutoAssignmentSetting] = useState('Round Robin Assignment');

  // Fields for rescheduling, reassignment and notes inside outcomes modal
  const [outcomeDate, setOutcomeDate] = useState('');
  const [outcomeTime, setOutcomeTime] = useState('');
  const [outcomeAgent, setOutcomeAgent] = useState('');
  const [customerReaction, setCustomerReaction] = useState('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [newImageInput, setNewImageInput] = useState('');

  // Create visit dialog
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [targetCustomerSource, setTargetCustomerSource] = useState<'Requirement' | 'Inquiry'>('Requirement');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedPropId, setSelectedPropId] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [newVisitDate, setNewVisitDate] = useState('');
  const [newVisitTime, setNewVisitTime] = useState('11:00 AM');
  const [vehicleEscort, setVehicleEscort] = useState('Company Sedan');

  // Review states
  const [starRating, setStarRating] = useState(5);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [visitStatus, setVisitStatus] = useState<'Completed' | 'Cancelled' | 'No Show' | 'Scheduled'>('Completed');

  // Cancel reasons dialog
  const [cancelReasonState, setCancelReasonState] = useState('Customer Cancelled');
  const [customCancelNotes, setCustomCancelNotes] = useState('');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);

  // Success alert
  const [alertSuccess, setAlertSuccess] = useState('');

  // Auto matching dynamic list of customers
  const customersList = useMemo(() => {
    if (targetCustomerSource === 'Requirement') {
      return customRequirements.map(req => ({ id: req.id, name: req.fullName, extra: `${req.propertyType} - ${req.preferredCity}` }));
    } else {
      return inquiries.map(inq => ({ id: inq.id, name: inq.name, extra: inq.propertyName || 'Direct Listing Inquiry' }));
    }
  }, [targetCustomerSource, customRequirements, inquiries]);

  // Organizing walkthrough categories
  const filteredVisits = useMemo(() => {
    return siteVisits.filter(visit => {
      // Search matching name / property
      const term = searchTerm.toLowerCase();
      const matchText = visit.customerName.toLowerCase().includes(term) ||
                        visit.propertyTitle.toLowerCase().includes(term) ||
                        visit.agent.toLowerCase().includes(term);
      if (!matchText) return false;

      // Soft delete criteria
      const isDeleted = !!visit.isSoftDeleted;
      if (activeSubTab === 'Trash') return isDeleted;
      if (isDeleted) return false; // Hide trash from standard tabs

      // Status filters
      if (activeSubTab === 'Upcoming') {
        return visit.status === 'Confirmed' || visit.status === 'Scheduled';
      }
      if (activeSubTab === 'Completed') {
        return visit.status === 'Completed' || visit.status === 'Booked' || visit.status === 'Negotiation';
      }
      if (activeSubTab === 'Cancelled') {
        return visit.status === 'Cancelled' || visit.status === 'No Show' || visit.status === 'Postponed';
      }

      return true; // "All" tab maps
    });
  }, [siteVisits, searchTerm, activeSubTab]);

  // Submits walkthrough using Select Dropdowns instead of text inputs
  const handleArrangeVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedPropId || !newVisitDate) {
      alert("Error: Complete all dropdown coordinates to coordinate a physical walkthrough.");
      return;
    }

    const customer = customersList.find(c => c.id === selectedCustomerId);
    const prop = properties.find(p => p.id === selectedPropId);
    const advisor = agents.find(a => a.id === selectedAgentId) || agents[0];

    const newVisitObj = {
      id: `visit-crm-${Date.now()}`,
      customerName: customer?.name || 'Walk-In Buyer',
      propertyTitle: prop?.title || 'Selected listed unit',
      propertyId: prop?.id,
      date: newVisitDate,
      time: newVisitTime || '11:00 AM',
      status: 'Scheduled',
      agent: advisor?.name || 'Rahul Kumar',
      vehicle: vehicleEscort,
      feedback: '',
      rating: 5,
      isSoftDeleted: false
    };

    setSiteVisits(prev => [newVisitObj, ...prev]);
    // Dual-write to MySQL parallel database
    mysqlClientService.saveSiteVisit(newVisitObj);
    setShowCreateForm(false);
    setSelectedCustomerId('');
    setSelectedPropId('');
    setSelectedAgentId('');
    setNewVisitDate('');
    setAlertSuccess(`Coordinated Site Walkthrough Tour Scheduled for ${newVisitObj.customerName}`);
    setTimeout(() => setAlertSuccess(''), 4000);

    triggerGlobalNotification(
      `Walkthrough Appt: ${newVisitObj.customerName}`,
      `Tour scheduled for ${newVisitObj.propertyTitle} with advisor ${newVisitObj.agent}.`,
      'Site Visits'
    );
  };

  // Status transitions or Reviews matching feedback & star outlines
  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisit) return;

    // Build automated follow-up operations tasks if outcomes are Negotiating or Postponed
    if (visitStatus === 'Completed' && feedbackNotes.toLowerCase().includes('negotiat')) {
      createNewFollowUpTask(selectedVisit.customerName, 'Negotiation Deal Drafting', 'High');
    }

    const updated = siteVisits.map(v => {
      if (v.id === selectedVisit.id) {
        const payload = {
          ...v,
          status: visitStatus,
          feedback: feedbackNotes,
          rating: starRating,
          date: outcomeDate || v.date,
          time: outcomeTime || v.time,
          agent: outcomeAgent || v.agent,
          customerReaction: customerReaction,
          images: attachedImages
        };
        // Dual-write to MySQL parallel database
        mysqlClientService.saveSiteVisit(payload);
        return payload;
      }
      return v;
    });

    setSiteVisits(updated);
    setSelectedVisit(null);
    setFeedbackNotes('');
    setAlertSuccess(`Site visits walkthrough reviewed and verified.`);
    setTimeout(() => setAlertSuccess(''), 4000);
  };

  // Cancels Site walkthrough, prompts for cancel reasons and logs them
  const handleCancelWalkthrough = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisit) return;

    const cancelNotes = `[Cancelled]: Reason: ${cancelReasonState}. Notes: ${customCancelNotes || 'No notes compiled.'}`;

    const updated = siteVisits.map(v => {
      if (v.id === selectedVisit.id) {
        const payload = {
          ...v,
          status: 'Cancelled',
          feedback: cancelNotes,
          cancelReason: cancelReasonState
        };
        // Dual-write to MySQL parallel database
        mysqlClientService.saveSiteVisit(payload);
        return payload;
      }
      return v;
    });

    setSiteVisits(updated);
    setShowCancelPrompt(false);
    setSelectedVisit(null);
    setCustomCancelNotes('');
    setAlertSuccess(`Site walkthrough cancelled. Reason cataloged under audit lists.`);
    setTimeout(() => setAlertSuccess(''), 4000);

    createNewFollowUpTask(selectedVisit.customerName, `Reschedule Cancelled Walkthrough: ${cancelReasonState}`, 'Medium');

    triggerGlobalNotification(
      `Walkthrough Cancelled: ${selectedVisit.customerName}`,
      `Reason: ${cancelReasonState}`,
      'Site Visits'
    );
  };

  // Helper task creator
  const createNewFollowUpTask = (client: string, title: string, priority: string) => {
    const newTask = {
      id: `task-v-${Date.now()}`,
      title: `${client}: ${title}`,
      status: 'Pending',
      priority: priority,
      type: 'Follow Up',
      agent: 'Rahul Kumar',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const triggerGlobalNotification = (title: string, msg: string, category: string) => {
    const event = new CustomEvent('cms-alert-notification', {
      detail: { title, message: msg, category, timestamp: new Date().toISOString() }
    });
    window.dispatchEvent(event);
  };

  // Soft Delete Visit action (moves to trash)
  const handleSoftDelete = (visitId: string) => {
    const updated = siteVisits.map(v => {
      if (v.id === visitId) {
        const payload = { ...v, isSoftDeleted: true };
        mysqlClientService.saveSiteVisit(payload);
        return payload;
      }
      return v;
    });
    setSiteVisits(updated);
    setSelectedVisit(null);
    setAlertSuccess("Site Visit moved to Soft Deleted Trash Bin.");
    setTimeout(() => setAlertSuccess(''), 3000);
  };

  // Restore Visit action
  const handleRestoreVisit = (visitId: string) => {
    const updated = siteVisits.map(v => {
      if (v.id === visitId) {
        const payload = { ...v, isSoftDeleted: false };
        mysqlClientService.saveSiteVisit(payload);
        return payload;
      }
      return v;
    });
    setSiteVisits(updated);
    setAlertSuccess("Site Visit restored to active scheduler.");
    setTimeout(() => setAlertSuccess(''), 3000);
  };

  // Permanent Delete Visit action
  const handlePermanentDelete = (visitId: string) => {
    if (confirm("Permanently erase this site walkthrough from databases? This operation is irreversible.")) {
      setSiteVisits(prev => prev.filter(v => v.id !== visitId));
      mysqlClientService.deleteSiteVisit(visitId);
      setAlertSuccess("Site walkthrough permanently purged.");
      setTimeout(() => setAlertSuccess(''), 3000);
    }
  };

  return (
    <div className="space-y-6 text-left" id="saas-site-visits-crm">
      
      {/* Horiz Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-2 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">Site Walkthrough Scheduler</h2>
          <p className="text-xs text-slate-500">Arrange physical unit viewings, and log customer outcomes/feedback</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex bg-slate-100 rounded-xl p-0.5 border border-slate-200">
            {(['Upcoming', 'Completed', 'Cancelled', 'Trash', 'All'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition ${
                  activeSubTab === tab ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab === 'Upcoming' ? 'Upcoming Sessions' :
                 tab === 'Completed' ? 'Completed Tours' :
                 tab === 'Cancelled' ? 'Cancelled / Alerts' : 
                 tab === 'Trash' ? 'Trash Bin' : 'All Walkthroughs'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold font-sans transition flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" /> Arrange Tour Walkthrough
          </button>
        </div>
      </div>

      {/* Auto Assignment settings widget */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
        <div className="space-y-0.5">
          <h4 className="font-extrabold text-[#ff4d30] font-mono text-[10px] uppercase tracking-wider">Site Visit Allocation Settings</h4>
          <p className="text-slate-650 font-medium text-[11px]">Determine how incoming public bookings are allocated to agent rosters</p>
        </div>
        <div className="flex gap-2">
          <select
            value={autoAssignmentSetting}
            onChange={(e) => {
              setAutoAssignmentSetting(e.target.value);
              setAlertSuccess(`Site visit allocation strategy successfully switched to: ${e.target.value}`);
              setTimeout(() => setAlertSuccess(''), 4000);
            }}
            className="px-3 py-1.5 bg-white border border-slate-250 select-none cursor-pointer rounded-xl text-xs font-bold outline-none text-slate-800 focus:border-blue-500"
          >
            <option value="Round Robin Assignment">🔄 Round Robin Assignment (Active Rotating)</option>
            <option value="Assign Automatically">⚡ Assign Site Visit Automatically (Instant Match)</option>
            <option value="Assign Manually">👤 Assign Manually (Admin Advisory Triage)</option>
            <option value="Location Based Assignment">📍 Location Based Assignment (Area Specialty)</option>
            <option value="Agent Based Assignment">🎖️ Agent Based Assignment (Customer Loyalty)</option>
          </select>
        </div>
      </div>

      {alertSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-extrabold rounded-2xl border border-emerald-100 animation-pulse text-center">
          {alertSuccess}
        </div>
      )}

      {/* Directory Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        
        {/* Filters Top rail */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search walkthrough buyer, advisor, property..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 text-slate-800"
            />
          </div>

          <span className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-semibold text-slate-600">
            {filteredVisits.length} Walkthrough logs mapped
          </span>
        </div>

        {/* Dynamic Lists table representation */}
        <div className="overflow-x-auto text-xs font-sans">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-105 text-[10px] font-bold text-slate-500 uppercase tracking-wider uppercase font-mono">
                <th className="p-4">Visitor/Buyer</th>
                <th className="p-4">Allotted Property</th>
                <th className="p-4">Scheduled Coordinates</th>
                <th className="p-4">Staff Advisor</th>
                <th className="p-4">Outcome Status</th>
                <th className="p-4 text-right">Operations Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredVisits.map(visit => {
                const isTrash = activeSubTab === 'Trash';
                return (
                  <tr key={visit.id} className="hover:bg-slate-50/60 transition duration-150">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-800 text-xs block">{visit.customerName}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-600 truncate max-w-xs">{visit.propertyTitle}</span>
                      </div>
                    </td>
                    <td className="p-4 text-blue-650 font-bold font-mono">
                      {visit.date} ({visit.time})
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{visit.agent}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        visit.status === 'Completed' || visit.status === 'Booked' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        visit.status === 'Cancelled' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {visit.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {isTrash ? (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleRestoreVisit(visit.id)}
                            className="px-2 py-1 bg-blue-50 text-blue-650 rounded hover:bg-blue-105 transition hover:underline"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(visit.id)}
                            className="p-1 text-rose-550 hover:bg-rose-50 rounded"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => {
                              setSelectedVisit(visit);
                              setStarRating(visit.rating || 5);
                              setFeedbackNotes(visit.feedback || '');
                              setVisitStatus(visit.status || 'Completed');
                              setOutcomeDate(visit.date || '');
                              setOutcomeTime(visit.time || '11:00 AM');
                              setOutcomeAgent(visit.agent || '');
                              setCustomerReaction(visit.customerReaction || '');
                              setAttachedImages(visit.images || []);
                            }}
                            className="px-2.5 py-1 bg-white border border-slate-200 rounded hover:border-blue-500 hover:text-blue-650 transition font-bold"
                          >
                            Outcome Profile
                          </button>
                          
                          <button
                            onClick={() => handleSoftDelete(visit.id)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded transition"
                            title="Soft Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredVisits.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-bold">
                    No walkthrough bookings mapped in this categories.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DYNAMICS DUP-FREE SCHEDULING FORM MODAL */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-left space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-105">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Arrange Walkthrough Session</h4>
                <p className="text-[11px] text-slate-500 font-sans">Single source index: Selects options from synchronized databases</p>
              </div>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="text-slate-450 hover:text-slate-700 text-xs font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleArrangeVisit} className="space-y-4 text-xs text-slate-705">
              
              {/* Customer source segment selectors */}
              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase">Customer Directory Source *</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetCustomerSource('Requirement');
                      setSelectedCustomerId('');
                    }}
                    className={`py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                      targetCustomerSource === 'Requirement' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-505'
                    }`}
                  >
                    Match CRM Requirements
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetCustomerSource('Inquiry');
                      setSelectedCustomerId('');
                    }}
                    className={`py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                      targetCustomerSource === 'Inquiry' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-505'
                    }`}
                  >
                    Direct Website Inqs
                  </button>
                </div>
              </div>

              {/* Dynamic Customer Selector */}
              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase">Select Target Client candidate *</label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full border border-slate-200 bg-white p-2.5 rounded-xl outline-none font-sans font-bold"
                >
                  <option value="">Choose Catalog Client</option>
                  {customersList.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.extra.slice(0, 30)}..)</option>
                  ))}
                </select>
              </div>

              {/* Dynamic Property Selector */}
              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase">Select Target Property Unit *</label>
                <select
                  required
                  value={selectedPropId}
                  onChange={(e) => setSelectedPropId(e.target.value)}
                  className="w-full border border-slate-200 bg-white p-2.5 rounded-xl outline-none font-semibold text-slate-850"
                >
                  <option value="">Coordinate Property Address</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.title} - {p.location}</option>
                  ))}
                </select>
              </div>

              {/* Dynamic Advisor Selector */}
              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase">Select Expert Team Advisor *</label>
                <select
                  required
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full border border-slate-200 bg-white p-2.5 rounded-xl outline-none"
                >
                  <option value="">Choose Staff Escort</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.role})</option>
                  ))}
                </select>
              </div>

              {/* Date & Hours Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase">Schedule date *</label>
                  <input
                    type="date"
                    required
                    value={newVisitDate}
                    onChange={(e) => setNewVisitDate(e.target.value)}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase">Walkthrough Time hours</label>
                  <input
                    type="text"
                    value={newVisitTime}
                    onChange={(e) => setNewVisitTime(e.target.value)}
                    placeholder="e.g. 11:30 AM"
                    className="w-full border border-slate-200 p-2.5 rounded-xl"
                  />
                </div>
              </div>

              {/* Vehicle Escort Options */}
              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase">Assign Escort Logistics *</label>
                <select
                  value={vehicleEscort}
                  onChange={(e) => setVehicleEscort(e.target.value)}
                  className="w-full border border-slate-200 bg-white p-2.5 rounded-xl outline-none"
                >
                  <option value="Company Sedan">Company Sedan Escort</option>
                  <option value="Broker Car">External Broker Vehicle</option>
                  <option value="Self Driven Client">Self-Driven Client Walk-In</option>
                  <option value="SUV VIP">VIP armored SUV logistics</option>
                </select>
              </div>

              {/* Close CTAs */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-650 hover:bg-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Arrange walkthrough tour
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DETAILED OUTCOME ASSESSMENT MODAL OVERLAY */}
      {selectedVisit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-left space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-105">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Assess Walkthrough Outcome</h4>
                <p className="text-[11px] text-slate-500 font-sans">Submit ratings and follow-up directives</p>
              </div>
              <button 
                onClick={() => setSelectedVisit(null)}
                className="text-slate-450 hover:text-slate-700 text-xs font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            {showCancelPrompt ? (
              /* Cancellation Reason dropdown block */
              <form onSubmit={handleCancelWalkthrough} className="space-y-4 text-xs text-slate-755">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase">Reason for cancellation *</label>
                  <select
                    value={cancelReasonState}
                    onChange={(e) => setCancelReasonState(e.target.value)}
                    className="w-full border border-slate-200 bg-white p-2 rounded-xl outline-none"
                  >
                    <option value="Customer Cancelled">Customer Cancelled / Postponed Appointment</option>
                    <option value="Agent Unavailable">Agent Unavailable / Escort Issue</option>
                    <option value="Property Unavailable">Property Sold / Locked Out / key Unavailable</option>
                    <option value="Budget Issue">Budget Conflict detected during ride</option>
                    <option value="Location Issue">Location did not fit customer's vision</option>
                    <option value="Not Interested">Not Interested after mapping environment</option>
                    <option value="Other">Other Unspecified Issue</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase">Special cancellation remarks</label>
                  <textarea
                    rows={3}
                    value={customCancelNotes}
                    onChange={(e) => setCustomCancelNotes(e.target.value)}
                    placeholder="Customer scheduled callback for next Saturday or requested plots instead..."
                    className="w-full border p-2 rounded-lg font-sans resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCancelPrompt(false)}
                    className="px-3 py-1 bg-slate-100 rounded text-slate-600"
                  >
                    Go Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold"
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </form>
            ) : (
              /* Standard feedback and outcomes review */
              <form onSubmit={handleSaveReview} className="space-y-4 text-xs text-slate-755">
                
                <div className="bg-slate-50 p-2.5 rounded-xl border space-y-1">
                  <span className="text-slate-800 font-bold block">{selectedVisit.customerName}</span>
                  <span className="text-[10.5px] text-slate-500 block leading-tight">Property scheduled: {selectedVisit.propertyTitle}</span>
                  <span className="text-[10px] text-slate-450 block font-mono">Advisor Escort: {selectedVisit.agent} | Date: {selectedVisit.date} ({selectedVisit.time})</span>
                </div>

                {/* Status selector */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase">Assessment Outcome Status *</label>
                  <select
                    value={visitStatus}
                    onChange={(e) => setVisitStatus(e.target.value as any)}
                    className="w-full border border-slate-200 bg-white p-2 rounded-xl outline-none font-bold text-slate-800"
                  >
                    <option value="Scheduled">Scheduled (Confirmed / Confirmed)</option>
                    <option value="Completed">Completed (Successfully Visited)</option>
                    <option value="Negotiation">Under Offer / Negotiating Deal</option>
                    <option value="No Show">No Show (Customer did not arrive)</option>
                  </select>
                </div>

                {/* Reassign agent */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase block">Reassign Agent Advisor</label>
                  <select
                    value={outcomeAgent}
                    onChange={(e) => setOutcomeAgent(e.target.value)}
                    className="w-full border border-slate-200 bg-white p-2 rounded-xl outline-none font-semibold text-slate-800"
                  >
                    {agents.map(a => (
                      <option key={a.id} value={a.name}>{a.name} ({a.role})</option>
                    ))}
                  </select>
                </div>

                {/* Reschedule coordinates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 block">Reschedule Date</label>
                    <input
                      type="date"
                      value={outcomeDate}
                      onChange={(e) => setOutcomeDate(e.target.value)}
                      className="w-full border border-slate-200 p-2 rounded-xl font-mono text-xs text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 block">Reschedule Time Hour</label>
                    <input
                      type="text"
                      value={outcomeTime}
                      onChange={(e) => setOutcomeTime(e.target.value)}
                      className="w-full border border-slate-200 p-2 rounded-xl text-xs text-slate-800"
                    />
                  </div>
                </div>

                {/* Rating out of 5 stars */}
                <div className="space-y-1">
                  <label className="font-bold text-[#ff4d30] uppercase block">Client satisfaction rating</label>
                  <div className="flex gap-1.5 items-center">
                    {[1, 2, 3, 4, 5].map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStarRating(st)}
                        className="p-1 cursor-pointer transition text-yellow-500"
                      >
                        <Star className={`h-6 w-6 ${st <= starRating ? 'fill-yellow-400 text-yellow-500' : 'text-slate-350'}`} />
                      </button>
                    ))}
                    <span className="text-slate-500 font-bold font-mono ml-2">({starRating}/5 Stars)</span>
                  </div>
                </div>

                {/* Feedback Notes */}
                <div className="space-y-1 font-sans">
                  <label className="font-bold text-slate-500 uppercase block">Advisor / Reviewer Audit Remarks</label>
                  <textarea
                    rows={2}
                    required
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
                    placeholder="e.g. Buyer loved high ceiling heights and requested payment schedules..."
                    className="w-full border border-slate-200 p-2.5 rounded-xl resize-none font-sans outline-none focus:border-blue-500 text-slate-800"
                  />
                </div>

                {/* Customer Feedback Reaction */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase block">Customer Sentiment Reaction</label>
                  <textarea
                    rows={2}
                    value={customerReaction}
                    onChange={(e) => setCustomerReaction(e.target.value)}
                    placeholder="e.g. Verified coordinates, interested in booking token advance by Tuesday..."
                    className="w-full border border-slate-200 p-2.5 rounded-xl resize-none outline-none focus:border-blue-500 text-slate-800 font-sans"
                  />
                </div>

                {/* Attached site feedback images */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase block font-sans">Attached Site Walkthrough Photos</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newImageInput}
                      onChange={(e) => setNewImageInput(e.target.value)}
                      placeholder="Paste feedback image URL or attach mock..."
                      className="flex-1 border border-slate-200 p-2 rounded-xl text-xs text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const url = newImageInput.trim() || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=300&q=80';
                        setAttachedImages(prev => [...prev, url]);
                        setNewImageInput('');
                      }}
                      className="px-3 bg-slate-900 border border-slate-805 text-white rounded-xl text-xs font-bold hover:bg-slate-850 cursor-pointer"
                    >
                      Attach
                    </button>
                  </div>
                  {attachedImages.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {attachedImages.map((img, i) => (
                        <div key={i} className="relative w-11 h-11 rounded-lg overflow-hidden border">
                          <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => setAttachedImages(prev => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action CTAs */}
                <div className="flex wrap gap-2 pt-2 border-t border-slate-55 flex-wrap justify-between items-center">
                  
                  <button
                    type="button"
                    onClick={() => setShowCancelPrompt(true)}
                    className="px-3 py-1.5 text-rose-600 bg-rose-50 border border-rose-100 font-bold hover:bg-rose-100 transition rounded-xl text-center cursor-pointer"
                  >
                    Cancel Walkthrough Appointment
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedVisit(null)}
                      className="px-3.5 py-1.5 bg-slate-100 text-slate-650 hover:bg-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Save Verification
                    </button>
                  </div>

                </div>

              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
