import { useReducer, useCallback } from 'react';
import { useProgram } from '@/hooks/useProgram';
import { generateSchedule } from '@/lib/workout';
import type { 
  Schedule, 
  ViewMode, 
  WorkoutState, 
  WorkoutAction 
} from '@/types';

export function useWorkoutState(programId: string) {
  const { programData } = useProgram();
  const startDate = new Date();

  const workoutReducer = useCallback((state: WorkoutState, action: WorkoutAction): WorkoutState => {
    switch (action.type) {
      case 'SET_VIEW_MODE':
        return {
          ...state,
          viewMode: action.payload,
          expandedWorkoutId: null // Close expanded view on mode change
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

      case 'SET_START_DATE': {
        const newSchedule = generateSchedule(action.payload, programData);
        return {
          ...state,
          startDate: action.payload,
          schedule: newSchedule
        };
      }

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
          schedule: generateSchedule(state.startDate, programData),
          expandedWorkoutId: null
        };

      default:
        return state;
    }
  }, [programData]);

  const initialState: WorkoutState = {
    schedule: generateSchedule(startDate, programData),
    expandedWorkoutId: null,
    viewMode: 'calendar',
    startDate,
  };

  const [state, dispatch] = useReducer(workoutReducer, initialState);

  const setViewMode = useCallback((mode: ViewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  const setExpandedWorkout = useCallback((workoutId: string | null) => {
    dispatch({ type: 'SET_EXPANDED_WORKOUT', payload: workoutId });
  }, []);

  const updateSchedule = useCallback((schedule: Schedule) => {
    dispatch({ type: 'UPDATE_SCHEDULE', payload: schedule });
  }, []);

  const setStartDate = useCallback((date: Date) => {
    dispatch({ type: 'SET_START_DATE', payload: date });
  }, []);

  const completeExercise = useCallback((weekIndex: number, dayIndex: number, exerciseId: string) => {
    dispatch({
      type: 'COMPLETE_EXERCISE',
      payload: { weekIndex, dayIndex, exerciseId }
    });
  }, []);

  const batchComplete = useCallback((
    weekIndex: number,
    dayIndex: number,
    exerciseIds: string[],
    completed: boolean
  ) => {
    dispatch({
      type: 'BATCH_COMPLETE',
      payload: { weekIndex, dayIndex, exerciseIds, completed }
    });
  }, []);

  const updateNotes = useCallback((weekIndex: number, dayIndex: number, notes: string) => {
    dispatch({
      type: 'UPDATE_NOTES',
      payload: { weekIndex, dayIndex, notes }
    });
  }, []);

  const clearSchedule = useCallback(() => {
    dispatch({ type: 'CLEAR_SCHEDULE' });
  }, []);

  return {
    ...state,
    setViewMode,
    setExpandedWorkout,
    updateSchedule,
    setStartDate,
    completeExercise,
    batchComplete,
    updateNotes,
    clearSchedule,
  };
}