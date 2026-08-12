import React from 'react';
import { PageView } from '../types';

interface FooterProps {
  setActivePage: (page: PageView) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActivePage }) => {
  return (
    <footer className="w-full mt-auto border-t border-zinc-200/60 py-10 bg-[#fafafa]">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <button
            onClick={() => setActivePage('home')}
            className="text-base font-bold tracking-tight text-zinc-900 hover:text-zinc-600 transition-colors cursor-pointer text-left"
          >
            Save YT
          </button>
          <p className="text-xs text-zinc-500 mt-1">Simple media conversion.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-xs text-zinc-500">
          <div className="flex gap-4">
            <button
              onClick={() => setActivePage('terms')}
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Terms
            </button>
            <button
              onClick={() => setActivePage('privacy')}
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Privacy
            </button>
          </div>
          <span className="text-zinc-400 font-mono text-[11px]">
            &copy; {new Date().getFullYear()} Save YT. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};
