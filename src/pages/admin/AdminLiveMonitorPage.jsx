import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/firestoreApi';
import { MonitorPlay, ShieldCheck, AlertTriangle, RefreshCw, Clock, Camera } from 'lucide-react';

export default function AdminLiveMonitorPage() {
  const { token } = useAuth();
  const [liveStudents, setLiveStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLive = async () => {
    try {
      const res = await apiFetch('/api/admin/live-monitor', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setLiveStudents(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 5000); // Poll every 5s for live surveillance
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
            <div className="live-dot"></div> Live Proctoring Surveillance
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
            Active Exam Candidates
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Real-time feed of students currently answering exam papers. Auto-refreshes every 5s.
          </p>
        </div>

        <button onClick={fetchLive} className="btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh Monitor
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Scanning active test sessions...</div>
      ) : liveStudents.length === 0 ? (
        <div className="samyak-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <MonitorPlay size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '6px' }}>No Students Currently in Exam</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            When students begin an examination from their portal, their live camera status, timer, and integrity alerts will display here.
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
                  <th>Exam Paper</th>
                  <th>Started At</th>
                  <th>Camera State</th>
                  <th>Violations</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {liveStudents.map((live) => (
                  <tr key={live.attempt_id}>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{live.student_name}</strong>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1d4ed8' }}>
                        {live.student_id}
                      </span>
                    </td>
                    <td>{live.course_name}</td>
                    <td>
                      <strong>{live.paper_title}</strong>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                        <Clock size={13} style={{ color: '#64748b' }} />
                        {new Date(live.started_at).toLocaleTimeString()}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Camera size={12} /> VERIFIED
                      </span>
                    </td>
                    <td>
                      {live.violation_count > 0 ? (
                        <span className="badge badge-red" style={{ fontWeight: 800 }}>
                          <AlertTriangle size={12} /> {live.violation_count} Flags
                        </span>
                      ) : (
                        <span className="badge badge-gray">0 Clear</span>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-blue">
                        <div className="live-dot" style={{ width: '6px', height: '6px' }}></div> LIVE EXAM
                      </span>
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
