'use client';

import { useState, useEffect } from 'react';
import styles from './Browse.module.css';
import { MediaItem } from '../types';
import { getTrending } from '../utils/tmdb';

interface BrowseProps {
  onMediaSelect: (item: MediaItem) => void;
}

export default function Browse({ onMediaSelect }: BrowseProps) {
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [featured, setFeatured] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    const items = await getTrending();
    setTrending(items);
    if (items.length > 0) {
      setFeatured(items[0]);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading content...</p>
      </div>
    );
  }

  return (
    <div className={styles.browse}>
      {/* Featured Hero */}
      {featured && (
        <div className={styles.hero}>
          <div 
            className={styles.heroBackground}
            style={{ backgroundImage: `url(${featured.poster})` }}
          >
            <div className={styles.heroOverlay}></div>
          </div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>{featured.title}</h1>
            <div className={styles.heroMeta}>
              <span className={styles.rating}>⭐ {featured.rating}</span>
              <span className={styles.year}>{featured.year}</span>
              <span className={styles.type}>
                {featured.type === 'movie' ? '🎬 Movie' : '📺 TV Show'}
              </span>
            </div>
            <p className={styles.heroOverview}>
              {featured.overview.length > 200 
                ? `${featured.overview.substring(0, 200)}...` 
                : featured.overview}
            </p>
            <div className={styles.heroButtons}>
              <button 
                className={styles.playBtn}
                onClick={() => onMediaSelect(featured)}
              >
                <span>▶</span> Play Now
              </button>
              <button className={styles.infoBtn}>
                <span>ℹ️</span> More Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trending Now Row */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>🔥 Trending Now</h2>
        <div className={styles.row}>
          {trending.slice(0, 10).map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className={styles.card}
              onClick={() => onMediaSelect(item)}
            >
              <div className={styles.cardPoster}>
                <img src={item.poster} alt={item.title} />
                <div className={styles.cardOverlay}>
                  <div className={styles.cardPlay}>▶</div>
                </div>
              </div>
              <div className={styles.cardInfo}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <div className={styles.cardMeta}>
                  <span className={styles.cardRating}>⭐ {item.rating}</span>
                  <span className={styles.cardYear}>{item.year}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Movies Row */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>🎬 Popular Movies</h2>
        <div className={styles.row}>
          {trending.filter(item => item.type === 'movie').slice(0, 10).map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className={styles.card}
              onClick={() => onMediaSelect(item)}
            >
              <div className={styles.cardPoster}>
                <img src={item.poster} alt={item.title} />
                <div className={styles.cardOverlay}>
                  <div className={styles.cardPlay}>▶</div>
                </div>
              </div>
              <div className={styles.cardInfo}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <div className={styles.cardMeta}>
                  <span className={styles.cardRating}>⭐ {item.rating}</span>
                  <span className={styles.cardYear}>{item.year}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TV Shows Row */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>📺 Popular TV Shows</h2>
        <div className={styles.row}>
          {trending.filter(item => item.type === 'tv').slice(0, 10).map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className={styles.card}
              onClick={() => onMediaSelect(item)}
            >
              <div className={styles.cardPoster}>
                <img src={item.poster} alt={item.title} />
                <div className={styles.cardOverlay}>
                  <div className={styles.cardPlay}>▶</div>
                </div>
              </div>
              <div className={styles.cardInfo}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <div className={styles.cardMeta}>
                  <span className={styles.cardRating}>⭐ {item.rating}</span>
                  <span className={styles.cardYear}>{item.year}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
