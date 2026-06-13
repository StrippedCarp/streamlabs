'use client';

import styles from './SearchResults.module.css';
import { MediaItem } from '../types';

interface SearchResultsProps {
  results: MediaItem[];
  onSelect: (item: MediaItem) => void;
}

export default function SearchResults({ results, onSelect }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No results found. Try a different search.</p>
      </div>
    );
  }

  return (
    <div className={styles.results}>
      <div className={styles.header}>
        <span>Search Results ({results.length})</span>
      </div>
      <div className={styles.grid}>
        {results.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            className={styles.card}
            onClick={() => onSelect(item)}
          >
            <div className={styles.poster}>
              <img src={item.poster} alt={item.title} />
              <div className={styles.overlay}>
                <span className={styles.playIcon}>▶</span>
              </div>
            </div>
            <div className={styles.info}>
              <div className={styles.title}>{item.title}</div>
              <div className={styles.meta}>
                <span className={styles.year}>{item.year}</span>
                <span className={styles.type}>{item.type === 'movie' ? '🎬' : '📺'}</span>
                <span className={styles.rating}>⭐ {item.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
