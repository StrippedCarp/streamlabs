import { NextRequest, NextResponse } from 'next/server';
import { addonManager } from '@/app/addons';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tmdbId = searchParams.get('tmdbId');
  const type = searchParams.get('type') as 'movie' | 'tv';
  const season = searchParams.get('season');
  const episode = searchParams.get('episode');

  if (!tmdbId || !type) {
    return NextResponse.json(
      { error: 'tmdbId and type parameters required' },
      { status: 400 }
    );
  }

  if (type === 'tv' && (!season || !episode)) {
    return NextResponse.json(
      { error: 'season and episode required for TV shows' },
      { status: 400 }
    );
  }

  try {
    const streams = await addonManager.getStreamsFromAllAddons(
      type,
      tmdbId,
      season ? parseInt(season) : undefined,
      episode ? parseInt(episode) : undefined
    );

    return NextResponse.json({
      tmdbId,
      type,
      season: season ? parseInt(season) : null,
      episode: episode ? parseInt(episode) : null,
      streams,
      count: streams.length,
      timestamp: Date.now()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch streams' },
      { status: 500 }
    );
  }
}
