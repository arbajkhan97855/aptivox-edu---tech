import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AptivoxLogo from '../assets/AptivoxLogo';
import { LogOut, User, BookOpen, Award, FileText, LayoutDashboard, Shield, Phone, Mail, Menu, X } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="aptivox-header-wrapper samyak-header-wrapper" style={{ width: '100%', zIndex: 50 }}>
      {/* Top Info Notice Bar */}
      <div className="top-notice-bar" style={{ background: '#03081a', color: '#cbd5e1', fontSize: '0.8rem', padding: '7px 20px', borderBottom: '1px solid rgba(14, 165, 233, 0.22)' }}>
        <div className="container-custom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
              <Phone size={13} style={{ color: '#38bdf8' }} />
              Helpline: <strong style={{ color: '#ffffff' }}>9785589164</strong>
            </span>
            <span className="top-notice-email" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
              <Mail size={13} style={{ color: '#a855f7' }} />
              <span>aptivoxeducation@gmail.com</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="top-notice-slogan" style={{ color: '#7dd3fc', fontWeight: 600, whiteSpace: 'nowrap' }}>Learn Today. Achieve Tomorrow.</span>
            <span className="top-notice-divider" style={{ color: '#334155' }}>|</span>
            <Link
              to="/APTIVOX/admin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                color: '#e0f2fe',
                fontWeight: 700,
                textDecoration: 'none',
                padding: '3px 10px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.18), rgba(124, 58, 237, 0.22))',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                whiteSpace: 'nowrap'
              }}
            >
              <Shield size={12} style={{ color: '#38bdf8' }} />
              Admin Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="aptivox-navbar samyak-navbar">
        <div className="container-custom nav-inner">
          <Link to={user?.role === 'STUDENT' ? '/student/dashboard' : '/'} style={{ textDecoration: 'none', minWidth: 0, flexShrink: 1 }}>
            <AptivoxLogo size={54} />
          </Link>

          {user?.role === 'STUDENT' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
              <div className="nav-links">
                <Link to="/student/dashboard" className={`nav-link ${isActive('/student/dashboard') ? 'active' : ''}`}>
                  <LayoutDashboard size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  Dashboard
                </Link>
                <Link to="/student/tests" className={`nav-link ${isActive('/student/tests') ? 'active' : ''}`}>
                  <BookOpen size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  My Tests
                </Link>
                <Link
                  to="/student/exam-history"
                  className={`nav-link ${isActive('/student/exam-history') || isActive('/student/results') ? 'active' : ''}`}
                >
                  <Award size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  Exam History
                </Link>
                <Link to="/student/notes" className={`nav-link ${isActive('/student/notes') ? 'active' : ''}`}>
                  <FileText size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  Study Notes
                </Link>
                <Link to="/student/profile" className={`nav-link ${isActive('/student/profile') ? 'active' : ''}`}>
                  <User size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  Profile
                </Link>
              </div>

              {/* Desktop User badge */}
              <div className="nav-user-desktop" style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '16px', borderLeft: '1px solid var(--border-light)', flexShrink: 0 }}>
                <img
                  src={user.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0ea5e9' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                    {user.name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    {user.student_id}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="btn-icon"
                  style={{ color: '#dc2626' }}
                >
                  <LogOut size={18} />
                </button>
              </div>

              {/* Mobile Hamburger Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="btn-icon mobile-menu-btn"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          ) : user?.role === 'ADMIN' ? (
            <div className="guest-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <Link to="/admin/dashboard" className="btn-primary btn-sm">
                Admin Panel
              </Link>
              <button onClick={handleLogout} className="btn-secondary btn-sm" style={{ color: '#dc2626' }}>
                <LogOut size={15} /> Logout
              </button>
            </div>
          ) : (
            <div className="guest-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <Link to="/" className="btn-secondary btn-sm">
                Student Login
              </Link>
              <Link to="/APTIVOX/admin" className="btn-primary btn-sm">
                <Shield size={14} />
                Admin
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Slide-down Navigation Drawer for Student */}
        {user?.role === 'STUDENT' && mobileMenuOpen && (
          <div className="mobile-drawer">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', marginBottom: '10px', borderBottom: '1px solid var(--border-light)' }}>
              <img
                src={user.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt={user.name}
                referrerPolicy="no-referrer"
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0ea5e9', flexShrink: 0 }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  {user.student_id}
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-secondary btn-sm"
                style={{ color: '#dc2626', borderColor: '#fecaca', background: '#fef2f2' }}
              >
                <LogOut size={15} /> Logout
              </button>
            </div>

            <div className="mobile-drawer-links">
              <Link to="/student/dashboard" className={`mobile-drawer-link ${isActive('/student/dashboard') ? 'active' : ''}`}>
                <LayoutDashboard size={17} /> Dashboard
              </Link>
              <Link to="/student/tests" className={`mobile-drawer-link ${isActive('/student/tests') ? 'active' : ''}`}>
                <BookOpen size={17} /> My Tests
              </Link>
              <Link to="/student/exam-history" className={`mobile-drawer-link ${isActive('/student/exam-history') || isActive('/student/results') ? 'active' : ''}`}>
                <Award size={17} /> Exam History
              </Link>
              <Link to="/student/notes" className={`mobile-drawer-link ${isActive('/student/notes') ? 'active' : ''}`}>
                <FileText size={17} /> Study Notes
              </Link>
              <Link to="/student/profile" className={`mobile-drawer-link ${isActive('/student/profile') ? 'active' : ''}`}>
                <User size={17} /> Profile
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
