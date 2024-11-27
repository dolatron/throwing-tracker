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
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, 'NOT_FOUND', 404);
  }

  static badRequest(message = 'Invalid request') {
    return new AppError(message, 'BAD_REQUEST', 400);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 'UNAUTHORIZED', 401);
  }
}

export const handleApiError = (error: unknown): { message: string; status: number } => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      status: error.status
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500
    };
  }

  return {
    message: 'An unexpected error occurred',
    status: 500
  };
};