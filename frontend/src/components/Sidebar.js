import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminNav = [
  { section: 'Overview', items: [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/reports', icon: '📈', label: 'Reports' },
  ]},
  { section: 'Management', items: [
    { path: '/admin/audits', icon: '🔍', label: 'Audits' },
    { path: '/admin/checklists', icon: '✅', label: 'Checklists' },
    { path: '/admin/assignments', icon: '👥', label: 'Assignments' },
    { path: '/admin/users', icon: '👤', label: 'Users' },
  ]}
];

const auditorNav = [
  { section: 'Overview', items: [
    { path: '/auditor/dashboard', icon: '📊', label: 'Dashboard' },
  ]},
  { section: 'Work', items: [
    { path: '/auditor/audits', icon: '🔍', label: 'My Audits' },
    { path: '/auditor/review', icon: '📋', label: 'Review Items' },
  ]}
];

const departmentNav = [
  { section: 'Overview', items: [
    { path: '/department/dashboard', icon: '📊', label: 'Dashboard' },
  ]},
  { section: 'Compliance', items: [
    { path: '/department/tasks', icon: '📋', label: 'My Tasks' },
    { path: '/department/evidence', icon: '📎', label: 'Evidence' },
  ]}
];

const navMap = { admin: adminNav, auditor: auditorNav, department: departmentNav };

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const nav = navMap[user?.role] || [];
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
     <aside style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
      <div className="sidebar-logo">
        <div className="logo-icon">🛡️</div>
        <div>
          <h2>IT Compliance</h2>
          <span>Audit System</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {nav.map((section) => (
          <div className="nav-section" key={section.section}>
            <div className="nav-section-title">{section.section}</div>
            {section.items.map(item => (
              <button
                key={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => handleNavigate(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="avatar">{initials}</div>
        <div className="user-info">
          <div className="name">{user?.name}</div>
          <div className="role-badge">{user?.role} {user?.department ? `• ${user.department}` : ''}</div>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Logout">↩</button>
      </div>
    </aside>
  );
}