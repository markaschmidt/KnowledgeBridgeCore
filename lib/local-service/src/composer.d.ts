import { type DocumentChoice } from '../../core/src/index.js';
import type { KnowledgeService } from './index.js';
import { z } from 'zod';
import { type ChangePreview } from './changes.js';
export declare const composerSeedSchema: z.ZodObject<{
    operation: z.ZodDefault<z.ZodEnum<["read", "create", "update", "delete"]>>;
    content: z.ZodOptional<z.ZodString>;
    query: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    operation: "update" | "delete" | "read" | "create";
    content?: string | undefined;
    query?: string | undefined;
}, {
    operation?: "update" | "delete" | "read" | "create" | undefined;
    content?: string | undefined;
    query?: string | undefined;
}>;
export type ComposerSeed = z.input<typeof composerSeedSchema>;
export declare const composerActionSchema: z.ZodObject<{
    action: z.ZodEnum<["browse", "commit", "close", "load", "preview", "apply"]>;
    sessionId: z.ZodString;
    vaultId: z.ZodOptional<z.ZodString>;
    query: z.ZodDefault<z.ZodString>;
    offset: z.ZodDefault<z.ZodNumber>;
    paths: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    operation: z.ZodOptional<z.ZodEnum<["create", "update", "delete"]>>;
    path: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    reviewId: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    action: "browse" | "commit" | "close" | "load" | "preview" | "apply";
    query: string;
    sessionId: string;
    offset: number;
    paths: string[];
    path?: string | undefined;
    vaultId?: string | undefined;
    operation?: "update" | "delete" | "create" | undefined;
    content?: string | undefined;
    reviewId?: string | undefined;
}, {
    action: "browse" | "commit" | "close" | "load" | "preview" | "apply";
    sessionId: string;
    path?: string | undefined;
    vaultId?: string | undefined;
    operation?: "update" | "delete" | "create" | undefined;
    content?: string | undefined;
    query?: string | undefined;
    offset?: number | undefined;
    paths?: string[] | undefined;
    reviewId?: string | undefined;
}>;
export type ComposerInitial = Awaited<ReturnType<ComposerSessions['begin']>> & {
    query?: string;
};
export type ComposerPage = Awaited<ReturnType<ComposerSessions['browse']>>;
export type ComposerBundle = Awaited<ReturnType<ComposerSessions['commit']>>;
export declare const COMPOSER_PAGE_SIZE = 25;
/** UI instance state is scoped to a random handle, never to the last active chat. */
export declare class ComposerSessions {
    private service;
    private now;
    private sessions;
    constructor(service: KnowledgeService, now?: () => number);
    begin(seed?: ComposerSeed): Promise<{
        operation: "update" | "delete" | "read" | "create";
        content?: string | undefined;
        query?: string | undefined;
        sessionId: `${string}-${string}-${string}-${string}-${string}`;
        workspaceId: string;
        vaults: {
            captureFolder: string | undefined;
            write: {
                update: boolean;
                delete: boolean;
            } | undefined;
            tagsAny: string[];
            id: string;
            name: string;
        }[];
        maxDocuments: number;
    }>;
    private session;
    browse(id: string, vaultId: string, query: string, offset: number): Promise<{
        documents: DocumentChoice[];
        total: number;
        offset: number;
        pageSize: number;
    }>;
    commit(id: string, vaultId: string, paths: string[]): Promise<{
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
    close(id: string): void;
    load(id: string, vaultId: string, path: string): Promise<{
        content: string;
    }>;
    preview(id: string, vaultId: string, operation: 'create' | 'update' | 'delete', path: string, content?: string): Promise<ChangePreview & {
        reviewId: string;
    }>;
    apply(id: string, reviewId: string): Promise<{
        path: string;
        vaultId: string;
        status: "applied";
        operation: "update" | "delete" | "create";
        revision?: string | undefined;
        recovery?: string | undefined;
    }>;
    dispatch(input: unknown): Promise<{
        documents: DocumentChoice[];
        total: number;
        offset: number;
        pageSize: number;
    } | {
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
    } | (ChangePreview & {
        reviewId: string;
    }) | {
        path: string;
        vaultId: string;
        status: "applied";
        operation: "update" | "delete" | "create";
        revision?: string | undefined;
        recovery?: string | undefined;
    } | {
        content: string;
    } | {
        closed: boolean;
    }>;
}
