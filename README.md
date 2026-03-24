<div align="center">

# 🛡️ Financial Transaction Risk Agent

### *Multi Language AI-Powered Fraud Detection System for Indian Banks*

<img width="1919" height="913" alt="image" src="https://github.com/user-attachments/assets/a6cde45a-f7d1-4d4e-b58f-e909d215793c" />

---

![Next.js](https://img.shields.io/badge/Next.js-16.2.1-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![OpenRouter](https://img.shields.io/badge/OpenRouter-LLaMA_3-10B981?style=for-the-badge&logo=meta&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic-Validation-FF6B6B?style=for-the-badge&logo=python&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

[![Live Demo](https://img.shields.io/badge/LIVE_DEMO-CLICK_HERE-8B5CF6?style=for-the-badge&logo=vercel&logoColor=white)](https://fraudprevent-agent-ansh.vercel.app/)
[![GitHub Stars](https://img.shields.io/github/stars/YOUR_USERNAME/fraud-risk-agent?style=for-the-badge&logo=github&color=yellow)](https://github.com/YOUR_USERNAME/fraud-risk-agent)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

### 🌐 **Live Demo:** [fraudprevent-agent-ansh.vercel.app](https://fraudprevent-agent-ansh.vercel.app/)

### 🎬 **Demo Video:** [https://drive.google.com/file/d/1wz_TTLqza12vKOxh4H_Y3jIPxdGZAPmy/view?usp=sharing](#) *(Click to Watch)*

---

## 📌 Project Overview - AI Agent Exercise

<div align="left">

###  Objective
Build an AI Agent that solves a **Real-World Problem** using OpenRouter API with structured output validation using **Pydantic models**.

### ✅ Requirements Fulfilled

| Requirement | Implementation | Status |
|-------------|----------------|:------:|
| 🔗 **OpenRouter API** | Integrated with LLaMA 3 (Free Model) | ✅ |
| 🐍 **Pydantic Validation** | Structured output validation | ✅ |
| 📝 **User Input Processing** | Transaction description + amount | ✅ |
| 🤖 **LLM Processing** | OpenRouter LLaMA 3 API | ✅ |
| 📊 **Actionable Output** | Risk score, recommendations, red flags | ✅ |
| 🌍 **Multi-language** | English, Hindi, Malayalam | ✅ |

###  Problem Solved
**Fraud Detection for Indian Banks** - A real-world problem affecting millions of users daily with financial losses due to various scam types.

</div>

</div>

---

## 🏗️ Technology Stack & Deployment

<div align="center">

### Deployment Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js 16 App]
        B[Tailwind CSS + Framer Motion]
        C[shadcn/ui Components]
    end
    
    subgraph "Backend Layer"
        D[API Routes - Next.js]
        E[Render + Railway Socket]
    end
    
    subgraph "AI Layer"
        F[OpenRouter API]
        G[LLaMA 3 Model - Free]
        H[Pydantic Validation]
    end
    
    subgraph "Data Layer"
        I[Prisma Schema]
        J[Local Storage]
    end
    
    A --> D
    B --> A
    C --> A
    D --> F
    D --> E
    F --> G
    G --> H
    D --> I
    A --> J
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
|  **Frontend** | Next.js 16 + TypeScript | React App with App Router |
|  **UI/UX** | Tailwind CSS + Framer Motion | Styling & Animations |
|  **Components** | shadcn/ui | Pre-built UI library |
|  **LLM** | OpenRouter - LLaMA 3 (Free) | AI Processing |
|  **Validation** | Pydantic Models | Structured Output |
|  **Database** | Prisma Schema | Data Modeling |
|  **Backend** | Render + Railway Socket | Server & Real-time |
|  **Deployment** | Vercel | Frontend Hosting |

</div>

---

## 📑 Table of Contents

- [ Real-World Problem](#-real-world-problem)
- [ Features](#-features)
- [ AI Agent Architecture](#-ai-agent-architecture)
- [🐍 Pydantic Validation Models](#-pydantic-validation-models)
- [🔄 System Flow](#-system-flow)
- [📊 Risk Analysis Logic](#-risk-analysis-logic)
- [🌍 Multi-Language Support](#-multi-language-support)
- [Quick Start](#-quick-start)
- [🌐 Deployment Guide](#-deployment-guide)
- [📁 Project Structure](#-project-structure)
- [🔧 API Reference](#-api-reference)
- [⚡ Rate Limits & Usage](#-rate-limits--usage)
- [👨‍💻 Author](#-author)

---

##  Real-World Problem

<div align="center">

### Financial Fraud in India - A Critical Issue

```mermaid
mindmap
  root((Financial Fraud in India))
    📊 Statistics
      ₹1.75 Lakh Crore Lost (2023)
      13,000+ Cases Daily
      60% Digital Fraud
     Target Victims
      Bank Customers
      Senior Citizens
      First-time Users
    🔴 Fraud Types
      UPI Scams
      Phishing Calls
      Investment Fraud
      Lottery Scams
      Job Scams
      Romance Scams
    💡 Our Solution
      Real-time Detection
      AI Risk Analysis
      Multi-language Support
      Free & Accessible
```

</div>

### How This Agent Solves It

| Problem | Our Solution | Impact |
|---------|--------------|--------|
| 🔴 Users can't identify fraud | ✅ AI-powered risk analysis | Instant fraud detection |
| 🔴 Language barriers | ✅ Multi-language (EN/HI/ML) | Accessible to all Indians |
| 🔴 Complex banking jargon | ✅ Simple risk scores (1-10) | Easy to understand |
| 🔴 No guidance on action | ✅ Clear recommendations | Know what to do next |
| 🔴 Expensive solutions | ✅ Free tier deployment | Available to everyone |

---

## ✨ Features

<div align="center">

| Feature | Description | Status |
|---------|-------------|:------:|
| 🤖 **LLaMA 3 AI Analysis** | OpenRouter API with free model | ✅ |
| 🐍 **Pydantic Validation** | Structured output validation | ✅ |
| 📊 **Risk Score (1-10)** | Comprehensive risk assessment | ✅ |
| 🎨 **Animated UI** | Framer Motion animations | ✅ |
| 🌐 **Multi-language** | English, Hindi, Malayalam | ✅ |
| 🌙 **Dark/Light Mode** | Theme toggle support | ✅ |
| 💬 **AI Chatbot** | Fraud prevention assistant | ✅ |
| 📱 **Fully Responsive** | Mobile-first design | ✅ |
| 💾 **History Storage** | Local storage persistence | ✅ |
| ⚡ **Quick Samples** | Pre-loaded test data | ✅ |
| 🚨 **Visual Alerts** | Confetti & warning animations | ✅ |

</div>

---

## 🤖 AI Agent Architecture

<div align="center">

### How the AI Agent Works

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Route
    participant O as OpenRouter
    participant L as LLaMA 3
    participant P as Pydantic
    participant R as Rule Engine
    
    U->>F: Enter Transaction
    F->>A: POST /api/fraud/analyze
    
    alt LLM Path
        A->>O: API Request
        O->>L: Process with LLaMA 3
        L->>O: Raw Response
        O->>A: JSON Response
        A->>P: Validate with Pydantic
        P->>A: Structured Output
    else Fallback Path
        A->>R: Rule-Based Analysis
        R->>A: Calculated Risk
    end
    
    A->>F: Risk Analysis Result
    F->>U: Display with Animation
```

</div>

### AI Agent Components

```mermaid
graph LR
    subgraph "Input Processing"
        A[User Query] --> B[Text Preprocessing]
        B --> C[Amount Extraction]
    end
    
    subgraph "AI Processing"
        C --> D{Query Type?}
        D -->|Quick Sample| E[Seed Data]
        D -->|Custom Query| F[LLaMA 3 API]
        F --> G[Pydantic Validation]
    end
    
    subgraph "Output Generation"
        E --> H[Risk Score]
        G --> H
        H --> I[Red Flags]
        I --> J[Recommendations]
        J --> K[Visual Display]
    end
```

---

## 🐍 Pydantic Validation Models

<div align="center">

### Structured Output Validation

</div>

```python
from pydantic import BaseModel, Field
from typing import List, Literal

class TransactionAnalysis(BaseModel):
    """Pydantic model for structured transaction analysis output"""
    
    risk_score: int = Field(
        ..., 
        ge=1, 
        le=10, 
        description="Risk score from 1 (safe) to 10 (critical)"
    )
    
    is_suspicious: bool = Field(
        ..., 
        description="Whether the transaction is flagged as suspicious"
    )
    
    risk_level: Literal["Low", "Medium", "High", "Critical"] = Field(
        ..., 
        description="Categorized risk level"
    )
    
    recommended_action: str = Field(
        ..., 
        min_length=10, 
        description="Actionable recommendation for the user"
    )
    
    reasoning: str = Field(
        ..., 
        min_length=20, 
        description="Detailed explanation of the analysis"
    )
    
    red_flags: List[str] = Field(
        default_factory=list, 
        description="List of detected red flags"
    )
    
    confidence: float = Field(
        ..., 
        ge=0.0, 
        le=1.0, 
        description="Confidence score of the analysis"
    )


class ChatResponse(BaseModel):
    """Pydantic model for chat response validation"""
    
    response: str = Field(
        ..., 
        min_length=10, 
        description="Chatbot response text"
    )
    
    success: bool = Field(
        default=True, 
        description="Whether the request was successful"
    )
```

### Validation Flow

```mermaid
flowchart TD
    A[Raw LLM Response] --> B{Valid JSON?}
    B -->|No| C[Rule-Based Fallback]
    B -->|Yes| D[Parse JSON]
    D --> E{Pydantic Validation}
    E -->|Invalid Fields| F[Apply Defaults]
    E -->|Valid| G[Return Structured Output]
    F --> G
    C --> G
```

---

## 🔄 System Flow

### Complete Transaction Analysis Flow

```mermaid
flowchart TD
    Start([🚀 User Opens App]) --> Input[📝 Enter Transaction]
    Input --> Type{🔍 Input Type?}
    
    Type -->|Quick Sample| Seed[📋 Load Seed Data]
    Type -->|Custom Query| Manual[⌨️ User Types]
    
    Seed --> Submit[📤 Submit to API]
    Manual --> Submit
    
    Submit --> API[🔗 API Route Handler]
    API --> CheckKey{🔑 API Key?}
    
    CheckKey -->|Yes| LLM[🤖 Call LLaMA 3]
    CheckKey -->|No| Rules[⚙️ Rule-Based]
    
    LLM --> Timeout{⏱️ < 20s?}
    Timeout -->|No| Rules
    Timeout -->|Yes| Parse[📥 Parse Response]
    
    Parse --> Validate[🐍 Pydantic Validation]
    Validate --> Valid{✅ Valid?}
    Valid -->|No| Rules
    
    Rules --> Calculate[📊 Calculate Risk]
    Valid -->|Yes| Result[✨ Structured Result]
    Calculate --> Result
    
    Result --> Save[💾 Save to History]
    Save --> Display[🖥️ Display Result]
    
    Display --> Risk{📊 Risk Level?}
    Risk -->|1-3 Low| Confetti[🎉 Confetti]
    Risk -->|4-5 Medium| Normal[📝 Normal]
    Risk -->|6-7 High| Warning[⚠️ Warning]
    Risk -->|8-10 Critical| Alert[🚨 Alert]
    
    Confetti --> End([✅ Complete])
    Normal --> End
    Warning --> End
    Alert --> End
```

---

## 📊 Risk Analysis Logic

### Risk Scoring Algorithm

```mermaid
graph TD
    subgraph InputProcessing["Input Processing"]
        A[Transaction Description]
        B[Transaction Amount]
    end
    
    subgraph PatternDetection["Pattern Detection"]
        C1[Cryptocurrency +3]
        C2[Urgency Language +2]
        C3[Late Night +1]
        C4[Unknown Recipient +2]
        C5[International +1]
        C6[Large Amount +2]
        C7[Investment Scam +3]
        C8[Lottery Scam +4]
        C9[Job Scam +3]
        C10[Romance Scam +3]
        C11[OTP PIN Request +4]
    end
    
    subgraph SafeIndicators["Safe Indicators"]
        D1[Salary -2]
        D2[Bills -2]
        D3[Family -1]
        D4[Bank FD -2]
    end
    
    subgraph FinalScore["Final Score"]
        E["Risk = Base 3 + Penalties - Bonuses"]
        F[Clamp 1 to 10]
    end
    
    A --> C1 & C2 & C3 & C4 & C5 & C7 & C8 & C9 & C10 & C11
    B --> C6
    A --> D1 & D2 & D3 & D4
    C1 & C2 & C3 & C4 & C5 & C6 & C7 & C8 & C9 & C10 & C11 --> E
    D1 & D2 & D3 & D4 --> E
    E --> F
```

### Risk Level Breakdown

<div align="center">

| Score | Level | Color | Action | Description |
|:-----:|:-----:|:-----:|--------|-------------|
| **1-3** | 🟢 **LOW** | `#10B981` | ✅ Approve | Safe - salary, bills, known payees |
| **4-5** | 🟡 **MEDIUM** | `#F59E0B` | ⚠️ Monitor | Unusual but explainable |
| **6-7** | 🟠 **HIGH** | `#F97316` | 🔶 Verify | Multiple red flags detected |
| **8-10** | 🔴 **CRITICAL** | `#EF4444` | 🚫 Block | Strong fraud indicators |

</div>

---

## 🌍 Multi-Language Support

<div align="center">

### Supported Languages

| Language | Code | Flag | Native Name | Status |
|----------|:----:|:----:|-------------|:------:|
| English | `en` | 🇬🇧 | English | ✅ |
| Hindi | `hi` | 🇮🇳 | हिंदी | ✅ |
| Malayalam | `ml` | 🇮🇳 | മലയാളം | ✅ |

### Language Selection Flow

```mermaid
sequenceDiagram
    participant U as User
    participant D as Language Dropdown
    participant S as State
    participant UI as UI Components
    
    U->>D: Click Language Button
    D->>U: Show Options (EN/HI/ML)
    U->>D: Select Language
    D->>S: setLanguage(code)
    S->>UI: Re-render with Translations
    UI->>U: Display in Selected Language
```

</div>

---

## 🚀 Quick Start

### Prerequisites

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-API-10B981?style=for-the-badge&logo=openai&logoColor=white)](https://openrouter.ai/)

</div>

### Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/YOUR_USERNAME/fraud-risk-agent.git
cd fraud-risk-agent

# 2️⃣ Install dependencies
npm install

# 3️⃣ Create environment file
echo "OPENROUTER_API_KEY=your_key_here" > .env.local

# 4️⃣ Run development server
npm run dev

# 5️⃣ Open http://localhost:3000
```

---

## 🌐 Deployment Guide

### Current Deployment

<div align="center">

| Component | Platform | URL |
|-----------|----------|-----|
| 🎨 Frontend | Vercel | [fraudprevent-agent-ansh.vercel.app](https://fraudprevent-agent-ansh.vercel.app/) |
| 🤖 LLM | OpenRouter | LLaMA 3 (Free Tier) |
| 🗄️ Database | Prisma | Schema-based |
| 🔌 Backend | Render + Railway | Socket connections |

</div>

### Deploy Your Own

```mermaid
flowchart LR
    A[📤 GitHub] --> B[🔗 Vercel Import]
    B --> C[⚙️ Configure]
    C --> D[🚀 Deploy]
    D --> E[🔐 Add API Key]
    E --> F[🔄 Redeploy]
    F --> G[✅ Live!]
    
    style A fill:#8B5CF6
    style B fill:#3B82F6
    style C fill:#10B981
    style D fill:#F59E0B
    style E fill:#EF4444
    style F fill:#EC4899
    style G fill:#10B981
```

<details>
<summary>🔧 Step-by-Step Deployment</summary>

1. **Push to GitHub**
   ```bash
   git init && git add . && git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/fraud-risk-agent.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository

3. **Add Environment Variable**
   - Settings → Environment Variables
   - Name: `OPENROUTER_API_KEY`
   - Value: Your OpenRouter API key

4. **Deploy & Test**
   - Click Deploy
   - Test the live application

</details>

---

## 📁 Project Structure

```
📦 fraud-risk-agent/
├── 📁 public/
│   └── 🖼️ logo.svg
│
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 api/fraud/
│   │   │   ├── 📁 analyze/route.ts    # Analysis API
│   │   │   └── 📁 chat/route.ts       # Chat API
│   │   ├── 📄 page.tsx                # Main UI
│   │   ├── 📄 layout.tsx              # Root Layout
│   │   └── 📄 globals.css             # Styles
│   │
│   ├── 📁 components/
│   │   ├── 📁 theme/                  # Theme Provider
│   │   └── 📁 ui/                     # shadcn/ui
│   │
│   └── 📁 lib/
│       └── 📄 utils.ts
│
├── 📁 prisma/
│   └── 📄 schema.prisma               # Database Schema
│
├── 📄 package.json
├── 📄 tailwind.config.ts
├── 📄 next.config.ts
└── 📄 README.md
```

---

## 🔧 API Reference

### Analyze Transaction

**POST** `/api/fraud/analyze`

**Request:**
```json
{
  "description": "Transfer ₹50,000 to unknown beneficiary at 2 AM",
  "amount": 50000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "risk_score": 8,
    "is_suspicious": true,
    "risk_level": "High",
    "recommended_action": "Hold transaction. Verify with customer.",
    "reasoning": "Multiple red flags detected...",
    "red_flags": ["Late night timing", "Unknown recipient"],
    "confidence": 0.88
  },
  "method": "llm"
}
```

### Chat Assistant

**POST** `/api/fraud/chat`

**Request:**
```json
{
  "message": "What is a risk score?"
}
```

**Response:**
```json
{
  "success": true,
  "response": "📊 Risk Score Guide...",
  "method": "llm"
}
```

---

## ⚡ Rate Limits & Usage

<div align="center">

### ⚠️ Important Notice

```
╔═══════════════════════════════════════════════════════════╗
║  🔔 PLEASE READ - Rate Limits Apply                        ║
║                                                             ║
║  • OpenRouter free tier has rate limits                     ║
║  • DO NOT click Analyze repeatedly                          ║
║  • Use Quick Samples for instant results (no API call)      ║
║  • Custom queries go to LLaMA 3 API                         ║
║  • Save tokens for actual use cases                         ║
║                                                             ║
║  💡 Best viewed on Laptop/Desktop                           ║
╚═══════════════════════════════════════════════════════════╝
```

### Usage Tips

| Action | API Call? | Speed | Recommendation |
|--------|:---------:|:-----:|----------------|
| Quick Samples | ❌ No | Instant | ✅ Use for demo |
| Custom Query | ✅ Yes | 5-15s | Use wisely |
| Chat Bot | ✅ Yes | 5-10s | Limit usage |

</div>

---

## 🎬 Demo & Screenshots

<div align="center">

### Feature Highlights

| Feature | Preview |
|---------|---------|
| 🔍 **Risk Analysis** | Analyzes transactions with AI |
| 📊 **Risk Meter** | Visual score from 1-10 |
| 🎨 **Animated UI** | Framer Motion effects |
| 🌙 **Dark Mode** | Theme switching |
| 🌐 **Multi-language** | EN/HI/ML support |
| 💬 **Chat Bot** | Fraud prevention assistant |

### Quick Sample Features

| Sample | Description | Risk |
|--------|-------------|------|
| 🚨 Crypto Transfer | ₹4.5L at 3:30 AM to wallet | Critical |
| ✅ Salary Credit | Monthly salary from employer | Low |
| ⚠️ International Wire | Urgent transfer to Nigeria | Critical |
| 💡 Bill Payment | Electricity bill via UPI | Low |
| ⚡ Rapid Transfers | ₹10K x 15 in 30 mins | High |
| 🏦 FD Maturity | Fixed deposit credit | Low |

</div>

---

## 👨‍💻 Author

<div align="center">

### **Ansh Sharma**

---

🎓 **BTech Student** @ **NIT Calicut**  
🏛️ National Institute of Technology Calicut  
💻 Computer Science & Engineering

---

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/anshsharmacse/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/YOUR_USERNAME)

---

**Project Completion Date:** March 24, 2026

**Status:** ✅ Deployed + OpenRouter LLM - LLaMA 3 + Pydantic Validation

</div>

---

## 🙏 Acknowledgments

<div align="center">

| Resource | Purpose |
|----------|---------|
| [OpenRouter](https://openrouter.ai/) | LLaMA 3 Free API |
| [Next.js](https://nextjs.org/) | React Framework |
| [shadcn/ui](https://ui.shadcn.com/) | UI Components |
| [Framer Motion](https://www.framer.com/motion/) | Animations |
| [Vercel](https://vercel.com/) | Deployment |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |

</div>

---

## 📄 License

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**MIT License** - Free to use, modify, and distribute.

</div>

---

<div align="center">

### ⭐ If you found this project helpful, please give it a star!

**Made with ❤️ in India 🇮🇳**

**🏆 AI Agent Exercise - Successfully Completed**

</div>
