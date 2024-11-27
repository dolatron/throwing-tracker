// views/workout-tracker/components/workout-section.tsx
'use client';

import { ExternalLink } from 'lucide-react';
import { Checkbox, Label } from '@/views/shared/components/elements';
import { cn } from "@/lib/utils";
import type { Exercise } from '@/types/workout';

// Internal ExerciseRow component
interface ExerciseRowProps {
  exercise: Exercise;
  completed: boolean;
  onComplete: () => void;
  id: string;
}

function ExerciseRow({
  exercise,
  completed,
  onComplete,
  id
}: ExerciseRowProps) {
  // Extract exercise properties with fallbacks
  const sets = exercise.sets || exercise.defaultSets;
  const reps = exercise.reps || exercise.defaultReps;
  const rpe = exercise.rpe || exercise.defaultRpe;
  const notes = exercise.notes || exercise.defaultNotes;
  const name = exercise.name || exercise.id;

  const containerClasses = cn(
    "flex items-start gap-2 sm:gap-3 p-2 rounded-lg",
    "hover:bg-gray-50/50 transition-colors"
  );

  const nameClasses = cn(
    "font-medium text-base",
    completed ? "text-gray-400 line-through" : "text-gray-900"
  );

  const metaClasses = cn(
    "text-sm",
    completed ? "text-gray-400" : "text-gray-600"
  );

  const rpeClasses = cn(
    completed ? "text-gray-400" : "text-indigo-600 font-medium"
  );

  const notesClasses = cn(
    "text-xs",
    completed ? "text-gray-400" : "text-gray-500"
  );

  return (
    <div className={containerClasses} onClick={onComplete}>
      <div className="flex items-start gap-2 flex-grow">
        <Checkbox
          id={id}
          checked={completed}
          onCheckedChange={onComplete}
          className="h-5 w-5 mt-0.5 rounded border-gray-900"
        />

        <Label htmlFor={id} className="flex-grow cursor-pointer select-none">
          <div className="space-y-1">
            <div className={nameClasses}>{name}</div>

            <div className="flex flex-wrap gap-2 text-sm">
              {/* Sets and Reps */}
              {reps && (
                <span className={metaClasses}>
                  {sets !== undefined ? `${sets}x${reps}` : reps}
                </span>
              )}

              {/* RPE */}
              {rpe && (
                <span className={rpeClasses}>@{rpe}</span>
              )}
            </div>

            {/* Notes */}
            {notes && (
              <div className={notesClasses}>{notes}</div>
            )}
          </div>
        </Label>
      </div>

      {/* Video Link */}
      {exercise.videoUrl && (
        <a
          href={exercise.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded-full transition-colors shrink-0"
          onClick={(e) => e.stopPropagation()}
          aria-label={`Watch video demonstration for ${exercise.name}`}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}

// Main WorkoutSection component
export interface WorkoutSectionProps {
  title: string;
  exercises: Exercise[];
  completed: Record<string, boolean>;
  onComplete: (id: string) => void;
  sectionId: string;
}

export function WorkoutSection({
  title,
  exercises = [],
  completed,
  onComplete,
  sectionId
}: WorkoutSectionProps) {
  const completedCount = exercises.filter(ex => 
    completed[`${sectionId}-${ex.id}`]
  ).length;

  return (
    <div className="rounded-lg p-3 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-indigo-900">
          {title}
        </h3>
        <span className="text-sm text-gray-500">
          {completedCount} / {exercises.length}
        </span>
      </div>

      <div className="space-y-1">
        {exercises.map((exercise) => {
          const exerciseId = `${sectionId}-${exercise.id}`;
          return (
            <ExerciseRow
              key={exerciseId}
              exercise={exercise}
              completed={!!completed[exerciseId]}
              onComplete={() => onComplete(exerciseId)}
              id={exerciseId}
            />
          );
        })}
      </div>
    </div>
  );
}