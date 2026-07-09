import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Info, 
  Globe, 
  Compass, 
  Search, 
  UserCheck, 
  Image, 
  ExternalLink, 
  AlertTriangle, 
  Lock, 
  RefreshCw, 
  Scale, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronRight, 
  Home 
} from 'lucide-react';
import { ActiveTab } from '../types';

interface TermsConditionsViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export default function TermsConditionsView({ setActiveTab }: TermsConditionsViewProps) {
  // Smooth scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms', icon: <Scale className="w-4 h-4" /> },
    { id: 'about-us', title: '2. About Dvarix Realty', icon: <Info className="w-4 h-4" /> },
    { id: 'website-usage', title: '3. Website Usage', icon: <Compass className="w-4 h-4" /> },
    { id: 'property-info', title: '4. Property Information', icon: <Search className="w-4 h-4" /> },
    { id: 'property-inquiries', title: '5. Property Inquiries', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'intellectual-property', title: '6. Intellectual Property', icon: <Image className="w-4 h-4" /> },
    { id: 'third-party', title: '7. Third-Party Services', icon: <ExternalLink className="w-4 h-4" /> },
    { id: 'liability', title: '8. Limitation of Liability', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'privacy', title: '9. Privacy', icon: <Lock className="w-4 h-4" /> },
    { id: 'modifications', title: '10. Modifications', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'governing-law', title: '11. Governing Law', icon: <Globe className="w-4 h-4" /> },
    { id: 'contact', title: '12. Contact Information', icon: <Mail className="w-4 h-4" /> }
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // 80px header height + 20px extra breathing space
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div id="terms-conditions-view" className="bg-white min-h-screen font-sans text-slate-800 selection:bg-[#D4AF37]/20 selection:text-slate-900">
      
      {/* Premium Breadcrumb bar */}
      <div className="border-b border-slate-100 bg-slate-50/50 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center space-x-2.5 text-xs text-slate-500 font-medium">
          <button 
            onClick={() => setActiveTab('Home')}
            className="flex items-center gap-1 hover:text-[#D4AF37] transition-colors duration-200 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-800 font-semibold">Terms & Conditions</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white pt-20 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
          <div className="absolute top-[-10%] right-[10%] w-[400px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[10%] left-[5%] w-[350px] h-[350px] bg-amber-500/3 rounded-full blur-[90px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center p-3.5 bg-white rounded-2xl shadow-md border border-slate-100/80 mb-6 text-[#D4AF37]"
          >
            <FileText className="w-10 h-10 stroke-[1.5]" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-sans font-bold text-slate-900 tracking-tight leading-tight"
          >
            Terms & Conditions
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto font-light"
          >
            Please read these Terms & Conditions carefully before using the Dvarix Realty website and services.
          </motion.p>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Table of Contents - Left sticky rail on Desktop */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-28 bg-slate-50/70 border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
              Document sections
            </h3>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-[13px] text-slate-600 hover:text-[#D4AF37] hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-sm font-medium transition-all duration-200 cursor-pointer group"
                >
                  <span className="text-slate-400 group-hover:text-[#D4AF37] transition-colors duration-200">
                    {section.icon}
                  </span>
                  <span>{section.title.substring(3)}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Terms & Conditions Documents - Right structured flow */}
          <main className="col-span-12 lg:col-span-8 space-y-8 text-left">
            
            {/* 1. Acceptance of Terms */}
            <section id="acceptance" className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-50">
                <div className="p-2 bg-amber-50/50 rounded-lg text-[#D4AF37]">
                  <Scale className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">1. Acceptance of Terms</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-light">
                By accessing or using the Dvarix Realty website, you agree to comply with these Terms & Conditions. If you do not agree, please discontinue use of the website.
              </p>
            </section>

            {/* 2. About Dvarix Realty */}
            <section id="about-us" className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-50">
                <div className="p-2 bg-amber-50/50 rounded-lg text-[#D4AF37]">
                  <Info className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">2. About Dvarix Realty</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-light">
                Dvarix Realty is a real estate platform that helps customers discover residential, commercial, luxury, rental, and investment properties while providing property-related guidance and support.
              </p>
            </section>

