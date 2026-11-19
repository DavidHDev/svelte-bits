<script lang="ts">
	type Props = {
		value: string;
		swatches: string[];
		label: string;
		onChange: (value: string) => void;
	};

	let { value, swatches, label, onChange }: Props = $props();

	let open = $state(false);
	let el = $state<HTMLSpanElement | null>(null);

	$effect(() => {
		if (!open) return;
		const onDown = (event: PointerEvent) => {
			if (!el?.contains(event.target as Node)) open = false;
		};
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') open = false;
		};
		document.addEventListener('pointerdown', onDown);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('pointerdown', onDown);
			document.removeEventListener('keydown', onKey);
		};
	});
</script>

<span class="lh-color" bind:this={el}>
	<button
		type="button"
		class="lh-scrub lh-value"
		aria-label={label}
		aria-expanded={open}
		onclick={() => (open = !open)}
	><i style:background={value}></i>{`"${value}"`}</button>
	{#if open}
		<span class="lh-swatches">
			{#each swatches as color (color)}
				<button
					type="button"
					aria-label={color}
					aria-pressed={color.toLowerCase() === String(value).toLowerCase()}
					style:--swatch={color}
					onclick={() => onChange(color)}
				></button>
			{/each}
		</span>
	{/if}
</span>
