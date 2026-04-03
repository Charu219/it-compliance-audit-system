import React, { useState } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16
          }}>🛡️</div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>IT Compliance</span>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            background: 'var(--bg-hover)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '6px 10px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: 18
          }}>
          ☰
        </button>
      </div>

      {/* Overlay when sidebar open on mobile */}
      {sidebarOpen && (
        <div className="overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={sidebarOpen ? 'sidebar open' : 'sidebar'}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="main-content">{children}</main>
    </div>
  );
}