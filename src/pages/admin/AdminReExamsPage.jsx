import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../lib/firestoreApi';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Clock, ShieldAlert } from 'lucide-react';

export default function AdminReExamsPage() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [reExams, setReExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReExams = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/admin/re-exams', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setReExams(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReExams();
  }, [token]);

  const handleApprove = async (attemptId, studentName) => {
    try {
      const res = await apiFetch(`/api/admin/re-exams/${attemptId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        addToast(`Re-exam approved for ${studentName}. Attempt reset.`, 'success');
        loadReExams();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (attemptId) => {
    try {
      const res = await apiFetch(`/api/admin/re-exams/${attemptId}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('Re-exam request rejected', 'info');
        loadReExams();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fee2e2', color: '#b91c1c', padding: '3px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
            <ShieldAlert size={12} /> Proctoring Flags & Violations
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
            Re-Examination Requests
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Review students who encountered integrity flags or exited exam windows.
          </p>
        </div>

        <button onClick={loadReExams} className="btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh Requests
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading re-exam requests...</div>
      ) : reExams.length === 0 ? (
        <div className="samyak-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <CheckCircle size={48} style={{ color: '#22c55e', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '6px' }}>No Pending Violations</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            All candidate attempts are currently compliant.
          </p>
        </div>
      ) : (
        <div className="samyak-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="samyak-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Student ID</th>
                  <th>Course</th>
                  <th>Paper Title</th>
                  <th>Violation Detail</th>
                  <th>Total Flags</th>
                  <th style={{ textAlign: 'right' }}>Admin Decision</th>
                </tr>
              </thead>
              <tbody>
                {reExams.map((r) => (
                  <tr key={r.attempt_id}>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{r.student_name}</strong>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1d4ed8' }}>
                        {r.student_id}
                      </span>
                    </td>
                    <td>{r.course_name}</td>
                    <td>
                      <strong>{r.paper_title}</strong>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 600 }}>
                        {r.last_violation}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Timestamp: {new Date(r.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-red">{r.violation_count} Incidents</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => handleApprove(r.attempt_id, r.student_name)}
                          className="btn-primary btn-sm"
                          style={{ background: '#16a34a' }}
                        >
                          <CheckCircle size={14} /> Allow Re-Exam
                        </button>
                        <button
                          onClick={() => handleReject(r.attempt_id)}
                          className="btn-danger btn-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
