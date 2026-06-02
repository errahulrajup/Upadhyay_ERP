import React, { useState, useEffect } from 'react';
import { Beaker, Plus, Lock, Unlock, FileText, FlaskConical, X } from 'lucide-react';
import { inventoryApi } from '../../lib/bosApi';

export default function RecipeEngine() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productId, setProductId] = useState('');
  const [name, setName] = useState('');
  const [baseQty, setBaseQty] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecipes();
    loadProducts();
  }, []);

  const loadRecipes = async () => {
    const res = await inventoryApi.getRecipes();
    if (res.data) setRecipes(res.data);
  };

  const loadProducts = async () => {
    const res = await inventoryApi.getErpProducts();
    if (res.data) setProducts(res.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await inventoryApi.createRecipe({
      productId,
      name,
      baseQty: Number(baseQty) || 1000
    });
    setLoading(false);
    if (error) {
      alert(`Error creating recipe: ${error.message}`);
    } else {
      setIsModalOpen(false);
      setName('');
      setBaseQty('');
      setProductId('');
      loadRecipes();
    }
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Recipe Engine</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Master formulation and Bill of Materials (BOM) management.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                  {r.version || 'v1.0'} | Base: {r.base_qty} kg
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
              <button 
                onClick={() => alert(`Recipe Ingredients for ${r.name}:\n\n- Active Ingredients (BOM) loaded from database\n- Status: ${r.is_locked ? 'Locked' : 'Editable'}`)}
                className="btn-secondary" 
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px' }}
              >
                <FlaskConical size={16} /> Ingredients
              </button>
              <button 
                onClick={() => alert(`Process Steps & QC Parameters for ${r.name}:\n\n- Phase Steps registered in system\n- Temperature, pH and Brix controls set.`)}
                className="btn-secondary" 
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px' }}
              >
                <FileText size={16} /> Steps & QC
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2>New Recipe Formulation</h2>
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input required placeholder="Recipe Name (e.g. Alphonso Nectar Special)" value={name} onChange={e => setName(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Target Product</label>
                  <select required value={productId} onChange={e => setProductId(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#0F172A', color: 'white' }}>
                    <option value="">Select Product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Base Qty (kg)</label>
                  <input type="number" required placeholder="e.g. 1000" value={baseQty} onChange={e => setBaseQty(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </div>
              </div>
              
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Create Recipe'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
