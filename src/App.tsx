import React, { useState } from 'react';
import { PageView } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { ConverterCard } from './components/ConverterCard';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';

export default function App() {
  const [activePage, setActivePage] = useState<PageView>('home');

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#09090b] flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
      {/* Top Navbar */}
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activePage === 'home' && (
          <div className="max-w-[900px] mx-auto">
            <Hero />
            <ConverterCard />
          </div>
        )}

        {activePage === 'terms' && <TermsPage setActivePage={setActivePage} />}

        {activePage === 'privacy' && <PrivacyPage setActivePage={setActivePage} />}
      </main>

      {/* Minimal Footer */}
      <Footer setActivePage={setActivePage} />
    </div>
  );
}
