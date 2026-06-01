import React, { useEffect, useState } from 'react';
import { inventoryApi } from '../../lib/bosApi';
import { PackagePlus, CheckCircle, Clock } from 'lucide-react';
import CreateGrnModal from './CreateGrnModal';

export default function GrnDashboard() {
  const [grns, setGrns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadGrns();
  }, []);

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
