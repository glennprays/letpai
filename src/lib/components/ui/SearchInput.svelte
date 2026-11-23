<script lang="ts">
	import { Search } from 'lucide-svelte';
	import Input from './Input.svelte';

	interface Props {
		placeholder?: string;
		value?: string;
		disabled?: boolean;
		class?: string;
		label?: string;
		oninput?: (value: string) => void;
		onclear?: () => void;
	}

	let {
		placeholder = 'Search',
		value = $bindable(''),
		disabled = false,
		class: className,
		label = 'Search',
		oninput,
		onclear
	}: Props = $props();
</script>

<div class={className}>
	<Input
		type="search"
		bind:value
		{placeholder}
		{disabled}
		leftIcon={Search}
		showClear
		aria-label={label}
		class="rounded-pill [&::-webkit-search-cancel-button]:hidden"
		{oninput}
		{onclear}
	/>
</div>
