export interface Note {
    id: string;
    vaultId: string;
    path: string;
    title: string;
    aliases: string[];
    tags: string[];
    text: string;
    revision: string;
    links: string[];
    chunks: Chunk[];
}
export interface Chunk {
    text: string;
    heading: string;
    startLine: number;
    endLine: number;
}
export declare function parseNote(vaultId: string, path: string, text: string, revision: string): Note;
