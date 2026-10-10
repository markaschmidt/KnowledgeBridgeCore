import { z } from 'zod';
import type { KnowledgeService } from './index.js';
export declare const changeOperation: z.ZodEnum<["create", "update", "delete"]>;
export declare const changeDraftSchema: z.ZodObject<{
    operation: z.ZodEnum<["create", "update", "delete"]>;
    vaultId: z.ZodString;
    path: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
    expectedRevision: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    path: string;
    vaultId: string;
    operation: "update" | "delete" | "create";
    content?: string | undefined;
    expectedRevision?: string | undefined;
}, {
    path: string;
    vaultId: string;
    operation: "update" | "delete" | "create";
    content?: string | undefined;
    expectedRevision?: string | undefined;
}>;
export type ChangeDraft = z.infer<typeof changeDraftSchema>;
export interface ChangePreview {
    operation: ChangeDraft['operation'];
    vaultId: string;
    path: string;
    before: string | null;
    after: string | null;
    expectedRevision?: string;
    scopeRevision: string;
    policyRevision: string;
}
export declare const mutationRequestSchema: z.ZodObject<{
    operation: z.ZodEnum<["create", "update", "delete"]>;
    vaultId: z.ZodString;
    path: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
    expectedRevision: z.ZodOptional<z.ZodString>;
} & {
    requestId: z.ZodString;
    scopeRevision: z.ZodString;
    policyRevision: z.ZodUnion<[z.ZodLiteral<"absent">, z.ZodString]>;
    profilePath: z.ZodString;
    registryPath: z.ZodString;
}, "strict", z.ZodTypeAny, {
    path: string;
    vaultId: string;
    scopeRevision: string;
    operation: "update" | "delete" | "create";
    requestId: string;
    policyRevision: string;
    profilePath: string;
    registryPath: string;
    content?: string | undefined;
    expectedRevision?: string | undefined;
}, {
    path: string;
    vaultId: string;
    scopeRevision: string;
    operation: "update" | "delete" | "create";
    requestId: string;
    policyRevision: string;
    profilePath: string;
    registryPath: string;
    content?: string | undefined;
    expectedRevision?: string | undefined;
}>;
export type MutationRequest = z.infer<typeof mutationRequestSchema>;
export declare const changeResultSchema: z.ZodObject<{
    status: z.ZodLiteral<"applied">;
    operation: z.ZodEnum<["create", "update", "delete"]>;
    vaultId: z.ZodString;
    path: z.ZodString;
    revision: z.ZodOptional<z.ZodString>;
    recovery: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    path: string;
    vaultId: string;
    status: "applied";
    operation: "update" | "delete" | "create";
    revision?: string | undefined;
    recovery?: string | undefined;
}, {
    path: string;
    vaultId: string;
    status: "applied";
    operation: "update" | "delete" | "create";
    revision?: string | undefined;
    recovery?: string | undefined;
}>;
export type ChangeResult = z.infer<typeof changeResultSchema>;
/** Complete text only: a truncated retrieval result must never replace a note. */
export declare function prepareChange(service: KnowledgeService, input: ChangeDraft, expectedScope: string): Promise<ChangePreview>;
export declare function applyChange(service: KnowledgeService, preview: ChangePreview, requestId: string): Promise<ChangeResult>;
