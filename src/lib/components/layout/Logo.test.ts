import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Logo from './Logo.svelte';

describe('Logo', () => {
	it.each([
		['sm', '24'],
		['md', '28'],
		['lg', '40']
	])('renders the %s mark at %spx inside a home link', (size, px) => {
		render(Logo, { size: size as 'sm' | 'md' | 'lg' });
		const link = screen.getByRole('link', { name: 'Letpai home' });
		expect(link).toHaveAttribute('href', '/');
		expect(link.querySelector('svg')).toHaveAttribute('width', px);
		expect(link).toHaveTextContent('letpai');
	});

	it('can render without a link or wordmark', () => {
		render(Logo, { href: null, markOnly: true });
		expect(screen.queryByRole('link')).toBeNull();
		expect(screen.getByRole('img', { name: 'Letpai' })).not.toHaveTextContent('letpai');
	});

	it('is a link, not a button (it was a button before the redesign)', () => {
		render(Logo, {});
		expect(screen.queryByRole('button')).toBeNull();
	});
});
