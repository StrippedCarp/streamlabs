export interface TMDBMovie {
  id: number;
  title: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  first_air_date?: string;
  vote_average: number;
  media_type: 'movie' | 'tv';
}

export interface TMDBSearchResult {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export interface TVSeason {
  season_number: number;
  episode_count: number;
  name: string;
}

export interface TVSeasonDetails {
  episodes: TVEpisode[];
  season_number: number;
}

export interface TVEpisode {
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
}

export interface StreamServer {
  id: string;
  name: string;
  url: string;
  provider: string;
  quality: 'high' | 'medium' | 'low';
  reliability: number;
  status: 'ready' | 'loading' | 'error' | 'timeout';
}

export interface MediaItem {
  id: number;
  title: string;
  type: 'movie' | 'tv';
  poster: string;
  year: string;
  rating: number;
  overview: string;
}
