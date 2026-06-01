import type { GrnForm } from '../formModels';
import type { WorkflowStep } from '../verticalSlice';
import { ModuleCard } from './ModuleCard';

export function GrnApprovalScreen({ form, step }: { form: GrnForm; step: WorkflowStep | undefined }) {
  return (
    <ModuleCard title="GRN Approval" step={step}>
      <label>
        GRN ID
        <input value={form.grnId} readOnly />
      </label>
      <label>
        Supplier
        <input value={form.supplierName} readOnly />
      </label>
      <label>
        Material
        <input value={form.materialName} readOnly />
      </label>
      <p>Approves QC-pending GRN and creates RM lot plus stock IN movement.</p>
    </ModuleCard>
  );
}

