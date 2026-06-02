import React from 'react';
import { PackageSearch, Play } from 'lucide-react';

export default function PackagingHouse() {
  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Packaging House</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Convert bulk Finished Goods lots into consumer SKUs.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Play size={18} /> Start Packaging Run
        </button>
      </div>

      <div className="card">
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <PackageSearch size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3>No Active Packaging Runs</h3>
          <p style={{ marginTop: '8px', fontSize: '14px' }}>Select a bulk lot to begin converting it into smaller packs.</p>
        </div>
      </div>
    </div>
  );
}
