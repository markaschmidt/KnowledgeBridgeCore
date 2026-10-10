import type { RhenPolicyProvider } from '../../core/src/index.js';
export declare function isSealed(text: string): boolean;
/** Compatibility reader, independently implemented. Never imports Rhen code or reads keys. */
export declare function readRhenPolicy(root: string, mode: 'auto' | 'required'): Promise<RhenPolicyProvider>;
