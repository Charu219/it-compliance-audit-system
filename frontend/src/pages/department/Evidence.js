import React, { useState, useEffect, useRef } from 'react';
import { getChecklists, getEvidence, uploadEvidence, deleteEvidence } from '../../services/api';

export default function DepartmentEvidence() {
  const [checklists, setChecklists] = useState([]);
  const [audits, setAudits] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState({ checklistId: '', auditId: '', description: '' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef();

 useEffect(() => {
  Promise.all([
    getChecklists().then(r => {
      const items = r.data;
      setChecklists(items);
      // Derive unique audits from the checklists (already filtered by dept)
      const auditMap = {};
      items.forEach(c => {
        if (c.audit && !auditMap[c.audit._id]) {
          auditMap[c.audit._id] = c.audit;
        }
      });
      setAudits(Object.values(auditMap));
    }),
    getEvidence().then(r => setEvidence(r.data))
  ]).finally(() => setLoading(false));
}, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a file');
    if (!form.checklistId || !form.auditId) return setError('Please select an audit and checklist item');
    setUploading(true); setError(''); setSuccess('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('checklistId', form.checklistId);
      formData.append('auditId', form.auditId);
      formData.append('description', form.description);
      const res = await uploadEvidence(formData);
      setEvidence([res.data, ...evidence]);
      setFile(null); setForm({ checklistId: '', auditId: '', description: '' });
      setSuccess('Evidence uploaded successfully!');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this evidence?')) return;
    await deleteEvidence(id);
    setEvidence(evidence.filter(e => e._id !== id));
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const getFileIcon = (name) => {
    const ext = name?.split('.').pop()?.toLowerCase();
    if (['jpg','jpeg','png','gif'].includes(ext)) return '🖼️';
    if (ext === 'pdf') return '📄';
    if (['doc','docx'].includes(ext)) return '📝';
    if (['xls','xlsx'].includes(ext)) return '📊';
    return '📎';
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredChecklists = form.auditId ? checklists.filter(c => c.audit?._id === form.auditId || c.audit === form.auditId) : checklists;

  return (
    <div>
      <div className="page-header">
        <h1>📎 Evidence Management</h1>
        <p>Upload and manage compliance evidence documents</p>
      </div>

      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 20 }}>
          {/* Upload form */}
          <div>
            <div className="card">
              <div className="card-header"><div className="card-title">Upload Evidence</div></div>

              {error && <div className="alert alert-error">⚠️ {error}</div>}
              {success && <div className="alert alert-success">✅ {success}</div>}

              <form onSubmit={handleUpload}>
                <div className="form-group">
                  <label className="form-label">Select Audit *</label>
                  <select className="form-control" value={form.auditId} onChange={e => setForm({...form, auditId: e.target.value, checklistId: ''})}>
                    <option value="">Choose audit...</option>
                    {audits.map(a => <option key={a._id} value={a._id}>{a.title}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Checklist Item *</label>
                  <select className="form-control" value={form.checklistId} onChange={e => setForm({...form, checklistId: e.target.value})}>
                    <option value="">Choose item...</option>
                    {filteredChecklists.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input className="form-control" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief description of this evidence..." />
                </div>

                <div className="form-group">
                  <label className="form-label">File *</label>
                  <div
                    className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}>
                    <div className="upload-icon">{file ? '✅' : '📁'}</div>
                    {file ? (
                      <p><strong>{file.name}</strong><br /><span style={{ fontSize: 11 }}>{formatSize(file.size)}</span></p>
                    ) : (
                      <p><strong>Click to browse</strong> or drag & drop<br /><span style={{ fontSize: 11 }}>PDF, DOC, XLS, Images, ZIP (max 10MB)</span></p>
                    )}
                  </div>
                  <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={uploading || !file}>
                  {uploading ? '⏳ Uploading...' : '⬆️ Upload Evidence'}
                </button>
              </form>
            </div>
          </div>

          {/* Evidence list */}
          <div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="card-title">My Uploaded Evidence</div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{evidence.length} files</span>
              </div>
              {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
                evidence.length === 0 ? (
                  <div className="empty-state"><div className="empty-icon">📎</div><h3>No evidence uploaded yet</h3><p>Start uploading evidence to support your compliance items</p></div>
                ) : (
                  <div>
                    {evidence.map(ev => (
                      <div key={ev._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}>
                        <span style={{ fontSize: 28 }}>{getFileIcon(ev.originalName)}</span>
                        <div style={{ flex: 1, overflow: 'hidden' }}>





                          <a href={`https://it-compliance-audit-system-2.onrender.com${ev.filePath}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                          </a>


                          


                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            {ev.checklist?.title} • {formatSize(ev.fileSize)} • {new Date(ev.uploadedAt).toLocaleDateString()}
                          </div>
                          {ev.description && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{ev.description}</div>}
                        </div>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ev._id)}>Delete</button>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
