import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User, ShieldCheck, Mail, Phone, MapPin, Calendar, BookOpen,
  Lock, AlertCircle, Building2
} from 'lucide-react';

export default function StudentProfilePage() {
  const { user } = useAuth();

  return (
    <div style={{ padding: '36px 0', minHeight: '80vh' }}>
      <div className="container-custom" style={{ maxWidth: '880px' }}>
        
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
            <User size={14} /> Student Identification Record
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
            My Candidate Profile
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Official registered details with APTIVOX EDUCATION &amp; TECHNOLOGY
          </p>
        </div>

        {/* Read-Only Notice */}
        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', color: '#92400e', marginBottom: '28px' }}>
          <AlertCircle size={20} style={{ flexShrink: 0, color: '#d97706' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            Profile changes can only be made by Admin. If any information needs correction, please contact the admission office at 9785589164 or aptivoxeducation@gmail.com.
          </span>
        </div>

        <div className="samyak-card" style={{ padding: '36px' }}>
          {/* Top Banner with Photo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-light)', paddingBottom: '28px', marginBottom: '28px' }}>
            <img
              src={user?.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
              alt={user?.name}
              style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #1d4ed8', boxShadow: '0 4px 12px rgba(29,78,216,0.15)' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                  {user?.name}
                </h2>
                <span className="badge badge-green">ACTIVE STUDENT</span>
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1d4ed8', fontFamily: 'monospace', marginBottom: '6px' }}>
                ID: {user?.student_id}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#475569' }}>
                Enrolled in: <strong>{user?.course_name}</strong>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                <Mail size={14} style={{ color: '#2563eb' }} /> Registered Email
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{user?.email || 'N/A'}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                <Phone size={14} style={{ color: '#16a34a' }} /> Contact Mobile
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>+91 {user?.mobile || '9785589164'}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                <Calendar size={14} style={{ color: '#ea580c' }} /> Assigned Batch
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{user?.batch || 'Regular Morning'}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                <Building2 size={14} style={{ color: '#7c3aed' }} /> Institute
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>APTIVOX EDUCATION &amp; TECHNOLOGY</div>
            </div>

            {user?.address && (
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)', gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                  <MapPin size={14} style={{ color: '#0284c7' }} /> Address
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#0f172a' }}>
                  {user.address}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
