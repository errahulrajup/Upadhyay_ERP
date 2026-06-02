import React, { useEffect, useState } from 'react';
import { complianceApi, inventoryApi } from '../../lib/bosApi';
import { ShieldAlert, Plus } from 'lucide-react';
import Modal from '../../components/ui/Modal';

export default function AllergenMatrix() {
  const [allergens, setAllergens] = useState<any[]>([]);
  const [productAllergens, setProductAllergens] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedAllergen, setSelectedAllergen] = useState('');
  const [riskType, setRiskType] = useState('CONTAINS');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [algRes, pAlgRes, prodRes] = await Promise.all([
      complianceApi.getAllergens(),
      complianceApi.getProductAllergens(),
      inventoryApi.getMaterials()
    ]);
    if (algRes.data) setAllergens(algRes.data);
    if (pAlgRes.data) setProductAllergens(pAlgRes.data);
    // Filter only FINISHED_GOODS or products
    if (prodRes.data) {
      setProducts(prodRes.data.filter((m: any) => m.type === 'FINISHED_GOOD'));
    }
    setLoading(false);
  };

  const handleMap = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await complianceApi.mapProductAllergen({
      productId: selectedProduct,
      allergenId: selectedAllergen,
      riskType
    });
    setSaving(false);
    setIsModalOpen(false);
    loadData();
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Allergen Matrix</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>FSSAI compliance: Track and map allergens to products.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Map Allergen
        </button>
      </div>

      {loading ? (
        <p>Loading Allergen Data...</p>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Allergen Profile</th>
                <th>Severity</th>
                <th>Risk Type</th>
              </tr>
            </thead>
            <tbody>
              {productAllergens.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No allergens mapped yet.</td>
                </tr>
              ) : (
                productAllergens.map((pa) => (
                  <tr key={pa.id}>
                    <td><strong>{pa.materials?.name || 'Unknown Product'}</strong></td>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldAlert size={16} color={pa.allergens?.severity === 'CRITICAL' ? '#DC2626' : '#F59E0B'} />
                      {pa.allergens?.name}
                    </td>
                    <td>
                      <span className={`badge ${pa.allergens?.severity === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}`}>
                        {pa.allergens?.severity}
                      </span>
                    </td>
                    <td>{pa.risk_type.replace(/_/g, ' ')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Map Product Allergen">
        <form onSubmit={handleMap} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Finished Good / Product</label>
            <select 
              required
              value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#0F172A', color: 'white' }}
            >
              <option value="">Select Product...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Allergen</label>
            <select 
              required
              value={selectedAllergen} onChange={e => setSelectedAllergen(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#0F172A', color: 'white' }}
            >
              <option value="">Select Allergen...</option>
              {allergens.map(a => <option key={a.id} value={a.id}>{a.name} ({a.severity})</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Risk Type</label>
            <select 
              required
              value={riskType} onChange={e => setRiskType(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#0F172A', color: 'white' }}
            >
              <option value="CONTAINS">Contains (Direct Ingredient)</option>
              <option value="MAY_CONTAIN">May Contain (Cross Contamination)</option>
              <option value="PRODUCED_IN_SAME_FACILITY">Produced in Same Facility</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Mapping'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
