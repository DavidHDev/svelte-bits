<!-- @svelte-bits
{
  "title": "Magnet Lines",
  "description": "A grid of small line segments that rotate to face the cursor.",
  "dependencies": []
}
-->
<script lang="ts">
	type Props = {
		rows?: number;
		columns?: number;
		containerSize?: string;
		lineColor?: string;
		lineWidth?: string;
		lineHeight?: string;
		baseAngle?: number;
		class?: string;
		style?: string;
	};

	let {
		rows = 9,
		columns = 9,
		containerSize = '80vmin',
		lineColor = '#efefef',
		lineWidth = '1vmin',
		lineHeight = '6vmin',
		baseAngle = -10,
		class: className = '',
		style = ''
	}: Props = $props();

	let container: HTMLDivElement;
	const total = $derived(rows * columns);

	$effect(() => {
		if (!container) return;
		const items = container.querySelectorAll<HTMLSpanElement>('span');

		const onMove = (px: number, py: number) => {
			items.forEach((item) => {
				const r = item.getBoundingClientRect();
				const cx = r.x + r.width / 2;
				const cy = r.y + r.height / 2;
				const b = px - cx;
				const a = py - cy;
				const c = Math.sqrt(a * a + b * b) || 1;
				const rot = ((Math.acos(b / c) * 180) / Math.PI) * (py > cy ? 1 : -1);
				item.style.setProperty('--rotate', `${rot}deg`);
			});
		};

		const handler = (e: PointerEvent) => onMove(e.x, e.y);
		window.addEventListener('pointermove', handler);

		if (items.length) {
			const mid = Math.floor(items.length / 2);
			const r = items[mid].getBoundingClientRect();
			onMove(r.x, r.y);
		}

		return () => window.removeEventListener('pointermove', handler);
	});
</script>

<div
	bind:this={container}
	class="grid place-items-center {className}"
	style="grid-template-columns:repeat({columns},1fr);grid-template-rows:repeat({rows},1fr);width:{containerSize};height:{containerSize};{style}"
>
	{#each Array(total) as _, i (i)}
		<span
			class="block origin-center"
			style="background-color:{lineColor};width:{lineWidth};height:{lineHeight};--rotate:{baseAngle}deg;transform:rotate(var(--rotate));will-change:transform;"
		></span>
	{/each}
</div>
