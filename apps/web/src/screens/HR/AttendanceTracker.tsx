import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { hrApi } from '../../lib/bosApi';

export default function AttendanceTracker() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    const res = await hrApi.getAttendance();
    if (res.data) setLogs(res.data);
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
                <td><strong>{log.employee_id}</strong></td>
                <td>{log.punch_in}</td>
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
