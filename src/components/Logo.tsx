import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  hideText?: boolean;
}

export default function Logo({ className = '', size = 'md', hideText = false }: LogoProps) {
  const dimensions = {
    sm: { box: 'h-10', text: 'text-lg', sub: 'text-[9px]' },
    md: { box: 'h-16', text: 'text-2xl', sub: 'text-[11px]' },
    lg: { box: 'h-24', text: 'text-4xl', sub: 'text-sm' }
  }[size];

  return (
    <div className={`flex items-center space-x-3 select-none ${className}`} id="dvarix-logo-component">
      {/* Golden Emblem SVG */}
      <svg
        className={`${dimensions.box} aspect-square`}
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Real Gold Gradients */}
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="45%" stopColor="#FFC107" />
            <stop offset="70%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8C6B12" />
          </linearGradient>
          <linearGradient id="goldSparkle" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#FFE082" />
          </linearGradient>
          <linearGradient id="buildingDark" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(212, 175, 55, 0.15)" />
            <stop offset="100%" stopColor="rgba(212, 175, 55, 0)" />
          </radialGradient>
        </defs>

        {/* Ambient background glow */}
        <circle cx="250" cy="250" r="220" fill="url(#goldGlow)" />

        {/* Inner stylized giant letter D in Gold */}
        <path
          d="M 120 100 
             L 320 100 
             A 150 150 0 0 1 320 400 
             L 280 400
             A 115 115 0 0 0 280 140
             L 165 140
             L 165 375
             L 120 375
             Z"
          fill="url(#goldGrad)"
          stroke="url(#goldSparkle)"
          strokeWidth="3"
        />

        {/* Background Building Outlines inside the gold 'D' */}
        {/* Building Left (Dark slate with gold bevel) */}
        <path
          d="M 175 350 L 175 180 L 220 160 L 220 350 Z"
          fill="url(#buildingDark)"
          stroke="url(#goldGrad)"
          strokeWidth="2"
        />
        {/* Building Middle (Taller, Golden) */}
        <path
          d="M 225 350 L 225 120 L 270 95 L 270 350 Z"
          fill="url(#goldGrad)"
          stroke="url(#goldSparkle)"
          strokeWidth="1.5"
          opacity="0.9"
        />
        {/* Building Right with windows */}
        <path
          d="M 275 350 L 275 190 L 320 210 L 320 350 Z"
          fill="url(#buildingDark)"
          stroke="url(#goldGrad)"
          strokeWidth="2"
        />
        {/* Building Right grid windows */}
        <line x1="285" y1="220" x2="310" y2="230" stroke="url(#goldSparkle)" strokeWidth="1.5" />
        <line x1="285" y1="240" x2="310" y2="250" stroke="url(#goldSparkle)" strokeWidth="1.5" />
        <line x1="285" y1="260" x2="310" y2="270" stroke="url(#goldSparkle)" strokeWidth="1.5" />
        <line x1="285" y1="280" x2="310" y2="290" stroke="url(#goldSparkle)" strokeWidth="1.5" />
        <line x1="285" y1="300" x2="310" y2="310" stroke="url(#goldSparkle)" strokeWidth="1.5" />

        {/* Interlocking Roof shape on the bottom of Skyscrapers */}
        <path
          d="M 100 375 
             L 250 250 
             L 400 375 
             L 370 375 
             L 250 275 
             L 130 375 
             Z"
          fill="url(#goldGrad)"
        />

        {/* Small Golden Grid Window in the center bottom roof */}
        <rect x="235" y="300" width="12" height="12" fill="url(#goldSparkle)" />
        <rect x="253" y="300" width="12" height="12" fill="url(#goldSparkle)" />
        <rect x="235" y="318" width="12" height="12" fill="url(#goldSparkle)" />
        <rect x="253" y="318" width="12" height="12" fill="url(#goldSparkle)" />
      </svg>

      {/* Styled text description */}
      {!hideText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center">
            {/* Custom Λ lettering instead of standard A for luxury feel */}
            <span className="font-sans font-black tracking-widest text-white leading-none flex" style={{ fontSize: size === 'sm' ? '1.1rem' : size === 'lg' ? '2.4rem' : '1.5rem' }}>
              DV<span className="text-[#ff5a3c]">Λ</span>RIX&nbsp;REALTY
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
