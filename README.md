# 🌌 Cosmos-AI

An advanced AI chatbot powered by COSMOS models. Features include multi-model selection, web search, file uploads, artifacts panel, Google Auth, chat history, and Indian language support.

---

## 🚀 DEPLOYMENT GUIDE (Step by Step)

### STEP 1 — Get Your API Keys

**A. Groq API Key**
1. Go to https://console.groq.com
2. Sign up / Log in
3. Click "API Keys" → "Create API Key"
4. Copy the key (starts with `gsk_`)

**B. Tavily API Key (Web Search)**
1. Go to https://tavily.com
2. Click "Get Started Free" → Sign up with Google
3. Go to Dashboard → API Keys
4. Copy your key (starts with `tvly-`)

---

### STEP 2 — Set Up Firebase

1. Go to https://console.firebase.google.com
2. Click "Add project" → Name it `cosmos-ai` → Create
3. In the project, click "Authentication" → "Get Started"
4. Enable **Google** as a sign-in provider → Save
5. Click the **</>** (Web) icon to register your app
6. Copy the firebaseConfig values (you'll need them in Step 4)
7. Click "Firestore Database" → "Create database" → Start in **production mode** → Choose region → Done

---

### STEP 3 — Push to GitHub

1. Go to https://github.com/new
2. Repository name: `cosmos-ai`
3. Set to **Public** → Click "Create repository"
4. Open terminal in the cosmos-ai folder and run:

```bash
git init
git add .
git commit -m "Initial commit — Cosmos-AI"
git branch -M main
git remote add origin https://github.com/sathishyogesh20-del/cosmos-ai.git
git push -u origin main
```

---

### STEP 4 — Deploy on Vercel

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your `cosmos-ai` GitHub repo
4. Framework preset: **Vite** (auto-detected)
5. Click **"Environment Variables"** and add ALL of these:

| Variable | Value |
|---|---|
| VITE_GROQ_API_KEY | Your Groq key |
| VITE_TAVILY_API_KEY | Your Tavily key |
| VITE_FIREBASE_API_KEY | From Firebase config |
| VITE_FIREBASE_AUTH_DOMAIN | yourproject.firebaseapp.com |
| VITE_FIREBASE_PROJECT_ID | your-project-id |
| VITE_FIREBASE_STORAGE_BUCKET | yourproject.appspot.com |
| VITE_FIREBASE_MESSAGING_SENDER_ID | numbers |
| VITE_FIREBASE_APP_ID | your app id |

6. Click **Deploy** → Wait ~2 minutes

---

### STEP 5 — Add Vercel Domain to Firebase

After Vercel gives you a URL (e.g. `cosmos-ai.vercel.app`):

1. Go to Firebase Console → Authentication → Settings
2. Under "Authorized domains" → Add domain
3. Add: `cosmos-ai.vercel.app` (your Vercel URL)
4. Save

---

## ✅ Features

- 🌌 **5 COSMOS Models** — Flash, Nova, Stellar, Pulsar, Infinity
- 🔍 **Web Search** — via Tavily API (toggle in prompt bar)
- 📎 **File Uploads** — all file types (code, PDF, images, text)
- 🎨 **Artifacts Panel** — code artifacts with syntax highlighting, HTML live preview, download
- 💬 **Chat History** — stored in Firebase Firestore, per user
- 🔐 **Google Auth** — Firebase Authentication
- 🌐 **Indian Languages** — Auto-detect, Tamil, Hindi, Telugu, Kannada, Malayalam, Bengali, Marathi
- 📣 **Ad Banner** — dismissible, reappears every 5 minutes
- ⚙️ **Settings Panel** — language + default model selection

## 🌠 Models

| Model | Best For |
|---|---|
| ⚡ Cosmos Flash | Quick answers, casual chat |
| 🌟 Cosmos Nova | General purpose, balanced |
| 💻 Cosmos Stellar | Coding, debugging, technical |
| 🔮 Cosmos Pulsar | Complex reasoning, long tasks |
| 🌌 Cosmos Infinity | Deep research, file analysis |
