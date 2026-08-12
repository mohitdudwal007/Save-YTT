import React from 'react';
import { PageView } from '../types';

interface NavbarProps {
  activePage: PageView;
  setActivePage: (page: PageView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, setActivePage }) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#fafafa]/80 backdrop-blur-md border-b border-zinc-200/60 transition-colors">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Wordmark */}
        <button
          onClick={() => setActivePage('home')}
          className="text-lg font-bold tracking-tight text-zinc-900 hover:text-zinc-600 transition-colors flex items-center gap-2 cursor-pointer focus:outline-none"
          aria-label="Save YT Home"
        >
          Save YT
        </button>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActivePage('home')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all cursor-pointer ${
              activePage === 'home'
                ? 'text-zinc-900 bg-zinc-200/70 font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/80'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActivePage('terms')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all cursor-pointer ${
              activePage === 'terms'
                ? 'text-zinc-900 bg-zinc-200/70 font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/80'
            }`}
          >
            Terms
          </button>
          <button
            onClick={() => setActivePage('privacy')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all cursor-pointer ${
              activePage === 'privacy'
                ? 'text-zinc-900 bg-zinc-200/70 font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/80'
            }`}
          >
            Privacy
          </button>
        </nav>
      </div>
    </header>
  );
};
