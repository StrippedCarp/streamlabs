'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import styles from './DirectVideoPlayer.module.css';

interface StreamSource {
  url: string;
  quality: string;
  type: string;
  provider: string;
  subtitles?: Array<{ url: string; lang: string; label: string }>;
}

interface DirectVideoPlayerProps {
  tmdbId: number | null;
  mediaType: 'movie' | 'tv' | null;
  title: string;
  season?: number;
  episode?: number;
}

export default function DirectVideoPlayer({
  tmdbId,
  mediaType,
  title,
  season,
  episode,
}: DirectVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [sources, setSources] = useState<StreamSource[]>([]);
  const [currentSource, setCurrentSource] = useState<StreamSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch streams when media is selected
  useEffect(() => {
    if (!tmdbId || !mediaType) {
      setSources([]);
      setCurrentSource(null);
      return;
    }

    fetchStreams();
  }, [tmdbId, mediaType, season, episode]);

  // Load video when source changes
  useEffect(() => {
    if (!currentSource || !videoRef.current) return;

    loadVideo(currentSource);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentSource]);

  async function fetchStreams() {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        tmdbId: tmdbId!.toString(),
        type: mediaType!,
      });

      if (mediaType === 'tv' && season && episode) {
        params.append('season', season.toString());
        params.append('episode', episode.toString());
      }

      const response = await fetch(`/api/stream?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to fetch streams');
      }

      if (data.sources && data.sources.length > 0) {
        setSources(data.sources);
        setCurrentSource(data.sources[0]); // Use first (best quality)
      } else {
        setError(data?.message || 'No streams available for this content');
      }
    } catch (err) {
      console.error('Stream fetch error:', err);
      setError('Failed to load streams. Try a different title.');
    } finally {
      setLoading(false);
    }
  }

  function loadVideo(source: StreamSource) {
    if (!videoRef.current) return;

    const video = videoRef.current;

    // Clear previous source
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (source.type === 'hls' || source.url.includes('.m3u8')) {
      // HLS streaming
      if (Hls.isSupported()) {
        hlsRef.current = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });

        hlsRef.current.loadSource(source.url);
        hlsRef.current.attachMedia(video);

        hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(console.error);
        });

        hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error('HLS fatal error:', data);
            setError(`Playback error: ${data.type}`);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = source.url;
        video.play().catch(console.error);
      } else {
        setError('HLS not supported in this browser');
      }
    } else {
      // Direct MP4
      video.src = source.url;
      video.play().catch(console.error);
    }

    // Add subtitles if available
    if (source.subtitles && source.subtitles.length > 0) {
      // Clear existing tracks
      while (video.firstChild) {
        video.removeChild(video.firstChild);
      }

      source.subtitles.forEach((sub) => {
        const track = document.createElement('track');
        track.kind = 'subtitles';
        track.label = sub.label;
        track.srclang = sub.lang;
        track.src = sub.url;
        video.appendChild(track);
      });
    }
  }

  if (!tmdbId || !mediaType) {
    return (
      <div className={styles.placeholder}>
        <h1>🎬 StreamLab Direct Player</h1>
        <p>Search or browse to select a movie or TV show</p>
        <div className={styles.info}>
          <p>✨ No ads  •  🚀 Fast streaming  •  🎯 Direct links</p>
          <p>Powered by free community APIs</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loadingOverlay}>
        <div className={styles.spinner}></div>
        <p>Fetching stream links...</p>
        <p className={styles.hint}>Finding the best quality source</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorOverlay}>
        <h3>❌ Stream Error</h3>
        <p>{error}</p>
        <button className={styles.retryBtn} onClick={fetchStreams}>
          🔄 Retry
        </button>
        <p className={styles.hint}>Try switching to Embed Mode above for more streaming options</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <div className={styles.tab}>
          <span className={styles.tabIcon}>▶</span>
          <span>{title}</span>
        </div>
      </div>

      {sources.length > 1 && (
        <div className={styles.sourceBar}>
          <span className={styles.sourceLabel}>Sources:</span>
          {sources.map((source, index) => (
            <button
              key={index}
              className={`${styles.sourceBtn} ${
                currentSource === source ? styles.active : ''
              }`}
              onClick={() => setCurrentSource(source)}
            >
              {source.provider} ({source.quality})
            </button>
          ))}
        </div>
      )}

      <div className={styles.player}>
        <video
          ref={videoRef}
          className={styles.video}
          controls
          controlsList="nodownload"
          crossOrigin="anonymous"
          playsInline
        />
      </div>

      {currentSource && (
        <div className={styles.info}>
          <span>Provider: {currentSource.provider}</span>
          <span>Quality: {currentSource.quality}</span>
          <span>Type: {currentSource.type.toUpperCase()}</span>
        </div>
      )}
    </div>
  );
}
