import type { DispatchForm } from '../formModels';
import type { WorkflowStep } from '../verticalSlice';
import { ModuleCard } from './ModuleCard';

export function DispatchScreen({
  form,
  step,
  onDispatchQtyChange,
}: {
  form: DispatchForm;
  step: WorkflowStep | undefined;
  onDispatchQtyChange: (value: string) => void;
}) {
  return (
    <ModuleCard title="Dispatch" step={step}>
      <label>
        Dispatch Qty
        <input type="number" value={form.dispatchQty} onChange={e => onDispatchQtyChange(e.target.value)} />
      </label>
      <p>Confirms dispatch only for CoA-issued released FG lots.</p>
    </ModuleCard>
  );
}

