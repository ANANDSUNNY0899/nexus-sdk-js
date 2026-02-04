# 🔷 Nexus Gateway Node.js SDK (v3.1.3)

**The High-Performance Sovereign Infrastructure for Node.js & TypeScript.**

Reduce LLM latency by 95% and costs by 90% with a single unified data plane.

[![NPM version](https://img.shields.io/npm/v/nexus-gateway-js.svg)](https://www.npmjs.com/package/nexus-gateway-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Infrastructure](https://img.shields.io/badge/Infrastructure-v3.1.0--Stable-indigo)](https://nexus-gateway.org)

---

## ⚡ Key Superpowers
- **Hybrid Semantic Caching:** Sub-5ms response times. Stop paying for the same API call twice.
- **Adaptive Discovery:** Automatically heals provider 404 errors (Gemini/Google) in real-time.
- **Sovereign Shield:** Deterministic PII redaction and governance before data leaves your server.
- **Universal SDK:** Single interface for OpenAI, Groq, Gemini, and Anthropic.

## 📦 Installation

```bash
npm install nexus-gateway-js

```
# 🔐 Bring Your Own Key (BYOK)
Nexus Gateway allows you to utilize our high-speed caching and observability layer using your own provider billing. BYOK requests bypass Nexus credit limits.

```JavaScript
import { NexusClient } from 'nexus-gateway-js';

const client = new NexusClient({
  apiKey: "nk-your-nexus-key"
});

async function main() {
  // Use GPT-4o with your own OpenAI Key
  const stream = await client.chat("Analyze this technical debt...", {
    model: "gpt-4o",
    providerKey: "sk-proj-your-personal-openai-key", // 🚀 BYOK Injection
    stream: true
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk);
  }
}
```
# 🚀 CLI Tool: Sovereign Console
Node.js SDK includes an interactive terminal for real-time inference.
```bash
# Launch the Nexus Shell
npx nexus-chat
```
## Inside the CLI:

  * /key [sk-...] - Inject a provider key to unlock Premium models (BYOK mode).
  * model=[name] - Switch engine (e.g., model=llama or model=gemini).
  * /exit - Terminate secure session.

# 🛠️ Usage Examples
1. Real-Time Streaming (Default)
```JavaScript
const stream = await client.chat("Explain the Aho-Corasick algorithm.");

for await (const chunk of stream) {
  console.log(chunk);
}
```
2. Standard Sync Chat
```JavaScript
const response = await client.chat("What is the capital of France?", { 
    stream: false 
});
console.log(response); // "Paris"
```
```
🤖 Supported Model Engines
  Provider	Alias	Default Model
  Groq	llama	llama-3.3-70b-versatile
  Google	gemini	gemini-1.5-flash
  OpenAI	gpt	gpt-3.5-turbo
  OpenAI Pro	pro	gpt-4o
```

📊 Infrastructure Benchmarks
Feature	Standard API	Nexus Gateway
Latency	1200ms - 3000ms	5ms (Cache Hit)
Cost	100% Billing	$0.00 (Cache Hit)
Failover	Manual	Autonomous Self-Healing

```

🔑 Authentication
To use this SDK, you require a valid API Key.
Get your Free API Key here : https://www.nexus-gateway.org/
```
License
MIT License © 2025 Sunny Anand | 📘 Documentation: https://www.nexus-gateway.org/docs  | 💻 GitHub Repository: https://github.com/ANANDSUNNY0899/NexusGateway

```