import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { financeApi } from '../../lib/bosApi';
import { DollarSign } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoice: any;
}

export default function RecordPaymentModal({ isOpen, onClose, onSuccess, invoice }: RecordPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('BANK');
  const [reference, setReference] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    
    setLoading(true);
    await financeApi.recordPayment({
      invoiceId: invoice.id,
      amount: Number(amount),
      mode,
      reference
    });
    setLoading(false);
    onSuccess();
    onClose();
  };

  if (!invoice) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Record Payment: ${invoice.invoice_no}`}>
      <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Customer: <strong style={{ color: 'white' }}>{invoice.customer}</strong></p>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Total Amount: <strong style={{ color: 'white' }}>₹{invoice.amount?.toLocaleString()}</strong></p>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Paid Amount: <strong style={{ color: '#4ADE80' }}>₹{invoice.paid_amount?.toLocaleString() || 0}</strong></p>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Outstanding: <strong style={{ color: '#F87171' }}>₹{(invoice.amount - (invoice.paid_amount || 0)).toLocaleString()}</strong></p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Payment Amount (₹)</label>
            <input 
              type="number" step="0.01" required
              max={invoice.amount - (invoice.paid_amount || 0)}
              value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 5000"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Payment Mode</label>
            <select 
              required
              value={mode} onChange={e => setMode(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#0F172A', color: 'white' }}
            >
              <option value="BANK">Bank Transfer</option>
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="CHEQUE">Cheque</option>
              <option value="NEFT">NEFT/RTGS</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Reference / Transaction ID</label>
          <input 
            type="text"
            value={reference} onChange={e => setReference(e.target.value)}
            placeholder="e.g. UTR123456789"
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={16} />
            {loading ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
