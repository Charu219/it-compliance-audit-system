import React, { useState, useEffect } from 'react';
import { getChecklists, getResults } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export default function DepartmentTasks() {
  const [items, setItems] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([
      getChecklists().then(r => setItems(r.data)),
      getResults().then(r => setResults(r.data))
    ]).finally(() => setLoading(false));
  }, []);

  const getResult = (checklistId) => results.find(r => r.checklist?._id === checklistId || r.checklist === checklistId);

  return (
    <div>
      <div className="page-header">
        <h1>📋 My Compliance Tasks</h1>
        <p>Review your assigned checklist items and auditor feedback</p>
      </div>
      <div className="page-content">
        {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
            <div>
              {items.length === 0 ? (
                <div className="empty-state card"><div className="empty-icon">📋</div><h3>No tasks assigned yet</h3><p>Your admin will assign compliance items to your department</p></div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead><tr><th>Task</th><th>Category</th><th>Priority</th><th>Status</th><th>Audit</th><th>Due Date</th></tr></thead>
                    <tbody>
                      {items.map(item => {
                        const result = getResult(item._id);
                        return (
                          <tr key={item._id} style={{ cursor: 'pointer' }} onClick={() => setSelected({ item, result })}>
                            <td>
                              <div style={{ fontWeight: 500, fontSize: 13 }}>{item.title}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.description?.slice(0,40)}</div>
                            </td>
                            <td style={{ fontSize: 12 }}>{item.category}</td>
                            <td><span className={`badge badge-${item.priority}`}>{item.priority}</span></td>
                            <td><StatusBadge status={item.status} /></td>
                            <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.audit?.title?.slice(0,25)}</td>
                            <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Detail panel */}
            <div>
              {!selected ? (
                <div className="card"><div className="empty-state"><div className="empty-icon">👈</div><h3>Click a task to view details</h3></div></div>
              ) : (
                <div className="card">
                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{selected.item.title}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>{selected.item.description || 'No description provided.'}</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                      <span className="badge badge-in-progress">{selected.item.category}</span>
                      <span className={`badge badge-${selected.item.priority}`}>{selected.item.priority}</span>
                      <StatusBadge status={selected.item.status} />
                    </div>
                    {selected.item.dueDate && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>📅 Due: {new Date(selected.item.dueDate).toLocaleDateString()}</div>
                    )}
                  </div>

                  {selected.result ? (
                    <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 14, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Auditor Review</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <StatusBadge status={selected.result.status} />
                        {selected.result.score && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-blue)' }}>Score: {selected.result.score}/100</span>}
                      </div>
                      {selected.result.remarks && (
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Remarks:</div>
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{selected.result.remarks}</div>
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                        Reviewed by {selected.result.reviewedBy?.name} • {new Date(selected.result.reviewedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 14, border: '1px solid var(--border)', textAlign: 'center' }}>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>⏳ Awaiting auditor review</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
