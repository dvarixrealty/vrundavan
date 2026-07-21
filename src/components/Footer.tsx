import React from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  ChevronRight, 
  Home, 
  UserCheck, 
  ArrowRight, 
  Shield, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Youtube 
} from 'lucide-react';
import Logo from './Logo';
import { SiteCMSConfig, ActiveTab } from '../types';
import Link from './Link';

interface FooterProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  scrollToListings: () => void;
  siteSettings?: SiteCMSConfig;
  onOpenCustomRequest: () => void;
  setSearchFilter?: (filter: any) => void;
}

// Vector Skyline Illustration Component
// Perfectly captures monochrome dark gray building outlines with low opacity.
const SkylineIllustration = () => {
  return (
    <div className="w-full relative h-28 select-none pointer-events-none overflow-hidden opacity-10 mt-6 -mb-6">
      <svg 
        className="w-full h-full text-slate-500 fill-current" 
        viewBox="0 0 1600 150" 
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Layer 1 - Background Silhouettes (shorter, simple blocks) */}
        <path d="M 0 150 L 0 110 L 40 110 L 40 120 L 90 120 L 90 100 L 130 100 L 130 130 L 180 130 L 180 95 L 220 95 L 220 150 Z" opacity="0.4" />
        <path d="M 220 150 L 220 120 L 280 120 L 280 105 L 340 105 L 340 130 L 390 130 L 390 110 L 450 110 L 450 150 Z" opacity="0.4" />
        <path d="M 450 150 L 450 90 L 510 90 L 510 115 L 560 115 L 560 95 L 610 95 L 610 150 Z" opacity="0.4" />
        <path d="M 610 150 L 610 110 L 670 110 L 670 125 L 720 125 L 720 100 L 780 100 L 780 150 Z" opacity="0.4" />
        <path d="M 780 150 L 780 120 L 840 120 L 840 95 L 900 95 L 900 130 L 950 130 L 950 110 L 1010 110 L 1010 150 Z" opacity="0.4" />
        <path d="M 1010 150 L 1010 85 L 1070 85 L 1070 115 L 1120 115 L 1120 95 L 1170 95 L 1170 150 Z" opacity="0.4" />
        <path d="M 1170 150 L 1170 110 L 1230 110 L 1230 125 L 1280 125 L 1280 100 L 1340 100 L 1340 150 Z" opacity="0.4" />
        <path d="M 1340 150 L 1340 120 L 1400 120 L 1400 105 L 1460 105 L 1460 130 L 1510 130 L 1510 110 L 1600 110 L 1600 150 Z" opacity="0.4" />

        {/* Layer 2 - Foreground Detailed Outlines */}
        {/* Sleek Needle Tower */}
        <rect x="80" y="60" width="24" height="90" fill="none" stroke="currentColor" strokeWidth="1" />
        <line x1="92" y1="60" x2="92" y2="30" stroke="currentColor" strokeWidth="1" />
        
        {/* Modern grid scraper */}
        <rect x="135" y="45" width="40" height="105" fill="none" stroke="currentColor" strokeWidth="1" />
        {/* Window squares */}
        <rect x="141" y="55" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <rect x="151" y="55" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <rect x="161" y="55" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <rect x="141" y="67" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <rect x="151" y="67" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <rect x="161" y="67" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <rect x="141" y="79" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <rect x="151" y="79" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <rect x="161" y="79" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="0.5" />
        
        {/* Stepped highrise */}
        <path d="M 210 150 L 210 80 L 225 80 L 225 70 L 240 70 L 240 60 L 255 60 L 255 150" fill="none" stroke="currentColor" strokeWidth="1" />
        
        {/* Luxury Villa with triangle roof */}
        <polygon points="290,105 320,85 350,105" fill="none" stroke="currentColor" strokeWidth="1" />
        <rect x="295" y="105" width="50" height="45" fill="none" stroke="currentColor" strokeWidth="1" />
        <rect x="312" y="120" width="16" height="30" fill="none" stroke="currentColor" strokeWidth="1" />

        {/* Large center tower block */}
        <rect x="390" y="30" width="45" height="120" fill="none" stroke="currentColor" strokeWidth="1" />
        <line x1="412.5" y1="30" x2="412.5" y2="10" stroke="currentColor" strokeWidth="1" />
        {/* Tiny grid design on center block */}
        <line x1="390" y1="50" x2="435" y2="50" stroke="currentColor" strokeWidth="0.5" />
        <line x1="390" y1="70" x2="435" y2="70" stroke="currentColor" strokeWidth="0.5" />
        <line x1="390" y1="90" x2="435" y2="90" stroke="currentColor" strokeWidth="0.5" />
        <line x1="390" y1="110" x2="435" y2="110" stroke="currentColor" strokeWidth="0.5" />
        <line x1="405" y1="30" x2="405" y2="150" stroke="currentColor" strokeWidth="0.5" />
        <line x1="420" y1="30" x2="420" y2="150" stroke="currentColor" strokeWidth="0.5" />

        {/* Sleek diagonal roof highrise */}
        <path d="M 470 150 L 470 70 L 510 50 L 510 150" fill="none" stroke="currentColor" strokeWidth="1" />
        
        {/* Classic apartment */}
        <rect x="540" y="65" width="55" height="85" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="552" cy="77" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="567" cy="77" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="582" cy="77" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="552" cy="92" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="567" cy="92" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="582" cy="92" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
        
        {/* High Tech double towers with cross bracing */}
        <rect x="630" y="40" width="30" height="110" fill="none" stroke="currentColor" strokeWidth="1" />
        <rect x="670" y="40" width="30" height="110" fill="none" stroke="currentColor" strokeWidth="1" />
        <line x1="660" y1="40" x2="670" y2="40" stroke="currentColor" strokeWidth="1" />
        <line x1="660" y1="60" x2="670" y2="60" stroke="currentColor" strokeWidth="1" />
        <line x1="660" y1="80" x2="670" y2="80" stroke="currentColor" strokeWidth="1" />
        <line x1="630" y1="40" x2="660" y2="90" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
        <line x1="660" y1="40" x2="630" y2="90" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
        <line x1="670" y1="40" x2="700" y2="90" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
        <line x1="700" y1="40" x2="670" y2="90" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />

        {/* Tiny houses and luxury villas */}
        <path d="M 730 150 L 730 115 L 745 100 L 760 115 L 760 150" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M 770 150 L 770 110 L 795 90 L 820 110 L 820 150" fill="none" stroke="currentColor" strokeWidth="1" />

        {/* Large skyscraper */}
        <rect x="850" y="25" width="45" height="125" fill="none" stroke="currentColor" strokeWidth="1" />
        <line x1="872.5" y1="25" x2="872.5" y2="5" stroke="currentColor" strokeWidth="1" />
        
        {/* Diagonal top skyscraper 2 */}
        <path d="M 920 150 L 920 60 L 960 40 L 960 150" fill="none" stroke="currentColor" strokeWidth="1" />

        {/* Modern office building */}
        <rect x="990" y="55" width="60" height="95" fill="none" stroke="currentColor" strokeWidth="1" />
        <line x1="990" y1="75" x2="1050" y2="75" stroke="currentColor" strokeWidth="1" />
        <line x1="990" y1="95" x2="1050" y2="95" stroke="currentColor" strokeWidth="1" />
        <line x1="990" y1="115" x2="1050" y2="115" stroke="currentColor" strokeWidth="1" />
        <line x1="990" y1="135" x2="1050" y2="135" stroke="currentColor" strokeWidth="1" />
        
        {/* Additional residential block */}
        <rect x="1070" y="70" width="40" height="80" fill="none" stroke="currentColor" strokeWidth="1" />
        <polygon points="1070,70 1090,55 1110,70" fill="none" stroke="currentColor" strokeWidth="1" />

        {/* Dome/Heritage building */}
        <path d="M 1140 150 L 1140 100 A 30 30 0 0 1 1200 100 L 1200 150" fill="none" stroke="currentColor" strokeWidth="1" />
        <line x1="1170" y1="70" x2="1170" y2="50" stroke="currentColor" strokeWidth="1" />

        {/* High rise with needle */}
        <rect x="1230" y="35" width="35" height="115" fill="none" stroke="currentColor" strokeWidth="1" />
        <line x1="1247.5" y1="35" x2="1247.5" y2="10" stroke="currentColor" strokeWidth="1" />

        {/* Standard simple block */}
        <rect x="1290" y="80" width="50" height="70" fill="none" stroke="currentColor" strokeWidth="1" />
        
        {/* Sleek building with staggered roofs */}
        <path d="M 1360 150 L 1360 90 L 1380 90 L 1380 75 L 1400 75 L 1400 60 L 1420 60 L 1420 150" fill="none" stroke="currentColor" strokeWidth="1" />

        {/* Tree circle clusters in background for life */}
        <circle cx="50" cy="140" r="10" fill="none" stroke="currentColor" strokeWidth="0.75" />
        <circle cx="280" cy="142" r="8" fill="none" stroke="currentColor" strokeWidth="0.75" />
        <circle cx="525" cy="142" r="8" fill="none" stroke="currentColor" strokeWidth="0.75" />
        <circle cx="835" cy="140" r="10" fill="none" stroke="currentColor" strokeWidth="0.75" />
        <circle cx="975" cy="144" r="6" fill="none" stroke="currentColor" strokeWidth="0.75" />
        <circle cx="1125" cy="142" r="8" fill="none" stroke="currentColor" strokeWidth="0.75" />
        <circle cx="1350" cy="140" r="10" fill="none" stroke="currentColor" strokeWidth="0.75" />

        {/* Low horizontal floor line */}
        <line x1="0" y1="149" x2="1600" y2="149" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  );
};

