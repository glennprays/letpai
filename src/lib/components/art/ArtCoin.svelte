<script lang="ts">
	// Flat illustration: palette colours only, no gradients or outlines, a
	// soft contact shadow underneath. Decorative, so hidden from assistive tech.
	import type { SVGAttributes } from 'svelte/elements';
	let { class: className = '', ...rest }: SVGAttributes<SVGSVGElement> = $props();
</script>

<svg {...rest} class={className} role="presentation" aria-hidden="true" focusable="false" viewBox="0 0 100 100"><ellipse cx="50" cy="93" rx="30" ry="4.5" fill="#1d2442" opacity=".10"/>
	<circle cx="50" cy="46" r="38" fill="#e8b93a"/><circle cx="50" cy="46" r="29" fill="#f2cd5c"/>
	<path d="M41 34h12a8 8 0 0 1 0 16H41zm0 16v12m9-12 9 12" stroke="#8a5a00" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
