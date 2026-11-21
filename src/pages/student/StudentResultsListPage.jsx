import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/firestoreApi';
import {
  Award, CheckCircle2, XCircle, ArrowRight, Calendar,
  Clock, Search, Filter, History, TrendingUp
} from 'lucide-react';

export default function StudentResultsListPage() {
  const { token, user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('DATE_DESC');

  useEffect(() => {
    async function loadResults() {
      try {
        setError('');
        const res = await apiFetch('/api/student/results', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          throw new Error('Unable to load exam history.');
        }
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load exam history:', err);
        setError('Could not load your examination history. Please refresh and try again.');
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, [token]);

  const summary = useMemo(() => {
    const total = results.length;
    const passed = results.filter((r) => Boolean(r.passed)).length;
    const failed = total - passed;
    const avgPct = total > 0
      ? Math.round(results.reduce((acc, r) => acc + (Number(r.percentage) || 0), 0) / total)
      : 0;
    return { total, passed, failed, avgPct };
  }, [results]);

  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = results.filter((item) => {
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PASSED' && Boolean(item.passed)) ||
        (statusFilter === 'FAILED' && !item.passed);

      if (!matchesStatus) return false;
      if (!q) return true;

      return (
        (item.title || '').toLowerCase().includes(q) ||
        (item.subject_name || '').toLowerCase().includes(q) ||
        (item.topic_name || '').toLowerCase().includes(q) ||
        (item.level_name || '').toLowerCase().includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.submitted_at || a.started_at || 0).getTime();
      const dateB = new Date(b.submitted_at || b.started_at || 0).getTime();
      if (sortBy === 'DATE_ASC') return dateA - dateB;
      if (sortBy === 'SCORE_DESC') return (Number(b.percentage) || 0) - (Number(a.percentage) || 0);
      if (sortBy === 'SCORE_ASC') return (Number(a.percentage) || 0) - (Number(b.percentage) || 0);
      return dateB - dateA;
    });
  }, [results, searchQuery, statusFilter, sortBy]);

  const formatDateTime = (dateVal) => {
    if (!dateVal) return { date: '—', time: '' };
    const d = new Date(dateVal);
    if (Number.isNaN(d.getTime())) return { date: '—', time: '' };
    return {
      date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const formatDuration = (secs) => {
    const totalSecs = Number(secs) || 0;
    if (totalSecs <= 0) return '—';
    const mins = Math.floor(totalSecs / 60);
    const rem = totalSecs % 60;
    if (mins === 0) return `${rem}s`;
    return `${mins}m ${rem}s`;
  };

  return (
    <div style={{ padding: '36px 0', minHeight: '80vh' }}>
      <div className="container-custom">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '26px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '8px' }}>
              <History size={14} /> Academic Record
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
              Exam History
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '4px' }}>
              Past test scores, dates taken, and Pass/Fail status for <strong style={{ color: '#0f172a' }}>{user?.name}</strong> ({user?.student_id})
            </p>
          </div>

          <Link to="/student/tests" className="btn-primary btn-sm">
            Attempt New Test <ArrowRight size={15} />
          </Link>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid-4" style={{ marginBottom: '24px' }}>
          <div className="aptivox-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Exams Taken</span>
              <Award size={18} style={{ color: '#0284c7' }} />
            </div>
            <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{summary.total}</div>
          </div>

          <div className="aptivox-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Passed</span>
              <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
            </div>
            <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#15803d' }}>{summary.passed}</div>
          </div>

          <div className="aptivox-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Failed</span>
              <XCircle size={18} style={{ color: '#dc2626' }} />
            </div>
            <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#dc2626' }}>{summary.failed}</div>
          </div>

          <div className="aptivox-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Average Score</span>
              <TrendingUp size={18} style={{ color: '#7c3aed' }} />
            </div>
            <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7c3aed' }}>{summary.avgPct}%</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        {!loading && results.length > 0 && (
          <div className="aptivox-card" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '380px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search by test title, subject, or level..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                <Filter size={15} /> Status:
              </div>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: 'auto', minWidth: '130px' }}
              >
                <option value="ALL">All ({summary.total})</option>
                <option value="PASSED">Passed ({summary.passed})</option>
                <option value="FAILED">Failed ({summary.failed})</option>
              </select>

              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: 'auto', minWidth: '160px' }}
              >
                <option value="DATE_DESC">Date: Newest First</option>
                <option value="DATE_ASC">Date: Oldest First</option>
                <option value="SCORE_DESC">Score: High to Low</option>
                <option value="SCORE_ASC">Score: Low to High</option>
              </select>
            </div>
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="aptivox-card" style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
            Loading your exam history...
          </div>
        ) : error ? (
          <div className="aptivox-card" style={{ padding: '40px 24px', textAlign: 'center', borderColor: '#fecaca', background: '#fef2f2', color: '#991b1b' }}>
            <p style={{ fontWeight: 600, marginBottom: '12px' }}>{error}</p>
            <button onClick={() => window.location.reload()} className="btn-secondary btn-sm">Retry</button>
          </div>
        ) : results.length === 0 ? (
          <div className="aptivox-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Award size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '6px' }}>No Exam History Yet</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
              You haven&apos;t completed any tests yet. Attempt an exam to view your scores and status here.
            </p>
            <Link to="/student/tests" className="btn-primary">Browse Available Tests</Link>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="aptivox-card" style={{ padding: '48px 20px', textAlign: 'center' }}>
            <p style={{ color: '#475569', fontWeight: 600, marginBottom: '14px' }}>
              No exam history records match your current search or filter.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
              className="btn-secondary btn-sm"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="aptivox-card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="aptivox-table">
                <thead>
                  <tr>
                    <th style={{ width: '52px' }}>#</th>
                    <th>Examination</th>
                    <th>Date Taken</th>
                    <th>Answers</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Scorecard</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((item, index) => {
                    const { date, time } = formatDateTime(item.submitted_at || item.started_at);
                    const isPassed = Boolean(item.passed);
                    return (
                      <tr key={item.id}>
                        <td className="tabular-nums" style={{ fontWeight: 700, color: '#64748b' }}>
                          {index + 1}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem', marginBottom: '4px' }}>
                            {item.title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            {item.subject_name && (
                              <span className="badge badge-blue">{item.subject_name}</span>
                            )}
                            {item.level_name && (
                              <span className="badge badge-purple">{item.level_name}</span>
                            )}
                            {item.paper_number && (
                              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                                Paper #{item.paper_number}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>
                            <Calendar size={14} style={{ color: '#0284c7' }} />
                            {date}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#64748b', marginTop: '3px', whiteSpace: 'nowrap' }}>
                            {time && <span>{time}</span>}
                            {item.time_taken_seconds > 0 && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <Clock size={12} /> {formatDuration(item.time_taken_seconds)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="tabular-nums" style={{ fontSize: '0.84rem', whiteSpace: 'nowrap' }}>
                          <span style={{ color: '#15803d', fontWeight: 700 }}>{item.correct_count || 0} Correct</span>
                          <span style={{ color: '#cbd5e1', margin: '0 6px' }}>|</span>
                          <span style={{ color: '#dc2626', fontWeight: 700 }}>{item.wrong_count || 0} Wrong</span>
                          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                            Skipped: {item.unanswered_count || 0}
                          </div>
                        </td>
                        <td className="tabular-nums" style={{ whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                            {item.score} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>/ {item.total_marks || 100}</span>
                          </div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isPassed ? '#15803d' : '#dc2626' }}>
                            {item.percentage}%
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${isPassed ? 'badge-green' : 'badge-red'}`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 800 }}
                          >
                            {isPassed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                            {isPassed ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <Link
                            to={`/student/results/${item.id}`}
                            className="btn-secondary btn-sm"
                            style={{ padding: '7px 12px', fontSize: '0.82rem' }}
                          >
                            View Scorecard <ArrowRight size={13} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
