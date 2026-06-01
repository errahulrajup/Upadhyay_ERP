import type { InvoicePaymentForm } from '../formModels';
import type { WorkflowStep } from '../verticalSlice';
import { ModuleCard } from './ModuleCard';

export function FinanceScreen({
  form,
  step,
  onInvoiceTotalChange,
  onPaymentAmountChange,
}: {
  form: InvoicePaymentForm;
  step: WorkflowStep | undefined;
  onInvoiceTotalChange: (value: string) => void;
  onPaymentAmountChange: (value: string) => void;
}) {
  return (
    <ModuleCard title="Invoice and Payment" step={step}>
      <div className="two-col-fields">
        <label>
          Invoice Total
          <input type="number" value={form.invoiceTotal} onChange={e => onInvoiceTotalChange(e.target.value)} />
        </label>
        <label>
          Payment Amount
          <input type="number" value={form.paymentAmount} onChange={e => onPaymentAmountChange(e.target.value)} />
        </label>
      </div>
      <p>Creates invoice and posts payment through one service boundary.</p>
    </ModuleCard>
  );
}

