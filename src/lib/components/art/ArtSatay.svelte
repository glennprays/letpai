<script lang="ts">
	// Flat illustration: palette colours only, no gradients or outlines, a
	// soft contact shadow underneath. Decorative, so hidden from assistive tech.
	import type { SVGAttributes } from 'svelte/elements';
	let { class: className = '', ...rest }: SVGAttributes<SVGSVGElement> = $props();
</script>

<svg {...rest} class={className} role="presentation" aria-hidden="true" focusable="false" viewBox="0 0 160 110"><ellipse cx="82" cy="100" rx="58" ry="6" fill="#1d2442" opacity=".10"/>
	<g transform="rotate(-18 80 55)"><rect x="6" y="52" width="150" height="4" rx="2" fill="#a87a4f"/>
	<rect x="40" y="42" width="20" height="24" rx="8" fill="#7a3f22"/><rect x="64" y="41" width="20" height="26" rx="8" fill="#8b4a28"/><rect x="88" y="42" width="20" height="24" rx="8" fill="#7a3f22"/><rect x="112" y="43" width="18" height="22" rx="8" fill="#8b4a28"/>
	<g fill="#5a2a14" opacity=".55"><rect x="44" y="48" width="12" height="3" rx="1.5"/><rect x="68" y="50" width="12" height="3" rx="1.5"/><rect x="92" y="48" width="12" height="3" rx="1.5"/></g></g>
	<g transform="rotate(-6 80 70)"><rect x="10" y="74" width="140" height="4" rx="2" fill="#a87a4f"/>
	<rect x="48" y="64" width="20" height="24" rx="8" fill="#8b4a28"/><rect x="72" y="63" width="20" height="26" rx="8" fill="#7a3f22"/><rect x="96" y="64" width="20" height="24" rx="8" fill="#8b4a28"/></g>
	<circle cx="128" cy="86" r="5" fill="#d4f25c"/><circle cx="138" cy="80" r="3.5" fill="#cf3a31"/></svg>
