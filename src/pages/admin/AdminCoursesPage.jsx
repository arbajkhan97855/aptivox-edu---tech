import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../lib/firestoreApi';
import {
  BookOpen, PlusCircle, Trash2, Edit2, Clock, Users, X, Layers,
  Upload, Image, Link2, Check, RefreshCw, Sparkles, CheckSquare, Square
} from 'lucide-react';

const SUBJECT_CATEGORIES = [
  {
    category: 'Web & Frontend Development',
    subjects: [
      { id: 's1', name: 'HTML', desc: 'Semantic HTML5, Forms & Elements' },
      { id: 's2', name: 'CSS', desc: 'CSS3, Flexbox, Grid & Responsive' },
      { id: 's3', name: 'JavaScript', desc: 'Modern ES6+, DOM & Functions' },
      { id: 's4', name: 'React.js', desc: 'Components, Hooks & State' }
    ]
  },
  {
    category: 'Backend, Database & Programming',
    subjects: [
      { id: 's6', name: 'Python', desc: 'Core Python, Loops & OOPs' },
      { id: 's_django', name: 'Django', desc: 'MVT, Models & Web Routing' },
      { id: 's5', name: 'Node.js & Express', desc: 'REST APIs & Middleware' },
      { id: 's_mongo', name: 'MongoDB', desc: 'NoSQL Collections & Queries' },
      { id: 's_mysql', name: 'MySQL', desc: 'Relational Database & SQL' },
      { id: 's_api', name: 'API Integration', desc: 'Endpoints, Postman & JWT' }
    ]
  },
  {
    category: 'Office, Accounting & RS-CIT',
    subjects: [
      { id: 's_word', name: 'MS Word', desc: 'Document Drafting & Mail Merge' },
      { id: 's_ppt', name: 'PowerPoint', desc: 'Slide Design & Presentations' },
      { id: 's_excel', name: 'Excel', desc: 'Spreadsheets & Formulas' },
      { id: 's_adv_excel', name: 'Advance Excel', desc: 'VLOOKUP, Pivots & Dashboards' },
      { id: 's_tally', name: 'Tally / GST', desc: 'Tally Prime, Invoicing & GST' },
      { id: 's_paint', name: 'MS Paint', desc: 'Canvas Tools & Cropping' },
      { id: 's8', name: 'Basic Computer', desc: 'Hardware, Windows & Safety' }
    ]
  },
  {
    category: 'Design, Media & Marketing',
    subjects: [
      { id: 's_photoshop', name: 'Photoshop', desc: 'Photo Editing & Retouching' },
      { id: 's_canva', name: 'Canva', desc: 'Social Media Creatives' },
      { id: 's_coreldraw', name: 'CorelDraw', desc: 'Vector Graphics & Flex Design' },
      { id: 's_video_edit', name: 'Video Editing', desc: 'Trimming, Cuts & Sound Sync' },
      { id: 's_premiere', name: 'Premiere Pro', desc: 'Sequences & Color Grading' },
      { id: 's_after_effects', name: 'After Effects', desc: 'Motion Graphics & VFX' },
      { id: 's_seo', name: 'SEO & Marketing', desc: 'Search Ranking & Digital Ads' }
    ]
  }
];

const COURSE_PRESETS = [
  { label: 'Web Designer', subs: ['s1', 's2', 's3'], desc: 'HTML + CSS + JavaScript' },
  { label: 'Full Stack Web Dev', subs: ['s1', 's2', 's3', 's6', 's_django', 's_mysql'], desc: 'HTML + CSS + JS + Python + Django + MySQL' },
  { label: 'MERN Stack Dev', subs: ['s1', 's2', 's3', 's4', 's5', 's_mongo', 's_mysql', 's_api'], desc: 'HTML + CSS + JS + React + Node + Mongo + MySQL + API' },
  { label: 'CAP', subs: ['s_word', 's_ppt', 's_excel', 's_adv_excel', 's_tally'], desc: 'Word + PPT + Excel + Adv Excel + Tally/GST' },
  { label: 'RS-CIT', subs: ['s_word', 's_ppt', 's_excel', 's_paint', 's8'], desc: 'Word + PPT + Excel + Paint + Basic Computer' },
  { label: 'Digital Marketing (DM)', subs: ['s1', 's_seo'], desc: 'HTML (DM part) + SEO' },
  { label: 'Graphic Designer', subs: ['s_photoshop', 's_canva', 's_coreldraw', 's_video_edit'], desc: 'Photoshop + Canva + CorelDraw + Video Edit' },
  { label: 'Video Editing', subs: ['s_video_edit', 's_premiere', 's_after_effects'], desc: 'Video Edit + Premiere + After Effects' },
  { label: 'Excel Specialist', subs: ['s_excel', 's_adv_excel'], desc: 'Excel + Advance Excel' },
  { label: 'Tally IT', subs: ['s_tally'], desc: 'Tally / GST' }
];

