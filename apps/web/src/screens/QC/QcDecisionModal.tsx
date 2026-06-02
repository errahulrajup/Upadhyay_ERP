import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { Microscope, AlertTriangle } from 'lucide-react';
import { qcApi } from '../../lib/bosApi';

interface QcDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  batch: any;
  decision: 'PASS' | 'FAIL' | null;
}

export default function QcDecisionModal({ isOpen, onClose, onSuccess, batch, decision }: QcDecisionModalProps) {
  const [loading, setLoading] = useState(false);
  const [ph, setPh] = useState('');
  const [brix, setBrix] = useState('');
  const [remarks, setRemarks] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batch || !decision) return;
    
    setLoading(true);
    
    // We auto-generate the FG lot no if PASS
    const fgLotNo = decision === 'PASS' ? `FG-${batch.batch_no}` : null;
    
    await qcApi.submitBatchQc({
      batchId: batch.id,
      verdict: decision,
      readings: { ph: Number(ph), brix: Number(brix) },
      remarks,
      newFgLotNo: fgLotNo
    });
    
    setLoading(false);
    onSuccess();
    onClose();
  };

  if (!batch || !decision) return null;

  const isPass = decision === 'PASS';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`QC Decision: ${batch.batch_no}`}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ padding: '12px', borderRadius: '8px', background: isPass ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)', border: `1px solid ${isPass ? '#4ADE80' : '#F87171'}`, color: isPass ? '#4ADE80' : '#F87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isPass ? <Microscope size={20} /> : <AlertTriangle size={20} />}
          <strong>You are marking this batch as {decision}.</strong>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>pH Reading</label>
            <input 
              type="number" step="0.01" required
              value={ph} onChange={e => setPh(e.target.value)}
              placeholder="e.g. 3.5"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Brix (&#176;Bx)</label>
            <input 
              type="number" step="0.1" required
              value={brix} onChange={e => setBrix(e.target.value)}
              placeholder="e.g. 12.5"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Remarks / CAPA Details</label>
          <textarea 
            required={!isPass}
            value={remarks} onChange={e => setRemarks(e.target.value)}
            placeholder={isPass ? "Optional remarks..." : "Reason for rejection is required!"}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', minHeight: '80px' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading} style={{ background: isPass ? 'var(--success-color)' : '#DC2626' }}>
            {loading ? 'Submitting...' : `Confirm ${decision}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
