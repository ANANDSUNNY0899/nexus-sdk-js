"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NexusClient = void 0;
class NexusClient {
    constructor(config) {
        this.apiKey = config.apiKey;
        this.baseUrl = config.baseUrl || "https://nexusgateway.onrender.com/api";
    }
    /**
     * Send a chat message to the AI.
     * @param message The user's prompt
     * @param options Model and Stream settings
     */
    async chat(message, options) {
        const model = (options === null || options === void 0 ? void 0 : options.model) || "gpt-3.5-turbo";
        const isStream = (options === null || options === void 0 ? void 0 : options.stream) || false;
        const endpoint = isStream ? "/chat/stream" : "/chat";
        if (isStream) {
            return this.streamRequest(endpoint, { message, model });
        }
        else {
            return this.normalRequest(endpoint, { message, model });
        }
    }
    async normalRequest(endpoint, body) {
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
    async *streamRequest(endpoint, body) {
        var _a, _b, _c;
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(body)
        });
        if (!response.ok)
            throw new Error(`Stream Error: ${response.status}`);
        if (!response.body)
            throw new Error("No response body");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            const chunk = decoder.decode(value);
            const lines = chunk.split("\n").filter(line => line.trim() !== "");
            for (const line of lines) {
                if (line.includes("[DONE]"))
                    return;
                if (line.startsWith("data: ")) {
                    try {
                        const json = JSON.parse(line.replace("data: ", ""));
                        const content = ((_c = (_b = (_a = json.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.delta) === null || _c === void 0 ? void 0 : _c.content) || "";
                        if (content)
                            yield content;
                    }
                    catch (e) { }
                }
            }
        }
    }
}
exports.NexusClient = NexusClient;
