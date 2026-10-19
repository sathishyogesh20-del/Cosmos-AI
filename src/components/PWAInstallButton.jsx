import { useState } from 'react';
import { Download, Smartphone, Share2, PlusSquare, X, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function PWAInstallButton({ variant = 'compact' }) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already running inside standalone PWA window, don't show prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 3000);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // Ambient guide for desktop or unsupported browsers
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {variant === 'sidebar' ? (
        <button
          onClick={handleInstallClick}
          aria-label="Install mobile app"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 500,
            color: '#c4b5fd',
            background: 'linear-gradient(135deg, rgba(124, 111, 255, 0.15), rgba(58, 16, 192, 0.25))',
            border: '1px solid rgba(124, 111, 255, 0.35)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease',
            boxShadow: '0 2px 8px rgba(124, 111, 255, 0.12)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124, 111, 255, 0.25), rgba(58, 16, 192, 0.4))';
            e.currentTarget.style.borderColor = 'rgba(124, 111, 255, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124, 111, 255, 0.15), rgba(58, 16, 192, 0.25))';
            e.currentTarget.style.borderColor = 'rgba(124, 111, 255, 0.35)';
          }}
        >
          <div style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: 'rgba(124, 111, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#a78bfa',
            flexShrink: 0
          }}>
            {justInstalled ? <Check size={14} color="#10b981" /> : <Smartphone size={14} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#f3f4f6', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              Install App
              <span style={{
                fontSize: 10,
                padding: '1px 5px',
                borderRadius: 4,
                background: 'rgba(124, 111, 255, 0.35)',
                color: '#e0e7ff',
                fontWeight: 600
              }}>PWA</span>
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Add to Home Screen
            </div>
          </div>
          <Download size={14} style={{ opacity: 0.8, color: '#c4b5fd' }} />
        </button>
      ) : (
        <button
          onClick={handleInstallClick}
          aria-label="Install mobile app"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 10px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 500,
            color: '#e0e7ff',
            background: 'linear-gradient(135deg, rgba(124, 111, 255, 0.2), rgba(58, 16, 192, 0.35))',
            border: '1px solid rgba(124, 111, 255, 0.4)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Install Cosmos-AI on your phone or desktop"
        >
          <Smartphone size={14} style={{ color: '#a78bfa' }} />
          <span>Install</span>
        </button>
      )}

      {/* iOS or Manual Install Modal */}
      {showIOSModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setShowIOSModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 400,
              background: '#151722',
              borderRadius: 16,
              border: '1px solid rgba(124, 111, 255, 0.3)',
              padding: 24,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
              color: '#f3f4f6'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src="/cosmos-icon.svg" alt="Cosmos-AI" style={{ width: 36, height: 36, borderRadius: 8 }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#fff' }}>Install Cosmos-AI</h3>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>Fast, offline-ready & standalone app</div>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: 13, lineHeight: 1.6, color: '#d1d5db', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {isIOS ? (
                <>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(124, 111, 255, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#a78bfa' }}>
                      <Share2 size={16} />
                    </div>
                    <div>
                      <strong style={{ color: '#fff' }}>1. Tap the Share button</strong>
                      <p style={{ margin: '2px 0 0', color: '#9ca3af', fontSize: 12 }}>
                        In Safari bottom toolbar, tap the Share icon.
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(124, 111, 255, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#a78bfa' }}>
                      <PlusSquare size={16} />
                    </div>
                    <div>
                      <strong style={{ color: '#fff' }}>2. Tap "Add to Home Screen"</strong>
                      <p style={{ margin: '2px 0 0', color: '#9ca3af', fontSize: 12 }}>
                        Scroll down and select "Add to Home Screen" to install Cosmos-AI.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ margin: 0 }}>
                    Cosmos-AI is a Progressive Web App (PWA). You can install it on your mobile device or desktop for instant full-screen access:
                  </p>
                  <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '12px 14px', borderRadius: 10, fontSize: 12, color: '#e5e7eb' }}>
                    • On <strong>Android Chrome</strong>: Tap <strong>⋮</strong> (menu) &rarr; <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.<br />
                    • On <strong>Chrome / Edge (Desktop)</strong>: Click the install icon in the URL address bar or browser menu.<br />
                    • On <strong>iOS Safari</strong>: Tap <strong>Share</strong> &rarr; <strong>"Add to Home Screen"</strong>.
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              style={{
                marginTop: 20,
                width: '100%',
                padding: '10px 0',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #7c6fff, #5b46e8)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'opacity 0.15s ease'
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
