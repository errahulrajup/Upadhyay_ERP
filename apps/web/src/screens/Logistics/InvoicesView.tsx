import React, { useEffect, useState } from 'react';
import { financeApi } from '../../lib/bosApi';
import { DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';

export default function InvoicesView() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    const { data } = await financeApi.getInvoices();
    if (data) setInvoices(data);
    setLoading(false);
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Invoices & Finance</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Track accounts receivable and payments.</p>
        </div>
      </div>

      {loading ? (
        <p>Loading Invoices...</p>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: 'var(--glass-border)' }}>
                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Invoice No</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Customer</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Amount</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Date</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: 'var(--glass-border)' }}>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{inv.invoice_no}</td>
                  <td style={{ padding: '16px' }}>{inv.customer}</td>
                  <td style={{ padding: '16px', color: 'var(--primary-accent)', fontWeight: 'bold' }}>
                    ${inv.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{inv.date}</td>
                  <td style={{ padding: '16px' }}>
                    {inv.status === 'PAID' ? (
                      <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                        <CheckCircle size={14} /> PAID
                      </span>
                    ) : (
                      <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                        <AlertTriangle size={14} /> UNPAID
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>
                    {inv.status === 'UNPAID' && (
                      <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        Post Payment
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
