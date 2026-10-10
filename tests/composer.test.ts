import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ComposerSessions, saveJson, approveProfile } from '@knowledge-bridge/core/service';
import { fixture } from './helpers.js';

test('composer sessions require offered documents, isolate handles and return only chosen bodies', async (t) => {
  const f = await fixture();
  t.after(f.clean);
  const sessions = new ComposerSessions(f.service),
    first = await sessions.begin(),
    second = await sessions.begin();
  const page = await sessions.browse(first.sessionId, 'notes', '', 0);
  assert.deepEqual(
    page.documents.map((d) => d.path),
    ['Project/Architecture.md', 'Project/Decision.md'],
  );
  await assert.rejects(
    sessions.commit(second.sessionId, 'notes', ['Project/Decision.md']),
    /Invalid/,
  );
  await assert.rejects(sessions.commit(first.sessionId, 'notes', ['Other/Secret.md']), /offered/);
  const bundle = await sessions.commit(first.sessionId, 'notes', ['Project/Decision.md']);
  assert.equal(bundle.documents.length, 1);
  assert.match(bundle.documents[0]!.text, /linked design decision/);
  assert.doesNotMatch(JSON.stringify(bundle), /Use local retrieval/);
  sessions.close(first.sessionId);
  await assert.rejects(
    sessions.commit(first.sessionId, 'notes', ['Project/Decision.md']),
    /expired/,
  );
});
test('composer preserves the first offered revision even after subsequent browsing', async (t) => {
  const f = await fixture();
  t.after(f.clean);
  const sessions = new ComposerSessions(f.service),
    state = await sessions.begin();
  await sessions.browse(state.sessionId, 'notes', '', 0);
  await writeFile(join(f.vault, 'Project', 'Decision.md'), '# Changed\nChanged while selecting');
  await sessions.browse(state.sessionId, 'notes', '', 0);
  await assert.rejects(
    sessions.commit(state.sessionId, 'notes', ['Project/Decision.md']),
    /changed/,
  );
});
test('composer sessions expire and invalidate on reapproved scope changes', async (t) => {
  const f = await fixture();
  t.after(f.clean);
  let now = 0;
  const sessions = new ComposerSessions(f.service, () => now);
  const expired = await sessions.begin();
  now = 16 * 60_000;
  await assert.rejects(sessions.browse(expired.sessionId, 'notes', '', 0), /expired/);
  const changed = await sessions.begin();
  f.config.scopes[0]!.exclude = ['Project/Architecture.md'];
  await saveJson(f.profile, f.config);
  await approveProfile(f.registry, f.profile);
  await assert.rejects(sessions.browse(changed.sessionId, 'notes', '', 0), /scope changed/);
});
