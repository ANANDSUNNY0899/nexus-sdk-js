#!/usr/bin/env node

import readline from 'readline';
import { NexusClient } from '../index';
import os from 'os';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// --- 1. INDUSTRIAL HEADER ---
console.log("\x1b[1;34m\n============================================");
console.log("    NEXUS GATEWAY - JS SOVEREIGN CLI v3.1");
console.log("    Inference.Control.Plane.Active");
console.log("============================================\x1b[0m");

const MODEL_ALIASES: Record<string, string> = {
    "gpt": "gpt-3.5-turbo",
    "gpt4": "gpt-4o",
    "llama": "llama-3.3-70b-versatile",
    "gemini": "gemini-1.5-flash",
};

let activeModel = "llama-3.3-70b-versatile"; // 🚀 Default to Groq Speed
let currentProviderKey: string | undefined = undefined;

const apiKey = process.env.NEXUS_API_KEY;

if (!apiKey) {
    rl.question("🔑 \x1b[1mEnter Nexus API Key:\x1b[0m ", (key) => {
        startChat(key.trim());
    });
} else {
    startChat(apiKey);
}

function startChat(key: string) {
    const client = new NexusClient({ apiKey: key });
    
    // Quick validation check
    console.log("Establish connection...");
    client.chat("ping", { stream: false }).then(() => {
        console.log("\x1b[1;32m✅ Gateway Connected! Protocol v3.1 Active.\x1b[0m");
        console.log("\x1b[90mShortcuts: /model [name], /key [sk-...], /clear, /exit\x1b[0m\n");
        ask(client);
    }).catch(() => {
        console.log("\x1b[1;31m❌ Access Denied: Invalid Infrastructure Key.\x1b[0m");
        process.exit(1);
    });
}

async function ask(client: NexusClient) {
    const statusLine = `\x1b[1;32m[ ${activeModel} ]${currentProviderKey ? ' [ 🔐 BYOK ]' : ''} > \x1b[0m`;
    
    rl.question(statusLine, async (input) => {
        const cmd = input.trim();
        if (!cmd) return ask(client);

        // --- 🚀 1. COMMAND PARSER ---
        const lowerCmd = cmd.toLowerCase();

        if (lowerCmd === '/exit' || lowerCmd === 'exit' || lowerCmd === 'quit') {
            console.log("\x1b[1;34mTerminating Session. Secure Data Plane Closed. 👋\x1b[0m");
            rl.close();
            process.exit(0);
        }

        if (lowerCmd === '/clear') {
            process.stdout.write('\x1b[2J\x1b[0f'); // Clear terminal
            return ask(client);
        }

        if (lowerCmd.startsWith('/model')) {
            const parts = cmd.split(" ");
            if (parts.length > 1) {
                const requested = parts[1].replace(/[\[\]]/g, "");
                activeModel = MODEL_ALIASES[requested] || requested;
                console.log(`🔄 Engine Switched -> \x1b[1;36m${activeModel}\x1b[0m\n`);
            } else {
                console.log("Usage: /model [gpt | llama | gemini | gpt4]\n");
            }
            return ask(client);
        }

        if (lowerCmd.startsWith('/key')) {
            const parts = cmd.split(" ");
            if (parts.length > 1) {
                currentProviderKey = parts[1];
                console.log("🔐 \x1b[1;33mProvider Key Injected. Bypassing Nexus credits...\x1b[0m\n");
            } else {
                console.log("Usage: /key [your-provider-api-key]\n");
            }
            return ask(client);
        }

        // --- 🚀 2. INFERENCE EXECUTION ---
        process.stdout.write("\x1b[1;34mNexus:\x1b[0m ");
        
        const startTime = Date.now();
        let fullResponse = "";

        try {
            const stream = await client.chat(cmd, { 
                model: activeModel, 
                stream: true, 
                providerKey: currentProviderKey 
            });

            for await (const chunk of stream) {
                process.stdout.write(chunk);
                fullResponse += chunk;
            }

            const latency = Date.now() - startTime;
            const tokens = Math.ceil(fullResponse.length / 4);
            console.log(`\n\n\x1b[90m[ ${latency}ms | ${tokens} tokens | Mode: ${currentProviderKey ? 'BYOK' : 'Credits'} ]\x1b[0m\n`);
            
        } catch (error: any) {
            console.error(`\n\x1b[1;31m${error.message}\x1b[0m\n`);
        }
        
        ask(client);
    });
}