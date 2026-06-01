import { FirstSliceService, type QcResult } from '@upadhyay-erp/erp-services';

export type WorkflowStepId =
  | 'grn'
  | 'batch'
  | 'start'
  | 'complete'
  | 'qc'
  | 'dispatch'
  | 'invoice'
  | 'payment';

export interface WorkflowStep {
  id: WorkflowStepId;
  label: string;
  status: 'waiting' | 'ready' | 'running' | 'done' | 'failed';
  detail?: string;
}

export interface VerticalSliceState {
  actorId: string;
  grnId: string;
  productId: string;
  recipeVersionId: string;
  customerId: string;
  lotId?: string;
  batchId?: string;
  qcCheckId?: string;
  fgLotId?: string;
  dispatchId?: string;
  invoiceId?: string;
  paymentId?: string;
  plannedQty: number;
  actualQty: number;
  rejectQty: number;
  dispatchQty: number;
  invoiceTotal: number;
  paymentAmount: number;
  analyst: string;
  reviewer: string;
  qcResults: QcResult[];
}

export const defaultVerticalSliceState: VerticalSliceState = {
  actorId: '33333333-3333-4333-8333-333333333333',
  grnId: '11111111-1111-4111-8111-111111111111',
  productId: '30000000-0000-4000-8000-000000000001',
  recipeVersionId: '51000000-0000-4000-8000-000000000001',
  customerId: '40000000-0000-4000-8000-000000000001',
  plannedQty: 100,
  actualQty: 96,
  rejectQty: 1,
  dispatchQty: 25,
  invoiceTotal: 25000,
  paymentAmount: 25000,
  analyst: 'QC Lead',
  reviewer: 'QA Manager',
  qcResults: [{ parameter: 'pH', specification: '6.5-7.5', result: '7.0', verdict: 'PASS' }],
};

export function createInitialSteps(): WorkflowStep[] {
  return [
    { id: 'grn', label: 'Approve GRN', status: 'ready' },
    { id: 'batch', label: 'Create Batch', status: 'waiting' },
    { id: 'start', label: 'Start Batch', status: 'waiting' },
    { id: 'complete', label: 'Complete Batch', status: 'waiting' },
    { id: 'qc', label: 'Release QC', status: 'waiting' },
    { id: 'dispatch', label: 'Confirm Dispatch', status: 'waiting' },
    { id: 'invoice', label: 'Create Invoice', status: 'waiting' },
    { id: 'payment', label: 'Post Payment', status: 'waiting' },
  ];
}

export function validateVerticalSliceState(state: VerticalSliceState): string[] {
  const errors: string[] = [];
  if (!state.actorId) errors.push('Actor is required.');
  if (!state.grnId) errors.push('GRN ID is required.');
  if (!state.productId) errors.push('Product is required.');
  if (!state.recipeVersionId) errors.push('Recipe version is required.');
  if (!state.customerId) errors.push('Customer is required.');
  if (state.plannedQty <= 0) errors.push('Planned quantity must be greater than zero.');
  if (state.actualQty < 0) errors.push('Actual quantity cannot be negative.');
  if (state.rejectQty < 0) errors.push('Reject quantity cannot be negative.');
  if (state.dispatchQty <= 0) errors.push('Dispatch quantity must be greater than zero.');
  if (state.invoiceTotal < 0) errors.push('Invoice total cannot be negative.');
  if (state.paymentAmount <= 0) errors.push('Payment amount must be greater than zero.');
  if (!state.analyst.trim()) errors.push('Analyst is required.');
  if (!state.reviewer.trim()) errors.push('Reviewer is required.');
  if (state.qcResults.length === 0) errors.push('At least one QC result is required.');
  if (state.qcResults.some(result => result.verdict === 'FAIL')) {
    errors.push('Simulation PASS path cannot include failed QC results.');
  }
  return errors;
}

export async function runVerticalSlice(
  service: FirstSliceService,
  state: VerticalSliceState,
  onStep: (step: WorkflowStep) => void,
): Promise<VerticalSliceState> {
  let next = { ...state };

  const run = async <T>(
    id: WorkflowStepId,
    label: string,
    action: () => Promise<{ ok: true; data: T } | { ok: false; error: { message: string } }>,
    onSuccess?: (data: T) => void,
  ) => {
    onStep({ id, label, status: 'running' });
    const result = await action();
    if (!result.ok) {
      onStep({ id, label, status: 'failed', detail: result.error.message });
      throw new Error(result.error.message);
    }
    onSuccess?.(result.data);
    onStep({ id, label, status: 'done', detail: typeof result.data === 'string' ? result.data : 'Done' });
  };

  await run('grn', 'Approve GRN', () => service.approveGrn(next.grnId, next.actorId), lotId => { next.lotId = lotId; });
  await run('batch', 'Create Batch', () => service.createBatch({
    productId: next.productId,
    recipeVersionId: next.recipeVersionId,
    plannedQty: next.plannedQty,
    unit: 'kg',
    actorId: next.actorId,
  }), batchId => { next.batchId = batchId; });
  await run('start', 'Start Batch', () => service.startBatch(next.batchId!, next.actorId));
  await run('complete', 'Complete Batch', () => service.completeBatch({
    batchId: next.batchId!,
    actualOutputQty: next.actualQty,
    rejectOutputQty: next.rejectQty,
    actorId: next.actorId,
  }));
  await run('qc', 'Release QC', () => service.releaseBatchQc({
    batchId: next.batchId!,
    verdict: 'PASS',
    analyst: next.analyst,
    reviewer: next.reviewer,
    results: next.qcResults,
    actorId: next.actorId,
  }), qcCheckId => {
    next.qcCheckId = qcCheckId;
    next.fgLotId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0004';
  });
  await run('dispatch', 'Confirm Dispatch', () => service.confirmDispatch({
    customerId: next.customerId,
    fgLotId: next.fgLotId!,
    qty: next.dispatchQty,
    actorId: next.actorId,
  }), dispatchId => { next.dispatchId = dispatchId; });
  await run('invoice', 'Create Invoice', () => service.createInvoice({
    dispatchId: next.dispatchId!,
    total: next.invoiceTotal,
    actorId: next.actorId,
  }), invoiceId => { next.invoiceId = invoiceId; });
  await run('payment', 'Post Payment', () => service.postPayment({
    invoiceId: next.invoiceId!,
    amount: next.paymentAmount,
    mode: 'BANK',
    reference: 'SIM-UTR-001',
    notes: 'Phase 5 cockpit simulation',
    actorId: next.actorId,
  }), paymentId => { next.paymentId = paymentId; });

  return next;
}

