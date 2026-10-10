import { fromMarkdown } from 'mdast-util-from-markdown';
import { parse } from 'yaml';
export function parseNote(vaultId, path, text, revision) {
    const lines = text.split('\n');
    let bodyStart = 0;
    let data = {};
    if (lines[0]?.trim() === '---') {
        const end = lines.findIndex((line, i) => i > 0 && /^(---|\.\.\.)\s*$/.test(line));
        if (end > 0) {
            const parsed = parse(lines.slice(1, end).join('\n'), { maxAliasCount: 0 });
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed))
                data = parsed;
            bodyStart = end + 1;
        }
    }
    const list = (value) => (Array.isArray(value) ? value : typeof value === 'string' ? [value] : []).filter((s) => typeof s === 'string');
    const links = new Set();
    const inlineTags = new Set();
    const body = lines.slice(bodyStart).join('\n');
    const tree = fromMarkdown(body);
    function walk(node) {
        if (node.type === 'code' || node.type === 'inlineCode')
            return;
        if (node.type === 'link' || node.type === 'image') {
            if (node.url && !/^[a-z][a-z\d+.-]*:|^\/\//i.test(node.url))
                links.add(node.url);
        }
        if (node.type === 'text' && node.value) {
            for (const match of node.value.matchAll(/\[\[([^\]\n]+)\]\]/g))
                links.add(match[1].split('|')[0]);
            for (const match of node.value.matchAll(/(?:^|\s)#([\p{L}\p{N}_/-]+)/gu))
                inlineTags.add(match[1]);
        }
        for (const child of node.children ?? [])
            walk(child);
    }
    walk(tree);
    const chunks = [];
    let heading = '', start = bodyStart, buffer = '';
    const flush = (end) => {
        if (buffer.trim())
            chunks.push({ text: buffer, heading, startLine: start + 1, endLine: end });
        buffer = '';
        start = end;
    };
    let fenced = false;
    for (let i = bodyStart; i < lines.length; i++) {
        const line = lines[i];
        if (/^\s*(```|~~~)/.test(line))
            fenced = !fenced;
        const h = !fenced ? /^#{1,6}\s+(.+)$/.exec(line) : null;
        if (h || buffer.length + line.length > 1800)
            flush(i);
        if (h)
            heading = h[1];
        // Bound even pathological one-line notes, retaining their original line citation.
        for (let offset = 0; offset < Math.max(line.length, 1); offset += 1800) {
            if (offset) {
                flush(i + 1);
                start = i;
            }
            buffer += line.slice(offset, offset + 1800) + '\n';
        }
    }
    flush(lines.length);
    return {
        id: `${vaultId}:${path}`,
        vaultId,
        path,
        title: typeof data.title === 'string' ? data.title : path.split('/').pop().replace(/\.md$/i, ''),
        aliases: list(data.aliases),
        tags: [...new Set([...list(data.tags).map((t) => t.replace(/^#/, '')), ...inlineTags])],
        text,
        revision,
        links: [...links],
        chunks,
    };
}
