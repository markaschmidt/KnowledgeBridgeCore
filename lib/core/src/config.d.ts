import { z } from 'zod';
export declare const idSchema: z.ZodString;
export declare function notePath(value: string): string;
export declare const scopeSchema: z.ZodObject<{
    vaultId: z.ZodString;
    include: z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">;
    exclude: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
    tagsAny: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    captureFolder: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
}, "strict", z.ZodTypeAny, {
    vaultId: string;
    include: string[];
    exclude: string[];
    tagsAny: string[];
    captureFolder?: string | undefined;
}, {
    vaultId: string;
    include: string[];
    exclude?: string[] | undefined;
    tagsAny?: string[] | undefined;
    captureFolder?: string | undefined;
}>;
export declare const profileSchema: z.ZodEffects<z.ZodObject<{
    version: z.ZodLiteral<1>;
    workspaceId: z.ZodString;
    name: z.ZodString;
    scopes: z.ZodArray<z.ZodObject<{
        vaultId: z.ZodString;
        include: z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">;
        exclude: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
        tagsAny: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        captureFolder: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    }, "strict", z.ZodTypeAny, {
        vaultId: string;
        include: string[];
        exclude: string[];
        tagsAny: string[];
        captureFolder?: string | undefined;
    }, {
        vaultId: string;
        include: string[];
        exclude?: string[] | undefined;
        tagsAny?: string[] | undefined;
        captureFolder?: string | undefined;
    }>, "many">;
    retrieval: z.ZodDefault<z.ZodObject<{
        maxResults: z.ZodDefault<z.ZodNumber>;
        maxChars: z.ZodDefault<z.ZodNumber>;
        graphHops: z.ZodDefault<z.ZodUnion<[z.ZodLiteral<0>, z.ZodLiteral<1>]>>;
    }, "strict", z.ZodTypeAny, {
        maxResults: number;
        maxChars: number;
        graphHops: 0 | 1;
    }, {
        maxResults?: number | undefined;
        maxChars?: number | undefined;
        graphHops?: 0 | 1 | undefined;
    }>>;
}, "strict", z.ZodTypeAny, {
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
}, {
    version: 1;
    workspaceId: string;
    name: string;
    scopes: {
        vaultId: string;
        include: string[];
        exclude?: string[] | undefined;
        tagsAny?: string[] | undefined;
        captureFolder?: string | undefined;
    }[];
    retrieval?: {
        maxResults?: number | undefined;
        maxChars?: number | undefined;
        graphHops?: 0 | 1 | undefined;
    } | undefined;
}>, {
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
}, {
    version: 1;
    workspaceId: string;
    name: string;
    scopes: {
        vaultId: string;
        include: string[];
        exclude?: string[] | undefined;
        tagsAny?: string[] | undefined;
        captureFolder?: string | undefined;
    }[];
    retrieval?: {
        maxResults?: number | undefined;
        maxChars?: number | undefined;
        graphHops?: 0 | 1 | undefined;
    } | undefined;
}>;
export declare const vaultSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    root: z.ZodString;
    rhen: z.ZodDefault<z.ZodEnum<["auto", "required"]>>;
}, "strict", z.ZodTypeAny, {
    name: string;
    id: string;
    root: string;
    rhen: "auto" | "required";
}, {
    name: string;
    id: string;
    root: string;
    rhen?: "auto" | "required" | undefined;
}>;
export declare const registrySchema: z.ZodEffects<z.ZodObject<{
    version: z.ZodLiteral<1>;
    vaults: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        root: z.ZodString;
        rhen: z.ZodDefault<z.ZodEnum<["auto", "required"]>>;
    }, "strict", z.ZodTypeAny, {
        name: string;
        id: string;
        root: string;
        rhen: "auto" | "required";
    }, {
        name: string;
        id: string;
        root: string;
        rhen?: "auto" | "required" | undefined;
    }>, "many">;
    approvals: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strict", z.ZodTypeAny, {
    version: 1;
    vaults: {
        name: string;
        id: string;
        root: string;
        rhen: "auto" | "required";
    }[];
    approvals: Record<string, string>;
}, {
    version: 1;
    vaults: {
        name: string;
        id: string;
        root: string;
        rhen?: "auto" | "required" | undefined;
    }[];
    approvals?: Record<string, string> | undefined;
}>, {
    version: 1;
    vaults: {
        name: string;
        id: string;
        root: string;
        rhen: "auto" | "required";
    }[];
    approvals: Record<string, string>;
}, {
    version: 1;
    vaults: {
        name: string;
        id: string;
        root: string;
        rhen?: "auto" | "required" | undefined;
    }[];
    approvals?: Record<string, string> | undefined;
}>;
export type WorkspaceProfile = z.infer<typeof profileSchema>;
export type VaultRegistration = z.infer<typeof vaultSchema>;
export type Registry = z.infer<typeof registrySchema>;
export type VaultScope = z.infer<typeof scopeSchema>;
export declare function pathInScope(path: string, scope: VaultScope): boolean;
export declare const emptyRegistry: () => Registry;
