import React, { useState, useEffect } from 'react';
import { FileText, Plus, ShoppingCart } from 'lucide-react';
import { financeApi } from '../../lib/bosApi';

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const res = await financeApi.getPurchaseOrders();
    if (res.data) setOrders(res.data);
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
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                <td>{po.supplier_id}</td>
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
    </div>
  );
}
