import React, { useState, useEffect } from 'react';
import { Activity, Clock, Factory } from 'lucide-react';
import { productionApi } from '../../lib/bosApi';

export default function FloorMonitor() {
  const [batches, setBatches] = useState<any[]>([]);

  useEffect(() => {
    loadRunningBatches();
  }, []);

  const loadRunningBatches = async () => {
    // In a real app we'd fetch only status=RUNNING
    const res = await productionApi.getBatches();
    if (res.data) setBatches(res.data.filter((b:any) => b.status === 'RUNNING'));
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={24} color="var(--primary-accent)" /> Live Floor Monitor
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Real-time tracking of active production lines.</p>
        </div>
      </div>

      <div className="grid-2">
        {batches.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Factory size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p>No batches are currently running on the factory floor.</p>
          </div>
        ) : (
          batches.map(b => (
            <div key={b.id} className="card" style={{ border: '1px solid var(--primary-accent)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px' }}>{b.batch_no}</h3>
                <span className="badge" style={{ background: 'rgba(74, 222, 128, 0.2)', color: '#4ADE80' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#4ADE80', marginRight: '6px', animation: 'pulse 2s infinite' }}></span>
                  RUNNING
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Factory size={16} /> <strong>Product:</strong> {b.product}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} /> <strong>Started:</strong> {new Date().toLocaleTimeString()}
                </div>
              </div>

              <div style={{ marginTop: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Qty</div>
                  <div style={{ fontWeight: 'bold' }}>{b.planned_qty} LTR</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Operator</div>
                  <div style={{ fontWeight: 'bold' }}>{b.operator || 'Unassigned'}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
