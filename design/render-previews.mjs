// Renders every design/previews/*.html at 375px and 1280px into
// design/previews/shots/ so options can be compared side by side.
// Usage: node design/render-previews.mjs   (PW_CHANNEL=chrome to use Chrome)
import { chromium } from '@playwright/test';
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'previews');
const only = process.argv[2];
const files = readdirSync(dir).filter((f) => f.endsWith('.html') && f !== 'index.html' && (!only || f.includes(only)));
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined });
for (const [name, width, height] of [['mobile', 375, 812], ['desktop', 1280, 800]]) {
	const page = await browser.newPage({ viewport: { width, height } });
	for (const f of files) {
		await page.goto(pathToFileURL(path.join(dir, f)).href);
		await page.evaluate(() => document.fonts.ready);
		await page.screenshot({ path: path.join(dir, 'shots', `${f.replace('.html', '')}-${name}.png`), fullPage: true });
	}
	await page.close();
}
await browser.close();
console.log(`rendered ${files.length} previews`);
