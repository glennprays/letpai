import { defineConfig, devices } from '@playwright/test';

// Two servers: the fixture API (stands in for letpai-backend on :3000, the
// origin the CSP already allows) and the production build of the app.
const APP_PORT = 4173;

export default defineConfig({
	testDir: 'tests/e2e',
	outputDir: 'test-results',
	fullyParallel: false,
	workers: 1,
	retries: 0,
	reporter: [['list']],
	use: {
		baseURL: `http://localhost:${APP_PORT}`,
		reducedMotion: 'reduce',
		// Set PW_CHANNEL=chrome to use an installed Google Chrome instead of
		// the bundled Chromium (handy when `playwright install` is slow).
		channel: process.env.PW_CHANNEL || undefined,
		trace: 'retain-on-failure'
	},
	projects: [
		{ name: 'mobile', use: { ...devices['Desktop Chrome'], channel: process.env.PW_CHANNEL || undefined, viewport: { width: 375, height: 812 }, isMobile: false, hasTouch: true } },
		{ name: 'desktop', use: { ...devices['Desktop Chrome'], channel: process.env.PW_CHANNEL || undefined, viewport: { width: 1280, height: 800 } } }
	],
	webServer: [
		{
			command: 'node tests/mock-api.ts',
			url: 'http://localhost:3000/__health',
			reuseExistingServer: !process.env.CI,
			env: { MOCK_API_PORT: '3000' }
		},
		{
			command: `corepack pnpm build && node build`,
			url: `http://localhost:${APP_PORT}`,
			reuseExistingServer: !process.env.CI,
			timeout: 240_000,
			env: { PORT: String(APP_PORT), ORIGIN: `http://localhost:${APP_PORT}`, VITE_API_URL: 'http://localhost:3000/api/v1', LETPAI_STYLEGUIDE: '1' }
		}
	]
});
