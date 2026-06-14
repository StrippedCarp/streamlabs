'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './HLSPlayer.module.css';

interface HLSPlayerProps {
  src: string;
  type: 'direct' | 'hls' | 'dash';
  poster?: string;
  onReady?: () => void;
  onError?: () => void;
}

export default function HLSPlayer({ src, type, poster, onReady, onError }: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hlsInstance, setHlsInstance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    // HLS Stream Handler
    if (type === 'hls' && src.includes('.m3u8')) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = src;
        video.addEventListener('loadeddata', handleReady);
        video.addEventListener('error', handleError);
      } else {
        // Use HLS.js for other browsers
        loadHLS();
      }
    } 
    // DASH Stream Handler
    else if (type === 'dash' && src.includes('.mpd')) {
      loadDASH();
    } 
    // Direct Stream
    else {
      video.src = src;
      video.addEventListener('loadeddata', handleReady);
      video.addEventListener('error', handleError);
    }

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
      video.removeEventListener('loadeddata', handleReady);
      video.removeEventListener('error', handleError);
    };
  }, [src, type]);

  const loadHLS = async () => {
    try {
      const Hls = (await import('hls.js')).default;
      
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(src);
        hls.attachMedia(videoRef.current!);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          handleReady();
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            handleError();
          }
        });

        setHlsInstance(hls);
      }
    } catch (err) {
      console.error('HLS.js loading failed:', err);
      handleError();
    }
  };

  const loadDASH = async () => {
    try {
      const dashjs = (await import('dashjs')).default;
      const player = dashjs.MediaPlayer().create();
      player.initialize(videoRef.current!, src, true);
      
      player.on('canPlay', handleReady);
      player.on('error', handleError);
    } catch (err) {
      console.error('DASH loading failed:', err);
      handleError();
    }
  };

  const handleReady = () => {
    setLoading(false);
    setError(false);
    onReady?.();
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    onError?.();
  };

  return (
    <div className={styles.playerContainer}>
      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading video...</p>
        </div>
      )}
      {error && (
        <div className={styles.error}>
          <h3>❌ Playback Error</h3>
          <p>Failed to load video stream</p>
        </div>
      )}
      <video
        ref={videoRef}
        className={styles.video}
        controls
        playsInline
        poster={poster}
        autoPlay
        style={{ display: loading || error ? 'none' : 'block' }}
      />
    </div>
  );
}
