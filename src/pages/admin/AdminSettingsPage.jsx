import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../lib/firestoreApi';
import { Settings, Save, ShieldCheck, Building2, Clock, Camera } from 'lucide-react';

export default function AdminSettingsPage() {
  const { token } = useAuth();
  const { addToast } = useToast();

  const [settings, setSettings] = useState({
    institute_name: 'APTIVOX EDUCATION & TECHNOLOGY',
    tagline: 'Learn Today. Achieve Tomorrow.',
    contact: '9785589164',
    email: 'aptivoxeducation@gmail.com',
    passing_percentage: 40,
    default_exam_duration: 60,
    camera_required: true,
    fullscreen_required: true,
    re_exam_policy: 'STRICT_ADMIN_APPROVAL'
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await apiFetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        addToast('Institute & Examination configuration saved successfully', 'success');
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to save settings', 'error');
    }
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading settings...</div>;

  return (
    <div style={{ maxWidth: '820px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
          Institute & Proctoring Settings
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Configure center branding, examination thresholds, and anti-cheat policies.
        </p>
      </div>

      <form onSubmit={handleSave}>
        {/* Institute Info Card */}
        <div className="samyak-card" style={{ padding: '28px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} style={{ color: '#2563eb' }} /> Institute Identity
          </h3>

          <div className="form-grid-2">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Institute Name</label>
              <input
                type="text"
                className="form-input"
                value={settings.institute_name}
                onChange={(e) => setSettings({ ...settings, institute_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tagline</label>
              <input
                type="text"
                className="form-input"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Helpline Contact</label>
              <input
                type="text"
                className="form-input"
                value={settings.contact}
                onChange={(e) => setSettings({ ...settings, contact: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Official Email</label>
              <input
                type="email"
                className="form-input"
                value={settings.email || ''}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Exam Policies Card */}
        <div className="samyak-card" style={{ padding: '28px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} style={{ color: '#ea580c' }} /> Examination Integrity Controls
          </h3>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Default Passing Percentage (%)</label>
              <input
                type="number"
                min="30"
                max="80"
                className="form-input"
                value={settings.passing_percentage}
                onChange={(e) => setSettings({ ...settings, passing_percentage: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Default Duration (Minutes)</label>
              <input
                type="number"
                min="15"
                max="180"
                className="form-input"
                value={settings.default_exam_duration}
                onChange={(e) => setSettings({ ...settings, default_exam_duration: Number(e.target.value) })}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 0' }}>
                <input
                  type="checkbox"
                  checked={settings.camera_required}
                  onChange={(e) => setSettings({ ...settings, camera_required: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                />
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0f172a' }}>
                  Enforce Webcam Video Verification during all online tests
                </span>
              </label>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 0' }}>
                <input
                  type="checkbox"
                  checked={settings.fullscreen_required}
                  onChange={(e) => setSettings({ ...settings, fullscreen_required: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                />
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0f172a' }}>
                  Enforce Fullscreen Mode and Tab-Switch Detection
                </span>
              </label>
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ padding: '12px 28px', fontSize: '1rem' }}>
          <Save size={16} /> Save System Settings
        </button>
      </form>
    </div>
  );
}
