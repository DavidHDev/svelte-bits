<script lang="ts">
	type Link = { label: string; route: string };
	type Props = { next?: Link | null; previous?: Link | null };

	let { next = null, previous = null }: Props = $props();

	const ARROW_RIGHT =
		'M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z';
</script>

<div class="docs-button-bar">
	{#if previous}
		<a href={previous.route} class="docs-button docs-button-primary">
			<svg width="1em" height="1em" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true" style="transform: scaleX(-1);"
				><path d={ARROW_RIGHT} /></svg
			>
			<span>{previous.label}</span>
		</a>
	{/if}

	{#if next}
		<a href={next.route} class="docs-button docs-button-secondary">
			<span>{next.label}</span>
			<svg width="1em" height="1em" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true"><path d={ARROW_RIGHT} /></svg>
		</a>
	{/if}
</div>
