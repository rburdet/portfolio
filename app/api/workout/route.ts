import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, date, dayId, completed } = body;

    if (!userId || !date) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId and date' },
        { status: 400 }
      );
    }

    const { env } = getRequestContext();
    const KV = env.WORKOUT_DATA;

    if (!KV) {
      return NextResponse.json(
        { error: 'KV store not configured' },
        { status: 500 }
      );
    }

    const key = `workout:${userId}:${date}`;
    const value = JSON.stringify({
      dayId,
      completed,
      timestamp: new Date().toISOString(),
    });

    await KV.put(key, value);

    return NextResponse.json({ success: true, date });
  } catch (error) {
    console.error('Error recording workout:', error);
    return NextResponse.json(
      { error: 'Failed to record workout' },
      { status: 500 }
    );
  }
}

