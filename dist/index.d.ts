interface ChatOptions {
    model?: string;
    stream?: boolean;
}
export declare class NexusClient {
    private apiKey;
    private baseUrl;
    constructor(config: {
        apiKey: string;
        baseUrl?: string;
    });
    /**
     * Send a chat message to the AI.
     * @param message The user's prompt
     * @param options Model and Stream settings
     */
    chat(message: string, options?: ChatOptions): Promise<any>;
    private normalRequest;
    private streamRequest;
}
export {};
