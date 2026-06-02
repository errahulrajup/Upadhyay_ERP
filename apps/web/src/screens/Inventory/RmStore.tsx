import React, { useState, useEffect } from 'react';
import { Package, MapPin, ArrowRightLeft, Printer, Scale } from 'lucide-react';
import { inventoryApi } from '../../lib/bosApi';
import StockTransferModal from './StockTransferModal';
import LabelPrintModal from './LabelPrintModal';
import StockAuditModal from './StockAuditModal';

export default function RmStore() {
  const [lots, setLots] = useState<any[]>([]);
  const [selectedTransferLot, setSelectedTransferLot] = useState<any>(null);
  const [selectedPrintLot, setSelectedPrintLot] = useState<any>(null);
  const [selectedAuditLot, setSelectedAuditLot] = useState<any>(null);

  useEffect(() => {
    loadLots();
  }, []);

  const loadLots = async () => {
    const res = await inventoryApi.getRmLots();
    if (res.data) setLots(res.data);
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Raw Material Store</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Manage RM lots and physical locations.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowRightLeft size={18} /> Transfer Stock
        </button>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Lot Number</th>
              <th>Material</th>
              <th>Quantity</th>
              <th>Location</th>
              <th>Expiry</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lots.map(l => (
              <tr key={l.id}>
                <td><strong>{l.lot_no}</strong></td>
                <td>{l.ingredient}</td>
                <td>{l.qty} kg</td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <MapPin size={14} /> {l.location || 'Unassigned'}
                  </span>
                </td>
                <td>{l.expiry}</td>
                <td>
                  <span className={`status-badge ${l.status === 'APPROVED' ? 'status-approved' : 'status-quarantine'}`}>
                    {l.status}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-secondary" onClick={() => setSelectedPrintLot(l)} style={{ fontSize: '12px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Printer size={14} /> Print
                  </button>
                  <button className="btn-secondary" onClick={() => setSelectedAuditLot(l)} style={{ fontSize: '12px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Scale size={14} /> Audit
                  </button>
                  <button className="btn-secondary" onClick={() => setSelectedTransferLot(l)} style={{ fontSize: '12px', padding: '4px 8px' }}>
                    Transfer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTransferLot && (
        <StockTransferModal
          isOpen={true}
          onClose={() => setSelectedTransferLot(null)}
          onSuccess={loadLots}
          lotId={selectedTransferLot.id}
          lotNo={selectedTransferLot.lot_no}
          lotType="RM"
          currentLocation={selectedTransferLot.location}
        />
      )}

      {selectedPrintLot && (
        <LabelPrintModal
          isOpen={true}
          onClose={() => setSelectedPrintLot(null)}
          lotNo={selectedPrintLot.lot_no}
          materialName={selectedPrintLot.ingredient}
          qty={selectedPrintLot.qty}
          expiry={selectedPrintLot.expiry}
          type="RM"
        />
      )}

      {selectedAuditLot && (
        <StockAuditModal
          isOpen={true}
          onClose={() => setSelectedAuditLot(null)}
          onSuccess={loadLots}
          lotId={selectedAuditLot.id}
          lotNo={selectedAuditLot.lot_no}
          lotType="RM"
          currentQty={selectedAuditLot.qty}
        />
      )}
    </div>
  );
}
