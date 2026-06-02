import React, { useState, useEffect } from 'react';
import { IndianRupee, Settings } from 'lucide-react';
import { hrApi } from '../../lib/bosApi';

export default function PayrollDashboard() {
  const [payrolls, setPayrolls] = useState<any[]>([]);

  useEffect(() => {
    loadPayroll();
  }, []);

  const loadPayroll = async () => {
    const res = await hrApi.getPayrollRecords();
    if (res.data) setPayrolls(res.data);
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IndianRupee size={24} color="var(--primary-accent)" /> Payroll Processing
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Generate and manage monthly salary slips.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={18} /> Run Payroll Batch
        </button>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Emp ID</th>
              <th>Base Pay</th>
              <th>Net Pay</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map(pay => (
              <tr key={pay.id}>
                <td>{pay.pay_period}</td>
                <td><strong>{pay.employee_id}</strong></td>
                <td>₹{pay.base_pay?.toLocaleString()}</td>
                <td style={{ color: '#4ADE80', fontWeight: 'bold' }}>₹{pay.net_pay?.toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${pay.status === 'PAID' ? 'status-approved' : 'status-quarantine'}`}>
                    {pay.status}
                  </span>
                </td>
                <td>
                  <button className="btn-secondary" style={{ padding: '4px 8px' }}>View Slip</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
