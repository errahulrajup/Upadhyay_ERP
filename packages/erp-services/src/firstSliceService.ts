import { err, normalizeUnknownError, ok, type Result } from '@upadhyay-erp/core';
import type { RpcClient } from './rpcClient';
import type {
  CompleteBatchInput,
  ConfirmDispatchInput,
  CreateBatchInput,
  CreateInvoiceInput,
  PostPaymentInput,
  ReleaseBatchQcInput,
  Uuid,
} from './types';

export class FirstSliceService {
  constructor(private readonly rpc: RpcClient) {}

  async approveGrn(grnId: Uuid, actorId: Uuid): Promise<Result<Uuid>> {
    if (!grnId || !actorId) return err('VALIDATION', 'GRN and actor are required');

    return this.callUuid('inv.approve_grn', {
      target_grn_id: grnId,
      actor_id: actorId,
    });
  }

  async createBatch(input: CreateBatchInput): Promise<Result<Uuid>> {
    if (input.plannedQty <= 0) return err('VALIDATION', 'Planned quantity must be greater than zero');
    if (!input.unit.trim()) return err('VALIDATION', 'Unit is required');

    return this.callUuid('mfg.create_batch', {
      target_product_id: input.productId,
      target_recipe_version_id: input.recipeVersionId,
      planned_qty: input.plannedQty,
      target_unit: input.unit,
      actor_id: input.actorId,
    });
  }

  async startBatch(batchId: Uuid, actorId: Uuid): Promise<Result<void>> {
    if (!batchId || !actorId) return err('VALIDATION', 'Batch and actor are required');

    return this.callVoid('mfg.start_batch', {
      target_batch_id: batchId,
      actor_id: actorId,
    });
  }

  async completeBatch(input: CompleteBatchInput): Promise<Result<void>> {
    if (input.actualOutputQty < 0 || input.rejectOutputQty < 0) {
      return err('VALIDATION', 'Actual and reject quantities cannot be negative');
    }

    return this.callVoid('mfg.complete_batch', {
      target_batch_id: input.batchId,
      actual_output_qty: input.actualOutputQty,
      reject_output_qty: input.rejectOutputQty,
      actor_id: input.actorId,
    });
  }

  async releaseBatchQc(input: ReleaseBatchQcInput): Promise<Result<Uuid>> {
    if (!input.analyst.trim() || !input.reviewer.trim()) {
      return err('VALIDATION', 'Analyst and reviewer are required');
    }
    if (input.results.length === 0) {
      return err('VALIDATION', 'At least one QC result is required');
    }
    if (input.verdict === 'PASS' && input.results.some(result => result.verdict === 'FAIL')) {
      return err('VALIDATION', 'Cannot pass QC when a parameter failed');
    }

    return this.callUuid('qa.release_batch_qc', {
      target_batch_id: input.batchId,
      verdict: input.verdict,
      analyst_name: input.analyst,
      reviewer_name: input.reviewer,
      result_payload: input.results,
      actor_id: input.actorId,
    });
  }

  async confirmDispatch(input: ConfirmDispatchInput): Promise<Result<Uuid>> {
    if (input.qty <= 0) return err('VALIDATION', 'Dispatch quantity must be greater than zero');

    return this.callUuid('fin.confirm_dispatch', {
      target_customer_id: input.customerId,
      target_fg_lot_id: input.fgLotId,
      dispatch_qty: input.qty,
      actor_id: input.actorId,
    });
  }

  async createInvoice(input: CreateInvoiceInput): Promise<Result<Uuid>> {
    if (input.total < 0) return err('VALIDATION', 'Invoice total cannot be negative');

    return this.callUuid('fin.create_invoice_from_dispatch', {
      target_dispatch_id: input.dispatchId,
      invoice_total: input.total,
      actor_id: input.actorId,
    });
  }

  async postPayment(input: PostPaymentInput): Promise<Result<Uuid>> {
    if (input.amount <= 0) return err('VALIDATION', 'Payment amount must be greater than zero');

    return this.callUuid('fin.post_payment', {
      target_invoice_id: input.invoiceId,
      payment_amount: input.amount,
      payment_mode: input.mode,
      payment_reference: input.reference ?? null,
      payment_notes: input.notes ?? null,
      actor_id: input.actorId,
    });
  }

  private async callUuid(name: string, args: Record<string, unknown>): Promise<Result<Uuid>> {
    const response = await this.rpc.call<Uuid>(name, args);
    if (response.error) return { ok: false, error: normalizeUnknownError(response.error) };
    if (!response.data) return err('DATABASE', `${name} returned no id`);
    return ok(response.data);
  }

  private async callVoid(name: string, args: Record<string, unknown>): Promise<Result<void>> {
    const response = await this.rpc.call<void>(name, args);
    if (response.error) return { ok: false, error: normalizeUnknownError(response.error) };
    return ok(undefined);
  }
}

