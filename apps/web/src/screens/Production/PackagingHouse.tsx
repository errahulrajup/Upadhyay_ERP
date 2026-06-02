import React, { useState, useEffect } from 'react';
import { PackageSearch, Play } from 'lucide-react';
import { productionApi, inventoryApi } from '../../lib/bosApi';
import Modal from '../../components/ui/Modal';
import { supabase } from '../../lib/supabase';

export default function PackagingHouse() {
  const [fgLots, setFgLots] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<any>(null);

  useEffect(() => {
    loadFgLots();
  }, []);

  const loadFgLots = async () => {
    const { data } = await inventoryApi.getFgLots();
    if (data) setFgLots(data.filter((l: any) => l.holding_status === 'RELEASED' || l.holding_status === 'INCUBATION'));
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Packaging House</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Convert bulk Finished Goods lots into consumer SKUs.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Play size={18} /> Start Packaging Run
        </button>
      </div>

      {fgLots.length === 0 ? (
        <div className="card">
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <PackageSearch size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3>No FG Lots Available</h3>
            <p style={{ marginTop: '8px', fontSize: '14px' }}>Complete a production batch and QC-release a Finished Goods lot first.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>FG Lot No</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {fgLots.map(lot => (
                <tr key={lot.id}>
                  <td><strong>{lot.lot_no}</strong></td>
                  <td>{lot.qty} kg</td>
                  <td><span className="badge badge-success">{lot.holding_status}</span></td>
                  <td>
                    <button onClick={() => { setSelectedLot(lot); setIsModalOpen(true); }} className="btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                      Start Run
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <StartPackagingModal
        isOpen={isModalOpen}
        lot={selectedLot}
        onClose={() => { setIsModalOpen(false); setSelectedLot(null); }}
        onSuccess={loadFgLots}
      />
    </div>
  );
}

function StartPackagingModal({ isOpen, lot, onClose, onSuccess }: any) {
  const [packs, setPacks] = useState('');
  const [consumed, setConsumed] = useState('');
  const [workCenters, setWorkCenters] = useState<any[]>([]);
  const [wcId, setWcId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('storage_locations').select('*').then(({ data }) => {
      if (data) setWorkCenters(data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lot) return;
    setLoading(true);
    const { error } = await productionApi.executePackagingRun({
      bulkLotId: lot.id,
      consumedQty: Number(consumed),
      packsProduced: Number(packs),
      workCenterId: wcId,
      newLotNo: `PKG-${lot.lot_no}-${Date.now().toString().slice(-4)}`,
      productId: lot.product_id || lot.id
    });
    setLoading(false);
    if (error) alert(`Error: ${error.message}`);
    else { onSuccess(); onClose(); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start Packaging Run">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Bulk Lot: <strong style={{ color: 'white' }}>{lot?.lot_no}</strong> | Available: {lot?.qty} kg
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Qty Consumed (kg)</label>
            <input type="number" required value={consumed} onChange={e => setConsumed(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Packs Produced</label>
            <input type="number" required value={packs} onChange={e => setPacks(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processing...' : 'Run Packaging'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
