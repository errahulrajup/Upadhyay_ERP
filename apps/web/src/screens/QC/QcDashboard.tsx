import React, { useEffect, useState } from 'react';
import { qcApi } from '../../lib/bosApi';
import { ClipboardCheck, Search } from 'lucide-react';

export default function QcDashboard() {
  const [pendingFg, setPendingFg] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQc();
  }, []);

  const loadQc = async () => {
    setLoading(true);
    const { data } = await qcApi.getPendingQc();
    if (data) setPendingFg(data);
    setLoading(false);
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Quality Control & Release</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Test parameters and issue CoA for finished goods.</p>
        </div>
      </div>

      {loading ? (
        <p>Loading Pending QC...</p>
      ) : (
        <div className="grid-2">
          {pendingFg.map(fg => (
            <div key={fg.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--warning-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ fontSize: '18px', color: 'var(--text-main)' }}>{fg.lot_no}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--primary-accent)', fontWeight: 'bold' }}>{fg.product}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Quantity: {fg.qty} kg</p>
                </div>
                <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Search size={14} /> Pending Lab Test
                </span>
              </div>
              
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: 'var(--glass-border)' }}>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', background: 'var(--success-color)', display: 'flex', justifyContent: 'center', gap: '8px' }}
                >
                  <ClipboardCheck size={16} /> Record Results & Issue CoA
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
