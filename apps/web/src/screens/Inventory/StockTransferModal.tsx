import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import { ArrowRightLeft } from 'lucide-react';
import { inventoryApi } from '../../lib/bosApi';

interface StockTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lotId: string;
  lotNo: string;
  lotType: 'RM' | 'FG';
  currentLocation: string;
}

export default function StockTransferModal({ isOpen, onClose, onSuccess, lotId, lotNo, lotType, currentLocation }: StockTransferModalProps) {
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [newLocationId, setNewLocationId] = useState('');

  useEffect(() => {
    if (isOpen) {
      inventoryApi.getStorageLocations().then(res => {
        if (res.data) setLocations(res.data);
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lotId || !newLocationId) return;

    setLoading(true);
    await inventoryApi.transferStock({
      lotId,
      lotType,
      newLocationId
    });
    
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transfer Stock Location">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Lot Number: <strong style={{ color: 'white' }}>{lotNo}</strong></p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Current Location: <strong style={{ color: 'white' }}>{currentLocation || 'Unassigned'}</strong></p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Destination Location</label>
          <select 
            required
            value={newLocationId}
            onChange={e => setNewLocationId(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#0F172A', color: 'white' }}
          >
            <option value="">Select new location...</option>
            {locations.filter(l => l.code !== currentLocation).map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowRightLeft size={16} />
            {loading ? 'Transferring...' : 'Confirm Transfer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
