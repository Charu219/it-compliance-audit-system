import React, { useState, useEffect } from 'react';
import { getAuditorDashboard } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = { compliant: '#10b981', 'non-compliant': '#ef4444', pending: '#f59e0b', 'in-progress': '#3b82f6', na: '#64748b' };

export default function AuditorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditorDashboard().then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!data) return null;

  const pieData = (data.checklistByStatus || []).map(s => ({ name: s._id, value: s.count }));

  return (
    <div>
      <div className="page-header">
        <h1>📊 Auditor Dashboard</h1>
        <p>Your assigned audits and review tasks</p>
      </div>

      <div className="page-content">
        <div className="stats-grid">
          <div className="stat-card blue"><div className="stat-icon blue">🔍</div><div className="stat-value">{data.stats.assignedAudits}</div><div className="stat-label">Assigned Audits</div></div>
          <div className="stat-card yellow"><div className="stat-icon yellow">⏳</div><div className="stat-value">{data.stats.pendingItems}</div><div className="stat-label">Pending Reviews</div></div>
          <div className="stat-card green"><div className="stat-icon green">✅</div><div className="stat-value">{data.stats.completedItems}</div><div className="stat-label">Completed Reviews</div></div>
        </div>

        <div className="dashboard-grid">
          <div className="card">
            <div className="card-header"><div className="card-title">Review Status Distribution</div></div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} fontSize={11}>
                  {pieData.map((e, i) => <Cell key={i} fill={COLORS[e.name] || '#64748b'} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Assigned Audits</div></div>
            {data.recentAudits?.length === 0
              ? <div className="empty-state"><p>No audits assigned yet</p></div>
              : data.recentAudits?.map(audit => (
                <div key={audit._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{audit.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{audit.framework}</div>
                  </div>
                  <StatusBadge status={audit.status} />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
