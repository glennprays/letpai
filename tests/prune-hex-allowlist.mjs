// Drops files from tests/unit/hex-allowlist.ts that no longer contain raw
// colour literals (or no longer exist). Never adds entries.
// Usage: node tests/prune-hex-allowlist.mjs
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const path = 'tests/unit/hex-allowlist.ts';
const src = readFileSync(path, 'utf8');
const LITERAL = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\(/;
const entries = [...src.matchAll(/^\t'([^']+)',$/gm)].map((m) => m[1]);
const keep = entries.filter((f) => existsSync(f) && LITERAL.test(readFileSync(f, 'utf8')));
const removed = entries.filter((f) => !keep.includes(f));
const out = src.replace(/= \[[\s\S]*\];/, `= [\n${keep.map((f) => `\t'${f}',`).join('\n')}${keep.length ? '\n' : ''}];`);
writeFileSync(path, out);
console.log(`removed ${removed.length}, ${keep.length} left`);
for (const f of removed) console.log(`  - ${f}`);
