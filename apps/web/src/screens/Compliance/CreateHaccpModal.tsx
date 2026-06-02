import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { complianceApi } from '../../lib/bosApi';
import { Save } from 'lucide-react';

interface CreateHaccpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateHaccpModal({ isOpen, onClose, onSuccess }: CreateHaccpModalProps) {
  const [loading, setLoading] = useState(false);
  const [controlPoint, setControlPoint] = useState('');
  const [status, setStatus] = useState('COMPLIANT');
  const [readingValue, setReadingValue] = useState('');
  const [remarks, setRemarks] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await complianceApi.createHaccpLog({
      control_point: controlPoint,
      status,
      reading_value: readingValue,
      remarks
    });
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log CCP Reading">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Control Point</label>
          <select 
            required
            value={controlPoint} onChange={e => setControlPoint(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#0F172A', color: 'white' }}
          >
            <option value="">Select CCP...</option>
            <option value="CCP-1: Pasteurization">CCP-1: Pasteurization (Temperature)</option>
            <option value="CCP-2: Metal Detection">CCP-2: Metal Detection</option>
            <option value="CCP-3: Chilling">CCP-3: Chilling (Temperature)</option>
            <option value="PRP-1: Water Quality">PRP-1: Water Quality</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Reading Value</label>
            <input 
              type="text" required
              value={readingValue} onChange={e => setReadingValue(e.target.value)}
              placeholder="e.g. 95 C"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Status</label>
            <select 
              required
              value={status} onChange={e => setStatus(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#0F172A', color: 'white' }}
            >
              <option value="COMPLIANT">Compliant</option>
              <option value="DEVIATION">Deviation</option>
              <option value="PENDING">Pending Action</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Remarks / Actions Taken</label>
          <textarea 
            rows={3}
            value={remarks} onChange={e => setRemarks(e.target.value)}
            placeholder="e.g. Temperature reached target, held for 15s"
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={16} />
            {loading ? 'Saving...' : 'Save Log'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
