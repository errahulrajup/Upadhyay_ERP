import { describe, expect, it } from 'vitest';
import { err, isErr, isOk, ok, userMessage } from './index';

describe('Result helpers', () => {
  it('creates success and error results', () => {
    const success = ok({ id: '1' });
    const failure = err('VALIDATION', 'Name is required');

    expect(isOk(success)).toBe(true);
    expect(isErr(failure)).toBe(true);
    if (isErr(failure)) {
      expect(userMessage(failure.error)).toBe('Name is required');
    }
  });
});
