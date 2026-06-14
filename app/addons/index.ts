// Addon System - Stremio-style architecture
export interface StreamSource {
  name: string;
  quality: string;
  url: string;
  type: 'direct' | 'hls' | 'dash';
  provider: string;
}

export interface AddonManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  icon: string;
  types: ('movie' | 'tv')[];
  resources: string[];
}

export interface StreamResponse {
  streams: StreamSource[];
}

export abstract class StreamAddon {
  abstract manifest: AddonManifest;
  
  abstract getStreams(
    type: 'movie' | 'tv',
    tmdbId: string,
    season?: number,
    episode?: number
  ): Promise<StreamSource[]>;
}

// VidSrc Addon Implementation
export class VidSrcAddon extends StreamAddon {
  manifest: AddonManifest = {
    id: 'org.streamlab.vidsrc',
    name: 'VidSrc',
    version: '1.0.0',
    description: 'High quality streaming from VidSrc',
    icon: '🎬',
    types: ['movie', 'tv'],
    resources: ['stream']
  };

  async getStreams(
    type: 'movie' | 'tv',
    tmdbId: string,
    season?: number,
    episode?: number
  ): Promise<StreamSource[]> {
    const baseUrl = type === 'movie'
      ? `https://vidsrc.to/embed/movie/${tmdbId}`
      : `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`;

    return [
      {
        name: 'VidSrc - 1080p',
        quality: '1080p',
        url: baseUrl,
        type: 'direct',
        provider: 'vidsrc'
      }
    ];
  }
}

// VidSrc Pro Addon
export class VidSrcProAddon extends StreamAddon {
  manifest: AddonManifest = {
    id: 'org.streamlab.vidsrcpro',
    name: 'VidSrc Pro',
    version: '1.0.0',
    description: 'Premium streaming from VidSrc Pro',
    icon: '⚡',
    types: ['movie', 'tv'],
    resources: ['stream']
  };

  async getStreams(
    type: 'movie' | 'tv',
    tmdbId: string,
    season?: number,
    episode?: number
  ): Promise<StreamSource[]> {
    const baseUrl = type === 'movie'
      ? `https://vidsrc.pro/embed/movie/${tmdbId}`
      : `https://vidsrc.pro/embed/tv/${tmdbId}/${season}/${episode}`;

    return [
      {
        name: 'VidSrc Pro - HD',
        quality: 'HD',
        url: baseUrl,
        type: 'direct',
        provider: 'vidsrcpro'
      }
    ];
  }
}

// Embed.su Addon
export class EmbedSuAddon extends StreamAddon {
  manifest: AddonManifest = {
    id: 'org.streamlab.embedsu',
    name: 'Embed.su',
    version: '1.0.0',
    description: 'Reliable streaming from Embed.su',
    icon: '🎯',
    types: ['movie', 'tv'],
    resources: ['stream']
  };

  async getStreams(
    type: 'movie' | 'tv',
    tmdbId: string,
    season?: number,
    episode?: number
  ): Promise<StreamSource[]> {
    const baseUrl = type === 'movie'
      ? `https://embed.su/embed/movie/${tmdbId}`
      : `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`;

    return [
      {
        name: 'Embed.su - 720p',
        quality: '720p',
        url: baseUrl,
        type: 'direct',
        provider: 'embedsu'
      }
    ];
  }
}

// Addon Manager
export class AddonManager {
  private addons: Map<string, StreamAddon> = new Map();

  registerAddon(addon: StreamAddon) {
    this.addons.set(addon.manifest.id, addon);
  }

  async getStreamsFromAllAddons(
    type: 'movie' | 'tv',
    tmdbId: string,
    season?: number,
    episode?: number
  ): Promise<StreamSource[]> {
    const allStreams: StreamSource[] = [];

    for (const addon of this.addons.values()) {
      try {
        const streams = await addon.getStreams(type, tmdbId, season, episode);
        allStreams.push(...streams);
      } catch (error) {
        console.error(`Addon ${addon.manifest.name} failed:`, error);
      }
    }

    return allStreams;
  }

  getInstalledAddons(): AddonManifest[] {
    return Array.from(this.addons.values()).map(addon => addon.manifest);
  }
}

// Initialize default addons
export const addonManager = new AddonManager();
addonManager.registerAddon(new VidSrcAddon());
addonManager.registerAddon(new VidSrcProAddon());
addonManager.registerAddon(new EmbedSuAddon());
