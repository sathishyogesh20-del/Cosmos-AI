import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { signInWithGoogle, signInAsGuest } = useAuth();
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      console.warn('Google sign-in error:', err);
      setError('Google sign-in is not available or was canceled. You can continue as Guest!');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#080b1a', fontFamily: "'Space Grotesk', sans-serif",
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse at 30% 40%, rgba(80,40,200,0.2) 0%, transparent 55%),
          radial-gradient(ellipse at 70% 60%, rgba(0,80,180,0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 80%, rgba(120,30,200,0.12) 0%, transparent 45%)
        `
      }} />

      {/* Stars */}
      {[...Array(40)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: Math.random() > 0.8 ? 2 : 1,
          height: Math.random() > 0.8 ? 2 : 1,
          borderRadius: '50%',
          background: '#fff',
          opacity: Math.random() * 0.6 + 0.1,
          animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 3}s`
        }} />
      ))}

      <div style={{
        position: 'relative', zIndex: 1,
        background: 'linear-gradient(135deg, rgba(13,15,40,0.95), rgba(16,10,50,0.9))',
        border: '1px solid rgba(124,111,255,0.3)',
        borderRadius: 24, padding: '36px 24px',
        width: '92%', maxWidth: 400, textAlign: 'center',
        boxSizing: 'border-box',
        boxShadow: '0 24px 80px rgba(60,20,160,0.4), 0 0 0 1px rgba(124,111,255,0.1)'
      }}>
        {/* Cosmos orb */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px',
          background: 'radial-gradient(circle at 35% 35%, #a070ff 0%, #3a10c0 50%, #0a0530 100%)',
          boxShadow: '0 0 50px rgba(124,111,255,0.6), 0 0 100px rgba(60,30,160,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36
        }}>🌌</div>

        <h1 style={{
          fontSize: 28, fontWeight: 700, margin: '0 0 6px',
          background: 'linear-gradient(135deg, #e0d0ff, #a090ff, #00d4ff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
        }}>Cosmos-AI</h1>

        <p style={{ color: '#666', fontSize: 14, margin: '0 0 8px' }}>by COSMOS Ecosystem</p>
        <p style={{ color: '#888', fontSize: 13, margin: '0 0 32px', lineHeight: 1.6 }}>
          Your intelligent space-powered AI assistant.<br />
          Expert in coding, research, and creation.
        </p>

        {error && (
          <div style={{
            fontSize: 12, color: '#ff9d9d', background: 'rgba(255,80,80,0.1)',
            border: '1px solid rgba(255,80,80,0.25)', borderRadius: 8,
            padding: '8px 12px', marginBottom: 16, lineHeight: 1.4
          }}>
            {error}
          </div>
        )}

        <button onClick={handleGoogleSignIn} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          padding: '14px 20px', borderRadius: 12, cursor: 'pointer',
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
          color: '#e0e0ff', fontSize: 15, fontWeight: 600,
          fontFamily: "'Space Grotesk', sans-serif",
          transition: 'all 0.2s', marginBottom: 12
        }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.borderColor = 'rgba(124,111,255,0.5)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <button onClick={signInAsGuest} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '12px 20px', borderRadius: 12, cursor: 'pointer',
          background: 'rgba(124,111,255,0.12)', border: '1px solid rgba(124,111,255,0.25)',
          color: '#c0b0ff', fontSize: 14, fontWeight: 500,
          fontFamily: "'Space Grotesk', sans-serif",
          transition: 'all 0.2s', marginBottom: 20
        }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(124,111,255,0.2)';
            e.currentTarget.style.borderColor = 'rgba(124,111,255,0.5)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(124,111,255,0.12)';
            e.currentTarget.style.borderColor = 'rgba(124,111,255,0.25)';
          }}
        >
          <span>🚀</span> Continue as Guest
        </button>

        <p style={{ color: '#444', fontSize: 11, margin: 0 }}>
          By continuing, you agree to Cosmos-AI's terms of use.
        </p>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
