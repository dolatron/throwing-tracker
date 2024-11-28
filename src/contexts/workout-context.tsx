'use client';

import { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { WorkoutState, Schedule, ViewMode, DayWorkout } from '@/types';
import type { ApiResponse } from '@/types/api';

// Action types
type WorkoutAction =
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_EXPANDED_WORKOUT'; payload: string | null }
  | { type: 'UPDATE_SCHEDULE'; payload: Schedule }
  | { type: 'SET_START_DATE'; payload: Date }
  | { type: 'COMPLETE_EXERCISE'; payload: { weekIndex: number; dayIndex: number; exerciseId: string } }
  | { type: 'UPDATE_NOTES'; payload: { weekIndex: number; dayIndex: number; notes: string } }
  | { type: 'BATCH_COMPLETE'; payload: { weekIndex: number; dayIndex: number; exerciseIds: string[]; completed: boolean } }
  | { type: 'CLEAR_SCHEDULE' }
  | { type: 'SET_LOADING'; payload: boolean };

// Context type definition
interface WorkoutContextType {
  schedule: Schedule;
  expandedWorkoutId: string | null;
  viewMode: ViewMode;
  startDate: Date;
  isLoading: boolean;
  setViewMode: (mode: ViewMode) => void;
  setExpandedWorkout: (workoutId: string | null) => void;
  setSchedule: (schedule: Schedule) => void;
  setStartDate: (date: Date) => void;
  fetchWorkouts: (userId: string, programId: string) => Promise<ApiResponse<DayWorkout[]>>;
  handleExerciseComplete: (weekIndex: number, dayIndex: number, exerciseId: string, userId: string) => Promise<ApiResponse<void>>;
  handleBatchComplete: (weekIndex: number, dayIndex: number, exerciseIds: string[], completed: boolean, userId: string) => Promise<ApiResponse<void>>;
  handleNotesUpdate: (weekIndex: number, dayIndex: number, notes: string, userId: string) => Promise<ApiResponse<void>>;
}

// Initial state
const initialState: WorkoutState = {
  schedule: [],
  expandedWorkoutId: null,
  viewMode: 'calendar',
  startDate: new Date(),
  isLoading: false
};

// Reducer
function workoutReducer(state: WorkoutState, action: WorkoutAction): WorkoutState {
  switch (action.type) {
    case 'SET_VIEW_MODE':
      return {
        ...state,
        viewMode: action.payload,
        expandedWorkoutId: null
      };

    case 'SET_EXPANDED_WORKOUT':
      return {
        ...state,
        expandedWorkoutId: action.payload
      };

    case 'UPDATE_SCHEDULE':
      return {
        ...state,
        schedule: action.payload
      };

    case 'SET_START_DATE':
      return {
        ...state,
        startDate: action.payload
      };

    case 'COMPLETE_EXERCISE': {
      const { weekIndex, dayIndex, exerciseId } = action.payload;
      const newSchedule = [...state.schedule];
      const day = newSchedule[weekIndex][dayIndex];
      
      newSchedule[weekIndex][dayIndex] = {
        ...day,
        completed: {
          ...day.completed,
          [exerciseId]: !day.completed[exerciseId]
        }
      };
      
      return {
        ...state,
        schedule: newSchedule
      };
    }

    case 'UPDATE_NOTES': {
      const { weekIndex, dayIndex, notes } = action.payload;
      const newSchedule = [...state.schedule];
      
      newSchedule[weekIndex][dayIndex] = {
        ...newSchedule[weekIndex][dayIndex],
        userNotes: notes
      };
      
      return {
        ...state,
        schedule: newSchedule
      };
    }

    case 'BATCH_COMPLETE': {
      const { weekIndex, dayIndex, exerciseIds, completed } = action.payload;
      const newSchedule = [...state.schedule];
      const day = newSchedule[weekIndex][dayIndex];

      newSchedule[weekIndex][dayIndex] = {
        ...day,
        completed: {
          ...day.completed,
          ...exerciseIds.reduce((acc, id) => ({
            ...acc,
            [id]: completed
          }), {})
        }
      };

      return {
        ...state,
        schedule: newSchedule
      };
    }

    case 'CLEAR_SCHEDULE':
      return {
        ...state,
        schedule: [],
        expandedWorkoutId: null
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    default:
      return state;
  }
}

// Create context
export const WorkoutContext = createContext<WorkoutContextType | null>(null);

// Provider component
export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(workoutReducer, initialState);
  const supabase = createClientComponentClient();

  const setViewMode = useCallback((mode: ViewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  const setExpandedWorkout = useCallback((workoutId: string | null) => {
    dispatch({ type: 'SET_EXPANDED_WORKOUT', payload: workoutId });
  }, []);

  const setSchedule = useCallback((schedule: Schedule) => {
    dispatch({ type: 'UPDATE_SCHEDULE', payload: schedule });
  }, []);

  const setStartDate = useCallback((date: Date) => {
    dispatch({ type: 'SET_START_DATE', payload: date });
  }, []);

  const fetchWorkouts = useCallback(async (userId: string, programId: string): Promise<ApiResponse<DayWorkout[]>> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const { data, error } = await supabase
        .from('user_workouts')
        .select(`
          *,
          completed_exercises (
            exercise_id,
            completed
          )
        `)
        .eq('user_id', userId)
        .eq('program_id', programId);

      if (error) throw error;

      return { 
        data: data || [], 
        status: 200 
      };
    } catch (error) {
      console.error('Error fetching workouts:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to fetch workouts',
        status: 500
      };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [supabase]);

  const handleExerciseComplete = useCallback(async (
    weekIndex: number,
    dayIndex: number,
    exerciseId: string,
    userId: string
  ): Promise<ApiResponse<void>> => {
    try {
      dispatch({
        type: 'COMPLETE_EXERCISE',
        payload: { weekIndex, dayIndex, exerciseId }
      });

      const workout = state.schedule[weekIndex][dayIndex];
      const { error } = await supabase
        .from('completed_exercises')
        .upsert({
          user_workout_id: workout.id,
          exercise_id: exerciseId,
          completed: !workout.completed[exerciseId],
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return { status: 200 };
    } catch (error) {
      console.error('Failed to complete exercise:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to complete exercise',
        status: 500
      };
    }
  }, [state.schedule, supabase]);

  const handleBatchComplete = useCallback(async (
    weekIndex: number,
    dayIndex: number,
    exerciseIds: string[],
    completed: boolean,
    userId: string
  ): Promise<ApiResponse<void>> => {
    try {
      dispatch({
        type: 'BATCH_COMPLETE',
        payload: { weekIndex, dayIndex, exerciseIds, completed }
      });

      const workout = state.schedule[weekIndex][dayIndex];
      const { error } = await supabase
        .from('completed_exercises')
        .upsert(
          exerciseIds.map(exerciseId => ({
            user_workout_id: workout.id,
            exercise_id: exerciseId,
            completed,
            updated_at: new Date().toISOString()
          }))
        );

      if (error) throw error;
      return { status: 200 };
    } catch (error) {
      console.error('Failed to batch complete:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to batch complete exercises',
        status: 500
      };
    }
  }, [state.schedule, supabase]);

  const handleNotesUpdate = useCallback(async (
    weekIndex: number,
    dayIndex: number,
    notes: string,
    userId: string
  ): Promise<ApiResponse<void>> => {
    try {
      dispatch({
        type: 'UPDATE_NOTES',
        payload: { weekIndex, dayIndex, notes }
      });

      const workout = state.schedule[weekIndex][dayIndex];
      const { error } = await supabase
        .from('user_workouts')
        .update({
          user_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', workout.id);

      if (error) throw error;
      return { status: 200 };
    } catch (error) {
      console.error('Failed to update notes:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to update notes',
        status: 500
      };
    }
  }, [state.schedule, supabase]);

  const value = useMemo(() => ({
    schedule: state.schedule,
    expandedWorkoutId: state.expandedWorkoutId,
    viewMode: state.viewMode,
    startDate: state.startDate,
    isLoading: state.isLoading,
    setViewMode,
    setExpandedWorkout,
    setSchedule,
    setStartDate,
    fetchWorkouts,
    handleExerciseComplete,
    handleBatchComplete,
    handleNotesUpdate
  }), [
    state.schedule,
    state.expandedWorkoutId,
    state.viewMode,
    state.startDate,
    state.isLoading,
    setViewMode,
    setExpandedWorkout,
    setSchedule,
    setStartDate,
    fetchWorkouts,
    handleExerciseComplete,
    handleBatchComplete,
    handleNotesUpdate
  ]);

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
}

// Hook
export function useWorkout(): WorkoutContextType {
  const context = useContext(WorkoutContext);
  
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  
  return context;
}