import React from 'react';
import { Link } from 'react-router-dom';
import AptivoxLogo from '../assets/AptivoxLogo';
import { Phone, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#03081a', color: '#cbd5e1', paddingTop: '50px', paddingBottom: '30px', borderTop: '3px solid #0ea5e9' }}>
      <div className="container-custom">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          {/* Col 1: Institute Brand */}
          <div>
            <div style={{ background: 'rgba(14, 165, 233, 0.06)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(14, 165, 233, 0.2)', display: 'inline-block', marginBottom: '16px' }}>
              <AptivoxLogo size={50} lightText={true} />
            </div>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '16px' }}>
              Premier technology and skill education institute empowering learners with industry-ready certifications, software engineering, data analytics, and career readiness.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600 }}>
              <ShieldCheck size={16} /> ISO Certified Online Examination Center
            </div>
          </div>

          {/* Col 2: Popular Courses */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 700, marginBottom: '18px' }}>
              Specialized Programs
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
              {['MERN Stack Developer', 'Python Data Science', 'RS-CIT Govt. Certification', 'Tally Prime with GST', 'Advanced Excel & Analytics', 'Full Stack Development', 'Graphic & UI Design'].map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                  <CheckCircle2 size={13} style={{ color: '#38bdf8', flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact Details (No Location) */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 700, marginBottom: '18px' }}>
              Contact Support
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
              <div style={{ color: '#e2e8f0', fontWeight: 700 }}>
                APTIVOX EDUCATION &amp; TECHNOLOGY
                <div style={{ fontSize: '0.82rem', color: '#7dd3fc', fontWeight: 600, marginTop: '2px' }}>
                  Learn Today. Achieve Tomorrow.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Phone size={18} style={{ color: '#22c55e', flexShrink: 0 }} />
                <span>Helpline: <strong style={{ color: '#ffffff' }}>+91 9785589164</strong></span>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Mail size={18} style={{ color: '#38bdf8', flexShrink: 0 }} />
                <span>aptivoxeducation@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Col 4: Examination Portal */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 700, marginBottom: '18px' }}>
              Quick Navigation
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Student Portal Login</Link>
              <Link to="/APTIVOX/admin" style={{ color: '#a855f7', fontWeight: 600, textDecoration: 'none' }}>Admin Management (/APTIVOX/admin)</Link>
              <span style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '10px', lineHeight: 1.5 }}>
                Strict Anti-Cheat Proctoring: Camera verification, tab-switch logging, timer synchronization, and single-attempt enforcement active.
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', fontSize: '0.85rem', color: '#64748b' }}>
          <div>
            © {new Date().getFullYear()} APTIVOX EDUCATION &amp; TECHNOLOGY. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#7dd3fc', fontWeight: 600 }}>Learn Today. Achieve Tomorrow.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
