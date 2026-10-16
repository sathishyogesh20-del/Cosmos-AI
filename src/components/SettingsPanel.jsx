import { useState } from 'react';
import {
  X, Globe, Cpu, Sparkles, Key, Sliders, Shield,
  ExternalLink, Eye, EyeOff, Check
} from 'lucide-react';
import { useSettings, SYSTEM_PERSONAS } from '../contexts/SettingsContext';
import { SUPPORTED_LANGUAGES } from '../lib/groq';
import { COSMOS_MODELS } from '../lib/models';

export default function SettingsPanel() {
  const {
    settingsOpen, setSettingsOpen,
    language, updateLanguage,
    selectedModel, updateModel,
    groqApiKey, updateGroqApiKey,
    tavilyApiKey, updateTavilyApiKey,
    temperature, updateTemperature,
    systemPersona, updateSystemPersona,
    streamingEnabled, updateStreamingEnabled
  } = useSettings();

  const [activeTab, setActiveTab] = useState('keys'); // 'keys', 'persona', 'model', 'language'
  const [groqInput, setGroqInput] = useState(groqApiKey);
  const [tavilyInput, setTavilyInput] = useState(tavilyApiKey);
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showTavilyKey, setShowTavilyKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!settingsOpen) return null;

  const handleSaveKeys = (e) => {
    e.preventDefault();
    updateGroqApiKey(groqInput.trim());
    updateTavilyApiKey(tavilyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
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
        padding: 20
      }}
      onClick={() => setSettingsOpen(false)}
    >
      <div
        style={{
          background: '#13141b',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 18,
          width: '100%',
          maxWidth: 640,
          maxHeight: '90vh',
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
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
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
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#f3f4f6' }}>Cosmos Settings</h2>
              <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>Configure models, API keys, and AI behavior</p>
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
          padding: '10px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(255, 255, 255, 0.01)',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          WebkitOverflowScrolling: 'touch'
        }}>
          {[
            { id: 'keys', label: 'API Keys', icon: <Key size={14} /> },
            { id: 'persona', label: 'AI Persona & Creativity', icon: <Sliders size={14} /> },
            { id: 'model', label: 'Default Model', icon: <Cpu size={14} /> },
            { id: 'language', label: 'Language', icon: <Globe size={14} /> }
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
                background: activeTab === tab.id ? 'rgba(129, 140, 248, 0.15)' : 'transparent',
                color: activeTab === tab.id ? '#c7d2fe' : '#9ca3af',
                fontSize: 13,
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* TAB 1: API KEYS */}
          {activeTab === 'keys' && (
            <div>
              <div style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: 20
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Shield size={16} color="#818cf8" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#e0e7ff' }}>Private Client Storage</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>
                  Your keys are securely stored inside your browser's local storage and used directly for API requests. No keys are sent to external servers other than Groq/Tavily.
                </p>
              </div>

              <form onSubmit={handleSaveKeys}>
                {/* Groq API Key */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb' }}>
                      Groq API Key <span style={{ color: '#818cf8' }}>(for ultra-fast Llama-3.3 live inference)</span>
                    </label>
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 11, color: '#818cf8', display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}
                    >
                      Get free key <ExternalLink size={10} />
                    </a>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showGroqKey ? 'text' : 'password'}
                      value={groqInput}
                      onChange={e => setGroqInput(e.target.value)}
                      placeholder="gsk_..."
                      style={{
                        width: '100%',
                        padding: '10px 40px 10px 12px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 8,
                        color: '#f3f4f6',
                        fontSize: 13,
                        fontFamily: "'Space Mono', monospace",
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowGroqKey(s => !s)}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        padding: 4
                      }}
                    >
                      {showGroqKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Tavily API Key */}
                <div style={{ marginBottom: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb' }}>
                      Tavily Search API Key <span style={{ color: '#6b7280' }}>(Optional - for web search)</span>
                    </label>
                    <a
                      href="https://tavily.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 11, color: '#818cf8', display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}
                    >
                      Get key <ExternalLink size={10} />
                    </a>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showTavilyKey ? 'text' : 'password'}
                      value={tavilyInput}
                      onChange={e => setTavilyInput(e.target.value)}
                      placeholder="tvly-..."
                      style={{
                        width: '100%',
                        padding: '10px 40px 10px 12px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 8,
                        color: '#f3f4f6',
                        fontSize: 13,
                        fontFamily: "'Space Mono', monospace",
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowTavilyKey(s => !s)}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        padding: 4
                      }}
                    >
                      {showTavilyKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    type="submit"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    {savedSuccess ? <Check size={14} /> : null}
                    <span>{savedSuccess ? 'Saved Successfully!' : 'Save Keys'}</span>
                  </button>

                  <span style={{ fontSize: 12, color: groqApiKey ? '#34d399' : '#a1a1aa' }}>
                    {groqApiKey ? '✓ Live Groq API Active' : '○ Cosmos Local Engine Mode Active (No key required to chat)'}
                  </span>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: PERSONA & CREATIVITY */}
          {activeTab === 'persona' && (
            <div>
              {/* Persona selector */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb', display: 'block', marginBottom: 10 }}>
                  Cosmos Assistant Persona
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                          gap: 12,
                          padding: '12px 14px',
                          borderRadius: 10,
                          textAlign: 'left',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(129, 140, 248, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected ? '1px solid rgba(129, 140, 248, 0.35)' : '1px solid rgba(255, 255, 255, 0.06)',
                          transition: 'all 0.15s',
                          fontFamily: "'Space Grotesk', sans-serif"
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: isSelected ? '#818cf8' : '#f3f4f6' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                            {p.description}
                          </div>
                        </div>
                        {isSelected && <Check size={16} color="#818cf8" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Creativity / Temperature Slider */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb' }}>
                    Creativity (Temperature: {temperature})
                  </label>
                  <span style={{ fontSize: 11, color: '#818cf8' }}>
                    {temperature <= 0.3 ? 'Deterministic & Precise' : temperature <= 0.7 ? 'Balanced Reasoning' : 'High Creativity'}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                  <span>0.1 (Precise Code)</span>
                  <span>0.7 (Default)</span>
                  <span>1.0 (Creative)</span>
                </div>
              </div>

              {/* Streaming toggle */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 10
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb' }}>Stream Responses</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>Render words in real-time as they are synthesized</div>
                </div>
                <input
                  type="checkbox"
                  checked={streamingEnabled}
                  onChange={e => updateStreamingEnabled(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#818cf8', cursor: 'pointer' }}
                />
              </div>
            </div>
          )}

          {/* TAB 3: DEFAULT MODEL */}
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

          {/* TAB 4: LANGUAGE */}
          {activeTab === 'language' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {SUPPORTED_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => updateLanguage(lang.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    border: language === lang.code ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.08)',
                    background: language === lang.code ? 'rgba(129, 140, 248, 0.15)' : 'rgba(255,255,255,0.03)',
                    color: language === lang.code ? '#c7d2fe' : '#9ca3af',
                    fontSize: 13,
                    fontWeight: language === lang.code ? 600 : 400,
                    transition: 'all 0.15s',
                    fontFamily: "'Space Grotesk', sans-serif"
                  }}
                >
                  <span style={{ fontSize: 16 }}>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
