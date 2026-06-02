import React, { useState, useEffect } from 'react';
import { Book, FileText, Upload, X } from 'lucide-react';
import { complianceApi } from '../../lib/bosApi';
import { supabase } from '../../lib/supabase';

export default function SopRegister() {
  const [sops, setSops] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [sopCode, setSopCode] = useState('');
  const [dept, setDept] = useState('Production');

  useEffect(() => {
    loadSops();
  }, []);

  const loadSops = async () => {
    const res = await complianceApi.getSops();
    if (res.data) setSops(res.data);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('sop_register').insert([{
      sop_code: sopCode,
      title,
      department: dept,
      status: 'ACTIVE',
      next_review_date: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]
    }]);
    setIsModalOpen(false); setTitle(''); setSopCode('');
    loadSops();
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Book size={24} color="var(--primary-accent)" /> SOP Register
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Master repository of all Standard Operating Procedures.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Upload size={18} /> Upload SOP
        </button>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>SOP Code</th>
              <th>Title</th>
              <th>Department</th>
              <th>Next Review</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sops.map(sop => (
              <tr key={sop.id}>
                <td><strong>{sop.sop_code}</strong></td>
                <td>{sop.title}</td>
                <td>{sop.department}</td>
                <td>{sop.next_review_date}</td>
                <td>
                  <span className="status-badge status-approved">{sop.status}</span>
                </td>
                <td>
                  <button className="btn-secondary" onClick={() => alert(`SOP: ${sop.sop_code}\nTitle: ${sop.title}\nDept: ${sop.department}\nStatus: ${sop.status}`)} style={{ padding: '4px 8px' }}><FileText size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2>Add SOP Document</h2>
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input required placeholder="SOP Code (e.g. SOP-QC-001)" value={sopCode} onChange={e => setSopCode(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              <input required placeholder="SOP Title" value={title} onChange={e => setTitle(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              <select value={dept} onChange={e => setDept(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#0F172A', color: 'white' }}>
                <option>Production</option><option>QC</option><option>FSMS</option><option>Logistics</option><option>HR</option>
              </select>
              <button type="submit" className="btn-primary">Register SOP</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
