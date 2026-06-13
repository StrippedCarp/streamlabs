'use client';

import { useState } from 'react';
import styles from './SearchBar.module.css';
import { MediaItem } from '../types';

interface SearchBarProps {
  onSearch: (results: MediaItem[]) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setLoading(true);
      try {
        const { searchMedia } = await import('../utils/tmdb');
        const results = await searchMedia(query.trim());
        onSearch(results);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={styles.searchBar}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <span className={styles.icon}>{loading ? '⏳' : '🔍'}</span>
        <input
          type="text"
          placeholder="Search movies and TV shows..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.input}
          disabled={loading}
        />
        {query && !loading && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className={styles.clear}
          >
            ×
          </button>
        )}
      </form>
    </div>
  );
}
