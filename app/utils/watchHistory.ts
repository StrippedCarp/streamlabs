// Watch History Manager
// Tracks what users are watching and their progress

export interface WatchHistoryItem {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  poster: string;
  season?: number;
  episode?: number;
  episodeName?: string;
  serverId: string;
  serverName: string;
  timestamp: number;
  progress?: number; // 0-100 percentage
}

const WATCH_HISTORY_KEY = 'streamlab_watch_history';
const MAX_HISTORY_ITEMS = 20;

export function saveWatchHistory(item: Omit<WatchHistoryItem, 'timestamp'>): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getWatchHistory();
    
    // Remove existing entry for same content
    const filteredHistory = history.filter(
      h => !(h.tmdbId === item.tmdbId && h.mediaType === item.mediaType)
    );

    // Add new entry at the beginning
    const newItem: WatchHistoryItem = {
      ...item,
      timestamp: Date.now(),
    };

    filteredHistory.unshift(newItem);

    // Keep only the most recent items
    const trimmedHistory = filteredHistory.slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Failed to save watch history:', error);
  }
}

export function getWatchHistory(): WatchHistoryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(WATCH_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load watch history:', error);
    return [];
  }
}

export function getLastWatched(tmdbId: number, mediaType: 'movie' | 'tv'): WatchHistoryItem | null {
  const history = getWatchHistory();
  return history.find(h => h.tmdbId === tmdbId && h.mediaType === mediaType) || null;
}

export function clearWatchHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(WATCH_HISTORY_KEY);
}

export function removeFromHistory(tmdbId: number, mediaType: 'movie' | 'tv'): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getWatchHistory();
    const filtered = history.filter(
      h => !(h.tmdbId === tmdbId && h.mediaType === mediaType)
    );
    localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove from history:', error);
  }
}

export function getContinueWatchingList(): WatchHistoryItem[] {
  return getWatchHistory().slice(0, 10);
}
