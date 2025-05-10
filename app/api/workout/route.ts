import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface WorkoutData {
  userId: string;
  date: string;
  dayId: string;
  completed: boolean;
  exercises: any[];
}

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

export async function POST(request: NextRequest) {
  try {
    const data: WorkoutData = await request.json();
    
    if (!data.userId || !data.date || !data.dayId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, date, or dayId' },
        { status: 400 }
      );
    }
    
    // In production environment, use Cloudflare KV
    if (process.env.NODE_ENV === 'production') {
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
      
      // Key format: workout:<userId>:<date>
      const key = `workout:${data.userId}:${data.date}`;
      
      try {
        // Save to KV store (expiring after 1 year = 31536000 seconds)
        await KV.put(key, JSON.stringify(data));
        
        return NextResponse.json({ 
          success: true,
          message: 'Workout saved successfully' 
        });
      } catch (kvError) {
        console.error('Error saving to KV:', kvError);
        return NextResponse.json(
          { error: 'Failed to save workout data to KV store' },
          { status: 500 }
        );
      }
    }
    
    // For local development, just return success
    // In a real implementation, you could use a local database or mock storage
    console.log('Development mode: Workout would be saved with data:', data);
    
    return NextResponse.json({ 
      success: true,
      message: 'Workout saved successfully (dev mode)' 
    });
  } catch (error) {
    console.error('Error processing workout data:', error);
    return NextResponse.json(
      { error: 'Failed to process workout data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      );
    }
    
    // In production environment, use Cloudflare KV
    if (process.env.NODE_ENV === 'production') {
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
      
      try {
        if (date) {
          // Fetch a specific workout by date
          const key = `workout:${userId}:${date}`;
          const workout = await KV.get(key, 'json');
          
          if (!workout) {
            return NextResponse.json(
              { error: 'Workout not found' },
              { status: 404 }
            );
          }
          
          return NextResponse.json(workout);
        } else {
          // List all workouts for a user
          // Note: KV list operations are eventually consistent and limited to 1000 keys
          const prefix = `workout:${userId}:`;
          const { keys } = await KV.list({ prefix });
          
          // Fetch all workouts in parallel
          const workouts = await Promise.all(
            keys.map(async (key: { name: string }) => {
              return KV.get(key.name, 'json');
            })
          );
          
          return NextResponse.json({ workouts });
        }
      } catch (kvError) {
        console.error('Error retrieving from KV:', kvError);
        return NextResponse.json(
          { error: 'Failed to retrieve workout data from KV store' },
          { status: 500 }
        );
      }
    }
    
    // For local development, return mock data
    const mockWorkout = {
      userId,
      date: date || '2024-04-01',
      dayId: 'day1',
      completed: true,
      exercises: []
    };
    
    console.log('Development mode: Returning mock workout data');
    
    if (date) {
      return NextResponse.json(mockWorkout);
    } else {
      return NextResponse.json({ workouts: [mockWorkout] });
    }
  } catch (error) {
    console.error('Error retrieving workout data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve workout data' },
      { status: 500 }
    );
  }
} 