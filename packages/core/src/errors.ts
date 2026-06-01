import type { AppError, AppErrorCode } from './result';

interface UnknownDbError {
  code?: string;
  message?: string;
  details?: string;
}

const conflictCodes = new Set(['23505']);
const permissionCodes = new Set(['42501', 'PGRST301']);
const notFoundCodes = new Set(['PGRST116']);

export function normalizeUnknownError(error: unknown): AppError {
  if (typeof error === 'object' && error !== null) {
    const candidate = error as UnknownDbError;
    const message = candidate.message ?? 'Unexpected error';
    const code = mapDbCode(candidate.code);
    return { code, message, detail: error };
  }

  if (typeof error === 'string') {
    return { code: 'UNKNOWN', message: error };
  }

  return { code: 'UNKNOWN', message: 'Unexpected error', detail: error };
}

function mapDbCode(code: string | undefined): AppErrorCode {
  if (!code) return 'UNKNOWN';
  if (conflictCodes.has(code)) return 'CONFLICT';
  if (permissionCodes.has(code)) return 'PERMISSION';
  if (notFoundCodes.has(code)) return 'NOT_FOUND';
  return 'DATABASE';
}

export function userMessage(error: AppError): string {
  switch (error.code) {
    case 'VALIDATION':
      return error.message;
    case 'CONFLICT':
      return 'This record already exists. Please refresh and try again.';
    case 'PERMISSION':
      return 'You do not have permission to perform this action.';
    case 'NOT_FOUND':
      return 'The requested record was not found.';
    case 'NETWORK':
      return 'Network issue. Please check connection and retry.';
    case 'DATABASE':
      return 'Database operation failed. Please retry or contact support.';
    case 'UNKNOWN':
    default:
      return 'Unexpected error. Please retry or contact support.';
  }
}

