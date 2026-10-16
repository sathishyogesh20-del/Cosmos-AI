import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', margin: '12px 0', border: '1px solid rgba(100,100,200,0.3)' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '6px 12px', background: 'rgba(20,20,50,0.8)',
        borderBottom: '1px solid rgba(100,100,200,0.2)'
      }}>
        <span style={{ fontSize: 12, color: '#7c6fff', fontFamily: "'Space Mono', monospace" }}>
          {language || 'code'}
        </span>
        <button onClick={handleCopy} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: copied ? '#00ff9d' : '#888', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12
        }}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre style={{
        margin: 0, padding: '14px 16px', background: 'rgba(8,8,24,0.9)',
        color: '#c8d3f5', fontSize: 13, lineHeight: 1.6,
        fontFamily: "'Space Mono', monospace", overflowX: 'auto',
        whiteSpace: 'pre-wrap', wordBreak: 'break-word'
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function MessageRenderer({ content }) {
  const parts = [];
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'code', language: match[1] || '', content: match[2] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) });
  }

  return (
    <div style={{ lineHeight: 1.7, color: '#d8d8f0', fontSize: 15 }}>
      {parts.map((part, i) => {
        if (part.type === 'code') return <CodeBlock key={i} code={part.content} language={part.language} />;
        return (
          <span key={i} style={{ whiteSpace: 'pre-wrap' }}
            dangerouslySetInnerHTML={{
              __html: part.content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`([^`]+)`/g, '<code style="background:rgba(100,100,200,0.15);padding:2px 6px;border-radius:4px;font-family:Space Mono,monospace;font-size:13px;color:#a0cfff">$1</code>')
                .replace(/^### (.*)/gm, '<h3 style="color:#a0a0ff;margin:16px 0 8px">$1</h3>')
                .replace(/^## (.*)/gm, '<h2 style="color:#c0b0ff;margin:20px 0 10px">$1</h2>')
                .replace(/^# (.*)/gm, '<h1 style="color:#e0d0ff;margin:24px 0 12px">$1</h1>')
                .replace(/^- (.*)/gm, '<div style="display:flex;gap:8px;margin:4px 0"><span style="color:#7c6fff">▸</span><span>$1</span></div>')
                .replace(/^\d+\. (.*)/gm, '<div style="margin:4px 0;padding-left:8px">$1</div>')
            }}
          />
        );
      })}
    </div>
  );
}
