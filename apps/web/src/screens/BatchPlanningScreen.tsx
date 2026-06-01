import type { BatchForm } from '../formModels';
import type { WorkflowStep } from '../verticalSlice';
import { ModuleCard } from './ModuleCard';

export function BatchPlanningScreen({
  form,
  step,
  onPlannedQtyChange,
}: {
  form: BatchForm;
  step: WorkflowStep | undefined;
  onPlannedQtyChange: (value: string) => void;
}) {
  return (
    <ModuleCard title="Batch Planning" step={step}>
      <label>
        Product ID
        <input value={form.productId} readOnly />
      </label>
      <label>
        Planned Qty
        <input type="number" value={form.plannedQty} onChange={e => onPlannedQtyChange(e.target.value)} />
      </label>
      <p>Creates a planned batch using product and approved recipe version.</p>
    </ModuleCard>
  );
}

