import React, { useState, useEffect } from 'react';
import { Wrench, Settings } from 'lucide-react';
import { productionApi } from '../../lib/bosApi';

export default function Equipment() {
  const [equipment, setEquipment] = useState<any[]>([]);

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    const res = await productionApi.getEquipment();
    if (res.data) setEquipment(res.data);
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Equipment & Machinery</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Manage factory assets and maintenance schedules.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={18} /> Add Equipment
        </button>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Equipment Code</th>
              <th>Name</th>
              <th>Type</th>
              <th>Last Maintenance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map(eq => (
              <tr key={eq.id}>
                <td><strong>{eq.code}</strong></td>
                <td>{eq.name}</td>
                <td>{eq.type}</td>
                <td>{eq.last_maintenance_date || eq.next_maintenance_date || 'N/A'}</td>
                <td>
                  <span className={`status-badge ${eq.status === 'OPERATIONAL' ? 'status-approved' : 'status-quarantine'}`}>
                    {eq.status}
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
