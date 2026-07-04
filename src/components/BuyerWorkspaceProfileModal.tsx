import React, { useState, useMemo } from 'react';
import { 
  X, Mail, Phone, Calendar, Send, Activity, User, MapPin, 
  DollarSign, FileText, CheckCircle2, ChevronRight, Eye, Edit, Trash2, 
  Sparkles, CheckSquare, MessageSquare, BadgePercent, Shield, Info, Upload
} from 'lucide-react';
import { CustomRequirement, Property, Agent } from '../types';
import { firebaseService } from '../lib/firebaseService';

interface BuyerProfileModalProps {
  requirement: CustomRequirement;
  properties: Property[];
  agents: Agent[];
  onClose: () => void;
  onUpdateRequirement: (req: CustomRequirement) => void;
  onDeleteRequirement: (id: string) => void;
  siteVisits: any[];
  setSiteVisits?: React.Dispatch<React.SetStateAction<any[]>>;
  tasks: any[];
  setTasks?: React.Dispatch<React.SetStateAction<any[]>>;
  triggerToast: (text: string) => void;
}

export default function BuyerWorkspaceProfileModal({
  requirement,
  properties,
  agents,
  onClose,
  onUpdateRequirement,
  onDeleteRequirement,
  siteVisits,
  setSiteVisits,
  tasks,
  setTasks,
  triggerToast
}: BuyerProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Matches' | 'Visits' | 'Documents' | 'Omnichannel'>('Overview');
  const [isEditMode, setIsEditMode] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState(requirement.fullName);
  const [mobileNumber, setMobileNumber] = useState(requirement.mobileNumber);
  const [emailAddress, setEmailAddress] = useState(requirement.emailAddress || '');
  const [propertyType, setPropertyType] = useState(requirement.propertyType || 'Apartment');
  const [preferredCity, setPreferredCity] = useState(requirement.preferredCity);
  const [preferredArea, setPreferredArea] = useState(requirement.preferredArea || '');
  const [minBudget, setMinBudget] = useState(requirement.minBudget || '');
  const [maxBudget, setMaxBudget] = useState(requirement.maxBudget || '');
  const [plotSize, setPlotSize] = useState(requirement.plotSize || '');
  const [bhkRequirement, setBhkRequirement] = useState(requirement.bhkRequirement || '2 BHK');
  const [timeline, setTimeline] = useState(requirement.timeline);
  const [lookingFor, setLookingFor] = useState(requirement.lookingFor);
  const [message, setMessage] = useState(requirement.message || '');
  const [loanRequired, setLoanRequired] = useState(requirement.loanRequired || 'No');
  
  // Custom checklist
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [internalNotes, setInternalNotes] = useState((requirement as any).internalNotes || '');

  // Negotiation Details
  const [offerPrice, setOfferPrice] = useState('');
  const [counterPrice, setCounterPrice] = useState('');
  const [ownerApproval, setOwnerApproval] = useState(false);
  const [negNotes, setNegNotes] = useState('');

  // Booking Details
  const [bookingAmount, setBookingAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Pending');

  // Site visits scheduler details
  const [schedulePropId, setSchedulePropId] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleAgent, setScheduleAgent] = useState('');

  // Documents
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('KYC Aadhaar Copy');

  // Omnichannel message log
  const [chatInput, setChatInput] = useState('');

  // Initializing collections safely to handle non-exist properties
  const activities = useMemo(() => (requirement as any).activities || [], [requirement]);
  const negotiations = useMemo(() => (requirement as any).negotiations || [], [requirement]);
  const documents = useMemo(() => (requirement as any).documents || [
    { id: 'doc-1', name: 'Aadhaar_KYC_Verified.pdf', type: 'KYC Document', date: '2026-06-18' },
    { id: 'doc-2', name: 'Income_Tax_Schedules.pdf', type: 'Financial Statement', date: '2026-06-19' }
  ], [requirement]);
  const communicationLogs = useMemo(() => (requirement as any).communicationLogs || [
    { id: 'log-1', type: 'WhatsApp', text: 'Catalog dispatch completed by marketing engine', date: '2026-06-19 11:24 AM' },
    { id: 'log-2', type: 'Call', text: 'Discussed highrise villas of JP Nagar corridor', date: '2026-06-20 03:45 PM' }
  ], [requirement]);

  // Compute Auto Matching Score List
  const autoMatchedProperties = useMemo(() => {
    const minBudNum = parseFloat((maxBudget || '0').replace(/[^0-9]/g, '')) * 0.7 || 0;
    const maxBudNum = parseFloat((maxBudget || '999999999').replace(/[^0-9]/g, '')) * 1.3 || 999999999;
    const typeStr = (propertyType || '').toLowerCase();
    const cityStr = (preferredCity || '').toLowerCase();

    return properties.map(p => {
      const locationMatch = p.location.toLowerCase().includes(cityStr) || cityStr.includes(p.location.toLowerCase());
      const typeMatch = p.type.toLowerCase().includes(typeStr) || typeStr.includes(p.type.toLowerCase());
      const budgetMatch = p.price >= minBudNum && p.price <= maxBudNum;

      let score = 10;
      if (locationMatch) score += 40;
      if (typeMatch) score += 25;
      if (budgetMatch) score += 25;

      // Distance estimation & compliance
      const mockDistance = (Math.random() * 2.5 + 0.3).toFixed(1);
      const isApproved = ((requirement as any).approvedMatches || []).includes(p.id);
      const isRejected = ((requirement as any).rejectedMatches || []).includes(p.id);

      return {
        property: p,
        score,
        budgetMatch,
        locationMatch,
        distance: `${mockDistance} km to target sector`,
        isApproved,
        isRejected
      };
    }).sort((a,b) => b.score - a.score);
  }, [properties, propertyType, preferredCity, maxBudget, requirement]);

  // Filter site visits specifically for this user
  const customerTours = useMemo(() => {
    return siteVisits.filter(v => v.customerName === requirement.fullName);
  }, [siteVisits, requirement]);

  // Handle Save Core Metadata Form
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const updated = {
      ...requirement,
      fullName,
      mobileNumber,
      emailAddress: emailAddress || undefined,
      propertyType,
      preferredCity,
      preferredArea: preferredArea || undefined,
      minBudget: minBudget || undefined,
      maxBudget: maxBudget || undefined,
      plotSize: plotSize || undefined,
      bhkRequirement: bhkRequirement || undefined,
      timeline,
      lookingFor,
      message: message || undefined,
      loanRequired,
      internalNotes,
      activities: [
        {
          id: `act-${Date.now()}`,
          text: `Client CRM Profile Metadata revised & edited by advisor`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          type: 'Note'
        },
        ...activities
      ]
    };

    await firebaseService.saveRequirement(updated);
    onUpdateRequirement(updated);
    setIsEditMode(false);
    triggerToast('Core metadata updated thoroughly!');
  };

  // Schedule Physical visit tour
  const handleAddWalkthrough = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulePropId || !scheduleDate) return;

    const prop = properties.find(p=>p.id === schedulePropId);
    const assignedAgt = agents.find(a=>a.id === scheduleAgent) || agents[0];

    // Add walkthrough 
    const newVisitObj = {
      id: `visit-${Date.now()}`,
      customerName: requirement.fullName,
      propertyTitle: prop?.title || 'Selected Property',
      date: scheduleDate,
      time: scheduleTime || 'Anytime 11:00 AM-7:00 PM',
      status: 'Confirmed',
      agent: assignedAgt?.name || 'Rahul Kumar',
      notes: 'Initial customized site tour configured.'
    };

    if (setSiteVisits) {
      setSiteVisits(prev => [newVisitObj, ...prev]);
    }

    // append activities log
    const updated = {
      ...requirement,
      stage: 'Site Visit',
      status: 'Contacted' as const,
      activities: [
        {
          id: `act-${Date.now()}`,
          text: `Physical Walkthrough booked for property "${prop?.title}" on ${scheduleDate}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          type: 'Site Visit'
        },
        ...activities
      ]
    };

    await firebaseService.saveRequirement(updated);
    onUpdateRequirement(updated);

    // reset fields
    setSchedulePropId('');
    setScheduleDate('');
    setScheduleTime('');
    triggerToast('Site Tour walkthrough coordinated and synched!');
  };

  // Toggle approvals inside Matches tab
  const handleToggleListingMatch = async (propId: string, action: 'Approve' | 'Reject') => {
    const approvedMatches = [...((requirement as any).approvedMatches || [])];
    const rejectedMatches = [...((requirement as any).rejectedMatches || [])];

    if (action === 'Approve') {
      if (!approvedMatches.includes(propId)) approvedMatches.push(propId);
      const rIdx = rejectedMatches.indexOf(propId);
      if (rIdx > -1) rejectedMatches.splice(rIdx, 1);
    } else {
      if (!rejectedMatches.includes(propId)) rejectedMatches.push(propId);
      const aIdx = approvedMatches.indexOf(propId);
      if (aIdx > -1) approvedMatches.splice(aIdx, 1);
    }

    const updated = {
      ...requirement,
      approvedMatches,
      rejectedMatches,
      activities: [
        {
          id: `act-match-${Date.now()}`,
          text: `Property match with "${properties.find(p=>p.id === propId)?.title}" marked ${action}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          type: 'Match Update'
        },
        ...activities
      ]
    };

    await firebaseService.saveRequirement(updated);
    onUpdateRequirement(updated);
    triggerToast(`Listing Match has been ${action === 'Approve' ? 'Approved' : 'Rejected'}!`);
  };

  // Log custom Negotiations
  const handleAddNegotiation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerPrice) return;

    const newNeg = {
      id: `neg-${Date.now()}`,
      offerPrice,
      counterPrice: counterPrice || 'No counter-bid set',
      ownerApproval: ownerApproval ? 'Accepted by Developer' : 'Reviewing Developer Bid',
      notes: negNotes || 'No negotiation footnotes added.',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const updated = {
      ...requirement,
      stage: 'Negotiation',
      negotiations: [newNeg, ...negotiations],
      activities: [
        {
          id: `act-neg-${Date.now()}`,
          text: `Negotiation bid logged. Customer offer ₹${offerPrice}, Developer response status: ${newNeg.ownerApproval}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          type: 'Note'
        },
        ...activities
      ]
    };

    await firebaseService.saveRequirement(updated);
    onUpdateRequirement(updated);
    
    setOfferPrice('');
    setCounterPrice('');
    setNegNotes('');
    triggerToast('Negotiation transaction logged!');
  };

  // Log final token deposits / booking
  const handleFinalizeBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingAmount) return;

    const updated = {
      ...requirement,
      stage: 'Booking',
      bookingDetails: {
        bookingAmount,
        paymentStatus,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      },
      activities: [
        {
          id: `act-booking-${Date.now()}`,
          text: `Final Token Booking Cleared. Deposit Value ₹${bookingAmount}, Verification: ${paymentStatus}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          type: 'Status Change'
        },
        ...activities
      ]
    };

    await firebaseService.saveRequirement(updated);
    onUpdateRequirement(updated);
    triggerToast('Token booking ledger finalized!');
  };

  // Document uploads simulation
  const handleSimulateDocUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName) return;

    const newDoc = {
      id: `doc-${Date.now()}`,
      name: newDocName.endsWith('.pdf') ? newDocName : `${newDocName}.pdf`,
      type: newDocType,
      date: new Date().toISOString().split('T')[0]
    };

    const updated = {
      ...requirement,
      documents: [newDoc, ...documents],
      activities: [
        {
          id: `act-doc-${Date.now()}`,
          text: `Document uploaded: "${newDoc.name}" classified under ${newDoc.type}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          type: 'Note'
        },
        ...activities
      ]
    };

    await firebaseService.saveRequirement(updated);
    onUpdateRequirement(updated);

    setNewDocName('');
    triggerToast('Document registered into client files vault!');
  };

  const handleDeleteDocument = async (docId: string) => {
    const updated = {
      ...requirement,
      documents: documents.filter((d: any) => d.id !== docId),
      activities: [
        {
          id: `act-doc-del-${Date.now()}`,
          text: `Document trashed from archive registry`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          type: 'Note'
        },
        ...activities
      ]
    };
    await firebaseService.saveRequirement(updated);
    onUpdateRequirement(updated);
    triggerToast('Document removed from cloud secure storage.');
  };

  // Chat message send logger
  const handleSendChatLog = async (type: 'WhatsApp' | 'Email') => {
    if (!chatInput.trim()) return;

    const newLog = {
      id: `log-${Date.now()}`,
      type,
      text: chatInput,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    const updated = {
      ...requirement,
      communicationLogs: [newLog, ...communicationLogs],
      activities: [
        {
          id: `act-comm-${Date.now()}`,
          text: `${type} dispatched: "${chatInput.slice(0, 40)}..."`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          type
        },
        ...activities
      ]
    };

    await firebaseService.saveRequirement(updated);
    onUpdateRequirement(updated);

    if (type === 'WhatsApp') {
      window.open(`https://wa.me/${mobileNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(chatInput)}`, '_blank');
    } else {
      window.open(`mailto:${emailAddress}?subject=Dvarix Realty Updates&body=${encodeURIComponent(chatInput)}`, '_blank');
    }

    setChatInput('');
    triggerToast(`Omnichannel correspondence logged under "${type}"!`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-5xl w-full p-6 text-left space-y-6 relative my-8 animate-in zoom-in-95 duration-200">
        
        {/* Modal Window Title Head */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-100 gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider bg-slate-100 p-1 rounded">
                CRM CANDIDATE ID: {requirement.id}
              </span>
              <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-mono font-bold">
                STAGE: {(requirement as any).stage || 'New inquiry'}
              </span>
              {requirement.timeline === 'Immediately' && (
                <span className="text-[9px] font-mono text-rose-600 font-bold bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-md animate-pulse">
                  FAST TRACK CLIENT
                </span>
              )}
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight font-sans">
              {requirement.fullName} Profile Workstation
            </h3>
            <p className="text-xs text-slate-500 leading-none font-medium">
              Registered Roster Contact: {requirement.mobileNumber} {requirement.emailAddress && ` | Mail: ${requirement.emailAddress}`}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (confirm("Confirm permanent archiving and trashing of requirement?")) {
                  onDeleteRequirement(requirement.id);
                  onClose();
                }
              }}
              className="p-2 text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl cursor-pointer"
              title="Delete completely"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button 
              onClick={onClose}
              className="p-1 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl cursor-pointer transition"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 font-sans text-xs gap-3">
          {(['Overview', 'Matches', 'Visits', 'Documents', 'Omnichannel'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setActiveTab(t); setIsEditMode(false); }}
              className={`pb-2.5 px-3 font-semibold border-b-2 tracking-wide transition relative -mb-[2px] ${
                activeTab === t ? 'border-b-blue-600 text-blue-600 font-bold' : 'border-b-transparent text-slate-450 hover:text-slate-800'
              }`}
            >
              {t === 'Overview' && '📋 Workspace Overview'}
              {t === 'Matches' && '🤝 Auto Property Match Engine'}
              {t === 'Visits' && '🚶 Site visits & negotiations'}
              {t === 'Documents' && '📂 Document Vault'}
              {t === 'Omnichannel' && '⚡ Chat & WhatsApp Logs'}
            </button>
          ))}
        </div>

        {/* Dynamic Inner Grid Context */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main workspace container (8 cols) */}
          <div className="lg:col-span-8 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-6">
            
            {/* TAB 1: WORKSPACE METADATA & PROFILE REVISIONS */}
            {activeTab === 'Overview' && (
              <div className="space-y-6 animate-in fade-in duration-200 text-slate-700 text-xs text-left">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h4 className="font-extrabold text-slate-900 font-mono uppercase tracking-wider">Parameters Coordinates Configurer</h4>
                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-white border hover:bg-slate-50 rounded-lg text-slate-700 text-[11px] font-bold shadow-2xs transition"
                  >
                    <Edit className="h-3.5 w-3.5" /> {isEditMode ? 'Cancel Edit' : 'Edit Specs'}
                  </button>
                </div>

                {isEditMode ? (
                  <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Full Name *</label>
                      <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-white border border-slate-200 p-2 rounded-xl text-slate-850" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Mobile Phone *</label>
                      <input type="text" required value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} className="w-full bg-white border border-slate-200 p-2 rounded-xl" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Email Address</label>
                      <input type="email" value={emailAddress} onChange={e => setEmailAddress(e.target.value)} className="w-full bg-white border border-slate-200 p-2 rounded-xl text-slate-850" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Property Category</label>
                      <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className="w-full bg-white border border-slate-200 p-2 rounded-xl">
                        <option value="Apartment">Apartment Complex</option>
                        <option value="Villa">Villa Estate</option>
                        <option value="Plot">Land Plot Lot</option>
                        <option value="Commercial Space">Commercial Hub</option>
                        <option value="Independent House">Independent ResidenceHouse</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Preferred Location *</label>
                      <input type="text" required value={preferredCity} onChange={e => setPreferredCity(e.target.value)} className="w-full bg-white border border-slate-200 p-2 rounded-xl text-slate-850" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Alternate Zone</label>
                      <input type="text" value={preferredArea} onChange={e => setPreferredArea(e.target.value)} className="w-full bg-white border border-slate-200 p-2 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-400">Min Budget</label>
                        <input type="text" value={minBudget} onChange={e => setMinBudget(e.target.value)} placeholder="e.g. 1 Cr" className="w-full bg-white border border-slate-200 p-2 rounded-xl font-mono" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-400">Max Budget Target</label>
                        <input type="text" value={maxBudget} onChange={e => setMaxBudget(e.target.value)} placeholder="e.g. 3.5 Cr" className="w-full bg-white border border-slate-200 p-2 rounded-xl font-mono" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Size Requirement</label>
                      <input type="text" value={plotSize} onChange={e => setPlotSize(e.target.value)} className="w-full bg-white border border-slate-200 p-2 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-400">BHK Configuration</label>
                        <input type="text" value={bhkRequirement} onChange={e => setBhkRequirement(e.target.value)} className="w-full bg-white border border-slate-200 p-2 rounded-xl font-mono" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-400">Purchasing Timeline</label>
                        <select value={timeline} onChange={e => setTimeline(e.target.value)} className="w-full bg-white border border-slate-200 p-2 rounded-xl">
                          <option value="Immediately">Immediately Ready</option>
                          <option value="Within 1 Month">Within 30 Days</option>
                          <option value="Within 3 Months">Quarterly Track</option>
                          <option value="Just Exploring">Just Researching</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Bank Loan Required?</label>
                      <select value={loanRequired} onChange={e => setLoanRequired(e.target.value)} className="w-full bg-white border border-slate-200 p-2 rounded-xl">
                        <option value="No">No (Self Capitalized)</option>
                        <option value="Yes">Yes (Needs Pre-Approval Help)</option>
                      </select>
                    </div>
                    <div className="col-span-1 sm:col-span-2 space-y-1">
                      <label className="font-bold text-slate-500 uppercase">Requirement Footnotes / Descriptions</label>
                      <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)} className="w-full bg-white border border-slate-180 p-2 rounded-xl font-sans" />
                    </div>
                    <div className="col-span-1 sm:col-span-2 flex justify-end gap-2 pt-2">
                      <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg text-xs cursor-pointer shadow-xs">
                        Commit Profile Specification Revisions
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white border border-slate-200 p-4 rounded-xl">
                      <div>
                        <span className="text-slate-400 uppercase font-mono text-[9px] block">Looking For</span>
                        <span className="font-extrabold text-slate-900 uppercase text-[11px] block">{requirement.lookingFor}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase font-mono text-[9px] block">Target Structure</span>
                        <span className="font-bold text-slate-800 text-xs block">{requirement.propertyType}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase font-mono text-[9px] block">BHK Requested</span>
                        <span className="font-bold text-slate-800 text-xs block font-mono">{requirement.bhkRequirement || 'General Config'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase font-mono text-[9px] block">Maximum Budget</span>
                        <span className="font-extrabold text-blue-650 text-xs block font-mono">₹{requirement.maxBudget || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Technical checklist */}
                      <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-2">
                        <span className="font-black text-slate-800 text-[10px] uppercase font-mono block">Financial & Logistics Logs</span>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between border-b pb-1">
                            <span className="text-slate-450 font-medium">Bank Loan Support</span>
                            <span className="font-bold text-slate-800">{requirement.loanRequired || 'No'}</span>
                          </div>
                          <div className="flex justify-between border-b pb-1">
                            <span className="text-slate-450 font-medium">Buying Timeline urgency</span>
                            <span className="font-bold text-slate-800">{requirement.timeline}</span>
                          </div>
                          <div className="flex justify-between border-b pb-1">
                            <span className="text-slate-450 font-medium">Preferred Sector</span>
                            <span className="font-bold text-slate-800">{requirement.preferredCity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-450 font-medium">Alternative Corridor</span>
                            <span className="font-bold text-slate-850">{requirement.preferredArea || 'JP Nagar Belt'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Internal Notes area */}
                      <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between">
                        <span className="font-black text-slate-800 text-[10px] uppercase font-mono block mb-1">Advisory Internal Notes</span>
                        <textarea
                          rows={3}
                          value={internalNotes}
                          onChange={e => {
                            setInternalNotes(e.target.value);
                            onUpdateRequirement({ ...requirement, internalNotes: e.target.value } as any);
                          }}
                          placeholder="Type and persist secret notes right here..."
                          className="w-full bg-slate-50 border p-2 rounded-lg text-xs outline-none focus:bg-white transition"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PROPERTY ALGORITHMIC MATCHING */}
            {activeTab === 'Matches' && (
              <div className="space-y-4 animate-in fade-in duration-200 text-left">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="font-extrabold text-slate-800 text-xs font-mono uppercase tracking-wider flex items-center gap-1">
                    <BadgePercent className="h-4 w-4 text-indigo-500 animate-spin" /> Algorithmic Inventory compatibility
                  </h4>
                  <span className="text-[10px] text-slate-500 font-bold bg-white px-2 py-0.5 rounded border">
                    Matching Type: {requirement.propertyType}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {autoMatchedProperties.slice(0, 10).map((m) => {
                    const statusVal = m.isApproved ? 'Approved Match' : (m.isRejected ? 'Rejected' : 'Awaiting confirmation');

                    return (
                      <div 
                        key={m.property.id} 
                        className={`p-4 rounded-xl border bg-white space-y-3 shadow-2xs hover:shadow-xs transition ${
                          m.isApproved ? 'border-emerald-400' : m.isRejected ? 'border-rose-100 opacity-60' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0 pr-2">
                            <span className="font-bold text-slate-900 block truncate leading-tight text-xs hover:underline cursor-pointer">{m.property.title}</span>
                            <span className="text-xs text-blue-600 font-mono font-bold">₹{(m.property.price/10000000).toFixed(2)} Cr</span>
                            <span className="text-[10px] text-slate-450 block truncate">{m.property.location} • {m.property.type}</span>
                          </div>
                          
                          <div className="flex flex-col items-end shrink-0 max-w-[50px]">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                              m.score >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {m.score}% Score
                            </span>
                            <span className="text-[7px] text-slate-400 mt-0.5 font-mono text-right">{m.distance}</span>
                          </div>
                        </div>

                        {/* Matching coordinates breakdowns */}
                        <div className="grid grid-cols-2 gap-1 text-[9px] font-mono text-slate-500 pb-2 border-b border-dashed">
                          <div>Budget Match: <span className={m.budgetMatch ? 'text-emerald-600 font-bold' : 'font-semibold text-orange-500'}>{m.budgetMatch ? 'Passed' : 'Close limit'}</span></div>
                          <div>Location Match: <span className={m.locationMatch ? 'text-emerald-600 font-bold' : 'font-semibold text-slate-405'}>{m.locationMatch ? 'Exact' : 'Alt Zone'}</span></div>
                          <div>Availability: <span className="text-indigo-600 font-semibold">{m.property.status || 'Available'}</span></div>
                          <div>Direct Index: <span className="text-slate-700 font-bold">Approved</span></div>
                        </div>

                        {/* Interactive match selection action bar */}
                        <div className="flex justify-between items-center pt-1" onClick={e => e.stopPropagation()}>
                          <span className={`text-[8px] font-mono uppercase font-black tracking-wider ${
                            m.isApproved ? 'text-emerald-700' : m.isRejected ? 'text-rose-600' : 'text-slate-400'
                          }`}>
                            ● {statusVal}
                          </span>

                          <div className="flex gap-1.5">
                            {!m.isApproved && (
                              <button
                                onClick={() => handleToggleListingMatch(m.property.id, 'Approve')}
                                className="px-2 py-0.5 bg-emerald-100 font-bold hover:bg-emerald-200 text-emerald-800 text-[9px] rounded-lg transition shrink-0"
                              >
                                Approve
                              </button>
                            )}
                            {!m.isRejected && (
                              <button
                                onClick={() => handleToggleListingMatch(m.property.id, 'Reject')}
                                className="px-2 py-0.5 bg-rose-50 font-bold hover:bg-rose-100 text-rose-700 text-[9px] rounded-lg transition shrink-0"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: TOURS & PHYSICAL NEGOTIATIONS WORKSPACE */}
            {activeTab === 'Visits' && (
              <div className="space-y-6 animate-in fade-in duration-200 text-xs text-slate-700 text-left">
                
                {/* Visual Site visit planner */}
                <div className="bg-white border rounded-xl p-4 space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-[11px] font-mono uppercase tracking-wider flex items-center gap-1 border-b pb-1.5">
                    <Calendar className="h-4 w-4 text-purple-600" /> Site visit & tour planner
                  </h4>

                  <form onSubmit={handleAddWalkthrough} className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Target Property</label>
                      <select required value={schedulePropId} onChange={e=>setSchedulePropId(e.target.value)} className="w-full bg-white border border-slate-200 p-1.5 rounded">
                        <option value="">Select Property Unit</option>
                        {properties.map(p => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Date Setup</label>
                      <input type="date" required value={scheduleDate} onChange={e=>setScheduleDate(e.target.value)} className="w-full bg-white border border-slate-200 p-1 rounded font-mono" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Hours Reference</label>
                      <input type="text" placeholder="e.g. 3 PM" value={scheduleTime} onChange={e=>setScheduleTime(e.target.value)} className="w-full bg-white border border-slate-200 p-1 rounded" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Assigned Advisor</label>
                      <select value={scheduleAgent} onChange={e=>setScheduleAgent(e.target.value)} className="w-full bg-white border border-slate-200 p-1 rounded font-bold">
                        {agents.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="col-span-2 sm:col-span-4 w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-lg text-xs mt-1 transition">
                      Schedule Private Walkthrough Tour
                    </button>
                  </form>

                  {/* Customer walkthrough list */}
                  <div className="space-y-1.5 pt-2">
                    <span className="font-bold text-slate-400 text-[10px]">CURRENT IN-PIPELINE TOURS:</span>
                    <div className="space-y-2 max-h-[140px] overflow-y-auto">
                      {customerTours.map((t) => (
                        <div key={t.id} className="p-2.5 bg-slate-50 rounded-lg flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-900">{t.propertyTitle}</span>
                            <span className="text-[10px] text-slate-550 block font-mono">Date: {t.date} ({t.time}) • Assigned Expert: {t.agent}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-extrabold uppercase font-mono text-[9px]">
                            {t.status || 'Confirmed'}
                          </span>
                        </div>
                      ))}
                      {customerTours.length === 0 && (
                        <p className="text-[10px] text-slate-450 italic">No scheduled tours on file for this client.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Negotiations ledger list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Log new bid */}
                  <form onSubmit={handleAddNegotiation} className="bg-white border p-4 rounded-xl space-y-3">
                    <span className="font-black text-slate-900 text-[11px] font-mono uppercase tracking-wider block border-b pb-1">
                      💼 Log Negotiation parameters
                    </span>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-400">Offer price (₹)</label>
                          <input type="text" required value={offerPrice} onChange={e=>setOfferPrice(e.target.value)} placeholder="e.g. 2,40,00,000" className="w-full border p-1 rounded font-mono" />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-400">Developer Counter (₹)</label>
                          <input type="text" value={counterPrice} onChange={e=>setCounterPrice(e.target.value)} placeholder="e.g. 2,45,00,000" className="w-full border p-1 rounded font-mono" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="dev-approval" checked={ownerApproval} onChange={e=>setOwnerApproval(e.target.checked)} className="rounded" />
                        <label htmlFor="dev-approval" className="font-semibold text-slate-600">Developer board pre-approved</label>
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-400">Negotiation Footnotes</label>
                        <input type="text" value={negNotes} onChange={e=>setNegNotes(e.target.value)} placeholder="Gated community waivers..." className="w-full border p-1 rounded text-slate-850" />
                      </div>
                      <button type="submit" className="w-full py-1 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded">
                        Log Bid Deal Matrix
                      </button>
                    </div>
                  </form>

                  {/* Final Booking form */}
                  <form onSubmit={handleFinalizeBooking} className="bg-emerald-50/50 border border-emerald-150 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="font-black text-emerald-800 text-[11px] font-mono uppercase tracking-wider block border-b border-emerald-200 pb-1">
                        🏆 Final Token booking ledger
                      </span>
                      <p className="text-[10px] text-slate-400 leading-tight mt-1 mb-2">
                        Finalize transaction on behalf of corporate developer and buyers. Generates downpayment invoice.
                      </p>
                      
                      <div className="space-y-2 text-xs">
                        <div className="space-y-1">
                          <label className="font-bold text-emerald-700">Token deposit value (₹)</label>
                          <input type="text" required value={bookingAmount} onChange={e=>setBookingAmount(e.target.value)} placeholder="e.g. 5,00,000" className="w-full border bg-white border-slate-300 p-1.5 rounded font-mono" />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-emerald-700">Clearing Status</label>
                          <select value={paymentStatus} onChange={e=>setPaymentStatus(e.target.value)} className="w-full border bg-white border-slate-305 p-1 rounded font-bold">
                            <option value="Settle Draft">Pending Verification</option>
                            <option value="Processing">Processing Bankers Draft</option>
                            <option value="Cleared Settle">Cleared & Settled</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-xs mt-1 cursor-pointer">
                      Commit Booking Close Won
                    </button>
                  </form>

                </div>

                {/* History list */}
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-400 font-mono text-[10px]">NEGOTIATIONS LOG HISTORY:</span>
                  <div className="space-y-2">
                    {negotiations.map((n: any) => (
                      <div key={n.id} className="p-3 bg-white border rounded-lg grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="block font-bold">Bid Offer: <span className="font-mono text-blue-700">₹{n.offerPrice}</span></span>
                          <span className="block text-[10px] text-slate-500">Counter offer: <span className="font-mono text-slate-800">{n.counterPrice}</span></span>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded uppercase font-mono text-[9px] font-black tracking-wider bg-orange-50 text-orange-600 border border-orange-100 inline-block">
                            {n.ownerApproval}
                          </span>
                          <span className="block text-[9px] text-slate-400 font-mono mt-1">{n.date}</span>
                        </div>
                        {n.notes && (
                          <p className="col-span-2 text-[10px] text-slate-500 italic mt-1 border-t pt-1 border-dashed">{n.notes}</p>
                        )}
                      </div>
                    ))}
                    {negotiations.length === 0 && (
                      <p className="text-[10px] text-slate-400 italic">No negotiation files listed for this client.</p>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: DOCUMENT SECURE VAULT */}
            {activeTab === 'Documents' && (
              <div className="space-y-4 animate-in fade-in duration-200 text-xs text-slate-700 text-left">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="font-extrabold text-slate-900 text-xs font-mono uppercase tracking-wider flex items-center gap-1">
                    <Shield className="h-4 w-4 text-emerald-600" /> Secure Documents Vault Archive
                  </h4>
                  <span className="text-[10px] text-slate-500 font-bold bg-white border px-2 py-0.5 rounded font-mono">
                    Total files: {documents.length}
                  </span>
                </div>

                {/* Upload Section */}
                <form onSubmit={handleSimulateDocUpload} className="bg-white border rounded-xl p-4 space-y-3">
                  <span className="font-bold text-slate-850 uppercase text-[10px] block">Upload simulated client deed / credentials</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Deed/File LabelName</label>
                      <input 
                        type="text" 
                        required 
                        value={newDocName} 
                        onChange={e => setNewDocName(e.target.value)} 
                        placeholder="e.g. Aadhaar_Fills_KYC" 
                        className="w-full border p-1.5 rounded" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Document Classification</label>
                      <select value={newDocType} onChange={e => setNewDocType(e.target.value)} className="w-full bg-white border p-1 rounded font-semibold text-xs">
                        <option value="KYC Aadhaar Copy">KYC Verification (Aadhaar/PAN)</option>
                        <option value="Developer Booking Invoice">Developer Booking Invoice</option>
                        <option value="Financial Statements">Financial Statements / Bankers Draft</option>
                        <option value="Property Layout Deeds">Property Layout Deeds & Blueprint Maps</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-2 bg-slate-950 text-white hover:bg-slate-850 rounded font-bold text-xs flex justify-center items-center gap-1 cursor-pointer">
                    <Upload className="h-4 w-4 animate-bounce" /> Upload Credentials Document
                  </button>
                </form>

                {/* Documents register lists */}
                <div className="space-y-2">
                  {documents.map((d: any) => (
                    <div key={d.id} className="p-3 bg-white border rounded-xl flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center">
                          <FileText className="h-5.5 w-5.5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block truncate max-w-sm">{d.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">Type: {d.type}  |  Uploaded: {d.date}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            alert(`Simulating downloaded: ${d.name}`);
                            triggerToast('Document download parsed successful!');
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-double text-slate-700 font-bold rounded-lg cursor-pointer"
                        >
                          Download
                        </button>
                        <button 
                          onClick={() => handleDeleteDocument(d.id)}
                          className="p-1 px-2.5 bg-rose-50 text-rose-600 border rounded-lg hover:bg-rose-100"
                        >
                          Trash
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB 5: OMNICHANNEL INTERCEPTS (CHAT & WA) */}
            {activeTab === 'Omnichannel' && (
              <div className="space-y-4 animate-in fade-in duration-200 text-xs text-slate-700 text-left">
                
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="font-extrabold text-slate-900 text-xs font-mono uppercase tracking-wider flex items-center gap-1">
                    <MessageSquare className="h-4 w-4 text-emerald-600 animate-pulse" /> Omnichannel Interactive Messenger
                  </h4>
                  <span className="text-[10px] text-slate-500 font-bold bg-white border px-2 py-0.5 rounded font-mono">
                    Channel Status: Connected
                  </span>
                </div>

                {/* WhatsApp shortcuts template */}
                <div className="bg-emerald-50/50 p-3 border border-emerald-150 rounded-xl space-y-2 text-[11px] text-emerald-800">
                  <span className="font-bold uppercase block tracking-wide">⚡ Quick WhatsApp Templates:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setChatInput(`Hello ${requirement.fullName}, my name is Arjun. Thank you for your ${requirement.propertyType} inquiry in ${requirement.preferredCity}. Can we schedule a brief 5-min chat today?`)}
                      className="px-2 py-1 bg-white border hover:bg-emerald-50 rounded text-[10px] font-semibold cursor-pointer"
                    >
                      Intro Greeting
                    </button>
                    <button
                      type="button"
                      onClick={() => setChatInput(`Hi ${requirement.fullName}, regarding your ${requirement.bhkRequirement} requirements, we generated 3 matching inventory layouts. Let me know if I can send details!`)}
                      className="px-2 py-1 bg-white border hover:bg-emerald-50 rounded text-[10px] font-semibold cursor-pointer"
                    >
                      Matched Listings
                    </button>
                    <button
                      type="button"
                      onClick={() => setChatInput(`Hi ${requirement.fullName}, quick reminder on our physical walkthrough tour scheduled in JP Nagar sector. Our coordinator will meet you shortly.`)}
                      className="px-2 py-1 bg-white border hover:bg-emerald-50 rounded text-[10px] font-semibold cursor-pointer"
                    >
                      Reschedule Walkthrough
                    </button>
                  </div>
                </div>

                {/* Chat feed logs */}
                <div className="space-y-3 bg-white border p-4 rounded-xl max-h-[220px] overflow-y-auto">
                  {communicationLogs.map((log: any) => {
                    const isWa = log.type === 'WhatsApp';
                    const isEmail = log.type === 'Email';

                    return (
                      <div key={log.id} className="p-2 bg-slate-550/5 bg-slate-50 border rounded-lg space-y-1">
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                            isWa ? 'bg-emerald-100 text-emerald-850' : isEmail ? 'bg-blue-100 text-blue-805 text-blue-800' : 'bg-slate-100'
                          }`}>
                            {log.type} Message Log
                          </span>
                          <span className="text-[9px] font-mono text-slate-450">{log.date}</span>
                        </div>
                        <p className="text-slate-800 leading-relaxed text-[11px] font-medium">{log.text}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Sender toolbar inputs */}
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Type customized dispatch message to client..."
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleSendChatLog('Email')}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
                    >
                      Send Email Record
                    </button>
                    <button
                      onClick={() => handleSendChatLog('WhatsApp')}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                    >
                      Send WhatsApp Message
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Side activity bar & actions rail (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Adviser assignment quick control */}
            <div className="bg-white border p-4 rounded-2xl space-y-3 text-xs text-left">
              <span className="font-extrabold text-slate-800 text-[10px] uppercase font-mono block">Adviser Expert Assigned</span>
              
              <div className="flex items-center gap-2">
                <select
                  value={(requirement as any).assignedAgentId || ''}
                  onChange={(e) => {
                    const ag = agents.find(a=>a.id === e.target.value);
                    onUpdateRequirement({
                      ...requirement,
                      assignedAgentId: e.target.value,
                      assignedAgentName: ag?.name
                    } as any);
                    triggerToast(`Client assigned to adviser expert ${ag?.name}!`);
                  }}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="">No Advisor Assigned</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick check task creator */}
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newTaskTitle.trim()) return;

              const newTaskObj = {
                id: `task-${Date.now()}`,
                title: `${requirement.fullName}: ${newTaskTitle}`,
                status: 'Pending',
                priority: 'Medium',
                type: 'Follow Up',
                agent: agents[0]?.name || 'Rahul Kumar',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              };

              if (setTasks) setTasks(prev => [newTaskObj, ...prev]);

              const updated = {
                ...requirement,
                activities: [
                  {
                    id: `act-task-${Date.now()}`,
                    text: `Synchronized checklist task created: "${newTaskTitle}"`,
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    type: 'Note'
                  },
                  ...activities
                ]
              };
              onUpdateRequirement(updated);
              setNewTaskTitle('');
              triggerToast('Advisory Task integrated live!');
            }} className="bg-white border border-slate-200 p-4 rounded-2xl text-xs space-y-3 text-left">
              <span className="font-extrabold text-slate-800 uppercase font-mono text-[10px] block">Operational Action checklists</span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={e=>setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Schedule second meeting"
                  className="w-full border p-1.5 rounded-lg text-xs"
                />
                <button type="submit" className="px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer">
                  Add
                </button>
              </div>
            </form>

            {/* Activity trace chronlogically */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3 text-left">
              <span className="font-extrabold text-slate-800 uppercase font-mono text-[10px] block flex items-center gap-1 border-b pb-1.5">
                <Activity className="h-4 w-4 text-emerald-500 animate-pulse" /> Activity Audit log traces
              </span>

              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                {activities.map((act: any) => (
                  <div key={act.id} className="text-xs relative pl-4 border-l border-slate-200 pb-0.5 space-y-0.5">
                    <span className="absolute -left-[5.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-400 border border-white" />
                    <p className="text-slate-800 leading-snug font-medium">{act.text}</p>
                    <span className="text-[9px] text-slate-400 block font-mono leading-none">{act.date}</span>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="text-xs text-slate-400 italic text-center py-6">No dynamic activities traces registered.</p>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
