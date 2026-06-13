# Free Direct Streaming Setup (No Paid Services)

## Overview

Instead of using iframe embeds, we'll extract **direct m3u8/mp4 URLs** from free providers and play them in a custom HTML5 player. This gives you:

✅ No ads (you control the player)
✅ Better buffering (direct video URLs)
✅ Subtitles support
✅ Custom UI (seek, speed, quality)
✅ 100% free (no debrid needed)

## Architecture

```
User selects movie → Your backend scrapes providers → Returns m3u8 URL → Frontend plays in video.js/Plyr
```

---

## Step 1: Deploy Free Streaming API Backend

### Option A: Use Existing Free APIs (Fastest)

These are community-run free APIs that extract direct links:

#### 1. **Consumet API** (Movies, TV, Anime)
```bash
# Base URL
https://api.consumet.org/movies/flixhq

# Search
GET /movies/flixhq/search?query=Oppenheimer

# Get streaming links
GET /movies/flixhq/watch?episodeId={episodeId}&mediaId={mediaId}&server=vidcloud
```

#### 2. **VidSrc Resolver API** (GitHub Projects)
Multiple GitHub repos that extract m3u8 from VidSrc:

- `https://github.com/Ciarands/vidsrc-to-resolver`
- `https://github.com/JustABadWolf/vidsrc-api`
- `https://github.com/himanshu8443/8StreamApi`

### Option B: Build Your Own API (Full Control)

I'll create a simple Node.js scraper you can deploy for free.

#### Create `api/stream.ts` (Vercel/Next.js API Route)

```typescript
// api/stream/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tmdbId = searchParams.get('tmdbId');
  const type = searchParams.get('type'); // 'movie' or 'tv'
  const season = searchParams.get('season');
  const episode = searchParams.get('episode');

  if (!tmdbId || !type) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    // Try multiple sources
    const sources = await getStreamSources(tmdbId, type, season, episode);
    return NextResponse.json({ sources });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch streams' }, { status: 500 });
  }
}

async function getStreamSources(tmdbId: string, type: string, season?: string, episode?: string) {
  const sources = [];

  // Source 1: VidSrc (scrape)
  try {
    const vidsrcUrl = type === 'movie'
      ? `https://vidsrc.xyz/embed/movie/${tmdbId}`
      : `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}`;
    
    const m3u8 = await scrapeVidSrc(vidsrcUrl);
    if (m3u8) {
      sources.push({ quality: '1080p', url: m3u8, source: 'vidsrc' });
    }
  } catch (e) {
    console.error('VidSrc failed:', e);
  }

  // Source 2: Use Consumet API
  try {
    const consumetData = await fetchConsumet(tmdbId, type, season, episode);
    if (consumetData) {
      sources.push(...consumetData);
    }
  } catch (e) {
    console.error('Consumet failed:', e);
  }

  return sources;
}

// Scrape VidSrc embed for m3u8
async function scrapeVidSrc(embedUrl: string): Promise<string | null> {
  try {
    const response = await fetch(embedUrl);
    const html = await text();
    
    // Extract m3u8 from embed page
    const m3u8Match = html.match(/https?:\/\/[^\s"']+\.m3u8/);
    return m3u8Match ? m3u8Match[0] : null;
  } catch {
    return null;
  }
}

// Use Consumet FlixHQ
async function fetchConsumet(tmdbId: string, type: string, season?: string, episode?: string) {
  try {
    // Step 1: Search by TMDB ID
    const searchRes = await fetch(`https://api.consumet.org/movies/flixhq/${tmdbId}`);
    const searchData = await searchRes.json();
    
    if (!searchData || !searchData.id) return null;

    // Step 2: Get watch links
    const mediaId = searchData.id;
    const episodeId = type === 'tv' ? `${mediaId}?season=${season}&episode=${episode}` : mediaId;
    
    const watchRes = await fetch(`https://api.consumet.org/movies/flixhq/watch?episodeId=${episodeId}&mediaId=${mediaId}&server=vidcloud`);
    const watchData = await watchRes.json();

    if (watchData.sources && watchData.sources.length > 0) {
      return watchData.sources.map((s: any) => ({
        quality: s.quality || 'auto',
        url: s.url,
        source: 'flixhq'
      }));
    }

    return null;
  } catch {
    return null;
  }
}
```

---

## Step 2: Install Video Player (Frontend)

### Option 1: Plyr (Recommended)

```bash
npm install plyr-react
npm install hls.js
```

```tsx
// components/DirectVideoPlayer.tsx
import { useEffect, useRef } from 'react';
import Plyr from 'plyr-react';
import Hls from 'hls.js';
import 'plyr-react/plyr.css';

interface DirectVideoPlayerProps {
  streamUrl: string | null;
  title: string;
}

export default function DirectVideoPlayer({ streamUrl, title }: DirectVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (!streamUrl || !videoRef.current) return;

    // Check if it's m3u8 (HLS)
    if (streamUrl.includes('.m3u8')) {
      if (Hls.isSupported()) {
        hlsRef.current = new Hls();
        hlsRef.current.loadSource(streamUrl);
        hlsRef.current.attachMedia(videoRef.current);
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        videoRef.current.src = streamUrl;
      }
    } else {
      // Direct mp4
      videoRef.current.src = streamUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [streamUrl]);

  if (!streamUrl) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>🎬 Select a movie or TV show</h2>
        <p>Choose content from the browse or search panel</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', background: '#000' }}>
      <Plyr
        ref={videoRef}
        source={{
          type: 'video',
          title,
          sources: [{ src: streamUrl }],
        }}
        options={{
          controls: [
            'play-large',
            'play',
            'progress',
            'current-time',
            'duration',
            'mute',
            'volume',
            'settings',
            'pip',
            'airplay',
            'fullscreen',
          ],
          settings: ['captions', 'quality', 'speed'],
          quality: {
            default: 1080,
            options: [1080, 720, 480, 360],
          },
        }}
      />
    </div>
  );
}
```

### Option 2: Video.js (Alternative)

```bash
npm install video.js @videojs/http-streaming
```

```tsx
import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export default function VideoJSPlayer({ streamUrl }: { streamUrl: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const player = videojs(videoRef.current, {
      controls: true,
      fluid: true,
      responsive: true,
      sources: [{ src: streamUrl, type: 'application/x-mpegURL' }],
    });

    playerRef.current = player;

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [streamUrl]);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered" />
    </div>
  );
}
```

---

## Step 3: Update Your Frontend to Use Direct Streaming

### Update `page.tsx` to fetch from your API

```tsx
const handleMediaSelect = async (item: MediaItem) => {
  setSelectedMedia(item);
  setLoading(true);

  try {
    // Fetch direct stream URLs from your API
    const response = await fetch(`/api/stream?tmdbId=${item.id}&type=${item.type}`);
    const data = await response.json();

    if (data.sources && data.sources.length > 0) {
      // Use the best quality source
      const bestSource = data.sources[0];
      setCurrentUrl(bestSource.url);
      setCurrentTitle(item.title);
    } else {
      // Fallback to iframe embeds if scraping fails
      const streamServers = getStreamServers(item.id, item.type);
      setServers(streamServers);
      setCurrentUrl(streamServers[0].url);
    }
  } catch (error) {
    console.error('Failed to get direct stream:', error);
    // Fallback to embeds
  }

  setLoading(false);
};
```

---

## Step 4: Deploy Your API for Free

### Vercel (Easiest - Next.js)

1. Your API routes are already in Next.js (`/api/stream/route.ts`)
2. Push to GitHub
3. Import to Vercel
4. Done! Auto-deployed at `https://your-app.vercel.app`

