import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { rndApi } from '../../lib/bosApi';
import { Save } from 'lucide-react';

interface CreateTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTrialModal({ isOpen, onClose, onSuccess }: CreateTrialModalProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [objective, setObjective] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await rndApi.createDraftRecipe({
      name,
      author,
      objective,
      status: 'DRAFT'
    });
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New R&D Trial">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Experiment Name</label>
            <input 
              type="text" required
              value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Low Sugar Base V2"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Lead Scientist</label>
            <input 
              type="text" required
              value={author} onChange={e => setAuthor(e.target.value)}
              placeholder="e.g. Dr. Sharma"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Objective</label>
          <textarea 
            required
            rows={3}
            value={objective} onChange={e => setObjective(e.target.value)}
            placeholder="Goal of this formulation trial..."
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={16} />
            {loading ? 'Creating...' : 'Create Trial'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
