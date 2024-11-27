// hooks/useProgramDebug.ts
import { useContext } from 'react';
import { ProgramContext } from '@/contexts/program-context';

export function useProgramDebug() {
  const context = useContext(ProgramContext);
  
  if (!context) {
    console.error('Program context is null - provider missing');
    throw new Error('useProgram must be used within a ProgramProvider');
  }

  const { state } = context;

  console.log('Program context state:', {
    isInitialized: state.isInitialized,
    hasError: !!state.error,
    hasProgramData: !!state.programData,
    hasExerciseData: !!state.exerciseData,
    programId: state.programData?.id,
    exerciseCount: state.exerciseData ? 
      Object.keys(state.exerciseData.exercises).length : 0
  });

  if (!state.isInitialized) {
    console.error('Program data not initialized:', state);
    throw new Error('Program data is not yet initialized');
  }

  if (state.error) {
    console.error('Program error:', state.error);
    throw state.error;
  }

  return {
    programData: state.programData,
    exerciseData: state.exerciseData
  };
}