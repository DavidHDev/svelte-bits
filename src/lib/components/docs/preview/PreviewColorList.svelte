<script lang="ts">
	import Icon from './Icon.svelte';
	import PreviewColorPickerCustom from './PreviewColorPickerCustom.svelte';

	type Props = {
		title?: string;
		colors: string[];
		onChange: (colors: string[]) => void;
		min?: number;
		max?: number;
	};

	let { title = 'Colors', colors, onChange, min = 2, max = 8 }: Props = $props();

	const FRESH = ['#40ffaa', '#4079ff', '#ffd93d', '#ff6b6b', '#06b6d4', '#f97316', '#ec4899', '#a3e635'];

	function update(index: number, value: string) {
		const next = [...colors];
		next[index] = value;
		onChange(next);
	}

	function add() {
		if (colors.length >= max) return;
		const used = colors.map((color) => color.toLowerCase());
		onChange([...colors, FRESH.find((color) => !used.includes(color)) ?? colors[colors.length - 1]]);
	}

	function remove() {
		if (colors.length > min) onChange(colors.slice(0, -1));
	}
</script>

<div class="scrubber-palette">
	<div class="scrubber-palette-head">
		<span class="scrubber-palette-label">{title}</span>
		<div class="scrubber-palette-actions">
			<button
				type="button"
				class="scrubber-palette-button"
				onclick={remove}
				disabled={colors.length <= min}
				aria-label="Remove a color"
			>
				<Icon name="Minus" size={14} />
			</button>
			<button
				type="button"
				class="scrubber-palette-button"
				onclick={add}
				disabled={colors.length >= max}
				aria-label="Add a color"
			>
				<Icon name="Plus" size={14} />
			</button>
		</div>
	</div>
	<div class="scrubber-palette-strip">
		{#each colors as color, index (index)}
			<PreviewColorPickerCustom
				variant="swatch"
				title="{title} {index + 1}"
				{color}
				onChange={(value) => update(index, value)}
			/>
		{/each}
	</div>
</div>
