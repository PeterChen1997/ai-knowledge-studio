# Knowledge Studio

A standalone Pages-first MVP for the **AI 知识生产工具** idea.

## What it does
- Score and rank candidate topics
- Turn a topic brief into a structured content pack
- Generate multiple content angles
- Produce a reusable prompt blueprint for downstream AI generation
- Reserve an **OpenAI-compatible** provider layer for future live model calls

## OpenAI-compatible API
The app now includes a provider config panel for any endpoint compatible with:
- `POST /chat/completions`
- OpenAI-style `choices[0].message.content`

Examples:
- OpenAI
- OpenRouter
- SiliconFlow
- One API
- self-hosted compatible gateways

> Current implementation stores the API key in browser `localStorage` for MVP testing only. Production deployment should move this to a backend proxy.

## Scripts
- `npm run dev`
- `npm test`
- `npm run build`
