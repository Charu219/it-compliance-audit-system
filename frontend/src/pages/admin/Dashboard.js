import React, { useState, useEffect } from 'react';
import { getAdminDashboard } from '../../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import StatusBadge from '../../components/StatusBadge';

const COLORS = { compliant: '#10b981', 'non-compliant': '#ef4444', pending: '#f59e0b', 'in-progress': '#3b82f6', na: '#64748b', draft: '#64748b', active: '#10b981', completed: '#8b5cf6', archived: '#64748b' };

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard().then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!data) return null;

  const statusPieData = (data.checklistByStatus || []).map(s => ({ name: s._id, value: s.count }));
  const auditBarData = (data.auditsByStatus || []).map(s => ({ name: s._id, value: s.count }));
  const roleData = (data.usersByRole || []).map(r => ({ name: r._id, count: r.count }));

  const complianceTotal = (data.complianceRate || []).reduce((s, i) => s + i.count, 0);
  const compliantCount = (data.complianceRate || []).find(r => r._id === 'compliant')?.count || 0;
  const compliancePercent = complianceTotal > 0 ? Math.round((compliantCount / complianceTotal) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <h1>📊 Admin Dashboard</h1>
        <p>Overview of your compliance audit operations</p>
      </div>

      <div className="page-content">
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon blue">🔍</div>
            <div className="stat-value">{data.stats.totalAudits}</div>
            <div className="stat-label">Total Audits</div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green">👤</div>
            <div className="stat-value">{data.stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon purple">✅</div>
            <div className="stat-value">{data.stats.totalChecklist}</div>
            <div className="stat-label">Checklist Items</div>
          </div>
          <div className="stat-card yellow">
            <div className="stat-icon yellow">📎</div>
            <div className="stat-value">{data.stats.totalEvidence}</div>
            <div className="stat-label">Evidence Files</div>
          </div>
        </div>

        {/* Compliance Rate */}
        <div className="card mb-20" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="card-title">Overall Compliance Rate</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="12" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={compliancePercent >= 70 ? '#10b981' : compliancePercent >= 40 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={`${compliancePercent * 3.14} 314`}
                  transform="rotate(-90 60 60)" />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'JetBrains Mono' }}>{compliancePercent}%</div>
              </div>
            </div>
            <div>
              {(data.complianceRate || []).map(item => (
                <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[item._id] || '#64748b' }}></div>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{item._id}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, marginLeft: 'auto', paddingLeft: 20 }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Checklist Status Chart */}
          <div className="card">
            <div className="card-header"><div className="card-title">Checklist Status Distribution</div></div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {statusPieData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[entry.name] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Audits by Status */}
          <div className="card">
            <div className="card-header"><div className="card-title">Audits by Status</div></div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={auditBarData} barSize={32}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {auditBarData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[entry.name] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Recent Audits */}
          <div className="card">
            <div className="card-header"><div className="card-title">Recent Audits</div></div>
            {data.recentAudits?.length === 0
              ? <div className="empty-state"><p>No audits yet</p></div>
              : data.recentAudits?.map(audit => (
                <div key={audit._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{audit.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{audit.framework} • {audit.createdBy?.name}</div>
                  </div>
                  <StatusBadge status={audit.status} />
                </div>
              ))}
          </div>

          {/* Users by Role */}
          <div className="card">
            <div className="card-header"><div className="card-title">Users by Role</div></div>
            {roleData.map(r => (
              <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 20 }}>{r.name === 'admin' ? '👑' : r.name === 'auditor' ? '🔍' : '🏢'}</div>
                  <span style={{ textTransform: 'capitalize', fontSize: 14 }}>{r.name}s</span>
                </div>
                <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'JetBrains Mono' }}>{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
