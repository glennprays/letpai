import { createRawSnippet } from 'svelte';

/** A children snippet that renders plain text, for component tests. */
export const text = (value: string) =>
	createRawSnippet(() => ({ render: () => `<span>${value}</span>` }));
