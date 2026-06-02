import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Edit3 } from 'lucide-react';
import { rndApi } from '../../lib/bosApi';
import CreateTrialModal from './CreateTrialModal';

export default function LabNotebook() {
  const [trials, setTrials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadTrials();
  }, []);

  const loadTrials = async () => {
    setLoading(true);
    const { data } = await rndApi.getDraftRecipes();
    if (data) setTrials(data);
    setLoading(false);
  };
  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Lab Notebook</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Scientist logs and experimental formulations.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> New Entry
        </button>
      </div>

      {loading ? (
        <p>Loading experiments...</p>
      ) : trials.length === 0 ? (
        <div className="card">
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3>No Experiments Logged</h3>
            <p style={{ marginTop: '8px', fontSize: '14px' }}>Create a new notebook entry to track your R&D trials.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {trials.map(t => (
            <div key={t.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '16px', color: 'white' }}>{t.name}</h3>
                <span className="badge badge-warning" style={{ fontSize: '11px' }}>{t.status}</span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{t.objective || 'No objective defined.'}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>By: {t.author}</span>
                <button 
                  onClick={() => alert(`Experiment Notebook Entry\n\nName: ${t.name}\nScientist: ${t.author}\nStatus: ${t.status}\nObjective: ${t.objective}\nDate: ${new Date(t.created_at || Date.now()).toLocaleDateString()}`)}
                  className="btn-secondary" 
                  style={{ padding: '4px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Edit3 size={14} /> Open
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CreateTrialModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadTrials}
        />
      )}
    </div>
  );
}
