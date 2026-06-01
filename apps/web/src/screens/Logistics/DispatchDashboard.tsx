import React, { useEffect, useState } from 'react';
import { dispatchApi } from '../../lib/bosApi';
import { Truck, CheckCircle } from 'lucide-react';
import NewDispatchModal from './NewDispatchModal';

export default function DispatchDashboard() {
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadDispatches();
  }, []);

  const loadDispatches = async () => {
    setLoading(true);
    const { data } = await dispatchApi.getDispatches();
    if (data) setDispatches(data);
    setLoading(false);
  };

  const handleConfirm = async (id: string) => {
    setConfirming(id);
    const { error } = await dispatchApi.confirmDispatch(id);
    if (!error) {
      await loadDispatches();
    } else {
      alert("Failed to confirm dispatch.");
    }
    setConfirming(null);
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Dispatch Management</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Ship finished goods to customers securely.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={18} /> New Dispatch
        </button>
      </div>

      <NewDispatchModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => loadDispatches()} 
      />

      {loading ? (
        <p>Loading Dispatches...</p>
      ) : (
        <div className="grid-2">
          {dispatches.map(dispatch => (
            <div key={dispatch.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ fontSize: '18px', color: 'var(--primary-accent)' }}>{dispatch.dispatch_no}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-main)' }}>{dispatch.customer}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Date: {dispatch.date}</p>
                </div>
                {dispatch.status === 'SHIPPED' ? (
                  <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={14} /> Shipped
                  </span>
                ) : (
                  <span className="badge badge-warning" style={{ background: 'var(--primary-accent-glow)', color: 'var(--primary-accent)' }}>
                    Draft
                  </span>
                )}
              </div>
              
              {dispatch.status === 'DRAFT' && (
                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: 'var(--glass-border)' }}>
                  <button 
                    className="btn-primary" 
                    onClick={() => handleConfirm(dispatch.id)}
                    disabled={confirming === dispatch.id}
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
                  >
                    <Truck size={16} />
                    {confirming === dispatch.id ? 'Deducting Stock RPC...' : 'Confirm Dispatch & Deduct FG'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
