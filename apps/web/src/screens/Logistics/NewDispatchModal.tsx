import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { Truck } from 'lucide-react';
import { dispatchApi, inventoryApi } from '../../lib/bosApi';

interface NewDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewDispatchModal({ isOpen, onClose, onSuccess }: NewDispatchModalProps) {
  const [loading, setLoading] = useState(false);
  const [fgLots, setFgLots] = useState<any[]>([]);
  const [customer, setCustomer] = useState('');
  const [fgLotId, setFgLotId] = useState('');
  const [date, setDate] = useState('');
  
  React.useEffect(() => {
    if (isOpen) {
      inventoryApi.getFgLots().then(res => {
        if (res.data) setFgLots(res.data);
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // We assume qty is fixed for now or we could add a qty field
    await dispatchApi.createDispatch({
      customer,
      fgLotId,
      qty: 100 // placeholder qty for simplicity
    });
    
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
            value={customer}
            onChange={e => setCustomer(e.target.value)}
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
            value={fgLotId}
            onChange={e => setFgLotId(e.target.value)}
            style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid var(--glass-border)', 
              background: '#0F172A', 
              color: 'white' 
            }}
          >
            <option value="">Select FG Lot...</option>
            {fgLots.map(fg => (
              <option key={fg.id} value={fg.id}>{fg.lot_no} ({fg.qty} LTR available)</option>
            ))}
          </select>
          {fgLots.length === 0 && <span style={{fontSize: '12px', color: '#F87171'}}>No Approved FG Lots available in warehouse.</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Dispatch Date</label>
          <input 
            type="date" 
            required
            value={date}
            onChange={e => setDate(e.target.value)}
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
