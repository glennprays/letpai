// Files not yet migrated to design tokens. Each redesign task removes the
// files it migrates; the hex guard fails if a listed file is already clean,
// so this list can only shrink. Target: empty (Task 18).
export const HEX_ALLOWLIST: string[] = [
	'src/routes/(app)/profile/+page.svelte',
	'src/routes/(app)/settings/+page.svelte',
	'src/routes/+error.svelte',
	'src/routes/admin/+layout.svelte',
	'src/routes/admin/+page.svelte',
	'src/routes/admin/admins/+page.svelte',
	'src/routes/admin/login/+page.svelte',
	'src/routes/admin/profile/+page.svelte',
	'src/routes/admin/setup/+page.svelte',
	'src/routes/admin/templates/+page.svelte',
	'src/routes/admin/templates/TestSendModal.svelte',
	'src/routes/admin/whatsapp/+page.svelte',
	'src/routes/cookies/+page.svelte',
	'src/routes/privacy/+page.svelte',
	'src/routes/tos/+page.svelte',
];
