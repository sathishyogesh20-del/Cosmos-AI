import { useState, useEffect } from 'react';
import {
  X, Download, Copy, Check, Code, Globe, FileText,
  ChevronLeft, ChevronRight, Maximize2, Minimize2, RefreshCw
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export function parseArtifacts(content) {
  if (!content) return [];
  const artifacts = [];
  const regex = /<cosmos-artifact\s+type="([^"]+)"\s+filename="([^"]+)"(?:\s+language="([^"]+)")?>([\s\S]*?)<\/cosmos-artifact>/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    artifacts.push({
      type: match[1],
      filename: match[2],
      language: match[3] || (match[1] === 'html' ? 'html' : 'text'),
      content: match[4].trim()
    });
  }
  return artifacts;
}

export function stripArtifacts(content) {
  if (!content) return '';
  return content.replace(/<cosmos-artifact[\s\S]*?<\/cosmos-artifact>/g, '').trim();
}

function ArtifactTypeBadge({ type }) {
  if (type === 'html') {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#38bdf8' }}>
        <Globe size={13} />
        <span>HTML & Web</span>
      </span>
    );
  }
  if (type === 'code') {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#818cf8' }}>
        <Code size={13} />
        <span>Source Code</span>
      </span>
    );
  }
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fbbf24' }}>
      <FileText size={13} />
      <span>Document</span>
    </span>
  );
}

export default function ArtifactPanel({ artifacts, activeIndex = 0, onClose }) {
  const [activeIdx, setActiveIdx] = useState(activeIndex);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [key, setKey] = useState(0);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const artifact = artifacts[activeIdx] || artifacts[0];

  const handleCopy = () => {
    if (!artifact) return;
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!artifact) return;
    const blob = new Blob([artifact.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = artifact.filename || 'artifact.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!artifact) return null;

  const isHtml = artifact.type === 'html' || artifact.filename?.endsWith('.html');

  const containerStyle = isFullscreen || isMobile
    ? {
        position: 'fixed',
        inset: 0,
        zIndex: 140,
        width: '100%',
        height: '100%',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: '#111217',
        boxShadow: 'none',
        fontFamily: "'Space Grotesk', sans-serif",
        paddingTop: isMobile ? 'max(0px, env(safe-area-inset-top))' : 0,
        paddingBottom: isMobile ? 'max(0px, env(safe-area-inset-bottom))' : 0
      }
    : {
        position: 'relative',
        width: '46%',
        minWidth: 360,
        maxWidth: 720,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#111217',
        borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.45)',
        fontFamily: "'Space Grotesk', sans-serif",
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
      };

  return (
    <div style={containerStyle}>
      {/* Claude-style Artifact Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(255, 255, 255, 0.02)',
        flexShrink: 0,
        gap: 8
      }}>
        {/* Left: Artifact metadata & pagination */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
          {artifacts.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginRight: 4 }}>
              <button
                onClick={() => setActiveIdx(i => Math.max(0, i - 1))}
                disabled={activeIdx === 0}
                style={navBtnStyle(activeIdx === 0)}
                title="Previous artifact"
              >
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: 11, color: '#6b7280', margin: '0 2px', fontFamily: "'Space Mono', monospace" }}>
                {activeIdx + 1}/{artifacts.length}
              </span>
              <button
                onClick={() => setActiveIdx(i => Math.min(artifacts.length - 1, i + 1))}
                disabled={activeIdx === artifacts.length - 1}
                style={navBtnStyle(activeIdx === artifacts.length - 1)}
                title="Next artifact"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#f3f4f6',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {artifact.filename}
            </span>
            <div style={{ fontSize: 11 }}>
              <ArtifactTypeBadge type={artifact.type} />
            </div>
          </div>
        </div>

        {/* Center / Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {isHtml && (
            <div style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.06)',
              borderRadius: 8,
              padding: 2,
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <button
                onClick={() => setViewMode('preview')}
                style={{
                  background: viewMode === 'preview' ? '#818cf8' : 'transparent',
                  color: viewMode === 'preview' ? '#fff' : '#9ca3af',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Preview
              </button>
              <button
                onClick={() => setViewMode('code')}
                style={{
                  background: viewMode === 'code' ? '#818cf8' : 'transparent',
                  color: viewMode === 'code' ? '#fff' : '#9ca3af',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Code
              </button>
            </div>
          )}

          {isHtml && viewMode === 'preview' && (
            <button
              onClick={() => setKey(k => k + 1)}
              title="Reload preview"
              style={iconBtnStyle}
            >
              <RefreshCw size={13} />
            </button>
          )}

          <button
            onClick={handleCopy}
            title="Copy artifact code"
            style={iconBtnStyle}
          >
            {copied ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
          </button>

          <button
            onClick={handleDownload}
            title="Download file"
            style={iconBtnStyle}
          >
            <Download size={13} />
          </button>

          {!isMobile && (
            <button
              onClick={() => setIsFullscreen(f => !f)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              style={iconBtnStyle}
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          )}

          <button
            onClick={onClose}
            title="Close Artifact panel"
            style={{ ...iconBtnStyle, color: '#ef4444' }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Artifact Viewport */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative', background: '#0c0d11', WebkitOverflowScrolling: 'touch' }}>
        {isHtml && viewMode === 'preview' ? (
          <iframe
            key={key}
            srcDoc={artifact.content}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: '#ffffff'
            }}
            sandbox="allow-scripts allow-modals"
            title={artifact.filename || 'Preview'}
          />
        ) : (
          <div style={{ margin: 0, padding: 0 }}>
            <SyntaxHighlighter
              language={artifact.language || 'text'}
              style={vscDarkPlus}
              showLineNumbers={!isMobile}
              customStyle={{
                margin: 0,
                padding: '14px',
                background: 'transparent',
                fontSize: 12.5,
                fontFamily: "'Space Mono', monospace",
                lineHeight: 1.6
              }}
              wrapLongLines={true}
            >
              {artifact.content}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </div>
  );
}

const navBtnStyle = (disabled) => ({
  background: 'transparent',
  border: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer',
  color: disabled ? '#374151' : '#9ca3af',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  borderRadius: 4
});

const iconBtnStyle = {
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  cursor: 'pointer',
  color: '#9ca3af',
  padding: '6px 7px',
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.15s'
};
