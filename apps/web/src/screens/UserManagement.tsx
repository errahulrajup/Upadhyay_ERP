import React, { useState } from 'react';
import { Shield, Save, LogOut } from 'lucide-react';
import { useAuth, UserRole } from '../lib/AuthContext';

export default function UserManagement() {
  const { user, login, logout } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'SUPER_ADMIN');

  const handleRoleChange = () => {
    login(selectedRole);
    // Force a hard reload to reset UI states based on new role context if needed
    window.location.href = '/'; 
  };

  const roles: { role: UserRole; desc: string }[] = [
    { role: 'SUPER_ADMIN', desc: 'Full system access and override privileges' },
    { role: 'PURCHASE_MANAGER', desc: 'Procurement, Suppliers, and GRN creation' },
    { role: 'PRODUCTION_MANAGER', desc: 'Recipe management, Master Scheduling, and Batches' },
    { role: 'PRODUCTION_OPERATOR', desc: 'Floor monitoring and Batch execution only' },
    { role: 'QA_OFFICER', desc: 'QC checks, HACCP logging, and FG Lot creation' },
    { role: 'SANITATION_OFFICER', desc: 'CIP logs and Hygiene tracking' },
    { role: 'DISPATCH_MANAGER', desc: 'Logistics, Vehicles, and FG Dispatch' },
    { role: 'ACCOUNT_MANAGER', desc: 'General Ledger, Invoicing, and Payroll viewing' },
    { role: 'HR_MANAGER', desc: 'Employee directory, Attendance, and Payroll processing' },
    { role: 'HELPER', desc: 'Basic access, self-service attendance only' }
  ];

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={24} color="var(--primary-accent)" /> User & Role Management
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Configure RBAC profiles and test permissions.</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Profile Test Panel */}
        <div className="card" style={{ borderTop: '4px solid var(--primary-accent)' }}>
          <h3 style={{ marginBottom: '16px' }}>Test Active Role (Dev Mode)</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
            Switch your active role to verify that Protected Routes successfully block unauthorized access to other modules.
          </p>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label>Select Role to Simulate</label>
            <select 
              className="form-control" 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            >
              {roles.map(r => (
                <option key={r.role} value={r.role}>{r.role}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" onClick={handleRoleChange} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={16} /> Switch Role
            </button>
            <button className="btn-secondary" onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F87171' }}>
              <LogOut size={16} /> Clear Session
            </button>
          </div>
        </div>

        {/* Roles Reference */}
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Active RBAC Policies</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
            {roles.map(r => (
              <div key={r.role} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: r.role === user?.role ? '4px solid var(--primary-accent)' : '4px solid transparent' }}>
                <strong style={{ display: 'block', color: r.role === user?.role ? 'var(--primary-accent)' : 'inherit' }}>{r.role}</strong>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{r.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
