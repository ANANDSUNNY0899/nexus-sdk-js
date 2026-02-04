// src/index.ts

export interface ChatOptions {
  model?: string;
  message: string;
  stream?: boolean;
  providerKey?: string; // User's personal API key (BYOK)
}

export class NexusClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: { apiKey: string; baseUrl?: string }) {
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || "https://nexusgateway.onrender.com/api").replace(/\/$/, "");
  }

  /**
   * Execute universal inference with Adaptive Routing & Sovereign Shield.
   */
  async chat(options: ChatOptions) {
    const { 
        model = "llama-3.3-70b-versatile", 
        message, 
        stream = true 
    } = options;

    const url = `${this.baseUrl}/chat/stream`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.apiKey}`,
    };

    // 🛡️ BYOK HEADER MAPPING
    if (options.providerKey) {
        const m = model.toLowerCase();
        if (m.includes("gpt")) headers["x-nexus-openai-key"] = options.providerKey;
        else if (m.includes("llama") || m.includes("mixtral")) headers["x-nexus-groq-key"] = options.providerKey;
        else if (m.includes("gemini")) headers["x-nexus-gemini-key"] = options.providerKey;
        else if (m.includes("claude")) headers["x-nexus-anthropic-key"] = options.providerKey;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ message, model, stream }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Inference Failed (${response.status})`);
    }

    return response.body; 
  }

  /**
   * Helper to verify API Key integrity
   */
  async validate_key(): Promise<boolean> {
    try {
        const res = await fetch(`${this.baseUrl}/stats`, {
            headers: { "Authorization": `Bearer ${this.apiKey}` }
        });
        return res.status === 200;
    } catch {
        return false;
    }
  }
}