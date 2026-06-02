import React, { useEffect, useState } from 'react';
import { productionApi } from '../../lib/bosApi';
import { supabase } from '../../lib/supabase';
import { Beaker, Play, CheckCircle } from 'lucide-react';
import PlanBatchModal from './PlanBatchModal';

export default function BatchDashboard() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    setLoading(true);
    const { data } = await productionApi.getBatches();
    if (data) setBatches(data);
    setLoading(false);
  };

  const handleStart = async (batchId: string) => {
    const { error } = await supabase.from('batches').update({ status: 'RUNNING' }).eq('id', batchId);
    if (!error) await loadBatches();
    else alert('Failed to start batch.');
  };

  const handleComplete = async (batch: any) => {
    setCompleting(batch.id);
    // Simulate consuming lots and generating FG lot
    const { error } = await productionApi.completeBatch(batch.id, batch.expected_yield);
    if (!error) {
      await loadBatches();
    } else {
      alert("Failed to complete batch.");
    }
    setCompleting(null);
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Batch Execution</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Plan, run, and complete production batches.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Beaker size={18} /> Plan Batch
        </button>
      </div>

      <PlanBatchModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => loadBatches()} 
      />

      {loading ? (
        <p>Loading Batches...</p>
      ) : (
        <div className="grid-2">
          {batches.map(batch => (
            <div key={batch.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: batch.status === 'RUNNING' ? '2px solid var(--primary-accent)' : '' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ fontSize: '18px', color: 'var(--text-main)' }}>{batch.batch_no}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--primary-accent)', fontWeight: 'bold' }}>{batch.recipe}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Target: {batch.expected_yield} kg</p>
                </div>
                {batch.status === 'RUNNING' ? (
                  <span className="badge" style={{ background: 'var(--primary-accent-glow)', color: 'var(--primary-accent)' }}>
                    Running
                  </span>
                ) : (
                  <span className="badge badge-warning">Planned</span>
                )}
              </div>
              
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: 'var(--glass-border)', display: 'flex', gap: '12px' }}>
                {batch.status === 'PLANNED' && (
                  <button onClick={() => handleStart(batch.id)} className="btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <Play size={16} /> Start Batch
                  </button>
                )}
                {batch.status === 'RUNNING' && (
                  <button 
                    className="btn-primary" 
                    onClick={() => handleComplete(batch)}
                    disabled={completing === batch.id}
                    style={{ flex: 1, background: 'var(--success-color)', display: 'flex', justifyContent: 'center', gap: '8px' }}
                  >
                    <CheckCircle size={16} /> 
                    {completing === batch.id ? 'Executing RPC...' : 'Complete & Gen FG Lot'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
