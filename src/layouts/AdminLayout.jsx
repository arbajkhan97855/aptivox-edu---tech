import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AptivoxLogo from '../assets/AptivoxLogo';
import {
  LayoutDashboard, Users, BookOpen, Layers, FileSpreadsheet,
  HelpCircle, MonitorPlay, Award, AlertTriangle, FileText, Settings,
  LogOut, Menu, X, Shield, ExternalLink
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/APTIVOX/admin');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Students', path: '/admin/students', icon: Users },
    { label: 'Courses', path: '/admin/courses', icon: BookOpen },
    { label: 'Subjects & Topics', path: '/admin/hierarchy', icon: Layers },
    { label: 'Exam Papers', path: '/admin/exams', icon: FileSpreadsheet },
    { label: 'Question Bank', path: '/admin/questions', icon: HelpCircle },
    { label: 'Live Exam Monitor', path: '/admin/live-monitor', icon: MonitorPlay },
    { label: 'Exam Results', path: '/admin/results', icon: Award },
    { label: 'Re-Exam Requests', path: '/admin/re-exams', icon: AlertTriangle },
    { label: 'Study Notes PDF', path: '/admin/notes', icon: FileText },
    { label: 'Institute Settings', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-layout">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ padding: '18px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <Link
              to="/admin/dashboard"
              onClick={() => setSidebarOpen(false)}
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                overflow: 'hidden'
              }}
            >
              <AptivoxLogo size={42} showText={false} />

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontSize: '0.94rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  lineHeight: 1.2,
                  fontFamily: "'Outfit', sans-serif",
                  letterSpacing: '0.3px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  APTIVOX
                </div>
                <div style={{
                  color: '#7dd3fc',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  marginTop: '2px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  Learn Today. Achieve Tomorrow.
                </div>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="btn-icon admin-sidebar-close"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#cbd5e1', flexShrink: 0 }}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            background: 'linear-gradient(90deg, rgba(14, 165, 233, 0.16), rgba(124, 58, 237, 0.2))',
            color: '#7dd3fc',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.72rem',
            fontWeight: 800,
            marginTop: '14px',
            border: '1px solid rgba(56, 189, 248, 0.28)',
            letterSpacing: '0.5px'
          }}>
            <Shield size={13} style={{ color: '#a855f7' }} /> ADMIN CONTROL CENTER
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${active ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #0284c7, #7c3aed)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
              AX
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.name || 'Administrator'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>System Administrator</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px',
              background: 'rgba(220, 38, 38, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <LogOut size={15} /> Logout Admin Session
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="btn-icon admin-menu-btn"
              aria-label="Open admin menu"
            >
              <Menu size={20} />
            </button>
            <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              APTIVOX <span className="admin-topbar-subtitle">EDUCATION &amp; TECHNOLOGY • Control Center</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <Link
              to="/"
              target="_blank"
              style={{
                fontSize: '0.82rem',
                color: '#0284c7',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none',
                background: '#f0f9ff',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #bae6fd',
                whiteSpace: 'nowrap'
              }}
            >
              <ExternalLink size={14} /> Student Portal
            </Link>

            <div className="admin-live-pill" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid var(--border-light)', paddingLeft: '14px' }}>
              <span className="badge badge-green">LIVE SYSTEM</span>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
