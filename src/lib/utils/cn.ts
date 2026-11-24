import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';
import { color, radius, shadow } from '$lib/constants/design';

// tailwind-merge has to know our custom utilities, or it treats
// `text-amount` as a text colour and silently drops it next to `text-ink`.
const twMerge = extendTailwindMerge<'type-style'>({
	extend: {
		theme: {
			color: Object.keys(color),
			radius: Object.keys(radius),
			shadow: Object.keys(shadow)
		},
		classGroups: {
			'type-style': ['text-poster', 'text-heading', 'text-amount', 'text-eyebrow']
		}
	}
});

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
