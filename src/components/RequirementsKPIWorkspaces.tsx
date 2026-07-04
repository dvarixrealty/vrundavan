import React, { useState, useMemo } from 'react';
import { 
  X, BadgePercent, Check, Mail, Phone, Calendar, Send, Activity, Info, 
  User, MapPin, DollarSign, FileText, CheckCircle2, Award, Clock
} from 'lucide-react';
import { CustomRequirement, Property, Agent } from '../types';

interface KPIWorkspacesProps {
  selectedKpi: 'Matched' | 'Walkthroughs' | 'HighPriority' | 'ClosedDeals';
  onClose: () => void;
  localRequirements: CustomRequirement[];
  properties: Property[];
  agents: Agent[];
  siteVisits: any[];
  setSiteVisits?: React.Dispatch<React.SetStateAction<any[]>>;
  onOpenProfile: (req: CustomRequirement, tab: string) => void;
  onUpdateRequirement: (req: CustomRequirement) => void;
}

export default function RequirementsKPIWorkspaces({
  selectedKpi,
  onClose,
  localRequirements,
  properties,
  agents,
  siteVisits,
  setSiteVisits,
  onOpenProfile,
  onUpdateRequirement
}: KPIWorkspacesProps) {
  const [successToast, setSuccessToast] = useState('');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  const triggerToast = (text: string) => {
    setSuccessToast(text);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // 1. DYNAMIC AUTO MATCHED LIST GENERATION
  const autoMatchedList = useMemo(() => {
    const list: any[] = [];
    localRequirements.forEach(req => {
      const minBud = parseFloat((req.minBudget || '0').replace(/[^0-9]/g, '')) || 0;
      const maxBud = parseFloat((req.maxBudget || '999999999').replace(/[^0-9]/g, '')) || 999999999;
      const type = (req.propertyType || '').toLowerCase();
      const city = (req.preferredCity || '').toLowerCase();

      properties.forEach(p => {
        const locationMatch = p.location.toLowerCase().includes(city) || city.includes(p.location.toLowerCase());
        const typeMatch = p.type.toLowerCase().includes(type) || type.includes(p.type.toLowerCase());
        const budgetMatch = p.price >= minBud && p.price <= maxBud;

        let score = 0;
        if (locationMatch) score += 40;
        if (typeMatch) score += 30;
        if (budgetMatch) score += 30;

        if (score >= 50) {
          const approvedMatches = (req as any).approvedMatches || [];
          const rejectedMatches = (req as any).rejectedMatches || [];

          let matchStatus = 'Pending Review';
          if (approvedMatches.includes(p.id)) matchStatus = 'Approved';
          else if (rejectedMatches.includes(p.id)) matchStatus = 'Rejected';

          list.push({
            id: `match-${req.id}-${p.id}`,
            req,
            property: p,
            score,
            budgetMatch,
            locationMatch,
            status: matchStatus
          });
        }
      });
    });
    return list.sort((a, b) => b.score - a.score);
  }, [localRequirements, properties]);

  // Handle Match status mutation
  const handleToggleMatchApproval = (req: CustomRequirement, propId: string, action: 'Approve' | 'Reject') => {
    const approvedMatches = [...((req as any).approvedMatches || [])];
    const rejectedMatches = [...((req as any).rejectedMatches || [])];

    if (action === 'Approve') {
      if (!approvedMatches.includes(propId)) approvedMatches.push(propId);
      const ridx = rejectedMatches.indexOf(propId);
      if (ridx > -1) rejectedMatches.splice(ridx, 1);
    } else {
      if (!rejectedMatches.includes(propId)) rejectedMatches.push(propId);
      const aidx = approvedMatches.indexOf(propId);
      if (aidx > -1) approvedMatches.splice(aidx, 1);
    }

    const updated = {
      ...req,
      approvedMatches,
      rejectedMatches,
      activities: [
        {
          id: `act-${Date.now()}`,
          text: `Match with property "${properties.find(p=>p.id === propId)?.title}" manually ${action === 'Approve' ? 'Approved' : 'Rejected'}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          type: 'Match Update'
        },
        ...((req as any).activities || [])
      ]
    };

    onUpdateRequirement(updated);
    triggerToast(`Listing match marked as ${action === 'Approve' ? 'Approved' : 'Rejected'}!`);
  };

  // 2. ACTIVE SITE WALKTHROUGHS
  const activeWalkthroughs = useMemo(() => {
    return siteVisits.filter(v => v.status === 'Confirmed' || v.status === 'In Progress' || !v.status);
  }, [siteVisits]);

  const handleUpdateVisitStatus = (visitId: string, nextStatus: string) => {
    if (setSiteVisits) {
      setSiteVisits(prev => prev.map(v => v.id === visitId ? { ...v, status: nextStatus } : v));
      triggerToast(`Site visit status updated to "${nextStatus}"!`);
    }
  };

  const handleSaveVisitNotes = (visitId: string) => {
    if (setSiteVisits) {
      setSiteVisits(prev => prev.map(v => v.id === visitId ? { ...v, notes: editingNoteText } : v));
      setEditingNotesId(null);
      triggerToast('Site visit advisory notes updated!');
    }
  };

  // 3. HIGH PRIORITY CLIENTS
  const highPriorityClients = useMemo(() => {
    return localRequirements.filter(req => {
      const value = parseFloat((req.maxBudget || '0').replace(/[^0-9]/g, '')) || 0;
      return value >= 35000000 || req.timeline === 'Immediately' || (req as any).priority === 'High';
    });
  }, [localRequirements]);

  const handleUpdateFollowUp = (req: CustomRequirement, dateStr: string) => {
    const updated = {
      ...req,
      nextFollowUp: dateStr,
      activities: [
        {
          id: `act-${Date.now()}`,
          text: `Scheduled next follow-up date: ${dateStr}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          type: 'Note'
        },
        ...((req as any).activities || [])
      ]
    };
    onUpdateRequirement(updated);
    triggerToast('Follow-up schedule synchronized!');
  };

  const handleUpdateReminder = (req: CustomRequirement, text: string) => {
    const updated = {
      ...req,
      trackerReminder: text
    };
    onUpdateRequirement(updated);
  };

  // 4. CONCLUDED DEALS
  const concludedDeals = useMemo(() => {
    return localRequirements.filter(req => {
      const stage = (req as any).stage || '';
      return stage === 'Booking' || stage === 'Closed' || req.status === 'Archived';
    });
  }, [localRequirements]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 text-left space-y-6 shadow-xl animate-in fade-in duration-200">
      
      {/* Header operations bar */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-blue-50 text-blue-700 rounded-full font-mono font-bold text-[10px] uppercase">
              Operational Workspace
            </span>
            <span className="text-gray-300">/</span>
            <span className="text-xs font-semibold text-slate-500 font-mono">Real-time DB Active Connection</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 font-sans tracking-tight">
            {selectedKpi === 'Matched' && '🤝 Smart Auto Property Matrix'}
            {selectedKpi === 'Walkthroughs' && '🚶 Active Site Walkthrough Operations'}
            {selectedKpi === 'HighPriority' && '⭐ High Priority VIP Portfolios'}
            {selectedKpi === 'ClosedDeals' && '🏆 Closed & Concluded Deals Realized'}
          </h3>
          <p className="text-xs text-slate-500 font-sans">
            {selectedKpi === 'Matched' && 'Algorithmic matching comparing active client budget range and locations against property registries.'}
            {selectedKpi === 'Walkthroughs' && 'Confirmed physical walkthrough logs with advisor assignments, timelines, feedback, and notes.'}
            {selectedKpi === 'HighPriority' && 'High budget client parameters, fast track buyers, next call reminders, and premium allocations.'}
            {selectedKpi === 'ClosedDeals' && 'Concluded closings, verified token amounts, earned commission valuations, and legal deeds.'}
          </p>
        </div>

        <button 
          onClick={onClose}
          className="p-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
        >
          <X className="h-4 w-4" /> Exit Workspace
        </button>
      </div>

      {/* Dynamic Success Toast */}
      {successToast && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-100 rounded-xl max-w-sm animate-pulse">
          ✨ {successToast}
        </div>
      )}

      {/* 1. AUTO MATCHED WORKSPACE VIEW */}
      {selectedKpi === 'Matched' && (
        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-xs font-sans text-left">
            <thead className="bg-slate-50 text-slate-500 font-mono text-[9px] uppercase border-b border-slate-150">
              <tr>
                <th className="p-3.5">Buyer (Requirement)</th>
                <th className="p-3.5">Property Match Target</th>
                <th className="p-3.5 text-center">Score</th>
                <th className="p-3.5">Budget Eligibility</th>
                <th className="p-3.5">Location Placement</th>
                <th className="p-3.5">Workflow Status</th>
                <th className="p-3.5 text-right">Interactive Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {autoMatchedList.map((m) => {
                const isApproved = m.status === 'Approved';
                const isRejected = m.status === 'Rejected';

                return (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-3.5">
                      <div>
                        <span onClick={() => onOpenProfile(m.req, 'Overview')} className="font-bold text-slate-800 hover:underline cursor-pointer block">{m.req.fullName}</span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold block">{m.req.id} • {m.req.propertyType}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div>
                        <span className="font-semibold text-slate-950 block">{m.property.title}</span>
                        <span className="text-[10px] text-blue-600 font-mono font-bold block">₹{(m.property.price/10000000).toFixed(2)} Cr ({m.property.location})</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        m.score >= 90 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        {m.score}%
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`font-semibold ${m.budgetMatch ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {m.budgetMatch ? 'Within Budget Limit' : 'Out of Limits'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 font-medium">
                      {m.locationMatch ? 'Exact Match' : 'Surrounding Zone'}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-extrabold uppercase ${
                        isApproved ? 'bg-emerald-100 text-emerald-800' : isRejected ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex gap-1.5 justify-end">
                        <button 
                          onClick={() => onOpenProfile(m.req, 'Matches')}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer transition"
                        >
                          View Detail
                        </button>
                        <button 
                          onClick={() => {
                            const link = `https://wa.me/${m.req.mobileNumber.replace(/[^0-9]/g, '')}?text=Hi ${m.req.fullName}, we matched the beautiful listing *${m.property.title}* at ₹${(m.property.price/10000000).toFixed(2)} Cr which aligns perfectly. Details: dvarix.com/p/${m.property.id}`;
                            window.open(link, '_blank');
                            triggerToast('Dispatched broker brochure link simulated WhatsApp!');
                          }}
                          className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 text-[10px] font-bold rounded-lg cursor-pointer transition"
                          title="Share brochures via WhatsApp link"
                        >
                          Share Match
                        </button>
                        {!isApproved && (
                          <button 
                            onClick={() => handleToggleMatchApproval(m.req, m.property.id, 'Approve')}
                            className="px-2 py-1 bg-emerald-605 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition"
                          >
                            Approve
                          </button>
                        )}
                        {!isRejected && (
                          <button 
                            onClick={() => handleToggleMatchApproval(m.req, m.property.id, 'Reject')}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold rounded-lg cursor-pointer transition"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {autoMatchedList.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 italic">
                    No properties generated compatible matching thresholds.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. WALKTHROUGHS ACTIVE WORKSPACE VIEW */}
      {selectedKpi === 'Walkthroughs' && (
        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-xs font-sans text-left">
            <thead className="bg-slate-50 text-slate-500 font-mono text-[9px] uppercase border-b border-slate-150">
              <tr>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Property Showcase</th>
                <th className="p-3.5">Assigned Advisor</th>
                <th className="p-3.5 font-mono">Date / Time Schedule</th>
                <th className="p-3.5">Current Status</th>
                <th className="p-3.5">Advisory Feedback & Notes</th>
                <th className="p-3.5">Site Photo Reference</th>
                <th className="p-3.5 text-right">Operations Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {activeWalkthroughs.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-3.5 font-bold text-slate-800">{v.customerName}</td>
                  <td className="p-3.5 font-medium text-slate-700">{v.propertyTitle}</td>
                  <td className="p-3.5 text-slate-600 font-medium">👨‍💼 {v.agent}</td>
                  <td className="p-3.5 font-mono">{v.date} ({v.time})</td>
                  <td className="p-3.5">
                    <select
                      value={v.status || 'Confirmed'}
                      onChange={(e) => handleUpdateVisitStatus(v.id, e.target.value)}
                      className="p-1 px-1.5 bg-white border border-slate-200 rounded font-semibold text-[10px]"
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed Walk</option>
                      <option value="Cancelled">Cancelled Visit</option>
                    </select>
                  </td>
                  <td className="p-3.5 max-w-xs">
                    {editingNotesId === v.id ? (
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={editingNoteText}
                          onChange={(e) => setEditingNoteText(e.target.value)}
                          className="border border-slate-300 p-1 rounded text-xs w-full outline-none"
                        />
                        <button 
                          onClick={() => handleSaveVisitNotes(v.id)}
                          className="p-1 bg-blue-600 text-white rounded font-bold"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center group">
                        <span className="text-slate-500 italic block truncate max-w-[150px]">{v.notes || 'No active notes logged...'}</span>
                        <button 
                          onClick={() => {
                            setEditingNotesId(v.id);
                            setEditingNoteText(v.notes || '');
                          }}
                          className="text-[10px] text-blue-600 hover:underline opacity-0 group-hover:opacity-100 transition whitespace-nowrap pl-1"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="p-3.5">
                    {/* Simulated Site Photos preview */}
                    <div className="flex items-center gap-1">
                      <div className="h-7 w-10 bg-slate-200 border border-slate-300 rounded overflow-hidden flex items-center justify-center cursor-pointer hover:border-blue-500" title="Click to view full photo">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                      <span className="text-[9px] text-slate-450 font-mono">Walk_Report_01.jpg</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex gap-1 justify-end">
                      <button 
                        onClick={() => {
                          const num = agents.find(ag=>ag.name === v.agent)?.phone || '9876543210';
                          window.open(`https://wa.me/${num}?text=Hi ${v.agent}, please coordinate instructions for physical site tour for customer ${v.customerName} on ${v.date}.`, '_blank');
                        }}
                        className="px-2 py-0.9 bg-emerald-50 hover:bg-teal-50 text-emerald-700 text-[10px] font-bold rounded"
                        title="Ping assigned advisor expert"
                      >
                        Ping Advisor
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Confirm marking walkthrough completed?")) {
                            handleUpdateVisitStatus(v.id, 'Completed');
                          }
                        }}
                        className="p-1 bg-green-500 hover:bg-green-600 text-white rounded text-[10px]"
                      >
                        Complete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {activeWalkthroughs.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 italic">
                    No physical site walkthrough schedules active.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. HIGH PRIORITY VIP WORKSPACE VIEW */}
      {selectedKpi === 'HighPriority' && (
        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-xs font-sans text-left">
            <thead className="bg-slate-50 text-slate-500 font-mono text-[9px] uppercase border-b border-slate-150">
              <tr>
                <th className="p-3.5">VIP Candidate</th>
                <th className="p-3.5">Budget Capacity</th>
                <th className="p-3.5">Layout Requested (Type)</th>
                <th className="p-3.5 text-center">Urgency State</th>
                <th className="p-3.5">Next Call Follow-Up</th>
                <th className="p-3.5">Assigned Manager Specialist</th>
                <th className="p-3.5">Custom Tracker Reminder text</th>
                <th className="p-3.5 text-right">Call Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {highPriorityClients.map((c) => {
                const assignedAgent = agents.find(a => (c as any).assignedAgentId === a.id);

                return (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition duration-150 border-l-4 border-l-orange-500">
                    <td className="p-3.5">
                      <div>
                        <span onClick={() => onOpenProfile(c, 'Overview')} className="font-bold text-slate-850 block hover:underline cursor-pointer">{c.fullName}</span>
                        <span className="text-[10px] text-slate-450 block font-mono font-bold">{c.mobileNumber}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-blue-700 font-mono font-black">
                      ₹{c.minBudget ? `${c.minBudget} - ` : ''} ₹{c.maxBudget || 'N/A'}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-700">{c.bhkRequirement || 'General'} {c.propertyType}</span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-extrabold uppercase text-[9px] border border-rose-100 animate-pulse">
                        {c.timeline === 'Immediately' ? 'Critical Action' : 'High Priority'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {/* Standard Date inputs inline */}
                      <input
                        type="date"
                        value={(c as any).nextFollowUp || ''}
                        onChange={(e) => handleUpdateFollowUp(c, e.target.value)}
                        className="p-1 px-1.5 border border-slate-200 rounded font-semibold text-[10px]"
                      />
                    </td>
                    <td className="p-3.5">
                      <select
                        value={(c as any).assignedAgentId || ''}
                        onChange={(e) => {
                          const ag = agents.find(a=>a.id === e.target.value);
                          onUpdateRequirement({
                            ...c,
                            assignedAgentId: e.target.value,
                            assignedAgentName: ag?.name
                          } as any);
                          triggerToast(`Assigned portfolio expert to ${ag?.name || 'Unassigned'}!`);
                        }}
                        className="p-1 border border-slate-250 bg-white rounded text-[10px]"
                      >
                        <option value="">Unassigned Agent</option>
                        {agents.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3.5">
                      <input
                        type="text"
                        value={(c as any).trackerReminder || ''}
                        onChange={(e) => handleUpdateReminder(c, e.target.value)}
                        placeholder="Type persistent alert..."
                        className="p-1 border border-slate-200 rounded text-[10px] w-full max-w-[150px] outline-none"
                      />
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => {
                            window.open(`mailto:${c.emailAddress}?subject=Dvarix Premium Corporate Portfolio Allocations&body=Dear ${c.fullName}, following up regarding your premium requirement...`, '_blank');
                            triggerToast('Simulated email layout dispatch initialized.');
                          }}
                          className="p-1.5 text-blue-600 hover:bg-slate-100 rounded"
                          title="Compose Urgent Email Layout"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => {
                            window.open(`https://wa.me/${c.mobileNumber.replace(/[^0-9]/g, '')}?text=Dear ${c.fullName}, regarding our premium VIP property allocation, let us hop on a fast voice call today.`, '_blank');
                          }}
                          className="p-1.5 text-emerald-600 hover:bg-slate-100 rounded"
                          title="WhatsApp Direct Urgent Template"
                        >
                          <Phone className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {highPriorityClients.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 italic">
                    No VIP client requirements matching High Priority standards.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. CONCLUDED DEALS WORKSPACE VIEW */}
      {selectedKpi === 'ClosedDeals' && (
        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-xs font-sans text-left">
            <thead className="bg-slate-50 text-slate-500 font-mono text-[9px] uppercase border-b border-slate-150">
              <tr>
                <th className="p-3.5">Closed Buyer</th>
                <th className="p-3.5">Allocated Property</th>
                <th className="p-3.5">Agreement Type</th>
                <th className="p-3.5">Payment Token status</th>
                <th className="p-3.5 text-right">Gross Portfolio Value</th>
                <th className="p-3.5 text-right">Expected Revenue Generated</th>
                <th className="p-3.5 text-center">Advisor Commission Split</th>
                <th className="p-3.5">Secured Deal Papers</th>
                <th className="p-3.5 text-right">Operations Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {concludedDeals.map((d) => {
                const maxBudVal = parseFloat((d.maxBudget || '0').replace(/[^0-9]/g, '')) || 25000000;
                const estRevenueValue = maxBudVal * 0.015; // 1.5% commission rate
                const advisorySplit = estRevenueValue * 0.40; // 40% advisors split credit value

                return (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-3.5">
                      <div>
                        <span onClick={() => onOpenProfile(d, 'Overview')} className="font-bold text-slate-850 hover:underline cursor-pointer block">{d.fullName}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">ID: {d.id}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">
                      {d.propertyType} Unit at {d.preferredCity}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-medium font-mono text-[10px] border border-blue-100">
                        Corporate Sale Deed
                      </span>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={(d as any).paymentStatus || 'Cleared'}
                        onChange={(e) => {
                          onUpdateRequirement({
                            ...d,
                            paymentStatus: e.target.value
                          } as any);
                          triggerToast('Token Payment Ledger Status Updated.');
                        }}
                        className="p-1 border border-slate-250 rounded font-semibold text-[10px] bg-white"
                      >
                        <option value="Cleared">Cleared & Settled</option>
                        <option value="Processing">Processing Draft</option>
                        <option value="Authorized">Deposit Accepted</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-800">
                      ₹{(maxBudVal/10000000).toFixed(2)} Cr
                    </td>
                    <td className="p-3.5 text-right font-mono font-extrabold text-emerald-600">
                      ₹{(estRevenueValue/100000).toFixed(1)} L (1.5%)
                    </td>
                    <td className="p-3.5 text-center font-mono text-slate-500 font-medium">
                      ₹{(advisorySplit/100000).toFixed(1)} L Split (40%)
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="text-[9px] text-slate-500 font-semibold font-mono underline cursor-pointer">Cleared_Deed_Signed.pdf</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          const originalText = document.title;
                          document.title = `Invoice_${d.id}_Dvarix_Brokerage`;
                          window.print();
                          document.title = originalText;
                        }}
                        className="px-2 py-1 bg-slate-900 border hover:bg-slate-800 text-white font-bold text-[10px] rounded cursor-pointer"
                      >
                        Print Statements
                      </button>
                    </td>
                  </tr>
                );
              })}
              {concludedDeals.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400 italic">
                    No transactions matching Closed status ledgered yet. Move Kanban cards to Close Deal.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
