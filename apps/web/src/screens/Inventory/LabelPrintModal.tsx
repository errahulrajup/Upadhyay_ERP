import React from 'react';
import Modal from '../../components/ui/Modal';
import { QRCodeSVG } from 'qrcode.react';
import { Printer } from 'lucide-react';

interface LabelPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  lotNo: string;
  materialName: string;
  qty: string | number;
  expiry: string;
  type: 'RM' | 'FG';
}

export default function LabelPrintModal({ isOpen, onClose, lotNo, materialName, qty, expiry, type }: LabelPrintModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    // In a real app, we'd use window.print() and hide the rest of the UI via CSS media queries,
    // or generate a PDF. For prototype, we'll just show an alert.
    alert('Sending label to Zebra/Barcode printer...');
    onClose();
  };

  const qrData = JSON.stringify({ lot: lotNo, mat: materialName, qty, exp: expiry });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Print Lot Label">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '16px' }}>
        
        {/* Mock Label Preview */}
        <div style={{ 
          background: 'white', 
          color: 'black', 
          padding: '24px', 
          borderRadius: '8px',
          width: '300px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}>
          <div style={{ textAlign: 'center', width: '100%', borderBottom: '2px solid black', paddingBottom: '8px', fontWeight: 'bold' }}>
            UPADHYAY ERP - {type} LABEL
          </div>
          
          <QRCodeSVG value={qrData} size={150} level="H" />
          
          <div style={{ width: '100%', fontSize: '14px', fontFamily: 'monospace' }}>
            <p style={{ margin: '4px 0' }}><strong>LOT:</strong> {lotNo}</p>
            <p style={{ margin: '4px 0' }}><strong>ITEM:</strong> {materialName}</p>
            <p style={{ margin: '4px 0' }}><strong>QTY:</strong> {qty} kg/L</p>
            <p style={{ margin: '4px 0' }}><strong>EXP:</strong> {expiry || 'N/A'}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'center' }}>
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handlePrint} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={16} /> Print Label
          </button>
        </div>
      </div>
    </Modal>
  );
}
