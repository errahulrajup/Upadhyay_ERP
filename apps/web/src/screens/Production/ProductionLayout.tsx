import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import RecipesView from './RecipesView';
import BatchDashboard from './BatchDashboard';

export default function ProductionLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Module Sub-navigation */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: 'var(--glass-border)', paddingBottom: '16px' }}>
        <NavLink 
          to="/production/recipes" 
          className={({isActive}) => isActive ? 'btn-primary' : ''}
          style={({isActive}) => ({ 
            padding: '8px 16px', borderRadius: '8px', 
            background: isActive ? 'var(--primary-accent)' : 'rgba(255,255,255,0.05)',
            color: isActive ? '#0F172A' : 'var(--text-main)',
            fontWeight: 600
          })}
        >
          Master Recipes
        </NavLink>
        <NavLink 
          to="/production/batches" 
          className={({isActive}) => isActive ? 'btn-primary' : ''}
          style={({isActive}) => ({ 
            padding: '8px 16px', borderRadius: '8px', 
            background: isActive ? 'var(--primary-accent)' : 'rgba(255,255,255,0.05)',
            color: isActive ? '#0F172A' : 'var(--text-main)',
            fontWeight: 600
          })}
        >
          Batch Dashboard
        </NavLink>
      </div>

      {/* Module Content */}
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Navigate to="batches" replace />} />
          <Route path="recipes" element={<RecipesView />} />
          <Route path="batches" element={<BatchDashboard />} />
        </Routes>
      </div>
    </div>
  );
}
