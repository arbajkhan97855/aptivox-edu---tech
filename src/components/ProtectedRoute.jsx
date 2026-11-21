import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#0284c7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Verifying Aptivox credentials...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    if (role === 'ADMIN') {
      return <Navigate to="/APTIVOX/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  if (role && user.role !== role) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
}
