// Stremio-style Stream Addon System
// Each addon provides streams for movies/TV shows

export interface StreamLink {
  url: string;
  quality: string;
  type: 'hls' | 'mp4' | 'embed';
  title?: string;
}

export interface AddonManifest {
  id: string;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
}

export abstract class StreamAddon {
  abstract manifest: AddonManifest;
  
  abstract getStreams(
    tmdbId: number,
    type: 'movie' | 'tv',
    season?: number,
    episode?: number
  ): Promise<StreamLink[]>;
}

// ============================================
// ADDON 1: VidSrc.pro (Most Reliable)
// ============================================
export class VidSrcProAddon extends StreamAddon {
  manifest: AddonManifest = {
    id: 'vidsrc-pro',
    name: 'VidSrc Pro',
    description: 'High quality embed streams',
    version: '1.0.0',
    enabled: true,
  };

  async getStreams(tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number): Promise<StreamLink[]> {
    const url = type === 'movie'
      ? `https://vidsrc.pro/embed/movie/${tmdbId}`
      : `https://vidsrc.pro/embed/tv/${tmdbId}/${season}/${episode}`;

    return [{
      url,
      quality: 'auto',
      type: 'embed',
      title: 'VidSrc Pro - HD',
    }];
  }
}

// ============================================
// ADDON 2: VidSrc.xyz
// ============================================
export class VidSrcXYZAddon extends StreamAddon {
  manifest: AddonManifest = {
    id: 'vidsrc-xyz',
    name: 'VidSrc XYZ',
    description: 'Alternative VidSrc mirror',
    version: '1.0.0',
    enabled: true,
  };

  async getStreams(tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number): Promise<StreamLink[]> {
    const url = type === 'movie'
      ? `https://vidsrc.xyz/embed/movie/${tmdbId}`
      : `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}`;

    return [{
      url,
      quality: 'auto',
      type: 'embed',
      title: 'VidSrc XYZ - HD',
    }];
  }
}

// ============================================
// ADDON 3: Embed.su
// ============================================
export class EmbedSuAddon extends StreamAddon {
  manifest: AddonManifest = {
    id: 'embed-su',
    name: 'Embed.su',
    description: 'Fast embed streams',
    version: '1.0.0',
    enabled: true,
  };

  async getStreams(tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number): Promise<StreamLink[]> {
    const url = type === 'movie'
      ? `https://embed.su/embed/movie/${tmdbId}`
      : `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`;

    return [{
      url,
      quality: 'auto',
      type: 'embed',
      title: 'Embed.su - Fast',
    }];
  }
}

// ============================================
// ADDON 4: AutoEmbed
// ============================================
export class AutoEmbedAddon extends StreamAddon {
  manifest: AddonManifest = {
    id: 'autoembed',
    name: 'AutoEmbed',
    description: 'Multi-source aggregator',
    version: '1.0.0',
    enabled: true,
  };

  async getStreams(tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number): Promise<StreamLink[]> {
    const url = type === 'movie'
      ? `https://autoembed.co/movie/tmdb/${tmdbId}`
      : `https://autoembed.co/tv/tmdb/${tmdbId}-${season}-${episode}`;

    return [{
      url,
      quality: 'auto',
      type: 'embed',
      title: 'AutoEmbed - Multi',
    }];
  }
}

// ============================================
// ADDON 5: SuperEmbed
// ============================================
export class SuperEmbedAddon extends StreamAddon {
  manifest: AddonManifest = {
    id: 'superembed',
    name: 'SuperEmbed',
    description: 'Multiple quality options',
    version: '1.0.0',
    enabled: true,
  };

  async getStreams(tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number): Promise<StreamLink[]> {
    const url = type === 'movie'
      ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`
      : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;

    return [{
      url,
      quality: 'auto',
      type: 'embed',
      title: 'SuperEmbed - Multi Quality',
    }];
  }
}

// ============================================
// ADDON 6: 2Embed
// ============================================
export class TwoEmbedAddon extends StreamAddon {
  manifest: AddonManifest = {
    id: '2embed',
    name: '2Embed',
    description: 'Backup embed source',
    version: '1.0.0',
    enabled: true,
  };

  async getStreams(tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number): Promise<StreamLink[]> {
    const url = type === 'movie'
      ? `https://www.2embed.cc/embed/${tmdbId}`
      : `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`;

    return [{
      url,
      quality: 'auto',
      type: 'embed',
      title: '2Embed - Backup',
    }];
  }
}

// ============================================
// ADDON 7: VidSrc.nl (NEW - Alternative Mirror)
// ============================================
export class VidSrcNLAddon extends StreamAddon {
  manifest: AddonManifest = {
    id: 'vidsrc-nl',
    name: 'VidSrc NL',
    description: 'Netherlands mirror with good speed',
    version: '1.0.0',
    enabled: true,
  };

  async getStreams(tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number): Promise<StreamLink[]> {
    const url = type === 'movie'
      ? `https://vidsrc.nl/embed/movie/${tmdbId}`
      : `https://vidsrc.nl/embed/tv/${tmdbId}/${season}/${episode}`;

    return [{
      url,
      quality: 'auto',
      type: 'embed',
      title: 'VidSrc NL - HD',
    }];
  }
}

// ============================================
// ADDON 8: NontonGo
// ============================================
export class NontonGoAddon extends StreamAddon {
  manifest: AddonManifest = {
    id: 'nontongo',
    name: 'NontonGo',
    description: 'Alternative Asian server',
    version: '1.0.0',
    enabled: true,
  };

  async getStreams(tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number): Promise<StreamLink[]> {
    const url = type === 'movie'
      ? `https://www.nontongo.win/embed/movie/${tmdbId}`
      : `https://www.nontongo.win/embed/tv/${tmdbId}/${season}/${episode}`;

    return [{
      url,
      quality: 'auto',
      type: 'embed',
      title: 'NontonGo - Fast',
    }];
  }
}

// ============================================
// ADDON MANAGER
// ============================================
export class AddonManager {
  private addons: StreamAddon[] = [];

  constructor() {
    // Register all addons
    this.register(new VidSrcProAddon());
    this.register(new VidSrcXYZAddon());
    this.register(new VidSrcNLAddon());
    this.register(new EmbedSuAddon());
    this.register(new AutoEmbedAddon());
    this.register(new SuperEmbedAddon());
    this.register(new TwoEmbedAddon());
    this.register(new NontonGoAddon());
  }

  register(addon: StreamAddon) {
    this.addons.push(addon);
  }

  getEnabledAddons(): StreamAddon[] {
    return this.addons.filter(addon => addon.manifest.enabled);
  }

  async getAllStreams(
    tmdbId: number,
    type: 'movie' | 'tv',
    season?: number,
    episode?: number
  ): Promise<StreamLink[]> {
    const enabledAddons = this.getEnabledAddons();
    const allStreams: StreamLink[] = [];

    for (const addon of enabledAddons) {
      try {
        const streams = await addon.getStreams(tmdbId, type, season, episode);
        allStreams.push(...streams);
      } catch (error) {
        console.error(`Addon ${addon.manifest.name} failed:`, error);
      }
    }

    return allStreams;
  }

  listAddons(): AddonManifest[] {
    return this.addons.map(addon => addon.manifest);
  }
}

// Export singleton instance
export const addonManager = new AddonManager();
