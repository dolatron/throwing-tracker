'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { ProgramConfig, ProgramState, Program, UserProgram } from '@/types';
import type { ApiResponse } from '@/types/api';
import rawProgramData from '@/programs/driveline-catcher-velo/program.json';
import rawExerciseData from '@/programs/driveline-catcher-velo/exercises.json';

export interface ProgramContextType {
  state: ProgramState;
  fetchProgram: (programId: string) => Promise<ApiResponse<Program>>;
  fetchUserProgram: (userId: string) => Promise<ApiResponse<Program>>;
  createUserProgram: (userId: string, programId: string, name?: string) => Promise<ApiResponse<UserProgram>>;
  isLoading: boolean;
}

const initialState: ProgramState = {
  programData: {
    id: '',
    name: '',
    version: '',
    description: '',
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

export const ProgramContext = createContext<ProgramContextType>({
  state: initialState,
  fetchProgram: async () => ({ error: 'Not implemented', status: 500 }),
  fetchUserProgram: async () => ({ error: 'Not implemented', status: 500 }),
  createUserProgram: async () => ({ error: 'Not implemented', status: 500 }),
  isLoading: true
});

function validateProgramData(data: unknown): data is Program {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    console.error('Invalid program data structure');
    return false;
  }

  const program = data as Partial<Program>;
  
  // Check required fields exist
  const requiredFields: (keyof Program)[] = ['id', 'name', 'version', 'description', 'workoutTypes', 'schedule'];
  const missingFields = requiredFields.filter(field => !program[field]);
  
  if (missingFields.length > 0) {
    console.error('Missing required program fields:', missingFields);
    return false;
  }

  // Validate workout types
  if (typeof program.workoutTypes !== 'object' || Array.isArray(program.workoutTypes)) {
    console.error('Invalid workoutTypes structure');
    return false;
  }

  // Validate schedule
  if (!program.schedule || typeof program.schedule !== 'object') {
    console.error('Invalid schedule structure');
    return false;
  }

  if (!Array.isArray(program.schedule.weeks)) {
    console.error('Schedule weeks must be an array');
    return false;
  }

  // Validate schedule weeks
  const hasInvalidWeeks = program.schedule.weeks.some(week => {
    if (!week.id || !Array.isArray(week.days)) {
      console.error('Invalid week structure:', week);
      return true;
    }
    return false;
  });

  if (hasInvalidWeeks) {
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
  const [state, setState] = useState<ProgramState>(initialState);
  const [isLoading] = useState(true);
  const supabase = createClientComponentClient();

  const fetchProgram = async (programId: string): Promise<ApiResponse<Program>> => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('id', programId)
        .single();

      if (error) throw error;
      
      if (!validateProgramData(data)) {
        throw new Error('Invalid program data format');
      }

      return { data, status: 200 };
    } catch (error) {
      console.error('Failed to fetch program:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to fetch program',
        status: 500
      };
    }
  };

  const fetchUserProgram = async (userId: string): Promise<ApiResponse<Program>> => {
    try {
      const { data, error } = await supabase
        .from('user_programs')
        .select('*, programs(*)')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      if (!validateProgramData(data.programs)) {
        throw new Error('Invalid program data format');
      }

      return { data: data.programs, status: 200 };
    } catch (error) {
      console.error('Failed to fetch user program:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to fetch user program',
        status: 500
      };
    }
  };

  const createUserProgram = async (
    userId: string, 
    programId: string,
    name?: string
  ): Promise<ApiResponse<UserProgram>> => {
    try {
      // Create user program
      const { data: programData, error: programError } = await supabase
        .from('user_programs')
        .insert({
          user_id: userId,
          program_id: programId,
          start_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (programError) throw programError;

      // If name is provided, update user profile
      if (name) {
        const { error: userError } = await supabase
          .from('users')
          .update({ 
            name,
            updated_at: new Date().toISOString() 
          })
          .eq('id', userId);

        if (userError) throw userError;
      }

      return { data: programData, status: 200 };
    } catch (error) {
      console.error('Failed to create user program:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to create user program',
        status: 500
      };
    }
  };

  useEffect(() => {
    const initializeProgram = async () => {
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

        setState({
          programData,
          exerciseData,
          isInitialized: true,
          isLoading: false
        });
      } catch (error) {
        console.error('Failed to load program data:', error);
        setState(prev => ({
          ...prev,
          isInitialized: false,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Failed to load program data')
        }));
      }
    };

    initializeProgram();
  }, []);

  return (
    <ProgramContext.Provider
      value={{
        state,
        fetchProgram,
        fetchUserProgram,
        createUserProgram,
        isLoading
      }}
    >
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
  
  return context;
}