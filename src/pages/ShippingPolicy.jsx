import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, Clock, MapPin, PackageCheck, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ShippingPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-zinc-800">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          <Link to="/" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
          <span>/</span>
          <span className="text-zinc-900">Shipping Policy</span>
        </div>

        {/* Hero Header */}
        <div className="border-b border-zinc-200 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
            <Truck className="w-4 h-4" /> Pan-India Express Logistics
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            Shipping & Dispatch Policy
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 max-w-2xl leading-relaxed">
            We partner exclusively with tier-1 courier networks (Blue Dart, Delhivery, DTDC) to deliver genuine Apple products safely and swiftly across India.
          </p>
        </div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-zinc-900 text-sm">24-Hour Dispatch</h3>
            <p className="text-xs text-zinc-500">Orders placed before 2 PM are handed over to logistics partners same day.</p>
          </div>

          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-zinc-900 text-sm">Transit Insurance</h3>
            <p className="text-xs text-zinc-500">100% insured shipment against loss or damage during transit.</p>
          </div>

          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-zinc-900 text-sm">Real-Time Tracking</h3>
            <p className="text-xs text-zinc-500">Live SMS & WhatsApp updates from pickup till doorstep delivery.</p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6 text-sm text-zinc-700 leading-relaxed">
          
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-blue-600" /> 1. Shipping Charges & Free Delivery
            </h2>
            <p>
              We offer free standard shipping on all orders over ₹1,499. For orders under ₹1,499, a nominal flat delivery charge of ₹99 is applied at checkout.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-600 text-xs sm:text-sm">
              <li><strong>Standard Delivery:</strong> 2 to 5 business days for major metro cities.</li>
              <li><strong>Tier-2 & Regional Zones:</strong> 3 to 7 business days depending on location pin code.</li>
              <li><strong>Bulk/B2B Orders:</strong> Dedicated freight dispatch with scheduled delivery coordination.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" /> 2. Order Processing & Timelines
            </h2>
            <p>
              All orders are subject to verification and payment approval. Retail purchases placed on weekdays before 2:00 PM IST will be processed and dispatched on the same business day. Orders placed on Sundays or public holidays will be dispatched on the next business day.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" /> 3. Secure Delivery Verification
            </h2>
            <p>
              Due to the high-value nature of Apple devices and accessories, a <strong>One-Time Password (OTP)</strong> or physical receiver signature is mandatory upon delivery. 
            </p>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Important Inspection Note:</strong> Please inspect the outer box seal before accepting delivery. If the package appears tampered with or damaged, kindly refuse delivery and notify our support desk immediately at <a href="tel:+919971002348" className="underline font-semibold">+91 99710 02348</a>.
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900">4. Undeliverable Packages & Address Changes</h2>
            <p>
              If a package is returned to us due to an incorrect or incomplete shipping address provided by the customer, our team will reach out to verify credentials before re-shipping. Re-shipping charges may apply in cases of customer address entry errors.
            </p>
          </section>

        </div>

        {/* Support Banner */}
        <div className="p-6 bg-zinc-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base">Questions about your shipment?</h3>
            <p className="text-xs text-zinc-400">Our B2B logistics team is available Mon-Sat, 9:30 AM to 6:30 PM.</p>
          </div>
          <a
            href="https://wa.me/919971002348?text=Hi%20iincept,%20I%20have%20a%20question%20regarding%20shipping%20status."
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shrink-0"
          >
            Track on WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
}
