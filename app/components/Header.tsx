'use client';

import styles from './Header.module.css';

export default function Header() {
  return (
    <div className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🎬</span>
          <span className={styles.logoText}>StreamLab</span>
        </div>
        <div className={styles.tagline}>Premium Streaming Experience</div>
      </div>
      <div className={styles.actions}>
        <button className={styles.actionBtn}>
          <span>🔔</span>
        </button>
        <button className={styles.actionBtn}>
          <span>👤</span>
        </button>
      </div>
    </div>
  );
}
