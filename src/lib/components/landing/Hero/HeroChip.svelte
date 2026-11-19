<script lang="ts">
	import { onMount } from 'svelte';
	import { ArrowRight02Icon } from '@hugeicons/core-free-icons';
	import HugeIcon from '$lib/components/common/HugeIcon.svelte';
	import { MICRO_COUNT, latestComponents } from '../shared/catalog';
	import { prefersReducedMotion } from './hero';

	const ITEMS = [
		...latestComponents(3).map((item) => ({ label: item.name, to: item.path })),
		...(MICRO_COUNT > 0 ? [{ label: `${MICRO_COUNT} Micro components`, to: '/get-started/index' }] : [])
	];

	const INTERVAL = 3200;

	let roll = $state({ index: 0, previous: -1 });
	let held = $state(false);
	let widths = $state<number[]>([]);
	const labelEls = $state<HTMLSpanElement[]>([]);

	onMount(() => {
		const measure = () => {
			widths = labelEls.map((el) => (el ? Math.ceil(el.scrollWidth) : 0));
		};
		measure();
		document.fonts?.ready.then(measure);
	});

	$effect(() => {
		if (held || prefersReducedMotion() || ITEMS.length < 2) return;
		const id = setInterval(() => {
			roll = { index: (roll.index + 1) % ITEMS.length, previous: roll.index };
		}, INTERVAL);
		return () => clearInterval(id);
	});

	const item = $derived(ITEMS[roll.index]);
</script>

{#if item}
	<a
		href={item.to}
		class="lh-chip"
		onmouseenter={() => (held = true)}
		onmouseleave={() => (held = false)}
		onfocus={() => (held = true)}
		onblur={() => (held = false)}
	>
		<span class="lh-chip-tag">New</span>
		<span class="lh-chip-roll" style:width={widths[roll.index] ? `${widths[roll.index]}px` : undefined}>
			{#each ITEMS as entry, i (entry.label)}
				<span
					bind:this={labelEls[i]}
					aria-hidden={i !== roll.index}
					class="lh-chip-label{i === roll.index ? ' is-in' : i === roll.previous ? ' is-out' : ''}"
				>
					{entry.label}
				</span>
			{/each}
		</span>
		<HugeIcon icon={ArrowRight02Icon} size={14} strokeWidth={1.8} />
	</a>
{/if}
