import React, { useState } from 'react';
import { Settings, Users, Database } from 'lucide-react';
import UserManagement from './UserManagement';
import SystemConfig from './SystemConfig';

export default function SettingsDashboard() {
  const [activeTab, setActiveTab] = useState<'system' | 'users'>('users');

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={24} color="var(--primary-accent)" /> Settings & Administration
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Manage system configurations and RBAC policies.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
        <button 
          className={activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('users')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Users size={16} /> User & Role Management
        </button>
        <button 
          className={activeTab === 'system' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('system')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Database size={16} /> Database & Master Data
        </button>
      </div>

      <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'system' && <SystemConfig />}
      </div>
    </div>
  );
}
