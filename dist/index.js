"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  NexusClient: () => NexusClient
});
module.exports = __toCommonJS(index_exports);
var NexusClient = class {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || "https://nexusgateway.onrender.com/api").replace(/\/$/, "");
  }
  /**
   * Execute universal inference with Adaptive Routing.
   * @param message The user's prompt
   * @param options Engine configuration and BYOK settings
   */
  async chat(message, options) {
    var _a;
    const model = (options == null ? void 0 : options.model) || "llama-3.3-70b-versatile";
    const isStream = (_a = options == null ? void 0 : options.stream) != null ? _a : true;
    const endpoint = isStream ? "/chat/stream" : "/chat";
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.apiKey}`
    };
    if (options == null ? void 0 : options.providerKey) {
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
  async normalRequest(endpoint, body, headers) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
    await this.checkError(response);
    const data = await response.json();
    return data.choices[0].message.content;
  }
  async *streamRequest(endpoint, body, headers) {
    var _a, _b, _c;
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
      const lines = chunk.split("\n").filter((line) => line.trim() !== "");
      for (const line of lines) {
        if (line.includes("[DONE]")) return;
        if (line.startsWith("data: ")) {
          try {
            const jsonStr = line.replace("data: ", "").trim();
            const json = JSON.parse(jsonStr);
            const content = ((_c = (_b = (_a = json.choices) == null ? void 0 : _a[0]) == null ? void 0 : _b.delta) == null ? void 0 : _c.content) || "";
            if (content) yield content;
          } catch (e) {
            if (line.toLowerCase().includes("error")) yield `
[Nexus Error]: ${line}`;
          }
        }
      }
    }
  }
  async checkError(response) {
    if (response.ok) return;
    let errorDetail = "Inference failed";
    try {
      const errJson = await response.json();
      errorDetail = errJson.error || errJson.details || response.statusText;
    } catch (e) {
      errorDetail = response.statusText;
    }
    if (response.status === 401) throw new Error("\u274C Unauthorized: Invalid Nexus API Key");
    if (response.status === 402) throw new Error("\u26D4 Quota Exceeded: Upgrade to Pro or use a BYOK provider key.");
    if (response.status === 403) throw new Error("\u{1F6E1}\uFE0F Sovereign Shield: Request blocked by governance policy.");
    throw new Error(`\u{1F6A8} Nexus Gateway Error [${response.status}]: ${errorDetail}`);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NexusClient
});
