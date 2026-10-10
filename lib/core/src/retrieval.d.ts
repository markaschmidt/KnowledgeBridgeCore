import type { Note, Chunk } from './markdown.js';
import type { WorkspaceProfile } from './config.js';
export interface SearchHit extends Chunk {
    noteId: string;
    vaultId: string;
    path: string;
    title: string;
    revision: string;
    score: number;
    reason: 'lexical' | 'linked';
    uri: string;
}
export declare function resolveLink(source: Note, raw: string, notes: readonly Note[]): Note | undefined;
export declare function graph(notes: readonly Note[]): Map<string, Set<string>>;
export declare function search(notes: readonly Note[], query: string, settings: WorkspaceProfile['retrieval']): SearchHit[];
