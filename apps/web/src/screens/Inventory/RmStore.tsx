import React, { useState, useEffect } from 'react';
import { Package, MapPin, ArrowRightLeft } from 'lucide-react';
import { inventoryApi } from '../../lib/bosApi';

export default function RmStore() {
  const [lots, setLots] = useState<any[]>([]);

  useEffect(() => {
    loadLots();
  }, []);

  const loadLots = async () => {
    const res = await inventoryApi.getRmLots();
    if (res.data) setLots(res.data);
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Raw Material Store</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Manage RM lots and physical locations.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowRightLeft size={18} /> Transfer Stock
        </button>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Lot Number</th>
              <th>Material</th>
              <th>Quantity</th>
              <th>Location</th>
              <th>Expiry</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {lots.map(l => (
              <tr key={l.id}>
                <td><strong>{l.lot_no}</strong></td>
                <td>{l.ingredient}</td>
                <td>{l.qty} kg</td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <MapPin size={14} /> {l.location || 'Unassigned'}
                  </span>
                </td>
                <td>{l.expiry}</td>
                <td>
                  <span className={`status-badge ${l.status === 'APPROVED' ? 'status-approved' : 'status-quarantine'}`}>
                    {l.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
