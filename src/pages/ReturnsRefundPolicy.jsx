import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, ShieldAlert, CheckCircle2, FileCheck, ArrowLeft, RefreshCw, CreditCard } from 'lucide-react';

export default function ReturnsRefundPolicy() {
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
          <span className="text-zinc-900">Returns & Refund Policy</span>
        </div>

        {/* Hero Header */}
        <div className="border-b border-zinc-200 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold">
            <RotateCcw className="w-4 h-4" /> Hassle-Free Returns & Replacements
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            Returns & Refund Policy
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 max-w-2xl leading-relaxed">
            We stand behind every genuine Apple product we sell. Read our complete guideline regarding product returns, replacements, and refund processing.
          </p>
        </div>

        {/* Policy Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
              <RefreshCw className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-zinc-900 text-sm">7-Day Replacement</h3>
            <p className="text-xs text-zinc-500">Replacement support for DOA (Dead On Arrival) or damaged items.</p>
          </div>

          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
              <FileCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-zinc-900 text-sm">Apple Warranty</h3>
            <p className="text-xs text-zinc-500">1-Year Official Apple India warranty coverage across all Authorised Centers.</p>
          </div>

          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-zinc-900 text-sm">5-7 Day Refunds</h3>
            <p className="text-xs text-zinc-500">Direct refund clearance to your original payment mode post inspection.</p>
          </div>
        </div>

        {/* Detailed Guidelines */}
        <div className="space-y-6 text-sm text-zinc-700 leading-relaxed">
          
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> 1. Return Eligibility Window
            </h2>
            <p>
              We accept return and replacement requests within <strong>7 days</strong> of delivery under the following specific conditions:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-600 text-xs sm:text-sm">
              <li><strong>Damaged in Transit:</strong> Outer box or item damaged upon arrival (must be reported within 24 hours of delivery with unboxing video).</li>
              <li><strong>Wrong Item Shipped:</strong> Item received does not match the product listed on your order invoice.</li>
              <li><strong>Defective / Dead on Arrival (DOA):</strong> Device fails to power on upon initial unboxing.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" /> 2. Non-Returnable Conditions
            </h2>
            <p>
              To maintain product authenticity and safety for all customers, returns will NOT be accepted if:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-600 text-xs sm:text-sm">
              <li>Apple device has already been activated, linked to an Apple ID, or iCloud account logged in.</li>
              <li>Original manufacturer seals, serial number barcodes, or shrink wrap are tampered with or missing.</li>
              <li>Physical scratches, liquid ingress, or user misuse damage is detected.</li>
              <li>Accessories (cable, power adapter, documentation) included in the original box are missing.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-600" /> 3. How to Initiate a Return / Replacement
            </h2>
            <ol className="list-decimal pl-5 space-y-2 text-zinc-600 text-xs sm:text-sm">
              <li>
                <strong>Submit Request:</strong> Contact our dedicated desk via WhatsApp at <a href="https://wa.me/919971002348" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline">+91 99710 02348</a> or email support with your Order ID and photo/video proof.
              </li>
              <li>
                <strong>Reverse Pickup:</strong> Upon ticket approval, our logistics team will arrange a reverse pickup from your registered address at zero cost.
              </li>
              <li>
                <strong>Quality Inspection:</strong> Items undergo a 48-hour inspection at our central warehouse to verify serial numbers and seal condition.
              </li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-600" /> 4. Refund Processing & Timelines
            </h2>
            <p>
              Once your returned item passes inspection, refunds are processed immediately. The credited amount will reflect in your account according to your payment provider:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-600 text-xs sm:text-sm">
              <li><strong>Prepaid Orders (UPI, Credit/Debit Card, Netbanking):</strong> Refunded directly to original source account within 5 to 7 business days.</li>
              <li><strong>NEFT / Bank Transfer (B2B Orders):</strong> Refunded via NEFT to customer's corporate bank account within 3 business days.</li>
            </ul>
          </section>

        </div>

        {/* Support Callout */}
        <div className="p-6 bg-zinc-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base">Need help returning a device?</h3>
            <p className="text-xs text-zinc-400">Reach out to our customer resolution desk directly on WhatsApp.</p>
          </div>
          <a
            href="https://wa.me/919971002348?text=Hi%20iincept,%20I%20want%20to%20request%20a%20return/replacement."
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shrink-0"
          >
            Contact Desk
          </a>
        </div>

      </div>
    </div>
  );
}
