import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/firestoreApi';
import {
  BookOpen, Clock, Lock, CheckCircle2, AlertTriangle,
  Play, Eye, Filter, Search, Award, HelpCircle, Sparkles, Layers
} from 'lucide-react';

export default function StudentTestsPage() {
  const { user, token } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('MY_COURSE'); // 'MY_COURSE' or 'ALL_TESTS'
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchExams() {
      try {
        const res = await apiFetch('/api/exams', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setExams(data);
        }
      } catch (err) {
        console.error('Failed to fetch exams:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchExams();
  }, [token]);

  // Exams belonging to student's enrolled course and subjects
  const myCourseExams = exams.filter((e) => e.status !== 'LOCKED');
  const baseList = activeTab === 'MY_COURSE' ? myCourseExams : exams;

  // Extract distinct subjects and levels
  const subjects = ['ALL', ...new Set(baseList.map((e) => e.subject_name).filter(Boolean))];
  const levels = ['ALL', ...new Set(baseList.map((e) => e.level_name).filter(Boolean))];

  const filteredExams = baseList.filter((exam) => {
    const matchesSubject = selectedSubject === 'ALL' || exam.subject_name === selectedSubject;
    const matchesLevel = selectedLevel === 'ALL' || exam.level_name === selectedLevel;
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (exam.topic_name && exam.topic_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSubject && matchesLevel && matchesSearch;
  });

  return (
    <div style={{ padding: '36px 0', minHeight: '80vh' }}>
      <div className="container-custom">
        
        {/* Page Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
            <BookOpen size={14} /> Course Examination Catalog
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
            Course Tests & Papers
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '12px' }}>
            Enrolled Course: <strong style={{ color: '#2563eb' }}>{user?.course_name}</strong>. Attempt your scheduled papers with active camera proctoring.
          </p>

          {/* Enrolled Subjects Chips */}
          {user?.enrolled_subject_details && user.enrolled_subject_details.length > 0 && (
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '6px' }}>
                <Layers size={14} style={{ color: '#2563eb' }} /> Your Course Subjects:
              </span>
              {user.enrolled_subject_details.map((sub) => (
                <span
                  key={sub.id}
                  style={{
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                >
                  {sub.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tab Selection: My Course Tests vs All Institute Tests */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <button
            type="button"
            onClick={() => { setActiveTab('MY_COURSE'); setSelectedSubject('ALL'); }}
            style={{
              background: activeTab === 'MY_COURSE' ? '#2563eb' : '#f1f5f9',
              color: activeTab === 'MY_COURSE' ? '#ffffff' : '#475569',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
          >
            <Sparkles size={15} /> My Course Tests ({myCourseExams.length})
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('ALL_TESTS'); setSelectedSubject('ALL'); }}
            style={{
              background: activeTab === 'ALL_TESTS' ? '#2563eb' : '#f1f5f9',
              color: activeTab === 'ALL_TESTS' ? '#ffffff' : '#475569',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
          >
            <BookOpen size={15} /> All Institute Tests ({exams.length})
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="samyak-card" style={{ padding: '20px', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
            <Search size={18} style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by test title or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ border: 'none', background: '#f8fafc', padding: '10px 14px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Subject:</span>
              <select
                className="form-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                style={{ width: 'auto', padding: '8px 12px', fontSize: '0.88rem' }}
              >
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Level:</span>
              <select
                className="form-select"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                style={{ width: 'auto', padding: '8px 12px', fontSize: '0.88rem' }}
              >
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Exams Grid */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading tests catalog...</div>
        ) : filteredExams.length === 0 ? (
          <div className="samyak-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <BookOpen size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '6px' }}>No Tests Found</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Try clearing your search query or subject filters.</p>
          </div>
        ) : (
          <div className="grid-3">
            {filteredExams.map((exam) => {
              const isLocked = exam.status === 'LOCKED';
              const isCompleted = exam.status === 'COMPLETED';
              const isReExam = exam.status === 'RE_EXAM_REQUIRED';
              const isAvailable = exam.status === 'AVAILABLE' || exam.status === 'IN_PROGRESS';

              return (
                <div
                  key={exam.id}
                  className="samyak-card"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    opacity: isLocked ? 0.75 : 1,
                    border: isCompleted
                      ? '1.5px solid #86efac'
                      : isReExam
                      ? '1.5px solid #fca5a5'
                      : '1.5px solid var(--border-light)',
                    background: isLocked ? '#fcfcfc' : '#ffffff'
                  }}
                >
                  <div>
                    {/* Top status badges */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span className="badge badge-blue">{exam.subject_name || 'Subject'}</span>
                        <span className="badge badge-purple">{exam.level_name || 'Level'}</span>
                        <span className="badge" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', fontSize: '0.72rem', fontWeight: 700 }}>
                          🌐 English & हिंदी
                        </span>
                      </div>
                      
                      {isCompleted && (
                        <span className="badge badge-green">
                          <CheckCircle2 size={12} /> COMPLETED
                        </span>
                      )}
                      {isLocked && (
                        <span className="badge badge-gray">
                          <Lock size={12} /> LOCKED
                        </span>
                      )}
                      {isReExam && (
                        <span className="badge badge-red">
                          <AlertTriangle size={12} /> RE-EXAM REQ
                        </span>
                      )}
                      {isAvailable && (
                        <span className="badge badge-orange">
                          AVAILABLE
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
                      Topic: {exam.topic_name || 'General'} • Paper #{exam.paper_number}
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px', lineHeight: 1.3 }}>
                      {exam.title}
                    </h3>

                    {/* Meta info */}
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center', gap: '6px', marginBottom: '18px' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Duration</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{exam.duration_minutes}m</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Questions</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{exam.total_questions}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Marks</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{exam.total_marks}</div>
                      </div>
                    </div>

                    {isLocked && (
                      <div style={{ fontSize: '0.82rem', color: '#dc2626', background: '#fef2f2', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Lock size={14} style={{ flexShrink: 0 }} />
                        <span>{exam.locked_reason || 'This test is not available for your course.'}</span>
                      </div>
                    )}

                    {isCompleted && (
                      <div style={{ fontSize: '0.85rem', color: '#15803d', background: '#f0fdf4', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Exam Already Completed</span>
                        <strong style={{ fontSize: '1.1rem' }}>{exam.percentage}%</strong>
                      </div>
                    )}

                    {isReExam && (
                      <div style={{ fontSize: '0.82rem', color: '#991b1b', background: '#fee2e2', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px' }}>
                        Exam violated. Re-examination is pending admin approval.
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div>
                    {isAvailable && (
                      <Link
                        to={`/student/exam/${exam.id}`}
                        className="btn-primary"
                        style={{ width: '100%' }}
                      >
                        <Play size={16} /> Start Examination
                      </Link>
                    )}

                    {isCompleted && (
                      <Link
                        to={exam.attempt_id ? `/student/results/${exam.attempt_id}` : '/student/results'}
                        className="btn-secondary"
                        style={{ width: '100%', borderColor: '#86efac', color: '#15803d', fontWeight: 700 }}
                      >
                        <Award size={16} /> View Scorecard & Certificate
                      </Link>
                    )}

                    {isLocked && (
                      <button
                        disabled
                        className="btn-secondary"
                        style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }}
                      >
                        <Lock size={15} /> Locked for Your Course
                      </button>
                    )}

                    {isReExam && (
                      <button
                        disabled
                        className="btn-danger"
                        style={{ width: '100%', opacity: 0.8, cursor: 'not-allowed' }}
                      >
                        <AlertTriangle size={15} /> Awaiting Admin Approval
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
