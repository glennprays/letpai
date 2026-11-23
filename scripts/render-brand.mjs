// Renders the static brand images with the real fonts:
//   static/og/{default,landing,payment}.png   1200×630 link previews
//   static/apple-touch-icon.png               180×180
//   static/icon-192.png, static/icon-512.png  manifest icons
// Usage: node scripts/render-brand.mjs   (PW_CHANNEL=chrome to use Chrome)
// Colours are copied from src/lib/constants/design.ts.
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const fontUrl = (p) => `data:font/woff2;base64,${readFileSync(`node_modules/${p}`).toString('base64')}`;
const bricolage = fontUrl('@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-opsz-normal.woff2');
const jakarta = fontUrl('@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.woff2');
const mark = readFileSync('static/brand/mark.svg', 'utf8');

const c = { fog: '#eff0f4', card: '#ffffff', mist: '#e3e5ed', hairline: '#d3d7e3', ink: '#1d2442', soft: '#5d627e', coral: '#cf3a31', lime: '#d4f25c', chat: '#e7e1d6' };

const base = `
@font-face { font-family: B; src: url(${bricolage}); font-weight: 200 800; }
@font-face { font-family: J; src: url(${jakarta}); font-weight: 600; }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; background: ${c.fog}; color: ${c.ink}; font-family: J; overflow: hidden; position: relative; }
.brand { position: absolute; left: 72px; top: 64px; display: flex; align-items: center; gap: 14px; font: 700 40px/1 B; letter-spacing: -0.045em; }
.brand svg { width: 46px; height: 46px; }
h1 { position: absolute; left: 72px; bottom: 76px; font: 700 104px/.9 B; font-variation-settings: 'opsz' 96; letter-spacing: -0.055em; max-width: 640px; }
h1 em { font-style: normal; color: ${c.coral}; }
.receipt { position: absolute; right: 90px; top: 70px; width: 360px; padding: 30px 30px 44px; background: ${c.card};
  -webkit-mask: radial-gradient(circle 9px at 50% 100%, #0000 98%, #000) 0 0 / 22px 100% repeat-x; border-radius: 18px 18px 0 0;
  transform: rotate(3deg); filter: drop-shadow(0 12px 30px rgba(29,36,66,.14)); }
.eb { font: 600 15px/1 J; letter-spacing: .06em; text-transform: uppercase; color: ${c.soft}; }
.t { font: 700 34px/1 B; letter-spacing: -0.03em; margin: 10px 0 22px; }
.l { display: flex; justify-content: space-between; font: 600 19px/1 J; padding: 9px 0; }
.l b { font: 700 21px/1 B; font-variant-numeric: tabular-nums; }
.dash { border-top: 2px dashed ${c.hairline}; margin: 14px 0; }
.stamp { position: absolute; right: 56px; top: 200px; padding: 10px 22px; border-radius: 14px; background: ${c.lime}; box-shadow: inset 0 0 0 3px ${c.ink};
  font: 800 30px/1 B; letter-spacing: .08em; transform: rotate(-9deg); }
`;

const receipt = (lines, total) => `<div class="receipt"><div class="eb">Friday dinner</div><div class="t">Split 12 ways</div>
${lines.map(([a, b]) => `<div class="l"><span>${a}</span><b>${b}</b></div>`).join('')}<div class="dash"></div>
<div class="l"><span>Total</span><b>${total}</b></div></div>`;

const pages = {
	default: `<div class="brand">${mark}letpai</div><h1>You paid. <em>They pay you back.</em></h1>
${receipt([['Alya', '177.870'], ['Dimas', '98.145'], ['Gita', '68.145']], 'Rp 1.176.915')}<div class="stamp">PAID</div>`,
	landing: `<div class="brand">${mark}letpai</div><h1>Split the bill. <em>Skip the chasing.</em></h1>
${receipt([['Sate kambing', '540.000'], ['Es teh manis', '168.000'], ['Sop buntut', '285.000']], '12 people')}<div class="stamp">PAID</div>`,
	// Generic on purpose: shown as the WhatsApp preview of a personal payment link.
	payment: `<div class="brand">${mark}letpai</div><h1 style="max-width:700px">A bill is <em>waiting for you.</em></h1>
<div class="receipt"><div class="eb">Payment request</div><div class="t">Tap to open</div>
<div class="l"><span>See your share</span><b>1</b></div><div class="l"><span>Transfer</span><b>2</b></div><div class="l"><span>Upload the proof</span><b>3</b></div>
<div class="dash"></div><div class="l"><span>No app needed</span><b>✓</b></div></div>`
};

const icon = (size, radius) => `<style>*{margin:0}body{width:${size}px;height:${size}px;background:${c.fog};display:grid;place-items:center;border-radius:${radius}px}svg{width:${Math.round(size * 0.66)}px;height:${Math.round(size * 0.66)}px}</style>${mark}`;

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined });
const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const [name, html] of Object.entries(pages)) {
	await og.setContent(`<style>${base}</style>${html}`);
	await og.evaluate(() => document.fonts.ready);
	await og.screenshot({ path: `static/og/${name}.png` });
}
for (const [file, size] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
	const p = await browser.newPage({ viewport: { width: size, height: size } });
	await p.setContent(icon(size, 0));
	await p.screenshot({ path: `static/${file}` });
	await p.close();
}
await browser.close();
console.log('brand images rendered');
