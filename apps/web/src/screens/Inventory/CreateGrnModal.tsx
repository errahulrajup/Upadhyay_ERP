import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import { PackagePlus } from 'lucide-react';
import { inventoryApi } from '../../lib/bosApi';

interface CreateGrnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateGrnModal({ isOpen, onClose, onSuccess }: CreateGrnModalProps) {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  
  const [supplierId, setSupplierId] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [qty, setQty] = useState('');
  const [expectedExpiry, setExpectedExpiry] = useState('');
  
  // New Audit Fix Fields
  const [gstPercentage, setGstPercentage] = useState('0');
  const [vehicleNo, setVehicleNo] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadMasterData();
    }
  }, [isOpen]);

  const loadMasterData = async () => {
    const [supRes, matRes] = await Promise.all([
      inventoryApi.getSuppliers(),
      inventoryApi.getMaterials()
    ]);
    if (supRes.data) setSuppliers(supRes.data);
    if (matRes.data) setMaterials(matRes.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    await inventoryApi.createGrn({
      supplierId,
      materialId,
      qty: Number(qty),
      expectedExpiry,
      gstPercentage: Number(gstPercentage),
      vehicleNo,
      invoiceNo
    });
    
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Inward New Material (GRN)">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Supplier Name</label>
          <select 
            required
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid var(--glass-border)', 
              background: '#0F172A', 
              color: 'white' 
            }}
          >
            <option value="">Select Supplier...</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {suppliers.length === 0 && <span style={{fontSize: '12px', color: '#F87171'}}>No suppliers found. Add one in Settings.</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Ingredient Received</label>
          <select 
            required
            value={materialId}
            onChange={(e) => setMaterialId(e.target.value)}
            style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid var(--glass-border)', 
              background: '#0F172A', 
              color: 'white' 
            }}
          >
            <option value="">Select Ingredient...</option>
            {materials.map(m => (
              <option key={m.id} value={m.id}>{m.code} - {m.name}</option>
            ))}
          </select>
          {materials.length === 0 && <span style={{fontSize: '12px', color: '#F87171'}}>No materials found. Add one in Settings.</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Quantity (kg/L)</label>
            <input 
              type="number" 
              required
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="0.00"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Expected Expiry Date</label>
            <input 
              type="date" 
              required
              value={expectedExpiry}
              onChange={(e) => setExpectedExpiry(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>GST (%)</label>
            <input 
              type="number" 
              required
              min="0"
              max="100"
              value={gstPercentage}
              onChange={(e) => setGstPercentage(e.target.value)}
              placeholder="18"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Invoice Number</label>
            <input 
              type="text" 
              required
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              placeholder="INV-XXXX"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Vehicle / LR No</label>
            <input 
              type="text" 
              required
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value)}
              placeholder="MP-09-XX-XXXX"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
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
