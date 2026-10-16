import { X, Globe, Cpu, Sparkles } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { SUPPORTED_LANGUAGES } from '../lib/groq';
import { COSMOS_MODELS } from '../lib/models';

export default function SettingsPanel() {
  const { settingsOpen, setSettingsOpen, language, updateLanguage, selectedModel, updateModel } = useSettings();
  if (!settingsOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={() => setSettingsOpen(false)}>
      <div style={{
        background: 'linear-gradient(135deg, #0d0f1a 0%, #10102a 100%)',
        border: '1px solid rgba(124,111,255,0.3)',
        borderRadius: 20, padding: 28, width: '100%', maxWidth: 520,
        boxShadow: '0 24px 80px rgba(60,40,160,0.4)',
        fontFamily: "'Space Grotesk', sans-serif"
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={18} color="#7c6fff" />
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#e0e0ff' }}>Settings</h2>
          </div>
          <button onClick={() => setSettingsOpen(false)} style={{
            background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer',
            color: '#888', borderRadius: 8, padding: 6, display: 'flex'
          }}><X size={16} /></button>
        </div>

        {/* Language Section */}
        <section style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Globe size={15} color="#00d4ff" />
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#a0a0d0' }}>Response Language</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {SUPPORTED_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => updateLanguage(lang.code)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                  border: language === lang.code
                    ? '1px solid rgba(0,212,255,0.6)'
                    : '1px solid rgba(255,255,255,0.08)',
                  background: language === lang.code
                    ? 'rgba(0,212,255,0.1)'
                    : 'rgba(255,255,255,0.04)',
                  color: language === lang.code ? '#00d4ff' : '#a0a0c0',
                  fontSize: 13, fontWeight: language === lang.code ? 600 : 400,
                  transition: 'all 0.2s', fontFamily: "'Space Grotesk', sans-serif"
                }}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Default Model Section */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Cpu size={15} color="#7c6fff" />
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#a0a0d0' }}>Default Model</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {COSMOS_MODELS.map(model => (
              <button
                key={model.id}
                onClick={() => updateModel(model.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                  border: selectedModel === model.id
                    ? `1px solid ${model.color}60`
                    : '1px solid rgba(255,255,255,0.08)',
                  background: selectedModel === model.id
                    ? `${model.color}18`
                    : 'rgba(255,255,255,0.04)',
                  textAlign: 'left', transition: 'all 0.2s',
                  fontFamily: "'Space Grotesk', sans-serif"
                }}
              >
                <span style={{ fontSize: 20 }}>{model.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: selectedModel === model.id ? model.color : '#c0c0e0' }}>
                    {model.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{model.description}</div>
                </div>
                <span style={{
                  fontSize: 10, padding: '3px 8px', borderRadius: 20,
                  background: `${model.color}22`, color: model.color, fontWeight: 600
                }}>{model.badge}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
