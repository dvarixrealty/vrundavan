import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle2, User, Phone, Mail, MapPin, DollarSign, Building2, MessageSquare, FileText, Image } from 'lucide-react';
import { CampaignService, FreeServiceRequest } from '../../types';
import { firebaseService } from '../../lib/firebaseService';

interface CampaignRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CampaignService;
}

export default function CampaignRequestModal({ isOpen, onClose, campaign }: CampaignRequestModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    emailAddress: '',
    city: '',
    budget: '',
    propertyType: '',
    preferredLocation: '',
    message: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; base64: string; type: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const fields = campaign.formFields || {
    fullName: { enabled: true, required: true },
    mobileNumber: { enabled: true, required: true },
    emailAddress: { enabled: true, required: false },
    city: { enabled: false, required: false },
    budget: { enabled: false, required: false },
    propertyType: { enabled: false, required: false },
    preferredLocation: { enabled: false, required: false },
    message: { enabled: true, required: false },
    uploadDocuments: { enabled: false, required: false },
    uploadImages: { enabled: false, required: false }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setUploadedFiles(prev => [...prev, {
        name: file.name,
        base64: reader.result as string,
        type: file.type
      }]);
    };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const filesList = Array.from(e.dataTransfer.files) as File[];
      filesList.forEach(file => processFile(file));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const filesList = Array.from(e.target.files) as File[];
      filesList.forEach(file => processFile(file));
    }
  };

  const removeFile = (idx: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const requestId = `req-${Date.now()}`;
      const submittedDate = new Date().toISOString();

      // Extract uploaded documents vs images based on types
      const uploadedDocs = uploadedFiles
        .filter(f => !f.type.startsWith('image/'))
        .map(f => f.base64);
      const uploadedImgs = uploadedFiles
        .filter(f => f.type.startsWith('image/'))
        .map(f => f.base64);

      const requestPayload: FreeServiceRequest = {
        id: requestId,
        customerName: formData.fullName || 'Anonymous Visitor',
        phone: formData.mobileNumber || '',
        email: formData.emailAddress || '',
        requestedServiceId: campaign.id,
        requestedServiceName: campaign.title,
        submittedDate,
        assignedAdvisorId: '',
        assignedAdvisorName: 'Unassigned',
        status: 'New',
        ...(fields.city?.enabled && { city: formData.city }),
        ...(fields.budget?.enabled && { budget: formData.budget }),
        ...(fields.propertyType?.enabled && { propertyType: formData.propertyType }),
        ...(fields.preferredLocation?.enabled && { preferredLocation: formData.preferredLocation }),
        ...(fields.message?.enabled && { message: formData.message }),
        uploadedDocuments: uploadedDocs,
        uploadedImages: uploadedImgs
      };

      // Save Request to Firebase Firestore
      await firebaseService.saveFreeServiceRequest(requestPayload);

      // Increment campaign submission metric
      await firebaseService.incrementCampaignServiceSubmissions(campaign.id);

      setSubmitSuccess(true);
      setIsSubmitting(false);

      // Run After-Submission logic
      const postSubmit = campaign.afterSubmission || { action: 'Thank You Popup', value: '' };
      
      if (postSubmit.action !== 'Thank You Popup' && postSubmit.value) {
        setTimeout(() => {
          let url = postSubmit.value;
          if (postSubmit.action === 'Redirect to WhatsApp') {
            url = `https://wa.me/${postSubmit.value.replace(/[^0-9]/g, '')}?text=Hi%20Dvarix%20Realty,%20I%20have%20submitted%20my%20request%20for%20${encodeURIComponent(campaign.title)}`;
          } else if (postSubmit.action === 'Redirect to Contact Page') {
            url = '#contact';
          }
          
          if (url.startsWith('#')) {
            const el = document.querySelector(url);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            onClose();
          } else {
            window.open(url, '_blank', 'referrer');
            onClose();
          }
        }, 1500);
      }
    } catch (err) {
      console.error("Error submitting free service request:", err);
      setIsSubmitting(false);
      alert("Failed to submit request. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto font-sans" id="campaign-request-modal-overlay">
      <div className="relative bg-slate-950 border border-slate-900 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl" id="campaign-request-modal-container">
        
        {/* Ambient Top Bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-[#ff5a3c]" />

        {/* Header */}
        <div className="p-6 border-b border-slate-900/60 flex justify-between items-center bg-slate-950">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono font-black text-[#ff5a3c] tracking-widest bg-[#ff5a3c]/10 px-2.5 py-0.5 rounded border border-[#ff5a3c]/20">
              {campaign.badge || 'ENQUIRY'}
            </span>
            <h3 className="text-xl font-sans font-black text-white tracking-tight pt-1">
              {campaign.title}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-white transition-all"
            id="close-campaign-request-modal-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {submitSuccess ? (
            <div className="py-12 text-center space-y-4" id="campaign-submission-success-view">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                <CheckCircle2 className="h-10 w-10 animate-bounce" />
              </div>
              <h4 className="text-2xl font-sans font-black text-white tracking-tight">
                Request Submitted!
              </h4>
              <p className="text-sm text-slate-400 max-w-xs mx-auto font-light leading-relaxed">
                {campaign.afterSubmission?.action === 'Thank You Popup' && campaign.afterSubmission?.value
                  ? campaign.afterSubmission.value
                  : "Thank you for showing interest in our premium services. Our property advisor will connect with you shortly."}
              </p>
              {campaign.afterSubmission && campaign.afterSubmission.action !== 'Thank You Popup' && (
                <p className="text-xs text-slate-500 italic">
                  Redirecting you in a moment...
                </p>
              )}
              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-900 border border-slate-900 hover:border-slate-800 rounded-xl text-white text-sm font-semibold transition-all mt-4"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" id="campaign-request-form">
              {/* Fields Loop */}
              
              {fields.fullName?.enabled && (
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-[#ff5a3c]" />
                    Full Name {fields.fullName.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required={fields.fullName.required}
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-900 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff5a3c]/50 focus:ring-1 focus:ring-[#ff5a3c]/30 placeholder:text-slate-500 transition-all font-light"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.mobileNumber?.enabled && (
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-[#ff5a3c]" />
                      Mobile Number {fields.mobileNumber.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      required={fields.mobileNumber.required}
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-900 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff5a3c]/50 focus:ring-1 focus:ring-[#ff5a3c]/30 placeholder:text-slate-500 transition-all font-light"
                    />
                  </div>
                )}

                {fields.emailAddress?.enabled && (
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-[#ff5a3c]" />
                      Email Address {fields.emailAddress.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="email"
                      name="emailAddress"
                      required={fields.emailAddress.required}
                      value={formData.emailAddress}
                      onChange={handleInputChange}
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-900 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff5a3c]/50 focus:ring-1 focus:ring-[#ff5a3c]/30 placeholder:text-slate-500 transition-all font-light"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.city?.enabled && (
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#ff5a3c]" />
                      Current City {fields.city.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      name="city"
                      required={fields.city.required}
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Your city"
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-900 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff5a3c]/50 focus:ring-1 focus:ring-[#ff5a3c]/30 placeholder:text-slate-500 transition-all font-light"
                    />
                  </div>
                )}

                {fields.budget?.enabled && (
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-[#ff5a3c]" />
                      Expected Budget {fields.budget.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      name="budget"
                      required={fields.budget.required}
                      value={formData.budget}
                      onChange={handleInputChange}
                      placeholder="e.g. ₹ 1.5 Cr"
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-900 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff5a3c]/50 focus:ring-1 focus:ring-[#ff5a3c]/30 placeholder:text-slate-500 transition-all font-light"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.propertyType?.enabled && (
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-[#ff5a3c]" />
                      Property Type {fields.propertyType.required && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      name="propertyType"
                      required={fields.propertyType.required}
                      value={formData.propertyType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-900 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff5a3c]/50 focus:ring-1 focus:ring-[#ff5a3c]/30 transition-all font-light"
                    >
                      <option value="" className="bg-slate-950">Select Property Type</option>
                      <option value="Apartment" className="bg-slate-950">Apartment / Flat</option>
                      <option value="Villa" className="bg-slate-950">Premium Villa</option>
                      <option value="Penthouse" className="bg-slate-950">Penthouse</option>
                      <option value="Plot" className="bg-slate-950">Residential Plot</option>
                      <option value="Commercial" className="bg-slate-950">Commercial Space</option>
                    </select>
                  </div>
                )}

                {fields.preferredLocation?.enabled && (
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#ff5a3c]" />
                      Preferred Location {fields.preferredLocation.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      name="preferredLocation"
                      required={fields.preferredLocation.required}
                      value={formData.preferredLocation}
                      onChange={handleInputChange}
                      placeholder="e.g. Indiranagar, Whitefield"
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-900 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff5a3c]/50 focus:ring-1 focus:ring-[#ff5a3c]/30 placeholder:text-slate-500 transition-all font-light"
                    />
                  </div>
                )}
              </div>

              {fields.message?.enabled && (
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-[#ff5a3c]" />
                    Additional Message {fields.message.required && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    name="message"
                    required={fields.message.required}
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Tell us more about your preferences..."
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-900 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff5a3c]/50 focus:ring-1 focus:ring-[#ff5a3c]/30 placeholder:text-slate-500 transition-all font-light resize-none"
                  />
                </div>
              )}

              {/* Dynamic Drag-and-Drop File Upload */}
              {(fields.uploadDocuments?.enabled || fields.uploadImages?.enabled) && (
                <div className="space-y-2 text-left">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5 text-[#ff5a3c]" />
                    Attach Files / Documents
                    {fields.uploadDocuments?.required || fields.uploadImages?.required ? (
                      <span className="text-red-500">*</span>
                    ) : null}
                  </label>
                  
                  {/* Dropzone Container */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                      dragActive 
                        ? 'border-[#ff5a3c] bg-[#ff5a3c]/10' 
                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/30 hover:bg-slate-900/50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      accept={
                        fields.uploadDocuments?.enabled && fields.uploadImages?.enabled
                          ? '*/*'
                          : fields.uploadImages?.enabled
                          ? 'image/*'
                          : '.pdf,.doc,.docx,.xls,.xlsx,.txt'
                      }
                      className="hidden"
                    />
                    
                    <Upload className="h-8 w-8 text-slate-500 mx-auto mb-2 group-hover:scale-110 transition-all" />
                    <p className="text-xs font-medium text-slate-300">
                      Drag & drop your files here, or <span className="text-[#ff5a3c] underline">browse</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Supported: {fields.uploadDocuments?.enabled ? 'PDF, DOC, XLSX, ' : ''}{fields.uploadImages?.enabled ? 'PNG, JPG, JPEG' : ''} (max 5MB)
                    </p>
                  </div>

                  {/* Uploaded Files list */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-1.5 mt-3 max-h-32 overflow-y-auto">
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-900 rounded-lg border border-slate-900">
                          <div className="flex items-center gap-2 overflow-hidden pr-4">
                            {file.type.startsWith('image/') ? (
                              <Image className="h-4 w-4 text-emerald-500 shrink-0" />
                            ) : (
                              <FileText className="h-4 w-4 text-[#ff5a3c] shrink-0" />
                            )}
                            <span className="text-xs text-slate-300 truncate font-light">
                              {file.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(idx);
                            }}
                            className="p-1 rounded bg-slate-950 border border-slate-900 hover:border-slate-800 text-slate-500 hover:text-red-500 transition-all"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  ((fields.uploadDocuments?.required || fields.uploadImages?.required) && uploadedFiles.length === 0)
                }
                className="w-full py-3 bg-[#ff5a3c] text-white font-sans font-black text-sm uppercase tracking-widest rounded-xl hover:bg-[#ff5a3c]/95 hover:shadow-lg disabled:opacity-55 disabled:cursor-not-allowed transition-all duration-300"
                id="submit-campaign-request-btn"
              >
                {isSubmitting ? 'Sending Request...' : 'Submit Enquiry'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
