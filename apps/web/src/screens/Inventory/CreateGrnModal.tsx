import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { PackagePlus } from 'lucide-react';

interface CreateGrnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateGrnModal({ isOpen, onClose, onSuccess }: CreateGrnModalProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call to create GRN
    await new Promise(r => setTimeout(r, 800));
    
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Inward New Material (GRN)">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Supplier Name</label>
          <input 
            type="text" 
            required
            placeholder="e.g. Global Foods Inc."
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
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Ingredient Received</label>
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
            <option value="">Select Ingredient...</option>
            <option value="RM-01">Citric Acid</option>
            <option value="RM-02">Sugar</option>
            <option value="RM-03">Apple Concentrate</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Quantity (kg/L)</label>
            <input 
              type="number" 
              required
              min="1"
              placeholder="0.00"
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
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Expected Expiry Date</label>
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
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PackagePlus size={16} />
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
