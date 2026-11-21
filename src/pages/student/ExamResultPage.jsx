import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/firestoreApi';
import AptivoxLogo from '../../assets/AptivoxLogo';
import {
  Award, CheckCircle, XCircle, Clock, Calendar, Printer,
  ArrowLeft, Share2, ShieldCheck, UserCheck, Check, X, FileText
} from 'lucide-react';

export default function ExamResultPage() {
  const { attemptId } = useParams();
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResult() {
      try {
        const res = await apiFetch(`/api/student/results/${attemptId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load result:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [attemptId, token]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b' }}>
        Calculating scorecard and verifying credentials...
      </div>
    );
  }

  if (!data || !data.attempt) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#dc2626', marginBottom: '12px' }}>Scorecard Not Found</h2>
        <Link to="/student/dashboard" className="btn-primary">Return to Dashboard</Link>
      </div>
    );
  }

  const { attempt, student, paper, institute } = data;
  const passed = attempt.passed || attempt.percentage >= 40;
  const examDate = new Date(attempt.submitted_at || attempt.started_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div style={{ padding: '36px 16px', minHeight: '85vh', background: '#f8fafc' }}>
      <div className="container-custom" style={{ maxWidth: '920px' }}>
        
        {/* Navigation & Print Top Bar */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <Link to="/student/exam-history" className="btn-secondary btn-sm">
            <ArrowLeft size={16} /> Back to Exam History
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={handlePrint} className="btn-primary btn-sm">
              <Printer size={16} /> Print Official Scorecard
            </button>
          </div>
        </div>

        {/* Printable Official Result Certificate Card */}
        <div
          className="samyak-card certificate-card"
          style={{
            padding: '48px 40px',
            background: '#ffffff',
            position: 'relative',
            borderRadius: '24px',
            border: '2px solid #cbd5e1',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.12)'
          }}
        >
          {/* Subtle Institute Watermark */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.04, pointerEvents: 'none' }}>
            <AptivoxLogo size={380} showText={false} />
          </div>

          {/* Certificate Header */}
          <div style={{ borderBottom: '2px solid #0284c7', paddingBottom: '24px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <AptivoxLogo size={70} />
            </div>

            <div className="certificate-ref" style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Certificate Ref ID</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0284c7', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                APTIVOX-ATT-{attempt.id.toUpperCase()}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <ShieldCheck size={14} /> Digitally Verified Examination
              </div>
            </div>
          </div>

          {/* Student Profile & Candidate Details */}
          <div className="profile-summary-grid" style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid var(--border-light)', marginBottom: '32px' }}>
            <img
              src={student.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
              alt={student.name}
              style={{ width: '100px', height: '100px', borderRadius: '14px', objectFit: 'cover', border: '3px solid #1d4ed8' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Student Name</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{student.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Student ID</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1d4ed8' }}>{student.student_id}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Enrolled Course</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{student.course_name}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Father's Name</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>{student.father_name || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Exam Title & Subject */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span className="badge badge-blue" style={{ marginBottom: '8px' }}>
              Official Statement of Marks
            </span>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              {paper.title}
            </h2>
            <div style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px', flexWrap: 'wrap' }}>
              <span>Subject: <strong>{paper.subject_name || 'General'}</strong></span>
              <span>•</span>
              <span>Topic: <strong>{paper.topic_name || 'Foundations'}</strong></span>
              <span>•</span>
              <span>Exam Date: <strong>{examDate}</strong></span>
            </div>
          </div>

          {/* Scoreboard Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '36px' }}>
            
            {/* Status Pass/Fail */}
            <div style={{ background: passed ? '#f0fdf4' : '#fef2f2', border: `2px solid ${passed ? '#86efac' : '#fca5a5'}`, borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: passed ? '#166534' : '#991b1b', textTransform: 'uppercase' }}>Result Status</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: passed ? '#15803d' : '#dc2626', margin: '4px 0' }}>
                {passed ? 'PASSED' : 'FAILED'}
              </div>
              <div style={{ fontSize: '0.8rem', color: passed ? '#16a34a' : '#ef4444', fontWeight: 600 }}>
                {passed ? 'Qualified' : 'Requires Re-Exam'}
              </div>
            </div>

            {/* Percentage */}
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-medium)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Percentage</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#1e40af', margin: '4px 0' }}>
                {attempt.percentage}%
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Min Passing: {paper.passing_marks || 40}%
              </div>
            </div>

            {/* Total Score */}
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-medium)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Marks Obtained</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                {attempt.score} <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>/ {attempt.total_marks || 100}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Raw Scaled Score
              </div>
            </div>

            {/* Question Breakdown */}
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-medium)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Accuracy Breakdown</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '8px 0' }}>
                <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Check size={16} /> {attempt.correct_count}
                </span>
                <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <X size={16} /> {attempt.wrong_count}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Unanswered: {attempt.unanswered_count || 0}
              </div>
            </div>

          </div>

          {/* Certificate Authorization Signatures */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '28px', marginTop: '40px' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#050c21' }}>
                APTIVOX EDUCATION &amp; TECHNOLOGY
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Learn Today. Achieve Tomorrow.<br />
                Helpline: 9785589164 | aptivoxeducation@gmail.com
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              {/* Virtual stamp mark */}
              <div style={{ display: 'inline-block', border: '2px dashed #0284c7', borderRadius: '10px', padding: '8px 14px', marginBottom: '8px', color: '#0284c7', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '1px' }}>
                VERIFIED &amp; APPROVED
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#050c21' }}>Controller of Examinations</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>APTIVOX EDUCATION &amp; TECHNOLOGY</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
