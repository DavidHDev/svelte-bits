<!-- @svelte-bits
{
  "title": "Magnet",
  "description": "Magnetic pull effect that attracts content toward the cursor when nearby.",
  "dependencies": []
}
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		padding?: number;
		disabled?: boolean;
		magnetStrength?: number;
		activeTransition?: string;
		inactiveTransition?: string;
		wrapperClass?: string;
		innerClass?: string;
	};

	let {
		children,
		padding = 100,
		disabled = false,
		magnetStrength = 2,
		activeTransition = 'transform 0.3s ease-out',
		inactiveTransition = 'transform 0.5s ease-in-out',
		wrapperClass = '',
		innerClass = ''
	}: Props = $props();

	let magnetEl: HTMLDivElement;
	let active = $state(false);
	let pos = $state({ x: 0, y: 0 });

	$effect(() => {
		if (disabled) {
			pos = { x: 0, y: 0 };
			active = false;
			return;
		}
		const handle = (e: MouseEvent) => {
			if (!magnetEl) return;
			const { left, top, width, height } = magnetEl.getBoundingClientRect();
			const cx = left + width / 2;
			const cy = top + height / 2;
			const dx = Math.abs(cx - e.clientX);
			const dy = Math.abs(cy - e.clientY);
			if (dx < width / 2 + padding && dy < height / 2 + padding) {
				active = true;
				pos = { x: (e.clientX - cx) / magnetStrength, y: (e.clientY - cy) / magnetStrength };
			} else {
				active = false;
				pos = { x: 0, y: 0 };
			}
		};
		window.addEventListener('mousemove', handle);
		return () => window.removeEventListener('mousemove', handle);
	});
</script>

<div
	bind:this={magnetEl}
	class={wrapperClass}
	style="position:relative;display:inline-block;"
>
	<div
		class={innerClass}
		style="transform:translate3d({pos.x}px,{pos.y}px,0);transition:{active ? activeTransition : inactiveTransition};will-change:transform;"
	>
		{@render children()}
	</div>
</div>
