export const MAX_SELECTED_DOCUMENTS = 12;
export const DOCUMENT_PAGE_SIZE = 25;
/** Per-invocation state only: never store another conversation's selection on the service. */
export async function pickDocuments(source, picker, options = {}) {
    const checkCancelled = () => options.signal?.throwIfAborted();
    const cancelled = () => ({
        status: 'cancelled',
        message: 'No documents were added.',
    });
    checkCancelled();
    const scope = await source.pickerScope();
    if (!scope.vaults.length)
        return {
            status: 'empty',
            message: 'No vaults are scoped to this workspace. Configure one in Obsidian Integrated settings.',
        };
    const vaultId = scope.vaults.length === 1 ? scope.vaults[0].id : await picker.chooseVault(scope.vaults);
    checkCancelled();
    if (vaultId === undefined)
        return cancelled();
    const vault = scope.vaults.find((v) => v.id === vaultId);
    if (!vault)
        throw new Error('The selected vault was not offered by this workspace');
    let all = await source.pickerDocuments(vaultId, scope.revision);
    if (!all.length)
        return {
            status: 'empty',
            message: 'This vault has no readable documents in the approved scope.',
        };
    let filter = (options.query ?? '').trim().slice(0, 200), page = 0;
    const selected = new Map();
    for (let interaction = 0; interaction < 100; interaction++) {
        checkCancelled();
        if (interaction > 0) {
            all = await source.pickerDocuments(vaultId, scope.revision);
            for (const chosen of selected.values()) {
                if (!all.some((d) => d.path === chosen.path && d.revision === chosen.revision))
                    throw new Error('A selected document changed or is no longer readable. Run /obsidian again.');
            }
        }
        const filtered = all.filter((d) => `${d.title}\n${d.path}`.toLowerCase().includes(filter.toLowerCase()));
        const pageCount = Math.max(1, Math.ceil(filtered.length / DOCUMENT_PAGE_SIZE));
        page = Math.min(page, pageCount - 1);
        const documents = filtered.slice(page * DOCUMENT_PAGE_SIZE, (page + 1) * DOCUMENT_PAGE_SIZE);
        const answer = await picker.chooseDocuments({
            vault,
            documents,
            selectedOnPage: documents.filter((d) => selected.has(d.path)).map((d) => d.path),
            selectedCount: selected.size,
            page,
            pageCount,
            filter,
            canNavigate: all.length > DOCUMENT_PAGE_SIZE || Boolean(filter),
        });
        checkCancelled();
        if (!answer)
            return cancelled();
        if (!Array.isArray(answer.paths) ||
            new Set(answer.paths).size !== answer.paths.length ||
            answer.paths.some((path) => !documents.some((d) => d.path === path)))
            throw new Error('The document selection contains a choice that was not offered');
        if (!['attach', 'next', 'previous', 'filter'].includes(answer.action))
            throw new Error('Invalid picker action');
        for (const document of documents)
            selected.delete(document.path);
        for (const path of answer.paths)
            selected.set(path, documents.find((d) => d.path === path));
        if (selected.size > MAX_SELECTED_DOCUMENTS)
            throw new Error(`Select at most ${MAX_SELECTED_DOCUMENTS} documents per invocation`);
        if (answer.action === 'filter') {
            filter = (answer.filter ?? '').trim().slice(0, 200);
            page = 0;
            continue;
        }
        if (answer.action === 'next') {
            page = Math.min(page + 1, pageCount - 1);
            continue;
        }
        if (answer.action === 'previous') {
            page = Math.max(0, page - 1);
            continue;
        }
        if (!selected.size)
            return cancelled();
        return {
            status: 'selected',
            vaultId,
            scopeRevision: scope.revision,
            documents: [...selected.values()],
        };
    }
    throw new Error('Picker interaction limit reached; run /obsidian again');
}
