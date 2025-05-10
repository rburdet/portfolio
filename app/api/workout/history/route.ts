import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Define a KV namespace interface for TypeScript
interface KVNamespace {
  get: (key: string, type?: 'text' | 'json' | 'arrayBuffer' | 'stream') => Promise<any>;
  put: (key: string, value: string | ReadableStream | ArrayBuffer, options?: { expirationTtl?: number }) => Promise<any>;
  delete: (key: string) => Promise<any>;
  list: (options?: { prefix?: string; limit?: number; cursor?: string }) => Promise<{ keys: Array<{ name: string }>, list_complete: boolean, cursor?: string }>;
}

// Define environment type
interface Env {
  WORKOUT_KV: KVNamespace;
}

// API endpoint to get workout history (dates of completed workouts)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      );
    }
    
    // In production, fetch from Cloudflare KV
    if (process.env.NODE_ENV === 'production') {
      try {
        // Access Cloudflare KV binding
        const env = process.env as unknown as Env;
        const KV = env.WORKOUT_KV;
        
        if (!KV) {
          console.error('WORKOUT_KV binding not found');
          return NextResponse.json(
            { error: 'KV store not configured' },
            { status: 500 }
          );
        }
        
        // List all workouts for this user
        const prefix = `workout:${userId}:`;
        const { keys } = await KV.list({ prefix });
        
        // Extract dates from keys
        // Keys are in format: workout:<userId>:<date>
        const dates = keys.map((key: { name: string }) => {
          const parts = key.name.split(':');
          return parts[2]; // The date part
        });
        
        return NextResponse.json({
          dates: dates
        });
      } catch (error) {
        console.error('Error fetching workout history from KV:', error);
        return NextResponse.json(
          { error: 'Failed to fetch workout history from KV' },
          { status: 500 }
        );
      }
    }
    
    // For local development
    // Generate some mock data (last 30 days with random completion)
    const today = new Date();
    const mockDates = [];
    
    for (let i = 0; i < 30; i++) {
      // Only include some dates (random)
      if (Math.random() > 0.6) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Format as YYYY-MM-DD
        const dateStr = date.toISOString().split('T')[0];
        mockDates.push(dateStr);
      }
    }
    
    return NextResponse.json({ 
      dates: mockDates 
    });
  } catch (error) {
    console.error('Error fetching workout history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout history' },
      { status: 500 }
    );
  }
} 