export type Uuid = string;

export interface CreateBatchInput {
  productId: Uuid;
  recipeVersionId: Uuid;
  plannedQty: number;
  unit: string;
  actorId: Uuid;
}

export interface CompleteBatchInput {
  batchId: Uuid;
  actualOutputQty: number;
  rejectOutputQty: number;
  actorId: Uuid;
}

export interface ReleaseBatchQcInput {
  batchId: Uuid;
  verdict: 'PASS' | 'FAIL' | 'HOLD';
  analyst: string;
  reviewer: string;
  results: QcResult[];
  actorId: Uuid;
}

export interface QcResult {
  parameter: string;
  specification: string;
  result: string;
  verdict: 'PASS' | 'FAIL' | 'HOLD' | 'NA';
}

export interface ConfirmDispatchInput {
  customerId: Uuid;
  fgLotId: Uuid;
  qty: number;
  actorId: Uuid;
}

export interface CreateInvoiceInput {
  dispatchId: Uuid;
  total: number;
  actorId: Uuid;
}

export interface PostPaymentInput {
  invoiceId: Uuid;
  amount: number;
  mode: 'BANK' | 'CASH' | 'UPI' | 'CHEQUE' | 'NEFT' | 'RTGS' | 'OTHER';
  reference?: string;
  notes?: string;
  actorId: Uuid;
}

