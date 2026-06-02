import React, { useEffect, useState } from 'react';
import { inventoryApi } from '../../lib/bosApi';
import { PackagePlus, CheckCircle, Clock } from 'lucide-react';
import CreateGrnModal from './CreateGrnModal';

export default function GrnDashboard() {
  const [grns, setGrns] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadGrns();
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    const { data } = await inventoryApi.getLowStockAlerts();
    if (data) setAlerts(data);
  };

  const loadGrns = async () => {
    setLoading(true);
    const { data } = await inventoryApi.getGrnList();
    if (data) setGrns(data);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    setApproving(id);
    const { error } = await inventoryApi.approveGrn(id);
    if (!error) {
      // Refresh list
      await loadGrns();
    } else {
      alert("Failed to approve GRN");
    }
    setApproving(null);
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Goods Receipt Notes</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Manage incoming materials and QA approvals.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PackagePlus size={18} /> New GRN
        </button>
      </div>

      {alerts.length > 0 && (
        <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '8px', background: 'rgba(248, 113, 113, 0.1)', border: '1px solid #F87171' }}>
          <h3 style={{ color: '#F87171', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Clock size={18} /> Low Stock Alerts
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {alerts.map(a => (
              <div key={a.id} style={{ background: '#0F172A', padding: '12px', borderRadius: '6px', border: '1px solid var(--glass-border)', flex: '1 1 250px' }}>
                <strong style={{ color: 'white' }}>{a.name}</strong>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Current: <span style={{ color: '#F87171', fontWeight: 'bold' }}>{a.current_stock}</span></span>
                  <span style={{ color: 'var(--text-muted)' }}>Reorder: {a.reorder_level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CreateGrnModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          // Here we would normally refresh the list, but since we're mostly dealing with mocks
          // we can just call loadGrns or show a toast.
          loadGrns();
        }}
      />

      {loading ? (
        <p>Loading GRNs...</p>
      ) : (
        <div className="grid-2">
          {grns.map(grn => (
            <div key={grn.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ fontSize: '18px', color: 'var(--primary-accent)' }}>{grn.grn_no}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{grn.supplier} • {grn.date}</p>
                </div>
                {grn.status === 'APPROVED' ? (
                  <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={14} /> Approved
                  </span>
                ) : (
                  <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} /> Pending QC
                  </span>
                )}
              </div>
              
              {grn.status === 'PENDING_QC' && (
                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: 'var(--glass-border)' }}>
                  <button 
                    className="btn-primary" 
                    onClick={() => handleApprove(grn.id)}
                    disabled={approving === grn.id}
                    style={{ width: '100%' }}
                  >
                    {approving === grn.id ? 'Approving RPC...' : 'QA Approve & Generate Lot'}
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
