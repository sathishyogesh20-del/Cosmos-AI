import { useState, useEffect } from 'react';
import {
  X, Globe, Cpu, Sparkles, Sliders, Type, Brain,
  Trash2, Download, Check, ShieldCheck
} from 'lucide-react';
import { useSettings, SYSTEM_PERSONAS, CLAUDE_STYLES } from '../contexts/SettingsContext';
import { SUPPORTED_LANGUAGES } from '../lib/groq';
import { COSMOS_MODELS } from '../lib/models';

export default function SettingsPanel() {
  const {
    settingsOpen, setSettingsOpen,
    language, updateLanguage,
    selectedModel, updateModel,
    temperature, updateTemperature,
    systemPersona, updateSystemPersona,
    responseStyle, updateResponseStyle,
    extendedThinking, updateExtendedThinking,
    streamingEnabled, updateStreamingEnabled,
    fontSize, updateFontSize
  } = useSettings();

  const [activeTab, setActiveTab] = useState('style'); // 'style', 'model', 'language', 'data'
  const [clearedNotice, setClearedNotice] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!settingsOpen) return null;

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your local chat history? This cannot be undone.')) {
      // Clear local cosmos items
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('cosmos_convs_') || k.startsWith('cosmos_msgs_') || k.startsWith('cosmos-pinned-chats')) {
          localStorage.removeItem(k);
        }
      });
      setClearedNotice(true);
      setTimeout(() => {
        setClearedNotice(false);
        window.location.reload();
      }, 1000);
    }
  };

  const handleExportAll = () => {
    const allData = {};
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('cosmos_')) {
        try {
          allData[k] = JSON.parse(localStorage.getItem(k));
        } catch {
          allData[k] = localStorage.getItem(k);
        }
      }
    });
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cosmos-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? 'max(8px, env(safe-area-inset-top)) 8px max(8px, env(safe-area-inset-bottom))' : '16px'
      }}
      onClick={() => setSettingsOpen(false)}
    >
      <div
        style={{
          background: '#13141b',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: isMobile ? 14 : 18,
          width: '100%',
          maxWidth: 620,
          maxHeight: isMobile ? '96dvh' : '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6)',
          fontFamily: "'Space Grotesk', sans-serif",
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Sparkles size={16} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#f3f4f6' }}>Cosmos Settings</h2>
              <p style={{ margin: 0, fontSize: 11.5, color: '#9ca3af' }}>Customize Claude-style response styles and preferences</p>
            </div>
          </div>

          <button
            onClick={() => setSettingsOpen(false)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              cursor: 'pointer',
              color: '#9ca3af',
              borderRadius: 8,
              padding: 6,
              display: 'flex'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab navigation */}
        <div style={{
          display: 'flex',
          gap: 6,
          padding: '8px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(255, 255, 255, 0.01)',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          WebkitOverflowScrolling: 'touch'
        }}>
          {[
            { id: 'style', label: 'Response Style & Reasoning', icon: <Brain size={14} /> },
            { id: 'model', label: 'Default Model', icon: <Cpu size={14} /> },
            { id: 'language', label: 'Language & Display', icon: <Globe size={14} /> },
            { id: 'data', label: 'Data & Privacy', icon: <ShieldCheck size={14} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                border: 'none',
                background: activeTab === tab.id ? 'rgba(129, 140, 248, 0.16)' : 'transparent',
                color: activeTab === tab.id ? '#c7d2fe' : '#9ca3af',
                fontSize: 12.5,
                fontWeight: activeTab === tab.id ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: "'Space Grotesk', sans-serif",
                flexShrink: 0
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* TAB 1: RESPONSE STYLE & REASONING (CLAUDE AI FEATURES) */}
          {activeTab === 'style' && (
            <div>
              {/* Claude Response Style */}
              <div style={{ marginBottom: 22 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb', display: 'block', marginBottom: 8 }}>
                  Response Style (Claude Profiles)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {CLAUDE_STYLES.map(style => {
                    const isSelected = responseStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => updateResponseStyle(style.id)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          padding: '10px 12px',
                          borderRadius: 10,
                          textAlign: 'left',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(129, 140, 248, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected ? '1px solid rgba(129, 140, 248, 0.38)' : '1px solid rgba(255, 255, 255, 0.06)',
                          transition: 'all 0.15s',
                          fontFamily: "'Space Grotesk', sans-serif"
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 3 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: isSelected ? '#818cf8' : '#f3f4f6' }}>
                            {style.name}
                          </span>
                          {isSelected && <Check size={14} color="#818cf8" />}
                        </div>
                        <span style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.35 }}>
                          {style.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Extended Thinking Mode Toggle (Claude 3.7 Feature) */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                background: 'rgba(129, 140, 248, 0.08)',
                border: '1px solid rgba(129, 140, 248, 0.22)',
                borderRadius: 10,
                marginBottom: 20
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Brain size={18} color="#818cf8" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f3f4f6' }}>Extended Thinking & Reasoning</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>Show collapsible step-by-step reasoning thought trace before answers</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={extendedThinking}
                  onChange={e => updateExtendedThinking(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#818cf8', cursor: 'pointer' }}
                />
              </div>

              {/* Persona Selector */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb', display: 'block', marginBottom: 8 }}>
                  System Role & Expertise
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {SYSTEM_PERSONAS.map(p => {
                    const isSelected = systemPersona === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => updateSystemPersona(p.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          padding: '10px 12px',
                          borderRadius: 10,
                          textAlign: 'left',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(129, 140, 248, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected ? '1px solid rgba(129, 140, 248, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                          transition: 'all 0.15s',
                          fontFamily: "'Space Grotesk', sans-serif"
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: isSelected ? '#818cf8' : '#f3f4f6' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                            {p.description}
                          </div>
                        </div>
                        {isSelected && <Check size={14} color="#818cf8" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Temperature Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb' }}>
                    Creativity (Temperature: {temperature})
                  </label>
                  <span style={{ fontSize: 11, color: '#818cf8' }}>
                    {temperature <= 0.3 ? 'Deterministic & Code' : temperature <= 0.7 ? 'Standard Balanced' : 'High Exploration'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={temperature}
                  onChange={e => updateTemperature(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#818cf8', cursor: 'pointer' }}
                />
              </div>
            </div>
          )}

          {/* TAB 2: DEFAULT MODEL */}
          {activeTab === 'model' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {COSMOS_MODELS.map(model => (
                <button
                  key={model.id}
                  onClick={() => updateModel(model.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    border: selectedModel === model.id ? `1px solid ${model.color}60` : '1px solid rgba(255,255,255,0.08)',
                    background: selectedModel === model.id ? `${model.color}15` : 'rgba(255,255,255,0.03)',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                    fontFamily: "'Space Grotesk', sans-serif"
                  }}
                >
                  <span style={{ fontSize: 22 }}>{model.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: selectedModel === model.id ? model.color : '#e5e7eb' }}>
                      {model.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{model.description}</div>
                  </div>
                  <span style={{
                    fontSize: 10,
                    padding: '3px 8px',
                    borderRadius: 20,
                    background: `${model.color}22`,
                    color: model.color,
                    fontWeight: 600
                  }}>
                    {model.badge}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* TAB 3: LANGUAGE & DISPLAY */}
          {activeTab === 'language' && (
            <div>
              {/* Font Size Selector */}
              <div style={{ marginBottom: 22 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb', display: 'block', marginBottom: 8 }}>
                  Chat Text Sizing
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { id: 'compact', label: 'Compact' },
                    { id: 'default', label: 'Default' },
                    { id: 'large', label: 'Comfortable' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => updateFontSize(f.id)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        border: fontSize === f.id ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.08)',
                        background: fontSize === f.id ? 'rgba(129, 140, 248, 0.15)' : 'rgba(255,255,255,0.03)',
                        color: fontSize === f.id ? '#c7d2fe' : '#9ca3af',
                        fontSize: 12.5,
                        fontWeight: fontSize === f.id ? 600 : 400
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Streaming Toggle */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 10,
                marginBottom: 20
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb' }}>Real-time Word Streaming</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>Render words continuously as they are generated</div>
                </div>
                <input
                  type="checkbox"
                  checked={streamingEnabled}
                  onChange={e => updateStreamingEnabled(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#818cf8', cursor: 'pointer' }}
                />
              </div>

              {/* Languages */}
              <label style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb', display: 'block', marginBottom: 8 }}>
                Response Language
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {SUPPORTED_LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => updateLanguage(lang.code)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      border: language === lang.code ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.08)',
                      background: language === lang.code ? 'rgba(129, 140, 248, 0.14)' : 'rgba(255,255,255,0.03)',
                      color: language === lang.code ? '#c7d2fe' : '#9ca3af',
                      fontSize: 12.5,
                      fontWeight: language === lang.code ? 600 : 400,
                      transition: 'all 0.15s',
                      fontFamily: "'Space Grotesk', sans-serif"
                    }}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DATA & PRIVACY */}
          {activeTab === 'data' && (
            <div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 12,
                padding: '16px',
                marginBottom: 20
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <ShieldCheck size={18} color="#34d399" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#f3f4f6' }}>Local-First Privacy</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>
                  Cosmos-AI runs with client-side isolation. Your chat history, pinned threads, and generated artifacts are stored securely in your browser's private local database.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={handleExportAll}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '11px',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#e5e7eb',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <Download size={14} />
                  <span>Export All Data & History (.json)</span>
                </button>

                <button
                  onClick={handleClearHistory}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '11px',
                    borderRadius: 10,
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#fca5a5',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <Trash2 size={14} />
                  <span>{clearedNotice ? 'Cleared!' : 'Clear All Local Chat History'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
