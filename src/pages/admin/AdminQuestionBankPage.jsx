import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../lib/firestoreApi';
import {
  HelpCircle, PlusCircle, Upload, Trash2, Edit2, Check,
  Download, FileSpreadsheet, Search, Filter, X, CheckCircle2
} from 'lucide-react';

export default function AdminQuestionBankPage() {
  const { token } = useAuth();
  const { addToast } = useToast();

  const [questions, setQuestions] = useState([]);
  const [papers, setPapers] = useState([]);
  const [selectedPaperId, setSelectedPaperId] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  // Add Question Form
  const [form, setForm] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    marks: 2,
    negative_marks: 0.5,
    explanation: '',
    difficulty: 'MEDIUM'
  });

  // Edit Question Form
  const [editForm, setEditForm] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    marks: 2,
    negative_marks: 0.5,
    explanation: '',
    difficulty: 'MEDIUM',
    paper_id: ''
  });

  // Bulk Import state
  const [importJsonText, setImportJsonText] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, qRes] = await Promise.all([
        apiFetch('/api/exams', { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch('/api/questions', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (pRes.ok) {
        const pData = await pRes.json();
        setPapers(pData);
        if (pData.length > 0 && !selectedPaperId) {
          setSelectedPaperId(pData[0].id);
        }
      }
      if (qRes.ok) setQuestions(await qRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const filteredQuestions = selectedPaperId
    ? questions.filter((q) => q.paper_id === selectedPaperId)
    : questions;

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!form.question_text.trim() || !form.option_a.trim() || !form.correct_answer) {
      addToast('Please fill question text and options', 'warning');
      return;
    }

    try {
      const res = await apiFetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          paper_id: selectedPaperId
        })
      });
      if (res.ok) {
        addToast('Question added to paper successfully', 'success');
        setShowAddModal(false);
        setForm({
          question_text: '',
          option_a: '',
          option_b: '',
          option_c: '',
          option_d: '',
          correct_answer: 'A',
          marks: 2,
          negative_marks: 0.5,
          explanation: '',
          difficulty: 'MEDIUM'
        });
        loadData();
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to add question', 'error');
    }
  };

  // Open Edit Modal with pre-filled question data
  const handleOpenEditModal = (q) => {
    setEditingQuestionId(q.id);
    setEditForm({
      question_text: q.question_text || '',
      option_a: q.option_a || '',
      option_b: q.option_b || '',
      option_c: q.option_c || '',
      option_d: q.option_d || '',
      correct_answer: q.correct_answer || 'A',
      marks: q.marks !== undefined ? q.marks : 2,
      negative_marks: q.negative_marks !== undefined ? q.negative_marks : 0.5,
      explanation: q.explanation || '',
      difficulty: q.difficulty || 'MEDIUM',
      paper_id: q.paper_id || selectedPaperId
    });
    setShowEditModal(true);
  };

  // Save Question Edits
  const handleSaveEditQuestion = async (e) => {
    e.preventDefault();
    if (!editForm.question_text.trim() || !editForm.option_a.trim() || !editForm.correct_answer) {
      addToast('Please fill question text and options', 'warning');
      return;
    }

    try {
      const res = await apiFetch(`/api/questions/${editingQuestionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        const updated = await res.json();
        // Update local questions list
        setQuestions((prev) =>
          prev.map((item) => (item.id === editingQuestionId ? { ...item, ...updated } : item))
        );
        addToast('Question updated successfully!', 'success');
        setShowEditModal(false);
        setEditingQuestionId(null);
        loadData();
      } else {
        addToast('Failed to update question', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Error updating question', 'error');
    }
  };

  const handleBulkImport = async () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed)) {
        addToast('JSON must be an array of question objects', 'error');
        return;
      }

      const res = await apiFetch('/api/questions/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          paper_id: selectedPaperId,
          questions: parsed
        })
      });

      if (res.ok) {
        const data = await res.json();
        addToast(data.message || 'Questions imported successfully!', 'success');
        setShowImportModal(false);
        setImportJsonText('');
        loadData();
      } else {
        const err = await res.json();
        addToast(err.error || 'Import failed', 'error');
      }
    } catch (err) {
      addToast('Invalid JSON syntax: ' + err.message, 'error');
    }
  };

  const handleDownloadSample = () => {
    const sample = [
      {
        question_text: "What does HTML stand for?",
        option_a: "Hyper Text Markup Language",
        option_b: "High Text Modern Language",
        option_c: "Hyper Transfer Markup Level",
        option_d: "Home Tool Markup Language",
        correct_answer: "A",
        marks: 2,
        negative_marks: 0.5,
        difficulty: "EASY",
        explanation: "HTML is the standard markup language for documents designed to be displayed in a web browser."
      },
      {
        question_text: "Which HTML tag is used to define an internal style sheet?",
        option_a: "<css>",
        option_b: "<script>",
        option_c: "<style>",
        option_d: "<design>",
        correct_answer: "C",
        marks: 2,
        negative_marks: 0.5,
        difficulty: "MEDIUM",
        explanation: "<style> tag is placed inside <head> to write internal CSS rules."
      }
    ];

    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sample_questions_${selectedPaperId || 'exam'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Sample JSON template downloaded!', 'info');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question from paper?')) return;
    try {
      const res = await apiFetch(`/api/questions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('Question deleted', 'success');
        setQuestions((prev) => prev.filter((q) => q.id !== id));
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
            Question Bank
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Maintain comprehensive MCQ bank, edit individual questions, and bulk import question papers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowImportModal(true)} className="btn-secondary">
            <Upload size={15} /> Bulk Import Questions
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            <PlusCircle size={15} /> Add Question
          </button>
        </div>
      </div>

      {/* Select Paper Bar */}
      <div className="samyak-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 260px', flexWrap: 'wrap', minWidth: 0 }}>
          <label style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>Filter Exam Paper:</label>
          <select
            className="form-select"
            value={selectedPaperId}
            onChange={(e) => setSelectedPaperId(e.target.value)}
            style={{ width: '100%', maxWidth: '380px', flex: '1 1 240px' }}
          >
            {papers.map((p) => (
              <option key={p.id} value={p.id}>{p.title} ({p.actual_questions_count || p.total_questions} Questions)</option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
          Showing <strong>{filteredQuestions.length}</strong> questions in paper
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading questions...</div>
      ) : filteredQuestions.length === 0 ? (
        <div className="samyak-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <HelpCircle size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '6px' }}>No Questions Found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Add a question or use bulk import to load 50 questions.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredQuestions.map((q, idx) => (
            <div key={q.id} className="samyak-card" style={{ padding: '20px', transition: 'box-shadow 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: '1 1 240px', minWidth: 0 }}>
                  <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#1d4ed8', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {idx + 1}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.4 }}>
                      {q.question_text}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', flexShrink: 0 }}>
                  <span className="badge badge-blue">Marks: +{q.marks || 2}</span>
                  <span className="badge badge-purple">{q.difficulty || 'MEDIUM'}</span>
                  
                  {/* Edit Question Button */}
                  <button
                    onClick={() => handleOpenEditModal(q)}
                    className="btn-icon"
                    title="Edit Question"
                    style={{ width: '32px', height: '32px', color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe' }}
                  >
                    <Edit2 size={14} />
                  </button>

                  {/* Delete Question Button */}
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="btn-icon"
                    title="Delete Question"
                    style={{ width: '32px', height: '32px', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Options Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '10px', marginBottom: '12px' }}>
                {[
                  { key: 'A', text: q.option_a },
                  { key: 'B', text: q.option_b },
                  { key: 'C', text: q.option_c },
                  { key: 'D', text: q.option_d }
                ].map((opt) => {
                  const isCorrect = q.correct_answer === opt.key;
                  return (
                    <div
                      key={opt.key}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: isCorrect ? '#f0fdf4' : '#f8fafc',
                        border: isCorrect ? '1.5px solid #22c55e' : '1px solid var(--border-light)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.88rem'
                      }}
                    >
                      <span style={{ fontWeight: 800, color: isCorrect ? '#15803d' : '#64748b' }}>
                        {opt.key}.
                      </span>
                      <span style={{ color: isCorrect ? '#166534' : '#1e293b', fontWeight: isCorrect ? 600 : 400 }}>
                        {opt.text}
                      </span>
                      {isCorrect && <Check size={14} style={{ color: '#16a34a', marginLeft: 'auto' }} />}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div style={{ paddingLeft: '44px', fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic' }}>
                  Explanation: {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Single Question Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>Edit Question</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>Modify question text, MCQ options, correct answer, or marks</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="btn-icon"><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveEditQuestion}>
              <div className="form-group">
                <label className="form-label">Question Text *</label>
                <textarea
                  rows={3}
                  required
                  className="form-textarea"
                  placeholder="Enter MCQ question..."
                  value={editForm.question_text}
                  onChange={(e) => setEditForm({ ...editForm, question_text: e.target.value })}
                />
              </div>

              <div className="form-grid-2" style={{ marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 800, color: '#2563eb' }}>Option A *</span>
                    {editForm.correct_answer === 'A' && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Correct</span>}
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editForm.option_a}
                    onChange={(e) => setEditForm({ ...editForm, option_a: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 800, color: '#2563eb' }}>Option B *</span>
                    {editForm.correct_answer === 'B' && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Correct</span>}
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editForm.option_b}
                    onChange={(e) => setEditForm({ ...editForm, option_b: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 800, color: '#2563eb' }}>Option C</span>
                    {editForm.correct_answer === 'C' && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Correct</span>}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.option_c}
                    onChange={(e) => setEditForm({ ...editForm, option_c: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 800, color: '#2563eb' }}>Option D</span>
                    {editForm.correct_answer === 'D' && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Correct</span>}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.option_d}
                    onChange={(e) => setEditForm({ ...editForm, option_d: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Correct Answer *</label>
                  <select
                    className="form-select"
                    value={editForm.correct_answer}
                    onChange={(e) => setEditForm({ ...editForm, correct_answer: e.target.value })}
                    style={{ fontWeight: 700 }}
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Marks (+)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    value={editForm.marks}
                    onChange={(e) => setEditForm({ ...editForm, marks: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select
                    className="form-select"
                    value={editForm.difficulty}
                    onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Explanation</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Why this option is correct..."
                  value={editForm.explanation}
                  onChange={(e) => setEditForm({ ...editForm, explanation: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Single Question Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', padding: '30px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>Add Question to Paper</h3>
              <button onClick={() => setShowAddModal(false)} className="btn-icon"><X size={18} /></button>
            </div>

            <form onSubmit={handleAddQuestion}>
              <div className="form-group">
                <label className="form-label">Question Text *</label>
                <textarea
                  rows={3}
                  required
                  className="form-textarea"
                  placeholder="Enter MCQ question..."
                  value={form.question_text}
                  onChange={(e) => setForm({ ...form, question_text: e.target.value })}
                />
              </div>

              <div className="form-grid-2" style={{ marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Option A *</label>
                  <input type="text" required className="form-input" value={form.option_a} onChange={(e) => setForm({ ...form, option_a: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Option B *</label>
                  <input type="text" required className="form-input" value={form.option_b} onChange={(e) => setForm({ ...form, option_b: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Option C</label>
                  <input type="text" className="form-input" value={form.option_c} onChange={(e) => setForm({ ...form, option_c: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Option D</label>
                  <input type="text" className="form-input" value={form.option_d} onChange={(e) => setForm({ ...form, option_d: e.target.value })} />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Correct Answer</label>
                  <select className="form-select" value={form.correct_answer} onChange={(e) => setForm({ ...form, correct_answer: e.target.value })}>
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Marks</label>
                  <input type="number" className="form-input" value={form.marks} onChange={(e) => setForm({ ...form, marks: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select className="form-select" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Explanation</label>
                <input type="text" className="form-input" placeholder="Why this option is correct..." value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save to Paper</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>Bulk Import 50 Questions</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Fast load questions directly into paper JSON format</p>
              </div>
              <button onClick={() => setShowImportModal(false)} className="btn-icon"><X size={18} /></button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <button onClick={handleDownloadSample} className="btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Download size={14} /> Download Sample Question Template (.json)
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Paste Questions JSON Array</label>
              <textarea
                rows={10}
                className="form-textarea"
                style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
                placeholder='[{"question_text": "Sample?", "option_a": "A", "option_b": "B", "option_c": "C", "option_d": "D", "correct_answer": "A"}]'
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button type="button" onClick={() => setShowImportModal(false)} className="btn-secondary">Cancel</button>
              <button type="button" onClick={handleBulkImport} className="btn-primary">Import Questions</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
