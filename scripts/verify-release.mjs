import { readFile } from 'node:fs/promises';
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const tag = process.argv[2] ?? pkg.version;
if (tag !== pkg.version) throw new Error('Release tag must equal package version');
console.log('Release version verified:', tag);
