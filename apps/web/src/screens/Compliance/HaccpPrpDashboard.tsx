import React, { useEffect, useState } from 'react';
import { complianceApi } from '../../lib/bosApi';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import CreateHaccpModal from './CreateHaccpModal';

export default function HaccpPrpDashboard() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    const { data } = await complianceApi.getHaccpRecords();
    if (data) setRecords(data);
    setLoading(false);
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>HACCP & PRP Logs</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Monitor Critical Control Points and Prerequisite Programs.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} /> Log CCP Reading
        </button>
      </div>

      {loading ? (
        <p>Loading records...</p>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: 'var(--glass-border)' }}>
                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Control Point</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Recorded At</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id} style={{ borderBottom: 'var(--glass-border)' }}>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{record.control_point}</td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{record.recorded_at}</td>
                  <td style={{ padding: '16px' }}>
                    {record.status === 'COMPLIANT' ? (
                      <span className="badge badge-success">COMPLIANT</span>
                    ) : (
                      <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                        <AlertTriangle size={14} /> DEVIATION
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <CreateHaccpModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadRecords}
        />
      )}
    </div>
  );
}
