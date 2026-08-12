export type PageView = 'home' | 'terms' | 'privacy';

export type MediaFormat = 'mp3';

export interface QualityOption {
  id: string;
  label: string;
  format: MediaFormat;
  quality: string;
  hasVideo: boolean;
  hasAudio: boolean;
  contentLength?: string;
}

export interface MediaInfo {
  id: string;
  url: string;
  title: string;
  author: string;
  duration: number;
  durationFormatted: string;
  thumbnail?: string;
  source: string;
  qualities: QualityOption[];
}

export type DownloadStatus = 'idle' | 'analyzing' | 'ready' | 'processing' | 'downloading' | 'completed' | 'error';

export interface DownloadProgress {
  status: DownloadStatus;
  percentage: number;
  message: string;
  error?: string;
}
