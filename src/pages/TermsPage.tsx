import React from 'react';
import { ArrowLeft, Shield, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { PageView } from '../types';

interface TermsPageProps {
  setActivePage: (page: PageView) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ setActivePage }) => {
  return (
    <div className="max-w-[760px] mx-auto px-4 py-10 sm:py-16">
      <button
        onClick={() => setActivePage('home')}
        className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-8 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Converter
      </button>

      <div className="border-b border-zinc-200 pb-6 mb-8">
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest block mb-2">Legal Terms</span>
        <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight">Terms of Service</h1>
        <p className="text-xs text-zinc-500 mt-2">Last updated: August 2026</p>
      </div>

      <div className="space-y-8 text-sm text-zinc-600 leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-zinc-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-zinc-900" />
            1. Authorized Use & Ownership Requirement
          </h2>
          <p>
            Save YT is provided strictly for personal use to convert and store media content that you personally own, create, or hold explicit written permission or legal license to convert and download.
          </p>
          <p className="mt-2">
            By utilizing this service, you explicitly affirm that you hold all necessary copyright permissions and rights for any URL submitted to our system.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-zinc-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-zinc-900" />
            2. Prohibited Content & Copyright Restrictions
          </h2>
          <p>You are strictly prohibited from using Save YT to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-zinc-600">
            <li>Convert, rip, or store copyrighted commercial media without authorization.</li>
            <li>Bypass Digital Rights Management (DRM), paywalls, or encrypted streaming technologies.</li>
            <li>Redistribute, sell, or commercially exploit converted media files.</li>
            <li>Automate bulk media scraping or perform denial-of-service activities against server infrastructure.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-zinc-900 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-zinc-900" />
            3. Technical Boundaries & Fair Usage Rate Limits
          </h2>
          <p>
            To maintain service availability for authorized users, Save YT enforces strict automated rate limits per IP address. Automated scripts, bots, or continuous polling are actively monitored and blocked.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-zinc-900 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-900" />
            4. Disclaimer of Warranty & Liability
          </h2>
          <p>
            Save YT is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. Save YT shall not be held liable for any misuse of converted media, loss of data, or third-party service interruptions.
          </p>
        </section>
      </div>
    </div>
  );
};
