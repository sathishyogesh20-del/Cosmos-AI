import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { COSMOS_MODELS, getModelById } from '../lib/models';
import { useSettings } from '../contexts/SettingsContext';

export default function ModelSelector() {
  const { selectedModel, updateModel } = useSettings();
  const [open, setOpen] = useState(false);
  const current = getModelById(selectedModel);

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 20,
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
        cursor: 'pointer', color: '#c0c0e0', fontSize: 13, fontWeight: 500,
        fontFamily: "'Space Grotesk', sans-serif", transition: 'all 0.2s'
      }}>
        <span style={{ fontSize: 14 }}>{current?.icon}</span>
        <span>{current?.name}</span>
        <span style={{
          fontSize: 10, padding: '2px 6px', borderRadius: 10,
          background: `${current?.color}22`, color: current?.color
        }}>{current?.badge}</span>
        <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : '', transition: '0.2s' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0,
          background: 'linear-gradient(135deg, #0d0f1a, #10102a)',
          border: '1px solid rgba(124,111,255,0.3)', borderRadius: 14,
          padding: 8, minWidth: 300, zIndex: 200,
          boxShadow: '0 16px 48px rgba(40,20,120,0.5)',
          fontFamily: "'Space Grotesk', sans-serif"
        }}>
          {COSMOS_MODELS.map(model => (
            <button
              key={model.id}
              onClick={() => { updateModel(model.id); setOpen(false); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '10px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                background: selectedModel === model.id ? `${model.color}15` : 'transparent',
                border: selectedModel === model.id ? `1px solid ${model.color}40` : '1px solid transparent',
                transition: 'all 0.15s', marginBottom: 2,
                fontFamily: "'Space Grotesk', sans-serif"
              }}
            >
              <span style={{ fontSize: 18, marginTop: 1 }}>{model.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: selectedModel === model.id ? model.color : '#d0d0f0' }}>
                    {model.name}
                  </span>
                  <span style={{
                    fontSize: 10, padding: '2px 7px', borderRadius: 10,
                    background: `${model.color}22`, color: model.color
                  }}>{model.badge}</span>
                </div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{model.description}</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                  {model.bestFor.map(tag => (
                    <span key={tag} style={{
                      fontSize: 10, padding: '2px 6px', borderRadius: 6,
                      background: 'rgba(255,255,255,0.06)', color: '#888'
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
