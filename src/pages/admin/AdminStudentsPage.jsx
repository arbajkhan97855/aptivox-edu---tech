import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../lib/firestoreApi';
import {
  Users, UserPlus, Search, Filter, Camera, Upload, Trash2,
  Edit, KeyRound, ShieldCheck, X, Check, RefreshCw, Eye, Award,
  Layers, CheckSquare, Square, Sparkles, AlertTriangle, Copy, EyeOff, Lock
} from 'lucide-react';

const SUBJECT_LIST = [
  // Web & Full Stack
  { id: 's1', name: 'HTML' },
  { id: 's2', name: 'CSS' },
  { id: 's3', name: 'JavaScript' },
  { id: 's4', name: 'React.js' },
  { id: 's5', name: 'Node.js & Express' },
  { id: 's_mongo', name: 'MongoDB' },
  { id: 's_mysql', name: 'MySQL' },
  { id: 's_api', name: 'API Integration' },
  { id: 's6', name: 'Python' },
  { id: 's_django', name: 'Django' },

  // Office & RS-CIT
  { id: 's_word', name: 'MS Word' },
  { id: 's_ppt', name: 'PowerPoint' },
  { id: 's_excel', name: 'Excel' },
  { id: 's_adv_excel', name: 'Advance Excel' },
  { id: 's_tally', name: 'Tally / GST' },
  { id: 's_paint', name: 'MS Paint' },
  { id: 's8', name: 'Basic Computer' },

  // Design & Media
  { id: 's_photoshop', name: 'Photoshop' },
  { id: 's_canva', name: 'Canva' },
  { id: 's_coreldraw', name: 'CorelDraw' },
  { id: 's_video_edit', name: 'Video Editing' },
  { id: 's_premiere', name: 'Premiere Pro' },
  { id: 's_after_effects', name: 'After Effects' },
  { id: 's_seo', name: 'SEO & Marketing' }
];

const ALL_FLAT_SUBJECTS = {};
SUBJECT_LIST.forEach((s) => { ALL_FLAT_SUBJECTS[s.id] = s.name; });

