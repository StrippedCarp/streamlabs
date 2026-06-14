import { NextRequest, NextResponse } from 'next/server';

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

const TMDB_API_KEY = '24b3f99aa424f62e2dd5452b83ad2e43';
const TMDB_BASE = 'https://api.themoviedb.org/3';

function isCacheValid(cached: { data: any; timestamp: number }): boolean {
  return Date.now() - cached.timestamp < CACHE_TTL;
}

async function fetchFromTMDB(endpoint: string): Promise<any> {
  const url = `${TMDB_BASE}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  return response.json();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const type = searchParams.get('type') || 'multi';
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
  }

  const cacheKey = `search:${type}:${query}`;
  const cached = cache.get(cacheKey);

  if (cached && isCacheValid(cached)) {
    return NextResponse.json({ ...cached.data, cached: true });
  }

  try {
    const endpoint = type === 'multi' 
      ? `/search/multi?query=${encodeURIComponent(query)}`
      : `/search/${type}?query=${encodeURIComponent(query)}`;
    
    const data = await fetchFromTMDB(endpoint);
    cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return NextResponse.json({ ...data, cached: false });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
  }
}
