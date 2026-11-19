<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title: string;
		class?: string;
		status?: Snippet;
		action?: Snippet;
		children: Snippet;
		onpointerenter?: () => void;
		onpointerleave?: () => void;
	};

	let { title, class: className = '', status, action, children, onpointerenter, onpointerleave }: Props = $props();

	let offset = $state({ x: 0, y: 0 });
	let drag: { x: number; y: number; start: { x: number; y: number } } | null = null;

	const down = (event: PointerEvent) => {
		if (event.button !== 0 || (event.target as Element).closest('button')) return;
		if (window.matchMedia('(max-width: 768px)').matches) return;
		drag = { x: event.clientX, y: event.clientY, start: offset };
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	};
	const move = (event: PointerEvent) => {
		if (!drag) return;
		offset = {
			x: drag.start.x + event.clientX - drag.x,
			y: drag.start.y + event.clientY - drag.y
		};
	};
	const up = () => {
		drag = null;
	};
</script>

<div
	class="lh-window {className}"
	style:--wx="{offset.x}px"
	style:--wy="{offset.y}px"
	role="group"
	aria-label={title}
	{onpointerenter}
	{onpointerleave}
>
	<div
		class="lh-window-bar"
		role="presentation"
		onpointerdown={down}
		onpointermove={move}
		onpointerup={up}
		onpointercancel={up}
	>
		{title}
		{@render action?.()}
	</div>
	<div class="lh-well">{@render children()}</div>
	{#if status}
		<div class="lh-window-status">{@render status()}</div>
	{/if}
</div>
