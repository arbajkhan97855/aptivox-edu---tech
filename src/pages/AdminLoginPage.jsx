import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AptivoxLogo from '../assets/AptivoxLogo';
import { Lock, Mail, Eye, EyeOff, ArrowRight, UserCheck, Phone, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSupportModal, setShowSupportModal] = useState(false);

  const { user, loginAdmin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      const msg = 'Please enter both Admin Email and Password';
      setErrorMessage(msg);
      addToast(msg, 'warning');
      return;
    }

    try {
      setLoading(true);
      await loginAdmin(email.trim(), password, rememberSession);
      addToast('Welcome Administrator! Access granted.', 'success');
      navigate('/admin/dashboard');
    } catch (err) {
      const msg = err?.message || 'Invalid admin credentials';
      setErrorMessage(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 140px)',
      background: 'radial-gradient(ellipse at 50% 20%, #0f2964 0%, #03081a 55%, #020510 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 16px',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* Background ambient lighting effects */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '20%',
        width: '480px',
        height: '480px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.18) 0%, rgba(0, 0, 0, 0) 70%)',
        filter: 'blur(70px)',
        pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '20%',
        width: '440px',
        height: '440px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.18) 0%, rgba(0, 0, 0, 0) 70%)',
        filter: 'blur(70px)',
        pointerEvents: 'none'
      }}></div>

      {/* Main Login Card */}
      <div className="auth-card-single" style={{
        maxWidth: '460px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(56, 189, 248, 0.2)',
        position: 'relative',
        zIndex: 10,
        transition: 'transform 0.2s ease'
      }}>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <AptivoxLogo size={76} showText={false} />
          </div>

          <h2 style={{
            fontSize: '1.6rem',
            fontWeight: 800,
            color: '#050c21',
            lineHeight: 1.25,
            fontFamily: "'Outfit', sans-serif"
          }}>
            Aptivox Administration
          </h2>

          <p style={{
            color: '#475569',
            fontSize: '0.84rem',
            marginTop: '6px',
            fontWeight: 700,
            letterSpacing: '0.02em'
          }}>
            APTIVOX EDUCATION &amp; TECHNOLOGY
          </p>
          <p style={{
            color: '#0284c7',
            fontSize: '0.8rem',
            marginTop: '2px',
            fontWeight: 600
          }}>
            Learn Today. Achieve Tomorrow.
          </p>
        </div>

        {/* Inline Error Banner */}
        {errorMessage && (
          <div
            role="alert"
            style={{
              background: '#fffbeb',
              border: '1px solid #fcd34d',
              color: '#92400e',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '18px',
              fontSize: '0.83rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              lineHeight: 1.5,
            }}
          >
            <AlertCircle size={18} style={{ color: '#d97706', flexShrink: 0, marginTop: '1px' }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAdminSubmit}>

          {/* Email input */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '6px'
            }}>
              <Mail size={15} style={{ color: '#0284c7' }} />
              Admin Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="aptivoxeducation@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  height: '46px',
                  borderRadius: '12px',
                  fontSize: '0.94rem',
                  paddingLeft: '14px',
                  background: '#f8fafc',
                  borderColor: '#cbd5e1'
                }}
              />
            </div>
          </div>

          {/* Password input */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="form-label" style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: 0
              }}>
                <Lock size={15} style={{ color: '#7c3aed' }} />
                Admin Password
              </label>
              <button
                type="button"
                onClick={() => setShowSupportModal(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#0284c7',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Forgot?
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter administrator password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  height: '46px',
                  borderRadius: '12px',
                  fontSize: '0.94rem',
                  paddingLeft: '14px',
                  paddingRight: '44px',
                  background: '#f8fafc',
                  borderColor: '#cbd5e1'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember session checkbox */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '22px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.84rem',
              color: '#475569',
              cursor: 'pointer',
              fontWeight: 500,
              userSelect: 'none'
            }}>
              <input
                type="checkbox"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#0284c7',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              />
              Keep me signed in
            </label>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>
              Control Center
            </span>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              height: '48px',
              fontSize: '0.98rem',
              fontWeight: 700,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              'Verifying Credentials...'
            ) : (
              <>
                Sign In to Admin Dashboard <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Switch to Student Login */}
        <div style={{
          marginTop: '24px',
          paddingTop: '18px',
          borderTop: '1px solid #f1f5f9',
          textAlign: 'center'
        }}>
          <Link
            to="/"
            style={{
              color: '#475569',
              fontSize: '0.86rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#0284c7'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; }}
          >
            <UserCheck size={16} style={{ color: '#0284c7' }} />
            Are you a student? <strong>Switch to Student Portal</strong>
          </Link>
        </div>

      </div>

      {/* Support / Help Modal */}
      {showSupportModal && (
        <div className="modal-overlay" onClick={() => setShowSupportModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ padding: '30px', maxWidth: '440px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#050c21', marginBottom: '8px' }}>
              Admin Account Support
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '20px' }}>
              Sign in with your authorized Aptivox Administrator Email and Password. Contact the Director office if you need a password reset.
            </p>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#050c21', fontWeight: 700, fontSize: '0.92rem' }}>
                <Phone size={15} style={{ color: '#16a34a' }} /> +91 9785589164
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                <Mail size={15} style={{ color: '#0284c7', flexShrink: 0 }} />
                aptivoxeducation@gmail.com
              </div>
            </div>

            <button onClick={() => setShowSupportModal(false)} className="btn-primary" style={{ width: '100%' }}>
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
