export interface Movie {
  id: string;
  title: string;
  type: 'movie';
}

export interface TVShow {
  id: string;
  title: string;
  type: 'tv';
  seasons: Season[];
}

export interface Season {
  season: number;
  episodes: number;
}

export const movies: Movie[] = [
  { id: '507', title: 'Avatar: The Way of Water', type: 'movie' },
  { id: '438631', title: 'Dune: Part Two', type: 'movie' },
  { id: '872585', title: 'Oppenheimer', type: 'movie' },
  { id: '646097', title: 'Rebel Moon', type: 'movie' },
  { id: '693134', title: 'Dune', type: 'movie' },
  { id: '299534', title: 'Avengers: Endgame', type: 'movie' },
  { id: '458156', title: 'John Wick: Chapter 3', type: 'movie' },
  { id: '335984', title: 'Blade Runner 2049', type: 'movie' },
];

export const tvShows: TVShow[] = [
  { 
    id: '66732', 
    title: 'Stranger Things', 
    type: 'tv',
    seasons: [
      { season: 1, episodes: 8 },
      { season: 2, episodes: 9 },
      { season: 3, episodes: 8 },
      { season: 4, episodes: 9 }
    ]
  },
  { 
    id: '1396', 
    title: 'Breaking Bad', 
    type: 'tv',
    seasons: [
      { season: 1, episodes: 7 },
      { season: 2, episodes: 13 },
      { season: 3, episodes: 13 },
      { season: 4, episodes: 13 },
      { season: 5, episodes: 16 }
    ]
  },
  { 
    id: '2316', 
    title: 'The Walking Dead', 
    type: 'tv',
    seasons: [
      { season: 1, episodes: 6 },
      { season: 2, episodes: 13 },
      { season: 3, episodes: 16 }
    ]
  },
  { 
    id: '1399', 
    title: 'Game of Thrones', 
    type: 'tv',
    seasons: [
      { season: 1, episodes: 10 },
      { season: 2, episodes: 10 },
      { season: 3, episodes: 10 }
    ]
  },
];

export type MediaItem = Movie | TVShow;
export const allMedia: MediaItem[] = [...movies, ...tvShows];
