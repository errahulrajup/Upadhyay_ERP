import React, { useState, useEffect } from 'react';
import { Book, FileText, Upload } from 'lucide-react';
import { complianceApi } from '../../lib/bosApi';

export default function SopRegister() {
  const [sops, setSops] = useState<any[]>([]);

  useEffect(() => {
    loadSops();
  }, []);

  const loadSops = async () => {
    const res = await complianceApi.getSops();
    if (res.data) setSops(res.data);
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
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                  <button className="btn-secondary" style={{ padding: '4px 8px' }}><FileText size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
