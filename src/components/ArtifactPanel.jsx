import { useState } from 'react';
import { X, Download, Copy, Check, Code, FileText, Globe, ChevronLeft, ChevronRight } from 'lucide-react';

export function parseArtifacts(content) {
  const artifacts = [];
  const regex = /<cosmos-artifact\s+type="([^"]+)"\s+filename="([^"]+)"(?:\s+language="([^"]+)")?>([\s\S]*?)<\/cosmos-artifact>/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    artifacts.push({
      type: match[1],
      filename: match[2],
      language: match[3] || 'text',
      content: match[4].trim()
    });
  }
  return artifacts;
}

export function stripArtifacts(content) {
  return content.replace(/<cosmos-artifact[\s\S]*?<\/cosmos-artifact>/g, '').trim();
}

function ArtifactIcon({ type }) {
  if (type === 'html') return <Globe size={14} />;
  if (type === 'code') return <Code size={14} />;
  return <FileText size={14} />;
}

export default function ArtifactPanel({ artifacts, onClose }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState(false);
  const artifact = artifacts[activeIdx];

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([artifact.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = artifact.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!artifact) return null;

  return (
    <div style={{
      width: '45%', minWidth: 340, height: '100%', display: 'flex', flexDirection: 'column',
      background: '#0d0f1a', borderLeft: '1px solid rgba(100,100,200,0.2)',
      fontFamily: "'Space Grotesk', sans-serif"
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '12px 16px', borderBottom: '1px solid rgba(100,100,200,0.2)',
        background: 'rgba(255,255,255,0.03)'
      }}>
        {artifacts.length > 1 && (
          <>
            <button onClick={() => setActiveIdx(i => Math.max(0, i - 1))}
              disabled={activeIdx === 0} style={navBtnStyle}>
              <ChevronLeft size={14} />
            </button>
            <span style={{ color: '#888', fontSize: 12 }}>{activeIdx + 1}/{artifacts.length}</span>
            <button onClick={() => setActiveIdx(i => Math.min(artifacts.length - 1, i + 1))}
              disabled={activeIdx === artifacts.length - 1} style={navBtnStyle}>
              <ChevronRight size={14} />
            </button>
          </>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, color: '#a0a0c0' }}>
          <ArtifactIcon type={artifact.type} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>{artifact.filename}</span>
          <span style={{
            fontSize: 11, background: 'rgba(124,111,255,0.2)', color: '#9f8fff',
            padding: '2px 8px', borderRadius: 20, marginLeft: 4
          }}>{artifact.type}</span>
        </div>
        {artifact.type === 'html' && (
          <button onClick={() => setPreview(p => !p)} style={{
            ...actionBtnStyle, background: preview ? 'rgba(0,212,255,0.2)' : 'transparent',
            color: preview ? '#00d4ff' : '#888'
          }}>
            {preview ? 'Code' : 'Preview'}
          </button>
        )}
        <button onClick={handleCopy} style={actionBtnStyle}>
          {copied ? <Check size={14} color="#00ff9d" /> : <Copy size={14} />}
        </button>
        <button onClick={handleDownload} style={actionBtnStyle}>
          <Download size={14} />
        </button>
        <button onClick={onClose} style={actionBtnStyle}>
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {artifact.type === 'html' && preview ? (
          <iframe
            srcDoc={artifact.content}
            style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
            sandbox="allow-scripts"
            title="HTML Preview"
          />
        ) : (
          <pre style={{
            margin: 0, padding: 16, fontSize: 13, lineHeight: 1.6,
            color: '#c8d3f5', fontFamily: "'Space Mono', monospace",
            whiteSpace: 'pre-wrap', wordBreak: 'break-all'
          }}>
            {artifact.content}
          </pre>
        )}
      </div>
    </div>
  );
}

const navBtnStyle = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  color: '#888', padding: 4, display: 'flex', alignItems: 'center'
};
const actionBtnStyle = {
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  cursor: 'pointer', color: '#a0a0c0', padding: '4px 8px',
  borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12
};
