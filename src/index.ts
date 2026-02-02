// src/index.ts

export interface ChatOptions {
  model?: string;
  stream?: boolean;
  providerKey?: string; // 🚀 NEW: BYOK Support
}

export class NexusClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: { apiKey: string; baseUrl?: string }) {
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || "https://nexusgateway.onrender.com/api").replace(/\/$/, "");
  }

  /**
   * Execute universal inference with Adaptive Routing.
   * @param message The user's prompt
   * @param options Engine configuration and BYOK settings
   */
  async chat(message: string, options?: ChatOptions): Promise<any> {
    const model = options?.model || "llama-3.3-70b-versatile"; // 🚀 THE NEW DEFAULT
    const isStream = options?.stream ?? true; // 🚀 Streaming enabled by default
    const endpoint = isStream ? "/chat/stream" : "/chat";

    // 1. Prepare Headers with BYOK Mapping
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.apiKey}`
    };

    if (options?.providerKey) {
        const m = model.toLowerCase();
        if (m.includes("gpt")) headers["x-nexus-openai-key"] = options.providerKey;
        else if (m.includes("llama") || m.includes("mixtral")) headers["x-nexus-groq-key"] = options.providerKey;
        else if (m.includes("gemini")) headers["x-nexus-gemini-key"] = options.providerKey;
    }

    const payload = { message, model, stream: isStream };

    if (isStream) {
        return this.streamRequest(endpoint, payload, headers);
    } else {
        return this.normalRequest(endpoint, payload, headers);
    }
  }

  private async normalRequest(endpoint: string, body: any, headers: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    await this.checkError(response);
    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async *streamRequest(endpoint: string, body: any, headers: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    await this.checkError(response);
    if (!response.body) throw new Error("Infrastructure Error: No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter(line => line.trim() !== "");

      for (const line of lines) {
        if (line.includes("[DONE]")) return;
        if (line.startsWith("data: ")) {
          try {
            const jsonStr = line.replace("data: ", "").trim();
            const json = JSON.parse(jsonStr);
            
            // Extract content from unified OpenAI format
            const content = json.choices?.[0]?.delta?.content || "";
            if (content) yield content;
          } catch (e) {
            // Handle raw error messages if they bypass standard JSON
            if (line.toLowerCase().includes("error")) yield `\n[Nexus Error]: ${line}`;
          }
        }
      }
    }
  }

  private async checkError(response: Response) {
    if (response.ok) return;

    let errorDetail = "Inference failed";
    try {
        const errJson = await response.json();
        errorDetail = errJson.error || errJson.details || response.statusText;
    } catch (e) {
        errorDetail = response.statusText;
    }

    if (response.status === 401) throw new Error("❌ Unauthorized: Invalid Nexus API Key");
    if (response.status === 402) throw new Error("⛔ Quota Exceeded: Upgrade to Pro or use a BYOK provider key.");
    if (response.status === 403) throw new Error("🛡️ Sovereign Shield: Request blocked by governance policy.");
    
    throw new Error(`🚨 Nexus Gateway Error [${response.status}]: ${errorDetail}`);
  }
}