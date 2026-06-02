import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import { qcApi } from '../../lib/bosApi';
import { Plus } from 'lucide-react';

interface RecipeQcConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeId: string;
  recipeName: string;
}

export default function RecipeQcConfigModal({ isOpen, onClose, recipeId, recipeName }: RecipeQcConfigModalProps) {
  const [params, setParams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newParam, setNewParam] = useState({ name: '', min: '', max: '', uom: '' });

  useEffect(() => {
    if (isOpen && recipeId) {
      loadParams();
    }
  }, [isOpen, recipeId]);

  const loadParams = async () => {
    const { data } = await qcApi.getRecipeQcParams(recipeId);
    if (data) setParams(data);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParam.name || !newParam.min || !newParam.max) return;
    setLoading(true);
    await qcApi.saveRecipeQcParam({
      recipeId,
      parameterName: newParam.name,
      minValue: Number(newParam.min),
      maxValue: Number(newParam.max),
      uom: newParam.uom
    });
    setNewParam({ name: '', min: '', max: '', uom: '' });
    await loadParams();
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`QC Config: ${recipeName}`}>
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>Existing Parameters</h4>
        {params.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#F87171' }}>No QC parameters defined for this recipe.</p>
        ) : (
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Min</th>
                <th>Max</th>
                <th>UOM</th>
              </tr>
            </thead>
            <tbody>
              {params.map(p => (
                <tr key={p.id}>
                  <td>{p.parameter_name}</td>
                  <td>{p.min_value}</td>
                  <td>{p.max_value}</td>
                  <td>{p.uom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <form onSubmit={handleAdd} style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
        <h4 style={{ marginBottom: '16px' }}>Add New Parameter</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <input required placeholder="Param Name (e.g. pH)" value={newParam.name} onChange={e => setNewParam({...newParam, name: e.target.value})} className="form-control" />
          <input placeholder="UOM (e.g. %)" value={newParam.uom} onChange={e => setNewParam({...newParam, uom: e.target.value})} className="form-control" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <input required type="number" step="0.01" placeholder="Min Value" value={newParam.min} onChange={e => setNewParam({...newParam, min: e.target.value})} className="form-control" />
          <input required type="number" step="0.01" placeholder="Max Value" value={newParam.max} onChange={e => setNewParam({...newParam, max: e.target.value})} className="form-control" />
        </div>
        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> {loading ? 'Saving...' : 'Add Parameter'}
        </button>
      </form>
    </Modal>
  );
}
