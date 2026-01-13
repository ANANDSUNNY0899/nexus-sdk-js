import https from 'https';
import http from 'http';

interface ChatOptions {
  model?: string;
  stream?: boolean;
}

export class NexusClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: { apiKey: string; baseUrl?: string }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://nexusgateway.onrender.com/api";
  }

  /**
   * Send a chat message to the AI.
   * @param message The user's prompt
   * @param options Model and Stream settings
   */
  async chat(message: string, options?: ChatOptions): Promise<any> {
    const model = options?.model || "gpt-3.5-turbo";
    const isStream = options?.stream || false;
    const endpoint = isStream ? "/chat/stream" : "/chat";

    if (isStream) {
        return this.streamRequest(endpoint, { message, model });
    } else {
        return this.normalRequest(endpoint, { message, model });
    }
  }

  private async normalRequest(endpoint: string, body: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Nexus API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async *streamRequest(endpoint: string, body: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error(`Stream Error: ${response.status}`);
    if (!response.body) throw new Error("No response body");

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
            const json = JSON.parse(line.replace("data: ", ""));
            const content = json.choices?.[0]?.delta?.content || "";
            if (content) yield content;
          } catch (e) {}
        }
      }
    }
  }
}