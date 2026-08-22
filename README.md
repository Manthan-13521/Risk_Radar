# ShieldSense

Your Digital Immune System to safely investigate suspicious links, messages, and files.

## Features

* URL investigation
* Message investigation
* File analysis (metadata & text extraction)
* Risk/Confidence Scoring
* Attacker Intent Assessment
* Threat DNA (Behavioral Similarity detection)
* Scan History
* Simulated Safe Actions

## Architecture

Input → Heuristics → AI Reasoning → Policy → Threat DNA → MongoDB

## Stack

Next.js, TypeScript, Tailwind, MongoDB Atlas, OpenRouter, Zod

## Local Setup

```bash
npm install
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env.local` and add:
- `MONGODB_URI`: Your MongoDB connection string
- `OPENROUTER_API_KEY`: Your OpenRouter API key
- `OPENROUTER_MODEL`: Model ID (e.g., google/gemini-2.5-flash)

## Deployment

Deploy using Render. Make sure to supply the exact same environment variables in your Render project dashboard.

## Security Limitations
This is a hackathon prototype. Files are NOT actually executed or detonated in a sandbox. Mitigation actions (Quarantine, Block) are purely simulated UI states and do not alter your host machine's settings.
