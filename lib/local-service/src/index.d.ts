import { z } from 'zod';
import { type Note, type PickerScope, type DocumentChoice } from '../../core/src/index.js';
import { loadApproved } from './config.js';
export * from './config.js';
export * from './files.js';
export * from './composer.js';
export * from './changes.js';
export * from './transport.js';
export declare const captureSchema: z.ZodObject<{
    vaultId: z.ZodString;
    requestId: z.ZodString;
    title: z.ZodString;
    content: z.ZodString;
    source: z.ZodEnum<["cursor", "vscode", "obsidian", "mcp"]>;
    sessionId: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    vaultId: string;
    title: string;
    content: string;
    requestId: string;
    source: "cursor" | "vscode" | "obsidian" | "mcp";
    sessionId?: string | undefined;
}, {
    vaultId: string;
    title: string;
    content: string;
    requestId: string;
    source: "cursor" | "vscode" | "obsidian" | "mcp";
    sessionId?: string | undefined;
}>;
export type Capture = z.infer<typeof captureSchema>;
export declare class KnowledgeService {
    readonly registryPath: string;
    readonly profilePath: string;
    private cache;
    constructor(registryPath: string, profilePath: string);
    status(): Promise<{
        workspaceId: string;
        name: string;
        scopes: {
            vaultId: string;
            include: string[];
            exclude: string[];
            tagsAny: string[];
            captureFolder?: string | undefined;
            write?: {
                update: boolean;
                delete: boolean;
            } | undefined;
        }[];
        retrieval: {
            maxResults: number;
            maxChars: number;
            graphHops: 0 | 1;
        };
        mode: string;
    }>;
    snapshot(selectedVaultId?: string): Promise<{
        notes: Note[];
        profile: Awaited<ReturnType<typeof loadApproved>>['profile'];
    }>;
    pickerScope(): Promise<PickerScope>;
    private assertPickerScope;
    pickerDocuments(vaultId: string, expectedScope: string): Promise<DocumentChoice[]>;
    selectedContext(vaultId: string, choices: DocumentChoice[], expectedScope: string): Promise<{
        status: "selected";
        workspaceId: string;
        contentIsUntrusted: boolean;
        selectionOnly: boolean;
        documents: {
            vaultId: string;
            path: string;
            title: string;
            revision: string;
            uri: string;
            text: string;
            startLine: number;
            endLine: number;
            totalCharacters: number;
            truncated: boolean;
        }[];
    }>;
    private validateResults;
    search(query: string): Promise<{
        workspaceId: string;
        hits: import("../../core/src/retrieval.js").SearchHit[];
        contentIsUntrusted: boolean;
    }>;
    read(vaultId: string, path: string): Promise<{
        workspaceId: string;
        vaultId: string;
        path: string;
        title: string;
        revision: string;
        text: string;
        truncated: boolean;
        contentIsUntrusted: boolean;
    }>;
    neighbors(vaultId: string, path: string): Promise<{
        outgoing: {
            vaultId: string;
            path: string;
            title: string;
            revision: string;
        }[];
        backlinks: {
            vaultId: string;
            path: string;
            title: string;
            revision: string;
        }[];
    }>;
    capture(input: Capture): Promise<{
        vaultId: string;
        path: string;
        created: boolean;
        revision: string;
    }>;
}
