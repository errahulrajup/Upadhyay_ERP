import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import { hrApi } from '../../lib/bosApi';
import { Save } from 'lucide-react';

interface RunPayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RunPayrollModal({ isOpen, onClose, onSuccess }: RunPayrollModalProps) {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [payPeriod, setPayPeriod] = useState(new Date().toISOString().slice(0,7)); // YYYY-MM
  const [allowances, setAllowances] = useState('0');
  const [deductions, setDeductions] = useState('0');

  useEffect(() => {
    hrApi.getEmployees().then(res => {
      if (res.data) setEmployees(res.data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setLoading(true);
    
    // Find base pay
    const emp = employees.find(e => e.id === selectedEmp);
    const basePay = emp?.base_salary || 0;

    await hrApi.processPayroll({
      employeeId: selectedEmp,
      payPeriod,
      basePay,
      allowances: Number(allowances),
      deductions: Number(deductions)
    });
    
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Run Payroll">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Employee</label>
            <select 
              required
              value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#0F172A', color: 'white' }}
            >
              <option value="">Select Employee...</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.employee_code} - {e.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Pay Period</label>
            <input 
              type="month" required
              value={payPeriod} onChange={e => setPayPeriod(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Allowances (₹)</label>
            <input 
              type="number" required
              value={allowances} onChange={e => setAllowances(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Deductions (₹)</label>
            <input 
              type="number" required
              value={deductions} onChange={e => setDeductions(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={16} />
            {loading ? 'Processing...' : 'Generate Slip'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
