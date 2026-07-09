import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Info, 
  Database, 
  CheckCircle, 
  Share2, 
  Lock, 
  Cookie, 
  ExternalLink, 
  UserCheck, 
  Users, 
  RefreshCw, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  ChevronRight, 
  Home 
} from 'lucide-react';
import { ActiveTab } from '../types';

interface PrivacyPolicyViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export default function PrivacyPolicyView({ setActiveTab }: PrivacyPolicyViewProps) {
  // Smooth scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const sections = [
    { id: 'introduction', title: '1. Introduction', icon: <Info className="w-4 h-4" /> },
    { id: 'information-collected', title: '2. Information We Collect', icon: <Database className="w-4 h-4" /> },
    { id: 'how-we-use', title: '3. How We Use Your Information', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'sharing-information', title: '4. Sharing Information', icon: <Share2 className="w-4 h-4" /> },
    { id: 'data-security', title: '5. Data Security', icon: <Lock className="w-4 h-4" /> },
    { id: 'cookies', title: '6. Cookies', icon: <Cookie className="w-4 h-4" /> },
    { id: 'third-party', title: '7. Third-Party Services', icon: <ExternalLink className="w-4 h-4" /> },
    { id: 'your-rights', title: '8. Your Rights', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'childrens-privacy', title: '9. Children\'s Privacy', icon: <Users className="w-4 h-4" /> },
    { id: 'changes-policy', title: '10. Changes to this Policy', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'contact-us', title: '11. Contact Us', icon: <Mail className="w-4 h-4" /> }
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
    <div id="privacy-policy-view" className="bg-white min-h-screen font-sans text-slate-800 selection:bg-[#D4AF37]/20 selection:text-slate-900">
      
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
          <span className="text-slate-800 font-semibold">Privacy Policy</span>
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
            <Shield className="w-10 h-10 stroke-[1.5]" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-sans font-bold text-slate-900 tracking-tight leading-tight"
          >
            Privacy Policy
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto font-light"
          >
            Your privacy is important to us. This Privacy Policy explains how Dvarix Realty collects, uses, protects, and manages your personal information when you use our website and real estate services.
          </motion.p>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Table of Contents - Left sticky rail on Desktop */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-28 bg-slate-50/70 border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
              Policy Sections
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

          {/* Privacy Policy Documents - Right structured flow */}
          <main className="col-span-12 lg:col-span-8 space-y-8 text-left">
            
            {/* 1. Introduction */}
            <section id="introduction" className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-50">
                <div className="p-2 bg-amber-50/50 rounded-lg text-[#D4AF37]">
                  <Info className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">1. Introduction</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-light">
                Welcome to Dvarix Realty. We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains what information we collect, how we use it, and the choices available to you.
              </p>
            </section>

