export declare const MAX_SELECTED_DOCUMENTS = 12;
export declare const DOCUMENT_PAGE_SIZE = 25;
export interface VaultChoice {
    id: string;
    name: string;
}
export interface DocumentChoice {
    path: string;
    title: string;
    revision: string;
}
export interface PickerScope {
    workspaceId: string;
    revision: string;
    vaults: VaultChoice[];
}
export interface DocumentPage {
    vault: VaultChoice;
    documents: DocumentChoice[];
    selectedOnPage: string[];
    selectedCount: number;
    page: number;
    pageCount: number;
    filter: string;
    canNavigate: boolean;
}
export interface DocumentAnswer {
    paths: string[];
    action: 'attach' | 'next' | 'previous' | 'filter';
    filter?: string;
}
export interface DocumentPicker {
    chooseVault(vaults: VaultChoice[]): Promise<string | undefined>;
    chooseDocuments(page: DocumentPage): Promise<DocumentAnswer | undefined>;
}
export interface SelectionSource {
    pickerScope(): Promise<PickerScope>;
    pickerDocuments(vaultId: string, expectedScope: string): Promise<DocumentChoice[]>;
}
export type DocumentSelection = {
    status: 'cancelled' | 'empty';
    message: string;
} | {
    status: 'selected';
    vaultId: string;
    scopeRevision: string;
    documents: DocumentChoice[];
};
/** Per-invocation state only: never store another conversation's selection on the service. */
export declare function pickDocuments(source: SelectionSource, picker: DocumentPicker, options?: {
    query?: string;
    signal?: AbortSignal;
}): Promise<DocumentSelection>;
