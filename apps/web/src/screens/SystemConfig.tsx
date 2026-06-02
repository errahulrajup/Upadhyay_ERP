import React, { useState, useEffect } from 'react';
import { Database, Plus, RefreshCw } from 'lucide-react';
import { inventoryApi } from '../lib/bosApi';

export default function SystemConfig() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  
  // Form States
  const [newMaterial, setNewMaterial] = useState({ code: '', name: '', type: 'INGREDIENT', uom: 'kg' });
  const [newSupplier, setNewSupplier] = useState({ code: '', name: '', type: 'INGREDIENT_SUPPLIER' });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    setLoading(true);
    const [matRes, supRes] = await Promise.all([
      inventoryApi.getMaterials(),
      inventoryApi.getSuppliers()
    ]);
    if (matRes.data) setMaterials(matRes.data);
    if (supRes.data) setSuppliers(supRes.data);
    setLoading(false);
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.code || !newMaterial.name) return alert('Code and Name required');
    await inventoryApi.addMaterial({ ...newMaterial, status: 'ACTIVE' });
    setNewMaterial({ code: '', name: '', type: 'INGREDIENT', uom: 'kg' });
    loadMasterData();
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.code || !newSupplier.name) return alert('Code and Name required');
    await inventoryApi.addSupplier({ ...newSupplier, status: 'ACTIVE' });
    setNewSupplier({ code: '', name: '', type: 'INGREDIENT_SUPPLIER' });
    loadMasterData();
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={20} color="var(--primary-accent)" /> Dynamic Master Data (MDM)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Add new ingredients, packaging, and vendors to the database. These will instantly appear in all dropdowns.
          </p>
        </div>
        <button className="btn-secondary" onClick={loadMasterData} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={16} className={loading ? "spin" : ""} /> Refresh DB
        </button>
      </div>

      <div className="grid-2">
        {/* Add Material Panel */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Add New Material
          </h3>
          <form onSubmit={handleAddMaterial}>
            <div className="grid-2" style={{ gap: '12px', marginBottom: '12px' }}>
              <div className="form-group">
                <label>Material Code</label>
                <input required className="form-control" placeholder="e.g. RM-004" value={newMaterial.code} onChange={e => setNewMaterial({...newMaterial, code: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Material Name</label>
                <input required className="form-control" placeholder="e.g. Mango Pulp" value={newMaterial.name} onChange={e => setNewMaterial({...newMaterial, name: e.target.value})} />
              </div>
            </div>
            <div className="grid-2" style={{ gap: '12px', marginBottom: '16px' }}>
              <div className="form-group">
                <label>Type</label>
                <select className="form-control" value={newMaterial.type} onChange={e => setNewMaterial({...newMaterial, type: e.target.value})}>
                  <option value="INGREDIENT">Ingredient</option>
                  <option value="PACKAGING">Packaging</option>
                  <option value="CHEMICAL">Chemical</option>
                </select>
              </div>
              <div className="form-group">
                <label>Unit of Measure (UOM)</label>
                <select className="form-control" value={newMaterial.uom} onChange={e => setNewMaterial({...newMaterial, uom: e.target.value})}>
                  <option value="kg">kg</option>
                  <option value="L">Liters</option>
                  <option value="pcs">Pieces</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Save Material</button>
          </form>

          <div style={{ marginTop: '24px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
            <h4 style={{ marginBottom: '12px', color: 'var(--text-muted)' }}>Current Database ({materials.length})</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {materials.length === 0 ? <span style={{ color: '#F87171', fontSize: '12px' }}>Empty! Add a material above.</span> : null}
              {materials.map(m => (
                <span key={m.id} className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {m.code} - {m.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Add Supplier Panel */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Add New Supplier
          </h3>
          <form onSubmit={handleAddSupplier}>
            <div className="grid-2" style={{ gap: '12px', marginBottom: '12px' }}>
              <div className="form-group">
                <label>Supplier Code</label>
                <input required className="form-control" placeholder="e.g. SUP-003" value={newSupplier.code} onChange={e => setNewSupplier({...newSupplier, code: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Supplier Name</label>
                <input required className="form-control" placeholder="e.g. Fresh Farms LLC" value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Supplier Type</label>
              <select className="form-control" value={newSupplier.type} onChange={e => setNewSupplier({...newSupplier, type: e.target.value})}>
                <option value="INGREDIENT_SUPPLIER">Ingredient Supplier</option>
                <option value="PACKAGING_SUPPLIER">Packaging Supplier</option>
                <option value="SERVICE_PROVIDER">Service Provider</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Save Supplier</button>
          </form>

          <div style={{ marginTop: '24px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
            <h4 style={{ marginBottom: '12px', color: 'var(--text-muted)' }}>Current Database ({suppliers.length})</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {suppliers.length === 0 ? <span style={{ color: '#F87171', fontSize: '12px' }}>Empty! Add a supplier above.</span> : null}
              {suppliers.map(s => (
                <span key={s.id} className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {s.code} - {s.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
