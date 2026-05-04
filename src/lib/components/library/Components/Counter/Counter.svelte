<!-- @svelte-bits
{
  "title": "Counter",
  "description": "Animated rolling-digit counter with spring physics (motion).",
  "dependencies": ["motion"]
}
-->
<script module lang="ts">
	export type PlaceValue = number | '.';
</script>

<script lang="ts">
	import { motionValue, animate } from 'motion';

	type Props = {
		value: number;
		fontSize?: number;
		padding?: number;
		places?: PlaceValue[];
		gap?: number;
		borderRadius?: number;
		horizontalPadding?: number;
		textColor?: string;
		fontWeight?: string | number;
		containerStyle?: string;
		counterStyle?: string;
		digitStyle?: string;
		gradientHeight?: number;
		gradientFrom?: string;
		gradientTo?: string;
		topGradientStyle?: string;
		bottomGradientStyle?: string;
	};

	let {
		value,
		fontSize = 100,
		padding = 0,
		places,
		gap = 8,
		borderRadius = 4,
		horizontalPadding = 8,
		textColor = 'inherit',
		fontWeight = 'inherit',
		containerStyle = '',
		counterStyle = '',
		digitStyle = '',
		gradientHeight = 16,
		gradientFrom = 'black',
		gradientTo = 'transparent',
		topGradientStyle = '',
		bottomGradientStyle = ''
	}: Props = $props();

	function autoPlaces(v: number): PlaceValue[] {
		const a = [...v.toString()];
		return a.map((ch, i) => {
			if (ch === '.') return '.';
			const dotIndex = a.indexOf('.');
			const isInteger = dotIndex === -1;
			const exponent = isInteger ? a.length - i - 1 : i < dotIndex ? dotIndex - i - 1 : -(i - dotIndex);
			return 10 ** exponent;
		});
	}

	const resolvedPlaces = $derived(places ?? autoPlaces(value));
	const height = $derived(fontSize + padding);

	function normalizeNearInteger(num: number): number {
		const nearest = Math.round(num);
		const tolerance = 1e-9 * Math.max(1, Math.abs(num));
		return Math.abs(num - nearest) < tolerance ? nearest : num;
	}
	function getValueRoundedToPlace(v: number, place: number): number {
		return Math.floor(normalizeNearInteger(v / place));
	}

	// One motion value per digit slot, plus a reactive latestValues record so the
	// rendered transform updates on every motion-driven tick.
	const motionValues = new Map<number, ReturnType<typeof motionValue<number>>>();
	let latestValues = $state<Record<number, number>>({});

	function getOrCreateMV(slot: number, target: number) {
		let mv = motionValues.get(slot);
		if (!mv) {
			mv = motionValue(target);
			motionValues.set(slot, mv);
			latestValues[slot] = target;
			mv.on('change', (v) => {
				latestValues = { ...latestValues, [slot]: v };
			});
		}
		return mv;
	}

	$effect(() => {
		resolvedPlaces.forEach((place, slot) => {
			if (place === '.') return;
			const target = getValueRoundedToPlace(value, place as number);
			const mv = getOrCreateMV(slot, target);
			animate(mv, target, { type: 'spring', stiffness: 250, damping: 30 });
		});
	});

	function offsetForNumber(latest: number, number: number, h: number): number {
		const placeValue = latest % 10;
		const offset = (10 + number - placeValue) % 10;
		let memo = offset * h;
		if (offset > 5) memo -= 10 * h;
		return memo;
	}
</script>

<span style="position:relative;display:inline-block;{containerStyle}">
	<span style="font-size:{fontSize}px;display:flex;gap:{gap}px;overflow:hidden;border-radius:{borderRadius}px;padding-left:{horizontalPadding}px;padding-right:{horizontalPadding}px;line-height:1;color:{textColor};font-weight:{fontWeight};direction:ltr;{counterStyle}">
		{#each resolvedPlaces as place, slot (slot)}
			{#if place === '.'}
				<span class="relative inline-flex items-center justify-center" style="height:{height}px;width:fit-content;{digitStyle}">.</span>
			{:else}
				<span class="relative inline-flex overflow-hidden" style="height:{height}px;width:1ch;font-variant-numeric:tabular-nums;{digitStyle}">
					{#each Array.from({ length: 10 }, (_, i) => i) as n (n)}
						<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;transform:translateY({offsetForNumber(latestValues[slot] ?? getValueRoundedToPlace(value, place as number), n, height)}px);">{n}</span>
					{/each}
				</span>
			{/if}
		{/each}
	</span>
	<span style="pointer-events:none;position:absolute;inset:0;display:flex;flex-direction:column;justify-content:space-between;">
		<span style="{topGradientStyle || `height:${gradientHeight}px;background:linear-gradient(to bottom, ${gradientFrom}, ${gradientTo});`}"></span>
		<span style="{bottomGradientStyle || `height:${gradientHeight}px;background:linear-gradient(to top, ${gradientFrom}, ${gradientTo});`}"></span>
	</span>
</span>
