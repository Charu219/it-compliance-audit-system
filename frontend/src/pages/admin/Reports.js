import React, { useState, useEffect } from 'react';
import { getAudits, getResults, getChecklists } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminReports() {
  const [audits, setAudits] = useState([]);
  const [selectedAudit, setSelectedAudit] = useState('');
  const [results, setResults] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { getAudits().then(r => setAudits(r.data)); }, []);

  useEffect(() => {
    if (!selectedAudit) return;
    setLoading(true);
    Promise.all([
      getResults({ auditId: selectedAudit }).then(r => setResults(r.data)),
      getChecklists({ auditId: selectedAudit }).then(r => setChecklists(r.data))
    ]).finally(() => setLoading(false));
  }, [selectedAudit]);

  const total = checklists.length;
  const compliant = checklists.filter(c => c.status === 'compliant').length;
  const nonCompliant = checklists.filter(c => c.status === 'non-compliant').length;
  const pending = checklists.filter(c => c.status === 'pending').length;
  const inProgress = checklists.filter(c => c.status === 'in-progress').length;
  const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 0;

  const categories = [...new Set(checklists.map(c => c.category))];
  const categoryData = categories.map(cat => {
    const catItems = checklists.filter(c => c.category === cat);
    return {
      name: cat,
      compliant: catItems.filter(c => c.status === 'compliant').length,
      nonCompliant: catItems.filter(c => c.status === 'non-compliant').length,
      pending: catItems.filter(c => c.status === 'pending').length,
    };
  });

  const departments = [...new Set(checklists.map(c => c.assignedDepartment))];
  const deptData = departments.map(dept => {
    const deptItems = checklists.filter(c => c.assignedDepartment === dept);
    const comp = deptItems.filter(c => c.status === 'compliant').length;
    return { name: dept, rate: deptItems.length > 0 ? Math.round((comp / deptItems.length) * 100) : 0, total: deptItems.length };
  });

  return (
    <div>
      <div className="page-header">
        <h1>📈 Compliance Reports</h1>
        <p>Generate and analyze audit reports</p>
      </div>

      <div className="page-content">
        <div className="card mb-20" style={{ marginBottom: 20 }}>
          <div className="card-header"><div className="card-title">Select Audit to Generate Report</div></div>
          <select className="form-control" style={{ maxWidth: 400 }} value={selectedAudit} onChange={e => setSelectedAudit(e.target.value)}>
            <option value="">Choose an audit...</option>
            {audits.map(a => <option key={a._id} value={a._id}>{a.title} ({a.framework})</option>)}
          </select>
        </div>

        {!selectedAudit && (
          <div className="empty-state"><div className="empty-icon">📊</div><h3>Select an audit to view its report</h3></div>
        )}

        {selectedAudit && loading && <div className="loading-spinner"><div className="spinner"></div></div>}

        {selectedAudit && !loading && (
          <>
            <div className="stats-grid">
              <div className="stat-card blue"><div className="stat-icon blue">📋</div><div className="stat-value">{total}</div><div className="stat-label">Total Items</div></div>
              <div className="stat-card green"><div className="stat-icon green">✅</div><div className="stat-value">{compliant}</div><div className="stat-label">Compliant</div></div>
              <div className="stat-card yellow"><div className="stat-icon yellow">❌</div><div className="stat-value">{nonCompliant}</div><div className="stat-label">Non-Compliant</div></div>
              <div className="stat-card purple"><div className="stat-icon purple">📊</div><div className="stat-value">{complianceRate}%</div><div className="stat-label">Compliance Rate</div></div>
            </div>

            <div className="dashboard-grid">
              <div className="card">
                <div className="card-header"><div className="card-title">By Category</div></div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categoryData} barSize={20}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="compliant" fill="#10b981" radius={[3,3,0,0]} name="Compliant" />
                    <Bar dataKey="nonCompliant" fill="#ef4444" radius={[3,3,0,0]} name="Non-Compliant" />
                    <Bar dataKey="pending" fill="#f59e0b" radius={[3,3,0,0]} name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <div className="card-header"><div className="card-title">Department Compliance Rate</div></div>
                {deptData.map(d => (
                  <div key={d.name} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13 }}>{d.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: d.rate >= 70 ? 'var(--accent-green)' : d.rate >= 40 ? 'var(--accent-yellow)' : 'var(--accent-red)' }}>{d.rate}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${d.rate}%`, background: d.rate >= 70 ? 'var(--accent-green)' : d.rate >= 40 ? 'var(--accent-yellow)' : 'var(--accent-red)' }}></div>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{d.total} items</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ marginTop: 20 }}>
              <div className="card-header"><div className="card-title">Detailed Results</div></div>
              <div className="table-container" style={{ border: 'none' }}>
                <table>
                  <thead>
                    <tr><th>Item</th><th>Category</th><th>Department</th><th>Status</th><th>Reviewed By</th><th>Remarks</th></tr>
                  </thead>
                  <tbody>
                    {results.length === 0 ? (
                      <tr><td colSpan={6}><div className="empty-state" style={{ padding: 30 }}><p>No results reviewed yet</p></div></td></tr>
                    ) : results.map(r => (
                      <tr key={r._id}>
                        <td style={{ fontSize: 13 }}>{r.checklist?.title}</td>
                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.checklist?.category}</td>
                        <td style={{ fontSize: 12 }}>{r.checklist?.assignedDepartment}</td>
                        <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.reviewedBy?.name}</td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 200 }}>{r.remarks || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
