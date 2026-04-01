import React, { useState, useEffect } from 'react';
import { getAudits, createAudit, updateAudit, deleteAudit } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

const emptyForm = { title: '', description: '', framework: 'ISO 27001', status: 'draft', startDate: '', endDate: '', departments: [] };

export default function AdminAudits() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editAudit, setEditAudit] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchAudits(); }, []);

  const fetchAudits = async () => {
    try {
      const res = await getAudits();
      setAudits(res.data);
    } finally { setLoading(false); }
  };

  const openCreate = () => { setEditAudit(null); setForm(emptyForm); setModal(true); setError(''); };
  const openEdit = (a) => { setEditAudit(a); setForm({ ...a, startDate: a.startDate?.slice(0,10) || '', endDate: a.endDate?.slice(0,10) || '' }); setModal(true); setError(''); };
  const closeModal = () => { setModal(false); setEditAudit(null); };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editAudit) {
        await updateAudit(editAudit._id, form);
      } else {
        await createAudit(form);
      }
      fetchAudits(); closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save audit');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this audit and all its checklists?')) return;
    await deleteAudit(id);
    setAudits(audits.filter(a => a._id !== id));
  };

  const filtered = audits.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.framework.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1>🔍 Audits</h1>
            <p>Manage all compliance audits</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ New Audit</button>
        </div>
      </div>

      <div className="page-content">
        <div style={{ marginBottom: 16 }}>
          <div className="search-bar">
            <span className="search-icon">🔎</span>
            <input placeholder="Search audits..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Audit Title</th>
                  <th>Framework</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">📋</div><h3>No audits found</h3><p>Create your first audit to get started</p></div></td></tr>
                ) : filtered.map(audit => (
                  <tr key={audit._id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{audit.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{audit.description?.slice(0, 50)}{audit.description?.length > 50 ? '...' : ''}</div>
                    </td>
                    <td><span className="badge badge-in-progress" style={{ fontSize: 11 }}>{audit.framework}</span></td>
                    <td><StatusBadge status={audit.status} /></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{audit.createdBy?.name}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{audit.startDate ? new Date(audit.startDate).toLocaleDateString() : '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{audit.endDate ? new Date(audit.endDate).toLocaleDateString() : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(audit)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(audit._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editAudit ? 'Edit Audit' : 'Create New Audit'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-group">
                  <label className="form-label">Audit Title *</label>
                  <input className="form-control" name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Annual ISO 27001 Audit 2024" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" name="description" value={form.description} onChange={handleChange} placeholder="Brief description of this audit..." />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Framework *</label>
                    <select className="form-control" name="framework" value={form.framework} onChange={handleChange}>
                      {['ISO 27001','SOC 2','HIPAA','GDPR','PCI DSS','NIST','Custom'].map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-control" name="status" value={form.status} onChange={handleChange}>
                      {['draft','active','in-review','completed','archived'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input className="form-control" type="date" name="startDate" value={form.startDate} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input className="form-control" type="date" name="endDate" value={form.endDate} onChange={handleChange} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editAudit ? 'Update' : 'Create Audit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
