import React, { useState, useEffect } from 'react';
import { 
  X, Check, Calendar, Clock, User, Phone, Mail, MapPin, 
  Users, AlertCircle, FileText, Send, RefreshCw, Printer, AlertTriangle, CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Property } from '../types';

interface SiteVisitBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProperty?: Property | null;
  prefilledData?: {
    customerName?: string;
    mobileNumber?: string;
    emailAddress?: string;
    location?: string;
    propertyType?: string;
    specialRequirements?: string;
  } | null;
}

export default function SiteVisitBookingModal({ isOpen, onClose, selectedProperty, prefilledData }: SiteVisitBookingModalProps) {
  // Form input states
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [agentAssigned, setAgentAssigned] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [numberOfVisitors, setNumberOfVisitors] = useState('1');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [source, setSource] = useState('Website Landing Page');
  const [remarks, setRemarks] = useState('');

  // Status and Confirmation state
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [validationError, setValidationError] = useState('');

  // Validation States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Autofill property details if loaded from detail screen
  useEffect(() => {
    if (selectedProperty) {
      setPropertyName(selectedProperty.title || '');
      setPropertyId(selectedProperty.id || '');
      setLocation(selectedProperty.location || '');
      setPropertyType(selectedProperty.type || '');
      setAgentAssigned(selectedProperty.agent?.name || 'Rahul Kumar');
    } else {
      handleReset();
    }
  }, [selectedProperty, isOpen]);

  // Handle prefilled data synchronization from custom requirements form
  useEffect(() => {
    if (prefilledData && isOpen) {
      if (prefilledData.customerName) setCustomerName(prefilledData.customerName);
      if (prefilledData.mobileNumber) {
        setMobileNumber(prefilledData.mobileNumber);
        setWhatsAppNumber(prefilledData.mobileNumber);
      }
      if (prefilledData.emailAddress) setEmailAddress(prefilledData.emailAddress);
      if (prefilledData.location) setLocation(prefilledData.location);
      if (prefilledData.propertyType) setPropertyType(prefilledData.propertyType);
      if (prefilledData.specialRequirements) setSpecialRequirements(prefilledData.specialRequirements);
    }
  }, [prefilledData, isOpen]);

  const handleReset = () => {
    setCustomerName('');
    setMobileNumber('');
    setWhatsAppNumber('');
    setEmailAddress('');
    if (!selectedProperty) {
      setPropertyName('');
      setPropertyId('');
      setLocation('');
      setPropertyType('');
      setAgentAssigned('');
    }
    setPreferredDate('');
    setPreferredTime('');
    setNumberOfVisitors('1');
    setSpecialRequirements('');
    setSource('Website Landing Page');
    setRemarks('');
    setValidationError('');
    setErrors({});
    setAttemptedSubmit(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    const validationErrors: Record<string, string> = {};
    if (!customerName.trim()) {
      validationErrors.customerName = 'Please enter your full name.';
    }
    if (!mobileNumber.trim()) {
      validationErrors.mobileNumber = 'Please enter your mobile number.';
    }
    if (!whatsAppNumber.trim()) {
      validationErrors.whatsAppNumber = 'Please specify your WhatsApp number for coordination.';
    }
    if (!emailAddress.trim()) {
      validationErrors.emailAddress = 'Please enter your email address.';
    }
    if (!preferredDate) {
      validationErrors.preferredDate = 'Please select your preferred visit date.';
    }
    if (!preferredTime) {
      validationErrors.preferredTime = 'Please select a preferred slot time.';
    }

    setErrors(validationErrors);

    const errorKeys = Object.keys(validationErrors);
    if (errorKeys.length > 0) {
      const firstError = errorKeys[0];
      const element = document.getElementById(`sv-field-${firstError}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setValidationError('');
    setErrors({});
    const newTicketId = `SV-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(newTicketId);

    // Prepare data to sync with CRM local states in InquiryDashboard or LocalStorage via CustomEvent
    const bookingPayload = {
      id: newTicketId,
      customerName,
      mobile: mobileNumber,
      whatsapp: whatsAppNumber,
      email: emailAddress,
      propertyName: propertyName || 'Bengaluru Premium Hub',
      propertyId: propertyId || 'PROP-GEN',
      location: location || 'Bengaluru Gated Zone',
      propertyType: propertyType || 'Residential Plotted',
      agent: agentAssigned || 'Neha Sharma',
      date: preferredDate,
      time: preferredTime,
      visitors: parseInt(numberOfVisitors) || 1,
      specialRequirements,
      source,
      remarks,
      status: 'Pending',
      timestamp: new Date().toLocaleDateString('en-US') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    // Dispatch custom event to let CRM (InquiryDashboard) capture and ingest this inside state instantly
    const event = new CustomEvent('cms-add-site-visit', { detail: bookingPayload });
    window.dispatchEvent(event);

    setFormSubmitted(true);
  };

  const handlePrintConfirmation = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto block" id="site-visit-booking-modal" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Backdrop overlay */}
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-slate-950/80 transition-opacity backdrop-blur-sm cursor-pointer" 
          aria-hidden="true" 
        />
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full relative border border-slate-100"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 text-[#ff5a3c] rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 stroke-[2.5px]" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#ff5a3c]">Dvarix Realty</span>
                <h3 className="text-lg font-black text-slate-900 leading-tight">Book Free Physical Site Visit</h3>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-slate-405 hover:text-slate-800 p-2 rounded-full bg-slate-100/50 hover:bg-slate-100 transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {formSubmitted ? (
            /* Successful Booking View */
            <div className="p-8 md:p-12 text-center space-y-8" id="site-visit-success-card">
              <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-400 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-md">
                <Check className="w-10 h-10 stroke-[3px]" />
              </div>

              <div className="space-y-2">
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">Walkthrough Appointment Scheduled!</h4>
                <p className="text-slate-500 text-xs font-mono font-bold text-center">TICKET REF NO: <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded select-all font-sans font-black outline-none">{ticketId}</span></p>
                <p className="text-slate-600 text-sm max-w-xl mx-auto pt-2 leading-relaxed">
                  Congratulations! Your free VIP physical site visit slot has been successfully booked in our central registry. The details have been synchronized with the 
                  <strong className="text-sky-600"> Lead Management</strong> and <strong className="text-indigo-600">Site Visits Scheduler</strong> panels.
                </p>
              </div>

              {/* Ticket Details summary */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 text-left max-w-2xl mx-auto space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-mono font-bold text-[9px] uppercase">Visitor (Customer)</span>
                    <span className="text-slate-900 font-bold text-sm block">{customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-mono font-bold text-[9px] uppercase">Assigned Advisor Lead</span>
                    <span className="text-slate-900 font-bold text-sm block">{agentAssigned || "Rahul Kumar"}</span>
                  </div>
                </div>

                <div className="border-t border-slate-200/60 pt-3 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-mono font-bold text-[9px] uppercase">Property Target</span>
                    <span className="text-slate-900 font-semibold block truncate" title={propertyName}>{propertyName || "Selectable Active Inventory"}</span>
                    <span className="text-[10px] text-slate-450 block font-mono">ID: {propertyId || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-mono font-bold text-[9px] uppercase font-semibold">Location Area</span>
                    <span className="text-slate-900 font-semibold block">{location || "Central Bengaluru Region"}</span>
                  </div>
                </div>

                <div className="border-t border-slate-200/60 pt-3 grid grid-cols-3 gap-4 text-xs font-mono font-semibold">
                  <div>
                    <span className="text-slate-450 block font-bold text-[9px] uppercase">Visit Date</span>
                    <span className="text-slate-800 block">{preferredDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block font-bold text-[9px] uppercase">Visit Time</span>
                    <span className="text-slate-805 block">{preferredTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block font-bold text-[9px] uppercase">No. of Guests</span>
                    <span className="text-slate-805 block">{numberOfVisitors} Visitor(s)</span>
                  </div>
                </div>
              </div>

              {/* Confirmation notifications simulated panel */}
              <div className="border border-sky-100 bg-sky-50/50 rounded-2xl p-4 max-w-2xl mx-auto text-left space-y-3">
                <p className="text-xs font-bold text-sky-850 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5 text-sky-600" /> Multi-Channel Client Confirmations Dispatched:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="bg-white border border-slate-100 p-2.5 rounded-xl space-y-1">
                    <span className="text-[9px] uppercase font-mono font-bold text-emerald-600 flex items-center gap-1">🟢 SMS Core</span>
                    <span className="text-[10px] text-slate-600 line-clamp-2">"Confirming site walkthrough with agent {agentAssigned || 'Rahul'}. Details at WhatsApp. Link..."</span>
                  </div>
                  <div className="bg-white border border-slate-100 p-2.5 rounded-xl space-y-1">
                    <span className="text-[9px] uppercase font-mono font-bold text-[#ff5a3c] flex items-center gap-1">🟢 Email Gateway</span>
                    <span className="text-[10px] text-slate-600 line-clamp-2">"Hi {customerName}, Your VIP Walkthrough reservation is confirmed. Download route map..."</span>
                  </div>
                  <div className="bg-white border border-slate-100 p-2.5 rounded-xl space-y-1">
                    <span className="text-[9px] uppercase font-mono font-bold text-sky-600 flex items-center gap-1">🟢 WhatsApp Portal</span>
                    <span className="text-[10px] text-slate-600 line-clamp-2">"Site visit for {propertyName} is booked. Reschedule: localhost/edit Cancel: localhost/cancel"</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 border-t border-slate-100">
                <button
                  onClick={handlePrintConfirmation}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 hover:border-slate-800 text-slate-700 hover:text-slate-900 text-xs font-bold font-mono tracking-wider uppercase rounded-xl transition shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print Confirmation
                </button>
                <button
                  onClick={() => {
                    handleReset();
                    setFormSubmitted(false);
                    onClose();
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#ff5a3c] hover:bg-[#e04f32] text-white text-xs font-black tracking-wider uppercase rounded-xl transition shadow-md hover:shadow-lg cursor-pointer"
                >
                  Return to Discovery
                </button>
              </div>

            </div>
          ) : (
            /* Booking Form View */
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 text-xs text-slate-700 text-left">
              
              {validationError && (
                <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-extrabold text-slate-900 font-mono text-[10px] uppercase">Validation Conflict</h5>
                    <p className="text-slate-600 font-medium">{validationError}</p>
                  </div>
                </div>
              )}

              {/* Section 1: Customer Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-black font-mono uppercase tracking-widest text-[#ff5a3c] border-b border-slate-100 pb-2">
                  1. Customer Contact Parameters
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Customer Name */}
                  <div className="space-y-1" id="sv-field-customerName">
                    <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 font-mono">Customer Name *</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        required 
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          if (attemptedSubmit && e.target.value.trim()) {
                            setErrors(prev => ({ ...prev, customerName: '' }));
                          }
                        }}
                        placeholder="e.g. Rahul Sharma"
                        className={`w-full pl-10 pr-4 py-3 bg-white border outline-none rounded-xl font-bold text-slate-800 ${
                          attemptedSubmit && errors.customerName
                            ? 'border-rose-500 ring-1 ring-rose-500/20'
                            : 'border-slate-200 hover:border-slate-300 focus:border-[#ff5a3c] focus:ring-1 focus:ring-[#ff5a3c]'
                        }`}
                      />
                    </div>
                    {attemptedSubmit && errors.customerName && (
                      <p className="text-rose-600 text-[10px] font-bold font-mono mt-1">⚠️ {errors.customerName}</p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1" id="sv-field-mobileNumber">
                    <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 font-mono">Mobile Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type="tel" 
                        required 
                        value={mobileNumber}
                        onChange={(e) => {
                          setMobileNumber(e.target.value);
                          if (attemptedSubmit && e.target.value.trim()) {
                            setErrors(prev => ({ ...prev, mobileNumber: '' }));
                          }
                        }}
                        placeholder="e.g. +91 98765 43210"
                        className={`w-full pl-10 pr-4 py-3 bg-white border outline-none rounded-xl font-bold text-slate-800 ${
                          attemptedSubmit && errors.mobileNumber
                            ? 'border-rose-500 ring-1 ring-rose-500/20'
                            : 'border-slate-200 hover:border-slate-300 focus:border-[#ff5a3c] focus:ring-1 focus:ring-[#ff5a3c]'
                        }`}
                      />
                    </div>
                    {attemptedSubmit && errors.mobileNumber && (
                      <p className="text-rose-600 text-[10px] font-bold font-mono mt-1">⚠️ {errors.mobileNumber}</p>
                    )}
                  </div>

                  {/* WhatsApp Number */}
                  <div className="space-y-1" id="sv-field-whatsAppNumber">
                    <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 font-mono">WhatsApp Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type="tel" 
                        required 
                        value={whatsAppNumber}
                        onChange={(e) => {
                          setWhatsAppNumber(e.target.value);
                          if (attemptedSubmit && e.target.value.trim()) {
                            setErrors(prev => ({ ...prev, whatsAppNumber: '' }));
                          }
                        }}
                        placeholder="e.g. +91 98765 43210"
                        className={`w-full pl-10 pr-4 py-3 bg-white border outline-none rounded-xl font-bold text-slate-800 ${
                          attemptedSubmit && errors.whatsAppNumber
                            ? 'border-rose-500 ring-1 ring-rose-500/20'
                            : 'border-slate-200 hover:border-slate-300 focus:border-[#ff5a3c] focus:ring-1 focus:ring-[#ff5a3c]'
                        }`}
                      />
                    </div>
                    {attemptedSubmit && errors.whatsAppNumber && (
                      <p className="text-rose-600 text-[10px] font-bold font-mono mt-1">⚠️ {errors.whatsAppNumber}</p>
                    )}
                    <span className="text-[9px] text-slate-400/80 block mt-1 font-mono font-medium">To route dynamic SMS &amp; WhatsApp map schedules</span>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1" id="sv-field-emailAddress">
                    <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 font-mono">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type="email" 
                        required 
                        value={emailAddress}
                        onChange={(e) => {
                          setEmailAddress(e.target.value);
                          if (attemptedSubmit && e.target.value.trim()) {
                            setErrors(prev => ({ ...prev, emailAddress: '' }));
                          }
                        }}
                        placeholder="e.g. customer@realty.com"
                        className={`w-full pl-10 pr-4 py-3 bg-white border outline-none rounded-xl font-bold text-slate-800 ${
                          attemptedSubmit && errors.emailAddress
                            ? 'border-rose-500 ring-1 ring-rose-500/20'
                            : 'border-slate-200 hover:border-slate-300 focus:border-[#ff5a3c] focus:ring-1 focus:ring-[#ff5a3c]'
                        }`}
                      />
                    </div>
                    {attemptedSubmit && errors.emailAddress && (
                      <p className="text-rose-600 text-[10px] font-bold font-mono mt-1">⚠️ {errors.emailAddress}</p>
                    )}
                  </div>

                </div>
              </div>

              {/* Section 2: Property Allocation */}
              <div className="space-y-4">
                <h4 className="text-xs font-black font-mono uppercase tracking-widest text-sky-600 border-b border-slate-100 pb-2">
                  2. Targeted Real Estate Allocations
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 font-mono">Property Interested In</label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={propertyName}
                        onChange={(e) => setPropertyName(e.target.value)}
                        placeholder="Auto-filled from active listing (or enter name manually)"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none rounded-xl font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 font-mono">Property ID</label>
                    <input 
                      type="text" 
                      value={propertyId}
                      onChange={(e) => setPropertyId(e.target.value)}
                      placeholder="e.g. PROP-1522"
                      className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none rounded-xl font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 font-mono">Property Location Area</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. JP Nagar Phase 5"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none rounded-xl font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 font-mono">Property Type Category</label>
                    <input 
                      type="text" 
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      placeholder="e.g. Luxury Apartment / Plot"
                      className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none rounded-xl font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 font-mono">Assigned Project Agent</label>
                    <input 
                      type="text" 
                      value={agentAssigned}
                      onChange={(e) => setAgentAssigned(e.target.value)}
                      placeholder="e.g. Rahul Kumar (Project Advocate)"
                      className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none rounded-xl font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Booking Schedule Constraints */}
              <div className="space-y-4">
                <h4 className="text-xs font-black font-mono uppercase tracking-widest text-indigo-600 border-b border-slate-100 pb-2">
                  3. Walkthrough Constraints &amp; Schedules
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  
                  {/* Preferred Visit Date */}
                  <div className="space-y-1 sm:col-span-1" id="sv-field-preferredDate">
                    <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 font-mono">Preferred Visit Date *</label>
                    <input 
                      type="date" 
                      required
                      value={preferredDate}
                      onChange={(e) => {
                        setPreferredDate(e.target.value);
                        if (attemptedSubmit && e.target.value) {
                          setErrors(prev => ({ ...prev, preferredDate: '' }));
                        }
                      }}
                      className={`w-full px-4 py-3 bg-white border outline-none rounded-xl font-bold text-slate-800 cursor-pointer ${
                        attemptedSubmit && errors.preferredDate
                          ? 'border-rose-500 ring-1 ring-rose-500/20'
                          : 'border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                      }`}
                    />
                    {attemptedSubmit && errors.preferredDate && (
                      <p className="text-rose-600 text-[10px] font-bold font-mono mt-1">⚠️ {errors.preferredDate}</p>
                    )}
                  </div>

                  {/* Visit Slot Time */}
                  <div className="space-y-1 sm:col-span-1" id="sv-field-preferredTime">
                    <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 font-mono">Visit Slot Time *</label>
                    <div className="relative">
                      <Clock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        required
                        value={preferredTime}
                        onChange={(e) => {
                          setPreferredTime(e.target.value);
                          if (attemptedSubmit && e.target.value.trim()) {
                            setErrors(prev => ({ ...prev, preferredTime: '' }));
                          }
                        }}
                        placeholder="e.g. 11:30 AM"
                        className={`w-full pl-10 pr-4 py-3 bg-white border outline-none rounded-xl font-bold text-slate-800 ${
                          attemptedSubmit && errors.preferredTime
                            ? 'border-rose-500 ring-1 ring-rose-500/20'
                            : 'border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                        }`}
                      />
                    </div>
                    {attemptedSubmit && errors.preferredTime && (
                      <p className="text-rose-600 text-[10px] font-bold font-mono mt-1">⚠️ {errors.preferredTime}</p>
                    )}
                  </div>

                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 font-mono">No. of Visitors</label>
                    <div className="relative">
                      <Users className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type="number" 
                        min="1"
                        max="12"
                        value={numberOfVisitors}
                        onChange={(e) => setNumberOfVisitors(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-xl font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 font-mono">Booking Source</label>
                    <select 
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-xl font-bold text-slate-800 cursor-pointer"
                    >
                      <option value="Website Landing Page">Website Landing Page</option>
                      <option value="Property Detail Page">Property Detail Page</option>
                      <option value="Location Discovery Hub">Location Discovery Hub</option>
                      <option value="Campaign Ads Channel">Campaign Ads Channel</option>
                      <option value="Broker Network Partner">Broker Network Partner</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 font-mono">Special Requirements (Dietary, Accessibility, Transport)</label>
                  <textarea 
                    rows={2}
                    value={specialRequirements}
                    onChange={(e) => setSpecialRequirements(e.target.value)}
                    placeholder="e.g. Require transport from JP Nagar metro, wheelchair accessibility, solar panel brief overview needed..."
                    className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-xl font-bold text-slate-800 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 font-mono">Additional Remarks (Advocate Review Notes)</label>
                    <textarea 
                      rows={2}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Personal scheduling constraints, pre-approval details..."
                      className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-xl font-bold text-slate-800 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Buttons: Submit, Reset, Cancel matching required behavior */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-755 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-505 hover:text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset Form
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-[#ff5a3c] hover:bg-[#e04f32] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg focus:ring-2 focus:ring-[#ff5a3c]/30 cursor-pointer text-center"
                >
                  <CheckSquare className="w-4 h-4" />
                  Schedule Site Visit
                </button>
              </div>

            </form>
          )}

        </motion.div>
      </div>
    </div>
  );
}
