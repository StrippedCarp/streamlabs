'use client';

import { useEffect, useState } from 'react';
import { addonManager, StreamLink } from '../lib/addons';
import styles from './DirectVideoPlayer.module.css';

interface DirectVideoPlayerProps {
  tmdbId: number | null;
  mediaType: 'movie' | 'tv' | null;
  title: string;
  season?: number;
  episode?: number;
}

export default function DirectVideoPlayer({
  tmdbId,
  mediaType,
  title,
  season,
  episode,
}: DirectVideoPlayerProps) {
  const [streams, setStreams] = useState<StreamLink[]>([]);
  const [currentStream, setCurrentStream] = useState<StreamLink | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tmdbId || !mediaType) {
      setStreams([]);
      setCurrentStream(null);
      return;
    }

    loadStreams();
  }, [tmdbId, mediaType, season, episode]);

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

  if (!tmdbId || !mediaType) {
    return (
      <div className={styles.placeholder}>
        <h1>🎬 StreamLab Direct</h1>
        <p>Search or browse to select content</p>
        <div className={styles.info}>
          <p>✨ {addonManager.getEnabledAddons().length} Addons Active</p>
          <p>🚀 Instant streaming • No ads • Auto-switch</p>
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
        <p>Try switching to Embed Mode above</p>
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
        </div>
      </div>

      {streams.length > 1 && (
        <div className={styles.sourceBar}>
          <span className={styles.sourceLabel}>Addons ({streams.length}):</span>
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
    </div>
  );
}
