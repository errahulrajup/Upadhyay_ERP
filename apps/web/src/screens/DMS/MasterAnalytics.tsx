import React from 'react';
import { BarChart3, TrendingUp, Package, Users, DollarSign } from 'lucide-react';

export default function MasterAnalytics() {
  return (
    <div className="animate-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '28px' }}>
          <BarChart3 size={32} color="var(--primary-accent)" /> Master Analytics
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '16px' }}>
          Factory overview and top-level management metrics.
        </p>
      </div>

      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(74,222,128,0.1), transparent)', border: '1px solid rgba(74,222,128,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Monthly Revenue</p>
              <h2 style={{ fontSize: '28px', color: '#4ADE80' }}>₹12.5L</h2>
            </div>
            <DollarSign color="#4ADE80" size={24} />
          </div>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#4ADE80' }}>
            <TrendingUp size={14} /> +15% from last month
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Production Yield</p>
              <h2 style={{ fontSize: '28px' }}>94.2%</h2>
            </div>
            <BarChart3 color="var(--primary-accent)" size={24} />
          </div>
          <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
            Target: 95.0%
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Pending Dispatches</p>
              <h2 style={{ fontSize: '28px' }}>18</h2>
            </div>
            <Package color="var(--text-main)" size={24} />
          </div>
          <div style={{ marginTop: '16px', fontSize: '12px', color: '#F87171' }}>
            3 orders delayed
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Active Workforce</p>
              <h2 style={{ fontSize: '28px' }}>42</h2>
            </div>
            <Users color="var(--text-main)" size={24} />
          </div>
          <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
            Attendance: 98%
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '16px' }}>Revenue vs Expenses (Mock)</h3>
          <div style={{ flex: 1, border: '1px dashed var(--glass-border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            [ Chart Area Placeholder ]
          </div>
        </div>
        <div className="card" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '16px' }}>Production Output by Product (Mock)</h3>
          <div style={{ flex: 1, border: '1px dashed var(--glass-border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            [ Chart Area Placeholder ]
          </div>
        </div>
      </div>
    </div>
  );
}
