'use client';

import { useEffect, useState } from 'react';
import styles from './StreamStatus.module.css';

interface StreamStatusProps {
  isLoading: boolean;
  hasError: boolean;
  hasTimeout: boolean;
  currentServer: string | null;
}

export default function StreamStatus({ isLoading, hasError, hasTimeout, currentServer }: StreamStatusProps) {
  const [connectionSpeed, setConnectionSpeed] = useState<'fast' | 'medium' | 'slow'>('fast');

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn) {
        const updateSpeed = () => {
          const effectiveType = conn.effectiveType;
          if (effectiveType === '4g') {
            setConnectionSpeed('fast');
          } else if (effectiveType === '3g') {
            setConnectionSpeed('medium');
          } else {
            setConnectionSpeed('slow');
          }
        };
        updateSpeed();
        conn.addEventListener('change', updateSpeed);
        return () => conn.removeEventListener('change', updateSpeed);
      }
    }
  }, []);

  const getStatus = () => {
    if (hasError) return { icon: '❌', text: 'Server Error', color: '#d32f2f' };
    if (hasTimeout) return { icon: '⏱️', text: 'Timeout', color: '#f57c00' };
    if (isLoading) return { icon: '⏳', text: 'Connecting...', color: '#ffa726' };
    return { icon: '✅', text: 'Streaming', color: '#4caf50' };
  };

  const getSpeedIndicator = () => {
    if (connectionSpeed === 'fast') return { icon: '🟢', text: 'Fast' };
    if (connectionSpeed === 'medium') return { icon: '🟡', text: 'Medium' };
    return { icon: '🔴', text: 'Slow' };
  };

  const status = getStatus();
  const speed = getSpeedIndicator();

  if (!currentServer) return null;

  return (
    <div className={styles.status}>
      <div className={styles.indicator} style={{ color: status.color }}>
        <span className={styles.icon}>{status.icon}</span>
        <span className={styles.text}>{status.text}</span>
      </div>
      <div className={styles.divider}>|</div>
      <div className={styles.speed}>
        <span className={styles.icon}>{speed.icon}</span>
        <span className={styles.text}>{speed.text}</span>
      </div>
      <div className={styles.divider}>|</div>
      <div className={styles.server}>
        <span className={styles.text}>Server: {currentServer}</span>
      </div>
    </div>
  );
}
