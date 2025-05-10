import { NextRequest, NextResponse } from 'next/server';
import { WorkoutLog } from '@/app/projects/gym-routine/storage-utils';

export const runtime = 'edge';

// Example API handler for saving workout data
export async function POST(request: NextRequest) {
  try {
    // Get the workout log from the request body
    const workoutLog: WorkoutLog = await request.json();
    
    // Validate required fields
    if (!workoutLog.userId || !workoutLog.date || !workoutLog.dayId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Save to Cloudflare KV (when in production environment)
    if (process.env.NODE_ENV === 'production') {
      // In a real implementation, this would use the KV API
      // Here, we're just simulating a successful save
      console.log('Saving workout log to KV:', workoutLog);
      
      // For actual implementation with Cloudflare Workers:
      // await env.WORKOUT_DATA.put(
      //   `workout:${workoutLog.userId}:${workoutLog.date}`,
      //   JSON.stringify(workoutLog)
      // );
    }
    
    return NextResponse.json(
      { success: true, message: 'Workout saved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving workout:', error);
    return NextResponse.json(
      { error: 'Failed to save workout data' },
      { status: 500 }
    );
  }
}

// Fetch workout data for a specific date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');
    
    if (!userId || !date) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId and date' },
        { status: 400 }
      );
    }
    
    // In production, fetch from Cloudflare KV
    if (process.env.NODE_ENV === 'production') {
      // Simulating a response - in real implementation we'd fetch from KV
      // const data = await env.WORKOUT_DATA.get(`workout:${userId}:${date}`);
      
      // Mock data for demonstration
      const mockData: WorkoutLog = {
        userId,
        date,
        dayId: 'day1',
        completed: true,
        exercises: [
          {
            name: 'Sentadillas con barra',
            sets: 4,
            reps: '10',
            weight: '60',
            completed: true
          },
          {
            name: 'Zancadas caminando',
            sets: 3,
            reps: '12 por pierna',
            weight: '15',
            completed: true
          }
        ]
      };
      
      return NextResponse.json(mockData);
    }
    
    // For local development (would use localStorage on client side)
    return NextResponse.json({ message: 'No data found for local environment' });
  } catch (error) {
    console.error('Error fetching workout:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout data' },
      { status: 500 }
    );
  }
} 