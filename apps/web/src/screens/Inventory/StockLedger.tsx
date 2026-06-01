import React, { useEffect, useState } from 'react';
import { inventoryApi } from '../../lib/bosApi';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function StockLedger() {
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLedger();
  }, []);

  const loadLedger = async () => {
    setLoading(true);
    const { data } = await inventoryApi.getStockLedger();
    if (data) setTxns(data);
    setLoading(false);
  };

  return (
    <div className="animate-in">
      <div style={{ marginBottom: '24px' }}>
        <h1>Stock Ledger (Audit Trail)</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Immutable ledger of all inventory IN/OUT movements.</p>
      </div>

      {loading ? (
        <p>Loading Ledger...</p>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: 'var(--glass-border)' }}>
                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Date</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Type</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Lot Number</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Qty</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Reference</th>
              </tr>
            </thead>
            <tbody>
              {txns.map(tx => (
                <tr key={tx.id} style={{ borderBottom: 'var(--glass-border)' }}>
                  <td style={{ padding: '16px' }}>{tx.date}</td>
                  <td style={{ padding: '16px' }}>
                    {tx.type === 'IN' ? (
                      <span style={{ color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                        <ArrowDownRight size={16} /> IN
                      </span>
                    ) : (
                      <span style={{ color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                        <ArrowUpRight size={16} /> OUT
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{tx.lot_no}</td>
                  <td style={{ padding: '16px', fontWeight: 'bold' }}>{tx.qty}</td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{tx.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
