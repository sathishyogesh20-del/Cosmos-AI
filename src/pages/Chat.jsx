import { useState, useEffect, useRef } from 'react';
import {
  Send, Globe, Paperclip, X, Loader2, Search, Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { sendMessage, readFileAsText } from '../lib/groq';
import { getGroqModel, getModelById } from '../lib/models';
import { createConversation, addMessage, getMessages, updateConversationTitle } from '../lib/firestore';
import MessageRenderer from '../components/MessageRenderer';
import ArtifactPanel, { parseArtifacts, stripArtifacts } from '../components/ArtifactPanel';
import ModelSelector from '../components/ModelSelector';
import Sidebar from '../components/Sidebar';
import SettingsPanel from '../components/SettingsPanel';
import AdBanner from '../components/AdBanner';

const STARTERS = [
  { icon: '💻', text: 'Write a Python web scraper', prompt: 'Write me a Python web scraper using BeautifulSoup that scrapes product names and prices from an e-commerce site.' },
  { icon: '🚀', text: 'Build a landing page', prompt: 'Build me a modern, animated landing page for a space technology startup called Cosmos. Include hero section, features, and CTA.' },
  { icon: '🔍', text: 'Search the web for me', prompt: 'Search the web and find me the latest developments in AI and space exploration from 2025.' },
  { icon: '🐛', text: 'Debug my code', prompt: 'Help me debug and improve my code. I\'ll paste it below.' },
  { icon: '📊', text: 'Analyze a dataset', prompt: 'Help me write Python code to analyze a CSV dataset and create visualizations using matplotlib.' },
  { icon: '🌌', text: 'Explain black holes', prompt: 'Explain how black holes form, their types, and what happens at the event horizon in detail.' },
];

export default function Chat() {
  const { user } = useAuth();
  const { selectedModel, language } = useSettings();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [artifacts, setArtifacts] = useState([]);
  const [showArtifacts, setShowArtifacts] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px';
    }
  }, [input]);

  const handleNewChat = () => {
    setMessages([]);
    setCurrentConvId(null);
    setArtifacts([]);
    setShowArtifacts(false);
    setAttachedFiles([]);
    setInput('');
  };

  const handleSelectConv = async (convId) => {
    if (!user) return;
    setCurrentConvId(convId);
    const msgs = await getMessages(user.uid, convId);
    setMessages(msgs.map(m => ({ role: m.role, content: m.content })));
    setArtifacts([]);
    setShowArtifacts(false);
  };

  const handleFileAttach = async (e) => {
    const files = Array.from(e.target.files);
    const processed = await Promise.all(files.map(async (file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      content: await readFileAsText(file)
    })));
    setAttachedFiles(prev => [...prev, ...processed]);
    e.target.value = '';
  };

  const handleSend = async (textOverride) => {
    const text = textOverride || input.trim();
    if (!text && attachedFiles.length === 0) return;
    if (loading) return;

    const userContent = text + (attachedFiles.length > 0
      ? `\n\n📎 Attached files: ${attachedFiles.map(f => f.name).join(', ')}`
      : '');

    const newMessages = [...messages, { role: 'user', content: userContent }];
    setMessages(newMessages);
    setInput('');
    setAttachedFiles([]);
    setLoading(true);

    const fileContent = attachedFiles.length > 0
      ? attachedFiles.map(f => `=== ${f.name} ===\n${f.content}`).join('\n\n')
      : null;

    try {
      const groqModel = getGroqModel(selectedModel);
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));

      const response = await sendMessage({
        messages: apiMessages,
        model: groqModel,
        language,
        useWebSearch,
        fileContent
      });

      const foundArtifacts = parseArtifacts(response);
      const cleanResponse = stripArtifacts(response);

      const assistantMsg = { role: 'assistant', content: cleanResponse };
      const updatedMessages = [...newMessages, assistantMsg];
      setMessages(updatedMessages);

      if (foundArtifacts.length > 0) {
        setArtifacts(foundArtifacts);
        setShowArtifacts(true);
      }

      // Save to Firestore
      if (user) {
        let convId = currentConvId;
        if (!convId) {
          const title = text.slice(0, 50) + (text.length > 50 ? '…' : '');
          convId = await createConversation(user.uid, title, selectedModel);
          setCurrentConvId(convId);
        }
        await addMessage(user.uid, convId, { role: 'user', content: userContent });
        await addMessage(user.uid, convId, { role: 'assistant', content: cleanResponse });
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Error: ${err.message}. Please check your API keys in Vercel environment variables.`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentModelData = getModelById(selectedModel);
  const isEmpty = messages.length === 0;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#080b1a', overflow: 'hidden' }}>
      {/* Stars background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse at 20% 50%, rgba(60,30,160,0.15) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 20%, rgba(0,80,160,0.12) 0%, transparent 50%),
          radial-gradient(ellipse at 60% 80%, rgba(100,20,180,0.1) 0%, transparent 50%)
        `
      }} />

      <Sidebar
        currentConvId={currentConvId}
        onNewChat={handleNewChat}
        onSelectConv={handleSelectConv}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, minWidth: 0 }}>

        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px', borderBottom: '1px solid rgba(100,100,200,0.1)',
          background: 'rgba(8,11,26,0.8)', backdropFilter: 'blur(10px)',
          flexShrink: 0
        }}>
          <ModelSelector />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user ? (
              <img src={user.photoURL} alt="" style={{
                width: 28, height: 28, borderRadius: '50%',
                border: '1px solid rgba(124,111,255,0.5)'
              }} />
            ) : null}
          </div>
        </div>

        {/* Messages + Artifact split */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0' }}>
            {isEmpty ? (
              <WelcomeScreen onStarterClick={(prompt) => handleSend(prompt)} model={currentModelData} />
            ) : (
              <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 20px' }}>
                {messages.map((msg, i) => (
                  <MessageBubble key={i} msg={msg} user={user} />
                ))}
                {loading && <TypingIndicator model={currentModelData} />}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Artifact panel */}
          {showArtifacts && artifacts.length > 0 && (
            <ArtifactPanel
              artifacts={artifacts}
              onClose={() => setShowArtifacts(false)}
            />
          )}
        </div>

        {/* Input area */}
        <div style={{
          padding: '16px 20px 20px', background: 'rgba(8,11,26,0.9)',
          backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(100,100,200,0.1)',
          flexShrink: 0
        }}>
          {/* Attached files */}
          {attachedFiles.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              {attachedFiles.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(124,111,255,0.15)', border: '1px solid rgba(124,111,255,0.3)',
                  borderRadius: 8, padding: '4px 10px', fontSize: 12, color: '#c0b0ff'
                }}>
                  <Paperclip size={11} />
                  <span>{f.name}</span>
                  <button onClick={() => setAttachedFiles(prev => prev.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0, display: 'flex' }}>
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ maxWidth: 780, margin: '0 auto' }}>
            {/* Prompt bar */}
            <div style={{
              display: 'flex', flexDirection: 'column',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(124,111,255,0.25)',
              borderRadius: 16, overflow: 'hidden',
              boxShadow: '0 0 0 1px rgba(124,111,255,0.1), 0 8px 32px rgba(0,0,0,0.3)',
              transition: 'border-color 0.2s'
            }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Cosmos-AI anything… (Shift+Enter for new line)"
                rows={1}
                style={{
                  width: '100%', background: 'transparent', border: 'none',
                  resize: 'none', outline: 'none', padding: '14px 16px',
                  color: '#e0e0ff', fontSize: 15, lineHeight: 1.5,
                  fontFamily: "'Space Grotesk', sans-serif",
                  caretColor: '#7c6fff', minHeight: 52
                }}
              />

              {/* Toolbar */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {/* File attach */}
                  <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileAttach} />
                  <ToolbarBtn
                    icon={<Paperclip size={15} />}
                    label="Attach"
                    onClick={() => fileInputRef.current?.click()}
                  />
                  {/* Web search */}
                  <ToolbarBtn
                    icon={<Globe size={15} />}
                    label="Web Search"
                    active={useWebSearch}
                    onClick={() => setUseWebSearch(v => !v)}
                    activeColor="#00d4ff"
                  />
                </div>

                <button
                  onClick={() => handleSend()}
                  disabled={loading || (!input.trim() && attachedFiles.length === 0)}
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: loading || (!input.trim() && attachedFiles.length === 0)
                      ? 'rgba(124,111,255,0.2)'
                      : 'linear-gradient(135deg, #7c6fff, #4a3fff)',
                    border: 'none', cursor: loading || (!input.trim() && attachedFiles.length === 0) ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: (!loading && (input.trim() || attachedFiles.length > 0))
                      ? '0 4px 16px rgba(124,111,255,0.4)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {loading ? <Loader2 size={16} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
                    : <Send size={15} color="#fff" />}
                </button>
              </div>
            </div>

            <p style={{
              textAlign: 'center', fontSize: 11, color: '#444', marginTop: 10, margin: '10px 0 0'
            }}>
              Cosmos-AI can make mistakes. Powered by{' '}
              <a href="https://sathishyogesh20-del.github.io/MY_PORTFOLIO/" target="_blank" rel="noopener noreferrer"
                style={{ color: '#7c6fff', textDecoration: 'none' }}>COSMOS</a>
            </p>
          </div>
        </div>
      </div>

      <SettingsPanel />
      <AdBanner />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(124,111,255,0.3); border-radius: 4px; }
      `}</style>
    </div>
  );
}

function ToolbarBtn({ icon, label, onClick, active, activeColor = '#7c6fff' }) {
  return (
    <button onClick={onClick} title={label} style={{
      display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
      background: active ? `${activeColor}20` : 'rgba(255,255,255,0.05)',
      border: active ? `1px solid ${activeColor}50` : '1px solid rgba(255,255,255,0.08)',
      borderRadius: 8, cursor: 'pointer',
      color: active ? activeColor : '#666', fontSize: 12,
      fontFamily: "'Space Grotesk', sans-serif", transition: 'all 0.2s'
    }}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function MessageBubble({ msg, user }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex', gap: 12, marginBottom: 24,
      flexDirection: isUser ? 'row-reverse' : 'row',
      animation: 'fadeUp 0.3s ease'
    }}>
      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isUser
          ? (user?.photoURL ? 'transparent' : 'linear-gradient(135deg, #7c6fff, #4a3fff)')
          : 'radial-gradient(circle, #1a0a4a, #0d0826)',
        border: isUser ? '1px solid rgba(124,111,255,0.4)' : '1px solid rgba(0,212,255,0.3)',
        overflow: 'hidden', boxShadow: isUser
          ? '0 0 12px rgba(124,111,255,0.3)'
          : '0 0 12px rgba(0,212,255,0.2)'
      }}>
        {isUser
          ? (user?.photoURL ? <img src={user.photoURL} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤')
          : '🌌'}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: '80%',
        background: isUser
          ? 'linear-gradient(135deg, rgba(124,111,255,0.2), rgba(74,63,255,0.15))'
          : 'rgba(255,255,255,0.04)',
        border: isUser
          ? '1px solid rgba(124,111,255,0.25)'
          : '1px solid rgba(255,255,255,0.08)',
        borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
        padding: '12px 16px',
        fontFamily: "'Space Grotesk', sans-serif"
      }}>
        <MessageRenderer content={msg.content} />
      </div>
    </div>
  );
}

function TypingIndicator({ model }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'flex-start', animation: 'fadeUp 0.3s ease' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(circle, #1a0a4a, #0d0826)',
        border: '1px solid rgba(0,212,255,0.3)',
        boxShadow: '0 0 12px rgba(0,212,255,0.2)'
      }}>🌌</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '4px 18px 18px 18px', padding: '14px 18px'
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: model?.color || '#7c6fff',
            animation: `bounce 1.2s ease infinite`,
            animationDelay: `${i * 0.2}s`
          }} />
        ))}
        <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)} }`}</style>
      </div>
    </div>
  );
}

