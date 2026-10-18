import {
  collection, addDoc, getDocs, doc, updateDoc,
  deleteDoc, query, orderBy, serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

const LOCAL_STORAGE_CONVS_PREFIX = 'cosmos_convs_';
const LOCAL_STORAGE_MSGS_PREFIX = 'cosmos_msgs_';
const GOOGLE_BACKUP_PREFIX = 'cosmos_google_history_';

// Notify UI components (Sidebar, etc.) that conversations have changed
function notifyConversationsChanged(userId, convId = null) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cosmos:conversations-changed', {
      detail: { userId, convId, timestamp: Date.now() }
    }));
  }
}

function getLocalConvs(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CONVS_PREFIX + userId);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed to parse convs:', e);
    return [];
  }
}

function setLocalConvs(userId, convs) {
  if (!userId) return;
  try {
    localStorage.setItem(LOCAL_STORAGE_CONVS_PREFIX + userId, JSON.stringify(convs));
    // Also backup to Google account history if user is a Google account
    if (userId.startsWith('google_')) {
      backupGoogleAccountHistory(userId, convs);
    }
  } catch (e) {
    console.warn('Failed to save convs locally:', e);
  }
}

function backupGoogleAccountHistory(userId, convs) {
  try {
    const backupKey = GOOGLE_BACKUP_PREFIX + userId;
    localStorage.setItem(backupKey, JSON.stringify({
      userId,
      savedAt: Date.now(),
      conversations: convs
    }));
  } catch (err) {
    console.warn('Google account history backup warning:', err);
  }
}

function getLocalMsgs(userId, convId) {
  if (!userId || !convId) return [];
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_MSGS_PREFIX}${userId}_${convId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalMsgs(userId, convId, msgs) {
  if (!userId || !convId) return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_MSGS_PREFIX}${userId}_${convId}`, JSON.stringify(msgs));
  } catch (e) {
    console.warn('Failed to save msgs locally:', e);
  }
}

export async function createConversation(userId, title, model) {
  const safeTitle = (title || 'New Chat').trim();
  const safeModel = model || 'cosmos-nova';

  if (isFirebaseConfigured && db) {
    try {
      const ref = await addDoc(collection(db, 'users', userId, 'conversations'), {
        title: safeTitle,
        model: safeModel,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      const id = ref.id;
      // Also cache locally for instant offline/fast retrieval
      const convs = getLocalConvs(userId);
      const newConv = {
        id,
        title: safeTitle,
        model: safeModel,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setLocalConvs(userId, [newConv, ...convs.filter(c => c.id !== id)]);
      notifyConversationsChanged(userId, id);
      return id;
    } catch (err) {
      console.warn('Firestore createConversation failed, using persistent local storage:', err);
    }
  }

  const id = 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const convs = getLocalConvs(userId);
  const newConv = {
    id,
    title: safeTitle,
    model: safeModel,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  setLocalConvs(userId, [newConv, ...convs]);
  notifyConversationsChanged(userId, id);
  return id;
}

export async function getConversations(userId) {
  if (!userId) return [];

  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'users', userId, 'conversations'),
        orderBy('updatedAt', 'desc')
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const cloudConvs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sync to local
        setLocalConvs(userId, cloudConvs);
        return cloudConvs;
      }
    } catch (err) {
      console.warn('Firestore getConversations failed, reading from local storage:', err);
    }
  }

  // Load from local storage
  let convs = getLocalConvs(userId);

  // If empty and it's a Google user, attempt restore from Google backup key
  if (convs.length === 0 && userId.startsWith('google_')) {
    try {
      const backupRaw = localStorage.getItem(GOOGLE_BACKUP_PREFIX + userId);
      if (backupRaw) {
        const backup = JSON.parse(backupRaw);
        if (backup && Array.isArray(backup.conversations)) {
          convs = backup.conversations;
          setLocalConvs(userId, convs);
        }
      }
    } catch (e) {
      console.warn('Failed to restore from backup:', e);
    }
  }

  return convs.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export async function getMessages(userId, conversationId) {
  if (!userId || !conversationId) return [];

  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'users', userId, 'conversations', conversationId, 'messages'),
        orderBy('createdAt', 'asc')
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const cloudMsgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setLocalMsgs(userId, conversationId, cloudMsgs);
        return cloudMsgs;
      }
    } catch (err) {
      console.warn('Firestore getMessages failed, falling back to local storage:', err);
    }
  }

  return getLocalMsgs(userId, conversationId);
}

export async function addMessage(userId, conversationId, message) {
  if (!userId || !conversationId) return;

  const msgPayload = {
    id: message.id || ('msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)),
    role: message.role,
    content: message.content,
    createdAt: Date.now()
  };

  // Save to local storage immediately so there is zero delay
  const existingMsgs = getLocalMsgs(userId, conversationId);
  setLocalMsgs(userId, conversationId, [...existingMsgs, msgPayload]);

  // Update conversation updatedAt timestamp in local storage
  const convs = getLocalConvs(userId);
  const updatedConvs = convs.map(c => c.id === conversationId ? { ...c, updatedAt: Date.now() } : c);
  setLocalConvs(userId, updatedConvs);

  notifyConversationsChanged(userId, conversationId);

  // Sync to Firestore if configured
  if (isFirebaseConfigured && db) {
    try {
      await addDoc(
        collection(db, 'users', userId, 'conversations', conversationId, 'messages'),
        {
          role: message.role,
          content: message.content,
          createdAt: serverTimestamp()
        }
      );
      await updateDoc(doc(db, 'users', userId, 'conversations', conversationId), {
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Firestore background addMessage failed:', err);
    }
  }
}

export async function updateConversationTitle(userId, conversationId, title) {
  if (!userId || !conversationId) return;
  const safeTitle = title.trim();

  const convs = getLocalConvs(userId);
  const updated = convs.map(c => c.id === conversationId ? { ...c, title: safeTitle, updatedAt: Date.now() } : c);
  setLocalConvs(userId, updated);
  notifyConversationsChanged(userId, conversationId);

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'users', userId, 'conversations', conversationId), {
        title: safeTitle,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Firestore updateConversationTitle failed:', err);
    }
  }
}

export async function deleteConversation(userId, conversationId) {
  if (!userId || !conversationId) return;

  const convs = getLocalConvs(userId);
  setLocalConvs(userId, convs.filter(c => c.id !== conversationId));
  try {
    localStorage.removeItem(`${LOCAL_STORAGE_MSGS_PREFIX}${userId}_${conversationId}`);
  } catch (e) {
    console.warn(e);
  }
  notifyConversationsChanged(userId, conversationId);

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'users', userId, 'conversations', conversationId));
    } catch (err) {
      console.warn('Firestore deleteConversation failed:', err);
    }
  }
}
