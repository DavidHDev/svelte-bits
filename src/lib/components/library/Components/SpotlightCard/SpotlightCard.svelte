<!-- @svelte-bits
{
  "title": "Spotlight Card",
  "description": "Card with a soft radial spotlight that follows the cursor.",
  "dependencies": []
}
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		class?: string;
		spotlightColor?: string;
		children?: Snippet;
	};

	let { class: className = '', spotlightColor = 'rgba(255, 255, 255, 0.25)', children }: Props = $props();

	let divRef: HTMLDivElement;
	let isFocused = $state(false);
	let posX = $state(0);
	let posY = $state(0);
	let opacity = $state(0);

	function handleMouseMove(e: MouseEvent) {
		if (!divRef || isFocused) return;
		const rect = divRef.getBoundingClientRect();
		posX = e.clientX - rect.left;
		posY = e.clientY - rect.top;
	}
	function handleFocus() { isFocused = true; opacity = 0.6; }
	function handleBlur() { isFocused = false; opacity = 0; }
	function handleMouseEnter() { opacity = 0.6; }
	function handleMouseLeave() { opacity = 0; }
</script>

<div
	bind:this={divRef}
	role="presentation"
	onmousemove={handleMouseMove}
	onfocus={handleFocus}
	onblur={handleBlur}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	class={`relative rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden p-8 ${className}`}
>
	<div
		class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
		style="opacity:{opacity};background:radial-gradient(circle at {posX}px {posY}px, {spotlightColor}, transparent 80%);"
	></div>
	{@render children?.()}
</div>
