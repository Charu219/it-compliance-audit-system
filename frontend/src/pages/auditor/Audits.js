import React, { useState, useEffect } from 'react';
import { getAudits } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export default function AuditorAudits() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getAudits().then(r => setAudits(r.data)).finally(() => setLoading(false)); }, []);

  return (
    <div>
      <div className="page-header">
        <h1>🔍 My Assigned Audits</h1>
        <p>Audits you have been assigned to review</p>
      </div>
      <div className="page-content">
        {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Title</th><th>Framework</th><th>Status</th><th>Start Date</th><th>End Date</th><th>Created By</th></tr></thead>
              <tbody>
                {audits.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">🔍</div><h3>No audits assigned</h3><p>Contact your admin to be assigned to an audit</p></div></td></tr>
                ) : audits.map(audit => (
                  <tr key={audit._id}>
                    <td><div style={{ fontWeight: 500 }}>{audit.title}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{audit.description?.slice(0,50)}</div></td>
                    <td><span className="badge badge-in-progress" style={{ fontSize: 11 }}>{audit.framework}</span></td>
                    <td><StatusBadge status={audit.status} /></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{audit.startDate ? new Date(audit.startDate).toLocaleDateString() : '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{audit.endDate ? new Date(audit.endDate).toLocaleDateString() : '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{audit.createdBy?.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
