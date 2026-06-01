import { describe, expect, it } from 'vitest';
import { createInitialSteps, defaultVerticalSliceState } from './verticalSlice';

describe('VerticalSliceModules contract', () => {
  it('has one module-ready step for every first-slice operation', () => {
    const steps = createInitialSteps();

    expect(steps.map(step => step.id)).toEqual([
      'grn',
      'batch',
      'start',
      'complete',
      'qc',
      'dispatch',
      'invoice',
      'payment',
    ]);
  });

  it('keeps default state ready for modular cockpit simulation', () => {
    expect(defaultVerticalSliceState.plannedQty).toBeGreaterThan(0);
    expect(defaultVerticalSliceState.actualQty).toBeGreaterThan(0);
    expect(defaultVerticalSliceState.qcResults).toHaveLength(1);
  });
});

