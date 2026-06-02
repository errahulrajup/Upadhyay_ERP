import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { hrApi } from '../../lib/bosApi';
import { Save } from 'lucide-react';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Production');
  const [role, setRole] = useState('');
  const [baseSalary, setBaseSalary] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await hrApi.addEmployee({
      name,
      department,
      role,
      base_salary: Number(baseSalary) || 0,
      status: 'ACTIVE',
      join_date: new Date().toISOString().split('T')[0]
    });
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Employee">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Full Name</label>
            <input 
              type="text" required
              value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Department</label>
            <select 
              required
              value={department} onChange={e => setDepartment(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#0F172A', color: 'white' }}
            >
              <option value="Production">Production</option>
              <option value="Quality">Quality Control</option>
              <option value="Logistics">Logistics</option>
              <option value="Management">Management</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Role/Title</label>
            <input 
              type="text" required
              value={role} onChange={e => setRole(e.target.value)}
              placeholder="e.g. Operator"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Base Salary (Monthly)</label>
            <input 
              type="number" required
              value={baseSalary} onChange={e => setBaseSalary(e.target.value)}
              placeholder="e.g. 25000"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={16} />
            {loading ? 'Saving...' : 'Add Employee'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
