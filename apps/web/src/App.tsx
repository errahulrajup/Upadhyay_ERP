import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Beaker, Truck, FileCheck, Search, Settings, ShieldCheck, FlaskConical, Users, Folder } from 'lucide-react';

import MasterAnalytics from './screens/DMS/MasterAnalytics';

import InventoryLayout from './screens/Inventory/InventoryLayout';
import ProductionLayout from './screens/Production/ProductionLayout';
import GrnDashboard from './screens/Inventory/GrnDashboard';
import RmStore from './screens/Inventory/RmStore';
import FgStore from './screens/Inventory/FgStore';
import GeneralStore from './screens/Inventory/GeneralStore';
import StorageLocations from './screens/Inventory/StorageLocations';
import StockLedger from './screens/Inventory/StockLedger';
import QcDashboard from './screens/QC/QcDashboard';
import RnDLayout from './screens/RnD/RnDLayout';
import RecipeEngine from './screens/RnD/RecipeEngine';
import LabNotebook from './screens/RnD/LabNotebook';
import LogisticsLayout from './screens/Logistics/LogisticsLayout';
import ComplianceLayout from './screens/Compliance/ComplianceLayout';
import RnDDashboard from './screens/RnD/RnDDashboard';
import FloorMonitor from './screens/Production/FloorMonitor';
import PackagingHouse from './screens/Production/PackagingHouse';
import Equipment from './screens/Production/Equipment';
import WorkCenters from './screens/Production/WorkCenters';
import DailyLogs from './screens/Production/DailyLogs';
import BatchDashboard from './screens/Production/BatchDashboard';
import TraceabilityTree from './screens/Traceability/TraceabilityTree';
import SettingsDashboard from './screens/SettingsDashboard';
import BatchQc from './screens/QC/BatchQc';
import SopRegister from './screens/Compliance/SopRegister';
import TrainingMatrix from './screens/Compliance/TrainingMatrix';
import HaccpPrpDashboard from './screens/Compliance/HaccpPrpDashboard';
import RecallCapaTracker from './screens/Compliance/RecallCapaTracker';
import TrainingAudits from './screens/Compliance/TrainingAudits';
import FinanceLayout from './screens/Finance/FinanceLayout';
import PurchaseOrders from './screens/Finance/PurchaseOrders';
import Invoicing from './screens/Finance/Invoicing';
import GeneralLedger from './screens/Finance/GeneralLedger';
import HrLayout from './screens/HR/HrLayout';
import EmployeeDirectory from './screens/HR/EmployeeDirectory';
import AttendanceTracker from './screens/HR/AttendanceTracker';
import PayrollDashboard from './screens/HR/PayrollDashboard';
import DocumentVault from './screens/DMS/DocumentVault';

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
            <Truck size={20} /> Logistics & Dispatches
          </NavLink>
          <NavLink to="/finance" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <FileCheck size={20} /> Accounts & Finance
          </NavLink>
          <NavLink to="/compliance" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <ShieldCheck size={20} /> FSMS & Compliance
          </NavLink>
          <NavLink to="/hr" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={20} /> HR & Payroll
          </NavLink>
          <NavLink to="/dms" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Folder size={20} /> Docs & Vault
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
            <Route path="/" element={<MasterAnalytics />} />
            <Route path="/inventory/*" element={<InventoryLayout />}>
              <Route index element={<GrnDashboard />} />
              <Route path="rm-store" element={<RmStore />} />
              <Route path="fg-store" element={<FgStore />} />
              <Route path="general-store" element={<GeneralStore />} />
              <Route path="locations" element={<StorageLocations />} />
              <Route path="ledger" element={<StockLedger />} />
            </Route>
            <Route path="/rnd/*" element={<RnDLayout />}>
              <Route index element={<RecipeEngine />} />
              <Route path="notebook" element={<LabNotebook />} />
            </Route>
            <Route path="/production/*" element={<ProductionLayout />}>
              <Route index element={<BatchDashboard />} />
              <Route path="batches" element={<BatchDashboard />} />
              <Route path="monitor" element={<FloorMonitor />} />
              <Route path="packaging" element={<PackagingHouse />} />
              <Route path="work-centers" element={<WorkCenters />} />
              <Route path="equipment" element={<Equipment />} />
              <Route path="logs" element={<DailyLogs />} />
            </Route>
            <Route path="/qc" element={<BatchQc />} />
            <Route path="/logistics/*" element={<LogisticsLayout />} />
            <Route path="/compliance/*" element={<ComplianceLayout />}>
              <Route index element={<HaccpPrpDashboard />} />
              <Route path="haccp" element={<HaccpPrpDashboard />} />
              <Route path="capa" element={<RecallCapaTracker />} />
              <Route path="sops" element={<SopRegister />} />
              <Route path="training" element={<TrainingMatrix />} />
              <Route path="audits" element={<TrainingAudits />} />
            </Route>
            <Route path="/finance/*" element={<FinanceLayout />}>
              <Route index element={<Invoicing />} />
              <Route path="orders" element={<PurchaseOrders />} />
              <Route path="invoices" element={<Invoicing />} />
              <Route path="ledger" element={<GeneralLedger />} />
            </Route>
            <Route path="/hr/*" element={<HrLayout />}>
              <Route index element={<EmployeeDirectory />} />
              <Route path="directory" element={<EmployeeDirectory />} />
              <Route path="attendance" element={<AttendanceTracker />} />
              <Route path="payroll" element={<PayrollDashboard />} />
            </Route>
            <Route path="/dms" element={<DocumentVault />} />
            <Route path="/traceability" element={<TraceabilityTree />} />
            <Route path="/settings" element={<SettingsDashboard />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
