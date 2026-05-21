<script lang="ts">
  import { cn } from "$lib/utils/cn";
  import { Search, X } from "lucide-svelte";
  import Input from "./Input.svelte";

  interface Props {
    placeholder?: string;
    value?: string;
    disabled?: boolean;
    class?: string;
    oninput?: (value: string) => void;
    onclear?: () => void;
  }

  let {
    placeholder = "Search...",
    value = $bindable(""),
    disabled = false,
    class: className,
    oninput,
    onclear,
    ...props
  }: Props = $props();

  function handleClear() {
    value = "";
    if (oninput) oninput("");
    if (onclear) onclear();
  }

  function handleInput(val: string) {
    if (oninput) oninput(val);
  }
</script>

<div class={cn("relative", className)}>
  <Search
    class="absolute left-4 top-1/2 -translate-y-1/2 text-[#584140]/50 pointer-events-none"
    size={18}
  />

  <Input
    bind:value
    {placeholder}
    {disabled}
    oninput={handleInput}
    class="!pl-11 pr-10"
    {...props}
  />

  {#if value}
    <button
      onclick={handleClear}
      class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[#fbe3e1] transition-colors"
      aria-label="Clear search"
    >
      <X class="text-[#584140]" size={16} />
    </button>
  {/if}
</div>