// Flat lookup for subject names
const ALL_FLAT_SUBJECTS = {};
SUBJECT_CATEGORIES.forEach((cat) => {
  cat.subjects.forEach((s) => {
    ALL_FLAT_SUBJECTS[s.id] = s.name;
  });
});

export default function AdminCoursesPage() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // 'file' or 'url' tab mode for image selection
  const [imageMode, setImageMode] = useState('file');
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    duration: '3 Months',
    description: '',
    course_image: '',
    status: 'ACTIVE',
    subjects: ['s1', 's2', 's3']
  });

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setCourses(await res.json());
      }
    } catch (err) {
      console.error('Course load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [token]);

  // Handle local image file upload
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (JPG, PNG, WebP)', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setForm((prev) => ({
        ...prev,
        course_image: event.target.result
      }));
      addToast('Course cover image selected from file!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      addToast('Course name is required', 'warning');
      return;
    }

    try {
      const url = editingId ? `/api/courses/${editingId}` : '/api/courses';
      const method = editingId ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        addToast(editingId ? 'Course updated successfully' : 'Course created successfully', 'success');
        setShowModal(false);
        setEditingId(null);
        setForm({ name: '', duration: '3 Months', description: '', course_image: '', status: 'ACTIVE', subjects: ['s1', 's2', 's3'] });
        loadCourses();
      }
    } catch (err) {
      console.error('Save course error:', err);
      addToast('Failed to save course', 'error');
    }
  };

  const handleEdit = (course) => {
    setEditingId(course.id);
    setForm({
      name: course.name,
      duration: course.duration,
      description: course.description || '',
      course_image: course.course_image || '',
      status: course.status || 'ACTIVE',
      subjects: Array.isArray(course.subjects) && course.subjects.length > 0 ? course.subjects : ['s1', 's2', 's3']
    });
    // If the image is a URL or data URL, set mode accordingly
    setImageMode(course.course_image && !course.course_image.startsWith('data:') ? 'url' : 'file');
    setShowModal(true);
  };

  const toggleSubject = (subId) => {
    setForm((prev) => {
      const current = prev.subjects || [];
      const next = current.includes(subId)
        ? current.filter((id) => id !== subId)
        : [...current, subId];
      return { ...prev, subjects: next };
    });
  };

  const applyPreset = (preset) => {
    setForm((prev) => ({
      ...prev,
      name: prev.name.trim() === '' ? preset.label : prev.name,
      subjects: [...preset.subs]
    }));
    addToast(`Applied ${preset.label} curriculum preset (${preset.subs.length} subjects)`, 'info');
  };

  const selectAllSubjects = () => {
    const allIds = Object.keys(ALL_FLAT_SUBJECTS);
    setForm((prev) => ({ ...prev, subjects: allIds }));
  };

  const clearAllSubjects = () => {
    setForm((prev) => ({ ...prev, subjects: [] }));
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove course "${name}"?`)) return;
    try {
      const res = await apiFetch(`/api/courses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('Course removed successfully', 'success');
        loadCourses();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
            Course Management
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Manage computer &amp; professional certification courses taught at APTIVOX EDUCATION &amp; TECHNOLOGY.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setForm({
              name: '',
              duration: '3 Months',
              description: '',
              course_image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
              status: 'ACTIVE',
              subjects: ['s1', 's2', 's3']
            });
            setImageMode('file');
            setShowModal(true);
          }}
          className="btn-primary"
        >
          <PlusCircle size={16} /> Add New Course
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading courses...</div>
      ) : (
        <div className="grid-3">
          {courses.map((course) => (
            <div key={course.id} className="samyak-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ height: '160px', overflow: 'hidden', position: 'relative', background: '#f1f5f9' }}>
                  <img
                    src={course.course_image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'}
                    alt={course.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <span className={`badge ${course.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`}>
                      {course.status}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.82rem', color: '#64748b', marginBottom: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> {course.duration}
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={13} /> {course.student_count || 0} Students
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                    {course.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '12px' }}>
                    {course.description}
                  </p>

                  {/* Included Subjects Badges */}
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Curriculum Modules</span>
                      <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                        {(course.subjects || []).length} Subjects
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {(course.subjects || []).length === 0 ? (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>No modules selected</span>
                      ) : (
                        (course.subjects || []).map((subId) => (
                          <span
                            key={subId}
                            style={{
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              border: '1px solid #bfdbfe',
                              borderRadius: '6px',
                              padding: '2px 7px',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}
                          >
                            {ALL_FLAT_SUBJECTS[subId] || subId}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '0 20px 20px', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleEdit(course)}
                  className="btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  <Edit2 size={13} /> Edit Course
                </button>
                <button
                  onClick={() => handleDelete(course.id, course.name)}
                  className="btn-danger btn-sm"
                  title="Delete Course"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Course Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ padding: '32px', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                {editingId ? 'Edit Course Details' : 'Create New Course'}
              </h3>
              <button onClick={() => setShowModal(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Course Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. MERN Stack Developer"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Course Duration</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 6 Months"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                />
              </div>

              {/* Course Cover Image with File Upload + Live Preview */}
              <div className="form-group" style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <label className="form-label" style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Image size={15} style={{ color: '#2563eb' }} />
                    Course Cover Image
                  </label>

                  {/* Mode switch tabs: File Upload vs URL */}
                  <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '8px', padding: '2px' }}>
                    <button
                      type="button"
                      onClick={() => setImageMode('file')}
                      style={{
                        background: imageMode === 'file' ? '#ffffff' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: imageMode === 'file' ? '#1d4ed8' : '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Upload size={12} /> Choose from File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      style={{
                        background: imageMode === 'url' ? '#ffffff' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: imageMode === 'url' ? '#1d4ed8' : '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Link2 size={12} /> Image URL
                    </button>
                  </div>
                </div>

                {/* Option 1: File Upload from Computer / Device */}
                {imageMode === 'file' && (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageFileChange}
                      style={{ display: 'none' }}
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: '2px dashed #93c5fd',
                        borderRadius: '12px',
                        padding: '20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: '#ffffff',
                        transition: 'border-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#93c5fd'}
                    >
                      <Upload size={28} style={{ color: '#2563eb', margin: '0 auto 8px' }} />
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                        Click to Browse & Select Image from Device
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        Supports JPG, PNG, WebP (Instant Local Upload)
                      </div>
                    </div>
                  </div>
                )}

                {/* Option 2: Live Web URL */}
                {imageMode === 'url' && (
                  <div>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="Paste image link: https://images.unsplash.com/..."
                      value={form.course_image}
                      onChange={(e) => setForm({ ...form, course_image: e.target.value })}
                      style={{ background: '#ffffff' }}
                    />
                  </div>
                )}

                {/* Live Image Preview Thumbnail */}
                {form.course_image && (
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '14px', background: '#ffffff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                    <img
                      src={form.course_image}
                      alt="Preview"
                      style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                    />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={14} /> Image Selected & Ready
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {form.course_image.startsWith('data:') ? 'Local file uploaded' : form.course_image}
                      </div>
                    </div>
                    {imageMode === 'file' && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                      >
                        Change File
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Course Curriculum & Subjects Selection ("Student ke course me kya kya h") */}
              <div className="form-group" style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <label className="form-label" style={{ margin: 0, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Layers size={16} style={{ color: '#2563eb' }} />
                      Course Curriculum & Subjects (Modules included in this Course) *
                    </label>
                    <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      Select which subjects, tests & study materials students in this course will receive.
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge badge-blue" style={{ fontSize: '0.78rem' }}>
                      {(form.subjects || []).length} Selected
                    </span>
                    <button
                      type="button"
                      onClick={selectAllSubjects}
                      style={{ fontSize: '0.72rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Select All
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={clearAllSubjects}
                      style={{ fontSize: '0.72rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Quick Presets for Common Courses */}
                <div style={{ marginBottom: '14px', background: '#ffffff', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={13} style={{ color: '#f59e0b' }} />
                    One-Click Course Presets (Instant Auto-Select):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {COURSE_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        title={preset.desc}
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          color: '#1e293b',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#dbeafe'; e.currentTarget.style.color = '#1d4ed8'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1e293b'; }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Grouped Subject Checkboxes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {SUBJECT_CATEGORIES.map((catGroup) => (
                    <div key={catGroup.category} style={{ background: '#ffffff', borderRadius: '10px', padding: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                        {catGroup.category}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
                        {catGroup.subjects.map((sub) => {
                          const isChecked = (form.subjects || []).includes(sub.id);
                          return (
                            <label
                              key={sub.id}
                              onClick={() => toggleSubject(sub.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                border: isChecked ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                                background: isChecked ? '#eff6ff' : '#f8fafc',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                            >
                              <div style={{ marginTop: '2px', color: isChecked ? '#2563eb' : '#94a3b8' }}>
                                {isChecked ? <CheckSquare size={16} /> : <Square size={16} />}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: isChecked ? '#1d4ed8' : '#0f172a', lineHeight: 1.2 }}>
                                  {sub.name}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', lineHeight: 1.2 }}>
                                  {sub.desc}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description / Syllabus Overview</label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  placeholder="Overview of modules and topics..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
