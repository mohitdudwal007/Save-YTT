import React, { useState } from 'react';
import { MediaInfo } from '../types';
import { MediaResult } from './MediaResult';
import { LegalNotice } from './LegalNotice';
import { Search, X, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ConverterCard: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [media, setMedia] = useState<MediaInfo | null>(null);

  const handleClear = () => {
    setUrl('');
    setError(null);
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please paste an authorized media URL.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Media unavailable or invalid URL. Please ensure the link is public and authorized.');
        setIsAnalyzing(false);
        return;
      }

      setMedia(data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError('Processing failed. Please check your internet connection or URL and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-[700px] mx-auto px-4 pb-12">
      <AnimatePresence mode="wait">
        {media ? (
          <MediaResult
            key="media-result"
            media={media}
            onReset={() => {
              setMedia(null);
              setError(null);
            }}
          />
        ) : (
          <motion.div
            key="converter-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Centered Converter Card */}
            <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-sm p-4 sm:p-6 transition-all hover:border-zinc-300">
              <form onSubmit={handleAnalyze} className="space-y-4">
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-zinc-400 pointer-events-none">
                    <Search className="w-5 h-5" />
                  </div>

                  <input
                    type="text"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Paste YouTube link, Short, or Video ID for MP3"
                    disabled={isAnalyzing}
                    className="w-full pl-12 pr-28 py-3.5 sm:py-4 bg-zinc-50/50 hover:bg-zinc-50 focus:bg-white text-zinc-900 placeholder:text-zinc-400 text-sm sm:text-base rounded-xl border border-zinc-200 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all font-medium disabled:opacity-60"
                  />

                  {url && !isAnalyzing && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="absolute right-24 text-zinc-400 hover:text-zinc-700 p-1 rounded-md transition-colors cursor-pointer"
                      title="Clear URL"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isAnalyzing || !url.trim()}
                    className="absolute right-2 top-2 bottom-2 px-4 sm:px-5 bg-zinc-950 hover:bg-zinc-800 active:bg-black disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="hidden sm:inline">Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <span>Analyze</span>
                        <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Skeleton Loader during analysis */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-2xl border border-zinc-200/80 p-6 space-y-4 shadow-sm"
                >
                  <div className="flex items-center gap-3 text-xs font-medium text-zinc-600">
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />
                    <span>Analyzing media information...</span>
                  </div>
                  <div className="space-y-2.5 animate-pulse">
                    <div className="h-4 bg-zinc-100 rounded-md w-3/4" />
                    <div className="h-3 bg-zinc-100 rounded-md w-1/2" />
                    <div className="h-20 bg-zinc-100 rounded-xl w-full mt-4" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Banner */}
            <AnimatePresence>
              {error && !isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="bg-red-50/80 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-xs text-red-900"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-red-950">Unable to analyze URL</p>
                    <p className="mt-0.5 text-red-700 leading-relaxed">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Legal Notice */}
            <LegalNotice />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
