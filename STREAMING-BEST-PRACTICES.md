# Streaming Best Practices

## Current Setup (Iframe Embeds)

### ⚠️ Limitations
Your app uses **iframe embed providers** which have inherent issues:
- **No control over ads** — providers inject their own ads
- **Buffering** — depends entirely on provider's server speed
- **Unreliable** — providers go down frequently (see 2025 MPA/ACE takedowns)
- **Quality varies** — some providers only have 720p, others have 4K
- **No player customization** — you're stuck with their player UI

### ✅ What You Can Do (Current Approach)

#### 1. **Provider Rotation Strategy**
```typescript
// Already implemented: auto-switch on timeout/error
// Improvement: add health checks
```

#### 2. **Ping/Health Check Before Loading**
Add a lightweight health check to test providers before showing them:

```typescript
// In utils/tmdb.ts
export async function checkProviderHealth(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    return true;
  } catch {
    return false;
  }
}

// Filter servers by health before showing
const healthyServers = await Promise.all(
  servers.map(async (s) => ({
    ...s,
    healthy: await checkProviderHealth(s.url)
  }))
);
```

#### 3. **Multiple Simultaneous Sources**
Load 2-3 iframes in parallel and show whichever loads first:

```typescript
const [primaryUrl, backupUrl1, backupUrl2] = servers.slice(0, 3);
// Race them, show winner
```

#### 4. **User Quality Selection**
Let users pick quality tier (High/Medium/Low) to skip dead high-tier servers.

#### 5. **Provider Reputation System**
Track which providers work and prioritize them:

```typescript
// localStorage
const providerStats = {
  'vidsrcpk': { successes: 45, failures: 2, avgLoadTime: 1200 },
  'vidsrcin': { successes: 12, failures: 18, avgLoadTime: 3500 }
};
// Re-sort by success rate
```

---

## Approach 2: Direct Streaming (Like Stremio) 🏆

### How Stremio/Syncler Actually Work

They **don't use embed iframes**. Instead:

1. **Scrape torrent sources** (YTS, 1337x, RARBG mirrors)
2. **Send torrents to debrid service** (Real-Debrid, TorBox)
3. **Get direct HTTP link** from debrid (cached, high-speed)
4. **Play in native video player** (video.js, plyr.io, hls.js)

### Benefits
- ✅ **No ads** — you control the player
- ✅ **No buffering** — debrid servers are fast (CDN-level)
- ✅ **4K quality** — torrents have full quality
- ✅ **Full control** — custom UI, subtitles, seek, speed
- ✅ **Reliable** — debrid services have 99.9% uptime

### Architecture

```
User selects movie
    ↓
Your backend scrapes torrent sources (or uses TMDB → torrent API)
    ↓
Sends magnet link to Real-Debrid API
    ↓
Real-Debrid caches torrent → returns direct .mp4/.m3u8 link
    ↓
Your frontend plays link in <video> tag with hls.js
```

### Implementation Steps

#### 1. **Get Debrid Service**
- [Real-Debrid](https://real-debrid.com) — €3/month ($3.50)
- [TorBox](https://torbox.app) — $5/month
- [AllDebrid](https://alldebrid.com) — €3/month

#### 2. **Add Torrent Scraper**
Use an API or self-host:

**Option A: Use existing APIs**
- [Jackett](https://github.com/Jackett/Jackett) — self-hosted torrent indexer
- [Prowlarr](https://github.com/Prowlarr/Prowlarr) — indexer manager
- Manual scraping with Puppeteer

**Option B: Use community APIs**
```bash
# Example: YTS API (movies only)
GET https://yts.mx/api/v2/list_movies.json?query_term=Oppenheimer

# Returns torrents with quality, size, seeds
```

#### 3. **Add Debrid Integration**
```typescript
// Real-Debrid flow
async function getStreamUrl(magnetLink: string) {
  // 1. Add magnet to RD
  const { id } = await fetch('https://api.real-debrid.com/rest/1.0/torrents/addMagnet', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RD_API_KEY}` },
    body: new URLSearchParams({ magnet: magnetLink })
  }).then(r => r.json());

  // 2. Wait for caching (instant if already cached)
  await fetch(`https://api.real-debrid.com/rest/1.0/torrents/selectFiles/${id}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RD_API_KEY}` },
    body: 'files=all'
  });

  // 3. Get direct link
  const { links } = await fetch(`https://api.real-debrid.com/rest/1.0/torrents/info/${id}`, {
    headers: { 'Authorization': `Bearer ${RD_API_KEY}` }
  }).then(r => r.json());

  const { download } = await fetch(`https://api.real-debrid.com/rest/1.0/unrestrict/link`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RD_API_KEY}` },
    body: new URLSearchParams({ link: links[0] })
  }).then(r => r.json());

  return download; // Direct .mp4 or .mkv link
}
```