export default function Footer({ 
  activeTab,
  setActiveTab, 
  scrollToListings, 
  siteSettings, 
  onOpenCustomRequest,
  setSearchFilter 
}: FooterProps) {
  
  const footerData = siteSettings?.footerConfig;

  // Exact default values requested by the user
  const brandDescription = footerData?.brandDescription || "Your trusted real estate advisory partner for residential, commercial, plots, villas, and investment properties across Bengaluru.";
  const addressText = footerData?.address || "JP Nagar, Bengaluru, Karnataka 560078";
  const phoneText = footerData?.phone || "+91 63009 84846";
  const emailText = footerData?.email || "dvarixrealty@gmail.com";

  const companyLinks = footerData?.companyLinks && footerData.companyLinks.length > 0
    ? footerData.companyLinks
    : [
        { label: 'Home', url: '/' },
        { label: 'Properties', url: '/properties' },
        { label: 'About Us', url: '/about' },
        { label: 'Contact Us', url: '/contact' },
        { label: 'Custom Request', url: '/custom-request' }
      ];

  const servicesLinks = footerData?.servicesLinks && footerData.servicesLinks.length > 0
    ? footerData.servicesLinks
    : [
        { label: 'Residential Properties', url: '/properties', filter: 'Residential' },
        { label: 'Commercial Properties', url: '/properties', filter: 'Commercial' },
        { label: 'Plots & Land', url: '/properties', filter: 'Plots' },
        { label: 'Luxury Villas', url: '/properties', filter: 'Villas' },
        { label: 'Investment Advisory', url: '/custom-request' }
      ];

  const quickLinks = footerData?.quickLinks && footerData.quickLinks.length > 0
    ? footerData.quickLinks
    : [
        { label: 'Privacy Policy', url: '/privacy-policy' },
        { label: 'Terms & Conditions', url: '/terms-conditions' },
        { label: 'RERA Compliance', url: '/rera-compliance' },
        { label: 'FAQs', url: '/faqs' },
        { label: 'Sitemap', url: '/sitemap' }
      ];

  // Dynamic link routing handlers with advanced filter capabilities
  const handleLinkClick = (url: string, categoryFilter?: string) => {
    if (!url) return;

    if (url === 'Home' || url === '/' || url === '#') {
      setActiveTab('Home');
      window.history.pushState(null, '', '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (url === 'Properties' || url === '/properties' || url.startsWith('/properties')) {
      let typeFilter = categoryFilter;
      if (!typeFilter && url.includes('?type=')) {
        typeFilter = url.split('?type=')[1];
      }
      if (setSearchFilter && typeFilter) {
        setSearchFilter({ keyword: '', type: typeFilter, location: 'All' });
      }
      setActiveTab('Properties');
      window.history.pushState(null, '', '/properties');
      setTimeout(() => {
        scrollToListings();
      }, 120);
    } else if (url === 'About' || url === '/about') {
      setActiveTab('About');
      window.history.pushState(null, '', '/about');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (url === 'Contact' || url === 'Contact Us' || url === '/contact') {
      setActiveTab('Contact');
      window.history.pushState(null, '', '/contact');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (url === 'CustomRequest' || url === 'Custom Request' || url === '/custom-request') {
      onOpenCustomRequest();
    } else if (url === 'FAQs' || url === '/faqs') {
      setActiveTab('Home');
      window.history.pushState(null, '', '/');
      setTimeout(() => {
        const faqSec = document.getElementById('website-faq-portal-section') || document.getElementById('faq-section');
        if (faqSec) {
          const elementPosition = faqSec.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: elementPosition - 100,
            behavior: 'smooth'
          });
        } else {
          window.scrollTo({ top: document.body.scrollHeight * 0.7, behavior: 'smooth' });
        }
      }, 150);
    } else if (url === 'Privacy' || url === 'Privacy Policy' || url === '/privacy-policy') {
      setActiveTab('PrivacyPolicy');
      window.history.pushState(null, '', '/privacy-policy');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (url === 'Terms' || url === 'Terms & Conditions' || url === '/terms-conditions') {
      setActiveTab('Terms');
      window.history.pushState(null, '', '/terms-conditions');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (url === 'RERA' || url === 'Sitemap' || url === 'RERA Compliance' || url === '/rera-compliance' || url === '/sitemap') {
      window.history.pushState(null, '', url);
      window.dispatchEvent(new CustomEvent('cms-alert-notification', {
        detail: {
          title: `${url.replace('/', '').toUpperCase()} Policy`,
          message: `Official compliance framework is successfully configured under registered legal advice.`,
          category: "Compliance"
        }
      }));
    } else {
      window.history.pushState(null, '', url);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="bg-[#071322] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 border-t border-slate-900/40 select-none overflow-hidden relative font-sans" 
      id="application-footer"
    >
      {/* Soft Top Ambient Gold Glow to elevate luxury appeal */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[150px] bg-[#F59E0B]/3 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-1/3 w-[500px] h-[150px] bg-[#FF8C00]/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Five-Column Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 items-start text-left">
          
          {/* COLUMN 1: Brand & Two Action Buttons (Col span 4) */}
          <div className="col-span-12 md:col-span-12 lg:col-span-4 space-y-6">
            <Link 
              to="/"
              className="inline-block cursor-pointer group transition-transform duration-300 hover:scale-[1.01]" 
              onClick={() => handleLinkClick('/')}
            >
              <Logo size="md" />
            </Link>
            
            <p className="text-slate-300 font-light text-[13px] leading-relaxed tracking-wide max-w-sm">
              {brandDescription}
            </p>

            {/* Two Call-to-Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 pt-2 max-w-sm sm:max-w-none lg:max-w-xs">
              
              {/* Primary Button */}
              <Link to="/properties" onClick={() => handleLinkClick('/properties')} className="block w-full">
                <motion.button
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#FF8C00] to-[#FF5A3C] hover:from-[#ff961f] hover:to-[#ff6d51] text-white text-[11.5px] font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md hover:shadow-[#FF8C00]/20 cursor-pointer w-full group"
                >
                  <span className="flex items-center gap-2.5">
                    <Home className="w-4 h-4 shrink-0" />
                    Explore Properties
                  </span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </motion.button>
              </Link>

              {/* Secondary Button */}
              <Link to="/contact" onClick={() => handleLinkClick('/contact')} className="block w-full">
                <motion.button
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex items-center justify-between px-5 py-3.5 bg-transparent border border-[#FF6B3D] hover:bg-[#FF6B3D]/10 hover:border-[#FF8C00] text-white text-[11.5px] font-bold uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer w-full group"
                >
                  <span className="flex items-center gap-2.5">
                    <UserCheck className="w-4 h-4 text-[#FF6B3D] shrink-0" />
                    Contact Advisor
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 transition-transform duration-300 group-hover:translate-x-1.5" />
                </motion.button>
              </Link>
              
            </div>
          </div>

          {/* COLUMN 2: COMPANY (Col span 2) */}
          <div className="col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-2 space-y-5">
            <h4 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-200 relative pb-2.5">
              COMPANY
              <span className="absolute bottom-0 left-0 w-8 h-[2px] bg-[#FF6B3D]" />
            </h4>
            <ul className="space-y-3.5">
              {companyLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.url}
                    onClick={() => handleLinkClick(link.url)}
                    className="flex items-center text-[13px] text-slate-300 hover:text-[#FF6B3D] font-light transition-all duration-200 cursor-pointer group text-left"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#FF6B3D]/80 mr-1.5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: SERVICES (Col span 2) */}
          <div className="col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-2 space-y-5">
            <h4 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-200 relative pb-2.5">
              SERVICES
              <span className="absolute bottom-0 left-0 w-8 h-[2px] bg-[#FF6B3D]" />
            </h4>
            <ul className="space-y-3.5">
              {servicesLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.url}
                    onClick={() => handleLinkClick(link.url, link.filter)}
                    className="flex items-center text-[13px] text-slate-300 hover:text-[#FF6B3D] font-light transition-all duration-200 cursor-pointer group text-left"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#FF6B3D]/80 mr-1.5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: QUICK LINKS (Col span 2) */}
          <div className="col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-2 space-y-5">
            <h4 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-200 relative pb-2.5">
              QUICK LINKS
              <span className="absolute bottom-0 left-0 w-8 h-[2px] bg-[#FF6B3D]" />
            </h4>
            <ul className="space-y-3.5">
              {quickLinks.map((link, idx) => {
                const isActive = 
                  (activeTab === 'PrivacyPolicy' && (link.url === 'Privacy Policy' || link.url === '/privacy-policy')) ||
                  (activeTab === 'Terms' && (link.url === 'Terms & Conditions' || link.url === '/terms-conditions'));
                return (
                  <li key={idx}>
                    <Link
                      to={link.url}
                      onClick={() => handleLinkClick(link.url)}
                      className={`flex items-center text-[13px] font-light transition-all duration-200 cursor-pointer group text-left ${
                        isActive ? 'text-[#FF6B3D] font-medium' : 'text-slate-300 hover:text-[#FF6B3D]'
                      }`}
                    >
                      <ChevronRight className={`w-3.5 h-3.5 mr-1.5 shrink-0 transition-transform duration-200 group-hover:translate-x-1 ${
                        isActive ? 'text-[#FF6B3D]' : 'text-[#FF6B3D]/80'
                      }`} />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* COLUMN 5: CONTACT US & FOLLOW US (Col span 2) */}
          <div className="col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <h4 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-200 relative pb-2.5">
                CONTACT US
                <span className="absolute bottom-0 left-0 w-8 h-[2px] bg-[#FF6B3D]" />
              </h4>
              <ul className="space-y-4 text-slate-300 text-[13px] font-light">
                <li className="flex items-start gap-3 group">
                  <MapPin className="h-4.5 w-4.5 text-[#FF6B3D] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span className="leading-relaxed text-slate-300">{addressText}</span>
                </li>
                <li className="flex items-center gap-3 group">
                  <Phone className="h-4.5 w-4.5 text-[#FF6B3D] shrink-0" strokeWidth={1.5} />
                  <a href={`tel:${phoneText.replace(/\s+/g, '')}`} className="hover:text-[#FF6B3D] transition-colors duration-200">
                    {phoneText}
                  </a>
                </li>
                <li className="flex items-center gap-3 group">
                  <Mail className="h-4.5 w-4.5 text-[#FF6B3D] shrink-0" strokeWidth={1.5} />
                  <a href={`mailto:${emailText}`} className="hover:text-[#FF6B3D] transition-colors duration-200 break-all">
                    {emailText}
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Icons section with beautiful gold/orange glowing effect */}
            <div className="space-y-3.5 pt-1">
              <h5 className="text-[11px] font-sans font-bold uppercase tracking-widest text-slate-300 relative pb-1.5">
                FOLLOW US
                <span className="absolute bottom-0 left-0 w-6 h-[1.5px] bg-[#FF6B3D]" />
              </h5>
              <div className="flex items-center gap-3">
                {[
                  { icon: <Instagram className="w-4 h-4" />, name: 'Instagram', url: 'https://instagram.com' },
                  { icon: <Facebook className="w-4 h-4" />, name: 'Facebook', url: 'https://facebook.com' },
                  { icon: <Linkedin className="w-4 h-4" />, name: 'LinkedIn', url: 'https://linkedin.com' },
                  { icon: <Youtube className="w-4 h-4" />, name: 'YouTube', url: 'https://youtube.com' }
                ].map((social, idx) => (
                  <motion.a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center justify-center w-9 h-9 rounded-full border border-slate-800 hover:border-[#FF6B3D] bg-slate-900/40 hover:bg-[#FF6B3D]/10 hover:shadow-[0_0_12px_rgba(255,107,61,0.3)] text-slate-300 hover:text-white transition-all duration-300 cursor-pointer"
                    title={social.name}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Thin Divider Line */}
        <div className="border-t border-slate-800/40 mt-12 mb-2" />

        {/* Dynamic Skyline Illustration */}
        <SkylineIllustration />

        {/* Bottom Bar Details */}
        <div className="border-t border-slate-800/40 pt-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Left copyright with branded Dvarix Realty highlight */}
          <div className="text-[12px] font-light text-slate-500 text-center lg:text-left">
            © {currentYear} <span className="text-[#FF6B3D] font-medium">Dvarix Realty</span>. All Rights Reserved.
          </div>

          {/* Center navigation shortcuts */}
          <div className="flex items-center justify-center gap-4 text-[12px] font-light text-slate-400">
            <button 
              onClick={() => handleLinkClick('Privacy Policy')} 
              className={`transition-colors duration-200 cursor-pointer ${
                activeTab === 'PrivacyPolicy' ? 'text-[#FF6B3D] font-medium' : 'hover:text-[#FF6B3D]'
              }`}
            >
              Privacy Policy
            </button>
            <span className="text-slate-800 font-bold">•</span>
            <button 
              onClick={() => handleLinkClick('Terms & Conditions')} 
              className={`transition-colors duration-200 cursor-pointer ${
                activeTab === 'Terms' ? 'text-[#FF6B3D] font-medium' : 'hover:text-[#FF6B3D]'
              }`}
            >
              Terms & Conditions
            </button>
            <span className="text-slate-800 font-bold">•</span>
            <button 
              onClick={() => handleLinkClick('RERA Compliance')} 
              className="hover:text-[#FF6B3D] transition-colors duration-200 cursor-pointer"
            >
              RERA
            </button>
          </div>

          {/* Right Trust Badging */}
          <div className="flex items-center gap-3 text-slate-400 text-right">
            <Shield className="h-8 w-8 text-[#FF6B3D] shrink-0" strokeWidth={1.5} />
            <div className="text-left font-sans">
              <p className="text-[11.5px] font-bold text-white tracking-wide uppercase leading-tight">
                RERA Registered
              </p>
              <p className="text-[9.5px] text-slate-500 font-light leading-none">
                Real Estate Advisory Services
              </p>
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
}
