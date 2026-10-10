import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  prepareChange,
  ComposerSessions,
  saveJson,
  approveProfile,
  profileDigest,
  digest,
} from '@knowledge-bridge/core/service';
import { fixture } from './helpers.js';

test('existing approvals preserve their hash and do not opt into edit/delete', async (t) => {
  const f = await fixture();
  t.after(f.clean);
  assert.equal(profileDigest(f.config), digest(JSON.stringify(f.config)));
  const scope = (await f.service.pickerScope()).revision;
  const note = await f.service.read('notes', 'Project/Decision.md');
  for (const operation of ['update', 'delete'] as const)
    await assert.rejects(
      prepareChange(
        f.service,
        {
          operation,
          vaultId: 'notes',
          path: note.path,
          expectedRevision: note.revision,
          ...(operation === 'update' ? { content: 'new' } : {}),
        },
        scope,
      ),
      /not enabled/,
    );
  const preview = await prepareChange(
    f.service,
    {
      operation: 'create',
      vaultId: 'notes',
      path: 'Project/Inbox/New.md',
      content: '# New\n[[Decision]]',
    },
    scope,
  );
  assert.equal(preview.before, null);
  await assert.rejects(readFile(join(f.vault, preview.path)), /ENOENT/);
  await assert.rejects(
    prepareChange(
      f.service,
      { operation: 'create', vaultId: 'notes', path: 'Project/Outside.md', content: 'no' },
      scope,
    ),
    /capture folder/,
  );
  await assert.rejects(
    prepareChange(
      f.service,
      { operation: 'create', vaultId: 'notes', path: '../Escape.md', content: 'no' },
      scope,
    ),
  );
});

test('change previews enforce revisions, complete text, tags, Rhen and approval epochs', async (t) => {
  const f = await fixture();
  t.after(f.clean);
  f.config.scopes[0]!.write = { update: true, delete: true };
  await saveJson(f.profile, f.config);
  await approveProfile(f.registry, f.profile);
  const scope = (await f.service.pickerScope()).revision;
  const note = await f.service.read('notes', 'Project/Decision.md');
  const draft = {
    operation: 'update' as const,
    vaultId: 'notes',
    path: note.path,
    content: '# Replacement',
    expectedRevision: note.revision,
  };
  assert.equal((await prepareChange(f.service, draft, scope)).before, note.text);
  await writeFile(join(f.vault, note.path), '# Concurrent edit');
  await assert.rejects(prepareChange(f.service, draft, scope), /changed/);
  await writeFile(join(f.vault, note.path), 'RHEN1:sealed');
  await assert.rejects(
    prepareChange(f.service, { ...draft, expectedRevision: digest('RHEN1:sealed') }, scope),
    /Sealed/,
  );
  await writeFile(join(f.vault, note.path), 'a'.repeat(40001));
  await assert.rejects(
    prepareChange(f.service, { ...draft, expectedRevision: digest('a'.repeat(40001)) }, scope),
    /too large/,
  );
  await writeFile(join(f.vault, note.path), note.text);
  const policyDir = join(f.vault, '.obsidian/plugins/rhen-info-vault');
  await mkdir(policyDir, { recursive: true });
  await saveJson(join(policyDir, 'data.json'), { lockedFiles: [note.path], lockedFolders: [] });
  await assert.rejects(prepareChange(f.service, draft, scope), /Rhen denies/);
  await saveJson(join(policyDir, 'data.json'), { lockedFiles: [], lockedFolders: [] });
  f.config.scopes[0]!.tagsAny = ['project'];
  await saveJson(f.profile, f.config);
  await approveProfile(f.registry, f.profile);
  await assert.rejects(prepareChange(f.service, draft, scope), /scope changed/);
  const tagged = await f.service.read('notes', 'Project/Architecture.md');
  await assert.rejects(
    prepareChange(
      f.service,
      { ...draft, path: tagged.path, expectedRevision: tagged.revision },
      (await f.service.pickerScope()).revision,
    ),
    /required workspace tag/,
  );
});

test('review handles require an offered note and exact preview, and cancel prevents apply', async (t) => {
  const f = await fixture();
  t.after(f.clean);
  f.config.scopes[0]!.write = { update: true, delete: true };
  await saveJson(f.profile, f.config);
  await approveProfile(f.registry, f.profile);
  const sessions = new ComposerSessions(f.service),
    initial = await sessions.begin({ operation: 'update', content: '# Proposed' });
  await assert.rejects(
    sessions.preview(initial.sessionId, 'notes', 'update', 'Project/Decision.md', 'no'),
    /offered/,
  );
  await sessions.browse(initial.sessionId, 'notes', '', 0);
  assert.match(
    (await sessions.load(initial.sessionId, 'notes', 'Project/Decision.md')).content,
    /linked design/,
  );
  const review = await sessions.preview(
    initial.sessionId,
    'notes',
    'update',
    'Project/Decision.md',
    '# Proposed',
  );
  await assert.rejects(sessions.apply(initial.sessionId, 'wrong'), /exact change/);
  await assert.rejects(
    sessions.apply(initial.sessionId, review.reviewId),
    /Open this vault in Obsidian/,
  );
  sessions.close(initial.sessionId);
  await assert.rejects(sessions.apply(initial.sessionId, review.reviewId), /expired/);
  assert.match(await readFile(join(f.vault, 'Project/Decision.md'), 'utf8'), /linked design/);
});
