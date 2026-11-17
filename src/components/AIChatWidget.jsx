import React, { useState, useRef, useEffect } from 'react';

const PhoneCallIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const WhatsAppIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.147 4.193 4.29-1.124zm11.391-7.147c-.244-.122-1.441-.712-1.664-.793-.223-.081-.386-.122-.549.122-.163.244-.63.793-.772.956-.143.163-.285.183-.529.061-.244-.122-1.034-.381-1.97-1.216-.728-.648-1.22-1.45-1.363-1.694-.143-.244-.015-.376.107-.497.11-.11.244-.285.366-.427.122-.143.163-.244.244-.407.081-.163.041-.305-.02-.427-.061-.122-.549-1.321-.752-1.808-.198-.475-.399-.411-.549-.419-.143-.008-.305-.008-.467-.008s-.427.061-.65.305c-.223.244-.854.834-.854 2.036 0 1.201.874 2.361.996 2.524.122.163 1.72 2.627 4.167 3.684.582.252 1.037.402 1.392.515.584.186 1.116.159 1.536.097.47-.07 1.441-.59 1.644-1.16.203-.57.203-1.058.143-1.16-.062-.101-.224-.162-.468-.284z"/>
  </svg>
);

const ChevronLeftIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const mobileRef = useRef(null);

  const phoneCallUrl = 'tel:+919971002348';
  const whatsappUrl = `https://wa.me/919971002348?text=${encodeURIComponent(
    'Hi Rahul, I am visiting iincept Apple Store and need assistance with Apple products and quotes.'
  )}`;

  // Close mobile widget when user clicks outside
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, [isOpen]);

  return (
    <>
      {/* ========================================================
          1. MOBILE VIEW (Expand on 1-click, Collapse on 1-click)
          ======================================================== */}
      <aside
        ref={mobileRef}
        aria-label="Quick Contact & Support Mobile"
        className="block sm:hidden fixed right-0 bottom-28 z-50 select-none"
      >
        {!isOpen ? (
          /* Collapsed State: Sleek half-pill tab with '<' on the right edge */
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-center w-7 h-12 bg-[#182032] text-white rounded-l-2xl shadow-[0_4px_16px_rgba(0,0,0,0.28)] active:scale-95 transition-all border-y border-l border-white/20 cursor-pointer animate-in fade-in duration-200"
            title="Expand to show WhatsApp & Call"
            aria-label="Expand to show WhatsApp & Call"
          >
            <ChevronLeftIcon className="w-4 h-4 text-white" />
          </button>
        ) : (
          /* Expanded State: Top toggle '>' button + WhatsApp & Call capsule */
          <div className="flex flex-col items-center gap-2.5 mr-2 animate-in slide-in-from-right-8 duration-300">
            {/* Top Collapse Button (Chevron Right) */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-2xl bg-white shadow-lg border border-zinc-200/90 flex items-center justify-center text-[#182032] active:scale-90 transition-transform cursor-pointer"
              title="Collapse"
              aria-label="Collapse WhatsApp & Call"
            >
              <div className="w-6.5 h-6.5 rounded-xl bg-[#182032] text-white flex items-center justify-center shadow-xs">
                <ChevronRightIcon className="w-3.5 h-3.5 text-white" />
              </div>
            </button>

            {/* Bottom Capsule: WhatsApp + Call icons */}
            <div className="flex flex-col items-center bg-[#182032] p-2 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.32)] border border-white/10 gap-2.5">
              {/* WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md active:scale-90 transition-transform hover:scale-105"
                title="Chat on WhatsApp (+91 99710 02348)"
                aria-label="Chat on WhatsApp (+91 99710 02348)"
              >
                <WhatsAppIcon className="w-6 h-6 text-white drop-shadow-xs" />
              </a>

              {/* Subtle Divider */}
              <div className="w-5 h-px bg-white/20" />

              {/* Call Button */}
              <a
                href={phoneCallUrl}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center shadow-md active:scale-90 transition-all hover:scale-105"
                title="Call Customer Support (+91 99710 02348)"
                aria-label="Call Customer Support (+91 99710 02348)"
              >
                <PhoneCallIcon className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>
        )}
      </aside>

      {/* ========================================================
          2. DESKTOP VIEW (Preserved exact static floating buttons)
          ======================================================== */}
      <aside
        aria-label="Quick Contact & Support Desktop"
        className="hidden sm:flex flex-col items-center select-none pointer-events-auto fixed right-6 bottom-6 gap-3.5 z-50"
      >
        {/* WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="
            w-14 h-14 rounded-full bg-[#25D366] text-white
            border-2 border-white/20 shadow-2xl
            flex items-center justify-center cursor-pointer transition-all duration-300
            hover:scale-110 hover:bg-[#20ba5a] active:scale-95
          "
          aria-label="Chat on WhatsApp (+91 99710 02348)"
          title="Chat on WhatsApp (+91 99710 02348)"
        >
          <WhatsAppIcon className="w-7.5 h-7.5 text-white drop-shadow-sm" />
        </a>

        {/* Call Button */}
        <a
          href={phoneCallUrl}
          className="
            w-14 h-14 rounded-full bg-[#1877F2] text-white
            border-2 border-white/20 shadow-2xl
            flex items-center justify-center cursor-pointer transition-all duration-300
            hover:scale-110 hover:bg-[#166fe5] active:scale-95 group
          "
          aria-label="Call Customer Support (+91 99710 02348)"
          title="Call Customer Support (+91 99710 02348)"
        >
          <PhoneCallIcon className="w-7 h-7 text-white drop-shadow-sm transition-transform duration-300 group-hover:rotate-12" />
        </a>
      </aside>
    </>
  );
}
