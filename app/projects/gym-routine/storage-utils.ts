// Define KVNamespace interface for Cloudflare Workers
interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string }): Promise<{ keys: { name: string }[] }>;
}

export interface WorkoutLog {
  userId: string;
  date: string;
  dayId: string; // Reference to day in workout routine
  completed: boolean;
  exercises: {
    name: string;
    sets: number;
    reps: string;
    weight: string;
    completed: boolean;
    notes?: string;
  }[];
}

// Type that defines our Cloudflare KV bindings
interface Env {
  WORKOUT_DATA: KVNamespace;
}

/**
 * Save workout data to Cloudflare KV
 * 
 * Note: This function is designed to be used in a Cloudflare Worker
 * Add to wrangler.toml: 
 * kv_namespaces = [
 *   { binding = "WORKOUT_DATA", id = "your-kv-id" }
 * ]
 */
export async function saveWorkoutLog(
  env: Env,
  workoutLog: WorkoutLog
): Promise<boolean> {
  try {
    // Create a composite key using userId and date
    const key = `workout:${workoutLog.userId}:${workoutLog.date}`;
    
    // Store the workout log as JSON
    await env.WORKOUT_DATA.put(key, JSON.stringify(workoutLog));
    
    return true;
  } catch (error) {
    console.error('Error saving workout log:', error);
    return false;
  }
}

/**
 * Get a specific workout log by user ID and date
 */
export async function getWorkoutLog(
  env: Env,
  userId: string,
  date: string
): Promise<WorkoutLog | null> {
  try {
    const key = `workout:${userId}:${date}`;
    const data = await env.WORKOUT_DATA.get(key);
    
    if (!data) return null;
    
    return JSON.parse(data) as WorkoutLog;
  } catch (error) {
    console.error('Error getting workout log:', error);
    return null;
  }
}

/**
 * Get all workout logs for a user
 */
export async function getUserWorkoutLogs(
  env: Env,
  userId: string
): Promise<WorkoutLog[]> {
  try {
    // List all keys with the prefix for this user
    const keys = await env.WORKOUT_DATA.list({ prefix: `workout:${userId}:` });
    
    // Fetch all workout logs in parallel
    const workouts = await Promise.all(
      keys.keys.map(async (key: { name: string }) => {
        const data = await env.WORKOUT_DATA.get(key.name);
        return data ? JSON.parse(data) as WorkoutLog : null;
      })
    );
    
    // Filter out any null values
    return workouts.filter((workout: WorkoutLog | null): workout is WorkoutLog => workout !== null);
  } catch (error) {
    console.error('Error getting user workout logs:', error);
    return [];
  }
}

/**
 * Delete a workout log
 */
export async function deleteWorkoutLog(
  env: Env,
  userId: string,
  date: string
): Promise<boolean> {
  try {
    const key = `workout:${userId}:${date}`;
    await env.WORKOUT_DATA.delete(key);
    return true;
  } catch (error) {
    console.error('Error deleting workout log:', error);
    return false;
  }
}

/**
 * Fallback for local development using localStorage
 */
export const localStorageUtils = {
  saveWorkoutLog(workoutLog: WorkoutLog): boolean {
    try {
      const key = `workout:${workoutLog.userId}:${workoutLog.date}`;
      localStorage.setItem(key, JSON.stringify(workoutLog));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },
  
  getWorkoutLog(userId: string, date: string): WorkoutLog | null {
    try {
      const key = `workout:${userId}:${date}`;
      const data = localStorage.getItem(key);
      
      if (!data) return null;
      
      return JSON.parse(data) as WorkoutLog;
    } catch (error) {
      console.error('Error getting from localStorage:', error);
      return null;
    }
  },
  
  getUserWorkoutLogs(userId: string): WorkoutLog[] {
    try {
      const logs: WorkoutLog[] = [];
      const prefix = `workout:${userId}:`;
      
      // Iterate through localStorage to find matching keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const data = localStorage.getItem(key);
          if (data) {
            logs.push(JSON.parse(data) as WorkoutLog);
          }
        }
      }
      
      return logs;
    } catch (error) {
      console.error('Error listing localStorage items:', error);
      return [];
    }
  },
  
  deleteWorkoutLog(userId: string, date: string): boolean {
    try {
      const key = `workout:${userId}:${date}`;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error deleting from localStorage:', error);
      return false;
    }
  }
}; 