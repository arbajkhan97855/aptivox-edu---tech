import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../lib/firestoreApi';
import { FileSpreadsheet, PlusCircle, Trash2, Edit, Copy, Clock, Award, X, Check } from 'lucide-react';

export default function AdminExamsPage() {
  const { token } = useAuth();
  const { addToast } = useToast();

  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    course_id: '',
    subject_id: '',
    topic_id: '',
    level_id: 'l1',
    paper_number: 1,
    title: '',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.5,
    randomize: true,
    status: 'PUBLISHED'
  });

  const loadExamsData = async () => {
    try {
      setLoading(true);
      const [eRes, cRes, sRes, tRes] = await Promise.all([
        apiFetch('/api/exams', { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch('/api/subjects', { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch('/api/topics', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (eRes.ok) setExams(await eRes.json());
      if (cRes.ok) setCourses(await cRes.json());
      if (sRes.ok) setSubjects(await sRes.json());
      if (tRes.ok) setTopics(await tRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExamsData();
  }, [token]);

  const filteredSubjects = subjects.filter((s) => s.course_id === form.course_id);
  const filteredTopics = topics.filter((t) => t.subject_id === form.subject_id);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.course_id || !form.title) {
      addToast('Please select course and enter exam title', 'warning');
      return;
    }

    try {
      const res = await apiFetch('/api/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        addToast('Exam Paper created successfully!', 'success');
        setShowModal(false);
        loadExamsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete exam paper "${title}"?`)) return;
    try {
      const res = await apiFetch(`/api/exams/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('Exam paper deleted', 'success');
        loadExamsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
            Exam Papers Management
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Configure papers (Paper 1, 2, 3...) across Basic, Medium, and Advanced levels.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              course_id: courses[0]?.id || '',
              subject_id: '',
              topic_id: '',
              level_id: 'l1',
              paper_number: 1,
              title: '',
              duration_minutes: 60,
              total_questions: 50,
              total_marks: 100,
              passing_marks: 40,
              negative_marking: 0.5,
              randomize: true,
              status: 'PUBLISHED'
            });
            setShowModal(true);
          }}
          className="btn-primary"
        >
          <PlusCircle size={16} /> Create Exam Paper
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading exam papers...</div>
      ) : (
        <div className="samyak-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="samyak-table">
              <thead>
                <tr>
                  <th>Exam Title</th>
                  <th>Course & Subject</th>
                  <th>Level & Paper</th>
                  <th>Duration</th>
                  <th>Questions</th>
                  <th>Marks (Pass)</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((paper) => (
                  <tr key={paper.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{paper.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Negative marking: -{paper.negative_marking}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#2563eb' }}>{paper.course_name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#475569' }}>{paper.subject_name || 'General'}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="badge badge-purple">{paper.level_name || 'Level'}</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Paper #{paper.paper_number}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                        <Clock size={13} style={{ color: '#64748b' }} /> {paper.duration_minutes}m
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-blue">
                        {paper.actual_questions_count || paper.total_questions} Questions
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>{paper.total_marks}</span>
                      <span style={{ fontSize: '0.78rem', color: '#16a34a' }}> (Min {paper.passing_marks})</span>
                    </td>
                    <td>
                      <span className={`badge ${paper.status === 'PUBLISHED' ? 'badge-green' : 'badge-gray'}`}>
                        {paper.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(paper.id, paper.title)}
                        className="btn-icon"
                        style={{ color: '#dc2626' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Paper Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', padding: '30px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                Create Examination Paper
              </h3>
              <button onClick={() => setShowModal(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-grid-2">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Exam Paper Title *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. JavaScript Master - Paper 1 (ES6 & Closures)"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Course *</label>
                  <select
                    required
                    className="form-select"
                    value={form.course_id}
                    onChange={(e) => setForm({ ...form, course_id: e.target.value, subject_id: '', topic_id: '' })}
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select
                    className="form-select"
                    value={form.subject_id}
                    onChange={(e) => setForm({ ...form, subject_id: e.target.value, topic_id: '' })}
                  >
                    <option value="">-- Select Subject --</option>
                    {filteredSubjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Topic</label>
                  <select
                    className="form-select"
                    value={form.topic_id}
                    onChange={(e) => setForm({ ...form, topic_id: e.target.value })}
                  >
                    <option value="">-- Select Topic --</option>
                    {filteredTopics.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Test Difficulty Level</label>
                  <select
                    className="form-select"
                    value={form.level_id}
                    onChange={(e) => setForm({ ...form, level_id: e.target.value })}
                  >
                    <option value="l1">Basic Test</option>
                    <option value="l2">Medium Test</option>
                    <option value="l3">Advanced Test</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Paper Number</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={form.paper_number}
                    onChange={(e) => setForm({ ...form, paper_number: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="10"
                    className="form-input"
                    value={form.duration_minutes}
                    onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Total Questions (Default 50)</label>
                  <input
                    type="number"
                    min="5"
                    className="form-input"
                    value={form.total_questions}
                    onChange={(e) => setForm({ ...form, total_questions: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Total Marks</label>
                  <input
                    type="number"
                    min="10"
                    className="form-input"
                    value={form.total_marks}
                    onChange={(e) => setForm({ ...form, total_marks: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Passing Marks</label>
                  <input
                    type="number"
                    min="10"
                    className="form-input"
                    value={form.passing_marks}
                    onChange={(e) => setForm({ ...form, passing_marks: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Negative Marks Per Wrong</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    className="form-input"
                    value={form.negative_marking}
                    onChange={(e) => setForm({ ...form, negative_marking: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Exam Paper
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
