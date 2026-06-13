'use client';

import styles from './ActivityBar.module.css';

interface ActivityBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function ActivityBar({ activeView, onViewChange }: ActivityBarProps) {
  const icons = [
    { id: 'explorer', icon: '📁', title: 'Explorer' },
    { id: 'search', icon: '🔍', title: 'Search' },
  ];

  return (
    <div className={styles.activityBar}>
      {icons.map((item) => (
        <div
          key={item.id}
          className={`${styles.icon} ${activeView === item.id ? styles.active : ''}`}
          onClick={() => onViewChange(item.id)}
          title={item.title}
        >
          {item.icon}
        </div>
      ))}
    </div>
  );
}
