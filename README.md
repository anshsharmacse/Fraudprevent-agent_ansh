# 🛡️ Financial Transaction Risk Agent

AI-powered fraud detection system for Indian banks with beautiful animated UI.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![OpenRouter](https://img.shields.io/badge/OpenRouter-LLM-green)

## ✨ Features

- 🔍 **AI Risk Analysis** - OpenRouter LLM with rule-based fallback
- 📊 **Risk Score 1-10** - Detailed breakdown with recommendations
- 🎨 **Beautiful UI** - Animated glassmorphism design
- 🌐 **Multi-language** - English, Hindi, Malayalam
- 🌙 **Dark/Light Mode** - Theme toggle
- 💬 **AI Chatbot** - Fraud prevention assistant
- 📱 **Fully Responsive** - Mobile-first design
- 💾 **History** - Local storage persistence

## 🚀 Deploy to Vercel (FREE)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Financial Risk Agent"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fraud-risk-agent.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Click **Deploy**

### Step 3: Add Environment Variable (IMPORTANT!)
1. Go to your project on Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Add new variable:
   - **Name:** `OPENROUTER_API_KEY`
   - **Value:** Your OpenRouter API key
4. Click **Save**
5. **Redeploy** the project

### Get OpenRouter API Key
1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up / Sign in
3. Go to **Keys** section
4. Create a new API key

## 🔐 Security

- ❌ **API key is NOT included in the code**
- ✅ **Uses environment variable on Vercel**
- ✅ **Safe to push to public GitHub**

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Create .env.local file
echo "OPENROUTER_API_KEY=your_api_key_here" > .env.local

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📊 Risk Levels

| Score | Level | Action |
|-------|-------|--------|
| 1-3 | Low ✅ | Approved |
| 4-5 | Medium ⚠️ | Monitor |
| 6-7 | High 🔶 | Verify |
| 8-10 | Critical 🚨 | Block |

## 🔧 How It Works

```
User Request
     ↓
OpenRouter LLM (if API key set)
     ↓
  Success?
   ↓    ↓
  YES   NO
   ↓    ↓
Return  Rule-Based
Result  Analysis
         ↓
    Always Returns Response!
```

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main UI
│   ├── layout.tsx        # Root layout
│   └── api/fraud/        # API routes
│       ├── analyze/      # Risk analysis
│       └── chat/         # Chatbot
└── components/ui/        # UI components
```

## 📝 License

MIT License - Free to use.
