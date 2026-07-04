import React, { useState } from 'react';
import { Heart, Menu, X } from 'lucide-react';
import { ActiveTab, AdminUser } from '../types';
import Logo from './Logo';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  favoriteCount: number;
  onOpenFavorites: () => void;
  onOpenCustomRequest: () => void;
  loggedInUser: AdminUser | null;
  onLogout?: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  favoriteCount,
  onOpenFavorites,
  onOpenCustomRequest,
  loggedInUser,
  onLogout
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems: { label: string; value: ActiveTab }[] = [
    { label: 'Home', value: 'Home' },
    { label: 'Properties', value: 'Properties' },
    { label: 'About Us', value: 'About' },
    { label: 'Contact', value: 'Contact' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0a192f]/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div 
            onClick={() => setActiveTab('Home')}
            className="cursor-pointer group"
            id="header-logo-container"
          >
            <Logo size="sm" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2" id="desktop-navbar">
            {menuItems.map((item) => (
              <button
                key={item.value}
                id={`nav-item-${item.value.toLowerCase()}`}
                onClick={() => setActiveTab(item.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === item.value
                    ? 'text-white bg-slate-800/80 shadow-inner border border-slate-700/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/30'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Saved Properties */}
            <button
              onClick={onOpenFavorites}
              id="favorite-trigger-btn"
              className="relative p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-500 rounded-xl transition duration-200"
              aria-label="Favorites"
            >
              <Heart className="h-5 w-5" />
              {favoriteCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ff5a3c] text-white text-[11px] font-bold w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-[#0a192f] animate-pulse">
                  {favoriteCount}
                </span>
              )}
            </button>

            {/* Quick Consultation Call */}
            <button
              onClick={onOpenCustomRequest}
              id="btn-custom-request"
              className="bg-[#ff5a3c] hover:bg-[#e04326] text-white px-5 py-3 rounded-xl text-sm font-bold tracking-wider shadow-lg shadow-orange-950/20 hover:scale-103 transition duration-200 cursor-pointer"
            >
              Custom Request
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              onClick={onOpenFavorites}
              className="relative p-2 bg-slate-800 text-slate-300 hover:text-rose-500 rounded-lg transition duration-200"
            >
              <Heart className="h-5 w-5" />
              {favoriteCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ff5a3c] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {favoriteCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 transition"
              id="mobile-menu-trigger"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Overlay & Content */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0a192f] select-none" id="mobile-navbar-drawer">
          <div className="px-2 pt-2 pb-6 space-y-1 sm:px-3">
            {menuItems.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  setActiveTab(item.value);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left block px-4 py-3 rounded-lg text-base font-medium transition duration-200 ${
                  activeTab === item.value
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="pt-4 px-4">
              <button
                onClick={() => {
                  onOpenCustomRequest();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-[#ff5a3c] text-white py-3 px-4 rounded-xl font-bold tracking-wide text-center block shadow-lg hover:bg-[#e04326] transition active:scale-95"
              >
                Custom Request
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
