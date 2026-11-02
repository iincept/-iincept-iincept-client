import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="about-page">
      <style>{`
        .about-page {
          --ink: #FFFFFF;
          --ink-2: #F5F5F7;
          --ink-3: #101012;
          --paper: #1D1D1F;
          --blue: #0071E3;
          --line: rgba(0,0,0,0.10);
          --muted: rgba(29,29,31,0.62);
          
          font-family: 'Inter', sans-serif;
          color: var(--paper);
          background: var(--ink);
          -webkit-font-smoothing: antialiased;
          padding-top: 40px;
          padding-bottom: 80px;
        }

        .about-page h1, .about-page h2, .about-page h3 {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          letter-spacing: -0.01em;
        }

        .about-page .hero {
          text-align: center;
          padding: 60px 0 40px;
          max-width: 800px;
          margin: 0 auto;
        }

        .about-page .hero h1 {
          font-size: clamp(36px, 6vw, 54px);
          line-height: 1.1;
          margin-bottom: 20px;
          color: var(--paper);
        }

        .about-page .hero p {
          font-size: clamp(16px, 2.5vw, 19px);
          line-height: 1.6;
          color: var(--muted);
        }

        .about-page .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          margin-top: 60px;
        }

        @media (max-width: 768px) {
          .about-page .grid-2 {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }

        .about-page .story-content h2 {
          font-size: 32px;
          line-height: 1.2;
          margin-bottom: 20px;
        }

        .about-page .story-content p {
          font-size: 15px;
          line-height: 1.7;
          color: var(--muted);
          margin-bottom: 20px;
        }

        .about-page .story-image {
          background: var(--ink-2);
          border-radius: 24px;
          padding: 40px;
          height: 380px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--line);
        }

        .about-page .badge-box {
          text-align: center;
          max-width: 280px;
        }

        .about-page .badge-box svg {
          margin-bottom: 16px;
        }

        .about-page .badge-box h3 {
          font-size: 18px;
          font-weight: 700;
          color: var(--paper);
          margin-bottom: 6px;
        }

        .about-page .badge-box p {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.4;
        }

        /* VALUE CARDS SECTION */
        .about-page .values-section {
          margin-top: 100px;
        }

        .about-page .values-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .about-page .values-header h2 {
          font-size: 36px;
          margin-bottom: 12px;
        }

        .about-page .values-header p {
          font-size: 16px;
          color: var(--muted);
        }

        .about-page .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
        }

        .about-page .value-card {
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 32px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          background: #fff;
        }

        .about-page .value-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.04);
        }

        .about-page .value-card .icon {
          font-size: 24px;
          margin-bottom: 20px;
          display: inline-block;
        }

        .about-page .value-card h3 {
          font-size: 19px;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--paper);
        }

        .about-page .value-card p {
          font-size: 14px;
          line-height: 1.6;
          color: var(--muted);
        }

        /* CTA BANNER */
        .about-page .cta-banner {
          background: var(--ink-3);
          border-radius: 24px;
          padding: 60px 40px;
          text-align: center;
          margin-top: 100px;
          color: #fff;
        }

        .about-page .cta-banner h2 {
          font-size: 32px;
          margin-bottom: 16px;
        }

        .about-page .cta-banner p {
          font-size: 16px;
          color: rgba(255,255,255,0.7);
          max-width: 580px;
          margin: 0 auto 32px;
          line-height: 1.6;
        }

        .about-page .btn {
          padding: 14px 28px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: transform .15s ease;
          text-decoration: none;
        }

        .about-page .btn:hover {
          transform: translateY(-1px);
        }

        .about-page .btn-light {
          background: #fff;
          color: var(--paper);
        }
      `}</style>

      {/* Hero Header */}
      <section className="hero">
        <h1>Sourcing Apple for Business. Sourced Right.</h1>
        <p>
          iincept is India's premier B2B platform built exclusively for procurement teams, IT managers, and enterprise buyers seeking genuine Apple products at volume.
        </p>
      </section>

      {/* Story Grid */}
      <section className="grid-2">
        <div className="story-content">
          <h2>Our Story</h2>
          <p>
            For years, commercial buyers struggled to purchase Apple devices through standard retail channels. Retail stores lacked consolidated billing, custom quoting desks, and the volume discount structures necessary for enterprise supply.
          </p>
          <p>
            iincept was founded to solve this problem. As an Apple Authorised Reseller, we bridge the gap between official Apple quality and professional business needs.
          </p>
          <p>
            Whether you are equipping a startup of ten or an enterprise of thousands, we deliver direct, authentic procurement solutions with structured tax compliance and logistics support.
          </p>
        </div>
        <div className="story-image">
          <div className="badge-box">
            <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto 16px' }}>
              <path d="M16 28C16 28 11.5 23.5 11.5 17.5C11.5 11.5 16.5 7 20 7C20 7 18 11.5 18 17.5C18 23.5 16 28 16 28Z" fill="#10B981" fillOpacity="0.85" />
              <path d="M24 28C24 28 28.5 23.5 28.5 17.5C28.5 11.5 23.5 7 20 7C20 7 22 11.5 22 17.5C22 23.5 24 28 24 28Z" fill="#34D399" fillOpacity="0.95" />
              <path d="M20 7V33" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <h3>Authorised Reseller</h3>
            <p>100% genuine Apple devices sourced directly through authorised channels, complete with full manufacturer warranty and service support.</p>
          </div>
        </div>
      </section>

      {/* Value Grid */}
      <section className="values-section">
        <div className="values-header">
          <h2>Why Procurement Teams Choose iincept</h2>
          <p>Dedicated enterprise features designed to streamline corporate IT budgets.</p>
        </div>
        <div className="values-grid">
          <div className="value-card">
            <span className="icon">🏢</span>
            <h3>GST Compliant Invoicing</h3>
            <p>Receive formal GST tax invoices on every purchase to claim input tax credits effortlessly on your company accounts.</p>
          </div>
          <div className="value-card">
            <span className="icon">🏷️</span>
            <h3>Volume Pricing</h3>
            <p>Benefit from bulk discounts on repeat purchases and large configurations. The larger the order, the lower the price per unit.</p>
          </div>
          <div className="value-card">
            <span className="icon">🚚</span>
            <h3>Pan-India Delivery</h3>
            <p>Unified logistics dispatch and real-time tracking across all locations in India, keeping your IT rollout on schedule.</p>
          </div>
          <div className="value-card">
            <span className="icon">🤵</span>
            <h3>Dedicated Account Desk</h3>
            <p>Work with an experienced account manager to handle customized procurement quotes, specifications, and consolidated billing.</p>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="cta-banner">
        <h2>Ready to source your team's next devices?</h2>
        <p>Get in touch with our B2B desk to request custom volume quotes or browse our current catalog with live stock status.</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/bulk-orders" className="btn btn-light">Request Bulk Quote</Link>
          <Link to="/accessories" className="btn" style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>Browse Catalogue</Link>
        </div>
      </section>
    </div>
  );
}
