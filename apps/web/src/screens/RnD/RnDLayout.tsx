import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Beaker, BookOpen } from 'lucide-react';

export default function RnDLayout() {
  const navItems = [
    { path: '/rnd', label: 'Recipe Engine', icon: <Beaker size={18} /> },
    { path: '/rnd/notebook', label: 'Lab Notebook', icon: <BookOpen size={18} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Module Sub-navigation */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', overflowX: 'auto' }}>
        {navItems.map(item => (
          <NavLink 
            key={item.path}
            to={item.path}
            end={item.path === '/rnd'}
            className={({isActive}) => isActive ? 'btn-primary' : ''}
            style={({isActive}) => ({ 
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '8px', 
              background: isActive ? 'var(--primary-accent)' : 'rgba(255,255,255,0.05)',
              color: isActive ? '#0F172A' : 'var(--text-main)',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            })}
          >
            {item.icon}
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
