import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/firestoreApi';
import {
  BookOpen, Award, CheckCircle, Clock, FileText, ArrowRight,
  ShieldCheck, AlertCircle, Play, UserCheck, Flame, BarChart3
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, token } = useAuth();
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [notesCount, setNotesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [examsRes, resultsRes, notesRes] = await Promise.all([
          apiFetch('/api/exams', { headers: { Authorization: `Bearer ${token}` } }),
          apiFetch('/api/student/results', { headers: { Authorization: `Bearer ${token}` } }),
          apiFetch('/api/notes', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (examsRes.ok) setExams(await examsRes.json());
        if (resultsRes.ok) setResults(await resultsRes.json());
        if (notesRes.ok) {
          const notesData = await notesRes.json();
          setNotesCount(notesData.length);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [token]);

  const courseExams = exams.filter((e) => e.status !== 'LOCKED');
  const availableExams = courseExams.filter((e) => e.status === 'AVAILABLE');
  const completedExams = courseExams.filter((e) => e.status === 'COMPLETED');
  const reExamExams = courseExams.filter((e) => e.status === 'RE_EXAM_REQUIRED');

  const avgScore = results.length > 0
    ? Math.round(results.reduce((acc, r) => acc + (r.percentage || 0), 0) / results.length)
    : 0;

  const passedCount = results.filter((r) => r.passed).length;
  const progressPercent = courseExams.length > 0
    ? Math.round((completedExams.length / courseExams.length) * 100)
    : 0;

  return (
    <div style={{ padding: '36px 0', minHeight: '80vh' }}>
      <div className="container-custom">
        
        {/* Welcome Hero Banner */}
        <div
          className="hero-banner-card"
          style={{
            background: 'linear-gradient(135deg, #03081a 0%, #0a2254 55%, #3b1d78 100%)',
            borderRadius: '20px',
            color: '#ffffff',
            padding: '36px 32px',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle watermark background */}
          <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.1, pointerEvents: 'none' }}>
            <Award size={260} />
          </div>

          <div style={{ position: 'relative', zIndex: 2, minWidth: 0, flex: '1 1 280px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '12px' }}>
              <ShieldCheck size={14} style={{ color: '#4ade80' }} />
              Enrolled Student • {user?.student_id}
            </div>
            <h1 className="hero-banner-title" style={{ fontSize: '2.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
              Welcome back, {user?.name}!
            </h1>
            <p style={{ color: '#bfdbfe', fontSize: '1rem', maxWidth: '600px' }}>
              Course: <strong style={{ color: '#ffffff' }}>{user?.course_name}</strong> | Batch: {user?.batch}
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '20px 24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', position: 'relative', zIndex: 2, flex: '1 1 220px', maxWidth: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>Course Test Progress</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4ade80' }}>{progressPercent}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #22c55e, #4ade80)', borderRadius: '999px', transition: 'width 0.5s ease' }}></div>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#93c5fd', marginTop: '8px' }}>
              {completedExams.length} of {courseExams.length} tests completed
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid-4" style={{ marginBottom: '32px' }}>
          <div className="samyak-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Available Tests</span>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8' }}>
                <BookOpen size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a' }}>{availableExams.length}</div>
            <div style={{ fontSize: '0.82rem', color: '#2563eb', fontWeight: 600, marginTop: '4px' }}>Ready to attempt</div>
          </div>

          <div className="samyak-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Completed Tests</span>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d' }}>
                <CheckCircle size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a' }}>{completedExams.length}</div>
            <div style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>{passedCount} Passed</div>
          </div>

          <div className="samyak-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Average Score</span>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
                <Flame size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a' }}>{avgScore}%</div>
            <div style={{ fontSize: '0.82rem', color: '#b45309', fontWeight: 600, marginTop: '4px' }}>Overall Performance</div>
          </div>

          <div className="samyak-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Course Notes</span>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7e22ce' }}>
                <FileText size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a' }}>{notesCount}</div>
            <div style={{ fontSize: '0.82rem', color: '#7e22ce', fontWeight: 600, marginTop: '4px' }}>PDF Resources available</div>
          </div>
        </div>

        {/* Two Column Layout: Available Tests on Left, Recent Results on Right */}
        <div className="dash-split-grid">
          
          {/* Left: Pending / Available Tests */}
          <div className="samyak-card" style={{ padding: '24px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  Available Examinations
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Strict proctored online exams for {user?.course_name}
                </p>
              </div>
              <Link to="/student/tests" className="btn-secondary btn-sm">
                View All <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Loading exams...</div>
            ) : availableExams.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px' }}>
                <CheckCircle size={40} style={{ color: '#22c55e', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '4px' }}>All Caught Up!</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>You have completed all currently active exams for your course.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {availableExams.slice(0, 3).map((exam) => (
                  <div
                    key={exam.id}
                    style={{
                      border: '1.5px solid var(--border-light)',
                      borderRadius: '14px',
                      padding: '16px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px',
                      background: '#ffffff',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <div style={{ minWidth: 0, flex: '1 1 200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                        <span className="badge badge-blue">{exam.subject_name || 'Subject'}</span>
                        <span className="badge badge-purple">{exam.level_name || 'Test'}</span>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Paper {exam.paper_number}</span>
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                        {exam.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '0.82rem', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} /> {exam.duration_minutes} Mins
                        </span>
                        <span>•</span>
                        <span>{exam.total_questions} Questions</span>
                        <span>•</span>
                        <span>Max Marks: {exam.total_marks}</span>
                      </div>
                    </div>

                    <Link
                      to={`/student/exam/${exam.id}`}
                      className="btn-primary btn-sm"
                      style={{ flexShrink: 0 }}
                    >
                      <Play size={14} /> Start Exam
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Re-Exam Alert notice if any */}
            {reExamExams.length > 0 && (
              <div style={{ marginTop: '20px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px', color: '#991b1b' }}>
                <AlertCircle size={22} style={{ flexShrink: 0, color: '#dc2626' }} />
                <div style={{ fontSize: '0.85rem' }}>
                  <strong>{reExamExams.length} Exam(s) marked for Re-Examination.</strong><br />
                  Integrity violation was detected. Please wait for Aptivox Admin to approve your re-attempt.
                </div>
              </div>
            )}
          </div>

          {/* Right: Recent Results & Performance */}
          <div className="samyak-card" style={{ padding: '24px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  Recent Examination Results
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Instant score calculation and certificates
                </p>
              </div>
              <Link to="/student/exam-history" className="btn-secondary btn-sm">
                Exam History <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Loading results...</div>
            ) : results.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px' }}>
                <Award size={40} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '4px' }}>No Results Yet</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Complete your first course test to view your scorecard and ranking.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {results.slice(0, 3).map((res) => (
                  <div
                    key={res.id}
                    style={{
                      border: '1px solid var(--border-light)',
                      borderRadius: '14px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                      background: '#ffffff'
                    }}
                  >
                    <div style={{ minWidth: 0, flex: '1 1 180px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className={`badge ${res.passed ? 'badge-green' : 'badge-red'}`}>
                          {res.passed ? 'PASS' : 'FAIL'}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {res.subject_name || 'Exam'}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>
                        {res.title}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                        Correct: {res.correct_count} | Wrong: {res.wrong_count}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: res.passed ? '#15803d' : '#dc2626' }}>
                        {res.percentage}%
                      </div>
                      <Link
                        to={`/student/results/${res.id}`}
                        style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}
                      >
                        Scorecard →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
