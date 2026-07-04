import React, { useState } from 'react';
import { 
  X, MapPin, Ruler, Bed, Bath, Star, DollarSign, 
  Percent, Calendar, Phone, Mail, CheckCircle, ArrowRight, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Property, Inquiry } from '../types';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  onAddInquiry: (inquiry: Omit<Inquiry, 'id' | 'date' | 'status'>) => void;
  onBookSiteVisit?: (property: Property) => void;
}

export default function PropertyDetailModal({ property, onClose, onAddInquiry, onBookSiteVisit }: PropertyDetailModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Mortgage Calculator State
  const [downPaymentPct, setDownPaymentPct] = useState(20); // 20% default
  const [interestRate, setInterestRate] = useState(6.5); // 6.5% standard
  const [loanTermYears, setLoanTermYears] = useState(30); // 30 years standard

  // Inquiry Form State
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientMessage, setClientMessage] = useState(
    property ? `I would love to learn more about the project: ${property.title}. Plase details pricing and scheduled site tours.` : ''
  );
  const [preferredTime, setPreferredTime] = useState('Morning (9 AM - 12 PM)');

  if (!property) return null;

  // Mortgage Payment Math
  const propertyPrice = property.price;
  const downPaymentAmount = (propertyPrice * downPaymentPct) / 100;
  const principalAmount = propertyPrice - downPaymentAmount;
  const monthlyInterestRate = interestRate / 100 / 12;
  const totalPaymentsCount = loanTermYears * 12;

  const monthlyMortgagePayment = (() => {
    if (interestRate === 0) return principalAmount / totalPaymentsCount;
    return (
      (principalAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPaymentsCount)) /
      (Math.pow(1 + monthlyInterestRate, totalPaymentsCount) - 1)
    );
  })();

  const formatPrice = (p: number) => {
    if (p >= 10000000) {
      return `₹${(p / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    } else if (p >= 100000) {
      return `₹${(p / 100000).toFixed(2).replace(/\.00$/, '')} Lakh`;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(p);
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !clientPhone) {
      alert('Please fill out all contact fields');
      return;
    }

    onAddInquiry({
      propertyId: property.id,
      propertyName: property.title,
      name: clientName,
      email: clientEmail,
      phone: clientPhone,
      message: clientMessage,
      preferredTime: preferredTime
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      // close modal on success optionally, or keep showing state
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl overflow-hidden max-w-5xl w-full text-slate-800 shadow-2xl relative border border-slate-200"
        id="property-detail-modal-container"
      >
        
        {/* Close Button Trigger */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2.5 bg-slate-900/90 text-white rounded-full hover:bg-[#ff5a3c] transition duration-200 shadow-md cursor-pointer"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[90vh] overflow-y-auto">
          
          {/* LEFT PANEL: Media Showcase, Description, Calculator (7 columns) */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-8 border-r border-slate-100 divide-y divide-slate-100 overflow-y-auto">
            
            {/* Title, rating and address */}
            <div className="space-y-3 pb-4">
              <div className="flex items-center space-x-2">
                <span className="bg-[#ff5a3c] text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md font-mono">
                  {property.type}
                </span>
                <div className="flex items-center text-amber-500 text-xs font-bold gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-500" />
                  <span>{property.rating} ({property.reviews} Reviews)</span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-slate-900 tracking-tight">
                {property.title}
              </h2>

              <div className="flex items-center space-x-1.5 text-slate-400 text-sm">
                <MapPin className="h-4 w-4 text-[#ff5a3c]" />
                <span>{property.address}</span>
              </div>
            </div>

            {/* Slider / Image Gallery Layout */}
            <div className="relative pt-6">
              <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 shadow-inner relative">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImageIdx}
                    src={property.images[activeImageIdx] || property.image}
                    alt={`${property.title} slide`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>
              </div>

              {/* Slider Dots */}
              <div className="flex space-x-2 justify-center mt-3">
                {property.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    className={`h-2 rounded-full cursor-pointer transition ${
                      activeImageIdx === i ? 'w-6 bg-[#ff5a3c]' : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Structured Specifications Grid */}
            <div className="grid grid-cols-3 gap-4 pt-6 text-center select-none">
              <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                <Ruler className="h-5 w-5 text-[#ff5a3c] mx-auto" />
                <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold font-mono">Total Area</span>
                <span className="font-bold text-sm text-slate-800">{property.sqft} SQ FT</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                <Bed className="h-5 w-5 text-[#ff5a3c] mx-auto" />
                <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold font-mono">Bedrooms</span>
                <span className="font-bold text-sm text-slate-800">{property.beds > 0 ? `${property.beds} Rooms` : 'N/A'}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                <Bath className="h-5 w-5 text-[#ff5a3c] mx-auto" />
                <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold font-mono">Bathrooms</span>
                <span className="font-bold text-sm text-slate-800">{property.baths > 0 ? `${property.baths} Bath` : 'N/A'}</span>
              </div>
            </div>

            {/* Long Rich Text Description */}
            <div className="pt-6 space-y-3">
              <h4 className="font-mono text-xs uppercase tracking-wider text-slate-400 font-bold">Project Overview</h4>
              <p className="text-slate-600 text-sm leading-relaxed font-sans font-light">
                {property.description}
              </p>
            </div>

            {/* Checklist of Amenities */}
            <div className="pt-6 space-y-3">
              <h4 className="font-mono text-xs uppercase tracking-wider text-slate-400 font-bold">Standard Conveniences</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-600" id="amenities-grid">
                {property.amenities.map((item) => (
                  <div key={item} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* INTERACTIVE MORTGAGE CALCULATOR (Highly refined custom UI!) */}
            <div className="pt-6 space-y-4">
              <div>
                <h4 className="font-mono text-xs uppercase tracking-wider text-slate-400 font-bold">Dynamic Investment Calculator</h4>
                <p className="text-[11px] text-slate-500 font-sans mt-1">
                  Adjust down payments and prevailing tax percentages to calculate estimated monthly mortgage schedules.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl space-y-5">
                {/* Result Block */}
                <div className="bg-[#0a192f] text-white p-4 rounded-xl flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[9px] uppercase tracking-widest text-[#ff5a3c] font-black font-mono">Estimated Payment</span>
                    <span className="block text-xl sm:text-2xl font-extrabold text-white">
                      {formatPrice(monthlyMortgagePayment)} <span className="text-slate-400 text-xs font-light font-mono">/ MO</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block font-mono">Principal to Finance</span>
                    <span className="text-xs text-white font-semibold font-mono">{formatPrice(principalAmount)}</span>
                  </div>
                </div>

                {/* Down Payment Selector */}
                <div className="space-y-2 text-left">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Down Payment Ratio ({downPaymentPct}%)</span>
                    <span>{formatPrice(downPaymentAmount)}</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    step="5"
                    value={downPaymentPct}
                    onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#ff5a3c]"
                  />
                </div>

                {/* Inputs Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono flex items-center gap-1">
                      <Percent className="h-3.5 w-3.5 text-[#ff5a3c]" /> Interest Rate
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="15"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[#ff5a3c]"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-[#ff5a3c]" /> Loan Term (Years)
                    </label>
                    <select
                      value={loanTermYears}
                      onChange={(e) => setLoanTermYears(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[#ff5a3c] cursor-pointer"
                    >
                      <option value="15">15 Years Term</option>
                      <option value="20">20 Years Term</option>
                      <option value="30">30 Years Term</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT PANEL: Agent Detail Block & Inquiry consultation submit Form (5 columns) */}
          <div className="lg:col-span-5 p-6 sm:p-8 bg-slate-50 flex flex-col justify-between overflow-y-auto">
            
            <div className="space-y-6">
              
              {/* Agent card details */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#ff5a3c] font-mono block">Assignee Project Agent</span>
                <div className="flex items-center space-x-3 text-left">
                  <img
                    src={property.agent.avatar}
                    alt={property.agent.name}
                    className="w-14 h-14 rounded-full object-cover border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h5 className="font-bold text-slate-900 font-sans text-base leading-snug">{property.agent.name}</h5>
                    <p className="text-xs text-slate-500 font-mono">{property.agent.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2 text-xs font-semibold text-slate-600 font-mono border-t border-slate-50">
                  <a href={`tel:${property.agent.phone}`} className="flex items-center space-x-2 text-left hover:text-[#ff5a3c]">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{property.agent.phone}</span>
                  </a>
                  <a href={`mailto:${property.agent.email}`} className="flex items-center space-x-2 text-left hover:text-[#ff5a3c] truncate">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{property.agent.email}</span>
                  </a>
                </div>
              </div>

              {/* Primary BOOK FREE SITE VISIT VIP CTA Button */}
              {onBookSiteVisit && (
                <button
                  type="button"
                  onClick={() => onBookSiteVisit(property)}
                  className="w-full bg-[#ff5a3c] hover:bg-[#e04f32] text-white py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg hover:scale-[101%] active:scale-[98%] transition duration-200 cursor-pointer text-center"
                >
                  <Calendar className="h-5 w-5 animate-pulse" />
                  BOOK FREE PHYSICAL SITE VISIT
                </button>
              )}

              {/* Inquiry form section */}
              <div className="space-y-4 text-left">
                <div className="space-y-1">
                  <h4 className="font-sans font-bold text-base text-slate-900 leading-snug">Arrange Site Consultation</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans font-light">
                    Submit your credentials below to block out scheduling space directly inside our CRM registers.
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3"
                    >
                      <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto animate-bounce" />
                      <h5 className="font-sans font-extrabold text-emerald-800 text-sm">Consultation Reserved!</h5>
                      <p className="text-xs text-emerald-700 leading-relaxed font-sans">
                        Excellent, your details were synced with <strong>{property.agent.name}'s</strong> daily calendar registry. They will reach out to you directly within 2 business hours.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleInquirySubmit} className="space-y-3">
                      
                      {/* Name input */}
                      <div className="space-y-1 justify-start">
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Full Name</label>
                        <input
                          type="text"
                          required
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c]"
                        />
                      </div>

                      {/* Email input */}
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Corporate Email</label>
                        <input
                          type="email"
                          required
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="name@company.com"
                          className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c]"
                        />
                      </div>

                      {/* Phone Input */}
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Business Phone</label>
                        <input
                          type="tel"
                          required
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="e.g. 6300984846"
                          className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c]"
                        />
                      </div>

                      {/* Tour Time Dropdown selector */}
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Preferred Consult Slot</label>
                        <select
                          value={preferredTime}
                          onChange={(e) => setPreferredTime(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c] cursor-pointer"
                        >
                          <option>Morning (9 AM - 12 PM)</option>
                          <option>Afternoon (12 PM - 4 PM)</option>
                          <option>Evening (4 PM - 7 PM)</option>
                        </select>
                      </div>

                      {/* Text message */}
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Enquiry Message</label>
                        <textarea
                          rows={3}
                          value={clientMessage}
                          onChange={(e) => setClientMessage(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl p-4 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c] resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#ff5a3c] hover:bg-[#e04326] text-white py-3.5 rounded-xl font-bold tracking-wider text-xs uppercase shadow-md active:scale-[98%] transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Request Appointment Slot
                        <ArrowRight className="h-4 w-4" />
                      </button>

                    </form>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* Price section */}
            <div className="pt-6 border-t border-slate-200 text-left mt-8">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">Valuation Estimate</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-[#ff5a3c] tracking-tight">
                  {formatPrice(propertyPrice)}
                </span>
                <span className="text-xs text-slate-400 font-mono">Listed Price</span>
              </div>
            </div>

          </div>

        </div>

      </motion.div>
    </div>
  );
}
