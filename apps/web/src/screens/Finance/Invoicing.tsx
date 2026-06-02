import React, { useState, useEffect } from 'react';
import { FileText, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { financeApi } from '../../lib/bosApi';

export default function Invoicing() {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    const res = await financeApi.getInvoices();
    if (res.data) setInvoices(res.data);
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={24} color="var(--primary-accent)" /> Invoicing (AR/AP)
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Manage Accounts Receivable (Sales) and Accounts Payable (Purchases).</p>
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Invoice Number</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td>
                  {inv.type === 'SALES' ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4ADE80' }}><ArrowUpRight size={16} /> Sales (AR)</span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F87171' }}><ArrowDownRight size={16} /> Purchase (AP)</span>
                  )}
                </td>
                <td><strong>{inv.invoice_number}</strong></td>
                <td>{inv.due_date}</td>
                <td>₹{inv.total_amount?.toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${inv.status === 'PAID' ? 'status-approved' : 'status-quarantine'}`}>
                    {inv.status}
                  </span>
                </td>
                <td>
                  <button className="btn-secondary" style={{ padding: '4px 8px' }}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
