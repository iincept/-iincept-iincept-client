import React from 'react';

/**
 * AppleLogoSvg Component
 * Uses Apple's authentic vector geometry (from official Apple design system)
 * with a clean, crisp Apple white-silver gradient that perfectly matches
 * the typography and eliminates any dull, muddy, or beige tint.
 */
function AppleLogoSvg({ className = "w-6 h-6", gradientId = "iinceptAppleGrad" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} shrink-0`}
      aria-hidden="true"
      style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.45))' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#D8D8DF" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradientId})`}
        d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.58 2.95-1.39z"
      />
    </svg>
  );
}

/**
 * IinceptLogo Component
 * Premium Apple-inspired brand logo.
 * - Perfectly proportioned authentic Apple logos (matching the Navbar icon geometry)
 * - Matching crisp white/silver gradient across both icons and iincept® text
 * - Clean connecting lines with smooth jewel dots
 * - Elegant capsule tagline pill
 */
export default function IinceptLogo({
  className = '',
  bg = 'bg-[#222222]',
  tagline = 'The best experience for everything Apple!',
  compact = false
}) {
  return (
    <div className={`w-full ${bg} ${compact ? 'py-1.5 px-1' : 'py-8 px-4'} flex flex-col items-center justify-center select-none ${className}`}>
      <style>{`
        .iincept-silver-text {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Rounded", "SF Pro Display", "Helvetica Neue", sans-serif;
          font-weight: 700;
          letter-spacing: -0.01em;
          background: linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 55%, #D8D8DF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
        }
      `}</style>

      {/* Brand Heading Row: Apple Logo + iincept® + Apple Logo */}
      <div className={`flex items-center justify-center ${compact ? 'gap-2 sm:gap-3' : 'gap-3 sm:gap-5 md:gap-6'}`}>
        {/* Left Apple Logo */}
        <div className="flex items-center justify-center">
          <AppleLogoSvg
            gradientId="iinceptAppleLeft"
            className={compact ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-7 h-7 sm:w-10 sm:h-10 md:w-11 md:h-11'}
          />
        </div>

        {/* Brand Text: iincept® */}
        <h1 className={`${compact ? 'text-2xl sm:text-3xl' : 'text-4xl sm:text-6xl md:text-7xl'} font-bold flex items-center leading-none tracking-tight select-none`}>
          <span className="iincept-silver-text">iincept</span>
          <sup className={`${compact ? 'text-[8px] sm:text-[9px] w-3.5 h-3.5 -translate-y-2' : 'text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 -translate-y-3 sm:-translate-y-4'} font-semibold ml-1 text-[#FFFFFF] border border-[#FFFFFF]/60 rounded-full inline-flex items-center justify-center`}>
            ®
          </sup>
        </h1>

        {/* Right Apple Logo */}
        <div className="flex items-center justify-center">
          <AppleLogoSvg
            gradientId="iinceptAppleRight"
            className={compact ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-7 h-7 sm:w-10 sm:h-10 md:w-11 md:h-11'}
          />
        </div>
      </div>

      {/* Tagline Row: Connecting Line + Dot + Capsule Pill + Dot + Connecting Line */}
      <div className={`flex items-center justify-center w-full ${compact ? 'max-w-[340px] mt-2' : 'max-w-xl mt-3 sm:mt-4'} px-1`}>
        {/* Left line + dot */}
        <div className="flex items-center flex-1 justify-end min-w-[20px]">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#8E8E93]/60 to-[#D8D8DF]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#FFFFFF] shrink-0 -ml-[0.5px] shadow-[0_0_2px_rgba(255,255,255,0.4)]" />
        </div>

        {/* Capsule pill */}
        <div className={`mx-1.5 sm:mx-2 rounded-full border border-[#8E8E93]/60 bg-[#161618] ${compact ? 'px-3 py-0.5' : 'px-4 sm:px-6 py-1.5'} shadow-sm shrink-0`}>
          <p className={`${compact ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-sm md:text-base'} text-[#E8E8ED] font-medium text-center whitespace-nowrap`}>
            {tagline}
          </p>
        </div>

        {/* Right dot + line */}
        <div className="flex items-center flex-1 justify-start min-w-[20px]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FFFFFF] shrink-0 -mr-[0.5px] shadow-[0_0_2px_rgba(255,255,255,0.4)]" />
          <div className="h-[1px] w-full bg-gradient-to-l from-transparent via-[#8E8E93]/60 to-[#D8D8DF]" />
        </div>
      </div>
    </div>
  );
}
