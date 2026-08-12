export interface RapidApiMp3Result {
  title?: string;
  link?: string;
  duration?: number;
  author?: string;
  thumbnail?: string;
  status?: string;
  error?: string;
}

export interface MediaAnalysisResult {
  id: string;
  url: string;
  title: string;
  author: string;
  duration: number;
  durationFormatted: string;
  thumbnail?: string;
  source: string;
  qualities: Array<{
    id: string;
    label: string;
    format: 'mp3';
    quality: string;
    hasVideo: boolean;
    hasAudio: boolean;
    contentLength?: string;
  }>;
}

/**
 * Extract 11-character YouTube Video ID from various link formats
 */
export function extractYouTubeId(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/i
  );
  return match ? match[1] : null;
}

/**
 * Format duration in seconds to HH:MM:SS or MM:SS
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return 'Audio Track';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Helper to parse various duration formats (string HH:MM:SS, number in seconds, etc.)
 */
function parseDuration(val: any): number {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const str = String(val).trim();
  const parts = str.split(':').map(Number);
  if (parts.length === 3 && !parts.some(isNaN)) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2 && !parts.some(isNaN)) return parts[0] * 60 + parts[1];
  const parsedInt = parseInt(str, 10);
  return isNaN(parsedInt) ? 0 : parsedInt;
}

/**
 * Check if a string looks like a RapidAPI key (e.g. 5b7ed79f74mshd...) rather than a domain name
 */
function isRapidApiKeyFormat(str: string | undefined): boolean {
  if (!str) return false;
  const s = str.trim();
  return !s.includes('.') && s.length >= 20;
}

/**
 * Check if a string looks like a valid domain hostname (e.g. youtube-mp37.p.rapidapi.com)
 */
function isValidHostnameFormat(str: string | undefined): boolean {
  if (!str) return false;
  const s = str.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
  return s.includes('.') && !isRapidApiKeyFormat(s);
}

const DEFAULT_RAPIDAPI_KEY = "22cc5c00d7mshd9d079e3d3b8168p156aebjsn1457a6a42801";
const DEFAULT_RAPIDAPI_HOST = "youtube-mp36.p.rapidapi.com";

/**
 * Get configured RapidAPI key from environment variables or fallback to provided key
 */
export function getRapidApiKey(): string {
  const envVars = [
    process.env.RAPIDAPI_KEY,
    process.env.RAPID_API_KEY,
    process.env.X_RAPIDAPI_KEY,
    process.env.RAPIDAPI_HOST,
    process.env.RAPID_API_HOST,
  ];

  for (const v of envVars) {
    if (v && v.trim().length > 0) {
      const trimmed = v.trim();
      if (isRapidApiKeyFormat(trimmed)) {
        return trimmed;
      }
    }
  }

  return DEFAULT_RAPIDAPI_KEY;
}

/**
 * Get configured RapidAPI host from environment variables or fallback to youtube-mp37.p.rapidapi.com
 */
export function getRapidApiHost(): string {
  const envVars = [
    process.env.RAPIDAPI_HOST,
    process.env.RAPID_API_HOST,
    process.env.X_RAPIDAPI_HOST,
  ];

  for (const v of envVars) {
    if (v && isValidHostnameFormat(v)) {
      return v.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    }
  }

  return DEFAULT_RAPIDAPI_HOST;
}

/**
 * Fetch MP3 download link from RapidAPI using x-rapidapi-key and x-rapidapi-host
 */
