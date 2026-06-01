import { err, ok, type Result } from '@upadhyay-erp/core';

export interface RuntimeEnv {
  appName: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function readRuntimeEnv(source: Record<string, string | undefined>): Result<RuntimeEnv> {
  const appName = source.VITE_APP_NAME?.trim() || 'Upadhyay_ERP';
  const supabaseUrl = source.VITE_SUPABASE_URL?.trim() ?? '';
  const supabaseAnonKey = source.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return err('VALIDATION', 'Supabase URL and anon key are required to use live mode');
  }

  try {
    new URL(supabaseUrl);
  } catch {
    return err('VALIDATION', 'Supabase URL must be a valid URL');
  }

  return ok({ appName, supabaseUrl, supabaseAnonKey });
}

