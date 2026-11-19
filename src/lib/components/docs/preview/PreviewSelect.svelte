<script module lang="ts">
	const LABEL_OVERRIDES: Record<string, string> = { pingpong: 'Ping Pong', rotate3d: 'Rotate 3D' };
	export const formatOptionLabel = (str: string) =>
		LABEL_OVERRIDES[str] ?? str.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
</script>

<script lang="ts">
	import { portal } from './lib/portal';

	type OptionValue = string | number | boolean;
	type Option = { value: OptionValue; label?: string };

	type Props = {
		title?: string;
		options?: (Option | OptionValue)[];
		value?: OptionValue;
		isDisabled?: boolean;
		onChange?: (v: any) => void;
	};

	let { title = '', options = [], value = '', isDisabled = false, onChange }: Props = $props();

	let open = $state(false);
	let rect = $state<DOMRect | null>(null);
	let wrapEl = $state<HTMLDivElement | null>(null);
	let dropdownEl = $state<HTMLDivElement | null>(null);
	let menuHeight = $state(0);

	const GAP = 4;
	const EDGE = 8;

	const placement = $derived.by(() => {
		if (!rect) return { top: 0, maxHeight: 0, above: false };
		const viewport = typeof window === 'undefined' ? 0 : window.innerHeight;
		const below = viewport - rect.bottom - GAP - EDGE;
		const above = rect.top - GAP - EDGE;
		const flip = menuHeight > below && above > below;
		const maxHeight = Math.max(120, flip ? above : below);
		const height = Math.min(menuHeight, maxHeight);
		return { top: flip ? rect.top - GAP - height : rect.bottom + GAP, maxHeight, above: flip };
	});

	const formattedOptions = $derived(
		options.map((opt) =>
			typeof opt === 'string'
				? { value: opt, label: formatOptionLabel(opt) }
				: typeof opt === 'object' && opt !== null
					? { ...opt, label: opt.label != null ? opt.label : formatOptionLabel(String(opt.value)) }
					: { value: opt, label: String(opt) }
		)
	);

	const currentLabel = $derived(formattedOptions.find((opt) => opt.value === value)?.label ?? String(value));

	$effect(() => {
		if (!open) return;
		const onClick = (e: PointerEvent) => {
			const target = e.target as Node;
			if (wrapEl?.contains(target) || dropdownEl?.contains(target)) return;
			open = false;
		};
		document.addEventListener('pointerdown', onClick);
		return () => document.removeEventListener('pointerdown', onClick);
	});

	$effect(() => {
		if (!open) return;
		const updatePosition = () => {
			if (wrapEl) rect = wrapEl.getBoundingClientRect();
		};
		updatePosition();
		if (dropdownEl) menuHeight = dropdownEl.scrollHeight;
		window.addEventListener('scroll', updatePosition, true);
		window.addEventListener('resize', updatePosition);
		return () => {
			window.removeEventListener('scroll', updatePosition, true);
			window.removeEventListener('resize', updatePosition);
		};
	});
</script>

<div class="scrubber" bind:this={wrapEl} style="position: relative;">
	<button
		type="button"
		class="scrubber-track scrubber-track--select"
		aria-label={title}
		aria-disabled={isDisabled}
		data-disabled={isDisabled}
		tabindex={isDisabled ? -1 : 0}
		onclick={() => !isDisabled && (open = !open)}
	>
		<span class="scrubber-label">{title}</span>
		<span class="scrubber-select-right">
			<span class="scrubber-value">{currentLabel}</span>
			<svg class="scrubber-caret" class:scrubber-caret--open={open} width="14" height="14" viewBox="0 0 16 16" fill="none">
				<path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</span>
	</button>

	{#if open && rect}
		<div
			use:portal
			bind:this={dropdownEl}
			class="scrubber-dropdown"
			style="position: fixed; top: {placement.top}px; left: {rect.left}px; right: auto; width: {rect.width}px; max-height: {placement.maxHeight}px; overflow-y: auto; transform-origin: {placement.above ? 'bottom' : 'top'} center; z-index: 9999;"
		>
			{#each formattedOptions as opt (String(opt.value))}
				<button
					type="button"
					class="scrubber-dropdown-item"
					class:scrubber-dropdown-item--active={opt.value === value}
					onclick={() => {
						onChange?.(opt.value);
						open = false;
					}}
				>
					{opt.label}
				</button>
			{/each}
		</div>
	{/if}
</div>
