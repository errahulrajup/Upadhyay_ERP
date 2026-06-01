import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import DispatchDashboard from './DispatchDashboard';
import InvoicesView from './InvoicesView';

export default function LogisticsLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Module Sub-navigation */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: 'var(--glass-border)', paddingBottom: '16px' }}>
        <NavLink 
          to="/logistics/dispatch" 
          className={({isActive}) => isActive ? 'btn-primary' : ''}
          style={({isActive}) => ({ 
            padding: '8px 16px', borderRadius: '8px', 
            background: isActive ? 'var(--primary-accent)' : 'rgba(255,255,255,0.05)',
            color: isActive ? '#0F172A' : 'var(--text-main)',
            fontWeight: 600
          })}
        >
          Dispatch
        </NavLink>
        <NavLink 
          to="/logistics/invoices" 
          className={({isActive}) => isActive ? 'btn-primary' : ''}
          style={({isActive}) => ({ 
            padding: '8px 16px', borderRadius: '8px', 
            background: isActive ? 'var(--primary-accent)' : 'rgba(255,255,255,0.05)',
            color: isActive ? '#0F172A' : 'var(--text-main)',
            fontWeight: 600
          })}
        >
          Invoices & Finance
        </NavLink>
      </div>

      {/* Module Content */}
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Navigate to="dispatch" replace />} />
          <Route path="dispatch" element={<DispatchDashboard />} />
          <Route path="invoices" element={<InvoicesView />} />
        </Routes>
      </div>
    </div>
  );
}
