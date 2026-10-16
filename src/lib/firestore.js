import {
  collection, addDoc, getDocs, doc, updateDoc,
  deleteDoc, query, orderBy, serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

const LOCAL_STORAGE_CONVS_PREFIX = 'cosmos_convs_';
const LOCAL_STORAGE_MSGS_PREFIX = 'cosmos_msgs_';

function getLocalConvs(userId) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CONVS_PREFIX + userId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalConvs(userId, convs) {
  try {
    localStorage.setItem(LOCAL_STORAGE_CONVS_PREFIX + userId, JSON.stringify(convs));
  } catch (e) {
    console.warn('Failed to save convs locally:', e);
  }
}

function getLocalMsgs(userId, convId) {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_MSGS_PREFIX}${userId}_${convId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalMsgs(userId, convId, msgs) {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_MSGS_PREFIX}${userId}_${convId}`, JSON.stringify(msgs));
  } catch (e) {
    console.warn('Failed to save msgs locally:', e);
  }
}

export async function createConversation(userId, title, model) {
  if (isFirebaseConfigured && db) {
    try {
      const ref = await addDoc(collection(db, 'users', userId, 'conversations'), {
        title,
        model,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return ref.id;
    } catch (err) {
      console.warn('Firestore createConversation failed, falling back to local storage:', err);
    }
  }

  const id = 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const convs = getLocalConvs(userId);
  const newConv = {
    id,
    title,
    model,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  setLocalConvs(userId, [newConv, ...convs]);
  return id;
}

export async function getConversations(userId) {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'users', userId, 'conversations'),
        orderBy('updatedAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.warn('Firestore getConversations failed, falling back to local storage:', err);
    }
  }

  const convs = getLocalConvs(userId);
  return convs.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export async function getMessages(userId, conversationId) {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'users', userId, 'conversations', conversationId, 'messages'),
        orderBy('createdAt', 'asc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.warn('Firestore getMessages failed, falling back to local storage:', err);
    }
  }

  return getLocalMsgs(userId, conversationId);
}

export async function addMessage(userId, conversationId, message) {
  if (isFirebaseConfigured && db) {
    try {
      await addDoc(
        collection(db, 'users', userId, 'conversations', conversationId, 'messages'),
        { ...message, createdAt: serverTimestamp() }
      );
      await updateDoc(doc(db, 'users', userId, 'conversations', conversationId), {
        updatedAt: serverTimestamp()
      });
      return;
    } catch (err) {
      console.warn('Firestore addMessage failed, falling back to local storage:', err);
    }
  }

  const msgs = getLocalMsgs(userId, conversationId);
  const newMsg = {
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    ...message,
    createdAt: Date.now()
  };
  setLocalMsgs(userId, conversationId, [...msgs, newMsg]);

  const convs = getLocalConvs(userId);
  const updated = convs.map(c => c.id === conversationId ? { ...c, updatedAt: Date.now() } : c);
  setLocalConvs(userId, updated);
}

export async function updateConversationTitle(userId, conversationId, title) {
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'users', userId, 'conversations', conversationId), { title });
      return;
    } catch (err) {
      console.warn('Firestore updateConversationTitle failed, falling back to local storage:', err);
    }
  }

  const convs = getLocalConvs(userId);
  const updated = convs.map(c => c.id === conversationId ? { ...c, title } : c);
  setLocalConvs(userId, updated);
}

export async function deleteConversation(userId, conversationId) {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'users', userId, 'conversations', conversationId));
      return;
    } catch (err) {
      console.warn('Firestore deleteConversation failed, falling back to local storage:', err);
    }
  }

  const convs = getLocalConvs(userId);
  setLocalConvs(userId, convs.filter(c => c.id !== conversationId));
  try {
    localStorage.removeItem(`${LOCAL_STORAGE_MSGS_PREFIX}${userId}_${conversationId}`);
  } catch (e) {
    console.warn(e);
  }
}
