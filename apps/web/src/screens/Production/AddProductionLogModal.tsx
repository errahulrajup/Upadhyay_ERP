import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { productionApi } from '../../lib/bosApi';
import { Save } from 'lucide-react';

interface AddProductionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddProductionLogModal({ isOpen, onClose, onSuccess }: AddProductionLogModalProps) {
  const [loading, setLoading] = useState(false);
  const [batchNo, setBatchNo] = useState('');
  const [workCenter, setWorkCenter] = useState('');
  const [readingType, setReadingType] = useState('TEMPERATURE');
  const [readingValue, setReadingValue] = useState('');
  const [remarks, setRemarks] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await productionApi.submitLog({
      batch_no: batchNo,
      work_center: workCenter,
      reading_type: readingType,
      reading_value: readingValue,
      remarks
    });
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Production Log">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Batch Number</label>
            <input 
              type="text" required
              value={batchNo} onChange={e => setBatchNo(e.target.value)}
              placeholder="e.g. BAT-405"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Work Center</label>
            <select 
              required
              value={workCenter} onChange={e => setWorkCenter(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#0F172A', color: 'white' }}
            >
              <option value="">Select Center...</option>
              <option value="LINE-01">Juice Blending Line</option>
              <option value="PACK-01">Aseptic Filling Line</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Reading Type</label>
            <select 
              required
              value={readingType} onChange={e => setReadingType(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#0F172A', color: 'white' }}
            >
              <option value="TEMPERATURE">Temperature</option>
              <option value="PRESSURE">Pressure</option>
              <option value="SPEED_RPM">Speed (RPM)</option>
              <option value="DOWNTIME_MINS">Downtime (Mins)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Value</label>
            <input 
              type="text" required
              value={readingValue} onChange={e => setReadingValue(e.target.value)}
              placeholder="e.g. 85 C"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Remarks</label>
          <textarea 
            rows={2}
            value={remarks} onChange={e => setRemarks(e.target.value)}
            placeholder="Any shift handover notes..."
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
