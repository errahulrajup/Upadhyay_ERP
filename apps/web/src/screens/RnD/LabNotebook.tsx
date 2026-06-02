import React from 'react';
import { BookOpen, Plus } from 'lucide-react';

export default function LabNotebook() {
  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Lab Notebook</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Scientist logs and experimental formulations.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> New Entry
        </button>
      </div>

      <div className="card">
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3>No Experiments Logged</h3>
          <p style={{ marginTop: '8px', fontSize: '14px' }}>Create a new notebook entry to track your R&D trials.</p>
        </div>
      </div>
    </div>
  );
}
