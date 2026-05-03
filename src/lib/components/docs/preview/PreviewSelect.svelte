<script lang="ts">
	type Option = { label: string; value: string };

	type Props = {
		title?: string;
		value?: string;
		options?: Option[] | string[];
		isDisabled?: boolean;
		onChange?: (v: string) => void;
	};
	let {
		title = '',
		value = '',
		options = [],
		isDisabled = false,
		onChange
	}: Props = $props();

	let open = $state(false);
	let rootEl: HTMLDivElement | null = $state(null);

	const normalized = $derived<Option[]>(
		(options as (Option | string)[]).map((o) =>
			typeof o === 'string' ? { label: o, value: o } : o
		)
	);
	const current = $derived(normalized.find((o) => o.value === value));

	$effect(() => {
		if (!open) return;
		const handler = (e: MouseEvent) => {
			if (rootEl && !rootEl.contains(e.target as Node)) open = false;
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	});

	function pick(v: string) {
		onChange?.(v);
		open = false;
	}
</script>

<div class="scrubber" bind:this={rootEl}>
	<button
		type="button"
		class="scrubber-track scrubber-track--select"
		aria-haspopup="listbox"
		aria-expanded={open}
		aria-label={title}
		aria-disabled={isDisabled}
		data-disabled={isDisabled}
		data-active={open}
		onclick={() => !isDisabled && (open = !open)}
	>
		<div class="scrubber-label">{title}</div>
		<div class="scrubber-select-right">
			<span class="scrubber-value">{current?.label ?? value}</span>
			<svg
				class="scrubber-caret {open ? 'scrubber-caret--open' : ''}"
				width="12"
				height="12"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<polyline points="6 9 12 15 18 9"></polyline>
			</svg>
		</div>
	</button>
	{#if open}
		<div class="scrubber-dropdown" role="listbox">
			{#each normalized as opt (opt.value)}
				<button
					type="button"
					class="scrubber-dropdown-item {opt.value === value ? 'scrubber-dropdown-item--active' : ''}"
					role="option"
					aria-selected={opt.value === value}
					onclick={() => pick(opt.value)}
				>
					{opt.label}
				</button>
			{/each}
		</div>
	{/if}
</div>
