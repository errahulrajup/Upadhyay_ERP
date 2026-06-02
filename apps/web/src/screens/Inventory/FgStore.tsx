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

  const handleStatusChange = async (lotId: string, newStatus: string) => {
    await inventoryApi.updateFgLotStatus(lotId, newStatus);
    loadLots();
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
              <th>COA</th>
              <th>Action</th>
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
                  <span className={`status-badge ${l.holding_status === 'RELEASED' ? 'status-approved' : l.holding_status === 'HOLD' || l.holding_status === 'QUARANTINE' ? 'status-rejected' : 'status-pending'}`}>
                    {l.holding_status || 'RELEASED'}
                  </span>
                </td>
                <td>{l.coa_issued ? <span style={{color: '#4ADE80'}}>Yes ({l.coa_no})</span> : <span style={{color: '#F87171'}}>No</span>}</td>
                <td>
                  <select 
                    value={l.holding_status || 'RELEASED'} 
                    onChange={(e) => handleStatusChange(l.id, e.target.value)}
                    style={{ padding: '6px', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--glass-border)' }}
                  >
                    <option value="INCUBATION">Incubation</option>
                    <option value="MATURATION">Maturation</option>
                    <option value="RELEASED">Released</option>
                    <option value="QUARANTINE">Quarantine</option>
                    <option value="HOLD">Hold</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
