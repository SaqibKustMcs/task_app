import { OnModuleInit } from '@nestjs/common';
export interface FcmPayload {
    title: string;
    body?: string;
    data?: Record<string, string>;
}
export interface SendToTokensResult {
    successCount: number;
    failureCount: number;
    failedTokenIndices: number[];
}
export declare class FirebaseService implements OnModuleInit {
    private messaging;
    private initialized;
    onModuleInit(): Promise<void>;
    private resolveCredentialsPath;
    private init;
    sendToToken(token: string, payload: FcmPayload): Promise<boolean>;
    sendToTokens(tokens: string[], payload: FcmPayload): Promise<SendToTokensResult>;
}
