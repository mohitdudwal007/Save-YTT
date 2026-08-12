import express, { Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  extractYouTubeId,
  getRapidApiKey,
  getRapidApiHost,
  getMp3FromRapidApi,
  analyzeYouTubeMedia,
} from './server/rapidApiService.ts';
import {
  syncSecretsToFirebase,
  logConversionToFirestore,
  getRecentConversionsFromFirestore
} from './server/firebaseDb.ts';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Trust reverse proxy headers (required behind Cloud Run / Nginx)
app.set('trust proxy', true);

app.use(cors());
app.use(express.json());

// Basic Rate Limiters
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, default: false },
  message: { error: 'Too many requests, please try again after a few minutes.' },
});

const convertLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, default: false },
  message: { error: 'Conversion limit reached. Please wait a few minutes.' },
});

app.use('/api/', apiLimiter);

// Helper: Sanitize Filename
function sanitizeFilename(filename: string): string {
  return (
    filename
      .replace(/[^a-zA-Z0-9_\-\.\s]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 80) || 'SaveYT_Audio'
  );
}

// API Health Check
app.get('/api/health', (req: Request, res: Response) => {
  const apiKey = getRapidApiKey();
  const apiHost = getRapidApiHost();

  res.json({
    status: 'ok',
    service: 'Save YT RapidAPI Backend',
    engine: 'RapidAPI YouTube MP3 (x-rapidapi-key)',
    hasApiKey: !!apiKey,
    rapidApiHost: apiHost,
    timestamp: new Date().toISOString(),
  });
});

// API: Analyze Media Link
app.post('/api/analyze', async (req: Request, res: Response) => {
  const { url: rawUrl } = req.body || {};

  if (!rawUrl || typeof rawUrl !== 'string') {
    return res.status(400).json({ error: 'Please provide a valid YouTube link or Video ID.' });
  }

  const videoId = extractYouTubeId(rawUrl);
  if (!videoId) {
    return res.status(400).json({ error: 'Invalid YouTube link or Video ID provided.' });
  }

  try {
    const analysis = await analyzeYouTubeMedia(videoId);
    // Log conversion analyze event to Firebase
    logConversionToFirestore({
      videoId,
      title: analysis.title || 'YouTube Video',
      durationFormatted: analysis.durationFormatted
    }).catch(() => {});

    return res.json(analysis);
  } catch (err: any) {
    console.error('[Save YT] Analysis error:', err.message || err);
    return res.status(422).json({
      error: err.message || 'Unable to analyze YouTube video link.',
    });
  }
});

// API: Stream MP3 Download from RapidAPI
app.get('/api/download', convertLimiter, async (req: Request, res: Response) => {
  const rawUrl = req.query.url as string;
  const customTitle = (req.query.title as string) || 'SaveYT_MP3';

  if (!rawUrl || typeof rawUrl !== 'string') {
    return res.status(400).json({ error: 'Please provide a valid YouTube URL or Video ID.' });
  }

  const videoId = extractYouTubeId(rawUrl);
  if (!videoId) {
    return res.status(400).json({ error: 'Invalid YouTube link or Video ID.' });
  }

  const apiKey = getRapidApiKey();
  if (!apiKey) {
    return res.status(503).json({
      error: 'RAPIDAPI_KEY is not configured on the server. Please add your RAPIDAPI_KEY in Environment Variables / Secrets.',
    });
  }

  const safeFilename = sanitizeFilename(customTitle);

  try {
    console.log(`[Save YT] Requesting RapidAPI MP3 for video ID: ${videoId}`);
    const rapidResult = await getMp3FromRapidApi(videoId);

    if (rapidResult.error || !rapidResult.link) {
      return res.status(422).json({
        error: rapidResult.error || 'Failed to fetch MP3 audio stream from RapidAPI.',
      });
    }

    console.log(`[Save YT] RapidAPI MP3 download link obtained. Fetching audio stream...`);
    const streamRes = await fetch(rapidResult.link);

    if (!streamRes.ok || !streamRes.body) {
      return res.status(502).json({
        error: 'Failed to stream MP3 audio from RapidAPI download server.',
      });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.mp3"`);

    const contentLength = streamRes.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    const reader = (streamRes.body as any).getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        res.write(Buffer.from(value));
      }
    }

    return res.end();
  } catch (err: any) {
    console.error('[Save YT] RapidAPI Download streaming error:', err.message || err);
    if (!res.headersSent) {
      return res.status(500).json({
        error: err.message || 'Error occurred while streaming MP3 download.',
      });
    } else {
      return res.end();
    }
  }
});

// API: Recent Conversions from Firebase Firestore
app.get('/api/conversions', async (req: Request, res: Response) => {
  try {
    const conversions = await getRecentConversionsFromFirestore(15);
    return res.json({ conversions });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch conversion history.' });
  }
});

async function startServer() {
  const apiKey = getRapidApiKey();
  const apiHost = getRapidApiHost();

  console.log(`[Save YT] Starting server with RapidAPI MP3 engine.`);
  console.log(`[Save YT] Host: ${apiHost}`);
  console.log(`[Save YT] API Key status: ${apiKey ? 'Configured (Active)' : 'Missing (Needs RAPIDAPI_KEY env var)'}`);

  // Sync secrets safely to Firebase Firestore
  if (apiKey && apiHost) {
    syncSecretsToFirebase(apiKey, apiHost).catch(err => console.error('[Firebase Sync Error]', err));
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Save YT] RapidAPI MP3 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
