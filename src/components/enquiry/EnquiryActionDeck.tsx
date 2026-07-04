import React, { useState, useEffect } from 'react';
import { 
  Phone, MessageSquare, Mail, Calendar, MapPin, UserCheck, 
  Edit3, Trash2, CheckCircle2, Play, X, ExternalLink, Globe, Laptop, HelpCircle,
  Archive, Copy, GitMerge
} from 'lucide-react';
import { CentralEnquiry, Agent, Property, CRMLead, CRMTask, SiteVisitRecord } from '../../types';
import { firebaseService } from '../../lib/firebaseService';

interface EnquiryActionDeckProps {
  enquiry: (CentralEnquiry & { _collection?: 'central_enquiries' | 'inquiries' | 'requirements' }) | null;
  agents: Agent[];
  properties: Property[];
  allEnquiries: any[];
  onSaveEnquiry: (updated: any) => Promise<void>;
  onConvertToLead: (enq: any) => Promise<void>;
  onDeleteEnquiry: (enq: any) => Promise<void>;
  toastNotification: (title: string, msg: string) => void;
  logAudit?: (enquiryId: string, enquiryName: string, action: string, oldValue: string, newValue: string) => Promise<void>;
}

export default function EnquiryActionDeck({
  enquiry,
  agents,
  properties,
  allEnquiries,
  onSaveEnquiry,
  onConvertToLead,
  onDeleteEnquiry,
  toastNotification,
  logAudit
}: EnquiryActionDeckProps) {
  // Modal toggling states
  const [activeModal, setActiveModal] = useState<
    'edit' | 'call' | 'whatsapp' | 'email' | 'followup' | 'sitevisit' | 'delete' | 'duplicate' | 'merge' | null
  >(null);

  // --- Modal Form States ---
  // Edit Profile fields
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPriority, setEditPriority] = useState<CentralEnquiry['priority']>('Medium');
  const [editStatus, setEditStatus] = useState<CentralEnquiry['status']>('New');
  const [editDept, setEditDept] = useState('');
  const [editAgentId, setEditAgentId] = useState('');
  const [editPropertyId, setEditPropertyId] = useState('');
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editAltContact, setEditAltContact] = useState('');

  // Call Dialer fields
  const [callDuration, setCallDuration] = useState(0); // in seconds
  const [isCalling, setIsCalling] = useState(false);
  const [callOutcome, setCallOutcome] = useState('Connected');
  const [callNotes, setCallNotes] = useState('');

  // WhatsApp fields
  const [waTemplate, setWaTemplate] = useState('welcome');
  const [waCustomText, setWaCustomText] = useState('');

  // Email Composer fields
  const [emailSubject, setEmailSubject] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('showroom');
  const [emailBody, setEmailBody] = useState('');

  // Follow-up Scheduler fields
  const [fuDate, setFuDate] = useState('');
  const [fuTime, setFuTime] = useState('10:00');
  const [fuTopic, setFuTopic] = useState('Requirements Verification');
  const [fuNotes, setFuNotes] = useState('');

  // Site Visit Scheduler fields
  const [svPropertyId, setSvPropertyId] = useState('');
  const [svDate, setSvDate] = useState('');
  const [svTime, setSvTime] = useState('11:00');
  const [svHostAgentId, setSvHostAgentId] = useState('');
  const [svBrief, setSvBrief] = useState('');

  // Delete Coordinator fields
  const [deleteFormWord, setDeleteFormWord] = useState('');

  // Duplicate Check fields
  const [dupPrimaryId, setDupPrimaryId] = useState('');

  // Merge Records fields
  const [mergeTargetId, setMergeTargetId] = useState('');

  // Timer simulation for active calling
  useEffect(() => {
    let interval: any;
    if (isCalling) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isCalling]);

  // Load enquiry coordinates when activeModal triggers
  useEffect(() => {
    if (enquiry && activeModal === 'edit') {
      setEditName(enquiry.customerName || '');
      setEditPhone(enquiry.mobile || '');
      setEditEmail(enquiry.email || '');
      setEditPriority(enquiry.priority || 'Medium');
      setEditStatus(enquiry.status || 'New');
      setEditDept(enquiry.assignedDepartment || 'Sales Team');
      setEditAgentId(enquiry.assignedAgentId || '');
      setEditPropertyId(enquiry.propertyId || '');
      setEditCompanyName(enquiry.companyName || '');
      setEditAltContact(enquiry.alternateContact || '');
    }
    if (enquiry && activeModal === 'whatsapp') {
      const templateText = getWhatsAppBody(waTemplate, enquiry.customerName);
      setWaCustomText(templateText);
    }
    if (enquiry && activeModal === 'email') {
      const bodyText = getEmailText(emailTemplate, enquiry.customerName);
      setEmailBody(bodyText);
      setEmailSubject(getEmailSubject(emailTemplate));
    }
    // Set first options by default
    if (activeModal === 'duplicate') {
      const defaultPrimary = allEnquiries.find(e => e.id !== enquiry?.id);
      setDupPrimaryId(defaultPrimary?.id || '');
    }
    if (activeModal === 'merge') {
      const defaultMerge = allEnquiries.find(e => e.id !== enquiry?.id);
      setMergeTargetId(defaultMerge?.id || '');
    }
  }, [enquiry, activeModal]);

  if (!enquiry) {
    return (
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-center text-slate-400" id="crm-action-deck-empty">
        <p>Please select an active CRM Enquiry from the Left Hand Side list to manage action cards.</p>
      </div>
    );
  }

  // Pre-loaded Templates helpers
  function getWhatsAppBody(type: string, clientName: string) {
    const greeting = `Hello ${clientName || 'valued customer'}, `;
    if (type === 'welcome') {
      return greeting + `Thank you for contacting Dvarix Realty! We have received your query and assigned senior advisors to prepare an exclusive premium catalog matching your specifications. How is your calendar tomorrow afternoon for a brief 5-minute intake call?`;
    }
    if (type === 'viewing') {
      return greeting + `Our chauffeured site visit schedule is being locked in for this weekend. We would love to showcase the active luxury apartments to you. Please let us know if 10:00 AM works for you.`;
    }
    if (type === 'documents') {
      return greeting + `Could you please share the basic financial documents or loan prerequisites? This allows our home credit consultants to pre-verify your loan eligibility criteria.`;
    }
    return greeting + `I have a brand-new, off-market developer pricing deal that matches your requirements perfectly. Let me know when is a good time to connect!`;
  }

  function getEmailSubject(type: string) {
    if (type === 'showroom') return `Exclusive Developer Portfolio - Premium Properties Catalog`;
    if (type === 'site_visit') return `Confirmed Showcase Tour Booking - Dvarix Realty`;
    return `Welcome to Dvarix Realty CRM - Action Required`;
  }

  function getEmailText(type: string, clientName: string) {
    const greeting = `Dear ${clientName || 'Valued Buyer'},\n\n`;
    const signature = `\n\nWarm Regards,\nPortfolio Manager Team\nDvarix Realty Group`;
    if (type === 'showroom') {
      return greeting + `Thank you for sharing your custom requirement details with our desk.\n\nWe have compiled an exclusive, hand-picked digital showroom catalog of high-yielding luxury assets that sync up with your location intent and budget constraints. You can view developer blueprints and payment plans here.\n\nPlease share your feedback or let us know if we should arrange site walkthroughs.` + signature;
    }
    if (type === 'site_visit') {
      return greeting + `We are absolutely excited to confirm your private property tour and site-walk logistics.\n\nYour assigned sales concierge will receive you directly at the lobby with chauffeured services. We will showcase the physical project construction, mock apartments, and host financial consultations directly on-site.\n\nPlease let us know if any timing adjustments are required.` + signature;
    }
    return greeting + `It was a privilege connecting with you today regarding your property inquiries.\n\nWe have updated your CRM customer index status onto our client registry and assigned a dedicated advisor to oversee your residential goals. Do let us know if there is anything we can assist you with.` + signature;
  }

  const handleWhatsAppTemplateChange = (tmpl: string) => {
    setWaTemplate(tmpl);
    setWaCustomText(getWhatsAppBody(tmpl, enquiry.customerName));
  };

  const handleEmailTemplateChange = (tmpl: string) => {
    setEmailTemplate(tmpl);
    setEmailSubject(getEmailSubject(tmpl));
    setEmailBody(getEmailText(tmpl, enquiry.customerName));
  };

  // --- Modal Form Actions Submit ---
  
  // 1. Submit Profile Edit (including Assignment, Priority and Status update)
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const matchedProp = properties.find(p => p.id === editPropertyId);
    
    const assignedAgentName = agents.find(a => a.id === editAgentId)?.name || '';

    // Log the audit transition
    if (logAudit) {
      if (enquiry.status !== editStatus) {
        await logAudit(enquiry.id, enquiry.customerName, "Pipeline Move", enquiry.status, editStatus);
      }
      if (enquiry.priority !== editPriority) {
        await logAudit(enquiry.id, enquiry.customerName, "Priority Update", enquiry.priority, editPriority);
      }
      if (enquiry.assignedAgentId !== editAgentId) {
        await logAudit(enquiry.id, enquiry.customerName, "Agent Reassigned", enquiry.assignedAgentName || 'None', assignedAgentName || 'Unassigned');
      }
    }

    const updatedTimeline = [...(enquiry.timeline || []), {
      id: `act-edit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: 'Notes',
      message: `📝 Profile updated. Status: ${editStatus}, Priority: ${editPriority}, Agent: ${assignedAgentName || 'None'}.`
    }];

    const updatedEnq = {
      ...enquiry,
      customerName: editName,
      mobile: editPhone,
      email: editEmail,
      priority: editPriority,
      status: editStatus,
      assignedDepartment: editDept,
      assignedAgentId: editAgentId,
      assignedAgentName: assignedAgentName,
      propertyId: editPropertyId || undefined,
      propertyName: matchedProp ? matchedProp.title : undefined,
      companyName: editCompanyName,
      alternateContact: editAltContact,
      timeline: updatedTimeline
    };

    await onSaveEnquiry(updatedEnq);
    setActiveModal(null);
    toastNotification("Profile Updated", "The buyer profile has been synchronized successfully to Cloud Firestore.");
  };

  // 2. Log Outbound Call
  const handleLogCall = async () => {
    const min = Math.floor(callDuration / 60);
    const sec = callDuration % 60;
    const durationStr = `${min}:${sec < 10 ? '0' : ''}${sec}`;

    const callLogMessage = `📞 Call Dispatched: Outcome "${callOutcome}". Duration: ${durationStr} mins. Remarks: ${callNotes || 'No notes compiled'}`;
    const updatedTimeline = [...(enquiry.timeline || []), {
      id: `act-call-${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: 'Follow-up History',
      message: callLogMessage
    }];

    if (logAudit) {
      await logAudit(enquiry.id, enquiry.customerName, "Voice Call Logged", "Outbound Call", `${callOutcome} (${durationStr})`);
    }

    const updatedEnq = {
      ...enquiry,
      status: 'Contacted' as const,
      timeline: updatedTimeline
    };

    setIsCalling(false);
    await onSaveEnquiry(updatedEnq);
    setActiveModal(null);
    setCallNotes('');
    toastNotification("Call Logged", "A chronological voice touchpoint entry has been recorded.");
  };

  // 3. Dispatch WhatsApp template
  const handleSendWhatsApp = async () => {
    const updatedTimeline = [...(enquiry.timeline || []), {
      id: `act-wa-${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: 'Follow-up History',
      message: `💬 WhatsApp template "[${waTemplate}]" successfully dispatched. Draft: "${waCustomText.slice(0, 80)}..."`
    }];

    if (logAudit) {
      await logAudit(enquiry.id, enquiry.customerName, "WhatsApp Template Send", "Templates Selection", waTemplate);
    }

    const updatedEnq = {
      ...enquiry,
      status: 'Follow-up' as const,
      timeline: updatedTimeline
    };

    await onSaveEnquiry(updatedEnq);
    setActiveModal(null);
    toastNotification("WhatsApp Logged", "WhatsApp correspondence has been saved to timeline.");
  };

  // 4. Send Mock Email
  const handleSendEmail = async () => {
    const updatedTimeline = [...(enquiry.timeline || []), {
      id: `act-mail-${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: 'Follow-up History',
      message: `✉️ Email dispatched to ${enquiry.email || 'customer'}: "${emailSubject}".`
    }];

    if (logAudit) {
      await logAudit(enquiry.id, enquiry.customerName, "Email Dispatched", "Email Preset", emailTemplate);
    }

    const updatedEnq = {
      ...enquiry,
      status: 'Follow-up' as const,
      timeline: updatedTimeline
    };

    await onSaveEnquiry(updatedEnq);
    setActiveModal(null);
    toastNotification("Email Sent", "Professional correspondence draft saved.");
  };

  // 5. Schedule Next Follow-up
  const handleScheduleFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDate = new Date(`${fuDate}T${fuTime}`).toLocaleString();

    // Create a real CRMTask in Firestore database!
    const taskId = `task-${Date.now()}`;
    const newTask: CRMTask = {
      id: taskId,
      enquiryId: enquiry.id,
      enquiryName: enquiry.customerName,
      dueDate: `${fuDate}T${fuTime}:00.000Z`,
      assignedAgentId: enquiry.assignedAgentId || 'system',
      assignedAgentName: enquiry.assignedAgentName || 'Automated Pool',
      taskType: 'Follow-up Call',
      topic: fuTopic,
      notes: fuNotes || 'Standard followup workflow task',
      completed: false,
      createdAt: new Date().toISOString()
    };

    await firebaseService.saveCRMTask(newTask);

    const updatedTimeline = [...(enquiry.timeline || []), {
      id: `act-fu-${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: 'Follow-up History',
      message: `📆 Next Follow-up Scheduled: topic "[${fuTopic}]" set for ${formattedDate}. Agenda: ${fuNotes || 'Standard followup'}`
    }];

    if (logAudit) {
      await logAudit(enquiry.id, enquiry.customerName, "Task Created", "No Task", fuTopic);
    }

    const updatedEnq = {
      ...enquiry,
      status: 'Follow-up' as const,
      timeline: updatedTimeline
    };

    await onSaveEnquiry(updatedEnq);
    setActiveModal(null);
    setFuNotes('');
    toastNotification("Follow-up Slotted", "Calendar task successfully stored in Firestore & assigned.");
  };

  // 6. Schedule Site Visit
  const handleCoordinateSiteVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPropObj = properties.find(p => p.id === svPropertyId);
    const targetAgentObj = agents.find(a => a.id === svHostAgentId);
    
    const formattedDate = new Date(`${svDate}T${svTime}`).toLocaleString();

    // Create real Site Visit Record in Firestore !
    const visitId = `visit-${Date.now()}`;
    const newVisit: SiteVisitRecord = {
      id: visitId,
      enquiryId: enquiry.id,
      customerName: enquiry.customerName,
      propertyId: svPropertyId,
      propertyName: targetPropObj?.title || 'Catalog item',
      date: svDate,
      time: svTime,
      advisorId: svHostAgentId,
      advisorName: targetAgentObj?.name || 'Assigned Concierge',
      confirmed: true,
      mapsLocation: 'Dvarix Corporate Showroom, Sector 63',
      instructions: svBrief || 'Inspecting layout blueprints',
      status: 'Scheduled',
      createdAt: new Date().toISOString()
    };

    await firebaseService.saveSiteVisit(newVisit);

    const updatedTimeline = [...(enquiry.timeline || []), {
      id: `act-sv-${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: 'Site visits',
      message: `🚗 Chauffeured Walkthrough booked for property [${targetPropObj?.title || 'Catalog item'}] on ${formattedDate}. Chaperoned by Specialist: ${targetAgentObj?.name || 'Assigned concierge'}. Brief: ${svBrief || 'Inspecting layout blueprints'}`
    }];

    if (logAudit) {
      await logAudit(enquiry.id, enquiry.customerName, "Walkthrough Arranged", "Unscheduled", targetPropObj?.title || 'Catalog item');
    }

    const updatedEnq = {
      ...enquiry,
      status: 'Site Visit Scheduled' as const,
      propertyId: svPropertyId || enquiry.propertyId,
      propertyName: targetPropObj ? targetPropObj.title : enquiry.propertyName,
      timeline: updatedTimeline
    };

    await onSaveEnquiry(updatedEnq);
    setActiveModal(null);
    setSvBrief('');
    toastNotification("Site Visit Scheduled", "The physical site walkthrough has been catalogued synchronously.");
  };

  // 7. Instant Support Soft Archive (Sets status = 'Closed')
  const handleSoftArchive = async () => {
    const updatedTimeline = [...(enquiry.timeline || []), {
      id: `act-arch-${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: 'Closed',
      message: `📦 Record moved into System Archives.`
    }];

    if (logAudit) {
      await logAudit(enquiry.id, enquiry.customerName, "Archived", enquiry.status, "Closed");
    }

    const updatedEnq = {
      ...enquiry,
      status: 'Closed' as const,
      timeline: updatedTimeline
    };

    await onSaveEnquiry(updatedEnq);
    toastNotification("Record Archived", "Buyer has been successfully set to Closed status.");
  };

  // 8. Mark Duplicate link
  const handleMarkDuplicate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dupPrimaryId) return;

    const primaryRecord = allEnquiries.find(e => e.id === dupPrimaryId);
    const primaryName = primaryRecord ? primaryRecord.customerName : 'Primary Index';

    const updatedTimeline = [...(enquiry.timeline || []), {
      id: `act-dup-${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: 'Spam',
      message: `👯 Marked duplicate. Consolidated primary target: ${primaryName} (ID: ${dupPrimaryId}).`
    }];

    if (logAudit) {
      await logAudit(enquiry.id, enquiry.customerName, "Marked Duplicate", "Active Index", `Duplicate of ${dupPrimaryId}`);
    }

    const updatedEnq = {
      ...enquiry,
      status: 'Spam' as const,
      isDuplicateOf: dupPrimaryId,
      timeline: updatedTimeline
    };

    await onSaveEnquiry(updatedEnq);
    setActiveModal(null);
    toastNotification("Marked Duplicate", `Buyer marked duplicate of primary record: ${primaryName}.`);
  };

  // 9. Merge entire Record profiles
  const handleMergeRecords = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mergeTargetId) return;

    const targetToMerge = allEnquiries.find(e => e.id === mergeTargetId);
    if (!targetToMerge) return;

    // Combine notes
    const oldNotes = enquiry.internalNotes || '';
    const incomingNotes = targetToMerge.internalNotes || '';
    const newNotes = `${oldNotes}\n\n[Merged from customer profile - ${targetToMerge.customerName} on ${new Date().toLocaleDateString()}]: ${incomingNotes || 'No custom input logs'}`;

    // Combine timeline steps
    const currentTimeline = enquiry.timeline || [];
    const incomingTimeline = targetToMerge.timeline || [];
    const mergedTimeline = [...currentTimeline, ...incomingTimeline, {
      id: `act-merged-${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: 'Notes',
      message: `🔀 Merged records. Copied all historical steps from redundant profile customer index [${targetToMerge.customerName}].`
    }].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Update this profile
    const updatedEnq = {
      ...enquiry,
      internalNotes: newNotes,
      timeline: mergedTimeline,
      alternateContact: enquiry.alternateContact || targetToMerge.mobile || undefined,
      email: enquiry.email || targetToMerge.email || undefined
    };

    // Save this
    await onSaveEnquiry(updatedEnq);

    // Audit log
    if (logAudit) {
      await logAudit(enquiry.id, enquiry.customerName, "Record Merge", `Isolated`, `Merged target ${targetToMerge.customerName}`);
    }

    // Now securely hard purge / delete the duplicate target
    await onDeleteEnquiry(targetToMerge);

    setActiveModal(null);
    toastNotification("Records Merged", `Merged profile of ${targetToMerge.customerName} successfully into current card.`);
  };

  // 10. Multi-option lifecycle deletion & restore
  const handleDeleteSubmission = async (e: React.FormEvent) => {
    e.preventDefault();

    // Soft delete moves to trash bin
    const updatedTimeline = [...(enquiry.timeline || []), {
      id: `act-trash-${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: 'Spam',
      message: `🗑️ Moved record to systemic Trash Bin.`
    }];

    if (logAudit) {
      await logAudit(enquiry.id, enquiry.customerName, "Soft Deleted", "Active Ingestion", "Trashed");
    }

    const updatedEnq = {
      ...enquiry,
      isTrashed: true,
      timeline: updatedTimeline
    };

    await onSaveEnquiry(updatedEnq);
    setActiveModal(null);
    toastNotification("Moved to Trash Bin", "This buyer is now in the systemic Trash Bin repository.");
  };

  const handlePermanentPurge = async () => {
    if (deleteFormWord !== 'DELETE') {
      alert("Please type 'DELETE' exactly to verify final database action.");
      return;
    }

    if (logAudit) {
      await logAudit(enquiry.id, enquiry.customerName, "Hard Purged", "Permanent", "Deleted");
    }

    await onDeleteEnquiry(enquiry);
    setActiveModal(null);
    setDeleteFormWord('');
    toastNotification("Permanently Purged", "Successfully erased index parameters from Cloud Firestore.");
  };

  const handleRestoreFromTrash = async () => {
    const updatedTimeline = [...(enquiry.timeline || []), {
      id: `act-restore-${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: 'New',
      message: `♻️ Restored customer profile index back to active queue.`
    }];

    if (logAudit) {
      await logAudit(enquiry.id, enquiry.customerName, "Restored Record", "Trashed", "Active Queue");
    }

    const updatedEnq = {
      ...enquiry,
      isTrashed: false,
      timeline: updatedTimeline
    };

    await onSaveEnquiry(updatedEnq);
    setActiveModal(null);
    toastNotification("Record Restored", "The buyer index has been recovered from Trash Bin.");
  };

  return (
    <div className="space-y-4 animate-in fade-in" id="crm-action-deck-master">
      <h3 className="text-xs font-semibold text-slate-500 tracking-wider uppercase font-mono">
        Enterprise Actions Panel
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Button 1: Edit Profile */}
        <button
          onClick={() => setActiveModal('edit')}
          className="flex flex-col items-center justify-center p-3 text-center bg-white border border-slate-200 hover:border-blue-500 rounded-xl transition group cursor-pointer hover:shadow-xs"
        >
          <Edit3 className="w-5 h-5 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold text-slate-800">Edit Profile</span>
          <span className="text-[8px] text-slate-400 mt-0.5">Parameters & status</span>
        </button>

        {/* Button 2: Call Dialer */}
        <button
          onClick={() => setActiveModal('call')}
          className="flex flex-col items-center justify-center p-3 text-center bg-white border border-slate-200 hover:border-emerald-500 rounded-xl transition group cursor-pointer hover:shadow-xs"
        >
          <Phone className="w-5 h-5 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold text-slate-800">Interactive Call</span>
          <span className="text-[8px] text-slate-400 mt-0.5">Dial & log transcripts</span>
        </button>

        {/* Button 3: WhatsApp */}
        <button
          onClick={() => setActiveModal('whatsapp')}
          className="flex flex-col items-center justify-center p-3 text-center bg-white border border-slate-200 hover:border-teal-500 rounded-xl transition group cursor-pointer hover:shadow-xs"
        >
          <MessageSquare className="w-5 h-5 text-teal-600 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold text-slate-800">WhatsApp Preview</span>
          <span className="text-[8px] text-slate-400 mt-0.5">Dispatched templates</span>
        </button>

        {/* Button 4: Email */}
        <button
          onClick={() => setActiveModal('email')}
          className="flex flex-col items-center justify-center p-3 text-center bg-white border border-slate-200 hover:border-indigo-500 rounded-xl transition group cursor-pointer hover:shadow-xs"
        >
          <Mail className="w-5 h-5 text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold text-slate-800">Email Suite</span>
          <span className="text-[8px] text-slate-400 mt-0.5">Blueprints catalog</span>
        </button>

        {/* Button 5: Schedule Follow-up */}
        <button
          onClick={() => {
            setActiveModal('followup');
            setFuDate(new Date().toISOString().split('T')[0]);
          }}
          className="flex flex-col items-center justify-center p-3 text-center bg-white border border-slate-200 hover:border-pink-500 rounded-xl transition group cursor-pointer hover:shadow-xs"
        >
          <Calendar className="w-5 h-5 text-pink-600 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold text-slate-800">Assign Task</span>
          <span className="text-[8px] text-slate-400 mt-0.5">Slot calendar followup</span>
        </button>

        {/* Button 6: Schedule Site Visit */}
        <button
          onClick={() => {
            setActiveModal('sitevisit');
            setSvPropertyId(enquiry.propertyId || '');
            setSvDate(new Date().toISOString().split('T')[0]);
            setSvHostAgentId(enquiry.assignedAgentId || '');
          }}
          className="flex flex-col items-center justify-center p-3 text-center bg-white border border-slate-200 hover:border-red-500 rounded-xl transition group cursor-pointer hover:shadow-xs"
        >
          <MapPin className="w-5 h-5 text-red-650 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold text-slate-800">Arrange Visit</span>
          <span className="text-[8px] text-slate-400 mt-0.5">Schedule onsite walkthrough</span>
        </button>

        {/* Button 7: Promote to Lead */}
        {!enquiry.convertedLeadId && (
          <button
            onClick={() => onConvertToLead(enquiry)}
            className="flex flex-col items-center justify-center p-3 text-center bg-blue-50 border border-blue-200 hover:border-blue-500 rounded-xl transition group cursor-pointer hover:shadow-xs"
          >
            <UserCheck className="w-5 h-5 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-blue-800">Convert Lead</span>
            <span className="text-[8px] text-blue-500 mt-0.5">Promote portfolio</span>
          </button>
        )}

        {/* Button 8: Soft Archive */}
        <button
          onClick={handleSoftArchive}
          className="flex flex-col items-center justify-center p-3 text-center bg-white border border-slate-200 hover:border-slate-800 rounded-xl transition group cursor-pointer hover:shadow-xs"
        >
          <Archive className="w-5 h-5 text-slate-700 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold text-slate-755">Archive Card</span>
          <span className="text-[8px] text-slate-405 mt-0.5">Set to Closed state</span>
        </button>

        {/* Button 9: Mark Duplicate */}
        <button
          onClick={() => setActiveModal('duplicate')}
          className="flex flex-col items-center justify-center p-3 text-center bg-white border border-slate-200 hover:border-amber-700 rounded-xl transition group cursor-pointer hover:shadow-xs"
        >
          <Copy className="w-5 h-5 text-amber-600 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold text-amber-800">Mark Duplicate</span>
          <span className="text-[8px] text-amber-500 mt-0.5">Link primary copy</span>
        </button>

        {/* Button 10: Merge Records */}
        <button
          onClick={() => setActiveModal('merge')}
          className="flex flex-col items-center justify-center p-3 text-center bg-indigo-50 border border-indigo-200 hover:border-indigo-500 rounded-xl transition group cursor-pointer hover:shadow-xs"
        >
          <GitMerge className="w-5 h-5 text-indigo-700 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold text-indigo-800">Merge Records</span>
          <span className="text-[8px] text-indigo-500 mt-0.5">Combine notes & history</span>
        </button>

        {/* Button 11: Trash & Deletion Hub */}
        <button
          onClick={() => {
            setActiveModal('delete');
            setDeleteFormWord('');
          }}
          className="flex flex-col items-center justify-center p-3 text-center bg-red-50 border border-red-200 hover:border-red-500 rounded-xl transition group cursor-pointer hover:shadow-xs"
        >
          <Trash2 className="w-5 h-5 text-red-650 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold text-red-800">Delete Manager</span>
          <span className="text-[8px] text-red-500 mt-0.5">Trash Bin & Hard purge</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* ================= MODAL WORKSPACES PANEL ================= */}
      {/* ========================================================= */}

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl flex flex-col p-6 space-y-4 animate-in scale-in duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">
                {activeModal === 'edit' && '📝 Edit Buyer CRM record'}
                {activeModal === 'call' && '📞 Core Voice Outreach Terminal'}
                {activeModal === 'whatsapp' && '💬 Transactional WhatsApp Assistant'}
                {activeModal === 'email' && '✉️ Custom Enterprise Mail Composer'}
                {activeModal === 'followup' && '📆 Schedule Future Calendar Task'}
                {activeModal === 'sitevisit' && '🚗 Coordinate Chauffeured Showroom Tour'}
                {activeModal === 'delete' && '🗑️ Trash & Deletion coordinator'}
                {activeModal === 'duplicate' && '👯 Link as Duplicate Record'}
                {activeModal === 'merge' && '🔀 Secure Merging Coordinator'}
              </h3>
              <button 
                onClick={() => {
                  setIsCalling(false);
                  setActiveModal(null);
                }}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* --- MODAL 1: EDIT PROFILE --- */}
            {activeModal === 'edit' && (
              <form onSubmit={handleSubmitEdit} className="space-y-3 text-xs text-slate-750">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="font-semibold text-slate-650">Customer Registered Name</label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required className="p-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-600">Mobile Number</label>
                    <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} required className="p-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-600">Email Address</label>
                    <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="p-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-600">Company Name</label>
                    <input type="text" value={editCompanyName} onChange={(e) => setEditCompanyName(e.target.value)} className="p-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-600">Alternative Contact</label>
                    <input type="text" value={editAltContact} onChange={(e) => setEditAltContact(e.target.value)} className="p-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-600">Pipeline Stage Status</label>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as any)} className="p-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden">
                      <option value="New">New</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Interested">Interested</option>
                      <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                      <option value="Site Visit Completed">Site Visit Completed</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Converted to Lead">Converted to Lead</option>
                      <option value="Converted to Customer">Converted to Customer</option>
                      <option value="Closed">Closed</option>
                      <option value="Lost">Lost</option>
                      <option value="Spam">Spam</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-600">Invariant Priority</label>
                    <select value={editPriority} onChange={(e) => setEditPriority(e.target.value as any)} className="p-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-600">Department Pool</label>
                    <input type="text" value={editDept} onChange={(e) => setEditDept(e.target.value)} className="p-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden" placeholder="Sales Team" />
                  </div>
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="font-semibold text-slate-600">Assigned Sales Advisor</label>
                    <select value={editAgentId} onChange={(e) => setEditAgentId(e.target.value)} className="p-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden">
                      <option value="">No Active Advisor assigned</option>
                      {agents.map((ag) => (
                        <option key={ag.id} value={ag.id}>{ag.name} ({ag.role || 'Sales'})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="font-semibold text-slate-600">Associated Property Reference</label>
                    <select value={editPropertyId} onChange={(e) => setEditPropertyId(e.target.value)} className="p-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden">
                      <option value="">Select physical property item (if applicable)</option>
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>{p.title} - ${p.price || 'Priced on Ask'}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full mt-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase rounded-xl transition cursor-pointer">
                  Save Changes to Database
                </button>
              </form>
            )}

            {/* --- MODAL 2: CALL DIALER --- */}
            {activeModal === 'call' && (
              <div className="space-y-4">
                <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-center relative overflow-hidden">
                  <div className="absolute right-3 top-3 flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    LIVE TELEPHONY
                  </div>
                  <span className="text-[10px] text-slate-400">CONNECTING DESK TO BUYER</span>
                  <div className="text-base font-extrabold mt-1 text-white">{enquiry.customerName}</div>
                  <div className="text-xl font-bold mt-2 text-emerald-400 tracking-wider">
                    {enquiry.mobile || '+91 99999 99999'}
                  </div>
                  
                  {isCalling ? (
                    <div className="mt-4 flex flex-col items-center gap-1">
                      <div className="text-2xl font-black text-white">
                        {Math.floor(callDuration / 60)}:{(callDuration % 60) < 10 ? '0' : ''}{callDuration % 60}
                      </div>
                      <button 
                        onClick={() => setIsCalling(false)}
                        className="mt-2 px-4 py-1.5 bg-red-650 hover:bg-red-700 text-white rounded-lg text-[10px] uppercase font-extrabold cursor-pointer transition"
                      >
                        Disconnect call
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsCalling(true);
                        setCallDuration(0);
                      }}
                      className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-slate-950 font-black tracking-wider uppercase text-[11px] rounded-xl cursor-pointer transition inline-flex items-center gap-2"
                    >
                      <Play className="w-3.5 h-3.5" /> Start Simulated Outbound Call
                    </button>
                  )}
                </div>

                <div className="space-y-3 text-xs text-slate-705">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-600">Dial Outbound Result Status</label>
                    <select 
                      value={callOutcome} 
                      onChange={(e) => setCallOutcome(e.target.value)}
                      className="p-2 border rounded-lg bg-slate-50 focus:outline-hidden"
                    >
                      <option value="Connected">Call Answered (Successful intake)</option>
                      <option value="Busy">Line Busy (Postponed follow-up)</option>
                      <option value="No Answer">No Answer (Reroute sequence)</option>
                      <option value="Switched Off">Switched Off / Voicemail</option>
                      <option value="Callback Requested">Appointment Scheduled (Callback booked)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-600">Outbound Conversation Brief (Transcripts / Comments)</label>
                    <textarea
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      placeholder="Enter call notes or next action points discussed..."
                      rows={3}
                      className="p-2.5 border rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden text-xs"
                    />
                  </div>

                  <button 
                    onClick={handleLogCall}
                    disabled={isCalling}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold uppercase rounded-xl transition cursor-pointer"
                  >
                    Save Call Log & Timeline Entry
                  </button>
                </div>
              </div>
            )}

            {/* --- MODAL 3: WHATSAPP --- */}
            {activeModal === 'whatsapp' && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Select WhatsApp Template</label>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <button 
                      onClick={() => handleWhatsAppTemplateChange('welcome')}
                      className={`p-2 border rounded-lg font-bold transition text-left ${waTemplate === 'welcome' ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                      👋 Welcome Greeting
                    </button>
                    <button 
                      onClick={() => handleWhatsAppTemplateChange('viewing')}
                      className={`p-2 border rounded-lg font-bold transition text-left ${waTemplate === 'viewing' ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                      🚗 Tour Logistics confirming
                    </button>
                    <button 
                      onClick={() => handleWhatsAppTemplateChange('documents')}
                      className={`p-2 border rounded-lg font-bold transition text-left ${waTemplate === 'documents' ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                      📋 Documents request checklist
                    </button>
                    <button 
                      onClick={() => handleWhatsAppTemplateChange('custom')}
                      className={`p-2 border rounded-lg font-bold transition text-left ${waTemplate === 'custom' ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                      🔥 Deal Hot Off-market Deal
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Simulated WhatsApp Body Preview</label>
                  <textarea
                    value={waCustomText}
                    onChange={(e) => setWaCustomText(e.target.value)}
                    rows={4}
                    className="p-3 border rounded-xl bg-slate-50 text-slate-800 text-xs focus:bg-white focus:outline-hidden leading-relaxed"
                  />
                </div>

                <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 text-[10px] text-teal-800 leading-relaxed font-semibold">
                  Note: In a live CRM production server layout, this triggers a webhook payload directly invoking authorized WhatsApp Business Gateway APIs.
                </div>

                <button
                  onClick={handleSendWhatsApp}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold uppercase rounded-xl transition cursor-pointer"
                >
                  Send Message Draft
                </button>
              </div>
            )}

            {/* --- MODAL 4: EMAIL --- */}
            {activeModal === 'email' && (
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-600 text-xs">Email Template Preset</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEmailTemplateChange('showroom')}
                      className={`px-3 py-1.5 border rounded-lg text-[10px] font-bold transition ${emailTemplate === 'showroom' ? 'border-indigo-600 bg-indigo-50 text-indigo-800' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                      🏠 Exclusive blue catalog
                    </button>
                    <button 
                      onClick={() => handleEmailTemplateChange('site_visit')}
                      className={`px-3 py-1.5 border rounded-lg text-[10px] font-bold transition ${emailTemplate === 'site_visit' ? 'border-indigo-600 bg-indigo-50 text-indigo-800' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                      🚗 Tour confirm schedule
                    </button>
                    <button 
                      onClick={() => handleEmailTemplateChange('standard')}
                      className={`px-3 py-1.5 border rounded-lg text-[10px] font-bold transition ${emailTemplate === 'standard' ? 'border-indigo-600 bg-indigo-50 text-indigo-800' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                      ✉️ Introductory follow-up
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-600">To Email</label>
                    <input type="text" value={enquiry.email || 'no-email@dvarix.com'} disabled className="p-2 border rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-600">Email Subject</label>
                    <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="p-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-600">Email Body / Correspondence Draft</label>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      rows={6}
                      className="p-3 border rounded-xl bg-slate-50 text-xs focus:bg-white focus:outline-hidden font-sans leading-relaxed"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSendEmail}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase rounded-xl transition cursor-pointer"
                >
                  Dispatch Correspondence Draft
                </button>
              </div>
            )}

            {/* --- MODAL 5: SCHEDULE FOLLOW-UP --- */}
            {activeModal === 'followup' && (
              <form onSubmit={handleScheduleFollowup} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-600">Follow-up Date</label>
                    <input type="date" value={fuDate} onChange={(e) => setFuDate(e.target.value)} required className="p-2 border rounded-lg bg-slate-50 focus:outline-hidden" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-600">Time Coordinates</label>
                    <input type="time" value={fuTime} onChange={(e) => setFuTime(e.target.value)} required className="p-2 border rounded-lg bg-slate-50 focus:outline-hidden" />
                  </div>
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="font-semibold text-slate-600">Follow-up Objective Category</label>
                    <select 
                      value={fuTopic} 
                      onChange={(e) => setFuTopic(e.target.value)}
                      className="p-2 border rounded-lg bg-slate-50 focus:outline-hidden"
                    >
                      <option value="Requirements Verification">Requirements Verification Intake</option>
                      <option value="Blueprints review session">Blueprints review Session</option>
                      <option value="Negotiation meeting">Negotiation & Discount pricing</option>
                      <option value="Documentation Pre-approvals">Loan & Documentation checklists</option>
                      <option value="General check-in">General check-in / follow-up</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="font-semibold text-slate-600">Follow-up Topic / Detailed Notes</label>
                    <textarea
                      value={fuNotes}
                      onChange={(e) => setFuNotes(e.target.value)}
                      placeholder="e.g. Schedule call to compare Sobha Apartments pricing plans."
                      rows={3}
                      className="p-2.5 border rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-extrabold uppercase rounded-xl transition cursor-pointer">
                  Sync task in Firestore
                </button>
              </form>
            )}

            {/* --- MODAL 6: ARRANGE SITE VISIT --- */}
            {activeModal === 'sitevisit' && (
              <form onSubmit={handleCoordinateSiteVisit} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="font-semibold text-slate-600">Physical Property to Visit</label>
                    <select 
                      value={svPropertyId} 
                      onChange={(e) => setSvPropertyId(e.target.value)} 
                      required 
                      className="p-2 border rounded-lg bg-slate-50 focus:outline-hidden"
                    >
                      <option value="">Select a listing resource...</option>
                      {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.title} - {p.location}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-600">Visit Date</label>
                    <input type="date" value={svDate} onChange={(e) => setSvDate(e.target.value)} required className="p-2 border rounded-lg bg-slate-50 focus:outline-hidden" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-600">Time Coordinates</label>
                    <input type="time" value={svTime} onChange={(e) => setSvTime(e.target.value)} required className="p-2 border rounded-lg bg-slate-50 focus:outline-hidden" />
                  </div>
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="font-semibold text-slate-600">Allocated Host Agent Concierge</label>
                    <select 
                      value={svHostAgentId} 
                      onChange={(e) => setSvHostAgentId(e.target.value)} 
                      required 
                      className="p-2 border rounded-lg bg-slate-50 focus:outline-hidden"
                    >
                      <option value="">Select salesperson...</option>
                      {agents.map(ag => (
                        <option key={ag.id} value={ag.id}>{ag.name} ({ag.role || 'Sales Consultant'})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="font-semibold text-slate-600">Host Agenda / Directives</label>
                    <textarea
                      value={svBrief}
                      onChange={(e) => setSvBrief(e.target.value)}
                      placeholder="e.g. Provide chauffeured lobby reception. Arrange financial consultant on spot matching downpayments."
                      rows={3}
                      className="p-2.5 border rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold uppercase rounded-xl transition cursor-pointer">
                  Confirm Site Walkthrough
                </button>
              </form>
            )}

            {/* --- MODAL 7: TRASH & DELETION ENGINE --- */}
            {activeModal === 'delete' && (
              <div className="space-y-4 text-xs font-semibold text-slate-705">
                <div className="border border-red-100 bg-red-50 text-red-800 p-4 rounded-xl leading-relaxed">
                  <h4 className="font-bold underline text-sm">⚠️ Critical Deletion Hub</h4>
                  <p className="mt-1 text-[11px] font-medium">Specify deletion strategy below. Real database items are linked to Firestore.</p>
                </div>

                {/* Sub Option A: Soft Deletion status */}
                <div className="p-3 border border-slate-200 rounded-xl space-y-2">
                  <h5 className="font-extrabold text-slate-800">1. Trash Bin (Soft Delete)</h5>
                  <p className="text-[10px] text-slate-500">Soft deleting parks the enquiry into the Recycle Trash Bin without erasing historic steps.</p>
                  
                  {enquiry.isTrashed ? (
                    <button
                      onClick={handleRestoreFromTrash}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white uppercase font-bold tracking-wider rounded-lg transition text-[10px] cursor-pointer"
                    >
                      ♻️ Restore from Trash Bin back to queues
                    </button>
                  ) : (
                    <button
                      onClick={handleDeleteSubmission}
                      className="w-full py-2 bg-slate-700 hover:bg-slate-800 text-white uppercase font-bold tracking-wider rounded-lg transition text-[10px] cursor-pointer"
                    >
                      🗑️ Soft Delete & Move to Trash Bin
                    </button>
                  )}
                </div>

                {/* Sub Option B: Permanent Delete */}
                <div className="p-3 border border-red-200 rounded-xl space-y-2 bg-red-50/20">
                  <h5 className="font-extrabold text-red-900">2. Irreversible Collection Purge</h5>
                  <p className="text-[10px] text-slate-500">Type <span className="font-bold font-mono text-red-650 bg-red-50 px-1 border border-red-200 rounded">DELETE</span> in the verification box below to authorize hard purging.</p>
                  
                  <input
                    type="text"
                    value={deleteFormWord}
                    onChange={(e) => setDeleteFormWord(e.target.value)}
                    placeholder="Type DELETE here..."
                    className="w-full p-2 border border-red-200 bg-white rounded-lg focus:outline-hidden font-mono uppercase text-center font-bold tracking-wider"
                  />

                  <button
                    onClick={handlePermanentPurge}
                    disabled={deleteFormWord !== 'DELETE'}
                    className="w-full py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white uppercase font-bold tracking-wider rounded-lg transition text-[10px] cursor-pointer"
                  >
                    🔥 Erase Permanently from Firestore
                  </button>
                </div>
              </div>
            )}

            {/* --- MODAL 8: MARK DUPLICATE --- */}
            {activeModal === 'duplicate' && (
              <form onSubmit={handleMarkDuplicate} className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="bg-amber-50 border border-amber-100 text-amber-900 p-3 rounded-lg leading-relaxed text-[11px]">
                  Tagging this record as a duplicate will close its sequence, set status to Spam, and map a linkage back to the matching primary master record.
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 font-bold">Pick Primary Master Record Card</label>
                  <select
                    value={dupPrimaryId}
                    onChange={(e) => setDupPrimaryId(e.target.value)}
                    required
                    className="p-2.5 border rounded-lg bg-slate-50 focus:outline-hidden"
                  >
                    <option value="">-- Choose active primary registry option --</option>
                    {allEnquiries.filter(e => e.id !== enquiry.id).map(en => (
                      <option key={en.id} value={en.id}>
                        {en.customerName} ({en.mobile || 'No Phone'}) | {en.sourceName || 'General Source'}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!dupPrimaryId}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 text-white font-extrabold uppercase rounded-xl transition cursor-pointer"
                >
                  Confirm Duplicate Alignment Linkage
                </button>
              </form>
            )}

            {/* --- MODAL 9: MERGE RECORDS --- */}
            {activeModal === 'merge' && (
              <form onSubmit={handleMergeRecords} className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="bg-indigo-50 border border-indigo-150 text-indigo-900 p-3 rounded-xl leading-relaxed text-[11px] space-y-1">
                  <p className="font-bold">✨ High-Fidelity Record Merging</p>
                  <p className="text-indigo-700 text-[10px] leading-relaxed font-semibold">
                    This combines note entries, concatenates chronological timeline lists, preserves alternative contacts, saves the consolidated master, and then executes a hard purge on the target duplicate card.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 font-bold">Select Redundant Record Copy to Absorb</label>
                  <select
                    value={mergeTargetId}
                    onChange={(e) => setMergeTargetId(e.target.value)}
                    required
                    className="p-2.5 border rounded-lg bg-slate-50 focus:outline-hidden"
                  >
                    <option value="">-- Choose target card to absorb --</option>
                    {allEnquiries.filter(e => e.id !== enquiry.id).map(en => (
                      <option key={en.id} value={en.id}>
                        {en.customerName} ({en.mobile || 'No Phone'}) | {en.sourceName || 'General Source'}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!mergeTargetId}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-extrabold uppercase rounded-xl transition cursor-pointer"
                >
                  Merge and Retain Selected Profile
                </button>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
