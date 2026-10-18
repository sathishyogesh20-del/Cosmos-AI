import { useState } from 'react';
import { Copy, Check, ExternalLink, Code2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function CodeBlock({ code, language, onOpenArtifact }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenArtifact = () => {
    if (onOpenArtifact) {
      const ext = language === 'python' ? 'py' : language === 'javascript' || language === 'js' ? 'js' : language === 'html' ? 'html' : 'txt';
      onOpenArtifact({
        type: language === 'html' ? 'html' : 'code',
        filename: `snippet.${ext}`,
        language: language || 'text',
        content: code
      });
    }
  };

  return (
    <div style={{
      borderRadius: 12,
      overflow: 'hidden',
      margin: '16px 0',
      maxWidth: '100%',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      background: '#13141b',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)'
    }}>
      {/* Code block header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 14px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Code2 size={13} color="#818cf8" />
          <span style={{
            fontSize: 12,
            color: '#a5b4fc',
            fontFamily: "'Space Mono', monospace",
            fontWeight: 500,
            textTransform: 'lowercase'
          }}>
            {language || 'code'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onOpenArtifact && (
            <button
              onClick={handleOpenArtifact}
              title="Open in Artifacts panel"
              style={{
                background: 'rgba(129, 140, 248, 0.1)',
                border: '1px solid rgba(129, 140, 248, 0.25)',
                cursor: 'pointer',
                color: '#c7d2fe',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                padding: '3px 8px',
                borderRadius: 6,
                fontFamily: "'Space Grotesk', sans-serif",
                transition: 'all 0.15s'
              }}
            >
              <ExternalLink size={11} />
              <span>Artifact</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            title="Copy code"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: copied ? '#34d399' : '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              padding: '3px 6px',
              borderRadius: 6,
              fontFamily: "'Space Grotesk', sans-serif",
              transition: 'all 0.15s'
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Syntax highlighted code */}
      <div style={{ fontSize: 13, fontFamily: "'Space Mono', monospace" }}>
        <SyntaxHighlighter
          language={language || 'text'}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '14px 16px',
            background: 'transparent',
            lineHeight: 1.6
          }}
          wrapLongLines={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export default function MessageRenderer({ content, onOpenArtifact }) {
  if (!content) return null;

  const parts = [];
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'code', language: match[1] || '', content: match[2].trim() });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) });
  }

  return (
    <div style={{
      lineHeight: 1.7,
      color: '#e5e7eb',
      fontSize: 14.5,
      wordBreak: 'break-word',
      overflowWrap: 'anywhere'
    }}>
      {parts.map((part, i) => {
        if (part.type === 'code') {
          return (
            <CodeBlock
              key={i}
              code={part.content}
              language={part.language}
              onOpenArtifact={onOpenArtifact}
            />
          );
        }

        // Render formatted text with typography enhancements
        return (
          <span
            key={i}
            style={{ whiteSpace: 'pre-wrap' }}
            dangerouslySetInnerHTML={{
              __html: part.content
                .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
                .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#f3f4f6;font-weight:600">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em style="color:#d1d5db">$1</em>')
                .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:5px;font-family:Space Mono,monospace;font-size:12.5px;color:#c7d2fe;border:1px solid rgba(255,255,255,0.06)">$1</code>')
                .replace(/^### (.*)/gm, '<h3 style="color:#e0e7ff;font-size:16px;font-weight:600;margin:18px 0 8px">$1</h3>')
                .replace(/^## (.*)/gm, '<h2 style="color:#ede9fe;font-size:18px;font-weight:700;margin:22px 0 10px">$1</h2>')
                .replace(/^# (.*)/gm, '<h1 style="color:#ffffff;font-size:21px;font-weight:700;margin:26px 0 12px">$1</h1>')
                .replace(/^> (.*)/gm, '<blockquote style="border-left:3px solid #818cf8;padding-left:12px;margin:12px 0;color:#9ca3af;font-style:italic">$1</blockquote>')
                .replace(/^- (.*)/gm, '<div style="display:flex;gap:8px;margin:4px 0"><span style="color:#818cf8;line-height:1.7">·</span><span>$1</span></div>')
                .replace(/^\d+\. (.*)/gm, '<div style="margin:4px 0;padding-left:8px">$1</div>')
            }}
          />
        );
      })}
    </div>
  );
}
