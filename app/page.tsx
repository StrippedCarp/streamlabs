'use client';

import { useState } from 'react';
import Header from './components/Header';
import ActivityBar from './components/ActivityBar';
import Browse from './components/Browse';
import StatusBar from './components/StatusBar';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import DirectVideoPlayer from './components/DirectVideoPlayer2';
import MediaDetails from './components/MediaDetails';
import ContinueWatching from './components/ContinueWatching';
import { MediaItem, TVSeason } from './types';
import { getTVSeasons } from './utils/tmdb';
import { saveWatchHistory, getLastWatched, WatchHistoryItem } from './utils/watchHistory';
import styles from './page.module.css';

export default function Home() {
  const [activeView, setActiveView] = useState('explorer');
  const [mobileTab, setMobileTab] = useState<'browse' | 'player'>('browse');
  const [currentTitle, setCurrentTitle] = useState('Welcome');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [showEpisodeOverlay, setShowEpisodeOverlay] = useState(false);
  const [tvSeasons, setTvSeasons] = useState<TVSeason[]>([]);
  const [currentServerId, setCurrentServerId] = useState<string>('');
  const [currentServerName, setCurrentServerName] = useState<string>('');

  const handleSearch = (results: MediaItem[]) => {
    setSearchResults(results);
  };

  const handleMediaSelect = async (item: MediaItem) => {
    setSelectedMedia(item);
    setActiveView('player');

    const lastWatched = getLastWatched(item.id, item.type);

    if (item.type === 'movie') {
      setShowEpisodeOverlay(false);
      setCurrentTitle(item.title);
      setCurrentSeason(1);
      setCurrentEpisode(1);
      
      if (lastWatched) {
        setCurrentServerId(lastWatched.serverId);
        setCurrentServerName(lastWatched.serverName);
      }
      
      setMobileTab('player');
    } else {
      const seasons = await getTVSeasons(item.id);
      setTvSeasons(seasons);
      setShowEpisodeOverlay(true);

      const startSeason = lastWatched?.season || 1;
      const startEpisode = lastWatched?.episode || 1;
      
      setCurrentSeason(startSeason);
      setCurrentEpisode(startEpisode);
      
      if (lastWatched?.serverId) {
        setCurrentServerId(lastWatched.serverId);
        setCurrentServerName(lastWatched.serverName);
      }
      
      setCurrentTitle(`${item.title} S${startSeason.toString().padStart(2, '0')}E${startEpisode.toString().padStart(2, '0')}`);
      setMobileTab('player');
    }

    saveWatchHistory({
      tmdbId: item.id,
      mediaType: item.type,
      title: item.title,
      poster: item.poster,
      season: item.type === 'tv' ? (lastWatched?.season || 1) : undefined,
      episode: item.type === 'tv' ? (lastWatched?.episode || 1) : undefined,
      serverId: lastWatched?.serverId || '',
      serverName: lastWatched?.serverName || 'Default',
    });
  };

  const handleContinueWatching = async (item: WatchHistoryItem) => {
    setSelectedMedia({
      id: item.tmdbId,
      title: item.title,
      type: item.mediaType,
      poster: item.poster,
      year: '',
      rating: 0,
      overview: '',
    });
    setActiveView('player');
    setCurrentServerId(item.serverId);
    setCurrentServerName(item.serverName);

    if (item.mediaType === 'movie') {
      setShowEpisodeOverlay(false);
      setCurrentTitle(item.title);
      setCurrentSeason(1);
      setCurrentEpisode(1);
      setMobileTab('player');
    } else {
      const seasons = await getTVSeasons(item.tmdbId);
      setTvSeasons(seasons);
      setShowEpisodeOverlay(false);
      setCurrentSeason(item.season || 1);
      setCurrentEpisode(item.episode || 1);
      setCurrentTitle(`${item.title} S${(item.season || 1).toString().padStart(2, '0')}E${(item.episode || 1).toString().padStart(2, '0')}${item.episodeName ? ` - ${item.episodeName}` : ''}`);
      setMobileTab('player');
    }
  };

  const handleEpisodeSelect = (season: number, episode: number, episodeName: string) => {
    if (!selectedMedia) return;

    setCurrentSeason(season);
    setCurrentEpisode(episode);
    setCurrentTitle(`${selectedMedia.title} S${season.toString().padStart(2, '0')}E${episode.toString().padStart(2, '0')} - ${episodeName}`);
    setShowEpisodeOverlay(false);
    setMobileTab('player');

    saveWatchHistory({
      tmdbId: selectedMedia.id,
      mediaType: selectedMedia.type,
      title: selectedMedia.title,
      poster: selectedMedia.poster,
      season,
      episode,
      episodeName,
      serverId: currentServerId,
      serverName: currentServerName,
    });
  };

  const handleServerChange = (serverId: string, serverName: string) => {
    setCurrentServerId(serverId);
    setCurrentServerName(serverName);
    
    if (selectedMedia) {
      saveWatchHistory({
        tmdbId: selectedMedia.id,
        mediaType: selectedMedia.type,
        title: selectedMedia.title,
        poster: selectedMedia.poster,
        season: selectedMedia.type === 'tv' ? currentSeason : undefined,
        episode: selectedMedia.type === 'tv' ? currentEpisode : undefined,
        serverId,
        serverName,
      });
    }
  };

  return (
    <div className={styles.app}>
      <Header />

      <div className={styles.container}>
        <ActivityBar activeView={activeView} onViewChange={setActiveView} />
        
        {activeView === 'explorer' && (
          <>
            <ContinueWatching onMediaSelect={handleContinueWatching} />
            <Browse onMediaSelect={handleMediaSelect} />
          </>
        )}
        
        {activeView === 'search' && (
          <div className={styles.searchPanel}>
            <SearchBar onSearch={handleSearch} />
            <SearchResults results={searchResults} onSelect={handleMediaSelect} />
          </div>
        )}
        
        {activeView === 'player' && (
          <div className={styles.main}>
            <DirectVideoPlayer
              tmdbId={selectedMedia?.id || null}
              mediaType={selectedMedia?.type || null}
              title={currentTitle}
              season={currentSeason}
              episode={currentEpisode}
              showEpisodeOverlay={showEpisodeOverlay}
              tvSeasons={tvSeasons}
              onEpisodeSelect={handleEpisodeSelect}
              onCloseOverlay={() => setShowEpisodeOverlay(false)}
              onOpenOverlay={() => setShowEpisodeOverlay(true)}
              onServerChange={handleServerChange}
              defaultServerId={currentServerId}
            />
            <StatusBar currentMedia={currentTitle !== 'Welcome' ? currentTitle : ''} />
            {selectedMedia && (
              <MediaDetails
                tmdbId={selectedMedia.id}
                mediaType={selectedMedia.type}
                currentSeason={currentSeason}
                currentEpisode={currentEpisode}
                onEpisodeSelect={handleEpisodeSelect}
              />
            )}
          </div>
        )}
      </div>

      <div className={styles.mobileContainer}>
        {mobileTab === 'browse' && (
          <div className={styles.mobilePanel}>
            {activeView === 'explorer' ? (
              <>
                <ContinueWatching onMediaSelect={handleContinueWatching} />
                <Browse onMediaSelect={handleMediaSelect} />
              </>
            ) : (
              <div className={styles.mobileSearchPanel}>
                <SearchBar onSearch={handleSearch} />
                <SearchResults results={searchResults} onSelect={handleMediaSelect} />
              </div>
            )}
          </div>
        )}

        {mobileTab === 'player' && (
          <div className={styles.mobilePanel}>
            <DirectVideoPlayer
              tmdbId={selectedMedia?.id || null}
              mediaType={selectedMedia?.type || null}
              title={currentTitle}
              season={currentSeason}
              episode={currentEpisode}
              showEpisodeOverlay={showEpisodeOverlay}
              tvSeasons={tvSeasons}
              onEpisodeSelect={handleEpisodeSelect}
              onCloseOverlay={() => setShowEpisodeOverlay(false)}
              onOpenOverlay={() => setShowEpisodeOverlay(true)}
              onServerChange={handleServerChange}
              defaultServerId={currentServerId}
            />
            {selectedMedia && (
              <MediaDetails
                tmdbId={selectedMedia.id}
                mediaType={selectedMedia.type}
                currentSeason={currentSeason}
                currentEpisode={currentEpisode}
                onEpisodeSelect={handleEpisodeSelect}
              />
            )}
          </div>
        )}

        <nav className={styles.mobileNav}>
          <button
            className={`${styles.mobileNavBtn} ${mobileTab === 'browse' && activeView === 'explorer' ? styles.mobileNavActive : ''}`}
            onClick={() => { setMobileTab('browse'); setActiveView('explorer'); }}
          >
            <span>📁</span>
            <span>Browse</span>
          </button>
          <button
            className={`${styles.mobileNavBtn} ${mobileTab === 'browse' && activeView === 'search' ? styles.mobileNavActive : ''}`}
            onClick={() => { setMobileTab('browse'); setActiveView('search'); }}
          >
            <span>🔍</span>
            <span>Search</span>
          </button>
          <button
            className={`${styles.mobileNavBtn} ${mobileTab === 'player' ? styles.mobileNavActive : ''}`}
            onClick={() => setMobileTab('player')}
          >
            <span>▶</span>
            <span>Player</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
