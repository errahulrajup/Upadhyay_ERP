import React, { useState, useEffect } from 'react';
import { Folder, FileText, Upload, Download, X } from 'lucide-react';
import { dmsApi } from '../../lib/bosApi';

export default function DocumentVault() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('CERTIFICATE');
  const [department, setDepartment] = useState('QC');
  const [validUntil, setValidUntil] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    const res = await dmsApi.getDocuments();
    if (res.data) setDocuments(res.data);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await dmsApi.uploadDocument({
      title,
      documentType: docType,
      fileUrl: fileUrl || 'https://supabase.co/storage/v1/object/public/documents/placeholder.pdf',
      validUntil: validUntil || undefined,
      department
    });
    setLoading(false);
    if (error) {
      alert(`Error uploading: ${error.message}`);
    } else {
      setIsModalOpen(false);
      setTitle('');
      setValidUntil('');
      setFileUrl('');
      loadDocs();
    }
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
        <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                  <button 
                    className="btn-secondary" 
                    onClick={() => {
                      if (doc.file_url) window.open(doc.file_url, '_blank');
                      else alert('No URL specified for this file.');
                    }}
                    style={{ padding: '4px 8px' }}
                  >
                    <Download size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2>Upload Document</h2>
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input required placeholder="Document Title (e.g. ISO 22000 Certificate)" value={title} onChange={e => setTitle(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Document Type</label>
                  <select value={docType} onChange={e => setDocType(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#0F172A', color: 'white' }}>
                    <option value="CERTIFICATE">Certificate</option>
                    <option value="AUDIT_REPORT">Audit Report</option>
                    <option value="AGREEMENT">Agreement</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Department</label>
                  <select value={department} onChange={e => setDepartment(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#0F172A', color: 'white' }}>
                    <option value="Production">Production</option>
                    <option value="QC">QC</option>
                    <option value="FSMS">FSMS</option>
                    <option value="Logistics">Logistics</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>
              <input placeholder="File URL (Optional, defaults to mock link)" value={fileUrl} onChange={e => setFileUrl(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Valid Until</label>
                <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Uploading...' : 'Save Document'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
