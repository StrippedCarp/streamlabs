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
// Note: vidsrc.to, vidsrc.pro, vidsrc.nl, vidsrc.xyz, embed.su, vidsrc.me,
//       autoembed, smashystream, NontonGo, embedsoap are all down or blocked
//       following the 2025 MPA/ACE anti-piracy injunction targeting 248 domains.
export const EMBED_PROVIDERS: Record<string, EmbedProvider> = {
  vidsrcmov: {
    name: 'VidSrc',
    priority: 1,
    quality: 'high',
    reliability: 90,
    movie: (id: string) => `https://vidsrc.mov/embed/movie/${id}`,
    tv: (id: string, season: number, episode: number) =>
      `https://vidsrc.mov/embed/tv/${id}/${season}/${episode}`,
  },
  vidsrcwiki: {
    name: 'VidSrc Wiki',
    priority: 2,
    quality: 'high',
    reliability: 88,
    movie: (id: string) => `https://vidsrc.wiki/embed/movie/${id}`,
    tv: (id: string, season: number, episode: number) =>
      `https://vidsrc.wiki/embed/tv/${id}/${season}/${episode}`,
  },
  vidsrcfyi: {
    name: 'VidSrc FYI',
    priority: 3,
    quality: 'high',
    reliability: 85,
    movie: (id: string) => `https://vidsrc.fyi/embed/movie/${id}`,
    tv: (id: string, season: number, episode: number) =>
      `https://vidsrc.fyi/embed/tv/${id}/${season}/${episode}`,
  },
  vidlink: {
    name: 'VidLink',
    priority: 4,
    quality: 'high',
    reliability: 85,
    movie: (id: string) => `https://vidlink.pro/movie/${id}`,
    tv: (id: string, season: number, episode: number) =>
      `https://vidlink.pro/tv/${id}/${season}/${episode}`,
  },
  vidbinge: {
    name: 'VidBinge',
    priority: 5,
    quality: 'high',
    reliability: 82,
    movie: (id: string) => `https://vidbinge.dev/embed/movie/${id}`,
    tv: (id: string, season: number, episode: number) =>
      `https://vidbinge.dev/embed/tv/${id}/${season}/${episode}`,
  },
  moviesapi: {
    name: 'MoviesAPI',
    priority: 6,
    quality: 'medium',
    reliability: 78,
    movie: (id: string) => `https://moviesapi.club/movie/${id}`,
    tv: (id: string, season: number, episode: number) =>
      `https://moviesapi.club/tv/${id}-${season}-${episode}`,
  },
  multiembed: {
    name: 'MultiEmbed',
    priority: 7,
    quality: 'medium',
    reliability: 75,
    movie: (id: string) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
    tv: (id: string, season: number, episode: number) =>
      `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${season}&e=${episode}`,
  },
  moviee: {
    name: 'Moviee',
    priority: 8,
    quality: 'medium',
    reliability: 72,
    movie: (id: string) => `https://moviee.tv/embed/movie/${id}`,
    tv: (id: string, season: number, episode: number) =>
      `https://moviee.tv/embed/tv/${id}?seasson=${season}&episode=${episode}`,
  },
  moviesrc: {
    name: 'MovieSrc',
    priority: 9,
    quality: 'low',
    reliability: 68,
    movie: (id: string) => `https://movie-src.xyz/v1/embed/movie/${id}`,
    tv: (id: string, season: number, episode: number) =>
      `https://movie-src.xyz/v1/embed/tv/${id}/${season}/${episode}`,
  },
  ezvidapi: {
    name: 'EzVidAPI',
    priority: 10,
    quality: 'low',
    reliability: 65,
    movie: (id: string) => `https://ezvidapi.com/movie/${id}`,
    tv: (id: string, season: number, episode: number) =>
      `https://ezvidapi.com/tv/${id}/${season}/${episode}`,
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
