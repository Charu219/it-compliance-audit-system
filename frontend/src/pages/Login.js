import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../services/api';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'department', department: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = mode === 'login' ? await login(form) : await register(form);
      loginUser(res.data.token, res.data.user);
      navigate(`/${res.data.user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };




const handleGoogleLogin = () => {
  const base = process.env.REACT_APP_API_URL?.replace('/api','') || 'http://localhost:5000';
  window.location.href = `${base}/api/auth/google`;
};







  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="brand-logo">🛡️</div>
          <h1>IT Compliance<br />Audit System</h1>
          <p>Enterprise-grade compliance management</p>
        </div>
        <div className="auth-features">
          <div className="auth-feature">
            <div className="feature-icon">🔍</div>
            <div>
              <h4>Comprehensive Auditing</h4>
              <p>Manage full audit lifecycles with structured checklists and frameworks</p>
            </div>
          </div>
          <div className="auth-feature">
            <div className="feature-icon">📎</div>
            <div>
              <h4>Evidence Management</h4>
              <p>Departments can upload and track compliance evidence securely</p>
            </div>
          </div>
          <div className="auth-feature">
            <div className="feature-icon">📊</div>
            <div>
              <h4>Real-time Dashboard</h4>
              <p>Monitor compliance rates and audit progress with live analytics</p>
            </div>
          </div>
          <div className="auth-feature">
            <div className="feature-icon">👥</div>
            <div>
              <h4>Role-Based Access</h4>
              <p>Admin, Auditor, and Department roles with fine-grained permissions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container animate-in">
          <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p>{mode === 'login' ? 'Sign in to your compliance workspace' : 'Join your organization\'s compliance system'}</p>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-control" name="email" type="email" placeholder="you@company.com" value={form.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
            </div>

            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-control" name="role" value={form.role} onChange={handleChange}>
                    <option value="admin">Admin</option>
                    <option value="auditor">Auditor</option>
                    <option value="department">Department</option>
                  </select>
                </div>
                {form.role === 'department' && (
                  <div className="form-group">
                    <label className="form-label">Department Name</label>
                    <input className="form-control" name="department" placeholder="e.g. IT, Finance, HR" value={form.department} onChange={handleChange} required />
                  </div>
                )}
              </>
            )}

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
              {loading ? '⏳ Please wait...' : mode === 'login' ? '→ Sign In' : '→ Create Account'}
            </button>



          {/* Divider */}
<div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
  <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>OR</span>
  <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
</div>

{/* Google Button */}
<button
  type="button"
  onClick={handleGoogleLogin}
  style={{
    width: '100%', padding: '10px 16px',
    background: 'var(--bg-hover)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: 14, fontWeight: 600,
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    fontFamily: 'Space Grotesk, sans-serif'
  }}>
  <img src="https://www.google.com/favicon.ico" width="18" height="18" alt="Google" />
  Continue with Google
</button>

















          </form>

          <div className="auth-switch">
            {mode === 'login'
              ? <>Don't have an account? <a onClick={() => setMode('register')}>Register</a></>
              : <>Already have an account? <a onClick={() => setMode('login')}>Sign in</a></>
            }
          </div>

         
        </div>
      </div>
    </div>
  );
}
