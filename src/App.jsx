import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Chat from './pages/Chat';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: '100dvh', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#080b1a', fontFamily: "'Space Grotesk', sans-serif"
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'radial-gradient(circle, #7c6fff, #3a10c0)',
          boxShadow: '0 0 30px rgba(124,111,255,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, animation: 'pulse 1.5s ease-in-out infinite'
        }}>🌌</div>
        <style>{`@keyframes pulse { 0%,100%{transform:scale(1)}50%{transform:scale(1.1)} }`}</style>
      </div>
    );
  }

  return user ? <Chat /> : <Login />;
}
