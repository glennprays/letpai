import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { color, radius, shadow } from '../../src/lib/constants/design';
import { contrastRatio } from './contrast';

const css = readFileSync('src/app.css', 'utf8');
const theme = css.match(/@theme\s*{([\s\S]*?)\n}/)?.[1] ?? '';

function themeVar(name: string): string | undefined {
	const m = theme.match(new RegExp(`--${name}:\\s*([^;]+);`));
	return m?.[1].trim();
}

describe('design tokens', () => {
	it('app.css @theme mirrors every colour in design.ts', () => {
		for (const [key, value] of Object.entries(color)) {
			expect(themeVar(`color-${key}`), `--color-${key}`).toBe(value);
		}
	});

	it('app.css @theme mirrors radii and shadows', () => {
		for (const [key, value] of Object.entries(radius)) expect(themeVar(`radius-${key}`), key).toBe(value);
		for (const [key, value] of Object.entries(shadow)) expect(themeVar(`shadow-${key}`), key).toBe(value);
	});

	it('defines no colour in @theme that design.ts lacks (legacy aliases excepted)', () => {
		const legacy = new Set(['primary', 'secondary', 'surface', 'on-surface', 'on-surface-variant']);
		const names = [...theme.matchAll(/--color-([a-z-]+):\s*#/g)].map((m) => m[1]);
		for (const n of names) if (!legacy.has(n)) expect(color, n).toHaveProperty(n);
	});
});

// WCAG AA: 4.5:1 for body text, 3:1 for large text and UI marks.
describe('contrast (WCAG AA)', () => {
	const pairs: Array<[string, string, string, number]> = [
		['ink on fog', color.ink, color.fog, 4.5],
		['ink on card', color.ink, color.card, 4.5],
		['ink on mist', color.ink, color.mist, 4.5],
		['ink-soft on fog', color['ink-soft'], color.fog, 4.5],
		['ink-soft on card', color['ink-soft'], color.card, 4.5],
		['white on coral', color.card, color.coral, 4.5],
		['white on coral hover', color.card, color['coral-hover'], 4.5],
		['coral-ink on fog', color['coral-ink'], color.fog, 4.5],
		['coral-ink on coral-tint', color['coral-ink'], color['coral-tint'], 4.5],
		['white on ink', color.card, color.ink, 4.5],
		['white on whatsapp', color.card, color.whatsapp, 4.5],
		['ink on lime', color.ink, color.lime, 4.5],
		['steel on card', color.steel, color.card, 4.5],
		['pending on tint', color.pending, color['pending-tint'], 4.5],
		['review on tint', color.review, color['review-tint'], 4.5],
		['paid on tint', color.paid, color['paid-tint'], 4.5],
		['rejected on tint', color.rejected, color['rejected-tint'], 4.5],
		['hairline vs card (non-text border)', color['ink-soft'], color.mist, 3]
	];
	for (const [label, fg, bg, min] of pairs) {
		it(`${label} ≥ ${min}:1`, () => {
			expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(min);
		});
	}
});
