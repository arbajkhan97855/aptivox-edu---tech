import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/firestoreApi';
import {
  Users, BookOpen, FileSpreadsheet, Award, AlertTriangle,
  MonitorPlay, PlusCircle, CheckCircle, TrendingUp, ArrowRight,
  ShieldCheck, Clock, FileText, ChevronRight
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await apiFetch('/api/admin/dashboard-stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [token]);

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading dashboard analytics...</div>;
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fef3c7', color: '#b45309', padding: '3px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
            System Status: Operational
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a' }}>
            Good Morning, Administrator
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
            Overview of student enrollments, exam integrity monitoring, and academic progress at APTIVOX EDUCATION &amp; TECHNOLOGY.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link to="/admin/students" className="btn-primary btn-sm">
            <PlusCircle size={15} /> Add Student
          </Link>
          <Link to="/admin/exams" className="btn-orange btn-sm">
            <FileSpreadsheet size={15} /> Create Exam Paper
          </Link>
        </div>
      </div>

      {/* Live Exam Active Alert if any */}
      {stats?.live_active_count > 0 && (
        <div style={{ background: 'linear-gradient(90deg, #1e3a8a, #2563eb)', color: '#ffffff', borderRadius: '14px', padding: '16px 20px', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', boxShadow: 'var(--shadow-blue)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="live-dot" style={{ width: '12px', height: '12px', background: '#4ade80' }}></div>
            <div>
              <strong style={{ fontSize: '1rem' }}>{stats.live_active_count} Student(s) Currently Taking Proctored Exams!</strong>
              <div style={{ fontSize: '0.82rem', color: '#bfdbfe' }}>Camera surveillance and violation tracking active.</div>
            </div>
          </div>
          <Link to="/admin/live-monitor" className="btn-secondary btn-sm" style={{ background: '#ffffff', color: '#1e3a8a', fontWeight: 700 }}>
            Open Live Monitor <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* 8 Stats Metrics Grid */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <div className="samyak-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Students</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{stats?.total_students}</div>
          <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>
            {stats?.active_students} Active Enrollments
          </div>
        </div>

        <div className="samyak-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Active Courses</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
              <BookOpen size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{stats?.total_courses}</div>
          <div style={{ fontSize: '0.8rem', color: '#7c3aed', fontWeight: 600, marginTop: '2px' }}>
            12 Seeded Programs
          </div>
        </div>

        <div className="samyak-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Exam Papers</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
              <FileSpreadsheet size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{stats?.total_exams}</div>
          <div style={{ fontSize: '0.8rem', color: '#ea580c', fontWeight: 600, marginTop: '2px' }}>
            {stats?.total_questions} Questions in Bank
          </div>
        </div>

        <div className="samyak-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Completed Submissions</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{stats?.completed_exams}</div>
          <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>
            Avg Score: {stats?.average_score}%
          </div>
        </div>
      </div>

      {/* Row 2: Course Distribution & Quick Admin Navigation */}
      <div className="dash-split-grid" style={{ marginBottom: '32px' }}>
        
        {/* Course Enrollments Table */}
        <div className="samyak-card" style={{ padding: '24px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              Course Enrollments & Papers
            </h3>
            <Link to="/admin/courses" style={{ fontSize: '0.82rem', color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
              Manage Courses →
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="samyak-table">
              <thead>
                <tr>
                  <th>Course Title</th>
                  <th>Students</th>
                  <th>Papers</th>
                </tr>
              </thead>
              <tbody>
                {stats?.course_stats?.slice(0, 6).map((c, i) => (
                  <tr key={i}>
                    <td>
                      <strong>{c.name}</strong>
                    </td>
                    <td>
                      <span className="badge badge-blue">{c.students} Students</span>
                    </td>
                    <td>
                      <span className="badge badge-gray">{c.exams} Papers</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Management Cards */}
        <div className="samyak-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
            Administration Actions
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link
              to="/admin/students"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid var(--border-light)',
                textDecoration: 'none',
                background: '#ffffff',
                transition: 'background 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Users size={18} style={{ color: '#2563eb' }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>Student Management & Live WebCam Photo</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Add, edit, live camera snapshot, password resets</div>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: '#94a3b8' }} />
            </Link>

            <Link
              to="/admin/questions"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid var(--border-light)',
                textDecoration: 'none',
                background: '#ffffff',
                transition: 'background 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileSpreadsheet size={18} style={{ color: '#ea580c' }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>Question Bank & Bulk Import</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>CSV/JSON question upload with template</div>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: '#94a3b8' }} />
            </Link>

            <Link
              to="/admin/re-exams"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid var(--border-light)',
                textDecoration: 'none',
                background: '#ffffff',
                transition: 'background 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertTriangle size={18} style={{ color: '#dc2626' }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>Re-Exam Approval System</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Manage integrity violation flags & approve re-tests</div>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: '#94a3b8' }} />
            </Link>

            <Link
              to="/admin/notes"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid var(--border-light)',
                textDecoration: 'none',
                background: '#ffffff',
                transition: 'background 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={18} style={{ color: '#7e22ce' }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>Upload Study Notes & PDF Handbooks</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Course-specific materials for students</div>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: '#94a3b8' }} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
