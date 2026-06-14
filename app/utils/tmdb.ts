import { API_ENDPOINTS, TMDB_IMAGE_BASE, EMBED_PROVIDERS } from '../config/api';
import { TMDBMovie, MediaItem, StreamServer } from '../types';

export async function searchMedia(query: string): Promise<MediaItem[]> {
  try {
    // Use cached metadata API
    const response = await fetch(`/api/metadata?query=${encodeURIComponent(query)}&type=multi`);
    const data = await response.json();
    
    return data.results
      .filter((item: TMDBMovie) => item.media_type === 'movie' || item.media_type === 'tv')
      .map((item: TMDBMovie) => ({
        id: item.id,
        title: item.title || item.name || 'Unknown',
        type: item.media_type,
        poster: item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : '/placeholder.png',
        year: (item.release_date || item.first_air_date || '').split('-')[0] || 'N/A',
        rating: Math.round(item.vote_average * 10) / 10,
        overview: item.overview || 'No description available'
      }));
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export async function getTrending(): Promise<MediaItem[]> {
  try {
    const response = await fetch(API_ENDPOINTS.trending());
    const data = await response.json();
    
    return data.results.slice(0, 20).map((item: TMDBMovie) => ({
      id: item.id,
      title: item.title || item.name || 'Unknown',
      type: item.media_type,
      poster: item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : '/placeholder.png',
      year: (item.release_date || item.first_air_date || '').split('-')[0] || 'N/A',
      rating: Math.round(item.vote_average * 10) / 10,
      overview: item.overview || 'No description available'
    }));
  } catch (error) {
    console.error('Trending error:', error);
    return [];
  }
}

export function getStreamServers(
  tmdbId: number, 
  type: 'movie' | 'tv', 
  season?: number, 
  episode?: number
): StreamServer[] {
  const servers: StreamServer[] = [];
  
  // Get reliability stats from localStorage
  const stats = getProviderStats();
  
  Object.entries(EMBED_PROVIDERS)
    .map(([key, provider]) => ({
      key,
      provider,
      // Adjust priority based on historical success rate
      adjustedPriority: provider.priority - (stats[key]?.successRate || 0) * 10
    }))
    .sort((a, b) => a.adjustedPriority - b.adjustedPriority)
    .forEach(({ key, provider }) => {
      const url = type === 'movie' 
        ? provider.movie(tmdbId.toString())
        : provider.tv(tmdbId.toString(), season || 1, episode || 1);
      
      servers.push({
        id: `${key}-${Date.now()}-${Math.random()}`,
        name: provider.name,
        url,
        provider: key,
        quality: provider.quality,
        reliability: provider.reliability,
        status: 'ready'
      });
    });
  
  return servers;
}

// Provider reputation system
interface ProviderStats {
  [key: string]: {
    successes: number;
    failures: number;
    successRate: number;
    lastUpdated: number;
  };
}

function getProviderStats(): ProviderStats {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem('providerStats');
  return stored ? JSON.parse(stored) : {};
}

export function recordProviderSuccess(provider: string) {
  if (typeof window === 'undefined') return;
  const stats = getProviderStats();
  
  if (!stats[provider]) {
    stats[provider] = { successes: 0, failures: 0, successRate: 0, lastUpdated: Date.now() };
  }
  
  stats[provider].successes++;
  stats[provider].successRate = stats[provider].successes / (stats[provider].successes + stats[provider].failures);
  stats[provider].lastUpdated = Date.now();
  
  localStorage.setItem('providerStats', JSON.stringify(stats));
}

export function recordProviderFailure(provider: string) {
  if (typeof window === 'undefined') return;
  const stats = getProviderStats();
  
  if (!stats[provider]) {
    stats[provider] = { successes: 0, failures: 0, successRate: 0, lastUpdated: Date.now() };
  }
  
  stats[provider].failures++;
  stats[provider].successRate = stats[provider].successes / (stats[provider].successes + stats[provider].failures);
  stats[provider].lastUpdated = Date.now();
  
  localStorage.setItem('providerStats', JSON.stringify(stats));
}

export async function checkServerStatus(url: string): Promise<'online' | 'offline' | 'timeout'> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal
    });
    clearTimeout(timeout);
    return 'online';
  } catch (error: any) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      return 'timeout';
    }
    return 'offline';
  }
}

export async function getTVSeasons(tvId: number) {
  try {
    const response = await fetch(API_ENDPOINTS.tvDetails(tvId.toString()));
    const data = await response.json();
    return data.seasons || [];
  } catch (error) {
    console.error('TV seasons error:', error);
    return [];
  }
}

export async function getTVSeasonEpisodes(tvId: number, season: number) {
  try {
    const response = await fetch(API_ENDPOINTS.tvSeason(tvId.toString(), season));
    const data = await response.json();
    return data.episodes || [];
  } catch (error) {
    console.error('TV episodes error:', error);
    return [];
  }
}

// New: Check server health via API
export async function checkServerHealth(url: string): Promise<'online' | 'offline'> {
  try {
    const response = await fetch('/api/health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await response.json();
    return data.status;
  } catch (error) {
    return 'offline';
  }
}
