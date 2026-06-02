import React, { useState, useEffect } from 'react';
import { Map, Plus, MapPin, Layers } from 'lucide-react';
import { inventoryApi } from '../../lib/bosApi';

export default function StorageLocations() {
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    const res = await inventoryApi.getStorageLocations();
    if (res.data) setLocations(res.data);
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Storage Locations</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Manage physical warehouse zones and capacities.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> New Location
        </button>
      </div>

      <div className="grid-3">
        {locations.map(loc => (
          <div key={loc.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} color="var(--primary-accent)" /> {loc.name}
                </h3>
                <code style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px', marginTop: '6px', display: 'inline-block' }}>
                  {loc.code}
                </code>
              </div>
              <span className={`status-badge ${loc.type === 'COLD_ROOM' ? 'status-quarantine' : 'status-approved'}`}>
                {loc.type}
              </span>
            </div>
            
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>
              <Layers size={16} />
              <span>Capacity: {loc.capacity_kg ? `${loc.capacity_kg.toLocaleString()} KG` : 'Unlimited'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
