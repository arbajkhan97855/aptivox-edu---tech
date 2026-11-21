import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../lib/firestoreApi';
import { Layers, Plus, Trash2, Edit2, ChevronRight, X } from 'lucide-react';

export default function AdminHierarchyPage() {
  const { token } = useAuth();
  const { addToast } = useToast();

  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  // Modals
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectDesc, setSubjectDesc] = useState('');

  const [showTopicModal, setShowTopicModal] = useState(false);
  const [topicName, setTopicName] = useState('');
  const [topicDesc, setTopicDesc] = useState('');

  const loadHierarchy = async () => {
    try {
      setLoading(true);
      const [cRes, sRes, tRes] = await Promise.all([
        apiFetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch('/api/subjects', { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch('/api/topics', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (cRes.ok) {
        const cData = await cRes.json();
        setCourses(cData);
        if (cData.length > 0 && !selectedCourseId) {
          setSelectedCourseId(cData[4]?.id || cData[0].id); // MERN stack or first
        }
      }
      if (sRes.ok) setSubjects(await sRes.json());
      if (tRes.ok) setTopics(await tRes.json());
    } catch (err) {
      console.error('Failed to load hierarchy:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHierarchy();
  }, [token]);

  // Filtered subjects for chosen course
  const currentSubjects = subjects.filter((s) => s.course_id === selectedCourseId);

  // Set default subject when course changes
  useEffect(() => {
    if (currentSubjects.length > 0 && !currentSubjects.find((s) => s.id === selectedSubjectId)) {
      setSelectedSubjectId(currentSubjects[0].id);
    }
  }, [selectedCourseId, currentSubjects, selectedSubjectId]);

  // Filtered topics for chosen subject
  const currentTopics = topics.filter((t) => t.subject_id === selectedSubjectId);

  // Add Subject
  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!subjectName || !selectedCourseId) return;

    try {
      const res = await apiFetch('/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          course_id: selectedCourseId,
          name: subjectName,
          description: subjectDesc
        })
      });
      if (res.ok) {
        addToast('Subject added successfully', 'success');
        setShowSubjectModal(false);
        setSubjectName('');
        setSubjectDesc('');
        loadHierarchy();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Topic
  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!topicName || !selectedSubjectId) return;

    try {
      const res = await apiFetch('/api/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          subject_id: selectedSubjectId,
          name: topicName,
          description: topicDesc
        })
      });
      if (res.ok) {
        addToast('Topic added successfully', 'success');
        setShowTopicModal(false);
        setTopicName('');
        setTopicDesc('');
        loadHierarchy();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubject = async (id, name) => {
    if (!window.confirm(`Delete subject "${name}"?`)) return;
    await apiFetch(`/api/subjects/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    addToast('Subject removed', 'success');
    loadHierarchy();
  };

  const handleDeleteTopic = async (id, name) => {
    if (!window.confirm(`Delete topic "${name}"?`)) return;
    await apiFetch(`/api/topics/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    addToast('Topic removed', 'success');
    loadHierarchy();
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
          Course Hierarchy & Topic Trees
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Organize academic structure: <strong>Course → Subjects → Topics → Exam Papers</strong>.
        </p>
      </div>

      {/* Select Course Bar */}
      <div className="samyak-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <label style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>Select Course:</label>
        <select
          className="form-select"
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          style={{ width: '100%', maxWidth: '340px' }}
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.duration})</option>
          ))}
        </select>
      </div>

      {/* 2-Column Hierarchy View */}
      <div className="dash-split-grid">
        
        {/* Left Column: Subjects under Selected Course */}
        <div className="samyak-card" style={{ padding: '24px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              Subjects ({currentSubjects.length})
            </h3>
            <button onClick={() => setShowSubjectModal(true)} className="btn-primary btn-sm">
              <Plus size={14} /> Add Subject
            </button>
          </div>

          {currentSubjects.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>
              No subjects added for this course yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentSubjects.map((sub) => {
                const isSelected = sub.id === selectedSubjectId;
                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubjectId(sub.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #2563eb' : '1px solid var(--border-light)',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: isSelected ? '#1d4ed8' : '#0f172a', fontSize: '1rem' }}>
                        {sub.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {sub.description || 'Core subject syllabus'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubject(sub.id, sub.name);
                        }}
                        className="btn-icon"
                        style={{ width: '28px', height: '28px', color: '#dc2626' }}
                      >
                        <Trash2 size={13} />
                      </button>
                      <ChevronRight size={18} style={{ color: isSelected ? '#2563eb' : '#94a3b8' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Topics under Selected Subject */}
        <div className="samyak-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Topics & Modules
              </h3>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Under: <strong style={{ color: '#2563eb' }}>{subjects.find((s) => s.id === selectedSubjectId)?.name || 'Subject'}</strong>
              </div>
            </div>
            
            <button
              onClick={() => setShowTopicModal(true)}
              disabled={!selectedSubjectId}
              className="btn-orange btn-sm"
            >
              <Plus size={14} /> Add Topic
            </button>
          </div>

          {currentTopics.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>
              No topics created under this subject yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentTopics.map((top) => (
                <div
                  key={top.id}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-light)',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.98rem' }}>
                      {top.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {top.description || 'Topic tests and papers linked'}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTopic(top.id, top.name)}
                    className="btn-icon"
                    style={{ width: '28px', height: '28px', color: '#dc2626' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Add Subject Modal */}
      {showSubjectModal && (
        <div className="modal-overlay" onClick={() => setShowSubjectModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '460px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>Add New Subject</h3>
            <form onSubmit={handleAddSubject}>
              <div className="form-group">
                <label className="form-label">Subject Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. JavaScript"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Subject Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Modern ES6+, DOM and async concepts"
                  value={subjectDesc}
                  onChange={(e) => setSubjectDesc(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowSubjectModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Add Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
      {showTopicModal && (
        <div className="modal-overlay" onClick={() => setShowTopicModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '460px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>Add New Topic</h3>
            <form onSubmit={handleAddTopic}>
              <div className="form-group">
                <label className="form-label">Topic Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Functions & Closures"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Topic Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Higher-order functions, scope and callback queues"
                  value={topicDesc}
                  onChange={(e) => setTopicDesc(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowTopicModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Add Topic</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
