import { type Registry, type WorkspaceProfile } from '../../core/src/index.js';
export declare const digest: (value: string) => string;
export declare const profileDigest: (profile: WorkspaceProfile) => string;
export declare function saveJson(path: string, data: unknown): Promise<void>;
export declare function readRegistry(path: string): Promise<Registry>;
export declare function readProfile(path: string): Promise<WorkspaceProfile>;
export declare function approveProfile(registryPath: string, profilePath: string): Promise<void>;
export declare function loadApproved(registryPath: string, profilePath: string): Promise<{
    registry: {
        version: 1;
        vaults: {
            name: string;
            id: string;
            root: string;
            rhen: "auto" | "required";
        }[];
        approvals: Record<string, string>;
    };
    profile: {
        version: 1;
        workspaceId: string;
        name: string;
        scopes: {
            vaultId: string;
            include: string[];
            exclude: string[];
            tagsAny: string[];
            captureFolder?: string | undefined;
        }[];
        retrieval: {
            maxResults: number;
            maxChars: number;
            graphHops: 0 | 1;
        };
    };
    bindings: {
        scope: {
            vaultId: string;
            include: string[];
            exclude: string[];
            tagsAny: string[];
            captureFolder?: string | undefined;
        };
        vault: {
            name: string;
            id: string;
            root: string;
            rhen: "auto" | "required";
        };
    }[];
}>;
