import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with auto-update
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Cosmos-AI updated in background.');
  },
  onOfflineReady() {
    console.log('Cosmos-AI is ready for offline use.');
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </AuthProvider>
  </React.StrictMode>
);
