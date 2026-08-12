import React, { useState } from 'react';
import { MediaInfo, QualityOption, DownloadStatus } from '../types';
import { Download, Music, Check, RefreshCw, AlertTriangle, Clock, User, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MediaResultProps {
  media: MediaInfo;
  onReset: () => void;
}

export const MediaResult: React.FC<MediaResultProps> = ({ media, onReset }) => {
  const selectedFormat = 'mp3';
  
  // All available qualities for MP3
  const matchingQualities = media.qualities;
  const [selectedQualityId, setSelectedQualityId] = useState<string>(
    matchingQualities[0]?.id || 'audio-320'
  );

  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedQualityObj = media.qualities.find((q) => q.id === selectedQualityId) || matchingQualities[0];

  const handleDownload = async () => {
    setDownloadStatus('processing');
    setProgress(10);
    setStatusMessage('Connecting to MP3 audio stream...');
    setErrorMessage(null);

    const downloadUrl = `/api/download?url=${encodeURIComponent(media.url)}&format=mp3&quality=${selectedQualityObj?.quality || '320kbps'}&title=${encodeURIComponent(media.title)}`;

    try {
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        let errText = 'Failed to process MP3 audio download.';
        try {
          const errData = await response.json();
          errText = errData.error || errText;
        } catch {
          // fallback
        }
        setDownloadStatus('error');
        setErrorMessage(errText);
        return;
      }

      setStatusMessage('Downloading MP3 audio stream...');
      setProgress(30);

      const contentLength = response.headers.get('Content-Length');
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

      if (!response.body) {
        throw new Error('ReadableStream not supported in response body.');
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let receivedBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          receivedBytes += value.length;

          if (totalBytes > 0) {
            const pct = Math.min(95, Math.round((receivedBytes / totalBytes) * 90) + 10);
            setProgress(pct);
          } else {
            setProgress((prev) => Math.min(90, prev + 5));
          }
        }
      }

      setStatusMessage('Saving MP3 file to device...');
      setProgress(98);

      const blob = new Blob(chunks, { type: 'audio/mpeg' });
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;

      const safeTitle = media.title.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'SaveYT_Audio';
      a.download = `${safeTitle}.mp3`;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
      }, 1000);

      setProgress(100);
      setDownloadStatus('completed');
      setStatusMessage('MP3 download completed successfully!');
    } catch (err: any) {
      console.error('Download error:', err);
      setDownloadStatus('error');
      setErrorMessage(err?.message || 'Download failed. Please try again or check the YouTube link.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="bg-white rounded-2xl border border-zinc-200/90 shadow-sm p-6 sm:p-8 space-y-8"
    >
      {/* Media Info Section */}
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {media.thumbnail ? (
          <div className="w-full sm:w-44 h-28 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200/80 shrink-0 relative group">
            <img
              src={media.thumbnail}
              alt={media.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/75 backdrop-blur-md text-white text-[10px] font-mono rounded font-medium">
              {media.durationFormatted}
            </div>
          </div>
        ) : (
          <div className="w-full sm:w-44 h-28 rounded-xl bg-zinc-100 border border-zinc-200/80 shrink-0 flex items-center justify-center text-zinc-400 relative">
            <Music className="w-8 h-8 stroke-1" />
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-800 bg-zinc-100 border border-zinc-200/80 rounded">
              <Music className="w-3 h-3 text-zinc-600" />
              MP3 Audio Only
            </span>
            {media.durationFormatted && (
              <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                {media.durationFormatted}
              </span>
            )}
          </div>

          <h2 className="text-base sm:text-lg font-bold text-zinc-900 leading-snug truncate" title={media.title}>
            {media.title}
          </h2>

          <p className="text-xs text-zinc-500 flex items-center gap-1.5 truncate">
            <User className="w-3.5 h-3.5 text-zinc-400" />
            <span>{media.author}</span>
          </p>
        </div>
      </div>

      <div className="h-px bg-zinc-100 w-full" />

      {/* Quality Selector Section */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block">
          MP3 Audio Quality
        </label>

        <div className="grid grid-cols-1 gap-2.5">
          {matchingQualities.map((q) => (
            <div
              key={q.id}
              className="p-3.5 rounded-xl border border-zinc-900 bg-zinc-900 text-white font-medium shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold leading-none">{q.label}</p>
                <p className="text-[10px] mt-1 text-zinc-300">
                  Best Audio Quality ({q.quality})
                </p>
              </div>
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Error Message if Download fails */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3.5 bg-red-50 border border-red-200/80 rounded-xl flex items-start gap-3 text-red-800 text-xs"
          >
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold">Download Failed</p>
              <p className="mt-0.5 text-red-700 leading-normal">{errorMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress & Status Bar */}
      {(downloadStatus === 'processing' || downloadStatus === 'downloading' || downloadStatus === 'completed') && (
        <div className="space-y-2 bg-zinc-50 p-4 rounded-xl border border-zinc-200/70">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-700">
            <span>{statusMessage}</span>
            <span className="font-mono">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-zinc-900 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Action Download Button & Back Option */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloadStatus === 'processing' || downloadStatus === 'downloading'}
          className="w-full py-4 px-6 bg-zinc-950 hover:bg-zinc-800 active:bg-black disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer"
        >
          {downloadStatus === 'processing' || downloadStatus === 'downloading' ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{statusMessage || 'Preparing MP3 file...'}</span>
            </>
          ) : downloadStatus === 'completed' ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>MP3 Ready & Saved! Click to download again</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download MP3 Audio ({selectedQualityObj?.quality || '320kbps'})</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-zinc-200/80"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Search / Convert Another</span>
        </button>
      </div>
    </motion.div>
  );
};
