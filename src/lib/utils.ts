// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';

// Style utilities
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date utilities
export const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export const formatDate = (date: Date, options: Intl.DateTimeFormatOptions): string => 
  date.toLocaleDateString('en-US', options);

export const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
};

export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const calculateEndDate = (startDate: Date, programLength: number): Date => {
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + (programLength * 7) - 1);
  return endDate;
};

// Validation utilities
export const validationSchemas = {
  id: z.string().min(1),
  email: z.string().email(),
  date: z.string().or(z.date()),
  notes: z.string().optional(),
} as const;

export const validate = <T>(schema: z.Schema<T>, data: unknown): T => {
  return schema.parse(data);
};

// Error handling
// lib/utils.ts

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static notFound(message = 'Resource not found', originalError?: unknown) {
    return new AppError(message, 'NOT_FOUND', 404, originalError);
  }

  static badRequest(message = 'Invalid request', originalError?: unknown) {
    return new AppError(message, 'BAD_REQUEST', 400, originalError);
  }

  static unauthorized(message = 'Unauthorized', originalError?: unknown) {
    return new AppError(message, 'UNAUTHORIZED', 401, originalError);
  }

  static forbidden(message = 'Forbidden', originalError?: unknown) {
    return new AppError(message, 'FORBIDDEN', 403, originalError);
  }

  static internal(message = 'Internal server error', originalError?: unknown) {
    return new AppError(message, 'INTERNAL_ERROR', 500, originalError);
  }
}

interface ErrorResponse {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

export const handleApiError = (error: unknown): ErrorResponse => {
  // Handle AppError instances
  if (error instanceof AppError) {
    return {
      message: error.message,
      status: error.status,
      code: error.code,
      details: error.originalError
    };
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500,
      details: error
    };
  }

  // Handle Supabase errors
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const supabaseError = error as { code: string; message?: string; details?: string };
    return {
      message: supabaseError.message || 'Database error occurred',
      status: 500,
      code: supabaseError.code,
      details: supabaseError.details
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
      status: 500
    };
  }

  // Default case for unknown error types
  return {
    message: 'An unexpected error occurred',
    status: 500,
    details: error
  };
};

export const isApiError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};