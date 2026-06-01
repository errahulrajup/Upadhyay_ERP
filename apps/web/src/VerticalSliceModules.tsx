import type { VerticalSliceForms } from './formModels';
import type { WorkflowStep } from './verticalSlice';
import {
  BatchExecutionScreen,
  BatchPlanningScreen,
  DispatchScreen,
  FinanceScreen,
  GrnApprovalScreen,
  QcReleaseScreen,
} from './screens';

type NumberKey = 'plannedQty' | 'actualQty' | 'rejectQty' | 'dispatchQty' | 'invoiceTotal' | 'paymentAmount';

interface ModuleProps {
  forms: VerticalSliceForms;
  steps: WorkflowStep[];
  errors: string[];
  isRunning: boolean;
  onRun: () => void;
  onNumberChange: (key: NumberKey, value: string) => void;
  onTextChange: (key: 'analyst' | 'reviewer', value: string) => void;
}

function findStep(steps: WorkflowStep[], id: WorkflowStep['id']) {
  return steps.find(step => step.id === id);
}

export function VerticalSliceModules({
  forms,
  steps,
  errors,
  isRunning,
  onRun,
  onNumberChange,
  onTextChange,
}: ModuleProps) {
  return (
    <section className="modules-shell" aria-label="Vertical slice modules">
      <GrnApprovalScreen form={forms.grn} step={findStep(steps, 'grn')} />
      <BatchPlanningScreen
        form={forms.batch}
        step={findStep(steps, 'batch')}
        onPlannedQtyChange={value => onNumberChange('plannedQty', value)}
      />
      <BatchExecutionScreen
        form={forms.completion}
        step={findStep(steps, 'complete')}
        onActualQtyChange={value => onNumberChange('actualQty', value)}
        onRejectQtyChange={value => onNumberChange('rejectQty', value)}
      />
      <QcReleaseScreen
        form={forms.qc}
        step={findStep(steps, 'qc')}
        onAnalystChange={value => onTextChange('analyst', value)}
        onReviewerChange={value => onTextChange('reviewer', value)}
      />
      <DispatchScreen
        form={forms.dispatch}
        step={findStep(steps, 'dispatch')}
        onDispatchQtyChange={value => onNumberChange('dispatchQty', value)}
      />
      <FinanceScreen
        form={forms.finance}
        step={findStep(steps, 'payment')}
        onInvoiceTotalChange={value => onNumberChange('invoiceTotal', value)}
        onPaymentAmountChange={value => onNumberChange('paymentAmount', value)}
      />

      <div className="module-control">
        <div>
          <p className="eyebrow">Slice Controller</p>
          <h2>Run GRN to Payment</h2>
          <p>Runs all module services in sequence using the current form values.</p>
        </div>
        <button type="button" onClick={onRun} disabled={isRunning}>
          {isRunning ? 'Running...' : 'Run Modules'}
        </button>
        {errors.length > 0 && (
          <div className="error-box">
            {errors.map(error => <div key={error}>{error}</div>)}
          </div>
        )}
      </div>
    </section>
  );
}
