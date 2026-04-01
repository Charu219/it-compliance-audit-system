import React, { useState, useEffect } from 'react';
import { getChecklists, getAudits, getEvidence, saveResult, getResultByChecklist } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export default function AuditorReview() {
  const [audits, setAudits] = useState([]);
  const [selectedAudit, setSelectedAudit] = useState('');
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({ status: 'pending', remarks: '', score: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => { getAudits().then(r => setAudits(r.data)); }, []);

  useEffect(() => {
    if (!selectedAudit) return;
    setLoading(true);
    getChecklists({ auditId: selectedAudit }).then(r => setChecklists(r.data)).finally(() => setLoading(false));
  }, [selectedAudit]);

  const selectItem = async (item) => {
    setSelected(item);
    setSuccess('');
    const [ev, res] = await Promise.all([
      getEvidence({ checklistId: item._id }),
      getResultByChecklist(item._id)
    ]);
    setEvidence(ev.data);
    setResult(res.data);
    setForm({ status: res.data?.status || 'pending', remarks: res.data?.remarks || '', score: res.data?.score || '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setSuccess('');
    try {
      await saveResult({ checklistId: selected._id, auditId: selectedAudit, status: form.status, remarks: form.remarks, score: form.score ? Number(form.score) : undefined });
      // Update checklist status in local state
      setChecklists(checklists.map(c => c._id === selected._id ? { ...c, status: form.status } : c));
      setSelected({ ...selected, status: form.status });
      setSuccess('Review saved successfully!');
    } finally { setSaving(false); }
  };

  const getFileIcon = (name) => {
    const ext = name?.split('.').pop()?.toLowerCase();
    if (['jpg','jpeg','png','gif'].includes(ext)) return '🖼️';
    if (ext === 'pdf') return '📄';
    if (['doc','docx'].includes(ext)) return '📝';
    if (['xls','xlsx'].includes(ext)) return '📊';
    return '📎';
  };

  return (
    <div>
      <div className="page-header">
        <h1>📋 Review Compliance Items</h1>
        <p>Review checklists, examine evidence, and update compliance status</p>
      </div>

      <div className="page-content">
        <div style={{ marginBottom: 16 }}>
          <select className="form-control" style={{ maxWidth: 360 }} value={selectedAudit} onChange={e => { setSelectedAudit(e.target.value); setSelected(null); }}>
            <option value="">Select an audit to review...</option>
            {audits.map(a => <option key={a._id} value={a._id}>{a.title}</option>)}
          </select>
        </div>

        {!selectedAudit && <div className="empty-state"><div className="empty-icon">🔍</div><h3>Select an audit to start reviewing</h3></div>}

        {selectedAudit && (
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
            {/* Checklist sidebar */}
            <div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Checklist Items</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{checklists.length} items</div>
                </div>
                {loading ? <div className="loading-spinner" style={{ padding: 30 }}><div className="spinner"></div></div> : (
                  <div style={{ maxHeight: 600, overflowY: 'auto' }}>
                    {checklists.length === 0 ? (
                      <div className="empty-state" style={{ padding: 24 }}><p>No items in this audit</p></div>
                    ) : checklists.map(item => (
                      <div key={item._id}
                        onClick={() => selectItem(item)}
                        style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: selected?._id === item._id ? 'var(--bg-hover)' : 'transparent', borderLeft: selected?._id === item._id ? '3px solid var(--accent-blue)' : '3px solid transparent', transition: 'all 0.15s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 3 }}>{item.title}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.category} • {item.assignedDepartment}</div>
                          </div>
                          <StatusBadge status={item.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Review panel */}
            <div>
              {!selected ? (
                <div className="card"><div className="empty-state"><div className="empty-icon">👈</div><h3>Select a checklist item</h3><p>Click an item on the left to review it</p></div></div>
              ) : (
                <>
                  <div className="card" style={{ marginBottom: 16 }}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{selected.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>{selected.description}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span className="badge badge-in-progress" style={{ fontSize: 11 }}>{selected.category}</span>
                        <span className="badge badge-department" style={{ fontSize: 11 }}>{selected.assignedDepartment}</span>
                        <span className={`badge badge-${selected.priority}`}>{selected.priority} priority</span>
                        {selected.dueDate && <span className="badge badge-draft" style={{ fontSize: 11 }}>Due: {new Date(selected.dueDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Evidence */}
                  <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-header">
                      <div className="card-title">📎 Uploaded Evidence ({evidence.length})</div>
                    </div>
                    {evidence.length === 0 ? (
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No evidence uploaded yet</div>
                    ) : evidence.map(ev => (
                      <div key={ev._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 20 }}>{getFileIcon(ev.originalName)}</span>
                        <div style={{ flex: 1 }}>
                          <a href={`http://localhost:5000${ev.filePath}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', fontSize: 13, textDecoration: 'none' }}>{ev.originalName}</a>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            {ev.uploadedBy?.name} • {(ev.fileSize / 1024).toFixed(1)} KB • {new Date(ev.uploadedAt).toLocaleDateString()}
                          </div>
                          {ev.description && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{ev.description}</div>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Review form */}
                  <div className="card">
                    <div className="card-header"><div className="card-title">✍️ Auditor Review</div></div>
                    {success && <div className="alert alert-success">✅ {success}</div>}
                    <form onSubmit={handleSubmit}>
                      <div className="form-group">
                        <label className="form-label">Compliance Status *</label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {['pending','in-progress','compliant','non-compliant','na'].map(s => (
                            <button key={s} type="button"
                              className={`btn ${form.status === s ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                              onClick={() => setForm({...form, status: s})}
                              style={{ textTransform: 'capitalize' }}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Remarks / Comments</label>
                        <textarea className="form-control" value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} placeholder="Add your review notes, findings, or recommendations..." rows={4} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Score (0-100)</label>
                        <input className="form-control" type="number" min="0" max="100" value={form.score} onChange={e => setForm({...form, score: e.target.value})} placeholder="Optional compliance score" style={{ maxWidth: 150 }} />
                      </div>
                      <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : '💾 Save Review'}</button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
