import { useState, useEffect, useRef } from 'react';
import {
  Send, Globe, Paperclip, X, Sparkles, Square,
  Copy, Check, RotateCcw, Volume2, VolumeX, ThumbsUp, ThumbsDown,
  Download, Edit3, PanelRightOpen, PanelRightClose, Menu,
  ArrowDown, Trash2, Cpu, Code2, BookOpen, Lightbulb
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { sendMessage, readFileAsText } from '../lib/groq';
import { getGroqModel, getModelById } from '../lib/models';
import { createConversation, addMessage, getMessages } from '../lib/firestore';
import MessageRenderer from '../components/MessageRenderer';
import ArtifactPanel, { parseArtifacts, stripArtifacts } from '../components/ArtifactPanel';
import ModelSelector from '../components/ModelSelector';
import Sidebar from '../components/Sidebar';
import SettingsPanel from '../components/SettingsPanel';
import AdBanner from '../components/AdBanner';

const STARTERS = [
  {
    category: 'Code & Web',
    icon: '💻',
    title: 'Interactive Landing Page',
    prompt: 'Build a modern interactive landing page in HTML/CSS with dark cosmic theme, animated stars, and feature cards.'
  },
  {
    category: 'Architecture',
    icon: '🚀',
    title: 'Python Web Scraper',
    prompt: 'Write a robust Python web scraper with BeautifulSoup, custom headers, and rate limiting.'
  },
  {
    category: 'Analysis',
    icon: '🔬',
    title: 'Physics of Black Holes',
    prompt: 'Explain how black holes form, Schwarzschild radius math, and the event horizon with a markdown summary table.'
  },
  {
    category: 'Writing',
    icon: '📝',
    title: 'Executive Technical Brief',
    prompt: 'Draft an executive architecture brief comparing event-driven microservices vs monoliths.'
  }
];

const QUICK_MODES = [
  { id: 'coding', label: 'Coding & Debug', icon: <Code2 size={13} />, model: 'cosmos-stellar' },
  { id: 'general', label: 'Balanced Q&A', icon: <Sparkles size={13} />, model: 'cosmos-nova' },
  { id: 'research', label: 'Deep Research', icon: <BookOpen size={13} />, model: 'cosmos-infinity' },
  { id: 'concise', label: 'Concise Bullet', icon: <Lightbulb size={13} />, model: 'cosmos-flash' }
];

export default function Chat() {
  const { user } = useAuth();
  const {
    selectedModel, updateModel, language, temperature,
    systemPersona, updateSystemPersona, streamingEnabled, hasLiveKey
  } = useSettings();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [convTitle, setConvTitle] = useState('New Chat');
  const [artifacts, setArtifacts] = useState([]);
  const [showArtifacts, setShowArtifacts] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const bottomRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Track responsive screen size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll when messages update, unless user scrolled up
  useEffect(() => {
    if (!showScrollBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Monitor scroll position to show "scroll to bottom" button
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isUp = scrollHeight - scrollTop - clientHeight > 140;
    setShowScrollBottom(isUp);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBottom(false);
  };

  // Auto-adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px';
    }
  }, [input]);

  // Clean speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleNewChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setCurrentConvId(null);
    setConvTitle('New Chat');
    setArtifacts([]);
    setShowArtifacts(false);
    setAttachedFiles([]);
    setInput('');
    setLoading(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleSelectConv = async (convId) => {
    if (!user) return;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setCurrentConvId(convId);
    setLoading(false);

    try {
      const msgs = await getMessages(user.uid, convId);
      const formatted = msgs.map(m => ({ role: m.role, content: m.content }));
      setMessages(formatted);

      const found = [];
      formatted.forEach(m => {
        if (m.role === 'assistant') {
          const arts = parseArtifacts(m.content);
          if (arts.length) found.push(...arts);
        }
      });
      setArtifacts(found);
      if (found.length > 0 && !isMobile) {
        setShowArtifacts(true);
      }
    } catch (e) {
      console.error('Failed to load messages:', e);
    }
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

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleSend = async (textOverride = null) => {
    const textToSend = textOverride !== null ? textOverride : input.trim();
    if (!textToSend && attachedFiles.length === 0) return;
    if (loading) return;

    const userContent = textToSend + (attachedFiles.length > 0
      ? `\n\n📎 Attached files: ${attachedFiles.map(f => f.name).join(', ')}`
      : '');

    const fileContent = attachedFiles.length > 0
      ? attachedFiles.map(f => `=== ${f.name} ===\n${f.content}`).join('\n\n')
      : null;

    const updatedMessages = [...messages, { role: 'user', content: userContent }];
    setMessages(updatedMessages);

    setInput('');
    setAttachedFiles([]);
    setLoading(true);

    const assistantIndex = updatedMessages.length;
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const groqModel = getGroqModel(selectedModel);

    try {
      let finalContent = '';

      if (streamingEnabled) {
        finalContent = await sendMessage({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          model: groqModel,
          language,
          useWebSearch,
          fileContent,
          temperature,
          systemPersona,
          signal: abortController.signal,
          onChunk: (chunk) => {
            finalContent = chunk;
            setMessages(prev => {
              const copy = [...prev];
              if (copy[assistantIndex]) {
                copy[assistantIndex] = { role: 'assistant', content: chunk };
              }
              return copy;
            });
          }
        });
      } else {
        finalContent = await sendMessage({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          model: groqModel,
          language,
          useWebSearch,
          fileContent,
          temperature,
          systemPersona,
          signal: abortController.signal
        });
        setMessages(prev => {
          const copy = [...prev];
          if (copy[assistantIndex]) {
            copy[assistantIndex] = { role: 'assistant', content: finalContent };
          }
          return copy;
        });
      }

      // Parse artifacts
      const foundArtifacts = parseArtifacts(finalContent);
      if (foundArtifacts.length > 0) {
        setArtifacts(prev => [...prev, ...foundArtifacts]);
        if (!isMobile) {
          setShowArtifacts(true);
        }
      }

      // Release loading instantly so input is never blocked
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);

      // Background persistence
      if (user) {
        const cleanContent = stripArtifacts(finalContent) || finalContent;
        (async () => {
          try {
            let convId = currentConvId;
            if (!convId) {
              const title = textToSend.slice(0, 42) + (textToSend.length > 42 ? '…' : '');
              convId = await createConversation(user.uid, title, selectedModel);
              setCurrentConvId(convId);
              setConvTitle(title);
            }
            await addMessage(user.uid, convId, { role: 'user', content: userContent });
            await addMessage(user.uid, convId, { role: 'assistant', content: cleanContent });
          } catch (err) {
            console.warn('[Cosmos-AI] Local storage persistence active:', err);
          }
        })();
      }

    } catch (err) {
      if (!abortController.signal.aborted) {
        setMessages(prev => {
          const copy = [...prev];
          if (copy[assistantIndex]) {
            copy[assistantIndex] = {
              role: 'assistant',
              content: `⚠️ ${err.message || 'Unable to generate response. You can check your API key in Settings.'}`
            };
          }
          return copy;
        });
      }
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRegenerate = async (targetIndex) => {
    if (loading) return;
    const historyBefore = messages.slice(0, targetIndex);
    const lastUser = historyBefore[historyBefore.length - 1];
    if (!lastUser || lastUser.role !== 'user') return;

    setMessages(historyBefore);
    handleSend(lastUser.content);
  };

  const handleSpeak = (text, idx) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingIndex === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/```[\s\S]*?```/g, 'code snippet omitted').replace(/<[^>]*>/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);
    setSpeakingIndex(idx);
    window.speechSynthesis.speak(utterance);
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;
    const text = messages.map(m => `### ${m.role === 'user' ? 'User' : 'Cosmos-AI'}\n\n${m.content}\n`).join('\n---\n\n');
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cosmos-chat-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenArtifactSnippet = (art) => {
    setArtifacts(prev => [art, ...prev.filter(a => a.filename !== art.filename)]);
    setShowArtifacts(true);
  };

  const currentModelData = getModelById(selectedModel);
  const isEmpty = messages.length === 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      height: '100dvh',
      width: '100vw',
      maxWidth: '100vw',
      background: '#0e0f14',
      overflow: 'hidden',
      fontFamily: "'Space Grotesk', sans-serif"
    }}>
      {/* Sidebar with Desktop & Mobile Overlay support */}
      <Sidebar
        currentConvId={currentConvId}
        onNewChat={handleNewChat}
        onSelectConv={handleSelectConv}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        isMobile={isMobile}
      />

      {/* Main Chat Viewport */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        height: '100%',
        height: '100dvh',
        position: 'relative',
        overflow: 'hidden'
      }}>

        {/* Top Header */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '8px 12px' : '10px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
          background: 'rgba(14, 15, 20, 0.92)',
          backdropFilter: 'blur(12px)',
          flexShrink: 0,
          zIndex: 30,
          gap: 8
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            {isMobile && (
              <button
                onClick={() => setMobileSidebarOpen(true)}
                title="Open menu"
                style={iconActionBtnStyle}
              >
                <Menu size={18} />
              </button>
            )}

            <ModelSelector />

            {!isEmpty && !isMobile && (
              <span style={{
                fontSize: 13,
                color: '#9ca3af',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 220
              }}>
                {convTitle}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {artifacts.length > 0 && (
              <button
                onClick={() => setShowArtifacts(s => !s)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '6px 10px',
                  borderRadius: 8,
                  background: showArtifacts ? 'rgba(129, 140, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: showArtifacts ? '1px solid rgba(129, 140, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: showArtifacts ? '#c7d2fe' : '#9ca3af',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {showArtifacts ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
                <span>Artifacts{artifacts.length > 1 ? ` (${artifacts.length})` : ''}</span>
              </button>
            )}

            {!isEmpty && (
              <>
                <button
                  onClick={handleExportChat}
                  title="Export conversation (.md)"
                  style={iconActionBtnStyle}
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={handleNewChat}
                  title="Clear chat"
                  style={iconActionBtnStyle}
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        </header>

        {/* Message Viewport & Artifact Split Panel */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

          {/* Chat Stream View */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {isEmpty ? (
              /* Responsive Claude.ai Welcome Screen */
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isMobile ? '20px 16px' : '32px 20px',
                maxWidth: 760,
                margin: '0 auto',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                {/* Greeting icon */}
                <div style={{
                  width: isMobile ? 48 : 56,
                  height: isMobile ? 48 : 56,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 0 35px rgba(99, 102, 241, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? 22 : 26,
                  marginBottom: 14
                }}>
                  🌌
                </div>

                <h1 style={{
                  fontSize: isMobile ? 22 : 28,
                  fontWeight: 700,
                  margin: '0 0 6px',
                  color: '#f3f4f6',
                  textAlign: 'center',
                  letterSpacing: -0.5
                }}>
                  {greeting}, {user?.displayName?.split(' ')[0] || 'Explorer'}
                </h1>
                <p style={{
                  color: '#9ca3af',
                  fontSize: isMobile ? 13 : 14,
                  margin: '0 0 24px',
                  textAlign: 'center',
                  padding: '0 8px'
                }}>
                  What would you like to build or explore today with {currentModelData?.name}?
                </p>

                {/* Quick Mode Switcher Chips */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 24,
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  {QUICK_MODES.map(mode => {
                    const isActive = systemPersona === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => {
                          updateSystemPersona(mode.id);
                          updateModel(mode.model);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          borderRadius: 20,
                          cursor: 'pointer',
                          background: isActive ? 'rgba(129, 140, 248, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                          border: isActive ? '1px solid rgba(129, 140, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.07)',
                          color: isActive ? '#c7d2fe' : '#9ca3af',
                          fontSize: 12,
                          fontWeight: isActive ? 600 : 400,
                          transition: 'all 0.15s',
                          fontFamily: "'Space Grotesk', sans-serif"
                        }}
                      >
                        {mode.icon}
                        <span>{mode.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Responsive Starters Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                  gap: 10,
                  width: '100%',
                  marginBottom: 16
                }}>
                  {STARTERS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s.prompt)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        borderRadius: 12,
                        padding: '12px 14px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s',
                        fontFamily: "'Space Grotesk', sans-serif"
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(129, 140, 248, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.3)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 15 }}>{s.icon}</span>
                        <span style={{ fontSize: 11, color: '#818cf8', fontWeight: 600 }}>{s.category}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb', marginBottom: 2 }}>
                        {s.title}
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.4 }}>
                        {s.prompt.slice(0, 60)}...
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Messages Container */
              <div style={{
                maxWidth: 780,
                width: '100%',
                margin: '0 auto',
                padding: isMobile ? '16px 12px' : '24px 20px',
                flex: 1,
                boxSizing: 'border-box'
              }}>
                {messages.map((msg, i) => (
                  <MessageTurn
                    key={i}
                    msg={msg}
                    index={i}
                    user={user}
                    model={currentModelData}
                    isMobile={isMobile}
                    onRegenerate={() => handleRegenerate(i)}
                    onSpeak={() => handleSpeak(msg.content, i)}
                    isSpeaking={speakingIndex === i}
                    onOpenArtifact={handleOpenArtifactSnippet}
                    onEditPrompt={(newPrompt) => {
                      const trimmed = messages.slice(0, i);
                      setMessages(trimmed);
                      handleSend(newPrompt);
                    }}
                  />
                ))}

                {loading && (
                  <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      flexShrink: 0
                    }}>
                      🌌
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: '4px 14px 14px 14px',
                      padding: '10px 16px'
                    }}>
                      {[0, 1, 2].map(dot => (
                        <div
                          key={dot}
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: '#818cf8',
                            animation: 'bounceDot 1.2s ease infinite',
                            animationDelay: `${dot * 0.2}s`
                          }}
                        />
                      ))}
                      <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 6 }}>
                        Synthesizing...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} style={{ height: 16 }} />
              </div>
            )}
          </div>

          {/* Floating Scroll to Bottom Button */}
          {showScrollBottom && (
            <button
              onClick={scrollToBottom}
              title="Scroll to bottom"
              style={{
                position: 'absolute',
                bottom: 84,
                right: 20,
                zIndex: 35,
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#1f212d',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.45)',
                transition: 'all 0.15s'
              }}
            >
              <ArrowDown size={16} />
            </button>
          )}

          {/* Interactive Artifacts Panel */}
          {showArtifacts && artifacts.length > 0 && (
            <ArtifactPanel
              artifacts={artifacts}
              onClose={() => setShowArtifacts(false)}
            />
          )}
        </div>

        {/* Responsive Claude-style Floating Prompt Box */}
        <div style={{
          padding: isMobile ? '8px 12px 14px' : '12px 20px 20px',
          background: 'rgba(14, 15, 20, 0.96)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.07)',
          flexShrink: 0,
          zIndex: 25
        }}>
          <div style={{ maxWidth: 780, margin: '0 auto', width: '100%' }}>

            {/* Attached file chips */}
            {attachedFiles.length > 0 && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                {attachedFiles.map((f, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(129, 140, 248, 0.12)',
                    border: '1px solid rgba(129, 140, 248, 0.25)',
                    borderRadius: 8,
                    padding: '3px 8px',
                    fontSize: 11.5,
                    color: '#c7d2fe'
                  }}>
                    <Paperclip size={11} />
                    <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.name}
                    </span>
                    <button
                      onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Prompt Container */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              background: '#16171e',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
              transition: 'border-color 0.15s, box-shadow 0.15s'
            }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={loading ? "Synthesizing response..." : "Ask Cosmos anything... (Shift + Enter for new line)"}
                rows={1}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  resize: 'none',
                  outline: 'none',
                  padding: isMobile ? '12px 14px' : '14px 16px',
                  color: '#f3f4f6',
                  fontSize: isMobile ? 14 : 14.5,
                  lineHeight: 1.5,
                  fontFamily: "'Space Grotesk', sans-serif",
                  caretColor: '#818cf8',
                  minHeight: isMobile ? 44 : 50,
                  boxSizing: 'border-box'
                }}
              />

              {/* Action Toolbar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                background: 'rgba(255, 255, 255, 0.01)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileAttach}
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach file"
                    style={toolbarBtnStyle(false)}
                  >
                    <Paperclip size={13} />
                    <span>Attach</span>
                  </button>

                  <button
                    onClick={() => setUseWebSearch(w => !w)}
                    title="Enable web search grounding"
                    style={toolbarBtnStyle(useWebSearch, '#38bdf8')}
                  >
                    <Globe size={13} />
                    <span>Web Search</span>
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {loading ? (
                    <button
                      onClick={handleStopGenerating}
                      title="Stop generating"
                      style={{
                        height: 32,
                        padding: '0 10px',
                        borderRadius: 8,
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#fca5a5',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: "'Space Grotesk', sans-serif"
                      }}
                    >
                      <Square size={11} fill="#fca5a5" />
                      <span>Stop</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() && attachedFiles.length === 0}
                      title="Send prompt"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 9,
                        background: (!input.trim() && attachedFiles.length === 0)
                          ? 'rgba(255, 255, 255, 0.06)'
                          : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                        border: 'none',
                        cursor: (!input.trim() && attachedFiles.length === 0) ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        boxShadow: (input.trim() || attachedFiles.length > 0)
                          ? '0 4px 14px rgba(99, 102, 241, 0.4)' : 'none',
                        transition: 'all 0.15s'
                      }}
                    >
                      <Send size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Model & Status tag */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 8,
              fontSize: 11,
              color: '#6b7280'
            }}>
              <span>Cosmos-AI can make mistakes.</span>
              <span>·</span>
              <span style={{ color: hasLiveKey ? '#34d399' : '#a1a1aa' }}>
                {hasLiveKey ? '● Live Engine' : '○ Local Mode'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <SettingsPanel />
      <AdBanner />

      <style>{`
        @keyframes bounceDot {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.12); border-radius: 4px; }
      `}</style>
    </div>
  );
}

