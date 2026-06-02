import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { Scale } from 'lucide-react';
import { inventoryApi } from '../../lib/bosApi';

interface StockAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lotId: string;
  lotNo: string;
  lotType: 'RM' | 'FG';
  currentQty: number;
}

export default function StockAuditModal({ isOpen, onClose, onSuccess, lotId, lotNo, lotType, currentQty }: StockAuditModalProps) {
  const [loading, setLoading] = useState(false);
  const [newQty, setNewQty] = useState<string>(currentQty.toString());
  const [reason, setReason] = useState('SHRINKAGE');
  const [remarks, setRemarks] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lotId) return;

    setLoading(true);
    await inventoryApi.adjustStock({
      lotId,
      lotType,
      oldQty: currentQty,
      newQty: Number(newQty),
      reason,
      remarks
    });
    
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Stock Reconciliation (Audit)">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Lot Number</p>
            <strong style={{ color: 'white' }}>{lotNo}</strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>System Qty</p>
            <strong style={{ color: 'var(--primary-accent)' }}>{currentQty} kg</strong>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Physical Quantity (kg)</label>
            <input 
              type="number" step="0.01" required
              value={newQty} onChange={e => setNewQty(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Reason Code</label>
            <select 
              required
              value={reason} onChange={e => setReason(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#0F172A', color: 'white' }}
            >
              <option value="SHRINKAGE">Shrinkage / Moisture Loss</option>
              <option value="DAMAGED">Damaged / Spoilage</option>
              <option value="COUNT_ERROR">Counting Error (Correction)</option>
              <option value="EXPIRED">Expired</option>
              <option value="SAMPLE">QA Sample Taken</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Remarks (Mandatory)</label>
          <input 
            type="text" required
            placeholder="e.g. Adjusted after EOM audit"
            value={remarks} onChange={e => setRemarks(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scale size={16} />
            {loading ? 'Adjusting...' : 'Confirm Update'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
