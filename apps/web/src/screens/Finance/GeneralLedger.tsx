import React, { useState, useEffect } from 'react';
import { BookOpen, DollarSign } from 'lucide-react';
import { financeApi } from '../../lib/bosApi';

export default function GeneralLedger() {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    loadLedger();
  }, []);

  const loadLedger = async () => {
    const res = await financeApi.getGeneralLedger();
    if (res.data) setEntries(res.data);
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={24} color="var(--primary-accent)" /> General Ledger
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Double-entry financial transaction log.</p>
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Ref Type</th>
              <th>Narration</th>
              <th>Debit (DR)</th>
              <th>Credit (CR)</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(gl => (
              <tr key={gl.id}>
                <td>{gl.transaction_date}</td>
                <td><span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{gl.reference_type}</span></td>
                <td>{gl.narration}</td>
                <td style={{ color: gl.debit > 0 ? '#4ADE80' : 'inherit' }}>
                  {gl.debit > 0 ? `₹${gl.debit.toLocaleString()}` : '-'}
                </td>
                <td style={{ color: gl.credit > 0 ? '#F87171' : 'inherit' }}>
                  {gl.credit > 0 ? `₹${gl.credit.toLocaleString()}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
