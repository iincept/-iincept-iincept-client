import React, { useState, useEffect } from 'react';
import axiosClient from '../services/axiosClient';

export default function Contact() {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullname || !email || !message) {
      alert('Please fill in all required fields.');
      return;
    }
    setLoading(true);

    // Save to admin database backend
    try {
      await axiosClient.post('/enquiries', {
        fullName: fullname,
        email: email,
        companyName: company || 'iincept Customer',
        phone: phone || 'N/A',
        productInterest: 'Contact Support Enquiry',
        quantity: 1,
        message: message
      });
    } catch (err) {
      console.log('Enquiry save notice:', err);
    }

    // Format WhatsApp message payload
    const whatsappText = `Hi iincept Support Team,\n\nI am sending an enquiry via website Contact Form:\n• *Full Name:* ${fullname}\n• *Email:* ${email}\n• *Phone:* ${phone || 'N/A'}\n• *Company:* ${company || 'N/A'}\n• *Message:* ${message}`;
    const whatsappUrl = `https://wa.me/919971002348?text=${encodeURIComponent(whatsappText)}`;

    // Open WhatsApp in new window
    window.open(whatsappUrl, '_blank');

    setSubmitted(true);
    setLoading(false);
    setFullname('');
    setEmail('');
    setPhone('');
    setCompany('');
    setMessage('');
  };

  return (
    <div className="contact-page-root">
      <style>{`
        :root{
          --text:#1d1d1f;
          --text-secondary:#6e6e73;
          --border:#e5e5ea;
          --surface:#ffffff;
          --field-bg:#f5f5f7;
          --font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Inter", "Segoe UI", sans-serif;
        }
        .contact-page-root {
          font-family: var(--font);
          -webkit-font-smoothing: antialiased;
          background: #ffffff;
          color: var(--text);
          padding: 48px 24px 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 80vh;
        }

        .contact-hero-header {
          max-width: 800px;
          margin: 0 auto 44px;
          text-align: center;
          padding: 0 16px;
        }
        .contact-pill-tag {
          display: inline-block;
          padding: 7px 20px;
          background: #f5f5f7;
          border: 1px solid #e5e5ea;
          border-radius: 980px;
          font-size: 14px;
          font-weight: 700;
          color: #1d1d1f;
          margin-bottom: 22px;
          letter-spacing: -0.01em;
          box-shadow: 0 2px 8px rgba(0,0,0,.02);
        }
        .contact-main-title {
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 800;
          color: #1d1d1f;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin: 0 0 6px;
        }
        .contact-sub-title {
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 800;
          color: #1d1d1f;
          letter-spacing: -0.02em;
          line-height: 1.15;
          margin: 0 0 16px;
        }
        .contact-description {
          font-size: 15.5px;
          color: #6e6e73;
          line-height: 1.6;
          max-width: 640px;
          margin: 0 auto;
        }

        .contact-wrap{
          width: 100%;
          max-width: 1180px;
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: 28px;
        }
        @media (max-width: 900px){
          .contact-wrap{ grid-template-columns: 1fr; }
        }

        /* ---------- LEFT: info cards ---------- */
        .info-col{
          display: flex;
          flex-direction: column;
          gap: 20px;
          text-align: left;
        }
        .info-card{
          display: flex;
          gap: 18px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 24px;
        }
        .info-icon{
          flex: 0 0 auto;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: var(--field-bg);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .info-icon svg{ width: 22px; height: 22px; color: var(--text); stroke-width: 2; }

        .info-label{
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin: 2px 0 8px;
        }
        .info-line{
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          line-height: 1.5;
          margin: 0;
        }
        .info-sub{
          font-size: 14.5px;
          font-weight: 400;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-top: 2px;
          margin-bottom: 0;
        }

        /* ---------- RIGHT: form ---------- */
        .form-card{
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 22px;
          padding: 36px 40px;
          text-align: left;
        }
        .form-title{
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.01em;
          margin: 0 0 8px;
          color: var(--text);
        }
        .form-subtitle{
          font-size: 15px;
          color: var(--text-secondary);
          margin: 0 0 28px;
          line-height: 1.5;
        }

        .form-grid{
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px 20px;
          margin-bottom: 20px;
        }
        @media (max-width: 560px){
          .form-grid{ grid-template-columns: 1fr; }
          .form-card{ padding: 24px 20px; }
        }

        .field label{
          display: block;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 8px;
        }
        .field input,
        .field textarea{
          width: 100%;
          box-sizing: border-box;
          font-family: var(--font);
          font-size: 14.5px;
          color: var(--text);
          background: var(--field-bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 13px 15px;
          outline: none;
          transition: border-color .15s, background .15s;
        }
        .field input::placeholder,
        .field textarea::placeholder{ color: #9a9a9e; }
        .field input:focus,
        .field textarea:focus{
          border-color: #1d1d1f;
          background: #fff;
        }
        .field textarea{
          resize: vertical;
          min-height: 130px;
          line-height: 1.5;
        }
        .field.full{ grid-column: 1 / -1; }

        .btn-send{
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 15px 30px;
          border: none;
          border-radius: 980px;
          background: #1d1d1f;
          color: #fff;
          font-family: var(--font);
          font-size: 15px;
          font-weight: 650;
          cursor: pointer;
          transition: transform .15s ease, background .15s ease;
        }
        .btn-send:hover{
          background: #000;
          transform: translateY(-1px);
        }
        .btn-send:disabled{
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-send svg{ width: 16px; height: 16px; }

        .success-box {
          padding: 24px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 16px;
          color: #166534;
          margin-bottom: 20px;
        }
        .contact-map-card {
          width: 100%;
          max-width: 1180px;
          margin-top: 36px;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 22px;
          padding: 24px;
          text-align: left;
          box-sizing: border-box;
        }
        .map-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 16px;
        }
        .map-container {
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
        }
        .maps-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 850px){
          .maps-grid { grid-template-columns: 1fr; }
        }
        .map-location-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 12px;
        }
      `}</style>

      {/* Top Hero Heading Header */}
      <div className="contact-hero-header">
        <h1 className="contact-main-title">Contact Us</h1>
        <h2 className="contact-sub-title">We'd love to hear from you! Let's get in touch.</h2>
        <p className="contact-description">
          We're here to support your procurement end-to-end. Reach out by phone, email, or drop us a message—our customer success team responds within 24 hours.
        </p>
      </div>

      <div className="contact-wrap">

        {/* LEFT: info cards */}
        <div className="info-col">
          <div className="info-card">
            <span className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 6 10-6"/></svg>
            </span>
            <div>
              <p className="info-label">Email us</p>
              <p className="info-line">connect@iincept.com</p>
              <p className="info-sub">support@iincept.com</p>
            </div>
          </div>

          <div className="info-card">
            <span className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </span>
            <div>
              <p className="info-label">Call us</p>
              <p className="info-line">+91 99710 02348</p>
              <p className="info-sub">Mon–Sat · 10:00AM – 6:00PM IST</p>
            </div>
          </div>

          <div className="info-card">
            <span className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </span>
            <div>
              <p className="info-label">Visit us</p>
              <p className="info-line">Delhi Office</p>
              <p className="info-sub">109, Kushal House, Bazar 32-33, Nehru Place, New Delhi 110019</p>
              <p className="info-line" style={{ marginTop: '14px' }}>Gurugram Office</p>
              <p className="info-sub">Second floor, Plot No - 129P, Sector 39, Gurugram, Haryana 122003</p>
            </div>
          </div>
        </div>

        {/* RIGHT: form */}
        <div className="form-card">
          <h2 className="form-title">Send us a message</h2>
          <p className="form-subtitle">Fill out the form and we'll get back within 24 hours.</p>

          {submitted && (
            <div className="success-box">
              <h4 style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '15px' }}>✓ Message Received</h4>
              <p style={{ margin: 0, fontSize: '13.5px' }}>Thank you! Our support desk team will get back to you within 24 hours.</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="fullname">Full Name *</label>
                <input 
                  type="text" 
                  id="fullname" 
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="John Carter" 
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="email">Email Address *</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com" 
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input 
                  type="text" 
                  id="phone" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765XXXXX" 
                />
              </div>
              <div className="field">
                <label htmlFor="company">Company</label>
                <input 
                  type="text" 
                  id="company" 
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="iincept B2B Partner" 
                />
              </div>
              <div className="field full">
                <label htmlFor="message">Tell us more *</label>
                <textarea 
                  id="message" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share any specifics or requirements..." 
                  required
                ></textarea>
              </div>
            </div>

            <button type="submit" className="btn-send" disabled={loading}>
              {loading ? 'Sending...' : 'Send message'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
          </form>
        </div>

      </div>

      {/* Google Maps Section - Dual Office Locations */}
      <div className="contact-map-card">
        <div className="maps-grid">
          <div className="map-item">
            <h4 className="map-location-title">📍 Office 1</h4>
            <div className="map-container">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224685.33903933124!2d77.06795769556184!3d28.367663651415853!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce35554210a31%3A0xdd6ef47c87c2cb91!2sIINCEPT!5e0!3m2!1sen!2sin!4v1788510058256!5m2!1sen!2sin" 
                width="100%" 
                height="380" 
                style={{ border: 0, borderRadius: '16px' }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="strict-origin-when-cross-origin"
                title="IINCEPT Office 1 Map"
              ></iframe>
            </div>
          </div>

          <div className="map-item">
            <h4 className="map-location-title">📍 Office 2</h4>
            <div className="map-container">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3508.117554225429!2d77.0420963832692!3d28.445872530067376!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d196ec57e0ff7%3A0x328aaa29f17e8a9b!2sIINCEPT!5e0!3m2!1sen!2sin!4v1788510164195!5m2!1sen!2sin" 
                width="100%" 
                height="380" 
                style={{ border: 0, borderRadius: '16px' }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="strict-origin-when-cross-origin"
                title="IINCEPT Office 2 Map"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
