import { describe, expect, it } from 'vitest';
import * as screens from './index';

describe('route-ready vertical slice screens', () => {
  it('exports every module screen through one registry', () => {
    expect(Object.keys(screens).sort()).toEqual([
      'BatchExecutionScreen',
      'BatchPlanningScreen',
      'DispatchScreen',
      'FinanceScreen',
      'GrnApprovalScreen',
      'ModuleCard',
      'QcReleaseScreen',
      'StepBadge',
    ]);
  });
});
