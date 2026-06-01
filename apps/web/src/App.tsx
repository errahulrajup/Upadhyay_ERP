import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Beaker, Truck, FileCheck, Search, Settings, ShieldCheck, FlaskConical } from 'lucide-react';

// Temporary Mock Components for Routes
const Dashboard = () => (
  <div className="animate-in">
    <h1>Dashboard</h1>
    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Welcome to Upadhyay_ERP</p>
    
    <div className="grid-3" style={{ marginTop: '32px' }}>
      <div className="card">
        <h3 style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Active Batches</h3>
        <p style={{ fontSize: '32px', fontWeight: '800', marginTop: '12px' }}>12</p>
        <span className="badge badge-success" style={{ marginTop: '12px', display: 'inline-block' }}>All Good</span>
      </div>
      <div className="card">
        <h3 style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Pending QC</h3>
        <p style={{ fontSize: '32px', fontWeight: '800', marginTop: '12px' }}>5</p>
        <span className="badge badge-warning" style={{ marginTop: '12px', display: 'inline-block' }}>Attention Needed</span>
      </div>
      <div className="card">
        <h3 style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Dispatches Today</h3>
        <p style={{ fontSize: '32px', fontWeight: '800', marginTop: '12px' }}>8</p>
      </div>
    </div>
  </div>
);

import InventoryLayout from './screens/Inventory/InventoryLayout';
import ProductionLayout from './screens/Production/ProductionLayout';
import QcDashboard from './screens/QC/QcDashboard';
import LogisticsLayout from './screens/Logistics/LogisticsLayout';
import ComplianceLayout from './screens/Compliance/ComplianceLayout';
import RnDDashboard from './screens/RnD/RnDDashboard';
import TraceabilityTree from './screens/Traceability/TraceabilityTree';

const Placeholder = ({ title }: { title: string }) => (
  <div className="animate-in">
    <h1>{title}</h1>
    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Module under construction in Phase 1.</p>
  </div>
);

export default function App() {
  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div style={{ background: 'var(--primary-accent)', padding: '6px', borderRadius: '8px' }}>
            <LayoutDashboard color="#0B0F19" size={20} />
          </div>
          <h2>Upadhyay_ERP</h2>
        </div>
        
        <nav className="nav-links">
          <NavLink to="/" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/inventory" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Package size={20} /> Inventory & GRN
          </NavLink>
          <NavLink to="/rnd" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <FlaskConical size={20} /> R&D Formulation
          </NavLink>
          <NavLink to="/production" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Beaker size={20} /> Production
          </NavLink>
          <NavLink to="/qc" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <FileCheck size={20} /> QC & Release
          </NavLink>
          <NavLink to="/logistics" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Truck size={20} /> Logistics & Finance
          </NavLink>
          <NavLink to="/compliance" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <ShieldCheck size={20} /> FSMS & Compliance
          </NavLink>
          <NavLink to="/traceability" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Search size={20} /> Traceability
          </NavLink>
        </nav>
        
        <div style={{ marginTop: 'auto', padding: '0 16px' }}>
          <NavLink to="/settings" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={20} /> Settings
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>
            Phase 1: Foundation & First Vertical Slice
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Admin User</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0B0F19', fontWeight: 'bold' }}>
              A
            </div>
          </div>
        </header>
        
        <div className="page-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory/*" element={<InventoryLayout />} />
            <Route path="/rnd" element={<RnDDashboard />} />
            <Route path="/production/*" element={<ProductionLayout />} />
            <Route path="/qc" element={<QcDashboard />} />
            <Route path="/logistics/*" element={<LogisticsLayout />} />
            <Route path="/compliance/*" element={<ComplianceLayout />} />
            <Route path="/traceability" element={<TraceabilityTree />} />
            <Route path="/settings" element={<Placeholder title="Settings" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
