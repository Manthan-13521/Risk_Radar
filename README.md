<div align="center">

<!-- LOGO -->
<svg width="72" height="72" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <polygon points="24,2 44,12 44,36 24,46 4,36 4,12" fill="#990011" stroke="#111111" stroke-width="2.5" stroke-linejoin="round"/>
  <polygon points="24,6 40,14 40,34 24,42 8,34 8,14" fill="#FCF6F5"/>
  <circle cx="24" cy="24" r="14" stroke="#111111" stroke-width="2" fill="none"/>
  <circle cx="24" cy="24" r="9.5" stroke="#111111" stroke-width="1.8" fill="none"/>
  <circle cx="24" cy="24" r="5" stroke="#990011" stroke-width="1.5" fill="none"/>
  <circle cx="24" cy="24" r="3" fill="#990011"/>
  <path d="M24 24L38 10" stroke="#990011" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="38" cy="10" r="1.8" fill="#76000D"/>
</svg>

<h1>Risk_Radar</h1>
<p><strong>Digital Immune System · Investigate Before You Interact.</strong></p>

[![Live Demo](https://img.shields.io/badge/Live%20Demo-risk--radar--4yow.onrender.com-990011?style=for-the-badge&logo=vercel&logoColor=white)](https://risk-radar-4yow.onrender.com)
[![Next.js](https://img.shields.io/badge/Next.js%2014-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)

</div>

---

<!-- WHATSAPP STYLE DEMO CARD -->
<div align="center">

```
┌─────────────────────────────────────────────────────┐
│  📱  WhatsApp · SBI Bank Alert                      │
│─────────────────────────────────────────────────────│
│                                                     │
│  ⚠️  URGENT: Your SBI account needs KYC            │
│  verification. Failure to act in 24 hours           │
│  will permanently freeze your account.              │
│                                                     │
│  🔗 Verify Now → sbi-kyc-verify.example/login       │
│                                                     │
│                                  Delivered  ✓✓      │
└─────────────────────────────────────────────────────┘

           ⬇  Without Risk_Radar, you click.

┌─────────────────────────────────────────────────────┐
│  🛡  RISK_RADAR INTERCEPTED                         │
│─────────────────────────────────────────────────────│
│                                                     │
│  ✗  Lookalike Domain   sbi-kyc-verify ≠ sbi.co.in  │
│  ✗  Artificial Urgency  "24 hours" pressure tactic  │
│  ✗  Brand Mismatch      Fake SBI sender domain      │
│  ✗  Threat DNA Match    87% — credential-theft      │
│                                                     │
│  RISK: 94 / 100   ·   INTENT: Credential Theft     │
│                                                     │
│         ⛔  DO NOT CONTINUE                         │
└─────────────────────────────────────────────────────┘
```

</div>

---

## What is Risk_Radar?

An AI-powered cybersecurity investigation platform. Instead of passively scanning for known malware, Risk_Radar **actively investigates** suspicious URLs, messages, and files — combining heuristics, Threat DNA fingerprinting, and AI reasoning to determine **intent** before you interact.

> **"Antivirus detects threats. Risk_Radar investigates attacks."**

---

## Key Features

| Feature | Description |
|---------|-------------|
| 🧬 **Threat DNA** | Jaccard-based fingerprinting clusters attack patterns — recognizes rewritten phishing URLs |
| 🤖 **AI Reasoning** | LLM explains intent, not just classification |
| 🔒 **Policy Engine** | Deterministic guard — prevents false ALLOWs even when AI is wrong |
| 🔊 **Voice Verdict** | Browser-native speech synthesis reads the verdict aloud |
| 📊 **Incident Management** | Full lifecycle tracking with drawer UI |
| 🎬 **Live Demo Mode** | 3 preloaded scenarios for instant judging demos |

---

## Tech Stack

```
Frontend   →  Next.js 14 (App Router) · TypeScript · Tailwind CSS
Backend    →  Next.js Route Handlers
Database   →  MongoDB Atlas
AI         →  OpenRouter (Mistral / Llama)
Speech     →  Web Speech API (browser-native, no cost)
Deployment →  Render
```

---

## Hackathon Demo — 3 Scenarios

Click the colored demo pills on the scanner page to load instantly. No external network needed.

| # | Input | Expected Result |
|---|-------|-----------------|
| 🔴 | `https://sbi-kyc-verify.example/login` | **CRITICAL · Risk 94/100 · Credential Theft** |
| 🟠 | Delivery scam SMS | **SUSPICIOUS · Risk ~65/100 · Possible Phishing** |
| 🟢 | `https://www.google.com` | **SAFE · Risk <15/100** |

---

## How It Works

```
Input (URL / message / file)
    ↓
Heuristic Signals      →  domain structure, urgency language, brand mismatch
    ↓
Threat DNA             →  Jaccard similarity against historical attack fingerprints
    ↓
AI Reasoning           →  Intent analysis, context interpretation
    ↓
Policy Engine          →  Deterministic final guard (overrides AI if needed)
    ↓
Risk Score + Confidence + Intent + Evidence + Recommendation
```

---

## Local Setup

```bash
git clone https://github.com/Manthan-13521/Risk_Radar.git
cd Risk_Radar
npm install
cp .env.example .env.local    # fill in your values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
MONGODB_URI=            # MongoDB Atlas connection string
OPENROUTER_API_KEY=     # OpenRouter API key
NEXT_PUBLIC_APP_URL=    # Your app base URL
```

---

<div align="center">

**Built for hackathon. Investigate before you interact.**

[![GitHub](https://img.shields.io/badge/GitHub-Manthan--13521-181717?style=flat-square&logo=github)](https://github.com/Manthan-13521/Risk_Radar)

</div>