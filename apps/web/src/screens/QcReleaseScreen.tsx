import type { QcForm } from '../formModels';
import type { WorkflowStep } from '../verticalSlice';
import { ModuleCard } from './ModuleCard';

export function QcReleaseScreen({
  form,
  step,
  onAnalystChange,
  onReviewerChange,
}: {
  form: QcForm;
  step: WorkflowStep | undefined;
  onAnalystChange: (value: string) => void;
  onReviewerChange: (value: string) => void;
}) {
  return (
    <ModuleCard title="QC Release" step={step}>
      <div className="two-col-fields">
        <label>
          Analyst
          <input value={form.analyst} onChange={e => onAnalystChange(e.target.value)} />
        </label>
        <label>
          Reviewer
          <input value={form.reviewer} onChange={e => onReviewerChange(e.target.value)} />
        </label>
      </div>
      <p>Validates result payload, blocks invalid CoA, and creates FG lot on PASS.</p>
    </ModuleCard>
  );
}

