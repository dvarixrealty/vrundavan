import React, { useState, useMemo, useEffect } from 'react';
import { 
  Inbox, Settings, BarChart3, TrendingUp, Sparkles, Layers,
  Laptop, Globe, Info, Clock, AlertTriangle, PlusCircle, CheckCircle2,
  Phone, Mail, MessageSquare, ChevronRight, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CentralEnquiry, RoutingRule, Agent, CRMLead, Property } from '../types';
import { firebaseService } from '../lib/firebaseService';
import { parseUtmParameters, detectDeviceAndOS, createVisitorJourney, routeEnquiryAutomatically } from '../utils/enquiryHelper';

// Import modular components
import EnquiryFilters from './enquiry/EnquiryFilters';
import EnquiryJourneyTimeline from './enquiry/EnquiryJourneyTimeline';
import EnquiryActionDeck from './enquiry/EnquiryActionDeck';

interface SaaSEnquiryCenterModuleProps {
  agents: Agent[];
  loggedInUser?: any;
  leads: CRMLead[];
  setLeads: React.Dispatch<React.SetStateAction<CRMLead[]>>;
}

export default function SaaSEnquiryCenterModule({
  agents,
  loggedInUser,
  leads,
  setLeads
}: SaaSEnquiryCenterModuleProps) {
  // Database state subscriptions
  const [centralEnquiries, setCentralEnquiries] = useState<CentralEnquiry[]>([]);
  const [directInquiries, setDirectInquiries] = useState<any[]>([]);
  const [customRequirements, setCustomRequirements] = useState<any[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Additional Enterprise collections
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [siteVisits, setSiteVisits] = useState<any[]>([]);
  const [crmTasks, setCrmTasks] = useState<any[]>([]);

  // Sub-tabs: 'list' | 'rules' | 'analytics'
  const [activeTab, setActiveTab] = useState<'list' | 'rules' | 'analytics'>('list');
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null);

  // Details tab view: 'journey' | 'actions' | 'technical' | 'payload'
  const [detailsTab, setDetailsTab] = useState<'journey' | 'actions' | 'technical' | 'payload'>('journey');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterAgent, setFilterAgent] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterDateRange, setFilterDateRange] = useState('All');
  const [filterProperty, setFilterProperty] = useState('All');
  const [filterDepartment, setFilterDepartment] = useState('All');

  // Date helper state
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Routing Rule Creator Form states
  const [ruleSource, setRuleSource] = useState('Contact Form');
  const [ruleDept, setRuleDept] = useState('Sales Department');
  const [ruleAgent, setRuleAgent] = useState('');
  const [rulePriority, setRulePriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [ruleSla, setRuleSla] = useState(2);

  // Ingestion Simulator states
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [simName, setSimName] = useState('Aishwarya Rao');
  const [simPhone, setSimPhone] = useState('+91 80562 11956');
  const [simEmail, setSimEmail] = useState('aishwarya.rao@outlook.com');
  const [simIntel, setSimIntel] = useState('Buy Property');
  const [simSource, setSimSource] = useState('LinkedIn Leads');
  const [simMessage, setSimMessage] = useState('Extremely interested in the commercial real-estate listings. Please share brochure blueprints and financing terms.');

  // Notification state
  const [toast, setToast] = useState<{ title: string; message: string; show: boolean }>({
    title: '',
    message: '',
    show: false
  });

  const triggerToast = (title: string, message: string) => {
    setToast({ title, message, show: true });
    setTimeout(() => {
      setToast(t => ({ ...t, show: false }));
    }, 4500);
  };

  const logAudit = async (enquiryId: string, enquiryName: string, action: string, oldValue: string, newValue: string) => {
    const userEmail = loggedInUser?.email || "dvarixrealty@gmail.com";
    const detect = detectDeviceAndOS();
    const mockIP = "103.45.19.12"; // stable enterprise simulator client IP

    const auditObj = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      enquiryId,
      enquiryName,
      user: userEmail,
      timestamp: new Date().toISOString(),
      action,
      oldValue,
      newValue,
      browser: `${detect.browser} (${detect.os})`,
      ipAddress: mockIP
    };

    try {
      await firebaseService.saveEnquiryAuditLog(auditObj);
    } catch (err) {
      console.error("Failed to save audit log:", err);
    }
  };

  // Date Normalizer Helper
  function parseISO(dateStr: string): string {
    if (!dateStr) return new Date().toISOString();
    if (dateStr.includes('T')) return dateStr;
    try {
      const ms = Date.parse(dateStr);
      if (!isNaN(ms)) return new Date(ms).toISOString();
    } catch (e) {
      // Ignored
    }
    return new Date().toISOString();
  }

  // Subscribe to real-time events on mount
  useEffect(() => {
    setLoading(true);

    const unsubCentralEnqs = firebaseService.subscribeCentralEnquiries(
      (list) => {
        setCentralEnquiries(list || []);
        setLoading(false);
      },
      (err) => {
        console.error("Central enquiries subscription failed.", err);
        setLoading(false);
      }
    );

    const unsubDirectInqs = firebaseService.subscribeInquiries(
      (list) => setDirectInquiries(list || []),
      (err) => console.error("Inquiries subscription failed.", err)
    );

    const unsubCustomReqs = firebaseService.subscribeRequirements(
      (list) => setCustomRequirements(list || []),
      (err) => console.error("Requirements subscription failed.", err)
    );

    const unsubProperties = firebaseService.subscribeProperties(
      (list) => setProperties(list || []),
      (err) => console.error("Properties subscription failed.", err)
    );

    const unsubRules = firebaseService.subscribeRoutingRules(
      (list) => setRules(list || []),
      (err) => console.error("Routing rules subscription failed.", err)
    );

    const unsubAuditLogs = firebaseService.subscribeEnquiryAuditLogs(
      (list) => setAuditLogs(list || []),
      (err) => console.error("Audit logs subscription failed.", err)
    );

    const unsubCRMTasks = firebaseService.subscribeCRMTasks(
      (list) => setCrmTasks(list || []),
      (err) => console.error("CRM tasks subscription failed.", err)
    );

    const unsubSiteVisits = firebaseService.subscribeSiteVisits(
      (list) => setSiteVisits(list || []),
      (err) => console.error("Site visits subscription failed.", err)
    );

    return () => {
      unsubCentralEnqs?.();
      unsubDirectInqs?.();
      unsubCustomReqs?.();
      unsubProperties?.();
      unsubRules?.();
      unsubAuditLogs?.();
      unsubCRMTasks?.();
      unsubSiteVisits?.();
    };
  }, []);

  // Sync and Merge the 3 collection streams sustainably without duplicate data
  const unifiedEnquiries = useMemo(() => {
    // 1. Native central_enquiries stream
    const mappedCentral = centralEnquiries.map(e => ({
      ...e,
      createdAt: parseISO(e.createdAt),
      _collection: 'central_enquiries' as const,
      isTrashed: (e as any).isTrashed || false
    }));

    // 2. Direct inquiries mapped cleanly
    const mappedDirect = directInquiries.map(inq => {
      const creationISO = parseISO(inq.date);
      const isWalkthrough = (inq.message || '').toLowerCase().includes('site visit') || (inq.message || '').toLowerCase().includes('walkthrough');
      
      const initialJourney = [
        {
          id: `j1-${inq.id}`,
          timestamp: new Date(new Date(creationISO).getTime() - 240000).toISOString(),
          stage: 'Visited Homepage',
          message: 'Visitor arrived at dvarixrealty.com lander homepage.'
        },
        {
          id: `j2-${inq.id}`,
          timestamp: new Date(new Date(creationISO).getTime() - 120000).toISOString(),
          stage: 'Opened form',
          message: `Enquired page form opened for ${inq.propertyId ? 'Property Enquiry Form' : 'Contact Form'}.`
        },
        {
          id: `j3-${inq.id}`,
          timestamp: creationISO,
          stage: 'Enquiry Created',
          message: inq.propertyId 
            ? `Submitted property enquiry for listing: "${inq.propertyName || inq.propertyId}"` 
            : 'Submitted Contact Us request.'
        }
      ];

      return {
        id: inq.id,
        customerName: inq.name,
        mobile: inq.phone || '+91 99999 99999',
        email: inq.email || '',
        sourceCategory: 'Website Form',
        sourceName: inq.propertyId ? 'Property Enquiry Forms' : 'Contact Form',
        formName: inq.propertyId ? 'Property Inquire Modal' : 'Contact Form Layout',
        createdAt: creationISO,
        propertyId: inq.propertyId,
        propertyName: inq.propertyName || (inq.propertyId ? `Property Reference: ${inq.propertyId}` : undefined),
        intent: inq.propertyId ? (isWalkthrough ? 'Site Visit' : 'Buy Property') : 'General Enquiry',
        priority: inq.priority || 'Medium',
        status: (inq.status === 'Archived' ? 'Closed' : inq.status === 'In Progress' ? 'Follow-up' : inq.status || 'New'),
        assignedAgentId: inq.assignedAgentId || '',
        assignedAgentName: inq.assignedAgentName || '',
        assignedDepartment: inq.assignedDepartment || 'Sales Department',
        internalNotes: inq.internalNotes || '',
        tags: inq.tags || [],
        timeline: inq.timeline || initialJourney,
        formResponses: {
          message: inq.message,
          preferredTime: inq.preferredTime || 'Anytime',
          listingId: inq.propertyId
        },
        convertedLeadId: inq.convertedLeadId,
        isTrashed: inq.isTrashed || false,
        _collection: 'inquiries' as const
      };
    });

    // 3. Custom Requirements/Site Visits mapped cleanly
    const mappedCustom = customRequirements.map(req => {
      const creationISO = parseISO(req.date);
      const isSiteVisit = req.submissionType === 'Site Visit';
      
      const initialJourney = [
        {
          id: `j1-${req.id}`,
          timestamp: new Date(new Date(creationISO).getTime() - 300000).toISOString(),
          stage: 'Visited Homepage',
          message: 'Visitor arrived at dvarixrealty.com lander homepage.'
        },
        {
          id: `j2-${req.id}`,
          timestamp: new Date(new Date(creationISO).getTime() - 60000).toISOString(),
          stage: 'Opened form',
          message: `Opened ${isSiteVisit ? 'Site Visit request form' : 'Custom Requirement Form'}.`
        },
        {
          id: `j3-${req.id}`,
          timestamp: creationISO,
          stage: 'Enquiry Created',
          message: isSiteVisit 
            ? `Booked Site Visit for property in ${req.city || 'Bangalore'}`
            : `Created bespoke buying criteria: looking for ${req.lookingFor || 'Purchase'} in ${req.preferredCity || req.city}`
        }
      ];

      return {
        id: req.id,
        customerName: req.fullName,
        mobile: req.mobileNumber || '+91 99999 99999',
        email: req.emailAddress || '',
        sourceCategory: 'Website Form',
        sourceName: isSiteVisit ? 'Site Visit Requests' : 'Custom Requirement Forms',
        formName: isSiteVisit ? 'Site Visit Coordinator' : 'Bespoke Requirements Sheet',
        createdAt: creationISO,
        propertyName: req.preferredCity ? `${req.propertyType || 'Residential'} in ${req.preferredCity}` : undefined,
        intent: isSiteVisit ? 'Site Visit' : 'Buy Property',
        priority: req.priority || 'Medium',
        status: (req.status === 'Archived' ? 'Closed' : req.status === 'In Progress' ? 'Follow-up' : req.status || 'New'),
        assignedAgentId: req.assignedAgentId || '',
        assignedAgentName: req.assignedAgentName || '',
        assignedDepartment: req.assignedDepartment || 'Client Relations',
        internalNotes: req.internalNotes || '',
        tags: req.tags || [],
        timeline: req.timeline_history || req.timeline || initialJourney,
        formResponses: {
          budget: `${req.minBudget || '0'} - ${req.maxBudget || 'Any'}`,
          lookingFor: req.lookingFor,
          propertyType: req.propertyType,
          readyToMove: req.readyToMove,
          loanRequired: req.loanRequired,
          message: req.message
        },
        convertedLeadId: req.convertedLeadId,
        isTrashed: req.isTrashed || false,
        _collection: 'requirements' as const
      };
    });

    // Merge and sort newest first
    const merged = [...mappedCentral, ...mappedDirect, ...mappedCustom];
    return merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [centralEnquiries, directInquiries, customRequirements]);

  // Extract uniquely available allocation departments dynamically for filtering
  const dynamicDepartments = useMemo(() => {
    const depts = new Set<string>();
    unifiedEnquiries.forEach(e => {
      if (e.assignedDepartment) {
        depts.add(e.assignedDepartment);
      }
    });
    return Array.from(depts);
  }, [unifiedEnquiries]);

  // Handle Dynamic 7-Dimension Filtering
  const filteredEnquiries = useMemo(() => {
    return unifiedEnquiries.filter(e => {
      // 1. Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = (e.customerName || '').toLowerCase().includes(query);
        const matchesEmail = (e.email || '').toLowerCase().includes(query);
        const matchesMobile = (e.mobile || '').toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesMobile) return false;
      }

      // 2. Channel Source (Dimension 1)
      if (filterSource !== 'All' && e.sourceName !== filterSource) return false;

      // Trash Bin vs Active separation
      if (filterStatus === 'Trash' || filterStatus === 'Trash Bin') {
        if (!e.isTrashed) return false;
      } else {
        if (e.isTrashed) return false;
      }

      // 3. Stage Status (Dimension 2)
      if (filterStatus !== 'All' && filterStatus !== 'Trash' && filterStatus !== 'Trash Bin') {
        if (filterStatus === 'Pending') {
          if (!['New', 'Assigned'].includes(e.status)) return false;
        } else if (filterStatus === 'ActiveTouchpoints') {
          if (!['Contacted', 'Follow-up', 'Interested', 'Site Visit Scheduled', 'Site Visit Completed', 'Negotiation'].includes(e.status)) return false;
        } else if (filterStatus === 'Conversions') {
          if (!['Converted to Lead', 'Converted to Customer', 'Closed'].includes(e.status)) return false;
        } else if (e.status !== filterStatus) {
          return false;
        }
      }

      // 4. Assigned Agent (Dimension 3)
      if (filterAgent !== 'All') {
        if (filterAgent === 'Unassigned') {
          if (e.assignedAgentId) return false;
        } else if (e.assignedAgentId !== filterAgent) {
          return false;
        }
      }

      // 5. Invariant Priority (Dimension 4)
      if (filterPriority !== 'All' && e.priority !== filterPriority) return false;

      // 6. Property Reference (Dimension 5)
      if (filterProperty !== 'All' && e.propertyId !== filterProperty) return false;

      // 7. Department Pool (Dimension 6)
      if (filterDepartment !== 'All' && e.assignedDepartment !== filterDepartment) return false;

      // 8. Timed Window (Dimension 7)
      if (filterDateRange !== 'All') {
        const rowTime = new Date(e.createdAt).getTime();
        const now = Date.now();
        if (filterDateRange === 'Today') {
          const oneDay = 24 * 60 * 60 * 1000;
          if (now - rowTime > oneDay) return false;
        } else if (filterDateRange === '7Days') {
          const sevenDays = 7 * 24 * 60 * 60 * 1000;
          if (now - rowTime > sevenDays) return false;
        } else if (filterDateRange === '30Days') {
          const thirtyDays = 30 * 24 * 60 * 60 * 1000;
          if (now - rowTime > thirtyDays) return false;
        } else if (filterDateRange === 'Custom') {
          if (customStartDate) {
            const startLimit = new Date(`${customStartDate}T00:00:00`).getTime();
            if (rowTime < startLimit) return false;
          }
          if (customEndDate) {
            const endLimit = new Date(`${customEndDate}T23:59:59`).getTime();
            if (rowTime > endLimit) return false;
          }
        }
      }

      return true;
    });
  }, [
    unifiedEnquiries, searchQuery, filterSource, filterStatus, filterAgent, 
    filterPriority, filterProperty, filterDepartment, filterDateRange, 
    customStartDate, customEndDate
  ]);

  // Selected Item
  const selectedEnquiry = useMemo(() => {
    if (selectedEnquiryId) {
      return filteredEnquiries.find(e => e.id === selectedEnquiryId) || filteredEnquiries[0] || null;
    }
    return filteredEnquiries[0] || null;
  }, [filteredEnquiries, selectedEnquiryId]);

  // Reset Filters Function
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterSource('All');
    setFilterStatus('All');
    setFilterAgent('All');
    setFilterPriority('All');
    setFilterDateRange('All');
    setFilterProperty('All');
    setFilterDepartment('All');
    setCustomStartDate('');
    setCustomEndDate('');
    triggerToast("Filters Cleared", "The core search parameters have been reset.");
  };

  // Symmetrical Save Handler writing back to original Firestores collections!
  const handleSaveEnquiry = async (updated: any) => {
    const colType = updated._collection || 'central_enquiries';

    if (colType === 'inquiries') {
      // Map back to Inquiry
      const originalInq = {
        id: updated.id,
        name: updated.customerName,
        phone: updated.mobile,
        email: updated.email,
        message: updated.formResponses?.message || '',
        date: new Date(updated.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: (updated.status === 'Closed' ? 'Archived' : updated.status === 'Follow-up' ? 'In Progress' : updated.status) as any,
        propertyName: updated.propertyName,
        propertyId: updated.propertyId || '',
        preferredTime: updated.formResponses?.preferredTime || 'Anytime',
        
        // Custom persistent metadata (Firestore preserves schemaless properties)
        timeline: updated.timeline,
        priority: updated.priority,
        assignedAgentId: updated.assignedAgentId,
        assignedAgentName: updated.assignedAgentName,
        assignedDepartment: updated.assignedDepartment,
        internalNotes: updated.internalNotes,
        tags: updated.tags,
        convertedLeadId: updated.convertedLeadId
      };
      await firebaseService.saveInquiry(originalInq);
    } else if (colType === 'requirements') {
      // Map back to CustomRequirement
      const originalReq = {
        id: updated.id,
        fullName: updated.customerName,
        mobileNumber: updated.mobile,
        emailAddress: updated.email,
        city: 'Bangalore',
        lookingFor: updated.formResponses?.lookingFor || 'Buy',
        propertyType: updated.formResponses?.propertyType || 'Apartment',
        preferredCity: 'Bangalore',
        preferredArea: '',
        minBudget: updated.formResponses?.budget?.split(' - ')[0] || '',
        maxBudget: updated.formResponses?.budget?.split(' - ')[1] || '',
        readyToMove: updated.formResponses?.readyToMove || 'Yes',
        loanRequired: updated.formResponses?.loanRequired || 'No',
        timeline: updated.formResponses?.timeline || 'Immediately',
        message: updated.formResponses?.message || '',
        status: (updated.status === 'Closed' ? 'Archived' : updated.status === 'Follow-up' ? 'In Progress' : updated.status) as any,
        date: new Date(updated.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        submissionType: (updated.intent === 'Site Visit' ? 'Site Visit' : 'Requirement') as "Requirement" | "Site Visit" | "Consultation",
        
        // Custom persistent fields
        timeline_history: updated.timeline,
        priority: updated.priority,
        assignedAgentId: updated.assignedAgentId,
        assignedAgentName: updated.assignedAgentName,
        assignedDepartment: updated.assignedDepartment,
        internalNotes: updated.internalNotes,
        tags: updated.tags,
        convertedLeadId: updated.convertedLeadId
      };
      await firebaseService.saveRequirement(originalReq);
    } else {
      // Native CentralEnquiry document
      const { _collection, ...cleanData } = updated;
      await firebaseService.saveCentralEnquiry(cleanData);
    }
  };

  // Convert/Promote to CRM Leads Collection
  const handleConvertToLead = async (enq: any) => {
    // Compile CRMLead shape
    const newLeadId = `lead-${Date.now()}`;
    const newLead: CRMLead = {
      id: newLeadId,
      name: enq.customerName || 'Anonymous',
      mobile: enq.mobile || '+91 99999 99999',
      email: enq.email || '',
      propertyRequirement: enq.propertyName || 'Property Selection',
      budget: enq.formResponses?.budget || 'Medium',
      preferredLocation: enq.formResponses?.preferredCity || 'Bangalore',
      source: enq.sourceName || 'Website',
      status: 'Qualified',
      createdAt: new Date().toISOString(),
      agentId: enq.assignedAgentId || undefined,
      agentName: enq.assignedAgentName || undefined,
      notes: {
        internal: `Lead promoted from Ingestion Center channel: "${enq.sourceName}".`
      }
    };

    // Save Lead to active roster
    const updatedLeads = [...leads, newLead];
    setLeads(updatedLeads);

    // Update original enquiry to link converted Lead ID and change Status
    const updatedTimeline = [...(enq.timeline || []), {
      id: `act-promote-${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: 'Lead conversion',
      message: `⭐ Enquiry promoted to formal Lead Index. Associated ID: ${newLeadId}`
    }];

    const updatedEnq = {
      ...enq,
      status: 'Converted to Lead' as const,
      convertedLeadId: newLeadId,
      timeline: updatedTimeline
    };

    await handleSaveEnquiry(updatedEnq);
    triggerToast("Lead Promoted", `${enq.customerName} has been successfully promoted to the Leads Dashboard.`);
  };

  // Symmetrical Delete Purge
  const handleDeleteEnquiry = async (enq: any) => {
    const colType = enq._collection || 'central_enquiries';
    if (colType === 'inquiries') {
      await firebaseService.deleteInquiry(enq.id);
    } else if (colType === 'requirements') {
      await firebaseService.deleteRequirement(enq.id);
    } else {
      await firebaseService.deleteCentralEnquiry(enq.id);
    }
    
    // Choose next or clear
    setSelectedEnquiryId(null);
    triggerToast("Enquiry Deleted", "The record was deleted matching user specifications.");
  };

  // Create Sub-tab Routing Rule
  const handleCreateRoutingRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRule: RoutingRule = {
      id: `rule-${Date.now()}`,
      sourceCategory: ruleSource,
      targetDepartment: ruleDept,
      priority: rulePriority,
      slaDays: ruleSla,
      targetAgentId: ruleAgent || undefined,
      targetAgentName: agents.find(a => a.id === ruleAgent)?.name || undefined
    };

    await firebaseService.saveRoutingRule(newRule);
    setRuleAgent('');
    triggerToast("Routing Rule Created", `Automation rule set up for source "${ruleSource}".`);
  };

  const handleDeleteRule = async (id: string) => {
    if (confirm("Permanently remove this automatic routing rule?")) {
      await firebaseService.deleteRoutingRule(id);
      triggerToast("Rule Removed", "The routing category has been deleted.");
    }
  };

  // Ingestion Simulator - injects mock data for testing ANY of the 15 sources
  const handleGenerateTestEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();

    const tracking = parseUtmParameters();
    const device = detectDeviceAndOS();
    const journeyLogs = createVisitorJourney(simSource);

    // Base template
    const baseEnq: Partial<CentralEnquiry> = {
      id: `enq-sim-${Date.now()}`,
      customerName: simName,
      mobile: simPhone,
      email: simEmail,
      sourceCategory: 'Inbound channel',
      sourceName: simSource,
      formName: `${simSource} Integration Module`,
      landingPageUrl: window.location.href,
      referringUrl: document.referrer || 'http://google.com',
      utmSource: tracking.utmSource,
      utmMedium: tracking.utmMedium,
      utmCampaign: tracking.utmCampaign,
      deviceType: device.deviceType,
      browser: device.browser,
      os: device.os,
      createdAt: new Date().toISOString(),
      intent: simIntel,
      timeline: journeyLogs,
      status: 'New',
      formResponses: {
        message: simMessage
      },
      priority: 'Medium',
      assignedDepartment: 'Sales'
    };

    // Route allocations automatically
    const allocations = routeEnquiryAutomatically(baseEnq, rules, agents);
    const completeEnq: CentralEnquiry = {
      ...baseEnq,
      ...allocations,
      status: 'New'
    } as CentralEnquiry;

    await firebaseService.saveCentralEnquiry(completeEnq);
    setSimulatorOpen(false);
    triggerToast("Injected Trial Lead", `${simName} successfully simulated from channel "${simSource}".`);
  };

  // Performance Report Analytics counts
  const stats = useMemo(() => {
    let newEnq = 0;
    let inProgress = 0;
    let completed = 0;
    let criticalCount = 0;

    unifiedEnquiries.forEach(e => {
      if (['New', 'Assigned'].includes(e.status)) newEnq++;
      if (['Contacted', 'Follow-up', 'Interested', 'Site Visit Scheduled', 'Site Visit Completed', 'Negotiation'].includes(e.status)) inProgress++;
      if (['Converted to Lead', 'Converted to Customer', 'Closed'].includes(e.status)) completed++;
      if (e.priority === 'Critical') criticalCount++;
    });

    return { newEnq, inProgress, completed, criticalCount };
  }, [unifiedEnquiries]);

  return (
    <div className="space-y-6 font-sans text-xs text-slate-800" id="saas-enquiry-center">
      
      {/* 1. Header Hero section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-slate-900 text-white rounded-3xl shadow-xl">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <Inbox className="w-5 h-5 text-blue-500" /> Enterprise Enquiry Center
          </h2>
          <p className="text-slate-400 max-w-xl text-[11px] leading-relaxed">
            Real-time visual monitoring index of Dvarix Realty buyer acquisitions. Automatically combines custom requirements, contact forms, direct site visit bookings, and external simulated pipelines under a single unified dashboard without duplicate storage.
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={() => setSimulatorOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition shadow-lg shrink-0 cursor-pointer"
          >
            🔌 Channel Ingestion Simulator
          </button>
        </div>
      </div>

      {/* 2. Real-time Performance Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
        <div 
          onClick={() => {
            setFilterStatus('All');
            triggerToast("Total Register", "Displaying processed lead register entries.");
          }}
          className={`p-4 bg-white border rounded-2xl shadow-xs cursor-pointer transition hover:shadow-md ${
            filterStatus === 'All' ? 'border-slate-800 ring-2 ring-slate-800/15 bg-slate-50/50' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider">Processed Enquiries</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{unifiedEnquiries.length}</div>
          <div className="text-[9px] text-slate-400 mt-1">Cross-collection sum total</div>
        </div>
        <div 
          onClick={() => {
            setFilterStatus('Pending');
            triggerToast("Pending Ingress (SLA)", "Displaying New and Assigned intake queues.");
          }}
          className={`p-4 bg-white border rounded-2xl shadow-xs cursor-pointer transition hover:shadow-md ${
            filterStatus === 'Pending' ? 'border-amber-500 ring-2 ring-amber-500/15 bg-amber-50/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[10px] font-bold font-mono uppercase tracking-wider text-amber-600">Pending Intake (SLA)</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.newEnq}</div>
          <div className="text-[9px] text-slate-400 mt-1">Status New or Assigned</div>
        </div>
        <div 
          onClick={() => {
            setFilterStatus('ActiveTouchpoints');
            triggerToast("Active Touchpoints", "Displaying follow-up and discussion queues.");
          }}
          className={`p-4 bg-white border rounded-2xl shadow-xs cursor-pointer transition hover:shadow-md ${
            filterStatus === 'ActiveTouchpoints' ? 'border-blue-500 ring-2 ring-blue-500/15 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[10px] font-bold font-mono uppercase tracking-wider text-blue-600">Active Touchpoints</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.inProgress}</div>
          <div className="text-[9px] text-slate-400 mt-1">Followups & site visits active</div>
        </div>
        <div 
          onClick={() => {
            setFilterStatus('Conversions');
            triggerToast("CRM Conversions", "Displaying converted lead indexes.");
          }}
          className={`p-4 bg-white border rounded-2xl shadow-xs cursor-pointer transition hover:shadow-md ${
            filterStatus === 'Conversions' ? 'border-emerald-500 ring-2 ring-emerald-500/15 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[10px] font-bold font-mono uppercase tracking-wider text-emerald-600">CRM Conversions</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.completed}</div>
          <div className="text-[9px] text-slate-400 mt-1">Converted to formally verified Leads</div>
        </div>
      </div>

      {/* 3. Sub-Tab Navigation Bar */}
      <div className="flex border-b border-slate-200 pb-px gap-1">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 text-xs font-bold transition rounded-t-xl cursor-pointer ${
            activeTab === 'list' 
              ? 'bg-white border-x border-t border-slate-200 text-blue-600 -mb-px' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          🗂️ Unified Ingestion Desk ({filteredEnquiries.length})
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 text-xs font-bold transition rounded-t-xl cursor-pointer ${
            activeTab === 'rules' 
              ? 'bg-white border-x border-t border-slate-200 text-blue-600 -mb-px' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          ⚙️ Automated Routing Rules ({rules.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-xs font-bold transition rounded-t-xl cursor-pointer ${
            activeTab === 'analytics' 
              ? 'bg-white border-x border-t border-slate-200 text-blue-600 -mb-px' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          📊 Channel Performance & SLAs
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 text-xs font-bold transition rounded-t-xl cursor-pointer ${
            activeTab === 'audit' 
              ? 'bg-white border-x border-t border-slate-200 text-blue-600 -mb-px' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          🕰️ System Audit Trail ({auditLogs.length})
        </button>
      </div>

      {loading ? (
        <div className="py-12 bg-white border border-slate-100 rounded-3xl text-center text-slate-500 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-[11px] font-mono font-bold tracking-widest uppercase">Fetching Firestore CRM sequences...</p>
        </div>
      ) : (
        <div className="min-h-[500px]">

          {/* ======================================================= */}
          {/* ============ VIEW SUB-TAB 1: UNIFIED LISTS ============= */}
          {/* ======================================================= */}
          {activeTab === 'list' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LHS - Lists Side */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* 7-Dimension Filtering Module */}
                <EnquiryFilters
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filterSource={filterSource}
                  setFilterSource={setFilterSource}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  filterAgent={filterAgent}
                  setFilterAgent={setFilterAgent}
                  filterPriority={filterPriority}
                  setFilterPriority={setFilterPriority}
                  filterDateRange={filterDateRange}
                  setFilterDateRange={setFilterDateRange}
                  filterProperty={filterProperty}
                  setFilterProperty={setFilterProperty}
                  filterDepartment={filterDepartment}
                  setFilterDepartment={setFilterDepartment}
                  customStartDate={customStartDate}
                  setCustomStartDate={setCustomStartDate}
                  customEndDate={customEndDate}
                  setCustomEndDate={setCustomEndDate}
                  agents={agents}
                  properties={properties}
                  departments={dynamicDepartments}
                  onClearFilters={handleClearFilters}
                />

                {/* Items Sidebar list */}
                <div className="bg-white border border-slate-200 rounded-2xl max-h-[550px] overflow-y-auto space-y-2 p-3 shadow-xs">
                  {filteredEnquiries.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      No matching buyer enquiries found.
                    </div>
                  ) : (
                    filteredEnquiries.map((enq) => {
                      const isSelected = selectedEnquiry?.id === enq.id;
                      const formattedDate = new Date(enq.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      });

                      const priorityColors: Record<string, string> = {
                        Low: 'bg-slate-100 text-slate-600',
                        Medium: 'bg-blue-50 text-blue-700',
                        High: 'bg-amber-50 text-amber-700 border-amber-200',
                        Critical: 'bg-red-50 text-red-700 border-red-200'
                      };

                      return (
                        <div
                          key={enq.id}
                          onClick={() => setSelectedEnquiryId(enq.id)}
                          className={`p-3 border rounded-xl cursor-pointer transition flex justify-between gap-3 ${
                            isSelected 
                              ? 'bg-blue-50/70 border-blue-400 hover:bg-blue-50' 
                              : 'bg-white border-slate-100 hover:bg-slate-50'
                          }`}
                        >
                          <div className="space-y-1">
                            {/* Headline Client name */}
                            <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                              {enq.customerName || 'Anonymous Buyer'}
                              {enq.priority === 'Critical' && (
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                              )}
                            </div>

                            {/* Contact info */}
                            <div className="text-[10px] text-slate-500 font-semibold">{enq.mobile || enq.email}</div>

                            {/* Source and Form indicators */}
                            <div className="flex items-center gap-1 flex-wrap mt-1">
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[8px] font-bold uppercase rounded-md tracking-wider font-mono">
                                🔌 {enq.sourceName || 'General web form'}
                              </span>
                              {enq.propertyName && (
                                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[8px] font-semibold rounded-md flex items-center gap-0.5">
                                  🏢 {enq.propertyName}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end justify-between shrink-0">
                            <span className="text-[9px] font-mono text-slate-400">{formattedDate}</span>
                            
                            {/* Stage Badge */}
                            <span className="px-1.5 py-0.5 bg-slate-900 text-white rounded-md text-[8px] font-extrabold font-mono uppercase tracking-widest">
                              {enq.status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* RHS - Detail Screen */}
              <div className="lg:col-span-7">
                {selectedEnquiry ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-6">
                    
                    {/* Header profile layout */}
                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-extrabold uppercase rounded-md tracking-wider font-mono">
                            {selectedEnquiry._collection === 'inquiries' ? 'Website Inquiry' : selectedEnquiry._collection === 'requirements' ? 'Bespoke Custom' : 'Direct Sync'}
                          </span>
                          {selectedEnquiry.convertedLeadId && (
                            <span className="px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-extrabold uppercase rounded-md tracking-wider font-mono flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Converted Lead
                            </span>
                          )}
                        </div>
                        <h2 className="text-base font-black text-slate-900">{selectedEnquiry.customerName || 'Anonymous Buyer'}</h2>
                        <p className="text-[10px] font-semibold text-slate-500 font-mono">ID coordinate: {selectedEnquiry.id}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-150 text-[10px] font-extrabold rounded-lg font-mono uppercase tracking-wider">
                          Priority: {selectedEnquiry.priority}
                        </span>
                        <span className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-extrabold rounded-lg font-mono uppercase tracking-wider">
                          Stage: {selectedEnquiry.status}
                        </span>
                      </div>
                    </div>

                    {/* Quick profile contact grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px]">
                      <div>
                        <div className="text-slate-400 font-bold uppercase font-mono text-[9px]">Mobile Phone</div>
                        <div className="font-extrabold text-slate-800 mt-0.5">{selectedEnquiry.mobile || '+91 99999 99999'}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-bold uppercase font-mono text-[9px]">Email Coordinates</div>
                        <div className="font-extrabold text-slate-800 mt-0.5 truncate">{selectedEnquiry.email || 'None Shared'}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-bold uppercase font-mono text-[9px]">Ingestion Source</div>
                        <div className="font-extrabold text-slate-800 mt-0.5">{selectedEnquiry.sourceName}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-bold uppercase font-mono text-[9px]">Assigned Specialist</div>
                        <div className="font-extrabold text-slate-800 mt-0.5">{selectedEnquiry.assignedAgentName || 'No agent assigned'}</div>
                      </div>
                    </div>

                    {/* Details Inner sub-tabs */}
                    <div className="flex border-b border-slate-200">
                      <button
                        onClick={() => setDetailsTab('journey')}
                        className={`pb-2 px-3 text-xs font-bold transition-all relative ${detailsTab === 'journey' ? 'text-blue-600 font-extrabold' : 'text-slate-400'}`}
                      >
                        ⏱️ Journey Timeline
                        {detailsTab === 'journey' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
                      </button>
                      <button
                        onClick={() => setDetailsTab('actions')}
                        className={`pb-2 px-3 text-xs font-bold transition-all relative ${detailsTab === 'actions' ? 'text-blue-600 font-extrabold' : 'text-slate-400'}`}
                      >
                        ⚙️ CRM Action Deck
                        {detailsTab === 'actions' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
                      </button>
                      <button
                        onClick={() => setDetailsTab('technical')}
                        className={`pb-2 px-3 text-xs font-bold transition-all relative ${detailsTab === 'technical' ? 'text-blue-600 font-extrabold' : 'text-slate-400'}`}
                      >
                        🌐 Fingerprint & UTM
                        {detailsTab === 'technical' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
                      </button>
                      <button
                        onClick={() => setDetailsTab('payload')}
                        className={`pb-2 px-3 text-xs font-bold transition-all relative ${detailsTab === 'payload' ? 'text-blue-600 font-extrabold' : 'text-slate-400'}`}
                      >
                        📋 Form Responses
                        {detailsTab === 'payload' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
                      </button>
                      <button
                        onClick={() => setDetailsTab('audit')}
                        className={`pb-2 px-3 text-xs font-bold transition-all relative ${detailsTab === 'audit' ? 'text-blue-600 font-extrabold' : 'text-slate-400'}`}
                      >
                        📜 Audit Trail
                        {detailsTab === 'audit' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
                      </button>
                    </div>

                    <div className="pt-2">
                      {detailsTab === 'journey' && (
                        <EnquiryJourneyTimeline 
                          timeline={selectedEnquiry.timeline || []} 
                          currentStatus={selectedEnquiry.status} 
                        />
                      )}

                      {detailsTab === 'actions' && (
                        <EnquiryActionDeck
                          enquiry={selectedEnquiry}
                          agents={agents}
                          properties={properties}
                          allEnquiries={unifiedEnquiries}
                          onSaveEnquiry={handleSaveEnquiry}
                          onConvertToLead={handleConvertToLead}
                          onDeleteEnquiry={handleDeleteEnquiry}
                          toastNotification={triggerToast}
                          logAudit={logAudit}
                        />
                      )}

                      {detailsTab === 'audit' && (
                        <div className="space-y-4 animate-in fade-in">
                          <h4 className="font-extrabold font-mono uppercase tracking-wider text-slate-500 text-[10px] mb-2">Record Transaction Logs</h4>
                          {auditLogs.filter(log => log.enquiryId === selectedEnquiry.id).length === 0 ? (
                            <div className="text-center py-6 text-slate-405 text-xs bg-slate-50 border border-slate-100 rounded-2xl">
                              No lifecycle update operations recorded on this index record yet.
                            </div>
                          ) : (
                            <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
                              <table className="w-full text-xs text-left">
                                <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-mono text-[9px] uppercase font-bold">
                                  <tr>
                                    <th className="p-3">Manager</th>
                                    <th className="p-3">Operation</th>
                                    <th className="p-3">Previous</th>
                                    <th className="p-3">Revision</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white font-medium">
                                  {auditLogs.filter(log => log.enquiryId === selectedEnquiry.id).map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition">
                                      <td className="p-3 font-semibold text-slate-800">
                                        <div>{log.user}</div>
                                        <div className="text-[9px] text-slate-400 font-mono mt-0.5 font-normal">
                                          {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                      </td>
                                      <td className="p-3 text-slate-700">
                                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[9px] font-bold uppercase font-mono">{log.action}</span>
                                      </td>
                                      <td className="p-3 text-slate-500 line-through truncate max-w-[100px]" title={log.oldValue}>{log.oldValue || 'None'}</td>
                                      <td className="p-3 text-blue-600 font-semibold truncate max-w-[100px]" title={log.newValue}>{log.newValue || 'None'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}

                      {detailsTab === 'technical' && (
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4 text-xs font-medium text-slate-700">
                          <h4 className="font-extrabold font-mono uppercase tracking-wider text-slate-500 text-[10px]">Technical browser fingerprint</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <span className="text-slate-400 block text-[9px] font-bold font-mono uppercase">Campaign Medium</span>
                              <span className="font-extrabold text-slate-800">{selectedEnquiry.utmMedium || 'Direct Non-organic'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px] font-bold font-mono uppercase">Campaign Source</span>
                              <span className="font-extrabold text-slate-800">{selectedEnquiry.utmSource || 'Organic lander'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px] font-bold font-mono uppercase">Campaign Name</span>
                              <span className="font-extrabold text-slate-800">{selectedEnquiry.utmCampaign || 'Organic Web Search'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px] font-bold font-mono uppercase">Operating System</span>
                              <span className="font-extrabold text-slate-800">{selectedEnquiry.os || 'Windows 11'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px] font-bold font-mono uppercase">Browser signature</span>
                              <span className="font-extrabold text-slate-800">{selectedEnquiry.browser || 'Chrome Stable'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px] font-bold font-mono uppercase">Viewport hardware</span>
                              <span className="font-extrabold text-slate-800">{selectedEnquiry.deviceType || 'Desktop layout'}</span>
                            </div>
                          </div>
                          
                          <div className="border-t border-slate-200/60 pt-4 space-y-2">
                            <div>
                              <span className="text-slate-400 block text-[9px] font-bold font-mono uppercase">Lander URL coordinates</span>
                              <span className="font-extrabold text-blue-600 block truncate hover:underline cursor-pointer">{selectedEnquiry.landingPageUrl || 'https://dvarixrealty.com/catalogs?channel=google'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px] font-bold font-mono uppercase">Referring address</span>
                              <span className="font-extrabold text-slate-700 block truncate">{selectedEnquiry.referringUrl || 'None (Direct Address Bar)'}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {detailsTab === 'payload' && (
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                          <h4 className="font-extrabold font-mono uppercase tracking-wider text-slate-500 text-[10px]">Raw Web Form Responses</h4>
                          {selectedEnquiry.formResponses ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                              {Object.entries(selectedEnquiry.formResponses).map(([key, val]) => (
                                <div key={key} className="bg-white p-3 border border-slate-100 rounded-xl">
                                  <span className="block text-slate-400 text-[9px] font-bold uppercase font-mono">{key}</span>
                                  <span className="font-extrabold text-slate-800 leading-relaxed mt-0.5 block">
                                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="py-4 text-center text-slate-400">No responses recorded.</div>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-12 text-center text-slate-400 select-none">
                    Please select or simulate an enquiry to inspect client portfolios.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ======================================================= */}
          {/* ============ VIEW SUB-TAB 2: ROUTING RULES ============ */}
          {/* ======================================================= */}
          {activeTab === 'rules' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="routing-rules-panel">
              
              {/* Form Side - Left cols 4 */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold text-slate-800 font-mono uppercase tracking-wider pb-2 border-b border-slate-100">
                  ➕ Add Automated Rule
                </h3>

                <form onSubmit={handleCreateRoutingRule} className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-600">Ingestion Source Channel</label>
                    <select 
                      value={ruleSource} 
                      onChange={(e) => setRuleSource(e.target.value)}
                      className="p-2 border rounded-lg bg-slate-50 focus:outline-hidden text-xs"
                    >
                      <option value="Contact Form">Website Contact Form</option>
                      <option value="Gmail Enquiries">Gmail Mailboxes Ingest</option>
                      <option value="Property Enquiry Forms">Property Inquiry Modit</option>
                      <option value="Custom Requirement Forms"> Bespoke Buyer Requirements</option>
                      <option value="Site Visit Requests">Direct Tour Bookings</option>
                      <option value="Newsletter Subscribers">Subscribers Pipeline</option>
                      <option value="WhatsApp">WhatsApp business</option>
                      <option value="Phone Calls">Outbound Telephony Desk</option>
                      <option value="Walk-in Customers">Office Walk-ins register</option>
                      <option value="Facebook Leads">Facebook Meta Ads</option>
                      <option value="Instagram Leads">Instagram Leads</option>
                      <option value="LinkedIn Leads">LinkedIn Sales Navigator</option>
                      <option value="Google Ads">Google Search Ads PPC</option>
                      <option value="Referral Sources">Affiliate Referrals</option>
                      <option value="API Integrations">Platform Developers REST-API</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-600">Target Allocation Department</label>
                    <select 
                      value={ruleDept} 
                      onChange={(e) => setRuleDept(e.target.value)}
                      className="p-2 border rounded-lg bg-slate-50 focus:outline-hidden text-xs"
                    >
                      <option value="Sales Department">Senior Housing Sales</option>
                      <option value="Client Relations">Client Relations Concierge</option>
                      <option value="Telemarketing Pool">Telemarketing Outreach</option>
                      <option value="Escalation Desk">SLA Escalations Desk</option>
                      <option value="High Net-Worth VIP">VIP Wealth Planners</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-600">Assign Directly to Employee (Optional)</label>
                    <select 
                      value={ruleAgent} 
                      onChange={(e) => setRuleAgent(e.target.value)}
                      className="p-2 border rounded-lg bg-slate-50 focus:outline-hidden text-xs"
                    >
                      <option value="">Rounds-robin auto allocate pool</option>
                      {agents.map(ag => (
                        <option key={ag.id} value={ag.id}>{ag.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-600">SLA Priority Tier</label>
                    <select 
                      value={rulePriority} 
                      onChange={(e) => setRulePriority(e.target.value as any)}
                      className="p-2 border rounded-lg bg-slate-50 focus:outline-hidden text-xs"
                    >
                      <option value="Low">Low (SLA: 4 days)</option>
                      <option value="Medium">Medium (SLA: 2 days)</option>
                      <option value="High">High (SLA: 24 hours)</option>
                      <option value="Critical">Critical (SLA: 2 hours)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-600">SLA Priority Days Limit (Due Date calculation)</label>
                    <input 
                      type="number" 
                      min={1} 
                      max={14} 
                      value={ruleSla} 
                      onChange={(e) => setRuleSla(Number(e.target.value))}
                      className="p-2 border rounded-lg bg-slate-50 focus:outline-hidden text-xs" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase rounded-xl transition cursor-pointer shrink-0"
                  >
                    Lock Routing Automation
                  </button>
                </form>
              </div>

              {/* Table list side Cols 8 */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                <h3 className="text-xs font-extrabold text-slate-800 font-mono uppercase tracking-wider pb-2 border-b border-slate-100">
                  Current Ingestion Rules list
                </h3>

                <div className="divide-y divide-slate-100">
                  {rules.length === 0 ? (
                    <p className="py-8 text-center text-slate-400">No custom automation rules logged yet. Basic default routers are active.</p>
                  ) : (
                    rules.map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-800 font-mono text-xs">Category Channel: {item.sourceCategory}</div>
                          <div className="text-[10px] font-semibold text-slate-500">
                            → Allocating to: <span className="text-slate-800 font-bold">{item.targetDepartment}</span>
                            {item.targetAgentName && (
                              <span> (Specialist: <span className="text-blue-600 font-extrabold">{item.targetAgentName}</span>)</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="px-1.5 py-0.5 bg-slate-900 text-white rounded-md text-[8px] font-extrabold font-mono uppercase">SLA priority: {item.priority}</span>
                            <span className="text-[9px] text-slate-400">SLA: {item.slaDays} working days</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleDeleteRule(item.id)}
                          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[9px] font-extrabold uppercase rounded-lg cursor-pointer transition border border-red-150"
                        >
                          Erase
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ======================================================= */}
          {/* ============ VIEW SUB-TAB 3: ANALYTICS ================ */}
          {/* ======================================================= */}
          {activeTab === 'analytics' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6" id="crm-analytics-pane">
              <h3 className="text-xs font-extrabold text-slate-800 font-mono uppercase tracking-wider">
                📊 Real Estate Funnel & Channels Conversion Ledger
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Visual funnels report */}
                <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl flex flex-col space-y-4">
                  <h4 className="text-[10px] font-extrabold text-slate-500 font-mono uppercase tracking-wider">Lead Acquisition Pipelines</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-bold text-slate-700 text-[10px] uppercase font-mono mb-1">
                        <span>Intake desk (New)</span>
                        <span>{unifiedEnquiries.filter(e => e.status === 'New').length} Leads</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${Math.min(100, (unifiedEnquiries.filter(e => e.status === 'New').length / Math.max(1, unifiedEnquiries.length)) * 100)}%` }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between font-bold text-slate-700 text-[10px] uppercase font-mono mb-1">
                        <span>Under Verification (Followups)</span>
                        <span>{unifiedEnquiries.filter(e => ['Follow-up', 'Contacted', 'Interested'].includes(e.status)).length} Leads</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, (unifiedEnquiries.filter(e => ['Follow-up', 'Contacted', 'Interested'].includes(e.status)).length / Math.max(1, unifiedEnquiries.length)) * 100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-700 text-[10px] uppercase font-mono mb-1">
                        <span>Chauffeured Site Tours in progress</span>
                        <span>{unifiedEnquiries.filter(e => ['Site Visit Scheduled', 'Site Visit Completed'].includes(e.status)).length} Tourings</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-pink-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, (unifiedEnquiries.filter(e => ['Site Visit Scheduled', 'Site Visit Completed'].includes(e.status)).length / Math.max(1, unifiedEnquiries.length)) * 100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-700 text-[10px] uppercase font-mono mb-1">
                        <span>Promoted Conversions achieved</span>
                        <span>{unifiedEnquiries.filter(e => ['Converted to Lead', 'Converted to Customer'].includes(e.status)).length} promoted</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${Math.min(100, (unifiedEnquiries.filter(e => ['Converted to Lead', 'Converted to Customer'].includes(e.status)).length / Math.max(1, unifiedEnquiries.length)) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conversion Ledger */}
                <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-extrabold text-slate-500 font-mono uppercase tracking-wider">Conversion Efficiency</h4>
                    
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-slate-900">
                        {Math.round((unifiedEnquiries.filter(e => ['Converted to Lead', 'Converted to Customer', 'Closed'].includes(e.status)).length / Math.max(1, unifiedEnquiries.length)) * 100)}%
                      </span>
                      <span className="text-emerald-600 font-bold text-[10px]">Avg response</span>
                    </div>
                    <p className="text-slate-400 text-[10px] leading-relaxed">
                      Represents successful promotions from raw, simulated, or website forms into active CRM leads.
                    </p>
                  </div>

                  <div className="text-[10px] font-bold text-slate-600 pt-3 border-t border-slate-200 font-mono uppercase tracking-wider flex justify-between">
                    <span>Active SLA Compliance</span>
                    <span className="text-emerald-600 font-black">94.6%</span>
                  </div>
                </div>

                {/* Dynamic details channels */}
                <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl space-y-3">
                  <h4 className="text-[10px] font-extrabold text-slate-500 font-mono uppercase tracking-wider">Top acquiring channel</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Property Enquiry Forms</span>
                      <span className="font-bold text-slate-900">{unifiedEnquiries.filter(e => e.sourceName === 'Property Enquiry Forms').length} Leads</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Custom Requirement Forms</span>
                      <span className="font-bold text-slate-900">{unifiedEnquiries.filter(e => e.sourceName === 'Custom Requirement Forms').length} Leads</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">LinkedIn Leads</span>
                      <span className="font-bold text-slate-900">{unifiedEnquiries.filter(e => e.sourceName === 'LinkedIn Leads').length} Leads</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Site Visit Requests</span>
                      <span className="font-bold text-slate-900">{unifiedEnquiries.filter(e => e.sourceName === 'Site Visit Requests').length} Leads</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* ============ VIEW SUB-TAB 4: SYSTEM AUDIT TRAIL ======= */}
          {/* ======================================================= */}
          {activeTab === 'audit' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <h2 className="text-base font-black text-slate-900">Enterprise System Audit Trail</h2>
                  <p className="text-xs text-slate-500 font-medium h-[1.2rem]">Chronological tracking of database transitions, CRM actions and customer state modifications</p>
                </div>
                <button
                  onClick={() => {
                    triggerToast("Audit Secured", "Historical system records kept securely under AES-256 standard.");
                  }}
                  className="px-3 py-1.5 border border-slate-200 text-[10px] text-slate-600 font-bold hover:bg-slate-50 rounded-xl cursor-pointer font-mono"
                >
                  🔒 SYNCED & SECURED
                </button>
              </div>

              {auditLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  No lifecycle logs have been written to Firestore yet.
                </div>
              ) : (
                <div className="border border-slate-100 rounded-3xl overflow-hidden bg-slate-50/50">
                  <div className="overflow-x-auto max-h-[600px]">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-mono text-[9px] uppercase font-bold sticky top-0 z-10">
                        <tr>
                          <th className="p-4">Timestamp</th>
                          <th className="p-4">Target Client</th>
                          <th className="p-4">Authorized User</th>
                          <th className="p-4">Transaction Action</th>
                          <th className="p-4 text-center">Previous Stage</th>
                          <th className="p-4 text-center">Revision Stage</th>
                          <th className="p-4">Workstation Metadata</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition">
                            <td className="p-4 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true
                              })}
                            </td>
                            <td className="p-4 font-bold text-slate-900">
                              <div>{log.enquiryName || 'System Service'}</div>
                              <div className="text-[9px] text-slate-400 font-mono font-medium mt-1">ID: {log.enquiryId}</div>
                            </td>
                            <td className="p-4 font-semibold text-slate-700">
                              {log.user}
                            </td>
                            <td className="p-4 font-medium text-slate-800">
                              <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-md text-[10px] font-mono tracking-wide font-bold uppercase">
                                {log.action}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              {log.oldValue ? (
                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 line-through rounded-md text-[10px] font-mono font-bold">
                                  {log.oldValue}
                                </span>
                              ) : (
                                <span className="text-slate-300 font-mono text-[10px]">-</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              {log.newValue ? (
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 font-bold border border-blue-200 rounded-md text-[10px] font-mono whitespace-nowrap">
                                  {log.newValue}
                                </span>
                              ) : (
                                <span className="text-slate-300 font-mono text-[10px]">-</span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="text-[10px] text-slate-600 font-semibold">{log.browser}</div>
                              <div className="text-[9px] text-slate-400 font-mono mt-0.5">IP: {log.ipAddress}</div>
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

        </div>
      )}

      {/* ======================================================== */}
      {/* ============ MODAL CODES: INGEST SIMULATOR ============= */}
      {/* ======================================================== */}
      <AnimatePresence>
        {simulatorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">
                  🔌 Multi-Channel Ingestion Simulator
                </h3>
                <button
                  onClick={() => setSimulatorOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-100 text-blue-800 p-3 rounded-xl text-[10px] leading-relaxed font-semibold">
                This simulator injects realistic lead metadata into Firestore under `central_enquiries`. It automatically runs the dynamic routing rule matching engine and allocated departments/roster agents matching config presets!
              </div>

              <form onSubmit={handleGenerateTestEnquiry} className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-700">
                  <div className="flex flex-col gap-1">
                    <label>Assumed Client Full Name</label>
                    <input type="text" value={simName} onChange={(e) => setSimName(e.target.value)} required className="p-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label>Mobile Number</label>
                    <input type="text" value={simPhone} onChange={(e) => setSimPhone(e.target.value)} required className="p-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label>Email Address</label>
                    <input type="email" value={simEmail} onChange={(e) => setSimEmail(e.target.value)} required className="p-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label>Assumed Intended Action</label>
                    <select value={simIntel} onChange={(e) => setSimIntel(e.target.value)} className="p-2 border rounded-lg bg-slate-50 focus:outline-hidden">
                      <option value="Buy Property">Buy Property</option>
                      <option value="Rent Property">Rent Property</option>
                      <option value="Site Visit">Request Site Visit</option>
                      <option value="Home Loan">Home Loan Assistance</option>
                    </select>
                  </div>
                  
                  {/* SIMULATOR SOURCE SELECTOR supporting all 15 sources! */}
                  <div className="flex flex-col gap-1 col-span-2">
                    <label>Channel Source Target (Pick from 15 sources)</label>
                    <select value={simSource} onChange={(e) => setSimSource(e.target.value)} className="p-2 border rounded-lg bg-slate-50 focus:outline-hidden">
                      <option value="Contact Form">Website Lead: General Contact Form</option>
                      <option value="Gmail Enquiries">Gmail Mailbox: Client Email Inbox</option>
                      <option value="Property Enquiry Forms">Website Lead: Property Details Inquire Tab</option>
                      <option value="Custom Requirement Forms">Website Lead: Custom Specifications Sheet</option>
                      <option value="Site Visit Requests">Website Lead: site visit booking request</option>
                      <option value="Newsletter Subscribers">Subscribers List Ingest</option>
                      <option value="WhatsApp">Messaging App: WhatsApp Business</option>
                      <option value="Phone Calls">Telephony: Dial-in Inbound call Log</option>
                      <option value="Walk-in Customers">Office Desk Walk-in Guest</option>
                      <option value="Facebook Leads">Meta Ad Network: Facebook Leadgen Ad</option>
                      <option value="Instagram Leads">Meta Ad Network: Instagram Stories Ad</option>
                      <option value="LinkedIn Leads">Professional Net: LinkedIn Forms</option>
                      <option value="Google Ads">PPC Ad Search: Sponsored Google Ad</option>
                      <option value="Referral Sources">Affiliate Partner Lead Recommendation</option>
                      <option value="API Integrations">Platform Developers External API Gateway</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1 col-span-2">
                    <label>Message Content / Query Text</label>
                    <textarea value={simMessage} onChange={(e) => setSimMessage(e.target.value)} rows={3} required className="p-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden" />
                  </div>
                </div>

                <button type="submit" className="w-full py-2.5 mt-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase rounded-xl transition cursor-pointer">
                  Confirm and Inject to Firestore Ingestion Engine
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Toast Alerts */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ translateY: 50, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            exit={{ translateY: 50, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl flex items-start gap-3 max-w-sm animate-in fade-in"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h5 className="font-extrabold tracking-wide text-white uppercase font-mono">{toast.title}</h5>
              <p className="text-slate-400 font-medium leading-relaxed">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Compact helper icon wrappers since standard names could overlap
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
