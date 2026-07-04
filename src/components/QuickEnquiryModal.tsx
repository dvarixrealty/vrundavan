import React, { useState, useRef } from 'react';
import { X, Send, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuickEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

export default function QuickEnquiryModal({ isOpen, onClose, onSubmitSuccess }: QuickEnquiryModalProps) {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [requirement, setRequirement] = useState('');

  // Validation
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // References for reliable scrolling to validation failures
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const reqRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    const validationErrors: Record<string, string> = {};
    if (!name.trim()) {
      validationErrors.name = 'Please enter your full name.';
    }
    if (!phoneNumber.trim()) {
      validationErrors.phoneNumber = 'Please enter your mobile number.';
    } else if (phoneNumber.trim().length < 10) {
      validationErrors.phoneNumber = 'Please enter a valid mobile number.';
    }
    if (!email.trim()) {
      validationErrors.email = 'Please enter your email address.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      validationErrors.email = 'Please enter a valid email address.';
    }
    if (!requirement.trim()) {
      validationErrors.requirement = 'Please specify your requirements.';
    }

    setErrors(validationErrors);

    // If we have errors, scroll to the first invalid field
    const errorKeys = Object.keys(validationErrors);
    if (errorKeys.length > 0) {
      const firstError = errorKeys[0];
      if (firstError === 'name' && nameRef.current) nameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      else if (firstError === 'phoneNumber' && phoneRef.current) phoneRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      else if (firstError === 'email' && emailRef.current) emailRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      else if (firstError === 'requirement' && reqRef.current) reqRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setErrors({});
    
    // Simulate CRM Integration & Notifications Dispatch
    const payload = {
      id: `enq-auto-${Date.now()}`,
      customerName: name,
      mobile: phoneNumber,
      email: email,
      propertyRequirement: requirement,
      location: 'Central Bengaluru',
      budget: 'Flexible Range',
      propertyName: 'General Portfolio',
      propertyId: 'PROP-GEN',
      propertyType: 'Residential',
      agent: 'Rahul Kumar',
      date: new Date().toLocaleDateString('en-US'),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      remarks: `Submitted on high-street teaser via Quick Enquire: ${requirement}`
    };

    // Emit live event to let dashboard ingest enquiry list
    const event = new CustomEvent('cms-add-site-visit', { detail: payload });
    window.dispatchEvent(event);

    setSubmitted(true);
    if (onSubmitSuccess) {
      onSubmitSuccess();
    }

    setTimeout(() => {
      setName('');
      setPhoneNumber('');
      setEmail('');
      setRequirement('');
      setAttemptedSubmit(false);
      setSubmitted(false);
      onClose();
    }, 4000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto block" id="quick-enquiry-modal" role="dialog" aria-modal="true">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 transition-opacity backdrop-blur-sm cursor-pointer" 
            onClick={onClose} 
          />

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full relative border border-slate-100"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff5a3c] animate-ping" />
                <h4 className="text-base font-extrabold text-slate-900 tracking-tight font-sans">
                  Quick Property Enquiry
                </h4>
              </div>
              <button 
                onClick={onClose} 
                className="text-slate-400 hover:text-slate-800 p-2 rounded-full bg-slate-100/50 hover:bg-slate-100 transition cursor-pointer"
                title="Close enquiries"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitted ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-sm">
                  <Check className="w-8 h-8 stroke-[3px] animate-bounce" />
                </div>
                <div className="space-y-1.5">
                  <h5 className="text-lg font-black text-slate-900">Enquiry Submitted Successfully!</h5>
                  <p className="text-slate-600 text-xs leading-relaxed max-w-sm mx-auto">
                    Hi <span className="font-bold text-slate-900">{name}</span>, your request has been logged. Our resident advisors will contact you immediately.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-left" noValidate>
                
                {/* 1. Name */}
                <div className="space-y-1" id="field-group-name">
                  <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 font-mono">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    ref={nameRef}
                    id="quick-enquiry-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (attemptedSubmit && e.target.value.trim()) {
                        setErrors(prev => ({ ...prev, name: '' }));
                      }
                    }}
                    placeholder="e.g. Anand Kumar"
                    className={`w-full px-4 py-3 bg-white border outline-none rounded-xl font-bold text-slate-800 transition ${
                      attemptedSubmit && errors.name 
                        ? 'border-rose-500 ring-1 ring-rose-500/20' 
                        : 'border-slate-200 hover:border-slate-300 focus:border-[#ff5a3c]'
                    }`}
                  />
                  {attemptedSubmit && errors.name && (
                    <p className="text-rose-600 text-[10px] font-bold font-sans">⚠️ {errors.name}</p>
                  )}
                </div>

                {/* 2. Phone Number */}
                <div className="space-y-1" id="field-group-phone">
                  <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 font-mono">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    ref={phoneRef}
                    id="quick-enquiry-phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (attemptedSubmit && e.target.value.trim()) {
                        setErrors(prev => ({ ...prev, phoneNumber: '' }));
                      }
                    }}
                    placeholder="e.g. +91 91234 56789"
                    className={`w-full px-4 py-3 bg-white border outline-none rounded-xl font-bold text-slate-800 transition ${
                      attemptedSubmit && errors.phoneNumber 
                        ? 'border-rose-500 ring-1 ring-rose-500/20' 
                        : 'border-slate-200 hover:border-slate-300 focus:border-[#ff5a3c]'
                    }`}
                  />
                  {attemptedSubmit && errors.phoneNumber && (
                    <p className="text-rose-600 text-[10px] font-bold font-sans">⚠️ {errors.phoneNumber}</p>
                  )}
                </div>

                {/* 3. Email */}
                <div className="space-y-1" id="field-group-email">
                  <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 font-mono">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    ref={emailRef}
                    id="quick-enquiry-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (attemptedSubmit && e.target.value.trim()) {
                        setErrors(prev => ({ ...prev, email: '' }));
                      }
                    }}
                    placeholder="customer@realty.com"
                    className={`w-full px-4 py-3 bg-white border outline-none rounded-xl font-bold text-slate-800 transition ${
                      attemptedSubmit && errors.email 
                        ? 'border-rose-500 ring-1 ring-rose-500/20' 
                        : 'border-slate-200 hover:border-slate-300 focus:border-[#ff5a3c]'
                    }`}
                  />
                  {attemptedSubmit && errors.email && (
                    <p className="text-rose-600 text-[10px] font-bold font-sans">⚠️ {errors.email}</p>
                  )}
                </div>

                {/* 4. Requirement */}
                <div className="space-y-1" id="field-group-req">
                  <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 font-mono">
                    Your Requirement Details <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    ref={reqRef}
                    id="quick-enquiry-req"
                    rows={3}
                    value={requirement}
                    onChange={(e) => {
                      setRequirement(e.target.value);
                      if (attemptedSubmit && e.target.value.trim()) {
                        setErrors(prev => ({ ...prev, requirement: '' }));
                      }
                    }}
                    placeholder="e.g. East facing 30x40 villa plot near Indiranagar, budget ₹1.2 Cr."
                    className={`w-full px-4 py-3 bg-white border outline-none rounded-xl font-bold text-slate-800 transition resize-none ${
                      attemptedSubmit && errors.requirement 
                        ? 'border-rose-500 ring-1 ring-rose-500/20' 
                        : 'border-slate-200 hover:border-slate-300 focus:border-[#ff5a3c]'
                    }`}
                  />
                  {attemptedSubmit && errors.requirement && (
                    <p className="text-rose-600 text-[10px] font-bold font-sans">⚠️ {errors.requirement}</p>
                  )}
                </div>

                {/* Action CTA */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="w-full bg-[#ff5a3c] hover:bg-[#e04f32] text-white py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Enquiry
                  </button>
                </div>

              </form>
            )}

          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
