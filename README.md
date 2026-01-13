# 🔷 Nexus Gateway Node.js SDK

The official Node.js/TypeScript client for **Nexus Gateway**.

This library provides a simple interface to interact with the Nexus Gateway API, enabling **Semantic Caching**, **Multi-Model Routing**, and **Automated Cost Optimization** for LLM applications.

---

## 📦 Installation

```bash
npm install nexus-gateway-js

```
🔑 Authentication
To use this SDK, you require a valid API Key.
Get your Free API Key here : https://www.nexus-gateway.org/

🚀 Usage
1. Basic Chat
Automatically routes to GPT-3.5 by default. Caches responses to save money.
```bash

import { NexusClient } from 'nexus-gateway-js';

const client = new NexusClient({
  apiKey: "nk-your-key-here"
});

async function main() {
  const response = await client.chat("Explain quantum computing.");
  console.log(response);
}

main();
```
2. Real-Time Streaming (ChatGPT Style)
Streams text chunks as they arrive.
```bash
async function stream() {
  const stream = await client.chat("Tell me a story", { stream: true });

  for await (const chunk of stream) {
    process.stdout.write(chunk); // Print without newline
  }
}
```

3. Switching Models (Universal Router)
Switch between OpenAI and Anthropic instantly.
```bash
// Use Anthropic Claude 3
const response = await client.chat("Hello", { model: "claude-3-opus-20240229" });

// Use OpenAI GPT-4
const response = await client.chat("Hello", { model: "gpt-4" });

```
# ✨ Features

⚡ Semantic Caching: Responses are cached using vector embeddings (Pinecone).

🔌 Universal Interface: Switch between OpenAI and Anthropic models instantly.

🛡️ Rate Limiting: Built-in protection against API abuse.

💳 Automated Billing: Usage is tracked automatically via the gateway.

```
License
MIT License © 2025 Sunny Anand
```