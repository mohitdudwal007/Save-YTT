import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Trash2 } from 'lucide-react';
import { PageView } from '../types';

interface PrivacyPageProps {
  setActivePage: (page: PageView) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ setActivePage }) => {
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
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest block mb-2">Data Protection</span>
        <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-zinc-500 mt-2">Last updated: August 2026</p>
      </div>

      <div className="space-y-8 text-sm text-zinc-600 leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-zinc-900 mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-zinc-900" />
            1. Zero Media Retention Policy
          </h2>
          <p>
            Save YT operates on a strict ephemeral architecture. We do not maintain databases of user activity, conversion history, or downloaded media files.
          </p>
          <p className="mt-2">
            When you request a media stream, chunks are processed in-memory or in volatile temporary storage and immediately piped directly to your client browser. All temporary buffer fragments are automatically purged instantly upon stream completion.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-zinc-900 mb-3 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-zinc-900" />
            2. No Tracking Cookies or Third-Party Analytics
          </h2>
          <p>
            We do not use advertising cookies, tracking pixels, or third-party profiling scripts. Your browsing session remains strictly private and untracked.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-zinc-900 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-zinc-900" />
            3. Server Logs & Rate Limit Logs
          </h2>
          <p>
            Transient server IP hashes are kept temporarily in active memory solely for rate-limiting and preventing automated denial-of-service abuse. These memory logs automatically rotate and expire within minutes.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-zinc-900 mb-3 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-zinc-900" />
            4. User Rights & Inquiries
          </h2>
          <p>
            Because we do not collect or store personal accounts, email addresses, or persistent user logs, there is no personal data stored on our servers to export or delete.
          </p>
        </section>
      </div>
    </div>
  );
};
