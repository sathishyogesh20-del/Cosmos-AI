import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

export const SYSTEM_PERSONAS = [
  {
    id: 'general',
    name: 'Cosmos Default',
    description: 'Thoughtful, balanced, and deep responses across all subjects.',
    prompt: 'You are Cosmos-AI, an advanced AI assistant created to be deeply helpful, nuanced, articulate, and accurate.'
  },
  {
    id: 'coding',
    name: 'Senior Software Engineer',
    description: 'Concise, production-grade code, architectural best practices, and clean explanations.',
    prompt: 'You are a Senior Principal Software Engineer at Cosmos. Provide production-ready, clean, performant, and well-documented code with practical architectural reasoning.'
  },
  {
    id: 'research',
    name: 'Deep Research Scientist',
    description: 'Rigorous analysis, academic depth, nuanced breakdown of complex topics.',
    prompt: 'You are an elite Research Fellow in AI and Computer Science. Provide rigorous, evidence-based, thorough, and highly analytical answers.'
  },
  {
    id: 'concise',
    name: 'Executive & Direct',
    description: 'Direct to the point, bullet points, zero fluff.',
    prompt: 'You are an executive AI assistant. Be extremely direct, concise, high-density, and structured. Eliminate unnecessary pleasantries.'
  }
];

export function SettingsProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('cosmos-lang') || 'auto');
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('cosmos-model') || 'cosmos-stellar');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [groqApiKey, setGroqApiKeyState] = useState(() => localStorage.getItem('cosmos_groq_api_key') || import.meta.env.VITE_GROQ_API_KEY || '');
  const [tavilyApiKey, setTavilyApiKeyState] = useState(() => localStorage.getItem('cosmos_tavily_api_key') || import.meta.env.VITE_TAVILY_API_KEY || '');
  const [temperature, setTemperatureState] = useState(() => Number(localStorage.getItem('cosmos_temperature') || 0.7));
  const [systemPersona, setSystemPersonaState] = useState(() => localStorage.getItem('cosmos_persona') || 'general');
  const [streamingEnabled, setStreamingEnabledState] = useState(() => localStorage.getItem('cosmos_streaming') !== 'false');

  const updateLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('cosmos-lang', lang);
  };

  const updateModel = (model) => {
    setSelectedModel(model);
    localStorage.setItem('cosmos-model', model);
  };

  const updateGroqApiKey = (key) => {
    setGroqApiKeyState(key);
    if (key) {
      localStorage.setItem('cosmos_groq_api_key', key);
    } else {
      localStorage.removeItem('cosmos_groq_api_key');
    }
  };

  const updateTavilyApiKey = (key) => {
    setTavilyApiKeyState(key);
    if (key) {
      localStorage.setItem('cosmos_tavily_api_key', key);
    } else {
      localStorage.removeItem('cosmos_tavily_api_key');
    }
  };

  const updateTemperature = (temp) => {
    setTemperatureState(temp);
    localStorage.setItem('cosmos_temperature', String(temp));
  };

  const updateSystemPersona = (personaId) => {
    setSystemPersonaState(personaId);
    localStorage.setItem('cosmos_persona', personaId);
  };

  const updateStreamingEnabled = (enabled) => {
    setStreamingEnabledState(enabled);
    localStorage.setItem('cosmos_streaming', String(enabled));
  };

  return (
    <SettingsContext.Provider value={{
      language, updateLanguage,
      selectedModel, updateModel,
      settingsOpen, setSettingsOpen,
      groqApiKey, updateGroqApiKey,
      tavilyApiKey, updateTavilyApiKey,
      temperature, updateTemperature,
      systemPersona, updateSystemPersona,
      streamingEnabled, updateStreamingEnabled,
      hasLiveKey: Boolean(groqApiKey)
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
