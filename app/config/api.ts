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

// Embed Providers - Updated June 2026
// Many providers were taken down by MPA/ACE injunctions in 2025.
// These are currently working providers that accept TMDB IDs.
export const EMBED_PROVIDERS: Record<string, EmbedProvider> = {
  vidsrcpk: {
    name: 'VidSrc PK',
    priority: 1,
    quality: 'high',
    reliability: 92,
    movie: (id: string) => `https://vidsrc.pk/embed/movie/${id}`,
    tv: (id: string, season: number, episode: number) =>
      `https://vidsrc.pk/embed/tv/${id}/${season}/${episode}`,
  },
  vidsrcin: {
    name: 'VidSrc In',
    priority: 2,
    quality: 'high',
    reliability: 90,
    movie: (id: string) => `https://vidsrc.in/embed/movie/${id}`,
    tv: (id: string, season: number, episode: number) =>
      `https://vidsrc.in/embed/tv/${id}/${season}/${episode}`,
  },
  twoembedstream: {
    name: '2Embed',
    priority: 3,
    quality: 'high',
    reliability: 88,
    movie: (id: string) => `https://www.2embed.stream/embed/tmdb/movie?id=${id}`,
    tv: (id: string, season: number, episode: number) =>
      `https://www.2embed.stream/embed/tmdb/tv?id=${id}&s=${season}&e=${episode}`,
  },
  vidsrcrip: {
    name: 'VidSrc Rip',
    priority: 4,
    quality: 'high',
    reliability: 85,
    movie: (id: string) => `https://vidsrc.rip/embed/movie/${id}`,
    tv: (id: string, season: number, episode: number) =>
      `https://vidsrc.rip/embed/tv/${id}/${season}/${episode}`,
  },
  vidnesfun: {
    name: 'VidNest',
    priority: 5,
    quality: 'high',
    reliability: 83,
    movie: (id: string) => `https://vidnest.fun/embed/movie/${id}`,
    tv: (id: string, season: number, episode: number) =>
      `https://vidnest.fun/embed/tv/${id}/${season}/${episode}`,
  },
  embedsuskin: {
    name: 'Embed Skin',
    priority: 6,
    quality: 'medium',
    reliability: 78,
    movie: (id: string) => `https://embed.su/embed/movie/${id}`,
    tv: (id: string, season: number, episode: number) =>
      `https://embed.su/embed/tv/${id}/${season}/${episode}`,
  },
  smashystream: {
    name: 'Smashy',
    priority: 7,
    quality: 'medium',
    reliability: 75,
    movie: (id: string) => `https://embed.smashystream.com/playere.php?tmdb=${id}`,
    tv: (id: string, season: number, episode: number) =>
      `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${season}&episode=${episode}`,
  },
  nontongowin: {
    name: 'NontonGo',
    priority: 8,
    quality: 'medium',
    reliability: 70,
    movie: (id: string) => `https://www.NontonGo.win/embed/movie/${id}`,
    tv: (id: string, season: number, episode: number) =>
      `https://www.NontonGo.win/embed/tv/${id}/${season}/${episode}`,
  },
  vidsrccc: {
    name: 'VidSrc CC',
    priority: 9,
    quality: 'low',
    reliability: 65,
    movie: (id: string) => `https://vidsrc.cc/v2/embed/movie/${id}`,
    tv: (id: string, season: number, episode: number) =>
      `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`,
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
