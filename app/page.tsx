'use client';

import { useState, useEffect } from 'react';
import Header from './components/Header';
import ActivityBar from './components/ActivityBar';
import Browse from './components/Browse';
import VideoPlayer from './components/VideoPlayer';
import DirectVideoPlayer from './components/DirectVideoPlayer';
import StatusBar from './components/StatusBar';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import EpisodeSelector from './components/EpisodeSelector';
import { MediaItem, StreamServer, TVSeason } from './types';
import { getStreamServers, getTVSeasons, getTVSeasonEpisodes } from './utils/tmdb';
import styles from './page.module.css';

export default function Home() {
  const [activeView, setActiveView] = useState('explorer');
  const [mobileTab, setMobileTab] = useState<'browse' | 'player' | 'episodes'>('browse');
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState('Welcome');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [servers, setServers] = useState<StreamServer[]>([]);
  const [currentServer, setCurrentServer] = useState<StreamServer | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [autoRetry, setAutoRetry] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [tvSeasons, setTvSeasons] = useState<TVSeason[]>([]);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [showEpisodeSelector, setShowEpisodeSelector] = useState(false);
  // New: Direct streaming mode toggle
  const [useDirectStreaming, setUseDirectStreaming] = useState(true);

  useEffect(() => {
    if (autoRetry && retryCount > 0 && retryCount < servers.length && currentServer) {
      const timer = setTimeout(() => {
        const nextServer = servers[retryCount];
        if (nextServer) {
          handleServerChange(nextServer, false);
        }
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [retryCount, autoRetry]);

  const handleSearch = (results: MediaItem[]) => {
    setSearchResults(results);
  };

  const handleMediaSelect = async (item: MediaItem) => {
    setSelectedMedia(item);
    setRetryCount(0);

    if (item.type === 'movie') {
      setShowEpisodeSelector(false);
      const streamServers = getStreamServers(item.id, 'movie');
      setServers(streamServers);
      if (streamServers.length > 0) {
        const firstServer = streamServers[0];
        setCurrentServer(firstServer);
        setCurrentUrl(firstServer.url);
        setCurrentTitle(item.title);
      }
      // Auto-switch to player on mobile after selecting
      setMobileTab('player');
    } else {
      const seasons = await getTVSeasons(item.id);
      setTvSeasons(seasons);
      setShowEpisodeSelector(true);

      if (seasons.length > 0) {
        setCurrentSeason(1);
        setCurrentEpisode(1);
        const streamServers = getStreamServers(item.id, 'tv', 1, 1);
        setServers(streamServers);
        if (streamServers.length > 0) {
          const firstServer = streamServers[0];
          setCurrentServer(firstServer);
          setCurrentUrl(firstServer.url);
          setCurrentTitle(`${item.title} S01E01`);
        }
      }
      // Auto-switch to episodes panel on mobile for TV shows
      setMobileTab('episodes');
    }
  };

  const handleEpisodeSelect = (season: number, episode: number, episodeName: string) => {
    if (!selectedMedia) return;

    setCurrentSeason(season);
    setCurrentEpisode(episode);

    const streamServers = getStreamServers(selectedMedia.id, 'tv', season, episode);
    setServers(streamServers);

    if (streamServers.length > 0) {
      const firstServer = streamServers[0];
      setCurrentServer(firstServer);
      setCurrentUrl(firstServer.url);
      setCurrentTitle(`${selectedMedia.title} S${season.toString().padStart(2, '0')}E${episode.toString().padStart(2, '0')} - ${episodeName}`);
    }
    // Switch to player after picking an episode on mobile
    setMobileTab('player');
  };

  const handleServerChange = (server: StreamServer, resetRetry = true) => {
    if (resetRetry) {
      setRetryCount(0);
    }
    setCurrentServer(server);
    setCurrentUrl(server.url);
  };

  return (
    <div className={styles.app}>
      <Header />

      {/* Streaming Mode Toggle */}
      <div className={styles.modeToggle}>
        <button
          className={`${styles.modeBtn} ${useDirectStreaming ? styles.modeActive : ''}`}
          onClick={() => setUseDirectStreaming(true)}
        >
          ⚡ Direct Streaming (No Ads)
        </button>
        <button
          className={`${styles.modeBtn} ${!useDirectStreaming ? styles.modeActive : ''}`}
          onClick={() => setUseDirectStreaming(false)}
        >
          🔗 Embed Mode (Fallback)
        </button>
      </div>

      {/* ── Desktop layout ── */}
      <div className={styles.container}>
        <ActivityBar activeView={activeView} onViewChange={setActiveView} />
        {activeView === 'explorer' && (
          <Browse onMediaSelect={handleMediaSelect} />
        )}
        {activeView === 'search' && (
          <div className={styles.searchPanel}>
            <SearchBar onSearch={handleSearch} />
            <SearchResults results={searchResults} onSelect={handleMediaSelect} />
          </div>
        )}
        <div className={styles.main}>
          {useDirectStreaming ? (
            <DirectVideoPlayer
              tmdbId={selectedMedia?.id || null}
              mediaType={selectedMedia?.type || null}
              title={currentTitle}
              season={currentSeason}
              episode={currentEpisode}
            />
          ) : (
            <VideoPlayer
              url={currentUrl}
              title={currentTitle}
              servers={servers}
              currentServer={currentServer}
              onServerChange={handleServerChange}
            />
          )}
          <StatusBar currentMedia={currentTitle !== 'Welcome' ? currentTitle : ''} />
        </div>
        {showEpisodeSelector && selectedMedia && tvSeasons.length > 0 && (
          <EpisodeSelector
            tmdbId={selectedMedia.id}
            seasons={tvSeasons}
            onEpisodeSelect={handleEpisodeSelect}
            currentSeason={currentSeason}
            currentEpisode={currentEpisode}
          />
        )}
      </div>

      {/* ── Mobile layout ── */}
      <div className={styles.mobileContainer}>
        {/* Mobile tab: Browse / Search */}
        {(mobileTab === 'browse') && (
          <div className={styles.mobilePanel}>
            {activeView === 'explorer' && (
              <Browse onMediaSelect={handleMediaSelect} />
            )}
            {activeView === 'search' && (
              <div className={styles.mobileSearchPanel}>
                <SearchBar onSearch={handleSearch} />
                <SearchResults results={searchResults} onSelect={handleMediaSelect} />
              </div>
            )}
          </div>
        )}

        {/* Mobile tab: Player */}
        {mobileTab === 'player' && (
          <div className={styles.mobilePanel}>
            {useDirectStreaming ? (
              <DirectVideoPlayer
                tmdbId={selectedMedia?.id || null}
                mediaType={selectedMedia?.type || null}
                title={currentTitle}
                season={currentSeason}
                episode={currentEpisode}
              />
            ) : (
              <VideoPlayer
                url={currentUrl}
                title={currentTitle}
                servers={servers}
                currentServer={currentServer}
                onServerChange={handleServerChange}
              />
            )}
          </div>
        )}

        {/* Mobile tab: Episodes */}
        {mobileTab === 'episodes' && showEpisodeSelector && selectedMedia && tvSeasons.length > 0 && (
          <div className={styles.mobilePanel}>
            <EpisodeSelector
              tmdbId={selectedMedia.id}
              seasons={tvSeasons}
              onEpisodeSelect={handleEpisodeSelect}
              currentSeason={currentSeason}
              currentEpisode={currentEpisode}
            />
          </div>
        )}
        {mobileTab === 'episodes' && !showEpisodeSelector && (
          <div className={styles.mobilePanel}>
            <Browse onMediaSelect={handleMediaSelect} />
          </div>
        )}

        {/* Mobile bottom nav */}
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
          {showEpisodeSelector && (
            <button
              className={`${styles.mobileNavBtn} ${mobileTab === 'episodes' ? styles.mobileNavActive : ''}`}
              onClick={() => setMobileTab('episodes')}
            >
              <span>📺</span>
              <span>Episodes</span>
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}
