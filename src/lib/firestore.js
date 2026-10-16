import {
  collection, addDoc, getDocs, doc, updateDoc,
  deleteDoc, query, orderBy, serverTimestamp, getDoc
} from 'firebase/firestore';
import { db } from './firebase';

export async function createConversation(userId, title, model) {
  const ref = await addDoc(collection(db, 'users', userId, 'conversations'), {
    title,
    model,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return ref.id;
}

export async function getConversations(userId) {
  const q = query(
    collection(db, 'users', userId, 'conversations'),
    orderBy('updatedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getMessages(userId, conversationId) {
  const q = query(
    collection(db, 'users', userId, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addMessage(userId, conversationId, message) {
  await addDoc(
    collection(db, 'users', userId, 'conversations', conversationId, 'messages'),
    { ...message, createdAt: serverTimestamp() }
  );
  await updateDoc(doc(db, 'users', userId, 'conversations', conversationId), {
    updatedAt: serverTimestamp()
  });
}

export async function updateConversationTitle(userId, conversationId, title) {
  await updateDoc(doc(db, 'users', userId, 'conversations', conversationId), { title });
}

export async function deleteConversation(userId, conversationId) {
  await deleteDoc(doc(db, 'users', userId, 'conversations', conversationId));
}
