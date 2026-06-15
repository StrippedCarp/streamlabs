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
              <span className={styles.rating}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {featured.rating}
              </span>
              <span className={styles.year}>{featured.year}</span>
              <span className={styles.type}>
                {featured.type === 'movie' ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
                    </svg>
                    Movie
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/>
                    </svg>
                    TV Show
                  </>
                )}
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Play Now
              </button>
              <button 
                className={styles.infoBtn}
                onClick={() => onMediaSelect(featured)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                More Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trending Now Row */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
          </svg>
          Trending Now
        </h2>
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
                  <div className={styles.cardPlay}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className={styles.cardInfo}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <div className={styles.cardMeta}>
                  <span className={styles.cardRating}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    {item.rating}
                  </span>
                  <span className={styles.cardYear}>{item.year}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Movies Row */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
          </svg>
          Popular Movies
        </h2>
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
                  <div className={styles.cardPlay}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className={styles.cardInfo}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <div className={styles.cardMeta}>
                  <span className={styles.cardRating}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    {item.rating}
                  </span>
                  <span className={styles.cardYear}>{item.year}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TV Shows Row */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/>
          </svg>
          Popular TV Shows
        </h2>
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
                  <div className={styles.cardPlay}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className={styles.cardInfo}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <div className={styles.cardMeta}>
                  <span className={styles.cardRating}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    {item.rating}
                  </span>
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