            {/* 2. Information We Collect */}
            <section id="information-collected" className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-50">
                <div className="p-2 bg-amber-50/50 rounded-lg text-[#D4AF37]">
                  <Database className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">2. Information We Collect</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-light mb-4">
                We may collect the following personal and professional details when you engage with our services:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-sm">
                {[
                  'Full Name',
                  'Mobile Number',
                  'Email Address',
                  'Property Preferences',
                  'Budget Information',
                  'Preferred Location',
                  'Property Inquiry Details',
                  'Messages submitted through contact forms',
                  'WhatsApp inquiries',
                  'Phone call inquiries'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-slate-600">
                    <span className="text-[#D4AF37] text-lg leading-none select-none mt-0.5">•</span>
                    <span className="font-light">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-slate-50">
                <p className="text-slate-500 text-xs leading-relaxed font-light">
                  <span className="font-medium text-slate-700">Technical Data:</span> We also collect website analytics information such as IP address, browser type, device information, pages visited, and website usage statistics to refine your navigation experience.
                </p>
              </div>
            </section>

            {/* 3. How We Use Your Information */}
            <section id="how-we-use" className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-50">
                <div className="p-2 bg-amber-50/50 rounded-lg text-[#D4AF37]">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">3. How We Use Your Information</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-light mb-4">
                We process your details based on robust real estate workflows, specifically designed to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-sm">
                {[
                  'Respond to your inquiries',
                  'Recommend suitable properties',
                  'Schedule property visits',
                  'Provide customer support',
                  'Improve our services',
                  'Send important updates',
                  'Share new property opportunities',
                  'Improve website performance',
                  'Maintain business records'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-slate-600">
                    <span className="text-[#D4AF37] text-lg leading-none select-none mt-0.5">•</span>
                    <span className="font-light">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 p-3.5 bg-amber-50/30 rounded-xl border border-amber-100/50 text-[#D4AF37] text-xs font-medium tracking-wide uppercase">
                We do not sell your personal information.
              </div>
            </section>

            {/* 4. Sharing Information */}
            <section id="sharing-information" className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-50">
                <div className="p-2 bg-amber-50/50 rounded-lg text-[#D4AF37]">
                  <Share2 className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">4. Sharing Information</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-light mb-4">
                We may share your information only when necessary with verified partners to fulfill service obligations:
              </p>
              <ul className="space-y-3 text-sm">
                {[
                  { title: 'Property Owners & Developers', desc: 'To coordinate specific site listings and property visits.' },
                  { title: 'Banking Partners', desc: 'To facilitate home loan assistance and financing recommendations.' },
                  { title: 'Legal Verification Partners', desc: 'For asset verification, background diligence, and documentation.' },
                  { title: 'Government Authorities', desc: 'When strictly mandated under Indian law or regulatory compliance.' },
                  { title: 'Trusted Service Providers', desc: 'Supporting our hosting, communications, and customer relations CRM tools.' }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-[#D4AF37] text-lg leading-none select-none mt-0.5">•</span>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-[13.5px]">{item.title}</h4>
                      <p className="text-slate-500 text-xs font-light mt-0.5">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-5 p-3.5 bg-amber-50/30 rounded-xl border border-amber-100/50 text-[#D4AF37] text-xs font-medium tracking-wide uppercase">
                We never sell customer data to third parties.
              </div>
            </section>

            {/* 5. Data Security */}
            <section id="data-security" className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-50">
                <div className="p-2 bg-amber-50/50 rounded-lg text-[#D4AF37]">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">5. Data Security</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-light">
                Dvarix Realty implements reasonable administrative, technical, and organizational measures to protect your personal information from unauthorized access, misuse, alteration, or disclosure. While no online system can guarantee absolute security, we strive to safeguard your information using industry-standard practices.
              </p>
            </section>

            {/* 6. Cookies */}
            <section id="cookies" className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-50">
                <div className="p-2 bg-amber-50/50 rounded-lg text-[#D4AF37]">
                  <Cookie className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">6. Cookies</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-light mb-4">
                Our website may use cookies and similar tracking technologies to build custom visual preferences and elevate performance:
              </p>
              <div className="space-y-3 text-sm">
                {[
                  { title: 'Improve website performance', desc: 'Accelerates asset image loading and server response caches.' },
                  { title: 'Remember preferences', desc: 'Saves your active filter values for budget, BHK, or property locations.' },
                  { title: 'Analyze visitor behavior', desc: 'Allows our team to evaluate which listing templates provide maximum value.' },
                  { title: 'Enhance user experience', desc: 'Simplifies return visits by personalizing interface properties.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="text-[#D4AF37] text-lg leading-none select-none mt-0.5">•</span>
                    <div>
                      <span className="font-medium text-slate-800 text-[13px]">{item.title}</span>
                      <span className="text-slate-500 font-light block md:inline md:ml-1.5">— {item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-slate-500 text-xs leading-relaxed font-light pt-3 border-t border-slate-50">
                Users can easily control or completely disable cookie structures through their personal browser settings.
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
                We integrate essential external APIs and platforms to deliver optimized location features, chat helpdesks, and metrics trackers:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                {['Google Maps', 'WhatsApp Web', 'Email systems', 'Analytics tools', 'Social media platforms'].map((srv, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-700">
                    {srv}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-slate-500 text-xs leading-relaxed font-light">
                Please note that these third-party integrations operate independently under their own dedicated privacy rules. We recommend reviewing their separate statements upon redirection.
              </p>
            </section>

            {/* 8. Your Rights */}
            <section id="your-rights" className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-50">
                <div className="p-2 bg-amber-50/50 rounded-lg text-[#D4AF37]">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">8. Your Rights</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-light mb-4">
                You possess full transparency and control over your submitted personal records. You may request to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-sm mb-4">
                {[
                  'Access your personal information held in our records',
                  'Correct inaccurate or outdated information',
                  'Update your communication preferences',
                  'Request deletion of your data where applicable',
                  'Withdraw consent for promotional marketing updates'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-slate-600">
                    <span className="text-[#D4AF37] text-lg leading-none select-none mt-0.5">•</span>
                    <span className="font-light">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs font-light leading-relaxed">
                To submit an actionable request, reach out to our privacy representative using the coordinates provided in the Contact section.
              </p>
            </section>

            {/* 9. Children's Privacy */}
            <section id="childrens-privacy" className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-50">
                <div className="p-2 bg-amber-50/50 rounded-lg text-[#D4AF37]">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">9. Children's Privacy</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-light">
                Our services are intended strictly for individuals aged 18 years or older. We do not knowingly collect, store, or solicit personal information from children under the age of 18.
              </p>
            </section>

            {/* 10. Changes to this Privacy Policy */}
            <section id="changes-policy" className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-50">
                <div className="p-2 bg-amber-50/50 rounded-lg text-[#D4AF37]">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">10. Changes to this Policy</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-light">
                We may update this Privacy Policy periodically to align with changing regulatory requirements or operational upgrades. Any revisions will be published immediately on this page along with the updated effective date at the top and bottom.
              </p>
            </section>

            {/* 11. Contact Us */}
            <section id="contact-us" className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-50">
                <div className="p-2 bg-amber-50/50 rounded-lg text-[#D4AF37]">
                  <Mail className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">11. Contact Us</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-light mb-5">
                If you have questions regarding this Privacy Policy or wish to exercise your legal data rights, please contact our administrative desk:
              </p>
              
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4 text-sm">
                <h3 className="font-bold text-slate-900 tracking-wide">Dvarix Realty</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Email</span>
                      <a href="mailto:info@dvarixrealty.com" className="text-slate-700 hover:text-[#D4AF37] transition-colors duration-150 font-medium font-sans">
                        info@dvarixrealty.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Phone</span>
                      <span className="text-slate-700 font-medium font-sans">
                        +91 63009 84846
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Location</span>
                      <span className="text-slate-700 font-medium font-sans">
                        Bengaluru, Karnataka, India
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Globe className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Website</span>
                      <a href="https://dvarixrealty.com" target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-[#D4AF37] transition-colors duration-150 font-medium font-sans">
                        https://dvarixrealty.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Bottom highlighted notice and Dates */}
            <div className="bg-[#D4AF37]/5 border-l-4 border-[#D4AF37] rounded-r-2xl p-6 sm:p-8 space-y-4">
              <p className="text-slate-700 text-[13.5px] leading-relaxed font-medium">
                "By using the Dvarix Realty website, you acknowledge that you have read and understood this Privacy Policy and agree to the collection and use of your information as described herein."
              </p>
              <div className="pt-4 border-t border-slate-200/50 flex flex-col sm:flex-row gap-4 sm:gap-8 text-xs text-slate-500 font-medium">
                <div>
                  <span className="text-slate-400">Effective Date:</span> 05 July 2026
                </div>
                <div className="hidden sm:block text-slate-300">•</div>
                <div>
                  <span className="text-slate-400">Last Updated:</span> 05 July 2026
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
