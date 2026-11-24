import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
	it('keeps custom type utilities next to text colours', () => {
		expect(cn('text-amount text-ink')).toBe('text-amount text-ink');
		expect(cn('text-poster text-coral text-5xl')).toBe('text-poster text-coral text-5xl');
	});

	it('still lets a later token colour override an earlier one', () => {
		expect(cn('text-ink', 'text-coral')).toBe('text-coral');
		expect(cn('bg-card', 'bg-mist')).toBe('bg-mist');
	});

	it('merges token radii and shadows', () => {
		expect(cn('rounded-card', 'rounded-pill')).toBe('rounded-pill');
		expect(cn('shadow-raised', 'shadow-float')).toBe('shadow-float');
	});
});
