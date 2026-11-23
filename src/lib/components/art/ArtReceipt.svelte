<script lang="ts">
	// Flat illustration: palette colours only, no gradients or outlines, a
	// soft contact shadow underneath. Decorative, so hidden from assistive tech.
	import type { SVGAttributes } from 'svelte/elements';
	let { class: className = '', ...rest }: SVGAttributes<SVGSVGElement> = $props();
</script>

<svg {...rest} class={className} role="presentation" aria-hidden="true" focusable="false" viewBox="0 0 120 170"><ellipse cx="60" cy="162" rx="40" ry="5" fill="#1d2442" opacity=".10"/>
	<path d="M14 8h92v138l-7.7-6-7.6 6-7.7-6-7.7 6-7.6-6-7.7 6-7.7-6-7.6 6-7.7-6-7.7 6-7.6-6L14 146z" fill="#fff"/>
	<rect x="28" y="26" width="44" height="7" rx="3.5" fill="#1d2442"/>
	<g fill="#d3d7e3"><rect x="28" y="46" width="64" height="5" rx="2.5"/><rect x="28" y="58" width="52" height="5" rx="2.5"/><rect x="28" y="70" width="60" height="5" rx="2.5"/><rect x="28" y="82" width="40" height="5" rx="2.5"/></g>
	<path d="M28 100h64" stroke="#d3d7e3" stroke-width="2" stroke-dasharray="4 4"/>
	<rect x="28" y="110" width="30" height="8" rx="4" fill="#1d2442"/><rect x="66" y="110" width="26" height="8" rx="4" fill="#cf3a31"/></svg>
