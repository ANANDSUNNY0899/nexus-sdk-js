interface ChatOptions {
    model?: string;
    message: string;
    stream?: boolean;
    providerKey?: string;
}
declare class NexusClient {
    private apiKey;
    private baseUrl;
    constructor(config: {
        apiKey: string;
        baseUrl?: string;
    });
    /**
     * Execute universal inference with Adaptive Routing & Sovereign Shield.
     */
    chat(options: ChatOptions): Promise<ReadableStream<Uint8Array<ArrayBuffer>> | null>;
    /**
     * Helper to verify API Key integrity
     */
    validate_key(): Promise<boolean>;
}

export { type ChatOptions, NexusClient };
