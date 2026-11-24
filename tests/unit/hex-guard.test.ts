import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { HEX_ALLOWLIST } from './hex-allowlist';

// Raw colour literals belong in the token files only. Illustrations
// (src/lib/components/art) carry their own fixed palettes and are exempt.
const EXEMPT = ['src/lib/constants/design.ts', 'src/app.css'];
const EXEMPT_DIRS = ['src/lib/components/art/'];
const LITERAL = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\(/;

function walk(dir: string): string[] {
	return readdirSync(dir).flatMap((name) => {
		const p = path.posix.join(dir, name);
		return statSync(p).isDirectory() ? walk(p) : [p];
	});
}

const files = walk('src')
	.filter((f) => /\.(svelte|ts|css)$/.test(f))
	.filter((f) => !EXEMPT.includes(f) && !EXEMPT_DIRS.some((d) => f.startsWith(d)));

function offending(file: string) {
	return readFileSync(file, 'utf8')
		.split('\n')
		.map((line, i) => ({ line: i + 1, text: line.trim() }))
		.filter(({ text }) => LITERAL.test(text));
}

describe('raw colour guard', () => {
	it('no colour literals outside the token files', () => {
		const report = files
			.filter((f) => !HEX_ALLOWLIST.includes(f))
			.flatMap((f) => offending(f).map((o) => `${f}:${o.line}  ${o.text.slice(0, 120)}`));
		expect(report, `Use design tokens instead:\n${report.join('\n')}`).toEqual([]);
	});

	it('allowlist only names files that still need migrating', () => {
		const stale = HEX_ALLOWLIST.filter((f) => !files.includes(f) || offending(f).length === 0);
		expect(stale, 'Remove these from tests/unit/hex-allowlist.ts').toEqual([]);
	});
});
