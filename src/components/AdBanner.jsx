import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AdBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show after 5 seconds initially
    const initial = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(initial);
  }, []);

  useEffect(() => {
    if (!visible) {
      // Reappear every 5 minutes after dismissal
      const interval = setTimeout(() => setVisible(true), 5 * 60 * 1000);
      return () => clearTimeout(interval);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 90, right: 24, zIndex: 1000,
      maxWidth: 320, background: 'linear-gradient(135deg, rgba(13,15,40,0.97) 0%, rgba(20,10,50,0.97) 100%)',
      border: '1px solid rgba(124,111,255,0.4)',
      borderRadius: 14, padding: '14px 16px',
      boxShadow: '0 8px 40px rgba(100,60,255,0.25), 0 0 0 1px rgba(124,111,255,0.1)',
      backdropFilter: 'blur(12px)',
      animation: 'slideInBanner 0.4s cubic-bezier(0.34,1.56,0.64,1)'
    }}>
      <style>{`
        @keyframes slideInBanner {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <button onClick={() => setVisible(false)} style={{
        position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.08)',
        border: 'none', cursor: 'pointer', color: '#888', borderRadius: 6,
        padding: 4, display: 'flex', alignItems: 'center'
      }}>
        <X size={13} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>🌌</span>
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: 1,
          color: '#7c6fff', textTransform: 'uppercase'
        }}>Powered By</span>
      </div>

      <p style={{
        margin: 0, fontSize: 13, lineHeight: 1.5, color: '#c0c0e0',
        fontFamily: "'Space Grotesk', sans-serif"
      }}>
        Cosmos-AI is powered by{' '}
        <a
          href="https://sathishyogesh20-del.github.io/MY_PORTFOLIO/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#00d4ff', fontWeight: 700, textDecoration: 'none',
            textShadow: '0 0 12px rgba(0,212,255,0.6)',
            borderBottom: '1px solid rgba(0,212,255,0.4)'
          }}
        >
          COSMOS
        </a>
        {' '}models and maintained by{' '}
        <a
          href="https://sathishyogesh20-del.github.io/MY_PORTFOLIO/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#00d4ff', fontWeight: 700, textDecoration: 'none',
            textShadow: '0 0 12px rgba(0,212,255,0.6)',
            borderBottom: '1px solid rgba(0,212,255,0.4)'
          }}
        >
          Cosmos
        </a>
      </p>
    </div>
  );
}
