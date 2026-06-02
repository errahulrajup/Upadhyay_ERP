import React, { useState, useEffect } from 'react';
import { Microscope, CheckCircle, XCircle } from 'lucide-react';
import { qcApi } from '../../lib/bosApi';
import QcDecisionModal from './QcDecisionModal';

export default function BatchQc() {
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [decision, setDecision] = useState<'PASS' | 'FAIL' | null>(null);

  useEffect(() => {
    loadHoldBatches();
  }, []);

  const loadHoldBatches = async () => {
    const res = await qcApi.getPendingQc();
    if (res.data) setBatches(res.data);
  };

  const handleDecision = (batch: any, type: 'PASS' | 'FAIL') => {
    setSelectedBatch(batch);
    setDecision(type);
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Microscope size={24} color="var(--primary-accent)" /> In-Process Batch QC
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Analyze batches awaiting quality clearance.</p>
        </div>
      </div>

      <div className="grid-2">
        {batches.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <CheckCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} color="#4ADE80" />
            <p>No batches are currently on QC Hold. All clear!</p>
          </div>
        ) : (
          batches.map(b => (
            <div key={b.id} className="card" style={{ borderLeft: '4px solid #EAB308' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px' }}>{b.batch_no}</h3>
                <span className="badge badge-warning">QC_HOLD</span>
              </div>
              
              <div style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
                <p><strong>Batch No:</strong> {b.batch_no}</p>
                <p><strong>Target Qty:</strong> {b.expected_yield} kg</p>
              </div>

              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                <button 
                  className="btn-primary" 
                  onClick={() => handleDecision(b, 'PASS')}
                  style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ADE80', border: '1px solid #4ADE80' }}
                >
                  <CheckCircle size={16} /> PASS
                </button>
                <button 
                  className="btn-primary" 
                  onClick={() => handleDecision(b, 'FAIL')}
                  style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px', background: 'rgba(248, 113, 113, 0.1)', color: '#F87171', border: '1px solid #F87171' }}
                >
                  <XCircle size={16} /> FAIL
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <QcDecisionModal 
        isOpen={!!decision}
        onClose={() => setDecision(null)}
        onSuccess={loadHoldBatches}
        batch={selectedBatch}
        decision={decision}
      />
    </div>
  );
}
