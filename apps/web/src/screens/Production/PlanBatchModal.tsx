import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { Beaker } from 'lucide-react';

interface PlanBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PlanBatchModal({ isOpen, onClose, onSuccess }: PlanBatchModalProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call to create batch
    await new Promise(r => setTimeout(r, 800));
    
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Plan Production Batch">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Master Recipe</label>
          <select 
            required
            style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid var(--glass-border)', 
              background: '#0F172A', 
              color: 'white' 
            }}
          >
            <option value="">Select Recipe...</option>
            <option value="R-01">Premium Apple Juice (v2)</option>
            <option value="R-02">Orange Concentrate (v1)</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Target Yield (kg/L)</label>
          <input 
            type="number" 
            required
            min="10"
            placeholder="e.g. 1000"
            style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid var(--glass-border)', 
              background: 'rgba(0,0,0,0.2)', 
              color: 'white' 
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Beaker size={16} />
            {loading ? 'Planning...' : 'Plan Batch'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
