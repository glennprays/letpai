<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { getAvatarWithFallback } from '$lib/utils/avatar';

	interface Props {
		src?: string | null;
		alt?: string;
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
		fullName?: string | null;
		phoneNumber?: string | null;
		identifier?: string | null;
		class?: string;
	}

	// No rest-props spread on purpose: with a spread, Svelte SSR adds inline
	// onload/onerror replay attributes to <img>, which the CSP blocks.
	let { src, alt = '', size = 'md', fullName, phoneNumber, identifier, class: className }: Props = $props();

	const sizes = {
		xs: 'size-6',
		sm: 'size-8',
		md: 'size-10',
		lg: 'size-12',
		xl: 'size-16',
		'2xl': 'size-24'
	};
	const pixels = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64, '2xl': 96 };

	const url = $derived(getAvatarWithFallback(src, fullName, phoneNumber, identifier || fullName || phoneNumber, pixels[size]));
</script>

<img src={url} {alt} class={cn('flex-none rounded-full bg-mist object-cover', sizes[size], className)} />
