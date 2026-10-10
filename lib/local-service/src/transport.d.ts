import { z } from 'zod';
import { type MutationRequest, type ChangeResult } from './changes.js';
export declare const endpointSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    port: z.ZodNumber;
    token: z.ZodString;
}, "strict", z.ZodTypeAny, {
    version: 1;
    port: number;
    token: string;
}, {
    version: 1;
    port: number;
    token: string;
}>;
export type BridgeEndpoint = z.infer<typeof endpointSchema>;
export declare function publishEndpoint(root: string, endpoint: BridgeEndpoint): Promise<void>;
export declare function removeEndpoint(root: string, token: string): Promise<void>;
export declare function readEndpoint(root: string): Promise<BridgeEndpoint>;
export declare function sendMutation(root: string, input: MutationRequest): Promise<ChangeResult>;
