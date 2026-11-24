// Files not yet migrated to design tokens. Each redesign task removes the
// files it migrates; the hex guard fails if a listed file is already clean,
// so this list can only shrink. Target: empty (Task 18).
export const HEX_ALLOWLIST: string[] = [
	'src/routes/+error.svelte',
	'src/routes/cookies/+page.svelte',
	'src/routes/privacy/+page.svelte',
	'src/routes/tos/+page.svelte',
];
