import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    let message = 'An unexpected error occurred. Please reload the page.';
    if (error?.message) {
      try {
        const parsed = JSON.parse(error.message);
        if (parsed?.error) {
          message = parsed.error;
        }
      } catch {
        message = error.message;
      }
    }
    return { hasError: true, errorMessage: message };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#03081a', padding: '24px' }}>
          <div style={{ maxWidth: '480px', width: '100%', background: '#ffffff', borderRadius: '20px', padding: '36px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={28} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
              {this.state.errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <RefreshCw size={16} /> Reload Portal
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
