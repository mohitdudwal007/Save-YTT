import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="text-center pt-8 pb-6 sm:pt-14 sm:pb-8 px-4">
      {/* Eyebrow */}
      <span className="inline-block px-3 py-1 text-[11px] font-semibold tracking-widest text-zinc-500 uppercase bg-zinc-100 rounded-full border border-zinc-200/80 mb-5">
        YOUTUBE MP3 CONVERTER
      </span>

      {/* Headline */}
      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 max-w-xl mx-auto leading-[1.15]">
        YouTube to MP3.<br className="hidden sm:inline" /> Fast & Simple.
      </h1>

      {/* Subtitle */}
      <p className="mt-4 text-sm sm:text-base text-zinc-500 max-w-lg mx-auto font-normal leading-relaxed">
        Convert YouTube videos and Shorts into high quality MP3 audio files instantly.
      </p>
    </section>
  );
};
