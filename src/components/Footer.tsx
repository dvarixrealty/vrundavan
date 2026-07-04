import React, { useState } from 'react';
import { Mail, Send, CheckCircle, Phone } from 'lucide-react';
import Logo from './Logo';
import { SiteCMSConfig } from '../types';

interface FooterProps {
  setActiveTab: (tab: any) => void;
  scrollToListings: () => void;
  siteSettings?: SiteCMSConfig;
}

export default function Footer({ setActiveTab, scrollToListings, siteSettings }: FooterProps) {
  const [emailText, setEmailText] = useState('');
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailText.trim()) return;

    setSubscribeSuccess(true);
    setEmailText('');
    setTimeout(() => {
      setSubscribeSuccess(false);
    }, 4500);
  };

  return (
    <footer className="bg-[#040d1a] text-slate-400 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-900 text-left" id="application-footer">
      <div className="max-w-7xl mx-auto divide-y divide-slate-900 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10">
          
          {/* Logo brand */}
          <div className="md:col-span-5 space-y-4">
            <div className="cursor-pointer group" onClick={() => { setActiveTab('Home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <Logo size="md" />
            </div>
            <p className="text-sm font-sans font-light leading-relaxed text-slate-400 max-w-sm">
              We engineer state-of-the-art residential complexes, custom architectural villas, and fully certified grade-A warehouse solutions across India's premier high-growth corridors.
            </p>
            <div className="space-y-1.5 text-xs font-semibold font-mono">
              <span className="block text-slate-500 uppercase tracking-widest text-[9px]">OFFICIAL CHANNELS</span>
              <a href={`mailto:${siteSettings?.email || "dvarixrealty@gmail.com"}`} className="flex items-center space-x-2 text-slate-300 hover:text-[#ff5a3c]">
                <Mail className="h-3.5 w-3.5" />
                <span>{siteSettings?.email || "dvarixrealty@gmail.com"}</span>
              </a>
              <div className="flex items-center space-x-2 text-slate-300">
                <Phone className="h-3.5 w-3.5 text-[#ff5a3c]" />
                <span>{siteSettings?.phone || "+91 6300984846"}</span>
              </div>
              {siteSettings?.address && (
                <div className="text-slate-400 font-mono text-[10px] uppercase tracking-wide pt-1">
                  OFFICE: {siteSettings.address}
                </div>
              )}
            </div>
          </div>

          {/* Quick Nav links */}
          <div className="md:col-span-3 space-y-4 text-left">
            <h4 className="text-xs uppercase font-bold tracking-widest text-slate-300 font-mono">Territories & Links</h4>
            <ul className="space-y-2 text-sm text-slate-400 font-light font-sans">
              <li>
                <button 
                  onClick={() => { setActiveTab('Home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition cursor-pointer"
                >
                  Return Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('About'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition cursor-pointer"
                >
                  About Our Firm
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('Properties'); scrollToListings(); }}
                  className="hover:text-white transition cursor-pointer"
                >
                  Featured Listings
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('Inquiries')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Company CRM Logboard
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('Contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition cursor-pointer"
                >
                  Contact Admin Desk
                </button>
              </li>
            </ul>
          </div>

          {/* Dynamic Interactive Newsletter subscription */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs uppercase font-bold tracking-widest text-slate-300 font-mono">Stay Informed</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans font-light">
              Register your workspace email to receive periodic release briefs for new corporate and residential listings.
            </p>

            {subscribeSuccess ? (
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center space-x-2 text-emerald-400">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <span className="text-xs font-mono">Subscription Confirmed! Welcome to Dvarix.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribeSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                  className="flex-grow bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff5a3c]"
                />
                <button
                  type="submit"
                  className="bg-[#ff5a3c] hover:bg-[#e04326] text-white px-4 rounded-xl shadow-lg transition flex items-center justify-center cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Corporate compliance block */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs font-mono gap-4 font-light">
          <p>© 2026 Dvarix Realty Group S.A. All development rights reserved.</p>
          <div className="flex space-x-4">
            <span className="hover:text-slate-300 cursor-pointer">Licensing Agreements</span>
            <span className="text-slate-700">|</span>
            <span className="hover:text-slate-300 cursor-pointer">Secure Protocols</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
