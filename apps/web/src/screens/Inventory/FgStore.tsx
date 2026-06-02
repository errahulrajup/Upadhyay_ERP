import React, { useState, useEffect } from 'react';
import { Box, FileCheck, ArrowRightLeft } from 'lucide-react';
import { inventoryApi } from '../../lib/bosApi';

export default function FgStore() {
  const [lots, setLots] = useState<any[]>([]);

  useEffect(() => {
    loadLots();
  }, []);

  const loadLots = async () => {
    const res = await inventoryApi.getFgLots();
    if (res.data) setLots(res.data);
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Finished Goods Store</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Manage FG lots, holding statuses, and COAs.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck size={18} /> Issue COA
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowRightLeft size={18} /> Transfer
          </button>
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Lot Number</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Location</th>
              <th>Holding Status</th>
            </tr>
          </thead>
          <tbody>
            {lots.map(l => (
              <tr key={l.id}>
                <td><strong>{l.lot_no}</strong></td>
                <td>{l.product}</td>
                <td>{l.qty} kg</td>
                <td>{l.location || 'Unassigned'}</td>
                <td>
                  <span className={`status-badge ${l.holding_status === 'RELEASED' ? 'status-approved' : 'status-quarantine'}`}>
                    {l.holding_status}
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
