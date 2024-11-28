// hooks/useProgram.ts
import { useContext } from 'react';
import { ProgramContext } from '@/contexts/program-context';

export function useProgram() {
  const context = useContext(ProgramContext);
  
  if (!context) {
    throw new Error('useProgram must be used within a ProgramProvider');
  }

  if (!context.state.isInitialized) {
    throw new Error('Program data is not yet initialized');
  }

  if (context.state.error) {
    throw context.state.error;
  }

  return {
    programData: context.state.programData,
    exerciseData: context.state.exerciseData,
    isLoading: context.isLoading
  };
}