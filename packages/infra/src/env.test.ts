import { describe, expect, it } from 'vitest';
import { readRuntimeEnv } from './env';

describe('readRuntimeEnv', () => {
  it('requires Supabase config for live mode', () => {
    const result = readRuntimeEnv({});
    expect(result.ok).toBe(false);
  });

  it('accepts valid runtime config', () => {
    const result = readRuntimeEnv({
      VITE_APP_NAME: 'Upadhyay_ERP',
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'anon',
    });

    expect(result.ok).toBe(true);
  });
});

