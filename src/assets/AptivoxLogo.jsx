import React from 'react';

export const APTIVOX_LOGO_URL = '/assets/aistudio/Aptivox_Futuristic_Education_Logo_416bc3d7.png';

export default function AptivoxLogo({ size = 64, showText = true, className = '', lightText = false }) {
  const frameWidth = Math.round(size * 1.38);
  const frameHeight = size;

  return (
    <div
      className={`aptivox-logo-container samyak-logo-container ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '14px' }}
    >
      <div
        className="aptivox-logo-frame"
        style={{
          width: `${frameWidth}px`,
          height: `${frameHeight}px`,
          borderRadius: size >= 60 ? '14px' : '10px',
          background: '#03081a',
          border: '1px solid rgba(14, 165, 233, 0.38)',
          boxShadow: '0 4px 16px rgba(3, 8, 26, 0.25), 0 0 18px rgba(14, 165, 233, 0.14)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          padding: '2px'
        }}
      >
        <img
          src={APTIVOX_LOGO_URL}
          alt="APTIVOX EDUCATION & TECHNOLOGY Logo"
          referrerPolicy="no-referrer"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block'
          }}
        />
      </div>

      {showText && (
        <div className="aptivox-brand-text samyak-brand-text" style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: size > 60 ? '1.15rem' : '0.96rem',
              fontWeight: 800,
              color: lightText ? '#ffffff' : '#050c21',
              lineHeight: 1.15,
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: '0.01em'
            }}
          >
            APTIVOX EDUCATION &amp; TECHNOLOGY
          </div>
          <div
            style={{
              marginTop: '3px',
              fontSize: size > 60 ? '0.82rem' : '0.74rem',
              fontWeight: 700,
              background: lightText
                ? 'linear-gradient(90deg, #38bdf8, #c084fc)'
                : 'linear-gradient(90deg, #0284c7, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.02em'
            }}
          >
            Learn Today. Achieve Tomorrow.
          </div>
        </div>
      )}
    </div>
  );
}
