import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, Plus, X } from 'lucide-react';
import { complianceApi } from '../../lib/bosApi';
import { supabase } from '../../lib/supabase';

export default function TrainingMatrix() {
  const [records, setRecords] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [empName, setEmpName] = useState('');
  const [topic, setTopic] = useState('');
  const [trainingDate, setTrainingDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    const res = await complianceApi.getTrainingRecords();
    if (res.data) setRecords(res.data);
  };

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('training_matrix').insert([{
      employee_name: empName, training_topic: topic,
      training_date: trainingDate, status: 'COMPLETED'
    }]);
    setIsModalOpen(false); setEmpName(''); setTopic('');
    loadRecords();
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
        <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2>Log Training Record</h2>
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleLog} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input required placeholder="Employee Name" value={empName} onChange={e => setEmpName(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              <input required placeholder="Training Topic" value={topic} onChange={e => setTopic(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              <input type="date" required value={trainingDate} onChange={e => setTrainingDate(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              <button type="submit" className="btn-primary">Save Record</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
