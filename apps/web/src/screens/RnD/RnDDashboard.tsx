import React, { useEffect, useState } from 'react';
import { rndApi } from '../../lib/bosApi';
import { FlaskConical, Beaker } from 'lucide-react';

export default function RnDDashboard() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    setLoading(true);
    const { data } = await rndApi.getDraftRecipes();
    if (data) setRecipes(data);
    setLoading(false);
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>R&D Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Manage draft recipes, formulation trials, and approvals.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FlaskConical size={18} /> New Trial Formulation
        </button>
      </div>

      {loading ? (
        <p>Loading Draft Recipes...</p>
      ) : (
        <div className="grid-2">
          {recipes.map(recipe => (
            <div key={recipe.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ fontSize: '18px', color: 'var(--primary-accent)' }}>{recipe.name}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Author: {recipe.author}</p>
                </div>
                {recipe.status === 'DRAFT' ? (
                  <span className="badge badge-warning" style={{ background: 'var(--primary-accent-glow)', color: 'var(--primary-accent)' }}>
                    Draft
                  </span>
                ) : (
                  <span className="badge badge-warning">Pending Auth</span>
                )}
              </div>
              
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: 'var(--glass-border)' }}>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
                >
                  <Beaker size={16} /> Edit Formulation
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