            {/* 3. Website Usage */}
            <section id="website-usage" className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-50">
                <div className="p-2 bg-amber-50/50 rounded-lg text-[#D4AF37]">
                  <Compass className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">3. Website Usage</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-light mb-4">
                Users agree to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-sm">
                {[
                  'Use the website lawfully.',
                  'Provide accurate information in inquiry forms.',
                  'Not misuse, damage, hack, or interfere with website functionality.',
                  'Not copy, reproduce, or distribute website content without written permission.'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-slate-600">
                    <span className="text-[#D4AF37] text-lg leading-none select-none mt-0.5">•</span>
                    <span className="font-light">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Property Information */}
            <section id="property-info" className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-50">
                <div className="p-2 bg-amber-50/50 rounded-lg text-[#D4AF37]">
                  <Search className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">4. Property Information</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-light mb-4">
                Important details regarding property listings on our platform:
              </p>
              <div className="space-y-3.5 text-sm">
                {[
                  'Property details, prices, availability, specifications, and images are provided for general information only.',
                  'Information may change without prior notice.',
                  'Dvarix Realty does not guarantee that every listing will remain available.',
                  'Buyers should independently verify all property details before making any purchase decision.'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-slate-600">
                    <span className="text-[#D4AF37] text-lg leading-none select-none mt-0.5">•</span>
                    <span className="font-light">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. Property Inquiries */}
            <section id="property-inquiries" className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-50">
                <div className="p-2 bg-amber-50/50 rounded-lg text-[#D4AF37]">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">5. Property Inquiries</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-light">
                By submitting an inquiry, users consent to being contacted by Dvarix Realty through phone calls, WhatsApp, SMS, or email regarding their property requirements.
              </p>
            </section>

            {/* 6. Intellectual Property */}
            <section id="intellectual-property" className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-50">
                <div className="p-2 bg-amber-50/50 rounded-lg text-[#D4AF37]">
                  <Image className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">6. Intellectual Property</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-light mb-4">
                All website content is the intellectual property of Dvarix Realty unless otherwise stated:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs font-semibold text-slate-700 uppercase tracking-wider text-center">
                {['Logo', 'Branding', 'Images', 'Graphics', 'Icons', 'Text', 'Design', 'Layout'].map((asset) => (
                  <div key={asset} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    {asset}
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs font-light">
                Unauthorized use, reproduction, or distribution is strictly prohibited.
              </p>
            </section>

            {/* 7. Third-Party Services */}
            <section id="third-party" className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-50">
                <div className="p-2 bg-amber-50/50 rounded-lg text-[#D4AF37]">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">7. Third-Party Services</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-light mb-4">
                The website may contain links or integrations with third-party services such as:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 text-sm font-medium text-slate-600">
                {['Google Maps', 'WhatsApp', 'Banks', 'Social Media', 'Home Loan Providers'].map((svc) => (
                  <div key={svc} className="flex items-center gap-2 p-2 bg-amber-50/10 border border-amber-100/30 rounded-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                    <span>{svc}</span>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs font-light">
                Dvarix Realty is not responsible for the availability, content, policies, or actions of third-party websites or services.
              </p>
            </section>

            {/* 8. Limitation of Liability */}
            <section id="liability" className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-50">
                <div className="p-2 bg-amber-50/50 rounded-lg text-[#D4AF37]">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">8. Limitation of Liability</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-light mb-4">
                Dvarix Realty shall not be liable for:
              </p>
              <div className="space-y-3.5 text-sm mb-4">
                {[
                  'Any direct or indirect losses.',
                  'Property transaction decisions.',
                  'Website interruptions.',
                  'Technical issues.',
                  'Errors or omissions in property listings.'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-slate-600">
                    <span className="text-[#D4AF37] text-lg leading-none select-none mt-0.5">•</span>
                    <span className="font-light">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-slate-700 text-xs leading-relaxed font-medium">
                  Users should perform their own due diligence before entering into any transaction.
                </p>
              </div>
            </section>

            {/* 9. Privacy */}
            <section id="privacy" className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-50">
                <div className="p-2 bg-amber-50/50 rounded-lg text-[#D4AF37]">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">9. Privacy</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-light">
                Use of this website is also governed by our <button onClick={() => setActiveTab('PrivacyPolicy')} className="text-[#D4AF37] hover:underline font-medium cursor-pointer">Privacy Policy</button>.
              </p>
            </section>

            {/* 10. Modifications */}
            <section id="modifications" className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-50">
                <div className="p-2 bg-amber-50/50 rounded-lg text-[#D4AF37]">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">10. Modifications</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-light">
                Dvarix Realty reserves the right to update these Terms & Conditions at any time without prior notice.
              </p>
            </section>

            {/* 11. Governing Law */}
            <section id="governing-law" className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-50">
                <div className="p-2 bg-amber-50/50 rounded-lg text-[#D4AF37]">
                  <Globe className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">11. Governing Law</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-light">
                These Terms & Conditions shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of the competent courts in Bengaluru, Karnataka.
              </p>
            </section>

            {/* 12. Contact Information */}
            <section id="contact" className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-50">
                <div className="p-2 bg-amber-50/50 rounded-lg text-[#D4AF37]">
                  <Mail className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">12. Contact Information</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-light mb-6">
                For any queries regarding these Terms & Conditions, please reach out to us at:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3.5 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="p-2 bg-white rounded-lg text-[#D4AF37] shadow-sm">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Company</h4>
                    <p className="text-sm font-semibold text-slate-800">Dvarix Realty</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="p-2 bg-white rounded-lg text-[#D4AF37] shadow-sm">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email</h4>
                    <a href="mailto:info@dvarixrealty.com" className="text-sm font-semibold text-slate-800 hover:text-[#D4AF37] transition-colors duration-200">
                      info@dvarixrealty.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="p-2 bg-white rounded-lg text-[#D4AF37] shadow-sm">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Phone</h4>
                    <a href="tel:+916300984846" className="text-sm font-semibold text-slate-800 hover:text-[#D4AF37] transition-colors duration-200">
                      +91 63009 84846
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="p-2 bg-white rounded-lg text-[#D4AF37] shadow-sm">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Location</h4>
                    <p className="text-sm font-semibold text-slate-800">JP Nagar, Bengaluru, Karnataka 560078</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Bottom Notice & Effective Dates */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 sm:p-8 text-center space-y-4">
              <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-xl mx-auto">
                By continuing to use the Dvarix Realty website, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.
              </p>
              <div className="w-8 h-[2px] bg-[#D4AF37] mx-auto rounded-full" />
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-slate-400">
                <div>
                  <span className="font-semibold text-slate-500">Effective Date:</span> 05 July 2026
                </div>
                <div className="hidden sm:block text-slate-300">|</div>
                <div>
                  <span className="font-semibold text-slate-500">Last Updated:</span> 05 July 2026
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>

    </div>
  );
}
