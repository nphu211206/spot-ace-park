import React from 'react';

interface SpotAceLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export function SpotAceLogo({
  className = '',
  size = 'md',
  showSubtitle = true,
}: SpotAceLogoProps) {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Stylized Emblem: Luxury Shield with 'P' & 'A' Monogram and Gold Spark */}
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 shadow-md border border-blue-400/30 ${iconSizes[size]} shrink-0`}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
          <path
            d="M20 5L33 11V21C33 28.5 27.5 35 20 37C12.5 35 7 28.5 7 21V11L20 5Z"
            stroke="#c9b586"
            strokeWidth="1.5"
            strokeOpacity="0.85"
            fill="none"
          />
          <path
            d="M15 28V12H23C25.7614 12 28 14.2386 28 17C28 19.7614 25.7614 22 23 22H15"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="20" cy="17" r="2.5" fill="#c9b586" />
        </svg>

        <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center shadow-xs">
          <div className="w-1 h-1 rounded-full bg-amber-600" />
        </div>
      </div>

      {/* Brand Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-sans font-black tracking-tight ${textSizes[size]} text-slate-900`}>
            SPOT<span className="text-blue-700">ACE</span>
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-amber-100 text-amber-800 border border-amber-300/50 uppercase">
            PARK
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] tracking-[0.18em] uppercase font-semibold text-slate-500 mt-0.5">
            Smart Mobility Network
          </span>
        )}
      </div>
    </div>
  );
}

export default SpotAceLogo;
