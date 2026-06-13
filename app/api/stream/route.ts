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

  console.log(`\n=== Stream API Request ===`);
  console.log(`TMDB ID: ${tmdbId}`);
  console.log(`Type: ${type}`);
  if (type === 'tv') {
    console.log(`Season: ${season}, Episode: ${episode}`);
  }

  try {
    const sources = await getStreamSources(tmdbId, type, season, episode);
    
    console.log(`Found ${sources.length} total sources`);
    
    if (sources.length === 0) {
      return NextResponse.json({ 
        error: 'No streams found',
        message: 'This content may not be available yet. Try a different title or use Embed Mode instead.'
      }, { status: 404 });
    }

    return NextResponse.json({ 
      sources,
      count: sources.length,
      providers: sources.map(s => s.provider).join(', ')
    });
  } catch (error) {
    console.error('Stream API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch streams',
      message: 'An error occurred while fetching stream sources. Please try again.'
    }, { status: 500 });
  }
}

async function getStreamSources(
  tmdbId: string,
  type: string,
  season?: string | null,
  episode?: string | null
): Promise<StreamSource[]> {
  const sources: StreamSource[] = [];

  // Try VidFast (priority 1 - highest reliability)
  try {
    const vidfastSource = await fetchVidFastDirect(tmdbId, type, season, episode);
    if (vidfastSource) {
      sources.push(vidfastSource);
    }
  } catch (e) {
    console.error('VidFast failed:', e);
  }

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
    console.log(`Consumet: Searching for TMDB ${tmdbId} (${type})`);
    
    // Search by TMDB ID
    const searchUrl = `https://consumet-api.vercel.app/movies/flixhq/${tmdbId}`;
    const searchRes = await fetch(searchUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    if (!searchRes.ok) {
      console.log(`Consumet search failed: ${searchRes.status}`);
      throw new Error(`Search failed: ${searchRes.status}`);
    }

    const searchData = (await searchRes.json()) as ConsumetSearchData;
    
    if (!searchData || !searchData.id) {
      console.log('Consumet: No media ID found');
      throw new Error('No media found');
    }

    console.log(`Consumet: Found media ID: ${searchData.id}`);

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
        console.log(`Consumet: Using episode ID: ${episodeId}`);
      } else {
        console.log(`Consumet: Episode S${season}E${episode} not found`);
      }
    }

    // Get watch links - try multiple servers
    const servers = ['vidcloud', 'upcloud', 'mixdrop'];
    
    for (const server of servers) {
      try {
        const watchUrl = `https://consumet-api.vercel.app/movies/flixhq/watch?episodeId=${encodeURIComponent(episodeId)}&mediaId=${encodeURIComponent(searchData.id)}&server=${server}`;
        console.log(`Consumet: Trying server ${server}...`);
        
        const watchRes = await fetch(watchUrl, {
          headers: { 
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(15000),
        });

        if (!watchRes.ok) {
          console.log(`Consumet ${server} failed: ${watchRes.status}`);
          continue;
        }

        const watchData = (await watchRes.json()) as ConsumetWatchData;

        if (watchData.sources && Array.isArray(watchData.sources) && watchData.sources.length > 0) {
          console.log(`Consumet: Found ${watchData.sources.length} sources from ${server}`);
          
          watchData.sources.forEach((source) => {
            sources.push({
              url: source.url,
              quality: source.quality || 'auto',
              type: source.url.includes('.m3u8') ? 'hls' : 'mp4',
              provider: `flixhq-${server}`,
            });
          });

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

          break; // Got sources, stop trying other servers
        }
      } catch (serverError) {
        console.error(`Consumet ${server} error:`, serverError);
      }
    }

    if (sources.length === 0) {
      console.log('Consumet: No sources found from any server');
    }
  } catch (error) {
    console.error('Consumet FlixHQ error:', error);
  }

  return sources;
}

/**
 * VidFast Direct Link Extractor (Priority 1)
 * Extracts m3u8 from VidFast embed pages
 * Note: VidFast requires iframe embedding - direct scraping may not work
 */
async function fetchVidFastDirect(
  tmdbId: string,
  type: string,
  season?: string | null,
  episode?: string | null
): Promise<StreamSource | null> {
  try {
    const embedUrl =
      type === 'movie'
        ? `https://vidfast.pro/movie/${tmdbId}`
        : `https://vidfast.pro/tv/${tmdbId}/${season}/${episode}`;

    const response = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://vidfast.pro/',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      console.log(`VidFast returned ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Try multiple patterns to extract m3u8
    const patterns = [
      /https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/gi,
      /"file":\s*"([^"]+\.m3u8[^"]*)"/i,
      /'file':\s*'([^']+\.m3u8[^']*)'/i,
      /sources?:\s*\[?\s*{[^}]*url:\s*["']([^"']+\.m3u8[^"']*)/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        const url = match[1] || match[0];
        console.log('VidFast found stream:', url);
        return {
          url: url.replace(/\\/g, ''),
          quality: 'auto',
          type: 'hls',
          provider: 'vidfast',
        };
      }
    }

    console.log('VidFast: No m3u8 found in response');
    return null;
  } catch (error) {
    console.error('VidFast direct error:', error);
    return null;
  }
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
    // Try multiple VidSrc domains
    const domains = [
      'vidsrc.xyz',
      'vidsrc.me',
      'vidsrc.net',
      'vidsrc.pm',
    ];

    for (const domain of domains) {
      try {
        const embedUrl =
          type === 'movie'
            ? `https://${domain}/embed/movie/${tmdbId}`
            : `https://${domain}/embed/tv/${tmdbId}/${season}/${episode}`;

        console.log(`VidSrc: Trying ${domain}...`);

        const response = await fetch(embedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Referer': `https://${domain}/`,
          },
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          console.log(`VidSrc ${domain} returned ${response.status}`);
          continue;
        }

        const html = await response.text();

        // Try multiple extraction patterns
        const patterns = [
          /https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/gi,
          /"file":\s*"([^"]+\.m3u8[^"]*)"/i,
          /'file':\s*'([^']+\.m3u8[^']*)'/i,
          /sources?:\s*\[?\s*{[^}]*url:\s*["']([^"']+\.m3u8[^"']*)/i,
        ];

        for (const pattern of patterns) {
          const match = html.match(pattern);
          if (match) {
            const url = match[1] || match[0];
            console.log(`VidSrc found stream from ${domain}:`, url);
            return {
              url: url.replace(/\\/g, ''),
              quality: 'auto',
              type: 'hls',
              provider: `vidsrc-${domain.split('.')[1]}`,
            };
          }
        }

        console.log(`VidSrc: No m3u8 found in ${domain}`);
      } catch (domainError) {
        console.error(`VidSrc ${domain} error:`, domainError);
      }
    }

    return null;
  } catch (error) {
    console.error('VidSrc direct error:', error);
    return null;
  }
}
