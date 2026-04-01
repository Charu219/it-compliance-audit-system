import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const user  = params.get('user');
    const error = params.get('error');

    if (error || !token) {
      navigate('/login?error=google_failed');
      return;
    }

    try {
      const userData = JSON.parse(decodeURIComponent(user));
      loginUser(token, userData);
      navigate(`/${userData.role}/dashboard`);
    } catch {
      navigate('/login');
    }
  }, []);

  return (
    <div className="loading-spinner" style={{ minHeight: '100vh' }}>
      <div className="spinner"></div>
      <span className="loading-text">Signing you in with Google...</span>
    </div>
  );
}