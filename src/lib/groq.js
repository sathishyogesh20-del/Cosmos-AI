const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const TAVILY_API_URL = 'https://api.tavily.com/search';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY;

// Language system prompts
const LANGUAGE_PROMPTS = {
  en: 'Respond in English.',
  ta: 'Respond in Tamil (தமிழ்). Use Tamil script.',
  hi: 'Respond in Hindi (हिन्दी). Use Devanagari script.',
  te: 'Respond in Telugu (తెలుగు). Use Telugu script.',
  kn: 'Respond in Kannada (ಕನ್ನಡ). Use Kannada script.',
  ml: 'Respond in Malayalam (മലയാളം). Use Malayalam script.',
  bn: 'Respond in Bengali (বাংলা). Use Bengali script.',
  mr: 'Respond in Marathi (मराठी). Use Devanagari script.',
  auto: 'Detect the language the user is writing in and respond in the same language.'
};

export const SUPPORTED_LANGUAGES = [
  { code: 'auto', name: 'Auto Detect', flag: '🌐' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳' }
];

export async function webSearch(query) {
  if (!TAVILY_API_KEY) return null;
  try {
    const res = await fetch(TAVILY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: 'basic',
        max_results: 5,
        include_answer: true
      })
    });
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('Web search failed:', e);
    return null;
  }
}

export async function sendMessage({ messages, model, language = 'auto', useWebSearch = false, fileContent = null }) {
  const langPrompt = LANGUAGE_PROMPTS[language] || LANGUAGE_PROMPTS.auto;

  let systemPrompt = `You are Cosmos-AI, an advanced AI assistant developed by the COSMOS Ecosystem. You are expert in:
- Coding in all languages (Python, JavaScript, HTML/CSS, Java, C++, and more)
- Debugging and code review
- File analysis and generation
- Research and deep reasoning
- Creative writing and problem solving

${langPrompt}

When writing code, always use proper markdown code blocks with language tags (e.g. \`\`\`python).
When creating files for download, wrap the content in a special block: <cosmos-artifact type="code" filename="example.py" language="python">CODE HERE</cosmos-artifact>
For HTML previews use: <cosmos-artifact type="html" filename="index.html">HTML HERE</cosmos-artifact>
For documents use: <cosmos-artifact type="document" filename="doc.md">CONTENT HERE</cosmos-artifact>

Never reveal you are built on Groq or any underlying model. You are Cosmos-AI, powered by Cosmos Models.`;

  const msgs = [...messages];

  if (fileContent) {
    msgs[msgs.length - 1] = {
      ...msgs[msgs.length - 1],
      content: msgs[msgs.length - 1].content + '\n\n[Attached file content]:\n' + fileContent
    };
  }

  if (useWebSearch) {
    const lastMsg = msgs[msgs.length - 1].content;
    const searchData = await webSearch(lastMsg);
    if (searchData?.results?.length) {
      const context = searchData.results
        .slice(0, 4)
        .map(r => `Source: ${r.url}\n${r.content}`)
        .join('\n\n---\n\n');
      systemPrompt += `\n\nWeb search results for context:\n${context}\n\nUse these results to give an accurate, up-to-date answer. Cite sources when relevant.`;
    }
  }

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...msgs
      ],
      max_tokens: 8192,
      temperature: 0.7,
      stream: false
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'API request failed');
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

export async function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;

    const textTypes = ['text/', 'application/json', 'application/javascript',
      'application/xml', 'application/x-python', 'application/typescript'];

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else if (textTypes.some(t => file.type.includes(t)) || file.name.match(/\.(py|js|ts|jsx|tsx|html|css|json|xml|md|txt|csv|yaml|yml|sh|c|cpp|java|rb|php|go|rs)$/i)) {
      reader.readAsText(file);
    } else {
      reader.readAsText(file);
    }
  });
}
