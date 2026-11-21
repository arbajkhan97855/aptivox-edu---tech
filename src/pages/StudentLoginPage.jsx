import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AptivoxLogo from '../assets/AptivoxLogo';
import {
  Lock, UserCheck, Eye, EyeOff, Shield, Phone, Mail, CheckCircle,
  ArrowRight, HelpCircle, AlertCircle
} from 'lucide-react';

export default function StudentLoginPage() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  const { user, loginStudent } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      navigate('/student/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!studentId.trim() || !password.trim()) {
      const msg = 'Please enter both Student ID and Password';
      setLoginError(msg);
      addToast(msg, 'warning');
      return;
    }

    try {
      setLoading(true);
      const res = await loginStudent(studentId.trim(), password);
      if (res?.user) {
        addToast('Welcome back! Logged in successfully.', 'success');
        navigate('/student/dashboard');
      }
    } catch (err) {
      const msg = err?.message || 'Invalid Student ID or password';
      setLoginError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 150px)', background: 'radial-gradient(ellipse at 25% 20%, #0b2356 0%, #03081a 60%, #020510 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative Ambient Glows */}
      <div style={{ position: 'absolute', top: '8%', left: '12%', width: '360px', height: '360px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.22) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(50px)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '8%', right: '12%', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124, 58, 237, 0.22) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(50px)', pointerEvents: 'none' }}></div>

      <div className="auth-split-grid" style={{ maxWidth: '1080px', width: '100%', background: '#ffffff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 55px -12px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(56, 189, 248, 0.22)', position: 'relative', zIndex: 10 }}>

        {/* Left Side: Institute Highlights */}
        <div className="auth-panel" style={{ background: 'linear-gradient(155deg, #03081a 0%, #0a1b44 65%, #23124d 100%)', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid rgba(56, 189, 248, 0.14)' }}>
          <div>
            <div style={{ background: 'rgba(14, 165, 233, 0.08)', padding: '14px 16px', borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.22)', display: 'inline-block', marginBottom: '26px' }}>
              <AptivoxLogo size={64} lightText={true} />
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '12px', lineHeight: 1.25 }}>
              Online Examination &amp; Learning Portal
            </h2>
            <p style={{ color: '#93c5fd', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '28px' }}>
              Secure, proctored examinations with live camera monitoring, instant score evaluation, and comprehensive study notes for all courses.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(14, 165, 233, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', flexShrink: 0 }}>
                  <CheckCircle size={16} />
                </div>
                <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>Camera integrity &amp; strict exam proctoring</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', flexShrink: 0 }}>
                  <CheckCircle size={16} />
                </div>
                <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>Topic-wise Basic, Medium &amp; Advanced tests</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80', flexShrink: 0 }}>
                  <CheckCircle size={16} />
                </div>
                <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>Download verified course study materials</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#cbd5e1' }}>
              <Phone size={15} style={{ color: '#38bdf8', flexShrink: 0 }} />
              <span>Helpline: <strong style={{ color: '#ffffff' }}>9785589164</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#94a3b8', marginTop: '8px' }}>
              <Mail size={15} style={{ color: '#a855f7', flexShrink: 0 }} />
              <span>aptivoxeducation@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Right Side: Student ID & Password Login Form */}
        <div className="auth-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '26px' }}>
            <span className="badge badge-blue" style={{ marginBottom: '10px' }}>
              Student Portal
            </span>
            <h3 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#050c21', marginBottom: '8px' }}>
              Sign In to Your Account
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Enter your Admin-issued Student ID and Password to access your examination dashboard.
            </p>
          </div>

          {loginError && (
            <div
              role="alert"
              style={{
                background: '#fffbeb',
                border: '1px solid #fcd34d',
                color: '#92400e',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '18px',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                lineHeight: 1.5,
              }}
            >
              <AlertCircle size={18} style={{ color: '#d97706', flexShrink: 0, marginTop: '1px' }} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserCheck size={16} style={{ color: '#0284c7' }} />
                Student ID
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. APTIVOX-2026-001"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={16} style={{ color: '#7c3aed' }} />
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your student password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b' }}>
                Credentials issued by Admin only
              </span>
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                style={{ background: 'transparent', border: 'none', color: '#0284c7', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <HelpCircle size={14} /> Forgot / Need ID?
              </button>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '13px', fontSize: '1rem' }}
            >
              {loading ? (
                'Signing In...'
              ) : (
                <>
                  Enter Examination Portal <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Admin Login Switch Bar */}
          <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Are you an institute administrator?
            </span>
            <Link
              to="/APTIVOX/admin"
              className="btn-secondary btn-sm"
              style={{ color: '#050c21', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Shield size={14} style={{ color: '#7c3aed' }} />
              Admin Login (/APTIVOX/admin)
            </Link>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '12px', color: '#050c21' }}>
              Student ID &amp; Password Assistance
            </h3>
            <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '20px' }}>
              Student accounts and passwords are created and updated exclusively by the APTIVOX EDUCATION &amp; TECHNOLOGY administration. If you forgot your password or need a Student ID, please contact your institute Admin.
            </p>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, color: '#050c21', marginBottom: '6px' }}>Admission Office Contact:</div>
              <div style={{ color: '#0284c7', fontWeight: 700, fontSize: '1.1rem' }}>+91 9785589164</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                Email: aptivoxeducation@gmail.com
              </div>
            </div>

            <button onClick={() => setShowHelpModal(false)} className="btn-primary" style={{ width: '100%' }}>
              Close Notice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
