import type { QcResult } from '@upadhyay-erp/erp-services';
import type { VerticalSliceState } from './verticalSlice';

export interface GrnForm {
  grnId: string;
  supplierName: string;
  materialName: string;
  receivedQty: number;
  unitCost: number;
  expiryDate: string;
}

export interface BatchForm {
  productId: string;
  recipeVersionId: string;
  plannedQty: number;
  unit: string;
}

export interface BatchCompletionForm {
  actualQty: number;
  rejectQty: number;
}

export interface QcForm {
  analyst: string;
  reviewer: string;
  results: QcResult[];
}

export interface DispatchForm {
  customerId: string;
  dispatchQty: number;
}

export interface InvoicePaymentForm {
  invoiceTotal: number;
  paymentAmount: number;
  paymentMode: 'BANK' | 'CASH' | 'UPI' | 'CHEQUE' | 'NEFT' | 'RTGS' | 'OTHER';
}

export interface VerticalSliceForms {
  grn: GrnForm;
  batch: BatchForm;
  completion: BatchCompletionForm;
  qc: QcForm;
  dispatch: DispatchForm;
  finance: InvoicePaymentForm;
}

export function formsFromState(state: VerticalSliceState): VerticalSliceForms {
  return {
    grn: {
      grnId: state.grnId,
      supplierName: 'Agro Supplies',
      materialName: 'Shea Butter',
      receivedQty: 250,
      unitCost: 180,
      expiryDate: '2027-01-01',
    },
    batch: {
      productId: state.productId,
      recipeVersionId: state.recipeVersionId,
      plannedQty: state.plannedQty,
      unit: 'kg',
    },
    completion: {
      actualQty: state.actualQty,
      rejectQty: state.rejectQty,
    },
    qc: {
      analyst: state.analyst,
      reviewer: state.reviewer,
      results: state.qcResults,
    },
    dispatch: {
      customerId: state.customerId,
      dispatchQty: state.dispatchQty,
    },
    finance: {
      invoiceTotal: state.invoiceTotal,
      paymentAmount: state.paymentAmount,
      paymentMode: 'BANK',
    },
  };
}

export function stateFromForms(state: VerticalSliceState, forms: VerticalSliceForms): VerticalSliceState {
  return {
    ...state,
    grnId: forms.grn.grnId,
    productId: forms.batch.productId,
    recipeVersionId: forms.batch.recipeVersionId,
    plannedQty: forms.batch.plannedQty,
    actualQty: forms.completion.actualQty,
    rejectQty: forms.completion.rejectQty,
    analyst: forms.qc.analyst,
    reviewer: forms.qc.reviewer,
    qcResults: forms.qc.results,
    customerId: forms.dispatch.customerId,
    dispatchQty: forms.dispatch.dispatchQty,
    invoiceTotal: forms.finance.invoiceTotal,
    paymentAmount: forms.finance.paymentAmount,
  };
}

export function validateForms(forms: VerticalSliceForms): string[] {
  return [
    ...validateGrnForm(forms.grn),
    ...validateBatchForm(forms.batch),
    ...validateBatchCompletionForm(forms.completion),
    ...validateQcForm(forms.qc),
    ...validateDispatchForm(forms.dispatch),
    ...validateInvoicePaymentForm(forms.finance),
  ];
}

export function validateGrnForm(form: GrnForm): string[] {
  const errors: string[] = [];
  if (!form.grnId.trim()) errors.push('GRN ID is required.');
  if (!form.supplierName.trim()) errors.push('Supplier is required.');
  if (!form.materialName.trim()) errors.push('Material is required.');
  if (form.receivedQty <= 0) errors.push('Received quantity must be greater than zero.');
  if (form.unitCost < 0) errors.push('Unit cost cannot be negative.');
  if (!form.expiryDate) errors.push('Expiry date is required.');
  if (form.expiryDate && new Date(form.expiryDate).getTime() < new Date('2026-06-01').getTime()) {
    errors.push('Expired material cannot enter the approval flow.');
  }
  return errors;
}

export function validateBatchForm(form: BatchForm): string[] {
  const errors: string[] = [];
  if (!form.productId.trim()) errors.push('Product is required.');
  if (!form.recipeVersionId.trim()) errors.push('Recipe version is required.');
  if (form.plannedQty <= 0) errors.push('Planned quantity must be greater than zero.');
  if (!form.unit.trim()) errors.push('Batch unit is required.');
  return errors;
}

export function validateBatchCompletionForm(form: BatchCompletionForm): string[] {
  const errors: string[] = [];
  if (form.actualQty < 0) errors.push('Actual quantity cannot be negative.');
  if (form.rejectQty < 0) errors.push('Reject quantity cannot be negative.');
  if (form.rejectQty > form.actualQty) errors.push('Reject quantity cannot exceed actual quantity.');
  return errors;
}

export function validateQcForm(form: QcForm): string[] {
  const errors: string[] = [];
  if (!form.analyst.trim()) errors.push('Analyst is required.');
  if (!form.reviewer.trim()) errors.push('Reviewer is required.');
  if (form.results.length === 0) errors.push('At least one QC result is required.');
  if (form.results.some(result => result.verdict === 'FAIL')) {
    errors.push('PASS release cannot include failed QC results.');
  }
  return errors;
}

export function validateDispatchForm(form: DispatchForm): string[] {
  const errors: string[] = [];
  if (!form.customerId.trim()) errors.push('Customer is required.');
  if (form.dispatchQty <= 0) errors.push('Dispatch quantity must be greater than zero.');
  return errors;
}

export function validateInvoicePaymentForm(form: InvoicePaymentForm): string[] {
  const errors: string[] = [];
  if (form.invoiceTotal < 0) errors.push('Invoice total cannot be negative.');
  if (form.paymentAmount <= 0) errors.push('Payment amount must be greater than zero.');
  if (form.paymentAmount > form.invoiceTotal) errors.push('Payment amount cannot exceed invoice total.');
  return errors;
}

