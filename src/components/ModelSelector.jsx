import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Zap, Sparkles, Cpu, Layers } from 'lucide-react';
import { COSMOS_MODELS, getModelById } from '../lib/models';
import { useSettings } from '../contexts/SettingsContext';

export default function ModelSelector() {
  const { selectedModel, updateModel } = useSettings();
  const [open, setOpen] = useState(false);
  const current = getModelById(selectedModel);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '6px 12px',
          borderRadius: 10,
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          cursor: 'pointer',
          color: '#e5e7eb',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "'Space Grotesk', sans-serif",
          transition: 'all 0.15s'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        }}
      >
        <span style={{ fontSize: 15 }}>{current?.icon}</span>
        <span>{current?.name}</span>
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          padding: '2px 6px',
          borderRadius: 6,
          background: `${current?.color}20`,
          color: current?.color
        }}>
          {current?.badge}
        </span>
        <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s', color: '#9ca3af' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          background: '#13141a',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 14,
          padding: '6px 0',
          width: 310,
          maxWidth: 'calc(100vw - 24px)',
          zIndex: 300,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.06)',
          fontFamily: "'Space Grotesk', sans-serif"
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 12px 8px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#818cf8',
              textTransform: 'uppercase',
              letterSpacing: 0.6
            }}>
              Select Cosmos Model
            </span>
            <span style={{ fontSize: 10, color: '#6b7280' }}>
              Scroll for more
            </span>
          </div>

          {/* Scrollable Model List */}
          <div
            className="model-scroll-list"
            style={{
              maxHeight: 250,
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '6px 8px',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {COSMOS_MODELS.map(model => {
              const isSelected = selectedModel === model.id;
              return (
                <button
                  key={model.id}
                  onClick={() => {
                    updateModel(model.id);
                    setOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '9px 10px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    textAlign: 'left',
                    background: isSelected ? 'rgba(129, 140, 248, 0.14)' : 'transparent',
                    border: isSelected ? '1px solid rgba(129, 140, 248, 0.35)' : '1px solid transparent',
                    transition: 'all 0.12s',
                    marginBottom: 3,
                    fontFamily: "'Space Grotesk', sans-serif"
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span style={{ fontSize: 20, marginTop: 1 }}>{model.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: isSelected ? '#818cf8' : '#e5e7eb' }}>
                        {model.name}
                      </span>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '1px 6px',
                        borderRadius: 6,
                        background: `${model.color}20`,
                        color: model.color,
                        flexShrink: 0
                      }}>
                        {model.badge}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, lineHeight: 1.35 }}>
                      {model.description}
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
                      {model.bestFor.map(tag => (
                        <span key={tag} style={{
                          fontSize: 9.5,
                          padding: '1px 5px',
                          borderRadius: 4,
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#9ca3af'
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <style>{`
            .model-scroll-list::-webkit-scrollbar {
              width: 5px;
            }
            .model-scroll-list::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.02);
              border-radius: 4px;
            }
            .model-scroll-list::-webkit-scrollbar-thumb {
              background: rgba(129, 140, 248, 0.4);
              border-radius: 4px;
            }
            .model-scroll-list::-webkit-scrollbar-thumb:hover {
              background: rgba(129, 140, 248, 0.7);
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