export async function getMp3FromRapidApi(videoUrlOrId: string): Promise<RapidApiMp3Result> {
  const apiKey = getRapidApiKey();
  const videoId = extractYouTubeId(videoUrlOrId);

  if (!videoId) {
    return {
      error: 'Invalid YouTube link or Video ID provided.',
    };
  }

  const primaryHost = getRapidApiHost();
  const fullYtUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const hostCandidates = Array.from(
    new Set([
      primaryHost,
      'youtube-mp37.p.rapidapi.com',
      'youtube-mp36.p.rapidapi.com',
      'youtube-mp3-downloader.p.rapidapi.com',
    ])
  );

  let lastError = 'RapidAPI endpoint did not return a valid MP3 download URL.';

  for (let attempt = 1; attempt <= 2; attempt++) {
    for (const host of hostCandidates) {
      // Prioritize /dl?id= and /get?id= endpoints as requested by RapidAPI snippet
      const candidateUrls = [
        `https://${host}/dl?id=${videoId}`,
        `https://${host}/get?id=${videoId}`,
        `https://${host}/fetch?id=${videoId}`,
        `https://${host}/download?id=${videoId}`,
        `https://${host}/?id=${videoId}`,
      ];

      for (const url of candidateUrls) {
        try {
          console.log(`[RapidAPI MP3] Requesting GET ${url} (x-rapidapi-host: ${host})`);
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'x-rapidapi-key': apiKey,
              'x-rapidapi-host': host,
              'Content-Type': 'application/json',
              'Accept': 'application/json, text/html, */*',
            },
          });

          if (!response.ok) {
            const errStatus = response.status;
            if (errStatus === 401 || errStatus === 403) {
              console.warn(`[RapidAPI MP3] Status ${errStatus} for host ${host}`);
              break;
            }
            console.warn(`[RapidAPI MP3] Endpoint returned HTTP ${errStatus} for ${url}`);
            continue;
          }

          const rawText = await response.text();

          // 1. Parse JSON response if valid
          if (rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
            try {
              const data = JSON.parse(rawText);
              console.log(`[RapidAPI MP3] JSON payload from ${host}:`, JSON.stringify(data).slice(0, 200));

              const downloadUrl =
                data.link ||
                data.downloadUrl ||
                data.download_url ||
                data.url ||
                data.dlink ||
                (data.result && (data.result.link || data.result.downloadUrl || data.result.download_url || data.result.url)) ||
                (data.data && (data.data.link || data.data.downloadUrl || data.data.download_url || data.data.url));

              if (downloadUrl && typeof downloadUrl === 'string' && downloadUrl.startsWith('http')) {
                const title =
                  data.title ||
                  (data.result && data.result.title) ||
                  (data.data && data.data.title) ||
                  `YouTube_Audio_${videoId}`;

                const durationRaw =
                  data.duration ||
                  (data.result && data.result.duration) ||
                  (data.data && data.data.duration);

                const author =
                  data.uploader ||
                  data.author ||
                  data.artist ||
                  (data.result && (data.result.uploader || data.result.author)) ||
                  'YouTube Creator';

                return {
                  title,
                  link: downloadUrl,
                  duration: parseDuration(durationRaw),
                  author,
                  status: 'success',
                };
              }

              if (data.status === 'processing' || data.status === 'in_progress') {
                await new Promise((resolve) => setTimeout(resolve, 1500));
                break;
              }

              if (data.msg || data.error || data.message) {
                lastError = data.msg || data.error || data.message;
              }
            } catch (err: any) {
              console.warn(`[RapidAPI MP3] JSON parse error:`, err.message);
            }
          }

          // 2. Parse window.location.replace script redirect if returned
          const match = rawText.match(/window\.location\.replace\(([\x27\x22])([^\x27\x22]+)\1\)/);
          if (match && match[2] && match[2].startsWith('http')) {
            const redirectUrl = match[2];
            console.log(`[RapidAPI MP3] Extracted redirect URL from script:`, redirectUrl.slice(0, 100));

            return {
              title: `YouTube_Audio_${videoId}`,
              link: redirectUrl,
              duration: 0,
              author: 'YouTube Creator',
              status: 'success',
            };
          }
        } catch (err: any) {
          console.warn(`[RapidAPI MP3] Request warning for ${url}:`, err.message || err);
          lastError = err.message || 'Failed to connect to RapidAPI service.';
        }
      }
    }
  }

  return {
    error: lastError || 'RapidAPI YouTube MP3 service is currently processing or unavailable for this video.',
  };
}

/**
 * Fetch metadata for YouTube video using YouTube oEmbed
 */
export async function analyzeYouTubeMedia(targetUrlOrId: string): Promise<MediaAnalysisResult> {
  const videoId = extractYouTubeId(targetUrlOrId);
  if (!videoId) {
    throw new Error('Please provide a valid YouTube link or 11-character Video ID.');
  }

  const canonicalYtUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const defaultThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  let title = `YouTube MP3 Track (${videoId})`;
  let author = 'YouTube Creator';
  let duration = 0;
  let thumbnail = defaultThumbnail;

  try {
    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalYtUrl)}&format=json`
    );
    if (oembedRes.ok) {
      const oembedData: any = await oembedRes.json();
      if (oembedData.title) title = oembedData.title;
      if (oembedData.author_name) author = oembedData.author_name;
      if (oembedData.thumbnail_url) thumbnail = oembedData.thumbnail_url;
    }
  } catch (err) {
    console.warn('[RapidAPI MP3] oEmbed metadata check warning:', err);
  }

  const durationSec = duration || 0;

  const qualities = [
    {
      id: 'audio-320',
      label: 'Audio High Quality (320 kbps MP3)',
      format: 'mp3' as const,
      quality: '320kbps',
      hasVideo: false,
      hasAudio: true,
      contentLength: durationSec ? `~${Math.round((durationSec * 0.4) / 10)} MB` : undefined,
    },
  ];

  return {
    id: videoId,
    url: canonicalYtUrl,
    title,
    author,
    duration: durationSec,
    durationFormatted: formatDuration(durationSec),
    thumbnail,
    source: 'RapidAPI YouTube MP3',
    qualities,
  };
}
