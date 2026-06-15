'use client';

import { useState, useEffect } from 'react';
import styles from './ContinueWatching.module.css';
import { getContinueWatchingList, removeFromHistory, WatchHistoryItem } from '../utils/watchHistory';

interface ContinueWatchingProps {
  onMediaSelect: (item: WatchHistoryItem) => void;
}

export default function ContinueWatching({ onMediaSelect }: ContinueWatchingProps) {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  function loadHistory() {
    const items = getContinueWatchingList();
    setHistory(items);
  }

  function handleRemove(item: WatchHistoryItem, e: React.MouseEvent) {
    e.stopPropagation();
    removeFromHistory(item.tmdbId, item.mediaType);
    loadHistory();
  }

  if (history.length === 0) {
    return null;
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
        </svg>
        Continue Watching
      </h2>
      <div className={styles.row}>
        {history.map((item) => (
          <div
            key={`${item.tmdbId}-${item.timestamp}`}
            className={styles.card}
            onClick={() => onMediaSelect(item)}
          >
            <div className={styles.cardPoster}>
              <img src={item.poster} alt={item.title} />
              <button
                className={styles.removeBtn}
                onClick={(e) => handleRemove(item, e)}
                title="Remove from history"
              >
                ×
              </button>
              <div className={styles.overlay}>
                <div className={styles.playIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              {item.progress && item.progress > 0 && (
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}
            </div>
            <div className={styles.cardInfo}>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <div className={styles.cardMeta}>
                {item.mediaType === 'tv' && item.season && item.episode && (
                  <span className={styles.episodeInfo}>
                    S{item.season}E{item.episode}
                    {item.episodeName && ` • ${item.episodeName}`}
                  </span>
                )}
                <span className={styles.serverBadge}>{item.serverName}</span>
              </div>
              <span className={styles.timestamp}>
                {getTimeAgo(item.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  
  return new Date(timestamp).toLocaleDateString();
}
