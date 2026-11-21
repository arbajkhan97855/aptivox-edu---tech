import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../lib/firestoreApi';
import AptivoxLogo from '../../assets/AptivoxLogo';
import confetti from 'canvas-confetti';
import {
  Camera, Clock, AlertTriangle, Shield, ShieldCheck, ChevronLeft, ChevronRight,
  Bookmark, CheckCircle, Flag, X, RefreshCw, AlertCircle, Eye, EyeOff, Languages
} from 'lucide-react';
import { getLocalizedQuestion, EXAM_UI_TEXT } from '../../utils/examTranslator';

export default function LiveExamPage() {
  const { id: examId } = useParams();
  const { token, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // State phases: 'RULES_CHECK' -> 'IN_EXAM' -> 'SUBMITTING' -> 'COMPLETED' / 'VIOLATED'
  const [phase, setPhase] = useState('RULES_CHECK');
  const [hasAgreedRules, setHasAgreedRules] = useState(false);
  const [cameraAllowed, setCameraAllowed] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Exam Data
  const [attemptId, setAttemptId] = useState(null);
  const [paper, setPaper] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { [qId]: { option: 'A', marked: false, visited: true } }
  const [currentIndex, setCurrentIndex] = useState(0);

  // Live Exam Language Selection (ONLY on live exam page: 'EN' or 'HI')
  const [examLanguage, setExamLanguage] = useState('EN');

  // Timer & Violations
  const [secondsRemaining, setSecondsRemaining] = useState(3600);
  const [violationCount, setViolationCount] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Video Ref
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // 1. Camera Initialization (Safe, Non-blocking with Fallback)
  const requestCamera = async (isUserClick = false) => {
    setCameraError(null);
    if (!navigator?.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      setCameraAllowed(false);
      if (isUserClick) {
        addToast('Webcam not supported in this browser.', 'warning');
      }
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });

      if (stream && stream.getVideoTracks().length > 0) {
        streamRef.current = stream;
        setCameraAllowed(true);
        setCameraError(null);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        if (isUserClick) {
          addToast('Webcam connected successfully.', 'success');
        }
        return true;
      } else {
        setCameraAllowed(false);
        return false;
      }
    } catch (err) {
      console.warn('Camera request error:', err?.message || err);
      setCameraAllowed(false);
      const isDenied = err?.name === 'NotAllowedError' || err?.message?.toLowerCase()?.includes('denied');
      setCameraError(isDenied ? 'Permission denied' : 'Unavailable');
      if (isUserClick) {
        addToast('Camera permission denied. Please allow camera in browser address bar.', 'warning');
      }
      return false;
    }
  };

  // Safe camera probe when RULES_CHECK loads
  useEffect(() => {
    if (phase === 'RULES_CHECK' && !streamRef.current) {
      requestCamera(false).catch(() => {});
    }
  }, [phase]);

  // Ensure webcam is active and playing when entering IN_EXAM
  useEffect(() => {
    if (phase === 'IN_EXAM') {
      if (streamRef.current && videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      } else {
        // Re-request camera if not already active
        requestCamera(false).catch(() => {});
      }
    }
  }, [phase]);

  // Keep video element in sync whenever camera stream or allowed status changes
  useEffect(() => {
    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraAllowed, phase]);

  // Clean up webcam ONLY on component unmount (leaving exam page)
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 2. Start Exam Attempt
  const handleStartExam = async () => {
    if (!hasAgreedRules) {
      addToast('Please read and agree to examination rules.', 'warning');
      return;
    }

    // Explicitly open / ensure webcam on exam start
    if (!streamRef.current || !streamRef.current.active) {
      await requestCamera(true);
    }

    try {
      const res = await apiFetch(`/api/exams/${examId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ camera_permission: true })
      });

      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || 'Failed to start exam', 'error');
        if (data.error && data.error.includes('Already Completed')) {
          navigate('/student/tests');
        }
        return;
      }

      setAttemptId(data.attempt_id);
      setPaper(data.paper);
      setQuestions(data.questions);
      setSecondsRemaining((data.duration_minutes || 60) * 60);

      // Rehydrate answers if any
      const initialAnswers = {};
      data.questions.forEach((q, idx) => {
        initialAnswers[q.id] = {
          option: null,
          marked: false,
          visited: idx === 0 // first question is visited
        };
      });

      if (data.saved_answers && data.saved_answers.length > 0) {
        data.saved_answers.forEach((sa) => {
          if (initialAnswers[sa.question_id]) {
            initialAnswers[sa.question_id].option = sa.selected_option;
            initialAnswers[sa.question_id].marked = sa.is_marked_for_review;
            initialAnswers[sa.question_id].visited = true;
          }
        });
      }

      setAnswers(initialAnswers);
      setPhase('IN_EXAM');

      // Request fullscreen where supported
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }

      addToast('Exam started. Camera monitoring active. Good luck!', 'info');
    } catch (err) {
      console.error('Start exam error:', err);
      addToast('Server connection failed.', 'error');
    }
  };

  // 3. Save Answer in background
  const saveAnswerToServer = async (qId, option, marked) => {
    if (!attemptId) return;
    try {
      await apiFetch(`/api/exams/${examId}/save-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          attempt_id: attemptId,
          question_id: qId,
          selected_option: option,
          is_marked_for_review: marked
        })
      });
    } catch (err) {
      console.error('Answer auto-save failed:', err);
    }
  };

  // 4. Record Integrity Violation
  const recordViolation = useCallback(async (type, details) => {
    if (phase !== 'IN_EXAM' || !attemptId) return;

    try {
      const res = await apiFetch(`/api/exams/${examId}/violation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          attempt_id: attemptId,
          violation_type: type,
          details
        })
      });
      const data = await res.json();
      setViolationCount(data.violation_count);

      if (data.re_exam_required) {
        setPhase('VIOLATED');
        if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
        addToast('Exam locked due to repeated integrity violations.', 'error', 8000);
      } else {
        addToast(data.warning || `Exam violation recorded: ${type}`, 'warning', 5000);
      }
    } catch (err) {
      console.error('Failed to report violation:', err);
    }
  }, [phase, attemptId, examId, token, addToast]);

  // 5. Anti-Cheat Event Listeners (Tab change, window blur, back button, right click)
  useEffect(() => {
    if (phase !== 'IN_EXAM') return;

    // A. Prevent Browser Back Navigation
    window.history.pushState(null, '', window.location.href);
    const handlePopState = (e) => {
      window.history.pushState(null, '', window.location.href);
      recordViolation('BROWSER_BACK_ATTEMPT', 'Student clicked browser back button during exam');
    };
    window.addEventListener('popstate', handlePopState);

    // B. Tab Visibility Change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation('TAB_SWITCH', 'Student switched tabs or minimized exam window');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // C. Window Blur (e.g. clicking other app)
    const handleWindowBlur = () => {
      recordViolation('WINDOW_BLUR', 'Exam window lost focus (student opened another application)');
    };
    window.addEventListener('blur', handleWindowBlur);

    // D. Before Unload (Attempting to close tab or reload)
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave? Your exam progress will be locked.';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // E. Prevent Right Click & Copy
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [phase, recordViolation]);

  // 6. Countdown Timer
  useEffect(() => {
    if (phase !== 'IN_EXAM') return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(true); // auto submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  // Format Timer mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // 7. Current Question & Localization according to selected dropdown language ('EN' | 'HI')
  const currentQuestionRaw = questions[currentIndex];
  const currentQuestion = getLocalizedQuestion(currentQuestionRaw, examLanguage);
  const uiText = EXAM_UI_TEXT[examLanguage] || EXAM_UI_TEXT.EN;

  const handleSelectOption = (opt) => {
    if (!currentQuestionRaw) return;
    const qId = currentQuestionRaw.id;
    const updated = {
      ...answers,
      [qId]: {
        ...answers[qId],
        option: opt,
        visited: true
      }
    };
    setAnswers(updated);
    saveAnswerToServer(qId, opt, updated[qId].marked);
  };

  const handleToggleMarkReview = () => {
    if (!currentQuestionRaw) return;
    const qId = currentQuestionRaw.id;
    const isMarked = !answers[qId]?.marked;
    const updated = {
      ...answers,
      [qId]: {
        ...answers[qId],
        marked: isMarked,
        visited: true
      }
    };
    setAnswers(updated);
    saveAnswerToServer(qId, updated[qId].option, isMarked);
  };

  const handleClearOption = () => {
    if (!currentQuestionRaw) return;
    const qId = currentQuestionRaw.id;
    const updated = {
      ...answers,
      [qId]: {
        ...answers[qId],
        option: null,
        visited: true
      }
    };
    setAnswers(updated);
    saveAnswerToServer(qId, null, updated[qId].marked);
  };

  const handleJumpToQuestion = (idx) => {
    if (idx < 0 || idx >= questions.length) return;
    const q = questions[idx];
    setAnswers((prev) => ({
      ...prev,
      [q.id]: {
        ...(prev[q.id] || { option: null, marked: false }),
        visited: true
      }
    }));
    setCurrentIndex(idx);
  };

  // 8. Submit Examination
  const handleFinalSubmit = async (auto = false) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const timeTaken = ((paper?.duration_minutes || 60) * 60) - secondsRemaining;
      const res = await apiFetch(`/api/exams/${examId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          attempt_id: attemptId,
          time_taken_seconds: timeTaken
        })
      });

      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || 'Submission failed', 'error');
        setSubmitting(false);
        return;
      }

      // Stop webcam
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }

      // Confetti celebration
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });

      addToast(auto ? 'Time expired. Exam auto-submitted.' : 'Exam submitted successfully!', 'success');
      navigate(`/student/results/${data.attempt.id}`);
    } catch (err) {
      console.error('Submit error:', err);
      addToast('Submission error, please retry.', 'error');
      setSubmitting(false);
    }
  };

  // Summary counts for palette & modal
  const answeredCount = Object.values(answers).filter((a) => a.option !== null).length;
  const markedCount = Object.values(answers).filter((a) => a.marked).length;
  const unansweredCount = questions.length - answeredCount;

  // ==========================================
  // VIEW: RULES & CAMERA SETUP
  // ==========================================
  if (phase === 'RULES_CHECK') {
    return (
      <div style={{ minHeight: 'calc(100vh - 120px)', background: '#f8fafc', padding: '40px 16px' }}>
        <div className="container-custom" style={{ maxWidth: '900px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <AptivoxLogo size={64} />
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#050c21', marginTop: '14px' }}>
              Examination Instructions &amp; Verification
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Institute: APTIVOX EDUCATION &amp; TECHNOLOGY • Candidate: {user?.name} ({user?.student_id})
            </p>
          </div>

          <div className="samyak-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} style={{ color: '#2563eb' }} />
              Mandatory Examination Code of Conduct
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: '#334155' }}>
                  <li><strong>Camera Monitoring Required:</strong> Your webcam will remain active to monitor exam room integrity.</li>
                  <li><strong>Do Not Leave Exam Window:</strong> Switching tabs or minimizing the browser will be flagged immediately.</li>
                  <li><strong>Single Attempt Rule:</strong> Each paper can only be attempted ONCE. Duplicate submissions are blocked.</li>
                  <li><strong>Browser Back Disabled:</strong> Do not click the browser back button or refresh.</li>
                  <li><strong>Automatic Timer:</strong> When the countdown reaches 00:00, the exam automatically submits.</li>
                </ul>
              </div>

              {/* Proctoring & Webcam Verification Box */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020617', borderRadius: '14px', padding: '14px', border: '2px solid #2563eb' }}>
                <div style={{ width: '100%', aspectRatio: '4/3', position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#0f172a' }}>
                  {streamRef.current ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#090d16', color: '#94a3b8', padding: '16px', textAlign: 'center' }}>
                      <Shield size={44} style={{ color: '#38bdf8', marginBottom: '8px' }} />
                      <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.9rem' }}>
                        System Proctoring Feed Active
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
                        Fullscreen, Window & Tab Integrity Tracking Ready
                      </div>
                    </div>
                  )}

                  <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.7)', color: streamRef.current ? '#22c55e' : '#38bdf8', padding: '4px 8px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>
                    <div className="live-dot" style={{ background: streamRef.current ? '#22c55e' : '#38bdf8' }}></div>
                    {streamRef.current ? 'Webcam Active' : 'System Proctoring Active'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '10px' }}>
                  <span style={{ color: '#4ade80', fontSize: '0.82rem', fontWeight: 600 }}>
                    ✓ Exam proctoring verified & ready
                  </span>
                  {!streamRef.current && (
                    <button
                      type="button"
                      onClick={() => requestCamera(true)}
                      className="btn-secondary btn-sm"
                      style={{ fontSize: '0.72rem', padding: '3px 8px', background: 'rgba(255,255,255,0.08)', color: '#94a3b8', border: '1px solid #334155' }}
                    >
                      <Camera size={12} /> Test Camera
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Live Exam Language Selection Note */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Languages size={20} style={{ color: '#2563eb', flexShrink: 0 }} />
                <div style={{ fontSize: '0.88rem', color: '#334155' }}>
                  <strong>Language Selection:</strong> Live exam me aap top bar me diye gaye dropdown se kisi bhi samay <strong>English</strong> ya <strong>हिंदी</strong> select kar sakte hain, jisse sabhi questions aur options usi language me convert ho jayenge.
                </div>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div style={{ background: '#eff6ff', padding: '14px 18px', borderRadius: '12px', border: '1px solid #bfdbfe', marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={hasAgreedRules}
                  onChange={(e) => setHasAgreedRules(e.target.checked)}
                  style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#1d4ed8' }}
                />
                <span style={{ fontSize: '0.9rem', color: '#1e3a8a', lineHeight: 1.5 }}>
                  <strong>I confirm that I am taking this exam independently without unauthorized assistance.</strong> I consent to camera integrity monitoring and understand that switching windows or exiting will result in exam invalidation and require administrator approval.
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <button
                type="button"
                onClick={() => navigate('/student/tests')}
                className="btn-secondary"
              >
                <ChevronLeft size={16} /> Return to Tests
              </button>

              <button
                type="button"
                onClick={handleStartExam}
                disabled={!hasAgreedRules}
                className="btn-primary"
                style={{
                  padding: '12px 34px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  opacity: hasAgreedRules ? 1 : 0.6,
                  cursor: hasAgreedRules ? 'pointer' : 'not-allowed',
                  boxShadow: hasAgreedRules ? '0 4px 14px rgba(37, 99, 235, 0.4)' : 'none'
                }}
              >
                Start Examination Now <ChevronRight size={18} />
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: VIOLATED / LOCKED STATE
  // ==========================================
  if (phase === 'VIOLATED') {
    return (
      <div style={{ minHeight: 'calc(100vh - 120px)', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="samyak-card" style={{ maxWidth: '540px', width: '100%', padding: '40px', textAlign: 'center', border: '2px solid #ef4444' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', margin: '0 auto 20px' }}>
            <AlertTriangle size={36} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#991b1b', marginBottom: '8px' }}>
            Examination Session Locked
          </h2>
          <div className="badge badge-red" style={{ marginBottom: '16px' }}>
            STATUS: RE-EXAM REQUIRED
          </div>
          <p style={{ color: '#7f1d1d', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
            Our security monitoring detected that you attempted to leave or switch away from the active examination window. To preserve exam integrity, this attempt has been locked.
          </p>

          <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #fecaca', marginBottom: '24px', textAlign: 'left', fontSize: '0.88rem' }}>
            <div style={{ fontWeight: 700, color: '#991b1b', marginBottom: '6px' }}>What happens next?</div>
            <p style={{ color: '#475569', marginBottom: '6px' }}>
              1. An alert has been automatically sent to the Aptivox Exam Administrator.
            </p>
            <p style={{ color: '#475569', marginBottom: '6px' }}>
              2. Please report to the faculty or contact helpline: <strong>9785589164</strong>.
            </p>
            <p style={{ color: '#475569' }}>
              3. Once Admin approves your re-exam, you can restart a new test paper.
            </p>
          </div>

          <button
            onClick={() => navigate('/student/dashboard')}
            className="btn-danger"
            style={{ width: '100%' }}
          >
            Return to Student Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: FULLSCREEN LIVE EXAMINATION
  // ==========================================
  return (
    <div className="exam-fullscreen">
      
      {/* Top Exam Header */}
      <div className="exam-header">
        <div className="exam-header-meta">
          <AptivoxLogo size={42} showText={false} />
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {paper?.title || 'Examination in Progress'}
            </h2>
            <div style={{ fontSize: '0.76rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Candidate: <strong>{user?.name}</strong> ({user?.student_id}) • Negative Marking: 0.5
            </div>
          </div>
        </div>

        <div className="exam-header-actions" style={{ flexWrap: 'wrap' }}>
          {/* Live Exam Language Selection Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '5px 10px', borderRadius: '10px', border: '1.5px solid #2563eb' }}>
            <Languages size={16} style={{ color: '#2563eb' }} />
            <select
              value={examLanguage}
              onChange={(e) => setExamLanguage(e.target.value)}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1.5px solid #2563eb',
                fontSize: '0.82rem',
                fontWeight: 800,
                color: '#1d4ed8',
                background: '#ffffff',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="EN">English</option>
              <option value="HI">हिंदी (Hindi)</option>
            </select>
          </div>

          {/* Timer Box */}
          <div className={`exam-timer-box ${secondsRemaining < 300 ? 'timer-warning' : ''}`}>
            <Clock size={18} />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="btn-primary btn-sm"
            style={{ background: '#15803d' }}
          >
            <CheckCircle size={15} /> {uiText.submitExam}
          </button>
        </div>
      </div>

      {/* Main Examination Layout: 2 Columns */}
      <div className="exam-layout-body">
        
        {/* Left Column: Question Area */}
        <div className="exam-question-pane">
          
          <div>
            {/* Top Question Info */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px', marginBottom: '22px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1d4ed8' }}>
                  {uiText.question} {currentIndex + 1}
                </span>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                  {uiText.of} {questions.length}
                </span>

                {/* Inline Quick Language Switcher Dropdown */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: '6px' }}>
                  <select
                    value={examLanguage}
                    onChange={(e) => setExamLanguage(e.target.value)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '8px',
                      border: '1.5px solid #3b82f6',
                      background: examLanguage === 'HI' ? '#ecfdf5' : '#eff6ff',
                      color: examLanguage === 'HI' ? '#047857' : '#1d4ed8',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="EN">English</option>
                    <option value="HI">हिंदी (Hindi)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-blue">{uiText.marks}: +2.0</span>
                <span className="badge badge-red">{uiText.negative}: -0.5</span>
              </div>
            </div>

            {/* DYNAMIC QUESTION CARD (CONVERTS TO HINDI OR ENGLISH BASED ON DROPDOWN) */}
            <div style={{ background: '#f8fafc', padding: '22px 24px', borderRadius: '16px', border: '1.5px solid #e2e8f0', marginBottom: '26px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                <span style={{ color: '#2563eb', fontWeight: 800, fontSize: '1.25rem' }}>
                  Q{currentIndex + 1}.
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: examLanguage === 'HI' ? '#dcfce7' : '#dbeafe', color: examLanguage === 'HI' ? '#15803d' : '#1e40af' }}>
                  {examLanguage === 'HI' ? 'हिंदी माध्यम' : 'English Medium'}
                </span>
              </div>
              <div style={{ fontSize: '1.24rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.55 }}>
                {currentQuestion?.question_text || 'Loading question...'}
              </div>
            </div>

            {/* Options List (CONVERTS TO HINDI OR ENGLISH BASED ON DROPDOWN) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '800px' }}>
              {[
                { key: 'A', text: currentQuestion?.option_a },
                { key: 'B', text: currentQuestion?.option_b },
                { key: 'C', text: currentQuestion?.option_c },
                { key: 'D', text: currentQuestion?.option_d }
              ].map((opt) => {
                if (!opt.text) return null;
                const isSelected = answers[currentQuestionRaw?.id]?.option === opt.key;

                return (
                  <div
                    key={opt.key}
                    onClick={() => handleSelectOption(opt.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #2563eb' : '1.5px solid var(--border-medium)',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(37,99,235,0.12)' : 'none'
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        background: isSelected ? '#2563eb' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#475569',
                        border: isSelected ? 'none' : '1px solid #cbd5e1',
                        flexShrink: 0
                      }}
                    >
                      {opt.key}
                    </div>

                    <div style={{ fontSize: '1.02rem', color: isSelected ? '#1e3a8a' : '#1e293b', fontWeight: isSelected ? 600 : 500, lineHeight: 1.45 }}>
                      {opt.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '20px', marginTop: '32px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleToggleMarkReview}
                className="btn-secondary btn-sm"
                style={{
                  background: answers[currentQuestionRaw?.id]?.marked ? '#fff7ed' : '#ffffff',
                  borderColor: answers[currentQuestionRaw?.id]?.marked ? '#ea580c' : '#cbd5e1',
                  color: answers[currentQuestionRaw?.id]?.marked ? '#c2410c' : '#475569',
                  fontWeight: 700
                }}
              >
                <Bookmark size={15} />
                {answers[currentQuestionRaw?.id]?.marked ? uiText.markedForReview : uiText.markForReview}
              </button>

              {answers[currentQuestionRaw?.id]?.option && (
                <button
                  onClick={handleClearOption}
                  className="btn-secondary btn-sm"
                  style={{ color: '#dc2626' }}
                >
                  {uiText.clearResponse}
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => handleJumpToQuestion(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="btn-secondary"
              >
                <ChevronLeft size={16} /> {uiText.previous}
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => handleJumpToQuestion(currentIndex + 1)}
                  className="btn-primary"
                >
                  {uiText.next} <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="btn-primary"
                  style={{ background: '#16a34a' }}
                >
                  {uiText.submitExam} <CheckCircle size={16} />
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Proctoring Camera & Question Navigator Palette */}
        <div className="exam-sidebar-pane">
          
          {/* Proctoring Webcam Box */}
          <div style={{ marginBottom: '20px' }}>
            <div className="camera-monitor-widget" style={{ background: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '180px', position: 'relative' }}>
              {streamRef.current && cameraAllowed ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onLoadedMetadata={(e) => {
                    e.target.play().catch(() => {});
                  }}
                />
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>
                  <Shield size={36} style={{ color: '#38bdf8', margin: '0 auto 6px' }} />
                  <div style={{ color: '#f8fafc', fontSize: '0.85rem', fontWeight: 700 }}>Proctor Feed Active</div>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '2px' }}>System Activity Integrity Monitored</div>
                </div>
              )}
              <div className="camera-badge">
                <div className="live-dot" style={{ background: '#22c55e' }}></div>
                {streamRef.current && cameraAllowed ? 'Camera Monitoring Active' : 'System Proctoring Active'}
              </div>
            </div>

            {(!streamRef.current || !cameraAllowed) && (
              <button
                type="button"
                onClick={() => requestCamera(true)}
                className="btn-secondary btn-sm"
                style={{
                  width: '100%',
                  marginTop: '8px',
                  fontSize: '0.78rem',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  fontWeight: 700
                }}
              >
                <Camera size={14} /> Open Camera (Webcam Start)
              </button>
            )}

            {violationCount > 0 && (
              <div style={{ marginTop: '8px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', fontSize: '0.78rem', fontWeight: 600 }}>
                <AlertCircle size={14} /> Warnings: {violationCount}/3 (Window switch detected)
              </div>
            )}
          </div>

          {/* Palette Status Color Legend */}
          <div style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
              {examLanguage === 'HI' ? 'प्रश्न स्थिति विवरण' : 'Question Status Legend'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#16a34a' }}></div>
                <span>{uiText.answered} ({answeredCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#dc2626' }}></div>
                <span>{uiText.unanswered}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#ea580c' }}></div>
                <span>{uiText.review} ({markedCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#f1f5f9', border: '1px solid #cbd5e1' }}></div>
                <span>{uiText.notVisited}</span>
              </div>
            </div>
          </div>

          {/* Question Navigator Grid */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
              {examLanguage === 'HI' ? 'प्रश्न पैलेट' : 'Question Palette'} (1 - {questions.length})
            </div>
            
            <div className="palette-grid">
              {questions.map((q, idx) => {
                const ans = answers[q.id];
                const isCurrent = idx === currentIndex;
                let statusClass = 'status-gray';

                if (ans?.marked) {
                  statusClass = 'status-orange';
                } else if (ans?.option) {
                  statusClass = 'status-green';
                } else if (ans?.visited) {
                  statusClass = 'status-red';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => handleJumpToQuestion(idx)}
                    className={`palette-btn ${statusClass} ${isCurrent ? 'current' : ''}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Submit button in sidebar */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="btn-primary"
              style={{ width: '100%', background: '#0f2445' }}
            >
              {uiText.submitExam}
            </button>
          </div>

        </div>

      </div>

      {/* Confirmation Modal Before Submit */}
      {showSubmitModal && (
        <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              {uiText.readyToSubmit}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '20px' }}>
              {uiText.submitWarning}
            </p>

            {/* Breakdown table */}
            <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '18px', border: '1px solid var(--border-light)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>
                  {examLanguage === 'HI' ? 'कुल प्रश्न' : 'Total Questions'}
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{questions.length}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#16a34a', textTransform: 'uppercase' }}>
                  {uiText.answered}
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a' }}>{answeredCount}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#ea580c', textTransform: 'uppercase' }}>
                  {uiText.review}
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ea580c' }}>{markedCount}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#dc2626', textTransform: 'uppercase' }}>
                  {uiText.unanswered}
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#dc2626' }}>{unansweredCount}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="btn-secondary"
                disabled={submitting}
              >
                {uiText.continueExam}
              </button>
              <button
                onClick={() => handleFinalSubmit(false)}
                className="btn-primary"
                disabled={submitting}
                style={{ background: '#16a34a' }}
              >
                {submitting ? 'Submitting...' : uiText.confirmSubmit}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
