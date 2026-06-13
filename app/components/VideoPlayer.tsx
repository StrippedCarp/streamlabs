'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './VideoPlayer.module.css';
import StreamStatus from './StreamStatus';
import { StreamServer } from '../types';

interface VideoPlayerProps {
  url: string | null;
  title: string;
  servers?: StreamServer[];
  onServerChange?: (server: StreamServer) => void;
  currentServer?: StreamServer | null;
}

export default function VideoPlayer({ url, title, servers, onServerChange, currentServer }: VideoPlayerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [loadTimeout, setLoadTimeout] = useState(false);
  const [autoSwitching, setAutoSwitching] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const autoSwitchRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (url) {
      setLoading(true);
      setError(false);
      setLoadTimeout(false);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setLoadTimeout(true);
        setLoading(false);
        // Record timeout as failure
        if (currentServer && typeof window !== 'undefined') {
          import('../utils/tmdb').then(({ recordProviderFailure }) => {
            recordProviderFailure(currentServer.provider);
          });
        }
        // Auto-switch to next server after timeout
        tryNextServer();
      }, 15000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (autoSwitchRef.current) {
        clearTimeout(autoSwitchRef.current);
      }
    };
  }, [url]);

  const tryNextServer = () => {
    if (!servers || !onServerChange || !currentServer) return;
    
    const currentIndex = servers.findIndex(s => s.id === currentServer.id);
    const nextServer = servers[currentIndex + 1];
    
    if (nextServer) {
      setAutoSwitching(true);
      autoSwitchRef.current = setTimeout(() => {
        onServerChange(nextServer);
        setAutoSwitching(false);
      }, 2000);
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
    setError(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Record successful load
    if (currentServer && typeof window !== 'undefined') {
      import('../utils/tmdb').then(({ recordProviderSuccess }) => {
        recordProviderSuccess(currentServer.provider);
      });
    }
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Record failure
    if (currentServer && typeof window !== 'undefined') {
      import('../utils/tmdb').then(({ recordProviderFailure }) => {
        recordProviderFailure(currentServer.provider);
      });
    }
    // Auto-switch to next server on error
    tryNextServer();
  };

  const getServersByQuality = () => {
    if (!servers) return { high: [], medium: [], low: [] };
    return {
      high: servers.filter(s => s.quality === 'high'),
      medium: servers.filter(s => s.quality === 'medium'),
      low: servers.filter(s => s.quality === 'low')
    };
  };

  const serverGroups = getServersByQuality();

  const renderServerButton = (server: StreamServer) => {
    const isActive = currentServer?.id === server.id;
    const isError = error && isActive;
    const isTimeout = loadTimeout && isActive;
    
    return (
      <button
        key={server.id}
        className={`${styles.serverBtn} ${
          isActive ? styles.active : ''
        } ${
          isError || isTimeout ? styles.error : ''
        }`}
        onClick={() => onServerChange?.(server)}
        title={`${server.name} - ${server.quality} quality (${server.reliability}% reliable)`}
      >
        {isActive && loading && '⏳ '}
        {isError && '❌ '}
        {isTimeout && '⏱️ '}
        {server.name}
      </button>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <div className={styles.tab}>
          <span className={styles.tabIcon}>▶</span>
          <span>{title}</span>
          {url && (
            <span 
              className={styles.tabClose}
              onClick={(e) => {
                e.stopPropagation();
                window.location.reload();
              }}
            >
              ×
            </span>
          )}
        </div>
      </div>

      {url && currentServer && (
        <StreamStatus
          isLoading={loading}
          hasError={error}
          hasTimeout={loadTimeout}
          currentServer={currentServer.name}
        />
      )}
      
      {servers && servers.length > 0 && onServerChange && (
        <div className={styles.serverBar}>
          <div className={styles.serverGroup}>
            <span className={styles.serverLabel}>Quality:</span>
            {serverGroups.high.length > 0 && (
              <>
                <span className={styles.qualityBadge}>🟢 High</span>
                {serverGroups.high.map(renderServerButton)}
              </>
            )}
            {serverGroups.medium.length > 0 && (
              <>
                <span className={styles.qualityBadge}>🟡 Medium</span>
                {serverGroups.medium.map(renderServerButton)}
              </>
            )}
            {serverGroups.low.length > 0 && (
              <>
                <span className={styles.qualityBadge}>🔴 Low</span>
                {serverGroups.low.map(renderServerButton)}
              </>
            )}
          </div>
        </div>
      )}
      
      <div className={styles.player}>
        {url ? (
          <>
            {(loading || autoSwitching) && (
              <div className={styles.loadingOverlay}>
                <div className={styles.spinner}></div>
                {autoSwitching ? (
                  <>
                    <p>🔄 Auto-switching to next server...</p>
                    <p className={styles.hint}>Finding a working server for you</p>
                  </>
                ) : (
                  <>
                    <p>Loading stream from {currentServer?.name}...</p>
                    <p className={styles.hint}>Will auto-switch if server fails</p>
                  </>
                )}
              </div>
            )}
            {error && !autoSwitching && (
              <div className={styles.errorOverlay}>
                <h3>❌ Server Error</h3>
                <p><strong>{currentServer?.name}</strong> is down. Trying next server...</p>
                <p className={styles.hint}>Auto-switching in 2 seconds</p>
              </div>
            )}
            {loadTimeout && !autoSwitching && (
              <div className={styles.errorOverlay}>
                <h3>⏱️ Connection Timeout</h3>
                <p><strong>{currentServer?.name}</strong> is too slow. Switching servers...</p>
                <p className={styles.hint}>Auto-switching in 2 seconds</p>
              </div>
            )}
            <iframe
              ref={iframeRef}
              key={url}
              src={url}
              className={styles.iframe}
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer"
              referrerPolicy="origin"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              style={{ opacity: loading || error || loadTimeout || autoSwitching ? 0.3 : 1 }}
            />
          </>
        ) : (
          <div className={styles.placeholder}>
            <h1>🎬 StreamLab</h1>
            <p>Search or select a movie/TV show to start streaming</p>
            <div className={styles.info}>
              <p>🔍 Search  •  🎬 Movies  •  📺 TV Shows</p>
              <p>10 High-Quality Servers • Auto-Detection • Smart Auto-Switch</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
