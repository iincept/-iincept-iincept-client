import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../services/axiosClient';

const DEFAULT_FOOTER_DATA = {
  brandTitle: 'iiNCEPT',
  brandTagline: 'Official platform of Apple Authorised Distributors in India. Browse online, buy from trusted mono-brand resellers near you.',
  copyrightText: 'Copyright © 2026 iiNCEPT Electronics. All rights reserved. Powered by Ingram Micro & Redington.',
  columns: [
    {
      title: 'Shop',
      links: [
        { label: 'Mac', url: '/macbook' },
        { label: 'iPhone', url: '/iphone' },
        { label: 'iPad', url: '/ipad' },
        { label: 'Watch', url: '/watch' },
        { label: 'AirPods', url: '/airpods' },
        { label: 'TV & Home', url: '/tv-home' },
        { label: 'Accessories', url: '/accessories' },
        { label: 'AppleCare+', url: '/applecare' },
      ]
    },
    {
      title: 'Business',
      links: [
        { label: 'Request a Quote', url: '/bulk-orders' },
        { label: 'Bulk Pricing', url: '/bulk-orders' },
        { label: 'Dealer Login', url: '/login' },
        { label: 'GST Invoicing', url: '/bulk-orders' },
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About iincept', url: '/about' },
        { label: 'Contact Us', url: '/contact' },
        { label: 'FAQ', url: '/faq' },
      ]
    },
    {
      title: 'Policies',
      links: [
        { label: 'Shipping Policy', url: '/shipping-policy' },
        { label: 'Returns & Refund Policy', url: '/returns-refund-policy' },
        { label: 'Privacy Policy', url: '/privacy-policy' },
        { label: 'Terms of Service', url: '/terms-of-service' },
      ]
    }
  ],
  bottomLinks: [
    { label: 'Privacy Policy', url: '/privacy-policy' },
    { label: 'Terms of Service', url: '/terms-of-service' },
    { label: 'Shipping Policy', url: '/shipping-policy' },
    { label: 'Returns & Refund', url: '/returns-refund-policy' }
  ]
};

