# Risk_Radar

> **Investigate before you interact.**

An AI-powered cybersecurity investigation platform that analyzes suspicious URLs, messages, and files before users engage with them — stopping credential theft, phishing, and social engineering attacks in real time.

---

## Key Features

- **Multi-engine analysis** — Heuristics + AI reasoning + Threat DNA + Policy engine
- **Threat DNA similarity** — Jaccard-based fingerprinting clusters attack patterns across rewritten URLs/messages
- **Authoritative policy guard** — Deterministic rules override AI to prevent false ALLOWs
- **Voice verdict** — Browser-native speech synthesis delivers the verdict aloud
- **Incident management** — Full incident lifecycle with drawer UI
- **Hackathon demo mode** — 3 preloaded demo scenarios (High Risk / Suspicious / Safe)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js Route Handlers (API) |
| Database | MongoDB Atlas |
| AI | OpenRouter (Mistral/Llama via API) |
| Speech | Web Speech API (browser-native) |

---

## Local Setup

```bash
git clone https://github.com/Manthan-13521/Risk_Radar.git
cd Risk_Radar
npm install
cp .env.example .env.local   # fill in your values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

```
MONGODB_URI=           # MongoDB Atlas connection string
OPENROUTER_API_KEY=    # OpenRouter API key
NEXT_PUBLIC_APP_URL=   # App base URL
```

---

## Demo Instructions

Three instant demo scenarios available in the scanner:

| Scenario | Input | Expected |
|----------|-------|----------|
| **High Risk** | `https://sbi-kyc-verify.example/login` | Risk 94/100 · CRITICAL |
| **Suspicious** | Delivery scam message | Risk ~65/100 · SUSPICIOUS |
| **Safe** | `https://www.google.com` | Risk <15/100 · SAFE |

Click the colored demo pills in the scanner to load each scenario instantly.

**Phishing Demo** — the main dashboard has a sandboxed "fake click" demo: it simulates a user clicking a phishing link and shows Risk_Radar intercepting before any navigation.

---

## How It Works

```
Input (URL / message / file)
  → Heuristic signals extracted
  → Threat DNA fingerprint compared
  → AI reasoning applied
  → Policy engine final decision
  → Risk Score + Confidence + Intent + Evidence returned
```

---

## Live Demo

[https://risk-radar-4yow.onrender.com](https://risk-radar-4yow.onrender.com)