#### 4. **Replace iframe with video player**
```tsx
import Plyr from 'plyr-react';
import Hls from 'hls.js';

function VideoPlayer({ streamUrl }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    
    if (streamUrl.endsWith('.m3u8')) {
      // HLS streaming
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);
    } else {
      // Direct mp4
      videoRef.current.src = streamUrl;
    }
  }, [streamUrl]);

  return (
    <Plyr
      ref={videoRef}
      source={{ type: 'video', sources: [{ src: streamUrl }] }}
      options={{
        controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'],
        settings: ['quality', 'speed']
      }}
    />
  );
}
```

#### 5. **Add Subtitle Support**
Real-Debrid + OpenSubtitles API:

```typescript
// Get subtitles from OpenSubtitles
const subs = await fetch(`https://api.opensubtitles.com/api/v1/subtitles?tmdb_id=${tmdbId}`, {
  headers: { 'Api-Key': OPENSUBTITLES_KEY }
});

// Add to player
<Plyr
  source={{
    sources: [{ src: streamUrl }],
    tracks: subs.map(s => ({
      kind: 'captions',
      label: s.language,
      src: s.url
    }))
  }}
/>
```

---

## Comparison Table

| Feature | Iframe Embeds (Current) | Direct Streaming (Stremio-style) |
|---------|------------------------|----------------------------------|
| **Setup Complexity** | ✅ Easy (just URLs) | ⚠️ Medium (API integration) |
| **Ads** | ❌ Providers inject ads | ✅ None (you control player) |
| **Buffering** | ⚠️ Depends on provider | ✅ Minimal (debrid CDN) |
| **Quality** | ⚠️ 720p-1080p (varies) | ✅ Up to 4K (torrent quality) |
| **Reliability** | ❌ Providers die often | ✅ 99.9% uptime (debrid) |
| **Cost** | ✅ Free | ⚠️ $3-5/month (debrid) |
| **Legal Risk** | ⚠️ Medium (embed providers) | ⚠️ Medium (torrents) |
| **Player Control** | ❌ None (provider's player) | ✅ Full (custom UI) |
| **Subtitles** | ⚠️ Provider-dependent | ✅ Full control (OpenSubtitles) |
| **Speed** | ⚠️ Slow provider servers | ✅ Fast (debrid CDN) |

---

## Recommendation

### Short-term (Current Setup)
1. Add provider health checks
2. Implement reputation system
3. Test all 10 providers and remove dead ones weekly
4. Add user feedback ("Report broken stream")

### Long-term (Production Quality)
**Switch to Direct Streaming approach:**
1. Integrate Real-Debrid (~$4/month)
2. Add torrent scraper (Jackett or YTS API)
3. Replace iframes with Plyr + hls.js
4. Add OpenSubtitles for captions

This is how **every professional streaming app** (Stremio, Syncler, Kodi + Seren) works.

---

## Alternative: Hybrid Approach

Keep iframes as **fallback**, add direct streaming as **premium tier**:

```typescript
if (user.hasDebridAccount) {
  // Use Real-Debrid → direct streaming
  streamUrl = await getDebridStream(tmdbId);
} else {
  // Fall back to embed providers
  streamUrl = getEmbedUrl(tmdbId);
}
```

---

## Resources

- [Real-Debrid API Docs](https://api.real-debrid.com/)
- [TorBox API](https://torbox.app/api)
- [Jackett](https://github.com/Jackett/Jackett) — Torrent indexer
- [hls.js](https://github.com/video-dev/hls.js/) — HLS player
- [Plyr](https://plyr.io/) — Modern HTML5 player
- [OpenSubtitles API](https://opensubtitles.stoplight.io/docs/opensubtitles-api)

---

## Example Apps Using This Approach

- [Stremio](https://www.stremio.com/) + Torrentio addon
- [Syncler](https://syncler.net/)
- [CloudStream](https://github.com/recloudstream/cloudstream)
- [Kodi](https://kodi.tv/) + Seren/Fen/Venom addons
- [Weyd](https://github.com/weyd-app/weyd)

All use: **Scrapers → Debrid → Direct Video Playback**

None use iframe embeds.
