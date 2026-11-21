import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../lib/firestoreApi';
import { FileText, PlusCircle, Trash2, Download, ExternalLink, X, Upload, Link2, File, Check, Image } from 'lucide-react';

export default function AdminNotesPage() {
  const { token } = useAuth();
  const { addToast } = useToast();

  const [notes, setNotes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [pdfMode, setPdfMode] = useState('file'); // 'file' or 'url'
  const [coverMode, setCoverMode] = useState('file'); // 'file' or 'url'

  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfFileSize, setPdfFileSize] = useState('');

  const pdfInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    course_id: '',
    subject_id: '',
    description: '',
    pdf_url: '',
    cover_image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [nRes, cRes, sRes] = await Promise.all([
        apiFetch('/api/notes', { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch('/api/subjects', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (nRes.ok) setNotes(await nRes.json());
      if (cRes.ok) setCourses(await cRes.json());
      if (sRes.ok) setSubjects(await sRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Handle PDF file selection from computer
  const handlePdfFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfFileName(file.name);
    setPdfFileSize((file.size / 1024 / 1024).toFixed(2) + ' MB');

    const reader = new FileReader();
    reader.onload = (event) => {
      setForm((prev) => ({
        ...prev,
        pdf_url: event.target.result
      }));
      addToast(`Selected PDF: ${file.name}`, 'success');
    };
    reader.readAsDataURL(file);
  };

  // Handle Cover image file selection
  const handleCoverFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setForm((prev) => ({
        ...prev,
        cover_image: event.target.result
      }));
      addToast('Cover image selected from file!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.course_id) {
      addToast('Please enter title and select course', 'warning');
      return;
    }

    if (!form.pdf_url) {
      addToast('Please select a PDF file or provide a URL', 'warning');
      return;
    }

    try {
      const res = await apiFetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        addToast('Study Notes PDF published successfully!', 'success');
        setShowModal(false);
        setPdfFileName('');
        setPdfFileSize('');
        setForm({
          title: '',
          course_id: '',
          subject_id: '',
          description: '',
          pdf_url: '',
          cover_image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'
        });
        loadData();
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to upload notes', 'error');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete notes "${title}"?`)) return;
    try {
      const res = await apiFetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('Notes removed', 'success');
        loadData();
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
            Study Notes & PDF Repository
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Upload course materials and digital handbooks directly from your computer.
          </p>
        </div>

        <button
          onClick={() => {
            setPdfFileName('');
            setPdfFileSize('');
            setPdfMode('file');
            setCoverMode('file');
            setForm({
              title: '',
              course_id: courses[0]?.id || '',
              subject_id: '',
              description: '',
              pdf_url: '',
              cover_image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'
            });
            setShowModal(true);
          }}
          className="btn-primary"
        >
          <PlusCircle size={16} /> Upload Notes PDF
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading notes repository...</div>
      ) : (
        <div className="grid-3">
          {notes.map((note) => (
            <div key={note.id} className="samyak-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <img
                  src={note.cover_image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'}
                  alt={note.title}
                  style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                />
                <div style={{ padding: '18px' }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                    <span className="badge badge-blue">{note.course_name}</span>
                    <span className="badge badge-purple">{note.subject_name || 'Subject'}</span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                    {note.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
                    {note.description || 'Comprehensive verified course study material.'}
                  </p>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '10px' }}>
                    Downloads: {note.download_count || 0}
                  </div>
                </div>
              </div>

              <div style={{ padding: '0 18px 18px', display: 'flex', gap: '8px' }}>
                <a
                  href={note.pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary btn-sm"
                  style={{ flex: 1, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <ExternalLink size={13} /> Preview PDF
                </a>
                <button
                  onClick={() => handleDelete(note.id, note.title)}
                  className="btn-danger btn-sm"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Notes Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>Upload Study Notes</h3>
              <button onClick={() => setShowModal(false)} className="btn-icon"><X size={18} /></button>
            </div>

            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label className="form-label">Notes Title *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. MERN Stack Complete Handbook"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Course *</label>
                <select
                  required
                  className="form-select"
                  value={form.course_id}
                  onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                >
                  <option value="">-- Select Course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* PDF Document Upload Section with File Picker */}
              <div className="form-group" style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <label className="form-label" style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={15} style={{ color: '#dc2626' }} />
                    PDF Document File *
                  </label>

                  {/* Switch between local file and URL */}
                  <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '8px', padding: '2px' }}>
                    <button
                      type="button"
                      onClick={() => setPdfMode('file')}
                      style={{
                        background: pdfMode === 'file' ? '#ffffff' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: pdfMode === 'file' ? '#1d4ed8' : '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Upload size={12} /> Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setPdfMode('url')}
                      style={{
                        background: pdfMode === 'url' ? '#ffffff' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: pdfMode === 'url' ? '#1d4ed8' : '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Link2 size={12} /> Document Link
                    </button>
                  </div>
                </div>

                {/* Mode 1: Local PDF File Browse */}
                {pdfMode === 'file' && (
                  <div>
                    <input
                      type="file"
                      ref={pdfInputRef}
                      accept=".pdf,application/pdf"
                      onChange={handlePdfFileChange}
                      style={{ display: 'none' }}
                    />

                    <div
                      onClick={() => pdfInputRef.current?.click()}
                      style={{
                        border: '2px dashed #fca5a5',
                        borderRadius: '12px',
                        padding: '20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: '#ffffff',
                        transition: 'border-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#dc2626'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#fca5a5'}
                    >
                      <FileText size={30} style={{ color: '#dc2626', margin: '0 auto 8px' }} />
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                        Click to Browse & Select PDF from Computer
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        Supports PDF files (.pdf)
                      </div>
                    </div>

                    {pdfFileName && (
                      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fef2f2', padding: '10px 14px', borderRadius: '10px', border: '1px solid #fecaca' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Check size={16} style={{ color: '#16a34a' }} />
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#991b1b' }}>{pdfFileName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{pdfFileSize}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => pdfInputRef.current?.click()}
                          className="btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                        >
                          Change PDF
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Mode 2: PDF Web Link */}
                {pdfMode === 'url' && (
                  <div>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="Paste PDF link: https://example.com/file.pdf"
                      value={form.pdf_url}
                      onChange={(e) => setForm({ ...form, pdf_url: e.target.value })}
                      style={{ background: '#ffffff' }}
                    />
                  </div>
                )}
              </div>

              {/* Cover Image Upload (Optional) */}
              <div className="form-group" style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label className="form-label" style={{ margin: 0, fontSize: '0.84rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Image size={14} style={{ color: '#2563eb' }} />
                    Cover Thumbnail Image
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="file"
                      ref={coverInputRef}
                      accept="image/*"
                      onChange={handleCoverFileChange}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                    >
                      <Upload size={12} /> Choose Image File
                    </button>
                  </div>
                </div>

                {form.cover_image && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={form.cover_image}
                      alt="Cover Preview"
                      style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {form.cover_image.startsWith('data:') ? 'Custom image file uploaded' : 'Default cover image'}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  placeholder="Brief overview of content covered in this handbook..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Publish Notes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
