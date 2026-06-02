import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Fingerprint } from 'lucide-react';
import { hrApi } from '../../lib/bosApi';

export default function AttendanceTracker() {
  const [logs, setLogs] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAttendance();
    loadEmployees();
  }, []);

  const loadAttendance = async () => {
    const res = await hrApi.getAttendance();
    if (res.data) setLogs(res.data);
  };

  const loadEmployees = async () => {
    const res = await hrApi.getEmployees();
    if (res.data) setEmployees(res.data);
  };

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setIsSubmitting(true);
    await hrApi.markAttendance({
      employee_id: selectedEmp,
      date: new Date().toISOString().split('T')[0],
      check_in: new Date().toISOString(),
      status: 'PRESENT'
    });
    setIsSubmitting(false);
    loadAttendance();
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={24} color="var(--primary-accent)" /> Daily Attendance
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Monitor daily punch-ins and working hours.</p>
        </div>
        <form onSubmit={handleMarkAttendance} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select 
            required 
            value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
          >
            <option value="">Select Employee...</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.employee_code} - {emp.name}</option>
            ))}
          </select>
          <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Fingerprint size={18} /> Mark Present
          </button>
        </form>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee ID</th>
              <th>Punch In</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{log.date}</td>
                <td><strong>{log.employees?.name || log.employee_id}</strong></td>
                <td>{log.check_in ? new Date(log.check_in).toLocaleTimeString() : '-'}</td>
                <td>
                  <span style={{ color: log.status === 'PRESENT' ? '#4ADE80' : '#F87171', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={16} /> {log.status}
                  </span>
                </td>
                <td>
                  <button className="btn-secondary" style={{ padding: '4px 8px' }}>Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
