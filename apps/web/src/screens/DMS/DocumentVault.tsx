import React, { useState, useEffect } from 'react';
import { Folder, FileText, Upload, Download } from 'lucide-react';
import { dmsApi } from '../../lib/bosApi';

export default function DocumentVault() {
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    const res = await dmsApi.getDocuments();
    if (res.data) setDocuments(res.data);
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Folder size={24} color="var(--primary-accent)" /> Document Vault
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Central repository for compliance and operational files.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Upload size={18} /> Upload File
        </button>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Department</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => (
              <tr key={doc.id}>
                <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} color="var(--text-muted)" />
                  <strong>{doc.title}</strong>
                </td>
                <td><span className="badge">{doc.document_type}</span></td>
                <td>{doc.department}</td>
                <td>{doc.valid_until}</td>
                <td>
                  <span className={`status-badge ${doc.status === 'ACTIVE' ? 'status-approved' : 'status-quarantine'}`}>
                    {doc.status}
                  </span>
                </td>
                <td>
                  <button className="btn-secondary" style={{ padding: '4px 8px' }}><Download size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
