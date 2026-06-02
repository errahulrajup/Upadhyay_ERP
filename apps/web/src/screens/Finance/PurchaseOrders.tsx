import React, { useState, useEffect } from 'react';
import { FileText, Plus, ShoppingCart, X } from 'lucide-react';
import { financeApi, inventoryApi } from '../../lib/bosApi';
import { supabase } from '../../lib/supabase';

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [newPo, setNewPo] = useState({ supplierId: '', totalAmount: 0, expectedDelivery: '' });

  useEffect(() => {
    loadOrders();
    loadSuppliers();
  }, []);

  const loadOrders = async () => {
    const res = await financeApi.getPurchaseOrders();
    // Join supplier names
    if (res.data) {
      const { data: sups } = await supabase.from('suppliers').select('id, name');
      const supMap = Object.fromEntries((sups || []).map((s: any) => [s.id, s.name]));
      setOrders(res.data.map((po: any) => ({ ...po, supplier_name: supMap[po.supplier_id] || po.supplier_id })));
    }
  };

  const loadSuppliers = async () => {
    const res = await inventoryApi.getSuppliers();
    if (res.data) setSuppliers(res.data);
  };

  const handleCreatePo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPo.supplierId || newPo.totalAmount <= 0) return alert('Invalid PO data');
    await financeApi.createPurchaseOrder(newPo);
    setIsModalOpen(false);
    loadOrders(); // Refresh table
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCart size={24} color="var(--primary-accent)" /> Purchase Orders
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Manage POs sent to suppliers.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Create PO
        </button>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Supplier</th>
              <th>Expected Delivery</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(po => (
              <tr key={po.id}>
                <td><strong>{po.po_number}</strong></td>
                <td>{po.supplier_name || po.supplier_id}</td>
                <td>{po.expected_delivery}</td>
                <td>₹{po.total_amount?.toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${po.status === 'APPROVED' ? 'status-approved' : 'status-quarantine'}`}>
                    {po.status}
                  </span>
                </td>
                <td>
                  <button className="btn-secondary" style={{ padding: '4px 8px' }}><FileText size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create PO Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2>Create Purchase Order</h2>
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreatePo}>
              <div className="form-group">
                <label>Supplier</label>
                <select required className="form-control" value={newPo.supplierId} onChange={e => setNewPo({...newPo, supplierId: e.target.value})}>
                  <option value="">Select a supplier...</option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                  ))}
                </select>
                {suppliers.length === 0 && <span style={{fontSize: '12px', color: '#F87171'}}>No dynamic suppliers found. Add one in Settings &gt; Master Data.</span>}
              </div>
              <div className="form-group">
                <label>Expected Delivery Date</label>
                <input required type="date" className="form-control" value={newPo.expectedDelivery} onChange={e => setNewPo({...newPo, expectedDelivery: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Total Amount (₹)</label>
                <input required type="number" min="1" className="form-control" value={newPo.totalAmount} onChange={e => setNewPo({...newPo, totalAmount: Number(e.target.value)})} />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px' }}>Submit & Approve PO</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
