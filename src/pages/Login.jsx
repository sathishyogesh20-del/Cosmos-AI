import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Shield, ArrowRight, UserCheck, X } from 'lucide-react';

export default function Login() {
  const { signInWithGoogle, signInAsGuest, isFirebaseConfigured } = useAuth();
  const [error, setError] = useState('');
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  // Default suggested Google Account from user context
  const defaultGoogleEmail = 'sathishyogesh20@gmail.com';
  const defaultGoogleName = 'Sathish Yogesh';

  const handleQuickGoogleSignIn = async (email = defaultGoogleEmail, name = defaultGoogleName) => {
    setError('');
    setLoadingGoogle(true);
    try {
      await signInWithGoogle(email, name);
    } catch (err) {
      console.warn('Google sign-in error:', err);
      setError('Google sign-in encountered an issue. You can continue as Guest or try again.');
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleCustomGoogleSubmit = (e) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setError('Please enter a valid Google email address.');
      return;
    }
    const derivedName = customName.trim() || customEmail.split('@')[0];
    handleQuickGoogleSignIn(customEmail.trim(), derivedName);
  };

  return (
    <div style={{
      minHeight: '100dvh',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#080b1a',
      fontFamily: "'Space Grotesk', sans-serif",
      position: 'relative',
      overflow: 'hidden',
      padding: 'max(16px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom))'
    }}>
      {/* Background radial glows */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse at 30% 35%, rgba(99, 102, 241, 0.22) 0%, transparent 55%),
          radial-gradient(ellipse at 75% 65%, rgba(139, 92, 246, 0.18) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 85%, rgba(56, 189, 248, 0.12) 0%, transparent 45%)
        `
      }} />

      {/* Twinkling star field */}
      {[...Array(35)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${(i * 17) % 100}%`,
          top: `${(i * 23) % 100}%`,
          width: i % 4 === 0 ? 2.5 : 1.5,
          height: i % 4 === 0 ? 2.5 : 1.5,
          borderRadius: '50%',
          background: '#fff',
          opacity: 0.2 + ((i % 5) * 0.15),
          animation: `twinkle ${2.5 + (i % 3)}s ease-in-out infinite`,
          animationDelay: `${(i * 0.4) % 3}s`
        }} />
      ))}

      {/* Main Login Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: 'linear-gradient(135deg, rgba(16, 18, 38, 0.96), rgba(20, 14, 45, 0.94))',
        border: '1px solid rgba(129, 140, 248, 0.3)',
        borderRadius: 24,
        padding: '36px 26px',
        width: '100%',
        maxWidth: 420,
        textAlign: 'center',
        boxSizing: 'border-box',
        boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.18)',
        backdropFilter: 'blur(16px)'
      }}>
        {/* Cosmos orb icon */}
        <div style={{
          width: 76,
          height: 76,
          borderRadius: '50%',
          margin: '0 auto 20px',
          background: 'radial-gradient(circle at 35% 35%, #a070ff 0%, #3a10c0 55%, #0d0630 100%)',
          boxShadow: '0 0 45px rgba(124, 111, 255, 0.65), 0 0 80px rgba(60, 30, 160, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 34
        }}>
          🌌
        </div>

        <h1 style={{
          fontSize: 27,
          fontWeight: 700,
          margin: '0 0 6px',
          background: 'linear-gradient(135deg, #ffffff, #c7d2fe, #818cf8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: -0.5
        }}>
          Cosmos-AI
        </h1>

        <p style={{ color: '#818cf8', fontSize: 12.5, fontWeight: 600, margin: '0 0 8px', letterSpacing: 0.5 }}>
          POWERED BY COSMOS
        </p>

        <p style={{ color: '#9ca3af', fontSize: 13, margin: '0 0 26px', lineHeight: 1.5 }}>
          Multi-model AI assistant with Claude-style artifacts, reasoning traces, and persistent chat history.
        </p>

        {error && (
          <div style={{
            fontSize: 12,
            color: '#fca5a5',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 16,
            lineHeight: 1.45,
            textAlign: 'left'
          }}>
            {error}
          </div>
        )}

        {/* Continue with Google button */}
        <button
          onClick={() => {
            if (isFirebaseConfigured) {
              handleQuickGoogleSignIn();
            } else {
              setShowAccountSelector(true);
            }
          }}
          disabled={loadingGoogle}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '13px 18px',
            borderRadius: 12,
            cursor: loadingGoogle ? 'wait' : 'pointer',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            color: '#f3f4f6',
            fontSize: 14.5,
            fontWeight: 600,
            fontFamily: "'Space Grotesk', sans-serif",
            transition: 'all 0.2s',
            marginBottom: 12,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.13)';
            e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.6)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>{loadingGoogle ? 'Signing in with Google...' : 'Continue with Google'}</span>
        </button>

        {/* Continue as Guest button */}
        <button
          onClick={signInAsGuest}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '11px 18px',
            borderRadius: 12,
            cursor: 'pointer',
            background: 'rgba(129, 140, 248, 0.1)',
            border: '1px solid rgba(129, 140, 248, 0.25)',
            color: '#c7d2fe',
            fontSize: 13.5,
            fontWeight: 500,
            fontFamily: "'Space Grotesk', sans-serif",
            transition: 'all 0.15s',
            marginBottom: 20
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(129, 140, 248, 0.18)';
            e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.45)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(129, 140, 248, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.25)';
          }}
        >
          <span>🚀</span>
          <span>Continue as Guest</span>
        </button>

        {/* History note */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          color: '#6b7280',
          fontSize: 11.5
        }}>
          <Shield size={12} color="#818cf8" />
          <span>Chat history is automatically saved for your Google account</span>
        </div>
      </div>

      {/* Google Account Selector Modal */}
      {showAccountSelector && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setShowAccountSelector(false)}
        >
          <div
            style={{
              background: '#13141b',
              border: '1px solid rgba(129, 140, 248, 0.3)',
              borderRadius: 20,
              padding: '24px',
              width: '100%',
              maxWidth: 420,
              boxShadow: '0 24px 70px rgba(0, 0, 0, 0.65)',
              fontFamily: "'Space Grotesk', sans-serif"
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#f3f4f6' }}>
                  Sign in with Google Account
                </h3>
              </div>
              <button
                onClick={() => setShowAccountSelector(false)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: 12.5, color: '#9ca3af', margin: '0 0 16px', lineHeight: 1.45 }}>
              Choose or confirm your Google Account. Your chat history, threads, and created artifacts will be saved to this account.
            </p>

            {/* Quick Suggested Google Account */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#818cf8', textTransform: 'uppercase', marginBottom: 6 }}>
                Primary Account
              </div>
              <button
                onClick={() => handleQuickGoogleSignIn(defaultGoogleEmail, defaultGoogleName)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'rgba(129, 140, 248, 0.12)',
                  border: '1px solid rgba(129, 140, 248, 0.35)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(129, 140, 248, 0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(129, 140, 248, 0.12)'}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 14
                }}>
                  SY
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#f3f4f6' }}>
                    {defaultGoogleName}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#a5b4fc', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {defaultGoogleEmail}
                  </div>
                </div>
                <ArrowRight size={15} color="#818cf8" />
              </button>
            </div>

            {/* Custom Google Email Form */}
            <form onSubmit={handleCustomGoogleSubmit} style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 8 }}>
                Or use another Google Account
              </div>
              <input
                type="email"
                placeholder="youremail@gmail.com"
                value={customEmail}
                onChange={e => setCustomEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  fontSize: 16,
                  outline: 'none',
                  boxSizing: 'border-box',
                  marginBottom: 10,
                  fontFamily: "'Space Grotesk', sans-serif"
                }}
              />
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: '#4f46e5',
                  border: 'none',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Space Grotesk', sans-serif"
                }}
              >
                Sign In & Save Chat History
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
