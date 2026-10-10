import { z } from 'zod';
import { lstat } from 'node:fs/promises';
import { notePath, parseNote, pathInScope } from '../../core/src/index.js';
import { readRhenPolicy, isSealed } from '../../rhen-adapter/src/index.js';
import { digest, loadApproved } from './config.js';
import { readNoteFile, safePath } from './files.js';
import { sendMutation } from './transport.js';
export const changeOperation = z.enum(['create', 'update', 'delete']);
export const changeDraftSchema = z
    .object({
    operation: changeOperation,
    vaultId: z.string().min(1).max(80),
    path: z.string().min(1).max(1000),
    content: z.string().max(40000).optional(),
    expectedRevision: z
        .string()
        .regex(/^[a-f0-9]{64}$/)
        .optional(),
})
    .strict();
export const mutationRequestSchema = changeDraftSchema.extend({
    requestId: z.string().uuid(),
    scopeRevision: z.string().regex(/^[a-f0-9]{64}$/),
    policyRevision: z.union([z.literal('absent'), z.string().regex(/^[a-f0-9]{64}$/)]),
    profilePath: z.string().min(1).max(4000),
    registryPath: z.string().min(1).max(4000),
});
export const changeResultSchema = z
    .object({
    status: z.literal('applied'),
    operation: changeOperation,
    vaultId: z.string(),
    path: z.string(),
    revision: z.string().optional(),
    recovery: z.string().optional(),
})
    .strict();
/** Complete text only: a truncated retrieval result must never replace a note. */
export async function prepareChange(service, input, expectedScope) {
    const data = changeDraftSchema.parse(input);
    const path = notePath(data.path);
    const scopeState = await service.pickerScope();
    if (scopeState.revision !== expectedScope)
        throw new Error('Workspace scope changed. Reopen the builder.');
    const { bindings } = await loadApproved(service.registryPath, service.profilePath);
    const binding = bindings.find((b) => b.vault.id === data.vaultId);
    if (!binding || !pathInScope(path, binding.scope))
        throw new Error('Note unavailable in this workspace scope');
    const { scope, vault } = binding;
    if (data.operation === 'create') {
        if (!scope.captureFolder || !path.startsWith(scope.captureFolder + '/'))
            throw new Error('New notes must be inside the configured capture folder');
        if (data.expectedRevision)
            throw new Error('New notes cannot have an existing revision');
    }
    else if (!scope.write?.[data.operation]) {
        throw new Error(`${data.operation === 'update' ? 'Editing' : 'Deletion'} is not enabled for this vault in this workspace`);
    }
    if (data.operation !== 'delete' && data.content === undefined)
        throw new Error('Provide the complete Markdown content');
    if (data.operation === 'delete' && data.content !== undefined)
        throw new Error('Deletion cannot include replacement content');
    const policy = await readRhenPolicy(vault.root, vault.rhen);
    if (await policy.isDenied(path))
        throw new Error('Rhen denies this note');
    const policyRevision = await policy.revision();
    const filename = await safePath(vault.root, path, data.operation === 'create');
    let before = null;
    if (data.operation === 'create') {
        try {
            await lstat(filename);
            throw new Error('A note already exists at this path');
        }
        catch (error) {
            if (error.code !== 'ENOENT')
                throw error;
        }
    }
    else {
        before = await readNoteFile(vault.root, path);
        if (!data.expectedRevision || digest(before) !== data.expectedRevision)
            throw new Error('The note changed. Reopen it and review a fresh change.');
        if (before.length > 40000)
            throw new Error('This note is too large for the change reviewer (40,000 characters). Edit it in Obsidian.');
    }
    const after = data.operation === 'delete' ? null : data.content;
    for (const text of [before, after]) {
        if (text === null)
            continue;
        if (isSealed(text))
            throw new Error('Sealed notes cannot be changed through Knowledge Bridge');
        const note = parseNote(vault.id, path, text, digest(text));
        if (scope.tagsAny.length && !scope.tagsAny.some((t) => note.tags.includes(t)))
            throw new Error('Both the current and proposed note must retain a required workspace tag');
    }
    if ((await service.pickerScope()).revision !== expectedScope ||
        (await (await readRhenPolicy(vault.root, vault.rhen)).revision()) !== policyRevision)
        throw new Error('Workspace or Rhen policy changed during review. Reopen the builder.');
    return {
        operation: data.operation,
        vaultId: data.vaultId,
        path,
        before,
        after,
        ...(data.expectedRevision ? { expectedRevision: data.expectedRevision } : {}),
        scopeRevision: expectedScope,
        policyRevision,
    };
}
export async function applyChange(service, preview, requestId) {
    // The Obsidian host repeats all checks before writing. Retrying the same request is
    // resolved by its receipt, including when a successful response was lost.
    const current = await service.pickerScope();
    if (current.revision !== preview.scopeRevision)
        throw new Error('Workspace scope changed. Reopen the builder.');
    const { bindings } = await loadApproved(service.registryPath, service.profilePath);
    const binding = bindings.find((b) => b.vault.id === preview.vaultId);
    if (!binding)
        throw new Error('Vault unavailable');
    return sendMutation(binding.vault.root, {
        operation: preview.operation,
        vaultId: preview.vaultId,
        path: preview.path,
        ...(preview.after !== null ? { content: preview.after } : {}),
        ...(preview.expectedRevision ? { expectedRevision: preview.expectedRevision } : {}),
        scopeRevision: preview.scopeRevision,
        policyRevision: preview.policyRevision,
        requestId,
        registryPath: service.registryPath,
        profilePath: service.profilePath,
    });
}
