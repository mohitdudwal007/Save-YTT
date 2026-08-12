# Save YT - Authorized Media Processing Backend

Save YT is a high-performance, minimalist web application for authorized media processing and conversion (MP4 video and MP3 audio). It utilizes server-side `yt-dlp` and `FFmpeg` binaries running on Python 3.11+ to extract and transcode media.

---

## Server Requirements & Tool Setup

Save YT relies on server-side binaries and runtimes:
1. **Python 3.11+** (Required runtime environment for yt-dlp)
2. **yt-dlp** (Media extraction & format resolution)
3. **FFmpeg & FFprobe** (Media transcoding to MP4/MP3)

---

### Installing Dependencies

#### Ubuntu / Debian Linux
```bash
# Update and install Python 3.11 and FFmpeg
sudo apt-get update
sudo apt-get install -y python3.11 python3.11-venv ffmpeg

# Install yt-dlp binary into ./bin or /usr/local/bin
mkdir -p ./bin
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ./bin/yt-dlp
chmod +x ./bin/yt-dlp
```

#### macOS (Homebrew)
```bash
brew install python@3.11 ffmpeg yt-dlp
```

#### Windows
1. Install Python 3.11+ from [python.org](https://www.python.org/downloads/).
2. Download `ffmpeg.exe` and `ffprobe.exe` from [FFmpeg Official Site](https://ffmpeg.org/download.html) and add to PATH or `./bin/`.
3. Download `yt-dlp.exe` from [yt-dlp Releases](https://github.com/yt-dlp/yt-dlp/releases) into `./bin/yt-dlp.exe`.

---

## Environment Variables Configuration

Override default detection paths by setting environment variables in `.env` or system environment:

```env
# Path to yt-dlp executable
YTDLP_PATH="./bin/yt-dlp"

# Path to FFmpeg executable
FFMPEG_PATH="/usr/bin/ffmpeg"

# Path to FFprobe executable
FFPROBE_PATH="/usr/bin/ffprobe"

# Path to Python 3.11 executable
PYTHON_PATH="/usr/bin/python3.11"
```

---

## Backend Startup Tool Detection

When the backend server boots up, it automatically verifies that `yt-dlp`, `FFmpeg`, and `Python 3.11+` are present and executable.

- Startup log example:
  ```text
  [Save YT] Startup Media Tools Check: All required server media tools detected: yt-dlp (/app/bin/yt-dlp), ffmpeg (/usr/bin/ffmpeg), ffprobe (/usr/bin/ffprobe), python (Python 3.11.2).
  ```
- Health Check endpoint: `/api/health` returns status and tool readiness object.

---

## Authorized Use & Security Policy
- `yt-dlp` and `FFmpeg` execute strictly server-side. Executables and credentials are never exposed to the frontend.
- Captcha, anti-bot challenges, DRM, paywalls, or protected streams are respected. If a media source is restricted or protected, the backend returns a clear error response (`422 Unprocessable Entity` or `403 Forbidden`).
- All processed temporary files are immediately cleaned up after streaming finishes.
