import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { inventoryApi } from '../../lib/bosApi';
import { Save } from 'lucide-react';

interface AddGeneralItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddGeneralItemModal({ isOpen, onClose, onSuccess }: AddGeneralItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('PACKAGING');
  const [qty, setQty] = useState('');
  const [uom, setUom] = useState('pcs');
  const [location, setLocation] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await inventoryApi.addGeneralItem({
      name,
      category,
      qty: Number(qty) || 0,
      uom,
      location,
      min_stock_level: 10
    });
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add General Store Item">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Item Name</label>
            <input 
              type="text" required
              value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Cardboard Box"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Category</label>
            <select 
              required
              value={category} onChange={e => setCategory(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#0F172A', color: 'white' }}
            >
              <option value="PACKAGING">Packaging</option>
              <option value="SPARES">Spares</option>
              <option value="CONSUMABLES">Consumables</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Quantity</label>
            <input 
              type="number" required
              value={qty} onChange={e => setQty(e.target.value)}
              placeholder="e.g. 500"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>UOM</label>
            <input 
              type="text" required
              value={uom} onChange={e => setUom(e.target.value)}
              placeholder="e.g. pcs"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Location (Optional)</label>
          <input 
            type="text"
            value={location} onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Shelf A1"
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={16} />
            {loading ? 'Saving...' : 'Add Item'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
