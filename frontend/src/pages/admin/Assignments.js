import React, { useState, useEffect } from 'react';
import { getAssignments, createAssignment, deleteAssignment, getAudits, getUsers } from '../../services/api';

export default function AdminAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [audits, setAudits] = useState([]);
  const [auditors, setAuditors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ audit: '', auditor: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getAssignments().then(r => setAssignments(r.data)),
      getAudits().then(r => setAudits(r.data)),
      getUsers({ role: 'auditor' }).then(r => setAuditors(r.data))
    ]).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const res = await createAssignment(form);
      setAssignments([res.data, ...assignments.filter(a => !(a.audit?._id === form.audit && a.auditor?._id === form.auditor))]);
      setModal(false); setForm({ audit: '', auditor: '', notes: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this assignment?')) return;
    await deleteAssignment(id);
    setAssignments(assignments.filter(a => a._id !== id));
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div><h1>👥 Assignments</h1><p>Assign auditors to audits</p></div>
          <button className="btn btn-primary" onClick={() => { setModal(true); setError(''); }}>+ Assign Auditor</button>
        </div>
      </div>

      <div className="page-content">
        {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Auditor</th><th>Audit</th><th>Notes</th><th>Assigned Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {assignments.length === 0 ? (
                  <tr><td colSpan={5}><div className="empty-state"><div className="empty-icon">👥</div><h3>No assignments yet</h3><p>Assign auditors to audits to begin</p></div></td></tr>
                ) : assignments.map(a => (
                  <tr key={a._id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{a.auditor?.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.auditor?.email}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>{a.audit?.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.audit?.status}</div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 200 }}>{a.notes || '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(a._id)}>Remove</button></td>
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
              <h3>Assign Auditor to Audit</h3>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-group">
                  <label className="form-label">Select Audit *</label>
                  <select className="form-control" value={form.audit} onChange={e => setForm({...form, audit: e.target.value})} required>
                    <option value="">Choose an audit...</option>
                    {audits.map(a => <option key={a._id} value={a._id}>{a.title}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Select Auditor *</label>
                  <select className="form-control" value={form.auditor} onChange={e => setForm({...form, auditor: e.target.value})} required>
                    <option value="">Choose an auditor...</option>
                    {auditors.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-control" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Any special instructions..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Assigning...' : 'Assign'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
