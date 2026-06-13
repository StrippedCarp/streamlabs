'use client';

import styles from './StatusBar.module.css';

interface StatusBarProps {
  currentMedia: string;
}

export default function StatusBar({ currentMedia }: StatusBarProps) {
  return (
    <div className={styles.statusBar}>
      <div className={styles.left}>
        <div className={styles.item}>
          <span>📡</span>
          <span>{currentMedia ? 'Live' : 'Ready'}</span>
        </div>
        {currentMedia && (
          <>
            <div className={styles.item}>
              <span>▶</span>
              <span>{currentMedia}</span>
            </div>
            <div className={styles.item}>
              <span>🎬</span>
              <span>HD Quality</span>
            </div>
          </>
        )}
      </div>
      <div className={styles.right}>
        <div className={styles.item}>
          <span>⚡</span>
          <span>10 Servers</span>
        </div>
        <div className={styles.item}>
          <span>🔊</span>
          <span>Audio</span>
        </div>
        <div className={styles.item}>
          <span>⚙️</span>
          <span>Settings</span>
        </div>
      </div>
    </div>
  );
}
