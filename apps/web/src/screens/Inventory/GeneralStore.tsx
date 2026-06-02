import React from 'react';
import { Archive, Plus } from 'lucide-react';

export default function GeneralStore() {
  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>General Store</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Manage packaging materials and engineering spares.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add Item
        </button>
      </div>

      <div className="card">
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Archive size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3>No Items Yet</h3>
          <p style={{ marginTop: '8px', fontSize: '14px' }}>Add your first packaging material or spare part.</p>
        </div>
      </div>
    </div>
  );
}
