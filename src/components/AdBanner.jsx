import { useState } from 'react';
import { ExternalLink, X, Sparkles } from 'lucide-react';

export default function AdBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const targetUrl = 'https://sathishyogesh20-del.github.io/MY_PORTFOLIO/';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 82,
        right: 18,
        zIndex: 35,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'linear-gradient(135deg, rgba(20, 21, 32, 0.96), rgba(28, 22, 48, 0.96))',
        border: '1px solid rgba(129, 140, 248, 0.35)',
        borderRadius: 12,
        padding: '8px 14px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.2)',
        backdropFilter: 'blur(12px)',
        fontFamily: "'Space Grotesk', sans-serif",
        animation: 'slideInBanner 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
    >
      {/* Clickable link area */}
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          textDecoration: 'none',
          color: '#e0e7ff',
          fontSize: 12.5,
          fontWeight: 500,
          cursor: 'pointer'
        }}
      >
        <span style={{ fontSize: 16 }}>🌌</span>
        <span>
          Cosmos-AI is powered by{' '}
          <span style={{
            color: '#818cf8',
            fontWeight: 700,
            textDecoration: 'underline',
            textUnderlineOffset: 3
          }}>
            cosmos
          </span>
        </span>
        <ExternalLink size={12} color="#818cf8" />
      </a>

      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        title="Dismiss"
        style={{
          background: 'rgba(255, 255, 255, 0.06)',
          border: 'none',
          cursor: 'pointer',
          color: '#9ca3af',
          borderRadius: 6,
          padding: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 2
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
        onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
      >
        <X size={12} />
      </button>

      <style>{`
        @keyframes slideInBanner {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
