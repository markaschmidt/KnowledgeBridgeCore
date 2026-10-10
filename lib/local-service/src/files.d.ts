export declare function safePath(root: string, path: string, allowMissingLeaf?: boolean): Promise<string>;
export declare function readNoteFile(root: string, path: string): Promise<string>;
export declare function listMarkdown(root: string): Promise<string[]>;
