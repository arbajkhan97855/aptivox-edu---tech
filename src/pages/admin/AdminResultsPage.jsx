import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/firestoreApi';
import { Award, Download, Search, Printer, Eye, Calendar } from 'lucide-react';

export default function AdminResultsPage() {
  const { token } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadResults() {
      try {
        setLoading(true);
        const res = await apiFetch('/api/admin/results', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setResults(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, [token]);

  const handleExportCSV = () => {
    const headers = ['Student ID', 'Student Name', 'Course', 'Paper', 'Score', 'Total', 'Percentage', 'Status', 'Date'];
    const rows = results.map((r) => [
      r.student_id,
      r.student_name,
      r.course_name,
      `"${r.paper_title}"`,
      r.score,
      r.total_marks,
      `${r.percentage}%`,
      r.status,
      new Date(r.submitted_at).toLocaleDateString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aptivox_exam_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = results.filter((r) =>
    r.student_name.toLowerCase().includes(search.toLowerCase()) ||
    r.student_id.toLowerCase().includes(search.toLowerCase()) ||
    r.paper_title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
            Examination Results & Records
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Comprehensive institutional gradebook with exportable CSV and printable scorecards.
          </p>
        </div>

        <button onClick={handleExportCSV} className="btn-secondary">
          <Download size={15} /> Export Gradebook CSV
        </button>
      </div>

      <div className="samyak-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={18} style={{ color: '#94a3b8' }} />
        <input
          type="text"
          placeholder="Search by student name, ID or paper title..."
          className="form-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: 'none', background: 'transparent' }}
        />
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading results...</div>
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
                  <th>Score / Max</th>
                  <th>Percentage</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Certificate</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{item.student_name}</strong>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1d4ed8' }}>
                        {item.student_id}
                      </span>
                    </td>
                    <td>{item.course_name}</td>
                    <td>{item.paper_title}</td>
                    <td>
                      <strong>{item.score}</strong> / {item.total_marks}
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: item.percentage >= 40 ? '#15803d' : '#dc2626' }}>
                        {item.percentage}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${item.status === 'COMPLETED' ? 'badge-green' : 'badge-orange'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        to={`/student/results/${item.id}`}
                        target="_blank"
                        className="btn-primary btn-sm"
                        style={{ background: '#0f2445' }}
                      >
                        <Eye size={13} /> View Scorecard
                      </Link>
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
