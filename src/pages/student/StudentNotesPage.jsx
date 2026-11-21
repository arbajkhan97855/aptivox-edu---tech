import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../lib/firestoreApi';
import { FileText, Download, BookOpen, ExternalLink, Calendar } from 'lucide-react';

export default function StudentNotesPage() {
  const { token, user } = useAuth();
  const { addToast } = useToast();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotes() {
      try {
        const res = await apiFetch('/api/notes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setNotes(await res.json());
        }
      } catch (err) {
        console.error('Failed to load notes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadNotes();
  }, [token]);

  const handleDownload = async (note) => {
    try {
      await apiFetch(`/api/notes/${note.id}/download`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      // Open / trigger download
      window.open(note.pdf_url, '_blank');
      addToast(`Downloading ${note.title}`, 'success');
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  return (
    <div style={{ padding: '36px 0', minHeight: '80vh' }}>
      <div className="container-custom">
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f3e8ff', color: '#7e22ce', padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
            <FileText size={14} /> Course Study Materials
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
            Verified Notes & PDF Handbooks
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Exclusively accessible for enrolled course: <strong style={{ color: '#2563eb' }}>{user?.course_name}</strong>
          </p>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading study materials...</div>
        ) : notes.length === 0 ? (
          <div className="samyak-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <FileText size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '6px' }}>No Notes Uploaded Yet</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Your faculty has not uploaded notes for this course yet. Please check back soon.
            </p>
          </div>
        ) : (
          <div className="grid-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="samyak-card"
                style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={note.cover_image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'}
                      alt={note.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                      <span className="badge badge-blue">{note.subject_name || 'Subject'}</span>
                    </div>
                  </div>

                  <div style={{ padding: '20px' }}>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} /> {note.uploaded_at} • {note.download_count || 0} downloads
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px', lineHeight: 1.3 }}>
                      {note.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '16px' }}>
                      {note.description || 'Verified course study notes prepared by APTIVOX EDUCATION & TECHNOLOGY faculty.'}
                    </p>
                  </div>
                </div>

                <div style={{ padding: '0 20px 20px' }}>
                  <button
                    onClick={() => handleDownload(note)}
                    className="btn-primary"
                    style={{ width: '100%', background: '#1d4ed8' }}
                  >
                    <Download size={16} /> Download Notes PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
