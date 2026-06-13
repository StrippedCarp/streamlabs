'use client';

import { useState } from 'react';
import styles from './ServerSelector.module.css';
import { StreamServer } from '../types';

interface ServerSelectorProps {
  servers: StreamServer[];
  onServerChange: (server: StreamServer) => void;
  currentServer: StreamServer | null;
}

export default function ServerSelector({ servers, onServerChange, currentServer }: ServerSelectorProps) {
  return (
    <div className={styles.container}>
      <div className={styles.label}>Available Servers:</div>
      <div className={styles.servers}>
        {servers.map((server) => (
          <button
            key={server.id}
            className={`${styles.server} ${currentServer?.id === server.id ? styles.active : ''}`}
            onClick={() => onServerChange(server)}
          >
            {server.name}
          </button>
        ))}
      </div>
    </div>
  );
}
