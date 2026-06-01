import React, { useEffect, useState } from 'react';
import { inventoryApi } from '../../lib/bosApi';
import { Layers, AlertTriangle } from 'lucide-react';

export default function RmLotsView() {
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLots();
  }, []);

  const loadLots = async () => {
    setLoading(true);
    const { data } = await inventoryApi.getRmLots();
    if (data) setLots(data);
    setLoading(false);
  };

  return (
    <div className="animate-in">
      <div style={{ marginBottom: '24px' }}>
        <h1>Raw Material Lots</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Active inventory tracking and expiry monitoring.</p>
      </div>

      {loading ? (
        <p>Loading Lots...</p>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: 'var(--glass-border)' }}>
                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Lot Number</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Ingredient</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Qty Remaining</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Expiry Date</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {lots.map(lot => (
                <tr key={lot.id} style={{ borderBottom: 'var(--glass-border)' }}>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{lot.lot_no}</td>
                  <td style={{ padding: '16px' }}>{lot.ingredient}</td>
                  <td style={{ padding: '16px', color: 'var(--primary-accent)', fontWeight: 'bold' }}>{lot.qty} kg</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {lot.expiry}
                      {new Date(lot.expiry) < new Date('2026-12-31') && <AlertTriangle size={14} color="var(--warning-color)" />}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span className={`badge ${lot.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>
                      {lot.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
