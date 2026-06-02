import React, { useEffect, useState } from 'react';
import { complianceApi } from '../../lib/bosApi';
import { ShieldAlert, CheckCircle, FilePlus } from 'lucide-react';
import CreateCapaModal from './CreateCapaModal';

export default function RecallCapaTracker() {
  const [recalls, setRecalls] = useState<any[]>([]);
  const [capas, setCapas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCapaModalOpen, setIsCapaModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [rec, cap] = await Promise.all([
      complianceApi.getRecalls(),
      complianceApi.getCapa()
    ]);
    if (rec.data) setRecalls(rec.data);
    if (cap.data) setCapas(cap.data);
    setLoading(false);
  };

  const handleCloseCapa = async (capaId: string) => {
    await complianceApi.closeCapa(capaId);
    loadData();
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Recall & CAPA Tracker</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Manage product recalls and corrective actions linked to traceability.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={() => setIsCapaModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FilePlus size={18} /> Raise CAPA
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--danger-color)' }}>
            <ShieldAlert size={18} /> Initiate Recall
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
          
          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Active Recalls</h2>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: 'var(--glass-border)' }}>
                    <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Recall No</th>
                    <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Affected Lot (UUID Link)</th>
                    <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Severity</th>
                    <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recalls.map(r => (
                    <tr key={r.id} style={{ borderBottom: 'var(--glass-border)' }}>
                      <td style={{ padding: '16px', fontWeight: 600 }}>{r.recall_no}</td>
                      <td style={{ padding: '16px', color: 'var(--primary-accent)' }}>{r.affected_lot}</td>
                      <td style={{ padding: '16px' }}><span className="badge badge-danger">{r.severity}</span></td>
                      <td style={{ padding: '16px' }}><span className="badge badge-warning">{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Corrective & Preventive Actions (CAPA)</h2>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: 'var(--glass-border)' }}>
                    <th style={{ padding: '16px', color: 'var(--text-muted)' }}>CAPA No</th>
                    <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Source Deviation</th>
                    <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Owner</th>
                    <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {capas.map(c => (
                    <tr key={c.id} style={{ borderBottom: 'var(--glass-border)' }}>
                      <td style={{ padding: '16px', fontWeight: 600 }}>{c.capa_no}</td>
                      <td style={{ padding: '16px' }}>{c.source}</td>
                      <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{c.owner}</td>
                      <td style={{ padding: '16px' }}>
                        {c.status === 'OPEN' ? <span className="badge badge-warning">OPEN</span> : <span className="badge badge-success">CLOSED</span>}
                      </td>
                      <td style={{ padding: '16px' }}>
                        {c.status === 'OPEN' && (
                          <button onClick={() => handleCloseCapa(c.id)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--success-color)' }}>
                            <CheckCircle size={14} /> Close
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {isCapaModalOpen && (
        <CreateCapaModal
          isOpen={isCapaModalOpen}
          onClose={() => setIsCapaModalOpen(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
