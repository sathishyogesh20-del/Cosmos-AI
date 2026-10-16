import { useState, useEffect } from 'react';
import {
  Plus, MessageSquare, Trash2, Settings, LogOut,
  ChevronLeft, ChevronRight, Search, Edit2, Check, X, Sparkles,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { getConversations, deleteConversation, updateConversationTitle } from '../lib/firestore';

export default function Sidebar({
  currentConvId,
  onNewChat,
  onSelectConv,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  isMobile
}) {
  const { user, logout } = useAuth();
  const { setSettingsOpen, hasLiveKey } = useSettings();
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user, currentConvId]);

  const loadConversations = async () => {
    try {
      const convs = await getConversations(user.uid);
      setConversations(convs || []);
    } catch (e) {
      console.error('Error loading conversations:', e);
    }
  };

  const handleDelete = async (e, convId) => {
    e.stopPropagation();
    await deleteConversation(user.uid, convId);
    await loadConversations();
    if (convId === currentConvId) {
      onNewChat();
    }
  };

  const handleStartRename = (e, conv) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title || 'Untitled');
  };

  const handleSaveRename = async (e, convId) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      await updateConversationTitle(user.uid, convId, editTitle.trim());
      await loadConversations();
    }
    setEditingId(null);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleSelectAndClose = (convId) => {
    onSelectConv(convId);
    if (isMobile && setMobileOpen) {
      setMobileOpen(false);
    }
  };

  const handleNewChatAndClose = () => {
    onNewChat();
    if (isMobile && setMobileOpen) {
      setMobileOpen(false);
    }
  };

  const filteredConvs = conversations.filter(c => {
    if (!searchQuery) return true;
    return (c.title || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Base styling for desktop vs mobile drawer
  const sidebarWidth = isMobile ? 290 : (collapsed ? 64 : 268);
  const isVisible = !isMobile || mobileOpen;

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 90,
            animation: 'fadeInOverlay 0.2s ease'
          }}
        />
      )}

      <div style={{
        position: isMobile ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: isMobile ? 100 : 40,
        width: sidebarWidth,
        height: '100%',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0e0f14',
        borderRight: '1px solid rgba(255, 255, 255, 0.07)',
        boxShadow: isMobile ? '10px 0 40px rgba(0, 0, 0, 0.7)' : 'none',
        transform: isMobile
          ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)')
          : 'none',
        transition: 'transform 0.25s cubic-bezier(0.33, 1, 0.68, 1), width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        flexShrink: 0,
        fontFamily: "'Space Grotesk', sans-serif"
      }}>
        {/* Brand & Toggle header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: (!isMobile && collapsed) ? 'center' : 'space-between',
          padding: (!isMobile && collapsed) ? '16px 0' : '16px 14px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          {(isMobile || !collapsed) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)'
              }}>
                <span style={{ fontSize: 15 }}>🌌</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#f3f4f6', letterSpacing: -0.2 }}>
                  Cosmos<span style={{ color: '#818cf8' }}>.ai</span>
                </span>
                <span style={{ fontSize: 10, color: hasLiveKey ? '#34d399' : '#a1a1aa' }}>
                  {hasLiveKey ? '● Live Engine' : '○ Local Mode'}
                </span>
              </div>
            </div>
          )}

          {isMobile ? (
            <button
              onClick={() => setMobileOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                cursor: 'pointer',
                color: '#9ca3af',
                borderRadius: 8,
                padding: 6,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={18} />
            </button>
          ) : (
            <button
              onClick={() => setCollapsed(c => !c)}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                cursor: 'pointer',
                color: '#9ca3af',
                borderRadius: 8,
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.15s'
              }}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          )}
        </div>

        {/* New Chat action */}
        <div style={{ padding: (!isMobile && collapsed) ? '12px 8px' : '12px 12px 8px' }}>
          <button
            onClick={handleNewChatAndClose}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: (!isMobile && collapsed) ? 'center' : 'flex-start',
              gap: 10,
              padding: (!isMobile && collapsed) ? '10px' : '11px 14px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.16), rgba(139, 92, 246, 0.12))',
              border: '1px solid rgba(129, 140, 248, 0.28)',
              borderRadius: 10,
              cursor: 'pointer',
              color: '#c7d2fe',
              fontSize: 13,
              fontWeight: 600,
              transition: 'all 0.15s',
              fontFamily: "'Space Grotesk', sans-serif"
            }}
          >
            <Plus size={16} />
            {(isMobile || !collapsed) && <span>New Chat</span>}
          </button>
        </div>

        {/* Search Input (when expanded or on mobile) */}
        {(isMobile || !collapsed) && (
          <div style={{ padding: '4px 12px 10px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: 8,
              padding: '7px 10px'
            }}>
              <Search size={13} color="#6b7280" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#e5e7eb',
                  fontSize: 12.5,
                  fontFamily: "'Space Grotesk', sans-serif"
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 0 }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Conversations list */}
        {(isMobile || !collapsed) ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              color: '#6b7280',
              padding: '8px 8px 4px'
            }}>
              Recent Conversations
            </div>

            {filteredConvs.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 12, padding: '28px 8px' }}>
                {searchQuery ? 'No matching chats found' : 'No conversations yet'}
              </div>
            ) : (
              filteredConvs.map(conv => {
                const isSelected = currentConvId === conv.id;
                const isEditing = editingId === conv.id;

                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectAndClose(conv.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '9px 10px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(129, 140, 248, 0.14)' : 'transparent',
                      border: isSelected ? '1px solid rgba(129, 140, 248, 0.28)' : '1px solid transparent',
                      color: isSelected ? '#e0e7ff' : '#9ca3af',
                      fontSize: 13,
                      marginBottom: 3,
                      transition: 'all 0.12s'
                    }}
                  >
                    <MessageSquare size={14} style={{ flexShrink: 0, color: isSelected ? '#818cf8' : '#6b7280' }} />

                    {isEditing ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }} onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveRename(e, conv.id);
                            if (e.key === 'Escape') handleCancelRename(e);
                          }}
                          autoFocus
                          style={{
                            flex: 1,
                            background: '#1a1b23',
                            border: '1px solid #818cf8',
                            borderRadius: 4,
                            color: '#fff',
                            fontSize: 12,
                            padding: '3px 6px',
                            outline: 'none'
                          }}
                        />
                        <button onClick={e => handleSaveRename(e, conv.id)} style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer', padding: 2 }}>
                          <Check size={12} />
                        </button>
                        <button onClick={handleCancelRename} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }}>
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span style={{
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontWeight: isSelected ? 600 : 400
                        }}>
                          {conv.title || 'New conversation'}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                          <button
                            onClick={e => handleStartRename(e, conv)}
                            title="Rename chat"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#6b7280',
                              padding: 4,
                              display: 'flex',
                              opacity: isSelected || isMobile ? 0.9 : 0.4
                            }}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={e => handleDelete(e, conv.id)}
                            title="Delete chat"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#6b7280',
                              padding: 4,
                              display: 'flex',
                              opacity: isSelected || isMobile ? 0.9 : 0.4
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div style={{ flex: 1 }} />
        )}

        {/* User & Settings footer */}
        <div style={{
          padding: (!isMobile && collapsed) ? '12px 8px' : '12px 10px',
          borderTop: '1px solid rgba(255, 255, 255, 0.07)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          background: 'rgba(255, 255, 255, 0.01)'
        }}>
          <button
            onClick={() => {
              setSettingsOpen(true);
              if (isMobile && setMobileOpen) setMobileOpen(false);
            }}
            style={bottomBtnStyle(!isMobile && collapsed)}
            title="Settings & API Keys"
          >
            <Settings size={15} />
            {(isMobile || !collapsed) && <span>Settings</span>}
          </button>

          {user && (
            <button
              onClick={() => {
                logout();
                if (isMobile && setMobileOpen) setMobileOpen(false);
              }}
              style={bottomBtnStyle(!isMobile && collapsed)}
              title="Sign out"
            >
              <LogOut size={15} />
              {(isMobile || !collapsed) && <span>Sign out</span>}
            </button>
          )}

          {(isMobile || !collapsed) && user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              marginTop: 4,
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 8
            }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                flexShrink: 0
              }}>
                {user.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#e5e7eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.displayName || 'Cosmos Explorer'}
                </span>
                <span style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email || 'explorer@cosmos.ai'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}

const bottomBtnStyle = (collapsed) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: collapsed ? 'center' : 'flex-start',
  gap: 10,
  padding: collapsed ? '8px' : '9px 12px',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: '#9ca3af',
  fontSize: 13,
  borderRadius: 8,
  width: '100%',
  transition: 'all 0.15s',
  fontFamily: "'Space Grotesk', sans-serif"
});
