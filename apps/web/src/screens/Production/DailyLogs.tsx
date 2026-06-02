import React, { useEffect, useState } from 'react';
import { ClipboardList, Plus, Clock } from 'lucide-react';
import { productionApi } from '../../lib/bosApi';
import AddProductionLogModal from './AddProductionLogModal';

export default function DailyLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const { data } = await productionApi.getDailyLogs();
    if (data) setLogs(data);
    setLoading(false);
  };
  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Daily Production Logs</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Shift supervisor reports and downtime tracking.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Log Shift Report
        </button>
      </div>

      {loading ? (
        <p>Loading logs...</p>
      ) : logs.length === 0 ? (
        <div className="card">
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ClipboardList size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3>No Logs Found</h3>
            <p style={{ marginTop: '8px', fontSize: '14px' }}>No production shift logs have been recorded yet.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {logs.map(log => (
            <div key={log.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px' }}>{log.batch_no}</h3>
                  <span className="badge badge-primary">{log.work_center}</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  <strong>{log.reading_type}:</strong> {log.reading_value}
                </p>
                {log.remarks && <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Note: {log.remarks}</p>}
              </div>
              <div style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '13px' }}>
                <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                {new Date(log.logged_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <AddProductionLogModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadLogs}
        />
      )}
    </div>
  );
}
