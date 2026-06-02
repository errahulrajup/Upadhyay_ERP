import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { complianceApi } from '../../lib/bosApi';
import { Save } from 'lucide-react';

interface CreateCapaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCapaModal({ isOpen, onClose, onSuccess }: CreateCapaModalProps) {
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('CCP Deviation');
  const [owner, setOwner] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await complianceApi.createCapa({
      source,
      owner,
      description,
      status: 'OPEN'
    });
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Raise New CAPA">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Issue Source</label>
            <select 
              required
              value={source} onChange={e => setSource(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#0F172A', color: 'white' }}
            >
              <option value="CCP Deviation">CCP Deviation</option>
              <option value="Audit Finding">Audit Finding</option>
              <option value="Customer Complaint">Customer Complaint</option>
              <option value="Internal QC Rejection">Internal QC Rejection</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Assigned Owner</label>
            <input 
              type="text" required
              value={owner} onChange={e => setOwner(e.target.value)}
              placeholder="e.g. QA Manager"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Problem Description</label>
          <textarea 
            required
            rows={4}
            value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Detail the root cause and non-conformance..."
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={16} />
            {loading ? 'Submitting...' : 'Raise CAPA'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
