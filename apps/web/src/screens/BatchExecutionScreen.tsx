import type { BatchCompletionForm } from '../formModels';
import type { WorkflowStep } from '../verticalSlice';
import { ModuleCard } from './ModuleCard';

export function BatchExecutionScreen({
  form,
  step,
  onActualQtyChange,
  onRejectQtyChange,
}: {
  form: BatchCompletionForm;
  step: WorkflowStep | undefined;
  onActualQtyChange: (value: string) => void;
  onRejectQtyChange: (value: string) => void;
}) {
  return (
    <ModuleCard title="Batch Execution" step={step}>
      <div className="two-col-fields">
        <label>
          Actual Qty
          <input type="number" value={form.actualQty} onChange={e => onActualQtyChange(e.target.value)} />
        </label>
        <label>
          Reject Qty
          <input type="number" value={form.rejectQty} onChange={e => onRejectQtyChange(e.target.value)} />
        </label>
      </div>
      <p>Starts and completes batch through service calls, then moves it to QC hold.</p>
    </ModuleCard>
  );
}

