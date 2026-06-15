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
        <h1>🎬 StreamLab</h1>
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
        <h3>❌ No Streams Found</h3>
        <p>This content may not be available</p>
        <button className={styles.retryBtn} onClick={loadStreams}>
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <div className={styles.tab}>
          <span className={styles.tabIcon}>▶</span>
          <span>{title}</span>
          {mediaType === 'tv' && (
            <button className={styles.episodesBtn} onClick={onOpenOverlay}>
              📺 Episodes
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
          <span>🎯 {currentStream.title}</span>
          <span>📊 Quality: {currentStream.quality}</span>
        </div>
      )}

      {showEpisodeOverlay && mediaType === 'tv' && (
        <div className={styles.episodeOverlay} onClick={onCloseOverlay}>
          <div className={styles.episodePanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.overlayHeader}>
              <h2>📺 Select Episode</h2>
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