function MessageTurn({ msg, index, user, model, isMobile, onRegenerate, onSpeak, isSpeaking, onOpenArtifact, onEditPrompt }) {
  const isUser = msg.role === 'user';
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(msg.content);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (editedText.trim()) {
      setIsEditing(false);
      onEditPrompt(editedText.trim());
    }
  };

  const wordCount = msg.content ? msg.content.trim().split(/\s+/).length : 0;

  return (
    <div style={{
      display: 'flex',
      gap: isMobile ? 8 : 12,
      marginBottom: 24,
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-start'
    }}>
      {/* Avatar */}
      <div style={{
        width: 30,
        height: 30,
        borderRadius: 9,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isUser
          ? 'linear-gradient(135deg, #4f46e5, #4338ca)'
          : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: '#fff',
        fontSize: 13,
        fontWeight: 600,
        boxShadow: isUser
          ? '0 2px 10px rgba(79, 70, 229, 0.3)'
          : '0 2px 10px rgba(99, 102, 241, 0.3)'
      }}>
        {isUser ? (user?.displayName?.[0]?.toUpperCase() || '👤') : '🌌'}
      </div>

      {/* Bubble Container */}
      <div style={{
        maxWidth: isUser ? (isMobile ? '86%' : '76%') : (isMobile ? '92%' : '88%'),
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        minWidth: 0
      }}>
        {/* Name / Model Tag */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 4,
          fontSize: 12,
          color: '#9ca3af'
        }}>
          <span style={{ fontWeight: 600, color: isUser ? '#c7d2fe' : '#e0e7ff' }}>
            {isUser ? (user?.displayName || 'You') : (model?.name || 'Cosmos-AI')}
          </span>
          {!isUser && (
            <span style={{
              fontSize: 10,
              padding: '1px 5px',
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#818cf8'
            }}>
              {model?.badge || 'AI'}
            </span>
          )}
        </div>

        {/* Content Box */}
        {isEditing ? (
          <div style={{
            width: '100%',
            background: '#16171e',
            border: '1px solid #818cf8',
            borderRadius: 12,
            padding: 10
          }}>
            <textarea
              value={editedText}
              onChange={e => setEditedText(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: 13.5,
                fontFamily: "'Space Grotesk', sans-serif",
                resize: 'none'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 8 }}>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#9ca3af',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: 12,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                style={{
                  background: '#6366f1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Save & Submit
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            width: '100%',
            background: isUser
              ? 'rgba(99, 102, 241, 0.12)'
              : 'rgba(255, 255, 255, 0.02)',
            border: isUser
              ? '1px solid rgba(129, 140, 248, 0.25)'
              : '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
            padding: isMobile ? '10px 13px' : '12px 16px',
            color: '#f3f4f6',
            boxSizing: 'border-box',
            overflowX: 'auto'
          }}>
            <MessageRenderer
              content={msg.content}
              onOpenArtifact={onOpenArtifact}
            />
          </div>
        )}

        {/* Action Controls for Turn */}
        {!isEditing && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginTop: 5,
            opacity: 0.75,
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleCopy}
              title="Copy message"
              style={messageActionBtnStyle}
            >
              {copied ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
            </button>

            {isUser && (
              <button
                onClick={() => {
                  setEditedText(msg.content);
                  setIsEditing(true);
                }}
                title="Edit prompt"
                style={messageActionBtnStyle}
              >
                <Edit3 size={12} />
              </button>
            )}

            {!isUser && (
              <>
                <button
                  onClick={onRegenerate}
                  title="Regenerate response"
                  style={messageActionBtnStyle}
                >
                  <RotateCcw size={12} />
                </button>

                <button
                  onClick={onSpeak}
                  title={isSpeaking ? "Stop reading" : "Read aloud"}
                  style={{ ...messageActionBtnStyle, color: isSpeaking ? '#818cf8' : undefined }}
                >
                  {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                </button>

                <button
                  onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                  title="Helpful response"
                  style={{ ...messageActionBtnStyle, color: feedback === 'up' ? '#34d399' : undefined }}
                >
                  <ThumbsUp size={12} />
                </button>

                <button
                  onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                  title="Unhelpful response"
                  style={{ ...messageActionBtnStyle, color: feedback === 'down' ? '#ef4444' : undefined }}
                >
                  <ThumbsDown size={12} />
                </button>

                <span style={{ fontSize: 10, color: '#6b7280', marginLeft: 4 }}>
                  {wordCount} words
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const toolbarBtnStyle = (active, activeColor = '#818cf8') => ({
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  padding: '5px 9px',
  background: active ? `${activeColor}20` : 'rgba(255, 255, 255, 0.04)',
  border: active ? `1px solid ${activeColor}50` : '1px solid rgba(255, 255, 255, 0.07)',
  borderRadius: 8,
  cursor: 'pointer',
  color: active ? activeColor : '#9ca3af',
  fontSize: 12,
  fontFamily: "'Space Grotesk', sans-serif",
  transition: 'all 0.15s'
});

const iconActionBtnStyle = {
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  cursor: 'pointer',
  color: '#9ca3af',
  padding: '6px 8px',
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.15s'
};

const messageActionBtnStyle = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: '#9ca3af',
  padding: '4px 6px',
  borderRadius: 6,
  display: 'flex',
  alignItems: 'center',
  transition: 'all 0.15s'
};
