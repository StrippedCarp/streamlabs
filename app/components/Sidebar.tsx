'use client';

import { useState } from 'react';
import styles from './Sidebar.module.css';
import { movies, tvShows, Movie, TVShow } from '@/app/data/media';

interface SidebarProps {
  onMediaSelect: (url: string, title: string) => void;
}

export default function Sidebar({ onMediaSelect }: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['movies']);
  const [expandedShows, setExpandedShows] = useState<string[]>([]);

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev =>
      prev.includes(folder) ? prev.filter(f => f !== folder) : [...prev, folder]
    );
  };

  const toggleShow = (showId: string) => {
    setExpandedShows(prev =>
      prev.includes(showId) ? prev.filter(s => s !== showId) : [...prev, showId]
    );
  };

  const playMovie = (movie: Movie) => {
    const url = `https://vidfast.pro/movie/${movie.id}?autoPlay=true`;
    onMediaSelect(url, movie.title);
  };

  const playEpisode = (show: TVShow, season: number, episode: number) => {
    const url = `https://vidfast.pro/tv/${show.id}/${season}/${episode}?autoPlay=true`;
    onMediaSelect(url, `${show.title} S${season}E${episode}`);
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>EXPLORER: STREAMLAB</div>
      
      <div className={styles.content}>
        {/* Movies Folder */}
        <div className={styles.folder} onClick={() => toggleFolder('movies')}>
          <span className={styles.folderIcon}>
            {expandedFolders.includes('movies') ? '▼' : '▶'}
          </span>
          <span>🎬 Movies</span>
        </div>
        {expandedFolders.includes('movies') && (
          <div className={styles.files}>
            {movies.map((movie) => (
              <div
                key={movie.id}
                className={styles.file}
                onClick={() => playMovie(movie)}
              >
                <span className={styles.fileIcon}>🎬</span>
                {movie.title}.mp4
              </div>
            ))}
          </div>
        )}

        {/* TV Shows Folder */}
        <div className={styles.folder} onClick={() => toggleFolder('tvshows')}>
          <span className={styles.folderIcon}>
            {expandedFolders.includes('tvshows') ? '▼' : '▶'}
          </span>
          <span>📺 TV Shows</span>
        </div>
        {expandedFolders.includes('tvshows') && (
          <div className={styles.files}>
            {tvShows.map((show) => (
              <div key={show.id}>
                <div
                  className={styles.subfolder}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleShow(show.id);
                  }}
                >
                  <span className={styles.folderIcon}>
                    {expandedShows.includes(show.id) ? '▼' : '▶'}
                  </span>
                  <span>📺 {show.title}</span>
                </div>
                {expandedShows.includes(show.id) && (
                  <div className={styles.episodes}>
                    {show.seasons.map((season) =>
                      Array.from({ length: season.episodes }, (_, i) => i + 1).map((ep) => (
                        <div
                          key={`${season.season}-${ep}`}
                          className={styles.episode}
                          onClick={() => playEpisode(show, season.season, ep)}
                        >
                          <span className={styles.fileIcon}>▶</span>
                          S{season.season.toString().padStart(2, '0')}E{ep.toString().padStart(2, '0')}.mp4
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
