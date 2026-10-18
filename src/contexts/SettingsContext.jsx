import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

export const CLAUDE_STYLES = [
  {
    id: 'normal',
    name: 'Normal (Claude Standard)',
    description: 'Thoughtful, balanced, articulate, and complete answers.',
    promptModifier: 'Respond with a balanced, natural, thoughtful, and articulate tone.'
  },
  {
    id: 'concise',
    name: 'Concise & Direct',
    description: 'Short paragraphs, bullet points, zero fluff or unnecessary preamble.',
    promptModifier: 'Be concise, direct, high-density, and structured. Avoid unnecessary preamble.'
  },
  {
    id: 'explanatory',
    name: 'Explanatory & Educational',
    description: 'Breaks concepts down step-by-step with practical analogies and deep intuition.',
    promptModifier: 'Explain concepts thoroughly with step-by-step intuition, analogies, and detailed architectural reasoning.'
  },
  {
    id: 'formal',
    name: 'Formal & Executive',
    description: 'Polished, professional, publication-ready phrasing.',
    promptModifier: 'Maintain a professional, publication-ready, executive tone.'
  }
];

export const SYSTEM_PERSONAS = [
  {
    id: 'general',
    name: 'Cosmos Assistant',
    description: 'Versatile intelligence across all topics and general workflows.',
    prompt: 'You are Cosmos-AI, an advanced AI assistant created to be deeply helpful, nuanced, articulate, and accurate.'
  },
  {
    id: 'coding',
    name: 'Principal Software Architect',
    description: 'Production-ready code, strict types, architecture patterns, and optimizations.',
    prompt: 'You are a Principal Software Architect. Provide production-ready, clean, performant, and well-documented code with architectural reasoning.'
  },
  {
    id: 'research',
    name: 'Deep Research Fellow',
    description: 'Academic depth, analytical rigor, evidence-backed evaluation.',
    prompt: 'You are an elite Research Fellow in AI and Computer Science. Provide rigorous, evidence-based, thorough, and highly analytical answers.'
  }
];

export function SettingsProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('cosmos-lang') || 'auto');
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('cosmos-model') || 'cosmos-stellar');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [temperature, setTemperatureState] = useState(() => Number(localStorage.getItem('cosmos-temperature') || 0.7));
  const [systemPersona, setSystemPersonaState] = useState(() => localStorage.getItem('cosmos-persona') || 'general');
  const [responseStyle, setResponseStyleState] = useState(() => localStorage.getItem('cosmos-style') || 'normal');
  const [extendedThinking, setExtendedThinkingState] = useState(() => localStorage.getItem('cosmos-thinking') !== 'false');
  const [streamingEnabled, setStreamingEnabledState] = useState(() => localStorage.getItem('cosmos-streaming') !== 'false');
  const [fontSize, setFontSizeState] = useState(() => localStorage.getItem('cosmos-font-size') || 'default');
  const [pinnedChatIds, setPinnedChatIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cosmos-pinned-chats') || '[]');
    } catch {
      return [];
    }
  });

  const updateLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('cosmos-lang', lang);
  };

  const updateModel = (model) => {
    setSelectedModel(model);
    localStorage.setItem('cosmos-model', model);
  };

  const updateTemperature = (temp) => {
    setTemperatureState(temp);
    localStorage.setItem('cosmos-temperature', String(temp));
  };

  const updateSystemPersona = (personaId) => {
    setSystemPersonaState(personaId);
    localStorage.setItem('cosmos-persona', personaId);
  };

  const updateResponseStyle = (styleId) => {
    setResponseStyleState(styleId);
    localStorage.setItem('cosmos-style', styleId);
  };

  const updateExtendedThinking = (enabled) => {
    setExtendedThinkingState(enabled);
    localStorage.setItem('cosmos-thinking', String(enabled));
  };

  const updateStreamingEnabled = (enabled) => {
    setStreamingEnabledState(enabled);
    localStorage.setItem('cosmos-streaming', String(enabled));
  };

  const updateFontSize = (size) => {
    setFontSizeState(size);
    localStorage.setItem('cosmos-font-size', size);
  };

  const togglePinChat = (chatId) => {
    setPinnedChatIds(prev => {
      const next = prev.includes(chatId) ? prev.filter(id => id !== chatId) : [chatId, ...prev];
      localStorage.setItem('cosmos-pinned-chats', JSON.stringify(next));
      return next;
    });
  };

  return (
    <SettingsContext.Provider value={{
      language, updateLanguage,
      selectedModel, updateModel,
      settingsOpen, setSettingsOpen,
      temperature, updateTemperature,
      systemPersona, updateSystemPersona,
      responseStyle, updateResponseStyle,
      extendedThinking, updateExtendedThinking,
      streamingEnabled, updateStreamingEnabled,
      fontSize, updateFontSize,
      pinnedChatIds, togglePinChat,
      hasLiveKey: Boolean(import.meta.env.VITE_GROQ_API_KEY || localStorage.getItem('cosmos_groq_api_key'))
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