function WelcomeScreen({ onStarterClick, model }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100%', padding: 32,
      fontFamily: "'Space Grotesk', sans-serif"
    }}>
      {/* Cosmos orb */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%', marginBottom: 20,
        background: 'radial-gradient(circle at 35% 35%, #a070ff 0%, #3a10c0 50%, #0a0530 100%)',
        boxShadow: '0 0 40px rgba(124,111,255,0.5), 0 0 80px rgba(60,30,160,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32
      }}>🌌</div>

      <h1 style={{
        fontSize: 28, fontWeight: 700, margin: '0 0 8px',
        background: 'linear-gradient(135deg, #e0d0ff, #7c6fff, #00d4ff)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>Cosmos-AI</h1>
      <p style={{ color: '#666', fontSize: 15, margin: '0 0 32px', textAlign: 'center' }}>
        Powered by {model?.name} · Expert in coding, research & creation
      </p>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10, maxWidth: 640, width: '100%'
      }}>
        {STARTERS.map((s, i) => (
          <button
            key={i}
            onClick={() => onStarterClick(s.prompt)}
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, padding: '14px 14px', cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.2s', fontFamily: "'Space Grotesk', sans-serif",
              color: '#a0a0c0'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(124,111,255,0.1)';
              e.currentTarget.style.borderColor = 'rgba(124,111,255,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 12, lineHeight: 1.4 }}>{s.text}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
