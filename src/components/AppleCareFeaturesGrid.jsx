import React from 'react';
import { MessageSquare } from 'lucide-react';

const AppleCareFeaturesGrid = ({ years = '3', className = '' }) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-2.5 py-4 my-4 text-center ${className || 'border-y border-zinc-100'}`}>
      <div className="flex flex-col items-center gap-3 p-2.5 md:border-r border-zinc-100">
        <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#FF2D55]" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
        <span className="text-[10px] sm:text-[11px] font-bold text-zinc-700 leading-tight text-center line-clamp-3 min-h-[36px]">
          {years.toString().replace(/years?/i, '').trim()} {years.toString().trim() === '1' ? 'Year' : 'Years'} Peace of Mind with AppleCare+
        </span>
      </div>

      <div className="flex flex-col items-center gap-3 p-2.5 md:border-r border-zinc-100">
        <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
          <MessageSquare className="w-5 h-5 text-[#FF2D55]" />
        </div>
        <span className="text-[10px] sm:text-[11px] font-bold text-zinc-700 leading-tight text-center line-clamp-3 min-h-[36px]">
          Priority access to technical support
        </span>
      </div>

      <div className="flex flex-col items-center gap-3 p-2.5 md:border-r border-zinc-100">
        <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#FF2D55]" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M11 3v16M3 11h16M5.3 5.3l11.4 11.4M5.3 16.7L16.7 5.3" strokeWidth="1" />
            <path d="M15 15l4 4" strokeWidth="2.5" />
          </svg>
        </div>
        <span className="text-[10px] sm:text-[11px] font-bold text-zinc-700 leading-tight text-center line-clamp-3 min-h-[36px]">
          Unlimited Damage Protection
        </span>
      </div>

      <div className="flex flex-col items-center gap-3 p-2.5">
        <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#FF2D55]" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="6" width="16" height="12" rx="2.5" stroke="currentColor" strokeWidth="2"/>
            <path d="M20 9.5C21 9.5 21.5 10 21.5 12C21.5 14 21 14.5 20 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M11 8L7 13H11L9 17L14 11H10L11 8Z" fill="currentColor"/>
          </svg>
        </div>
        <span className="text-[10px] sm:text-[11px] font-bold text-zinc-700 leading-tight text-center line-clamp-3 min-h-[36px]">
          Battery service coverage
        </span>
      </div>
    </div>
  );
};

export default AppleCareFeaturesGrid;
