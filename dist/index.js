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
   * Execute universal inference with Adaptive Routing & Sovereign Shield.
   */
  async chat(options) {
    const {
      model = "llama-3.3-70b-versatile",
      message,
      stream = true
    } = options;
    const url = `${this.baseUrl}/chat/stream`;
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.apiKey}`
    };
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
      body: JSON.stringify({ message, model, stream })
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
  async validate_key() {
    try {
      const res = await fetch(`${this.baseUrl}/stats`, {
        headers: { "Authorization": `Bearer ${this.apiKey}` }
      });
      return res.status === 200;
    } catch {
      return false;
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NexusClient
});
