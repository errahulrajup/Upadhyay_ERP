import React, { useState, useEffect } from 'react';
import { Map, Plus, MapPin, Layers, X } from 'lucide-react';
import { inventoryApi } from '../../lib/bosApi';
import { supabase } from '../../lib/supabase';

export default function StorageLocations() {
  const [locations, setLocations] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('AMBIENT');

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    const res = await inventoryApi.getStorageLocations();
    if (res.data) setLocations(res.data);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('storage_locations').insert([{ code, name, type, capacity_kg: 10000 }]);
    setIsModalOpen(false);
    setName(''); setCode(''); setType('AMBIENT');
    loadLocations();
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Storage Locations</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Manage physical warehouse zones and capacities.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2>Add Storage Location</h2>
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input required placeholder="Location Code (e.g. AMB-02)" value={code} onChange={e => setCode(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              <input required placeholder="Location Name" value={name} onChange={e => setName(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              <select value={type} onChange={e => setType(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#0F172A', color: 'white' }}>
                <option value="AMBIENT">Ambient</option>
                <option value="COLD_ROOM">Cold Room</option>
                <option value="FG_BAY">FG Bay</option>
              </select>
              <button type="submit" className="btn-primary">Add Location</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
