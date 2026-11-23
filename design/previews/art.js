// Flat illustration set for the previews. Each object sits on a soft contact
// shadow, uses palette colours only and has no gradients or outlines.
// Usage: <i data-art="receipt" style="width:120px"></i>
window.ART = Object.assign(window.ART || {}, {
	receipt: `<svg viewBox="0 0 120 170"><ellipse cx="60" cy="162" rx="40" ry="5" fill="#1d2442" opacity=".10"/>
	<path d="M14 8h92v138l-7.7-6-7.6 6-7.7-6-7.7 6-7.6-6-7.7 6-7.7-6-7.6 6-7.7-6-7.7 6-7.6-6L14 146z" fill="#fff"/>
	<rect x="28" y="26" width="44" height="7" rx="3.5" fill="#1d2442"/>
	<g fill="#d3d7e3"><rect x="28" y="46" width="64" height="5" rx="2.5"/><rect x="28" y="58" width="52" height="5" rx="2.5"/><rect x="28" y="70" width="60" height="5" rx="2.5"/><rect x="28" y="82" width="40" height="5" rx="2.5"/></g>
	<path d="M28 100h64" stroke="#d3d7e3" stroke-width="2" stroke-dasharray="4 4"/>
	<rect x="28" y="110" width="30" height="8" rx="4" fill="#1d2442"/><rect x="66" y="110" width="26" height="8" rx="4" fill="#cf3a31"/></svg>`,
	satay: `<svg viewBox="0 0 160 110"><ellipse cx="82" cy="100" rx="58" ry="6" fill="#1d2442" opacity=".10"/>
	<g transform="rotate(-18 80 55)"><rect x="6" y="52" width="150" height="4" rx="2" fill="#a87a4f"/>
	<rect x="40" y="42" width="20" height="24" rx="8" fill="#7a3f22"/><rect x="64" y="41" width="20" height="26" rx="8" fill="#8b4a28"/><rect x="88" y="42" width="20" height="24" rx="8" fill="#7a3f22"/><rect x="112" y="43" width="18" height="22" rx="8" fill="#8b4a28"/>
	<g fill="#5a2a14" opacity=".55"><rect x="44" y="48" width="12" height="3" rx="1.5"/><rect x="68" y="50" width="12" height="3" rx="1.5"/><rect x="92" y="48" width="12" height="3" rx="1.5"/></g></g>
	<g transform="rotate(-6 80 70)"><rect x="10" y="74" width="140" height="4" rx="2" fill="#a87a4f"/>
	<rect x="48" y="64" width="20" height="24" rx="8" fill="#8b4a28"/><rect x="72" y="63" width="20" height="26" rx="8" fill="#7a3f22"/><rect x="96" y="64" width="20" height="24" rx="8" fill="#8b4a28"/></g>
	<circle cx="128" cy="86" r="5" fill="#d4f25c"/><circle cx="138" cy="80" r="3.5" fill="#cf3a31"/></svg>`,
	phone: `<svg viewBox="0 0 120 190"><ellipse cx="60" cy="182" rx="38" ry="5" fill="#1d2442" opacity=".10"/>
	<rect x="18" y="6" width="84" height="168" rx="16" fill="#1d2442"/><rect x="24" y="16" width="72" height="148" rx="10" fill="#eff0f4"/>
	<rect x="46" y="10" width="28" height="3" rx="1.5" fill="#5d627e"/>
	<path d="M32 40h44a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H40l-8 7z" fill="#fff"/>
	<rect x="38" y="48" width="34" height="5" rx="2.5" fill="#1d2442"/><rect x="38" y="58" width="22" height="5" rx="2.5" fill="#cf3a31"/>
	<path d="M88 88H50a6 6 0 0 0-6 6v14a6 6 0 0 0 6 6h30l8 7z" fill="#d7f5c9"/>
	<rect x="52" y="96" width="28" height="5" rx="2.5" fill="#1f6b47"/><rect x="52" y="105" width="16" height="4" rx="2" fill="#1f6b47" opacity=".5"/>
	<rect x="32" y="136" width="56" height="16" rx="8" fill="#fff"/></svg>`,
	coin: `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="93" rx="30" ry="4.5" fill="#1d2442" opacity=".10"/>
	<circle cx="50" cy="46" r="38" fill="#e8b93a"/><circle cx="50" cy="46" r="29" fill="#f2cd5c"/>
	<path d="M41 34h12a8 8 0 0 1 0 16H41zm0 16v12m9-12 9 12" stroke="#8a5a00" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
	helmet: `<svg viewBox="0 0 140 110"><ellipse cx="70" cy="102" rx="48" ry="5.5" fill="#1d2442" opacity=".10"/>
	<path d="M18 80c0-36 22-62 54-62s50 24 50 56v6z" fill="#2f7a5b"/>
	<path d="M60 22c18 2 34 16 40 38H66c-6 0-10-4-10-10z" fill="#1d2442"/>
	<rect x="12" y="78" width="116" height="14" rx="7" fill="#1d2442"/><rect x="30" y="40" width="10" height="34" rx="5" fill="#fff" opacity=".18"/></svg>`
});
document.querySelectorAll('[data-art]').forEach((el) => {
	el.innerHTML = window.ART[el.dataset.art] ?? '';
	el.setAttribute('aria-hidden', 'true');
	el.style.display = el.style.display || 'block';
});


// Lucide icon paths (ISC licence) used by the previews: <svg class="icon"><use href="#i-check"/></svg>
document.body.insertAdjacentHTML(
	'afterbegin',
	`<svg width="0" height="0" style="position:absolute" aria-hidden="true">
	<symbol id="i-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></symbol>
	<symbol id="i-x" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></symbol>
	<symbol id="i-bell" viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/></symbol>
	<symbol id="i-retry" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></symbol>
	<symbol id="i-back" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></symbol>
	<symbol id="i-more" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></symbol>
	<symbol id="i-copy" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></symbol>
	<symbol id="i-image" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/></symbol>
	<symbol id="i-alert" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></symbol>
	<symbol id="i-chev" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></symbol>
	<symbol id="i-plus" viewBox="0 0 24 24"><path d="M5 12h14M12 5v14"/></symbol>
	<symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></symbol>
	</svg>`
);
