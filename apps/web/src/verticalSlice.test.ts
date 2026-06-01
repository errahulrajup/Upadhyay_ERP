import { describe, expect, it } from 'vitest';
import { FirstSliceService } from '@upadhyay-erp/erp-services';
import { FakeRpcClient } from '@upadhyay-erp/infra';
import {
  defaultVerticalSliceState,
  runVerticalSlice,
  validateVerticalSliceState,
  type WorkflowStep,
} from './verticalSlice';

describe('vertical slice cockpit model', () => {
  it('validates operational inputs', () => {
    const errors = validateVerticalSliceState({
      ...defaultVerticalSliceState,
      plannedQty: 0,
      analyst: '',
    });

    expect(errors).toContain('Planned quantity must be greater than zero.');
    expect(errors).toContain('Analyst is required.');
  });

  it('runs the first-slice service sequence', async () => {
    const rpc = new FakeRpcClient();
    const service = new FirstSliceService(rpc);
    const steps: WorkflowStep[] = [];

    const finalState = await runVerticalSlice(service, defaultVerticalSliceState, step => {
      steps.push(step);
    });

    expect(finalState.paymentId).toBeTruthy();
    expect(steps.filter(step => step.status === 'done')).toHaveLength(8);
    expect(rpc.calls.map(call => call.name)).toEqual([
      'inv.approve_grn',
      'mfg.create_batch',
      'mfg.start_batch',
      'mfg.complete_batch',
      'qa.release_batch_qc',
      'fin.confirm_dispatch',
      'fin.create_invoice_from_dispatch',
      'fin.post_payment',
    ]);
  });
});

