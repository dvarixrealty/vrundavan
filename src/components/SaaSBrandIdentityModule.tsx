import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, Image as ImageIcon, ShieldCheck, ArrowLeft, RefreshCw, 
  Save, Trash2, Check, AlertCircle, Globe, Mail, Phone, 
  Award, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { firebaseService } from '../lib/firebaseService';
import { BrandingSetting } from '../types';
import MediaPicker from './MediaPicker';

interface SaaSBrandIdentityModuleProps {
  loggedInUser?: {
    email: string;
    role: 'Admin Head' | 'Super Admin' | 'Manager' | 'Sales Agent' | string;
  };
  onBackToDashboard?: () => void;
}

export default function SaaSBrandIdentityModule({
  loggedInUser = { email: 'dvarixrealty@gmail.com', role: 'Super Admin' },
  onBackToDashboard
}: SaaSBrandIdentityModuleProps) {
  // Check user role: Only Admin Head can modify/access
  const isAdminHead = loggedInUser?.role === 'Admin Head' || 
                      loggedInUser?.email.trim().toLowerCase() === 'dvarixrealty@gmail.com';

  const [branding, setBranding] = useState<BrandingSetting>({
    id: "brand_identity",
    companyName: "Dvarix Realty",
    brandName: "Dvarix Realty",
    tagline: "Luxury Real Estate Advisory",
    logoUrl: "",
    faviconUrl: "",
    seoLogoUrl: "",
    ogImageUrl: "",
    bannerImageUrl: "",
    socialImageUrl: "",
    websiteUrl: "https://dvarixrealty.com",
    email: "dvarixrealty@gmail.com",
    phone: "+91 63009 84846",
    useLogoAsSeoLogo: true,
    updatedAt: new Date().toISOString(),
    updatedBy: loggedInUser?.email || "System",
    socialLinks: {
      facebook: "",
      instagram: "",
      linkedin: "",
      youtube: "",
      twitter: ""
    },
    contactDetails: {
      email: "dvarixrealty@gmail.com",
      phone: "+91 63009 84846",
      whatsapp: ""
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Upload state managers
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});

  // Input file references
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const seoLogoInputRef = useRef<HTMLInputElement>(null);
  const ogImageInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to branding settings
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = firebaseService.subscribeBrandingSettings(
      (data) => {
        if (data) {
          setBranding(data);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error("Failed to load branding:", err);
        setIsLoading(false);
        showFeedback('error', "Failed to load branding configurations from database.");
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Update favicon and Organization Schema dynamically on branding changes
  useEffect(() => {
    if (!branding) return;

    // 1. Update Favicon Link Tag
    if (branding.faviconUrl) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/png';
      link.rel = 'icon';
      link.href = branding.faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    // 2. Update Open Graph Meta Tags
    const updateMetaTag = (property: string, content: string, isName = false) => {
      const selector = isName ? `meta[name='${property}']` : `meta[property='${property}']`;
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement('meta');
        if (isName) {
          meta.setAttribute('name', property);
        } else {
          meta.setAttribute('property', property);
        }
        document.getElementsByTagName('head')[0].appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    if (branding.brandName || branding.companyName) {
      updateMetaTag('og:title', branding.brandName || branding.companyName);
      updateMetaTag('twitter:title', branding.brandName || branding.companyName, true);
    }
    if (branding.tagline) {
      updateMetaTag('og:description', branding.tagline);
      updateMetaTag('twitter:description', branding.tagline, true);
    }
    if (branding.socialImageUrl || branding.ogImageUrl || branding.logoUrl) {
      updateMetaTag('og:image', branding.socialImageUrl || branding.ogImageUrl || branding.logoUrl);
      updateMetaTag('twitter:image', branding.socialImageUrl || branding.ogImageUrl || branding.logoUrl, true);
    }
    updateMetaTag('twitter:card', 'summary_large_image', true);

    // 3. Update Organization Schema JSON-LD
    let schemaScript = document.getElementById('seo-organization-schema') as HTMLScriptElement;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'seo-organization-schema';
      schemaScript.type = 'application/ld+json';
      document.getElementsByTagName('head')[0].appendChild(schemaScript);
    }
    const logoUrl = (branding.useLogoAsSeoLogo ? (branding.logoUrl || "") : (branding.seoLogoUrl || branding.logoUrl || "")) || "https://dvarixrealty.com/images/logo.webp";
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": branding.brandName || branding.companyName || "Dvarix Realty",
      "url": branding.websiteUrl || window.location.origin,
      "logo": {
        "@type": "ImageObject",
        "url": logoUrl
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": branding.contactDetails?.phone || branding.phone || "",
        "contactType": "customer service",
        "email": branding.contactDetails?.email || branding.email || ""
      }
    };
    schemaScript.textContent = JSON.stringify(schemaData, null, 2);

  }, [branding]);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  const isValidUrl = (url: string) => {
    if (!url) return true; // allow empty optional fields
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Helper to handle files upload with storage upload or base64 fallback
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon' | 'seoLogo' | 'ogImage') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    uploadFile(files[0], type);
  };

  const uploadFile = async (file: File, type: 'logo' | 'favicon' | 'seoLogo' | 'ogImage') => {
    if (!isAdminHead) {
      showFeedback('error', "Permission Denied: Only Admin Head can modify branding assets.");
      return;
    }

    // Validation: Maximum file size 2MB
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      showFeedback('error', `File is too large! Maximum limit is 2MB. (Selected: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      return;
    }

    // Validation: File types
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions: Record<string, string[]> = {
      logo: ['png', 'svg', 'jpg', 'jpeg', 'webp'],
      favicon: ['ico', 'png', 'gif', 'svg'],
      seoLogo: ['png', 'svg', 'jpg', 'jpeg', 'webp'],
      ogImage: ['png', 'jpg', 'jpeg', 'webp']
    };

    if (!fileExtension || !allowedExtensions[type].includes(fileExtension)) {
      showFeedback('error', `Invalid file format! Allowed: ${allowedExtensions[type].join(', ').toUpperCase()}`);
      return;
    }

    setIsUploading(prev => ({ ...prev, [type]: true }));
    setUploadProgress(prev => ({ ...prev, [type]: 0 }));

    // Target fields map
    const fieldMap: Record<string, keyof BrandingSetting> = {
      logo: 'logoUrl',
      favicon: 'faviconUrl',
      seoLogo: 'seoLogoUrl',
      ogImage: 'ogImageUrl'
    };

    try {
      const filename = `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExtension}`;
      const storageRef = ref(storage, `branding/${filename}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(prev => ({ ...prev, [type]: progress }));
        },
        async (error) => {
          console.warn("Storage upload failed, falling back to secure Base64 data encoding:", error);
          const reader = new FileReader();
          reader.onloadstart = () => {
            setUploadProgress(prev => ({ ...prev, [type]: 10 }));
          };
          reader.onprogress = (progressEvent) => {
            if (progressEvent.lengthComputable) {
              const pct = Math.round((progressEvent.loaded / progressEvent.total) * 100);
              setUploadProgress(prev => ({ ...prev, [type]: pct }));
            }
          };
          reader.onload = async () => {
            const base64String = reader.result as string;
            setBranding(prev => ({
              ...prev,
              [fieldMap[type]]: base64String,
              ...(type === 'ogImage' ? { socialImageUrl: base64String } : {})
            }));
            setIsUploading(prev => ({ ...prev, [type]: false }));
            setUploadProgress(prev => ({ ...prev, [type]: 100 }));
            showFeedback('success', `Logo converted and ready to save. Click "Save Changes" to submit.`);
          };
          reader.readAsDataURL(file);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setBranding(prev => ({
            ...prev,
            [fieldMap[type]]: downloadUrl,
            ...(type === 'ogImage' ? { socialImageUrl: downloadUrl } : {})
          }));
          setIsUploading(prev => ({ ...prev, [type]: false }));
          setUploadProgress(prev => ({ ...prev, [type]: 100 }));
          showFeedback('success', `Asset uploaded successfully to database cloud storage.`);
        }
      );
    } catch (err: any) {
      console.error("Storage upload exception:", err);
      setIsUploading(prev => ({ ...prev, [type]: false }));
      showFeedback('error', `Asset loading failed: ${err.message || err}`);
    }
  };

  const handleDeleteAsset = (type: 'logo' | 'favicon' | 'seoLogo' | 'ogImage') => {
    if (!isAdminHead) {
      showFeedback('error', "Permission Denied: Only Admin Head can modify branding configurations.");
      return;
    }

    const fieldMap: Record<string, keyof BrandingSetting> = {
      logo: 'logoUrl',
      favicon: 'faviconUrl',
      seoLogo: 'seoLogoUrl',
      ogImage: 'ogImageUrl'
    };

    setBranding(prev => ({
      ...prev,
      [fieldMap[type]]: '',
      ...(type === 'ogImage' ? { socialImageUrl: '' } : {})
    }));

    showFeedback('success', `Removed ${type} preview. Save configuration to apply changes.`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, type: 'logo' | 'favicon' | 'seoLogo' | 'ogImage') => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFile(files[0], type);
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminHead) {
      showFeedback('error', "Permission Denied: Only Admin Head can save brand identity settings.");
      return;
    }

    // Validate URLs
    const urlsToValidate = [
      { label: 'Logo Image URL', val: branding.logoUrl },
      { label: 'Favicon URL', val: branding.faviconUrl },
      { label: 'Brand Banner URL', val: branding.bannerImageUrl },
      { label: 'Default Social Share Image URL', val: branding.socialImageUrl || branding.ogImageUrl },
      { label: 'Main Website URL', val: branding.websiteUrl },
      { label: 'Facebook URL', val: branding.socialLinks?.facebook },
      { label: 'Instagram URL', val: branding.socialLinks?.instagram },
      { label: 'LinkedIn URL', val: branding.socialLinks?.linkedin },
      { label: 'YouTube URL', val: branding.socialLinks?.youtube },
      { label: 'X/Twitter URL', val: branding.socialLinks?.twitter },
      { label: 'WhatsApp URL', val: branding.contactDetails?.whatsapp }
    ];

    for (const item of urlsToValidate) {
      if (item.val && !isValidUrl(item.val)) {
        showFeedback('error', `Invalid URL format for "${item.label}". Please enter a valid URL (e.g., https://example.com).`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const finalPayload: BrandingSetting = {
        ...branding,
        updatedAt: new Date().toISOString(),
        updatedBy: loggedInUser?.email || "Admin Head"
      };

      await firebaseService.saveBrandingSettings(finalPayload);
      setBranding(finalPayload);
      setIsSaving(false);
      showFeedback('success', "Brand identity updated successfully");
    } catch (err: any) {
      console.error("Failed to save branding:", err);
      setIsSaving(false);
      showFeedback('error', `Failed to save: ${err?.message || err}`);
    }
  };

  // Full Security Access Guard
  if (!isAdminHead) {
    return (
      <div className="bg-[#0F1115]/95 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-200">Access Denied</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Only the <strong>Admin Head</strong> has access to modify, update, and manage the corporate brand identity configurations.
        </p>
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            type="button"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition cursor-pointer"
          >
            Return to Dashboard
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left text-xs animate-in fade-in duration-200" id="saas-branding-portal">
      {/* HEADER BAR */}
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {onBackToDashboard && (
              <button 
                onClick={onBackToDashboard}
                type="button"
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition"
                title="Back to CRM"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-xl font-bold font-sans text-slate-200 tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-[#C89B3C]" /> Brand Identity Manager
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-sans ml-8">
            Define corporate logos, brand banners, search web icons, and social media graph handles loaded automatically across systems.
          </p>
        </div>

        {/* SECURITY STATUS */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-mono text-[10px] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> AUTHORIZED ADMIN ACCESS
          </span>
        </div>
      </div>

      {/* NOTIFICATION FEEDBACK */}
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3.5 rounded-xl border flex items-center gap-2.5 shadow-lg ${
              feedback.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            {feedback.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span className="font-medium font-sans text-xs">{feedback.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="bg-[#0F1115]/90 border border-slate-800/80 rounded-2xl p-24 flex flex-col items-center justify-center text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#C89B3C] mb-4" />
          <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Retrieving branding configurations...</p>
        </div>
      ) : (
        <form onSubmit={handleSaveAll} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SIDE: CONFIGURATION CARDS (Col span 7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. COMPANY LOGO */}
            <div className="bg-[#0F1115]/95 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-200 tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-[#C89B3C] rounded-full"></span> 1. Company Logo Asset
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">logoUrl</span>
              </div>

              <MediaPicker
                label="Company Logo"
                value={branding.logoUrl || ""}
                onChange={(url) => setBranding(prev => ({ ...prev, logoUrl: url }))}
                folder="logos"
                category="Logos"
              />
            </div>

            {/* 2. WEBSITE FAVICON */}
            <div className="bg-[#0F1115]/95 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-200 tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-[#C89B3C] rounded-full"></span> 2. Browser Tab Favicon
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">faviconUrl</span>
              </div>

              <MediaPicker
                label="Browser Tab Favicon"
                value={branding.faviconUrl || ""}
                onChange={(url) => setBranding(prev => ({ ...prev, faviconUrl: url }))}
                folder="logos"
                category="Logos"
              />
            </div>

            {/* 3. BRAND IMAGES & GRAPHICS */}
            <div className="bg-[#0F1115]/95 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-200 tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-[#C89B3C] rounded-full"></span> 3. Brand Images & Social Graphics
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">bannerImageUrl / socialImageUrl</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Brand Banner URL */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Brand Banner URL</label>
                  <input 
                    type="url"
                    value={branding.bannerImageUrl || ''}
                    onChange={(e) => setBranding(prev => ({ ...prev, bannerImageUrl: e.target.value }))}
                    placeholder="https://example.com/banner.jpg"
                    className="w-full bg-[#161920] border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 transition text-xs font-semibold"
                  />
                </div>

                {/* Default Social Share Image URL */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Default Social Share Image URL</label>
                  <input 
                    type="url"
                    value={branding.socialImageUrl || branding.ogImageUrl || ''}
                    onChange={(e) => setBranding(prev => ({ ...prev, socialImageUrl: e.target.value, ogImageUrl: e.target.value }))}
                    placeholder="https://example.com/social-share.jpg"
                    className="w-full bg-[#161920] border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 transition text-xs font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* 4. SOCIAL MARKETING SCHEMA / GRAPH OPTIONS */}
            <div className="bg-[#0F1115]/95 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-200 tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-[#C89B3C] rounded-full"></span> 4. SEO Schema Logo Asset
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">seoLogoUrl</span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-900/50 border border-slate-800 rounded-xl">
                <div>
                  <h4 className="font-bold text-slate-300">Use Company Logo as SEO Logo</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Automatically link your master company logo to search schemas.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={branding.useLogoAsSeoLogo}
                    onChange={(e) => setBranding(prev => ({ ...prev, useLogoAsSeoLogo: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-slate-950"></div>
                </label>
              </div>

              {!branding.useLogoAsSeoLogo && (
                <div className="pt-2">
                  <MediaPicker
                    label="SEO Schema Logo"
                    value={branding.seoLogoUrl || ""}
                    onChange={(url) => setBranding(prev => ({ ...prev, seoLogoUrl: url }))}
                    folder="logos"
                    category="Logos"
                  />
                </div>
              )}
            </div>

            {/* 5. BRAND CORPORATE & SOCIAL INFORMATION */}
            <div className="bg-[#0F1115]/95 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-200 tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-[#C89B3C] rounded-full"></span> 5. Corporate Brand & Social Profiles
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Metadata schemas</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Brand Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Brand Name</label>
                  <input 
                    type="text" 
                    required
                    value={branding.brandName || branding.companyName || ''}
                    onChange={(e) => setBranding(prev => ({ ...prev, brandName: e.target.value, companyName: e.target.value }))}
                    placeholder="Dvarix Realty"
                    className="w-full bg-[#161920] border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 transition text-xs font-semibold"
                  />
                </div>

                {/* Tagline */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Corporate Tagline</label>
                  <input 
                    type="text" 
                    required
                    value={branding.tagline}
                    onChange={(e) => setBranding(prev => ({ ...prev, tagline: e.target.value }))}
                    placeholder="Boutique Real Estate Advisories"
                    className="w-full bg-[#161920] border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 transition text-xs font-semibold"
                  />
                </div>

                {/* Main Website URL */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Main Website URL</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
                    <input 
                      type="url" 
                      required
                      value={branding.websiteUrl}
                      onChange={(e) => setBranding(prev => ({ ...prev, websiteUrl: e.target.value }))}
                      placeholder="https://dvarixrealty.com"
                      className="w-full bg-[#161920] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 transition text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* WhatsApp URL */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">WhatsApp URL</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
                    <input 
                      type="url" 
                      value={branding.contactDetails?.whatsapp || ''}
                      onChange={(e) => setBranding(prev => ({ 
                        ...prev, 
                        contactDetails: { 
                          ...(prev.contactDetails || { email: '', phone: '' }), 
                          whatsapp: e.target.value 
                        } 
                      }))}
                      placeholder="https://wa.me/916300984846"
                      className="w-full bg-[#161920] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 transition text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Business Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Business Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
                    <input 
                      type="email" 
                      required
                      value={branding.contactDetails?.email || branding.email || ''}
                      onChange={(e) => setBranding(prev => ({ 
                        ...prev, 
                        email: e.target.value,
                        contactDetails: { 
                          ...(prev.contactDetails || { phone: '', whatsapp: '' }), 
                          email: e.target.value 
                        } 
                      }))}
                      placeholder="advisory@dvarixrealty.com"
                      className="w-full bg-[#161920] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 transition text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Contact Number */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official Contact Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
                    <input 
                      type="text" 
                      required
                      value={branding.contactDetails?.phone || branding.phone || ''}
                      onChange={(e) => setBranding(prev => ({ 
                        ...prev, 
                        phone: e.target.value,
                        contactDetails: { 
                          ...(prev.contactDetails || { email: '', whatsapp: '' }), 
                          phone: e.target.value 
                        } 
                      }))}
                      placeholder="+91 63009 84846"
                      className="w-full bg-[#161920] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 transition text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* SOCIAL MEDIA SECTION */}
              <div className="border-t border-slate-800 pt-4 space-y-4">
                <h4 className="text-[11px] font-bold text-[#C89B3C] uppercase tracking-wider">Social Media Handles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Facebook */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Facebook URL</label>
                    <input 
                      type="url"
                      value={branding.socialLinks?.facebook || ''}
                      onChange={(e) => setBranding(prev => ({ 
                        ...prev, 
                        socialLinks: { 
                          ...(prev.socialLinks || { instagram: '', linkedin: '', youtube: '', twitter: '' }), 
                          facebook: e.target.value 
                        } 
                      }))}
                      placeholder="https://facebook.com/dvarix"
                      className="w-full bg-[#161920] border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 transition text-xs font-semibold"
                    />
                  </div>

                  {/* Instagram */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Instagram URL</label>
                    <input 
                      type="url"
                      value={branding.socialLinks?.instagram || ''}
                      onChange={(e) => setBranding(prev => ({ 
                        ...prev, 
                        socialLinks: { 
                          ...(prev.socialLinks || { facebook: '', linkedin: '', youtube: '', twitter: '' }), 
                          instagram: e.target.value 
                        } 
                      }))}
                      placeholder="https://instagram.com/dvarix"
                      className="w-full bg-[#161920] border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 transition text-xs font-semibold"
                    />
                  </div>

                  {/* LinkedIn */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">LinkedIn URL</label>
                    <input 
                      type="url"
                      value={branding.socialLinks?.linkedin || ''}
                      onChange={(e) => setBranding(prev => ({ 
                        ...prev, 
                        socialLinks: { 
                          ...(prev.socialLinks || { facebook: '', instagram: '', youtube: '', twitter: '' }), 
                          linkedin: e.target.value 
                        } 
                      }))}
                      placeholder="https://linkedin.com/company/dvarix"
                      className="w-full bg-[#161920] border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 transition text-xs font-semibold"
                    />
                  </div>

                  {/* YouTube */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">YouTube URL</label>
                    <input 
                      type="url"
                      value={branding.socialLinks?.youtube || ''}
                      onChange={(e) => setBranding(prev => ({ 
                        ...prev, 
                        socialLinks: { 
                          ...(prev.socialLinks || { facebook: '', instagram: '', linkedin: '', twitter: '' }), 
                          youtube: e.target.value 
                        } 
                      }))}
                      placeholder="https://youtube.com/c/dvarix"
                      className="w-full bg-[#161920] border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 transition text-xs font-semibold"
                    />
                  </div>

                  {/* Twitter / X */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">X/Twitter URL</label>
                    <input 
                      type="url"
                      value={branding.socialLinks?.twitter || ''}
                      onChange={(e) => setBranding(prev => ({ 
                        ...prev, 
                        socialLinks: { 
                          ...(prev.socialLinks || { facebook: '', instagram: '', linkedin: '', youtube: '' }), 
                          twitter: e.target.value 
                        } 
                      }))}
                      placeholder="https://twitter.com/dvarix"
                      className="w-full bg-[#161920] border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 transition text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SAVE CHANGES BUTTON */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-gradient-to-r from-[#C89B3C] to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold font-sans rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:shadow-amber-500/10 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Changes
                  </>
                )}
              </button>
            </div>

          </div>

          {/* RIGHT SIDE: LIVE BRAND PREVIEWS (Col span 5) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
            
            {/* LIVE PREVIEW WRAPPER */}
            <div className="bg-[#0F1115]/95 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-200 tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-[#C89B3C] rounded-full"></span> 6. Live Digital Brand Preview
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Dynamic mock previews</span>
              </div>

              {/* LIVE BRAND ELEMENT PREVIEWS */}
              <div className="space-y-6">

                {/* PREVIEW A: WEBSITE HEADER LOGO PREVIEW */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>A. Website Header Logo Preview</span>
                    <span className="text-emerald-400">Live Active</span>
                  </div>
                  <div className="bg-[#0a192f] border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {branding.logoUrl ? (
                        <div className="flex items-center space-x-2.5">
                          <img 
                            src={branding.logoUrl} 
                            alt={branding.brandName || branding.companyName} 
                            className="h-7 object-contain max-w-[140px]"
                            referrerPolicy="no-referrer"
                          />
                          <span className="font-sans font-black tracking-widest text-white text-xs uppercase">
                            {branding.brandName || branding.companyName || "DVARIX REALTY"}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-[#C89B3C] flex items-center justify-center font-bold font-sans text-slate-950 text-xs">
                            D
                          </div>
                          <span className="font-sans font-black tracking-widest text-white text-xs uppercase">
                            DV<span className="text-rose-500">Λ</span>RIX REALTY
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Fake Header Nav */}
                    <div className="flex items-center gap-2.5 text-[10px] text-slate-400 font-medium">
                      <span className="text-amber-500 border-b border-amber-500/80">Home</span>
                      <span>Listings</span>
                      <span>About</span>
                    </div>
                  </div>
                </div>

                {/* PREVIEW B: BROWSER TAB WITH FAVICON */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">B. Browser Tab Preview</span>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
                    <div className="bg-[#1A1F2B] border-b border-slate-800/60 px-3 py-2 flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/40"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/40"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40"></span>
                      </div>
                      <div className="bg-[#111622] rounded-t-lg px-3.5 py-1 flex items-center gap-2 text-slate-300 text-[10px] border-t border-x border-slate-800">
                        {branding.faviconUrl ? (
                          <img 
                            src={branding.faviconUrl} 
                            alt="Fav" 
                            className="w-3.5 h-3.5 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Globe className="w-3.5 h-3.5 text-[#C89B3C]" />
                        )}
                        <span className="truncate max-w-[120px] font-semibold">{branding.brandName || branding.companyName || "Dvarix Realty"} | {branding.tagline || "Real Estate"}</span>
                      </div>
                    </div>
                    <div className="bg-[#111622] p-2 text-[10px] text-slate-500 font-mono truncate px-4">
                      {branding.websiteUrl || "https://dvarixrealty.com"}
                    </div>
                  </div>
                </div>

                {/* PREVIEW C: GOOGLE SERPS SEARCH ENGINE CARD */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">C. Google Search Result Preview</span>
                  <div className="bg-white text-slate-900 p-4 rounded-xl border border-slate-200 shadow-md font-sans text-left space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                        {branding.faviconUrl ? (
                          <img 
                            src={branding.faviconUrl} 
                            alt="Favicon" 
                            className="w-4 h-4 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Globe className="w-3.5 h-3.5 text-[#C89B3C]" />
                        )}
                      </div>
                      <div className="flex flex-col text-[10px] leading-tight">
                        <span className="font-semibold text-slate-800">{branding.brandName || branding.companyName || "Dvarix Realty"}</span>
                        <span className="text-slate-500 truncate max-w-[200px]">{branding.websiteUrl || "https://dvarixrealty.com"}</span>
                      </div>
                    </div>
                    <h4 className="text-[13px] text-[#1a0dab] hover:underline font-medium cursor-pointer leading-tight">
                      {branding.brandName || branding.companyName || "Dvarix Realty"} | {branding.tagline || "Premium Bangalore Listings"}
                    </h4>
                    <p className="text-[11px] text-[#4d5156] leading-relaxed font-normal">
                      Explore elite commercial and luxury residential properties by <strong className="text-[#111]">{branding.brandName || branding.companyName}</strong>. Standardized Bangalore advisory solutions configured in {branding.tagline}.
                    </p>
                  </div>
                </div>

                {/* PREVIEW D: SOCIAL MEDIA SHARE PREVIEW */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">D. Social Media Card Preview (Facebook/Twitter)</span>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col font-sans">
                    <div className="h-44 bg-slate-950 flex items-center justify-center border-b border-slate-800 relative group overflow-hidden">
                      {branding.socialImageUrl || branding.ogImageUrl ? (
                        <img 
                          src={branding.socialImageUrl || branding.ogImageUrl} 
                          alt="OG Preview" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : branding.logoUrl ? (
                        <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                          <img 
                            src={branding.logoUrl} 
                            alt="Logo" 
                            className="max-h-24 max-w-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                          <p className="text-[9px] text-slate-500 font-mono">Company Logo fallback used as Social Share image</p>
                        </div>
                      ) : (
                        <div className="text-center text-slate-600 space-y-1">
                          <ImageIcon className="w-10 h-10 mx-auto opacity-30" />
                          <p className="text-[10px] font-mono uppercase">Missing Open Graph sharing Image</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-[#11141C] text-left space-y-1">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none block">
                        {branding.websiteUrl ? branding.websiteUrl.replace(/https?:\/\//, '').toUpperCase() : "DVARIXREALTY.COM"}
                      </span>
                      <h5 className="text-[11.5px] font-bold text-slate-200 line-clamp-1 leading-snug">
                        {branding.brandName || branding.companyName || "Dvarix Realty"}
                      </h5>
                      <p className="text-[10px] text-slate-400 font-light line-clamp-2 leading-relaxed">
                        {branding.tagline || "Elite real estate advisor for Bangalore holdings."} - Contact us at {branding.contactDetails?.email || branding.email} or call {branding.contactDetails?.phone || branding.phone} for legal advisory consultations.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* QUICK HELP */}
            <div className="bg-[#0F1115]/95 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2.5">
              <h4 className="font-semibold text-slate-300 flex items-center gap-1.5 text-xs">
                <HelpCircle className="w-4 h-4 text-[#C89B3C]" /> Auto Integration Summary
              </h4>
              <p className="text-slate-400 leading-relaxed text-[10.5px]">
                Upon updating branding settings, Dvarix Real Estate ERP auto-deploys assets across:
              </p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] font-mono text-slate-400">
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-amber-500 rounded-full"></span> Web Header / Footer
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-amber-500 rounded-full"></span> ERP Login Screen
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-amber-500 rounded-full"></span> App Loading Screens
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-amber-500 rounded-full"></span> Tab Header Favicon
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-amber-500 rounded-full"></span> Social Graph Metas
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-amber-500 rounded-full"></span> Google JSON Schema
                </li>
              </ul>
            </div>

          </div>

        </form>
      )}

    </div>
  );
}
