<script lang="ts">
	import { animate } from 'motion';
	import { observeVisible } from '../shared/motion';

	const VARIANTS = [
		{ label: 'Svelte 5 runes', accent: 'rgba(255,255,255,0.5)' },
		{ label: 'TypeScript', accent: 'rgba(255,255,255,0.5)' },
		{ label: 'Tailwind CSS', accent: 'rgba(255,255,255,0.5)' },
		{ label: 'One file each', accent: 'rgba(255,255,255,0.5)' }
	];

	let active = $state(0);
	let visible = $state(false);
	let root = $state<HTMLDivElement | null>(null);
	const rows = $state<HTMLDivElement[]>([]);

	$effect(() => {
		if (!root) return;
		return observeVisible(root, (next) => (visible = next));
	});

	$effect(() => {
		if (!visible) return;
		const id = setInterval(() => (active = (active + 1) % 4), 2200);
		return () => clearInterval(id);
	});

	$effect(() => {
		const current = active;
		const animations = rows.map((row, i) =>
			animate(row, { opacity: i === current ? 1 : 0.3 }, { duration: 0.4 })
		);
		return () => animations.forEach((animation) => animation.stop());
	});
</script>

<div class="ln-feat-vrows" bind:this={root}>
	{#each VARIANTS as v, i (v.label)}
		<div class="ln-feat-vrow" bind:this={rows[i]} style:opacity={i === 0 ? 1 : 0.3}>
			<div class="ln-feat-vrow-dot" style:background={v.accent}></div>
			<span class="ln-feat-vrow-label">{v.label}</span>
			<div class="ln-feat-vrow-bars">
				<div class="ln-feat-vrow-bar" style:width="{35 + i * 8}%"></div>
				<div class="ln-feat-vrow-bar" style:width="{20 + ((i + 2) % 4) * 7}%"></div>
				<div class="ln-feat-vrow-bar" style:width="{45 + ((i + 1) % 3) * 10}%"></div>
			</div>
		</div>
	{/each}
</div>
