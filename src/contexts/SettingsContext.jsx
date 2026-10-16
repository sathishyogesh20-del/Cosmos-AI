import { createContext, useContext, useState } from 'react';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [language, setLanguage] = useState(localStorage.getItem('cosmos-lang') || 'auto');
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('cosmos-model') || 'cosmos-nova');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const updateLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('cosmos-lang', lang);
  };

  const updateModel = (model) => {
    setSelectedModel(model);
    localStorage.setItem('cosmos-model', model);
  };

  return (
    <SettingsContext.Provider value={{
      language, updateLanguage,
      selectedModel, updateModel,
      settingsOpen, setSettingsOpen
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
