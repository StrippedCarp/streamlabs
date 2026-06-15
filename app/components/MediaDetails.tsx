'use client';

import { useState, useEffect } from 'react';
import styles from './MediaDetails.module.css';
import { getTVSeasonEpisodes } from '../utils/tmdb';

interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface MediaDetailsProps {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  currentSeason?: number;
  currentEpisode?: number;
  onEpisodeSelect?: (season: number, episode: number, episodeName: string) => void;
}

export default function MediaDetails({
  tmdbId,
  mediaType,
  currentSeason = 1,
  currentEpisode = 1,
  onEpisodeSelect,
}: MediaDetailsProps) {
  const [details, setDetails] = useState<any>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
    loadCast();
    if (mediaType === 'tv') {
      loadEpisodes(currentSeason);
    }
  }, [tmdbId, mediaType, currentSeason]);

  async function loadDetails() {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=3fd2be6f0c70a2a598f084ddfb75487c`
      );
      const data = await response.json();
      setDetails(data);
    } catch (error) {
      console.error('Failed to load details:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCast() {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/${mediaType}/${tmdbId}/credits?api_key=3fd2be6f0c70a2a598f084ddfb75487c`
      );
      const data = await response.json();
      setCast(data.cast?.slice(0, 10) || []);
    } catch (error) {
      console.error('Failed to load cast:', error);
    }
  }

  async function loadEpisodes(season: number) {
    try {
      const eps = await getTVSeasonEpisodes(tmdbId, season);
      setEpisodes(eps);
    } catch (error) {
      console.error('Failed to load episodes:', error);
    }
  }

  if (loading || !details) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* About Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>About</h2>
        <p className={styles.overview}>{details.overview || 'No description available.'}</p>
        
        <div className={styles.metadata}>
          {details.genres && details.genres.length > 0 && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Genres:</span>
              <span className={styles.metaValue}>
                {details.genres.map((g: any) => g.name).join(', ')}
              </span>
            </div>
          )}
          
          {details.release_date && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Release Date:</span>
              <span className={styles.metaValue}>
                {new Date(details.release_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          )}

          {details.first_air_date && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>First Air Date:</span>
              <span className={styles.metaValue}>
                {new Date(details.first_air_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          )}

          {details.runtime && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Runtime:</span>
              <span className={styles.metaValue}>{details.runtime} minutes</span>
            </div>
          )}

          {details.number_of_seasons && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Seasons:</span>
              <span className={styles.metaValue}>{details.number_of_seasons}</span>
            </div>
          )}

          {details.number_of_episodes && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Episodes:</span>
              <span className={styles.metaValue}>{details.number_of_episodes}</span>
            </div>
          )}

          {details.status && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Status:</span>
              <span className={styles.metaValue}>{details.status}</span>
            </div>
          )}
        </div>
      </div>

      {/* Episodes Section (TV Shows only) */}
      {mediaType === 'tv' && episodes.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Season {currentSeason} Episodes</h2>
          <div className={styles.episodeGrid}>
            {episodes.map((ep) => (
              <div
                key={ep.episode_number}
                className={`${styles.episodeCard} ${
                  ep.episode_number === currentEpisode ? styles.activeEpisode : ''
                }`}
                onClick={() => onEpisodeSelect?.(currentSeason, ep.episode_number, ep.name)}
              >
                <div className={styles.episodeNumber}>
                  {ep.episode_number}
                </div>
                {ep.still_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                    alt={ep.name}
                    className={styles.episodeThumb}
                  />
                ) : (
                  <div className={styles.episodePlaceholder}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                )}
                <div className={styles.episodeInfo}>
                  <div className={styles.episodeName}>{ep.name}</div>
                  {ep.overview && (
                    <div className={styles.episodeOverview}>
                      {ep.overview.length > 100
                        ? `${ep.overview.substring(0, 100)}...`
                        : ep.overview}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cast Section */}
      {cast.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Cast</h2>
          <div className={styles.castGrid}>
            {cast.map((actor) => (
              <div key={actor.id} className={styles.castCard}>
                {actor.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                    alt={actor.name}
                    className={styles.castImage}
                  />
                ) : (
                  <div className={styles.castPlaceholder}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                )}
                <div className={styles.castInfo}>
                  <div className={styles.castName}>{actor.name}</div>
                  <div className={styles.castCharacter}>{actor.character}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
