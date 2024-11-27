import { useContext } from 'react';
import { ProgramContext } from '@/contexts/program-context';

export const useProgram = () => {
  const context = useContext(ProgramContext);
  
  if (!context) {
    throw new Error('useProgram must be used within a ProgramProvider');
  }

  const { state } = context;

  if (!state.isInitialized) {
    throw new Error('Program data is not yet initialized');
  }

  if (state.error) {
    throw state.error;
  }

  return {
    programData: state.programData,
    exerciseData: state.exerciseData
  };
};