export default function Footer() {
  const [footerData, setFooterData] = useState(DEFAULT_FOOTER_DATA);
  const [openSections, setOpenSections] = useState({});

  useEffect(() => {
    fetchFooterSettings();
  }, []);

  const fetchFooterSettings = async () => {
    try {
      const response = await axiosClient.get('/settings');
      if (response.data && response.data.footerSections && response.data.footerSections.length > 0) {
        const customCols = response.data.footerSections
          .filter(sec => sec.isActive !== false)
          .map(sec => ({
            title: sec.title || 'Links',
            links: (sec.links || [])
              .filter(l => l.isActive !== false)
              .map(l => ({ label: l.label, url: l.url }))
          }));
        if (customCols.length > 0) {
          setFooterData(prev => ({
            ...prev,
            columns: customCols
          }));
        }
      }
    } catch (err) {
      console.warn('Using default iiNCEPT footer settings:', err);
    }
  };

  const toggleSection = (idx) => {
    setOpenSections(prev => ({
      ...prev,
      [idx]: prev[idx] !== undefined ? !prev[idx] : false
    }));
  };

  const isSectionOpen = (idx) => {
    return openSections[idx] !== undefined ? openSections[idx] : true;
  };

  return (
    <footer className="indiaistore-footer">
      <style>{`
        .indiaistore-footer, .indiaistore-footer * {
          box-sizing: border-box;
        }

        .indiaistore-footer {
          background: #000000;
          color: #ffffff;
          border-top: 1px solid #262629;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Inter", "Helvetica Neue", sans-serif;
          width: 100%;
          margin-top: auto;
          padding: 48px 0 32px;
          -webkit-font-smoothing: antialiased;
        }

        .indiaistore-footer-inner {
          max-width: 1340px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Desktop Layout */
        .indiaistore-footer-grid {
          display: grid;
          grid-template-columns: 2fr repeat(4, 1fr);
          gap: 40px;
          align-items: start;
        }

        .indiaistore-footer-brand-col {
          display: block;
        }

        .indiaistore-footer-logo-link {
          display: inline-block;
        }

        .indiaistore-footer-brand-col img {
          height: 110px;
          width: auto;
          object-fit: contain;
          margin-bottom: 16px;
          display: block;
          filter: brightness(0) invert(1);
        }

        .indiaistore-footer-brand-tagline {
          font-size: 13px;
          color: #a1a1a6;
          line-height: 1.55;
          max-width: 340px;
          margin: 0 0 14px 0;
        }

        .indiaistore-footer-trust-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          background: #111113;
          border: 1px solid #2c2c2e;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
          color: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
        }

        .indiaistore-footer-col {
          display: block;
        }

        .indiaistore-footer-col-header {
          background: transparent;
          border: none;
          padding: 0;
          margin: 0 0 14px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          text-align: left;
          cursor: default;
          pointer-events: none;
        }

        .indiaistore-footer-col-title {
          font-size: 12px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin: 0;
        }

        .indiaistore-footer-chevron {
          display: none;
        }

        .indiaistore-footer-content {
          max-height: none !important;
          opacity: 1 !important;
          visibility: visible !important;
          overflow: visible !important;
        }

        .indiaistore-footer-link-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .indiaistore-footer-link-item {
          padding: 0;
          margin: 0;
        }

        .indiaistore-footer-link {
          font-size: 13px;
          color: #a1a1a6;
          text-decoration: none;
          transition: color 0.2s ease;
          display: inline-block;
          line-height: 1.45;
        }

        .indiaistore-footer-link:hover {
          color: #ffffff;
        }

        /* Bottom Section */
        .indiaistore-footer-bottom {
          margin-top: 40px;
          padding-top: 22px;
          border-top: 1px solid #262629;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .indiaistore-footer-bottom-links {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px 16px;
          padding: 0;
          margin: 0;
          list-style: none;
        }

        .indiaistore-footer-bottom-link {
          font-size: 12px;
          color: #86868b;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .indiaistore-footer-bottom-link:hover {
          color: #ffffff;
          text-decoration: underline;
        }

        .indiaistore-footer-copyright {
          font-size: 12px;
          color: #86868b;
          margin: 0;
          line-height: 1.5;
        }

        /* Tablet Responsive (769px to 1024px) */
        @media (max-width: 1024px) and (min-width: 769px) {
          .indiaistore-footer-grid {
            grid-template-columns: 1.4fr repeat(4, 1fr) !important;
            gap: 22px !important;
          }
          .indiaistore-footer-brand-col img {
            height: 80px !important;
          }
        }

        /* Mobile Responsive (<= 768px) */
        @media (max-width: 768px) {
          .indiaistore-footer {
            padding: 32px 0 96px !important;
            background: #000000 !important;
          }

          .indiaistore-footer-inner {
            padding: 0 18px !important;
          }

          /* Brand Section on Mobile */
          .indiaistore-footer-brand-col {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            margin-bottom: 22px !important;
            padding-bottom: 22px !important;
            border-bottom: 1px solid #262629 !important;
          }

          .indiaistore-footer-brand-col a {
            display: inline-flex !important;
            justify-content: center !important;
            align-items: center !important;
            margin: 0 auto !important;
            text-align: center !important;
          }

          .indiaistore-footer-brand-col img {
            height: 74px !important;
            max-width: 280px !important;
            width: auto !important;
            margin: 0 auto 14px auto !important;
            display: block !important;
            object-fit: contain !important;
            filter: brightness(0) invert(1) !important;
          }

          .indiaistore-footer-brand-tagline {
            font-size: 13px !important;
            line-height: 1.55 !important;
            color: #a1a1a6 !important;
            max-width: 360px !important;
            margin: 0 auto 12px auto !important;
            text-align: center !important;
          }

          .indiaistore-footer-trust-badge {
            background: #111113 !important;
            border-color: #2c2c2e !important;
            color: #ffffff !important;
            font-size: 11px !important;
            margin: 0 auto !important;
          }

          /* Mobile Grid becomes 1-column Accordion */
          .indiaistore-footer-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 0 !important;
            width: 100% !important;
          }

          .indiaistore-footer-col {
            border-bottom: 1px solid #262629 !important;
            width: 100% !important;
          }

          .indiaistore-footer-col-header {
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 14px 2px !important;
            margin: 0 !important;
            background: transparent !important;
            border: none !important;
            cursor: pointer !important;
            pointer-events: auto !important;
            text-align: left !important;
            outline: none !important;
            user-select: none !important;
            -webkit-tap-highlight-color: transparent !important;
          }

          .indiaistore-footer-col-title {
            font-size: 13px !important;
            font-weight: 600 !important;
            letter-spacing: 0.02em !important;
            text-transform: uppercase !important;
            color: #ffffff !important;
          }

          .indiaistore-footer-chevron {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            color: #a1a1a6 !important;
            transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), color 0.2s ease !important;
            width: 20px !important;
            height: 20px !important;
            flex-shrink: 0 !important;
          }

          .indiaistore-footer-chevron.open {
            transform: rotate(180deg) !important;
            color: #ffffff !important;
          }

          .indiaistore-footer-content {
            overflow: hidden !important;
            transition: max-height 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.25s ease !important;
            max-height: 0 !important;
            opacity: 0 !important;
            visibility: hidden !important;
          }

          .indiaistore-footer-content.open {
            max-height: 800px !important;
            opacity: 1 !important;
            visibility: visible !important;
            padding-bottom: 14px !important;
          }

          .indiaistore-footer-link-list {
            display: flex !important;
            flex-direction: column !important;
            gap: 2px !important;
          }

          .indiaistore-footer-link {
            font-size: 13.5px !important;
            line-height: 1.4 !important;
            color: #d2d2d7 !important;
            display: block !important;
            padding: 8px 6px !important;
            border-radius: 6px !important;
            transition: color 0.15s ease, background-color 0.15s ease !important;
          }

          .indiaistore-footer-link:active,
          .indiaistore-footer-link:hover {
            color: #ffffff !important;
            background-color: rgba(255, 255, 255, 0.08) !important;
          }

          /* Bottom Legal on Mobile */
          .indiaistore-footer-bottom {
            margin-top: 24px !important;
            padding-top: 18px !important;
            border-top: 1px solid #262629 !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 14px !important;
          }

          .indiaistore-footer-bottom-links {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 8px 14px !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .indiaistore-footer-bottom-link {
            font-size: 12px !important;
            color: #86868b !important;
            display: inline-block !important;
          }

          .indiaistore-footer-bottom-link:active {
            color: #ffffff !important;
          }

          .indiaistore-footer-copyright {
            font-size: 11.5px !important;
            color: #86868b !important;
            line-height: 1.6 !important;
            text-align: left !important;
          }
        }
      `}</style>

      <div className="indiaistore-footer-inner">
        {/* Main Grid */}
        <div className="indiaistore-footer-grid">
          
          {/* Column 1: Brand Info */}
          <div className="indiaistore-footer-brand-col">
            <Link to="/" className="indiaistore-footer-logo-link">
              <img 
                src="/iincept_footer_logo_white.png" 
                alt="iiNCEPT - Apple Authorised Platform" 
              />
            </Link>
            <p className="indiaistore-footer-brand-tagline">
              {footerData.brandTagline}
            </p>
            <div className="indiaistore-footer-trust-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2997ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Apple Authorised Resellers Across India</span>
            </div>
          </div>

          {/* Dynamic Section Columns (SHOP, BUSINESS, COMPANY, POLICIES...) */}
          {footerData.columns.map((col, idx) => {
            const isOpen = isSectionOpen(idx);
            return (
              <div key={idx} className="indiaistore-footer-col">
                <button
                  type="button"
                  onClick={() => toggleSection(idx)}
                  className="indiaistore-footer-col-header"
                  aria-expanded={isOpen}
                >
                  <span className="indiaistore-footer-col-title">{col.title}</span>
                  <span className={`indiaistore-footer-chevron ${isOpen ? 'open' : ''}`}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </span>
                </button>

                <div className={`indiaistore-footer-content ${isOpen ? 'open' : ''}`}>
                  <ul className="indiaistore-footer-link-list">
                    {col.links.map((link, lIdx) => (
                      <li key={lIdx} className="indiaistore-footer-link-item">
                        {link.url?.startsWith('http') ? (
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="indiaistore-footer-link"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link to={link.url || '/shop'} className="indiaistore-footer-link">
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}

        </div>

        {/* Bottom Legal & Copyright Section */}
        <div className="indiaistore-footer-bottom">
          <ul className="indiaistore-footer-bottom-links">
            {(footerData.bottomLinks || []).map((bLink, bIdx) => (
              <li key={bIdx}>
                {bLink.url?.startsWith('http') ? (
                  <a
                    href={bLink.url}
                    target="_blank"
                    rel="noreferrer"
                    className="indiaistore-footer-bottom-link"
                  >
                    {bLink.label}
                  </a>
                ) : (
                  <Link to={bLink.url} className="indiaistore-footer-bottom-link">
                    {bLink.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="indiaistore-footer-copyright">
            {footerData.copyrightText}
          </div>
        </div>

      </div>
    </footer>
  );
}

