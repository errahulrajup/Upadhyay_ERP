import { describe, expect, it } from 'vitest';
import {
  formsFromState,
  stateFromForms,
  validateBatchCompletionForm,
  validateForms,
  validateGrnForm,
  validateInvoicePaymentForm,
} from './formModels';
import { defaultVerticalSliceState } from './verticalSlice';

describe('module form models', () => {
  it('maps state to forms and back', () => {
    const forms = formsFromState(defaultVerticalSliceState);
    const nextState = stateFromForms(defaultVerticalSliceState, {
      ...forms,
      batch: { ...forms.batch, plannedQty: 125 },
      finance: { ...forms.finance, paymentAmount: 12500 },
    });

    expect(nextState.plannedQty).toBe(125);
    expect(nextState.paymentAmount).toBe(12500);
  });

  it('blocks expired GRN material', () => {
    const errors = validateGrnForm({
      grnId: 'grn-1',
      supplierName: 'Supplier',
      materialName: 'Material',
      receivedQty: 10,
      unitCost: 20,
      expiryDate: '2025-12-01',
    });

    expect(errors).toContain('Expired material cannot enter the approval flow.');
  });

  it('blocks impossible batch completion values', () => {
    const errors = validateBatchCompletionForm({ actualQty: 5, rejectQty: 6 });

    expect(errors).toContain('Reject quantity cannot exceed actual quantity.');
  });

  it('blocks overpayment', () => {
    const errors = validateInvoicePaymentForm({
      invoiceTotal: 100,
      paymentAmount: 101,
      paymentMode: 'BANK',
    });

    expect(errors).toContain('Payment amount cannot exceed invoice total.');
  });

  it('validates the default vertical-slice forms', () => {
    expect(validateForms(formsFromState(defaultVerticalSliceState))).toEqual([]);
  });
});

