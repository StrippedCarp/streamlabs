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
import { MediaItem, TVSeason } from './types';
import { getTVSeasons } from './utils/tmdb';
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

  const handleSearch = (results: MediaItem[]) => {
    setSearchResults(results);
  };

  const handleMediaSelect = async (item: MediaItem) => {
    setSelectedMedia(item);
    setActiveView('player');

    if (item.type === 'movie') {
      setShowEpisodeOverlay(false);
      setCurrentTitle(item.title);
      setCurrentSeason(1);
      setCurrentEpisode(1);
      setMobileTab('player');
    } else {
      const seasons = await getTVSeasons(item.id);
      setTvSeasons(seasons);
      setShowEpisodeOverlay(true);
      setCurrentSeason(1);
      setCurrentEpisode(1);
      setCurrentTitle(`${item.title} S01E01`);
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
  };

  return (
    <div className={styles.app}>
      <Header />

      <div className={styles.container}>
        <ActivityBar activeView={activeView} onViewChange={setActiveView} />
        
        {activeView === 'explorer' && <Browse onMediaSelect={handleMediaSelect} />}
        
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
              <Browse onMediaSelect={handleMediaSelect} />
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
