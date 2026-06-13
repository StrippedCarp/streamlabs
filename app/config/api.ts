// TMDB API Configuration
export const TMDB_API_KEY = '24b3f99aa424f62e2dd5452b83ad2e43';
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export interface EmbedProvider {
  name: string;
  priority: number;
  quality: 'high' | 'medium' | 'low';
  reliability: number;
  movie: (id: string) => string;
  tv: (id: string, season: number, episode: number) => string;
}

// Embed Providers - Updated with working sources
export const EMBED_PROVIDERS: Record<string, EmbedProvider> = {
  vidsrc: {
    name: 'VidSrc',
    priority: 1,
    quality: 'high',
    reliability: 95,
    movie: (id: string) => `https://vidsrc.to/embed/movie/${id}`,
    tv: (id: string, season: number, episode: number) => 
      `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`,
  },
  vidsrcpro: {
    name: 'VidSrc Pro',
    priority: 2,
    quality: 'high',
    reliability: 90,
    movie: (id: string) => `https://vidsrc.pro/embed/movie/${id}`,
    tv: (id: string, season: number, episode: number) => 
      `https://vidsrc.pro/embed/tv/${id}/${season}/${episode}`,
  },
  vidsrcnl: {
    name: 'VidSrc NL',
    priority: 3,
    quality: 'high',
    reliability: 88,
    movie: (id: string) => `https://vidsrc.nl/embed/movie/${id}`,
    tv: (id: string, season: number, episode: number) => 
      `https://vidsrc.nl/embed/tv/${id}/${season}/${episode}`,
  },
  vidsrcxyz: {
    name: 'VidSrc XYZ',
    priority: 4,
    quality: 'high',
    reliability: 85,
    movie: (id: string) => `https://vidsrc.xyz/embed/movie/${id}`,
    tv: (id: string, season: number, episode: number) => 
      `https://vidsrc.xyz/embed/tv/${id}/${season}/${episode}`,
  },
  embedsu: {
    name: 'Embed.su',
    priority: 5,
    quality: 'high',
    reliability: 85,
    movie: (id: string) => `https://embed.su/embed/movie/${id}`,
    tv: (id: string, season: number, episode: number) => 
      `https://embed.su/embed/tv/${id}/${season}/${episode}`,
  },
  vidsrcme: {
    name: 'VidSrc Me',
    priority: 6,
    quality: 'medium',
    reliability: 80,
    movie: (id: string) => `https://vidsrc.me/embed/movie?tmdb=${id}`,
    tv: (id: string, season: number, episode: number) => 
      `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`,
  },
  autoembed: {
    name: 'AutoEmbed',
    priority: 7,
    quality: 'medium',
    reliability: 75,
    movie: (id: string) => `https://player.autoembed.cc/embed/movie/${id}`,
    tv: (id: string, season: number, episode: number) => 
      `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`,
  },
  smashystream: {
    name: 'SmashyStream',
    priority: 8,
    quality: 'medium',
    reliability: 70,
    movie: (id: string) => `https://player.smashy.stream/movie/${id}`,
    tv: (id: string, season: number, episode: number) => 
      `https://player.smashy.stream/tv/${id}?s=${season}&e=${episode}`,
  },
  nontonGo: {
    name: 'NontonGo',
    priority: 9,
    quality: 'low',
    reliability: 65,
    movie: (id: string) => `https://www.NontonGo.win/embed/movie/${id}`,
    tv: (id: string, season: number, episode: number) => 
      `https://www.NontonGo.win/embed/tv/${id}/${season}/${episode}`,
  },
  embedsoap: {
    name: 'EmbedSoap',
    priority: 10,
    quality: 'low',
    reliability: 60,
    movie: (id: string) => `https://www.embedsoap.com/embed/movie/?id=${id}`,
    tv: (id: string, season: number, episode: number) => 
      `https://www.embedsoap.com/embed/tv/?id=${id}&s=${season}&e=${episode}`,
  },
};

export const API_ENDPOINTS = {
  search: (query: string) => 
    `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`,
  movieDetails: (id: string) => 
    `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}`,
  tvDetails: (id: string) => 
    `${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}`,
  tvSeason: (id: string, season: number) => 
    `${TMDB_BASE_URL}/tv/${id}/season/${season}?api_key=${TMDB_API_KEY}`,
  trending: () => 
    `${TMDB_BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}`,
  popular: () => 
    `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`,
};
