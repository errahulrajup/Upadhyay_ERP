import React, { useState } from 'react';
import { traceabilityApi } from '../../lib/bosApi';
import { Search, ArrowDown } from 'lucide-react';

export default function TraceabilityTree() {
  const [lotNo, setLotNo] = useState('');
  const [treeData, setTreeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    if (!lotNo) return;
    setLoading(true);
    setNotFound(false);
    setTreeData(null);
    const { data } = await traceabilityApi.getTraceabilityTree(lotNo);
    if (data) setTreeData(data);
    else setNotFound(true);
    setLoading(false);
  };

  // Recursive component to render tree nodes
  const TreeNode = ({ node }: { node: any }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div 
        className="card" 
        style={{ 
          border: node.type === 'FG' ? '2px solid var(--primary-accent)' : 
                  node.type === 'BATCH' ? '2px solid var(--warning-color)' : 
                  node.type === 'RM' ? '2px solid #3b82f6' : '2px solid var(--success-color)',
          padding: '16px',
          width: '300px',
          textAlign: 'center'
        }}
      >
        <span className="badge badge-success" style={{ marginBottom: '8px' }}>{node.type}</span>
        <h4 style={{ color: 'var(--text-main)', margin: 0 }}>{node.label}</h4>
      </div>
      
      {node.parents && node.parents.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ArrowDown size={24} color="var(--text-muted)" style={{ margin: '16px 0' }} />
          <div style={{ display: 'flex', gap: '32px' }}>
            {node.parents.map((p: any) => (
              <TreeNode key={p.id} node={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-in">
      <div style={{ marginBottom: '24px' }}>
        <h1>End-to-End Traceability Explorer</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Visually trace any Finished Good lot back to its raw material source.</p>
      </div>

      <div className="card" style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <input 
          type="text" 
          placeholder="Enter FG Lot Number (e.g. FG-BAT-405)..."
          value={lotNo}
          onChange={(e) => setLotNo(e.target.value)}
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
        />
        <button className="btn-primary" onClick={handleSearch} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={18} /> {loading ? 'Tracing...' : 'Trace Ancestry'}
        </button>
      </div>

      {treeData && (
        <div style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: 'var(--glass-border)', overflowX: 'auto' }}>
          <TreeNode node={treeData} />
        </div>
      )}
    </div>
  );
}
