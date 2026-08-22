<div align="center">

<img src="logo.svg" width="100" height="100" alt="Risk_Radar Logo" />

<h1>Risk_Radar</h1>
<p><strong>Digital Immune System · Investigate Before You Interact.</strong></p>

<!-- Badges Row 1 — Live + Deployment -->
[![Live Demo](https://img.shields.io/badge/Live%20Demo-risk--radar--4yow.onrender.com-990011?style=for-the-badge&logo=googlechrome&logoColor=white)](https://risk-radar-4yow.onrender.com)
[![Deployed on Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com)
[![Watch Demo](https://img.shields.io/badge/▶%20Watch%2040s%20Demo-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](#demo-video)

<!-- Badges Row 2 — Tech Stack -->
[![Next.js](https://img.shields.io/badge/Next.js%2014-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![OpenRouter](https://img.shields.io/badge/AI-OpenRouter-7C3AED?style=for-the-badge&logo=openai&logoColor=white)](https://openrouter.ai)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## 🎬 Demo Video <a name="demo-video"></a>

> One suspicious click. One investigation. One decision — before it's too late.

https://github.com/Manthan-13521/Risk_Radar/raw/main/public/demo-video.mp4

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

## Tech Stack & Integrations

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=white&style=flat-square) Next.js 14 + TypeScript | App framework & routing |
| **Styling** | ![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square) Tailwind CSS | UI design system |
| **Database** | ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white&style=flat-square) MongoDB Atlas | Scan history & incidents |
| **AI** | ![OpenRouter](https://img.shields.io/badge/OpenRouter-7C3AED?logo=openai&logoColor=white&style=flat-square) OpenRouter | Intent analysis & reasoning |
| **Speech** | Web Speech API | Browser-native voice verdict |
| **Deployment** | ![Render](https://img.shields.io/badge/Render-46E3B7?logo=render&logoColor=white&style=flat-square) Render | Cloud hosting |

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
AI Reasoning           →  Intent analysis via OpenRouter LLM
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

[![GitHub](https://img.shields.io/badge/GitHub-Manthan--13521%2FRisk__Radar-181717?style=flat-square&logo=github)](https://github.com/Manthan-13521/Risk_Radar)
&nbsp;·&nbsp;
[![Live](https://img.shields.io/badge/Live-risk--radar--4yow.onrender.com-990011?style=flat-square)](https://risk-radar-4yow.onrender.com)

</div>