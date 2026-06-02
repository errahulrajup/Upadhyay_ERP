import React, { useState, useEffect } from 'react';
import { FileText, ArrowDownRight, ArrowUpRight, Plus, X } from 'lucide-react';
import { financeApi, inventoryApi, dispatchApi } from '../../lib/bosApi';
import { supabase } from '../../lib/supabase';

export default function Invoicing() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState<'SALES' | 'PURCHASE'>('SALES');
  const [entityId, setEntityId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dispatchId, setDispatchId] = useState('');
  const [grnId, setGrnId] = useState('');
  const [loading, setLoading] = useState(false);

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [grns, setGrns] = useState<any[]>([]);

  useEffect(() => {
    loadInvoices();
    loadDropdowns();
  }, []);

  const loadInvoices = async () => {
    const res = await financeApi.getInvoices();
    if (res.data) setInvoices(res.data);
  };

  const loadDropdowns = async () => {
    const { data: sups } = await inventoryApi.getSuppliers();
    if (sups) setSuppliers(sups);

    const { data: dsps } = await dispatchApi.getDispatches();
    if (dsps) setDispatches(dsps);

    const { data: gList } = await inventoryApi.getGrnList();
    if (gList) setGrns(gList);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await financeApi.createInvoice({
      type,
      entityId: entityId || '00000000-0000-0000-0000-000000000000',
      amount: Number(amount) || 0,
      dueDate,
      dispatchId: type === 'SALES' ? dispatchId : undefined,
      grnId: type === 'PURCHASE' ? grnId : undefined
    });
    setLoading(false);
    if (error) {
      alert(`Error creating invoice: ${error.message}`);
    } else {
      setIsModalOpen(false);
      setAmount('');
      setDueDate('');
      setEntityId('');
      setDispatchId('');
      setGrnId('');
      loadInvoices();
    }
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
        <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Create Invoice
        </button>
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
                  <button 
                    className="btn-secondary" 
                    onClick={() => {
                      alert(`Invoice Number: ${inv.invoice_number}\nType: ${inv.type}\nAmount: ₹${inv.total_amount?.toLocaleString()}\nDue Date: ${inv.due_date}\nStatus: ${inv.status}\nCreated: ${new Date(inv.created_at).toLocaleDateString()}`);
                    }}
                    style={{ padding: '4px 8px' }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2>Create Invoice</h2>
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Invoice Type</label>
                  <select value={type} onChange={e => setType(e.target.value as any)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#0F172A', color: 'white' }}>
                    <option value="SALES">Sales (AR)</option>
                    <option value="PURCHASE">Purchase (AP)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Due Date</label>
                  <input type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Amount (INR)</label>
                  <input type="number" required placeholder="e.g. 50000" value={amount} onChange={e => setAmount(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    {type === 'SALES' ? 'Customer/Entity' : 'Supplier'}
                  </label>
                  {type === 'PURCHASE' ? (
                    <select required value={entityId} onChange={e => setEntityId(e.target.value)}
                      style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#0F172A', color: 'white' }}>
                      <option value="">Select Supplier</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  ) : (
                    <input required placeholder="Customer UUID / Name" value={entityId} onChange={e => setEntityId(e.target.value)}
                      style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                  )}
                </div>
              </div>

              {type === 'SALES' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Associated Dispatch (Optional)</label>
                  <select value={dispatchId} onChange={e => setDispatchId(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#0F172A', color: 'white' }}>
                    <option value="">None</option>
                    {dispatches.map(d => <option key={d.id} value={d.id}>{d.dispatch_no} ({d.customer})</option>)}
                  </select>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Associated GRN (Optional)</label>
                  <select value={grnId} onChange={e => setGrnId(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#0F172A', color: 'white' }}>
                    <option value="">None</option>
                    {grns.map(g => <option key={g.id} value={g.id}>GRN #{g.grn_no || g.id.slice(0,6)}</option>)}
                  </select>
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Invoice'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
