import React, { useState, useEffect } from 'react';
import { Beaker, Plus, Lock, Unlock, FileText, FlaskConical } from 'lucide-react';
import { inventoryApi } from '../../lib/bosApi';

export default function RecipeEngine() {
  const [recipes, setRecipes] = useState<any[]>([]);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    const res = await inventoryApi.getRecipes();
    if (res.data) setRecipes(res.data);
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Recipe Engine</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Master formulation and Bill of Materials (BOM) management.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> New Recipe
        </button>
      </div>

      <div className="grid-2">
        {recipes.map(r => (
          <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Beaker size={20} color="var(--primary-accent)" /> {r.name}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px', marginTop: '6px', display: 'inline-block' }}>
                  {r.version} | Base: {r.base_qty} LTR
                </span>
              </div>
              {r.is_locked ? (
                <span className="status-badge status-approved" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={12} /> Locked
                </span>
              ) : (
                <span className="status-badge status-quarantine" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Unlock size={12} /> Draft
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
              <button className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px' }}>
                <FlaskConical size={16} /> Ingredients
              </button>
              <button className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px' }}>
                <FileText size={16} /> Steps & QC
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
