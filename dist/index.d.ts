interface ChatOptions {
    model?: string;
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
     * Execute universal inference with Adaptive Routing.
     * @param message The user's prompt
     * @param options Engine configuration and BYOK settings
     */
    chat(message: string, options?: ChatOptions): Promise<any>;
    private normalRequest;
    private streamRequest;
    private checkError;
}

export { type ChatOptions, NexusClient };
