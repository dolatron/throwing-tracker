// lib/workout.ts
import type { DayWorkout, Program, WorkoutProgram, Exercise, ProgramConfig } from '@/types';

export const getBaseWorkout = (workout: string): string => {
  const base = workout.split(' OR ')[0].trim().replace('*', '');
  if (base !== workout) {
    console.debug('getBaseWorkout transformation:', { input: workout, output: base });
  }
  return base;
};

export const getWorkoutProgram = (workout: string, programConfig: ProgramConfig | null): WorkoutProgram | undefined => {
  if (!programConfig?.programData?.workoutTypes) {
    console.warn('Program configuration is not properly initialized');
    return undefined;
  }

  const baseWorkout = getBaseWorkout(workout);
  const workoutType = programConfig.programData.workoutTypes[baseWorkout];
  
  if (!workoutType) return undefined;

  const mergeExerciseWithDefaults = (exercise: Exercise): Exercise => {
    const baseExercise = programConfig.exerciseData.exercises[exercise.id];
    if (!baseExercise) return exercise;

    return {
      ...baseExercise,
      ...exercise,
    };
  };

  const workoutProgram: WorkoutProgram = {
    warmup: workoutType.sections
      .find(s => s.name.toLowerCase() === 'warmup')
      ?.exercises.map(mergeExerciseWithDefaults) || [],
    throwing: workoutType.sections
      .find(s => s.name.toLowerCase() === 'throwing')
      ?.exercises.map(mergeExerciseWithDefaults) || [],
    recovery: workoutType.sections
      .find(s => s.name.toLowerCase() === 'recovery')
      ?.exercises.map(mergeExerciseWithDefaults) || [],
    rpeRange: workoutType.rpeRange,
    notes: workoutType.notes
  };

  return workoutProgram;
};

export const calculateWorkoutStats = (
  day: DayWorkout, 
  programData: Program
) => {
  if (!programData?.workoutTypes) {
    return {
      completedCount: 0,
      totalExercises: 0,
      isCompleted: false,
      inProgress: false,
      completionPercentage: 0
    };
  }

  const workoutConfig = programData.workoutTypes[day.workout];
  if (!workoutConfig) {
    return {
      completedCount: 0,
      totalExercises: 0,
      isCompleted: false,
      inProgress: false,
      completionPercentage: 0
    };
  }

  const allExercises = workoutConfig.sections.flatMap(section => section.exercises);
  const totalExercises = allExercises.length;
  const completedCount = Object.values(day.completed || {}).filter(Boolean).length;
  const completionPercentage = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;

  return {
    completedCount,
    totalExercises,
    isCompleted: completionPercentage === 100,
    inProgress: completionPercentage > 0 && completionPercentage < 100,
    completionPercentage
  };
};

export const generateSchedule = (startDate: Date, programData: Program): DayWorkout[][] => {
  if (!programData?.schedule?.weeks) {
    console.error('Invalid program data provided to generateSchedule');
    return [];
  }

  const schedule: DayWorkout[][] = [];
  const weeks = programData.schedule.weeks;

  weeks.forEach((week, weekIndex) => {
    const weekSchedule: DayWorkout[] = week.days.map((workoutType, dayIndex) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + (weekIndex * 7) + dayIndex);
      
      return {
        date,
        workout: workoutType,
        completed: {},
        userProgramId: programData.id
      };
    });

    schedule.push(weekSchedule);
  });

  return schedule;
};