import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, Plus } from 'lucide-react';
import { complianceApi } from '../../lib/bosApi';

export default function TrainingMatrix() {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    const res = await complianceApi.getTrainingRecords();
    if (res.data) setRecords(res.data);
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={24} color="var(--primary-accent)" /> Training Matrix
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>FSSAI hygiene and safety training records.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Log Training
        </button>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Topic</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr key={r.id}>
                <td><strong>{r.employee_name}</strong></td>
                <td>{r.training_topic}</td>
                <td>{r.training_date}</td>
                <td>
                  <span className={`status-badge ${r.status === 'COMPLETED' ? 'status-approved' : 'status-quarantine'}`}>
                    {r.status}
                  </span>
                </td>
                <td>
                  <button className="btn-secondary" style={{ padding: '4px 8px' }}><GraduationCap size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
