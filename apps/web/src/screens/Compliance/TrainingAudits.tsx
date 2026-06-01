import React from 'react';
import { Calendar, Users } from 'lucide-react';

export default function TrainingAudits() {
  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Training & Audits</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Manage employee training records and FSSAI schedules.</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ padding: '16px', background: 'var(--primary-accent-glow)', borderRadius: '50%', color: 'var(--primary-accent)' }}>
            <Users size={32} />
          </div>
          <h3>Employee Training</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Log induction, refresher, and hygiene training records.</p>
          <button className="btn-primary" style={{ marginTop: '16px' }}>View Matrix</button>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ padding: '16px', background: 'var(--primary-accent-glow)', borderRadius: '50%', color: 'var(--primary-accent)' }}>
            <Calendar size={32} />
          </div>
          <h3>Audit Schedules</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Track internal, external, and regulatory (FSSAI) audits.</p>
          <button className="btn-primary" style={{ marginTop: '16px' }}>View Calendar</button>
        </div>
      </div>
    </div>
  );
}
