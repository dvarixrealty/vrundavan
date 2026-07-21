import React, { useEffect, useState } from 'react';
import { firebaseService } from '../lib/firebaseService';
import { BrandingSetting } from '../types';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  hideText?: boolean;
}

export default function Logo({ className = '', size = 'md', hideText = false }: LogoProps) {
  const [branding, setBranding] = useState<BrandingSetting | null>(null);

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeBrandingSettings(
      (data) => {
        if (data) setBranding(data);
      },
      (err) => console.error("Logo failed to load branding settings:", err)
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const dimensions = {
    sm: { box: 'h-10', text: 'text-lg', sub: 'text-[9px]' },
    md: { box: 'h-16', text: 'text-2xl', sub: 'text-[11px]' },
    lg: { box: 'h-24', text: 'text-4xl', sub: 'text-sm' }
  }[size];

  const logoUrl = branding?.logoUrl || "/images/logo.webp";

  return (
    <div className={`flex items-center space-x-3 select-none ${className}`} id="dvarix-logo-component">
      <img
        src={logoUrl}
        alt={branding?.companyName || "Dvarix Realty"}
        className={`${dimensions.box} object-contain max-w-[200px]`}
        referrerPolicy="no-referrer"
      />
      {/* Styled text description */}
      {!hideText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center">
            {branding?.companyName ? (
              <span className="font-sans font-black tracking-widest text-white leading-none flex" style={{ fontSize: size === 'sm' ? '1.1rem' : size === 'lg' ? '2.4rem' : '1.5rem' }}>
                {branding.companyName.toUpperCase()}
              </span>
            ) : (
              <span className="font-sans font-black tracking-widest text-white leading-none flex" style={{ fontSize: size === 'sm' ? '1.1rem' : size === 'lg' ? '2.4rem' : '1.5rem' }}>
                DV<span className="text-[#ff5a3c]">Λ</span>RIX&nbsp;REALTY
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
