import { lstat, mkdir, realpath, readFile, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { request } from 'node:http';
import { z } from 'zod';
import { changeResultSchema, type MutationRequest, type ChangeResult } from './changes.js';

export const endpointSchema = z
  .object({
    version: z.literal(1),
    port: z.number().int().min(1).max(65535),
    token: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();
export type BridgeEndpoint = z.infer<typeof endpointSchema>;
/** Internal metadata has its own bounded path; never accept a caller-supplied path. */
async function endpointPath(root: string, create = false): Promise<string> {
  if ((await realpath(root)) !== root) throw new Error('Vault root must be canonical');
  const directory = join(root, '.knowledge-bridge');
  if (create)
    await mkdir(directory, { recursive: false, mode: 0o700 }).catch((e) => {
      if (e.code !== 'EEXIST') throw e;
    });
  const dir = await lstat(directory);
  if (!dir.isDirectory() || dir.isSymbolicLink() || (await realpath(directory)) !== directory)
    throw new Error('Unsafe bridge directory');
  const file = join(directory, 'connection.json');
  try {
    const stat = await lstat(file);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1 || stat.size > 4096)
      throw new Error('Unsafe bridge connection file');
  } catch (error) {
    if (!create || (error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  return file;
}
export async function publishEndpoint(root: string, endpoint: BridgeEndpoint): Promise<void> {
  const file = await endpointPath(root, true);
  await writeFile(file, JSON.stringify(endpointSchema.parse(endpoint)), { mode: 0o600 });
}
export async function removeEndpoint(root: string, token: string): Promise<void> {
  try {
    const file = await endpointPath(root);
    if (endpointSchema.parse(JSON.parse(await readFile(file, 'utf8'))).token === token)
      await unlink(file);
  } catch {
    /* A later host may own the descriptor, or it is already gone. */
  }
}
export async function readEndpoint(root: string): Promise<BridgeEndpoint> {
  try {
    return endpointSchema.parse(JSON.parse(await readFile(await endpointPath(root), 'utf8')));
  } catch {
    throw new Error(
      'Open this vault in Obsidian and enable editor writes in Knowledge Bridge settings.',
    );
  }
}
export async function sendMutation(root: string, input: MutationRequest): Promise<ChangeResult> {
  const endpoint = await readEndpoint(root);
  const body = JSON.stringify(input);
  return new Promise((resolve, reject) => {
    const req = request(
      {
        hostname: '127.0.0.1',
        port: endpoint.port,
        path: '/change',
        method: 'POST',
        headers: {
          authorization: `Bearer ${endpoint.token}`,
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let text = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          text += chunk;
          if (text.length > 16384) req.destroy(new Error('Invalid bridge response'));
        });
        res.on('end', () => {
          try {
            const data = JSON.parse(text);
            if (res.statusCode !== 200)
              throw new Error(
                typeof data.error === 'string' ? data.error : 'Obsidian rejected the change',
              );
            resolve(changeResultSchema.parse(data));
          } catch (error) {
            reject(error);
          }
        });
        res.on('error', reject);
      },
    );
    req.setTimeout(30000, () =>
      req.destroy(
        new Error(
          'Obsidian did not respond. Check the note, then retry this same review to retrieve its result.',
        ),
      ),
    );
    req.on('error', (error) =>
      reject(new Error(`Obsidian write connection failed: ${error.message}`)),
    );
    req.end(body);
  });
}
