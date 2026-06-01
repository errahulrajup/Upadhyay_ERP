import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import GrnDashboard from './GrnDashboard';
import RmLotsView from './RmLotsView';
import StockLedger from './StockLedger';

export default function InventoryLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Module Sub-navigation */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: 'var(--glass-border)', paddingBottom: '16px' }}>
        <NavLink 
          to="/inventory/grn" 
          className={({isActive}) => isActive ? 'btn-primary' : ''}
          style={({isActive}) => ({ 
            padding: '8px 16px', borderRadius: '8px', 
            background: isActive ? 'var(--primary-accent)' : 'rgba(255,255,255,0.05)',
            color: isActive ? '#0F172A' : 'var(--text-main)',
            fontWeight: 600
          })}
        >
          GRN Dashboard
        </NavLink>
        <NavLink 
          to="/inventory/lots" 
          className={({isActive}) => isActive ? 'btn-primary' : ''}
          style={({isActive}) => ({ 
            padding: '8px 16px', borderRadius: '8px', 
            background: isActive ? 'var(--primary-accent)' : 'rgba(255,255,255,0.05)',
            color: isActive ? '#0F172A' : 'var(--text-main)',
            fontWeight: 600
          })}
        >
          RM Lots
        </NavLink>
        <NavLink 
          to="/inventory/ledger" 
          className={({isActive}) => isActive ? 'btn-primary' : ''}
          style={({isActive}) => ({ 
            padding: '8px 16px', borderRadius: '8px', 
            background: isActive ? 'var(--primary-accent)' : 'rgba(255,255,255,0.05)',
            color: isActive ? '#0F172A' : 'var(--text-main)',
            fontWeight: 600
          })}
        >
          Stock Ledger
        </NavLink>
      </div>

      {/* Module Content */}
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Navigate to="grn" replace />} />
          <Route path="grn" element={<GrnDashboard />} />
          <Route path="lots" element={<RmLotsView />} />
          <Route path="ledger" element={<StockLedger />} />
        </Routes>
      </div>
    </div>
  );
}
