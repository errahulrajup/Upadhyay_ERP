import React, { useState, useEffect } from 'react';
import { Layers, Plus } from 'lucide-react';
import { productionApi } from '../../lib/bosApi';

export default function WorkCenters() {
  const [centers, setCenters] = useState<any[]>([]);

  useEffect(() => {
    loadCenters();
  }, []);

  const loadCenters = async () => {
    const res = await productionApi.getWorkCenters();
    if (res.data) setCenters(res.data);
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Work Centers</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Manage production lines and capacities.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> New Work Center
        </button>
      </div>

      <div className="grid-3">
        {centers.map(wc => (
          <div key={wc.id} className="card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', marginBottom: '12px' }}>
              <Layers size={18} color="var(--primary-accent)" /> {wc.name}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Code: {wc.code}</p>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Capacity: {wc.capacity_per_hour} units/hr</p>
            <div style={{ marginTop: '16px' }}>
              <span className="status-badge status-approved">{wc.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
