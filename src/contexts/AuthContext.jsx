import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';

const AuthContext = createContext(null);
const LOCAL_USER_KEY = 'cosmos_local_user';
const GOOGLE_USER_KEY = 'cosmos_google_user';

// Utility to generate a consistent Google UID from an email address
export function getGoogleUid(email) {
  if (!email) return 'google_user_' + Date.now();
  return 'google_' + email.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check saved session on mount
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsub = onAuthStateChanged(auth, u => {
        if (u) {
          const googleUser = {
            uid: u.uid,
            displayName: u.displayName || u.email?.split('@')[0] || 'Google User',
            email: u.email || '',
            photoURL: u.photoURL || '',
            isGoogle: true,
            provider: 'google'
          };
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(googleUser));
          localStorage.setItem(GOOGLE_USER_KEY, JSON.stringify(googleUser));
          setUser(googleUser);
          migrateGuestChatsIfAny(googleUser.uid);
        } else {
          checkLocalSession();
        }
        setLoading(false);
      });
      return unsub;
    } else {
      checkLocalSession();
      setLoading(false);
    }
  }, []);

  const checkLocalSession = () => {
    try {
      // Prioritize saved Google user if present
      const savedGoogleUser = localStorage.getItem(GOOGLE_USER_KEY);
      if (savedGoogleUser) {
        const parsed = JSON.parse(savedGoogleUser);
        setUser(parsed);
        return;
      }
      const savedUser = localStorage.getItem(LOCAL_USER_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        return;
      }
    } catch {
      setUser(null);
    }
  };

  // Helper to migrate existing guest conversations into the newly signed-in Google account
  const migrateGuestChatsIfAny = (targetUserId) => {
    try {
      const guestKey = 'cosmos_convs_guest_user';
      const rawGuestConvs = localStorage.getItem(guestKey);
      if (rawGuestConvs) {
        const guestConvs = JSON.parse(rawGuestConvs);
        if (Array.isArray(guestConvs) && guestConvs.length > 0) {
          const targetKey = 'cosmos_convs_' + targetUserId;
          const rawTarget = localStorage.getItem(targetKey);
          const targetConvs = rawTarget ? JSON.parse(rawTarget) : [];
          
          // Merge unique convs
          const existingIds = new Set(targetConvs.map(c => c.id));
          const newConvs = [...targetConvs];
          
          guestConvs.forEach(conv => {
            if (!existingIds.has(conv.id)) {
              newConvs.push(conv);
              // Migrate messages too
              const guestMsgKey = `cosmos_msgs_guest_user_${conv.id}`;
              const targetMsgKey = `cosmos_msgs_${targetUserId}_${conv.id}`;
              const rawMsgs = localStorage.getItem(guestMsgKey);
              if (rawMsgs && !localStorage.getItem(targetMsgKey)) {
                localStorage.setItem(targetMsgKey, rawMsgs);
              }
            }
          });
          
          localStorage.setItem(targetKey, JSON.stringify(newConvs));
          // Clear guest convs to prevent duplicate confusion
          localStorage.removeItem(guestKey);
        }
      }
    } catch (err) {
      console.warn('Guest chats migration skipped:', err);
    }
  };

  // Sign in with Google account (supports Firebase popup or direct Google identity)
  const signInWithGoogle = async (customEmail = null, customName = null) => {
    if (isFirebaseConfigured && auth && googleProvider && !customEmail) {
      try {
        const res = await signInWithPopup(auth, googleProvider);
        const u = res.user;
        const googleUser = {
          uid: u.uid,
          displayName: u.displayName || u.email?.split('@')[0] || 'Google User',
          email: u.email || '',
          photoURL: u.photoURL || '',
          isGoogle: true,
          provider: 'google'
        };
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(googleUser));
        localStorage.setItem(GOOGLE_USER_KEY, JSON.stringify(googleUser));
        setUser(googleUser);
        migrateGuestChatsIfAny(googleUser.uid);
        return googleUser;
      } catch (err) {
        console.warn('Firebase Google popup failed, falling back to direct Google authorization:', err);
      }
    }

    // Google Account authorization
    const email = customEmail || 'sathishyogesh20@gmail.com';
    const name = customName || (email.startsWith('sathish') ? 'Sathish Yogesh' : email.split('@')[0]);
    const uid = getGoogleUid(email);

    const googleUser = {
      uid,
      displayName: name,
      email,
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4f46e5`,
      isGoogle: true,
      provider: 'google'
    };

    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(googleUser));
    localStorage.setItem(GOOGLE_USER_KEY, JSON.stringify(googleUser));
    setUser(googleUser);
    migrateGuestChatsIfAny(uid);
    return googleUser;
  };

  const signInAsGuest = () => {
    const guestUser = {
      uid: 'guest_user',
      displayName: 'Cosmos Explorer',
      email: 'explorer@cosmos.ai',
      photoURL: '',
      isGoogle: false,
      provider: 'guest'
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guestUser));
    localStorage.removeItem(GOOGLE_USER_KEY);
    setUser(guestUser);
    return guestUser;
  };

  const logout = async () => {
    localStorage.removeItem(LOCAL_USER_KEY);
    localStorage.removeItem(GOOGLE_USER_KEY);
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn(e);
      }
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signInWithGoogle,
      signInAsGuest,
      logout,
      isFirebaseConfigured
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
