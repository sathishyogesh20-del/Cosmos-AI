import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Trash2, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { getConversations, deleteConversation } from '../lib/firestore';

export default function Sidebar({ currentConvId, onNewChat, onSelectConv, collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const { setSettingsOpen } = useSettings();
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user, currentConvId]);

  const loadConversations = async () => {
    try {
      const convs = await getConversations(user.uid);
      setConversations(convs);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (e, convId) => {
    e.stopPropagation();
    await deleteConversation(user.uid, convId);
    loadConversations();
    if (convId === currentConvId) onNewChat();
  };

  return (
    <div style={{
      width: collapsed ? 60 : 260,
      height: '100vh', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, #080b1a 0%, #0a0d20 100%)',
      borderRight: '1px solid rgba(100,100,200,0.15)',
      transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
      overflow: 'hidden', flexShrink: 0,
      fontFamily: "'Space Grotesk', sans-serif"
    }}>
      {/* Logo + Toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? '16px 0' : '16px 16px',
        borderBottom: '1px solid rgba(100,100,200,0.1)'
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'radial-gradient(circle, #7c6fff 0%, #3a1fa8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, boxShadow: '0 0 12px rgba(124,111,255,0.5)'
            }}>🌌</div>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#e0e0ff', letterSpacing: 0.5 }}>
              Cosmos<span style={{ color: '#7c6fff' }}>-AI</span>
            </span>
          </div>
        )}
        <button onClick={() => setCollapsed(c => !c)} style={{
          background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer',
          color: '#777', borderRadius: 8, padding: 6, display: 'flex', alignItems: 'center'
        }}>
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* New Chat */}
      <div style={{ padding: collapsed ? '12px 8px' : '12px 10px' }}>
        <button onClick={onNewChat} style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 8, padding: collapsed ? '10px' : '10px 12px',
          background: 'rgba(124,111,255,0.15)', border: '1px solid rgba(124,111,255,0.3)',
          borderRadius: 10, cursor: 'pointer', color: '#c0b0ff',
          fontSize: 13, fontWeight: 500, transition: 'all 0.2s',
          fontFamily: "'Space Grotesk', sans-serif"
        }}>
          <Plus size={15} />
          {!collapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Conversations */}
      {!collapsed && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }}>
          {conversations.length === 0 && (
            <div style={{ textAlign: 'center', color: '#444', fontSize: 12, padding: '20px 0' }}>
              No conversations yet
            </div>
          )}
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => onSelectConv(conv.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 10px', borderRadius: 8, cursor: 'pointer',
                background: currentConvId === conv.id ? 'rgba(124,111,255,0.15)' : 'transparent',
                border: currentConvId === conv.id ? '1px solid rgba(124,111,255,0.2)' : '1px solid transparent',
                color: currentConvId === conv.id ? '#c0b0ff' : '#7a7a9a',
                fontSize: 13, textAlign: 'left', marginBottom: 2,
                transition: 'all 0.15s', fontFamily: "'Space Grotesk', sans-serif"
              }}
            >
              <MessageSquare size={13} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {conv.title || 'New conversation'}
              </span>
              <button onClick={e => handleDelete(e, conv.id)} style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: '#555', padding: 2, display: 'flex', opacity: 0,
                transition: 'opacity 0.2s'
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
              >
                <Trash2 size={11} />
              </button>
            </button>
          ))}
        </div>
      )}

      {/* Bottom actions */}
      <div style={{
        padding: collapsed ? '12px 8px' : '12px 10px',
        borderTop: '1px solid rgba(100,100,200,0.1)',
        display: 'flex', flexDirection: 'column', gap: 4
      }}>
        <button onClick={() => setSettingsOpen(true)} style={bottomBtnStyle(collapsed)}>
          <Settings size={14} />
          {!collapsed && <span>Settings</span>}
        </button>
        {user && (
          <button onClick={logout} style={bottomBtnStyle(collapsed)}>
            <LogOut size={14} />
            {!collapsed && <span>Sign out</span>}
          </button>
        )}
        {!collapsed && user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
            marginTop: 4
          }}>
            <img src={user.photoURL} alt="" style={{
              width: 26, height: 26, borderRadius: '50%',
              border: '1px solid rgba(124,111,255,0.4)'
            }} />
            <span style={{ fontSize: 12, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.displayName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const bottomBtnStyle = (collapsed) => ({
  display: 'flex', alignItems: 'center',
  justifyContent: collapsed ? 'center' : 'flex-start',
  gap: 8, padding: collapsed ? '8px' : '8px 10px',
  background: 'transparent', border: 'none', cursor: 'pointer',
  color: '#666', fontSize: 13, borderRadius: 8, width: '100%',
  transition: 'all 0.15s', fontFamily: "'Space Grotesk', sans-serif"
});
