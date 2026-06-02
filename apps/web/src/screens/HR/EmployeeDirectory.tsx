import React, { useState, useEffect } from 'react';
import { Users, UserPlus } from 'lucide-react';
import { hrApi } from '../../lib/bosApi';

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    const res = await hrApi.getEmployees();
    if (res.data) setEmployees(res.data);
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={24} color="var(--primary-accent)" /> Employee Directory
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Manage factory staff and operators.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserPlus size={18} /> Add Employee
        </button>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Emp Code</th>
              <th>Name</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id}>
                <td><strong>{emp.employee_code}</strong></td>
                <td>{emp.first_name} {emp.last_name}</td>
                <td>{emp.department}</td>
                <td>{emp.designation}</td>
                <td>
                  <span className={`status-badge ${emp.status === 'ACTIVE' ? 'status-approved' : 'status-quarantine'}`}>
                    {emp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
