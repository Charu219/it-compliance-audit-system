import React, { useState, useEffect } from 'react';
import { getDepartmentDashboard } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = { compliant: '#10b981', 'non-compliant': '#ef4444', pending: '#f59e0b', 'in-progress': '#3b82f6', na: '#64748b' };

export default function DepartmentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getDepartmentDashboard().then(r => setData(r.data)).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!data) return null;

  const pieData = (data.itemsByStatus || []).map(s => ({ name: s._id, value: s.count }));
  const total = data.stats.totalItems;
  const complianceRate = total > 0 ? Math.round((data.stats.compliantItems / total) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <h1>📊 Department Dashboard</h1>
        <p>Your compliance tasks and status overview</p>
      </div>
      <div className="page-content">
        <div className="stats-grid">
          <div className="stat-card blue"><div className="stat-icon blue">📋</div><div className="stat-value">{data.stats.totalItems}</div><div className="stat-label">Total Tasks</div></div>
          <div className="stat-card yellow"><div className="stat-icon yellow">⏳</div><div className="stat-value">{data.stats.pendingItems}</div><div className="stat-label">Pending</div></div>
          <div className="stat-card green"><div className="stat-icon green">✅</div><div className="stat-value">{data.stats.compliantItems}</div><div className="stat-label">Compliant</div></div>
          <div className="stat-card purple"><div className="stat-icon purple">📎</div><div className="stat-value">{data.stats.evidenceUploaded}</div><div className="stat-label">Evidence Uploaded</div></div>
        </div>

        <div className="dashboard-grid">
          <div className="card">
            <div className="card-header"><div className="card-title">Compliance Progress</div></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="110" height="110" viewBox="0 0 110 110">
                  <circle cx="55" cy="55" r="45" fill="none" stroke="var(--border)" strokeWidth="10" />
                  <circle cx="55" cy="55" r="45" fill="none"
                    stroke={complianceRate >= 70 ? '#10b981' : complianceRate >= 40 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${complianceRate * 2.83} 283`} transform="rotate(-90 55 55)" />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'JetBrains Mono' }}>{complianceRate}%</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} fontSize={10}>
                    {pieData.map((e, i) => <Cell key={i} fill={COLORS[e.name] || '#64748b'} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Recent Tasks</div></div>
            {data.myItems?.length === 0
              ? <div className="empty-state"><p>No tasks assigned yet</p></div>
              : data.myItems?.map(item => (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.audit?.title}</div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
