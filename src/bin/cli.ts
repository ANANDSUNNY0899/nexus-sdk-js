#!/usr/bin/env node

import readline from 'readline';
import { NexusClient } from '../index';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const MODEL_MAP: Record<string, string> = {
    "gemini": "gemini-1.5-flash",
    "google": "gemini-1.5-flash",
    "llama": "llama-3.3-70b-versatile",
    "groq": "llama-3.3-70b-versatile",
    "gpt": "gpt-3.5-turbo",
    "openai": "gpt-3.5-turbo",
    "gpt4": "gpt-4o",
    "pro": "gpt-4o",
    "claude": "claude-3-5-sonnet-latest"
};

console.log("\x1b[1;34m\n============================================");
console.log("    NEXUS GATEWAY - JS SOVEREIGN CLI v3.1.3");
console.log("    Inference.Control.Plane.Active");
console.log("============================================\x1b[0m");

let activeModel = "llama-3.3-70b-versatile";
let currentProviderKey: string | undefined = undefined;

const apiKey = process.env.NEXUS_API_KEY;

if (!apiKey) {
    rl.question("🔑 \x1b[1mEnter Nexus API Key:\x1b[0m ", (key) => startChat(key.trim()));
} else {
    startChat(apiKey);
}

async function startChat(key: string) {
    const client = new NexusClient({ apiKey: key });
    process.stdout.write("🛰️  Establishing connection...");
    
    const isValid = await client.validate_key();
    if (!isValid) {
        console.log("\n\x1b[1;31m❌ Access Denied: Invalid Key.\x1b[0m");
        process.exit(1);
    }

    console.log("\r\x1b[1;32m✅ Gateway Connected! Protocol v3.1 Active.\x1b[0m");
    console.log("\x1b[90mCommands: model=[name], /key [sk-...], /clear, /exit\x1b[0m\n");
    ask(client);
}

async function ask(client: NexusClient) {
    const statusLine = `\x1b[1;32m[ ${activeModel} ]${currentProviderKey ? ' [ 🔐 BYOK ]' : ''} > \x1b[0m`;
    
    rl.question(statusLine, async (input) => {
        const rawInput = input.trim();
        const cmdLower = rawInput.toLowerCase();

        if (!rawInput) return ask(client);

        // --- 🚀 1. COMMAND INTERCEPTOR ---
        
        if (cmdLower.startsWith('/key')) {
            const parts = rawInput.split(" ");
            if (parts.length > 1) {
                currentProviderKey = parts[1].trim();
                console.log("🔐 \x1b[1;33mProvider Key Injected. Bypassing Nexus credits...\x1b[0m\n");
            } else {
                currentProviderKey = undefined;
                console.log("🔓 \x1b[1;33mProvider Key Removed.\x1b[0m\n");
            }
            return ask(client);
        }

        const isModelChange = cmdLower.includes("model") && (cmdLower.includes("=") || cmdLower.includes("[") || cmdLower.includes("/") || cmdLower.split(" ").length > 1);
        if (isModelChange) {
            const cleanVal = cmdLower.replace(/model| |=|\[|\]|\//g, "").trim();
            if (cleanVal) {
                activeModel = MODEL_MAP[cleanVal] || cleanVal;
                console.log(`🔄 \x1b[1;36mEngine Switched -> ${activeModel}\x1b[0m\n`);
                return ask(client);
            }
        }

        if (cmdLower === 'exit' || cmdLower === '/exit' || cmdLower === 'quit') {
            console.log("\x1b[1;34mTerminating Session. Secure Data Plane Closed.\x1b[0m");
            process.exit(0);
        }

        if (cmdLower === '/clear' || cmdLower === 'clear') {
            process.stdout.write('\x1b[2J\x1b[0f');
            return ask(client);
        }

        // --- 🚀 2. INFERENCE EXECUTION ---
        process.stdout.write("\x1b[34mNexus:\x1b[0m ");
        
        const startTime = Date.now();
        let fullResponse = "";
        let hasReceivedData = false;

        try {
            const stream = await client.chat({ 
                message: rawInput, 
                model: activeModel,
                providerKey: currentProviderKey 
            });

            const reader = stream?.getReader();
            const decoder = new TextDecoder();

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value);
                    const lines = chunk.split("\n");
                    for (const line of lines) {
                        if (line.startsWith("data: ") && !line.includes("[DONE]")) {
                            try {
                                const data = JSON.parse(line.replace("data: ", ""));
                                // 🚀 AGGRESSIVE EXTRACTION (Handles all providers)
                                const content = data.choices?.[0]?.delta?.content || 
                                                data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                                if (content) {
                                    process.stdout.write(content);
                                    fullResponse += content;
                                    hasReceivedData = true;
                                }
                            } catch (e) {}
                        }
                    }
                }
            }

            if (!hasReceivedData) {
                process.stdout.write("\x1b[33mNo response data received from provider.\x1b[0m");
            }

            // 🚀 GUARANTEED TELEMETRY LINE
            const latency = Date.now() - startTime;
            const tokens = Math.ceil(fullResponse.length / 4);
            console.log(`\n\n\x1b[90m[ ${latency}ms | ${tokens} tokens | Layer: Infrastructure ]\x1b[0m\n`);

        } catch (error: any) {
            console.error(`\n\x1b[1;31m${error.message}\x1b[0m\n`);
        }
        
        ask(client);
    });
}