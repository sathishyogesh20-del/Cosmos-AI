export const COSMOS_MODELS = [
  {
    id: 'cosmos-flash',
    name: 'Cosmos Flash',
    groqModel: 'llama-3.1-8b-instant',
    icon: '⚡',
    color: '#00d4ff',
    description: 'Lightning fast for quick answers and casual chat',
    badge: 'Fastest',
    bestFor: ['Quick Q&A', 'Simple tasks', 'Fast replies'],
    maxTokens: 8192
  },
  {
    id: 'cosmos-nova',
    name: 'Cosmos Nova',
    groqModel: 'llama-3.3-70b-versatile',
    icon: '🌟',
    color: '#7c6fff',
    description: 'Balanced intelligence for everyday tasks',
    badge: 'Balanced',
    bestFor: ['General chat', 'Writing', 'Summarization'],
    maxTokens: 32768
  },
  {
    id: 'cosmos-stellar',
    name: 'Cosmos Stellar',
    groqModel: 'deepseek-r1-distill-llama-70b',
    icon: '💻',
    color: '#00ff9d',
    description: 'Optimized for coding, debugging and technical work',
    badge: 'Coding',
    bestFor: ['Code generation', 'Debugging', 'Code review'],
    maxTokens: 32768
  },
  {
    id: 'cosmos-pulsar',
    name: 'Cosmos Pulsar',
    groqModel: 'mixtral-8x7b-32768',
    icon: '🔮',
    color: '#ff6b9d',
    description: 'Powerful reasoning for complex multi-step problems',
    badge: 'Reasoning',
    bestFor: ['Complex tasks', 'Analysis', 'Long reasoning'],
    maxTokens: 32768
  },
  {
    id: 'cosmos-infinity',
    name: 'Cosmos Infinity',
    groqModel: 'llama-3.3-70b-versatile',
    icon: '🌌',
    color: '#ffd700',
    description: 'Maximum intelligence for research, files and deep analysis',
    badge: 'Most Powerful',
    bestFor: ['Research', 'File analysis', 'Deep thinking'],
    maxTokens: 131072
  }
];

export const getGroqModel = (cosmosModelId) => {
  const model = COSMOS_MODELS.find(m => m.id === cosmosModelId);
  return model ? model.groqModel : 'llama-3.3-70b-versatile';
};

export const getModelById = (id) => COSMOS_MODELS.find(m => m.id === id) || COSMOS_MODELS[1];
