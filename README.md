# Knowledge Bridge Core

Shared policy and retrieval engine for [Knowledge Bridge](https://github.com/markaschmidt/KnowledgeBridge) and [Obsidian IDE Knowledge Bridge](https://github.com/markaschmidt/Obsidian-IDE-Knowledge-Bridge). This repository has its own version, CI, tags and release artifacts.

## Develop

Use Node.js 22.16+ and npm. Run `npm ci`, `npm run check` and `npm run package:core`. Tests use synthetic temporary vaults. No editor or Obsidian installation is needed.

Exports: `@knowledge-bridge/core` for contracts/Markdown/retrieval, `@knowledge-bridge/core/service` for the workspace-bound filesystem service and picker sessions, and `@knowledge-bridge/core/rhen` for conservative disk-policy compatibility.

## Independent updates

Consumers pin an immutable Git commit in their package manifests and lockfiles. They bundle that version into their own artifacts. Updating this checkout or publishing a core tag does not change an installed plugin. Upgrade the dependency explicitly and run the consumer's own checks before releasing it. No sibling checkout or private npm registry is required.

Compiled JavaScript and declarations in `lib/` are committed so archive dependency installs need no lifecycle scripts. CI rebuilds them and checks for drift. Edit TypeScript sources, run the build and commit source plus generated output together. Runtime data/profile schema remains version 1. Existing `obsidian-integrated` profile paths, provenance and policy identifiers are retained for compatibility.

This is the v0.5.0 development preview. Scoped lexical/graph retrieval, create-only capture and reviewed create/update/delete contracts are implemented. Existing-note mutations use the separately installed Obsidian companion. Optional per-vault permissions, complete-content previews and revision checks are shared by all hosts. See [bidirectional writes](docs/WRITES.md). Vector indexing, durable conflict recovery and live Rhen unlock contracts remain planned. See [Rhen policy](docs/RHEN.md), [scoping](docs/WORKSPACE-SCOPING.md) and [RAG](docs/RAG.md).
