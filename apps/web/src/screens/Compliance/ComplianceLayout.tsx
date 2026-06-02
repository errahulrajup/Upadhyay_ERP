import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

export default function ComplianceLayout() {
  const navItems = [
    { path: '/compliance/haccp', label: 'HACCP & PRP' },
    { path: '/compliance/allergens', label: 'Allergen Matrix' },
    { path: '/compliance/capa', label: 'Recall & CAPA' },
    { path: '/compliance/sops', label: 'SOP Register' },
    { path: '/compliance/training', label: 'Training Matrix' },
    { path: '/compliance/audits', label: 'Audits' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Module Sub-navigation */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', overflowX: 'auto' }}>
        {navItems.map(item => (
          <NavLink 
            key={item.path}
            to={item.path}
            className={({isActive}) => isActive ? 'btn-primary' : ''}
            style={({isActive}) => ({ 
              padding: '8px 16px', borderRadius: '8px', 
              background: isActive ? 'var(--primary-accent)' : 'rgba(255,255,255,0.05)',
              color: isActive ? '#0F172A' : 'var(--text-main)',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Module Content */}
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}
