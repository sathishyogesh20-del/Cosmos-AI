import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';

const AuthContext = createContext(null);
const LOCAL_USER_KEY = 'cosmos_local_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsub = onAuthStateChanged(auth, u => {
        if (u) {
          setUser(u);
        } else {
          const savedUser = localStorage.getItem(LOCAL_USER_KEY);
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
        setLoading(false);
      });
      return unsub;
    } else {
      const savedUser = localStorage.getItem(LOCAL_USER_KEY);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    if (isFirebaseConfigured && auth && googleProvider) {
      try {
        return await signInWithPopup(auth, googleProvider);
      } catch (err) {
        console.warn('Google sign-in popup error:', err);
        throw err;
      }
    }
    const guestUser = {
      uid: 'guest_user',
      displayName: 'Cosmos Explorer',
      email: 'explorer@cosmos.ai',
      photoURL: ''
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guestUser));
    setUser(guestUser);
    return guestUser;
  };

  const signInAsGuest = () => {
    const guestUser = {
      uid: 'guest_user',
      displayName: 'Cosmos Explorer',
      email: 'explorer@cosmos.ai',
      photoURL: ''
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guestUser));
    setUser(guestUser);
    return guestUser;
  };

  const logout = async () => {
    localStorage.removeItem(LOCAL_USER_KEY);
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
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInAsGuest, logout, isFirebaseConfigured }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
