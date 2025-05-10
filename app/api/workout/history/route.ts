import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

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
      // In a real implementation, we would:
      // 1. List all keys with the prefix `workout:${userId}:`
      // 2. Extract dates from the keys
      // 3. Return the dates as an array
      
      // Simulating a response with mock data
      // Format: { dates: ["2024-09-25", "2024-09-27", ...] }
      
      // Generate some mock data (last 10 days with random completion)
      const today = new Date();
      const mockDates = [];
      
      for (let i = 0; i < 10; i++) {
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
    }
    
    // For local development
    return NextResponse.json({ 
      dates: [] 
    });
  } catch (error) {
    console.error('Error fetching workout history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout history' },
      { status: 500 }
    );
  }
} 