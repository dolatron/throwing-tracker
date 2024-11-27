'use client';

import React, { createContext, useReducer, useContext, useEffect, useState } from 'react';
import type { ProgramConfig, ProgramState, ProgramAction, Program } from '@/types';
import rawProgramData from '@/programs/driveline-catcher-velo/program.json';
import rawExerciseData from '@/programs/driveline-catcher-velo/exercises.json';

// Initial state matching the Program type
const initialState: ProgramState = {
  programData: {
    id: '',
    name: '',
    version: '',
    description: '', // Added missing required field
    workoutTypes: {},
    schedule: {
      length: 0,
      unit: '',
      weeks: []
    }
  },
  exerciseData: {
    categories: {},
    exercises: {}
  },
  isInitialized: false,
  isLoading: true
};

export const ProgramContext = createContext<{
  state: ProgramState;
  dispatch: React.Dispatch<ProgramAction>;
} | null>(null);

function programReducer(state: ProgramState, action: ProgramAction): ProgramState {
  console.log('Program reducer action:', action.type, action.payload);
  
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        ...action.payload,
        isInitialized: true,
        isLoading: false,
        error: undefined
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isInitialized: false,
        isLoading: false
      };
    default:
      return state;
  }
}

function validateProgramData(data: unknown): data is Program {
  if (!data || typeof data !== 'object') return false;
  const program = data as Partial<Program>;
  
  // Add all required fields to validation
  const hasRequiredFields = !!(
    program.id &&
    program.name &&
    program.version &&
    program.description && // Added missing required field check
    program.workoutTypes &&
    program.schedule?.weeks
  );

  if (!hasRequiredFields) {
    console.error('Missing required program fields:', {
      id: !!program.id,
      name: !!program.name,
      version: !!program.version,
      description: !!program.description,
      workoutTypes: !!program.workoutTypes,
      schedule: !!program.schedule?.weeks
    });
    return false;
  }

  return true;
}

function validateExerciseData(data: unknown): data is ProgramConfig['exerciseData'] {
  if (!data || typeof data !== 'object') return false;
  const exercises = data as Partial<ProgramConfig['exerciseData']>;
  
  const hasRequiredFields = !!(
    exercises.categories &&
    exercises.exercises &&
    typeof exercises.categories === 'object' &&
    typeof exercises.exercises === 'object'
  );

  if (!hasRequiredFields) {
    console.error('Missing required exercise fields:', {
      categories: !!exercises.categories,
      exercises: !!exercises.exercises
    });
    return false;
  }

  return true;
}

export function ProgramProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(programReducer, initialState);
  const [loadAttempted, setLoadAttempted] = useState(false);

  useEffect(() => {
    if (loadAttempted) return;
    setLoadAttempted(true);

    try {
      console.log('Loading program data...');

      const programData = rawProgramData;
      const exerciseData = rawExerciseData;

      console.log('Raw data loaded:', { programData, exerciseData });

      if (!validateProgramData(programData)) {
        throw new Error('Invalid program data format');
      }

      if (!validateExerciseData(exerciseData)) {
        throw new Error('Invalid exercise data format');
      }

      const config: ProgramConfig = {
        programData,
        exerciseData
      };

      console.log('Program config initialized:', config);
      dispatch({ type: 'INITIALIZE', payload: config });
    } catch (error) {
      console.error('Failed to load program data:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error : new Error('Failed to load program data') 
      });
    }
  }, [loadAttempted]);

  // Debug output for state changes
  useEffect(() => {
    console.log('Program context state updated:', state);
  }, [state]);

  return (
    <ProgramContext.Provider value={{ state, dispatch }}>
      {state.error ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-red-600">
            Failed to load program data. Please refresh the page.
            {state.error.message && (
              <div className="text-sm mt-2 text-gray-600">
                Error: {state.error.message}
              </div>
            )}
          </div>
        </div>
      ) : children}
    </ProgramContext.Provider>
  );
}

export function useProgram() {
  const context = useContext(ProgramContext);
  
  if (!context) {
    throw new Error('useProgram must be used within a ProgramProvider');
  }

  const { state } = context;

  if (state.error) {
    console.error('Program error:', state.error);
    throw state.error;
  }

  if (!state.isInitialized) {
    console.error('Program not initialized:', state);
    throw new Error('Program data is not yet initialized');
  }

  return {
    programData: state.programData,
    exerciseData: state.exerciseData
  };
}