export default function AdminStudentsPage() {
  const { token } = useAuth();
  const { addToast } = useToast();

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('aptivox@123');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [resetSuccessInfo, setResetSuccessInfo] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  // Delete Confirmation Modal State
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActivatingLogins, setIsActivatingLogins] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    father_name: '',
    email: '',
    mobile: '',
    dob: '2004-01-01',
    address: '',
    course_id: '',
    enrolled_subjects: ['s1', 's2', 's3'],
    batch: '',
    status: 'ACTIVE',
    password: '',
    profile_image: ''
  });

  // Form State for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    father_name: '',
    email: '',
    mobile: '',
    dob: '2004-01-01',
    address: '',
    course_id: '',
    enrolled_subjects: ['s1', 's2', 's3'],
    batch: 'Morning 9:00 AM - 11:00 AM',
    password: 'student123',
    profile_image: ''
  });

  // WebCam Live Capture State
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Fetch Students & Courses
  const fetchData = async () => {
    try {
      setLoading(true);
      const [stuRes, courseRes] = await Promise.all([
        apiFetch('/api/students', { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (stuRes.ok) setStudents(await stuRes.json());
      if (courseRes.ok) setCourses(await courseRes.json());
    } catch (err) {
      console.error('Fetch error:', err);
      addToast('Failed to load students data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Clean up webcam on modal close
  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsWebcamActive(false);
  };

  // Start Webcam
  const startWebcam = async () => {
    try {
      stopWebcam();
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        addToast('Webcam not supported in this browser. Please upload a photo instead.', 'warning');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 480, facingMode: 'user' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsWebcamActive(true);
    } catch {
      setIsWebcamActive(false);
      addToast('Camera unavailable or permission denied. Please upload a photo from device.', 'info');
    }
  };

  // Snap Photo from Video Stream
  const snapPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, 320, 320);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);
    if (showEditModal) {
      setEditFormData((prev) => ({ ...prev, profile_image: dataUrl }));
    } else {
      setFormData((prev) => ({ ...prev, profile_image: dataUrl }));
    }
    stopWebcam();
    addToast('Photo captured successfully!', 'success');
  };

  // File Upload to Data URL
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedPhoto(reader.result);
      if (showEditModal) {
        setEditFormData((prev) => ({ ...prev, profile_image: reader.result }));
      } else {
        setFormData((prev) => ({ ...prev, profile_image: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCourseChange = (courseId) => {
    const course = courses.find((c) => c.id === courseId);
    const subs = (course && Array.isArray(course.subjects) && course.subjects.length > 0)
      ? course.subjects
      : ['s1', 's2', 's3'];
    setFormData((prev) => ({
      ...prev,
      course_id: courseId,
      enrolled_subjects: [...subs]
    }));
  };

  const handleEditCourseChange = (courseId) => {
    const course = courses.find((c) => c.id === courseId);
    const subs = (course && Array.isArray(course.subjects) && course.subjects.length > 0)
      ? course.subjects
      : ['s1', 's2', 's3'];
    setEditFormData((prev) => ({
      ...prev,
      course_id: courseId,
      enrolled_subjects: [...subs]
    }));
  };

  const toggleStudentSubject = (subId, isEdit = false) => {
    if (isEdit) {
      setEditFormData((prev) => {
        const current = prev.enrolled_subjects || [];
        const next = current.includes(subId)
          ? current.filter((id) => id !== subId)
          : [...current, subId];
        return { ...prev, enrolled_subjects: next };
      });
    } else {
      setFormData((prev) => {
        const current = prev.enrolled_subjects || [];
        const next = current.includes(subId)
          ? current.filter((id) => id !== subId)
          : [...current, subId];
        return { ...prev, enrolled_subjects: next };
      });
    }
  };

  // Open Edit Student Modal
  const handleOpenEditModal = (stu) => {
    setSelectedStudent(stu);
    setEditingStudentId(stu.id);
    const stuCourse = courses.find((c) => c.id === stu.course_id);
    const existingSubs = (Array.isArray(stu.enrolled_subjects) && stu.enrolled_subjects.length > 0)
      ? stu.enrolled_subjects
      : (stuCourse?.subjects || ['s1', 's2', 's3']);

    setEditFormData({
      name: stu.name || '',
      father_name: stu.father_name || '',
      email: stu.email || '',
      mobile: stu.mobile || '',
      dob: stu.dob || '2004-01-01',
      address: stu.address || '',
      course_id: stu.course_id || '',
      enrolled_subjects: [...existingSubs],
      batch: stu.batch || '',
      status: stu.status || 'ACTIVE',
      password: '',
      profile_image: stu.profile_image || ''
    });
    setCapturedPhoto(stu.profile_image || null);
    setIsWebcamActive(false);
    setShowEditModal(true);
  };

  // Submit Update Student
  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!editFormData.name || !editFormData.course_id) {
      addToast('Student Name and Course are required', 'warning');
      return;
    }

    try {
      const payload = { ...editFormData };
      if (!payload.password || payload.password.trim() === '') {
        delete payload.password;
      }

      const res = await apiFetch(`/api/students/${editingStudentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || 'Failed to update student', 'error');
        return;
      }

      addToast(`Student "${editFormData.name}" updated successfully!`, 'success');
      setShowEditModal(false);
      stopWebcam();
      setCapturedPhoto(null);
      fetchData();
    } catch (err) {
      console.error('Update student error:', err);
      addToast('Network error while updating student', 'error');
    }
  };

  // Submit Add Student
  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.course_id) {
      addToast('Student Name and Course are required', 'warning');
      return;
    }

    try {
      const res = await apiFetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || 'Failed to add student', 'error');
        return;
      }

      addToast(`Student created! Assigned ID: ${data.student_id}`, 'success');
      setShowAddModal(false);
      stopWebcam();
      setCapturedPhoto(null);
      setFormData({
        name: '',
        father_name: '',
        email: '',
        mobile: '',
        dob: '2004-01-01',
        address: '',
        course_id: '',
        enrolled_subjects: ['s1', 's2', 's3'],
        batch: 'Morning 9:00 AM - 11:00 AM',
        password: 'student123',
        profile_image: ''
      });
      fetchData();
    } catch (err) {
      console.error('Add student error:', err);
      addToast('Network error while saving student', 'error');
    }
  };

  // Delete Student - In-App Confirmation Modal (Does not use window.confirm)
  const promptDeleteStudent = (stu) => {
    setStudentToDelete(stu);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      setIsDeleting(true);
      const res = await apiFetch(`/api/students/${studentToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        addToast(data.error || 'Failed to delete student', 'error');
        return;
      }
      addToast(`Student "${studentToDelete.name}" (${studentToDelete.student_id}) deleted successfully!`, 'success');
      setStudentToDelete(null);
      fetchData();
    } catch (err) {
      console.error('Delete error:', err);
      addToast('Network error while deleting student', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Reset Password Modal
  const handleOpenResetModal = (stu) => {
    setSelectedStudent(stu);
    setNewPassword('aptivox@123');
    setShowPasswordText(false);
    setCopiedPass(false);
    setResetSuccessInfo(null);
    setShowResetModal(true);
  };

  const generateRandomPassword = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let rand = '';
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(`Aptivox@${rand}`);
  };

  const handleCopyCredentials = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedPass(true);
      addToast('Credentials copied to clipboard!', 'info');
      setTimeout(() => setCopiedPass(false), 2500);
    }
  };

  // Reset Password
  const handleResetPassword = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedStudent) return;
    if (!newPassword || newPassword.trim() === '') {
      addToast('Please enter a new password', 'warning');
      return;
    }
    try {
      setIsResetting(true);
      const res = await apiFetch(`/api/students/${selectedStudent.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ new_password: newPassword.trim() })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        addToast(data.error || 'Failed to reset student password', 'error');
        return;
      }
      addToast(`Password updated successfully for ${selectedStudent.name}!`, 'success');
      setResetSuccessInfo({
        name: selectedStudent.name,
        student_id: selectedStudent.student_id,
        email: selectedStudent.email,
        password: newPassword.trim()
      });
      fetchData();
    } catch (err) {
      console.error('Reset error:', err);
      addToast('Network error while resetting password', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const unprovisionedCount = students.filter((s) => !s.uid).length;

  const handleActivateSeededStudents = async () => {
    try {
      setIsActivatingLogins(true);
      const res = await apiFetch('/api/students/activate-seeded', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        addToast(data.error || 'Failed to activate student logins', 'error');
        return;
      }
      addToast(data.message || 'Student login accounts activated!', 'success');
      fetchData();
    } catch {
      addToast('Error while activating student login credentials', 'error');
    } finally {
      setIsActivatingLogins(false);
    }
  };

  // Filtered list
  const filteredStudents = students.filter((stu) => {
    const matchesCourse = selectedCourse === 'ALL' || stu.course_id === selectedCourse;
    const matchesSearch = stu.name.toLowerCase().includes(search.toLowerCase()) ||
                          stu.student_id.toLowerCase().includes(search.toLowerCase()) ||
                          (stu.mobile && stu.mobile.includes(search));
    return matchesCourse && matchesSearch;
  });

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
            Student Management
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Enroll students, capture live webcam verification photos, and manage exam credentials.
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddModal(true);
            setCapturedPhoto(null);
            setIsWebcamActive(false);
          }}
          className="btn-primary"
        >
          <UserPlus size={16} /> Enroll New Student
        </button>
      </div>

      {unprovisionedCount > 0 && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fcd34d',
            borderRadius: '14px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '0.88rem', color: '#92400e' }}>
            <strong>{unprovisionedCount} student account(s)</strong> need cloud password activation before they can sign in with Student ID.
          </div>
          <button
            type="button"
            onClick={handleActivateSeededStudents}
            disabled={isActivatingLogins}
            className="btn-primary btn-sm"
            style={{ background: '#d97706' }}
          >
            {isActivatingLogins ? (
              <>
                <RefreshCw size={14} className="spin" /> Activating...
              </>
            ) : (
              <>
                <KeyRound size={14} /> Activate Student Logins (student123)
              </>
            )}
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="samyak-card" style={{ padding: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <Search size={18} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search student by name, student ID, or mobile..."
            className="form-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: '#f8fafc', padding: '10px 14px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Filter Course:</span>
          <select
            className="form-select"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.88rem' }}
          >
            <option value="ALL">All Enrolled Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="samyak-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="samyak-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Student ID</th>
                <th>Enrolled Course</th>
                <th>Batch</th>
                <th>Contact</th>
                <th>Exams Taken</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No student records matching criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => (
                  <tr key={stu.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={stu.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={stu.name}
                          style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #cbd5e1' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{stu.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Father: {stu.father_name || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', padding: '3px 8px', borderRadius: '6px', display: 'inline-block' }}>
                        {stu.student_id}
                      </span>
                      <div style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: 700, color: stu.uid ? '#16a34a' : '#d97706' }}>
                        {stu.uid ? 'Login Active' : 'Needs Activation'}
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{stu.course_name}</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                        {(stu.enrolled_subjects || []).slice(0, 3).map((subId) => (
                          <span
                            key={subId}
                            style={{
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              border: '1px solid #bfdbfe',
                              borderRadius: '4px',
                              padding: '1px 5px',
                              fontSize: '0.68rem',
                              fontWeight: 700
                            }}
                          >
                            {ALL_FLAT_SUBJECTS[subId] || subId}
                          </span>
                        ))}
                        {(stu.enrolled_subjects || []).length > 3 && (
                          <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, padding: '1px 3px' }}>
                            +{(stu.enrolled_subjects || []).length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#475569' }}>{stu.batch}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>+91 {stu.mobile || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{stu.email}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="badge badge-blue">{stu.completed_exams || 0} Done</span>
                        {stu.avg_score > 0 && (
                          <span className="badge badge-green">{stu.avg_score}%</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${stu.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`}>
                        {stu.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEditModal(stu)}
                          className="btn-icon"
                          title="Edit Student Data"
                          style={{ width: '32px', height: '32px', color: '#2563eb', background: '#eff6ff' }}
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenResetModal(stu)}
                          className="btn-icon"
                          title="Reset Password (Key)"
                          style={{ width: '32px', height: '32px', color: '#ea580c', background: '#fff7ed' }}
                        >
                          <KeyRound size={15} />
                        </button>
                        <button
                          onClick={() => promptDeleteStudent(stu)}
                          className="btn-icon"
                          title="Delete Student"
                          style={{ width: '32px', height: '32px', color: '#dc2626', background: '#fef2f2' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          ADD STUDENT MODAL WITH LIVE CAMERA & UPLOAD PHOTO
         ======================================================== */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => { setShowAddModal(false); stopWebcam(); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                  Enroll New Student
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  Assign course, generate Student ID, and capture photo.
                </p>
              </div>
              <button onClick={() => { setShowAddModal(false); stopWebcam(); }} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStudent}>
              
              {/* Photo Section with Live Camera Option & File Upload */}
              <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)', marginBottom: '20px' }}>
                <label className="form-label" style={{ marginBottom: '10px' }}>
                  Student Photo (Live Camera Snapshot or File Upload)
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  {/* Photo Preview Circle */}
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #2563eb', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {capturedPhoto ? (
                      <img src={capturedPhoto} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Users size={40} style={{ color: '#94a3b8' }} />
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={startWebcam}
                        className="btn-primary btn-sm"
                        style={{ background: '#1d4ed8' }}
                      >
                        <Camera size={15} /> Capture Live Photo
                      </button>

                      <label className="btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                        <Upload size={15} /> Upload Photo
                        <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                      </label>
                    </div>

                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Recommended: Take live webcam portrait during registration for exam verification.
                    </span>
                  </div>
                </div>

                {/* Webcam Stream Box if active */}
                {isWebcamActive && (
                  <div style={{ marginTop: '16px', background: '#020617', padding: '14px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{ width: '280px', height: '280px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #22c55e' }}
                    />
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                      <button type="button" onClick={snapPhoto} className="btn-primary btn-sm" style={{ background: '#16a34a' }}>
                        <Check size={14} /> Snap Photo
                      </button>
                      <button type="button" onClick={stopWebcam} className="btn-secondary btn-sm">
                        Cancel Camera
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Input Fields */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Father's Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Mr. Ramesh Sharma"
                    value={formData.father_name}
                    onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assign Course *</label>
                  <select
                    required
                    className="form-select"
                    value={formData.course_id}
                    onChange={(e) => handleCourseChange(e.target.value)}
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.duration})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Batch Timings</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Morning 9:00 AM - 11:00 AM"
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="9829012345"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Student Email Address (Optional)</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="student@aptivox.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Set Student Password * (min 6 chars)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showAddPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      className="form-input"
                      placeholder="Default: student123"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddPassword(!showAddPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      title={showAddPassword ? 'Hide password' : 'Show password'}
                    >
                      {showAddPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Notes / Batch Reference (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Optional internal note"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              {/* Student Course Modules / Subjects Selection ("student ke course me kya kya h") */}
              {formData.course_id && (
                <div style={{ marginTop: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                    <div>
                      <label className="form-label" style={{ margin: 0, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Layers size={16} style={{ color: '#2563eb' }} />
                        Student Course Modules & Subjects (What is included for this student) *
                      </label>
                      <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                        Is student ke course me kaunse subjects shamil honge? Tick/untick karein:
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-blue">
                        {(formData.enrolled_subjects || []).length} Subjects Selected
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const course = courses.find((c) => c.id === formData.course_id);
                          setFormData((prev) => ({
                            ...prev,
                            enrolled_subjects: course?.subjects || ['s1', 's2', 's3']
                          }));
                        }}
                        style={{ fontSize: '0.72rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                      >
                        Reset to Course Default
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px', maxHeight: '200px', overflowY: 'auto', padding: '2px' }}>
                    {SUBJECT_LIST.map((sub) => {
                      const isChecked = (formData.enrolled_subjects || []).includes(sub.id);
                      return (
                        <label
                          key={sub.id}
                          onClick={() => toggleStudentSubject(sub.id, false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '7px 10px',
                            borderRadius: '8px',
                            border: isChecked ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                            background: isChecked ? '#eff6ff' : '#ffffff',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            fontWeight: isChecked ? 700 : 500,
                            color: isChecked ? '#1d4ed8' : '#334155',
                            userSelect: 'none'
                          }}
                        >
                          {isChecked ? <CheckSquare size={15} color="#2563eb" /> : <Square size={15} color="#94a3b8" />}
                          <span>{sub.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); stopWebcam(); }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ background: '#0f2445' }}
                >
                  <UserPlus size={16} /> Save & Enroll Student
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          RESET PASSWORD MODAL (KEY ICON)
         ======================================================== */}
      {showResetModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Reset Student Password
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Generate or set new login credentials
                  </span>
                </div>
              </div>
              <button onClick={() => setShowResetModal(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            {/* Student Info Card */}
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{selectedStudent.name}</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                  {selectedStudent.student_id}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Course: <strong style={{ color: '#334155' }}>{selectedStudent.course_name || 'Enrolled Course'}</strong>
              </div>
              {selectedStudent.mobile && (
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  Mobile: <span style={{ color: '#334155' }}>+91 {selectedStudent.mobile}</span>
                </div>
              )}
            </div>

            {resetSuccessInfo ? (
              <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px', padding: '18px', textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: '#16a34a' }}>
                  <Check size={22} />
                </div>
                <h4 style={{ color: '#166534', fontWeight: 800, fontSize: '1.05rem', marginBottom: '4px' }}>
                  Password Changed Successfully!
                </h4>
                <p style={{ color: '#15803d', fontSize: '0.82rem', marginBottom: '14px' }}>
                  Student credentials have been updated in the portal.
                </p>

                <div style={{ background: '#ffffff', borderRadius: '8px', padding: '10px 14px', border: '1px solid #bbf7d0', textAlign: 'left', marginBottom: '16px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Student ID:</span>
                    <strong style={{ fontFamily: 'monospace', color: '#1d4ed8' }}>{resetSuccessInfo.student_id}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b' }}>New Password:</span>
                    <strong style={{ fontFamily: 'monospace', color: '#0f172a', fontSize: '0.95rem' }}>{resetSuccessInfo.password}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleCopyCredentials(`Student ID: ${resetSuccessInfo.student_id}\nPassword: ${resetSuccessInfo.password}\nPortal: APTIVOX EDUCATION & TECHNOLOGY`)}
                    className="btn-secondary btn-sm"
                    style={{ background: '#ffffff', color: '#15803d', borderColor: '#86efac' }}
                  >
                    {copiedPass ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    {copiedPass ? 'Copied!' : 'Copy Credentials'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="btn-primary btn-sm"
                    style={{ background: '#16a34a' }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Enter New Password *</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setNewPassword('aptivox@123')}
                        style={{ fontSize: '0.72rem', color: '#0284c7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Default (aptivox@123)
                      </button>
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        style={{ fontSize: '0.72rem', color: '#ea580c', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Random
                      </button>
                    </div>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPasswordText ? 'text' : 'password'}
                      className="form-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      style={{ paddingRight: '40px' }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      title={showPasswordText ? 'Hide password' : 'Show password'}
                    >
                      {showPasswordText ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '6px' }}>
                    Student logs in using Student ID (<strong>{selectedStudent.student_id}</strong>) and this new password (minimum 6 characters). Updating immediately replaces their active login password.
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <button type="button" onClick={() => setShowResetModal(false)} className="btn-secondary" disabled={isResetting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ background: '#ea580c' }} disabled={isResetting}>
                    {isResetting ? (
                      <>
                        <RefreshCw size={15} className="spin" /> Updating...
                      </>
                    ) : (
                      <>
                        <KeyRound size={15} /> Update Password Now
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          DELETE STUDENT CONFIRMATION MODAL (IN-APP DIALOG)
         ======================================================== */}
      {studentToDelete && (
        <div className="modal-overlay" onClick={() => !isDeleting && setStudentToDelete(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', flexShrink: 0 }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991b1b', margin: 0 }}>
                  Delete Student?
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  This will permanently remove student account
                </span>
              </div>
            </div>

            <p style={{ color: '#334155', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '14px' }}>
              Are you sure you want to permanently delete student{' '}
              <strong style={{ color: '#0f172a' }}>"{studentToDelete.name}"</strong>?
            </p>

            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '18px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>Student ID:</span>
                <strong style={{ fontFamily: 'monospace', color: '#1d4ed8' }}>{studentToDelete.student_id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>Course:</span>
                <strong style={{ color: '#0f172a' }}>{studentToDelete.course_name || 'Enrolled Course'}</strong>
              </div>
              {studentToDelete.mobile && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Mobile:</span>
                  <span style={{ color: '#475569' }}>+91 {studentToDelete.mobile}</span>
                </div>
              )}
            </div>

            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', padding: '10px 12px', marginBottom: '20px', fontSize: '0.78rem', color: '#9f1239' }}>
              <strong>Notice:</strong> All exam attempts, answer sheets, and student verification records for this student will also be removed. This action cannot be undone.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="btn-secondary"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="btn-primary"
                style={{ background: '#dc2626' }}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <RefreshCw size={15} className="spin" /> Deleting Student...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} /> Yes, Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          EDIT STUDENT MODAL
         ======================================================== */}
      {showEditModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => { setShowEditModal(false); stopWebcam(); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                    Edit Student Details
                  </h3>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', padding: '2px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>
                    {selectedStudent.student_id}
                  </span>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
                  Update student profile, course assignment, batch, and contact information.
                </p>
              </div>
              <button onClick={() => { setShowEditModal(false); stopWebcam(); }} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent}>
              {/* Photo Section with Live Camera Option & File Upload */}
              <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)', marginBottom: '20px' }}>
                <label className="form-label" style={{ marginBottom: '10px' }}>
                  Student Photo (Webcam Snapshot or File Upload)
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #2563eb', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {capturedPhoto ? (
                      <img src={capturedPhoto} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Users size={36} style={{ color: '#94a3b8' }} />
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={startWebcam}
                        className="btn-primary btn-sm"
                        style={{ background: '#1d4ed8' }}
                      >
                        <Camera size={14} /> Retake Live Photo
                      </button>

                      <label className="btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                        <Upload size={14} /> Upload New Photo
                        <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                      </label>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      You can keep existing photo or update with live webcam/file.
                    </span>
                  </div>
                </div>

                {isWebcamActive && (
                  <div style={{ marginTop: '16px', background: '#020617', padding: '14px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{ width: '260px', height: '260px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #22c55e' }}
                    />
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                      <button type="button" onClick={snapPhoto} className="btn-primary btn-sm" style={{ background: '#16a34a' }}>
                        <Check size={14} /> Snap Photo
                      </button>
                      <button type="button" onClick={stopWebcam} className="btn-secondary btn-sm">
                        Cancel Camera
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Input Fields */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Father's Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.father_name}
                    onChange={(e) => setEditFormData({ ...editFormData, father_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Course *</label>
                  <select
                    required
                    className="form-select"
                    value={editFormData.course_id}
                    onChange={(e) => handleEditCourseChange(e.target.value)}
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.duration})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Batch Timings</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.batch}
                    onChange={(e) => setEditFormData({ ...editFormData, batch: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={editFormData.mobile}
                    onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Account Status</label>
                  <select
                    className="form-select"
                    value={editFormData.status === 'DEACTIVATED' ? 'DEACTIVATED' : 'ACTIVE'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  >
                    <option value="ACTIVE">ACTIVE (Can Take Exams)</option>
                    <option value="DEACTIVATED">DEACTIVATED (Blocked)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-input"
                    value={editFormData.dob}
                    onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Update Student Password (Optional)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      minLength={6}
                      className="form-input"
                      placeholder="Leave blank to keep existing password"
                      value={editFormData.password}
                      onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      title={showEditPassword ? 'Hide password' : 'Show password'}
                    >
                      {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes / Reference (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  />
                </div>
              </div>

              {/* Edit Modal Course Modules / Subjects Selection */}
              {editFormData.course_id && (
                <div style={{ marginTop: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                    <div>
                      <label className="form-label" style={{ margin: 0, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Layers size={16} style={{ color: '#2563eb' }} />
                        Student Course Modules & Subjects (What is included for this student) *
                      </label>
                      <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                        Customize which subjects and exams are provided to this student:
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-blue">
                        {(editFormData.enrolled_subjects || []).length} Subjects Active
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const course = courses.find((c) => c.id === editFormData.course_id);
                          setEditFormData((prev) => ({
                            ...prev,
                            enrolled_subjects: course?.subjects || ['s1', 's2', 's3']
                          }));
                        }}
                        style={{ fontSize: '0.72rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                      >
                        Reset to Course Default
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px', maxHeight: '200px', overflowY: 'auto', padding: '2px' }}>
                    {SUBJECT_LIST.map((sub) => {
                      const isChecked = (editFormData.enrolled_subjects || []).includes(sub.id);
                      return (
                        <label
                          key={sub.id}
                          onClick={() => toggleStudentSubject(sub.id, true)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '7px 10px',
                            borderRadius: '8px',
                            border: isChecked ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                            background: isChecked ? '#eff6ff' : '#ffffff',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            fontWeight: isChecked ? 700 : 500,
                            color: isChecked ? '#1d4ed8' : '#334155',
                            userSelect: 'none'
                          }}
                        >
                          {isChecked ? <CheckSquare size={15} color="#2563eb" /> : <Square size={15} color="#94a3b8" />}
                          <span>{sub.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); stopWebcam(); }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ background: '#2563eb' }}
                >
                  <Check size={16} /> Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
