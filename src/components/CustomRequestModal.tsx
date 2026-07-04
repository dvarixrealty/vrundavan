import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Send, 
  Calendar, 
  Lock, 
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomRequirement } from '../types';

interface CustomRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CustomRequirement, 'id' | 'status' | 'date'>) => void;
  onBookSiteVisitClick?: (prefilled: any) => void;
}

export default function CustomRequestModal({ isOpen, onClose, onSubmit, onBookSiteVisitClick }: CustomRequestModalProps) {
  // Basic Details
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [city, setCity] = useState('');

  // Property Requirement
  const [lookingFor, setLookingFor] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [budgetRange, setBudgetRange] = useState('');

  // Property Specifications
  const [areaRequirement, setAreaRequirement] = useState('');
  const [bhkRequirement, setBhkRequirement] = useState('');
  const [planningTimeline, setPlanningTimeline] = useState('');
  const [alternativeLocation, setAlternativeLocation] = useState('');
  
  // Custom message details
  const [message, setMessage] = useState('');

  // Submission Status
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedSubmitType, setSelectedSubmitType] = useState<'Requirement' | 'Site Visit'>('Requirement');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validation States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const handleActionSubmit = (type: 'Requirement' | 'Site Visit', e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    const validationErrors: Record<string, string> = {};
    if (!fullName.trim()) {
      validationErrors.fullName = 'Please enter your full name.';
    }
    if (!mobileNumber.trim()) {
      validationErrors.mobileNumber = 'Please enter your mobile number.';
    }
    if (!lookingFor.trim()) {
      validationErrors.lookingFor = 'Please specify what you are looking for.';
    }
    if (!propertyType.trim()) {
      validationErrors.propertyType = 'Please specify the property type.';
    }
    if (!preferredLocation.trim()) {
      validationErrors.preferredLocation = 'Please specify your preferred location.';
    }

    setErrors(validationErrors);

    const errorKeys = Object.keys(validationErrors);
    if (errorKeys.length > 0) {
      const firstError = errorKeys[0];
      const element = document.getElementById(`cr-field-${firstError}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setValidationError(null);
    setErrors({});
    setSelectedSubmitType(type);

    onSubmit({
      fullName,
      mobileNumber,
      emailAddress,
      city,
      lookingFor,
      propertyType,
      preferredCity: preferredLocation, // Save to database required field
      preferredArea: alternativeLocation, // Save to database alternative fallback
      alternativeLocation,
      minBudget: budgetRange, // Fallbacks
      maxBudget: budgetRange,
      bhkRequirement: bhkRequirement || 'N/A',
      plotSize: areaRequirement,
      readyToMove: 'Yes',
      preferredDate: new Date().toLocaleDateString('en-US'),
      preferredTime: 'Anytime',
      message,
      timeline: planningTimeline,
      submissionType: type === 'Requirement' ? 'Requirement' : 'Site Visit'
    });

    setFormSubmitted(true);

    // Auto-close countdown helper
    const timeoutId = setTimeout(() => {
      setFullName('');
      setMobileNumber('');
      setEmailAddress('');
      setCity('');
      setLookingFor('');
      setPropertyType('');
      setPreferredLocation('');
      setBudgetRange('');
      setAreaRequirement('');
      setBhkRequirement('');
      setPlanningTimeline('');
      setAlternativeLocation('');
      setMessage('');
      setFormSubmitted(false);
      setAttemptedSubmit(false);
      setErrors({});
      onClose();
    }, 12000);

    return () => clearTimeout(timeoutId);
  };

  const handleSwitchToSiteVisit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onBookSiteVisitClick) {
      // Switch immediately and onClose current modal
      onBookSiteVisitClick({
        customerName: fullName,
        mobileNumber: mobileNumber,
        emailAddress: emailAddress,
        location: preferredLocation,
        propertyType: propertyType,
        specialRequirements: message
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto block" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-12 text-center sm:block sm:p-0">
          
          {/* Backdrop Blur Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 transition-opacity backdrop-blur-sm" 
            aria-hidden="true"
            onClick={onClose}
          />

          {/* Vertical Spacer to Center Modal */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          {/* Clean High-Fidelity White-Background Light Form Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full relative border border-slate-100"
          >
            {/* Close Accent Trigger Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 p-2 rounded-full bg-slate-50 hover:bg-slate-100 transition duration-150 z-10"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {formSubmitted ? (
              <div className="py-16 px-6 sm:px-10 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-sm shadow-emerald-50/50">
                  <Check className="h-10 w-10 animate-bounce stroke-[3px]" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                    {selectedSubmitType === 'Requirement' ? 'Requirement Registered Successfully!' : 'Free Site Visit Requested Successfully!'}
                  </h4>
                  <p className="text-slate-600 text-sm max-w-xl mx-auto leading-relaxed">
                    Excellent, your property requirements have been securely saved to the Database &amp; Admin Panel. Our elite advisory staff in <span className="text-[#ff5a3c] font-black">JP Nagar Bangalore</span> will process your file instantly.
                  </p>
                </div>

                {/* Instant WhatsApp Action Option configured exactly for user's number */}
                <div className="pt-4 max-w-md mx-auto space-y-3">
                  <p className="text-xs text-slate-500 font-medium">
                    To expedite your request, you can also send this requirement sheet directly to our helpline on WhatsApp:
                  </p>
                  <a
                    href={`https://wa.me/916300984846?text=${encodeURIComponent(
                      `*DVARIX REALTY - REQUIREMENT MANDATE*\n` +
                      `━━━━━━━━━━━━━━━━━━━━━\n\n` +
                      `👤 *Name:* ${fullName}\n` +
                      `📱 *Mobile:* ${mobileNumber}\n` +
                      `✉️ *Email:* ${emailAddress || 'N/A'}\n` +
                      `📍 *Current City:* ${city || 'N/A'}\n\n` +
                      `🔍 *Looking For:* ${lookingFor}\n` +
                      `🏢 *Property Type:* ${propertyType || 'N/A'}\n` +
                      `🗺️ *Preferred Location:* ${preferredLocation}\n` +
                      `🏢 *Alternative Location:* ${alternativeLocation || 'N/A'}\n` +
                      `📐 *Area Req:* ${areaRequirement || 'N/A'}\n` +
                      `🛏️ *BHK Req:* ${bhkRequirement || 'N/A'}\n` +
                      `💰 *Budget Range:* ${budgetRange || 'N/A'}\n` +
                      `📆 *Timeline:* ${planningTimeline || 'N/A'}\n\n` +
                      `📝 *About Property:* ${message || 'No additional instructions provided.'}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━━\n` +
                      `_Submitted via ${selectedSubmitType === 'Requirement' ? 'Submit Requirement' : 'Book Free Site Visit'}_`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-sm font-black uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.062 5.248 5.31 0 11.748 0c3.117.001 6.048 1.212 8.251 3.417 2.204 2.205 3.412 5.137 3.411 8.254-.005 6.438-5.251 11.688-11.69 11.688-1.991-.001-3.947-.509-5.673-1.478L0 24zm6.49-4.72c1.554.921 3.09 1.402 4.643 1.403 5.114 0 9.278-4.161 9.281-9.281.001-2.48-.962-4.81-2.716-6.565-1.755-1.754-4.088-2.716-6.566-2.717-5.118 0-9.282 4.162-9.285 9.284-.001 1.706.452 3.376 1.311 4.887L1.93 22.07l4.617-1.79zM16.945 13.91c-.287-.143-1.697-.837-1.959-.933-.262-.096-.453-.143-.644.143-.191.287-.738.932-.905 1.121-.167.19-.334.214-.621.071-1.123-.563-1.865-.93-2.587-2.17-.191-.326.191-.303.547-1.013.058-.119.03-.224-.015-.319-.044-.096-.452-1.089-.619-1.492-.162-.392-.327-.339-.453-.346-.118-.006-.254-.007-.39-.007s-.358.05-.545.254c-.187.204-.716.699-.716 1.705s.731 1.979.833 2.115c.101.136 1.442 2.202 3.493 3.084.488.21 1.078.336 1.444.348.406.012.775-.175 1.066-.607.292-.432 criteria .292-1.205 criteria.191-1.348-.101-.142-.287-.228-.574-.371z" />
                    </svg>
                    Send Mandate via WhatsApp
                  </a>
                  <p className="text-[10px] text-slate-400">
                    This will open WhatsApp with your pre-filled inquiry.
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-center">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-mono text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    SYNCED TO CLOUD CLUSTER • WINDOW READY
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-10 md:p-12 space-y-8">
                
                {/* Brand Header & Title Block matching uploaded design image */}
                <div className="text-center space-y-4 max-w-2xl mx-auto pt-4">
                  {/* Dvarix Realty Centered Logo Lines */}
                  <div className="flex items-center justify-center gap-4 text-center">
                    <span className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-slate-300"></span>
                    <span className="text-xs sm:text-sm font-mono tracking-[0.3em] font-extrabold text-slate-500 uppercase">
                      DVARIX REALTY
                    </span>
                    <span className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-slate-300"></span>
                  </div>

                  {/* Find Your Perfect Property display text with Orange Accent replacement for the yellow color */}
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-none font-sans">
                    Find Your <span className="text-[#ff5a3c]">Perfect Property</span>
                  </h3>

                  {/* Subtitle description */}
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Tell us your requirements and our property experts will connect you with the best options that match your needs.
                  </p>
                </div>

                {/* Form Input Deck */}
                <form className="space-y-6 pt-4">
                  {/* Grid Layout of Fields (Columns mapped exactly to uploaded layout frame) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-6">
                    
                    {/* 1. Full Name */}
                    <div className="space-y-1.5" id="cr-field-fullName">
                      <label className="block text-xs font-bold text-slate-900 font-sans">
                        Full Name <span className="text-rose-500 font-mono">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (attemptedSubmit && e.target.value.trim()) {
                            setErrors(prev => ({ ...prev, fullName: '' }));
                          }
                        }}
                        placeholder="Enter your full name"
                        className={`w-full bg-white border text-slate-800 rounded-lg px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 font-sans shadow-sm ${
                          attemptedSubmit && errors.fullName
                            ? 'border-rose-500 ring-1 ring-rose-500/20'
                            : 'border-slate-200 hover:border-slate-300 focus:border-[#ff5a3c] focus:ring-1 focus:ring-[#ff5a3c]'
                        }`}
                      />
                      {attemptedSubmit && errors.fullName && (
                        <p className="text-rose-600 text-[11px] font-bold font-sans">⚠️ {errors.fullName}</p>
                      )}
                    </div>

                    {/* 2. Mobile Number */}
                    <div className="space-y-1.5" id="cr-field-mobileNumber">
                      <label className="block text-xs font-bold text-slate-900 font-sans">
                        Mobile Number <span className="text-rose-500 font-mono">*</span>
                      </label>
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
                        placeholder="Enter your mobile number"
                        className={`w-full bg-white border text-slate-800 rounded-lg px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 font-sans shadow-sm ${
                          attemptedSubmit && errors.mobileNumber
                            ? 'border-rose-500 ring-1 ring-rose-500/20'
                            : 'border-slate-200 hover:border-slate-300 focus:border-[#ff5a3c] focus:ring-1 focus:ring-[#ff5a3c]'
                        }`}
                      />
                      {attemptedSubmit && errors.mobileNumber && (
                        <p className="text-rose-600 text-[11px] font-bold font-sans">⚠️ {errors.mobileNumber}</p>
                      )}
                    </div>

                    {/* 3. Email Address */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-900 font-sans">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-[#ff5a3c] focus:ring-1 focus:ring-[#ff5a3c] text-slate-800 rounded-lg px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 font-sans shadow-sm"
                      />
                    </div>

                    {/* 4. Current City */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-900 font-sans">
                        Current City
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Enter your city"
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-[#ff5a3c] focus:ring-1 focus:ring-[#ff5a3c] text-slate-800 rounded-lg px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 font-sans shadow-sm"
                      />
                    </div>
                    {/* 5. Looking For */}
                    <div className="space-y-1.5" id="cr-field-lookingFor">
                      <label className="block text-xs font-bold text-slate-900 font-sans">
                        Looking For <span className="text-rose-500 font-mono">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={lookingFor}
                        onChange={(e) => {
                          setLookingFor(e.target.value);
                          if (attemptedSubmit && e.target.value.trim()) {
                            setErrors(prev => ({ ...prev, lookingFor: '' }));
                          }
                        }}
                        placeholder="e.g. Buy / Rent / Sell"
                        className={`w-full bg-white border text-slate-800 rounded-lg px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 font-sans shadow-sm ${
                          attemptedSubmit && errors.lookingFor
                            ? 'border-rose-500 ring-1 ring-rose-500/20'
                            : 'border-slate-200 hover:border-slate-300 focus:border-[#ff5a3c] focus:ring-1 focus:ring-[#ff5a3c]'
                        }`}
                        list="looking-for-options"
                      />
                      {attemptedSubmit && errors.lookingFor && (
                        <p className="text-rose-600 text-[11px] font-bold font-sans">⚠️ {errors.lookingFor}</p>
                      )}
                      <datalist id="looking-for-options">
                        <option value="Buy" />
                        <option value="Rent" />
                        <option value="Lease" />
                        <option value="Sell" />
                        <option value="Invest" />
                      </datalist>
                    </div>

                    {/* 6. Property Type */}
                    <div className="space-y-1.5" id="cr-field-propertyType">
                      <label className="block text-xs font-bold text-slate-900 font-sans">
                        Property Type <span className="text-rose-500 font-mono">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={propertyType}
                        onChange={(e) => {
                          setPropertyType(e.target.value);
                          if (attemptedSubmit && e.target.value.trim()) {
                            setErrors(prev => ({ ...prev, propertyType: '' }));
                          }
                        }}
                        placeholder="e.g. Plot, Villa, Apartment"
                        className={`w-full bg-white border text-slate-800 rounded-lg px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 font-sans shadow-sm ${
                          attemptedSubmit && errors.propertyType
                            ? 'border-rose-500 ring-1 ring-rose-500/20'
                            : 'border-slate-200 hover:border-slate-300 focus:border-[#ff5a3c] focus:ring-1 focus:ring-[#ff5a3c]'
                        }`}
                        list="property-type-options"
                      />
                      {attemptedSubmit && errors.propertyType && (
                        <p className="text-rose-600 text-[11px] font-bold font-sans">⚠️ {errors.propertyType}</p>
                      )}
                      <datalist id="property-type-options">
                        <option value="Plot" />
                        <option value="Villa" />
                        <option value="Apartment" />
                        <option value="Independent House" />
                        <option value="Commercial Space" />
                        <option value="Farm Land" />
                      </datalist>
                    </div>

                    {/* 7. Preferred Location */}
                    <div className="space-y-1.5" id="cr-field-preferredLocation">
                      <label className="block text-xs font-bold text-slate-900 font-sans">
                        Preferred Location <span className="text-rose-500 font-mono">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={preferredLocation}
                        onChange={(e) => {
                          setPreferredLocation(e.target.value);
                          if (attemptedSubmit && e.target.value.trim()) {
                            setErrors(prev => ({ ...prev, preferredLocation: '' }));
                          }
                        }}
                        placeholder="Enter preferred location"
                        className={`w-full bg-white border text-slate-800 rounded-lg px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 font-sans shadow-sm ${
                          attemptedSubmit && errors.preferredLocation
                            ? 'border-rose-500 ring-1 ring-rose-500/20'
                            : 'border-slate-200 hover:border-slate-300 focus:border-[#ff5a3c] focus:ring-1 focus:ring-[#ff5a3c]'
                        }`}
                      />
                      {attemptedSubmit && errors.preferredLocation && (
                        <p className="text-rose-600 text-[11px] font-bold font-sans">⚠️ {errors.preferredLocation}</p>
                      )}
                    </div>

                    {/* 8. Budget Range */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-900 font-sans">
                        Budget Range
                      </label>
                      <input
                        type="text"
                        value={budgetRange}
                        onChange={(e) => setBudgetRange(e.target.value)}
                        placeholder="e.g. 50 Lakhs - 1 Crore"
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-[#ff5a3c] focus:ring-1 focus:ring-[#ff5a3c] text-slate-800 rounded-lg px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 font-sans shadow-sm"
                      />
                    </div>

                    {/* ROW 3 */}
                    {/* 9. Area Requirement */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-900 font-sans">
                        Area Requirement
                      </label>
                      <input
                        type="text"
                        value={areaRequirement}
                        onChange={(e) => setAreaRequirement(e.target.value)}
                        placeholder="e.g. 1200 Sq.ft"
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-[#ff5a3c] focus:ring-1 focus:ring-[#ff5a3c] text-slate-800 rounded-lg px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 font-sans shadow-sm"
                      />
                    </div>

                    {/* 10. BHK Requirement */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-900 font-sans">
                        BHK Requirement
                      </label>
                      <input
                        type="text"
                        value={bhkRequirement}
                        onChange={(e) => setBhkRequirement(e.target.value)}
                        placeholder="e.g. 3 BHK"
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-[#ff5a3c] focus:ring-1 focus:ring-[#ff5a3c] text-slate-800 rounded-lg px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 font-sans shadow-sm"
                      />
                    </div>

                    {/* 11. When are you planning to buy? */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-900 font-sans">
                        When are you planning to buy?
                      </label>
                      <input
                        type="text"
                        value={planningTimeline}
                        onChange={(e) => setPlanningTimeline(e.target.value)}
                        placeholder="e.g. Within 3 Months"
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-[#ff5a3c] focus:ring-1 focus:ring-[#ff5a3c] text-slate-800 rounded-lg px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 font-sans shadow-sm"
                        list="timeline-options"
                      />
                      <datalist id="timeline-options">
                        <option value="Immediately" />
                        <option value="Within 1 Month" />
                        <option value="Within 3 Months" />
                        <option value="Just Exploring" />
                      </datalist>
                    </div>

                    {/* 12. Alternative Location */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-900 font-sans">
                        Alternative Location
                      </label>
                      <input
                        type="text"
                        value={alternativeLocation}
                        onChange={(e) => setAlternativeLocation(e.target.value)}
                        placeholder="Enter alternative location"
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-[#ff5a3c] focus:ring-1 focus:ring-[#ff5a3c] text-slate-800 rounded-lg px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 font-sans shadow-sm"
                      />
                    </div>

                  </div>

                  {/* Row 4 - Full Width Textarea */}
                  <div className="space-y-1.5 pt-2">
                    <label className="block text-xs font-bold text-slate-900 font-sans">
                      Tell us more about your dream property
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="e.g. Near metro, gated community, east facing plot, premium amenities, etc."
                      className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-[#ff5a3c] focus:ring-1 focus:ring-[#ff5a3c] text-slate-800 rounded-lg px-4 py-3 text-sm outline-none resize-none transition-all placeholder:text-slate-400 font-sans shadow-sm"
                    />
                  </div>

                  {/* Validation Error Alerts */}
                  {validationError && (
                    <div className="p-4 bg-orange-50/70 border-l-4 border-[#ff5a3c] rounded-xl flex items-start gap-3 text-left animate-pulse">
                      <span className="text-[#ff5a3c] font-black text-base">⚠️</span>
                      <div className="space-y-1">
                        <p className="text-xs font-extrabold text-slate-950 uppercase tracking-wider font-mono">Missing Required Field</p>
                        <p className="text-slate-700 text-xs font-sans font-medium">{validationError}</p>
                      </div>
                    </div>
                  )}

                  {/* Form Action Primary/Secondary Trigger Buttons matching layout */}
                  <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4">
                    
                    {/* Primary SUBMIT REQUIREMENT Button (Orange theme) */}
                    <button
                      type="button"
                      onClick={(e) => handleActionSubmit('Requirement', e)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 bg-[#ff5a3c] hover:bg-[#e04f32] text-white font-sans text-xs font-extrabold uppercase tracking-widest rounded-lg transition duration-150 shadow-md hover:shadow-lg active:scale-95 cursor-pointer text-center"
                    >
                      <Send className="h-4 w-4 transform -rotate-12" />
                      SUBMIT REQUIREMENT
                    </button>

                    {/* Secondary BOOK FREE SITE VISIT Button */}
                    <button
                      type="button"
                      onClick={handleSwitchToSiteVisit}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 bg-white border-2 border-[#ff5a3c] hover:bg-orange-50/20 text-[#ff5a3c] font-sans text-xs font-extrabold uppercase tracking-widest rounded-lg transition duration-150 active:scale-95 cursor-pointer text-center"
                    >
                      <Calendar className="h-4 w-4" />
                      BOOK FREE SITE VISIT
                    </button>

                  </div>

                  {/* Trust Footer line */}
                  <div className="pt-4 flex items-center justify-center gap-1.5 text-xs text-slate-450 font-sans">
                    <Lock className="h-3.5 w-3.5 text-slate-405" />
                    <span>Your information is safe and secure with us.</span>
                  </div>

                </form>

              </div>
            )}

          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
