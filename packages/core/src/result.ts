export type AppErrorCode =
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'PERMISSION'
  | 'NETWORK'
  | 'DATABASE'
  | 'UNKNOWN';

export interface AppError {
  code: AppErrorCode;
  message: string;
  detail?: unknown;
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: AppError };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function err(code: AppErrorCode, message: string, detail?: unknown): Result<never> {
  return { ok: false, error: { code, message, detail } };
}

export function isOk<T>(result: Result<T>): result is { ok: true; data: T } {
  return result.ok;
}

export function isErr<T>(result: Result<T>): result is { ok: false; error: AppError } {
  return !result.ok;
}

