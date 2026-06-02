import React, { useState, useEffect } from 'react';
import { Archive, Plus, MapPin } from 'lucide-react';
import { inventoryApi } from '../../lib/bosApi';
import AddGeneralItemModal from './AddGeneralItemModal';

export default function GeneralStore() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    const { data, error } = await inventoryApi.getGeneralItems();
    if (error) {
      alert(`Database Error: ${error.message}. Please run the 16_general_store_schema.sql script in Supabase!`);
    }
    if (data) setItems(data);
    setLoading(false);
  };
  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>General Store</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Manage packaging materials and engineering spares.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add Item
        </button>
      </div>

      {loading ? (
        <p>Loading items...</p>
      ) : items.length === 0 ? (
        <div className="card">
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Archive size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3>No Items Yet</h3>
            <p style={{ marginTop: '8px', fontSize: '14px' }}>Add your first packaging material or spare part.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.item_code}</strong></td>
                  <td>{item.name}</td>
                  <td><span className="badge badge-primary">{item.category}</span></td>
                  <td>{item.qty} {item.uom}</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <MapPin size={14} /> {item.location || 'Unassigned'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <AddGeneralItemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadItems}
        />
      )}
    </div>
  );
}
