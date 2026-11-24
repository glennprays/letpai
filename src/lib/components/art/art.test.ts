import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { readFileSync } from 'node:fs';
import { ArtCoin, ArtHelmet, ArtPhone, ArtReceipt, ArtSatay, PaidStamp, Receipt } from './index';
import { text } from '../../../../tests/unit/snippet';

describe('illustrations', () => {
	it.each([
		['ArtReceipt', ArtReceipt],
		['ArtSatay', ArtSatay],
		['ArtPhone', ArtPhone],
		['ArtCoin', ArtCoin],
		['ArtHelmet', ArtHelmet]
	])('%s is decorative and hidden from assistive tech', (_name, Comp) => {
		const { container } = render(Comp, { class: 'w-20' });
		const svg = container.querySelector('svg')!;
		expect(svg).toHaveAttribute('aria-hidden', 'true');
		expect(svg).toHaveAttribute('focusable', 'false');
		expect(svg).toHaveClass('w-20');
	});

	it.each(['ArtReceipt', 'ArtSatay', 'ArtPhone', 'ArtCoin', 'ArtHelmet'])('%s is flat (no gradients, filters or raster images)', (name) => {
		const src = readFileSync(`src/lib/components/art/${name}.svelte`, 'utf8');
		expect(src).not.toMatch(/Gradient|<filter|<image/);
	});
});

describe('Receipt', () => {
	it('renders its content on perforated paper', () => {
		const { container } = render(Receipt, { children: text('Sate kambing') });
		expect(screen.getByText('Sate kambing')).toBeInTheDocument();
		const paper = screen.getByText('Sate kambing').parentElement!;
		expect(paper.getAttribute('style')).toContain('radial-gradient');
		expect(container.firstElementChild!.getAttribute('style') ?? '').not.toContain('rotate');
	});

	it('tilts only when asked', () => {
		const { container } = render(Receipt, { tilt: 2, children: text('x') });
		expect(container.firstElementChild!.getAttribute('style')).toContain('rotate(2deg)');
	});
});

describe('PaidStamp', () => {
	it('reads as text, uses the lime highlight', () => {
		render(PaidStamp, {});
		const stamp = screen.getByText('Paid');
		expect(stamp).toHaveClass('bg-lime');
	});

	it('accepts a custom label', () => {
		render(PaidStamp, { label: 'Settled', size: 'lg' });
		expect(screen.getByText('Settled')).toBeInTheDocument();
	});
});
