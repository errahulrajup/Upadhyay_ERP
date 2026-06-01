import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { Truck } from 'lucide-react';

interface NewDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewDispatchModal({ isOpen, onClose, onSuccess }: NewDispatchModalProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call to create dispatch
    await new Promise(r => setTimeout(r, 800));
    
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Dispatch">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Customer Name</label>
          <input 
            type="text" 
            required
            placeholder="e.g. Mega Store"
            style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid var(--glass-border)', 
              background: 'rgba(0,0,0,0.2)', 
              color: 'white' 
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Finished Good Lot</label>
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
            <option value="">Select FG Lot...</option>
            <option value="FG-400">FG-BAT-400 (Premium Apple Juice)</option>
            <option value="FG-401">FG-BAT-401 (Orange Concentrate)</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Dispatch Date</label>
          <input 
            type="date" 
            required
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
            <Truck size={16} />
            {loading ? 'Creating...' : 'Create Draft'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
