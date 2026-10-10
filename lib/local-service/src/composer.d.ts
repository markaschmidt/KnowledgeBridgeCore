import { type DocumentChoice } from '../../core/src/index.js';
import type { KnowledgeService } from './index.js';
import { z } from 'zod';
export declare const composerActionSchema: z.ZodObject<{
    action: z.ZodEnum<["browse", "commit", "close"]>;
    sessionId: z.ZodString;
    vaultId: z.ZodOptional<z.ZodString>;
    query: z.ZodDefault<z.ZodString>;
    offset: z.ZodDefault<z.ZodNumber>;
    paths: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strict", z.ZodTypeAny, {
    action: "browse" | "commit" | "close";
    sessionId: string;
    query: string;
    offset: number;
    paths: string[];
    vaultId?: string | undefined;
}, {
    action: "browse" | "commit" | "close";
    sessionId: string;
    vaultId?: string | undefined;
    query?: string | undefined;
    offset?: number | undefined;
    paths?: string[] | undefined;
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
    begin(): Promise<{
        sessionId: `${string}-${string}-${string}-${string}-${string}`;
        workspaceId: string;
        vaults: import("../../core/src/selection.js").VaultChoice[];
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
    } | {
        closed: boolean;
    }>;
}
