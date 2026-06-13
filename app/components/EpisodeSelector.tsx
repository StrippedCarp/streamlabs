'use client';

import { useState, useEffect } from 'react';
import styles from './EpisodeSelector.module.css';
import { TVSeason, TVEpisode } from '../types';

interface EpisodeSelectorProps {
  tmdbId: number;
  seasons: TVSeason[];
  onEpisodeSelect: (season: number, episode: number, episodeName: string) => void;
  currentSeason?: number;
  currentEpisode?: number;
}

export default function EpisodeSelector({ 
  tmdbId, 
  seasons, 
  onEpisodeSelect,
  currentSeason = 1,
  currentEpisode = 1
}: EpisodeSelectorProps) {
  const [selectedSeason, setSelectedSeason] = useState(currentSeason);
  const [episodes, setEpisodes] = useState<TVEpisode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEpisodes(selectedSeason);
  }, [selectedSeason, tmdbId]);

  const loadEpisodes = async (season: number) => {
    setLoading(true);
    try {
      const { getTVSeasonEpisodes } = await import('../utils/tmdb');
      const eps = await getTVSeasonEpisodes(tmdbId, season);
      setEpisodes(eps);
    } catch (error) {
      console.error('Failed to load episodes:', error);
      setEpisodes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>📺 Episodes</span>
      </div>
      
      <div className={styles.seasonSelector}>
        <label className={styles.label}>Season:</label>
        <div className={styles.seasonGrid}>
          {seasons.map((season) => (
            <button
              key={season.season_number}
              className={`${styles.seasonBtn} ${selectedSeason === season.season_number ? styles.active : ''}`}
              onClick={() => setSelectedSeason(season.season_number)}
            >
              S{season.season_number}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.episodeList}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading episodes...</p>
          </div>
        ) : (
          <>
            <div className={styles.episodeHeader}>
              Season {selectedSeason} • {episodes.length} Episodes
            </div>
            {episodes.map((episode) => (
              <div
                key={episode.episode_number}
                className={`${styles.episodeCard} ${
                  currentSeason === selectedSeason && currentEpisode === episode.episode_number 
                    ? styles.activeEpisode 
                    : ''
                }`}
                onClick={() => onEpisodeSelect(selectedSeason, episode.episode_number, episode.name)}
              >
                <div className={styles.episodeNumber}>
                  E{episode.episode_number.toString().padStart(2, '0')}
                </div>
                <div className={styles.episodeInfo}>
                  <div className={styles.episodeName}>{episode.name}</div>
                  {episode.overview && (
                    <div className={styles.episodeOverview}>
                      {episode.overview.length > 100 
                        ? `${episode.overview.substring(0, 100)}...` 
                        : episode.overview}
                    </div>
                  )}
                </div>
                {episode.still_path && (
                  <div 
                    className={styles.episodeThumb}
                    style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w185${episode.still_path})` }}
                  />
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
