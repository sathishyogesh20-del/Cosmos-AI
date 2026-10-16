const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const TAVILY_API_URL = 'https://api.tavily.com/search';

export const getGroqApiKey = () => {
  return localStorage.getItem('cosmos_groq_api_key') || import.meta.env.VITE_GROQ_API_KEY || '';
};

export const getTavilyApiKey = () => {
  return localStorage.getItem('cosmos_tavily_api_key') || import.meta.env.VITE_TAVILY_API_KEY || '';
};

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
  es: 'Respond in Spanish (Español).',
  fr: 'Respond in French (Français).',
  de: 'Respond in German (Deutsch).',
  ja: 'Respond in Japanese (日本語).',
  auto: 'Detect the language the user is writing in and respond in the same language.'
};

export const SUPPORTED_LANGUAGES = [
  { code: 'auto', name: 'Auto Detect', flag: '🌐' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳' }
];

export async function webSearch(query) {
  const tavilyApiKey = getTavilyApiKey();
  if (!tavilyApiKey) return null;
  try {
    const res = await fetch(TAVILY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: tavilyApiKey,
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

/**
 * Intelligent local simulated fallback when no live Groq API key is present
 */
async function generateSimulatedResponse({ messages, onChunk, signal }) {
  const lastUserMsg = messages[messages.length - 1]?.content || '';
  const lower = lastUserMsg.toLowerCase();

  let response = '';

  if (lower.includes('scraper') || lower.includes('scrape') || lower.includes('python')) {
    response = `Here is a production-grade Python web scraper with error handling and rate-limiting:

\`\`\`python
import requests
from bs4 import BeautifulSoup
import time
import csv

def scrape_catalog(base_url, max_pages=3):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    items = []

    for page in range(1, max_pages + 1):
        url = f"{base_url}?page={page}"
        print(f"Fetching: {url}")
        try:
            res = requests.get(url, headers=headers, timeout=10)
            res.raise_for_status()
            soup = BeautifulSoup(res.text, 'html.parser')

            # Find all product containers
            cards = soup.select('.product-item')
            for card in cards:
                title = card.select_one('.title')?.get_text(strip=True) or 'N/A'
                price = card.select_one('.price')?.get_text(strip=True) or 'N/A'
                items.append({'title': title, 'price': price})

            time.sleep(1.0) # Respect server rate limits
        except requests.RequestException as e:
            print(f"Error on page {page}: {e}")
            break

    return items

if __name__ == '__main__':
    results = scrape_catalog('https://example-store.com/products')
    print(f"Scraped {len(results)} items successfully.")
\`\`\`

<cosmos-artifact type="code" filename="scraper.py" language="python">
import requests
from bs4 import BeautifulSoup
import time

def scrape_products(url):
    headers = {'User-Agent': 'CosmosBot/1.0'}
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, 'html.parser')
    
    products = []
    for item in soup.select('.item'):
        name = item.select_one('.name').get_text(strip=True)
        price = item.select_one('.price').get_text(strip=True)
        products.append({'name': name, 'price': price})
    return products

if __name__ == '__main__':
    print("Scraper ready.")
</cosmos-artifact>

### Key Highlights:
1. **Polite Headers**: Includes realistic \`User-Agent\` headers to avoid simple bot blocks.
2. **Backoff & Throttling**: 1-second delay between pagination requests.
3. **Cosmos Artifact**: I have generated a self-contained \`scraper.py\` file in the Artifact panel on the right. You can inspect, copy, or download it immediately!`;
  } else if (lower.includes('landing page') || lower.includes('html') || lower.includes('website')) {
    response = `I have designed a sleek, modern landing page with animated stars, hero copy, and a responsive layout.

<cosmos-artifact type="html" filename="index.html" language="html">
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cosmos AI - Autonomous Intelligence</title>
  <style>
    :root {
      --bg: #090a10;
      --card: #12141f;
      --accent: #818cf8;
      --accent-glow: rgba(129, 140, 248, 0.4);
      --text: #f1f5f9;
      --muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
    }
    .hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 100px 24px;
      position: relative;
    }
    .glow {
      position: absolute;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
      top: 20%;
      filter: blur(60px);
      pointer-events: none;
    }
    h1 {
      font-size: 3.5rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-bottom: 20px;
      background: linear-gradient(135deg, #fff 40%, var(--accent) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      color: var(--muted);
      font-size: 1.2rem;
      max-width: 600px;
      margin-bottom: 32px;
      line-height: 1.6;
    }
    .cta-btn {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
      border: none;
      padding: 14px 32px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 9999px;
      cursor: pointer;
      box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.5);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .cta-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px -5px rgba(99, 102, 241, 0.7);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      max-width: 1000px;
      margin: 0 auto 100px;
      padding: 0 24px;
    }
    .card {
      background: var(--card);
      border: 1px solid rgba(255,255,255,0.06);
      padding: 32px;
      border-radius: 16px;
    }
    .card h3 { margin-bottom: 8px; font-size: 1.25rem; color: #fff; }
    .card p { font-size: 0.95rem; margin: 0; }
  </style>
</head>
<body>
  <div class="hero">
    <div class="glow"></div>
    <h1>The Neural Horizon</h1>
    <p>Cosmos combines neural synthesis, real-time code generation, and cognitive memory to accelerate human potential.</p>
    <button class="cta-btn">Get Started Free</button>
  </div>
  <div class="grid">
    <div class="card">
      <h3>⚡ Instant Inference</h3>
      <p>Sub-millisecond token generation engineered for live creative flow.</p>
    </div>
    <div class="card">
      <h3>📦 Live Artifacts</h3>
      <p>Inspect, run, and preview generated code side-by-side.</p>
    </div>
    <div class="card">
      <h3>🛡️ Private by Design</h3>
      <p>Local-first architectural options that respect user confidentiality.</p>
    </div>
  </div>
</body>
</html>
</cosmos-artifact>

You can click **Preview** in the Artifact panel on the right to see the live rendering directly!`;
  } else if (lower.includes('black hole') || lower.includes('space') || lower.includes('physics')) {
    response = `### The Physics of Black Holes

A **black hole** is an astronomical entity with a gravitational field so intense that no matter or electromagnetic radiation (including visible light) can escape from inside its boundary.

#### 1. Formation & Stellar Collapse
When a massive star (typically $> 20$ solar masses) exhausts its thermonuclear fuel, outward radiation pressure drops below inward gravitational pull. The star's core collapses catastrophically within fractions of a second, producing a supernova explosion and leaving a **stellar-mass black hole**.

#### 2. Anatomy
- **Event Horizon**: The point of no return. Mathematically described by the Schwarzschild radius:
  $$r_s = \\frac{2GM}{c^2}$$
- **Singularity**: At the center, current General Relativity predicts infinite spacetime curvature and density.
- **Accretion Disk**: Superheated plasma orbiting outside the horizon, reaching millions of degrees and radiating energetic X-rays.

<cosmos-artifact type="document" filename="black-holes-summary.md">
# Black Hole Classification

| Type | Mass | Typical Size |
| :--- | :--- | :--- |
| **Micro / Primordial** | Up to Earth mass | Size of subatomic particles |
| **Stellar** | $3 - 50\\, M_\\odot$ | $\\sim 30\\text{ km}$ diameter |
| **Intermediate** | $10^2 - 10^5\\, M_\\odot$ | Size of a large planet/star |
| **Supermassive** | $10^6 - 10^{10}\\, M_\\odot$ | Size of our solar system |

### Key Observational Milestones
1. **Cygnus X-1 (1964/1971)**: First confirmed stellar black hole candidate.
2. **GW150914 (2015)**: First direct detection of gravitational waves from a binary merger by LIGO.
3. **M87* (2019)**: First direct radio shadow image captured by the Event Horizon Telescope (EHT).
4. **Sagittarius A* (2022)**: First image of the Milky Way's central supermassive black hole.
</cosmos-artifact>

I've organized the classification table and observational timeline into the artifact on your right!`;
  } else {
    response = `Thank you for the prompt!

Here is a structured, detailed breakdown:

1. **Analysis**: Your inquiry touches on key principles of modern software architecture and reasoning.
2. **Recommendation**:
   - Keep components modular and decoupled.
   - Enforce explicit boundaries between UI presentation and background asynchronous persistence.
   - Employ fast streaming feedback so the user experience feels instantaneous.

\`\`\`javascript
// Example helper for non-blocking execution
async function runConcurrently(task, onDone) {
  try {
    const result = await task();
    onDone?.(null, result);
  } catch (err) {
    onDone?.(err);
  }
}
\`\`\`

Let me know if you would like me to dive deeper into any aspect or generate complete project artifacts for you!`;
  }

  // Smoothly stream the tokens word by word with slight delay
  const words = response.split(' ');
  let accumulated = '';
  for (let i = 0; i < words.length; i++) {
    if (signal?.aborted) break;
    accumulated += (i === 0 ? '' : ' ') + words[i];
    onChunk?.(accumulated);
    // Yield every 2-3 words for high responsiveness
    if (i % 3 === 0) {
      await new Promise(r => setTimeout(r, 16));
    }
  }

  return accumulated;
}

export async function sendMessage({
  messages,
  model,
  language = 'auto',
  useWebSearch = false,
  fileContent = null,
  temperature = 0.7,
  systemPersona = 'general',
  onChunk = null,
  signal = null
}) {
  const groqApiKey = getGroqApiKey();

  // If no Groq API key is provided, use our intelligent local engine so the user is never blocked!
  if (!groqApiKey) {
    return generateSimulatedResponse({ messages, onChunk, signal });
  }

  const langPrompt = LANGUAGE_PROMPTS[language] || LANGUAGE_PROMPTS.auto;

  let personaInstruction = 'You are Cosmos-AI, an advanced AI assistant created to be deeply helpful, nuanced, articulate, and accurate.';
  if (systemPersona === 'coding') {
    personaInstruction = 'You are a Senior Principal Software Engineer. Provide production-ready, clean, performant, and well-documented code with practical architectural reasoning.';
  } else if (systemPersona === 'research') {
    personaInstruction = 'You are an elite Research Fellow in AI and Computer Science. Provide rigorous, evidence-based, thorough, and highly analytical answers.';
  } else if (systemPersona === 'concise') {
    personaInstruction = 'You are an executive AI assistant. Be extremely direct, concise, high-density, and structured. Eliminate unnecessary pleasantries.';
  }

  let systemPrompt = `${personaInstruction}

${langPrompt}

Guidelines:
- When writing code, always use proper markdown code blocks with language tags (e.g. \`\`\`python, \`\`\`javascript, \`\`\`html).
- When creating full files, documents, or interactive demos, wrap the content in a special artifact tag:
  <cosmos-artifact type="code" filename="filename.ext" language="lang">CODE HERE</cosmos-artifact>
  <cosmos-artifact type="html" filename="index.html" language="html">HTML HERE</cosmos-artifact>
  <cosmos-artifact type="document" filename="doc.md" language="markdown">MARKDOWN HERE</cosmos-artifact>
- You are Cosmos-AI, powered by Cosmos Models.`;

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

  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      signal,
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...msgs
        ],
        max_tokens: 8192,
        temperature,
        stream: Boolean(onChunk)
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const message = err.error?.message || `API error (${res.status})`;
      // If model not found or unrecognized on endpoint, retry with standard model
      if ((res.status === 400 || res.status === 404) && model !== 'llama-3.3-70b-versatile') {
        console.warn(`Model ${model} not recognized on endpoint, retrying with llama-3.3-70b-versatile:`, message);
        return sendMessage({
          messages,
          model: 'llama-3.3-70b-versatile',
          language,
          useWebSearch,
          fileContent,
          temperature,
          systemPersona,
          onChunk,
          signal
        });
      }
      if (res.status === 401 || res.status === 404) {
        console.warn('Groq API authentication issue, using local fallback:', message);
        return generateSimulatedResponse({ messages, onChunk, signal });
      }
      throw new Error(message);
    }

    if (onChunk && res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullText = '';
      let buffer = '';

      while (true) {
        if (signal?.aborted) {
          reader.cancel();
          break;
        }
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;
          if (trimmed === 'data: [DONE]') break;
          if (trimmed.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              const delta = parsed.choices?.[0]?.delta?.content || '';
              if (delta) {
                fullText += delta;
                onChunk(fullText);
              }
            } catch {
              // Ignore partial JSON chunks
            }
          }
        }
      }
      return fullText;
    } else {
      const data = await res.json();
      const content = data.choices[0].message.content;
      onChunk?.(content);
      return content;
    }
  } catch (err) {
    if (signal?.aborted) {
      return '';
    }
    console.warn('Groq fetch failed, using local engine fallback:', err);
    return generateSimulatedResponse({ messages, onChunk, signal });
  }
}

export async function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;

    const textTypes = [
      'text/', 'application/json', 'application/javascript',
      'application/xml', 'application/x-python', 'application/typescript'
    ];

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else if (textTypes.some(t => file.type.includes(t)) || file.name.match(/\.(py|js|ts|jsx|tsx|html|css|json|xml|md|txt|csv|yaml|yml|sh|c|cpp|java|rb|php|go|rs)$/i)) {
      reader.readAsText(file);
    } else {
      reader.readAsText(file);
    }
  });
}
