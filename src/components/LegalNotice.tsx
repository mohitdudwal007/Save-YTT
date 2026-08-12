import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const LegalNotice: React.FC = () => {
  return (
    <div className="mt-6 text-center flex items-center justify-center gap-2 text-xs text-zinc-400 max-w-md mx-auto">
      <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
      <span>Only download or convert media that you own or have permission to use.</span>
    </div>
  );
};