### Railway (Alternative)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Render (Alternative)

1. Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

2. Push to GitHub
3. Connect to Render
4. Deploy

---

## Step 5: Add Subtitles (OpenSubtitles - Free)

```typescript
// Fetch subtitles
async function getSubtitles(tmdbId: number, type: string) {
  const response = await fetch(
    `https://api.opensubtitles.com/api/v1/subtitles?tmdb_id=${tmdbId}&type=${type}`,
    {
      headers: {
        'Api-Key': process.env.OPENSUBTITLES_API_KEY!,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();
  return data.data.map((sub: any) => ({
    label: sub.attributes.language,
    kind: 'captions',
    src: sub.attributes.url,
  }));
}

// Add to Plyr
<Plyr
  source={{
    sources: [{ src: streamUrl }],
    tracks: subtitles, // from getSubtitles()
  }}
/>
```

---

## Comparison: Iframe vs Direct Streaming

| Feature | Iframe Embeds | Direct M3U8/MP4 |
|---------|---------------|-----------------|
| Setup | ✅ Easy | ⚠️ Medium (need API) |
| Ads | ❌ Provider ads | ✅ None |
| Buffering | ❌ Slow providers | ✅ Fast (direct CDN) |
| Quality | ⚠️ 720p-1080p | ✅ Up to 4K |
| Player Control | ❌ None | ✅ Full custom |
| Subtitles | ⚠️ Limited | ✅ Full (OpenSubtitles) |
| Reliability | ❌ Providers die | ✅ More stable |
| Cost | ✅ Free | ✅ Free (no debrid) |

---

## Free Resources

### APIs to Use
- **Consumet FlixHQ**: `https://api.consumet.org/movies/flixhq`
- **VidSrc Scrapers**: Multiple GitHub repos (see search results)
- **OpenSubtitles**: `https://opensubtitles.com` (free API with registration)

### Video Players
- **Plyr**: https://plyr.io
- **Video.js**: https://videojs.com
- **hls.js**: https://github.com/video-dev/hls.js

### Free Hosting
- **Vercel**: https://vercel.com (Next.js, free tier)
- **Railway**: https://railway.app ($5 credit/month free)
- **Render**: https://render.com (free tier)
- **Fly.io**: https://fly.io (free tier)

---

## Example GitHub Projects (Free & Open Source)

Study these for inspiration:

1. **Movie-Web** (sudo-flix): https://github.com/movie-web/movie-web
2. **Consumet**: https://github.com/consumet/consumet.ts
3. **VidSrc API**: https://github.com/JustABadWolf/vidsrc-api
4. **8StreamApi**: https://github.com/himanshu8443/8StreamApi
5. **CloudStream**: https://github.com/recloudstream/cloudstream-extensions

All of these are 100% free and use direct streaming (no iframes, no debrid).

---

## Next Steps

1. ✅ Create `/api/stream/route.ts` in your Next.js app
2. ✅ Install `plyr-react` and `hls.js`
3. ✅ Replace `VideoPlayer` component with `DirectVideoPlayer`
4. ✅ Test with a movie (check Network tab for m3u8)
5. ✅ Deploy to Vercel (free)
6. ✅ Add OpenSubtitles API for captions

**Result**: Professional streaming app like Stremio, but 100% free!
