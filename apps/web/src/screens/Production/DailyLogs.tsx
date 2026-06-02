import React from 'react';
import { ClipboardList, Plus } from 'lucide-react';

export default function DailyLogs() {
  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Daily Production Logs</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Shift supervisor reports and downtime tracking.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Log Shift Report
        </button>
      </div>

      <div className="card">
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <ClipboardList size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3>No Logs Found</h3>
          <p style={{ marginTop: '8px', fontSize: '14px' }}>No production shift logs have been recorded yet.</p>
        </div>
      </div>
    </div>
  );
}
