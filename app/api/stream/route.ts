import { NextRequest, NextResponse } from 'next/server';

// Type definitions at the top
interface StreamSource {
  url: string;
  quality: string;
  type: string;
  provider: string;
  subtitles?: Array<{ url: string; lang: string; label: string }>;
}

interface ConsumetSearchData {
  id?: string;
  episodes?: Array<{
    season: number;
    number: number;
    id: string;
  }>;
}

interface ConsumetWatchData {
  sources?: Array<{
    url: string;
    quality?: string;
  }>;
  subtitles?: Array<{
    url: string;
    lang: string;
  }>;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tmdbId = searchParams.get('tmdbId');
  const type = searchParams.get('type');
  const season = searchParams.get('season');
  const episode = searchParams.get('episode');

  if (!tmdbId || !type) {
    return NextResponse.json({ error: 'Missing tmdbId or type' }, { status: 400 });
  }

  try {
    const sources = await getStreamSources(tmdbId, type, season, episode);
    
    if (sources.length === 0) {
      return NextResponse.json({ error: 'No streams found' }, { status: 404 });
    }

    return NextResponse.json({ sources });
  } catch (error) {
    console.error('Stream API error:', error);
    return NextResponse.json({ error: 'Failed to fetch streams' }, { status: 500 });
  }
}

async function getStreamSources(
  tmdbId: string,
  type: string,
  season?: string | null,
  episode?: string | null
): Promise<StreamSource[]> {
  const sources: StreamSource[] = [];

  // Try Consumet FlixHQ API (free community API)
  try {
    const consumetSources = await fetchConsumetFlixHQ(tmdbId, type, season, episode);
    sources.push(...consumetSources);
  } catch (e) {
    console.error('Consumet failed:', e);
  }

  // Try VidSrc extraction (fallback)
  try {
    const vidsrcSource = await fetchVidSrcDirect(tmdbId, type, season, episode);
    if (vidsrcSource) {
      sources.push(vidsrcSource);
    }
  } catch (e) {
    console.error('VidSrc failed:', e);
  }

  return sources;
}

/**
 * Consumet FlixHQ Provider
 * Free community API that provides direct m3u8 links
 */
async function fetchConsumetFlixHQ(
  tmdbId: string,
  type: string,
  season?: string | null,
  episode?: string | null
): Promise<StreamSource[]> {
  const sources: StreamSource[] = [];

  try {
    // Search by TMDB ID
    const searchUrl = `https://api.consumet.org/movies/flixhq/${type}/${tmdbId}`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!searchRes.ok) throw new Error('Search failed');

    const searchData = (await searchRes.json()) as ConsumetSearchData;
    
    if (!searchData || !searchData.id) {
      throw new Error('No media found');
    }

    // Get episode/movie ID
    let episodeId = searchData.id;
    
    if (type === 'tv' && searchData.episodes) {
      // Find the specific episode
      const targetEpisode = searchData.episodes.find(
        (ep) => 
          ep.season === parseInt(season || '1') && 
          ep.number === parseInt(episode || '1')
      );
      
      if (targetEpisode) {
        episodeId = targetEpisode.id;
      }
    }

    // Get watch links
    const watchUrl = `https://api.consumet.org/movies/flixhq/watch?episodeId=${encodeURIComponent(episodeId)}&mediaId=${encodeURIComponent(searchData.id)}&server=vidcloud`;
    const watchRes = await fetch(watchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!watchRes.ok) throw new Error('Watch fetch failed');

    const watchData = (await watchRes.json()) as ConsumetWatchData;

    if (watchData.sources && Array.isArray(watchData.sources)) {
      watchData.sources.forEach((source) => {
        sources.push({
          url: source.url,
          quality: source.quality || 'auto',
          type: source.url.includes('.m3u8') ? 'hls' : 'mp4',
          provider: 'flixhq',
        });
      });
    }

    // Add subtitles if available
    if (watchData.subtitles && Array.isArray(watchData.subtitles) && sources.length > 0) {
      sources[0] = {
        ...sources[0],
        subtitles: watchData.subtitles.map((sub) => ({
          url: sub.url,
          lang: sub.lang,
          label: sub.lang.toUpperCase(),
        })),
      };
    }
  } catch (error) {
    console.error('Consumet FlixHQ error:', error);
  }

  return sources;
}

/**
 * VidSrc Direct Link Extractor (fallback)
 * Extracts m3u8 from VidSrc embed pages
 */
async function fetchVidSrcDirect(
  tmdbId: string,
  type: string,
  season?: string | null,
  episode?: string | null
): Promise<StreamSource | null> {
  try {
    const embedUrl =
      type === 'movie'
        ? `https://vidsrc.xyz/embed/movie/${tmdbId}`
        : `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}`;

    const response = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Try to extract m3u8 URL from embed page
    const m3u8Match = html.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/i);
    
    if (m3u8Match) {
      return {
        url: m3u8Match[0],
        quality: 'auto',
        type: 'hls',
        provider: 'vidsrc',
      };
    }

    return null;
  } catch (error) {
    console.error('VidSrc direct error:', error);
    return null;
  }
}
