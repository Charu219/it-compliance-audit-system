import React, { useState, useEffect } from 'react';
import { getChecklists, createChecklist, deleteChecklist, getAudits } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

const emptyForm = { title: '', description: '', category: '', assignedDepartment: '', priority: 'medium', dueDate: '', audit: '' };

export default function AdminChecklists() {
  const [items, setItems] = useState([]);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filterAudit, setFilterAudit] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getChecklists().then(r => setItems(r.data)),
      getAudits().then(r => setAudits(r.data))
    ]).finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const res = await createChecklist(form);
      setItems([res.data, ...items]);
      setModal(false); setForm(emptyForm);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this checklist item?')) return;
    await deleteChecklist(id);
    setItems(items.filter(i => i._id !== id));
  };

  const filtered = filterAudit ? items.filter(i => i.audit?._id === filterAudit) : items;

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div><h1>✅ Checklists</h1><p>Manage compliance checklist items</p></div>
          <button className="btn btn-primary" onClick={() => { setModal(true); setForm(emptyForm); setError(''); }}>+ Add Item</button>
        </div>
      </div>

      <div className="page-content">
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <select className="form-control" style={{ width: 280 }} value={filterAudit} onChange={e => setFilterAudit(e.target.value)}>
            <option value="">All Audits</option>
            {audits.map(a => <option key={a._id} value={a._id}>{a.title}</option>)}
          </select>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} items</span>
        </div>

        {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Department</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Audit</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8}><div className="empty-state"><div className="empty-icon">✅</div><h3>No checklist items</h3><p>Add items to start your compliance review</p></div></td></tr>
                ) : filtered.map(item => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.description?.slice(0, 40)}</div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.category}</td>
                    <td style={{ fontSize: 12 }}>{item.assignedDepartment}</td>
                    <td><span className={`badge badge-${item.priority}`}>{item.priority}</span></td>
                    <td><StatusBadge status={item.status} /></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.audit?.title?.slice(0,30)}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '—'}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Add Checklist Item</h3>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-group">
                  <label className="form-label">Audit *</label>
                  <select className="form-control" name="audit" value={form.audit} onChange={handleChange} required>
                    <option value="">Select Audit</option>
                    {audits.map(a => <option key={a._id} value={a._id}>{a.title}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-control" name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Data Encryption Policy" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" name="description" value={form.description} onChange={handleChange} placeholder="Describe what needs to be verified..." />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <input className="form-control" name="category" value={form.category} onChange={handleChange} required placeholder="e.g. Access Control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assigned Department *</label>
                    <input className="form-control" name="assignedDepartment" value={form.assignedDepartment} onChange={handleChange} required placeholder="e.g. IT, Finance, HR" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-control" name="priority" value={form.priority} onChange={handleChange}>
                      {['low','medium','high','critical'].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input className="form-control" type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
