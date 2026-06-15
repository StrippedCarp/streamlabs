'use client';

import { useEffect, useState } from 'react';
import { addonManager, StreamLink } from '../lib/addons';
import { TVSeason } from '../types';
import { getTVSeasonEpisodes } from '../utils/tmdb';
import styles from './DirectVideoPlayer.module.css';

interface DirectVideoPlayerProps {
  tmdbId: number | null;
  mediaType: 'movie' | 'tv' | null;
  title: string;
  season?: number;
  episode?: number;
  showEpisodeOverlay?: boolean;
  tvSeasons?: TVSeason[];
  onEpisodeSelect?: (season: number, episode: number, episodeName: string) => void;
  onCloseOverlay?: () => void;
  onOpenOverlay?: () => void;
}

export default function DirectVideoPlayer({
  tmdbId,
  mediaType,
  title,
  season,
  episode,
  showEpisodeOverlay,
  tvSeasons = [],
  onEpisodeSelect,
  onCloseOverlay,
  onOpenOverlay,
}: DirectVideoPlayerProps) {
  const [streams, setStreams] = useState<StreamLink[]>([]);
  const [currentStream, setCurrentStream] = useState<StreamLink | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(season || 1);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  useEffect(() => {
    if (!tmdbId || !mediaType) {
      setStreams([]);
      setCurrentStream(null);
      return;
    }

    loadStreams();
  }, [tmdbId, mediaType, season, episode]);

  useEffect(() => {
    if (showEpisodeOverlay && tvSeasons.length > 0 && tmdbId) {
      loadEpisodes(selectedSeason);
    }
  }, [showEpisodeOverlay, selectedSeason, tmdbId]);

  async function loadStreams() {
    setLoading(true);

    try {
      const allStreams = await addonManager.getAllStreams(
        tmdbId!,
        mediaType!,
        season,
        episode
      );

      setStreams(allStreams);
      if (allStreams.length > 0) {
        setCurrentStream(allStreams[0]);
      }
    } catch (error) {
      console.error('Failed to load streams:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadEpisodes(seasonNum: number) {
    if (!tmdbId) return;
    setLoadingEpisodes(true);
    try {
      const eps = await getTVSeasonEpisodes(tmdbId, seasonNum);
      setEpisodes(eps);
    } catch (error) {
      console.error('Failed to load episodes:', error);
    } finally {
      setLoadingEpisodes(false);
    }
  }

  if (!tmdbId || !mediaType) {
    return (
      <div className={styles.placeholder}>
        <h1>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
          </svg>
          StreamLab
        </h1>
        <p>Search or browse to select content</p>
        <div className={styles.info}>
          <p>✨ {addonManager.getEnabledAddons().length} Streaming Sources Active</p>
          <p>🚀 Instant streaming • No ads • Auto-switch on error</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loadingOverlay}>
        <div className={styles.spinner}></div>
        <p>Loading {addonManager.getEnabledAddons().length} stream sources...</p>
      </div>
    );
  }

  if (streams.length === 0) {
    return (
      <div className={styles.errorOverlay}>
        <h3>No Streams Found</h3>
        <p>This content may not be available</p>
        <button className={styles.retryBtn} onClick={loadStreams}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <div className={styles.tab}>
          <span className={styles.tabIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </span>
          <span>{title}</span>
          {mediaType === 'tv' && (
            <button className={styles.episodesBtn} onClick={onOpenOverlay}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/>
              </svg>
              Episodes
            </button>
          )}
        </div>
      </div>

      {streams.length > 1 && (
        <div className={styles.sourceBar}>
          <span className={styles.sourceLabel}>Sources ({streams.length}):</span>
          <div className={styles.sourceBtns}>
            {streams.map((stream, index) => (
              <button
                key={index}
                className={`${styles.sourceBtn} ${
                  currentStream === stream ? styles.active : ''
                }`}
                onClick={() => setCurrentStream(stream)}
              >
                {stream.title || `Source ${index + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.player}>
        {currentStream && (
          <iframe
            key={currentStream.url}
            src={currentStream.url}
            className={styles.iframe}
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          />
        )}
      </div>

      {currentStream && (
        <div className={styles.info}>
          <span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {currentStream.title}
          </span>
          <span>Quality: {currentStream.quality}</span>
        </div>
      )}

      {showEpisodeOverlay && mediaType === 'tv' && (
        <div className={styles.episodeOverlay} onClick={onCloseOverlay}>
          <div className={styles.episodePanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.overlayHeader}>
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/>
                </svg>
                Select Episode
              </h2>
              <button className={styles.closeBtn} onClick={onCloseOverlay}>×</button>
            </div>

            <div className={styles.seasonSelector}>
              {tvSeasons.map((s) => (
                <button
                  key={s.season_number}
                  className={`${styles.seasonBtn} ${selectedSeason === s.season_number ? styles.active : ''}`}
                  onClick={() => setSelectedSeason(s.season_number)}
                >
                  S{s.season_number}
                </button>
              ))}
            </div>

            <div className={styles.episodeList}>
              {loadingEpisodes ? (
                <div className={styles.loading}>Loading episodes...</div>
              ) : (
                episodes.map((ep) => (
                  <div
                    key={ep.episode_number}
                    className={`${styles.episodeCard} ${
                      season === selectedSeason && episode === ep.episode_number ? styles.activeEpisode : ''
                    }`}
                    onClick={() => {
                      onEpisodeSelect?.(selectedSeason, ep.episode_number, ep.name);
                    }}
                  >
                    <div className={styles.episodeNumber}>
                      E{ep.episode_number.toString().padStart(2, '0')}
                    </div>
                    <div className={styles.episodeInfo}>
                      <div className={styles.episodeName}>{ep.name}</div>
                      {ep.overview && (
                        <div className={styles.episodeOverview}>
                          {ep.overview.length > 80 ? `${ep.overview.substring(0, 80)}...` : ep.overview}
                        </div>
                      )}
                    </div>
                    {ep.still_path && (
                      <div 
                        className={styles.episodeThumb}
                        style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w185${ep.still_path})` }}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
