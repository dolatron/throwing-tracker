// types/api.ts
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    status: number;
  }
  
  export interface DbResult<T> {
    data: T | null;
    error: Error | null;
  }
  
  export interface DbOptions {
    select?: string[];
    where?: Record<string, unknown>;
    orderBy?: string;
    limit?: number;
  }
  
  export interface OnboardRequest {
    firstName?: string;
    email: string;
    programId: string;
  }
  
  export interface WorkoutSyncRequest {
    workoutId: string;
    date: string;
    exercises: {
      id: string;
      completed: boolean;
    }[];
    notes?: string;
  }
  
  export interface AuthResponse {
    user: {
      id: string;
      email: string;
    } | null;
    session: unknown | null;
  }
  
  export interface WorkoutSyncResponse {
    workoutId: string;
    synced: boolean;
    timestamp: string;
  }
  
  // Database query options
  export interface QueryOptions {
    select?: string[];
    where?: Record<string, unknown>;
    orderBy?: string;
    limit?: number;
  }