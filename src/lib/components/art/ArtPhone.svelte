<script lang="ts">
	// Flat illustration: palette colours only, no gradients or outlines, a
	// soft contact shadow underneath. Decorative, so hidden from assistive tech.
	import type { SVGAttributes } from 'svelte/elements';
	let { class: className = '', ...rest }: SVGAttributes<SVGSVGElement> = $props();
</script>

<svg {...rest} class={className} role="presentation" aria-hidden="true" focusable="false" viewBox="0 0 120 190"><ellipse cx="60" cy="182" rx="38" ry="5" fill="#1d2442" opacity=".10"/>
	<rect x="18" y="6" width="84" height="168" rx="16" fill="#1d2442"/><rect x="24" y="16" width="72" height="148" rx="10" fill="#eff0f4"/>
	<rect x="46" y="10" width="28" height="3" rx="1.5" fill="#5d627e"/>
	<path d="M32 40h44a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H40l-8 7z" fill="#fff"/>
	<rect x="38" y="48" width="34" height="5" rx="2.5" fill="#1d2442"/><rect x="38" y="58" width="22" height="5" rx="2.5" fill="#cf3a31"/>
	<path d="M88 88H50a6 6 0 0 0-6 6v14a6 6 0 0 0 6 6h30l8 7z" fill="#d7f5c9"/>
	<rect x="52" y="96" width="28" height="5" rx="2.5" fill="#1f6b47"/><rect x="52" y="105" width="16" height="4" rx="2" fill="#1f6b47" opacity=".5"/>
	<rect x="32" y="136" width="56" height="16" rx="8" fill="#fff"/></svg>
