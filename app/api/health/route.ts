import { NextRequest, NextResponse } from 'next/server';

const healthCache = new Map<string, { status: 'online' | 'offline'; timestamp: number }>();
const HEALTH_CHECK_TTL = 5 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 });
    }

    const cached = healthCache.get(url);
    if (cached && Date.now() - cached.timestamp < HEALTH_CHECK_TTL) {
      return NextResponse.json({
        url,
        status: cached.status,
        cached: true,
        timestamp: cached.timestamp
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      clearTimeout(timeoutId);
      const status = response.ok ? 'online' : 'offline';
      
      healthCache.set(url, { status, timestamp: Date.now() });

      return NextResponse.json({
        url,
        status,
        cached: false,
        responseTime: Date.now(),
        statusCode: response.status
      });
    } catch (error) {
      clearTimeout(timeoutId);
      healthCache.set(url, { status: 'offline', timestamp: Date.now() });

      return NextResponse.json({
        url,
        status: 'offline',
        cached: false,
        error: 'Connection failed'
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
