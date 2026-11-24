<script lang="ts">
	// Flat illustration: palette colours only, no gradients or outlines, a
	// soft contact shadow underneath. Decorative, so hidden from assistive tech.
	import type { SVGAttributes } from 'svelte/elements';
	let { class: className = '', ...rest }: SVGAttributes<SVGSVGElement> = $props();
</script>

<svg {...rest} class={className} role="presentation" aria-hidden="true" focusable="false" viewBox="0 0 140 110"><ellipse cx="70" cy="102" rx="48" ry="5.5" fill="#1d2442" opacity=".10"/>
	<path d="M18 80c0-36 22-62 54-62s50 24 50 56v6z" fill="#2f7a5b"/>
	<path d="M60 22c18 2 34 16 40 38H66c-6 0-10-4-10-10z" fill="#1d2442"/>
	<rect x="12" y="78" width="116" height="14" rx="7" fill="#1d2442"/><rect x="30" y="40" width="10" height="34" rx="5" fill="#fff" opacity=".18"/></svg>
