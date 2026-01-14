#!/usr/bin/env node

import readline from 'readline';
import { NexusClient } from '../index';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("\n========================================");
console.log("   🤖 Nexus Gateway JS - Interactive CLI");
console.log("========================================");

const apiKey = process.env.NEXUS_API_KEY;

if (!apiKey) {
    rl.question("🔑 Enter your Nexus API Key: ", (key) => {
        startChat(key.trim());
    });
} else {
    startChat(apiKey);
}

function startChat(key: string) {
    const client = new NexusClient({ apiKey: key });
    console.log("\n✅ Connected! Type 'exit' to quit.\n");
    ask(client);
}

function ask(client: NexusClient) {
    rl.question("\x1b[1mYou:\x1b[0m ", async (input) => {
        if (input.toLowerCase() === 'exit') {
            console.log("Goodbye! 👋");
            rl.close();
            return;
        }

        process.stdout.write("\x1b[34mNexus:\x1b[0m ");
        
        try {
            const stream = await client.chat(input, { stream: true });
            for await (const chunk of stream) {
                process.stdout.write(chunk);
            }
            console.log("\n");
        } catch (error) {
            console.error("\n❌ Error:", error);
        }
        
        ask(client);
    });
}