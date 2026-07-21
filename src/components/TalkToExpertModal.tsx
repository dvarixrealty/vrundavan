import React, { useState, useEffect } from 'react';
import { 
  X, Check, User, Phone, Mail, MessageSquare, Clock, ArrowRight, CheckCircle2, ShieldCheck, Building2, Landmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Property } from '../types';

interface TalkToExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProperty?: Property | null;
  onSubmitInquiry: (inquiryData: {
    propertyId?: string;
    propertyName?: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    preferredTime: string;
    contactMethod: 'Phone' | 'WhatsApp' | 'Email';
  }) => void;
}

export default function TalkToExpertModal({
  isOpen,
  onClose,
  selectedProperty,
  onSubmitInquiry
}: TalkToExpertModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredTime, setPreferredTime] = useState('Morning (9 AM - 12 PM)');
  const [contactMethod, setContactMethod] = useState<'Phone' | 'WhatsApp' | 'Email'>('Phone');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Auto-fill property message when property is set
  useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
      setValidationError('');
      if (selectedProperty) {
        setMessage(`Hi, I am interested in exploring ${selectedProperty.title || selectedProperty.projectName || 'this property'}. Please share the digital brochures, legal papers, and price layouts.`);
      } else {
        setMessage('Hi, I am looking for custom real estate advisory guidance. Please connect me with a regional expert.');
      }
    }
  }, [selectedProperty, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setValidationError('Please enter your mobile number.');
      return;
    }
    if (!email.trim()) {
      setValidationError('Please enter your email address.');
      return;
    }

    setValidationError('');
    
    onSubmitInquiry({
      propertyId: selectedProperty?.id || 'general-portfolio',
      propertyName: selectedProperty?.title || 'General Advisory Consultation',
      name,
      email,
      phone,
      message,
      preferredTime,
      contactMethod
    });

    setIsSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#060c18]/85 backdrop-blur-md"
      />

      {/* Content Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-slate-950 border border-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl z-10 font-sans flex flex-col text-left"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-900 flex justify-between items-center bg-slate-950">
          <div>
            <span className="text-[#ff5a3c] font-mono text-[9px] font-extrabold uppercase tracking-widest block">VIP CONNECTION DESK</span>
            <h3 className="text-lg font-black text-white">Talk to Property Expert</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh] space-y-6">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form
                key="expert-form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {validationError && (
                  <div className="p-3 bg-rose-950/40 border border-rose-900 text-rose-350 text-xs rounded-xl font-medium">
                    {validationError}
                  </div>
                )}

                {/* Selected Property Card Summary */}
                {selectedProperty ? (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-850 shrink-0 border border-slate-800">
                      <img
                        src={selectedProperty.image || selectedProperty.images?.[0]}
                        alt={selectedProperty.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-grow space-y-1 text-left min-w-0">
                      <span className="bg-[#ff5a3c]/10 text-[#ff5a3c] font-mono font-bold text-[9px] uppercase px-2 py-0.5 rounded border border-[#ff5a3c]/15 inline-block mb-1">
                        Selected Property
                      </span>
                      <h4 className="text-sm font-black text-white truncate">{selectedProperty.title}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">ID: {selectedProperty.id} • {selectedProperty.locationName || selectedProperty.address}</p>
                      <p className="text-xs font-bold text-[#ff5a3c]">{selectedProperty.price >= 10000000 ? `₹${(selectedProperty.price / 10000000).toFixed(2)} Cr` : `₹${(selectedProperty.price / 100000).toFixed(1)} Lakhs`}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4 flex gap-3.5 items-center">
                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">General Portfolio Consultation</h4>
                      <p className="text-[11px] text-slate-400">Our regional property specialist will guide you across all active Bangalore projects.</p>
                    </div>
                  </div>
                )}

                {/* Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Your Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Anand Kumar"
                        className="w-full bg-slate-900/50 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl pl-10 pr-4 py-3 placeholder-slate-500 focus:outline-none focus:border-[#ff5a3c] focus:ring-1 focus:ring-[#ff5a3c] transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Mobile Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full bg-slate-900/50 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl pl-10 pr-4 py-3 placeholder-slate-500 focus:outline-none focus:border-[#ff5a3c] focus:ring-1 focus:ring-[#ff5a3c] transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. anand@company.com"
                      className="w-full bg-slate-900/50 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl pl-10 pr-4 py-3 placeholder-slate-500 focus:outline-none focus:border-[#ff5a3c] focus:ring-1 focus:ring-[#ff5a3c] transition"
                    />
                  </div>
                </div>

                {/* Contact Method Selection */}
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Preferred Contact Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Phone', 'WhatsApp', 'Email'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setContactMethod(method)}
                        className={`py-2.5 rounded-xl text-xs font-bold font-mono transition-all border flex items-center justify-center gap-1.5 ${
                          contactMethod === method
                            ? 'bg-[#ff5a3c]/10 text-[#ff5a3c] border-[#ff5a3c]'
                            : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {method === 'Phone' && <Phone className="h-3.5 w-3.5" />}
                        {method === 'WhatsApp' && <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />}
                        {method === 'Email' && <Mail className="h-3.5 w-3.5" />}
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Contact Time Slot */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Preferred Callback Slot</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:border-[#ff5a3c] transition cursor-pointer appearance-none"
                    >
                      <option>Morning (9 AM - 12 PM)</option>
                      <option>Afternoon (12 PM - 4 PM)</option>
                      <option>Evening (4 PM - 7 PM)</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Special Inquiry Details / Message</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide any specific requirements or property questions..."
                    className="w-full bg-slate-900/50 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl p-3.5 focus:outline-none focus:border-[#ff5a3c] focus:ring-1 focus:ring-[#ff5a3c] transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 bg-[#ff5a3c] hover:bg-[#e04f32] text-white py-4 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[101%] active:scale-[99%]"
                >
                  <span>Connect with Advisor Expert</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="expert-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-8 text-center space-y-4"
              >
                <div className="inline-flex p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full mb-2">
                  <CheckCircle2 className="h-12 w-12 animate-bounce" />
                </div>
                <h4 className="text-xl font-black text-white">Connection Initialized!</h4>
                <p className="text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
                  Thank you, <strong>{name}</strong>! Your inquiry for <strong>{selectedProperty?.title || 'General Advisory'}</strong> has been registered directly inside our CRM.
                </p>
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 max-w-sm mx-auto text-left space-y-1.5 font-mono text-[11px] text-slate-400">
                  <p>• <span className="text-slate-300">Method:</span> Contact via {contactMethod}</p>
                  <p>• <span className="text-slate-300">Callback Slot:</span> {preferredTime}</p>
                  <p>• <span className="text-slate-300">Reference Token:</span> RE-EXP-{Date.now().toString().slice(-6)}</p>
                </div>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Our regional portfolio expert will establish contact within your chosen callback slot.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition"
                >
                  Dismiss Window
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
