import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { Beaker } from 'lucide-react';
import { productionApi } from '../../lib/bosApi';

interface PlanBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PlanBatchModal({ isOpen, onClose, onSuccess }: PlanBatchModalProps) {
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [recipeId, setRecipeId] = useState('');
  const [yieldQty, setYieldQty] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      productionApi.getRecipes().then(res => {
        if (res.data) setRecipes(res.data);
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    await productionApi.createBatch({
      recipeId,
      expectedYield: Number(yieldQty)
    });
    
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Plan Production Batch">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Master Recipe</label>
          <select 
            required
            value={recipeId}
            onChange={(e) => setRecipeId(e.target.value)}
            style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid var(--glass-border)', 
              background: '#0F172A', 
              color: 'white' 
            }}
          >
            <option value="">Select Recipe...</option>
            {recipes.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          {recipes.length === 0 && <span style={{fontSize: '12px', color: '#F87171'}}>No recipes found.</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Target Yield (kg/L)</label>
          <input 
            type="number" 
            required
            min="10"
            value={yieldQty}
            onChange={(e) => setYieldQty(e.target.value)}
            placeholder="e.g. 1000"
            style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid var(--glass-border)', 
              background: 'rgba(0,0,0,0.2)', 
              color: 'white' 
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Beaker size={16} />
            {loading ? 'Planning...' : 'Plan Batch'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
