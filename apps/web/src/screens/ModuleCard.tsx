import type { ReactNode } from 'react';
import type { WorkflowStep } from '../verticalSlice';

export function StepBadge({ status }: { status: WorkflowStep['status'] }) {
  return <span className={`module-badge module-badge-${status}`}>{status}</span>;
}

export function ModuleCard({ title, step, children }: { title: string; step: WorkflowStep | undefined; children: ReactNode }) {
  return (
    <article className="module-card">
      <header>
        <h3>{title}</h3>
        {step && <StepBadge status={step.status} />}
      </header>
      {children}
      {step?.detail && <small>{step.detail}</small>}
    </article>
  );
}

