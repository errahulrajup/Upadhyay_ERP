import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import HaccpPrpDashboard from './HaccpPrpDashboard';
import RecallCapaTracker from './RecallCapaTracker';
import TrainingAudits from './TrainingAudits';

export default function ComplianceLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Module Sub-navigation */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: 'var(--glass-border)', paddingBottom: '16px' }}>
        <NavLink 
          to="/compliance/haccp" 
          className={({isActive}) => isActive ? 'btn-primary' : ''}
          style={({isActive}) => ({ 
            padding: '8px 16px', borderRadius: '8px', 
            background: isActive ? 'var(--primary-accent)' : 'rgba(255,255,255,0.05)',
            color: isActive ? '#0F172A' : 'var(--text-main)',
            fontWeight: 600
          })}
        >
          HACCP & PRP
        </NavLink>
        <NavLink 
          to="/compliance/capa" 
          className={({isActive}) => isActive ? 'btn-primary' : ''}
          style={({isActive}) => ({ 
            padding: '8px 16px', borderRadius: '8px', 
            background: isActive ? 'var(--primary-accent)' : 'rgba(255,255,255,0.05)',
            color: isActive ? '#0F172A' : 'var(--text-main)',
            fontWeight: 600
          })}
        >
          Recall & CAPA
        </NavLink>
        <NavLink 
          to="/compliance/audits" 
          className={({isActive}) => isActive ? 'btn-primary' : ''}
          style={({isActive}) => ({ 
            padding: '8px 16px', borderRadius: '8px', 
            background: isActive ? 'var(--primary-accent)' : 'rgba(255,255,255,0.05)',
            color: isActive ? '#0F172A' : 'var(--text-main)',
            fontWeight: 600
          })}
        >
          Training & Audits
        </NavLink>
      </div>

      {/* Module Content */}
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Navigate to="haccp" replace />} />
          <Route path="haccp" element={<HaccpPrpDashboard />} />
          <Route path="capa" element={<RecallCapaTracker />} />
          <Route path="audits" element={<TrainingAudits />} />
        </Routes>
      </div>
    </div>
  );
}
